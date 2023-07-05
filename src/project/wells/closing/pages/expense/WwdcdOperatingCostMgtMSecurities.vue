<!----
****************************************************************************************************
1. 모듈 : DCD
2. 프로그램 ID : WwdcdOperatingCostMgtMSecurities - 운영비 등록관리 - 유가증권
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
import { gridUtil, getComponentType, useDataService, useGlobal, defineGrid, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import { openReportPopup } from '~common/utils/cmPopupUtil';

const dataService = useDataService();

const { t } = useI18n();
const { modal, notify } = useGlobal();
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
  'OPCS_ADJ_SMRY_DV_CD',
);

async function onClickOpenReport() {
  // params.userId = store.getters['meta/getUserInfo'].userId;

  // TODO.oz 리포트 W-CL-R-0009 띄워야함 하직 화면 없음
  openReportPopup(
    '/ksswells/ord/er/V4.90/contractL23.ozr',
    '/ksswells/ord/er/V4.90/contractL23',
    // { wpnSeq: params },
    { wpnSeq: '202206671335' },
  );
}

const emits = defineEmits([
  'tebEvent',
]);

async function adjustObject() {
  // 유가증권
  const res = await dataService.get('/sms/wells/closing/expense/marketable-securities/adjust-object', { params: cachedParams });

  mainTotalCount.value = res.data.length;
  const view = grdThirdRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
  emits('tebEvent', 'sel', res.data);
}

