<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebEngineerAllowanceMgtM - 엔지니어 수당 생성관리
3. 작성자 : seoin.jeon
4. 작성일 : 2023.02.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 엔지니어 수당 생성관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
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
          :label="$t('MSG_TXT_AW_DV')"
        >
          <kw-option-group
            v-model="searchParams.awDv"
            type="radio"
            :options="awDv"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevlDvCd1"
            :og-tp-cd="searchParams.ogTpCd"
            :base-ym="searchParams.perfYm"
            :start-level="1"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_RSB_TP')"
        >
          <kw-select
            v-model="searchParams.rsbDvCd"
            :options="rsbDvCd"
            first-option="all"
            first-option-value=""
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_SEQUENCE_NUMBER')">
          <kw-input
            v-model="searchParams.prtnrNo"
            clearable
            icon="search"
            :on-click-icon="onClickSearchNo"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>
        {{ searchParams.perfYm.substring(0,4)+'-'+searchParams.perfYm.substring(4) }}
        {{ searchParams.awDv==='perf'?'실적수당':'직책수당' }} {{ $t('MSG_TXT_PRGS_STE') }}
      </h3>
      <!-- STEPER -->
      <zwfey-fee-step
        ref="stepNaviRef"
        :key="searchParams.perfYm+searchParams.awDv"
        v-model:base-ym="searchParams.perfYm"
        v-model:fee-schd-tp-cd="searchParams.feeSchdTpCd"
        v-model:fee-tcnt-dv-cd="searchParams.feeTcntDvCd"
        v-model:co-cd="searchParams.coCd"
        @click-step="onclickStep"
      />
      <kw-action-top class="mt40">
        <template #left>
          <kw-paging-info :total-count="totalCount" />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          v-if="isBtnVisible"
          grid-action
          :label="$t('MSG_BTN_MOD')"
          @click="onClickMod(true)"
        />
        <kw-btn
          v-if="isBtnVisible"
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          v-if="isBtnVisible"
          vertical
          inset
          spaced
        />
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_HIS_MGT')"
          @click="onClickHisMgt"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-btn
          v-if="!isBtnVisible"
          icon="upload_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_UP')"
          @click="onClickExcelUpload"
        />
        <kw-separator
          v-if="isBtnVisible"
          vertical
          inset
          spaced
        />
        <kw-btn
          v-if="isBtnVisible"
          primary
          dense
          :label="$t('MSG_BTN_DTRM')"
          @click="onClickConfirm"
        />
      </kw-action-top>
      <kw-grid
        v-if="isGrdEgerVisible"
        ref="grdEgerRef"
        name="grdEger"
        :visible-rows="10"
        @init="initEgerMain"
      />
      <kw-grid
        v-if="isGrdEgerMngerVisible"
        ref="grdEgerMngerRef"
        name="grdEgerMnger"
        :visible-rows="10"
        @init="initEgerMnger"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useGlobal, useDataService, codeUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import ZwfeyFeeStep from '~sms-common/fee/pages/schedule/ZwfeyFeeStep.vue';

const { modal, notify, confirm, alert } = useGlobal();
const dataService = useDataService();
const { t } = useI18n();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// ------------------------------------------------------------------------------------------------
const grdEgerRef = ref(getComponentType('KwGrid'));
const grdEgerMngerRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const isGrdEgerVisible = ref(true);
const isGrdEgerMngerVisible = ref(false);
const isBtnVisible = ref(true);
const stepNaviRef = ref();
const changedRows = [];
const confirmHdofRows = []; // 본사확정용 배열
// TODO: 세션정보(직급/직무구분코드) & 센터확정일자에 따른 수당조정 가능 여부 체크
// 확정이 되었는지 안되었는지도 체크함.
// 확정이 되었으면 수정 못함.(센터)
// 확정이 안되었으면 로그인한 사람의 영업조직 직급? 직무?로 결정됨.
// ( 직급/직무코드 0 은 모르겠고... 센터소장만 수정 가능함. + 제주서비스센터(71365) 는 자재실장이어야 수정 가능함.)
const editYn = ref(false);
const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
);

