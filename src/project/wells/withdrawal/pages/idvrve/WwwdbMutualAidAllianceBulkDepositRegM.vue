<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID : WwdbMutualAidAllianceBulkDepositRegM - 상조제휴 일괄입금 등록
3. 작성자 : heungjun.lee
4. 작성일 : 2023.02.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 상조제휴 일괄입금 등록 조회 및 등록한다.
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="2"
      one-row
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_TASK_DIV')"
          required
        >
          <!-- label="업무구분" -->
          <kw-select
            v-model="searchParams.lifAlncDvCd"
            :options="codes.LIF_ALNC_DV_CD"
            rules="required"
            :label="t('MSG_TXT_TASK_DIV')"
          />
        </kw-search-item>
        <!-- label="상조입금월" -->
        <kw-search-item
          :label="t('MSG_TXT_MUTU_DP_MM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.lifSpptYm"
            :label="t('MSG_TXT_MUTU_DP_MM')"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <!-- label="실적일자" -->
        <!-- <kw-search-item
          :label="t('MSG_TXT_PERF_DT')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfDt"
            :label="t('MSG_TXT_PERF_DT')"
            rules="required"
          />
        </kw-search-item> -->
      </kw-search-row>
      <!-- <kw-search-row>
        label="수납일자"
        <kw-search-item
          :label="t('MSG_TXT_RVE_DT')"
          required
        >
          <kw-date-picker
            v-model="searchParams.rveDt"
            :label="t('MSG_TXT_RVE_DT')"
            rules="required"
          />
        </kw-search-item>
        label="수납코드"
        <kw-form-item
          :label="t('MSG_TXT_RVE_CD')"
          required
        >
          <kw-input
            v-model="searchParams.rveCd"
            icon="search"
            type="text"
            :label="$t('MSG_TXT_RVE_CD')"
            clearable
            mask="#####"
            @keydown="onKeyDownSelectRveCd"
            @click-icon="onClickSelectRveCd"
            @clear="onClearSelectRveCd"
          />
          <kw-input
            v-model="searchParams.rveNm"
            :disable="true"
            placeholder=""
          />
        </kw-form-item>
        label="통합입금번호"
        <kw-form-item
          :label="t('MSG_TXT_ITG_DP_NO')"
        >
          <kw-input
            v-model="searchParams.itgDpNo"
            :readonly="true"
            icon="search"
            clearable
            @click-icon="onClickSelectIntegrationDeposit"
            @keydown="onKeyDownSelectIntegrationDeposit"
            @clear="onClearSelectIntegrationDeposit"
          />
        </kw-form-item>
      </kw-search-row> -->
    </kw-search>

    <div class="result-area">
      <h3>{{ t('MSG_TXT_DP_IZ') }}</h3>
      <!-- <h3>입금내역</h3> -->
      <kw-grid
        ref="grdSubRef"
        :visible-rows="1"
        @init="initGrid2"
      />
      <h3>
        <!-- 입금내역 상세 -->
        {{ t('MSG_TXT_DP_IZ_DTL') }}
        <ul
          v-if="false"
          class="kw-notification"
        >
          <li>
            <span class="kw-fc--primary">{{ t('MSG_TXT_INQR_NOT_STAT_EXCEL_DLD') }}</span>
            <!-- <span class="kw-fc--primary">조회하지 않은상태에서도 엑셀다운이 가능합니다.</span> -->
          </li>
        </ul>
      </h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
          <!-- <span class="ml8">(단위:원)</span> -->
        </template>
        <!-- <kw-file
          v-show="false"
          ref="attachFileRef"
          v-model="file"
          :updatable="false"
          accept=".xlsx, .xls, .csv"
          @update:model-value="onUpdateFileUpload"
        />
        <kw-btn
          icon="upload_on"
          dense
          secondary
          :label="t('임시 업로드')"
          @click="onClickExcelUpload2"
        />
        <kw-btn
          primary
          dense
          :label="t('임시 저장')"
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        /> -->
        <!-- <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_TEMP_DOWN')"
          @click="onClickTemplateDownload"
        /> -->
        <!-- label="양식다운로드" -->

        <kw-btn
          v-permission:create
          icon="upload_on"
          dense
          secondary
          :label="t('MSG_TXT_EXCEL_UPLOAD')"
          @click="onClickExcelUpload"
        />
        <!-- label="엑셀업로드" -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <!-- label="엑셀다운로드" -->
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:create
          primary
          dense
          :label="t('MSG_BTN_CNTN_CREATE')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickCreate"
        />
        <!-- label="생성" -->
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

