<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaBelongPartnerChoiceListP - 소속 파트너 선택
3. 작성자 : gs.piit159
4. 작성일 : 2023.03.21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 소속 파트너 선택 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
  >
    <kw-search
      :cols="2"
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PTNR_NAME')"
        >
          <kw-input
            v-model="searchParams.prtnrKnm"
            maxlength="50"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRTNR_NUM')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            maxlength="10"
          />
        </kw-search-item>
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
    </kw-action-top>

    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :visible-rows="8"
      @init="initGrid"
    />

    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />

    <template #action>
      <kw-btn
        :label="$t('MSG_BTN_CLOSE')"
        primary
        @click="onClickClose"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useMeta, useModal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const { ok, cancel: onClickClose } = useModal();
const dataService = useDataService();
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);
const props = defineProps({
  dsmnPrtnrNo: { type: String },
  ogTpCd: { type: String },
});
const grdMainRef = ref(getComponentType('KwGrid'));
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const searchParams = ref({
  dsmnPrtnrNo: props.dsmnPrtnrNo,
  ogTpCd: props.ogTpCd,
  prtnrKnm: '',
  prtnrNo: '',
});
let cachedParams;

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/contracts/district-manager-partners/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: partners, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  if (partners.length === 1) ok(partners[0]);

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(partners);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

onMounted(async () => {
  await onClickSearch();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dgr1LevlOgNm' },
    { fieldName: 'dgr2LevlOgNm' },
    { fieldName: 'dgr3LevlOgNm' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'ogTpCd' },
  ];

  const columns = [
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: 150 },
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: 150 },
    { fieldName: 'dgr3LevlOgNm', header: t('MSG_TXT_BRANCH'), width: 150 },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PTNR_NAME'), width: 80 },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NUM'), width: 100, styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.onCellClicked = (grid, clickData) => {
    if (clickData.cellType === 'data') {
      ok(gridUtil.getCurrentRowValue(view));
    }
  };
});

</script>
