<!----
****************************************************************************************************
1. 모듈 : DCD
2. 프로그램 ID : WwdcdMarketableSecuritiesExcdMgtP - 운영비 원천세 정산(유가증권 제외)
3. 작성자 : gs.piit172 kim juhyun
4. 작성일 : 2023.02.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 운영비 원천세 정산(유가증권 제외) 프로그램
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--2xl"
  >
    <kw-action-top>
      <template #left>
        <span>{{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdPopMain"
      :visible-rows="1"
      @init="initGrdMain"
    />

    <!-- 조회 -->
    <kw-search
      :cols="2"
      class="mt30"
      :modified-targets="['grdPopSub']"
      @search="onClickSearch"
      @reset="reset"
    >
      <kw-search-row>
        <!-- 지역단 -->
        <kw-search-item
          :label="$t('MSG_TXT_RGNL_GRP')"
          required
        >
          <zwog-level-select
            v-model:og-levl-dv-cd2="searchParams.dgr2LevlOgId"
            :og-tp-cd="searchParams.ogTpCd"
            :base-ym="searchParams.baseYm"
            :start-level="2"
            :end-level="2"
            first-option="all"
            rules="required"
          />
        </kw-search-item>

        <!-- 빌딩명 -->
        <kw-search-item :label="$t('MSG_TXT_BLD_NM')">
          <kw-select
            v-model="searchParams.bldCd"
            :options="buildingCodes"
            option-value="bldCd"
            option-label="bldNm"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!-- 직책 -->
        <kw-search-item :label="$t('MSG_TXT_RSB')">
          <kw-option-group
            v-model="searchParams.rsbDvCd"
            type="radio"
            :options="position"
          />
        </kw-search-item>
        <!-- 대상자 -->
        <kw-search-item :label="$t('MSG_TXT_ELIGIBILITY')">
          <kw-input
            v-model="searchParams.dstOjpsNm"
            icon="search"
            clearable
            @click-icon="onClickSearchPartner"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <h3>
      {{ t('MSG_TXT_OJPS_INQR_RS') }} <!-- 대상자 조회 결과 -->
      <ul class="kw-notification">
        <li>
          <span class="kw-fc--primary">{{ t('MSG_TXT_AMT_IN_AFT_OJPS_SPMT_BUTN_CLK') }}</span>
        </li>
      </ul>
    </h3>

    <kw-action-top class="mt20">
      <template #left>
        <kw-paging-info :total-count="subTotalCount" />
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <kw-btn
        dense
        secondary
        :label="$t('MSG_TXT_EQLTY_DIVD')"
        @click="onClickEquality"
      />
      <kw-btn
        dense
        secondary
        :label="$t('MSG_TXT_PERF_CPR')"
        @click="onClickPerformance"
      />
      <kw-btn
        dense
        secondary
        :label="$t('MSG_TXT_BAL_CLE')"
        @click="onClickBalanceAmount"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <!-- 대상자 추가 -->
      <kw-btn
        primary
        dense
        :label="$t('MSG_TXT_OJPS_SPMT')"
        @click="onClickObjectPersonAdd"
      />
    </kw-action-top>
    <kw-grid
      ref="grdSubRef"
      name="grdPopSub"
      :visible-rows="5"
      class="mb10"
      @init="initGrdSub"
    />
    <h3>
      {{ t('MSG_TXT_FNL_WHTX_ADJ_OJPS') }}
      <ul class="kw-notification">
        <li>
          <span class="kw-fc--primary">{{ t('MSG_TXT_SEL_THE_TAR_YOU_WA_TO_EXC_AND_CK_THE_EXC_TAR_BTN') }}</span>
        </li>
      </ul>
    </h3>

    <kw-action-top class="mt20">
      <template #left>
        <kw-paging-info :total-count="thirdTotalCount" />
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <kw-btn
        primary
        dense
        :label="$t('MSG_TXT_OJPS_EXCD')"
        @click="onClickObjectPersonDel"
      />
    </kw-action-top>
    <kw-grid
      ref="grdThirdRef"
      name="grdPopThird"
      :visible-rows="5"
      class="mb10"
      @init="initGrdThird"
    />
    <template #action>
      <kw-btn
        primary
        :label="$t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Initialize Component
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, useGlobal, gridUtil } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';

const { t } = useI18n();
const dataService = useDataService();
const { modal, confirm, notify, alert } = useGlobal();
const { getters } = useStore();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const grdThirdRef = ref(getComponentType('KwGrid'));
let cachedParams;
const subTotalCount = ref(0);
const thirdTotalCount = ref(0);
const { ogTpCd } = getters['meta/getUserInfo'];

const props = defineProps({
  cachedParams: {
    type: Object,
    required: true,
  },
});

const searchParams = ref({
  baseYm: props.cachedParams.baseYm,
  bldCd: '',
  dgr1LevlOgId: props.cachedParams.dgr1LevlOgId,
  dgr2LevlOgId: props.cachedParams.dgr2LevlOgId,
  rsbDvCd: ogTpCd === 'W01' ? 'W0104' : 'W0204',
  ogTpCd,
  dstOjpsNm: '',
});

const buildingCodes = ref([]);
async function ogLevlDvCd0() {
  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/marketable-securities-excd/code', { params: cachedParams });
  buildingCodes.value = res.data;
}

watch(() => searchParams.value.dgr2LevlOgId, async () => {
  ogLevlDvCd0();
});

async function subject() {
  const view = grdSubRef.value.getView();
  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/marketable-securities-excd/subject', { params: cachedParams });
  subTotalCount.value = res.data.length;
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function marketableSecuritiesExcd() {
  const view = grdThirdRef.value.getView();
  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/marketable-securities-excd/final-withholding-tax-settlement', { params: cachedParams });

  thirdTotalCount.value = res.data.length;
  view.getDataSource().setRows(res.data);
  view.resetCurrent();

  let subPerfValTotal = 0;
  res.data.forEach((rowData) => {
    subPerfValTotal += Number(rowData.dstAmt);
  });
  const mainView = grdMainRef.value.getView();
  mainView.setValue(0, 'dstAmt', subPerfValTotal);
  const adjCnfmAmt = mainView.getValue(0, 'adjCnfmAmt');
  const unregisteredAmount = adjCnfmAmt - subPerfValTotal;
  mainView.setValue(0, 'amt', unregisteredAmount);
}

async function fetchData() {
  cachedParams = props.cachedParams;
  cachedParams.subOgTpCd = searchParams.value.ogTpCd; // 배분대상조직유형코드

  // 검색조건 4개
  cachedParams.rsbDvCd = searchParams.value.rsbDvCd; // 직책 구분코드
  cachedParams.dgr2LevlOgId = searchParams.value.dgr2LevlOgId; // 지역단 조직ID
  cachedParams.bldCd = searchParams.value.bldCd; // 빌딩 코드
  cachedParams.subPrtnrNo = searchParams.value.prtnrNo; // 배분대상파트너번호

  if (!isEmpty(props.cachedParams.dgr3LevlOgId)) {
    cachedParams.mainDgr3LevlOgId = props.cachedParams.dgr3LevlOgId;
  } else if (!isEmpty(props.cachedParams.dgr2LevlOgId)) {
    cachedParams.mainDgr2LevlOgId = props.cachedParams.dgr2LevlOgId;
  } else if (!isEmpty(props.cachedParams.dgr1LevlOgId)) {
    cachedParams.mainDgr1LevlOgId = props.cachedParams.dgr1LevlOgId;
  }

  await ogLevlDvCd0();
  await subject();
  await marketableSecuritiesExcd();
}
async function onClickSearch() {
  cachedParams = props.cachedParams;
  cachedParams.subOgTpCd = searchParams.value.ogTpCd; // 배분대상조직유형코드

  cachedParams.rsbDvCd = searchParams.value.rsbDvCd; // 직책 구분코드
  cachedParams.dgr2LevlOgId = searchParams.value.dgr2LevlOgId; // 지역단 조직ID
  cachedParams.bldCd = searchParams.value.bldCd; // 빌딩 코드
  cachedParams.subPrtnrNo = searchParams.value.prtnrNo; // 배분대상파트너번호

  await subject();
  await marketableSecuritiesExcd();
}

async function onClickSearchPartner() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.dstOjpsNm,
    },
  });
  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
    searchParams.value.dstOjpsNm = payload.prtnrNo;
  }
}

