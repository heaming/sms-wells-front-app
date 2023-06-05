<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : mobile
2. 프로그램 ID : WmwdbBillingDocumentWriteM - 청구서 작성 모바일
3. 작성자 : sojeong.Shin
4. 작성일 : 2023.03.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 청구서 관리 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-form
      ref="frmMainRef"
    >
      <div
        class="pa20"
      >
        <h3>
          {{ t('MSG_TIT_BILDC_WRTE') }}
        </h3>
        <!-- label="고객명" -->
        <kw-input
          ref="cstFnmRef"
          v-model="regMainData.cstFnm"
          :label="t('MSG_TXT_CST_NM')"
          icon="search"
          rules="required|max:16"
          maxlength="48"
          class="pt20"
          clearable
          counter
          :disable="isUseChk"
          @click-icon="onClickSearchUser"
        />
        <!-- label="작성일자" -->
        <kw-date-picker
          v-model="regMainData.bildcWrteDt"
          :label="t('MSG_TIT_DRAT_DT')"
          rules="required"
          class="pt20"
        />
      </div>
      <kw-separator divider />
      <div class="pa20">
        <!-- <h3>청구 내역</h3> -->
        <h3>{{ t('MSG_TXT_BIL_IZ') }}</h3>
        <!-- label="상품명" -->
        <kw-input
          v-model="regMainData.pdNm"
          :label="t('MSG_TXT_PRDT_NM')"
          class="pt20"
          rules="required|max:33"
          maxlength="33"
          clearable
        />
        <!-- label="수량" zwcm-counter -->
        <kw-input
          v-model="regMainData.pdQty"
          type="number"
          :label="t('MSG_TXT_QTY')"
          class="pt20"
          rules="required|max:12"
          maxlength="12"
          clearable
        />
        <!-- label="단가(총액)" -->
        <kw-input
          v-model="regMainData.pdSellAmt"
          type="number"
          :label="t('MSG_TXT_UPRC_TAM')"
          class="pt20"
          rules="required|max:20"
          maxlength="20"
          clearable
        />
        <!-- label="비고" -->
        <kw-input
          v-model="regMainData.rmkCn"
          :label="t('MSG_TXT_NOTE')"
          class="pt20 pb40"
          rules="max:333"
          maxlength="1666"
        />
      </div>
    </kw-form>
    <template #action>
      <!-- label="이전" -->
      <kw-btn
        filled
        negative
        :label="t('MSG_BTN_PREV')"
        @click="onClickBefore"
      />

      <!-- label="저장" -->
      <kw-btn
        filled
        primary
        :label="t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
    </template>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';
import { modal, notify, router, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const now = dayjs();
const dataService = useDataService();
const { t } = useI18n();
const { getters } = useStore();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  bildcPblNo: {
    type: String,
    default: null,
  },
  cstFnm: {
    type: String,
    default: null,
  },
  bildcWrteDt: {
    type: String,
    default: null,
  },
  bildcPblSn: {
    type: String,
    default: null,
  },
  sellPrtnrNo: {
    type: String,
    default: null,
  },
  sellPrtnrNm: {
    type: String,
    default: null,
  },
  searchCstFnm: {
    type: String,
    default: null,
  },
  searchBildcWrteDt: {
    type: String,
    default: null,
  },
});

const userInfo = getters['meta/getUserInfo'];
const { userId, userName } = userInfo;

const regMainData = ref({
  bildcPblNo: '',
  bildcPblSn: '',
  cstFnm: '', // 고객명
  bildcWrteDt: now.format('YYYYMMDD'), // 작성일자
  sellPrtnrNo: userId, // 이건 나중에 사번으로 바꿔야함
  sellPrtnrNm: userName,
  state: '',
  rowState: '',
  pdNm: '', // 상품명
  pdQty: '', // 수량
  pdSellAmt: '', // 단가(총액)
  rmkCn: '', // 비고
});

const frmMainRef = ref();

const isUseChk = ref(false);

// 고객명 찾기 이벤트 --modal 아닌 router로 변경해야함
async function onClickSearchUser() {
  const { result, payload } = await modal({ component: 'ZwcsaCustomerListP' });

  if (result) {
    regMainData.value.cstFnm = payload.name;
  }
}

// 이전 버튼 클릭
async function onClickBefore() {
  frmMainRef.value.reset();
  await router.push(
    {
      path: '/withdrawal/wmwdb-billing-document-mgt',
      query: {
        searchCstFnm: props.searchCstFnm, // 조회조건
        searchBildcWrteDt: props.searchBildcWrteDt, // 조회조건
      },
    },
  );
}

let dataParam;

async function fetchData() {
  dataParam = cloneDeep(regMainData.value);

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/billing-document-orders/details', { params: dataParam });

  regMainData.value.bildcPblNo = res.data[0].bildcPblNo; //
  regMainData.value.bildcPblSn = res.data[0].bildcPblSn; //
  regMainData.value.pdNm = res.data[0].pdNm; // 상품명
  regMainData.value.pdQty = res.data[0].pdQty; // 수량
  regMainData.value.pdSellAmt = res.data[0].pdSellAmt; // 단가(총액)
  regMainData.value.rmkCn = res.data[0].rmkCn; // 비고
}

let cachedParams;

// 저장 버튼
async function onClickSave() {
  if (!await frmMainRef.value.validate()) { return; }
  if (await frmMainRef.value.alertIfIsNotModified()) { return; }

  const mainData = cloneDeep(regMainData.value);
  cachedParams = {
    saveMainReq: mainData,
    saveDtlsReq: [mainData],
  };

  await dataService.post('/sms/wells/withdrawal/idvrve/billing-document-orders/details', cachedParams);

  notify(t('MSG_ALT_SAVE_DATA'));
  regMainData.value.isSearchChk = true;
  await onClickBefore();
  // await fetchData();
}

async function initProps() {
  if (props.bildcPblNo) {
    const { bildcPblNo, cstFnm, bildcWrteDt, bildcPblSn } = props;
    regMainData.value.bildcPblNo = bildcPblNo;
    regMainData.value.cstFnm = cstFnm;
    regMainData.value.bildcWrteDt = bildcWrteDt;
    regMainData.value.bildcPblSn = bildcPblSn;
    regMainData.value.state = 'updated';
    regMainData.value.rowState = 'updated';
    isUseChk.value = true;
    regMainData.value.isSearchChk = true;

    await fetchData();
  } else {
    isUseChk.value = false;
    regMainData.value.state = 'created';
    regMainData.value.rowState = 'created';
  }
}

onMounted(async () => {
  await initProps();
});

</script>

<style scoped lang="scss">
</style>
