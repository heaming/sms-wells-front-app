<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : idvrve
2. 프로그램 ID : WwwdbGiroDepositMgtM - 지로 입금 관리
3. 작성자 : heungjun.lee
4. 작성일 : 2023.02.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 지로 입금 관리 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_DP_DT')"
          required
        >
          <!-- label="입금일자" -->
          <kw-date-picker
            v-model="searchParams.rveDt"
            :label="t('MSG_TXT_DP_DT')"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PERF_DT')"
        >
          <!-- label="실적일자" -->
          <kw-date-picker v-model="searchParams.fntDt" />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-file
          v-show="false"
          ref="attachFileRef"
          v-model="file"
          accept=".txt"
          @update:model-value="onUpdateFileUpload"
        />
        <!-- :updatable="false" -->
        <kw-btn
          dense
          icon="upload_on"
          :label="$t('MSG_BTN_GIRO_FILE_ULD')"
          @click="onClickExcelUpload"
        />
        <!-- :label="$t('지로파일 업로드')" -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <!-- label="엑셀 다운로드" -->
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          secondary
          dense
          :label="t('MSG_TIT_ERR_PROCS')"
          @click="onClickErrProcs"
        />
        <!-- label="오류처리" -->
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          primary
          dense
          :label="t('MSG_BTN_DP_RGST')"
          @click="onClickCreate"
        />
        <!-- label="입금등록" -->
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
        name="grdMain"
        @init="initGrid"
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

import { codeUtil, getComponentType, gridUtil, modal, notify, useDataService } from 'kw-lib';
import dayjs from 'dayjs';
// import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const now = dayjs();
// const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes('COD_PAGE_SIZE_OPTIONS', 'COD_MSG_RESO_TYPE', 'COD_EXCEL_UPD_RESULT_TYPE', 'PROCS_ERR_TP_CD', 'DP_MES_CD');
const grdMainRef = ref(getComponentType('KwGrid'));
const file = ref(null);
const { getters } = useStore();
const userInfo = getters['meta/getUserInfo'];
console.log(userInfo);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

const searchParams = ref({
  rveDt: now.format('YYYYMMDD'), // 입금일자
  fntDt: now.format('YYYYMMDD'), // 실적일자
});

let cachedParams;

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/giro-deposits/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  data.checkRowStates(false);
  data.setRows(pages);
  data.checkRowStates(true);

  view.resetCurrent();
}

// 조회 버튼
async function onClickSearch() {
  grdMainRef.value.getData().clearRows();

  pageInfo.value.pageIndex = 1;

  cachedParams = {
    rveDt: searchParams.value.rveDt,
    fntDt: searchParams.value.fntDt,
    giroOcrBndlYm: searchParams.value.rveDt.substring(0, 6),
  };

  await fetchData();
}

function nullDefaultValue(a, b) {
  if (a === undefined || a === '') {
    if (b === undefined || b === '') {
      a = '';
    } else {
      a = b;
    }
  }
  return a;
}

const attachFileRef = ref();

const fileData = [{}];

let paramData;

