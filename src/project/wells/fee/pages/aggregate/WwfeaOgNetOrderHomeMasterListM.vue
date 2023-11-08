<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaOgNetOrderHomeMasterListM - 홈마스터 수수료 순주문 관리
3. 작성자 : min-kyu bae
4. 작성일 : 2023.02.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 홈마스터 수수료 순주문 관리 목록 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <div
        v-if="isSelectVisile1"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
            required
          >
            <kw-select
              v-model="searchParams.divCd"
              :label="$t('MSG_TXT_DIV')"
              :options="customCodes.divCd"
              rules="required"
              @change="onChangeInqrDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_FEE_PERF')+$t('MSG_TXT_TYPE')"
          >
            <kw-select
              v-model="searchParams.feePerfCd"
              :options="codes.FEE_PERF_TP_CD"
              first-option
              first-option-value=""
              :first-option-label="$t('MSG_TXT_ALL')"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PDCT_TP')"
            required
          >
            <kw-select
              v-model="searchParams.pdctTpCd"
              :label="$t('MSG_TXT_PDCT_TP')"
              :options="codes.FEE_PDCT_TP_CD"
              first-option
              first-option-value=""
              :first-option-label="$t('MSG_TXT_ALL')"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_SEL_TYPE')"
          >
            <kw-select
              v-model="searchParams.sellTpCd"
              :label="$t('MSG_TXT_SEL_TYPE')"
              :options="customCodes.selTpCd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DT')"
            required
          >
            <kw-date-range-picker
              v-model:from="searchParams.strtDt"
              v-model:to="searchParams.endDt"
              :label="$t('MSG_TXT_DT')"
              @change="onChangeDt"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_CANC_DT')"
          >
            <kw-date-range-picker
              v-model:from="searchParams.cancStrtDt"
              v-model:to="searchParams.cancEndDt"
              :label="$t('MSG_TXT_CANC_DT')"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_PRDT_CODE')"
          >
            <kw-input
              v-model="searchParams.pdStrtCd"
              maxlength="10"
              clearable
              icon="search"
              @click-icon="onClickSearchPdCdPopup('S')"
            />
            <span>~</span>
            <kw-input
              v-model="searchParams.pdEndCd"
              maxlength="10"
              clearable
              icon="search"
              @click-icon="onClickSearchPdCdPopup('E')"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PKG_PD_NO')"
          >
            <kw-input
              v-model="searchParams.pkgStrtCd"
            />
            <span>~</span>
            <kw-input
              v-model="searchParams.pkgEndCd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          >
            <kw-input
              v-model="searchParams.prtnrNo"
              icon="search"
              clearable
              :maxlength="10"
              :on-click-icon="onClickSearchNo"
              :placeholder="$t('MSG_TXT_SEQUENCE_NUMBER')"
              @update:model-value="onClickPrtnrNoClear()"
            />
            <kw-input
              v-model="searchParams.prtnrKnm"
              :placeholder="$t('MSG_TXT_EMPL_NM')"
              readonly
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item :label="t('MSG_TXT_OG_LEVL')">
            <zwog-level-select
              v-model:og-levl-dv-cd1="searchParams.og1LevlId"
              v-model:og-levl-dv-cd2="searchParams.og2LevlId"
              v-model:og-levl-dv-cd3="searchParams.og3LevlId"
              :og-tp-cd="searchParams.ogTpCd"
              :base-ym="searchParams.perfYm"
              :start-level="1"
              :end-level="3"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
      <div
        v-if="isSelectVisile2"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
            required
          >
            <kw-select
              v-model="searchParams.divCd"
              :label="$t('MSG_TXT_DIV')"
              :options="customCodes.divCd"
              rules="required"
              @change="onChangeInqrDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_ORDR')"
          >
            <kw-option-group
              v-model="searchParams.feeTcntDvCd"
              :label="$t('MSG_TXT_ORDR')"
              type="radio"
              :options="codes.FEE_TCNT_DV_CD"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_FEE_YM')"
            required
          >
            <kw-date-picker
              v-model="searchParams.perfYm"
              :label="$t('MSG_TXT_FEE_YM')"
              type="month"
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
              icon="search"
              clearable
              :on-click-icon="onClickSearchNo"
              :placeholder="$t('MSG_TXT_SEQUENCE_NUMBER')"
              @update:model-value="onClickPrtnrNoClear()"
            />
            <kw-input
              v-model="searchParams.prtnrKnm"
              :placeholder="$t('MSG_TXT_EMPL_NM')"
              readonly
            />
          </kw-search-item>
          <kw-search-item :label="t('MSG_TXT_OG_LEVL')">
            <zwog-level-select
              v-model:og-levl-dv-cd1="searchParams.og1LevlId"
              v-model:og-levl-dv-cd2="searchParams.og2LevlId"
              v-model:og-levl-dv-cd3="searchParams.og3LevlId"
              :og-tp-cd="searchParams.ogTpCd"
              :base-ym="searchParams.perfYm"
              :start-level="1"
              :end-level="3"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
    </kw-search>
    <div
      class="result-area"
    >
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
        <kw-btn
          v-permission:download
          dense
          secondary
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!isExcelDown"
          @click="onClickExcelDownload"
        />
        <kw-separator
          v-if="isPerfVisile"
          vertical
          inset
          spaced
        />
        <kw-btn
          v-if="isPerfVisile"
          v-permission:create
          :label="$t('MSG_BTN_FEE_PERF_CRT')"
          primary
          dense
          secondary
          @click="openFeePerfCrtPopup"
        />
        <kw-btn
          v-if="isPerfVisile"
          v-permission:update
          :label="$t('MSG_BTN_FEE_PERF_DTRM')"
          primary
          dense
          secondary
          @click="openFeePerfCnfmPopup"
        />
        <kw-btn
          v-if="isPerfVisile"
          v-permission:update
          :label="$t('MSG_BTN_FEE_PERF_DTRM_CAN')"
          primary
          dense
          secondary
          @click="openFeePerfCnfmCanPopup"
        />
      </kw-action-top>

      <kw-grid
        v-if="isSelectVisile1"
        ref="grd1MainRef"
        name="grd1Main"
        :visible-rows="10"
        @init="initGrd1Main"
      />
      <kw-grid
        v-if="isSelectVisile2"
        ref="grd2MainRef"
        name="grd2Main"
        :visible-rows="10"
        @init="initGrd2Main"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';