import dayjs from 'dayjs';
import { codeUtil, defineGrid, getComponentType, gridUtil, modal, notify, useDataService, useMeta, confirm, alert } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const dataService = useDataService();
const now = dayjs();
const { t } = useI18n();
// eslint-disable-next-line no-unused-vars
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref();
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'LIF_ALNC_DV_CD',
);

// const totalCount = ref(0);
// const failedCount = ref(0);
// const file = ref(null);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10, // Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const searchParams = ref({
  lifSpptYm: dayjs().subtract(1, 'month').format('YYYYMM'),
  perfDt: now.format('YYYYMMDD'), // 실적일자
  rveDt: now.format('YYYYMMDD'), // 수납일자
  rveCd: '', // 수납코드
  rveNm: '',
  itgDpNo: '', // 통합입금번호
  lifAlncDvCd: '30', // 제휴코드
});

// const dpBlam = ref(0);
// const dpDtm = ref();

let cachedParams;

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/mutual-alliance-bulk-deposit/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  data.checkRowStates(false);
  data.setRows(pages);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  data.checkRowStates(true);
}

async function fetchSubData() {
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/mutual-alliance-bulk-deposit', { params: cachedParams });
  const pages = [res.data];

  const view = grdSubRef.value.getView();
  const data = view.getDataSource();

  data.checkRowStates(false);
  data.setRows(pages);

  // data.setValue(0, 'dpBlam', dpBlam.value);
  // data.setValue(0, 'dpDtm', dpDtm.value);

  view.resetCurrent();
}

// 조회 버튼
async function onClickSearch() {
  grdMainRef.value.getData().clearRows();

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
  await fetchSubData();
}

// // 수납코드 조회 팝업
// async function onClickSelectRveCd() {
//   const { result, payload } = await modal({ component: 'ZwwdyDivisionReceiveCodeRegP',
//     componentProps: { rveCd: searchParams.value.rveCd, rveNm: searchParams.value.rveNm },
//   });
//   console.log(payload);
//   if (result) {
//     console.log(payload);
//     searchParams.value.rveCd = payload.rveCd;
//     searchParams.value.rveNm = payload.rveNm;
//   }
// }

// // 통합입금번호
// async function onClickSelectIntegrationDeposit() {
//   const { result, payload } = await modal({
//     component: 'WwdbIntegrationDepositListP',
//     componentProps: { itgDpNo: searchParams.value.itgDpNo },
//   });

//   if (result) {
//     searchParams.value.itgDpNo = payload.itgDpNo; // 입금잔액

//     if (payload.dpBlam || payload.dpDtm) {
//       const view = grdSubRef.value.getView();
//       const data = view.getDataSource();
//       console.log(payload.dpBlam);
//       console.log(data);

//       data.checkRowStates(false);
//       data.setValue(0, 'dpBlam', payload.dpBlam);
//       data.setValue(0, 'dpDtm', payload.dpDtm);

//       dpBlam.value = payload.dpBlam;
//       dpDtm.value = payload.dpDtm;
//     }
//   }
// }

// async function onKeyDownSelectRveCd() {
//   searchParams.value.rveNm = '';
// }

// async function onClearSelectRveCd() {
//   searchParams.value.rveCd = '';
//   searchParams.value.rveNm = '';
// }

// async function onKeyDownSelectIntegrationDeposit() {
//   const view = grdSubRef.value.getView();
//   const data = view.getDataSource();
//   data.setValue(0, 'dpBlam', 0);
//   data.setValue(0, 'dpDtm', '');
//   searchParams.value.itgDpNo = '';
//   dpBlam.value = 0;
//   dpDtm.value = '';
// }

// async function onClearSelectIntegrationDeposit() {
//   const view = grdSubRef.value.getView();
//   const data = view.getDataSource();
//   data.setValue(0, 'dpBlam', 0);
//   data.setValue(0, 'dpDtm', '');
//   searchParams.value.itgDpNo = '';
//   dpBlam.value = 0;
//   dpDtm.value = '';
// }

async function onClickReset() {
  // const view = grdSubRef.value.getView();
  // const data = view.getDataSource();
  // data.setValue(0, 'dpBlam', 0);
  // data.setValue(0, 'dpDtm', '');
  searchParams.value.itgDpNo = '';
  // dpBlam.value = 0;
  // dpDtm.value = '';
}

