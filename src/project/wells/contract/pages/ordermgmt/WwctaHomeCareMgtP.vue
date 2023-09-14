<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaHomeCareMgtP - wells 홈케어 관리
3. 작성자 : sc
4. 작성일 : 2023.02.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
선택한 wells 홈케어 계약의 배송예정일자와 취소일자를 수정하는 팝업
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
        <kw-form-item
          :label="$t('MSG_TXT_CAN_D')"
        >
          <kw-date-picker
            v-model="dts.candt"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_DUEDT')"
        >
          <kw-date-picker
            v-model="dts.duedt"
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
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickClose"
      />
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
import { defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useModal } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { alert, notify } = useGlobal();
const { t } = useI18n();
const { ok, cancel: onClickClose } = useModal();
const dataService = useDataService();
const props = defineProps({
  cntrs: { type: Array, default: () => [] },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const dts = ref({
  candt: '',
  duedt: '',
});
// async function fetchData() {
//   const res = await dataService.post('/sms/wells/contract/contracts/homecares', props.cntrs);

//   const view = grdMainRef.value.getView();
//   view.getDataSource().setRows(res.data);
//   view.resetCurrent();
// }

async function onClickSave() {
  const view = grdMainRef.value.getView();
  console.log(view.getDataSource().getRowCount());
  // 저장조건 검증
  if (view.getDataSource().getRowCount() <= 0) {
    // 모화면에서 계약을 가져오므로 일반적으로 데이터가 없는 경우는 없을 것
    return;
  }
  if (isEmpty(dts.value.candt) && isEmpty(dts.value.duedt)) {
    await alert(t('MSG_ALT_IN_CANDT_DUEDT'));
    return;
  }
  if (dts.value.candt > dayjs().format('YYYYMMDD')) {
    await alert(t('MSG_ALT_PHT_FUR_CANDT'));
    return;
  }
  const rows = gridUtil.getAllRowValues(view);
  rows.forEach((row) => {
    row.candt = dts.value.candt;
    row.duedt = dts.value.duedt;
  });
  console.log(rows);
  await dataService.put('/sms/wells/contract/contracts/homecares', rows);
  ok();
  await notify(t('MSG_ALT_SAVE_DATA'));
  // await fetchData();
}

onMounted(async () => {
  console.log(props.cntrs);
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(props.cntrs);
  view.resetCurrent();
  // await fetchData();
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
    { fieldName: 'cntrCnfmDt' }, // 확정일
    { fieldName: 'cntrPdStrtdt' }, // 가입일
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '180', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '118', styleName: 'text-center' }, // 계약자명
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_IST_NM'), width: '118', styleName: 'text-center' }, // 설치자명
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '116', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '251', styleName: 'text-left' }, // 상품명
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
