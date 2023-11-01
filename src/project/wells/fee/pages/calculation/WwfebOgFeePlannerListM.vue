<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebOgFeePlannerListM - P조직 수수료 생성관리
3. 작성자 : min-kyu bae
4. 작성일 : 2023.02.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- P조직 수수료 생성관리 목록 조회 화면
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
            @change="onChangedPerfYm"
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
          :label="$t('MSG_TXT_RSB_TP')"
        >
          <kw-option-group
            v-model="searchParams.rsbTpCd"
            :label="$t('MSG_TXT_RSB_TP')"
            type="radio"
            :options="filterRsbDvCd"
            first-option
            first-option-value=""
            :first-option-label="$t('MSG_TXT_ALL')"
            @change="onChangedRsbTp"
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
            :maxlength="10"
            :on-click-icon="onClickSearchNo"
            :placeholder="$t('MSG_TXT_SEQUENCE_NUMBER')"
          />
          <kw-input
            v-model="searchParams.prtnrKnm"
            :placeholder="$t('MSG_TXT_EMPL_NM')"
            readonly
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_OG_LEVL')">
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevl1Id"
            v-model:og-levl-dv-cd2="searchParams.ogLevl2Id"
            v-model:og-levl-dv-cd3="searchParams.ogLevl3Id"
            :og-tp-cd="searchParams.ogTpCd"
            :base-ym="searchParams.perfYm"
            :start-level="1"
            :end-level="3"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>{{ statTitleText }}</h3>
      <!-- STEPER -->
      <zwfey-fee-step
        ref="stepNaviRef"
        :key="searchParams.perfYm+searchParams.feeSchdTpCd+searchParams.feeTcntDvCd"
        v-model:base-ym="searchParams.perfYm"
        v-model:fee-schd-tp-cd="searchParams.feeSchdTpCd"
        v-model:fee-tcnt-dv-cd="searchParams.feeTcntDvCd"
        v-model:co-cd="searchParams.coCd"
        @click-step="onclickStep"
      />
      <kw-action-top class="mt40">
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!isExcelDown"
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

import { useDataService, useMeta, getComponentType, useGlobal, gridUtil, defineGrid, codeUtil, alert } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import ZwfeyFeeStep from '~sms-common/fee/pages/schedule/ZwfeyFeeStep.vue';
import { openApprovalPopup } from '~common/utils/cmPopupUtil';

const { t } = useI18n();
const { notify, modal, confirm } = useGlobal();
const dataService = useDataService();
const isGrid1Visile = ref(false);
const isGrid2Visile = ref(false);
const isGrid3Visile = ref(true);
const isExcelDown = ref(false);
const { currentRoute } = useRouter();
const router = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const maxDate = dayjs().format('YYYY-MM');
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const stepNaviRef = ref();
const { getUserInfo } = useMeta();
const sessionUserInfo = getUserInfo();
const codes = await codeUtil.getMultiCodes(
  'FEE_TCNT_DV_CD', // 수수료차수구분코드
  'RSB_DV_CD',
  'QLF_DV_CD',
);
const filterRsbDvCd = codes.RSB_DV_CD.filter((v) => ['W0105', 'W0104'].includes(v.codeId));

const searchParams = ref({

  perfYm: now.add(-1, 'month').format('YYYYMM'),
  feeTcntDvCd: '01',
  rsbTpCd: '',
  prtnrNo: '',
  prtnrKnm: '',
  ogLevl1Id: '',
  ogLevl2Id: '',
  ogLevl3Id: '',
  ogTpCd: 'W01',
  feeSchdTpCd: '', // 웰스P조직
  coCd: '2000',
  unitCd: '',

});

const approval = ref({
  gb: 'KST003', /* formId를 식별하는 구분 */
  empno: sessionUserInfo.employeeIDNumber, /* 결재자 사번 */
  formId: '2023000036', /* P조직 품의결재 폼ID */
  appKey: '', /* 업무단에서 해당 결재를 확인할 KEY */
});

const saveInfo = ref({
  perfYm: '',
  ogTpCd: 'W01',
  appKey: '',
  unitCd: '',
});

const statTitleText = computed(() => {
  const { perfYm } = searchParams.value;
  const { rsbTpCd } = searchParams.value;
  let titleText = `${perfYm.substring(0, 4) + t('MSG_TXT_YEAR')} ${perfYm.substring(4, 6)}${t('MSG_TXT_MON')}`;
  if (rsbTpCd !== '') {
    const { codeName } = codes.RSB_DV_CD.find((v) => v.codeId === rsbTpCd);
    titleText += ` ${codeName} ${t('MSG_TXT_PRGS_STE')}`;
  } else {
    titleText += ` ${t('MSG_TXT_PRGS_STE')}`;
  }
  return titleText;
});

let cachedParams;

/*
 *  Event - 번호 검색 아이콘 클릭 이벤트
 */
