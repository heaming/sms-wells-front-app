<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC
 2. 프로그램 ID : [K-W-SV-U-0282M01] WwsnbIstYOneAcuAsRtSdingPsM - 설치1년 누적A/S율_모종 현황
 3. 작성자 : gs.piit231
 4. 작성일 : 2023.10.05
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
  -
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <template #header>
      <kw-page-header
        :options="['홈', '품질현황', '품질관리', '모종_설치1년누적A/S율-OEM/ODM']"
      />
    </template>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 기준년도 -->
        <kw-search-item :label="$t('MSG_TXT_BASE_YEAR')">
          <kw-date-picker
            v-model="searchParams.baseY"
            type="year"
          />
        </kw-search-item>
        <!-- 중분류(서비스유형) -->
        <!-- 서비스유형 -->
        <kw-search-item :label="$t('MSG_TXT_SV_TP')">
          <kw-select
            v-model="searchParams.svType"
            :options="serviceTypes"
            first-option="all"
          />
        </kw-search-item>
        <!-- 소분류(불량구분) -->
        <!-- 불량구분 -->
        <kw-search-item :label="$t('MSG_TXT_BAD_DV')">
          <kw-select
            v-model="searchParams.badDivide"
            :options="badDvCdList"
            first-option="all"
          />
        </kw-search-item>
        <!-- 패키지 -->
        <kw-search-item :label="$t('MSG_TXT_PKG')">
          <kw-select
            v-model="searchParams.sdingPkgGrpCd"
            :options="sdingPkgGrpList"
            option-label="pkgCodeName"
            option-value="pkgCode"
            first-option="all"
            @change="onChangeSdingPkgGrpCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 모종 -->
        <kw-search-item :label="$t('MSG_TXT_SDING')">
          <kw-select
            v-model="searchParams.sdingCausNm"
            :options="sdingPkgCdList"
            option-value="code"
            option-label="codeName"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
          <span class="ml8">(단위: 원)</span>
        </template>
        <!-- 인쇄 -->
        <kw-btn
          icon="print"
          dense
          secondary
          :label="t('MSG_BTN_PRTG')"
          :disable="totalCount === 0"
          @click="onClickPrintEl"
        />
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdRef"
        :visible-rows="10"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, gridUtil } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import { printElement } from '~common/utils/common';

const { t } = useI18n();
const { currentRoute } = useRouter();

const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'BAD_DV_CD', // 불량구분
  'AS_CAUS_CD',
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRef = ref();

const searchParams = ref({
  baseY: dayjs().format('YYYY'), // 기준년도
  svType: '', // 서비스유형
  badDivide: '', // 불량구분
  sdingPkgGrpCd: '', // 모종패키지
  sdingCausNm: '', // 모종
  sdingPkgCd: '', // 모종..이상한 코드..ex)917L 등등
});

// 서비스 유형
const serviceTypes = [
  { codeId: '3110', codeName: '제품A/S' },
  { codeId: '3112', codeName: '특별A/S' },
  { codeId: '3210', codeName: '제품원인' },
];

// 불량구분
// '100R', '200R', '300R', '500R', '600R'
const badCdValue = ['100R', '200R', '300R', '500R', '600R'];
const badDvCdList = codes.BAD_DV_CD.filter((v) => badCdValue.includes(v.codeId));

// 패키지 리스트 setting
// const sdingPkgGrpList = [
//   { codeId: 'S1', codeName: t('선택모종') },
//   { codeId: 'B1', codeName: t('BASIC W, S') },
//   { codeId: 'H1', codeName: t('HEALTH W, S') },
//   { codeId: 'P1', codeName: t('PREMIUM W, S') },
//   { codeId: 'S2', codeName: t('SPECIAL W') },
//   { codeId: 'M1', codeName: t('미소채 W, S') },
//   { codeId: 'I1', codeName: t('아이쑥쑥 W, S') },
//   { codeId: 'W1', codeName: t('활력채 W, S') },
//   { codeId: 'H2', codeName: t('항암쌈채 W, S') },
// ];
const sdingPkgGrpList = ref((await dataService.get('/sms/wells/service/tot-as-rt-sding-ps/sdingPackage')).data);

// 모종
const sdingPkgCdList = ref([]);

const totalCount = ref(0);

async function onChangeSdingPkgGrpCd() {
  console.log('onChangeSdingPkgGrpCd START =================');
  searchParams.value.sdingCausNm = '';
  sdingPkgCdList.value = [];
  sdingPkgCdList.value = (await dataService.get('/sms/wells/service/tot-as-rt-sding-ps/sdingDtlInfo', { params: { pkgCode: searchParams.value.sdingPkgGrpCd } })).data;
  console.log('onChangeSdingPkgGrpCd sdingPkgCdList.value >>>', sdingPkgCdList.value);
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/ist-yone-acu-as-rt-sding-ps/search', { params: searchParams.value });
  totalCount.value = res.data.length;

  const view = grdRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function onClickSearch() {
  console.log('onClickSearch START =================');
  if (!isEmpty(searchParams.value.sdingCausNm)) {
    const sdingCode = sdingPkgCdList.value.filter((v) => v.code === searchParams.value.sdingCausNm)[0].codeName;
    searchParams.value.sdingPkgCd = codes.AS_CAUS_CD.filter((v) => v.codeName === sdingCode)[0].codeId;
  }
  console.log('onClickSearch searchParams.value =================', searchParams.value);
  await fetchData();
}

const pageRef = ref();
async function onClickPrintEl() {
  printElement(pageRef);
}

async function onClickExcelDownload() {
  const view = grdRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

onMounted(async () => {
  console.log('onMounted START');
  await onChangeSdingPkgGrpCd();
});

const divCd = [
  { codeId: '1', codeName: 'A/S건' },
  { codeId: '2', codeName: '렌탈 계정(수)' },
  { codeId: '3', codeName: 'A/S율(%)' },
  { codeId: '4', codeName: '엔지니어비용' },
  { codeId: '5', codeName: '부품비용' },
];
console.log('divCd >>>', divCd);

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const columns = [
    {
      fieldName: 'nm',
      header: t('MSG_TXT_DIV'),
      width: '150',
      styleName: 'text-center',
      displayCallback: (g, i) => {
        const { nm } = gridUtil.getRowValue(g, i.itemIndex);
        return divCd.find((x) => x.codeId === nm).codeName;
      },
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'tcnt',
      header: t('MSG_TXT_SUM'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'acol1',
      header: t('MSG_TXT_JAN'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'acol2',
      header: t('MSG_TXT_FEB'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'acol3',
      header: t('MSG_TXT_MAR'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'acol4',
      header: t('MSG_TXT_APRI'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'acol5',
      header: t('MSG_TXT_MAY'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'acol6',
      header: t('MSG_TXT_JUN'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'acol7',
      header: t('MSG_TXT_JUL'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'acol8',
      header: t('MSG_TXT_AUG'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'acol9',
      header: t('MSG_TXT_SEPT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'acol10',
      header: t('MSG_TXT_OCT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'acol11',
      header: t('MSG_TXT_NOV'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'acol12',
      header: t('MSG_TXT_DECE'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    { fieldName: 'maxval', visible: false },
    { fieldName: 'minval', visible: false },
    { fieldName: 'avg', visible: false },
  ];

  // 헤더쪽 합계 행고정, summary
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });

  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
}
</script>
