<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 고객 - 수수료 지급명세서
2. 프로그램 ID : WwfeeSpecificationListM - 수수료 지급명세서 (W-CO-U-0037M01)
3. 작성자 : kangik-yun
4. 작성일 : 2023.02.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 >> 수수료 지급명세서 프로그램
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
            rules="required"
            type="month"
            :label="$t('MSG_TXT_PERF_YM')"
            @change="onChangeDiv"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OG_TP')"
        >
          <kw-select
            v-model="searchParams.ogTpCd"
            :label="$t('MSG_TXT_OG_TP')"
            :options="ogTpCd"
            @change="onChangeOgTpCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RSB_TP')"
        >
          <kw-option-group
            v-model="searchParams.rsbDvCd"
            :label="$t('MSG_TXT_RSB_TP')"
            type="radio"
            :options="rsbDvCd"
            @change="onChangeDiv"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_OG_LEVL')"
          :colspan="2"
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevel1"
            v-model:og-levl-dv-cd2="searchParams.ogLevel2"
            v-model:og-levl-dv-cd3="searchParams.ogLevel3"
            :og-tp-cd="searchParams.ogTpCd"
            :base-ym="searchParams.perfDt"
            :start-level="1"
            :end-level="3"
          />
        </kw-search-item>

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

        <!-- 지급명세서출력(본사)-->
        <kw-btn
          v-if="sessionUserInfo.ogTpCd?.indexOf('HR') > -1"
          v-permission:download
          dense
          secondary
          icon="report"
          :label="$t('MSG_BTN_DSB_SPCSH_PRNT')+'('+t('MSG_TXT_HDOF')+')'"
          @click="onClickOzReport('tot')"
        />
        <!-- 지급명세서 출력-->
        <kw-btn
          v-permission:download
          dense
          secondary
          icon="report"
          :label="$t('MSG_BTN_DSB_SPCSH_PRNT')"
          @click="onClickOzReport()"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal, useMeta, getComponentType, defineGrid, gridUtil, codeUtil } from 'kw-lib';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import { openReportPopup } from '~common/utils/cmPopupUtil';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { modal } = useGlobal();
const { getUserInfo } = useMeta();
const sessionUserInfo = getUserInfo();

const totalCount = ref(0);
const dataService = useDataService();
const { t } = useI18n();

const searchParams = ref({
  perfDt: dayjs().add(-1, 'month').format('YYYYMM'),
  ogTpCd: 'W02',
  rsbDvCd: 'W0205',
  ogId: '',
  prtnrNo: '',
  feeCalcUnitTpCd: '201', // 수수료계산단위유형코드 (101 : P추진단 플래너, 102 : P추진단 지국장, 201 : M추진단-일반(15등급), 202 : M추진단
  ogLevel1: '',
  ogLevel2: '',
  ogLevel3: '',
});

const codes = await codeUtil.getMultiCodes('OG_TP_CD', 'RSB_DV_CD');

// 수수료 코드 리스트
let feeCodes;

const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;
let fieldsObj;

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// 조직유형코드
const ogTpCd = codes.OG_TP_CD.filter((v) => ['W01', 'W02', 'W03'].includes(v.codeId));
// 직책구분코드
const rsbDvCd = ref((await codeUtil.getSubCodes('RSB_DV_CD', searchParams.value.ogTpCd)).filter((v) => ['W0105', 'W0104', 'W0205', 'W0204', 'W0302', 'W0301'].includes(v.codeId))); // 로그인 한 조직에 따라 직책구분코드가 변경된다.
const { currentRoute } = useRouter();

let gridView;
let gridData;
let cashedFeeCodes;
// let ozUsrDiv; // oz 팝업용 사용자 권한구분