// 대상자 추가
async function onClickObjectPersonAdd() {
  const mainView = grdMainRef.value.getView();
  const subView = grdSubRef.value.getView();
  const thirdView = grdThirdRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(subView);
  const thirdRows = thirdView.getJsonRows();
  if (checkedRows.length === 0) {
    await notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  const mainValue = mainView.getValues(0);

  // 총괄단, 센터, 성명, 번호가 동일한 대상이 있다면 하단 grid에 추가되면 안됨 alert 띄워야 함 (선택된 대상은 추가되어 있습니다.)
  let count = 0;
  let selectedTarget = '';
  for (let i = 0; i < thirdRows.length; i += 1) {
    for (let j = 0; j < checkedRows.length; j += 1) {
      if (thirdRows[i].dgr2LevlOgId === checkedRows[j].dgr2LevlOgId
        && thirdRows[i].dstOjpsNm === checkedRows[j].prtnrKnm
        && thirdRows[i].dstOjPrtnrNo === checkedRows[j].prtnrNo) {
        count += 1;
        selectedTarget += `[${checkedRows[j].prtnrNo}]`;
      }
    }
  }
  if (count > 0) {
    alert(`선택된 대상은 추가되어 있습니다. \n 파트너 번호 :${selectedTarget}`); // TODO 메세지작업해야함
    return;
  }
  // # DST_AMT < 33334 일 경우에는 아래 DST_WHTX, ERNTX, RSDNTX는 모두 0으로 입력처리
  // # DST_AMT >= 33334 이상일 경우에는 아래 계산식 적용하여 DST_WHTX, ERNTX, RSDNTX
  // -> 최종 원천세 정산 대상자 grid의 DST_WHTX             /*(hidden)원천세*/
  // # DST_AMT의 금액이 33334 이상인 경우에만 계산하고 미만일 경우에는 0으로 입력
  // # 원천세 계산식(원단위 절사처리) = ROUNDDOWN(DST_AMT*0.033,-1)
  // -> 최종 원천세 정산 대상자 grid의 ERNTX                /*(hidden)소득세*/
  // # 소득세 계산식(원단위 절사처리) = ROUNDDOWN(DST_AMT*0.03,-1)
  // -> 최종 원천세 정산 대상자 grid의 RSDNTX               /*(hidden)주민세*/
  // # 주민세 계산식(원단위 절사처리) = ROUNDDOWN(ROUNDDOWN(DST_AMT*0.03,-1)*0.1,-1)
  // # 원천세 = 소득세 + 주민세 -> 금액이 서로 맞아야 함!!!
  for (let i = 0; i < checkedRows.length; i += 1) {
    if (mainValue.adjCnfmAmt < checkedRows[i].dstAmt) {
      alert('정산금액보다 큽니다.');
      return;
    }
    checkedRows[i].adjYn = 'N';
    checkedRows[i].dstOjPrtnrNo = checkedRows[i].prtnrNo;
    checkedRows[i].ogTpCd = checkedRows[i].dstOjOgTpCd;
    checkedRows[i].adjOgId = checkedRows[i].ogId;
    checkedRows[i].dstOjpsNm = checkedRows[i].prtnrKnm;
    checkedRows[i].dstOjpsPerfAmt = isEmpty(checkedRows[i].perfVal) ? '0' : checkedRows[i].perfVal;

    // 원천세 : dstWhtx, 소득세 : erntx, 주민세 : rsdntx
    if (checkedRows[i].dstAmt >= 33334) {
      checkedRows[i].erntx = Math.floor((checkedRows[i].dstAmt * 0.03) / 10) * 10; // 소득세
      checkedRows[i].rsdntx = Math.floor((checkedRows[i].dstAmt * 0.003) / 10) * 10; // 주민세
      checkedRows[i].dstWhtx = checkedRows[i].rsdntx + checkedRows[i].erntx; // 원천세
    } else {
      checkedRows[i].dstWhtx = 0;
      checkedRows[i].erntx = 0;
      checkedRows[i].rsdntx = 0;
    }
    const view = grdThirdRef.value.getView();
    const dataProvider = view.getDataSource();
    dataProvider.insertRow(0, checkedRows[i]);
    thirdTotalCount.value += 1;
  }

  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
  }

  let dstAmt = 0;
  checkedRows.forEach((checkedRow) => {
    dstAmt += checkedRow.dstAmt;
  });

  const mainDstAmt = mainView.getValue(0, 'dstAmt');
  const mainAmt = mainView.getValue(0, 'amt');
  mainView.setValue(0, 'dstAmt', mainDstAmt + dstAmt);
  mainView.setValue(0, 'amt', mainAmt - dstAmt);
}

