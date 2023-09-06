<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : [CSA] 고객 - 고객관리 - 고객 SingleView
2. 프로그램 ID : WwcsaCustomerSingleViewDtlM - 고객 SingleView
3. 작성자 : domin.pyun
4. 작성일 : 2023.07.05
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 고객정보 SingleView 화면 (기본정보, 영업활동, 주요지표(계약~컨택), 관련 상세화면 Link)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      ref="searchRef"
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 고객명 개인 -->
        <kw-search-item
          :label="$t('MSG_TXT_CST_NM')"
          required
        >
          <kw-input
            v-model="searchParams.cstNm"
            :label="$t('MSG_TXT_CST_NM')"
            :maxlength="100"
            :regex="/^[A-Z가-힣ㄱ-ㅎ]*$/i"
            rules="required"
          />
        </kw-search-item>
        <!-- 고객명 개인 -->
        <!-- 생년월일 개인 -->
        <kw-search-item
          :label="$t('MSG_TXT_BIRTH_DATE')"
          required
        >
          <kw-date-picker
            v-model="searchParams.bryyMmdd"
            type="date"
            :label="$t('MSG_TXT_BIRTH_DATE')"
            rules="required"
          />
        </kw-search-item>
        <!-- 생년월일 개인 -->
        <!-- 성별 개인 -->
        <kw-search-item
          :label="$t('MSG_TXT_GENDER')"
        >
          <kw-option-group
            v-model="searchParams.sexDvCd"
            type="radio"
            :label="$t('MSG_TXT_GENDER')"
            :options="codes.SEX_DV_CD.filter(obj => obj.codeId <= '2')"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div
      v-if="!isEmpty(customerInfo?.cstNo)"
      class="normal-area normal-area--two-column"
    >
      <div class="normal-area--first-column">
        <!-- <div class="row">
          <p class="kw-font--14 kw-fc--black3">
            {{ customerInfo?.copnDvCd }}
          </p>
          <kw-separator
            spaced
            vertical
            class="my4 mx8"
          />
          <p class="kw-font--14 kw-fc--black3">
            {{ customerInfo?.cstGdCd }}
          </p>
        </div> -->
        <kw-action-top>
          <template #left>
            <p
              class="kw-font-pt20 text-bold text-underline cursor-pointer"
              @click="onClickCustomerDetail"
            >
              {{ customerInfo?.cstNm }}
            </p>
            <kw-chip
              v-if="!isEmpty(customerInfo?.cstGdCd)"
              :label="customerInfo?.cstGdNm"
              square
              color="primary"
              text-color="primary"
              class="ml12"
            />
            <!-- <p class="kw-font--14 kw-fc--black3 ml8">
              {{ customerInfo?.copnDvNm }}
            </p>
            <kw-separator
              v-if="!isEmpty(customerInfo?.copnDvCd)"
              spaced
              vertical
              class="my4 mx8"
            /> -->
            <span class="ml10">
              {{ !isEmpty(customerInfo?.bryyMmdd)?dayjs(customerInfo.bryyMmdd).format('YYYY-MM-DD'):'' }}
            </span>
            <kw-separator
              v-if="!isEmpty(customerInfo?.bryyMmdd)"
              spaced
              vertical
              class="my10 mx8"
            />
            <span>{{ customerInfo?.sexDvNm }}</span>
          </template>
          <kw-btn
            v-if="!isEmpty(customerInfo?.cstNo)"
            v-permission:create
            primary
            dense
            :label="$t('MSG_TXT_CNTR_WRTE')"
            @click="onClickContractRegistration"
          />
        </kw-action-top>
        <kw-separator
          spaced="0"
          color="black1"
          :size="'2px'"
        />
        <kw-form
          :cols="1"
          class="mt20"
          dense
        >
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_CST_NO')">
              <p>{{ customerInfo?.cstNo }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_CONTACT')">
              <p v-if="!isEmpty(customerInfo?.cstNo)">
                {{ customerInfo?.mpno }}
                <span v-if="isTelFormat(customerInfo?.hpno) || isHpFormat(customerInfo?.hpno)">
                  / {{ customerInfo?.hpno }}
                </span>
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_ADDR')">
              <p>{{ customerInfo?.adr }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>

        <kw-separator class="mb25" />

        <template
          v-if="Number(payments?.thisRentalAmt) + Number(payments?.pyAmt)
            + Number(payments?.dlqPdCount) + Number(payments?.cancelCount) > 0"
        >
          <kw-btn
            icon-right="arrow_right_24"
            borderless
            :label="$t('MSG_TXT_PY_PS')"
            class="button-arrow text-weight-medium"
            @click="onClickPaymentStatus"
          />
          <div class="current-result mt24">
            <div class="current-result-item">
              <p class="current-result-title">
                {{ $t('MSG_TXT_THM_RTLFE') }}
              </p>
              <span class="current-result-number--blue">
                {{ `${stringUtil.getNumberWithComma(payments?.thisRentalAmt)} 원` }}
              </span>
            </div>
            <kw-separator
              vertical
              class="mx0"
            />
            <div class="current-result-item">
              <p class="current-result-title">
                {{ $t('MSG_TXT_PY_FSH') }}
              </p>
              <span class="current-result-number">
                {{ `${stringUtil.getNumberWithComma(payments?.pyAmt)} 원` }}
              </span>
            </div>
          </div>
          <div
            v-if="Number(payments?.dlqPdCount) === 1"
            class="dashboard-solid-box dashboard-solid-box--bg-red mt20"
          >
            <p class="dashboard-solid-box--title kw-fc--error">
              {{ $t('MSG_TXT_DLQ') }}
            </p>
            <p class="dashboard-solid-box--content">
              <span>{{ `${$t('MSG_TXT_DLQAM')} ${stringUtil.getNumberWithComma(payments?.dlqAmt)} 원` }}</span>
              <span>{{ `${$t('MSG_TXT_DLQ_TN')} ${payments?.dlqMcn}` }}</span>
              <span>{{ `${$t('MSG_TXT_FNL_PY')} ${isEmpty(payments?.fnlPyDt)
                ?'':dayjs(payments?.fnlPyDt).format('YYYY-MM-DD')}` }}</span>
            </p>
          </div>
          <div
            v-else-if="Number(payments?.dlqPdCount) > 1"
            class="dashboard-solid-box dashboard-solid-box--bg-red mt20"
          >
            <p class="dashboard-solid-box--title kw-fc--error">
              {{ $t('MSG_TXT_DLQ') }}
            </p>
            <p class="dashboard-solid-box--content">
              <span>{{ `${$t('MSG_TXT_DLQ_PD_N')} ${payments?.dlqPdCount}` }}</span>
              <span>{{ `${$t('MSG_TXT_TOT_DLQ_AM')} ${stringUtil.getNumberWithComma(payments?.dlqAmt)} 원` }}</span>
              <span>{{ `${$t('MSG_TXT_DLQ_TN')} ${payments?.dlqMcn}` }}</span>
            </p>
          </div>
          <div
            v-else-if="Number(payments?.cancelCount) > 0"
            class="dashboard-solid-box dashboard-solid-box--bg-red mt20"
          >
            <p class="dashboard-solid-box--title kw-fc--error">
              {{ $t('MSG_TXT_DLQ') }}
            </p>
            <p class="dashboard-solid-box--content">
              <span>{{ `${$t('MSG_TXT_CNTR_CAN_PD_N')} ${payments?.cancelCount} 건` }}</span>
              <span>{{ `${$t('MSG_TXT_TOT_CCAM')} ${stringUtil.getNumberWithComma(payments?.cancelFeeAmt)} 원` }}</span>
            </p>
          </div>
        </template>
        <template v-else>
          <h4 class="mb0">
            {{ $t('MSG_TXT_PY_PS') }}
          </h4>
          <div class="mt24 mb50">
            <p class="kw-fc--black3 text-center kw-font-pt14">
              {{ $t('MSG_ALT_NO_PY_IZ') }}
            </p>
          </div>
        </template>

        <kw-separator class="mb25" />

        <template v-if="contracts.length > 0">
          <kw-btn
            icon-right="arrow_right_24"
            borderless
            :label="$t('MSG_TXT_CNTR_STATE')"
            class="button-arrow text-weight-medium"
            @click="onClickContractStatus"
          />
          <table
            style="width: 100%;"
            class="info-table mt20"
          >
            <colgroup>
              <col style="width: 120px;">
              <col style="width: auto;">
              <col style="width: 130px;">
              <col style="width: 115px;">
            </colgroup>
            <tbody>
              <tr
                v-for="(contract, contractIdx) in contracts"
                :key="contractIdx"
              >
                <td class="text-center">
                  {{ dayjs(contract.cntrRcpFshDt).format('YYYY-MM-DD') }}
                </td>
                <td class="text-left">
                  <kw-btn
                    underline
                    class="h20"
                    style="max-width: 100%;"
                    @click="onClickContractDetailPop(contract)"
                  >
                    <p class="ellipsis h20">
                      {{ contract.pdNm }}
                      <kw-tooltip
                        show-when-ellipsised
                        class="ellipsis_tooltip"
                        anchor="bottom start"
                        self="top start"
                        :offset="[-8, 0]"
                      >
                        {{ contract.pdNm }}
                      </kw-tooltip>
                    </p>
                  </kw-btn>
                </td>
                <td class="text-center">
                  {{ contract.istCstKnm }}
                </td>
                <td class="text-left">
                  {{ contract.cntrPrgsStatNm }}
                </td>
              </tr>
            </tbody>
          </table>
        </template>
        <template v-else>
          <h4 class="mb0">
            {{ $t('MSG_TXT_CNTR_STATE') }}
          </h4>
          <div class="mt24 mb50">
            <p class="kw-fc--black3 text-center kw-font-pt14">
              {{ $t('MSG_ALT_NO_CNTR_IZ') }}
            </p>
          </div>
        </template>
      </div>
      <kw-separator
        spaced
        vertical
        inset
        class="mx40 my0"
      />

      <div class="normal-area--second-column col column no-wrap">
        <h1>{{ $t('MSG_TXT_HSHD_PS') }}</h1>
        <kw-scroll-area
          class="border-box pa30 mt20 kw-scroll-area--auto-height"
          visible
        >
          <div class="q-scroll--inside px40 py30">
            <template v-if="services.length > 0">
              <kw-btn
                icon-right="arrow_right_24"
                borderless
                :label="$t('MSG_TXT_SV_HIST')"
                class="kw-font--18 text-weight-medium"
                @click="onClickServiceHistory"
              />
              <table
                style="width: 100%;"
                class="info-table mt20"
              >
                <colgroup>
                  <col style="width: 110px;">
                  <col style="width: 120px;">
                  <col style="width: 70px;">
                  <col style="width: 100px;">
                  <col style="width: auto;">
                </colgroup>
                <tbody>
                  <tr
                    v-for="(service, serviceIdx) in services"
                    :key="serviceIdx"
                  >
                    <td class="text-center">
                      {{ dayjs(service.wkExcnDt).format('YYYY-MM-DD') }}
                    </td>
                    <td class="text-left">
                      {{ service.cntrNo }}
                    </td>
                    <td class="text-center">
                      {{ service.serviceGb }}
                    </td>
                    <td class="text-left">
                      {{ service.pdGrpNm }}
                    </td>
                    <td class="text-left">
                      <p class="ellipsis">
                        {{ service.partPdNm }}
                        <kw-tooltip
                          show-when-ellipsised
                          class="ellipsis_tooltip"
                          anchor="bottom start"
                          self="top start"
                          :offset="[-8, 0]"
                        >
                          {{ service.partPdNm }}
                        </kw-tooltip>
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </template>
            <template v-else>
              <h3 class="mb0">
                {{ $t('MSG_TXT_SV_HIST') }}
              </h3>
              <div class="mt24 mb50">
                <p class="kw-fc--black3 text-center kw-font-pt14">
                  {{ $t('MSG_ALT_NO_SV_IZ') }}
                </p>
              </div>
            </template>

            <kw-separator />

            <div class="row align-center justify-between">
              <h3 class="mb0">
                {{ $t('MSG_TXT_CRTL_HV_PD', [productCount]) }}
              </h3>
              <kw-btn
                v-if="products.length > 0"
                :label="$t('MSG_TXT_WO_PRCHS_PD')"
                dense
                @click="onClickContractIntegration"
              />
            </div>
            <div>
              <!-- active class : 현재 해당 페이지의 정보자 표시 할 때 클래스 추가  -->
              <!-- <div class="border-box mt20 py20 active"> -->
              <template v-if="products.length > 0">
                <div
                  v-for="(product, productIdx) in products"
                  :key="productIdx"
                  class="border-box mt20 py20"
                >
                  <div class="row">
                    <kw-btn
                      :label="product.pdNm"
                      underline
                      class="text-weight-medium"
                      @click="onClickContractDetailPop(product)"
                    />
                    <kw-separator
                      spaced
                      vertical
                      class="my5 mx20"
                    />
                    <span>{{ product.sellTpNm }}</span>
                    <kw-separator
                      spaced
                      vertical
                      class="my5 mx20"
                    />
                    <span>
                      {{ `${product.sellTpCd !== '1' ? '월' : ''} ${isEmpty(product.fnlAmt)
                        ? '0' : stringUtil.getNumberWithComma(product.fnlAmt)} 원` }}
                    </span>
                  </div>

                  <kw-separator class="my12" />

                  <kw-form
                    :cols="2"
                    dense
                  >
                    <kw-form-row>
                      <kw-form-item :label="$t('MSG_TXT_INSTR')">
                        <p>{{ product.rcgvpKnm }}</p>
                      </kw-form-item>
                      <kw-form-item :label="$t('MSG_TXT_PIC')">
                        <p>{{ product.prtnrKnm }}</p>
                      </kw-form-item>
                    </kw-form-row>
                    <kw-form-row>
                      <kw-form-item
                        v-if="(product.sellTpCd === '1' || product.sellTpCd === '3')
                          && !isEmpty(product.frisuBfsvcEnddt)"
                        :label="$t('MSG_TXT_FRISU_MSH')"
                      >
                        <p>{{ `${dayjs(product.frisuBfsvcEnddt).format('YYYY-MM-DD')} 만료` }}</p>
                      </kw-form-item>
                      <kw-form-item
                        v-else
                        :label="$t('MSG_TXT_USE_STPL_PTRM')"
                      >
                        <!-- kw-fc--error class : 남은 기간 3 개월 남았을 때 빨간색으로 색으로 바뀜  -->
                        <p>
                          <span :class="product.expireSoonYn === 'Y' ? 'kw-fc--error' : ''">
                            {{ `${product.rentalTn} 차월` }}
                          </span>
                          {{ `/ ${product.cntrPtrm} 개월` }}
                        </p>
                      </kw-form-item>
                      <kw-form-item :label="$t('MSG_TXT_BFSVC_PRD')">
                        {{ `${product.svPrd} 개월` }}
                      </kw-form-item>
                    </kw-form-row>
                    <kw-form-row>
                      <kw-form-item
                        :label="$t('MSG_TXT_RECT_BFSVC')"
                      >
                        <p>{{ !isEmpty(product.lastBs)?dayjs(product.lastBs).format('YYYY-MM-DD'):'' }}</p>
                      </kw-form-item>
                      <kw-form-item
                        :label="$t('MSG_TXT_NEXT_BFSVC')"
                      >
                        <p>{{ !isEmpty(product.nextBs)?dayjs(product.nextBs).format('YYYY-MM-DD'):'' }}</p>
                      </kw-form-item>
                    </kw-form-row>
                  </kw-form>
                </div>
              </template>
              <div
                v-else
                class="q-scroll--inside px40 py30"
              >
                <div class="mt24 mb50">
                  <p class="kw-fc--black3 text-center kw-font-pt14">
                    {{ $t('MSG_ALT_CRTL_HV_PD') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </kw-scroll-area>
      </div>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useGlobal, useDataService, getComponentType, codeUtil, stringUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { modal, notify, alert } = useGlobal();
const router = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const searchRef = ref(getComponentType('KwSearch'));

const codes = await codeUtil.getMultiCodes(
  'SEX_DV_CD',
  'COPN_DV_CD',
  'CST_GD_CD',
);

let cachedParams;

const searchParams = ref({
  cstNm: '', /* 이름 */
  sexDvCd: '1', /* 성별 */
  bryyMmdd: '', /* 생년월일 */
});

const customerInfo = ref({
  cstNo: '',
  copnDvCd: '',
  copnDvNm: '',
  cstGdCd: '',
  cstGdNm: '',
  cstNm: '',
  bryyMmdd: '',
  sexDvCd: '',
  sexDvNm: '',
  zip: '',
  basAdr: '',
  dtlAdr: '',
  adr: '',
  cralLocaraTno: '',
  mexnoEncr: '',
  cralIdvTno: '',
  mpno: '',
  hpLocaraTno: '',
  hpEncr: '',
  hpIdvTno: '',
  hpno: '',
  safeKeyDupYn: '',
});

const payments = ref({});
const contracts = ref([]);
const services = ref([]);
const products = ref([]);
const productCount = ref(0);

function initData() {
  customerInfo.value = {
    cstNo: '',
    copnDvCd: '',
    copnDvNm: '',
    cstGdCd: '',
    cstGdNm: '',
    cstNm: '',
    bryyMmdd: '',
    sexDvCd: '',
    sexDvNm: '',
    zip: '',
    basAdr: '',
    dtlAdr: '',
    adr: '',
    cralLocaraTno: '',
    mexnoEncr: '',
    cralIdvTno: '',
    mpno: '',
    hpLocaraTno: '',
    hpEncr: '',
    hpIdvTno: '',
    hpno: '',
    safeKeyDupYn: '',
  };
  payments.value = {};
  contracts.value = [];
  services.value = [];
  products.value = [];
  productCount.value = 0;
}

async function fetchPaymentData() {
  const res = await dataService.get(`sms/wells/customer/single-views/payments/${customerInfo.value.cstNo}`);
  payments.value = cloneDeep(res.data);
}

async function fetchContractData() {
  const res = await dataService.get(`sms/wells/customer/single-views/contracts/${customerInfo.value.cstNo}`);
  contracts.value = cloneDeep(res.data);
}

async function fetchServiceData() {
  const res = await dataService.get(`sms/wells/customer/single-views/services/${customerInfo.value.cstNo}`);
  services.value = cloneDeep(res.data);
}

async function fetchProductData() {
  const res = await dataService.get(`sms/wells/customer/single-views/products/${customerInfo.value.cstNo}`);
  products.value = cloneDeep(res.data);
  productCount.value = products.value?.length ?? 0;
}

function setCustomerData(customerData) {
  if (!isEmpty(customerData)) {
    customerInfo.value = cloneDeep(customerData);
    customerInfo.value.copnDvCd = codes.COPN_DV_CD.find((x) => x.codeId === customerInfo.value.copnDvCd)?.codeName;
    customerInfo.value.cstGdCd = codes.CST_GD_CD.find((x) => x.codeId === customerInfo.value.cstGdCd)?.codeName;
    customerInfo.value.sexDvCd = codes.SEX_DV_CD.find((x) => x.codeId === customerInfo.value.sexDvCd)?.codeName;

    fetchPaymentData();
    fetchContractData();
    fetchServiceData();
    fetchProductData();
  } else {
    initData();
  }
}

async function fetchCustomerData() {
  const res = await dataService.get('/sms/wells/customer/single-views/customer-infos', { params: { ...cachedParams } });
  const resData = cloneDeep(res.data);

  if (resData.length === 1) {
    setCustomerData(resData[0]);
  } else if (resData.length > 1) {
    const pextCstList = resData;
    const { result, payload } = await modal({
      component: 'ZwcsaCustomerChoiceListP',
      componentProps: { pextCstList,
        copnDvCd: '1',
        callingPage: 'singleView',
      },
    });
    if (result) {
      if (!isEmpty(payload)) {
        setCustomerData(resData.filter((item) => item.cstNo === payload.cstNo)?.[0]);
      }
    }
  } else {
    notify(t('MSG_ALT_CST_INF_NOT_EXST'));
    setCustomerData(null);
  }
}

async function onClickSearch() {
  if (!await searchRef.value.validate()) { return; }
  cachedParams = cloneDeep(searchParams.value);
  await fetchCustomerData();
}

function onClickCustomerDetail() {
  router.push({
    path: '/customer/wwcsa-customer-single-view-dtl/zwcsa-indv-customer-mod',
    query: {
      cstNo: customerInfo.value.cstNo,
      safeKeyDupYn: customerInfo.value.safeKeyDupYn,
      callingPage: 'singleView',
    },
  });
}

function onClickContractRegistration() {
  router.push(
    {
      path: '/contract/wwcta-contract-registration-mgt',
      query: {
        cstKnm: customerInfo.value.cstNm,
        cralLocaraTno: customerInfo.value.cralLocaraTno,
        mexnoEncr: customerInfo.value.mexnoEncr,
        cralIdvTno: customerInfo.value.cralIdvTno,
      },
    },
  );
}

function onClickContractStatus() {
  router.push(
    {
      path: '/contract/wwcta-contract-status-list',
      query: {
        srchDv: 'NO',
        srchCstNm: customerInfo.value.cstNm,
      },
    },
  );
}

function onClickContractIntegration() {
  router.push(
    {
      path: '/contract/wwcta-contract-integration-list',
      query: {
        cntrCstSeltDv: '2',
        cntrCstNo: customerInfo.value.cstNo,
      },
    },
  );
}

async function onClickContractDetailPop(dataInfo) {
  await modal({
    component: 'WwctaOrderDetailP',
    componentProps: {
      cntrNo: dataInfo.cntrNo,
      cntrSn: dataInfo.cntrSn,
      sellTpCd: dataInfo.sellTpCd,
      cntrCstNo: dataInfo.cntrCstNo,
      copnDvCd: '1',
    },
    draggable: true,
    window: true,
    windowFeatures: { width: 1300, height: 1080 },
  });
}

function onClickPaymentStatus() {
  router.push(
    {
      path: '/withdrawal/zwwda-create-itemization-mgt',
    },
  );
}

async function onClickServiceHistory() {
  await alert('개인별 서비스현황 화면 개발중');
}

function isTelFormat(tel) {
  if (isEmpty(tel)) {
    return false;
  }
  tel = tel.replaceAll('-', '');
  const telRule = /^(070|02|0[3-9]{1}[0-9]{1})[0-9]{3,4}[0-9]{4}$/;
  return telRule.test(tel);
}

function isHpFormat(hp) {
  if (isEmpty(hp)) {
    return false;
  }
  hp = hp.replaceAll('-', '');
  const hpRule = /^(01[016789]{1})[0-9]{3,4}[0-9]{4}$/;
  return hpRule.test(hp);
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
</script>

<style scoped lang="scss">
.normal-area--two-column {
  border: 1px solid #eee;
}

.text-underline {
  text-underline-position: under;
}

.info-table {
  table-layout: fixed;
}

</style>
