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
      v-show="onShowSave"
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
    ref="grdMainRef"
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
    ref="grdSubRef"
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
const { modal, notify, alert } = useGlobal();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const mainTotalCount = ref(0);
const subTotalCount = ref(0);
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const onShowSave = ref(false);

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
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
  emits('tebEvent', 'sel', res.data);
  // TODO 정산제외일경우 버튼 미노출
}

async function withholdingTaxAdjustList() {
  // 유가증권
  const res = await dataService.get('/sms/wells/closing/expense/marketable-securities/withholding-tax-adjust', { params: cachedParams });

  subTotalCount.value = res.data.length;
  const view = grdSubRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function settlementOfWithholdingTax() {
  const res = await dataService.get('/sms/wells/closing/expense/marketable-securities/withholding-tax', { params: cachedParams });

  const view = grdMainRef.value.getView();
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
  if (grdMainRef.value?.getView()) gridUtil.reCreateGrid(grdMainRef.value.getView());
  if (grdSubRef.value?.getView()) gridUtil.reCreateGrid(grdSubRef.value.getView());

  cachedParams = cloneDeep(paramData);
  fetchData();
}

async function onClickExcelDownload(flag) {
  if (flag === 'adjustObject') {
    const view = grdMainRef.value.getView();

    await gridUtil.exportView(view, {
      fileName: t('MSG_TXT_ADJ_OJ'),
      timePostfix: true,
    });
  } else if (flag === 'withholdingTaxAdjust') {
    const view = grdSubRef.value.getView();
    await gridUtil.exportView(view, {
      fileName: t('MSG_TXT_WHTX_ADJ_IZ'),
      timePostfix: true,
    });
  }
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  view.commit();
  view.commitEditor();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const exceptDatas = []; // 정산제외항목들
  checkedRows.forEach((checkedRow) => {
    if (checkedRow.opcsAdjExcdYn === 'Y') {
      exceptDatas.push(checkedRow);
    }
  });

  if (exceptDatas.length >= 2) { // 정산제외할 항목이 두 개 로우 이상일때만 체크로직 시작
    let isSatisfaction = true; // 정산제외 조건 체크완료 여부. 한 개라도 만족하지 않으면 중단
    const checkedCarAprnoList = []; // 정산제외 체크 완료한 승인번호 리스트
    exceptDatas.forEach((data) => {
      if (isSatisfaction && !checkedCarAprnoList.includes(data.cardAprno)) { // 이전데이터 체크여부가 정상이고이미 진행한 승인번호인지 확인
        // 승인번호 체크
        const exceptCarAprnoDatas = exceptDatas.filter((exceptData) => exceptData.cardAprno === data.cardAprno);
        if (exceptCarAprnoDatas < 2) { // 해당승인번호가 두 건 이상 있는지
          alert('동일한 승인번호 갯수가 2개 이상이어야 가능합니다.');
          isSatisfaction = false;
          return;
        }
        // 사용금액 합계 체크
        const domTrdAmtTotal = exceptCarAprnoDatas
          .reduce((totalAmt, currentData) => totalAmt + currentData.domTrdAmt, 0);// 사용금액 합계

        if (domTrdAmtTotal !== 0) {
          alert('승인번호가 모두 동일하여야 하며 사용금액 합계가 0 이 되어야 합니다.');
          isSatisfaction = false;
        } else {
          checkedCarAprnoList.push(data.cardAprno); // 같은 승인번호의 사용금액의 합계가 0이면 체크완료
        }
      }
    });
    if (!isSatisfaction) { // 정산제외 조건 체크완료 여부. 한 개라도 만족하지 않으면 wjwkd 중단
      return;
    }
  }

  const data = checkedRows;
  await dataService.put('/sms/wells/closing/expense/marketable-securities', data);
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
    { fieldName: 'opcsAdjNo', visible: false }, // 운영비정산번호
    { fieldName: 'adjPrtnrNo', visible: false },
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
    const { useDtm, mrcNm, cardAprno, domTrdAmt,
      opcsCardUseIzId, adjOgId, dgr1LevlOgId, adjPrtnrNo } = g.getValues(itemIndex);
    //     사용일시, 카드번호, 가맹점, 승인번호, 사용금액, 원천세정산번호, 운영비카드ID   TODO 넘길 param
    cachedParams.authDate = useDtm;
    cachedParams.mrcNm = mrcNm;
    cachedParams.cardAprno = cardAprno;
    cachedParams.domTrdAmt = domTrdAmt;
    cachedParams.opcsCardUseIzId = opcsCardUseIzId;
    cachedParams.adjOgId = adjOgId;// 총괄단 아이디
    cachedParams.dgr1LevlOgId = dgr1LevlOgId;
    cachedParams.adjPrtnrNo = adjPrtnrNo;

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
onMounted(async () => {
  fetchData();
});

defineExpose({
  setData,
});
</script>
