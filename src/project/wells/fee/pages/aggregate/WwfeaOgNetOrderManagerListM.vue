<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaOgNetOrderManagerListM - M조직 수수료 순주문 관리
3. 작성자 : gs.piit150
4. 작성일 : 2023.02.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- M조직 수수료 순주문 관리 목록 조회 화면
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
            :label="$t('MSG_TXT_INQR_DV')"
            required
          >
            <kw-option-group
              v-model="searchParams.schInqrDv"
              :label="$t('MSG_TXT_INQR_DV')"
              rules="required"
              type="radio"
              :options="customCodes.inqrCd"
              @change="onChangeInqrDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_ORDR')"
            required
          >
            <kw-option-group
              v-model="searchParams.schOrdr"
              :label="$t('MSG_TXT_ORDR')"
              rules="required"
              type="radio"
              :options="customCodes.tcntCd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DIV')"
            required
          >
            <kw-select
              v-model="searchParams.schDiv"
              :label="$t('MSG_TXT_DIV')"
              :options="customCodes.divCd"
              rules="required"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_FEE_PERF')+$t('MSG_TXT_TYPE')"
          >
            <kw-select
              v-model="searchParams.schFeePerf"
              :options="customCodes.feePerfCd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PDCT_TP')"
            required
          >
            <kw-select
              v-model="searchParams.schPdctTp"
              :label="$t('MSG_TXT_PDCT_TP')"
              :options="customCodes.pdctTpCd"
              rules="required"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_SEL_TYPE')"
          >
            <kw-select
              v-model="searchParams.schSelType"
              :label="$t('MSG_TXT_SEL_TYPE')"
              :options="customCodes.selTpCd"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_DT')"
            required
          >
            <kw-date-range-picker
              v-model:from="searchParams.schDtStrt"
              v-model:to="searchParams.schDtEnd"
              :label="$t('MSG_TXT_DT')"
              rules="date_range_required|date_range_months:1"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_CANC_DT')"
          >
            <kw-date-range-picker
              v-model:from="searchParams.schCancDtStrt"
              v-model:to="searchParams.schCancDtEnd"
              :label="$t('MSG_TXT_CANC_DT')"
              rules="date_range_months:1"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PRDT_CODE')"
          >
            <kw-input
              v-model="searchParams.schPdCdStrt"
            />
            <span>~</span>
            <kw-input
              v-model="searchParams.schPdCdEnd"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_PKG_CD')"
          >
            <kw-input
              v-model="searchParams.schPkgCdStrt"
            />
            <span>~</span>
            <kw-input
              v-model="searchParams.schPkgCdEnd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_BLG')"
          >
            <kw-input
              v-model="searchParams.schBlgStrt"
            />
            <span>~</span>
            <kw-input
              v-model="searchParams.schBlgEnd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          >
            <kw-input
              v-model="searchParams.schPrtnrNo"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
      <div
        v-if="isSelectVisile2"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_INQR_DV')"
            required
          >
            <kw-option-group
              v-model="searchParams.schInqrDv"
              :label="$t('MSG_TXT_INQR_DV')"
              rules="required"
              type="radio"
              :options="customCodes.inqrCd"
              @change="onChangeInqrDv"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_ORDR')"
            required
          >
            <kw-option-group
              v-model="searchParams.schOrdr"
              :label="$t('MSG_TXT_ORDR')"
              rules="required"
              type="radio"
              :options="customCodes.tcntCd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_PERF_YM')"
            required
          >
            <kw-date-picker
              v-model="searchParams.schPerfYm"
              :label="$t('MSG_TXT_PERF_YM')"
              type="month"
              rules="required"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_RSB_DV')"
            required
          >
            <kw-option-group
              v-model="searchParams.schRsbDv"
              :label="$t('MSG_TXT_RSB_DV')"
              rules="required"
              type="radio"
              :options="customCodes.rsbDvCd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_BLG')"
          >
            <kw-input
              v-model="searchParams.schBlgStrt"
            />
            <span>~</span>
            <kw-input
              v-model="searchParams.schBlgEnd"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          >
            <kw-input
              v-model="searchParams.schPrtnrNo"
            />
          </kw-search-item>
        </kw-search-row>
      </div>
    </kw-search>
    <div
      v-if="isSelectVisile1"
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
          dense
          secondary
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount.value === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_FEE_PERF_CRT')"
          primary
          dense
          @click="openFeePerfCrtPopup"
        />
        <kw-btn
          :label="$t('MSG_BTN_FEE_PERF_DTRM')"
          primary
          dense
          @click="openFeePerfCnfmPopup"
        />
      </kw-action-top>

      <kw-grid
        ref="grd1MainRef"
        name="grd1Main"
        :visible-rows="10"
        @init="initGrd1Main"
      />
    </div>
    <div
      v-if="isSelectVisile2"
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
          dense
          secondary
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount.value === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_FEE_PERF_CRT')"
          primary
          dense
          @click="openFeePerfCrtPopup"
        />
        <kw-btn
          :label="$t('MSG_BTN_FEE_PERF_DTRM')"
          primary
          dense
          @click="openFeePerfCnfmPopup"
        />
      </kw-action-top>
      <kw-grid
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

