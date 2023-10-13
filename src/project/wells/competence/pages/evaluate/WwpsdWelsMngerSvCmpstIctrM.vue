<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSD
2. 프로그램 ID : WwpsdWelsMngerSvCmpstIctrM
3. 작성자 : Kim HyeonMin
4. 작성일 : 2023.10.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 웰스매니저 서비스 종합지표
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
          :label="t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.mngtYm"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_INQR_DV')"
          required
        >
          <kw-option-group
            v-model="searchParams.inqrDv"
            :options="customCodes.inqrDv"
            type="radio"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_AWD_DV')"
          required
        >
          <kw-option-group
            v-model="searchParams.awdDv"
            :options="customCodes.awdDv"
            type="radio"
            @change="onChangeAwdDv"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row
        v-show="isMngtDeptShow"
      >
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
        v-show="isNationWideShow"
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="5"
        @init="initGridMain"
      />
      <kw-grid
        v-show="isMngtDeptShow"
        ref="grdSubRef"
        name="grdSub"
        :visible-rows="5"
        @init="initGridSub"
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
import { useDataService, codeUtil, useMeta, defineGrid, gridUtil, getComponentType } from 'kw-lib';
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
const grdSubRef = ref(getComponentType('KwGrid'));
const dgr1LevlOg = ref();
const dgr1LevlOgs = ref([]);
const dgr2LevlOgs = ref([]);
const props = defineProps({
  // auth
  authYn: { type: String, default: 'N' },
  bznsPsicAuthYn: { type: String, default: 'N' },
});

let cachedParams;

