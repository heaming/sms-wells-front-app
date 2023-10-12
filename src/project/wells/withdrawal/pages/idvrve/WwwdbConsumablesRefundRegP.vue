<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDA
2. 프로그램 ID : WwwdbConsumablesRefundRegP - 소모품환불관리 등록 PGE_WDB_00042
3. 작성자 : sonkiseok
4. 작성일 : 2023.04.21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 소모품환불관리 등록
- W-WD-U-0121P01
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <!-- 계약 정보 -->
    <h3>{{ t('MSG_TXT_CNTR_INF') }}</h3>
    <kw-form
      ref="frmCntrRef"
      :cols="2"
    >
      <kw-form-row>
        <!-- 계약상세번호 -->
        <kw-form-item
          required
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
        >
          <zctz-contract-detail-number
            ref="contractNumberRef"
            v-model:cntr-no="contractInfo.cntrNo"
            v-model:cntr-sn="contractInfo.cntrSn"
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
            rules="required"
            @selected="onClickSelectCntrno"
          />
        </kw-form-item>
        <!-- 고객명 -->
        <kw-form-item
          :label="$t('MSG_TXT_CST_NM')"
        >
          <kw-input
            v-model="contractInfo.cstKnm"
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 순번 -->
        <kw-form-item
          :label="$t('MSG_TXT_SN')"
        >
          <kw-input
            v-model="contractInfo.rfndRcpNoSn"
            readonly
          />
        </kw-form-item>
        <!-- 환불가능금액(원) -->
        <kw-form-item
          :label="$t('MSG_TXT_REFUND_AMT') + '(' + t('MSG_TXT_CUR_WON') +')'"
        >
          <kw-input
            v-model="contractInfo.tmp1"
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-action-top class="mt20">
      <template #left>
        <!-- 환불 정보 -->
        <h3>{{ t('MSG_TXT_RFND_INF') }}</h3>
      </template>
      <!-- (단위:원) -->
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_COLON_WON') }}</span>
    </kw-action-top>
    <kw-form
      ref="frmMainRef"
      :cols="2"
    >
      <kw-form-row>
        <!-- 처리일자 -->
        <kw-form-item
          required
          :label="$t('MSG_TXT_PRCSDT')"
        >
          <kw-date-picker
            v-model="saveParams.rfndFshDt"
            :label="$t('MSG_TXT_PRCSDT')"
            rules="required"
          />
        </kw-form-item>
        <!-- 실적일자 -->
        <kw-form-item
          required
          :label="$t('MSG_TXT_PERF_DT')"
        >
          <kw-date-picker
            v-model="saveParams.rfndPerfDt"
            :label="$t('MSG_TXT_PERF_DT')"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 금액 -->
        <kw-form-item
          required
          :label="$t('MSG_TXT_AMT')"
        >
          <kw-input
            v-model="saveParams.pyAmt"
            mask="number"
            maxlength="10"
            align="right"
            rules="required|max:10"
            :label="$t('MSG_TXT_AMT')"
          />
          <kw-btn
            :label="$t('MSG_TXT_ETC_ATAM') + t('MSG_TXT_RGS')"
            padding="12px"
          />
        </kw-form-item>
        <!-- 환불구분 -->
        <kw-form-item
          required
          :label="$t('MSG_TXT_CLSF_REFUND')"
        >
          <kw-select
            v-model="saveParams.rfndDvCd"
            :options="codes.RFND_DV_CD"
            :label="$t('MSG_TXT_CLSF_REFUND')"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 입금종류 -->
        <kw-form-item
          required
          :label="$t('MSG_TXT_DP_KND')"
        >
          <kw-select
            v-model="saveParams.rfndDpKndCd"
            :options="codes.RFND_DP_KND_CD"
            :label="$t('MSG_TXT_DP_KND')"
            rules="required"
          />
        </kw-form-item>
        <!-- 지급구분 -->
        <kw-form-item
          :label="$t('MSG_TXT_DSB_DV')"
          required
        >
          <kw-select
            v-model="paymentCategory"
            :options="customCodes.paymentCategory"
            :label="$t('MSG_TXT_DSB_DV')"
            rules="required"
            @update:model-value="onDisbursementDivideChange"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 카드번호 -->
        <kw-form-item
          :colspan="2"
          :label="$t('MSG_TXT_CARD_NO')"
          :required="paymentCategory === '02' ? 'required' : null"
        >
          <kw-select
            v-model="saveParams.cardRfndFnitCd"
            :rules="paymentCategory === '02' ? 'required' : null"
            :readonly="paymentCategory === '01'"
            :options="cardLists"
            class="w130"
            :label="$t('MSG_TXT_CARD_NO')"
          />
          <kw-select
            v-show="saveParams.cardRfndFnitCd === 'choice' ? true : false"
            v-model="saveParams.cardRfndCrcdnoEncr"
            :rules="paymentCategory === '02' ? 'required' : null"
            :readonly="paymentCategory === '01'"
            :model-value="[]"
            :label="$t('MSG_TXT_CARD_NO')"
          />
          <!-- :options="['선택', '1', '2', '3']" -->
          <kw-input
            v-show="saveParams.cardRfndFnitCd === 'choice' ? false : true"
            v-model="cardInfo.cardRfndCrcdnoEncr1"
            type="number"
            maxlength="4"
            :rules="paymentCategory === '02' ? 'required' : null"
            :readonly="paymentCategory === '01'"
            :label="$t('MSG_TXT_CARD_NO')"
            class="w100"
          />
          <span
            id="cardDash1"
            :style="saveParams.cardRfndFnitCd === 'choice' ? 'display:none' : ''"
          >-</span>

          <kw-input
            v-show="saveParams.cardRfndFnitCd === 'choice' ? false : true"
            v-model="cardInfo.cardRfndCrcdnoEncr2"
            type="number"
            maxlength="4"
            :rules="paymentCategory === '02' ? 'required' : null"
            :readonly="paymentCategory === '01'"
            :label="$t('MSG_TXT_CARD_NO')"
            class="w100"
          />
          <span
            id="cardDash2"
            :style="saveParams.cardRfndFnitCd === 'choice' ? 'display:none' : ''"
          >-</span>

          <kw-input
            v-show="saveParams.cardRfndFnitCd === 'choice' ? false : true"
            v-model="cardInfo.cardRfndCrcdnoEncr3"
            type="number"
            maxlength="4"
            :rules="paymentCategory === '02' ? 'required' : null"
            :readonly="paymentCategory === '01'"
            :label="$t('MSG_TXT_CARD_NO')"
            class="w100"
          />
          <span
            id="cardDash3"
            :style="saveParams.cardRfndFnitCd === 'choice' ? 'display:none' : ''"
          >-</span>

          <kw-input
            v-show="saveParams.cardRfndFnitCd === 'choice' ? false : true"
            v-model="cardInfo.cardRfndCrcdnoEncr4"
            type="number"
            maxlength="4"
            :rules="paymentCategory === '02' ? 'required' : null"
            :readonly="paymentCategory === '01'"
            :label="$t('MSG_TXT_CARD_NO')"
            class="w100"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 승인번호 -->
        <kw-form-item
          :label="$t('MSG_TXT_APR_NO')"
          :required="paymentCategory === '02' ? 'required' : null"
        >
          <kw-input
            v-model="saveParams.cardRfndCrdcdAprno"
            type="number"
            :rules="paymentCategory === '02' ? 'required' : null"
            :readonly="paymentCategory === '01'"
            :label="$t('MSG_TXT_APR_NO')"
          />
        </kw-form-item>
        <!-- 할부개월 -->
        <kw-form-item
          :label="$t('MSG_TXT_ISTM_MCNT')"
          :required="paymentCategory === '02' ? 'required' : null"
        >
          <kw-input
            v-model="saveParams.cardRfndCrdcdIstmMcn"
            type="number"
            :rules="paymentCategory === '02' ? 'required' : null"
            :readonly="paymentCategory === '01'"
            :label="$t('MSG_TXT_ISTM_MCNT')"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 카드주명 -->
        <kw-form-item
          :label="$t('MSG_TXT_CDONR_NM')"
          :required="paymentCategory === '02' ? 'required' : null"
        >
          <kw-input
            v-model="saveParams.cardRfndCrcdonrNm"
            :rules="paymentCategory === '02' ? 'required' : null"
            :readonly="paymentCategory === '01'"
            :label="$t('MSG_TXT_CDONR_NM')"
          />
        </kw-form-item>
        <!-- 카드공제 -->
        <kw-form-item
          :label="$t('MSG_TXT_CARD_DDTN')"
          :required="paymentCategory === '02' ? 'required' : null"
        >
          <kw-input
            v-model="saveParams.cardRfndFee"
            :rules="paymentCategory === '02' ? 'required' : null"
            :readonly="paymentCategory === '01'"
            :label="$t('MSG_TXT_CARD_DDTN')"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 카드공제율 -->
        <kw-form-item
          :label="$t('MSG_TXT_CARD_DDTN_RT')"
          :required="paymentCategory === '02' ? 'required' : null"
        >
          <kw-input
            v-model="saveParams.cardRfndFer"
            :rules="paymentCategory === '02' ? 'required' : null"
            :readonly="paymentCategory === '01'"
            :label="$t('MSG_TXT_CARD_DDTN_RT')"
          />
        </kw-form-item>
        <!-- 실지급액 -->
        <kw-form-item
          :label="$t('MSG_TXT_ACL_DSB_AMT')"
          required
        >
          <kw-input
            v-model="saveParams.rfndDsbAmt"
            :label="$t('MSG_TXT_ACL_DSB_AMT')"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 지연일수 -->
        <kw-form-item
          :label="$t('MSG_TXT_PSP_DC')"
        >
          <kw-input
            v-model="saveParams.rfndPspDc"
          />
        </kw-form-item>
        <!-- 지연이자 -->
        <kw-form-item
          :label="$t('MSG_TXT_PSP_INT')"
        >
          <kw-input
            v-model="saveParams.rfndDsbPspInt"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 손료존재 -->
        <kw-form-item
          required
          :label="$t('MSG_TXT_RNTF_EXST')"
        >
          <kw-select
            v-model="saveParams.rfndRntfExstYn"
            :options="customCodes.rfndRntfExstYn"
            :label="$t('MSG_TXT_RNTF_EXST')"
            rules="required"
          />
        </kw-form-item>
        <!-- 지급유형 -->
        <kw-form-item
          :label="$t('MSG_TXT_PAY_TYPE')"
          required
        >
          <kw-select
            v-model="saveParams.rfndDsbDvCd"
            :options="codes.RFND_DSB_DV_CD"
            :label="$t('MSG_TXT_PAY_TYPE')"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 환불유형 -->
        <kw-form-item
          required
          :label="$t('MSG_TXT_REFUND_TYP')"
        >
          <kw-select
            v-model="saveParams.rfndRsonCd"
            :options="codes.RFND_RSON_CD"
            :label="$t('MSG_TXT_REFUND_TYP')"
            rules="required"
          />
        </kw-form-item>
        <!-- 은행구분 -->
        <kw-form-item
          :label="$t('MSG_TXT_BNK_DV')"
          :required="paymentCategory === '01' ? 'required' : null"
        >
          <kw-select
            v-model="saveParams.cshRfndFnitCd"
            :options="bankLists"
            :rules="paymentCategory === '01' ? 'required' : null"
            :readonly="paymentCategory === '02'"
            :label="$t('MSG_TXT_BNK_DV')"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 계좌번호 -->
        <kw-form-item
          :label="$t('MSG_TXT_AC_NO')"
          :required="paymentCategory === '01' ? 'required' : null"
        >
          <kw-select
            v-model="inputSelect"
            :rules="paymentCategory === '01' ? 'required' : null"
            :readonly="paymentCategory === '02'"
            :options="customCodes.cshRfndAcnoEncr"
            class="w130"
            :label="$t('MSG_TXT_AC_NO')"
          />
          <kw-input
            v-show="inputSelect === '01' ? true : false"
            v-model="saveParams.cshRfndAcnoEncr"
            :rules="paymentCategory === '01' ? 'required' : null"
            :readonly="paymentCategory === '02'"
            :label="$t('MSG_TXT_AC_NO')"
          />
          <kw-select
            v-show="inputSelect === '01' ? false : true"
            :rules="paymentCategory === '01' ? 'required' : null"
            :readonly="paymentCategory === '02'"
            :model-value="[]"
            :options="['선택', '5', '6', '7']"
            :label="$t('MSG_TXT_AC_NO')"
          />
        </kw-form-item>
        <!-- 예금주명 -->
        <kw-form-item
          :label="$t('MSG_TXT_ACHLDR_NM')"
          :required="paymentCategory === '01' ? 'required' : null"
        >
          <kw-input
            v-model="saveParams.cshRfndAcownNm"
            :rules="paymentCategory === '01' ? 'required' : null"
            :readonly="paymentCategory === '02'"
            :label="$t('MSG_TXT_ACHLDR_NM')"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 전금유형 -->
        <kw-form-item
          :label="$t('MSG_TXT_BLTF_TP')"
        >
          <kw-select
            v-model="saveParams.bltfRfndTpCd"
            :options="codes.BLTF_RFND_TP_CD"
          />
        </kw-form-item>
        <!-- 전금고객 -->
        <kw-form-item
          :label="$t('MSG_TXT_BLTF_CST')"
        >
          <kw-input
            v-model="saveParams.bltfOjCntrNoSn"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <template #action>
      <!-- 등록 -->
      <kw-btn
        v-permission:create
        primary
        :label="$t('MSG_BTN_RGST')"
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
import { codeUtil, useDataService, getComponentType, useModal, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const dataService = useDataService();
const { t } = useI18n();
const { ok } = useModal();
const { getters } = useStore();
const userInfo = getters['meta/getUserInfo'];
const { companyCode, employeeIDNumber } = userInfo;
// console.log(userInfo); // employeeIDNumber "9000054" 파트너번호로 추측해서 사용함. 추후 확인 필요.
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const frmMainRef = ref(getComponentType('KwForm'));
const frmCntrRef = ref(getComponentType('KwForm'));
const now = dayjs();
const codes = await codeUtil.getMultiCodes(
  'RFND_DV_CD', // 환불구분
  'RFND_DP_KND_CD', // 입금구분
  'RFND_DSB_DV_CD', // 지급유형. 환불금지급구분코드 : 01.현금환불, 02.카드환불, 03.전금
  'RFND_RSON_CD', // 환불유형
  'BLTF_RFND_TP_CD', // 전금유형
);

// 사용자 정의코드
const customCodes = {
  // 지급구분 : 01.현금, 02.카드
  paymentCategory: [{ codeId: '01', codeName: t('현금') }, { codeId: '02', codeName: t('카드') }],
  // 손료존재
  rfndRntfExstYn: [{ codeId: 'Y', codeName: t('Y') }, { codeId: 'N', codeName: t('N') }],
  // 계좌번호 01.직접입력, 02.선택
  cshRfndAcnoEncr: [{ codeId: '01', codeName: t('직접입력') }, { codeId: '02', codeName: t('선택') }],
};

const contractInfo = ref({
  cntrNoSn: '', // 계약상세번호
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  cstKnm: '', // 고객명
  rfndRcpNo: '', // 순번: 환불접수번호 생성 rfndRcpDtlSn
  rfndRcpNoSn: '',
  rfndRcpDtlSn: '', // 환불접수상세번호
  tmp1: '', // 환불가능금액 (확인필요)
});

const paymentCategory = ref({}); // 지급구분

const inputSelect = ref({}); // 계좌번호 입력 선택

// eslint-disable-next-line no-unused-vars
const saveParams = ref({
  kwGrpCoCd: companyCode, // 교원그룹회사코드
  rfndRcpNo: '', // 환불접수번호
  cstNo: '', // 고객번호
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  rveNo: '', // 수납번호
  rfndRcpPrtnrNo: employeeIDNumber, // 환불접수파트너번호 화면에서 입력하는 파트너번호
  rfndPerfDt: now.format('YYYYMMDD'), // 실적일자
  rfndFshDt: now.format('YYYYMMDD'), // 처리일자
  rfndRcpDtlSn: '', // 환불접수상세일련번호
  pyAmt: '', // 금액
  rfndDvCd: '', // 환불구분
  rfndDpKndCd: '', // 입금종류
  cardRfndFnitCd: 'choice', // 카드사코드 (카드선택시)
  cardRfndCrcdnoEncr: '', // 카드번호 (카드선택시)
  cardRfndCrdcdAprno: '', // 승인번호 (카드선택시)
  cardRfndCrdcdIstmMcn: '', // 할부개월(카드 선택시)
  cardRfndCrcdonrNm: '', // 카드주명(카드선택시)
  cardRfndFee: '', // 카드공제
  cardRfndFer: '', // 카드공제율(카드선택시)
  rfndDsbAmt: '', // 실지급액
  rfndPspDc: '', // 지연일수
  rfndDsbPspInt: '', // 지연이자
  rfndRntfExstYn: '', // 손료존재
  rfndDsbDvCd: '', // 지급유형
  rfndRsonCd: '', // 환불유형
  cshRfndFnitCd: 'choice', // 은행구분(현금선택시)
  cshRfndAcnoEncr: '', // 계좌번호(현금선택시)
  cshRfndAcownNm: '', // 예금주명(현금선택시)
  bltfRfndTpCd: '', // 전금유형
  bltfOjCntrNoSn: '', // 전금고객 전금대상계약상세번호
  bltfOjCntrNo: '', // 전금고객 전금대상계약번호
  bltfOjCntrSn: '', // 전금고객 전금대상계약일련번호
});

// 카드, 은행 구분 목록
const cardLists = ref([]);
const bankLists = ref([]);

const cardInfo = ref({
  cardRfndCrcdnoEncr1: '', // 카드번호1
  cardRfndCrcdnoEncr2: '', // 카드번호2
  cardRfndCrcdnoEncr3: '', // 카드번호3
  cardRfndCrcdnoEncr4: '', // 카드번호4
});

// 계약상세번호를 기준으로 고객정보를 조회. 환불접수번호 생성
async function fetchData() {
  const response = await dataService.get('/sms/wells/withdrawal/idvrve/consumables-refunds/contract-info', { params: { cntrNo: contractInfo.value.cntrNo } });
  contractInfo.value.cstKnm = response.data.cstKnm;
  contractInfo.value.rfndRcpNo = response.data.rfndRcpNo;
  contractInfo.value.rfndRcpDtlSn = response.data.rfndRcpDtlSn;
  contractInfo.value.rfndRcpNoSn = `${response.data.rfndRcpNo}-${response.data.rfndRcpDtlSn}`;
  contractInfo.value.tmp1 = response.data.tmp1;

  saveParams.value.cstNo = response.data.cstNo; // 고객번호
  saveParams.value.rveNo = response.data.rveNo; // 수납번호
  saveParams.value.rfndRcpNo = response.data.rfndRcpNo; // 환불접수번호
  saveParams.value.rfndRcpDtlSn = response.data.rfndRcpDtlSn; // 환불접수일련번호
}

// 카드사, 은행 목록
async function cardBank() {
  const commonApiUrl = '/sms/common/common/codes/finance-code';

  const searchBankParams = {
    fnitFeeTpCd: '1',
    vncoDvCd: '003',
  };
  const bank = await dataService.get(`${commonApiUrl}/bank-codes`, { params: searchBankParams });
  bankLists.value = bank.data;

  const searchCardParams = {
    fnitFeeTpCd: '2',
    vncoDvCd: '003',
  };
  const card = await dataService.get(`${commonApiUrl}/bureau-codes`, { params: searchCardParams });
  cardLists.value = card.data;
}

// 계약상세번호 조회// 검색조건 : 계약상세번호
async function onClickSelectCntrno(cntrNo, cntrSn) {
  saveParams.value.cntrNo = cntrNo;
  saveParams.value.cntrSn = cntrSn;
  contractInfo.value.cntrNo = cntrNo;
  contractInfo.value.cntrSn = cntrSn;
  contractInfo.value.cntrNoSn = `${cntrNo}-${cntrSn}`;
  await fetchData();
}

async function onDisbursementDivideChange() {
  saveParams.value.cardRfndFnitCd = '';
  saveParams.value.cardRfndCrcdnoEncr = '';
  saveParams.value.cardRfndCrdcdAprno = '';
  saveParams.value.cardRfndCrdcdIstmMcn = '';
  saveParams.value.cardRfndCrcdonrNm = '';
  saveParams.value.cardRfndFee = '';
  saveParams.value.cardRfndFer = '';
  saveParams.value.cshRfndFnitCd = '';
  saveParams.value.cshRfndAcnoEncr = '';
  saveParams.value.cshRfndAcownNm = '';
  frmMainRef.value.init();
}

onMounted(async () => {
  await cardBank();
});

// 등록
async function onClickSave() {
  if (!await frmCntrRef.value.validate()) { return; }
  if (await frmMainRef.value.alertIfIsNotModified()) { return; }
  if (!await frmMainRef.value.validate()) { return; }

  const data = saveParams.value;

  await dataService.post('/sms/wells/withdrawal/idvrve/consumables-refunds', data);

  ok();
}

</script>
