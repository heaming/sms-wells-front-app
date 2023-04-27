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
        >
          <kw-select
            :model-value="searchParams.asnExcdDvCd"
            :options="codes.ASN_EXCD_DV_CD"
          />
        </kw-search-item>
        <!-- //제외유형 -->
        <!-- 제외품목 -->
        <kw-search-item
          :label="t('MSG_TXT_EXLD_ITM')"
        >
          <kw-select
            :model-value="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- //제외품목 -->
        <!-- 영업센터 -->
        <kw-search-item :label="t('MSG_TXT_BSNS_CNTR')">
          <kw-select
            :model-value="searchParams.serviceCenter"
            :options="codes.WARE_DV_CD"
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
          @change="fetchData"
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
      @change="fetchData"
    />
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import {
  codeUtil,
  getComponentType,
  useDataService,
  useMeta,
  defineGrid,
  gridUtil,
  useGlobal,
} from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { notify } = useGlobal();
const { getConfig } = useMeta();
const { t } = useI18n();

const dataService = useDataService();
const baseURI = '/sms/wells/service/assign-exclude-items';
const grdMainRef = ref(getComponentType('KwGrid'));
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = ref(await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'ASN_EXCD_DV_CD',
  'ITM_KND_CD',
  'WARE_DV_CD',
  'WARE_DTL_DV_CD',
));

const searchParams = ref({
  baseYm: dayjs().format('YYYYMMDD'),
  itmPdCd: '',
  itmKndCd: '',
  asnExcdDvCd: '0',
  serviceCenter: '',
});
let cachedParams;

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  console.log(baseURI, cachedParams);
  const res = await dataService.get(baseURI, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: searchData, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const datasSource = view.getDataSource();
  datasSource.setRows(searchData);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function getSaveParams() {
  const checkedValues = ref(gridUtil.getCheckedRowValues(grdMainRef.value.getView()));
  const wareNo = searchParams.value.asnExcdDvCd === '0' ? '300000' : searchParams.value.serviceCenter;
  const { asnExcdDvCd } = searchParams.value;
  checkedValues.value = checkedValues.value.map((v) => ({ ...v, asnExcdDvCd, strWareNo: wareNo }));

  return checkedValues.value;
}

async function onClickSave() {
  const saveParams = await getSaveParams();
  console.log(`saveParams.length :${saveParams.length}`);

  if (saveParams.length > 0) {
    console.log(`saveParams : ${saveParams}`);
    const res = await dataService.put(baseURI, saveParams);
    console.log(`res:${res}`);
  } else {
    notify(t('MSG_ALT_SAV_SEL_DATA'));
  }
}

onMounted(async () => {
  searchParams.value.asnExcdDvCd = '0';
  await fetchData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sapMaptCd', header: t('MSG_TXT_SAP_CD'), width: '124', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '180', styleName: 'text-center' },
    { fieldName: 'itmPdNm', header: t('MSG_TXT_ITM_NM'), width: '380' },
    { fieldName: 'itmKndcd', header: t('MSG_TXT_ITM_DV'), width: '160' },
    { fieldName: 'knd', header: t('MSG_TXT_DIV'), width: '180', styleName: 'text-center' },
    { fieldName: 'strWareNo', header: t('MSG_TXT_CENTER_CD'), width: '190', styleName: 'text-center' },
  ];
  const fields = columns.map((v) => ({ fieldName: v.fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
