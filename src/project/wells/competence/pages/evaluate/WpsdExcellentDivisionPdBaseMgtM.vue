<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSD
2. 프로그램 ID : WpsdExcellentDivisionPdBaseMgtM
3. 작성자 : Park Yesol
4. 작성일 : 2023.09.21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 우수사업부 기준관리 - 상품기준관리
****************************************************************************************************
-->

<template>
  <kw-search
    ref="frmSearchRef"
    :cols="3"
    @search="onClickPrdSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="t('MSG_TXT_OG_TP')"
        required
      >
        <kw-select
          v-model="prdSearchParams.evlOgTpCd"
          :label="t('MSG_TXT_OG_TP')"
          :options="codes.EVL_OG_TP_CD"
          rules="required"
          first-option="select"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_MGT_YNM')"
        required
      >
        <kw-date-picker
          v-model="prdSearchParams.baseYm"
          :label="t('MSG_TXT_EDUC_YM')"
          type="month"
          rules="required"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_MNGT_DV')"
        required
      >
        <kw-select
          v-model="prdSearchParams.evlPdDvCd"
          :label="t('MSG_TXT_MNGT_DV')"
          first-option="select"
          :options="codes.EVL_PD_DV_CD"
          rules="required"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>
  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="prdPageInfo.pageIndex"
          v-model:page-size="prdPageInfo.pageSize"
          :total-count="prdPageInfo.totalCount"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change="prdFetchData"
        />
      </template>
      <kw-btn
        :label="$t('MSG_BTN_DEL')"
        dense
        grid-action
        @click="onClickPrdRemove"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        v-permission:create
        :label="$t('MSG_BTN_ROW_ADD')"
        dense
        grid-action
        @click="onClickPrdAdd"
      />
      <kw-btn
        v-permission:update
        :label="$t('MSG_BTN_SAVE')"
        grid-action
        dense
        @click="onClickPrdSave"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        v-permission:create
        secondary
        dense
        icon="upload_on"
        :label="$t('MSG_BTN_EXCEL_UP')"
        @click="onClickPrdExcelUpload"
      />
      <kw-btn
        v-permission:download
        secondary
        dense
        icon="download_on"
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="prdPageInfo.totalCount === 0"
        @click="onClickPrdExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="prdGrdMainRef"
      name="prdGrdMain"
      :page-size="prdPageInfo.pageSize"
      :total-count="prdPageInfo.totalCount"
      :visible-rows="10"
      @init="initPrdGrdMain"
    />
    <kw-pagination
      v-model:page-index="prdPageInfo.pageIndex"
      v-model:page-size="prdPageInfo.pageSize"
      :total-count="prdPageInfo.totalCount"
      @change="prdFetchData"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, gridUtil, codeUtil, useMeta, defineGrid, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { notify, confirm, modal } = useGlobal();
const { getConfig, getUserInfo } = useMeta();
const dataService = useDataService();
const userInfo = getUserInfo();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();
const prdGrdMainRef = ref(getComponentType('KwGrid'));
const excelUploadFlag = ref(false);
// 공통코드로딩
const codes = await codeUtil.getMultiCodes(
  'EVL_OG_TP_CD',
  'EVL_PD_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'EDUC_CPC_YN',
  'COD_YN',
);

let cachedParams;
// 검색조건 Parameter
const prdSearchParams = ref({
  evlOgTpCd: userInfo.ogTpCd, // 조직유형
  baseYm: now.format('YYYYMM'),
  evlPdDvCd: '',
});
const prdPageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const prdFetchData = async () => {
  const res = await dataService.get('/sms/wells/competence/excellent-division-base/product/paging', { params: { ...cachedParams, ...prdPageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;

  prdPageInfo.value = pagingResult;
  const view = prdGrdMainRef.value.getView();

  view.getDataSource().setRows(list);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(prdPageInfo);
  excelUploadFlag.value = false;
};

const onClickPrdSearch = async () => {
  prdPageInfo.value.pageIndex = 1;
  // 자동완성 검색조건 설정
  cachedParams = cloneDeep(prdSearchParams.value);
  await prdFetchData();
};

const onClickPrdAdd = async () => {
  const view = prdGrdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, { elvOgTpCd: prdSearchParams.value.elvOgTpCd, baseYm: now.format('YYYYMM') });
};

const onClickPrdSave = async () => {
  const view = prdGrdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/competence/excellent-division-base/product', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await prdFetchData();
};

const fetchExcelData = async (list) => {
  const view = prdGrdMainRef.value.getView();
  view.getDataSource().addRows(list);
  view.resetCurrent();
};

const onClickPrdExcelUpload = async () => {
  const view = prdGrdMainRef.value.getView();
  if (isEmpty(prdSearchParams.value.elvOgTpCd)) {
    notify(t('MSG_TXT_BEFORE_SELECT_IT', [t('MSG_TXT_OG_TP')]));
    return;
  }
  if (view.getDataSource().getRowCount() > 0 && !await confirm(t('MSG_ALT_EXCEL_ULD_GRID_RESET_CONF'))) { return; }
  view.getDataSource().clearRows();
  excelUploadFlag.value = false;

  const apiUrl = '/sms/wells/competence/excellent-division-base/product/excel-upload';
  const templateId = 'FOM_AWD_EVL_PD_BASE';
  const { payload } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: {
      apiUrl,
      templateId,
      isTemplateExist: true,
    },
  });
  if (!isEmpty(payload) && payload.status === 'S') {
    await fetchExcelData(payload.excelData);
    excelUploadFlag.value = true;
  }
};

const onClickPrdRemove = async () => {
  const view = prdGrdMainRef.value.getView();
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length > 0) {
    await dataService.delete('/sms/wells/competence/excellent-division-base/product', { data: deletedRows });
    await prdFetchData();
  }
};

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initPrdGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'evlOgTpCd' },
    { fieldName: 'baseYm' },
    { fieldName: 'evlPdDvCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'cvtPc' },
  ];
  const columns = [
    { fieldName: 'baseYm',
      header: t('MSG_TXT_MGT_YNM'),
      width: '100',
      styleName: 'text-center',
      editor: {
        type: 'btdate',
        btOptions: {
          startView: 1,
          minViewMode: 1,
          language: 'ko',
          todayHighlight: true,
        },
        datetimeFormat: 'YYYY-MM',
        textReadOnly: true,
      },
      datetimeFormat: 'YYYY-MM',
      rules: 'required',
    },
    { fieldName: 'evlPdDvCd',
      header: t('MSG_TXT_MNGT_DV'),
      width: '100',
      styleName: 'text-center',
      rules: 'required',
      options: codes.EVL_PD_DV_CD,
      editor: { type: 'list' },
    },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '100', styleName: 'text-center', rules: 'required' },
    { fieldName: 'cvtPc', header: t('MSG_TXT_CVT_CT'), width: '100', styleName: 'text-right', rules: 'required', editor: { type: 'number' } },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  view.onValidate = async (g, index, value) => {
    if (index.column === 'baseYm') {
      if (value.length !== 6) {
        return t('MSG_ALT_INPUT_COMMON', [t('MSG_TXT_MGT_YNM')]);
      }
    }
  };
});

</script>