// 수당구분
const awDv = [
  { codeId: 'perf', codeName: t('MSG_TXT_PERF_AW') },
  { codeId: 'rsb', codeName: t('MSG_TXT_RSB_AW') },
];

// 조회조건
const searchParams = ref({
  perfYm: dayjs().subtract(1, 'month').format('YYYYMM'),
  awDv: 'perf',
  rsbDvCd: '',
  prtnrNo: '',
  ogTpCd: 'W06',
  ogLevlDvCd1: '',
  feeSchdTpCd: '601', // 엔지니어
  feeTcntDvCd: '02', // 2차수
  coCd: '2000',
});

// 수당구분 변경
let rsbDvCd;
watch(() => searchParams.value.awDv, async (val) => {
  totalCount.value = 0;

  if (val === 'perf') {
    isGrdEgerVisible.value = true;
    isGrdEgerMngerVisible.value = false;
    rsbDvCd = codes.RSB_DV_CD.filter((v) => ['W0601', 'W0602', 'W0603'].includes(v.codeId));
    isBtnVisible.value = true;
  } else if (val === 'rsb') {
    isGrdEgerVisible.value = false;
    isGrdEgerMngerVisible.value = true;
    rsbDvCd = codes.RSB_DV_CD.filter((v) => ['W0603', 'W0604'].includes(v.codeId));
    isBtnVisible.value = false;
  }
}, { immediate: true });

// 수정 버튼 클릭 이벤트
// TODO: 권한 체크(센터장, 센터지원만 수정 가능)
// TODO: 수당 생성 이후에 수정하도록 막아두기(수수료 일정관리)
async function onClickMod(bool) {
  // 수정 모드 진입
  if (bool && totalCount.value === 0) {
    alert(t('MSG_ALT_NO_INFO_SRCH'));
    return;
  }

  if (bool && !editYn.value) {
    alert(t('MSG_ALT_NO_AUTH'));
    return;
  }

  let view;
  if (searchParams.value.awDv === 'perf') {
    view = grdEgerRef.value.getView();
  } else if (searchParams.value.awDv === 'rsb') {
    view = grdEgerMngerRef.value.getView();
  }

  view.columnByName('feeW060019').editable = bool;
  view.columnByName('feeW060020').editable = bool;
  view.columnByName('feeW060021').editable = bool;
  view.columnByName('feeW060022').editable = bool;
  view.columnByName('feeW060023Cnt').editable = bool;
  view.columnByName('feeW060024Cnt').editable = bool;
  view.columnByName('feeW060025Cnt').editable = bool;
  view.columnByName('feeW060026Cnt').editable = bool;
}

// 조회
async function fetchData(apiUrl) {
  stepNaviRef.value.initProps();
  const res = await dataService.get(`/sms/wells/fee/eger-allowances/${apiUrl}`, { params: searchParams.value });
  const resData = res.data;
  totalCount.value = resData.length;

  if (apiUrl === 'engineers') {
    const view = grdEgerRef.value.getView();
    view.getDataSource().setRows(resData);
    if (!isEmpty(resData)) {
      editYn.value = resData[0].editYn;
    }
  } else if (apiUrl === 'engineer-managers') {
    const view = grdEgerMngerRef.value.getView();
    view.getDataSource().setRows(resData);
  }

  await onClickMod(false);
}

// 조회 버튼 클릭 이벤트
async function onClickSearch() {
  if (searchParams.value.awDv === 'perf') {
    await fetchData('engineers');
  } else if (searchParams.value.awDv === 'rsb') {
    await fetchData('engineer-managers');
  }
}

// 재시작, 상태를 진행중상태로 변경한다.
async function onClickRetry(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  if (feeSchdLvStatCd === '02') {
    if (!await confirm(t('MSG_ALT_LV_RESRT'))) { return; }
  }
  await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
  notify(t('MSG_ALT_SAVE_DATA'));
  if (searchParams.value.awDv === 'perf') {
    await fetchData('engineers');
  } else if (searchParams.value.awDv === 'rsb') {
    await fetchData('engineer-managers');
  }
}

