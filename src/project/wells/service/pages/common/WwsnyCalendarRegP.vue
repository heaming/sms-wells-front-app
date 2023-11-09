<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNY
2. 프로그램 ID : [W-SV-U-0216P01] WwsnyCalendarRegP - Calendar 등록
3. 작성자 : juno.cha
4. 작성일 : 2023.01.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- Calendar 등록 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    size="md"
  >
    <kw-form
      ref="frmRef"
      :cols="1"
    >
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
            :readonly="!props.isHolidaySetable()"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('당직자')">
          <kw-select
            v-model="calendarInfo.bndtWrkPsicNo"
            :options="customCodes.SERVICE_CENTER_ENGINEER"
            :emit-value="false"
            option-value="prtnrNo"
            option-label="prtnrNoNm"
            first-option="all"
            first-option-value=""
            :first-option-label="$t('없음')"
            :readonly="props.isHolidaySetter()"
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
            :readonly="!props.isHolidaySetable()"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickCancel"
      />
      <kw-btn
        primary
        :label="t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useModal, useDataService } from 'kw-lib';
import { toInteger, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { ok, cancel: onClickCancel } = useModal();
const dataService = useDataService();

const frmRef = ref();

/*
 *  Parent Parameter를 가져오기 위한 변수 선언.
 */
const props = defineProps({
  svCnrOgId: {
    type: String,
    required: true,
  },
  svCnrOgCd: {
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
  ogTpCd: {
    type: String,
    required: true,
  },
  rmkCn: {
    type: String,
    required: true,
  },
  isHolidaySetter: {
    type: Function,
    default: () => false,
  },
  isHolidaySetable: {
    type: Function,
    default: () => false,
  },
});

/*
 *  Response Data setting을 위한 parameter
 */
const calendarInfo = ref({
  svCnrOgId: props.svCnrOgId,
  svCnrOgCd: props.svCnrOgCd,
  baseY: props.baseY,
  baseMm: props.baseMm,
  baseD: props.baseD,
  dfYn: props.dfYn ?? 'N',
  // bndtWrkPsicNo: props.bndtWrkPsicNo,
  // bndtWrkPsicNo: undefined,
  bndtWrkPsicNo: { ogTpCd: '', prtnrNo: '' },
  bndtWrkPsicNoPrtnrNo: '',
  bndtWrkPsicNoOgTpCd: '',
  rmkCn: props.rmkCn,
});

/*
 *  공통코드 조회
 */
const codes = await codeUtil.getMultiCodes(
  'COD_YN',
);

/*
 *  Custom Code setting
 */
const customCodes = {
  SERVICE_CENTER_ENGINEER: [], // 당직자
};

/*
 * 당직자 조회
 */
async function getServiceCenterEngineer() {
  const res = await dataService.get('/sms/wells/service/organizations/engineer', { params: { dgr1LevlOgId: calendarInfo.value.svCnrOgId } });
  customCodes.SERVICE_CENTER_ENGINEER = res.data;

  calendarInfo.value.bndtWrkPsicNo = customCodes.SERVICE_CENTER_ENGINEER
    // .find((element) => (element.prtnrNo === props.bndtWrkPsicNo));
    .find((element) => (element.prtnrNo === props.bndtWrkPsicNo && element.ogTpCd === props.ogTpCd));

  frmRef.value.init();
}
// await getServiceCenterEngineer();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
/*
 *  해당 일자의 데이터를 조회
 */
async function getCalendarDay() {
  const res = await dataService.get('/sms/wells/service/calendars/day', { params: { ...calendarInfo.value } });
  res.data.dfYn = res.data.dfYn ?? 'N';
  calendarInfo.value = res.data;
}
// getCalendarDay();

/*
 *  Event - 저장 버튼 클릭
 */
async function onClickSave() {
  if (isEmpty(calendarInfo.value.bndtWrkPsicNo) || isEmpty(calendarInfo.value.bndtWrkPsicNo.prtnrNo)) {
    calendarInfo.value.bndtWrkPsicNoPrtnrNo = '';
    calendarInfo.value.bndtWrkPsicNoOgTpCd = '';
  } else {
    calendarInfo.value.bndtWrkPsicNoPrtnrNo = calendarInfo.value.bndtWrkPsicNo.prtnrNo;
    calendarInfo.value.bndtWrkPsicNoOgTpCd = calendarInfo.value.bndtWrkPsicNo.ogTpCd;
  }

  await dataService.post('/sms/wells/service/calendars', calendarInfo.value);
  ok();
}

onMounted(async () => {
  await getCalendarDay();
  await getServiceCenterEngineer();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
