<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaRestipulationTargetCstListP - 재약정 대상고객 조회
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
          :label="$t('MSG_TXT_NAME')"
        >
          <kw-input
            v-model="searchParams.cstKnm"
            :label="$t('MSG_TXT_NAME')"
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
        <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
      </template>
    </kw-action-top>
    <kw-grid
      ref="grdRef"
      :visible-rows="10"
      visible="true"
      @init="initGrd"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="onChangePageInfo"
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
import {
  codeUtil,
  defineGrid,
  getComponentType,
  gridUtil,
  useDataService,
  useMeta,
  useModal,
} from 'kw-lib';

const { ok, cancel } = useModal();
const { getConfig } = useMeta();
const { t } = useI18n();
const dataService = useDataService();
const codes = await codeUtil.getMultiCodes(
  'COPN_DV_CD',
  'SEX_DV_CD',
);
codes.CNTR_TP_CD = [
  { codeId: '1', codeName: t('MSG_TXT_MMBR') /* 멤버쉽 */ },
  { codeId: '2', codeName: t('MSG_TXT_RSTL') /* 재약정 */ },
]; /* 의도적 하드 코딩 : 요청사항! */

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRef = ref(getComponentType('KwGrid'));
const grdData = computed(() => grdRef.value?.getData());

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
const searchParams = reactive({
  cntrTpCd: codes.CNTR_TP_CD[0].codeId,
  copnDvCd: codes.COPN_DV_CD[0].codeId,
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
  const response = await dataService.get('/sms/wells/contract/renewal-membership-customers', { params });

  pageInfo.value = response.data.pageInfo;
  grdData.value.setRows(response.data.list);
}
async function onSearch() {
  cachedParams = { ...toRaw(searchParams) };
  console.log(cachedParams);
  await fetchPage(1);
}

function onClickClose() {
  cancel();
}

const initGrd = defineGrid((data, view) => {
  useGridDataModel(view, {
    sellTpCd: { displaying: false },
    cntrDtlStatCd: { displaying: false },
    copnDvCd: { label: t('MSG_TXT_CNTRT_TP') /* 계약자유형' */, width: '104', options: codes.COPN_DV_CD },
    cntrCstNo: { label: t('MSG_TXT_CST_NO') /* 고객번호' */, width: '131', classes: 'text-center' },
    cntrNo: { displaying: false },
    cntrSn: { displaying: false },
    cntrNoSn: {
      label: t('MSG_TXT_CNTR_NO'), /* 계약번호 */
      valueExpression: 'values["cntrNo"] + "-" + values["cntrSn"]',
      classes: 'text-center',
      width: '131',
    },
    cstKnm: { label: t('MSG_TXT_CST_NM') /* 고객명' */, width: '99', classes: 'text-center' },
    sexDvCd: { label: t('MSG_TXT_GENDER') /* 성별' */, width: '67', options: codes.SEX_DV_CD },
    bryyMmdd: { label: t('MSG_TXT_BIRTH_DATE') /* 생년월일' */, width: '96', datetimeFormat: 'date' },
    cralLocaraTno: { displaying: false },
    mexnoEncr: { displaying: false },
    cralIdvTno: { displaying: false },
    cntrtTno: {
      label: `${t('MSG_TXT_CNTRT')} ${t('MSG_TXT_MPNO')}` /* 계약자 휴대전화번호' */,
      width: 131,
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const tno1 = values[fields.indexOf('cralLocaraTno')];
        const tno2 = values[fields.indexOf('mexnoEncr')];
        const tno3 = values[fields.indexOf('cralIdvTno')];
        return (tno1 && tno2 && tno3) ? `${tno1}-${tno2}-${tno3}` : '';
      },
      classes: 'text-center',
    },
    pdNm: { label: t('MSG_TXT_PRDT_NM') /* 상품명' */, width: '235', classes: 'text-left' },
    stplPtrm: { label: t('MSG_TXT_CNTR_PTRM') /* 계약기간' */, type: Number, width: '99', classes: 'text-right' },
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

fetchPage();
</script>
