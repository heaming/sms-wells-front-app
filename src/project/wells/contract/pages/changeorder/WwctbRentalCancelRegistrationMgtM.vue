<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbRentalCancelRegistrationMgtM - 취소등록 > 렌탈 > 4.매출사항/5.취소사항
3. 작성자 : younuk.choi
4. 작성일 : 2023.07.04
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 취소등록 메뉴에서 include 하는 페이지
- TODO : OZ 레포트 / 분실손료 계산 / 복구클릭
****************************************************************************************************
--->
<template>
  <kw-list
    separator
    item-padding="20px 0"
  >
    <!-- 4. 매출사항 --------------------------------------------------------------------------->
    <kw-expansion-item
      padding-target="header"
      expansion-icon-align="center"
      expand-icon-class="kw-font-pt24"
      default-opened
    >
      <template #header>
        <kw-item-section>
          <kw-item-label>
            <span class="text-weight-medium kw-font-pt18">4. {{ t('MSG_TXT_SL_ARTC') }}</span>
          </kw-item-label>
        </kw-item-section>
      </template>
      <div class="pb20">
        <kw-form cols="4">
          <kw-form-row>
            <!-- row1 정상매출 -->
            <kw-form-item :label="$t('MSG_TXT_NOM_SL')">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.nomSlAmt??'') }}</p>
            </kw-form-item>
            <!-- row1 렌탈일수 -->
            <kw-form-item :label="$t('MSG_TXT_RENTAL_DC')">
              <p>{{ cancelDetail.rentalDc }}</p>
            </kw-form-item>
            <!-- row1 교체일자 -->
            <kw-form-item :label="$t('MSG_TXT_CHNG_DT')">
              <p>{{ stringUtil.getDateFormat(cancelDetail.chgDt) }}</p>
            </kw-form-item>
            <!-- row1 추가매출  -->
            <kw-form-item :label="$t('MSG_TXT_SPMT_SL')">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.spmtSlAmt??'') }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!-- row2 정상할인 -->
            <kw-form-item :label="$t('MSG_TXT_NOM_DSC')">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.nomDscAmt??'') }}</p>
            </kw-form-item>
            <!-- row2 취소조정 -->
            <kw-form-item :label="$t('MSG_TXT_CAN_CTR')">
              <kw-input
                v-model="cancelDetail.canCtrAmt"
                regex="num"
                maxlength="10"
                align="right"
                @update:model-value="onChangeCanCtr"
              />
            </kw-form-item>
            <!--row2 부가서비스  -->
            <kw-form-item :label="$t('MSG_TXT_ADN_SV')">
              <p>{{ cancelDetail.addSrv }}</p>
            </kw-form-item>
            <!-- row2 추가할인 -->
            <kw-form-item :label="$t('MSG_TXT_SPMT_DSC')">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.spmtDscAmt??'') }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator v-if="isChageCanCtr" />
          <kw-form-row v-if="isChageCanCtr">
            <!-- row2-1 조정요청자사번 -->
            <kw-form-item :label="$t('MSG_TXT_CTR')+$t('MSG_TXT_REQ_USER')+$t('MSG_TXT_EPNO')">
              <kw-input
                v-model="cancelDetail.ctrEpNo"
                regex="num"
                maxlength="10"
              />
            </kw-form-item>
            <!-- row2-1 조정사유 -->
            <kw-form-item
              :label="$t('MSG_TXT_CTR_RSON')"
              colspan="3"
            >
              <kw-input
                v-model="cancelDetail.ctrReson"
                maxlength="100"
              />
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!-- row3 매출조정 -->
            <kw-form-item :label="$t('MSG_TXT_SL_CTR')">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.slCtrAmt??'') }}</p>
            </kw-form-item>
            <!-- row3 매출금액 -->
            <kw-form-item
              :label="$t('MSG_TXT_SL_AMT')"
              class="kw-fc--accent"
            >
              <p class="kw-fc--accent">
                {{ stringUtil.getNumberWithComma(cancelDetail.thmSlSumAmt??'') }}
              </p>
            </kw-form-item>
            <!-- row3 매출VAT -->
            <kw-form-item :label="$t('MSG_TXT_SL_VAT')">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.slSumVat??'') }}</p>
            </kw-form-item>
            <!-- row3 매출누계 -->
            <kw-form-item :label="$t('MSG_TXT_SL_AGG_AMT')">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.slAggAmt??'') }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!-- row4 당월원리금 -->
            <kw-form-item :label="$t('MSG_TXT_THM')+$t('MSG_TXT_PAIAM')">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.thmPaiamAmt??'') }}</p>
            </kw-form-item>
            <!-- row4 당월 서비스 -->
            <kw-form-item
              :label="$t('MSG_TXT_THM')+$t('MSG_TXT_SERVICE')"
              colspan="2"
            >
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.thmSrvAmt??'') }}</p>
            </kw-form-item>
            <!-- row4 매출잔액 -->
            <kw-form-item :label="$t('MSG_TXT_SL_BLAM')">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.eotPcamBlam??'') }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!-- row5 연체가산금 -->
            <kw-form-item :label="$t('MSG_TXT_DLQ_ADAMT')">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.btdDlqAddAmt??'') }}</p>
            </kw-form-item>
            <!-- row5 入 / 出 -->
            <kw-form-item label="入 / 出">
              <p>
                {{ stringUtil.getNumberWithComma(cancelDetail.thmDlqAddDpSumAmt??'') }}/
                {{ stringUtil.getNumberWithComma(cancelDetail.thmDlqAddRfndSumAmt??'') }}
              </p>
            </kw-form-item>
            <!-- row5 가산금조정 -->
            <kw-form-item :label="$t('MSG_TXT_ADD_AM')+$t('MSG_TXT_CTR')">
              <kw-input
                v-model="cancelDetail.addCtrAmt"
                regex="num"
                maxlength="10"
              />
            </kw-form-item>
            <!-- row5 미수금(未) -->
            <kw-form-item :label="$t('MSG_TXT_UCAM')+'(未)'">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail. eotDlqAmt??'') }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
      </div>
    </kw-expansion-item>
  </kw-list>

  <!-- 5. 취소사항 -->
  <kw-action-top
    class="mt30"
  >
    <template #left>
      <h3>5. {{ t('MSG_TXT_CAN_ARTC') }}</h3>
    </template>
    <kw-btn
      :label="$t('MSG_TXT_CAN_ARTC')+' '+$t('MSG_TXT_SRCH')"
      negative
      dense
      @click="onClickSearchCancel"
    />
  </kw-action-top>
  <kw-form
    ref="frmMainRental"
    cols="3"
  >
    <kw-form-row>
      <!-- row1 요청일자 -->
      <kw-form-item
        :label="$t('MSG_TXT_AK_DT')"
        required
      >
        <kw-date-picker
          v-model="searchDetail.reqDt"
          :label="$t('MSG_TXT_AK_DT')"
          rules="required"
        />
      </kw-form-item>
      <!-- row1 취소일자 -->
      <kw-form-item
        :label="$t('MSG_TXT_CANC_DT')"
        required
      >
        <kw-date-picker />
      </kw-form-item>
      <!-- row1 사용일수/등급 -->
      <kw-form-item :label="$t('MSG_TXT_USE_DAY')+'/'+$t('MSG_TXT_GD')">
        <p>184 DAY (R급)</p>
      </kw-form-item>
    </kw-form-row>
    <kw-separator />
    <kw-form-row>
      <!-- row2 이월선납잔액 -->
      <kw-form-item :label="$t('MSG_TXT_CRDOVR')+$t('MSG_TXT_PRM_BLAM')">
        <p>0</p>
      </kw-form-item>
      <!-- row2 이월선수잔액 -->
      <kw-form-item :label="$t('MSG_TXT_CRDOVR')+$t('MSG_TXT_PRPD_BLAM')">
        <p>-</p>
      </kw-form-item>
      <!-- row2 선수총액 -->
      <kw-form-item :label="$t('MSG_TXT_PRPD_TAM')">
        <p>1</p>
      </kw-form-item>
    </kw-form-row>
    <kw-separator />
    <kw-form-row>
      <!-- row3 매출입금 -->
      <kw-form-item :label="$t('MSG_TXT_SL_DP_AMT')">
        <p>0</p>
      </kw-form-item>
      <!-- row3 입금누계 -->
      <kw-form-item :label="$t('MSG_TXT_DP_AGG_AMT')">
        <p>20,900</p>
      </kw-form-item>
      <!-- row3 미수총액 -->
      <kw-form-item :label="$t('MSG_TXT_UC_TAM')">
        <p>20,900</p>
      </kw-form-item>
    </kw-form-row>
    <kw-separator />
    <kw-form-row>
      <!-- row4 선납환불 -->
      <kw-form-item :label="$t('MSG_TXT_PRM_RFND_AMT')">
        <p>-</p>
      </kw-form-item>
      <!-- row4 선수환불 -->
      <kw-form-item :label="$t('MSG_TXT_PRPD_RFND')">
        <p>-</p>
      </kw-form-item>
      <!-- row4 등록반환 -->
      <kw-form-item :label="$t('MSG_TXT_RGS')+$t('MSG_TXT_RTRN')">
        <p>-</p>
      </kw-form-item>
    </kw-form-row>
    <kw-separator />
    <kw-form-row>
      <!-- row5 원위약-렌탈잔여 -->
      <kw-form-item :label="$t('MSG_TXT_CUR_WON')+$t('MSG_TXT_BOR')+'-'+$t('MSG_TXT_RENTAL')+$t('MSG_TXT_REST')">
        <p>-</p>
      </kw-form-item>
      <!-- row5 원위약-등록비 -->
      <kw-form-item :label="$t('MSG_TXT_CUR_WON')+$t('MSG_TXT_BOR')+'-'+$t('MSG_TXT_RGST_FEE')">
        <p>0</p>
      </kw-form-item>
      <!-- row5 원위약-할인금액 -->
      <kw-form-item :label="$t('MSG_TXT_CUR_WON')+$t('MSG_TXT_BOR')+'-'+$t('MSG_TXT_DSC_AMT')">
        <p>0</p>
      </kw-form-item>
    </kw-form-row>
    <kw-separator />
    <kw-form-row>
      <!-- row6 원위약-소모품 -->
      <kw-form-item :label="$t('MSG_TXT_CUR_WON')+$t('MSG_TXT_BOR')+'-'+$t('MSG_TXT_CSMB')">
        <p>-</p>
      </kw-form-item>
      <!-- row6 원위약-철거비 -->
      <kw-form-item :label="$t('MSG_TXT_CUR_WON')+$t('MSG_TXT_BOR')+'-'+$t('MSG_TXT_REQD_CS')">
        <p>0</p>
      </kw-form-item>
      <!-- row6 포인트 환불 -->
      <kw-form-item :label="$t('MSG_TXT_P')+' '+$t('MSG_TXT_RFND')">
        <p>0</p>
      </kw-form-item>
    </kw-form-row>
    <kw-separator />
    <kw-form-row>
      <!-- 위약금액 -->
      <kw-form-item :label="$t('MSG_TXT_CCAM')">
        <kw-input
          v-model="searchDetail.amt1"
          regex="num"
          maxlength="10"
          align="right"
          readonly
        />
        <kw-btn
          :label="$t('MSG_TXT_CCAM_IZ_DOC')+' '+$t('MSG_BTN_VIEW')"
          secondary
          class="px12"
          @click="onClickCcamView"
        />
      </kw-form-item>
      <!-- 분실손료 -->
      <kw-form-item :label="$t('MSG_TXT_PD_LENT_LOST_LOG')">
        <kw-btn
          :label="$t('MSG_TXT_CALCULATE')"
          secondary
          class="px12 mr8"
          @click="onClickCalculate"
        />
        <kw-input
          v-model="searchDetail.amt2"
          regex="num"
          maxlength="10"
          align="right"
        />
      </kw-form-item>
      <!-- 소모품비 -->
      <kw-form-item :label="$t('MSG_TXT_CSMB_CS')">
        <kw-input
          v-model="searchDetail.amt3"
          regex="num"
          maxlength="10"
          align="right"
          readonly
        />
      </kw-form-item>
    </kw-form-row>
    <kw-separator />
    <kw-form-row>
      <!-- 위약면책 -->
      <kw-form-item :label="$t('MSG_TXT_BOR')+$t('MSG_TXT_EXEMPTION')">
        <kw-select
          v-model="searchDetail.sel1"
          :options="codes.CCAM_EXMPT_DV_CD"
          first-option="select"
        />
        <kw-input
          v-model="searchDetail.sel1Text"
          class="w100"
          regex="num"
          maxlength="2"
          @update:model-value="onChangeTextforSelect('sel1')"
        />
      </kw-form-item>
      <!-- 취소유형 -->
      <kw-form-item :label="$t('MSG_TXT_CNCL_TP')">
        <kw-select
          v-model="searchDetail.sel2"
          :options="codes.CMN_STAT_CH_RSON_CD"
          first-option="select"
        />
        <kw-input
          v-model="searchDetail.sel2Text"
          class="w100"
          regex="num"
          maxlength="2"
          @update:model-value="onChangeTextforSelect('sel2')"
        />
      </kw-form-item>
      <!-- 철거 -->
      <kw-form-item :label="$t('MSG_TXT_REQD')">
        <kw-input
          v-model="searchDetail.amt4"
          regex="num"
          maxlength="10"
          align="right"
          readonly
        />
      </kw-form-item>
    </kw-form-row>
    <kw-separator />
    <kw-form-row>
      <!-- 소모/철거/복구 -->
      <kw-form-item
        :label="$t('MSG_TXT_CONSUMPTION')+'/'+$t('MSG_TXT_REQD')+'/'+$t('MSG_TXT_RECOVERY')"
        colspan="3"
      >
        <kw-select
          v-model="searchDetail.sel3"
          :option="codes.CSMB_CS_EXMPT_DV_CD"
          first-option="select"
        />
        <kw-input
          v-model="searchDetail.sel3Text"
          class="w100"
          regex="num"
          maxlength="2"
          @update:model-value="onChangeTextforSelect('sel3')"
        />
        <kw-select
          v-model="searchDetail.sel4"
          :options="codes.REQD_CS_EXMPT_DV_CD"
          first-option="select"
        />
        <kw-input
          v-model="searchDetail.sel4Text"
          class="w100"
          regex="num"
          maxlength="2"
          @update:model-value="onChangeTextforSelect('sel4')"
        />
        <kw-select />
        <kw-btn
          :label="$t('MSG_TXT_RECOVERY')"
          secondary
          class="mx12"
          @click="onClickRecovery"
        />
      </kw-form-item>
    </kw-form-row>
    <kw-separator />
    <kw-form-row>
      <!-- 환불총액 -->
      <kw-form-item :label="$t('MSG_TXT_RFND_TOT_AMT')">
        <p>-389,080</p>
      </kw-form-item>
      <kw-form-item />
      <!-- 다건 정보 입력 -->
      <kw-form-item :label="$t('MSG_TXT_MULTI')+' '+$t('MSG_TXT_INF')+' '+$t('MSG_TXT_INP')">
        <kw-checkbox
          v-model="cancelDetail.bulkApplyYN"
          :label="$t('MSG_TXT_CANCEL_BULK_APPLY')"
          :false-value="N"
          :true-value="Y"
        />
      </kw-form-item>
    </kw-form-row>
  </kw-form>

  <div class="button-set--bottom">
    <div class="button-set--bottom-right">
      <!-- BTN Variation #1 : 취소등록 이후 or 이미 취소가 등록된 버튼 배열
      <kw-btn
        label="가상계좌발급"
        class="ml8"
      />
      <kw-btn
        label="카드승인"
        class="ml8"
      />
      <kw-btn
        label="철거접수"
        class="ml8"
      />
      <kw-btn
        label="환불접수"
        class="ml8"
      />
      <kw-btn
        label="렌탈계약해지확인서 보기"
        class="ml8"
      />
      <kw-btn
        label="삭제"
        class="ml8"
      />
      -->
      <!-- // BTN Variation #1 : 취소등록 이후 or 이미 취소가 등록된 버튼 배열  -->
      <kw-btn
        :label="$t('MSG_BTN_CANCEL')"
        class="ml8"
        @click="onClickCancel"
      />
      <kw-btn
        :label="$t('MSG_BTN_SAVE')"
        class="ml8"
        primary
        @click="onClickSave"
      />
    </div>
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, notify, stringUtil } from 'kw-lib';

