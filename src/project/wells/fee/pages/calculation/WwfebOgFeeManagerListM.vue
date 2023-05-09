<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebOgFeeManagerListM - M조직 수수료 생성관리
3. 작성자 : gs.piit150
4. 작성일 : 2023.02.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- M조직 수수료 생성관리 목록 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
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
            :max-date="maxDate"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RSB_TP')"
          required
        >
          <kw-option-group
            v-model="searchParams.rsbTp"
            :label="$t('MSG_TXT_RSB_TP')"
            type="radio"
            :options="['전체', '플래너', '지점장']"
            rules="required"
            @change="onChangedRsbTp"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.no"
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
            icon="search"
            clearable
            :on-click-icon="onClickSearchNo"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_OG_LEVL')">
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevl1"
            v-model:og-levl-dv-cd2="searchParams.ogLevl2"
            v-model:og-levl-dv-cd3="searchParams.ogLevl3"
            :og-tp-cd="searchParams.ogTp"
            :base-ym="searchParams.perfYm"
            :start-level="1"
            :end-level="3"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>{{ searchParams.statTitle }}</h3>
      <kw-stepper
        v-model="stepInitNum"
        heading-text
        alternative-labels
      >
        <kw-step
          :name="1"
          :title="t('MSG_TXT_METG')+ t('MSG_TXT_PRSC')+ t('MSG_TXT_AGRG')"
          :done="stepInitNum > 1"
          prefix="1"
        />
        <kw-step
          :name="2"
          :title="t('MSG_TXT_FEE')+ t('MSG_TXT_CRT')"
          :done="stepInitNum > 2"
          prefix="2"
        />
        <kw-step
          :name="3"
          :title="t('MSG_TXT_ETC')+ t('MSG_TXT_UPLOAD')"
          :done="stepInitNum > 3"
          prefix="3"
        />
        <kw-step
          :name="4"
          :title="t('MSG_TXT_TAX')+t('MSG_TXT_DDTN')"
          :done="stepInitNum > 4"
          prefix="4"
        />
        <kw-step
          :name="5"
          :title="t('MSG_TXT_WHTX')+t('MSG_TXT_RGS')"
          :done="stepInitNum > 5"
          prefix="5"
        />
        <kw-step
          :name="6"
          :title="t('MSG_TXT_HIR_INSR')+t('MSG_TXT_DDTN')"
          :done="stepInitNum > 6"
          prefix="6"
        />
        <kw-step
          :name="7"
          :title="t('MSG_TXT_PNPYAM')+t('MSG_TXT_DDTN')"
          :done="stepInitNum > 7"
          prefix="7"
        />
        <kw-step
          :name="8"
          :title="t('MSG_TXT_BU')+t('MSG_TXT_DDTN')"
          :done="stepInitNum > 8"
          prefix="8"
        />
        <kw-step
          :name="9"
          :title="t('MSG_TXT_RDS')+t('MSG_TXT_RV')"
          :done="stepInitNum > 9"
          prefix="9"
        />
        <kw-step
          :name="10"
          :title="t('MSG_TXT_FNT')+t('MSG_TXT_MTR')+t('MSG_TXT_CRT')"
          :done="stepInitNum > 10"
          prefix="10"
        />
        <kw-step
          :name="11"
          :title="t('MSG_TXT_CNST_WRTE')"
          :done="stepInitNum > 11"
          prefix="11"
        />
        <kw-step
          :name="12"
          :title="t('MSG_TIT_SLIP_CRT')"
          :done="stepInitNum > 12"
          prefix="12"
        />
        <kw-step
          :name="13"
          :title="t('MSG_TIT_PIA_SELL_FEE_CNFM')"
          :done="stepInitNum > 13"
          prefix="13"
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
          @click="openZwfebFeeHistoryMgtP"
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
      <kw-grid
        v-if="isGrid3Visile"
        ref="grdMainRef"
        name="grd3Main"
        :visible-rows="10"
        @init="initGrd3Main"
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
const stepInitNum = ref(1);
const { modal, notify, alert } = useGlobal();
const isGrid1Visile = ref(false);
const isGrid2Visile = ref(false);
const isGrid3Visile = ref(true);
const currentRoute = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const maxDate = dayjs().format('YYYY-MM');
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const searchParams = ref({

  perfYm: now.format('YYYYMM'),
  rsbTp: '전체',
  no: '',
  blgCd: '',
  statTitle: t('MSG_TXT_PRGS_STE'),
  ogTp: 'W02',

});

const info = ref({
  nowStep: '',
});

let cachedParams;

/*
 *  Event - 직책유형 선택 시 하단 그리드 변경※
 */
async function onChangedRsbTp() {
  if (searchParams.value.rsbTp === '플래너') {
    isGrid1Visile.value = true;
    isGrid2Visile.value = false;
    isGrid3Visile.value = false;
  } else if (searchParams.value.rsbTp === '지점장') {
    isGrid1Visile.value = false;
    isGrid2Visile.value = true;
    isGrid3Visile.value = false;
  } else {
    isGrid1Visile.value = false;
    isGrid2Visile.value = false;
    isGrid3Visile.value = true;
  }
  stepInitNum.value = 1;
  totalCount.value = 0;
}

/*
 *  Event - 이력 관리 버튼 클릭 ※
 */
async function openZwfebFeeHistoryMgtP() {
  const param = {
    feeHistSrnCd: 'W02',
  };
  await modal({
    component: 'ZwfebFeeHistoryMgtP',
    componentProps: param,
  });
}

/*
 *  Event - 엑셀 다운로드 버튼 클릭 ※
 */
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

/*
 *  Event - 다음단계 버튼 클릭 ※
 */
