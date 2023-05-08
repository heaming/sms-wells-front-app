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
    size="4xl"
    ignore-on-modified
  >
    <!-- 선택계약상품 -->
    <h3>{{ $t('MSG_TXT_SELT_CNTR_PD') }}</h3>
    <kw-form :cols="2">
      <kw-form-row>
        <!-- 계약상세번호 -->
        <kw-form-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <p>{{ frmMainData.cntrNoFull }}</p>
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
    <kw-tabs v-model="selectedTab">
      <!-- 고객기본정보 -->
      <kw-tab
        name="1"
        :label="$t('MSG_TXT_CST_BAS_INF')"
      />
      <!-- 판매정보 -->
      <kw-tab
        name="2"
        :label="$t('MSG_TXT_SELL') + $t('MSG_TXT_INF')"
      />
      <!-- 입금내역 -->
      <kw-tab
        name="3"
        :label="$t('MSG_TXT_DP_IZ')"
      />
      <!-- 세금계산서 -->
      <kw-tab
        name="4"
        :label="$t('MSG_TXT_TXINV')"
      />
      <!-- 컨택내용 -->
      <kw-tab
        name="5"
        :label="$t('MSG_TXT_CTT_CNTN')"
      />
    </kw-tabs>
    <kw-tab-panels :model-value="selectedTab">
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
      <!-- 판매정보 탭 -->
      <kw-tab-panel name="2">
        <kw-form
          ref="tab2Ref"
        />
      </kw-tab-panel>
      <!-- 입금내역 탭 -->
      <kw-tab-panel name="3">
        <kw-form
          ref="tab3Ref"
        />
      </kw-tab-panel>
      <!-- 세금계산서 탭 -->
      <kw-tab-panel name="4">
        <kw-form
          ref="tab4Ref"
        />
      </kw-tab-panel>
      <!-- 컨택내용 탭 -->
      <kw-tab-panel name="5">
        <wwcta-order-detail-collecting-amount-contact-list-p
          ref="tab5Ref"
        />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, stringUtil } from 'kw-lib';
import { isNull, cloneDeep } from 'lodash-es';
import WwctaOrderDetailCollectingAmountContactListP from './WwctaOrderDetailCollectingAmountContactListP.vue';

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
  cntrNoFull: '', // 계약상세번호
  pdNm: '', // 상품명
  cstKnm: '', // 고객명
  cntrCstNo: '', // 고객번호
  cntrNo: '', // 계약번호
  cstNo2: '', // 생년월일(개인법인에 따라 생년월일 또는 사업자번호 표시)
  cralTno: '', // 휴대전화번호
  cstGd: '', // 고객등급
  sexDvNm: '', // 성별
  cdcoNm: '', // 은행/카드 회사명
  aftnInfo: '', // 자동이체(계좌/카드자동이체를 표시)
  sfkVal: '', // 세이프키
  vacInfo: '', // 가상계좌
  cntrtAdr: '', // 주소
  rcgvpKnm: '', // 설치(배송정보) 고객명
  rcgvpTno: '', // 설치(배송정보) 휴대전화번호
  rcgvpAdr: '', // 설치(배송정보) 주소
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const selectedTab = ref('1');
const tab2Ref = ref(); // 판매정보 탭
const tab3Ref = ref(); // 입금내역 탭
const tab4Ref = ref(); // 세금계산서 탭
const tab5Ref = ref(); // 컨택내용 탭

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
  // console.log(res.data);

  isVacInfo.value = false;
  if (res.data.length > 0) {
    frmMainData.value.cntrNoFull = res.data[0].cntrNoFull;
    frmMainData.value.pdNm = res.data[0].pdNm;
    frmMainData.value.cstKnm = res.data[0].cstKnm;
    frmMainData.value.cntrCstNo = res.data[0].cntrCstNo;
    frmMainData.value.cntrNo = res.data[0].cntrNo;
    frmMainData.value.cntrSn = res.data[0].cntrSn;
    frmMainData.value.cstNo2 = res.data[0].cstNo2;
    frmMainData.value.cralTno = res.data[0].cralTno;
    frmMainData.value.cstGd = res.data[0].cstGd;
    frmMainData.value.sexDvNm = res.data[0].sexDvNm;
    if (!isNull(res.data[0].aftnInfo)) {
      frmMainData.value.cdcoNm = res.data[0].aftnInfo.split('-')[0];
    }
    frmMainData.value.aftnInfo = res.data[0].aftnInfo;
    frmMainData.value.sfkVal = res.data[0].sfkVal;
    frmMainData.value.vacInfo = res.data[0].vacInfo;
    if (!isNull(res.data[0].vacInfo)) {
      isVacInfo.value = true;
    }
    frmMainData.value.cntrtAdr = res.data[0].cntrtAdr;
    frmMainData.value.rcgvpKnm = res.data[0].rcgvpKnm;
    frmMainData.value.rcgvpTno = res.data[0].rcgvpTno;
    frmMainData.value.rcgvpAdr = res.data[0].rcgvpAdr;
  }
}

// 현재 열려있는 탭에서 조회하기
async function currentTabFetchData() {
  switch (selectedTab.value) {
    case '1': // 고객기본정보
      await fetchDataCustomerBase();
      break;
    case '2': // 판매정보
      await tab2Ref.value.setDatas(
        searchParams.value.cntrNo,
        searchParams.value.cntrSn,
      );
      break;
    case '3': // 입금내역
      await tab3Ref.value.setDatas(
        searchParams.value.cntrNo,
        searchParams.value.cntrSn,
      );
      break;
    case '4': // 세금계산서
      await tab4Ref.value.setDatas(
        searchParams.value.cntrNo,
        searchParams.value.cntrSn,
      );
      break;
    case '5': // 컨택내용
      await tab5Ref.value.setDatas(
        searchParams.value.cntrNo,
        searchParams.value.cntrSn,
      );
      break;
  }
}

// 상세계약목록 변경 시 Event
async function onSelectCntrctPdList() {
  const { cntrSn } = frmMainData.value;
  searchParams.value.cntrSn = cntrSn;
  await currentTabFetchData();
}

onMounted(async () => {
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