// 대상자 제외
async function onClickObjectPersonDel() {
  const thirdView = grdThirdRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(thirdView);
  const dataProvider = thirdView.getDataSource();
  const mainView = grdMainRef.value.getView();
  const mainDstAmt = mainView.getValue(0, 'dstAmt');
  const mainAmt = mainView.getValue(0, 'amt');

  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  let dstAmt = 0;
  const dataRowsForDelete = [];
  checkedRows.forEach((obj) => {
    dataRowsForDelete.push(obj.dataRow);
    dstAmt += obj.dstAmt;
    thirdTotalCount.value -= 1;
  });
  dataProvider.removeRows(dataRowsForDelete);

  mainView.setValue(0, 'dstAmt', mainDstAmt - dstAmt);
  mainView.setValue(0, 'amt', mainAmt + dstAmt);
}

async function onClickSave() {
  // 저장
  const view = grdThirdRef.value.getView();
  const thirdTotal = thirdTotalCount.value;
  const mainView = grdMainRef.value.getView();
  const { adjCnfmAmt, dstAmt } = mainView.getValues(0);

  if (adjCnfmAmt !== dstAmt) {
    alert(t('MSG_ALT_THE_REGI_AMOUNT_MUST_MATCH_THE_AMOUNT_SUBJECT_TO_SETT')); // 등록금액은 정산대상금액과 일치하여야 합니다.
    return;
  }
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }

  if (thirdTotal === 0) {
    alert('변경대상이 없습니다.');
    return;
  }

  const thirdList = [];
  for (let i = 0; i < thirdTotal; i += 1) {
    view.setValue(i, 'opcsCardUseIzId', props.cachedParams.opcsCardUseIzId);
    view.setValue(i, 'baseYm', props.cachedParams.baseYm);
    view.setValue(i, 'opcsAdjNo', props.cachedParams.opcsAdjNo);
    view.setValue(i, 'adjPrtnrNo', props.cachedParams.adjPrtnrNo);
    thirdList.push(view.getValues(i));
  }
  const data = thirdList;

  await dataService.post('/sms/wells/closing/expense/operating-cost/marketable-securities-excd', data);
  await notify(t('MSG_ALT_SAVE_DATA'));
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
// summary
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'authDate', header: t('MSG_TXT_USE_DTM'), width: '230', styleName: 'text-center' }, // 사용일시
    { fieldName: 'mrcNm', header: t('MSG_TXT_MRC'), width: '230', styleName: 'text-left' }, // 가맹점
    { fieldName: 'adjCnfmAmt', header: t('MSG_TXT_ADJ_OJ_AMT'), width: '200', styleName: 'text-right', dataType: 'number' }, // 정산대상금액
    { fieldName: 'dstAmt', header: t('MSG_TXT_RGST_AMT'), width: '200', styleName: 'text-right', dataType: 'number' }, // 등록금액
    { fieldName: 'amt', header: t('MSG_TXT_UNRG_AMT'), width: '201', styleName: 'text-right', dataType: 'number' }, // 미등록금액
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});

