<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CMA
2. 프로그램 ID : WwsnaOutOfStorageIzDtlMngtListM - 출고내역상세 관리 (W-SV-U-0144M01)
3. 작성자 : inho.choi
4. 작성일 : 2023.02.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 출고된 상세내역을 조회하고 자료를 이관하는 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <!-- 출고기간-->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_PTRM')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.stOstrDt"
            v-model:to="searchParams.edOstrDt"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <!-- //출고기간-->
        <!-- 출고창고 -->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.stOstrDt"
          v-model:end-ym="searchParams.edOstrDt"
          v-model:options-ware-dv-cd="strWareDvCd"
          v-model:ware-dv-cd="searchParams.ostrWareDvCd"
          v-model:ware-no-m="searchParams.ostrWareDtlDvCd"
          v-model:ware-no-d="searchParams.ostrWareNo"
          first-option="all"
          sub-first-option="all"
          :colspan="2"
          :label2="$t('MSG_TXT_OSTR_WARE')"
          :label3="$t('MSG_TXT_HGR_WARE')"
          :label4="$t('MSG_TXT_WARE')"
        />
        <!-- //출고창고 -->
      </kw-search-row>
      <kw-search-row>
        <!-- 출고유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_TP')"
        >
          <kw-select
            v-model="searchParams.ostrTpCd"
            :options="codes.OSTR_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- //출고유형 -->
        <!-- 입고창고-->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.stOstrDt"
          v-model:end-ym="searchParams.edOstrDt"
          v-model:options-ware-dv-cd="strWareDvCd"
          v-model:ware-dv-cd="searchParams.strWareDvCd"
          v-model:ware-no-m="searchParams.strWareDtlDvCd"
          v-model:ware-no-d="searchParams.strWareNo"
          first-option="all"
          sub-first-option="all"
          :colspan="2"
          :label2="$t('MSG_TXT_STR_WARE')"
          :label3="$t('MSG_TXT_HGR_WARE')"
          :label4="$t('MSG_TXT_WARE')"
        />
        <!-- //입고창고-->
      </kw-search-row>
      <kw-search-row>
        <!-- 등급 -->
        <kw-search-item
          :label="$t('MSG_TXT_GD')"
        >
          <kw-select
            v-model="searchParams.pdGbCd"
            :options="codes.PD_GD_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- //등급 -->
        <!-- 품목코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            class="w100"
            :options="codes.ITM_KND_CD"
            first-option="all"
          />
          <kw-select
            v-model="searchParams.itmPdCd"
            :options="itmPdCdFilter"
            first-option="all"
          />
        </kw-search-item>
        <!-- //품목코드 -->
        <!-- 사용여부 -->
        <kw-search-item
          :label="$t('MSG_TXT_USE_SEL')"
        >
          <kw-select
            :options="codes.USE_YN"
            first-option="all"
          />
        </kw-search-item>
        <!-- //사용여부 -->
      </kw-search-row>
    </kw-search>

    <div class="result-area ">
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

        <kw-btn
          secondary
          dense
          icon="excel"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
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
import { codeUtil, getComponentType, useMeta, defineGrid, gridUtil, useDataService } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';

const { getConfig } = useMeta();
const dataService = useDataService();
const { t } = useI18n();

const baseURI = '/sms/wells/service/out-of-storage-iz-dtls';
const itemsURI = '/sms/wells/service/individual-ware-ostrs/filter-items';
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'STR_TP_CD', // 입고 유형
  'OSTR_TP_CD', // 출고 유형
  'WARE_DV_CD', // 창고 구분
  'ITM_KND_CD', // 품목 종류
  'PD_GD_CD', // 상품 등급
  'MNGT_UNIT_CD', // 관리 단위
  'COD_PAGE_SIZE_OPTIONS',
  'COD_YN',
  'USE_YN',
);

const itmPdCdFilter = ref();
// 품목코드
// codes.value.ITM_PD_CD = [{}];

const grdMainRef = ref(getComponentType('KwGrid'));

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
const searchParams = ref({
  stOstrDt: '',
  edOstrDt: '',
  strTpCd: '',
  ostrTpCd: '',
  pdGbCd: '',
  strWareDvCd: '2',
  strWareDtlDvCd: '',
  strWareNo: '',
  ostrWareDvCd: '1',
  ostrWareDtlDvCd: '',
  ostrWareNo: '',
  itmKndCd: '',
  itmPdCd: '',
  useYn: '',
  apyYm: '',
});

