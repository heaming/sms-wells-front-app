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
- 수당(실적) 되물림 관리- 파트너 되물림 대상 집계 현황 조회 (통합)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('실적년월')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.perfYmFrom"
            v-model:to="searchParams.perfYmTo"
            :label="t('실적년월')"
            rules="date_range_required"
            type="month"
          />
        </kw-search-item>

        <kw-search-item
          :label="t('발생년월')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.redfAdsbOcYmFrom"
            v-model:to="searchParams.redfAdsbOcYmTo"
            :label="t('발생년월')"
            rules="date_range_required"
            type="month"
          />
        </kw-search-item>

        <kw-search-item :label="t('조직구분')">
          <kw-option-group
            v-model="searchParams.ogTpCd"
            type="radio"
            :options="filterOgTpCd"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item :label="t('처리유형')">
          <kw-select
            v-model="searchParams.redfAdsbTpCd"
            :options="filterRedfAdsbTpCd"
          />
        </kw-search-item>

        <kw-search-item :label="t('직책구분')">
          <kw-option-group
            v-model="searchParams.rsbDvCd"
            type="radio"
            :options="codes.DDTN_RPLC_RSB_DV_CD"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('소속코드')"
        >
          <kw-input
            v-model="searchParams.ogCd"
            icon="search"
            :label="t('소속코드')"
            rules="max:7|alpha_num"
            @click-icon="onClickSearchOgCd"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="t('파트너번호')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            type="number"
            icon="search"
            :label="t('파트너번호')"
            rules="max:10|numeric"
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
          :label="t('되물림 금액 생성')"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
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
  ogCd: '', // 소속코드

});