// 실적집계
async function onClickAggregate(feeSchdId, code, nextStep) {
  const { result: isChanged } = await modal({
    component: 'WwfeaEngineerAllowancePerfAgrgRegP',
    componentProps: {
      perfYm: searchParams.value.perfYm,
      rsbTp: searchParams.value.rsbDvCd, // TODO: 팝업 완료 후 수정 필요
    },
  });
  if (isChanged) {
    // 수수료 일정 단계 완료
    await onClickRetry(feeSchdId, code, nextStep);
  }
}

// 수수료 생성 버튼
async function onClickCreate(feeSchdId, code, nextStep) {
  // 조회후 진행
  const { result: isChanged } = await modal({
    component: 'WwfebEgerAllowanceRegP',
    componentProps: {
      perfYm: searchParams.value.perfYm,
      rsbTp: searchParams.value.rsbDvCd, // TODO: 팝업 완료 후 수정 필요
    },
  });
  if (isChanged) {
    // 수수료 일정 단계 완료
    await onClickRetry(feeSchdId, code, nextStep);
  }
}

// 수당조정
async function onClickControl(feeSchdId, code, nextStep) {
  const { result: isChanged } = await modal({
    component: 'WwfebEngineerAllowanceModP',
    componentProps: {
      perfYm: searchParams.value.perfYm,
    },
  });
  if (isChanged) {
    // 수수료 일정 단계 완료
    await onClickRetry(feeSchdId, code, nextStep);
  }
}

// 본사 수당확정
async function onclickDtrm(feeSchdId, code, nextStep) {
  if (!await confirm(t('MSG_ALT_DTRM'))) { return; }
  const view = grdEgerRef.value.getView();
  const dataProvider = view.getDataSource();
  const rowData = dataProvider.getJsonRow(0);
  confirmHdofRows.push({
    baseYm: rowData.baseYm,
    ogCd: rowData.dgr2LevlOgCd,
    prtnrNo: rowData.prtnrNo,
    type: 'H', // 본사 확정
    confirm: 'Y', // 확정(Y), 확정취소(N)
  });
  await dataService.put('/sms/wells/fee/eger-allowances/confirm', confirmHdofRows);
  notify(t('MSG_ALT_CNFM_COMPLETE')); // 확정 완료했습니다.

  // 수수료 일정 단계 완료
  await onClickRetry(feeSchdId, code, nextStep);
}

/**
 * 스텝퍼 클릭시
 * 버튼 로직 존재시 해당 로직 서술
 * @params code[String]: 스탭퍼에서 선택한 단계 코드
 *         done[Boolean]: 이전단계로 되돌림 플레그
 */
async function onclickStep(params) {
  if (params.done) {
    await onClickRetry(params.feeSchdId, params.code, '02');
  } else {
    if (params.code === 'W0601') { // 실적집계
      await onClickAggregate(params.feeSchdId, params.code, '03');
    }
    if (params.code === 'W0602') { // 수당 생성
      await onClickCreate(params.feeSchdId, params.code, '03');
    }
    if (params.code === 'W0603') { // 수당 조정
      await onClickControl(params.feeSchdId, params.code, '03');
    }
    if (params.code === 'W0604') { // 수당 확정
      await onclickDtrm(params.feeSchdId, params.code, '03');
    }
  }
}

