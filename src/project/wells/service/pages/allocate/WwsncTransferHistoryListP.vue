<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : [W-SV-U-0019P01] WwsncTransferHistoryListP - 이관이력 조회
3. 작성자 : juno.cha
4. 작성일 : 2023.05.03
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 이관이력 조회 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
  >
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="totalCount.totalCount" />
      </template>
    </kw-action-top>
    <kw-grid
      ref="gridMainRef"
      :visible-rows="10"
      @init="initGrid"
    />
    <template #action>
      <kw-btn
        primary
        label="확인"
        @click="onClickCancel"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, useDataService, getComponentType, useModal, codeUtil } from 'kw-lib';
import { onMounted } from 'vue';

const { t } = useI18n();
const { cancel: onClickCancel } = useModal();
const dataService = useDataService();
const gridMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'TF_AK_DV_CD',
  'TF_AK_RSON_CD',
);

/*
 *  Parent Parameter를 가져오기 위한 변수 선언.
 */
const props = defineProps({
  cstSvAsnNo: {
    type: String,
    required: true,
  },
});

const totalCount = ref({
  totalCount: 0,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

/*
 * 이관이력 조회
 */
async function getTransferHistories() {
  const res = await dataService.get('/sms/wells/service/transfer-histories', { params: { cstSvAsnNo: props.cstSvAsnNo } });
  totalCount.value.totalCount = res.data.length;
  const view = gridMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  // view.resetCurrent();
}

onMounted(async () => {
  await getTransferHistories();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'fnlMdfcDtm' },
    { fieldName: 'asnTfDvCd' },
    { fieldName: 'bfOgNm' },
    { fieldName: 'bfCnfmPsicPrtnrNo' },
    { fieldName: 'bfPrtnrKnm' },
    { fieldName: 'afOgNm' },
    { fieldName: 'afCnfmPsicPrtnrNo' },
    { fieldName: 'afPrtnrKnm' },
    { fieldName: 'tfCnfmdt' },
    { fieldName: 'tfAkRsonCd' },
    { fieldName: 'tfOgNm' },
    { fieldName: 'tfPrtnrKnm' },
    { fieldName: 'tfOgTpCd' },
    { fieldName: 'tfPrtnrNo' },
    { fieldName: 'tfOgId' },
  ];

  const columns = [
    { fieldName: 'fnlMdfcDtm', header: t('이관일시'), width: '200', styleName: 'text-center' },
    { fieldName: 'asnTfDvCd', header: t('이관사유'), width: '150', styleName: 'text-center', options: codes.TF_AK_DV_CD },
    { fieldName: 'bfOgNm', header: t('소속'), width: '150', styleName: 'text-left' },
    { fieldName: 'bfCnfmPsicPrtnrNo', header: t('사번'), width: '100', styleName: 'text-right' },
    { fieldName: 'bfPrtnrKnm', header: t('성명'), width: '100', styleName: 'text-center' },
    { fieldName: 'afOgNm', header: t('소속'), width: '150', styleName: 'text-left' },
    { fieldName: 'afCnfmPsicPrtnrNo', header: t('사번'), width: '100', styleName: 'text-right' },
    { fieldName: 'afPrtnrKnm', header: t('성명'), width: '100', styleName: 'text-center' },
    { fieldName: 'tfCnfmdt', header: t('이관일자'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'tfAkRsonCd', header: t('이관사유'), width: '170', styleName: 'text-center', options: codes.TF_AK_RSON_CD },
    { fieldName: 'tfOgNm', header: t('소속'), width: '150', styleName: 'text-left' },
    { fieldName: 'tfPrtnrKnm', header: t('성명'), width: '100', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setColumnLayout([
    'fnlMdfcDtm', 'asnTfDvCd',
    {
      header: t('이관 전 담당자'),
      direction: 'horizontal',
      items: ['bfOgNm', 'bfCnfmPsicPrtnrNo', 'bfPrtnrKnm'],
    },
    {
      header: t('이관 후 담당자'),
      direction: 'horizontal',
      items: ['afOgNm', 'afCnfmPsicPrtnrNo', 'afPrtnrKnm'],
    },
    {
      header: t('이관요청정보'),
      direction: 'horizontal',
      items: ['tfCnfmdt', 'tfAkRsonCd', 'tfOgNm', 'tfPrtnrKnm'],
    },
  ]);
});
</script>
