<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaMshRstlOjCstListP - 멤버십/재약정 대상고객 조회
3. 작성자 : gs.piit159
4. 작성일 : 2023.03.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 재약정 대상고객 조회 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <kw-search
      :cols="0"
      @search="onSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CONTR_TYPE')"
          required
        >
          <kw-select
            v-model="searchParams.cntrTpCd"
            :label="$t('MSG_TXT_CONTR_TYPE')"
            :options="codes.CNTR_TP_CD"
            :disable="!!props.cntrTpCd"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CNTRT_TP')"
          required
        >
          <kw-select
            v-model="searchParams.copnDvCd"
            :label="$t('MSG_TXT_CNTRT_TP')"
            :options="codes.COPN_DV_CD"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CST_NM')"
        >
          <kw-input
            v-model="searchParams.cstKnm"
            :label="$t('MSG_TXT_CST_NM')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_MPNO')"
        >
          <kw-input
            v-model:tel-no0="searchParams.cralLocaraTno"
            v-model:tel-no1="searchParams.mexnoEncr"
            v-model:tel-no2="searchParams.cralIdvTno"
            mask="telephone"
            :label="$t('MSG_TXT_MPNO')"
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
          @change="fetchPage"
        />
      </template>
    </kw-action-top>
    <kw-grid
      ref="grdRef"
      :visible-rows="5"
      visible="true"
      @init="initGrd"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchPage"
    />
    <template #action>
      <kw-btn
        :label="$t('MSG_BTN_CLOSE')/* 닫기 */"
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
import useGridDataModel from '~sms-common/contract/composable/useGridDataModel';
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useMeta, useModal } from 'kw-lib';

const props = defineProps({
  cntrTpCd: { type: String, required: true },
  prtnrNo: { type: String, required: true },
  ogTpCd: { type: String, required: true },
  copnDvCd: { type: String, required: true },
});

const { ok, cancel } = useModal();
const { getConfig } = useMeta();
const { t } = useI18n();
const dataService = useDataService();
const codes = await codeUtil.getMultiCodes(
  'COPN_DV_CD',
  'SEX_DV_CD',
);
codes.CNTR_TP_CD = [
  {
    codeId: '1',
    codeName: t('MSG_TXT_MMBR') /* 멤버쉽 */,
    url: '/sms/wells/contract/membership/customers/paging',
  },
  {
    codeId: '2',
    codeName: t('MSG_TXT_RSTL') /* 재약정 */,
    url: '/sms/wells/contract/re-stipulation/customers/paging',
  },
]; /* 의도적 하드 코딩 : 요청사항! */

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRef = ref(getComponentType('KwGrid'));
const grdData = computed(() => grdRef.value?.getData());
const grdView = computed(() => grdRef.value?.getView());

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
const searchParams = reactive({
  cntrTpCd: codes.CNTR_TP_CD[0].codeId,
  copnDvCd: '1',
  cstKnm: '',
  cralLocaraTno: '',
  mexnoEncr: '',
  cralIdvTno: '',
});

async function fetchPage(pageIndex = pageInfo.value.pageIndex, pageSize = pageInfo.value.pageSize) {
  const params = {
    ...cachedParams,
    pageIndex,
    pageSize,
  };

  const response = await dataService.get(
    codes.CNTR_TP_CD[codes.CNTR_TP_CD.findIndex((code) => code.codeId === params.cntrTpCd)].url,
    { params },
  );

  pageInfo.value = response.data.pageInfo;
  grdData.value.setRows(response.data.list);
  grdView.value.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onSearch() {
  cachedParams = { ...toRaw(searchParams) };
  pageInfo.value.pageIndex = 1;
  await fetchPage(1);
}

function onClickClose() {
  cancel();
}

onMounted(async () => {
  searchParams.cntrTpCd = props.cntrTpCd;
  searchParams.prtnrNo = props.prtnrNo;
  searchParams.ogTpCd = props.ogTpCd;
  searchParams.copnDvCd = props.copnDvCd;
  await onSearch();
});

const initGrd = defineGrid((data, view) => {
  useGridDataModel(view, {
    sellTpCd: { displaying: false },
    cntrDtlStatCd: { displaying: false },
    copnDvCd: {
      label: t('MSG_TXT_CNTRT_TP') /* 계약자유형' */,
      width: 80,
      options: codes.COPN_DV_CD,
    },
    cntrCstNo: { label: t('MSG_TXT_CST_NO') /* 고객번호' */, width: 100, classes: 'text-center' },
    bzrno: { displaying: false },
    cntrNo: { displaying: false },
    cntrSn: { displaying: false },
    cntrNoSn: {
      label: t('MSG_TXT_CNTR_NO'), /* 계약번호 */
      valueExpression: 'values["cntrNo"] + "-" + values["cntrSn"]',
      classes: 'text-center',
      width: 150,
    },
    cstKnm: { label: t('MSG_TXT_CST_NM') /* 고객명' */, width: '99', classes: 'text-center' },
    sexDvCd: { label: t('MSG_TXT_GENDER') /* 성별' */, width: '67', options: codes.SEX_DV_CD },
    bryyMmdd: { label: t('MSG_TXT_BIRTH_DATE') /* 생년월일' */, width: '96', datetimeFormat: 'date' },
    cralLocaraTno: { displaying: false },
    mexnoEncr: { displaying: false },
    cralIdvTno: { displaying: false },
    cntrtTno: {
      label: `${t('MSG_TXT_CNTRT')} ${t('MSG_TXT_MPNO')}` /* 계약자 휴대전화번호' */,
      width: 130,
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const tno1 = values[fields.indexOf('cralLocaraTno')];
        const tno2 = values[fields.indexOf('mexnoEncr')];
        const tno3 = values[fields.indexOf('cralIdvTno')];
        return (tno1 && tno2 && tno3) ? `${tno1}-${tno2}-${tno3}` : '';
      },
      classes: 'text-center',
    },
    pdNm: { label: t('MSG_TXT_PRDT_NM') /* 상품명' */, width: 240, classes: 'text-left' },
    stplPtrm: {
      label: t('MSG_TXT_CNTR_PTRM') /* 계약기간' */,
      type: Number,
      width: 80,
      classes: 'text-right',
    },
    dlqYn: { label: t('MSG_TXT_DLQ') /* 연체 */, width: '68', classes: 'text-center' },
  });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellDblClicked = (g, clickData) => {
    if (clickData.cellType === 'data') {
      const currentRowData = gridUtil.getCurrentRowValue(view);
      return ok(currentRowData);
    }
  };
});
</script>
