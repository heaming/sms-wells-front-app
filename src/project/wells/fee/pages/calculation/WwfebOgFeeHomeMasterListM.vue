<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID :  - 홈마스터 수수료 생성관리
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
            @change="onChangedRsbDv"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_OG_LEVL')">
          <zwog-level-select
            v-model:og-levl-dv-cd2="searchParams.ogLevl2Id"
            v-model:og-levl-dv-cd3="searchParams.ogLevl3Id"
            :og-tp-cd="searchParams.ogTpCd"
            :base-ym="searchParams.perfYm"
            :start-level="2"
            :end-level="3"
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
          />
          <kw-input
            v-model="searchParams.prtnrKnm"
            :placeholder="$t('MSG_TXT_EMPL_NM')"
            readonly
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <h3>{{ searchParams.statTitleText }}</h3>
        </template>
      </kw-action-top>
      <!-- STEPER -->
      <zwfey-fee-step
        ref="stepNaviRef"
        :key="searchParams.perfYm+searchParams.feeTcntDvCd"
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
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';

import { useDataService, useMeta, getComponentType, gridUtil, useGlobal, defineGrid, codeUtil, alert } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import ZwfeyFeeStep from '~sms-common/fee/pages/schedule/ZwfeyFeeStep.vue';
import { openApprovalPopup } from '~common/utils/cmPopupUtil';

const { t } = useI18n();
const dataService = useDataService();
const { notify, modal, confirm } = useGlobal();
const isGrid1Visile = ref(true);
const isGrid2Visile = ref(false);
const isExcelDown = ref(false);
const { getUserInfo } = useMeta();
const sessionUserInfo = getUserInfo();
const { currentRoute } = useRouter();
const router = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const stepNaviRef = ref();

const codes = await codeUtil.getMultiCodes(
  'FEE_TCNT_DV_CD', // 수수료차수구분코드
  'RSB_DV_CD',
);
const filterRsbDvCd = codes.RSB_DV_CD.filter((v) => ['W0302', 'W0301'].includes(v.codeId));
const searchParams = ref({

  perfYm: now.add(-1, 'month').format('YYYYMM'),
  feeTcntDvCd: '01',
  rsbTpCd: 'W0302',
  rsbTpTxt: '',
  prtnrNo: '',
  ogLevl2Id: '',
  ogLevl3Id: '',
  prtnrKnm: '',
  ogTpCd: 'W03',
  statTitleText: t('MSG_TXT_PRGS_STE'),
  feeSchdTpCd: '301',
  coCd: '2000',
  unitCd: 'W301',

});

const approval = ref({
  gb: 'KST002', /* formId를 식별하는 구분 */
  empno: sessionUserInfo.employeeIDNumber, /* 결재자 사번 */
  formId: '2023000024', /* 홈마스터 조직 품의결재 폼ID 10자리 */
  appKey: '', /* 업무단에서 해당 결재를 확인할 KEY */
});