async function fetchData() {
  const res = await dataService.get('/sms/wells/fee/fee-specifications', { params: cachedParams });
  const datas = res.data;

  totalCount.value = datas.length;

  const view = grdMainRef.value.getView();

  const newData = datas.map((obj) => {
    obj.dsbamt = Number(obj.feeSum) - Number(obj.ddtnsum);
    return obj;
  });

  view.getDataSource().setRows(newData);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  fetchData();
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

async function getFeeCodes() {
  const res = await dataService.get('/sms/wells/fee/fee-specifications/fee-codes', { params: searchParams.value });
  feeCodes = res.data;
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/fee/fee-specifications', { params: cachedParams });
  const newData = res.data.map((obj) => {
    obj.dsbamt = Number(obj.feeSum) - Number(obj.ddtnsum);
    return obj;
  });
  gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: newData,
  });
}

// 지급명세서 출력
function onClickOzReport(div) {
  let _ozrPath = '';
  let _odiPath = '';

  if (searchParams.value.rsbDvCd === 'W0105') { // P추진단 - 플래너
    if (div === 'tot') { // 본사 -- 총계
      _ozrPath = '/ksswells/cmms/svPatSpec/V1.0/cmmsSvPatSpec202204_01.ozr';
      _odiPath = '/ksswells/cmms/svPatSpec/V1.0/cmmsSvPatSpec202204_01.odi';
    } else {
      _ozrPath = '/ksswells/cmms/svPatSpec/V1.0/cmmsSvPatSpec202204_02.ozr';
      _odiPath = '/ksswells/cmms/svPatSpec/V1.0/cmmsSvPatSpec202204_02.odi';
    }
  } else if (searchParams.value.rsbDvCd === 'W0104') { // P 추진단 - 지점장
    if (div === 'tot') { // 본사 -- 총계
      _ozrPath = '/ksswells/cmms/svPatSpec/V1.0/cmmsSvPatSpec202204_03_03.ozr';
      _odiPath = '/ksswells/cmms/svPatSpec/V1.0/cmmsSvPatSpec202204_03_03.odi';
    } else {
      _ozrPath = '/ksswells/cmms/svPatSpec/V1.0/cmmsSvPatSpec202204_04.ozr';
      _odiPath = '/ksswells/cmms/svPatSpec/V1.0/cmmsSvPatSpec202204_04.odi';
    }
  } else if (searchParams.value.rsbDvCd === 'W0205') { // M추진단 - 플래너
    if (div === 'tot') { // 본사 -- 총계
      _ozrPath = '/ksswells/cmms/patSpec/V3.0/cmmsPatSpec202304_01.ozr';
      _odiPath = '/ksswells/cmms/patSpec/V3.0/cmmsPatSpec202304_01.odi';
    } else {
      _ozrPath = '/ksswells/cmms/patSpec/V3.0/cmmsPatSpec202304_02.ozr';
      _odiPath = '/ksswells/cmms/patSpec/V3.0/cmmsPatSpec202304_02.odi';
    }
  } else if (searchParams.value.rsbDvCd === 'W0204') { // M 추진단 - 지점장
    if (div === 'tot') { // 본사 -- 총계
      _ozrPath = '/ksswells/cmms/patSpec/V3.0/cmmsPatSpec202304_03.odi';
      _odiPath = '/ksswells/cmms/patSpec/V3.0/cmmsPatSpec202304_03.odi';
    } else {
      _ozrPath = '/ksswells/cmms/patSpec/V3.0/cmmsPatSpec202304_04.odi';
      _odiPath = '/ksswells/cmms/patSpec/V3.0/cmmsPatSpec202304_04.odi';
    }
  } else if (searchParams.value.rsbDvCd === 'W0302') { // 홈마스터
    if (div === 'tot') {
      _ozrPath = '/ksswells/hmCmms/patSpec/V2.0/cmmsHmPatSpec1_sum.ozr';
      _odiPath = '/ksswells/hmCmms/patSpec/V2.0/cmmsHmPatSpec1_sum.odi';
    } else {
      _ozrPath = '/ksswells/hmCmms/patSpec/V2.0/cmmsHmPatSpec1.ozr';
      _odiPath = '/ksswells/hmCmms/patSpec/V2.0/cmmsHmPatSpec1.odi';
    }
  } else if (searchParams.value.rsbDvCd === 'W0301') { // 홈마스터 - 지점장
    if (div === 'tot') {
      _ozrPath = '/ksswells/hmCmms/patSpec/V2.0/cmmsHmPatSpec2_sum.ozr';
      _odiPath = '/ksswells/hmCmms/patSpec/V2.0/cmmsHmPatSpec2_sum.odi';
    } else {
      _ozrPath = 'ksswells/hmCmms/patSpec/V2.0/cmmsHmPatSpec2.ozr';
      _odiPath = 'ksswells/hmCmms/patSpec/V2.0/cmmsHmPatSpec2.odi';
    }
  }

  const ozParam = {
    ozrPath: _ozrPath,
    odiPath: _odiPath,
    args:
      {
        userDiv: '0',
        basYear: searchParams.value.perfDt.substring(0, 4),
        basMonth: searchParams.value.perfDt.substring(4, 6),
        userId: searchParams.value.prtnrNo ?? 0,
        perfYm: searchParams.value.perfDt,
        rsbDvCd: searchParams.value.rsbDvCd,
        ogId: searchParams.value.ogId,
        rsbCd: sessionUserInfo.rsbCd ?? '0',
        pstn: '0',
        deptCd: '0',
        basYrmn: searchParams.value.perfDt,
      },
    height: 1100,
    width: 1200,
  };

  openReportPopup(
    ozParam.ozrPath,
    ozParam.odiPath,
    JSON.stringify(ozParam.args),
    { width: 1100, height: 1200 },
  );
}

