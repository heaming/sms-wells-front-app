<!----
****************************************************************************************************
1. 모듈 : DCD
2. 프로그램 ID : WwdcdOperatingCostMgtMSecuritiesException - 운영비 등록관리 - 유가증권 제외 W-CL-U-0082P02
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
      <kw-paging-info :total-count="mainTotalCount" />
      <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </template>
    <kw-btn
      v-show="onShowSave"
      v-permission:create
      :label="$t('MSG_BTN_SAVE')"
      grid-action
      dense
      @click="onClickSave"
    />
    <kw-separator
      spaced
      vertical
      inset
    />
    <kw-btn
      v-permission:download
      icon="download_on"
      dense
      secondary
      :label="$t('MSG_BTN_EXCEL_DOWN')"
      :disable="mainTotalCount === 0"
      @click="onClickExcelDownload('adjustObject')"
    />
  </kw-action-top>
  <kw-grid
    ref="grdFirstRef"
    name="grdTabFirst"
    :visible-rows="5"
    @init="initGrdFirst"
  />
  <kw-separator />
  <h3>{{ t('MSG_TXT_WHTX_ADJ_IZ') }}</h3>
  <kw-action-top>
    <template #left>
      <kw-paging-info :total-count="subTotalCount" />
      <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </template>
    <kw-btn
      v-permission:download
      icon="download_on"
      dense
      secondary
      :label="$t('MSG_BTN_EXCEL_DOWN')"
      :disable="subTotalCount === 0"
      @click="onClickExcelDownload('withholdingTaxAdjust')"
    />
  </kw-action-top>
  <kw-grid
    ref="grdSecondRef"
    name="grdTabSecond"
    :visible-rows="5"
    @init="initGrdSecond"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Initialize Component
