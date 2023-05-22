<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebOgFeePlannerListM - P조직 수수료 생성관리
3. 작성자 : gs.piit150
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
          :label="$t('MSG_TXT_RSB_TP')"
          required
        >
          <kw-option-group
            v-model="searchParams.rsbTp"
            :label="$t('MSG_TXT_RSB_TP')"
            type="radio"
            :options="filterRsbDvCd"
            first-option
            first-option-value=""
            :first-option-label="$t('MSG_TXT_ALL')"
            @change="onChangedRsbTp"
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
      <!-- STEPER -->
      <zwfey-fee-step
        ref="stepNaviRef"
        :key="searchParams.perfYm+searchParams.feeSchdTpCd"
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
          <span class="ml8">({{ $t('MSG_TXT_UNIT_COLON_WON') }})</span>
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

import { useDataService, getComponentType, useGlobal, gridUtil, defineGrid, codeUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import ZwfeyFeeStep from '~sms-common/fee/pages/schedule/ZwfeyFeeStep.vue';

const { t } = useI18n();
const { notify, modal, confirm, alert } = useGlobal();
const dataService = useDataService();
const isGrid1Visile = ref(false);
const isGrid2Visile = ref(false);
const isGrid3Visile = ref(true);
const isExcelDown = ref(false);
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const maxDate = dayjs().format('YYYY-MM');
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const stepNaviRef = ref();
const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
);
const filterRsbDvCd = codes.RSB_DV_CD.filter((v) => ['W0105', 'W0104'].includes(v.codeId));
const searchParams = ref({

  perfYm: now.format('YYYYMM'),
  rsbTp: '',
  rsbTpTxt: '',
  no: '',
  ogLevl1: '',
  ogLevl2: '',
  ogLevl3: '',
  statTitle: t('MSG_TXT_PRGS_STE'),
  ogTp: 'W01',
  feeSchdTpCd: '', // 웰스P조직
  feeTcntDvCd: '02',
  coCd: '2000',

});

let cachedParams;

// 번호 검색 아이콘 클릭 이벤트
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.no,
      ogTpCd: 'W01',
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.no = payload.prtnrNo;
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
  searchParams.value.statTitle = t('MSG_TXT_PRGS_STE');
  stepNaviRef.value.initProps();
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
  const { rsbTp } = searchParams.value;
  if (rsbTp === 'W0105') {
    isGrid1Visile.value = true;
    isGrid2Visile.value = false;
    isGrid3Visile.value = false;
    searchParams.value.feeSchdTpCd = '101';
  } else if (rsbTp === 'W0104') {
    isGrid1Visile.value = false;
    isGrid2Visile.value = true;
    isGrid3Visile.value = false;
    searchParams.value.feeSchdTpCd = '102';
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
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

/*
 *  Event - 조회 후 상단 title 변경
 */
async function setTitle() {
  const { perfYm } = searchParams.value;
  const { rsbTp } = searchParams.value;
  searchParams.value.statTitle = `${perfYm.substring(0, 4) + t('MSG_TXT_YEAR')} ${perfYm.substring(4, 6)}${t('MSG_TXT_MON')}`;
  if (rsbTp !== '') {
    const { codeName } = codes.RSB_DV_CD.find((v) => v.codeId === rsbTp);
    searchParams.value.rsbTpTxt = codeName;
    searchParams.value.statTitle += ` ${codeName} ${t('MSG_TXT_PRGS_STE')}`;
  } else {
    searchParams.value.rsbTpTxt = '';
    searchParams.value.statTitle += ` ${t('MSG_TXT_PRGS_STE')}`;
  }
}

/*
 *  Event - 그리드 조회
 */
async function fetchData() {
  let uri = '';
  const prtnrNo = searchParams.value.no;
  stepNaviRef.value.initProps();

  if (isGrid2Visile.value === true) {
    uri = '-brmgr';
  } else if (isGrid3Visile.value === true) {
    uri = '-total';
  }
  const response = await dataService.get(`/sms/wells/fee/organization-fees/plars${uri}`, { params: cachedParams });
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
  view.resetCurrent();
  await setTitle();
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
    fetchData();
  }
}

