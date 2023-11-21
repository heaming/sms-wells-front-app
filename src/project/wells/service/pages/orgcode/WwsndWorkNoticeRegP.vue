<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SND
2. 프로그램 ID : [W-SV-U-0206P01] WwsndWorkNoticeRegP - 작업 공지사항 등록
3. 작성자 : KJ
4. 작성일 : 2022.12.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 작업공지 관리 화면 - 등록/수정/상세 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--xl"
    :title="isEmpty(props.ntcId) ? undefined : $t('MSG_TIT_WORK_NOTICE_MOD')"
  >
    <kw-form
      ref="workNoticeFormRef"
      :cols="2"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_NOTICE_PERIOD')"
          :colspan="2"
          required
        >
          <kw-date-range-picker
            v-model:from="workNotice.vlStrtdt"
            v-model:to="workNotice.vlEnddt"
            :name="$t('MSG_TXT_NOTICE_PERIOD')"
            rules="date_range_required"
            :min-date="dayjs().format('YYYY-MM-DD')"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_PD_GRP')"
          required
        >
          <kw-select
            v-model="workNotice.pdGrpCd"
            :name="$t('MSG_TXT_PD_GRP')"
            :options="codes.PD_GRP_CD"
            first-option="all"
            @update:model-value="workNotice.pdCd = ''"
          />
          <kw-select
            v-model="workNotice.pdCd"
            :options="filteredPdCds"
            option-value="pdCd"
            option-label="pdAbbrNm"
            first-option="all"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_WORK_TYPE')"
        >
          <kw-field>
            <kw-checkbox
              v-model="workNotice.istWkYn"
              :label="$t('MSG_TXT_INSTALLATION')"
              true-value="1"
              false-value="0"
            />
            <kw-checkbox
              v-model="workNotice.asWkYn"
              :label="$t('MSG_TXT_AFTER_SERVICE')"
              true-value="1"
              false-value="0"
            />
            <kw-checkbox
              v-model="workNotice.bfsvcWkYn"
              :label="$t('MSG_TXT_BEFORE_SERVICE')"
              true-value="1"
              false-value="0"
            />
            <kw-input
              v-show="false"
              v-model="workNotice.istWkYn"
            />
            <kw-input
              v-show="false"
              v-model="workNotice.asWkYn"
            />
            <kw-input
              v-show="false"
              v-model="workNotice.bfsvcWkYn"
            />
          </kw-field>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_MNGT_DV')"
          :colspan="2"
          required
        >
          <kw-select
            v-model="workNotice.mngrDvCd"
            :name="$t('MSG_TXT_MNGT_DV')"
            :options="codes.MNGR_DV_CD"
            :readonly="!isEmpty(deptMngrDvCd)"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_TTL')"
          :colspan="2"
          required
        >
          <kw-input
            v-model="workNotice.ntccnTitNm"
            :name="$t('MSG_TXT_TTL')"
            :placeholder="$t('MSG_TXT_ENTER_SOMETHING', [$t('MSG_TXT_TTL')])"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CNTN')"
          :colspan="2"
        >
          <kw-input
            v-model="workNotice.ntccnCn"
            type="textarea"
            :maxlength="1000"
            rules="max:1000"
            :rows="3"
            :placeholder="$t('MSG_TXT_ENTER_SOMETHING', [$t('MSG_TXT_CNTN')])"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <kw-btn
        :label="$t('MSG_BTN_CANCEL')"
        negative
        @click="cancel()"
      />
      <kw-btn
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
import { codeUtil, useDataService, useGlobal, useModal } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { cancel, ok } = useModal();
const { confirm, notify } = useGlobal();
const dataService = useDataService();
const userInfo = useStore().getters['meta/getUserInfo'];

const props = defineProps({
  mngtYm: {
    type: String,
  },
  ntcId: {
    type: String,
  },
  ntcSn: {
    type: String,
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'MNGR_DV_CD',
  'PD_GRP_CD',
);

const pdCds = ref([]);

const workNoticeFormRef = ref();

const workNotice = ref({
  mngtYm: '',
  ntcId: '',
  ntcSn: '',
  pdGrpCd: '',
  pdCd: '',
  istWkYn: '0',
  asWkYn: '0',
  bfsvcWkYn: '0',
  mngrDvCd: '',
  ntccnTitNm: '',
  ntccnCn: '',
  vlStrtdt: '',
  vlEnddt: '',
});

const filteredPdCds = computed(() => {
  if (isEmpty(workNotice.value.pdGrpCd)) return pdCds.value;
  return pdCds.value.filter((obj) => obj.pdGrpCd === workNotice.value.pdGrpCd);
});

const isModify = computed(() => !(isEmpty(props.mngtYm) || isEmpty(props.ntcId) || isEmpty(props.ntcSn)));
// TODO: 부서 코드 정해지면 수정 필요
const deptMngrDvCd = computed(() => {
  if (userInfo.departmentId === '영업지원팀') {
    return '1';
  }
  if (userInfo.departmentId === '서비스운영팀') {
    return '2';
  }
  return '';
});

async function fetchWorkNoticeDetail(params) {
  return await dataService.get('/sms/wells/service/work-notices/detail', params);
}

async function getWorkNoticeDetail() {
  const res = await fetchWorkNoticeDetail({
    params: {
      mngtYm: props.mngtYm, ntcId: props.ntcId, ntcSn: props.ntcSn,
    },
  });
  workNotice.value = res.data;
}

async function fetchProductsByProductGroup(pdGrpCd) {
  return await dataService.get('/sms/wells/service/work-notices/products', { params: { pdGrpCd } });
}

async function getProductsByProductGroup(pdGrpCd) {
  const res = await fetchProductsByProductGroup(pdGrpCd);
  pdCds.value = res.data;
}

await getProductsByProductGroup('');

if (isModify.value) {
  await getWorkNoticeDetail();
} else {
  workNotice.value.mngrDvCd = deptMngrDvCd.value;
  workNotice.value.vlStrtdt = dayjs().format('YYYYMMDD');
  workNotice.value.vlEnddt = dayjs().format('YYYYMMDD');
}

async function onClickSave() {
  if (await workNoticeFormRef.value.alertIfIsNotModified()) { return; }
  if (!await workNoticeFormRef.value.validate()) { return; }
  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }

  if (isModify.value) {
    await dataService.put('/sms/wells/service/work-notices', workNotice.value);
  } else {
    await dataService.post('/sms/wells/service/work-notices', workNotice.value);
  }
  ok();
  await notify(t('MSG_ALT_SAVE_DATA'));
}

onMounted(async () => {
  await workNoticeFormRef.value.init();
});
</script>
