<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaShippingByFilterTypeListM(W-SV-U-0261M01) - 필터종류별 출고내역
3. 작성자 : SaeRomI.Kim
4. 작성일 : 2023.08.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 종류별 필터의 출고내역을 조회하고 반납여부와 수거일자를 처리 (http://localhost:3000/#/service/wwsna-shipping-by-filter-type-list)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 방문일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_VST_DT')"
          :colspan="2"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.strtDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_VST_DT')"
            rules="required"
            @update:from="onChangeVstDt"
            @update:to="onChangeVstDt"
          />
        </kw-search-item>
        <!-- 반납여부 -->
        <kw-search-item
          :label="`${t('MSG_TXT_GB')}${t('MSG_TXT_YN')}`"
        >
          <kw-select
            v-model="searchParams.gbYn"
            :options="codes.GB_YN"
            first-option="all"
          />
        </kw-search-item>
        <!-- 업무유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_TASK_TYPE')"
        >
          <kw-select
            v-model="searchParams.svBizHclsfCd"
            :options="filterCodes.svBizHclsfCd"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 서비스센터 -->
        <kw-search-item
          :label="$t('MSG_TXT_SV_CNR')"
        >
          <kw-select
            v-model="searchParams.hgrWareNo"
            :options="optionsHgrWareNo"
            first-option="all"
            option-value="wareNo"
            option-label="wareNm"
            @change="onChangeHgrWareHouse"
          />
          <kw-select
            v-model="searchParams.wareNo"
            :options="optionsWareNo"
            first-option="all"
            option-value="wareNo"
            option-label="wareNm"
          />
        </kw-search-item>
        <!-- 필터종류 -->
        <kw-search-item
          :label="`${t('MSG_TXT_FLTR')}${t('MSG_TXT_VALUE_SORT')}`"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmGrCd"
            :options="codes.PD_GRP_CD"
            class="w150"
            first-option="all"
            @change="onChangeItmGrCd"
          />
          <kw-select
            v-model="searchParams.itmPdCd"
            :options="optionsItmPdCd"
            option-value="pdCd"
            option-label="pdNm"
            first-option="all"
          />
        </kw-search-item>
        <!-- 수거일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_TKY_DT')"
        >
          <kw-date-picker
            v-model="searchParams.ostrConfDt"
            type="date"
            :placeholder="$t('MSG_TXT_SELT')"
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
        <!-- 저장 -->
        <kw-btn
          v-permission:update
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          :disable="pageInfo.totalCount === 0"
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
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          icon="download_on"
          secondary
          dense
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-select
          v-model="bulkParams.gbYn"
          :options="codes.GB_YN"
          first-option="select"
          class="w130"
          :disable="pageInfo.totalCount === 0"
          dense
        />
        <!-- 반납여부 일괄변경 -->
        <kw-btn
          dense
          secondary
          :label="`${t('MSG_TXT_GB')}${t('MSG_TXT_YN')} ${t('MSG_TXT_BLK_CH')}`"
          :disable="pageInfo.totalCount === 0"
          @click="onClickBulkGbYn"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-date-picker
          v-model="bulkParams.ostrConfDt"
          dense
          class="w130"
          type="date"
          :placeholder="$t('MSG_TXT_SELT')"
          :disable="pageInfo.totalCount === 0"
        />
        <!-- 수거일자 일괄변경 -->
        <kw-btn
          secondary
          dense
          :label="`${t('MSG_TXT_TKY_DT')} ${t('MSG_TXT_BLK_CH')}`"
          :disable="pageInfo.totalCount === 0"
          @click="onClickBulkOstrConfDt"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 라벨출력 -->
        <kw-btn
          v-permission:print
          dense
          primary
          :label="$t('MSG_BTN_LBL_PRNT')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickLabelPrint"
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

import { codeUtil, useMeta, useGlobal, useDataService, getComponentType, gridUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty, cloneDeep } from 'lodash-es';
import { openReportPopup } from '~common/utils/cmPopupUtil';

const { t } = useI18n();
const { getConfig } = useMeta();
const { notify, alert } = useGlobal();
const { currentRoute } = useRouter();
const router = useRouter();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  strtDt: dayjs().format('YYYYMMDD'),
  endDt: dayjs().format('YYYYMMDD'),
  wareDvCd: '2',
  hgrWareNo: '',
  wareNo: '',
  gbYn: '',
  svBizHclsfCd: '',
  itmGrCd: '',
  itmPdCd: '',
  ostrConfDt: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const bulkParams = ref({
  gbYn: '',
  ostrConfDt: '',
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'GB_YN',
  'SV_BIZ_HCLSF_CD',
  'PD_GRP_CD',
);

const filterCodes = ref({
  svBizHclsfCd: [],
});

// 업무유형 필터링
function codeFilter() {
  filterCodes.value.svBizHclsfCd = codes.SV_BIZ_HCLSF_CD.filter((v) => ['1', '2', '3'].includes(v.codeId));
}

const optionsHgrWareNo = ref();
const optionsWareNo = ref();

// 방문일자 변경 시 창고 조회
const onChangeVstDt = async () => {
  searchParams.value.hgrWareNo = '';
  searchParams.value.wareNo = '';
  const { strtDt, endDt, wareDvCd } = searchParams.value;

  if (isEmpty(strtDt) || isEmpty(endDt)) {
    optionsHgrWareNo.value = [];
    optionsWareNo.value = [];
    return;
  }

  // 창고 조회
  const result = await dataService.get(
    '/sms/wells/common/sms-wells-codes/ware-houses',
    { params: {
      startYm: strtDt.substring(0, 6),
      endYm: endDt.substring(0, 6),
      wareDvCd,
    } },
  );

  optionsHgrWareNo.value = result.data;
};

// 상위창고 변경 시
const onChangeHgrWareHouse = async () => {
  searchParams.value.wareNo = '';
  const { strtDt, endDt, wareDvCd, hgrWareNo } = searchParams.value;

  if (isEmpty(strtDt) || isEmpty(endDt) || isEmpty(hgrWareNo)) {
    optionsWareNo.value = [];
    return;
  }

  const result = await dataService.get(
    '/sms/wells/common/sms-wells-codes/ware-houses',
    { params: {
      startYm: strtDt.substring(0, 6),
      endYm: endDt.substring(0, 6),
      wareDvCd,
      hgrWareNo,
    } },
  );

  optionsWareNo.value = result.data;
};

const optionsItmPdCd = ref();
const optionsAllItmPdCd = ref();

// 품목조회
const getProducts = async () => {
  const result = await dataService.get('/sms/wells/service/shipping-by-filter-types/products');
  const pdCds = result.data.map((v) => v.pdCd);
  optionsItmPdCd.value = result.data.filter((v, i) => pdCds.indexOf(v.pdCd) === i);
  optionsAllItmPdCd.value = result.data;
};

// 품목그룹 변경 시 품목 필터링
function onChangeItmGrCd() {
  // 품목코드 클리어
  searchParams.value.itmPdCd = '';
  const { itmGrCd } = searchParams.value;

  if (isEmpty(itmGrCd)) {
    const pdCds = optionsAllItmPdCd.value.map((v) => v.pdCd);
    optionsItmPdCd.value = optionsAllItmPdCd.value.filter((v, i) => pdCds.indexOf(v.pdCd) === i);
    return;
  }

  optionsItmPdCd.value = optionsAllItmPdCd.value.filter((v) => itmGrCd === v.itmGrCd);
}

await Promise.all([
  codeFilter(),
  onChangeVstDt(),
  getProducts(),
]);

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/shipping-by-filter-types/paging', { params: { ...cachedParams, ...pageInfo.value } });

  const { list: itms, pageInfo: pagingResult } = res.data;
  // fetch시에는 총 건수 조회하지 않도록 변경
  pagingResult.needTotalCount = false;
  pageInfo.value = pagingResult;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(itms);
    view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  }
}

