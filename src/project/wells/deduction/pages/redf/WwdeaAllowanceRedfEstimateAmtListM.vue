<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DEA
2. 프로그램 ID : WwdeaAllowanceRedfEstimateAmtListM
3. 작성자 : daewon.kim
4. 작성일 : 2023.06.29 ~
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수당되물림 예상액 조회
****************************************************************************************************
---->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 실적년월 -->
        <kw-search-item
          :label="t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            :label="t('MSG_TXT_PERF_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <!-- 조직 -->
        <kw-search-item
          :label="t('MSG_TXT_OG')"
        >
          <kw-option-group
            v-model="searchParams.ogTpCd"
            type="radio"
            :options="codes.SELL_OG_DV_ACD"
          />
        </kw-search-item>
        <!-- 실적구분 -->
        <kw-search-item
          :label="t('MSG_TXT_PERF_DV')"
        >
          <kw-option-group
            v-model="searchParams.perfDvCd"
            type="radio"
            :options="codes.REDF_ET_PERF_DV_CD"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!-- 파트너번호 -->
        <kw-search-item
          :label="t('MSG_TXT_PRTNR_NUMBER')"
          required
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            :disable="prtnrCheck"
            regex="num"
            maxlength="10"
            icon="search"
            clearable
            rules="required|numeric"
            :label="$t('MSG_TXT_PRTNR_NUMBER')"
            @click-icon="onClickSearchPartner"
          />
        </kw-search-item>
        <!-- 회원명 -->
        <kw-form-item
          :label="t('MSG_TXT_MB_NM')"
        >
          <kw-input
            v-model="searchParams.cstNm"
            icon="search"
            clearable
            @click-icon="onClickSelectCustomer"
            @keydown="onKeyDownSelectCustomer"
          />
        </kw-form-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <!-- 실적 현황 -->
          <h3>{{ $t('MSG_TXT_PERF_PS') }}</h3>
        </template>
      </kw-action-top>
      <kw-action-top>
        <template #left>
          <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="pageInfo.totalCount === 0"
          :label="t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickMainExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="3"
        @init="initGrid"
      />

      <!-- 판매리스트 -->
      <h3>{{ t('MSG_TIT_SELL_LIST') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="pageInfo.totalCount === 0"
          :label="t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickSecondExcelDownload"
        />
        <!-- 되물림 예상액 조회 -->
        <kw-btn
          :label="t('MSG_BTN_REDF_ET_AMT_INQR')"
          secondary
          dense
          @click="onClickRedfEtAmtInqr"
        />
      </kw-action-top>

      <kw-grid
        ref="grdSecondRef"
        name="grdSecond"
        :visible-rows="5"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid2"
      />

      <kw-action-top class="mt20">
        <template #left>
          <!-- 되물림 예상액 -->
          <h3>{{ t('MSG_TXT_REDF_ET_AMT') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="!grdThirdExcelChk"
          :label="t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickThirdExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdThirdRef"
        name="grdThird"
        :visible-rows="3"
        @init="initGrid3"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, gridUtil, defineGrid, useDataService, useMeta, modal, alert } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const sessionMeta = useMeta();
// eslint-disable-next-line no-unused-vars
const userInfo = sessionMeta.getUserInfo();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const defaultDay = dayjs().subtract(0, 'month').format('YYYYMM');
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSecondRef = ref(getComponentType('KwGrid'));
const grdThirdRef = ref(getComponentType('KwGrid'));
const { getConfig } = useMeta();
const { t } = useI18n();
const { currentRoute } = useRouter();
const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'SELL_OG_DV_ACD',
  'REDF_ET_PERF_DV_CD', // 되물림예상실적구분코드
);

// 페이징
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  // 환경변수에서 기본설정값 받아오는 코드 현재 CFG_CMZ_DEFAULT_PAGE_SIZE
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  // pageSize: 10,
  needTotalCount: true,
});

// eslint-disable-next-line no-unused-vars
let cachedParams;
const grdThirdExcelChk = ref(false);

const searchParams = ref({
  perfYm: defaultDay, // 실적년월 202212 202302
  ogTpCd: codes.SELL_OG_DV_ACD[0].codeId, // 조직
  perfDvCd: codes.REDF_ET_PERF_DV_CD[0].codeId, // 실적구분
  prtnrNo: '', // 파트너번호 1675622 1582688 1714903
  cstNm: '', // 회원명 신금옥
  cstNo: '', // 회원번호 036715544(036857916) 041434639
});

// 고객조회(공통)
async function onClickSelectCustomer() {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: {
      // cstNo: searchParams.value.cstNo,
      cstNm: searchParams.value.cstNm,
      cstType: '1',
    },
  });
  if (result) {
    searchParams.value.cstNo = payload.cstNo; // 031524818
    searchParams.value.cstNm = payload.name;
  }
}