// 대상자 조회결과
const initGrdSub = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'baseYm', visible: false },
    { fieldName: 'ogTpCd', visible: false }, // (hidden)2차레벨조직유형코드-지역단
    { fieldName: 'ogId', visible: false }, // (hidden)정산조직ID
    { fieldName: 'dstOjOgTpCd', visible: false }, // (hidden)배분대상조직유형코드
    { fieldName: 'bldCd', visible: false }, // (hidden)빌딩코드
    { fieldName: 'adjOgId', visible: false },
    { fieldName: 'pstnDvCd', visible: false },
    { fieldName: 'dgr2LevlOgId', visible: false }, // (hidden)2차레벨조직ID-지역단
    { fieldName: 'dgr2LevlDgPrtnrNo', visible: false }, /* (hidden)차레벨대표파트너번호 */
    { fieldName: 'opcsAdjNo', visible: false }, /* (hidden)운영비정산번호 */
    { fieldName: 'rsbDvCd', visible: false },
    { fieldName: 'cardUseAmt', visible: false }, // 카드사용금액
    { fieldName: 'perfRate', visible: false }, // 실적비율

    { fieldName: 'dstWhtx', visible: false }, // 원천세
    { fieldName: 'erntx', visible: false }, // 소득세
    { fieldName: 'rsdntx', visible: false }, // 주민세
    { fieldName: 'mscrYn', visible: false }, // 정산 여부
    { fieldName: 'resAmt', visible: false }, // 잔여금액

    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '96', styleName: 'text-left', editable: false }, // 총괄단
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '117', styleName: 'text-left', editable: false }, // 지역단
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '195', styleName: 'text-left', editable: false }, // 빌딩명
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '83', styleName: 'text-left', editable: false }, // 성명
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '85', styleName: 'text-center', editable: false }, // 번호
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_RSB'), width: '105', styleName: 'text-left', editable: false }, // 직책
    { fieldName: 'perfVal', header: t('MSG_TXT_PERF'), width: '85', styleName: 'text-center', editable: false, dataType: 'number' }, // 실적
    {
      fieldName: 'dstAmt',
      header: {
        text: t('MSG_TXT_AMT'),
        styleName: 'essential',
      },
      width: '211',
      styleName: 'text-right',
      dataType: 'number',
    }, // 금액
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
});