// 엑셀다운로드
async function onClickExcelDownload() {
  let apiUrl;
  let view;
  if (searchParams.value.awDv === 'perf') {
    apiUrl = 'engineers';
    view = grdEgerRef.value.getView();
  } else if (searchParams.value.awDv === 'rsb') {
    apiUrl = 'engineer-managers';
    view = grdEgerMngerRef.value.getView();
  }
  const response = await dataService.get(`/sms/wells/fee/eger-allowances/${apiUrl}`, { params: searchParams.value });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

// 엑셀업로드
async function openUploadPopup(componentProps) {
  const { result: isUploadSuccess } = await modal({
    component: 'ZwfezXlsUpP',
    componentProps,
  });
  if (isUploadSuccess) {
    // 후처리로직
    await fetchData('engineer-managers');
  }
}

// 엑셀업로드 버튼 클릭 이벤트
async function onClickExcelUpload() {
  openUploadPopup({ formatId: 'FOM_FEZ_0028', baseYm: searchParams.value.perfYm, ogTpCd: 'W06' });
}

// 번호 검색 아이콘 클릭 이벤트
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      ogTpCd: 'W06',
      prtnrNo: searchParams.value.prtnrNo,
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.prtnrNo = payload.prtnrNo;
    }
  }
}

// 이력관리 버튼 클릭 이벤트
async function onClickHisMgt() {
  const param = {
    feeHistSrnCd: '01',
  };
  await modal({
    component: 'ZwfebFeeHistoryMgtP',
    componentProps: param,
  });
}

// 저장 버튼 클릭 이벤트
// TODO: 권한 체크
// TODO: 수당 생성 이후에 수정하도록 막아두기(수수료 일정관리)
async function onClickSave() {
  let view;
  if (searchParams.value.awDv === 'perf') {
    view = grdEgerRef.value.getView();
  } else if (searchParams.value.awDv === 'rsb') {
    view = grdEgerMngerRef.value.getView();
  }

  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  if (changedRows.length > 0) {
    await dataService.put('/sms/wells/fee/eger-allowances/controls', changedRows);
    notify(t('MSG_ALT_SAVE_DATA'));
    await onClickSearch();
  }
}

