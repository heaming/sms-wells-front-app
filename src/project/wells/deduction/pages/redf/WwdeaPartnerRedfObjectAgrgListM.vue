<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DED
2. 프로그램 ID : WwdeaPartnerRedfObjectAgrgListM
3. 작성자 : daewon.kim
4. 작성일 : 2023.05.17 ~
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수당(실적) 되물림 관리- 파트너 되물림 대상 집계 현황 조회 (통합) - 영업부 되물림 생성
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.perfYmFrom"
            v-model:to="searchParams.perfYmTo"
            :label="t('MSG_TXT_PERF_YM')"
            rules="date_range_required"
            type="month"
          />
        </kw-search-item>

        <kw-search-item
          :label="t('MSG_TXT_YEAR_OCCURNCE')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.redfAdsbOcYmFrom"
            v-model:to="searchParams.redfAdsbOcYmTo"
            :label="t('MSG_TXT_YEAR_OCCURNCE')"
            rules="date_range_required"
            type="month"
          />
        </kw-search-item>

        <kw-search-item :label="t('MSG_TXT_OG_TP')">
          <kw-option-group
            v-model="searchParams.ogTpCd"
            type="radio"
            :options="filterOgTpCd"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_PROCS_TP')">
          <kw-select
            v-model="searchParams.redfAdsbTpCd"
            :options="filterRedfAdsbTpCd"
          />
        </kw-search-item>

        <kw-search-item :label="t('MSG_TXT_RSB_DV')">
          <kw-option-group
            v-model="searchParams.rsbDvCd"
            type="radio"
            :options="codes.DDTN_RPLC_RSB_DV_CD"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_BLG_CD')"
        >
          <kw-input
            v-model="searchParams.ogCd"
            icon="search"
            :label="t('MSG_TXT_BLG_CD')"
            rules="max:7|alpha_num"
            @click-icon="onClickSearchOgCd"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_PRTNR_NUMBER')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            regex="num"
            icon="search"
            :label="t('MSG_TXT_PRTNR_NUMBER')"
            rules="max:10|numeric"
            clearable
            @click-icon="onClickSearchPartner"
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
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="pageInfo.totalCount === 0"
          :label="t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          primary
          dense
          :label="t('MSG_BTN_REDF_AMT_CRT')"
          @click="onClickRedfAmountCreate"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        :page-size="pageInfo.pageSize-1"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';
