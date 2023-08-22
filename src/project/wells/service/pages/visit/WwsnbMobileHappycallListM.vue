<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : WwsnbMobileHappycallListM(K-W-SV-U-0267M01) - 모바일해피콜 현황
3. 작성자 : jaehunlee
4. 작성일 : 2023.08.14
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- 입고 집계 (http://localhost:3000/#/service/wwsnb-mobile-happycall-list)
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SV_TP')"
        >
          <kw-select
            v-model="searchParams.svcTpCd"
            :options="codes.SV_DV_CD"
            first-option="all"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_SRVC_CNTR')"
        >
          <kw-select
            v-model="searchParams.ogId"
            :options="svcCode"
            first-option="all"
            option-label="ogNm"
            option-value="ogId"
            class="w200"
            @update:model-value="onUpdateSvcCode"
          />
          <kw-select
            v-model="searchParams.engId"
            :options="engineers"
            first-option="all"
            class="w200"
          />
          <kw-field
            v-model="searchParams.rgsnYn"
            @update:model-value="onUpdateRgsnYn"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                :label="$t('MSG_TXT_RGSN_EXCD')"
              />
            </template>
          </kw-field>
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_INQR_BASE')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.inqrBase"
            :options="customCodes.INQR_BASE_CD"
          />
          <kw-date-range-picker
            v-model:from="searchParams.baseDateFrom"
            v-model:to="searchParams.baseDateTo"
            rules="date_range_months:1"
            class="w364"
          />
          <kw-field
            v-model="searchParams.acpnWrkInc"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                :label="$t('MSG_TXT_ACPN_WRK_INC')"
              />
            </template>
          </kw-field>
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :page-size="pageInfo.pageSize"
        :visible-rows="10"
        @init="initGrid"
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
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, useMeta, getComponentType, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const now = dayjs();
const dataService = useDataService();
const { getConfig } = useMeta();
const { t } = useI18n();
const router = useRouter();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'SV_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
);
const svcCode = (await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } })).data;
const engineers = ref([]);
const customCodes = {
  INQR_BASE_CD: [
    { codeId: '1', codeName: '처리일자' },
    { codeId: '2', codeName: '응답일자' },
  ],
};

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const searchParams = ref({
  svcTpCd: '',
  ogId: '',
  engId: '',
  inqrBase: '1',
  baseDateFrom: now.format('YYYYMMDD'),
  baseDateTo: now.format('YYYYMMDD'),
  rgsnYn: 'Y',
  acpnWrkInc: 'N',
});

let cachedParams;
const grdMainRef = ref(getComponentType('KwGrid'));

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

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/mobile-happycall/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: itemizations, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(itemizations);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/mobile-happycall/excel-download', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onUpdateSvcCode() {
  searchParams.value.egerId = '';
  setEngineers();
}

async function onUpdateRgsnYn() {
  searchParams.value.egerId = '';
  setEngineers();
}

function getPhoneNo(locaraTno, exnoEncr, idvTno) {
  if (isEmpty(locaraTno) || isEmpty(exnoEncr) || isEmpty(idvTno)) return '';
  return `${locaraTno}-${exnoEncr}-${idvTno}`;
}

