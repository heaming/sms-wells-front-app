<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTC
2. 프로그램 ID : WwctcMachineChangeCorruptionBhvMgtM - 기기 변경 부정 행위 관리
3. 작성자 : gs.bhavesh.n
4. 작성일 : 2023.01.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 기기 변경 부정 행위 관리
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
          :colspan="2"
          :label="$t('MSG_TXT_ACEPT_PERIOD')"
          required
        >
          <kw-select
            v-model="searchParams.apyCls"
            :options="codes.APY_CLS"
            :label="$t('MSG_TXT_ACEPT_PERIOD')"
            rules="required"
          />
          <kw-date-range-picker
            v-model:from="searchParams.strtYm"
            v-model:to="searchParams.endYm"
            :label="$t('MSG_TXT_ACEPT_PERIOD')"
            type="month"
            rules="date_range_required"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_CNTR_NO')"
        >
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_RGNL_GRP')"
        >
          <kw-input
            v-model="searchParams.dgr2LevlOgCd"
            maxlength="10"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_BRANCH')"
        >
          <kw-input
            v-model="searchParams.dgr3LevlOgCd"
            maxlength="10"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PTNR_NAME')"
        >
          <kw-input
            v-model="searchParams.prtnrKnm"
            maxlength="50"
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
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <kw-btn
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
// ------------------------------------------------------------------------------------------------
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isNumber } from 'lodash-es';

const { getConfig } = useMeta();
const dataService = useDataService();
const { notify } = useGlobal();
const { t } = useI18n();
const { currentRoute } = useRouter();
const grdMainRef = ref(getComponentType('KwGrid'));
const searchParams = ref({
  apyCls: 1,
  strtYm: dayjs().format('YYYYMM'),
  endYm: dayjs().format('YYYYMM'),
  cntrNo: '',
  dgr2LevlOgCd: '',
  dgr3LevlOgCd: '',
  prtnrKnm: '',
});
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'ICPT_SELL_PROCS_TP_CD',
);
codes.APY_CLS = [
  { codeId: 1, codeName: t('MSG_TXT_AVAIL_TM') }, // 적발년월
  { codeId: 2, codeName: t('MSG_TXT_YEAR_OCCURNCE') }, // 발생년월
];
codes.ICPT_SELL_PROCS_TP_CD = [{ codeId: '030', codeName: '보류' }, { codeId: '040', codeName: '보류해제' }];
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/contract/incomplete-sales/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

