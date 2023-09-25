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

    <div class="normal-area normal-area--button-set-bottom">
      <kw-form
        :cols="2"
        class="mt30"
      >
        <kw-form-row>
          <kw-form-item :label="$t('배정년월')">
            <kw-date-picker
              v-model="searchParams.asnOjYm"
              type="month"
            />
          </kw-form-item>
          <kw-form-item :label="$t('생성대상')">
            <kw-select
              v-model="searchParams.createTarget"
              :options="customCodes.CRT_TRGT"
            />
          </kw-form-item>
        </kw-form-row>
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
const { confirm, notify } = useGlobal();

const dataService = useDataService();

/*
 *  Search Parameter
 */
const searchParams = ref({
  asnOjYm: dayjs().format('YYYYMM'),
  createTarget: 'A',
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
 *  Event - 생성 버튼 클릭
 */
async function onClickCreate() {
  // if (true) {
  //   await alert('배치 개발 중입니다.');
  //   return;
  // }
  if (!await confirm(t('MSG_ALT_IS_CRT_DATA'))) { return; }
  await dataService.post('/sms/wells/service/regular-bs-object', searchParams.value);
  await notify(t('MSG_ALT_CRT_FSH')); // 생성 되었습니다.
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
