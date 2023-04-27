<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID : WwwdbMutualAidAllianceDepositRegCreateP - 상조제휴입금등록 생성
3. 작성자 : heungjun.lee
4. 작성일 : 2023.02.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 상조제휴 일괄입금 생성한다.
****************************************************************************************************
--->
<template>
  <kw-popup
    size="md"
  >
    <kw-observer ref="obsRef">
      <kw-form :cols="1">
        <kw-form-row>
          <!-- label="실적일자" -->
          <kw-form-item
            :label="t('MSG_TXT_PERF_DT')"
            required
          >
            <kw-date-picker
              v-model="searchParams.perfDt"
              :label="t('MSG_TXT_PERF_DT')"
              rules="required"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- label="수납일자" -->
          <kw-form-item
            :label="t('MSG_TXT_RVE_DT')"
            required
          >
            <kw-date-picker
              v-model="searchParams.rveDt"
              :label="t('MSG_TXT_RVE_DT')"
              rules="required"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- label="수납코드" -->
          <kw-form-item
            :label="t('MSG_TXT_RVE_CD')"
            required
          >
            <kw-input
              v-model="searchParams.rveCd"
              icon="search"
              type="text"
              :label="$t('MSG_TXT_RVE_CD')"
              clearable
              mask="#####"
              rules="required"
              @keydown="onKeyDownSelectRveCd"
              @click-icon="onClickSelectRveCd"
              @clear="onClearSelectRveCd"
            />
            <kw-input
              v-model="searchParams.rveNm"
              :disable="true"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- label="통합입금번호" -->
          <kw-form-item
            :label="t('MSG_TXT_ITG_DP_NO')"
            required
          >
            <kw-input
              v-model="searchParams.itgDpNo"
              :readonly="true"
              icon="search"
              clearable
              rules="required"
              :label="t('MSG_TXT_ITG_DP_NO')"
              @click-icon="onClickSelectIntegrationDeposit"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
    </kw-observer>
    <template #action>
      <!-- label="생성" -->
      <kw-btn
        primary
        :label="t('MSG_BTN_CNTN_CREATE')"
        @click="onClickCreate"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';
import { modal, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();

const now = dayjs();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  lifAlncDvCd: {
    type: String,
    default: null,
  },
  lifSpptYm: {
    type: String,
    default: null,
  },

});

const searchParams = ref({
  perfDt: now.format('YYYYMMDD'), // 실적일자
  rveDt: now.format('YYYYMMDD'), // 수납일자
  rveCd: '', // 수납코드
  rveNm: '',
  itgDpNo: '', // 통합입금번호
  lifAlncDvCd: '',
  lifSpptYm: '',
});

const obsRef = ref();

async function onKeyDownSelectRveCd() {
  searchParams.value.rveNm = '';
}

async function onClearSelectRveCd() {
  searchParams.value.rveCd = '';
  searchParams.value.rveNm = '';
}

// 수납코드 조회 팝업
async function onClickSelectRveCd() {
  const { result, payload } = await modal({ component: 'ZwwdyDivisionReceiveCodeRegP',
    componentProps: { rveCd: searchParams.value.rveCd, rveNm: searchParams.value.rveNm },
  });
  console.log(payload);
  if (result) {
    console.log(payload);
    searchParams.value.rveCd = payload.rveCd;
    searchParams.value.rveNm = payload.rveNm;
  }
}

// // 통합입금번호
async function onClickSelectIntegrationDeposit() {
  const { result, payload } = await modal({
    component: 'WwdbIntegrationDepositListP',
    componentProps: { itgDpNo: searchParams.value.itgDpNo },
  });

  if (result) {
    console.log(payload);
    searchParams.value.itgDpNo = payload.itgDpNo; // 입금잔액

    // if (payload.dpBlam || payload.dpDtm) {
    //   console.log(payload.dpBlam);
    //   console.log(payload.dpDtm);

    //   // data.setValue(0, 'dpBlam', payload.dpBlam);
    //   // data.setValue(0, 'dpDtm', payload.dpDtm);

    //   searchParams.value.itgDpNo = payload.dpBlam;
    // }
  }
}
let cachedParams;

async function onClickCreate() {
  if (!await obsRef.value.validate()) { return; }

  if (await obsRef.value.alertIfIsNotModified()) { return; }

  cachedParams = cloneDeep(searchParams.value);

  console.log(cachedParams);

  const res = await dataService.post('/sms/wells/withdrawal/idvrve/mutual-alliance-bulk-deposit/create', cachedParams);
  console.log(res.data);

  // notify(t('MSG_ALT_DEVELOPING'));
}

async function initProps() {
  const { lifAlncDvCd, lifSpptYm } = props;

  console.log(lifAlncDvCd);

  searchParams.value.lifAlncDvCd = lifAlncDvCd;
  searchParams.value.lifSpptYm = lifSpptYm;
}

onMounted(async () => {
  await initProps();
});
</script>
