<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA
 2. 프로그램 ID : WwsnaBsCsmbDeliveryBaseRegP - BS소모품 배부기준 등록
 3. 작성자 : seungsoo.kim
 4. 작성일 : 2023.04.03
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 신입/개인/빌딩 BS소모품 배부를 위한 지급기준을 등록하는 화면
 ****************************************************************************************************
--->
<template>
  <kw-popup size="4xl">
    <h3>{{ $t('MSG_TXT_DDLV_BASE_INF') }}</h3>
    <kw-form ref="frmMainRef">
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_MGT_YNM')">
          <kw-date-picker
            v-model="basData.mngtYm"
            :label="$t('MSG_TXT_MGT_YNM')"
            type="month"
            rules="required"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ITM_NM')">
          <kw-field-wrap>
            <kw-input
              v-model="basData.itmKnm"
              icon="search"
              rules="required"
              clearable
              class="mr10"
              :label="$t('MSG_TXT_ITM_NM')"
              @click-icon="onClickItemSearch"
            />
            <kw-input
              v-model="basData.csmbPdCd"
              rules="required"
              :label="$t('MSG_TXT_ITM_NM')"
              disable
            />
          </kw-field-wrap>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_STOC_UNIT_EA')">
          <kw-select
            v-model="basData.mngtUnitCd"
            :options="codes.MNGT_UNIT_CD"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_BOX_UNIT_QTY')">
          <kw-input
            v-model="basData.boxUnitQty"
            type="number"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ITM_DV')">
          <kw-select
            v-model="basData.goDvCd"
            :options="codes.GO_DV_CD"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_UPRC_WON')">
          <kw-input
            v-model="basData.goUprc"
            type="number"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_MEMO')"
          :colspan="3"
        >
          <kw-input
            v-model="basData.rmkCn"
            type="textarea"
            :rows="3"
          />
        </kw-form-item>
      </kw-form-row>
      <h3>{{ $t('MSG_TXT_NWCMR') }}</h3>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ORT_YN')">
          <kw-select
            v-model="ddlvOjCd1Data.bfsvcCsmbDdlvOrtYn"
            :label="$t('MSG_TXT_ORT_YN')"
            :options="codes.COD_YN"
            rules="required"
            @update:model-value="onChangeOrtYn(1)"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DDLV_TP')">
          <kw-field-wrap>
            <kw-select
              v-model="ddlvOjCd1Data.bfsvcCsmbDdlvTpCd"
              :label="$t('MSG_TXT_DDLV_TP')"
              :options="codes.BFSVC_CSMB_DDLV_TP_CD"
              :disable="isDisableYn1"
              :rules="isRequiredDdlvTp1"
              class="mr8 w167"
            />
            <kw-select
              v-model="ddlvOjCd1Data.bfsvcCsmbDdlvCmptBaseCd"
              :label="$t('MSG_TXT_DDLV_TP')"
              :options="codes.BFSVC_CSMB_DDLV_CMPT_BASE_CD"
              :disable="isDisableYn1"
              :rules="isRequiredDdlvTp1"
              class="w167"
            />
          </kw-field-wrap>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DDLV_OJ_PD_GRP')">
          <kw-select
            v-model="ddlvOjCd1Data.bfsvcCsmbDdlvOjPdGrpCd"
            :label="$t('MSG_TXT_DDLV_OJ_PD_GRP')"
            :options="codes.PD_GRP_CD"
            :disable="isDisableYn1"
            :rules="isRequiredAccPrpnYn1"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DDLV_OJ_ACC_TP')">
          <kw-select
            v-model="ddlvOjCd1Data.bfsvcCsmbDdlvOjAccTpCd"
            :label="$t('MSG_TXT_DDLV_OJ_ACC_TP')"
            :options="codes.BFSVC_CSMB_DDLV_OJ_ACC_TP_CD"
            :disable="isDisableYn1"
            :rules="isRequiredAccPrpnYn1"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DDLV_UNIT_ACC_N')">
          <kw-input
            v-model="ddlvOjCd1Data.bfsvcCsmbDdlvUnitAccN"
            :label="$t('MSG_TXT_DDLV_UNIT_ACC_N')"
            type="number"
            :disable="isDisableYn1"
            :rules="isRequiredAccPrpnYn1"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DDLV_UNIT_QTY_EA')">
          <kw-input
            v-model="ddlvOjCd1Data.bfsvcCsmbDdlvUnitQty"
            :label="$t('MSG_TXT_DDLV_UNIT_QTY_EA')"
            type="number"
            :disable="isDisableYn1"
            :rules="isRequiredUnitQty1 || isRequiredAccPrpnYn1"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_APLC_LM_QTY')">
          <kw-input
            v-model="ddlvOjCd1Data.bfsvcCsmbAplcLmQty"
            :label="$t('MSG_TXT_APLC_LM_QTY')"
            type="number"
            :disable="isDisableYn1"
            :rules="isRequiredLmQty1"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SORT_ORDER')">
          <kw-input
            v-model="ddlvOjCd1Data.sortOdr"
            type="number"
            :disable="isDisableYn1"
          />
        </kw-form-item>
      </kw-form-row>
      <h3>{{ $t('MSG_TXT_INDV') }}</h3>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ORT_YN')">
          <kw-select
            v-model="ddlvOjCd2Data.bfsvcCsmbDdlvOrtYn"
            :label="$t('MSG_TXT_ORT_YN')"
            :options="codes.COD_YN"
            rules="required"
            @update:model-value="onChangeOrtYn(2)"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DDLV_TP')">
          <kw-field-wrap>
            <kw-select
              v-model="ddlvOjCd2Data.bfsvcCsmbDdlvTpCd"
              :label="$t('MSG_TXT_DDLV_TP')"
              :options="codes.BFSVC_CSMB_DDLV_TP_CD"
              :disable="isDisableYn2"
              :rules="isRequiredDdlvTp2"
              class="mr8 w167"
            />
            <kw-select
              v-model="ddlvOjCd2Data.bfsvcCsmbDdlvCmptBaseCd"
              :label="$t('MSG_TXT_DDLV_TP')"
              :options="codes.BFSVC_CSMB_DDLV_CMPT_BASE_CD"
              :disable="isDisableYn2"
              :rules="isRequiredDdlvTp2"
              class="w167"
            />
          </kw-field-wrap>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DDLV_OJ_PD_GRP')">
          <kw-select
            v-model="ddlvOjCd2Data.bfsvcCsmbDdlvOjPdGrpCd"
            :label="$t('MSG_TXT_DDLV_OJ_PD_GRP')"
            :options="codes.PD_GRP_CD"
            :disable="isDisableYn2"
            :rules="isRequiredAccPrpnYn2"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DDLV_OJ_ACC_TP')">
          <kw-select
            v-model="ddlvOjCd2Data.bfsvcCsmbDdlvOjAccTpCd"
            :label="$t('MSG_TXT_DDLV_OJ_ACC_TP')"
            :options="codes.BFSVC_CSMB_DDLV_OJ_ACC_TP_CD"
            :disable="isDisableYn2"
            :rules="isRequiredAccPrpnYn2"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DDLV_UNIT_ACC_N')">
          <kw-input
            v-model="ddlvOjCd2Data.bfsvcCsmbDdlvUnitAccN"
            :label="$t('MSG_TXT_DDLV_UNIT_ACC_N')"
            type="number"
            :disable="isDisableYn2"
            :rules="isRequiredAccPrpnYn2"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DDLV_UNIT_QTY_EA')">
          <kw-input
            v-model="ddlvOjCd2Data.bfsvcCsmbDdlvUnitQty"
            :label="$t('MSG_TXT_DDLV_UNIT_QTY_EA')"
            type="number"
            :disable="isDisableYn2"
            :rules="isRequiredUnitQty2 || isRequiredAccPrpnYn2"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_APLC_LM_QTY')">
          <kw-input
            v-model="ddlvOjCd2Data.bfsvcCsmbAplcLmQty"
            :label="$t('MSG_TXT_APLC_LM_QTY')"
            type="number"
            :disable="isDisableYn2"
            :rules="isRequiredLmQty2"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SORT_ORDER')">
          <kw-input
            v-model="ddlvOjCd2Data.sortOdr"
            :label="$t('MSG_TXT_SORT_ORDER')"
            type="number"
            :disable="isDisableYn2"
          />
        </kw-form-item>
      </kw-form-row>
      <h3>{{ $t('MSG_TXT_BUILDING') }}</h3>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ORT_YN')">
          <kw-select
            v-model="ddlvOjCd3Data.bfsvcCsmbDdlvOrtYn"
            :label="$t('MSG_TXT_ORT_YN')"
            :options="codes.COD_YN"
            rules="required"
            @update:model-value="onChangeOrtYn(3)"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DDLV_TP')">
          <kw-field-wrap>
            <kw-select
              v-model="ddlvOjCd3Data.bfsvcCsmbDdlvTpCd"
              :label="$t('MSG_TXT_DDLV_TP')"
              :options="codes.BFSVC_CSMB_DDLV_TP_CD"
              :disable="isDisableYn3"
              :rules="isRequiredDdlvTp3"
              class="mr8 w167"
            />
            <kw-select
              v-model="ddlvOjCd3Data.bfsvcCsmbDdlvCmptBaseCd"
              :label="$t('MSG_TXT_DDLV_TP')"
              :options="codes.BFSVC_CSMB_DDLV_CMPT_BASE_CD"
              :disable="isDisableYn3"
              :rules="isRequiredDdlvTp3"
              class="w167"
            />
          </kw-field-wrap>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DDLV_OJ_PD_GRP')">
          <kw-select
            v-model="ddlvOjCd3Data.bfsvcCsmbDdlvOjPdGrpCd"
            :label="$t('MSG_TXT_DDLV_OJ_PD_GRP')"
            :options="codes.PD_GRP_CD"
            :disable="isDisableYn3"
            :rules="isRequiredAccPrpnYn3"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DDLV_OJ_ACC_TP')">
          <kw-select
            v-model="ddlvOjCd3Data.bfsvcCsmbDdlvOjAccTpCd"
            :label="$t('MSG_TXT_DDLV_OJ_ACC_TP')"
            :options="codes.BFSVC_CSMB_DDLV_OJ_ACC_TP_CD"
            :disable="isDisableYn3"
            :rules="isRequiredAccPrpnYn3"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DDLV_UNIT_ACC_N')">
          <kw-input
            v-model="ddlvOjCd3Data.bfsvcCsmbDdlvUnitAccN"
            :label="$t('MSG_TXT_DDLV_UNIT_ACC_N')"
            type="number"
            :disable="isDisableYn3"
            :rules="isRequiredAccPrpnYn3"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_DDLV_UNIT_QTY_EA')">
          <kw-input
            v-model="ddlvOjCd3Data.bfsvcCsmbDdlvUnitQty"
            :label="$t('MSG_TXT_DDLV_UNIT_QTY_EA')"
            type="number"
            :disable="isDisableYn3"
            :rules="isRequiredUnitQty3 || isRequiredAccPrpnYn3"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_APLC_LM_QTY')">
          <kw-input
            v-model="ddlvOjCd3Data.bfsvcCsmbAplcLmQty"
            :label="$t('MSG_TXT_APLC_LM_QTY')"
            type="number"
            :disable="isDisableYn3"
            :rules="isRequiredLmQty3"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_SORT_ORDER')">
          <kw-input
            v-model="ddlvOjCd3Data.sortOdr"
            type="number"
            :disable="isDisableYn3"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickCancel"
      />
      <kw-btn
        primary
        :label="$t('MSG_BTN_RGST')"
        @click="onClickRgst"
      />
    </template>
  </kw-popup>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, validate, useDataService, useGlobal, notify, useModal } from 'kw-lib';