function onClickAdd() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {
    icptSellProcsTpCd: '030',
    icptSellExrDt: dayjs().format('YYYYMM'),
  }, 'icptSellRsonCn');
}

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const res = await dataService.get('/sms/wells/contract/incomplete-sales/paging', { params: cachedParams });

  const { list: izs, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  console.log(izs);
  view.getDataSource().setRows(izs);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

/*
async function onClickSearchPartner() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
      ogTpCd: 'W01',
    },
  });
  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}
 */

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('sms/wells/contract/incomplete-sales', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  const deleteKeys = deletedRows.map((row) => row.icptSellId);

  if (deleteKeys.length) {
    await dataService.delete('sms/wells/contract/incomplete-sales', { data: deleteKeys });
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'icptSellProcsTpCd' },
    { fieldName: 'icptSellRsonCn' },
    { fieldName: 'baseCntrNo' },
    { fieldName: 'baseCntrSn', dataType: 'number' },
    { fieldName: 'ojCntrNo' },
    { fieldName: 'ojCntrSn', dataType: 'number' },
    { fieldName: 'icptSellExrDt' },
    { fieldName: 'cntrPdStrtDt' },
    { fieldName: 'baseUsedCpsYn' },
    { fieldName: 'baseChdvcRerntYn' },
    { fieldName: 'baseRcgvpKnm' },
    { fieldName: 'baseIstDt' },
    { fieldName: 'baseReqdDt' },
    { fieldName: 'baseIstGapMm' },
    { fieldName: 'baseCralLocaraTno' },
    { fieldName: 'baseMexnoEncr' },
    { fieldName: 'baseCralIdvTno' },
    { fieldName: 'baseMpno' },
    { fieldName: 'basePdCd' },
    { fieldName: 'baseAdr' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'dgr2LevlOgCd' },
    { fieldName: 'dgr3LevlOgCd' },
    { fieldName: 'ojChdvcRerntYn' },
    { fieldName: 'ojRcgvpKnm' },
    { fieldName: 'ojIstDt' },
    { fieldName: 'ojReqdDt' },
    { fieldName: 'ojIstGapMm' },
    { fieldName: 'ojPdCd' },
    { fieldName: 'ojAdr' },
    { fieldName: 'fnlMdfcDtm' },
    { fieldName: 'icptSellId' },
    { fieldName: 'isValidCntrs' },
  ];

  const columns = [
    {
      fieldName: 'icptSellProcsTpCd',
      header: t('MSG_TIT_HOLDON'),
      rules: 'required',
      width: 120,
      editable: true,
      options: codes.ICPT_SELL_PROCS_TP_CD,
      editor: {
        type: 'list',
      },
    },
    {
      fieldName: 'icptSellRsonCn',
      header: t('MSG_TXT_RSN'),
      width: 300,
      editable: true,
      editor: {
        maxLength: 1000,
      },
    },
    {
      fieldName: 'baseCntrNo',
      header: t('MSG_TXT_CNTR_NO'),
      width: 130,
      editable: true,
      editor: {
        maxLength: 12,
      },
      rules: 'required',
    },
    {
      fieldName: 'baseCntrSn',
      header: t('MSG_TXT_CNTR_SN'),
      width: 120,
      editable: true,
      styleName: 'text-right',
      rules: 'required',
    },
    {
      fieldName: 'ojCntrNo',
      header: t('MSG_TXT_CNTR_NO'),
      width: 130,
      editable: true,
      editor: {
        maxLength: 12,
      },
      rules: 'required',
    },
    {
      fieldName: 'ojCntrSn',
      header: t('MSG_TXT_CNTR_SN'),
      width: 120,
      editable: true,
      styleName: 'text-right',
      rules: 'required',
    },
    {
      fieldName: 'icptSellExrDt',
      header: t('MSG_TXT_AVAIL_TM'),
      width: 140,
      editable: true,
      styleName: 'text-center',
      datetimeFormat: 'YYYY-MM',
      editor: {
        type: 'btdate',
        btOptions: {
          minViewMode: 1,
        },
      },
      rules: 'required',
    },
    { fieldName: 'baseUsedCpsYn', header: t('MSG_TXT_CHG_RLS'), width: 120, styleName: 'text-center' },
    { fieldName: 'baseChdvcRerntYn', header: t('MSG_TXT_SEC_HND_COMP'), width: 120, styleName: 'text-center' },
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_YEAR_OCCURNCE'), width: 120, styleName: 'text-center' },
    { fieldName: 'baseRcgvpKnm', header: t('MSG_TXT_IST_NM'), width: 120, styleName: 'text-center' },
    { fieldName: 'baseIstDt', header: t('MSG_TXT_IST_DT'), width: 120, styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'baseReqdDt', header: t('MSG_TXT_DEM_DT'), width: 120, styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'baseIstGapMm', header: t('MSG_TXT_INST_OVER'), width: 120, styleName: 'text-center' },
    { fieldName: 'baseMpno', header: t('MSG_TXT_INST_CON'), width: 120, styleName: 'text-center' },
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRD_GRP'), width: 120, styleName: 'text-center' },
    { fieldName: 'baseAdr', header: t('MSG_TXT_INST_ADDR'), width: 250 },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PTNR_NAME'), width: 120, styleName: 'text-center' },
    { fieldName: 'dgr2LevlOgCd', header: t('MSG_TXT_RGNL_GRP'), width: 120, styleName: 'text-center' }, // 지역단
    { fieldName: 'dgr3LevlOgCd', header: t('MSG_TXT_BRANCH'), width: 120, styleName: 'text-center' }, // 지점
    { fieldName: 'ojChdvcRerntYn', header: t('MSG_TXT_CHG_RLS'), width: 120, styleName: 'text-center' },
    { fieldName: 'ojRcgvpKnm', header: t('MSG_TXT_IST_NM'), width: 120, styleName: 'text-center' },
    { fieldName: 'ojIstDt', header: t('MSG_TXT_IST_DT'), width: 120, styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'ojReqdDt', header: t('MSG_TXT_DEM_DT'), width: 120, styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'ojIstGapMm', header: t('MSG_TXT_INST_OVER'), width: 120, styleName: 'text-center' },
    { fieldName: 'ojPdCd', header: t('MSG_TXT_PRD_GRP'), width: 120, styleName: 'text-center' },
    { fieldName: 'ojAdr', header: t('MSG_TXT_INST_ADDR'), width: 250 },
  ];

  const layouts = [
    'icptSellProcsTpCd', 'icptSellRsonCn',
    {
      header: t('MSG_TXT_NW_CNTR_NO'),
      direction: 'horizontal',
      items: ['baseCntrNo', 'baseCntrSn'],
    },
    {
      header: t('MSG_TXT_BF_CNTR_NO'),
      direction: 'horizontal',
      items: ['ojCntrNo', 'ojCntrSn'],
    },
    'icptSellExrDt',
    {
      header: t('MSG_TXT_NEW_CONT_INFO'),
      direction: 'horizontal',
      items: ['baseUsedCpsYn', 'baseChdvcRerntYn', 'cntrPdStrtdt', 'baseRcgvpKnm', 'baseIstDt', 'baseReqdDt', 'baseIstGapMm', 'baseMpno', 'basePdCd', 'baseAdr', 'prtnrKnm', 'dgr2LevlOgCd', 'dgr3LevlOgCd'],
    },
    {
      header: t('MSG_TXT_PREV_CONT_INFO'),
      direction: 'horizontal',
      items: ['ojChdvcRerntYn', 'ojRcgvpKnm', 'ojIstDt', 'ojReqdDt', 'ojIstGapMm', 'ojPdCd', 'ojAdr'],
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(layouts);
  view.editOptions.columnEditableFirst = true;
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = false;
  view.onCellEdited = async (grid, itemIndex, row, field) => {
    if (['baseCntrNo', 'baseCntrSn', 'ojCntrNo', 'ojCntrSn'].includes(grid.getColumn(field).name)) {
      const { baseCntrNo, baseCntrSn, ojCntrNo, ojCntrSn } = grid.getValues(itemIndex);
      if (!!baseCntrNo && isNumber(baseCntrSn) && !!ojCntrNo && isNumber(ojCntrSn)) {
        grid.setValue(itemIndex, 'isValidCntrs', 'N');
        const res = await dataService.get('/sms/wells/contract/incomplete-sales', { params: { baseCntrNo, baseCntrSn, ojCntrNo, ojCntrSn } });
        const info = res.data;
        ['icptSellProcsTpCd', 'icptSellRsonCn', 'icptSellExrDt'].forEach((col) => {
          info[col] = '';
        }); // FIXME 로직 확인
        grid.setValues(itemIndex, res.data);
        grid.setValue(itemIndex, 'isValidCntrs', 'Y');
      }
    }
  };
  view.onValidate = async (grid, index) => {
    if (index.column === 'baseCntrNo') {
      if (grid.getValue(index.itemIndex, 'isValidCntrs') === 'N') {
        return t('MSG_ALT_INVALID_DEVICE_CHANGE');
      }
    }
  };
});
</script>
