<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 상품 - 가망고객관리(CSB)
2. 프로그램 ID : WwcsbNewReceiptMgtMReceiptDtlM - 신규접수 배정관리 ( W-CU-U-0030M04 )
3. 작성자 : junho.bae
4. 작성일 : 2022.AA.BB
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 고객 >> 가망고객 >> 신규접수 배정관리(상세) (W-CU-U-0030M04)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-observer ref="obsMainRef">
      <div class="result-area">
        <h3>
          <!-- 접수 정보 -->
          {{ $t('MSG_TIT_APP_DTLS') }}
        </h3>
        <kw-form
          :cols="2"
          align-content="left"
          dense
        >
          <kw-form-row>
            <!-- 접수일 -->
            <kw-form-item :label="$t('MSG_TXT_RCP_D')">
              <p>{{ assignInfo.pspcCstInflwDt }}</p>
            </kw-form-item>
            <!-- 접수번호 -->
            <kw-form-item :label="$t('MSG_TXT_RCPT_NO')">
              <p>{{ assignInfo.aplcSn }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 접수구분 -->
            <kw-form-item :label="$t('MSG_TXT_RCP_DV')">
              <p>{{ assignInfo.recvTpNm }}</p>
            </kw-form-item>
            <!-- 상품구분 -->
            <kw-form-item :label="$t('TXT_MSG_SELL_PD_DV_CD')">
              <p>{{ assignInfo.inrtPdDvNm }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
        <kw-separator />

        <h3>
          <!-- 고객 정보 -->
          {{ $t('MSG_TIT_CST_INF') }}
        </h3>
        <kw-form
          :cols="2"
          align-content="left"
          dense
        >
          <kw-form-row>
            <!-- 고객이름 -->
            <kw-form-item :label="$t('MSG_TXT_CST_NAME')">
              <p>{{ assignInfo.pspcCstKnm }}</p>
            </kw-form-item>
            <!-- 고객코드 -->
            <kw-form-item :label="$t('MSG_TXT_CST_CD')">
              <p>{{ assignInfo.pspcCstCnslId }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 휴대전화번호 -->
            <kw-form-item :label="$t('MSG_TXT_MPNO')">
              <p>{{ assignInfo.wireTelNo }}</p>
            </kw-form-item>
            <!-- 전화번호 -->
            <kw-form-item :label="$t('MSG_TXT_TEL_NO')">
              <p>{{ assignInfo.phNo }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 컨택요청일 -->
            <kw-form-item :label="$t('MSG_TXT_CONTACT_REQ_DT')">
              <p>{{ assignInfo.contactDate }}</p>
            </kw-form-item>
            <!-- 요청내용 -->
            <kw-form-item :label="$t('MSG_TXT_REQ_CN')">
              <p>{{ assignInfo.pspcCstRcpCn }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>

        <kw-separator />

        <h3>
          <!-- 배정정보 -->
          {{ $t('MSG_TXT_ASGN_INF') }}
        </h3>
        <kw-form
          :cols="2"
          align-content="left"
          dense
        >
          <kw-form-row>
            <!-- 배정일자 -->
            <kw-form-item :label="$t('MSG_TXT_ASN_DT')">
              <p>{{ assignInfo.ichrAsnFshDt }}</p>
            </kw-form-item>
            <!-- 배정담당자 -->
            <kw-form-item :label="$t('MSG_TXT_ASSIGN_MANAGER')">
              <p>{{ assignInfo.ichrPrtnrNm }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 배정담당자 사번 -->
            <kw-form-item :label="$t('MSG_TXT_ASSIGNER_EP_NO')">
              <p>{{ assignInfo.ichrPrtnrNo }}</p>
            </kw-form-item>
            <!-- 배정컨택 -->
            <kw-form-item :label="$t('MSG_TXT_ASSIGN_CONTACT')">
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

              <!-- <p>계약성공</p> -->
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 비고 -->
            <kw-form-item :label="$t('MSG_TXT_NOTE')">
              <slot v-if="currentJobType === 'ASGN'">
                <kw-form-item :label="$t('MSG_TXT_NOTE')">
                  <kw-input
                    v-model="assignInfo.cnslMoCn"
                    type="textarea"
                    :rows="3"
                    counter
                    maxlength="200"
                  />
                </kw-form-item>
              </slot>
              <slot v-else>
                <p>{{ assignInfo.cnslMoCn }}</p>
              </slot>
            </kw-form-item>
          </kw-form-row>
        </kw-form>

        <kw-separator />
        <h3>
          <!-- 주문정보 -->
          {{ $t('MSG_TXT_ODER_INF') }}
        </h3>
        <kw-form
          :cols="2"
          align-content="left"
          dense
        >
          <kw-form-row>
            <!-- 주문번호 -->
            <kw-form-item :label="$t('MSG_TXT_ORD_NO')">
              <p>{{ assignInfo?.cntrNo }}</p>
            </kw-form-item>
            <!-- 생성일 -->
            <kw-form-item :label="$t('MSG_TXT_CRT_D')">
              <p>{{ assignInfo?.showFstRgstDtm }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 예정일 -->
            <kw-form-item :label="$t('MSG_TXT_DUEDT')">
              <p>{{ assignInfo?.sppDuedt }}</p>
            </kw-form-item>
            <!-- 매출일 -->
            <kw-form-item :label="$t('MSG_TXT_DUEDT')">
              <p>{{ assignInfo?.cntrPdStrtdt }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 제품명 -->
            <kw-form-item :label="$t('MSG_TXT_GOODS_NM')">
              <p>{{ assignInfo?.pdNm }}</p>
            </kw-form-item>
            <!-- 주소 -->
            <kw-form-item :label="$t('MSG_TXT_ADDR')">
              <p>{{ assignInfo?.custAdr }}</p>
            </kw-form-item>
          </kw-form-row>
          <div class="row justify-end items-center pt8">
            <div class="item">
              <slot v-if="isEmpty(assignInfo?.value?.ichrPrtnrNo)">
                <kw-btn
                  :label="$t('MSG_BTN_CANCEL')"
                  class="ml8"
                  @click="onClickCancel"
                />
                <kw-btn
                  primary
                  :label="$t('MSG_BTN_SAVE')"
                  class="ml8"
                  @click="onClickSave"
                />
              </slot>
              <slot v-else>
                <kw-btn
                  :label="$t('MSG_BTN_CONFIRM')"
                  @click="onClickConfirm"
                />
              </slot>
            </div>
          </div>
        </kw-form>
      </div>
    </kw-observer>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil, useGlobal } from 'kw-lib'; // stringUtil , codeUtil
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
// import pdConst from '~sms-common/product/constants/pdConst';
// import { getCodeNames } from '~sms-common/customer/utils/csUtil'; // pageMove

const props = defineProps({
  pspcCstCnslId: { type: String, default: null },
  jobType: { type: String, default: 'RECV' }, // RECV
  fromUi: { type: String, default: null },
});

const { notify } = useGlobal(); // , confirm
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

async function onClickConfirm() {
  await router.close(0, false);
  const targetPage = currentJobType.value === 'RECV' ? '/customer/wwcsb-new-receipt-mgt' : '/customer/wwcsb-new-receipt-mgt';
  await router.push(
    { path: targetPage,
      state: { stateParam: { test: 'teststring' } },
      query: { isSearch: true, fromUi: currentFromUi.value },
    },
  );
}

async function onClickCancel() {
  await router.close(0, false);
  const targetPage = currentJobType.value === 'RECV' ? '/customer/wwcsb-new-receipt-mgt' : '/customer/wwcsb-new-receipt-mgt';
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

  await router.close(0, true);
  const targetPage = currentJobType.value === 'RECV' ? '/customer/wwcsb-new-receipt-mgt' : '/customer/wwcsb-new-receipt-mgt';
  await router.push(
    { path: targetPage,
      state: { stateParam: { test: 'teststring' } },
      query: { isSearch: true, fromUi: currentFromUi.value },
    },
  );
}

async function fetchData() {
  const { pspcCstCnslId } = props;
  currentPspcCstCnslId.value = pspcCstCnslId;

  const res = await dataService.get(`${baseUrl}/assign/${currentPspcCstCnslId.value}`);
  assignInfo.value = res.data;
  assignInfo.value.showFstRgstDtm = dayjs(assignInfo?.value?.fstRgstDtm).format('YYYY-MM-DD');
}

async function initProps() {
  const { pspcCstCnslId, jobType, fromUi } = props;
  currentPspcCstCnslId.value = pspcCstCnslId;
  currentJobType.value = jobType;
  currentFromUi.value = fromUi;

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

/*
  Temporary Test Code
*/
// watch(() => route.query, async (query) => {
//   /*
//     #1. (관리) => 상세 => 수정 => 저장
//     #2. (관리) => 상세 => 수정 => 취소
//     상기 경우 관리(*ListM) 화면으로 Forward
//   */
//   console.log(query);
//   // if (isEmpty(query)) await pageMove(pdConst.MATERIAL_LIST_PAGE, true, router, { isSearch: false });
// }, { immediate: true });

</script>
<style scoped></style>