// -------------------------------------------------------------------------------------------------
import { gridUtil, getComponentType, useDataService, useGlobal, defineGrid, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { modal, notify, alert } = useGlobal();
const { t } = useI18n();
const { currentRoute } = useRouter();
const emits = defineEmits([
  'search',
]);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const grdFirstRef = ref(getComponentType('KwGrid'));
const grdSecondRef = ref(getComponentType('KwGrid'));
const mainTotalCount = ref(0);
const subTotalCount = ref(0);
const onShowSave = ref(false);

const codes = await codeUtil.getMultiCodes(
  'COD_YN',
  'OPCS_ADJ_SMRY_DV_CD',
);

// 정산대상 - 유가증권 제외
async function adjustObject() {
  const res = await dataService.get('/sms/wells/closing/expense/marketable-securities-exclude/adjust-object', { params: cachedParams });
  mainTotalCount.value = res.data.length;
  const view = grdFirstRef.value.getView();
  view.getDataSource().setRows(res.data);
}

// 원천세 정산내역
async function withholdingTaxAdjustList() {
  const res = await dataService.get('/sms/wells/closing/expense/marketable-securities-exclude/withholding-tax-adjust', { params: cachedParams });

  subTotalCount.value = res.data.length;
  const view = grdSecondRef.value.getView();
  view.getDataSource().setRows(res.data);
}

// 정산대상 저장버튼 및 원천세정산 버튼 세팅
async function settlementOfWithholdingTax() {
  const res = await dataService.get('/sms/wells/closing/expense/marketable-securities-exclude/withholding-tax', { params: cachedParams });
  const view = grdFirstRef.value.getView();
  if (res.data === 'N') {
    onShowSave.value = false;
    view.columnByName('opcsAdjBtn').visible = false;
  } else {
    onShowSave.value = true;
    view.columnByName('opcsAdjBtn').visible = true;
  }
}

async function fetchData() {
  adjustObject();
  withholdingTaxAdjustList();
  settlementOfWithholdingTax();
}

async function setData(paramData) {
  if (grdFirstRef.value?.getView()) gridUtil.reCreateGrid(grdFirstRef.value.getView());
  if (grdSecondRef.value?.getView()) gridUtil.reCreateGrid(grdSecondRef.value.getView());
  cachedParams = cloneDeep(paramData);
  await fetchData();
}

// 저장
async function onClickSave() {
  const view = grdFirstRef.value.getView();
  const viewRows = gridUtil.getAllRowValues(view); // 모든 데이터
  const checkedRows = gridUtil.getCheckedRowValues(view); // 체크된 데이터

  view.commit();
  view.commitEditor();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const exceptDatas = viewRows.filter((row) => row.opcsAdjExcdYn === '정산제외'); // 정산제외항목들
  if (exceptDatas.length > 0) { // 전체 데이터 중에 정산제외 데이터가 있다면
    const checkedCarAprnoList = []; // 정산제외 체크 완료한 승인번호 리스트
    for (let i = 0; i < exceptDatas.length; i += 1) {
      if (!checkedCarAprnoList.includes(exceptDatas[i].cardAprno)) { // 체크하지 않은 승인번호만 진행
        // 승인번호 체크
        const exceptCarAprnoDatas = checkedRows
          .filter((checkedRow) => (checkedRow.opcsAdjExcdYn === '정산제외' && checkedRow.cardAprno === exceptDatas[i].cardAprno));
        if (exceptCarAprnoDatas < 2) { // 해당 승인번호가 체크된 내용중 두 건 이상 있는지
          notify(t('MSG_ALT_SAME_APRNO_SEVERAL')); // "동일한 승인번호 개수가 2개 이상이어야 가능합니다."
          return false;
        }
        // 사용금액 합계 체크
        const domTrdAmtTotal = exceptCarAprnoDatas
          .reduce((totalAmt, currentData) => totalAmt + currentData.domTrdAmt, 0);// 사용금액 합계

        if (domTrdAmtTotal !== 0) {
          notify(t('MSG_ALT_SAME_APRNO_SUM_USEAMT')); // 승인번호가 모두 동일하면서 사용금액 합계가 0이 되어야 합니다.
          return false;
        }
        checkedCarAprnoList.push(exceptDatas[i].cardAprno); // 같은 승인번호의 사용금액의 합계가 0이면 체크완료
      }
    }
  }

  const data = checkedRows;
  await dataService.put('/sms/wells/closing/expense/marketable-securities-exclude', data);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdFirst = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'opcsCardUseIzId', visible: false }, // 운영비카드사용내역ID
    { fieldName: 'adjOgId', visible: false },
    { fieldName: 'opcsAdjNo', visible: false }, // 운영비정산번호
    { fieldName: 'adjPrtnrNo', visible: false },
    { fieldName: 'ogTpCd', visible: false },
    { fieldName: 'useDtm', header: t('MSG_TXT_USE_DTM'), width: '174', styleName: 'text-center', editable: false }, // 사용일시
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_OG_NM'), width: '71', styleName: 'text-left', editable: false }, // 조직명
    { fieldName: 'crcdnoEncr', header: t('MSG_TXT_CARD_NO'), width: '172', styleName: 'text-center', editable: false }, // 카드번호
    { fieldName: 'mrcNm', header: t('MSG_TXT_MRC'), width: '122', styleName: 'text-left', editable: false }, // 가맹점
    { fieldName: 'mrcTobzNm', header: t('MSG_TXT_MER_BUS_NA'), width: '122', styleName: 'text-left', editable: false }, // 가맹점 업종명
    { fieldName: 'mrcAdrCn', header: t('MSG_TXT_MER_ADD'), width: '122', styleName: 'text-left', editable: false }, // 가맹점 주소
    { fieldName: 'cardAprno', header: t('MSG_TXT_APR_NO'), width: '101', styleName: 'text-center', editable: false }, // 승인번호
    { fieldName: 'domTrdAmt', header: t('MSG_TXT_USE_AMT'), width: '101', styleName: 'text-right', editable: false, dataType: 'number' }, // 사용금액
    { fieldName: 'opcsAdjExcdYn',
      header: t('MSG_TXT_ADJ_EXCD_YN'),
      editable: true,
      width: '131',
      options: [{ codeId: '정산', codeName: t('MSG_TXT_ADJ') }, { codeId: '정산제외', codeName: t('MSG_TXT_ADJ_EXCD') }],
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
        styleName: 'essential',
      },
      width: '179',
      value: '원천세 정산',
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

  view.onCellItemClicked = async (grid, { column, itemIndex }) => {
    const { useDtm, mrcNm, cardAprno, domTrdAmt, opcsCardUseIzId, opcsAdjNo,
      adjPrtnrNo, ogTpCd, opcsAdjExcdYn } = grid.getValues(itemIndex);
    cachedParams.authDate = useDtm;
    cachedParams.mrcNm = mrcNm;
    cachedParams.opcsAdjNo = opcsAdjNo;
    cachedParams.cardAprno = cardAprno; // 카드승인번호
    cachedParams.domTrdAmt = domTrdAmt;
    cachedParams.opcsCardUseIzId = opcsCardUseIzId;
    cachedParams.adjPrtnrNo = adjPrtnrNo; // 정산파트너번호
    cachedParams.ogTpCd = ogTpCd; // 조직유형코드
    if (column === 'opcsAdjBtn') {
    //   if (adjCls === '완료') {
    //     alert(t('정산이 완료된 건입니다'));
    //     return;
    //   }
      if (opcsAdjExcdYn === '정산제외') {
        alert(t('MSG_ALT_WHTX_ADJ_IMPOSSIBLE'));
        return;
      }
      await modal({
        component: 'WwdcdMarketableSecuritiesExcdMgtP',
        componentProps: { cachedParams },
      });
      await emits('search');
    }
  };
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
});

const initGrdSecond = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'erntx', visible: false }, // 소득세
    { fieldName: 'rsdntx', visible: false }, // 주민세
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_OG_NM'), width: '149', styleName: 'text-left' }, /* 조직명 */
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '206', styleName: 'text-left' }, /* 지역단 */
    { fieldName: 'dstOjpsNm', header: t('MSG_TXT_EMPL_NM'), width: '198', styleName: 'text-left' }, /* 성명 */
    { fieldName: 'dstOjPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '218', styleName: 'text-center' }, /* 번호 */
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_RSB'), width: '219', styleName: 'text-left' }, /* 직책 */
    { fieldName: 'dstAmt', header: t('MSG_TXT_OPCS_ADJ_AMT'), width: '260', styleName: 'text-right', dataType: 'number' }, /* 운영비 정상금액 */
    { fieldName: 'dstWhtx', header: t('MSG_TXT_WHTX'), width: '246', styleName: 'text-right', dataType: 'number' }, /* 원천세 */
    { fieldName: 'cardAprno', header: t('MSG_TXT_APR_NO'), width: '246', styleName: 'text-left' }, /* 승인번호 */
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

// 엑셀 다운로드 버튼
async function onClickExcelDownload(type) {
  const view = type === 'adjustObject' ? grdFirstRef.value.getView() : grdSecondRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName} ${type === 'adjustObject' ? t('MSG_TXT_ADJ_OJ') : t('MSG_TXT_WHTX_ADJ_IZ')}`,
    timePostfix: true,
  });
}

defineExpose({
  setData,
});
</script>
