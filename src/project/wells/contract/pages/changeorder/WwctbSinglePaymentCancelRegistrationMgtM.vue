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
  <!-- 4. 취소사항 -->
  <kw-action-top
    class="mt30"
  >
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
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_CONSUMPTION')"
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
      </kw-form-item>
      <kw-form-item />
      <!-- 다건 정보 입력 -->
      <kw-form-item :label="$t('MSG_TXT_MULTI')+' '+$t('MSG_TXT_INF')+' '+$t('MSG_TXT_INP')">
        <kw-checkbox
          v-model="searchDetail.bulkApplyYN"
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
import { codeUtil, getComponentType } from 'kw-lib';

const { t } = useI18n();
const frmMainSinglePmt = ref(getComponentType('KwForm'));

const codes = await codeUtil.getMultiCodes(
  'CMN_STAT_CH_RSON_CD', // 공통상태변경사유코드
  'CSMB_CS_EXMPT_DV_CD', // 소모품비용면책구분코드
);

const props = defineProps({
  childDetail: { type: Object, required: true },
});
const emits = defineEmits([
  'savedetail',
  'removedetail',
]);

const searchDetail = ref({});

codes.CMN_STAT_CH_RSON_CD.forEach((e) => { e.codeName = `(${e.codeId})${e.codeName}`; });
codes.CSMB_CS_EXMPT_DV_CD.forEach((e) => { e.codeName = `(${e.codeId})${e.codeName}`; });
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// 5. 취소사항 > 취소사항 조회 클릭
// async function onClickSearchCancel() {
//   if (!await frmMainSinglePmt.value.validate()) { return; }

//   notify('TODO : 취소조회 ');
// }

function onClickSave() {
  searchDetail.value.sellTpCd = props.childDetail.sellTpCd;
  emits('savedetail', searchDetail.value);
}

function onClickCancel() {
  emits('removedetail');
}

// SELECTBOX 를 선택하기 위한 TEXT 입력 이벤트
function onChangeTextforSelect(div) {
  if (div === 'sel2') {
    searchDetail.value.sel2 = searchDetail.value.sel2Text;
  } else if (div === 'sel3') {
    searchDetail.value.sel3 = searchDetail.value.sel3Text;
  }
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
