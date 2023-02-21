<!----
****************************************************************************************************
1. 모듈 : DCD
2. 프로그램 ID : WwDcdOperatingCostMgtM - 운영비 등록관리 Operatingost
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
      @search="onClickSearch"
    >
      <kw-action-top>
        <kw-btn
          secondary
          dense
          :label="$t('MSG_TXT_MENU_DLD')"
        />
      </kw-action-top>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_USE_YM')"
          required
        >
          <kw-date-picker
            v-model:init-data="searchParams.useYearMonth"
            v-model="searchParams.useYearMonth"
            v-model:useYearMonth="searchParams.useYearMonth"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_OG_LEVL')">
          <kw-select
            :options="['']"
          />
          <kw-select
            :options="['']"
          />
          <kw-select
            :options="['']"
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
            <wwdcd-operating-cost-mgt-m-mscr-excd
              :ref="(vm) => tabRefs.mscrexcd = vm"
              v-model:selected-link-id="selectedLinkId"
              v-model:init-data="searchParams.useYearMonth"
              @reload-pages="fetchTabs('basic')"
            />
          </kw-tab-panel>
          <kw-tab-panel name="sel">
            <wwdcd-operating-cost-mgt-m-marketable-securities
              :ref="(vm) => tabRefs.securities = vm"
              v-model:selected-link-id="selectedLinkId"
              v-model:init-data="searchParams.useYearMonth"
              @reload-pages="fetchTabs('sel')"
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
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

// 유가증권 제외
import WwdcdOperatingCostMgtMMscrExcd from './WwdcdOperatingCostMgtMMscrExcd.vue';
// 유가증권
import WwdcdOperatingCostMgtMMarketableSecurities from './WwdcdOperatingCostMgtMMarketableSecurities.vue';

// const store = useStore();
// const { companyCode } = store.getters['meta/getUserInfo'];
const selectedTab = ref('basic');
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const { t } = useI18n();
const tabRefs = reactive({});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

let cachedParams;
const searchParams = ref({
  useYearMonth: dayjs().format('YYYYMM'),
});

async function fetchAmountData() {
  const view = grdMainRef.value.getView();
  const mainServices = ([
    { col1: '20,000', col2: '5,000', col3: '1111-1111-1111-1111', col4: '첫번째 그리드1', col5: '일반대중음식', col6: '경북 예천군 효명...' },

  ]);
  view.getDataSource().setRows(mainServices);
  view.resetCurrent();

  // TODO.뒷단 완료되면 할꺼
  // cachedParams.registration = 'amount';
  // const res = await dataService.get('/sms/wells/expense/operating-cost', { params: { ...cachedParams } });
  // debugger;
  // const { list: services } = res.data;
  // const view = grdMainRef.value.getView();
  // view.getDataSource().setRows(services);
  // view.resetCurrent();
}

async function fetchSummaryData() {
  const view = grdSubRef.value.getView();
  const subServices = ([
    { col1: '2,022', col2: '21,670', col3: '등록', col4: '다운로드' },

  ]);
  view.getDataSource().setRows(subServices);
  view.resetCurrent();

  /* TODO.뒷단 완료되면 할꺼
  cachedParams.registration = 'summary';
  const res = await dataService.get('/sms/wells/expense/operating-cost', { params: { ...cachedParams } });
  debugger;

    const { list: services } = res.data;
    const view = grdMSubRef.value.getView();
    view.getDataSource().setRows(services);
    view.resetCurrent();
*/
}

async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  fetchAmountData(); // 금액
  fetchSummaryData(); // 적요
  await Promise.all(
    Object.values(tabRefs).map((vm) => vm.setData(cachedParams)),
  );
}

async function onClickSearch() {
  fetchData();
}

async function withholdingTaxCfdcDld() {
  // 다운로드
  const res = dataService.get('/sms/wells/expense/operating-cost/withholdingTaxCfdcDld', { params: { ...cachedParams } });
  console.log(res.data);
}

async function withholdingTaxCfdcAdd() {
  // TODO.첨부파일등록

  // 첨부파일 정보를 함께 넘겨줍시다. (팝업이지만 확인!)
  // Object.assign(cachedParams{ attachFiles: [file.value] });
  const res = dataService.post('/sms/wells/expense/operating-cost/', { params: { ...cachedParams } });
  console.log(res.data);
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },

  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CRDOVR_BLAM'), width: '251', styleName: 'text-right' }, // 이월잔액
    { fieldName: 'col2', header: t('MSG_TXT_THM_DSB'), width: '277', styleName: 'text-right' }, // 당월지급
    { fieldName: 'col3', header: t('MSG_TXT_THM_U_PSB_AMT'), width: '258', styleName: 'text-right' }, // 당월 이용가능 금액
    { fieldName: 'col4', header: t('MSG_TXT_THM_USE_AMT'), width: '252', styleName: 'text-right' }, // 당월 사용금액
    { fieldName: 'col5', header: t('MSG_TXT_THM_CAN_AMT'), width: '253', styleName: 'text-right' }, // 당월 취소금액
    { fieldName: 'col6', header: t('MSG_TXT_BLAM'), width: '255', styleName: 'text-right' }, // 잔액

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});

const initGrdSub = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_OPCS_TOT_USE_CT'), width: '477', styleName: 'text-center' }, // 운영비 총 사용 건수
    { fieldName: 'col2', header: t('MSG_TXT_AES'), width: '450', styleName: 'text-center' }, // 미적요
    { fieldName: 'col3',
      header: t('MSG_TXT_MSCR_WHTX_CFDC_APN_FILE'),
      width: '300',
      styleName: 'text-center',
      renderer: {
        type: 'button',

      },
    },
    { fieldName: 'col4',
      header: t('MSG_TXT_MSCR_WHTX_CFDC_APN_FILE'),
      width: '300',
      styleName: 'text-center',
      renderer: {
        type: 'button',

      },
    },
  ];

  const hideChildLayout = [
    'col1',
    'col2',
    {
      direction: 'horizontal',
      hideChildHeaders: true,
      items: [
        'col3',
        'col4',
      ],
      header: t('MSG_TXT_MSCR_WHTX_CFDC_APN_FILE'),
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(hideChildLayout);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  view.onCellItemClicked = ((grid, index) => {
    // grid, index, clickData

    if (index.column === 'col3') {
      // btnValue : 다운로드
      withholdingTaxCfdcDld();
    } else if (index.column === 'col4') {
      // btnValue : 등록(파일테이블 insert, 유가)
      withholdingTaxCfdcAdd();
    }
  });
});

</script>
