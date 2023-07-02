<!----
****************************************************************************************************
1. 모듈 : DCD
2. 프로그램 ID : WwdcdOperatingCostMgtM - 운영비 등록관리 Operatingost / W-CL-U-0082M01
3. 작성자 : gs.piit172 kim juhyun
4. 작성일 : 2023.02.03
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 운영비 등록관리 프로그램
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_USE_YM')"
          required
        >
          <kw-date-picker
            v-model:init-data="searchParams.baseYm"
            v-model="searchParams.baseYm"
            v-model:baseYm="searchParams.baseYm"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          required
          :label="$t('MSG_TXT_OG_LEVL')"
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.dgr1LevlOgId"
            v-model:og-levl-dv-cd2="searchParams.dgr2LevlOgId"
            v-model:og-levl-dv-cd3="searchParams.dgr3LevlOgId"
            :og-tp-cd="searchParams.ogTpCd"
            :base-ym="searchParams.baseYm"
            :start-level="1"
            :end-level="3"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_OPCS_AMT_PS') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="1"
        @init="initGrdMain"
      />

      <kw-separator />

      <kw-action-top class="mb20">
        <template #left>
          <h3>
            {{ t('MSG_TXT_OPCS_SMRY_PS') }}
            <ul class="kw-notification">
              <li>
                <span class="kw-fc--primary">{{ t('MSG_TXT_TH_TOT_F_UNW_ITE_SHO_BE_ZER_AEC_UNA') }}</span>
              </li>
            </ul>
          </h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <kw-grid
        ref="grdSubRef"
        name="grdSub"
        :visible-rows="1"
        @init="initGrdSub"
      />

      <kw-separator />
      <kw-tabs
        v-model="selectedTab"
      >
        <kw-tab
          name="basic"
          :label="$t('MSG_TXT_MSCR_EXCD')"
        />
        <kw-tab
          name="sel"
          :label="$t('MSG_TXT_MSCR')"
        />
      </kw-tabs>
      <kw-observer
        ref="basic"
        name="sel"
      >
        <kw-tab-panels
          :model-value="selectedTab"
          keep-alive
        >
          <kw-tab-panel name="basic">
            <wwdcd-operating-cost-mgt-m-securities-exception
              :ref="(searchParams) => tabRefs.basic = searchParams"
              v-model:selected-link-id="selectedLinkId"
              v-model:init-data="searchParams"
              @reload-pages="fetchTabs('basic')"
              @teb-event="isTabData"
            />
          </kw-tab-panel>
          <kw-tab-panel name="sel">
            <wwdcd-operating-cost-mgt-m-securities
              :ref="(searchParams) => tabRefs.sel = searchParams"
              v-model:selected-link-id="selectedLinkId"
              v-model:init-data="searchParams"
              @reload-pages="fetchTabs('sel')"
              @teb-event="isTabData"
            />
          </kw-tab-panel>
        </kw-tab-panels>
      </kw-observer>
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Initialize Component (Tab)
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, defineGrid } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';

// 유가증권 제외
import WwdcdOperatingCostMgtMSecuritiesException from './WwdcdOperatingCostMgtMSecuritiesException.vue';
// 유가증권
import WwdcdOperatingCostMgtMSecurities from './WwdcdOperatingCostMgtMSecurities.vue';

// const store = useStore();
// const { companyCode } = store.getters['meta/getUserInfo'];
const selectedTab = ref('basic');
const dataService = useDataService();
const { t } = useI18n();
const tabRefs = reactive({});
const selectedLinkId = ref(null);
const { getters } = useStore();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// 본사 관리자가 아니면 코드 값 가져와야 함
const userInfo = getters['meta/getUserInfo'];
const { ogTpCd } = userInfo;
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
let cachedParams;

const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'),
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  dgr3LevlOgId: '',
  ogTpCd,
});

// 운영비 총 사용 건수 =  "(TAB)유가증권 제외"의 정산대상 grid에서 정산제외여부='N' 인것의 row개수
//                     + "(TAB)유가증권"의 정산대상 grid에서 정산제외여부='N' 인것의 row개수
// 미적요 :  "(TAB)유가증권 제외"의 정산대상 grid에서 구매품목 및 사용내역 항목이 빈값인 row개수
//           + "(TAB)유가증권"의 정산대상 grid에서 구매품목 및 사용내역 항목이 빈값인 row개수
async function isTabData(flag, datas) {
  console.log('flag', flag);
  console.log('datas', datas);

  if (flag === 'basic') {
    const sub = grdSubRef.value.getView();
    const addValue = {};
    let opcsAdjExcdYn = 0;
    let usrSmryCn = 0;
    datas.forEach((data) => {
      if (data.opcsAdjExcdYn === 'N') {
        opcsAdjExcdYn += 1;
      } // 정산제외여부

      if (isEmpty(data.usrSmryCn)) {
        usrSmryCn += 1;
      } // 구매품목
    });

    if (isEmpty(sub.getValues(0))) {
      addValue.operatingExpensesTotal = opcsAdjExcdYn;
      addValue.aesthetic = usrSmryCn;
      sub.getDataSource().addRow(addValue);
    } else {
      sub.setValue(0, 'operatingExpensesTotal', opcsAdjExcdYn);
      sub.setValue(0, 'aesthetic', usrSmryCn);
    }
  } else if (flag === 'sel') {
    const sub = grdSubRef.value.getView();
    const addValue = {};
    let opcsAdjExcdYn = 0;
    let usrSmryCn = 0;
    datas.forEach((data) => {
      if (data.opcsAdjExcdYn === 'N') {
        opcsAdjExcdYn += 1;
      } // 정산제외여부

      if (isEmpty(data.usrSmryCn)) {
        usrSmryCn += 1;
      } // 구매품목
    });

    if (isEmpty(sub.getValues(0))) {
      addValue.operatingExpensesTotal = opcsAdjExcdYn;
      addValue.aesthetic = usrSmryCn;
      sub.getDataSource().addRow(addValue);
    } else {
      sub.setValue(0, 'operatingExpensesTotal', opcsAdjExcdYn);
      sub.setValue(0, 'aesthetic', usrSmryCn);
    }
  }
}

