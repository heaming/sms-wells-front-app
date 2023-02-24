<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : idvrve
2. 프로그램 ID : WwdbGiroPlrcvMgtP - 지로 수신처 관리
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
              rules="required"
              :disable="isDisableChk"
              maxlength="16"
              icon="search"
              @click-icon="onClickSearchUser"
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
              v-model="giroPlrcv.fnlMdfcDtm"
              :disable="true"
              rules="required"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
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
              v-model:addKey="giroPlrcv.addKey"
              class="kw-grow"
            />
          </kw-form-item>
        </kw-form-row>
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
import { getComponentType, modal, useDataService, useModal, alert } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
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
const { ok } = useModal();
console.log(userName);

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

// 고객명 찾기 이벤트
async function onClickSearchUser() {
  const { result, payload } = await modal({ component: 'ZwcsaCustomerListP' });

  if (result) {
    console.log(payload);
  }
}

const giroPlrcv = ref({
  state: '',
  cntrNo: '',
  cntrSn: '',
  giroBizDvCd: '2', // 지로업무구분코드
  giroBizTpCd: '', // 지로업무유형코드 판매유형
  cstFnm: '', // 고객명
  zip: '', // 우편번호
  adrDvCd: '', // 주소구분코드
  basAdr: '', // 기본주소
  dtlAdr: '', // 상세주소
  dtaDlYn: '', // 삭제여부
  fstRgstUsrId: userName, // 업무담당
  fnlMdfcDtm: now.format('YYYYMMDD'),
  addKey: '',
});

let cachedParams;

async function fetchGiroInfo() {
  cachedParams = cloneDeep(giroPlrcvProps.value);

  console.log(cachedParams);

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/giro-placereceived', { params: cachedParams });

  giroPlrcv.value = res.data;
  giroPlrcv.value.state = 'updated';

  isDisableChk.value = true;
}

async function initProps() {
  const { cntrNo, cntrSn } = props;

  giroPlrcvProps.value.cntrNo = cntrNo;
  giroPlrcvProps.value.cntrSn = cntrSn;
  // giroPlrcvProps.value.cntrNo = 'E20206720744';
  // giroPlrcvProps.value.cntrSn = '6';
  giroPlrcv.value.state = 'created';

  if (giroPlrcvProps.value.cntrNo) {
    await fetchGiroInfo();
  }
  console.log(giroPlrcv.value.state);
}

await initProps();

let saveParam;
// 저장
async function onClickSave() {
  if (await obsMainRef.value.alertIfIsNotModified()) { return; }
  if (!await obsMainRef.value.validate()) { return; }

  saveParam = cloneDeep(giroPlrcv.value);

  if (!saveParam.addKey) {
    await alert(t('MSG_ALT_ENTR_DTL_ADR'));
    return;
  }

  console.log(saveParam);

  await dataService.post('/sms/wells/withdrawal/idvrve/giro-placereceived', saveParam);
  ok();
}
</script>
<style scoped>
</style>