/*
 *  Event - 미팅집계 클릭 ※
 */
async function onClickW101P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { schOrdr } = searchParams.value;
  const { codeName } = codes.FEE_TCNT_DV_CD.find((v) => v.codeId === searchParams.value.schOrdr);
  const { perfYm } = searchParams.value;
  if (searchParams.value.rsbTp === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    if (schOrdr === '01') {
      searchParams.value.schOrdrTxt = '1차';
    } else {
      searchParams.value.schOrdrTxt = '2차';
    }
    const param = {
      ogTpCd: 'W01',
      ogTpCdTxt: 'P추진단',
      perfYm: `${perfYm.substring(0, 4)}-${perfYm.substring(4, 6)}`,
      feeTcntDvCd: searchParams.value.schOrdr,
      feeTcntDvCdTxt: codeName,
      rsbTpCd: searchParams.value.rsbTp,
    };
    const { result: isChanged } = await modal({
      component: 'ZwfeaFeeMeetingAttendanceRegP',
      componentProps: param,
    });
    if (isChanged) {
      await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
      fetchData();
    }
  }
}

/*
 *  Event - 수수료생성 클릭 ※팝업 개발 미완료 상태
 */
async function onClickW102P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
  fetchData();
}

/*
 *  Event - 기타지원 업로드 클릭 ※업무개발에서 별도개발
 */
async function onClickW104P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
  fetchData();
}

/*
 *  Event - 세금공제 클릭 ※
 */
async function onClickW105P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { schOrdr } = searchParams.value;
  const { codeName } = codes.FEE_TCNT_DV_CD.find((v) => v.codeId === searchParams.value.schOrdr);
  const { perfYm } = searchParams.value;
  if (searchParams.value.rsbTp === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    if (schOrdr === '01') {
      searchParams.value.schOrdrTxt = '1차';
    } else {
      searchParams.value.schOrdrTxt = '2차';
    }
    const param = {
      ogTpCd: 'W01',
      ogTpCdTxt: 'P추진단',
      ddtnYm: `${perfYm.substring(0, 4)}-${perfYm.substring(4, 6)}`,
      feeTcntDvCd: searchParams.value.schOrdr,
      feeTcntDvCdTxt: codeName,
      rsbTpCd: searchParams.value.rsbTp,
      rsbTpCdTxt: searchParams.value.rsbTpTxt,
    };
    const { result: isChanged } = await modal({
      component: 'ZwfecFeeTaxDeductionRegP',
      componentProps: param,
    });
    if (isChanged) {
      await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
      fetchData();
    }
  }
}

/*
 *  Event - 원천세등록 클릭 ※팝업 개발 미완료 상태
 */
async function onClickW106P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
  fetchData();
}

/*
 *  Event - 고용보험 공제 클릭 ※
 */
async function onClickW108P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { schOrdr } = searchParams.value;
  const { codeName } = codes.FEE_TCNT_DV_CD.find((v) => v.codeId === searchParams.value.schOrdr);
  const { perfYm } = searchParams.value;
  if (searchParams.value.rsbTp === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    if (schOrdr === '01') {
      searchParams.value.schOrdrTxt = '1차';
    } else {
      searchParams.value.schOrdrTxt = '2차';
    }
    const param = {
      ogTpCd: 'W01',
      ogTpCdTxt: 'P추진단',
      ddtnYm: `${perfYm.substring(0, 4)}-${perfYm.substring(4, 6)}`,
      feeTcntDvCd: searchParams.value.schOrdr,
      feeTcntDvCdTxt: codeName,
      rsbTpCd: searchParams.value.rsbTp,
    };
    const { result: isChanged } = await modal({
      component: 'ZwfecFeeEmpInsuranceRegP',
      componentProps: param,
    });
    if (isChanged) {
      await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
      fetchData();
    }
  }
}

/*
 *  Event - 가지급금 공제 클릭 ※
 */