/* 목록 조회 */
async function fetchData() {
  if (cachedParams.cstNo === '' && cachedParams.cstNm.length > 0) {
    await alert(t('MSG_ALT_CST_INQR_POP')); // 고객조회 팝업을 통해 회원명을 입력해주세요.
    return;
  }
  const res = await dataService.get('/sms/wells/deduction/redf/estimate-amounts/itemization/paging', { params: { ...cachedParams, ...pageInfo.value } });

  const { list: redfes, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view2 = grdSecondRef.value.getView();
  const dataSource2 = view2.getDataSource();

  dataSource2.checkRowStates(false);
  dataSource2.addRows(redfes);
  dataSource2.checkRowStates(true);
}

/* 실적현황 조회 */
async function fetchData2() {
  const res = await dataService.get('/sms/wells/deduction/redf/estimate-amounts/presentState', { params: { ...cachedParams } });

  const redfes = res.data;
  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(redfes);
  dataSource.checkRowStates(true);
}

/* 예상액 조회 */
async function fetchData3() {
  const view = grdThirdRef.value.getView();
  const dataSource = view.getDataSource();

  const res = await dataService.get('/sms/wells/deduction/redf/estimate-amounts/estimate');

  const redfes = res.data;

  dataSource.checkRowStates(false);
  dataSource.addRows(redfes);
  dataSource.checkRowStates(true);
}

async function onClickSearch() {
  grdMainRef.value.getData().clearRows();
  grdSecondRef.value.getData().clearRows();
  grdThirdRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  pageInfo.value.totalCount = 0;
  grdThirdExcelChk.value = false;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
  await fetchData2();
}

async function onClickMainExcelDownload() {
  const res = await dataService.get('/sms/wells/deduction/redf/estimate-amounts/presentState/excel-download', { params: { ...cachedParams } });
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_PERF_PS')}`, // 실적 현황
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSecondExcelDownload() {
  const res = await dataService.get('/sms/wells/deduction/redf/estimate-amounts/itemization/excel-download', { params: { ...cachedParams } });
  const view = grdSecondRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_SELL_LIST')}`, // 판매리스트
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickThirdExcelDownload() {
  const res = await dataService.get('/sms/wells/deduction/redf/estimate-amounts/estimate/excel-download');
  const view = grdThirdRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_REDF_ET_AMT')}`, // 되물림 예상액
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickRedfEtAmtInqr() {
  const view = grdSecondRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (checkedRows.length === 0) {
    await alert(t('MSG_ALT_ATC_CHO'));
    return;
  }
  grdThirdRef.value.getData().clearRows();

  checkedRows.forEach((e) => {
    e.perfYm = cachedParams.perfYm;
  });

  const res = await dataService.post('/sms/wells/deduction/redf/estimate-amounts', checkedRows);

  if (res.data.processCount > 0) {
    grdThirdExcelChk.value = true;
    await fetchData3();
  }
}

/**
 * 파트너번호 검색 팝업
 */
async function onClickSearchPartner() {
  /* TODO: 임직원 검색 컴포넌트 개발 시, 변경 될 수 있음 */
  // eslint-disable-next-line no-unused-vars
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
      // ogTpCd: searchParams.value.ogTpCd === 'ALL' ? userInfo.ogTpCd : searchParams.value.ogTpCd,
    },
  });
  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}

async function onKeyDownSelectCustomer() {
  searchParams.value.cstNo = '';
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'perfDv' }, // 실적 구분
    { fieldName: 'indvElhmPerf', dataType: 'number' }, // 개인 가전 실적
    { fieldName: 'indvElhmExcpPerf', dataType: 'number' }, // 개인 가전외 실적
    { fieldName: 'brchElhmPerf', dataType: 'number' }, // 지점 가전 실적
    { fieldName: 'brchElhmExcpPerf', dataType: 'number' }, // 지점 가전외 실적
    { fieldName: 'mnger', dataType: 'number' }, // 매니저
    { fieldName: 'plar', dataType: 'number' }, // 플래너
    { fieldName: 'indvAckmtCt', dataType: 'number' }, // 개인 인정건수
    { fieldName: 'brchAckmtCt', dataType: 'number' }, // 지점 인정건수
    { fieldName: 'brchNwSellCt', dataType: 'number' }, // 신규판매건수

    { fieldName: 'indvElhmBaseAmt', dataType: 'number' }, // 개인 가전기준가
    { fieldName: 'indvElhmExcpBaseAmt', dataType: 'number' }, // 개인 가전외기준가
    { fieldName: 'brchElhmBaseAmt', dataType: 'number' }, // 지점 가전기준가
    { fieldName: 'brchElhmExcpBaseAmt', dataType: 'number' }, // 지점 가전외기준가

  ];

  const columns = [
    /* P, M조직 공통 */
    { fieldName: 'perfDv',
      header: t('MSG_TXT_PERF_CAT'), // 실적 구분
      width: '338',
      styleName: 'text-center' },

    /* P조직 개인실적 */
    { fieldName: 'indvElhmPerf',
      header: t('MSG_TXT_ELHM_PERF'), // 가전 실적
      width: '200',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'indvElhmExcpPerf',
      header: t('MSG_TXT_ELHM_EXCP_PERF'), // 가전외 실적
      width: '200',
      styleName: 'text-right',
      numberFormat: '#,##0' },

    /* P조직 지점실적 */
    { fieldName: 'brchElhmPerf',
      header: t('MSG_TXT_ELHM_PERF'), // 가전 실적
      width: '200',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'brchElhmExcpPerf',
      header: t('MSG_TXT_ELHM_EXCP_PERF'), // 가전외 실적
      width: '200',
      styleName: 'text-right',
      numberFormat: '#,##0' },

    /* P, M조직 공통 지점실활동(명) */
    { fieldName: 'mnger',
      header: t('MSG_TXT_MANAGER'), // 매니저
      width: '200',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'plar',
      header: t('MSG_TXT_PLAR'), // 플래너
      width: '200',
      styleName: 'text-right',
      numberFormat: '#,##0' },

    /* M조직 개인실적 */
    { fieldName: 'indvAckmtCt',
      header: t('MSG_TXT_PD_ACC_CNT'), // 인정건수
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'indvElhmBaseAmt',
      header: t('MSG_TXT_ELHM_BASE_PRC'), // 가전 기준가
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'indvElhmExcpBaseAmt',
      header: t('MSG_TXT_ELHM_EXCP_BASE_PRC'), // 가전외 기준가
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0' },

    /* M조직 지점실적 */
    { fieldName: 'brchAckmtCt',
      header: t('MSG_TXT_PD_ACC_CNT'), // 인정건수
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'brchElhmBaseAmt',
      header: t('MSG_TXT_ELHM_BASE_PRC'), // 가전 기준가
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'brchElhmExcpBaseAmt',
      header: t('MSG_TXT_ELHM_EXCP_BASE_PRC'), // 가전외 기준가
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'brchNwSellCt',
      header: t('MSG_TXT_NW_SELL_CNT'), // 신규판매건수
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = false; // create number indicator column

  const ogTpCdP = [
    'perfDv',
    {
      header: t('MSG_TXT_INDV_PERF'), // 개인실적
      direction: 'horizontal',
      items: ['indvElhmPerf', 'indvElhmExcpPerf'],
    },
    {
      header: t('MSG_TXT_BRCH_PERF'), // 지점실적
      direction: 'horizontal',
      items: ['brchElhmPerf', 'brchElhmExcpPerf'],
    },
    {
      header: t('MSG_TXT_BRCH_ACTI'), // 지점실활동(명)
      direction: 'horizontal',
      items: ['mnger', 'plar'],
    },
  ];

  // eslint-disable-next-line no-unused-vars
  const ogTpCdM = [
    'perfDv',
    {
      header: t('MSG_TXT_INDV_PERF'), // 개인실적
      direction: 'horizontal',
      items: ['indvAckmtCt', 'indvElhmBaseAmt', 'indvElhmExcpBaseAmt'],
    },
    {
      header: t('MSG_TXT_BRCH_PERF'), // 지점실적
      direction: 'horizontal',
      items: ['brchAckmtCt', 'brchElhmBaseAmt', 'brchElhmExcpBaseAmt', 'brchNwSellCt'],
    },
    {
      header: t('MSG_TXT_BRCH_ACTI'), // 지점실활동(명)
      direction: 'horizontal',
      items: ['mnger', 'plar'],
    },
  ];

  // multi row header setting
  view.setColumnLayout(ogTpCdP);

  watch(() => searchParams.value.ogTpCd, async (val) => {
    if (val === '2') { // P조직
      grdMainRef.value.getData().clearRows();
      pageInfo.value.pageIndex = 1;
      pageInfo.value.totalCount = 0;
      view.setColumnLayout(ogTpCdP);
      grdThirdExcelChk.value = false;
    } else if (val === '7') { // M조직
      grdMainRef.value.getData().clearRows();
      pageInfo.value.pageIndex = 1;
      pageInfo.value.totalCount = 0;
      view.setColumnLayout(ogTpCdM);
      grdThirdExcelChk.value = false;
    }
  });
});

const initGrid2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNoSn' }, // 계약상세번호
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'istPlc' }, // 설치처
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'chdvcTp' }, // 기변유형
    { fieldName: 'prtnrKnm' }, // 판매자
    { fieldName: 'prtnrNo' }, // 파트너번호
    { fieldName: 'pstnDvNm' }, // 자격(직급)
    { fieldName: 'canRedfMm' }, // 취소되물림월
    { fieldName: 'dlqRedfMm' }, // 연체되물림월
    { fieldName: 'cpsnRedf' }, // 강제되물림

    { fieldName: 'ackmtPerfAmt', dataType: 'number' }, // 인정 실적
    { fieldName: 'ackmtCnt', dataType: 'number' }, // 인정건수
    { fieldName: 'basePrc', dataType: 'number' }, // 기준가격

    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'istPlcTpCd' }, // 설치장소유형코드
    { fieldName: 'mchnChTpCd' }, // 기기변경유형코드
  ];

  const columns = [
    /* P, M조직 공통 */
    { fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'), // 계약상세번호
      width: '160',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      } },
    { fieldName: 'cstKnm',
      header: t('MSG_TXT_CST_NM'), // 고객명
      width: '120',
      styleName: 'text-center' },
    { fieldName: 'istPlc',
      header: t('MSG_TXT_INSTALL'), // 설치처
      width: '160',
      styleName: 'text-center' },
    { fieldName: 'pdNm',
      header: t('MSG_TXT_PRDT_NM'), // 상품명
      width: '300',
      styleName: 'text-left ' },
    { fieldName: 'chdvcTp',
      header: t('MSG_TXT_CHDVC_TP'), // 기변유형
      width: '200',
      styleName: 'text-center' },
    { fieldName: 'prtnrKnm',
      header: t('MSG_TXT_SELLER_PERSON'), // 판매자
      width: '100',
      styleName: 'text-center' },
    { fieldName: 'prtnrNo',
      header: t('MSG_TXT_PRTNR_NUMBER'), // 파트너번호
      width: '100',
      styleName: 'text-center' },
    { fieldName: 'pstnDvNm',
      header: t('MSG_TXT_QLF_PSTN'), // 자격(직급)
      width: '100',
      styleName: 'text-center' },
    { fieldName: 'canRedfMm',
      header: t('MSG_TXT_CAN_REDF_MM'), // 취소되물림월
      width: '120',
      styleName: 'text-center ',
      datetimeFormat: 'YYYY-MM' },
    { fieldName: 'dlqRedfMm',
      header: t('MSG_TXT_DLQ_REDF_MM'), // 연체되물림월
      width: '120',
      styleName: 'text-center ',
      datetimeFormat: 'YYYY-MM' },
    { fieldName: 'cpsnRedf',
      header: t('MSG_TXT_CPSN_REDF'), // 강제되물림
      width: '120',
      styleName: 'text-center' },

    /* P조직 */
    { fieldName: 'ackmtPerfAmt',
      header: t('MSG_TXT_ACKMT_PERF'), // 인정 실적
      width: '120',
      styleName: 'text-right ',
      numberFormat: '#,##0' },

    /* M조직 */
    { fieldName: 'ackmtCnt',
      header: t('MSG_TXT_PD_ACC_CNT'), // 인정건수
      width: '120',
      styleName: 'text-right ',
      numberFormat: '#,##0' },
    { fieldName: 'basePrc',
      header: t('MSG_TXT_BASE_PRC'), // 기준가격
      width: '120',
      styleName: 'text-right ',
      numberFormat: '#,##0' },
  ];

  const ogTpCdP = [
    'cntrNoSn',
    'cstKnm',
    'istPlc',
    'pdNm',
    'chdvcTp',
    'prtnrKnm',
    'prtnrNo',
    'pstnDvNm',
    'ackmtPerfAmt',
    'canRedfMm',
    'dlqRedfMm',
    'cpsnRedf',
  ];

  const ogTpCdM = [
    'cntrNoSn',
    'cstKnm',
    'istPlc',
    'pdNm',
    'chdvcTp',
    'prtnrKnm',
    'prtnrNo',
    'pstnDvNm',
    'ackmtCnt',
    'basePrc',
    'canRedfMm',
    'dlqRedfMm',
    'cpsnRedf',
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout(ogTpCdP);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  watch(() => searchParams.value.ogTpCd, async (val) => {
    if (val === '2') { // P조직
      grdSecondRef.value.getData().clearRows();
      pageInfo.value.pageIndex = 1;
      pageInfo.value.totalCount = 0;
      view.setColumnLayout(ogTpCdP);
      grdThirdExcelChk.value = false;
    } else if (val === '7') { // M조직
      grdSecondRef.value.getData().clearRows();
      pageInfo.value.pageIndex = 1;
      pageInfo.value.totalCount = 0;
      view.setColumnLayout(ogTpCdM);
      grdThirdExcelChk.value = false;
    }
  });

  /**
   * Infinite Scroll
   */
  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      await fetchData();
    }
  };
});

