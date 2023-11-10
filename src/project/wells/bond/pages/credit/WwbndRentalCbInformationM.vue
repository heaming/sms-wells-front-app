<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BND
2. 프로그램 ID : WwbndRentalCbInformationM
3. 작성자 : sunghun.choi
4. 작성일 : 2023.06.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈CB 정보 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CST_NM')"
        >
          <kw-input
            v-model="searchParams.cstNm"
            :disable="true"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CST_NO')"
        >
          <kw-input
            v-model="searchParams.cstNo"
            :disable="true"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_MPNO')"
        >
          <kw-input
            v-model:tel-no0="searchParams.insHpNo1"
            v-model:tel-no1="searchParams.insHpNo2"
            v-model:tel-no2="searchParams.insHpNo3"
            mask="telephone"
            :disable="true"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SFK')"
          required
        >
          <kw-input
            v-model="searchParams.rsdnNo"
            :label="$t('MSG_TXT_SFK')"
            icon="search"
            clearable
            rules="required"
            @click-icon="onClickSelectCustomer"
            @change="onChangeCstNo"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_IDNR_DV')"
          required
        >
          <kw-select
            v-model="searchParams.keyDiv"
            :label="$t('MSG_TXT_IDNR_DV')"
            :options="codes.RENTAL_CB_DRM_DV_CD"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_INQR_RSON')"
          required
        >
          <kw-select
            v-model="searchParams.inqRsnCd"
            :label="$t('MSG_TXT_INQR_RSON')"
            :options="codes.RENTAL_CB_INQR_USWY_CD"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_INQR_AG')"
          required
        >
          <kw-option-group
            v-model="searchParams.inqwtcnRsnCd"
            :label="$t('MSG_TXT_INQR_AG')"
            type="radio"
            :options="selectCodes.INQR_AG"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <div class="grid-horizontal-wrap">
        <div class="grid-horizontal-wrap__section">
          <div>
            <h3>
              {{ $t('MSG_TXT_RENTAL_CB_CNTR_PS') }}
            </h3>

            <kw-action-top>
              <template #left>
                <kw-paging-info :total-count="totalContractCount" />
                <span class="ml8">{{ $t('MSG_TXT_UNIT_THW') }}</span>
              </template>
              <kw-btn
                v-permission:download
                icon="download_on"
                :label="$t('MSG_BTN_EXCEL_DOWN')"
                secondary
                dense
                :disable="totalContractCount === 0"
                @click="onClickContractExcelDownload"
              />
            </kw-action-top>

            <kw-grid
              ref="grdContractRef"
              name="grdContract"
              :visible-rows="5"
              @init="initContractMain"
            />
          </div>
          <div>
            <h3>
              {{ $t('MSG_TXT_RENTAL_CB_RECT_CNTR_PS') }}
            </h3>

            <kw-action-top>
              <template #left>
                <kw-paging-info :total-count="totalRecentContractCount" />
                <span class="ml8">{{ $t('MSG_TXT_UNIT_THW') }}</span>
              </template>
              <kw-btn
                v-permission:download
                icon="download_on"
                :label="$t('MSG_BTN_EXCEL_DOWN')"
                secondary
                dense
                :disable="totalRecentContractCount === 0"
                @click="onClickRecentContractExcelDownload"
              />
            </kw-action-top>

            <kw-grid
              ref="grdRecentContractRef"
              name="grdRecentContract"
              :visible-rows="5"
              @init="initRecentContractMain"
            />
          </div>
        </div>

        <div class="grid-horizontal-wrap__section">
          <div>
            <h3>
              {{ $t('MSG_TXT_RENTAL_CB_PY_PS') }}
            </h3>

            <kw-action-top>
              <template #left>
                <kw-paging-info :total-count="totalPaymentCount" />
                <span class="ml8">{{ $t('MSG_TXT_UNIT_THW') }}</span>
              </template>
              <kw-btn
                v-permission:download
                icon="download_on"
                :label="$t('MSG_BTN_EXCEL_DOWN')"
                secondary
                dense
                :disable="totalPaymentCount === 0"
                @click="onClickPaymentExcelDownload"
              />
            </kw-action-top>

            <kw-grid
              ref="grdPaymentRef"
              name="grdPayment"
              :visible-rows="5"
              @init="initPaymentMain"
            />
          </div>
          <div>
            <h3>
              {{ $t('MSG_TXT_ETC_CNTR_RLTD_REFER_ARTC') }}
            </h3>

            <kw-action-top>
              <template #left>
                <kw-paging-info :total-count="totalEtcCount" />
                <span class="ml8">{{ $t('MSG_TXT_UNIT_THW') }}</span>
              </template>
              <kw-btn
                v-permission:download
                icon="download_on"
                :label="$t('MSG_BTN_EXCEL_DOWN')"
                secondary
                dense
                :disable="totalEtcCount === 0"
                @click="onClickEtcExcelDownload"
              />
            </kw-action-top>

            <kw-grid
              ref="grdEtcRef"
              name="grdEtc"
              :visible-rows="5"
              @init="initEtcMain"
            />
          </div>
        </div>
      </div>
      <div>
        <h3>
          {{ $t('MSG_TXT_RENTAL_CB_DLQ_INF') }}
        </h3>

        <kw-action-top>
          <template #left>
            <kw-paging-info :total-count="totalDelinquentCount" />
            <span class="ml8">{{ $t('MSG_TXT_UNIT_THW') }}</span>
          </template>
          <kw-btn
            v-permission:download
            icon="download_on"
            :label="$t('MSG_BTN_EXCEL_DOWN')"
            secondary
            dense
            :disable="totalDelinquentCount === 0"
            @click="onClickDelinquentExcelDownload"
          />
        </kw-action-top>

        <kw-grid
          ref="grdDelinquentRef"
          name="grdDelinquent"
          :visible-rows="5"
          @init="initDelinquentMain"
        />
      </div>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { defineGrid, gridUtil, codeUtil, modal, useDataService, getComponentType } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import { getInqrAg } from '~sms-common/bond/utils/bnUtil';