import pdConst from '~sms-common/product/constants/pdConst';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import { useDataService, getComponentType, useGlobal, gridUtil, defineGrid, codeUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { modal, confirm } = useGlobal();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grd1MainRef = ref(getComponentType('KwGrid'));
const grd2MainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'FEE_PERF_TP_CD',
  'RGLR_SPP_PRC_DV_CD',
  'MCHN_CH_TP_CD',
  'FEE_PDCT_TP_CD',
  'PMOT_TP_CD',
  'SELL_DSC_DV_CD',
  'SELL_DSC_TP_CD',
  'FEE_TCNT_DV_CD',
);

const customCodes = {
  divCd: [{ codeId: '01', codeName: '매출' }, { codeId: '02', codeName: '접수' }, { codeId: '03', codeName: '예약' }, { codeId: '04', codeName: '수수료 실적 집계 대상' }],
  selTpCd: [{ codeId: '0', codeName: '전체' }, { codeId: '2', codeName: '렌탈/리스' }, { codeId: '1', codeName: '일시불' }, { codeId: '6', codeName: '정기배송' }, { codeId: '7', codeName: '재약정' }, { codeId: '3', codeName: '홈케어멤버십' }],
  rsbDvCd: [{ codeId: '00', codeName: '전체' }, { codeId: '15', codeName: '홈마스터' }, { codeId: '7', codeName: '지점장이상' }],
};
const isSelectVisile1 = ref(true);
const isSelectVisile2 = ref(false);
const isExcelDown = ref(false);
const isPerfVisile = ref(false);