const initGrid3 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dv' }, // 구분
    { fieldName: 'indvElhmPerf', dataType: 'number' }, // 가전 비례
    { fieldName: 'indvElhmExcpPrpn', dataType: 'number' }, // 가전외 비례
    { fieldName: 'indvSellEncrg', dataType: 'number' }, // 판매장려
    { fieldName: 'indvMetg', dataType: 'number' }, // 미팅
    { fieldName: 'indvMchnCh', dataType: 'number' }, // 기기변경
    { fieldName: 'indvSettle', dataType: 'number' }, // 정착
    { fieldName: 'elhmOgPrpn', dataType: 'number' }, // 가전 조직비례
    { fieldName: 'elhmExcpOgPrpn', dataType: 'number' }, // 가전 외 조직비례
    { fieldName: 'ogSellEncrg', dataType: 'number' }, // 조직판매 장려
    { fieldName: 'redfEtSum', dataType: 'number' }, // 합계
    { fieldName: 'indvElhmPrpnMetg', dataType: 'number' }, // 가전비례+미팅
    { fieldName: 'indvElhmExcpPrpnMetg', dataType: 'number' }, // 가전외비례+미팅
    { fieldName: 'educ', dataType: 'number' }, // 교육
    { fieldName: 'nwSell', dataType: 'number' }, // 신규판매
    { fieldName: 'ogMngt', dataType: 'number' }, // 조직관리
  ];

  const columns = [
    { fieldName: 'dv',
      header: t('MSG_TXT_DIV'), // 구분
      width: '180',
      styleName: 'text-center' },
    { fieldName: 'redfEtSum',
      header: t('MSG_TXT_SUM'), // 합계
      width: '189',
      styleName: 'text-right',
      numberFormat: '#,##0' },

    /* P조직 */
    { fieldName: 'indvElhmPerf',
      header: t('MSG_TXT_ELHM_PRPN'), // 가전 비례
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'indvElhmExcpPrpn',
      header: t('MSG_TXT_ELHM_EXCP_PRPN'), // 가전외 비례
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'indvSellEncrg',
      header: t('MSG_TXT_SAL_INTV'), // 판매장려
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'indvMetg',
      header: t('MSG_TXT_METG'), // 미팅
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'indvMchnCh',
      header: t('MSG_TXT_MCHN_CH'), // 기기변경
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'indvSettle',
      header: t('MSG_TXT_STMNT'), // 정착
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'elhmOgPrpn',
      header: t('MSG_TXT_ELHM_OG_PRPN'), // 가전 조직비례
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'elhmExcpOgPrpn',
      header: t('MSG_TXT_ELHM_EXCP_OG_PRPN'), // 가전 외 조직비례
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'ogSellEncrg',
      header: t('MSG_TXT_OG_SELL_ENCRG'), // 조직판매 장려
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0' },

    /* M조직 */
    { fieldName: 'indvElhmPrpnMetg',
      header: t('MSG_TXT_ELHM_PRPN_METG'), // 가전비례+미팅
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'indvElhmExcpPrpnMetg',
      header: t('MSG_TXT_ELHM_EXCP_PRPN_METG'), // 가전외비례+미팅
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'educ',
      header: t('MSG_TXT_EDUC'), // 교육
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'nwSell',
      header: t('MSG_TXT_NW_SELL'), // 신규판매
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'ogMngt',
      header: t('MSG_TXT_OG_MNGT'), // 조직관리
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = false; // create number indicator column

  const ogTpCdP = [
    'dv',
    {
      header: t('MSG_TXT_PRSNL_FEE'), // 개인수수료
      direction: 'horizontal',
      items: ['indvElhmPerf', 'indvElhmExcpPrpn', 'indvSellEncrg', 'indvMetg', 'indvMchnCh', 'indvSettle'],
    },
    {
      header: t('MSG_TXT_BRCH_FEE'), // 지점수수료
      direction: 'horizontal',
      items: ['elhmOgPrpn', 'elhmExcpOgPrpn', 'ogSellEncrg'],
    },
    'redfEtSum',
  ];

  const ogTpCdM = [
    'dv',
    {
      header: t('MSG_TXT_PRSNL_FEE'), // 개인수수료
      direction: 'horizontal',
      items: ['indvElhmPrpnMetg', 'indvElhmExcpPrpnMetg', 'indvSellEncrg', 'educ', 'indvSettle', 'indvMchnCh'],
    },
    {
      header: t('MSG_TXT_BRCH_FEE'), // 지점수수료
      direction: 'horizontal',
      items: ['elhmOgPrpn', 'elhmExcpOgPrpn', 'ogSellEncrg', 'nwSell', 'ogMngt'],
    },
    'redfEtSum',
  ];

  // multi row header setting
  view.setColumnLayout(ogTpCdP);

  watch(() => searchParams.value.ogTpCd, async (val) => {
    if (val === '2') { // P조직
      grdThirdRef.value.getData().clearRows();
      pageInfo.value.pageIndex = 1;
      pageInfo.value.totalCount = 0;
      view.setColumnLayout(ogTpCdP);
      grdThirdExcelChk.value = false;
    } else if (val === '7') { // M조직
      grdThirdRef.value.getData().clearRows();
      pageInfo.value.pageIndex = 1;
      pageInfo.value.totalCount = 0;
      view.setColumnLayout(ogTpCdM);
      grdThirdExcelChk.value = false;
    }
  });
});
</script>
