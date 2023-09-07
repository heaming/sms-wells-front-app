<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTE
2. 프로그램 ID : WwcteUserSellLimitMgtM - 사용자 판매 제한 관리
3. 작성자 : gs.anil.rawat / JSY
4. 작성일 : 2023.01.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 사용자 판매 제한 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :modified-targets="['userSellLimitGrid']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_ACEPT_PERIOD')">
          <kw-date-range-picker
            v-model:from="searchParams.startDate"
            v-model:to="searchParams.endDate"
            type="date"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_SLS_CHNL_ORG_USRS')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.sell"
            first-option="all"
            :options="codes.SELL_BASE_TP_CD.map((v) => ({ codeId: v.codeId, codeName: `${v.codeId}-${v.codeName}` }))"
          />
          <kw-select
            v-model="searchParams.channel"
            first-option="all"
            :options="codes.PRTNR_CHNL_DV_ACD"
          />
          <kw-input
            v-model="searchParams.deptCd"
            maxlength="100"
          />
          <kw-input
            v-model="searchParams.user"
            maxlength="100"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_PRDT_CODE')">
          <kw-input
            v-model="searchParams.productCd"
            clearable
            icon="search"
            dense
            maxlength="100"
            @click-icon="onClickSelectPdCd()"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_SEL_TYPE')">
          <kw-select
            v-model="searchParams.sellType"
            :options="sellTpCdGrids"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_SLS_RSTR')">
          <kw-select
            v-model="searchParams.sellLimit"
            :options="salesTypeOptions"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
        </template>
        <kw-btn
          v-permission:delete
          :label="t('MSG_BTN_DEL')"
          grid-action
          @click="onClickDelete"
        />
        <kw-separator
          vertical
          inset
          spaced
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
        ref="gridMainRef"
        name="userSellLimitGrid"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, gridUtil, useGlobal, codeUtil, useDataService } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import pdConst from '~sms-common/product/constants/pdConst';

const gridMainRef = ref(getComponentType('KwGrid'));
const { notify, modal } = useGlobal();
const { currentRoute } = useRouter();
const { t } = useI18n();

const now = dayjs();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'PRTNR_CHNL_DV_ACD',
  'COPN_DV_CD',
  'SELL_BASE_TP_CD',
);

const searchParams = ref({
  startDate: now.format('YYYYMM01'),
  endDate: now.format('YYYYMMDD'),
  sell: '',
  channel: '',
  deptCd: '',
  user: '',
  productCd: '',
  sellType: '',
  sellLimit: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
});

let cachedParams;

const sellTpCdGrids = ref([
  { codeId: 'A', codeName: t('MSG_TXT_ALL') },
  { codeId: '1', codeName: t('MSG_TXT_SNGL_PMNT') },
  { codeId: '2', codeName: t('MSG_TXT_RENTAL') },
  { codeId: '5', codeName: t('MSG_TXT_HOME_CARE') },
  { codeId: '6', codeName: t('MSG_TXT_REG_DLVR') },
]);

const salesTypeOptions = ref([
  { codeId: '2', codeName: `2-${t('MSG_TXT_LIMIT')}` },
  { codeId: '3', codeName: `3-${t('MSG_TXT_EXP_GRNTD')}` },
  { codeId: '4', codeName: `4-${t('MSG_TXT_NEW_RGLTD')}` },
]);

async function fetchData() {
  const res = await dataService.get('sms/wells/contract/sales-limits/users', { params: cachedParams });

  const view = gridMainRef.value.getView();
  const dataSource = view.getDataSource();
  dataSource.setRows(res.data);
  pageInfo.value.totalCount = view.getItemCount();

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = gridMainRef.value.getView();

  const res = await dataService.get('sms/wells/contract/sales-limits/users/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickDelete() {
  const view = gridMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length > 0) {
    const sellBaseIds = deletedRows.map(({ sellBaseId }) => sellBaseId);
    await dataService.delete('sms/wells/contract/sales-limits/users', { params: { sellBaseIds } });
    notify(t('MSG_ALT_DELETED'));
    await onClickSearch();
  }
}

async function onClickRowAdd() {
  const view = gridMainRef.value.getView();
  const row = view.getCurrent().dataRow < 0 ? '0' : view.getCurrent().dataRow;
  await gridUtil.insertRowAndFocus(view, row, {});
}

