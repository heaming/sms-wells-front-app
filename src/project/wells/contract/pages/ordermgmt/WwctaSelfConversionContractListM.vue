<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaSelfConversionContractListM - 만료/자가 전환 조회
3. 작성자 : SAVEMEGOAT
4. 작성일 : 2023-04-02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
      @reset="onReset"
    >
      <kw-search-row :cols="2">
        <kw-search-item
          :label="$t('MSG_TXT_PRD_ENQRY')/* 기간조회 */"
          required
        >
          <kw-select
            v-model="searchParams.periodType"
            :options="periodOptions"
            class="w200"
          />
          <kw-field-wrap v-if="useNmn.activate">
            <kw-input
              v-model="useNmn.min"
              type="number"
              :min="0"
              :clearable="false"
              class="fit"
            />
            <span>~</span>
            <kw-input
              v-model="useNmn.max"
              type="number"
              :min="Math.max(0, useNmn.min)"
              :clearable="false"
              class="fit"
            />
          </kw-field-wrap>
          <kw-date-range-picker
            v-else
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            rules="date_range_required|date_range_months:2"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PDGRP')/* 상품군 */"
        >
          <zwcm-hierarchy-code-select
            v-model:code="searchParams.pdHclsfId"
            v-model:sub-code="searchParams.pdMclsfId"
            :options="codes.PD_HCLSF"
            :sub-options="codes.PD_MCLSF"
            :filter="productSubsetFilter"
            :label="$t('MSG_TXT_PDGRP')"
            first-option="all"
            sub-first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row :cols="4">
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CODE')/* 상품코드 */"
        >
          <kw-input
            v-model="searchParams.pdCd"
            :label="$t('MSG_TXT_PRDT_CODE')/* 상품코드 */"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_NM')/* 상품명 */"
        >
          <kw-input
            v-model="searchParams.pdNm"
            :label="$t('MSG_TXT_PRDT_NM')/* 상품명 */"
          />
        </kw-search-item>
        <kw-search-item
          v-model="searchParams.pdNm"
          :label="$t('MSG_TXT_OG_CD')/* 조직코드 */"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.strtOgCd"
            maxlength="10"
            upper-case
            :rules="{'required': !!searchParams.endOgCd}"
            :custom-messages="{'required': $t('MSG_ALT_CHK_NCSR', [$t('MSG_TXT_OG_CD')])}"
            :label="$t('MSG_TXT_OG_CD')/* 조직코드 */"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.endOgCd"
            maxlength="10"
            upper-case
            :rules="{'required': !!searchParams.strtOgCd}"
            :custom-messages="{'required': $t('MSG_ALT_CHK_NCSR', [$t('MSG_TXT_OG_CD')])}"
            :label="$t('MSG_TXT_OG_CD')/* 조직코드 */"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row :cols="4">
        <kw-search-item
          :label="$t('MSG_TXT_INDI_CORP')/* 개인/법인 */"
        >
          <kw-select
            v-model="searchParams.copnDvCd"
            :label="$t('MSG_TXT_INDI_CORP')/* 개인/법인 */"
            :options="codes.COPN_DV_CD"
            first-option="all"
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
            @change="fetchPage"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON_MCN') /* (단위:원, 개월) */ }}</span>
        </template>

        <kw-btn
          v-permission:download
          dense
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdRef"
        name="grd"
        :visible-rows="10"
        @init="initGrd"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchPage"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------\
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useMeta } from 'kw-lib';
import dayjs from 'dayjs';
import ZwcmHierarchyCodeSelect from '~common/components/ZwcmHierarchyCodeSelect.vue';
import useGridDataModel from '~sms-common/contract/composable/useGridDataModel';

const dataService = useDataService();
const { getConfig } = useMeta();
const { t } = useI18n();

