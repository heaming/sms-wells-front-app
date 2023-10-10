<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC
 2. 프로그램 ID : [K-W-SV-U-0246M01] WwsnbTotAsRtSdingPsM - 총A/S율_모종 현황
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
        :options="['홈', '품질현황', '품질관리', '모종_총A/S율']"
      />
    </template>
    <kw-search
      :cols="4"
      @reset="onClickReset"
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
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 모종 -->
        <kw-search-item :label="$t('MSG_TXT_SDING')">
          <kw-select
            v-model="searchParams.sdingCausNm"
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
// import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import { printElement } from '~common/utils/common';

const { t } = useI18n();
const { currentRoute } = useRouter();

const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'BAD_DV_CD', // 불량구분
);
// const codes = await codeUtil.getMultiCodes(
//   'BAD_DV_CD', // 불량구분
//   'SDING_PKG_GRP_CD', // 패키지[모종]
//   'SDING_PKG_CD', // 패키지[모종]
// );

// 패키지 리스트 setting
const sdingPkgGrpList = [
  { codeId: 'S1', codeName: t('선택모종') },
  { codeId: 'B1', codeName: t('BASIC W, S') },
  { codeId: 'H1', codeName: t('HEALTH W, S') },
  { codeId: 'P1', codeName: t('PREMIUM W, S') },
  { codeId: 'S2', codeName: t('SPECIAL W') },
  { codeId: 'M1', codeName: t('미소채 W, S') },
  { codeId: 'I1', codeName: t('아이쑥쑥 W, S') },
  { codeId: 'W1', codeName: t('활력채 W, S') },
  { codeId: 'H2', codeName: t('항암쌈채 W, S') },
];

// 모종 리스트
// const pdCdList = ref([]);
// const arrPd = [
//   'WM05106251', // S1[선택모종]
//   'WM05106338', 'WM05106341', // B1[BASIC]
//   'WM05106339', 'WM05106342', // H1[HEALTH]
//   'WM05106340', 'WM05106343', // P1[PREMIUM]
//   'WM05106344', // S2[SPECIAL]
//   'WM05106355', 'WM05106356', 'WM05106363', 'WM05106364', 'WM05106365', 'WM05106346', 'WM05106345', // M1[미소채]
//   'WM05106357', 'WM05106358', 'WM05106366', 'WM05106367', 'WM05106347', 'WM05106348', // I1[아이쑥쑥]
//   'WM05106359', 'WM05106360', 'WM05106368', 'WM05106369', 'WM05106349', 'WM05106350', // W1[활력채]
//   'WM05106351', 'WM05106352', 'WM05106361', 'WM05106362', 'WM05106370', 'WM05106371', // H2[항암쌈채]
// ];
// async function getPdCdList() {
//   const pdDtlList = await dataService.get('/sms/wells/service/newpd-m-three-acu-af-sv-rt/pd-dtl-list');
//   if (pdDtlList.data.length > 0) {
//     pdDtlList.data.forEach((data) => {
//       if (arrPd.includes(data.cd)) {
//         let grpCd = '';
//         if (data.cd === 'WM05106251') {
//           grpCd = 'S1';
//         } else if (data.cd === 'WM05106338' || data.cd === 'WM05106341') {
//           grpCd = 'B1';
//         } else if (data.cd === 'WM05106339' || data.cd === 'WM05106342') {
//           grpCd = 'H1';
//         } else if (data.cd === 'WM05106340' || data.cd === 'WM05106343') {
//           grpCd = 'H1';
//         } else if (data.cd === 'WM05106344') {
//           grpCd = 'S2';
//         } else if (
//           data.cd === 'WM05106355' || data.cd === 'WM05106356' || data.cd === 'WM05106363'
//           || data.cd === 'WM05106364' || data.cd === 'WM05106365' || data.cd === 'WM05106346'
//           || data.cd === 'WM05106345'
//         ) {
//           grpCd = 'M1';
//         } else if (
//           data.cd === 'WM05106357' || data.cd === 'WM05106358' || data.cd === 'WM05106369'
//           || data.cd === 'WM05106367' || data.cd === 'WM05106347' || data.cd === 'WM05106348'
//         ) {
//           grpCd = 'I1';
//         } else if (
//           data.cd === 'WM05106359' || data.cd === 'WM05106360' || data.cd === 'WM05106368'
//           || data.cd === 'WM05106369' || data.cd === 'WM05106349' || data.cd === 'WM05106350'
//         ) {
//           grpCd = 'W1';
//         } else if (
//           data.cd === 'WM05106351' || data.cd === 'WM05106352' || data.cd === 'WM05106361'
//           || data.cd === 'WM05106362' || data.cd === 'WM05106370' || data.cd === 'WM05106371'
//         ) {
//           grpCd = 'H2';
//         }

//         pdCdList.value.push({
//           codeId: data.cd,
//           codeName: data.cdNm,
//           pdGrpCd: grpCd,
//         });
//       }
//     });
//   }
// }
// await getPdCdList();
// console.log('pdCdList.value ????', pdCdList.value);

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
});

// 서비스 유형
const serviceTypes = [
  { codeId: '3110', codeName: '제품A/S' },
  { codeId: '3112', codeName: '특별A/S' },
  { codeId: '3210', codeName: '제품원인' },
];

const badCdValue = ['100R', '200R', '300R', '500R', '600R'];
const badDvCdList = codes.BAD_DV_CD.filter((v) => badCdValue.includes(v.codeId));

const totalCount = ref(0);

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/tot-as-rt-sding-ps/search', { params: searchParams.value });
  totalCount.value = res.data.length;

  const view = grdRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function onClickSearch() {
  console.log('onClickSearch START =================');
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

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'atcNm' }, // 항목명
    { fieldName: 'nm' }, // 항목명
    { fieldName: 'currentYear' }, // 항목명
    { fieldName: 'tcnt', dataType: 'number' }, // 합계
    { fieldName: 'acol1', dataType: 'number' }, // 1월
    { fieldName: 'acol2', dataType: 'number' }, // 2월
    { fieldName: 'acol3', dataType: 'number' }, // 3월
    { fieldName: 'acol4', dataType: 'number' }, // 4월
    { fieldName: 'acol5', dataType: 'number' }, // 5월
    { fieldName: 'acol6', dataType: 'number' }, // 6월
    { fieldName: 'acol7', dataType: 'number' }, // 7월
    { fieldName: 'acol8', dataType: 'number' }, // 8월
    { fieldName: 'acol9', dataType: 'number' }, // 9월
    { fieldName: 'acol10', dataType: 'number' }, // 10월
    { fieldName: 'acol11', dataType: 'number' }, // 11월
    { fieldName: 'acol12', dataType: 'number' }, // 12월
    { fieldName: 'maxVal', dataType: 'number' },
    { fieldName: 'minVal', dataType: 'number' },
    { fieldName: 'avg', dataType: 'number' },
  ];

  const columns = [
    {
      fieldName: 'atcNm',
      header: t('MSG_TXT_DIV'),
      width: '150',
      styleName: 'text-center',
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
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    { fieldName: 'maxVal', visible: false },
    { fieldName: 'minVal', visible: false },
    { fieldName: 'avg', visible: false },
    { fieldName: 'nm', visible: false },
    { fieldName: 'currentYear', visible: false },
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

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
}
</script>
