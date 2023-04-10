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
    class="kw-popup--xl"
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

    <kw-search
      :cols="2"
      class="mt30"
      :modified-targets="['grdPopSub']"
      @search="onSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_RGNL_GRP')"
          required
        >
          <zwogz-level-select
            v-model:og-levl-dv-cd2="searchParams.ogLevlDvCd2"
            :og-tp-cd="searchParams.ogTpCd"
            :base-ym="searchParams.baseYm"
            :start-level="2"
            :end-level="2"
            first-option="all"
            rules="required"
          />
        </kw-search-item>

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
        <kw-search-item
          :label="t('MSG_TXT_RSB')"
        >
          <kw-option-group
            v-model="searchParams.pstnDvCd"
            type="radio"
            :options="codes.PSTN_DV_CD"
          />
        </kw-search-item>
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
      {{ t('MSG_TXT_OJPS_INQR_RS') }}
      <ul class="kw-notification">
        <li>
          <span class="kw-fc--primary">{{ t('MSG_TXT_AMT_IN_AFT_SPMT_BUTN_CLK') }}</span>
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
          <span class="kw-fc--primary"> {{ t('MSG_TXT_SEL_THE_TAR_YOU_WA_TO_EXC_AND_CK_THE_EXC_TAR_BTN') }}</span>
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
import { defineGrid, useDataService, getComponentType, gridUtil, useGlobal, useModal, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import ZwogzLevelSelect from '~sms-common/organization/components/common/ZwogzLevelSelect.vue';
import dayjs from 'dayjs';

const { t } = useI18n();
const { modal, confirm, notify } = useGlobal();
const { ok } = useModal();
const { getters } = useStore();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const grdThirdRef = ref(getComponentType('KwGrid'));
const subTotalCount = ref(0);
const thirdTotalCount = ref(0);
let cachedParams;
let mainParams;
const props = defineProps({
  params: {
    type: Object,
    required: true,
  },
});

const codes = await codeUtil.getMultiCodes(
  'PSTN_DV_CD',
);

async function fetchData() {
  mainParams.baseYm = cloneDeep(props.value);
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(mainParams);
}

const userInfo = getters['meta/getUserInfo'];
const { ogTpCd } = userInfo;
const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'),
  ogTpCd,
  bldCd: '',
  ogLevlDvCd2: '',
  pstnDvCd: '',
  dstOjpsNm: '',
});

const buildingCodes = ref([]);
async function buildingCode() {
  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/marketable-securities-excd/code');
  buildingCodes.value = res.data;
}

async function onClickEquality() {
  // 균등
  const mainView = grdMainRef.value.getView();
  const subView = grdMainRef.value.getView();
  console.log(mainView);
  console.log(subView);
}

async function onClickPerformance() {
  // 실적
  const mainView = grdMainRef.value.getView();
  const subView = grdMainRef.value.getView();
  // 정산대상금액  ACC_AMT

  if (mainView.ACC_AMT === 0) {
    alert('');// 정산할 대상이 없습니다.
    return;
  }
  if (subView.TOT_ACC_N_CNT === 0) {
    alert(''); // 미정산 내역이 없습니다.
    return;
  }
  if (mainView.TOT_DIV_AMT !== subView.ACC_AMT) {
    alert(''); // 등록 금액이 정산 대상 금액과 일치하도록 등록해주세요.
  }

  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/marketable-securities-excd');
  const jikukListAccN = await cloneDeep(res.data);

  console.log(jikukListAccN.length);
  // const adjustObject = mainView.getDataSource();
  // const checkRows = await subView.getCheckedRows(subView).totalCount;
}

async function onClickBalanceAmount() {
  // 잔액 클리어
}

