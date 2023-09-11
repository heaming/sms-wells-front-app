<!----
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbRentalNewRequidationAggregateM - 렌탈 신규/철거 집계현황 - W-CL-U-0051M01
3. 작성자 : songmi.in
4. 작성일 : 2023.08.15
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈 신규/철거 집계현황
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SL_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.slYm"
            :label="$t('MSG_TXT_SL_YM')"
            rules="required"
            type="month"
            @change="onChangeSlYm"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SL_DT')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_SL_DT')"
            rules="date_range_required|date_range_months:1"
            :min-date="limitStartDtFrom"
            :max-date="limitEndDtTo"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_IST_PCSV_PDCT_DV')"
        >
          <kw-select
            v-model="searchParams.pdctDv"
            :options="pdctDv"
            :label="$t('MSG_TXT_IST_PCSV_PDCT_DV')"
            first-option="all"
            @change="onChangePdctDv"
          />
        </kw-search-item>
        <!-- 아웃소싱 선택일때, -->
        <kw-search-item
          v-if="isPdctDv"
          :label="$t('MSG_TXT_PRTNR_BZS_CD')"
        >
          <kw-select
            v-model="searchParams.prtnrBzsCd"
            :options="codes.PRTNR_BZS_CD"
            :label="$t('MSG_TXT_PRTNR_BZS_CD')"
            first-option="all"
          />
        </kw-search-item>
        <!-- 아웃소싱 선택일때, -->
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <div class="grid-horizontal-wrap">
        <div class="grid-horizontal-wrap__section w573">
          <h3>{{ $t('MSG_TXT_AGRG_PS') }}</h3>
          <kw-action-top>
            <template #left>
              <kw-paging-info
                :total-count="totalMainCount"
              />
            </template>
            <kw-btn
              :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
              icon="download_on"
              dense
              :disable="totalMainCount === 0"
              @click="onClickExcelDownload('main')"
            />
          </kw-action-top>
          <kw-grid
            ref="grdMainRef"
            name="grdMain"
            style="height: 468px;"
            :visible-rows="10"
            @init="initGrid1"
          />
        </div>
        <div class="grid-horizontal-wrap__section">
          <h3>{{ $t('MSG_TXT_DTL_PS') }}</h3>
          <kw-action-top>
            <template #left>
              <kw-paging-info
                :total-count="totalSubCount"
              />
            </template>
            <kw-btn
              :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
              icon="download_on"
              :disable="totalSubCount === 0"
              dense
              @click="onClickExcelDownload('sub')"
            />
          </kw-action-top>
          <kw-grid
            ref="grdSubRef"
            name="grdSub"
            style="height: 468px;"
            :visible-rows="10"
            @init="initGrid2"
          />
        </div>
      </div>
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, defineGrid, getComponentType, gridUtil, codeUtil } from 'kw-lib';
import { getPdctDv } from '~/modules/sms-common/closing/utils/clUtil';
import dayjs from 'dayjs';

const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const totalMainCount = ref(0);
const totalSubCount = ref(0);
const isPdctDv = ref(false);
const searchParams = ref({ slYm: dayjs().format('YYYYMM'),
  startDt: dayjs().format('YYYYMM').concat('01'),
  endDt: dayjs().format('YYYYMMDD') });
const pdctDv = await getPdctDv();
const limitStartDtFrom = computed(() => dayjs(`${searchParams.value.slYm}01`).format('YYYY-MM-DD'));
const limitEndDtTo = computed(() => {
  const yy = (searchParams.value.slYm).substring(0, 4);
  const mm = (searchParams.value.slYm).substring(4, 6);
  const lastDay = new Date(yy, mm, 0).getDate();
  return dayjs(`${searchParams.value.slYm}${lastDay}`).format('YYYY-MM-DD');
});

const codes = await codeUtil.getMultiCodes(
  'PRTNR_BZS_CD',
);

function onChangeSlYm() {
  searchParams.value.startDt = `${searchParams.value.slYm}01`;
  searchParams.value.endDt = `${searchParams.value.slYm}${dayjs().format('YYYYMMDD').substring(6, 8)}`;
}

