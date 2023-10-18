<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSD
2. 프로그램 ID : WpsdExcellentDivisionEvlBaseMgtM
3. 작성자 : Park Yesol
4. 작성일 : 2023.10.04
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 우수사업부 기준관리 - 평가기준관리
****************************************************************************************************
-->

<template>
  <kw-search
    ref="frmSearchRef"
    :cols="2"
    @search="onClickEvlSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="t('MSG_TXT_OG_TP')"
        required
      >
        <kw-select
          v-model="evlSearchParams.evlOgTpCd"
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
          v-model="evlSearchParams.baseYm"
          :label="t('MSG_TXT_EDUC_YM')"
          type="month"
          rules="required"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>
  <div class="result-area">
    <h3>{{ t('MSG_TXT_SRCH_RSLT') }}</h3>
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="evlPageInfo1.pageIndex"
          v-model:page-size="evlPageInfo1.pageSize"
          :total-count="evlPageInfo1.totalCount"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change="evlFetchData"
        />
      </template>
      <kw-btn
        v-permission:update
        :label="$t('MSG_BTN_SAVE')"
        grid-action
        dense
        @click="onClickEvlSave"
      />
    </kw-action-top>
    <kw-grid
      ref="evlGrdMainRef"
      name="evlGrdMain"
      :page-size="evlPageInfo1.pageSize"
      :total-count="evlPageInfo1.totalCount"
      :visible-rows="evlPageInfo1.pageSize"
      @init="initEvlGrdMain"
    />
    <kw-pagination
      v-model:page-index="evlPageInfo1.pageIndex"
      v-model:page-size="evlPageInfo1.pageSize"
      :total-count="evlPageInfo1.totalCount"
      @change="evlFetchData"
    />

    <h3>{{ t('MSG_TXT_DTL_RS') }}</h3>
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="evlPageInfo2.pageIndex"
          v-model:page-size="evlPageInfo2.pageSize"
          :total-count="evlPageInfo2.totalCount"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
        />
      </template>
      <kw-btn
        :label="$t('MSG_BTN_DEL')"
        dense
        grid-action
        @click="onClickEvldRemove"
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
        @click="onClickAdd"
      />
      <kw-btn
        v-permission:update
        :label="$t('MSG_BTN_SAVE')"
        grid-action
        dense
        @click="onClickEvlDetailSave"
      />
    </kw-action-top>
    <kw-grid
      ref="evlDtlGrdMainRef"
      name="evlDtlGrdMain"
      :page-size="evlPageInfo2.pageSize"
      :total-count="evlPageInfo2.totalCount"
      :visible-rows="8"
      @init="initEvlDtlGrdMain"
    />
    <kw-pagination
      v-model:page-index="evlPageInfo2.pageIndex"
      v-model:page-size="evlPageInfo2.pageSize"
      :total-count="evlPageInfo2.totalCount"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, gridUtil, codeUtil, useMeta, useGlobal, defineGrid } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { notify } = useGlobal();
const { getUserInfo } = useMeta();
const dataService = useDataService();
const userInfo = getUserInfo();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();
const evlGrdMainRef = ref(getComponentType('KwGrid'));
const evlDtlGrdMainRef = ref(getComponentType('KwGrid'));
const selectRow = ref({});
const evlAtcDvCdList = ref([]);
// 공통코드로딩
const codes = await codeUtil.getMultiCodes(
  'EVL_OG_TP_CD',
  'EVL_PD_DV_CD',
  'EVL_RSB_DV_CD',
  'QLF_DV_CD',
  'EVL_ATC_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
);
const rsbDvList = ref([]);

const evlSearchParams = ref({
  evlOgTpCd: userInfo.ogTpCd, // 조직유형
  baseYm: now.format('YYYYMM'),
});

const evlPageInfo1 = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
});
const evlPageInfo2 = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
});

let evlCachedParams;
const evlFetchData = async () => {
  const res = await dataService.get('/sms/wells/competence/excellent-division-base/evaluation/paging', { params: { ...evlCachedParams, ...evlPageInfo1.value } });
  const { list, pageInfo: pagingResult } = res.data;
  evlPageInfo1.value = pagingResult;
  const view = evlGrdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(evlPageInfo1);
};

const onClickEvlSearch = async () => {
  evlPageInfo1.value.pageIndex = 1;
  // 자동완성 검색조건 설정
  evlCachedParams = cloneDeep(evlSearchParams.value);
  await evlFetchData();
};

const onClickEvlSave = async () => {
  const view = evlGrdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/competence/excellent-division-base/evaluation', changedRows);
  notify(t('MSG_ALT_SAVE_DATA'));
  await evlFetchData();
};

const evaluateResponsibilityCdChang = async () => {
  rsbDvList.value = codes.EVL_RSB_DV_CD.filter((v) => [evlSearchParams.value.evlOgTpCd].includes(v.prtsCodeId));
  const view = evlGrdMainRef.value.getView();
  view.setColumn({
    name: 'rsbDvCds',
    styleName: 'text-left',
    editor: { type: 'checklist' },
    options: rsbDvList.value,
    optionValue: 'codeId',
    optionLabel: 'codeName',
  });
};

const evlDetailFetchData = async () => {
  const res = await dataService.get('/sms/wells/competence/excellent-division-base/evaluation/detail', { params: { ...selectRow.value, ...evlPageInfo2.value } });
  const { list, pageInfo: pagingResult } = res.data;
  evlPageInfo2.value = pagingResult;
  const view = evlDtlGrdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(evlPageInfo2);
};

