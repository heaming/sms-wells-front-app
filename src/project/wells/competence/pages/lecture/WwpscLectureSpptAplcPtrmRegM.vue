<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSC
2. 프로그램 ID : WwpscLectureSpptAplcPtrmRegM
3. 작성자 : Park Yesol
4. 작성일 : 2023.08.03
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 강의지원 신청기간등록
****************************************************************************************************
-->

<template>
  <kw-page>
    <kw-search
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 조직유형 -->
        <kw-search-item
          :label="t('MSG_TXT_OG_TP')"
          required
        >
          <kw-select
            v-model="searchParams.lectrSpptOgTpCd"
            :label="t('MSG_TXT_OG_TP')"
            :options="ogTpCd"
            rules="required"
            first-option="select"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_EDUC_YM')"
        >
          <kw-date-picker
            v-model="searchParams.lectrYm"
            :label="t('MSG_TXT_EDUC_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <h3>WELLS 강의지원 신청기간 설정</h3>
        </template>
        <kw-btn
          :label="$t('MSG_BTN_CANCEL')"
          dense
          grid-action
          @click="onClickRemove"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:update
          :label="$t('MSG_BTN_SAVE')"
          grid-action
          dense
          @click="onClickSave"
        />
      </kw-action-top>
      <kw-form
        ref="frmMainRef"
        :cols="1"
      >
        <ul class="filter-box">
          <li class="filter-box__item">
            <p class="filter-box__item-label">
              {{ $t('MSG_TXT_PRD') }}{{ $t('MSG_TXT_RGS') }}
            </p>
            <kw-field-wrap>
              <kw-date-picker
                v-model="saveData.aplcStrtdt"
                class="w250 mr8"
                :placeholder="t('MSG_TXT_SELT')"
                :label="t('MSG_TXT__DT')"
                :rules="validateFn"
              />
              <kw-time-picker
                v-model="saveData.aplcStrtHm"
                class="w180"
                :placeholder="t('MSG_TXT_SELT')"
                :label="t('MSG_TXT_TIME')"
                :rules="validateFn"
              />
            </kw-field-wrap>
            <span class="mr8 ml8">~</span>
            <kw-field-wrap>
              <kw-date-picker
                v-model="saveData.aplcEnddt"
                class="w250 mr8"
                :label="t('MSG_TXT__DT')"
                :rules="validateFn"
              />
              <kw-time-picker
                v-model="saveData.aplcEndHm"
                class="w180"
                :placeholder="t('MSG_TXT_SELT')"
                :label="t('MSG_TXT_TIME')"
                :rules="validateFn"
              />
            </kw-field-wrap>
          </li>
        </ul>
      </kw-form>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { useDataService, codeUtil, useMeta, useGlobal, validate } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { getUserInfo } = useMeta();
const { confirm, notify } = useGlobal();
const dataService = useDataService();
const userInfo = getUserInfo();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const frmMainRef = ref();
const now = dayjs();
const ogTpCd = ref();

// 공통코드로딩
const codes = await codeUtil.getMultiCodes(
  'OG_TP_CD',
);
ogTpCd.value = codes.OG_TP_CD.filter((v) => ['W01', 'W02'].includes(v.codeId));

let cachedParams;
// 검색조건 Parameter
const searchParams = ref({
  lectrSpptOgTpCd: userInfo.ogTpCd, // 조직유형
  lectrYm: dayjs(now).add(1, 'month').format('YYYYMM'),
});

const saveData = ref({
  aplcStrtdt: '',
  aplcStrtHm: '',
  aplcEnddt: '',
  aplcEndHm: '',
  dtaDlYn: '',
});

const fetchData = async () => {
  const res = await dataService.get('/sms/wells/competence/lecture-sppt-aplc-ptrm', { params: { ...cachedParams } });
  if (!isEmpty(res.data)) {
    saveData.value = res.data;
  } else {
    frmMainRef.value.reset();
  }
};

const onClickSearch = async () => {
  // 자동완성 검색조건 설정
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
};

async function onClickRemove() {
  if (!await confirm(t('MSG_ALT_WANT_DEL'))) { return; }
  await dataService.put('/sms/wells/competence/lecture-sppt-aplc-ptrm', searchParams.value);
  await fetchData();
}

async function onClickSave() {
  if (await frmMainRef.value.alertIfIsNotModified()) { return; }
  if (!await frmMainRef.value.validate()) { return; }
  saveData.value.lectrSpptOgTpCd = searchParams.value.lectrSpptOgTpCd;
  saveData.value.lectrYm = searchParams.value.lectrYm;
  saveData.value.dtaDlYn = 'N';
  await dataService.post('/sms/wells/competence/lecture-sppt-aplc-ptrm', saveData.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

const validateFn = async (val, options) => {
  const errors = [];
  errors.push(
    ...(await validate(val, 'required', options)).errors,
  );

  const fromDate = saveData.value.aplcStrtdt.concat(saveData.value.aplcStrtHm);
  const toDate = saveData.value.aplcEnddt.concat(saveData.value.aplcEndHm);
  if (!isEmpty(fromDate) && !isEmpty(toDate)) {
    if (toDate < fromDate) {
      errors.push(t('MSG_ALT_ABLE_START_DT_PREC_FINS_DT'));
    }
  }
  return errors[0] || true;
};

</script>
