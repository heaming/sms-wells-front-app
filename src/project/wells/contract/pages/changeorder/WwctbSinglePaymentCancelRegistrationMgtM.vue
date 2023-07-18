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
      default-opened
    >
      <template #header>
        <kw-item-section>
          <kw-item-label>
            <span class="text-weight-medium kw-font-pt18">3. {{ t('MSG_TXT_CNTR_PD') }}</span>
          </kw-item-label>
        </kw-item-section>
      </template>
      <div class="pb20">
        <kw-form
          cols="4"
        >
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
      >
        <kw-date-picker
          v-model="searchDetail.reqDt"
          :label="$t('MSG_TXT_AK_DT')"
        />
      </kw-form-item>
      <!-- row1 취소일자 -->
      <kw-form-item
        :label="$t('MSG_TXT_CANC_DT')"
      >
        <kw-date-picker
          v-model="searchDetail.cancelDt"
          :label="$t('MSG_TXT_CANC_DT')"
        />
      </kw-form-item>
      <!-- 취소유형 -->
      <kw-form-item :label="$t('MSG_TXT_CNCL_TP')">
        <kw-select
          v-model="searchDetail.cntrStatChRsonCd"
          :options="codes.CMN_STAT_CH_RSON_CD"
          first-option="select"
        />
        <kw-input
          v-model="inputDetail.sel2Text"
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
          :options="codes.CSMB_CS_EXMPT_DV_CD"
          first-option="select"
        />
        <kw-input
          v-model="inputDetail.sel3Text"
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

  <div
    class="button-set--bottom"
  >
    <!-- BTN Variation #2 : 취소등록 이후 or 이미 취소가 등록된 버튼 배열-->
    <div
      v-if="searchDetail.cancelStatNm === '취소등록'"
      class="button-set--bottom-right"
    >
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
import { codeUtil, getComponentType, stringUtil } from 'kw-lib';
import { isEmpty } from 'lodash';

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
  'update:modelValue',
  'searchdetail',
  'savedetail',
  'removedetail',
]);

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

// 5. 취소사항 > 취소사항 조회 클릭
/*
async function onClickSearchCancel() {
  if (!await frmMainRental.value.validate()) { return; }
  if (inputDetail.value.reqDt < dayjs().format('YYYYMMDD')) {
    notify('요청일자가 현재일자 이전입니다.');
  }

  emits('searchdetail', inputDetail.value.reqDt, inputDetail.value.cancelDt);
}
*/

function onClickSave() {
  searchDetail.rsgAplcDt = inputDetail.reqDt;
  if (isEmpty(searchDetail.canCtrAmt)) {
    searchDetail.slCtrRqrId = '';
    searchDetail.slCtrRmkCn = '';
  }
  emits('savedetail');
}

function onClickCancel() {
  emits('removedetail');
}
// SELECTBOX 를 선택하기 위한 TEXT 입력 이벤트
function onChangeTextforSelect(div) {
  if (div === 'sel2') {
    searchDetail.cntrStatChRsonCd = inputDetail.value.sel2Text;
  } else if (div === 'sel3') {
    searchDetail.sel3 = inputDetail.value.sel3Text;
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
