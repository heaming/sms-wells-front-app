<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaOrderDetailCashSalesReceiptMgtP - 주문상세페이지 내부 팝업_현금영수증
3. 작성자 : gs.piit165
4. 작성일 : 2023.04.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************np
- 주문상세페이지 내부 팝업_현금영수증 화면
****************************************************************************************************
--->

<template>
  <kw-popup
    size="4xl"
  >
    <h3>{{ $t('MSG_TXT_SELT_CNTR_PD') }}</h3>
    <kw-form :cols="2">
      <kw-form-row>
        <!-- 계약상세번호 -->
        <kw-form-item :label="t('MSG_TXT_CNTR_DTL_NO')">
          <p>2022-1234567</p>
        </kw-form-item>
        <!-- 상품명 -->
        <kw-form-item :label="t('MSG_TXT_PRDT_NM')">
          <kw-select />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-tabs
      model-value="4"
    >
      <kw-tab
        name="1"
        :label="$t('MSG_TXT_CST_BAS_INF')"
      />
      <kw-tab
        name="2"
        :label="$t('MSG_TXT_MGT_INF')"
      />
      <kw-tab
        name="3"
        :label="$t('MSG_TXT_DP_IZ')"
      />
      <kw-tab
        name="4"
        :label="$t('MSG_TXT_TXINV')"
      />
      <kw-tab
        name="5"
        :label="$t('MSG_TXT_HW_CMNC_HIS')"
      />
      <kw-tab
        name="6"
        :label="$t('MSG_TXT_ELC_TASK_RQST')"
      />
      <kw-tab
        name="7"
        :label="$t('MSG_TXT_CLCTAM_CTT_CNTN')"
      />
    </kw-tabs>
    <kw-tab-panels model-value="4">
      <kw-tab-panel name="4">
        <kw-form
          ref="frmBaseRef"
          :cols="2"
          class="mt20"
        >
          <!-- 현금영수증 기본정보 변경 -->
          <h3>{{ `${$t('MSG_TXT_CASH_RCP')} ${$t('MSG_TXT_BASIC_INFO')} ${$t('MSG_TXT_CH')}` }}</h3>

          <div class="border-box mt10">
            <kw-form-row>
              <!-- 발행구분 -->
              <kw-form-item
                :label="t('MSG_TXT_ISSUANCE_CLAR')"
                required
              >
                <kw-select
                  v-model="fieldBaseParams.cssrIsDvCd"
                  :options="codes.CSSR_IS_DV_CD"
                  :readonly="isDefault"
                  rules="required"
                  @change="onChangedcssrIsDvCd"
                />
                <kw-input
                  v-model="fieldBaseParams.cssrIsNo"
                  v-model:tel-no0="fieldBaseParams.cralLocaraTno"
                  v-model:tel-no1="fieldBaseParams.mexnoEncr"
                  v-model:tel-no2="fieldBaseParams.cralIdvTno"
                  class="px5"
                  :mask="fieldBaseParams.mask"
                  :rules="fieldBaseParams.cssrIsDvCd === '4' ? 'required|telephone' : 'required'"
                  :label="t('MSG_TXT_ISSUANCE_CLAR')"
                  :readonly="isCssrEmpty"
                />
              </kw-form-item>
              <!-- 변경사유 -->
              <kw-form-item
                :label="t('MSG_TXT_CH_RSON')"
                required
              >
                <kw-input
                  v-model="fieldBaseParams.chRsonCn"
                  type="text"
                  class="px5"
                  :label="t('MSG_TXT_CH_RSON')"
                  rules="required"
                  maxlength="2000"
                />
              </kw-form-item>
            </kw-form-row>
          </div>
          <kw-action-bottom>
            <div v-show="!isDefault">
              <!-- 초기화 -->
              <kw-btn
                :label="$t('MSG_BTN_INTL')"
                class="mx7"
                @click="onClickBaseReset"
              />
              <!-- 저장 -->
              <kw-btn
                :label="$t('MSG_BTN_SAVE')"
                negative
                @click="onClickSave"
              />
            </div>
            <!-- 기본정보 변경 -->
            <kw-btn
              v-show="isDefault"
              v-model="defaultCheck"
              :label="`${$t('MSG_TXT_BASIC_INFO')} ${$t('MSG_TXT_CH')}`"
              negative
              @click="onclickDefault"
            />
          </kw-action-bottom>
        </kw-form>

        <h3>{{ `${$t('MSG_TXT_CASH_RCP')} ${$t('MSG_TXT_ISSUANCE_IZ')}` }}</h3> <!-- 현금영수증 발행내역 -->
        <kw-action-top>
          <template #left>
            <kw-paging-info
              :total-count="7"
            />
          </template>
          <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </kw-action-top>

        <kw-grid
          :visible-rows="10"
          @init="initGrid"
        />
        <kw-form
          ref="frmRpblRef"
          :cols="2"
          class="mt20"
        >
          <h3>{{ `${$t('MSG_TXT_CASH_RCP')} ${$t('MSG_TXT_RPBL')}` }}</h3> <!-- 현금영수증 재발행 -->

          <div class="border-box mt10">
            <kw-form-row>
              <!-- 발행구분 -->
              <kw-form-item
                :label="t('MSG_TXT_ISSUANCE_CLAR')"
                required
              >
                <kw-select
                  v-model="fieldRpblParams.cssrIsDvCd"
                  :options="codes.CSSR_IS_DV_CD"
                  rules="required"
                  @change="onChangedcssrIsDvCdRpbl"
                />
                <kw-input
                  v-model="fieldRpblParams.cssrIsNo"
                  v-model:tel-no0="fieldRpblParams.cralLocaraTno"
                  v-model:tel-no1="fieldRpblParams.mexnoEncr"
                  v-model:tel-no2="fieldRpblParams.cralIdvTno"
                  class="px5"
                  :mask="fieldRpblParams.mask"
                  :rules="fieldRpblParams.cssrIsDvCd === '4' ? 'required|telephone' : 'required'"
                  :label="t('MSG_TXT_ISSUANCE_CLAR')"
                  :readonly="isCssrRpblEmpty"
                />
              </kw-form-item>
              <!-- 변경사유 -->
              <kw-form-item
                :label="t('MSG_TXT_CH_RSON')"
                required
              >
                <kw-input
                  v-model="fieldRpblParams.chRsonCn"
                  type="text"
                  class="px5"
                  :label="t('MSG_TXT_CH_RSON')"
                  rules="required"
                  maxlength="2000"
                />
              </kw-form-item>
            </kw-form-row>
          </div>
        </kw-form>
        <kw-action-bottom>
          <!-- 초기화 -->
          <kw-btn
            :label="$t('MSG_BTN_INTL')"
            @click="onClickRpblReset"
          />
          <!-- 재발행 -->
          <kw-btn
            :label="t('MSG_BTN_RPBL')"
            @click="onClickRpbl"
          />
        </kw-action-bottom>
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, useDataService } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();

