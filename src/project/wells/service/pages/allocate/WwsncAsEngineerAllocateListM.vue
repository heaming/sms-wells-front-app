<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : WwsncAsEngineerAllocateListM(K-W-SV-U-0021M01) - 엔지니어 배정현황
3. 작성자 : jaehunlee
4. 작성일 : 2023.09.06
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- 엔지니어 배정현황 (http://localhost:3000/#/service/wwsnc-as-engineer-allocate-list)
 ****************************************************************************************************
--->

<template>
  <kw-page ref="pageRef">
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SRVC_CNTR')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.ogId"
            :options="svcCode"
            first-option="all"
            option-label="ogNm"
            option-value="ogId"
            class="w180"
            @update:model-value="onUpdateSvcCode"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_EGER')"
          :colspan="2"
        >
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
        <kw-search-item
          :label="$t('MSG_TXT_WK_CLS')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.svDvCd"
            :options="customCodes.SV_DV_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PRGS_DV')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.prgsDvCd"
            :options="customCodes.PRGS_DV_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ASN_DT')"
          :colspan="2"
        >
          <kw-date-range-picker
            v-model:from="searchParams.baseDateFrom"
            v-model:to="searchParams.baseDateTo"
            rules="date_range_months:1"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_VST_CNFM_DT')"
          :colspan="2"
        >
          <kw-date-picker
            v-model="searchParams.vstCfrmDt"
          />
          <kw-field
            v-model="searchParams.cfrmOnlyYn"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                :label="$t('MSG_TXT_INQR_BY_VST_CNFM_DT')"
              />
            </template>
          </kw-field>
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_SEL_TYPE')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="customCodes.SELL_TP_CD"
            first-option="all"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_IST_CNF')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.istConfCd"
            :options="customCodes.IST_CONF_CD"
            first-option="all"
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>

        <kw-btn
          icon="print"
          dense
          secondary
          :label="t('MSG_BTN_PRTG')"
          @click="onClickPrintEl"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          secondary
          dense
          :label="$t('MSG_BTN_INSTL') + $t('MSG_BTN_PRINT_LABEL')"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :page-size="pageInfo.pageSize"
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
import { codeUtil, useDataService, useMeta, getComponentType, gridUtil, popupUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import { printElement } from '~common/utils/common';

const dataService = useDataService();
const { getConfig } = useMeta();
const now = dayjs();
const { t } = useI18n();
const router = useRouter();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const svcCode = (await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'Y' } })).data;
const engineers = ref([]);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const customCodes = {
  SV_DV_CD: [
    { codeId: '1', codeName: '설치' },
    { codeId: '2', codeName: 'A/S' },
  ],
  PRGS_DV_CD: [
    { codeId: '00', codeName: '작업대기' },
    { codeId: '10', codeName: '진행중' },
    { codeId: '20', codeName: '작업완료' },
    { codeId: '71', codeName: '대기취소' },
    { codeId: '72', codeName: '진행취소' },
  ],
  SELL_TP_CD: [
    { codeId: '1', codeName: '할부' },
    { codeId: '2', codeName: '렌탈' },
  ],
  IST_CONF_CD: [
    { codeId: '1', codeName: '확인' },
    { codeId: '2', codeName: '미확인' },
  ],
};

const searchParams = ref({
  ogId: '',
  engId: '',
  rgsnYn: 'Y',
  svDvCd: '',
  prgsDvCd: '',
  baseDateFrom: `${now.format('YYYYMM')}01`,
  baseDateTo: now.format('YYYYMMDD'),
  vstCfrmDt: '',
  cfrmOnlyYn: 'N',
  sellTpCd: '',
  istConfCd: '',
});

async function setEngineers() {
  if (searchParams.value.ogId === '') {
    engineers.value = [];
  } else {
    const eng = (await dataService.get('/sms/wells/service/organizations/engineer', { params: { dgr1LevlOgId: searchParams.value.ogId, authYn: 'Y' } })).data;
    if (searchParams.value.rgsnYn === 'Y') {
      const wrkEngByOdId = eng.filter((v) => v.cltnDt === null || v.cltnDt === '');
      engineers.value = wrkEngByOdId.map((v) => ({ codeId: v.prtnrNo, codeName: v.prtnrNm }));
      return;
    }
    engineers.value = eng.map((v) => ({ codeId: v.prtnrNo, codeName: v.prtnrNm }));
  }
}

