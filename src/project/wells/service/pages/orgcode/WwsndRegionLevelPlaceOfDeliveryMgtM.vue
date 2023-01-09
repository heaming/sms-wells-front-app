<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SND (조직관리)
2. 프로그램 ID : WwsndRegionLevelPlaceOfDeliveryMgtM - 급지 출고지 관리
3. 작성자 : yeonghwa.cheon
4. 작성일 : 2022.12.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 급지 출고지 관리 (http://localhost:3000/#/service/wwsnd-region-level-place-of-delivery-mgt)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 출고지구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_PDLV_DV')"
        >
          <kw-select
            v-model="searchParams.pdlvDvCd"
            :options="pdlvDvCds"
            first-option="all"
            @update:model-value="changePdlvDv"
          />
        </kw-search-item>
        <!-- 출고지명 -->
        <kw-search-item
          :label="$t('MSG_TXT_PDLV_NM')"
        >
          <kw-input
            v-model="searchParams.pdlvNm"
          />
        </kw-search-item>
        <!-- 서비스센터 -->
        <kw-search-item
          :label="$t('MSG_TXT_SV_CNR')"
        >
          <kw-select
            v-model="searchParams.ogId"
            :options="svcCode"
            first-option="all"
            option-label="ogNm"
            option-value="ogCd"
          />
        </kw-search-item>
        <!-- 적용일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_APPLY_DT')"
        >
          <kw-date-picker
            v-model="searchParams.applyDate"
            :readonly="isReadonly"
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_DEL')"
          @click="onClickDelete"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAddRow"
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
          :disable="(pageInfo.totalCount === 0)"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-date-picker
          v-model="chgApyDt.apyStrtdt"
          class="w150"
        />
        <span>~</span>
        <kw-date-picker
          v-model="chgApyDt.apyEnddt"
          class="w150"
        />
        <kw-btn
          primary
          dense
          :label="$t('MSG_TXT_APY_DT_BLK_CH')"
          @click="onClickApplyDateBulkChange"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="pageInfo.pageSize"
        @init="initGrdMain"
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
import {
  codeUtil,
  defineGrid,
  getComponentType,
  useDataService,
  useMeta,
  gridUtil,
  useGlobal,
} from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import smsCommon from '~sms-wells/service/composables/useSnCode';
import dayjs from 'dayjs';

const { t } = useI18n();
const { getConfig } = useMeta();
const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const {
  modal,
  notify,
} = useGlobal();
const {
  // getDisstricts,
  getServiceCenterOrgs,
} = smsCommon();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();

/* 공통코드 가져오기 */
const codes = await codeUtil.getMultiCodes(
  // 'CST_DV_CD',
  // 'CRP_DSC_ANA_CST_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
  // 'PD_GRP_CD',
);

const svcCode = await getServiceCenterOrgs();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;

const pdlvDvCds = [
  { codeId: 'E', codeName: t('MSG_TXT_EGER_BRCH') },
  { codeId: 'Z', codeName: t('MSG_TXT_CST_ADR_RPLC') },
];
const chgApyDt = ref({
  apyStrtdt: now.format('YYYYMMDD'),
  apyEnddt: '99991231',
});

/* 조회조건 */
const searchParams = ref({
  pdlvDvCd: '',
  pdlvNm: '',
  ogId: '',
  applyDate: now.format('YYYYMMDD'),
});

const isReadonly = ref(false);

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/region-levels/place-of-deliverys/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: 'RegionLevelPlaceOfDelivery',
    timePostfix: true,
    exportData: response.data,
  });
}
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/region-levels/place-of-deliverys/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: places, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(places);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

function onClickAddRow() {
  if (searchParams.value.pdlvDvCd === '') {
    notify(t('MSG_ALT_CHK_PDLV_DV'));
  } else {
    const view = grdMainRef.value.getView();
    gridUtil.insertRowAndFocus(view, 0, { apyEnddt: '99991231' });
  }
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
  } else if (await gridUtil.validate(view, { isCheckedOnly: true })) {
    await dataService.post('/sms/wells/service/region-levels/place-of-deliverys', chkRows);
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  const pdlvNos = deletedRows.map(({ pdlvNo }) => pdlvNo);
  // eslint-disable-next-line no-shadow
  const pdlvDvCds = deletedRows.map(({ pdlvDvCd }) => pdlvDvCd);
  console.log(deletedRows);
  if (deletedRows.length > 0) {
    // 삭제 controller
    await dataService.delete('/sms/wells/service/region-levels/place-of-deliverys', { params: { pdlvNos, pdlvDvCds } });
    await fetchData();
  }
}

