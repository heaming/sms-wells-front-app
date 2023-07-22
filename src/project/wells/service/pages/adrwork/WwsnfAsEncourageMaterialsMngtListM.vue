<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈', '정보관리','기준정보관리','AS유형별 필요자재 관리']"
      />
    </template>
    <kw-search
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :colspan="1"
          :label="$t('MSG_TXT_SV_TP' /*서비스유형*/)"
        >
          <kw-select
            v-model="searchParams.svTpCd"
            :label="$t('MSG_TXT_SV_TP')"
            :options="codes.SV_TP_CD_BK"
            rules="required"
          />
          <kw-select
            :options="['전체','B','C']"
          />
          <kw-select
            :options="['전체','B','C']"
          />
        </kw-search-item>

        <kw-search-item
          :colspan="1"
          :label="$t('MSG_TXT_PD_GRP')"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :label="$t('MSG_TXT_PD_GRP')"
            :options="codes.PD_GRP_CD"
            class="w140"
            first-option="all"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="productCode"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :colspan="1"
          label="조회기준"
        >
          <kw-select
            v-model="searchParams.dateType"
            :label="$t('MSG_TXT_INQR_BASE')"
            :options="[
              { codeId: 'vstCnfmdt', codeName: t('MSG_TXT_VST_CNFM_D' /*방문확정일*/) },
              { codeId: 'rcpdt', codeName: t('MSG_TXT_RCPDT' /*접수일자*/) },
              { codeId: 'vstDuedt', codeName: t('MSG_TXT_SCHD_DT' /*예정일자*/) },
              { codeId: 'wkExcnDt', codeName: t('MSG_TXT_PRCSDT' /*처리일자*/) },
            ]"
            rules="required"
          />
          <kw-date-range-picker
            v-model:from="searchParams.dateValueFromDt"
            v-model:to="searchParams.dateValueToDt"
            class="ml8"
            rules="date_range_months:1"
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
          dense
          icon="print"
          label="인쇄"
          secondary
        />
        <kw-btn
          dense
          icon="download_on"
          label="엑셀 다운로드"
          secondary
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
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
import { codeUtil, useDataService, useMeta, defineGrid, getComponentType } from 'kw-lib';
import smsCommon from '~sms-wells/service/composables/useSnCode';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
// eslint-disable-next-line no-unused-vars
const { getConfig } = useMeta();

const { getPartMaster } = smsCommon();
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'SV_TP_CD_BK',
  'PD_GRP_CD',
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  // pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  pageSize: 10,
});
let cachedParams;
const searchParams = ref({
  svTpCd: '',
  pdGrpCd: '',
  pdCd: '',
  dateType: '',
  dateValueFromDt: '',
  dateValueToDt: '',
});
const productCode = ref();
watch(() => [searchParams.value.pdGrpCd], async () => {
  const tempVal = await getPartMaster(undefined, searchParams.value.pdGrpCd);
  productCode.value = tempVal.map((v) => ({ codeId: v.cd, codeName: v.codeName }));
}, { immediate: true });

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-encourage-materials-mngt', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: items, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(items);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrCstNo', header: '고객번호', width: '150', styleName: 'text-center' },
    { fieldName: 'istllKnm', header: '고객명', width: '150', styleName: 'text-left' },
    { fieldName: 'tel', header: '연락처', width: '150', styleName: 'text-center' },
    { fieldName: 'pdNm', header: '상품명', width: '150', styleName: 'text-center' },
    { fieldName: 'pdCd', header: '품목코드', width: '150', styleName: 'text-center' },
    { fieldName: 'adr', header: '주소', width: '300', styleName: 'text-center' },
    { fieldName: 'cnslMoCn', header: '접수증상', width: '300', styleName: 'text-center' },
  ];
  data.setFields(columns.map((item) => ({ fieldName: item.fieldName })));
  view.setColumns(columns);

  view.displayOptions.emptyMessage = t('MSG_ALT_NO_INFO_SRCH');
  view.checkBar.visible = false;
  view.rowIndicator.visible = false; // create number indicator column
  view.editOptions.editable = false; // Grid Editable On
});

onMounted(async () => {
  if (window.location.href.includes('localhost')) {
    searchParams.value.svTpCd = '3';
    searchParams.value.pdGrpCd = '1';
    searchParams.value.pdCd = 'WM03100816';
    searchParams.value.dateType = 'vstCnfmdt';
    searchParams.value.dateValueFromDt = '20230701';
    searchParams.value.dateValueToDt = '20230725';
  }
});
</script>

<style scoped>
</style>
