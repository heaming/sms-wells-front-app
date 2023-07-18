<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcTopPlannerMgtM - 수석플래너 신청관리
3. 작성자 : 김동석
4. 작성일 : 2023-07-06
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수석플래너 신청관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.mngtYm"
            :label="$t('MSG_TXT_MGT_YNM')"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_OG_LEVL')">
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevlDvCd1"
            v-model:og-levl-dv-cd2="searchParams.ogLevlDvCd2"
            v-model:og-levl-dv-cd3="searchParams.ogLevlDvCd3"
            :og-tp-cd="searchParams.ogTpCd"
            :last-og-id="searchParams.ogId"
            :base-ym="searchParams.baseYm"
            :start-level="1"
            :end-level="3"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <zwog-partner-search v-model:prtnr-no="searchParams.prtnrNo" />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_M_OG_INF')"
        >
          <kw-field
            v-model="searchParams.mOgYn"
            v-bind="checkItem"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
              />
            </template>
          </kw-field>
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
          v-permission:delete
          grid-action
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_DEL')"
          @click="onClickRemove"
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
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_PLAR_REG')"
          secondary
          dense
          @click="onClickSave"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useMeta, useDataService, getComponentType, defineGrid, gridUtil, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import ZwogPartnerSearch from '~sms-common/organization/components/ZwogPartnerSearch.vue';
import { SMS_WELLS_URI } from '~sms-wells/organization/constants/ogConst';