import { codeUtil, getComponentType, gridUtil, useDataService, useMeta, modal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const { t } = useI18n();
const grdMainRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();
const dataService = useDataService();
const { getConfig } = useMeta();
const lastMonth = dayjs().subtract(1, 'month').format('YYYYMM');
const currentMonth = dayjs().subtract(0, 'month').format('YYYYMM');
const { getUserInfo } = useMeta();
const userInfo = getUserInfo();

const codes = await codeUtil.getMultiCodes(
  'REDF_OG_TP_CD',
  'DDTN_RPLC_RSB_DV_CD',
  'REDF_ADSB_TP_CD',
);

const filterOgTpCd = ref([]);
codes.REDF_OG_TP_CD.sort(() => -1);
codes.REDF_OG_TP_CD.forEach((e) => {
  if (e.codeId === 'W01' || e.codeId === 'W02') {
    filterOgTpCd.value.push({
      codeId: e.codeId.trim(),
      codeName: e.codeName.trim(),
    });
  }
});

const filterRedfAdsbTpCd = ref([]);
codes.REDF_ADSB_TP_CD.forEach((e) => {
  if (e.codeId === '0202' || e.codeId === '0203') {
    filterRedfAdsbTpCd.value.push({
      codeId: e.codeId.trim(),
      codeName: e.codeName.trim(),
    });
  }
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

let cachedParams;

const searchParams = ref({
  ogTpCd: filterOgTpCd.value[0].codeId, // 되물림 조직유형코드 변경예정
  redfAdsbOcYmFrom: currentMonth, // 발생년월 from
  redfAdsbOcYmTo: currentMonth, // 발생년월 to
  perfYmFrom: lastMonth, // 실적년월 from
  perfYmTo: currentMonth, // 실적년월 to
  redfAdsbTpCd: '0202', // 처리유형
  rsbDvCd: codes.DDTN_RPLC_RSB_DV_CD[0].codeId, // 직책구분코드
  prtnrNo: '', // 파트너번호
  ogCd: '', // 조직코드

});

/* 되물림 금액 생성 */
async function onClickRedfAmountCreate() {
  await modal({
    component: 'ZwdeaRedfAmountCreateP',
    componentProps: {
      ogTpCd: searchParams.value.ogTpCd,
    },
  });
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/deduction/redf/allowance-report/bizd-paging', { params: { ...cachedParams, ...pageInfo.value }, timeout: 200000 });
  const { list: redfes, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(redfes);
  dataSource.checkRowStates(true);
}

async function onClickSearch() {
  grdMainRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/deduction/redf/allowance-report/bizd-excel-download', { params: cachedParams, timeout: 200000 });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

/**
 * 파트너번호 검색 팝업
 */
async function onClickSearchPartner() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
      ogTpCd: userInfo.ogTpCd,
    },
  });
  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}

/**
 * 조직코드 검색 팝업
 */
async function onClickSearchOgCd() {
  const { result, payload } = await modal({
    component: 'ZwogzOrganizationListP',
    componentProps: {
      ogNm: searchParams.value.ogCd,
      ogTpCd: userInfo.ogTpCd,
      baseYm: dayjs().format('YYYYMM'),
    },
  });
  if (result) {
    searchParams.value.ogCd = payload.ogCd;
  }
}

// 2019년 3월 이전 + 지구장 이하 columnLayout set
const perfLast201903AndDstrcColumnLayout = [
  {
    header: t('MSG_TXT_BASE_INF'),
    direction: 'horizontal',
    items: ['perfYm', 'baseYm', 'ogCd', 'prtnrKnm', 'prtnrNo', 'pstnDvCd', 'dstrcGd', 'atdcDc', 'perfDvCd', 'brchDec', 'sellAmt', 'ackmtPerfRt', 'oneteamYn'],
  },
  'homeCare',
  {
    header: t('MSG_TXT_ENVR_ELHM_BASE_PRC'),
    direction: 'horizontal',
    items: ['tEnvrElhmBaseAmt', 'bEnvrElhmBaseAmt', 'envrElhmBaseAmt', 'aEnvrElhmBaseAmt'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_CT'),
    direction: 'horizontal',
    items: ['tbEnvrElhmCnt', 'tEnvrElhmCnt', 'bEnvrElhmCnt', 'envrElhmCnt', 'aEnvrElhmCnt'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP'),
    direction: 'horizontal',
    items: ['tEnvrElhmExcp', 'bEnvrElhmExcp', 'envrElhmExcp', 'aEnvrElhmExcp'],
  },
  'mcPerf',
  {
    header: t('MSG_TXT_REDF_FEE'),
    direction: 'horizontal',
    items: ['mchnChRedf201903', 'spRedf', 'homeCareRedf', 'envrTrgRedf', 'envrBznsRedf201903', 'envrMetgRedf', 'envrExcpBznsRedf201903', 'envrExcpMetgRedf', 'envrOgRedf', 'envrExcpOgRedf201904', 'envrExcpOgMetgRedf', 'sumPerfLast201903RedfDstrc'],
  },

  {
    header: t('MSG_TXT_TGT_RECRT'),
    direction: 'horizontal',
    items: ['tRedfPpl', 'bRedfPpl', 'redfPpl', 'aRedfPpl'],
  },
];

// MSG_TXT_PERF_YM 2019년 04월 ~ 2020년 12월 + 지구장 이하 columnLayout set
const perf201904Between202012AndDstrcColumnLayout = [
  {
    header: t('MSG_TXT_BASE_INF'),
    direction: 'horizontal',
    items: ['perfYm', 'baseYm', 'ogCd', 'prtnrKnm', 'prtnrNo', 'pstnDvCd', 'qlfDvNm', 'qlfDvNm1', 'atdcDc', 'perfDvCd', 'marchDstrcYn', 'chYm', 'educCpcMm', 'aksd48Yn', 'edu17Yn'],
  },
  'homeCare',
  {
    header: t('MSG_TXT_ENVR_ELHM'),
    direction: 'horizontal',
    items: ['tEnvrElhm', 'bEnvrElhm', 'envrElhm', 'aEnvrElhm'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_RENTAL'),
    direction: 'horizontal',
    items: ['tbEnvrElhmRental', 'tEnvrElhmRental', 'bEnvrElhmRental', 'envrElhmRental', 'aEnvrElhmRental'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_SPAY'),
    direction: 'horizontal',
    items: ['tEnvrElhmSpay', 'bEnvrElhmSpay', 'envrElhmSpay', 'aEnvrElhmSpay'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP_FXAM'),
    direction: 'horizontal',
    items: ['tEnvrElhmExcpFxam', 'bEnvrElhmExcpFxam', 'envrElhmExcpFxam', 'aEnvrElhmExcpFxam'],
  },
  'mcPerf',
  {
    header: t('MSG_TXT_REDF_FEE'),
    direction: 'horizontal',
    items: ['homeCareRedf', 'mchnChRedf201904', 'envrBznsRedf201904', 'envrExcpBznsRedf201904', 'sellEncrgRedf', 'eduRedf', 'settleRedf', 'sellEncrgRettRedf', 'sumPerf201904Between202012RedfDstrc'],
  },
  'cpsnRedfYn',
];

// MSG_TXT_PERF_YM 2021년 1월 이후 + 지구장 이하
const perfAfter202101AndDstrcColumnLayout = [
  {
    header: t('MSG_TXT_BASE_INF'),
    direction: 'horizontal',
    items: ['perfYm', 'baseYm', 'ogCd', 'prtnrKnm', 'prtnrNo', 'pstnDvCd', 'qlfDvNm', 'qlfDvNm1', 'atdcDc', 'perfDvCd', 'chYm', 'educCpcMm', 'aksd48Yn', 'edu17Yn'],
  },
  'homeCare',
  {
    header: t('MSG_TXT_ENVR_ELHM'),
    direction: 'horizontal',
    items: ['tEnvrElhm', 'bEnvrElhm', 'envrElhm', 'aEnvrElhm'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_RENTAL'),
    direction: 'horizontal',
    items: ['tbEnvrElhmRental', 'tEnvrElhmRental', 'bEnvrElhmRental', 'envrElhmRental', 'aEnvrElhmRental'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_SPAY'),
    direction: 'horizontal',
    items: ['tEnvrElhmSpay', 'bEnvrElhmSpay', 'envrElhmSpay', 'aEnvrElhmSpay'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP_FXAM'),
    direction: 'horizontal',
    items: ['tEnvrElhmExcpFxam', 'bEnvrElhmExcpFxam', 'envrElhmExcpFxam', 'aEnvrElhmExcpFxam'],
  },
  'mcPerf',
  {
    header: t('MSG_TXT_REDF_FEE'),
    direction: 'horizontal',
    items: ['homeCareRedf',
      'mchnChRedf201904',
      'envrBznsRedf201904',
      'envrExcpBznsRedf201904',
      'sellEncrgRedf',
      'eduRedf',
      'settleRedf',
      'sellEncrgRettRedf',
      'sumPerf202101RedfDstrc',
    ],
  },
  'cpsnRedfYn',
];

// MSG_TXT_PERF_YM 전 기간 + 지구장 이하
const perfAllAndDstrcColumnLayout = [
  {
    header: t('MSG_TXT_BASE_INF'),
    direction: 'horizontal',
    items: ['perfYm', 'baseYm', 'ogCd', 'prtnrKnm', 'prtnrNo', 'pstnDvCd', 'qlfDvNm', 'qlfDvNm1', 'dstrcGd', 'atdcDc', 'perfDvCd', 'brchDec', 'marchDstrcYn', 'chYm', 'educCpcMm', 'aksd48Yn', 'edu17Yn', 'sellAmt', 'ackmtPerfRt', 'oneteamYn'],
  },
  'homeCare',
  {
    header: t('MSG_TXT_ENVR_ELHM'),
    direction: 'horizontal',
    items: ['tEnvrElhm', 'bEnvrElhm', 'envrElhm', 'aEnvrElhm'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_CT'),
    direction: 'horizontal',
    items: ['tbEnvrElhmCnt', 'tEnvrElhmCnt', 'bEnvrElhmCnt', 'envrElhmCnt', 'aEnvrElhmCnt'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_BASE_PRC'),
    direction: 'horizontal',
    items: ['tEnvrElhmBaseAmt', 'bEnvrElhmBaseAmt', 'envrElhmBaseAmt', 'aEnvrElhmBaseAmt'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_RENTAL'),
    direction: 'horizontal',
    items: ['tbEnvrElhmRental', 'tEnvrElhmRental', 'bEnvrElhmRental', 'envrElhmRental', 'aEnvrElhmRental'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_SPAY'),
    direction: 'horizontal',
    items: ['tEnvrElhmSpay', 'bEnvrElhmSpay', 'envrElhmSpay', 'aEnvrElhmSpay'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP'),
    direction: 'horizontal',
    items: ['tEnvrElhmExcp', 'bEnvrElhmExcp', 'envrElhmExcp', 'aEnvrElhmExcp'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP_FXAM'),
    direction: 'horizontal',
    items: ['tEnvrElhmExcpFxam', 'bEnvrElhmExcpFxam', 'envrElhmExcpFxam', 'aEnvrElhmExcpFxam'],
  },
  'mcPerf',
  {
    header: t('MSG_TXT_REDF_FEE'),
    direction: 'horizontal',
    items: ['mchnChRedf201903', 'mchnChRedf201904', 'spRedf', 'homeCareRedf', 'envrTrgRedf', 'envrBznsRedf201903', 'envrMetgRedf', 'envrBznsRedf201904', 'envrExcpBznsRedf201903', 'envrExcpMetgRedf', 'envrExcpBznsRedf201904', 'sellEncrgRedf', 'eduRedf', 'settleRedf', 'sellEncrgRettRedf', 'envrOgRedf', 'envrOgMetg', 'envrExcpOgRedf201904', 'envrExcpOgMetgRedf', 'sumPerfAllRedfDstrc'],
  },
  {
    header: t('MSG_TXT_TGT_RECRT'),
    direction: 'horizontal',
    items: ['tRedfPpl', 'bRedfPpl', 'redfPpl', 'aRedfPpl'],
  },
  'cpsnRedfYn',
];

// 2019년 3월 이전 + 지점장 이상 columnLayout set
const perfLast201903AndBrchColumnLayout = [
  {
    header: t('MSG_TXT_BASE_INF'),
    direction: 'horizontal',
    items: ['perfYm', 'baseYm', 'ogCd', 'prtnrKnm', 'prtnrNo', 'pstnDvCd', 'dstrcGd', 'atdcDc', 'perfDvCd', 'brchDec', 'sellAmt', 'ackmtPerfRt', 'oneteamYn'],
  },
  'homeCare',
  {
    header: t('MSG_TXT_ENVR_ELHM_BASE_PRC'),
    direction: 'horizontal',
    items: ['tEnvrElhmBaseAmt', 'bEnvrElhmBaseAmt', 'envrElhmBaseAmt', 'aEnvrElhmBaseAmt'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_CT'),
    direction: 'horizontal',
    items: ['tbEnvrElhmCnt', 'tEnvrElhmCnt', 'bEnvrElhmCnt', 'envrElhmCnt', 'aEnvrElhmCnt'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP'),
    direction: 'horizontal',
    items: ['tEnvrElhmExcp', 'bEnvrElhmExcp', 'envrElhmExcp', 'aEnvrElhmExcp'],
  },
  'mcPerf',
  {
    header: t('MSG_TXT_REDF_FEE'),
    direction: 'horizontal',
    items: ['mchnChRedf201903', 'spRedf', 'homeCareRedf', 'envrTrgRedf', 'envrBznsRedf201903', 'envrMetgRedf', 'envrExcpBznsRedf201903', 'envrExcpMetgRedf', 'envrOgRedf', 'envrOgMetg', 'envrExcpOgRedf201904', 'envrExcpOgMetgRedf', 'sumPerfLast201903RedfBrch'],
  },
  {
    header: t('MSG_TXT_TGT_RECRT'),
    direction: 'horizontal',
    items: ['tRedfPpl', 'bRedfPpl', 'redfPpl', 'aRedfPpl'],
  },
];

// 2019년 4월 ~ 2020년 12월 + 지점장 이상 columnLayout set
const perf201904Between202012AndBrchColumnLayout = [
  {
    header: t('MSG_TXT_BASE_INF'),
    direction: 'horizontal',
    items: ['perfYm', 'baseYm', 'ogCd', 'prtnrKnm', 'prtnrNo', 'pstnDvCd', 'qlfDvNm', 'qlfDvNm1', 'atdcDc', 'perfDvCd', 'marchDstrcYn', 'educCpcMm', 'aksd48Yn'],
  },
  'homeCare',
  {
    header: t('MSG_TXT_NW_SELL_CT_OG'),
    direction: 'horizontal',
    items: ['tbNwSellCntJo', 'tNwSellCntJo', 'bNwSellCntJo', 'nwSellCntJo', 'aNwSellCntJo'],
  },
  {
    header: t('MSG_TXT_NW_SELL_CT_INDV'),
    direction: 'horizontal',
    items: ['tbSellCntPr', 'tSellCntPr', 'bSellCntPr', 'sellCntPr', 'aSellCntPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_CT_OG'),
    direction: 'horizontal',
    items: ['tbEnvrElhmCntJo', 'tEnvrElhmCntJo', 'bEnvrElhmCntJo', 'envrElhmCntJo', 'aEnvrElhmCntJo'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_CT_INDV'),
    direction: 'horizontal',
    items: ['tbEnvrElhmCntPr', 'tEnvrElhmCntPr', 'bEnvrElhmCntPr', 'envrElhmCntPr', 'aEnvrElhmCntPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_RENTAL_OG'),
    direction: 'horizontal',
    items: ['tbEnvrElhmRentalJo', 'tEnvrElhmRentalJo', 'bEnvrElhmRentalJo', 'envrElhmRentalJo', 'aEnvrElhmRentalJo'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_RENTAL_INDV'),
    direction: 'horizontal',
    items: ['tbEnvrElhmRentalPr', 'tEnvrElhmRentalPr', 'bEnvrElhmRentalPr', 'envrElhmRentalPr', 'aEnvrElhmRentalPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_SPAY_OG'),
    direction: 'horizontal',
    items: ['tbEnvrElhmSpayJo', 'tEnvrElhmSpayJo', 'bEnvrElhmSpayJo', 'envrElhmSpayJo', 'aEnvrElhmSpayJo'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_SPAY_INDV'),
    direction: 'horizontal',
    items: ['tbEnvrElhmSpayPr', 'tEnvrElhmSpayPr', 'bEnvrElhmSpayPr', 'envrElhmSpayPr', 'aEnvrElhmSpayPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_FXAM_INDV'),
    direction: 'horizontal',
    items: ['tbNwSellCntPr', 'tNwSellCntPr', 'bNwSellCntPr', 'nwSellCntPr', 'aNwSellCntPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP_SPAY_OG'),
    direction: 'horizontal',
    items: ['tbEnvrElhmExcpJo', 'tEnvrElhmExcpJo', 'bEnvrElhmExcpJo', 'envrElhmExcpJo', 'aEnvrElhmExcpJo'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP_SPAY_INDV'),
    direction: 'horizontal',
    items: ['tbEnvrElhmExcpPr', 'tEnvrElhmExcpPr', 'bEnvrElhmExcpPr', 'envrElhmExcpPr', 'aEnvrElhmExcpPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP_FXAM_INDV'),
    direction: 'horizontal',
    items: ['tbEnvrElhmExcpFxamPr', 'tEnvrElhmExcpFxamPr', 'bEnvrElhmExcpFxamPr', 'envrElhmExcpFxamPr', 'aEnvrElhmExcpFxamPr'],
  },
  {
    header: t('MSG_TXT_OG_MNGT_ACL_ACTI_PPL'),
    direction: 'horizontal',
    items: ['tbOgMgtPpl', 'tOgMgtPpl', 'bOgMgtPpl', 'ogMgtPpl', 'aOgMgtPpl'],
  },
  'mcPerf',
  {
    header: t('MSG_TXT_REDF_FEE'),
    direction: 'horizontal',
    items: ['homeCareRedf', 'mchnChRedf201904', 'envrBznsRedf201904', 'envrExcpBznsRedf201904', 'sellEncrgRedf', 'eduRedf', 'wpSettleRedfBrch', 'envrExcpOgRedf201903', 'ogSellEncrgRedf', 'nwSellRedf', 'ogMgtRedf', 'sumPerf201904Between202012RedfBrch'],
  },
  'cpsnRedfYn',
];

// 2021년 01월 + 지점장 이상 columnLayout set
const perfAfter202101AndBrchColumnLayout = [
  {
    header: t('MSG_TXT_BASE_INF'),
    direction: 'horizontal',
    items: ['perfYm', 'baseYm', 'ogCd', 'prtnrKnm', 'prtnrNo', 'pstnDvCd', 'qlfDvNm', 'qlfDvNm1', 'atdcDc', 'perfDvCd', 'educCpcMm', 'aksd48Yn'],
  },
  'homeCare',
  {
    header: t('MSG_TXT_NW_SELL_CT_OG'),
    direction: 'horizontal',
    items: ['tbNwSellCntJo', 'tNwSellCntJo', 'bNwSellCntJo', 'nwSellCntJo', 'aNwSellCntJo'],
  },
  {
    header: t('MSG_TXT_NW_SELL_CT_INDV'),
    direction: 'horizontal',
    items: ['tbSellCntPr', 'tSellCntPr', 'bSellCntPr', 'sellCntPr', 'aSellCntPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_CT_OG'),
    direction: 'horizontal',
    items: ['tbEnvrElhmCntJo', 'tEnvrElhmCntJo', 'bEnvrElhmCntJo', 'envrElhmCntJo', 'aEnvrElhmCntJo'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_CT_INDV'),
    direction: 'horizontal',
    items: ['tbEnvrElhmCntPr', 'tEnvrElhmCntPr', 'bEnvrElhmCntPr', 'envrElhmCntPr', 'aEnvrElhmCntPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_RENTAL_OG'),
    direction: 'horizontal',
    items: ['tbEnvrElhmRentalJo', 'tEnvrElhmRentalJo', 'bEnvrElhmRentalJo', 'envrElhmRentalJo', 'aEnvrElhmRentalJo'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_RENTAL_INDV'),
    direction: 'horizontal',
    items: ['tbEnvrElhmRentalPr', 'tEnvrElhmRentalPr', 'bEnvrElhmRentalPr', 'envrElhmRentalPr', 'aEnvrElhmRentalPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_SPAY_OG'),
    direction: 'horizontal',
    items: ['tbEnvrElhmSpayJo', 'tEnvrElhmSpayJo', 'bEnvrElhmSpayJo', 'envrElhmSpayJo', 'aEnvrElhmSpayJo'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_SPAY_INDV'),
    direction: 'horizontal',
    items: ['tbEnvrElhmSpayPr', 'tEnvrElhmSpayPr', 'bEnvrElhmSpayPr', 'envrElhmSpayPr', 'aEnvrElhmSpayPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_FXAM_INDV'),
    direction: 'horizontal',
    items: ['tbNwSellCntPr', 'tNwSellCntPr', 'bNwSellCntPr', 'nwSellCntPr', 'aNwSellCntPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP_SPAY_OG'),
    direction: 'horizontal',
    items: ['tbEnvrElhmExcpJo', 'tEnvrElhmExcpJo', 'bEnvrElhmExcpJo', 'envrElhmExcpJo', 'aEnvrElhmExcpJo'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP_SPAY_INDV'),
    direction: 'horizontal',
    items: ['tbEnvrElhmExcpPr', 'tEnvrElhmExcpPr', 'bEnvrElhmExcpPr', 'envrElhmExcpPr', 'aEnvrElhmExcpPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP_FXAM_INDV'),
    direction: 'horizontal',
    items: ['tbEnvrElhmExcpFxamPr', 'tEnvrElhmExcpFxamPr', 'bEnvrElhmExcpFxamPr', 'envrElhmExcpFxamPr', 'aEnvrElhmExcpFxamPr'],
  },
  {
    header: t('MSG_TXT_OG_MNGT_ACL_ACTI_PPL'),
    direction: 'horizontal',
    items: ['tbOgMgtPpl', 'tOgMgtPpl', 'bOgMgtPpl', 'ogMgtPpl', 'aOgMgtPpl'],
  },
  'mcPerf',
  {
    header: t('MSG_TXT_REDF_FEE'),
    direction: 'horizontal',
    items: ['homeCareRedf', 'mchnChRedf201904', 'envrBznsRedf201904', 'envrExcpBznsRedf201904', 'sellEncrgRedf', 'eduRedf', 'wpSettleRedfBrch', 'envrExcpOgRedf201903', 'ogSellEncrgRedf', 'nwSellRedf', 'ogMgtRedf', 'sumPerf202101RedfBrch'],
  },
  'cpsnRedfYn',
];

// MSG_TXT_PERF_YM 전 기간 + 지점장 이상 columnLayout set
const perfAllAndBrchColumnLayout = [
  {
    header: t('MSG_TXT_BASE_INF'),
    direction: 'horizontal',
    items: ['perfYm', 'baseYm', 'ogCd', 'prtnrKnm', 'prtnrNo', 'pstnDvCd', 'dstrcGd', 'qlfDvNm', 'qlfDvNm1', 'atdcDc', 'perfDvCd', 'brchDec', 'sellAmt', 'ackmtPerfRt', 'oneteamYn', 'marchDstrcYn', 'educCpcMm', 'aksd48Yn'],
  },
  'homeCare',
  {
    header: t('MSG_TXT_NW_SELL_CT_OG'),
    direction: 'horizontal',
    items: ['tbNwSellCntJo', 'tNwSellCntJo', 'bNwSellCntJo', 'nwSellCntJo', 'aNwSellCntJo'],
  },
  {
    header: t('MSG_TXT_NW_SELL_CT_INDV'),
    direction: 'horizontal',
    items: ['tbSellCntPr', 'tSellCntPr', 'bSellCntPr', 'sellCntPr', 'aSellCntPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_BASE_PRC'),
    direction: 'horizontal',
    items: ['tEnvrElhmBaseAmt', 'bEnvrElhmBaseAmt', 'envrElhmBaseAmt', 'aEnvrElhmBaseAmt'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_CT'),
    direction: 'horizontal',
    items: ['tbEnvrElhmCnt', 'tEnvrElhmCnt', 'bEnvrElhmCnt', 'envrElhmCnt', 'aEnvrElhmCnt'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_CT_OG'),
    direction: 'horizontal',
    items: ['tbEnvrElhmCntJo', 'tEnvrElhmCntJo', 'bEnvrElhmCntJo', 'envrElhmCntJo', 'aEnvrElhmCntJo'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_CT_INDV'),
    direction: 'horizontal',
    items: ['tbEnvrElhmCntPr', 'tEnvrElhmCntPr', 'bEnvrElhmCntPr', 'envrElhmCntPr', 'aEnvrElhmCntPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_RENTAL_OG'),
    direction: 'horizontal',
    items: ['tbEnvrElhmRentalJo', 'tEnvrElhmRentalJo', 'bEnvrElhmRentalJo', 'envrElhmRentalJo', 'aEnvrElhmRentalJo'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_RENTAL_INDV'),
    direction: 'horizontal',
    items: ['tbEnvrElhmRentalPr', 'tEnvrElhmRentalPr', 'bEnvrElhmRentalPr', 'envrElhmRentalPr', 'aEnvrElhmRentalPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_SPAY_OG'),
    direction: 'horizontal',
    items: ['tbEnvrElhmSpayJo', 'tEnvrElhmSpayJo', 'bEnvrElhmSpayJo', 'envrElhmSpayJo', 'aEnvrElhmSpayJo'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_SPAY_INDV'),
    direction: 'horizontal',
    items: ['tbEnvrElhmSpayPr', 'tEnvrElhmSpayPr', 'bEnvrElhmSpayPr', 'envrElhmSpayPr', 'aEnvrElhmSpayPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_FXAM_INDV'),
    direction: 'horizontal',
    items: ['tbNwSellCntPr', 'tNwSellCntPr', 'bNwSellCntPr', 'nwSellCntPr', 'aNwSellCntPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP'),
    direction: 'horizontal',
    items: ['tEnvrElhmExcp', 'bEnvrElhmExcp', 'envrElhmExcp', 'aEnvrElhmExcp'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP_SPAY_OG'),
    direction: 'horizontal',
    items: ['tbEnvrElhmExcpJo', 'tEnvrElhmExcpJo', 'bEnvrElhmExcpJo', 'envrElhmExcpJo', 'aEnvrElhmExcpJo'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP_SPAY_INDV'),
    direction: 'horizontal',
    items: ['tbEnvrElhmExcpPr', 'tEnvrElhmExcpPr', 'bEnvrElhmExcpPr', 'envrElhmExcpPr', 'aEnvrElhmExcpPr'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP_FXAM_INDV'),
    direction: 'horizontal',
    items: ['tbEnvrElhmExcpFxamPr', 'tEnvrElhmExcpFxamPr', 'bEnvrElhmExcpFxamPr', 'envrElhmExcpFxamPr', 'aEnvrElhmExcpFxamPr'],
  },
  {
    header: t('MSG_TXT_OG_MNGT_ACL_ACTI_PPL'),
    direction: 'horizontal',
    items: ['tbOgMgtPpl', 'tOgMgtPpl', 'bOgMgtPpl', 'ogMgtPpl', 'aOgMgtPpl'],
  },
  'mcPerf',
  {
    header: t('MSG_TXT_REDF_FEE'),
    direction: 'horizontal',
    items: ['mchnChRedf201903', 'spRedf', 'homeCareRedf', 'mchnChRedf201904', 'sellEncrgRedf', 'eduRedf', 'wpSettleRedfBrch', 'envrTrgRedf', 'envrBznsRedf201903', 'envrExcpBznsRedf201903', 'envrBznsRedf201904', 'envrExcpBznsRedf201904', 'envrMetgRedf', 'envrExcpMetgRedf', 'envrOgRedf', 'envrExcpOgRedf201904', 'envrOgMetg', 'envrExcpOgMetgRedf', 'ogSellEncrgRedf', 'nwSellRedf', 'ogMgtRedf', 'sumPerfAllRedfBrch'],
  },
  {
    header: t('MSG_TXT_TGT_RECRT'),
    direction: 'horizontal',
    items: ['tRedfPpl', 'bRedfPpl', 'redfPpl', 'aRedfPpl'],
  },
  'cpsnRedfYn',
];

// WELLS-P + 지구장 이하
const wpAndDstrcColumnLayout = [
  {
    header: t('MSG_TXT_BASE_INF'),
    direction: 'horizontal',
    items: ['perfYm', 'baseYm', 'ogCd', 'prtnrNo', 'prtnrKnm', 'pstnDvCd', 'qlfDvNm', 'wpChYm'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM'),
    direction: 'horizontal',
    items: ['tEnvrElhm', 'bEnvrElhm', 'envrElhm', 'aEnvrElhm'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP'),
    direction: 'horizontal',
    items: ['tEnvrElhmExcp', 'bEnvrElhmExcp', 'envrElhmExcp', 'aEnvrElhmExcp'],
  },
  {
    header: t('MSG_TXT_CHNG'),
    direction: 'horizontal',
    items: ['tMc', 'bMc', 'mc', 'aMc'],
  },
  {
    header: t('MSG_TXT_FXAM'),
    direction: 'horizontal',
    items: ['tFxam', 'bFxam', 'fxam', 'aFxam'],
  },
  {
    header: t('MSG_TXT_REDF_FEE'),
    direction: 'horizontal',
    items: ['wpEnvrPrRedf', 'wpEnvrExcpPrRedf', 'wpPrSellEncrgRedf', 'wpMetgRedf', 'wpSettleRedfDstrc', 'wpFxamRedfDstrc', 'sumWpRedfDstrc'],
  },
  'dlqRedfAmt',
];

// WELLS-P + 지점장 이상
const wpAndBrchColumnLayout = [
  'perfYm', 'baseYm', 'ogCd', 'prtnrNo', 'prtnrKnm', 'pstnDvCd', 'perfDvCd', 'wpChYm',
  {
    header: t('MSG_TXT_ENVR_ELHM'),
    direction: 'horizontal',
    items: ['tbEnvrElhm', 'tEnvrElhm', 'bEnvrElhm', 'envrElhm', 'aEnvrElhm'],
  },
  {
    header: t('MSG_TXT_ENVR_ELHM_EXCP'),
    direction: 'horizontal',
    items: ['tbEnvrElhmExcp', 'tEnvrElhmExcp', 'bEnvrElhmExcp', 'envrElhmExcp', 'aEnvrElhmExcp'],
  },
  {
    header: t('MSG_TXT_CHNG'),
    direction: 'horizontal',
    items: ['tbMc', 'tMc', 'bMc', 'mc', 'aMc'],
  },
  {
    header: t('MSG_TXT_FXAM'),
    direction: 'horizontal',
    items: ['tbFxam', 'tFxam', 'bFxam', 'fxam', 'aFxam'],
  },
  {
    header: t('MSG_TXT_ACL_ACTI'),
    direction: 'horizontal',
    items: ['col163', 'col164', 'col165', 'col166', 'col167'],
  },
  {
    header: t('MSG_TXT_REDF_FEE'),
    direction: 'horizontal',
    items: ['wpEnvrPrRedf', 'wpEnvrExcpPrRedf', 'sellEncrgRedf', 'wpEnvrOgRedf', 'wpOgSellEncrgRedf', 'wpSettleRedfBrch', 'wpFxamRedfBrch', 'sumWpRedfBrch'],
  },
  'dlqRedfAmt',
];

// 처리유형 - 연체 선택 시
const dlqColumnLayout = [
  'baseYm', 'perfYm', 'prtnrNo', 'prtnrKnm', 'ogTpNm', 'perfDvNm',
  {
    header: t('MSG_TXT_REDF_PERF'),
    direction: 'horizontal',
    items: ['col182', 'col183'],
  },
  {
    header: t('MSG_TXT_DLQ_REDF_PERF'),
    direction: 'horizontal',
    items: ['col185', 'col186', 'col184'],
  },
];

/* MSG_TXT_PERF_YM(from, to), 직책구분, 처리유형 변경 시 layout 변경 */
watch(() => [searchParams.value.perfYmFrom,
  searchParams.value.perfYmTo,
  searchParams.value.rsbDvCd,
  searchParams.value.redfAdsbTpCd,
  searchParams.value.ogTpCd], async () => {
  /* 변경 값 감지 시, 그리드 초기화 */
  grdMainRef.value.getData().clearRows();
  const view = grdMainRef.value.getView();

  if (searchParams.value.redfAdsbTpCd === '0202' && searchParams.value.ogTpCd !== 'W01') {
    if (searchParams.value.perfYmTo <= '201903' && searchParams.value.rsbDvCd === '01') {
      /* 2019년 3월 이전, 직책구분 - 지구장 이하 */
      view.setColumnLayout(perfLast201903AndDstrcColumnLayout);
      return;
    }
    /* 2019년 04월 ~ 2020년 12월, 직책구분 - 지구장 이하 */
    if (searchParams.value.perfYmFrom >= '201904' && searchParams.value.perfYmTo <= '202012' && searchParams.value.rsbDvCd === '01') {
      view.setColumnLayout(perf201904Between202012AndDstrcColumnLayout);
      return;
    }
    /* 2021년 01월 이후, 직책구분 - 지구장 이하 */
    if (searchParams.value.perfYmFrom >= '202101' && searchParams.value.rsbDvCd === '01') {
      view.setColumnLayout(perfAfter202101AndDstrcColumnLayout);
      return;
    }
    /* 실적년월이 중복되는 경우, 직책구분 - 지구장 이하 */
    if (searchParams.value.rsbDvCd === '01') {
      view.setColumnLayout(perfAllAndDstrcColumnLayout);
      return;
    }

    if (searchParams.value.perfYmTo <= '201903' && searchParams.value.rsbDvCd === '02') {
      /* 2019년 3월 이전, 직책구분 - 지점장 이상 */
      view.setColumnLayout(perfLast201903AndBrchColumnLayout);
      return;
    }
    /* 2019년 04월 ~ 2020년 12월, 직책구분 - 지점장 이상 */
    if (searchParams.value.perfYmFrom >= '201904' && searchParams.value.perfYmTo <= '202012' && searchParams.value.rsbDvCd === '02') {
      view.setColumnLayout(perf201904Between202012AndBrchColumnLayout);
      return;
    }
    /* 2021년 01월 이후, 직책구분 - 지점장 이상 */
    if (searchParams.value.perfYmFrom >= '202101' && searchParams.value.rsbDvCd === '02') {
      view.setColumnLayout(perfAfter202101AndBrchColumnLayout);
      return;
    }
    /* 실적년월이 중복되는 경우, 직책구분 - 지점장 이상 */
    if (searchParams.value.rsbDvCd === '02') {
      view.setColumnLayout(perfAllAndBrchColumnLayout);
    }
  }

  if (searchParams.value.redfAdsbTpCd === '0202' && searchParams.value.ogTpCd === 'W01') {
    if (searchParams.value.rsbDvCd === '01') {
      /* 조직유형이 WELLS-P, 직책구분이 지구장 이하일 때 */
      view.setColumnLayout(wpAndDstrcColumnLayout);
    } else if (searchParams.value.rsbDvCd === '02') {
      /* 조직유형이 WELLS-P, 직책구분이 지점장 이상일 때 */
      view.setColumnLayout(wpAndBrchColumnLayout);
    }
  }

  /* 처리유형이 연체인 경우 */
  if (searchParams.value.redfAdsbTpCd === '0203') {
    view.setColumnLayout(dlqColumnLayout);
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'perfYm' },
    { fieldName: 'baseYm' },
    { fieldName: 'ogCd' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'pstnDvCd' },
    { fieldName: 'qlfDvNm' },
    { fieldName: 'qlfDvNm1' },
    { fieldName: 'dstrcGd' },
    { fieldName: 'atdcDc' },
    { fieldName: 'perfDvCd' },
    { fieldName: 'brchDec' },
    { fieldName: 'marchDstrcYn' },
    { fieldName: 'chYm' },
    { fieldName: 'educCpcMm' },
    { fieldName: 'aksd48Yn' },
    { fieldName: 'edu17Yn' },
    { fieldName: 'sellAmt', dataType: 'number' },
    { fieldName: 'ackmtPerfRt' },
    { fieldName: 'oneteamYn' },
    { fieldName: 'homeCare' },

    /* 환경가전 */
    { fieldName: 'tEnvrElhm', dataType: 'number' },
    { fieldName: 'bEnvrElhm', dataType: 'number' },
    { fieldName: 'envrElhm', dataType: 'number' },
    { fieldName: 'aEnvrElhm', dataType: 'number' },
    { fieldName: 'tbEnvrElhmCnt', dataType: 'number' },
    { fieldName: 'tEnvrElhmCnt', dataType: 'number' },
    { fieldName: 'bEnvrElhmCnt', dataType: 'number' },
    { fieldName: 'envrElhmCnt', dataType: 'number' },
    { fieldName: 'aEnvrElhmCnt', dataType: 'number' },
    { fieldName: 'tbEnvrElhmCntJo', dataType: 'number' },
    { fieldName: 'tEnvrElhmCntJo', dataType: 'number' },
    { fieldName: 'bEnvrElhmCntJo', dataType: 'number' },
    { fieldName: 'envrElhmCntJo', dataType: 'number' },
    { fieldName: 'aEnvrElhmCntJo', dataType: 'number' },
    { fieldName: 'tbEnvrElhmCntPr', dataType: 'number' },
    { fieldName: 'tEnvrElhmCntPr', dataType: 'number' },
    { fieldName: 'bEnvrElhmCntPr', dataType: 'number' },
    { fieldName: 'envrElhmCntPr', dataType: 'number' },
    { fieldName: 'aEnvrElhmCntPr', dataType: 'number' },
    { fieldName: 'tEnvrElhmBaseAmt', dataType: 'number' },
    { fieldName: 'bEnvrElhmBaseAmt', dataType: 'number' },
    { fieldName: 'envrElhmBaseAmt', dataType: 'number' },
    { fieldName: 'aEnvrElhmBaseAmt', dataType: 'number' },

    /* 환경가전 렌탈 */
    { fieldName: 'tbEnvrElhmRental', dataType: 'number' },
    { fieldName: 'tEnvrElhmRental', dataType: 'number' },
    { fieldName: 'bEnvrElhmRental', dataType: 'number' },
    { fieldName: 'envrElhmRental', dataType: 'number' },
    { fieldName: 'aEnvrElhmRental', dataType: 'number' },
    { fieldName: 'tbEnvrElhmRentalJo', dataType: 'number' },
    { fieldName: 'tEnvrElhmRentalJo', dataType: 'number' },
    { fieldName: 'bEnvrElhmRentalJo', dataType: 'number' },
    { fieldName: 'envrElhmRentalJo', dataType: 'number' },
    { fieldName: 'aEnvrElhmRentalJo', dataType: 'number' },
    { fieldName: 'tbEnvrElhmRentalPr', dataType: 'number' },
    { fieldName: 'tEnvrElhmRentalPr', dataType: 'number' },
    { fieldName: 'bEnvrElhmRentalPr', dataType: 'number' },
    { fieldName: 'envrElhmRentalPr', dataType: 'number' },
    { fieldName: 'aEnvrElhmRentalPr', dataType: 'number' },

    /* 환경가전 일시불 */
    { fieldName: 'tEnvrElhmSpay', dataType: 'number' },
    { fieldName: 'bEnvrElhmSpay', dataType: 'number' },
    { fieldName: 'envrElhmSpay', dataType: 'number' },
    { fieldName: 'aEnvrElhmSpay', dataType: 'number' },
    { fieldName: 'tbEnvrElhmSpayJo', dataType: 'number' },
    { fieldName: 'tEnvrElhmSpayJo', dataType: 'number' },
    { fieldName: 'bEnvrElhmSpayJo', dataType: 'number' },
    { fieldName: 'envrElhmSpayJo', dataType: 'number' },
    { fieldName: 'aEnvrElhmSpayJo', dataType: 'number' },
    { fieldName: 'tbEnvrElhmSpayPr', dataType: 'number' },
    { fieldName: 'tEnvrElhmSpayPr', dataType: 'number' },
    { fieldName: 'bEnvrElhmSpayPr', dataType: 'number' },
    { fieldName: 'envrElhmSpayPr', dataType: 'number' },
    { fieldName: 'aEnvrElhmSpayPr', dataType: 'number' },
    { fieldName: 'tEnvrElhmExcp', dataType: 'number' },
    { fieldName: 'bEnvrElhmExcp', dataType: 'number' },
    { fieldName: 'envrElhmExcp', dataType: 'number' },
    { fieldName: 'aEnvrElhmExcp', dataType: 'number' },
    { fieldName: 'tbEnvrElhmExcpJo', dataType: 'number' },
    { fieldName: 'tEnvrElhmExcpJo', dataType: 'number' },
    { fieldName: 'bEnvrElhmExcpJo', dataType: 'number' },
    { fieldName: 'envrElhmExcpJo', dataType: 'number' },
    { fieldName: 'aEnvrElhmExcpJo', dataType: 'number' },
    { fieldName: 'tbEnvrElhmExcpPr', dataType: 'number' },
    { fieldName: 'tEnvrElhmExcpPr', dataType: 'number' },
    { fieldName: 'bEnvrElhmExcpPr', dataType: 'number' },
    { fieldName: 'envrElhmExcpPr', dataType: 'number' },
    { fieldName: 'aEnvrElhmExcpPr', dataType: 'number' },

    /* 환경가전외 정액 */
    { fieldName: 'tEnvrElhmExcpFxam', dataType: 'number' },
    { fieldName: 'bEnvrElhmExcpFxam', dataType: 'number' },
    { fieldName: 'envrElhmExcpFxam', dataType: 'number' },
    { fieldName: 'aEnvrElhmExcpFxam', dataType: 'number' },

    { fieldName: 'tbEnvrElhmExcpFxamPr', dataType: 'number' },
    { fieldName: 'tEnvrElhmExcpFxamPr', dataType: 'number' },
    { fieldName: 'bEnvrElhmExcpFxamPr', dataType: 'number' },
    { fieldName: 'envrElhmExcpFxamPr', dataType: 'number' },
    { fieldName: 'aEnvrElhmExcpFxamPr', dataType: 'number' },
    { fieldName: 'tbNwSellCntPr', dataType: 'number' },
    { fieldName: 'tNwSellCntPr', dataType: 'number' },
    { fieldName: 'bNwSellCntPr', dataType: 'number' },
    { fieldName: 'nwSellCntPr', dataType: 'number' },
    { fieldName: 'aNwSellCntPr', dataType: 'number' },

    { fieldName: 'mcPerf', dataType: 'number' }, // 기변실적

    { fieldName: 'mchnChRedf201903', dataType: 'number' }, // 기변수당
    { fieldName: 'mchnChRedf201904', dataType: 'number' }, // 기기변경
    { fieldName: 'spRedf', dataType: 'number' },
    { fieldName: 'homeCareRedf', dataType: 'number' }, // MSG_TXT_HOME_CARE
    { fieldName: 'envrTrgRedf', dataType: 'number' },
    { fieldName: 'envrBznsRedf201903', dataType: 'number' },
    { fieldName: 'envrMetgRedf', dataType: 'number' },
    { fieldName: 'envrOgRedf', dataType: 'number' },
    { fieldName: 'envrBznsRedf201904', dataType: 'number' }, // 환경가전 비례
    { fieldName: 'envrExcpBznsRedf201903', dataType: 'number' },
    { fieldName: 'envrExcpMetgRedf', dataType: 'number' },
    { fieldName: 'envrExcpBznsRedf201904', dataType: 'number' }, // 환경가전외 비례
    { fieldName: 'envrExcpOgRedf201903', dataType: 'number' },
    { fieldName: 'envrExcpOgMetgRedf', dataType: 'number' },
    { fieldName: 'envrExcpOgRedf201904', dataType: 'number' },
    { fieldName: 'ogSellEncrgRedf', dataType: 'number' },
    { fieldName: 'nwSellRedf', dataType: 'number' },
    { fieldName: 'sellEncrgRedf', dataType: 'number' }, // 판매장려
    // { fieldName: 'ogMgtRedf' },
    { fieldName: 'eduRedf', dataType: 'number' }, // 교육
    { fieldName: 'settleRedf', dataType: 'number' }, // 정착
    { fieldName: 'sellEncrgRettRedf', dataType: 'number' }, // 판매장려 소급
    // { fieldName: 'envrOgRedf' },
    { fieldName: 'envrOgMetg', dataType: 'number' },
    // { fieldName: 'envrExcpOgRedf201904' },
    // { fieldName: 'envrExcpOgMetgRedf' },
    { fieldName: 'tRedfPpl', dataType: 'number' },
    { fieldName: 'bRedfPpl', dataType: 'number' },
    { fieldName: 'redfPpl', dataType: 'number' },
    { fieldName: 'aRedfPpl', dataType: 'number' },
    { fieldName: 'cpsnRedfYn', dataType: 'number' }, // 강제되물림 포함여부
    { fieldName: 'tbNwSellCntJo', dataType: 'number' },
    { fieldName: 'tNwSellCntJo', dataType: 'number' },
    { fieldName: 'bNwSellCntJo', dataType: 'number' },
    { fieldName: 'nwSellCntJo', dataType: 'number' },
    { fieldName: 'aNwSellCntJo', dataType: 'number' },
    { fieldName: 'tbSellCntPr', dataType: 'number' },
    { fieldName: 'tSellCntPr', dataType: 'number' },
    { fieldName: 'bSellCntPr', dataType: 'number' },
    { fieldName: 'sellCntPr', dataType: 'number' },
    { fieldName: 'aSellCntPr', dataType: 'number' },
    { fieldName: 'tbOgMgtPpl', dataType: 'number' },
    { fieldName: 'tOgMgtPpl', dataType: 'number' },
    { fieldName: 'bOgMgtPpl', dataType: 'number' },
    { fieldName: 'ogMgtPpl', dataType: 'number' },
    { fieldName: 'aOgMgtPpl', dataType: 'number' },
    { fieldName: 'wpChYm' },
    { fieldName: 'tbEnvrElhm', dataType: 'number' },
    { fieldName: 'tbMc', dataType: 'number' },
    { fieldName: 'tMc', dataType: 'number' },
    { fieldName: 'bMc', dataType: 'number' },
    { fieldName: 'mc', dataType: 'number' },
    { fieldName: 'aMc', dataType: 'number' },
    { fieldName: 'tbFxam', dataType: 'number' },
    { fieldName: 'tFxam', dataType: 'number' },
    { fieldName: 'bFxam', dataType: 'number' },
    { fieldName: 'fxam', dataType: 'number' },
    { fieldName: 'aFxam', dataType: 'number' },
    { fieldName: 'tbEnvrElhmExcp', dataType: 'number' },
    { fieldName: 'col163', dataType: 'number' },
    { fieldName: 'col164', dataType: 'number' },
    { fieldName: 'col165', dataType: 'number' },
    { fieldName: 'col166', dataType: 'number' },
    { fieldName: 'col167', dataType: 'number' },
    { fieldName: 'wpEnvrPrRedf', dataType: 'number' },
    { fieldName: 'wpEnvrExcpPrRedf', dataType: 'number' },
    { fieldName: 'wpPrSellEncrgRedf', dataType: 'number' },
    { fieldName: 'wpOgSellEncrgRedf', dataType: 'number' }, // wells-p 조직판매장려
    { fieldName: 'wpEnvrOgRedf', dataType: 'number' },
    { fieldName: 'wpEnvrExcpOgRedf', dataType: 'number' },
    { fieldName: 'wpFxamRedfDstrc', dataType: 'number' },
    { fieldName: 'dlqRedfAmt', dataType: 'number' },
    // { fieldName: 'wpEnvrPrRedf' },
    // { fieldName: 'wpEnvrExcpPrRedf' },
    { fieldName: 'wpMetgRedf', dataType: 'number' },
    { fieldName: 'wpSettleRedfBrch', dataType: 'number' },
    { fieldName: 'wpSettleRedfDstrc', dataType: 'number' },
    { fieldName: 'wpFxamRedfBrch', dataType: 'number' },
    { fieldName: 'ogTpNm', dataType: 'number' },
    { fieldName: 'perfDvNm', dataType: 'number' },
    { fieldName: 'col182', dataType: 'number' },
    { fieldName: 'col183', dataType: 'number' },
    { fieldName: 'col184', dataType: 'number' },
    { fieldName: 'col185', dataType: 'number' },
    { fieldName: 'col186', dataType: 'number' },
    { fieldName: 'sumPerfLast201903RedfDstrc', dataType: 'number' },
    { fieldName: 'sumPerf201904Between202012RedfDstrc', dataType: 'number' },
    { fieldName: 'sumPerf202101RedfDstrc', dataType: 'number' },
    { fieldName: 'sumPerfAllRedfDstrc', dataType: 'number' },
    { fieldName: 'sumPerfLast201903RedfBrch', dataType: 'number' },
    { fieldName: 'sumPerf201904Between202012RedfBrch', dataType: 'number' },
    { fieldName: 'sumPerf202101RedfBrch', dataType: 'number' },
    { fieldName: 'sumPerfAllRedfBrch', dataType: 'number' },
    { fieldName: 'sumWpRedfDstrc', dataType: 'number' },
    { fieldName: 'sumWpRedfBrch', dataType: 'number' },
    { fieldName: 'ogMgtRedf', dataType: 'number' },

  ];

  const columns = [
    // 기준정보
    { fieldName: 'perfYm', header: t('MSG_TXT_PERF_YM'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM' },
    { fieldName: 'baseYm', header: t('MSG_TXT_YEAR_OCCURNCE'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM' },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_CRLV'), width: '100', styleName: 'text-center' },
    { fieldName: 'qlfDvNm', header: t('MSG_TXT_QLF'), width: '100', styleName: 'text-center' },
    { fieldName: 'qlfDvNm1', header: t('MSG_TXT_QLF_AFT_MM'), width: '100', styleName: 'text-center' },
    { fieldName: 'dstrcGd', header: t('MSG_TXT_DSTRC_GD'), width: '100', styleName: 'text-center' },
    { fieldName: 'atdcDc', header: t('MSG_TXT_METG'), width: '100', styleName: 'text-center' },
    { fieldName: 'perfDvCd', header: t('MSG_TXT_DIV'), width: '100', styleName: 'text-center' },
    { fieldName: 'brchDec', header: t('MSG_TXT_BRCH_DCL'), width: '100', styleName: 'text-center' },
    { fieldName: 'marchDstrcYn', header: t('MSG_TXT_MAR_DSTRC'), width: '100', styleName: 'text-center' },
    { fieldName: 'chYm', header: t('MSG_TXT_TOPMR_UPGR_BASE_MM'), width: '120', styleName: 'text-center', datetimeFormat: 'YYYY-MM' },
    { fieldName: 'educCpcMm', header: t('MSG_TXT_TOPMR_SETTLE_CPC_MM'), width: '120', styleName: 'text-center' },
    { fieldName: 'aksd48Yn', header: t('MSG_TXT_SETTLE_DSB_YN'), width: '120', styleName: 'text-center' },
    { fieldName: 'edu17Yn', header: t('MSG_TXT_PLAR_PRTIC_CPC_YN'), width: '140', styleName: 'text-center' },
    { fieldName: 'sellAmt', header: t('MSG_TXT_BLNG_MM_SL'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'ackmtPerfRt', header: t('MSG_TXT_PYT_RT'), width: '100', styleName: 'text-center' },
    { fieldName: 'oneteamYn', header: t('MSG_TXT_SLTR_DSTRC'), width: '100', styleName: 'text-center' },
    { fieldName: 'wpChYm', header: t('MSG_TXT_UPGR_YM'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM' },
    { fieldName: 'ogTpNm', header: t('MSG_TXT_OG_TP'), width: '100', styleName: 'text-center' },
    { fieldName: 'perfDvNm', header: t('MSG_TXT_PERF_DV'), width: '100', styleName: 'text-center' },

    { fieldName: 'homeCare', header: t('MSG_TXT_HOME_CARE_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },

    // 환경가전
    // 환경가전 /* WELLS-P + 지점장 이상, 귀속전월실적 추가 */
    { fieldName: 'tbEnvrElhm', header: t('MSG_TXT_BLNG_LSTMM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'tEnvrElhm', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhm', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhm', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhm', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

    // 기변
    { fieldName: 'tbMc', header: t('MSG_TXT_BLNG_LSTMM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'tMc', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bMc', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'mc', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aMc', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

    // 정액
    { fieldName: 'tbFxam', header: t('MSG_TXT_BLNG_LSTMM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'tFxam', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bFxam', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'fxam', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aFxam', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

    // 환경가전(건수)
    { fieldName: 'tbEnvrElhmCnt', header: t('MSG_TXT_BLNG_LSTMM_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'tEnvrElhmCnt', header: t('MSG_TXT_BLNG_MM_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmCnt', header: t('MSG_TXT_REDF_BF_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmCnt', header: t('MSG_TXT_REDF_PERF1'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmCnt', header: t('MSG_TXT_REDF_AF_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },

    // 환경가전 건수(조직)
    { fieldName: 'tbEnvrElhmCntJo', header: t('MSG_TXT_BLNG_LSTMM_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'tEnvrElhmCntJo', header: t('MSG_TXT_BLNG_MM_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmCntJo', header: t('MSG_TXT_REDF_BF_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmCntJo', header: t('MSG_TXT_REDF_PERF1'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmCntJo', header: t('MSG_TXT_REDF_AF_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },

    // 환경가전 건수(개인)
    { fieldName: 'tbEnvrElhmCntPr', header: t('MSG_TXT_BLNG_LSTMM_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'tEnvrElhmCntPr', header: t('MSG_TXT_BLNG_MM_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmCntPr', header: t('MSG_TXT_REDF_BF_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmCntPr', header: t('MSG_TXT_REDF_PERF1'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmCntPr', header: t('MSG_TXT_REDF_AF_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },

    // 환경가전(기준가격)
    { fieldName: 'tEnvrElhmBaseAmt', header: t('MSG_TXT_BLNG_MM_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmBaseAmt', header: t('MSG_TXT_REDF_BF_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmBaseAmt', header: t('MSG_TXT_REDF_PERF1'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmBaseAmt', header: t('MSG_TXT_REDF_AF_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },

    // 환경가전 렌탈
    { fieldName: 'tbEnvrElhmRental', header: t('MSG_TXT_BLNG_LSTMM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'tEnvrElhmRental', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmRental', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmRental', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmRental', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

    // // 환경가전 렌탈(조직)
    { fieldName: 'tbEnvrElhmRentalJo', header: t('MSG_TXT_BLNG_LSTMM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'tEnvrElhmRentalJo', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmRentalJo', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmRentalJo', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmRentalJo', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

    // // 환경가전 렌탈(개인)
    { fieldName: 'tbEnvrElhmRentalPr', header: t('MSG_TXT_BLNG_LSTMM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'tEnvrElhmRentalPr', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmRentalPr', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmRentalPr', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmRentalPr', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

    // 환경가전 일시불
    { fieldName: 'tEnvrElhmSpay', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmSpay', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmSpay', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmSpay', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

    // 환경가전 일시불(조직)
    { fieldName: 'tbEnvrElhmSpayJo', header: t('MSG_TXT_BLNG_LSTMM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'tEnvrElhmSpayJo', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmSpayJo', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmSpayJo', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmSpayJo', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

    // 환경가전 일시불(개인)
    { fieldName: 'tbEnvrElhmSpayPr', header: t('MSG_TXT_BLNG_LSTMM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'tEnvrElhmSpayPr', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmSpayPr', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmSpayPr', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmSpayPr', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

    // 환경가전외
    // 환경가전외 /* WELLS-P + 지점장 이상, 귀속전월실적 추가 */
    { fieldName: 'tbEnvrElhmExcp', header: t('MSG_TXT_BLNG_LSTMM_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'tEnvrElhmExcp', header: t('MSG_TXT_BLNG_MM_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmExcp', header: t('MSG_TXT_REDF_BF_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmExcp', header: t('MSG_TXT_REDF_PERF1'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmExcp', header: t('MSG_TXT_REDF_AF_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },

    // 환경가전외 일시불(조직)
    { fieldName: 'tbEnvrElhmExcpJo', header: t('MSG_TXT_BLNG_LSTMM_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'tEnvrElhmExcpJo', header: t('MSG_TXT_BLNG_MM_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmExcpJo', header: t('MSG_TXT_REDF_BF_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmExcpJo', header: t('MSG_TXT_REDF_PERF1'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmExcpJo', header: t('MSG_TXT_REDF_AF_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },

    // 환경가전외 일시불(개인)
    { fieldName: 'tbEnvrElhmExcpPr', header: t('MSG_TXT_BLNG_LSTMM_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'tEnvrElhmExcpPr', header: t('MSG_TXT_BLNG_MM_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmExcpPr', header: t('MSG_TXT_REDF_BF_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmExcpPr', header: t('MSG_TXT_REDF_PERF1'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmExcpPr', header: t('MSG_TXT_REDF_AF_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },

    // 환경가전외 정액
    { fieldName: 'tEnvrElhmExcpFxam', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmExcpFxam', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmExcpFxam', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmExcpFxam', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

    // 환경가전외 정액(개인)
    { fieldName: 'tbEnvrElhmExcpFxamPr', header: t('MSG_TXT_BLNG_LSTMM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'tEnvrElhmExcpFxamPr', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bEnvrElhmExcpFxamPr', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrElhmExcpFxamPr', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aEnvrElhmExcpFxamPr', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

    // 환경가전 정액(개인)
    { fieldName: 'tbNwSellCntPr', header: t('MSG_TXT_BLNG_LSTMM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'tNwSellCntPr', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bNwSellCntPr', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'nwSellCntPr', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aNwSellCntPr', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

    { fieldName: 'mcPerf', header: t('MSG_TXT_MCHN_CH_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },

    // 되물림 수수료
    { fieldName: 'mchnChRedf201903', header: t('MSG_TXT_CHNG_AW'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'mchnChRedf201904', header: t('MSG_TXT_MCHN_CH'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 기기변경
    { fieldName: 'spRedf', header: t('MSG_TXT_TOPMR_PLAR'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'homeCareRedf', header: t('MSG_TXT_HOME_CARE'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // MSG_TXT_HOME_CARE
    { fieldName: 'envrTrgRedf', header: t('MSG_TXT_ENVR_ELHM_TRG_ACHV'), width: '125', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrBznsRedf201903', header: t('MSG_TXT_ENVR_ELHM_BZNS'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrMetgRedf', header: t('MSG_TXT_ENVR_ELHM_METG'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrOgRedf', header: t('MSG_TXT_ENVR_ELHM_OG'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 지구장 이하
    { fieldName: 'envrBznsRedf201904', header: t('MSG_TXT_ENVR_ELHM_PRPN'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 환경가전 비례
    { fieldName: 'envrExcpBznsRedf201903', header: t('MSG_TXT_ENVR_ELHM_EXCP_BZNS'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrExcpMetgRedf', header: t('MSG_TXT_ENVR_ELHM_EXCP_METG'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrExcpBznsRedf201904', header: t('MSG_TXT_ENVR_ELHM_EXCP_PRPN'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 환경가전외 비례
    { fieldName: 'envrExcpOgRedf201903', header: t('MSG_TXT_ENVR_ELHM_EXCP_OG'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrExcpOgMetgRedf', header: t('MSG_TXT_ENVR_ELHM_EXCP_OG_METG'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrExcpOgRedf201904', header: t('MSG_TXT_ENVR_ELHM_EXCP_OG_PRPN'), width: '140', styleName: 'text-right', numberFormat: '#,##0' }, // 지구장 이하
    { fieldName: 'ogSellEncrgRedf', header: t('MSG_TXT_OG_SELL_ENCRG'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'wpOgSellEncrgRedf', header: t('MSG_TXT_OG_SELL_ENCRG'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'nwSellRedf', header: t('MSG_TXT_NW_SELL'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'sellEncrgRedf', header: t('MSG_TXT_INDV_SELL_ENCRG'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 판매장려
    { fieldName: 'ogMgtRedf', header: t('MSG_TIT_OG_MNGT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'eduRedf', header: t('MSG_TXT_EDUC'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 교육
    { fieldName: 'settleRedf', header: t('MSG_TXT_STMNT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 지구장 이하 // 정착
    { fieldName: 'sellEncrgRettRedf', header: t('MSG_TXT_SAL_ICEN_RETR1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 판매장려 소급
    { fieldName: 'envrOgRedf', header: t('MSG_TXT_ENVR_ELHM_OG'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 지점장 이상
    { fieldName: 'envrOgMetg', header: t('MSG_TXT_ENVR_ELHM_OG_METG'), width: '140', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'envrExcpOgRedf201904', header: t('MSG_TXT_ENVR_ELHM_EXCP_OG_PRPN'), width: '140', styleName: 'text-right', numberFormat: '#,##0' }, // 지점장 이상
    { fieldName: 'envrExcpOgMetgRedf', header: t('MSG_TXT_ENVR_ELHM_OG_EXCP_METG'), width: '140', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'wpEnvrPrRedf', header: t('MSG_TXT_ELHM_INDV_PRPN'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 지점장 이상 (가전 개인비례)
    { fieldName: 'wpEnvrExcpPrRedf', header: t('MSG_TXT_ELHM_EXCP_INDV_PRPN'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 지점장 이상 (가전 외 개인비례)
    { fieldName: 'wpPrSellEncrgRedf', header: t('MSG_TXT_SAL_INTV'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'wpEnvrOgRedf', header: t('MSG_TXT_ELHM_OG_PRPN'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'wpEnvrExcpOgRedf', header: t('MSG_TXT_ELHM_EXCP_OG_PRPN'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'wpFxamRedfDstrc', header: t('MSG_TXT_FXAM'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 지구장 이하
    { fieldName: 'dlqRedfAmt', header: t('MSG_TXT_DLQ_REDF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'wpEnvrPrRedf', header: t('MSG_TXT_ELHM'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 지구장 이하 (가전 개인비례)
    { fieldName: 'wpEnvrExcpPrRedf', header: t('MSG_TXT_ELHM_EXCP_PRPN'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 지구장 이하 (가전 외 개인비례)
    { fieldName: 'wpMetgRedf', header: t('MSG_TXT_METG'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 지구장 이하
    { fieldName: 'wpSettleRedfBrch', header: t('MSG_TXT_STMNT'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 지점장 이상
    { fieldName: 'wpSettleRedfDstrc', header: t('MSG_TXT_STMNT'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 지구장 이하
    { fieldName: 'wpFxamRedfBrch', header: t('MSG_TXT_FXAM'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 지점장 이상
    { fieldName: 'col182', header: t('MSG_TXT_RENTAL'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 되물림실적
    { fieldName: 'col183', header: t('MSG_TXT_ELHM_EXCP_SPAY_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 되물림실적.가전외 일시불 실적
    { fieldName: 'col184', header: t('MSG_TXT_AGG'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 연체되물림실적.계
    { fieldName: 'col185', header: t('MSG_TXT_RENTAL'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 연체되물림실적
    { fieldName: 'col186', header: t('MSG_TXT_ELHM_EXCP_SPAY_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 연체되물림실적.가전외 일시불 실적
    { fieldName: 'sumPerfLast201903RedfDstrc', header: t('MSG_TXT_REDF_SUM_AMT'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 2019년 3월 이전 + 지구장 이하 되물림합계
    { fieldName: 'sumPerf201904Between202012RedfDstrc', header: t('MSG_TXT_REDF_SUM_AMT'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 실적년월 2019년 04월 ~ 2020년 12월 + 지구장 이하 되물림합계
    { fieldName: 'sumPerf202101RedfDstrc', header: t('MSG_TXT_REDF_SUM_AMT'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 실적년월 2021년 1월 이후 + 지구장 이하 되물림합계
    { fieldName: 'sumPerfAllRedfDstrc', header: t('MSG_TXT_REDF_SUM_AMT'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 실적년월 전기간 + 지구장 이하 되물림합계
    { fieldName: 'sumPerfLast201903RedfBrch', header: t('MSG_TXT_REDF_SUM_AMT'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 2019년 3월 이전 + 지점장 이상 되물림합계
    { fieldName: 'sumPerf201904Between202012RedfBrch', header: t('MSG_TXT_REDF_SUM_AMT'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 실적년월 2019년 04월 ~ 2020년 12월 + 지점장 이상 되물림합계
    { fieldName: 'sumPerf202101RedfBrch', header: t('MSG_TXT_REDF_SUM_AMT'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 실적년월 2021년 1월 이후 + 지점장 이상 되물림합계
    { fieldName: 'sumPerfAllRedfBrch', header: t('MSG_TXT_REDF_SUM_AMT'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // 실적년월 전기간 + 지점장 이상 되물림합계
    { fieldName: 'sumWpRedfDstrc', header: t('MSG_TXT_REDF_SUM_AMT'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // WELLS-P + 지구장 이하
    { fieldName: 'sumWpRedfBrch', header: t('MSG_TXT_REDF_SUM_AMT'), width: '120', styleName: 'text-right', numberFormat: '#,##0' }, // WELLS-P + 지점장 이상

    // 적채용
    { fieldName: 'tRedfPpl', header: t('MSG_TXT_BLNG_MM_PPL'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bRedfPpl', header: t('MSG_TXT_REDF_BF_PPL'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'redfPpl', header: t('MSG_TXT_REDF_PPL'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aRedfPpl', header: t('MSG_TXT_REDF_AF_PPL'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },

    { fieldName: 'cpsnRedfYn', header: t('MSG_TXT_CPSN_REDF_INC_YN'), width: '140', styleName: 'text-right', numberFormat: '#,##0' }, // 강제되물림 포함여부

    // 신규판매 건수(조직)
    { fieldName: 'tbNwSellCntJo', header: t('MSG_TXT_BLNG_LSTMM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'tNwSellCntJo', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bNwSellCntJo', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'nwSellCntJo', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aNwSellCntJo', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

    // 신규판매 건수(개인)
    { fieldName: 'tbSellCntPr', header: t('MSG_TXT_BLNG_LSTMM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'tSellCntPr', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bSellCntPr', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'sellCntPr', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aSellCntPr', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

    // 조직관리 실활동(명)
    { fieldName: 'tbOgMgtPpl', header: t('MSG_TXT_LSTMM_CPR'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'tOgMgtPpl', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'bOgMgtPpl', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'ogMgtPpl', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aOgMgtPpl', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

    // 실활동
    { fieldName: 'col163', header: t('MSG_TXT_BLNG_LSTMM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col164', header: t('MSG_TXT_BLNG_MM_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col165', header: t('MSG_TXT_REDF_BF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col166', header: t('MSG_TXT_REDF_PERF1'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col167', header: t('MSG_TXT_REDF_AF_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(perfAfter202101AndDstrcColumnLayout);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      await fetchData();
    }
  };
}

</script>
