<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WsnaMonthClassifiedByStockActualMgtM(W-SV-U-0139M01) - 월별 재고실사 등록 관리
 3. 작성자 : songTaeSung
 4. 작성일 : 2023.06.11
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 월별 재고실사 등록 관리 (http://localhost:3000/#/service/wsna-month-classified-by-stock-actual-mgt)
 ****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 기준년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            @change="onChangeBaseYm"
          />
        </kw-search-item>
        <!-- 창고구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_WARE_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :options="filterCodes.wareDvCd"
            @change="onChangeWareDvCd"
          />
          <kw-select
            v-model="searchParams.wareDtlDvCd"
            :options="filterCodes.wareDtlDvCd"
            first-option="all"
            @change="onChangeWareDtlDvCd"
          />
          <kw-select
            v-model="searchParams.searchWareNo"
            :options="optionsWareNo"
            option-value="wareNo"
            option-label="wareNm"
            first-option="all"
          />
        </kw-search-item>
        <!-- 상태구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_STAT_DV')"
        >
          <kw-select
            v-model="searchParams.useYn"
            :options="codes.USE_YN_ACD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>
        <!-- 저장버튼 -->
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 확인서 -->
        <kw-btn
          dense
          secondary
          label="확인서"
        />
        <!-- 신청취소 -->
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_APPL_CNCL')"
          @click="onClickApplCancel"
        />
        <!-- 실사취소 -->
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_ACINSP_CAN')"
          @click="onClickStocCancel"
        />
        <!-- 재고적용 -->
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_STOC_APY')"
          @click="onClikcStocApy"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 실사확정 -->
        <kw-btn
          primary
          dense
          :label="$t('MSG_BTN_ACINSP_CNFM')"
          @click="onClickAcinspCnfm"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
      />

      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, defineGrid, useMeta, codeUtil, useDataService, gridUtil, useGlobal, fileUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const now = dayjs();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { getConfig } = useMeta();
const { notify, confirm } = useGlobal();
const SERVICE_DV_CD = '2';
const STATUS_VAL = '실사완료';
const STATUS_FSH = '신청완료';
const STATUS_APY = '재고반영';
// const STATUS_CNFM = '실사확정';
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'), // 기준년월
  wareDvCd: '2',
  wareDtlDvCd: '',
  searchWareNo: '',
  useYn: '',
});

// const yearMonth = ref({
//   yyyy: dayjs().format('YYYY'),
//   mm: dayjs().format('MM'),

// });

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'WARE_DV_CD',
  'WARE_DTL_DV_CD',
  'USE_YN_ACD',
);

const filterCodes = ref({
  wareDvCd: [],
  wareDtlDvCd: [],
});

function wareDvCdFilter() {
  filterCodes.value.wareDvCd = codes.WARE_DV_CD.filter((v) => ['2', '3'].includes(v.codeId));
}

function wareDtlDvCdFilter() {
  filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['20', '21', '30', '31', '32'].includes(v.codeId));
}

function onChangeWareDvCd() {
  if (searchParams.value.wareDvCd === SERVICE_DV_CD) {
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['20', '21'].includes(v.codeId));
    searchParams.value.wareDtlDvCd = '';
    searchParams.value.searchWareNo = '';
  } else {
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['30', '31', '32'].includes(v.codeId));
    searchParams.value.wareDtlDvCd = '';
    searchParams.value.searchWareNo = '';
  }
}

const optionsWareNo = ref();
// 창고번호 조회
const onChangeWareHouse = async () => {
  // 창고번호 클리어
  searchParams.value.searchWareNo = '';
  const result = await dataService.get(
    '/sms/wells/service/stock-acinp-rgst/ware-houses',
    { params: {
      baseYm: searchParams.value.baseYm,
      wareDvCd: searchParams.value.wareDvCd,
      wareDtlDvCd: searchParams.value.wareDtlDvCd,
    } },
  );
  optionsWareNo.value = result.data;
};

await Promise.all([
  wareDvCdFilter(),
  wareDtlDvCdFilter(),
  onChangeWareDvCd(),
  onChangeWareHouse(),
]);

// 기준년월이 변경되었을 때 창고번호 재조회
function onChangeBaseYm() {
  const searchBaseYm = searchParams.value.baseYm;
  if (isEmpty(searchBaseYm)) {
    searchParams.value.searchWareNo = '';
    optionsWareNo.value = [];
    return;
  }
  onChangeWareHouse();
}

// 창고세부구분이 변경되었을 때 창고번호 재조회
function onChangeWareDtlDvCd() {
  onChangeWareHouse();
}

