<template>
  <kw-page>
    <kw-tabs
      model-value="4"
    >
      <kw-tab
        name="1"
        :label="t('MSG_TXT_APRV_CRTE_MGT')"
      />
      <kw-tab
        name="2"
        :label="t('MSG_TXT_EXCP_HAND_MGT')"
      />
      <kw-tab
        name="3"
        :label="t('MSG_TXT_BIZ_SUBS_RES_MGT')"
      />
      <kw-tab
        name="4"
        :label="t('MSG_TXT_USR_SLS_RES_MGT')"
      />
      <kw-tab
        name="5"
        :label="t('MSG_TXT_BLKLST_MGT')"
      />
    </kw-tabs>
    <kw-tab-panels
      model-value="4"
    >
      <kw-tab-panel name="4">
        <kw-search
          :modified-targets="['userSellLimitGrid']"
          @search="onClickSearch()"
        >
          <kw-search-row>
            <kw-search-item :label="t('MSG_TXT_ACEPT_PERIOD')">
              <kw-date-range-picker
                rules="date_range_months:1"
              />
            </kw-search-item>
            <kw-search-item
              :label="t('MSG_TXT_SLS_CHNL_ORG_USRS')"
              :colspan="2"
            >
              <kw-select
                :options="['전체', 'B', 'C', 'D']"
              />
              <kw-select
                :options="['전체', 'B', 'C', 'D']"
              />
              <kw-input />
              <kw-input />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-search-item :label="t('MSG_TXT_PRDT_NM')">
              <kw-input
                icon="search"
                clearable
              />
            </kw-search-item>
            <kw-search-item :label="t('MSG_TXT_SEL_TYPE')">
              <kw-select
                :options="['전체', 'B', 'C', 'D']"
              />
            </kw-search-item>
            <kw-search-item :label="t('MSG_TXT_SLS_RSTR')">
              <kw-select
                :options="['전체', 'B', 'C', 'D']"
              />
            </kw-search-item>
          </kw-search-row>
        </kw-search>
      </kw-tab-panel>
    </kw-tab-panels>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info total-count="7" />
        </template>
        <kw-btn
          grid-action
          :label="t('MSG_BTN_DEL')"
          @click="onClickDelete"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          grid-action
          :label="t('MSG_BTN_ROW_ADD')"
          @click="onClickRowAdd"
        />
        <kw-btn
          grid-action
          :label="t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="pageInfo.totalCount === 0"
          :label="t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="userSellLimitGrid"
        :visible-rows="11"
        @init="initGrid"
      />

      <kw-action-bottom>
        <kw-btn
          :label="t('MSG_BTN_MOD')"
          grid-action
        />
        <kw-btn
          :label="t('MSG_BTN_DEL')"
          grid-action
        />
      </kw-action-bottom>
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, gridUtil, useGlobal, useMeta } from 'kw-lib';

const grdMainRef = ref(getComponentType('KwGrid'));
const { notify } = useGlobal();
const { getConfig } = useMeta();

const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

function fetchData() {
  const view = grdMainRef.value.getView();
  // TODO integrate Get api call.
  view.getDataSource().setRows([
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
  ]);
  pageInfo.value.totalCount = 11;
}

function onClickSearch() {
  fetchData();
}

function onClickExcelDownload() {
  // TODO integrate excel download api
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length > 0) {
    // TODO integrate delete api
  }
}

function onClickRowAdd() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {});
  view.editOptions.editable = true;
  view.onCellEditable = (grid, { itemIndex }) => {
    if (itemIndex !== 0) return false;
  };
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!gridUtil.validate(view, {})) { return; }
  notify('Data saved');
  const changedRows = gridUtil.getChangedRowValues(view);
  notify(changedRows);
  // TODO integrate save api
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
    { fieldName: 'col15' },
    { fieldName: 'col16' },
    { fieldName: 'col17' },
    { fieldName: 'col18' },
    { fieldName: 'col19' },
    { fieldName: 'col20' },
    { fieldName: 'col21' },
    { fieldName: 'col22' },
    { fieldName: 'col23' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_SLS_CAT'), width: '142' },
    { fieldName: 'col2', header: t('MSG_TXT_CHNL'), width: '142' },
    { fieldName: 'col3', header: t('MSG_TXT_OG'), width: '126', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_USER'), width: '126', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_INDI_CORP'), width: '142' },
    { fieldName: 'col6', header: t('MSG_TXT_PSTL_CD1'), width: '180', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_PSTL_CD1'), width: '180', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_PRDT_CODE'), width: '180', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_PRDT_CATE'), width: '142' },
    { fieldName: 'col10', header: t('MSG_TXT_PRDT_TYPE'), width: '142' },
    { fieldName: 'col11', header: t('MSG_TXT_PD_NM'), width: '220' },
    { fieldName: 'col12', header: t('MSG_TXT_CYCL'), width: '131' },
    { fieldName: 'col13', header: t('MSG_TXT_SEL_TYPE'), width: '142' },
    { fieldName: 'col14', header: t('MSG_TXT_SLS_RSTR'), width: '142' },
    { fieldName: 'col15', header: t('MSG_TXT_STRT_DT'), width: '196', styleName: 'text-right' },
    { fieldName: 'col16', header: t('MSG_TXT_END_DT'), width: '196', styleName: 'text-right' },
    { fieldName: 'col17', header: `${t('MSG_TXT_NOTE')}1`, width: '220' },
    { fieldName: 'col18', header: `${t('MSG_TXT_NOTE')}2`, width: '220' },
    { fieldName: 'col19', header: `${t('MSG_TXT_NOTE')}3`, width: '220' },
    { fieldName: 'col20', header: t('MSG_TXT_RGST_DT'), width: '196', styleName: 'text-right' },
    { fieldName: 'col21', header: t('MSG_TXT_FST_RGST_USR'), width: '131' },
    { fieldName: 'col22', header: t('MSG_TXT_EDIT_DTM'), width: '196', styleName: 'text-right' },
    { fieldName: 'col23', header: t('MSG_TXT_MDFC_USR'), width: '131' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
}
</script>
