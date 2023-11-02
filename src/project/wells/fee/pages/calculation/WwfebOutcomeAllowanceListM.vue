<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 고객 - 성과수당 현황
2. 프로그램 ID : WwfebOutcomeAllowanceListM - 성과수당 현황 (W-CO-U-0037M01)
3. 작성자 : kangik-yun
4. 작성일 : 2023.02.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 >> 성과수당 현황 프로그램
****************************************************************************************************
-TODO :
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!--실적년월-->
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfDt"
            :label="$t('MSG_TXT_PERF_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <!--조직구분-->
        <kw-search-item
          :label="$t('MSG_TXT_OG_DV')"
          required
        >
          <kw-option-group
            v-model="searchParams.ogDv"
            type="radio"
            :options="codes.EVL_OG_TP_CD"
            rules="required"
          />
        </kw-search-item>
        <!--직책-->
        <kw-search-item
          :label="$t('MSG_TXT_RSB')"
          required
        >
          <kw-option-group
            v-model="searchParams.rsbDvCd"
            type="radio"
            :options="codes.RSB_DV_CD"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            clearable
            icon="search"
            @click-icon="onClickSearchNo"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
          <span class="ml8">(단위:원)</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        v-if="searchParams.ogDv ==='W01'"
        ref="grdMainRef1"
        name="grdMain1"
        :visible-rows="15"
        @init="initGrid1"
      />
      <kw-grid
        v-if="searchParams.ogDv ==='W02'"
        ref="grdMainRef2"
        name="grdMain2"
        :visible-rows="15"
        @init="initGrid2"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal, getComponentType, codeUtil, defineGrid, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { modal } = useGlobal();

const totalCount = ref(0);
const dataService = useDataService();
const { t } = useI18n();