function changePdlvDv() {
  if (searchParams.value.pdlvDvCd === 'E') {
    searchParams.value.applyDate = now.add(1, 'days').format('YYYYMMDD');
    isReadonly.value = false;
  } else if (searchParams.value.pdlvDvCd === 'Z') {
    searchParams.value.applyDate = now.format('YYYYMMDD');
    isReadonly.value = true;
  } else {
    searchParams.value.applyDate = now.format('YYYYMMDD');
    isReadonly.value = false;
  }
}

async function onClickApplyDateBulkChange() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);
  const data = grdMainRef.value.getData();
  if (chkRows.length === 0) {
    notify(t('MSG_ALT_CHG_HLDY_DATA'));
  } else {
    for (let i = 0; i < chkRows.length; i += 1) {
      data.setValue(chkRows[i].dataRow, 'apyStrtdt', chgApyDt.value.apyStrtdt);
      data.setValue(chkRows[i].dataRow, 'apyEnddt', chgApyDt.value.apyEnddt);
      debugger;
    }
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'pdlvNo' },
    { fieldName: 'pdlvNm' },
    { fieldName: 'pdlvDvCd' },
    { fieldName: 'zip' },
    { fieldName: 'pdlvAdr' },
    { fieldName: 'pdlvDtlAdr' },
    { fieldName: 'apyStrtdtOrigin' },
    { fieldName: 'apyStrtdt' },
    { fieldName: 'apyEnddt' },
    { fieldName: 'cnrOgId' },
  ];

  const columns = [
    {
      fieldName: 'pdlvNm',
      header: t('MSG_TXT_PDLV_NM'),
      width: '150',
      editable: true,
      rules: 'required',
    },
    {
      fieldName: 'zip',
      header: t('MSG_TXT_ZIP'),
      width: '150',
      styleName: 'text-center rg-button-icon--search',
      button: 'action',
      buttonVisibleCallback: (grid, index) => {
        const rowState = gridUtil.getRowState(grid, index.dataRow);
        return (rowState === 'created');
      },
      rules: 'required',
    },
    {
      fieldName: 'pdlvAdr',
      width: '250',
    },
    {
      fieldName: 'pdlvDtlAdr',
      width: '100',
    },
    {
      fieldName: 'apyStrtdt',
      header: t('MSG_TXT_APY_STRT_DAY'),
      width: '150',
      styleName: 'text-center',
      editable: true,
      editor: { type: 'btdate' },
      rules: 'required',
    },
    {
      fieldName: 'apyEnddt',
      header: t('MSG_TXT_APY_END_DAY'),
      width: '150',
      styleName: 'text-center',
      editable: true,
      editor: { type: 'btdate' },
      rules: 'required',
    },
    {
      fieldName: 'cnrOgId',
      header: t('MSG_TXT_CENTER_DIVISION'),
      width: '150',
      editor: { type: 'list' },
      editable: true,
      options: svcCode,
      optionValue: 'ogCd',
      optionLabel: 'ogNm',
    },

  ];

  const columnLayout = [
    'pdlvNm',
    'zip',
    {
      header: t('MSG_TXT_ADDR'),
      direction: 'horizontal',
      hideChildHeaders: true,
      items: ['pdlvAdr', 'pdlvDtlAdr'],
    },
    'apyStrtdt',
    'apyEnddt',
    'cnrOgId',
  ];

  view.setColumnLayout(columnLayout);

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.onCellButtonClicked = async (grid, index) => {
    grid.commit();
    const { result, payload } = await modal({
      component: 'ZwcmzAddressInfoP',
    });
    console.log(index);
    debugger;
    if (result) {
      const { address } = payload;
      data.setValue(index.dataRow, 'zip', address.zipCode);
      data.setValue(index.dataRow, 'pdlvAdr', address.add1);
      data.setValue(index.dataRow, 'pdlvDtlAdr', address.add2);
      data.setValue(index.dataRow, 'pdlvNo', address.bldMngtNo);
    }
  };

  view.onCellEdited = async (grid, itemIndex, row, field) => {
    if (field === 7) {
      const { apyStrtdt, apyStrtdtOrigin } = grid.getValues(itemIndex);

      if (apyStrtdtOrigin > apyStrtdt) {
        notify(t('MSG_ALT_APY_STRT_D_CONF_BF_DT'));
        grid.setValue(itemIndex, 'apyStrtdt', apyStrtdtOrigin);
      }
    }
  };
});

</script>
<style scoped>

</style>
