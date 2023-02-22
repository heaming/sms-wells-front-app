<!----
****************************************************************************************************
1. 모듈 : DCD
2. 프로그램 ID : WwdcdOperatingCostMgtMMarketableSecurities - 유가증권
3. 작성자 : kim juhyun
4. 작성일 : 2023.02.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 유가증권 프로그램
****************************************************************************************************
--->
<template>
  <h3>{{ t('MSG_TXT_ADJ_OJ') }}</h3>
  <kw-action-top>
    <template #left>
      <kw-paging-info
        :total-count="mainPageInfo.totalCount"
      />
    </template>
    <kw-btn
      dense
      grid-action
      :label="$t('MSG_BTN_SAVE')"
      @click="onClickSave"
    />

    <kw-separator
      spaced
      vertical
      inset
    />
    <kw-btn
      icon="download_on"
      dense
      secondary
      :label="$t('MSG_BTN_EXCEL_DOWN')"
      :disable="mainPageInfo.totalCount === 0"
      @click="onClickExcelDownload('adjustObject')"
    />
  </kw-action-top>
  <kw-grid
    ref="grdMainRef"
    name="grdTabThird"
    :visible-rows="10"
    @init="initGrdMain"
  />
  <kw-separator />
  <h3>{{ t('MSG_TXT_WHTX_ADJ_IZ') }}</h3>
  <kw-action-top>
    <template #left>
      <kw-paging-info
        :total-count="subPageInfo.totalCount"
      />
      <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </template>
    <kw-btn
      icon="report"
      dense
      secondary
      :label="$t('MSG_TXT_RPT_BRWS')"
      @click="onClickOpenReport"
    />
    <kw-btn
      icon="download_on"
      dense
      secondary
      :label="$t('MSG_BTN_EXCEL_DOWN')"
      :disable="subPageInfo.totalCount === 0"
      @click="onClickExcelDownload('withholdingTaxAdjust')"
    />
  </kw-action-top>
  <kw-grid
    ref="grdSubRef"
    name="grdTabFourth"
    :visible-rows="10"
    @init="initGrdSub"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Initialize Component
// -------------------------------------------------------------------------------------------------
import { codeUtil, gridUtil, getComponentType, useDataService, useGlobal, defineGrid, useModal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import { openReportPopup } from '~common/utils/cmPopupUtil';

const dataService = useDataService();
const props = defineProps({
  initData: { type: Object, default: null },
  // initData: { type: String, default: null },
});
const { t } = useI18n();
const { modal, confirm, notify } = useGlobal();
const { ok } = useModal();
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

const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));

async function onClickOpenReport() {
  const { initData } = props;
  const params = initData;
  params.userId = store.getters['meta/getUserInfo'].userId;

  // TODO.oz 리포트 W-CL-R-0009 띄워야함 하직 화면 없음
  openReportPopup(
    '/ksswells/ord/er/V4.90/contractL23.ozr',
    '/ksswells/ord/er/V4.90/contractL23',
    { wpnSeq: params },
    { wpnSeq: '202206671335' },
  );
}

