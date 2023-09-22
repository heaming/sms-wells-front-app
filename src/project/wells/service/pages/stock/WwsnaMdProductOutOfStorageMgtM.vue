<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaMdProductOutOfStorageMgt - MD 상품 출고관리
3. 작성자 : jungheejin
4. 작성일 : 2023-09-21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-  MD 상품 택배 출고관리 http://localhost:3000/#/service/wwsna-md-product-out-of-storage-mgt
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          v-if="!isCompStatus"
          :colspan="1"
          :label="$t('MSG_TXT_CNTR_DATE')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_CNTR_DATE')"
            rules="date_range_required"
          />
        </kw-search-item>
        <kw-search-item
          v-if="isCompStatus"
          :colspan="1"
          :label="$t('MSG_TXT_OSTR_CNFM_DT')"
          class="w315"
        >
          <kw-date-picker
            v-model="searchParams.vstFshDt"
            :label="$t('MSG_TXT_OSTR_CNFM_DT')"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item :label="$t('처리구분')">
          <kw-select
            v-model="searchParams.findGb"
            :options="customCodes.findGb"
            @change="onChangeCompStatus"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
        </template>
        <!-- 엑셀업로드 -->
        <kw-btn
          icon="upload_on"
          secondary
          dense
          :label="$t('MSG_TXT_EXCEL_UPLOAD')"
          @click="onClickExcelUpload"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :total-count="totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { getComponentType, defineGrid, gridUtil, useDataService, codeUtil, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { t } = useI18n();
const { currentRoute } = useRouter();
const { modal } = useGlobal();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/md-product--out-of-storage';

// const codes =
await codeUtil.getMultiCodes(
  'SV_BIZ_DCLSF_CD',
);
const customCodes = {
  findGb: [
    { codeId: '1', codeName: t('MSG_TXT_WK_FSH') },
    { codeId: '2', codeName: t('MSG_TXT_WORK_PENDING') },
  ],
};
const searchParams = ref({
  startDt: now.startOf('month').format('YYYYMMDD'), // 시작일자
  endDt: now.format('YYYYMMDD'), // 종료일자
  vstFshDt: now.format('YYYYMMDD'),
  findGb: '2', /* 조회 구분 */
  selCnt: '', /* 조회 제한건수  */
});
let cachedParams;
const totalCount = ref(0);

const isCompStatus = ref(false);
const isWaitStatus = ref(true);
async function onChangeCompStatus() {
  isCompStatus.value = false;
  isWaitStatus.value = false;
  const { findGb } = searchParams.value;

  const view = grdMainRef.value.getView();
  view.checkBar.visible = false;

  /* 작업완료 */
  if (findGb === '1') {
    isCompStatus.value = true;
  }

  /* 작업대기 */
  if (findGb === '2') {
    isWaitStatus.value = true;
    view.checkBar.visible = true;
  }
}

async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const list = res.data;
  totalCount.value = list.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}
/* 엑셀 업로드 유효성 체크 */
async function validate(rows) {
  const { data } = await dataService.put(`${baseUrl}/excel-upload-validate`, rows, {
    alert: false,
  });
  return data;
}
async function onClickExcelUpload() {
  const { result, payload } = await modal({
    component: 'ZctzExcelUploadP',
    componentProps: {
      size: '2xl',
      templateDocId: t('MSG_TXT_PCSV_IVC'),
      headerRows: 1,
      validationBtn: true,
      downloadBtn: true,
      serverSideValidation: validate,
      serverSideValidateOption: { sideEffect: true, rowBy: false },
      columns: {
        cstSvAsnNo: { label: t('MSG_TXT_ASGN_NO'), width: 180, required: true },
        cntrNo: { label: t('MSG_TXT_CNTR_NO'), width: 130, rules: 'regex:W\\d{11}', required: true },
        cntrSn: { label: t('MSG_TXT_CNTR_SN'), width: 100, rules: 'max:5', required: true },
        pcsvCompDv: { label: t('MSG_TXT_PCSV_CO'), width: 80 },
        sppIvcNo: { label: t('MSG_TXT_IVC_NO'), width: 130 },
        sppBzsPdId: { label: t('MSG_TXT_SR_NO'), width: 130 },
      },
    },
  });
  console.log(result);
  console.log(payload);
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ex' },
  ];

  const columns = [
    { fieldName: 'ex', header: t('ex'), width: '100', styleName: 'text-center' },

  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
