<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA
 2. 프로그램 ID : WwsnaBsCsmbGiveAOrderMgtM(W-SV-U-0014M01) - BS소모품 발주수량 산출
 3. 작성자 : seungsoo.kim
 4. 작성일 : 2023.07.06
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - BS소모품 발주 수량을 산출하기 위해 배부수량과 물류센터 재고를 조회한 후 산출식을 통해 발주수량을 계산하고 저장하는 화면
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.mngtYm"
            type="month"
            @change="onChangeMngtYm"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_GO_DV')"
        >
          <kw-select
            v-model="searchParams.goDvCd"
            :options="codes.GO_DV_CD"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_ITM_KND')">
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            @change="onChangeItmKndCd"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_ITM_NM')">
          <kw-select
            v-model="searchParams.csmbPdCd"
            :options="productCodes"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.csmbPdCdFrom"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.csmbPdCdTo"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SAP_CD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.sapMatCdFrom"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.sapMatCdTo"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SGSU_STOC')"
        >
          <kw-option-group
            v-model="searchParams.sgsuExcludeYn"
            :model-value="'0'"
            type="radio"
            :options="[
              {codeId: '0', codeName: $t('MSG_TXT_INC')},
              {codeId: '1', codeName: $t('MSG_TXT_EXCD')},
            ]"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-size="pageInfo.pageSize"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
          />
        </template>

        <kw-btn
          :label="$t('MSG_BTN_SAVE')"
          dense
          grid-action
          :disable="pageInfo.totalCount === 0"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
      />
      <!-- <kw-pagination
        :page-index="1"
        :total-count="100"
      /> -->
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { useGlobal, getComponentType, useMeta, defineGrid, codeUtil, useDataService, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { notify } = useGlobal();
const { currentRoute } = useRouter();
const dataService = useDataService();
const { getConfig } = useMeta();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
const productCodes = ref([]);
const pageInfo = ref({
  totalCount: 0,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const searchParams = ref({
  mngtYm: dayjs().format('YYYYMM'),
  goDvCd: '',
  itmKndCd: '',
  csmbPdCd: '',
  csmbPdCdFrom: '',
  csmbPdCdTo: '',
  sapMatCdFrom: '',
  sapMatCdTo: '',
  sgsuExcludeYn: '',
});

const ddlvYmNms = ref({
  mms6bDdlvNm: dayjs(searchParams.mngtYm).add(-6, 'month').format('YYYY-MM'),
  mms5bDdlvNm: dayjs(searchParams.mngtYm).add(-5, 'month').format('YYYY-MM'),
  mms4bDdlvNm: dayjs(searchParams.mngtYm).add(-4, 'month').format('YYYY-MM'),
  mms3bDdlvNm: dayjs(searchParams.mngtYm).add(-3, 'month').format('YYYY-MM'),
  mms2bDdlvNm: dayjs(searchParams.mngtYm).add(-2, 'month').format('YYYY-MM'),
  mms1bDdlvNm: dayjs(searchParams.mngtYm).add(-1, 'month').format('YYYY-MM'),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'GO_DV_CD',
  'ITM_KND_CD',
);

async function onChangeMngtYm() {
  ddlvYmNms.value.mms6bDdlvNm = dayjs(searchParams.value.mngtYm).add(-6, 'month').format('YYYY-MM');
  ddlvYmNms.value.mms5bDdlvNm = dayjs(searchParams.value.mngtYm).add(-5, 'month').format('YYYY-MM');
  ddlvYmNms.value.mms4bDdlvNm = dayjs(searchParams.value.mngtYm).add(-4, 'month').format('YYYY-MM');
  ddlvYmNms.value.mms3bDdlvNm = dayjs(searchParams.value.mngtYm).add(-3, 'month').format('YYYY-MM');
  ddlvYmNms.value.mms2bDdlvNm = dayjs(searchParams.value.mngtYm).add(-2, 'month').format('YYYY-MM');
  ddlvYmNms.value.mms1bDdlvNm = dayjs(searchParams.value.mngtYm).add(-1, 'month').format('YYYY-MM');

  const view = grdMainRef.value.getView();

  view.setColumns(null);
  view.setColumnLayout([]);

  view.setColumns([
    { fieldName: 'goDvNm', header: t('MSG_TXT_DIV'), width: '130', styleName: 'text-center', editable: false },
    { fieldName: 'svpdSapCd', header: t('MSG_TXT_SAPCD'), width: '180', styleName: 'text-center', editable: false, footer: { text: t('MSG_TXT_SUM') } },
    { fieldName: 'csmbPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center', editable: false },
    { fieldName: 'itmKnm', header: t('MSG_TXT_ITM_NM'), width: '190', styleName: 'text-left', editable: false },
    { fieldName: 'mms6bDdlvQty', header: `${ddlvYmNms.value.mms6bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms5bDdlvQty', header: `${ddlvYmNms.value.mms5bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms4bDdlvQty', header: `${ddlvYmNms.value.mms4bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms3bDdlvQty', header: `${ddlvYmNms.value.mms3bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms2bDdlvQty', header: `${ddlvYmNms.value.mms2bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms1bDdlvQty', header: `${ddlvYmNms.value.mms1bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mmAvDdlvQty', header: t('MSG_TXT_MM_AV_DDLV'), width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'strStnbQty', header: t('MSG_TXT_STR_STNB'), width: '130', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'pajuLgstCnrStocQty', header: t('MSG_TXT_PAJU_STOC'), width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'sgsuLgstCnrStocQty', header: t('MSG_TXT_SGSU_STOC'), width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'woStocQty', header: t('MSG_TXT_FNL_STOC'), width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'stocPersMmN', header: t('MSG_TXT_STOC_CTN_MM'), width: '130', styleName: 'text-right', editable: false },
    { fieldName: 'etExsDt', header: t('MSG_TXT_ET_EXS_DT'), width: '130', styleName: 'text-center', editable: false },
    { fieldName: 'goUprc', header: t('MSG_TXT_UPRC'), width: '130', styleName: 'text-right', editable: false },
    { fieldName: 'ncstQty', header: t('MSG_TXT_NCST_QT'), width: '130', styleName: 'text-right', editable: false },
    { fieldName: 'goQty', header: t('MSG_TXT_GO_QTY'), width: '130', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'goAmt', header: t('MSG_TXT_GO_AMT'), width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'minOrdQty', header: t('MSG_TXT_MOQ'), width: '130', styleName: 'text-right', editable: false },
    { fieldName: 'pypdDc', header: t('MSG_TXT_LEAD_TIME_SHORT'), width: '130', styleName: 'text-right', editable: false },
    { fieldName: 'rmkCn', header: t('MSG_TXT_RMK_MO'), width: '130', styleName: 'text-left', editable: false },
  ]);

  view.setColumnLayout([
    'goDvNm', 'svpdSapCd', 'csmbPdCd', 'itmKnm',
    {
      header: t('MSG_TXT_DDLV_QT_EA'),
      direction: 'horizontal',
      items: ['mms6bDdlvQty', 'mms5bDdlvQty', 'mms4bDdlvQty', 'mms3bDdlvQty', 'mms2bDdlvQty', 'mms1bDdlvQty', 'mmAvDdlvQty'],
    },
    {
      header: t('MSG_TXT_STOC_EA'),
      direction: 'horizontal',
      items: ['strStnbQty', 'pajuLgstCnrStocQty', 'sgsuLgstCnrStocQty', 'woStocQty', 'stocPersMmN'],
    },
    'etExsDt', 'goUprc', 'ncstQty', 'goQty', 'goAmt', 'minOrdQty', 'pypdDc', 'rmkCn',
  ]);
}

async function onChangeItmKndCd() {
  const res = await dataService.get(`/sms/wells/service/bs-consumables/${searchParams.value.itmKndCd}/product-codes`);

  productCodes.value = res.data.map((v) => ({ codeId: v.svpdPdCd, codeName: v.svpdNmKor }));
}

let cachedParams;

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/bs-consumables', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/bs-consumables', { params: cachedParams });
  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(res.data);
  pageInfo.value.totalCount = res.data.length;
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const rowValues = gridUtil.getAllRowValues(view);

  await dataService.post('/sms/wells/service/bs-consumables', rowValues);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'mngtYm' },
    { fieldName: 'goDvCd' },
    { fieldName: 'goDvNm' },
    { fieldName: 'svpdSapCd' },
    { fieldName: 'csmbPdCd' },
    { fieldName: 'itmKnm' },
    { fieldName: 'mngtUnitCd' },
    { fieldName: 'mms6bDdlvQty' },
    { fieldName: 'mms5bDdlvQty' },
    { fieldName: 'mms4bDdlvQty' },
    { fieldName: 'mms3bDdlvQty' },
    { fieldName: 'mms2bDdlvQty' },
    { fieldName: 'mms1bDdlvQty' },
    { fieldName: 'mmAvDdlvQty' },
    { fieldName: 'strStnbQty' },
    { fieldName: 'pajuLgstCnrStocQty' },
    { fieldName: 'sgsuLgstCnrStocQty' },
    { fieldName: 'woStocQty' },
    { fieldName: 'stocPersMmN' },
    { fieldName: 'etExsDt' },
    { fieldName: 'goUprc' },
    { fieldName: 'ncstQty' },
    { fieldName: 'goQty' },
    { fieldName: 'goAmt' },
    { fieldName: 'minOrdQty' },
    { fieldName: 'pypdDc' },
    { fieldName: 'rmkCn' },
  ];

  const columns = [
    { fieldName: 'goDvNm', header: t('MSG_TXT_DIV'), width: '130', styleName: 'text-center', editable: false },
    { fieldName: 'svpdSapCd', header: t('MSG_TXT_SAPCD'), width: '180', styleName: 'text-center', editable: false, footer: { text: t('MSG_TXT_SUM') } },
    { fieldName: 'csmbPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center', editable: false },
    { fieldName: 'itmKnm', header: t('MSG_TXT_ITM_NM'), width: '190', styleName: 'text-left', editable: false },
    { fieldName: 'mms6bDdlvQty', header: `${ddlvYmNms.value.mms6bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms5bDdlvQty', header: `${ddlvYmNms.value.mms5bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms4bDdlvQty', header: `${ddlvYmNms.value.mms4bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms3bDdlvQty', header: `${ddlvYmNms.value.mms3bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms2bDdlvQty', header: `${ddlvYmNms.value.mms2bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mms1bDdlvQty', header: `${ddlvYmNms.value.mms1bDdlvNm}`, width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'mmAvDdlvQty', header: t('MSG_TXT_MM_AV_DDLV'), width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'strStnbQty', header: t('MSG_TXT_STR_STNB'), width: '130', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'pajuLgstCnrStocQty', header: t('MSG_TXT_PAJU_STOC'), width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'sgsuLgstCnrStocQty', header: t('MSG_TXT_SGSU_STOC'), width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'woStocQty', header: t('MSG_TXT_FNL_STOC'), width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'stocPersMmN', header: t('MSG_TXT_STOC_CTN_MM'), width: '130', styleName: 'text-right', editable: false },
    { fieldName: 'etExsDt', header: t('MSG_TXT_ET_EXS_DT'), width: '130', styleName: 'text-center', editable: false },
    { fieldName: 'goUprc', header: t('MSG_TXT_UPRC'), width: '130', styleName: 'text-right', editable: false },
    { fieldName: 'ncstQty', header: t('MSG_TXT_NCST_QT'), width: '130', styleName: 'text-right', editable: false },
    { fieldName: 'goQty', header: t('MSG_TXT_GO_QTY'), width: '130', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'goAmt', header: t('MSG_TXT_GO_AMT'), width: '130', styleName: 'text-right', editable: false, footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-center' } },
    { fieldName: 'minOrdQty', header: t('MSG_TXT_MOQ'), width: '130', styleName: 'text-right', editable: false },
    { fieldName: 'pypdDc', header: t('MSG_TXT_LEAD_TIME_SHORT'), width: '130', styleName: 'text-right', editable: false },
    { fieldName: 'rmkCn', header: t('MSG_TXT_RMK_MO'), width: '130', styleName: 'text-left', editable: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setFixedOptions({ colCount: 4 });
  view.setColumnLayout([
    'goDvNm', 'svpdSapCd', 'csmbPdCd', 'itmKnm',
    {
      header: t('MSG_TXT_DDLV_QT_EA'),
      direction: 'horizontal',
      items: ['mms6bDdlvQty', 'mms5bDdlvQty', 'mms4bDdlvQty', 'mms3bDdlvQty', 'mms2bDdlvQty', 'mms1bDdlvQty', 'mmAvDdlvQty'],
    },
    {
      header: t('MSG_TXT_STOC_EA'),
      direction: 'horizontal',
      items: ['strStnbQty', 'pajuLgstCnrStocQty', 'sgsuLgstCnrStocQty', 'woStocQty', 'stocPersMmN'],
    },
    'etExsDt', 'goUprc', 'ncstQty', 'goQty', 'goAmt', 'minOrdQty', 'pypdDc', 'rmkCn',
  ]);

  view.setFooters({ visible: true, items: [{ height: 42 }] });
  view.setOptions({ summaryMode: 'aggregate' });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
});

</script>