let cachedParams;
async function adjustObject() {
  const view = grdMainRef.value.getView();
  const mainServices = ([
    { col1: '2022-08-09 오전 08:03', col2: '호평센터', col3: '1111-1111-1111-1111', col4: '주식회사에스씨', col5: '11111111', col6: '123,123', col7: '정산', col8: '선택', col9: '-', col10: '-', col11: '-', col12: '-', col13: '원천세 정산' },
  ]);
  mainPageInfo.value.totalCount = 1;
  view.getDataSource().setRows(mainServices);
  view.resetCurrent();

  /* 뒷단 완료되면 다시 할꺼
  const { initData } = props;
  cachedParams = { useYearMonth: cloneDeep(initData) };
  cachedParams.registration = 'adjustObject';
  const res = await dataService.get('/sms/wells/expense/operating-cost', { params: { ...cachedParams } });
  if (res.data) return;
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
  adjustObject();
  withholdingTaxAdjustList();
}

async function setData() {
  fetchData();
}

async function onClickExcelDownload(flag) {
  if (flag === 'adjustObject') {
    const view = grdMainRef.value.getView();

    await gridUtil.exportView(view, {
      fileName: t('MSG_TXT_MSCR_MSG_TXT_ADJ_OJ'),
      timePostfix: true,
    });
  } else if (flag === 'withholdingTaxAdjust') {
    const view = grdSubRef.value.getView();
    await gridUtil.exportView(view, {
      fileName: t('MSG_TXT_MSG_TXT_MSCR_MSG_TXT_WHTX_ADJ_IZ'),
      timePostfix: true,
    });
  }
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
    { fieldName: 'col14' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_USE_DTM'), width: '174', styleName: 'text-center' }, // 사용일시
    { fieldName: 'col2', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '79', styleName: 'text-center' }, // 총괄단
    { fieldName: 'col3', header: t('MSG_TXT_CARD_NO'), width: '159', styleName: 'text-center' }, // 카드번호
    { fieldName: 'col4', header: t('MSG_TXT_MRC'), width: '96', styleName: 'text-left' }, // 가맹점
    { fieldName: 'col5', header: t('MSG_TXT_MER_BUS_NA'), width: '96', styleName: 'text-center' }, // 가맹점업종명
    { fieldName: 'col6', header: t('MSG_TXT_MER_ADD'), width: '96', styleName: 'text-center' }, // 가맹점주소
    { fieldName: 'col7', header: t('MSG_TXT_APR_NO'), width: '78', styleName: 'text-center' }, // 승인번호
    { fieldName: 'col8', header: t('MSG_TXT_USE_AMT'), width: '101', styleName: 'text-right' }, // 사용금액
    { fieldName: 'col9', header: t('MSG_TXT_ADJ_EXCD_YN'), width: '126', styleName: 'text-left', hint: '승인번호 동일 건의 사용금액 합이 0원인 경우만 정산제외 가능합니다' }, // 정산제외여부, hint : 승인번호 동일 건의 사용금액 합이 0원인 경우만 정산제외 가능합니다.
    { fieldName: 'col10', header: { text: t('MSG_TXT_DIV'), styleName: 'essential' }, width: '120', styleName: 'text-left' }, // 구분
    { fieldName: 'col11', header: { text: t('MSG_TXT_OBJ'), styleName: 'essential' }, width: '124', styleName: 'text-left' }, // 대상
    { fieldName: 'col12', header: { text: t('MSG_TXT_PRCHS_ITM_USE_IZ'), styleName: 'essential' }, width: '164', styleName: 'text-left' }, // 구매품목 및 사용내역
    { fieldName: 'col13',
      header: t('MSG_TXT_WHTX_ADJ'),
      width: '100',
      styleName: 'text-center',
      renderer: {
        type: 'button',

      } }, // 원천세 정산
    { fieldName: 'col14', header: t('MSG_TXT_ADJ_YN'), width: '71', styleName: 'text-center' }, // 정산여부
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    const { col1 } = g.getValues(itemIndex);
    // TODO 넘길 param 사용일시, 카드번호, 가맹점, 승인번호, 사용금액, 원천세정산번호
    if (column === 'col13') {
      await modal({
        component: 'WwdcdMarketableSecuritiesMgtP',
        componentProps: { col1 },
      });
    }
  };

  view.setColumnLayout([
    'col1', 'col2', 'col3', 'col4', 'col5', 'col6', 'col7', 'col8', 'col9', // single
    {
      header: t('MSG_TXT_ADJ_YN'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col10', 'col11', 'col12'],
    },
    {
      header: t('MSG_TXT_WHTX_ADJ'),
      direction: 'horizontal',
      items: ['col13', 'col14'],
    },
  ]);
});

function initGrdSub(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '166', styleName: 'text-left' },
    { fieldName: 'col2', header: t('MSG_TXT_RGNL_GRP'), width: '158', styleName: 'text-left' },
    { fieldName: 'col3', header: t('MSG_TXT_EMPL_NM'), width: '175', styleName: 'text-left' },
    { fieldName: 'col4', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '164', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_RSB'), width: '171', styleName: 'text-left' },
    { fieldName: 'col6', header: t('MSG_TXT_OPCS_ADJ_AMT'), width: '218', styleName: 'text-right' },
    { fieldName: 'col7', header: t('MSG_TXT_WHTX'), width: '218', styleName: 'text-right' },
    { fieldName: 'col8', header: t('MSG_TXT_APR_NO'), width: '222', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}
onMounted(async () => {
  fetchData();
});

defineExpose({
  setData,
});
</script>
