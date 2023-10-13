<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC
 2. 프로그램 ID : [K-W-SV-U-0245M01] WwsnbNewPdctMThreeAcuAfSvRtM - 실적_신제품 M+3 누적 A/S율
 3. 작성자 : gs.piit231
 4. 작성일 : 2023.09.07
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
        :options="['홈', '품질현황', '품질관리', '신제품 M+3 누적 A/S율']"
      />
    </template>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <!-- 기준년도 -->
        <kw-search-item :label="t('MSG_TXT_BASE_YEAR')">
          <kw-date-picker
            v-model="searchParams.baseY"
            type="year"
          />
        </kw-search-item>
        <!-- 중분류(서비스유형) -->
        <!-- 서비스유형 -->
        <kw-search-item :label="t('MSG_TXT_SV_TP')">
          <kw-select
            v-model="searchParams.svType"
            :options="serviceTypes"
            first-option="all"
          />
        </kw-search-item>
        <!-- 소분류(불량구분) -->
        <!-- 불량구분 -->
        <kw-search-item :label="t('MSG_TXT_BAD_DV')">
          <kw-select
            v-model="searchParams.badDivide"
            :options="optionBadDvCdList"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 상품그룹 -->
        <kw-search-item :label="t('MSG_TXT_PD_GRP')">
          <kw-select
            v-model="searchParams.pdGrp"
            :options="optionPdGrpList"
            class="w150"
            first-option="all"
            @change="changePdGrpCd"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="pds"
            first-option="select"
            option-label="cdNm"
            option-value="cd"
            :disable="searchParams.pdGrp === '' "
            :label="$t('MSG_TXT_PRDT_NM')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="pageInfo.totalCount" />
          <!-- (단위: 원) -->
          <span class="ml8">({{ t('MSG_TXT_UNIT') }}: {{ t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <!-- 인쇄 -->
        <kw-btn
          icon="print"
          dense
          secondary
          :label="t('MSG_BTN_PRTG')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickPrintEl"
        />
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />

        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          primary
          dense
          label="M+3 출시일 등록"
          @click="onClickPopup"
        />
      </kw-action-top>
      <!-- <kw-grid
        :visible-rows="5"
        @init="initGrid"
      /> -->
      <kw-grid
        ref="grdMainRef"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal, useMeta, codeUtil, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import smsCommon from '~sms-wells/service/composables/useSnCode';
import { printElement } from '~common/utils/common';

const { t } = useI18n();
const { modal } = useGlobal();
const { getConfig } = useMeta();

const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'BAD_DV_CD',
  'PD_GRP_CD',
);
console.log('codes.PD_GRP_CD >>>', codes.PD_GRP_CD);

const { getPartMaster } = smsCommon();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref();

const searchParams = ref({
  baseY: dayjs().format('YYYY'), // 기준년도
  svType: '', // 서비스유형
  badDivide: '', // 불량구분
  pdGrp: '', // 상품그룹
  pdCd: '', // 상품명
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 서비스유형
const serviceTypes = [
  { codeId: '3110', codeName: '제품A/S' },
  { codeId: '3112', codeName: '특별A/S' },
  { codeId: '3210', codeName: '제품원인' },
  // { codeId: '04', codeName: '설치원인' },
  // { codeId: '3440', codeName: '회사설치' },
  // { codeId: '3230', codeName: '고객원인' },
  // { codeId: '06', codeName: '부품원인' },
  // { codeId: '3121', codeName: '필터B/S' },
];

// 불량구분
const arrBadDvCd = ['100R', '400R', '500R', '700R'];
const optionBadDvCdList = ref([]);
optionBadDvCdList.value = codes.BAD_DV_CD.filter((v) => arrBadDvCd.includes(v.codeId));

// 상품그룹
const arrPdGrp = ['1', '2', '3', '4', '6', '9'];
const optionPdGrpList = ref([]);
optionPdGrpList.value = codes.PD_GRP_CD.filter((v) => arrPdGrp.includes(v.codeId));

const pds = ref([]);
async function changePdGrpCd() {
  if (searchParams.value.pdGrp) {
    pds.value = await getPartMaster(
      '4',
      searchParams.value.pdGrp,
      'M',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      'X', /* 단종여부Y/N, 만약 X로 데이터가 유입되면 단종여부를 조회하지 않음 */
    );
  } else pds.value = [];
  searchParams.value.pdCd = '';
}

const pageRef = ref();
async function onClickPrintEl() {
  printElement(pageRef);
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: '실적_신제품 M+3 누적 A/S율',
    timePostfix: true,
  });
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/newpd-m-three-acu-af-sv-rt', { params: searchParams.value });
  console.log('res.data >>>>', res.data);
  pageInfo.value.totalCount = res.data.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function onClickSearch() {
  await fetchData();
}

async function onClickPopup() {
  await modal({
    component: 'WwsnbNewPdctMThreeAcuAfSvRtP',
    componentProps: {
      pdGrp: searchParams.value.pdGrp, // 상품그룹
      pdCd: searchParams.value.pdCd, // 상품명
    },
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const divCd = [
  { codeId: '1', codeName: 'A/S건' },
  { codeId: '2', codeName: '렌탈 계정(수)' },
  { codeId: '3', codeName: 'A/S율(%)' },
  { codeId: '4', codeName: '엔지니어비용' },
  { codeId: '5', codeName: '부품비용' },
];

function initGrdMain(data, view) {
  const fields = [
    { fieldName: 'nm' }, // 항목명
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
    { fieldName: 'maxval', dataType: 'number' },
    { fieldName: 'minval', dataType: 'number' },
    { fieldName: 'avg', dataType: 'number' },
  ];

  const columns = [
    {
      fieldName: 'nm',
      header: t('MSG_TXT_DIV'),
      width: '150',
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

  // view.layoutByColumn('MSG_TXT_DIV').summaryUserSpans = [{ colspan: 2 }];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
}
</script>
