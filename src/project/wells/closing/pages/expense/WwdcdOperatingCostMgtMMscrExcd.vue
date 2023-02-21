<!----
****************************************************************************************************
1. 모듈 : DCD
2. 프로그램 ID : WwdcdOperatingCostMgtMMscrExcd - 유가증권 제외
3. 작성자 : gs.piit172 kim juhyun
4. 작성일 : 2023.02.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 유가증권 제외 프로그램
****************************************************************************************************
--->
<template>
  <h3>{{ t('MSG_TXT_ADJ_OJ') }}</h3>
  <kw-action-top>
    <template #left>
      <kw-paging-info
        :total-count="mainPageInfo.totalCount"
      />
      <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </template>
    <kw-btn
      :label="$t('MSG_BTN_SAVE')"
      grid-action
      dense
      @click="onClickSave"
    />
    <kw-separator
      vertical
      inset
      spaced
    />
    <kw-btn
      icon="download_on"
      dense
      secondary
      :label="$t('MSG_BTN_EXCEL_DOWN')"
      @click="onClickExcelDownload('adjustObject')"
    />
  </kw-action-top>
  <kw-grid
    ref="grdMainRef"
    name="grdTabMain"
    :visible-rows="5"
    @init="initGrdMain"
  />
  <kw-separator />
  <h3>
    {{ t('MSG_TXT_WHTX_ADJ_IZ') }}
  </h3>
  <kw-action-top>
    <template #left>
      <kw-paging-info
        :total-count="subPageInfo.totalCount"
      />
      <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </template>
    <kw-btn
      icon="download_on"
      dense
      secondary
      :label="$t('MSG_BTN_EXCEL_DOWN')"
      @click="onClickExcelDownload('withholdingTaxAdjust')"
    />
  </kw-action-top>
  <kw-grid
    ref="grdSubRef"
    name="grdTabSub"
    :visible-rows="5"
    @init="initGrdSub"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Initialize Component
