<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbSinglePaymentCancelPresentStateMgtM - 취소현황 > 일시불
3. 작성자 : younuk.choi
4. 작성일 : 2023.07.03
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 일시불 취소현황
- TODO : OZ리포트 출력/ 철거배정
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="4"
    @search="onClickSearch"
  >
    <kw-search-row>
      <!-- row1 소속구분 -->
      <kw-search-item
        :label="$t('MSG_TXT_BLG')+$t('MSG_TXT_DIV')"
      >
        <kw-select
          v-model="searchParams.ogCd"
          :options="[{ codeId: '70079', codeName: '아웃바운드운영팀'},
                     { codeId: '75049', codeName: 'Wells신채널영업부문'},
                     { codeId: '70710', codeName: '채권관리팀'}]"
          first-option="all"
        />
      </kw-search-item>
      <!-- row1 조회기간  -->
      <kw-search-item
        :label="$t('MSG_TXT_LOOKUP_PERIOD')"
        colspan="2"
      >
        <kw-select
          v-model="searchParams.dtDiv"
          class="w180"
          :options="[{ codeId: '1', codeName: t('MSG_TXT_IST_DT')},
                     { codeId: '2', codeName: t('MSG_TXT_CANC_DT')}]"
        />
        <kw-date-range-picker
          v-model:from="searchParams.cancelFromDt"
          v-model:to="searchParams.cancelToDt"
        />
      </kw-search-item>
      <!-- row4 계약상세번호 -->
      <kw-search-item
        :label="$t('MSG_TXT_CNTR_DTL_NO')"
      >
        <zctz-contract-detail-number
          v-model:cntr-no="searchParams.cntrNo"
          v-model:cntr-sn="searchParams.cntrSn"
          :select-only-validation="false"
        />
      </kw-search-item>
    </kw-search-row>

    <kw-search-row>
      <!-- row2 부분조회 -->
      <kw-search-item
        :label="$t('MSG_TXT_PO_SEARCH')"
      >
        <kw-select
          v-model="searchParams.partDiv"
          :options="[{ codeId: '1', codeName: t('MSG_TXT_PD_CH')},
                     { codeId: '2', codeName: t('MSG_TXT_MSG_TXT_SL_CH')}]"
          first-option="all"
        />
      </kw-search-item>
      <!-- row2 누락건 -->
      <kw-search-item
        :label="$t('MSG_TXT_OMSSN')+$t('MSG_TXT_CNT')"
      >
        <kw-select
          v-model="searchParams.omssnDiv"
          :options="[{ codeId: '1', codeName: t('MSG_TXT_SEARCH_SEARCH')},
                     { codeId: '2', codeName: '설치 후 취소건 중 상변/매변 누락 건 조회'},
                     { codeId: '3', codeName: '매출일자 확인대상 조회'}]"
        />
      </kw-search-item>
      <!-- row2 철거구분 -->
      <kw-search-item
        :label="$t('MSG_TXT_REQD')+$t('MSG_TXT_DIV')"
      >
        <kw-select
          v-model="searchParams.reqdDiv"
          :options="[{ codeId: 'NA', codeName: t('MSG_TXT_REQD')+' '+t('MSG_TXT_NOT_ASN')},
                     { codeId: 'CA', codeName: t('MSG_TXT_REQD')+' '+t('MSG_TXT_ASGN')+t('MSG_TXT_COMPLETE')},
                     { codeId: 'CC', codeName: t('MSG_TXT_REQD')+' '+t('MSG_TXT_COMPLETE')}]"
          first-option="all"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>

  <div class="result-area">
    <ul class="kw-notification">
      <li>{{ t('MSG_TXT_SPAY_GRID_INFO') }}</li>
    </ul>
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change:model-value="(v)=>{pageInfo.pageSize=v;}"
        />
        <!--
          v-model:page-size="pageSize"
           :page-size-options="codes.COD_PAGE_SIZE_OPTIONS" -->
        <span class="ml6">{{ t('MSG_TXT_UNIT_WON_MCN') }}</span>
      </template>
      <kw-btn
        v-permission:print
        :label="$t('MSG_BTN_RPT_BRWS')"
        icon="report"
        dense
        secondary
        :disable="!pageInfo.totalCount"
        @click="onClickReport"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMainSPay"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrid"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta, stringUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import { openReportPopup } from '~common/utils/cmPopupUtil';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import dayjs from 'dayjs';