const props = defineProps({
  cntrNo: { type: String, required: true, default: '' }, // 계약번호
  cntrSn: { type: String, required: false, default: '' }, // 계약일련번호
});

const cachedParams = ref();
const frmBaseRef = ref(getComponentType('KwForm'));
const frmRpblRef = ref(getComponentType('KwForm'));

const isFirstOpen = ref(true);
const defaultCheck = ref(true); // 기본정보 변경 버튼 초기값

const fieldBaseParams = ref({
  // 기본정보 변경
  chRsonCn: '', // 변경사유
  cssrIsDvCd: '', // 발행구분
  cralLocaraTno: '', // 휴대전화 통신사 식별번호
  cssrIsNo: '', // 발행구분 값
  mexnoEncr: '', // 휴대전화 중간자리
  cralIdvTno: '', // 휴대전화 끝자리
  phoneNo: '', // 휴대전화 전체번호
  mask: '', // 마스크
});

const fieldRpblParams = ref({
  // 재발행
  chRsonCn: '', // 변경사유
  cssrIsDvCd: '', // 발행구분
  cralLocaraTno: '', // 휴대전화 통신사 식별번호
  cssrIsNo: '', // 발행구분 값
  mexnoEncr: '', // 휴대전화 중간자리
  cralIdvTno: '', // 휴대전화 끝자리
  phoneNo: '', // 휴대전화 전체번호
  mask: '', // 마스크
});

const isDefault = computed(() => defaultCheck.value); // 기본정보 변경 버튼클릭 여부
const isCssrEmpty = computed(() => isEmpty(fieldBaseParams.value.cssrIsDvCd) || isDefault.value); // 발행구분 선택 여부
const isCssrRpblEmpty = computed(() => isEmpty(fieldRpblParams.value.cssrIsDvCd)); // 재발행구분 선택 여부

const codes = await codeUtil.getMultiCodes(
  'CSSR_IS_DV_CD',
);

codes.CSSR_IS_DV_CD = codes.CSSR_IS_DV_CD.filter((v) => v.codeId !== '2');

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// onclickDefault: 기본정보 변경 버튼 클릭
function onclickDefault() {
  defaultCheck.value = !defaultCheck.value;
}

// onClickSave 기본정보 변경 저장 버튼 클릭
function onClickSave() {

}

// onClickRpbl: 재발행 버튼 클릭
function onClickRpbl() {

}

// onClickRpblReset: 재발행 초기화 버튼 블릭
function onClickRpblReset() {
  frmRpblRef.value.reset();
  frmRpblRef.value.init();
}

// changeMask: Mask 포맷 설정
function changeMask(cssrIsDvCd) {
  let mask;
  switch (cssrIsDvCd) {
    case '1':
      mask = '####-####-####-####';
      break;
    case '3':
      mask = '###-##-#####';
      break;
    default:
      mask = 'telephone';
      break;
  }
  return mask;
}

