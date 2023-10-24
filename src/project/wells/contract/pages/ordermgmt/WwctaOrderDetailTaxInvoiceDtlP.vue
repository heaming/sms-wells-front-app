<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaOrderDetailTaxInvoiceDtlP - 주문상세페이지 내부 팝업_세금계산서
3. 작성자 : Myoungbin Joo
4. 작성일 : 2023.04.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U-0092P04] - 세금계산서 발행 팝업
****************************************************************************************************
--->
<template>
  <kw-action-top class="mt30">
    <kw-btn
      v-show="isReadonly"
      dense
      secondary
      :label="t('MSG_BTN_CH')"
      @click="onClickEdit"
    />
    <kw-btn
      v-show="!isReadonly"
      dense
      secondary
      :label="t('MSG_BTN_SAVE')"
      @click="onClickSave"
    />
    <kw-btn
      v-show="!isReadonly"
      dense
      secondary
      :label="t('MSG_BTN_CANCEL')"
      @click="onClickCancel"
    />
  </kw-action-top>
  <kw-form
    ref="frmMainRef"
    :cols="2"
    class="mt20"
  >
    <kw-form-row>
      <!-- 발행구분 -->
      <kw-form-item
        :label="t('MSG_TXT_ISSUANCE_CLAR')"
        required
      >
        <kw-option-group
          v-model="fieldParams.txinvPblOjYn"
          :label="t('MSG_TXT_ISSUANCE_CLAR')"
          type="radio"
          :options="[
            {'codeName':t('MSG_TXT_PBL'), 'codeId':'Y'},
            {'codeName':t('MSG_TXT_N_PBL'), 'codeId':'N'}
          ]"
          :disable="isReadonly"
          :rules="setComnponetRule('required')"
        />
      </kw-form-item>
      <!-- 발행유형 -->
      <kw-form-item :label="t('MSG_TXT_TXINV_PBL_TP')">
        <kw-radio :label="t('MSG_TXT_ELC')" />
      </kw-form-item>
    </kw-form-row>

    <kw-form-row>
      <!-- 사업자등록번호 -->
      <kw-form-item :label="t('MSG_TXT_CRNO')">
        <p>{{ fieldParams.bzrnoFormat }}</p>
      </kw-form-item>
      <!-- 법인명 -->
      <kw-form-item :label="t('MSG_TXT_CRP_NM')">
        <p> {{ fieldParams.dlpnrNm }}</p>
      </kw-form-item>
    </kw-form-row>

    <kw-form-row>
      <!-- 담당자명 -->
      <kw-form-item
        :label="t('MSG_TXT_PIC_NM')"
        :required="!isReadonly && !isOrgTxinvPblOjYn"
      >
        <kw-input
          v-model="fieldParams.dlpnrPsicNm"
          maxlength="500"
          :readonly="isReadonly || isOrgTxinvPblOjYn"
          :required="!isReadonly && !isOrgTxinvPblOjYn"
          :label="t('MSG_TXT_PIC_NM')"
          :rules="setComnponetRule('required')"
        />
      </kw-form-item>
      <!-- 전화번호 -->
      <kw-form-item
        ref="testref"
        :label="t('MSG_TXT_TEL_NO')"
        :required="!isReadonly && !isOrgTxinvPblOjYn"
      >
        <zwcm-telephone-number
          v-model:tel-no0="fieldParams.telNo"
          v-model:tel-no1="fieldParams.cralLocaraTno"
          v-model:tel-no2="fieldParams.mexno"
          v-model:tel-no3="fieldParams.cralIdvTno"
          mask="telephone"
          :required="!isReadonly && !isOrgTxinvPblOjYn"
          :readonly="isReadonly || isOrgTxinvPblOjYn"
          :label="t('MSG_TXT_TEL_NO')"
        />
      </kw-form-item>
    </kw-form-row>

    <kw-form-row class="mb30">
      <!-- 전자메일 -->
      <kw-form-item
        :label="t('MSG_TXT_EMAIL')"
        :required="!isReadonly && !isOrgTxinvPblOjYn"
      >
        <zwcm-email-address
          v-model="fieldParams.emadr"
          :required="!isReadonly && !isOrgTxinvPblOjYn"
          :readonly="isReadonly || isOrgTxinvPblOjYn"
          :label="t('MSG_TXT_EMAIL')"
          rules="required"
        />
      </kw-form-item>
      <!-- 발행일자 -->
      <kw-form-item
        :label="t('MSG_TXT_PBL_DT')"
        :required="!isReadonly && !isOrgTxinvPblOjYn"
      >
        <p class="ml8">
          <kw-option-group
            v-model="fieldParams.txinvPblD"
            :label="t('MSG_TXT_PBL_DT')"
            :rules="setComnponetRule('required')"
            type="radio"
            :options="[
              {'codeName':t('MSG_TXT_DAY', [15]), 'codeId':'15'},
              {'codeName':t('MSG_TXT_DAY', [20]), 'codeId':'20'},
              {'codeName':t('MSG_TXT_DAY', [25]), 'codeId':'25'},
              {'codeName':t('MSG_TXT_LST_DAYS'), 'codeId':'99'}
            ]"
            :required="!isReadonly && !isOrgTxinvPblOjYn"
            :disable="isReadonly || isOrgTxinvPblOjYn"
          />
        </p>
      </kw-form-item>
    </kw-form-row>
  </kw-form>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, useGlobal } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import ZwcmEmailAddress from '~common/components/ZwcmEmailAddress.vue';
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';

