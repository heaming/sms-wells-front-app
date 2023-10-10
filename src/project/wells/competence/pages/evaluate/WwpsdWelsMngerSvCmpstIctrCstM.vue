<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSD
2. 프로그램 ID : WwpsdWelsMngerSvCmpstIctrCstM
3. 작성자 : Kim HyeonMin
4. 작성일 : 2023.10.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 웰스매니저 서비스 종합지표(고객)
****************************************************************************************************
-->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_ASN_YM')"
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_MNGT_DV')"
        >
          <kw-option-group
            first-option="true"
            type="radio"
            :first-option-label="t('MSG_TXT_MANAGER')"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_OG_LEVL')"
        >
          <kw-select
            v-model="searchParams.dgr1LevlOgId"
            first-option="all"
            :options="dgr1LevlOgs"
            option-value="ogCd"
            option-label="ogCdNm"
          />
          <kw-select
            v-model="searchParams.dgr2LevlOgId"
            first-option="all"
            :options="dgr2LevlOgs"
            option-value="ogCd"
            option-label="ogCdNm"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_MNGER_NM')"
        >
          <kw-select
            v-model="searchParams.prtnrNo"
            first-option="all"
            :options="partnersIds"
            option-value="prtnrNo"
            option-label="prtnrNoNm"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          />
        </template>
        <kw-btn
          v-permission:read
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          secondary
          dense
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        :visible-rows="5"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>
<script setup>

import dayjs from 'dayjs';
import { useDataService, codeUtil, useMeta, getComponentType, gridUtil, defineGrid } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const now = dayjs();
const { getConfig, getUserInfo } = useMeta();
const userInfo = getUserInfo();
const dataService = useDataService();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const ogTpCd = ref();
const partnersIds = ref([]);
const dgr1LevlOg = ref();
const dgr1LevlOgs = ref([]);
const dgr2LevlOg = ref();
const dgr2LevlOgs = ref([]);

const props = defineProps({
  // auth
  authYn: { type: String, default: 'N' },
  bznsPsicAuthYn: { type: String, default: 'N' },
});

