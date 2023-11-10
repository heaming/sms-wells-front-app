<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA
 2. 프로그램 ID : WwsnaEngineerToolDsbMgtM - 엔지니어 공구 이력관리
 3. 작성자 : seungsoo.kim
 4. 작성일 : 2023.03.28
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 엔지니어에게 지급하는 공구 지급 이력 관리
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_BASE_YM')">
          <kw-date-picker
            v-model="searchParams.pymdt"
            type="month"
          />
        </kw-search-item>
        <wwsn-engineer-og-search-item-group
          v-model:dgr1-levl-og-id="searchParams.ogId"
          dgr1-levl-og-first-option="all"
          partner-first-option="all"
          use-og-level="1"
          :use-partner="false"
        />
        <kw-search-item :label="$t('MSG_TXT_EPNO')">
          <kw-input
            v-model="searchParams.egerPrtnrNo"
            :label="$t('MSG_TXT_EPNO')"
            rules="numeric|max:10"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_EMPL_NM')">
          <kw-input
            v-model="searchParams.prtnrKnm"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.toolPdCdStrt"
            upper-case
            rules="alpha_num|max:10"
            :label="$t('MSG_TXT_ITM_CD')"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.toolPdCdEnd"
            upper-case
            rules="alpha_num|max:10"
            :label="$t('MSG_TXT_ITM_CD')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SAP_CD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.sapMatCdStrt"
            rules="numeric|max:18"
            :label="$t('MSG_TXT_SAP_CD')"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.sapMatCdEnd"
            rules="numeric|max:18"
            :label="$t('MSG_TXT_SAP_CD')"
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
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:delete
          :label="$t('MSG_BTN_RECT_DSB_IZ_DL')"
          secondary
          dense
          @click="onClickRechDsbIzDl"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:create
          :label="$t('MSG_BTN_TOOL_DSB')"
          primary
          dense
          @click="onClickToolDsb"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
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

import { useMeta, getComponentType, defineGrid, codeUtil, useGlobal, useDataService, gridUtil } from 'kw-lib';
// import useSnCode from '~sms-wells/service/composables/useSnCode';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import WwsnEngineerOgSearchItemGroup from '~sms-wells/service/components/WwsnEngineerOgSearchItemGroup.vue';

// const { getAllEngineers } = useSnCode();
const { currentRoute } = useRouter();
const { getConfig } = useMeta();
const { modal, notify, confirm } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  pymdt: dayjs().format('YYYYMM'),
  ogId: '',
  egerPrtnrNo: '',
  prtnrKnm: '',
  toolPdCdStrt: '',
  toolPdCdEnd: '',
  sapMatCdStrt: '',
  sapMatCdEnd: '',
});

let cachedParams;

// const centers = ((await getAllEngineers()).G_ONLY_SVC);
// const centersByOgLevlDvCd = centers.filter((v) => v.ogTpCd === 'W06' && v.ogLevlDvCd === '2');
// const svcCenters = centersByOgLevlDvCd.map((v) => ({ codeName: v.ogNm, codeId: v.ogId }));

async function setPymdtColumns(toolHist) {
  const view = grdMainRef.value.getView();
  const data = grdMainRef.value.getData();

  let fldName;
  let headerName;

  for (let i = 1; i <= toolHist[0].maxToolQty; i += 1) {
    fldName = `pymdt${i}`;
    headerName = t('MSG_TXT_DSB_D') + (i);

    data.addField({ fieldName: fldName });

    view.addColumn({
      fieldName: fldName,
      header: headerName,
      width: '100',
      styleName: 'text-center',
    });
  }

  for (let i = 0; i < toolHist.length; i += 1) {
    let colName;

    if (data.getValue(i, 'pymdts').indexOf(',') !== -1) {
      const pymdtsArr = data.getValue(i, 'pymdts').split(',');

      for (let j = 0; j < pymdtsArr.length; j += 1) {
        colName = `pymdt${j + 1}`;
        data.setValue(i, colName, pymdtsArr[j]);
      }
    } else {
      const pymdt = data.getValue(i, 'pymdts');
      colName = 'pymdt1';

      data.setValue(i, colName, pymdt);
    }
  }

  view.removeColumn('pymdts');
}

async function initGrid() {
  const view = grdMainRef.value.getView();
  const data = grdMainRef.value.getData();

  const arrayData = gridUtil.getRowValue(view, 0);

  if (arrayData !== null) {
    let fldName;

    for (let i = 1; i <= arrayData.maxToolQty; i += 1) {
      fldName = `pymdt${i}`;
      data.clearRows();

      const fields = [
        { fieldName: 'ogTpCd' },
        { fieldName: 'egerPrtnrNo' },
        { fieldName: 'toolPdCd' },
        { fieldName: 'dsbSn' },
        { fieldName: 'toolQty' },
        { fieldName: 'ogId' },
        { fieldName: 'ogNm' },
        { fieldName: 'hgrOgNm' },
        { fieldName: 'prtnrNo' },
        { fieldName: 'prtnrKnm' },
        { fieldName: 'svpdNmAbbr1' },
        { fieldName: 'svpdSapCd' },
        { fieldName: 'pymdts' },
        { fieldName: 'maxToolQty' },
      ];

      data.setFields(fields);
      view.removeColumn(fldName);
    }

    // view.addColumn({
    //   fieldName: 'pymdts',
    //   header: t('MSG_TXT_DSB_D'),
    //   width: '100',
    //   styleName: 'text-center',
    // });
  }
}

async function fetchData() {
  await initGrid();

  const res = await dataService.get('/sms/wells/service/engineer-tools/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: engineerToolDsbHist, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(engineerToolDsbHist);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);

  await setPymdtColumns(engineerToolDsbHist);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  debugger;
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
    checkBar: 'hidden',
  });
}

async function onClickRechDsbIzDl() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (checkedRows.length === 0) {
    return notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
  }

  if (!await confirm(t('MSG_ALT_CHO_RECT_DSB_IZ_DL'))) { return; }

  await dataService.delete('/sms/wells/service/engineer-tools', { data: [...checkedRows] });
  await fetchData();
}

async function onClickToolDsb() {
  const { result } = await modal({
    component: 'WwsnaEngineerToolDsbRegP',
  });

  if (result) {
    notify(t('MSG_ALT_TOOL_DSB_FSH'));
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogTpCd' },
    { fieldName: 'egerPrtnrNo' },
    { fieldName: 'toolPdCd' },
    { fieldName: 'dsbSn' },
    { fieldName: 'toolQty' },
    { fieldName: 'ogId' },
    { fieldName: 'ogNm' },
    { fieldName: 'hgrOgNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'svpdNmAbbr1' },
    { fieldName: 'svpdSapCd' },
    { fieldName: 'pymdts' },
    { fieldName: 'maxToolQty' },
  ];

  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_SV_CNR'), width: '150', styleName: 'text-center' },
    // { fieldName: 'ogNm', header: t('MSG_TXT_BRANCH'), width: '150', styleName: 'text-center' },
    { fieldName: 'egerPrtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'svpdSapCd', header: t('MSG_TXT_SAP_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'toolPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'svpdNmAbbr1', header: t('MSG_TXT_ITM_NM'), width: '350' },
    { fieldName: 'toolQty', header: t('MSG_TXT_DSB_QTY'), width: '100', styleName: 'text-center' },
    // { fieldName: 'pymdts', header: t('MSG_TXT_DSB_D'), width: '100', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});

</script>
