<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNF
2. 프로그램 ID : [W-SV-U-0041M01] WwsnfMonthManagementCustomerMgtM - 월관리 고객 생성(시스템관리-권한관리)
3. 작성자 : juno.cha
4. 작성일 : 2022.12.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 월관리 고객 생성(시스템관리-권한관리)
****************************************************************************************************
--->
<template>
  <kw-page>
    <template #header />
    <kw-search
      v-permission:read
      :cols="4"
      :no-reset-btn="true"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('관리년월')">
          <kw-date-picker
            v-model="searchParams.mngtYm"
            :min-date="minDate"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('생성대상')"
        >
          <kw-select
            v-model="searchParams.createTarget"
            :options="customCodes.CRT_TRGT"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="normal-area normal-area--button-set-bottom pt30">
      <kw-form
        :cols="2"
      >
        <kw-form-row>
          <kw-form-item
            colspan="2"
            :label="$t('생성대상 설명')"
          >
            <ul>
              <li>
                <p>{{ $t('MSG_TXT_CRT_EXP') }}</p>
                <p :style="{color : getBatchColor(batchStatus.statusA)}">
                  {{ $t('배치상태') }} : {{ batchStatus.statusA }}
                </p>
              </li>
            </ul>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <div class="button-set--bottom">
        <div class="button-set--bottom-right">
          <kw-btn
            v-permission:delete
            :label="$t('삭제')"
            secondary
            class="mr8"
            @click="onClickDelete"
          />
          <kw-btn
            v-permission:create
            :label="$t('생성')"
            primary
            @click="onClickCreate"
          />
        </div>
      </div>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';
import { useDataService, useGlobal } from 'kw-lib';

const { confirm, notify, alert } = useGlobal();
const { t } = useI18n();

const dataService = useDataService();
const minDate = dayjs().format('YYYY-MM-DD');

/*
 *  Search Parameter
 */
const searchParams = ref({
  mngtYm: dayjs().format('YYYYMM'),
  createTarget: 'A',
});

const batchStatus = ref({
  statusA: 'EMPTY',
});

/*
 *  조회조건 Combo를 위한 Custom Code setting
 */
const customCodes = {
  CRT_TRGT: [
    { codeId: 'A', codeName: '고객이월 생성' },
  ],
};

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
/*
 *  Event - 조회 버튼 클릭
 */
async function onClickSearch() {
  const res = await dataService.get('/sms/wells/service/month-management', { params: searchParams.value });

  batchStatus.value.statusA = res.data.statusA;
}

/*
 *  Event - 생성 버튼 클릭
 */
async function onClickCreate() {
  // if (true) {
  //   await alert('배치 개발 중입니다.');
  //   return;
  // }

  if (!await confirm(t('MSG_ALT_IS_CRT_DATA'))) { return; }
  await dataService.post('/sms/wells/service/month-management', searchParams.value);
  // await notify(t('MSG_ALT_CRT_FSH'));
  await alert(t('MSG_ALT_CRT_FSH')); // 생성 되었습니다. (배치 상태 조회 시 너무 빠를 경우 조회가 안되는 경우를 방지하기 위해 alert 세팅)
  await onClickSearch();
}

/*
 *  Event - 삭제 버튼 클릭
 */
async function onClickDelete() {
  if (!await confirm(t('MSG_ALT_WANT_DEL'))) { return; }
  await dataService.delete('/sms/wells/service/month-management', { data: searchParams.value });
  await notify(t('MSG_ALT_DELETED'));
}

/*
 *  Batch 상태에 따른 색상 설정을 위한 function
 */
function getBatchColor(status) {
  if (status === 'EMPTY') {
    return 'blue';
  } if (status === 'STARTED') {
    return 'red';
  }
  return '';
}

/*
 *  Batch 상태를 Text로 가져오기 위한 function
 */
// function getBatchStatus(codeId) {
//   if (codeId === 'A') {
//     return batchStatus.value.statusA;
//   }
//   return '';
// }

onMounted(() => {
  onClickSearch();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
