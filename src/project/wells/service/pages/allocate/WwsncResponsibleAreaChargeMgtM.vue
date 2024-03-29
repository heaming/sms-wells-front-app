<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC (배정관리)
 2. 프로그램 ID : WwsncResponsibleAreaChargeMgtM - 책임지역 담당자 관리
 3. 작성자 : hyewon.kim
 4. 작성일 : 2022.12.13
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 책임지역 담당자 관리 (http://localhost:3000/#/service/wwsnc-responsible-area-charge-mgt)
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
        <kw-search-item
          :label="$t('MSG_TXT_ZIP')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.zipFrom"
            type="text"
            mask="#####"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.zipTo"
            type="text"
            mask="#####"
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
      </kw-search-row>

      <kw-search-row>
        <!-- 서비스센터 -->
        <kw-search-item :label="$t('MSG_TXT_SV_CNR')">
          <kw-select
            v-model="searchParams.ogCd"
            :options="serviceCenters"
            first-option="all"
            option-label="ogNm"
            option-value="ogCd"
          />
        </kw-search-item>
        <!-- 작업그룹 -->
        <kw-search-item
          :label="$t('MSG_TXT_WK_GRP')"
          required
        >
          <kw-select
            v-model="searchParams.wkGrpCd"
            :options="codes.WK_GRP_CD"
            :label="$t('MSG_TXT_WK_GRP')"
            rules="required"
          />
        </kw-search-item>
        <!-- 적용일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_APPLY_DT')"
          required
        >
          <kw-date-picker
            v-model="searchParams.applyDate"
            :label="$t('MSG_TXT_APPLY_DT')"
            rules="date_range_required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 지역코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_LOCARA_CD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.rpbLocaraCdFrom"
            type="text"
            mask="NNNN"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.rpbLocaraCdTo"
            type="text"
            mask="NNNN"
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

        <!-- 저장 -->
        <kw-btn
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
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
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
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
import { cloneDeep, isEmpty } from 'lodash-es';
import useSnCode from '~sms-wells/service/composables/useSnCode';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

const { getDistricts } = useSnCode();

const { t } = useI18n();
const { notify } = useGlobal();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();

const dataService = useDataService();

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
  ogCd: '',
  wkGrpCd: '10',
  applyDate: dayjs().format('YYYYMMDD'),
  rpbLocaraCdFrom: '',
  rpbLocaraCdTo: '',
});

