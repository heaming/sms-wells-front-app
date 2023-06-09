<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : idvrve
2. 프로그램 ID : WtwdbBillingDocumentWriteTabletRegM - 청구서 작성 태블릿
3. 작성자 : heungjun.lee
4. 작성일 : 2023.02.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 청구서 관리 조회
****************************************************************************************************
--->

<template>
  <kw-page
    ref="pageRef"
  >
    <!-- 고객정보 -->
    <h3 class="mb20">
      고객정보
    </h3>
    <kw-form>
      <kw-form-row>
        <kw-form-item
          rules="required"
          :label="t('MSG_TXT_CST_NM')"
        >
          <kw-input
            v-model="regMainData.cstFnm"
            :label="t('MSG_TXT_CST_NM')"
            icon="search"
            clearable
            rules="required|max:16"
            maxlength="48"
            counter
            :disable="isUseChk"
            @click-icon="onClickSearchUser"
          />
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TIT_DRAT_DT')"
        >
          <kw-date-picker
            v-model="regMainData.bildcWrteDt"
            :label="t('MSG_TIT_DRAT_DT')"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />

    <!-- 청구내역 -->
    <h3 class="mb20">
      {{ t('MSG_TXT_BIL_IZ') }}
    </h3>

    <kw-form>
      <kw-form-row>
        <kw-form-item
          :label="t('MSG_TXT_PRDT_NM')"
        >
          <kw-input
            v-model="regMainData.pdNm"
            :label="t('MSG_TXT_PRDT_NM')"
            rules="required|max:33"
            maxlength="33"
          />
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_QTY')"
        >
          <zwcm-counter
            v-model="regMainData.pdQty"
            :label="t('MSG_TXT_QTY')"
            :min="1"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="t('MSG_TXT_UPRC_TAM')"
        >
          <kw-input
            v-model="regMainData.pdSellAmt"
            :label="t('MSG_TXT_UPRC_TAM')"
            rules="required|max:20"
            type="number"
            maxlength="20"
          />
        </kw-form-item>
        <kw-form-item

          :label="t('MSG_TXT_NOTE')"
        >
          <kw-input
            v-model="regMainData.rmkCn"
            :label="t('MSG_TXT_NOTE')"
            rules="max:333"
            maxlength="1666"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <template #action>
      <div class="tablet-action-left">
        <!-- label="이전" -->
        <kw-btn
          secondary
          :label="t('MSG_BTN_PREV')"
          @click="onClickBefore"
        />
      </div>
      <!-- label="저장" -->
      <div class="tablet-action-right">
        <kw-btn
          primary
          :label="t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
      </div>
    </template>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import dayjs from 'dayjs';
import { modal, notify, router, useDataService, confirm, alert } from 'kw-lib';
import ZwcmCounter from '~common/components/ZwcmCounter.vue';
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
const { employeeIDNumber, userName } = userInfo;

const regMainData = ref({
  bildcPblNo: '',
  bildcPblSn: '',
  cstFnm: '', // 고객명
  bildcWrteDt: now.format('YYYYMMDD'), // 작성일자
  sellPrtnrNo: employeeIDNumber, // 이건 나중에 사번으로 바꿔야함
  sellPrtnrNm: userName,
  state: '',
  rowState: '',
  pdNm: '', // 상품명
  pdQty: '', // 수량
  pdSellAmt: '', // 단가(총액)
  rmkCn: '', // 비고
});

const pageRef = ref();

const isUseChk = ref(false);

// 고객명 찾기 이벤트
async function onClickSearchUser() {
  const { result, payload } = await modal({ component: 'ZwcsaCustomerListP' });

  if (result) {
    regMainData.value.cstFnm = payload.name;
  }
}

// 이전 버튼 클릭
async function onClickBefore() {
  await router.push(
    {
      path: '/withdrawal/wtwdb-billing-document-mgt',
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

  console.log(regMainData.value);
}

let cachedParams;

// 저장 버튼
async function onClickSave() {
  if (!await pageRef.value.validate()) { return; }
  if (await pageRef.value.alertIfIsNotModified()) { return; }

  if (regMainData.value.pdQty < 1 || regMainData.value.pdQty === '') {
    await alert('수량의 경우 0보다 커야합니다.');
    return;
  }

  if (!await confirm(t('MSG_ALT_IS_SAV_DATA'))) { return; }

  const mainData = cloneDeep(regMainData.value);
  cachedParams = {
    saveMainReq: mainData,
    saveDtlsReq: [mainData],
  };

  console.log(cachedParams);

  await dataService.post('/sms/wells/withdrawal/idvrve/billing-document-orders/details', cachedParams);

  notify(t('MSG_ALT_SAVE_DATA'));
  regMainData.value.isSearchChk = true;
  // await fetchData();
  await onClickBefore();
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
    console.log(regMainData.value.bildcPblNo);

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
