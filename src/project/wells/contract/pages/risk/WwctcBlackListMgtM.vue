<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTC
2. 프로그램 ID : WwctcBlackListMgtM - 블랙리스트 관리
3. 작성자 : gs.bhavesh.n
4. 작성일 : 2023.01.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-블랙리스트 관리
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_CST_NO')">
          <kw-input
            v-model="searchParams.cntrCstNo"
            icon="search_24"
            maxlength="10"
            rules="numeric"
            :label="$t('MSG_TXT_CST_NO')"
            @click-icon="onClickSearchCst"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_CST_NM')">
          <kw-input
            v-model="searchParams.cstKnm"
            maxlength="50"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_ADD_PST_CD')">
          <kw-select
            v-model="searchParams.adrCl"
            class="w103"
            :options="codes.ADR_CL"
          />
          <kw-input
            v-model="searchParams.adr"
            :placeholder="$t('MSG_TXT_DEFAULT_PLACEHOLDER')"
            maxlength="200"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_MPNO')">
          <kw-input
            v-model:tel-no0="searchParams.cralLocaraTno"
            v-model:tel-no1="searchParams.mexnoEncr"
            v-model:tel-no2="searchParams.cralIdvTno"
            mask="telephone"
            :placeholder="$t('MSG_TXT_INP')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_PRTNR_EMP_NO')">
          <kw-input
            v-model="searchParams.prtnrInfo"
            icon="search"
            clearable
            :label="$t('MSG_TXT_PRTNR_EMP_NO')"
            maxlength="10"
            rules="numeric"
            @click-icon="onClickOpenPartnerListPopup"
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
          v-permission:delete
          grid-action
          :label="$t('MSG_BTN_DEL')"
          @click="onClickDelete"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:create
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <kw-btn
          v-permission:update
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />

        <kw-btn
          v-permission:download
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          icon="download_on"
          dense
          secondary
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
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
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import { codeUtil, defineGrid, getComponentType, stringUtil, gridUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { getConfig } = useMeta();
const dataService = useDataService();
const { notify, modal } = useGlobal();
const { t } = useI18n();
const { currentRoute } = useRouter();
const grdMainRef = ref(getComponentType('KwGrid'));
const searchParams = ref({
  cntrCstNo: '',
  cntrNo: '',
  cstKnm: '',
  adrCl: 1,
  adr: '',
  cralLocaraTno: '',
  mexnoEncr: '',
  cralIdvTno: '',
  prtnrInfo: '',
});
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'SELL_TP_CD',
);
codes.STATUS = [{ codeId: 'N', codeName: t('MSG_TXT_NOM') }, { codeId: 'Y', codeName: t('MSG_TXT_RSTRCT') }];
codes.ADR_CL = [{ codeId: 1, codeName: t('MSG_TXT_ADDR') }, { codeId: 2, codeName: t('MSG_TXT_ZIP') }];
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function onClickSearchCst() {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
  });
  if (result) {
    searchParams.value.cntrCstNo = payload.cstNo;
  }
}

// 파트너 조회 팝업
async function onClickOpenPartnerListPopup() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrInfo,
    },
  });
  if (result) {
    searchParams.value.prtnrInfo = payload.prtnrNo;
  }
}

let cachedParams;

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/contract/sales-limits/blacklists/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

