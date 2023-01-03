<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC (배정관리)
 2. 프로그램 ID : WwsncResponsibleAreaPsicMgtM - 책임지역 담당자 관리
 3. 작성자 : hyewon.kim
 4. 작성일 : 2022.12.13
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 책임지역 담당자 관리 (http://localhost:3000/#/service/wwsnc-responsible-area-psic-mgt)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 우편번호 -->
        <kw-search-item :label="$t('MSG_TXT_ZIP')">
          <kw-input
            v-model="searchParams.zipFrom"
            type="text"
            maxlength="3"
            :regex="/^[0-9]*$/i"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.zipTo"
            type="text"
            maxlength="3"
            :regex="/^[0-9]*$/i"
          />
        </kw-search-item>
        <!-- 광역시/도 -->
        <kw-search-item :label="$t('MSG_TXT_MGPO')">
          <kw-select
            v-model="searchParams.ctpvNm"
            :options="ctpvs"
            first-option="all"
            option-label="ctpv"
            option-value="ctpvNm"
            @update:model-value="onUpdateCtcty"
          />
        </kw-search-item>
        <!-- 시군구 -->
        <kw-search-item :label="$t('MSG_TXT_CTCTY')">
          <kw-select
            v-model="searchParams.ctctyNm"
            :options="ctctys"
            first-option="all"
            option-label="ctcty"
            option-value="ctctyNm"
          />
        </kw-search-item>
        <!-- 서비스센터 -->
        <kw-search-item :label="$t('MSG_TXT_SV_CNR')">
          <kw-select
            v-model="searchParams.ogId"
            :options="serviceCenter"
            first-option="all"
            option-label="ogNm"
            option-value="ogCd"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!-- 작업그룹 -->
        <kw-search-item :label="$t('MSG_TXT_WK_GRP')">
          <kw-select
            v-model="searchParams.wkGrpCd"
            :options="codes.WK_GRP_CD"
          />
        </kw-search-item>
        <!-- 적용일자 -->
        <kw-search-item :label="$t('MSG_TXT_APPLY_DT')">
          <kw-date-picker v-model="searchParams.applyDate" />
        </kw-search-item>
        <!-- 지역코드 -->
        <kw-search-item :label="$t('MSG_TXT_LOCARA_CD')">
          <kw-input
            v-model="searchParams.rpbLocaraCdFrom"
            type="text"
            maxlength="4"
            :regex="/^[0-9A-Za-z]*$/i"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.rpbLocaraCdTo"
            type="text"
            maxlength="4"
            :regex="/^[0-9A-Za-z]*$/i"
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
            @change="fetchData"
          />
        </template>

        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <!-- 책임사번 일괄입력 -->
        <kw-input
          v-model="baseInfo.ichrPrtnrNo"
          dense
          type="text"
          maxlength="5"
          :regex="/^[0-9]*$/i"
        />
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_RPB_EMPNO_BLK_IN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickEmpNoBulkApply"
        />
        <!-- 적용일자 일괄입력 -->
        <kw-date-range-picker
          v-model:from="baseInfo.applyDateFrom"
          v-model:to="baseInfo.applyDateTo"
          dense
        />
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_APY_DT_BLK_IN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickApplyDateBulkApply"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
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
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import useSnCode from '~sms-wells/service/composables/useSnCode';
import dayjs from 'dayjs';

const { getDistricts, getServiceCenterOrgs, getWorkingEngineers } = useSnCode();

const { t } = useI18n();
const dataService = useDataService();

const { getConfig } = useMeta();
const { notify } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  zipFrom: '',
  zipTo: '',
  ctpvNm: '',
  ctctyNm: '',
  ogId: '',
  wkGrpCd: '10',
  applyDate: dayjs().format('YYYYMMDD'),
  rpbLocaraCdFrom: '',
  rpbLocaraCdTo: '',
});

