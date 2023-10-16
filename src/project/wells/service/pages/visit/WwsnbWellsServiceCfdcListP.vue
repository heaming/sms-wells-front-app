<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : [W-SV-U-0081P01] WwsnbWellsServiceCfdcListP - 웰스 서비스 확인서 발송
3. 작성자 : yeongjoong.kim
4. 작성일 : 2023.07.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 웰스 서비스 확인서 발송 기능
- 웰스 서비스 확인서 발송을 위한 주문내역 조회
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
    no-action
  >
    <h3>{{ $t('MSG_TXT_SEND_INFO_INP') }}</h3><!-- 발송정보 입력 -->
    <kw-form
      ref="frmMainRef"
      :cols="2"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_FW_TP')"
        >
          <!-- 발송유형 -->
          <kw-option-group
            v-model="sendInfo.sendType"
            type="radio"
            :options="sendTypes"
            ignore-on-modified
          />
        </kw-form-item>

        <kw-form-item
          :label="$t('MSG_TXT_ETC_SELT')"
          :hint="$t('MSG_TXT_HINT_31')"
        >
          <!-- 기타 선택 --><!-- 선택한 항목이 웰스 서비스 확인서에 출력됩니다. -->
          <kw-option-group
            v-model="sendInfo.etcSelect"
            type="radio"
            :options="etcSelects"
          /><!--  -->
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_PBL_DT')"
          required
        >
          <!-- 발행일자 -->
          <kw-date-picker
            v-model="sendInfo.publishDate"
            rules="required"
            :name="$t('MSG_TXT_PBL_DT')"
            :min-date="minDate"
          /><!-- 발행일자 -->
        </kw-form-item>

        <kw-form-item
          v-show="sendInfo.sendType === '2'"
          :label="$t('MSG_TXT_DSPH_NO')"
        >
          <!-- 발신번호 -->
          <kw-input
            v-model="sendInfo.callingNumber"
            readonly
          />
        </kw-form-item>

        <kw-form-item
          v-show="sendInfo.sendType === '3'"
          :label="$t('MSG_TXT_DSPTR')"
        >
          <!-- 발신자 -->
          <kw-input
            v-model="sendInfo.caller"
            readonly
          />
        </kw-form-item>
      </kw-form-row>

      <kw-form-row v-if="sendInfo.sendType !== '1'">
        <kw-form-item
          v-if="sendInfo.sendType === '2'"
          :label="$t('MSG_TXT_RECP_NO')"
          required
          colspan="2"
        >
          <!-- 수신번호 -->
          <zwcm-telephone-number
            v-model:tel-no0="telNos.telNo0"
            v-model:tel-no1="telNos.telNo1"
            v-model:tel-no2="telNos.telNo2"
            v-model:tel-no3="telNos.telNo3"
            :tel-no0-clearable="true"
            :tel-no1-clearable="false"
            :name="$t('MSG_TXT_RECP_NO')"
            required
          /><!-- 수신번호 -->
        </kw-form-item>
        <kw-form-item
          v-else-if="sendInfo.sendType === '3'"
          :label="$t('MSG_TXT_RECP_USR')"
          required
          colspan="2"
        >
          <!-- 수신자 -->
          <zwcm-email-address
            v-model="sendInfo.receiver"
            :name="$t('MSG_TXT_RECP_USR')"
            required
          /><!-- 수신자 -->
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <div class="row justify-end mt20">
      <kw-btn
        v-if="sendInfo.sendType === '1'"
        class="px12"
        :label="$t('MSG_BTN_PRINT')"
        @click="onClickPrint"
      /><!-- 출력 -->
      <kw-btn
        v-else-if="sendInfo.sendType === '2'"
        class="px12"
        :label="$t('MSG_TXT_PSH_SEND')"
        @click="onClickSendKakao"
      /><!-- 발송 -->
      <kw-btn
        v-else-if="sendInfo.sendType === '3'"
        class="px12"
        :label="$t('MSG_TXT_PSH_SEND')"
        @click="onClickSendEmail"
      /><!-- 발송 -->
    </div>

    <kw-separator />

    <template v-if="sendInfo.sendType !== '1'">
      <h3>
        <!-- 발신 내역 -->
        {{ $t('MSG_TXT_DSPH_IZ') }}
        <ul
          v-show="sendInfo.sendType === '2'"
          class="kw-notification"
        >
          <li>
            <span class="kw-fc--primary">
              {{ $t('MSG_TXT_HINT_32') }}</span><!-- 카카오 알림톡은 30초 후에 새로고침 하시기 바랍니다. -->
          </li>
        </ul>
      </h3>

      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>

        <kw-btn
          dense
          primary
          :label="$t('MSG_TXT_REFRESH')"
          @click="onClickRefresh"
        /><!-- 새로고침 -->
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :visible-rows="pageInfo.pageSize"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { alert, codeUtil, gridUtil, useDataService, useMeta } from 'kw-lib';
import dayjs from 'dayjs';
import { openReportPopup } from '~common/utils/cmPopupUtil';
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';
import ZwcmEmailAddress from '~common/components/ZwcmEmailAddress.vue';
import { isEmpty } from 'lodash-es';

