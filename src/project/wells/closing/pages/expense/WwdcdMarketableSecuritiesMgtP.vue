<!----
****************************************************************************************************
1. 모듈 : DCD
2. 프로그램 ID : WwdcdMarketableSecuritiesMgtP - 운영비 원천세 정산(유가증권)
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
      name="grdPopFourth"
      :visible-rows="1"
      @init="initGrdMain"
    />

    <kw-search
      class="mt30"
      cols="2"
      :modified-targets="['grdPopFifth']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_RGNL_GRP')"
          required
        >
          <zwog-level-select
            v-model="searchParams.ogLevlDvCd2"
            :og-tp-cd="searchParams.ogTpCd"
            :base-ym="searchParams.baseYm"
            :start-level="2"
            :end-level="2"
            first-option="all"
            rules="required"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_BLD_NM')"
        >
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
        <kw-search-item
          :label="$t('MSG_TXT_RSB')"
        >
          <kw-option-group
            v-model="searchParams.rsbDvCd"
            type="radio"
            :options="position"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_ELIGIBILITY')"
        >
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
      {{ t('MSG_TXT_OJPS_INQR_RS') }}
      <ul class="kw-notification">
        <li>
          {{ t('MSG_TXT_AMT_IN_AFT_SPMT_BUTN_CLK') }}
        </li>
      </ul>
    </h3>

    <kw-action-top class="mt20">
      <template #left>
        <kw-paging-info
          :total-count="subTotalCount"
        />
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <kw-btn
        primary
        dense
        :label="$t('MSG_TXT_OJPS_SPMT')"
        @click="onClickObjectPersonAdd"
      />
    </kw-action-top>
    <kw-grid
      ref="grdSubRef"
      name="grdPopFifth"
      :visible-rows="5"
      class="mb10"
      @init="initGrdSub"
    />
    <h3>
      {{ t('MSG_TXT_FNL_WHTX_ADJ_OJPS') }}
      <ul class="kw-notification">
        <li>
          {{ t('MSG_TXT_SEL_THE_TAR_YOU_WA_TO_EXC_AND_CK_THE_EXC_TAR_BTN') }}
        </li>
      </ul>
    </h3>

    <kw-action-top class="mt20">
      <template #left>
        <kw-paging-info
          :total-count="thirdTotalCount"
        />
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
      name="grdPopSixth"
      :visible-rows="5"
      class="mb10"
      @init="initGrdThird"
    />

    <template #action>
      <kw-btn
        primary
        :label="t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Initialize Component
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, useGlobal, useModal, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';

const { t } = useI18n();

const dataService = useDataService();
const { confirm, notify, modal, alert } = useGlobal();
const { ok } = useModal();
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
let pdstOpt;

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
});

const buildingCodes = ref([]);
async function ogLevlDvCd0() {
  debugger;
  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/marketable-securities/code', { params: cachedParams });
  /*
  res.data.forEach((data) => {
    buildingCodes.value.push(data);
  });
  */
  buildingCodes.value = res.data;
}

watch(() => searchParams.value.dgr2LevlOgId, async (newVal) => {
  console.log('>>>>> newVal: ', newVal);
  ogLevlDvCd0();
});

async function subject() {
  const view = grdSubRef.value.getView();
  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/marketable-securities/subject', { params: cachedParams });
  debugger;
  subTotalCount.value = res.data.length;
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function marketableSecuritiesExcd() {
  debugger;
  const view = grdThirdRef.value.getView();
  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/marketable-securities/final-withholding-tax-settlement', { params: cachedParams });

  thirdTotalCount.value = res.data.length;
  view.getDataSource().setRows(res.data);
  view.resetCurrent();

  let subPerfValTotal = 0;
  res.data.forEach((rowData) => {
    subPerfValTotal += Number(rowData.dstAmt);
  });
  debugger;
  const mainView = grdMainRef.value.getView();
  mainView.setValue(0, 'dstAmt', subPerfValTotal);
  const adjCnfmAmt = mainView.getValue(0, 'adjCnfmAmt');
  const unregisteredAmount = adjCnfmAmt - subPerfValTotal;
  mainView.setValue(0, 'amt', unregisteredAmount);
}

let reqParams;
async function fetchData() {
  const sumParams = cloneDeep(searchParams.value);
  reqParams = props.cachedParams;
  reqParams.rsbDvCd = sumParams.rsbDvCd;

  if (!isEmpty(props.cachedParams.dgr3LevlOgId)) {
    reqParams.mainDgr3LevlOgId = props.cachedParams.dgr3LevlOgId;
  } else if (!isEmpty(props.cachedParams.dgr2LevlOgId)) {
    reqParams.mainDgr2LevlOgId = props.cachedParams.dgr2LevlOgId;
  } else if (!isEmpty(props.cachedParams.dgr1LevlOgId)) {
    reqParams.mainDgr1LevlOgId = props.cachedParams.dgr1LevlOgId;
  }

  cachedParams = cloneDeep(reqParams);
  await ogLevlDvCd0();
  await subject();
  await marketableSecuritiesExcd();
}

async function onClickSearchPartner() {
  const { result, payload } = await modal({

    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
    },
  });
  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  const sumParams = cloneDeep(searchParams.value);

  /* TODO.입력된 값이 없으면 부모창에서 가져온 배분대상조직유형코드, 배분대상파트너번호
  if (isEmpty(sumParams.subPrtnrNo)) {
    sumParams.subOgTpCd = props.cachedParams.mainOgTpCd;
    sumParams.subPrtnrNo = props.cachedParams.mainPrtnrNo;
  }
  */

  cachedParams = props.cachedParams;
  cachedParams.rsbDvCd = sumParams.rsbDvCd;
  cachedParams.subOgTpCd = sumParams.subOgTpCd;
  cachedParams.subPrtnrNo = sumParams.subPrtnrNo;

  await subject();
  await marketableSecuritiesExcd();
}