const baseInfo = ref({
  ichrPrtnrNo: '',
  applyDateFrom: '',
  applyDateTo: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'WK_GRP_CD',
  'LOCARA_VST_PRD_CD',
  'COD_YN',
);

const serviceCenter = await getServiceCenterOrgs();
const { G_ONLY_ENG: engineers } = await getWorkingEngineers();

const ctpvs = ref((await getDistricts('sido')).map((v) => ({ ctpv: v.ctpvNm, ctpvNm: v.ctpvNm, ctpvCd: v.fr2pLgldCd })));
const ctctys = ref((await getDistricts('guAll')).map((v) => ({ ctcty: v.ctctyNm, ctctyNm: v.ctctyNm })));
const cachedCtctys = cloneDeep(ctctys.value);

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/responsible-areas/person-in-charges/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: personInCharges, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(personInCharges);
  view.resetCurrent();

  if (pageInfo.value.totalCount === 0) {
    await notify(t('MSG_ALT_NO_INFO_SRCH'));
  }
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/responsible-areas/person-in-charges/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'rpbLocaraPersonInChargeList',
    timePostfix: true,
    exportData: res.data,
  });
}

async function onUpdateCtcty(val) {
  if (val) {
    const { ctpvCd } = ctpvs.value.find((v) => v.ctpvNm === val);
    ctctys.value = (await getDistricts('gu', ctpvCd)).map((v) => ({ ctcty: v.ctctyNm, ctctyNm: v.ctctyNm }));
  } else {
    ctctys.value = cachedCtctys;
  }
}

async function validateIsApplyRowExists() {
  const view = grdMainRef.value.getView();
  if (view.getCheckedItems().length === 0) {
    await notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return false;
  }
}

async function validateIchrPrtnrNo() {
  if (baseInfo.value.ichrPrtnrNo === '') {
    await notify(t('MSG_TXT_RPB_EMPNO_CONF'));
    return false;
  }
}

async function validateApplyDate() {
  if (baseInfo.value.applyDateFrom === '') {
    await notify(t('MSG_TXT_APY_DT_CONF'));
    return false;
  }

  if (baseInfo.value.applyDateTo === '') {
    await notify(t('MSG_TXT_APY_DT_CONF'));
    return false;
  }
}

function setPersonInChargeCellData(view, row, value, column) {
  const matchedEngineer = engineers.find((v) => v.codeId === value);
  if (matchedEngineer) {
    const { codeNm, ogNm } = matchedEngineer;
    view.setValue(row, `${column[0]}`, ogNm);
    view.setValue(row, `${column[1]}`, codeNm);
  }
}

// 책임사번 일괄입력
async function onClickEmpNoBulkApply() {
  if (await validateIchrPrtnrNo() === false) return;
  if (await validateIsApplyRowExists() === false) return;

  const view = grdMainRef.value.getView();

  for (let i = 0; i < view.getItemCount(); i += 1) {
    setPersonInChargeCellData(view, i, baseInfo.value.ichrPrtnrNo, ['ogNm', 'prtnrKnm']);
  }
}

// 적용일자 일괄입력
async function onClickApplyDateBulkApply() {
  if (await validateApplyDate() === false) return;
  if (await validateIsApplyRowExists() === false) return;

  const view = grdMainRef.value.getView();

  for (let i = 0; i < view.getItemCount(); i += 1) {
    view.setValue(i, 'apyStrtdt', baseInfo.value.applyDateFrom);
    view.setValue(i, 'apyEnddt', baseInfo.value.applyDateTo);
  }
}

