<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID :  WwwdbServiceRefundRegP - 서비스 환불 등록 W-WD-U-0183P01
3. 작성자 : dagyeong.hong
4. 작성일 : 2023.11.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- PGE_WDB_00075
- 서비스 센터 지점에서 환불 등록 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <h3 class="mb20">
      <!-- 고객 정보 -->
      {{ $t('MSG_TXT_CST_INF') }}
    </h3>
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :visible-rows="1"
      @init="initGrid"
    />
    <kw-separator />
    <kw-form
      :cols="1"
    >
      <kw-form-row>
        <kw-form-item
          :label="t('MSG_TXT_CLSF_REFUND')"
        >
          <!-- 환불구분 -->
          <kw-option-group
            v-model="searchParams.stlmDvCd"
            dense
            type="radio"
            :options="props.checkItem[0].stlmDvCd ==='02'? stlmDvCdOption1:stlmDvCdOption2"
            @change="onChangeStlmDvCd"
          />
          <!-- @change="onChangeDv" -->
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />
    <h3 class="mb20">
      <!-- 환불정보 -->
      {{ $t('MSG_TXT_RFND_INF') }}
    </h3>
    <kw-form
      :cols="2"
    >
      <!-- 현금환불(카드) -->

      <div
        v-if="searchParams.stlmDvCd === '01'"
      >
        <kw-form-row>
          <!-- 환불일자 -->
          <kw-form-item :label="$t('MSG_TXT_RFND_DT')">
            <kw-date-picker
              v-model="infomation.rfndRqdt"
              disable
            />
          </kw-form-item>
          <!-- 지급일 -->
          <kw-form-item :label="$t('MSG_TXT_DSB_D')">
            <kw-date-picker
              v-model="infomation.rfndDsbDt"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 결제금액 -->
          <kw-form-item :label="$t('MSG_TXT_STLM_AMT')">
            <kw-input
              v-model="infomation.bilAmt"
              disable
              align="right"
              mask="number"
            />
          </kw-form-item>
          <!-- 지급구분 -->
          <kw-form-item :label="$t('MSG_TXT_DSB_DV')">
            <kw-select
              v-model="infomation.rfndDsbDvCd"
              :options="cashCardRefund"
              @update:model-value="onChnageRfndDsbDvCd"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 공제금액 -->
          <kw-form-item :label="$t('MSG_TXT_DDCTAM')">
            <kw-input
              v-model="infomation.rfndDdtnAmt"
              mask="number"
              maxlength="10"
              align="right"
            />
          </kw-form-item>
          <!-- 실지급액 -->
          <kw-form-item :label="$t('MSG_TXT_ACL_DSB_AMT')">
            <kw-input
              v-model="infomation.rfndAkAmt"
              mask="number"
              maxlength="10"
              align="right"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 카드번호 -->
          <kw-form-item :label="$t('MSG_TXT_CARD_NO')">
            <kw-input
              v-model="infomation.cardRfndCrcdnoEncr1"
              disable
              type="number"
              maxlength="4"
            />
            <span>-</span>
            <kw-input
              v-model="infomation.cardRfndCrcdnoEncr2"
              disable
              type="number"
              maxlength="4"
            />
            <span>-</span>
            <kw-input
              v-model="infomation.cardRfndCrcdnoEncr3"
              disable
              type="number"
              maxlength="4"
            />
            <span>-</span>
            <kw-input
              v-model="infomation.cardRfndCrcdnoEncr4"
              disable
              type="number"
              maxlength="4"
            />
          </kw-form-item>
          <!-- 카드구분 -->
          <kw-form-item :label="$t('MSG_TXT_CARD_DV')">
            <kw-select
              ref="financeCdRef"
              v-model="infomation.cardRfndFnitCd"
              :options="codeList.financeCode"
              disable
              :label="$t('MSG_TXT_CARD_DV')"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 승인번호 -->
          <kw-form-item :label="$t('MSG_TXT_APR_NO')">
            <kw-input
              v-model="infomation.cardRfndFnitCd"
              disable
              type="number"
            />
          </kw-form-item>
          <!-- 수수료액 -->
          <kw-form-item :label="$t('MSG_TXT_FEE_AMT')">
            <kw-input
              v-model="infomation.cardRfndFee"
              mask="number"
              maxlength="10"
              align="right"
              :disable="infomation.rfndDsbDvCd === '01'"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 지급은행 -->
          <kw-form-item :label="$t('MSG_TXT_DSB_BNK')">
            <kw-select
              v-model="infomation.cshRfndFnitCd"
              :options="codes.CSH_RFND_FNIT_CD"
              :disable="infomation.rfndDsbDvCd !== '01'"
            />
          </kw-form-item>
          <!-- 계좌번호 -->
          <kw-form-item :label="$t('MSG_TXT_AC_NO')">
            <kw-input
              v-model.trim="infomation.cshRfndAcnoEncr"
              regex="num"
              :maxlength="30"
              :disable="infomation.rfndDsbDvCd !== '01'"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 환불사유 -->
          <kw-form-item :label="$t('MSG_TXT_RFND_RSON')">
            <kw-select
              v-model="infomation.rfndRsonCd"
              :options="codes.RFND_RSON_CD"
              @update:model-value="onChagneFrndRsondCd"
            />
          </kw-form-item>
          <!-- 환불사유내용(기타일경우 입력) -->
          <kw-form-item :label="$t('MSG_TXT_RFND_CN')">
            <kw-input
              v-model.trim="infomation.rfndRsonCn"
              :disable="infomation.rfndRsonCd != '56'"
              :maxlength="130"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 예금주 -->
          <kw-form-item :label="$t('MSG_TXT_ACHLDR')">
            <kw-input
              v-model.trim="infomation.cstNm"
              disable
            />
            <kw-btn
              :label="$t('MSG_BTN_VALID_CHK')"
              :disable="infomation.rfndDsbDvCd !== '01'"
              @click="onClickCheckAccountHolder"
            />
            <!-- 유효성 체크 -->
          </kw-form-item>
        </kw-form-row>
      </div>

      <!-- 현금환불 (합산청구, 가상계좌) -->
      <div
        v-if="searchParams.stlmDvCd === '02'"
      >
        <kw-form-row>
          <!-- 환불일자 -->
          <kw-form-item :label="$t('MSG_TXT_RFND_DT')">
            <kw-date-picker
              v-model="infomation.rfndRqdt"
              disable
            />
          </kw-form-item>
          <!-- 지급일 -->
          <kw-form-item :label="$t('MSG_TXT_DSB_D')">
            <kw-date-picker
              v-model="infomation.rfndDsbDt"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 결제금액 -->
          <kw-form-item :label="$t('MSG_TXT_STLM_AMT')">
            <kw-input
              v-model="infomation.bilAmt"
              disable
              align="right"
              type="number"
            />
          </kw-form-item>
          <!-- 지급구분 -->
          <kw-form-item :label="$t('MSG_TXT_DSB_DV')">
            <kw-select
              v-model="infomation.rfndDsbDvCd"
              :options="cashRefund"
              @update:model-value="onChnageRfndDsbDvCd"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 공제금액 -->
          <kw-form-item :label="$t('MSG_TXT_DDCTAM')">
            <kw-input
              v-model="infomation.rfndDdtnAmt"
              mask="number"
              maxlength="10"
              align="right"
            />
          </kw-form-item>
          <!-- 실지급액 -->
          <kw-form-item :label="$t('MSG_TXT_ACL_DSB_AMT')">
            <kw-input
              v-model="infomation.rfndAkAmt"
              mask="number"
              maxlength="10"
              align="right"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 지급은행 -->
          <kw-form-item :label="$t('MSG_TXT_DSB_BNK')">
            <kw-select
              v-model="infomation.cshRfndFnitCd"
              :options="codes.CSH_RFND_FNIT_CD"
            />
          </kw-form-item>
          <!-- 계좌번호 -->
          <kw-form-item :label="$t('MSG_TXT_AC_NO')">
            <kw-input
              v-model.trim="infomation.cshRfndAcnoEncr"
              regex="num"
              :maxlength="30"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 환불사유 -->
          <kw-form-item :label="$t('MSG_TXT_RFND_RSON')">
            <kw-select
              v-model="infomation.rfndRsonCd"
              :options="codes.RFND_RSON_CD"
              @update:model-value="onChagneFrndRsondCd"
            />
          </kw-form-item>
          <!-- 환불사유내용(기타일경우 입력) -->
          <kw-form-item :label="$t('MSG_TXT_RFND_CN')">
            <kw-input
              v-model.trim="infomation.rfndRsonCn"
              :disable="infomation.rfndRsonCd != '56'"
              :maxlength="130"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 예금주 -->
          <kw-form-item :label="$t('MSG_TXT_ACHLDR')">
            <kw-input
              v-model.trim="infomation.cstNm"
              disable
            />
            <kw-btn
              :label="$t('MSG_BTN_VALID_CHK')"
              :disable="infomation.rfndDsbDvCd !== '01'"
              @click="onClickCheckAccountHolder"
            />
            <!-- 유효성 체크 -->
          </kw-form-item>
        </kw-form-row>
      </div>

      <!-- 카드 환불  -->
      <div
        v-if="searchParams.stlmDvCd === '03'"
      >
        <kw-form-row>
          <!-- 환불일자 -->
          <kw-form-item :label="$t('MSG_TXT_RFND_DT')">
            <kw-date-picker
              v-model="infomation.rfndRqdt"
              disable
            />
          </kw-form-item>
          <!-- 지급일 -->
          <kw-form-item :label="$t('MSG_TXT_DSB_D')">
            <kw-date-picker
              v-model="infomation.rfndDsbDt"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 결제금액 -->
          <kw-form-item :label="$t('MSG_TXT_STLM_AMT')">
            <kw-input
              v-model="infomation.bilAmt"
              disable
              align="right"
              mask="number"
            />
          </kw-form-item>
          <!-- 지급구분 -->
          <kw-form-item :label="$t('MSG_TXT_DSB_DV')">
            <kw-select
              v-model="infomation.rfndDsbDvCd"
              :options="cardRefund"
              @update:model-value="onChnageRfndDsbDvCd"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 공제금액 -->
          <kw-form-item :label="$t('MSG_TXT_DDCTAM')">
            <kw-input
              v-model="infomation.rfndDdtnAmt"
              mask="number"
              maxlength="10"
              align="right"
            />
          </kw-form-item>
          <!-- 실지급액 -->
          <kw-form-item :label="$t('MSG_TXT_ACL_DSB_AMT')">
            <kw-input
              v-model="infomation.rfndAkAmt"
              mask="number"
              maxlength="10"
              align="right"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 카드번호 -->
          <kw-form-item :label="$t('MSG_TXT_CARD_NO')">
            <kw-input
              v-model="infomation.cardRfndCrcdnoEncr1"
              disable
              type="number"
              maxlength="4"
            />
            <span>-</span>
            <kw-input
              v-model="infomation.cardRfndCrcdnoEncr2"
              disable
              type="number"
              maxlength="4"
            />
            <span>-</span>
            <kw-input
              v-model="infomation.cardRfndCrcdnoEncr3"
              disable
              type="number"
              maxlength="4"
            />
            <span>-</span>
            <kw-input
              v-model="infomation.cardRfndCrcdnoEncr4"
              disable
              type="number"
              maxlength="4"
            />
          </kw-form-item>
          <!-- 카드구분 -->
          <kw-form-item :label="$t('MSG_TXT_CARD_DV')">
            <kw-select
              ref="financeCdRef"
              v-model="infomation.cardRfndFnitCd"
              :options="codeList.financeCode"
              disable
              :label="$t('MSG_TXT_CARD_DV')"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 승인번호 -->
          <kw-form-item :label="$t('MSG_TXT_APR_NO')">
            <kw-input
              v-model="infomation.cardRfndFnitCd"
              disable
              type="number"
            />
          </kw-form-item>
          <!-- 환불사유 -->
          <kw-form-item :label="$t('MSG_TXT_RFND_RSON')">
            <kw-select
              v-model="infomation.rfndRsonCd"
              :options="codes.RFND_RSON_CD"
              @update:model-value="onChagneFrndRsondCd"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 환불사유내용(기타일경우 입력) -->
          <kw-form-item :label="$t('MSG_TXT_RFND_CN')">
            <kw-input
              v-model.trim="infomation.rfndRsonCn"
              :disable="infomation.rfndRsonCd != '56'"
              :maxlength="130"
            />
          </kw-form-item>
        </kw-form-row>
      </div>
    </kw-form>
    <template #action>
      <!-- 저장 -->
      <kw-btn
        primary
        :label="$t('MSG_BTN_SAVE')"
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
import { defineGrid, codeUtil, gridUtil, getComponentType, useGlobal, useDataService } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const now = dayjs();
const { notify } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();

