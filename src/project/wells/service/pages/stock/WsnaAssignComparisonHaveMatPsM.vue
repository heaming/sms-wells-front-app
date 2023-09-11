<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC
 2. 프로그램 ID : [K-W-SV-U-0301M01] WsnaAssignComparisonHaveMatPsM - 배정건 대비 보유자재 현황
 3. 작성자 : gs.piit231
 4. 작성일 : 2023.09.08
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
  -
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈','depth1', 'depth2', '배정건 대비 보유자재 현황']" />
    </template>

    <kw-search
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 조회기간 -->
        <kw-search-item :label="t('MSG_TXT_LOOKUP_PERIOD')">
          <kw-date-range-picker
            v-model:from="searchParams.strtDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_LOOKUP_PERIOD')"
            rules="required"
          />
        </kw-search-item>

        <!-- 창고(개인) -->
        <!-- <kw-search-item :label="$t('MSG_TXT_WARE') + '(' + $t('MSG_TXT_INDV') + ')'">
          <kw-select
            :model-value="[]"
            :options="['전체', 'B', 'C', 'D']"
          />
          <kw-input />
        </kw-search-item> -->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.strtDt"
          v-model:end-ym="searchParams.endDt"
          v-model:options-ware-dv-cd="wareDvCd"
          v-model:ware-dv-cd="searchParams.wareDvCd"
          v-model:ware-no-m="searchParams.wareNoM"
          v-model:ware-no-d="searchParams.wareNoD"
          sub-first-option="all"
          :label1="$t('MSG_TXT_OSTR_PTRM')"
          :label2="$t('MSG_TXT_WARE')"
          :label3="$t('MSG_TXT_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          @update:ware-dv-cd="onChangeStdWareDvCd"
          @update:ware-no-m="onChagneHgrWareNo"
        />
      </kw-search-row>
      <kw-search-row>
        <!-- 품목구분 -->
        <kw-search-item :label="t('MSG_TXT_ITM_DV')">
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            @change="onChangePdGrpCd"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="selectedProductByPdGrpCd"
            first-option="all"
          />
        </kw-search-item>
        <!-- 품목코드 -->
        <kw-search-item :label="$t('TXT_MSG_AS_ITM_CD')">
          <kw-input
            v-model.trim="searchParams.sapItemCdFrom"
            class="mr8"
            mask="#####-######"
            :rules="sapItemCdFromValidation"
            clearable
          />
          <span>~</span>
          <kw-input
            v-model.trim="searchParams.sapItemCdTo"
            mask="#####-######"
            :rules="sapItemCdToValidation"
            clearable
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- sap코드 -->
        <kw-search-item :label="$t('MSG_TXT_SAP_CD')">
          <kw-input
            v-model="searchParams.strtSapCd"
            :label="$t('MSG_TXT_STRT_SAP_CD')"
            rules="numeric|max:18"
            @change="onChangeStrtSapCd"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.endSapCd"
            :label="$t('MSG_TXT_END_SAP_CD')"
            rules="numeric|max:18"
            @change="onChangeEndSapCd"
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
          <span class="ml8">(단위:원)</span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          secondary
          dense
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
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
import { codeUtil, getComponentType, useDataService, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';

const { t } = useI18n();
// const { currentRoute } = useRouter();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

/* 공통코드 */
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GRP_CD',
  'WARE_DV_CD',
);
console.log('codes.COD_PAGE_SIZE_OPTIONS >>>', codes.COD_PAGE_SIZE_OPTIONS);
console.log('codes.PD_GRP_CD >>>', codes.PD_GRP_CD);

const searchParams = ref({
  strtDt: dayjs().startOf('month').format('YYYYMMDD'),
  endDt: dayjs().format('YYYYMMDD'),
  pdGrpCd: '',
  pdCd: '',
  sapItemCdFrom: '',
  sapItemCdTo: '',
  strtSapCd: '',
  endSapCd: '',
  wareDvCd: '2',
  wareNoM: '',
  wareNoD: '',
});

const wareDvCd = { WARE_DV_CD: [
  { codeId: '1', codeName: '물류센터' },
  { codeId: '2', codeName: '서비스센터' },
  { codeId: '3', codeName: '영업센터' },
] };

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
});

let cachedParams;

function onChangeStdWareDvCd() {
  searchParams.value.wareNoM = '';
  searchParams.value.wareNoD = '';
}

function onChagneHgrWareNo() {
  searchParams.value.wareNoD = '';
}

// Select Component 초기화 - 전체 상품 목록 가져오기
const products = ref([]);
const selectedProductByPdGrpCd = ref([]);

async function getProductList() {
  const response = await dataService.get('/sms/wells/service/product-list/by-itmkndcd', { params: { itmKndCd: searchParams.value.itmKndCd } });
  products.value = response.data;
  console.log('getProductList products.value >>>', products.value);
}

onMounted(async () => {
  await getProductList();
  selectedProductByPdGrpCd.value = cloneDeep(products.value);
  selectedProductByPdGrpCd.value = selectedProductByPdGrpCd.value.map((v) => ({ codeId: v.codeId, codeName: `${v.codeId} - ${v.codeName}` }));
});