// 품목코드 가져오기
watch(() => searchParams.value.itmKndCd, async () => {
  const { itmKndCd } = searchParams.value;
  const { data } = await dataService.get(itemsURI, { params: { itmKndCd } });
  itmPdCdFilter.value = data;
});

async function fetchData() {
  const res = await dataService.get(baseURI, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: searchData, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const datasSource = view.getDataSource();
  datasSource.setRows(searchData);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  const apyYm = searchParams.value.stOstrDt.substring(0, 6).concat('');

  searchParams.value.apyYm = apyYm;
  console.log(`apyYm : ${searchParams.value.apyYm}`);
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseURI}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'outOfStorageIzDtlMng',
    timePostfix: true,
    exportData: res.data,
  });
}

// 초기값 설정
function defaultSet() {
  const now = dayjs();
  const toDay = now.format('YYYYMMDD');
  const startMonth = now.format('YYYYMM').concat('01');

  searchParams.value = {
    stOstrDt: '',
    edOstrDt: '',
    strTpCd: '',
    ostrTpCd: '',
    pdGbCd: '',
    strWareDvCd: '2',
    strWareDtlDvCd: '',
    strWareNo: '',
    ostrWareDvCd: '1',
    ostrWareDtlDvCd: '',
    ostrWareNo: '',
    itmKndCd: '',
    itmPdCd: '',
    useYn: '',
    apyYm: '',
  };

  searchParams.value.stOstrDt = startMonth;
  searchParams.value.edOstrDt = toDay;
  console.log(`today : ${toDay}`);
  console.log(`startMonth : ${startMonth}`);
}

function onClickReset() {
  defaultSet();
}

onMounted(async () => {
  defaultSet();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'inWareNm', header: t('MSG_TXT_STR_WARE'), width: '150', styleName: 'text-left' },
    { fieldName: 'inWareMngtPrtnrNo', header: t('MSG_TXT_STR_WARE_MNGT_PRTNR_NO'), width: '180', styleName: 'text-center' },
    { fieldName: 'ostrDt', header: t('MSG_TXT_OSTR_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '300', styleName: 'text-left' },
    { fieldName: 'ostrTpCd',
      header: t('MSG_TXT_OSTR_TP'),
      options: codes.OSTR_TP_CD,
      editor: { type: 'list' },
      editable: false,
      width: '100',
      styleName: 'text-center' },
    { fieldName: 'mngtUnitCd', header: t('MSG_TXT_MNGT_UNIT'), width: '100', styleName: 'text-center' },
    { fieldName: 'itmGdCd', header: t('MSG_TXT_GD'), width: '100', styleName: 'text-center' },
    { fieldName: 'strQty', header: t('MSG_TXT_QTY'), width: '100', styleName: 'text-center' },
    { fieldName: 'boxUnitQty', header: t('MSG_TXT_BOX_UNIT_QTY'), width: '100', styleName: 'text-center' },
    { fieldName: 'didyDvCd', header: t('MSG_TXT_DIDY_COS'), width: '100', styleName: 'text-center' },
    { fieldName: 'outWareNm', header: t('MSG_TXT_OSTR_WARE'), width: '100', styleName: 'text-center' },
    { fieldName: 'inWareNmSub', header: t('MSG_TXT_STR_WARE'), width: '100', styleName: 'text-center' },
    { fieldName: 'strRgstDt', header: t('MSG_TXT_STR_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'ostrAkNo', header: t('MSG_TXT_OSTR_AK_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'itmOstrNo', header: t('MSG_TXT_OSTR_MNGT_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'itmStrNo', header: t('MSG_TXT_STR_MNGT_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'rmkCn', header: t('MSG_TXT_NOTE'), width: '100', styleName: 'text-center' },
  ];

  const gridField = columns.map((v) => ({ fieldName: v.fieldName }));
  // const fields = columns.map((v) => ({ fieldName: v.fieldName }));
  const fields = [...gridField,
    { fieldName: 'itmCd' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});
</script>
<style scoped> </style>