// 조회버튼 클릭
async function onClickSearch() {
  const { strtDt, endDt } = searchParams.value;
  if (isEmpty(strtDt) || isEmpty(endDt)) {
    await alert(`${t('MSG_TXT_VST_DT')}${t('MSG_ALT_NCSR_CD')}`);
    return;
  }

  pageInfo.value.pageIndex = 1;
  // 조회버튼 클릭 시에만 총 건수 조회하도록
  pageInfo.value.needTotalCount = true;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/shipping-by-filter-types/excel-download', { params: cachedParams });

  gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 저장
async function callSave(saveRows, msgId) {
  if (!isEmpty(saveRows)) {
    const res = await dataService.put('/sms/wells/service/shipping-by-filter-types', saveRows);
    const { processCount } = res.data;
    if (processCount > 0) {
      notify(t(msgId));
      pageInfo.value.needTotalCount = true;
      await fetchData();
    }
  }
}

// 저장버튼 클릭
async function onClickSave() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (isEmpty(checkedRows)) {
    // 선택된 데이터가 없습니다.
    notify(t('MSG_ALT_NO_CHECK_DATA'));
    return;
  }
  if (!await gridUtil.validate(view, { isCheckedOnly: true })) { return; }

  await callSave(checkedRows, 'MSG_ALT_SAVE_DATA');
}

// 반납여부 일괄변경
async function onClickBulkGbYn() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (isEmpty(checkedRows)) {
    // 일괄변경할 데이터를 선택하세요.
    notify(t('MSG_ALT_CHG_HLDY_DATA'));
    return;
  }

  // 반납여부
  const { gbYn } = bulkParams.value;

  if (isEmpty(gbYn)) {
    // {0}(을)를 선택해주세요.
    await alert(`${t('MSG_TXT_GB')}${t('MSG_TXT_YN')}${t('MSG_TXT_BEFORE_SELECT_IT')}`);
    return;
  }

  for (let i = 0; i < checkedRows.length; i += 1) {
    view.setValue(checkedRows[i].dataRow, 'stkrPrntYn', gbYn);
  }

  // 항목이 일괄변경 되었습니다.
  notify(t('MSG_ALT_ATC_BLK_CH_FSH'));
}

