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
    <div class="normal-area normal-area--button-set-bottom pt30">
      <kw-form
        :cols="2"
      >
        <kw-form-row>
          <kw-form-item :label="$t('관리년월')">
            <kw-date-picker
              v-model="searchParams.mngtYm"
              :min-date="minDate"
              type="month"
            />
          </kw-form-item>
          <kw-form-item
            :label="$t('생성대상')"
          >
            <kw-select
              v-model="searchParams.createTarget"
              :options="customCodes.CRT_TRGT"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            colspan="2"
            :label="$t('생성대상 설명')"
          >
            <p>{{ $t('MSG_TXT_CRT_EXP') }}</p>
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

const { confirm, notify } = useGlobal();
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
 *  Event - 생성 버튼 클릭
 */
async function onClickCreate() {
  // if (true) {
  //   await alert('배치 개발 중입니다.');
  //   return;
  // }

  if (!await confirm(t('MSG_ALT_IS_CRT_DATA'))) { return; }
  await dataService.post('/sms/wells/service/month-management', searchParams.value);
  await notify(t('MSG_ALT_CRT_FSH'));
}

/*
 *  Event - 삭제 버튼 클릭
 */
async function onClickDelete() {
  if (!await confirm(t('MSG_ALT_WANT_DEL'))) { return; }
  await dataService.delete('/sms/wells/service/month-management', { data: searchParams.value });
  await notify(t('MSG_ALT_DELETED'));
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
