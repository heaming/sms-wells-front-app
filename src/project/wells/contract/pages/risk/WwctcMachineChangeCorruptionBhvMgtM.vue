<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTC
2. 프로그램 ID : WwctcMachineChangeCorruptionBhvMgtM - 장치 변경 손상 관리

3. 작성자 : gs.bhavesh.n
4. 작성일 : 2023.01.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-장치 변경 손상 관리

****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :modified-targets="['machineChangegrid']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :colspan="2"
          :label="$t('MSG_TXT_ACEPT_PERIOD')"
        >
          <kw-select
            v-model="searchParams.appPeriodType"
            :model-value="['']"
            :options="[$t('MSG_TXT_REG_DT'), $t('MSG_TXT_OCCR_DT') ]"
          />
          <kw-date-range-picker
            v-model="searchParams.appPeriod"
            rules="date_range_months:1"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_CNTR_NO')"
        >
          <kw-input v-model="searchParams.contractNum " />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_RGNL_GRP')"
        >
          <kw-input v-model="searchParams.region" />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_BRANCH')"
        >
          <kw-input v-model="searchParams.branch" />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SELL_NO')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            icon="search"
            clearable
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
          />
        </template>
        <kw-btn
          primary
          dense
          :label="$t('MSG_BTN_OPEN_PIC_POP')"
          @click="onClickOpenPsicPopup"
        />
        <kw-btn
          grid-action
          :label="$t('MSG_BTN_MOD')"
          @click="onClickEdit"
        />
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
          secondary
          dense
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <kw-btn
          secondary
          dense
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
        :visible-rows="pageInfo.pageSize"
        name="machineChangegrid"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// ------------------------------------------------------------------------------------------------

import { codeUtil, useDataService, defineGrid, gridUtil, useMeta, getComponentType, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { getConfig } = useMeta();
const dataService = useDataService();
const { notify, modal } = useGlobal();
const { t } = useI18n();

const grdMainRef = ref(getComponentType('KwGrid'));

const searchParams = ref({
  appPeriodType: '',
  appPeriod: [],
  contractNum: '',
  region: '',
  branch: '',
  prtnrNo: '',
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function onClickOpenPsicPopup() {
  modal({
    component: 'WwcteConfirmApprovalDividePsicListP',
  });
}

async function onClickEdit() {
  const view = grdMainRef.value.getView();
  view.editOptions.editable = false;
  const selectedData = await gridUtil.getCheckedRowValues(view);
  if (selectedData.length === 0) {
    notify(t('MSG_ALT_MOD_NO_DATA'));
  } else if (selectedData.length > 1) {
    notify(t('MSG_ALT_SELT_ONE_ITEM'));
  } else {
    const selectedDataRow = selectedData[0].dataRow;
    view.editOptions.editable = true;
    view.onCellEditable = (grid, index) => {
      if (index.itemIndex !== selectedDataRow) { return false; }
    };
  }
}

let cachedParams;

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/common/contract/device-change-corruptions/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'dataServiceManageList',
    timePostfix: true,
    exportData: response.data,
  });
}