function changeBaseValues() {
  if (!isFirstOpen.value) {
    fieldBaseParams.value.cssrIsNo = null; // 발행구분 값
    fieldBaseParams.value.cralLocaraTno = null; // 휴대전화 통신사 식별번호
    fieldBaseParams.value.mexnoEncr = null; // 휴대전화 중간자리
    fieldBaseParams.value.cralIdvTno = null; // 휴대전화 끝자리
    fieldBaseParams.value.mask = changeMask(fieldBaseParams.value.cssrIsDvCd);
  } else {
    fieldBaseParams.value.cssrIsNo = cachedParams.value.cssrIsNo; // 발행구분 값
    fieldBaseParams.value.cralLocaraTno = cachedParams.value.cralLocaraTno; // 휴대전화 통신사 식별번호
    fieldBaseParams.value.mexnoEncr = cachedParams.value.mexnoEncr; // 휴대전화 중간자리
    fieldBaseParams.value.cralIdvTno = cachedParams.value.cralIdvTno; // 휴대전화 끝자리
    fieldBaseParams.value.cssrIsDvCd = cachedParams.value.cssrIsDvCd; // 발행구분
    fieldBaseParams.value.mask = changeMask(cachedParams.value.cssrIsDvCd);
  }
}

// fetchData: 기본정보 조회 및 현금영수증 발행내역 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/contracts/order-details/cash-sales-receipts', { params: { cntrNo: props.cntrNo, cntrSn: props.cntrSn } });

  fieldBaseParams.value.cssrIsNo = res.data.cssrIsNo; // 발행구분 값
  fieldBaseParams.value.cssrIsDvCd = res.data.cssrIsDvCd; // 발행구분
  fieldBaseParams.value.chRsonCn = res.data.chRsonCn; // 변경사유

  cachedParams.value = cloneDeep(fieldBaseParams.value); // 기본정보 초기화용 값
  cachedParams.value.mask = changeMask(fieldBaseParams.value.cssrIsDvCd); // 마스크

  /* TODO: 현금영수증 발행내역 테이블 작업 완료 후 추가예정 */
}

// onChangedcssrIsDvCd: 기본정보 발행구분 변경 시 발생하는 이벤트
async function onChangedcssrIsDvCd() {
  console.log('changed');
  changeBaseValues();
  isFirstOpen.value = false;
}

// onClickBaseReset: 기본정보 변경 초기화 버튼 블릭
function onClickBaseReset() {
  frmBaseRef.value.reset();
  frmBaseRef.value.init();
}

// onChangedcssrIsDvCdRpbl: 재발행 초기화 버튼 블릭
async function onChangedcssrIsDvCdRpbl() {
  fieldRpblParams.value.cssrIsNo = null; // 발행구분 값
  fieldRpblParams.value.cralLocaraTno = null; // 휴대전화 통신사 식별번호
  fieldRpblParams.value.mexnoEncr = null; // 휴대전화 중간자리
  fieldRpblParams.value.cralIdvTno = null; // 휴대전화 끝자리

  fieldRpblParams.value.mask = changeMask(fieldRpblParams.value.cssrIsDvCd); // 마스크
}

// onMounted: 초기값 설정 작업
onMounted(() => {
  fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

function initGrid(data, view) {
  const fields = [
    { fieldName: 'rveDt' },
    { fieldName: 'ocssrIsDvCd' },
    { fieldName: 'orcssrIsNo' },
    { fieldName: 'orcssrTrdAmt' },
    { fieldName: 'orcssrAprRsCd' },
    { fieldName: 'cssrIsNo' },
    { fieldName: 'chRsonCn' },
    { fieldName: 'fnlMdfcDtm' },
    { fieldName: 'fnlMdfcUsrNm' },
    { fieldName: 'fnlMdfcUsrId' },
  ];

  const columns = [
    { fieldName: 'rveDt', header: t('MSG_TXT_RVE_DT'), width: '131', styleName: 'text-center' }, // 수납일자
    { fieldName: 'ocssrIsDvCd', header: t('MSG_TXT_ISSUANCE_CLAR'), width: '131', styleName: 'text-center' }, // 발행구분
    { fieldName: 'orcssrIsNo', header: `${t('MSG_TXT_BFCH')} ${t('MSG_TXT_PBL_NO')}`, width: '131', styleName: 'text-center' }, // 변경 전
    { fieldName: 'orcssrTrdAmt', header: t('MSG_TXT_AMT'), width: '131', styleName: 'text-right' }, // 금액
    { fieldName: 'orcssrAprRsCd', header: t('MSG_TXT_APR_RS'), width: '131', styleName: 'text-center' }, // 승인결과
    { fieldName: 'cssrIsNo', header: `${t('MSG_TXT_AFCH')} ${t('MSG_TXT_PBL_NO')}`, width: '131', styleName: 'text-center' }, // 변경 후
    { fieldName: 'chRsonCn', header: t('MSG_TXT_CH_RSON'), width: '99', styleName: 'text-center' }, // 변경사유
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_RGST_DT'), width: '99', styleName: 'text-center' }, // 등록일
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FST_RGST_USR'), width: '99', styleName: 'text-center' }, // 등록자
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '99', styleName: 'text-center' }, // 번호

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2022-12-12', col2: 'Y', col3: '12346', col4: '1200,000', col5: '123456', col6: '-', col7: '-' },
  ]);
}
</script>