const codes = {
  COPN_DV_CD: [],
  MCHN_CH_TP_CD: [],
};
const router = useRouter();
await Promise.allSettled([
  codeUtil.getMultiCodes('COPN_DV_CD', 'MCHN_CH_TP_CD', 'COD_PAGE_SIZE_OPTIONS')
    .then((multiCodes) => { Object.assign(codes, multiCodes); }),
  dataService.get('/sms/common/contract/products/hclsf')
    .then((response) => { codes.PD_HCLSF = response.data; }),
  dataService.get('/sms/common/contract/products/mclsf')
    .then((response) => { codes.PD_MCLSF = response.data; }),
]);

const periodOptions = [
  {
    codeId: 'RCT_DT',
    codeName: t('MSG_TXT_RCPDT'), /* 접수일자' */
  },
  {
    codeId: 'SL_RCOG_DT',
    codeName: t('MSG_TXT_SL_DT'), /* 매출일자' */
  },
  {
    codeId: 'CAN_DT',
    codeName: t('MSG_TXT_CANC_DT'), /* 취소일자' */
  },
  {
    codeId: 'IST_DT',
    codeName: t('MSG_TXT_IST_DT'), /* 설치일자' */
  },
  {
    codeId: 'EXN_DT',
    codeName: t('MSG_TXT_EXP_DT_1'), /* 만료일자' */
  },
  {
    codeId: 'useNmn',
    codeName: t('MSG_TXT_RENTAL_NMN'), /* 렌탈차월' */
  },
];

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRef = ref(getComponentType('KwGrid'));
const grdView = computed(() => grdRef.value?.getView());
const grdData = computed(() => grdRef.value?.getData());

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;

const searchParams = reactive({
  periodType: periodOptions[0].codeId,
  startDt: dayjs()
    .startOf('M')
    .format('YYYYMMDD'),
  endDt: dayjs()
    .format('YYYYMMDD'),
  pdHclsfId: '',
  pdMclsfId: '',
  pdCd: '',
  pdNm: '',
  strtOgCd: '',
  endOgCd: '',
  copnDvCd: '',
});

// 사용차월을 위한..
const useNmn = reactive({
  activate: computed(() => searchParams.periodType === 'useNmn'),
  min: 0,
  max: 0,
});

function onReset() {
  useNmn.min = 0;
  useNmn.max = 0;
}

const fetchPage = async (pageIndex = pageInfo.value.pageIndex, pageSize = pageInfo.value.pageSize) => {
  const params = {
    ...cachedParams,
    pageIndex,
    pageSize,
  };
  const response = await dataService.get('/sms/wells/contract/contracts/self-conversion/paging', { params });
  console.log(response.data.list);

  pageInfo.value = response.data.pageInfo;
  grdData.value.setRows(response.data.list);
};

function productSubsetFilter(subCode, parentCodeId) {
  return parentCodeId && (subCode.hgrPdClsfId === parentCodeId);
}

