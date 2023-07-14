<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaAssignExcludeItemRegP - 배정제외품목 등록
3. 작성자 : inho.choi
4. 작성일 : 2023.04.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
배정에 제외되는 품목을 등록 하는 팝업 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <kw-search
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 제외유형 -->
        <kw-search-item
          :label="t('MSG_TXT_EXLD_TP')"
          required
        >
          <kw-select
            v-model="searchParams.asnExcdDvCd"
            :options="codes.ASN_EXCD_DV_CD"
            rules="required"
            @change="onChangeAsnExcdDvCd"
          />
        </kw-search-item>
        <!-- //제외유형 -->
        <!-- 제외품목 -->
        <kw-search-item
          :label="t('MSG_TXT_EXLD_ITM')"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="filterCodes.itmKndCd"
            first-option="all"
          />
        </kw-search-item>
        <!-- //제외품목 -->
        <!-- 영업센터 -->
        <kw-search-item :label="t('MSG_TXT_BSNS_CNTR')">
          <kw-select
            v-model="searchParams.wareNo"
            :options="optionsWareNo"
            :disable="searchParams.asnExcdDvCd === '0'"
            option-value="wareNo"
            option-label="wareNm"
            placeholder=""
          />
        </kw-search-item>
        <!-- //영업센터 -->
      </kw-search-row>
    </kw-search>
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change="fetchData(false)"
        />
      </template>
      <kw-btn
        grid-action
        :label="$t('MSG_BTN_SAVE')"
        dense
        primary
        @click="onClickSave"
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
      @change="fetchData(false)"
    />
  </kw-popup>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { codeUtil, getComponentType, useDataService, useMeta, defineGrid, gridUtil, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { notify } = useGlobal();
const { getConfig } = useMeta();
const { t } = useI18n();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'ASN_EXCD_DV_CD',
  'ITM_KND_CD',
);

let cachedParams;
const searchParams = ref({
  asnExcdDvCd: '0',
  itmKndCd: '',
  wareNo: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const filterCodes = ref({
  itmKndCd: [],
});

function itmKndCdFilter() {
  filterCodes.value.itmKndCd = codes.ITM_KND_CD.filter((v) => ['4', '5', '6'].includes(v.codeId));
}

const optionsWareNo = ref();
// 창고 조회
async function getWareHouse() {
  searchParams.value.wareNo = '';
  const result = await dataService.get('/sms/wells/service/assign-exclude-items/warehouse');
  optionsWareNo.value = result.data;
}

function onChangeAsnExcdDvCd() {
  searchParams.value.wareNo = '';

  const { asnExcdDvCd } = searchParams.value;
  if (asnExcdDvCd !== '0' && !isEmpty(optionsWareNo.value)) {
    searchParams.value.wareNo = optionsWareNo.value[0].wareNo;
  }
}

let isSearch;
async function fetchData(isSrh) {
  isSearch = isSrh;

  const res = await dataService.get('/sms/wells/service/assign-exclude-items/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: excludeItem, pageInfo: pagingResult } = res.data;
  pagingResult.needTotalCount = false;
  pageInfo.value = pagingResult;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(excludeItem);
    view.resetCurrent();
  }
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  pageInfo.value.needTotalCount = true;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData(true);
}

async function onClickSave() {
  const gridView = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(gridView);
  if (isEmpty(checkedRows)) {
    notify(t('MSG_ALT_SAV_SEL_DATA'));
    return;
  }

  // 배정제외 품목을 등록하기 전에 조회조건에 해당하는 데이터를 삭제함으로 최초 조회인 경우만 삭제처리함.
  if (isSearch) {
    // 삭제처리
    await dataService.delete('/sms/wells/service/assign-exclude-items', { data: cachedParams });
  }

  const res = await dataService.post('/sms/wells/service/assign-exclude-items', checkedRows);

  const { processCount } = res.data;
  if (processCount > 0) {
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData(false);
  }
}

onMounted(async () => {
  itmKndCdFilter();
  await getWareHouse();
  await onClickSearch();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' },
    { fieldName: 'itmPdCd' },
    { fieldName: 'itmPdNm' },
    { fieldName: 'itmKndCd' },
    { fieldName: 'itmKndNm' },
    { fieldName: 'asnExcdDvCd' },
    { fieldName: 'asnExcdDvNm' },
    { fieldName: 'strWareNo' },
    { fieldName: 'chk', dataType: 'text', booleanFormat: 'N:Y' },
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '180', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '124', styleName: 'text-center' },
    { fieldName: 'itmPdNm', header: t('MSG_TXT_ITM_NM'), width: '380', styleName: 'text-left' },
    { fieldName: 'itmKndNm', header: t('MSG_TXT_ITM_DV'), width: '80', styleName: 'text-center' },
    { fieldName: 'asnExcdDvNm', header: t('MSG_TXT_DIV'), width: '80', styleName: 'text-center' },
    { fieldName: 'strWareNo', header: t('MSG_TXT_CENTER_CD'), width: '100', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.fieldName = 'chk';
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
