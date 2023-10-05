<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaWasteFilterCollectionPsListM(W-SV-U-0275M01) - 폐필터 회수 현황
3. 작성자 : SaeRomI.Kim
4. 작성일 : 2023.08.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 월별 창고별 폐필터 회수현황을 조회하는 화면 (http://localhost:3000/#/service/wwsna-waste-filter-collection-ps-list)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_BASE_YM')"
            @change="onChangeBaseYm"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CENTER_DIVISION')"
        >
          <kw-select
            v-model="searchParams.hgrWareNo"
            :options="optionsHgrWareNo"
            first-option="all"
            option-value="wareNo"
            option-label="wareNm"
            @change="onChangeHgrWareHouse"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_EGER')"
        >
          <kw-select
            v-model="searchParams.wareNo"
            :options="optionsWareNo"
            first-option="all"
            option-value="wareNo"
            option-label="wareNm"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
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
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }} : EA)</span>
        </template>

        <kw-btn
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="totalCount === 0"
          icon="download_on"
          secondary
          dense
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :total-count="totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { codeUtil, useDataService, getComponentType, gridUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { currentRoute } = useRouter();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'),
  wareDvCd: '2',
  hgrWareNo: '',
  wareNo: '',
  svBizHclsfCd: '',
});

const codes = await codeUtil.getMultiCodes(
  'SV_BIZ_HCLSF_CD',
);

const filterCodes = ref({
  svBizHclsfCd: [],
});

function codeFilter() {
  filterCodes.value.svBizHclsfCd = codes.SV_BIZ_HCLSF_CD.filter((v) => ['1', '2', '3'].includes(v.codeId));
}

// 창고 조회
const optionsHgrWareNo = ref();
const optionsWareNo = ref();

const onChangeBaseYm = async () => {
  searchParams.value.hgrWareNo = '';
  searchParams.value.wareNo = '';
  const { baseYm, wareDvCd } = searchParams.value;

  if (isEmpty(baseYm)) {
    optionsHgrWareNo.value = [];
    optionsWareNo.value = [];
    return;
  }

  const result = await dataService.get(
    '/sms/wells/common/sms-wells-codes/ware-houses',
    { params: {
      startYm: baseYm,
      endYm: baseYm,
      wareDvCd,
    } },
  );

  optionsHgrWareNo.value = result.data;
};

const onChangeHgrWareHouse = async () => {
  searchParams.value.wareNo = '';
  const { baseYm, wareDvCd, hgrWareNo } = searchParams.value;

  if (isEmpty(baseYm) || isEmpty(hgrWareNo)) {
    optionsWareNo.value = [];
    return;
  }

  const result = await dataService.get(
    '/sms/wells/common/sms-wells-codes/ware-houses',
    { params: {
      startYm: baseYm,
      endYm: baseYm,
      wareDvCd,
      hgrWareNo,
    } },
  );

  optionsWareNo.value = result.data;
};

await Promise.all([
  codeFilter(),
  onChangeBaseYm(),
]);

const totalCount = ref(0);
// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/waste-filter-collections-state', { params: { ...cachedParams } });
  const filters = res.data;
  const pdCds = filters.map((v) => v.pdCd);
  totalCount.value = pdCds.filter((v, i) => pdCds.indexOf(v) === i).length;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(filters);
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/waste-filter-collections-state', { params: { ...cachedParams } });

  gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 그리드 구분별 푸터 값 가져오기