function onChangePdctDv() {
  isPdctDv.value = searchParams.value.pdctDv === '1';
  if (['1', '2', '3'].includes(searchParams.value.pdctDv)) {
    searchParams.value.adrpcTpCd = searchParams.value.pdctDv === '3' ? '3' : '2';
  } else {
    searchParams.value.adrpcTpCd = '';
  }
}

async function onClickExcelDownload(gridGb) {
  const view = gridGb === 'main' ? grdMainRef.value.getView() : grdSubRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: gridGb === 'main' ? `${currentRoute.value.meta.menuName}_${t('MSG_TXT_AGRG_PS')}` : `${currentRoute.value.meta.menuName}_${t('MSG_TXT_DTL_PS')}`,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/closing/rental-new-requidation-aggregates', { params: searchParams.value });
  const aggregates = res.data;
  totalMainCount.value = aggregates.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(aggregates);
}

async function onClickSearch() {
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid1 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'divCd' },
    { fieldName: 'divDtlCd' },
    { fieldName: 'divCdNm' },
    { fieldName: 'divDtlCdNm' },
    { fieldName: 'qty', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'divCd', styleName: 'text-left', visible: false },
    { fieldName: 'divDtlCd', styleName: 'text-left', visible: false },
    { fieldName: 'divCdNm', header: t('MSG_TXT_DIV'), width: '100', styleName: 'text-left' },
    { fieldName: 'divDtlCdNm', header: t('MSG_TXT_DTL_DV'), width: '206', styleName: 'text-left' },
    { fieldName: 'qty',
      header: t('MSG_TXT_QTY'),
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      styleCallback(grid, dataCell) {
        const qty = Number(grid.getValue(dataCell.item.dataRow, 'qty'));
        const divDtlCdNm = grid.getValue(dataCell.item.dataRow, 'divDtlCdNm')?.slice(0, 2);
        return (qty > 0 && divDtlCdNm !== '합계') ? { styleName: 'rg-button-link text-right', renderer: { type: 'button' }, preventCellItemFocus: true } : { styleName: 'text-right' };
      } },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.groupBy(['divCdNm'], false);
  view.setRowGroup({ mergeMode: true });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.rowGroup.expandedAdornments = 'none';
  view.sortingOptions.enabled = false;

  view.onCellItemClicked = async (g, { column, dataRow }) => {
    if (column === 'qty') {
      const { qty, divCd, divDtlCd, divDtlCdNm } = gridUtil.getRowValue(g, dataRow);
      if (qty) {
        const res = await dataService.get('/sms/wells/closing/rental-new-requidation-aggregates/details', { params: { ...searchParams.value, divCd, divDtlCd } });
        const aggregates = res.data;
        totalSubCount.value = aggregates.length;
        const view2 = grdSubRef.value.getView();
        view2.getDataSource().setRows(aggregates.map((v) => ({ ...v, divDtlCdNm })));
      }
    }
  };
});

const initGrid2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'divDtlCdNm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'sapAssetNo' },
    { fieldName: 'cstKnm' },
    { fieldName: 'sapMatCd' },
    { fieldName: 'matPdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'istDt', dataType: 'date' },
    { fieldName: 'cntrPdEnddt', dataType: 'date' },
    { fieldName: 'reqdDt', dataType: 'date' },
    { fieldName: 'prtnrBzsNm' },

  ];

  const columns = [
    { fieldName: 'divDtlCdNm', header: t('MSG_TXT_DTL_DV'), width: '144', styleName: 'text-center' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'sapAssetNo', header: t('MSG_TXT_SAP_ORD_NO'), width: '140', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '85', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_ITM_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'matPdCd', header: t('MSG_TXT_RVPY_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_GOODS_NM'), width: '133', styleName: 'text-left' },
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cntrPdEnddt', header: t('MSG_TXT_CANC_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'reqdDt', header: t('MSG_TXT_DEM_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'prtnrBzsNm', header: t('MSG_TXT_PRTNR_BZS_CD'), width: '120', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
