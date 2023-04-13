<!----
****************************************************************************************************
1. 모듈 : DCD
2. 프로그램 ID : WwdcdOperatingCostMgtMSecurities - 유가증권
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
        :total-count="mainTotalCount"
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
      :disable="mainTotalCount === 0"
      @click="onClickExcelDownload('adjustObject')"
    />
  </kw-action-top>
  <kw-grid
    ref="grdThirdRef"
    name="grdTabThird"
    :visible-rows="10"
    @init="initGrdThird"
  />
  <kw-separator />
  <h3>{{ t('MSG_TXT_WHTX_ADJ_IZ') }}</h3>
  <kw-action-top>
    <template #left>
      <kw-paging-info
        :total-count="subTotalCount"
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
      :disable="subTotalCount === 0"
      @click="onClickExcelDownload('withholdingTaxAdjust')"
    />
  </kw-action-top>
  <kw-grid
    ref="grdFourthRef"
    name="grdTabFourth"
    :visible-rows="10"
    @init="initGrdFourth"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Initialize Component
// -------------------------------------------------------------------------------------------------
import { gridUtil, getComponentType, useDataService, useGlobal, defineGrid, useModal, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import { openReportPopup } from '~common/utils/cmPopupUtil';

const dataService = useDataService();
const props = defineProps({
  initData: { type: Object, default: null },
  // initData: { type: String, default: null },
});
const { t } = useI18n();
const { modal, notify } = useGlobal();
const { ok } = useModal();
const store = useStore();
defineEmits(['fetcData']);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const mainTotalCount = ref(0);
const subTotalCount = ref(0);
const grdThirdRef = ref(getComponentType('KwGrid'));
const grdFourthRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_YN',
);

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

async function adjustObject() {
  const { initData } = props;
  cachedParams = cloneDeep(initData);
  const res = await dataService.get('/sms/wells/closing/expense/marketable-securities/adjust-object', { params: { ...cachedParams } });
  const { list: services } = res.data;
  mainTotalCount.value = res.data.length;
  const view = grdThirdRef.value.getView();
  view.getDataSource().setRows(services);
  view.resetCurrent();
}

async function withholdingTaxAdjustList() {
  const { initData } = props;
  cachedParams = cloneDeep(initData);
  const res = await dataService.get('/sms/wells/closing/expense/marketable-securities/withholding-tax-adjust', { params: { ...cachedParams } });
  const { list: services } = res.data;
  subTotalCount.value = res.data.length;
  const view = grdFourthRef.value.getView();
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
    const view = grdThirdRef.value.getView();

    await gridUtil.exportView(view, {
      fileName: t('MSG_TXT_ADJ_OJ'),
      timePostfix: true,
    });
  } else if (flag === 'withholdingTaxAdjust') {
    const view = grdFourthRef.value.getView();
    await gridUtil.exportView(view, {
      fileName: t('MSG_TXT_WHTX_ADJ_IZ'),
      timePostfix: true,
    });
  }
}

async function onClickSave() {
  const view = grdThirdRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  await dataService.post('/sms/wells/closing/expense/marketable-securities-exclude', checkedRows);
  notify(t('MSG_ALT_SAVE_DATA'));
  ok();
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdThird = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'opcsCardUseIzId', visible: false }, // 운영비카드사용내역ID
    { fieldName: 'authDate', header: t('MSG_TXT_USE_DTM'), width: '174', styleName: 'text-center' }, // 사용일시
    { fieldName: 'ogTpNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '79', styleName: 'text-center' }, // 총괄단
    { fieldName: 'cardNum', header: t('MSG_TXT_CARD_NO'), width: '159', styleName: 'text-center' }, // 카드번호
    { fieldName: 'mrcNm', header: t('MSG_TXT_MRC'), width: '96', styleName: 'text-left' }, // 가맹점
    { fieldName: 'mrcTobzNm', header: t('MSG_TXT_MER_BUS_NA'), width: '96', styleName: 'text-center' }, // 가맹점업종명
    { fieldName: 'mrcAdrCn', header: t('MSG_TXT_MER_ADD'), width: '96', styleName: 'text-center' }, // 가맹점주소
    { fieldName: 'cardAprno', header: t('MSG_TXT_APR_NO'), width: '78', styleName: 'text-center' }, // 승인번호
    { fieldName: 'requestAmount', header: t('MSG_TXT_USE_AMT'), width: '101', styleName: 'text-right' }, // 사용금액
    { fieldName: 'opcsAdjExcdYn',
      header: t('MSG_TXT_ADJ_EXCD_YN'),
      width: '126',
      styleName: 'text-left',
      options: codes.COD_YN,
      editor: {
        type: 'dropdown',
      },
      editable: true,
      hint: t('MSG_ALT_APRNO_USE_AMT_TOT_ZW_ADJ_EXCD_'),
    }, // 정산제외여부
    {
      fieldName: 'opcsAdjSmryDvCd',
      header: {
        text: t('MSG_TXT_DIV'), // 구분
        styleName: 'essential',
      },
      options: ['@'],
      editor: {
        type: 'dropdown',
      },
      width: '133',
      editable: true,
    },
    {
      fieldName: 'ojApyCn',
      header: {
        text: t('MSG_TXT_OBJ'), // 대상
        styleName: 'essential',
      },
      width: '137',
      editable: true,
    },
    {
      fieldName: 'usrSmryCn',
      header: {
        text: t('MSG_TXT_PURP'), // 구매품목 및 사용내역
        styleName: 'essential',
      },
      width: '137',
      editable: true,
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
      editable: false,
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
        component: 'WwdcdMarketableSecuritiesMgtP',
        componentProps: { authDate },
      });
    }
  };

  view.setColumnLayout([
    'opcsCardUseIzId', 'authDate', 'ogTpNm', 'cardNum', 'mrcNm', 'mrcTobzNm', 'mrcAdrCn', 'cardAprno', 'requestAmount', 'opcsAdjExcdYn', // single
    {
      header: t('MSG_TXT_ADJ_YN'), // colspan title
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

const initGrdFourth = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '149', styleName: 'text-left' }, /* 총괄단 */
    { fieldName: 'dgr3LevlOgNm', header: t('MSG_TXT_CENTER_DIVISION'), width: '206', styleName: 'text-left' }, /* 지역단 */
    { fieldName: 'usrNm', header: t('MSG_TXT_EMPL_NM'), width: '198', styleName: 'text-left' }, /* 성명 */
    { fieldName: 'opcsAdjNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '218', styleName: 'text-center' }, /* 번호 */
    { fieldName: 'crlvNm', header: t('MSG_TXT_RSB'), width: '219', styleName: 'text-left' }, /* 직책 */
    { fieldName: 'adjCnfmAmt', header: t('MSG_TXT_OPCS_ADJ_AMT'), width: '260', styleName: 'text-right' }, /* 운영비 정상금액 */
    { fieldName: 'dstWhtx', header: t('MSG_TXT_WHTX'), width: '246', styleName: 'text-right' }, /* 원천세 */
    { fieldName: 'cardAprno', header: t('MSG_TXT_APR_NO'), width: '246', styleName: 'text-right' }, /* 승인번호 */
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
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
