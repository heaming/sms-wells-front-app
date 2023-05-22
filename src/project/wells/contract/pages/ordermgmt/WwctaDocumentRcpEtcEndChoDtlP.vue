<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaDocumentRcpEtcEndChoDtlM - 서류 접수 기타 종료 선택
3. 작성자 : jihoon.kim
4. 작성일 : 2023.04.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 서류 접수 기타 종료 선택한 건에 대한 팝업화면
****************************************************************************************************
--->
<template>
  <!-- 기타종료 선택 -->
  <kw-popup
    class="kw-popup--sm"
    ignore-on-modified
    no-action
  >
    <p>
      [{{ props.cstKnm }}]님의 업무를 종료 및 알림톡 발송하시겠습니까?
      기타 종류 사유를 선택하세요.
    </p>
    <kw-form
      :cols="1"
      class="mt20"
      dense
    >
      <kw-form-row>
        <kw-form-item
          no-label
          class="option-group-col"
          required
        >
          <kw-option-group
            v-model="searchParams.cntrChPrgsStatCd"
            type="radio"
            :options="optionList"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <!-- 취소 -->
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickCancel"
      />
      <!-- 확인 -->
      <kw-btn
        primary
        :label="$t('MSG_BTN_CONFIRM')"
        @click="onClickConfirm"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useModal, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { notify } = useGlobal();
const optionList = ref([{
  codeId: '50',
  codeName: t('MSG_TXT_CST_CH_RQST') }, // 고객변경 요청
{
  codeId: '60',
  codeName: t('MSG_TXT_PSIC_CH') }, // 담당자 변경
{
  codeId: '70',
  codeName: t('MSG_TXT_LTM_NOT_RCPT') }]); // 장기미접수

const props = defineProps({
  cntrChRcpId: { type: String, required: true, default: '' },
  cstKnm: { type: String, required: false, default: '' },
  cralLocaraTno: { type: String, required: false, default: '' },
  mexnoEncr: { type: String, required: false, default: '' },
  cralIdvTno: { type: String, required: false, default: '' },
});
const { ok, cancel } = useModal();

let cachedParams;
const searchParams = ref({
  cntrChRcpId: props.cntrChRcpId, // 접수번호
  cntrChPrgsStatCd: '50', // 기타종료코드(계약변경진행상태코드)
  cstKnm: props.cstKnm, // 고객명
  cralLocaraTno: props.cralLocaraTno, // 휴대지역전화번호
  mexnoEncr: props.mexnoEncr, // 휴대전화국번호암호화
  cralIdvTno: props.cralIdvTno, // 휴대개별전화번호
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  let cntrChPrgsStatNm = '';

  cachedParams = cloneDeep(searchParams.value);
  res = await dataService.get('/sms/wells/contract/document-receipts/confirms', { params: cachedParams });
  // console.log(res.data);

  if (res.data >= 1) {
    if (searchParams.value.cntrChPrgsStatCd === '50') {
      cntrChPrgsStatNm = optionList.value[0].codeName;
    } else if (searchParams.value.cntrChPrgsStatCd === '60') {
      cntrChPrgsStatNm = optionList.value[1].codeName;
    } else if (searchParams.value.cntrChPrgsStatCd === '70') {
      cntrChPrgsStatNm = optionList.value[2].codeName;
    }
    // console.log(cntrChPrgsStatNm);
    ok();
    await notify(cntrChPrgsStatNm + t('MSG_ALT_PROCS_FSH')); // {0} 처리 되었습니다.
  }
}

async function onClickConfirm() {
  await fetchData();
}

async function onClickCancel() {
  cancel();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
<style lang="scss" scoped>
.option-group-col {
  &::v-deep(.q-option-group) {
    flex-direction: column;

    div {
      width: 100%;
    }

    div + div {
      margin-top: 16px;
      margin-left: 0;
    }
  }

  &::v-deep(.q-field__bottom) {
    min-height: 10px;
    position: static;
    transform: translateY(0);

    .q-field__messages {
      transition: none !important;

      div {
        margin-top: 9px;
        margin-bottom: 10px;
      }
    }
  }
}
</style>