function onClickAdd() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, { dtaDlYn: 'N' }, 'cntrNo');
}

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const res = await dataService.get('/sms/wells/contract/sales-limits/blacklists/paging', { params: cachedParams });

  const { list: blacklists, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(blacklists);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/contract/sales-limits/blacklists', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  const deleteKeys = deletedRows.map((row) => row.sellLmId);

  if (deleteKeys.length) {
    await dataService.delete('/sms/wells/contract/sales-limits/blacklists', { data: deleteKeys });

    notify(t('MSG_ALT_DELETED'));
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sellLmId' },
    { fieldName: 'dtaDlYn' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn', dataType: 'number' },
    { fieldName: 'sellLmRsonCn' },
    { fieldName: 'cntrCstNo' },
    { fieldName: 'cstKnm' },
    { fieldName: 'copnDvCd' },
    { fieldName: 'bryyMmdd' },
    { fieldName: 'bzrno' },
    { fieldName: 'cntrCralLocaraTno' },
    { fieldName: 'cntrMexnoEncr' },
    { fieldName: 'cntrCralIdvTno' },
    { fieldName: 'cntrMpno' },
    { fieldName: 'cntrLocaraTno' },
    { fieldName: 'cntrExnoEncr' },
    { fieldName: 'cntrIdvTno' },
    { fieldName: 'cntrTno' },
    { fieldName: 'cntrZip' },
    { fieldName: 'cntrAdr' },
    { fieldName: 'istllKnm' },
    { fieldName: 'istllCralLocaraTno' },
    { fieldName: 'istllMexnoEncr' },
    { fieldName: 'istllCralIdvTno' },
    { fieldName: 'istllMpno' },
    { fieldName: 'istllLocaraTno' },
    { fieldName: 'istllExnoEncr' },
    { fieldName: 'istllIdvTno' },
    { fieldName: 'istllTno' },
    { fieldName: 'istllZip' },
    { fieldName: 'istllAdr' },
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrCralLocaraTno' },
    { fieldName: 'prtnrMexnoEncr' },
    { fieldName: 'prtnrCralIdvTno' },
    { fieldName: 'prtnrMpno' },
    { fieldName: 'fstRgstDtm' },
    { fieldName: 'fstRgstUsrNm' },
    { fieldName: 'fnlMdfcDtm' },
    { fieldName: 'fnlMdfcUsrNm' },
  ];

  const columns = [
    { fieldName: 'dtaDlYn',
      header: t('MSG_TXT_STT'),
      width: 80,
      styleName: 'text-center',
      options: codes.STATUS,
      editable: true,
      editor: {
        type: 'list',
      },
    },
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_CONT_CLASS'),
      width: 100,
      styleName: 'text-center',
      options: codes.SELL_TP_CD,
      editor: {
        type: 'list',
      },
    },
    { fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_NO'),
      width: 150,
      rules: 'required',
      styleName: 'rg-button-icon--search',
      button: 'action',
      editable: true,
      editor: {
        maxLength: 12,
      },
    },
    { fieldName: 'cntrSn',
      header: t('MSG_TXT_CNTR_SN'),
      width: 90,
      styleName: 'text-right',
      rules: 'required',
      editable: true,
      editor: {
        type: 'number',
        maxLength: 5,
      },
    },
    { fieldName: 'sellLmRsonCn',
      header: t('MSG_TXT_REASON'),
      width: 250,
      editable: true,
      editor: {
        maxLength: 1000,
      },
    },
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: 120, styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: 100, styleName: 'text-center' },
    { fieldName: 'copnDvCd', visible: false },
    {
      fieldName: 'bryyMmdd',
      header: t('MSG_TXT_BRYY_MMDD_ENTRP_NO'),
      width: 140,
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { copnDvCd, bryyMmdd, bzrno } = grid.getValues(index.itemIndex);
        return copnDvCd === '1' ? stringUtil.getDateFormat(bryyMmdd) : bzrno;
      },
    },
    { fieldName: 'bzrno', visible: false },
    {
      fieldName: 'cntrMpno',
      header: t('MSG_TXT_MPNO'),
      width: 120,
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrCralLocaraTno, cntrMexnoEncr, cntrCralIdvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(cntrCralLocaraTno) && !isEmpty(cntrMexnoEncr) && !isEmpty(cntrCralIdvTno) ? `${cntrCralLocaraTno}-${cntrMexnoEncr}-${cntrCralIdvTno}` : '';
      },
    },
    {
      fieldName: 'cntrTno',
      header: t('MSG_TXT_TEL_NO'),
      width: 120,
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrLocaraTno, cntrExnoEncr, cntrIdvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(cntrLocaraTno) && !isEmpty(cntrExnoEncr) && !isEmpty(cntrIdvTno) ? `${cntrLocaraTno}-${cntrExnoEncr}-${cntrIdvTno}` : '';
      },
    },
    { fieldName: 'cntrZip', header: t('MSG_TXT_ZIP'), width: 120, styleName: 'text-center' },
    { fieldName: 'cntrAdr', header: t('MSG_TXT_ADDR'), width: 300 },
    { fieldName: 'istllKnm', header: t('MSG_TXT_CST_NM'), width: 100 },
    {
      fieldName: 'istllMpno',
      header: t('MSG_TXT_MPNO'),
      width: 120,
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { istllCralLocaraTno, istllMexnoEncr, istllCralIdvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(istllCralLocaraTno) && !isEmpty(istllMexnoEncr) && !isEmpty(istllCralIdvTno) ? `${istllCralLocaraTno}-${istllMexnoEncr}-${istllCralIdvTno}` : '';
      },
    },
    {
      fieldName: 'istllTno',
      header: t('MSG_TXT_TEL_NO'),
      width: 120,
      styleName: 'text-center',

      displayCallback(grid, index) {
        const { istllLocaraTno, istllExnoEncr, istllIdvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(istllLocaraTno) && !isEmpty(istllExnoEncr) && !isEmpty(istllIdvTno) ? `${istllLocaraTno}-${istllExnoEncr}-${istllIdvTno}` : '';
      },
    },
    { fieldName: 'istllZip', header: t('MSG_TXT_ZIP'), width: 100, styleName: 'text-center' },
    { fieldName: 'istllAdr', header: t('MSG_TXT_ADDR'), width: 300 },
    { fieldName: 'ogNm', header: t('MSG_TXT_SLR_BRCH'), width: 120 },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PTNR_NAME'), width: 100, styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NO'), width: 120, styleName: 'text-center' },
    {
      fieldName: 'prtnrMpno',
      header: t('MSG_TXT_MPNO'),
      width: 120,
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { prtnrCralLocaraTno, prtnrMexnoEncr, prtnrCralIdvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(prtnrCralLocaraTno) && !isEmpty(prtnrMexnoEncr) && !isEmpty(prtnrCralIdvTno) ? `${prtnrCralLocaraTno}-${prtnrMexnoEncr}-${prtnrCralIdvTno}` : '';
      },
    },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_IN_DTM'), width: 160, datetimeFormat: 'datetime' },
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_TYPER'), width: 100, styleName: 'text-center' },
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_MDFC_DTM'), width: 160, datetimeFormat: 'datetime' },
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TIT_MDFC_USR'), width: 100, styleName: 'text-center' },
  ];

  const layouts = [
    'dtaDlYn', 'sellTpCd', 'cntrNo', 'cntrSn', 'sellLmRsonCn', 'cntrCstNo',
    {
      header: t('MSG_TXT_CNTR_INF'),
      direction: 'horizontal',
      items: ['cstKnm', 'bryyMmdd', 'cntrMpno', 'cntrTno', 'cntrZip', 'cntrAdr'],
    },
    {
      header: t('MSG_TXT_INST_INF'),
      direction: 'horizontal',
      items: ['istllKnm', 'istllMpno', 'istllTno', 'istllZip', 'istllAdr'],
    },
    {
      header: t('MSG_TXT_PRTNR'),
      direction: 'horizontal',
      items: ['ogNm', 'prtnrKnm', 'prtnrNo', 'prtnrMpno'],
    },
    {
      header: t('MSG_TXT_RGST_INF'),
      direction: 'horizontal',
      items: ['fstRgstDtm', 'fstRgstUsrNm', 'fnlMdfcDtm', 'fnlMdfcUsrNm'],
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(layouts);
  view.editOptions.columnEditableFirst = true;
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = false;
  view.onCellButtonClicked = async (grid, { column, itemIndex }) => {
    if (column === 'cntrNo') {
      const { cntrNo, cntrSn } = grid.getValues(itemIndex);
      const { result, payload } = await modal({
        component: 'WwctaContractNumberListP',
        componentProps: { cntrNo, cntrSn },
      });
      if (result) {
        grid.setValue(itemIndex, 'cntrNo', payload.cntrNo);
        grid.setValue(itemIndex, 'cntrSn', payload.cntrSn);
        const response = await dataService.get('/sms/wells/contract/sales-limits/blacklists/', { params: payload });
        grid.setValues(itemIndex, response.data);
      }
    }
    grid.commit();
    grid.commitEditor();
  };
  view.setFixedOptions({ colCount: 5 });
});

</script>
