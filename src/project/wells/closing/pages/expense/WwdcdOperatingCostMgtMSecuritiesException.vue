<!----
****************************************************************************************************
1. 모듈 : DCD
2. 프로그램 ID : WwdcdOperatingCostMgtMSecuritiesException - 운영비 등록관리 - 유가증권 제외
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
import { useGlobal, useDataService, getComponentType, defineGrid, gridUtil, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { modal, notify, alert } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const mainTotalCount = ref(0);
const subTotalCount = ref(0);

const codes = await codeUtil.getMultiCodes(
  'COD_YN',
  'OPCS_ADJ_SMRY_DV_CD',
);

const emits = defineEmits([
  'tebEvent',
]);

async function adjustObject() {
  // 유가증권 제외
  debugger;
  const res = await dataService.get('/sms/wells/closing/expense/marketable-securities-exclude/adjust-object', { params: cachedParams });

  mainTotalCount.value = res.data.length;
  const view = grdMainRef.value.getView();

  emits('tebEvent', 'basic', res.data);

  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function withholdingTaxAdjustList() {
  const res = await dataService.get('/sms/wells/closing/expense/marketable-securities-exclude/withholding-tax-adjust', { params: cachedParams });

  subTotalCount.value = res.data.length;
  const view = grdSubRef.value.getView();
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

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  view.commit();
  view.commitEditor();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const dataRows = [];
  let updateTotal = 0;
  let domTrdAmtTotal = 0;
  let checkedCount = 0;
  let cardAprno;
  checkedRows.forEach((checkedRow) => {
    if (checkedRow.opcsAdjExcdYn === 'Y') {
      dataRows.push(checkedRow);
    }
  });

  if (dataRows.length > 0) {
    const sortRows = dataRows.sort((t1, t2) => (t1.cardAprno < t2.cardAprno ? -1 : 1));
    for (let i = 0; i < sortRows.length; i += 1) {
      cardAprno = sortRows[i].cardAprno;
      domTrdAmtTotal = sortRows[i].domTrdAmt1;
      domTrdAmtTotal = 0;

      for (let j = i + 1; j < sortRows.length; j += 1) {
        if (cardAprno === sortRows[j].cardAprno) {
          domTrdAmtTotal += sortRows[j].domTrdAmt1;
          checkedCount += 1;
        } else {
          i = j;
          if (checkedCount === 1) {
            alert('2개 이상이어야 가능합니다.');
            break;
          }
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
  }

  const data = checkedRows;
  await dataService.put('/sms/wells/closing/expense/marketable-securities-exclude', data);
  notify(t('MSG_ALT_SAVE_DATA'));
  fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'opcsCardUseIzId', visible: false }, // 운영비카드사용내역ID
    { fieldName: 'dgr1LevlOgId', visible: false }, // 총괄단 ID
    { fieldName: 'dgr2LevlOgId', visible: false }, // 지역단 ID
    { fieldName: 'adjOgId', visible: false },
    { fieldName: 'domTrdAmt1', visible: false },
    { fieldName: 'opcsAdjNo', visible: false }, // 운영비정산번호
    { fieldName: 'useDtm', header: t('MSG_TXT_USE_DTM'), width: '174', styleName: 'text-center', editable: false }, // 사용일시
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '71', styleName: 'text-left', editable: false }, // 총괄단
    { fieldName: 'crcdnoEncr', header: t('MSG_TXT_CARD_NO'), width: '172', styleName: 'text-center', editable: false }, // 카드번호
    { fieldName: 'mrcNm', header: t('MSG_TXT_MRC'), width: '122', styleName: 'text-left', editable: false }, // 가맹점
    { fieldName: 'mrcTobzNm', header: t('MSG_TXT_MRC'), width: '122', styleName: 'text-left', editable: false }, // 가맹점 업종명
    { fieldName: 'mrcAdrCn', header: t('MSG_TXT_MRC'), width: '122', styleName: 'text-left', editable: false }, // 가맹점 주소
    { fieldName: 'cardAprno', header: t('MSG_TXT_APR_NO'), width: '101', styleName: 'text-center', editable: false }, // 승인번호
    { fieldName: 'domTrdAmt', header: t('MSG_TXT_USE_AMT'), width: '101', styleName: 'text-right', editable: false, dataType: 'number' }, // 사용금액
    { fieldName: 'opcsAdjExcdYn',
      header: t('MSG_TXT_ADJ_EXCD_YN'),
      editable: true,
      width: '131',
      options: [{ codeId: 'N', codeName: '정산' }, { codeId: 'Y', codeName: '정산제외' }],
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
      options: codes.OPCS_ADJ_SMRY_DV_CD,
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
      rules: 'required',
      width: '137',
    },
    {
      fieldName: 'usrSmryCn',
      header: {
        text: t('MSG_TXT_PRCHS_ITM_USE_IZ'), // 구매품목 및 사용내역
        styleName: 'essential',
      },
      width: '137',
      rules: 'required',
    },
    {
      fieldName: 'opcsAdjBtn',
      header: {
        text: t('MSG_TXT_WHTX_ADJ'), // 원천세 정산
      },
      width: '179',
      renderer: {
        type: 'button',
      },
    },
    {
      fieldName: 'adjCls',
      header: {
        text: t('MSG_TXT_ADJ_YN'), // 정산여부
      },
      width: '179',
      styleName: 'text-center',
      editable: false,
    },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  // multi row header setting
  view.setColumnLayout([
    'useDtm', 'dgr1LevlOgNm', 'crcdnoEncr', 'mrcNm', 'mrcTobzNm', 'mrcAdrCn', 'cardAprno', 'domTrdAmt', 'opcsAdjExcdYn',
    {
      header: t('MSG_TXT_SMRY_IN'), // colspan title
      direction: 'horizontal', // merge type
      items: ['opcsAdjSmryDvCd', 'ojApyCn', 'usrSmryCn'],
    },
    {
      header: t('MSG_TXT_WHTX_ADJ'), // colspan title
      direction: 'horizontal', // merge type
      items: ['opcsAdjBtn', 'adjCls'],
    },
  ]);

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    const { useDtm, mrcNm, cardAprno, domTrdAmt, opcsCardUseIzId, adjOgId, dgr1LevlOgId,
      opcsAdjNo } = g.getValues(itemIndex);
    //     사용일시, 카드번호, 가맹점, 승인번호, 사용금액, 원천세정산번호, 운영비카드ID   TODO 넘길 param
    cachedParams.useDtm = useDtm;
    cachedParams.mrcNm = mrcNm;
    cachedParams.cardAprno = cardAprno;
    cachedParams.domTrdAmt = domTrdAmt;
    cachedParams.opcsCardUseIzId = opcsCardUseIzId;
    cachedParams.adjOgId = adjOgId;// 총괄단 아이디
    cachedParams.dgr1LevlOgId = dgr1LevlOgId;
    cachedParams.opcsAdjNo = opcsAdjNo;

    console.log(itemIndex);
    if (column === 'opcsAdjBtn') {
      await modal({
        component: 'WwdcdMarketableSecuritiesExcdMgtP',
        componentProps: { cachedParams },
      });
    }
  };
});

const initGrdSub = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'erntx', visible: false }, // 소득세
    { fieldName: 'rsdntx', visible: false }, // 주민세
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '149', styleName: 'text-left' }, /* 총괄단 */
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '206', styleName: 'text-left' }, /* 지역단 */
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

defineExpose({
  setData,
});
</script>