async function onClickNextStep() {
  const nowStep = stepInitNum.value;
  if (nowStep < 13 && totalCount.value > 0) {
    if (searchParams.value.rsbTp === '전체') {
      await alert(t('MSG_ALT_SELECT_RSB_TP'));
    } else {
      stepInitNum.value = nowStep + 1;
    }
  }
  /*
  if (nowStep === 1) {
    // 미팅참석집계 프로세스 클릭 (Z-CO-U-0034P01 호출) ※아직 팝업 페이지 생성이 안됨
     alert('1 Step ZCOU0034P01');
    const param = {
      ogTp: 'W02',
    };
    await modal({
      component: 'ZCOU0034P01',
      componentProps: param,
    });
  } else if (nowStep === 2) {
    // 수수료생성 프로세스 클릭 (W-CO-U-0047P02 호출) ※아직 팝업 페이지 생성이 안됨
    // alert('2 Step WCOU0047P02');
    const param = {
      ogTp: 'W02',
    };
    await modal({
      component: 'ZCOU0034P02',
      componentProps: param,
    });
  } else if (nowStep === 3) {
    // 미팅참석집계 프로세스 클릭 (Z-CO-U-0034P01 호출) ※아직 팝업 페이지 생성이 안됨※
    // alert('3 Step EtcUpload');
  } else if (nowStep === 4) {
    // 세금공제 프로세스 클릭 (Z-CO-U-0034P02 호출) ※아직 팝업 페이지 생성이 안됨
    // alert('4 Step ZCOU0034P02');
    const param = {
      ogTp: 'W02',
    };
    await modal({
      component: 'ZCOU0034P02',
      componentProps: param,
    });
  } else if (nowStep === 5) {
    // 원천세 등록 프로세스 클릭 (Z-CO-U-0034P03 호출) ※아직 팝업 페이지 생성이 안됨
    // alert('5 Step ZCOU0034P03');
    const param = {
      ogTp: 'W02',
    };
    await modal({
      component: 'ZCOU0034P03',
      componentProps: param,
    });
  } else if (nowStep === 6) {
    // 고용보험 공제 프로세스 클릭 (Z-CO-U-0034P04 호출) ※아직 팝업 페이지 생성이 안됨
    // alert('6 Step ZCOU0034P04');
    const param = {
      ogTp: 'W02',
    };
    await modal({
      component: 'ZCOU0034P04',
      componentProps: param,
    });
  } else if (nowStep === 7) { // 가지급금 공제 프로세스 클릭 (Z-CO-U-0034P05 호출) ※아직 팝업 페이지 생성이 안됨
    // alert('7 Step ZCOU0034P05');
    const param = {
      ogTp: 'W02',
    };
    await modal({
      component: 'ZCOU0034P05',
      componentProps: param,
    });
  } else if (nowStep === 8) {
    // 부담공제 프로세스 클릭 (Z-CO-U-0034P06 호출) ※아직 팝업 페이지 생성이 안됨
    // alert('8 Step ZCOU0034P06');
    const param = {
      ogTp: 'W02',
    };
    await modal({
      component: 'ZCOU0034P06',
      componentProps: param,
    });
  } else if (nowStep === 9) {
    // 보증예치금 적립 프로세스 클릭 (Z-CO-U-0034P07 호출) ※아직 팝업 페이지 생성이 안됨
    // alert('9 Step ZCOU0034P07');
    const param = {
      ogTp: 'W02',
    };
    await modal({
      component: 'ZCOU0034P07',
      componentProps: param,
    });
  } else if (nowStep === 10) {
    // 이체자료생성 프로세스 클릭 (Z-CO-U-0034P08 호출) ※아직 팝업 페이지 생성이 안됨
    // alert('10 Step ZCOU0034P08');
    const param = {
      ogTp: 'W02',
    };
    await modal({
      component: 'ZCOU0034P08',
      componentProps: param,
    });
  } else if (nowStep === 11) {
    // TBD 처리 ※기능연계 전
    // alert('11 Step TBD1');
  } else if (nowStep === 12) {
    // TBD 처리 ※기능연계 전
    // alert('12 Step TBD2');
  } else if (nowStep === 13) {
    // 선판매 수수료 확정 프로세스 클릭 (W-CO-U-0047P04 호출) ※아직 팝업 페이지 생성이 안됨
    // alert('13 Step WCOU0047P04');
    const param = {
      ogTp: 'W02',
    };
    await modal({
      component: 'WCOU0047P04',
      componentProps: param,
    });
  }
  */
}

/*
 *  Event - 이전단계 버튼 클릭 ※
 */
async function onClickPrevStep() {
  const nowStep = stepInitNum.value;
  if (nowStep > 1 && totalCount.value > 0) {
    if (searchParams.value.rsbTp === '전체') {
      await alert(t('MSG_ALT_SELECT_RSB_TP'));
    } else {
      stepInitNum.value = nowStep - 1;
    }
  }
}

async function setTitle() {
  const { perfYm } = searchParams.value;
  const { rsbTp } = searchParams.value;
  const title = `${perfYm.substring(0, 4) + t('MSG_TXT_YEAR')} ${perfYm.substring(4, 6)}${t('MSG_TXT_MON')} ${rsbTp} ${t('MSG_TXT_PRGS_STE')}`;
  searchParams.value.statTitle = title + t('MSG_TXT_PRGS_STE');
  const response1 = await dataService.get('/sms/wells/fee/organization-fees/plars-step', { params: cachedParams });
  const resData = response1.data;
  info.value = resData;
  stepInitNum.value = Number(info.value.nowStep);
}

