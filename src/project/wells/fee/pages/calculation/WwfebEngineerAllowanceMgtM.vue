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
    <kw-search
      v-permission:read
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
          :label="$t('MSG_TXT_AW_DV')"
        >
          <kw-option-group
            v-model="searchParams.feeSchdTpCd"
            type="radio"
            :options="egerAwDvCd"
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
            :end-level="1"
            :vt-exld-yn="'Y'"
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
            :maxlength="10"
            :regex="/^[0-9]*$/i"
            :on-click-icon="onClickSearchNo"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>
        {{ searchParams.perfYm.substring(0,4)+'년 '+searchParams.perfYm.substring(4)+'월' }}
        {{ codes.EGER_AW_DV_CD.find((v) => v.codeId === searchParams?.feeSchdTpCd)?.codeName }}
        {{ $t('MSG_TXT_PRGS_STE') }}
      </h3>
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
          <kw-paging-info :total-count="totalCount" />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          v-if="isBtnVisible"
          v-permission:update
          grid-action
          :label="$t('MSG_BTN_MOD')"
          @click="onClickMod(true)"
        />
        <kw-btn
          v-if="isBtnVisible"
          v-permission:update
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
          v-if="!isBtnVisible"
          v-permission:create
          icon="upload_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_UP')"
          @click="onClickExcelUpload"
        />
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:create
          dense
          secondary
          :label="$t('MSG_BTN_HIS_MGT')"
          @click="onClickHisMgt"
        />
        <kw-separator
          v-if="isBtnVisible"
          vertical
          inset
          spaced
        />
        <kw-btn
          v-if="isBtnVisible"
          v-permission:update
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
import { defineGrid, getComponentType, gridUtil, useGlobal, useDataService, codeUtil, useMeta } from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import ZwfeyFeeStep from '~sms-common/fee/pages/schedule/ZwfeyFeeStep.vue';

const { modal, notify, confirm, alert } = useGlobal();
const dataService = useDataService();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { hasRoleNickName } = useMeta();
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
const editYn = ref(false);
const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
  'EGER_AW_DV_CD',
);

// 센터장 권한일 때는 직책수당 숨김
let egerAwDvCd;
if (hasRoleNickName('ROL_W6010')) {
  egerAwDvCd = codes.EGER_AW_DV_CD.filter((v) => ['601'].includes(v.codeId));
} else {
  egerAwDvCd = codes.EGER_AW_DV_CD.filter((v) => ['601', '602'].includes(v.codeId));
}

