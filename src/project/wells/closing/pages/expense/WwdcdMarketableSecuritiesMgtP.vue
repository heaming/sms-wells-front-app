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
            @update="onChangeBuildingCode"
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
            v-model="searchParams.pstnDvCd"
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
import { defineGrid, getComponentType, useDataService, useGlobal, useModal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';

const { t } = useI18n();

const dataService = useDataService();
const { confirm, notify, modal } = useGlobal();
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

const searchParams = ref({
  bldCd: '',
  dgr2LevlOgId: '',
  rsbDvCd: ogTpCd === 'W01' ? 'W0104' : 'W0204',
  objectPerson: '',
});

const props = defineProps({
  cachedParams: {
    type: Object,
    required: true,
  },
});

async function subject() {
  const view = grdSubRef.value.getView();
  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/marketable-securities/subject', { params: cachedParams });

  const { list: services } = res.data;
  subTotalCount.value = res.data.length;
  view.getDataSource().setRows(services);
  view.resetCurrent();
}

async function marketableSecuritiesExcd() {
  const view = grdSubRef.value.getView();
  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/marketable-securities/subject', { params: cachedParams });

  const { list: services } = res.data;
  subTotalCount.value = res.data.length;
  view.getDataSource().setRows(services);
  view.resetCurrent();
}

async function fetchData() {
  const sumParams = cloneDeep(searchParams.value);
  cachedParams = props.cachedParams;
  cachedParams.rsbDvCd = sumParams.rsbDvCd;
  cachedParams.dgr2LevlOgId = sumParams.dgr2LevlOgId;
  debugger;
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

const buildingCodes = ref([]);
async function ogLevlDvCd0() {
  cachedParams = cloneDeep(searchParams.value);
  debugger;

  if (isEmpty(cachedParams)) {
    return;
  }

  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/marketable-securities-excd/code', cachedParams);
  res.data.forEach((data) => {
    buildingCodes.value.push({ codeId: data.bldCd, codeName: data.bldNm });
  });
}

watch(() => searchParams.value.dgr2LevlOgId, async (newVal) => {
  console.log('>>>>> newVal: ', newVal);
  ogLevlDvCd0();
});

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  const sumParams = cloneDeep(searchParams.value);

  if (isEmpty(sumParams.subPrtnrNo)) {
    sumParams.subOgTpCd = props.cachedParams.mainOgTpCd;
    sumParams.subPrtnrNo = props.cachedParams.mainPrtnrNo;
  }

  cachedParams = props.cachedParams;
  cachedParams.rsbDvCd = sumParams.rsbDvCd;
  cachedParams.subOgTpCd = sumParams.subOgTpCd;
  cachedParams.subPrtnrNo = sumParams.subPrtnrNo;

  await subject();
  await marketableSecuritiesExcd();
}

async function onClickSave() {
  // 저장
  const view = grdThirdRef.value.getView();
  const subTotal = thirdTotalCount.value;
  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }

  const thirdList = [];
  for (let i = 0; i < subTotal; i += 1) {
    view.setValue(i, 'pdstOpt', pdstOpt);
    thirdList.push(view.getValues(i));
  }

  const data = thirdList;

  await dataService.post('/sms/wells/expense/operating-cost/withholding-Tax-scr', data);
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
    { fieldName: 'dgr2LevlOgId', visible: false }, // (hidden)2차레벨조직ID-지역단
    { fieldName: 'ogTpCd', visible: false }, // (hidden)2차레벨조직유형코드-지역단
    { fieldName: 'dgr3LevlDgPrtnrNo', visible: false }, // (hidden)2차레벨대표파트너번호-지역단
    { fieldName: 'ogId', visible: false }, // (hidden)정산조직ID
    { fieldName: 'dstOjOgTpCd', visible: false }, // (hidden)배분대상조직유형코드
    { fieldName: 'bldCd', visible: false }, // (hidden)빌딩코드
    { fieldName: 'adjOgId', visible: false },
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '96', styleName: 'text-left', editable: false }, // 총괄단
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '117', styleName: 'text-left', editable: false }, // 지역단
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '195', styleName: 'text-left', editable: false }, // 빌딩명
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '83', styleName: 'text-left', editable: false }, // 성명
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '85', styleName: 'text-center', editable: false }, // 번호
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_RSB'), width: '105', styleName: 'text-left', editable: false }, // 직책
    { fieldName: 'perfVal', header: t('MSG_TXT_PERF'), width: '85', styleName: 'text-center', editable: false, dataType: 'number' }, // 실적
    {
      fieldName: 'useAmt',
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
});

const initGrdThird = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'opcsAdjNo', visible: false }, /* (hidden)운영비정산번호 */
    { fieldName: 'adjOgId', visible: false }, /* (hidden)정산조직ID */
    { fieldName: 'ogTpCd', visible: false }, /* (hidden)조직유형코드 */
    { fieldName: 'adjPrtnrNo', visible: false }, /* (hidden)정산파트너번호 */
    { fieldName: 'bldCd', visible: false }, /* (hidden)빌딩코드 */
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
  debugger;
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
