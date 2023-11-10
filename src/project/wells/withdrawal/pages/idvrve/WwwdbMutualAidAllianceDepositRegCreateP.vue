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
              clearable
              rules="required"
              :label="t('MSG_TXT_ITG_DP_NO')"
            />
            <!-- @click-icon="onClickSelectIntegrationDeposit" -->
            <kw-btn
              icon="search"
              @click="onClickSelectIntegrationDeposit"
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
import { modal, useDataService, useModal, alert, confirm } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();

const now = dayjs();
const dataService = useDataService();
const { ok } = useModal();
const store = useStore();
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
  dpObjAmtSum: {
    type: Number,
    default: 0,
  },

});
const { companyCode } = store.getters['meta/getUserInfo'];

const searchParams = ref({
  perfDt: now.format('YYYYMMDD'), // 실적일자
  rveDt: now.format('YYYYMMDD'), // 수납일자
  rveCd: '', // 수납코드
  rveNm: '',
  itgDpNo: '', // 통합입금번호
  lifAlncDvCd: '',
  lifSpptYm: '',
  dpTpCd: '', // 입금유형
  kwGrpCoCd: companyCode, // 수납코드
  dpObjAmtSum: 0,
});

const obsRef = ref();

async function onKeyDownSelectRveCd() {
  searchParams.value.rveNm = '';
  searchParams.value.itgDpNo = '';
  searchParams.value.dpTpCd = '';
}

async function onClearSelectRveCd() {
  searchParams.value.rveCd = '';
  searchParams.value.rveNm = '';
  searchParams.value.itgDpNo = '';
  searchParams.value.dpTpCd = '';
}

// 수납코드 조회 팝업
async function onClickSelectRveCd() {
  const { result, payload } = await modal({ component: 'ZwwdyDivisionReceiveCodeRegP',
    componentProps: { rveCd: searchParams.value.rveCd, rveNm: searchParams.value.rveNm },
  });
  if (result) {
    searchParams.value.rveCd = payload.rveCd;
    searchParams.value.rveNm = payload.rveNm;
    searchParams.value.itgDpNo = '';
    searchParams.value.dpTpCd = '';
  }
}

// // 통합입금번호
async function onClickSelectIntegrationDeposit() {
  // console.log(searchParams.value.rveCd);
  // console.log(searchParams.value.rveNm);

  const { result, payload } = await modal({
    component: 'WwwdbIntegrationDepositListP',
    componentProps: {
      itgDpNo: searchParams.value.itgDpNo,
      rveCd: searchParams.value.rveCd,
      rveNm: searchParams.value.rveNm,
      // dpTpCd: searchParams.value.dpTpCd,
    },
  });

  if (result) {
    if (payload.dpBlam <= 0) {
      await alert(t('통합 입금잔액이 없습니다.'));
      return;
    }

    if (props.dpObjAmtSum !== payload.dpBlam) {
      await alert(t('MSG_ALT_MUTU_DP_IZ_AMT_GAP'));
      return;
    }

    searchParams.value.itgDpNo = payload.itgDpNo; // 입금잔액
    searchParams.value.rveCd = payload.rveCd;
    searchParams.value.rveNm = payload.rveNm;
    searchParams.value.dpTpCd = payload.dpTpCd;
  }
}
let cachedParams;

async function onClickCreate() {
  if (!await obsRef.value.validate()) { return; }

  if (await obsRef.value.alertIfIsNotModified()) { return; }

  const today = now.format('YYYYMMDD');
  const month = now.format('YYYYMM');

  if (today < searchParams.value.perfDt) {
    await alert('실적일자는 현재일 과 이전만 가능 합니다.');
    return;
  }

  if (month !== searchParams.value.perfDt.substring(0, 6)) {
    await alert('실적일자는 현재월 만 가능 합니다.');
    return;
  }

  if (today < searchParams.value.rveDt) {
    await alert('수납일자는 현재일 과 이전만 가능 합니다.');
    return;
  }

  if (month !== searchParams.value.rveDt.substring(0, 6)) {
    await alert('수납일자는 현재월 만 가능 합니다.');
    return;
  }

  if (!await confirm('생성하시겠습니까?')) {
    return;
  }

  cachedParams = cloneDeep(searchParams.value);

  await dataService.post('/sms/wells/withdrawal/idvrve/mutual-alliance-bulk-deposit/create', cachedParams, { timeout: 18000000 });

  await alert('생성되었습니다. 수납처리까지 10분 가량 소요 됩니다.');
  ok();
}

async function initProps() {
  const { lifAlncDvCd, lifSpptYm, dpObjAmtSum } = props;

  searchParams.value.lifAlncDvCd = lifAlncDvCd;
  searchParams.value.lifSpptYm = lifSpptYm;
  searchParams.value.dpObjAmtSum = dpObjAmtSum;
}

onMounted(async () => {
  await initProps();
});
</script>