import dayjs from 'dayjs';

const dataService = useDataService();
const { modal } = useGlobal();
const { t } = useI18n();
const { cancel: onClickCancel, ok } = useModal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const frmMainRef = ref(getComponentType('KwObserver'));
const codes = await codeUtil.getMultiCodes(
  'MNGT_UNIT_CD',
  'GO_DV_CD',
  'BFSVC_CSMB_DDLV_TP_CD',
  'BFSVC_CSMB_DDLV_CMPT_BASE_CD',
  'BFSVC_CSMB_DDLV_OJ_ACC_TP_CD',
  'PD_GRP_CD',
  'COD_YN',
);

const basData = ref({
  mngtYm: dayjs().format('YYYYMM'),
  itmKnm: '',
  csmbPdCd: '',
  mngtUnitCd: '',
  goDvCd: '',
  boxUnitQty: '',
  goUprc: '',
  rmkCn: '',
});

const ddlvOjCd1Data = ref({
  mngtYm: basData.value.mngtYm === '' ? '' : basData.value.mngtYm,
  csmbPdCd: basData.value.csmbPdCd === '' ? '' : basData.value.csmbPdCd,
  bfsvcCsmbDdlvOjCd: '1',
  bfsvcCsmbDdlvOrtYn: '',
  bfsvcCsmbDdlvTpCd: '',
  bfsvcCsmbDdlvCmptBaseCd: '',
  bfsvcCsmbDdlvOjPdGrpCd: '',
  bfsvcCsmbDdlvOjAccTpCd: '',
  bfsvcCsmbDdlvUnitAccN: '',
  bfsvcCsmbDdlvUnitQty: '',
  bfsvcCsmbAplcLmQty: '',
  sortOdr: '',
});

