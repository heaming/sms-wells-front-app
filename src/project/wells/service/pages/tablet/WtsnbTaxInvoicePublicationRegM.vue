<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB (방문관리)
2. 프로그램 ID : WtsnbTaxInvoicePublicationRegM - 세금계산서 발행 요청
3. 작성자 : hyewon.kim
4. 작성일 : 2023.06.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 미인증 세션 페이지
- 세금계산서 발행 요청 - 일반 (http://localhost:3000/tablet/#/ns/wtsnb-tax-invoice-publication-reg)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-action-top class="mb18">
      <template #left>
        <kw-paging-info :total-count="services.length" />
      </template>
      <!-- 총 결제예정금액 -->
      <span class="w108 mr16">{{ $t('MSG_TXT_TOT_STLM_EXP_AMT') }}</span>
      <span class="accent kw-font-pt18">{{ stringUtil.getNumberWithComma(taxInvoiceData.totalAmt) ?? 0 }}원</span>
    </kw-action-top>
    <kw-separator
      spaced="0"
      color="black1"
    />
    <kw-list
      :items="services"
      separator
      item-padding="16px 0"
      clickable
      item-key="id"
    >
      <template #item="{ item }">
        <kw-item-section
          class="pr0 w160 mr60 justify-start"
          top
        >
          <kw-item-label
            font="body"
            font-weight="700"
          >
            {{ item.rcgvpKnm ?? '-' }}
          </kw-item-label>
          <kw-item-label
            class="kw-font-pt14 text-weight-regular mt8 kw-fc--placeholder"
          >
            {{ `(${item.cntrNo}-${item.cntrSn})` }}
          </kw-item-label>
        </kw-item-section>
        <kw-item-section class="no-wrap">
          <kw-form
            :cols="2"
            dense
          >
            <kw-form-row>
              <!-- 상품정보 -->
              <kw-form-item :label="$t('MSG_TXT_PD_INF')">
                <p>{{ item.pdAbbrNm ?? '-' }}</p>
              </kw-form-item>
              <!-- 계약정보 -->
              <kw-form-item :label="$t('MSG_TXT_CNTR_INF')">
                <p>{{ getContractInfo(item.sellTpNm, item.copnDvNm, item.pdUswyNm, item.pdGdNm) }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <!-- 계약일자 -->
              <kw-form-item :label="$t('MSG_TXT_CNTR_DATE')">
                <p>{{ stringUtil.getDateFormat(item.cntrCnfmDtm ?? '') ?? '-' }}</p>
              </kw-form-item>
              <!-- 렌탈료 -->
              <kw-form-item :label="$t('MSG_TXT_RTLFE')">
                <p>{{ stringUtil.getNumberWithComma(item.mmIstmAmt ?? 0) ?? 0 }}원</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <!-- 결제금액 -->
              <kw-form-item :label="$t('MSG_TXT_STLM_AMT')">
                <p>{{ stringUtil.getNumberWithComma(item.stlmAmt) ?? 0 }}원</p>
              </kw-form-item>
            </kw-form-row>
          </kw-form>
        </kw-item-section>
      </template>
    </kw-list>

    <kw-separator
      spaced="0"
      color="line-bg"
    />

    <kw-form
      :cols="2"
      class="mt20"
    >
      <kw-form-row>
        <kw-form-item
          no-label
        >
          <kw-btn-toggle
            v-model="taxInvoiceData.billDvCd"
            :options="billDvCd"
            gap="0px"
            :dense="false"
            grow
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <ul class="kw-notification mt20">
      <li>{{ taxInvoiceData.billDvMsg }}</li>
    </ul>

    <kw-form
      :cols="2"
      class="mt20"
    >
      <kw-form-row>
        <!-- 사업자등록번호 -->
        <kw-form-item
          :label="$t('MSG_TXT_CRNO')"
          required
        >
          <kw-input
            v-model="taxInvoiceData.bzrno"
            mask="###-##-#####"
            :label="$t('MSG_TXT_CRNO')"
            :disable="taxInvoiceData.copnDvCd === '2' && !isEmpty(taxInvoiceData.bzrno)"
            rules="required|length:10"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 이메일 -->
        <kw-form-item
          :label="$t('MSG_TXT_EMAIL')"
          required
          :colspan="2"
        >
          <zwcm-email-address
            v-model="taxInvoiceData.email"
            :label="$t('MSG_TXT_EMAIL')"
            rules="required"
            class="grow"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <div class="tablet-action-left" />
      <div class="tablet-action-right">
        <!-- 발행요청 -->
        <kw-btn
          primary
          :label="$t('MSG_BTN_PBL_AK')"
          @click="onClickPublication"
        />
      </div>
    </template>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, useDataService, useGlobal, stringUtil, notify } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import ZwcmEmailAddress from '~common/components/ZwcmEmailAddress.vue';

const { alert, confirm } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();

const props = defineProps({
  cstSvAsnNos: {
    type: String,
    required: true,
    default: '1202301050000228931,3202208160000816781,1202209130000910286,1202210060000975127',
  },
  csBilNo: {
    type: String,
    required: true,
    default: 'WB202209260000000185',
  },
  ogTpCd: {
    type: String,
    required: true,
    default: 'W06',
  },
  prtnrNo: {
    type: String,
    required: true,
    default: '36671',
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
  csBilNo: props.csBilNo,
  totalAmt: 0,
  billDvCd: '2',
  billDvMsg: t('MSG_TXT_NTS_PBL_AFT_SV_CS_STLM'),
  copnDvCd: '',
  bzrno: '',
  emadr: '',
});

watch(() => taxInvoiceData.value.billDvCd, (val) => {
  if (val === '1') {
    taxInvoiceData.value.billDvMsg = t('MSG_TXT_SV_CS_STLM_AFT_NTS_PBL');
  } else if (val === '2') {
    taxInvoiceData.value.billDvMsg = t('MSG_TXT_NTS_PBL_AFT_SV_CS_STLM');
  }
});

async function validateBrzno() {
  const res = await dataService.get('/sms/wells/service/tax-invoices/business-number-check', { params: { bzrno: taxInvoiceData.value.bzrno } });

  if (res.data === 0) {
    notify(t('MSG_ALT_BZRC_PRR_RGST_NCST'));
    return false;
  }
  return true;
}

async function onClickPublication() {
  if (await frmMainRef.value.alertIfIsNotModified()) { return; }
  if (!await frmMainRef.value.validate()) { return; }
  if (!await validateBrzno()) return;

  if (await confirm(t('MSG_ALT_TXINV_PBL_AK_CONF'))) {
    const res = await dataService.put(`/sms/wells/service/tax-invoices/${taxInvoiceData.value.csBilNo}`, { ...taxInvoiceData.value });
    console.log(res);
    await alert(t('MSG_ALT_AK_FSH'));
    window.close();
  }
}

function getContractInfo(sellTpNm, copnDvNm, pdUswyNm, pdGdNm) {
  return `${sellTpNm ?? '-'} | ${copnDvNm ?? '-'} | ${pdUswyNm ?? '-'} | ${pdGdNm ?? '-'}`;
}

function setTotalAmt() {
  taxInvoiceData.value.totalAmt = services.value.reduce((pre, curr) => {
    pre += curr.stlmAmt ?? 0;
    pre += curr.mmIstmAmt ?? 0;
    return pre;
  }, 0);
}

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

onMounted(async () => {
  await fetchTaxInvoices();
});
</script>
