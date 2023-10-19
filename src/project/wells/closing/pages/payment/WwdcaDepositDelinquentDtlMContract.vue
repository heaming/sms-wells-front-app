<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcaDepositDelinquentDtlMContract - 입금 연체 상세-계약별 상세조회 - W-CL-U-0017M01
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.05.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 입금 연체 상세-계약별 상세조회
****************************************************************************************************
---->
<template>
  <kw-search
    :cols="3"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_PERF_YM')"
        required
      >
        <kw-date-picker
          v-model="searchParams.perfYm"
          :label="$t('MSG_TXT_PERF_YM')"
          rules="required"
          type="month"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_SEL_TYPE')"
      >
        <kw-select
          v-model="searchParams.sellTpCd"
          :label="$t('MSG_TXT_SEL_TYPE')"
          :options="codes.SELL_TP_CD"
          first-option="all"
          first-option-value="ALL"
        />
        <kw-select
          v-if="searchParams.sellTpCd === '1' || searchParams.sellTpCd === '2'
            || searchParams.sellTpCd === '3' || searchParams.sellTpCd === '6'"
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD.filter(v => v.userDfn02 === searchParams.sellTpCd)"
          first-option="all"
          first-option-value="ALL"
        />
        <kw-select
          v-else
          v-model="searchParams.sellTpDtlCd"
          :readonly="true"
          :options="codes.SELL_TP_DTL_CD"
          first-option="all"
          first-option-value="ALL"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_INDV_CRP_DV')">
        <kw-select
          v-model="searchParams.copnDvCd"
          :options="codes.COPN_DV_CD"
          first-option="all"
          first-option-value="ALL"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_OG_TP')">
        <kw-select
          v-model="searchParams.ogTp"
          first-option="all"
          first-option-value="ALL"
          :options="ogTpCd"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_OG_LEVL')"
        :colspan="2"
      >
        <zwogz-level-select
          v-model:og-levl-dv-cd1="searchParams.dgr1LevlOgCd"
          v-model:og-levl-dv-cd2="searchParams.dgr2LevlOgCd"
          v-model:og-levl-dv-cd3="searchParams.dgr3LevlOgCd"
          :og-tp-cd="searchParams.ogTp"
          :start-level="1"
          :end-level="3"
          :base-ym="searchParams.perfYm"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_DLQ_DV') + '(' + $t('MSG_TXT_LSTMM') + ')'">
        <kw-select
          v-model="searchParams.dlqDv"
          :options="selectDlqDv.options"
          first-option="all"
          first-option-value="ALL"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_DLQ_MCNT') + '(' + $t('MSG_TXT_LSTMM') + ')'">
        <kw-option-group
          v-model="searchParams.dlqMcnt"
          :disable="searchParams.dlqDv === 'ALL' || searchParams.dlqDv === '1'"
          :options="selectDlqMcnt.options"
          type="checkbox"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_SEQUENCE_NUMBER')">
        <kw-input
          v-model="searchParams.prtnrNo"
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          icon="search"
          clearable
          rules="numeric"
          @click-icon="onClickSearchPntnrNo"
        />
      </kw-search-item>

      <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
        <zctz-contract-detail-number
          v-model:cntr-no="searchParams.cntrNo"
          v-model:cntr-sn="searchParams.cntrSn"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_CST_NO')">
        <kw-input
          v-model="searchParams.cntrCstNo"
          :label="$t('MSG_TXT_CST_NO')"
          icon="search"
          clearable
          rules="numeric"
          @click-icon="onClickSearchCustomer"
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
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <kw-btn
        v-permission:download
        icon="download_on"
        :disable="pageInfo.totalCount === 0"
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        @click="onClickExportView"
      />
    </kw-action-top>

    <kw-grid
      ref="grdDetailRef"
      name="grdDetail"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrdDetail"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, useDataService, useGlobal, useMeta, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import ZwogzLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const now = dayjs();
const { t } = useI18n();
const { modal } = useGlobal();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdDetailRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
  'DP_TP_CD',
  'OG_TP_CD',
  'COPN_DV_CD',
  'RSB_DV_CD',
);

const selectDlqDv = { // 연체구분
  options: [{ codeId: '1', codeName: t('MSG_TXT_NOM') }, { codeId: '2', codeName: t('MSG_TXT_DLQ') }],
};