const { getConfig } = useMeta();
const dataService = useDataService();
const { modal, notify } = useGlobal();
const { currentRoute } = useRouter();
const { getters } = useStore();
const userInfo = getters['meta/getUserInfo'];
const { ogTpCd } = userInfo;
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const { t } = useI18n();
const codes = await codeUtil.getMultiCodes('EGER_WRK_STAT_CD', 'OG_TP_CD');
const grdMainRef = ref(getComponentType('KwGrid'));
const now = dayjs().format('YYYYMM');
const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'),
  mngtYm: now,
  mOgYn: 'N',
  ogTpCd,
  ogLevlDvCd1: undefined,
  ogLevlDvCd2: undefined,
  ogLevlDvCd3: undefined,
  ogId: undefined,
  prtnrNo: undefined,
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
async function fetchData() {
  const res = await dataService.get(`${SMS_WELLS_URI}/partner/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: planners, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(planners.map((v) => ({ ...v, mngtYm: searchParams.value.mngtYm, ogTpCd })));
  view.resetCurrent();

  if (searchParams.value.mOgYn === 'Y') {
    view.columnByName('col21').visible = true;
    view.columnByName('col22').visible = true;
    view.columnByName('col23').visible = true;
    view.columnByName('col24').visible = true;
    view.columnByName('col25').visible = true;
    view.columnByName('col26').visible = true;
  } else {
    view.columnByName('col21').visible = false;
    view.columnByName('col22').visible = false;
    view.columnByName('col23').visible = false;
    view.columnByName('col24').visible = false;
    view.columnByName('col25').visible = false;
    view.columnByName('col26').visible = false;
  }

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 조회
async function onClickSearch() {
  grdMainRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 삭제
async function onClickRemove() {
  const view = grdMainRef.value.getView();
  // if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRows.length === 0) return;

  await dataService.delete(`${SMS_WELLS_URI}/partner`, deletedRows);
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${SMS_WELLS_URI}/partner/excel-download`, { params: { ...searchParams.value } });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 자격생성
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.validate(view)) { return; }
  const changedRows = gridUtil.getChangedRowValues(view);

  await dataService.put(`${SMS_WELLS_URI}/partner`, changedRows);
  await notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '120', styleName: 'text-center' },
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_BUSINESS_DIVISION'), width: '120', styleName: 'text-center' },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '120', styleName: 'text-center' },
    { fieldName: 'mpiPrtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '120', styleName: 'text-center' },
    { fieldName: 'qlfDvCd', header: t('MSG_TXT_THM_QLF'), width: '100', styleName: 'text-center' },
    { fieldName: 'detail', header: t('MSG_BTN_PLAR_MGT'), width: '106', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_BTN_PLAR_MGT') },
    { fieldName: 'pbPrtnrKnm', header: t('MSG_TXT_ENGM_FNM'), width: '150', styleName: 'text-center' },
    { fieldName: 'rcmdrPrtnrNo', header: t('MSG_TXT_ENGM_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'cntrDt', header: t('MSG_TXT_BIZ_RGST_MM'), width: '150', styleName: 'text-center' },
    { fieldName: 'fnlCltnDt', header: t('MSG_TXT_FNL_CLTN_MM'), width: '120', styleName: 'text-center' },
    { fieldName: 'rcntrDt', header: t('MSG_TXT_REREG_MN'), width: '120', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_SRTUP_CPC_MM'), width: '120', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_JBF_MMS2_ACU_PERF'), width: '180', styleName: 'text-right' },
    { fieldName: 'col13', header: t('MSG_TXT_THM_PERF'), width: '120', styleName: 'text-right' },
    { fieldName: 'col14', header: t('MSG_TXT_M_OG_CVT_PERF'), width: '150', styleName: 'text-right' },
    { fieldName: 'col15', header: t('MSG_TXT_MNGT_PD'), width: '120', styleName: 'text-right' },
    { fieldName: 'col16', header: t('MSG_TXT_ACU_PERF'), width: '120', styleName: 'text-right' },
    { fieldName: 'col17', header: t('MSG_TXT_TOPMR_UPGR_MM'), width: '120', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_DMTN_DAY'), width: '120', styleName: 'text-center' },
    { fieldName: 'col19', header: t('MSG_TXT_DMTN_AFT_MNGT_PD'), width: '150', styleName: 'text-right' },
    { fieldName: 'col20', header: t('MSG_TXT_DMTN_AFT_ACU_PERF'), width: '150', styleName: 'text-right' },
    { fieldName: 'col21', header: t('MSG_TXT_BIZ_RGST_MM'), width: '120', styleName: 'text-center' },
    { fieldName: 'col22', header: t('MSG_TXT_FNL_CLTN_MM'), width: '120', styleName: 'text-center' },
    { fieldName: 'col23', header: t('MSG_TXT_REREG_MN'), width: '120', styleName: 'text-center' },
    { fieldName: 'col24', header: t('MSG_TXT_CLTN_MM'), width: '120', styleName: 'text-center' },
    { fieldName: 'col25', header: t('MSG_TXT_CLTN_MM_QLF'), width: '120', styleName: 'text-center' },
    { fieldName: 'col26', header: t('MSG_TXT_ACU_ACKMT_CT'), width: '120', styleName: 'text-right' },
    { fieldName: 'mngtYm', visible: false },
    { fieldName: 'ogTpCd', visible: false },
  ];
  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);
  view.setFixedOptions({ colCount: 7 });

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'dgr1LevlOgNm',
    'dgr2LevlOgNm',
    'ogCd',
    'mpiPrtnrKnm',
    'prtnrNo',
    'qlfDvCd',
    'detail',
    {
      header: t('MSG_TXT_P_ORG'),
      direction: 'horizontal',
      items: ['pbPrtnrKnm', 'rcmdrPrtnrNo', 'cntrDt', 'fnlCltnDt', 'rcntrDt', 'col11', 'col12',
        'col13', 'col14', 'col15', 'col16', 'col17', 'col18', 'col19', 'col20'],
    },
    {
      header: t('MSG_TIT_M_ORG'),
      direction: 'horizontal',
      items: ['col21', 'col22', 'col23', 'col24', 'col25', 'col26'],
    },

  ]);

  view.columnByName('col21').visible = false;
  view.columnByName('col22').visible = false;
  view.columnByName('col23').visible = false;
  view.columnByName('col24').visible = false;
  view.columnByName('col25').visible = false;
  view.columnByName('col26').visible = false;

  // 그리드 클릭 이벤트
  view.onCellItemClicked = async (g, { column, dataRow }) => {
    const { mngtYm } = gridUtil.getRowValue(g, dataRow);

    // 상세보기
    // const baseYm = searchBaseYm;
    if (column === 'detail') {
      const { result: isChanged } = await modal({
        component: 'WwogcTopPlannerMgtP',
        componentProps: { ogTpCd, mngtYm },
      });

      if (isChanged) {
        notify(t('MSG_ALT_SAVE_DATA'));
        await onClickSearch();
      }
    }
  };
});

</script>

<style scoped>
</style>
