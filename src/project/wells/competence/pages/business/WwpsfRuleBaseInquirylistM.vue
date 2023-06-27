<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfRuleBaseInquirylistM - 규정 및 기준조회
3. 작성자 : gs.piit225
4. 작성일 : 2023.06.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 규정 및 기준조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="2"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('TXT_MSG_PD_HCLSF_ID')"
          required
        >
          <kw-select
            v-model="searchParams.oneDepth"
            :options="oneDepth"
            :label="$t('MSG_TXT_INQR_DV')"
            first-option="select"
            rules="required"
            @change="twoDepthChange"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PD_MCLSF_ID')"
          required
        >
          <kw-select
            v-model="searchParams.twoDepth"
            :label="$t('MSG_TXT_PD_MCLSF_ID')"
            :options="twoDepth"
            first-option="select"
            rules="required"
            :disable="isTwoDepth"
            @change="threeDepthChange"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('TXT_MSG_PD_LCLSF_ID')"
          required
        >
          <kw-select
            v-model="searchParams.threeDepth"
            :options="threeDepth"
            first-option="select"
            rules="required"
            :disable="isThreeDepth"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_FST_RGST_DT')"
          required
        >
          <kw-select
            v-model="searchParams.fnlMdfcDt"
            first-option="select"
            rules="required"
            :label="$t('MSG_TXT_FST_RGST_DT')"
            :options="fnlMdfcDts"
          />
        </kw-search-item>
      </kw-search-row>
      <div class="row justify-end items-center pt20">
        <kw-btn
          :label="$t('MSG_BTN_SMAP')"
          default
          @click="onClickDetail"
        />
      </div>
    </kw-search>
    <div class="result-area">
      <ul class="kw-notification">
        <li>
          미리보기 화면에 표시가 되지 않는경우는 PDF다운로드를 실행 하세요.
        </li>
      </ul>
      <h3 class="inline-block">
        개정(변경)내용
      </h3>
      <p class="inline-block kw-font-pt14 pl50">
        22년 10월 신규등록 (상품기획팀)
      </p>
      <h3>옵션영역</h3>
      <div class="grid-blank" />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal } from 'kw-lib';

const { modal } = useGlobal();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const searchParams = ref({
  oneDepth: '',
  twoDepth: '',
  threeDepth: '',
  fnlMdfcDt: '',
});

const oneDepth = ref([]);
const twoDepth = ref([]);
const threeDepth = ref([]);
const fnlMdfcDts = ref([]);

const isTwoDepth = ref(true);
const isThreeDepth = ref(true);

let treeDatas = [];
async function fetchData() {
  const cachedParams = { ...searchParams.value };
  return await dataService.get('/sms/wells/competence/business/rulebase', { params: cachedParams });
}

async function init() {
  const res = await fetchData();
  treeDatas = res.data;
  console.log(treeDatas);
  isTwoDepth.value = true;
  isThreeDepth.value = true;
  twoDepth.value = [];
  threeDepth.value = [];
  searchParams.value.oneDepth = '';
  searchParams.value.twoDepth = '';
  searchParams.value.threeDepth = '';

  treeDatas.forEach((obj) => {
    if (obj.inqrLvTcnt === 1) {
      const addData = { codeId: '', codeName: '', prtsCodeId: '' };
      addData.codeId = obj.bznsSpptMnalId;
      addData.codeName = obj.bznsSpptMnalNm;
      oneDepth.value.push(addData);
    }
  });
}

function twoDepthChange() {
  console.log('twoDepthChange', searchParams.value.oneDepth);
  isTwoDepth.value = false;
  const depthData = [];
  if (searchParams.value.oneDepth === '') {
    searchParams.value.twoDepth = '';
    searchParams.value.threeDepth = '';
    isTwoDepth.value = true;
    isThreeDepth.value = true;
    twoDepth.value = [];
    threeDepth.value = [];
  }
  treeDatas.forEach((obj) => {
    if (obj.inqrLvTcnt === 2 && obj.hgrBznsSpptMnalId === searchParams.value.oneDepth) {
      const addData = { codeId: '', codeName: '', prtsCodeId: '' };
      addData.codeId = obj.bznsSpptMnalId;
      addData.codeName = obj.bznsSpptMnalNm;
      depthData.push(addData);
    }
  });
  twoDepth.value = depthData;
}

function threeDepthChange() {
  console.log('threeDepthChange', searchParams.value.twoDepth);
  isThreeDepth.value = false;
  const depthData = [];
  if (searchParams.value.twoDepth === '') {
    searchParams.value.threeDepth = '';
    isThreeDepth.value = true;
    threeDepth.value = [];
  }
  treeDatas.forEach((obj) => {
    if (obj.inqrLvTcnt === 3 && obj.hgrBznsSpptMnalId === searchParams.value.twoDepth) {
      const addData = { codeId: '', codeName: '', prtsCodeId: '' };
      addData.codeId = obj.bznsSpptMnalId;
      addData.codeName = obj.bznsSpptMnalNm;
      depthData.push(addData);
    }
  });
  threeDepth.value = depthData;
}

async function onClickDetail() {
  const { result, payload } = await modal({
    component: 'WwpsfRuleBaseInquirylistP',
    componentProps: {

    },
  });

  if (result) {
    const { orgPath } = payload;
    const orgPaths = orgPath.split('.');

    searchParams.value.oneDepth = '';
    searchParams.value.twoDepth = '';
    searchParams.value.threeDepth = '';
    const depthData = [];

    treeDatas.forEach((obj) => {
      if (obj.inqrLvTcnt === 1 && orgPaths[2].includes(obj.bznsSpptMnalId)) {
        searchParams.value.oneDepth = obj.bznsSpptMnalId;
      }
      if (obj.inqrLvTcnt === 2 && orgPaths[3].includes(obj.bznsSpptMnalId)) {
        searchParams.value.twoDepth = obj.bznsSpptMnalId;
      }
      if (obj.inqrLvTcnt === 3 && orgPaths[4].includes(obj.bznsSpptMnalId)) {
        searchParams.value.threeDepth = obj.bznsSpptMnalId;
      }
    });

    const addData = { codeId: '', codeName: '', prtsCodeId: '' };
    addData.codeId = payload.bznsSpptMnalId;
    addData.codeName = `${payload.fnlMdfcUsrNm} ${payload.fnlMdfcDt}`;
    depthData.push(addData);

    searchParams.value.fnlMdfcDt = payload.bznsSpptMnalId;
    fnlMdfcDts.value = depthData;
  }
}

onMounted(() => {
  init();
});

</script>
