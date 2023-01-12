<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC (배정관리)
 2. 프로그램 ID : WwsncResponsibleAreaZipMgtM - 책임지역 우편번호 관리
 3. 작성자 : hyewon.kim
 4. 작성일 : 2022.11.17
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 책임지역 우편번호 관리 (http://localhost:3000/#/service/wwsnc-responsible-area-zip-mgt)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
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
      </kw-search-row>

      <kw-search-row>
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
        <kw-search-item :label="$t('MSG_TXT_APPLY_DT')">
          <kw-date-picker v-model="searchParams.applyDate" />
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
          spaced
          vertical
          inset
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

const { getDistricts } = useSnCode();

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
  wkGrpCd: '10',
  applyDate: dayjs().format('YYYYMMDD'),
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'WK_GRP_CD',
);

const ctpvs = ref();
const ctctys = ref();
const cachedCtctys = ref();
ctpvs.value = (await getDistricts('sido')).map((v) => ({ ctpv: v.ctpvNm, ctpvNm: v.ctpvNm, ctpvCd: v.fr2pLgldCd }));
ctctys.value = (await getDistricts('guAll')).map((v) => ({ ctcty: v.ctctyNm, ctctyNm: v.ctctyNm }));
cachedCtctys.value = cloneDeep(ctctys.value);

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/responsible-area-zips/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: zips, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(zips);
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

  const res = await dataService.get('/sms/wells/service/responsible-area-zips/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'rpbLocaraZipList',
    timePostfix: true,
    exportData: res.data,
  });
}

async function onUpdateCtcty(val) {
  if (val) {
    const { ctpvCd } = ctpvs.value.find((v) => v.ctpvNm === val);
    ctctys.value = (await getDistricts('gu', ctpvCd)).map((v) => ({ ctcty: v.ctctyNm, ctctyNm: v.ctctyNm }));
  } else {
    ctctys.value = cachedCtctys.value;
    searchParams.value.ctctyNm = '';
  }
}

async function onClickSave() {
  const view = grdMainRef.value.getView();

  if (view.getCheckedItems().length === 0) {
    await notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return;
  }

  if (!await gridUtil.alertIfIsNotModified(view)) {
    const changedRows = gridUtil.getChangedRowValues(view).map((v) => {
      const mngtAmtds = v.mngtAmtd.split(' / ');
      return { ...v, lawcEmdNm: mngtAmtds[0], amtdNm: mngtAmtds[1] };
    });

    await dataService.post('/sms/wells/service/responsible-area-zips', changedRows);

    await notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

let districts;
async function fetchBaseData() {
  const res = await dataService.get('sms/wells/service/responsible-area-zips/districts');
  districts = res.data;
}

onMounted(async () => {
  await fetchBaseData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'newAdrZip' },
    { fieldName: 'mgtCnt' },
    { fieldName: 'wrkCnt' },
    { fieldName: 'ctpvNm' },
    { fieldName: 'ctctyNm' },
    { fieldName: 'lawcEmdNm' },
    { fieldName: 'amtdNm' },
    { fieldName: 'mngtAmtd' },
    { fieldName: 'rpbLocaraCd' },
    { fieldName: 'rpbLocaraGrpCd' },
    { fieldName: 'ogNm' },
    { fieldName: 'ichrPrtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'vstDowVal' },
    { fieldName: 'emdSn' },
    { fieldName: 'fr2pLgldCd' },
    { fieldName: 'kynorLocaraYn' },
    { fieldName: 'ildYn' },
    { fieldName: 'pdlvNo' },
    { fieldName: 'dtaDlYn' },
  ];

  const columns = [
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'mgtCnt', header: t('MSG_TXT_SV_ACC'), width: '100', styleName: 'text-right' },
    { fieldName: 'wrkCnt', header: t('MSG_TXT_MLMN_ACTCS'), width: '100', styleName: 'text-right' },
    { fieldName: 'ctpvNm', header: t('MSG_TXT_CTPV_NM'), width: '150' },
    { fieldName: 'ctctyNm', header: t('MSG_TXT_CTCTY_NM'), width: '150' },
    { fieldName: 'lawcEmdNm', header: t('MSG_TXT_EMD_NM'), width: '150' },
    { fieldName: 'amtdNm', header: t('MSG_TXT_AMTD_NM'), width: '150' },
    {
      fieldName: 'mngtAmtd',
      header: t('MSG_TXT_MNGT_AMTD'),
      width: '150',
      optionLabel: 'label',
      optionValue: 'value',
      editor: { type: 'list' },
      editable: true,
      styleCallback: (grid, dataCell) => {
        const ctpvNm = grid.getValue(dataCell.index.itemIndex, 'ctpvNm');
        const ctctyNm = grid.getValue(dataCell.index.itemIndex, 'ctctyNm');
        const mngtAmtd = districts
          .filter((v) => v.ctpvNm === ctpvNm && v.ctctyNm === ctctyNm)
          .map((v) => v.mngtAmtd)
          .reduce((a, v) => (a.includes(v) ? a : [...a, v]), []);

        return { editor: { type: 'list', labels: mngtAmtd, values: mngtAmtd } };
      },
    },
    { fieldName: 'rpbLocaraCd', header: t('MSG_TXT_LOCARA_CMN_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'rpbLocaraGrpCd', header: t('MSG_TXT_LOCARA_GRP_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_CENTER_DIVISION'), width: '120' },
    { fieldName: 'ichrPrtnrNo', header: t('MSG_TXT_RPB_PRTNR_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_RPB_ICHR_NM'), width: '100' },
    { fieldName: 'vstDowVal', header: t('MSG_TXT_VST_DOW'), width: '100' },
  ];

  const columnLayout = [
    'newAdrZip',
    'mgtCnt',
    'wrkCnt',
    {
      direction: 'horizontal',
      items: [
        'ctpvNm',
        'ctctyNm',
        'lawcEmdNm',
      ],
      header: {
        text: t('MSG_TXT_LGLD'),
      },
    },
    'amtdNm',
    'mngtAmtd',
    'rpbLocaraCd',
    'rpbLocaraGrpCd',
    'ogNm',
    'ichrPrtnrNo',
    'prtnrKnm',
    'vstDowVal',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);

  view.setFixedOptions({ colCount: 1 });

  view.checkBar.visible = true;
  view.setCheckableCallback(() => false);
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.onCellEdited = (grid, itemIndex) => {
    grid.checkItem(itemIndex, true);
  };
});
</script>
