<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSD
2. 프로그램 ID : WwpsdExcellentDivisionListM
3. 작성자 : Park Yesol
4. 작성일 : 2023.09.21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 우수사업부 현황
****************************************************************************************************
-->

<template>
  <kw-page>
    <kw-search
      ref="frmSearchRef"
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            :label="t('MSG_TXT_MGT_YNM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_OG_TP')"
          required
        >
          <kw-option-group
            v-model="searchParams.evlOgTpCd"
            type="radio"
            :label="t('MSG_TXT_OG_TP')"
            :options="codes.EVL_OG_TP_CD"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_RSB_DV')"
          required
        >
          <kw-select
            v-model="searchParams.evlDvCd"
            :options="evlDvList"
            :label="t('MSG_TXT_RSB_DV')"
            first-option="select"
            option-value="codeId"
            option-label="codeName"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_PERF_DV')"
          required
        >
          <kw-option-group
            v-model="searchParams.cntrPerfDvCd"
            type="radio"
            :options="codes.CNTR_PERF_DV_CD"
            required
            :label="t('MSG_TXT_PERF_DV')"
          />
        </kw-search-item>
        <kw-search-item
          label="당월그룹"
        >
          <kw-select
            v-model="searchParams.ctstGrpCd"
            :disable="(searchParams.evlDvCd==='M01'||searchParams.evlDvCd==='M02')"
            :options="ctstGrpCdList"
            first-option="select"
            option-value="ctstGrpCd"
            option-label="ctstGrpNm"
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
          v-permission:update
          :label="t('MSG_BTN_SAVE')"
          dense
          grid-action
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:update
          :label="`${t('MSG_TXT_CTST_GRP')} ${t('MSG_BTN_RGST')}`"
          primary
          dense
          @click="onclickContestGroupReg"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        :visible-rows="pageInfo.pageSize - 1"
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
import { getComponentType, useMeta, useDataService, useGlobal, defineGrid, codeUtil, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { getConfig } = useMeta();
const { modal, notify } = useGlobal();
const dataService = useDataService();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
// 공통코드로딩
const codes = await codeUtil.getMultiCodes(
  'EVL_OG_TP_CD',
  'EVL_DV_CD',
  'CNTR_PERF_DV_CD',
  'EVL_RSB_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
);
const evlDvList = ref([]);
const ctstGrpCdList = ref([]);

const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  evlOgTpCd: 'W02', // 조직유형
  cntrPerfDvCd: '1',
  evlDvCd: '',
  ctstGrpCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
let cachedParams;

const onClickExcelDownload = async () => {
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/competence/excellent-division/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
};

const configGrid = async (config) => {
  const view = grdMainRef.value.getView();
  const data = grdMainRef.value.getData();
  const fields = [
    { fieldName: 'baseYm' },
    { fieldName: 'evlOgTpCd' },
    { fieldName: 'ogCd' },
    { fieldName: 'ogNm' },
    { fieldName: 'ogId' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'evlDvCd' },
  ];

  const columns = [
    { fieldName: 'ogCd', header: '소속코드', width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'ogNm', header: '소속', width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'prtnrNo', header: '번호', width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'prtnrKnm', header: '성명', width: '100', styleName: 'text-center', editable: false },
  ];

  config.forEach((k) => {
    fields.push({ fieldName: k.fieldName, dataType: 'number' });
    if (k.dataType === 'rate') {
      columns.push({ fieldName: k.fieldName, header: k.colHeader, width: '100', styleName: 'text-right', suffix: ' %', editable: false });
    } else if (k.dataType === 'trg') {
      columns.push({ fieldName: k.fieldName, header: k.colHeader, width: '100', styleName: 'text-right', editable: true });
    } else {
      columns.push({ fieldName: k.fieldName, header: k.colHeader, width: '100', styleName: 'text-right', editable: false });
    }
  });

  data.setFields(fields);
  view.setColumns(columns);

  const header = ['ogNm', 'prtnrNo', 'prtnrKnm'];

  config.forEach((k) => {
    if (k.dvCd === '3' && k.num === 1) {
      header.push({
        header: k.evlAtcDvNm,
        direction: 'horizontal', // merge type
        items: [`${k.LEvlAtcDvCd}Trg`, `${k.LEvlAtcDvCd}Score`, `${k.LEvlAtcDvCd}Rate`],
      });
    } else if (k.dvCd === '1') {
      header.push(k.fieldName);
    }
  });
  view.setColumnLayout(header);
};

const fetchData = async () => {
  const res = await dataService.get('/sms/wells/competence/excellent-division/paging', { params: { ...cachedParams, ...pageInfo.value } });
  await configGrid(res.data.config);
  const { list, pageInfo: pagingResult } = res.data.result;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
};

const onClickSearch = async () => {
  pageInfo.value.pageIndex = 1;
  // 자동완성 검색조건 설정
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
};

const evaluateResponsibilityCdChang = async () => {
  evlDvList.value = codes.EVL_DV_CD.filter((v) => [searchParams.value.evlOgTpCd].includes(v.prtsCodeId));
};

const getContestGroupFetchData = async () => {
  const res = await dataService.get('/sms/wells/competence/excellent-division/contest', { params: { ...searchParams.value } });
  ctstGrpCdList.value = res.data;
};

const onclickContestGroupReg = async () => {
  const { result: isChanged } = await modal({
    component: 'WwpsdContestGroupRegP',
    componentProps: {
      evlOgTpCd: searchParams.value.evlOgTpCd,
      evlDvCd: searchParams.value.evlDvCd,
      baseYm: searchParams.value.baseYm,
    },
  });
  if (isChanged) {
    await fetchData();
  }
};

const onClickSave = async () => {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const changedRows = gridUtil.getChangedRowValues(view);
  const saveList = [];
  changedRows.forEach((row) => {
    // 그리드 컬럼중 목표 점수인 컬럼 추출
    const targets = Object.keys(row).filter((v) => v.indexOf('Trg') > -1);
    targets.forEach((col) => {
      saveList.push({
        baseYm: row.baseYm,
        ogId: row.ogId,
        evlOgTpCd: row.evlOgTpCd,
        prtnrNo: row.prtnrNo,
        evlDvCd: row.evlDvCd,
        evlAtcDvCd: col.substring(0, 3),
        trgBasePc: row[col],
      });
    });
  });
  await dataService.post('/sms/wells/competence/excellent-division', saveList);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
};

watch(() => [searchParams.value.evlOgTpCd], async () => {
  await evaluateResponsibilityCdChang();
});

watch(() => [searchParams.value.evlDvCd], async () => {
  if (!isEmpty(searchParams.value.evlDvCd) && (searchParams.value.evlDvCd === 'M01' || searchParams.value.evlDvCd === 'M02')) {
    searchParams.value.ctstGrpCd = '';
  } else if (!isEmpty(searchParams.value.evlDvCd)) {
    await getContestGroupFetchData();
  }
});

onMounted(async () => {
  await evaluateResponsibilityCdChang();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
  ];

  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
});
</script>