const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const codes = await codeUtil.getMultiCodes(
  'RENTAL_CB_DRM_DV_CD',
  'RENTAL_CB_INQR_USWY_CD',
);

const selectCodes = ref({
  INQR_AG: await getInqrAg(),

});

const grdContractRef = ref(getComponentType('KwGrid'));
const grdRecentContractRef = ref(getComponentType('KwGrid'));
const grdPaymentRef = ref(getComponentType('KwGrid'));
const grdEtcRef = ref(getComponentType('KwGrid'));
const grdDelinquentRef = ref(getComponentType('KwGrid'));

// TODO: 고객찾기 검색조건
let cachedParams;
const searchParams = ref({
  keyDiv: '', // 식별자구분(1:개인 2:사업자 3:법인 5:회원번호)
  rsdnNo: '', // 식별번호(keyDiv:1,5 = 세이프키 : 1733825150256, keyDiv:2,3 = 주민번호,사업번호 )
  cstNo: '', // 고객번호
  cstNm: '', // 고객명
  inqRsnCd: '', // 조회용도
  inqwtcnRsnCd: '01', // 조회동의(01:동의 02:미동의)
  insAdrZP1: '', // 설치우편１
  insAdrZP2: '', // 설치우편 2
  insAdrWAD1: '', // 주소
  insAdrWAD2: '', // 상세주소1
  insAdrWAD3: '', // 상세주소2
  insHpNo1: '', // 핸드폰번호1
  insHpNo2: '', // 핸드폰번호2
  insHpNo3: '', // 핸드폰번호3
  insHomNo1: '', // 전화번호1
  insHomNo2: '', // 전화번호2
  insHomNo3: '', // 전화번호3
  cstNoYn: 'N',
});

/** 고객번호/고객명 변경 */
async function onChangeCstNo() {
  searchParams.cstNoYn = 'N';
}

const customerParams = ref({});

const totalContractCount = ref(0);
const totalRecentContractCount = ref(0);
const totalPaymentCount = ref(0);
const totalEtcCount = ref(0);
const totalDelinquentCount = ref(0);

async function onClickContractExcelDownload() {
  const view = grdContractRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,

  });
}

async function onClickRecentContractExcelDownload() {
  const view = grdRecentContractRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,

  });
}

async function onClickPaymentExcelDownload() {
  const view = grdPaymentRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,

  });
}

async function onClickEtcExcelDownload() {
  const view = grdEtcRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,

  });
}

async function onClickDelinquentExcelDownload() {
  const view = grdDelinquentRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,

  });
}

