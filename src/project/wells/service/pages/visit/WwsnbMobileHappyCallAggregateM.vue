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
            option-label="prtnrNoNm"
            option-value="prtnrNo"
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
import { cloneDeep, isEmpty } from 'lodash-es';
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
// eslint-disable-next-line max-len
// const svcCode = (await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } })).data;
// const engineers = ref([]);

// 서비스센터
const svcCode = ref((await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } })).data);
console.log('svcCode.value >>>', svcCode.value);
// 엔지니어
const engineerList = await dataService.get('/sms/wells/service/organizations/engineer', { params: { authYn: 'N' } });
const engineers = ref(engineerList.data);
console.log('engineers.value >>>', engineers.value);

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
  engineers.value = cloneDeep(engineerList.data);

  if (!isEmpty(searchParams.value.ogId)) {
    console.log('setEngineers 0001');
    engineers.value = engineers.value.filter((v) => v.ogId === searchParams.value.ogId);
  }

  if (searchParams.value.rgsnYn === 'Y') {
    console.log('setEngineers 0002');
    engineers.value = engineers.value.filter((v) => v.cltnDt === null || v.cltnDt === '');
  }
  console.log('engineers.value >>>>', engineers.value);
}

async function onUpdateSvcCode() {
  searchParams.value.engId = '';
  setEngineers();
}

async function onUpdateRgsnYn() {
  searchParams.value.engId = '';
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
  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_SV_CNR'), width: '150', styleName: 'text-center' }, // 서비스센터
    { fieldName: 'wkcr', header: t('MSG_TXT_CO'), width: '100', styleName: 'text-center' }, // 조
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' }, // 사번
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' }, // 성명
    { // 입사일
      fieldName: 'cntrDt',
      header: t('MSG_TXT_ENTCO_D'),
      width: '100',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrDt } = grid.getValues(index.itemIndex);
        return isEmpty(cntrDt) ? '' : dayjs(cntrDt).format('YYYY-MM-DD');
      },
    },
    { fieldName: 'synthAvg', header: `${t('MSG_TXT_AV')}(${t('점')})`, width: '100', styleName: 'text-right', dataType: 'number' }, // 평균(점)
    { fieldName: 'synthAvgRank', header: `${t('MSG_TXT_HGR')}(%)`, width: '100', styleName: 'text-right', dataType: 'number' }, // 상위(%)
    { fieldName: 'synthAvgGrd', header: t('MSG_TXT_GD'), width: '100', styleName: 'text-right' }, // 등급
    { fieldName: 'synthAvgGrdScore', header: `${t('MSG_TXT_PC')}(${t('점')})`, width: '100', styleName: 'text-right', dataType: 'number' }, // 점수(점)
    { fieldName: 'rplyCnt', header: t('MSG_TXT_RSP_CT'), width: '100', styleName: 'text-right', dataType: 'number' }, // 응답건
    { fieldName: 'rplyCntRank', header: `${t('MSG_TXT_HGR')}(%)`, width: '100', styleName: 'text-right', dataType: 'number' }, // 상위(%)
    { fieldName: 'rplyCntGrd', header: t('MSG_TXT_GD'), width: '100', styleName: 'text-right' }, // 등급
    { fieldName: 'rplyCntGrdScore', header: `${t('MSG_TXT_PC')}(${t('점')})`, width: '100', styleName: 'text-right', dataType: 'number' }, // 점수(점)
    { fieldName: 'rplyPer', header: `${t('MSG_TXT_RSP_RT')}(%)`, width: '100', styleName: 'text-right', dataType: 'number' }, // 응답율(%)
    { fieldName: 'rplyPerRank', header: t('MSG_TXT_HGR'), width: '100', styleName: 'text-right', dataType: 'number' }, // [응답율]상위
    { fieldName: 'rplyPerGrd', header: t('MSG_TXT_GD'), width: '100', styleName: 'text-right' }, // [응답율]등급
    { fieldName: 'rplyPerGrdScore', header: t('MSG_TXT_PC'), width: '100', styleName: 'text-right', dataType: 'number' }, // [응답율]점수
    { fieldName: 'hpcallAvg', header: t('MSG_TXT_HPCALL'), width: '100', styleName: 'text-right', dataType: 'number' }, // 해피콜
    { fieldName: 'hpcallAvgRank', header: t('MSG_TXT_HGR'), width: '100', styleName: 'text-right', dataType: 'number' }, // [해피콜] 상위
    { fieldName: 'hpcallAvgGrd', header: t('MSG_TXT_GD'), width: '100', styleName: 'text-right' }, // [해피콜] 등급
    { fieldName: 'hpcallAvgGrdScore', header: t('MSG_TXT_PC'), width: '100', styleName: 'text-right', dataType: 'number' }, // [해피콜] 점수
    { fieldName: 'trsCnt', header: t('MSG_TXT_PSH_SEND') + t('MSG_TXT_CNT'), width: '100', styleName: 'text-right', dataType: 'number' }, // 발송건
    { fieldName: 'compCnt', header: t('MSG_TXT_PROC') + t('MSG_TXT_CNT'), width: '100', styleName: 'text-right', dataType: 'number' }, // 처리건
    { fieldName: 'envrElhmCnt', header: t('MSG_TXT_ENVR_ELHM'), width: '100', styleName: 'text-right', dataType: 'number' }, // 환경가전 건수
    { fieldName: 'sdingSpcltCnt', header: t('MSG_TXT_SDING') + t('전문'), width: '100', styleName: 'text-right', dataType: 'number' }, // 모종전문 건수
    { fieldName: 'hcrCnt', header: t('MSG_TXT_HOME_CARE'), width: '100', styleName: 'text-right', dataType: 'number' }, // 홈케어 건수
    { fieldName: 'lgszElhmCnt', header: t('MSG_TXT_LGSZ_ELHM'), width: '100', styleName: 'text-right', dataType: 'number' }, // 대형가전 건수
    { fieldName: 'mdimRprCnt', header: t('MSG_TXT_MDIM_RPR'), width: '100', styleName: 'text-right', dataType: 'number' }, // 중수리 건수
    { fieldName: 'acpnCnt', header: t('MSG_TXT_ACPN'), width: '100', styleName: 'text-right', dataType: 'number' }, // 동행 건수
  ];

  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);

  view.rowIndicator.visible = true;
}
</script>

<style scoped>
</style>