const { t } = useI18n();
const frmMainRental = ref(getComponentType('KwForm'));

const codes = await codeUtil.getMultiCodes(
  'CCAM_EXMPT_DV_CD', // 위약금면책구분코드
  'CMN_STAT_CH_RSON_CD', // 공통상태변경사유코드
  'CSMB_CS_EXMPT_DV_CD', // 소모품비용면책구분코드
  'REQD_CS_EXMPT_DV_CD', // 철거비용면책구분코드
);

const props = defineProps({
  childDetail: { type: Object, required: true },
});
const emits = defineEmits([
  'savedetail',
  'removedetail',
]);
const cancelDetail = ref(props.childDetail);

const searchDetail = ref({});
const isChageCanCtr = ref(false);

codes.CCAM_EXMPT_DV_CD.forEach((e) => { e.codeName = `(${e.codeId})${e.codeName}`; });
codes.CMN_STAT_CH_RSON_CD.forEach((e) => { e.codeName = `(${e.codeId})${e.codeName}`; });
codes.CSMB_CS_EXMPT_DV_CD.forEach((e) => { e.codeName = `(${e.codeId})${e.codeName}`; });
codes.REQD_CS_EXMPT_DV_CD.forEach((e) => { e.codeName = `(${e.codeId})${e.codeName}`; });
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// 5. 취소사항 > 취소사항 조회 클릭
async function onClickSearchCancel() {
  if (!await frmMainRental.value.validate()) { return; }

  notify('TODO : 취소조회 ');
}

