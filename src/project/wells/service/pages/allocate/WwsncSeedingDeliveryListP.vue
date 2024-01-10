<!--
 ***************************************************************************************************
 * 프로그램 개요
 ***************************************************************************************************
 1. 모듈 : 모종 배송내역
 2. 프로그램 ID : K-W-SV-U-0213P01
 3. 작성자 : heymi.cho
 4. 작성일 : 2023.06.23
 ***************************************************************************************************
 * 프로그램 설명
 ***************************************************************************************************
 - 모종 배송내역 팝업 (http://localhost:3000/#/service/wwsnc-seeding-delivery-list)
 ***************************************************************************************************
-->

<template>
  <kw-popup
    size="2xl"
    no-action
  >
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
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, gridUtil, useDataService, defineGrid } from 'kw-lib';
import { onMounted } from 'vue';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();

const props = defineProps({
  cntrNo: { type: String, default: '', required: true },
  cntrSn: { type: String, default: '', required: true },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

/*
 *  Page Info setting
 */
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

/*
 *  Search Parameter
 */
const searchParams = ref({
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
});

async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/seeding-delivery-list/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  console.log(pageInfo);

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(state);
  view.resetCurrent();

  await gridUtil.reset(view);
}

onMounted(async () => {
  await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sdingInfo' },
    { fieldName: 'adr' },
    { fieldName: 'sellAmt' },
    { fieldName: 'vstDt' },
    { fieldName: 'dlvyStatus' },
  ];

  const columns = [
    { fieldName: 'sdingInfo', header: t('MSG_TXT_PRDT_NM'), width: '342', styleName: 'text-left' },
    { fieldName: 'adr', header: t('MSG_TXT_DEL_ADDR'), width: '342', styleName: 'text-left' },
    { fieldName: 'sellAmt', header: t('MSG_TXT_AMT_WON'), width: '150', styleName: 'text-right' },
    { fieldName: 'vstDt',
      header: t('MSG_TXT_EXP_DEL_DT'),
      width: '150',
      styleName: 'text-center',
      datetimeFormat: 'yyyy-MM-dd',
    },
    { fieldName: 'dlvyStatus', header: t('MSG_TXT_RTRN_SHIPNG_STATS'), width: '150', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
