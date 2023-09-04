<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfReturningRegistrationRegP - 활동물품관리-반품등록
3. 작성자 : jisung you
4. 작성일 : 2023.07.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-활동물품관리-반품등록
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
  >
    <kw-form
      ref="frmMainRef"
      :cols="2"
    >
      <kw-form-row>
        <kw-form-item
          :label="t('MSG_TXT_RTNGD_DT')"
        >
          <kw-input
            v-model="saveParams.aplcDtNm"
            readonly
          />
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_PCSV_FW_DT')"
        >
          <kw-date-picker v-model="saveParams.sppDt" />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="t('MSG_TXT_PCSV_CO')"
        >
          <kw-select
            v-model="saveParams.sppBzsCd"
            :options="codes.SPP_BZS_CD"
          />
        </kw-form-item>
        <kw-form-item
          :label="t('MSG_TXT_IVC_NO')"
        >
          <kw-input v-model="saveParams.sppIvcNo" />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="t('MSG_TXT_RTRN_RSN')"
          colspan="2"
        >
          <kw-input
            v-model="saveParams.aplcRsonCn"
            type="textarea"
            :rows="5"
            :placeholder="$t('반품사유를 입력하세요.') "
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <ul class="kw-notification pt20">
      <li>
        {{ $t('반품 택배비용 선불처리 바랍니다.') }}
      </li>
    </ul>
    <template
      #action
    >
      <kw-btn
        v-if="!readonly"
        primary
        :label="t('MSG_BTN_RGST')"
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useModal, getComponentType, useDataService, useGlobal, codeUtil, stringUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { ok } = useModal();
const dataService = useDataService();
const { notify } = useGlobal();

const { t } = useI18n();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'SPP_BZS_CD',
);

const nowDay = dayjs().format('DD');

const frmMainRef = ref(getComponentType('KwForm'));
const baseData = ref({
  ogTpCd: '', /* 조직유형코드 */
  aplcPsbStrtD: '', /* 신청가능시작일 */
  aplcPsbEndD: '', /* 신청가능종료일 */
  rtngdPsbStrtD: '', /* 반품가능시작일 */
  rtngdPsbEndD: '', /* 반품가능종료일 */
  rtngdShrnEmadr: '', /* 반품공유이메일주소 */
  confArtcCn: '', /* 확인사항내용 */
});

const props = defineProps({
  ogTpCd: { type: String, default: '' },
  checkedRows: { type: Array, default: () => [] },
  readonly: { type: Boolean, default: false },
});
const ogTpCd = ref(props.ogTpCd);
let cachedParams;
const saveParams = ref({
  aplcDtNm: now.format('YYYY-MM-DD'),
  aplcDt: now.format('YYYYMMDD'),
  sppDt: now.format('YYYYMMDD'),
  sppBzsCd: '',
  sppIvcNo: '',
  aplcRsonCn: '',
  actiGdsAplcStatCd: '03',
});
if (props.checkedRows.length === 1) {
  ogTpCd.value = String(props.checkedRows[0].ogTpCd);
}

if (props.checkedRows.length === 1 && props.checkedRows[0].actiGdsAplcStatCd === '03') {
  const aplcDt = ref(props.checkedRows[0].aplcDt);
  const sppDt = ref(props.checkedRows[0].sppDt);
  const sppBzsCd = ref(props.checkedRows[0].sppBzsCd);
  const sppIvcNo = ref(props.checkedRows[0].sppIvcNo);
  const aplcRsonCn = ref(props.checkedRows[0].aplcRsonCn);

  saveParams.value.aplcDtNm = stringUtil.getDateFormat(aplcDt.value);
  saveParams.value.aplcDt = aplcDt.value;
  saveParams.value.sppDt = sppDt.value;
  saveParams.value.sppBzsCd = sppBzsCd.value;
  saveParams.value.sppIvcNo = sppIvcNo.value;
  saveParams.value.aplcRsonCn = aplcRsonCn.value;
}

async function fetchData() {
  cachedParams = {
    ogTpCd: ogTpCd.value,
  };

  return await dataService.get('/sms/wells/competence/business/activity/base', { params: cachedParams });
}

async function init() {
  const res = await fetchData();
  Object.assign(baseData.value, res.data);
}

function initialize(rowData) {
  return rowData.map((item) => ({
    ...item,
    aplcDt: saveParams.value.aplcDt,
    sppDt: saveParams.value.sppDt,
    sppBzsCd: saveParams.value.sppBzsCd,
    sppIvcNo: saveParams.value.sppIvcNo,
    aplcRsonCn: saveParams.value.aplcRsonCn,
    oldActiGdsAplcStatCd: item.actiGdsAplcStatCd,
    actiGdsAplcStatCd: saveParams.value.actiGdsAplcStatCd,
  }));
}

async function onClickSave() {
  // 코드 : ACTI_GDS_APLC_STAT_CD->01:신청, 02:취소, 03:반품
  const startDay = Number(baseData.value.rtngdPsbStrtD);
  const endDay = Number(baseData.value.rtngdPsbEndD);

  if (Number(nowDay) >= startDay && Number(nowDay) <= endDay) {
    const data = ref(initialize(props.checkedRows));
    cachedParams = cloneDeep(data.value);

    await dataService.delete('/sms/wells/competence/business/activity/application', { data: [...cachedParams] });
    notify(t('MSG_ALT_SAVE_DATA'));
    ok();
  } else {
    notify(t(`반품기간이 아닙니다.(반품기간:${startDay}일 ~ ${endDay}일)`));
  }
}

onMounted(async () => {
  await init();
});

</script>