async function onClickSave() {
  const view = gridMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  for (let i = 0; i < gridUtil.getChangedRowValues(view).length; i += 1) {
    if (!isEmpty(gridUtil.getChangedRowValues(view)[i].dangOjOgId)) {
      notify(t('MSG_ALT_EXIST_BEAN_ID'));
      return;
    }
    if (gridUtil.getChangedRowValues(view)[i].vlStrtDtm > gridUtil.getChangedRowValues(view)[i].vlEndDtm) {
      notify(t('MSG_ALT_CHK_DT_RLT'));
      return;
    }
  }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('sms/wells/contract/sales-limits/users', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

// 상품명 검색아이콘 클릭
async function onClickSelectPdCd() {
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.productCd,
    selectType: '',
  };

  const returnPdInfo = await modal({
    component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
    componentProps: searchPopupParams,
  });

  if (returnPdInfo.result) {
    searchParams.value.productCd = returnPdInfo.payload?.[0].pdCd;
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'sellBaseId' },
    { fieldName: 'sellBaseTpCd' },
    { fieldName: 'sellBaseChnl' },
    { fieldName: 'deptCd' },
    { fieldName: 'sellBaseUsr' },
    { fieldName: 'copnDvCd' },
    { fieldName: 'zip' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdMclsfNm' },
    { fieldName: 'pdLclsfNm' },
    { fieldName: 'pdNm' },
    { fieldName: 'sellBasePrd' },
    { fieldName: 'sellBaseSellTp' },
    { fieldName: 'sellPrmitDvCd' },
    { fieldName: 'vlStrtDtm' },
    { fieldName: 'vlEndDtm' },
    { fieldName: 'sellBaseApyCn' },
    { fieldName: 'fstRgstDtm' },
    { fieldName: 'fstRgstUsrId' },
    { fieldName: 'fnlMdfcDtm' },
    { fieldName: 'fnlMdfcUsrId' },
  ];

  const columns = [
    { fieldName: 'sellBaseId', visible: false },
    { fieldName: 'sellBaseTpCd',
      header: t('MSG_TXT_SLS_CAT'),
      width: '142',
      styleName: 'text-center',
      options: codes.SELL_BASE_TP_CD.map((v) => ({ codeId: v.codeId, codeName: `${v.codeId}-${v.codeName}` })),
      rules: 'required',
      editor: { type: 'list' } },
    { fieldName: 'sellBaseChnl',
      header: t('MSG_TXT_CHNL'),
      width: '142',
      styleName: 'text-center',
      options: codes.PRTNR_CHNL_DV_ACD,
      firstOption: 'all',
      firstOptionValue: '',
      placeHolder: '전체',
      editor: { type: 'list' },
    },
    { fieldName: 'deptCd', header: t('MSG_TXT_OG'), width: '126', styleName: 'text-center', placeHolder: 'ALL', editor: { maxLength: 100 } },
    { fieldName: 'sellBaseUsr', header: t('MSG_TXT_USR'), width: '126', styleName: 'text-center', placeHolder: 'ALL', editor: { maxLength: 100 } },
    { fieldName: 'copnDvCd',
      header: t('MSG_TXT_INDI_CORP'),
      width: '142',
      styleName: 'text-center',
      rules: 'required',
      options: [
        { codeId: 'A', codeName: `A-${t('MSG_TXT_ALL')}` },
        ...codes.COPN_DV_CD,
      ],
      editor: { type: 'list' } },
    { fieldName: 'zip', header: t('MSG_TXT_ZIP'), width: '180', styleName: 'text-center', editor: { mask: { editMask: '999999' } } },
    { fieldName: 'pdCd',
      header: t('MSG_TXT_PRDT_CODE'),
      width: '180',
      styleName: 'text-center rg-button-icon--search',
      button: 'action',
      editor: { maxLength: 10 },
      buttonVisibleCallback(grid, index) {
        return grid.getCurrent().dataRow === index.dataRow;
      } },
    { fieldName: 'pdMclsfNm', header: t('MSG_TXT_PRDT_CATE'), width: '142', styleName: 'text-center', editable: false },
    { fieldName: 'pdLclsfNm', header: t('MSG_TXT_PRDT_TYPE'), width: '142', styleName: 'text-center', editable: false },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '220', editable: false },
    { fieldName: 'sellBasePrd', header: t('MSG_TXT_CYCL'), width: '131', styleName: 'text-center', placeHolder: 'ALL', editor: { maxLength: 100 } },
    { fieldName: 'sellBaseSellTp',
      header: t('MSG_TXT_SEL_TYPE'),
      width: '142',
      styleName: 'text-center',
      options: sellTpCdGrids.value,
      editor: { type: 'list' } },
    { fieldName: 'sellPrmitDvCd',
      header: t('MSG_TXT_SLS_RSTR'),
      width: '142',
      styleName: 'text-center',
      options: salesTypeOptions.value,
      editor: { type: 'list' } },
    { fieldName: 'vlStrtDtm',
      header: t('MSG_TXT_STRT_DT'),
      width: '196',
      styleName: 'text-center',
      datetimeFormat: 'date',
      rules: 'required',
      editor: {
        type: 'btdate',
      },
    },
    { fieldName: 'vlEndDtm',
      header: t('MSG_TXT_END_DT'),
      width: '196',
      styleName: 'text-center',
      datetimeFormat: 'date',
      rules: 'required',
      editor: {
        type: 'btdate',
      },
    },
    { fieldName: 'sellBaseApyCn', header: t('MSG_TXT_NOTE'), width: '220', editor: { maxLength: 2000 } },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT'), datetimeFormat: 'date', width: '196', styleName: 'text-center', editable: false },
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR'), width: '131', styleName: 'text-center', editable: false },
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_MDFC_DT'), datetimeFormat: 'date', width: '196', styleName: 'text-center', editable: false },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_MDFC_USR'), width: '131', styleName: 'text-center', editable: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  view.editOptions.editable = true;
  view.setEditOptions({
    insertable: true,
    appendable: true,
  });

  view.onCellButtonClicked = async (g, { itemIndex }) => {
    const updateRow = view.getCurrent().dataRow;
    const searchPopupParams = {
      searchType: pdConst.PD_SEARCH_CODE,
      searchValue: g.getValues(itemIndex).pdCd,
      selectType: '',
    };

    const returnPdInfo = await modal({
      component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
      componentProps: searchPopupParams,
    });

    if (returnPdInfo.result) {
      const pdClsfNm = returnPdInfo.payload?.[0].pdClsfNm.split('>');
      data.setValue(itemIndex, 'pdCd', '');
      data.setValue(itemIndex, 'pdNm', '');
      data.setValue(itemIndex, 'pdMclsfNm', '');
      data.setValue(itemIndex, 'pdLclsfNm', '');
      data.setValue(updateRow, 'pdCd', returnPdInfo.payload?.[0].pdCd);
      data.setValue(updateRow, 'pdNm', returnPdInfo.payload?.[0].pdNm);
      data.setValue(updateRow, 'pdMclsfNm', !isEmpty(pdClsfNm[1]) ? pdClsfNm[1] : '');
      data.setValue(updateRow, 'pdLclsfNm', !isEmpty(pdClsfNm[2]) ? pdClsfNm[2] : '');
    } else {
      data.setValue(itemIndex, 'pdNm', '');
      data.setValue(itemIndex, 'pdMclsfNm', '');
      data.setValue(itemIndex, 'pdLclsfNm', '');
    }
  };
  view.onCellEdited = async (grid, itemIndex, dataRow, fieldIndex) => {
    const columnName = grid.getColumn(fieldIndex).fieldName;
    if (columnName === 'vlStrtDtm') {
      const { vlStrtDtm, vlEndDtm } = grid.getValues(itemIndex);
      if (vlStrtDtm > vlEndDtm
        && vlStrtDtm && vlEndDtm) {
        grid.commit();
        const updateDateRow = view.getCurrent().dataRow;
        data.setValue(updateDateRow, 'vlEndDtm', vlStrtDtm);
      }
    }
    if (columnName === 'vlEndDtm') {
      const { vlStrtDtm, vlEndDtm } = grid.getValues(itemIndex);
      if (vlStrtDtm > vlEndDtm
        && vlStrtDtm && vlEndDtm) {
        grid.commit();
        const updateDateRow = view.getCurrent().dataRow;
        data.setValue(updateDateRow, 'vlStrtDtm', vlEndDtm);
      }
    }
    if (columnName === 'pdCd') {
      const updateRow = view.getCurrent().dataRow;
      const searchPopupParams = {
        searchType: pdConst.PD_SEARCH_CODE,
        searchValue: grid.getValues(itemIndex).pdCd,
        selectType: '',
      };

      const returnPdInfo = await modal({
        component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
        componentProps: searchPopupParams,
      });

      if (returnPdInfo.result) {
        const pdClsfNm = returnPdInfo.payload?.[0].pdClsfNm.split('>');
        data.setValue(itemIndex, 'pdCd', '');
        data.setValue(itemIndex, 'pdNm', '');
        data.setValue(itemIndex, 'pdMclsfNm', '');
        data.setValue(itemIndex, 'pdLclsfNm', '');
        data.setValue(updateRow, 'pdCd', returnPdInfo.payload?.[0].pdCd);
        data.setValue(updateRow, 'pdNm', returnPdInfo.payload?.[0].pdNm);
        data.setValue(updateRow, 'pdMclsfNm', !isEmpty(pdClsfNm[1]) ? pdClsfNm[1] : '');
        data.setValue(updateRow, 'pdLclsfNm', !isEmpty(pdClsfNm[2]) ? pdClsfNm[2] : '');
      } else {
        data.setValue(itemIndex, 'pdNm', '');
        data.setValue(itemIndex, 'pdMclsfNm', '');
        data.setValue(itemIndex, 'pdLclsfNm', '');
      }
    }
  };
}
</script>
