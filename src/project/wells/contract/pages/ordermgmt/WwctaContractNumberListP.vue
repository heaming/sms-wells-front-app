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
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CNTOR_NM')"
        >
          <kw-input
            v-model="searchParams.cntrCstKnm"
            :label="$t('MSG_TXT_CNTOR_NM')"
            icon="search"
            :on-click-icon="onClickSearchCntrCst"
            :on-keydown-no-click="true"
            maxlength="50"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_IST_NM')"
        >
          <kw-input
            v-model="searchParams.istCstKnm"
            :label="$t('MSG_TXT_IST_NM')"
            maxlength="50"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_MPNO')"
        >
          <kw-input
            v-model:telNo0="searchParams.cralLocaraTno"
            v-model:telNo1="searchParams.mexnoEncr"
            v-model:telNo2="searchParams.cralIdvTno"
            :label="$t('MSG_TXT_MPNO')"
            mask="telephone"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CST_NO')"
        >
          <kw-input
            v-model="searchParams.cntrCstNo"
            :label="$t('MSG_TXT_CST_NO')"
            icon="search"
            :on-click-icon="onClickSearchCntrCst"
            :on-keydown-no-click="true"
            maxlength="10"
            rules="max:10|numeric"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
          colspan="2"
        >
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            disable-popup="true"
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
      :visible-rows="5"
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
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

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
  cntrNo: { type: String },
  cntrSn: { type: Number },
});
const grdMainRef = ref(getComponentType('KwGrid'));
const grdData = computed(() => grdMainRef.value?.getData());
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);
let cachedParams;
const searchParams = ref({
  cntrCstKnm: '',
  istCstKnm: '',
  cralLocaraTno: '',
  mexnoEncr: '',
  cralIdvTno: '',
  cntrCstNo: '',
  cntrNo: '',
  cntrSn: '',
});
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
let initGridData = [];

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/contracts/numbers/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: cntrs, pageInfo: pagingResult } = res.data;

  if (cntrs.length === 1 && pageInfo.value.pageIndex === 1) ok(cntrs[0]);
  pageInfo.value = pagingResult;

  if (grdData.value) {
    grdData.value.setRows(cntrs);
  } else {
    initGridData = cntrs;
  }
}

async function onClickSearch() {
  // 조회조건 검증
  if (Object.values(searchParams.value).every((val) => isEmpty(val))) {
    await alert(t('MSG_ALT_INQR_CNDT_AT_LEAST_ONE'));
    return;
  }

  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickSearchCntrCst() {
  const res = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: {
      cstNo: searchParams.value.cntrCstNo,
    },
  });
  if (res.result && res.payload) {
    searchParams.value.cntrCstKnm = res.payload.name;
    searchParams.value.cntrCstNo = res.payload.cstNo;
  }
}

onMounted(async () => {
  Object.keys(props).forEach((attr) => {
    if (props[attr]) {
      searchParams.value[attr] = props[attr];
    }
  });
  if (Object.values(searchParams.value).some((val) => !isEmpty(val))) {
    cachedParams = cloneDeep(searchParams.value);
    await fetchData();
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrCnfmDtm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'cntrCstKnm' },
    { fieldName: 'istCstKnm' },
    { fieldName: 'pdNm' },
  ];

  const columns = [
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_CNTR_DATE'), width: 130, styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: 150, styleName: 'text-center' },
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: 100, styleName: 'text-right' },
    { fieldName: 'cntrCstKnm', header: t('MSG_TXT_CNTOR_NM'), width: 100, styleName: 'text-center' },
    { fieldName: 'istCstKnm', header: t('MSG_TXT_IST_NM'), width: 100, styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: 300 },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = false;

  view.onCellDblClicked = (grid, clickData) => {
    if (clickData.cellType === 'data') {
      ok(gridUtil.getCurrentRowValue(view));
    }
  };
  data.setRows(initGridData);
});
</script>