async function onClickW109P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { schOrdr } = searchParams.value;
  const { perfYm } = searchParams.value;
  if (searchParams.value.rsbTp === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    if (schOrdr === '01') {
      searchParams.value.schOrdrTxt = '1차';
    } else {
      searchParams.value.schOrdrTxt = '2차';
    }
    const param = {
      ogTpCd: 'W01',
      ddtnYm: `${perfYm.substring(0, 4)}-${perfYm.substring(4, 6)}`,
      feeTcntDvCd: searchParams.value.schOrdr,
      rsbTpCd: searchParams.value.rsbTp,
    };
    const { result: isChanged } = await modal({
      component: 'ZwfecFeePnpyamDeductionRegP',
      componentProps: param,
    });
    if (isChanged) {
      await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
      fetchData();
    }
  }
}

/*
 *  Event - 부담공제 클릭 ※
 */
async function onClickW113P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { schOrdr } = searchParams.value;
  const { perfYm } = searchParams.value;
  if (searchParams.value.rsbTp === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    if (schOrdr === '01') {
      searchParams.value.schOrdrTxt = '1차';
    } else {
      searchParams.value.schOrdrTxt = '2차';
    }
    const param = {
      ogTpCd: 'W01',
      perfYm: `${perfYm.substring(0, 4)}-${perfYm.substring(4, 6)}`,
      rsbDvCd: searchParams.value.rsbTp,
    };
    const { result: isChanged } = await modal({
      component: 'ZwfecFeeBurdenDeductionRegP',
      componentProps: param,
    });
    if (isChanged) {
      await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
      fetchData();
    }
  }
}

/*
 *  Event - 보증예치금 적립 클릭 ※
 */
async function onClickW115P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { schOrdr } = searchParams.value;
  const { perfYm } = searchParams.value;
  if (searchParams.value.rsbTp === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    if (schOrdr === '01') {
      searchParams.value.schOrdrTxt = '1차';
    } else {
      searchParams.value.schOrdrTxt = '2차';
    }
    const param = {
      ogTpCd: 'W01',
      perfYm: `${perfYm.substring(0, 4)}-${perfYm.substring(4, 6)}`,
      ocYm: `${perfYm.substring(0, 4)}-${perfYm.substring(4, 6)}`,
      rsbDvCd: searchParams.value.rsbTp,
    };
    const { result: isChanged } = await modal({
      component: 'ZwfecFeeRdsReservingRegP',
      componentProps: param,
    });
    if (isChanged) {
      await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
      fetchData();
    }
  }
}

/*
 *  Event - 이체자료 생성 클릭 ※팝업 개발 미완료 상태
 */
async function onClickW116P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
  fetchData();
}

/*
 *  Event - 품의작성 클릭 ※TBD
 */
async function onClickW118P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
  fetchData();
}

/*
 *  Event - 전표생성 클릭 ※TBD
 */
async function onClickW119P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
  fetchData();
}

/*
 *  Event - 선급판매 수수료확정 클릭 ※팝업 개발 미완료 상태
*/

async function onClickW120P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
  fetchData();
}

/**
 * Event - 스텝퍼 클릭
 * 버튼 로직 존재시 해당 로직 서술
 * @params code[String]: 스탭퍼에서 선택한 단계 코드
 *         done[Boolean]: 이전단계로 되돌림 플레그
 */