const ddlvOjCd2Data = ref({
  mngtYm: basData.value.mngtYm === '' ? '' : basData.value.mngtYm,
  csmbPdCd: basData.value.csmbPdCd === '' ? '' : basData.value.csmbPdCd,
  bfsvcCsmbDdlvOjCd: '2',
  bfsvcCsmbDdlvOrtYn: '',
  bfsvcCsmbDdlvTpCd: '',
  bfsvcCsmbDdlvCmptBaseCd: '',
  bfsvcCsmbDdlvOjPdGrpCd: '',
  bfsvcCsmbDdlvOjAccTpCd: '',
  bfsvcCsmbDdlvUnitAccN: '',
  bfsvcCsmbDdlvUnitQty: '',
  bfsvcCsmbAplcLmQty: '',
  sortOdr: '',
});

const ddlvOjCd3Data = ref({
  mngtYm: basData.value.mngtYm === '' ? '' : basData.value.mngtYm,
  csmbPdCd: basData.value.csmbPdCd === '' ? '' : basData.value.csmbPdCd,
  bfsvcCsmbDdlvOjCd: '3',
  bfsvcCsmbDdlvOrtYn: '',
  bfsvcCsmbDdlvTpCd: '',
  bfsvcCsmbDdlvCmptBaseCd: '',
  bfsvcCsmbDdlvOjPdGrpCd: '',
  bfsvcCsmbDdlvOjAccTpCd: '',
  bfsvcCsmbDdlvUnitAccN: '',
  bfsvcCsmbDdlvUnitQty: '',
  bfsvcCsmbAplcLmQty: '',
  sortOdr: '',
});