async function onClickObjectPersonAdd() {
  // 대상자 추가

  const subView = grdSubRef.value.getView();
  const mainView = grdMainRef.value.getView();
  const thirdView = grdThirdRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(subView);
  // const dataProvider = subView.getDataSource();

  const thirdRows = thirdView.getJsonRows();

  if (checkedRows.length === 0) {
    await notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  const mainValue = mainView.getValues(0);

  // 총괄단, 센터, 성명, 번호가 동일한 대상이 있다면 하단 grid에 추가되면 안됨 alert 띄워야 함 (선택된 대상은 추가되어 있습니다.)
  let count = 0;
  for (let i = 0; i < thirdRows.length; i += 1) {
    for (let j = 0; j < checkedRows.length; j += 1) {
      if (thirdRows[i].dgr1LevlOgId === checkedRows[j].dgr1LevlOgId
      && thirdRows[i].dgr2LevlOgId === checkedRows[j].dgr2LevlOgId
      && thirdRows[i].dstOjpsNm === checkedRows[j].prtnrKnm
      && thirdRows[i].dstOjPrtnrNo === checkedRows[j].prtnrNo) {
        count += 1;
      }
    }
  }

  if (count > 0) {
    alert('선택된 대상은 추가되어 있습니다.');
    return;
  }

  let dstAmt = 0;
  checkedRows.forEach((checkedRow) => {
    dstAmt += checkedRow.dstAmt;
  });

  const mainDstAmt = mainView.getValue(0, 'dstAmt');
  const mainAmt = mainView.getValue(0, 'amt');
  mainView.setValue(0, 'dstAmt', mainDstAmt + dstAmt);
  mainView.setValue(0, 'amt', mainAmt - dstAmt);

  // 정산대상금액  ACC_AMT

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
  debugger;
  checkedRows.forEach((subData) => {
    if (mainValue.adjCnfmAmt < subData.dstAmt) {
      alert('정산금액보다 큼니다.');
      return;
    }
    subData.adjYn = 'N';
    subData.adjPrtnrNo = subData.prtnrNo;
    subData.dstOjPrtnrNo = subData.prtnrNo;
    subData.ogTpCd = subData.dstOjOgTpCd;
    subData.adjOgId = subData.ogId;
    subData.dstOjpsNm = subData.prtnrKnm;
    subData.dstOjpsPerfAmt = isEmpty(subData.perfVal) ? '0' : subData.perfVal;

    if (subData.dstAmt < 33334) {
      subData.dstWhtx = 0;
      subData.erntx = 0;
      subData.rsdntx = 0;
    } else if (subData.dstAmt >= 33334) {
      subData.dstWhtx = Math.floor(subData.dstAmt * 0.033);
      subData.erntx = Math.floor(subData.dstAmt * 0.03);
      subData.rsdntx = Math.floor(Math.floor(subData.dstAmt * 0.03) * 0.1);
    }

    const view = grdThirdRef.value.getView();
    const dataProvider = view.getDataSource();
    dataProvider.insertRow(0, subData);
    thirdTotalCount.value += 1;
    // dataProvider.removeRow(subData.dataRow);
  });

  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
  }
}

async function onClickObjectPersonDel() {
  // 대상자 제외

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
  checkedRows.forEach((obj) => {
    dataProvider.removeRow(obj.dataRow);
    dataProvider.setRowState(obj.dataRow, 'deleted', 'Y');
    dstAmt += obj.dstAmt;
    thirdTotalCount.value -= 1;
  });

  mainView.setValue(0, 'dstAmt', mainDstAmt - dstAmt);
  mainView.setValue(0, 'amt', mainAmt + dstAmt);
}