// 수거일자 일괄변경
async function onClickBulkOstrConfDt() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (isEmpty(checkedRows)) {
    // 일괄변경할 데이터를 선택하세요.
    notify(t('MSG_ALT_CHG_HLDY_DATA'));
    return;
  }

  // 수거일자
  const { ostrConfDt } = bulkParams.value;

  for (let i = 0; i < checkedRows.length; i += 1) {
    view.setValue(checkedRows[i].dataRow, 'ostrConfDt', ostrConfDt);
  }

  // 항목이 일괄변경 되었습니다.
  notify(t('MSG_ALT_ATC_BLK_CH_FSH'));
}

const ozParam = ref({
  height: 1100,
  width: 1200,
});

// 라벨출력
async function onClickLabelPrint() {
  const { width, height } = ozParam.value;
  const { strtDt, endDt, wareDvCd, gbYn, hgrWareNo, wareNo, itmPdCd, itmGrCd } = cachedParams;

  await openReportPopup(
    '/kyowon_as/asFilterLabel.ozr',
    '/kyowon_as/asFilterLabel.odi',
    JSON.stringify({
      VST_SDT: strtDt,
      VST_EDT: endDt,
      WARE_DV_CD: wareDvCd,
      GB_YN: gbYn,
      HGR_WARE_NO: hgrWareNo,
      WARE_NO: wareNo,
      ITM_PD_CD: itmPdCd,
      ITM_GR_CD: itmGrCd,
    }),
    { width, height },
  );
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cstSvAsnNo' }, // 고객서비스배정번호
    { fieldName: 'wkOstrSn' }, // 작업출고순번
    { fieldName: 'ogNm' }, // 소속
    { fieldName: 'prtnrNo' }, // 사번
    { fieldName: 'prtnrKnm' }, // 성명
    { fieldName: 'stkrPrntYn' }, // 반납여부
    { fieldName: 'rmkCn' }, // 특이사항
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약순번
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'basePdNm' }, // 상품명
    { fieldName: 'ostrConfDt' }, // 수거일자
    { fieldName: 'fnlVstFshDt' }, // 방문일자
    { fieldName: 'itmPdCd' }, // 품목코드
    { fieldName: 'itmPdNm' }, // 품목명
    { fieldName: 'sellTpNm' }, // 고객유형
    { fieldName: 'svBizHclsfNm' }, // 업무유형
    { fieldName: 'svBizDclsfNm' }, // 유형상세
    { fieldName: 'refriDvNm' }, // 유무상
    { fieldName: 'adrZip' }, // 우편번호
    { fieldName: 'cstAdr' }, // 고객주소
  ];

  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '150', styleName: 'text-left' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'stkrPrntYn',
      header: `${t('MSG_TXT_GB')}${t('MSG_TXT_YN')}`,
      width: '100',
      styleName: 'text-center',
      options: codes.GB_YN,
      editor: { type: 'dropdown' } },
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_UNUITM'),
      width: '200',
      styleName: 'text-left',
      rules: 'max:4000',
      editor: {
        type: 'text',
        editable: true } },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: false },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'basePdNm', header: t('MSG_TXT_PRDT_NM'), width: '250', styleName: 'text-left' },
    { fieldName: 'ostrConfDt',
      header: t('MSG_TXT_TKY_DT'),
      width: '150',
      styleName: 'text-center',
      datetimeFormat: 'date',
      editor: {
        type: 'btdate',
      } },
    { fieldName: 'fnlVstFshDt', header: t('MSG_TXT_VST_DT'), width: '149', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '130', styleName: 'text-center' },
    { fieldName: 'itmPdNm', header: `${t('MSG_TXT_FLTR')}${t('MSG_TXT_VALUE_SORT')}`, width: '250', styleName: 'text-left' },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_CST_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'svBizHclsfNm', header: t('MSG_TXT_TASK_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'svBizDclsfNm', header: `${t('MSG_TXT_TYPE')}${t('MSG_TXT_DTL')}`, width: '100', styleName: 'text-left' },
    { fieldName: 'refriDvNm', header: t('MSG_TXT_RECAP_OR_FREE'), width: '100', styleName: 'text-center' },
    { fieldName: 'adrZip', header: t('MSG_TXT_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'cstAdr', header: t('MSG_TXT_CST_ADR'), width: '200', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEditable = (grid, index) => {
    // 반납여부, 특이사항, 수거일자만 수정가능
    if (['stkrPrntYn', 'rmkCn', 'ostrConfDt'].includes(index.column)) {
      return true;
    }
    return false;
  };

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'cntrDtlNo') {
      const cntrNo = g.getValue(itemIndex, 'cntrNo');
      const cntrSn = g.getValue(itemIndex, 'cntrSn');

      // 개인별서비스현황 연결
      router.push({
        path: '/service/wwsnb-individual-service-list',
        query: {
          cntrNo,
          cntrSn,
        },
      });
    }
  };
});

</script>
