<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaSeedingOstrQtyMgtM(W-SV-U-0129M01) - 모종 출고가능수량 관리
3. 작성자 : SaeRomI.Kim
4. 작성일 : 2023.06.27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 모종 출고가능수량을 Upload 기능을 이용하여 관리하는 화면 (http://localhost:3000/#/service/wwsna-seeding-ostr-qty-mgt)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="2"
      one-row
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_LOOKUP_PERIOD')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.strtDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_LOOKUP_PERIOD')"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_TASK_TYPE')">
          <kw-select
            v-model="searchParams.svBizHclsfCd"
            :options="filterCodes.svBizHclsfCd"
            first-option="all"
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
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }} : EA)</span>
        </template>

        <kw-btn
          v-permission:update
          :label="$t('MSG_TXT_SAVE')"
          grid-action
          :disable="pageInfo.totalCount === 0"
          @click="onClickSave"
        />

        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:create
          icon="upload_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_UP')"
          :disable="isSearch"
          @click="onClickExcelUpload"
        />
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
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

import { codeUtil, useMeta, useGlobal, useDataService, getComponentType, gridUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const { notify, modal } = useGlobal();
const { currentRoute } = useRouter();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  strtDt: dayjs().format('YYYYMMDD'),
  endDt: dayjs().format('YYYYMMDD'),
  svBizHclsfCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'SV_BIZ_HCLSF_CD',
);

const filterCodes = ref({
  svBizHclsfCd: [],
});

function svBizHclsfCdFilter() {
  filterCodes.value.svBizHclsfCd = codes.SV_BIZ_HCLSF_CD.filter((v) => ['1', '2', '3'].includes(v.codeId));
}

await Promise.all([
  svBizHclsfCdFilter(),
]);

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/seeding-out-of-storage-qtys/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: excludeItem, pageInfo: pagingResult } = res.data;
  // fetch시에는 총 건수 조회하지 않도록 변경
  pagingResult.needTotalCount = false;
  pageInfo.value = pagingResult;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(excludeItem);
    view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  }
}

const isSearch = ref(true);
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  // 조회버튼 클릭 시에만 총 건수 조회하도록
  pageInfo.value.needTotalCount = true;
  isSearch.value = false;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 엑셀 업로드
async function onClickExcelUpload() {
  const apiUrl = '/sms/wells/service/seeding-out-of-storage-qtys/excel-upload';
  const templateId = 'FOM_SDING_OSTR_QTY_UPLOAD';
  const { result, payload } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });

  if (result && payload.status === 'S') {
    // 엑셀 업로드가 완료 되었습니다.
    notify(t('MSG_ALT_EXCEL_ULD_FSH'));
    pageInfo.value.needTotalCount = true;
    await fetchData();
  }
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const modifedData = gridUtil.getChangedRowValues(view);

  const res = await dataService.put('/sms/wells/service/seeding-out-of-storage-qtys', modifedData);
  const { processCount } = res.data;
  if (processCount > 0) {
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/seeding-out-of-storage-qtys/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'vstDt' },
    { fieldName: 'svBizHclsfNm' },
    { fieldName: 'sdingPkgNm' },
    { fieldName: 'limQty', dataType: 'number' },
    { fieldName: 'sdingPkgGrpCd' },
    { fieldName: 'svBizHclsfCd' },
    { fieldName: 'limSn', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'vstDt', header: t('MSG_TXT_CST_VST_DT'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'svBizHclsfNm', header: t('MSG_TXT_TASK_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'sdingPkgNm', header: t('MSG_TXT_PKG_DV'), width: '250', styleName: 'text-left' },
    {
      fieldName: 'limQty',
      header: t('MSG_TXT_QTY'),
      width: '150',
      rules: 'required|min_value:0|max_value:999999999999',
      styleName: 'text-right',
      editor: {
        type: 'number',
        editable: true },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEditable = (grid, index) => {
    // 수량만 입력 가능
    if (index.column === 'limQty') {
      return true;
    }

    return false;
  };
});

</script>