// 최종 원천세 정산 대상자
const initGrdThird = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'baseYm', visible: false },
    { fieldName: 'opcsAdjNo', visible: false }, /* (hidden)운영비정산번호 */
    { fieldName: 'adjOgId', visible: false }, /* (hidden)정산조직ID */
    { fieldName: 'ogTpCd', visible: false }, /* (hidden)조직유형코드 */
    { fieldName: 'adjPrtnrNo', visible: false }, /* (hidden)정산파트너번호 */
    { fieldName: 'bldCd', visible: false }, /* (hidden)빌딩코드 */
    { fieldName: 'dstOjOgTpCd', visible: false }, /* (hidden)배분대상조직유형코드 */
    { fieldName: 'dstOjpsPerfAmt', visible: false }, /* (hidden)배분대상자실적금액 */
    { fieldName: 'cardUseAmt', visible: false, dataType: 'number' }, // 카드사용금액
    { fieldName: 'dgr2LevlOgId', visible: false },
    { fieldName: 'dgr2LevlDgPrtnrNo', visible: false },
    { fieldName: 'deleted', visible: false },
    { fieldName: 'adjYn', visible: false },
    { fieldName: 'rsbDvCd', visible: false },
    { fieldName: 'pstnDvCd', visible: false },
    { fieldName: 'pdstOpt', visible: false },
    { fieldName: 'opcsCardUseIzId', visible: false },

    { fieldName: 'erntx', visible: false, dataType: 'number' }, // 소득세
    { fieldName: 'rsdntx', visible: false, dataType: 'number' }, // 주민세
    { fieldName: 'mscrYn', visible: false, dataType: 'number' }, // 정산 여부

    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '100', styleName: 'text-left' }, // 총괄단
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '101', styleName: 'text-left' }, // 지역단
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '164', styleName: 'text-left' }, // 빌딩명
    { fieldName: 'dstOjpsNm', header: t('MSG_TXT_EMPL_NM'), width: '83', styleName: 'text-left' }, // 성명
    { fieldName: 'dstOjPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '85', styleName: 'text-center' }, // 번호
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_RSB'), width: '105', styleName: 'text-left' }, // 직책
    { fieldName: 'dstAmt', header: t('MSG_TXT_OPCS_ADJ_AMT'), width: '169', styleName: 'text-right', dataType: 'number' }, // 운영비 정산금액
    { fieldName: 'dstWhtx', header: t('MSG_TXT_WHTX'), width: '178', styleName: 'text-right', dataType: 'number' }, // 원천세
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});

