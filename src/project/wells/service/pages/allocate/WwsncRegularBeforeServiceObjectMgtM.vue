<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : [W-SV-U-0043M01] WwsncRegularBeforeServiceObjectMgtM - 정기 B/S 대상 선정
3. 작성자 : juno.cha
4. 작성일 : 2022.12.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 정기 B/S 대상 선정
****************************************************************************************************
--->
<template>
  <kw-page size="md">
    <template #header />
    <kw-search
      v-permission:read
      :cols="4"
      :no-reset-btn="true"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('배정년월')">
          <kw-date-picker
            v-model="searchParams.asnOjYm"
            type="month"
          />
        </kw-search-item>
        <kw-search-item :label="$t('생성대상')">
          <kw-select
            v-model="searchParams.createTarget"
            :options="customCodes.CRT_TRGT"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="normal-area normal-area--button-set-bottom">
      <kw-form
        :cols="2"
        class="mt30"
      >
        <kw-form-row>
          <kw-form-item
            :label="$t('생성대상 설명')"
            :colspan="2"
          >
            <ol>
              <li
                v-for="item in customCodes.CRT_TRGT"
                :key="item.codeId"
              >
                {{ $t(`MSG_TXT_CRT_TRGT_EXP_${item.codeId}`) }}
                <p :style="{color : getBatchColor(getBatchStatus(item.codeId))}">
                  {{ $t('배치상태') }} : {{ getBatchStatus(item.codeId) }}
                </p>
              </li>
            </ol>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <div class="button-set--bottom">
        <div class="button-set--bottom-right">
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

const { t } = useI18n();
const { confirm, alert } = useGlobal();

const dataService = useDataService();

/*
 *  Search Parameter
 */
const searchParams = ref({
  asnOjYm: dayjs().format('YYYYMM'),
  createTarget: 'A',
});

const batchStatus = ref({
  statusA: 'EMPTY',
  statusB: 'EMPTY',
  statusH: 'EMPTY',
});

/*
 *  조회조건 Combo를 위한 Custom Code setting
 */
const customCodes = {
  CRT_TRGT: [
    { codeId: 'A', codeName: '배정고객 생성' },
    { codeId: 'B', codeName: '투입자재 생성' },
    // { codeId: 'C', codeName: '주기표 추가' },
    // { codeId: 'D', codeName: '전월미처리고객' },
    // { codeId: 'E', codeName: '튜빙피팅체크' },
    // { codeId: 'F', codeName: '중복자재 처리' },
    // { codeId: 'G', codeName: '배정고객 정리' },
    { codeId: 'H', codeName: '배정생성' },
  ],
};
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
/*
 *  Event - 조회 버튼 클릭
 */
async function onClickSearch() {
  const res = await dataService.get('/sms/wells/service/regular-bs-object', { params: searchParams.value });

  batchStatus.value.statusA = res.data.statusA;
  batchStatus.value.statusB = res.data.statusB;
  batchStatus.value.statusH = res.data.statusH;
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
  await dataService.post('/sms/wells/service/regular-bs-object', searchParams.value);
  // await notify(t('MSG_ALT_CRT_FSH')); // 생성 되었습니다.
  await alert(t('MSG_ALT_CRT_FSH')); // 생성 되었습니다. (배치 상태 조회 시 너무 빠를 경우 조회가 안되는 경우를 방지하기 위해 alert 세팅)
  await onClickSearch();
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
function getBatchStatus(codeId) {
  if (codeId === 'A') {
    return batchStatus.value.statusA;
  } if (codeId === 'B') {
    return batchStatus.value.statusB;
  } if (codeId === 'H') {
    return batchStatus.value.statusH;
  }
  return '';
}

onMounted(() => {
  onClickSearch();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