async function withholdingTaxAdjustList() {
  // 유가증권
  const res = await dataService.get('/sms/wells/closing/expense/marketable-securities/withholding-tax-adjust', { params: cachedParams });

  subTotalCount.value = res.data.length;
  const view = grdFourthRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function fetchData() {
  adjustObject();
  withholdingTaxAdjustList();
}

async function setData(paramData) {
  cachedParams = cloneDeep(paramData);
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

  view.commit();
  view.commitEditor();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  let count = 0;
  let checkedCount = 0;
  checkedRows.forEach((checkedRow) => {
    if (checkedRow.opcsAdjExcdYn !== '정산' && checkedRow.opcsAdjExcdYn !== 'N') {
      count += 1;
    }
    checkedCount += 1;
  });

  if (count > 0) {
    alert('정상제외여부가 "정산"이어야 가능 합니다.');
    return;
  }

  if (checkedCount <= 1) {
    alert('2개 이상이어야 가능합니다.');
    return;
  }

  let updateTotal = 0;
  let domTrdAmtTotal = 0;
  let cardAprno;
  const sortRows = checkedRows.sort((t1, t2) => (t1.cardAprno < t2.cardAprno ? -1 : 1));
  for (let i = 0; i < sortRows.length; i += 1) {
    cardAprno = sortRows[i].cardAprno;
    domTrdAmtTotal = sortRows[i].domTrdAmt1;
    domTrdAmtTotal = 0;

    for (let j = i + 1; j < sortRows.length; j += 1) {
      if (cardAprno === sortRows[j].cardAprno) {
        domTrdAmtTotal += sortRows[j].domTrdAmt1;
      } else {
        i = j;
      }
    }
    if (domTrdAmtTotal > 0) {
      updateTotal += 1;
    }
  }

  if (updateTotal > 0) {
    alert('승인번호가 모두 동일하여야 하며 사용금액 합계가 0 이 되어야 합니다.');
    return;
  }

  const data = checkedRows;
  await dataService.post('/sms/wells/closing/expense/marketable-securities', data);
  notify(t('MSG_ALT_SAVE_DATA'));
  fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdThird = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'opcsCardUseIzId', visible: false }, // 운영비카드사용내역ID
    { fieldName: 'dgr1LevlOgId', visible: false }, // 총괄단 ID
    { fieldName: 'adjOgId', visible: false },
    { fieldName: 'domTrdAmt1', visible: false }, // 계산용 사용금액
    { fieldName: 'useDtm', header: t('MSG_TXT_USE_DTM'), width: '174', styleName: 'text-center', editable: false }, // 사용일시
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '79', styleName: 'text-center', editable: false }, // 총괄단
    { fieldName: 'crcdnoEncr', header: t('MSG_TXT_CARD_NO'), width: '159', styleName: 'text-center', editable: false }, // 카드번호
    { fieldName: 'mrcNm', header: t('MSG_TXT_MRC'), width: '96', styleName: 'text-left', editable: false }, // 가맹점
    { fieldName: 'mrcTobzNm', header: t('MSG_TXT_MER_BUS_NA'), width: '96', styleName: 'text-center', editable: false }, // 가맹점업종명
    { fieldName: 'mrcAdrCn', header: t('MSG_TXT_MER_ADD'), width: '96', styleName: 'text-center', editable: false }, // 가맹점주소
    { fieldName: 'cardAprno', header: t('MSG_TXT_APR_NO'), width: '78', styleName: 'text-center', editable: false }, // 승인번호
    { fieldName: 'domTrdAmt', header: t('MSG_TXT_USE_AMT'), width: '101', styleName: 'text-right', editable: false, dataType: 'number' }, // 사용금액
    { fieldName: 'opcsAdjExcdYn',
      header: t('MSG_TXT_ADJ_EXCD_YN'),
      width: '126',
      styleName: 'text-left',
      options: [{ codeId: 'N', codeName: '정산' }, { codeId: 'Y', codeName: '정산제외' }],
      editor: {
        type: 'dropdown',
      },
      rules: 'required',
      hint: t('MSG_ALT_APRNO_USE_AMT_TOT_ZW_ADJ_EXCD_'),
    }, // 정산제외여부
    {
      fieldName: 'opcsAdjSmryDvCd',
      header: {
        text: t('MSG_TXT_DIV'), // 구분
        styleName: 'essential',
      },
      options: codes.OPCS_ADJ_SMRY_DV_CD,
      editor: {
        type: 'dropdown',
      },
      width: '133',
      rules: 'required',
    },
    {
      fieldName: 'ojApyCn',
      header: {
        text: t('MSG_TXT_OBJ'), // 대상
        styleName: 'essential',
      },
      width: '137',
      rules: 'required',
    },
    {
      fieldName: 'usrSmryCn',
      header: {
        text: t('MSG_TXT_PURP'), // 구매품목 및 사용내역
        styleName: 'essential',
      },
      width: '137',
      rules: 'required',
    },
    {
      fieldName: 'opcsAdjBtn',
      header: {
        text: t('MSG_TXT_PRCHS_ITM_USE_IZ'), // 원천세 정산
        styleName: 'essential',
      },
      width: '179',
      renderer: {
        type: 'button',
      },
    },
    {
      fieldName: 'adjCls',
      header: {
        text: t('MSG_TXT_WHTX_ADJ'), // 정산여부
        styleName: 'essential',
      },
      width: '179',
      editable: false,
      styleName: 'text-center',
    },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    const { useDtm, mrcNm, cardAprno, domTrdAmt, opcsCardUseIzId, adjOgId, dgr1LevlOgId } = g.getValues(itemIndex);
    //     사용일시, 카드번호, 가맹점, 승인번호, 사용금액, 원천세정산번호   TODO 넘길 param
    cachedParams.authDate = useDtm;
    cachedParams.mrcNm = mrcNm;
    cachedParams.cardAprno = cardAprno;
    cachedParams.domTrdAmt = domTrdAmt;
    cachedParams.opcsCardUseIzId = opcsCardUseIzId;
    cachedParams.adjOgId = adjOgId;// 총괄단 아이디
    cachedParams.dgr1LevlOgId = dgr1LevlOgId;
    debugger;
    if (column === 'opcsAdjBtn') {
      await modal({
        component: 'WwdcdMarketableSecuritiesMgtP',
        componentProps: { cachedParams },
      });
    }
  };

  view.setColumnLayout([
    'useDtm', 'dgr1LevlOgNm', 'crcdnoEncr', 'mrcNm', 'mrcTobzNm', 'mrcAdrCn', 'cardAprno', 'domTrdAmt', 'opcsAdjExcdYn', // single
    {
      header: t('MSG_TXT_ADJ_YN'), // colspan title
      direction: 'horizontal', // merge type
      items: ['opcsAdjSmryDvCd', 'ojApyCn', 'usrSmryCn'],
    },
    {
      header: t('MSG_TXT_WHTX_ADJ'), // colspan title
      direction: 'horizontal', // merge type
      items: ['opcsAdjBtn', 'adjCls'],
    },
  ]);
});

const initGrdFourth = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'erntx', visible: false }, // 소득세
    { fieldName: 'rsdntx', visible: false }, // 주민세
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '149', styleName: 'text-left' }, /* 총괄단 */
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_CENTER_DIVISION'), width: '206', styleName: 'text-left' }, /* 지역단 */
    { fieldName: 'dstOjpsNm', header: t('MSG_TXT_EMPL_NM'), width: '198', styleName: 'text-left' }, /* 성명 */
    { fieldName: 'dstOjPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '218', styleName: 'text-center' }, /* 번호 */
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_RSB'), width: '219', styleName: 'text-left' }, /* 직책 */
    { fieldName: 'dstAmt', header: t('MSG_TXT_OPCS_ADJ_AMT'), width: '260', styleName: 'text-right', dataType: 'number' }, /* 운영비 정상금액 */
    { fieldName: 'dstWhtx', header: t('MSG_TXT_WHTX'), width: '246', styleName: 'text-right', dataType: 'number' }, /* 원천세 */
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