async function onChangeOgTpCd() {
  if (searchParams.value.ogTpCd === 'W01') { // P추진단
    rsbDvCd.value = (await codeUtil.getSubCodes('RSB_DV_CD', 'W01')).filter((v) => ['W0105', 'W0104'].includes(v.codeId));
    searchParams.value.rsbDvCd = 'W0105';
  } else if (searchParams.value.ogTpCd === 'W02') { // M추진단
    rsbDvCd.value = (await codeUtil.getSubCodes('RSB_DV_CD', 'W02')).filter((v) => ['W0205', 'W0204'].includes(v.codeId));
    searchParams.value.rsbDvCd = 'W0205';
  } else if (searchParams.value.ogTpCd === 'W03') { // 홈마스터
    rsbDvCd.value = (await codeUtil.getSubCodes('RSB_DV_CD', 'W03')).filter((v) => ['W0302', 'W0301'].includes(v.codeId));
    searchParams.value.rsbDvCd = 'W0302';
  }
}

// 직책구분에 따라 feeCalcUnitTpCd 세팅
function setUnitTpCd() {
  const rsbDvVal = searchParams.value.rsbDvCd;
  const tpCdObj = {
    W0105: '101', // P 플래너
    W0104: '102', // P 지점장
    W0205: '201', // M 플래너
    W0204: '202', // M 지점장
    W0302: '301', // 홈마스터 - 일반
    W0301: '302', // 홈마스터 - 지점장
  };
  searchParams.value.feeCalcUnitTpCd = tpCdObj[rsbDvVal];
}

async function onChangeDiv() {
  setUnitTpCd(); // feeCalcUnitTpCd 변경
  await getFeeCodes();
  cashedFeeCodes = feeCodes.filter((obj) => (obj.feeCalcUnitTpCd === searchParams.value.feeCalcUnitTpCd)); // 수수료 코드 필터링
  fieldsObj.setFields();
}

