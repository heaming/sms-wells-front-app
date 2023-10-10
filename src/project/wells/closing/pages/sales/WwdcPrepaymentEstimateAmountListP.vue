<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDC
2. 프로그램 ID : WwdcPrepaymentEstimateAmountListP - 선납예상금액 - W-WD-U-0026P01
3. 작성자 : KiMoon.lim
4. 작성일 : 2023.05.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 선납예상 팝업 - 선납예상금액조회
****************************************************************************************************
--->
<template>
  <kw-popup
    size="lg"
    no-action
  >
    <kw-search
      :cols="2"
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_PRM_MCNT')">
          <!-- 24, 36개월 미사용으로 인한 임시 disable 처리 -->
          <kw-option-group
            v-model="searchParams.prmMcn"
            :model-value="'12'"
            :disable="true"
            type="radio"
            :options="codes.ET_PRM_MCNT_CD.filter((p1) => ['12'].includes(p1.codeId))"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <h3>
      <!-- 선납현황 -->
      {{ t('MSG_TXT_PRM_PRCO') }}
      <ul class="kw-notification">
        <li>
          <!-- 월렌탈료 / 할인금액 -->
          {{ t('MSG_TXT_MM_RTLFE_MCNT_AMT') }}
        </li>
      </ul>
    </h3>
    <kw-action-top>
      <!-- 단위:원 -->
      <template #left>
        <span> {{ t('MSG_TXT_UNIT_COLON_WON') }}</span>
      </template>
      <!-- 선입금 렌탈조회-->
      <kw-btn
        :label="t('MSG_TIT_PRDPT_RENTAL_INQR')"
        primary
        dense
        @click="onClickFirstDepositRentalSearch"
      />
    </kw-action-top>
    <kw-form
      :cols="1"
      dense
    >
      <kw-form-row>
        <!-- 선납사유 -->
        <kw-form-item :label="t('MSG_TXT_PRM_PTRM')">
          <p class="kw-font-pt14 text-weight-regular">
            {{ returnData.prmStrtAndEndYm }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 월렌탈료 -->
        <kw-form-item
          :label="t('MSG_TXT_MM_RTLFE')"
        >
          <p class="kw-fc--black1 text-right ml16">
            {{ returnData.dcAmt }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 할인 금액 -->
        <kw-form-item
          :label="t('MSG_TXT_DSC_AMT')"
        >
          <p class="kw-fc--black1 text-right ml16">
            {{ returnData.dcData }}
          </p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <h3>
      <!-- 선납예상금액 -->
      {{ t('MSG_TXT_PRM_ET_AMT') }}
    </h3>
    <kw-action-top>
      <template #left>
        <!-- 단위: 원 -->
        <span>({{ t('MSG_TXT_UNIT_COLON_WON') }}</span>
      </template>
    </kw-action-top>
    <kw-form
      :cols="1"
    >
      <kw-form-row>
        <!-- 선납예상 총금액 -->
        <kw-form-item :label="t('MSG_TXT_PRM_ET_TOT_AMT')">
          <p class="kw-fc--black1 text-right ml16">
            {{ returnData.totDpAmt }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 실제납입예상금액-->
        <kw-form-item
          :label="t('MSG_TXT_ACL_PY_ET_AMT')"
        >
          <p class="kw-fc--black1 text-right ml16">
            {{ returnData.prmExpAmt }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 선납불가인 경우-->
        <kw-form-item
          :label="t('MSG_TXT_PRM_IMP_CHECK')"
        >
          <kw-input
            v-model="returnData.cntrChDtlAkCn"
            @keydown.enter="onClickPressSave"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useGlobal, useModal, useDataService, codeUtil } from 'kw-lib'; // defineGrid, codeUtil
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { modal, notify } = useGlobal();
const { ok } = useModal();
const dataService = useDataService();
const props = defineProps({
  cntrNo: {
    type: String,
    default: null,
  },
  cntrSn: {
    type: Number,
    default: null,
  },

  baseYearFrom: {
    type: String,
    default: null,
  },

  baseYearTo: {
    type: String,
    default: null,
  },
});

const codes = await codeUtil.getMultiCodes(
  'ET_PRM_MCNT_CD', // 선납 개월
  'COD_PAGE_SIZE_OPTIONS',
);

let cachedParams;
const searchParams = ref({
  cntrNo: '',
  cntrSn: '',
  prmMcn: '12', // 선납개월 : 12개월(1년) default
});
const returnData = ref({
  rentalAmt: 0, /* 총 입금 금액 */
  prmStrtY: 0, /* 선납기간 From 연도 */
  prmStrtMm: 0, /* 선납기간 Form 월 */
  prmEndY: 0, /* 선납기간 To 연도 */
  prmEndMm: 0, /* 선납기간 To 월 */

  prmStrtAndEndYm: '',

  totDpAmt: 0, /* 총 선납금액 */
  prmExpAmt: 0, /* 실제납입 예상금액 */
  dcAmt: 0, /* 할인금액 */
  dcData: 0, /* 할인료 */
  cntrChDtlAkCn: '', /* 선납 불가사유 : *확인필요 */
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
/**
 * 테스트 데이터 W20232631081-1 계약자명 홍수민
 * TODO: AS-IS 기준 데이터 기입, 해당팝업 사용하는 "매출 실적 현황 - WwdcbSalesPerformanceListM " 화면 참조하여 수정요함.
 *
*/
async function fetchData() {
  const res = await dataService.get('/sms/wells/withdrawal/pchssl/prepayment-et-amt', { params: cachedParams });
  returnData.value = res.data[0];
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickFirstDepositRentalSearch() {
  // console.log('선입금렌탈조회'); // 선입금렌탈조회 페이지에서는 계약상세번호로 조회함.
  const cntrDtlNo = `${props.cntrNo}-${props.cntrSn}`;

  await modal({
    component: 'WwdcbPrepaidDepositRentalP',
    componentProps: { cntrDtlNo },
  });
}

async function onClickPressSave() {
  if (!isEmpty(returnData.value.cntrChDtlAkCn)) {
    await ok();
  } else {
    // TODO: 입력 후 어떤 이벤트를 발생해야할지 애매하여 임시처리
    await notify(t('MSG_ALT_IMP_RSON_IN')); // 사유를 입력하세요
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
onMounted(async () => {
  searchParams.value.cntrNo = props.cntrNo;
  searchParams.value.cntrSn = props.cntrSn;
});
</script>
