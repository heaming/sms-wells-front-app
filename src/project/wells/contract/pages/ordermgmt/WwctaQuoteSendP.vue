<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaQuoteSendP - 견적서 발송
3. 작성자 : JSY
4. 작성일 : 2023.05.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U-0011P01] - 견적서 발송
****************************************************************************************************
--->
<template>
  <kw-popup
    size="md"
    :title="$t('MSG_TXT_QUOT')+' '+$t('MSG_TXT_PSH_SEND')"
    :ignore-on-modified="sendYn"
    no-action
  >
    <kw-form :cols="1">
      <kw-form-row>
        <!--발송유형-->
        <kw-form-item :label="$t('MSG_TXT_FW_TP')">
          <kw-option-group
            v-model="searchParams.fwTpCd"
            type="radio"
            :options="fwTpCds"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!--발신번호-->
        <kw-form-item
          v-if="searchParams.fwTpCd==='01'"
          :label="$t('MSG_TXT_DSPH_NO')"
          required
        >
          <zwcm-telephone-number
            v-model:tel-no1="searchParams.sendTelNo1"
            v-model:tel-no2="searchParams.sendTelNo2"
            v-model:tel-no3="searchParams.sendTelNo3"
          />
        </kw-form-item>
        <!--발신메일-->
        <kw-form-item
          v-if="searchParams.fwTpCd==='02'"
          :label="$t('MSG_TXT_DSPTR_EML')"
          required
        >
          <zwcm-email-address
            v-model="searchParams.sendMail"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!--수신번호-->
        <kw-form-item
          v-if="searchParams.fwTpCd==='01'"
          :label="$t('MSG_TXT_RECP_NO')"
          required
        >
          <zwcm-telephone-number
            v-model:tel-no1="searchParams.recpTelNo1"
            v-model:tel-no2="searchParams.recpTelNo2"
            v-model:tel-no3="searchParams.recpTelNo3"
          />
        </kw-form-item>
        <!--수신메일-->
        <kw-form-item
          v-if="searchParams.fwTpCd==='02'"
          :label="$t('MSG_TXT_RCVR_EML')"
          required
        >
          <zwcm-email-address
            v-model="searchParams.recpMail"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-grid
      ref="grdQuoteSendList"
      name="grdQuoteSendList"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initQuoteSendList"
    />
    <template #action>
      <!--취소-->
      <kw-btn
        :label="$t('MSG_BTN_CANCEL')"
        negative
        @click="cancel"
      />
      <!--발송-->
      <kw-btn
        v-permission:create
        :label="$t('MSG_BTN_SEND')"
        primary
        @click="onClickSend"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useDataService, useMeta, useGlobal, confirm, useModal } from 'kw-lib';
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';
import ZwcmEmailAddress from '~common/components/ZwcmEmailAddress.vue';
import { isEmpty } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();
const { notify } = useGlobal();
const { cancel, ok } = useModal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdQuoteSendList = ref(getComponentType('KwGrid'));

const sendYn = ref(false);

// 발송유형코드
const fwTpCds = ref([
  { codeId: '01', codeName: t('MSG_TXT_KAKAO_NOTAK') },
  { codeId: '02', codeName: t('MSG_TXT_EMAIL') },
]);

const searchParams = ref({
  fwTpCd: '01',
  sendTelNo1: '',
  sendTelNo2: '',
  sendTelNo3: '',
  recpTelNo1: '',
  recpTelNo2: '',
  recpTelNo3: '',
  sendMail: '',
  recpMail: '',
});

const optionList = ref([]);

