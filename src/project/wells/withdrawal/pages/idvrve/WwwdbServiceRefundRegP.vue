<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID :  WwwdbServiceRefundRegP - 서비스 환불 등록 W-WD-U-0183P01
3. 작성자 : sonkiseok
4. 작성일 : 2023.04.14
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
    <div class="row ">
      <div class="col">
        <h3 class="mt0 mb20">
          <!-- 설치정보 -->
          {{ $t('MSG_TXT_INST_INF') }}
        </h3>
        <kw-form
          dense
          :cols="1"
        >
          <kw-form-row>
            <!-- 고객번호 -->
            <kw-form-item
              :label="$t('MSG_TXT_CST_NO')"
            >
              <p>{{ infomation.cstNo }}</p>
            </kw-form-item>
          </kw-form-row>
          <!-- 고객성명 -->
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_CUST_STMT')">
              <p>{{ infomation.cstKnm }}</p>
            </kw-form-item>
          </kw-form-row>
          <!-- 전화번호 -->
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_TEL_NO')">
              <p>{{ infomation.tno }}</p>
            </kw-form-item>
          </kw-form-row>
          <!-- 휴대전화번호 -->
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_MPNO')">
              <p>{{ infomation.mpno }}</p>
            </kw-form-item>
          </kw-form-row>
          <!-- 설치주소 -->
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_INST_ADDR')">
              <p>{{ infomation.adrId }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
      </div>
      <div class="col ml80">
        <h3 class="mt0 mb20">
          <!-- 상품정보 -->
          {{ $t('MSG_TXT_PD_INF') }}
        </h3>
        <kw-form
          dense
          :cols="1"
        >
          <!-- 계약상품 -->
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_CNTR_PD')">
              <p>{{ infomation.pdNm }}</p>
            </kw-form-item>
          </kw-form-row>
          <!-- 유형용도 -->
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_TP_USWY')">
              <p>{{ infomation.sellTpCd }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 계약일자 -->
            <kw-form-item :label="$t('MSG_TXT_CNTR_DATE')">
              <p>{{ infomation.cntrCnfmDtm }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 설치일자 -->
            <kw-form-item :label="$t('MSG_TXT_IST_DT')">
              <p>{{ infomation.istDt }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 무상A/S개월수 / 일자 -->
            <kw-form-item :label="($t('MSG_TXT_FRISU_SV_MCN') + ' / ' + $t('MSG_TXT_DT'))">
              <!-- <kw-form-item :label="$t('MSG_TXT_FRISU_SV_MCN') / $t('MSG_TXT_DT')"> -->
              <p>{{ infomation.frisuAsPtrmN }} / {{ infomation.tmp1 }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 무상B/S개월수 / 일자 -->
            <kw-form-item :label="($t('MSG_TXT_FRISU_B_SV_MCN') + ' / ' + $t('MSG_TXT_DT'))">
              <p>{{ infomation.frisuBfsvcPtrmN }} / {{ infomation.tmp2 }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
      </div>
    </div>
    <kw-separator />
    <h3 class="mb20">
      <!-- 환불정보 -->
      {{ $t('MSG_TXT_RFND_INF') }}
    </h3>
    <kw-form
      :cols="2"
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
            v-model="infomation.dpAmt"
            disable
          />
        </kw-form-item>
        <!-- 전표 -->
        <kw-form-item :label="$t('MSG_TXT_SLIP')">
          <!-- <kw-select
            v-model="infomation.rfndSlpno"
            :options="customCodes.RFND_SLPNO"
          /> -->
          <!-- 미발행 -->
          <kw-input
            v-model="infomation.rfndSlpno"
            :option="infomation.rfndSlpno !== '' ? infomation.rfndSlpno : t('MSG_TXT_N_PBL')"
            disable
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 공제금액 -->
        <kw-form-item :label="$t('MSG_TXT_DDCTAM')">
          <kw-input
            v-model="infomation.rfndDdtnAmt"
            type="number"
          />
        </kw-form-item>
        <!-- 실지급액 -->
        <kw-form-item :label="$t('MSG_TXT_ACL_DSB_AMT')">
          <kw-input
            v-model="infomation.rfndAkAmt"
            type="number"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 지급구분 -->
        <kw-form-item :label="$t('MSG_TXT_DSB_DV')">
          <kw-select
            v-model="infomation.rfndDsbDvCd"
            :options="codes.RFND_DSB_DV_CD.filter((v) => v.codeId === '01' || v.codeId === '02')"
          />
        </kw-form-item>
        <!-- 카드구분 -->
        <kw-form-item :label="$t('MSG_TXT_CARD_DV')">
          <kw-select
            v-model="infomation.cardRfndFnitCd"
            :options="cardLists"
            option-label="fnitNm"
            option-value="fnitCd"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 카드주명 -->
        <kw-form-item :label="$t('MSG_TXT_CDONR_NM')">
          <kw-input
            v-model="infomation.cardRfndCrcdonrNm"
          />
        </kw-form-item>
        <!-- 수수료액 -->
        <kw-form-item :label="$t('MSG_TXT_FEE_AMT')">
          <kw-input
            v-model="infomation.cardRfndFee"
            type="number"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 카드번호 -->
        <kw-form-item :label="$t('MSG_TXT_CARD_NO')">
          <kw-input
            v-model="cardInfo.cardRfndCrcdnoEncr1"
            type="number"
            maxlength="4"
          />
          <span>-</span>
          <kw-input
            v-model="cardInfo.cardRfndCrcdnoEncr2"
            type="number"
            maxlength="4"
          />
          <span>-</span>
          <kw-input
            v-model="cardInfo.cardRfndCrcdnoEncr3"
            type="number"
            maxlength="4"
          />
          <span>-</span>
          <kw-input
            v-model="cardInfo.cardRfndCrcdnoEncr4"
            type="number"
            maxlength="4"
          />
        </kw-form-item>
        <!-- 승인번호 -->
        <kw-form-item :label="$t('MSG_TXT_APR_NO')">
          <kw-input
            v-model="infomation.cardRfndCrdcdAprno"
            type="number"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 유효기간(MM/YY) -->
        <kw-form-item :label="($t('MSG_TXT_VALID_PERIOD') + $t('(MM/YY)'))">
          <kw-input
            v-model="cardInfo.tmp3_1"
            type="number"
            maxlength="2"
          />
          <span />
          <kw-input
            v-model="cardInfo.tmp3_2"
            type="number"
            maxlength="2"
          />
        </kw-form-item>
        <!-- 할부개월수 -->
        <kw-form-item :label="$t('MSG_TXT_ISTM_MCN')">
          <kw-input
            v-model="infomation.cardRfndCrdcdIstmMcn"
            type="number"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 지급은행 -->
        <kw-form-item :label="$t('MSG_TXT_DSB_BNK')">
          <!-- :model-value="[]"
          :options="['A', 'B', 'C', 'D']" -->
          <kw-select
            v-model="infomation.cshRfndFnitCd"
            :options="bankLists"
            option-label="fnitNm"
            option-value="fnitCd"
          />
        </kw-form-item>
        <!-- 계좌번호 -->
        <kw-form-item :label="$t('MSG_TXT_AC_NO')">
          <kw-input
            v-model="infomation.cshRfndAcnoEncr"
            type="number"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 환불사유 -->
        <kw-form-item :label="$t('MSG_TXT_RFND_RSON')">
          <kw-input
            v-model="infomation.rfndRsonCn"
          />
        </kw-form-item>
      </kw-form-row>
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
import { codeUtil, useDataService, useModal, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';

const { ok } = useModal();
const now = dayjs();
const { notify } = useGlobal();
const { t } = useI18n();

// 테스트 데이터 W20226001983-1
const props = defineProps({
  cntrNo: { type: String, required: false, default: '' },
  cntrSn: { type: String, required: false, default: '' },
  // cntrNoSn: { type: String, required: false, default: '' },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const codes = await codeUtil.getMultiCodes(
  'RFND_DSB_DV_CD', // 환불지급구분코드 01.현금환불, 02.카드환불, 03.전금
);

const dataService = useDataService();
const searchParams = ref({
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
  // cntrNoSn: props.cntrNoSn,
});

// 카드, 은행 구분 목록
const cardLists = ref([]);
const bankLists = ref([]);

const infomation = ref({
  cstNo: '', // 고객번호
  cstKnm: '', // 고객성명
  cralLocaraTno: '', // 휴대전화번호앞자리
  mexnoEncr: '', // 휴대전화번호중간자리
  cralIdvTno: '', // 휴대전화번호끝자리
  mpno: '', // 휴대전화번호
  tno: '', // 전화번호
  adrId: '', // 설치주소
  pdNm: '', // 계약상품
  sellTpCd: '', // 유형용도
  cntrCnfmDtm: '', // 계약일자
  istDt: '', // 설치일자
  frisuAsPtrmN: '', // 무상A/S개월수
  frisuBfsvcPtrmN: '', // 무상B/S 개월수
  tmp1: '', // 무상A/S일자
  tmp2: '', // 무상B/S일자

  rfndRqdt: now.format('YYYYMMDD'), // 환불일자
  rfndDsbDt: now.format('YYYYMMDD'), // 지급일
  rfndDsbDvCd: '', // 지급구분 RFND_DSB_DV_CD
  rfndSlpno: '', // 전표. 데이터가 있으면 환불전표번호, 데이터가 없으면 미발행 표시. 콤보박스에서 인풋박스로 변경.
  dpAmt: '', // 결제금액
  rfndDdtnAmt: 0, // 공제금액
  rfndAkAmt: '', // 실지급액
  cardRfndFnitCd: [], // 카드구분
  cardRfndCrcdonrNm: '', // 카드주명
  cardRfndFee: '', // 수수료액
  cardRfndCrcdnoEncr: '', // 카드번호
  cardRfndCrdcdAprno: '', // 승인번호
  tmp3: '', // 유효기간(년월)(RRRD.환불카드유효기간필드추가필요)
  cshRfndFnitCd: [], // 지급은행
  cshRfndAcnoEncr: '', // 계좌번호
  cardRfndCrdcdIstmMcn: '', // 할부(개월)
  rfndRsonCn: '', // 환불사유

});

const cardInfo = ref({
  cardRfndCrcdnoEncr1: '', // 카드번호1
  cardRfndCrcdnoEncr2: '', // 카드번호2
  cardRfndCrcdnoEncr3: '', // 카드번호3
  cardRfndCrcdnoEncr4: '', // 카드번호4

  tmp3_1: '', // 유효월 MM
  tmp3_2: '', // 유효년 YY
});

async function fetchData() {
  const card = await dataService.get('/sms/wells/withdrawal/idvrve/service-refund/card');
  cardLists.value = card.data;

  const bank = await dataService.get('/sms/wells/withdrawal/idvrve/service-refund/bank');
  bankLists.value = bank.data;

  const response = await dataService.get('/sms/wells/withdrawal/idvrve/service-refund', { params: searchParams.value });
  infomation.value = response.data;

  if (infomation.value.cardRfndCrcdnoEncr !== null) {
    cardInfo.value.cardRfndCrcdnoEncr1 = infomation.value.cardRfndCrcdnoEncr.substring(0, 4); // 카드번호1
    cardInfo.value.cardRfndCrcdnoEncr2 = infomation.value.cardRfndCrcdnoEncr.substring(4, 8); // 카드번호2
    cardInfo.value.cardRfndCrcdnoEncr3 = infomation.value.cardRfndCrcdnoEncr.substring(8, 12); // 카드번호3
    cardInfo.value.cardRfndCrcdnoEncr4 = infomation.value.cardRfndCrcdnoEncr.substring(12, 16); // 카드번호4
  }
  if (infomation.value.tmp3 !== null) {
    cardInfo.value.tmp3_1 = infomation.value.tmp3.substring(0, 3); // 유효기간 MM
    cardInfo.value.tmp3_2 = infomation.value.tmp3.substring(3, 5); // 유효기간 YY
  }
}

async function onClickSave() {
  // eslint-disable-next-line max-len
  infomation.value.cardRfndCrcdnoEncr = cardInfo.value.cardRfndCrcdnoEncr1 + cardInfo.value.cardRfndCrcdnoEncr2 + cardInfo.value.cardRfndCrcdnoEncr3 + cardInfo.value.cardRfndCrcdnoEncr4;
  infomation.value.tmp3 = cardInfo.value.tmp3_1 + cardInfo.value.tmp3_2;

  // eslint-disable-next-line max-len
  await dataService.post('/sms/wells/withdrawal/idvrve/service-refund', { ...searchParams.value, ...infomation.value });
  ok();
  notify(t('MSG_ALT_SAVE_DATA'));
}

onMounted(async () => {
  await fetchData();
});

</script>