const dataService = useDataService();
const { getConfig } = useMeta();
const { t } = useI18n();
const now = dayjs();

const props = defineProps({
  cntrNo: { type: String, required: true },
  cntrSn: { type: [String, Number], required: true },
  prtnrKnm: { type: String, required: true },
  nm: { type: String, required: true },
  emadr: { type: String, default: '' },
  mpno1: { type: String, default: '' },
  mpno2: { type: String, default: '' },
  mpno3: { type: String, default: '' },
  cstSvAsnNo: { type: String, required: true },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const minDate = ref(now.format('YYYY-MM-DD'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const sendTypes = ref([
  { codeId: '1', codeName: '출력물 출력' }, // 출력물 출력
  { codeId: '2', codeName: '카카오 알림톡' }, // 카카오 알림톡
  { codeId: '3', codeName: '이메일' }, // 이메일
]);

const etcSelects = ref([
  { codeId: '1', codeName: '사번' }, // 사번
  { codeId: '2', codeName: '소속' }, // 소속
]);

const sendInfo = ref({
  sendType: '1',
  etcSelect: '1',
  publishDate: '',
  callingNumber: '1588-4113', // 고정
  receivingNumber: props.mpno,
  caller: 'wellsorder@kyowon.co.kr', // 고정
  receiver: props.emadr,
});

const telNos = ref({
  telNo0: '',
  telNo1: props.mpno1,
  telNo2: props.mpno2,
  telNo3: props.mpno3,
});

const frmMainRef = ref();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const grdMainRef = ref();

async function fetchDataKakao() {
  const { cntrNo, cntrSn, prtnrKnm, nm } = props;
  const { data: { list, pageInfo: pageInfoObj } } = await dataService.get('/sms/wells/service/wells-service-cfdc/kakao/paging', {
    params: { cntrNo, cntrSn, prtnrKnm, nm, ...pageInfo.value } });

  list.forEach((row) => {
    row.sendType = t('MSG_TXT_KAKAO_NOTAK'); // 카카오알림톡
    row.report = t('MSG_TXT_RPT_BRWS'); // 리포트 보기
  });

  pageInfo.value = pageInfoObj;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function fetchDataEmail() {
  const { cntrNo, cntrSn, prtnrKnm, nm } = props;
  const { data: { list, pageInfo: pageInfoObj } } = await dataService.get('/sms/wells/service/wells-service-cfdc/email/paging', {
    params: { cntrNo, cntrSn, prtnrKnm, nm, ...pageInfo.value } });

  list.forEach((row) => {
    row.sendType = t('MSG_TXT_EMAIL'); // 이메일
  });

  pageInfo.value = pageInfoObj;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function fetchData() {
  if (sendInfo.value.sendType === '2') {
    await fetchDataKakao();
  } else if (sendInfo.value.sendType === '3') {
    await fetchDataEmail();
  }
}

// async function fetchOzReport(params) {
//   return await dataService.get('/sms/wells/service/wells-service-cfdc/oz', params);
// }

async function openOzReport(cstSvAsnNo, printYn) {
  const args = {
    searchApiUrl: '/sms/wells/service/wells-service-cfdc/oz',
    cstSvAsnNo,
    rcgvpNm: printYn === 'Y' ? props.nm : '',
    prtnrNm: printYn === 'Y' ? props.prtnrKnm : '',
  };

  await openReportPopup(
    '/kyowon_as/wellsServConf.ozr',
    null,
    JSON.stringify(args),
    null,
  );
}

async function onClickRefresh() {
  pageInfo.value.pageIndex = 1;

  await fetchData();
}

async function onClickPrint() {
  if (!await frmMainRef.value.validate()) { return; }
  await openOzReport(props.cstSvAsnNo, 'Y');
}

async function onClickSendKakao() {
  if (!await frmMainRef.value.validate()) { return; }

  const { cntrNo, cntrSn, prtnrKnm, nm } = props;
  const { etcSelect, publishDate, callingNumber } = sendInfo.value;
  const { telNo1, telNo2, telNo3 } = telNos.value;
  const data = {
    cntrNo,
    cntrSn,
    prtnrKnm,
    nm,
    etcSelect,
    publishDatetime: dayjs(publishDate).isAfter(dayjs(), 'day') ? `${publishDate}000000` : dayjs().format('YYYYMMDDHHmmss'),
    callingNumber: callingNumber.replaceAll('-', ''),
    receivingNumber: telNo1 + telNo2 + telNo3,
    cstSvAsnNo: props.cstSvAsnNo,
  };

  await dataService.post('/sms/wells/service/wells-service-cfdc/kakao', data);
  await alert(t('MSG_ALT_BIZTALK_SEND_SUCCESS'));
  frmMainRef.value.init();
}

async function onClickSendEmail() {
  if (!await frmMainRef.value.validate()) { return; }

  const { cntrNo, cntrSn, prtnrKnm, nm } = props;
  const { etcSelect, publishDate, caller, receiver } = sendInfo.value;
  const data = {
    cntrNo,
    cntrSn,
    prtnrKnm,
    nm,
    etcSelect,
    publishDatetime: dayjs(publishDate).isAfter(dayjs(), 'day') ? `${publishDate}000000` : dayjs().format('YYYYMMDDHHmmss'),
    caller,
    receiver,
    cstSvAsnNo: props.cstSvAsnNo,
  };
  await dataService.post('/sms/wells/service/wells-service-cfdc/email', data);

  await alert(t('MSG_ALT_EML_FW_FSH'));
  await fetchData();
  frmMainRef.value.init();
}

watch(() => sendInfo.value.sendType, async (newVal, oldVal) => {
  if (oldVal === '2' && newVal === '3') await onClickRefresh();
  if (oldVal === '3' && newVal === '2') await onClickRefresh();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
async function initGrdMain(data, view) {
  const fields = [
    { fieldName: 'sendType' },
    { fieldName: 'receiver' },
    { fieldName: 'sendDatetime' },
    { fieldName: 'sender' },
    { fieldName: 'cstSvAsnNo' },
  ];

  const columns = [
    { fieldName: 'sendType', header: t('MSG_TXT_FW_TP'), width: '150', styleName: 'text-center' }, // 발송유형
    { fieldName: 'receiver', header: t('MSG_TXT_RECP'), width: '150', styleName: 'text-center' }, // 수신
    { fieldName: 'sendDatetime', header: t('MSG_TXT_FW_DT'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 발송일자
    { fieldName: 'sender', header: t('MSG_TXT_DSPTR'), width: '150', styleName: 'text-center' }, // 발신자
    {
      fieldName: 'cstSvAsnNo',
      header: t('MSG_TXT_RPT'),
      renderer: { type: 'button', hideWhenEmpty: true },
      width: '150',
      displayCallback: () => t('MSG_TXT_RPT_BRWS'),
    }, // 리포트
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    console.log(itemIndex);
    if (column === 'cstSvAsnNo') {
      const cstSvAsnNo = g.getValue(itemIndex, 'cstSvAsnNo');
      if (!isEmpty(cstSvAsnNo)) await openOzReport(cstSvAsnNo, 'N');
    }
  };

  await fetchData();
}

</script>