async function onClickSearchNo() {
  const { perfYm, prtnrNo } = searchParams.value;
  const { result, payload } = await modal({
    component: 'ZwogzMonthPartnerListP',
    componentProps: {
      baseYm: perfYm,
      prtnrNo,
      ogTpCd: 'W01',
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

/*
 *  Event - 그리드 내역 초기화
 */

async function initData() {
  const view = grdMainRef.value.getData();
  view.clearRows();
  totalCount.value = 0;
  stepNaviRef.value.initProps();
  isExcelDown.value = false;
}

/*
 *  Event - 날짜 선택시 초기화※
 */
async function onChangedPerfYm() {
  await initData();
}

/*
 *  Event - 직책유형 선택 시 하단 그리드 변경※
 */
async function onChangedRsbTp() {
  const { rsbTpCd } = searchParams.value;
  if (rsbTpCd === 'W0105') {
    isGrid1Visile.value = true;
    isGrid2Visile.value = false;
    isGrid3Visile.value = false;
    searchParams.value.feeSchdTpCd = '101';
    searchParams.value.unitCd = 'W101';
  } else if (rsbTpCd === 'W0104') {
    isGrid1Visile.value = false;
    isGrid2Visile.value = true;
    isGrid3Visile.value = false;
    searchParams.value.feeSchdTpCd = '102';
    searchParams.value.unitCd = 'W102';
  } else {
    isGrid1Visile.value = false;
    isGrid2Visile.value = false;
    isGrid3Visile.value = true;
    searchParams.value.feeSchdTpCd = '';
  }
  await initData();
}

/*
 *  Event - 이력 관리 버튼 클릭 ※
 */
async function openZwfebFeeHistoryMgtP() {
  const param = {
    feeHistSrnCd: 'W01',
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
  let uri = '';
  if (isGrid2Visile.value === true) {
    uri = '-brmgr';
  } else if (isGrid3Visile.value === true) {
    uri = '-total';
  }
  const view = grdMainRef.value.getView();
  const response = await dataService.get(`/sms/wells/fee/organization-fees/plars${uri}`, { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

/*
 *  Event - 그리드 조회
 */
async function fetchData() {
  let uri = '';
  const { prtnrNo } = searchParams.value;
  stepNaviRef.value.initProps();

  if (isGrid2Visile.value === true) {
    uri = '-brmgr';
  } else if (isGrid3Visile.value === true) {
    uri = '-total';
  }
  const response = await dataService.get(`/sms/wells/fee/organization-fees/plars${uri}`, { params: cachedParams, timeout: 300000 });
  const plarFees = response.data;
  totalCount.value = plarFees.length;
  if (totalCount.value > 0) {
    isExcelDown.value = true;
  } else {
    isExcelDown.value = false;
  }
  if (prtnrNo !== '' && totalCount.value === 0) {
    notify(t('MSG_TXT_RPB_EMPNO_CONF'));
  }
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(plarFees);
}

/*
 *  Event - 조회 버튼 클릭
 */
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

/*
 *  Event - 재실행 클릭
 */
async function onClickRetry(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  if (await confirm(t('MSG_ALT_LV_RESRT'))) {
    await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
    notify(t('MSG_ALT_SAVE_DATA'));
    onClickSearch();
  }
}

/*
 *  Event - 미팅집계 클릭 ※
 */
async function onClickW101P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbTpCd } = searchParams.value;
  const { codeName } = codes.FEE_TCNT_DV_CD.find((v) => v.codeId === feeTcntDvCd);
  if (rsbTpCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W01',
      ogTpCdTxt: 'P추진',
      perfYm,
      perfYmTxt: `${perfYm.substring(0, 4)}-${perfYm.substring(4, 6)}`,
      feeTcntDvCd,
      feeTcntDvCdTxt: codeName,
      rsbTpCd,
    };
    const { result: isChanged } = await modal({
      component: 'WwfeaFeeMeetingAttendanceRegP',
      componentProps: param,
    });
    if (isChanged) {
      await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
      onClickSearch();
    }
  }
}

/*
 *  Event - 수수료생성 클릭
 */
async function onClickW102P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbTpCd } = searchParams.value;
  let feeCalcUnitTpCd;
  if (rsbTpCd === 'W0105') {
    feeCalcUnitTpCd = '101';
  } else {
    feeCalcUnitTpCd = '102';
  }
  const { result: isUploadSuccess } = await modal({
    component: 'WwfebOgFeePlannerRegP',
    componentProps: { perfYm,
      feeCalcUnitTpCd,
      feeTcntDvCd,
    },
  });
  if (isUploadSuccess) {
    await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
    onClickSearch();
  }
}

/*
 *  Event - 기타지원 업로드 클릭
 */
async function onClickW104P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { perfYm, rsbTpCd } = searchParams.value;
  const { result: isUploadSuccess, payload } = await modal({
    component: 'ZwfezXlsUpP',
    componentProps: {
      formatId: 'FOM_FEZ_0022',
      baseYm: perfYm,
      ogTpCd: 'W01',
      type: rsbTpCd,
    },
  });
  if (isUploadSuccess) {
    notify(t('MSG_ALT_SAVED_CNT', [payload.count]));
    await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
    onClickSearch();
  }
}

/*
 *  Event - 세금공제 클릭 ※
 */
async function onClickW105P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbTpCd } = searchParams.value;
  if (rsbTpCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W01',
      ddtnYm: perfYm,
      feeTcntDvCd,
      rsbDvCd: rsbTpCd,
    };
    const { result: isChanged } = await modal({
      component: 'ZwfecFeeTaxDeductionRegP',
      componentProps: param,
    });
    if (isChanged) {
      await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
      onClickSearch();
    }
  }
}