onMounted(async () => {
  await onChangeDiv();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

// 검색조건에 따른 컬럼 변경
fieldsObj = {

  defaultFields: [// 그리드 앞부분 기본 공통컬럼
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '103.8', styleName: 'text-center' }, // 총괄단
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '103.8', styleName: 'text-center' }, // 지역단
    { fieldName: 'dgr3LevlOgNm', header: t('MSG_TXT_BRANCH'), width: '103.8', styleName: 'text-center' }, // 지점
    { fieldName: 'prtNrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '110.8', styleName: 'text-center' }, // 번호
    { fieldName: 'prtNrKNm', header: t('MSG_TXT_EMPL_NM'), width: '110.8', styleName: 'text-center' }, // 성명
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '88.7', styleName: 'text-center', options: codes.RSB_DV_CD }, // 직책
    { fieldName: 'meetDates', header: t('MSG_TXT_METG_PRSC_DC'), width: '93.1', styleName: 'text-right', dataType: 'number' }, // 미팅참석일수
  ],
  mp: { // M추진단 / 플래너
    perfFields: [ // 실적부분
      { fieldName: 'perf02', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '118.1', styleName: 'text-right', dataType: 'number' }, // 가전인정건수
      { fieldName: 'perf03', header: t('MSG_TXT_ELHM_CHDVC_CT'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 가전기변건수
    ],
    deductionFields: [ // 공제 부분
      { fieldName: 'ddtn02', header: t('MSG_TXT_ERNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 소득세
      { fieldName: 'ddtn03', header: t('MSG_TXT_RSDNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 주민세
      { fieldName: 'ddtn01', header: t('MSG_TXT_RDS'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 보증예치금
      { fieldName: 'ddtn04', header: t('MSG_TXT_PNPYAM'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 가지급금
      { fieldName: 'ddtn07', header: t('MSG_TXT_BU_DDTN'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 부담공제
      { fieldName: 'ddtn05', header: t('MSG_TXT_HIR_INSR'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 고용보험
      { fieldName: 'ddtn06', header: t('MSG_TXT_INDD_INSR'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 산재보험
    ],
  },
  pp: { // P추진단 / 플래너
    perfFields: [ // 실적부분
      { fieldName: 'perf02', header: t('MSG_TXT_ELHM_PERF'), width: '118.1', styleName: 'text-right', dataType: 'number' }, // 가전실적
      { fieldName: 'perf03', header: t('MSG_TXT_ELHM_EXCP_PERF'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 가전외 실적
      { fieldName: 'perf04', header: t('MSG_TXT_ADP'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 합산
      { fieldName: 'perf05', header: t('MSG_TXT_MCHN_CH_PERF'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 기변실적
    ],
    deductionFields: [ // 공제 부분
      { fieldName: 'ddtn02', header: t('MSG_TXT_ERNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 소득세
      { fieldName: 'ddtn03', header: t('MSG_TXT_RSDNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 주민세
      { fieldName: 'ddtn01', header: t('MSG_TXT_RDS'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 보증예치금
      { fieldName: 'ddtn04', header: t('MSG_TXT_PNPYAM'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 가지급금
      { fieldName: 'ddtn07', header: t('MSG_TXT_BU_DDTN'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 부담공제
      { fieldName: 'ddtn05', header: t('MSG_TXT_HIR_INSR'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 고용보험
      { fieldName: 'ddtn06', header: t('MSG_TXT_INDD_INSR'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 산재보험
    ],
  },
  mm: { // M추진단 / 지점장
    perfFields: [ // 실적부분
      { fieldName: 'perf02', header: t('MSG_TXT_OG_ELHM_ACKMT_CT'), width: '118.1', styleName: 'text-right', dataType: 'number' }, // 조직 가전인정건수
      { fieldName: 'perf03', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 가전인정건수
      { fieldName: 'perf04', header: t('MSG_TXT_MCHN_CH_PERF'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 기변실적
    ],
    deductionFields: [ // 공제 부분
      { fieldName: 'ddtn02', header: t('MSG_TXT_ERNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 소득세
      { fieldName: 'ddtn03', header: t('MSG_TXT_RSDNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 주민세
      { fieldName: 'ddtn01', header: t('MSG_TXT_RDS'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 보증예치금
      { fieldName: 'ddtn04', header: t('MSG_TXT_PNPYAM'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 가지급금
      { fieldName: 'ddtn07', header: t('MSG_TXT_BU_DDTN'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 부담공제
      { fieldName: 'ddtn88', header: t('MSG_TXT_DSC_SELL'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 할인판매
      { fieldName: 'ddtn05', header: t('MSG_TXT_HIR_INSR'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 고용보험
      { fieldName: 'ddtn06', header: t('MSG_TXT_INDD_INSR'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 산재보험
    ],
  },
  pm: { // P추진단 / 지점장
    perfFields: [ // 실적부분
      { fieldName: 'perf01', header: t('MSG_TXT_ELHM_PERF'), width: '118.1', styleName: 'text-right', dataType: 'number' }, // 조직 - 가전인정건수
      { fieldName: 'perf02', header: t('MSG_TXT_ELHM_EXCP_PERF'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 조직 - 가전외
      { fieldName: 'perf03', header: t('MSG_TXT_ADP'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 조직 - 합산

      { fieldName: 'perf04', header: t('MSG_TXT_ELHM_PERF'), width: '118.1', styleName: 'text-right', dataType: 'number' }, // 개인 - 가전실적
      { fieldName: 'perf05', header: t('MSG_TXT_ELHM_EXCP_PERF'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 개인 - 가전외 실적
      { fieldName: 'perf06', header: t('MSG_TXT_ADP'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 개인 - 합산
      { fieldName: 'perf07', header: t('MSG_TXT_MCHN_CH_PERF'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 개인 - 기변실적
    ],
    deductionFields: [ // 공제 부분
      { fieldName: 'ddtn02', header: t('MSG_TXT_ERNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 소득세
      { fieldName: 'ddtn03', header: t('MSG_TXT_RSDNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 주민세
      { fieldName: 'ddtn01', header: t('MSG_TXT_RDS'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 보증예치금
      { fieldName: 'ddtn04', header: t('MSG_TXT_PNPYAM'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 가지급금
      { fieldName: 'ddtn07', header: t('MSG_TXT_BU_DDTN'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 부담공제
      { fieldName: 'ddtn05', header: t('MSG_TXT_HIR_INSR'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 고용보험
      { fieldName: 'ddtn06', header: t('MSG_TXT_INDD_INSR'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 산재보험
    ],
  },
  hp: { // 홈마스터 / 플래너
    perfFields: [], // 실적부분
    deductionFields: [ // 공제 부분
      { fieldName: 'ddtn01', header: t('MSG_TXT_RDS'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 보증예치금
      { fieldName: 'ddtn02', header: t('MSG_TXT_ERNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 소득세
      { fieldName: 'ddtn03', header: t('MSG_TXT_RSDNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 주민세
      { fieldName: 'ddtn05', header: t('MSG_TXT_HIR_INSR'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 고용보험
      { fieldName: 'ddtn04', header: t('MSG_TXT_PNPYAM'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 가지급금
      { fieldName: 'ddtn07', header: t('MSG_TXT_BU_DDTN'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 부담공제
      { fieldName: 'ddtn99', header: t('MSG_TXT_EDDTN'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 기타공제
      { fieldName: 'ddtn06', header: t('MSG_TXT_INDD_INSR'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 산재보험
    ],
  },
  hm: { // 홈마스터 / 지점장
    perfFields: [], // 실적부분
    deductionFields: [ // 공제 부분
      { fieldName: 'ddtn01', header: t('MSG_TXT_RDS'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 보증예치금
      { fieldName: 'ddtn02', header: t('MSG_TXT_ERNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 소득세
      { fieldName: 'ddtn03', header: t('MSG_TXT_RSDNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 주민세
      { fieldName: 'ddtn05', header: t('MSG_TXT_HIR_INSR'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 고용보험
      { fieldName: 'ddtn04', header: t('MSG_TXT_PNPYAM'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 가지급금
      { fieldName: 'ddtn07', header: t('MSG_TXT_BU_DDTN'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 부담공제
      { fieldName: 'ddtn99', header: t('MSG_TXT_EDDTN'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 기타공제
      { fieldName: 'ddtn06', header: t('MSG_TXT_INDD_INSR'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 산재보험
    ],
  },

  // 조직유형 , 직책유형에 따른 필드 세팅
  setFields() {
    let columns = fieldsObj.defaultFields;
    let layoutColumns = [];
    const feeSumField = { fieldName: 'feeSum', header: t('MSG_TXT_FEE_SUM'), width: '142.8', styleName: 'text-right', dataType: 'number' }; // 수수료 합계
    const ddenSumFields = { fieldName: 'ddtnsum', header: t('MSG_TXT_DDTN_SUM'), width: '142.8', styleName: 'text-right', dataType: 'number' }; // 공제계
    const dsbAmtFields = { fieldName: 'dsbamt', header: t('MSG_TXT_PAYOUTS'), width: '142.8', styleName: 'text-right', dataType: 'number' }; // 지급액

    const tmpFeeFields = cashedFeeCodes.map((obj) => ({ fieldName: obj.feeCd.toUpperCase(), header: obj.feeNm, width: '142.8', styleName: 'text-right', dataType: 'number' }));

    if (searchParams.value.rsbDvCd === 'W0104') { // P추진단 / 지점장
      const { perfFields } = fieldsObj.pm;
      const { deductionFields } = fieldsObj.pm;

      columns = [...fieldsObj.defaultFields, ...perfFields,
        ...tmpFeeFields, feeSumField, ...deductionFields, ddenSumFields, dsbAmtFields];
      // 헤더 부분 merge
      layoutColumns = [...fieldsObj.getColumnNameArr(fieldsObj.defaultFields),
        {
          header: t('MSG_TXT_OG_PERF'),
          direction: 'horizontal', // merge type
          items: ['perf01', 'perf02', 'perf03'],
        },
        {
          header: t('MSG_TXT_INDV_PERF'),
          direction: 'horizontal', // merge type
          items: ['perf04', 'perf05', 'perf06', 'perf07'],
        },
        {
          header: t('MSG_TXT_FEE'),
          direction: 'horizontal', // merge type
          items: [...fieldsObj.getColumnNameArr(tmpFeeFields)],
        },
        ...fieldsObj.getColumnNameArr([feeSumField]),
        {
          header: t('MSG_TXT_DDTN'),
          direction: 'horizontal', // merge type
          items: [...fieldsObj.getColumnNameArr(deductionFields)],
        },
        ...fieldsObj.getColumnNameArr([ddenSumFields]),
        ...fieldsObj.getColumnNameArr([dsbAmtFields]),
      ];
    } else if (searchParams.value.rsbDvCd === 'W0301') { // 홈마스터 / 지점장
      const { deductionFields } = fieldsObj.hm;

      columns = [...fieldsObj.defaultFields,
        ...tmpFeeFields, feeSumField, ...deductionFields, ddenSumFields, dsbAmtFields];

      const personalFees = cashedFeeCodes.filter((obj) => obj.feeClsfCd === '04'); // 조직수수료
      const ogFees = cashedFeeCodes.filter((obj) => obj.feeClsfCd !== '04'); // 개인수수료
      const personalFeeFields = personalFees.map((obj) => ({ fieldName: obj.feeNm, header: obj.feeNm, width: '142.8', styleName: 'text-right', dataType: 'number' }));
      const ogFeeFields = ogFees.map((obj) => ({ fieldName: obj.feeNm, header: obj.feeNm, width: '142.8', styleName: 'text-right', dataType: 'number' }));
      // 헤더 부분 merge
      layoutColumns = [...fieldsObj.getColumnNameArr(fieldsObj.defaultFields),
        {
          header: t('MSG_TXT_PRSNL_FEE'), // 개인수수료
          direction: 'horizontal', // merge type
          items: [...fieldsObj.getColumnNameArr(personalFeeFields)],
        },
        {
          header: t('MSG_TXT_ORGNSTN_FEE'), // 조직수수료
          direction: 'horizontal', // merge type
          items: [...fieldsObj.getColumnNameArr(ogFeeFields)],
        },
        ...fieldsObj.getColumnNameArr([feeSumField]),
        {
          header: t('MSG_TXT_DDTN'),
          direction: 'horizontal', // merge type
          items: [...fieldsObj.getColumnNameArr(deductionFields)],
        },
        ...fieldsObj.getColumnNameArr([ddenSumFields]),
        ...fieldsObj.getColumnNameArr([dsbAmtFields]),
      ];
    } else {
      let perfFields = {};
      let deductionFields = {};
      if (searchParams.value.rsbDvCd === 'W0105') { // p 추진단 플래너
        perfFields = fieldsObj.pp.perfFields;
        deductionFields = fieldsObj.pp.deductionFields;
      } else if (searchParams.value.rsbDvCd === 'W0205') { // m 추진단  플래너
        perfFields = fieldsObj.mp.perfFields;
        deductionFields = fieldsObj.mp.deductionFields;
      } else if (searchParams.value.rsbDvCd === 'W0204') { // m 추진단  지국장
        perfFields = fieldsObj.mm.perfFields;
        deductionFields = fieldsObj.mm.deductionFields;
      } else if (searchParams.value.rsbDvCd === 'W0302') { // 홈마스터 - 플래너
        perfFields = [];
        deductionFields = fieldsObj.hp.deductionFields;
      }

      columns = [...fieldsObj.defaultFields, ...perfFields,
        ...tmpFeeFields, feeSumField, ...deductionFields, ddenSumFields, dsbAmtFields];

      // 헤더 부분 merge
      layoutColumns = [...fieldsObj.getColumnNameArr(fieldsObj.defaultFields),
        {
          header: t('MSG_TXT_PERF'),
          direction: 'horizontal', // merge type
          items: [...fieldsObj.getColumnNameArr(perfFields)],
        },
        {
          header: t('MSG_TXT_FEE'),
          direction: 'horizontal', // merge type
          items: [...fieldsObj.getColumnNameArr(tmpFeeFields)],
        },
        ...fieldsObj.getColumnNameArr([feeSumField]),
        {
          header: t('MSG_TXT_DDTN'),
          direction: 'horizontal', // merge type
          items: [...fieldsObj.getColumnNameArr(deductionFields)],
        },
        ...fieldsObj.getColumnNameArr([ddenSumFields]),
        ...fieldsObj.getColumnNameArr([dsbAmtFields]),
      ];

      // 비어있는 항목의 헤더 영역 제거
      layoutColumns = layoutColumns.filter((obj) => {
        if (typeof (obj) === 'string') return true;
        if (typeof (obj) === 'object' && !isEmpty(obj.items)) return true;
        return false;
      });
    }
    const fields = columns.map(({ fieldName, dataType }) => ({ fieldName, dataType }));

    gridData.setFields(fields);
    gridView.setColumns(columns);

    gridView.setColumnLayout([...layoutColumns]);
  },
  // 리스트에 담겨진 항목중 {fieldName : "" }  만  가져옴
  getColumnNameList(ObjList) {
    return ObjList.map((obj) => ({ fieldName: obj.fieldName }));
  },
  // 리스트에 담겨진 항목 중 fieldName 배열로 가져옴
  getColumnNameArr(objList) {
    return objList.map((v) => v.fieldName);
  },

};

const initGrid = defineGrid((data, view) => {
  const fields = [
    ...fieldsObj.getColumnNameList(fieldsObj.defaultFields),
  ];

  const columns = [
    ...fieldsObj.defaultFields,
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  gridView = view;
  gridData = data;
});

</script>
