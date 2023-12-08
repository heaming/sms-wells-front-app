<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfRuleBaseDtlP - 규정 및 기준관리 상세정보
3. 작성자 : jisung you
4. 작성일 : 2023.06.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-규정 및 기준관리 상세정보
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
  >
    <kw-form
      ref="frmMainRef"
      :cols="2"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TIT_CLASSIFICATION_NM')"
          required
        >
          <kw-input
            v-model="frmMainData.bznsSpptMnalNm"
            :label="$t('MSG_TIT_CLASSIFICATION_NM')"
            rules="required"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_RGST_DV')"
          required
        >
          <kw-select
            v-model="frmMainData.bznsSpptMnalRgstCd"
            :options="codes.BZNS_SPPT_MNAL_RGST_CD"
            rules="required"
            :label="$t('MSG_TXT_RGST_DV')"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row v-if="frmMainData.inqrLvTcnt === '3' ">
        <kw-form-item
          :label="$t('MSG_TXT_MPBL_RNG')"
          required
          colspan="2"
        >
          <kw-option-group
            v-model="frmMainData.bznsSpptMnalMpblDvCd"
            type="radio"
            :options="codes.BZNS_SPPT_MNAL_MPBL_DV_CD"
            :label="$t('MSG_TXT_MPBL_RNG')"
          />
          <!-- ['전체공개', '일부공개'] -->
        </kw-form-item>
      </kw-form-row>
      <kw-form-row
        v-if="isRsbDvCds"
      >
        <kw-form-item
          :label="t('MSG_TXT_OG_TP')"
          required
        >
          <kw-select
            v-model="frmMainData.ogTpCd"
            :label="t('MSG_TXT_OG_TP')"
            rules="required"
            :options="ogTpCd"
            first-option="select"
          />
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_RSB_DV')"
          required
        >
          <kw-select
            v-model="frmMainData.rsbDvCds"
            :label="$t('MSG_TXT_RSB_DV')"
            rules="required"
            :model-value="frmMainData.rsbDvCds"
            :options="rsbDvCd"
            multiple
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row v-if="frmMainData.inqrLvTcnt === '3' ">
        <kw-form-item
          :label="$t('MSG_TXT_RFM_CH_CN')"
          required
          colspan="2"
        >
          <kw-input
            v-model="frmMainData.bznsSpptMnalChCn"
            rules="required"
            :label="$t('MSG_TXT_RFM_CH_CN')"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row v-if="frmMainData.inqrLvTcnt === '3' ">
        <kw-form-item
          :label="$t('MSG_TXT_ATTH_FILE')"
          required
          colspan="2"
        >
          <zwcm-file-attacher
            ref="attachFileRef"
            v-model="frmMainData.attachFiles"
            attach-group-id="ATG_PSF_RUL_BASE"
            :attach-document-id="frmMainData.apnFileDocId"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template
      #action
    >
      <kw-btn
        :label="$t('MSG_BTN_CANCEL')"
        negative
        @click="onClickCancel"
      />
      <kw-btn
        v-permission:update
        :label="$t('MSG_BTN_SAVE')"
        primary
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, useModal, useDataService, useGlobal } from 'kw-lib';
import ZwcmFileAttacher from '~common/components/ZwcmFileAttacher.vue';

const { notify } = useGlobal();
const { cancel: onClickCancel, ok } = useModal();
const { t } = useI18n();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const frmMainRef = ref(getComponentType('KwForm'));
const ogTpCd = ref();
const rsbDvCdM = ref();
const rsbDvCdP = ref();
const codes = await codeUtil.getMultiCodes(
  'OG_TP_CD',
  'RSB_DV_CD',
  'BZNS_SPPT_MNAL_RGST_CD',
  'BZNS_SPPT_MNAL_RGH_CD',
  'BZNS_SPPT_MNAL_MPBL_DV_CD',
  'COD_YN',
);
ogTpCd.value = codes.OG_TP_CD.filter((v) => ['W01', 'W02', 'E01'].includes(v.codeId));

rsbDvCdP.value = codes.RSB_DV_CD.filter((v) => ['W0101', 'W0102', 'W0103', 'W0104', 'W0105'].includes(v.codeId));
rsbDvCdM.value = codes.RSB_DV_CD.filter((v) => ['W0201', 'W0202', 'W0203', 'W0204', 'W0205'].includes(v.codeId));

const props = defineProps({
  bznsSpptMnalId: {
    type: String,
    required: true,
  },
  bznsSpptMnalNm: {
    type: String,
    default: '',
  },
  vlStrtDtm: {
    type: String,
    default: '',
  },
  vlEndDtm: {
    type: String,
    default: '',
  },
  hgrBznsSpptMnalId: {
    type: String,
    required: true,
  },
  bznsSpptMnalRgstCd: {
    type: String,
    default: '01',
  },
  bznsSpptMnalMpblDvCd: {
    type: String,
    default: '1',
  },
  bznsSpptMnalChCn: {
    type: String,
    default: '',
  },
  mnalRghRelId: {
    type: String,
    default: '',
  },
  apnFileDocId: {
    type: String,
    default: '',
  },
  inqrLvTcnt: {
    type: String,
    default: '',
  },
  expsrOdr: {
    type: String,
    default: '',
  },

});

const frmMainData = ref({
  ogTpCd: '',
  rsbDvCds: [],
  bznsSpptMnalId: props.bznsSpptMnalId,
  bznsSpptMnalNm: props.bznsSpptMnalNm,
  hgrBznsSpptMnalId: props.hgrBznsSpptMnalId,
  bznsSpptMnalRgstCd: props.bznsSpptMnalRgstCd,
  bznsSpptMnalMpblDvCd: props.bznsSpptMnalMpblDvCd,
  bznsSpptMnalChCn: props.bznsSpptMnalChCn,
  mnalRghRelId: props.mnalRghRelId,
  vlStrtDtm: props.vlStrtDtm,
  vlEndDtm: props.vlEndDtm,
  attachFiles: [],
  apnFileDocId: props.apnFileDocId,
  inqrLvTcnt: props.inqrLvTcnt,
  expsrOdr: props.expsrOdr,
});

const isRsbDvCds = computed(() => frmMainData.value.bznsSpptMnalMpblDvCd === '2');

const rsbDvCd = computed(() => {
  if (frmMainData.value.ogTpCd === 'W01') {
    return rsbDvCdP.value;
  }
  if (frmMainData.value.ogTpCd === 'W02') {
    return rsbDvCdM.value;
  }
});

async function onClickSave() {
  if (await frmMainRef.value.alertIfIsNotModified()) { return; }
  if (!await frmMainRef.value.validate()) { return; }

  const response = await dataService.post('/sms/wells/competence/rulebase', frmMainData.value);
  if (response.data) {
    notify(t('MSG_ALT_SAVE_DATA'));
    ok(frmMainRef.value);
  }
}
</script>