const grdMainRef1 = ref(getComponentType('KwGrid'));
const grdMainRef2 = ref(getComponentType('KwGrid'));
const codes = ref(await codeUtil.getMultiCodes('RSB_DV_CD', 'EVL_OG_TP_CD'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
codes.value.RSB_DV_CD = codes.value.RSB_DV_CD.filter((v) => (v.codeId === 'W0202' || v.codeId === 'W0203'));

const searchParams = ref({
  perfDt: dayjs().add(-1, 'month').format('YYYYMM'),
  ogDv: 'W01',
  rsbDvCd: 'W0102',
  prtnrNo: '',
});

let cachedParams;

// 조직구분 변경시 그리드 변경
watch(() => searchParams.value.ogDv, async (newVal) => {
  codes.value.RSB_DV_CD = (await codeUtil.getSubCodes('RSB_DV_CD', newVal)).filter((v) => ['W0102', 'W0103', 'W0202', 'W0203'].includes(v.codeId));
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/fee/outcome-allowances', { params: cachedParams });
  const datas = res.data;
  totalCount.value = datas.length;

  const view = grdMainRef1.value.getView();
  view.getDataSource().setRows(datas);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef2.value.getView();

  gridUtil.exportView(view, {
    fileName: '성과수당 현황',
    timePostfix: true,
  });
}

// 번호 검색 아이콘 클릭 이벤트
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzMonthPartnerListP',
    componentProps: {
      ogTpCd: searchParams.value.ogTpCd,
      prtnrNo: searchParams.value.prtnrNo,
      baseYm: searchParams.value.perfDt,
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.prtnrNo = payload.prtnrNo;
    }
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid1 = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sosok', header: t('MSG_TXT_BLG'), width: '124.1' }, //  소속
    { fieldName: 'sosokName', header: t('MSG_TXT_BLG_NM'), width: '124.1' }, //  소속명
    { fieldName: 'prtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '102' }, // 성명
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '92', styleName: 'text-center' }, // 번호
    { fieldName: 'dtrcN', header: `${t('MSG_TXT_BRCH_N')}(${t('MSG_TXT_THM')})`, width: '92', styleName: 'text-right' }, // 지점수(당월)
    { fieldName: 'target', header: t('MSG_TXT_TRG'), width: '92', styleName: 'text-right' }, // 목표
    { fieldName: 'dtrcNFix', header: t('MSG_TXT_BRCH_N') + t('MSG_TXT_FXN'), width: '124.1' }, //  지점수고정
    { fieldName: 'perfAmt', header: `${t('MSG_TXT_PERF')}(${t('MSG_TXT_MCHN_CH_INC')})`, width: '125.1', styleName: 'text-right' }, // 실적(기변포함)
    { fieldName: 'achiveRate', header: t('MSG_TXT_ACHV_RT'), width: '110.8', styleName: 'text-right' }, // 달성률

    { fieldName: 'newSell', header: t('MSG_TXT_NW_SELL'), width: '110.8', styleName: 'text-right' }, // 신규판매
    { fieldName: 'purSpr', header: t('MSG_TXT_PUR_SPR'), width: '82.1', styleName: 'text-right' }, // 순수이탈
    { fieldName: 'accNinc', header: t('MSG_TXT_ACC_NINC'), width: '82.1', styleName: 'text-right' }, // 계정순증

    { fieldName: 'accCnt', header: t('MSG_TXT_PD_ACC_CNT'), width: '82.1', styleName: 'text-right' }, // 인정건수

    { fieldName: 'exceptPerfAmt', header: t('MSG_TXT_PERF'), width: '82.1', styleName: 'text-right' }, // 실적  -- 가전외
    { fieldName: 'exceptCnt', header: t('MSG_TXT_COUNT'), width: '82.1', styleName: 'text-right' }, // 건수   --가전외

    { fieldName: 'redfCnt', header: t('MSG_TXT_REDF_CT'), width: '82.1', styleName: 'text-right' }, // 되물림건수
    { fieldName: 'aggsAmt', header: t('MSG_TXT_AGGS'), width: '82.1', styleName: 'text-right' }, // 누계
    { fieldName: 'tgtAchvAmt', header: '$t(\'MSG_TXT_TRG_ACHV_AW\')<br/>$t(\'TXT_MSG_ACKMT_CT\')', width: '82.1', styleName: 'text-right' }, // 목표달성수당(인정건수)
    { fieldName: 'brchNinc', header: t('MSG_TXT_BRCH_NINC'), width: '110.8', styleName: 'text-right' }, // 지점순증

    { fieldName: 'wm', header: 'WM', width: '82.1', styleName: 'text-right' }, // WM
    { fieldName: 'preM', header: 'Pre-M(BS)', width: '82.1', styleName: 'text-right' }, // Pre-M(BS)

    { fieldName: 'aclAvgAmt', header: '$t(\'MSG_TXT_ACL_ACTI\')<br/>$t(\'MSG_TXT_BRNCH_OFFC_AVG\')', width: '82.1', styleName: 'text-right' }, // 실활동(지평)
    { fieldName: 'actvBrch', header: t('MSG_TXT_ACTV_BRCH'), width: '82.1', styleName: 'text-right' }, // 활성지점
    { fieldName: 'ogAw', header: t('MSG_TXT_OG_AW'), width: '82.1', styleName: 'text-right' }, // 조직수당
    { fieldName: 'dsbAmt', header: t('MSG_TXT_DSB_SUM'), width: '82.1', styleName: 'text-right' }, // 지급계

  ];
  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    'sosok', 'sosokName', 'prtnrNm', 'prtnrNo', 'dtrcN', 'target', 'dtrcNFix', 'perfAmt', 'achiveRate',
    {
      header: t('MSG_TXT_ACC_NINC'), // 계정순증
      direction: 'horizontal', // merge type
      items: ['newSell', 'purSpr', 'accNinc'],
    },
    'accCnt',
    {
      header: t('MSG_TXT_ELHM_EXCP'), // 가전외
      direction: 'horizontal', // merge type
      items: ['exceptPerfAmt', 'exceptCnt'],
    },
    'redfCnt', 'aggsAmt', 'tgtAchvAmt', 'brchNinc',
    {
      header: t('MSG_TXT_BRCH_NINC'), // 지점순증
      direction: 'horizontal',
      items: ['wm', 'preM'],
    },
    'aclAvgAmt', 'actvBrch', 'ogAw', 'dsbAmt',
  ]);
});

