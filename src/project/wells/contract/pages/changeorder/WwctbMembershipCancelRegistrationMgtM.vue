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
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.nomSlAmt??'') }}</p>
            </kw-form-item>
            <!-- row1 가입일수 -->
            <kw-form-item :label="$t('MSG_TXT_J_DC')">
              <p>{{ cancelDetail.rentalDc }}</p>
            </kw-form-item>
            <!-- row1 탈퇴일자 -->
            <kw-form-item :label="$t('MSG_TXT_WDWAL_DT')">
              <p>{{ stringUtil.getDateFormat(cancelDetail.chgDt) }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!-- row2 정상매출 -->
            <kw-form-item :label="$t('MSG_TXT_NOM_SL')">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.nomSlAmt??'') }}</p>
            </kw-form-item>
            <!-- row2 정상할인 -->
            <kw-form-item :label="$t('MSG_TXT_NOM_DSC')">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.nomDscAmt??'') }}</p>
            </kw-form-item>
            <!-- row2 매출조정 -->
            <kw-form-item :label="$t('MSG_TXT_SL_CTR')">
              <kw-input
                v-model="cancelDetail.canCtrAmt"
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
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.spmtSlAmt??'') }}</p>
            </kw-form-item>
            <!-- row3 추가할인 -->
            <kw-form-item :label="$t('MSG_TXT_SPMT_DSC')">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.spmtDscAmt??'') }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!-- row4 매출금액 -->
            <kw-form-item :label="$t('MSG_TXT_SL_AMT')">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.thmSlSumAmt??'') }}</p>
            </kw-form-item>
            <!-- row4 매출VAT -->
            <kw-form-item :label="$t('MSG_TXT_SL_VAT')">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.slSumVat??'') }}</p>
            </kw-form-item>
            <!-- row4 매출누계 -->
            <kw-form-item :label="$t('MSG_TXT_SL_AGG_AMT')">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.slAggAmt??'') }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-separator />
          <kw-form-row>
            <!-- row5 할인누계액 -->
            <kw-form-item :label="$t('MSG_TXT_DSC_AGG_AMT')">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.thmPaiamAmt??'') }}</p>
            </kw-form-item>
            <!-- row5 조정누계액 -->
            <kw-form-item :label="$t('MSG_TXT_CTR_AGG_AMT')">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.thmSrvAmt??'') }}</p>
            </kw-form-item>
            <!-- row5 매출잔액 -->
            <kw-form-item :label="$t('MSG_TXT_SL_BLAM')">
              <p>{{ stringUtil.getNumberWithComma(cancelDetail.eotPcamBlam??'') }}</p>
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
      <!-- row1 사용일수 -->
      <kw-form-item :label="$t('MSG_TXT_USE_DAY')">
        <p>184 DAY</p>
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- row2 선납잔액 -->
      <kw-form-item :label="$t('MSG_TXT_PRM_BLAM')">
        <p>0</p>
      </kw-form-item>
      <!-- row2 선수잔액 -->
      <kw-form-item :label="$t('MSG_TXT_PRPD_BLAM')">
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
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- row5 연체가산금 -->
      <kw-form-item :label="$t('MSG_TXT_DLQ_ADAMT')">
        <p>{{ stringUtil.getNumberWithComma(cancelDetail.btdDlqAddAmt??'') }}</p>
      </kw-form-item>
      <!-- row3 가산입금 -->
      <kw-form-item :label="$t('MSG_TXT_ADD_DP_AMT')">
        <p>20,900</p>
      </kw-form-item>
      <!-- row3 가산조정 -->
      <kw-form-item :label="$t('MSG_TXT_ADD_CTR')">
        <kw-input
          v-model="cancelDetail.canCtrAmt"
          regex="num"
          maxlength="10"
          align="right"
        />
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
      <!-- 미수총액 -->
      <kw-form-item :label="$t('MSG_TXT_UC_TAM')">
        <p>1</p>
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
      <!-- 할인공제금액 -->
      <kw-form-item :label="$t('MSG_TXT_DSC_DDTN_AMT')">
        <kw-input
          v-model="searchDetail.amt1"
          regex="num"
          maxlength="10"
          align="right"
        />
      </kw-form-item>
      <!-- 필터공제(위약금) -->
      <kw-form-item :label="$t('MSG_TXT_FILT_DDTN')+'('+$t('MSG_TXT_CCAM')+')'">
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
      <!-- 환불총액 -->
      <kw-form-item :label="$t('MSG_TXT_RFND_TOT_AMT')">
        <p class="kw-fc--accent">
          -389,080
        </p>
      </kw-form-item>
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
      <!-- 면책유형 -->
      <kw-form-item :label="$t('MSG_TXT_EXEMPTION')+$t('MSG_TXT_TYPE')">
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
    </kw-form-row>

    <kw-separator />
    <kw-form-row>
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
      >
        <kw-input
          v-model="cancelDetail.ctrReson"
          maxlength="100"
        />
      </kw-form-item>
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

  <kw-separator />
  <!-- 6. 취소패키지 취소 위약금/일시불 취소 위약금 조회사항 -->
  <kw-action-top
    class="mt30"
  >
    <template #left>
      <h3>6. 패키지 취소 위약금/일시불 취소 위약금 조회</h3>
    </template>
    <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
  </kw-action-top>
  <kw-grid
    ref="grdSubMembership"
    :visible-rows="5"
    @init="initGridMembership"
  />

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
const frmMainMembership = ref(getComponentType('KwForm'));