/*
 *  Event - 원천세등록 클릭
 */
async function onClickW106P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { ogTpCd, rsbTpCd, perfYm } = searchParams.value;
  const { result: isUploadSuccess } = await modal({
    component: 'ZwfebFeeCreationWhtxRegP',
    componentProps: {
      perfYm,
      ogTpCd,
      rsbDvCd: rsbTpCd,
    },
  });
  if (isUploadSuccess) {
    await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
    onClickSearch();
  }
}

/*
 *  Event - 고용보험 산출 클릭 ※
 */
async function onClickW107P() {
  await alert('업무 처리 완료 후, \n 좌상단 [완료처리] 버튼을 눌러주세요');
}

/*
 *  Event - 고용보험 공제 클릭 ※
 */
async function onClickW108P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbTpCd } = searchParams.value;
  if (rsbTpCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W01',
      ddtnYm: perfYm,
      feeTcntDvCd,
      rsbDvCd: rsbTpCd,
    };
    const { result: isChanged } = await modal({
      component: 'ZwfecFeeEmpInsuranceRegP',
      componentProps: param,
    });
    if (isChanged) {
      await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
      onClickSearch();
    }
  }
}

/*
 *  Event - 가지급금 공제 클릭 ※
 */
async function onClickW109P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbTpCd } = searchParams.value;
  if (rsbTpCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W01',
      ddtnYm: perfYm,
      feeTcntDvCd,
      rsbDvCd: rsbTpCd,
    };
    const { result: isChanged } = await modal({
      component: 'ZwfecFeePnpyamDeductionRegP',
      componentProps: param,
    });
    if (isChanged) {
      await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
      onClickSearch();
    }
  }
}

/*
 *  Event - 부담공제 클릭 ※
 */
async function onClickW113P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { perfYm, rsbTpCd } = searchParams.value;
  if (rsbTpCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W01',
      perfYm: `${perfYm.substring(0, 4)}-${perfYm.substring(4, 6)}`,
      rsbDvCd: rsbTpCd,
    };
    const { result: isChanged } = await modal({
      component: 'ZwfecFeeBurdenDeductionRegP',
      componentProps: param,
    });
    if (isChanged) {
      await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
      onClickSearch();
    }
  }
}

/*
 *  Event - 보증예치금 적립 클릭 ※
 */
async function onClickW115P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { perfYm, rsbTpCd } = searchParams.value;
  if (rsbTpCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W01',
      perfYm: `${perfYm.substring(0, 4)}-${perfYm.substring(4, 6)}`,
      ocYm: `${perfYm.substring(0, 4)}-${perfYm.substring(4, 6)}`,
      rsbDvCd: rsbTpCd,
    };
    const { result: isChanged } = await modal({
      component: 'ZwfecFeeRdsReservingRegP',
      componentProps: param,
    });
    if (isChanged) {
      await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
      onClickSearch();
    }
  }
}

/*
 *  Event - 이체자료 생성 클릭
 */
async function onClickW116P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { perfYm, ogTpCd, rsbTpCd } = searchParams.value;
  const { result: isUploadSuccess } = await modal({
    component: 'ZwfeeFeeCreationFntIzRegP',
    componentProps: {
      perfYm,
      ogTpCd,
      rsbDvCd: rsbTpCd,
    },
  });
  if (isUploadSuccess) {
    await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
    onClickSearch();
  }
}

/*
 *  Event - 품의작성 클릭 ※TBD
 */
async function onClickW118P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { unitCd, perfYm, ogTpCd } = searchParams.value;
  cachedParams = cloneDeep(searchParams.value);
  const response = await dataService.get('/sms/common/fee/fee-approval/dsb-cnst-status', { params: cachedParams }); /* 품의진행상태 조회 */
  const resData = response.data;
  approval.value.appKey = perfYm + ogTpCd + unitCd + dayjs().format('YYYYMMDDHHmmss'); /* 6자리+3자리+4자리+ 14자리 = 27 appKey 생성 */
  const params = approval.value;
  saveInfo.value.appKey = approval.value.appKey;
  saveInfo.value.perfYm = perfYm;
  saveInfo.value.unitCd = unitCd;
  if (resData.dsbCnstYn === 'Y') {
    await notify(t('MSG_ALT_PMT_BEEN_APRV')); /* 결재가 승인 되었습니다 > NEXT STEP */
    await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
    onClickSearch();
  } else if (resData.dsbCnstYn === 'N') {
    await notify(t('MSG_ALT_CHK_IN_PRGS')); /* 결재가 진행중입니다 */
  } else if (resData.dsbCnstYn === 'P') { /* 이전 품의 반송, 회수 등의 이유로 재결재 */
    if (await confirm(t('MSG_ALT_PROC_TO_CHK'))) { /* 결재를 진행하시겠습니까? > Kportal popup */
      await dataService.post('/sms/common/fee/fee-approval/dsb-cnst-update', saveInfo.value); /* 이전 품의결재 이력 최종여부 N 수정 */
      await openApprovalPopup(params); /* Kportal popup */
    }
  } else if (await confirm(t('MSG_ALT_PROC_TO_CHK'))) { /* 결재를 진행하시겠습니까? > Kportal popup */
    await openApprovalPopup(params); /* Kportal popup */
  }
}

