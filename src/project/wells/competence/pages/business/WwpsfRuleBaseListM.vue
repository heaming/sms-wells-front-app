<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSF
2. 프로그램 ID : WwpsfRuleBaseInquirylistM - 규정 및 기준조회
3. 작성자 : jisung you -> park yesol
4. 작성일 : 2023.06.22 -> 2023.12.06
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
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('TXT_MSG_PD_HCLSF_ID')"
          required
        >
          <kw-select
            v-model="searchParams.lvl1Depth"
            :options="lvl1Depth"
            :label="$t('MSG_TXT_INQR_DV')"
            first-option="select"
            option-label="bznsSpptMnalNm"
            option-value="bznsSpptMnalId"
            rules="required"
            @change="lvl2DepthChange"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PD_MCLSF_ID')"
          required
        >
          <kw-select
            v-model="searchParams.lvl2Depth"
            :label="$t('MSG_TXT_PD_MCLSF_ID')"
            :options="lvl2Depth"
            first-option="select"
            option-label="bznsSpptMnalNm"
            option-value="bznsSpptMnalId"
            rules="required"
            @change="lvl3DepthChange"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('TXT_MSG_PD_LCLSF_ID')"
          required
        >
          <kw-select
            v-model="searchParams.lvl3Depth"
            :options="lvl3Depth"
            first-option="select"
            option-label="bznsSpptMnalNm"
            option-value="bznsSpptMnalId"
            rules="required"
            @change="onChangeRegDate"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_FST_RGST_DT')"
          required
        >
          <kw-select
            v-model="searchParams.vlStrtDtm"
            first-option="select"
            :label="$t('MSG_TXT_FST_RGST_DT')"
            option-label="fnlMdfcUsrNm"
            option-value="vlStrtDtm"
            :options="vlStrtDtms"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <div class="row justify-end items-center pt20">
        <kw-btn
          :label="$t('MSG_BTN_SMAP')"
          default
          @click="onClickSiteMap"
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
        {{ content }}
      </p>
      <h3>옵션영역</h3>
      <kw-pdf-preview
        :pdf="pdf"
        :page-scale="100"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal, alert } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { modal } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const searchParams = ref({
  lvl1Depth: '',
  lvl2Depth: '',
  lvl3Depth: '',
  vlStrtDtm: '',
});

let cachedParams;

const pdf = ref();
const totList = ref([]);
const lvl1Depth = ref([]);
const lvl2Depth = ref([]);
const lvl3Depth = ref([]);
const vlStrtDtms = ref([]);
const content = ref('');

const init = async () => {
  const res = await dataService.get('/sms/wells/competence/rulebase/user', { params: cachedParams });
  lvl1Depth.value = res.data.filter((obj) => obj.inqrLvTcnt === 1);
  res.data.forEach((obj) => {
    const day = dayjs(obj.vlStrtDtm).format('YYYY-MM-DD HH:mm:ss');
    obj.fnlMdfcUsrNm = `${obj.fnlMdfcUsrNm} ${day}`;
  });
  totList.value = res.data;
};

const lvl2DepthChange = async (val) => {
  searchParams.value.lvl2Depth = '';
  const row = totList.value.filter((obj) => val === obj.bznsSpptMnalId)[0];
  if (!isEmpty(val)) {
    // eslint-disable-next-line max-len
    lvl2Depth.value = totList.value.filter((obj) => row.bznsSpptMnalId === obj.hgrBznsSpptMnalId && obj.inqrLvTcnt === 2);
  } else {
    lvl2Depth.value = [];
  }
};

const lvl3DepthChange = async (val) => {
  searchParams.value.lvl3Depth = '';
  const row = totList.value.filter((obj) => val === obj.bznsSpptMnalId)[0];
  if (!isEmpty(val)) {
    // eslint-disable-next-line max-len
    lvl3Depth.value = totList.value.filter((obj) => row.bznsSpptMnalId === obj.hgrBznsSpptMnalId && obj.inqrLvTcnt === 3);
  } else {
    lvl3Depth.value = [];
  }
};

const onChangeRegDate = async (val) => {
  const row = totList.value.filter((obj) => val === obj.bznsSpptMnalId);
  vlStrtDtms.value = row;
};

const onClickSiteMap = async () => {
  const { result, payload } = await modal({
    component: 'WwpsfRuleBaseListP',
    componentProps: {

    },
  });

  if (result) {
    await lvl1Depth.value.forEach((obj) => {
      if (payload.orgPath.indexOf(obj.bznsSpptMnalId) > -1) {
        searchParams.value.lvl1Depth = obj.bznsSpptMnalId;
      }
    });
    await lvl2Depth.value.forEach((obj) => {
      if (payload.orgPath.indexOf(obj.bznsSpptMnalId) > -1) {
        searchParams.value.lvl2Depth = obj.bznsSpptMnalId;
      }
    });
    await lvl3Depth.value.forEach((obj) => {
      if (payload.orgPath.indexOf(obj.bznsSpptMnalId) > -1) {
        searchParams.value.lvl3Depth = obj.bznsSpptMnalId;
      }
    });
  }
};

const fetchData = async () => {
  const row = totList.value.filter((obj) => obj.bznsSpptMnalId === searchParams.value.lvl3Depth
  && obj.inqrLvTcnt === 3
  && searchParams.value.vlStrtDtm === obj.vlStrtDtm)[0];
  if (!isEmpty(row.fileUid)) {
    const params = {
      fileUid: row.fileUid,
    };
    const res = await dataService.get('/sflex/common/common/file/temp/download', {
      params,
      responseType: 'arraybuffer',
    });
    pdf.value = res.data;
    console.log(row.bznsSpptMnalChCn);
    content.value = row.bznsSpptMnalChCn;
  } else {
    await alert(t('MSG_ALT_APN_FILE_RGST'));
  }
};

const onClickSearch = async () => {
  // 자동완성 검색조건 설정
  // cachedParams = cloneDeep(searchParams.value);
  await fetchData();
};

onMounted(() => {
  init();
});

</script>
