<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbCustomerModP - 고객정보 변경(W-SS-U-0101P01)
3. 작성자 : Myoungbin Joo
4. 작성일 : 2023.07.06
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 고객정보 변경
****************************************************************************************************
--->

<template>
  <kw-popup
    ref="frmMainRef"
    size="xl"
  >
    <h3>{{ $t('MSG_TXT_CNTRT_INF') }}</h3>
    <kw-observer ref="obsMainRef">
      <kw-form :cols="2">
        <div v-if="isEqual(props.copnDvCd, '1')">
          <kw-form-row>
            <!-- 계약자 -->
            <kw-form-item
              :label="t('MSG_TXT_CNTRT')"
            >
              <p>{{ fieldParams.cstKnm }}</p>
            </kw-form-item>
            <!-- 고객번호 -->
            <kw-form-item
              :label="$t('MSG_TXT_CST_NO')"
            >
              <p>{{ fieldParams.cntrCstNo }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 생년월일 -->
            <kw-form-item
              :label="t('MSG_TXT_BIRTH_DATE')"
            >
              <p>{{ stringUtil.getDateFormat(fieldParams.bryyMmdd) }}</p>
            </kw-form-item>
            <!-- 구분 -->
            <kw-form-item
              :label="t('MSG_TXT_DIV')"
            >
              <p>{{ fieldParams.copnDvNm }}</p>
            </kw-form-item>
          </kw-form-row>
        </div>
        <div v-if="isEqual(props.copnDvCd, '2')">
          <kw-form-row>
            <!-- 계약자 -->
            <kw-form-item
              :label="t('MSG_TXT_CNTRT')"
            >
              <p>{{ fieldParams.cstKnm }}</p>
            </kw-form-item>
            <!-- 사업자번호 -->
            <kw-form-item
              :label="$t('MSG_TXT_ENTRP_NO')"
            >
              <p>{{ getBzrnoFormat(props.copnDvCd, fieldParams.bzrno) }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 구분 -->
            <kw-form-item
              :label="t('MSG_TXT_DIV')"
            >
              <p>{{ fieldParams.copnDvNm }}</p>
            </kw-form-item>
            <!-- 전화번호 -->
            <kw-form-item
              :label="t('MSG_TXT_TEL_NO')"
            >
              <kw-input
                v-model:model-value="fieldParams.cntrCopnCralTno"
                v-model:telNo0="fieldParams.cntrCopnLocaraTno"
                v-model:telNo1="fieldParams.cntrCopnExnoEncr"
                v-model:telNo2="fieldParams.cntrCopnIdvTno"
                :placeholder="t('MSG_TXT_INP')"
                :label="$t('MSG_TXT_TEL_NO')"
                :readonly="true"
                rules="telephone"
                mask="telephone"
              />
            </kw-form-item>
          </kw-form-row>
        </div>
        <kw-form-row>
          <!-- 휴대전화번호 -->
          <kw-form-item
            :label="t('MSG_TXT_MPNO')"
            required
          >
            <kw-input
              v-model:model-value="fieldParams.cntrCralTno"
              v-model:telNo0="fieldParams.cntrCralLocaraTno"
              v-model:telNo1="fieldParams.cntrMexnoEncr"
              v-model:telNo2="fieldParams.cntrCralIdvTno"
              :label="$t('MSG_TXT_MPNO')"
              :readonly="true"
              rules="required|telephone"
              mask="telephone"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-form
        :cols="1"
        class="mt16"
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_ADDR')"
            required
          >
            <zwcm-post-code
              v-model:addKey="fieldParams.cntrAdrId"
              v-model:zipCode="fieldParams.cntrAdrZip"
              v-model:adrDvCd="fieldParams.cntrAdrDvCd"
              v-model:add1="fieldParams.cntrCstRnadr"
              v-model:add2="fieldParams.cntrCstRdadr"
              :label="t('MSG_TXT_ADDR')"
              required
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
    </kw-observer>
    <kw-separator />
    <!-- 설치자 정보 -->
    <h3>{{ $t('MSG_TXT_INSTR_INFO') }}</h3>
    <kw-observer ref="obsSubRef">
      <kw-form :cols="2">
        <kw-form-row>
          <!-- 설치자 -->
          <kw-form-item
            :label="t('MSG_TXT_INSTR')"
            required
          >
            <kw-input
              v-model="fieldParams.rcgvpKnm"
              :rules="!hasIstDt ? 'required': ''"
              maxlength="10"
              :label="t('MSG_TXT_INSTR')"
              :disable="hasIstDt"
            />
          </kw-form-item>
          <!-- 휴대전화번호 -->
          <kw-form-item
            :label="t('MSG_TXT_MPNO')"
            required
          >
            <kw-input
              v-model:model-value="fieldParams.istCralTno"
              v-model:telNo0="fieldParams.istCralLocaraTno"
              v-model:telNo1="fieldParams.istMexnoEncr"
              v-model:telNo2="fieldParams.istCralIdvTno"
              :label="$t('MSG_TXT_MPNO')"
              :rules="!hasIstDt ? 'required|telephone' : ''"
              :disable="hasIstDt"
              mask="telephone"
            />
          </kw-form-item>
        </kw-form-row>
        <div v-if="isEqual(props.copnDvCd, '2')">
          <kw-form-row>
            <!-- 전화번호 -->
            <kw-form-item
              :label="t('MSG_TXT_TEL_NO')"
            >
              <kw-input
                v-model:model-value="fieldParams.istPhoneNo"
                v-model:telNo0="fieldParams.istLocaraTno"
                v-model:telNo1="fieldParams.istExnoEncr"
                v-model:telNo2="fieldParams.istIdvTno"
                :label="$t('MSG_TXT_TEL_NO')"
                :rules="!hasIstDt ? '|telephone' : ''"
                :disable="hasIstDt"
                mask="telephone"
              />
            </kw-form-item>
          </kw-form-row>
        </div>
      </kw-form>
      <kw-form
        :cols="1"
        class="mt16"
      >
        <kw-form-row>
          <!-- 주소 -->
          <kw-form-item
            :label="t('MSG_TXT_ADDR')"
            required
          >
            <zwcm-post-code
              v-model:addKey="fieldParams.istAdrId"
              v-model:zipCode="fieldParams.istAdrZip"
              v-model:adrDvCd="fieldParams.istAdrDvCd"
              v-model:add1="fieldParams.istRnadr"
              v-model:add2="fieldParams.istRdadr"
              :label="t('MSG_TXT_ADDR')"
              :required="!hasIstDt ? true : false"
              :disable="hasIstDt"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item :label="$t('MSG_TXT_INST_ADDR_INPUT')">
            <kw-option-group
              v-model="fieldParams.check"
              type="checkbox"
              :options="[$t('MSG_TXT_SAME_CNTR_INFO')]"
              :disable="hasIstDt"
              @change="onChangeAddrInput"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
    </kw-observer>
    <template #action>
      <kw-btn
        v-permission:read
        negative
        :label="t('MSG_BTN_CANCEL')"
        @click="cancel"
      />
      <kw-btn
        v-permission:update
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
import { useDataService, stringUtil, useModal, useGlobal, getComponentType } from 'kw-lib';
import { isEmpty, isEqual } from 'lodash-es';

import ZwcmPostCode from '~common/components/ZwcmPostCode.vue';

const { t } = useI18n();
const { cancel, ok } = useModal();
const { notify, confirm, alert } = useGlobal();
const dataService = useDataService();

const frmMainRef = ref();
const obsMainRef = ref(getComponentType('KwObserver'));
const obsSubRef = ref(getComponentType('KwObserver'));

const props = defineProps({
  cntrNo: {
    type: String,
    required: true,
  },
  cntrSn: {
    type: Number,
    required: true,
  },
  istDt: {
    type: String,
    required: true,
  },
  cttRsCd: {
    type: String,
    required: true,
  },
  copnDvCd: {
    type: String,
    required: true,
  },
});

const hasIstDt = computed(() => (!isEmpty(props.istDt)));

const fieldParams = ref({
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
  cstKnm: '',
  cntrCstNo: '',
  bryyMmdd: '',
  bzrno: '',
  copnDvNm: '',
  cntrCralLocaraTno: '',
  cntrMexnoEncr: '',
  cntrCralIdvTno: '',
  cntrAdrZip: '',
  cntrCstRnadr: '',
  cntrCstRdadr: '',
  cntrAdrId: '',
  cntrAdrDvCd: '',
  rcgvpKnm: '',
  istCralLocaraTno: '',
  istMexnoEncr: '',
  istAdrId: '',
  istAdrDvCd: '',
  istCralIdvTno: '',
  istLocaraTno: '',
  istExnoEncr: '',
  istIdvTno: '',
  istPhoneNo: '',
  istAdrZip: '',
  istRnadr: '',
  istRdadr: '',
  cttRsCd: '',
  check: false,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/changeorder/changes/customers', { params: { cntrNo: props.cntrNo, cntrSn: props.cntrSn } });

  Object.assign(fieldParams.value, res.data);

  fieldParams.value.cntrCralTno = `${fieldParams.value.cntrCralLocaraTno}${fieldParams.value.cntrMexnoEncr}${fieldParams.value.cntrCralIdvTno}`;
  fieldParams.value.istCralTno = `${fieldParams.value.istCralLocaraTno}${fieldParams.value.istMexnoEncr}${fieldParams.value.istCralIdvTno}`;
  fieldParams.value.cntrCopnCralTno = `${fieldParams.value.cntrCopnLocaraTno}${fieldParams.value.cntrCopnExnoEncr}${fieldParams.value.cntrCopnIdvTno}`;
  fieldParams.value.istPhoneNo = `${fieldParams.value.istLocaraTno}${fieldParams.value.istExnoEncr}${fieldParams.value.istIdvTno}`;

  if (isEmpty(res.data)) {
    alert(t('MSG_ALT_CST_INF_NOT_EXST'));
    cancel();
    return;
  }
  frmMainRef.value.init();
  obsMainRef.value.init();
  obsSubRef.value.init();

  fieldParams.value.check = false;
}

async function onClickSave() {
  if (!hasIstDt.value) { // 설치일자 미존재시
    if (await frmMainRef.value.alertIfIsNotModified()) { return; }
    if (await obsSubRef.value.validate()) { // 설치자 정보 필수입력 확인여부
      if (await obsSubRef.value.isModified() && !isEmpty(props.cttRsCd)) { // 설치자 정보 수정 && 컨택결과코드 존재 여부
        alert(t('MSG_ALT_INST_ADDR_CHG_BEFORE_CTT'));
        return;
      }
    } else {
      return;
    }
  } else {
    if (await obsMainRef.value.alertIfIsNotModified()) { return; } // 계약자 정보 체크
    if (!await obsMainRef.value.validate()) { return; }

    alert('계약자 정보 변경 추후 추가 예정');
    return;
  }
  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }

  await dataService.post('/sms/wells/contract/changeorder/changes/customers', fieldParams.value);
  ok();
  notify(t('MSG_ALT_SAVE_DATA'));
}

// getBzrnoFormat: 생일, 사업자 번호 구분처리
function getBzrnoFormat(copnDvCd, bryyBzrno) {
  let msg = bryyBzrno;
  switch (copnDvCd) {
    case '2':
      msg = `${bryyBzrno.substr(0, 3)}-${bryyBzrno.substr(3, 2)}-${bryyBzrno.substr(5, 5)}`;
      break;
    default:
      msg = stringUtil.getDateFormat(bryyBzrno);
      break;
  }
  return msg;
}

function onChangeAddrInput() {
  const { check } = fieldParams.value;
  if (check) {
    fieldParams.value.rcgvpKnm = fieldParams.value.cstKnm;
    fieldParams.value.istCralTno = fieldParams.value.cntrCralTno;
    fieldParams.value.istCralLocaraTno = fieldParams.value.cntrCralLocaraTno;
    fieldParams.value.istMexnoEncr = fieldParams.value.cntrMexnoEncr;
    fieldParams.value.istCralIdvTno = fieldParams.value.cntrCralIdvTno;
    fieldParams.value.istAdrId = fieldParams.value.cntrAdrId;
    fieldParams.value.istAdrZip = fieldParams.value.cntrAdrZip;
    fieldParams.value.adrDvCd = fieldParams.value.cntrAdrDvCd;
    fieldParams.value.istRnadr = fieldParams.value.cntrCstRnadr;
    fieldParams.value.istRdadr = fieldParams.value.cntrCstRdadr;
  }
}

// onMounted: 초기값 설정
onMounted(async () => {
  await fetchData();
});
</script>