const position = ref();
onMounted(async () => {
  if (getters['meta/getUserInfo'].ogTpCd === 'W01') {
    position.value = [{ codeId: 'W0104', codeName: '지점장' }, { codeId: 'W0105', codeName: '프리매니저' }];
  } else if (getters['meta/getUserInfo'].ogTpCd === 'W02') {
    position.value = [{ codeId: 'W0204', codeName: '센터장' }, { codeId: 'W0205', codeName: '프리매니저' }];
  }
  const addValue = {};
  addValue.adjCnfmAmt = props.cachedParams.domTrdAmt;
  addValue.crcdnoEncr = props.cachedParams.crcdnoEncr;
  addValue.mrcNm = props.cachedParams.mrcNm;
  addValue.cardAprno = props.cachedParams.cardAprno;
  addValue.authDate = props.cachedParams.authDate;

  // crcdnoEncr, mrcNm, cardAprno, domTrdAmt
  grdMainRef.value.getView().getDataSource().addRow(addValue);
  await fetchData();
});

async function reset() {
  searchParams.value.prtnrNo = null;
  cachedParams = null;
}

// # DST_AMT < 33334 일 경우에는 아래 DST_WHTX, ERNTX, RSDNTX는 모두 0으로 입력처리
// # DST_AMT >= 33334 이상일 경우에는 아래 계산식 적용하여 DST_WHTX, ERNTX, RSDNTX
// -> 최종 원천세 정산 대상자 grid의 DST_WHTX             /*(hidden)원천세*/
//   # DST_AMT의 금액이 33334 이상인 경우에만 계산하고 미만일 경우에는 0으로 입력
//   # 원천세 계산식(원단위 절사처리) = ROUNDDOWN(DST_AMT*0.033,-1)
// -> 최종 원천세 정산 대상자 grid의 ERNTX                /*(hidden)소득세*/
//   # 소득세 계산식(원단위 절사처리) = ROUNDDOWN(DST_AMT*0.03,-1)
// -> 최종 원천세 정산 대상자 grid의 RSDNTX               /*(hidden)주민세*/
//   # 주민세 계산식(원단위 절사처리) = ROUNDDOWN(ROUNDDOWN(DST_AMT*0.03,-1)*0.1,-1)
//   # 원천세 = 소득세 + 주민세 -> 금액이 서로 맞아야 함!!!
// -> 최종 원천세 정산 대상자 grid의 MSCR_YN              /*(hidden)유가증권여부*/
//   #'N'값으로 입력
async function calcTaxes() {
  // 원천세 : dstWhtx, 소득세 : erntx, 주민세 : rsdntx
  const subView = grdSubRef.value.getView();
  const subViewDatas = gridUtil.getAllRowValues(subView);

  subViewDatas.forEach((data, index) => {
    let dstWhtx = 0;
    let erntx = 0;
    let rsdntx = 0;
    if (data.dstAmt >= 33334) {
      erntx = Math.floor((data.dstAmt * 0.03) / 10) * 10; // 소득세
      rsdntx = Math.floor((data.dstAmt * 0.003) / 10) * 10; // 주민세
      dstWhtx = rsdntx + erntx; // 원천세
    }
    subView.setValue(index, 'dstWhtx', dstWhtx);
    subView.setValue(index, 'erntx', erntx);
    subView.setValue(index, 'rsdntx', rsdntx);
  });
}

