<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNB (방문관리)
 2. 프로그램 ID : WmsnbTaxInvoicePublicationRegM - 세금계산서 발행 요청 (모바일)
 3. 작성자 : hyewon.kim
 4. 작성일 : 2023.05.30
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 미인증 세션 페이지
 - 세금계산서 발행 요청 - 일반 (http://localhost:3000/mobile/#/ns/wmsnb-tax-invoice-publication-reg)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <div class="pa20">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="services.length" />
        </template>
      </kw-action-top>
      <kw-separator
        color="black1"
        spaced="0"
        class="mt12"
      />
      <kw-list
        item-padding="20px 0"
        :items="services"
        separator
      >
        <template #item="{ item }">
          <kw-item-section>
            <kw-item-label font="body">
              {{ item.rcgvpKnm ?? '-' }}
              <span class="kw-font-pt14 text-weight-regular kw-fc--placeholder ml4">
                {{ `(${item.cntrNo}-${item.cntrSn})` }}
              </span>
            </kw-item-label>
            <kw-item-label class="mt8">
              <kw-form dense>
                <!-- 상품정보 -->
                <kw-form-item :label="$t('MSG_TXT_PD_INF')">
                  <p>{{ item.pdAbbrNm }}</p>
                </kw-form-item>
                <!-- 계약정보 -->
                <kw-form-item :label="$t('MSG_TXT_CNTR_INF')">
                  <p>{{ getContractInfo(item.sellTpNm, item.copnDvNm, item.pdUswyNm, item.pdGdNm) }}</p>
                </kw-form-item>
                <!-- 계약일자 -->
                <kw-form-item :label="$t('MSG_TXT_CNTR_DATE')">
                  <p>{{ stringUtil.getDateFormat(item.cntrCnfmDtm ?? '') ?? '-' }}</p>
                </kw-form-item>
                <!-- 결제금액 -->
                <kw-form-item :label="$t('MSG_TXT_STLM_AMT')">
                  <p>{{ stringUtil.getNumberWithComma(item.stlmAmt) ?? 0 }}원</p>
                </kw-form-item>
              </kw-form>
            </kw-item-label>
          </kw-item-section>
        </template>
      </kw-list>
      <kw-separator
        spaced="0"
        color="black1"
        class="mb12"
      />
      <div class="row items-center justify-between">
        <!-- 발행금액 -->
        <p class="kw-fc--black1 kw-font-pt14 w110 pr12">
          {{ $t('MSG_TXT_PBL_AMT') }}
        </p>
        <p class="kw-font-body text-weight-bold">
          <span>{{ stringUtil.getNumberWithComma(taxInvoiceData.totalAmt) ?? 0 }}</span>원
        </p>
      </div>
    </div>
    <kw-separator divider />
    <div class="pa20">
      <kw-form ref="frmMainRef">
        <kw-btn-toggle
          v-model="taxInvoiceData.billDvCd"
          :options="billDvCd"
          gap="0px"
          :dense="false"
          grow
        />
        <ul class="kw-notification mt12">
          <li>{{ taxInvoiceData.billDvMsg }}</li>
        </ul>
        <!-- 사업자등록번호 -->
        <kw-input
          v-model="taxInvoiceData.bzrno"
          class="pt20"
          mask="###-##-#####"
          :label="$t('MSG_TXT_CRNO')"
          rules="required|length:10"
        />
        <!-- 이메일 -->
        <zwcm-email-address
          v-model="taxInvoiceData.emadr"
          :label="$t('MSG_TXT_EMAIL')"
          required
          class="py20"
        />
      </kw-form>
    </div>

    <template #action>
      <!-- 발행요청 -->
      <kw-btn
        filled
        primary
        :label="$t('MSG_BTN_PBL_AK')"
        @click="onClickPublication"
      />
    </template>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, useDataService, useGlobal, stringUtil, notify } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import { aesDec } from '~common/utils/common';
import ZwcmEmailAddress from '~common/components/ZwcmEmailAddress.vue';

const { alert, confirm } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();

const props = defineProps({
  cstSvAsnNos: {
    type: String,
    required: true,
  },
  csBilNo: {
    type: String,
    required: true,
  },
  ogTpCd: {
    type: String,
    required: true,
  },
  prtnrNo: {
    type: String,
    required: true,
  },
});

console.log(props);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const frmMainRef = ref(getComponentType('KwForm'));
const services = ref([]);

const billDvCd = [
  { codeId: '1', codeName: t('MSG_TXT_RCPT') }, // 영수
  { codeId: '2', codeName: t('MSG_TXT_BIL') }, // 청구
];

const taxInvoiceData = ref({
  csBilNo: props.csBilNo, // 비용청구번호
  totalAmt: 0, // 화면에 노출되는 총결제금액으로 렌탈료 합산
  stlmAmt: 0, // 렌탈료 제외한 결제금액 합계
  billDvCd: '2', // 청구구분코드
  billDvMsg: t('MSG_TXT_NTS_PBL_AFT_SV_CS_STLM'), // 청구구분메시지
  copnDvCd: '', // 법인격구분코드
  bzrno: '', // 사업자번호
  dlpnrCd: '', // 거래처코드
  emadr: '', // 이메일
});