function onClickAdd() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {});
  view.editOptions.editable = true;
  view.onCellEditable = (grid, { itemIndex }) => {
    if (itemIndex !== 0) return false;
  };
}

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const res = await dataService.get('/sms/common/contract/device-change-corruptions', { params: cachedParams });

  const { list: partners, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(partners);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('sms/common/contract/device-change-corruptions', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  // deleteKeys needs to be updated as per API
  const deleteKeys = deletedRows.map((row) => row.dataRow);

  if (deleteKeys.length) {
    await dataService.delete('sms/common/contract/device-change-corruptions', { data: deleteKeys });
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'onHold' },
    { fieldName: 'reason' },
    { fieldName: 'newContraNum' },
    { fieldName: 'existContraNum' },
    { fieldName: 'availYearMon' },
    { fieldName: 'change' },
    { fieldName: 'secondHandComp' },
    { fieldName: 'occurYearMon' },
    { fieldName: 'instName' },
    { fieldName: 'instDt' },
    { fieldName: 'demolishDt' },
    { fieldName: 'instOver' },
    { fieldName: 'instContact' },
    { fieldName: 'prdGrp' },
    { fieldName: 'instAddr' },
    { fieldName: 'prtnrName' },
    { fieldName: 'prtnrNum' },
    { fieldName: 'areaCd' },
    { fieldName: 'branchCd' },
    { fieldName: 'changePrev' },
    { fieldName: 'instNamePrev' },
    { fieldName: 'instDtPrev' },
    { fieldName: 'demolishDtPrev' },
    { fieldName: 'instOverPrev' },
    { fieldName: 'prdGrpPrev' },
    { fieldName: 'instAddrPrev' },
  ];

  const columns = [
    { fieldName: 'onHold', header: t('MSG_TIT_HOLDON'), width: '123', styleName: 'text-center' },
    { fieldName: 'reason', header: t('MSG_TXT_RSN'), width: '262', styleName: 'text-center' },
    { fieldName: 'newContraNum',
      header: {
        text: t('MSG_TXT_NEW_CONTR'),
        styleName: 'essential',
      },
      width: '164',
      styleName: 'text-center' },
    { fieldName: 'existContraNum',
      header: {
        text: t('MSG_TXT_DEM_CONTR'),
        styleName: 'essential',
      },
      width: '164',
      styleName: 'text-center' },
    { fieldName: 'availYearMon',
      header: {
        text: t('MSG_TXT_AVAIL_TM'),
        styleName: 'essential',
      },
      width: '165',
      styleName: 'text-center' },
    { fieldName: 'change', header: t('MSG_TXT_CHG_RLS'), width: '129', styleName: 'text-center' },
    { fieldName: 'secondHandComp', header: t('MSG_TXT_SEC_HND_COMP'), width: '129', styleName: 'text-center' },
    { fieldName: 'occurYearMon', header: t('MSG_TXT_YEAR_OCCURNCE'), width: '129', styleName: 'text-center' },
    { fieldName: 'instName', header: t('MSG_TXT_IST_NM'), width: '129', styleName: 'text-center' },
    { fieldName: 'instDt', header: t('MSG_TXT_IST_DT'), width: '129', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'demolishDt', header: t('MSG_TXT_DEM_DT'), width: '129', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'instOver', header: t('MSG_TXT_INST_OVER'), width: '129', styleName: 'text-center' },
    { fieldName: 'instContact', header: t('MSG_TXT_INST_CON'), width: '129', styleName: 'text-center' },
    { fieldName: 'prdGrp', header: t('MSG_TXT_PRD_GRP'), width: '129', styleName: 'text-center' },
    { fieldName: 'instAddr', header: t('MSG_TXT_INST_ADDR'), width: '249', styleName: 'text-center' },
    { fieldName: 'prtnrName', header: t('MSG_TXT_SELL_NM'), width: '129', styleName: 'text-center' },
    { fieldName: 'prtnrNum', header: t('MSG_TXT_SELL_NO'), width: '129', styleName: 'text-center' },
    { fieldName: 'areaCd', header: t('MSG_TXT_LOCARA_CD'), width: '129', styleName: 'text-center' },
    { fieldName: 'branchCd', header: t('MSG_TXT_BRCH_CD'), width: '129', styleName: 'text-center' },
    { fieldName: 'changePrev', header: t('MSG_TXT_CHG_RLS'), width: '129', styleName: 'text-center' },
    { fieldName: 'instNamePrev', header: t('MSG_TXT_IST_NM'), width: '129', styleName: 'text-center' },
    { fieldName: 'instDtPrev', header: t('MSG_TXT_IST_DT'), width: '129', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'demolishDtPrev', header: t('MSG_TXT_DEM_DT'), width: '129', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'instOverPrev', header: t('MSG_TXT_INST_OVER'), width: '129', styleName: 'text-center' },
    { fieldName: 'prdGrpPrev', header: t('MSG_TXT_PRD_GRP'), width: '129', styleName: 'text-center' },
    { fieldName: 'instAddrPrev', header: t('MSG_TXT_INST_ADDR'), width: '250', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'onHold', 'reason', 'newContraNum', 'existContraNum', 'availYearMon',
    {
      header: t('MSG_TXT_NEW_CONT_INFO'), // colspan title
      direction: 'horizontal', // merge type
      items: ['change', 'secondHandComp', 'occurYearMon', 'instName', 'instDt', 'demolishDt', 'instOver', 'instContact', 'prdGrp', 'instAddr', 'prtnrName', 'prtnrNum', 'areaCd', 'branchCd'],
    },
    {
      header: t('MSG_TXT_PREV_CONT_INFO'), // colspan title
      direction: 'horizontal', // merge type
      items: ['changePrev', 'instNamePrev', 'instDtPrev', 'demolishDtPrev', 'instOverPrev', 'prdGrpPrev', 'instAddrPrev'],
    },
  ]);

  data.setRows([
    { onHold: 'Y', reason: '사유작성해요', newContraNum: '2022-4123456', existContraNum: '2022-4123456', availYearMon: '2022-05', change: 'N', secondHandComp: 'N', occurYearMon: 'N', instName: 'N', instDt: 'N', demolishDt: 'N', instOver: 'N', instContact: '010-****-1234', prdGrp: 'N', instAddr: '서울 중구 교원빌딩 프로...', prtnrName: '1234567', prtnrNum: '1234567', areaCd: 'E91', branchCd: 'C123456', changePrev: 'N', instNamePrev: '김판매', instDtPrev: '2022-04-26', demolishDtPrev: '2022-04-26', instOverPrev: '45', prdGrpPrev: 'N', instAddrPrev: '서울 중구 교원빌딩 프로...' },
    { onHold: 'Y', reason: '사유작성해요', newContraNum: '2022-4123456', existContraNum: '2022-4123456', availYearMon: '2022-05', change: 'N', secondHandComp: 'N', occurYearMon: 'N', instName: 'N', instDt: 'N', demolishDt: 'N', instOver: 'N', instContact: '010-****-1234', prdGrp: 'N', instAddr: '서울 중구 교원빌딩 프로...', prtnrName: '1234567', prtnrNum: '1234567', areaCd: 'E91', branchCd: 'C123456', changePrev: 'N', instNamePrev: '김판매', instDtPrev: '2022-04-26', demolishDtPrev: '2022-04-26', instOverPrev: '45', prdGrpPrev: 'N', instAddrPrev: '서울 중구 교원빌딩 프로...' },
    { onHold: 'Y', reason: '사유작성해요', newContraNum: '2022-4123456', existContraNum: '2022-4123456', availYearMon: '2022-05', change: 'N', secondHandComp: 'N', occurYearMon: 'N', instName: 'N', instDt: 'N', demolishDt: 'N', instOver: 'N', instContact: '010-****-1234', prdGrp: 'N', instAddr: '서울 중구 교원빌딩 프로...', prtnrName: '1234567', prtnrNum: '1234567', areaCd: 'E91', branchCd: 'C123456', changePrev: 'N', instNamePrev: '김판매', instDtPrev: '2022-04-26', demolishDtPrev: '2022-04-26', instOverPrev: '45', prdGrpPrev: 'N', instAddrPrev: '서울 중구 교원빌딩 프로...' },
    { onHold: 'Y', reason: '사유작성해요', newContraNum: '2022-4123456', existContraNum: '2022-4123456', availYearMon: '2022-05', change: 'N', secondHandComp: 'N', occurYearMon: 'N', instName: 'N', instDt: 'N', demolishDt: 'N', instOver: 'N', instContact: '010-****-1234', prdGrp: 'N', instAddr: '서울 중구 교원빌딩 프로...', prtnrName: '1234567', prtnrNum: '1234567', areaCd: 'E91', branchCd: 'C123456', changePrev: 'N', instNamePrev: '김판매', instDtPrev: '2022-04-26', demolishDtPrev: '2022-04-26', instOverPrev: '45', prdGrpPrev: 'N', instAddrPrev: '서울 중구 교원빌딩 프로...' },
    { onHold: 'Y', reason: '사유작성해요', newContraNum: '2022-4123456', existContraNum: '2022-4123456', availYearMon: '2022-05', change: 'N', secondHandComp: 'N', occurYearMon: 'N', instName: 'N', instDt: 'N', demolishDt: 'N', instOver: 'N', instContact: '010-****-1234', prdGrp: 'N', instAddr: '서울 중구 교원빌딩 프로...', prtnrName: '1234567', prtnrNum: '1234567', areaCd: 'E91', branchCd: 'C123456', changePrev: 'N', instNamePrev: '김판매', instDtPrev: '2022-04-26', demolishDtPrev: '2022-04-26', instOverPrev: '45', prdGrpPrev: 'N', instAddrPrev: '서울 중구 교원빌딩 프로...' },
    { onHold: 'Y', reason: '사유작성해요', newContraNum: '2022-4123456', existContraNum: '2022-4123456', availYearMon: '2022-05', change: 'N', secondHandComp: 'N', occurYearMon: 'N', instName: 'N', instDt: 'N', demolishDt: 'N', instOver: 'N', instContact: '010-****-1234', prdGrp: 'N', instAddr: '서울 중구 교원빌딩 프로...', prtnrName: '1234567', prtnrNum: '1234567', areaCd: 'E91', branchCd: 'C123456', changePrev: 'N', instNamePrev: '김판매', instDtPrev: '2022-04-26', demolishDtPrev: '2022-04-26', instOverPrev: '45', prdGrpPrev: 'N', instAddrPrev: '서울 중구 교원빌딩 프로...' },
    { onHold: 'Y', reason: '사유작성해요', newContraNum: '2022-4123456', existContraNum: '2022-4123456', availYearMon: '2022-05', change: 'N', secondHandComp: 'N', occurYearMon: 'N', instName: 'N', instDt: 'N', demolishDt: 'N', instOver: 'N', instContact: '010-****-1234', prdGrp: 'N', instAddr: '서울 중구 교원빌딩 프로...', prtnrName: '1234567', prtnrNum: '1234567', areaCd: 'E91', branchCd: 'C123456', changePrev: 'N', instNamePrev: '김판매', instDtPrev: '2022-04-26', demolishDtPrev: '2022-04-26', instOverPrev: '45', prdGrpPrev: 'N', instAddrPrev: '서울 중구 교원빌딩 프로...' },
    { onHold: 'Y', reason: '사유작성해요', newContraNum: '2022-4123456', existContraNum: '2022-4123456', availYearMon: '2022-05', change: 'N', secondHandComp: 'N', occurYearMon: 'N', instName: 'N', instDt: 'N', demolishDt: 'N', instOver: 'N', instContact: '010-****-1234', prdGrp: 'N', instAddr: '서울 중구 교원빌딩 프로...', prtnrName: '1234567', prtnrNum: '1234567', areaCd: 'E91', branchCd: 'C123456', changePrev: 'N', instNamePrev: '김판매', instDtPrev: '2022-04-26', demolishDtPrev: '2022-04-26', instOverPrev: '45', prdGrpPrev: 'N', instAddrPrev: '서울 중구 교원빌딩 프로...' },
    { onHold: 'Y', reason: '사유작성해요', newContraNum: '2022-4123456', existContraNum: '2022-4123456', availYearMon: '2022-05', change: 'N', secondHandComp: 'N', occurYearMon: 'N', instName: 'N', instDt: 'N', demolishDt: 'N', instOver: 'N', instContact: '010-****-1234', prdGrp: 'N', instAddr: '서울 중구 교원빌딩 프로...', prtnrName: '1234567', prtnrNum: '1234567', areaCd: 'E91', branchCd: 'C123456', changePrev: 'N', instNamePrev: '김판매', instDtPrev: '2022-04-26', demolishDtPrev: '2022-04-26', instOverPrev: '45', prdGrpPrev: 'N', instAddrPrev: '서울 중구 교원빌딩 프로...' },
    { onHold: 'Y', reason: '사유작성해요', newContraNum: '2022-4123456', existContraNum: '2022-4123456', availYearMon: '2022-05', change: 'N', secondHandComp: 'N', occurYearMon: 'N', instName: 'N', instDt: 'N', demolishDt: 'N', instOver: 'N', instContact: '010-****-1234', prdGrp: 'N', instAddr: '서울 중구 교원빌딩 프로...', prtnrName: '1234567', prtnrNum: '1234567', areaCd: 'E91', branchCd: 'C123456', changePrev: 'N', instNamePrev: '김판매', instDtPrev: '2022-04-26', demolishDtPrev: '2022-04-26', instOverPrev: '45', prdGrpPrev: 'N', instAddrPrev: '서울 중구 교원빌딩 프로...' },

  ]);
});
</script>
<style scoped>
</style>
