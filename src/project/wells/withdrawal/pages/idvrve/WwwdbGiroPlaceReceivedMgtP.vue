<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : idvrve
2. 프로그램 ID : WwwdbGiroPlaceReceivedMgtP - 지로 수신처 관리
3. 작성자 : heungjun.lee
4. 작성일 : 2023.02.03
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 지로 수신처 관리 조회 / 등록
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--xl"
    :title="t('MSG_TIT_GIRO_PLRCV_MNGT')"
  >
    <!-- title="지로 수신처 관리" -->
    <kw-observer ref="obsMainRef">
      <kw-form :cols="2">
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_CST_NM')"
            required
          >
            <!-- label="고객명 " -->
            <kw-input
              v-model="giroPlrcv.cstFnm"
              :label="t('MSG_TXT_CST_NM')"
              :disable="isDisableChk"
              maxlength="16"
              icon="search"
              :rules="validateCst"
              :custom-messages="{ required:$t('MSG_ALT_USE_DT_SRCH_AF') }"
              @click-icon="onClickSearchUser"
              @keydown="onKeyDownSelectUser"
              @clear="onClearSelectUser"
            />
          </kw-form-item>
          <kw-form-item
            :label="t('TXT_MSG_SELL_TP_CD')"
            required
          >
            <!-- label="판매유형 " -->
            <kw-select
              v-model="giroPlrcv.giroBizTpCd"
              :label="t('TXT_MSG_SELL_TP_CD')"
              :options="portalList"
              rules="required"
              :disable="isDisableChk"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_BIZ_ICHR')"
          >
            <!-- label="업무담당 " -->
            <kw-input
              v-model="giroPlrcv.fstRgstUsrId"
              :disable="true"
            />
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_DTM')"
          >
            <!-- label="일시 " -->
            <kw-date-picker
              v-model="giroPlrcv.giroPlrcvRgstDt"
              :label="t('MSG_TXT_DTM')"
              rules="required"
              class="w319"
            />
            <!-- :disable="true" -->
          </kw-form-item>
        </kw-form-row>
        <!-- <kw-form-row> -->
        <kw-form-item
          :label="t('MSG_TXT_ADDR')"
          required
        >
          <!-- label="주소" -->
          <zwcm-post-code
            ref="adrRef"
            v-model:add-idx="giroPlrcv.adrDvCd"
            v-model:zipCode="giroPlrcv.zip"
            v-model:add1="giroPlrcv.basAdr"
            v-model:add2="giroPlrcv.dtlAdr"
            v-model:addKey="giroPlrcv.giroPlrcvAdrId"
            readonly
            class="kw-grow"
            required
            :label="t('MSG_TXT_ADDR')"
          />
        </kw-form-item>
        <!-- </kw-form-row> -->
      </kw-form>
    </kw-observer>
    <template #action>
      <kw-btn
        primary
        :label="t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';
import { getComponentType, modal, useDataService, useModal, validate, notify } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwcmPostCode from '~common/components/ZwcmPostCode.vue';

const now = dayjs();

const dataService = useDataService();
const { getters } = useStore();
const userInfo = getters['meta/getUserInfo'];
const { t } = useI18n();

const props = defineProps({
  cntrNo: { type: String, default: null },
  cntrSn: { type: String, default: null },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const { userName } = userInfo;
const obsMainRef = ref(getComponentType('KwObserver'));
const { ok, cancel: onClickCancel } = useModal();

const portalList = ref([
  {
    codeId: '1',
    codeName: t('MSG_TXT_SNGL_PMNT'),
    // codeName: '일시불',
  },
  {
    codeId: '2',
    codeName: t('MSG_TXT_RENTAL'),
    // codeName: '렌탈',
  },
  {
    codeId: '3',
    codeName: t('MSG_TXT_MMBR'),
  },
  // codeName: '멤버쉽',
]);

const isDisableChk = ref(false);

const giroPlrcvProps = ref({
  cntrNo: '',
  cntrSn: '',
});

const giroPlrcv = ref({
  cntrNo: '',
  cntrSn: '',
  giroBizDvCd: '2', // 지로업무구분코드
  giroBizTpCd: '', // 지로업무유형코드 판매유형
  cstNo: '',
  cstFnm: '', // 고객명
  zip: '', // 우편번호
  adrDvCd: '', // 주소구분코드
  basAdr: '', // 기본주소
  dtlAdr: '', // 상세주소
  dtaDlYn: '', // 삭제여부
  fstRgstUsrId: userName, // 업무담당
  giroPlrcvRgstDt: now.format('YYYYMMDD'),
  giroPlrcvAdrId: '',
});

const validateCst = computed(() => async (val, options) => {
  const errors = [];

  if (giroPlrcv.value.state !== 'updated') {
    errors.push(
      ...(await validate(giroPlrcv.value.cstNo, 'required', options)).errors,
    );
  }

  return errors[0] || true;
});

// 고객명 찾기 이벤트
async function onClickSearchUser() {
  const { result, payload } = await modal({ component: 'ZwcsaCustomerListP' });

  if (result) {
    console.log(payload);
    giroPlrcv.value.cstFnm = payload.name;
    giroPlrcv.value.cstNo = payload.cstNo;
  }
}

let cachedParams;

async function fetchGiroInfo() {
  cachedParams = cloneDeep(giroPlrcvProps.value);

  console.log(cachedParams);

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/giro-placereceived', { params: cachedParams });

  console.log(res.data);

  if (!isEmpty(res.data)) {
    giroPlrcv.value = res.data;
    isDisableChk.value = true;
    giroPlrcv.value.state = 'updated';
  } else {
    isDisableChk.value = false;
    giroPlrcv.value.state = 'created';
  }
}

async function initProps() {
  if (props.cntrNo || props.cntrSn) {
    const { cntrNo, cntrSn } = props;

    giroPlrcvProps.value.cntrNo = cntrNo;
    giroPlrcvProps.value.cntrSn = cntrSn;
    giroPlrcv.value.cntrNo = cntrNo;
    giroPlrcv.value.cntrSn = cntrSn;

    const res = await dataService.get('/sms/wells/withdrawal/idvrve/giro-placereceived/duplication-check', { params: {
      cntrNo: giroPlrcvProps.value.cntrNo,
      cntrSn: giroPlrcvProps.value.cntrSn,
    } });

    if (res.data === 1) {
      await fetchGiroInfo();
    } else {
      notify(t('MSG_ALT_IT_NOT_EXIST', [t('MSG_TXT_CNTR_DTL_NO')]));
      await onClickCancel();
    }
  } else {
    notify(t('MSG_ALT_IT_NOT_EXIST', [t('MSG_TXT_CNTR_DTL_NO')]));
    await onClickCancel();
  }
}

async function onClearSelectUser() {
  giroPlrcv.value.cstNo = '';
  giroPlrcv.value.cstFnm = '';
}

async function onKeyDownSelectUser() {
  giroPlrcv.value.cstNo = '';
}

let saveParam;
// 저장
async function onClickSave() {
  if (!await obsMainRef.value.validate()) { return; }
  if (await obsMainRef.value.alertIfIsNotModified()) { return; }

  saveParam = cloneDeep(giroPlrcv.value);

  if (!saveParam.giroPlrcvAdrId) {
    notify(t('MSG_ALT_ENTR_DTL_ADR'));
    return;
  }console.log(saveParam.giroPlrcvAdrId);

  console.log(saveParam);

  await dataService.post('/sms/wells/withdrawal/idvrve/giro-placereceived', saveParam);
  ok();
}

onMounted(async () => {
  await initProps();
});

</script>
<style scoped>
</style>