async function onClickSave() {
  // 저장
  const view = grdThirdRef.value.getView();
  const thirdTotal = thirdTotalCount.value;

  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }

  if (thirdTotal === 0) {
    alert('변경대상이 없습니다.');
    return;
  }

  const thirdList = [];
  for (let i = 0; i < thirdTotal; i += 1) {
    view.setValue(i, 'pdstOpt', pdstOpt);
    view.setValue(i, 'opcsCardUseIzId', props.cachedParams.opcsCardUseIzId);
    view.setValue(i, 'baseYm', props.cachedParams.baseYm);
    thirdList.push(view.getValues(i));
  }
  debugger;
  const data = thirdList;

  await dataService.post('/sms/wells/closing/expense/operating-cost/marketable-securities', data);
  await notify(t('MSG_ALT_SAVE_DATA'));
  ok();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
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

const initGrdSub = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'baseYm', visible: false },
    { fieldName: 'dgr2LevlOgId', visible: false }, // (hidden)2차레벨조직ID-지역단
    { fieldName: 'ogTpCd', visible: false }, // (hidden)2차레벨조직유형코드-지역단
    { fieldName: 'dgr3LevlDgPrtnrNo', visible: false }, // (hidden)2차레벨대표파트너번호-지역단
    { fieldName: 'ogId', visible: false }, // (hidden)정산조직ID
    { fieldName: 'dstOjOgTpCd', visible: false }, // (hidden)배분대상조직유형코드
    { fieldName: 'bldCd', visible: false }, // (hidden)빌딩코드
    { fieldName: 'adjOgId', visible: false },
    { fieldName: 'pstnDvCd', visible: false },
    { fieldName: 'dgrLevlOgId', visible: false }, /* (hidden)1차레벨조직ID-총괄단 */
    { fieldName: 'dgrLevlDgPrtnrNo', visible: false }, /* (hidden)1차레벨대표파트너번호-총괄단 */
    //
    { fieldName: 'dstWhtx', visible: false }, // 원천세
    { fieldName: 'erntx', visible: false }, // 소득세
    { fieldName: 'rsdntx', visible: false }, // 주민세
    { fieldName: 'mscrYn', visible: false }, // 정산 여부
    //
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

  /*
  view.onCellEdited = (grid, itemIndex, row, fieldIndex) => {
    grid.commit();
    grid.commitEditor();
    const columnName = grid.getColumn(fieldIndex).fieldName;
    // const codeName = grid.getDisplayValues(itemIndex);
    const gridValue = grid.getEditValue();
    console.log(row);

    if (columnName === 'dstAmt') {
      pdstOpt = '03';
      if (gridValue < 9) {
        alert('십원 이상으로만 입력이 가능합니다.');
        grid.setValue(itemIndex, 'dstAmt', 0);
      } else {
        const dstWhtxLength = gridValue.length;
        const dstWhtx = gridValue.substring(0, dstWhtxLength - 1);
        grid.setValue(itemIndex, 'dstAmt', `${dstWhtx}0`);
      }
    }
  };
  */

  view.onCellEdited = (grid, itemIndex, row, fieldIndex) => {
    grid.commit();
    grid.commitEditor();
    const columnName = grid.getColumn(fieldIndex).fieldName;
    if (columnName === 'dstAmt') {
      pdstOpt = '03';
    }
  };
});

const initGrdThird = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'baseYm', visible: false },
    { fieldName: 'opcsAdjNo', visible: false }, /* (hidden)운영비정산번호 */
    { fieldName: 'adjOgId', visible: false }, /* (hidden)정산조직ID */
    { fieldName: 'ogTpCd', visible: false }, /* (hidden)조직유형코드 */
    { fieldName: 'adjPrtnrNo', visible: false }, /* (hidden)정산파트너번호 */
    { fieldName: 'bldCd', visible: false }, /* (hidden)빌딩코드 */
    { fieldName: 'levelOgTpCd', visible: false }, /* (hidden)3차레벨조직유형코드-센터 */
    { fieldName: 'dstOjOgTpCd', visible: false }, /* (hidden)배분대상조직유형코드 */
    { fieldName: 'dstOjpsPerfAmt', visible: false }, /* (hidden)배분대상자실적금액 */
    { fieldName: 'dgr1LevlOgId', visible: false },
    { fieldName: 'dgr2LevlOgId', visible: false },
    { fieldName: 'deleted', visible: false },
    { fieldName: 'adjYn', visible: false },
    { fieldName: 'rsbDvCd', visible: false },
    { fieldName: 'pstnDvCd', visible: false },
    { fieldName: 'pdstOpt', visible: false },
    { fieldName: 'opcsCardUseIzId', visible: false },
    /// ///
    { fieldName: 'erntx', visible: false, dataType: 'number' }, // 소득세
    { fieldName: 'rsdntx', visible: false, dataType: 'number' }, // 주민세
    { fieldName: 'mscrYn', visible: false, dataType: 'number' }, // 정산 여부
    ///
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
</script>