import { useDataService, getComponentType, useGlobal, gridUtil, defineGrid } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { modal } = useGlobal();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grd1MainRef = ref(getComponentType('KwGrid'));
const grd2MainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const customCodes = {
  inqrCd: [{ codeId: '01', codeName: '상세' }, { codeId: '02', codeName: '집계' }],
  divCd: [{ codeId: '01', codeName: '매출' }, { codeId: '02', codeName: '접수' }, { codeId: '03', codeName: '예약' }, { codeId: '04', codeName: '수수료 실적 집계 대상' }],
  feePerfCd: [{ codeId: '01', codeName: '전체' }, { codeId: '02', codeName: '가전' }, { codeId: '03', codeName: '가전외' }, { codeId: '04', codeName: '기타' }, { codeId: '05', codeName: '미지급' }],
  pdctTpCd: [{ codeId: '01', codeName: '전체' }, { codeId: '02', codeName: '환경가전' }, { codeId: '03', codeName: '환경가전외' }, { codeId: '04', codeName: '웰스팜' }, { codeId: '05', codeName: '홈케어' }, { codeId: '06', codeName: '캡슐' }, { codeId: '07', codeName: '기타' }],
  tcntCd: [{ codeId: '01', codeName: '1차' }, { codeId: '02', codeName: '2차' }],
  selTpCd: [{ codeId: '01', codeName: '전체' }, { codeId: '02', codeName: '렌탈' }, { codeId: '03', codeName: '정기구매' }, { codeId: '04', codeName: '할부' }, { codeId: '05', codeName: '홈케어' }, { codeId: '06', codeName: '재약정' }, { codeId: '07', codeName: '멤버십' }],
  rsbDvCd: [{ codeId: '01', codeName: '전체' }, { codeId: '02', codeName: '지구장이하' }, { codeId: '03', codeName: '지점장이상' }],
};
const isSelectVisile1 = ref(true);
const isSelectVisile2 = ref(false);
const isGrid1Visile = ref(true);
const isGrid2Visile = ref(false);

const searchParams = ref({
  schInqrDv: '01',
  schOrdr: '01',
  schDiv: '02',
  schFeePerf: '01',
  schPdctTp: '01',
  schSelType: '01',
  schDtStrt: now.add(-1, 'month').startOf('month').format('YYYYMMDD'),
  schDtEnd: now.add(-1, 'month').endOf('month').format('YYYYMMDD'),
  schCancDtStrt: '',
  schCancDtEnd: '',
  schPdCdStrt: '',
  schPdCdEnd: '',
  schPkgCdStrt: '',
  schPkgCdEnd: '',
  schBlgStrt: '',
  schBlgEnd: '',
  schPrtnrNo: '',
  schPerfYm: '',
  schRsbDv: '01',
});

let cachedParams;

/*
 *  Event - 조회조건 선택에 변경 param init
 */
async function initSearchParams() {
  searchParams.value.schOrdr = '01';
  searchParams.value.schDiv = '02';
  searchParams.value.schFeePerf = '01';
  searchParams.value.schPdctTp = '01';
  searchParams.value.schSelType = '01';
  searchParams.value.schDtStrt = now.add(-1, 'month').startOf('month').format('YYYYMMDD');
  searchParams.value.schDtEnd = now.add(-1, 'month').endOf('month').format('YYYYMMDD');
  searchParams.value.schCancDtStrt = '';
  searchParams.value.schCancDtEnd = '';
  searchParams.value.schPdCdStrt = '';
  searchParams.value.schPdCdEnd = '';
  searchParams.value.schPkgCdStrt = '';
  searchParams.value.schPkgCdEnd = '';
  searchParams.value.schBlgStrt = '';
  searchParams.value.schBlgEnd = '';
  searchParams.value.schPrtnrNo = '';
  searchParams.value.schPerfYm = now.add(-1, 'month').format('YYYYMM');
  searchParams.value.schRsbDv = '01';
}

/*
 *  Event - 조회조건 선택에 따른 검색조건 및 그리드 변경
 */