async function onClickSave() {
  if (await validateIsApplyRowExists() === false) return;

  const view = grdMainRef.value.getView();

  if (!await gridUtil.alertIfIsNotModified(view)) {
    const changedRows = gridUtil.getChangedRowValues(view);

    const notMatched = changedRows.find((v) => {
      const matchedEngineer = engineers.find((x) => x.codeId === v.ichrPrtnrNo);
      return matchedEngineer === null;
    });

    if (notMatched) {
      await notify(t('MSG_TXT_RPB_EMPNO_CONF'));
      return;
    }

    await dataService.post('/sms/wells/service/responsible-areas/person-in-charges', changedRows);

    await notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'zipList' },
    { fieldName: 'hemdList' },
    { fieldName: 'mgtCnt', dataType: 'number' },
    { fieldName: 'wrkCnt', dataType: 'number' },
    { fieldName: 'rpbLocaraCd' },
    { fieldName: 'w1W3SatWrkYn' },
    { fieldName: 'apyStrtdt', dataType: 'datetime' },
    { fieldName: 'apyEnddt', dataType: 'datetime' },
    { fieldName: 'wkGrpCd' },
    { fieldName: 'ogNm' },
    { fieldName: 'ichrPrtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'ogNm1' },
    { fieldName: 'pprnIchrPrtnrNo1' },
    { fieldName: 'pprnIchrPrtnrKnm1' },
    { fieldName: 'ogNm2' },
    { fieldName: 'pprnIchrPrtnrNo2' },
    { fieldName: 'pprnIchrPrtnrKnm2' },
    { fieldName: 'ogNm3' },
    { fieldName: 'pprnIchrPrtnrNo3' },
    { fieldName: 'pprnIchrPrtnrKnm3' },
    { fieldName: 'ogNm4' },
    { fieldName: 'pprnIchrPrtnrNo4' },
    { fieldName: 'pprnIchrPrtnrKnm4' },
    { fieldName: 'ogNm5' },
    { fieldName: 'pprnIchrPrtnrNo5' },
    { fieldName: 'pprnIchrPrtnrKnm5' },
    { fieldName: 'rpbLocaraGrpCd' },
    { fieldName: 'vstDowValNm' },
    { fieldName: 'vstDowVal' },
    { fieldName: 'izSn' },
    { fieldName: 'rstrCndtUseYn' },
    { fieldName: 'udsnUseYn' },
    { fieldName: 'mmtAvLdtm' },
    { fieldName: 'locaraCenStruAdr' },
  ];

  const codeYn = codes.COD_YN.map((v) => v.codeId);
  const columns = [
    { fieldName: 'zipList', header: t('MSG_TXT_ZIP'), width: '100', styleName: 'text-left' },
    { fieldName: 'hemdList', header: t('MSG_TXT_LAWC_ADM'), width: '150' },
    { fieldName: 'mgtCnt', header: t('MSG_TXT_SV_ACC'), width: '100', styleName: 'text-left' },
    { fieldName: 'wrkCnt', header: t('MSG_TXT_MLMN_ACTCS'), width: '100', styleName: 'text-left' },
    { fieldName: 'rpbLocaraCd', header: t('MSG_TXT_LOCARA_CD'), width: '100', styleName: 'text-left' },
    { fieldName: 'w1W3SatWrkYn',
      header: t('MSG_TXT_SAT_IST_LOCARA'),
      width: '110',
      styleName: 'text-center',
      editable: true,
      editor: { type: 'list', labels: codeYn, values: codeYn },
    },
    { fieldName: 'apyStrtdt',
      header: t('MSG_TXT_APY_STRT_DAY'),
      width: '100',
      styleName: 'text-right',
      datetimeFormat: 'yyyy-MM-dd',
      editable: true,
      editor: { type: 'btdate' },
    },
    { fieldName: 'apyEnddt',
      header: t('MSG_TXT_APY_END_DAY'),
      width: '100',
      styleName: 'text-right',
      datetimeFormat: 'yyyy-MM-dd',
      editable: true,
      editor: { type: 'btdate' },
    },
    { fieldName: 'wkGrpCd',
      header: t('MSG_TXT_WK_GRP'),
      width: '100',
      styleName: 'text-center',
      lookupDisplay: true,
      lookupData: { value: 'codeId', label: 'codeName', list: codes.WK_GRP_CD },
    },
    { fieldName: 'ogNm', header: t('MSG_TXT_CENTER_DIVISION'), width: '99' },
    { fieldName: 'ichrPrtnrNo',
      header: t('MSG_TXT_RPB_PRTNR_NO'),
      width: '99',
      styleName: 'text-center',
      editable: true,
    },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_RPB_ICHR_NM'), width: '99' },
    { fieldName: 'ogNm1', header: t('MSG_TXT_PPRN_1_CNR'), width: '99' },
    { fieldName: 'pprnIchrPrtnrNo1', header: t('MSG_TXT_PPRN_1_EMPNO'), width: '99', styleName: 'text-center', editable: true },
    { fieldName: 'pprnIchrPrtnrKnm1', header: t('MSG_TXT_PPRN_ICHR_NAME_1'), width: '99' },
    { fieldName: 'ogNm2', header: t('MSG_TXT_PPRN_2_CNR'), width: '99' },
    { fieldName: 'pprnIchrPrtnrNo2', header: t('MSG_TXT_PPRN_2_EMPNO'), width: '99', styleName: 'text-center', editable: true },
    { fieldName: 'pprnIchrPrtnrKnm2', header: t('MSG_TXT_PPRN_ICHR_NAME_2'), width: '99' },
    { fieldName: 'ogNm3', header: t('MSG_TXT_PPRN_3_CNR'), width: '99' },
    { fieldName: 'pprnIchrPrtnrNo3', header: t('MSG_TXT_PPRN_3_EMPNO'), width: '99', styleName: 'text-center', editable: true },
    { fieldName: 'pprnIchrPrtnrKnm3', header: t('MSG_TXT_PPRN_ICHR_NAME_3'), width: '99' },
    { fieldName: 'ogNm4', header: t('MSG_TXT_PPRN_4_CNR'), width: '99' },
    { fieldName: 'pprnIchrPrtnrNo4', header: t('MSG_TXT_PPRN_4_EMPNO'), width: '99', styleName: 'text-center', editable: true },
    { fieldName: 'pprnIchrPrtnrKnm4', header: t('MSG_TXT_PPRN_ICHR_NAME_4'), width: '99' },
    { fieldName: 'ogNm5', header: t('MSG_TXT_PPRN_5_CNR'), width: '99' },
    { fieldName: 'pprnIchrPrtnrNo5', header: t('MSG_TXT_PPRN_5_EMPNO'), width: '99', styleName: 'text-center', editable: true },
    { fieldName: 'pprnIchrPrtnrKnm5', header: t('MSG_TXT_PPRN_ICHR_NAME_5'), width: '99' },
    { fieldName: 'rpbLocaraGrpCd', header: t('MSG_TXT_LOCARA_GRP_CD'), width: '99', styleName: 'text-center' },
    { fieldName: 'vstDowVal',
      header: t('MSG_TXT_VST_DOW'),
      width: '99',
      editable: true,
      editor: { type: 'dropdown' },
      lookupDisplay: true,
      lookupData: { value: 'codeId', label: 'codeName', list: codes.LOCARA_VST_PRD_CD },
    },
  ];

  const columnLayout = [
    'zipList',
    'hemdList',
    'mgtCnt',
    'wrkCnt',
    'rpbLocaraCd',
    'w1W3SatWrkYn',
    'apyStrtdt',
    'apyEnddt',
    'wkGrpCd',
    'ogNm',
    'ichrPrtnrNo',
    'prtnrKnm',
    'ogNm1',
    'pprnIchrPrtnrNo1',
    'pprnIchrPrtnrKnm1',
    'ogNm2',
    'pprnIchrPrtnrNo2',
    'pprnIchrPrtnrKnm2',
    'ogNm3',
    'pprnIchrPrtnrNo3',
    'pprnIchrPrtnrKnm3',
    'ogNm4',
    'pprnIchrPrtnrNo4',
    'pprnIchrPrtnrKnm4',
    'ogNm5',
    'pprnIchrPrtnrNo5',
    'pprnIchrPrtnrKnm5',
    'rpbLocaraGrpCd',
    'vstDowVal',
  ];

  view.setColumnLayout(columnLayout);

  data.setFields(fields);
  view.setColumns(columns);
  view.setFixedOptions({ colCount: 1 });

  view.checkBar.visible = true;
  view.setCheckableCallback(() => false);
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.onGetEditValue = async (grid, index, editResult) => {
    grid.checkItem(index.itemIndex, true);

    const regExp = /ichrPrtnrNo/gi;
    const matchedIndex = index.column.search(regExp);

    if (matchedIndex === 0) { // 책임담당사번
      setPersonInChargeCellData(grid, index.dataRow, editResult.value, ['ogNm', 'prtnrKnm']);
    } else if (matchedIndex > 0) { // 예비담당사번
      const columnSlices = index.column.split(regExp);
      const column = [`ogNm${columnSlices[1]}`, `pprnIchrPrtnrKnm${columnSlices[1]}`];

      setPersonInChargeCellData(grid, index.dataRow, editResult.value, column);
    }
  };
});
</script>