async function onClickCreate() {
  // const view = grdMainRef.value.getView();
  const view2 = grdSubRef.value.getView();
  const checkRows = gridUtil.getAllRowValues(view2);

  if (!isEmpty(checkRows[0].dpDtm)) {
    await alert('이미 생성 된 입금내역이 존재합니다.');
    return;
  }

  const lifAlncDvNm = codes.LIF_ALNC_DV_CD.filter((data) => data.codeId === searchParams.value.lifAlncDvCd);

  if (!await confirm(t('MSG_ALT_IS_MUTU_DP_MM_CREATE', [
    lifAlncDvNm[0].codeName,
    dayjs(searchParams.value.lifSpptYm).format('YYYY-MM')]))) { return; }

  const date = dayjs().subtract(1, 'month').format('YYYYMM');

  if (date !== searchParams.value.lifSpptYm) {
    await alert('상조입금 생성은 전월만 가능합니다.');
    return;
  }

  const { amtSum } = view2.getValues(0);

  const {
    result,
  } = await modal({
    component: 'WwwdbMutualAidAllianceDepositRegCreateP',
    componentProps: { lifAlncDvCd: searchParams.value.lifAlncDvCd,
      lifSpptYm: searchParams.value.lifSpptYm,
      dpObjAmtSum: amtSum },
  });

  if (result) {
    notify(t('MSG_ALT_CRT_FSH'));
    await onClickSearch();
  }
}

// const attachFileRef = ref();

// async function onClickExcelUpload2() {
//   attachFileRef.value.pickFiles();
// }

async function searchTemplateFile(data) {
  let fileName;

  if (data === '30') {
    fileName = 'FOM_WDA_00011'; // 웰스 399
  } else if (data === '41') {
    fileName = 'FOM_WDA_00012'; // 포인트 플러스
  } else {
    fileName = 'FOM_WDA_00013'; // 플래너 상조
  }
  return fileName;
}

async function onClickExcelUpload() {
  const lifAlncDvNm = codes.LIF_ALNC_DV_CD.filter((data) => data.codeId === searchParams.value.lifAlncDvCd);

  if (!await confirm(t('MSG_ALT_IS_MUTU_DP_MM_UPLOAD', [
    lifAlncDvNm[0].codeName,
    dayjs(searchParams.value.lifSpptYm).format('YYYY-MM')]))) return;

  const apiUrl = `/sms/wells/withdrawal/idvrve/mutual-alliance-bulk-deposit/${searchParams.value.lifAlncDvCd}/${searchParams.value.lifSpptYm}/excel-upload`;

  const fileName = await searchTemplateFile(searchParams.value.lifAlncDvCd);

  const templateId = fileName;

  const {
    result,
  } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });
  // if (result && payload.status === 'S') {
  if (result) {
    notify(t('MSG_ALT_SAVE_DATA'));
    await onClickSearch();
  }
}

// 엑셀 읽기
// async function readExcel() {
//   // 업로드 된 엑셀 파일을 서버에 전송해서 복호환 결과를 받는다.
//   // 2번째 파라미터 : 업로드엑셀 컬럼 순서대로 dataService에 매핑할 fieldName을 입력한다.
//   // 3번째 파라미터 : skip header line 수(default = 1)
//   const data = await fileUtil.readExcel(
//     file.value.nativeFile,
//     ['co1',
//       'lifSpptYm',
//       'co1',
//       'lifCntrNo',
//       'lifCntrSn',
//       'lifAlncPdCd', // 상품
//       'lifAlncPdNm', // 상품명
//       'co1', // 행사일자
//       'co1', // 납부
//       'co1', // 누계
//       'co1', // 부금금액
//       'co1', // 부금누계
//       'amt', // 지원금액
//       'lifRepAmt', // 지원누계
//       'lifSpptAggAmt', // 환수금액
//       'welsCntrNo', // 회원코드
//       'welsCntrSn', // 일련번호
//     ],
//     7,
//   );

//   return data.map((e) => ({
//     ...e,
//   }
//   ));
// }

// async function onUpdateFileUpload() {
// // 엑셀 데이터 읽기(DRM 해제 처리)
//   const messageResources = await readExcel();
//   console.log(messageResources);

//   const result = messageResources.filter((el) => el.lifSpptYm);

//   result.forEach((data) => { data.lifAlncDvCd = searchParams.value.lifAlncDvCd; });

//   console.log(result);
//   const view = grdMainRef.value.getView();
//   const data = view.getDataSource();

//   // Grid 데이터 세팅
//   data.clearRows();
//   data.addRows(result);

//   // 성공/실패 건수 초기화
//   totalCount.value = result.length;
//   failedCount.value = 0;
// }

// async function onClickSave() {
//   const view = grdMainRef.value.getView();
//   // 그리드 리스트
//   const gridData = gridUtil.getAllRowValues(view);