let resAmtTotal = 0; // 잔여금액합계
let isCalcData = false;
async function setCalcData(pdstOpt, ogRateMap) {
  const subView = grdSubRef.value.getView();
  const subViewDatas = gridUtil.getAllRowValues(subView);

  let dstAmtOriginTotal = 0; // 정산금액원본합계(소수점포함)
  let dstAmtTotal = 0; // 정산금액합계(등록금액)
  await subViewDatas.forEach((data, index) => {
    const perfRate = Number(pdstOpt === '01' ? ogRateMap.get(data.adjOgId) : data.perfRate);
    const dstAmtOrigin = Number(perfRate * data.dstAmt); // 실적비율 * 정산대상금액 = 정산금액
    const dstAmt = Math.floor(dstAmtOrigin / 10) * 10; // 절사처리한 정산금액
    const resAmt = Math.floor(dstAmtOrigin - dstAmt); // 절사된 금액(잔여금액, 출력용)

    subView.setValue(index, 'dstAmt', dstAmt);
    subView.setValue(index, 'resAmt', resAmt);
    subView.setValue(index, 'pdstOpt', pdstOpt);

    if (dstAmtOrigin !== 0) {
      dstAmtOriginTotal += dstAmtOrigin;
      dstAmtTotal += dstAmt;
      subView.checkItem(index);
    }
  });
  dstAmtOriginTotal = Math.round(dstAmtOriginTotal);
  resAmtTotal = dstAmtOriginTotal - dstAmtTotal;

  // 메인 그리드 세팅
  const mainView = grdMainRef.value.getView();
  const domTrdAmt = mainView.getValue(0, 'dstAmt');
  mainView.setValue(0, 'dstAmt', dstAmtTotal); // 등록금액
  mainView.setValue(0, 'amt', (domTrdAmt - dstAmtTotal)); // 미등록금액(정산대상금액합계 - 등록금액합계)

  isCalcData = true;

  // 원천세, 소득세, 지방세 계산
  await calcTaxes();
}

// 균등분배
async function onClickEquality() {
  const subView = grdSubRef.value.getView();
  const subViewDatas = gridUtil.getAllRowValues(subView);

  // 소속별로 비율 구함
  const ogRateMap = new Map(); // 소속별 정산비율
  const ogIdCheckList = [];
  await subViewDatas.forEach((data) => {
    if (!ogIdCheckList.includes(data.adjOgId)) { // 처리 하지 않은 소속이라면
      const ogIdValues = subViewDatas.filter((subViewData) => subViewData.adjOgId === data.adjOgId); // 소속의 전체 데이터
      const rate = (100 / (ogIdValues.length * 100)); // 공통적용 될 비율 구함
      ogRateMap.set(data.adjOgId, rate); // 소속별로 비율 저장

      // 해당 소속은 완료 처리하여 다음 루프부터는 건너뛰게함
      ogIdCheckList.push(data.adjOgId);
    }
  });
  const pdstOpt = '01';
  await setCalcData(pdstOpt, ogRateMap);
}

// 실적대비 (실적비율 * 정산대상금액) 후 1의 자리 절사 및 절사된 금액 총합계 구하여 가장 높은실적 사원에게 부여
async function onClickPerformance() {
  const pdstOpt = '02';
  await setCalcData(pdstOpt, null);
}