const searchParams = ref({
  feeTcntDvCd: '01',
  divCd: '02',
  feePerfCd: '',
  pdctTpCd: '',
  sellTpCd: '0',
  strtDt: now.add(-1, 'month').startOf('month').format('YYYYMMDD'),
  endDt: now.add(-1, 'month').endOf('month').format('YYYYMMDD'),
  cancStrtDt: '',
  cancEndDt: '',
  pdStrtCd: '',
  pdEndCd: '',
  pkgStrtCd: '',
  pkgEndCd: '',
  og1LevlId: '',
  og2LevlId: '',
  og3LevlId: '',
  prtnrNo: '',
  perfYm: now.add(-1, 'month').format('YYYYMM'),
  rsbDvCd: '00',
  prtnrKnm: '',
  ogTpCd: 'W03',
  pdCd: '',
});

let cachedParams;

/*
 *  Event - 조회조건 선택에 변경 param init
*/
async function initSearchParams() {
  totalCount.value = 0;
  if (grd1MainRef.value) {
    grd1MainRef.value.getData().clearRows();
  }
  if (grd2MainRef.value) {
    grd2MainRef.value.getData().clearRows();
  }
}

/*
 *  Event - 번호 검색 아이콘 클릭 이벤트
 */
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzMonthPartnerListP',
    componentProps: {
      baseYm: searchParams.value.perfYm,
      prtnrNo: searchParams.value.prtnrNo,
      ogTpCd: 'W03',
      prtnrKnm: undefined,
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.prtnrNo = payload.prtnrNo;
      searchParams.value.prtnrKnm = payload.prtnrKnm;
    }
  }
}

async function onClickPrtnrNoClear() {
  searchParams.value.prtnrKnm = '';
}

/*
 *  Event - 상품코드 검색 아이콘 클릭 이벤트
 */
async function onClickSearchPdCdPopup(arg) {
  if (arg === 'S') {
    searchParams.value.pdCd = searchParams.value.pdStrtCd;
  } else {
    searchParams.value.pdCd = searchParams.value.pdEndCd;
  }
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.pdCd,
    selectType: pdConst.PD_SEARCH_SINGLE,
  };
  const rtn = await modal({
    component: 'ZwpdcStandardListP',
    componentProps: searchPopupParams,
  });
  if (arg === 'S') {
    searchParams.value.pdStrtCd = rtn.payload?.[0]?.pdCd;
  } else {
    searchParams.value.pdEndCd = rtn.payload?.[0]?.pdCd;
  }
}

/*
 *  Event - 일자 선택에 따른 실적년월 적용
 */

async function onChangeDt() {
  const { strtDt } = searchParams.value;
  searchParams.value.perfYm = strtDt.substring(0, 6);
}

/*
 *  Event - 수수료 실적 생성 버튼 클릭 (CR/CO)
 */
async function openFeePerfCrtPopup() {
  const statusParams = {
    baseYm: searchParams.value.perfYm,
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
    perfAgrgCrtDvCd: '301',
    ntorCnrfmStatCd: '01',
  };

  const res = await dataService.get('/sms/common/fee/net-order-status/prtnr', { params: statusParams });

  if (!isEmpty(res.data)) {
    if (!await confirm(t('MSG_ALT_AGRG_PERF_ALREADY_DATA'))) { return; }
  }

  const params = {
    perfYm: searchParams.value.perfYm,
    ogTp: 'W03',
    dv: 'CR',
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
    perfAgrgCrtDvCd: '301',
  };
  await modal({
    component: 'WwfeaOgNetOrderPerfAgrgRegP',
    componentProps: params,
  });
}

/*
 *  Event - 수수료 실적 확정 버튼 클릭 (CR/CO)
 */
async function openFeePerfCnfmPopup() {
  const statusParams = {
    baseYm: searchParams.value.perfYm,
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
    perfAgrgCrtDvCd: '301',
    ntorCnfmStatCd: '02',
  };

  const res = await dataService.get('/sms/common/fee/net-order-status/prtnr', { params: statusParams });

  if (!isEmpty(res.data)) {
    if (!await confirm(t('MSG_ALT_MSG_ALT_CNFM_PERF_ALREADY_DATA'))) { return; }
  }

  const param = {
    perfYm: searchParams.value.perfYm,
    ogTp: 'W03',
    dv: 'CO',
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
    perfAgrgCrtDvCd: '301',
  };
  await modal({
    component: 'WwfeaOgNetOrderPerfAgrgRegP',
    componentProps: param,
  });
}

