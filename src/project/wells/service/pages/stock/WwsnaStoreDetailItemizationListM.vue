<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaStoreDetailItemizationListM - 입고상세내역 조회
3. 작성자 : songTaeSung
4. 작성일 : 2023.01.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 입고상세내역 조회 (http://localhost:3000/#/service/wwsna-store-detail-itemization-list)
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 입고기간 -->
        <kw-search-item
          :label="$t('MSG_TXT_STR_PTRM')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.stStrDt"
            v-model:to="searchParams.edStrDt"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <!-- 입고창고 -->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.stStrDt"
          v-model:end-ym="searchParams.edStrDt"
          v-model:options-ware-dv-cd="strWareDvCd"
          v-model:ware-dv-cd="searchParams.strWareDvCd"
          v-model:ware-no-m="searchParams.strWareNoM"
          v-model:ware-no-d="searchParams.strWareNoD"
          sub-first-option="all"
          :colspan="2"
          :label1="$t('MSG_TXT_OSTR_PTRM')"
          :label2="$t('MSG_TXT_STR_WARE')"
          :label3="$t('MSG_TXT_WARE')"
          :label4="$t('MSG_TXT_WARE')"
        />
      </kw-search-row>
      <kw-search-row>
        <!-- 입고유형 -->
        <kw-search-item :label="$t('MSG_TXT_STR_TP')">
          <kw-select
            v-model="searchParams.strTpCd"
            :options="codes.STR_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 출고창고 -->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.stStrDt"
          v-model:end-ym="searchParams.edStrDt"
          v-model:options-ware-dv-cd="ostrWareDvCd"
          v-model:ware-dv-cd="searchParams.ostrWareDvCd"
          v-model:ware-no-m="searchParams.ostrWareNoM"
          v-model:ware-no-d="searchParams.ostrWareNoD"
          sub-first-option="all"
          :colspan="2"
          :label1="$t('MSG_TXT_OSTR_PTRM')"
          :label2="$t('MSG_TXT_OSTR_WARE')"
          :label3="$t('MSG_TXT_WARE')"
          :label4="$t('MSG_TXT_WARE')"
        />
      </kw-search-row>
      <!-- 등급 -->
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_GD')">
          <kw-select
            v-model="pgGdCd"
            :options="codes.PD_GD_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 품목코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            first-option="all"
            class="w140"
          />
          <kw-select
            v-model="searchParams.itmKndCdD"
            :options="itemKndCdD"
            first-option="all"
            class="w220"
          />
        </kw-search-item>
        <!-- 사용여부 -->
        <kw-search-item :label="$t('MSG_TXT_USE_SEL')">
          <kw-select
            v-model="searchParams.useYn"
            :options="codes.USE_YN"
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
        </template>
        <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

// import { codeUtil, getComponentType, useDataService, defineGrid } from 'kw-lib';
import { codeUtil, getComponentType, defineGrid, useDataService, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';

const grdMainRef = ref(getComponentType('KwGrid'));

const dataService = useDataService();

const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const searchParams = ref({
  stStrDt: '',
  edStrDt: '',
  strTpCd: '',
  strWareDvCd: '2',
  strWareNoD: '',
  strWareNoM: '',
  ostrWareDvCd: '1',
  ostrWareNoD: '',
  ostrWareNoM: '',
  pgGdCd: '',
  itmKndCd: '',
  useYn: '',
  itmKndCdD: '',
});

const codes = await codeUtil.getMultiCodes(
  'STR_TP_CD',
  'WARE_DV_CD',
  'PD_GD_CD',
  'ITM_KND_CD',
  'USE_YN',
);

// const wareDvCd = codes.WARE_DV_CD.filter((v) => v.codeId !== '1');
const strWareDvCd = { WARE_DV_CD: [
  { codeId: '2', codeName: '서비스센터' },
  { codeId: '3', codeName: '영업센터' },
] };

console.log(strWareDvCd);

const totalCount = ref(0);

const itemKndCdD = ref();

searchParams.value.stStrDt = dayjs().set('date', 1).format('YYYYMMDD');
searchParams.value.edStrDt = dayjs().format('YYYYMMDD');

const onChangeItmKndCd = async () => {
  // const paramItmKndCd = searchParams.value.itmKndCd;
  // const itmKndCd = cloneDeep(searchParams.value.itmKndCd);
  // const res = await dataService.get(`/sms/wells/service/individual-ware-ostrs/${itmKndCd}`);
  const res = await dataService.get('/sms/wells/service/individual-ware-ostrs/filter-items', { params: searchParams.value });
  itemKndCdD.value = res.data;
  searchParams.value.itmKndCdD = itemKndCdD.value[0].codeId;
};

watch(() => searchParams.value.itmKndCd, (val) => {
  if (searchParams.value.itmKndCd !== val) {
    searchParams.value.itmKndCd = val;
  }
  onChangeItmKndCd();
});

let cachedParams;

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/store-detail-itemizations', { params: cachedParams });
  console.log(res);
  const store = res.data;
  console.log(store.length);
  totalCount.value = store.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(store);
  view.resetCurrent();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/store-detail-itemization/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'storeDetailItemizationList',
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'strRgstDt' },
    { fieldName: 'sapMatCd' },
    { fieldName: 'itmPdCd' },
    { fieldName: 'pdAbbrNm' },
    { fieldName: 'cdCntn' },
    { fieldName: 'mngtUnitCd' },
    { fieldName: 'itmGdCd' },
    { fieldName: 'strQty', dataType: 'number' },
    { fieldName: 'ostrWareNm' },
    { fieldName: 'strWareNm' },
    { fieldName: 'itmStrNo' },
    { fieldName: 'itmOstrNo' },

  ];

  const columns = [
    { fieldName: 'strRgstDt', header: t('MSG_TXT_STR_DT'), datetimeFormat: 'date', width: '150', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ITM_NM'), width: '300' },
    { fieldName: 'cdCntn', header: t('MSG_TXT_STR_TP'), width: '100', styleName: 'text-center' },
    { fieldName: 'mngtUnitCd', header: t('MSG_TXT_MNGT_UNIT'), width: '100', styleName: 'text-center' },
    { fieldName: 'itmGdCd', header: t('MSG_TXT_GD'), width: '100', styleName: 'text-center' },
    { fieldName: 'strQty', header: t('MSG_TXT_QTY'), dataType: 'number', numberFormat: '#,##0', width: '100', styleName: 'text-right' },
    { fieldName: 'strWareNm', header: t('MSG_TXT_STR_WARE'), width: '150', styleName: 'text-center' },
    { fieldName: 'ostrWareNm', header: t('MSG_TXT_OSTR_WARE'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmStrNo', header: t('MSG_TXT_STR_WARE_NO'), width: '200', styleName: 'text-center' },
    { fieldName: 'itmOstrNo', header: t('MSG_TXT_OSTR_WARE_NO'), width: '200', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.setCheckableCallback(() => false);
  view.rowIndicator.visible = true;
});
</script>
