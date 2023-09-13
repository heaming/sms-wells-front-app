<!-- eslint-disable vue/require-default-prop -->
<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaMembershipConfirmMgtP - 멤버십 확정관리
3. 작성자 : jihoon.kim
4. 작성일 : 2023.04.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
선택한 멤버쉽 계약의 확정일자와 가입일자를 수정하는 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
    ignore-on-modified
    no-action
  >
    <kw-form>
      <kw-form-row>
        <!-- 확정유무 -->
        <kw-form-item
          :label="$t('MSG_TXT_CNFM_EYN')"
          required
        >
          <kw-select
            v-model="searchParams.cntrCnfmYn"
            :options="[{ codeId: 'Y', codeName: 'Y' },
                       { codeId: 'N', codeName: 'N' }]"
            :label="$t('MSG_TXT_CNFM_EYN')"
            rules="required"
            first-option="select"
            first-option-value=""
            @change="onChangeCntrCnfmYn"
          />
        </kw-form-item>
        <!-- 확정일 -->
        <kw-form-item
          :label="$t('MSG_TXT_DTRM_DATE')"
          required
        >
          <kw-date-picker
            v-model="searchParams.cntrCnfmDtm"
            :readonly="searchParams.cntrCnfmYn === 'N'"
            :label="$t('MSG_TXT_DTRM_DATE')"
            :rules="searchParams.cntrCnfmYn === 'Y' ? 'required':''"
            @change="onChangeCntrCnfmDtm"
          />
        </kw-form-item>
        <!-- 가입일 -->
        <kw-form-item
          :label="$t('MSG_TXT_SUBS_DT')"
          required
        >
          <kw-date-picker
            v-model="searchParams.cntrPdStrtdt"
            :readonly="searchParams.cntrCnfmYn === 'N'"
            :label="$t('MSG_TXT_SUBS_DT')"
            :rules="searchParams.cntrCnfmYn === 'Y' ? 'required':''"
            @change="onChangeCntrPdStrtdt"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-grid
      ref="grdMainRef"
      :visible-rows="5"
      @init="initGrid"
    />
    <template #action>
      <!-- 취소 -->
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickClose"
      />
      <!-- 수정 -->
      <kw-btn
        primary
        :label="$t('MSG_BTN_MOD')"
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, stringUtil, useDataService, useGlobal, useModal } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { alert, confirm, notify } = useGlobal();
const { t } = useI18n();
const { ok, cancel: onClickClose } = useModal();
const dataService = useDataService();
const props = defineProps({
  cntrs: { type: Array, default: () => [] },
});
const now = dayjs();
const searchParams = ref({
  cntrNo: props.cntrNo, // 계약번호
  cntrSn: props.cntrSn, // 계약일련번호
  cntrCnfmYn: '', // 확정유무
  cntrCnfmDtm: dayjs().subtract(1, 'month').endOf('month').format('YYYYMMDD'), // 확정일
  cntrPdStrtdt: now.startOf('month').format('YYYYMMDD'), // 가입일
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

async function onClickSave() {
  const view = grdMainRef.value.getView();

  // 저장조건 검증
  if (view.getDataSource().getRowCount() <= 0) {
    return;
  }

  // 확정유무 선택여부 체크
  if (isEmpty(searchParams.value.cntrCnfmYn)) {
    await alert(t('MSG_TXT_CNFM_EYN') + t('MSG_ALT_BEFORE_SELECT_IT')); // 확정 유무를 선택해 주세요.
    return;
  }

  // 확정일, 가입일자 미존재시 오류
  if (searchParams.value.cntrCnfmYn === 'Y') { // 확정유무 Y일 경우
    if (isEmpty(searchParams.value.cntrCnfmDt) && isEmpty(searchParams.value.cntrPdStrtdt)) {
      await alert(t('MSG_ALT_CHK_REQ_DT')); // 필수일자를 확인하세요!
      return;
    }
  }

  // 확정일자가 현재월의 첫날 전날(이전월의 마지막일) 아닌경우
  if (searchParams.value.cntrCnfmYn === 'Y') { // 확정유무 Y일 경우
    if (searchParams.value.cntrCnfmDtm !== dayjs().subtract(1, 'month').endOf('month').format('YYYYMMDD')) {
      await alert(t('MSG_ALT_INP_PSBL_CNTR_CNFM_DT')); // 입력 가능한 확정일자가 아닙니다!
      searchParams.value.cntrCnfmDtm = dayjs().subtract(1, 'month').endOf('month').format('YYYYMMDD');
    }
  }

  // 가입일자가 현재월의 첫날이 아닌경우 오류
  if (searchParams.value.cntrCnfmYn === 'Y') { // 확정유무 Y일 경우
    if (searchParams.value.cntrPdStrtdt !== now.startOf('month').format('YYYYMMDD')) {
      await alert(t('MSG_ALT_INP_PSBL_CNTR_PD_STRTDT')); // 입력 가능한 가입일자가 아닙니다!
      searchParams.value.cntrPdStrtdt = now.startOf('month').format('YYYYMMDD');
    }
  }

  const rows = gridUtil.getAllRowValues(view);
  rows.forEach((row) => {
    row.cntrNo = String(row.cntrDtlNo).split('-')[0];
    row.cntrCnfmYn = searchParams.value.cntrCnfmYn; // 확정유무
    row.cntrCnfmDtm = searchParams.value.cntrCnfmDtm; // 확정일
    row.cntrPdStrtdt = searchParams.value.cntrPdStrtdt; // 가입일
  });
  console.log(rows);
  if (await confirm(t('MSG_ALT_CNTR_CNFM_YN_DT_PD_STRTDT', [searchParams.value.cntrCnfmYn, stringUtil.getDateFormat(searchParams.value.cntrCnfmDtm), stringUtil.getDateFormat(searchParams.value.cntrPdStrtdt)]))) {
    await dataService.put('/sms/wells/contract/contracts/order-detail-mngt/membership-confirm', rows);
    ok();
    await notify(t('MSG_ALT_SAVE_DATA'));
  }
}

async function onChangeCntrCnfmYn() {
  console.log(searchParams.value.cntrCnfmYn);
  if (searchParams.value.cntrCnfmYn === 'N') { // 확정유무 N일 경우
    searchParams.value.cntrCnfmDtm = '';
    searchParams.value.cntrPdStrtdt = '';
  }
}

async function onChangeCntrCnfmDtm() {
  console.log(searchParams.value.cntrCnfmDtm);
  // 확정유무 선택여부 체크
  if (isEmpty(searchParams.value.cntrCnfmYn)) {
    await alert(t('MSG_TXT_CNFM_EYN') + t('MSG_ALT_BEFORE_SELECT_IT')); // 확정 유무를 선택해 주세요.
    return;
  }

  // 확정일자가 현재월의 첫날 전날(이전월의 마지막일) 아닌경우
  if (searchParams.value.cntrCnfmYn === 'Y') { // 확정유무 Y일 경우
    if (searchParams.value.cntrCnfmDtm !== dayjs().subtract(1, 'month').endOf('month').format('YYYYMMDD')) {
      await alert(t('MSG_ALT_INP_PSBL_CNTR_CNFM_DT')); // 입력 가능한 확정일자가 아닙니다!
      searchParams.value.cntrCnfmDtm = dayjs().subtract(1, 'month').endOf('month').format('YYYYMMDD');
    }
  }
}

async function onChangeCntrPdStrtdt() {
  console.log(searchParams.value.cntrPdStrtdt);
  if (isEmpty(searchParams.value.cntrCnfmYn)) {
    await alert(t('MSG_TXT_CNFM_EYN') + t('MSG_ALT_BEFORE_SELECT_IT')); // 확정 유무를 선택해 주세요.
    return;
  }

  // 가입일자가 현재월의 첫날이 아닌경우 오류
  if (searchParams.value.cntrCnfmYn === 'Y') { // 확정유무 Y일 경우
    if (searchParams.value.cntrPdStrtdt !== now.startOf('month').format('YYYYMMDD')) {
      await alert(t('MSG_ALT_INP_PSBL_CNTR_PD_STRTDT')); // 입력 가능한 가입일자가 아닙니다!
      searchParams.value.cntrPdStrtdt = now.startOf('month').format('YYYYMMDD');
    }
  }
}

onMounted(async () => {
  console.log(props.cntrs);
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(props.cntrs);
  view.resetCurrent();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cstKnm' }, // 계약자명
    { fieldName: 'rcgvpKnm' }, // 설치자명
    { fieldName: 'pdCd' }, // 상품코드
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'cntrCnfmYn' }, // 확정유무
    { fieldName: 'cntrCnfmDt' }, // 확정일
    { fieldName: 'cntrPdStrtdt' }, // 가입일
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '180', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '118', styleName: 'text-center' }, // 계약자명
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_IST_NM'), width: '118', styleName: 'text-center' }, // 설치자명
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '116', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '251', styleName: 'text-left' }, // 상품명
    { fieldName: 'cntrCnfmYn', header: t('MSG_TXT_CNFM_EYN'), width: '116', styleName: 'text-center' }, // 확정유무
    { fieldName: 'cntrCnfmDt', header: t('MSG_TXT_DTRM_DATE'), width: '116', styleName: 'text-center', datetimeFormat: 'date' }, // 확정일
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_SUBS_DT'), width: '116', styleName: 'text-center', datetimeFormat: 'date' }, // 가입일
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = false;
});
</script>
