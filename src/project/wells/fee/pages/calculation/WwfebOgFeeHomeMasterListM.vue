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
        <kw-search-item :label="t('MSG_TXT_OG_LEVL')">
          <zwog-level-select
            v-model:og-levl-dv-cd2="searchParams.ogLevl2"
            v-model:og-levl-dv-cd3="searchParams.ogLevl3"
            :og-tp-cd="searchParams.ogTp"
            :base-ym="searchParams.perfYm"
            :start-level="2"
            :end-level="3"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.no"
            icon="search"
            clearable
            :on-click-icon="onClickSearchNo"
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
      </kw-stepper>
      <kw-action-top class="mt40">
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">({{ $t('MSG_TXT_UNIT_COLON_WON') }})</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
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
          dense
          secondary=""
          :label="$t('MSG_BTN_HIS_MGT')"
          @click="openHistMngtPopup"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_PREV_STEP')"
          class="ml8"
          primary
          @click="onClickPrevStep"
        />
        <kw-btn
          :label="$t('MSG_BTN_NEXT_STEP')"
          class="ml8"
          primary
          @click="onClickNextStep"
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
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';

import { useDataService, getComponentType, gridUtil, useGlobal, defineGrid } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';

const { t } = useI18n();
const dataService = useDataService();
const stepInitNum = ref(5);
const { modal } = useGlobal();
const isGrid1Visile = ref(true);
const isGrid2Visile = ref(false);
const currentRoute = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const searchParams = ref({

  perfYm: now.format('YYYYMM'),
  rsbDv: '홈마스터',
  ogLevl2: '',
  ogLevl3: '',
  no: '',
  ogTp: 'W03',
  statTitle: t('MSG_TXT_PRGS_STE'),

});

const info = ref({
  nowStep: '',
});

let cachedParams;

// 번호 검색 아이콘 클릭 이벤트
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.no,
      ogTpCd: 'W03',
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.no = payload.prtnrNo;
    }
  }
}

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
  stepInitNum.value = 1;
  totalCount.value = 0;
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
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

async function onClickNextStep() {
  const nowStep = stepInitNum.value;
  if (nowStep < 13 && totalCount.value > 0) {
  /* if (nowStep === 13) {
    // 선판매 수수료 확정 프로세스 클릭 (W-CO-U-0047P04 호출) ※아직 팝업 페이지 생성이 안됨
    // alert('13 Step WCOU0047P04');
    const param = {
      ogTp: 'W03',
    };
    await modal({
      component: 'WCOU0047P04',
      componentProps: param,
    });
  }
  */
    stepInitNum.value = nowStep + 1;
  }
}

async function onClickPrevStep() {
  const nowStep = stepInitNum.value;
  if (nowStep > 1 && totalCount.value > 0) {
    stepInitNum.value = nowStep - 1;
  }
}