const isDisableYn1 = computed(() => ddlvOjCd1Data.value.bfsvcCsmbDdlvOrtYn === 'N');
const isDisableYn2 = computed(() => ddlvOjCd2Data.value.bfsvcCsmbDdlvOrtYn === 'N');
const isDisableYn3 = computed(() => ddlvOjCd3Data.value.bfsvcCsmbDdlvOrtYn === 'N');

function onChangeOrtYn(val) {
  switch (val) {
    case 1:
      if (ddlvOjCd1Data.value.bfsvcCsmbDdlvOrtYn === 'N') {
        ddlvOjCd1Data.value.bfsvcCsmbAplcLmQty = '';
        ddlvOjCd1Data.value.bfsvcCsmbDdlvCmptBaseCd = '';
        ddlvOjCd1Data.value.bfsvcCsmbDdlvOjAccTpCd = '';
        ddlvOjCd1Data.value.bfsvcCsmbDdlvOjPdGrpCd = '';
        ddlvOjCd1Data.value.bfsvcCsmbDdlvTpCd = '';
        ddlvOjCd1Data.value.bfsvcCsmbDdlvUnitAccN = '';
        ddlvOjCd1Data.value.bfsvcCsmbDdlvUnitQty = '';
        ddlvOjCd1Data.value.sortOdr = '';
      }
      break;

    case 2:
      if (ddlvOjCd2Data.value.bfsvcCsmbDdlvOrtYn === 'N') {
        ddlvOjCd2Data.value.bfsvcCsmbAplcLmQty = '';
        ddlvOjCd2Data.value.bfsvcCsmbDdlvCmptBaseCd = '';
        ddlvOjCd2Data.value.bfsvcCsmbDdlvOjAccTpCd = '';
        ddlvOjCd2Data.value.bfsvcCsmbDdlvOjPdGrpCd = '';
        ddlvOjCd2Data.value.bfsvcCsmbDdlvTpCd = '';
        ddlvOjCd2Data.value.bfsvcCsmbDdlvUnitAccN = '';
        ddlvOjCd2Data.value.bfsvcCsmbDdlvUnitQty = '';
        ddlvOjCd2Data.value.sortOdr = '';
      }
      break;

    case 3:
      if (ddlvOjCd3Data.value.bfsvcCsmbDdlvOrtYn === 'N') {
        ddlvOjCd3Data.value.bfsvcCsmbAplcLmQty = '';
        ddlvOjCd3Data.value.bfsvcCsmbDdlvCmptBaseCd = '';
        ddlvOjCd3Data.value.bfsvcCsmbDdlvOjAccTpCd = '';
        ddlvOjCd3Data.value.bfsvcCsmbDdlvOjPdGrpCd = '';
        ddlvOjCd3Data.value.bfsvcCsmbDdlvTpCd = '';
        ddlvOjCd3Data.value.bfsvcCsmbDdlvUnitAccN = '';
        ddlvOjCd3Data.value.bfsvcCsmbDdlvUnitQty = '';
        ddlvOjCd3Data.value.sortOdr = '';
      }
      break;
  }
}

