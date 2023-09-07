<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 상품 - 가망고객관리(CSB)
2. 프로그램 ID : WwcsbNewReceiptMgtMReceiptDtlM - 신규접수 배정관리 ( W-CU-U-0030M04 )
3. 작성자 : junho.bae
4. 작성일 : 2023.07.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 고객 >> 가망고객 >> 신규접수 배정관리(상세) (W-CU-U-0030M04)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-observer ref="obsMainRef">
      <div class="normal-area  normal-area--button-set-bottom">
        <h3>{{ $t('MSG_TIT_APP_DTLS',null,'접수 정보') }}</h3>
        <kw-form
          :cols="2"
          align-content="left"
          dense
        >
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_RCP_D',null,'접수일')">
              <p>{{ assignInfo.pspcCstInflwDt }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_RCPT_NO',null,'접수번호')">
              <p>{{ assignInfo.aplcSn }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_RCP_DV',null,'접수구분')">
              <p>{{ assignInfo.recvTpNm }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('TXT_MSG_SELL_PD_DV_CD',null,'상품구분')">
              <p>{{ assignInfo.inrtPdDvNm }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
        <kw-separator />

        <h3>{{ $t('MSG_TIT_CST_INF',null,'고객 정보') }}</h3>
        <kw-form
          :cols="2"
          align-content="left"
          dense
        >
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_CST_NAME',null,'고객이름')">
              <p>{{ assignInfo.pspcCstKnm }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_CST_CD',null,'고객코드')">
              <p>{{ assignInfo.pspcCstCnslId }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_MPNO',null,'휴대전화번호')">
              <p>{{ assignInfo.phNo }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_TEL_NO',null,'전화번호')">
              <p>{{ assignInfo.wireTelNo }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_CONTACT_REQ_DT',null,'컨택요청일')">
              <!-- <p>{{ assignInfo.cnslPsbStrtDtm }}</p> -->
              <p>{{ assignInfo.contactDate }} {{ assignInfo.contactTime }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_REQ_CN',null,'요청내용')">
              <p>{{ assignInfo.pspcCstRcpCn }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
        <kw-separator />

        <h3>{{ $t('MSG_TXT_ASGN_INF',null,'배정정보') }}</h3>
        <kw-form
          :cols="2"
          align-content="left"
          dense
        >
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_ASN_DT',null,'배정일자')">
              <p>{{ assignInfo.ichrAsnFshDt }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_ASSIGN_MANAGER',null,'배정담당자')">
              <p>
                <slot v-if="isShowManualAssignBtn">
                  <!-- padding="10px" -->
                  <kw-btn
                    secondary
                    :label="$t('MSG_BTN_MANUAL_ASSIGN',null,'수동배정')"
                    dense
                    @click="onClickManualAssign"
                  />
                </slot>
                <slot v-else>
                  {{ assignInfo.ichrPrtnrNm }}
                </slot>
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_ASSIGNER_EP_NO',null,'배정담당자 사번')">
              <p>{{ assignInfo.ichrPrtnrNo }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_ASSIGN_CONTACT',null,'배정컨택')">
              <slot v-if="currentJobType === 'ASGN'">
                <kw-select
                  v-model="assignInfo.pspcCstCnslRsCd"
                  first-option="select"
                  :options="codes.PSPC_CST_CNSL_RS_CD"
                />
              </slot>
              <slot v-else>
                <p>{{ assignInfo.pspcCstCnslRsNm }}</p>
              </slot>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_NOTE',null,'비고')">
              <slot v-if="currentJobType === 'ASGN'">
                <kw-input
                  v-model="assignInfo.cnslMoCn"
                  type="textarea"
                  :rows="3"
                  counter
                  maxlength="200"
                />
              </slot>
              <slot v-else>
                <p>{{ assignInfo.cnslMoCn }}</p>
              </slot>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
        <kw-separator />

        <h3>{{ $t('MSG_TXT_ODER_INF',null,'주문정보') }}</h3>
        <kw-form
          :cols="2"
          align-content="left"
          dense
        >
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_ORD_NO',null,'주문번호')">
              <p>{{ assignInfo?.cntrNo }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_CRT_D',null,'생성일')">
              <p>{{ assignInfo?.showFstRgstDtm }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_DUEDT',null,'예정일')">
              <p>{{ assignInfo?.sppDuedt }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_DT_OF_SALE',null,'매출일')">
              <p>{{ assignInfo?.cntrPdStrtdt }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_GOODS_NM',null,'제품명')">
              <p>{{ assignInfo?.pdNm }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_ADDR',null,'주소')">
              <p>{{ assignInfo?.custAdr }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
        <div class="button-set--bottom">
          <div class="button-set--bottom-right">
            <slot v-if="currentJobType === 'ASGN'">
              <kw-btn
                :label="$t('MSG_BTN_CANCEL')"
                @click="onClickCancel"
              />
              <kw-btn
                :label="$t('MSG_BTN_SAVE')"
                primary
                class="ml8"
                @click="onClickSave"
              />
            </slot>
            <slot v-else>
              <kw-btn
                v-if="false"
                :label="$t('MSG_BTN_CONFIRM')"
                @click="onClickConfirm"
              />
            </slot>
          </div>
        </div>
      </div>
    </kw-observer>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil, useGlobal } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const props = defineProps({
  pspcCstCnslId: { type: String, default: null },
  jobType: { type: String, default: 'RECV' }, // RECV
  fromUi: { type: String, default: null },
  cntrNo: { type: String, default: null },
});

const { notify, modal } = useGlobal();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/customer/receipts';
const obsMainRef = ref();
const codes = await codeUtil.getMultiCodes('PSPC_CST_CNSL_RS_CD'); // 가망고객상담결과코드

const currentPspcCstCnslId = ref('');
const currentJobType = ref('');
const currentFromUi = ref(''); // 호출한 화면만 refresh하기 위한 변수값
const assignInfo = ref({});
const isShowManualAssignBtn = ref(false);

async function onClickConfirm() {
  await router.close(0, false);
  const targetPage = currentJobType.value === 'RECV'
    ? '/customer/wwcsb-new-receipt-mgt'
    : '/customer/wwcsb-new-receipt-mgt';
  await router.push(
    { path: targetPage,
      state: { stateParam: { test: 'teststring' } },
      query: { isSearch: true, fromUi: currentFromUi.value },
    },
  );
}

async function onClickCancel() {
  await router.close(0, false);
  const targetPage = currentJobType.value === 'RECV'
    ? '/customer/wwcsb-new-receipt-mgt'
    : '/customer/wwcsb-new-receipt-mgt';
  await router.push(
    { path: targetPage,
      state: { stateParam: { test: 'teststring' } },
      query: { isSearch: false, fromUi: currentFromUi.value },
    },
  );
}

async function onClickSave() {
  if (currentJobType.value === 'ASGN' && isEmpty(assignInfo?.value?.pspcCstCnslRsCd)) {
    // {0}(을)를 선택해주세요. (배정 컨택 코드)
    notify(t('MSG_TXT_BEFORE_SELECT_IT', [t('MSG_TXT_ASIGN_CONTACT_CD')]));
    return false;
  }
  // 타 화면에서 배열로 입력받아 일괄 처리하는 기능으로 Formatting
  assignInfo.value.pspcCstCnslIds = [currentPspcCstCnslId.value];

  await dataService.put(`${baseUrl}/contact`, assignInfo.value);
  notify(t('MSG_ALT_SAVE_DATA', null, '저장되었습니다.'));

  await router.close(0, true);
  const targetPage = currentJobType.value === 'RECV'
    ? '/customer/wwcsb-new-receipt-mgt'
    : '/customer/wwcsb-new-receipt-mgt';
  await router.push(
    { path: targetPage,
      state: { stateParam: { test: 'teststring' } },
      query: { isSearch: true, fromUi: currentFromUi.value },
    },
  );
}

async function fetchData() {
  const { pspcCstCnslId, cntrNo } = props;
  currentPspcCstCnslId.value = pspcCstCnslId;

  const res = await dataService.get(`${baseUrl}/assign/${currentPspcCstCnslId.value}/${cntrNo}`);
  assignInfo.value = res.data;
  assignInfo.value.showFstRgstDtm = dayjs(assignInfo?.value?.fstRgstDtm).format('YYYY-MM-DD');
  // 수동배정 Btn [Show|Hide]
  isShowManualAssignBtn.value = currentJobType.value === 'RECV' && isEmpty(assignInfo.value.ichrPrtnrNo);
}

async function onClickManualAssign() {
  const componentProps = {
    pspcCstCnslId: [assignInfo.value.pspcCstCnslId],
    ichrPrtnrNo: [assignInfo.value.ichrPrtnrNo],
    jobType: 'RECV',
  };
  console.log('componentProps', componentProps);
  const { result, payload } = await modal({ component: 'WwcsbManualAssignModP', componentProps });
  if (result && payload) {
    await fetchData();
  }
}

async function initProps() {
  const { pspcCstCnslId, jobType, fromUi } = props;
  currentPspcCstCnslId.value = pspcCstCnslId;
  currentJobType.value = jobType;
  currentFromUi.value = fromUi;

  console.log('currentJobType.value', currentJobType.value);

  if (isEmpty(currentPspcCstCnslId.value)) {
    await router.close();
  } else {
    await fetchData();
  }
}

onMounted(async () => {
  setTimeout(() => initProps(), 1000);
});

watch(() => route.params.pspcCstCnslId, async (pspcCstCnslId) => {
  if (pspcCstCnslId && currentPspcCstCnslId.value !== pspcCstCnslId) {
    currentPspcCstCnslId.value = pspcCstCnslId;
    await fetchData();
  }
}, { immediate: true });

</script>
<style scoped></style>
