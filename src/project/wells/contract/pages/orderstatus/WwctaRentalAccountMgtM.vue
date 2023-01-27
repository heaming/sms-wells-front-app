<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaRentalAccountMgtM - 렌탈 계정 관리 현황
3. 작성자 : gs.nidhi.d
4. 작성일 : 2023.01.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈 계정 관리 현황
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_INQR_DV')">
          <kw-option-group
            v-model="srchSelection"
            type="radio"
            :options="srchOptions"
            @change="onChangeSearch"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_YR_INSTALLATION')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.dangOcStrtdt[0]"
            v-model:to="searchParams.dangOcStrtdt[1]"
            rules="date_range_required|date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item
          v-if="srchSelection === 100"
          :label="$t('MSG_TXT_PDGRP')"
        >
          <kw-select
            v-model="searchParams.prdGrp"
            :options="['BO등록일', '입찰예정일']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          v-else
          :label="$t('MSG_TXT_MANAGEMENT_DEPARTMENT')"
        >
          <kw-select
            v-model="searchParams.mngmntGrp"
            :options="['A-Team', 'B-Team']"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          v-if="srchSelection ==='상품별'"
          :label="$t('MSG_TXT_PRDT_CODE')"
        >
          <kw-input v-model="searchParams.prdCd" />
        </kw-search-item>
        <kw-search-item
          v-else
          :label="$t('MSG_TXT_RGNL_GRP')"
        >
          <kw-select
            v-model="searchParams.rgnlGrp"
            :options="['Grp1', 'Grp2']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_CST_DV')">
          <kw-select
            v-model="searchParams.cstmrDiv"
            :options="codes.COPN_DV_CD"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!totalCount"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="totalCount"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, gridUtil, defineGrid, getComponentType, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const dataService = useDataService();

const now = dayjs();
// @todo: update to 0 on api integration
const totalCount = ref(10);
const srchOptions = ref([{
  codeId: 100,
  codeName: '상품별' },
{
  codeId: 200,
  codeName: '관리 조직별' }]);
const srchSelection = ref(100);

let cachedParams;
const searchParams = ref({
  dangOcStrtdt: [now.startOf('month').format('YYYYMMDD'), now.format('YYYYMMDD')],
  prdGrp: '',
  mngmntGrp: '',
  prdCd: '',
  rgnlGrp: '',
  cstmrDiv: '',

});

const codes = await codeUtil.getMultiCodes(
  'COPN_DV_CD',
);

const grdMainRef = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const isProd = computed(() => srchSelection.value === 100);

// Updating the col visibility as per search classification
function onChangeSearch() {
  const view = grdMainRef.value.getView();
  view.columnsByTag('prod').forEach((col) => { col.visible = isProd.value; });
  view.columnsByTag('org').forEach((col) => { col.visible = !(isProd.value); });
}

async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  if (isProd.value) {
    const { mngmntGrp, rgnlGrp, ...prodParams } = cachedParams;
    res = await dataService.get('/sms/wells/contract/product-rental-accounts', { params: prodParams });
  } else {
    const { prdGrp, prdCd, ...orgParams } = cachedParams;
    res = await dataService.get('/sms/wells/contract/organization-rental-accounts', { params: orgParams });
  }

  const { list: accounts } = res.data;
  totalCount.value = accounts.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(accounts);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: 'dataServiceManageList',
    timePostfix: true,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
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

  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_PDGRP'), width: '178', visible: true, tag: 'prod' },
    { fieldName: 'col2', header: t('MSG_TXT_PD_NM'), width: '295', visible: true, tag: 'prod' },
    { fieldName: 'col3', header: t('MSG_TXT_PRDT_CODE'), width: '125', styleName: 'text-center', visible: true, tag: 'prod' },
    { fieldName: 'col14', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '178', visible: false, tag: 'org' },
    { fieldName: 'col15', header: t('MSG_TXT_RGNL_GRP'), width: '295', visible: false, tag: 'org' },
    { fieldName: 'col4', header: t('MSG_TXT_YR_INSTALLATION'), width: '125', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_RECOMMITMENT'), width: '125', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_SUBSCRPTN_NO'), width: '139', styleName: 'text-right' },
    { fieldName: 'col7', header: t('MSG_TXT_CHNG'), width: '139', styleName: 'text-right' },
    { fieldName: 'col8', header: t('MSG_TXT_RE_RENTAL'), width: '139', styleName: 'text-right' },
    { fieldName: 'col9', header: t('MSG_TXT_MEMBERSHIP'), width: '139', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_RNTL_MNTENC'), width: '139', styleName: 'text-right' },
    { fieldName: 'col11', header: '이탈(만료→자가)', width: '171', styleName: 'text-right' },
    { fieldName: 'col12', header: '이탈(철거→후속계약X)', width: '194', styleName: 'text-right' },
    { fieldName: 'col13', header: t('MSG_TXT_WTHDRWL_RT'), width: '139', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '공기청정기', col2: '공기청정기AK316ESA', col3: '4375', col4: '2022-10', col5: 'N', col6: '1', col7: '0', col8: '0', col9: '0', col10: '0', col11: '0', col12: '0', col13: '0', col14: 'Business', col15: 'Grp1' },
    { col1: '비데', col2: '비데(BM750RWA)', col3: '4416', col4: '2022-10', col5: 'N', col6: '6', col7: '0', col8: '0', col9: '0', col10: '0', col11: '0', col12: '0', col13: '0', col14: 'Business', col15: 'Grp2' },
    { col1: '비데', col2: '비데(BM750RWA)', col3: '4416', col4: '2022-10', col5: 'N', col6: '6', col7: '0', col8: '0', col9: '0', col10: '0', col11: '0', col12: '0', col13: '0', col14: 'Business', col15: 'Grp2' },
  ]);
});

</script>

<style scoped>
</style>
