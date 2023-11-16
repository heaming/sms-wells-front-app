<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSD
2. 프로그램 ID : WwpsdExclDivAwdErnWhtxRgstM
3. 작성자 : Kim HyeonMin
4. 작성일 : 2023.11.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 우수사업부 시상소득원천세 등록
****************************************************************************************************
-->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_FEE_YM')"
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            type="month"
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
          <span class="ml8">(단위 : 원)</span>
        </template>
        <kw-btn
          icon="upload_on"
          dense
          secondary
          :label="t('MSG_BTN_EXCEL_UP')"
          @click="onClickExcelUpload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        class="fee-standard-page__grid"
        :visible-rows="pageInfo.pageSize"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
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
import { getComponentType, useGlobal, useDataService, useMeta, gridUtil, defineGrid, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const { getConfig } = useMeta();
const { modal, notify } = useGlobal();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const now = dayjs();
let cachedParams;
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'AWD_DV_CD',
);
const searchParams = ref({
  perfYm: now.format('YYYYMM'),
});
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/wells/competence/div-awd-ern-whtx/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: products, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(products);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}
async function onClickSearch() {
  await fetchData();
}
async function onClickExcelUpload() {
  const apiUrl = '/sms/wells/competence/div-awd-ern-whtx/excel-upload';
  const templateId = 'FOM_DIV_AWD_ERN_WHTX';
  const { result, payload } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });
  if (result) {
    const { status, errorInfo } = payload;
    if (status === 'S') {
      notify(t('MSG_ALT_SAVE_DATA'));
      await fetchData();
    } else if (status === 'E' && errorInfo.length > 0) {
      await modal({
        component: 'ZwcmzExcelUploadErrorP',
        componentProps: { errorInfo },
      });
    }
  }
}
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'perfYm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'awdDvCd' },
    { fieldName: 'awdPerfSn' },
    { fieldName: 'awdNm' },
    { fieldName: 'awdIntbsAmt', dataType: 'number' },
    { fieldName: 'awdErnWhtx', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'perfYm', header: t('MSG_TXT_FEE_YM'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'awdDvCd', header: t('MSG_TXT_AWD_DV'), width: '100', styleName: 'text-center', options: codes.AWD_DV_CD },
    { fieldName: 'awdPerfSn', header: t('MSG_TXT_SERIAL_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'awdNm', header: t('MSG_TXT_SMRY'), width: '200', styleName: 'text-left' },
    { fieldName: 'awdIntbsAmt', header: t('MSG_TXT_AWD_INTBS_AMT'), width: '100', styleName: 'text-right' },
    { fieldName: 'awdErnWhtx', header: t('MSG_TXT_AWD_WTH_TAX'), width: '100', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