const onChangePdGrpCd = (val) => {
  console.log('onChangePdGrpCd val >>>', val);
  if (val.length < 1) {
    selectedProductByPdGrpCd.value = cloneDeep(products.value);
  } else {
    selectedProductByPdGrpCd.value = products.value.filter((v) => v.pdGrpCd === val);
  }
};

function onChangeStrtSapCd() {
  const { strtSapCd, endSapCd } = searchParams.value;

  if (!isEmpty(strtSapCd) && !isEmpty(endSapCd) && strtSapCd > endSapCd) {
    searchParams.value.strtSapCd = strtSapCd;
    searchParams.value.endSapCd = strtSapCd;
  }
}

async function fetchData() {
  console.log('fetchData START');
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/wells/service/assign-cpr-hv-mat-ps/paging', { params: { ...cachedParams, ...pageInfo.value } });
  console.log('fetchData res.data >>>', res.data);
  const { list, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

async function onClickSearch() {
  await fetchData();
}

/** ==============================
 * 서비스 급지 현황 엑셀 다운로드
**============================== */
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/service/assign-cpr-hv-mat-ps/excel-download', { params: cachedParams });

  // await gridUtil.exportView(view, {
  //   fileName: currentRoute.value.meta.menuName,
  //   timePostfix: true,
  //   exportData: response.data,
  //   checkBar: 'hidden',
  // });
  await gridUtil.exportView(view, {
    fileName: '배정건 대비 보유자재 현황',
    timePostfix: true,
    exportData: response.data,
    checkBar: 'hidden',
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'apyYm' },
    { fieldName: 'wareNo' },
    { fieldName: 'wareDvCd' },
    { fieldName: 'wareDtlDvCd' },
    { fieldName: 'wareLocaraCd' },
    { fieldName: 'wareLocaraSn' },
    { fieldName: 'hgrWareNo' },
  ];

  const columns = [
    { fieldName: 'apyYm', header: '품목구분', width: '120', styleName: 'text-left' },
    { fieldName: 'wareNo', header: 'SAP코드', width: '140', styleName: 'text-center' },
    { fieldName: 'wareDvCd', header: '품목코드', width: '250', styleName: 'text-center' },
    { fieldName: 'wareDtlDvCd', header: '품목명', width: '100', styleName: 'text-left' },
    { fieldName: 'wareLocaraCd', header: '영업센터명', width: '100', styleName: 'text-left' },
    { fieldName: 'wareLocaraSn', header: '자재실 재고', width: '100', styleName: 'text-right' },
    { fieldName: 'hgrWareNo', header: '소속코드', width: '100', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  // view.setColumnLayout([
  //   'col1', 'col2', 'col3', 'col4', 'col5', 'col6',
  //   {
  //     header: '창고정보', // colspan title
  //     direction: 'horizontal', // merge type
  //     items: ['col7', 'col8', 'col9', 'col10'],
  //   },
  //   {
  //     header: '개인창고 재고', // colspan title
  //     direction: 'horizontal', // merge type
  //     items: ['col11'],
  //   },
  // ]);

  // data.setRows([
  // eslint-disable-next-line max-len
  //   { col1: '-', col2: '-', col3: '-', col4: '-', col5: '-', col6: '-', col7: '-', col8: '-', col9: '-', col10: '-', col11: '-' },
  // eslint-disable-next-line max-len
  //   { col1: '-', col2: '-', col3: '-', col4: '-', col5: '-', col6: '-', col7: '-', col8: '-', col9: '-', col10: '-', col11: '-' },
  // eslint-disable-next-line max-len
  //   { col1: '-', col2: '-', col3: '-', col4: '-', col5: '-', col6: '-', col7: '-', col8: '-', col9: '-', col10: '-', col11: '-' },
  // eslint-disable-next-line max-len
  //   { col1: '-', col2: '-', col3: '-', col4: '-', col5: '-', col6: '-', col7: '-', col8: '-', col9: '-', col10: '-', col11: '-' },
  // eslint-disable-next-line max-len
  //   { col1: '-', col2: '-', col3: '-', col4: '-', col5: '-', col6: '-', col7: '-', col8: '-', col9: '-', col10: '-', col11: '-' },
  // eslint-disable-next-line max-len
  //   { col1: '-', col2: '-', col3: '-', col4: '-', col5: '-', col6: '-', col7: '-', col8: '-', col9: '-', col10: '-', col11: '-' },
  // eslint-disable-next-line max-len
  //   { col1: '-', col2: '-', col3: '-', col4: '-', col5: '-', col6: '-', col7: '-', col8: '-', col9: '-', col10: '-', col11: '-' },
  // eslint-disable-next-line max-len
  //   { col1: '-', col2: '-', col3: '-', col4: '-', col5: '-', col6: '-', col7: '-', col8: '-', col9: '-', col10: '-', col11: '-' },
  // eslint-disable-next-line max-len
  //   { col1: '-', col2: '-', col3: '-', col4: '-', col5: '-', col6: '-', col7: '-', col8: '-', col9: '-', col10: '-', col11: '-' },
  // eslint-disable-next-line max-len
  //   { col1: '-', col2: '-', col3: '-', col4: '-', col5: '-', col6: '-', col7: '-', col8: '-', col9: '-', col10: '-', col11: '-' },
  // ]);
}

</script>

<style scoped>
</style>
