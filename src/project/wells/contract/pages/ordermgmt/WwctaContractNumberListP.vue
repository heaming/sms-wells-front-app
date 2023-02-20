<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaContractNumberListP - 계약번호 조회(wells)
3. 작성자 : sc
4. 작성일 : 2023.02.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
타 화면에서 계약번호를 조회하기 위한 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
  >
    <kw-search
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CNTOR_NM')"
        >
          <kw-input
            v-model="searchParams.cntrCstKnm"
            icon="search"
            :on-click-icon="onClickSearchCntrCstKnm"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_IST_NM')"
        >
          <kw-input
            v-model="searchParams.istCstKnm"
            icon="search"
            :on-click-icon="onClickSearchistCstKnm"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MPNO')"
        >
          <zwcm-telephone-number
            v-model:tel-no1="searchParams.cralLocaraTno"
            v-model:tel-no2="searchParams.mexnoEncr"
            v-model:tel-no3="searchParams.cralIdvTno"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CST_NO')"
        >
          <kw-input
            v-model="searchParams.cntrCstNo"
            icon="search"
            :on-click-icon="onClickSearchCntrCstNo"
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
      :visible-rows="10"
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
        negative
        @click="onClickClose"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta, useModal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';

const dataService = useDataService();

const { modal } = useGlobal();
const { getConfig } = useMeta();
const { t } = useI18n();
const { ok, cancel: onClickClose } = useModal();

const props = defineProps({
  cntrCstKnm: { type: String },
  istCstKnm: { type: String },
  cralLocaraTno: { type: String },
  mexnoEncr: { type: String },
  cralIdvTno: { type: String },
  cntrCstNo: { type: String },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

let cachedParams;
const searchParams = ref({
  cntrCstKnm: props.cntrCstKnm,
  istCstKnm: props.istCstKnm,
  cralLocaraTno: props.cralLocaraTno,
  mexnoEncr: props.mexnoEncr,
  cralIdvTno: props.cralIdvTno,
  cntrCstNo: props.cntrCstNo,
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/contracts/numbers/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: details, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(details);
  view.resetCurrent();
}

async function onClickSearch() {
  // 조회조건 검증
  let allParamsEmpty = true;
  Object.values(searchParams.value).forEach((val) => {
    if (!isEmpty(val)) allParamsEmpty = false;
  });
  if (allParamsEmpty) {
    // 모든 조회조건이 empty라면 에러
    await alert(t('MSG_ALT_INQR_CNDT_AT_LEAST_ONE'));
    return;
  }

  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickSearchCntrCstKnm() {
  const res = await modal({ component: 'ZwcsaCustomerListP' });
  if (res.result && res.payload) searchParams.cntrCstKnm(res.payload.cstNm);
}

async function onClickSearchistCstKnm() {
  const res = await modal({ component: 'ZwcsaCustomerListP' });
  if (res.result && res.payload) searchParams.istCstKnm(res.payload.cstNm);
}

async function onClickSearchCntrCstNo() {
  const res = await modal({ component: 'ZwcsaCustomerListP' });
  if (res.result && res.payload) searchParams.cntrCstNo(res.payload.cstNo);
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrCnfmDtm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrCstKnm' },
    { fieldName: 'istCstKnm' },
    { fieldName: 'pdNm' },
  ];

  const columns = [
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_CNTR_DATE'), width: 130, styleName: 'text-center' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: 150, styleName: 'text-center' },
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: 100, styleName: 'text-center' },
    { fieldName: 'cntrCstKnm', header: t('MSG_TXT_CNTOR_NM'), width: 100, styleName: 'text-center' },
    { fieldName: 'istCstKnm', header: t('MSG_TXT_IST_NM'), width: 100, styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: 400 },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = false;

  view.onCellDblClicked = (grid, clickData) => {
    if (clickData.cellType === 'data') {
      const { cntrNo, cntrSn } = gridUtil.getCurrentRowValue(view);
      ok({ cntrNo, cntrSn });
    }
  };
});
</script>
