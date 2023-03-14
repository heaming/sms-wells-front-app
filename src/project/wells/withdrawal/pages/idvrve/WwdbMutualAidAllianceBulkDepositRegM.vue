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
      @search="onClickSearch"
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
            rules="required"
            type="month"
          />
        </kw-search-item>
        <!-- label="실적일자" -->
        <kw-search-item
          :label="t('MSG_TXT_PERF_DT')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfDt"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- label="수납일자" -->
        <kw-search-item
          :label="t('MSG_TXT_RVE_DT')"
          required
        >
          <kw-date-picker
            v-model="searchParams.rveDt"
            rules="required"
          />
        </kw-search-item>
        <!-- label="수납코드" -->
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
        <!-- label="통합입금번호" -->
        <kw-form-item
          :label="t('MSG_TXT_ITG_DP_NO')"
        >
          <kw-input
            v-model="searchParams.itgDpNo"
            icon="search"
            clearable
            @click-icon="onClickSelectIntegrationDeposit"
          />
        </kw-form-item>
      </kw-search-row>
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
        <ul class="kw-notification">
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
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_TEMP_DOWN')"
          @click="onClickTemplateDownload"
        />
        <!-- label="양식다운로드" -->
        <kw-file
          v-show="false"
          ref="attachFileRef"
          v-model="file"
          @update:model-value="onUpdateFileUpload"
        />
        <kw-btn
          icon="upload_on"
          dense
          secondary
          :label="t('MSG_TXT_EXCEL_UPLOAD')"
          @click="onClickExcelUpload"
        />
        <!-- label="엑셀업로드" -->
        <kw-btn
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
          primary
          dense
          :label="t('MSG_BTN_CNTN_CREATE')"
        />
        <!-- label="생성" -->
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
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
import { codeUtil, defineGrid, getComponentType, gridUtil, modal, notify, useDataService, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import useCmFile from '~common/composables/useCmFile';

const dataService = useDataService();
const now = dayjs();
const { t } = useI18n();
const { getConfig } = useMeta();
const { getStandardFormFile } = useCmFile();
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
console.log(codes.LIF_ALNC_DV_CD);

const file = ref(null);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const searchParams = ref({
  lifSpptYm: now.format('YYYYMM') - 1, //
  perfDt: now.format('YYYYMMDD'), // 실적일자
  rveDt: now.format('YYYYMMDD'), // 수납일자
  rveCd: '', // 수납코드
  rveNm: '',
  itgDpNo: '', // 통합입금번호
  lifAlncDvCd: '30', // 제휴코드
});

let cachedParams;

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/mutual-alliance-bulk-deposit/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;

  console.log(pages);

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  data.checkRowStates(false);
  data.setRows(pages);
  data.checkRowStates(true);

  view.resetCurrent();
}

async function fetchSubData() {
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/mutual-alliance-bulk-deposit', { params: cachedParams });
  const pages = [res.data];

  console.log(res.data);

  const view = grdSubRef.value.getView();
  const data = view.getDataSource();

  data.checkRowStates(false);
  data.setRows(pages);
  data.checkRowStates(true);

  view.resetCurrent();
}

// 조회 버튼
async function onClickSearch() {
  grdMainRef.value.getData().clearRows();

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
  await fetchSubData();
}

// 수납코드 조회 팝업
async function onClickSelectRveCd() {
  const { result, payload } = await modal({ component: 'ZwwdyDivisionReceiveCodeRegP',
    componentProps: { rveCd: searchParams.value.rveCd, rveNm: searchParams.value.rveNm },
  });
  console.log(payload);
  if (result) {
    console.log(payload);
    searchParams.value.rveCd = payload.rveCd;
    searchParams.value.rveNm = payload.rveNm;
  }
}

// 통합입금번호
async function onClickSelectIntegrationDeposit() {
  const { result, payload } = await modal({
    component: 'WwdbIntegrationDepositListP',
    componentProps: { itgDpNo: searchParams.value.itgDpNo },
  });

  if (result) {
    searchParams.value.itgDpNo = payload.itgDpNo;
  }
}

async function onKeyDownSelectRveCd() {
  searchParams.value.rveNm = '';
}

async function onClearSelectRveCd() {
  searchParams.value.rveCd = '';
  searchParams.value.rveNm = '';
}