// -------------------------------------------------------------------------------------------------
import { useGlobal, useDataService, getComponentType, defineGrid, gridUtil, useModal, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { modal, notify, confirm } = useGlobal();
const { t } = useI18n();
const { ok } = useModal();
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const store = useStore();

defineEmits(['fetcData']);

const codes = await codeUtil.getMultiCodes(
  'COD_NOTICOBJ_SRCH_DIV',
  'COD_PAGE_SIZE_OPTIONS',
);

const mainPageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

const subPageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const props = defineProps({
  initData: { type: String, default: null },
});

let cachedParams;
async function adjustObject() {
  const view = grdMainRef.value.getView();
  const mainServices = ([
    { col1: '2022-08-09 오전 08:03', col2: '호평센터', col3: '1111-1111-1111-1111', col4: '주식회사에스씨', col5: '11111111', col6: '123,123', col7: '정산', col8: '선택', col9: '-', col10: '-', col11: '-', col12: '원천세 정산', col13: '환불' },
  ]);
  mainPageInfo.value.totalCount = 1;
  view.getDataSource().setRows(mainServices);
  view.resetCurrent();

  /* TODO.서비스 완성되면 써아할꺼
  const { initData } = props;
  cachedParams = { useYearMonth: cloneDeep(initData) };
  cachedParams.registration = 'adjustObject';
  const res = await dataService.get('/sms/wells/expense/operating-cost', { params: { ...cachedParams } });
  const { list: services } = res.data;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(services);
  view.resetCurrent();
  */
}

async function withholdingTaxAdjustList() {
  const { initData } = props;
  cachedParams = { useYearMonth: cloneDeep(initData) };
  cachedParams.registration = 'withholdingTaxAdjustList';
  const res = await dataService.get('/sms/wells/expense/operating-cost', { params: { ...cachedParams } });
  const { list: services } = res.data;
  const view = grdSubRef.value.getView();
  view.getDataSource().setRows(services);
  view.resetCurrent();
}

async function fetchData() {
  debugger;
  adjustObject();
  withholdingTaxAdjustList();
}

async function setData() {
  fetchData();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  } if (checkedRows.length > 1) {
    notify(t('MSG_ALT_PRGS_OK'));
  }

  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }
  notify(t('MSG_ALT_SAVE_DATA'));
  ok();

  // TODO.뒷단 완성되면 다시 해야 할꺼
  // await dataService.post('/sms/wells/expense/operating-cost', checkedRows);
  // await notify(t('MSG_ALT_SAVE_DATA'));
  // ok();
}
async function onClickExcelDownload(flage) {
  if (flage === 'adjustObject') {
    const params = cloneDeep(props.initData.value);
    params.userId = store.getters['meta/getUserInfo'].userId;
    const view = grdMainRef.value.getView();
    const res = await dataService.get('/sms/wells/expense/operating-cost/excel-download', { params });
    await gridUtil.exportView(view, {
      fileName: t('MSG_TXT_ADJ_OJ'),
      timePostfix: true,
      exportData: res.data,
    });
  } else if (flage === 'withholdingTaxAdjust') {
    const params = cloneDeep(props.initData.value);
    params.userId = store.getters['meta/getUserInfo'].userId;
    const view = grdMainRef.value.getView();
    const res = await dataService.get('/sms/wells/expense/operating-cost/excel-download', { params });
    await gridUtil.exportView(view, {
      fileName: t('MSG_TXT_WHTX_ADJ_IZ'),
      timePostfix: true,
      exportData: res.data,
    });
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
    { fieldName: 'col13' },
  ];
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_USE_DTM'), width: '174', styleName: 'text-center' }, // 사용일시
    { fieldName: 'col2', header: t('MSG_TXT_CENTER_DIVISION'), width: '71', styleName: 'text-left' }, // 센터
    { fieldName: 'col3', header: t('MSG_TXT_CARD_NO'), width: '172', styleName: 'text-center' }, // 카드번호
    { fieldName: 'col4', header: t('MSG_TXT_MRC'), width: '122', styleName: 'text-left' }, // 가맹점
    { fieldName: 'col5', header: t('MSG_TXT_APR_NO'), width: '101', styleName: 'text-center' }, // 승인반호
    { fieldName: 'col6', header: t('MSG_TXT_USE_AMT'), width: '101', styleName: 'text-right' }, // 사용금액
    { fieldName: 'col7', header: t('MSG_TXT_ADJ_EXCD_YN'), width: '131' }, // 정산제외여부
    {
      fieldName: 'col8',
      header: {
        text: t('MSG_TXT_DIV'),
        styleName: 'essential',
      },
      width: '133',
    },
    {
      fieldName: 'col9',
      header: {
        text: t('MSG_TXT_OBJ'),
        styleName: 'essential',
      },
      width: '137',
    },
    {
      fieldName: 'col10',
      header: {
        text: t('MSG_TXT_PURP'),
        styleName: 'essential',
      },
      width: '137',
    },
    {
      fieldName: 'col11',
      header: {
        text: t('MSG_TXT_PRCHS_ITM_USE_IZ'),
        styleName: 'essential',
      },
      width: '179',
    },
    {
      fieldName: 'col12',
      header: {
        text: t('MSG_TXT_WHTX_ADJ'),
        styleName: 'essential',
      },
      width: '179',
      renderer: {
        type: 'button',
      },
    },
    {
      fieldName: 'col13',
      header: {
        text: t('MSG_TXT_ADJ_YN'),
        styleName: 'essential',
      },
      width: '179',
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    const { col1 } = g.getValues(itemIndex);
    // TODO 넘길 param 사용일시, 카드번호, 가맹점, 승인번호, 사용금액, 원천세정산번호
    if (column === 'col12') {
      await modal({
        component: 'WwdcdMarketableSecuritiesExcdMgtP',
        componentProps: { col1 },
      });
    }
  };

  // multi row header setting
  view.setColumnLayout([
    'col1', 'col2', 'col3', 'col4', 'col5', 'col6', 'col7',
    {
      header: t('MSG_TXT_SMRY_IN'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col8', 'col9', 'col10', 'col11'],
    },
    {
      header: t('MSG_TXT_WHTX_ADJ'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col12', 'col13'],
    },
  ]);

  data.setRows([
    { col1: '2022-08-09 오전 08:03', col2: '호평센터', col3: '1111-1111-1111-1111', col4: '주식회사에스씨', col5: '11111111', col6: '123,123', col7: '정산', col8: '선택', col9: '-', col10: '-', col11: '-', col12: '원천세 정산', col13: '환불' },
  ]);
});

const initGrdSub = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
  ];
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '149', styleName: 'text-left' },
    { fieldName: 'col2', header: t('MSG_TXT_CENTER_DIVISION'), width: '206', styleName: 'text-left' },
    { fieldName: 'col3', header: t('MSG_TXT_EMPL_NM'), width: '198', styleName: 'text-left' },
    { fieldName: 'col4', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '218', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_RSB'), width: '219', styleName: 'text-left' },
    { fieldName: 'col6', header: t('MSG_TXT_OPCS_ADJ_AMT'), width: '260', styleName: 'text-right' },
    { fieldName: 'col7', header: t('MSG_TXT_WHTX'), width: '246', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
onMounted(async () => {
  fetchData();
});

defineExpose({
  setData,
});
</script>
