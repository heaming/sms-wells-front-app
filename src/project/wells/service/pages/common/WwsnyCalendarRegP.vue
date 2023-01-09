<template>
  <kw-popup
    size="md"
    title="Calendar 등록"
  >
    <kw-form :cols="1">
      <kw-form-row>
        <kw-form-item :label="$t('일자')">
          <p>{{ toInteger(calendarInfo.baseD) }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('회사휴무')">
          <kw-select
            v-model="calendarInfo.dfYn"
            :options="codes.COD_YN"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('당직자')">
          <kw-select
            v-model="calendarInfo.bndtWrkPsicNo"
            :options="['김교원', 'B', 'C', 'D']"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('비고')">
          <kw-input
            v-model="calendarInfo.rmkCn"
            :maxlength="1000"
            type="textarea"
            :rows="3"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
        dense
        @click="onClickCancel"
      />
      <kw-btn
        primary
        :label="t('MSG_BTN_SAVE')"
        dense
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>

<script setup>
import { codeUtil, useModal, useGlobal, useDataService } from 'kw-lib';
import { toInteger } from 'lodash-es';

const { t } = useI18n();
const { notify } = useGlobal();
const { ok, cancel: onClickCancel } = useModal();
const dataService = useDataService();

/*
 *  Parent Parameter를 가져오기 위한 변수 선언.
 */
const props = defineProps({
  svCnrOgId: {
    type: String,
    required: true,
  },
  baseY: {
    type: String,
    required: true,
  },
  baseMm: {
    type: String,
    required: true,
  },
  baseD: {
    type: String,
    required: true,
  },
  dfYn: {
    type: String,
    required: true,
  },
  bndtWrkPsicNo: {
    type: String,
    required: true,
  },
  rmkCn: {
    type: String,
    required: true,
  },
});

/*
 *  Response Data setting을 위한 parameter
 */
const calendarInfo = ref({
  svCnrOgId: props.svCnrOgId,
  baseY: props.baseY,
  baseMm: props.baseMm,
  baseD: props.baseD,
  dfYn: props.dfYn ?? 'N',
  bndtWrkPsicNo: props.bndtWrkPsicNo,
  rmkCn: props.rmkCn,
});

/*
 *  공통코드 조회
 */
const codes = await codeUtil.getMultiCodes(
  'COD_YN',
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
/*
 *  해당 일자의 데이터를 조회
 */
async function getCalendarDay() {
  const res = await dataService.get('/sms/wells/service/calendar-management/day', { params: { ...calendarInfo.value } });
  res.data.dfYn = res.data.dfYn ?? 'N';
  calendarInfo.value = res.data;
}
getCalendarDay();

/*
 *  Event - 저장 버튼 클릭
 */
async function onClickSave() {
  // if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }

  await dataService.post('/sms/wells/service/calendar-management', calendarInfo.value);

  await notify(t('MSG_ALT_SAVE_DATA'));
  ok();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
