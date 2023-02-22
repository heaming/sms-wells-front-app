<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebOgFeeHomeMasterListM - 홈마스터 수수료 생성관리
3. 작성자 : gs.piit150
4. 작성일 : 2023.02.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 홈마스터 수수료 생성관리 목록 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="2"
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
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RSB_DV')"
          required
        >
          <kw-option-group
            v-model="searchParams.rsbDv"
            :label="$t('MSG_TXT_RSB_DV')"
            type="radio"
            :options="['홈마스터', '지점장']"
            rules="required"
            @change="onChangedRsbDv"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
        >
          <kw-select
            v-model="searchParams.ogLevl1"
            :options="['총괄단', 'B', 'C', 'D']"
          />
          <kw-select
            v-model="searchParams.ogLevl2"
            :options="['전체', 'B', 'C', 'D']"
          />
          <kw-select
            v-model="searchParams.ogLevl3"
            :options="['지점', 'B', 'C', 'D']"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.no"
            icon="search"
            clearable
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <h3>{{ searchParams.statTitle }}</h3>
        </template>
      </kw-action-top>
      <kw-stepper
        v-model="stepInitNum"
        alternative-labels
      >
        <kw-step
          :name="1"
          :title="t('MSG_TXT_FEE')+ t('MSG_TXT_CRT')"
          :done="stepInitNum > 1"
          prefix="1"
          @click="openFeeCrtPopup"
        />
        <kw-step
          :name="2"
          :title="t('MSG_TXT_ETC')+ t('MSG_TXT_UPLOAD')"
          :done="stepInitNum > 2"
          prefix="2"
        />
        <kw-step
          :name="3"
          :title="t('MSG_TXT_TAX')+t('MSG_TXT_DDTN')"
          :done="stepInitNum > 3"
          prefix="3"
          @click="openTaxDdtnPopup"
        />
        <kw-step
          :name="4"
          :title="t('MSG_TXT_WHTX')+t('MSG_TXT_RGS')"
          :done="stepInitNum > 4"
          prefix="4"
          :done-icon="'retry'"
          @click="openWhTxRgstPopup"
        />
        <kw-step
          :name="5"
          :title="t('MSG_TXT_HIR_INSR')+t('MSG_TXT_DDTN')"
          :done="stepInitNum > 5"
          prefix="5"
          :active-icon="'write'"
          :tooltip="'클릭하여 고용보험 공제를 진행하세요.'"
          @click="openEinsrDdtnPopup"
        />
        <kw-step
          :name="
            6"
          :title="t('MSG_TXT_PNPYAM')+t('MSG_TXT_DDTN')"
          :done="stepInitNum > 6"
          prefix="6"
          @click="openPnpyamDdtnPopup"
        />
        <kw-step
          :name="7"
          :title="t('MSG_TXT_BU')+t('MSG_TXT_DDTN')"
          :done="stepInitNum > 7"
          prefix="7"
          @click="openBuDdtnPopup"
        />
        <kw-step
          :name="8"
          :title="t('MSG_TXT_RDS')+t('MSG_TXT_RV')"
          :done="stepInitNum > 8"
          prefix="8"
          @click="openGurDepAmtPopup"
        />
        <kw-step
          :name="9"
          :title="t('MSG_TXT_FNT')+t('MSG_TXT_MTR')+t('MSG_TXT_CRT')"
          :done="stepInitNum > 9"
          prefix="9"
          @click="openFntMtrCrtPopup"
        />
        <kw-step
          :name="10"
          :title="t('MSG_TXT_CNST_WRTE')"
          :done="stepInitNum > 10"
          prefix="10"
        />
        <kw-step
          :name="11"
          :title="t('MSG_TIT_SLIP_CRT')"
          :done="stepInitNum > 11"
          prefix="11"
        />
        <kw-step
          :name="12"
          :title="t('MSG_TIT_PIA_SELL_FEE_CNFM')"
          :done="stepInitNum > 12"
          prefix="12"
          @click="openPiaSellFeeCnfmPopup"
        />
        <kw-step-panel :name="5">
          <kw-action-top class="mt40">
            <template #left>
              <kw-paging-info
                :total-count="totalCount"
              />
              <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
            </template>
            <kw-btn
              icon="download_on"
              dense
              secondary
              :label="$t('MSG_BTN_EXCEL_DOWN')"
              :disable="totalCount.value === 0"
              @click="onClickExcelDownload"
            />
            <kw-btn
              dense
              secondary=""
              :label="$t('MSG_BTN_HIS_MGT')"
              @click="openHistMngtPopup"
            />
          </kw-action-top>
          <kw-grid
            v-if="isGrid1Visile"
            ref="grdMainRef"
            name="grd1Main"
            :visible-rows="10"
            @init="initGrd1Main"
          />
          <kw-grid
            v-if="isGrid2Visile"
            ref="grdMainRef"
            name="grd2Main"
            :visible-rows="10"
            @init="initGrd2Main"
          />
        </kw-step-panel>
      </kw-stepper>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';

