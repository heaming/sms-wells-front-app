<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNY
2. 프로그램 ID : WwsnbPerformanceNewProductMThreeOdmOemM(K-W-SV-U-0247M01) - 실적_신제품 M+3-ODM/OEM
3. 작성자 : gs.piit231
4. 작성일 : 2023.10.11
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- 업무유형별현황 (http://localhost:3000/#/service/wwsnb-performance-new-product-m-three-odm-oem)
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <template #header>
      <kw-page-header
        :options="['홈','품질현황','품질관리','실적_신제품 M+3-ODM/OEM']"
      />
    </template>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <!-- 기준년도 -->
        <kw-search-item :label="$t('MSG_TXT_BASE_YEAR')">
          <kw-date-picker
            v-model="searchParams.baseY"
            type="year"
          />
        </kw-search-item>
        <!-- 중분류(서비스유형) -->
        <kw-search-item :label="$t('MSG_TXT_PD_MCLSF_ID') + '(' + $t('MSG_TXT_SV_TP') + ')'">
          <kw-select
            v-model="searchParams.serviceTypes"
            :options="serviceTypes"
            first-option="all"
          />
        </kw-search-item>
        <!-- 소분류(불량구분) -->
        <kw-search-item :label="$t('TXT_MSG_PD_LCLSF_ID') + '(' + $t('MSG_TXT_BAD_DV') + ')'">
          <kw-select
            v-model="searchParams.badDvCd"
            :options="optionBadDvCdList"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!-- 상품그룹 -->
        <kw-search-item :label="$t('MSG_TXT_PD_GRP')">
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="optionPdGrpList"
            first-option="all"
            class="w150"
            @change="changePdGrpCd"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="products"
            first-option="all"
            option-label="cdNm"
            option-value="cd"
            :disable="searchParams.pdGrpCd === '' "
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="pageInfo.totalCount" />
          <!-- 단위:원 -->
          <span class="ml8">({{ $t('MSG_TXT_UNIT_CUR_WON') }})</span>
        </template>
        <!-- 인쇄 -->
        <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
          @click="onClickPrintEl"
        />
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- M+3 출시일 등록 -->
        <kw-btn
          primary
          dense
          label="M+3 출시일 등록"
          @click="onClickPopup"
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
import { codeUtil, useDataService, useGlobal, getComponentType, useMeta, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
// import { isEmpty, cloneDeep } from 'lodash-es';
import { cloneDeep } from 'lodash-es';
import smsCommon from '~sms-wells/service/composables/useSnCode';
import { printElement } from '~common/utils/common';

const { t } = useI18n();
const { notify, modal } = useGlobal();
const { getConfig } = useMeta();
const { getPartMaster } = smsCommon();

const dataService = useDataService();
const grdRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'PD_GRP_CD',
  'BAD_DV_CD',
);

// 서비스유형
const serviceTypes = [
  { codeId: '3110', codeName: '제품A/S' },
  { codeId: '3112', codeName: '특별A/S' },
  { codeId: '3210', codeName: '제품원인' },
];

// 불량구분
const arrBadDvCd = ['100R', '400R', '500R', '700R'];
const optionBadDvCdList = ref([]);
optionBadDvCdList.value = codes.BAD_DV_CD.filter((v) => arrBadDvCd.includes(v.codeId));

// 상품그룹
const arrPdGrp = ['5', '7', '8', '9', '91', '92', '93', '95', '96'];
const optionPdGrpList = ref([]);
optionPdGrpList.value = codes.PD_GRP_CD.filter((v) => arrPdGrp.includes(v.codeId));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const searchParams = ref({
  baseY: dayjs().format('YYYY'),
  serviceTypes: '',
  badDvCd: '',
  pdGrpCd: '',
  pdCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const products = ref([]);
async function changePdGrpCd() {
  if (searchParams.value.pdGrpCd) {
    products.value = await getPartMaster(
      '4',
      searchParams.value.pdGrpCd,
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
    console.log('products.value >>>', products.value);
  } else products.value = [];
  searchParams.value.pdCd = '';
}

async function fetchData() {
  console.log('cachedParams >>>', cachedParams);
  const res = await dataService.get('/sms/wells/service/performance-new-pdct-m-three-odm-oem', { params: cachedParams });
  console.log('res.data >>>>', res.data);
  pageInfo.value.totalCount = res.data.length;

  const view = grdRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

// 조회
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 인쇄
const pageRef = ref();
async function onClickPrintEl() {
  printElement(pageRef);
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  await notify('작업예정');
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

function initGrid(data, view) {
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

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}

</script>
