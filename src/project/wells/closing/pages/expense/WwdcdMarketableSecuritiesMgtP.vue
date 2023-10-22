<!----
****************************************************************************************************
1. 모듈 : DCD
2. 프로그램 ID : WwdcdMarketableSecuritiesMgtP - 운영비 원천세 정산(유가증권) W-CL-U-0082P02
3. 작성자 : gs.piit172 kim juhyun
4. 작성일 : 2023.02.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 운영비 원천세 정산(유가증권) 프로그램
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
            rules="required"
            type="radio"
            :options="position"
            :label="$t('MSG_TXT_RSB')"
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
      <!-- 대상자 추가 -->
      <kw-btn
        v-permission:create
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
        v-permission:create
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
        v-permission:create
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
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const dataService = useDataService();
const { modal, confirm, notify, alert } = useGlobal();
// const { ok } = useModal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const grdThirdRef = ref(getComponentType('KwGrid'));
let cachedParams;
const subTotalCount = ref(0);
const thirdTotalCount = ref(0);

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
  dgr3LevlOgId: props.cachedParams.dgr3LevlOgId,
  rsbDvCd: props.cachedParams.ogTpCd === 'W01' ? 'W0104' : 'W0204',
  ogTpCd: props.cachedParams.ogTpCd,
  dstOjpsNm: '',
  subPrtnrNo: '',
  subOgTpCd: '',
  prtnrNo: '',
});
const buildingCodes = ref([]);
async function ogLevlDvCd0() {
  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/marketable-securities/code', { params: cachedParams });
  buildingCodes.value = res.data;
  if (buildingCodes.value.length === 1) {
    searchParams.value.bldCd = buildingCodes.value[0].bldCd;
  }
}

watch(() => searchParams.value.dgr2LevlOgId, async () => {
  if (searchParams.value.dgr2LevlOgId !== undefined) {
    cachedParams.dgr2LevlOgId = cloneDeep(searchParams.value.dgr2LevlOgId);
  }
  await ogLevlDvCd0();
});

async function subject() {
  const view = grdSubRef.value.getView();
  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/marketable-securities/subject', { params: cachedParams });
  subTotalCount.value = res.data.length;
  view.getDataSource().setRows(res.data);
}

async function marketableSecuritiesExcd() {
  const view = grdThirdRef.value.getView();
  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/marketable-securities/final-withholding-tax-settlement', { params: cachedParams });

  thirdTotalCount.value = res.data.length;
  view.getDataSource().setRows(res.data);

  let subPerfValTotal = 0;
  res.data.forEach((rowData) => {
    subPerfValTotal += Number(rowData.dstAmt);
  });
  const addValue = {};
  const mainView = grdMainRef.value.getView();
  const adjCnfmAmt = props.cachedParams.domTrdAmt;
  const unregisteredAmount = adjCnfmAmt - subPerfValTotal;
  addValue.authDate = props.cachedParams.authDate;
  addValue.adjCnfmAmt = adjCnfmAmt;
  addValue.crcdnoEncr = props.cachedParams.crcdnoEncr;
  addValue.mrcNm = props.cachedParams.mrcNm;
  addValue.cardAprno = props.cachedParams.cardAprno;
  addValue.dstAmt = subPerfValTotal;
  addValue.amt = unregisteredAmount;
  mainView.getDataSource().setRows([addValue]);
}

