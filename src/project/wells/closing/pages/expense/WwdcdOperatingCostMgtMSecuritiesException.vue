<!----
****************************************************************************************************
1. 모듈 : DCD
2. 프로그램 ID : WwdcdOperatingCostMgtMSecuritiesException - 유가증권 제외
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
        :total-count="mainTotalCount"
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
      :disable="mainTotalCount === 0"
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
        :total-count="subTotalCount"
      />
      <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </template>
    <kw-btn
      icon="download_on"
      dense
      secondary
      :label="$t('MSG_BTN_EXCEL_DOWN')"
      :disable="subTotalCount === 0"
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
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const mainTotalCount = ref(0);
const subTotalCount = ref(0);
const props = defineProps({
  initData: { type: String, default: null },
});

const codes = await codeUtil.getMultiCodes(
  'COD_YN',
);

async function adjustObject() {
  const { initData } = props;
  cachedParams = { useYearMonth: cloneDeep(initData) };
  const res = await dataService.get('/sms/wells/closing/expense/marketable-securities-exclude/adjust-object', { params: cachedParams });

  const { list: services } = res.data;
  mainTotalCount.value = res.data.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(services);
  view.resetCurrent();
}

async function withholdingTaxAdjustList() {
  const { initData } = props;
  cachedParams = { useYearMonth: cloneDeep(initData) };
  const res = await dataService.get('/sms/wells/closing/expense/marketable-securities-exclude/withholding-tax-adjust', { params: cachedParams });

  const { list: services } = res.data;
  subTotalCount.value = res.data.length;
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
async function onClickExcelDownload(flag) {
  if (flag === 'adjustObject') {
    const view = grdMainRef.value.getView();
    await gridUtil.exportView(view, {
      fileName: currentRoute.value.meta.menuName,
      timePostfix: true,
    });
  } else if (flag === 'withholdingTaxAdjust') {
    const view = grdSubRef.value.getView();
    await gridUtil.exportView(view, {
      fileName: currentRoute.value.meta.menuName,
      timePostfix: true,
    });
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'opcsCardUseIzId', visible: false }, // 운영비카드사용내역ID
    { fieldName: 'authDate', header: t('MSG_TXT_USE_DTM'), width: '174', styleName: 'text-center' }, // 사용일시
    { fieldName: 'ogTpNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '71', styleName: 'text-left' }, // 총괄단
    { fieldName: 'cardNum', header: t('MSG_TXT_CARD_NO'), width: '172', styleName: 'text-center' }, // 카드번호
    { fieldName: 'mrcNm', header: t('MSG_TXT_MRC'), width: '122', styleName: 'text-left' }, // 가맹점
    { fieldName: 'mrcTobzNm', header: t('MSG_TXT_MRC'), width: '122', styleName: 'text-left' }, // 가맹점 업종명
    { fieldName: 'mrcAdrCn', header: t('MSG_TXT_MRC'), width: '122', styleName: 'text-left' }, // 가맹점 주소
    { fieldName: 'cardAprno', header: t('MSG_TXT_APR_NO'), width: '101', styleName: 'text-center' }, // 승인번호
    { fieldName: 'requestAmounts', header: t('MSG_TXT_USE_AMT'), width: '101', styleName: 'text-right' }, // 사용금액
    { fieldName: 'opcsAdjExcdYn',
      header: t('MSG_TXT_ADJ_EXCD_YN'),
      editable: true,
      width: '131',
      options: codes.COD_YN,
      editor: {
        type: 'dropdown',
      },
      hint: t('MSG_ALT_APRNO_USE_AMT_TOT_ZW_ADJ_EXCD_'),
    }, // 정산제외여부
    {
      fieldName: 'opcsAdjSmryDvCd',
      header: {
        text: t('MSG_TXT_DIV'), // 구분
        styleName: 'essential',
      },
      editable: true,
      width: '133',
      options: ['@'],
      editor: {
        type: 'dropdown',
      },
    },
    {
      fieldName: 'ojApyCn',
      header: {
        text: t('MSG_TXT_OBJ'), // 대상
        styleName: 'essential',
      },
      editable: true,
      width: '137',
    },
    {
      fieldName: 'usrSmryCn',
      header: {
        text: t('MSG_TXT_PURP'), // 구매품목 및 사용내역
        styleName: 'essential',
      },
      editable: true,
      width: '137',
    },
    {
      fieldName: 'adjyn',
      header: {
        text: t('MSG_TXT_PRCHS_ITM_USE_IZ'), // 원천세 정산
        styleName: 'essential',
      },
      width: '179',
    },
    {
      fieldName: 'mscrwhtxcfdcapnfileid',
      header: {
        text: t('MSG_TXT_WHTX_ADJ'), // 정산여부
        styleName: 'essential',
      },
      width: '179',
      styleName: 'text-center',
      renderer: {
        type: 'button',
      },
    },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    const { authDate } = g.getValues(itemIndex);
    // TODO 넘길 param 사용일시, 카드번호, 가맹점, 승인번호, 사용금액, 원천세정산번호
    if (column === 'adjyn') {
      await modal({
        component: 'WwdcdMarketableSecuritiesExcdMgtP',
        componentProps: { authDate },
      });
    }
  };

  // multi row header setting
  view.setColumnLayout([
    'authDate', 'ogTpNm', 'cardNum', 'mrcNm', 'mrcTobzNm', 'mrcAdrCn', 'cardAprno', 'requestAmounts', 'opcsAdjExcdYn',
    {
      header: t('MSG_TXT_SMRY_IN'), // colspan title
      direction: 'horizontal', // merge type
      items: ['opcsAdjSmryDvCd', 'ojApyCn', 'usrSmryCn'],
    },
    {
      header: t('MSG_TXT_WHTX_ADJ'), // colspan title
      direction: 'horizontal', // merge type
      items: ['adjyn', 'mscrwhtxcfdcapnfileid'],
    },
  ]);
});

const initGrdSub = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'adjDeptOgId', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '149', styleName: 'text-left' }, /* 총괄단 */
    { fieldName: 'ogTpCd', header: t('MSG_TXT_CENTER_DIVISION'), width: '206', styleName: 'text-left' }, /* 지역단 */
    { fieldName: 'usrNm', header: t('MSG_TXT_EMPL_NM'), width: '198', styleName: 'text-left' }, /* 성명 */
    { fieldName: 'opcsAdjNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '218', styleName: 'text-center' }, /* 번호 */
    { fieldName: 'crlvNm', header: t('MSG_TXT_RSB'), width: '219', styleName: 'text-left' }, /* 직책 */
    { fieldName: 'adjCnfmAmt', header: t('MSG_TXT_OPCS_ADJ_AMT'), width: '260', styleName: 'text-right' }, /* 운영비 정상금액 */
    { fieldName: 'dstWhtx', header: t('MSG_TXT_WHTX'), width: '246', styleName: 'text-right' }, /* 원천세 */
    { fieldName: 'cardAprno', header: t('MSG_TXT_WHTX'), width: '246', styleName: 'text-right' }, /* 승인번호 */
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

defineExpose({
  setData,
});
</script>
