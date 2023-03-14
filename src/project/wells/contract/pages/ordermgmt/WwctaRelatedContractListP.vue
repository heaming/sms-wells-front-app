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
      :visible-rows="5"
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
      :visible-rows="5"
      @init="initGridNewCstInfo"
    />
    <template #action>
      <kw-btn
        primary
        :label="$t('MSG_BTN_CLOSE')"
        @click="onClickClose"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, useModal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { cancel } = useModal();
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

async function onClickClose() {
  cancel();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridPextCstInfo = defineGrid((data, viewPextCstInfo) => {
  const fields = [
    { fieldName: 'cntrNoFull' },
    { fieldName: 'cstKnm' },
    { fieldName: 'basePdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'sellTpNm' },
    { fieldName: 'keepPtrm' },
  ];

  const columns = [
    { fieldName: 'cntrNoFull', header: `${t('MSG_TXT_PEXT')} ${t('MSG_TXT_CST_NO')}`, width: '131', styleName: 'text-center' }, // 기존 고객번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '131', styleName: 'text-left' }, // 고객명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '131', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '131', styleName: 'text-left' }, // 상품명
    { fieldName: 'sellTpNm', header: t('MSG_TXT_TYPE'), width: '131', styleName: 'text-center' }, // 유형
    { fieldName: 'keepPtrm', header: t('MSG_TXT_KEEP_PTRM'), width: '110', styleName: 'text-right' }, // 유지기간
  ];

  data.setFields(fields);
  viewPextCstInfo.setColumns(columns);

  viewPextCstInfo.rowIndicator.visible = false;
});
const initGridNewCstInfo = defineGrid((data, viewNewCstInfo) => {
  const fields = [
    { fieldName: 'cntrNoFull' },
    { fieldName: 'cstKnm' },
    { fieldName: 'basePdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'sellTpNm' },
    { fieldName: 'keepPtrm' },
    { fieldName: 'rentalNmn' },
    { fieldName: 'fnlVal' },
    { fieldName: 'dscAmt' },
    { fieldName: 'allDscAmt' },
    { fieldName: 'rcvryAmt' },
    { fieldName: 'mutuYn' },
  ];

  const columns = [
    { fieldName: 'cntrNoFull', header: `${t('MSG_TXT_NEW')} ${t('MSG_TXT_CST_NO')}`, width: '131', styleName: 'text-center' }, // 신규 고객번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '131', styleName: 'text-left' }, // 고객명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '131', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '131', styleName: 'text-center' }, // 상품명
    { fieldName: 'sellTpNm', header: t('MSG_TXT_TYPE'), width: '131', styleName: 'text-center' }, // 유형
    { fieldName: 'keepPtrm', header: t('MSG_TXT_KEEP_PTRM'), width: '96', styleName: 'text-center' }, // 유지기간
    { fieldName: 'rentalNmn', header: t('MSG_TXT_NTXM'), width: '74', styleName: 'text-center' }, // 차월
    { fieldName: 'fnlVal', header: t('MSG_TXT_CRTL_CHRAM'), width: '115', styleName: 'text-center' }, // 현요금
    { fieldName: 'dscAmt', header: t('MSG_TXT_DSC'), width: '115', styleName: 'text-center' }, // 할인
    { fieldName: 'allDscAmt', header: t('MSG_TXT_TOT_DSC_AMT'), width: '115', styleName: 'text-center' }, // 총할인
    { fieldName: 'rcvryAmt', header: t('MSG_TXT_RESTORE_CHRAM'), width: '115', styleName: 'text-center' }, // 원복요금
    { fieldName: 'mutuYn', header: t('MSG_TXT_MUTU_EYN'), width: '115', styleName: 'text-center' }, // 상조유무
  ];

  data.setFields(fields);
  viewNewCstInfo.setColumns(columns);

  viewNewCstInfo.rowIndicator.visible = false;
});
</script>
<style scoped>
</style>