function onClickSave() {
  searchDetail.value.sellTpCd = props.childDetail.sellTpCd;
  emits('savedetail', searchDetail.value);
}

function onClickCancel() {
  emits('removedetail');
}

// 취소조정 추가 데이터 입력 여부 설정
function onChangeCanCtr(val) {
  isChageCanCtr.value = (val !== '0');
}

// 위약금 내역서 보기
function onClickCcamView() {
  // 위약금 내역서 보기 : 해당 계약번호에 대한 '위약금 내역' OZ뷰 팝업을 호출 합니다.
  notify('TODO : 위약금 내역서 OZ뷰 호출 ');
}

// 분실손료 계산
function onClickCalculate() {
  // 분실손료 : '계산'버튼을 클릭하면 입력란에 계산된 금액이 표시 됩니
  notify('TODO : 분실손료 계산 ');
}

// SELECTBOX 를 선택하기 위한 TEXT 입력 이벤트
function onChangeTextforSelect(div) {
  if (div === 'sel1') {
    searchDetail.value.sel1 = searchDetail.value.sel1Text;
  } else if (div === 'sel2') {
    searchDetail.value.sel2 = searchDetail.value.sel2Text;
  } else if (div === 'sel3') {
    searchDetail.value.sel3 = searchDetail.value.sel3Text;
  } else if (div === 'sel4') {
    searchDetail.value.sel4 = searchDetail.value.sel4Text;
  }
}

function onClickRecovery() {
  notify('TODO : [복구] 정의 되지 않음 ');
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
</script>

<style scoped lang="scss">
.kw-form-row + .kw-separator {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
</style>