// 조회조건
const searchParams = ref({
  perfYm: dayjs().subtract(1, 'month').format('YYYYMM'),
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
watch(() => searchParams.value.feeSchdTpCd, async (val) => {
  totalCount.value = 0;

  if (val === '601') {
    isGrdEgerVisible.value = true;
    isGrdEgerMngerVisible.value = false;
    rsbDvCd = codes.RSB_DV_CD.filter((v) => ['W0601', 'W0602', 'W0603'].includes(v.codeId));
    isBtnVisible.value = true;
  } else if (val === '602') {
    isGrdEgerVisible.value = false;
    isGrdEgerMngerVisible.value = true;
    rsbDvCd = codes.RSB_DV_CD.filter((v) => ['W0603', 'W0604'].includes(v.codeId));
    isBtnVisible.value = false;
  }
}, { immediate: true });

// 수정 버튼 클릭 이벤트
async function onClickMod(bool) {
  // 수정 모드 진입
  if (bool && totalCount.value === 0) {
    alert(t('MSG_ALT_NO_INFO_SRCH'));
    return;
  }

  // 시스템관리자, wells운영팀, 센터장만 수정 허용
  // TODO: 권한그룹 확인 후 주석 해제
  /*
  if (bool && !(hasRoleNickName('SYS_ADMIN') || hasRoleNickName('ROL_W1560') || hasRoleNickName('ROL_W6010'))) {
    alert(t('MSG_ALT_NO_AUTH'));
    return;
  }
  */

  /*
  if (bool && editYn.value) {
    alert(t('MSG_ALT_NO_AUTH'));
    return;
  }
  */

  const view = grdEgerRef.value.getView();
  view.checkAll();

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
  if (searchParams.value.feeSchdTpCd === '601') {
    await fetchData('engineers');
  } else if (searchParams.value.feeSchdTpCd === '602') {
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
  if (searchParams.value.feeSchdTpCd === '601') {
    await fetchData('engineers');
  } else if (searchParams.value.feeSchdTpCd === '602') {
    await fetchData('engineer-managers');
  }
}

// 실적집계
async function onClickAggregate(feeSchdId, code, nextStep) {
  const { result, payload } = await modal({
    component: 'WwfeaEngineerAllowancePerfAgrgRegP',
    componentProps: {
      perfYm: searchParams.value.perfYm,
      rsbTp: 'E',
    },
  });
  if (result) {
    if (payload === 'S') {
      // 수수료 일정 단계 완료
      await onClickRetry(feeSchdId, code, nextStep);
    }
  }
}

// 수수료 생성 버튼
async function onClickCreate(feeSchdId, code, nextStep) {
  // 조회후 진행
  const { result: isChanged } = await modal({
    component: 'WwfebEgerAllowanceRegP',
    componentProps: {
      perfYm: searchParams.value.perfYm,
      rsbTp: searchParams.value.rsbDvCd,
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
  if (searchParams.value.feeSchdTpCd === '602') {
    // 직책수당
    // 수수료 일정 단계 완료
    if (!await confirm(t('MSG_ALT_IS_DTRM'))) { return; }
    await onClickRetry(feeSchdId, code, nextStep);
  } else {
    // 실적수당
    const view = grdEgerRef.value.getView();
    const dataSource = view.getDataSource();
    const confirmRows = dataSource.getJsonRows();
    const confirmKeys = [];

    if (confirmRows.length === 0) {
      alert(t('MSG_ALT_USE_DT_SRCH_AF')); // 데이터 조회 후 사용해주세요.
      return;
    }

    if (!await confirm(t('MSG_ALT_DTRM'))) { return; }

    confirmRows.forEach((e) => {
      confirmKeys.push({
        baseYm: e.baseYm,
        ogCd: e.ogCd,
        prtnrNo: e.prtnrNo,
        type: 'H', // 센터 확정
        confirm: 'Y', // 확정(Y), 확정취소(N)
      });
    });

    await dataService.put('/sms/wells/fee/eger-allowances/confirm', confirmKeys);
    notify(t('MSG_ALT_CNFM_COMPLETE')); // 확정 완료했습니다.

    // 수수료 일정 단계 완료
    await onClickRetry(feeSchdId, code, nextStep);
  }
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
  stepNaviRef.value.initProps();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  let apiUrl;
  let view;
  if (searchParams.value.feeSchdTpCd === '601') {
    apiUrl = 'engineers';
    view = grdEgerRef.value.getView();
  } else if (searchParams.value.feeSchdTpCd === '602') {
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
  // 수수료 일정 체크(수당확정 전이어야 업로드 가능)
  const response = await dataService.get('/sms/wells/fee/eger-allowances/upload-check', { params: searchParams.value });
  if (response.data.feeSchdLvCd === 'END') {
    alert(t('MSG_ALT_NO_WK_PTRM')); // 작업 가능한 기간이 아닙니다.
    return;
  }

  openUploadPopup({ formatId: 'FOM_FEZ_0028', baseYm: searchParams.value.perfYm, ogTpCd: 'W06', type: searchParams.value.rsbDvCd });
}

// 번호 검색 아이콘 클릭 이벤트
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzMonthPartnerListP',
    componentProps: {
      ogTpCd: 'W06',
      prtnrNo: searchParams.value.prtnrNo,
      baseYm: searchParams.value.perfYm,
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
async function onClickSave() {
  if (totalCount.value === 0) {
    alert(t('MSG_ALT_NO_INFO_SRCH'));
    return;
  }

  // 시스템관리자, wells운영팀, 센터장만 수정 허용
  // TODO: 권한그룹 확인 후 주석 해제
  /*
  if (!(hasRoleNickName('SYS_ADMIN') || hasRoleNickName('ROL_W1560') || hasRoleNickName('ROL_W6010'))) {
    alert(t('MSG_ALT_NO_AUTH'));
    return;
  }
  */

  /*
  if (editYn.value) {
    alert(t('MSG_ALT_NO_AUTH'));
    return;
  }
  */

  const view = grdEgerRef.value.getView();

  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  if (changedRows.length > 0) {
    await dataService.put('/sms/wells/fee/eger-allowances/controls', changedRows);
    notify(t('MSG_ALT_SAVE_DATA'));
    await onClickSearch();
  }
}

// 센터별 확정 버튼 클릭 이벤트
async function onClickConfirm() {
  // 시스템관리자, wells운영팀, 센터장만 수정 허용
  // TODO: 권한그룹 확인 후 주석 해제
  /*
  if (!(hasRoleNickName('SYS_ADMIN') || hasRoleNickName('ROL_W1560') || hasRoleNickName('ROL_W6010'))) {
    alert(t('MSG_ALT_NO_AUTH'));
    return;
  }
  */

  let view;
  if (searchParams.value.feeSchdTpCd === '601') {
    view = grdEgerRef.value.getView();
  } else if (searchParams.value.feeSchdTpCd === '602') {
    view = grdEgerMngerRef.value.getView();
  }

  const dataSource = view.getDataSource();
  const confirmRows = dataSource.getJsonRows();
  const confirmKeys = [];

  if (confirmRows.length === 0) {
    alert(t('MSG_ALT_USE_DT_SRCH_AF')); // 데이터 조회 후 사용해주세요.
    return;
  }

  if (gridUtil.isModified(view)) {
    alert(t('MSG_ALT_CHG_CNTN_AFTER_SAVE'));
  }

  confirmRows.forEach((e) => {
    confirmKeys.push({
      baseYm: e.baseYm,
      ogCd: e.ogCd,
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
    { fieldName: 'ogId', header: t('MSG_TXT_CENTER_DIVISION'), width: '146', styleName: 'text-left', visible: false },
    { fieldName: 'ogCd', header: t('MSG_TXT_CENTER_DIVISION'), width: '146', styleName: 'text-left', visible: false },
    { fieldName: 'ogNm',
      header: t('MSG_TXT_CENTER_DIVISION'),
      width: '146',
      styleName: 'text-center',
      editable: false,
      headerSummary: {
        text: t('MSG_TXT_SUM'),
      } },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '90', styleName: 'text-center', editable: false },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '94', styleName: 'text-center', editable: false },
    { fieldName: 'pstnDvNm', header: t('MSG_TXT_CRLV'), width: '126', styleName: 'text-center', editable: false },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '126', styleName: 'text-center', editable: false, options: codes.RSB_DV_CD },
    // 현장수당정보
    // 방문처리실적
    // 설치작업
    { fieldName: 'perfW06p00001',
      header: t('MSG_TXT_WK_PERF'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060001',
      header: t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060002',
      header: t('MSG_TXT_RGLVL_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    // 정기B/S작업
    { fieldName: 'perfW06p00004',
      header: t('MSG_TXT_WK_PERF'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060003',
      header: t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060004',
      header: t('MSG_TXT_RGLVL_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    // 일반A/S
    { fieldName: 'perfW06p00005',
      header: t('MSG_TXT_WK_PERF'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060005',
      header: t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060006',
      header: t('MSG_TXT_RGLVL_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    // 동행처리
    { fieldName: 'perfW06p00006',
      header: t('MSG_TXT_WK_PERF'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060007',
      header: t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060008',
      header: t('MSG_TXT_RGLVL_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    // 합계
    { fieldName: 'totPerfVisit',
      header: t('MSG_TXT_WK_PERF'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'totFeeVisit',
      header: t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'totRglvlFeeVisit',
      header: t('MSG_TXT_RGLVL_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    // 생산성인센티브
    { fieldName: 'perfW06p00007',
      header: t('MSG_TXT_WK_PERF'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060009',
      header: t('MSG_TXT_DSB_AMT'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    // 입고수리실적
    // 스케일링
    { fieldName: 'perfW06p00008',
      header: t('MSG_TXT_WK_PERF'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060010',
      header: t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    // 일반수리
    { fieldName: 'perfW06p00009',
      header: t('MSG_TXT_WK_PERF'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060011',
      header: t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    // 경수리
    { fieldName: 'perfW06p00010',
      header: t('MSG_TXT_WK_PERF'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060012',
      header: t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    // 중수리
    { fieldName: 'perfW06p00025',
      header: t('MSG_TXT_WK_PERF'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060017',
      header: t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    // 아웃소싱
    { fieldName: 'perfW06p00015',
      header: t('MSG_TXT_WK_PERF'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060018',
      header: t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    // 합계
    { fieldName: 'totPerfRpr',
      header: t('MSG_TXT_WK_PERF'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'totFeeRpr',
      header: t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },

    { fieldName: 'totFee',
      header: `${t('MSG_TXT_CTR_BF')} ${t('MSG_TXT_AW')}${t('MSG_TXT_SUM')}`,
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'totAfFee',
      header: `${t('MSG_TXT_CTR_AF')} ${t('MSG_TXT_AW')}${t('MSG_TXT_SUM')}`,
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },

    // 부가수당정보
    { fieldName: 'feeW060019',
      header: t('MSG_TXT_SUPPORT') + t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060020',
      header: t('MSG_TXT_ETC') + t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060021',
      header: `${t('MSG_TXT_REQD')}/${t('MSG_TXT_WDWL')}${t('MSG_TXT_AW')}`,
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    // 판매권유수당
    { fieldName: 'feeW060022',
      header: t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    // 토요근무수당
    // perfW06P00018: AS-IS 실적건수로 가져왔지만 TO-BE 에서 수당 계산을 위해 계산식으로 가져온 출동건을 사용함.
    { fieldName: 'feeW060023Cnt',
      header: '출동건',
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060023',
      header: t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    // 휴무당직수당
    { fieldName: 'feeW060024Cnt',
      header: '출동건',
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060024',
      header: t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    // 강의수당
    { fieldName: 'feeW060025Cnt',
      header: t('MSG_TXT_LECTR_HH'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060025',
      header: t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    // 도서방문수당
    { fieldName: 'feeW060026Cnt',
      header: t('MSG_TXT_VST_DC'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060026',
      header: t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    // 기술숙련수당
    { fieldName: 'feeW060027',
      header: t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    // 조장수당
    { fieldName: 'feeW060028',
      header: t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'totFeeEtc',
      header: t('MSG_TXT_ADN_AW_SUM'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'dsbOjAmt',
      header: t('MSG_TXT_DSB_OJ') + t('MSG_TXT_AW') + t('MSG_TXT_AMT'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'cnrAwCnfmDtm',
      header: t('MSG_TXT_CNR_CNFM_DT'),
      width: '180',
      styleName: 'text-center',
      datetimeFormat: 'date',
      editable: false,
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
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
    'baseYm', 'ogId', 'ogCd', 'ogNm', 'prtnrKnm', 'prtnrNo', 'pstnDvNm', 'rsbDvCd',
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

  // 헤더쪽 합계 행고정, summary
  // view.layoutByColumn('ogNm').summaryUserSpans = [{ colspan: 5 }];
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });

  // 값 수정시 수당 자동 계산
  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    grid.commit(true);
    const columnName = grid.getColumn(fieldIndex).fieldName;
    const editRow = gridUtil.getRowValue(grid, itemIndex);

    let feeCd;
    const perfVal = {};
    let feeAmt = 0;

    // 테이블에 수당 코드별로 값이 들어가기 때문에
    // 수정된 그리드 한 row를 수당 코드별로 쪼개서 넣음
    if (columnName === 'feeW060023Cnt') {
      feeCd = 'W060023';
      perfVal.W06R00018 = editRow.feeW060023Cnt; /* 토요근무건수 */
      const response = await dataService.post(`/sms/common/fee/fee-calculation/screen-performance-input-fees/${searchParams.value.perfYm}-${feeCd}`, perfVal);
      feeAmt = response.data;
    } else if (columnName === 'feeW060024Cnt') {
      feeCd = 'W060024';
      perfVal.W06R00019 = editRow.feeW060024Cnt; /* 휴무당직건수 */
      const response = await dataService.post(`/sms/common/fee/fee-calculation/screen-performance-input-fees/${searchParams.value.perfYm}-${feeCd}`, perfVal);
      feeAmt = response.data;
    } else if (columnName === 'feeW060025Cnt') {
      feeCd = 'W060025';
      feeAmt = editRow.feeW060025Cnt * 10000;
    } else if (columnName === 'feeW060026Cnt') {
      feeCd = 'W060026';
      perfVal.W06R00021 = editRow.feeW060026Cnt; /* 방문일수 */
      const response = await dataService.post(`/sms/common/fee/fee-calculation/screen-performance-input-fees/${searchParams.value.perfYm}-${feeCd}`, perfVal);
      feeAmt = response.data;
    } else if (columnName === 'feeW060019') {
      feeCd = 'W060019';
      feeAmt = Math.floor(editRow.feeW060019);
    } else if (columnName === 'feeW060020') {
      feeCd = 'W060020';
      feeAmt = Math.floor(editRow.feeW060020);
    } else if (columnName === 'feeW060021') {
      feeCd = 'W060021';
      feeAmt = Math.floor(editRow.feeW060021);
    } else if (columnName === 'feeW060022') {
      feeCd = 'W060022';
      feeAmt = Math.floor(editRow.feeW060022);
    }
    if (feeAmt > 0) {
      data.setValue(itemIndex, columnName.substring(0, 10), feeAmt);
    }
    changedRows.push({
      perfYm: editRow.baseYm,
      ogId: editRow.ogId,
      ogCd: editRow.ogCd,
      rsbDvCd: editRow.rsbDvCd,
      prtnrNo: editRow.prtnrNo,
      feeCd,
      feeAmt,
    });
  };
});

const initEgerMnger = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'ogId',
      header: t('MSG_TXT_CENTER_DIVISION'),
      width: '146',
      styleName: 'text-center',
      visible: false,
    },
    { fieldName: 'ogCd', header: t('MSG_TXT_CENTER_DIVISION'), width: '146', styleName: 'text-center', visible: false },
    { fieldName: 'ogNm',
      header: t('MSG_TXT_CENTER_DIVISION'),
      width: '146',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
      } },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '94', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '90', styleName: 'text-center' },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '126', styleName: 'text-center', options: codes.RSB_DV_CD },
    { fieldName: 'pstnDvNm', header: t('MSG_TXT_CRLV'), width: '86', styleName: 'text-center' },
    { fieldName: 'feeW060031',
      header: t('MSG_TXT_OUTC_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'feeW060032',
      header: t('MSG_TXT_QLF') + t('MSG_TXT_AW'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'totFee',
      header: t('MSG_TXT_AW') + t('MSG_TXT_SUM'),
      width: '180',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },

  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // 헤더쪽 합계 행고정, summary
  // view.layoutByColumn('ogNm').summaryUserSpans = [{ colspan: 5 }];
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });

  // multi row header setting
  view.setColumnLayout([
    'ogId', 'ogCd', 'ogNm', 'prtnrNo', 'prtnrKnm', 'rsbDvCd', 'pstnDvNm',
    {
      header: t('MSG_TXT_AW') + t('MSG_TXT_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['feeW060031', 'feeW060032', 'totFee'],
    },
  ]);
});

</script>
