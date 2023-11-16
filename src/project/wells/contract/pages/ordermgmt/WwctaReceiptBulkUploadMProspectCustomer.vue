<template>
  <h3>가망고객 접수자료 업로드</h3>
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
    name="grdProspect"
    :visible-rows="visibleRows"
    @init="initGrd"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import {
  codeUtil,
  defineGrid,
  getComponentType,
  gridUtil,
  modal,
  notify,
  useDataService,
} from 'kw-lib';
import useGridDataModel from '~sms-common/contract/composable/useGridDataModel';
import {
  validateBryyMmddWithCopnCdCd,
  validateBzrnoWithCopnCdCd,
  validatePdCd,
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

const codes = await codeUtil.getMultiCodes(
  'USE_YN',
  'ALNCMP_DG_PRTNR_MAPNG_CD',
  'COPN_DV_CD',
  'SEX_DV_CD',
  'RENTAL_DSC_DV_CD',
  'RENTAL_DSC_TP_CD',
  'SPAY_DSC_DV_CD',
  'SPAY_DSCR_CD',
  'BFSVC_BZS_DV_CD',
  'SPLY_BZS_DV_CD',
  'HCR_DV_CD',
);

async function onClickConfirm() {
  uploaded.value = true;
  const rows = gridUtil.getAllRowValues(grdView.value);
  await dataService.post('/sms/wells/contract/bulk-upload/prospects', rows);
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
  const { data: sideEffect } = await dataService.put('/sms/wells/contract/bulk-upload/prospects/validate', row, {
    alert: false,
  });

  return sideEffect;
}

async function onClickExcelUpload() {
  grdData.value.clearRows();
  pageInfo.value.totalCount = 0;
  uploaded.value = false;
  const { result, payload } = await modal({
    component: 'ZctzExcelUploadP',
    componentProps: {
      columns: gridDataModel.dataModelObject,
      templateDocId: 'FOM_PROMISING_CUSTOMER_BATCH_UPLOAD',
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
      rules: validatePdCd,
      classes: 'text-center',
    },
    pspcCstInflwDt: {
      label: t('접수일자'),
      width: 146,
      datetimeFormat: 'date',
      required: true,
      rules: 'max:50',
    },
    pspcCstKnm: { label: t('고객명'), width: 146, classes: 'text-center', required: true },
    copnDvCd: { label: t('법인격구분코드'), width: 146, options: codes.COPN_DV_CD, required: true },
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
      rules: 'numeric|length:3',
    },
    mexnoEncr: {
      label: `${t('휴대')}2`,
      width: 128,
      classes: 'text-center',
      rules: 'numeric|min:3|max:4',
    },
    cralIdvTno: {
      label: `${t('휴대')}3`,
      width: 128,
      classes: 'text-center',
      rules: 'numeric|length:4',
    },
    locaraTno: {
      label: `${t('전화')}1`,
      width: 128,
      classes: 'text-center',
      rules: 'numeric|length:3',
    },
    exnoEncr: {
      label: `${t('전화')}2`,
      width: 128,
      classes: 'text-center',
      rules: 'numeric|min:3|max:4',
    },
    idvTno: { label: `${t('전화')}3`, width: 128, classes: 'text-center', rules: 'numeric|length:4' },
    zip: { label: t('MSG_TXT_ZIP'), width: 128, classes: 'text-center' },
    adr1: { label: `${t('MSG_TXT_ADDR')}1`, width: 275, classes: 'text-left' },
    adr2: { label: `${t('MSG_TXT_ADDR')}2`, width: 275, classes: 'text-left' },
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
        const alncmpDgPrtnrMapngCd = codes.ALNCMP_DG_PRTNR_MAPNG_CD
          .find((code) => code.codeId === alncmpDgPrtnrMapngCdId);
        return alncmpDgPrtnrMapngCd?.prtsCodeId || '';
      },
    },
    alncmpDgPrtnrOgTpCd: {
      displaying: false,
    }, // 서버 채번으로 변경
    cntrAmt: { label: t('등록비'), type: Number, width: 146 },
    cntrPtrm: { label: t('변동개월'), type: Number, width: 146 },
    svPdCd: { label: t('서비스상품코드'), width: 146, classes: 'text-center' }, /* 상품코드 긁어올까.. */
    rentalDscDvCd: { label: t('렌탈할인구분코드'), width: 146, options: codes.RENTAL_DSC_DV_CD },
    rentalDscTpCd: { label: t('렌탈할인유형코드'), width: 146, options: codes.RENTAL_DSC_TP_CD },
    alncmpSuscOrdNo: { label: t('구독주문번호'), width: 146 },
    spayDscDvCd: { label: t('일시불할인구분코드'), width: 146, options: codes.SPAY_DSC_DV_CD },
    spayDscTpCd: { label: t('일시불할인율코드'), width: 146, options: codes.SPAY_DSCR_CD },
    frisuMshPtrm: { label: t('무상멤버십기간'), type: Number, width: 146 },
    hcrDvCd: { label: t('홈케어구분코드'), width: 146, options: codes.HCR_DV_CD },
    bfsvcBzsDvCd: { label: t('BS업체구분코드'), width: 146, options: codes.BFSVC_BZS_DV_CD },
    splyBzsDvCd: { label: t('조달업체구분코드'), width: 146, options: codes.SPLY_BZS_DV_CD },
    /* 이하 서버 업데이트 핃드 */
    cnslMoCn: {
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const memo = {};
        memo['등록비'] = values[fields.indexOf('cntrAmt')];
        memo['변동개월'] = values[fields.indexOf('cntrPtrm')];
        memo['서비스상품코드'] = values[fields.indexOf('svPdCd')];
        memo['렌탈할인구분코드'] = values[fields.indexOf('rentalDscDvCd')];
        memo['렌탈할인유형코드'] = values[fields.indexOf('rentalDscTpCd')];
        memo['구독주문번호'] = values[fields.indexOf('alncmpSuscOrdNo')];
        memo['일시불할인구분코드'] = values[fields.indexOf('spayDscDvCd')];
        memo['일시불할인율코드'] = values[fields.indexOf('spayDscTpCd')];
        memo['무상멤버십기간'] = values[fields.indexOf('frisuMshPtrm')];
        memo['홈케어구분코드'] = values[fields.indexOf('hcrDvCd')];
        memo['BS업체구분코드'] = values[fields.indexOf('bfsvcBzsDvCd')];
        memo['조달업체구분코드'] = values[fields.indexOf('splyBzsDvCd')];
        // return Object.entries(memo)
        //   .filter(([, v]) => !!v)
        //   .map(([k, v]) => `"${k}":"${v}"`)
        //   .join();
        return JSON.stringify(memo);
      },
      displaying: false,
    },
    adrId: { displaying: false },
    pdHclsfId: { displaying: false },
    pdMclsfId: { displaying: false },
    pdLclsfId: { displaying: false },
    pdDclsfId: { displaying: false },
  });

  view.rowIndicator.visible = true;
});

</script>