const initGrid2 = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sosok', header: t('MSG_TXT_BLG'), width: '124.1' }, //  소속
    { fieldName: 'prtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '102' }, // 성명
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '92', styleName: 'text-center' }, // 번호

    { fieldName: 'tgtCt', header: t('MSG_TXT_TRG_CT'), width: '92', styleName: 'text-right' }, // 목표건수
    { fieldName: 'achvCt', header: t('MSG_TXT_ACHV_CT'), width: '92', styleName: 'text-right' }, // 달성건수
    { fieldName: 'achiveRate', header: t('MSG_TXT_ACHV_RT'), width: '124.1' }, //  달성률

    { fieldName: 'trgAchvAwSum', header: t('MSG_TXT_TRG_ACHV_AW_SUM'), width: '125.1', styleName: 'text-right' }, // 목표달성수당계

    { fieldName: '1stOptnTrg', header: t('MSG_TXT_1ST_M_OPTN_TRG'), width: '110.8', styleName: 'text-right' }, // 1차월가동목표
    { fieldName: '1stOptnAchv', header: t('MSG_TXT_1M_OPTN_ACHV'), width: '110.8', styleName: 'text-right' }, // 1차월가동달성
    { fieldName: '1stOptnAchvRt', header: t('MSG_TXT_1M_OPTN_ACHV_RT'), width: '110.8', styleName: 'text-right' }, // 1차월가동달성률
    { fieldName: '1stOptnAchvAw', header: t('MSG_TXT_1M_OPTN_ACHV_AW'), width: '110.8', styleName: 'text-right' }, // 1차월가동달성수당
    { fieldName: 'aclActiTrg', header: t('MSG_TXT_ACL_ACTI_TRG'), width: '110.8', styleName: 'text-right' }, // 실활동목표
    { fieldName: 'aclActiAchv', header: t('MSG_TXT_ACL_ACTI_ACHV'), width: '110.8', styleName: 'text-right' }, // 실활동달성
    { fieldName: 'aclActiAchvRt', header: t('MSG_TXT_ACL_ACTI_ACHV_RAT'), width: '110.8', styleName: 'text-right' }, // 실활동달성률
    { fieldName: 'aclActiAw', header: t('MSG_TXT_ACL_ACTI_AW'), width: '110.8', styleName: 'text-right' }, // 실활동수당

    { fieldName: 'ogAchvAwSum', header: t('MSG_TXT_OG_ACHV_AW_SUM'), width: '82.1', styleName: 'text-right' }, // 조직달성수당계
    { fieldName: 'achvAwSum', header: t('MSG_TXT_OUTC_AW_TOT_SUM'), width: '110.8', styleName: 'text-right' }, // 성과수당총계

  ];
  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    'sosok', 'prtnrNm', 'prtnrNo',
    {
      header: t('MSG_TXT_TRG_ACHV_AW'), // 목표달성수당
      direction: 'horizontal', // merge type
      items: ['tgtCt', 'achvCt', 'achiveRate'],
    }, 'trgAchvAwSum',
    {
      header: t('MSG_TXT_OG_ACHV_AW'), // 조직달성수당
      direction: 'horizontal', // merge type
      items: ['1stOptnTrg', '1stOptnAchv', '1stOptnAchvRt', '1stOptnAchvAw', 'aclActiTrg', 'aclActiAchv', 'aclActiAchvRt', 'aclActiAw'],
    },
    'ogAchvAwSum', 'achvAwSum',

  ]);
});

</script>
