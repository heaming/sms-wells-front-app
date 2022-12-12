<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SND
2. 프로그램 ID : WwsndWorkNoticeMgtP - 작업공지 관리
3. 작성자 : KJ
4. 작성일 : 2022.12.
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 작업공지 관리 화면 - 등록/수정/상세 팝업
****************************************************************************************************
--->
<template>
  <kw-popup class="kw-popup--xl">
    <kw-form
      ref="workNoticeFormRef"
      :cols="2"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('게시기간')"
          :colspan="2"
          required
        >
          <!--          <kw-date-picker-->
          <!--            v-model="workNotice.vlStrtDate"-->
          <!--            rules="required"-->
          <!--          />-->
          <!--          <kw-time-picker-->
          <!--            v-model="workNotice.vlStrtTime"-->
          <!--            rules="required"-->
          <!--          />-->
          <!--          <span>~</span>-->
          <!--          <kw-date-picker-->
          <!--            v-model="workNotice.vlEndDate"-->
          <!--            rules="required"-->
          <!--          />-->
          <!--          <kw-time-picker-->
          <!--            v-model="workNotice.vlEndTime"-->
          <!--            rules="required"-->
          <!--          />-->
          <kw-date-range-picker
            v-model:from="workNotice.vlStrtdt"
            v-model:to="workNotice.vlEnddt"
            :name="$t('등록기간')"
            rules="date_range_required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('상품그룹')"
          required
        >
          <kw-field-wrap>
            <kw-select
              v-model="workNotice.pdGrpCd"
              :name="$t('상품그룹')"
              :options="codes.PD_GRP_CD"
              rules="required"
            />
            <kw-select
              v-model="workNotice.pdCd"
              :options="customCodes.pdCd"
              option-value="pdCd"
              option-label="pdNm"
              first-option="select"
              first-option-label="선택안함"
            />
          </kw-field-wrap>
        </kw-form-item>
        <kw-form-item
          :label="$t('작업유형')"
        >
          <kw-field>
            <kw-checkbox
              v-model="workNotice.istWkYn"
              :label="$t('설치')"
              true-value="1"
              false-value="0"
            />
            <kw-checkbox
              v-model="workNotice.asWkYn"
              :label="$t('A/S')"
              true-value="1"
              false-value="0"
            />
            <kw-checkbox
              v-model="workNotice.bfsvcWkYn"
              :label="$t('B/S')"
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
          :label="$t('제목')"
          :colspan="2"
          required
        >
          <kw-input
            v-model="workNotice.ntccnTitNm"
            :name="$t('제목')"
            :placeholder="$t('제목 입력')"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('관리구분')"
          :colspan="2"
          required
        >
          <kw-select
            v-model="workNotice.mngrDvCd"
            :name="$t('관리구분')"
            :options="codes.MNGR_DV_CD"
            :disable="!isEmpty(deptMngrDvCd)"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('비고사항')"
          :colspan="2"
        >
          <kw-input
            v-model="workNotice.ntccnCn"
            type="textarea"
            :maxlength="1000"
            rules="max:1000"
            :rows="3"
            :placeholder="$t('비고사항 입력')"
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
        @click="onClickSave()"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, useModal, useGlobal } from 'kw-lib';
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

const customCodes = ref({
  pdCd: [],
});

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
  return await dataService.get('/sms/wells/service/work-notices/detail?', params);
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
  return await dataService.get(`/sms/wells/service/work-notices/products/${pdGrpCd}`);
}

async function getProductsByProductGroup(pdGrpCd) {
  const res = await fetchProductsByProductGroup(pdGrpCd);
  customCodes.value.pdCd = res.data;
}

if (isModify.value) {
  await getWorkNoticeDetail();
  await getProductsByProductGroup(workNotice.value.pdGrpCd);
} else {
  workNotice.value.mngrDvCd = deptMngrDvCd.value;
  workNotice.value.vlStrtdt = dayjs().format('YYYYMMDD');
  workNotice.value.vlEnddt = dayjs().format('YYYYMMDD');
}

watch(() => workNotice.value.pdGrpCd, async (newVal) => {
  if (isEmpty(newVal)) {
    customCodes.value.pdCd = [];
  } else {
    await getProductsByProductGroup(workNotice.value.pdGrpCd);
  }
  workNotice.value.pdCd = '';
});

async function onClickSave() {
  if (await workNoticeFormRef.value.alertIfIsNotModified()) { return; }
  if (!await workNoticeFormRef.value.validate()) { return; }
  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }

  if (isModify.value) {
    await dataService.put('/sms/wells/service/work-notices', workNotice.value);
  } else {
    await dataService.post('/sms/wells/service/work-notices', workNotice.value);
  }
  await notify(t('MSG_ALT_SAVE_DATA'));
  ok();
}

onMounted(async () => {
  await workNoticeFormRef.value.init();
});
</script>
