<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSD
2. 프로그램 ID : WwpsdExcellentDivClHhMgtP
3. 작성자 : Park Yesol
4. 작성일 : 2023.11.24.
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 우수사업부 마감시간 관리 팝업
****************************************************************************************************
-->

<template>
  <kw-popup
    class="kw-popup--xl"
  >
    <kw-search
      one-row
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.basYrmn"
            :label="t('MSG_TXT_MGT_YNM')"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_OG_TP')"
          required
        >
          <kw-select
            v-model="searchParams.ogTpCd"
            type="radio"
            :label="t('MSG_TXT_OG_TP')"
            :options="codes.EVL_OG_TP_CD"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <kw-form
      ref="frmMainRef"
      cols="1"
      class="pt30"
    >
      <kw-form-row>
        <kw-form-item
          :label="t('MSG_TXT_PRD')"
          required
        >
          <kw-date-picker
            v-model="formData.startDt"
            :label="t('MSG_TXT_START_DATE')"
            rules="required"
          />
          <kw-time-picker
            v-model="formData.startHm"
            :label="t('MSG_TXT_TIME')"
            rules="required"
          />
          <span>~</span>
          <kw-date-picker
            v-model="formData.finsDt"
            :label="t('MSG_TXT_END_DATE')"
            rules="required"
          />
          <kw-time-picker
            v-model="formData.finsHm"
            :label="t('MSG_TXT_TIME')"
            rules="required"
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
        v-permission:create
        primary
        :label="$t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useModal, useGlobal, getComponentType, codeUtil } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const { notify } = useGlobal();
const { cancel: onClickCancel } = useModal();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();
const frmMainRef = ref(getComponentType('KwForm'));

// 공통코드로딩
const codes = await codeUtil.getMultiCodes(
  'EVL_OG_TP_CD',
);

const searchParams = ref({
  basYrmn: now.format('YYYYMM'),
  ogTpCd: 'W02',
});

const formData = ref({
  basYrmn: searchParams.value.basYrmn,
  ogTpCd: '',
  ddlnId: '',
  startDt: `${now.format('YYYYMM')}01`,
  startHm: '0900',
  finsDt: `${now.format('YYYYMM')}27`,
  finsHm: '1900',
});

const onClickSave = async () => {
  if (!await frmMainRef.value.validate()) { return; }
  await dataService.post('/sms/wells/competence/excellent-division-base/deadline', formData.value);
  notify(t('MSG_ALT_SAVE_DATA'));
};

const initDetail = async () => {
  const res = await dataService.get('/sms/wells/competence/excellent-division-base/deadline', { params: { ...searchParams.value } });
  if (!isEmpty(res.data)) {
    formData.value = res.data;
  } else {
    formData.value.basYrmn = searchParams.value.basYrmn;
    formData.value.ogTpCd = searchParams.value.ogTpCd;
    formData.value.startDt = `${searchParams.value.basYrmn}01`;
    formData.value.startHm = '0900';
    formData.value.finsDt = `${searchParams.value.basYrmn}27`;
    formData.value.finsHm = '1900';
  }
};

const onClickSearch = async () => {
  await initDetail();
};

onMounted(() => {
  if (!isEmpty(searchParams.value.basYrmn)) {
    initDetail();
  }
});
</script>
