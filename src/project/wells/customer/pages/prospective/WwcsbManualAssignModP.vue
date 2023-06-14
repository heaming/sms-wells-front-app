<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDY
2. 프로그램 ID : WwcsbManualAssignModP - 담당자 수동배정 (W-CU-U-0030P02)
3. 작성자 : junho.bae
4. 작성일 : 2022.AA.BB
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 분류체계 등록/수정 프로그램
****************************************************************************************************
--TODO LIST
--->

<template>
  <kw-popup size="1xl">
    <kw-observer ref="obsMainRef">
      <kw-form
        ref="frmMainRef"
        :cols="1"
      >
        <kw-form-row>
          <!-- 사번 -->
          <kw-form-item
            :label="t('MSG_TXT_EPNO')"
            required
          >
            <kw-input
              v-model.trim:model-value="searchParams.prtnrNo"
              :label="t('MSG_TXT_EPNO')"
              maxlength="10"
              rules="required|numeric"
            />
            <kw-btn
              :label="t('MSG_TXT_SRCH')"
              secondary
              @click="fetchData"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 이름 -->
          <kw-form-item :label="t('MSG_TXT_NAME')">
            <p>{{ prtnrNoInfo?.prtnrNm }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 휴대전화번호 -->
          <kw-form-item :label="t('MSG_TXT_MPNO')">
            <p>{{ prtnrNoInfo?.prtnrHpNo }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_CRLV')">
            <p>{{ getCodeNames(codes.PSTN_DV_CD, prtnrNoInfo?.pstnDvCd) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_DEPT_NM')">
            <p>{{ prtnrNoInfo?.ogNm }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <!-- <kw-separator /> -->
    </kw-observer>

    <template #action>
      <div class="button-set--bottom">
        <div class="button-set--bottom-right">
          <kw-btn
            :label="$t('MSG_BTN_CANCEL')"
            class="ml8"
            @click="cancel"
          />
          <kw-btn
            primary
            :label="$t('MSG_BTN_SAVE')"
            class="ml8"
            :disable="isDisableSave"
            @click="onClickSave"
          />
        </div>
      </div>
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal, useModal, codeUtil } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import { getCodeNames } from '~sms-common/customer/utils/csUtil';

const { notify } = useGlobal();
const { t } = useI18n();
const { ok, cancel } = useModal();

const dataService = useDataService();
const obsMainRef = ref();
const frmMainRef = ref();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/customer/receipts';
const codes = await codeUtil.getMultiCodes('PSTN_DV_CD');

const props = defineProps({
  pspcCstCnslId: { type: String, required: true, default: null },
});

const searchParams = ref({
  prtnrNo: '', // 1076245
});

const saveParams = ref({
  pspcCstCnslId: '',
  ogTpCd: '',
  prtnrNo: '',

});

const isDisableSave = ref(true);
const prtnrNoInfo = ref({});

async function onClickSave() {
  if (!await obsMainRef.value.validate()) { return; }
  // if (await obsMainRef.value.alertIfIsNotModified()) { return; }

  // if (isEmpty(searchParams.value.prtnrNo)) {
  //   // {0} 을(를) 입력해주세요.
  //   notify(t('MSG_ALT_CHK_NCSR', [t('MSG_TXT_EPNO')]));
  //   return false;
  // }

  if (isEmpty(prtnrNoInfo.value) || prtnrNoInfo.value.prtnrNo !== searchParams.value.prtnrNo) {
    notify(t('MSG_ALT_VALUE_CHANGED_BE_RESEARCH'));
    isDisableSave.value = true;
    return false;
  }

  saveParams.value.pspcCstCnslId = props.pspcCstCnslId;
  saveParams.value.ogTpCd = prtnrNoInfo.value.ogTpCd;
  saveParams.value.prtnrNo = prtnrNoInfo.value.prtnrNo;
  const rtn = await dataService.put(`${baseUrl}/assign`, saveParams.value);
  ok(rtn?.data?.processCount);
}

async function fetchData() {
  if (isEmpty(searchParams.value.prtnrNo)) {
    // {0} 을(를) 입력해주세요. (사번)
    notify(t('MSG_ALT_CHK_NCSR', [t('MSG_TXT_EPNO')]));
    return false;
  }

  const response = await dataService.get(`${baseUrl}/partner/${searchParams.value.prtnrNo}`);
  prtnrNoInfo.value = response.data;
  isDisableSave.value = isEmpty(response.data);
}

onMounted(async () => { });
</script>
