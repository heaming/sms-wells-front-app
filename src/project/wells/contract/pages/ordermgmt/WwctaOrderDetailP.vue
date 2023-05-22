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
        <kw-form-item :label="$t('MSG_TXT_CNTRCT_PD_LIST')">
          <kw-select
            v-model="frmMainData.cntrSn"
            :options="optionList"
            option-label="pdNm"
            option-value="cntrSn"
            @change="onSelectCntrctPdList"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-tabs model-value="1">
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
    <kw-tab-panels model-value="1">
      <kw-tab-panel name="1">
        <kw-form
          :cols="2"
          dense
          class="mt30"
        >
          <kw-form-row>
            <!-- 고객명 -->
            <kw-form-item :label="$t('MSG_TXT_CST_NM')">
              <p>{{ frmMainData.cstKnm }}</p>
            </kw-form-item>
            <!-- 고객번호 -->
            <kw-form-item :label="$t('MSG_TXT_CST_NO')">
              <p>{{ frmMainData.cntrCstNo }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <!-- 계약번호 -->
            <kw-form-item :label="$t('MSG_TXT_CNTR_NO')">
              <p>{{ frmMainData.cntrNo }}</p>
            </kw-form-item>
            <!-- 생년월일 -->
            <kw-form-item :label="$t('MSG_TXT_BIRTH_DATE')">
              <p>{{ stringUtil.getDateFormat(frmMainData.cstNo2) }}</p>
            </kw-form-item>
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
            <!-- 가상계좌 -->
            <kw-form-item :label="$t('MSG_TXT_VT_AC')">
              <kw-separator
                vertical
                spaced="2px"
                size="0"
              />
              <!-- 가상계좌확인서 -->
              <kw-btn
                v-show="isVacInfo"
                dense
                secondary
                :label="$t('MSG_BTN_VT_AC_CFDC')"
                @click="onClick"
              />
              <kw-separator
                vertical
                spaced="2px"
                size="0"
              />
              <!-- 문자발송 -->
              <kw-btn
                v-show="isVacInfo"
                dense
                secondary
                :label="$t('MSG_BTN_CHAR_FW')"
                @click="onClick"
              />
              <kw-separator
                vertical
                spaced="2px"
                size="0"
              />
              <!-- 메일발송 -->
              <kw-btn
                v-show="isVacInfo"
                dense
                secondary
                :label="$t('MSG_BTN_EMAIL_SEND')"
                @click="onClick"
              />
              <p>{{ frmMainData.vacInfo }}</p>
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
    </kw-tab-panels>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, stringUtil } from 'kw-lib';
import { cloneDeep, isNull, isEmpty } from 'lodash-es';

const dataService = useDataService();
// const { t } = useI18n();
const optionList = ref([]);
const props = defineProps({
  cntrNo: { type: String, required: true, default: '' },
  cntrSn: { type: String, required: false, default: '' },
});
const isVacInfo = ref();

let cachedParams;
const searchParams = ref({
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
});

const frmMainData = ref({
  cntrDtlNo: '', // 계약상세번호
  pdNm: '', // 상품명
  cstKnm: '', // 고객명
  cntrCstNo: '', // 고객번호
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  cstNo2: '', // 생년월일(개인법인에 따라 생년월일 또는 사업자번호 표시)
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
  vacInfo: '', // 가상계좌
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
// wells 주문 상세(고객기본정보) - 상세계약목록
async function fetchDataContractLists() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  res = await dataService.get('/sms/wells/contract/contracts/order-details/customer-bases/contract-lists', { params: cachedParams });
  // console.log(res.data);
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
    frmMainData.value.pdNm = res.data[0].pdNm; // 상품명
    frmMainData.value.cstKnm = res.data[0].cstKnm; // 고객명
    frmMainData.value.cntrCstNo = res.data[0].cntrCstNo; // 고객번호
    frmMainData.value.cntrNo = res.data[0].cntrNo; // 계약번호
    frmMainData.value.cntrSn = res.data[0].cntrSn; // 계약일련번호
    frmMainData.value.cstNo2 = res.data[0].cstNo2; // 생년월일(개인법인에 따라 생년월일 또는 사업자번호 표시)
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
    if (!isNull(res.data[0].aftnInfo)) {
      frmMainData.value.cdcoNm = res.data[0].aftnInfo.split(' ')[0];
      if (frmMainData.value.dpTpCd === '0102') {
        frmMainData.value.aftnInfo = `${res.data[0].aftnInfo.split(' ')[1]} ${frmMainData.value.acnoEncr} ${res.data[0].aftnInfo.split(' ')[3]}`;
      } else if (frmMainData.value.dpTpCd === '0203') {
        frmMainData.value.aftnInfo = `${res.data[0].aftnInfo.split(' ')[1]} ${frmMainData.value.crcdnoEncr} ${res.data[0].aftnInfo.split(' ')[3]}`;
      }
    }
    frmMainData.value.sfkVal = res.data[0].sfkVal; // 세이프키
    frmMainData.value.vacInfo = res.data[0].vacInfo; // 가상계좌
    if (!isNull(res.data[0].vacInfo)) {
      isVacInfo.value = true;
    }
    frmMainData.value.cntrtAdr = res.data[0].cntrtAdr; // 계약자 주소
    frmMainData.value.rcgvpKnm = res.data[0].rcgvpKnm; // 설치(배송정보) 고객명
    const { istCralLocaraTno } = res.data[0]; // 설치자 휴대지역전화번호
    const { istMexnoEncr } = res.data[0]; // 설치자 휴대전화국번호암호화
    const { istCralIdvTno } = res.data[0]; // 설치자 휴대개별전화번호
    frmMainData.value.rcgvpTno = !isEmpty(istCralLocaraTno) && !isEmpty(istMexnoEncr) && !isEmpty(istCralIdvTno) ? `${istCralLocaraTno}-${istMexnoEncr}-${istCralIdvTno}` : ''; // 설치(배송정보) 휴대전화번호
    frmMainData.value.rcgvpAdr = res.data[0].rcgvpAdr; // 설치(배송정보) 주소
  }
}

// 상세계약목록 변경 시 Event
async function onSelectCntrctPdList() {
  const { cntrSn } = frmMainData.value;
  // console.log(cntrSn);
  searchParams.value.cntrSn = cntrSn;
  await fetchDataCustomerBase();
}

onMounted(async () => {
  await fetchDataContractLists();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
<style scoped>
</style>
