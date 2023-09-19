<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC
 2. 프로그램 ID : [K-W-SV-U-0301M01] WwsnaAssignComparisonHaveMatPsM - 배정건 대비 보유자재 현황
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
            :rules="schDataValidation"
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
            v-model="searchParams.itmKndCd"
            :options="itmKndCdList"
            first-option="all"
            @change="onChangeItmKndCd"
          />
          <kw-select
            v-model="searchParams.itmPdCds"
            :options="optionsItmPdCd"
            :label="$t('MSG_TXT_ITM_DV')"
            option-value="pdCd"
            option-label="pdNm"
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
          <!-- (단위:원) -->
          <span class="ml8">({{ t('MSG_TXT_UNIT') }}: {{ t('MSG_TXT_CUR_WON') }})</span>
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
import { codeUtil, getComponentType, useDataService, gridUtil, validate } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';

const { t } = useI18n();
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
  'ITM_KND_CD', // 품목코드
);
console.log('codes.COD_PAGE_SIZE_OPTIONS >>>', codes.COD_PAGE_SIZE_OPTIONS);
console.log('codes.PD_GRP_CD >>>', codes.PD_GRP_CD);
console.log('codes.ITM_KND_CD >>>', codes.ITM_KND_CD);

// 품목코드
const itmKndCdList = codes.ITM_KND_CD.filter((v) => ['5', '6'].includes(v.codeId));

const optionsItmPdCd = ref();
const optionsAllItmPdCd = ref();

const searchParams = ref({
  strtDt: dayjs().startOf('month').format('YYYYMMDD'),
  endDt: dayjs().format('YYYYMMDD'),
  sapItemCdFrom: '',
  sapItemCdTo: '',
  strtSapCd: '',
  endSapCd: '',
  wareDvCd: '2',
  wareNoM: '',
  wareNoD: '',
  itmKndCd: '',
  itmPdCds: '',
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

// const itmKndCdList = ref([]);
// eslint-disable-next-line max-len
// itmKndCdList.value = (await dataService.get('/sms/wells/service/bs-regular-shipping/products', { params: searchParams.value })).data;
// console.log('itmKndCdList.value >>>', itmKndCdList.value);

function onChangeStdWareDvCd() {
  searchParams.value.wareNoM = '';
  searchParams.value.wareNoD = '';
}

function onChagneHgrWareNo() {
  searchParams.value.wareNoD = '';
}

// 품목조회
const getProductList = async () => {
  const result = await dataService.get('/sms/wells/service/independence-ware-ostrs/products');
  optionsItmPdCd.value = result.data;
  optionsAllItmPdCd.value = result.data;
};

await getProductList();

console.log('optionsItmPdCd.value >>>', optionsItmPdCd.value);
console.log('optionsAllItmPdCd.value >>>', optionsAllItmPdCd.value);

async function onChangeItmKndCd() {
  // 품목코드 클리어
  searchParams.value.itmPdCds = [];
  const { itmKndCd } = searchParams.value;

  if (isEmpty(itmKndCd)) {
    optionsItmPdCd.value = optionsAllItmPdCd.value;
    return;
  }
  console.log('itmKndCd >>>', itmKndCd);
  optionsItmPdCd.value = optionsAllItmPdCd.value.filter((v) => itmKndCd === v.itmKndCd);
}

// onMounted(async () => {
//   await getProductList();
// });

function onChangeStrtSapCd() {
  const { strtSapCd, endSapCd } = searchParams.value;

  if (!isEmpty(strtSapCd) && !isEmpty(endSapCd) && strtSapCd > endSapCd) {
    searchParams.value.strtSapCd = strtSapCd;
    searchParams.value.endSapCd = strtSapCd;
  }
}

function onChangeEndSapCd() {
  const { strtSapCd, endSapCd } = searchParams.value;

  if (!isEmpty(strtSapCd) && !isEmpty(endSapCd) && strtSapCd > endSapCd) {
    searchParams.value.strtSapCd = endSapCd;
    searchParams.value.endSapCd = endSapCd;
  }
}

async function fetchData() {
  console.log('fetchData START');
  const res = await dataService.get('/sms/wells/service/assign-cpr-hv-mat-ps/paging', { params: { ...cachedParams, ...pageInfo.value } });
  console.log('fetchData res.data >>>', res.data);
  const { list, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

const schDataValidation = async (val, options) => {
  const errors = [];
  errors.push(
    ...(await validate(val, 'date_range_required', options)).errors,
  );
  const monthDiff = dayjs(searchParams.value.strtDt).startOf('month').diff(dayjs(searchParams.value.endDt).startOf('month'), 'month');
  if (monthDiff <= -12) {
    errors.push(t('MSG_ALT_SEARCH_UNDER_MN', [t('12')]));
  }
  return errors[0] || true;
};

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
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
}

</script>

<style scoped>
</style>
