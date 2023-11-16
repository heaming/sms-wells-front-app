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
      ref="frmMainRef"
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
          <kw-form-item
            :label="$t('MSG_TXT_DSB_D')"
            required
          >
            <kw-date-picker
              v-model="infomation.rfndDsbDt"
              rules="required"
              :label="$t('MSG_TXT_DSB_D')"
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
          <kw-form-item
            :label="$t('MSG_TXT_DSB_DV')"
            required
          >
            <kw-select
              v-model="infomation.rfndDsbDvCd"
              :options="cashCardRefund"
              rules="required"
              :label="$t('MSG_TXT_DSB_DV')"
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
              :label="$t('MSG_TXT_DDCTAM')"
              :rules="{min_value: 0 , max_value:infomation.bilAmt}"
              @update:model-value="onChnageRfndDtnAmt"
            />
          </kw-form-item>
          <!-- 실지급액 -->
          <kw-form-item
            :label="$t('MSG_TXT_ACL_DSB_AMT')"
            required
          >
            <kw-input
              v-model="infomation.rfndAkAmt"
              mask="number"
              maxlength="10"
              align="right"
              disable
              :label="$t('MSG_TXT_ACL_DSB_AMT')"
              :rules="{min_value: 1 , max_value:infomation.bilAmt}"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 카드번호 -->
          <kw-form-item
            :label="$t('MSG_TXT_CARD_NO')"
            required
          >
            <kw-field-wrap>
              <kw-input
                v-model="infomation.cardRfndCrcdnoEncr1"
                mask="####"
                maxlength="4"
                rules="required|digits:4"
                :label="$t('MSG_TXT_CARD_NO')"
                @update:model-value="onChangeNextInput1"
              />
              <span>-</span>
              <kw-input
                ref="cardNo2Ref"
                v-model="infomation.cardRfndCrcdnoEncr2"
                mask="####"
                maxlength="4"
                rules="required|digits:4"
                :label="$t('MSG_TXT_CARD_NO')"
                @update:model-value="onChangeNextInput2"
              />
              <span>-</span>
              <kw-input
                ref="cardNo3Ref"
                v-model="infomation.cardRfndCrcdnoEncr3"
                mask="####"
                maxlength="4"
                rules="required|digits:4"
                :label="$t('MSG_TXT_CARD_NO')"
                @update:model-value="onChangeNextInput3"
              />
              <span>-</span>
              <kw-input
                ref="cardNo4Ref"
                v-model="infomation.cardRfndCrcdnoEncr4"
                mask="####"
                maxlength="4"
                rules="required|min:3|max:4"
                :label="$t('MSG_TXT_CARD_NO')"
              />
            </kw-field-wrap>
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
              v-model="infomation.cardAprno"
              disable
            />
          </kw-form-item>
          <!-- 수수료액 -->
          <kw-form-item :label="$t('MSG_TXT_FEE_AMT')">
            <kw-input
              v-model="infomation.cardRfndFee"
              mask="number"
              maxlength="10"
              align="right"
              disable
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 지급은행 -->
          <kw-form-item
            :label="$t('MSG_TXT_DSB_BNK')"
            required
          >
            <kw-select
              v-model="infomation.cshRfndFnitCd"
              :options="codes.CSH_RFND_FNIT_CD"
              :disable="infomation.rfndDsbDvCd !== '01'"
              :rules="{required : infomation.rfndDsbDvCd === '01'}"
              :label="$t('MSG_TXT_DSB_BNK')"
            />
          </kw-form-item>
          <!-- 계좌번호 -->
          <kw-form-item
            :label="$t('MSG_TXT_AC_NO')"
            required
          >
            <kw-input
              v-model.trim="infomation.cshRfndAcnoEncr"
              regex="num"
              :maxlength="30"
              :disable="infomation.rfndDsbDvCd !== '01'"
              :rules="{required : infomation.rfndDsbDvCd === '01'}"
              :label="$t('MSG_TXT_AC_NO')"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 예금주 -->
          <kw-form-item
            :label="$t('MSG_TXT_ACHLDR')"
            required
          >
            <kw-input
              v-model.trim="infomation.cstNm"
              disable
              :label="$t('MSG_TXT_ACHLDR')"
              :rules="{required : infomation.rfndDsbDvCd === '01'}"
            />
            <kw-btn
              :label="$t('MSG_BTN_VALID_CHK')"
              :disable="infomation.rfndDsbDvCd !== '01'"
              @click="onClickCheckAccountHolder"
            />
            <!-- 유효성 체크 -->
          </kw-form-item>
          <!-- 환불사유 -->
          <kw-form-item
            :label="$t('MSG_TXT_RFND_RSON')"
            required
          >
            <kw-select
              v-model="infomation.rfndRsonCd"
              :options="codes.RFND_RSON_CD"
              rules="required"
              :label="$t('MSG_TXT_RFND_RSON')"
              @update:model-value="onChagneFrndRsondCd"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 환불사유내용(기타일경우 입력) -->
          <kw-form-item
            :label="$t('MSG_TXT_RFND_CN')"
            required
          >
            <kw-input
              v-model.trim="infomation.rfndRsonCn"
              :disable="infomation.rfndRsonCd != '56'"
              :maxlength="130"
              :rules="{required : infomation.rfndRsonCd === '56'}"
              :label="$t('MSG_TXT_RFND_CN')"
            />
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
          <kw-form-item
            :label="$t('MSG_TXT_DSB_D')"
            required
          >
            <kw-date-picker
              v-model="infomation.rfndDsbDt"
              rules="required"
              :label="$t('MSG_TXT_DSB_D')"
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
          <kw-form-item
            :label="$t('MSG_TXT_DSB_DV')"
            required
          >
            <kw-select
              v-model="infomation.rfndDsbDvCd"
              :options="cashRefund"
              rules="required"
              :label="$t('MSG_TXT_DSB_DV')"
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
              :label="$t('MSG_TXT_DDCTAM')"
              :rules="{min_value: 0 , max_value:infomation.bilAmt}"
              @update:model-value="onChnageRfndDtnAmt"
            />
          </kw-form-item>
          <!-- 실지급액 -->
          <kw-form-item
            :label="$t('MSG_TXT_ACL_DSB_AMT')"
            required
          >
            <kw-input
              v-model="infomation.rfndAkAmt"
              mask="number"
              maxlength="10"
              align="right"
              disable
              :label="$t('MSG_TXT_ACL_DSB_AMT')"
              :rules="{min_value: 1 , max_value:infomation.bilAmt}"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 지급은행 -->
          <kw-form-item
            :label="$t('MSG_TXT_DSB_BNK')"
            required
          >
            <kw-select
              v-model="infomation.cshRfndFnitCd"
              :options="codes.CSH_RFND_FNIT_CD"
              rules="required"
              :label="$t('MSG_TXT_DSB_BNK')"
            />
          </kw-form-item>
          <!-- 계좌번호 -->
          <kw-form-item
            :label="$t('MSG_TXT_AC_NO')"
            required
          >
            <kw-input
              v-model.trim="infomation.cshRfndAcnoEncr"
              regex="num"
              :maxlength="30"
              rules="required"
              :label="$t('MSG_TXT_AC_NO')"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 예금주 -->
          <kw-form-item
            :label="$t('MSG_TXT_ACHLDR')"
            required
          >
            <kw-input
              v-model.trim="infomation.cstNm"
              disable
              :label="$t('MSG_TXT_ACHLDR')"
              rules="required"
            />
            <kw-btn
              :label="$t('MSG_BTN_VALID_CHK')"
              :disable="infomation.rfndDsbDvCd !== '01'"
              @click="onClickCheckAccountHolder"
            />
            <!-- 유효성 체크 -->
          </kw-form-item>
          <!-- 환불사유 -->
          <kw-form-item
            :label="$t('MSG_TXT_RFND_RSON')"
            required
          >
            <kw-select
              v-model="infomation.rfndRsonCd"
              :options="codes.RFND_RSON_CD"
              rules="required"
              :label="$t('MSG_TXT_RFND_RSON')"
              @update:model-value="onChagneFrndRsondCd"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 환불사유내용(기타일경우 입력) -->
          <kw-form-item
            :label="$t('MSG_TXT_RFND_CN')"
            required
          >
            <kw-input
              v-model.trim="infomation.rfndRsonCn"
              :disable="infomation.rfndRsonCd != '56'"
              :maxlength="130"
              :label="$t('MSG_TXT_RFND_CN')"
              :rules="{required : infomation.rfndRsonCd === '56'}"
            />
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
          <kw-form-item
            :label="$t('MSG_TXT_DSB_D')"
            required
          >
            <kw-date-picker
              v-model="infomation.rfndDsbDt"
              rules="required"
              :label="$t('MSG_TXT_DSB_D')"
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
          <kw-form-item
            :label="$t('MSG_TXT_DSB_DV')"
            required
          >
            <kw-select
              v-model="infomation.rfndDsbDvCd"
              :options="cardRefund"
              rules="required"
              :label="$t('MSG_TXT_DSB_DV')"
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
              :label="$t('MSG_TXT_DDCTAM')"
              :rules="{min_value: 0 , max_value:infomation.bilAmt}"
              @update:model-value="onChnageRfndDtnAmt"
            />
          </kw-form-item>
          <!-- 실지급액 -->
          <kw-form-item
            :label="$t('MSG_TXT_ACL_DSB_AMT')"
            required
          >
            <kw-input
              v-model="infomation.rfndAkAmt"
              mask="number"
              maxlength="10"
              align="right"
              disable
              :label="$t('MSG_TXT_ACL_DSB_AMT')"
              :rules="{min_value: 1 , max_value:infomation.bilAmt}"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 카드번호 -->
          <kw-form-item
            :label="$t('MSG_TXT_CARD_NO')"
            required
          >
            <kw-field-wrap>
              <kw-input
                v-model="infomation.cardRfndCrcdnoEncr1"
                mask="####"
                maxlength="4"
                rules="required|digits:4"
                :label="$t('MSG_TXT_CARD_NO')"
                @update:model-value="onChangeNextInput1"
              />
              <span>-</span>
              <kw-input
                ref="cardNo2Ref"
                v-model="infomation.cardRfndCrcdnoEncr2"
                mask="####"
                maxlength="4"
                rules="required|digits:4"
                :label="$t('MSG_TXT_CARD_NO')"
                @update:model-value="onChangeNextInput2"
              />
              <span>-</span>
              <kw-input
                ref="cardNo3Ref"
                v-model="infomation.cardRfndCrcdnoEncr3"
                mask="####"
                maxlength="4"
                rules="required|digits:4"
                :label="$t('MSG_TXT_CARD_NO')"
                @update:model-value="onChangeNextInput3"
              />
              <span>-</span>
              <kw-input
                ref="cardNo4Ref"
                v-model="infomation.cardRfndCrcdnoEncr4"
                mask="####"
                maxlength="4"
                rules="required|min:3|max:4"
                :label="$t('MSG_TXT_CARD_NO')"
              />
            </kw-field-wrap>
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
              v-model="infomation.cardAprno"
              disable
            />
          </kw-form-item>
          <!-- 환불사유 -->
          <kw-form-item
            :label="$t('MSG_TXT_RFND_RSON')"
            required
          >
            <kw-select
              v-model="infomation.rfndRsonCd"
              :options="codes.RFND_RSON_CD"
              rules="required"
              :label="$t('MSG_TXT_RFND_RSON')"
              @update:model-value="onChagneFrndRsondCd"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 환불사유내용(기타일경우 입력) -->
          <kw-form-item
            :label="$t('MSG_TXT_RFND_CN')"
            required
          >
            <kw-input
              v-model.trim="infomation.rfndRsonCn"
              :disable="infomation.rfndRsonCd != '56'"
              :maxlength="130"
              :label="$t('MSG_TXT_RFND_CN')"
              :rules="{required : infomation.rfndRsonCd === '56'}"
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
        :disable="btnDisable"
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
import { defineGrid, codeUtil, gridUtil, getComponentType, useGlobal, useDataService, stringUtil, useModal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const now = dayjs();
const { notify, confirm } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();

const { ok } = useModal();

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
const frmMainRef = ref(getComponentType('KwForm'));
const cardNo2Ref = ref(getComponentType('KwInput'));
const cardNo3Ref = ref(getComponentType('KwInput'));
const cardNo4Ref = ref(getComponentType('KwInput'));
const grdParam = ref();
const btnDisable = ref(false);
const stlmDvCdCheck = [
  { codeId: '01',
    codeName: `${t('MSG_TXT_CASH_REFND')}(${t('MSG_TXT_CARD')})`, // 현금환불(카드)
  },
  { codeId: '02',
    codeName: `${t('MSG_TXT_CASH_REFND')}(${t('MSG_TXT_ADP_BIL')},${t('MSG_TXT_VT_AC')})`, // 현금환불(합산청구, 가상계좌)
  },
  { codeId: '03',
    codeName: t('MSG_TXT_CARD_REFUND'), // 카드환불
  },
];

// 결제구분이 신용카드인 경우
const stlmDvCdOption1 = props.checkItem[0].adpBilOjYn === 'Y' ? stlmDvCdCheck.filter((p1) => ['02', '03'].includes(p1.codeId)) : stlmDvCdCheck.filter((p1) => ['01', '03'].includes(p1.codeId));
// 결제구분이 신용카드 그외 일경우
const stlmDvCdOption2 = stlmDvCdCheck.filter((p1) => ['02'].includes(p1.codeId));

const searchParams = ref({
  stlmDvCd: props.checkItem[0].stlmDvCd === '02' ? '01' : '02',
});

const cashRefund = codes.RFND_DSB_DV_CD.filter((v) => v.codeId === '01'); // 현금 환불(합산청구, 가상계좌)
const cardRefund = codes.RFND_DSB_DV_CD.filter((v) => v.codeId === '02'); // 카드 환불
const cashCardRefund = codes.RFND_DSB_DV_CD.filter((v) => v.codeId === '01'); // 현금 환불 (카드)

// 카드 목록
const codeList = ref({
  financeCode: [],
});

const infomation = ref({
  rfndRqdt: now.format('YYYYMMDD'), // 환불일자
  rfndDsbDt: now.add('3', 'day').format('YYYYMMDD'), // 지급일
  bilAmt: props.checkItem[0]?.bilAmt, // 결제금액
  rfndDsbDvCd: searchParams.stlmDvCd === '03' ? '02' : '01', // 지급구분 RFND_DSB_DV_CD
  rfndDdtnAmt: 0, // 공제금액
  rfndAkAmt: props.checkItem[0]?.bilAmt, // 실지급액
  cardRfndCrcdnoEncr: props.checkItem[0].crcdnoEncr, // 카드번호
  cardRfndFnitCd: props.checkItem[0]?.iscmpCd, // 카드구분
  cardRfndFee: 0, // 수수료액
  cshRfndFnitCd: '', // 지급은행
  cshRfndAcnoEncr: '', // 계좌번호
  rfndRsonCd: '', // 환불사유코드
  rfndRsonCn: '', // 환불사유내영(기타일경우 입력)
  cardAprno: props.checkItem[0]?.cardAprno, // 승인번호
  cstNm: '', // 예금주
  dpSn: props.checkItem[0]?.dpSn, // 입금일련번호

  cardRfndCrcdnoEncr1: props.checkItem[0].crcdnoEncr?.substring(0, 4), // 카드번호1
  cardRfndCrcdnoEncr2: props.checkItem[0].crcdnoEncr?.substring(4, 8), // 카드번호2
  cardRfndCrcdnoEncr3: props.checkItem[0].crcdnoEncr?.substring(8, 12), // 카드번호3
  cardRfndCrcdnoEncr4: props.checkItem[0].crcdnoEncr?.substring(12, 16), // 카드번호4
});

// 환불사유 수정 이벤트
async function onChagneFrndRsondCd(val) {
  if (val !== '56') infomation.value.rfndRsonCn = '';
}

// 환불구분코드 변경 이벤트
async function onChangeStlmDvCd(val) {
  // 현금환불(카드)
  if (val === '01') {
    infomation.value.rfndDsbDvCd = '01'; // 지급구분(현금환불)
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

// 공제급액 수정시 실지금액 계산
async function onChnageRfndDtnAmt(val) {
  if (val > infomation.value.bilAmt) {
    infomation.value.rfndAkAmt = 0;
    return;
  }
  const bilAmt = infomation.value.bilAmt - val;
  let feeAmt = 0;
  if (searchParams.value.stlmDvCd === '01') {
    const fee = 2.5;
    feeAmt = Math.floor(Number(bilAmt) * (Number(fee) / 100));
  }
  infomation.value.cardRfndFee = feeAmt;
  infomation.value.rfndAkAmt = bilAmt;
}

// 지급 구분 변경 이벤트
async function onChnageRfndDsbDvCd(val) {
  if (val !== '01') {
    infomation.value.cshRfndFnitCd = '';
    infomation.value.cshRfndAcnoEncr = '';
    infomation.value.cstNm = '';
    infomation.value.cardRfndFee = 0;
  }
  if (val === '01') {
    onChnageRfndDtnAmt(infomation.value.rfndDdtnAmt);
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
    if (isEmpty(acnoData.data.ACHLDR_NM) && isEmpty(acnoData.data.ACHLDR_NM?.trim())) {
      notify(acnoData.data.ERR_CN);
      infomation.value.cstNm = '테스트예금주';
    } else {
      infomation.value.cstNm = acnoData.data.ACHLDR_NM;
    }
  }
}

// 카드번호 4자리 입력 후 자동 넘김 처리
async function onChangeNextInput1(val) {
  if (val.length >= 4) {
    cardNo2Ref.value.focus();
  }
}

// 카드번호 4자리 입력 후 자동 넘김 처리
async function onChangeNextInput2(val) {
  if (val.length >= 4) {
    cardNo3Ref.value.focus();
  }
}

// 카드번호 4자리 입력 후 자동 넘김 처리
async function onChangeNextInput3(val) {
  if (val.length >= 4) {
    cardNo4Ref.value.focus();
  }
}

// 저장 버튼 클릭 이벤트
async function onClickSave() {
  if (!await frmMainRef.value.validate()) { return; }
  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }

  const params = {
    // 환불 서비스 정보
    serviceInfo: {
      csBilNo: props.checkItem[0].csBilNo, // 비용청구번호
      cstSvAsnNo: props.checkItem[0].cstSvAsnNo, // 고객서비스배정번호
      cntrNo: props.checkItem[0].cntrNo, // 계약번호
      cntrSn: props.checkItem[0].cntrSn, // 계약일련번호
      cstNo: props.checkItem[0].cstNo, // 계약일련번호
      dpDtm: props.checkItem[0].dpDtm, // 결제일
      itgDpNo: props.checkItem[0].itgDpNo, // 통합입금번호
      cardAprno: props.checkItem[0].cardAprno, // 승인번호
      dpSn: props.checkItem[0]?.dpSn, // 입금일련번호
    },
    // 서비스 환불 정보
    serviceRefundInfo: {
      cshRfndDvCd: searchParams.stlmDvCd === '01' ? '03' : '02', /* 현금환불구분코드 */
      bilAmt: infomation.value.bilAmt, /* 청구금액 */
      rfndRqdt: infomation.value.rfndRqdt, /* 환불일자 */
      rfndDsbDt: infomation.value.rfndDsbDt, /* 지급일자 */
      rfndDsbDvCd: infomation.value.rfndDsbDvCd, /* 지급구분 */
      rfndDdtnAmt: infomation.value.rfndDdtnAmt, /* 공제금액 */
      rfndAkAmt: infomation.value.rfndAkAmt, /* 실지급액 */
      cardRfndCrcdnoEncr: infomation.value.cardRfndCrcdnoEncr, /* 카드번호 */
      cardRfndFnitCd: infomation.value.cardRfndFnitCd, /* 카드구분 */
      rfndCshAkSumAmt: infomation.value.rfndDsbDvCd === '01' ? infomation.value.rfndAkAmt : 0, /* 현금환불금액 */
      rfndCardAkSumAmt: infomation.value.rfndDsbDvCd === '02' ? infomation.value.rfndAkAmt : 0, /* 카드환불금액 */
      rfndBltfAkSumAmt: infomation.value.rfndDsbDvCd === '03' ? infomation.value.rfndAkAmt : 0, /* 전금환불금액 */
      crdcdFeeSumAmt: infomation.value.cardRfndFee, /* 수수료액 */
      crdcdFeeFer: '2.5', /* 수수료율 */
      cshRfndFnitCd: infomation.value.cshRfndFnitCd, /* 지급은행 */
      cshRfndAcnoEncr: infomation.value.cshRfndAcnoEncr, /* 계좌번호 */
      rfndRsonCd: infomation.value.rfndRsonCd, /* 환불사유코드 */
      rfndRsonCn: infomation.value.rfndRsonCn, /* 환불사유내영(기타일경우 입력) */
      cstNm: infomation.value.cstNm, /* 예금주 */
      crdcdExpdtYm: props.checkItem[0].crdcdExpdtYm, /* 신용카드유효기간 */
      istmMcn: props.checkItem[0].istmMcn, /* 할부기간 */
      crcdonrNm: props.checkItem[0].crcdonrNm, /* 카드주명 */
    },
  };

  const res = await dataService.post('/sms/wells/withdrawal/idvrve/service-refund', params);
  if (!isEmpty(res.data.data) && !isEmpty(res.data.data.rfndRcpNo)) {
    notify(t('MSG_ALT_EXCUTE_IT', [t('MSG_BTN_APLC_RFND')]));
    ok();
    btnDisable.value = true;
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
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'csBilNo' }, /* 비용청구번호 */
    { fieldName: 'cstSvAsnNo' }, /* 고객서비스배정번호 */
    { fieldName: 'cntrNo' }, /* 계약번호 */
    { fieldName: 'cntrSn' }, /* 계약일련번호 */
    { fieldName: 'cntrCstNo' }, /* 고객명 */
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