const { confirm, alert } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
const isReadonly = ref(true);
const frmMainRef = ref(getComponentType('KwForm'));
const orgTxinvPblOjYn = ref();
const isOrgTxinvPblOjYn = ref();

let cachedParams;

const testref = ref(getComponentType('KwForm'));

const searchParams = ref({
  cntrNo: '',
  cntrSn: '',
});

const fieldParams = ref({
  bzrno: '', /* 사업자등록번호 */
  cntrCnfmDtm: '', /* 계약확정일시 */
  cralIdvTno: '', /* 휴대개별전화번호 */
  cralLocaraTno: '', /* 휴대지역전화번호 */
  dlpnrCd: '', /* 거래처 코드 */
  dlpnrNm: '', /* 거래처명 */
  dlpnrPsicNm: '', /* 거래처담당자명 */
  dpTpCd: '', /* 입금유형코드 */
  emadr: '', /* 이메일 주소 */
  emadr1: '', /* @앞 메일주소 */
  emadr2: '', /* @뒤 메일주소 */
  mexno: '', /* 휴대전화국번호암호화 */
  txinvPblD: '', /* 세금계산서발행일 */
  txinvPblOjYn: '', /* 세금계산서발행여부 */
  telNo: '', /* 전화번호 */
  bzrnoFormat: '', /* 사업자등록번호 format */
  cntrNo: '',
  cntrSn: '',
  rules: '',
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// fetchData: 조회
async function fetchData() {
  orgTxinvPblOjYn.value = '';
  frmMainRef.value.reset();

  const res = await dataService.get('/sms/wells/contract/contract-info/tax-Invoices', { params: { cntrNo: searchParams.value.cntrNo, cntrSn: searchParams.value.cntrSn } });
  if (!isEmpty(res.data)) {
    Object.assign(fieldParams.value, res.data);
    fieldParams.value.telNo = `${fieldParams.value.cralLocaraTno}${fieldParams.value.mexno}${fieldParams.value.cralIdvTno}`; // 전화번호
    fieldParams.value.bzrnoFormat = !isEmpty(res.data.bzrno) ? `${res.data.bzrno?.substring(0, 3)}-${res.data.bzrno?.substring(3, 5)}-${res.data.bzrno?.substring(5, 10)}` : '';

    orgTxinvPblOjYn.value = res.data.txinvPblOjYn;
  }
  fieldParams.value.cntrNo = searchParams.value.cntrNo;
  fieldParams.value.cntrSn = searchParams.value.cntrSn;
  frmMainRef.value.init();
}

// onClickEdit: 수정버튼 클릭 시
async function onClickEdit() {
  isReadonly.value = !isReadonly.value;
}

// onClickCancel: 취소버튼 클릭 시
async function onClickCancel() {
  if (!await frmMainRef.value.confirmIfIsModified()) { return; }

  fetchData();
  isReadonly.value = true;
}

// onClickSave: 저장버튼 클릭 시
async function onClickSave() {
  if (orgTxinvPblOjYn.value === fieldParams.value.txinvPblOjYn) {
    alert(t('MSG_ALT_CHECK_ISSUANCE_CLAR'));
    return;
  }

  if (await frmMainRef.value.alertIfIsNotModified()) { return; }

  if (!await frmMainRef.value.validate()) { return; }

  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }

  let returnMsg = '';
  cachedParams = cloneDeep(fieldParams.value);

  const res = await dataService.post('/sms/wells/contract/contract-info/tax-Invoices', cachedParams);
  if (!isEmpty(res.data)) {
    returnMsg = res.data;
  } else {
    returnMsg = t('MSG_ALT_SAVE_DATA');
  }

  await alert(returnMsg);

  isOrgTxinvPblOjYn.value = true;
  isReadonly.value = true;
  fetchData();
}

// setDatas: 계약번호, 계약일련번호 세팅 (부모창에서 호출)
async function setDatas(cntrNo, cntrSn) {
  searchParams.value.cntrNo = cntrNo;
  searchParams.value.cntrSn = cntrSn;

  await fetchData();
}

// 외부에서 사용할 수 있도록 노출 선언
defineExpose({
  setDatas,
});

watch(() => fieldParams.value.txinvPblOjYn, (val) => {
  if (orgTxinvPblOjYn.value === val || val === 'N') {
    isOrgTxinvPblOjYn.value = true;
  } else {
    isOrgTxinvPblOjYn.value = false;
  }
});

// 읽기전용인지 아닌지 감시하기
function setComnponetRule(msg) {
  if (!isReadonly.value) {
    return msg;
  }
}
</script>
