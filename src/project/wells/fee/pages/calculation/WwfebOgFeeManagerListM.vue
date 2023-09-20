<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebOgFeeManagerListM - M조직 수수료 생성관리
3. 작성자 : min-kyu bae
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
            @change="onChangedRsbTp"
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
      <h3>{{ searchParams.statTitleText }}</h3>
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
      <kw-grid
        v-if="isGrid4Visile"
        ref="grdMainRef"
        name="grd4Main"
        :visible-rows="10"
        @init="initGrd4Main"
      />
      <kw-grid
        v-if="isGrid5Visile"
        ref="grdMainRef"
        name="grd5Main"
        :visible-rows="10"
        @init="initGrd5Main"
      />
      <kw-grid
        v-if="isGrid6Visile"
        ref="grdMainRef"
        name="grd6Main"
        :visible-rows="10"
        @init="initGrd6Main"
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
const isGrid1Visile = ref(false);
const isGrid2Visile = ref(false);
const isGrid3Visile = ref(true);
const isGrid4Visile = ref(false);
const isGrid5Visile = ref(false);
const isGrid6Visile = ref(false);
const { currentRoute } = useRouter();
const router = useRouter();
const isExcelDown = ref(false);
const stepNaviRef = ref();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const maxDate = dayjs().format('YYYY-MM');
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const codes = await codeUtil.getMultiCodes(
  'FEE_TCNT_DV_CD', // 수수료차수구분코드
  'RSB_DV_CD',
  'QLF_DV_CD',
  'OPNG_CD',
);

const { getUserInfo } = useMeta();
const sessionUserInfo = getUserInfo();
const filterRsbDvCd = codes.RSB_DV_CD.filter((v) => ['W0205', 'W0204'].includes(v.codeId));
const searchParams = ref({

  perfYm: now.add(-1, 'month').format('YYYYMM'),
  feeTcntDvCd: '01',
  rsbTpCd: '',
  rsbTpTxt: '',
  prtnrNo: '',
  prtnrKnm: '',
  ogLevl1Id: '',
  ogLevl2Id: '',
  ogLevl3Id: '',
  statTitleText: t('MSG_TXT_PRGS_STE'),
  ogTpCd: 'W02',
  feeSchdTpCd: '',
  coCd: '2000',
  unitCd: '',

});

const approval = ref({
  gb: 'KST004', /* formId를 식별하는 구분 */
  empno: sessionUserInfo.employeeIDNumber, /* 결재자 사번 */
  formId: '2023000037', /* M조직 품의결재 폼ID */
  appKey: '', /* 업무단에서 해당 결재를 확인할 KEY */
});

const saveInfo = ref({
  perfYm: '',
  ogTpCd: 'W02',
  appKey: '',
  unitCd: '',
});

let cachedParams;

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
 *  Event - 직책유형 선택 시 하단 그리드 변경※
 */
async function onChangedRsbTp() {
  const { rsbTpCd, perfYm } = searchParams.value;
  if (rsbTpCd === 'W0205') {
    if (perfYm > 202304) {
      isGrid1Visile.value = true;
      isGrid2Visile.value = false;
      isGrid3Visile.value = false;
      isGrid4Visile.value = false;
      isGrid5Visile.value = false;
      isGrid6Visile.value = false;
    } else {
      isGrid1Visile.value = false;
      isGrid2Visile.value = false;
      isGrid3Visile.value = false;
      isGrid4Visile.value = true;
      isGrid5Visile.value = false;
      isGrid6Visile.value = false;
    }
    searchParams.value.feeSchdTpCd = '201';
    searchParams.value.unitCd = 'W101';
  } else if (rsbTpCd === 'W0204') {
    if (perfYm > 202304) {
      isGrid1Visile.value = false;
      isGrid2Visile.value = true;
      isGrid3Visile.value = false;
      isGrid4Visile.value = false;
      isGrid5Visile.value = false;
      isGrid6Visile.value = false;
    } else {
      isGrid1Visile.value = false;
      isGrid2Visile.value = false;
      isGrid3Visile.value = false;
      isGrid4Visile.value = false;
      isGrid5Visile.value = true;
      isGrid6Visile.value = false;
    }
    searchParams.value.feeSchdTpCd = '202';
    searchParams.value.unitCd = 'W102';
  } else {
    if (perfYm > 202304) {
      isGrid1Visile.value = false;
      isGrid2Visile.value = false;
      isGrid3Visile.value = true;
      isGrid4Visile.value = false;
      isGrid5Visile.value = false;
      isGrid6Visile.value = false;
    } else {
      isGrid1Visile.value = false;
      isGrid2Visile.value = false;
      isGrid3Visile.value = false;
      isGrid4Visile.value = false;
      isGrid5Visile.value = false;
      isGrid6Visile.value = true;
    }
    searchParams.value.feeSchdTpCd = '';
  }
  await initData();
}

/*
 *  Event - 조회 버튼 클릭
 */