// 센터별 확정 버튼 클릭 이벤트
// TODO: 권한 체크(센터장, 센터지원만 수정 가능)
// TODO: 수당 생성 이후에 수정하도록 막아두기(수수료 일정관리)
async function onClickConfirm() {
  let view;
  if (searchParams.value.awDv === 'perf') {
    view = grdEgerRef.value.getView();
  } else if (searchParams.value.awDv === 'rsb') {
    view = grdEgerMngerRef.value.getView();
  }

  if (gridUtil.isModified(view)) {
    alert(t('MSG_ALT_CHG_CNTN_AFTER_SAVE'));
  }

  const dataSource = view.getDataSource();
  const confirmRows = dataSource.getJsonRows();
  const confirmKeys = [];

  confirmRows.forEach((e) => {
    confirmKeys.push({
      baseYm: e.baseYm,
      ogCd: e.dgr2LevlOgCd,
      prtnrNo: e.prtnrNo,
      type: 'C', // 센터 확정
      confirm: 'Y', // 확정(Y), 확정취소(N)
    });
  });

  await dataService.put('/sms/wells/fee/eger-allowances/confirm', confirmKeys);
  notify(t('MSG_ALT_CNFM_COMPLETE'));
  await onClickSearch();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initEgerMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'baseYm', header: t('MSG_TXT_PERF_YM'), width: '146', styleName: 'text-left', visible: false },
    { fieldName: 'dgr2LevlOgId', header: t('MSG_TXT_CENTER_DIVISION'), width: '146', styleName: 'text-left', visible: false },
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_CENTER_DIVISION'), width: '146', styleName: 'text-left', editable: false },
    { fieldName: 'dgr2LevlOgCd', header: t('MSG_TXT_CENTER_DIVISION'), width: '146', styleName: 'text-left', visible: false },
    { fieldName: 'ogNm', header: t('MSG_TXT_BRANCH'), width: '146', styleName: 'text-left', editable: false },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '90', styleName: 'text-left', editable: false },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '94', styleName: 'text-center', editable: false },
    { fieldName: 'pstnDvNm', header: t('MSG_TXT_CRLV'), width: '94', styleName: 'text-center', editable: false },
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_RSB'), width: '126', styleName: 'text-left', editable: false },
    // 현장수당정보
    // 방문처리실적
    // 설치작업
    { fieldName: 'perfW06p00001', header: t('MSG_TXT_WK_PERF'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060001', header: t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060002', header: t('MSG_TXT_RGLVL_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    // 정기B/S작업
    { fieldName: 'perfW06p00004', header: t('MSG_TXT_WK_PERF'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060003', header: t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060004', header: t('MSG_TXT_RGLVL_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    // 일반A/S
    { fieldName: 'perfW06p00005', header: t('MSG_TXT_WK_PERF'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060005', header: t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060006', header: t('MSG_TXT_RGLVL_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    // 동행처리
    { fieldName: 'perfW06p00006', header: t('MSG_TXT_WK_PERF'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060007', header: t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060008', header: t('MSG_TXT_RGLVL_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    // 합계
    { fieldName: 'totPerfVisit', header: t('MSG_TXT_WK_PERF'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'totFeeVisit', header: t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'totRglvlFeeVisit', header: t('MSG_TXT_RGLVL_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    // 생산성인센티브
    { fieldName: 'perfW06p00007', header: t('MSG_TXT_WK_PERF'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060009', header: t('MSG_TXT_DSB_AMT'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    // 입고수리실적
    // 스케일링
    { fieldName: 'perfW06p00008', header: t('MSG_TXT_WK_PERF'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060010', header: t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    // 일반수리
    { fieldName: 'perfW06p00009', header: t('MSG_TXT_WK_PERF'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060011', header: t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    // 경수리
    { fieldName: 'perfW06p00010', header: t('MSG_TXT_WK_PERF'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060012', header: t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    // 중수리
    { fieldName: 'perfW06p00025', header: t('MSG_TXT_WK_PERF'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060017', header: t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    // 아웃소싱
    { fieldName: 'perfW06p00015', header: t('MSG_TXT_WK_PERF'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060018', header: t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    // 합계
    { fieldName: 'totPerfRpr', header: t('MSG_TXT_WK_PERF'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'totFeeRpr', header: t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },

    { fieldName: 'totFee', header: `${t('MSG_TXT_CTR_BF')} ${t('MSG_TXT_AW')}${t('MSG_TXT_SUM')}`, width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'totAfFee', header: `${t('MSG_TXT_CTR_AF')} ${t('MSG_TXT_AW')}${t('MSG_TXT_SUM')}`, width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },

    // 부가수당정보
    { fieldName: 'feeW060019', header: t('MSG_TXT_SUPPORT') + t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060020', header: t('MSG_TXT_ETC') + t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060021', header: `${t('MSG_TXT_REQD')}/${t('MSG_TXT_WDWL')}${t('MSG_TXT_AW')}`, width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    // 판매권유수당
    { fieldName: 'feeW060022', header: t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    // 토요근무수당
    // perfW06P00018: AS-IS 실적건수로 가져왔지만 TO-BE 에서 수당 계산을 위해 계산식으로 가져온 출동건을 사용함.
    { fieldName: 'feeW060023Cnt', header: '출동건', width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060023', header: t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    // 휴무당직수당
    { fieldName: 'feeW060024Cnt', header: '출동건', width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060024', header: t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    // 강의수당
    { fieldName: 'feeW060025Cnt', header: t('MSG_TXT_LECTR_HH'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060025', header: t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    // 도서방문수당
    { fieldName: 'feeW060026Cnt', header: t('MSG_TXT_VST_DC'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'feeW060026', header: t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    // 기술숙련수당
    { fieldName: 'feeW060027', header: t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    // 조장수당
    { fieldName: 'feeW060028', header: t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'totFeeEtc', header: t('MSG_TXT_ADN_AW_SUM'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'dsbOjAmt', header: t('MSG_TXT_DSB_OJ') + t('MSG_TXT_AW') + t('MSG_TXT_AMT'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'cnrAwCnfmDtm', header: t('MSG_TXT_CNR_CNFM_DT'), width: '180', styleName: 'text-center', datetimeFormat: 'date', editable: false },
    { fieldName: 'note', header: t('MSG_TXT_NOTE'), width: '180', styleName: 'text-center', editable: false },
    { fieldName: 'editYn', header: t('MSG_TXT_MDFC_PSB_YN'), width: '180', styleName: 'text-center', visible: false },
    { fieldName: 'empCnt', header: t('MSG_TXT_PPL_N'), width: '180', styleName: 'text-center', visible: false },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  // multi row header setting
  view.setColumnLayout([
    'baseYm', 'dgr2LevlOgId', 'dgr2LevlOgNm', 'dgr2LevlOgCd', 'ogNm', 'prtnrKnm', 'prtnrNo', 'pstnDvNm', 'rsbDvNm',
    {
      name: t('MSG_TXT_SITE_AW') + t('MSG_TXT_INF'),
      direction: 'horizontal',
      items: [
        {
          name: t('MSG_TXT_VST_PROCS_PERF'),
          items: [
            {
              name: t('MSG_TXT_IST_WK'),
              items: ['perfW06p00001', 'feeW060001', 'feeW060002'],
            },
            {
              name: t('MSG_TXT_RGLR_BFSVC_WK'),
              items: ['perfW06p00004', 'feeW060003', 'feeW060004'],
            },
            {
              name: t('MSG_TXT_GE_AS'),
              items: ['perfW06p00005', 'feeW060005', 'feeW060006'],
            },
            {
              name: t('MSG_TXT_ACPN') + t('MSG_TXT_PROC'),
              items: ['perfW06p00006', 'feeW060007', 'feeW060008'],
            },
            {
              name: t('MSG_TXT_SUM'),
              items: ['totPerfVisit', 'totFeeVisit', 'totRglvlFeeVisit'],
            },
            {
              name: t('MSG_TXT_PDTT_ICT'),
              items: ['perfW06p00007', 'feeW060009'],
            },
          ],
        },
        {
          name: t('MSG_TXT_STR_RPR_PERF'),
          items: [
            {
              name: t('MSG_TXT_SCLNG'),
              items: ['perfW06p00008', 'feeW060010'],
            },
            {
              name: t('MSG_TXT_GE_RPR'),
              items: ['perfW06p00009', 'feeW060011'],
            },
            {
              name: t('MSG_TXT_LTRP'),
              items: ['perfW06p00010', 'feeW060012'],
            },
            {
              name: t('MSG_TXT_MDIM_RPR'),
              items: ['perfW06p00025', 'feeW060017'],
            },
            {
              name: t('MSG_TXT_OTSC'),
              items: ['perfW06p00015', 'feeW060018'],
            },
            {
              name: t('MSG_TXT_SUM'),
              items: ['totPerfRpr', 'totFeeRpr'],
            },
          ],
        },
        'totFee', 'totAfFee',
      ],
    },
    {
      name: t('MSG_TXT_ADN_AW_INF'),
      direction: 'horizontal',
      items: [
        'feeW060019', 'feeW060020', 'feeW060021',
        {
          name: t('MSG_TXT_SELL_SUGT_AW'),
          items: ['feeW060022'],
        },
        {
          name: t('MSG_TXT_SAT_WRK_AW'),
          items: ['feeW060023Cnt', 'feeW060023'],
        },
        {
          name: t('MSG_TXT_DF_BNDT_AW'),
          items: ['feeW060024Cnt', 'feeW060024'],
        },
        {
          name: t('MSG_TXT_LECTR_AW'),
          items: ['feeW060025Cnt', 'feeW060025'],
        },
        {
          name: t('MSG_TXT_BOOK_VST_AW'),
          items: ['feeW060026Cnt', 'feeW060026'],
        },
        {
          name: t('MSG_TXT_TECH_SKIL_AW'),
          items: ['feeW060027'],
        },
        {
          name: t('MSG_TXT_GRLDR_AW'),
          items: ['feeW060028'],
        },
        'totFeeEtc',
      ],
    },
    'dsbOjAmt', 'cnrAwCnfmDtm', 'note', 'editYn', 'empCnt',
  ]);

  // 값 수정시 수당 자동 계산
  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    grid.commit(true);
    const columnName = grid.getColumn(fieldIndex).fieldName;
    const editRow = gridUtil.getRowValue(grid, itemIndex);

    let feeCd;
    let feeAmt;

    // 테이블에 수당 코드별로 값이 들어가기 때문에
    // 수정된 그리드 한 row를 수당 코드별로 쪼개서 넣음
    if (columnName === 'feeW060023Cnt') {
      data.setValue(itemIndex, 'feeW060023', editRow.feeW060023Cnt * 2000); // 토요근무수당
      feeCd = 'W060023';
      feeAmt = editRow.feeW060023Cnt * 2000;
    } else if (columnName === 'feeW060024Cnt') {
      data.setValue(itemIndex, 'feeW060024', editRow.feeW060024Cnt * 20000); // 휴무당직수당
      feeCd = 'W060024';
      feeAmt = editRow.feeW060024Cnt * 20000;
    } else if (columnName === 'feeW060025Cnt') {
      data.setValue(itemIndex, 'feeW060025', editRow.feeW060025Cnt * 10000); // 강의수당
      feeCd = 'W060025';
      feeAmt = editRow.feeW060025Cnt * 10000;
    } else if (columnName === 'feeW060026Cnt') {
      data.setValue(itemIndex, 'feeW060026', editRow.feeW060026Cnt * 10000); // 도서방문수당
      feeCd = 'W060026';
      feeAmt = editRow.feeW060026Cnt * 10000;
    } else if (columnName === 'feeW060019') {
      data.setValue(itemIndex, 'feeW060019', Math.floor(editRow.feeW060019)); // 소수점 절사
      feeCd = 'W060019';
      feeAmt = Math.floor(editRow.feeW060019);
    } else if (columnName === 'feeW060020') {
      data.setValue(itemIndex, 'feeW060020', Math.floor(editRow.feeW060020)); // 소수점 절사
      feeCd = 'W060020';
      feeAmt = Math.floor(editRow.feeW060020);
    } else if (columnName === 'feeW060021') {
      data.setValue(itemIndex, 'feeW060021', Math.floor(editRow.feeW060021)); // 소수점 절사
      feeCd = 'W060021';
      feeAmt = Math.floor(editRow.feeW060021);
    } else if (columnName === 'feeW060022') {
      data.setValue(itemIndex, 'feeW060022', Math.floor(editRow.feeW060022)); // 소수점 절사
      feeCd = 'W060022';
      feeAmt = Math.floor(editRow.feeW060022);
    }
    changedRows.push({
      perfYm: editRow.baseYm,
      ogId: editRow.ogId,
      ogCd: editRow.dgr2LevlOgCd,
      rsbDvCd: editRow.rsbDvCd,
      prtnrNo: editRow.prtnrNo,
      feeCd,
      feeAmt,
    });
  };
});

const initEgerMnger = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'dgr2LevlOgId', header: t('MSG_TXT_CENTER_DIVISION'), width: '146', styleName: 'text-left', visible: false },
    { fieldName: 'dgr2LevlOgCd', header: t('MSG_TXT_CENTER_DIVISION'), width: '146', styleName: 'text-left', visible: false },
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_CENTER_DIVISION'), width: '146', styleName: 'text-left' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '94', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '90', styleName: 'text-left' },
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_RSB'), width: '126', styleName: 'text-left' },
    { fieldName: 'pstnDvNm', header: t('MSG_TXT_CRLV'), width: '90', styleName: 'text-left ' },
    { fieldName: 'feeW060031', header: t('MSG_TXT_OUTC_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'feeW060032', header: t('MSG_TXT_QLF') + t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'totFee', header: t('MSG_TXT_AW') + t('MSG_TXT_SUM'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },

  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'dgr2LevlOgId', 'dgr2LevlOgCd', 'dgr2LevlOgNm', 'prtnrNo', 'prtnrKnm', 'rsbDvNm', 'pstnDvNm',
    {
      header: t('MSG_TXT_AW') + t('MSG_TXT_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['feeW060031', 'feeW060032', 'totFee'],
    },
  ]);
});

</script>
