<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SND
 2. 프로그램 ID : WwsndBusinessVehiclesRegP - 업무차량 지급등록 팝업
 3. 작성자 : seungsoo.kim
 4. 작성일 : 2023.01.25
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 업무차량 신규 지급 및 차량정보 수정 팝업
 ****************************************************************************************************
--->
<template>
  <kw-popup
    size="3xl"
    :title="$t('MSG_TIT_VHC_DSB_RGST')"
  >
    <h3>{{ $t('MSG_TXT_PSIC_INF') }}</h3>
    <kw-form
      ref="frmMainRef"
      :cols="2"
    >
      <kw-form-row>
        <!-- 서비스센터 -->
        <kw-form-item
          :label="$t('MSG_TXT_SV_CNR')"
          rules="required"
        >
          <kw-select
            v-model="dataParams.ogCd"
            :options="centers"
            option-label="ogNm"
            option-value="ogCd"
            :disable="isModify"
          />
          <kw-select
            v-model="dataParams.vhcMngtPrtnrNo"
            :label="$t('MSG_TXT_EGER')"
            :options="engineers"
            :disable="isModify"
            rules="required"
            @update:model-value="onChangeEngineer"
          />
        </kw-form-item>
        <!-- 근무기간 -->
        <kw-form-item :label="$t('MSG_TXT_WRK_PTRM')">
          <kw-input
            v-model="dataParams.entcoDt"
            type="text"
            mask="####-##-##"
            disable=""
          />
          <span>~</span>
          <kw-input
            v-model="dataParams.rsgnDt"
            type="text"
            mask="####-##-##"
            disable=""
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <h3>{{ $t('MSG_TXT_VHC_RGST_INF') }}</h3>
    <kw-form :cols="2">
      <kw-form-row>
        <kw-field-wrap
          :rules="validateDsbDate"
        >
          <!-- 지급시작일 -->
          <kw-form-item
            :label="$t('MSG_TXT_DSB_STRT_D')"
            rules="required"
          >
            <kw-date-picker
              v-model="dataParams.vhcPymdt"
              :label="$t('MSG_TXT_DSB_STRT_D')"
              :disable="isModify && isBeforeVhcPymdt"
              rules="required"
            />
          </kw-form-item>
          <!-- 지급종료일 -->
          <kw-form-item
            :label="$t('MSG_TXT_DSB_END_D')"
            rules="required"
          >
            <kw-date-picker
              v-model="dataParams.dsbEnddt"
              :label="$t('MSG_TXT_DSB_END_D')"
              :disable="isModify && isBeforeDsbEnddt"
              rules="required"
            />
          </kw-form-item>
        </kw-field-wrap>
      </kw-form-row>
      <kw-form-row>
        <!-- 차량번호 -->
        <kw-form-item
          :label="$t('MSG_TXT_CARNO')"
          rules="required"
        >
          <kw-select
            v-model="dataParams.carno"
            :label="$t('MSG_TXT_CARNO')"
            :options="vehicleInfos"
            :disable="isModify"
            rules="required"
            @update:model-value="onChangeVehicle"
          />
        </kw-form-item>
        <!-- 차량종류 -->
        <kw-form-item
          :label="$t('MSG_TXT_VHC_KND')"
          :colspan="1"
        >
          <kw-input
            v-model="dataParams.carNm"
            disable=""
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 가입유형 -->
        <kw-form-item
          :label="$t('MSG_TXT_J_TP')"
          :colspan="1"
        >
          <kw-select
            v-model="dataParams.vhcMngtTpCd"
            :options="codes.VHC_MNGT_TP_CD"
            disable=""
          />
        </kw-form-item>
        <!-- 보험연령 -->
        <kw-form-item
          :label="$t('MSG_TXT_INSR_AGE')"
          :colspan="1"
        >
          <kw-select
            v-model="dataParams.insrAgeCd"
            :options="codes.INSR_AGE_CD"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <h3>{{ $t('MSG_TXT_DSB_CARD_INF') }}</h3>
    <kw-form :cols="2">
      <kw-form-row>
        <!-- 주유카드 -->
        <kw-form-item
          :label="$t('MSG_TXT_RFLNG_CARD')"
          :colspan="1"
        >
          <kw-input
            v-model="dataParams.rflngCdnoEncr"
            type="text"
            mask="####-####-####-####"
            disable=""
          />
        </kw-form-item>
        <!-- 하이패스 -->
        <kw-form-item
          :label="$t('MSG_TXT_HIPS')"
          :colspan="1"
        >
          <kw-input
            v-model="dataParams.hipsCdnoEncr"
            type="text"
            mask="####-####-####-####"
            disable=""
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <h3>{{ $t('MSG_TXT_ETC_INF') }}</h3>
    <kw-form :cols="1">
      <kw-form-row>
        <!-- 비고 -->
        <kw-form-item :label="$t('MSG_TXT_NOTE')">
          <kw-input
            v-model="dataParams.vhcDsbRmkCn"
            type="textarea"
            :rows="3"
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
        :label="$t('MSG_BTN_SAVE')"
        @click="onClickSaveBtn"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { codeUtil, notify, useDataService, useModal, getComponentType } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import useSnCode from '~sms-wells/service/composables/useSnCode';
