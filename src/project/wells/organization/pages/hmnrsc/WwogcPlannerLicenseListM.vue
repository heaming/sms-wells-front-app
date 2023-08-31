<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcPlannerLicenseListM - 매니저 자격 관리
3. 작성자 : 홍태기
4. 작성일 : 2023-08-30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 매니저 자격 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onclickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_OG_TP')"
          required
        >
          <kw-select
            v-model="searchParams.ogDvAcd"
            :label="t('MSG_TXT_OG_TP')"
            :options="codes.SELL_OG_DV_ACD"
            :disable="true"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_SEQUENCE_NUMBER')">
          <zwog-partner-search
            v-model:prtnr-no="searchParams.prtnrNo"
            v-model:og-tp-cd="searchParams.ogTpCd"
          />
        </kw-search-item>

        <kw-search-item :label="t('MSG_TXT_QLF')">
          <kw-select
            v-model="searchParams.qlfDvCd"
            :options="codes.QLF_DV_CD"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <h3>{{ $t('MSG_TXT_HMNRSC_INF') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="grdMain1PageInfo.totalCount"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="grdMain1PageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMain1Ref"
        name="grdMain"
        :visible-rows="grdMain1PageInfo.pageSize - 1"
        :page-size="grdMain1PageInfo.pageSize"
        :total-count="grdMain1PageInfo.totalCount"
        @init="initGrid1"
      />
      <!-- <kw-pagination
        :model-value="1"
        :total-count="100"
      /> -->

      <h3>{{ $t('MSG_TXT_DTL_PS') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="grdMain2PageInfo.totalCount"
          />
        </template>
        <kw-btn
          v-permission:create
          dense
          grid-action
          :label="$t('MSG_TXT_CLTN')"
        />
        <kw-btn
          v-permission:create
          dense
          grid-action
          :label="$t('MSG_BTN_QLF_HOLDON')"
        />
        <kw-btn
          v-permission:create
          dense
          grid-action
          :label="$t('MSG_BTN_THM_UPGR')"
        />
        <kw-btn
          v-permission:create
          dense
          grid-action
          :label="$t('MSG_TXT_ADVMNT')"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMain2Ref"
        name="grdMain2"
        :visible-rows="grdMain2PageInfo.pageSize - 1"
        :page-size="grdMain2PageInfo.pageSize"
        :total-count="grdMain2PageInfo.totalCount"
        @init="initGrid2"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, useMeta, gridUtil, codeUtil } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

import ZwogPartnerSearch from '~sms-common/organization/components/ZwogPartnerSearch.vue';

const { t } = useI18n();
const dataService = useDataService();
const { getUserInfo } = useMeta();
const { wkOjOgTpCd, ogTpCd } = getUserInfo();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'SELL_OG_DV_ACD',
  'QLF_DV_CD',
);
const grdMain1Ref = ref(getComponentType('KwGrid'));
const grdMain2Ref = ref(getComponentType('KwGrid'));
const grdMain1Datas = ref([]);
const grdMain2Datas = ref([]);
const selectedCurrentRow = ref({});

const grdMain1PageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 5,
});

const grdMain2PageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 5,
});