const saveInfo = ref({
  perfYm: '',
  ogTpCd: 'W03',
  appKey: '',
  unitCd: 'W301',
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

/*
 *  Event - 조회 후 상단 title 변경
 */
async function setTitle() {
  const { perfYm, rsbTpCd } = searchParams.value;
  searchParams.value.statTitleText = `${perfYm.substring(0, 4) + t('MSG_TXT_YEAR')} ${perfYm.substring(4, 6)}${t('MSG_TXT_MON')}`;
  if (rsbTpCd !== '') {
    const { codeName } = codes.RSB_DV_CD.find((v) => v.codeId === rsbTpCd);
    searchParams.value.rsbTpTxt = codeName;
    searchParams.value.statTitleText += ` ${codeName} ${t('MSG_TXT_PRGS_STE')}`;
  } else {
    searchParams.value.rsbTpTxt = '';
    searchParams.value.statTitleText += ` ${t('MSG_TXT_PRGS_STE')}`;
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
  await setTitle();
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
async function onChangedRsbDv() {
  const { rsbTpCd } = searchParams.value;
  if (rsbTpCd === 'W0302') {
    isGrid1Visile.value = true;
    isGrid2Visile.value = false;
  } else {
    isGrid1Visile.value = false;
    isGrid2Visile.value = true;
  }
  await initData();
}

/*
 *  Event - 이력 관리 버튼 클릭 ※
 */
async function openZwfebFeeHistoryMgtP() {
  const param = {
    feeHistSrnCd: 'W03',
  };
  await modal({
    component: 'ZwfebFeeHistoryMgtP',
    componentProps: param,
  });
}

async function onClickExcelDownload() {
  let uri = '';
  cachedParams = cloneDeep(searchParams.value);
  stepNaviRef.value.initProps();

  if (isGrid2Visile.value === true) {
    uri = '-brmgr';
  }
  const view = grdMainRef.value.getView();
  const response = await dataService.get(`/sms/wells/fee/organization-fees/hmsts${uri}`, { params: cachedParams });

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
  stepNaviRef.value.initProps();

  if (isGrid2Visile.value === true) {
    uri = '-brmgr';
  }
  const response = await dataService.get(`/sms/wells/fee/organization-fees/hmsts${uri}`, { params: cachedParams, timeout: 300000 });
  const hmstFees = response.data;
  totalCount.value = hmstFees.length;
  if (totalCount.value > 0) {
    isExcelDown.value = true;
  } else {
    isExcelDown.value = false;
  }
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(hmstFees);
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
 *  Event - 수수료생성 클릭
 */
async function onClickW301P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbTpCd } = searchParams.value;
  let feeCalcUnitTpCd;
  if (rsbTpCd === 'W0302') {
    feeCalcUnitTpCd = '301';
  } else {
    feeCalcUnitTpCd = '302';
  }
  const { result: isUploadSuccess } = await modal({
    component: 'WwfebOgFeeHomeMasterRegP',
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
 *  Event - 기타지원 업로드 클릭 ※업무개발에서 별도개발
 */
async function onClickW302P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { perfYm, rsbTpCd } = searchParams.value;
  const { result: isUploadSuccess, payload } = await modal({
    component: 'ZwfezXlsUpP',
    componentProps: {
      formatId: 'FOM_FEZ_0025',
      baseYm: perfYm,
      ogTpCd: 'W03',
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
async function onClickW303P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbTpCd } = searchParams.value;
  if (rsbTpCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W03',
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
async function onClickW304P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { perfYm, ogTpCd, rsbTpCd } = searchParams.value;
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
async function onClickW305P() {
  await alert('업무 처리 완료 후, \n 좌상단 [완료처리] 버튼을 눌러주세요');
}

/*
 *  Event - 고용보험 공제 클릭 ※
 */
async function onClickW306P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbTpCd } = searchParams.value;
  if (rsbTpCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W03',
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
async function onClickW307P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbTpCd } = searchParams.value;
  if (rsbTpCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W03',
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
async function onClickW311P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { perfYm, rsbTpCd } = searchParams.value;
  if (rsbTpCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W03',
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
async function onClickW313P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { perfYm, rsbTpCd } = searchParams.value;
  if (rsbTpCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W03',
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
 *  Event - 이체자료 생성 클릭 ※팝업 개발 미완료 상태
 */
async function onClickW314P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
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
async function onClickW316P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
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
async function onClickW317P() {
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
 *  Event - 선급판매 수수료확정 클릭
*/

async function onClickW318P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { result: isUploadSuccess } = await modal({
    component: 'WwfebAdvancePaymentFeeConfirmP',
    componentProps: { feeSchdId },
  });
  if (isUploadSuccess) {
    await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
    onClickSearch();
  }
}

/*
 *  Event - 교육집계 클릭 ※
 */
async function onClickW320P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbTpCd } = searchParams.value;
  const { codeName } = codes.FEE_TCNT_DV_CD.find((v) => v.codeId === searchParams.value.feeTcntDvCd);
  if (rsbTpCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W03',
      ogTpCdTxt: '홈마스터',
      perfYm,
      perfYmTxt: `${perfYm.substring(0, 4)}-${perfYm.substring(4, 6)}`,
      feeTcntDvCd,
      feeTcntDvCdTxt: codeName,
      rsbTpCd,
    };
    const { result: isChanged } = await modal({
      component: 'WwfeaFeeEducationAttendanceRegP',
      componentProps: param,
    });
    if (isChanged) {
      await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
      onClickSearch();
    }
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
  } else if (params.code === 'W0301') { // 수수료 생성
    await onClickW301P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0302') { // 기타지원 업로드
    await onClickW302P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0303') { // 세금공제
    await onClickW303P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0304') { // 원천세 생성
    await onClickW304P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0305' || params.code === 'W0308' || params.code === 'W0310' || params.code === 'W0312') {
    await onClickW305P();
  } else if (params.code === 'W0306') { // 고용보험 공제
    await onClickW306P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0307') { // 가지급금 공제 생성
    await onClickW307P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0311') { // 부담공제 생성
    await onClickW311P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0313') { // 보증예치금 적립
    await onClickW313P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0314') { // 이체자료 생성
    await onClickW314P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0316') { // 품의작성
    await onClickW316P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0317') { // 전표생성
    await onClickW317P();
  } else if (params.code === 'W0318') { // 선급판매 수수료 확정
    await onClickW318P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0320') { // 교육집계
    await onClickW320P(params.feeSchdId, params.code, '03');
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd1Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dgr2LevlOgNm' },
    { fieldName: 'dgr3LevlOgNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'rsbDvCd' },
    { fieldName: 'akdsym' },
    { fieldName: 'akdcha', dataType: 'number' },
    { fieldName: 'prtnrGdCd', dataType: 'number' },
    { fieldName: 'edu100', dataType: 'number' },
    { fieldName: 'akcda10', dataType: 'number' },
    { fieldName: 'akcda12', dataType: 'number' },
    { fieldName: 'akcda14', dataType: 'number' },
    { fieldName: 'akcda13', dataType: 'number' },
    { fieldName: 'akcda15', dataType: 'number' },
    { fieldName: 'akcda11', dataType: 'number' },
    { fieldName: 'akcda19', dataType: 'number' },
    { fieldName: 'dedeq3', dataType: 'number' },
    { fieldName: 'akdeq0', dataType: 'number' },
    { fieldName: 'lccnt1', dataType: 'number' },
    { fieldName: 'cLccnt1', dataType: 'number' },
    { fieldName: 'rLccnt1', dataType: 'number' },
    { fieldName: 'gdSercnt', dataType: 'number' },
    { fieldName: 'elecnt', dataType: 'number' },
    { fieldName: 'nelecnt', dataType: 'number' },
    { fieldName: 'sercnt', dataType: 'number' },
    { fieldName: 'serryl', dataType: 'number' },
    { fieldName: 'aksd01', dataType: 'number' },
    { fieldName: 'aksd03', dataType: 'number' },
    { fieldName: 'aksd04', dataType: 'number' },
    { fieldName: 'aksd15', dataType: 'number' },
    { fieldName: 'aksd05', dataType: 'number' },
    { fieldName: 'aksd06', dataType: 'number' },
    { fieldName: 'aksd07', dataType: 'number' },
    { fieldName: 'aksd09', dataType: 'number' },
    { fieldName: 'aksd10', dataType: 'number' },
    { fieldName: 'aksd11', dataType: 'number' },
    { fieldName: 'aksd13', dataType: 'number' },
    { fieldName: 'aksd14', dataType: 'number' },
    { fieldName: 'aksd16', dataType: 'number' },
    { fieldName: 'intbsSum', dataType: 'number' },
    { fieldName: 'ddtnSum', dataType: 'number' },
    { fieldName: 'aclDsbAmt', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'dgr3LevlOgNm', header: t('MSG_TXT_BRANCH'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '119.9', styleName: 'text-center', options: codes.RSB_DV_CD },
    { fieldName: 'akdsym', header: t('MSG_TXT_BIZ_RGST_MM'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'akdcha', header: t('MSG_TXT_NMN'), width: '119.9', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'prtnrGdCd', header: t('MSG_TXT_GRCNT'), width: '119.9', styleName: 'text-right', numberFormat: '#,##0.##' },
    { fieldName: 'edu100', header: t('MSG_TXT_NWCMR') + t('MSG_TXT_ENPSC') + t('MSG_TXT_EDUC'), width: '119.9', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'akcda10', header: t('MSG_TXT_MTRRS'), width: '119.9', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'akcda12', header: t('MSG_TXT_MTRRS') + t('MSG_TXT_EXCP'), width: '119.9', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'akcda14', header: t('MSG_TXT_FXAM'), width: '119.9', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'akcda13', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'akcda15', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'akcda11', header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_PKG'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'akcda19', header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_MEMBERSHIP'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'dedeq3', header: `${t('MSG_TXT_CHNG')}(1)${t('MSG_TXT_COUNT')}`, width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'akdeq0', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'lccnt1', header: t('MSG_TXT_ASGN') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'cLccnt1', header: t('MSG_TXT_CANCEL') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'rLccnt1', header: t('MSG_TXT_REAL') + t('MSG_TXT_ASGN') + t('MSG_TXT_CNT'), width: '207.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'gdSercnt', header: `${t('MSG_TXT_WASHER')}/${t('MSG_TXT_ARCN')}/${t('MSG_TXT_DRYER')}${t('MSG_TXT_COUNT')}`, width: '207.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'elecnt', header: t('MSG_TXT_ELHM') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'nelecnt', header: t('MSG_TXT_ELHM_EXCP') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'sercnt', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_SERVICE') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'serryl', header: t('MSG_TXT_PROCS_RT'), width: '158.4', styleName: 'text-right', numberFormat: '###0.##' },
    { fieldName: 'aksd01', header: t('MSG_TXT_PRPN'), width: '286', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aksd03', header: t('MSG_TXT_ENRG'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aksd04', header: t('MSG_TXT_SNGL_PMNT'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aksd15', header: t('MSG_TXT_CHNG'), width: '122.8', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aksd05', header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_MEMBERSHIP'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aksd06', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_SCENE'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aksd07', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_ACTI'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aksd09', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_ACML'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aksd10', header: t('MSG_TXT_EDUC'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aksd11', header: t('MSG_TXT_RGLVL'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aksd13', header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aksd14', header: t('MSG_TXT_ADSB'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aksd16', header: t('MSG_TXT_UNIFORM'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'intbsSum', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'ddtnSum', header: t('MSG_TXT_DDTN_SUM'), width: '158.4', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'aclDsbAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '124.7', styleName: 'text-right', numberFormat: '#,##0' },
  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    {
      header: t('MSG_TXT_PRVCY'), // colspan title
      direction: 'horizontal', // merge type
      items: ['dgr2LevlOgNm', 'dgr3LevlOgNm', 'prtnrNo', 'prtnrKnm', 'rsbDvCd', 'akdsym', 'akdcha', 'prtnrGdCd'],
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
      items: ['lccnt1', 'cLccnt1', 'rLccnt1', 'gdSercnt', 'elecnt', 'nelecnt', 'sercnt', 'serryl'],
    },
    {
      header: t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['aksd01', 'aksd03', 'aksd04', 'aksd15', 'aksd05', 'aksd06', 'aksd07', 'aksd09', 'aksd10', 'aksd11', 'aksd13', 'aksd14', 'aksd16'],
    },
    'intbsSum', 'ddtnSum', 'aclDsbAmt',

  ]);
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dgr2LevlOgNm' },
    { fieldName: 'dgr3LevlOgNm' },
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
    { fieldName: 'akcda10', dataType: 'number' },
    { fieldName: 'akcda12', dataType: 'number' },
    { fieldName: 'akcda14', dataType: 'number' },
    { fieldName: 'akcda13', dataType: 'number' },
    { fieldName: 'akcda15', dataType: 'number' },
    { fieldName: 'akcda11', dataType: 'number' },
    { fieldName: 'akcda19', dataType: 'number' },
    { fieldName: 'dedeq3', dataType: 'number' },
    { fieldName: 'akdeq0', dataType: 'number' },
    { fieldName: 'lccnt1', dataType: 'number' },
    { fieldName: 'cLccnt1', dataType: 'number' },
    { fieldName: 'rLccnt1', dataType: 'number' },
    { fieldName: 'gdSercnt', dataType: 'number' },
    { fieldName: 'elecnt', dataType: 'number' },
    { fieldName: 'nelecnt', dataType: 'number' },
    { fieldName: 'sercnt', dataType: 'number' },
    { fieldName: 'serryl', dataType: 'number' },
    { fieldName: 'aksd01', dataType: 'number' },
    { fieldName: 'aksd03', dataType: 'number' },
    { fieldName: 'aksd04', dataType: 'number' },
    { fieldName: 'aksd15', dataType: 'number' },
    { fieldName: 'aksd05', dataType: 'number' },
    { fieldName: 'aksd06', dataType: 'number' },
    { fieldName: 'aksd07', dataType: 'number' },
    { fieldName: 'aksd09', dataType: 'number' },
    { fieldName: 'aksd10', dataType: 'number' },
    { fieldName: 'aksd11', dataType: 'number' },
    { fieldName: 'aksd13', dataType: 'number' },
    { fieldName: 'aksd14', dataType: 'number' },
    { fieldName: 'aksd16', dataType: 'number' },
    { fieldName: 'gadcnt', dataType: 'number' },
    { fieldName: 'jAkdeq0', dataType: 'number' },
    { fieldName: 'jSercnt', dataType: 'number' },
    { fieldName: 'aksd51', dataType: 'number' },
    { fieldName: 'aksd52', dataType: 'number' },
    { fieldName: 'aksd53', dataType: 'number' },
    { fieldName: 'aksd54', dataType: 'number' },
    { fieldName: 'aksd55', dataType: 'number' },
    { fieldName: 'aksd56', dataType: 'number' },
    { fieldName: 'intbsSum', dataType: 'number' },
    { fieldName: 'ddtnSum', dataType: 'number' },
    { fieldName: 'aclDsbAmt', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'dgr3LevlOgNm', header: t('MSG_TXT_BRANCH'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '119.9', styleName: 'text-center', options: codes.RSB_DV_CD },
    { fieldName: 'akdsym', header: t('MSG_TXT_BIZ_RGST_MM'), width: '119.9', styleName: 'text-center' },
    { fieldName: 'akdcha', header: t('MSG_TXT_NMN'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'prtnrGdCd', header: t('MSG_TXT_GRCNT'), width: '119.9', styleName: 'text-right', numberFormat: '#,##0.##' },
    { fieldName: 'atcnt1', header: t('MSG_TXT_ASET') + t('MSG_TXT_EDUC'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'atcnt2', header: t('MSG_TXT_ACPN') + t('MSG_TXT_EDUC'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'is124edu', header: t('MSG_TXT_ASET') + t('MSG_TXT_EDUC'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'is125edu', header: t('MSG_TXT_ACPN') + t('MSG_TXT_EDUC'), width: '119.9', styleName: 'text-right' },
    { fieldName: 'akcda10', header: t('MSG_TXT_MTRRS'), width: '119.9', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda12', header: t('MSG_TXT_MTRRS') + t('MSG_TXT_EXCP'), width: '119.9', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda14', header: t('MSG_TXT_FXAM'), width: '119.9', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda13', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda15', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda11', header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_PKG'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda19', header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_MEMBERSHIP'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'dedeq3', header: `${t('MSG_TXT_CHNG')}(1)${t('MSG_TXT_COUNT')}`, width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akdeq0', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'lccnt1', header: t('MSG_TXT_ASGN') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'cLccnt1', header: t('MSG_TXT_CANCEL') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'rLccnt1', header: t('MSG_TXT_REAL') + t('MSG_TXT_ASGN') + t('MSG_TXT_CNT'), width: '207.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'gdSercnt', header: `${t('MSG_TXT_WASHER')}/${t('MSG_TXT_ARCN')}/${t('MSG_TXT_DRYER')}${t('MSG_TXT_COUNT')}`, width: '207.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'elecnt', header: t('MSG_TXT_ELHM') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'nelecnt', header: t('MSG_TXT_ELHM_EXCP') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'sercnt', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_SERVICE') + t('MSG_TXT_COUNT'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'serryl', header: t('MSG_TXT_PROCS_RT'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd01', header: t('MSG_TXT_PRPN'), width: '286', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd03', header: t('MSG_TXT_ENRG'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd04', header: t('MSG_TXT_SNGL_PMNT'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd15', header: t('MSG_TXT_CHNG'), width: '122.8', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd05', header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_MEMBERSHIP'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd06', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_SCENE'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd07', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_ACTI'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd09', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_ACML'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd10', header: t('MSG_TXT_EDUC'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd11', header: t('MSG_TXT_RGLVL'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd13', header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd14', header: t('MSG_TXT_ADSB'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd16', header: t('MSG_TXT_UNIFORM'), width: '158.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'gadcnt', header: t('MSG_TXT_ACL_ACTI_PPL'), width: '119.9', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jAkdeq0', header: t('MSG_TXT_PD_ACC_CNT'), width: '119.9', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jSercnt', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_COUNT'), width: '119.9', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd51', header: t('MSG_TXT_RENTAL'), width: '119.9', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd52', header: `${t('MSG_TXT_SNGL_PMNT')}/${t('MSG_TXT_ISTM')}`, width: '119.9', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd53', header: t('MSG_TXT_SELL') + t('MSG_TXT_CONN'), width: '119.9', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd54', header: t('MSG_TXT_OG') + t('MSG_TXT_MGT'), width: '119.9', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd55', header: t('MSG_TXT_NEW') + t('MSG_TXT_SELL'), width: '119.9', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd56', header: t('MSG_TXT_SERVICE') + t('MSG_TXT_CONN'), width: '119.9', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'intbsSum', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '119.9', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'ddtnSum', header: t('MSG_TXT_DDTN_SUM'), width: '119.9', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aclDsbAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '119.9', styleName: 'text-right', numberFormat: '#,###,##0' },
  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    {
      header: t('MSG_TXT_PRVCY'), // colspan title
      direction: 'horizontal', // merge type
      items: ['dgr2LevlOgNm', 'dgr3LevlOgNm', 'prtnrNo', 'prtnrKnm', 'rsbDvCd', 'akdsym', 'akdcha', 'prtnrGdCd'],
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
      items: ['lccnt1', 'cLccnt1', 'rLccnt1', 'gdSercnt', 'elecnt', 'nelecnt', 'sercnt', 'serryl'],
    },
    {
      header: t('MSG_TXT_INDV') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['aksd01', 'aksd03', 'aksd04', 'aksd15', 'aksd05', 'aksd06', 'aksd07', 'aksd09', 'aksd10', 'aksd11', 'aksd13', 'aksd14', 'aksd16'],
    },
    {
      header: t('MSG_TXT_BRANCH') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['gadcnt', 'jAkdeq0', 'jSercnt', 'aksd51', 'aksd52', 'aksd53', 'aksd54', 'aksd55', 'aksd56'],
    },
    'intbsSum', 'ddtnSum', 'aclDsbAmt',
  ]);
});

</script>

<style>

</style>