const isRequiredDdlvTp1 = async (val, options) => {
  const errors = [];

  if (ddlvOjCd1Data.value.bfsvcCsmbDdlvOrtYn === 'Y') {
    errors.push(
      ...(await validate(val, 'required', options)).errors,
    );
  }

  return errors[0] || true;
};

const isRequiredUnitQty1 = async (val, options) => {
  const errors = [];

  if (ddlvOjCd1Data.value.bfsvcCsmbDdlvTpCd === '1') {
    errors.push(
      ...(await validate(val, 'required', options)).errors,
    );
  }

  return errors[0] || true;
};

const isRequiredLmQty1 = async (val, options) => {
  const errors = [];

  if (ddlvOjCd1Data.value.bfsvcCsmbDdlvTpCd === '2') {
    errors.push(
      ...(await validate(val, 'required', options)).errors,
    );
  }

  return errors[0] || true;
};

const isRequiredAccPrpnYn1 = async (val, options) => {
  const errors = [];

  if (ddlvOjCd1Data.value.bfsvcCsmbDdlvCmptBaseCd === '1') {
    errors.push(
      ...(await validate(val, 'required', options)).errors,
    );
  }

  return errors[0] || true;
};

const isRequiredDdlvTp2 = async (val, options) => {
  const errors = [];

  if (ddlvOjCd2Data.value.bfsvcCsmbDdlvOrtYn === 'Y') {
    errors.push(
      ...(await validate(val, 'required', options)).errors,
    );
  }

  return errors[0] || true;
};