let contracts;
let payments;
let recentContracts;
let etcs;
let delinquents;
/** 렌탈CB 정보 조회 */
async function fetchContracts() {
  contracts = [];
  payments = [];
  recentContracts = [];
  etcs = [];
  delinquents = [];

  const res = await dataService.get('/sms/common/bond/rental-cb-inf/contract-present-state', { params: cachedParams });

  res.data.forEach(async (element) => {
    if (element.type === 'A') {
      contracts.push(element);
    } else if (element.type === 'B') {
      payments.push(element);
    } else if (element.type === 'C') {
      recentContracts.push(element);
    } else if (element.type === 'D') {
      etcs.push(element);
    } else if (element.type === 'F') {
      delinquents.push(element);
    }
  });

  const contractView = grdContractRef.value.getView();
  contractView.getDataSource().setRows(contracts);
  totalContractCount.value = contracts.length;

  const paymentView = grdPaymentRef.value.getView();
  paymentView.getDataSource().setRows(payments);
  totalPaymentCount.value = payments.length;

  const recentContractView = grdRecentContractRef.value.getView();
  recentContractView.getDataSource().setRows(recentContracts);
  totalRecentContractCount.value = recentContracts.length;

  const etcView = grdEtcRef.value.getView();
  etcView.getDataSource().setRows(etcs);
  totalEtcCount.value = etcs.length;

  const delinquentView = grdDelinquentRef.value.getView();
  delinquentView.getDataSource().setRows(delinquents);
  totalDelinquentCount.value = delinquents.length;
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchContracts();
}

// TODO: 고객조회(공통)
async function onClickSelectCustomer() {
  const { result, payload } = await modal({
    component: 'ZwbnyDelinquentCustomerP',
    componentProps: {
      baseYm: customerParams.value.baseYm,
      sfkVal: searchParams.value.rsdnNo,

    },
  });
  if (result) {
    const { cstNo, cstNm, sfkVal, phoneNumber, rnadr } = payload;
    searchParams.value.cstNo = cstNo;
    searchParams.value.cstNm = cstNm;
    searchParams.value.rsdnNo = sfkVal;
    searchParams.value.mpno = phoneNumber;
    searchParams.value.adr = rnadr;
    searchParams.value.cstNoYn = 'Y';
  }
}

async function fetchBaseYmData() {
  const response = await dataService.get('/sms/wells/bond/bond-counsel/base-ym');
  customerParams.value = response.data;
}

onMounted(async () => {
  await fetchBaseYmData();
});

const initContractMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'baseNm' },
    { fieldName: 'crtlTot1', dataType: 'number' },
    { fieldName: 'crtlTot2', dataType: 'number' },
    { fieldName: 'crtlTot3', dataType: 'number' },
    { fieldName: 'crtlTot4', dataType: 'number' },
    { fieldName: 'crtlTot5', dataType: 'number' },
    { fieldName: 'crtlTot6', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'baseNm', header: t('MSG_TXT_BASE_PITM'), width: '100', styleName: 'text-center' }, // 기준시점
    { fieldName: 'crtlTot1', header: t('MSG_TXT_CURRENT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 현재
    { fieldName: 'crtlTot2', header: t('MSG_TXT_3MON_BF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 3개월전
    { fieldName: 'crtlTot3', header: t('MSG_TXT_6MON_BF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 6개월전
    { fieldName: 'crtlTot4', header: t('MSG_TXT_1YEAR_BF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 1년전
    { fieldName: 'crtlTot5', header: t('MSG_TXT_2YEAR_BF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 2년전
    { fieldName: 'crtlTot6', header: t('MSG_TXT_3YEAR_BF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 3년전
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
});

const initPaymentMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'baseNm' },
    { fieldName: 'crtlTot1', dataType: 'number' },
    { fieldName: 'crtlTot2', dataType: 'number' },
    { fieldName: 'crtlTot3', dataType: 'number' },
    { fieldName: 'crtlTot4', dataType: 'number' },
    { fieldName: 'crtlTot5', dataType: 'number' },
    { fieldName: 'crtlTot6', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'baseNm', header: t('MSG_TXT_BTE_PS'), width: '100', styleName: 'text-center' }, // 기간별 현황
    { fieldName: 'crtlTot1', header: t('MSG_TXT_RECENT_10DAY'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 최근10일
    { fieldName: 'crtlTot2', header: t('MSG_TXT_RECENT_30DAY'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 최근30일
    { fieldName: 'crtlTot3', header: t('MSG_TXT_RECENT_60DAY'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 최근60일
    { fieldName: 'crtlTot4', header: t('MSG_TXT_RECENT_90DAY'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 최근90일
    { fieldName: 'crtlTot5', header: t('MSG_TXT_RECENT_183DAY'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 최근183일
    { fieldName: 'crtlTot6', header: t('MSG_TXT_RECENT_365DAY'), width: '100.', styleName: 'text-right', numberFormat: '#,##0' }, // 최근365일
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
});

const initRecentContractMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'baseNm' },
    { fieldName: 'crtlTot1', dataType: 'number' },
    { fieldName: 'crtlTot2', dataType: 'number' },
    { fieldName: 'crtlTot3', dataType: 'number' },
    { fieldName: 'crtlTot4', dataType: 'number' },
    { fieldName: 'crtlTot5', dataType: 'number' },
    { fieldName: 'crtlTot6', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'baseNm', header: t('MSG_TXT_BTE_PS'), width: '100', styleName: 'text-center' }, // 기간별현황
    { fieldName: 'crtlTot1', header: t('MSG_TXT_CURRENT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 현재
    { fieldName: 'crtlTot2', header: t('MSG_TXT_3MON_BF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 3개월전
    { fieldName: 'crtlTot3', header: t('MSG_TXT_6MON_BF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 6개월전
    { fieldName: 'crtlTot4', header: t('MSG_TXT_1YEAR_BF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 1년전
    { fieldName: 'crtlTot5', header: t('MSG_TXT_2YEAR_BF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 2년전
    { fieldName: 'crtlTot6', header: t('MSG_TXT_3YEAR_BF'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 3년전
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
});

const initEtcMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'baseNm' },
    { fieldName: 'ptrmPs' },
    { fieldName: 'crtlTot1', dataType: 'number' },
    { fieldName: 'crtlTot2', dataType: 'number' },
    { fieldName: 'crtlTot3', dataType: 'number' },
    { fieldName: 'crtlTot4', dataType: 'number' },
    { fieldName: 'crtlTot5', dataType: 'number' },
    { fieldName: 'crtlTot6', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'baseNm',
      mergeRule: {
        criteria: 'value',
      },
      header: t('MSG_TXT_BASE'),
      width: '140',
      styleName: 'text-center' }, // 기준
    { fieldName: 'ptrmPs', header: t('MSG_TXT_BTE_PS'), width: '100', styleName: 'text-center' }, // 기간별현황
    { fieldName: 'crtlTot1', header: t('MSG_TXT_RECENT_10DAY'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 최근10일
    { fieldName: 'crtlTot2', header: t('MSG_TXT_RECENT_30DAY'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 최근30일
    { fieldName: 'crtlTot3', header: t('MSG_TXT_RECENT_60DAY'), width: '100 ', styleName: 'text-right', numberFormat: '#,##0' }, // 최근60일
    { fieldName: 'crtlTot4', header: t('MSG_TXT_RECENT_90DAY'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 최근90일
    { fieldName: 'crtlTot5', header: t('MSG_TXT_RECENT_183DAY'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 최근183일
    { fieldName: 'crtlTot6', header: t('MSG_TXT_RECENT_365DAY'), width: '100', styleName: 'text-right', numberFormat: '#,##0' }, // 최근365일
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
});

const initDelinquentMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'baseNm' },
    { fieldName: 'crtlTot1' },
    { fieldName: 'crtlTot2' },
    { fieldName: 'crtlTot3' },
    { fieldName: 'crtlTot4' },
    { fieldName: 'crtlTot5', dataType: 'number' },
    { fieldName: 'crtlTot6', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'baseNm', header: t('MSG_TXT_RENTAL_PD'), width: '200', styleName: 'text-center' }, // 렌탈상품
    { fieldName: 'crtlTot1', header: t('MSG_TXT_DLQ_DV'), width: '200', styleName: 'text-center' }, // 연체구분
    { fieldName: 'crtlTot2', header: t('MSG_TXT_OC_BUR_NM'), width: '200', styleName: 'text-center' }, // 발생기관명
    { fieldName: 'crtlTot3', header: t('MSG_TXT_OC_D'), width: '200', styleName: 'text-center', datetimeFormat: 'date' }, // 발생일
    { fieldName: 'crtlTot4', header: t('MSG_TXT_RGST_DT'), width: '200', styleName: 'text-center', datetimeFormat: 'date' }, // 등록일
    { fieldName: 'crtlTot5', header: t('MSG_TXT_DLQ_AMT'), width: '200', styleName: 'text-right', numberFormat: '#,##0' }, // 연체금액
    { fieldName: 'crtlTot6', header: t('MSG_TXT_BLAM'), width: '200', styleName: 'text-right', numberFormat: '#,##0' }, // 잔액
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
});

</script>