const props = defineProps({
  cntrNo: { type: String, default: '' }, // 부모창에서 넘어온 계약번호
  cntrSn: { type: String, default: '' }, // 부모창에서 넘어온 계약일련번호
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/contracts/quote-sends', { params: props });
  const view = grdQuoteSendList.value.getView();

  const dataSource = view.getDataSource();
  dataSource.setRows(res.data);
  pageInfo.value.totalCount = view.getItemCount();

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSend() {
  if (searchParams.value.fwTpCd === '01') {
    if (isEmpty(searchParams.value.sendTelNo1)
    || isEmpty(searchParams.value.sendTelNo2)
    || isEmpty(searchParams.value.sendTelNo3)
    || isEmpty(searchParams.value.recpTelNo1)
    || isEmpty(searchParams.value.recpTelNo2)
    || isEmpty(searchParams.value.recpTelNo3)) {
      notify(t('MSG_ALT_CHK_NCSR', [t('MSG_TXT_TEL_NO')]));
      return;
    }
  } else if (isEmpty(searchParams.value.recpMail)
  || isEmpty(searchParams.value.sendMail)) {
    notify(t('MSG_TXT_ENTR_EMAIL'));
    return;
  }
  const res = await dataService.get('/sms/wells/contract/contracts/quote-sends/inf', { params: props });
  if (res.data === '') {
    notify(t('MSG_ALT_RGST_CST_NTHNG'));
    return;
  }
  if (!await confirm(t('MSG_ALT_WANT_SEND_MESSAGE', [res.data.cntrCstNm,
    searchParams.value.fwTpCd === '01' ? t('MSG_TXT_NOTAK') : t('MSG_BTN_EMAIL_SEND'),
    searchParams.value.fwTpCd === '01' ? t('MSG_TXT_RECP_NO') : t('MSG_TXT_RCVR_EML'),
    searchParams.value.fwTpCd === '01'
      ? searchParams.value.recpTelNo1 + searchParams.value.recpTelNo2 + searchParams.value.recpTelNo3
      : searchParams.value.recpMail]))) { return; }
  optionList.value = { ...searchParams.value, ...res.data, ...props };
  await dataService.post('/sms/wells/contract/contracts/quote-sends', optionList.value);

  notify(t('MSG_ALT_SAVE_DATA'));
  sendYn.value = true;
  await ok();
}

onMounted(async () => {
  await fetchData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initQuoteSendList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'notyFwTpCd' }, // 구분
    { fieldName: 'sendVal' }, // 발신자 정보
    { fieldName: 'rcvrVal' }, // 수신자 정보
    { fieldName: 'sendUsrEmail' }, // 발신자 이메일
    { fieldName: 'rcvrEmadr' }, // 수신자 이메일
    { fieldName: 'sendPhoneNum' }, // 발신자 전화 번호
    { fieldName: 'recipientPhoneNum' }, // 수신자 전화 번호
    { fieldName: 'fwDtm' }, // 발송일
  ];

  const columns = [
    { fieldName: 'notyFwTpCd',
      header: `${t('MSG_TXT_SEND')}${t('MSG_TXT_TYPE')}`,
      width: '93',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        const notyFwTpCd = value ?? '';
        return notyFwTpCd === '20' ? t('MSG_TXT_NOTAK') : t('MSG_TXT_EMAIL');
      } }, // 발신유형
    { fieldName: 'sendVal',
      header: `${t('MSG_TXT_SEND')}${t('MSG_TXT_INF')}`,
      width: '196',
      styleName: 'text-left',
      displayCallback(grid, index) {
        const { notyFwTpCd, sendPhoneNum, sendUsrEmail } = gridUtil.getRowValue(grid, index.dataRow);
        return notyFwTpCd === '20' ? sendPhoneNum : sendUsrEmail;
      } }, // 발신정보
    { fieldName: 'rcvrVal',
      header: `${t('MSG_TXT_RECP')}${t('MSG_TXT_INF')}`,
      width: '196',
      styleName: 'text-left',
      displayCallback(grid, index) {
        const { notyFwTpCd, recipientPhoneNum, rcvrEmadr } = gridUtil.getRowValue(grid, index.dataRow);
        return notyFwTpCd === '20' ? recipientPhoneNum : rcvrEmadr;
      } }, // 수신정보
    { fieldName: 'fwDtm',
      header: t('MSG_TXT_FW_DAY'),
      width: '133',
      styleName: 'text-center',
      dataType: 'date',
      datetimeFormat: 'date' }, // 발송일
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});
</script>