const selectDlqMcnt = { // 연체개월
  options: [{ codeId: '0', codeName: t('MSG_TXT_0NMN') }, { codeId: '1', codeName: t('MSG_TXT_1NMN') }, { codeId: '2', codeName: t('MSG_TXT_2NMN') },
    { codeId: '3', codeName: t('MSG_TXT_3NMN') }, { codeId: '4', codeName: t('MSG_TXT_4NMN') }, { codeId: '5', codeName: t('MSG_TXT_5NMN') },
    { codeId: '6', codeName: t('MSG_TXT_6NMN') }, { codeId: '7', codeName: t('MSG_TXT_7NMN') + t('MSG_TXT_MRTN') }],
};

const ogTpCd = codes.OG_TP_CD.filter((v) => ['W01', 'W02'].includes(v.codeId));

const searchParams = ref({
  perfYm: now.format('YYYYMM'), // 실적년월
  dlqDv: 'ALL', // 연체구분
  dlqMcnt: [], // 연체개월
  sellTpCd: 'ALL', // 판매유형
  sellTpDtlCd: 'ALL', // 판매유형상세
  ogTp: 'ALL', // 조직유형
  dgr1LevlOgCd: '',
  dgr2LevlOgCd: '',
  dgr3LevlOgCd: '',
  prtnrNo: '',
  copnDvCd: 'ALL',
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약상세번호
  cntrCstNo: '', // 고객번호
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 조회
let cachedParams;
async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);
  const res = await dataService.get('/sms/wells/closing/deposit-delinquent-details/contract', { params: { ...cachedParams, ...pageInfo.value, timeout: 300000 } });

  console.log(res.data);
  const { list: mainList, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdDetailRef.value.getView();
  view.getDataSource().setRows(mainList);
}

// 조회 버튼 클릭 이벤트
async function onClickSearch() {
  console.log(searchParams.value);
  await fetchData();
}

// 엑셀 다운로드 버튼 클릭
async function onClickExportView() {
  const view = grdDetailRef.value.getView();
  const response = await dataService.get('/sms/wells/closing/deposit-delinquent-details/contract/excel-download', { params: cachedParams, timeout: 300000 });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

/**
 * 파트너 검색 팝업
 */
async function onClickSearchPntnrNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP', // Z-OG-U-0050P01
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
      // ogTpCd: searchParams.value.ogTp,
    },
  });
  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}

/**
 * 고객조회 팝업(고객번호)
 */
async function onClickSearchCustomer() {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: {
      cstNo: searchParams.value.cntrCstNo,
      cstType: '1',
    },
  });
  if (result) {
    searchParams.value.cntrCstNo = payload.cstNo;
  }
}

watch(() => searchParams.value.ogTp, async (newVal) => {
  if (newVal === 'ALL') {
    searchParams.value.dgr1LevlOgCd = '';
  }
}, { immediate: true });