// 잔액 클리어
async function onClickBalanceAmount() {
  if (!isCalcData) {
    alert(t('균등분배 또는 실적대비 먼저 진행해주세요.')); // TODO 메세지 처리 해야함
    return;
  }

  // 등록금액에 잔여금액합계 더함
  const mainView = grdMainRef.value.getView();
  const domTrdAmt = mainView.getValue(0, 'adjCnfmAmt');
  const dstAmtTotal = mainView.getValue(0, 'dstAmt');
  const dstAmtTotalFinal = dstAmtTotal + resAmtTotal; // 등록금액에 잔여금액합계 더함
  mainView.setValue(0, 'dstAmt', dstAmtTotalFinal, 0); // 등록금액 세팅
  mainView.setValue(0, 'amt', domTrdAmt - dstAmtTotalFinal, 0); // 미등록 금액 잔여금액 만큼 빠지도록 재계산

  // 잔액 합계를 최고실적 사원의 정산금액에 더하고 모든 잔여금액 0원 처리
  const subView = grdSubRef.value.getView();
  const subViewDatas = gridUtil.getAllRowValues(subView);

  const dataIdSet = new Set(subViewDatas.map((subViewData) => subViewData.adjOgId)); // 조직ID 추출 후 중복 제거
  const ajdOgIdList = [...dataIdSet];

  ajdOgIdList.forEach((ajdOgId) => {
    const subViewOgList = subViewDatas.filter((subViewData) => subViewData.adjOgId === ajdOgId);
    let ogResAmtTotal = 0;
    let maxPerformanceNo = '';
    let maxPerfVal = 0;
    subViewOgList.forEach((data) => {
      if (data.perfVal > maxPerfVal) {
        maxPerformanceNo = data.prtnrNo;
        maxPerfVal = data.perfVal;
      }
      ogResAmtTotal += data.resAmt;
    });
    const targetData = subViewDatas
      .filter((subViewData) => (subViewData.adjOgId === ajdOgId && subViewData.prtnrNo === maxPerformanceNo));

    subView.setValue(targetData[0].dataRow, 'dstAmt', subView.getValue(targetData[0].dataRow, 'dstAmt') + ogResAmtTotal);
  });
}
// let pdstOpt = '';
// // 실적대비
// // 대상자 조회결과 rowtotal 에 실적 합을 구한 후 각 row 에 실적을
// // 나누기 후 미등록금액이랑 곱해서 금액에 주입
// async function onClickPerformance() {
//   pdstOpt = '01';
//
//   const subTotal = subTotalCount.value;
//   const mainView = grdMainRef.value.getView();
//   const subView = grdSubRef.value.getView();
//   const mainAmt = mainView.getValues(0).amt;
//
//   let perfSum = 0;
//   let perfValTotal = 0;
//
//   // 실적 합
//   for (let i = 0; i < subTotal; i += 1) {
//     perfSum += Number(subView.getValues(i).perfVal);
//   }
//
//   for (let i = 0; i < subTotal; i += 1) {
//     const { perfVal } = subView.getValues(i);
//     perfValTotal = Math.floor(perfSum / perfVal);
//     subView.setValue(i, 'dstAmt', perfValTotal * mainAmt);
//   }
// }
//
// // 잔액 클리어
// async function onClickBalanceAmount() {
//   if (pdstOpt !== '01') {
//     alert('실적대비 부터 클릭해 하세요.');
//     return;
//   }
//
//   const subView = grdSubRef.value.getView();
//   const subTotal = subTotalCount.value;
//   const subRows = [];
//   let maxRowNum;
//   let dstAmtTotal = 0;
//
//   for (let i = 0; i < subTotal; i += 1) {
//     subRows.push(subView.getValues(i));
//   }
//
//   const maxObj = subRows.reduce(
//     (accumulator, current) => (accumulator.perfVal > current.perfVal ? accumulator : current),
//   );
//
//   subRows.forEach((data) => {
//     if (data.ogId === maxObj.ogId && data.prtnrNo === maxObj.prtnrNo) {
//       if (isEmpty(maxRowNum)) {
//         maxRowNum = data;
//       }
//     }
//     dstAmtTotal += Number(data.dstAmt);
//   });
//
//   for (let i = maxObj.length; i === 0; i -= 1) {
//     maxRowNum = maxObj[i];
//   }
//
//   // main
//   const mainView = grdMainRef.value.getView();
//   const amtVal = mainView.getValue(0, 'amt');
//   const amtTotal = amtVal - dstAmtTotal;
//   subView.setValue(maxRowNum.__rowId, 'dstAmt', Number(amtTotal) + Number(maxRowNum.dstAmt));
// }
//
// // 균등대비
// async function onClickEquality() {
//   pdstOpt = '02';
//
//   // sub
//   const subTotal = subTotalCount.value;
//   const subView = grdSubRef.value.getView();
//   const dataProvider = subView.getDataSource();
//   // main
//   const mainView = grdMainRef.value.getView();
//
//   let cnt = 0;
//
//   const divideTotal = Number(mainView.getValue(0, 'amt')) / Number(subTotal);
//   dataProvider.getJsonRows().forEach((row) => {
//     row.dstAmt = Math.floor(divideTotal);
//     // dataProvider.removeRow(cnt);
//     subView.setValue(cnt, 'dstAmt', Math.floor(divideTotal));
//     cnt += 1;
//   });
// }
</script>