// 청구구분코드에 따른 노출 메시지 셋팅
watch(() => taxInvoiceData.value.billDvCd, (val) => {
  if (val === '1') {
    taxInvoiceData.value.billDvMsg = t('MSG_TXT_SV_CS_STLM_AFT_NTS_PBL');
  } else if (val === '2') {
    taxInvoiceData.value.billDvMsg = t('MSG_TXT_NTS_PBL_AFT_SV_CS_STLM');
  }
});

// 사업자번호 등록여부 검사
async function validateBrzno() {
  const res = await dataService.get('/sms/wells/service/tax-invoices/business-number-check', { params: { bzrno: taxInvoiceData.value.bzrno } });
  console.log(res); // 거래처코드 확인

  if (isEmpty(res.data)) {
    console.log('세금계산서거래처추가기본 테이블에 사업자등록번호가 등록되어있지 않음.');
    notify(t('MSG_ALT_BZRC_PRR_RGST_NCST'));
    return false;
  }

  taxInvoiceData.value.dlpnrCd = res.data;
  return true;
}

// 기기 체크
async function checkMobile() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.indexOf('kakaotalk') > -1) {
    return 'kakaotalk';
  } if (ua.indexOf('android') > -1) {
    return 'android';
  } if (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1 || ua.indexOf('ipod') > -1) {
    return 'ios';
  }
  return 'other';
}

// 닫기
function close() {
  const windowInfo = window.navigator.userAgent || window.navigator.vendor || window.opera;
  const type = checkMobile();
  if (type === 'kakaotalk') {
    window.location.href = (/iPad|iPhone|iPod/.test(windowInfo)) ? 'kakaoweb://closeBrowser' : 'kakaotalk://inappbrowser/close';
  } else if (type === 'ios') {
    window.open('', '_self', '');
    window.close();
  } else {
    window.open('about:blank', '_self').self.close();
  }
}

// 발행 요청
async function onClickPublication() {
  if (await frmMainRef.value.alertIfIsNotModified()) { return; }
  if (!await frmMainRef.value.validate()) { return; }
  if (!await validateBrzno()) return;

  if (await confirm(t('MSG_ALT_TXINV_PBL_AK_CONF'))) {
    const existsCheckRes = await dataService.get('/sms/wells/service/tax-invoices/exists-check', { params: { csBilNo: taxInvoiceData.value.csBilNo } });

    if (existsCheckRes.data > 0) {
      if (await alert(t('MSG_ALT_ALRD_AK_FSH'))) { // '이미 요청 완료되었습니다.'
        close();
      }
    }

    console.log(taxInvoiceData.value);
    await dataService.post(`/sms/wells/service/tax-invoices/${taxInvoiceData.value.csBilNo}`, { ...taxInvoiceData.value });
    await alert(t('MSG_ALT_AK_FSH')); // '요청 완료되었습니다.'

    close();
  }
}

// 계약정보 표출 문구 가져오기
function getContractInfo(sellTpNm, copnDvNm, pdUswyNm, pdGdNm) {
  return `${sellTpNm ?? '-'} | ${copnDvNm ?? '-'} | ${pdUswyNm ?? '-'} ${pdGdNm ?? '-'}`;
}

// 발행금액 셋팅
function setTotalAmt() {
  taxInvoiceData.value.totalAmt = services.value.reduce((pre, curr) => {
    pre += curr.stlmAmt ?? 0;
    return pre;
  }, 0);
  taxInvoiceData.value.stlmAmt = services.value.reduce((pre, curr) => {
    pre += curr.stlmAmt ?? 0;
    return pre;
  }, 0);
}

// 조회
async function fetchTaxInvoices() {
  const res = await dataService.get('/sms/wells/service/tax-invoices', { params: { ...props, cstSvAsnNo: props.cstSvAsnNos } });
  console.log(res.data);
  services.value = res.data;
  const { copnDvCd, bzrno, emadr } = res.data[0] ?? {};
  taxInvoiceData.value.copnDvCd = copnDvCd;
  taxInvoiceData.value.bzrno = bzrno;
  taxInvoiceData.value.emadr = emadr;

  setTotalAmt();
}

// 암호화된 파라미터 넘어오는 경우 복호화
const decData = ref();
if (props.encryptedParam) {
  const paramString = aesDec(props.encryptedParam);
  decData.value = Object.fromEntries(new URLSearchParams(paramString));
  console.log(decData.value);
}

// 마운트 처리
onMounted(async () => {
  await fetchTaxInvoices();
});
</script>

<style scoped lang="scss">
.scoped_email_custom {
  flex-wrap: unset !important;

  ::v-deep(.zwcm-email-address__domain-select) {
    margin-top: 24px !important;
    margin-left: 8px !important;
    flex-basis: 50% !important;
  }
}
</style>
