<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTC
2. 프로그램 ID : WwctcIrregularBusinessArbitArtcListM - 비정도영업조치사항조회
3. 작성자 : gs.rahul.n
4. 작성일 : 2023.01.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 비정도영업조치사항조회 화면
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-tabs model-value="2">
      <kw-tab
        name="1"
        label="비정도영업조치사항관리"
      />
      <kw-tab
        name="2"
        label="비정도영업조치사항조회"
      />
    </kw-tabs>
    <kw-tab-panels model-value="2">
      <kw-tab-panel name="2">
        <kw-search
          @search="onClickSearch"
        >
          <kw-search-row>
            <kw-search-item
              :colspan="2"
              :label="$t('MSG_TXT_ACEPT_PERIOD')"
            >
              <kw-select
                v-model="searchParams.srchGbn "
                :options="prdDivOption"
              />
              <kw-date-range-picker
                :key="isRegistration"
                v-model:from="searchParams.dangOcStrtdt"
                v-model:to="searchParams.dangOcEnddt"
                :type="isRegistration"
              />
            </kw-search-item>

            <kw-search-item
              :label="$t('MSG_TXT_MANAGEMENT_DEPARTMENT')"
            >
              <kw-select
                v-model="searchParams.gnrdv"
                :options="gnrlMngTeamOptions"
              />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_RGNL_GRP')"
            >
              <kw-input
                v-model="searchParams.rgrp"
              />
            </kw-search-item>

            <kw-search-item
              :label="$t('MSG_TXT_BRANCH')"
            >
              <kw-input
                v-model="searchParams.brch"
              />
            </kw-search-item>
            <kw-search-item
              :label="$t('MSG_TXT_EMP_SRCH')"
            >
              <kw-input
                v-model="searchParams.dangOjPrtnrNo"
                icon="search"
                @click-icon="onClickSearchPartnerId"
              />
            </kw-search-item>
          </kw-search-row>
        </kw-search>

        <div class="result-area">
          <kw-action-top>
            <template #left>
              <kw-paging-info
                v-model:page-index="pageInfo.pageIndex"
                v-model:page-size="pageInfo.pageSize"
                :total-count="pageInfo.totalCount"
                :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
                @change="fetchData"
              />
            </template>
            <kw-btn
              :label="$t('MSG_BTN_DEL')"
              @click="onClickDelete"
            />
            <kw-btn
              icon="download_on"
              :disable="pageInfo.totalCount === 0"
              dense
              secondary
              :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
              @click="onClickExcelDownload"
            />
          </kw-action-top>
          <kw-grid
            ref="grdMainRef"
            :visible-rows="pageInfo.pageSize - 1"
            @init="initGrdMain"
          />
        </div>
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { gridUtil, defineGrid, getComponentType, useDataService, useMeta, codeUtil, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { modal } = useGlobal();
const { getConfig } = useMeta();
const dataService = useDataService();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const searchParams = ref({
  srchGbn: 1,
  dangOcStrtdt: '',
  dangOcEnddt: '',
  gnrdv: '',
  rgrp: '',
  brch: '',
  dangOjPrtnrNo: '',
});
const prdDivOption = ref([{ codeId: 1, codeName: t('MSG_TXT_FST_RGST_DT') },
  { codeId: 2, codeName: t('MSG_TXT_YEAR_OCCURNCE') }]);
const isRegistration = computed(() => (searchParams.value.srchGbn === 1 ? 'date' : 'month'));
const gnrlMngTeamOptions = ref([
  { codeId: '', codeName: t('MSG_TXT_ALL') },
  { codeId: 'A', codeName: `A${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'B', codeName: `B${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'C', codeName: `C${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'D', codeName: `D${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'E', codeName: `E${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'F', codeName: `F${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'G', codeName: `G${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'H', codeName: `H${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
  { codeId: 'P', codeName: `P${t('MSG_TXT_MANAGEMENT_DEPARTMENT')}` },
]);
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/contract/risk-audits/irregular-sales-actions/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: 'monitorContractRiskList',
    timePostfix: true,
    exportData: response.data,
  });
}
async function onClickSearchPartnerId() {
  const { result, payload } = await modal({
    component: 'ZwogcPartnerListP',
  });

  if (result) {
    searchParams.value.dangOjPrtnrNo = payload.prtnrNo;
  }
}

async function fetchData() {
  if (searchParams.value.srchGbn === 1) {
    cachedParams = { ...cachedParams, ...pageInfo.value };
  } else {
    const dangOcStrtMonth = cachedParams.dangOcStrtdt;
    const dangOcEndMonth = cachedParams.dangOcEnddt;
    const { dangOcStrtdt, dangOcEnddt, ...newCachedParams } = cachedParams;

    cachedParams = { dangOcStrtMonth, dangOcEndMonth, ...newCachedParams, ...pageInfo.value };
  }
  const res = await dataService.get('sms/wells/contract/risk-audits/irregular-sales-actions/paging', { params: cachedParams });
  const { list: details, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  if (pageInfo.value.pageIndex === 1) {
    dataSource.setRows(details);
  } else {
    dataSource.addRows(details);
  }
  dataSource.checkRowStates(true);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length > 0) {
    const dangChkIds = deletedRows.map(({ dangChkId }) => dangChkId);
    await dataService.delete('sms/wells/contract/risk-audits/irregular-sales-actions', { params: { dangChkIds } });
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dangChkId' },
    { fieldName: 'wellsOjPstnRankNm' },
    { fieldName: 'dangMngtPntnrOgNm' },
    { fieldName: 'dangMngtPntnrOgCd' },
    { fieldName: 'dangMngtPntnrNm' },
    { fieldName: 'dangMngtPrtnrNo' },
    { fieldName: 'dangOjPrtnrNm' },
    { fieldName: 'dangOjPrtnrNo' },
    { fieldName: 'dangOjPrtnrPstnDvNm' },
    { fieldName: 'dangOcStrtmm' },
    { fieldName: 'dangArbitOgNm' },
    { fieldName: 'dangChkNm' },
    { fieldName: 'dangArbitCd' },
    { fieldName: 'dangUncvrCt' },
    { fieldName: 'dangArbitLvyPc' },
    { fieldName: 'dangArbitLvyPcSum' },
    { fieldName: 'fnlMdfcUsrId' },
    { fieldName: 'fstRgstDtm' },
  ];

  const columns = [
    { fieldName: 'wellsOjPstnRankNm', header: t('MSG_TXT_DIV'), width: '129', styleName: 'text-left' },
    { fieldName: 'dangMngtPntnrOgNm', header: t('MSG_TXT_BLG_NM'), width: '129', styleName: 'text-left' },
    { fieldName: 'dangMngtPntnrOgCd', header: t('MSG_TXT_AFL_CD'), width: '129', styleName: 'text-left' },
    { fieldName: 'dangMngtPntnrNm', header: t('MSG_TXT_EMPL_NM'), width: '129', styleName: 'text-left' },
    { fieldName: 'dangMngtPrtnrNo', header: t('MSG_TXT_EPNO'), width: '129', styleName: 'text-left' },
    { fieldName: 'dangOjPrtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '129', styleName: 'text-left' },
    { fieldName: 'dangOjPrtnrNo', header: t('MSG_TXT_EPNO'), width: '129' },
    { fieldName: 'dangOjPrtnrPstnDvNm', header: t('MSG_TXT_CRLV'), width: '129', styleName: 'text-left' },
    { fieldName: 'dangOcStrtmm', header: t('MSG_TXT_YEAR_OCCURNCE'), width: '129', styleName: 'text-left' },
    { fieldName: 'dangArbitOgNm', header: t('MSG_TXT_ACTN_DPT'), width: '306', styleName: 'text-center' },
    { fieldName: 'dangChkNm', header: t('MSG_TXT_CHRGS'), width: '306', styleName: 'text-left' },
    { fieldName: 'dangArbitCd', header: t('MSG_TXT_ACTN_ITM'), width: '306', styleName: 'text-left' },
    { fieldName: 'dangUncvrCt', header: t('MSG_TXT_DUE_TRGT_NO'), width: '129', styleName: 'text-left' },
    { fieldName: 'dangArbitLvyPc', header: t('MSG_TXT_ACTN_TM_PNLTY_PNT'), width: '190', styleName: 'text-center' },
    { fieldName: 'dangArbitLvyPcSum', header: t('MSG_TXT_TTL_PT'), width: '129', styleName: 'text-center' },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_FST_RGST_USR'), width: '146', styleName: 'text-center' },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FST_RGST_DT'), width: '165', styleName: 'text-left', datetimeFormat: 'date' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'wellsOjPstnRankNm', 'dangMngtPntnrOgNm', 'dangMngtPntnrOgCd', 'dangMngtPntnrNm', 'dangMngtPrtnrNo',
    {
      header: t('MSG_TXT_EMP_NO'), // colspan title
      direction: 'horizontal', // merge type
      items: ['dangOjPrtnrNm', 'dangOjPrtnrNo', 'dangOjPrtnrPstnDvNm'],
    },
    {
      header: t('MSG_TXT_PNLTY'), // colspan title
      direction: 'horizontal', // merge type
      items: ['dangOcStrtmm', 'dangArbitOgNm', 'dangChkNm', 'dangArbitCd', 'dangUncvrCt', 'dangArbitLvyPc', 'dangArbitLvyPcSum'],
    },
    'fnlMdfcUsrId', 'fstRgstDtm',
  ]);

  view.onScrollToBottom = (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      fetchData();
    }
  };
});
</script>
<style scoped>
</style>
