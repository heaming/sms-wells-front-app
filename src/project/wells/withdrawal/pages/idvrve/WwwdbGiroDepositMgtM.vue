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
    <!-- one-row -->
    <!-- :cols="2" -->
    <kw-search
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
            v-model="searchParams.fntDt"
            :label="t('MSG_TXT_DP_DT')"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PERF_DT')"
        >
          <!-- label="실적일자" -->
          <kw-date-picker v-model="searchParams.rveDt" />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_DP') + $t('MSG_TXT_ERR_KR')">
          <!-- 입금오류 -->
          <kw-option-group
            v-model="searchParams.errorChk"
            type="radio"
            :options="serachStandardOptionList"
          />
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>
        <kw-btn
          v-permission:create
          secondary
          dense
          grid-action
          :label="t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
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
          v-permission:create
          dense
          icon="upload_on"
          :label="$t('MSG_BTN_EXCEL_UP')"
          @click="onClickExcelUpload"
        />
        <!-- :label="$t('지로파일 업로드')" -->
        <kw-btn
          v-permission:download
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
          v-permission:create
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
          v-permission:create
          primary
          dense
          :label="t('MSG_BTN_DP_RGST')"
          @click="onClickCreate"
        />
        <!-- label="입금등록" -->
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
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

import { codeUtil, getComponentType, gridUtil, modal, notify, useDataService, useMeta, alert, confirm } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

// import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const now = dayjs();
// const { t } = useI18n();
const { currentRoute } = useRouter();
const { getConfig } = useMeta();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes('COD_PAGE_SIZE_OPTIONS', 'COD_MSG_RESO_TYPE', 'COD_EXCEL_UPD_RESULT_TYPE', 'PROCS_ERR_TP_CD', 'DP_MES_CD', 'SELL_TP_CD', 'DP_TP_CD');
const grdMainRef = ref(getComponentType('KwGrid'));
const file = ref(null);
// const { getters } = useStore();
// const userInfo = getters['meta/getUserInfo'];
// console.log(userInfo);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

// 오류유형
const serachStandardOptionList = [
  {
    codeId: '1',
    codeName: t('MSG_TXT_INC'), // 포함
    // codeName: '기준월',
  },
  {
    codeId: '2',
    // codeName: '적용월',
    codeName: t('MSG_TXT_NO_INC'), // 변경 될 수도 있어 채번은 나중에 등록 하겠음 ( 미포함 )
  },
];

const searchParams = ref({
  fntDt: now.format('YYYYMMDD'), // 입금일자
  rveDt: now.format('YYYYMMDD'), // 실적일자
  errorChk: '1',
});

let fileData = [];

const isUploadChk = ref(false);

let cachedParams;

let result = 0;
let giroResult = 0;
async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/giro-deposits/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  const res2 = await dataService.get('/sms/wells/withdrawal/idvrve/giro-deposits', { params: cachedParams });

  // console.log(res2.data);

  result = Number(res2.data.rveAmtSum);
  giroResult = Number(res2.data.giroFeeSum);

  data.checkRowStates(false);
  data.setRows(pages);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  data.checkRowStates(true);
}