async function setTitle() {
  const { perfYm } = searchParams.value;
  const { rsbDv } = searchParams.value;
  const title = `${perfYm.substring(0, 4) + t('MSG_TXT_YEAR')} ${perfYm.substring(4, 6)}${t('MSG_TXT_MON')} ${rsbDv} ${t('MSG_TXT_PRGS_STE')}`;
  searchParams.value.statTitle = title;
  const response1 = await dataService.get('/sms/wells/fee/organization-fees/plars-step', { params: cachedParams });
  const resData = response1.data;
  info.value = resData;
  stepInitNum.value = Number(info.value.nowStep);
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
const initGrd1Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dgr1LevlOgNm' },
    { fieldName: 'dgr2LevlOgNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'rsbDvCd' },
    { fieldName: 'akdsym' },
    { fieldName: 'akdcha' },
    { fieldName: 'prtnrGdCd' },
    { fieldName: 'edu100' },
    { fieldName: 'akcda10' },
    { fieldName: 'akcda12' },
    { fieldName: 'akcda14' },
    { fieldName: 'akcda13' },
    { fieldName: 'akcda15' },
    { fieldName: 'akcda11' },
    { fieldName: 'akcda19' },
    { fieldName: 'dedeq3' },
    { fieldName: 'akdeq0' },
    { fieldName: 'lccnt1' },
    { fieldName: 'cLccnt1' },
    { fieldName: 'rLccnt1' },
    { fieldName: 'gdSercnt' },
    { fieldName: 'elecnt' },
    { fieldName: 'sercnt' },
    { fieldName: 'serryl' },
    { fieldName: 'aksd01' },
    { fieldName: 'aksd03' },
    { fieldName: 'aksd04' },
    { fieldName: 'aksd15' },
    { fieldName: 'aksd05' },
    { fieldName: 'aksd06' },
    { fieldName: 'aksd07' },
    { fieldName: 'aksd09' },
    { fieldName: 'aksd10' },
    { fieldName: 'aksd11' },
    { fieldName: 'aksd13' },
    { fieldName: 'aksd14' },
    { fieldName: 'intbsSum' },
    { fieldName: 'ddtnSum' },
    { fieldName: 'aclDdbAmt' },

  ];

  const columns = [
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_BRANCH'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '119.9', styleName: 'text-left' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '119.9', styleName: 'text-left' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'akdsym', header: t('MSG_TXT_BIZ_RGST_MM'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'akdcha', header: t('MSG_TXT_NMN'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'prtnrGdCd', header: t('MSG_TXT_GRCNT'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'edu100', header: t('MSG_TXT_NWCMR') + t('MSG_TXT_ENPSC') + t('MSG_TXT_EDUC'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'akcda10', header: t('MSG_TXT_MTRRS'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'akcda12', header: t('MSG_TXT_MTRRS') + t('MSG_TXT_EXCP'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'akcda14', header: t('MSG_TXT_FXAM'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'akcda13', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'akcda15', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'akcda11', header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_PKG'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'akcda19', header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_MEMBERSHIP'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'dedeq3', header: `${t('MSG_TXT_CHNG')}(1)${t('MSG_TXT_COUNT')}`, width: '158.4', styleName: 'text-right' },
    { fieldName: 'akdeq0', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'lccnt1', header: t('MSG_TXT_ASGN') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'cLccnt1', header: t('MSG_TXT_CANCEL') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'rLccnt1', header: t('MSG_TXT_REAL') + t('MSG_TXT_ASGN') + t('MSG_TXT_CNT'), width: '207.4', styleName: 'text-right' },
    { fieldName: 'gdSercnt', header: `${t('MSG_TXT_WASHER')}/${t('MSG_TXT_ARCN')}/${t('MSG_TXT_DRYER')}${t('MSG_TXT_COUNT')}`, width: '207.4', styleName: 'text-right' },
    { fieldName: 'elecnt', header: t('MSG_TXT_ELHM') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'sercnt', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_SERVICE') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'serryl', header: t('MSG_TXT_PROCS_RT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd01', header: t('MSG_TXT_PRPN'), width: '286', styleName: 'text-right' },
    { fieldName: 'aksd03', header: t('MSG_TXT_ENRG'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd04', header: t('MSG_TXT_SNGL_PMNT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd15', header: t('MSG_TXT_CHNG'), width: '122.8', styleName: 'text-right' },
    { fieldName: 'aksd05', header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_MEMBERSHIP'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd06', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_SCENE'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd07', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_ACTI'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd09', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_ACML'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd10', header: t('MSG_TXT_EDUC'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd11', header: t('MSG_TXT_RGLVL'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd13', header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd14', header: t('MSG_TXT_ADSB'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'intbsSum', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'ddtnSum', header: t('MSG_TXT_DDTN_SUM'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aclDdbAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '124.7', styleName: 'text-right' },
  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    {
      header: t('MSG_TXT_PRVCY'), // colspan title
      direction: 'horizontal', // merge type
      items: ['dgr1LevlOgNm', 'dgr2LevlOgNm', 'prtnrNo', 'prtnrKnm', 'rsbDvCd', 'akdsym', 'akdcha', 'prtnrGdCd'],
    },
    'edu100',
    {
      header: t('MSG_TXT_RTLFE'),
      direction: 'horizontal',
      items: ['akcda10', 'akcda12', 'akcda14'],
    },
    {
      header: t('MSG_TXT_SNGL_PMNT') + t('TXT_MSG_SELL_PRC'),
      direction: 'horizontal',
      items: ['akcda13', 'akcda15'],
    },
    {
      header: t('MSG_TXT_HOME_CARE'),
      direction: 'horizontal',
      items: ['akcda11', 'akcda19'],
    },
    'dedeq3', 'akdeq0',
    {
      header: t('MSG_TXT_SERVICE'),
      direction: 'horizontal',
      items: ['lccnt1', 'cLccnt1', 'rLccnt1', 'gdSercnt', 'elecnt', 'sercnt', 'serryl'],
    },
    {
      header: t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['aksd01', 'aksd03', 'aksd04', 'aksd15', 'aksd05', 'aksd06', 'aksd07', 'aksd09', 'aksd10', 'aksd11', 'aksd13', 'aksd14'],
    },
    'intbsSum', 'ddtnSum', 'aclDdbAmt',

  ]);
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dgr1LevlOgNm' },
    { fieldName: 'dgr2LevlOgNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'rsbDvCd' },
    { fieldName: 'akdsym' },
    { fieldName: 'akdcha' },
    { fieldName: 'prtnrGdCd' },
    { fieldName: 'atcnt1' },
    { fieldName: 'atcnt2' },
    { fieldName: 'is124edu' },
    { fieldName: 'is125edu' },
    { fieldName: 'akcda10' },
    { fieldName: 'akcda12' },
    { fieldName: 'akcda14' },
    { fieldName: 'akcda13' },
    { fieldName: 'akcda15' },
    { fieldName: 'akcda11' },
    { fieldName: 'akcda19' },
    { fieldName: 'dedeq3' },
    { fieldName: 'akdeq0' },
    { fieldName: 'lccnt1' },
    { fieldName: 'cLccnt1' },
    { fieldName: 'rLccnt1' },
    { fieldName: 'gdSercnt' },
    { fieldName: 'elecnt' },
    { fieldName: 'sercnt' },
    { fieldName: 'serryl' },
    { fieldName: 'aksd01' },
    { fieldName: 'aksd03' },
    { fieldName: 'aksd04' },
    { fieldName: 'aksd15' },
    { fieldName: 'aksd05' },
    { fieldName: 'aksd06' },
    { fieldName: 'aksd07' },
    { fieldName: 'aksd09' },
    { fieldName: 'aksd10' },
    { fieldName: 'aksd11' },
    { fieldName: 'aksd13' },
    { fieldName: 'aksd14' },
    { fieldName: 'gadcnt' },
    { fieldName: 'jAkdeq0' },
    { fieldName: 'jSercnt' },
    { fieldName: 'aksd51' },
    { fieldName: 'aksd52' },
    { fieldName: 'aksd53' },
    { fieldName: 'aksd54' },
    { fieldName: 'aksd55' },
    { fieldName: 'aksd56' },
    { fieldName: 'intbsSum' },
    { fieldName: 'ddtnSum' },
    { fieldName: 'aclDdbAmt' },
  ];

  const columns = [
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_BRANCH'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '119.9', styleName: 'text-left' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '119.9', styleName: 'text-left' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'akdsym', header: t('MSG_TXT_BIZ_RGST_MM'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'akdcha', header: t('MSG_TXT_NMN'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'prtnrGdCd', header: t('MSG_TXT_GRCNT'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'atcnt1', header: t('MSG_TXT_ASET') + t('MSG_TXT_EDUC'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'atcnt2', header: t('MSG_TXT_ACPN') + t('MSG_TXT_EDUC'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'is124edu', header: t('MSG_TXT_ASET') + t('MSG_TXT_EDUC'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'is125edu', header: t('MSG_TXT_ACPN') + t('MSG_TXT_EDUC'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'akcda10', header: t('MSG_TXT_MTRRS'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'akcda12', header: t('MSG_TXT_MTRRS') + t('MSG_TXT_EXCP'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'akcda14', header: t('MSG_TXT_FXAM'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'akcda13', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'akcda15', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'akcda11', header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_PKG'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'akcda19', header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_MEMBERSHIP'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'dedeq3', header: `${t('MSG_TXT_CHNG')}(1)${t('MSG_TXT_COUNT')}`, width: '158.4', styleName: 'text-right' },
    { fieldName: 'akdeq0', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'lccnt1', header: t('MSG_TXT_ASGN') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'cLccnt1', header: t('MSG_TXT_CANCEL') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'rLccnt1', header: t('MSG_TXT_REAL') + t('MSG_TXT_ASGN') + t('MSG_TXT_CNT'), width: '207.4', styleName: 'text-right' },
    { fieldName: 'gdSercnt', header: `${t('MSG_TXT_WASHER')}/${t('MSG_TXT_ARCN')}/${t('MSG_TXT_DRYER')}${t('MSG_TXT_COUNT')}`, width: '207.4', styleName: 'text-right' },
    { fieldName: 'elecnt', header: t('MSG_TXT_ELHM') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'sercnt', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_SERVICE') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'serryl', header: t('MSG_TXT_PROCS_RT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd01', header: t('MSG_TXT_PRPN'), width: '286', styleName: 'text-right' },
    { fieldName: 'aksd03', header: t('MSG_TXT_ENRG'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd04', header: t('MSG_TXT_SNGL_PMNT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd15', header: t('MSG_TXT_CHNG'), width: '122.8', styleName: 'text-right' },
    { fieldName: 'aksd05', header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_MEMBERSHIP'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd06', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_SCENE'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd07', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_ACTI'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd09', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_ACML'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd10', header: t('MSG_TXT_EDUC'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd11', header: t('MSG_TXT_RGLVL'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd13', header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'aksd14', header: t('MSG_TXT_ADSB'), width: '158.4', styleName: 'text-right' },
    { fieldName: 'gadcnt', header: t('MSG_TXT_ACL_ACTI_PPL'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'jAkdeq0', header: t('MSG_TXT_PD_ACC_CNT'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'jSercnt', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_COUNT'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'aksd51', header: t('MSG_TXT_RENTAL'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'aksd52', header: `${t('MSG_TXT_SNGL_PMNT')}/${t('MSG_TXT_ISTM')}`, width: '119.9', styleName: 'text-right' },
    { fieldName: 'aksd53', header: t('MSG_TXT_SELL') + t('MSG_TXT_CONN'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'aksd54', header: t('MSG_TXT_OG') + t('MSG_TXT_MGT'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'aksd55', header: t('MSG_TXT_NEW') + t('MSG_TXT_SELL'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'aksd56', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_CONN'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'intbsSum', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'ddtnSum', header: t('MSG_TXT_DDTN_SUM'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'aclDdbAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '119.9', styleName: 'text-right' },
  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    {
      header: t('MSG_TXT_PRVCY'), // colspan title
      direction: 'horizontal', // merge type
      items: ['dgr1LevlOgNm', 'dgr2LevlOgNm', 'prtnrNo', 'prtnrKnm', 'rsbDvCd', 'akdsym', 'akdcha', 'prtnrGdCd'],
    },
    {
      header: t('MSG_TXT_EDUC') + t('MSG_TXT_PTCP_DC'),
      direction: 'horizontal',
      items: ['atcnt1', 'atcnt2'],
    },
    {
      header: t('MSG_TXT_EDUC') + t('MSG_TXT_CPC_DC'),
      direction: 'horizontal',
      items: ['is124edu', 'is125edu'],
    },
    {
      header: t('MSG_TXT_RTLFE'),
      direction: 'horizontal',
      items: ['akcda10', 'akcda12', 'akcda14'],
    },
    {
      header: t('MSG_TXT_SNGL_PMNT') + t('TXT_MSG_SELL_PRC'),
      direction: 'horizontal',
      items: ['akcda13', 'akcda15'],
    },
    {
      header: t('MSG_TXT_HOME_CARE'),
      direction: 'horizontal',
      items: ['akcda11', 'akcda19'],
    },
    'dedeq3', 'akdeq0',

    {
      header: t('MSG_TXT_SERVICE'),
      direction: 'horizontal',
      items: ['lccnt1', 'cLccnt1', 'rLccnt1', 'gdSercnt', 'elecnt', 'sercnt', 'serryl'],
    },
    {
      header: t('MSG_TXT_INDV') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['aksd01', 'aksd03', 'aksd04', 'aksd15', 'aksd05', 'aksd06', 'aksd07', 'aksd09', 'aksd10', 'aksd11', 'aksd13', 'aksd14'],
    },
    {
      header: t('MSG_TXT_BRANCH') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['gadcnt', 'jAkdeq0', 'jSercnt', 'aksd51', 'aksd52', 'aksd53', 'aksd54', 'aksd55', 'aksd56'],
    },
    'intbsSum', 'ddtnSum', 'aclDdbAmt',
  ]);
});

</script>

<style>

</style>