async function onClickExcelDownload() {
  if (!cachedParams) {
    cachedParams = { ...toRaw(searchParams) };
  }
  const response = await dataService.get('/sms/wells/contract/contracts/self-conversion/excel-download', { params: cachedParams });
  await gridUtil.exportView(grdView.value, {
    fileName: router.currentRoute?.value.meta?.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}
async function onClickSearch() {
  cachedParams = { ...toRaw(searchParams) };
  if (useNmn.activate) {
    cachedParams.periodType = 'IST_DT';
    cachedParams.startDt = dayjs()
      .subtract(useNmn.max, 'M')
      .startOf('M')
      .format('YYYYMMDD');
    if (useNmn.min === 0) {
      cachedParams.endDt = dayjs().format('YYYYMMDD');
    } else {
      cachedParams.endDt = dayjs()
        .subtract(useNmn.min, 'M')
        .endOf('M')
        .format('YYYYMMDD');
    }
  }
  pageInfo.value.pageIndex = 1;
  await fetchPage(1);
}

/// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrd = defineGrid((data, view) => {
  function getBeforeMonthsFromNow(dtmString) {
    const targetDay = dayjs(dtmString, 'YYYY-MM-DD')
      .startOf('M');
    return dayjs()
      .startOf('M')
      .diff(targetDay, 'M');
  }
  useGridDataModel(view, {
    contract: {
      type: String,
      label: t('MSG_BTN_CNTRW') /* 계약서' */,
      displaying: {
        value: '계약서',
        renderer: {
          type: 'button',
          hideWhenEmpty: false,
        },
        visible: false,
      },
    },
    cntrNo: { displaying: false },
    cntrSn: { displaying: false },
    cntrNoSn: {
      type: String,
      label: t('MSG_TXT_CNTR_DTL_NO') /* 계약상세번호' */,
      width: 150,
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const cntrNo = values[fields.indexOf('cntrNo')];
        const cntrSn = values[fields.indexOf('cntrSn')];
        if (!cntrNo) { return ''; }
        return `${cntrNo}${cntrSn ? `-${cntrSn}` : ''}`;
      },
      classes: 'text-center',
    },
    copnDvCd: {
      label: t('MSG_TXT_INDI_CORP') /* 개인/법인' */,
      width: 110,
      options: codes.COPN_DV_CD,
    },
    istDt: {
      label: t('MSG_TXT_INST_DT') /* 설치일' */,
      width: '110',
      datetimeFormat: 'date',
    },
    useNmn: {
      type: Number,
      label: t('MSG_TXT_USE_NMN') /* 사용차월' */,
      width: '110',
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const istDt = values[fields.indexOf('istDt')];
        return getBeforeMonthsFromNow(istDt);
      },
    },
    cntrCstNo: {
      label: t('MSG_TXT_CNTOR_CST_NO') /* 계약자 고객번호' */,
      width: '110',
      classes: 'text-center',
    },
    cstKnm: {
      label: t('MSG_TXT_CNTOR_NM') /* 계약자명' */,
      width: '110',
      classes: 'text-center',
    },
    cralLocaraTno: { displaying: false },
    mexnoEncr: { displaying: false },
    cralIdvTno: { displaying: false },
    cntrtTno: {
      label: `${t('MSG_TXT_CNTRT')} ${t('MSG_TXT_MPNO')}` /* 계약자 휴대전화번호' */,
      width: 180,
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const tno1 = values[fields.indexOf('cralLocaraTno')];
        const tno2 = values[fields.indexOf('mexnoEncr')];
        const tno3 = values[fields.indexOf('cralIdvTno')];
        return (tno1 && tno2 && tno3) ? `${tno1}-${tno2}-${tno3}` : '';
      },
      classes: 'text-center',
    },
    rcgvpKnm: {
      label: t('MSG_TXT_IST_NM') /* 설치자명' */,
      width: 110,
      classes: 'text-center',
    },
    rcgvpCralLocaraTno: { displaying: false },
    rcgvpMexnoEncr: { displaying: false },
    rcgvpCralIdvTno: { displaying: false },
    istllTno: {
      label: `${t('MSG_TXT_INSTR')} ${t('MSG_TXT_MPNO')}` /* 설치자 휴대전화번호' */,
      width: 180,
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const tno1 = values[fields.indexOf('rcgvpCralLocaraTno')];
        const tno2 = values[fields.indexOf('rcgvpMexnoEncr')];
        const tno3 = values[fields.indexOf('rcgvpCralIdvTno')];
        return (tno1 && tno2 && tno3) ? `${tno1}-${tno2}-${tno3}` : '';
      },
      classes: 'text-center',
    },
    pdHclsfNm: { displaying: false },
    pdMclsfNm: { displaying: false },
    pdCd: {
      label: t('MSG_TXT_PRDT_CODE') /* 제품코드' */,
      width: 110,
    },
    pdNm: {
      label: t('MSG_TXT_PRDT_NM') /* 상품명' */,
      width: 222,
    },
    sdingPdNm: {
      label: `${t('MSG_TXT_WELSF_SDING')}(${t('MSG_TXT_USING')})`, /* 웰스팜모종(사용중) */
      width: 287,
    },
    fnlAmt: {
      type: Number,
      label: `${t('MSG_TXT_RTLFE')}(${t('MSG_TXT_MPY_ING')})` /* 렌탈료(납부중인) */,
      width: 130,
    },
    stplPtrm: {
      type: Number,
      label: t('MSG_TXT_LCK_IN_PRD_MN') /* 의무사용기간' */,
      width: 184,
    },
    lastBsDt: {
      label: `${t('MSG_TXT_TLST')}BS${t('MSG_TXT_D')}`, /* 마지막BS일 */
      width: 144,
      datetimeFormat: 'date',
    },
    eotUcAmt: {
      type: Number,
      label: t('MSG_TXT_UC_AMT') /* 미수금액' */,
      width: 130,
    },
    eotDlqAmt: {
      type: Number,
      label: t('MSG_TXT_DLQ_AMT') /* 연체금액' */,
      width: 130,
    },
    dlqAcuMcn: {
      type: Number,
      label: t('MSG_TXT_DLQ') /* 연체' */,
      width: 130,
    },
    cntrPdStrtdt: {
      label: `${t('MSG_TXT_MEMBERSHIP')} ${t('MSG_TXT_SUBS_DT')}` /* 멤버십 가입일' */,
      width: 144,
      datetimeFormat: 'date',
    },
    cntrPdEnddt: {
      label: `${t('MSG_TXT_MEMBERSHIP')} ${t('MSG_TXT_WTDR_DT')}` /* 멤버십 탈퇴일' */,
      width: 144,
      datetimeFormat: 'date',
    },
    mchnChYn: {
      label: t('MSG_TXT_CHDVC_YN') /* 기변여부' */,
      width: 144,
      classes: 'text-center',
    },
    reRetalYn: {
      label: t('MSG_TXT_RE_RENTAL_YN') /* 재렌탈 여부' */,
      width: 144,
      classes: 'text-center',
    },
    mchnChTpCd: {
      label: t('MSG_TXT_CHDVC_TP') /* 기변유형' */,
      width: 144,
      classes: 'text-center',
    },
    mchnChTpNm: {
      label: t('MSG_TXT_CHDVC_TP') + t('MSG_TXT_NM') /* 기변유형명' */,
      width: 144,
      valueExpression: "values['mchnChTpCd']",
      options: codes.MCHN_CH_TP_CD,
    },
    chCntrNoSn: {
      type: String,
      label: t('MSG_TXT_CHNG_PTY_CD') /* 기변상대코드' */,
      classes: 'text-center',
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const chCntrNo = values[fields.indexOf('chCntrNo')];
        const chCntrSn = values[fields.indexOf('chCntrSn')];
        if (!chCntrNo) { return ''; }
        return `${chCntrNo}${chCntrSn ? `-${chCntrSn}` : ''}`;
      },
    },
    chCntrNo: { displaying: false },
    chCntrSn: { displaying: false },
    chPdNm: {
      label: t('MSG_TXT_CHDVC_PD_NM') /* 기변상품명' */,
      width: 262,
    },
    stplRcpDtm: {
      label: `${t('MSG_TXT_RSTL')} ${t('MSG_TXT_RCP_D')}` /* 재약정 접수일' */,
      width: 144,
      datetimeFormat: 'date',
    },
    stplStrtdt: {
      label: `${t('MSG_TXT_RSTL')} ${t('MSG_TXT_START_DATE')}` /* 재약정 시작일' */,
      width: 144,
      datetimeFormat: 'date',
    },
    stplCanDtm: {
      label: `${t('MSG_TXT_RSTL')} ${t('MSG_TXT_CAN_D')}` /* 재약정 취소일' */,
      width: 144,
      datetimeFormat: 'date',
    },
  });
  view.rowIndicator.visible = true;
});

</script>