const evlArticlesFetchData = async () => {
  const res = await dataService.get('/sms/wells/competence/excellent-division-base/evaluation/articles', { params: { ...evlSearchParams.value } });
  evlAtcDvCdList.value = res.data;

  const view = evlDtlGrdMainRef.value.getView();
  view.setColumn({
    name: 'evlAtcDvCd',
    styleName: 'text-left',
    editor: { type: 'list' },
    options: evlAtcDvCdList.value,
    optionValue: 'evlAtcDvCd',
    optionLabel: 'evlAtcDvNm',
  });
};

const onClickAdd = async () => {
  const view = evlDtlGrdMainRef.value.getView();
  const defaultData = {
    baseYm: selectRow.value.baseYm,
    evlOgTpCd: selectRow.value.evlOgTpCd,
    evlDvNm: selectRow.value.evlDvNm,
    evlDvCd: selectRow.value.evlDvCd,
    dtaDlYn: 'N',
  };
  gridUtil.insertRowAndFocus(view, 0, defaultData);
};

const onClickEvlDetailSave = async () => {
  const view = evlDtlGrdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/competence/excellent-division-base/evaluation/detail', changedRows);
  notify(t('MSG_ALT_SAVE_DATA'));
  await evlDetailFetchData();
};

watch(() => [evlSearchParams.value.evlOgTpCd], async () => {
  await evaluateResponsibilityCdChang();
  await evlArticlesFetchData();
});

onMounted(async () => {
  await evaluateResponsibilityCdChang();
  await evlArticlesFetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initEvlGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'evlOgTpCd' },
    { fieldName: 'evlOgTpNm' },
    { fieldName: 'baseYm' },
    { fieldName: 'evlDvCd' },
    { fieldName: 'evlDvNm' },
    { fieldName: 'evlRsbRelId' },
    { fieldName: 'evlAtcCn' },
    { fieldName: 'ctstGrpUseYn' },
    { fieldName: 'rsbDvCds' },
    { fieldName: 'qlfDvCd' },
    { fieldName: 'qlfDvNm' },
  ];

  const columns = [
    { fieldName: 'evlOgTpNm', header: t('MSG_TXT_OG_TP'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'baseYm', header: t('MSG_TXT_MGT_YNM'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM', editable: false },
    { fieldName: 'evlDvNm', header: t('MSG_TXT_AWD_NM'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'rsbDvCds',
      header: t('MSG_TXT_OJ_RSB'),
      width: '100',
      styleName: 'text-left',
      editor: {
        type: 'checklist',
      },
      options: rsbDvList,
      rules: 'required',
    },
    { fieldName: 'qlfDvCd',
      header: t('MSG_TXT_QLF_DV'),
      width: '100',
      styleName: 'text-center',
      options: codes.QLF_DV_CD,
      editor: { type: 'list' },
      styleCallback(grid, dataCell) {
        const rsbDvCd = grid.getValue(dataCell.item.dataRow, 'rsbDvCds');
        return (rsbDvCd && rsbDvCd.indexOf('05') >= 0) ? { editable: true } : { editable: false };
      },
    },
    { fieldName: 'evlAtcCn', header: t('MSG_TXT_BASE_EPL'), width: '100', styleName: 'text-left' },
    { fieldName: 'ctstGrpUseYn', header: `${t('MSG_TXT_CTST_GRP')}${t('MSG_TXT_USE_SEL')}`, width: '100', styleName: 'text-center', renderer: { type: 'check', trueValues: 'Y', falseValues: 'N' } },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEdited = (grid, itemIndex) => {
    const { fieldName } = grid.getCurrent();
    const rsbDvCds = grid.getValue(itemIndex, 'rsbDvCds');
    if (fieldName === 'rsbDvCds' && !rsbDvCds.indexOf('05') >= 0) {
      grid.setValue(itemIndex, 'qlfDvCd', '');
    }
  };

  view.onCellClicked = async (grid, { itemIndex }) => {
    const row = gridUtil.getRowValue(grid, itemIndex);
    if (!isEmpty(row)) {
      selectRow.value = row;
      await evlDetailFetchData();
    }
  };
});

const initEvlDtlGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'baseYm' },
    { fieldName: 'evlDvCd' },
    { fieldName: 'evlOgTpCd' },
    { fieldName: 'evlDvNm' },
    { fieldName: 'evlAtcDvCd' },
    { fieldName: 'evlBaseUnitN' },
    { fieldName: 'cvtBasePc' },
    { fieldName: 'dtaDlYn' },
  ];
  const columns = [
    { fieldName: 'evlDvNm', header: t('MSG_TXT_AWD_NM'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'evlAtcDvCd', header: t('MSG_TXT_EVL_BASE_DV'), width: '100', styleName: 'text-center', rules: 'required' },
    { fieldName: 'evlBaseUnitN', header: t('MSG_TXT_EVL_BASE'), width: '100', styleName: 'text-right' },
    { fieldName: 'cvtBasePc', header: t('MSG_TXT_CVT_PC'), width: '100', styleName: 'text-right' },
    { fieldName: 'dtaDlYn', header: t('MSG_TXT_USE_SEL'), width: '100', styleName: 'text-center', renderer: { type: 'check', trueValues: 'N', falseValues: 'Y' } },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
});

</script>
