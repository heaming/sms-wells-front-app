<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC
 2. 프로그램 ID : [K-W-SV-U-0243M01] WwsnbTotalAfterServiceRateOdmPerOemM - 실적_총A/S율-ODM/OEM
 3. 작성자 : gs.piit231
 4. 작성일 : 2023.09.06
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
  - http://localhost:3000/#/service/wwsnb-total-after-service-rate-odm-per-oem
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <template #header>
      <kw-page-header
        :options="['홈', '품질현황', '품질관리', '총A/S율-ODM/OEM']"
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
            :options="badDvCdList"
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
          <!-- (단위:원) -->
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
      </kw-action-top>
      <!-- <kw-grid
        ref="grdMainRef"
        :visible-rows="30"
        @init="initGrdMain"
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
import { useDataService, codeUtil, useMeta, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import smsCommon from '~sms-wells/service/composables/useSnCode';
import { printElement } from '~common/utils/common';

const { t } = useI18n();
const { getConfig } = useMeta();
const { getPartMaster } = smsCommon();

const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'BAD_DV_CD',
  'PD_GRP_CD',
);
console.log('codes.PD_GRP_CD >>>>>', codes.PD_GRP_CD);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref();

let cachedParams;
const searchParams = ref({
  baseY: dayjs().format('YYYY'), // 기준년도
  svType: '', // 서비스유형
  badDivide: '', // 불량구분
  pdGrp: '', // 상품그룹
  pdGrpGubun: '',
  pdCd: '', // 상품명
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// TODO : 설치원인, 부품원인 확인 필요..
// 설치원인 ~> 회사설치, 부품원인 ~> 필터B/S
// 전체[00], 제품A/S[01], 특별A/S[02], 제품원인[03], 설치원인[04], 고객원인[05], 부품원인[06]
const serviceTypes = [
  { codeId: '3110', codeName: '제품A/S' },
  { codeId: '3112', codeName: '특별A/S' },
  { codeId: '3210', codeName: '제품원인' },
  // // { codeId: '04', codeName: '설치원인' },
  // { codeId: '3440', codeName: '회사설치' },
  // { codeId: '3230', codeName: '고객원인' },
  // // { codeId: '06', codeName: '부품원인' },
  // { codeId: '3121', codeName: '필터B/S' },
];

// 홍세기 매니저 확인
// 서비스 > 실적..불량구분은 100, 400, 500, 700 만 사용
const badCdValue = ['100R', '400R', '500R', '700R'];
const badDvCdList = codes.BAD_DV_CD.filter((v) => badCdValue.includes(v.codeId));

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
    fileName: '실적_총A/S율-ODM/OEM',
    timePostfix: true,
  });
}

async function fetchData() {
  console.log('fetchData cachedParams >>>>', cachedParams);
  const res = await dataService.get('/sms/wells/service/total-afterservice-rate-odmperoem', { params: cachedParams });
  pageInfo.value.totalCount = res.data.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function onClickSearch() {
  /**-------------------------------------------------
   * 상품그룹이 정수기(2) 나 커피머신(99) 일경우 === '1'
   * default === '0'
  **-------------------------------------------------*/
  searchParams.value.pdGrpGubun = (searchParams.value.pdGrp === '2' || searchParams.value.pdGrp === '99') ? '1' : '0';
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

const divCd = [
  { codeId: '1', codeName: 'A/S건' },
  { codeId: '2', codeName: '렌탈 계정(수)' },
  { codeId: '3', codeName: 'A/S율(%)' },
  { codeId: '4', codeName: '엔지니어비용' },
  { codeId: '5', codeName: '부품비용' },
];

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
async function initGrdMain(data, view) {
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
