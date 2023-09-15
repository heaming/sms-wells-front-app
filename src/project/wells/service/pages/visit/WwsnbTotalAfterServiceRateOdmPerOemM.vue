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
  -
 ****************************************************************************************************
--->
<template>
  <kw-page>
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
            :options="codes.BAD_DV_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 상품그룹 -->
        <kw-search-item :label="t('MSG_TXT_PD_GRP')">
          <kw-select
            v-model="searchParams.pdGrp"
            :options="codes.PD_GRP_CD"
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
          <span class="ml8">(단위: 원)</span>
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
import dayjs from 'dayjs';
import smsCommon from '~sms-wells/service/composables/useSnCode';
import { printElement } from '~common/utils/common';

const { t } = useI18n();
const { getConfig } = useMeta();

const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'BAD_DV_CD',
  'PD_GRP_CD',
);

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

// 서비스유형 중분류..공통코드 있을거 같은데...
// 전체[00], 제품A/S[01], 특별A/S[02], 제품원인[03], 설치원인[04], 고객원인[05], 부품원인[06]
const serviceTypes = [
  // { codeId: '3112', codeName: '특별A/S' },
  // { codeId: '3210', codeName: '제품원인' },
  // { codeId: '3110', codeName: '제품A/S' },
  { codeId: '01', codeName: '제품A/S' },
  { codeId: '02', codeName: '특별A/S' },
  { codeId: '03', codeName: '제품원인' },
  { codeId: '04', codeName: '설치원인' },
  { codeId: '05', codeName: '고객원인' },
  { codeId: '06', codeName: '부품원인' },
];

// 소분류(불량구분)...일단 공통코드 BAD_DV_CD 사용
// 전체, 모종불량, 제품불량, 매니저과실, 엔지니어과실, 품질개선(리콜) 서비스
// const badGbTypes = [
// { codeId: '100R', codeName: '제품불량' },
// { codeId: '500R', codeName: '엔지니어과실' },
// { codeId: '400R', codeName: '매니저과실' },
// { codeId: '700R', codeName: '품질개선(리콜) 서비스' },
// ];

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
  const res = await dataService.get('/sms/wells/service/total-afterservice-rate-odmperoem', { params: searchParams.value });
  pageInfo.value.totalCount = res.data.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function onClickSearch() {
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
  const fields = [
    { fieldName: 'atcNm' }, // 항목명
    { fieldName: 'totalCnt', dataType: 'number' }, // 합계
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
  ];

  const columns = [
    {
      fieldName: 'atcNm',
      header: t('MSG_TXT_DIV'),
      width: '150',
      displayCallback: (g, i) => {
        const { atcNm } = gridUtil.getRowValue(g, i.itemIndex);
        return divCd.find((x) => x.codeId === atcNm).codeName;
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
      fieldName: 'totalCnt',
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

  // data.setRows([
  // eslint-disable-next-line max-len
  //   { col1: 'A/S건', col2: '204,652', col3: '204,652', col4: '204,652', col5: '204,652', col6: '204,652', col7: '204,652', col8: '204,652', col9: '204,652', col10: '204,652', col11: '204,652', col12: '204,652', col13: '204,652', col14: '204,652' },
  // eslint-disable-next-line max-len
  //   { col1: 'A/S건', col2: '204,652', col3: '204,652', col4: '204,652', col5: '204,652', col6: '204,652', col7: '204,652', col8: '204,652', col9: '204,652', col10: '204,652', col11: '204,652', col12: '204,652', col13: '204,652', col14: '204,652' },
  // eslint-disable-next-line max-len
  //   { col1: 'A/S건', col2: '204,652', col3: '204,652', col4: '204,652', col5: '204,652', col6: '204,652', col7: '204,652', col8: '204,652', col9: '204,652', col10: '204,652', col11: '204,652', col12: '204,652', col13: '204,652', col14: '204,652' },
  // eslint-disable-next-line max-len
  //   { col1: 'A/S건', col2: '204,652', col3: '204,652', col4: '204,652', col5: '204,652', col6: '204,652', col7: '204,652', col8: '204,652', col9: '204,652', col10: '204,652', col11: '204,652', col12: '204,652', col13: '204,652', col14: '204,652' },
  // eslint-disable-next-line max-len
  //   { col1: 'A/S건', col2: '204,652', col3: '204,652', col4: '204,652', col5: '204,652', col6: '204,652', col7: '204,652', col8: '204,652', col9: '204,652', col10: '204,652', col11: '204,652', col12: '204,652', col13: '204,652', col14: '204,652' },
  // eslint-disable-next-line max-len
  //   { col1: 'A/S건', col2: '204,652', col3: '204,652', col4: '204,652', col5: '204,652', col6: '204,652', col7: '204,652', col8: '204,652', col9: '204,652', col10: '204,652', col11: '204,652', col12: '204,652', col13: '204,652', col14: '204,652' },
  // eslint-disable-next-line max-len
  //   { col1: 'A/S건', col2: '204,652', col3: '204,652', col4: '204,652', col5: '204,652', col6: '204,652', col7: '204,652', col8: '204,652', col9: '204,652', col10: '204,652', col11: '204,652', col12: '204,652', col13: '204,652', col14: '204,652' },
  // eslint-disable-next-line max-len
  //   { col1: 'A/S건', col2: '204,652', col3: '204,652', col4: '204,652', col5: '204,652', col6: '204,652', col7: '204,652', col8: '204,652', col9: '204,652', col10: '204,652', col11: '204,652', col12: '204,652', col13: '204,652', col14: '204,652' },
  // eslint-disable-next-line max-len
  //   { col1: 'A/S건', col2: '204,652', col3: '204,652', col4: '204,652', col5: '204,652', col6: '204,652', col7: '204,652', col8: '204,652', col9: '204,652', col10: '204,652', col11: '204,652', col12: '204,652', col13: '204,652', col14: '204,652' },
  // eslint-disable-next-line max-len
  //   { col1: 'A/S건', col2: '204,652', col3: '204,652', col4: '204,652', col5: '204,652', col6: '204,652', col7: '204,652', col8: '204,652', col9: '204,652', col10: '204,652', col11: '204,652', col12: '204,652', col13: '204,652', col14: '204,652' },
  // ]);
}
</script>
