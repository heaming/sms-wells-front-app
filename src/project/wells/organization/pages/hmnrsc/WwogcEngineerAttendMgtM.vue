<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcEngineerAttendanceMgtM - 엔지니어 출근 관리
3. 작성자 : 김동석
4. 작성일 : 2023-05-10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 엔지니어 출근 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_OG_LEVL')">
          <zwog-level-select
            v-model:og-levl-dv-cd2="searchParams.ogLevlDvCd2"
            v-model:og-levl-dv-cd3="searchParams.ogLevlDvCd3"
            :og-tp-cd="searchParams.ogTpCd"
            :start-level="2"
            :end-level="3"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_BASE_D')">
          <kw-date-picker
            v-model="searchParams.baseDt"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="pageInfo.totalCount" />
        </template>
        <kw-btn
          v-permission:update
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useMeta, useDataService, getComponentType, gridUtil, useGlobal, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import { SMS_WELLS_URI } from '~sms-wells/organization/constants/ogConst';

const { getConfig } = useMeta();
const dataService = useDataService();
const { modal, notify } = useGlobal();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const { t } = useI18n();
const codes = await codeUtil.getMultiCodes('EGER_WRK_STAT_CD', 'OG_TP_CD');
const grdMainRef = ref(getComponentType('KwGrid'));
const now = dayjs().format('YYYYMMDD');
const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'),
  baseDt: now,
  ogTpCd: 'W06',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),

});

async function fetchData() {
  return await dataService.get(`${SMS_WELLS_URI}/partner-engineer/attend/paging`, { params: { ...searchParams.value, ...pageInfo.value } });
}

async function onClickSearch() {
  pageInfo.value.pageIndex = '1';
  const res = await fetchData();
  const { list, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${SMS_WELLS_URI}/partner-engineer/attend/excel-download`, { params: { ...searchParams.value } });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 행 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  const { prtnrNo } = changedRows[0];

  await dataService.post(`${SMS_WELLS_URI}/partner-engineer/${prtnrNo}`, changedRows);
  await notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

// function editableCallback() {
//   if (searchParams.value.baseDt < now) {
//     return { editable: false };
//   }
//   return { editable: true };
// }

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_CODE'), width: '92', styleName: 'text-center', editable: false },
    { fieldName: 'ogNm', header: t('MSG_TXT_CNT_NM'), width: '166', styleName: 'text-center', editable: false },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '92', styleName: 'text-center', editable: false },
    { fieldName: 'rolDvNm', header: t('MSG_TXT_ROLE_1'), width: '106', styleName: 'text-center', editable: false },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '92', styleName: 'text-center', editable: false },
    { fieldName: 'wkGrpNm', header: t('MSG_TXT_WK_GRP'), width: '106', styleName: 'text-center', editable: false },
    { fieldName: 'bizAgntYn', header: t('MSG_TXT_BIZ_AGNT'), width: '106', styleName: 'text-center', editable: false },
    { fieldName: 'wrkDt', header: t('MSG_TXT_WRK_DT'), width: '130', styleName: 'text-center', editable: false, datetimeFormat: 'date' },
    { fieldName: 'wrkNm', header: t('MSG_TXT_WRK_DOW'), width: '106', styleName: 'text-center', editable: false },
    { fieldName: 'egerWrkStatCd', header: t('MSG_TXT_WRK_STAT'), options: codes.EGER_WRK_STAT_CD, editor: { type: 'dropdown' } },
    { fieldName: 'rmkCn', header: t('MSG_TXT_RMK_ARTC'), width: '146', styleName: 'text-center', editable: true, editor: { type: 'text', maxLength: 3500 } },
    { fieldName: 'dnlStrtdt', header: t('MSG_TXT_STRT_DT'), width: '178', styleName: 'text-center', editor: { type: 'btdate' }, editable: true, datetimeFormat: 'date' },
    { fieldName: 'dnlEnddt', header: t('MSG_TXT_END_DT'), width: '178', styleName: 'text-center', editor: { type: 'btdate' }, editable: true, datetimeFormat: 'date' },
    { fieldName: 'bizAgntPrtnrNo', header: t('MSG_TXT_EPNO'), width: '128', styleName: 'text-left, rg-button-icon--search', editor: { type: 'text' }, editable: true, button: 'action' },
    { fieldName: 'agntPrtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'pcpPrtnrNo', header: t('MSG_TXT_EPNO'), width: '120', styleName: 'text-center', editable: false },
    { fieldName: 'pcpPrtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'procsDtm', header: t('MSG_TIT_PROC_DTM'), width: '182', styleName: 'text-center', editable: false, datetimeFormat: 'datetime' },

  ];

  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);
  view.editOptions.editable = true;
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([

    {
      header: t('MSG_TXT_BLG'),
      direction: 'horizontal',
      items: ['ogCd', 'ogNm'],
    },
    {
      header: t('MSG_TXT_EGER'),
      direction: 'horizontal',
      items: ['prtnrNo', 'rolDvNm', 'prtnrKnm', 'wkGrpNm'],
    },
    'bizAgntYn',
    'wrkDt',
    'wrkNm',
    'egerWrkStatCd',
    'rmkCn',
    {
      header: t('MSG_TXT_VCN_USE_PTRM'),
      direction: 'horizontal',
      items: ['dnlStrtdt', 'dnlEnddt'],
    },
    {
      header: t('MSG_TXT_BIZ_AGNT_PRTNR'),
      direction: 'horizontal',
      items: ['bizAgntPrtnrNo', 'agntPrtnrKnm'],
    },
    {
      header: t('MSG_TXT_PCP'),
      direction: 'horizontal',
      items: ['pcpPrtnrNo', 'pcpPrtnrKnm'],
    },
    'procsDtm',
  ]);

  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      const res = await fetchData();
      view.getDataSource().addRows(res.data.list);
    }
  };
  view.onCellButtonClicked = async (grid, { dataRow, column }) => {
    if (column === 'bizAgntPrtnrNo') {
      const { bizAgntPrtnrNo } = gridUtil.getRowValue(grid, dataRow);
      const { result, payload } = await modal({
        component: 'ZwogzPartnerListP',
        componentProps: { prtnrNo: bizAgntPrtnrNo, ogTpCd: 'W06' },
      });
      if (result) {
        data.setValue(dataRow, 'bizAgntPrtnrNo', payload.prtnrNo);
        data.setValue(dataRow, 'agntPrtnrKnm', payload.prtnrKnm);
      }
    }
  };
});
</script>

<style scoped>
</style>