async function onClickObjectPersonAdd() {
  // 대상자 추가

  const subView = grdSubRef.value.getView();
  const thirdView = grdSubRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(subView);

  if (checkedRows.length === 0) {
    await notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  // row 추가
  // const dataSource = view.getDataSource();
  // dataSource.checkRowStates(true);
  // gridUtil.insertRowAndFocus(view, 0, {
  //  status: 'new',
  // });

  checkedRows.forEach((item) => {
    // 등록금액 + [대상자 조회결과 grid]의 금액합산 > 정산대상금액 인 경우
    const adjustObject = 0;
    if (item.total > adjustObject) {
      thirdView.setValue(cachedParams.objectPerson);
      const userName = cachedParams.objectPerson;
      const dataSource = thirdView.getDataSource();
      dataSource.checkRowStates(true);
      gridUtil.insertRowAndFocus(thirdView, 0, {
        status: 'new',
        userName,
      });

      // thirdView = grdThirdRef.value.getView();
      thirdView.getDataRow();
    }
  });
}

async function onClickObjectPersonDel() {
  // 대상자 제외
  const view = grdThirdRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (checkedRows === 0) {
    await notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  checkedRows.forEach((obj) => {
    // 등록금액 + [대상자 조회결과 grid]의 금액합산 > 정산대상금액 인 경우
    // 대상자추가
    const adjustObject = 0;
    if (obj.total > adjustObject) {
      // view.setValue(obj.dataRows, searchParams.value.objectPerson, 'objectPerson');
      const userName = cachedParams.objectPerson;
      const dataSource = view.getDataSource();
      dataSource.checkRowStates(true);
      gridUtil.insertRowAndFocus(view, 0, {
        status: 'new',
        userName,
      });
    }
  });
}

async function subject() {
  const view = grdSubRef.value.getView();
  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/marketable-securities-excd/subject', { params: cachedParams });

  const { list: services } = res.data;
  subTotalCount.value = res.data.length;
  view.getDataSource().setRows(services);
  view.resetCurrent();
}

async function marketableSecuritiesExcd() {
  const view = grdThirdRef.value.getView();
  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/marketable-securities-excd/final-withholding-tax-settlement', { params: cachedParams });

  const { list: services } = res.data;
  thirdTotalCount.value = res.data.length;

  view.getDataSource().setRows(services);
  view.resetCurrent();
}

async function onClickSearchPartner() {
  /* TODO: 임직원 검색 컴포넌트 개발 시, 변경 될 수 있음 */
  const { result, payload } = await modal({
    // component: 'ZwcmzSingleSelectUserListP',
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
    },
  });
  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}

async function onSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await subject();
  await marketableSecuritiesExcd();
}

async function onClickSave() {
  // 저장
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
  /* TODO. 뒷단 완료되면 다시 살릴꺼
  await dataService.post('/sms/wells/expense/operating-cost/withholding-Tax-scr-excd', { params: checkedRows });
  await notify(t('MSG_ALT_SAVE_DATA'));
  ok();
  */
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'authDate', header: t('MSG_TXT_USE_DTM'), width: '220', styleName: 'text-center' }, // 사용일시
    { fieldName: 'mrcNm', header: t('MSG_TXT_ADJ_OJ_AMT'), width: '220', styleName: 'text-left' }, // 가맹점
    { fieldName: 'adjCnfmAmt', header: t('MSG_TXT_MRC'), width: '200', styleName: 'text-right' }, // 정산대상금액
    { fieldName: 'dstAmt', header: t('MSG_TXT_RGST_AMT'), width: '200', styleName: 'text-right' }, // 등록금액
    { fieldName: 'amt', header: t('MSG_TXT_UNRG_AMT'), width: '221', styleName: 'text-right' }, // 미등록금액

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});

const initGrdSub = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '96', styleName: 'text-left' }, // 총괄단
    { fieldName: 'ogNm', header: t('MSG_TXT_RGNL_GRP'), width: '117', styleName: 'text-left' }, // 지역단
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '195', styleName: 'text-left' }, // 빌딩명
    { fieldName: 'dstOjOgTpCd', header: t('MSG_TXT_EMPL_NM'), width: '83', styleName: 'text-left' }, // 성명
    { fieldName: 'dstOjpsNm', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '85', styleName: 'text-center' }, // 번호
    { fieldName: 'signrPrtnrNo', header: t('MSG_TXT_RSB'), width: '105', styleName: 'text-left' }, // 직책
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_PERF'), width: '85', styleName: 'text-center' }, // 실적
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
});

const initGrdThird = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '100', styleName: 'text-left' }, // 총괄단
    { fieldName: 'ogNm', header: t('MSG_TXT_RGNL_GRP'), width: '101', styleName: 'text-left' }, // 지역단
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '164', styleName: 'text-left' }, // 빌딩명
    { fieldName: 'dstOjpsNm', header: t('MSG_TXT_EMPL_NM'), width: '83', styleName: 'text-left' }, // 성명
    { fieldName: 'signrPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '85', styleName: 'text-center' }, // 번호
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_RSB'), width: '105', styleName: 'text-left' }, // 직책
    { fieldName: 'adjCnfmAmt', header: t('MSG_TXT_OPCS_ADJ_AMT'), width: '169', styleName: 'text-right', dataType: 'number' }, // 운영비 정산금액
    { fieldName: 'dstWhtx', header: t('MSG_TXT_WHTX'), width: '178', styleName: 'text-right', dataType: 'number' }, // 원천세
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});

onMounted(async () => {
  await buildingCode();
  await fetchData();
});
</script>
