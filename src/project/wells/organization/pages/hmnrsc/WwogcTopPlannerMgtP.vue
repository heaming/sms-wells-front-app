<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcTopPlannerMgtP - 수석 자격조정
3. 작성자 : 김동석
4. 작성일 : 2023-07-06
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수석플래너 관리 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <kw-form
      ref="frmMainRef"
      :cols="3"
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_MGT_YNM')">
          <p>{{ isEmpty(planner.mngtYm) ? '-' : stringUtil.getDateFormat(planner.mngtYm, 'YYYY-MM', 'YYYY-MM') }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PARTNER_NO')">
          <p>{{ planner.prtnrNo ?? '-' }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_EMPL_NM')">
          <p>{{ planner.prtnrKnm ?? '-' }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_UPGR_YM')">
          <p>{{ isEmpty(planner.upgrYm) ? '-' : stringUtil.getDateFormat(planner.upgrYm, 'YYYY-MM', 'YYYY-MM') }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_DMTN_YM')"
          :colspan="'2'"
        >
          <p>{{ isEmpty(planner.dmtnYm) ? '-' : stringUtil.getDateFormat(planner.dmtnYm, 'YYYY-MM', 'YYYY-MM') }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_GD')"
        >
          <kw-select
            v-model="planner.qlfDvCd"
            :options="pqlfDvCds"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_RFLT_YM')"
          :colspan="'2'"
        >
          <kw-date-picker
            v-model="planner.rfdt"
            type="month"
            :disable="true"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CRT_DT')">
          <p>{{ isEmpty(planner.fstRgstDtm) ? '-' : stringUtil.getDateFormat(planner.fstRgstDtm) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CREATE_NO')">
          <p>{{ planner.fnlMdfcUsrId ?? '-' }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CREATE_NM')">
          <p>{{ planner.rgstPrtnrKnm ?? '-' }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_MDFC_DATE')">
          <p>{{ isEmpty(planner.fnlMdfcDtm) ? '-' : stringUtil.getDateFormat(planner.fnlMdfcDtm) }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_MDFC_USR_NO')">
          <p>{{ planner.fnlMdfcUsrId ?? '-' }}</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_MDFC_USR_NM')">
          <p>{{ planner.mdfcPrtnrKnm ?? '-' }}</p>
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
        v-if="isShow"
        :label="$t('MSG_BTN_SAVE')"
        primary
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, stringUtil, useDataService, useGlobal, useModal } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import { SMS_WELLS_URI } from '~sms-wells/organization/constants/ogConst';

const dataService = useDataService();
const { cancel: onClickCancel, ok } = useModal();
const { notify } = useGlobal();
const { t } = useI18n();
const thisYm = dayjs().format('YYYYMM');
const frmMainRef = ref();

const props = defineProps({
  mngtYm: {
    type: String,
    required: true,
  },
  ogTpCd: {
    type: String,
    required: true,
  },
  prtnrNo: {
    type: String,
    required: true,
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const pqlfDvCds = await codeUtil.getCodes('PQLF_DV_CD');
const isShow = ref(false);
const planner = ref({});

async function fetchData() {
  const res = await dataService.get(`${SMS_WELLS_URI}/partner/${props.ogTpCd}/${props.prtnrNo}`, { params: { mngtYm: props.mngtYm } });

  if (res.data?.rfdt) { // 반영일자 컬럼(YYYYMMDD)을 YYYY-MM 형태로 변경
    res.data.rfdt = stringUtil.getDateFormat(res.data.rfdt, 'YYYYMM', 'YYYYMM');
  }

  planner.value = res.data;
  frmMainRef.value.init();

  if (res.data.mngtYm === thisYm) {
    isShow.value = true;
  } else {
    isShow.value = false;
  }
}

// 저장
async function onClickSave() {
  await dataService.put(`${SMS_WELLS_URI}/partner/${props.ogTpCd}/${props.prtnrNo}`, { ...planner.value, ogTpCd: props.ogTpCd });

  ok();
  notify(t('MSG_ALT_SVE_DATA'));
}

onMounted(async () => {
  if (!isEmpty(props.mngtYm) && !isEmpty(props.ogTpCd) && !isEmpty(props.prtnrNo)) {
    await fetchData();
  }
});

</script>
<style scoped>
</style>
