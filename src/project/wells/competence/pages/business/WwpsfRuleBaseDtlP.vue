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
            :disable="frmMainData.psbYn === 'N'"
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
            :disable="frmMainData.psbYn === 'N'"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row v-if="islvl3">
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
            :disable="frmMainData.psbYn === 'N'"
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
            :first-option="all"
            :options="codes.OG_TP_CD.filter((v) => ['W01', 'W02'].includes(v.codeId))"
            :disable="frmMainData.psbYn === 'N'"
            multiple
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
            option-value="codeId"
            option-label="rsbDvNm"
            :options="rsbDvCd"
            :disable="frmMainData.psbYn === 'N'"
            multiple
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row
        v-if="isRsbDvCds"
      >
        <kw-form-item
          :label="t('MSG_TXT_CST_CNR_INQR_PRMIT_YN')"
          required
        >
          <kw-select
            v-model="frmMainData.cstCnrInqrPrmitYn"
            :label="$t('MSG_TXT_CST_CNR_INQR_PRMIT_YN')"
            rules="required"
            :first-option="sel"
            :options="codes.COD_YN"
            :disable="frmMainData.psbYn === 'N'"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row v-if="islvl3">
        <kw-form-item
          :label="$t('MSG_TXT_RFM_CH_CN')"
          required
          colspan="2"
        >
          <kw-input
            v-model="frmMainData.bznsSpptMnalChCn"
            rules="required"
            :label="$t('MSG_TXT_RFM_CH_CN')"
            :disable="frmMainData.psbYn === 'N'"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row v-if="islvl3">
        <kw-form-item
          :label="$t('MSG_TXT_ATTH_FILE')"
          required
          colspan="2"
        >
          <zwcm-file-attacher
            ref="attachFileRef"
            v-model="attachFiles"
            attach-group-id="ATG_PSF_RUL_BASE"
            :attach-document-id="frmMainData.apnFileDocId"
            :disable="frmMainData.psbYn === 'N'"
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
        :disable="frmMainData.psbYn === 'N'"
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
import { isEmpty } from 'lodash-es';
import ZwcmFileAttacher from '~common/components/ZwcmFileAttacher.vue';

const { notify } = useGlobal();
const { cancel: onClickCancel, ok } = useModal();
const { t } = useI18n();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const frmMainRef = ref(getComponentType('KwForm'));
const attachFiles = ref([]);
const isRsbDvCds = ref(false);
const islvl3 = ref(false);
const rsbDvCd = ref([]);
const codes = await codeUtil.getMultiCodes(
  'COD_YN',
  'OG_TP_CD',
  'RSB_DV_CD',
  'BZNS_SPPT_MNAL_RGST_CD',
  'BZNS_SPPT_MNAL_RGH_CD',
  'BZNS_SPPT_MNAL_MPBL_DV_CD',
);

const props = defineProps({
  bznsSpptMnalId: {
    type: String,
    required: true,
  },
  vlStrtDtm: {
    type: String,
    required: true,
  },
});

const frmMainData = ref({
  ogTpCd: [],
  rsbDvCds: [],
  bznsSpptMnalId: props.bznsSpptMnalId,
  bznsSpptMnalNm: '',
  hgrBznsSpptMnalId: '',
  bznsSpptMnalRgstCd: '',
  bznsSpptMnalMpblDvCd: '',
  bznsSpptMnalChCn: '',
  mnalRghRelId: '',
  vlStrtDtm: props.vlStrtDtm,
  vlEndDtm: '',
  attachFiles: [],
  apnFileDocId: '',
  inqrLvTcnt: '',
  expsrOdr: '',
  cstCnrInqrPrmitYn: '',
});

const onClickSave = async () => {
  if (await frmMainRef.value.alertIfIsNotModified()) { return; }
  if (!await frmMainRef.value.validate()) { return; }
  frmMainData.value.attachFiles = attachFiles.value;
  await dataService.post('/sms/wells/competence/rulebase', frmMainData.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  ok(frmMainRef.value);
};

const initDetail = async () => {
  const res = await dataService.get('/sms/wells/competence/rulebase/detail', { params: { ...frmMainData.value } });
  if (!isEmpty(res.data)) {
    frmMainData.value = res.data;
    if (!isEmpty(res.data.ogTpCd)) {
      frmMainData.value.ogTpCd = res.data.ogTpCd.split(',');
    }
    if (!isEmpty(res.data.rsbDvCds)) {
      frmMainData.value.rsbDvCds = res.data.rsbDvCds.split(',');
    }
    await frmMainRef.value.init();
  }
};
watch(() => frmMainData.value.bznsSpptMnalMpblDvCd, async (val) => {
  if (val === '2') {
    isRsbDvCds.value = true;
  } else {
    isRsbDvCds.value = false;
    frmMainData.value.ogTpCd = [];
    frmMainData.value.rsbDvCds = [];
    frmMainData.value.cstCnrInqrPrmitYn = '';
  }
});

watch(() => frmMainData.value.inqrLvTcnt, async (val) => {
  if (val === 3) {
    islvl3.value = true;
  } else {
    islvl3.value = false;
  }
});

watch(() => [frmMainData.value.ogTpCd], async () => {
  const rsbDvCds = [];
  if (!isEmpty(frmMainData.value.ogTpCd)) {
    frmMainData.value.ogTpCd.forEach((obj) => {
      if (obj === 'W01') {
        codes.RSB_DV_CD.forEach((v) => {
          if (['W0101', 'W0102', 'W0103', 'W0104', 'W0105'].includes(v.codeId)) {
            v.rsbDvNm = `${v.codeName}(${codes.OG_TP_CD.filter((cd) => [obj].includes(cd.codeId))[0].codeName})`;
            rsbDvCds.push(v);
          }
        });
      }
      if (obj === 'W02') {
        codes.RSB_DV_CD.forEach((v) => {
          if (['W0201', 'W0202', 'W0203', 'W0204', 'W0205'].includes(v.codeId)) {
            v.rsbDvNm = `${v.codeName}(${codes.OG_TP_CD.filter((cd) => [obj].includes(cd.codeId))[0].codeName})`;
            rsbDvCds.push(v);
          }
        });
      }
    });
    rsbDvCd.value = rsbDvCds;
  }
  rsbDvCd.value = rsbDvCds;
});

onMounted(() => {
  if (!isEmpty(props.bznsSpptMnalId)) {
    initDetail();
  }
});
</script>