const searchParams = ref({
  ogTpCd: userInfo.ogTpCd,
  mngtYm: now.format('YYYYMM'),
  baseYm: now.format('YYYYMM'),
  inqrDv: '01',
  awdDv: '01',
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const fetchData = async () => {
  const res = await dataService.get('/sms/wells/competence/evaluate/wels-mnger-sv-cmpst-ictr/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  let view;
  if (searchParams.value.awdDv === '01') {
    view = grdMainRef.value.getView();
  } else {
    view = grdSubRef.value.getView();
  }
  view.getDataSource().setRows(list);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
};

// 공통코드로딩
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const customCodes = {
  inqrDv: [{ codeId: '01', codeName: t('MSG_TXT_1ST') }, { codeId: '02', codeName: t('MSG_TXT_2ST') }],
  awdDv: [{ codeId: '01', codeName: t('MSG_TXT_NATIONWIDE') }, { codeId: '02', codeName: t('MSG_TXT_MANAGEMENT_DEPARTMENT') }],
};

const isNationWideShow = ref(true);
const isMngtDeptShow = ref(false);

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  console.log(searchParams.value);
  await fetchData();
}

const onClickExcelDownload = async () => {
  let view;
  if (searchParams.value.awdDv === '01') {
    view = grdMainRef.value.getView();
  } else {
    view = grdSubRef.value.getView();
  }
  const response = await dataService.get('/sms/wells/competence/evaluate/wels-mnger-sv-cmpst-ictr/excel-download', { params: cachedParams });
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
async function getDgr1LevlOgs() {
  const res = await fetchDgr1LevlOgs({ params: {
    authYn: props.authYn,
    bznsPsicAuthYn: props.bznsPsicAuthYn,
  } });
  dgr1LevlOgs.value = res.data;
}
async function getDgr2LevlOgs(val) {
  dgr2LevlOgs.value = [];
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
async function onChangeAwdDv() {
  isNationWideShow.value = false;
  isMngtDeptShow.value = false;
  if (searchParams.value.awdDv === '01') {
    isNationWideShow.value = true;
  } else {
    isMngtDeptShow.value = true;
  }
}
watch(() => searchParams.value.dgr1LevlOgId, (val) => {
  searchParams.value.dgr2LevlOgId = '';
  getDgr2LevlOgs(val);
});

onMounted(async () => {
  await getDgr1LevlOgs();
});

const initGridMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cnrOgCd' },
    { fieldName: 'cnrOgCd1' },
    { fieldName: 'cnrOgCd2' },
    { fieldName: 'ichrPrtnrNo' },
    { fieldName: 'ichrPrtnrNm' },
    { fieldName: 'rsbNm' },
    { fieldName: 'cttVstAccN' },
    { fieldName: 'cttFshCt' },
    { fieldName: 'cttCt1' },
    { fieldName: 'dgr1CttRat' },
    { fieldName: 'cttCt2' },
    { fieldName: 'dgr2CttRat' },
    { fieldName: 'cttPc' },
    { fieldName: 'hpcallFwCt' },
    { fieldName: 'hpcallRspCt' },
    { fieldName: 'hpcallRspRat' },
    { fieldName: 'hpcallAvPc' },
    { fieldName: 'hpcallEvlPc' },
    { fieldName: 'svProcsRtVstAccN' },
    { fieldName: 'svProcsRtFshAccN' },
    { fieldName: 'svProcsRtVstRat' },
    { fieldName: 'svProcsRtEvlPc' },
    { fieldName: 'promObyCt' },
    { fieldName: 'promObyRat' },
    { fieldName: 'promObyPc' },
    { fieldName: 'scnCt' },
    { fieldName: 'scnRat' },
    { fieldName: 'scnPc' },
    { fieldName: 'totalScore' },
    { fieldName: 'allRank' },
  ];

  const columns = [
    { fieldName: 'cnrOgCd', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '100', styleName: 'text-center' },
    { fieldName: 'cnrOgCd1', header: t('MSG_TXT_RGNL_GRP'), width: '100', styleName: 'text-center' },
    { fieldName: 'cnrOgCd2', header: t('MSG_TXT_BLG'), width: '100', styleName: 'text-center' },
    { fieldName: 'ichrPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'ichrPrtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'rsbNm', header: t('MSG_TXT_QLF'), width: '100', styleName: 'text-center' },
    { fieldName: 'cttVstAccN', header: t('MSG_TXT_VST_ACC'), width: '100', styleName: 'text-right' },
    { fieldName: 'cttFshCt', header: t('MSG_TXT_CTT_FSH'), width: '100', styleName: 'text-right' },
    { fieldName: 'cttCt1', header: t('MSG_TXT_DGR1_CTT_FSH'), width: '100', styleName: 'text-right' },
    { fieldName: 'dgr1CttRat', header: t('MSG_TXT_DGR1_CTT_RT'), width: '100', styleName: 'text-right', suffix: '%' },
    { fieldName: 'cttCt2', header: t('MSG_TXT_DGR2_CTT_FSH'), width: '100', styleName: 'text-right' },
    { fieldName: 'dgr2CttRat', header: t('MSG_TXT_DGR2_CTT_RT'), width: '100', styleName: 'text-right', suffix: '%' },
    { fieldName: 'cttPc', header: t('MSG_TXT_EVL_PC'), width: '100', styleName: 'text-right' },
    { fieldName: 'hpcallFwCt', header: t('MSG_TXT_FW_CT'), width: '100', styleName: 'text-right' },
    { fieldName: 'hpcallRspCt', header: t('MSG_TXT_RSP_CT'), width: '100', styleName: 'text-right' },
    { fieldName: 'hpcallRspRat', header: t('MSG_TXT_RSP_RT'), width: '100', styleName: 'text-right', suffix: '%' },
    { fieldName: 'hpcallAvPc', header: t('MSG_TXT_AV_PC'), width: '100', styleName: 'text-right' },
    { fieldName: 'hpcallEvlPc', header: t('MSG_TXT_EVL_PC'), width: '100', styleName: 'text-right' },
    { fieldName: 'svProcsRtVstAccN', header: t('MSG_TXT_VST_ACC'), width: '100', styleName: 'text-right' },
    { fieldName: 'svProcsRtFshAccN', header: t('MSG_TXT_FSH_ACC'), width: '100', styleName: 'text-right' },
    { fieldName: 'svProcsRtVstRat', header: t('MSG_TXT_VST_RAT'), width: '100', styleName: 'text-right', suffix: '%' },
    { fieldName: 'svProcsRtEvlPc', header: t('MSG_TXT_EVL_PC'), width: '100', styleName: 'text-right' },
    { fieldName: 'promObyCt', header: t('MSG_TXT_PROM_OBY'), width: '100', styleName: 'text-right' },
    { fieldName: 'promObyRat', header: t('MSG_TXT_PROM_OBY_RT'), width: '100', styleName: 'text-right', suffix: '%' },
    { fieldName: 'promObyPc', header: t('MSG_TXT_EVL_PC'), width: '100', styleName: 'text-right' },
    { fieldName: 'scnCt', header: t('MSG_TXT_SCN'), width: '100', styleName: 'text-right' },
    { fieldName: 'scnRat', header: t('MSG_TXT_SCAN_RT'), width: '100', styleName: 'text-right', suffix: '%' },
    { fieldName: 'scnPc', header: t('MSG_TXT_EVL_PC'), width: '100', styleName: 'text-right' },
    { fieldName: 'totalScore', header: t('MSG_TXT_TOT_PC'), width: '100', styleName: 'text-right' },
    { fieldName: 'allRank', header: t('MSG_TXT_RNK'), width: '100', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    {
      header: t('MSG_TXT_HMNRSC_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['cnrOgCd', 'cnrOgCd1', 'cnrOgCd2', 'ichrPrtnrNo', 'ichrPrtnrNm', 'rsbNm'],
    },
    {
      header: t('MSG_TXT_CTT_FSH_RT'), // colspan title
      direction: 'horizontal', // merge type
      items: ['cttVstAccN', 'cttFshCt', 'cttCt1', 'dgr1CttRat', 'cttCt2', 'dgr2CttRat', 'cttPc'],
    },
    {
      header: t('MSG_TXT_MBL_HPCALL'), // colspan title
      direction: 'horizontal', // merge type
      items: ['hpcallFwCt', 'hpcallRspCt', 'hpcallRspRat', 'hpcallAvPc', 'hpcallEvlPc'],
    },
    {
      header: t('MSG_TXT_SVC_PROC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['svProcsRtVstAccN', 'svProcsRtFshAccN', 'svProcsRtVstRat', 'svProcsRtEvlPc'],
    },
    {
      header: t('MSG_TXT_PROM_OBY_RT'), // colspan title
      direction: 'horizontal', // merge type
      items: ['promObyCt', 'promObyRat', 'promObyPc'],
    },
    {
      header: t('MSG_TXT_SCAN_RT'), // colspan title
      direction: 'horizontal', // merge type
      items: ['scnCt', 'scnRat', 'scnPc'],
    },
    {
      header: t('MSG_TXT_TOTAL_PC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['totalScore', 'allRank'],
    },
  ]);
});
const initGridSub = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cnrOgCd1' },
    { fieldName: 'cnrOgCd' },
    { fieldName: 'svProcsRtVstAccN' },
    { fieldName: 'cttFshCt' },
    { fieldName: 'contactRate01' },
    { fieldName: 'contactRate3Bf' },
    { fieldName: 'contactPlus' },
    { fieldName: 'disCntct' },
    { fieldName: 'promObyCt' },
    { fieldName: 'promObyRat' },
    { fieldName: 'scnCt' },
    { fieldName: 'scnRat' },
    { fieldName: 'svProcsRtFshAccN' },
    { fieldName: 'svProcsRtVstRat' },
    { fieldName: 'hpcallRspCt' },
    { fieldName: 'hpcallRspRat' },
    { fieldName: 'hpcallAddPc' },
    { fieldName: 'totalScore' },
    { fieldName: 'allRank' },
    { fieldName: 'overScore' },
  ];

  const columns = [
    { fieldName: 'cnrOgCd1', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '100', styleName: 'text-center' },
    { fieldName: 'cnrOgCd', header: t('MSG_TXT_RGNL_GRP'), width: '100', styleName: 'text-center' },
    { fieldName: 'svProcsRtVstAccN', header: t('MSG_TXT_ASN_ACC'), width: '100', styleName: 'text-right' },
    { fieldName: 'cttFshCt', header: t('MSG_TXT_CTT_FSH'), width: '100', styleName: 'text-right' },
    { fieldName: 'contactRate01', header: t('MSG_TXT_CTT_RT_100'), width: '150', styleName: 'text-right', suffix: '%' },
    { fieldName: 'contactRate3Bf', header: t('MSG_TXT_BFSVC_FSH_CTT_RT_3DAY'), width: '150', styleName: 'text-right', suffix: '%' },
    { fieldName: 'contactPlus', header: t('MSG_TXT_CTT_ADD_PC_3DAY'), width: '150', styleName: 'text-right' },
    { fieldName: 'disCntct', header: t('MSG_TXT_NOT_CTT'), width: '100', styleName: 'text-right' },
    { fieldName: 'promObyCt', header: t('MSG_TXT_PROM_OBY'), width: '100', styleName: 'text-right' },
    { fieldName: 'promObyRat', header: t('MSG_TXT_OBY_RT_100'), width: '100', styleName: 'text-right', suffix: '%' },
    { fieldName: 'scnCt', header: t('MSG_TXT_SCN'), width: '100', styleName: 'text-right' },
    { fieldName: 'scnRat', header: t('MSG_TXT_SCN_RT_100'), width: '100', styleName: 'text-right', suffix: '%' },
    { fieldName: 'svProcsRtFshAccN', header: t('MSG_TXT_COMPLETE'), width: '100', styleName: 'text-right' },
    { fieldName: 'svProcsRtVstRat', header: t('MSG_TXT_FSH_RT_100'), width: '100', styleName: 'text-right', suffix: '%' },
    { fieldName: 'hpcallRspCt', header: t('MSG_TXT_RSP_CT'), width: '100', styleName: 'text-right' },
    { fieldName: 'hpcallRspRat', header: t('MSG_TXT_RST_RT'), width: '100', styleName: 'text-right', suffix: '%' },
    { fieldName: 'hpcallAddPc', header: t('MSG_TXT_PC_100'), width: '100', styleName: 'text-right' },
    { fieldName: 'totalScore', header: t('MSG_TXT_TOT_PC_550'), width: '100', styleName: 'text-right' },
    { fieldName: 'allRank', header: t('MSG_TXT_CMPST_RNK'), width: '100', styleName: 'text-center' },
    { fieldName: 'overScore', header: t('MSG_TXT_ICRDCR_PC'), width: '100', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    {
      header: t('MSG_TXT_DIV'), // colspan title
      direction: 'horizontal', // merge type
      items: ['cnrOgCd1', 'cnrOgCd'],
    },
    'svProcsRtVstAccN',
    {
      header: t('MSG_TXT_CTT_FSH_23'), // colspan title
      direction: 'horizontal', // merge type
      items: ['cttFshCt', 'contactRate01', 'contactRate3Bf', 'contactPlus'],
    },
    'disCntct',
    {
      header: t('MSG_TXT_PROM_OBY_RT'), // colspan title
      direction: 'horizontal', // merge type
      items: ['promObyCt', 'promObyRat'],
    },
    {
      header: t('MSG_TXT_SCAN_RT'), // colspan title
      direction: 'horizontal', // merge type
      items: ['scnCt', 'scnRat'],
    },
    {
      header: t('MSG_TXT_SVC_PROC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['svProcsRtFshAccN', 'svProcsRtVstRat'],
    },
    {
      header: t('MSG_TXT_HPCALL'), // colspan title
      direction: 'horizontal', // merge type
      items: ['hpcallRspCt', 'hpcallRspRat', 'hpcallAddPc'],
    },
    {
      header: t('MSG_TXT_TOTAL_PC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['totalScore', 'allRank', 'overScore'],
    },
  ]);
});

</script>
<style scoped></style>