const codes = await codeUtil.getMultiCodes(
  'CCAM_EXMPT_DV_CD', // 위약금면책구분코드
  'CMN_STAT_CH_RSON_CD', // 공통상태변경사유코드
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

codes.CCAM_EXMPT_DV_CD.forEach((e) => { e.codeName = `(${e.codeId})${e.codeName}`; });
codes.CMN_STAT_CH_RSON_CD.forEach((e) => { e.codeName = `(${e.codeId})${e.codeName}`; });
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// 5. 취소사항 > 취소사항 조회 클릭
async function onClickSearchCancel() {
  if (!await frmMainMembership.value.validate()) { return; }

  notify('TODO : 취소조회 ');
}

function onClickSave() {
  searchDetail.value.sellTpCd = props.childDetail.sellTpCd;
  emits('savedetail', searchDetail.value);
}

function onClickCancel() {
  emits('removedetail');
}

// 위약금 내역서 보기
function onClickCcamView() {
  // 위약금 내역서 보기 : 해당 계약번호에 대한 '위약금 내역' OZ뷰 팝업을 호출 합니다.
  notify('TODO : 위약금 내역서 OZ뷰 호출 ');
}

// SELECTBOX 를 선택하기 위한 TEXT 입력 이벤트
function onChangeTextforSelect(div) {
  if (div === 'sel1') {
    searchDetail.value.sel1 = searchDetail.value.sel1Text;
  } else if (div === 'sel2') {
    searchDetail.value.sel2 = searchDetail.value.sel2Text;
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

function initGridMembership(data, view) {
  const columns = [
    { fieldName: 'sellTpNm', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center' }, // [판매유형]
    { fieldName: 'cntrCnfmDt', header: t('MSG_TXT_CNTRCT_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [계약일]
    { fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '120',
      styleName: 'text-center',
      displayCallback: (g, i) => `${g.getValue(i.itemIndex, 'cntrNo')}-${g.getValue(i.itemIndex, 'cntrSn')}`,
    }, // [계약상세번호]
    { fieldName: 'copnDvNm', header: t('MSG_TXT_CNTRT_TP'), width: '100', styleName: 'text-center' }, // [계약자유형]
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-center' }, // [고객번호]
    { fieldName: 'cntrCstKnm', header: t('MSG_TXT_CST_NM'), width: '120', styleName: 'text-center' }, // [고객명]
    { fieldName: 'npdAmt', header: t('MSG_TXT_NPD_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '270' }, // [상품명]
    { fieldName: 'cntrGbn', visible: false },
    { fieldName: 'hooPrtnrNm', visible: false },
    { fieldName: 'hooPrtnrNo', visible: false },
    { fieldName: 'ogCd', visible: false },
    { fieldName: 'basePdCd', visible: false },
    { fieldName: 'stplPtrm', visible: false },
    { fieldName: 'cntrPdStrtdt', visible: false },
    { fieldName: 'cntrAmt', visible: false },
    { fieldName: 'cntramDscAmt', visible: false },
    { fieldName: 'cntrTam', visible: false },
    { fieldName: 'pdBaseAmt', visible: false },
    { fieldName: 'cntrPtrm', visible: false },
    { fieldName: 'fnlAmt', visible: false },
    { fieldName: 'dscAmt', visible: false },
    { fieldName: 'rstlPtrm', visible: false },
    { fieldName: 'stplDscAmt', visible: false },
    { fieldName: 'stplStrtdt', visible: false },
    { fieldName: 'stplEnddt', visible: false },
    { fieldName: 'nomSlAmt', visible: false },
    { fieldName: 'rentalDc', visible: false },
    { fieldName: 'slDc', visible: false },
    { fieldName: 'chgDt', visible: false },
    { fieldName: 'spmtSlAmt', visible: false },
    { fieldName: 'nomDscAmt', visible: false },
    { fieldName: 'canAtrAmt', visible: false },
    { fieldName: 'addSrv', visible: false },
    { fieldName: 'spmtDscAmt', visible: false },
    { fieldName: 'slCtrAmt', visible: false },
    { fieldName: 'thmSlSumAmt', visible: false },
    { fieldName: 'slSumVat', visible: false },
    { fieldName: 'slAggAmt', visible: false },
    { fieldName: 'thmPaiamAmt', visible: false },
    { fieldName: 'thmSrvAmt', visible: false },
    { fieldName: 'eotPcamBlam', visible: false },
    { fieldName: 'btdDlqAddAmt', visible: false },
    { fieldName: 'thmDlqAddDpSumAmt', visible: false },
    { fieldName: 'thmDlqAddRfndSumAmt', visible: false },
    { fieldName: 'eotDlqAmt', visible: false },
    { fieldName: 'sellTpCd', visible: false },
    { fieldName: 'cntrNo', visible: false },
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'isAdded', width: '50' },

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
}
</script>

<style scoped lang="scss">
.kw-form-row + .kw-separator {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
</style>