async function fetchData() {
  let uri = '';
  const prtnrNo = searchParams.value.no;

  if (isGrid2Visile.value === true) {
    uri = '-brmgr';
  } else if (isGrid3Visile.value === true) {
    uri = '-total';
  }
  const response = await dataService.get(`/sms/wells/fee/organization-fees/mngers${uri}`, { params: cachedParams });
  const mngerFees = response.data;
  totalCount.value = mngerFees.length;

  if (prtnrNo !== '' && totalCount.value === 0) {
    notify(t('MSG_TXT_RPB_EMPNO_CONF'));
  }

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(mngerFees);
  view.resetCurrent();
  await setTitle();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 번호 검색 아이콘 클릭 이벤트
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.no,
      ogTpCd: 'W02',
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.no = payload.prtnrNo;
    }
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd1Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'rsbDvCd' },
    { fieldName: 'akcuil' },
    { fieldName: 'akdmi3' },
    { fieldName: 'akdmi32' },
    { fieldName: 'edustr' },
    { fieldName: 'edu011' },
    { fieldName: 'edu129' },
    { fieldName: 'edu106' },
    { fieldName: 'akdcha' },
    { fieldName: 'edu017' },
    { fieldName: 'ojtcnt' },
    { fieldName: 'akdsym' },
    { fieldName: 'akdenm' },
    { fieldName: 'akdjem' },
    { fieldName: 'akdlym' },
    { fieldName: 'akdcym' },
    { fieldName: 'akdrym' },
    { fieldName: 'sustym' },
    { fieldName: 'suscym' },
    { fieldName: 'lccoym' },
    { fieldName: 'lcccym' },
    { fieldName: 'dalsyn' },
    { fieldName: 'bondalsyn' },
    { fieldName: 'sungnm' },
    { fieldName: 'wpscnt' },
    { fieldName: 'wmscnt' },
    { fieldName: 'spscnt' },
    { fieldName: 'dancnt' },
    { fieldName: 'akcda17' },
    { fieldName: 'akcda18' },
    { fieldName: 'akcda1' },
    { fieldName: 'akcdq1' },
    { fieldName: 'akcdq0' },
    { fieldName: 'akcdq7' },
    { fieldName: 'akdet3' },
    { fieldName: 'jasamt' },
    { fieldName: 'akcda12' },
    { fieldName: 'akcda13' },
    { fieldName: 'akcda14' },
    { fieldName: 'akcda15' },
    { fieldName: 'akcda16' },
    { fieldName: 'akcdq5' },
    { fieldName: 'akcdq6' },
    { fieldName: 'akcda19' },
    { fieldName: 'jakcdq0' },
    { fieldName: 'jakcdq6' },
    { fieldName: 'jakcda12' },
    { fieldName: 'jakcda13' },
    { fieldName: 'jakcda15' },
    { fieldName: 'aksd49' },
    { fieldName: 'aksd43' },
    { fieldName: 'aksd26' },
    { fieldName: 'aksd29' },
    { fieldName: 'sd26m1' },
    { fieldName: 'sd26m2' },
    { fieldName: 'sd26mt' },
    { fieldName: 'aksd17' },
    { fieldName: 'aksd50' },
    { fieldName: 'aksd48' },
    { fieldName: 'aksd04' },
    { fieldName: 'aksd15' },
    { fieldName: 'aksd23' },
    { fieldName: 'aksd42' },
    { fieldName: 'aksd31' },
    { fieldName: 'aksd34' },
    { fieldName: 'aksd11' },
    { fieldName: 'aksd08' },
    { fieldName: 'aksd22' },
    { fieldName: 'aksd13' },
    { fieldName: 'aksd09' },
    { fieldName: 'aksd36' },
    { fieldName: 'aksd05' },
    { fieldName: 'aksd14' },
    { fieldName: 'aksd39' },
    { fieldName: 'aksd18' },
    { fieldName: 'aksd19' },
    { fieldName: 'aksd40' },
    { fieldName: 'aksd16' },
    { fieldName: 'aksd10' },
    { fieldName: 'lccntt' },
    { fieldName: 'intbsSum' },
    { fieldName: 'ddtnSum' },
    { fieldName: 'aclDsbAmt' },

  ];

  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '88.7' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88.7' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '88.7' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '88.7', styleName: 'text-right' },
    { fieldName: 'akcuil', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '91.4' },
    { fieldName: 'akdmi3', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '91.4' },
    { fieldName: 'akdmi32', header: 'M+1', width: '91.4', styleName: 'text-center' },
    { fieldName: 'edustr', header: t('MSG_TXT_MANAGER'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu011', header: t('MSG_TXT_PLAR'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'edu129', header: t('MSG_TXT_CMPF') + t('MSG_TXT_EDUC'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'edu106', header: t('MSG_TXT_STMNT'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'akdcha', header: t('MSG_TXT_NMN'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu017', header: t('MSG_TXT_PRTIC'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'ojtcnt', header: `OJT${t('MSG_TXT_DC')}`, width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdsym', header: t('MSG_TXT_RGS') + t('MSG_TXT_BASE_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdenm', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '97.3', styleName: 'text-center' },
    { fieldName: 'akdjem', header: t('MSG_TXT_RETR') + t('MSG_TXT_MON'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdlym', header: t('MSG_TXT_FNL_CLTN_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdcym', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdrym', header: t('MSG_TXT_PRFMT_MON'), width: '89.3', styleName: 'text-center' },
    { fieldName: 'sustym', header: t('MSG_TXT_RGS') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'suscym', header: t('MSG_TXT_CLTN') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'lccoym', header: `WM${t('MSG_TXT_OPNG')}`, width: '122.7', styleName: 'text-center' },
    { fieldName: 'lcccym', header: `WM${t('MSG_TXT_CLTN')}`, width: '122.7', styleName: 'text-center' },
    { fieldName: 'dalsyn', header: t('MSG_TXT_ACL_ACTI') + t('MSG_TXT_ACHV'), width: '122.7' },
    { fieldName: 'bondalsyn', header: t('MSG_TXT_MIN') + t('MSG_TXT_BASE') + t('MSG_TXT_ACHV'), width: '110.4', styleName: 'text-center' },
    { fieldName: 'sungnm', header: t('MSG_TXT_LSTMM') + t('MSG_TXT_CPR') + t('MSG_TXT_DIV'), width: '110.4', styleName: 'text-center' },
    { fieldName: 'wpscnt', header: 'WP', width: '110.4', styleName: 'text-center' },
    { fieldName: 'wmscnt', header: 'WM', width: '122.7', styleName: 'text-right' },
    { fieldName: 'spscnt', header: 'SP', width: '122.7', styleName: 'text-right' },
    { fieldName: 'dancnt', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_PERSONS'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcda17', header: t('MSG_TXT_RENTAL'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcda18', header: t('MSG_TXT_SNGL_PMNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcda1', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcdq1', header: t('MSG_TXT_ELHM') + t('MSG_TXT_NTOR') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcdq0', header: t('MSG_TXT_INDV') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcdq7', header: `${t('MSG_TXT_INDV')}BS${t('MSG_TXT_ACKMT')}${t('MSG_TXT_COUNT')}`, width: '110.4', styleName: 'text-right' },
    { fieldName: 'akdet3', header: t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'jasamt', header: t('MSG_TXT_AMT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcda12', header: t('MSG_TXT_RENTAL'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'akcda13', header: t('MSG_TXT_SNGL_PMNT'), width: '139.2', styleName: 'text-right' },
    { fieldName: 'akcda14', header: t('MSG_TXT_FXAM'), width: '176', styleName: 'text-right' },
    { fieldName: 'akcda15', header: t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'akcda16', header: t('MSG_TXT_FXAM'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'akcdq5', header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcdq6', header: t('MSG_TXT_INDV') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcda19', header: t('MSG_TXT_HOME_CARE') + t('TXT_MSG_SELL_PRC'), width: '128.1', styleName: 'text-right' },
    { fieldName: 'jakcdq0', header: t('MSG_TXT_OG') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'jakcdq6', header: t('MSG_TXT_OG') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'jakcda12', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_RENTAL'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'jakcda13', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'jakcda15', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd49', header: t('MSG_TXT_HOME_CARE'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd43', header: t('MSG_TXT_LIVE_PAKG'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd26', header: t('MSG_TXT_ELHM') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd29', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right' },
    { fieldName: 'sd26m1', header: t('MSG_TXT_ELHM') + t('MSG_TXT_METG'), width: '129', styleName: 'text-right' },
    { fieldName: 'sd26m2', header: t('MSG_TXT_SNGL_PMNT') + t('MSG_TXT_METG'), width: '129', styleName: 'text-right' },
    { fieldName: 'sd26mt', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_METG'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd17', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd50', header: t('MSG_TXT_EDUC'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd48', header: t('MSG_TXT_STMNT'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd04', header: t('MSG_TXT_MCHN_CH'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd15', header: `BS${t('MSG_TXT_MGT')}`, width: '129', styleName: 'text-right' },
    { fieldName: 'aksd23', header: t('MSG_TXT_RGLVL'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd42', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG') + t('MSG_TXT_RETT'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd31', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd34', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd11', header: t('MSG_TXT_OG') + t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd08', header: t('MSG_TXT_NEW') + t('MSG_TXT_SELL'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd22', header: t('MSG_TXT_OG') + t('MSG_TXT_MGT'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd13', header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}1`, width: '129', styleName: 'text-right' },
    { fieldName: 'aksd09', header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}2`, width: '129', styleName: 'text-right' },
    { fieldName: 'aksd36', header: t('MSG_TXT_NB') + t('MSG_TXT_BRANCH'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd05', header: t('MSG_TXT_MEMBERSHIP'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd14', header: t('MSG_TXT_ADSB'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd39', header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd18', header: t('MSG_TXT_CMNC'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd19', header: t('MSG_TXT_ETC'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd40', header: t('MSG_TXT_PRR_VST'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd16', header: t('MSG_TXT_UNIFORM'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd10', header: t('MSG_TXT_MAT_HODT'), width: '129', styleName: 'text-right' },
    { fieldName: 'lccntt', header: t('MSG_TXT_COMPLETE') + t('MSG_TXT_ACC'), width: '129', styleName: 'text-right' },
    { fieldName: 'intbsSum', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '129', styleName: 'text-right' },
    { fieldName: 'ddtnSum', header: t('MSG_TXT_DDTN_SUM'), width: '129', styleName: 'text-right' },
    { fieldName: 'aclDsbAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '129', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'ogNm', 'prtnrNo', 'prtnrKnm', 'rsbDvCd', 'akcuil',
    {
      header: t('MSG_TXT_QLF'),
      direction: 'horizontal',
      items: ['akdmi3', 'akdmi32'],
    },
    {
      header: t('MSG_TXT_SRTUP'),
      direction: 'horizontal',
      items: ['edustr', 'edu011'],
    },
    'edu129',
    {
      header: t('MSG_TXT_TOPMR_PLAR') + t('MSG_TXT_EDUC'),
      direction: 'horizontal',
      items: ['edu106', 'akdcha', 'edu017'],
    },
    'ojtcnt', 'akdsym', 'akdenm', 'akdjem', 'akdlym', 'akdcym', 'akdrym',
    {
      header: t('MSG_TXT_TOPMR_PLAR'),
      direction: 'horizontal',
      items: ['sustym', 'suscym'],
    },
    'lccoym', 'lcccym', 'dalsyn',
    {
      header: t('TXT_MSG_ACKMT_PERF'),
      direction: 'horizontal',
      items: ['bondalsyn', 'sungnm', 'wpscnt'],
    },
    'wmscnt', 'spscnt', 'dancnt',
    {
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_CHNG'),
      direction: 'horizontal',
      items: ['akcda17', 'akcda18'],
    },
    {
      header: `${t('MSG_TXT_ENVR_ELHM')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['akcda1', 'akcdq1', 'akcdq0'],
    },
    {
      header: `${t('MSG_TXT_ENVR_ELHM') + t('MSG_TXT_EXCP')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['akcdq7', 'akdet3'],
    },
    'jasamt', 'akcda12', 'akcda13', 'akcda14', 'akcda15',
    {
      header: `${t('SG_TXT_OG')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['akcda16', 'akcdq5', 'akcdq6'],
    },
    'akcda19', 'jakcdq0', 'jakcdq6', 'jakcda12', 'jakcda13', 'jakcda15', 'aksd49', 'aksd43',
    'aksd26', 'aksd29', 'sd26m1', 'sd26m2', 'sd26mt', 'aksd17', 'aksd50', 'aksd48',
    'aksd04', 'aksd15', 'aksd23', 'aksd42', 'aksd31', 'aksd34', 'aksd11', 'aksd08',
    'aksd22', 'aksd13', 'aksd09', 'aksd36', 'aksd05', 'aksd14', 'aksd39', 'aksd18',
    'aksd19', 'aksd40', 'aksd16', 'aksd10', 'lccntt', 'intbsSum', 'ddtnSum', 'aclDsbAmt',

  ]);
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'rsbDvCd' },
    { fieldName: 'akcuil' },
    { fieldName: 'akdmi3' },
    { fieldName: 'akdmi32' },
    { fieldName: 'edustr' },
    { fieldName: 'edu011' },
    { fieldName: 'edu129' },
    { fieldName: 'edu106' },
    { fieldName: 'akdcha' },
    { fieldName: 'edu017' },
    { fieldName: 'edu135' },
    { fieldName: 'akdsym' },
    { fieldName: 'akdenm' },
    { fieldName: 'akdjem' },
    { fieldName: 'akdlym' },
    { fieldName: 'akdcym' },
    { fieldName: 'akdrym' },
    { fieldName: 'sustym' },
    { fieldName: 'suscym' },
    { fieldName: 'lccoym' },
    { fieldName: 'lcccym' },
    { fieldName: 'bondalsyn' },
    { fieldName: 'sungnm' },
    { fieldName: 'wpscnt' },
    { fieldName: 'wmscnt' },
    { fieldName: 'spscnt' },
    { fieldName: 'dancnt' },
    { fieldName: 'akcda17' },
    { fieldName: 'akcda18' },
    { fieldName: 'akcda1' },
    { fieldName: 'akcdq1' },
    { fieldName: 'akcdq0' },
    { fieldName: 'akcdq7' },
    { fieldName: 'akdet3' },
    { fieldName: 'jasamt' },
    { fieldName: 'akcda12' },
    { fieldName: 'akcda13' },
    { fieldName: 'akcda14' },
    { fieldName: 'akcda15' },
    { fieldName: 'akcda16' },
    { fieldName: 'akcdq5' },
    { fieldName: 'akcdq6' },
    { fieldName: 'akcda19' },
    { fieldName: 'jakcdq0' },
    { fieldName: 'jakcdq6' },
    { fieldName: 'jakcda12' },
    { fieldName: 'jakcda13' },
    { fieldName: 'jakcda15' },
    { fieldName: 'aksd49' },
    { fieldName: 'aksd43' },
    { fieldName: 'aksd26' },
    { fieldName: 'aksd29' },
    { fieldName: 'aksd17' },
    { fieldName: 'aksd50' },
    { fieldName: 'aksd48' },
    { fieldName: 'aksd04' },
    { fieldName: 'aksd15' },
    { fieldName: 'aksd23' },
    { fieldName: 'aksd42' },
    { fieldName: 'aksd31' },
    { fieldName: 'aksd34' },
    { fieldName: 'aksd11' },
    { fieldName: 'aksd08' },
    { fieldName: 'aksd22' },
    { fieldName: 'aksd06' },
    { fieldName: 'aksd13' },
    { fieldName: 'aksd09' },
    { fieldName: 'aksd36' },
    { fieldName: 'aksd05' },
    { fieldName: 'aksd14' },
    { fieldName: 'aksd39' },
    { fieldName: 'aksd18' },
    { fieldName: 'aksd19' },
    { fieldName: 'aksd40' },
    { fieldName: 'aksd16' },
    { fieldName: 'aksd10' },
    { fieldName: 'lccntt' },
    { fieldName: 'intbsSum' },
    { fieldName: 'ddtnSum' },
    { fieldName: 'aclDsbAmt' },

  ];

  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '88.7' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88.7' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '88.7' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '88.7', styleName: 'text-right' },
    { fieldName: 'akcuil', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '91.4' },
    { fieldName: 'akdmi3', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '91.4' },
    { fieldName: 'akdmi32', header: 'M+1', width: '91.4', styleName: 'text-center' },
    { fieldName: 'edustr', header: t('MSG_TXT_MANAGER'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu011', header: t('MSG_TXT_PLAR'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'edu129', header: t('MSG_TXT_CMPF') + t('MSG_TXT_EDUC'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'edu106', header: t('MSG_TXT_STMNT'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'akdcha', header: t('MSG_TXT_NMN'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu017', header: t('MSG_TXT_PRTIC'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu135', header: t('MSG_TXT_BRMGR') + t('MSG_TXT_ONL'), width: '88.7', styleName: 'text-right' },
    { fieldName: 'akdsym', header: t('MSG_TXT_RGS') + t('MSG_TXT_BASE_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdenm', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '97.3', styleName: 'text-center' },
    { fieldName: 'akdjem', header: t('MSG_TXT_RETR') + t('MSG_TXT_MON'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdlym', header: t('MSG_TXT_FNL_CLTN_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdcym', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdrym', header: t('MSG_TXT_PRFMT_MON'), width: '89.3', styleName: 'text-center' },
    { fieldName: 'sustym', header: t('MSG_TXT_RGS') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'suscym', header: t('MSG_TXT_CLTN') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'lccoym', header: `WM${t('MSG_TXT_OPNG')}`, width: '122.7', styleName: 'text-center' },
    { fieldName: 'lcccym', header: `WM${t('MSG_TXT_CLTN')}`, width: '122.7', styleName: 'text-center' },
    { fieldName: 'bondalsyn', header: t('MSG_TXT_MIN') + t('MSG_TXT_BASE') + t('MSG_TXT_ACHV'), width: '110.4', styleName: 'text-center' },
    { fieldName: 'sungnm', header: t('MSG_TXT_LSTMM') + t('MSG_TXT_CPR') + t('MSG_TXT_DIV'), width: '110.4', styleName: 'text-center' },
    { fieldName: 'wpscnt', header: 'WP', width: '110.4', styleName: 'text-center' },
    { fieldName: 'wmscnt', header: 'WM', width: '122.7', styleName: 'text-right' },
    { fieldName: 'spscnt', header: 'SP', width: '122.7', styleName: 'text-right' },
    { fieldName: 'dancnt', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_PERSONS'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcda17', header: t('MSG_TXT_RENTAL'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcda18', header: t('MSG_TXT_SNGL_PMNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcda1', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcdq1', header: t('MSG_TXT_ELHM') + t('MSG_TXT_NTOR') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcdq0', header: t('MSG_TXT_INDV') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcdq7', header: `${t('MSG_TXT_INDV')}BS${t('MSG_TXT_ACKMT')}${t('MSG_TXT_COUNT')}`, width: '110.4', styleName: 'text-right' },
    { fieldName: 'akdet3', header: t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'jasamt', header: t('MSG_TXT_AMT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcda12', header: t('MSG_TXT_RENTAL'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'akcda13', header: t('MSG_TXT_SNGL_PMNT'), width: '139.2', styleName: 'text-right' },
    { fieldName: 'akcda14', header: t('MSG_TXT_FXAM'), width: '176', styleName: 'text-right' },
    { fieldName: 'akcda15', header: t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'akcda16', header: t('MSG_TXT_FXAM'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'akcdq5', header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcdq6', header: t('MSG_TXT_INDV') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcda19', header: t('MSG_TXT_HOME_CARE') + t('TXT_MSG_SELL_PRC'), width: '128.1', styleName: 'text-right' },
    { fieldName: 'jakcdq0', header: t('MSG_TXT_OG') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'jakcdq6', header: t('MSG_TXT_OG') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'jakcda12', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_RENTAL'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'jakcda13', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'jakcda15', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd49', header: t('MSG_TXT_HOME_CARE'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd43', header: t('MSG_TXT_LIVE_PAKG'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd26', header: t('MSG_TXT_ELHM') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd29', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd17', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd50', header: t('MSG_TXT_EDUC'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd48', header: t('MSG_TXT_STMNT'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd04', header: t('MSG_TXT_MCHN_CH'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd15', header: `BS${t('MSG_TXT_MGT')}`, width: '129', styleName: 'text-right' },
    { fieldName: 'aksd23', header: t('MSG_TXT_RGLVL'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd42', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG') + t('MSG_TXT_RETT'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd31', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd34', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd11', header: t('MSG_TXT_OG') + t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd08', header: t('MSG_TXT_NEW') + t('MSG_TXT_SELL'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd22', header: t('MSG_TXT_OG') + t('MSG_TXT_MGT'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd06', header: t('MSG_TXT_ADD') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd13', header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}1`, width: '129', styleName: 'text-right' },
    { fieldName: 'aksd09', header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}2`, width: '129', styleName: 'text-right' },
    { fieldName: 'aksd36', header: t('MSG_TXT_NB') + t('MSG_TXT_BRANCH'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd05', header: t('MSG_TXT_MEMBERSHIP'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd14', header: t('MSG_TXT_ADSB'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd39', header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd18', header: t('MSG_TXT_CMNC'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd19', header: t('MSG_TXT_ETC'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd40', header: t('MSG_TXT_PRR_VST'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd16', header: t('MSG_TXT_UNIFORM'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd10', header: t('MSG_TXT_MAT_HODT'), width: '129', styleName: 'text-right' },
    { fieldName: 'lccntt', header: t('MSG_TXT_COMPLETE') + t('MSG_TXT_ACC'), width: '129', styleName: 'text-right' },
    { fieldName: 'intbsSum', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '129', styleName: 'text-right' },
    { fieldName: 'ddtnSum', header: t('MSG_TXT_DDTN_SUM'), width: '129', styleName: 'text-right' },
    { fieldName: 'aclDsbAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '129', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'ogNm', 'prtnrNo', 'prtnrKnm', 'rsbDvCd', 'akcuil',
    {
      header: t('MSG_TXT_QLF'),
      direction: 'horizontal',
      items: ['akdmi3', 'akdmi32'],
    },
    {
      header: t('MSG_TXT_TOPMR_PLAR') + t('MSG_TXT_EDUC'),
      direction: 'horizontal',
      items: ['edustr', 'edu011'],
    },
    'edu129', 'edu106', 'akdcha', 'edu017', 'edu135', 'akdsym', 'akdenm',
    {
      header: t('MSG_TXT_TOPMR_PLAR'),
      direction: 'horizontal',
      items: ['akdjem', 'akdlym'],
    },
    'akdcym', 'akdrym',
    {
      header: t('MSG_TXT_ACL_ACTI_PPL'),
      direction: 'horizontal',
      items: ['sustym', 'suscym', 'lccoym', 'lcccym', 'bondalsyn', 'sungnm'],
    },
    {
      header: t('TXT_MSG_ACKMT_PERF'),
      direction: 'horizontal',
      items: ['wpscnt', 'wmscnt', 'spscnt'],
    },
    'dancnt', 'akcda17', 'akcda18',
    {
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_CHNG'),
      direction: 'horizontal',
      items: ['akcda1', 'akcdq1'],
    },
    {
      header: `${t('MSG_TXT_ENVR_ELHM')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['akcdq0', 'akcdq7', 'akdet3'],
    },
    {
      header: `${t('MSG_TXT_ENVR_ELHM') + t('MSG_TXT_EXCP')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['jasamt', 'akcda12'],
    },
    'akcda13', 'akcda14', 'akcda15', 'akcda16', 'akcdq5',
    {
      header: `${t('SG_TXT_OG')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['akcdq6', 'akcda19', 'jakcdq0'],
    },
    'jakcdq6', 'jakcda12', 'jakcda13', 'jakcda15', 'aksd49', 'aksd43', 'aksd26', 'aksd29',
    'aksd17', 'aksd50', 'aksd48', 'aksd04', 'aksd15', 'aksd23', 'aksd42', 'aksd31',
    'aksd34', 'aksd11', 'aksd08', 'aksd22', 'aksd06', 'aksd13', 'aksd09', 'aksd36',
    'aksd05', 'aksd14', 'aksd39', 'aksd18', 'aksd19', 'aksd40', 'aksd16', 'aksd10',
    'lccntt', 'intbsSum', 'ddtnSum', 'aclDsbAmt',
  ]);
});

const initGrd3Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'rsbDvCd' },
    { fieldName: 'akcuil' },
    { fieldName: 'akdmi3' },
    { fieldName: 'akdmi32' },
    { fieldName: 'edustr' },
    { fieldName: 'edu011' },
    { fieldName: 'edu129' },
    { fieldName: 'edu106' },
    { fieldName: 'akdcha' },
    { fieldName: 'edu017' },
    { fieldName: 'edu135' },
    { fieldName: 'ojtcnt' },
    { fieldName: 'akdsym' },
    { fieldName: 'akdenm' },
    { fieldName: 'akdjem' },
    { fieldName: 'akdlym' },
    { fieldName: 'akdcym' },
    { fieldName: 'akdrym' },
    { fieldName: 'sustym' },
    { fieldName: 'suscym' },
    { fieldName: 'lccoym' },
    { fieldName: 'lcccym' },
    { fieldName: 'dalsyn' },
    { fieldName: 'bondalsyn' },
    { fieldName: 'sungnm' },
    { fieldName: 'wpscnt' },
    { fieldName: 'wmscnt' },
    { fieldName: 'spscnt' },
    { fieldName: 'dancnt' },
    { fieldName: 'akcda17' },
    { fieldName: 'akcda18' },
    { fieldName: 'akcda1' },
    { fieldName: 'akcdq1' },
    { fieldName: 'akcdq0' },
    { fieldName: 'akcdq7' },
    { fieldName: 'akdet3' },
    { fieldName: 'jasamt' },
    { fieldName: 'akcda12' },
    { fieldName: 'akcda13' },
    { fieldName: 'akcda14' },
    { fieldName: 'akcda15' },
    { fieldName: 'akcda16' },
    { fieldName: 'akcdq5' },
    { fieldName: 'akcdq6' },
    { fieldName: 'akcda19' },
    { fieldName: 'jakcdq0' },
    { fieldName: 'jakcdq6' },
    { fieldName: 'jakcda12' },
    { fieldName: 'jakcda13' },
    { fieldName: 'jakcda15' },
    { fieldName: 'aksd49' },
    { fieldName: 'aksd43' },
    { fieldName: 'aksd26' },
    { fieldName: 'aksd29' },
    { fieldName: 'sd26m1' },
    { fieldName: 'sd26m2' },
    { fieldName: 'sd26mt' },
    { fieldName: 'aksd17' },
    { fieldName: 'aksd50' },
    { fieldName: 'aksd48' },
    { fieldName: 'aksd04' },
    { fieldName: 'aksd15' },
    { fieldName: 'aksd23' },
    { fieldName: 'aksd42' },
    { fieldName: 'aksd31' },
    { fieldName: 'aksd34' },
    { fieldName: 'aksd11' },
    { fieldName: 'aksd08' },
    { fieldName: 'aksd22' },
    { fieldName: 'aksd06' },
    { fieldName: 'aksd13' },
    { fieldName: 'aksd09' },
    { fieldName: 'aksd36' },
    { fieldName: 'aksd05' },
    { fieldName: 'aksd14' },
    { fieldName: 'aksd39' },
    { fieldName: 'aksd18' },
    { fieldName: 'aksd19' },
    { fieldName: 'aksd40' },
    { fieldName: 'aksd16' },
    { fieldName: 'aksd10' },
    { fieldName: 'lccntt' },
    { fieldName: 'intbsSum' },
    { fieldName: 'ddtnSum' },
    { fieldName: 'aclDsbAmt' },

  ];

  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '88.7' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88.7' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '88.7' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '88.7', styleName: 'text-right' },
    { fieldName: 'akcuil', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '91.4' },
    { fieldName: 'akdmi3', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '91.4' },
    { fieldName: 'akdmi32', header: 'M+1', width: '91.4', styleName: 'text-center' },
    { fieldName: 'edustr', header: t('MSG_TXT_MANAGER'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu011', header: t('MSG_TXT_PLAR'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'edu129', header: t('MSG_TXT_CMPF') + t('MSG_TXT_EDUC'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'edu106', header: t('MSG_TXT_STMNT'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'akdcha', header: t('MSG_TXT_NMN'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu017', header: t('MSG_TXT_PRTIC'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu135', header: t('MSG_TXT_BRMGR') + t('MSG_TXT_ONL'), width: '88.7', styleName: 'text-right' },
    { fieldName: 'ojtcnt', header: `OJT${t('MSG_TXT_DC')}`, width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdsym', header: t('MSG_TXT_RGS') + t('MSG_TXT_BASE_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdenm', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '97.3', styleName: 'text-center' },
    { fieldName: 'akdjem', header: t('MSG_TXT_RETR') + t('MSG_TXT_MON'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdlym', header: t('MSG_TXT_FNL_CLTN_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdcym', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdrym', header: t('MSG_TXT_PRFMT_MON'), width: '89.3', styleName: 'text-center' },
    { fieldName: 'sustym', header: t('MSG_TXT_RGS') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'suscym', header: t('MSG_TXT_CLTN') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'lccoym', header: `WM${t('MSG_TXT_OPNG')}`, width: '122.7', styleName: 'text-center' },
    { fieldName: 'lcccym', header: `WM${t('MSG_TXT_CLTN')}`, width: '122.7', styleName: 'text-center' },
    { fieldName: 'dalsyn', header: t('MSG_TXT_ACL_ACTI') + t('MSG_TXT_ACHV'), width: '122.7' },
    { fieldName: 'bondalsyn', header: t('MSG_TXT_MIN') + t('MSG_TXT_BASE') + t('MSG_TXT_ACHV'), width: '110.4', styleName: 'text-center' },
    { fieldName: 'sungnm', header: t('MSG_TXT_LSTMM') + t('MSG_TXT_CPR') + t('MSG_TXT_DIV'), width: '110.4', styleName: 'text-center' },
    { fieldName: 'wpscnt', header: 'WP', width: '110.4', styleName: 'text-center' },
    { fieldName: 'wmscnt', header: 'WM', width: '122.7', styleName: 'text-right' },
    { fieldName: 'spscnt', header: 'SP', width: '122.7', styleName: 'text-right' },
    { fieldName: 'dancnt', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_PERSONS'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcda17', header: t('MSG_TXT_RENTAL'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcda18', header: t('MSG_TXT_SNGL_PMNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcda1', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcdq1', header: t('MSG_TXT_ELHM') + t('MSG_TXT_NTOR') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcdq0', header: t('MSG_TXT_INDV') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcdq7', header: `${t('MSG_TXT_INDV')}BS${t('MSG_TXT_ACKMT')}${t('MSG_TXT_COUNT')}`, width: '110.4', styleName: 'text-right' },
    { fieldName: 'akdet3', header: t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'jasamt', header: t('MSG_TXT_AMT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcda12', header: t('MSG_TXT_RENTAL'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'akcda13', header: t('MSG_TXT_SNGL_PMNT'), width: '139.2', styleName: 'text-right' },
    { fieldName: 'akcda14', header: t('MSG_TXT_FXAM'), width: '176', styleName: 'text-right' },
    { fieldName: 'akcda15', header: t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'akcda16', header: t('MSG_TXT_FXAM'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'akcdq5', header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcdq6', header: t('MSG_TXT_INDV') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right' },
    { fieldName: 'akcda19', header: t('MSG_TXT_HOME_CARE') + t('TXT_MSG_SELL_PRC'), width: '128.1', styleName: 'text-right' },
    { fieldName: 'jakcdq0', header: t('MSG_TXT_OG') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'jakcdq6', header: t('MSG_TXT_OG') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'jakcda12', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_RENTAL'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'jakcda13', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'jakcda15', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd49', header: t('MSG_TXT_HOME_CARE'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd43', header: t('MSG_TXT_LIVE_PAKG'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd26', header: t('MSG_TXT_ELHM') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd29', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right' },
    { fieldName: 'sd26m1', header: t('MSG_TXT_ELHM') + t('MSG_TXT_METG'), width: '129', styleName: 'text-right' },
    { fieldName: 'sd26m2', header: t('MSG_TXT_SNGL_PMNT') + t('MSG_TXT_METG'), width: '129', styleName: 'text-right' },
    { fieldName: 'sd26mt', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_METG'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd17', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd50', header: t('MSG_TXT_EDUC'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd48', header: t('MSG_TXT_STMNT'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd04', header: t('MSG_TXT_MCHN_CH'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd15', header: `BS${t('MSG_TXT_MGT')}`, width: '129', styleName: 'text-right' },
    { fieldName: 'aksd23', header: t('MSG_TXT_RGLVL'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd42', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG') + t('MSG_TXT_RETT'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd31', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd34', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd11', header: t('MSG_TXT_OG') + t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd08', header: t('MSG_TXT_NEW') + t('MSG_TXT_SELL'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd22', header: t('MSG_TXT_OG') + t('MSG_TXT_MGT'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd06', header: t('MSG_TXT_ADD') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd13', header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}1`, width: '129', styleName: 'text-right' },
    { fieldName: 'aksd09', header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}2`, width: '129', styleName: 'text-right' },
    { fieldName: 'aksd36', header: t('MSG_TXT_NB') + t('MSG_TXT_BRANCH'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd05', header: t('MSG_TXT_MEMBERSHIP'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd14', header: t('MSG_TXT_ADSB'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd39', header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd18', header: t('MSG_TXT_CMNC'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd19', header: t('MSG_TXT_ETC'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd40', header: t('MSG_TXT_PRR_VST'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd16', header: t('MSG_TXT_UNIFORM'), width: '129', styleName: 'text-right' },
    { fieldName: 'aksd10', header: t('MSG_TXT_MAT_HODT'), width: '129', styleName: 'text-right' },
    { fieldName: 'lccntt', header: t('MSG_TXT_COMPLETE') + t('MSG_TXT_ACC'), width: '129', styleName: 'text-right' },
    { fieldName: 'intbsSum', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '129', styleName: 'text-right' },
    { fieldName: 'ddtnSum', header: t('MSG_TXT_DDTN_SUM'), width: '129', styleName: 'text-right' },
    { fieldName: 'aclDsbAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '129', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'ogNm', 'prtnrNo', 'prtnrKnm', 'rsbDvCd', 'akcuil',
    {
      header: t('MSG_TXT_QLF'),
      direction: 'horizontal',
      items: ['akdmi3', 'akdmi32'],
    },
    {
      header: t('MSG_TXT_SRTUP'),
      direction: 'horizontal',
      items: ['edustr', 'edu011'],
    },
    'edu129',
    {
      header: t('MSG_TXT_TOPMR_PLAR') + t('MSG_TXT_EDUC'),
      direction: 'horizontal',
      items: ['edu106', 'akdcha', 'edu017'],
    },
    'edu135', 'ojtcnt', 'akdsym', 'akdenm', 'akdjem', 'akdlym', 'akdcym', 'akdrym',
    {
      header: t('MSG_TXT_TOPMR_PLAR'),
      direction: 'horizontal',
      items: ['sustym', 'suscym'],
    },
    'lccoym', 'lcccym', 'dalsyn',
    {
      header: t('MSG_TXT_ACL_ACTI_PPL'),
      direction: 'horizontal',
      items: ['bondalsyn', 'sungnm', 'wpscnt', 'wmscnt', 'spscnt', 'dancnt'],
    },
    {
      header: t('TXT_MSG_ACKMT_PERF'),
      direction: 'horizontal',
      items: ['akcda17', 'akcda18', 'akcda1'],
    },
    'akcdq1', 'akcdq0', 'akcdq7',
    {
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_CHNG'),
      direction: 'horizontal',
      items: ['akdet3', 'jasamt'],
    },
    {
      header: `${t('MSG_TXT_ENVR_ELHM')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['akcda12', 'akcda13', 'akcda14'],
    },
    {
      header: `${t('MSG_TXT_ENVR_ELHM') + t('MSG_TXT_EXCP')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['akcda15', 'akcda16'],
    },
    'akcdq5', 'akcdq6', 'akcda19', 'jakcdq0', 'jakcdq6',
    {
      header: `${t('SG_TXT_OG')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['jakcda12', 'jakcda13', 'jakcda15'],
    },
    'aksd49', 'aksd43', 'aksd26', 'aksd29', 'sd26m1', 'sd26m2', 'sd26mt', 'aksd17',
    'aksd50', 'aksd48', 'aksd04', 'aksd15', 'aksd23', 'aksd42', 'aksd31', 'aksd34',
    'aksd11', 'aksd08', 'aksd22', 'aksd06', 'aksd13', 'aksd09', 'aksd36', 'aksd05',
    'aksd14', 'aksd39', 'aksd18', 'aksd19', 'aksd40', 'aksd16', 'aksd10', 'lccntt',
    'intbsSum', 'ddtnSum', 'aclDsbAmt',

  ]);
});

</script>

<style scoped>
</style>