/*
 *  Event - 전표생성 클릭 ※TBD
 */
async function onClickW119P() {
  const { perfYm, ogTpCd, rsbTpCd } = searchParams.value;
  router.push({
    path: '/fee/zwfee-fee-slip-publication-list',
    query: {
      baseYm: perfYm,
      ogTpCd,
      rsbDvCd: rsbTpCd,
    },
  });
}

/*
 *  Event - 선급판매 수수료확정 클릭 ※팝업 개발 미완료 상태
*/

async function onClickW120P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { result: isUploadSuccess } = await modal({
    component: 'WwfebAdvancePaymentFeeConfirmP',
    componentProps: { feeSchdId },
  });
  if (isUploadSuccess) {
    await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
    onClickSearch();
  }
}

/**
 * Event - 스텝퍼 클릭
 * 버튼 로직 존재시 해당 로직 서술
 * @params code[String]: 스탭퍼에서 선택한 단계 코드
 *         done[Boolean]: 이전단계로 되돌림 플레그
 */
async function onclickStep(params) {
  if (params.done) {
    await onClickRetry(params.feeSchdId, params.code, '02');
  } else if (params.code === 'W0101') { // 미팅참석 집계
    await onClickW101P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0102') { // 수수료 생성
    await onClickW102P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0104') { // 기타지원 업로드
    await onClickW104P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0105') { // 세금공제
    await onClickW105P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0106') { // 원천세 생성
    await onClickW106P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0107' || params.code === 'W0110' || params.code === 'W0112' || params.code === 'W0114') {
    await onClickW107P();
  } else if (params.code === 'W0108') { // 고용보험 공제
    await onClickW108P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0109') { // 가지급금 공제 생성
    await onClickW109P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0113') { // 부담공제 생성
    await onClickW113P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0115') { // 보증예치금 적립
    await onClickW115P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0116') { // 이체자료 생성
    await onClickW116P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0118') { // 품의작성
    await onClickW118P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0119') { // 전표생성
    await onClickW119P();
  } else if (params.code === 'W0120') { // 선급판매 수수료 확정
    await onClickW120P(params.feeSchdId, params.code, '03');
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
    { fieldName: 'jagyuk' },
    { fieldName: 'nJagyuk1' },
    { fieldName: 'is11edu' },
    { fieldName: 'is17edu' },
    { fieldName: 'fstCntrDt' },
    { fieldName: 'cntrDt' },
    { fieldName: 'rcntrDt' },
    { fieldName: 'fnlCltnDt' },
    { fieldName: 'cltnDt' },
    { fieldName: 'akstym' },
    { fieldName: 'lcecaymd' },
    { fieldName: 'bAksd05', dataType: 'number' },
    { fieldName: 'akcda0', dataType: 'number' },
    { fieldName: 'akcda1', dataType: 'number' },
    { fieldName: 'akcda2', dataType: 'number' },
    { fieldName: 'aksq01', dataType: 'number' },
    { fieldName: 'nAksq01', dataType: 'number' },
    { fieldName: 'akcda3', dataType: 'number' },
    { fieldName: 'akcda4', dataType: 'number' },
    { fieldName: 'akdeq5', dataType: 'number' },
    { fieldName: 'ec5amt', dataType: 'number' },
    { fieldName: 'mproduct', dataType: 'number' },
    { fieldName: 'aksd23', dataType: 'number' },
    { fieldName: 'aksd24', dataType: 'number' },
    { fieldName: 'aksd25', dataType: 'number' },
    { fieldName: 'aksd01', dataType: 'number' },
    { fieldName: 'aksd02', dataType: 'number' },
    { fieldName: 'aksd03', dataType: 'number' },
    { fieldName: 'aksd21', dataType: 'number' },
    { fieldName: 'aksd04', dataType: 'number' },
    { fieldName: 'aksd05', dataType: 'number' },
    { fieldName: 'aksd20', dataType: 'number' },
    { fieldName: 'aksd30', dataType: 'number' },
    { fieldName: 'aksd99', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'ogNm',
      header: t('MSG_TXT_BLG'),
      width: '88.7',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'), // 합계
        styleName: 'text-center',
      } },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '88.7', styleName: 'text-center', options: codes.RSB_DV_CD },
    { fieldName: 'akcuil', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '88.7', styleName: 'text-right' },
    { fieldName: 'jagyuk', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '110.6', styleName: 'text-center', options: codes.QLF_DV_CD },
    { fieldName: 'nJagyuk1', header: `M+1${t('MSG_TXT_TOPMR_PLAR')}`, width: '128.4', styleName: 'text-center', options: codes.QLF_DV_CD },
    { fieldName: 'is11edu', header: t('MSG_TXT_PLAR_SRTUP'), width: '124.6', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'is17edu', header: t('MSG_TXT_TOPMR') + t('MSG_TXT_PRTIC'), width: '114.8', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'fstCntrDt', header: t('MSG_TXT_RGS') + t('MSG_TXT_BASE_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'cntrDt', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'rcntrDt', header: t('MSG_TXT_RETR') + t('MSG_TXT_MON'), width: '97.3', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'fnlCltnDt', header: t('MSG_TXT_FNL_CLTN_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'cltnDt', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'akstym', header: t('MSG_TXT_UPGR_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'lcecaymd', header: t('MSG_TXT_WELS_MNGER') + t('MSG_TXT_OPNG_DT'), width: '132.8', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'bAksd05',
      header: t('MSG_TXT_STMNT') + t('MSG_TXT_FEE'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akcda0',
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_PERF'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akcda1',
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PERF'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akcda2',
      header: t('MSG_TXT_CHNG'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksq01',
      header: t('MSG_TXT_MUTU') + t('MSG_TXT_THM'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'nAksq01',
      header: t('MSG_TXT_MUTU') + t('MSG_TXT_KEEP'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akcda3',
      header: t('MSG_TXT_ENVR'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akcda4',
      header: t('MSG_TXT_ENVR') + t('MSG_TXT_EXCP'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akdeq5',
      header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'ec5amt',
      header: t('MSG_TXT_HOME_CARE') + t('TXT_MSG_SELL_PRC'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'mproduct',
      header: t('MSG_TXT_MGT') + t('MSG_TXT_PRDT') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd23',
      header: t('MSG_TXT_FXAM') + t('MSG_TXT_FEE'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd24',
      header: t('MSG_TXT_LIVE_PAKG'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd25',
      header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_MEMBERSHIP'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd01',
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_INDV') + t('MSG_TXT_PRPN'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd02',
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_INDV') + t('MSG_TXT_PRPN'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd03',
      header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd21',
      header: t('MSG_TXT_MUTU') + t('MSG_TXT_FEE'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd04',
      header: t('MSG_TXT_METG') + t('MSG_TXT_FEE'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd05',
      header: t('MSG_TXT_STMNT'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd20',
      header: t('MSG_TXT_ADSB'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd30',
      header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd99',
      header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    {
      column: 'ogNm',
      summaryUserSpans: [{ colspan: 16 }],
    }, 'prtnrNo', 'prtnrKnm', 'rsbDvCd', 'akcuil',
    {
      header: t('MSG_TXT_QLF'),
      direction: 'horizontal',
      items: ['jagyuk', 'nJagyuk1'],
    },
    'is11edu', 'is17edu', 'fstCntrDt', 'cntrDt', 'rcntrDt', 'fnlCltnDt', 'cltnDt', 'akstym', 'lcecaymd', 'bAksd05',
    {
      header: t('MSG_TXT_INDV_PERF'),
      direction: 'horizontal',
      items: ['akcda0', 'akcda1', 'akcda2'],
    },
    {
      header: t('MSG_TXT_INDV') + t('MSG_TXT_MUTU') + t('MSG_TXT_PERF'),
      direction: 'horizontal',
      items: ['aksq01', 'nAksq01'],
    },
    {
      header: t('MSG_TXT_FXAM'),
      direction: 'horizontal',
      items: ['akcda3', 'akcda4'],
    },
    'akdeq5', 'ec5amt', 'mproduct', 'aksd23', 'aksd24', 'aksd25', 'aksd01', 'aksd02', 'aksd03', 'aksd21', 'aksd04', 'aksd05', 'aksd20', 'aksd30', 'aksd99',
  ]);

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'rsbDvCd' },
    { fieldName: 'jagyuk' },
    { fieldName: 'nJagyuk1' },
    { fieldName: 'fstCntrDt' },
    { fieldName: 'cntrDt' },
    { fieldName: 'fnlCltnDt' },
    { fieldName: 'cltnDt' },
    { fieldName: 'runcnt' },
    { fieldName: 'gadcnt' },
    { fieldName: 'is17edu' },
    { fieldName: 'akdriy' },
    { fieldName: 'akstym' },
    { fieldName: 'lcecaymd' },
    { fieldName: 'bAksd05', dataType: 'number' },
    { fieldName: 'akcda0', dataType: 'number' },
    { fieldName: 'akcda1', dataType: 'number' },
    { fieldName: 'akcda2', dataType: 'number' },
    { fieldName: 'aksq01', dataType: 'number' },
    { fieldName: 'nAksq01', dataType: 'number' },
    { fieldName: 'akcdag0', dataType: 'number' },
    { fieldName: 'akcdag1', dataType: 'number' },
    { fieldName: 'aksqg02', dataType: 'number' },
    { fieldName: 'akcda3', dataType: 'number' },
    { fieldName: 'akcda4', dataType: 'number' },
    { fieldName: 'akdeq5', dataType: 'number' },
    { fieldName: 'ec5amt', dataType: 'number' },
    { fieldName: 'mproduct', dataType: 'number' },
    { fieldName: 'aksd23', dataType: 'number' },
    { fieldName: 'aksd24', dataType: 'number' },
    { fieldName: 'aksd25', dataType: 'number' },
    { fieldName: 'aksd01', dataType: 'number' },
    { fieldName: 'aksd02', dataType: 'number' },
    { fieldName: 'aksd03', dataType: 'number' },
    { fieldName: 'aksd11', dataType: 'number' },
    { fieldName: 'aksd12', dataType: 'number' },
    { fieldName: 'aksd13', dataType: 'number' },
    { fieldName: 'aksd05', dataType: 'number' },
    { fieldName: 'aksd16', dataType: 'number' },
    { fieldName: 'aksd17', dataType: 'number' },
    { fieldName: 'aksd15', dataType: 'number' },
    { fieldName: 'aksd18', dataType: 'number' },
    { fieldName: 'aksd20', dataType: 'number' },
    { fieldName: 'aksd21', dataType: 'number' },
    { fieldName: 'aksd22', dataType: 'number' },
    { fieldName: 'aksd30', dataType: 'number' },
    { fieldName: 'aksd99', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'ogNm',
      header: t('MSG_TXT_BLG'),
      width: '88.7',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'), // 합계
        styleName: 'text-center',
      } },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '88.7', styleName: 'text-center', options: codes.RSB_DV_CD },
    { fieldName: 'jagyuk', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '88.7', styleName: 'text-right', options: codes.QLF_DV_CD },
    { fieldName: 'nJagyuk1', header: 'M+1', width: '110.6', styleName: 'text-center', options: codes.QLF_DV_CD },
    { fieldName: 'fstCntrDt', header: t('MSG_TXT_RGS') + t('MSG_TXT_BASE_MM'), width: '128.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'cntrDt', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '124.6', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'fnlCltnDt', header: t('MSG_TXT_FNL_CLTN_MM'), width: '114.8', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'cltnDt', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'runcnt', header: t('MSG_TXT_ACL_ACTI_PPL'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'gadcnt', header: t('MSG_TXT_OPTN_PPL'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'is17edu', header: t('MSG_TXT_TOPMR') + t('MSG_TXT_PRTIC'), width: '97.3', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'akdriy', header: t('MSG_TXT_PRFMT_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'akstym', header: t('MSG_TXT_UPGR_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'lcecaymd', header: t('MSG_TXT_WELS_MNGER') + t('MSG_TXT_OPNG_DT'), width: '122.7', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'bAksd05',
      header: t('MSG_TXT_STMNT') + t('MSG_TXT_FEE'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akcda0',
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_PERF'),
      width: '132.8',
      styleName: 'text-center',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akcda1',
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PERF'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akcda2',
      header: t('MSG_TXT_CHNG'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksq01',
      header: t('MSG_TXT_MUTU') + t('MSG_TXT_THM'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'nAksq01',
      header: t('MSG_TXT_MUTU') + t('MSG_TXT_KEEP'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akcdag0',
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_PERF'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akcdag1',
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PERF'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksqg02',
      header: t('MSG_TXT_BRANCH') + t('MSG_TXT_MUTU') + t('MSG_TXT_PERF'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akcda3',
      header: t('MSG_TXT_ENVR'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akcda4',
      header: t('MSG_TXT_ENVR') + t('MSG_TXT_EXCP'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akdeq5',
      header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'ec5amt',
      header: t('MSG_TXT_HOME_CARE') + t('TXT_MSG_SELL_PRC'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'mproduct',
      header: t('MSG_TXT_MGT') + t('MSG_TXT_PRDT') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd23',
      header: t('MSG_TXT_FXAM') + t('MSG_TXT_FEE'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd24',
      header: t('MSG_TXT_LIVE_PAKG'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd25',
      header: t('MSG_TXT_HOME_CARE'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd01',
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_INDV') + t('MSG_TXT_PRPN'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd02',
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_INDV') + t('MSG_TXT_PRPN'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd03',
      header: t('MSG_TXT_INDV') + t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd11',
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_PRPN'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd12',
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd13',
      header: t('MSG_TXT_OG') + t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd05',
      header: t('MSG_TXT_STMNT') + t('MSG_TXT_FEE'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd16',
      header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}1`,
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd17',
      header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}2`,
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd15',
      header: t('MSG_TXT_NB') + t('MSG_TXT_BRANCH'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd18',
      header: t('MSG_TXT_PRFMT_FEE'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd20',
      header: t('MSG_TXT_ADSB'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd21',
      header: t('MSG_TXT_INDV') + t('MSG_TXT_MUTU') + t('MSG_TXT_FEE'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd22',
      header: t('MSG_TXT_BRANCH') + t('MSG_TXT_MUTU') + t('MSG_TXT_FEE'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd30',
      header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd99',
      header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    {
      column: 'ogNm',
      summaryUserSpans: [{ colspan: 16 }],
    },
    'prtnrNo', 'prtnrKnm', 'rsbDvCd',
    {
      header: t('MSG_TXT_QLF'),
      direction: 'horizontal',
      items: ['jagyuk', 'nJagyuk1'],
    },
    'fstCntrDt', 'cntrDt', 'fnlCltnDt', 'cltnDt', 'runcnt', 'gadcnt', 'is17edu', 'akdriy', 'akstym', 'lcecaymd', 'bAksd05',
    {
      header: t('MSG_TXT_INDV_PERF'),
      direction: 'horizontal',
      items: ['akcda0', 'akcda1', 'akcda2'],
    },
    {
      header: t('MSG_TXT_INDV') + t('MSG_TXT_MUTU') + t('MSG_TXT_PERF'),
      direction: 'horizontal',
      items: ['aksq01', 'nAksq01'],
    },
    {
      header: t('MSG_TXT_BRANCH') + t('MSG_TXT_PERF'),
      direction: 'horizontal',
      items: ['akcdag0', 'akcdag1'],
    },
    'aksqg02',
    {
      header: t('MSG_TXT_FXAM'),
      direction: 'horizontal',
      items: ['akcda3', 'akcda4'],
    },
    'akdeq5', 'ec5amt', 'mproduct', 'aksd23', 'aksd24', 'aksd25', 'aksd01', 'aksd02', 'aksd03', 'aksd11', 'aksd12', 'aksd13', 'aksd05', 'aksd16', 'aksd17', 'aksd15', 'aksd18', 'aksd20', 'aksd21', 'aksd22', 'aksd30', 'aksd99',

  ]);

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });
});

const initGrd3Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'rsbDvCd' },
    { fieldName: 'akcuil' },
    { fieldName: 'jagyuk' },
    { fieldName: 'nJagyuk1' },
    { fieldName: 'is11edu' },
    { fieldName: 'is17edu' },
    { fieldName: 'fstCntrDt' },
    { fieldName: 'cntrDt' },
    { fieldName: 'rcntrDt' },
    { fieldName: 'fnlCltnDt' },
    { fieldName: 'cltnDt' },
    { fieldName: 'lcecaymd' },
    { fieldName: 'runcnt', dataType: 'number' },
    { fieldName: 'gadcnt', dataType: 'number' },
    { fieldName: 'akstym' },
    { fieldName: 'akdriy' },
    { fieldName: 'bAksd05', dataType: 'number' },
    { fieldName: 'akcda0', dataType: 'number' },
    { fieldName: 'akcda1', dataType: 'number' },
    { fieldName: 'akcda2', dataType: 'number' },
    { fieldName: 'aksq01', dataType: 'number' },
    { fieldName: 'nAksq01', dataType: 'number' },
    { fieldName: 'akcdag0', dataType: 'number' },
    { fieldName: 'akcdag1', dataType: 'number' },
    { fieldName: 'aksqg02', dataType: 'number' },
    { fieldName: 'akcda3', dataType: 'number' },
    { fieldName: 'akcda4', dataType: 'number' },
    { fieldName: 'akdeq5', dataType: 'number' },
    { fieldName: 'ec5amt', dataType: 'number' },
    { fieldName: 'mproduct', dataType: 'number' },
    { fieldName: 'aksd23', dataType: 'number' },
    { fieldName: 'aksd24', dataType: 'number' },
    { fieldName: 'aksd25', dataType: 'number' },
    { fieldName: 'aksd01', dataType: 'number' },
    { fieldName: 'aksd02', dataType: 'number' },
    { fieldName: 'aksd03', dataType: 'number' },
    { fieldName: 'aksd21', dataType: 'number' },
    { fieldName: 'aksd11', dataType: 'number' },
    { fieldName: 'aksd12', dataType: 'number' },
    { fieldName: 'aksd13', dataType: 'number' },
    { fieldName: 'aksd22', dataType: 'number' },
    { fieldName: 'aksd04', dataType: 'number' },
    { fieldName: 'aksd05', dataType: 'number' },
    { fieldName: 'aksd16', dataType: 'number' },
    { fieldName: 'aksd17', dataType: 'number' },
    { fieldName: 'aksd15', dataType: 'number' },
    { fieldName: 'aksd18', dataType: 'number' },
    { fieldName: 'aksd20', dataType: 'number' },
    { fieldName: 'aksd30', dataType: 'number' },
    { fieldName: 'aksd99', dataType: 'number' },
    { fieldName: 'ddctam', dataType: 'number' },
    { fieldName: 'dsbOjAmt', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'ogNm',
      header: t('MSG_TXT_BLG'),
      width: '88.7',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'), // 합계
        styleName: 'text-center',
      } },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '88.7', styleName: 'text-center', options: codes.RSB_DV_CD },
    { fieldName: 'akcuil', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '88.7', styleName: 'text-right' },
    { fieldName: 'jagyuk', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '110.6', styleName: 'text-center', options: codes.QLF_DV_CD },
    { fieldName: 'nJagyuk1', header: 'M+1', width: '128.4', styleName: 'text-center', options: codes.QLF_DV_CD },
    { fieldName: 'is11edu', header: t('MSG_TXT_PLAR_SRTUP'), width: '124.6', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'is17edu', header: t('MSG_TXT_TOPMR') + t('MSG_TXT_PRTIC'), width: '114.8', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'fstCntrDt', header: t('MSG_TXT_RGS') + t('MSG_TXT_BASE_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'cntrDt', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'rcntrDt', header: t('MSG_TXT_RETR') + t('MSG_TXT_MON'), width: '97.3', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'fnlCltnDt', header: t('MSG_TXT_FNL_CLTN_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'cltnDt', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'lcecaymd', header: t('MSG_TXT_WELS_MNGER') + t('MSG_TXT_OPNG_DT'), width: '122.7', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'runcnt', header: t('MSG_TXT_ACL_ACTI_PPL'), width: '132.8', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'gadcnt', header: t('MSG_TXT_OPTN_PPL'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akstym', header: t('MSG_TXT_UPGR_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'akdriy', header: t('MSG_TXT_PRFMT_MON'), width: '136.8', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'bAksd05',
      header: t('MSG_TXT_STMNT') + t('MSG_TXT_FEE'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akcda0',
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_PERF'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akcda1',
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PERF'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akcda2',
      header: t('MSG_TXT_CHNG'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksq01',
      header: t('MSG_TXT_MUTU') + t('MSG_TXT_THM'),
      width: '136.8',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'nAksq01',
      header: t('MSG_TXT_MUTU') + t('MSG_TXT_KEEP'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akcdag0',
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_PERF'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akcdag1',
      header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PERF'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksqg02',
      header: t('MSG_TXT_MUTU') + t('MSG_TXT_PERF'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akcda3',
      header: t('MSG_TXT_ENVR'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akcda4',
      header: t('MSG_TXT_ENVR') + t('MSG_TXT_EXCP'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'akdeq5',
      header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'ec5amt',
      header: t('MSG_TXT_HOME_CARE') + t('TXT_MSG_SELL_PRC'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'mproduct',
      header: t('MSG_TXT_MGT') + t('MSG_TXT_PRDT') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd23',
      header: t('MSG_TXT_FXAM') + t('MSG_TXT_FEE'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd24',
      header: t('MSG_TXT_LIVE_PAKG'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd25',
      header: t('MSG_TXT_HOME_CARE'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd01',
      header: t('MSG_TXT_INDV') + t('MSG_TXT_ELHM') + t('MSG_TXT_PRPN'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd02',
      header: t('MSG_TXT_INDV') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd03',
      header: t('MSG_TXT_INDV') + t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd21',
      header: t('MSG_TXT_INDV') + t('MSG_TXT_MUTU'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd11',
      header: t('MSG_TXT_OG') + t('MSG_TXT_ELHM') + t('MSG_TXT_PRPN'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd12',
      header: t('MSG_TXT_OG') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd13',
      header: t('MSG_TXT_OG') + t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd22',
      header: t('MSG_TXT_OG') + t('MSG_TXT_MUTU'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd04',
      header: t('MSG_TXT_METG') + t('MSG_TXT_FEE'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd05',
      header: t('MSG_TXT_STMNT'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd16',
      header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}1`,
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd17',
      header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}2`,
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd15',
      header: t('MSG_TXT_NB') + t('MSG_TXT_BRANCH'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd18',
      header: t('MSG_TXT_PRFMT_FEE'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd20',
      header: t('MSG_TXT_ADSB'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd30',
      header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'aksd99',
      header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'ddctam',
      header: t('MSG_TXT_DDTN_SUM'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'dsbOjAmt',
      header: t('MSG_TXT_ACL_DSB_AMT'),
      width: '122.7',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    {
      column: 'ogNm',
      summaryUserSpans: [{ colspan: 16 }],
    }, 'prtnrNo', 'prtnrKnm', 'rsbDvCd', 'akcuil',
    {
      header: t('MSG_TXT_QLF'),
      direction: 'horizontal',
      items: ['jagyuk', 'nJagyuk1'],
    },
    'is11edu', 'is17edu', 'fstCntrDt', 'cntrDt', 'rcntrDt', 'fnlCltnDt', 'cltnDt', 'lcecaymd', 'runcnt', 'gadcnt', 'akstym', 'akdriy', 'bAksd05',
    {
      header: t('MSG_TXT_INDV_PERF'),
      direction: 'horizontal',
      items: ['akcda0', 'akcda1', 'akcda2', 'aksq01', 'nAksq01'],
    },
    {
      header: t('MSG_TXT_BRANCH') + t('MSG_TXT_PERF'),
      direction: 'horizontal',
      items: ['akcdag0', 'akcdag1', 'aksqg02'],
    },
    {
      header: t('MSG_TXT_FXAM'),
      direction: 'horizontal',
      items: ['akcda3', 'akcda4'],
    },
    'akdeq5', 'ec5amt', 'mproduct', 'aksd23', 'aksd24', 'aksd25',
    {
      header: t('MSG_TXT_INDV') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['aksd01', 'aksd02', 'aksd03', 'aksd21'],
    },
    {
      header: t('MSG_TXT_OG') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['aksd11', 'aksd12', 'aksd13', 'aksd22'],
    },
    'aksd04', 'aksd05', 'aksd16', 'aksd17', 'aksd15', 'aksd18', 'aksd20', 'aksd30', 'aksd99', 'ddctam', 'dsbOjAmt',
  ]);

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });
});

</script>

<style scoped>
</style>
