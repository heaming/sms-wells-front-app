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
            v-model.trim="searchParams.cntrCstKnm"
            :label="$t('MSG_TXT_CNTOR_NM')"
            maxlength="50"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_IST_NM')"
        >
          <kw-input
            v-model.trim="searchParams.istCstKnm"
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
          :label="$t('MSG_TXT_SELL_TP_CD')"
        >
          <kw-select
            v-model="searchParams.sellTpCd"
            :label="$t('MSG_TXT_SELL_TP_CD')"
            :options="codes.SELL_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CST_NO')"
        >
          <kw-input
            v-model.trim="searchParams.cntrCstNo"
            :label="$t('MSG_TXT_CST_NO')"
            icon="search"
            :on-click-icon="onClickSearchCntrCst"
            :on-keydown-no-click="true"
            maxlength="10"
            rules="max:10|numeric"
            @keydown.enter="onClickSearch"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
        >
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            disable-popup
          />
        </kw-search-item>
      </kw-search-row>
      <template #action>
        <kw-btn
          ref="resetBtn"
          v-permission:read
          :label="$t('MSG_BTN_INTL', null, '초기화')"
          :class="$g.platform.is.mobile ? 'w64' : 'w90'"
          secondary
          dense
          @click="onClickReset"
        />
        <kw-btn
          ref="searchBtn"
          v-permission:read
          :label="$t('MSG_TXT_SRCH', null, '조회')"
          :class="$g.platform.is.mobile ? 'w64' : 'w90'"
          color="secondary"
          border-color="secondary"
          text-color="bg-white"
          dense
          type="submit"
        />
      </template>
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
import {
  alert,
  codeUtil,
  defineGrid,
  getComponentType,
  gridUtil,
  useDataService,
  useGlobal,
  useMeta,
  useModal,
} from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const dataService = useDataService();
const { modal } = useGlobal();
const { getConfig } = useMeta();
const { t } = useI18n();
const { ok, cancel: onClickClose } = useModal();
const props = defineProps({
  cntrCstKnm: { type: String, default: undefined },
  istCstKnm: { type: String, default: undefined },
  cralLocaraTno: { type: String, default: undefined },
  mexnoEncr: { type: String, default: undefined },
  cralIdvTno: { type: String, default: undefined },
  sellTpCd: { type: String, default: undefined },
  cntrCstNo: { type: String, default: undefined },
  cntrNo: { type: String, default: undefined },
  cntrSn: { type: Number, default: undefined },
});
const grdMainRef = ref(getComponentType('KwGrid'));
const grdData = computed(() => grdMainRef.value?.getData());
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'SELL_TP_CD',
);
let cachedParams;
const searchParams = ref({
  cntrCstKnm: props.cntrCstKnm,
  istCstKnm: props.istCstKnm,
  cralLocaraTno: props.cralLocaraTno,
  mexnoEncr: props.mexnoEncr,
  cralIdvTno: props.cralIdvTno,
  sellTpCd: props.sellTpCd,
  cntrCstNo: props.cntrCstNo,
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
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
async function onClickReset() {
  // 기존 로직을 form 기반 reset 을 안쓰려면
  // 아예 다른 동작을 하는 버튼을 만드는 것이 정답일 것 같습니다.
  searchParams.value.cntrCstKnm = '';
  searchParams.value.lrnnCstKnm = '';
  searchParams.value.cralLocaraTno = '';
  searchParams.value.mexnoEncr = '';
  searchParams.value.cralIdvTno = '';
  searchParams.value.sellTpCd = '';
  searchParams.value.cntrCstNo = '';
  searchParams.value.cntrNo = '';
  searchParams.value.cntrSn = undefined;
}

function checkSearchParamIsNotEmpty(needAlertWhenEmpty) {
  const notEmpty = Object.values(searchParams.value).some((val) => !isEmpty(val));
  if (needAlertWhenEmpty && !notEmpty) {
    alert(t('MSG_ALT_INQR_CNDT_AT_LEAST_ONE'));
  }
  return notEmpty;
}

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
  if (!checkSearchParamIsNotEmpty(true)) { return; }

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

if (checkSearchParamIsNotEmpty()) {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrCnfmDtm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'sellTpDtlCd' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'cntrCstKnm' },
    { fieldName: 'istCstKnm' },
    { fieldName: 'memCntrNo' },
    { fieldName: 'memCntrSn' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
  ];

  const columns = [
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_CNTR_DATE'), width: 100, styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: 100, options: codes.SELL_TP_CD },
    { fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: 140,
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      },
    },
    { fieldName: 'cntrCstKnm', header: t('MSG_TXT_CNTOR_NM'), width: 80, styleName: 'text-center' },
    { fieldName: 'istCstKnm', header: t('MSG_TXT_IST_NM'), width: 80, styleName: 'text-center' },
    { fieldName: 'memCntrNo',
      header: '멤버십번호',
      width: 140,
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { memCntrNo, memCntrSn } = grid.getValues(index.itemIndex);
        return (memCntrNo && memCntrSn) ? `${memCntrNo}-${memCntrSn}` : '';
      },
    },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: 250 },
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