let cachedParams;
// 검색조건 Parameter
const searchParams = ref({
  ogTpCd: userInfo.ogTpCd,
  baseYm: now.format('YYYYMM'), // 배정년월
  ogId: '',
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  dgr3LevlOgId: '',
  prtnrNo: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const fetchData = async () => {
  const res = await dataService.get('/sms/wells/competence/evaluate/wels-mnger-sv-cmpst-ictr-cst/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(list);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
};

// 공통코드로딩
const codes = await codeUtil.getMultiCodes(
  'OG_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
);
ogTpCd.value = codes.OG_TP_CD.filter((v) => ['W01', 'W02', 'E01', 'E03'].includes(v.codeId));

const onClickSearch = async () => {
  console.log(searchParams.value);
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
};

const onClickExcelDownload = async () => {
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/competence/evaluate/wels-mnger-sv-cmpst-ictr-cst/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
};
async function fetchDgr1LevlOgs(params) {
  return await dataService.get('/sms/wells/service/organizations/general-division', params);
}
async function fetchDgr2LevlOgs(params) {
  return await dataService.get('/sms/wells/service/organizations/regional-group', params);
}
async function fetchPartners(params) {
  return await dataService.get('/sms/wells/service/organizations/manager', params);
}
async function getDgr1LevlOgs() {
  const res = await fetchDgr1LevlOgs({ params: {
    authYn: props.authYn,
    bznsPsicAuthYn: props.bznsPsicAuthYn,
  } });
  dgr1LevlOgs.value = res.data;
}
async function getDgr2LevlOgs(val) {
  searchParams.value.prtnrNo = '';
  dgr2LevlOgs.value = [];
  partnersIds.value = [];
  dgr1LevlOg.value = dgr1LevlOgs.value.filter((v) => val.includes(v.ogCd));
  if (dgr1LevlOg.value.length > 0) {
    const res = await fetchDgr2LevlOgs({ params: {
      ogId: dgr1LevlOg.value[0].ogId,
      authYn: props.authYn,
      bznsPsicAuthYn: props.bznsPsicAuthYn,
    } });
    dgr2LevlOgs.value = res.data;
  }
}
async function getPartners() {
  searchParams.value.prtnrNo = '';
  partnersIds.value = [];
  dgr1LevlOg.value = dgr1LevlOgs.value.filter((v) => searchParams.value.dgr1LevlOgId.includes(v.ogCd));
  dgr2LevlOg.value = dgr2LevlOgs.value.filter((v) => searchParams.value.dgr2LevlOgId.includes(v.ogCd));

  if (dgr1LevlOg.value.length > 0 && dgr2LevlOg.value.length > 0) {
    const res = await fetchPartners({ params: {
      dgr1LevlOgId: dgr1LevlOg.value[0].ogId,
      dgr2LevlOgId: dgr2LevlOg.value[0].ogId,
      authYn: props.authYn,
      bznsPsicAuthYn: props.bznsPsicAuthYn,
    } });
    partnersIds.value = res.data;
  }
}

watch(() => searchParams.value.dgr1LevlOgId, (val) => {
  searchParams.value.dgr2LevlOgId = '';
  getDgr2LevlOgs(val);
});

watch(() => searchParams.value.dgr2LevlOgId, (val) => {
  if (val !== undefined && val !== '') {
    getPartners();
  }
});

onMounted(async () => {
  await getDgr1LevlOgs();
});

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dgr3LevlOgCd' },
    { fieldName: 'fstPrtnrNo' },
    { fieldName: 'fstPrtnrKnm' },
    { fieldName: 'cntrCstNo' },
    { fieldName: 'rcgvpKnm' },
    { fieldName: 'pdNm' },
    { fieldName: 'svBizDclsfNm' },
    { fieldName: 'rnadr' },
    { fieldName: 'cntcDt' },
    { fieldName: 'cntcHh' },
    { fieldName: 'absncRsonCd' },
    { fieldName: 'vstDuedt' },
    { fieldName: 'vstExpHh' },
    { fieldName: 'vstFshDt' },
    { fieldName: 'scnDtm' },
    { fieldName: 'vstFshHh' },
    { fieldName: 'vstPrgsStatCd' },
    { fieldName: 'hpcallYn' },
  ];

  const columns = [
    { fieldName: 'dgr3LevlOgCd', header: t('MSG_TXT_BLG'), width: '100', styleName: 'text-center' },
    { fieldName: 'fstPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'fstPrtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '150', styleName: 'text-left' },
    { fieldName: 'svBizDclsfNm', header: t('MSG_TXT_WK_CLS'), width: '100', styleName: 'text-left' },
    { fieldName: 'rnadr', header: t('MSG_TXT_CST_ADR'), width: '150', styleName: 'text-left' },
    { fieldName: 'cntcDt', header: t('MSG_TXT_CTT_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'cntcHh', header: t('MSG_TXT_CTT_HH'), width: '100', styleName: 'text-center', datetimeFormat: 'HH:mm:ss' },
    { fieldName: 'absncRsonCd', header: t('MSG_TXT_CTT_RS'), width: '100', styleName: 'text-center' },
    { fieldName: 'vstDuedt', header: t('MSG_TXT_PROM_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'vstExpHh', header: t('MSG_TXT_PROM_HH'), width: '100', styleName: 'text-center', datetimeFormat: 'HH:mm:ss' },
    { fieldName: 'vstFshDt', header: t('MSG_TXT_VST_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'scnDtm', header: t('MSG_TXT_SCN_TIME'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'vstFshHh', header: t('MSG_TXT_FSH_HH'), width: '100', styleName: 'text-center', datetimeFormat: 'HH:mm:ss' },
    { fieldName: 'vstPrgsStatCd', header: t('MSG_TXT_VST_RS'), width: '100', styleName: 'text-center' },
    { fieldName: 'hpcallYn', header: t('MSG_TXT_HPCALL'), width: '100', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