async function onChangeInqrDv() {
  const { schInqrDv } = searchParams.value;

  if (schInqrDv === '01') {
    isSelectVisile1.value = true;
    isSelectVisile2.value = false;
    isGrid1Visile.value = true;
    isGrid2Visile.value = false;
    initSearchParams();
  } else if (schInqrDv === '02') {
    isSelectVisile1.value = false;
    isSelectVisile2.value = true;
    isGrid1Visile.value = false;
    isGrid2Visile.value = true;
    initSearchParams();
  }
}

/*
 *  Event - 수수료 실적 생성 버튼 클릭 (CR/CO)
 */
async function openFeePerfCrtPopup() {
  const param = {
    perfYm: now.add(-1, 'month').format('YYYYMM'),
    ogTp: 'W02',
    dv: 'CR',
  };
  await modal({
    component: 'WwfeaOgNetOrderPerfAgrgRegP',
    componentProps: param,
  });
}

/*
 *  Event - 수수료 실적 확정 버튼 클릭 (CR/CO)
 */
async function openFeePerfCnfmPopup() {
  const param = {
    perfYm: now.add(-1, 'month').format('YYYYMM'),
    ogTp: 'W02',
    dv: 'CO',
  };
  await modal({
    component: 'WwfeaOgNetOrderPerfAgrgRegP',
    componentProps: param,
  });
}