const attachFileRef = ref();

async function onClickExcelUpload() {
  const apiUrl = '/sms/wells/withdrawal/idvrve/mutual-alliance-bulk-deposit/excel-upload';
  const templateId = 'FOM_WDA_00001';
  const {
    result,
    payload,
  } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });
  if (result) {
    if (payload.status === 'S') {
      notify(t('MSG_ALT_SAVE_DATA'));
    }
    console.log(payload);
  }
}

// async function onClickExcelUpload() {
//   attachFileRef.value.pickFiles();
// }

// async function onUpdateFileUpload() {
//   if (file.value === null || file.value.length === 0) {
//     return;
//   }

//   // 첨부파일 정보를 함께 넘겨줍시다.
//   const formData = new FormData();
//   formData.append('file', file.value[0].nativeFile);
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
async function onClickTemplateDownload() {
  await getStandardFormFile('FOM_WDA_00001');
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'lifSpptYm' }, /* 라이프지원년월 */
    { fieldName: 'lifCntrNo' }, /* 라이프계약번호 */
    { fieldName: 'lifCntrSn' }, /* 라이프일련번호 */
    { fieldName: 'amt' }, /* 지원금액 */
    { fieldName: 'lifRepAmt' }, /* 라이프환수금액 */
    { fieldName: 'lifSpptAggAmt' }, /* 라이프지원누계금액 */
    { fieldName: 'welsCntrNo' }, /* 웰스계약번호 */
    { fieldName: 'welsCntrSn' }, /* 웰스계약일련번호 */
    { fieldName: 'lifAlncDvCd' }, /* 라이프제휴구분코드 */
    { fieldName: 'fstRgstDtm' }, /* 입력일자 */
    { fieldName: 'fstRgstUsrId' }, /* 입력담당자id */
  ];

  const columns = [
    { fieldName: 'lifSpptYm',
      header: t('MSG_TXT_SPPT_YM'),
      // header: '지원년월',
      width: '141',
      styleName: 'text-center' },
    { fieldName: 'lifCntrNo',
      header: t('MSG_TXT_LIF_CNTR_NO'),
      // header: '라이프 계약번호',
      width: '238',
      styleName: 'text-center' },
    { fieldName: 'amt',
      header: t('MSG_TXT_SPPT_AMT'),
      // header: '지원금액',
      width: '138',
      styleName: 'text-right' },
    { fieldName: 'lifRepAmt',
      header: t('MSG_TXT_REP_AMT'),
      // header: '환수금액',
      width: '138',
      styleName: 'text-right' },
    { fieldName: 'lifSpptAggAmt',
      header: t('MSG_TXT_SPPT_AGG'),
      // header: '지원누계',
      width: '134',
      styleName: 'text-right' },
    { fieldName: 'welsCntrNo',
      header: t('MSG_TXT_WELLS_CNTR_NO'),
      // header: '웰스계약번호',
      width: '260',
      styleName: 'text-center' },
    { fieldName: 'fstRgstDtm',
      header: t('MSG_TXT_IN_DTM'),
      // header: '입력일시',
      width: '180',
      styleName: 'text-center' },
    { fieldName: 'fstRgstUsrId',
      header: t('MSG_TXT_IN_PSIC'),
      // header: '입력담당자명',
      width: '137' },
    { fieldName: 'fstRgstUsrId',
      header: t('MSG_TXT_SEQUENCE_NUMBER'),
      // header: '번호',
      width: '130',
      styleName: 'text-right' },
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
    { fieldName: 'col3' },
    { fieldName: 'col4', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'countLif',
      header: t('MSG_TXT_OJ_CT') + t('MSG_TXT_CT_CASE'),
      // header: '대상건수(건)',
      width: '386',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'amtSum',
      header: t('MSG_TXT_ANYTHING_AMT_WON', [t('MSG_TXT_OJ_AMT')]),
      // header: '대상금액(원)',
      width: '386',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'col3',
      header: t('MSG_TXT_ITG_DP_D'),
      // header: '통합입금일',
      width: '387',
      styleName: 'text-center' },
    { fieldName: 'col4',
      header: t('MSG_TXT_ANYTHING_AMT_WON', [t('MSG_TXT_ITG_DP_BLAM')]),
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