async function fetchData() {
  cachedParams = cloneDeep(props.cachedParams);
  cachedParams.subOgTpCd = props.cachedParams.ogTpCd; // 배분대상조직유형코드
  cachedParams.rsbDvCd = searchParams.value.rsbDvCd; // 직책 구분코드

  if (!isEmpty(cachedParams.dgr3LevlOgId)) {
    cachedParams.mainDgr3LevlOgId = cachedParams.dgr3LevlOgId;
    cachedParams.mainDgr1LevlOgId = null;
    cachedParams.mainDgr2LevlOgId = null;
  } else if (!isEmpty(cachedParams.dgr2LevlOgId)) {
    cachedParams.mainDgr2LevlOgId = cachedParams.dgr2LevlOgId;
    cachedParams.mainDgr1LevlOgId = null;
    cachedParams.mainDgr3LevlOgId = null;
  } else if (!isEmpty(cachedParams.dgr1LevlOgId)) {
    cachedParams.mainDgr1LevlOgId = cachedParams.dgr1LevlOgId;
    cachedParams.mainDgr2LevlOgId = null;
    cachedParams.mainDgr3LevlOgId = null;
  }
  await subject();
  await marketableSecuritiesExcd();
}
async function onClickSearch() {
  // 검색조건 4개
  cachedParams.rsbDvCd = searchParams.value.rsbDvCd; // 직책 구분코드
  cachedParams.dgr2levlogid = searchParams.value.dgr2LevlOgId; // 지역단 조직ID
  cachedParams.bldCd = searchParams.value.bldCd; // 빌딩 코드
  cachedParams.subPrtnrNo = searchParams.value.prtnrNo; // 배분대상파트너번호

  const subView = grdSubRef.value.getView();
  await subView.checkAll(false, true, true, true);
  await subject();
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
  const checkedRows = gridUtil.getCheckedRowValues(subView);
  const thirdView = grdThirdRef.value.getView();
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
        selectedTarget += `[${checkedRows[j].prtnrNo}]`;
        count += 1;
      }
    }
  }
  if (count > 0) {
    alert(t('MSG_ALT_SEL_TARGET_ADDED_ALREADY', [selectedTarget]));
    return;
  }

  let dstAmtTotal = 0;
  for (let i = 0; i < checkedRows.length; i += 1) {
    dstAmtTotal += Number(checkedRows[i].dstAmt);
  }
  if (mainValue.adjCnfmAmt < dstAmtTotal || mainValue.amt < 0) {
    alert(t('MSG_ALT_TRGT_ADJ_AMT_MORE'));
    return;
  }
  for (let i = 0; i < checkedRows.length; i += 1) {
    if (checkedRows[i].dstAmt !== 0) {
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
      const dataProvider = thirdView.getDataSource();
      dataProvider.addRow(checkedRows[i]);
      thirdTotalCount.value += 1;
    }
    thirdView.resetCurrent();
    subView.resetCurrent();
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
  await subView.checkAll(false, true, true, true);
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
    view.setValue(i, 'ogTpCd', props.cachedParams.ogTpCd);
    view.setValue(i, 'opcsAdjNo', props.cachedParams.opcsAdjNo);
    view.setValue(i, 'adjPrtnrNo', props.cachedParams.adjPrtnrNo);
    thirdList.push(view.getValues(i));
  }
  const data = thirdList;
  await dataService.post('/sms/wells/closing/expense/operating-cost/marketable-securities', data).then((res) => {
    cachedParams.opcsAdjNo = res.data.data;
  });

  await notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
  // await ok();
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
// summary
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'authDate', header: t('MSG_TXT_USE_DTM'), width: '230', styleName: 'text-center' }, // 사용일시
    { fieldName: 'mrcNm', header: t('MSG_TXT_MRC'), width: '230', styleName: 'text-center' }, // 가맹점
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

    { fieldName: 'dstWhtx', visible: false }, // 원천세
    { fieldName: 'erntx', visible: false }, // 소득세
    { fieldName: 'rsdntx', visible: false }, // 주민세
    { fieldName: 'mscrYn', visible: false }, // 정산 여부

    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '96', styleName: 'text-center', editable: false }, // 총괄단
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '117', styleName: 'text-center', editable: false }, // 지역단
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '195', styleName: 'text-center', editable: false }, // 빌딩명
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '83', styleName: 'text-center', editable: false }, // 성명
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '85', styleName: 'text-center', editable: false }, // 번호
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_RSB'), width: '105', styleName: 'text-center', editable: false }, // 직책
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

  // grid - GridBase 컨트롤
  // itemIndex - 변경된 행의 순서
  // row - 변경된 행의 고유 번호
  // field - 변경된 필드의 인덱스
  // oldValue - 편집전 셀의 데이터 값
  // newValue - 편집후 셀의 데이터 값
  view.onEditRowChanged = async (subView, itemIndex, rowData, field, oldValue) => { // 직접편집했을때만
    const dstAmt = subView.getValue(itemIndex, 'dstAmt');
    const fieldValue = subView.getValue(itemIndex, field);
    if (fieldValue !== dstAmt || fieldValue === null || fieldValue === undefined || fieldValue === '') { // lodash 의 isEmpty 는 숫자를 넣으면 비어있는 것으로 판단함.(lodash 버그)
      return;
    }

    if (subView.isCheckedItem(itemIndex)) {
      const mainView = grdMainRef.value.getView();
      const adjCnfmAmt = mainView.getValue(0, 'adjCnfmAmt');
      let mainDstAmt = mainView.getValue(0, 'dstAmt');

      mainDstAmt += dstAmt - oldValue;
      mainView.setValue(0, 'dstAmt', mainDstAmt); // 등록금액
      mainView.setValue(0, 'amt', (adjCnfmAmt - mainDstAmt)); // 미등록금액(정산대상금액합계 - 등록금액합계)
    }
  };

  let checkedPrtnrNoList = []; // 현재 체크된 대상자 리스트
  view.onItemChecked = async (subView, itemIndex) => {
    const dstAmt = subView.getValue(itemIndex, 'dstAmt');
    const mainView = grdMainRef.value.getView();
    const adjCnfmAmt = mainView.getValue(0, 'adjCnfmAmt');
    let mainDstAmt = mainView.getValue(0, 'dstAmt');
    if (subView.isCheckedItem(itemIndex) && !checkedPrtnrNoList.includes(subView.getValue(itemIndex, 'prtnrNo'))) {
      mainDstAmt += dstAmt;
    }
    if (!subView.isCheckedItem(itemIndex) && checkedPrtnrNoList.includes(subView.getValue(itemIndex, 'prtnrNo'))) {
      mainDstAmt -= dstAmt;
    }

    mainView.setValue(0, 'dstAmt', mainDstAmt); // 등록금액
    mainView.setValue(0, 'amt', (adjCnfmAmt - mainDstAmt)); // 미등록금액(정산대상금액합계 - 등록금액합계)
    checkedPrtnrNoList = cloneDeep(gridUtil.getCheckedRowValues(subView)).map((row) => row.prtnrNo);
  };

  view.onItemAllChecked = async (subView, checkedYn) => {
    const subViewRows = gridUtil.getAllRowValues(subView);
    const mainView = grdMainRef.value.getView();
    const adjCnfmAmt = mainView.getValue(0, 'adjCnfmAmt');
    let mainDstAmt = mainView.getValue(0, 'dstAmt');

    if (checkedYn) { // 전체체크한 경우
      await subViewRows.forEach((row, index) => {
        const dstAmt = subView.getValue(subView.getItemIndex(index), 'dstAmt');
        if (!checkedPrtnrNoList.includes(row.prtnrNo)) { // 체크가 아니었던 경우만
          mainDstAmt += dstAmt;
        }
      });
    } else { // 전체체크 해제한 경우
      await subViewRows.forEach((row, index) => {
        const dstAmt = subView.getValue(subView.getItemIndex(index), 'dstAmt');
        if (checkedPrtnrNoList.includes(row.prtnrNo)) { // 체크였던 경우만
          mainDstAmt -= dstAmt;
        }
      });
    }
    mainView.setValue(0, 'dstAmt', mainDstAmt); // 등록금액
    mainView.setValue(0, 'amt', (adjCnfmAmt - mainDstAmt)); // 미등록금액(정산대상금액합계 - 등록금액합계)
    checkedPrtnrNoList = cloneDeep(gridUtil.getCheckedRowValues(subView)).map((row) => row.prtnrNo);
  };
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

    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '100', styleName: 'text-center' }, // 총괄단
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '101', styleName: 'text-center' }, // 지역단
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '164', styleName: 'text-center' }, // 빌딩명
    { fieldName: 'dstOjpsNm', header: t('MSG_TXT_EMPL_NM'), width: '83', styleName: 'text-center' }, // 성명
    { fieldName: 'dstOjPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '85', styleName: 'text-center' }, // 번호
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_RSB'), width: '105', styleName: 'text-center' }, // 직책
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
let initSearchParams;
onMounted(async () => {
  if (props.cachedParams.ogTpCd === 'W01') {
    position.value = [{ codeId: 'W0104', codeName: t('MSG_TXT_BRMGR') }, { codeId: 'W0105', codeName: t('MSG_TXT_FREE_MGR') }];
  } else if (props.cachedParams.ogTpCd === 'W02') {
    position.value = [{ codeId: 'W0204', codeName: t('MSG_TXT_BRMGR') }, { codeId: 'W0205', codeName: t('MSG_TXT_FREE_MGR') }];
  }

  searchParams.value.dgr2LevlOgId = props.cachedParams.dgr2LevlOgId;
  initSearchParams = cloneDeep(searchParams.value);
  await fetchData();
});

async function reset() {
  searchParams.value = cloneDeep(initSearchParams);
  await ogLevlDvCd0();
}
</script>
