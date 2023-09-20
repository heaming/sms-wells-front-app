<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbMembershipCancelRegistrationMgtM - 취소등록 > 멤버쉽 > 4.매출사항/5.취소사항
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
    <!-- 2. 판매정보 --------------------------------------------------------------------------->
    <kw-expansion-item
      padding-target="header"
      expansion-icon-align="center"
      expand-icon-class="kw-font-pt24"
    >
      <template #header>
        <kw-item-section>
          <kw-item-label>
            <span class="text-weight-medium kw-font-pt18">2. {{ t('MSG_TXT_SELL_INF') }}</span>
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
            <!--멤버십구분-->
            <kw-form-item :label="$t('MSG_TXT_MSH_DV')">
              <p>{{ searchDetail.stlmTpNm }}</p>
            </kw-form-item>
            <!--패키지여부-->
            <kw-form-item :label="$t('MSG_TXT_PKG_YN')">
              <p>{{ searchDetail.pkgYn }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!--본부장-->
            <kw-form-item :label="$t('MSG_TXT_GNR_MNG')">
              <p>{{ searchDetail.hooPrtnrNm }}({{ searchDetail.hooPrtnrNo }})</p>
            </kw-form-item>
            <!--MSG_TXT_HDQ-->
            <kw-form-item
              :label="$t('본부')"
              hint="null"
            >
              <p>{{ stringUtil.getNumberWithComma(searchDetail.null??'') }}</p>
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
            <!--BS주기-->
            <kw-form-item :label="$t('MSG_TXT_BS_CYC')">
              <p>{{ searchDetail.svPrd }}</p>
            </kw-form-item>
            <!--용도구분-->
            <kw-form-item :label="$t('MSG_TXT_USWY_DV')">
              <p>{{ searchDetail.svPdTpNm }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!--가입유형-->
            <kw-form-item :label="$t('MSG_TXT_J_TP')">
              <p>{{ searchDetail.stlmTpNm }}</p>
            </kw-form-item>
            <!--멤버십월회비-->
            <kw-form-item
              :label="$t('MSG_TXT_MEMBERSHIP')+t('MSG_TXT_MM_SSPCS')"
              hint="null"
            >
              <p>{{ stringUtil.getNumberWithComma(searchDetail.null??'') }}</p>
            </kw-form-item>
            <!--할인금액-->
            <kw-form-item :label="$t('MSG_TXT_RNTL_TOTAL')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.dscAmt??'') }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!--계약일자 -->
            <kw-form-item :label="$t('MSG_TXT_CNTR_DATE')">
              <p> {{ stringUtil.getDateFormat(searchDetail.cntrRcpDt) }}</p>
            </kw-form-item>
            <!--확정일자-->
            <kw-form-item :label="$t('MSG_TXT_RENTAL')+' DC'">
              <p>{{ stringUtil.getDateFormat(searchDetail.cntrCnfmDt) }}</p>
            </kw-form-item>
            <!--가입일자-->
            <kw-form-item :label="$t('MSG_TXT_J_DT')">
              <p>{{ stringUtil.getDateFormat(searchDetail.cntrPdStrtdt) }}</p>
            </kw-form-item>
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
        <kw-form cols="3">
          <kw-form-row>
            <!-- row1 가입차월 -->
            <kw-form-item :label="$t('MSG_TXT_J_NMN')">
              <p>{{ searchDetail.rentalTn }}</p>
            </kw-form-item>
            <!-- row1 가입일수 -->
            <kw-form-item :label="$t('MSG_TXT_J_DC')">
              <p>{{ searchDetail.rentalDc }}</p>
            </kw-form-item>
            <!-- row1 탈퇴일자 -->
            <kw-form-item :label="$t('MSG_TXT_WDWAL_DT')">
              <p>{{ stringUtil.getDateFormat(searchDetail.cntrPdEnddt) }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!-- row2 정상매출 -->
            <kw-form-item :label="$t('MSG_TXT_NOM_SL')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.nomSlAmt??'') }}</p>
            </kw-form-item>
            <!-- row2 정상할인 -->
            <kw-form-item :label="$t('MSG_TXT_NOM_DSC')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.nomDscAmt??'') }}</p>
            </kw-form-item>
            <!-- row2 매출조정 -->
            <kw-form-item :label="$t('MSG_TXT_SL_CTR')">
              <kw-input
                v-model="searchDetail.slCtrAmt"
                regex="num"
                maxlength="10"
                align="right"
              />
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!-- row3 추가매출  -->
            <kw-form-item :label="$t('MSG_TXT_SPMT_SL')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.spmtSlAmt??'') }}</p>
            </kw-form-item>
            <!-- row3 추가할인 -->
            <kw-form-item :label="$t('MSG_TXT_SPMT_DSC')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.spmtDscAmt??'') }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!-- row4 매출금액 -->
            <kw-form-item :label="$t('MSG_TXT_SL_AMT')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.thmSlSumAmt??'') }}</p>
            </kw-form-item>
            <!-- row4 매출VAT -->
            <kw-form-item :label="$t('MSG_TXT_SL_VAT')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.slSumVat??'') }}</p>
            </kw-form-item>
            <!-- row4 매출누계 -->
            <kw-form-item :label="$t('MSG_TXT_SL_AGG_AMT')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.slAggAmt??'') }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!-- row5 할인누계액 -->
            <kw-form-item :label="$t('MSG_TXT_DSC_AGG_AMT')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.dscAggAmt??'') }}</p>
            </kw-form-item>
            <!-- row5 조정누계액 -->
            <kw-form-item :label="$t('MSG_TXT_CTR_AGG_AMT')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.ctrAggAmt??'') }}</p>
            </kw-form-item>
            <!-- row5 매출잔액 -->
            <kw-form-item :label="$t('MSG_TXT_SL_BLAM')">
              <p>{{ stringUtil.getNumberWithComma(searchDetail.slBlam??'') }}</p>
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
      v-show="searchDetail.cancelStatNm !== '취소등록'"
      v-permission:read
      :label="$t('MSG_TXT_CAN_ARTC')+' '+$t('MSG_TXT_SRCH')"
      negative
      dense
      @click="onClickSearchCancel"
    />
  </kw-action-top>
  <kw-form
    ref="frmMainMembership"
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
      <kw-form-item :label="$t('MSG_TXT_USE_DAY')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.useDays??'') }} DAY</p>
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- row2 선납잔액 -->
      <kw-form-item
        :label="$t('MSG_TXT_PRM_BLAM')"
        hint="선납기초금액?prmBtdAmt"
      >
        <p>{{ stringUtil.getNumberWithComma(searchDetail.prmBtdAmt??'') }}</p>
      </kw-form-item>
      <!-- row2 선수잔액 -->
      <kw-form-item
        :label="$t('MSG_TXT_PRPD_BLAM')"
        hint="기말선수금?eotAtam"
      >
        <p>{{ stringUtil.getNumberWithComma(searchDetail.eotAtam??'') }}</p>
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
      <!-- row5 연체가산금 -->
      <kw-form-item
        :label="$t('MSG_TXT_DLQ_ADAMT')"
        hint="기말연체가산금액?eotDlqAddAmt"
      >
        <p>{{ stringUtil.getNumberWithComma(searchDetail.eotDlqAddAmt??'') }}</p>
      </kw-form-item>
      <!-- row3 가산입금 -->
      <kw-form-item
        :label="$t('MSG_TXT_ADD_DP_AMT')"
        hint="null"
      >
        <p>{{ stringUtil.getNumberWithComma(searchDetail.null??'') }}</p>
      </kw-form-item>
      <!-- row3 가산조정 -->
      <kw-form-item
        :label="$t('MSG_TXT_ADD_CTR')"
        hint="null"
      >
        <kw-input
          v-model="searchDetail.null"
          regex="num"
          maxlength="10"
        />
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- row4 선납환불 -->
      <kw-form-item :label="$t('MSG_TXT_PRM_RFND_AMT')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.prmRfndAmt??'') }}</p>
      </kw-form-item>
      <!-- row4 선수환불 -->
      <kw-form-item :label="$t('MSG_TXT_PRPD_RFND')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.prpdRfndAmt??'') }}</p>
      </kw-form-item>
      <!-- 미수총액 -->
      <kw-form-item :label="$t('MSG_TXT_UC_TAM')">
        <p>{{ stringUtil.getNumberWithComma(searchDetail.ucAmt??'') }}</p>
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- 할인공제금액 -->
      <kw-form-item :label="$t('MSG_TXT_DSC_DDTN_AMT')">
        <kw-input
          v-model="searchDetail.dscDdctam"
          regex="num"
          maxlength="10"
          align="right"
        />
      </kw-form-item>
      <!-- 필터공제(위약금) -->
      <kw-form-item :label="$t('MSG_TXT_FILT_DDTN')+'('+$t('MSG_TXT_CCAM')+')'">
        <kw-input
          v-model="searchDetail.filtDdctam"
          regex="num"
          maxlength="10"
          align="right"
        />
      </kw-form-item>
      <!-- 환불총액 -->
      <kw-form-item :label="$t('MSG_TXT_RFND_TOT_AMT')">
        <p class="kw-fc--accent">
          {{ stringUtil.getNumberWithComma(searchDetail.totRfndAmt??'') }}
        </p>
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- 면책유형 -->
      <kw-form-item
        :label="$t('MSG_TXT_EXEMPTION')+$t('MSG_TXT_TYPE')"
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
      <!-- row2-1 조정요청자사번 -->
      <kw-form-item :label="$t('MSG_TXT_CTR')+$t('MSG_TXT_REQ_USER')+$t('MSG_TXT_EPNO')">
        <kw-input
          v-model="searchDetail.slCtrRqrId"
          maxlength="10"
          regex="num"
        />
      </kw-form-item>
      <!-- row2-1 조정사유 -->
      <kw-form-item :label="$t('MSG_TXT_CTR_RSON')">
        <kw-input
          v-model="searchDetail.slCtrRmkCn"
          maxlength="1000"
        />
      </kw-form-item>
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
import { codeUtil, getComponentType, notify, stringUtil, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';

const { t } = useI18n();
const frmMainMembership = ref(getComponentType('KwForm'));
const { modal } = useGlobal();
const now = dayjs();

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
  reqDt: now.format('YYYYMMDD'),
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
  if (!await frmMainMembership.value.validate()) { return; }

  emits('searchdetail', { reqDt: searchDetail.rsgAplcDt,
    cancelDt: searchDetail.rsgFshDt,
    dscDdctam: searchDetail.dscDdctam,
    filtDdctam: searchDetail.filtDdctam,
    slCtrAmt: searchDetail.slCtrAmt,
  });
}

function onClickSave() {
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
/*
function initGridMembership(data, view) {
  const columns = [
    { fieldName: 'col11', header: t('MSG_TXT_GRP_NO')}, // [그룹번호]
    { fieldName: 'col12', header: t('MSG_TXT_MSH_DV') }, // [멤버십구분]
    { fieldName: 'col13', header: t('MSG_TXT_WDWAL') + t('MSG_TXT_YEAR') }, // [탈퇴년]
    { fieldName: 'col14', header: t('MSG_TXT_CNTR_DTL_NO'), width: '100', styleName: 'text-center' }, // [계약상세번호]
    { fieldName: 'col15', header: t('MSG_TXT_PRDT_NM'), width: '300' }, // [상품명]
    { fieldName: 'col16', header: t('MSG_TXT_DSC') + t('MSG_TXT_APPLY') }, // [할인적용]
    { fieldName: 'col17', header: t('MSG_TXT_MEM_DUES'), width: '100', styleName: 'text-center' }, // [멤버십회비]
    { fieldName: 'col18', header: `${t('MSG_TXT_RGST_COST_DSC_AMT')} ${t('MSG_TXT_LVY_AMT')}` }, // [등록비할인금액 부과액]
    { fieldName: 'col19', header: t('MSG_TXT_RES_MCNT'), width: '100', styleName: 'text-center' }, // [잔여개월]
    { fieldName: 'col21', header: t('MSG_TXT_REST') + t('MSG_TXT_CHARGE') }, // [잔여요금]
    { fieldName: 'col22', header: `${t('MSG_TXT_REST') + t('MSG_TXT_CHARGE')} 10%${t('MSG_TXT_LVY_AMT')}` },
    // [잔여요금 10%부과액]
    { fieldName: 'col23', header: t('MSG_TXT_DSC') + t('MSG_TXT_RTAM') }, // [할인반환금]
    { fieldName: 'col24', header: `${t('MSG_TXT_COM_TOT')} ${t('MSG_TXT_RTAM')}` }, // [총 반환금액]
    { fieldName: 'col25', header: t('MSG_TXT_STT'), width: '100', styleName: 'text-center' }, // [상태]
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
}
*/
</script>

<style scoped lang="scss">
.kw-form-row + .kw-separator {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
</style>