async function onclickStep(params) {
  if (totalCount.value === 0) {
    alert(t('MSG_ALT_USE_DT_SRCH_AF'));
  } else if (params.done) {
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
    await onClickW119P(params.feeSchdId, params.code, '03');
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
    { fieldName: 'cntrDt' },
    { fieldName: 'fstCntrDt' },
    { fieldName: 'rcntrDt' },
    { fieldName: 'fnlCltnDt' },
    { fieldName: 'cltnDt' },
    { fieldName: 'akstym' },
    { fieldName: 'lcecaymd' },
    { fieldName: 'bAksd05' },
    { fieldName: 'akcda0' },
    { fieldName: 'akcda1' },
    { fieldName: 'akcda2' },
    { fieldName: 'aksq01' },
    { fieldName: 'nAksq01' },
    { fieldName: 'akcda3' },
    { fieldName: 'akcda4' },
    { fieldName: 'akdeq5' },
    { fieldName: 'ec5amt' },
    { fieldName: 'mproduct' },
    { fieldName: 'aksd23' },
    { fieldName: 'aksd24' },
    { fieldName: 'aksd25' },
    { fieldName: 'aksd01' },
    { fieldName: 'aksd02' },
    { fieldName: 'aksd03' },
    { fieldName: 'aksd21' },
    { fieldName: 'aksd04' },
    { fieldName: 'aksd05' },
    { fieldName: 'aksd20' },
    { fieldName: 'aksd30' },
    { fieldName: 'aksd99' },

  ];

  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '88.7' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '88.7' },
    { fieldName: 'akcuil', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '88.7', styleName: 'text-right' },
    { fieldName: 'jagyuk', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '110.6', styleName: 'text-center' },
    { fieldName: 'nJagyuk1', header: `M+1${t('MSG_TXT_TOPMR_PLAR')}`, width: '128.4', styleName: 'text-' },
    { fieldName: 'is11edu', header: t('MSG_TXT_PLAR_SRTUP'), width: '124.6', styleName: 'text-center' },
    { fieldName: 'is17edu', header: t('MSG_TXT_TOPMR') + t('MSG_TXT_PRTIC'), width: '114.8', styleName: 'text-center' },
    { fieldName: 'cntrDt', header: t('MSG_TXT_RGS') + t('MSG_TXT_BASE_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'fstCntrDt', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'rcntrDt', header: t('MSG_TXT_RETR') + t('MSG_TXT_MON'), width: '97.3', styleName: 'text-center' },
    { fieldName: 'fnlCltnDt', header: t('MSG_TXT_FNL_CLTN_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'cltnDt', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akstym', header: t('MSG_TXT_PRFMT_MON'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'lcecaymd', header: t('MSG_TXT_WELS_MNGER') + t('MSG_TXT_OPNG_DT'), width: '132.8', styleName: 'text-center' },
    { fieldName: 'bAksd05', header: t('MSG_TXT_STMNT') + t('MSG_TXT_FEE'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'akcda0', header: t('MSG_TXT_ELHM') + t('MSG_TXT_PERF'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'akcda1', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PERF'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'akcda2', header: t('MSG_TXT_CHNG'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'aksq01', header: t('MSG_TXT_MUTU') + t('MSG_TXT_THM'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'nAksq01', header: t('MSG_TXT_MUTU') + t('MSG_TXT_KEEP'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'akcda3', header: t('MSG_TXT_ENVR'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'akcda4', header: t('MSG_TXT_ENVR') + t('MSG_TXT_EXCP'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'akdeq5', header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'ec5amt', header: t('MSG_TXT_HOME_CARE') + t('TXT_MSG_SELL_PRC'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'mproduct', header: t('MSG_TXT_MGT') + t('MSG_TXT_PRDT') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd23', header: t('MSG_TXT_FXAM') + t('MSG_TXT_FEE'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd24', header: t('MSG_TXT_LIVE_PAKG'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd25', header: t('MSG_TXT_HOME_CARE') + t('MSG_TXT_MEMBERSHIP'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd01', header: t('MSG_TXT_ELHM') + t('MSG_TXT_INDV') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd02', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_INDV') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd03', header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd21', header: t('MSG_TXT_MUTU') + t('MSG_TXT_FEE'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd04', header: t('MSG_TXT_METG') + t('MSG_TXT_FEE'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd05', header: t('MSG_TXT_STMNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd20', header: t('MSG_TXT_ADSB'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd30', header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd99', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '122.7', styleName: 'text-right' },

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
      items: ['jagyuk', 'nJagyuk1'],
    },
    'is11edu', 'is17edu', 'cntrDt', 'fstCntrDt', 'rcntrDt', 'fnlCltnDt', 'cltnDt', 'akstym', 'lcecaymd', 'bAksd05',
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
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'rsbDvCd' },
    { fieldName: 'jagyuk' },
    { fieldName: 'nJagyuk1' },
    { fieldName: 'cntrDt' },
    { fieldName: 'fstCntrDt' },
    { fieldName: 'fnlCltnDt' },
    { fieldName: 'cltnDt' },
    { fieldName: 'gadcnt' },
    { fieldName: 'is17edu' },
    { fieldName: 'akdriy' },
    { fieldName: 'akstym' },
    { fieldName: 'lcecaymd' },
    { fieldName: 'akcda0' },
    { fieldName: 'akcda1' },
    { fieldName: 'akcda2' },
    { fieldName: 'aksq01' },
    { fieldName: 'nAksq01' },
    { fieldName: 'akcdag0' },
    { fieldName: 'akcdag1' },
    { fieldName: 'aksqg02' },
    { fieldName: 'akcda3' },
    { fieldName: 'akcda4' },
    { fieldName: 'akdeq5' },
    { fieldName: 'ec5amt' },
    { fieldName: 'mproduct' },
    { fieldName: 'aksd23' },
    { fieldName: 'aksd24' },
    { fieldName: 'aksd25' },
    { fieldName: 'aksd01' },
    { fieldName: 'aksd02' },
    { fieldName: 'aksd03' },
    { fieldName: 'aksd11' },
    { fieldName: 'aksd12' },
    { fieldName: 'aksd13' },
    { fieldName: 'bAksd05' },
    { fieldName: 'aksd16' },
    { fieldName: 'aksd17' },
    { fieldName: 'aksd15' },
    { fieldName: 'aksd20' },
    { fieldName: 'aksd21' },
    { fieldName: 'aksd22' },
    { fieldName: 'aksd30' },
    { fieldName: 'aksd99' },

  ];

  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '88.7' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '88.7' },
    { fieldName: 'jagyuk', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '88.7', styleName: 'text-right' },
    { fieldName: 'nJagyuk1', header: 'M+1', width: '110.6', styleName: 'text-center' },
    { fieldName: 'cntrDt', header: t('MSG_TXT_RGS') + t('MSG_TXT_BASE_MM'), width: '128.4', styleName: 'text-' },
    { fieldName: 'fstCntrDt', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '124.6', styleName: 'text-center' },
    { fieldName: 'fnlCltnDt', header: t('MSG_TXT_FNL_CLTN_MM'), width: '114.8', styleName: 'text-center' },
    { fieldName: 'cltnDt', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'gadcnt', header: t('MSG_TXT_ACL_ACTI_PPL'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'is17edu', header: t('MSG_TXT_TOPMR') + t('MSG_TXT_PRTIC'), width: '97.3', styleName: 'text-center' },
    { fieldName: 'akdriy', header: t('MSG_TXT_PRFMT_MON'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akstym', header: t('MSG_TXT_TOPMR') + t('MSG_TXT_UPGR_DT'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'lcecaymd', header: t('MSG_TXT_WELS_MNGER') + t('MSG_TXT_OPNG_DT'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'akcda0', header: t('MSG_TXT_ELHM') + t('MSG_TXT_PERF'), width: '132.8', styleName: 'text-center' },
    { fieldName: 'akcda1', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PERF'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'akcda2', header: t('MSG_TXT_CHNG'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'aksq01', header: t('MSG_TXT_MUTU') + t('MSG_TXT_THM'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'nAksq01', header: t('MSG_TXT_MUTU') + t('MSG_TXT_KEEP'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'akcdag0', header: t('MSG_TXT_ELHM') + t('MSG_TXT_PERF'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'akcdag1', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PERF'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'aksqg02', header: t('MSG_TXT_BRANCH') + t('MSG_TXT_MUTU') + t('MSG_TXT_PERF'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'akcda3', header: t('MSG_TXT_ENVR'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'akcda4', header: t('MSG_TXT_ENVR') + t('MSG_TXT_EXCP'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'akdeq5', header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'ec5amt', header: t('MSG_TXT_HOME_CARE') + t('TXT_MSG_SELL_PRC'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'mproduct', header: t('MSG_TXT_MGT') + t('MSG_TXT_PRDT') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd23', header: t('MSG_TXT_FXAM') + t('MSG_TXT_FEE'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd24', header: t('MSG_TXT_LIVE_PAKG'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd25', header: t('MSG_TXT_HOME_CARE'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd01', header: t('MSG_TXT_ELHM') + t('MSG_TXT_INDV') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd02', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_INDV') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd03', header: t('MSG_TXT_INDV') + t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd11', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd12', header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd13', header: t('MSG_TXT_OG') + t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'bAksd05', header: t('MSG_TXT_STMNT') + t('MSG_TXT_FEE'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd16', header: t('MSG_TXT_OG') + t('MSG_TXT_EJT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd17', header: t('MSG_TXT_OG') + t('MSG_TXT_EJT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd15', header: t('MSG_TXT_NB') + t('MSG_TXT_BRANCH'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd20', header: t('MSG_TXT_ADSB'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd21', header: t('MSG_TXT_INDV') + t('MSG_TXT_MUTU') + t('MSG_TXT_FEE'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd22', header: t('MSG_TXT_BRANCH') + t('MSG_TXT_MUTU') + t('MSG_TXT_FEE'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd30', header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd99', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '122.7', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'ogNm', 'prtnrNo', 'prtnrKnm', 'rsbDvCd',
    {
      header: t('MSG_TXT_QLF'),
      direction: 'horizontal',
      items: ['jagyuk', 'nJagyuk1'],
    },
    'cntrDt', 'fstCntrDt', 'fnlCltnDt', 'cltnDt', 'gadcnt', 'is17edu', 'akdriy', 'akstym', 'lcecaymd',
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
    'akdeq5', 'ec5amt', 'mproduct', 'aksd23', 'aksd24', 'aksd25', 'aksd01', 'aksd02', 'aksd03', 'aksd11', 'aksd12', 'aksd13', 'bAksd05', 'aksd16', 'aksd17', 'aksd15', 'aksd20', 'aksd21', 'aksd22', 'aksd30', 'aksd99',

  ]);
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
    { fieldName: 'cntrDt' },
    { fieldName: 'fstCntrDt' },
    { fieldName: 'rcntrDt' },
    { fieldName: 'fnlCltnDt' },
    { fieldName: 'cltnDt' },
    { fieldName: 'lcecaymd' },
    { fieldName: 'gadcnt' },
    { fieldName: 'akstym' },
    { fieldName: 'akdriy' },
    { fieldName: 'bAksd05' },
    { fieldName: 'akcda0' },
    { fieldName: 'akcda1' },
    { fieldName: 'akcda2' },
    { fieldName: 'aksq01' },
    { fieldName: 'nAksq01' },
    { fieldName: 'akcdag0' },
    { fieldName: 'akcdag1' },
    { fieldName: 'aksqg02' },
    { fieldName: 'akcda3' },
    { fieldName: 'akcda4' },
    { fieldName: 'akdeq5' },
    { fieldName: 'ec5amt' },
    { fieldName: 'mproduct' },
    { fieldName: 'aksd24' },
    { fieldName: 'aksd25' },
    { fieldName: 'aksd01' },
    { fieldName: 'aksd02' },
    { fieldName: 'aksd03' },
    { fieldName: 'aksd21' },
    { fieldName: 'aksd11' },
    { fieldName: 'aksd12' },
    { fieldName: 'aksd13' },
    { fieldName: 'aksd22' },
    { fieldName: 'aksd04' },
    { fieldName: 'aksd05' },
    { fieldName: 'aksd16' },
    { fieldName: 'aksd17' },
    { fieldName: 'aksd15' },
    { fieldName: 'aksd20' },
    { fieldName: 'aksd30' },
    { fieldName: 'aksd99' },
    { fieldName: 'ddctam' },
    { fieldName: 'dsbOjAmt' },

  ];

  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88.7', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '88.7' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '88.7' },
    { fieldName: 'akcuil', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '88.7', styleName: 'text-right' },
    { fieldName: 'jagyuk', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '110.6', styleName: 'text-center' },
    { fieldName: 'nJagyuk1', header: 'M+1', width: '128.4', styleName: 'text-' },
    { fieldName: 'is11edu', header: t('MSG_TXT_PLAR_SRTUP'), width: '124.6', styleName: 'text-center' },
    { fieldName: 'is17edu', header: t('MSG_TXT_TOPMR') + t('MSG_TXT_PRTIC'), width: '114.8', styleName: 'text-center' },
    { fieldName: 'cntrDt', header: t('MSG_TXT_RGS') + t('MSG_TXT_BASE_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'fstCntrDt', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'rcntrDt', header: t('MSG_TXT_RETR') + t('MSG_TXT_MON'), width: '97.3', styleName: 'text-center' },
    { fieldName: 'fnlCltnDt', header: t('MSG_TXT_FNL_CLTN_MM'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'cltnDt', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'lcecaymd', header: t('MSG_TXT_WELS_MNGER') + t('MSG_TXT_OPNG_DT'), width: '122.7', styleName: 'text-center' },
    { fieldName: 'gadcnt', header: t('MSG_TXT_ACL_ACTI_PPL'), width: '132.8', styleName: 'text-center' },
    { fieldName: 'akstym', header: t('MSG_TXT_UPGR_MON'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'akdriy', header: t('MSG_TXT_PRFMT_MON'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'bAksd05', header: t('MSG_TXT_STMNT') + t('MSG_TXT_FEE'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'akcda0', header: t('MSG_TXT_ELHM') + t('MSG_TXT_PERF'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'akcda1', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PERF'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'akcda2', header: t('MSG_TXT_CHNG'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'aksq01', header: t('MSG_TXT_MUTU') + t('MSG_TXT_THM'), width: '136.8', styleName: 'text-right' },
    { fieldName: 'nAksq01', header: t('MSG_TXT_MUTU') + t('MSG_TXT_KEEP'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'akcdag0', header: t('MSG_TXT_ELHM') + t('MSG_TXT_PERF'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'akcdag1', header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PERF'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksqg02', header: t('MSG_TXT_MUTU') + t('MSG_TXT_PERF'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'akcda3', header: t('MSG_TXT_ENVR'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'akcda4', header: t('MSG_TXT_ENVR') + t('MSG_TXT_EXCP'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'akdeq5', header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'ec5amt', header: t('MSG_TXT_HOME_CARE') + t('TXT_MSG_SELL_PRC'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'mproduct', header: t('MSG_TXT_MGT') + t('MSG_TXT_PRDT') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd24', header: t('MSG_TXT_LIVE_PAKG'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd25', header: t('MSG_TXT_HOME_CARE'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd01', header: t('MSG_TXT_INDV') + t('MSG_TXT_ELHM') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd02', header: t('MSG_TXT_INDV') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd03', header: t('MSG_TXT_INDV') + t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd21', header: t('MSG_TXT_INDV') + t('MSG_TXT_MUTU'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd11', header: t('MSG_TXT_OG') + t('MSG_TXT_ELHM') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd12', header: t('MSG_TXT_OG') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd13', header: t('MSG_TXT_OG') + t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd22', header: t('MSG_TXT_OG') + t('MSG_TXT_MUTU'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd04', header: t('MSG_TXT_METG') + t('MSG_TXT_FEE'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd05', header: t('MSG_TXT_STMNT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd16', header: t('MSG_TXT_OG') + t('MSG_TXT_EJT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd17', header: t('MSG_TXT_OG') + t('MSG_TXT_EJT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd15', header: t('MSG_TXT_NB') + t('MSG_TXT_BRANCH'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd20', header: t('MSG_TXT_ADSB'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd30', header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'aksd99', header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'ddctam', header: t('MSG_TXT_DDTN_SUM'), width: '122.7', styleName: 'text-right' },
    { fieldName: 'dsbOjAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '122.7', styleName: 'text-right' },

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
      items: ['jagyuk', 'nJagyuk1'],
    },
    'is11edu', 'is17edu', 'cntrDt', 'fstCntrDt', 'rcntrDt', 'fnlCltnDt', 'cltnDt', 'lcecaymd', 'gadcnt', 'akstym', 'akdriy', 'bAksd05',
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
    'akdeq5', 'ec5amt', 'mproduct', 'aksd24', 'aksd25',
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
    'aksd04', 'aksd05', 'aksd16', 'aksd17', 'aksd15', 'aksd20', 'aksd30', 'aksd99', 'ddctam', 'dsbOjAmt',
  ]);
});

</script>

<style scoped>
</style>