async function fetchAmountData() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/amount', { params: cachedParams });
  view.getDataSource().setRows(res.data);
  view.resetCurrent();

  const mainData = [];
  if (!isEmpty(res.data)) {
    cachedParams.opcsAdjNo = res.data.opcsAdjNo;
    cachedParams.mainOgId = res.data.adjOgId;
    cachedParams.mainOgTpCd = res.data.mainOgTpCd;
    cachedParams.mainPrtnrNo = res.data.adjPrtnrNo;
    cachedParams.rsbDvCd = res.data.rsbDvCd;
    cachedParams.mainOgTpCd = res.data.ogTpCd;

    mainData.push(res.data);

    view.getDataSource().setRows(mainData);
    view.resetCurrent();

    const tab = selectedTab.value;
    if (tab === 'basic') {
      debugger;
      await tabRefs.basic.setData(cachedParams);
    } else if (tab === 'sel') {
      await tabRefs.sel.setData(cachedParams);
    }
  } else {
    view.getDataSource().setRows(mainData);
    view.resetCurrent();
  }
}

async function fetchSummaryData() {
  const view = grdSubRef.value.getView();
  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/summary', { params: cachedParams });
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);

  if (isEmpty(cachedParams.dgr1LevlOgId)
  && isEmpty(cachedParams.dgr2LevlOgId)
  && isEmpty(cachedParams.dgr3LevlOgId)) {
    alert(t('조직레벨 필수 값 입니다.'));
    return;
  }

  if (!isEmpty(cachedParams.dgr3LevlOgId)) {
    cachedParams.dgr1LevlOgId = '';
    cachedParams.dgr2LevlOgId = '';
  } else
  if (!isEmpty(cachedParams.dgr2LevlOgId)) {
    cachedParams.dgr1LevlOgId = '';
    cachedParams.dgr3LevlOgId = '';
  } else
  if (!isEmpty(cachedParams.dgr1LevlOgId)) {
    cachedParams.dgr2LevlOgId = '';
    cachedParams.dgr3LevlOgId = '';
  }

  fetchAmountData(); // 금액
  fetchSummaryData(); // 적요
}

async function onClickSearch() {
  fetchData();
}

const saveParams = ref({
  opcsCardId: '',
});

async function saveData(column, opcsCardId, file) {
  if (!isEmpty(file.files)) {
    if (column === 'opcsWhtxCfdcApnFileId') {
      saveParams.value.opcsCardId = opcsCardId;
      saveParams.value.attachOpcsWhtxCfdcApnFileId = file.files;
    }
    const data = saveParams.value;
    await dataService.post('/sms/wells/closing/expense/operating-cost', data);

    fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'befCardResAmt', header: t('MSG_TXT_CRDOVR_BLAM'), width: '251', styleName: 'text-right', dataType: 'number' }, // 이월잔액
    { fieldName: 'thmCardLimAmt', header: t('MSG_TXT_THM_DSB'), width: '277', styleName: 'text-right', dataType: 'number' }, // 당월지급
    { fieldName: 'cardLimAmt', header: t('MSG_TXT_THM_U_PSB_AMT'), width: '258', styleName: 'text-right', dataType: 'number' }, // 당월 이용가능 금액
    { fieldName: 'cardUseAmt', header: t('MSG_TXT_THM_USE_AMT'), width: '252', styleName: 'text-right', dataType: 'number' }, // 당월 사용금액
    { fieldName: 'cardCanAmt', header: t('MSG_TXT_THM_CAN_AMT'), width: '253', styleName: 'text-right', dataType: 'number' }, // 당월 취소금액
    { fieldName: 'cardResAmt', header: t('MSG_TXT_BLAM'), width: '255', styleName: 'text-right', dataType: 'number' }, // 잔액
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});

const initGrdSub = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'opcsCardId', visible: false },
    { fieldName: 'operatingExpensesTotal', header: t('MSG_TXT_OPCS_TOT_USE_CT'), width: '477', styleName: 'text-center' }, // 운영비 총 사용 건수
    { fieldName: 'aesthetic', header: t('MSG_TXT_AES'), width: '450', styleName: 'text-center' }, // 미적요
    { fieldName: 'opcsWhtxCfdcApnFileId',
      header: t('MSG_TXT_MSCR_WHTX_CFDC_APN_FILE'),
      width: '300',
      styleName: 'text-center',
      dataType: 'file',
      editable: true,
      editor: {
        type: 'file',
        attachDocumentId: 'opcsWhtxCfdcApnFileId',
        attachGroupId: 'ATG_DCD_OPCS_WHTX_CFDC',
        downloadable: true,
        multiple: true,
        editable: true,
      },
    },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'opcsWhtxCfdcApnFileId') {
      const { opcsCardId, opcsWhtxCfdcApnFileId } = g.getValues(itemIndex);
      saveData(column, opcsCardId, opcsWhtxCfdcApnFileId);
    }
  };
});

</script>