async function giroSaveUpload() {
  if (fileData.length < 0) {
    notify(t('MSG_ALT_NO_DATA'));
    return;
  }

  paramData = fileData;

  await dataService.post('/sms/wells/withdrawal/idvrve/giro-deposits', paramData);
  await fetchData();
  notify(t('MSG_ALT_SAVE_DATA'));
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/giro-deposits/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: `${t('MSG_TXT_GIRO')}OCR_Excel`,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onUpdateFileUpload() {
  if (file.value === null || file.value.length === 0) {
    return;
  }
  console.log(file.value.nativeFile);
  // 첨부파일 정보를 함께 넘겨줍시다.
  const reader = new FileReader();
  reader.onload = () => {
    // console.log(reader.result);
    const array = reader.result.toString().split('\n');

    for (let i = 0; i < array.length; i += 1) {
      // console.log(array[i].substring(0, 2));// 구분코드      2
      // console.log(array[i].substring(2, 9));// 일련번호      7
      // console.log(array[i].substring(9, 17)); // 수납년        8
      // console.log(array[i].substring(17, 25)); // 이체년        8
      // console.log(array[i].substring(25, 32)); // 은행코드      7
      // console.log(array[i].substring(32, 39)); // 정보작성점    7
      // console.log(array[i].substring(39, 51)); // 색인번호      12
      // console.log(array[i].substring(51, 71)); // 조회번호      20
      // console.log(array[i].substring(71, 84)); // 납입금액      13
      // console.log(array[i].substring(84, 85)); // 수납구분      1
      // console.log(array[i].substring(85, 89)); // 지로수수료    4
      // console.log(array[i].substring(89, 120)); // 비고          31
      fileData[i] = {
        giroDpMtrDvCd: nullDefaultValue(array[i].substring(0, 2).trim(), null), // 구분코드      2
        dpSn: nullDefaultValue(array[i].substring(2, 9).trim(), null), // 일련번호      7
        rveDt: nullDefaultValue(array[i].substring(9, 17).trim(), null), // 수납년        8
        fntDt: nullDefaultValue(array[i].substring(17, 25).trim(), null), // 이체년        8
        bnkcd: nullDefaultValue(array[i].substring(25, 32).trim(), null), // 은행코드      7
        bnkBrncCd: nullDefaultValue(array[i].substring(32, 39).trim(), null), // 정보작성점    7
        giroIndxNo: nullDefaultValue(array[i].substring(39, 51).trim(), null), // 색인번호      12
        giroInqNo: nullDefaultValue(array[i].substring(51, 71).trim(), null), // 조회번호      2null
        pyAmt: nullDefaultValue(array[i].substring(71, 84).trim(), null), // 납입금액      13
        giroRveDvCd: nullDefaultValue(array[i].substring(84, 85).trim(), null), // 수납구분      1
        giroFeeDvCd: nullDefaultValue(array[i].substring(85, 89).trim(), null), // 지로수수료    4
        rmkCn: nullDefaultValue(array[i].substring(89, 120).trim(), null), // 비고          31
      };
    }
    giroSaveUpload();
  };
  reader.readAsText(file.value.nativeFile);
}

async function onClickExcelUpload() {
  attachFileRef.value.pickFiles();
}

// let createParam;
// 생성버튼
// async function onClickCreate() {
//   notify(t('개발중입니다.'));
//   // createParam = cloneDeep(searchParams.value);

//   // await dataService.post('/sms/wells/withdrawal/idvrve/giro-deposits/create', createParam);
//   // notify(t('MSG_ALT_SAVE_DATA'));
// }

// 오류 처리
async function onClickErrProcs() {
  await modal({
    component: 'WwwdbGiroDepositErrorProcessingMgtP',
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cstKnm' },
    { fieldName: 'rveDt' },
    { fieldName: 'perfDt' },
    { fieldName: 'rveAmt', dataType: 'number' },
    { fieldName: 'giroFee', dataType: 'number' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'dpMesCd' },
    { fieldName: 'procsErrTpCd' },
    { fieldName: 'dgCntrNo' },
  ];

  const columns = [
    { fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_NO'),
      // header: '계약번호',
      width: '121',
      styleName: 'text-left' },
    { fieldName: 'cstKnm',
      header: t('MSG_TXT_CST_NM'),
      // header: '고객명',
      width: '147',
      styleName: 'text-left' },
    { fieldName: 'rveDt',
      header: t('MSG_TXT_DP_DT'),
      datetimeFormat: 'date',
      // header: '입금일',
      width: '131',
      styleName: 'text-center' },
    { fieldName: 'perfDt',
      header: t('MSG_TXT_PERF_DT'),
      datetimeFormat: 'date',
      // header: '실적일',
      width: '132',
      styleName: 'text-center' },
    { fieldName: 'rveAmt',
      header: t('MSG_TXT_DP_AMT'),
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      // header: '입금금액',
      width: '211',
      numberFormat: '#,##0',
      styleName: 'text-right' },
    { fieldName: 'giroFee',
      header: t('MSG_TXT_FEE'),
      // header: '수수료',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      numberFormat: '#,##0',
      width: '221',
      styleName: 'text-right' },
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_SEL_TYPE'),
      // header: '판매유형',
      width: '78',
      styleName: 'text-left' },
    { fieldName: 'dpMesCd',
      header: t('MSG_TXT_DP_TP'),
      options: codes.DP_MES_CD,
      // header: '입금유형',
      width: '104',
      styleName: 'text-left' },
    { fieldName: 'procsErrTpCd',
      header: t('MSG_TXT_ERR_KR'),
      options: codes.PROCS_ERR_TP_CD,
      // header: '오류',
      width: '161',
      styleName: 'text-left' },
    { fieldName: 'dgCntrNo',
      header: t('MSG_TXT_DG_CNTR_DTL_NO'),
      // header: '대표 계약상세번호',
      width: '150',
      styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
}

</script>
<style scoped></style>
