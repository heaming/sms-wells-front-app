<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaOrderDetailP - wells 주문 상세 조회
3. 작성자 : jihoon.kim
4. 작성일 : 2023.03.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U0075] - 고객 상세 정보 조회 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
    ignore-on-modified
  >
    <!-- 선택계약상품 -->
    <h3>{{ $t('MSG_TXT_SELT_CNTR_PD') }}</h3>
    <kw-form :cols="2">
      <kw-form-row>
        <!-- 계약상세번호 -->
        <kw-form-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <p>{{ frmMainData.cntrDtlNo }}</p>
        </kw-form-item>
        <!-- 계약상품리스트 -->
        <slot v-if="frmMainData.sellTpCd !== '6'">
          <kw-form-item :label="$t('MSG_TXT_CNTRCT_PD_LIST')">
            <kw-select
              v-model="frmMainData.cntrDtlNo"
              :options="optionList"
              option-label="pdNm"
              option-value="cntrDtlNo"
              @change="onSelectCntrctPdList"
            />
          </kw-form-item>
        </slot>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-tabs v-model="selectedTab">
      <!-- 고객기본정보 -->
      <kw-tab
        name="cstBaseInfo"
        :label="$t('MSG_TXT_CST_BAS_INF')"
      />
      <!-- 판매정보 -->
      <kw-tab
        name="sellInfo"
        :label="$t('MSG_TXT_SELL_INF')"
      />
      <!-- 입금내역 -->
      <kw-tab
        name="dpIz"
        :label="$t('MSG_TXT_DP_IZ')"
      />
      <!-- 현금영수증 -->
      <slot v-if="props.copnDvCd === '1'">
        <kw-tab
          name="cashRcp"
          :label="$t('MSG_TXT_CASH_RCP')"
        />
      </slot>
      <!-- 계산서 -->
      <slot v-else-if="props.copnDvCd === '2'&&props.sellTpCd === '6'">
        <kw-tab
          name="bill"
          :label="$t('MSG_TXT_BILL')"
        />
      </slot>
      <!-- 세금계산서 -->
      <slot v-else-if="props.copnDvCd === '2'&&props.sellTpCd !== '6'">
        <kw-tab
          name="txinv"
          :label="$t('MSG_TXT_TXINV')"
        />
      </slot>
      <!-- 컨택 내용 -->
      <kw-tab
        name="cttCntn"
        :label="$t('MSG_TXT_CTT_CNTN')"
      />
    </kw-tabs>
    <kw-tab-panels v-model="selectedTab">
      <kw-tab-panel name="cstBaseInfo">
        <kw-form
          :cols="2"
          class="mt30"
        >
          <kw-form-row>
            <!-- 계약자명 -->
            <kw-form-item :label="$t('MSG_TXT_CNTOR_NM')">
              <p>{{ frmMainData.cstKnm }}</p>
            </kw-form-item>
            <!-- 고객번호 -->
            <kw-form-item :label="$t('MSG_TXT_CST_NO')">
              <p>{{ frmMainData.cntrCstNo }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <!-- 계약상세번호 -->
            <kw-form-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
              <p>{{ frmMainData.cntrDtlNo }}</p>
            </kw-form-item>
            <slot v-if="isEmpty(props.copnDvCd)">
              <slot v-if="frmMainData.copnDvCd === '1'">
                <!-- 생년월일 -->
                <kw-form-item :label="$t('MSG_TXT_BIRTH_DATE')">
                  <p>{{ stringUtil.getDateFormat(frmMainData.cstNo2) }}</p>
                </kw-form-item>
              </slot>
              <slot v-else-if="frmMainData.copnDvCd === '2'">
                <!-- 사업자등록번호 -->
                <kw-form-item :label="$t('MSG_TXT_CRNO')">
                  <p>{{ frmMainData.cstNo2 }}</p>
                </kw-form-item>
              </slot>
            </slot>
            <slot v-if="props.copnDvCd === '1'">
              <!-- 생년월일 -->
              <kw-form-item :label="$t('MSG_TXT_BIRTH_DATE')">
                <p>{{ stringUtil.getDateFormat(frmMainData.cstNo2) }}</p>
              </kw-form-item>
            </slot>
            <slot v-else-if="props.copnDvCd === '2'">
              <!-- 사업자등록번호 -->
              <kw-form-item :label="$t('MSG_TXT_CRNO')">
                <p>{{ frmMainData.cstNo2 }}</p>
              </kw-form-item>
            </slot>
          </kw-form-row>

          <kw-form-row>
            <!-- 휴대전화번호 -->
            <kw-form-item :label="$t('MSG_TXT_MPNO')">
              <p>{{ frmMainData.cralTno }}</p>
            </kw-form-item>
            <!-- 고객등급 -->
            <kw-form-item :label="$t('MSG_TXT_CST_GRD')">
              <p>{{ frmMainData.cstGd }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <!-- 성별 -->
            <kw-form-item :label="$t('MSG_TXT_GENDER')">
              <p>{{ frmMainData.sexDvNm }}</p>
            </kw-form-item>
            <!-- 자동이체 -->
            <kw-form-item :label="$t('MSG_TXT_AUTO_FNT')">
              <kw-chip
                v-show="isAftnInfo"
                :label="frmMainData.cdcoNm"
                color="placeholder"
                outline
              />
              <p class="ml8">
                {{ frmMainData.aftnInfo }}
              </p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <!-- 세이프키 -->
            <kw-form-item :label="$t('MSG_TXT_SFK')">
              <p>{{ frmMainData.sfkVal }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <!-- 가상계좌 -->
            <kw-form-item :label="$t('MSG_TXT_VT_AC')">
              <kw-chip
                v-show="isVacInfo"
                :label="frmMainData.vacBnkNm"
                color="placeholder"
                outline
              />
              <p class="ml8">
                {{ frmMainData.vacInfo }}
              </p>
            </kw-form-item>
            <kw-form-item no-label>
              <!-- 가상계좌확인서 -->
              <kw-btn
                v-show="isVacInfo"
                :label="$t('MSG_BTN_VT_AC_CFDC')"
                padding="12px"
                @click="onClickVtAcCfdc"
              />
              <!-- 문자발송 -->
              <kw-btn
                v-show="isVacInfo"
                :label="$t('MSG_BTN_CHAR_FW')"
                padding="12px"
                class="ml8"
                @click="onClickCharFw"
              />
              <!-- 메일발송 -->
              <kw-btn
                v-show="isVacInfo"
                :label="$t('MSG_BTN_EMAIL_SEND')"
                padding="12px"
                class="ml8"
                @click="onClickEmailSend"
              />
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <!-- 주소 -->
            <kw-form-item :label="$t('MSG_TXT_ADDR')">
              <p>{{ frmMainData.cntrtAdr }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
        <kw-separator />
        <!-- 설치 및 배송정보 -->
        <h3>{{ $t('MSG_TXT_INST_SPP_INF') }}</h3>
        <kw-form
          dense
          :cols="2"
        >
          <kw-form-row>
            <!-- 설치(배송정보) 고객명 -->
            <kw-form-item :label="$t('MSG_TXT_CST_NM')">
              <p>{{ frmMainData.rcgvpKnm }}</p>
            </kw-form-item>
            <!-- 설치(배송정보) 휴대전화번호 -->
            <kw-form-item :label="$t('MSG_TXT_MPNO')">
              <p>{{ frmMainData.rcgvpTno }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <!-- 설치(배송정보) 주소 -->
            <kw-form-item :label="$t('MSG_TXT_ADDR')">
              <p>{{ frmMainData.rcgvpAdr }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
      </kw-tab-panel>
      <!-- 판매정보 -->
      <kw-tab-panel name="sellInfo">
        <wwcta-order-detail-management-inf-dtl-p
          ref="tabSellInfoRef"
        />
      </kw-tab-panel>
      <!-- 입금내역 -->
      <kw-tab-panel name="dpIz">
        <wwcta-order-detail-deposit-iz-dtl-p
          ref="tabDpIzRef"
        />
      </kw-tab-panel>
      <!-- 현금영수증 -->
      <slot v-if="props.copnDvCd === '1'">
        <kw-tab-panel name="cashRcp">
          <wwcta-order-detail-cash-sales-receipt-mgt-p
            ref="tabCashRcpRef"
          />
        </kw-tab-panel>
      </slot>
      <!-- 계산서 -->
      <slot v-else-if="props.copnDvCd === '2'&&props.sellTpCd === '6'">
        <kw-tab-panel name="bill">
          <wwcta-order-detail-tax-invoice-dtl-p
            ref="tabBillRef"
          />
        </kw-tab-panel>
      </slot>
      <!-- 세금계산서 -->
      <slot v-else-if="props.copnDvCd === '2'&&props.sellTpCd !== '6'">
        <kw-tab-panel name="txinv">
          <wwcta-order-detail-tax-invoice-dtl-p
            ref="tabTxinvRef"
          />
        </kw-tab-panel>
      </slot>
      <!-- 컨택내용 -->
      <kw-tab-panel name="cttCntn">
        <wwcta-order-detail-collecting-amount-contact-list-p
          ref="tabCttCntnRef"
        />
      </kw-tab-panel>
    </kw-tab-panels>
    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_CLOSE')"
        @click="onClickClose"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal, stringUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import WwctaOrderDetailManagementInfDtlP from './WwctaOrderDetailManagementInfDtlP.vue';
import WwctaOrderDetailDepositIzDtlP from './WwctaOrderDetailDepositIzDtlP.vue';
import WwctaOrderDetailCashSalesReceiptMgtP from './WwctaOrderDetailCashSalesReceiptMgtP.vue';
import WwctaOrderDetailTaxInvoiceDtlP from './WwctaOrderDetailTaxInvoiceDtlP.vue';
import WwctaOrderDetailCollectingAmountContactListP from './WwctaOrderDetailCollectingAmountContactListP.vue';

const dataService = useDataService();
const { alert, modal } = useGlobal();
const optionList = ref([]);
const props = defineProps({
  cntrNo: { type: String, required: true, default: '' },
  cntrSn: { type: String, required: true, default: '' },
  sellTpCd: { type: String, required: true, default: '' },
  cntrCstNo: { type: String, required: false, default: '' },
  copnDvCd: { type: String, required: false, default: '' },
});

const isAftnInfo = ref(false);
const isVacInfo = ref(false);

let cachedParams;
const searchParams = ref({
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
  cntrCstNo: props.cntrCstNo,
});

const frmMainData = ref({
  cntrDtlNo: `${props.cntrNo}-${props.cntrSn}`, // 계약상세번호
  sellTpCd: props.sellTpCd, // 판매유형코드
  pdNm: '', // 상품명
  cstKnm: '', // 고객명
  cntrCstNo: '', // 고객번호
  copnDvCd: props.copnDvCd, // 고객구분코드(1:개인, 2:법인)
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  cstNo2: '', // 생년월일(개인법인에 따라 생년월일 또는 사업자등록번호 표시)
  cntrCralLocaraTno: '', // 계약자 휴대지역전화번호
  cntrMexnoEncr: '', // 계약자 휴대전화국번호암호화
  cntrCralIdvTno: '', // 계약자 휴대개별전화번호
  cralTno: '', // 계약자 휴대전화번호
  cstGd: '', // 고객등급
  sexDvNm: '', // 성별
  cdcoNm: '', // 은행/카드 회사명
  aftnInfo: '', // 자동이체(계좌/카드자동이체를 표시)
  dpTpCd: '', // 입금유형코드
  acnoEncr: '', // 계좌번호
  crcdnoEncr: '', // 카드번호
  sfkVal: '', // 세이프키
  vacBnkNm: '', // 가상계좌은행명
  vacInfo: '', // 가상계좌
  vacVncoDvCd: '', // 가상계좌VAN사구분코드
  cntrtAdr: '', // 계약자 주소
  rcgvpKnm: '', // 설치(배송정보) 고객명
  istCralLocaraTno: '', // 설치자 휴대지역전화번호
  istMexnoEncr: '', // 설치자 휴대전화국번호암호화
  istCralIdvTno: '', // 설치자 휴대개별전화번호
  rcgvpTno: '', // 설치(배송정보) 휴대전화번호
  rcgvpAdr: '', // 설치(배송정보) 주소
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const selectedTab = ref('cstBaseInfo'); // 계약상세정보(고객기본정보)
const tabSellInfoRef = ref(); // 판매정보 탭
const tabDpIzRef = ref(); // 입금내역 탭
const tabCashRcpRef = ref(); // 현금영수증 탭
const tabBillRef = ref(); // 계산서 탭
const tabTxinvRef = ref(); // 세금계산서 탭
const tabCttCntnRef = ref(); // 컨택내용 탭

// wells 주문 상세(고객기본정보) - 상세계약목록
async function fetchDataContractLists() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  res = await dataService.get('/sms/wells/contract/contracts/order-details/customer-bases/contract-lists', { params: cachedParams });
  console.log(res.data);
  optionList.value = res.data;

  // eslint-disable-next-line no-use-before-define
  await fetchDataCustomerBase();
}

// wells 주문 상세(고객기본정보)
async function fetchDataCustomerBase() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  res = await dataService.get('/sms/wells/contract/contracts/order-details/customer-bases', { params: cachedParams });
  console.log(res.data);

  isVacInfo.value = false;
  if (res.data.length > 0) {
    frmMainData.value.cntrDtlNo = res.data[0].cntrDtlNo; // 계약상세번호
    frmMainData.value.sellTpCd = res.data[0].sellTpCd; // 판매유형코드
    frmMainData.value.pdNm = res.data[0].pdNm; // 상품명
    frmMainData.value.cstKnm = res.data[0].cstKnm; // 고객명
    frmMainData.value.cntrCstNo = res.data[0].cntrCstNo; // 고객번호
    frmMainData.value.copnDvCd = res.data[0].copnDvCd; // 고객구분코드(1:개인, 2:법인)
    frmMainData.value.cntrNo = res.data[0].cntrNo; // 계약번호
    frmMainData.value.cntrSn = res.data[0].cntrSn; // 계약일련번호
    if (frmMainData.value.copnDvCd === '1') { // 생년월일
      frmMainData.value.cstNo2 = res.data[0].cstNo2;
    } else if (frmMainData.value.copnDvCd === '2') { // 사업자등록번호
      // 사업자등록번호 3-2-5 형식으로 표시
      if (!isEmpty(res.data[0].cstNo2) && res.data[0].cstNo2.length === 10) {
        frmMainData.value.cstNo2 = `${res.data[0].cstNo2.substr(0, 3)}-${res.data[0].cstNo2.substr(3, 2)}-${res.data[0].cstNo2.substr(5, 5)}`;
      }
    }
    const { cntrCralLocaraTno } = res.data[0]; // 계약자 휴대지역전화번호
    const { cntrMexnoEncr } = res.data[0]; // 계약자 휴대전화국번호암호화
    const { cntrCralIdvTno } = res.data[0]; // 계약자 휴대개별전화번호
    frmMainData.value.cralTno = !isEmpty(cntrCralLocaraTno) && !isEmpty(cntrMexnoEncr) && !isEmpty(cntrCralIdvTno) ? `${cntrCralLocaraTno}-${cntrMexnoEncr}-${cntrCralIdvTno}` : ''; // 계약자-휴대전화번호
    frmMainData.value.cstGd = res.data[0].cstGd; // 고객등급
    frmMainData.value.sexDvNm = res.data[0].sexDvNm; // 성별
    frmMainData.value.dpTpCd = res.data[0].dpTpCd; // 입금유형코드
    frmMainData.value.acnoEncr = res.data[0].acnoEncr; // 계좌번호
    frmMainData.value.crcdnoEncr = res.data[0].crcdnoEncr; // 카드번호
    // 계좌/카드자동이체 상세정보
    if (!isEmpty(res.data[0].aftnInfo)) {
      frmMainData.value.cdcoNm = res.data[0].aftnInfo.split(' ')[0];
      if (frmMainData.value.dpTpCd === '0102') {
        if (!isEmpty(frmMainData.value.acnoEncr)) {
          if (isEmpty(frmMainData.value.cdcoNm)) {
            isAftnInfo.value = false;
          } else {
            isAftnInfo.value = true;
          }
          frmMainData.value.aftnInfo = `${res.data[0].aftnInfo.split(' ')[1]} ${frmMainData.value.acnoEncr} ${res.data[0].aftnInfo.split(' ')[3]}`;
        } else {
          isAftnInfo.value = false;
          frmMainData.value.aftnInfo = `${res.data[0].aftnInfo.split(' ')[1]} ${res.data[0].aftnInfo.split(' ')[3]}`;
        }
      } else if (frmMainData.value.dpTpCd === '0203') {
        if (!isEmpty(frmMainData.value.crcdnoEncr)) {
          if (isEmpty(frmMainData.value.cdcoNm)) {
            isAftnInfo.value = false;
          } else {
            isAftnInfo.value = true;
          }
          frmMainData.value.aftnInfo = `${res.data[0].aftnInfo.split(' ')[1]} ${frmMainData.value.crcdnoEncr} ${res.data[0].aftnInfo.split(' ')[3]}`;
        } else {
          isAftnInfo.value = false;
          frmMainData.value.aftnInfo = `${res.data[0].aftnInfo.split(' ')[1]} ${res.data[0].aftnInfo.split(' ')[3]}`;
        }
      }
    } else {
      isAftnInfo.value = false;
      frmMainData.value.aftnInfo = ''; // 자동이체(계좌/카드자동이체를 표시)
    }
    frmMainData.value.sfkVal = res.data[0].sfkVal; // 세이프키
    // 가상계좌
    if (!isEmpty(res.data[0].vacInfo)) {
      // console.log(res.data[0].vacInfo.length + isVacInfo.value);
      if (res.data[0].vacInfo.length > 3) {
        isVacInfo.value = true;
        frmMainData.value.vacBnkNm = res.data[0].vacInfo.split('$')[0]; // 가상계좌은행명
        frmMainData.value.vacInfo = `${res.data[0].vacInfo.split('$')[1]} ${res.data[0].vacInfo.split('$')[2]}`; // 가상계좌(가상계좌번호+입금일)
        frmMainData.value.vacVncoDvCd = res.data[0].vacInfo.split('$')[3]; // 가상계좌VAN사구분코드
      } else {
        isVacInfo.value = false;
        frmMainData.value.vacBnkNm = '';
        frmMainData.value.vacInfo = '';
        frmMainData.value.vacVncoDvCd = '';
      }
    } else {
      isVacInfo.value = false;
      frmMainData.value.vacInfo = ''; // 가상계좌
    }
    frmMainData.value.cntrtAdr = res.data[0].cntrtAdr; // 계약자 주소
    frmMainData.value.rcgvpKnm = res.data[0].rcgvpKnm; // 설치(배송정보) 고객명
    const { istCralLocaraTno, istMexnoEncr, istCralIdvTno } = res.data[0]; // 설치자 휴대지역전화번호
    if (!isEmpty(istCralLocaraTno) && isEmpty(istMexnoEncr) && !isEmpty(istCralIdvTno)) {
      frmMainData.value.rcgvpTno = `${istCralLocaraTno}--${istCralIdvTno}`;
    } else {
      frmMainData.value.rcgvpTno = isEmpty(istCralLocaraTno) && isEmpty(istMexnoEncr) && isEmpty(istCralIdvTno) ? '' : `${istCralLocaraTno}-${istMexnoEncr}-${istCralIdvTno}`; // 설치(배송정보) 휴대전화번호
    }
    frmMainData.value.rcgvpAdr = res.data[0].rcgvpAdr; // 설치(배송정보) 주소
  } else {
    frmMainData.value.pdNm = ''; // 상품명
    frmMainData.value.cstKnm = ''; // 고객명
    frmMainData.value.cntrCstNo = ''; // 고객번호
    frmMainData.value.cntrNo = ''; // 계약번호
    frmMainData.value.cntrSn = ''; // 계약일련번호
    frmMainData.value.cstNo2 = ''; // 생년월일(개인법인에 따라 생년월일 또는 사업자등록번호 표시)
    frmMainData.value.cntrCralLocaraTno = ''; // 계약자 휴대지역전화번호
    frmMainData.value.cntrMexnoEncr = ''; // 계약자 휴대전화국번호암호화
    frmMainData.value.cralTno = ''; // 계약자 휴대개별전화번호
    frmMainData.value.cstGd = ''; // 고객등급
    frmMainData.value.sexDvNm = ''; // 성별
    frmMainData.value.cdcoNm = ''; // 은행/카드 회사명
    frmMainData.value.aftnInfo = ''; // 자동이체(계좌/카드자동이체를 표시)
    frmMainData.value.dpTpCd = ''; // 입금유형코드
    frmMainData.value.acnoEncr = ''; // 계좌번호
    frmMainData.value.crcdnoEncr = ''; // 카드번호
    isAftnInfo.value = false;
    frmMainData.value.sfkVal = ''; // 세이프키
    isVacInfo.value = false; // 가상계좌 표시여부
    frmMainData.value.vacBnkNm = ''; // 가상계좌은행명
    frmMainData.value.vacInfo = ''; // 가상계좌
    frmMainData.value.vacVncoDvCd = ''; // 가상계좌VAN사구분코드
    frmMainData.value.cntrtAdr = ''; // 계약자 주소
    frmMainData.value.rcgvpKnm = ''; // 설치(배송정보) 고객명
    frmMainData.value.istCralLocaraTno = ''; // 설치자 휴대지역전화번호
    frmMainData.value.istMexnoEncr = ''; // 설치자 휴대전화국번호암호화
    frmMainData.value.istCralIdvTno = ''; // 설치자 휴대개별전화번호
    frmMainData.value.rcgvpTno = ''; // 설치(배송정보) 휴대전화번호
    frmMainData.value.rcgvpAdr = ''; // 설치(배송정보) 주소
  }
}

// 현재 열려있는 탭에서 조회하기
async function currentTabFetchData() {
  console.log(selectedTab.value);
  switch (selectedTab.value) {
    case 'cstBaseInfo': // 고객기본정보
      await fetchDataCustomerBase();
      break;
    case 'sellInfo': // 판매정보
      await tabSellInfoRef.value.setDatas(
        searchParams.value.cntrNo,
        searchParams.value.cntrSn,
        frmMainData.value.sellTpCd,
      );
      break;
    case 'dpIz': // 입금내역
      await tabDpIzRef.value.setDatas(
        searchParams.value.cntrNo,
        searchParams.value.cntrSn,
        frmMainData.value.sellTpCd,
        props.cntrCstNo,
      );
      break;
    case 'cashRcp': // 현금영수증
      await tabCashRcpRef.value.setDatas(
        searchParams.value.cntrNo,
        searchParams.value.cntrSn,
      );
      break;
    case 'bill': // 계산서
      await tabBillRef.value.setDatas(
        searchParams.value.cntrNo,
        searchParams.value.cntrSn,
      );
      break;
    case 'txinv': // 세금계산서
      await tabTxinvRef.value.setDatas(
        searchParams.value.cntrNo,
        searchParams.value.cntrSn,
      );
      break;
    case 'cttCntn': // 컨택내용
      await tabCttCntnRef.value.setDatas(
        searchParams.value.cntrNo,
        searchParams.value.cntrSn,
      );
      break;
  }
}

// 상세계약목록 변경 시 Event
async function onSelectCntrctPdList() {
  const cntrNo = frmMainData.value.cntrDtlNo.split('-')[0];
  const cntrSn = frmMainData.value.cntrDtlNo.split('-')[1];
  // console.log(cntrNo);
  // console.log(cntrSn);
  searchParams.value.cntrNo = cntrNo;
  searchParams.value.cntrSn = cntrSn;

  const returnOpt = optionList.value.filter((v) => v.cntrDtlNo === frmMainData.value.cntrDtlNo);
  if (!isEmpty(returnOpt[0].sellTpCd)) {
    frmMainData.value.sellTpCd = returnOpt[0].sellTpCd;
  }

  await currentTabFetchData();
}

// 가상계좌확인서
async function onClickVtAcCfdc() {
  await alert('가상계좌확인서 팝업은 작업예정입니다.');
}

// 문자발송
async function onClickCharFw() {
  const searchPopupParams = {
    cntrNo: frmMainData.value.cntrDtlNo.split('-')[0],
    cntrSn: frmMainData.value.cntrDtlNo.split('-')[1],
    cralTno: frmMainData.value.cralTno,
    rcgvpTno: frmMainData.value.rcgvpTno,
  };

  await modal({
    component: 'WwctaVirtualAccountMessageForwardingP', // 문자발송
    componentProps: searchPopupParams,
  });
}

// 메일발송
async function onClickEmailSend() {
  const searchPopupParams = {
    vacBnkNm: frmMainData.value.vacBnkNm, // 은행명
    vacNo: frmMainData.value.vacInfo.split(' ')[0], // 가상계좌번호
    vacGbn: frmMainData.value.vacVncoDvCd, // 가상계좌구분
    custNm: frmMainData.value.cstKnm, // 고객명
  };

  await modal({
    component: 'WwctaVirtualAccountDocumentMailForwardingP', // 메일발송
    componentProps: searchPopupParams,
  });
}

// 닫기버튼호츌
async function onClickClose() {
  window.close();
}

onMounted(async () => {
  // console.log(`sellTpCd : ${props.sellTpCd}`);
  // console.log(`copnDvCd : ${props.copnDvCd}`);
  await fetchDataContractLists();
});

// 탭 선택이 변경되었는지 감시하기
watch(() => selectedTab.value, async () => {
  currentTabFetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
<style scoped>
</style>