// 체크된 내역이 없을시 notify로 메세지 출력
function validateIsApplyRowExists() {
  const view = grdMainRef.value.getView();
  if (view.getCheckedItems().length === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return false;
  }
  return true;
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/stock-acinp-rgst/paging', { params: { ...cachedParams, ...pageInfo.value } });

  const { list: monthItems, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(monthItems);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickExcelDownload() {
  const res = await dataService.post('/sms/wells/service/stock-acinp-rgst/excel-download', cachedParams, { responseType: 'blob' });
  fileUtil.downloadBlob(res.data, `${currentRoute.value.meta.menuName}_${now.format('YYYYMMDD_HHmmss')}.xlsx`);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

let params;

// 저장버튼 클릭 이벤트
async function onClickSave() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (!validateIsApplyRowExists()) return;
  debugger;
  for (let i = 0; i < checkedRows.length; i += 1) {
    const { statusT, acinspRmkCn, minusQty } = checkedRows[i];

    if (statusT === STATUS_VAL) {
      // 실사완료건은 저장할 수 없습니다
      notify(t('MSG_ALT_ACINSP_FSH_SAVE_IMP'));
      return;
    }

    if (minusQty !== 0) {
      if (isEmpty(acinspRmkCn) || acinspRmkCn?.length < 5) {
        // 재고차이 발생건 사유 입력을 해야합니다.
        notify(t('MSG_ALT_STOC_GAP_OC_RSON_IN'));
        return;
      }
    }
  }
  await dataService.post('/sms/wells/service/stock-acinp-rgst', checkedRows);

  notify(t('MSG_ALT_SAVE_DATA'));

  await fetchData();
}

// 실사확정 버튼클릭 이벤트
async function onClickAcinspCnfm() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (!validateIsApplyRowExists()) return;

  if (!(await gridUtil.validate(view, { isCheckedOnly: true }))) { return; }
  for (let i = 0; i < checkedRows.length; i += 1) {
    const { statusT } = checkedRows[i];

    if (statusT === STATUS_VAL) {
      // 실사완료건은 저장할 수 없습니다
      notify(t('MSG_ALT_ACINSP_FSH_SAVE_IMP'));
      return;
    } if (statusT === STATUS_APY) {
      // 재고반영 건은 저장할 수 없습니다.
      notify(t('MSG_ALT_STOC_RFLT_CT_SAVE_IMP'));
      return;
    }
  }

  const currentMonth = searchParams.value.baseYm;
  if (await confirm(t('MSG_ALT_ACINSP_CNFM_MTR_CNFM', [currentMonth.substring(0, 4), currentMonth.substring(4, 6)]))) {
    params = searchParams.value;

    await dataService.post('/sms/wells/service/stock-acinp-rgst/acinsp-cnfm', checkedRows.map((v) => ({ ...v, ...params })));

    notify(t('MSG_ALT_SAVE_DATA'));

    await fetchData();
  }
}

// 재고적용 버튼클릭 이벤트
async function onClikcStocApy() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (!validateIsApplyRowExists()) return;

  if (!(await gridUtil.validate(view, { isCheckedOnly: true }))) { return; }

  for (let i = 0; i < checkedRows.length; i += 1) {
    const { statusT } = checkedRows[i];

    if (statusT === STATUS_VAL) {
      // 실사완료건은 저장할 수 없습니다
      notify(t('MSG_ALT_ACINSP_FSH_SAVE_IMP'));
      return;
    } if (statusT === STATUS_APY) {
      // 재고반영 건은 저장할 수 없습니다.
      notify(t('MSG_ALT_STOC_RFLT_CT_SAVE_IMP'));
      return;
    }
  }

  const currentMonth = searchParams.value.baseYm;

  if (await confirm(t('MSG_ALT_RVPY_RFLT', [currentMonth.substring(0, 4), currentMonth.substring(4, 6)]))) {
    params = searchParams.value;

    await dataService.post('/sms/wells/service/stock-acinp-rgst/stoc-apy', checkedRows.map((v) => ({ ...v, ...params })));

    notify(t('MSG_ALT_SAVE_DATA'));

    await fetchData();
  }
}

// 신청취소 버튼클릭 이벤트
async function onClickApplCancel() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (!validateIsApplyRowExists()) return;

  if (!(await gridUtil.validate(view, { isCheckedOnly: true }))) { return; }

  for (let i = 0; i < checkedRows.length; i += 1) {
    const { cnfmdt } = checkedRows[i];

    if (!isEmpty(cnfmdt)) {
      // 실사 확정 및 재고 반영 완료된 건은 취소가 불가합니다.
      notify(t('MSG_ALT_ACINSP_CNFM_STOC_RFLT_FSH_CAN_IMP'));
      return;
    }
  }

  const res = await dataService.delete('/sms/wells/service/stock-acinp-rgst', { data: checkedRows });
  const { processCount } = res.data;
  if (processCount > 0) {
    notify(t('MSG_ALT_DELETED'));
    await fetchData();
  }
}