const isRequiredUnitQty2 = async (val, options) => {
  const errors = [];

  if (ddlvOjCd2Data.value.bfsvcCsmbDdlvTpCd === '1') {
    errors.push(
      ...(await validate(val, 'required', options)).errors,
    );
  }

  return errors[0] || true;
};

const isRequiredLmQty2 = async (val, options) => {
  const errors = [];

  if (ddlvOjCd2Data.value.bfsvcCsmbDdlvTpCd === '2') {
    errors.push(
      ...(await validate(val, 'required', options)).errors,
    );
  }

  return errors[0] || true;
};

const isRequiredAccPrpnYn2 = async (val, options) => {
  const errors = [];

  if (ddlvOjCd2Data.value.bfsvcCsmbDdlvCmptBaseCd === '1') {
    errors.push(
      ...(await validate(val, 'required', options)).errors,
    );
  }

  return errors[0] || true;
};

const isRequiredDdlvTp3 = async (val, options) => {
  const errors = [];

  if (ddlvOjCd3Data.value.bfsvcCsmbDdlvOrtYn === 'Y') {
    errors.push(
      ...(await validate(val, 'required', options)).errors,
    );
  }

  return errors[0] || true;
};

const isRequiredUnitQty3 = async (val, options) => {
  const errors = [];

  if (ddlvOjCd3Data.value.bfsvcCsmbDdlvTpCd === '1') {
    errors.push(
      ...(await validate(val, 'required', options)).errors,
    );
  }

  return errors[0] || true;
};

const isRequiredLmQty3 = async (val, options) => {
  const errors = [];

  if (ddlvOjCd3Data.value.bfsvcCsmbDdlvTpCd === '2') {
    errors.push(
      ...(await validate(val, 'required', options)).errors,
    );
  }

  return errors[0] || true;
};

const isRequiredAccPrpnYn3 = async (val, options) => {
  const errors = [];

  if (ddlvOjCd3Data.value.bfsvcCsmbDdlvCmptBaseCd === '1') {
    errors.push(
      ...(await validate(val, 'required', options)).errors,
    );
  }

  return errors[0] || true;
};

async function onClickItemSearch() {
  const chk = '1';

  const { result, payload } = await modal({
    component: 'WwsnaItemBaseInformationListP',
    componentProps: { chk },
  });

  if (result) {
    basData.value.itmKnm = payload[0].itmNm;
    basData.value.csmbPdCd = payload[0].itmPdCd;
    ddlvOjCd1Data.value.csmbPdCd = payload[0].itmPdCd;
    ddlvOjCd2Data.value.csmbPdCd = payload[0].itmPdCd;
    ddlvOjCd3Data.value.csmbPdCd = payload[0].itmPdCd;
  }
}

async function onClickRgst() {
  if (!await frmMainRef.value.validate()) { return; }
  // if (await frmMainRef.value.alertIfIsNotModified()) { return; }

  const dataParams = [];

  dataParams.push(basData.value);
  dataParams.push(ddlvOjCd1Data.value);
  dataParams.push(ddlvOjCd2Data.value);
  dataParams.push(ddlvOjCd3Data.value);

  await dataService.post('/sms/wells/service/delivery-bases', dataParams);

  ok();
  notify(t('MSG_ALT_SAVE_DATA'));
}

</script>