async function fetchData() {
  let uri = '';
  const { prtnrNo, perfYm } = searchParams.value;
  stepNaviRef.value.initProps();

  if (isGrid2Visile.value === true || isGrid5Visile.value === true) {
    uri = '-brmgr';
  } else if (isGrid3Visile.value === true || isGrid6Visile.value === true) {
    uri = '-total';
  }
  if (perfYm <= '202304') {
    uri += '-bf';
  }
  const response = await dataService.get(`/sms/wells/fee/organization-fees/mngers${uri}`, { params: cachedParams, timeout: 300000 });
  const mngerFees = response.data;
  totalCount.value = mngerFees.length;
  if (totalCount.value > 0) {
    isExcelDown.value = true;
  } else {
    isExcelDown.value = false;
  }
  if (prtnrNo !== '' && totalCount.value === 0) {
    notify(t('MSG_TXT_RPB_EMPNO_CONF'));
  }

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(mngerFees);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
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
async function onClickW201P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbTpCd } = searchParams.value;
  const { codeName } = codes.FEE_TCNT_DV_CD.find((v) => v.codeId === searchParams.value.feeTcntDvCd);
  if (rsbTpCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W02',
      ogTpCdTxt: 'M추진',
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
async function onClickW202P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbTpCd } = searchParams.value;
  let feeCalcUnitTpCd;
  if (rsbTpCd === 'W0205') {
    feeCalcUnitTpCd = '201';
  } else {
    feeCalcUnitTpCd = '202';
  }
  const { result: isUploadSuccess } = await modal({
    component: 'WwfebOgFeeMlannerRegP',
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
async function onClickW205P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { rsbTpCd } = searchParams.value;
  const { result: isUploadSuccess, payload } = await modal({
    component: 'ZwfezXlsUpP',
    componentProps: {
      formatId: 'FOM_FEZ_0023',
      baseYm: searchParams.value.perfYm,
      ogTpCd: 'W02',
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
async function onClickW206P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbTpCd } = searchParams.value;
  if (rsbTpCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W02',
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
async function onClickW207P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { ogTpCd, perfYm, rsbTpCd } = searchParams.value;
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
async function onClickW208P() {
  await alert('업무 처리 완료 후, \n 좌상단 [완료처리] 버튼을 눌러주세요');
}

/*
 *  Event - 고용보험 공제 클릭 ※
 */
async function onClickW209P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbTpCd } = searchParams.value;
  if (rsbTpCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W02',
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
async function onClickW210P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbTpCd } = searchParams.value;
  if (rsbTpCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W02',
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
async function onClickW214P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { perfYm, rsbTpCd } = searchParams.value;
  if (rsbTpCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W02',
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
async function onClickW216P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { perfYm, rsbTpCd } = searchParams.value;
  if (rsbTpCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W02',
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
async function onClickW217P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { perfYm, rsbTpCd, ogTpCd } = searchParams.value;
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
async function onClickW219P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
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
async function onClickW220P() {
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

async function onClickW221P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
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
  } else if (params.code === 'W0201') { // 미팅참석 집계
    await onClickW201P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0202') { // 수수료 생성
    await onClickW202P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0205') { // 기타지원 업로드
    await onClickW205P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0206') { // 세금공제
    await onClickW206P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0207') { // 원천세 생성
    await onClickW207P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0208' || params.code === 'W0211' || params.code === 'W0213' || params.code === 'W0215') {
    await onClickW208P();
  } else if (params.code === 'W0209') { // 고용보험 공제
    await onClickW209P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0210') { // 가지급금 공제 생성
    await onClickW210P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0214') { // 부담공제 생성
    await onClickW214P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0216') { // 보증예치금 적립
    await onClickW216P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0217') { // 이체자료 생성
    await onClickW217P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0219') { // 품의작성
    await onClickW219P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0220') { // 전표생성
    await onClickW220P();
  } else if (params.code === 'W0221') { // 선급판매 수수료 확정
    await onClickW221P(params.feeSchdId, params.code, '03');
  }
}

/*
 *  Event - 엑셀 다운로드 버튼 클릭 ※
 */
async function onClickExcelDownload() {
  const { perfYm } = searchParams.value;
  let uri = '';
  if (isGrid2Visile.value === true) {
    uri = '-brmgr';
  } else if (isGrid3Visile.value === true) {
    uri = '-total';
  }
  if (perfYm <= '202304') {
    uri += '-bf';
  }
  cachedParams = cloneDeep(searchParams.value);
  const view = grdMainRef.value.getView();
  const response = await dataService.get(`/sms/wells/fee/organization-fees/mngers${uri}`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

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
      ogTpCd: 'W02',
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

onMounted(async () => {
  await onChangedRsbTp();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd1Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'rsbDvCd' },
    { fieldName: 'bizRgst1Artc' },
    { fieldName: 'bizRgst2Artc' },
    { fieldName: 'bizRgst3Artc' },
    { fieldName: 'bizRgst4Artc' },
    { fieldName: 'metgDc' },
    { fieldName: 'qlf1Atc' },
    { fieldName: 'qlf2Atc' },
    { fieldName: 'edu1Atc' },
    { fieldName: 'edu2Atc' },
    { fieldName: 'edu3Atc' },
    { fieldName: 'edu4Atc' },
    { fieldName: 'edu5Atc' },
    { fieldName: 'edu6Atc' },
    { fieldName: 'edu7Atc' },
    { fieldName: 'edu8Atc' },
    { fieldName: 'edu9Atc' },
    { fieldName: 'mngr1Atc' },
    { fieldName: 'mngr2Atc' },
    { fieldName: 'mngr3Atc' },
    { fieldName: 'mngr4Atc' },
    { fieldName: 'mngr5Atc' },
    { fieldName: 'mngr6Atc' },
    { fieldName: 'mngr7Atc' },
    { fieldName: 'indv1BsAtc', dataType: 'number' },
    { fieldName: 'indv2BsAtc', dataType: 'number' },
    { fieldName: 'indv3BsAtc', dataType: 'number' },
    { fieldName: 'indv4BsAtc', dataType: 'number' },
    { fieldName: 'indv5BsAtc', dataType: 'number' },
    { fieldName: 'indv6BsAtc', dataType: 'number' },
    { fieldName: 'indv1Perf', dataType: 'number' },
    { fieldName: 'indv2Perf', dataType: 'number' },
    { fieldName: 'indv3Perf', dataType: 'number' },
    { fieldName: 'indv4Perf', dataType: 'number' },
    { fieldName: 'indv5Perf', dataType: 'number' },
    { fieldName: 'indv1Sell', dataType: 'number' },
    { fieldName: 'indv2Sell', dataType: 'number' },
    { fieldName: 'indv3Sell', dataType: 'number' },
    { fieldName: 'indvAcc1Ninc', dataType: 'number' },
    { fieldName: 'indvAcc2Ninc', dataType: 'number' },
    { fieldName: 'indvAcc3Ninc', dataType: 'number' },
    { fieldName: 'indv1Fee', dataType: 'number' },
    { fieldName: 'indv2Fee', dataType: 'number' },
    { fieldName: 'indv3Fee', dataType: 'number' },
    { fieldName: 'indv4Fee', dataType: 'number' },
    { fieldName: 'indv5Fee', dataType: 'number' },
    { fieldName: 'indv6Fee', dataType: 'number' },
    { fieldName: 'indv7Fee', dataType: 'number' },
    { fieldName: 'indv8Fee', dataType: 'number' },
    { fieldName: 'indv9Fee', dataType: 'number' },
    { fieldName: 'indv10Fee', dataType: 'number' },
    { fieldName: 'indv11Fee', dataType: 'number' },
    { fieldName: 'indv12Fee', dataType: 'number' },
    { fieldName: 'indv13Fee', dataType: 'number' },
    { fieldName: 'indv14Fee', dataType: 'number' },
    { fieldName: 'indv15Fee', dataType: 'number' },
    { fieldName: 'indv16Fee', dataType: 'number' },
    { fieldName: 'etc1Atc', dataType: 'number' },
    { fieldName: 'etc2Atc', dataType: 'number' },
    { fieldName: 'etc3Atc', dataType: 'number' },
    { fieldName: 'intbsSum', dataType: 'number' },
    { fieldName: 'ddtnSum', dataType: 'number' },
    { fieldName: 'aclDsbAmt', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '88.7', styleName: 'text-center', options: codes.RSB_DV_CD },
    { fieldName: 'bizRgst1Artc', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'bizRgst2Artc', header: t('MSG_TXT_RETR') + t('MSG_TXT_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'bizRgst3Artc', header: t('MSG_TXT_FNL_CLTN_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'bizRgst4Artc', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'metgDc', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '91.4', styleName: 'text-right' },
    { fieldName: 'qlf1Atc', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center', options: codes.QLF_DV_CD },
    { fieldName: 'qlf2Atc', header: 'M+1', width: '91.4', styleName: 'text-center', options: codes.QLF_DV_CD },
    { fieldName: 'edu1Atc', header: t('MSG_TXT_SRTUP'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'edu2Atc', header: t('MSG_TXT_PRE_SRTUP'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'edu3Atc', header: t('MSG_TXT_CMPF'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu4Atc', header: `${t('MSG_TXT_STMNT')}1`, width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu5Atc', header: `${t('MSG_TXT_STMNT')}2`, width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu6Atc', header: `${t('MSG_TXT_STMNT')}3,4,5`, width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu7Atc', header: `Pre'${t('MSG_TXT_ACML')}${t('MSG_TXT_EDUC')}`, width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu8Atc', header: t('MSG_TXT_TOPMR') + t('MSG_TXT_STMNT'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'edu9Atc', header: t('MSG_TXT_TOPMR') + t('MSG_TXT_NMN'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'mngr1Atc', header: t('MSG_TXT_FST') + t('MSG_TXT_OPNG_MM'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'mngr2Atc', header: t('MSG_TXT_RE_OPNG') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'mngr3Atc', header: t('MSG_TXT_FNL_CLTN_MM'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'mngr4Atc', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'mngr5Atc', header: t('MSG_TXT_OPNG_NMN'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'mngr6Atc', header: t('MSG_TXT_STMNT') + t('MSG_TXT_PAY_TYPE'), width: '91.4', styleName: 'text-center', options: codes.OPNG_CD },
    { fieldName: 'mngr7Atc', header: `5${t('MSG_TXT_D')}${t('MSG_TXT_ASN_N')}`, width: '91.4', styleName: 'text-center' },
    { fieldName: 'indv1BsAtc', header: t('MSG_TXT_ASGN_CT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv2BsAtc', header: t('MSG_TXT_FHS_CT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv3BsAtc', header: t('MSG_TXT_PROCS_RT'), width: '91.4', styleName: 'text-right', numberFormat: '###0.##' },
    { fieldName: 'indv4BsAtc', header: t('MSG_TXT_PYT_RT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv5BsAtc', header: `W1${t('MSG_TXT_COUNT')}`, width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv6BsAtc', header: `W2${t('MSG_TXT_COUNT')}`, width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv1Perf', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv2Perf', header: t('MSG_TXT_RENTAL_BASE_PRC'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv3Perf', header: t('MSG_TXT_SNGL_PMNT_BASE_PRC'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv4Perf', header: t('MSG_TXT_CHNG') + t('MSG_TXT_COUNT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv5Perf', header: t('MSG_TXT_ELHM_EXCP_ACKMT_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv1Sell', header: t('MSG_TXT_FXAM') + t('MSG_TXT_COUNT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv2Sell', header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv3Sell', header: t('MSG_TXT_HCR_MSH') + t('MSG_TXT_COUNT'), width: '110', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indvAcc1Ninc', header: t('MSG_TXT_LSTMM') + t('MSG_TXT_CANCEL'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indvAcc2Ninc', header: t('MSG_TXT_THM_NW'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indvAcc3Ninc', header: t('MSG_TXT_NINC'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv1Fee', header: t('MSG_TXT_ELHM_PRPN'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv2Fee', header: t('MSG_TXT_ELHM_EXCP') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv3Fee', header: t('MSG_TXT_ELHM') + t('MSG_TXT_SAL_INTV'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv4Fee', header: t('MSG_TXT_METG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv5Fee', header: t('MSG_TXT_EDUC'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv6Fee', header: t('MSG_TXT_STMNT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv7Fee', header: t('MSG_TXT_MCHN_CH'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv8Fee', header: t('MSG_TXT_BS_MGMT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv9Fee', header: t('MSG_TXT_BS_ENRG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv10Fee', header: t('MSG_TXT_RGLVL'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv11Fee', header: `WM${t('MSG_TXT_CMNC')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv12Fee', header: `WM${t('MSG_TXT_ETC')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv13Fee', header: t('MSG_TXT_PRR_VST'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv14Fee', header: t('MSG_TXT_UNIFORM'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv15Fee', header: t('MSG_TXT_MAT_HODT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv16Fee', header: t('MSG_TXT_ADD') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'etc1Atc', header: t('MSG_TXT_ADSB'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'etc2Atc', header: t('MSG_TXT_MEMBERSHIP'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'etc3Atc', header: t('MSG_TXT_ETC_SPPT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'intbsSum', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'ddtnSum', header: t('MSG_TXT_DDTN_SUM'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aclDsbAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'ogNm', 'prtnrNo', 'prtnrKnm', 'rsbDvCd',
    {
      header: t('MSG_TXT_BIZ_RGST_ARTC'),
      direction: 'horizontal',
      items: ['bizRgst1Artc', 'bizRgst2Artc', 'bizRgst3Artc', 'bizRgst4Artc'],
    },
    'metgDc',
    {
      header: t('MSG_TXT_QLF'),
      direction: 'horizontal',
      items: ['qlf1Atc', 'qlf2Atc'],
    },
    {
      header: t('MSG_TXT_EDUC'),
      direction: 'horizontal',
      items: ['edu1Atc', 'edu2Atc', 'edu3Atc', 'edu4Atc', 'edu5Atc', 'edu6Atc', 'edu7Atc', 'edu8Atc', 'edu9Atc'],
    },
    {
      header: t('MSG_TXT_MANAGER') + t('MSG_TXT_OPNG_ARTC'),
      direction: 'horizontal',
      items: ['mngr1Atc', 'mngr2Atc', 'mngr3Atc', 'mngr4Atc', 'mngr5Atc', 'mngr6Atc', 'mngr7Atc'],
    },
    {
      header: `${t('MSG_TXT_INDV')}BS`,
      direction: 'horizontal',
      items: ['indv1BsAtc', 'indv2BsAtc', 'indv3BsAtc', 'indv4BsAtc', 'indv5BsAtc', 'indv6BsAtc'],
    },
    {
      header: t('MSG_TXT_INDV_PERF'),
      direction: 'horizontal',
      items: ['indv1Perf', 'indv2Perf', 'indv3Perf', 'indv4Perf', 'indv5Perf'],
    },
    {
      header: t('MSG_TXT_INDV') + t('MSG_TXT_ETC') + t('MSG_TXT_SELL'),
      direction: 'horizontal',
      items: ['indv1Sell', 'indv2Sell', 'indv3Sell'],
    },
    {
      header: t('MSG_TXT_INDV') + t('MSG_TXT_ACC_NINC'),
      direction: 'horizontal',
      items: ['indvAcc1Ninc', 'indvAcc2Ninc', 'indvAcc3Ninc'],
    },
    {
      header: t('MSG_TXT_PRSNL_FEE'),
      direction: 'horizontal',
      items: ['indv1Fee', 'indv2Fee', 'indv3Fee', 'indv4Fee', 'indv5Fee', 'indv6Fee', 'indv7Fee', 'indv8Fee', 'indv9Fee', 'indv10Fee', 'indv11Fee', 'indv12Fee', 'indv13Fee', 'indv14Fee', 'indv15Fee', 'indv16Fee'],
    },
    {
      header: t('MSG_TXT_ETC'),
      direction: 'horizontal',
      items: ['etc1Atc', 'etc2Atc', 'etc3Atc'],
    },
    {
      header: t('MSG_TXT_FEE_SUM'),
      direction: 'horizontal',
      items: ['intbsSum', 'ddtnSum', 'aclDsbAmt'],
    },

  ]);
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'rsbDvCd' },
    { fieldName: 'bizRgst1Artc' },
    { fieldName: 'bizRgst2Artc' },
    { fieldName: 'bizRgst3Artc' },
    { fieldName: 'bizRgst4Artc' },
    { fieldName: 'prfmtMm' },
    { fieldName: 'prfmtNmn' },
    { fieldName: 'metgDc' },
    { fieldName: 'qlf1Atc' },
    { fieldName: 'qlf2Atc' },
    { fieldName: 'edu1Atc' },
    { fieldName: 'indv1BsAtc', dataType: 'number' },
    { fieldName: 'indv2BsAtc', dataType: 'number' },
    { fieldName: 'indv3BsAtc', dataType: 'number' },
    { fieldName: 'indv4BsAtc', dataType: 'number' },
    { fieldName: 'indv5BsAtc', dataType: 'number' },
    { fieldName: 'indv6BsAtc', dataType: 'number' },
    { fieldName: 'og1BsAtc', dataType: 'number' },
    { fieldName: 'og2BsAtc', dataType: 'number' },
    { fieldName: 'og3BsAtc', dataType: 'number' },
    { fieldName: 'og4BsAtc', dataType: 'number' },
    { fieldName: 'indv1Perf', dataType: 'number' },
    { fieldName: 'indv2Perf', dataType: 'number' },
    { fieldName: 'indv3Perf', dataType: 'number' },
    { fieldName: 'indv4Perf', dataType: 'number' },
    { fieldName: 'indv5Perf', dataType: 'number' },
    { fieldName: 'indv1Sell', dataType: 'number' },
    { fieldName: 'indv2Sell', dataType: 'number' },
    { fieldName: 'indv3Sell', dataType: 'number' },
    { fieldName: 'indvAcc1Ninc', dataType: 'number' },
    { fieldName: 'indvAcc2Ninc', dataType: 'number' },
    { fieldName: 'indvAcc3Ninc', dataType: 'number' },
    { fieldName: 'og1Perf', dataType: 'number' },
    { fieldName: 'og2Perf', dataType: 'number' },
    { fieldName: 'og3Perf', dataType: 'number' },
    { fieldName: 'og4Perf', dataType: 'number' },
    { fieldName: 'ogPerfSum', dataType: 'number' },
    { fieldName: 'ogAcc1Ninc', dataType: 'number' },
    { fieldName: 'ogAcc2Ninc', dataType: 'number' },
    { fieldName: 'ogAcc3Ninc', dataType: 'number' },
    { fieldName: 'indv1Fee', dataType: 'number' },
    { fieldName: 'indv2Fee', dataType: 'number' },
    { fieldName: 'indv3Fee', dataType: 'number' },
    { fieldName: 'indv4Fee', dataType: 'number' },
    { fieldName: 'indv5Fee', dataType: 'number' },
    { fieldName: 'indv6Fee', dataType: 'number' },
    { fieldName: 'indv7Fee', dataType: 'number' },
    { fieldName: 'indv8Fee', dataType: 'number' },
    { fieldName: 'indv9Fee', dataType: 'number' },
    { fieldName: 'indv10Fee', dataType: 'number' },
    { fieldName: 'indv11Fee', dataType: 'number' },
    { fieldName: 'indv12Fee', dataType: 'number' },
    { fieldName: 'indv13Fee', dataType: 'number' },
    { fieldName: 'indv14Fee', dataType: 'number' },
    { fieldName: 'indv15Fee', dataType: 'number' },
    { fieldName: 'indv16Fee', dataType: 'number' },
    { fieldName: 'og1Fee', dataType: 'number' },
    { fieldName: 'og2Fee', dataType: 'number' },
    { fieldName: 'og3Fee', dataType: 'number' },
    { fieldName: 'og4Fee', dataType: 'number' },
    { fieldName: 'og5Fee', dataType: 'number' },
    { fieldName: 'og6Fee', dataType: 'number' },
    { fieldName: 'og7Fee', dataType: 'number' },
    { fieldName: 'og8Fee', dataType: 'number' },
    { fieldName: 'etc1Atc', dataType: 'number' },
    { fieldName: 'etc2Atc', dataType: 'number' },
    { fieldName: 'etc3Atc', dataType: 'number' },
    { fieldName: 'intbsSum', dataType: 'number' },
    { fieldName: 'ddtnSum', dataType: 'number' },
    { fieldName: 'aclDsbAmt', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '88.7', styleName: 'text-center', options: codes.RSB_DV_CD },
    { fieldName: 'bizRgst1Artc', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'bizRgst2Artc', header: t('MSG_TXT_RETR') + t('MSG_TXT_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'bizRgst3Artc', header: t('MSG_TXT_FNL_CLTN_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'bizRgst4Artc', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'prfmtMm', header: t('MSG_TXT_PRFMT_MON'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'prfmtNmn', header: t('MSG_TXT_PRFMT_NMN'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'metgDc', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '91.4', styleName: 'text-right' },
    { fieldName: 'qlf1Atc', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center', options: codes.QLF_DV_CD },
    { fieldName: 'qlf2Atc', header: 'M+1', width: '91.4', styleName: 'text-center', options: codes.QLF_DV_CD },
    { fieldName: 'edu1Atc', header: t('MSG_TXT_BRANCH') + t('MSG_TXT_ONL'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'indv1BsAtc', header: t('MSG_TXT_ASGN_CT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv2BsAtc', header: t('MSG_TXT_FHS_CT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv3BsAtc', header: t('MSG_TXT_PROCS_RT'), width: '91.4', styleName: 'text-right', numberFormat: '###0.##' },
    { fieldName: 'indv4BsAtc', header: t('MSG_TXT_PYT_RT'), width: '91.4', styleName: 'text-right', numberFormat: '###0.##' },
    { fieldName: 'indv5BsAtc', header: `W1${t('MSG_TXT_COUNT')}`, width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv6BsAtc', header: `W2${t('MSG_TXT_COUNT')}`, width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og1BsAtc', header: t('MSG_TXT_ASGN_CT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og2BsAtc', header: t('MSG_TXT_FHS_CT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og3BsAtc', header: t('MSG_TXT_PROCS_RT'), width: '91.4', styleName: 'text-right', numberFormat: '###0.##' },
    { fieldName: 'og4BsAtc', header: t('MSG_TXT_PYT_RT'), width: '91.4', styleName: 'text-right', numberFormat: '###0.##' },
    { fieldName: 'indv1Perf', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv2Perf', header: t('MSG_TXT_RENTAL_BASE_PRC'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv3Perf', header: t('MSG_TXT_SNGL_PMNT_BASE_PRC'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv4Perf', header: t('MSG_TXT_CHNG') + t('MSG_TXT_COUNT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv5Perf', header: t('MSG_TXT_ELHM_EXCP_ACKMT_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv1Sell', header: t('MSG_TXT_FXAM') + t('MSG_TXT_COUNT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv2Sell', header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv3Sell', header: t('MSG_TXT_HCR_MSH') + t('MSG_TXT_COUNT'), width: '110', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indvAcc1Ninc', header: t('MSG_TXT_LSTMM') + t('MSG_TXT_CANCEL'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indvAcc2Ninc', header: t('MSG_TXT_THM_NW'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indvAcc3Ninc', header: t('MSG_TXT_NINC'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og1Perf', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og2Perf', header: t('MSG_TXT_RENTAL_BASE_PRC'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og3Perf', header: t('MSG_TXT_SNGL_PMNT_BASE_PRC'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og4Perf', header: t('MSG_TXT_CHNG') + t('MSG_TXT_COUNT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'ogPerfSum', header: t('MSG_TXT_AGG'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'ogAcc1Ninc', header: t('MSG_TXT_LSTMM') + t('MSG_TXT_CANCEL'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'ogAcc2Ninc', header: t('MSG_TXT_THM_NW'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'ogAcc3Ninc', header: t('MSG_TXT_NINC'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv1Fee', header: t('MSG_TXT_ELHM_PRPN'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv2Fee', header: t('MSG_TXT_ELHM_EXCP') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv3Fee', header: t('MSG_TXT_ELHM') + t('MSG_TXT_SAL_INTV'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv4Fee', header: t('MSG_TXT_METG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv5Fee', header: t('MSG_TXT_EDUC'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv6Fee', header: t('MSG_TXT_STMNT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv7Fee', header: t('MSG_TXT_MCHN_CH'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv8Fee', header: t('MSG_TXT_BS_MGMT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv9Fee', header: t('MSG_TXT_BS_ENRG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv10Fee', header: t('MSG_TXT_RGLVL'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv11Fee', header: `WM${t('MSG_TXT_CMNC')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv12Fee', header: `WM${t('MSG_TXT_ETC')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv13Fee', header: t('MSG_TXT_PRR_VST'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv14Fee', header: t('MSG_TXT_UNIFORM'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv15Fee', header: t('MSG_TXT_MAT_HODT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv16Fee', header: t('MSG_TXT_ADD') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og1Fee', header: t('MSG_TXT_ELHM_OG_PRPN'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og2Fee', header: t('MSG_TXT_ELHM_EXCP_OG_PRPN'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og3Fee', header: t('MSG_TXT_OG_SELL_ENCRG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og4Fee', header: t('MSG_TXT_EDUC'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og5Fee', header: t('MSG_TXT_NINC_MGT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og6Fee', header: `${t('MSG_TXT_OG_EJT')}1`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og7Fee', header: `${t('MSG_TXT_OG_EJT')}2`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og8Fee', header: t('MSG_TXT_NB_BRCH'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'etc1Atc', header: t('MSG_TXT_ADSB'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'etc2Atc', header: t('MSG_TXT_MEMBERSHIP'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'etc3Atc', header: t('MSG_TXT_ETC_SPPT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'intbsSum', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'ddtnSum', header: t('MSG_TXT_DDTN_SUM'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aclDsbAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'ogNm', 'prtnrNo', 'prtnrKnm', 'rsbDvCd',
    {
      header: t('MSG_TXT_BIZ_RGST_ARTC'),
      direction: 'horizontal',
      items: ['bizRgst1Artc', 'bizRgst2Artc', 'bizRgst3Artc', 'bizRgst4Artc'],
    },
    'prfmtMm', 'prfmtNmn', 'metgDc',
    {
      header: t('MSG_TXT_QLF'),
      direction: 'horizontal',
      items: ['qlf1Atc', 'qlf2Atc'],
    },
    {
      header: t('MSG_TXT_EDUC'),
      direction: 'horizontal',
      items: ['edu1Atc'],
    },
    {
      header: `${t('MSG_TXT_INDV')}BS`,
      direction: 'horizontal',
      items: ['indv1BsAtc', 'indv2BsAtc', 'indv3BsAtc', 'indv4BsAtc', 'indv5BsAtc', 'indv6BsAtc'],
    },
    {
      header: `${t('MSG_TXT_OG')}BS`,
      direction: 'horizontal',
      items: ['og1BsAtc', 'og2BsAtc', 'og3BsAtc', 'og4BsAtc'],
    },
    {
      header: t('MSG_TXT_INDV_PERF'),
      direction: 'horizontal',
      items: ['indv1Perf', 'indv2Perf', 'indv3Perf', 'indv4Perf', 'indv5Perf'],
    },
    {
      header: t('MSG_TXT_INDV') + t('MSG_TXT_ETC') + t('MSG_TXT_SELL'),
      direction: 'horizontal',
      items: ['indv1Sell', 'indv2Sell', 'indv3Sell'],
    },
    {
      header: t('MSG_TXT_INDV') + t('MSG_TXT_ACC_NINC'),
      direction: 'horizontal',
      items: ['indvAcc1Ninc', 'indvAcc2Ninc', 'indvAcc3Ninc'],
    },
    {
      header: t('MSG_TXT_OG_PERF'),
      direction: 'horizontal',
      items: ['og1Perf', 'og2Perf', 'og3Perf', 'og4Perf', 'ogPerfSum'],
    },
    {
      header: t('MSG_TXT_OG') + t('MSG_TXT_ACC_NINC'),
      direction: 'horizontal',
      items: ['ogAcc1Ninc', 'ogAcc2Ninc', 'ogAcc3Ninc'],
    },
    {
      header: t('MSG_TXT_PRSNL_FEE'),
      direction: 'horizontal',
      items: ['indv1Fee', 'indv2Fee', 'indv3Fee', 'indv4Fee', 'indv5Fee', 'indv6Fee', 'indv7Fee', 'indv8Fee', 'indv9Fee', 'indv10Fee', 'indv11Fee', 'indv12Fee', 'indv13Fee', 'indv14Fee', 'indv15Fee', 'indv16Fee'],
    },
    {
      header: t('MSG_TXT_ORGNSTN_FEE'),
      direction: 'horizontal',
      items: ['og1Fee', 'og2Fee', 'og3Fee', 'og4Fee', 'og5Fee', 'og6Fee', 'og7Fee', 'og8Fee'],
    },
    {
      header: t('MSG_TXT_ETC'),
      direction: 'horizontal',
      items: ['etc1Atc', 'etc2Atc', 'etc3Atc'],
    },
    {
      header: t('MSG_TXT_FEE_SUM'),
      direction: 'horizontal',
      items: ['intbsSum', 'ddtnSum', 'aclDsbAmt'],
    },

  ]);
});

const initGrd3Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'rsbDvCd' },
    { fieldName: 'bizRgst1Artc' },
    { fieldName: 'bizRgst2Artc' },
    { fieldName: 'bizRgst3Artc' },
    { fieldName: 'bizRgst4Artc' },
    { fieldName: 'prfmtMm' },
    { fieldName: 'prfmtNmn' },
    { fieldName: 'metgDc' },
    { fieldName: 'qlf1Atc' },
    { fieldName: 'qlf2Atc' },
    { fieldName: 'edu1Atc' },
    { fieldName: 'edu2Atc' },
    { fieldName: 'edu3Atc' },
    { fieldName: 'edu4Atc' },
    { fieldName: 'edu5Atc' },
    { fieldName: 'edu6Atc' },
    { fieldName: 'edu10Atc' },
    { fieldName: 'edu7Atc' },
    { fieldName: 'edu8Atc' },
    { fieldName: 'edu9Atc' },
    { fieldName: 'mngr1Atc' },
    { fieldName: 'mngr2Atc' },
    { fieldName: 'mngr3Atc' },
    { fieldName: 'mngr4Atc' },
    { fieldName: 'mngr5Atc' },
    { fieldName: 'mngr6Atc' },
    { fieldName: 'mngr7Atc' },
    { fieldName: 'indv1BsAtc', dataType: 'number' },
    { fieldName: 'indv2BsAtc', dataType: 'number' },
    { fieldName: 'indv3BsAtc', dataType: 'number' },
    { fieldName: 'indv4BsAtc', dataType: 'number' },
    { fieldName: 'indv5BsAtc', dataType: 'number' },
    { fieldName: 'indv6BsAtc', dataType: 'number' },
    { fieldName: 'og1BsAtc', dataType: 'number' },
    { fieldName: 'og2BsAtc', dataType: 'number' },
    { fieldName: 'og3BsAtc', dataType: 'number' },
    { fieldName: 'og4BsAtc', dataType: 'number' },
    { fieldName: 'indv1Perf', dataType: 'number' },
    { fieldName: 'indv2Perf', dataType: 'number' },
    { fieldName: 'indv3Perf', dataType: 'number' },
    { fieldName: 'indv4Perf', dataType: 'number' },
    { fieldName: 'indv5Perf', dataType: 'number' },
    { fieldName: 'indv1Sell', dataType: 'number' },
    { fieldName: 'indv2Sell', dataType: 'number' },
    { fieldName: 'indv3Sell', dataType: 'number' },
    { fieldName: 'indvAcc1Ninc', dataType: 'number' },
    { fieldName: 'indvAcc2Ninc', dataType: 'number' },
    { fieldName: 'indvAcc3Ninc', dataType: 'number' },
    { fieldName: 'og1Perf', dataType: 'number' },
    { fieldName: 'og2Perf', dataType: 'number' },
    { fieldName: 'og3Perf', dataType: 'number' },
    { fieldName: 'og4Perf', dataType: 'number' },
    { fieldName: 'ogPerfSum', dataType: 'number' },
    { fieldName: 'ogAcc1Ninc', dataType: 'number' },
    { fieldName: 'ogAcc2Ninc', dataType: 'number' },
    { fieldName: 'ogAcc3Ninc', dataType: 'number' },
    { fieldName: 'indv1Fee', dataType: 'number' },
    { fieldName: 'indv2Fee', dataType: 'number' },
    { fieldName: 'indv3Fee', dataType: 'number' },
    { fieldName: 'indv4Fee', dataType: 'number' },
    { fieldName: 'indv5Fee', dataType: 'number' },
    { fieldName: 'indv6Fee', dataType: 'number' },
    { fieldName: 'indv7Fee', dataType: 'number' },
    { fieldName: 'indv8Fee', dataType: 'number' },
    { fieldName: 'indv9Fee', dataType: 'number' },
    { fieldName: 'indv10Fee', dataType: 'number' },
    { fieldName: 'indv11Fee', dataType: 'number' },
    { fieldName: 'indv12Fee', dataType: 'number' },
    { fieldName: 'indv13Fee', dataType: 'number' },
    { fieldName: 'indv14Fee', dataType: 'number' },
    { fieldName: 'indv15Fee', dataType: 'number' },
    { fieldName: 'indv16Fee', dataType: 'number' },
    { fieldName: 'og1Fee', dataType: 'number' },
    { fieldName: 'og2Fee', dataType: 'number' },
    { fieldName: 'og3Fee', dataType: 'number' },
    { fieldName: 'og4Fee', dataType: 'number' },
    { fieldName: 'og5Fee', dataType: 'number' },
    { fieldName: 'og6Fee', dataType: 'number' },
    { fieldName: 'og7Fee', dataType: 'number' },
    { fieldName: 'og8Fee', dataType: 'number' },
    { fieldName: 'etc1Atc', dataType: 'number' },
    { fieldName: 'etc2Atc', dataType: 'number' },
    { fieldName: 'etc3Atc', dataType: 'number' },
    { fieldName: 'intbsSum', dataType: 'number' },
    { fieldName: 'ddtnSum', dataType: 'number' },
    { fieldName: 'aclDsbAmt', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '88.7', styleName: 'text-center', options: codes.RSB_DV_CD },
    { fieldName: 'bizRgst1Artc', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'bizRgst2Artc', header: t('MSG_TXT_RETR') + t('MSG_TXT_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'bizRgst3Artc', header: t('MSG_TXT_FNL_CLTN_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'bizRgst4Artc', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'prfmtMm', header: t('MSG_TXT_PRFMT_MON'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'prfmtNmn', header: t('MSG_TXT_PRFMT_NMN'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'metgDc', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '91.4', styleName: 'text-right' },
    { fieldName: 'qlf1Atc', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center', options: codes.QLF_DV_CD },
    { fieldName: 'qlf2Atc', header: 'M+1', width: '91.4', styleName: 'text-center', options: codes.QLF_DV_CD },
    { fieldName: 'edu1Atc', header: t('MSG_TXT_SRTUP'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'edu2Atc', header: t('MSG_TXT_PRE_START_UP'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'edu3Atc', header: t('MSG_TXT_CMPF'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu4Atc', header: `${t('MSG_TXT_STMNT')}1`, width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu5Atc', header: `${t('MSG_TXT_STMNT')}2`, width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu6Atc', header: `${t('MSG_TXT_STMNT')}3,4,5`, width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu7Atc', header: `Pre${t('MSG_TXT_ACML')}${t('MSG_TXT_EDUC')}`, width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu10Atc', header: t('MSG_TXT_BRANCH') + t('MSG_TXT_ONL'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'edu8Atc', header: t('MSG_TXT_TOPMR') + t('MSG_TXT_STMNT'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'edu9Atc', header: t('MSG_TXT_TOPMR') + t('MSG_TXT_NMN'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'mngr1Atc', header: t('MSG_TXT_FST') + t('MSG_TXT_OPNG_MM'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'mngr2Atc', header: t('MSG_TXT_RE_OPNG') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'mngr3Atc', header: t('MSG_TXT_FNL_CLTN_MM'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'mngr4Atc', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'mngr5Atc', header: t('MSG_TXT_OPNG_NMN'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'mngr6Atc', header: t('MSG_TXT_STMNT') + t('MSG_TXT_PAY_TYPE'), width: '91.4', styleName: 'text-center', options: codes.OPNG_CD },
    { fieldName: 'mngr7Atc', header: `5${t('MSG_TXT_D')}${t('MSG_TXT_ASN_N')}`, width: '91.4', styleName: 'text-center' },
    { fieldName: 'indv1BsAtc', header: t('MSG_TXT_ASGN_CT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv2BsAtc', header: t('MSG_TXT_FHS_CT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv3BsAtc', header: t('MSG_TXT_PROCS_RT'), width: '91.4', styleName: 'text-right', numberFormat: '###0.##' },
    { fieldName: 'indv4BsAtc', header: t('MSG_TXT_PYT_RT'), width: '91.4', styleName: 'text-right', numberFormat: '###0.##' },
    { fieldName: 'indv5BsAtc', header: `W1${t('MSG_TXT_COUNT')}`, width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv6BsAtc', header: `W2${t('MSG_TXT_COUNT')}`, width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og1BsAtc', header: t('MSG_TXT_ASGN_CT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og2BsAtc', header: t('MSG_TXT_FHS_CT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og3BsAtc', header: t('MSG_TXT_PROCS_RT'), width: '91.4', styleName: 'text-right', numberFormat: '###0.##' },
    { fieldName: 'og4BsAtc', header: t('MSG_TXT_PYT_RT'), width: '91.4', styleName: 'text-right', numberFormat: '###0.##' },
    { fieldName: 'indv1Perf', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv2Perf', header: t('MSG_TXT_RENTAL_BASE_PRC'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv3Perf', header: t('MSG_TXT_SNGL_PMNT_BASE_PRC'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv4Perf', header: t('MSG_TXT_CHNG') + t('MSG_TXT_COUNT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv5Perf', header: t('MSG_TXT_ELHM_EXCP_ACKMT_PERF'), width: '100', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv1Sell', header: t('MSG_TXT_FXAM') + t('MSG_TXT_COUNT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv2Sell', header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv3Sell', header: t('MSG_TXT_HCR_MSH') + t('MSG_TXT_COUNT'), width: '110', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indvAcc1Ninc', header: t('MSG_TXT_LSTMM') + t('MSG_TXT_CANCEL'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indvAcc2Ninc', header: t('MSG_TXT_THM_NW'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indvAcc3Ninc', header: t('MSG_TXT_NINC'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og1Perf', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og2Perf', header: t('MSG_TXT_RENTAL_BASE_PRC'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og3Perf', header: t('MSG_TXT_SNGL_PMNT_BASE_PRC'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og4Perf', header: t('MSG_TXT_CHNG') + t('MSG_TXT_COUNT'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'ogPerfSum', header: t('MSG_TXT_AGG'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'ogAcc1Ninc', header: t('MSG_TXT_LSTMM') + t('MSG_TXT_CANCEL'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'ogAcc2Ninc', header: t('MSG_TXT_THM_NW'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'ogAcc3Ninc', header: t('MSG_TXT_NINC'), width: '91.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv1Fee', header: t('MSG_TXT_ELHM_PRPN'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv2Fee', header: t('MSG_TXT_ELHM_EXCP_PRPN'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv3Fee', header: t('MSG_TXT_ELHM') + t('MSG_TXT_SAL_INTV'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv4Fee', header: t('MSG_TXT_METG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv5Fee', header: t('MSG_TXT_EDUC'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv6Fee', header: t('MSG_TXT_STMNT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv7Fee', header: t('MSG_TXT_MCHN_CH'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv8Fee', header: `BS${t('MSG_TXT_MGT')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv9Fee', header: `BS${t('MSG_TXT_ENRG')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv10Fee', header: t('MSG_TXT_RGLVL'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv11Fee', header: `WM${t('MSG_TXT_CMNC')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv12Fee', header: `WM${t('MSG_TXT_ETC')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv13Fee', header: t('MSG_TXT_PRR_VST'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv14Fee', header: t('MSG_TXT_UNIFORM'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv15Fee', header: t('MSG_TXT_MAT_HODT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'indv16Fee', header: t('MSG_TXT_ADD') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og1Fee', header: t('MSG_TXT_ELHM_OG_PRPN'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og2Fee', header: t('MSG_TXT_ELHM_EXCP_OG_PRPN'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og3Fee', header: t('MSG_TXT_OG_SELL_ENCRG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og4Fee', header: t('MSG_TXT_EDUC'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og5Fee', header: t('MSG_TXT_NINC_MGT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og6Fee', header: `${t('MSG_TXT_OG_EJT')}1`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og7Fee', header: `${t('MSG_TXT_OG_EJT')}2`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'og8Fee', header: t('MSG_TXT_NB_BRCH'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'etc1Atc', header: t('MSG_TXT_ADSB'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'etc2Atc', header: t('MSG_TXT_MEMBERSHIP'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'etc3Atc', header: t('MSG_TXT_ETC_SPPT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'intbsSum', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'ddtnSum', header: t('MSG_TXT_DDTN_SUM'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aclDsbAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'ogNm', 'prtnrNo', 'prtnrKnm', 'rsbDvCd',
    {
      header: t('MSG_TXT_BIZ_RGST_ARTC'),
      direction: 'horizontal',
      items: ['bizRgst1Artc', 'bizRgst2Artc', 'bizRgst3Artc', 'bizRgst4Artc'],
    },
    'prfmtMm', 'prfmtNmn', 'metgDc',
    {
      header: t('MSG_TXT_QLF'),
      direction: 'horizontal',
      items: ['qlf1Atc', 'qlf2Atc'],
    },
    {
      header: t('MSG_TXT_EDUC'),
      direction: 'horizontal',
      items: ['edu1Atc', 'edu2Atc', 'edu3Atc', 'edu4Atc', 'edu5Atc', 'edu6Atc', 'edu10Atc', 'edu7Atc', 'edu8Atc', 'edu9Atc'],
    },
    {
      header: t('MSG_TXT_MANAGER') + t('MSG_TXT_OPNG_ARTC'),
      direction: 'horizontal',
      items: ['mngr1Atc', 'mngr2Atc', 'mngr3Atc', 'mngr4Atc', 'mngr5Atc', 'mngr6Atc', 'mngr7Atc'],
    },
    {
      header: `${t('MSG_TXT_INDV')}BS`,
      direction: 'horizontal',
      items: ['indv1BsAtc', 'indv2BsAtc', 'indv3BsAtc', 'indv4BsAtc', 'indv5BsAtc', 'indv6BsAtc'],
    },
    {
      header: `${t('MSG_TXT_OG')}BS`,
      direction: 'horizontal',
      items: ['og1BsAtc', 'og2BsAtc', 'og3BsAtc', 'og4BsAtc'],
    },
    {
      header: t('MSG_TXT_INDV_PERF'),
      direction: 'horizontal',
      items: ['indv1Perf', 'indv2Perf', 'indv3Perf', 'indv4Perf', 'indv5Perf'],
    },
    {
      header: t('MSG_TXT_INDV') + t('MSG_TXT_ETC') + t('MSG_TXT_SELL'),
      direction: 'horizontal',
      items: ['indv1Sell', 'indv2Sell', 'indv3Sell'],
    },
    {
      header: t('MSG_TXT_INDV') + t('MSG_TXT_ACC_NINC'),
      direction: 'horizontal',
      items: ['indvAcc1Ninc', 'indvAcc2Ninc', 'indvAcc3Ninc'],
    },
    {
      header: t('MSG_TXT_OG_PERF'),
      direction: 'horizontal',
      items: ['og1Perf', 'og2Perf', 'og3Perf', 'og4Perf', 'ogPerfSum'],
    },
    {
      header: t('MSG_TXT_OG') + t('MSG_TXT_ACC_NINC'),
      direction: 'horizontal',
      items: ['ogAcc1Ninc', 'ogAcc2Ninc', 'ogAcc3Ninc'],
    },
    {
      header: t('MSG_TXT_PRSNL_FEE'),
      direction: 'horizontal',
      items: ['indv1Fee', 'indv2Fee', 'indv3Fee', 'indv4Fee', 'indv5Fee', 'indv6Fee', 'indv7Fee', 'indv8Fee', 'indv9Fee', 'indv10Fee', 'indv11Fee', 'indv12Fee', 'indv13Fee', 'indv14Fee', 'indv15Fee', 'indv16Fee'],
    },
    {
      header: t('MSG_TXT_ORGNSTN_FEE'),
      direction: 'horizontal',
      items: ['og1Fee', 'og2Fee', 'og3Fee', 'og4Fee', 'og5Fee', 'og6Fee', 'og7Fee', 'og8Fee'],
    },
    {
      header: t('MSG_TXT_ETC'),
      direction: 'horizontal',
      items: ['etc1Atc', 'etc2Atc', 'etc3Atc'],
    },
    {
      header: t('MSG_TXT_FEE_SUM'),
      direction: 'horizontal',
      items: ['intbsSum', 'ddtnSum', 'aclDsbAmt'],
    },

  ]);
});

const initGrd4Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogCd' },
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
    { fieldName: 'ojtCnt' },
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
    { fieldName: 'akcda17', dataType: 'number' },
    { fieldName: 'akcda18', dataType: 'number' },
    { fieldName: 'akcda1', dataType: 'number' },
    { fieldName: 'akcdq1', dataType: 'number' },
    { fieldName: 'akcdq0', dataType: 'number' },
    { fieldName: 'akcdq7', dataType: 'number' },
    { fieldName: 'akdet3', dataType: 'number' },
    { fieldName: 'jasamt', dataType: 'number' },
    { fieldName: 'akcda12', dataType: 'number' },
    { fieldName: 'akcda13', dataType: 'number' },
    { fieldName: 'akcda14', dataType: 'number' },
    { fieldName: 'akcda15', dataType: 'number' },
    { fieldName: 'akcda16', dataType: 'number' },
    { fieldName: 'akcdq5', dataType: 'number' },
    { fieldName: 'akcdq6', dataType: 'number' },
    { fieldName: 'akcda19', dataType: 'number' },
    { fieldName: 'jakcdq0', dataType: 'number' },
    { fieldName: 'jakcdq6', dataType: 'number' },
    { fieldName: 'jakcda12', dataType: 'number' },
    { fieldName: 'jakcda13', dataType: 'number' },
    { fieldName: 'jakcda15', dataType: 'number' },
    { fieldName: 'aksd49', dataType: 'number' },
    { fieldName: 'aksd43', dataType: 'number' },
    { fieldName: 'aksd26', dataType: 'number' },
    { fieldName: 'aksd29', dataType: 'number' },
    { fieldName: 'sd26m1', dataType: 'number' },
    { fieldName: 'sd26m2', dataType: 'number' },
    { fieldName: 'sd26mt', dataType: 'number' },
    { fieldName: 'aksd17', dataType: 'number' },
    { fieldName: 'aksd50', dataType: 'number' },
    { fieldName: 'aksd48', dataType: 'number' },
    { fieldName: 'aksd04', dataType: 'number' },
    { fieldName: 'aksd15', dataType: 'number' },
    { fieldName: 'aksd23', dataType: 'number' },
    { fieldName: 'aksd42', dataType: 'number' },
    { fieldName: 'aksd31', dataType: 'number' },
    { fieldName: 'aksd34', dataType: 'number' },
    { fieldName: 'aksd11', dataType: 'number' },
    { fieldName: 'aksd08', dataType: 'number' },
    { fieldName: 'aksd22', dataType: 'number' },
    { fieldName: 'aksd13', dataType: 'number' },
    { fieldName: 'aksd09', dataType: 'number' },
    { fieldName: 'aksd36', dataType: 'number' },
    { fieldName: 'aksd05', dataType: 'number' },
    { fieldName: 'aksd14', dataType: 'number' },
    { fieldName: 'aksd39', dataType: 'number' },
    { fieldName: 'aksd18', dataType: 'number' },
    { fieldName: 'aksd19', dataType: 'number' },
    { fieldName: 'aksd40', dataType: 'number' },
    { fieldName: 'aksd16', dataType: 'number' },
    { fieldName: 'aksd10', dataType: 'number' },
    { fieldName: 'lccntt', dataType: 'number' },
    { fieldName: 'intbsSum', dataType: 'number' },
    { fieldName: 'ddtnSum', dataType: 'number' },
    { fieldName: 'aclDsbAmt', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '88.7', styleName: 'text-center', options: codes.RSB_DV_CD },
    { fieldName: 'akcuil', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '91.4' },
    { fieldName: 'akdmi3', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '91.4', options: codes.QLF_DV_CD },
    { fieldName: 'akdmi32', header: 'M+1', width: '91.4', styleName: 'text-center', options: codes.QLF_DV_CD },
    { fieldName: 'edustr', header: t('MSG_TXT_MANAGER'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu011', header: t('MSG_TXT_PLAR'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'edu129', header: t('MSG_TXT_CMPF') + t('MSG_TXT_EDUC'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'edu106', header: t('MSG_TXT_STMNT'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'akdcha', header: t('MSG_TXT_NMN'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu017', header: t('MSG_TXT_PRTIC'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'ojtCnt', header: `OJT${t('MSG_TXT_DC')}`, width: '91.4', styleName: 'text-center' },
    { fieldName: 'akdsym', header: t('MSG_TXT_RGS') + t('MSG_TXT_BASE_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdenm', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdjem', header: t('MSG_TXT_RETR') + t('MSG_TXT_MON'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdlym', header: t('MSG_TXT_FNL_CLTN_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdcym', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdrym', header: t('MSG_TXT_PRFMT_MON'), width: '89.3', styleName: 'text-center' },
    { fieldName: 'sustym', header: t('MSG_TXT_RGS') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'suscym', header: t('MSG_TXT_CLTN') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'lccoym', header: `WM${t('MSG_TXT_OPNG')}`, width: '122.7', styleName: 'text-center' },
    { fieldName: 'lcccym', header: `WM${t('MSG_TXT_CLTN')}`, width: '122.7', styleName: 'text-center' },
    { fieldName: 'dalsyn', header: t('MSG_TXT_ACL_ACTI') + t('MSG_TXT_ACHV'), width: '110.4', styleName: 'text-center' },
    { fieldName: 'akcda17', header: t('MSG_TXT_RENTAL'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda18', header: t('MSG_TXT_SNGL_PMNT'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda1', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcdq1', header: t('MSG_TXT_ELHM') + t('MSG_TXT_NTOR') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcdq0', header: t('MSG_TXT_INDV') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcdq7', header: `${t('MSG_TXT_INDV')}BS${t('MSG_TXT_ACKMT')}${t('MSG_TXT_COUNT')}`, width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akdet3', header: t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jasamt', header: t('MSG_TXT_AMT'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda12', header: t('MSG_TXT_RENTAL'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda13', header: t('MSG_TXT_SNGL_PMNT'), width: '139.2', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda14', header: t('MSG_TXT_FXAM'), width: '176', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda15', header: t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda16', header: t('MSG_TXT_FXAM'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcdq5', header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcdq6', header: t('MSG_TXT_INDV') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda19', header: t('MSG_TXT_HOME_CARE') + t('TXT_MSG_SELL_PRC'), width: '128.1', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jakcdq0', header: t('MSG_TXT_OG') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jakcdq6', header: t('MSG_TXT_OG') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jakcda12', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_RENTAL'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jakcda13', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jakcda15', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd49', header: t('MSG_TXT_HOME_CARE'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd43', header: t('MSG_TXT_LIVE_PAKG'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd26', header: t('MSG_TXT_ELHM_PRPN'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd29', header: t('MSG_TXT_ELHM_EXCP_PRPN'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'sd26m1', header: t('MSG_TXT_ELHM_METG'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'sd26m2', header: t('MSG_TXT_SPAY_METG'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'sd26mt', header: t('MSG_TXT_ELHM_EXCP_METG'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd17', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd50', header: t('MSG_TXT_EDUC'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd48', header: t('MSG_TXT_STMNT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd04', header: t('MSG_TXT_MCHN_CH'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd15', header: `BS${t('MSG_TXT_MGT')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd23', header: t('MSG_TXT_RGLVL'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd42', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG') + t('MSG_TXT_RETT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd31', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd34', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd11', header: t('MSG_TXT_OG') + t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd08', header: t('MSG_TXT_NEW') + t('MSG_TXT_SELL'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd22', header: t('MSG_TXT_OG') + t('MSG_TXT_MGT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd13', header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}1`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd09', header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}2`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd36', header: t('MSG_TXT_NB') + t('MSG_TXT_BRANCH'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd05', header: t('MSG_TXT_MEMBERSHIP'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd14', header: t('MSG_TXT_ADSB'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd39', header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd18', header: `WM${t('MSG_TXT_CMNC')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd19', header: `WM${t('MSG_TXT_ETC')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd40', header: t('MSG_TXT_PRR_VST'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd16', header: t('MSG_TXT_UNIFORM'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd10', header: t('MSG_TXT_MAT_HODT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'lccntt', header: `BS${t('MSG_TXT_COMPLETE')}${t('MSG_TXT_ACC')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'intbsSum', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'ddtnSum', header: t('MSG_TXT_DDTN_SUM'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aclDsbAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'ogCd', 'prtnrNo', 'prtnrKnm', 'rsbDvCd', 'akcuil',
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
    'ojtCnt', 'akdsym', 'akdenm', 'akdjem', 'akdlym', 'akdcym', 'akdrym',

    {
      header: t('MSG_TXT_TOPMR_PLAR'),
      direction: 'horizontal',
      items: ['sustym', 'suscym'],
    },
    'lccoym', 'lcccym', 'dalsyn',
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
      header: `${t('MSG_TXT_OG')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['jakcda12', 'jakcda13', 'jakcda15'],
    },
    'aksd49', 'aksd43', 'aksd26', 'aksd29',
    'sd26m1', 'sd26m2', 'sd26mt', 'aksd17', 'aksd50', 'aksd48', 'aksd04', 'aksd15', 'aksd23',
    'aksd42', 'aksd31', 'aksd34', 'aksd11', 'aksd08', 'aksd22', 'aksd13', 'aksd09', 'aksd36',
    'aksd05', 'aksd14', 'aksd39', 'aksd18', 'aksd19', 'aksd40', 'aksd16', 'aksd10', 'lccntt',
    'intbsSum', 'ddtnSum', 'aclDsbAmt',
  ]);
});

const initGrd5Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'rsbDvCd' },
    { fieldName: 'akcuil' },
    { fieldName: 'akdmi3' },
    { fieldName: 'akdmi32' },
    { fieldName: 'edu106' },
    { fieldName: 'akdcha' },
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
    { fieldName: 'spscnt', dataType: 'number' },
    { fieldName: 'dancnt', dataType: 'number' },
    { fieldName: 'akcda17', dataType: 'number' },
    { fieldName: 'akcda18', dataType: 'number' },
    { fieldName: 'akcda1', dataType: 'number' },
    { fieldName: 'akcdq1', dataType: 'number' },
    { fieldName: 'akcdq0', dataType: 'number' },
    { fieldName: 'akcdq7', dataType: 'number' },
    { fieldName: 'akdet3', dataType: 'number' },
    { fieldName: 'jasamt', dataType: 'number' },
    { fieldName: 'akcda12', dataType: 'number' },
    { fieldName: 'akcda13', dataType: 'number' },
    { fieldName: 'akcda14', dataType: 'number' },
    { fieldName: 'akcda15', dataType: 'number' },
    { fieldName: 'akcda16', dataType: 'number' },
    { fieldName: 'akcdq5', dataType: 'number' },
    { fieldName: 'akcdq6', dataType: 'number' },
    { fieldName: 'akcda19', dataType: 'number' },
    { fieldName: 'jakcdq0', dataType: 'number' },
    { fieldName: 'jakcdq6', dataType: 'number' },
    { fieldName: 'jakcda12', dataType: 'number' },
    { fieldName: 'jakcda13', dataType: 'number' },
    { fieldName: 'jakcda15', dataType: 'number' },
    { fieldName: 'aksd49', dataType: 'number' },
    { fieldName: 'aksd43', dataType: 'number' },
    { fieldName: 'aksd26', dataType: 'number' },
    { fieldName: 'aksd29', dataType: 'number' },
    { fieldName: 'aksd17', dataType: 'number' },
    { fieldName: 'aksd50', dataType: 'number' },
    { fieldName: 'aksd48', dataType: 'number' },
    { fieldName: 'aksd04', dataType: 'number' },
    { fieldName: 'aksd15', dataType: 'number' },
    { fieldName: 'aksd23', dataType: 'number' },
    { fieldName: 'aksd42', dataType: 'number' },
    { fieldName: 'aksd31', dataType: 'number' },
    { fieldName: 'aksd34', dataType: 'number' },
    { fieldName: 'aksd11', dataType: 'number' },
    { fieldName: 'aksd08', dataType: 'number' },
    { fieldName: 'aksd22', dataType: 'number' },
    { fieldName: 'aksd06', dataType: 'number' },
    { fieldName: 'aksd13', dataType: 'number' },
    { fieldName: 'aksd09', dataType: 'number' },
    { fieldName: 'aksd36', dataType: 'number' },
    { fieldName: 'aksd05', dataType: 'number' },
    { fieldName: 'aksd14', dataType: 'number' },
    { fieldName: 'aksd39', dataType: 'number' },
    { fieldName: 'aksd18', dataType: 'number' },
    { fieldName: 'aksd19', dataType: 'number' },
    { fieldName: 'aksd40', dataType: 'number' },
    { fieldName: 'aksd16', dataType: 'number' },
    { fieldName: 'aksd10', dataType: 'number' },
    { fieldName: 'lccntt', dataType: 'number' },
    { fieldName: 'intbsSum', dataType: 'number' },
    { fieldName: 'ddtnSum', dataType: 'number' },
    { fieldName: 'aclDsbAmt', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '88.7', styleName: 'text-center', options: codes.RSB_DV_CD },
    { fieldName: 'akcuil', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '91.4', styleName: 'text-right' },
    { fieldName: 'akdmi3', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '91.4', options: codes.QLF_DV_CD },
    { fieldName: 'akdmi32', header: 'M+1', width: '91.4', styleName: 'text-center', options: codes.QLF_DV_CD },
    { fieldName: 'edu106', header: t('MSG_TXT_STMNT'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'akdcha', header: t('MSG_TXT_NMN'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu135', header: t('MSG_TXT_BRMGR') + t('MSG_TXT_ONL'), width: '88.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'akdsym', header: t('MSG_TXT_RGS') + t('MSG_TXT_BASE_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdenm', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '122.7', styleName: 'text-center' },
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
    { fieldName: 'spscnt', header: 'SP', width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'dancnt', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_PERSONS'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda17', header: t('MSG_TXT_RENTAL'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda18', header: t('MSG_TXT_SNGL_PMNT'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda1', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcdq1', header: t('MSG_TXT_ELHM') + t('MSG_TXT_NTOR') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcdq0', header: t('MSG_TXT_INDV') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcdq7', header: `${t('MSG_TXT_INDV')}BS${t('MSG_TXT_ACKMT')}${t('MSG_TXT_COUNT')}`, width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akdet3', header: t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jasamt', header: t('MSG_TXT_AMT'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda12', header: t('MSG_TXT_RENTAL'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda13', header: t('MSG_TXT_SNGL_PMNT'), width: '139.2', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda14', header: t('MSG_TXT_FXAM'), width: '176', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda15', header: t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda16', header: t('MSG_TXT_FXAM'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcdq5', header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcdq6', header: t('MSG_TXT_INDV') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda19', header: t('MSG_TXT_HOME_CARE') + t('TXT_MSG_SELL_PRC'), width: '128.1', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jakcdq0', header: t('MSG_TXT_OG') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jakcdq6', header: t('MSG_TXT_OG') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jakcda12', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_RENTAL'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jakcda13', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jakcda15', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd49', header: t('MSG_TXT_HOME_CARE'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd43', header: t('MSG_TXT_LIVE_PAKG'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd26', header: t('MSG_TXT_ELHM') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd29', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd17', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd50', header: t('MSG_TXT_EDUC'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd48', header: t('MSG_TXT_STMNT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd04', header: t('MSG_TXT_MCHN_CH'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd15', header: `BS${t('MSG_TXT_MGT')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd23', header: t('MSG_TXT_RGLVL'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd42', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG') + t('MSG_TXT_RETT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd31', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd34', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd11', header: t('MSG_TXT_OG') + t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd08', header: t('MSG_TXT_NEW') + t('MSG_TXT_SELL'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd22', header: t('MSG_TXT_OG') + t('MSG_TXT_MGT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd06', header: t('MSG_TXT_ADD') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd13', header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}1`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd09', header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}2`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd36', header: t('MSG_TXT_NB') + t('MSG_TXT_BRANCH'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd05', header: t('MSG_TXT_MEMBERSHIP'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd14', header: t('MSG_TXT_ADSB'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd39', header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd18', header: `WM${t('MSG_TXT_CMNC')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd19', header: `WM${t('MSG_TXT_ETC')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd40', header: t('MSG_TXT_PRR_VST'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd16', header: t('MSG_TXT_UNIFORM'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd10', header: t('MSG_TXT_MAT_HODT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'lccntt', header: `BS${t('MSG_TXT_COMPLETE')}${t('MSG_TXT_ACC')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'intbsSum', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'ddtnSum', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_DDTN_AMT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aclDsbAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },

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
      items: ['edu106', 'akdcha'],
    },
    'edu135', 'akdsym', 'akdenm', 'akdjem', 'akdlym', 'akdcym', 'akdrym',
    {
      header: t('MSG_TXT_TOPMR_PLAR'),
      direction: 'horizontal',
      items: ['sustym', 'suscym'],
    },
    'lccoym', 'lcccym',
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
      header: `${t('MSG_TXT_OG')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
      direction: 'horizontal',
      items: ['jakcda12', 'jakcda13', 'jakcda15'],
    },
    'aksd49', 'aksd43', 'aksd26', 'aksd29', 'aksd17', 'aksd50', 'aksd48', 'aksd04',
    'aksd15', 'aksd23', 'aksd42', 'aksd31', 'aksd34', 'aksd11', 'aksd08', 'aksd22',
    'aksd06', 'aksd13', 'aksd09', 'aksd36', 'aksd05', 'aksd14', 'aksd39', 'aksd18',
    'aksd19', 'aksd40', 'aksd16', 'aksd10', 'lccntt', 'intbsSum', 'ddtnSum', 'aclDsbAmt',

  ]);
});

const initGrd6Main = defineGrid((data, view) => {
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
    { fieldName: 'spscnt', dataType: 'number' },
    { fieldName: 'dancnt', dataType: 'number' },
    { fieldName: 'akcda17', dataType: 'number' },
    { fieldName: 'akcda18', dataType: 'number' },
    { fieldName: 'akcda1', dataType: 'number' },
    { fieldName: 'akcdq1', dataType: 'number' },
    { fieldName: 'akcdq0', dataType: 'number' },
    { fieldName: 'akcdq7', dataType: 'number' },
    { fieldName: 'akdet3', dataType: 'number' },
    { fieldName: 'jasamt', dataType: 'number' },
    { fieldName: 'akcda12', dataType: 'number' },
    { fieldName: 'akcda13', dataType: 'number' },
    { fieldName: 'akcda14', dataType: 'number' },
    { fieldName: 'akcda15', dataType: 'number' },
    { fieldName: 'akcda16', dataType: 'number' },
    { fieldName: 'akcdq5', dataType: 'number' },
    { fieldName: 'akcdq6', dataType: 'number' },
    { fieldName: 'akcda19', dataType: 'number' },
    { fieldName: 'jakcdq0', dataType: 'number' },
    { fieldName: 'jakcdq6', dataType: 'number' },
    { fieldName: 'jakcda12', dataType: 'number' },
    { fieldName: 'jakcda13', dataType: 'number' },
    { fieldName: 'jakcda15', dataType: 'number' },
    { fieldName: 'aksd49', dataType: 'number' },
    { fieldName: 'aksd43', dataType: 'number' },
    { fieldName: 'aksd26', dataType: 'number' },
    { fieldName: 'aksd29', dataType: 'number' },
    { fieldName: 'sd26m1', dataType: 'number' },
    { fieldName: 'sd26m2', dataType: 'number' },
    { fieldName: 'sd26mt', dataType: 'number' },
    { fieldName: 'aksd17', dataType: 'number' },
    { fieldName: 'aksd50', dataType: 'number' },
    { fieldName: 'aksd48', dataType: 'number' },
    { fieldName: 'aksd04', dataType: 'number' },
    { fieldName: 'aksd15', dataType: 'number' },
    { fieldName: 'aksd23', dataType: 'number' },
    { fieldName: 'aksd42', dataType: 'number' },
    { fieldName: 'aksd31', dataType: 'number' },
    { fieldName: 'aksd34', dataType: 'number' },
    { fieldName: 'aksd11', dataType: 'number' },
    { fieldName: 'aksd08', dataType: 'number' },
    { fieldName: 'aksd22', dataType: 'number' },
    { fieldName: 'aksd06', dataType: 'number' },
    { fieldName: 'aksd13', dataType: 'number' },
    { fieldName: 'aksd09', dataType: 'number' },
    { fieldName: 'aksd36', dataType: 'number' },
    { fieldName: 'aksd05', dataType: 'number' },
    { fieldName: 'aksd14', dataType: 'number' },
    { fieldName: 'aksd39', dataType: 'number' },
    { fieldName: 'aksd18', dataType: 'number' },
    { fieldName: 'aksd19', dataType: 'number' },
    { fieldName: 'aksd40', dataType: 'number' },
    { fieldName: 'aksd16', dataType: 'number' },
    { fieldName: 'aksd10', dataType: 'number' },
    { fieldName: 'lccntt', dataType: 'number' },
    { fieldName: 'intbsSum', dataType: 'number' },
    { fieldName: 'ddtnSum', dataType: 'number' },
    { fieldName: 'aclDsbAmt', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '88.7', styleName: 'text-center', options: codes.RSB_DV_CD },
    { fieldName: 'akcuil', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '91.4', styleName: 'text-right' },
    { fieldName: 'akdmi3', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '91.4', options: codes.QLF_DV_CD },
    { fieldName: 'akdmi32', header: 'M+1', width: '91.4', styleName: 'text-center', options: codes.QLF_DV_CD },
    { fieldName: 'edustr', header: t('MSG_TXT_MANAGER'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu011', header: t('MSG_TXT_PLAR'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'edu129', header: t('MSG_TXT_CMPF') + t('MSG_TXT_EDUC'), width: '88.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'edu106', header: t('MSG_TXT_STMNT'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'akdcha', header: t('MSG_TXT_NMN'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'edu017', header: t('MSG_TXT_PRTIC'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'edu135', header: t('MSG_TXT_BRMGR') + t('MSG_TXT_ONL'), width: '88.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'ojtcnt', header: `OJT${t('MSG_TXT_DC')}`, width: '122.7', styleName: 'text-right' },
    { fieldName: 'akdsym', header: t('MSG_TXT_RGS') + t('MSG_TXT_BASE_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdenm', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdjem', header: t('MSG_TXT_RETR') + t('MSG_TXT_MON'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdlym', header: t('MSG_TXT_FNL_CLTN_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdcym', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akdrym', header: t('MSG_TXT_PRFMT_MON'), width: '89.3', styleName: 'text-center' },
    { fieldName: 'sustym', header: t('MSG_TXT_RGS') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'suscym', header: t('MSG_TXT_CLTN') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center' },
    { fieldName: 'lccoym', header: `WM${t('MSG_TXT_OPNG')}`, width: '122.7', styleName: 'text-center' },
    { fieldName: 'lcccym', header: `WM${t('MSG_TXT_CLTN')}`, width: '122.7', styleName: 'text-center' },
    { fieldName: 'dalsyn', header: t('MSG_TXT_ACL_ACTI') + t('MSG_TXT_ACHV'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'bondalsyn', header: t('MSG_TXT_MIN') + t('MSG_TXT_BASE') + t('MSG_TXT_ACHV'), width: '110.4', styleName: 'text-center' },
    { fieldName: 'sungnm', header: t('MSG_TXT_LSTMM') + t('MSG_TXT_CPR') + t('MSG_TXT_DIV'), width: '110.4', styleName: 'text-center' },
    { fieldName: 'wpscnt', header: 'WP', width: '110.4', styleName: 'text-center' },
    { fieldName: 'wmscnt', header: 'WM', width: '122.7', styleName: 'text-right' },
    { fieldName: 'spscnt', header: 'SP', width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'dancnt', header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_PERSONS'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda17', header: t('MSG_TXT_RENTAL'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda18', header: t('MSG_TXT_SNGL_PMNT'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda1', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcdq1', header: t('MSG_TXT_ELHM') + t('MSG_TXT_NTOR') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcdq0', header: t('MSG_TXT_INDV') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcdq7', header: `${t('MSG_TXT_INDV')}BS${t('MSG_TXT_ACKMT')}${t('MSG_TXT_COUNT')}`, width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akdet3', header: t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jasamt', header: t('MSG_TXT_AMT'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda12', header: t('MSG_TXT_RENTAL'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda13', header: t('MSG_TXT_SNGL_PMNT'), width: '139.2', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda14', header: t('MSG_TXT_FXAM'), width: '176', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda15', header: t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda16', header: t('MSG_TXT_FXAM'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcdq5', header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'), width: '110.4', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcdq6', header: t('MSG_TXT_INDV') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'akcda19', header: t('MSG_TXT_HOME_CARE') + t('TXT_MSG_SELL_PRC'), width: '128.1', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jakcdq0', header: t('MSG_TXT_OG') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jakcdq6', header: t('MSG_TXT_OG') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jakcda12', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_RENTAL'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jakcda13', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'jakcda15', header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_SNGL_PMNT'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd49', header: t('MSG_TXT_HOME_CARE'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd43', header: t('MSG_TXT_LIVE_PAKG'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd26', header: t('MSG_TXT_ELHM') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd29', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'sd26m1', header: t('MSG_TXT_ELHM') + t('MSG_TXT_METG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'sd26m2', header: t('MSG_TXT_SNGL_PMNT') + t('MSG_TXT_METG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'sd26mt', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_METG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd17', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd50', header: t('MSG_TXT_EDUC'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd48', header: t('MSG_TXT_STMNT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd04', header: t('MSG_TXT_MCHN_CH'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd15', header: `BS${t('MSG_TXT_MGT')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd23', header: t('MSG_TXT_RGLVL'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd42', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG') + t('MSG_TXT_RETT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd31', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd34', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd11', header: t('MSG_TXT_OG') + t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd08', header: t('MSG_TXT_NEW') + t('MSG_TXT_SELL'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd22', header: t('MSG_TXT_OG') + t('MSG_TXT_MGT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd06', header: t('MSG_TXT_ADD') + t('MSG_TXT_ENRG'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd13', header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}1`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd09', header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}2`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd36', header: t('MSG_TXT_NB') + t('MSG_TXT_BRANCH'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd05', header: t('MSG_TXT_MEMBERSHIP'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd14', header: t('MSG_TXT_ADSB'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd39', header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd18', header: `WM${t('MSG_TXT_CMNC')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd19', header: `WM${t('MSG_TXT_ETC')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd40', header: t('MSG_TXT_PRR_VST'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd16', header: t('MSG_TXT_UNIFORM'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aksd10', header: t('MSG_TXT_MAT_HODT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'lccntt', header: `BS${t('MSG_TXT_COMPLETE')}${t('MSG_TXT_ACC')}`, width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'intbsSum', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'ddtnSum', header: t('MSG_TXT_DDTN_SUM'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'aclDsbAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '129', styleName: 'text-right', numberFormat: '#,###,##0' },

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
      header: `${t('MSG_TXT_OG')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
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