const { t } = useI18n();
const { getConfig } = useMeta();
const { alert, modal /* , notify */ } = useGlobal();
const { getters } = useStore();
const dataService = useDataService();
const router = useRouter();
const now = dayjs();
const grdMainSPay = ref(getComponentType('KwGrid'));
const ozParamsList = ref({});
const { userName } = getters['meta/getUserInfo'];

// const codes = await codeUtil.getMultiCodes(
//   'COD_PAGE_SIZE_OPTIONS',
// );

const searchParams = ref({
  ogCd: '', // 소속구분
  dtDiv: '1', // 날짜검색구분
  cancelFromDt: now.startOf('month').format('YYYYMMDD'), // 시작일
  cancelToDt: now.format('YYYYMMDD'), // 종료일
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  partDiv: '', // 부분조회
  omssnDiv: '1', // 누락건
  reqdDiv: '', // 철거구분
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const pageInfo = ref({
  totalCount: 0,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
let cachedParams;

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchData() {
  if (isEmpty(cachedParams)) return;

  const res = await dataService.get('/sms/wells/contract/changeorder/single-payment-cancels', { params: { ...cachedParams } });

  ozParamsList.value = res.data;
  pageInfo.value.totalCount = res.data.length;
  const view = grdMainSPay.value.getView();
  view.getDataSource().setRows(res.data);
}

async function onClickReport() {
  // 조회된 내역이 없으면 return
  if (isEmpty(ozParamsList.value)) { return; }

  const dtDiv = searchParams.value.dtDiv === '1' ? t('MSG_TXT_IST_DT') : t('MSG_TXT_CANC_DT'); // 조회기간 (설치일자, 취소일자 구분)
  const partDiv = searchParams.value.partDiv === '1' ? t('MSG_TXT_PD_CH') : t('MSG_TXT_MSG_TXT_SL_CH'); // 부분조회
  let omssnDiv = ''; // 누락건
  const { cancelFromDt, cancelToDt } = searchParams.value; // 조회기간

  switch (searchParams.value.omssnDiv) { // 누락건 분기처리
    case '1':
      omssnDiv = t('MSG_TXT_SEARCH_SEARCH');
      break;
    case '2':
      omssnDiv = '설치 후 취소건 중 상변/매변 누락 건 조회';
      break;
    case '3':
      omssnDiv = '매출일자 확인대상 조회';
      break;
    default:
      break;
  }

  cachedParams.cancelDt = `${dtDiv} ${stringUtil.getDateFormat(cancelFromDt)} ~ ${stringUtil.getDateFormat(cancelToDt)}`; // 일자
  cachedParams.omssnDivNm = omssnDiv; // 누락건
  cachedParams.partDivNm = partDiv; // 부분조회
  cachedParams.userNm = userName; // 출력자명

  // OZ 리포트 팝업 파라미터 설정
  const ozParams = {
    ozrPath: '/kstation-w/hdof/lgst/lspyCancPsct.ozr',
    odiPath: '',
  };

  // OZ 리포트 호출 Api 설정
  const args = { searchApiUrl: '/api/v1/sms/wells/contract/changeorder/single-payment-cancels/oz', ...cachedParams };
  // OZ 레포트 팝업호출
  openReportPopup(
    ozParams.ozrPath,
    ozParams.odiPath,
    JSON.stringify(args),
  );
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center rg-button-link',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback: (g, { itemIndex }) => `${g.getValue(itemIndex, 'cntrNo')}-${g.getValue(itemIndex, 'cntrSn')}`,
    }, // [계약상세번호]
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG') + t('MSG_TXT_DIV'), width: '120', styleName: 'text-center' }, // [소속구분]
    { fieldName: 'cntrCstKnm', header: t('MSG_TXT_CST_NM'), width: '120', styleName: 'text-center' }, // [고객명]
    { fieldName: 'ogCd', header: t('MSG_TXT_OG_CD'), width: '120', styleName: 'text-center' }, // [조직코드]
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_SELLER_ID'), width: '120', styleName: 'text-center' }, // [판매자사번]
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_SELL_NM'), width: '120', styleName: 'text-center' }, // [판매자명]
    { fieldName: 'alncmpNm', header: t('MSG_TXT_ALNC') + t('MSG_TXT_COMPANY'), width: '150', styleName: 'text-center' }, // [제휴회사]
    { fieldName: 'sellEvNm', header: t('MSG_TXT_EV_NM'), width: '150', styleName: 'text-center' }, // [행사명]
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '120', styleName: 'text-center' }, // [상품코드]
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '300' }, // [상품명]
    { fieldName: 'cntrCnfmDt', header: t('MSG_TXT_CNTR_DATE'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [계약일자]
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [설치일자]
    //------------------------------------------------------------------------------------------
    { fieldName: 'cntrPdEnddt', header: t('MSG_TXT_LEDG'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [원장]
    { fieldName: 'pdChDt', header: t('MSG_TXT_PD_CH'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [상변]
    { fieldName: 'slChDt', header: t('MSG_TXT_MSG_TXT_SL_CH'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [매변]
    //------------------------------------------------------------------------------------------
    { fieldName: 'reqdAkDt', header: t('MSG_TXT_REQD_RQ_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [철거요청일]
    { fieldName: 'reqdDt', header: t('MSG_TXT_REQD_FSH_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [철거완료일]
    { fieldName: 'reqdPsicId', header: t('MSG_TXT_REQD_PSIC_NM'), width: '120', styleName: 'text-center' }, // [철거담당자]
    { fieldName: 'reqdAsn',
      header: t('MSG_TXT_REQD') + t('MSG_TXT_ASGN'),
      width: '120',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback: () => t('MSG_TXT_REQD') + t('MSG_TXT_ASGN'),
    }, // [철거배정]
    //------------------------------------------------------------------------------------------
    { fieldName: 'prsGbn', header: t('MSG_TXT_PROCS_DV'), width: '120', styleName: 'text-center' }, // [처리구분]
    { fieldName: 'cntrTam', header: t('MSG_TXT_TOT_SALE_PRICE'), width: '110', styleName: 'text-right', dataType: 'number' }, // [총판매금]
    { fieldName: 'cntrAmt', header: t('MSG_TXT_SBSCM'), width: '110', styleName: 'text-right', dataType: 'number' }, // [청약금]
    { fieldName: 'crpUcAmt', header: t('MSG_TXT_CRP_UC_AMT'), width: '110', styleName: 'text-right', dataType: 'number' }, // [법인미수금]
    { fieldName: 'cntrDpAmt', header: `${t('MSG_TXT_SBSCM_TK')} ${t('MSG_TXT_TOT_DP')}`, width: '110', styleName: 'text-right', dataType: 'number' }, // [청약/인수 총입금]
    { fieldName: 'cntrRfAmt', header: `${t('MSG_TXT_SBSCM_TK')} ${t('MSG_TXT_TOT_RFND')}`, width: '110', styleName: 'text-right', dataType: 'number' }, // [청약/인수 총환불]
    { fieldName: 'cntrInsAmt', header: `${t('MSG_TXT_FNL')} ${t('MSG_TXT_ISTM_TOT_DP')}`, width: '110', styleName: 'text-right', dataType: 'number' }, // [최종 할부총입금]
    //------------------------------------------------------------------------------------------
    { fieldName: 'pdChPeriod', header: t('MSG_TXT_PASG_PTRM'), width: '110', styleName: 'text-right', dataType: 'number' }, // [경과기간]
    { fieldName: 'pdChPeriodRntf', header: t('MSG_TXT_RNTF_RATE'), width: '100', styleName: 'text-right', dataType: 'number' }, // [손율]
    { fieldName: 'pdChPeriodAmt', header: t('MSG_TXT_AMT'), width: '110', styleName: 'text-right', dataType: 'number' }, // [금액]
    //------------------------------------------------------------------------------------------
    { fieldName: 'pdChRntfRplcDpAmt', header: t('MSG_TXT_RPLC') + t('MSG_TXT_DP'), width: '110', styleName: 'text-right', dataType: 'number' }, // [대체입금]
    { fieldName: 'pdChRntfAddDpAmt', header: t('MSG_TXT_ADD') + t('MSG_TXT_DP'), width: '110', styleName: 'text-right', dataType: 'number' }, // [추가입금]
    { fieldName: 'pdChRntfDpAmt', header: t('MSG_TXT_RNTF_AMT') + t('MSG_TXT_DP'), width: '110', styleName: 'text-right', dataType: 'number' }, // [손료입금]
    //------------------------------------------------------------------------------------------
    { fieldName: 'npdRntfAmt', header: `${t('MSG_TXT_PD_CH')} ${t('MSG_TXT_NPD')}${t('MSG_TXT_RNTF_AMT')}`, width: '110', styleName: 'text-right', dataType: 'number' }, // [상변 미납손료]
    //------------------------------------------------------------------------------------------
    { fieldName: 'rntfRplcAmt', header: t('MSG_TXT_RNTF_AMT') + t('MSG_TXT_RPLC'), width: '110', styleName: 'text-right', dataType: 'number' }, // [손료대체]
    { fieldName: 'etcPrpdAmt', header: t('MSG_TXT_ETC') + t('MSG_TXT_PREPAID'), width: '110', styleName: 'text-right', dataType: 'number' }, // [기타선수]
    { fieldName: 'cntrNo', visible: false },
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'slClYm', visible: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'cntrNoSn', 'ogNm', 'cntrCstKnm', 'ogCd', 'sellPrtnrNo', 'prtnrKnm', 'alncmpNm', 'sellEvNm', 'basePdCd', 'pdNm', 'cntrCnfmDt', 'istDt', // single
    {
      header: t('MSG_TXT_CANC_DT'), // colspan title
      direction: 'horizontal', // merge type
      items: ['cntrPdEnddt', 'pdChDt', 'slChDt'],
    },
    {
      header: t('MSG_TXT_REQD') + t('MSG_TXT_IZ'),
      direction: 'horizontal',
      items: ['reqdAkDt', 'reqdDt', 'reqdPsicId', 'reqdAsn'],
    },
    'prsGbn', 'cntrTam', 'cntrAmt', 'crpUcAmt', 'cntrDpAmt', 'cntrRfAmt', 'cntrInsAmt',
    {
      header: `${t('MSG_TXT_PD_CH')} ${t('MSG_TXT_PERIOD_CALA_AMT')}`,
      direction: 'horizontal',
      items: ['pdChPeriod', 'pdChPeriodRntf', 'pdChPeriodAmt'],
    },
    {
      header: `${t('MSG_TXT_PD_CH')} ${t('MSG_TXT_RNTF_AMT')}${t('MSG_TXT_DP')}`,
      direction: 'horizontal',
      items: ['pdChRntfRplcDpAmt', 'pdChRntfAddDpAmt', 'pdChRntfDpAmt'],
    },
    'npdRntfAmt',
    {
      header: t('MSG_TXT_MSG_TXT_SL_CH'),
      direction: 'horizontal',
      items: ['rntfRplcAmt', 'etcPrpdAmt'],
    },
  ]);

  // cellclick
  view.onCellItemClicked = async (g, { column, dataRow }) => {
    const { cntrNo, cntrSn, cntrCnfmDt } = gridUtil.getRowValue(g, dataRow);

    // 계약상세번호 클릭 - 팝업
    if (column === 'cntrNoSn') {
      await modal({
        component: 'WwctaOrderDetailP',
        componentProps: { cntrNo, cntrSn },
        draggable: true,
        window: true,
        windowFeatures: { width: 1300, height: 1080 },
      });
    } else if (column === 'reqdAsn') {
      await modal({
        component: 'WwsncTimeTableForContractP',
        componentProps: {
          baseYm: dayjs().format('YYYYMM'), // 달력 초기 월
          chnlDvCd: 'W', // W: 웰스, K: KSS, C: CubicCC, P: K-MEMBERS, I || E: 엔지니어, M: 매니저
          svDvCd: '3', // 1:설치, 2:BS, 3:AS, 4:홈케어
          svBizDclsfCd: '3420',
          mtrStatCd: '1',
          sellDate: cntrCnfmDt,
          cntrNo,
          cntrSn,
        },
      });
    }
  };

  // dbclick row - 상세조회 : 취소등록 메뉴  open
  // 일시불 목록의 경우 계약해지처리내역에서 조회하지 않음
  view.onCellDblClicked = async (g, { dataRow }) => {
    const { cntrNo, cntrSn, slClYm } = gridUtil.getRowValue(g, dataRow);
    if (isEmpty(slClYm)) {
      await alert('매출마감년월 값이 없습니다.');
      return;
    }

    router.replace({
      path: 'wwctb-cancel-registration-mgt',
      query: { cntrNo, cntrSn, dm: slClYm },
    });
  };
});
</script>