function getQtyFooter(column, gubunCd) {
  const view = grdMainRef.value.getView();
  const exportData = gridUtil.getAllRowValues(view);

  let qty = 0;
  exportData.forEach((e) => {
    if (e.gubunCd === gubunCd) {
      qty += e[column];
    }
  });
  return qty;
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'gubun' },
    { fieldName: 'gubunCd' },
    { fieldName: 'd01Qty', dataType: 'number' },
    { fieldName: 'd02Qty', dataType: 'number' },
    { fieldName: 'd03Qty', dataType: 'number' },
    { fieldName: 'd04Qty', dataType: 'number' },
    { fieldName: 'd05Qty', dataType: 'number' },
    { fieldName: 'd06Qty', dataType: 'number' },
    { fieldName: 'd07Qty', dataType: 'number' },
    { fieldName: 'd08Qty', dataType: 'number' },
    { fieldName: 'd09Qty', dataType: 'number' },
    { fieldName: 'd10Qty', dataType: 'number' },
    { fieldName: 'd11Qty', dataType: 'number' },
    { fieldName: 'd12Qty', dataType: 'number' },
    { fieldName: 'd13Qty', dataType: 'number' },
    { fieldName: 'd14Qty', dataType: 'number' },
    { fieldName: 'd15Qty', dataType: 'number' },
    { fieldName: 'd16Qty', dataType: 'number' },
    { fieldName: 'd17Qty', dataType: 'number' },
    { fieldName: 'd18Qty', dataType: 'number' },
    { fieldName: 'd19Qty', dataType: 'number' },
    { fieldName: 'd20Qty', dataType: 'number' },
    { fieldName: 'd21Qty', dataType: 'number' },
    { fieldName: 'd22Qty', dataType: 'number' },
    { fieldName: 'd23Qty', dataType: 'number' },
    { fieldName: 'd24Qty', dataType: 'number' },
    { fieldName: 'd25Qty', dataType: 'number' },
    { fieldName: 'd26Qty', dataType: 'number' },
    { fieldName: 'd27Qty', dataType: 'number' },
    { fieldName: 'd28Qty', dataType: 'number' },
    { fieldName: 'd29Qty', dataType: 'number' },
    { fieldName: 'd30Qty', dataType: 'number' },
    { fieldName: 'd31Qty', dataType: 'number' },
    { fieldName: 'totQty', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'sapMatCd',
      header: t('MSG_TXT_SAPCD'),
      width: '160',
      styleName: 'text-center',
      mergeRule: {
        criteria: 'value',
      } },
    { fieldName: 'pdCd',
      header: t('MSG_TXT_ITM_CD'),
      width: '160',
      styleName: 'text-center',
      mergeRule: {
        criteria: 'value',
      } },
    { fieldName: 'pdNm',
      header: t('MSG_TXT_ITM_NM'),
      width: '300',
      styleName: 'text-left',
      mergeRule: {
        criteria: 'value',
      },
      footers: [
        { text: t('MSG_TXT_SUM'), styleName: 'text-center' },
      ] },
    { fieldName: 'gubun',
      header: t('MSG_TXT_DIV'),
      width: '140',
      styleName: 'text-center',
      footers: [
        { text: t('MSG_TXT_WK_FSH_CT'), styleName: 'text-center' },
        { text: t('MSG_TXT_GB_FSH_CT'), styleName: 'text-center' },
        { text: t('MSG_TXT_NOT_GB_CT'), styleName: 'text-center' },
      ],
    },
    { fieldName: 'd01Qty',
      header: '01',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d01Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d01Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d01Qty', 'NOT_GB_CT');
          } },
      ],
    },
    { fieldName: 'd02Qty',
      header: '02',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d02Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d02Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d02Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd03Qty',
      header: '03',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d03Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d03Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d03Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd04Qty',
      header: '04',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d04Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d04Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d04Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd05Qty',
      header: '05',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d05Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d05Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d05Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd06Qty',
      header: '06',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d06Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d06Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d06Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd07Qty',
      header: '07',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d07Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d07Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d07Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd08Qty',
      header: '08',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d08Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d08Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d08Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd09Qty',
      header: '09',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d09Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d09Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d09Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd10Qty',
      header: '10',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d10Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d10Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d10Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd11Qty',
      header: '11',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d11Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d11Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d11Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd12Qty',
      header: '12',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d12Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d12Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d12Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd13Qty',
      header: '13',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d13Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d13Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d13Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd14Qty',
      header: '14',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d14Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d14Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d14Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd15Qty',
      header: '15',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d15Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d15Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d15Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd16Qty',
      header: '16',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d16Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d16Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d16Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd17Qty',
      header: '17',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d17Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d17Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d17Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd18Qty',
      header: '18',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d18Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d18Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d18Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd19Qty',
      header: '19',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d19Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d19Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d19Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd20Qty',
      header: '20',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d20Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d20Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d20Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd21Qty',
      header: '21',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d21Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d21Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d21Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd22Qty',
      header: '22',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d22Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d22Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d22Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd23Qty',
      header: '23',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d23Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d23Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d23Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd24Qty',
      header: '24',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d24Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d24Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d24Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd25Qty',
      header: '25',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d25Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d25Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d25Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd26Qty',
      header: '26',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d26Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d26Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d26Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd27Qty',
      header: '27',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d27Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d27Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d27Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd28Qty',
      header: '28',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d28Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d28Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d28Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd29Qty',
      header: '29',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d29Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d29Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d29Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd30Qty',
      header: '30',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d30Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d30Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d30Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'd31Qty',
      header: '31',
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d31Qty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d31Qty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d31Qty', 'NOT_GB_CT');
          } },
      ] },
    { fieldName: 'totQty',
      header: t('MSG_TXT_AGG'),
      width: '68',
      styleName: 'text-right',
      footers: [
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('totQty', 'WK_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('totQty', 'GB_FSH_CT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('totQty', 'NOT_GB_CT');
          } },
      ] },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.setFooters({
    visible: true,
    items: [
      { height: 40 },
      { height: 40 },
      { height: 40 },
    ],
  });

  view.setFixedOptions({
    colCount: 4,
  });

  view.checkBar.visible = false;
});
</script>