async function fetchData() {
  const res = await dataService.get('/sms/wells/deduction/redf/allowance-report/bizd-paging', { params: { ...cachedParams, ...pageInfo.value } });
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
  const res = await dataService.get('/sms/wells/deduction/redf//excel-download', { params: cachedParams });

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
    { fieldName: 'sellAmt' },
    { fieldName: 'ackmtPerfRt' },
    { fieldName: 'oneteamYn' },
    { fieldName: 'homeCare' },
    { fieldName: 'tEnvrElhm' },
    { fieldName: 'bEnvrElhm' },
    { fieldName: 'envrElhm' },
    { fieldName: 'aEnvrElhm' },
    { fieldName: 'tbEnvrElhmCnt' },
    { fieldName: 'tEnvrElhmCnt' },
    { fieldName: 'bEnvrElhmCnt' },
    { fieldName: 'envrElhmCnt' },
    { fieldName: 'aEnvrElhmCnt' },
    { fieldName: 'tbEnvrElhmCntJo' },
    { fieldName: 'tEnvrElhmCntJo' },
    { fieldName: 'bEnvrElhmCntJo' },
    { fieldName: 'envrElhmCntJo' },
    { fieldName: 'aEnvrElhmCntJo' },
    { fieldName: 'tbEnvrElhmCntPr' },
    { fieldName: 'tEnvrElhmCntPr' },
    { fieldName: 'bEnvrElhmCntPr' },
    { fieldName: 'envrElhmCntPr' },
    { fieldName: 'aEnvrElhmCntPr' },
    { fieldName: 'tEnvrElhmBaseAmt' },
    { fieldName: 'bEnvrElhmBaseAmt' },
    { fieldName: 'envrElhmBaseAmt' },
    { fieldName: 'aEnvrElhmBaseAmt' },
    { fieldName: 'tbEnvrElhmRental' },
    { fieldName: 'tEnvrElhmRental' },
    { fieldName: 'bEnvrElhmRental' },
    { fieldName: 'envrElhmRental' },
    { fieldName: 'aEnvrElhmRental' },
    { fieldName: 'tbEnvrElhmRentalJo' },
    { fieldName: 'tEnvrElhmRentalJo' },
    { fieldName: 'bEnvrElhmRentalJo' },
    { fieldName: 'envrElhmRentalJo' },
    { fieldName: 'aEnvrElhmRentalJo' },
    { fieldName: 'tbEnvrElhmRentalPr' },
    { fieldName: 'tEnvrElhmRentalPr' },
    { fieldName: 'bEnvrElhmRentalPr' },
    { fieldName: 'envrElhmRentalPr' },
    { fieldName: 'aEnvrElhmRentalPr' },
    { fieldName: 'tEnvrElhmSpay' },
    { fieldName: 'bEnvrElhmSpay' },
    { fieldName: 'envrElhmSpay' },
    { fieldName: 'aEnvrElhmSpay' },
    { fieldName: 'tbEnvrElhmSpayJo' },
    { fieldName: 'tEnvrElhmSpayJo' },
    { fieldName: 'bEnvrElhmSpayJo' },
    { fieldName: 'envrElhmSpayJo' },
    { fieldName: 'aEnvrElhmSpayJo' },
    { fieldName: 'tbEnvrElhmSpayPr' },
    { fieldName: 'tEnvrElhmSpayPr' },
    { fieldName: 'bEnvrElhmSpayPr' },
    { fieldName: 'envrElhmSpayPr' },
    { fieldName: 'aEnvrElhmSpayPr' },
    { fieldName: 'tEnvrElhmExcp' },
    { fieldName: 'bEnvrElhmExcp' },
    { fieldName: 'envrElhmExcp' },
    { fieldName: 'aEnvrElhmExcp' },
    { fieldName: 'tbEnvrElhmExcpJo' },
    { fieldName: 'tEnvrElhmExcpJo' },
    { fieldName: 'bEnvrElhmExcpJo' },
    { fieldName: 'envrElhmExcpJo' },
    { fieldName: 'aEnvrElhmExcpJo' },
    { fieldName: 'tbEnvrElhmExcpPr' },
    { fieldName: 'tEnvrElhmExcpPr' },
    { fieldName: 'bEnvrElhmExcpPr' },
    { fieldName: 'envrElhmExcpPr' },
    { fieldName: 'aEnvrElhmExcpPr' },
    { fieldName: 'tEnvrElhmExcpFxam' },
    { fieldName: 'bEnvrElhmExcpFxam' },
    { fieldName: 'envrElhmExcpFxam' },
    { fieldName: 'aEnvrElhmExcpFxam' },
    { fieldName: 'tbEnvrElhmExcpFxamPr' },
    { fieldName: 'tEnvrElhmExcpFxamPr' },
    { fieldName: 'bEnvrElhmExcpFxamPr' },
    { fieldName: 'envrElhmExcpFxamPr' },
    { fieldName: 'aEnvrElhmExcpFxamPr' },
    { fieldName: 'tbNwSellCntPr' },
    { fieldName: 'tNwSellCntPr' },
    { fieldName: 'bNwSellCntPr' },
    { fieldName: 'nwSellCntPr' },
    { fieldName: 'aNwSellCntPr' },
    { fieldName: 'mcPerf' },
    { fieldName: 'mchnChRedf201903' },
    { fieldName: 'mchnChRedf201904' },
    { fieldName: 'spRedf' },
    { fieldName: 'homeCareRedf' },
    { fieldName: 'envrTrgRedf' },
    { fieldName: 'envrBznsRedf201903' },
    { fieldName: 'envrMetgRedf' },
    { fieldName: 'envrOgRedf' },
    { fieldName: 'envrBznsRedf201904' },
    { fieldName: 'envrExcpBznsRedf201903' },
    { fieldName: 'envrExcpMetgRedf' },
    { fieldName: 'envrExcpBznsRedf201904' },
    { fieldName: 'envrExcpOgRedf201903' },
    { fieldName: 'envrExcpOgMetgRedf' },
    { fieldName: 'envrExcpOgRedf201904' },
    { fieldName: 'ogSellEncrgRedf' },
    { fieldName: 'nwSellRedf' },
    { fieldName: 'sellEncrgRedf' },
    { fieldName: 'ogMgtRedf' },
    { fieldName: 'eduRedf' },
    { fieldName: 'settleRedf' },
    { fieldName: 'sellEncrgRettRedf' },
    { fieldName: 'envrOgRedf' },
    { fieldName: 'envrOgMetg' },
    { fieldName: 'envrExcpOgRedf201904' },
    { fieldName: 'envrExcpOgMetgRedf' },
    { fieldName: 'col129' },
    { fieldName: 'tRedfPpl' },
    { fieldName: 'bRedfPpl' },
    { fieldName: 'redfPpl' },
    { fieldName: 'aRedfPpl' },
    { fieldName: 'cpsnRedfYn' },
    { fieldName: 'tbNwSellCntJo' },
    { fieldName: 'tNwSellCntJo' },
    { fieldName: 'bNwSellCntJo' },
    { fieldName: 'nwSellCntJo' },
    { fieldName: 'aNwSellCntJo' },
    { fieldName: 'tbSellCntPr' },
    { fieldName: 'tSellCntPr' },
    { fieldName: 'bSellCntPr' },
    { fieldName: 'sellCntPr' },
    { fieldName: 'aSellCntPr' },
    { fieldName: 'tbOgMgtPpl' },
    { fieldName: 'tOgMgtPpl' },
    { fieldName: 'bOgMgtPpl' },
    { fieldName: 'ogMgtPpl' },
    { fieldName: 'aOgMgtPpl' },
    { fieldName: 'wpChYm' },
    { fieldName: 'tbEnvrElhm' },
    { fieldName: 'tbMc' },
    { fieldName: 'tMc' },
    { fieldName: 'bMc' },
    { fieldName: 'mc' },
    { fieldName: 'aMc' },
    { fieldName: 'tbFxam' },
    { fieldName: 'tFxam' },
    { fieldName: 'bFxam' },
    { fieldName: 'fxam' },
    { fieldName: 'aFxam' },
    { fieldName: 'tbEnvrElhmExcp' },
    { fieldName: 'col163' },
    { fieldName: 'col164' },
    { fieldName: 'col165' },
    { fieldName: 'col166' },
    { fieldName: 'col167' },
    { fieldName: 'wpEnvrPrRedf' },
    { fieldName: 'wpEnvrExcpPrRedf' },
    { fieldName: 'wpPrSellEncrgRedf' },
    { fieldName: 'wpEnvrOgRedf' },
    { fieldName: 'wpEnvrExcpOgRedf' },
    { fieldName: 'wpFxamRedfDstrc' },
    { fieldName: 'dlqRedfAmt' },
    { fieldName: 'wpEnvrPrRedf' },
    { fieldName: 'wpEnvrExcpPrRedf' },
    { fieldName: 'wpMetgRedf' },
    { fieldName: 'wpSettleRedfBrch' },
    { fieldName: 'wpFxamRedfBrch' },
    { fieldName: 'ogTpNm' },
    { fieldName: 'perfDvNm' },
    { fieldName: 'col182' },
    { fieldName: 'col183' },
    { fieldName: 'col184' },
    { fieldName: 'col185' },
    { fieldName: 'col186' },

  ];

  const columns = [

    // 기준정보
    { fieldName: 'perfYm', header: t('실적년월'), width: '100', styleName: 'text-center' },
    { fieldName: 'baseYm', header: t('발생년월'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogCd', header: t('소속코드'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('성명'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('파트너번호'), width: '100', styleName: 'text-center' },
    { fieldName: 'pstnDvCd', header: t('직급'), width: '100', styleName: 'text-center' },
    { fieldName: 'qlfDvNm', header: t('자격'), width: '100', styleName: 'text-center' },
    { fieldName: 'qlfDvNm1', header: t('자격(M+1)'), width: '100', styleName: 'text-center' },
    { fieldName: 'dstrcGd', header: t('지구등급'), width: '100', styleName: 'text-center' },
    { fieldName: 'atdcDc', header: t('미팅'), width: '100', styleName: 'text-center' },
    { fieldName: 'perfDvCd', header: t('구분'), width: '100', styleName: 'text-center' },
    { fieldName: 'brchDec', header: t('지점순감'), width: '100', styleName: 'text-center' },
    { fieldName: 'marchDstrcYn', header: t('3월지구장'), width: '100', styleName: 'text-center' },
    { fieldName: 'chYm', header: t('수석승급기준월'), width: '120', styleName: 'text-center' },
    { fieldName: 'educCpcMm', header: t('수석정착 수료월'), width: '120', styleName: 'text-center' },
    { fieldName: 'aksd48Yn', header: t('정착 지급여부'), width: '120', styleName: 'text-center' },
    { fieldName: 'edu17Yn', header: t('플래너실전 수료여부'), width: '140', styleName: 'text-center' },
    { fieldName: 'sellAmt', header: t('귀속월매출'), width: '100', styleName: 'text-center' },
    { fieldName: 'ackmtPerfRt', header: t('지급률'), width: '100', styleName: 'text-center' },
    { fieldName: 'oneteamYn', header: t('단독지구'), width: '100', styleName: 'text-center' },
    { fieldName: 'wpChYm', header: t('승급년월'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogTpNm', header: t('조직유형'), width: '100', styleName: 'text-center' },
    { fieldName: 'perfDvNm', header: t('실적구분'), width: '100', styleName: 'text-center' },

    { fieldName: 'homeCare', header: t('홈케어실적'), width: '120', styleName: 'text-right' },

    // 환경가전
    // 환경가전 /* WELLS-P + 지점장 이상, 귀속전월실적 추가 */
    { fieldName: 'tbEnvrElhm', header: t('귀속전월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'tEnvrElhm', header: t('귀속월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'bEnvrElhm', header: t('되물림전실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'envrElhm', header: t('되물림실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'aEnvrElhm', header: t('되물림후실적'), width: '100', styleName: 'text-center' },

    // 기변
    { fieldName: 'tbMc', header: t('귀속전월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'tMc', header: t('귀속월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'bMc', header: t('되물림전실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'mc', header: t('되물림실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'aMc', header: t('되물림후실적'), width: '100', styleName: 'text-center' },

    // 정액
    { fieldName: 'tbFxam', header: t('귀속전월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'tFxam', header: t('귀속월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'bFxam', header: t('되물림전실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'fxam', header: t('되물림실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'aFxam', header: t('되물림후실적'), width: '100', styleName: 'text-center' },

    // 환경가전(건수)
    { fieldName: 'tbEnvrElhmCnt', header: t('귀속전월실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'tEnvrElhmCnt', header: t('귀속월실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'bEnvrElhmCnt', header: t('되물림전실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'envrElhmCnt', header: t('되물림실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'aEnvrElhmCnt', header: t('되물림후실적'), width: '120', styleName: 'text-right' },

    // 환경가전 건수(조직)
    { fieldName: 'tbEnvrElhmCntJo', header: t('귀속전월실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'tEnvrElhmCntJo', header: t('귀속월실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'bEnvrElhmCntJo', header: t('되물림전실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'envrElhmCntJo', header: t('되물림실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'aEnvrElhmCntJo', header: t('되물림후실적'), width: '120', styleName: 'text-right' },

    // 환경가전 건수(개인)
    { fieldName: 'tbEnvrElhmCntPr', header: t('귀속전월실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'tEnvrElhmCntPr', header: t('귀속월실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'bEnvrElhmCntPr', header: t('되물림전실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'envrElhmCntPr', header: t('되물림실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'aEnvrElhmCntPr', header: t('되물림후실적'), width: '120', styleName: 'text-right' },

    // 환경가전(기준가격)
    { fieldName: 'tEnvrElhmBaseAmt', header: t('귀속월실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'bEnvrElhmBaseAmt', header: t('되물림전실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'envrElhmBaseAmt', header: t('되물림실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'aEnvrElhmBaseAmt', header: t('되물림후실적'), width: '120', styleName: 'text-right' },

    // 환경가전 렌탈
    { fieldName: 'tbEnvrElhmRental', header: t('귀속전월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'tEnvrElhmRental', header: t('귀속월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'bEnvrElhmRental', header: t('되물림전실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'envrElhmRental', header: t('되물림실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'aEnvrElhmRental', header: t('되물림후실적'), width: '100', styleName: 'text-center' },

    // 환경가전 렌탈(조직)
    { fieldName: 'tbEnvrElhmRentalJo', header: t('귀속전월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'tEnvrElhmRentalJo', header: t('귀속월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'bEnvrElhmRentalJo', header: t('되물림전실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'envrElhmRentalJo', header: t('되물림실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'aEnvrElhmRentalJo', header: t('되물림후실적'), width: '100', styleName: 'text-center' },

    // 환경가전 렌탈(개인)
    { fieldName: 'tbEnvrElhmRentalPr', header: t('귀속전월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'tEnvrElhmRentalPr', header: t('귀속월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'bEnvrElhmRentalPr', header: t('되물림전실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'envrElhmRentalPr', header: t('되물림실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'aEnvrElhmRentalPr', header: t('되물림후실적'), width: '100', styleName: 'text-center' },

    // 환경가전 일시불
    { fieldName: 'tEnvrElhmSpay', header: t('귀속월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'bEnvrElhmSpay', header: t('되물림전실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'envrElhmSpay', header: t('되물림실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'aEnvrElhmSpay', header: t('되물림후실적'), width: '100', styleName: 'text-center' },

    // 환경가전 일시불(조직)
    { fieldName: 'tbEnvrElhmSpayJo', header: t('귀속전월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'tEnvrElhmSpayJo', header: t('귀속월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'bEnvrElhmSpayJo', header: t('되물림전실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'envrElhmSpayJo', header: t('되물림실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'aEnvrElhmSpayJo', header: t('되물림후실적'), width: '100', styleName: 'text-center' },

    // 환경가전 일시불(개인)
    { fieldName: 'tbEnvrElhmSpayPr', header: t('귀속전월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'tEnvrElhmSpayPr', header: t('귀속월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'bEnvrElhmSpayPr', header: t('되물림전실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'envrElhmSpayPr', header: t('되물림실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'aEnvrElhmSpayPr', header: t('되물림후실적'), width: '100', styleName: 'text-center' },

    // 환경가전외
    // 환경가전외 /* WELLS-P + 지점장 이상, 귀속전월실적 추가 */
    { fieldName: 'tbEnvrElhmExcp', header: t('귀속전월실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'tEnvrElhmExcp', header: t('귀속월실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'bEnvrElhmExcp', header: t('되물림전실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'envrElhmExcp', header: t('되물림실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'aEnvrElhmExcp', header: t('되물림후실적'), width: '120', styleName: 'text-right' },

    // 환경가전외 일시불(조직)
    { fieldName: 'tbEnvrElhmExcpJo', header: t('귀속전월실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'tEnvrElhmExcpJo', header: t('귀속월실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'bEnvrElhmExcpJo', header: t('되물림전실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'envrElhmExcpJo', header: t('되물림실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'aEnvrElhmExcpJo', header: t('되물림후실적'), width: '120', styleName: 'text-right' },

    // 환경가전외 일시불(개인)
    { fieldName: 'tbEnvrElhmExcpPr', header: t('귀속전월실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'tEnvrElhmExcpPr', header: t('귀속월실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'bEnvrElhmExcpPr', header: t('되물림전실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'envrElhmExcpPr', header: t('되물림실적'), width: '120', styleName: 'text-right' },
    { fieldName: 'aEnvrElhmExcpPr', header: t('되물림후실적'), width: '120', styleName: 'text-right' },

    // 환경가전외 정액
    { fieldName: 'tEnvrElhmExcpFxam', header: t('귀속월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'bEnvrElhmExcpFxam', header: t('되물림전실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'envrElhmExcpFxam', header: t('되물림실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'aEnvrElhmExcpFxam', header: t('되물림후실적'), width: '100', styleName: 'text-center' },

    // 환경가전외 정액(개인)
    { fieldName: 'tbEnvrElhmExcpFxamPr', header: t('귀속전월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'tEnvrElhmExcpFxamPr', header: t('귀속월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'bEnvrElhmExcpFxamPr', header: t('되물림전실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'envrElhmExcpFxamPr', header: t('되물림실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'aEnvrElhmExcpFxamPr', header: t('되물림후실적'), width: '100', styleName: 'text-center' },

    // 환경가전 정액(개인)
    { fieldName: 'tbNwSellCntPr', header: t('귀속전월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'tNwSellCntPr', header: t('귀속월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'bNwSellCntPr', header: t('되물림전실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'nwSellCntPr', header: t('되물림실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'aNwSellCntPr', header: t('되물림후실적'), width: '100', styleName: 'text-center' },

    { fieldName: 'mcPerf', header: t('기변실적'), width: '120', styleName: 'text-right' },

    // 되물림 수수료
    { fieldName: 'mchnChRedf201903', header: t('기변수당'), width: '120', styleName: 'text-right' },
    { fieldName: 'mchnChRedf201904', header: t('기기변경'), width: '100', styleName: 'text-center' },
    { fieldName: 'spRedf', header: t('수석플래너'), width: '120', styleName: 'text-right' },
    { fieldName: 'homeCareRedf', header: t('홈케어'), width: '120', styleName: 'text-right' },
    { fieldName: 'envrTrgRedf', header: t('환경가전 목표달성'), width: '125', styleName: 'text-right' },
    { fieldName: 'envrBznsRedf201903', header: t('환경가전영업'), width: '120', styleName: 'text-right' },
    { fieldName: 'envrMetgRedf', header: t('환경가전 미팅'), width: '120', styleName: 'text-right' },
    { fieldName: 'envrOgRedf', header: t('환경가전 조직'), width: '120', styleName: 'text-right' }, // 지구장 이하
    { fieldName: 'envrBznsRedf201904', header: t('환경가전 비례'), width: '120', styleName: 'text-center' },
    { fieldName: 'envrExcpBznsRedf201903', header: t('환경가전외 영업'), width: '120', styleName: 'text-right' },
    { fieldName: 'envrExcpMetgRedf', header: t('환경가전외 미팅'), width: '120', styleName: 'text-right' },
    { fieldName: 'envrExcpBznsRedf201904', header: t('환경가전외 비례'), width: '120', styleName: 'text-center' },
    { fieldName: 'envrExcpOgRedf201903', header: t('환경가전외 조직'), width: '120', styleName: 'text-right' },
    { fieldName: 'envrExcpOgMetgRedf', header: t('환경가전외 조직미팅'), width: '120', styleName: 'text-right' },
    { fieldName: 'envrExcpOgRedf201904', header: t('환경가전외 조직비례'), width: '140', styleName: 'text-right' }, // 지구장 이하
    { fieldName: 'ogSellEncrgRedf', header: t('조직판매 장려'), width: '100', styleName: 'text-center' },
    { fieldName: 'nwSellRedf', header: t('신규판매'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellEncrgRedf', header: t('판매장려'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogMgtRedf', header: t('조직관리'), width: '100', styleName: 'text-center' },
    { fieldName: 'eduRedf', header: t('교육'), width: '100', styleName: 'text-center' },
    { fieldName: 'settleRedf', header: t('정착'), width: '100', styleName: 'text-center' }, // 지구장 이하
    { fieldName: 'sellEncrgRettRedf', header: t('판매장려 소급'), width: '100', styleName: 'text-center' },
    { fieldName: 'envrOgRedf', header: t('환경가전 조직'), width: '120', styleName: 'text-right' }, // 지점장 이상
    { fieldName: 'envrOgMetg', header: t('환경가전 조직미팅'), width: '140', styleName: 'text-right' },
    { fieldName: 'envrExcpOgRedf201904', header: t('환경가전외 조직비례'), width: '140', styleName: 'text-right' }, // 지점장 이상
    { fieldName: 'envrExcpOgMetgRedf', header: t('환경가전 조직외미팅'), width: '140', styleName: 'text-right' },
    { fieldName: 'wpEnvrPrRedf', header: t('가전 개인비례'), width: '120', styleName: 'text-right' }, // 지점장 이상 (가전 개인비례)
    { fieldName: 'wpEnvrExcpPrRedf', header: t('가전 외 개인비례'), width: '120', styleName: 'text-right' }, // 지점장 이상 (가전 외 개인비례)
    { fieldName: 'wpPrSellEncrgRedf', header: t('개인 판매장려'), width: '120', styleName: 'text-right' },
    { fieldName: 'wpEnvrOgRedf', header: t('가전 조직비례'), width: '120', styleName: 'text-right' },
    { fieldName: 'wpEnvrExcpOgRedf', header: t('가전 외 조직비례'), width: '120', styleName: 'text-right' },
    { fieldName: 'wpFxamRedfDstrc', header: t('정액'), width: '120', styleName: 'text-right' }, // 지구장 이하
    { fieldName: 'dlqRedfAmt', header: t('연체되물림'), width: '120', styleName: 'text-right' },
    { fieldName: 'wpEnvrPrRedf', header: t('가전'), width: '120', styleName: 'text-right' }, // 지구장 이하 (가전 개인비례)
    { fieldName: 'wpEnvrExcpPrRedf', header: t('가전외비례'), width: '120', styleName: 'text-right' }, // 지구장 이하 (가전 외 개인비례)
    { fieldName: 'wpMetgRedf', header: t('미팅'), width: '120', styleName: 'text-right' }, // 지구장 이하 (가전 외 개인비례)
    { fieldName: 'wpSettleRedfBrch', header: t('정착'), width: '120', styleName: 'text-right' }, // 지점장 이상
    { fieldName: 'wpFxamRedfBrch', header: t('정액'), width: '120', styleName: 'text-right' }, // 지점장 이상
    // { fieldName: 'col182', header: t('렌탈'), width: '120', styleName: 'text-right' }, // 되물림실적
    // { fieldName: 'col183', header: t('가전외 일시불 실적'), width: '120', styleName: 'text-right' }, // 되물림실적
    // { fieldName: 'col184', header: t('계'), width: '120', styleName: 'text-right' }, // 연체되물림실적
    // { fieldName: 'col185', header: t('렌탈'), width: '120', styleName: 'text-right' }, // 연체되물림실적
    // { fieldName: 'col186', header: t('가전외 일시불 실적'), width: '120', styleName: 'text-right' }, // 연체되물림실적
    { fieldName: 'sumPerfLast201903RedfDstrc', header: t('되물림 합계금액'), width: '120', styleName: 'text-right' }, // 2019년 3월 이전 + 지구장 이하 되물림합계
    { fieldName: 'sumPerf201904Between202012RedfDstrc', header: t('되물림 합계금액'), width: '120', styleName: 'text-right' }, // 실적년월 2019년 04월 ~ 2020년 12월 + 지구장 이하 되물림합계
    { fieldName: 'sumPerf202101RedfDstrc', header: t('되물림 합계금액'), width: '120', styleName: 'text-right' }, // 실적년월 2021년 1월 이후 + 지구장 이하 되물림합계
    { fieldName: 'sumPerfAllRedfDstrc', header: t('되물림 합계금액'), width: '120', styleName: 'text-right' }, // 실적년월 전기간 + 지구장 이하 되물림합계
    { fieldName: 'sumPerfLast201903RedfBrch', header: t('되물림 합계금액'), width: '120', styleName: 'text-right' }, // 2019년 3월 이전 + 지점장 이상 되물림합계
    { fieldName: 'sumPerf201904Between202012RedfBrch', header: t('되물림 합계금액'), width: '120', styleName: 'text-right' }, // 실적년월 2019년 04월 ~ 2020년 12월 + 지점장 이상 되물림합계
    { fieldName: 'sumPerf202101RedfBrch', header: t('되물림 합계금액'), width: '120', styleName: 'text-right' }, // 실적년월 2021년 1월 이후 + 지점장 이상 되물림합계
    { fieldName: 'sumPerfAllRedfBrch', header: t('되물림 합계금액'), width: '120', styleName: 'text-right' }, // 실적년월 전기간 + 지점장 이상 되물림합계
    { fieldName: 'sumWpRedfDstrc', header: t('되물림 합계금액'), width: '120', styleName: 'text-right' }, // WELLS-P + 지구장 이하
    { fieldName: 'sumWpRedfBrch', header: t('되물림 합계금액'), width: '120', styleName: 'text-right' }, // WELLS-P + 지점장 이상

    // 적채용
    { fieldName: 'tRedfPpl', header: t('귀속월 인원'), width: '120', styleName: 'text-right' },
    { fieldName: 'bRedfPpl', header: t('되물림전 인원'), width: '120', styleName: 'text-right' },
    { fieldName: 'redfPpl', header: t('되물림 인원'), width: '120', styleName: 'text-right' },
    { fieldName: 'aRedfPpl', header: t('되물림후 인원'), width: '120', styleName: 'text-right' },

    { fieldName: 'cpsnRedfYn', header: t('강제되물림 포함여부'), width: '140', styleName: 'text-center' },

    // 신규판매 건수(조직)
    { fieldName: 'tbNwSellCntJo', header: t('귀속전월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'tNwSellCntJo', header: t('귀속월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'bNwSellCntJo', header: t('되물림전실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'nwSellCntJo', header: t('되물림실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'aNwSellCntJo', header: t('되물림후실적'), width: '100', styleName: 'text-center' },

    // 신규판매 건수(개인)
    { fieldName: 'tbSellCntPr', header: t('귀속전월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'tSellCntPr', header: t('귀속월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'bSellCntPr', header: t('되물림전실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellCntPr', header: t('되물림실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'aSellCntPr', header: t('되물림후실적'), width: '100', styleName: 'text-center' },

    // 조직관리 실활동(명)
    { fieldName: 'tbOgMgtPpl', header: t('전월대비'), width: '100', styleName: 'text-center' },
    { fieldName: 'tOgMgtPpl', header: t('귀속월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'bOgMgtPpl', header: t('되물림전실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogMgtPpl', header: t('되물림실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'aOgMgtPpl', header: t('되물림후실적'), width: '100', styleName: 'text-center' },

    // 실활동
    { fieldName: 'col163', header: t('귀속전월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'col164', header: t('귀속월실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'col165', header: t('되물림전실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'col166', header: t('되물림실적'), width: '100', styleName: 'text-center' },
    { fieldName: 'col167', header: t('되물림후실적'), width: '100', styleName: 'text-center' },

  ];

  // 2019년 3월 이전 + 지구장 이하 columnLayout set
  const perfLast201903AndDstrcColumnLayout = [
    {
      header: t('기준정보'),
      direction: 'horizontal',
      items: ['perfYm', 'baseYm', 'ogCd', 'prtnrKnm', 'prtnrNo', 'dstrcGd', 'atdcDc', 'perfDvCd', 'brchDec', 'sellAmt', 'ackmtPerfRt', 'oneteamYn'],
    },
    'homeCare',
    {
      header: t('환경가전(기준가격)'),
      direction: 'horizontal',
      items: ['tEnvrElhmBaseAmt', 'bEnvrElhmBaseAmt', 'envrElhmBaseAmt', 'aEnvrElhmBaseAmt'],
    },
    {
      header: t('환경가전(건수)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmCnt', 'tEnvrElhmCnt', 'bEnvrElhmCnt', 'envrElhmCnt', 'aEnvrElhmCnt'],
    },
    {
      header: t('환경가전외'),
      direction: 'horizontal',
      items: ['tEnvrElhmExcp', 'bEnvrElhmExcp', 'envrElhmExcp', 'aEnvrElhmExcp'],
    },
    'mcPerf',
    {
      header: t('되물림 수수료'),
      direction: 'horizontal',
      items: ['mchnChRedf201903', 'spRedf', 'homeCareRedf', 'envrTrgRedf', 'envrBznsRedf201903', 'envrMetgRedf', 'envrExcpBznsRedf201903', 'envrExcpMetgRedf', 'envrOgRedf', 'envrExcpOgRedf201904', 'envrExcpOgMetgRedf', 'sumPerfLast201903RedfDstrc'],
    },

    {
      header: t('적채용'),
      direction: 'horizontal',
      items: ['tRedfPpl', 'bRedfPpl', 'redfPpl', 'aRedfPpl'],
    },
  ];

  // 실적년월 2019년 04월 ~ 2020년 12월 + 지구장 이하 columnLayout set
  const perf201904Between202012AndDstrcColumnLayout = [
    {
      header: t('기준정보'),
      direction: 'horizontal',
      items: ['perfYm', 'baseYm', 'ogCd', 'prtnrKnm', 'prtnrNo', 'pstnDvCd', 'qlfDvNm', 'qlfDvNm1', 'atdcDc', 'perfDvCd', 'marchDstrcYn', 'chYm', 'educCpcMm', 'aksd48Yn', 'edu17Yn'],
    },
    'homeCare',
    {
      header: t('환경가전'),
      direction: 'horizontal',
      items: ['tEnvrElhm', 'bEnvrElhm', 'envrElhm', 'aEnvrElhm'],
    },
    {
      header: t('환경가전 렌탈'),
      direction: 'horizontal',
      items: ['tbEnvrElhmRental', 'tEnvrElhmRental', 'bEnvrElhmRental', 'envrElhmRental', 'aEnvrElhmRental'],
    },
    {
      header: t('환경가전 일시불'),
      direction: 'horizontal',
      items: ['tEnvrElhmSpay', 'bEnvrElhmSpay', 'envrElhmSpay', 'aEnvrElhmSpay'],
    },
    {
      header: t('환경가전외 정액'),
      direction: 'horizontal',
      items: ['tEnvrElhmExcpFxam', 'bEnvrElhmExcpFxam', 'envrElhmExcpFxam', 'aEnvrElhmExcpFxam'],
    },
    'mcPerf',
    {
      header: t('되물림 수수료'),
      direction: 'horizontal',
      items: ['homeCareRedf', 'mchnChRedf201904', 'envrBznsRedf201904', 'envrExcpBznsRedf201904', 'sellEncrgRedf', 'eduRedf', 'settleRedf', 'sellEncrgRettRedf', 'sumPerf201904Between202012RedfDstrc'],
    },
    'cpsnRedfYn',
  ];

  // 실적년월 2021년 1월 이후 + 지구장 이하
  const perfAfter202101AndDstrcColumnLayout = [
    {
      header: t('기준정보'),
      direction: 'horizontal',
      items: ['perfYm', 'baseYm', 'ogCd', 'prtnrKnm', 'prtnrNo', 'pstnDvCd', 'qlfDvNm', 'qlfDvNm1', 'atdcDc', 'perfDvCd', 'chYm', 'educCpcMm', 'aksd48Yn', 'edu17Yn'],
    },
    'homeCare',
    {
      header: t('환경가전'),
      direction: 'horizontal',
      items: ['tEnvrElhm', 'bEnvrElhm', 'envrElhm', 'aEnvrElhm'],
    },
    {
      header: t('환경가전 렌탈'),
      direction: 'horizontal',
      items: ['tbEnvrElhmRental', 'tEnvrElhmRental', 'bEnvrElhmRental', 'envrElhmRental', 'aEnvrElhmRental'],
    },
    {
      header: t('환경가전 일시불'),
      direction: 'horizontal',
      items: ['tEnvrElhmSpay', 'bEnvrElhmSpay', 'envrElhmSpay', 'aEnvrElhmSpay'],
    },
    {
      header: t('환경가전외 정액'),
      direction: 'horizontal',
      items: ['tEnvrElhmExcpFxam', 'bEnvrElhmExcpFxam', 'envrElhmExcpFxam', 'aEnvrElhmExcpFxam'],
    },
    'mcPerf',
    {
      header: t('되물림 수수료'),
      direction: 'horizontal',
      items: ['homeCareRedf', 'mchnChRedf201904', 'envrBznsRedf201904', 'envrExcpBznsRedf201904', 'sellEncrgRedf', 'eduRedf', 'settleRedf', 'sellEncrgRettRedf', 'sumPerf202101RedfDstrc'],
    },
    'cpsnRedfYn',
  ];

  // 실적년월 전 기간 + 지구장 이하
  const perfAllAndDstrcColumnLayout = [
    {
      header: t('기준정보'),
      direction: 'horizontal',
      items: ['perfYm', 'baseYm', 'ogCd', 'prtnrKnm', 'prtnrNo', 'pstnDvCd', 'qlfDvNm', 'qlfDvNm1', 'dstrcGd', 'atdcDc', 'perfDvCd', 'brchDec', 'marchDstrcYn', 'chYm', 'educCpcMm', 'aksd48Yn', 'edu17Yn', 'sellAmt', 'ackmtPerfRt', 'oneteamYn'],
    },
    'homeCare',
    {
      header: t('환경가전'),
      direction: 'horizontal',
      items: ['tEnvrElhm', 'bEnvrElhm', 'envrElhm', 'aEnvrElhm'],
    },
    {
      header: t('환경가전(건수)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmCnt', 'tEnvrElhmCnt', 'bEnvrElhmCnt', 'envrElhmCnt', 'aEnvrElhmCnt'],
    },
    {
      header: t('환경가전(기준가격)'),
      direction: 'horizontal',
      items: ['tEnvrElhmBaseAmt', 'bEnvrElhmBaseAmt', 'envrElhmBaseAmt', 'aEnvrElhmBaseAmt'],
    },
    {
      header: t('환경가전 렌탈'),
      direction: 'horizontal',
      items: ['tbEnvrElhmRental', 'tEnvrElhmRental', 'bEnvrElhmRental', 'envrElhmRental', 'aEnvrElhmRental'],
    },
    {
      header: t('환경가전 일시불'),
      direction: 'horizontal',
      items: ['tEnvrElhmSpay', 'bEnvrElhmSpay', 'envrElhmSpay', 'aEnvrElhmSpay'],
    },
    {
      header: t('환경가전외'),
      direction: 'horizontal',
      items: ['tEnvrElhmExcp', 'bEnvrElhmExcp', 'envrElhmExcp', 'aEnvrElhmExcp'],
    },
    {
      header: t('환경가전외 정액'),
      direction: 'horizontal',
      items: ['tEnvrElhmExcpFxam', 'bEnvrElhmExcpFxam', 'envrElhmExcpFxam', 'aEnvrElhmExcpFxam'],
    },
    'mcPerf',
    {
      header: t('되물림 수수료'),
      direction: 'horizontal',
      items: ['mchnChRedf201903', 'mchnChRedf201904', 'spRedf', 'homeCareRedf', 'envrTrgRedf', 'envrBznsRedf201903', 'envrMetgRedf', 'envrBznsRedf201904', 'envrExcpBznsRedf201903', 'envrExcpMetgRedf', 'envrExcpBznsRedf201904', 'sellEncrgRedf', 'eduRedf', 'settleRedf', 'sellEncrgRettRedf', 'envrOgRedf', 'envrOgMetg', 'envrExcpOgRedf201904', 'envrExcpOgMetgRedf', 'sumPerfAllRedfDstrc'],
    },
    {
      header: t('적채용'),
      direction: 'horizontal',
      items: ['tRedfPpl', 'bRedfPpl', 'redfPpl', 'aRedfPpl'],
    },
    'cpsnRedfYn',
  ];

  // 2019년 3월 이전 + 지점장 이상 columnLayout set
  const perfLast201903AndBrchColumnLayout = [
    {
      header: t('기준정보'),
      direction: 'horizontal',
      items: ['perfYm', 'baseYm', 'ogCd', 'prtnrKnm', 'prtnrNo', 'pstnDvCd', 'dstrcGd', 'atdcDc', 'perfDvCd', 'brchDec', 'sellAmt', 'ackmtPerfRt', 'oneteamYn'],
    },
    'homeCare',
    {
      header: t('환경가전(기준가격)'),
      direction: 'horizontal',
      items: ['tEnvrElhmBaseAmt', 'bEnvrElhmBaseAmt', 'envrElhmBaseAmt', 'aEnvrElhmBaseAmt'],
    },
    {
      header: t('환경가전(건수)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmCnt', 'tEnvrElhmCnt', 'bEnvrElhmCnt', 'envrElhmCnt', 'aEnvrElhmCnt'],
    },
    {
      header: t('환경가전외'),
      direction: 'horizontal',
      items: ['tEnvrElhmExcp', 'bEnvrElhmExcp', 'envrElhmExcp', 'aEnvrElhmExcp'],
    },
    'mcPerf',
    {
      header: t('되물림 수수료'),
      direction: 'horizontal',
      items: ['mchnChRedf201903', 'spRedf', 'homeCareRedf', 'envrTrgRedf', 'envrBznsRedf201903', 'envrMetgRedf', 'envrExcpBznsRedf201903', 'envrExcpMetgRedf', 'envrOgRedf', 'envrOgMetg', 'envrExcpOgRedf201904', 'envrExcpOgMetgRedf', 'sumPerfLast201903RedfBrch'],
    },
    {
      header: t('적채용'),
      direction: 'horizontal',
      items: ['tRedfPpl', 'bRedfPpl', 'redfPpl', 'aRedfPpl'],
    },
  ];

  // 2019년 4월 ~ 2020년 12월 + 지점장 이상 columnLayout set
  const perf201904Between202012AndBrchColumnLayout = [
    {
      header: t('기준정보'),
      direction: 'horizontal',
      items: ['perfYm', 'baseYm', 'ogCd', 'prtnrKnm', 'prtnrNo', 'pstnDvCd', 'qlfDvNm', 'qlfDvNm1', 'atdcDc', 'perfDvCd', 'marchDstrcYn', 'educCpcMm', 'aksd48Yn'],
    },
    'homeCare',
    {
      header: t('신규판매 건수(조직)'),
      direction: 'horizontal',
      items: ['tbNwSellCntJo', 'tNwSellCntJo', 'bNwSellCntJo', 'nwSellCntJo', 'aNwSellCntJo'],
    },
    {
      header: t('신규판매 건수(개인)'),
      direction: 'horizontal',
      items: ['tbSellCntPr', 'tSellCntPr', 'bSellCntPr', 'sellCntPr', 'aSellCntPr'],
    },
    {
      header: t('환경가전 건수(조직)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmCntJo', 'tEnvrElhmCntJo', 'bEnvrElhmCntJo', 'envrElhmCntJo', 'aEnvrElhmCntJo'],
    },
    {
      header: t('환경가전 건수(개인)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmCntPr', 'tEnvrElhmCntPr', 'bEnvrElhmCntPr', 'envrElhmCntPr', 'aEnvrElhmCntPr'],
    },
    {
      header: t('환경가전 렌탈(조직)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmRentalJo', 'tEnvrElhmRentalJo', 'bEnvrElhmRentalJo', 'envrElhmRentalJo', 'aEnvrElhmRentalJo'],
    },
    {
      header: t('환경가전 렌탈(개인)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmRentalPr', 'tEnvrElhmRentalPr', 'bEnvrElhmRentalPr', 'envrElhmRentalPr', 'aEnvrElhmRentalPr'],
    },
    {
      header: t('환경가전 일시불(조직)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmSpayJo', 'tEnvrElhmSpayJo', 'bEnvrElhmSpayJo', 'envrElhmSpayJo', 'aEnvrElhmSpayJo'],
    },
    {
      header: t('환경가전 일시불(개인)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmSpayPr', 'tEnvrElhmSpayPr', 'bEnvrElhmSpayPr', 'envrElhmSpayPr', 'aEnvrElhmSpayPr'],
    },
    {
      header: t('환경가전 정액(개인)'),
      direction: 'horizontal',
      items: ['tbNwSellCntPr', 'tNwSellCntPr', 'bNwSellCntPr', 'nwSellCntPr', 'aNwSellCntPr'],
    },
    {
      header: t('환경가전외 일시불(조직)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmExcpJo', 'tEnvrElhmExcpJo', 'bEnvrElhmExcpJo', 'envrElhmExcpJo', 'aEnvrElhmExcpJo'],
    },
    {
      header: t('환경가전외 일시불(개인)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmExcpPr', 'tEnvrElhmExcpPr', 'bEnvrElhmExcpPr', 'envrElhmExcpPr', 'aEnvrElhmExcpPr'],
    },
    {
      header: t('환경가전외 정액(개인)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmExcpFxamPr', 'tEnvrElhmExcpFxamPr', 'bEnvrElhmExcpFxamPr', 'envrElhmExcpFxamPr', 'aEnvrElhmExcpFxamPr'],
    },
    {
      header: t('조직관리 실활동(명)'),
      direction: 'horizontal',
      items: ['tbOgMgtPpl', 'tOgMgtPpl', 'bOgMgtPpl', 'ogMgtPpl', 'aOgMgtPpl'],
    },
    'mcPerf',
    {
      header: t('되물림 수수료'),
      direction: 'horizontal',
      items: ['homeCareRedf', 'mchnChRedf201904', 'envrBznsRedf201904', 'envrExcpBznsRedf201904', 'sellEncrgRedf', 'eduRedf', 'wpSettleRedfBrch', 'envrExcpOgRedf201903', 'ogSellEncrgRedf', 'nwSellRedf', 'ogMgtRedf', 'sumPerf201904Between202012RedfBrch'],
    },
    'cpsnRedfYn',
  ];

  // 2021년 01월 + 지점장 이상 columnLayout set
  const perfAfter202101AndBrchColumnLayout = [
    {
      header: t('기준정보'),
      direction: 'horizontal',
      items: ['perfYm', 'baseYm', 'ogCd', 'prtnrKnm', 'prtnrNo', 'pstnDvCd', 'qlfDvNm', 'qlfDvNm1', 'atdcDc', 'perfDvCd', 'educCpcMm', 'aksd48Yn'],
    },
    'homeCare',
    {
      header: t('신규판매 건수(조직)'),
      direction: 'horizontal',
      items: ['tbNwSellCntJo', 'tNwSellCntJo', 'bNwSellCntJo', 'nwSellCntJo', 'aNwSellCntJo'],
    },
    {
      header: t('신규판매 건수(개인)'),
      direction: 'horizontal',
      items: ['tbSellCntPr', 'tSellCntPr', 'bSellCntPr', 'sellCntPr', 'aSellCntPr'],
    },
    {
      header: t('환경가전 건수(조직)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmCntJo', 'tEnvrElhmCntJo', 'bEnvrElhmCntJo', 'envrElhmCntJo', 'aEnvrElhmCntJo'],
    },
    {
      header: t('환경가전 건수(개인)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmCntPr', 'tEnvrElhmCntPr', 'bEnvrElhmCntPr', 'envrElhmCntPr', 'aEnvrElhmCntPr'],
    },
    {
      header: t('환경가전 렌탈(조직)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmRentalJo', 'tEnvrElhmRentalJo', 'bEnvrElhmRentalJo', 'envrElhmRentalJo', 'aEnvrElhmRentalJo'],
    },
    {
      header: t('환경가전 렌탈(개인)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmRentalPr', 'tEnvrElhmRentalPr', 'bEnvrElhmRentalPr', 'envrElhmRentalPr', 'aEnvrElhmRentalPr'],
    },
    {
      header: t('환경가전 일시불(조직)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmSpayJo', 'tEnvrElhmSpayJo', 'bEnvrElhmSpayJo', 'envrElhmSpayJo', 'aEnvrElhmSpayJo'],
    },
    {
      header: t('환경가전 일시불(개인)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmSpayPr', 'tEnvrElhmSpayPr', 'bEnvrElhmSpayPr', 'envrElhmSpayPr', 'aEnvrElhmSpayPr'],
    },
    {
      header: t('환경가전 정액(개인)'),
      direction: 'horizontal',
      items: ['tbNwSellCntPr', 'tNwSellCntPr', 'bNwSellCntPr', 'nwSellCntPr', 'aNwSellCntPr'],
    },
    {
      header: t('환경가전외 일시불(조직)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmExcpJo', 'tEnvrElhmExcpJo', 'bEnvrElhmExcpJo', 'envrElhmExcpJo', 'aEnvrElhmExcpJo'],
    },
    {
      header: t('환경가전외 일시불(개인)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmExcpPr', 'tEnvrElhmExcpPr', 'bEnvrElhmExcpPr', 'envrElhmExcpPr', 'aEnvrElhmExcpPr'],
    },
    {
      header: t('환경가전외 정액(개인)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmExcpFxamPr', 'tEnvrElhmExcpFxamPr', 'bEnvrElhmExcpFxamPr', 'envrElhmExcpFxamPr', 'aEnvrElhmExcpFxamPr'],
    },
    {
      header: t('조직관리 실활동(명)'),
      direction: 'horizontal',
      items: ['tbOgMgtPpl', 'tOgMgtPpl', 'bOgMgtPpl', 'ogMgtPpl', 'aOgMgtPpl'],
    },
    'mcPerf',
    {
      header: t('되물림 수수료'),
      direction: 'horizontal',
      items: ['homeCareRedf', 'mchnChRedf201904', 'envrBznsRedf201904', 'envrExcpBznsRedf201904', 'sellEncrgRedf', 'eduRedf', 'wpSettleRedfBrch', 'envrExcpOgRedf201903', 'ogSellEncrgRedf', 'nwSellRedf', 'ogMgtRedf', 'sumPerf202101RedfBrch'],
    },
    'cpsnRedfYn',
  ];

  // 실적년월 전 기간 + 지점장 이상 columnLayout set
  const perfAllAndBrchColumnLayout = [
    {
      header: t('기준정보'),
      direction: 'horizontal',
      items: ['perfYm', 'baseYm', 'ogCd', 'prtnrKnm', 'prtnrNo', 'pstnDvCd', 'dstrcGd', 'qlfDvNm', 'qlfDvNm1', 'atdcDc', 'perfDvCd', 'brchDec', 'sellAmt', 'ackmtPerfRt', 'oneteamYn', 'marchDstrcYn', 'educCpcMm', 'aksd48Yn'],
    },
    'homeCare',
    {
      header: t('신규판매 건수(조직)'),
      direction: 'horizontal',
      items: ['tbNwSellCntJo', 'tNwSellCntJo', 'bNwSellCntJo', 'nwSellCntJo', 'aNwSellCntJo'],
    },
    {
      header: t('신규판매 건수(개인)'),
      direction: 'horizontal',
      items: ['tbSellCntPr', 'tSellCntPr', 'bSellCntPr', 'sellCntPr', 'aSellCntPr'],
    },
    {
      header: t('환경가전(기준가격)'),
      direction: 'horizontal',
      items: ['tEnvrElhmBaseAmt', 'bEnvrElhmBaseAmt', 'envrElhmBaseAmt', 'aEnvrElhmBaseAmt'],
    },
    {
      header: t('환경가전(건수)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmCnt', 'tEnvrElhmCnt', 'bEnvrElhmCnt', 'envrElhmCnt', 'aEnvrElhmCnt'],
    },
    {
      header: t('환경가전 건수(조직)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmCntJo', 'tEnvrElhmCntJo', 'bEnvrElhmCntJo', 'envrElhmCntJo', 'aEnvrElhmCntJo'],
    },
    {
      header: t('환경가전 건수(개인)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmCntPr', 'tEnvrElhmCntPr', 'bEnvrElhmCntPr', 'envrElhmCntPr', 'aEnvrElhmCntPr'],
    },
    {
      header: t('환경가전 렌탈(조직)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmRentalJo', 'tEnvrElhmRentalJo', 'bEnvrElhmRentalJo', 'envrElhmRentalJo', 'aEnvrElhmRentalJo'],
    },
    {
      header: t('환경가전 렌탈(개인)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmRentalPr', 'tEnvrElhmRentalPr', 'bEnvrElhmRentalPr', 'envrElhmRentalPr', 'aEnvrElhmRentalPr'],
    },
    {
      header: t('환경가전 일시불(조직)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmSpayJo', 'tEnvrElhmSpayJo', 'bEnvrElhmSpayJo', 'envrElhmSpayJo', 'aEnvrElhmSpayJo'],
    },
    {
      header: t('환경가전 일시불(개인)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmSpayPr', 'tEnvrElhmSpayPr', 'bEnvrElhmSpayPr', 'envrElhmSpayPr', 'aEnvrElhmSpayPr'],
    },
    {
      header: t('환경가전 정액(개인)'),
      direction: 'horizontal',
      items: ['tbNwSellCntPr', 'tNwSellCntPr', 'bNwSellCntPr', 'nwSellCntPr', 'aNwSellCntPr'],
    },
    {
      header: t('환경가전외'),
      direction: 'horizontal',
      items: ['tEnvrElhmExcp', 'bEnvrElhmExcp', 'envrElhmExcp', 'aEnvrElhmExcp'],
    },
    {
      header: t('환경가전외 일시불(조직)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmExcpJo', 'tEnvrElhmExcpJo', 'bEnvrElhmExcpJo', 'envrElhmExcpJo', 'aEnvrElhmExcpJo'],
    },
    {
      header: t('환경가전외 일시불(개인)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmExcpPr', 'tEnvrElhmExcpPr', 'bEnvrElhmExcpPr', 'envrElhmExcpPr', 'aEnvrElhmExcpPr'],
    },
    {
      header: t('환경가전외 정액(개인)'),
      direction: 'horizontal',
      items: ['tbEnvrElhmExcpFxamPr', 'tEnvrElhmExcpFxamPr', 'bEnvrElhmExcpFxamPr', 'envrElhmExcpFxamPr', 'aEnvrElhmExcpFxamPr'],
    },
    {
      header: t('조직관리 실활동(명)'),
      direction: 'horizontal',
      items: ['tbOgMgtPpl', 'tOgMgtPpl', 'bOgMgtPpl', 'ogMgtPpl', 'aOgMgtPpl'],
    },
    'mcPerf',
    {
      header: t('되물림 수수료'),
      direction: 'horizontal',
      items: ['mchnChRedf201903', 'spRedf', 'homeCareRedf', 'mchnChRedf201904', 'sellEncrgRedf', 'eduRedf', 'wpSettleRedfBrch', 'envrTrgRedf', 'envrBznsRedf201903', 'envrExcpBznsRedf201903', 'envrBznsRedf201904', 'envrExcpBznsRedf201904', 'envrMetgRedf', 'envrExcpMetgRedf', 'envrOgRedf', 'envrExcpOgRedf201904', 'envrOgMetg', 'envrExcpOgMetgRedf', 'ogSellEncrgRedf', 'nwSellRedf', 'ogMgtRedf', 'sumPerfAllRedfBrch'],
    },
    {
      header: t('적채용'),
      direction: 'horizontal',
      items: ['tRedfPpl', 'bRedfPpl', 'redfPpl', 'aRedfPpl'],
    },
    'cpsnRedfYn',
  ];

  // WELLS-P + 지구장 이하
  const wpAndDstrcColumnLayout = [
    'perfYm', 'baseYm', 'ogCd', 'prtnrNo', 'prtnrKnm', 'pstnDvCd', 'qlfDvNm', 'wpChYm',
    {
      header: t('환경가전'),
      direction: 'horizontal',
      items: ['tEnvrElhm', 'bEnvrElhm', 'envrElhm', 'aEnvrElhm'],
    },
    {
      header: t('환경가전외'),
      direction: 'horizontal',
      items: ['tEnvrElhmExcp', 'bEnvrElhmExcp', 'envrElhmExcp', 'aEnvrElhmExcp'],
    },
    {
      header: t('기변'),
      direction: 'horizontal',
      items: ['tMc', 'bMc', 'mc', 'aMc'],
    },
    {
      header: t('정액'),
      direction: 'horizontal',
      items: ['tFxam', 'bFxam', 'fxam', 'aFxam'],
    },
    {
      header: t('되물림 수수료'),
      direction: 'horizontal',
      items: ['wpEnvrPrRedf', 'wpEnvrExcpPrRedf', 'sellEncrgRedf', 'wpMetgRedf', 'settleRedf', 'wpFxamRedfDstrc', 'sumWpRedfDstrc'],
    },
    'dlqRedfAmt',
  ];

  // WELLS-P + 지점장 이상
  const wpAndBrchColumnLayout = [
    'perfYm', 'baseYm', 'ogCd', 'prtnrNo', 'prtnrKnm', 'pstnDvCd', 'perfDvCd', 'wpChYm',
    {
      header: t('환경가전'),
      direction: 'horizontal',
      items: ['tbEnvrElhm', 'tEnvrElhm', 'bEnvrElhm', 'envrElhm', 'aEnvrElhm'],
    },
    {
      header: t('환경가전외'),
      direction: 'horizontal',
      items: ['tbEnvrElhmExcp', 'tEnvrElhmExcp', 'bEnvrElhmExcp', 'envrElhmExcp', 'aEnvrElhmExcp'],
    },
    {
      header: t('기변'),
      direction: 'horizontal',
      items: ['tbMc', 'tMc', 'bMc', 'mc', 'aMc'],
    },
    {
      header: t('정액'),
      direction: 'horizontal',
      items: ['tbFxam', 'tFxam', 'bFxam', 'fxam', 'aFxam'],
    },
    {
      header: t('실활동'),
      direction: 'horizontal',
      items: ['col163', 'col164', 'col165', 'col166', 'col167'],
    },
    {
      header: t('되물림 수수료'),
      direction: 'horizontal',
      items: ['wpEnvrPrRedf', 'wpEnvrExcpPrRedf', 'wpPrSellEncrgRedf', 'wpEnvrOgRedf', 'ogSellEncrgRedf', 'wpSettleRedfBrch', 'wpFxamRedfBrch', 'sumWpRedfBrch'],
    },
    'dlqRedfAmt',
  ];

  // 처리유형 - 연체 선택 시
  const dlqColumnLayout = [
    'baseYm', 'perfYm', 'prtnrNo', 'prtnrKnm', 'ogTpNm', 'perfDvNm',
    {
      header: t('되물림 실적'),
      direction: 'horizontal',
      items: ['col182', 'col183'],
    },
    {
      header: t('연체되물림 실적'),
      direction: 'horizontal',
      items: ['col185', 'col186', 'col184'],
    },
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

  /* 실적년월(from, to), 직책구분, 처리유형 변경 시 layout 변경 */
  watch(() => [searchParams.value.perfYmFrom,
    searchParams.value.perfYmTo,
    searchParams.value.rsbDvCd,
    searchParams.value.redfAdsbTpCd,
    searchParams.value.ogTpCd], async () => {
    /* 변경 값 감지 시, 그리드 초기화 */
    grdMainRef.value.getData().clearRows();

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
}

</script>
