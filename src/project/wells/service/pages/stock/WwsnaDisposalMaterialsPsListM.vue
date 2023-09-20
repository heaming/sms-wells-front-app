<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaDisposalMaterialsPsListM(W-SV-U-0277M01) - 매각자재관리현황
 3. 작성자 : SaeRomI.Kim
 4. 작성일 : 2023.07.18
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 관리자가 서비스작업출고를 통해 자재를 매각한 현황을 일별로 조회하는 화면 (http://localhost:3000/#/service/wwsna-disposal-materials-ps-list)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      @search="onClickSearch"
    >
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
            @change="getWareHouses"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_SV_CNR')">
          <kw-select
            v-model="searchParams.wareNo"
            :options="optionsWareNo"
            option-value="wareNo"
            option-label="wareNm"
            :label="$t('MSG_TXT_SV_CNR')"
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
          <span class="ml8">
            ({{ t('MSG_TXT_UNIT') }} : EA)
          </span>
        </template>
        <kw-btn
          v-permission:download
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

import { useDataService, getComponentType, gridUtil, defineGrid } from 'kw-lib';
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
  wareNo: '',
});

const optionsWareNo = ref();

// 창고조회
const getWareHouses = async () => {
  searchParams.value.wareNo = '';
  const { baseYm } = searchParams.value;
  if (isEmpty(baseYm)) {
    optionsWareNo.value = [];
    return;
  }

  const result = await dataService.get('/sms/wells/service/disposal-materials-state/ware-houses', { params: { baseYm } });
  optionsWareNo.value = result.data;
};

await Promise.all([
  getWareHouses(),
]);

const totalCount = ref(0);
// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/disposal-materials-state', { params: { ...cachedParams } });
  const dpMats = res.data;
  const wareNos = dpMats.map((v) => v.wareNo);
  totalCount.value = wareNos.filter((v, i) => wareNos.indexOf(v) === i).length;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(dpMats);
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/disposal-materials-state', { params: { ...cachedParams } });

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
    { fieldName: 'wareNm' },
    { fieldName: 'wareNo' },
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
    { fieldName: 'wareNm',
      header: t('MSG_TXT_SV_CNR'),
      width: '100',
      styleName: 'text-center',
      mergeRule: {
        criteria: 'value',
      },
      footers: [
        { text: t('MSG_TXT_SUM'), styleName: 'text-center' },
      ] },
    { fieldName: 'gubun',
      header: t('MSG_TXT_DIV'),
      width: '100',
      styleName: 'text-center',
      footers: [
        { text: t('MSG_TXT_KIT'), styleName: 'text-center' },
        { text: t('MSG_TXT_WTHOL_VLV'), styleName: 'text-center' },
        { text: t('MSG_TXT_WATER_COND_MAT'), styleName: 'text-center' },
        { text: t('MSG_TXT_SBSUM'), styleName: 'text-center' },
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
            return getQtyFooter('d01Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d01Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d01Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d01Qty', 'SBSUM');
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
            return getQtyFooter('d02Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d02Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d02Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d02Qty', 'SBSUM');
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
            return getQtyFooter('d03Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d03Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d03Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d03Qty', 'SBSUM');
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
            return getQtyFooter('d04Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d04Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d04Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d04Qty', 'SBSUM');
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
            return getQtyFooter('d05Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d05Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d05Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d05Qty', 'SBSUM');
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
            return getQtyFooter('d06Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d06Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d06Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d06Qty', 'SBSUM');
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
            return getQtyFooter('d07Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d07Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d07Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d07Qty', 'SBSUM');
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
            return getQtyFooter('d08Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d08Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d08Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d08Qty', 'SBSUM');
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
            return getQtyFooter('d09Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d09Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d09Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d09Qty', 'SBSUM');
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
            return getQtyFooter('d10Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d10Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d10Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d10Qty', 'SBSUM');
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
            return getQtyFooter('d11Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d11Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d11Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d11Qty', 'SBSUM');
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
            return getQtyFooter('d12Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d12Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d12Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d12Qty', 'SBSUM');
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
            return getQtyFooter('d13Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d13Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d13Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d13Qty', 'SBSUM');
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
            return getQtyFooter('d14Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d14Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d14Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d14Qty', 'SBSUM');
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
            return getQtyFooter('d15Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d15Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d15Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d15Qty', 'SBSUM');
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
            return getQtyFooter('d16Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d16Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d16Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d16Qty', 'SBSUM');
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
            return getQtyFooter('d17Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d17Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d17Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d17Qty', 'SBSUM');
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
            return getQtyFooter('d18Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d18Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d18Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d18Qty', 'SBSUM');
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
            return getQtyFooter('d19Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d19Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d19Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d19Qty', 'SBSUM');
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
            return getQtyFooter('d20Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d20Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d20Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d20Qty', 'SBSUM');
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
            return getQtyFooter('d21Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d21Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d21Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d21Qty', 'SBSUM');
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
            return getQtyFooter('d22Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d22Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d22Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d22Qty', 'SBSUM');
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
            return getQtyFooter('d23Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d23Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d23Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d23Qty', 'SBSUM');
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
            return getQtyFooter('d24Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d24Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d24Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d24Qty', 'SBSUM');
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
            return getQtyFooter('d25Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d25Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d25Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d25Qty', 'SBSUM');
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
            return getQtyFooter('d26Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d26Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d26Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d26Qty', 'SBSUM');
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
            return getQtyFooter('d27Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d27Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d27Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d27Qty', 'SBSUM');
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
            return getQtyFooter('d28Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d28Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d28Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d28Qty', 'SBSUM');
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
            return getQtyFooter('d29Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d29Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d29Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d29Qty', 'SBSUM');
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
            return getQtyFooter('d30Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d30Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d30Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d30Qty', 'SBSUM');
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
            return getQtyFooter('d31Qty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d31Qty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d31Qty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('d31Qty', 'SBSUM');
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
            return getQtyFooter('totQty', 'KIT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('totQty', 'WTHOL_VLV');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('totQty', 'WATER_COND_MAT');
          } },
        { styleName: 'text-right',
          numberFormat: '#,##0',
          valueCallback() {
            return getQtyFooter('totQty', 'SBSUM');
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
      { height: 40 },
    ],
  });

  view.setFixedOptions({
    colCount: 2,
  });

  view.checkBar.visible = false;
});
</script>
