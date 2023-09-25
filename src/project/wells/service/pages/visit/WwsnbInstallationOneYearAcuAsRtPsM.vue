<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC (배정관리)
 2. 프로그램 ID : [K-W-SV-U-0283M01] WwsnbInstallationOneYearAcuAsRtPsM - 실적_설치1년누적A/S율(품질)
 3. 작성자 : hyewon.kim
 4. 작성일 : 2022.12.13
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 실적_설치1년누적A/S율(품질)
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <template #header>
      <kw-page-header
        :options="['홈', '품질현황', '품질관리', '(품)실적_설치1년누적A/S율-ODM/OEM']"
      />
    </template>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
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
        <kw-search-item
          :label="t('MSG_TXT_PD_GRP')"
          colspan="2"
        >
          <kw-select
            v-model="searchParams.pdGrp"
            :options="pdGrpCdList"
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
import { useDataService, codeUtil, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import smsCommon from '~sms-wells/service/composables/useSnCode';
import { printElement } from '~common/utils/common';

const { t } = useI18n();

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
let cachedParams;

const searchParams = ref({
  baseY: dayjs().format('YYYY'), // 기준년도
  svType: '', // 서비스유형
  badDivide: '', // 불량구분
  pdGrp: '', // 상품그룹
  pdCd: '', // 상품명
});

const totalCount = ref(0);

// 서비스유형 중분류..공통코드 있을거 같은데...
// 전체, 제품A/S, 특별A/S, 제품원인
const serviceTypes = [
  { codeId: '3110', codeName: '제품A/S' },
  { codeId: '3112', codeName: '특별A/S' },
  { codeId: '3210', codeName: '제품원인' },
];

// 화면설계서 기재내용이..
// 서비스 > 실적..불량구분은 100, 400, 500, 700 만 사용
// 20230922...불량구분 다 나오도록
// const badCdValue = ['100R', '400R', '500R', '700R'];
// const badDvCdList = codes.BAD_DV_CD.filter((v) => badCdValue.includes(v.codeId));
// console.log('badDvCd >>>>>', badDvCdList);

// 상품그룹 필터링
const pdGrp = ['4', '5', '6', '7', '8', '9', '11', '91', '92', '93', '95', '96'];
const pdGrpCdList = codes.PD_GRP_CD.filter((v) => pdGrp.includes(v.codeId));

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
    fileName: '실적_설치1년누적AS율',
    timePostfix: true,
  });
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/ist-yone-acu-as-rt-ps/get-ist-yone-acu-as-rt-ps', { params: { ...cachedParams } });
  totalCount.value = res.data.length;

  const view = grdMainRef.value.getView();

  res.data[2].totalCnt = ((res.data[0].totalCnt / res.data[1].totalCnt) * 100).toFixed(2);
  res.data[2].col01 = ((res.data[0].col01 / res.data[1].col01) * 100).toFixed(2);
  res.data[2].col02 = ((res.data[0].col02 / res.data[1].col02) * 100).toFixed(2);
  res.data[2].col03 = ((res.data[0].col03 / res.data[1].col03) * 100).toFixed(2);
  res.data[2].col04 = ((res.data[0].col04 / res.data[1].col04) * 100).toFixed(2);
  res.data[2].col05 = ((res.data[0].col05 / res.data[1].col05) * 100).toFixed(2);
  res.data[2].col06 = ((res.data[0].col06 / res.data[1].col06) * 100).toFixed(2);
  res.data[2].col07 = ((res.data[0].col07 / res.data[1].col07) * 100).toFixed(2);
  res.data[2].col08 = ((res.data[0].col08 / res.data[1].col08) * 100).toFixed(2);
  res.data[2].col09 = ((res.data[0].col09 / res.data[1].col09) * 100).toFixed(2);
  res.data[2].col10 = ((res.data[0].col10 / res.data[1].col10) * 100).toFixed(2);
  res.data[2].col11 = ((res.data[0].col11 / res.data[1].col11) * 100).toFixed(2);
  res.data[2].col12 = ((res.data[0].col12 / res.data[1].col12) * 100).toFixed(2);

  view.getDataSource().setRows(res.data);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrdMain(data, view) {
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
      footer: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-left',
      },
    },
    {
      fieldName: 'totalCnt',
      header: t('MSG_TXT_SUM'),
      width: '110',
      styleName: 'text-right',
      numberFormat: '#,##0.##',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'totalCnt')) + Number(prod.getValue(4, 'totalCnt'));
          return sum;
        },
      },
    },
    {
      fieldName: 'm01',
      header: t('MSG_TXT_JAN'),
      width: '100',
      styleName: 'text-right',
      footer: {
        type: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'm01')) + Number(prod.getValue(4, 'm01'));
          return sum;
        },
      },
    },
    {
      fieldName: 'm02',
      header: t('MSG_TXT_FEB'),
      width: '100',
      styleName: 'text-right',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'm02')) + Number(prod.getValue(4, 'm02'));
          return sum;
        },
      },
    },
    {
      fieldName: 'm03',
      header: t('MSG_TXT_MAR'),
      width: '100',
      styleName: 'text-right',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'm03')) + Number(prod.getValue(4, 'm03'));
          return sum;
        },
      },
    },
    {
      fieldName: 'm04',
      header: t('MSG_TXT_APRI'),
      width: '100',
      styleName: 'text-right',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'm04')) + Number(prod.getValue(4, 'm04'));
          return sum;
        },
      },
    },
    {
      fieldName: 'm05',
      header: t('MSG_TXT_MAY'),
      width: '100',
      styleName: 'text-right',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'm05')) + Number(prod.getValue(4, 'm05'));
          return sum;
        },
      },
    },
    {
      fieldName: 'm06',
      header: t('MSG_TXT_JUN'),
      width: '100',
      styleName: 'text-right',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'm06')) + Number(prod.getValue(4, 'm06'));
          return sum;
        },
      },
    },
    {
      fieldName: 'm07',
      header: t('MSG_TXT_JUL'),
      width: '100',
      styleName: 'text-right',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'm07')) + Number(prod.getValue(4, 'm07'));
          return sum;
        },
      },
    },
    {
      fieldName: 'm08',
      header: t('MSG_TXT_AUG'),
      width: '100',
      styleName: 'text-right',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'm08')) + Number(prod.getValue(4, 'm08'));
          return sum;
        },
      },
    },
    {
      fieldName: 'm09',
      header: t('MSG_TXT_SEPT'),
      width: '100',
      styleName: 'text-right',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'm09')) + Number(prod.getValue(4, 'm09'));
          return sum;
        },
      },
    },
    {
      fieldName: 'm10',
      header: t('MSG_TXT_OCT'),
      width: '100',
      styleName: 'text-right',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'm10')) + Number(prod.getValue(4, 'm10'));
          return sum;
        },
      },
    },
    {
      fieldName: 'm11',
      header: t('MSG_TXT_NOV'),
      width: '100',
      styleName: 'text-right',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'm11')) + Number(prod.getValue(4, 'm11'));
          return sum;
        },
      },
    },
    {
      fieldName: 'm12',
      header: t('MSG_TXT_DECE'),
      width: '100',
      styleName: 'text-right',
      footer: {
        dataType: 'number',
        numberFormat: '#,##0',
        // eslint-disable-next-line no-unused-vars
        valueCallback(grid, column, footerIndex, columnFooter, value) {
          let sum = 0;
          const prod = grid.getDataSource();

          sum = Number(prod.getValue(3, 'm12')) + Number(prod.getValue(4, 'm12'));
          return sum;
        },
      },
    },
  ];

  const columnLayout = [
    'atcNm',
    'totalCnt',
    'm01',
    'm02',
    'm03',
    'm04',
    'm05',
    'm06',
    'm07',
    'm08',
    'm09',
    'm10',
    'm11',
    'm12',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.setFooters({ visible: true });
  view.rowIndicator.visible = true; // create number indicator column
}
</script>