import dayjs from 'dayjs';

const dataService = useDataService();
const { getServiceCenterOrgs, getAllEngineers } = useSnCode();
const { t } = useI18n();
const { cancel: onClickCancel, ok } = useModal();

// TODO: 개발 테스트용 파라미터
/* const props = defineProps({
  ogCd: { type: String, default: 'V910130' },
  vhcMngtNo: { type: String, default: '20160000000157' },
  vhcMngtSn: { type: String, default: '3' },
  vhcMngtPrtnrNo: { type: String, default: '28454' },
}); */

const props = defineProps({
  ogCd: { type: String, default: '' },
  vhcMngtNo: { type: String, default: '' },
  vhcMngtSn: { type: String, default: '' },
  prtnrNo: { type: String, default: '' },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const frmMainRef = ref(getComponentType('KwObserver'));
const svcCenters = (await getServiceCenterOrgs());
const engs = (await getAllEngineers('G_ONLY_ENG')).G_ONLY_ENG;
const codes = await codeUtil.getMultiCodes(
  'INSR_AGE_CD',
  'VHC_MNGT_TP_CD',
);

const isModify = computed(() => !(isEmpty(props.ogCd) || isEmpty(props.vhcMngtNo)
  || isEmpty(props.vhcMngtSn) || isEmpty(props.vhcMngtPrtnrNo)));

const centers = ref();
const engineers = ref();
const vehicleInfos = ref();

const dataParams = ref({
  ogCd: props.ogCd === '' ? undefined : props.ogCd,
  vhcMngtNo: props.vhcMngtNo === '' ? undefined : props.vhcMngtNo,
  vhcMngtSn: props.vhcMngtSn === '' ? undefined : props.vhcMngtSn,
  vhcMngtPrtnrNo: props.prtnrNo === '' ? undefined : props.prtnrNo,
  carno: '',
  entcoDt: '',
  rsgnDt: '',
  vhcPymdt: '',
  dsbEnddt: '',
  vhcMngtTpCd: '',
  insrAgeCd: '',
  rflngCdnoEncr: '',
  hipsCdnoEncr: '',
  vhcDsbRmkCn: '',
  carNm: '',
});

async function fetchAllVehicles() {
  return await dataService.get('/sms/wells/service/business-vehicles/all-vehicles');
}

async function getAllVehicles() {
  const res = await fetchAllVehicles();
  return res.data;
}

const vhcs = (await getAllVehicles());

async function onChangeEngineer() {
  const engineerByPrtnrNo = engs.filter((v) => v.codeId === dataParams.value.vhcMngtPrtnrNo);

  engineerByPrtnrNo.forEach((e) => {
    dataParams.value.entcoDt = e.entcoDt;
    dataParams.value.rsgnDt = e.rsgnDt;
  });
}

async function onChangeVehicle() {
  const vehicleBycarno = vhcs.filter((v) => v.carno === dataParams.value.carno);

  vehicleBycarno.forEach((e) => {
    dataParams.value.vhcMngtNo = e.carseq;
    dataParams.value.carNm = e.carnm;
    dataParams.value.vhcMngtTpCd = e.owstat;
    dataParams.value.rflngCdnoEncr = e.cardno1;
    dataParams.value.hipsCdnoEncr = e.cardno2;
  });
}

async function fetchBusinessVehicle(vhcMngtNo, vhcMngtSn) {
  return await dataService.get(`/sms/wells/service/business-vehicles/${vhcMngtNo}-${vhcMngtSn}`);
}

async function getBusinessVehicle() {
  const res = await fetchBusinessVehicle(props.vhcMngtNo, props.vhcMngtSn);
  dataParams.value = res.data;
}

if (isModify.value) { // 수정
  const centerByOgcd = svcCenters.filter((v) => v.ogCd === props.ogCd);
  const engineerByPrtnrNo = engs.filter((v) => v.codeId === props.vhcMngtNo);
  const vehicleByCarno = vhcs.filter((v) => v.carseq === props.vhcMngtNo);

  centers.value = centerByOgcd.map((v) => ({ ogNm: v.ogNm, ogCd: v.ogCd }));
  engineers.value = engineerByPrtnrNo.map((v) => ({ codeId: v.codeId, codeName: v.codeNm }));
  vehicleInfos.value = vehicleByCarno.map((v) => ({ codeId: v.carno, codeName: v.carno }));

  await onChangeEngineer();
  await getBusinessVehicle();
} else { // 신규
  // TODO: 1. 권한 조회 후 서비스센터/지점 조회 or 특정 센터/지점 조회
  // TODO: 2. 엔지니어는 센터/지점 선택 시 해당 조직에 해당하는 엔지니어만 조회
  centers.value = svcCenters.map((v) => ({ ogNm: v.ogNm, ogCd: v.ogCd }));
  engineers.value = engs.map((v) => ({ codeId: v.codeId, codeName: v.codeNm }));
  vehicleInfos.value = vhcs.map((v) => ({ codeId: v.carno, codeName: v.carno }));

  dataParams.value.vhcPymdt = dayjs().format('YYYYMMDD');
  dataParams.value.dsbEnddt = '99991231';
}

const isBeforeVhcPymdt = computed(() => Number(dataParams.value.vhcPymdt) < Number(dayjs().format('YYYYMMDD')));
const isBeforeDsbEnddt = computed(() => Number(dataParams.value.dsbEnddt) < Number(dayjs().format('YYYYMMDD')));

/* async function validateDsbDate() {
  if (Number(dataParams.value.vhcPymdt) >= Number(dataParams.value.dsbEnddt)) {
    await alert(t('MSG_TXT_END_GRTR_START_DTM'));
    return true;
  }

  return false;
} */

const validateDsbDate = async () => {
  const errors = [];

  if (Number(dataParams.value.vhcPymdt) >= Number(dataParams.value.dsbEnddt)) {
    errors.push(t('MSG_TXT_END_GRTR_START_DTM'));
  }

  return errors[0] || true;
};

async function onClickSaveBtn() {
  if (!await frmMainRef.value.validate()) { return; }
  if (await frmMainRef.value.alertIfIsNotModified()) { return; }
  if (await validateDsbDate()) { return; }

  // TODO: 엔지니어 테이블 작업 완료 후 WsndVehiclesDsbRgstService.java 주석 해제
  if (isModify.value) {
    await dataService.put('/sms/wells/service/business-vehicles', dataParams.value);
  } else {
    await dataService.post('/sms/wells/service/business-vehicles', dataParams.value);
  }

  notify(t('MSG_ALT_SAVE_DATA'));
  ok();
}
</script>