// 실사확정취소 버튼클릭 이벤트
async function onClickStocCancel() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (!validateIsApplyRowExists()) return;

  if (!(await gridUtil.validate(view, { isCheckedOnly: true }))) { return; }

  for (let i = 0; i < checkedRows.length; i += 1) {
    const { statusT } = checkedRows[i];

    if (statusT === STATUS_APY) {
      // 재고반영 건은 저장할 수 없습니다.
      notify(t('MSG_ALT_STOC_RFLT_CT_SAVE_IMP'));
      return;
    }
    if (statusT === STATUS_FSH) {
      // 신청완료 건은 저장할 수 없습니다.
      notify(t('MSG_ALT_APLC_FSH_CT_SAVE_IMP'));
      return;
    }
  }

  const currentMonth = searchParams.value.baseYm;

  if (await confirm(t('MSG_ALT_MTR_CNFM_CAN', [currentMonth.substring(0, 4), currentMonth.substring(4, 6)]))) {
    params = searchParams.value;

    await dataService.post('/sms/wells/service/stock-acinp-rgst/stoc-cancel', checkedRows.map((v) => ({ ...v, ...params })));

    notify(t('MSG_ALT_SAVE_DATA'));

    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'statusT' },
    { fieldName: 'col2' },
    { fieldName: 'apyYm' },
    { fieldName: 'wareNo' },
    { fieldName: 'wareNm' },
    { fieldName: 'sapCd' },
    { fieldName: 'itmPdCd' },
    { fieldName: 'pdAbbrNm' },
    { fieldName: 'acinspQty', dataType: 'number' }, // 실사재고
    { fieldName: 'eotStoc', dataType: 'number' }, // 기말재고
    { fieldName: 'minusQty', dataType: 'number' }, // 재고차이
    { fieldName: 'acinspRmkCn' }, // 비고내용
    { fieldName: 'cnfmdt' }, // 확정일자
    { fieldName: 'cnfmPitmEotStocQty', dataType: 'number' }, // 확정시점기말재고수량
    { fieldName: 'cnfmPitmStrGapQty', dataType: 'number' }, // 확정시점입고차이수량
    { fieldName: 'cnfmPitmOstrGapQty', dataType: 'number' }, // 확정시점출고차이수량
    { fieldName: 'diffQty', dataType: 'number' }, // 확정차이
    { fieldName: 'iostRfdt' }, // 입출고반영일자

  ];

  const columns = [
    { fieldName: 'statusT', header: t('MSG_TXT_APLC_STAT'), width: '100', styleName: 'text-center' },
    // TODO: 확인서 관련 확인필요
    { fieldName: 'col2', header: t('MSG_TXT_CFDC'), width: '100', styleName: 'text-center' },
    { fieldName: 'wareNo', header: t('MSG_TXT_WARE_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'wareNm', header: t('MSG_TXT_BLD_NM'), width: '150' },
    { fieldName: 'sapCd', header: t('MSG_TXT_SAPCD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ITM_NM'), width: '250', footer: { text: t('MSG_TXT_SUM') } },
    { fieldName: 'eotStoc',
      header: t('MSG_TXT_EOT_STOC'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'acinspQty',
      header: t('MSG_TXT_ACINSP_STOC'),
      width: '100',
      styleName: 'text-right',
      editable: true,
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'minusQty',
      header: t('MSG_TXT_STOC_GAP'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'acinspRmkCn', header: t('MSG_TXT_NOTE'), width: '150', styleName: 'text-right', editable: true },
    { fieldName: 'cnfmdt', header: t('MSG_TXT_CNFM_DT'), width: '150', styleName: 'text-right', datetimeFormat: 'date' },
    { fieldName: 'cnfmPitmEotStocQty', header: t('MSG_TXT_CNFM_EOT'), width: '150', styleName: 'text-right' },
    { fieldName: 'diffQty', header: t('MSG_TXT_CNFM_GAP'), width: '150', styleName: 'text-right' },
    { fieldName: 'iostRfdt', header: t('MSG_TXT_RFLT_DT'), width: '150', styleName: 'text-right', datetimeFormat: 'date' },

  ];

  const columnLayout = [
    {
      column: 'statusT', footerUserSpans: [{ colspan: 1 }],
    },
    'col2',
    'wareNo',
    'wareNm',
    'sapCd',
    'itmPdCd',
    'pdAbbrNm',
    'eotStoc',
    'acinspQty',
    'minusQty',
    'acinspRmkCn',
    'cnfmdt',
    'cnfmPitmEotStocQty',
    'diffQty',
    'iostRfdt',

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.setFooters({ visible: true });
  view.setOptions({ summaryMode: 'aggregate' });

  view.onCellEdited = async (grid, itemIndex, row, field) => {
    const { acinspQty, eotStoc } = grid.getValues(itemIndex);

    const changedFieldName = grid.getDataSource().getOrgFieldName(field);

    if (changedFieldName === 'acinspQty') {
      const calcQty = Number(acinspQty) - Number(eotStoc);
      grid.setValue(itemIndex, 'minusQty', calcQty);
    }
  };

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;
});

</script>
