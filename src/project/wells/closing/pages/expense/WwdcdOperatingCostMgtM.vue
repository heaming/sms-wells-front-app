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
        <!-- 사용년월 -->
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
        <!-- 조직레벨 -->
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
          required
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
          <h3>{{ t('MSG_TXT_OPCS_AMT_PS') }}</h3> <!-- 운영비 금액 현황 -->
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
          <h3>{{ t('MSG_TXT_OPCS_SMRY_PS') }} <!-- 운영비 적요 현황 --></h3>
          <ul class="kw-notification">
            <li>
              <span class="kw-fc--primary">{{ t('MSG_TXT_TH_TOT_F_UNW_ITE_SHO_BE_ZER_AEC_UNA') }}</span>
            </li>
          </ul>
        </template>
        <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <!-- 운영비 적요 현황 그리드 -->
      <kw-grid
        ref="grdSubRef"
        name="grdSub"
        :visible-rows="1"
        @init="initGrdSub"
      />
      <kw-separator />
      <kw-tabs
        v-model="selectedTab"
        class="mt30"
      >
        <!-- 유가증권 제외 탭 -->
        <kw-tab
          name="basic"
          :label="$t('MSG_TXT_MSCR_EXCD')"
        />
        <!-- 유가증권 탭 -->
        <kw-tab
          name="sel"
          :label="$t('MSG_TXT_MSCR')"
        />
      </kw-tabs>
      <kw-observer
        ref="basic"
        name="basic"
      >
        <kw-tab-panels
          :model-value="selectedTab"
          keep-alive
        >
          <kw-tab-panel name="basic">
            <wwdcd-operating-cost-mgt-m-securities-exception
              :ref="(searchParams) => tabRefs.basic = searchParams"
              :selected-link-id="selectedLinkId"
              :init-data="searchParams"
              @search="onClickSearch"
            />
          </kw-tab-panel>
          <kw-tab-panel name="sel">
            <wwdcd-operating-cost-mgt-m-securities
              :ref="(searchParams) => tabRefs.sel = searchParams"
              :selected-link-id="selectedLinkId"
              :init-data="searchParams"
              @search="onClickSearch"
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
import { useDataService, getComponentType, defineGrid, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import WwdcdOperatingCostMgtMSecuritiesException from './WwdcdOperatingCostMgtMSecuritiesException.vue'; // 유가증권 제외
import WwdcdOperatingCostMgtMSecurities from './WwdcdOperatingCostMgtMSecurities.vue'; // 유가증권

const { alert } = useGlobal();
const store = useStore();
const selectedTab = ref('basic');
const selectedLinkId = ref(null);
const dataService = useDataService();
const { t } = useI18n();
const tabRefs = reactive({});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// 본사 관리자가 아니면 코드 값 가져와야 함
const userInfo = store.getters['meta/getUserInfo'];
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
let cachedParams = {};

const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'),
  ogTpCd: userInfo.wkOjOgTpCd === null ? userInfo.ogTpCd : userInfo.wkOjOgTpCd,
  adjOgId: '',
  adjPrtnrNo: '',
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  dgr3LevlOgId: '',
});

async function fetchAmountData() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/amount', { params: cachedParams });

  const mainData = [];
  if (!isEmpty(res.data)) {
    mainData.push(res.data);
  }
  view.getDataSource().setRows(mainData);

  cachedParams.opcsAdjNo = res.data.opcsAdjNo;
  cachedParams.adjOgId = res.data.adjOgId;
  cachedParams.adjOgTpCd = res.data.ogTpCd;
  cachedParams.adjPrtnrNo = res.data.adjPrtnrNo;
  await tabRefs.basic.setData(cachedParams);
  await tabRefs.sel.setData(cachedParams);
}

async function fetchSummaryData() {
  const view = grdSubRef.value.getView();
  const res = await dataService.get('/sms/wells/closing/expense/operating-cost/summary', { params: cachedParams });
  const subData = [];
  if (!isEmpty(res.data)) {
    subData.push(res.data);
  }
  view.getDataSource().setRows(subData);
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
    cachedParams.dgr1LevlOgId = null;
    cachedParams.dgr2LevlOgId = null;
  } else if (!isEmpty(cachedParams.dgr2LevlOgId)) {
    cachedParams.dgr1LevlOgId = null;
    cachedParams.dgr3LevlOgId = null;
  } else if (!isEmpty(cachedParams.dgr1LevlOgId)) {
    cachedParams.dgr2LevlOgId = null;
    cachedParams.dgr3LevlOgId = null;
  } else {
    cachedParams.dgr1LevlOgId = null;
    cachedParams.dgr2LevlOgId = null;
    cachedParams.dgr3LevlOgId = null;
  }

  await fetchAmountData(); // 금액
  await fetchSummaryData(); // 적요
}

async function onClickSearch() {
  await fetchData();
}

const saveParams = ref({
  opcsCardId: '',
});

async function saveData(column, opcsCardId, file) {
  if (column === 'atthDocId') {
    saveParams.value.opcsCardId = opcsCardId;
    saveParams.value.attachMscrWhtxCfdcApnFileId = file.files;
  }
  const data = saveParams.value;
  await dataService.post('/sms/wells/closing/expense/operating-cost', data);

  await fetchData();
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
// 운영비 금액현황
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

  view.setCellStyleCallback(() => ({
    styleName: 'right-border',
  }));
});

// 운영비 적요 현황  operatingExpensesTotal aesthetic
const initGrdSub = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'opcsCardId', visible: false },
    { fieldName: 'opcsAdjCnt', header: t('MSG_TXT_OPCS_TOT_USE_CT'), width: '477', styleName: 'text-center', dataType: 'number' }, // 운영비 총 사용 건수
    { fieldName: 'opcsSmryNCnt', header: t('MSG_TXT_AES'), width: '450', styleName: 'text-center', dataType: 'number' }, // 미적요
    { fieldName: 'atthDocId',
      header: t('MSG_TXT_MSCR_WHTX_CFDC_APN_FILE'),
      width: '300',
      styleName: 'text-center',
      dataType: 'file',
      editor: {
        type: 'file',
        attachDocumentId: 'atthDocId',
        attachGroupId: 'ATG_DCD_OPCS_WHTX_CFDC',
        downloadable: true,
        multiple: true,
        editable: true,
      },
    }, // 유가증권 제외 원천세 확인서 - 등록
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'atthDocId') {
      const { opcsCardId, atthDocId } = g.getValues(itemIndex);
      saveData(column, opcsCardId, atthDocId);
    }
  };
});
</script>
<style scoped>
.right-border {
  border-right: 1px solid #fff !important;
}
</style>
