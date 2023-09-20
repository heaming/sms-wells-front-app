<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbSinglePaymentCancelRegistrationMgtM - 취소등록 > 일시불 > 4.취소사항
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
    <!-- 2. 계약자 정보 --------------------------------------------------------------------------->
    <kw-expansion-item
      padding-target="header"
      expansion-icon-align="center"
      expand-icon-class="kw-font-pt24"
    >
      <template #header>
        <kw-item-section>
          <kw-item-label>
            <span class="text-weight-medium kw-font-pt18">2. {{ t('MSG_TXT_CNTRT_INF') }}</span>
          </kw-item-label>
        </kw-item-section>
      </template>
      <div class="pb20">
        <kw-form cols="4">
          <kw-form-row>
            <!--고객명-->
            <kw-form-item :label="$t('MSG_TXT_CST_NM')">
              <p>{{ searchDetail.cntrCstKnm }}</p>
            </kw-form-item>
            <!--판매구분-->
            <kw-form-item :label="$t('MSG_TXT_SLS_CAT')">
              <p>{{ searchDetail.cntrGbn }}</p>
            </kw-form-item>
            <!--본부장-->
            <kw-form-item :label="$t('MSG_TXT_GNR_MNG')">
              <p>{{ searchDetail.hooPrtnrNm }}({{ searchDetail.hooPrtnrNo }})</p>
            </kw-form-item>
            <!--소속-->
            <kw-form-item :label="$t('MSG_TXT_BLG')">
              <p>{{ searchDetail.ogCd }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
      </div>
    </kw-expansion-item>

    <!-- 3. 계약상품 --------------------------------------------------------------------------->
    <kw-expansion-item
      padding-target="header"
      expansion-icon-align="center"
      expand-icon-class="kw-font-pt24"
    >
      <template #header>
        <kw-item-section>
          <kw-item-label>
            <span class="text-weight-medium kw-font-pt18">3. {{ t('MSG_TXT_CNTR_PD') }}</span>
          </kw-item-label>
        </kw-item-section>
      </template>
      <div class="pb20">
        <kw-form cols="4">
          <kw-form-row>
            <!--상품코드-->
            <kw-form-item :label="$t('TXT_MSG_PD_CD')">
              <p>{{ searchDetail.basePdCd }}</p>
            </kw-form-item>
            <!--상품명-->
            <kw-form-item :label="$t('MSG_TXT_PRDT_NM')">
              <p>{{ searchDetail.pdNm }}</p>
            </kw-form-item>
            <!--할인구분-->
            <kw-form-item
              :label="$t('MSG_TXT_PD_DC_CLASS')"
              hint="null"
            >
              <p>{{ stringUtil.getDateFormat(searchDetail.null) }}</p>
            </kw-form-item>
            <!--수량-->
            <kw-form-item
              :label="$t('MSG_TXT_QTY')"
              hint="null"
            >
              <p>{{ stringUtil.getDateFormat(searchDetail.null) }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!--판매금액-->
            <kw-form-item :label="$t('MSG_TXT_SALE_PRICE')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.sellAmt??'') }}</p>
            </kw-form-item>
            <!--정상가-->
            <kw-form-item
              :label="$t('MSG_TXT_PD_NOM_PRC')"
              hint="null"
            >
              <p>{{ stringUtil.getNumberWithComma(searchDetail.null??'') }}</p>
            </kw-form-item>
            <!--할인가-->
            <kw-form-item
              :label="$t('MSG_TXT_DSPRC')"
              hint="null"
            >
              <p>{{ stringUtil.getNumberWithComma(searchDetail.null??'') }}</p>
            </kw-form-item>
            <!--판매가-->
            <kw-form-item
              :label="$t('TXT_MSG_SELL_PRC')"
              hint="null"
            >
              <p>({{ stringUtil.getNumberWithComma(searchDetail.null??'') }})</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!--계약일자 -->
            <kw-form-item :label="$t('MSG_TXT_CNTR_DATE')">
              <p>{{ stringUtil.getDateFormat(searchDetail.cntrRcpDt) }}</p>
            </kw-form-item>
            <!--예정일자-->
            <kw-form-item :label="$t('MSG_TXT_SCHD_DT')">
              <p>{{ stringUtil.getDateFormat(searchDetail.sppDuedt) }}</p>
            </kw-form-item>
            <!--매출일자-->
            <kw-form-item :label="$t('MSG_TXT_SL_DT')">
              <p>{{ stringUtil.getDateFormat(searchDetail.cntrPdStrtdt) }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
      </div>
    </kw-expansion-item>
  </kw-list>

  <!-- 4. 취소사항 -->
  <kw-action-top class="mt30">
    <template #left>
      <h3>4. {{ t('MSG_TXT_CAN_ARTC') }}</h3>
    </template>
  </kw-action-top>

  <kw-form
    ref="frmMainSinglePmt"
    cols="3"
  >
    <kw-form-row>
      <!-- row1 요청일자 -->
      <kw-form-item :label="$t('MSG_TXT_AK_DT')">
        <kw-date-picker
          v-model="searchDetail.rsgAplcDt"
          :label="$t('MSG_TXT_AK_DT')"
          rules="required"
        />
      </kw-form-item>
      <!-- row1 취소일자 -->
      <kw-form-item :label="$t('MSG_TXT_CANC_DT')">
        <kw-date-picker
          v-model="searchDetail.rsgFshDt"
          :label="$t('MSG_TXT_CANC_DT')"
          rules="required"
        />
      </kw-form-item>
      <!-- 취소유형 -->
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
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_CONSUMPTION')"
        class="equal_division--2"
      >
        <kw-select
          v-model="searchDetail.csmbCsExmptDvCd"
          :options="codes.CSMB_CS_EXMPT_DV_CD"
          first-option="select"
        />
        <kw-input
          v-model="inputDetail.sel3Text"
          class="w80"
          regex="num"
          maxlength="1"
          @update:model-value="onChangeTextforSelect('sel3')"
        />
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
        v-permission:delete
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
        v-permission:create
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

const { t } = useI18n();
const frmMainSinglePmt = ref(getComponentType('KwForm'));
const { modal, notify } = useGlobal();

const codes = await codeUtil.getMultiCodes(
  'CMN_STAT_CH_RSON_CD', // 공통상태변경사유코드
  'CSMB_CS_EXMPT_DV_CD', // 소모품비용면책구분코드
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

codes.CMN_STAT_CH_RSON_CD.forEach((e) => { e.codeName = `(${e.codeId})${e.codeName}`; });
codes.CSMB_CS_EXMPT_DV_CD.forEach((e) => { e.codeName = `(${e.codeId})${e.codeName}`; });
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// SELECTBOX 를 선택하기 위한 TEXT 입력 이벤트
function onChangeTextforSelect(div) {
  if (div === 'sel2') {
    if (codes.CMN_STAT_CH_RSON_CD.findIndex((v) => v.codeId === inputDetail.value.sel2Text) >= 0) {
      searchDetail.cntrStatChRsonCd = inputDetail.value.sel2Text;
    } else {
      searchDetail.cntrStatChRsonCd = '';
    }
  } else if (div === 'sel3') {
    if (codes.CSMB_CS_EXMPT_DV_CD.findIndex((v) => v.codeId === inputDetail.value.sel3Text) >= 0) {
      searchDetail.csmbCsExmptDvCd = inputDetail.value.sel3Text;
    } else {
      searchDetail.csmbCsExmptDvCd = '';
    }
  }
}

async function onClickRefund() {
  const { cntrNo, cntrSn } = searchDetail;
  await modal({
    component: 'WwwdbRefundApplicationRegP',
    componentProps: { cntrNo, cntrSn },
  });
}

function onClickSave() {
  emits('savedetail');
}

function onClickCancel() {
  emits('removedetail');
}

function onClickDelete() {
  emits('deletecancel');
}

async function onClickTodo(param) {
  notify(`TODO: ${param} 기능 준비 중`);
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
