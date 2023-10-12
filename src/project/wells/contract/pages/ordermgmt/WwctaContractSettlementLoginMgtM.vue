<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : W-SS-U-0022PM01 - 계약 결제 고객 로그인
3. 작성자 : SAVEMEGOAT
4. 작성일 : 2023-06-19
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 에듀 참고
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-form
      ref="frmRef"
      class="pa20"
    >
      <template v-if="isCooperation">
        <p class="kw-font-pt18 text-weight-medium mt20">
          {{ `${basicInfo?.cntrCstKnm} 고객님,` }} <br>
          {{ '사업자번호를 입력 입력해주세요.' }}
        </p>
        <kw-input
          v-model="authInfo.bzrno"
          :label="$t('사업자 번호')"
          rules="required"
          placeholder="사업자번호 10자리 입력"
          :maxlength="10"
        />
      </template>
      <template v-else>
        <p class="kw-font-pt18 text-weight-medium mt20">
          {{ `${basicInfo?.cntrCstKnm} 고객님,` }} <br>
          {{ '생년월일을 입력 입력해주세요.' }}
        </p>
        <kw-date-picker
          v-model="authInfo.cntrCstBryyMmdd"
          rules="required"
          placeholder="YYYY-MM-DD"
          :label="$t('계약자 생년월일')"
        />
      </template>
    </kw-form>
    <template #action>
      <kw-btn
        negative
        label="닫기"
        @click="onClickClose"
      />
      <kw-btn
        primary
        label="확인"
        @click="onClickConfirm"
      />
    </template>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { decryptEncryptedParam, postMessage } from '~sms-common/contract/util';
import { alert, useDataService } from 'kw-lib';

const props = defineProps({
  cntrNo: { type: String, default: undefined }, /* E20220069885, E20220069885 */
  encryptedParam: { type: String, default: undefined },
});

const params = decryptEncryptedParam(props.encryptedParam, {
  cntrNo: props.cntrNo,
});

if (!params.cntrNo) {
  await alert('주소에 문제가 있습니다.');
  window.close();
}

const dataService = useDataService();
const router = useRouter();

const frmRef = ref();
const basicInfo = ref();
const isCooperation = computed(() => basicInfo.value.copnDvCd === '2' /* sorry, haha. */);
const authInfo = reactive({
  cntrCstBryyMmdd: '', /* 강태욱 19840114, 한상문 19790115, 유기림 19800221 */
  bzrno: '', /* 베베 1273173234 */
});

function next() {
  router.push({
    path: '/wwcta-contract-settlement-agree-apr-mgt',
    query: props,
  });
}

async function onClickConfirm() {
  if (!await frmRef.value.validate()) { return; }

  const response = await dataService.post('/sms/wells/contract/contracts/settlements/login', {
    cntrNo: params.cntrNo,
    ...authInfo,
  });
  if (response.data.valid) {
    next(response.data.key);
  }
}

function onClickClose() {
  postMessage('closed', false);
  window.close();
}

async function fetchBasicContractInfo() {
  try {
    const { data } = await dataService.get('/sms/wells/contract/contracts/settlements/basic-info', {
      params: { cntrNo: params.cntrNo },
    });

    basicInfo.value = data;
  } catch (e) {
    // cancel();
    // window.close();
  }
}

await fetchBasicContractInfo();
</script>
