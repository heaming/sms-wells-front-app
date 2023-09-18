<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbRegularShippingCancelRegistrationMgtM - 취소등록 > 정기구매 > 4.매출사항/5.취소사항
3. 작성자 : younuk.choi
4. 작성일 : 2023.07.04
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 취소등록 메뉴에서 include 하는 페이지
- TODO : OZ 레포트 / 분실손료 계산 / 복구클릭
- TODO : 4. 매출사항 bind 제대로 안되어 있음(현재 렌탈 기중)
****************************************************************************************************
--->
<template>
  <kw-list
    separator
    item-padding="20px 0"
  >
    <!-- 2. 계약 정보 --------------------------------------------------------------------------->
    <kw-expansion-item
      padding-target="header"
      expansion-icon-align="center"
      expand-icon-class="kw-font-pt24"
    >
      <template #header>
        <kw-item-section>
          <kw-item-label>
            <span class="text-weight-medium kw-font-pt18">2. {{ t('MSG_TXT_CNTR_INF') }}</span>
          </kw-item-label>
        </kw-item-section>
      </template>
      <div class="pb20">
        <kw-form cols="4">
          <kw-form-row>
            <!--판매구분-->
            <kw-form-item :label="$t('MSG_TXT_SLS_CAT')">
              <p>{{ searchDetail.cntrGbn }}</p>
            </kw-form-item>
            <!--본부장-->
            <kw-form-item :label="$t('MSG_TXT_GNR_MNG')">
              <p>{{ searchDetail.hooPrtnrNo }} / {{ searchDetail.hooPrtnrNm }}</p>
            </kw-form-item>
            <kw-form-item />
            <!--무료-->
            <kw-form-item
              :label="$t('MSG_TXT_FRE')"
              hint="null"
            >
              <p>{{ searchDetail.null }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!--계약일자 -->
            <kw-form-item :label="$t('MSG_TXT_CNTR_DATE')">
              <p>{{ stringUtil.getDateFormat(searchDetail.cntrCnfmDt) }}</p>
            </kw-form-item>
            <!--매출일자 -->
            <kw-form-item :label="$t('MSG_TXT_SL_DT')">
              <p>{{ stringUtil.getDateFormat(searchDetail.cntrPdStrtdt) }}</p>
            </kw-form-item>
            <!--패키지 -->
            <kw-form-item
              :label="$t('MSG_TXT_PKG')"
              colspan="2"
            >
              <p>{{ searchDetail.pdNm }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!--판매금액-->
            <kw-form-item :label="$t('MSG_TXT_SALE_PRICE')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.sellAmt??'') }}</p>
            </kw-form-item>
            <!--추가금액 -->
            <kw-form-item
              :label="$t('MSG_TXT_SPMT_AMT')"
              hint="null"
            >
              <p>{{ stringUtil.getNumberWithComma(searchDetail.null??'') }}</p>
            </kw-form-item>
            <!--할인가-->
            <kw-form-item :label="$t('MSG_TXT_DSC_AMT')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.dscAmt??'') }}</p>
            </kw-form-item>
            <!--계약총액-->
            <kw-form-item :label="$t('MSG_TXT_CNTRCT_AMT')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.cntrTam??'') }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
      </div>
    </kw-expansion-item>

    <!-- 3. 기기정보 --------------------------------------------------------------------------->
    <kw-expansion-item
      padding-target="header"
      expansion-icon-align="center"
      expand-icon-class="kw-font-pt24"
    >
      <template #header>
        <kw-item-section>
          <kw-item-label>
            <span class="text-weight-medium kw-font-pt18">3. {{ t('MSG_TXT_MCHN_INF') }}</span>
          </kw-item-label>
        </kw-item-section>
      </template>
      <div class="pb20">
        <kw-form cols="4">
          <kw-form-row>
            <!--기기정보-->
            <kw-form-item
              :label="$t('MSG_TXT_PD_INF')"
              colspan="4"
            >
              <p>{{ searchDetail.machineNm }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!--추가-->
            <kw-form-item :label="$t('MSG_TXT_ADD')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.addAmt??'') }}</p>
            </kw-form-item>
            <!--렌탈료-->
            <kw-form-item :label="$t('MSG_TXT_RTLFE')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.machineRentalAmt??'') }}</p>
            </kw-form-item>
            <!--원복-->
            <kw-form-item :label="$t('MSG_TXT_RESTORE')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.recoverAmt??'') }}</p>
            </kw-form-item>
            <kw-form-item />
          </kw-form-row>
        </kw-form>
      </div>
    </kw-expansion-item>
  </kw-list>

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
            <!-- row1 진행차월 -->
            <kw-form-item :label="$t('MSG_TXT_PRGS_NMN')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.rentalTn??'') }}</p>
            </kw-form-item>
            <!-- row1 배송차월 -->
            <kw-form-item :label="$t('MSG_TXT_DLVRY')+$t('MSG_TXT_NMN')">
              <p>{{ searchDetail.sppNmnN }}</p>
            </kw-form-item>
            <!-- row1 정상매출 -->
            <kw-form-item :label="$t('MSG_TXT_NOM_SL')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.nomSlAmt??'') }}</p>
            </kw-form-item>
            <!-- row1 정상할인 -->
            <kw-form-item :label="$t('MSG_TXT_NOM_DSC')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.nomDscAmt??'') }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-separator />
          <kw-form-row>
            <!-- row2 취소조정 -->
            <kw-form-item :label="$t('MSG_TXT_CAN_CTR')">
              <kw-input
                v-model="searchDetail.canCtrAmt"
                regex="num"
                maxlength="10"
                align="right"
              />
            </kw-form-item>
            <!-- row2 추가매출 -->
            <kw-form-item :label="$t('MSG_TXT_SPMT_SL')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.spmtSlAmt??'') }}</p>
            </kw-form-item>
            <!-- row2 추가할인 -->
            <kw-form-item :label="$t('MSG_TXT_SPMT_DSC')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.spmtDscAmt??'') }}</p>
            </kw-form-item>
            <!-- row2 매출조정 -->
            <kw-form-item :label="$t('MSG_TXT_SL_CTR')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.slCtrAmt??'') }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator v-if="searchDetail.canCtrAmt > 0" />
          <kw-form-row v-if="searchDetail.canCtrAmt > 0">
            <!-- row2-1 조정요청자사번 -->
            <kw-form-item :label="$t('MSG_TXT_CTR')+$t('MSG_TXT_REQ_USER')+$t('MSG_TXT_EPNO')">
              <kw-input
                v-model="searchDetail.slCtrRqrId"
                maxlength="10"
                regex="num"
              />
            </kw-form-item>
            <!-- row2-1 조정사유 -->
            <kw-form-item
              :label="$t('MSG_TXT_CTR_RSON')"
              colspan="3"
            >
              <kw-input
                v-model="searchDetail.slCtrRmkCn"
                maxlength="1000"
              />
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!-- row3 매출금액 -->
            <kw-form-item :label="$t('MSG_TXT_SL_AMT')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.slSumAmt??'') }}</p>
            </kw-form-item>
            <!-- row3 매출VAT -->
            <kw-form-item :label="$t('MSG_TXT_SL_VAT')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.slSumVat??'') }}</p>
            </kw-form-item>
            <!-- row3 매출누계 -->
            <kw-form-item :label="$t('MSG_TXT_SL_AGG_AMT')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.slAggAmt??'') }}</p>
            </kw-form-item>
            <!-- row3 할인누계 -->
            <kw-form-item :label="$t('MSG_TXT_DSC_AGG_AMT')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.dscAggAmt??'') }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!-- row4 조정누계 -->
            <kw-form-item :label="$t('MSG_TXT_CTR_AGG_AMT')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.ctrAggAmt??'') }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!-- row5 연체가산금 -->
            <kw-form-item :label="$t('MSG_TXT_DLQ_ADAMT')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.btdDlqAddAmt??'') }}</p>
            </kw-form-item>
            <!-- row5 入 / 出 -->
            <kw-form-item label="入 / 出">
              <p>
                {{ stringUtil.getNumberWithComma(searchDetail.thmDlqAddDpSumAmt??'') }}/
                {{ stringUtil.getNumberWithComma(searchDetail.thmDlqAddRfndSumAmt??'') }}
              </p>
            </kw-form-item>
            <!-- row5 가산금조정 -->
            <kw-form-item :label="$t('MSG_TXT_ADD_AM')+$t('MSG_TXT_CTR')">
              <kw-input
                v-model="searchDetail.adCtrAmt"
                regex="num"
                maxlength="10"
              />
            </kw-form-item>
            <!-- row5 미수금(未) -->
            <kw-form-item :label="$t('MSG_TXT_UCAM')+'(未)'">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.eotDlqAddAmt??'') }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
      </div>
    </kw-expansion-item>
  </kw-list>

  <!-- 5. 취소사항 -->
  <kw-action-top class="mt30">
    <template #left>
      <h3>5. {{ t('MSG_TXT_CAN_ARTC') }}</h3>
    </template>
    <kw-btn
      v-show="searchDetail.cancelStatNm !== '취소등록'"
      :label="$t('MSG_TXT_CAN_ARTC')+' '+$t('MSG_TXT_SRCH')"
      negative
      dense
      @click="onClickSearchCancel"
    />
  </kw-action-top>
  <kw-form
    ref="frmMainRegularSp"
    cols="3"
  >
    <kw-form-row>
      <!-- row1 요청일자 -->
      <kw-form-item
        :label="$t('MSG_TXT_AK_DT')"
        required
      >
        <kw-date-picker
          v-model="searchDetail.rsgAplcDt"
          :label="$t('MSG_TXT_AK_DT')"
          rules="required"
        />
      </kw-form-item>
      <!-- row1 취소일자 -->
      <kw-form-item
        :label="$t('MSG_TXT_CANC_DT')"
        required
      >
        <kw-date-picker
          v-model="searchDetail.rsgFshDt"
          :label="$t('MSG_TXT_CANC_DT')"
          rules="required"
        />
      </kw-form-item>
      <!-- row1 사용일수 -->
      <kw-form-item
        :label="$t('MSG_TXT_USE_DAY')"
        hint="렌탈조회시 사용일수 없음."
      >
        <p>{{ stringUtil.getNumberWithComma(searchDetail.useDays??'') }} DAY</p>
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- row2 선수잔액 -->
      <kw-form-item :label="$t('MSG_TXT_PRPD_BLAM')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.eotAtam??'') }}</p>
      </kw-form-item>
      <!-- row2 당월입금 -->
      <kw-form-item
        :label="$t('MSG_TXT_THM_DP')"
        hint="??"
      >
        <p>{{ stringUtil.getNumberWithComma(searchDetail.null??'') }}</p>
      </kw-form-item>
      <!-- row2 선수총액 -->
      <kw-form-item :label="$t('MSG_TXT_PRPD_TAM')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.totPrpdAmt??'') }}</p>
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- row3 매출입금 -->
      <kw-form-item :label="$t('MSG_TXT_SL_DP_AMT')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.slDpAmt??'') }}</p>
      </kw-form-item>
      <!-- row3 입금누계 -->
      <kw-form-item :label="$t('MSG_TXT_DP_AGG_AMT')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.slDpAggAmt??'') }}</p>
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- 위약금액 -->
      <kw-form-item :label="$t('MSG_TXT_CCAM')">
        <kw-input
          v-model="searchDetail.borAmt"
          regex="num"
          maxlength="10"
          align="right"
          :readonly="searchDetail.ccamExmptDvCd!=='4'"
        />
      </kw-form-item>
      <!-- row4 반품수량 -->
      <kw-form-item :label="$t('MSG_TXT_RTNGD')+$t('MSG_TXT_QTY')">
        <kw-input
          v-model="searchDetail.rtngdQty"
          regex="num"
          maxlength="10"
          align="right"
        />
      </kw-form-item>
      <!-- row4 분실손료 -->
      <kw-form-item :label="$t('MSG_TXT_PD_LENT_LOST_LOG')">
        <kw-input
          v-model="searchDetail.lsnt"
          regex="num"
          maxlength="10"
          align="right"
        />
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- row5 위약면책 -->
      <kw-form-item
        :label="$t('MSG_TXT_BOR')+$t('MSG_TXT_EXEMPTION')"
        class="equal_division--2"
      >
        <kw-select
          v-model="searchDetail.ccamExmptDvCd"
          :options="codes.CCAM_EXMPT_DV_CD"
          first-option="select"
        />
        <kw-input
          v-model="inputDetail.sel1Text"
          class="w80"
          regex="num"
          maxlength="1"
          @update:model-value="onChangeTextforSelect('sel1')"
        />
      </kw-form-item>
      <!-- row5 취소유형 -->
      <kw-form-item
        :label="$t('MSG_TXT_CNCL_TP')"
        class="equal_division--2"
      >
        <kw-select
          v-model="searchDetail.cntrStatChRsonCd"
          :options="codes.CMN_STAT_CH_RSON_CD"
          first-option="select"
        />
        <kw-input
          v-model="inputDetail.sel2Text"
          class="w80"
          regex="num"
          maxlength="2"
          @update:model-value="onChangeTextforSelect('sel2')"
        />
      </kw-form-item>
      <!-- 미수총액 -->
      <kw-form-item :label="$t('MSG_TXT_UC_TAM')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.ucAmt??'') }}</p>
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- 환불총액 -->
      <kw-form-item :label="$t('MSG_TXT_RFND_TOT_AMT')">
        <p class="kw-fc--accent">
          {{ stringUtil.getNumberWithComma(searchDetail.totRfndAmt??'') }}
        </p>
      </kw-form-item>
      <kw-form-item />
      <!-- 다건 정보 입력 -->
      <kw-form-item :label="$t('MSG_TXT_MULTI')+' '+$t('MSG_TXT_INF')+' '+$t('MSG_TXT_INP')">
        <kw-checkbox
          v-model="searchDetail.bulkApplyYN"
          :label="$t('MSG_TXT_CANCEL_BULK_APPLY')"
          :false-value="N"
          :true-value="Y"
          :disable="props.sametype==='N'"
        />
      </kw-form-item>
    </kw-form-row>
  </kw-form>

  <div class="button-set--bottom">
    <!-- BTN Variation #2 : 취소등록 이후 or 이미 취소가 등록된 버튼 배열-->
    <div
      v-if="searchDetail.cancelStatNm === '취소등록'"
      class="button-set--bottom-right"
    >
      <!--
      <kw-btn
        :label="$t('MSG_BTN_VAC')+$t('MSG_BTN_IS')"
        class="ml8"
        @click="onClickVacIssue"
      />
      -->
      <kw-btn
        :label="$t('MSG_TXT_CARD')+$t('MSG_BTN_APPR')"
        class="ml8"
        @click="onClickTodo('카드승인')"
      />
      <kw-btn
        :label="$t('MSG_TXT_RFND')+$t('MSG_BTN_RECEIPT')"
        class="ml8"
        @click="onClickRefund"
      />
      <!--삭제-->
      <kw-btn
        :label="$t('MSG_BTN_DEL')"
        class="ml8"
        @click="onClickDelete"
      />
    </div>
    <!-- // BTN Variation #1 : 취소등록 이전 버튼 배열  -->
    <div
      v-else
      class="button-set--bottom-right"
    >
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
import { codeUtil, getComponentType, stringUtil, useGlobal } from 'kw-lib';
import { isEmpty } from 'lodash';

const { t } = useI18n();
const frmMainRegularSp = ref(getComponentType('KwForm'));
const { modal, notify } = useGlobal();

const codes = await codeUtil.getMultiCodes(
  'CCAM_EXMPT_DV_CD', // 위약금면책구분코드
  'CMN_STAT_CH_RSON_CD', // 공통상태변경사유코드
);

const emits = defineEmits([
  'update:modelValue',
  'searchdetail',
  'savedetail',
  'removedetail',
  'deletecancel',
]);

const props = defineProps({
  childDetail: { type: Object, required: true },
  sametype: { type: String, required: true },
});

const searchDetail = reactive(props.childDetail);
const inputDetail = ref({
  reqDt: '',
  cancelDt: '',
});

codes.CCAM_EXMPT_DV_CD.forEach((e) => { e.codeName = `(${e.codeId})${e.codeName}`; });
codes.CMN_STAT_CH_RSON_CD.forEach((e) => { e.codeName = `(${e.codeId})${e.codeName}`; });
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// SELECTBOX 를 선택하기 위한 TEXT 입력 이벤트
function onChangeTextforSelect(div) {
  if (div === 'sel1') {
    if (codes.CCAM_EXMPT_DV_CD.findIndex((v) => v.codeId === inputDetail.value.sel1Text) >= 0) {
      searchDetail.ccamExmptDvCd = inputDetail.value.sel1Text;
    } else {
      searchDetail.ccamExmptDvCd = '';
    }
  } else if (div === 'sel2') {
    if (codes.CMN_STAT_CH_RSON_CD.findIndex((v) => v.codeId === inputDetail.value.sel2Text) >= 0) {
      searchDetail.cntrStatChRsonCd = inputDetail.value.sel2Text;
    } else {
      searchDetail.cntrStatChRsonCd = '';
    }
  }
}

// 5. 취소사항 > 취소사항 조회 클릭
async function onClickSearchCancel() {
  if (!await frmMainRegularSp.value.validate()) { return; }

  emits('searchdetail', { reqDt: searchDetail.rsgAplcDt,
    cancelDt: searchDetail.rsgFshDt,
    dscDdctam: searchDetail.dscDdctam ?? 0,
    filtDdctam: searchDetail.filtDdctam ?? 0,
    slCtrAmt: searchDetail.slCtrAmt ?? 0,
  });
}

function onClickSave() {
  if (isEmpty(searchDetail.canCtrAmt)) {
    searchDetail.slCtrRqrId = '';
    searchDetail.slCtrRmkCn = '';
  }
  if (searchDetail.ccamExmptDvCd !== '4') searchDetail.borAmt = 0;

  emits('savedetail');
}

function onClickCancel() {
  emits('removedetail');
}

async function onClickRefund() {
  const { cntrNo, cntrSn } = searchDetail;
  await modal({
    component: 'WwwdbRefundApplicationRegP',
    componentProps: { cntrNo, cntrSn },
  });
}

async function onClickTodo(param) {
  notify(`TODO: ${param} 준비 중`);
}

function onClickDelete() {
  emits('deletecancel');
}

watch(searchDetail, (val) => {
  console.log(val);
  emits('update:modelValue', val);
});

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
