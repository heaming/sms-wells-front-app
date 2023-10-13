<template>
  <h3>렌탈 접수자료 업로드</h3>
  <kw-action-top>
    <template #left>
      <kw-paging-info
        :total-count="pageInfo.totalCount"
      />
    </template>
    <kw-btn
      icon="upload_on"
      dense
      secondary
      label="엑셀업로드"
      @click="onClickExcelUpload"
    />
    <kw-separator
      vertical
      inset
      spaced
    />
    <kw-btn
      dense
      secondary
      label="업로드 코드 확인"
      @click="onClickCheckCode"
    />
    <kw-separator
      vertical
      inset
      spaced
    />
    <kw-btn
      dense
      primary
      label="등록"
      :disable="uploaded || !pageInfo.totalCount"
      @click="onClickConfirm"
    />
  </kw-action-top>
  <kw-grid
    ref="grdRef"
    name="grdRental"
    :visible-rows="visibleRows"
    @init="initGrd"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, modal, notify, useDataService } from 'kw-lib';
import { useCtCode, useGridDataModel } from '~sms-common/contract/composable';
import {
  validateBryyMmddWithCopnCdCd,
  validateBzrnoWithCopnCdCd, validateTel1, validateTel2, validateTel3,
} from '~sms-common/contract/util';

const { t } = useI18n();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRef = ref(getComponentType('KwGrid'));
const grdView = computed(() => grdRef.value?.getView());
const grdData = computed(() => grdRef.value?.getData());
const pageInfo = ref({
  totalCount: 0,
});
const visibleRows = computed(() => Math.min(Math.max(pageInfo.value.totalCount, 1), 5));
const uploaded = ref(false);
let gridDataModel;

const { codes, getCode } = await useCtCode(
  'ALNCMP_DG_PRTNR_MAPNG_CD',
  'COPN_DV_CD',
  'SEX_DV_CD',
  'RENTAL_DSC_DV_CD',
  'RENTAL_DSC_TP_CD',
  'RENTAL_CRP_DSCR_CD',
  'SPAY_DSC_DV_CD',
  'SPAY_DSCR_CD',
  'BFSVC_BZS_DV_CD',
  'SPLY_BZS_DV_CD',
  'HCR_DV_CD',
);

async function onClickConfirm() {
  uploaded.value = true;
  const rows = gridUtil.getAllRowValues(grdView.value);
  await dataService.post('/sms/wells/contract/bulk-upload/rentals', rows);
  notify('저장되었습니다.'); /* todo msg */
}

function onClickCheckCode() {
  modal({
    component: 'WwctaReceiptBulkUploadP',
    componentProps: {
      parent: 'WwctaReceiptBulkUploadMProspectCustomer',
    },
  });
}

async function validate(row) {
  const {
    adr1,
    adr2,
  } = row;
  if (!adr1 || !adr2) {
    throw new Error('주소값은 필수 입니다.');
  }

  const { data } = await dataService.put('/sms/wells/contract/bulk-upload/rentals/validate', row, {
    alert: false,
  });

  return data;
}