const searchParams = ref({
  ogDvAcd: '7',
  ogTpCd: wkOjOgTpCd === null ? ogTpCd : wkOjOgTpCd,
  prntrNo: undefined,
  prntrKnm: undefined,
  qlfDvCd: undefined,
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/partner/planner-license/paging', { params: { ...searchParams.value, ...grdMain1PageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;
  grdMain1PageInfo.value = pagingResult;
  grdMain1Datas.value = list;
  return grdMain1Datas.value;
}

async function fetchDetailData(prtnrNo) {
  const res = await dataService.get(`/sms/wells/partner/planner-license/${prtnrNo}/paging`);
  const { list, pageInfo: pagingResult } = res.data;
  grdMain2PageInfo.value = pagingResult;
  grdMain2Datas.value = list;
  return grdMain2Datas.value;
}

async function setGrdMain1(response) {
  const data = await grdMain1Ref.value.getData();
  if (grdMain1PageInfo.value.pageIndex > 1) {
    await data.addRows(response);
  } else {
    await data.setRows(response);
  }
}

async function setGrdMain2(response) {
  const data = await grdMain2Ref.value.getData();
  if (grdMain2PageInfo.value.pageIndex > 1) {
    await data.addRows(response);
  } else {
    await data.setRows(response);
  }
}

async function init() {
  const response = await fetchData();
  await setGrdMain1(response);
}

async function onclickSearch() {
  grdMain1PageInfo.value.pageIndex = 1;
  await init();
}

async function onGrdMain1ScrollToBottom() {
  grdMain1PageInfo.value.pageIndex += 1;
  await init();
}

async function onGrdMain2ScrollToBottom() {
  grdMain2PageInfo.value.pageIndex += 1;
  const { prtnrNo } = selectedCurrentRow.value;
  const response = await fetchDetailData(prtnrNo);
  await setGrdMain2(response);
}

const { currentRoute } = useRouter();
async function onClickExcelDownload() {
  const view = grdMain1Ref.value.getView();

  const res = await dataService.get('/sms/wells/partner/planner-license/excel-download', { params: searchParams.value });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(() => {
  init();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid1 = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '92', styleName: 'text-center', displayCallback(g, index, value) { return isEmpty(value) ? '-' : value; } },
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '106', styleName: 'text-center', displayCallback(g, index, value) { return isEmpty(value) ? '-' : value; } },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '106', styleName: 'text-center' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '160', styleName: 'text-center', displayCallback(g, index, value) { return isEmpty(value) ? '-' : value; } },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '106', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '92', styleName: 'text-center' },
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_RSB'), width: '92', styleName: 'text-center' },
    {
      fieldName: 'bizUseIdvTno',
      header: t('MSG_TXT_CP'),
      width: '156',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        const bizUseIdvTno = value;
        const bizUseExnoEncr = grid.getValue(index.itemIndex, 'bizUseExnoEncr');
        const bizUseLocaraTno = grid.getValue(index.itemIndex, 'bizUseLocaraTno');

        if (!isEmpty(bizUseIdvTno) && !Number.isNaN(bizUseIdvTno)
          && !isEmpty(bizUseExnoEncr) && !Number.isNaN(bizUseExnoEncr)
          && !isEmpty(bizUseLocaraTno) && !Number.isNaN(bizUseLocaraTno)) {
          return `${bizUseIdvTno}-${bizUseExnoEncr}-${bizUseLocaraTno}`;
        }
        return '-';
      },
    },
    { fieldName: 'rcrtWrteDt', header: t('MSG_TIT_RCRT_DT'), width: '122', styleName: 'text-center', displayCallback(g, index, value) { return isEmpty(value) ? '-' : dayjs(value).format('YYYY-MM-DD'); } },
    { fieldName: 'bryyMmdd', header: t('MSG_TXT_FNL_CLTN_DT'), width: '136', styleName: 'text-center', displayCallback(g, index, value) { return isEmpty(value) ? '-' : dayjs(value).format('YYYY-MM-DD'); } },
    { fieldName: 'fnlCltnDt', header: t('MSG_TXT_STRT_DT'), width: '168', styleName: 'text-center', displayCallback(g, index, value) { return isEmpty(value) ? '-' : dayjs(value).format('YYYY-MM-DD'); } },
    { fieldName: 'edu143', header: t('MSG_TXT_RSG_DT'), width: '168', styleName: 'text-center', displayCallback(g, index, value) { return isEmpty(value) ? '-' : dayjs(value).format('YYYY-MM-DD'); } },
    { fieldName: 'edu96', header: t('MSG_TXT_RSG_DT'), width: '122', styleName: 'text-center', displayCallback(g, index, value) { return isEmpty(value) ? '-' : dayjs(value).format('YYYY-MM-DD'); } },
    { fieldName: 'qlfDvNm', header: t('MSG_TXT_QLF'), width: '122', styleName: 'text-center', displayCallback(g, index, value) { return isEmpty(value) ? '-' : value; } },
    // { fieldName: '', header: t('MSG_TXT_TOPMR_PLAR'), width: '122', styleName: 'text-center' },
    // { fieldName: '', header: t('MSG_TXT_STRT_DT'), width: '168', styleName: 'text-center' },
    // { fieldName: '', header: t('MSG_TXT_RSG_DT'), width: '168', styleName: 'text-center' },
    // { fieldName: '', header: t('MSG_TXT_QLF_YN'), width: '122', styleName: 'text-center' },
    { fieldName: 'bizUseExnoEncr', visible: false },
    { fieldName: 'bizUseLocaraTno', visible: false },
  ];

  // eslint-disable-next-line max-len
  view.getDataSource().setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    {
      header: t('MSG_TXT_BLG'),
      direction: 'horizontal',
      items: ['dgr1LevlOgNm', 'dgr2LevlOgNm', 'ogCd', 'bldNm'],
    },
    {
      header: t('MSG_TXT_HMNRSC'),
      direction: 'horizontal',
      items: ['prtnrNo', 'prtnrKnm', 'rsbDvNm', 'bizUseIdvTno', 'rcrtWrteDt', 'bryyMmdd', 'fnlCltnDt'],
    },
    {
      header: t('MSG_TXT_EDUC_PS'),
      direction: 'horizontal',
      items: ['edu143', 'edu96'],
    },
    'qlfDvNm',
  ]);

  /* 스크롤 페이징 */
  view.onScrollToBottom = async (g) => {
    if (grdMain1PageInfo.value.pageIndex * grdMain1PageInfo.value.pageSize <= g.getItemCount()) {
      await onGrdMain1ScrollToBottom();
    }
  };

  view.onCurrentRowChanged = async (grid, oldRow, newRow) => {
    const selectedRow = gridUtil.getRowValue(grid, newRow);
    const { prtnrNo } = selectedRow;
    selectedCurrentRow.value = selectedRow;
    const response = await fetchDetailData(prtnrNo);
    await setGrdMain2(response);
  };
});