const baseInfo = ref({
  ichrPrtnrNo: '',
  applyDateFrom: '',
  applyDateTo: '99991231',
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

const { data: serviceCenters } = await dataService.get('/sms/wells/service/organizations/service-center');
const { data: engineers } = await dataService.get('/sms/wells/service/organizations/engineer');

const ctpvs = ref([]);
const ctctys = ref([]);
ctpvs.value = (await getDistricts('sido')).map((v) => ({ ctpv: v.ctpvNm, ctpvNm: v.ctpvNm, ctpvCd: v.fr2pLgldCd }));

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/responsible-area-charges/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: personInCharges, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(personInCharges);
  view.resetCurrent();

  baseInfo.value.ichrPrtnrNo = '';
  baseInfo.value.applyDateFrom = '';
  baseInfo.value.applyDateTo = '99991231';
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/responsible-area-charges/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onUpdateCtcty(val) {
  searchParams.value.ctctyNm = '';
  if (val) {
    const { ctpvCd } = ctpvs.value.find((v) => v.ctpvNm === val);
    ctctys.value = (await getDistricts('gu', ctpvCd)).map((v) => ({ ctcty: v.ctctyNm, ctctyNm: v.ctctyNm }));
  } else {
    ctctys.value = [];
  }
}

function validateIsApplyRowExists() {
  const view = grdMainRef.value.getView();
  if (view.getCheckedItems().length === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return false;
  }
  return true;
}

function validateApplyDate() {
  if (baseInfo.value.applyDateFrom === '') {
    notify(t('MSG_TXT_APY_DT_CONF'));
    return false;
  }

  if (baseInfo.value.applyDateTo === '') {
    notify(t('MSG_TXT_APY_DT_CONF'));
    return false;
  }

  return true;
}

function validateToday(val) {
  const today = dayjs().format('YYYYMMDD');
  if (dayjs(val).isSameOrBefore(today)) {
    notify(t('MSG_ALT_APY_STRT_D_CONF_FUR_DT'));
    return false;
  }
  return true;
}

function validateGridApplyDate() {
  const view = grdMainRef.value.getView();
  const changedRows = gridUtil.getChangedRowValues(view, true);

  for (let i = 0; i < changedRows.length; i += 1) {
    const { apyStrtdt, dataRow } = changedRows[i];
    const originApyStrtdt = gridUtil.getOrigCellValue(view, dataRow, 'apyStrtdt');

    if (originApyStrtdt === apyStrtdt) {
      notify(t('MSG_ALT_APY_STRT_D_CH_NCST'));
      return false;
    }

    if (!validateToday(apyStrtdt)) return false;
  }

  return true;
}

function setPersonInChargeCellData(view, row, value, column) {
  const matchedEngineer = engineers.find((v) => v.prtnrNo === value);
  if (matchedEngineer) {
    const { ogTpCd, prtnrNm, ogNm } = matchedEngineer;
    view.setValue(row, `${column[0]}`, ogTpCd);
    view.setValue(row, `${column[1]}`, ogNm);
    view.setValue(row, `${column[2]}`, value);
    view.setValue(row, `${column[3]}`, prtnrNm);
  } else {
    view.setValue(row, `${column[0]}`, '');
    view.setValue(row, `${column[1]}`, '');
    view.setValue(row, `${column[2]}`, '');
    view.setValue(row, `${column[3]}`, '');
    notify(t('MSG_ALT_EQ_EGER_NTHNG'));
  }
  view.commit();
}

// 적용일자 일괄입력
async function onClickApplyDateBulkApply() {
  if (!validateApplyDate()) return;
  if (!validateIsApplyRowExists()) return;
  if (!validateToday(baseInfo.value.applyDateFrom)) return;

  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  for (let i = 0; i < checkedRows.length; i += 1) {
    view.setValue(view.getItemIndex(checkedRows[i].dataRow), 'apyStrtdt', baseInfo.value.applyDateFrom);
    view.setValue(view.getItemIndex(checkedRows[i].dataRow), 'apyEnddt', baseInfo.value.applyDateTo);
  }
  view.commit();
}

async function onClickSave() {
  if (!validateIsApplyRowExists()) return;
  if (!validateGridApplyDate()) return;

  const view = grdMainRef.value.getView();

  if (!await gridUtil.alertIfIsNotModified(view)) {
    const changedRows = gridUtil.getChangedRowValues(view);
    const isNotMatched = changedRows.find((v) => isEmpty(v.ichrPrtnrNo));

    if (isNotMatched) {
      notify(t('MSG_TXT_RPB_EMPNO_CONF'));
      return;
    }

    await dataService.post('/sms/wells/service/responsible-area-charges', changedRows);

    notify(t('MSG_ALT_SAVE_DATA'));
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
    { fieldName: 'satWrkYn' },
    { fieldName: 'apyStrtdt', dataType: 'datetime' },
    { fieldName: 'apyEnddt', dataType: 'datetime' },
    { fieldName: 'wkGrpCd' },
    { fieldName: 'ogTpCd' },
    { fieldName: 'ogNm' },
    { fieldName: 'ichrPrtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'pprnIchrPrtnrOgTpCd' },
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
    { fieldName: 'vstDowVal' },
    { fieldName: 'izSn', dataType: 'number' },
    { fieldName: 'rstrCndtUseYn' },
    { fieldName: 'udsnUseYn' },
    { fieldName: 'mmtAvLdtm', dataType: 'number' },
    { fieldName: 'locaraCenStruAdr' },
  ];

  const codeYn = codes.COD_YN.map((v) => v.codeId);
  const columns = [
    { fieldName: 'zipList', header: t('MSG_TXT_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'hemdList', header: t('MSG_TXT_LAWC_ADM'), width: '150' },
    { fieldName: 'mgtCnt', header: t('MSG_TXT_SV_ACC'), width: '100', styleName: 'text-right' },
    { fieldName: 'wrkCnt', header: t('MSG_TXT_MLMN_ACTCS'), width: '100', styleName: 'text-right' },
    { fieldName: 'rpbLocaraCd', header: t('MSG_TXT_LOCARA_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'satWrkYn',
      header: t('MSG_TXT_SAT_IST_LOCARA'),
      width: '110',
      styleName: 'text-center',
      editable: true,
      editor: { type: 'list', labels: codeYn, values: codeYn },
    },
    { fieldName: 'apyStrtdt',
      header: t('MSG_TXT_APY_STRT_DAY'),
      width: '125',
      styleName: 'text-center',
      datetimeFormat: 'date',
      editable: true,
      editor: { type: 'btdate' },
    },
    { fieldName: 'apyEnddt',
      header: t('MSG_TXT_APY_END_DAY'),
      width: '125',
      styleName: 'text-center',
      datetimeFormat: 'date',
      editable: true,
      editor: { type: 'btdate' },
    },
    { fieldName: 'wkGrpCd',
      header: t('MSG_TXT_WK_GRP'),
      width: '100',
      styleName: 'text-center',
      options: codes.WK_GRP_CD,
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
    { fieldName: 'rpbLocaraGrpCd',
      header: t('MSG_TXT_LOCARA_GRP_CD'),
      width: '99',
      styleName: 'text-center',
      editable: true,
    },
    { fieldName: 'vstDowVal',
      header: t('MSG_TXT_VST_DOW'),
      width: '130',
      editable: true,
      editor: { type: 'list' },
      options: codes.LOCARA_VST_PRD_CD,
    },
  ];

  const columnLayout = [
    'zipList',
    'hemdList',
    'mgtCnt',
    'wrkCnt',
    'rpbLocaraCd',
    'satWrkYn',
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

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);

  view.setFixedOptions({ colCount: 1 });

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.onGetEditValue = async (grid, index, editResult) => {
    grid.checkItem(index.itemIndex, true);

    if (index.column === 'apyStrtdt') {
      if (!validateToday(editResult.value)) return;
    }

    if (index.column.includes('PrtnrNo')) {
      const regExp = /ichrPrtnrNo/gi;
      const matchedIndex = index.column.search(regExp);

      if (matchedIndex === 0) { // 책임담당사번
        setPersonInChargeCellData(grid, index.itemIndex, editResult.value, ['ogTpCd', 'ogNm', 'ichrPrtnrNo', 'prtnrKnm']);
      } else if (matchedIndex > 0) { // 예비담당사번
        const columnSlices = index.column.split(regExp);
        const column = ['pprnIchrPrtnrOgTpCd', `ogNm${columnSlices[1]}`, `pprnIchrPrtnrNo4${columnSlices[1]}`, `pprnIchrPrtnrKnm${columnSlices[1]}`];

        setPersonInChargeCellData(grid, index.itemIndex, editResult.value, column);
      }
    }
  };
});
</script>
