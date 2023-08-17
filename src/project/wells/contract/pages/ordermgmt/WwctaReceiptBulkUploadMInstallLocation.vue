<template>
  <h3>설치처 변경 접수자료 업로드</h3>
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
    name="grdInstall"
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
  validateCntrNo,
  validateCntrSn,
  validateTel1,
  validateTel2,
  validateTel3,
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

const { codes } = await useCtCode(
  'SELL_TP_CD',
  'CNTRT_REL_CD',
);

async function onClickConfirm() {
  uploaded.value = true;
  const rows = gridUtil.getAllRowValues(grdView.value);
  await dataService.post('/sms/wells/contract/bulk-upload/install-locations', rows);
  notify('저장되었습니다.');
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
  const { data } = await dataService.put('/sms/wells/contract/bulk-upload/install-location/validate', row, {
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
      templateDocId: 'FOM_INSTALLATION_ADDRESS_CHANGE_BATCH_UPLOAD',
      headerRows: 2,
      validationBtn: false,
      addBtn: true,
      deleteBtn: true,
      downloadBtn: true,
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
    sellTpCd: {
      label: t('판매유형코드'),
      width: 146,
      options: codes.SELL_TP_CD,
    },
    cntrNo: {
      label: t('계약번호'),
      width: 133,
      required: true,
      rules: validateCntrNo,
      classes: 'text-center',
    },
    cntrSn: {
      label: t('계약일련번호'),
      width: 133,
      required: true,
      rules: validateCntrSn,
      classes: 'text-center',
    },
    rcgvpKnm: { label: t('고객명'), width: 146, classes: 'text-center', required: true },
    cntrtRelCd: { label: t('계약자관계코드'), width: 146, options: codes.CNTRT_REL_CD, required: true },
    zip: { label: t('MSG_TXT_ZIP'), width: 128, classes: 'text-center', required: true },
    adr1: { label: `${t('MSG_TXT_ADDR')}1`, width: 275, classes: 'text-left', required: true },
    adr2: { label: `${t('MSG_TXT_ADDR')}2`, width: 275, classes: 'text-left' },
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
    /* 이하 서버 다녀와서 채워지는 정보들 */
    adrId: { displaying: false },
    cntrCstNo: { displaying: false },
    copnDvCd: { displaying: false },
    origCntrAdrRelId: { displaying: false },
    adrpcTpCd: { displaying: false },
    cntrUnitTpCd: { displaying: false },
  });

  view.rowIndicator.visible = true;
});

</script>