// 조회 버튼
async function onClickSearch() {
  grdMainRef.value.getData().clearRows();

  isUploadChk.value = false;

  pageInfo.value.pageIndex = 1;

  cachedParams = {
    rveDt: searchParams.value.rveDt,
    fntDt: searchParams.value.fntDt,
    errorChk: searchParams.value.errorChk,

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

let paramData;
let gridSetData = [];

async function addRow() {
  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();

  // paramData = fileData;
  //
  paramData = fileData.filter((p1) => ['22'].includes(p1.giroDpMtrDvCd));

  // const dupArr = paramData.map((p1) => p1.rveDt);

  // const uniqueArr = dupArr.filter((element, index) => dupArr.indexOf(element) === index);

  const res = await dataService.post('/sms/wells/withdrawal/idvrve/giro-deposits/date-chk', paramData);

  paramData = res.data;

  let sum1 = 0;
  let sum2 = 0;

  grdMainRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  pageInfo.value.totalCount = 0;

  result = 0;
  giroResult = 0;

  paramData.forEach((data) => {
    if (data.giroDpMtrDvCd === '22') {
      // gridUtil.insertRowAndFocus(view, 0, {

      gridSetData.push({
        giroDpMtrDvCd: data.giroDpMtrDvCd, // 구분코드      2
        dpSn: data.dpSn, // 일련번호      7
        rveDt: data.fntDt, // 수납년        8
        fntDt: data.rveDt, // 이체년        8
        bnkCd: data.bnkcd, // 은행코드      7
        bnkBrncCd: data.bnkBrncCd, // 정보작성점    7
        giroIndxNo: data.giroIndxNo, // 색인번호      12
        giroInqNo: data.giroInqNo, // 조회번호      2null
        pyAmt: data.pyAmt, // 납입금액      13
        giroRveDvCd: data.giroRveDvCd, // 수납구분      1
        giroFeeDvCd: data.giroFeeDvCd, // 지로수수료    4
        rmkCn: data.rmkCn, // 비고          31
        cstKnm: data.cstKnm, // 고객명
        procsErrTpCd: data.procsErrTpCd,
        // cntrNo: `W${data.giroInqNo.substring(2, 13)}`,
        cntrNo: data.cntr,
        perfDt: data.rveDt, // 실적일
        rveAmt: data.pyAmt, // 납입금액
        giroFee: data.giroFeeDvCd,
        sellTpCd: '2',
        dpMesCd: '0401',
      });
      // });

      sum1 += Number(data.pyAmt);
      sum2 += Number(data.giroFeeDvCd);
    }
  });

  result = sum1;
  giroResult = sum2;

  dataSource.setRows(gridSetData);

  gridSetData = [];

  isUploadChk.value = true;
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/giro-deposits/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onUpdateFileUpload() {
  if (isEmpty(file.value)) {
    return;
  }
  fileData = [];
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
      if (array[i].trim()) {
        // console.log(array[i].trim().length);
        // if(array[i].substring(52, 2).trim() ){

        // }
        console.log(array[i].substring(51, 53).trim());

        // if (array[i].substring(51, 53).trim() === '00') {
        fileData[i] = { // AS-IS 기준
          giroDpMtrDvCd: nullDefaultValue(array[i].substring(0, 2).trim(), null), // 구분코드      2
          dpSn: nullDefaultValue(array[i].substring(2, 9).trim(), null), // 일련번호      7
          rveDt: nullDefaultValue(array[i].substring(9, 17).trim(), null), // 수납년        8
          fntDt: nullDefaultValue(array[i].substring(17, 25).trim(), null), // 이체년        8
          bnkCd: nullDefaultValue(array[i].substring(25, 32).trim(), null), // 은행코드      7
          bnkBrncCd: nullDefaultValue(array[i].substring(32, 39).trim(), null), // 정보작성점    7
          giroIndxNo: nullDefaultValue(array[i].substring(39, 51).trim(), null), // 색인번호      12
          giroInqNo: nullDefaultValue(array[i].substring(53, 71).trim(), null), // 조회번호      18
          pyAmt: nullDefaultValue(array[i].substring(71, 84).trim(), null), // 납입금액      13
          giroRveDvCd: nullDefaultValue(array[i].substring(84, 85).trim(), null), // 수납구분      1
          giroFeeDvCd: nullDefaultValue(array[i].substring(85, 89).trim(), null), // 지로수수료    4
          rmkCn: nullDefaultValue(array[i].substring(89, 120).trim(), null), // 비고          31
        };
        // } else {
        //   fileData[i] = { // TO-BE 기준
        //     giroDpMtrDvCd: nullDefaultValue(array[i].substring(0, 2).trim(), null), // 구분코드      2
        //     dpSn: nullDefaultValue(array[i].substring(2, 9).trim(), null), // 일련번호      7
        //     rveDt: nullDefaultValue(array[i].substring(9, 17).trim(), null), // 수납년        8
        //     fntDt: nullDefaultValue(array[i].substring(17, 25).trim(), null), // 이체년        8
        //     bnkCd: nullDefaultValue(array[i].substring(25, 32).trim(), null), // 은행코드      7
        //     bnkBrncCd: nullDefaultValue(array[i].substring(32, 39).trim(), null), // 정보작성점    7
        //     giroIndxNo: nullDefaultValue(array[i].substring(39, 51).trim(), null), // 색인번호      12
        //     giroInqNo: nullDefaultValue(array[i].substring(51, 71).trim(), null), // 조회번호      20
        //     pyAmt: nullDefaultValue(array[i].substring(71, 84).trim(), null), // 납입금액      13
        //     giroRveDvCd: nullDefaultValue(array[i].substring(84, 85).trim(), null), // 수납구분      1
        //     giroFeeDvCd: nullDefaultValue(array[i].substring(85, 89).trim(), null), // 지로수수료    4
        //     rmkCn: nullDefaultValue(array[i].substring(89, 120).trim(), null), // 비고          31

        //   };
        // }
      }
    }

    // giroSaveUpload();
    addRow();
  };
  reader.readAsText(file.value.nativeFile);
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  // 그리드 리스트
  const gridData = gridUtil.getAllRowValues(view);

  paramData = fileData;

  // console.log(paramData);
  // console.log(paramData.length);

  if (isUploadChk.value === false) {
    notify(t('MSG_ALT_ULD_PRGS_GIRO_FILE_NOT')); // 업로드 진행 한 지로 파일이 없습니다.
    return;
  }

  if (gridData.length < 1) {
    notify(t('MSG_ALT_NO_DATA'));
    return;
  }

  let count = 0;

  gridData.forEach((p1) => {
    if (p1.procsErrTpCd !== '3') {
      notify('오류 정보 확인 후 저장이 필요합니다.');
      count += 1;
      return false;
    }
  });

  if (count > 0) {
    return;
  }

  const res = await dataService.post('/sms/wells/withdrawal/idvrve/giro-deposits/ledg-iz', paramData);

  const resResult = res.data;

  // console.log(resResult);

  if (resResult.itgDpProcsYCnt > 0) {
    await alert(t('MSG_ALT_ITG_DP_RGST_CPRCNF_PROCS_ULD_NOT')); // '통합입금에 등록된 후 대사 처리된 Data는 업로드할 수 없습니다.'
    return false;
  }
  if (resResult.chkCnt > 0) {
    if (await confirm(t('MSG_ALT_RVE_DT_ULD_DL_ULD', [dayjs(resResult.fntDt).format('YYYY-MM-DD')]))) { // "수납일자 '2023-02-27'에 업로드된 Data를 삭제 후 재업로드 하시겠습니까?"
      await dataService.post('/sms/wells/withdrawal/idvrve/giro-deposits', paramData);
      await onClickSearch();
      notify(t('MSG_ALT_SAVE_DATA'));
    }
  } else {
    await dataService.post('/sms/wells/withdrawal/idvrve/giro-deposits', paramData);
    await onClickSearch();
    notify(t('MSG_ALT_SAVE_DATA'));
  }
  isUploadChk.value = false;
}

async function onClickExcelUpload() {
  const view = grdMainRef.value.getView();

  const gridData = gridUtil.getAllRowValues(view);

  // console.log(gridData);

  if (gridData.length > 0) {
    if (!await confirm('조회 또는 입력한 내용이 초기화됩니다.지로업로드를 진행하시겠습니까?')) { return; }
  }

  file.value = null;
  attachFileRef.value.reset();
  attachFileRef.value.pickFiles();
}

let createParam;
// 생성버튼
async function onClickCreate() {
  if (isUploadChk.value === true) {
    notify(t('저장 후 이용해주세요.')); // 업로드 진행 한 지로 파일이 없습니다.
    return;
  }

  if (await confirm('입금등록을 진행하시겠습니까?')) {
    createParam = cloneDeep(searchParams.value);

    await dataService.post('/sms/wells/withdrawal/idvrve/giro-deposits/create', createParam);

    onClickSearch();
  }
}

// 오류 처리
async function onClickErrProcs() {
  if (!searchParams.value.fntDt) {
    await notify(t('MSG_TXT_DP_DT ') + t('MSG_TXT_IS_INP')); // 입금일자를 입력해주세요.
    return;
  }
  await modal({
    component: 'WwwdbGiroDepositErrorProcessingMgtP',
    componentProps: { fntDt: searchParams.value.fntDt, rveDt: searchParams.value.rveDt },
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'sumMain' },
    { fieldName: 'kwGrpCoCd' },
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
      header: t('MSG_TXT_CNTR_DTL_NO'),
      // header: '계약상세번호',
      width: '150',
      styleName: 'text-left',
      headerSummary: {
        styleName: 'text-center',
        text: t('MSG_TXT_SUM'),
      },
    },
    { fieldName: 'cstKnm',
      header: t('MSG_TXT_CST_NM'),
      // header: '고객명',
      width: '147',
      styleName: 'text-center' },
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
        valueCallback() {
          // 표시하고 싶은 값을 return
          return result;
        },
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
        valueCallback() {
          // 표시하고 싶은 값을 return
          return giroResult;
        },
      },
      numberFormat: '#,##0',
      width: '221',
      styleName: 'text-right' },
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_SEL_TYPE'),
      // header: '판매유형',
      options: codes.SELL_TP_CD,
      width: '78',
      styleName: 'text-left' },
    { fieldName: 'dpMesCd',
      header: t('MSG_TXT_DP_TP'),
      options: codes.DP_TP_CD,
      // header: '입금유형',
      width: '104',
      styleName: 'text-center' },
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

  // 체크박스 설정
  // view.onCellClicked = (grid, clickData) => {
  //   if (clickData.cellType === 'data') {
  //     grid.checkItem(clickData.itemIndex, !grid.isCheckedItem(clickData.itemIndex));
  //   }
  // };

  // summary 병합
  view.layoutByColumn('cntrNo').summaryUserSpans = [{ colspan: 4 }];
  view.layoutByColumn('sellTpCd').summaryUserSpans = [{ colspan: 4 }];

  // 헤더쪽 합계 행고정, summary
  // view.headerSummaries.visible = true;
  // 헤더쪽 합계 행고정, summary
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        // styleName: 'blue-column', //  개별 css 스타일 적용 필요시
        height: 40,
      },
    ],
  });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}

</script>
<style scoped></style>