function getCntrNo(cntrNo, cntrSn) {
  if (isEmpty(cntrNo) || isEmpty(cntrSn)) return '';
  return `${cntrNo}-${cntrSn}`;
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cstKnm' },
    { fieldName: 'sapCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'phoneNo' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'copnDv' },
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'acpnPrtnrNm' },
    { fieldName: 'acpnPrtnrNo' },
    { fieldName: 'svDv' },
    { fieldName: 'wkGrpCd' },
    { fieldName: 'svBizDclsfCd' },
    { fieldName: 'rplyDt' },
    { fieldName: 'vstFshDt' },
    { fieldName: 'hpcallStpcN' },
    { fieldName: 'rslt01' },
    { fieldName: 'rslt02' },
    { fieldName: 'rslt03' },
    { fieldName: 'rslt04' },
    { fieldName: 'rslt05' },
    { fieldName: 'rslt06' },
    { fieldName: 'rslt07' },
    { fieldName: 'rslt08' },
    { fieldName: 'rslt09' },
    { fieldName: 'rslt10' },
    { fieldName: 'rslt11' },
    { fieldName: 'rslt12' },
    { fieldName: 'hpcallHdwrQstCn' },
    { fieldName: 'sendYn' },
    { fieldName: 'rplyYn' },
    { fieldName: 'rdnyYn' },
  ];

  const columns = [
    { fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_NO'),
      width: '150',
      styleName: 'text-center rg-button-link',
      renderer: {
        type: 'button',
      },
      displayCallback: (grid, index) => {
        const { cntrNo, cntrSn } = grid.getValues(index.dataRow);
        return getCntrNo(cntrNo, cntrSn);
      } },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'sapCd', header: t('MSG_TXT_SAPCD'), width: '200', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'phoneNo',
      header: t('MSG_TXT_INSTR_PH_NO'),
      width: '150',
      styleName: 'text-center',
      displayCallback: (grid, index) => {
        const { cralLocaraTno, mexnoEncr, cralIdvTno } = grid.getValues(index.dataRow);
        return getPhoneNo(cralLocaraTno, mexnoEncr, cralIdvTno);
      } },
    { fieldName: 'copnDv', header: t('MSG_TXT_INDV_CRP_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'acpnPrtnrNm', header: t('MSG_TXT_CMPA_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'acpnPrtnrNo', header: t('MSG_TXT_ACPN_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'svDv', header: t('MSG_TXT_WK_CLS'), width: '100', styleName: 'text-center' },
    { fieldName: 'wkGrpCd', header: t('MSG_TXT_WK_GRP'), width: '100', styleName: 'text-center' },
    { fieldName: 'svBizDclsfCd', header: t('MSG_TXT_SV_TP'), width: '100', styleName: 'text-center' },
    { fieldName: 'rplyDt', header: t('MSG_TXT_RSP_FSH_DT'), width: '120', styleName: 'text-center' },
    { fieldName: 'vstFshDt', header: t('MSG_TXT_CMPLTD_DT'), width: '120', styleName: 'text-center' },
    { fieldName: 'hpcallStpcN', header: t('MSG_TXT_TOTAL_PC'), width: '100', styleName: 'text-center' },
    { fieldName: 'rslt01', header: '1', width: '50', styleName: 'text-center' },
    { fieldName: 'rslt02', header: '2', width: '50', styleName: 'text-center' },
    { fieldName: 'rslt03', header: '3', width: '50', styleName: 'text-center' },
    { fieldName: 'rslt04', header: '4', width: '50', styleName: 'text-center' },
    { fieldName: 'rslt05', header: '5', width: '50', styleName: 'text-center' },
    { fieldName: 'rslt06', header: '6', width: '50', styleName: 'text-center' },
    { fieldName: 'rslt07', header: '1', width: '50', styleName: 'text-center' },
    { fieldName: 'rslt08', header: '2', width: '50', styleName: 'text-center' },
    { fieldName: 'rslt09', header: '3', width: '50', styleName: 'text-center' },
    { fieldName: 'rslt10', header: '4', width: '50', styleName: 'text-center' },
    { fieldName: 'rslt11', header: '5', width: '50', styleName: 'text-center' },
    { fieldName: 'rslt12', header: '6', width: '50', styleName: 'text-center' },
    { fieldName: 'hpcallHdwrQstCn', header: t('MSG_TXT_HDWR_QST'), width: '350', styleName: 'text-center' },
    { fieldName: 'sendYn', header: t('MSG_TXT_FW_YN'), width: '80', styleName: 'text-center' },
    { fieldName: 'rplyYn', header: t('MSG_TXT_RPLY_YN'), width: '80', styleName: 'text-center' },
    { fieldName: 'rdnyYn', header: t('MSG_TXT_RCV_RJT'), width: '80', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout([
    'cntrNo',
    'cstKnm',
    'sapCd',
    'pdCd',
    'pdNm',
    'phoneNo',
    'copnDv',
    'ogNm',
    'prtnrKnm',
    'prtnrNo',
    'acpnPrtnrNm',
    'acpnPrtnrNo',
    'svDv',
    'wkGrpCd',
    'svBizDclsfCd',
    'rplyDt',
    'vstFshDt',
    'hpcallStpcN',
    {
      header: t('MSG_TXT_DSTF'),
      direction: 'horizontal',
      items: ['rslt01', 'rslt02', 'rslt03', 'rslt04', 'rslt05', 'rslt06'],
    },
    {
      header: t('MSG_TXT_STF'),
      direction: 'horizontal',
      items: ['rslt07', 'rslt08', 'rslt09', 'rslt10', 'rslt11', 'rslt12'],
    },
    'hpcallHdwrQstCn',
    {
      header: '5',
      direction: 'horizontal',
      items: ['sendYn', 'rplyYn', 'rdnyYn'],
    },
  ]);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'cntrNo') {
      const cntrNo = g.getValue(itemIndex, 'cntrNo');
      const cntrSn = g.getValue(itemIndex, 'cntrSn');

      router.push({
        path: '/service/wwsnb-individual-service-list',
        query: {
          cntrNo,
          cntrSn,
        },
      });
    }
  };
}
</script>

<style scoped>
</style>
