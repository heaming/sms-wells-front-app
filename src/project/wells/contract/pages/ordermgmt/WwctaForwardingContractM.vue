<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : ?
3. 작성자 : Myoungbin Joo
4. 작성일 : 2023-11-10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 계약서 조회(고객 URL 용)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-form
      ref="frmRef"
      class="pa20"
    >
      <slot v-if="isEqual(rptIdGbn, '1')">
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
      </slot>
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
import { decryptEncryptedParam, openOzReport, postMessage } from '~sms-common/contract/util';
import { alert, useDataService } from 'kw-lib';
import { isEqual, isEmpty } from 'lodash-es';
import { warn } from 'vue';

const props = defineProps({
  cntrNo: { type: String, default: undefined }, /* E20220069885, E20220069885 */
  encryptedParam: { type: String, default: undefined },
  rptId: { type: String, default: undefined },
});

const params = decryptEncryptedParam(props.encryptedParam, {
  cntrNo: props.cntrNo,
});

if (!params.cntrNo) {
  await alert('주소에 문제가 있습니다.');
  window.close();
}

const dataService = useDataService();

const frmRef = ref();
const basicInfo = ref();
const isCooperation = computed(() => isEqual(props.rptId, '003'));
const authInfo = reactive({
  cntrCstBryyMmdd: '', /* 강태욱 19840114, 한상문 19790115, 유기림 19800221 */
  bzrno: '', /* 베베 1273173234 */
});

const rptIdGbn = computed(() => { // 유저 권한 여부 확인 computed
  if (isEmpty(props.rptId)) { return ''; }

  if (isEqual(props.rptId, '001') || isEqual(props.rptId, '002')) { return '1'; }

  return '';
});

async function openCntrOZReport() {
  const { data: reports } = await dataService.get('/sms/wells/contract/report/contract', { params: { cntrNo: params.cntrNo } });
  if (!reports?.length) {
    warn('계약서가 없는데?');
    return;
  }
  await openOzReport(...reports);
}

async function onClickConfirm() {
  if (!await frmRef.value.validate()) { return; }

  const response = await dataService.post('/sms/wells/contract/auth/contract-document', {
    cntrNo: params.cntrNo,
    ...authInfo,
  });
  if (response.data.valid) {
    openCntrOZReport();
  }
}

function onClickClose() {
  postMessage('closed', false);
  window.close();
}

async function fetchBasicContractInfo() {
  try {
    if (isEqual(rptIdGbn.value, '1')) {
      const { data } = await dataService.get('/sms/wells/contract/auth/contract-document', {
        params: { cntrNo: params.cntrNo },
      });
      basicInfo.value = data;
    }
  } catch (e) {
    // cancel();
    // window.close();
  }
}

await fetchBasicContractInfo();
</script>