import { useDataService, getComponentType, gridUtil, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();
const stepInitNum = ref(5);
const { modal } = useGlobal();
const isGrid1Visile = ref(true);
const isGrid2Visile = ref(false);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const searchParams = ref({

  perfYm: now.format('YYYYMM'),
  rsbDv: '',
  ogLevl1: '',
  ogLevl2: '',
  ogLevl3: '',
  no: '',
  statTitle: t('MSG_TXT_PRGS_STE'),

});
let cachedParams;

/*
 *  Event - 직책유형 선택 시 하단 그리드 변경※
 */
async function onChangedRsbDv() {
  if (searchParams.value.rsbDv === '홈마스터') {
    isGrid1Visile.value = true;
    isGrid2Visile.value = false;
  } else {
    isGrid1Visile.value = false;
    isGrid2Visile.value = true;
  }
}

/*
 *  Event - 수수료생성 프로세스 클릭 (W-CO-U-0073P02 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openFeeCrtPopup() {
  const param = {
    ogTp: 'H',
  };
  await modal({
    component: 'WCOU0073P02',
    componentProps: param,
  });
}

/*
 *  Event - 세금공제 프로세스 클릭 (Z-CO-U-0034P02 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openTaxDdtnPopup() {
  const param = {
    ogTp: 'H',
  };
  await modal({
    component: 'ZCOU0034P02',
    componentProps: param,
  });
}

/*
 *  Event - 원천세 등록 프로세스 클릭 (Z-CO-U-0034P03 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openWhTxRgstPopup() {
  const param = {
    ogTp: 'H',
  };
  await modal({
    component: 'ZCOU0034P03',
    componentProps: param,
  });
}

/*
 *  Event - 고용보험 공제 프로세스 클릭 (Z-CO-U-0034P04 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openEinsrDdtnPopup() {
  const param = {
    ogTp: 'H',
  };
  await modal({
    component: 'ZCOU0034P04',
    componentProps: param,
  });
}

/*
 *  Event - 가지급금 공제 프로세스 클릭 (Z-CO-U-0034P05 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openPnpyamDdtnPopup() {
  const param = {
    ogTp: 'H',
  };
  await modal({
    component: 'ZCOU0034P05',
    componentProps: param,
  });
}

/*
 *  Event - 부담공제 프로세스 클릭 (Z-CO-U-0034P06 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openBuDdtnPopup() {
  const param = {
    ogTp: 'H',
  };
  await modal({
    component: 'ZCOU0034P06',
    componentProps: param,
  });
}

/*
 *  Event - 보증예치금 적립 프로세스 클릭 (Z-CO-U-0034P07 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openGurDepAmtPopup() {
  const param = {
    ogTp: 'H',
  };
  await modal({
    component: 'ZCOU0034P07',
    componentProps: param,
  });
}

/*
 *  Event - 이체자료생성 프로세스 클릭 (Z-CO-U-0034P08 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openFntMtrCrtPopup() {
  const param = {
    ogTp: 'H',
  };
  await modal({
    component: 'ZCOU0034P08',
    componentProps: param,
  });
}

/*
 *  Event - 선판매 수수료 확정 프로세스 클릭 (W-CO-U-0047P04 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openPiaSellFeeCnfmPopup() {
  const param = {
    ogTp: 'H',
  };
  await modal({
    component: 'WCOU0047P04',
    componentProps: param,
  });
}

/*
 *  Event - 이력 관리 버튼 클릭 (Z-CO-U-0034P09 호출) ※아직 팝업 페이지 생성이 안됨※
 */
async function openHistMngtPopup() {
  const param = {
    ogTp: 'H',
  };
  await modal({
    component: 'ZCOU0034P09',
    componentProps: param,
  });
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: t('MSG_TXT_HMST') + t('MSG_TXT_FEE') + t('MSG_TXT_CRT') + t('MSG_TXT_MGT') + t('MSG_TXT_IZ'),
    timePostfix: true,
  });
}

async function setTitle() {
  const { perfYm } = searchParams.value;
  const { rsbDv } = searchParams.value;
  const title = `${perfYm.substring(0, 4)}년 ${perfYm.substring(4, 6)}월 ${rsbDv} `;
  searchParams.value.statTitle = title + t('MSG_TXT_PRGS_STE');
}

