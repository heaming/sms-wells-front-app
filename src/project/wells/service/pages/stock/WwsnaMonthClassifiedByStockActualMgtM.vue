<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaMonthClassifiedByStockActualMgtM(W-SV-U-0139M01) - 월별 재고실사 등록 관리
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
          />
        </kw-search-item>
        <!-- 창고구분 -->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.baseYm"
          v-model:end-ym="searchParams.baseYm"
          v-model:options-ware-dv-cd="wareDvCd"
          v-model:ware-dv-cd="searchParams.wareDvCd"
          v-model:ware-no-m="searchParams.hgrWareNo"
          v-model:ware-no-d="searchParams.searchWareNo"
          sub-first-option="all"
          :colspan="2"
          :label1="$t('MSG_TXT_WARE_DV')"
          :label2="$t('MSG_TXT_WARE_DV')"
          :label3="$t('MSG_TXT_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          @update:ware-dv-cd="onChangeWareDvCd"
          @update:ware-no-m="onChagneHgrWareNo"
          @update:ware-no-d="onChagneWareNo"
        />
        <!-- 창고상세구분 -->
        <kw-search-item :label="$t('MSG_TXT_WARE_DTL_DV')">
          <kw-select
            v-model="searchParams.wareDtlDvCd"
            :options="filterCodes.wareDtlDvCd"
            first-option="all"
            @change="onChangeWareDtlDvCd"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
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
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }} : EA)</span>
        </template>
        <!-- 저장버튼 -->
        <kw-btn
          v-permission:update
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
          v-permission:download
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
          v-permission:update
          dense
          secondary
          :label="$t('MSG_BTN_APPL_CNCL')"
          @click="onClickApplCancel"
        />
        <!-- 실사취소 -->
        <kw-btn
          v-permission:update
          dense
          secondary
          :label="$t('MSG_BTN_ACINSP_CAN')"
          @click="onClickStocCancel"
        />
        <!-- 재고적용 -->
        <kw-btn
          v-permission:update
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
          v-permission:update
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
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const now = dayjs();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { getConfig } = useMeta();
const { notify, confirm } = useGlobal();
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
  hgrWareNo: '',
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
  'WARE_DTL_DV_CD',
  'USE_YN_ACD',
);

const wareDvCd = { WARE_DV_CD: [
  { codeId: '2', codeName: t('MSG_TXT_SV_CNR') },
  { codeId: '3', codeName: t('MSG_TXT_BSNS_CNTR') },
] };

const filterCodes = ref({
  wareDtlDvCd: [],
});

// 창고세부구분코드 필터링
function wareDtlDvCdFilter() {
  const { wareDvCd: searchWareDvCd } = searchParams.value;
  filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => v.codeId.startsWith(searchWareDvCd));
}

// 창고구분 변경 시
function onChangeWareDvCd() {
  searchParams.value.hgrWareNo = '';
  searchParams.value.searchWareNo = '';
  // 창고상세구분 필터링
  wareDtlDvCdFilter();
}

// 상위창고 변경 시
function onChagneHgrWareNo() {
  searchParams.value.searchWareNo = '';
}

// 창고 변경시
function onChagneWareNo() {
  const { wareDtlDvCd, searchWareNo } = searchParams.value;

  // 창고번호가 있고, 창고상세구분이 조직창고인 경우 창고상세구분 클리어
  if (!isEmpty(searchWareNo) && (wareDtlDvCd === '20' || wareDtlDvCd === '30')) {
    searchParams.value.wareDtlDvCd = '';
  }
}

// 창고상세구분 변경시
function onChangeWareDtlDvCd() {
  const { wareDtlDvCd } = searchParams.value;

  // 창고상세구분이 조직창고인 경우 개인창고번호 클리어
  if (wareDtlDvCd === '20' || wareDtlDvCd === '30') {
    searchParams.value.searchWareNo = '';
  }
}

await Promise.all([
  wareDtlDvCdFilter(),
]);

// 체크된 내역이 없을시 notify로 메세지 출력
function validateIsApplyRowExists() {
  const view = grdMainRef.value.getView();
  if (view.getCheckedItems().length === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return false;
  }
  return true;
}

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/stock-acinp-rgst/paging', { params: { ...cachedParams, ...pageInfo.value } });

  const { list: monthItems, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(monthItems);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const res = await dataService.post('/sms/wells/service/stock-acinp-rgst/excel-download', cachedParams, { responseType: 'blob' });
  fileUtil.downloadBlob(res.data, `${currentRoute.value.meta.menuName}_${now.format('YYYYMMDD_HHmmss')}.xlsx`);
}

// 조회버튼 클릭이벤트
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

let params;

// 저장버튼 클릭 이벤트
async function onClickSave() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (!validateIsApplyRowExists()) return;

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
    { fieldName: 'statusT' }, // 상태값
    { fieldName: 'col2' }, // 확인서관련컬럼
    { fieldName: 'apyYm' }, // 적용년월
    { fieldName: 'wareNo' }, // 창고번호
    { fieldName: 'wareNm' }, // 창고명
    { fieldName: 'sapCd' }, // SAP코드
    { fieldName: 'itmPdCd' }, // 품목상품코드
    { fieldName: 'pdAbbrNm' }, // 품목상품명
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
    { fieldName: 'wareNm', header: t('MSG_TXT_WARE_NM'), width: '150' },
    { fieldName: 'sapCd', header: t('MSG_TXT_SAPCD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ITM_NM'), width: '250', footer: { text: t('MSG_TXT_SUM') } },
    { fieldName: 'eotStoc',
      header: t('MSG_TXT_EOT_STOC'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
    },
    { fieldName: 'acinspQty',
      header: t('MSG_TXT_ACINSP_STOC'),
      width: '100',
      styleName: 'text-right',
      editable: true,
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      },
      editor: { type: 'number', positiveOnly: true },
    },
    { fieldName: 'minusQty',
      header: t('MSG_TXT_STOC_GAP'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'acinspRmkCn',
      header: t('MSG_TXT_NOTE'),
      width: '150',
      styleName: 'text-right',
      editable: true,
      editor: {
        maxLength: 4000 },
    },
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