// 테스트 데이터 W20226001983-1
const props = defineProps({
  checkItem: { type: Array, default: () => [] },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'RFND_DSB_DV_CD', // 환불지급구분코드 01.현금환불, 02.카드환불, 03.전금
  'STLM_DV_CD', // 결제구분코드
  'SV_BIZ_DCLSF_CD', // 서비스유형
  'RFND_RSON_CD', /* 환불사유코드 */
  'CSH_RFND_FNIT_CD', // 지급은행
);

const grdMainRef = ref(getComponentType('KwGrid'));
const grdParam = ref();

const stlmDvCdCheck = [
  { codeId: '01',
    codeName: `${t('MSG_TXT_CASH_REFND')}(${t('MSG_TXT_CARD')})`, // 현금환불(카드)
  },
  { codeId: '02',
    codeName: `${t('MSG_TXT_CASH_REFND')}(${t('MSG_TXT_ADP_BIL')},${t('MSG_TXT_VT_AC')})`, // 현금환불(합산청구, 가상계좌)
  },
  { codeId: '03',
    codeName: t('MSG_TXT_CARD_CAN'), // 카드취소
  },
];

// 결제구분이 신용카드인 경우
const stlmDvCdOption1 = stlmDvCdCheck.filter((p1) => ['01', '03', '02'].includes(p1.codeId));
// 결제구분이 신용카드 그외 일경우
const stlmDvCdOption2 = stlmDvCdCheck.filter((p1) => ['02'].includes(p1.codeId));

const searchParams = ref({
  stlmDvCd: props.checkItem[0].stlmDvCd === '02' ? '01' : '02',
});

const cashRefund = codes.RFND_DSB_DV_CD.filter((v) => v.codeId === '01'); // 현금 환불(합산청구, 가상계좌)
const cardRefund = codes.RFND_DSB_DV_CD.filter((v) => v.codeId === '02'); // 카드 환불
const cashCardRefund = codes.RFND_DSB_DV_CD.filter((v) => v.codeId === '01' || v.codeId === '02'); // 현금 환불 (카드)

// 카드 목록
const codeList = ref({
  financeCode: [],
});

const infomation = ref({
  rfndRqdt: now.format('YYYYMMDD'), // 환불일자
  rfndDsbDt: now.format('YYYYMMDD'), // 지급일
  bilAmt: props.checkItem[0]?.bilAmt, // 결제금액
  rfndDsbDvCd: '', // 지급구분 RFND_DSB_DV_CD
  rfndDdtnAmt: 0, // 공제금액
  rfndAkAmt: 0, // 실지급액
  cardRfndCrcdnoEncr: '', // 카드번호
  cardRfndFnitCd: props.checkItem[0]?.iscmpCd, // 카드구분
  cardRfndFee: 0, // 수수료액
  cshRfndFnitCd: '', // 지급은행
  cshRfndAcnoEncr: '', // 계좌번호
  rfndRsonCd: '', // 환불사유코드
  rfndRsonCn: '', // 환불사유내영(기타일경우 입력)
  cardAprno: props.checkItem[0]?.cardAprno, // 승인번호
  cstNm: '', // 예금주

  cardRfndCrcdnoEncr1: props.checkItem[0].crcdnoEncr?.substring(0, 4), // 카드번호1
  cardRfndCrcdnoEncr2: props.checkItem[0].crcdnoEncr?.substring(4, 8), // 카드번호2
  cardRfndCrcdnoEncr3: props.checkItem[0].crcdnoEncr?.substring(8, 12), // 카드번호3
  cardRfndCrcdnoEncr4: props.checkItem[0].crcdnoEncr?.substring(12, 16), // 카드번호4
});

// 지급 구분 변경 이벤트
async function onChnageRfndDsbDvCd(val) {
  if (val !== '01') {
    infomation.value.cshRfndFnitCd = '';
    infomation.value.cshRfndAcnoEncr = '';
    infomation.value.cstNm = '';
  }
  if (val === '01') {
    infomation.value.cardRfndFee = 0;
  }
}

// 환불사유 수정 이벤트
async function onChagneFrndRsondCd(val) {
  if (val !== '56') infomation.value.rfndRsonCn = '';
}

// 환불구분코드 변경 이벤트
async function onChangeStlmDvCd(val) {
  // 현금환불(카드)
  if (val === '01') {
    infomation.value.rfndDsbDvCd = '';
  }
  // 현금환불(합산청구, 가상계좌)
  if (val === '02') {
    infomation.value.cardRfndFee = 0; // 수수료액
    infomation.value.rfndDsbDvCd = '01'; // 지급구분(현금환불)
  }
  // 카드취소
  if (val === '03') {
    infomation.value.cardRfndFee = 0; // 수수료액
    infomation.value.cshRfndFnitCd = ''; // 지급은행
    infomation.value.cshRfndAcnoEncr = ''; // 계좌번호
    infomation.value.cstNm = ''; // 예금주
    infomation.value.rfndDsbDvCd = '02'; // 지급구분(현금환불)
  }
}

// 계좌 유효성 체크 버튼
async function onClickCheckAccountHolder() {
  if (isEmpty(infomation.value.cshRfndFnitCd)) {
    // 은행코드를 확인하십시오
    notify(`환불정보의 ${t('MSG_ALT_BNK_CD_CHECK')}`);
    return false;
  }

  if (isEmpty(infomation.value.cshRfndAcnoEncr)) {
    // 계좌번호를 확인하십시오！
    notify(`환불정보의 ${t('MSG_ALT_AC_NO_CHECK')}`);
    return false;
  }

  const sendData = {
    cntrNo: props.checkItem[0].cntrNo,
    cntrSn: props.checkItem[0].cntrSn,
    bnkCd: infomation.value.cshRfndFnitCd,
    acno: infomation.value.cshRfndAcnoEncr,
    copnDvDrmVal: '000101',
    achldrNm: '예금주',
    copnDvCd: '1',
    sysDvCd: 'W',
    psicId: '',
    deptId: '',
  };

  // eslint-disable-next-line max-len
  const acnoData = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/bank-effective', { params: sendData }).catch(() => {
    infomation.value.cstNm = '테스트예금주';
  });
  if (!isEmpty(acnoData.data)) {
    if (isEmpty(acnoData.data.ACHLDR_NM.trim())) {
      notify(acnoData.data.ERR_CN);
      infomation.value.cstNm = '테스트예금주';
    } else {
      infomation.value.cstNm = acnoData.data.ACHLDR_NM;
    }
  }
}

