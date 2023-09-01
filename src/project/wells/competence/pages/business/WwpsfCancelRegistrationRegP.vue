<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfCancelRegistrationRegP - 활동물품관리-취소등록
3. 작성자 : jisung you
4. 작성일 : 2023.07.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-활동물품관리-취소등록
****************************************************************************************************
--->
<template>
  <kw-popup
    size="sm"
  >
    <kw-form
      ref="frmMainRef"
      :cols="1"
    >
      <kw-form-row>
        <kw-form-item
          :label="t('MSG_TXT_CANC_DT')"
        >
          <kw-input
            v-model="saveParams.aplcDtNm"
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="t('MSG_TXT_CAN_RSON')"
        >
          <kw-input
            v-model="saveParams.aplcRsonCn"
            type="textarea"
            :rows="5"
            placeholder="취소 사유를 입력하세요."
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <template
      #action
    >
      <kw-btn
        v-if="!readonly"
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
import { useModal, getComponentType, useDataService, useGlobal, stringUtil,
} from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { ok } = useModal();
const dataService = useDataService();
const { notify, alert } = useGlobal();

const { t } = useI18n();
const now = dayjs();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const frmMainRef = ref(getComponentType('KwForm'));
const nowDay = dayjs().format('DD');
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
const saveParams = ref({
  aplcDtNm: now.format('YYYY-MM-DD'),
  aplcDt: now.format('YYYYMMDD'),
  aplcRsonCn: '',
  actiGdsAplcStatCd: '02',
});

if (props.checkedRows.length === 1) {
  ogTpCd.value = String(props.checkedRows[0].ogTpCd);
}

if (props.checkedRows.length === 1 && props.checkedRows[0].actiGdsAplcStatCd === '02') {
  const aplcDt = ref(props.checkedRows[0].aplcDt);
  const aplcRsonCn = ref(props.checkedRows[0].aplcRsonCn);
  saveParams.value.aplcDtNm = stringUtil.getDateFormat(aplcDt.value);
  saveParams.value.aplcDt = aplcDt.value;
  saveParams.value.aplcRsonCn = aplcRsonCn.value;
}

props.checkedRows.some((item) => ({
  ...item,
  aplcDt: saveParams.value.aplcDt,
  aplcRsonCn: saveParams.value.aplcRsonCn,
  oldActiGdsAplcStatCd: item.actiGdsAplcStatCd,
  actiGdsAplcStatCd: saveParams.value.actiGdsAplcStatCd,
}));

let cachedParams;

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

function isExistData(rowData) {
  return rowData.some((v) => {
    const { countMcn } = v;
    if (Number(countMcn) > 0) {
      alert(t('공제신청 정보가 있습니다. 공제취소후 신청취소를 진행하여 주십시요.'));
      return false;
    }
    return true;
  });
}

function initialize(rowData) {
  return rowData.map((item) => ({
    ...item,
    aplcDt: saveParams.value.aplcDt,
    aplcRsonCn: saveParams.value.aplcRsonCn,
    oldActiGdsAplcStatCd: item.actiGdsAplcStatCd,
    actiGdsAplcStatCd: saveParams.value.actiGdsAplcStatCd,
  }));
}

async function onClickSave() {
  // 코드 : ACTI_GDS_APLC_STAT_CD->01:신청, 02:취소, 03:반품
  const startDay = Number(baseData.value.aplcPsbStrtD);
  const endDay = Number(baseData.value.aplcPsbEndD);
  if (Number(nowDay) >= startDay && Number(nowDay) <= endDay) {
    if (isExistData(props.checkedRows)) {
      const data = ref(initialize(props.checkedRows));
      cachedParams = cloneDeep(data.value);
      await dataService.delete('/sms/wells/competence/business/activity/application', { data: [...cachedParams] });
      notify(t('MSG_ALT_SAVE_DATA'));
      ok();
    }
  } else {
    notify(t(`신청기간 중에만 취소가 가능합니다(신청기간:${startDay}일 ~ ${endDay}일)`));
  }
}
onMounted(async () => {
  await init();
});

</script>
