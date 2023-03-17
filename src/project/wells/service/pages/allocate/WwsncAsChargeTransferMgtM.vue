<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC (배정관리)
2. 프로그램 ID : WwsncAsChargeTransferMgtM - a/s 담당자 이관
3. 작성자 : yeonghwa.cheon
4. 작성일 : 2023.03.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- a/s 담당자 이관 (http://localhost:3000/#/service/wwsnc-as-charge-transfer-mgt)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BLG')"
        >
          <kw-select
            v-model="searchVal.svCnrOgId"
            :options="svcCode"
            first-option="all"
            option-label="ogNm"
            option-value="ogCd"
            @update:model-value="onUpdateSvcCode1"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_EMPL_NM')"
        >
          <kw-select
            v-model="searchVal.ichrPrtnrNo"
            first-option="all"
            :options="engineers1"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ASN_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchVal.assignDateFrom"
            v-model:to="searchVal.assignDateTo"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_VST_CNFM_D')"
          :colspan="2"
        >
          <kw-date-picker
            v-model="searchVal.vstCnfmdt"
          />
          <kw-field
            v-model="searchVal.vstCnfmdtYn"
            class="ml8"
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
          :label="$t('MSG_TXT_WK_CLS')"
        >
          <kw-select
            v-model="searchVal.svBizHclsfCd"
            first-option="all"
            :options="codes.SV_BIZ_HCLSF_CD.filter((v) => v.codeId === '1' || v.codeId === '3')"
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
          secondary
          dense
          :label="$t('MSG_BTN_PRTG')"
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
          :label="$t('MSG_BTN_TF_HIST_INQR')"
          @click="onClickTransfetHistoryInquiry"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-select
          v-model="updateParams.svCnrOgId"
          dense
          :placeholder="$t('MSG_TXT_ANY_SELT',[$t('MSG_TXT_BLG')])"
          :options="svcCode"
          option-label="ogNm"
          option-value="ogCd"
          @update:model-value="onUpdateSvcCode2"
        />
        <kw-select
          v-model="updateParams.ichrPrtnrNo"
          dense
          :placeholder="$t('MSG_TXT_ANY_SELT',[$t('MSG_TXT_EMPL_NM')])"
          :options="engineers2"
          @update:model-value="onUpdateEngineers2"
        />
        <kw-btn
          primary
          dense
          :label="$t('MSG_BTN_PSIC_TF')"
          @click="onClickPsicTransfer"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="pageInfo.pageSize"
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
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import {
  codeUtil,
  defineGrid,
  getComponentType,
  useDataService,
  useMeta,
  gridUtil,
  useGlobal,
} from 'kw-lib';
import dayjs from 'dayjs';
import smsCommon from '~sms-wells/service/composables/useSnCode';
import { cloneDeep, replace } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const { router, currentRoute } = useRouter();
const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const {
  getServiceCenterOrgs,
  getWorkingEngineers,
} = smsCommon();

const {
  // modal,
  notify,
} = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();
const engineers = ref();
const engineers1 = ref();
const engineers2 = ref();
/* 공통코드 가져오기 */
/* TODO:svCode, wrkEng에 ogCd로 조회중인데, ogId로 바뀌어야되는듯. */
/* TODO: wrkEng에서 ogId값이 없음. -> 추가되면 ogId로 변경 */
const svcCode = await getServiceCenterOrgs();
const wrkEng = ((await getWorkingEngineers('G_ONLY_ENG')).G_ONLY_ENG).map((v) => ({ codeId: v.codeId, codeName: v.codeNm1, ogCd: v.ogCd }));
engineers.value = wrkEng;
engineers1.value = engineers.value;
engineers2.value = engineers.value;

/* 조회조건 */
const searchVal = ref({
  svCnrOgId: '',
  ichrPrtnrNo: '',
  assignDateFrom: `${now.format('YYYYMM')}01`,
  assignDateTo: now.format('YYYYMMDD'),
  vstCnfmdt: now.format('YYYYMMDD'),
  vstCnfmdtYn: 'N',
  svBizHclsfCd: '',
});

const searchParams = ref({
  svCnrOgId: '',
  ichrPrtnrNo: '',
  assignDateFrom: '',
  assignDateTo: '',
  vstCnfmdt: '',
  svBizHclsfCd: '',
});

const updateParams = ref({
  svCnrOgId: '',
  ichrPrtnrNo: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'SV_BIZ_HCLSF_CD',
  'TF_AK_RSON_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

let cachedParams;

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/service/as-transfers/excel-download', { params: cachedParams });

  const exportLayout = [
    'cntrNo',
    'rcgvpKnm',
    'sellTpNm',
    'sapMatCd',
    'basePdCd',
    'pdAbbrNm',
    'wkDvNm',
    'ctpvNm',
    'ctctyNm',
    'amtdNm',
    'ctpvCtctyNm',
    'cnslMoCn',
    'newAdrZip',
    'adr',
    'alncDvNm',
    'dtmChCausNm',
    'dtmChRsonNm',
    'dtmChRsonDtlCn',
    'tno',
    'mpno',
    'mtrStatNm',
    'wkPrgsDvNm',
    'vstCnfmDtm',
    'asnDtm',
    'rcst',
    {
      header: t('MSG_TXT_PSIC_BF_TF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['bfchBlgNm', 'bfchEmpno', 'bfchFnm'],
    },
    {
      header: t('MSG_TXT_PSIC_AF_TF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['afchBlgNm', 'afchEmpno', 'afchFnm'],
    },
    {
      header: t('MSG_TXT_TF_REQ_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['tfDt', 'tfRsonNm', 'tfBlgNm', 'tfFnm'],
    },
  ];

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
    exportLayout,
  });
}

function onClickTransfetHistoryInquiry() {
  // TODO: 이관이력조회팝업(W-SV-U-0019P01) 개발전. 개발 후 수정.
  router.push({
    path: '/service/wwsnc-responsible-area-code-mgt',
    // query: {
    //   value: 'value1'
    // },
  });
}

function setEngineers1() {
  if (searchVal.value.svCnrOgId === '') {
    engineers1.value = engineers.value;
    return;
  }
  engineers1.value = wrkEng.filter((v) => v.ogCd === searchVal.value.svCnrOgId);
}

function setEngineers2() {
  if (updateParams.value.svCnrOgId === '') {
    engineers2.value = engineers.value;
    return;
  }
  engineers2.value = wrkEng.filter((v) => v.ogCd === updateParams.value.svCnrOgId);
}

async function onUpdateSvcCode1() {
  searchVal.value.ichrPrtnrNo = '';
  setEngineers1();
}

async function onUpdateSvcCode2() {
  updateParams.value.ichrPrtnrNo = '';
  setEngineers2();

  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  chkRows.forEach((v) => {
    view.setValue(v.dataRow, 'afchBlgNm', updateParams.value.svCnrOgId);
  });
}

async function onUpdateEngineers2() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  chkRows.forEach((v) => {
    view.setValue(v.dataRow, 'afchFnm', updateParams.value.ichrPrtnrNo);
  });
}

/* TODO: 임시데이터로 조회하게 해놓음. 조회조건 (소속 : 수원지점/의정부지점, ) */
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-transfers/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: asInfos, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(asInfos);
  view.resetCurrent();
}
async function onClickSearch() {
  if (searchVal.value.vstCnfmdtYn === 'Y') {
    if (!searchVal.value.vstCnfmdt) {
      notify(t('MSG_ALT_NCELL_REQUIRED_VAL', [t('MSG_TXT_VST_CNFM_D')]));
      return;
    }
    searchParams.value = {
      svCnrOgId: '',
      ichrPrtnrNo: '',
      assignDateFrom: '',
      assignDateTo: '',
      vstCnfmdt: searchVal.value.vstCnfmdt,
      svBizHclsfCd: '',
    };
  } else {
    if (!searchVal.value.assignDateFrom || !searchVal.value.assignDateTo) {
      notify(t('MSG_ALT_NCELL_REQUIRED_VAL', [t('MSG_TXT_ASN_DT')]));
      return;
    }
    searchParams.value = {
      svCnrOgId: searchVal.value.svCnrOgId,
      ichrPrtnrNo: searchVal.value.ichrPrtnrNo,
      assignDateFrom: searchVal.value.assignDateFrom,
      assignDateTo: searchVal.value.assignDateTo,
      vstCnfmdt: '',
      svBizHclsfCd: searchVal.value.svBizHclsfCd,
    };
  }
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickPsicTransfer() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);
  let flag = true;

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  chkRows.forEach((v) => {
    if (v.rowState === 'none') {
      if (!updateParams.value.ichrPrtnrNo || !updateParams.value.svCnrOgId) {
        notify(t('MSG_ALT_IS_SELCT', [t('MSG_TXT_BLG')]));
        flag = false;
        return false;
      }
    }
  });

  if (flag) {
    await dataService.post('/sms/wells/service/as-transfers', chkRows);
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

function setAfchEmpno(grid, itemIndex, field) {
  const { afchFnm } = grid.getValues(itemIndex);
  const changedFieldName = grid.getDataSource().getOrgFieldName(field);

  if (changedFieldName === 'afchFnm') {
    // 이름 바뀌면, 그 앞 필드 번호 부분 매핑. optionValue 가져와서 넣어줌?
    grid.setValue(itemIndex, 'afchEmpno', afchFnm);
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
/* lookupTree 세팅 */
  const lookupTreeMainCodes = { id: 'lookupTreeMainCodes', levels: 1, keys: [], values: [] };
  const lookupTreeSubCodes = { id: 'lookupTreeSubCodes', levels: 2, tags: [], keys: [], values: [] };

  svcCode.forEach((codeObj) => {
    lookupTreeMainCodes.keys.push(codeObj.ogCd);
    lookupTreeMainCodes.values.push(codeObj.ogNm);
  });

  engineers.value.forEach((codeObj) => {
    lookupTreeSubCodes.tags.push(codeObj.codeId);
    lookupTreeSubCodes.keys.push([codeObj.ogCd, codeObj.codeId]);
    lookupTreeSubCodes.values.push(codeObj.codeName);
  });
  view.addLookupSource(lookupTreeSubCodes);

  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'rcgvpKnm' },
    { fieldName: 'sellTpNm' },
    { fieldName: 'sapMatCd' },
    { fieldName: 'basePdCd' },
    { fieldName: 'pdAbbrNm' },
    { fieldName: 'wkDvNm' },
    { fieldName: 'ctpvNm' },
    { fieldName: 'ctctyNm' },
    { fieldName: 'amtdNm' },
    { fieldName: 'ctpvCtctyNm' },
    { fieldName: 'cnslMoCn' },
    { fieldName: 'newAdrZip' },
    { fieldName: 'adr' },
    { fieldName: 'alncDvNm' },
    { fieldName: 'dtmChCausNm' },
    { fieldName: 'dtmChRsonNm' },
    { fieldName: 'dtmChRsonDtlCn' },
    { fieldName: 'tno' },
    { fieldName: 'mpno' },
    { fieldName: 'mtrStatNm' },
    { fieldName: 'wkPrgsDvNm' },
    { fieldName: 'vstCnfmDtm' },
    { fieldName: 'asnDtm' },
    { fieldName: 'rcst' },
    { fieldName: 'bfchBlgNm' },
    { fieldName: 'bfchEmpno' },
    { fieldName: 'bfchFnm' },
    { fieldName: 'afchBlgCd' },
    { fieldName: 'afchBlgNm' },
    { fieldName: 'afchEmpno' },
    { fieldName: 'afchFnm' },
    { fieldName: 'afchBlgCdOrigin' },
    { fieldName: 'afchBlgNmOrigin' },
    { fieldName: 'afchEmpnoOrigin' },
    { fieldName: 'afchFnmOrigin' },
    { fieldName: 'tfDt' },
    { fieldName: 'tfRsonNm' },
    { fieldName: 'tfBlgNm' },
    { fieldName: 'tfFnm' },
  ];

  const columns = [
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_NO'),
      width: '150',
      styleName: 'text-center rg-button-link',
      renderer: {
        type: 'button',
      },
    },
    {
      fieldName: 'rcgvpKnm',
      header: t('MSG_TXT_CST_NM'),
      width: '100',
    },
    {
      fieldName: 'sellTpNm',
      header: t('TXT_MSG_SELL_TP_CD'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'sapMatCd',
      header: `SAP${t('MSG_TXT_CODE')}`,
      width: '200',
      styleName: 'text-center',
    },
    {
      fieldName: 'basePdCd',
      header: t('MSG_TXT_ITM_CD'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'pdAbbrNm',
      header: t('MSG_TXT_PRDT_NM'),
      width: '100',
    },
    {
      fieldName: 'wkDvNm',
      header: t('MSG_TXT_WK_CLS'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'ctpvNm',
      header: t('MSG_TXT_CTPV_NM'),
      width: '100',
      visible: false,
    },
    {
      fieldName: 'ctctyNm',
      header: t('MSG_TXT_CTCTY_NM'),
      width: '100',
      visible: false,
    },
    {
      fieldName: 'amtdNm',
      header: t('MSG_TXT_AMTD_NM'),
      width: '100',
      visible: false,
    },
    {
      fieldName: 'ctpvCtctyNm',
      header: t('MSG_TXT_CTPV_CTCTY_NM'),
      width: '250',
      displayCallback: (grid, index) => {
        const ctpvNm = gridUtil.getCellValue(grid, index.dataRow, 'ctpvNm');
        const ctctyNm = (gridUtil.getCellValue(grid, index.dataRow, 'ctctyNm'));
        const amtdNm = (gridUtil.getCellValue(grid, index.dataRow, 'amtdNm'));
        const tot = `${replace(ctpvNm, null, ' ')} ${replace(ctctyNm, null, ' ')} ${replace(amtdNm, null, ' ')}`;

        return tot;
      },
    },
    {
      fieldName: 'cnslMoCn',
      header: t('MSG_TXT_RCP_IZ'),
      width: '250',
    },
    {
      fieldName: 'newAdrZip',
      header: t('MSG_TXT_ZIP'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'adr',
      header: t('MSG_TXT_ADDR'),
      width: '250',
    },
    {
      fieldName: 'alncDvNm',
      header: t('MSG_TXT_ALNC'),
      width: '100',
    },
    {
      fieldName: 'dtmChCausNm',
      header: t('MSG_TXT_CH_CAUS'),
      width: '100',
    },
    {
      fieldName: 'dtmChRsonNm',
      header: t('MSG_TXT_CHG_RSN'),
      width: '100',
    },
    {
      fieldName: 'dtmChRsonDtlCn',
      header: t('MSG_TXT_CHG_RSN', [t('MSG_TXT_DTL')]),
      width: '200',
    },
    {
      fieldName: 'tno',
      header: t('MSG_TXT_CONTACT'),
      width: '150',
    },
    {
      fieldName: 'mpno',
      header: t('MSG_TXT_MPNO'),
      width: '150',
    },
    {
      fieldName: 'mtrStatNm',
      header: t('MSG_TXT_WK_STS'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'wkPrgsDvNm',
      header: t('MSG_TXT_PRGS_DV'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'vstCnfmDtm',
      header: t('MSG_TXT_VST_CNFM_DT'),
      width: '150',
      styleName: 'text-center',
      datetimeFormat: 'time',
    },
    {
      fieldName: 'asnDtm',
      header: t('MSG_TXT_ASN_DT'),
      width: '150',
      styleName: 'text-center',
      datetimeFormat: 'date',
    },
    {
      fieldName: 'rcst',
      header: t('MSG_TXT_RCST'),
      width: '100',
    },
    {
      fieldName: 'bfchBlgNm',
      header: t('MSG_TXT_BLG'),
      width: '150',
    },
    {
      fieldName: 'bfchEmpno',
      header: t('MSG_TXT_EPNO'),
      width: '100',
      styleName: 'text-center ',
    },
    {
      fieldName: 'bfchFnm',
      header: t('MSG_TXT_EMPL_NM'),
      width: '100',
    },
    {
      fieldName: 'afchBlgNm',
      header: t('MSG_TXT_BLG'),
      width: '150',
      lookupDisplay: true,
      values: lookupTreeMainCodes.keys,
      labels: lookupTreeMainCodes.values,
      editor: { type: 'dropdown' },
      editable: true,
      rules: 'required',
    },
    {
      fieldName: 'afchEmpno',
      header: t('MSG_TXT_EPNO'),
      width: '100',
      styleName: 'text-center ',
    },
    {
      fieldName: 'afchFnm',
      header: t('MSG_TXT_EMPL_NM'),
      width: '100',
      lookupDisplay: true,
      lookupSourceId: 'lookupTreeSubCodes',
      lookupKeyFields: ['afchBlgNm', 'afchFnm'],
      editor: { type: 'dropdown' },
      editable: true,
      rules: 'required',
      // styleCallback: (grid, dataCell) => {
      //   const afchBlgNm = gridUtil.getCellValue(grid, dataCell.index.itemIndex, 'afchBlgNm');
      //   const { ogCd } = svcCode.filter((v) => v.ogNm === afchBlgNm)[0];
      //   const afchFnm = wrkEng.filter((v) => v.ogCd === ogCd);

      // eslint-disable-next-line max-len
      //   return { editor: { type: 'list', labels: afchFnm.map((v) => v.codeName), values: afchFnm.map((v) => v.codeId) }, editable: true };
      // },
    },
    {
      fieldName: 'tfDt',
      header: t('MSG_TXT_TF_DT'),
      width: '150',
      styleName: 'text-center ',
    },
    {
      fieldName: 'tfRsonNm',
      header: t('MSG_TXT_TF_RSON'),
      width: '150',
    },
    {
      fieldName: 'tfBlgNm',
      header: t('MSG_TXT_BLG'),
      width: '150',
    },
    {
      fieldName: 'tfFnm',
      header: t('MSG_TXT_EMPL_NM'),
      width: '100',
    },
  ];

  const columnLayout = [
    'cntrNo',
    'rcgvpKnm',
    'sellTpNm',
    'sapMatCd',
    'basePdCd',
    'pdAbbrNm',
    'wkDvNm',
    'ctpvNm',
    'ctctyNm',
    'amtdNm',
    'ctpvCtctyNm',
    'cnslMoCn',
    'newAdrZip',
    'adr',
    'alncDvNm',
    'dtmChCausNm',
    'dtmChRsonNm',
    'dtmChRsonDtlCn',
    'tno',
    'mpno',
    'mtrStatNm',
    'wkPrgsDvNm',
    'vstCnfmDtm',
    'asnDtm',
    'rcst',
    {
      header: t('MSG_TXT_PSIC_BF_TF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['bfchBlgNm', 'bfchEmpno', 'bfchFnm'],
    },
    {
      header: t('MSG_TXT_PSIC_AF_TF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['afchBlgNm', 'afchEmpno', 'afchFnm'],
    },
    {
      header: t('MSG_TXT_TF_REQ_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['tfDt', 'tfRsonNm', 'tfBlgNm', 'tfFnm'],
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  data.onValueChanged = (provider, itemIndex, field) => {
    setAfchEmpno(view, itemIndex, field);
  };

  view.onCellEdited = async (grid, itemIndex, row, field) => {
    grid.checkItem(itemIndex, true);
    setAfchEmpno(grid, itemIndex, field);
  };
});

</script>