async function onUpdateSvcCode() {
  searchParams.value.engId = '';
  setEngineers();
}

async function onUpdateRgsnYn() {
  searchParams.value.engId = '';
  setEngineers();
}

let cachedParams;
const grdMainRef = ref(getComponentType('KwGrid'));

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-engineer-allocate/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: itemizations, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(itemizations);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/as-engineer-allocate/excel-download', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

const pageRef = ref();
async function onClickPrintEl() {
  printElement(pageRef);
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
    { fieldName: 'sellTp' },
    { fieldName: 'istllKnm' },
    { fieldName: 'cstGd' },
    { fieldName: 'svTp' },
    { fieldName: 'tellNo' },
    { fieldName: 'locaraTno' },
    { fieldName: 'exnoEncr' },
    { fieldName: 'idvTno' },
    { fieldName: 'phoneNo' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'cntrDt' },
    { fieldName: 'sapMatCd' },
    { fieldName: 'pdctPdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'fgptNm' },
    { fieldName: 'alncmpCd' },
    { fieldName: 'pdUswyCd' },
    { fieldName: 'newAdrZip' },
    { fieldName: 'adrDtl' },
    { fieldName: 'cnslMoCn' },
    { fieldName: 'svBizDclsf' },
    { fieldName: 'asRefriDvCd' },
    { fieldName: 'bsRefriDvCd' },
    { fieldName: 'istDt' },
    { fieldName: 'expireDt' },
    { fieldName: 'egerAsnDt' },
    { fieldName: 'vstDt' },
    { fieldName: 'dtChange' },
    { fieldName: 'cfrmDt' },
    { fieldName: 'dtmChRsonCd' },
    { fieldName: 'dtmChRsonDtlCn' },
    { fieldName: 'prtnrNm' },
    { fieldName: 'wkPrgsStat' },

    { fieldName: 'cstSvAsnNo' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'svHshdNo' },
    { fieldName: 'svHshdNoCnt' },
    { fieldName: 'svBizHclsfCd' },
    { fieldName: 'svBizDclsfCd' },
    { fieldName: 'wkPrgsStatCd' },
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
    { fieldName: 'sellTp', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'istllKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'cstGd', header: t('MSG_TXT_CST_GRD'), width: '100', styleName: 'text-center' },
    { fieldName: 'svTp', header: t('MSG_TXT_DIV'), width: '80', styleName: 'text-center' },
    { fieldName: 'tellNo',
      header: t('MSG_TXT_TEL_NO'),
      width: '150',
      styleName: 'text-center',
      displayCallback: (grid, index) => {
        const { locaraTno, exnoEncr, idvTno } = grid.getValues(index.dataRow);
        return getPhoneNo(locaraTno, exnoEncr, idvTno);
      } },
    { fieldName: 'phoneNo',
      header: t('MSG_TXT_MPNO'),
      width: '150',
      styleName: 'text-center',
      displayCallback: (grid, index) => {
        const { cralLocaraTno, mexnoEncr, cralIdvTno } = grid.getValues(index.dataRow);
        return getPhoneNo(cralLocaraTno, mexnoEncr, cralIdvTno);
      } },
    { fieldName: 'cntrDt', header: t('MSG_TXT_CNTR_DATE'), width: '100', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '180', styleName: 'text-center' },
    { fieldName: 'pdctPdCd', header: t('MSG_TXT_ITM_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-left' },
    { fieldName: 'fgptNm', header: t('MSG_TXT_FGPT'), width: '150', styleName: 'text-left' },
    { fieldName: 'alncmpCd', header: t('MSG_TXT_HSP'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdUswyCd', header: t('MSG_TXT_USWY_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'adrDtl', header: t('MSG_TXT_ADDR'), width: '350', styleName: 'text-left' },
    { fieldName: 'cnslMoCn', header: t('MSG_TXT_RCP_IZ'), width: '350', styleName: 'text-left' },
    { fieldName: 'svBizDclsf', header: t('MSG_TXT_WK_CNTN'), width: '100', styleName: 'text-center' },
    { fieldName: 'asRefriDvCd', header: t('MSG_TXT_AS_DIVIDE'), width: '100', styleName: 'text-center' },
    { fieldName: 'bsRefriDvCd', header: t('MSG_TXT_BS_DIVIDE'), width: '100', styleName: 'text-center' },
    { fieldName: 'istDt', header: t('MSG_TXT_INST_DT'), width: '150', styleName: 'text-center' },
    { fieldName: 'expireDt', header: t('MSG_TXT_EXN') + t('MSG_TXT_OBJ'), width: '80', styleName: 'text-center' },
    { fieldName: 'egerAsnDt', header: t('MSG_TXT_ASN_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'vstDt', header: t('MSG_TXT_VST_EXP_DT'), width: '200', styleName: 'text-center' },
    { fieldName: 'dtChange', header: t('MSG_TXT_CH'), width: '60', styleName: 'text-center' },
    { fieldName: 'cfrmDt', header: t('MSG_TXT_VST_CNFM_D'), width: '200', styleName: 'text-center' },
    { fieldName: 'dtmChRsonCd', header: t('MSG_TXT_CH_RSON'), width: '150', styleName: 'text-center' },
    { fieldName: 'dtmChRsonDtlCn', header: t('MSG_TXT_CH_RSON_DTL'), width: '150', styleName: 'text-left' },
    { fieldName: 'prtnrNm', header: t('MSG_TXT_EGER'), width: '150', styleName: 'text-left' },
    { fieldName: 'wkPrgsStat',
      header: t('MSG_TXT_PRGS_STATUS'),
      width: '100',
      styleName: 'text-right rg-button-link',
      renderer: {
        type: 'button',
      } },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout([
    'cntrNo',
    'sellTp',
    'istllKnm',
    'cstGd',
    'svTp',
    'wkPrgsStat',
    'tellNo',
    'phoneNo',
    'cntrDt',
    'sapMatCd',
    'pdctPdCd',
    'pdNm',
    'fgptNm',
    'alncmpCd',
    'pdUswyCd',
    'newAdrZip',
    'adrDtl',
    'cnslMoCn',
    'svBizDclsf',
    'asRefriDvCd',
    'bsRefriDvCd',
    'istDt',
    'expireDt',
    'egerAsnDt',
    'vstDt',
    'dtChange',
    'cfrmDt',
    'dtmChRsonCd',
    'dtmChRsonDtlCn',
    'prtnrNm',
  ]);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

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

    if (column === 'wkPrgsStat') {
      // 작업완료 모바일 팝업
      const cstSvAsnNo = g.getValue(itemIndex, 'cstSvAsnNo');
      const bypassPrtnrNo = g.getValue(itemIndex, 'prtnrNo');
      const svHshdNo = g.getValue(itemIndex, 'svHshdNo');
      const svHshdNoCnt = g.getValue(itemIndex, 'svHshdNoCnt');
      const svBizHclsfCd = g.getValue(itemIndex, 'svBizHclsfCd');
      const svBizDclsfCd = g.getValue(itemIndex, 'svBizDclsfCd');
      const wkPrgsStatCd = g.getValue(itemIndex, 'wkPrgsStatCd');
      const cntrNo = g.getValue(itemIndex, 'cntrNo');
      const cntrSn = g.getValue(itemIndex, 'cntrSn');

      const param = `cstSvAsnNo=${cstSvAsnNo}&bypassPrtnrNo=${bypassPrtnrNo}&svHshdNo=${svHshdNo}&svHshdNoCnt=${svHshdNoCnt}&svBizHclsfCd=${svBizHclsfCd}&svBizDclsfCd=${svBizDclsfCd}&wkPrgsStatCd=${wkPrgsStatCd}&cntrNo=${cntrNo}&cntrSn=${cntrSn}`;
      const redirectUrl = encodeURIComponent(`/popup/mobile/wmsnb-as-work-list?${param}`);

      let url = '';
      if (import.meta.env.MODE === 'dev') {
        url = 'https://d-m-wpm.kyowon.co.kr';
      } else if (import.meta.env.MODE === 'qa') {
        url = 'https://q-m-wpm.kyowon.co.kr';
      } else {
        url = 'https://m-wpm.kyowon.co.kr';
      }

      popupUtil.open(`${url}/certification/sso/login?redirectUrl=${redirectUrl}`);
    }
  };
}

</script>
<style scoped>
</style>