// 팝업 오픈시 초기 설정
async function initProps() {
  const searchBankParams = {
    fnitFeeTpCd: '2',
  };
  const res = await dataService.get('/sms/common/common/codes/finance-code/bureau-codes', { params: searchBankParams });
  codeList.value.financeCode = res.data;
  const view = grdMainRef.value.getView();
  const data = view.getDataSource();
  data.checkRowStates(false);

  grdParam.value = cloneDeep(props.checkItem);

  data.addRows(grdParam.value);
  data.checkRowStates(true);
}

onMounted(async () => {
  await initProps();
  console.log(props.checkItem[0]);
  // await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, /* 계약번호 */
    { fieldName: 'cntrSn' }, /* 계약일련번호 */
    { fieldName: 'cstKnm' }, /* 고객명 */
    { fieldName: 'cralLocaraTno' }, /* 휴대폰 앞자리 */
    // { fieldName: 'mexnoEncr' }, /* 휴대폰 중간자리 */
    // { fieldName: 'cralIdvTno' }, /* 휴대폰 끝자리 */
    { fieldName: 'ogNm' }, /* 센터정보 */
    { fieldName: 'pdNm' }, /* 상품정보 */
    { fieldName: 'svBizDclsfCd' }, /* 작업유형 */
    { fieldName: 'vstFshDt' }, /* 작업일자 */
    { fieldName: 'dpDtm' }, /* 결제일자 */
    { fieldName: 'stlmDvCd' }, /* 결제유형 */
    { fieldName: 'bilAmt', dataType: 'number' }, /* 결제금액 */
  ];

  const columns = [
    { fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'), // 계약상세번호
      width: '120',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        if (cntrNo != null || cntrSn != null) {
          return `${cntrNo}-${cntrSn}`;
        }
      },
    },
    { fieldName: 'cstKnm',
      header: t('MSG_TXT_CST_NM'), // 고객명
      width: '50',
      styleName: 'text-center',
    },
    { fieldName: 'cralLocaraTno',
      header: t('MSG_TXT_MPNO'), // 휴대전화번호
      width: '100',
      styleName: 'text-center',
      // displayCallback(grid, index) {
      //   const { cralLocaraTno: no1, mexnoEncr: no2, cralIdvTno: no3 } = grid.getValues(index.itemIndex);
      //   if (no1 != null) {
      //     return `${no1}-${no2}-${no3}`;
      //   }
      // },
    },
    { fieldName: 'ogNm',
      header: t('MSG_TXT_CENTER_DIVISION') + t('MSG_TXT_INF'), // 센터정보
      width: '60',
      styleName: 'text-center',
    },
    { fieldName: 'pdNm',
      header: t('MSG_TXT_PD_INF'), // 상품정보 - 상품명
      width: '150',
      styleName: 'text-center',
    },
    { fieldName: 'svBizDclsfCd',
      header: t('MSG_TXT_WORK_TYPE'), // 작업유형 - 서비스 유형
      options: codes.SV_BIZ_DCLSF_CD,
      width: '80',
      styleName: 'text-center',
    },
    { fieldName: 'vstFshDt',
      header: t('MSG_TXT_WK_DT'), // 작업일자 - 설치일자
      datetimeFormat: 'date',
      width: '80',
      styleName: 'text-center',
    },
    { fieldName: 'dpDtm',
      header: t('MSG_TXT_STLM_DTM'), // 결제일자 - 입금일자
      datetimeFormat: 'date',
      width: '80',
      styleName: 'text-center',
    },
    { fieldName: 'stlmDvCd',
      header: t('MSG_TXT_PMT_TYP'), // 결제유형
      options: codes.STLM_DV_CD,
      width: '80',
      styleName: 'text-center',
    },
    { fieldName: 'bilAmt',
      header: t('MSG_TXT_STLM_AMT'), // 결제금액
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});

</script>

<style lang="scss" scoped>
.kw-date-picker {
  min-width: 100%;
}
</style>
