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
            :options="codes.BAD_DV_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 패키지 -->
        <kw-search-item :label="$t('MSG_TXT_PKG')">
          <kw-select
            v-model="searchParams.sdingPkgGrpCd"
            :options="codes.SDING_PKG_GRP_CD"
            first-option="all"
            @change="onChangeSdingPkgGrpCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 모종 -->
        <kw-search-item :label="$t('MSG_TXT_SDING')">
          <kw-select
            v-model="searchParams.sdingPkgCd"
            :options="sdingPkgCd"
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
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import { printElement } from '~common/utils/common';

const { t } = useI18n();
const { currentRoute } = useRouter();

const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'BAD_DV_CD', // 불량구분
  'SDING_PKG_GRP_CD', // 패키지[모종]
  'SDING_PKG_CD', // 패키지[모종]
);
console.log('codes.SDING_PKG_GRP_CD ????', codes.SDING_PKG_GRP_CD);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRef = ref();

const searchParams = ref({
  baseY: dayjs().format('YYYY'), // 기준년도
  svType: '', // 서비스유형
  badDivide: '', // 불량구분
  sdingPkgGrpCd: '', // 모종패키지
  sdingPkgCd: '', // 모종
});

// 서비스 유형
const serviceTypes = [
  { codeId: '3110', codeName: '제품A/S' },
  { codeId: '3112', codeName: '특별A/S' },
  { codeId: '3210', codeName: '제품원인' },
];

// 모종
const sdingPkgCd = ref([]);

const totalCount = ref(0);

async function onChangeSdingPkgGrpCd() {
  console.log('onChangeSdingPkgGrpCd START =================');

  sdingPkgCd.value = codes.SDING_PKG_CD.filter((v) => v.codeId.substring(0, 5) === searchParams.value.sdingPkgGrpCd);
  if (searchParams.value.sdingPkgGrpCd === '') {
    sdingPkgCd.value = codes.SDING_PKG_CD;
  }
  console.log('sdingPkgCd.value 0002 >>>', sdingPkgCd.value);
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
  await fetchData();
}

async function onClickReset() {
  if (searchParams.value.sdingPkgGrpCd === '') {
    sdingPkgCd.value = cloneDeep(codes.SDING_PKG_CD);
  }
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
  sdingPkgCd.value = cloneDeep(codes.SDING_PKG_CD);
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'atcNm' }, // 항목명
    { fieldName: 'tcnt', dataType: 'number' }, // 합계
    { fieldName: 'm01', dataType: 'number' }, // 1월
    { fieldName: 'm02', dataType: 'number' }, // 2월
    { fieldName: 'm03', dataType: 'number' }, // 3월
    { fieldName: 'm04', dataType: 'number' }, // 4월
    { fieldName: 'm05', dataType: 'number' }, // 5월
    { fieldName: 'm06', dataType: 'number' }, // 6월
    { fieldName: 'm07', dataType: 'number' }, // 7월
    { fieldName: 'm08', dataType: 'number' }, // 8월
    { fieldName: 'm09', dataType: 'number' }, // 9월
    { fieldName: 'm10', dataType: 'number' }, // 10월
    { fieldName: 'm11', dataType: 'number' }, // 11월
    { fieldName: 'm12', dataType: 'number' }, // 12월
    { fieldName: 'maxVal', dataType: 'number' },
    { fieldName: 'minVal', dataType: 'number' },
    { fieldName: 'avgVal', dataType: 'number' },
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
      fieldName: 'm01',
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
      fieldName: 'm02',
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
      fieldName: 'm03',
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
      fieldName: 'm04',
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
      fieldName: 'm05',
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
      fieldName: 'm06',
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
      fieldName: 'm07',
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
      fieldName: 'm08',
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
      fieldName: 'm09',
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
      fieldName: 'm10',
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
      fieldName: 'm11',
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
      fieldName: 'm12',
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
    { fieldName: 'avgVal', visible: false },
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
