<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : fragment
3. 작성자 : SAVEMEGOAT
4. 작성일 : 2023-06-12
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 주문결재하기(최종결재금액, 계약번호 공지)
- 배송정보 확인
****************************************************************************************************
--->
<template>
  <wwcta-contract-settlement-agree-item
    ref="addressRef"
    title="설치정보확인"
    hide-expand-icon
    expand-icon-toggle
    default-opened
  >
    <kw-item-section class="pt20">
      <kw-item-label
        font="body"
        font-weight="500"
        class="pb12"
      >
        주문자 정보
      </kw-item-label>
      <kw-form>
        <kw-form-item label="이름">
          <p>{{ cntrCstAddressInfo.rcgvpKnm }}</p>
        </kw-form-item>
        <kw-form-item label="휴대전화번호">
          <p>{{ cntrCstPhoneNumber }}</p>
        </kw-form-item>
        <kw-form-item label="주소">
          <p>{{ `${cntrCstAddressInfo.adr} ${cntrCstAddressInfo.adrDtl ?? ''}` }}</p>
        </kw-form-item>
      </kw-form>
      <kw-item-label
        font="body"
        font-weight="500"
        class="pt20 pb12"
      >
        배송정보
        <kw-checkbox
          class="pl8"
          :model-value="sameValue"
          label="주문자 정보와 동일"
          boolean-value
          @update:model-value="onChangeSameValue"
        />
      </kw-item-label>
      <kw-form ref="frmRef">
        <kw-input
          v-model="updateAddressInfo.rcgvpKnm"
          label="이름"
          rules="required"
          class="mt12"
        />
        <!-- telNo 시리즈 반응성 없습니다. 초기값만 세팅 가능하십니다. -->
        <kw-input
          v-model="inputPhoneNumber"
          mask="telephone"
          label="휴대전화번호"
          class="mt20 pb20"
          rules="required"
        />
        <zwcm-post-code
          v-model:zipCode="updateAddressInfo.zip"
          v-model:add1="updateAddressInfo.adr"
          v-model:add2="updateAddressInfo.adrDtl"
          v-model:addKey="updateAddressInfo.adrId"
          v-model:bldMngtNo="updateAddressInfo.bldMngtNo"
          v-model:adrDvCd="weirdAdrDvCd"
          readonly
          label="주소"
          required
          class="kw-grow"
        />
        <kw-input
          v-model="updateAddressInfo.memo"
          label="특약/배송메시지"
          class="mt20"
        />
      </kw-form>
    </kw-item-section>
  </wwcta-contract-settlement-agree-item>
</template>

<script setup>
import ZwcmPostCode from '~common/components/ZwcmPostCode.vue';
import WwctaContractSettlementAgreeItem
  from '~sms-wells/contract/components/ordermgmt/WwctaContractSettlementAgreeItem.vue';
import { warn } from 'vue';
import { notify } from 'kw-lib';
import { scrollIntoView } from '~sms-common/contract/util';

const props = defineProps({
  adrpc: {
    type: Object,
    required: true,
  },
  contractor: {
    type: Object,
    required: true,
  },
});

const exposed = {};
defineExpose(exposed);

const emit = defineEmits(['activated']);

const addressFields = [
  'rcgvpKnm',
  'cralLocaraTno',
  'mexnoEncr',
  'cralIdvTno',
  'adrDvCd',
  'bldMngtNo',
  'adr',
  'adrDtl',
  'adrId',
  'zip',
];

const cntrCstAddressInfo = computed(() => {
  const contractCustomerInfo = props.contractor;
  if (!contractCustomerInfo) {
    warn('고객 정보가 없어요!!');
  }
  return {
    rcgvpKnm: contractCustomerInfo.cstKnm, /* notify!!! */
    cralLocaraTno: contractCustomerInfo.cralLocaraTno,
    mexnoEncr: contractCustomerInfo.mexnoEncr,
    cralIdvTno: contractCustomerInfo.cralIdvTno,
    adrDvCd: undefined, /* 고객 관계 DVO 에 있는지 확인 할 것 */
    bldMngtNo: undefined, /* 빌딩관리번호란다. */
    adr: contractCustomerInfo.adr,
    adrDtl: contractCustomerInfo.adrDtl,
    adrId: contractCustomerInfo.adrId,
    zip: contractCustomerInfo.zip,
  };
});
const cntrCstPhoneNumber = computed(() => {
  const { cralLocaraTno, mexnoEncr, cralIdvTno } = cntrCstAddressInfo.value;
  if (!cralLocaraTno || !mexnoEncr || !cralIdvTno) { return ''; }
  return `${cralLocaraTno}-${mexnoEncr}-${cralIdvTno}`;
});
const shippingAddressInfo = computed(() => {
  const shpadrInfo = props.adrpc;
  if (!shpadrInfo) {
    warn('배송기본 정보가 없어요!!');
  }
  return shpadrInfo;
});

const updateAddressInfo = ref({});

function clearUpdateAddressInfo() {
  addressFields.forEach((field) => {
    updateAddressInfo.value[field] = '';
  });
}

function setupUpdateAddressInfo(newValues) {
  addressFields.forEach((field) => {
    updateAddressInfo.value[field] = newValues[field];
  });
}

watch(shippingAddressInfo, setupUpdateAddressInfo, { immediate: true });

const inputPhoneNumber = computed({
  get: () => {
    const telNoArr = [];
    const { cralLocaraTno, mexnoEncr, cralIdvTno } = updateAddressInfo.value;
    if (cralLocaraTno) { telNoArr.push(cralLocaraTno); }
    if (mexnoEncr) { telNoArr.push(mexnoEncr); }
    if (cralIdvTno) { telNoArr.push(cralIdvTno); }
    return telNoArr.join('-');
  },
  set: (value) => {
    if (!value) { return; }
    const telNoArr = value.split('-');
    updateAddressInfo.value.cralLocaraTno = telNoArr[0];
    updateAddressInfo.value.mexnoEncr = telNoArr[1];
    updateAddressInfo.value.cralIdvTno = telNoArr[2];
  },
});

const sameValue = computed(() => !addressFields
  .some((field) => cntrCstAddressInfo.value[field] !== updateAddressInfo.value[field]));

function onChangeSameValue(val) {
  if (val) {
    setupUpdateAddressInfo(cntrCstAddressInfo.value);
  } else {
    clearUpdateAddressInfo();
  }
}

/* expose */
const frmRef = ref();
const addressRef = ref();

const invalidRef = ref();
async function validate() {
  if (sameValue.value) {
    return true;
  }
  const valid = await frmRef.value.validate();
  if (!valid) {
    scrollIntoView(addressRef);
    notify('설치 주소를 확인해주세요.');
    invalidRef.value = addressRef.value;
  }
  return valid;
}

function getUpdateShippingAddressInfo() {
  if (!frmRef.value.isModified) { return; }
  return {
    ...shippingAddressInfo.value,
    ...updateAddressInfo.value,
  };
}

exposed.validate = validate;
exposed.ref = addressRef;
exposed.invalidRef = invalidRef;
exposed.getUpdateShippingAddressInfo = getUpdateShippingAddressInfo;

onActivated(() => {
  emit('activated', invalidRef.value);
});

const weirdAdrDvCd = computed({
  get: () => Number(updateAddressInfo.value.adrDvCd),
  set: (val) => {
    updateAddressInfo.value.adrDvCd = String(val);
  },
});
</script>