async function onClickExcelUpload() {
  grdData.value.clearRows();
  pageInfo.value.totalCount = 0;
  uploaded.value = false;
  const { result, payload } = await modal({
    component: 'ZctzExcelUploadP',
    componentProps: {
      columns: gridDataModel.dataModelObject,
      templateDocId: 'FOM_RENTAL_CONTRACT_BATCH_UPLOAD',
      headerRows: 2,
      validationBtn: false,
      serverSideValidation: validate,
      serverSideValidateOption: { sideEffect: true },
    },
  });
  if (result) {
    const { list } = payload;
    pageInfo.value.totalCount = list.length || 0;
    grdData.value.setRows(list);
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd = defineGrid((data, view) => {
  gridDataModel = useGridDataModel(view, {
    basePdCd: {
      label: t('기준상품코드'),
      width: 133,
      required: true,
      rules: 'alpha_num|max:10',
      classes: 'text-center',
    },
    copnDvCd: { label: t('개인법인구분'), width: 146, options: codes.COPN_DV_CD, required: true },
    cstNo: { label: t('고객번호'), width: 146, classes: 'text-center', required: true },
    alncmpDgPrtnrMapngCd: {
      label: t('대표파트너번호'),
      width: 146,
      options: codes.ALNCMP_DG_PRTNR_MAPNG_CD,
      required: true,
    },
    alncmpCd: {
      displaying: false,
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const alncmpDgPrtnrMapngCdId = values[fields.indexOf('alncmpDgPrtnrMapngCd')];
        const alncmpDgPrtnrMapngCd = getCode('ALNCMP_DG_PRTNR_MAPNG_CD', alncmpDgPrtnrMapngCdId);
        return alncmpDgPrtnrMapngCd?.prtsCodeId || '';
      },
    },
    cntrAmt: { label: t('등록비'), type: Number, width: 146 },
    cntrPtrm: { label: t('계약기간'), type: Number, width: 146, required: true },
    svPdCd: { label: t('서비스상품코드'), width: 146, classes: 'text-center', required: true }, /* 상품코드 긁어올까.. */
    stplPtrm: { label: t('약정기간'), type: Number, width: 146, required: true },
    rentalDscTpCd: { label: t('렌탈할인유형코드'), width: 146, options: codes.RENTAL_DSC_TP_CD },
    rentalDscDvCd: { label: t('렌탈할인구분코드'), width: 146, options: codes.RENTAL_DSC_DV_CD },
    rentalCrpDscrCd: { label: t('렌탈법인할인율코드'), width: 146, options: codes.RENTAL_CRP_DSCR_CD },
    crpSpcDsprc: { label: t('법인특별할인가'), type: Number, width: 146 }, /* 법인특별할인가 */
    cstKnm: { label: t('고객명'), width: 146, classes: 'text-center', required: true },
    bryyMmdd: {
      label: t('MSG_TXT_BIRTH_DATE'),
      width: 128,
      classes: 'text-center',
      rules: validateBryyMmddWithCopnCdCd,
    },
    bzrno: {
      label: t('사업자번호'),
      width: 128,
      classes: 'text-center',
      rules: validateBzrnoWithCopnCdCd,
    },
    sexDvCd: { label: t('MSG_TXT_GENDER_MF'), width: 128, options: codes.SEX_DV_CD },
    cralLocaraTno: {
      label: `${t('휴대')}1`,
      width: 128,
      classes: 'text-center',
      rules: validateTel1,
    },
    mexnoEncr: {
      label: `${t('휴대')}2`,
      width: 128,
      classes: 'text-center',
      rules: validateTel2,
    },
    cralIdvTno: {
      label: `${t('휴대')}3`,
      width: 128,
      classes: 'text-center',
      rules: validateTel3,
    },
    locaraTno: {
      label: `${t('전화')}1`,
      width: 128,
      classes: 'text-center',
      rules: validateTel1,
    },
    exnoEncr: {
      label: `${t('전화')}2`,
      width: 128,
      classes: 'text-center',
      rules: validateTel2,
    },
    idvTno: {
      label: `${t('전화')}3`,
      width: 128,
      classes: 'text-center',
      rules: validateTel3,
    },
    zip: { label: t('MSG_TXT_ZIP'), width: 128, classes: 'text-center' },
    adr1: { label: `${t('MSG_TXT_ADDR')}1`, width: 275, classes: 'text-left', required: true },
    adr2: { label: `${t('MSG_TXT_ADDR')}2`, width: 275, classes: 'text-left' },
    gift1: { label: t('사은품1'), width: 275, classes: 'text-left bg-error' }, /* 안써요. */
    gift2: { label: t('사은품2'), width: 275, classes: 'text-left bg-error' }, /* 안써요. */
    alncmpSuscOrdNo: { label: t('구독주문번호'), width: 146 },

    /* 이하 서버 다녀와서 채워지는 정보들 */
    adrId: { displaying: false },
    pdHclsfId: { displaying: false },
    pdMclsfId: { displaying: false },
    pdLclsfId: { displaying: false },
    pdDclsfId: { displaying: false },
    sellTpCd: { displaying: false },
    sellTpDtlCd: { displaying: false },
    svPrd: { displaying: false, type: Number },
    pdBaseAmt: { displaying: false, type: Number },
    sellAmt: { displaying: false, type: Number },
    dscAmt: { displaying: false, type: Number },
    cntramDscAmt: { displaying: false, type: Number },
    fnlAmt: { displaying: false, type: Number },
    vat: { displaying: false, type: Number },
    cntrTam: { displaying: false, type: Number },
    ackmtPerfRt: { displaying: false, type: Number },
    ackmtPerfAmt: { displaying: false, type: Number },
    feeAckmtCt: { displaying: false, type: Number },
    feeAckmtBaseAmt: { displaying: false, type: Number },
    sellInflwChnlDtlCd: { displaying: false },
    pdctPdRelId: { displaying: false },
    pdctPdCd: { displaying: false },
    pdctVlStrtDtm: { displaying: false },
    pdctVlEndDtm: { displaying: false },
    pdctPdQty: { displaying: false, type: Number },
    svPdRelId: { displaying: false },
    svVlStrtDtm: { displaying: false },
    svVlEndDtm: { displaying: false },
    svPdQty: { displaying: false, type: Number },
    pdPrcFnlDtlId: { displaying: false },
    verSn: { displaying: false, type: Number },
    fxamFxrtDvCd: { displaying: false },
    ctrVal: { displaying: false, type: Number },
    fnlVal: { displaying: false, type: Number },
    pdPrcId: { displaying: false },
    sellDscCtrAmt: { displaying: false, type: Number },
    alncmpDgPrtnrOgTpCd: { displaying: false /* 코드가 불안정하며 서버에서 조회하도록 변경 */ },
  });

  view.rowIndicator.visible = true;
});

</script>