async function fetchData() {
  let uri = '';

  if (isGrid2Visile.value === true) {
    uri = '-brmgr';
  }
  const response = await dataService.get(`/sms/wells/fee/organization-fees/hmsts${uri}`, { params: cachedParams });
  const hmstFees = response.data;
  totalCount.value = hmstFees.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(hmstFees);
  view.resetCurrent();
  await setTitle();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrd1Main(data, view) {
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
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_RGNL_GRP'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_BRANCH'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '119.9', styleName: 'text-left' },
    { fieldName: 'col4', header: t('MSG_TXT_EMPL_NM'), width: '119.9', styleName: 'text-left' },
    { fieldName: 'col5', header: t('MSG_TXT_RSB'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_BIZ_RGST_MM'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col7', header: t('MSG_TXT_NMN'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col8', header: t('MSG_TXT_GRCNT'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col9', header: t('MSG_TXT_NWCMR') + t('MSG_TXT_ENPSC') + t('MSG_TXT_EDUC'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_MTRRS'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col11', header: t('MSG_TXT_MTRRS') + t('MSG_TXT_EXCP'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col12', header: t('MSG_TXT_FXAM'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col13', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col14', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col15', header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_PKG'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col16', header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_MEMBERSHIP'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col17', header: `${t('MSG_TXT_CHNG')}(1)${t('MSG_TXT_COUNT')}`, width: '158.4', styleName: 'text-right' },
    { fieldName: 'col18', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col19', header: t('MSG_TXT_ASGN') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col20', header: t('MSG_TXT_CANCEL') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col21', header: t('MSG_TXT_REAL') + t('MSG_TXT_ASGN') + t('MSG_TXT_CNT'), width: '207.4', styleName: 'text-right' },
    { fieldName: 'col22', header: `${t('MSG_TXT_WASHER')}/${t('MSG_TXT_ARCN')}/${t('MSG_TXT_DRYER')}${t('MSG_TXT_COUNT')}`, width: '207.4', styleName: 'text-right' },
    { fieldName: 'col23', header: t('MSG_TXT_ELHM') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col24', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_SERVICE') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col25', header: t('MSG_TXT_PROCS_RT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col26', header: t('MSG_TXT_PRPN'), width: '286', styleName: 'text-right' },
    { fieldName: 'col27', header: t('MSG_TXT_ENRG'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col28', header: t('MSG_TXT_SNGL_PMNT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col29', header: t('MSG_TXT_CHNG'), width: '122.8', styleName: 'text-right' },
    { fieldName: 'col30', header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_MEMBERSHIP'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col31', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_SCENE'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col32', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_ACTI'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col33', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_ACML'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col34', header: t('MSG_TXT_EDUC'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col35', header: t('MSG_TXT_RGLVL'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col36', header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col37', header: t('MSG_TXT_ADSB'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col38', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col39', header: t('MSG_TXT_DDTN_SUM'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'col40', header: t('MSG_TXT_ACL_DSB_AMT'), width: '124.7', styleName: 'text-right' },
  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    {
      header: t('MSG_TXT_PRVCY'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col1', 'col2', 'col3', 'col4', 'col5', 'col6', 'col7', 'col8'],
    },
    'col9',
    {
      header: t('MSG_TXT_RTLFE'),
      direction: 'horizontal',
      items: ['col10', 'col11', 'col12'],
    },
    {
      header: t('MSG_TXT_SNGL_PMNT') + t('TXT_MSG_SELL_PRC'),
      direction: 'horizontal',
      items: ['col13', 'col14'],
    },
    {
      header: t('MSG_TXT_HOME_CARE'),
      direction: 'horizontal',
      items: ['col15', 'col16'],
    },
    'col17', 'col18',
    {
      header: t('MSG_TXT_SERVICE'),
      direction: 'horizontal',
      items: ['col19', 'col20', 'col21', 'col22', 'col23', 'col24', 'col25'],
    },
    {
      header: t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['col26', 'col27', 'col28', 'col29', 'col30', 'col31', 'col32', 'col33', 'col34', 'col35', 'col36', 'col37'],
    },
    'col38', 'col39', 'col40',
  ]);
}

function initGrd2Main(data, view) {
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
    { fieldName: 'col42' },
    { fieldName: 'col43' },
    { fieldName: 'col44' },
    { fieldName: 'col45' },
    { fieldName: 'col46' },
    { fieldName: 'col47' },
    { fieldName: 'col48' },
    { fieldName: 'col49' },
    { fieldName: 'col50' },
    { fieldName: 'col51' },
    { fieldName: 'col52' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_RGNL_GRP'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_BRANCH'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '119.9', styleName: 'text-left' },
    { fieldName: 'col4', header: t('MSG_TXT_EMPL_NM'), width: '119.9', styleName: 'text-left' },
    { fieldName: 'col5', header: t('MSG_TXT_RSB'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_BIZ_RGST_MM'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col7', header: t('MSG_TXT_NMN'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col8', header: t('MSG_TXT_GRCNT'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col9', header: t('MSG_TXT_ASET') + t('MSG_TXT_EDUC'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_ACPN') + t('MSG_TXT_EDUC'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col11', header: t('MSG_TXT_ASET') + t('MSG_TXT_EDUC'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col12', header: t('MSG_TXT_ACPN') + t('MSG_TXT_EDUC'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col13', header: t('MSG_TXT_MTRRS'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col14', header: t('MSG_TXT_MTRRS') + t('MSG_TXT_EXCP'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col15', header: t('MSG_TXT_FXAM'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col16', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col17', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col18', header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_PKG'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col19', header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_MEMBERSHIP'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col20', header: `${t('MSG_TXT_CHNG')}(1)${t('MSG_TXT_COUNT')}`, width: '119.9', styleName: 'text-right' },
    { fieldName: 'col21', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col22', header: t('MSG_TXT_ASGN') + t('MSG_TXT_COUNT'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col23', header: t('MSG_TXT_CANCEL') + t('MSG_TXT_COUNT'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col24', header: t('MSG_TXT_REAL') + t('MSG_TXT_ASGN') + t('MSG_TXT_CNT'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col25', header: `${t('MSG_TXT_WASHER')}/${t('MSG_TXT_ARCN')}/${t('MSG_TXT_DRYER')}${t('MSG_TXT_COUNT')}`, width: '207.4', styleName: 'text-right' },
    { fieldName: 'col26', header: t('MSG_TXT_ELHM') + t('MSG_TXT_COUNT'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col27', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_SERVICE') + t('MSG_TXT_COUNT'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col28', header: t('MSG_TXT_PROCS_RT'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col29', header: t('MSG_TXT_PRPN'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col30', header: t('MSG_TXT_ENRG'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col31', header: t('MSG_TXT_SNGL_PMNT'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col32', header: t('MSG_TXT_CHNG'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col33', header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_MEMBERSHIP'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col34', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_SCENE'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col35', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_ACTI'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col36', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_ACML'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col37', header: t('MSG_TXT_EDUC'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col38', header: t('MSG_TXT_RGLVL'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col39', header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col40', header: t('MSG_TXT_ADSB'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col41', header: t('MSG_TXT_ACL_ACTI_PPL'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col42', header: t('MSG_TXT_PD_ACC_CNT'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col43', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_COUNT'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col44', header: t('MSG_TXT_RENTAL'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col45', header: `${t('MSG_TXT_SNGL_PMNT')}/${t('MSG_TXT_ISTM')}`, width: '119.9', styleName: 'text-right' },
    { fieldName: 'col46', header: t('MSG_TXT_SELL') + t('MSG_TXT_CONN'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col47', header: t('MSG_TXT_OG') + t('MSG_TXT_MGT'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col48', header: t('MSG_TXT_NEW') + t('MSG_TXT_SELL'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col49', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_CONN'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col50', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col51', header: t('MSG_TXT_DDTN_SUM'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'col52', header: t('MSG_TXT_ACL_DSB_AMT'), width: '119.9', styleName: 'text-right' },
  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    {
      header: t('MSG_TXT_PRVCY'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col1', 'col2', 'col3', 'col4', 'col5', 'col6', 'col7', 'col8'],
    },
    {
      header: t('MSG_TXT_EDUC') + t('MSG_TXT_PTCP_DC'),
      direction: 'horizontal',
      items: ['col9', 'col10'],
    },
    {
      header: t('MSG_TXT_EDUC') + t('MSG_TXT_CPC_DC'),
      direction: 'horizontal',
      items: ['col11', 'col12'],
    },
    {
      header: t('MSG_TXT_RTLFE'),
      direction: 'horizontal',
      items: ['col13', 'col14', 'col15'],
    },
    {
      header: t('MSG_TXT_SNGL_PMNT') + t('TXT_MSG_SELL_PRC'),
      direction: 'horizontal',
      items: ['col16', 'col17'],
    },
    {
      header: t('MSG_TXT_HOME_CARE'),
      direction: 'horizontal',
      items: ['col18', 'col19'],
    },
    'col20', 'col21',
    {
      header: t('MSG_TXT_SERVICE'),
      direction: 'horizontal',
      items: ['col22', 'col23', 'col24', 'col25', 'col26', 'col27', 'col28'],
    },
    {
      header: t('MSG_TXT_INDV') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['col29', 'col30', 'col31', 'col32', 'col33', 'col34', 'col35', 'col36', 'col37', 'col38', 'col39', 'col40'],
    },
    {
      header: t('MSG_TXT_BRANCH') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['col41', 'col42', 'col43', 'col44', 'col45', 'col46', 'col47', 'col48', 'col49'],
    },
    'col50', 'col51', 'col52',
  ]);
}

</script>

<style>

</style>
