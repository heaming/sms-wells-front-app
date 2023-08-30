<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaRelatedContractListP - 연관(관련) 계약리스트 (주문상세)
3. 작성자 : jihoon.kim
4. 작성일 : 2023.03.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U0047] - 고객상세조회 화면 內 1+1 접수정보 조회 기능으로 적용
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <h3 class="mb10">
      {{ t('MSG_TXT_PEXT')+' '+t('MSG_TXT_CST_INF') }}
    </h3>
    <kw-action-top class="mt0">
      <template #left>
        <span class="kw-fc--black3 text-weight-regular">(단위 : 개월)</span>
      </template>
    </kw-action-top>
    <kw-grid
      ref="grdPextCstInfoRef"
      name="grdPextCstInfo"
      :visible-rows="1"
      @init="initGridPextCstInfo"
    />
    <h3 class="mb10">
      {{ t('MSG_TXT_NEW')+' '+t('MSG_TXT_CST_INF') }}
    </h3>
    <kw-action-top class="mt0">
      <template #left>
        <span class="kw-fc--black3 text-weight-regular">(단위 : 원 / 개월)</span>
      </template>
    </kw-action-top>

    <kw-grid
      ref="grdNewCstInfoRef"
      name="grdNewCstInfo"
      :visible-rows="1"
      @init="initGridNewCstInfo"
    />
    <!-- <template #action>
      <kw-btn
        primary
        :label="$t('MSG_BTN_CLOSE')"
        @click="onClickClose"
      />
    </template> -->
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService /* , useModal */ } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
// const { cancel } = useModal();
const props = defineProps({
  cntrNo: { type: String, required: true, default: '' },
  cntrSn: { type: String, required: false, default: '' },
});

let cachedParams;
const searchParams = ref({
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdPextCstInfoRef = ref(getComponentType('KwGrid'));
const grdNewCstInfoRef = ref(getComponentType('KwGrid'));

async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  res = await dataService.get('/sms/wells/contract/contracts/related-contracts', { params: cachedParams });

  // console.log(res.data.searchPextCstInfoResList);
  // console.log(res.data.searchNewCstInfoResList);

  const viewPextCstInfo = grdPextCstInfoRef.value.getView();
  // view.getDataSource().setRows(accounts);
  viewPextCstInfo.getDataSource().setRows(res.data.searchPextCstInfoResList);
  viewPextCstInfo.resetCurrent();

  const viewNewCstInfo = grdNewCstInfoRef.value.getView();
  // view.getDataSource().setRows(accounts);
  viewNewCstInfo.getDataSource().setRows(res.data.searchNewCstInfoResList);
  viewNewCstInfo.resetCurrent();
}

onMounted(async () => {
  await fetchData();
});

// async function onClickClose() {
//   cancel();
// }

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridPextCstInfo = defineGrid((data, viewPextCstInfo) => {
  const fields = [
    { fieldName: 'cntrDt' }, // 계약일자
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'basePdCd' }, // 상품코드
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'sellTpCd' }, // 판매유형코드
    { fieldName: 'sellTpNm' }, // 판매유형코드명
    { fieldName: 'keepPtrm' }, // 유지기간
  ];

  const columns = [
    { fieldName: 'cntrDt', header: t('MSG_TXT_CNTR_DATE'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 계약일자
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '131', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '131', styleName: 'text-left' }, // 고객명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '131', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '196', styleName: 'text-left' }, // 상품명
    { fieldName: 'sellTpNm', header: t('MSG_TXT_TYPE'), width: '110', styleName: 'text-center' }, // 판매유형코드명
    { fieldName: 'keepPtrm', header: t('MSG_TXT_KEEP_PTRM'), width: '196', styleName: 'text-center' }, // 유지기간
  ];

  data.setFields(fields);
  viewPextCstInfo.setColumns(columns);
  viewPextCstInfo.checkBar.visible = false;
  viewPextCstInfo.rowIndicator.visible = true;
});

const initGridNewCstInfo = defineGrid((data, viewNewCstInfo) => {
  const fields = [
    { fieldName: 'cntrDt' }, // 계약일자
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'ojDtlCntrNo' }, // 대상상세계약번호
    { fieldName: 'ojDtlCntrSn' }, // 대상상세계약일련번호
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'basePdCd' }, // 상품코드
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'sellTpDtlNm' }, // 판매유형상세코드명
    { fieldName: 'keepPtrm' }, // 유지기간
    { fieldName: 'cntrRelDtlNm' }, // 연관계약명
    { fieldName: 'rentalTn' }, // 차월
    { fieldName: 'sellAmt', dataType: 'number' }, // 현요금
    { fieldName: 'dscAmt', dataType: 'number' }, // 할인
    { fieldName: 'dscTam', dataType: 'number' }, // 총할인
    { fieldName: 'pdBaseAmt', dataType: 'number' }, // 원복요금
    { fieldName: 'mutuYn' }, // 상조유무
  ];

  const columns = [
    { fieldName: 'cntrDt', header: t('MSG_TXT_CNTR_DATE'), width: '136', styleName: 'text-center', datetimeFormat: 'date' }, // 계약일자
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '136', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '131', styleName: 'text-left' }, // 고객명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '131', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '196', styleName: 'text-center' }, // 상품명
    { fieldName: 'sellTpDtlNm', header: t('MSG_TXT_TYPE'), width: '131', styleName: 'text-center' }, // 판매유형코드명
    { fieldName: 'keepPtrm', header: t('MSG_TXT_KEEP_PTRM'), width: '196', styleName: 'text-center' }, // 유지기간
    { fieldName: 'cntrRelDtlNm', header: t('MSG_TXT_RLTD_CNTR_NM'), width: '131', styleName: 'text-center' }, // 연관계약명
    { fieldName: 'rentalTn', header: t('MSG_TXT_NMN'), width: '74', styleName: 'text-right' }, // 차월
    { fieldName: 'sellAmt', header: t('MSG_TXT_CRTL_CHRAM'), width: '115', styleName: 'text-right' }, // 현요금
    { fieldName: 'dscAmt', header: t('MSG_TXT_DSC'), width: '115', styleName: 'text-right' }, // 할인
    { fieldName: 'dscTam', header: t('MSG_TXT_TOT_DSC_AMT'), width: '115', styleName: 'text-right' }, // 총할인
    { fieldName: 'pdBaseAmt', header: t('MSG_TXT_RESTORE_CHRAM'), width: '115', styleName: 'text-right' }, // 원복요금
    { fieldName: 'mutuYn', header: t('MSG_TXT_MUTU_EYN'), width: '74', styleName: 'text-center' }, // 상조유무
  ];

  data.setFields(fields);
  viewNewCstInfo.setColumns(columns);
  viewNewCstInfo.checkBar.visible = false;
  viewNewCstInfo.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
