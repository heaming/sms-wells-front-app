<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaPcsvSppBzsIvcMgtM - 택배 배송업체 송장관리 (엑셀 업로드화면)
3. 작성자 : jungheejin
4. 작성일 : 2023-09-18
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-  택배 배송업체 송장관리 (엑셀 업로드화면) http://localhost:3000/#/service/wwsna-pcsv-spp-bzs-ivc-mgt
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_SRCH_DT')">
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_SRCH_DT')"
            rules="date_range_required"
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
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
        <!-- 엑셀업로드 -->
        <kw-btn
          icon="upload_on"
          secondary
          dense
          :label="$t('MSG_TXT_EXCEL_UPLOAD')"
          @click="onClickExcelUpload"
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
const { modal, notify } = useGlobal();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/pcsv-spp-bzs-out-of-storage';

// const codes =
await codeUtil.getMultiCodes(
  'SV_BIZ_DCLSF_CD',
);

const searchParams = ref({
  startDt: now.subtract(30, 'day').format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
});
let cachedParams;
const totalCount = ref(0);

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

async function onClickExcelUpload() {
  const apiUrl = `${baseUrl}/excel-upload`;
  const templateId = 'FOM_AS_CSMB_UPLOAD'; // 해당 템플릿ID 정의
  console.log(cachedParams);
  const extraData = cachedParams;
  const { result, payload } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId, extraData },
  });
  if (result && payload.status === 'S') {
    notify(t('MSG_ALT_SAVE_DATA'));
  } else if (result && payload.status === 'E' && payload.excelData.length === 0) {
    notify(t('MSG_ALT_NO_DATA'));
  }
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