/*
 *  Event - 수수료 실적 확정 취소 버튼 클릭 (CR/CO)
 */
async function openFeePerfCnfmCanPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    ogTp: 'W03',
    dv: 'CC',
    feeTcntDvCd: searchParams.value.feeTcntDvCd,
    perfAgrgCrtDvCd: '301',
  };
  await modal({
    component: 'WwfeaOgNetOrderPerfAgrgRegP',
    componentProps: param,
  });
}

/*
 *  Function - 엑셀 다운로드 처리 (기본 그리드)
 */
async function downloadExcelView1(uri) {
  const view = grd1MainRef.value.getView();
  const response = await dataService.get(`/sms/wells/fee/organization-netorders/${uri}`, { params: cachedParams, timeout: 300000 });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

/*
 *  Function - 엑셀 다운로드 처리 (집계 그리드)
 */
async function downloadExcelView2(uri) {
  const view = grd2MainRef.value.getView();
  const response = await dataService.get(`/sms/wells/fee/organization-netorders/${uri}`, { params: cachedParams, timeout: 300000 });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

/*
 *  Event - 엑셀 다운로드 버튼 클릭
 */
async function onClickExcelDownload() {
  const { divCd } = searchParams.value;
  cachedParams = cloneDeep(searchParams.value);

  if (divCd === '04') {
    await downloadExcelView2('hmst-fees');
  } else {
    await downloadExcelView1('hmsts');
  }
}

async function fetchData(uri) {
  const response = await dataService.get(`/sms/wells/fee/organization-netorders/${uri}`, { params: cachedParams, timeout: 300000 });
  const resData = response.data;
  totalCount.value = resData.length;
  if (totalCount.value > 0) {
    isExcelDown.value = true;
  }
  if (uri === 'hmsts') {
    const mngerView = grd1MainRef.value.getView();
    mngerView.getDataSource().setRows(resData);
  } else if (uri === 'hmst-fees') {
    const feeView = grd2MainRef.value.getView();
    feeView.getDataSource().setRows(resData);
  }
}

/*
 *  Event - 조회 버튼 클릭
 */
async function onClickSearch() {
  const { divCd } = searchParams.value;
  let uri = '';

  if (divCd === '04') {
    uri = 'hmst-fees';
  } else {
    uri = 'hmsts';
  }
  cachedParams = cloneDeep(searchParams.value);
  await fetchData(uri);
}

/*
 *  Event - 조회조건 선택에 따른 검색조건 및 그리드 변경
 */

async function onChangeInqrDv() {
  const { divCd } = searchParams.value;
  if (divCd === '04') {
    isSelectVisile1.value = false;
    isSelectVisile2.value = true;
    isPerfVisile.value = true;
  } else {
    isSelectVisile1.value = true;
    isSelectVisile2.value = false;
    isPerfVisile.value = false;
  }
  initSearchParams();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrd1Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'og2Lv' },
    { fieldName: 'og3Lv' },
    { fieldName: 'sequenceNumber' },
    { fieldName: 'emplNm' },
    { fieldName: 'selType' },
    { fieldName: 'pdctTp' },
    { fieldName: 'prcTp' },
    { fieldName: 'chdvcTp' },
    { fieldName: 'fee' },
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'cstDv' },
    { fieldName: 'prdtNm' },
    { fieldName: 'prdtCode' },
    { fieldName: 'pdDcClass' },
    { fieldName: 'discCode' },
    { fieldName: 'dscSyst' },
    { fieldName: 'combiDv' },
    { fieldName: 'istm' },
    { fieldName: 'stplMcnt' },
    { fieldName: 'mngtPrd' },
    { fieldName: 'pdAccRslt', dataType: 'number' },
    { fieldName: 'basePrc', dataType: 'number' },
    { fieldName: 'homeCare' },
    { fieldName: 'hcrMshY3' },
    { fieldName: 'fxamYn' },
    { fieldName: 'fnnLease' },
    { fieldName: 'elhmAckmtCt' },
    { fieldName: 'nwSellCt' },
    { fieldName: 'obj' },
    { fieldName: 'recommitment' },
    { fieldName: 'cntrDate' },
    { fieldName: 'slDt' },
    { fieldName: 'cancDt' },
    { fieldName: 'demDt' },
    { fieldName: 'brmgrNo' },
    { fieldName: 'brmgrFnm' },
    { fieldName: 'rtlfe', dataType: 'number' },
    { fieldName: 'pmotNo' },
    { fieldName: 'pkgPdNo' },
    { fieldName: 'pkgSn' },
    { fieldName: 'mchnPrtnr' },
    { fieldName: 'mchnPd' },
    { fieldName: 'perfExcd' },
  ];

  const columns = [
    { fieldName: 'og2Lv', header: t('MSG_TXT_RGNL_GRP'), width: '120', styleName: 'text-center' },
    { fieldName: 'og3Lv', header: t('MSG_TXT_BRANCH'), width: '120', styleName: 'text-center' },
    { fieldName: 'sequenceNumber', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '98' },
    { fieldName: 'emplNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'selType', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'pdctTp', header: t('MSG_TXT_PDCT_TP'), width: '120', styleName: 'text-center', options: codes.FEE_PERF_TP_CD },
    { fieldName: 'prcTp', header: t('MSG_TXT_PRC_TP'), width: '110', styleName: 'text-center', options: codes.RGLR_SPP_PRC_DV_CD },
    { fieldName: 'chdvcTp', header: t('MSG_TXT_CHDVC_TP'), width: '110', styleName: 'text-center', options: codes.MCHN_CH_TP_CD },
    { fieldName: 'fee', header: t('MSG_TXT_FEE') + t('MSG_TXT_PERF') + t('MSG_TXT_TYPE'), width: '110', styleName: 'text-center', options: codes.FEE_PDCT_TP_CD },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130' },
    { fieldName: 'cstDv', header: t('MSG_TXT_CST_DV'), width: '80', styleName: 'text-center' },
    { fieldName: 'prdtNm', header: t('MSG_TXT_PRDT_NM'), width: '230', styleName: 'text-left' },
    { fieldName: 'prdtCode', header: t('MSG_TXT_PRDT_CODE'), width: '120', styleName: 'text-center' },
    { fieldName: 'pdDcClass', header: t('MSG_TXT_PD_DC_CLASS'), width: '90', styleName: 'text-center', options: codes.SELL_DSC_DV_CD },
    { fieldName: 'discCode', header: t('MSG_TXT_DISC_CODE'), width: '90', styleName: 'text-center', options: codes.SELL_DSC_TP_CD },
    { fieldName: 'dscSyst', header: t('MSG_TXT_DSC_SYST'), width: '90', styleName: 'text-center' },
    { fieldName: 'combiDv', header: t('MSG_TXT_COMBI_DV'), width: '90', styleName: 'text-center' },
    { fieldName: 'istm', header: t('MSG_TXT_ISTM'), width: '90', styleName: 'text-right' },
    { fieldName: 'stplMcnt', header: t('MSG_TXT_STPL_MCNT'), width: '90', styleName: 'text-right' },
    { fieldName: 'mngtPrd', header: t('MSG_TXT_MNGT_PRD'), width: '90', styleName: 'text-right' },
    { fieldName: 'pdAccRslt', header: t('MSG_TXT_PD_ACC_RSLT'), width: '140', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'basePrc', header: t('MSG_TXT_BASE_PRC'), width: '140', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'homeCare', header: t('MSG_TXT_HOME_CARE'), width: '90', styleName: 'text-right' },
    { fieldName: 'hcrMshY3', header: t('MSG_TXT_HCR_MSH_Y3'), width: '140', styleName: 'text-center' },
    { fieldName: 'fxamYn', header: t('MSG_TXT_FXAM_YN'), width: '90', styleName: 'text-center' },
    { fieldName: 'fnnLease', header: t('MSG_TXT_FNN_LEASE'), width: '90', styleName: 'text-center' },
    { fieldName: 'elhmAckmtCt', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '100', styleName: 'text-right' },
    { fieldName: 'nwSellCt', header: t('MSG_TXT_NW_SELL_CT'), width: '90', styleName: 'text-right' },
    { fieldName: 'obj', header: `BS${t('MSG_TXT_OBJ')}`, width: '90', styleName: 'text-right' },
    { fieldName: 'recommitment', header: t('MSG_TXT_RECOMMITMENT'), width: '110', styleName: 'text-center' },
    { fieldName: 'cntrDate', header: t('MSG_TXT_CNTR_DATE'), width: '110', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '110', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cancDt', header: t('MSG_TXT_CANC_DT'), width: '110', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'demDt', header: t('MSG_TXT_DEM_DT'), width: '110', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'brmgrNo', header: t('MSG_TXT_BRMGR_NO'), width: '110', styleName: 'text-center' },
    { fieldName: 'brmgrFnm', header: t('MSG_TXT_BRMGR_FNM'), width: '100', styleName: 'text-center' },
    { fieldName: 'rtlfe', header: t('MSG_TXT_RTLFE'), width: '100', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'pmotNo', header: t('MSG_TXT_PMOT_NO'), width: '100', styleName: 'text-right' },
    { fieldName: 'pkgPdNo', header: t('MSG_TXT_PKG_PD_NO'), width: '140', styleName: 'text-center' },
    { fieldName: 'mchnPrtnr', header: t('MSG_TXT_MCHN') + t('MSG_TXT_CST_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'mchnPd', header: t('MSG_TXT_MCHN') + t('MSG_TXT_PRDT_CODE'), width: '100', styleName: 'text-center' },
    { fieldName: 'perfExcd', header: t('MSG_TXT_PERF_EXCD') + t('MSG_TXT_RGST_YN'), width: '120', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'og2Lv' },
    { fieldName: 'og3Lv' },
    { fieldName: 'sequenceNumber' },
    { fieldName: 'emplNm' },
    { fieldName: 'selType' },
    { fieldName: 'pdctTp' },
    { fieldName: 'prcTp' },
    { fieldName: 'chdvcTp' },
    { fieldName: 'fee' },
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'cstDv' },
    { fieldName: 'prdtNm' },
    { fieldName: 'prdtCode' },
    { fieldName: 'pdDcClass' },
    { fieldName: 'discCode' },
    { fieldName: 'dscSyst' },
    { fieldName: 'combiDv' },
    { fieldName: 'istm' },
    { fieldName: 'stplMcnt' },
    { fieldName: 'mngtPrd' },
    { fieldName: 'pdAccRslt', dataType: 'number' },
    { fieldName: 'basePrc', dataType: 'number' },
    { fieldName: 'homeCare' },
    { fieldName: 'hcrMshY3' },
    { fieldName: 'fxamYn' },
    { fieldName: 'fnnLease' },
    { fieldName: 'elhmAckmtCt' },
    { fieldName: 'nwSellCt' },
    { fieldName: 'obj' },
    { fieldName: 'recommitment' },
    { fieldName: 'cntrDate' },
    { fieldName: 'slDt' },
    { fieldName: 'cancDt' },
    { fieldName: 'demDt' },
    { fieldName: 'brmgrNo' },
    { fieldName: 'brmgrFnm' },
    { fieldName: 'rtlfe', dataType: 'number' },
    { fieldName: 'pmotNo' },
    { fieldName: 'pkgPdNo' },
    { fieldName: 'pkgSn' },
    { fieldName: 'mchnPrtnr' },
    { fieldName: 'mchnPd' },
    { fieldName: 'perfExcd' },
  ];

  const columns = [
    { fieldName: 'og2Lv', header: t('MSG_TXT_RGNL_GRP'), width: '120', styleName: 'text-center' },
    { fieldName: 'og3Lv', header: t('MSG_TXT_BRANCH'), width: '120', styleName: 'text-center' },
    { fieldName: 'sequenceNumber', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '98' },
    { fieldName: 'emplNm', header: t('MSG_TXT_EMPL_NM'), width: '98', styleName: 'text-center' },
    { fieldName: 'selType', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'pdctTp', header: t('MSG_TXT_PDCT_TP'), width: '120', styleName: 'text-center', options: codes.FEE_PERF_TP_CD },
    { fieldName: 'prcTp', header: t('MSG_TXT_PRC_TP'), width: '110', styleName: 'text-center', options: codes.RGLR_SPP_PRC_DV_CD },
    { fieldName: 'chdvcTp', header: t('MSG_TXT_CHDVC_TP'), width: '110', styleName: 'text-center', options: codes.MCHN_CH_TP_CD },
    { fieldName: 'fee', header: t('MSG_TXT_FEE') + t('MSG_TXT_PERF') + t('MSG_TXT_TYPE'), width: '110', styleName: 'text-center', options: codes.FEE_PDCT_TP_CD },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130' },
    { fieldName: 'cstDv', header: t('MSG_TXT_CST_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'prdtNm', header: t('MSG_TXT_PRDT_NM'), width: '226.5', styleName: 'text-left' },
    { fieldName: 'prdtCode', header: t('MSG_TXT_PRDT_CODE'), width: '120', styleName: 'text-center' },
    { fieldName: 'pdDcClass', header: t('MSG_TXT_PD_DC_CLASS'), width: '83.5', styleName: 'text-center', options: codes.SELL_DSC_DV_CD },
    { fieldName: 'discCode', header: t('MSG_TXT_DISC_CODE'), width: '83.5', styleName: 'text-center', options: codes.SELL_DSC_TP_CD },
    { fieldName: 'dscSyst', header: t('MSG_TXT_DSC_SYST'), width: '83.5', styleName: 'text-center', options: codes.PMOT_TP_CD },
    { fieldName: 'combiDv', header: t('MSG_TXT_COMBI_DV'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'istm', header: t('MSG_TXT_ISTM'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'stplMcnt', header: t('MSG_TXT_STPL_MCNT'), width: '84', styleName: 'text-right' },
    { fieldName: 'mngtPrd', header: t('MSG_TXT_MNGT_PRD'), width: '84', styleName: 'text-right' },
    { fieldName: 'pdAccRslt', header: t('MSG_TXT_PD_ACC_RSLT'), width: '142', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'basePrc', header: t('MSG_TXT_BASE_PRC'), width: '123.8', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'homeCare', header: t('MSG_TXT_HOME_CARE'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'hcrMshY3', header: t('MSG_TXT_HCR_MSH_Y3'), width: '141.2', styleName: 'text-center' },
    { fieldName: 'fxamYn', header: t('MSG_TXT_FXAM_YN'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'fnnLease', header: t('MSG_TXT_FNN_LEASE'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'elhmAckmtCt', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '90', styleName: 'text-right' },
    { fieldName: 'nwSellCt', header: t('MSG_TXT_NW_SELL_CT'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'obj', header: `BS${t('MSG_TXT_OBJ')}`, width: '83.5', styleName: 'text-right' },
    { fieldName: 'recommitment', header: t('MSG_TXT_RECOMMITMENT'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'cntrDate', header: t('MSG_TXT_CNTR_DATE'), width: '113.2', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '113.2', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cancDt', header: t('MSG_TXT_CANC_DT'), width: '113.2', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'demDt', header: t('MSG_TXT_DEM_DT'), width: '113.2', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'brmgrNo', header: t('MSG_TXT_BRMGR_NO'), width: '113', styleName: 'text-center' },
    { fieldName: 'brmgrFnm', header: t('MSG_TXT_BRMGR_FNM'), width: '100', styleName: 'text-center' },
    { fieldName: 'rtlfe', header: t('MSG_TXT_RTLFE'), width: '104.3', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'pmotNo', header: t('MSG_TXT_PMOT_NO'), width: '120', styleName: 'text-right' },
    { fieldName: 'pkgPdNo', header: t('MSG_TXT_PKG_PD_NO'), width: '135.1', styleName: 'text-center' },
    { fieldName: 'mchnPrtnr', header: t('MSG_TXT_MCHN') + t('MSG_TXT_CST_CD'), width: '113', styleName: 'text-center' },
    { fieldName: 'mchnPd', header: t('MSG_TXT_MCHN') + t('MSG_TXT_PRDT_CODE'), width: '113', styleName: 'text-center' },
    { fieldName: 'perfExcd', header: t('MSG_TXT_PERF_EXCD') + t('MSG_TXT_RGST_YN'), width: '113', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