async function onClickExcelDownload() {
  const view = grd1MainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

async function fetchData() {
  const { schInqrDv } = searchParams.value;
  let uri = '';
  if (schInqrDv === '01') {
    uri = 's';
  } else if (schInqrDv === '02') {
    uri = '-sell-fees';
  }
  const response = await dataService.get(`/sms/wells/fee/organization-netorders/mnger${uri}`, { params: cachedParams });
  const mngerFees = response.data;
  totalCount.value = mngerFees.length;

  const view = grd1MainRef.value.getView();
  view.getDataSource().setRows(mngerFees);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrd1Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
    { fieldName: 'col15' },
    { fieldName: 'col16' },
    { fieldName: 'col17' },
    { fieldName: 'col18' },
    { fieldName: 'col19' },
    { fieldName: 'col20' },
    { fieldName: 'col21' },
    { fieldName: 'col22' },
    { fieldName: 'col23' },
    { fieldName: 'col24' },
    { fieldName: 'col25' },
    { fieldName: 'col26' },
    { fieldName: 'col27' },
    { fieldName: 'col28' },
    { fieldName: 'col29' },
    { fieldName: 'col30' },
    { fieldName: 'col31' },
    { fieldName: 'col32' },
    { fieldName: 'col33' },
    { fieldName: 'col34' },
    { fieldName: 'col35' },
    { fieldName: 'col36' },
    { fieldName: 'col37' },
    { fieldName: 'col38' },
    { fieldName: 'col39' },
    { fieldName: 'col40' },
    { fieldName: 'col41' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_BLG'), width: '98' },
    { fieldName: 'col2', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '98' },
    { fieldName: 'col3', header: t('MSG_TXT_EMPL_NM'), width: '98' },
    { fieldName: 'col4', header: t('MSG_TXT_SEL_TYPE'), width: '111.9', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_PDCT_TP'), width: '72', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_PRC_TP'), width: '110' },
    { fieldName: 'col7', header: t('MSG_TXT_CHDVC_TP'), width: '110' },
    { fieldName: 'col8', header: t('MSG_TXT_FEE') + t('MSG_TXT_PERF') + t('MSG_TXT_TYPE'), width: '110' },
    { fieldName: 'col9', header: t('MSG_TXT_CNTR_DTL_NO'), width: '110' },
    { fieldName: 'col10', header: t('MSG_TXT_CST_DV'), width: '188', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_PRDT_NM'), width: '226.5', styleName: 'text-' },
    { fieldName: 'col12', header: t('MSG_TXT_PRDT_CODE'), width: '83.5', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_PD_DC_CLASS'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col14', header: t('MSG_TXT_DISC_CODE'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col15', header: t('MSG_TXT_DSC_SYST'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col16', header: t('MSG_TXT_COMBI_DV'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col17', header: t('MSG_TXT_ISTM'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col18', header: t('MSG_TXT_STPL_MCNT'), width: '84', styleName: 'text-right' },
    { fieldName: 'col19', header: t('MSG_TXT_MNGT_PRD'), width: '84', styleName: 'text-right' },
    { fieldName: 'col20', header: t('MSG_TXT_PD_ACC_RSLT'), width: '142', styleName: 'text-right' },
    { fieldName: 'col21', header: t('MSG_TXT_BASE_PRC'), width: '123.8', styleName: 'text-right' },
    { fieldName: 'col22', header: t('MSG_TXT_HOME_CARE'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col23', header: t('MSG_TXT_HCR_MSH_Y3'), width: '141.2', styleName: 'text-' },
    { fieldName: 'col24', header: t('MSG_TXT_FXAM_YN'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col25', header: t('MSG_TXT_FNN_LEASE'), width: '83.5', styleName: 'text-' },
    { fieldName: 'col26', header: t('MSG_TXT_PD_ACC_CNT'), width: '83.5', styleName: 'text-right' },
    { fieldName: 'col27', header: t('MSG_TXT_RECOMMITMENT'), width: '113.2', styleName: 'text-' },
    { fieldName: 'col28', header: t('MSG_TXT_CNTR_DATE'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'col29', header: t('MSG_TXT_SL_DT'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'col30', header: t('MSG_TXT_CANC_DT'), width: '113.2', styleName: 'text-center' },
    { fieldName: 'col31', header: t('MSG_TXT_BRMGR'), width: '113', styleName: 'text-center' },
    { fieldName: 'col32', header: t('MSG_TXT_BRMGR'), width: '100', styleName: 'text-' },
    { fieldName: 'col33', header: t('MSG_TXT_RTLFE'), width: '104.3', styleName: 'text-right' },
    { fieldName: 'col34', header: t('MSG_TXT_PMOT_NO'), width: '104.3', styleName: 'text-right' },
    { fieldName: 'col35', header: t('MSG_TXT_PKG_SN'), width: '135.1', styleName: 'text-' },
    { fieldName: 'col36', header: t('MSG_TXT_MCHN') + t('MSG_TXT_CST_CD'), width: '113' },
    { fieldName: 'col37', header: t('MSG_TXT_MCHN') + t('MSG_TXT_PRDT_CODE'), width: '113' },
    { fieldName: 'col38', header: t('MSG_TXT_MCHN') + t('MSG_TXT_PRDT_CODE'), width: '113' },
    { fieldName: 'col39', header: t('MSG_TXT_MCHN') + t('MSG_TXT_PRDT_CODE'), width: '113' },
    { fieldName: 'col40', header: t('MSG_TXT_MCHN') + t('MSG_TXT_PRDT_CODE'), width: '113' },
    { fieldName: 'col41', header: t('MSG_TXT_MCHN') + t('MSG_TXT_PRDT_CODE'), width: '113' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
    { fieldName: 'col15' },
    { fieldName: 'col16' },
    { fieldName: 'col17' },
    { fieldName: 'col18' },
    { fieldName: 'col19' },
    { fieldName: 'col20' },
    { fieldName: 'col21' },

  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_BLG'), width: '120', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '120', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_EMPL_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_CRLV'), width: '120', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_ELHM'), width: '120', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '120', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_ETC'), width: '120', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_PRDT_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_AGG'), width: '120', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_ELHM'), width: '120', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '120', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_ETC'), width: '120', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_PRDT_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_AGG'), width: '120', styleName: 'text-center' },
    { fieldName: 'col15', header: t('MSG_TXT_PD_ACC_CNT'), width: '120', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_RENTAL') + t('MSG_TXT_PD_STD_FEE'), width: '120', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_SNGL_PMNT') + t('MSG_TXT_PD_STD_FEE'), width: '120', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_CHNG') + t('MSG_TXT_COUNT'), width: '120', styleName: 'text-center' },
    { fieldName: 'col19', header: t('MSG_TXT_FXAM') + t('MSG_TXT_COUNT'), width: '120', styleName: 'text-center' },
    { fieldName: 'col20', header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'), width: '120', styleName: 'text-center' },
    { fieldName: 'col21', header: t('MSG_TXT_HCR_MSH') + t('MSG_TXT_COUNT'), width: '120', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'col1', 'col2', 'col3', 'col4',
    {
      header: t('MSG_TXT_FEE') + t('MSG_TXT_PERF_CT'),
      direction: 'horizontal',
      items: ['col5', 'col6', 'col7', 'col8', 'col9'],
    },
    {
      header: t('MSG_TXT_PD_ACC_RSLT'),
      direction: 'horizontal',
      items: ['col10', 'col11', 'col12', 'col13', 'col14'],
    },
    {
      header: t('MSG_TXT_ELHM'),
      direction: 'horizontal',
      items: ['col15', 'col16', 'col17', 'col18'],
    },
    {
      header: t('MSG_TXT_ETC'),
      direction: 'horizontal',
      items: ['col19', 'col20', 'col21'],
    },
  ]);
});

</script>
