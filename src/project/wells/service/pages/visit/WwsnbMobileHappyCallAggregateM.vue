<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC (배정관리)
 2. 프로그램 ID : [K-W-SV-U-0268M01] WwsnbMobileHappyCallAggregateM - 모바일해피콜 집계
 3. 작성자 : gs.piit231
 4. 작성일 : 2023.09.12
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 모바일해피콜 집계
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <template #header>
      <kw-page-header
        :options="['홈','정보관리','서비스종합평가','모바일해피콜 집계']"
      />
    </template>

    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 조회기간 -->
        <kw-search-item :label="t('MSG_TXT_LOOKUP_PERIOD')">
          <kw-date-range-picker
            v-model:from="searchParams.searchDateFrom"
            v-model:to="searchParams.searchDateTo"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <!-- 서비스센터 -->
        <kw-search-item :label="t('MSG_TXT_SRVC_CNTR')">
          <kw-select
            v-model="searchParams.ogId"
            :options="svcCode"
            first-option="all"
            option-label="ogNm"
            option-value="ogId"
            class="w240"
            @update:model-value="onUpdateSvcCode"
          />
          <kw-select
            v-model="searchParams.engId"
            :options="engineers"
            first-option="all"
          />
          <kw-field
            v-model="searchParams.rgsnYn"
            @update:model-value="onUpdateRgsnYn"
          >
            <!-- 퇴사자제외 -->
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                :label="$t('MSG_TXT_RGSN_EXCD')"
              />
            </template>
          </kw-field>
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
        </template>
        <kw-btn
          icon="print"
          dense
          secondary
          :label="t('MSG_BTN_PRTG')"
          :disable="totalCount === 0"
          @click="onClickPrintEl"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, getComponentType, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import { printElement } from '~common/utils/common';

const { t } = useI18n();

const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'SV_DV_CD',
);
console.log('codes.SV_DV_CD >>>>', codes.SV_DV_CD);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const grdMainRef = ref(getComponentType('KwGrid'));

// 서비스센터 조회
const svcCode = (await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } })).data;
const engineers = ref([]);

const searchParams = ref({
  searchDateFrom: dayjs().date(1).format('YYYYMMDD'),
  searchDateTo: dayjs().format('YYYYMMDD'),
  ogId: '',
  engId: '',
  rgsnYn: 'Y',
});

// 조회 갯수
const totalCount = ref(0);

async function setEngineers() {
  if (searchParams.value.ogId === '') {
    engineers.value = [];
  } else {
    const eng = (await dataService.get('/sms/wells/service/organizations/engineer', { params: { dgr1LevlOgId: searchParams.value.ogId, authYn: 'N' } })).data;
    if (searchParams.value.rgsnYn === 'Y') {
      const wrkEngByOdId = eng.filter((v) => v.cltnDt === null || v.cltnDt === '');
      engineers.value = wrkEngByOdId.map((v) => ({ codeId: v.prtnrNo, codeName: v.prtnrNm }));
      return;
    }
    engineers.value = eng.map((v) => ({ codeId: v.prtnrNo, codeName: v.prtnrNm }));
  }
}

async function onUpdateSvcCode() {
  searchParams.value.egerId = '';
  setEngineers();
}

async function onUpdateRgsnYn() {
  searchParams.value.egerId = '';
  setEngineers();
}

async function fetchData() {
  console.log('fetchData START');
  console.log('fetchData cachedParams  >>>', cachedParams);
  const res = await dataService.get('/sms/wells/service/mobile-happy-call-agrg/get-mobile-happy-call-agrg', { params: { ...cachedParams } });
  console.log('res.data >>>', res.data);

  totalCount.value = res.data.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

const pageRef = ref();
async function onClickPrintEl() {
  printElement(pageRef);
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: '모바일 해피콜 집계',
    timePostfix: true,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'cntrSn' },
    { fieldName: 'cstKnm' },
    { fieldName: 'svBizDclsfCd' },
    { fieldName: 'sapCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'copnDv' },
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'svDv' },
  ];

  const columns = [
    { fieldName: 'cntrSn', header: '서비스센터', width: '150' },
    { fieldName: 'cstKnm', header: '조', width: '100' },
    { fieldName: 'svBizDclsfCd', header: '사번', width: '100', styleName: 'text-center' },
    { fieldName: 'sapCd', header: '성명', width: '100' },
    { fieldName: 'pdCd', header: '입사일', width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: '평균(점)', width: '100', styleName: 'text-right' },
    { fieldName: 'cralLocaraTno', header: '상위(%)', width: '100', styleName: 'text-right' },
    { fieldName: 'mexnoEncr', header: '등급', width: '100', styleName: 'text-right' },
    { fieldName: 'cralIdvTno', header: '점수(점)', width: '100', styleName: 'text-right' },
    { fieldName: 'copnDv', header: '응답건', width: '100', styleName: 'text-right' },
    { fieldName: 'ogNm', header: '상위(%)', width: '100', styleName: 'text-right' },
    { fieldName: 'prtnrKnm', header: '등급', width: '100', styleName: 'text-right' },
    { fieldName: 'prtnrNo', header: '점수(점)', width: '100', styleName: 'text-right' },
    { fieldName: 'svDv', header: '응답율(%)', width: '100', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
}
</script>

<style scoped>
</style>