watch(() => searchParams.value.sellTpCd, () => {
  searchParams.value.sellTpDtlCd = 'ALL';
}, { immediate: true });
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdDetail = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD }, // 판매유형코드명
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '120', styleName: 'text-center', options: codes.SELL_TP_DTL_CD }, // 판매유형상세코드명
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '120', styleName: 'text-center' }, // 계약번호+계약일련번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '120', styleName: 'text-center' }, // 고객한글명
    { fieldName: 'slClDt', header: t('MSG_TXT_SL_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 매출마감일자
    { fieldName: 'basePdCd', header: t('MSG_TXT_PROD_CD'), width: '120', styleName: 'text-center' }, // 기준상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_GOODS_NM'), width: '140', styleName: 'text-left' }, // 상품명
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '100', styleName: 'text-right', dataType: 'number' }, // 연체개월수
    { fieldName: 'eotDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '100', styleName: 'text-right', dataType: 'number' }, // 기말연체금액
    { fieldName: 'billingAmount', header: t('MSG_TXT_TOT_BIL_AMT'), width: '100', styleName: 'text-right', dataType: 'number' }, // 매출누계금액
    { fieldName: 'depositAmount', header: t('MSG_TXT_DP_AMT'), width: '100', styleName: 'text-right', dataType: 'number' }, // 입금금액
    { fieldName: 'uncollectedAmount', header: t('MSG_TXT_UC_AMT'), width: '100', styleName: 'text-right', dataType: 'number' }, // 미수금액
    { fieldName: 'dpTpCd', header: t('MSG_TXT_STLM_MTHD'), width: '120', styleName: 'text-center', options: codes.DP_TP_CD }, // 입금유형코드
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_FNT_STPL_D'), width: '120', styleName: 'text-center' }, // 납부기준일자
    { fieldName: 'approveCode', header: t('MSG_TXT_STLM_CD'), width: '80', styleName: 'text-center' }, //
    { fieldName: 'nonPaymentReason', header: t('MSG_TXT_OSTD_RSON'), width: '120', styleName: 'text-left' }, //
    { fieldName: 'slAggAmt', header: t('MSG_TXT_SL_AGG_AMT'), width: '100', styleName: 'text-right', dataType: 'number' }, // 매출누계금액
    { fieldName: 'depositAggregate', header: t('MSG_TXT_DP_AGG_AMT'), width: '100', styleName: 'text-right', dataType: 'number' }, // 입금누계액
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_SELL_NM'), width: '100', styleName: 'text-center' }, // 파트너한글명
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' }, // 파트너번호
    { fieldName: 'fstCntrDt', header: t('MSG_TXT_SELLER_BIZ_RGST_D'), width: '130', styleName: 'text-center', datetimeFormat: 'date' }, // 최초계약일자
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_SELLER_RSB'), width: '120', styleName: 'text-center' }, // 직급구분코드
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_SELLER_DV'), width: '120', styleName: 'text-center', options: codes.RSB_DV_CD }, // 직책구분코드
    { fieldName: 'dgr3LevlOgCd', header: t('MSG_TXT_BRANCH'), width: '100', styleName: 'text-center' }, // 3차레벨조직코드
    { fieldName: 'dgr3LevlDgPrtnrNm', header: t('MSG_TXT_BRMGR_NM'), width: '120', styleName: 'text-center' }, // 3차레벨대표파트너명
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '120', styleName: 'text-center' }, // 빌딩명
    { fieldName: 'dgr1LevlOgCd', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '100', styleName: 'text-center' }, // 1차레벨조직코드
    { fieldName: 'dgr2LevlOgCd', header: t('MSG_TXT_RGNL_GRP'), width: '100', styleName: 'text-center' }, // 2차레벨조직코드
    { fieldName: 'insidePurchase', header: t('MSG_TXT_INSI_PRCHS'), width: '120', styleName: 'text-center' }, // 내부구매
    { fieldName: 'clctamPrtnrKnm', header: t('MSG_TXT_CLCTAM_PSIC'), width: '120', styleName: 'text-center' }, // 집금파트너번호
    { fieldName: 'clctamPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '70', styleName: 'text-center' }, // 파트너한글명
    { fieldName: 'crpMpno', header: t('MSG_TXT_CLCTAM_ICHR_TNO'), width: '140', styleName: 'text-center' }, // 법인휴대전화번호
    { fieldName: 'mmIstmAmt', header: t('MSG_TXT_MM_MPY_AMT'), width: '120', styleName: 'text-right', dataType: 'number' }, // 월할부금액

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'sellTpCd', 'sellTpDtlCd', 'cntrDtlNo', 'cstKnm', 'slClDt', 'basePdCd', 'pdNm', // single
    {
      header: t('MSG_TXT_LSTMM_CL_BASE_DLQ_AMT'), // colspan title
      direction: 'horizontal', // merge type
      items: ['dlqMcn', 'eotDlqAmt'],
    },
    {
      header: t('MSG_TXT_THM_DP_PS'),
      direction: 'horizontal',
      items: ['billingAmount', 'depositAmount', 'uncollectedAmount'],
    },
    'dpTpCd', 'mpyBsdt', 'approveCode', 'nonPaymentReason', 'slAggAmt', 'depositAggregate', 'prtnrKnm', 'prtnrNo', 'fstCntrDt', 'pstnDvCd', 'rsbDvCd', 'dgr3LevlOgCd', 'dgr3LevlDgPrtnrNm', 'bldNm', 'dgr1LevlOgCd', 'dgr2LevlOgCd', 'insidePurchase', 'clctamPrtnrNo', 'clctamPrtnrKnm', 'crpMpno', 'mmIstmAmt',
  ]);
});
</script>