//   await dataService.post('/sms/wells/withdrawal/idvrve/mutual-alliance-bulk-deposit', gridData);
//   await fetchData();
//   notify(t('MSG_ALT_SAVE_DATA'));
// }

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/mutual-alliance-bulk-deposit/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 엑셀 양식 다운로드
// async function onClickTemplateDownload() {
//   const fileName = await searchTemplateFile(searchParams.value.lifAlncDvCd);

//   await getStandardFormFile(fileName);
// }

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'lifSpptYm' }, /* 라이프지원년월 */
    { fieldName: 'lifCntrNo' }, /* 라이프계약번호 */
    { fieldName: 'lifCntrSn' }, /* 라이프일련번호 */
    { fieldName: 'amt', dataType: 'number' }, /* 지원금액 */
    { fieldName: 'lifRepAmt', dataType: 'number' }, /* 라이프환수금액 */
    { fieldName: 'lifSpptAggAmt', dataType: 'number' }, /* 라이프지원누계금액 */
    { fieldName: 'welsCntrNo' }, /* 웰스계약번호 */
    { fieldName: 'welsCntrSn' }, /* 웰스계약일련번호 */
    { fieldName: 'lifAlncDvCd' }, /* 라이프제휴구분코드 */
    { fieldName: 'fstRgstDtm', dataType: 'date' }, /* 입력일자 */
    { fieldName: 'fstRgstUsrId' }, /* 입력담당자id */
    { fieldName: 'fstRgstUsrNm' }, /* 입력담당자id */
    { fieldName: 'lifAlncPdCd' }, /* 상품코드 */
    { fieldName: 'lifAlncPdNm' }, /* 상품명 */
  ];

  const columns = [
    { fieldName: 'lifSpptYm',
      header: t('MSG_TXT_SPPT_YM'),
      // header: '지원년월',
      width: '141',
      styleName: 'text-center',
      datetimeFormat: 'YYYY-MM',
    },
    { fieldName: 'lifCntrNo',
      header: t('MSG_TXT_LIF_CNTR_NO'),
      // header: '라이프 계약번호',
      width: '200',
      styleName: 'text-center' },
    { fieldName: 'amt',
      header: t('MSG_TXT_SPPT_AMT'),
      // header: '지원금액',
      numberFormat: '#,##0',
      width: '138',
      styleName: 'text-right' },
    { fieldName: 'lifRepAmt',
      header: t('MSG_TXT_REP_AMT'),
      // header: '환수금액',
      numberFormat: '#,##0',
      width: '138',
      styleName: 'text-right' },
    { fieldName: 'lifSpptAggAmt',
      header: t('MSG_TXT_SPPT_AGG'),
      numberFormat: '#,##0',
      // header: '지원누계',
      width: '134',
      styleName: 'text-right' },
    { fieldName: 'welsCntrNo',
      header: t('MSG_TXT_WELLS_CNTR_NO'),
      // header: '웰스계약번호',
      width: '200',
      styleName: 'text-center' },
    { fieldName: 'fstRgstDtm',
      header: t('MSG_TXT_IN_DTM'),
      // header: '입력일시',
      width: '150',
      datetimeFormat: 'date',
      styleName: 'text-center' },
    { fieldName: 'fstRgstUsrNm',
      header: t('MSG_TXT_IN_PSIC'),
      // header: '입력담당자명',
      width: '137',
      styleName: 'text-center' },
    { fieldName: 'fstRgstUsrId',
      header: t('MSG_TXT_SEQUENCE_NUMBER'),
      // header: '번호',
      width: '130',
      styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGrid2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'countLif', dataType: 'number' }, /* 대상건수 */
    { fieldName: 'amtSum', dataType: 'number' }, /* 대상금액 */
    { fieldName: 'dpDtm', dataType: 'date' },
    { fieldName: 'dpBlam', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'countLif',
      header: `${t('MSG_TXT_OJ_CT')}(건)`,
      // header: '대상건수(건)',
      width: '300',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'amtSum',
      header: `${t('MSG_TXT_OJ_AMT')}(원)`,
      // header: '대상금액(원)',
      width: '386',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'dpDtm',

      header: t('MSG_TXT_ITG_DP_D'),
      datetimeFormat: 'date',
      // header: '통합입금일',
      width: '300',
      styleName: 'text-center' },
    { fieldName: 'dpBlam',
      header: `${t('MSG_TXT_ITG_DP_BLAM')}원`,
      // header: '통합입금잔액(원)',
      width: '386',
      styleName: 'text-right',
      numberFormat: '#,##0' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});
</script>
<style scoped>
</style>
