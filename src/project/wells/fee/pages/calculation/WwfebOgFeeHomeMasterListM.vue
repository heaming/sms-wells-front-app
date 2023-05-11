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
            @change="onChangedPerfYm"
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
            :options="filterRsbDvCd"
            first-option
            first-option-value=""
            :first-option-label="$t('MSG_TXT_ALL')"
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
      <!-- STEPER -->
      <zwfey-fee-step
        ref="stepNaviRef"
        :key="searchParams.perfYm"
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

import { useDataService, getComponentType, gridUtil, useGlobal, defineGrid, codeUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import ZwfeyFeeStep from '~sms-common/fee/pages/schedule/ZwfeyFeeStep.vue';

const { t } = useI18n();
const dataService = useDataService();
const { notify, modal, confirm, alert } = useGlobal();
const isGrid1Visile = ref(true);
const isGrid2Visile = ref(false);
const currentRoute = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const stepNaviRef = ref();
const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
);
const filterRsbDvCd = codes.RSB_DV_CD.filter((v) => ['W0302', 'W0301'].includes(v.codeId));
const searchParams = ref({

  perfYm: now.format('YYYYMM'),
  rsbDv: '홈마스터',
  rsbTpTxt: '',
  ogLevl2: '',
  ogLevl3: '',
  no: '',
  ogTp: 'W03',
  statTitle: t('MSG_TXT_PRGS_STE'),
  feeSchdTpCd: '301',
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
async function onChangedRsbDv() {
  const { rsbTp } = searchParams.value;
  if (rsbTp === 'W0302') {
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
  stepNaviRef.value.initProps();

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
 *  Event - 수수료생성 클릭 ※팝업 개발 미완료 상태
 */
async function onClickW301P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
  fetchData();
}

/*
 *  Event - 기타지원 업로드 클릭 ※업무개발에서 별도개발
 */
async function onClickW302P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
  fetchData();
}

/*
 *  Event - 세금공제 클릭 ※
 */
async function onClickW303P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
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
      ogTpCd: 'W03',
      ogTpCdTxt: '홈마스터',
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
async function onClickW304P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
  fetchData();
}

/*
 *  Event - 고용보험 공제 클릭 ※
 */
async function onClickW306P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
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
      ogTpCd: 'W03',
      ogTpCdTxt: '홈마스터',
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
async function onClickW307P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
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
      ogTpCd: 'W03',
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
async function onClickW311P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
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
      ogTpCd: 'W03',
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
async function onClickW313P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
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
      ogTpCd: 'W03',
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
async function onClickW314P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
  fetchData();
}

/*
 *  Event - 품의작성 클릭 ※TBD
 */
async function onClickW316P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
  fetchData();
}

/*
 *  Event - 전표생성 클릭 ※TBD
 */
async function onClickW317P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
  fetchData();
}

/*
 *  Event - 선급판매 수수료확정 클릭 ※팝업 개발 미완료 상태
*/

async function onClickW318P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
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
  } else if (params.code === 'W0301') { // 수수료 생성
    await onClickW301P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0302') { // 기타지원 업로드
    await onClickW302P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0303') { // 세금공제
    await onClickW303P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0304') { // 원천세 생성
    await onClickW304P(params.feeSchdId, params.code, '03');
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
    await onClickW317P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0318') { // 선급판매 수수료 확정
    await onClickW318P(params.feeSchdId, params.code, '03');
  }
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