const initGrid2 = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'qlfDvNm', header: t('MSG_TXT_QLF'), width: '92', styleName: 'text-center', displayCallback(g, index, value) { return isEmpty(value) ? '-' : value; } },
    { fieldName: 'qlfAplcDvNm', header: t('MSG_TXT_QLF_CHA'), width: '106', styleName: 'text-center', displayCallback(g, index, value) { return isEmpty(value) ? '-' : value; } },
    { fieldName: 'strtdt', header: t('MSG_TXT_STRT_DATE'), width: '106', styleName: 'text-center', displayCallback(g, index, value) { return isEmpty(value) ? '-' : dayjs(value).format('YYYY-MM-DD'); } },
    { fieldName: 'cvDt', header: t('MSG_TXT_CV_DT'), width: '160', styleName: 'text-center', displayCallback(g, index, value) { return isEmpty(value) ? '-' : dayjs(value).format('YYYY-MM-DD'); } },
    { fieldName: 'enddt', header: t('MSG_TXT_END_DT'), width: '106', styleName: 'text-center', displayCallback(g, index, value) { return isEmpty(value) ? '-' : dayjs(value).format('YYYY-MM-DD'); } },
    { fieldName: 'col1', header: t('MSG_TXT_CNTRW_BRWS'), width: '92', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_BTN_CNTRW_BRWS') },
    { fieldName: 'pymdt', header: t('MSG_TXT_DSB_DT'), width: '92', styleName: 'text-center', displayCallback(g, index, value) { return isEmpty(value) ? '-' : dayjs(value).format('YYYY-MM-DD'); } },
    { fieldName: 'dsbAmt', header: t('MSG_TXT_DSB_AMT'), width: '92', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col2', header: t('MSG_TXT_MDFC_USR_NO'), width: '92', styleName: 'text-center', displayCallback(g, index, value) { return isEmpty(value) ? '-' : value; } },
    { fieldName: 'col3', header: t('MSG_TXT_MDFC_USR'), width: '92', styleName: 'text-center', displayCallback(g, index, value) { return isEmpty(value) ? '-' : value; } },
    { fieldName: 'col4', header: t('MSG_TXT_MDFC_DATE'), width: '92', styleName: 'text-center', displayCallback(g, index, value) { return isEmpty(value) ? '-' : dayjs(value).format('YYYY-MM-DD'); } },
  ];

  // eslint-disable-next-line max-len
  view.getDataSource().setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  /* 스크롤 페이징 */
  view.onScrollToBottom = async (g) => {
    if (grdMain2PageInfo.value.pageIndex * grdMain2PageInfo.value.pageSize <= g.getItemCount()) {
      await onGrdMain2ScrollToBottom();
    }
  };
});
</script>

<style scoped>
</style>
