<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbSalesPerformanceListM - 매출실적 현황 - W-CL-U-0038M01
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.03.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 매출실적 현황 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs
      v-model="selectedTab"
    >
      <kw-tab
        name="mainTab"
        :label="$t('MSG_TIT_SPAY_EXCP')"
      />
      <kw-tab
        name="detailTab"
        :label="$t('MSG_TIT_SPAY')"
      />
    </kw-tabs>
    <kw-tab-panels
      v-model="selectedTab"
    >
      <kw-tab-panel name="mainTab">
        <kw-search
          one-row
          :cols="2"
          @search="onClickSearch"
        >
          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_CNTR_DTL_NO')"
              required
            >
              <kw-input
                v-model="searchParams.cntrDtlNo"
                :label="$t('MSG_TXT_CNTR_DTL_NO')"
                icon="search"
                clearable
                rules="required"
              />
            </kw-search-item>
            <kw-search-item
              :label="$t('MSG_TXT_SL_Y')"
            >
              <kw-date-range-picker
                v-model:from="searchParams.baseYearFrom"
                v-model:to="searchParams.baseYearTo"
                type="year"
                rules="date_range_months:1"
              />
            </kw-search-item>
          </kw-search-row>
        </kw-search>

        <div class="result-area">
          <kw-action-top>
            <template #left>
              <h3 class="mb0">
                {{ $t('MSG_TXT_BASIC_INFO') }}
              </h3>
            </template>
            <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
          </kw-action-top>

          <kw-form
            v-if="isShow1"
            :cols="4"
            align-content="left"
            dense
          >
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_TASK_DIV')"
              >
                <p>{{ baseInformation.col1 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CNTR_DTL_NO')"
              >
                <p>{{ baseInformation.col2 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CST_NM')"
              >
                <p>{{ baseInformation.col3 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_PD_INF')"
              >
                <p>{{ baseInformation.col4 }}</p>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_EXN_TP')"
              >
                <p>{{ baseInformation.col5 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_ALNC_DV')"
              >
                <p>{{ baseInformation.col6 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_ATT_RCPDT')"
              >
                <p>{{ baseInformation.col7 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_SL_DT')"
              >
                <p>{{ baseInformation.col8 }}</p>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_CANC_DT')"
              >
                <p>{{ baseInformation.col9 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_FSH_DT')"
              >
                <p>{{ baseInformation.col10 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_REDF_DT')"
              >
                <p>{{ baseInformation.col11 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_ADSB_DT')"
              >
                <p>{{ baseInformation.col12 }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_PD_DC_CLASS')"
              >
                <p>{{ baseInformation.col13 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_FNT_INF_D')"
              >
                <p>{{ baseInformation.col14 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_RGST_CS_DSC')"
              >
                <p>{{ baseInformation.col15 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_RTLFE1_MCNT_WON')"
              >
                <p>{{ baseInformation.col16 }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_SL_AGG_AMT')"
              >
                <p>{{ baseInformation.col17 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DSC_AGG_AMT')"
              >
                <p>{{ baseInformation.col18 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CTR_AGG_AMT')"
              >
                <p>{{ baseInformation.col19 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DP_AGG_AMT')"
              >
                <p>{{ baseInformation.col20 }}</p>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_UC_AMT')"
              >
                <p>{{ baseInformation.col21 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DLQ_AMT')"
              >
                <p>{{ baseInformation.col22 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_SL_STP')"
              >
                <p>{{ baseInformation.col23 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_ADD_AMT')"
              >
                <p>{{ baseInformation.col24 }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_DFA_AMT')"
              >
                <p>{{ baseInformation.col25 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DFA_DP_AMT')"
              >
                <p>{{ baseInformation.col26 }}</p>
              </kw-form-item>
            </kw-form-row>
          </kw-form>

          <kw-form
            v-if="isShow2"
            :cols="4"
            align-content="left"
            dense
          >
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_TASK_DIV')"
              >
                <p>{{ baseInformation.col1 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CNTR_DTL_NO')"
              >
                <p>{{ baseInformation.col2 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CST_NM')"
              >
                <p>{{ baseInformation.col3 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_PD_INF')"
              >
                <p>{{ baseInformation.col4 }}</p>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_FNT_INF')"
              >
                <p>{{ baseInformation.col5 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CNTR_DATE')"
              >
                <p>{{ baseInformation.col6 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CNFM_DT')"
              >
                <p>{{ baseInformation.col7 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CANC_DT')"
              >
                <p>{{ baseInformation.col8 }}</p>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_J_DT')"
              >
                <p>{{ baseInformation.col9 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_WDWAL_DT')"
              >
                <p>{{ baseInformation.col10 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_FSH_DT')"
              >
                <p>{{ baseInformation.col11 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_MM_SSPCS')"
              >
                <p>{{ baseInformation.col12 }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_DSC_AMT')"
              >
                <p>{{ baseInformation.col13 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_SL_AGG_AMT')"
              >
                <p>{{ baseInformation.col14 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DSC_AGG_AMT')"
              >
                <p>{{ baseInformation.col15 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CTR_AGG_AMT')"
              >
                <p>{{ baseInformation.col16 }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_DP_AGG_AMT')"
              >
                <p>{{ baseInformation.col17 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_UC_AMT')"
              >
                <p>{{ baseInformation.col18 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DLQ_AMT_ADAMT')"
              >
                <p>{{ baseInformation.col19 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_DFA_AMT')"
              >
                <p>{{ baseInformation.col20 }}</p>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_DFA_DP_AMT')"
              >
                <p>{{ baseInformation.col21 }}</p>
              </kw-form-item>
            </kw-form-row>
          </kw-form>

          <kw-form
            v-if="isShow3"
            :cols="4"
            align-content="left"
            dense
          >
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_TASK_DIV')"
              >
                <p>{{ baseInformation.col1 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CNTR_DTL_NO')"
              >
                <p>{{ baseInformation.col2 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_CST_NM')"
              >
                <p>{{ baseInformation.col3 }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_PD_INF')"
              >
                <p>{{ baseInformation.col4 }}</p>
              </kw-form-item>
            </kw-form-row>
          </kw-form>

          <kw-separator />

          <h3 class="mb0">
            {{ $t('MSG_TXT_SL_PERF_MCBY') }}
          </h3>

          <kw-action-top>
            <template #left>
              <kw-paging-info
                v-model:page-index="pageInfo.pageIndex"
                v-model:page-size="pageInfo.pageSize"
                :total-count="pageInfo.totalCount"
                :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
                @change="fetchSalesData"
              />
            </template>
            <kw-btn
              icon="download_on"
              :disable="pageInfo.totalCount === 0"
              dense
              secondary
              :label="$t('MSG_BTN_EXCEL_DOWN')"
              @click="onClickExportView"
            />
            <kw-separator
              vertical
              inset
              spaced
            />
            <kw-btn
              dense
              secondary
              :label="$t('MSG_BTN_CCAM_ET')"
            />
            <kw-btn
              dense
              secondary
              :label="$t('MSG_BTN_PRM_ET')"
              @click="onClickPrmEt"
            />
            <kw-separator
              vertical
              inset
              spaced
            />
            <kw-btn
              :label="$t('MSG_BTN_DP_RFND_IZ_INQR')"
              primary
              dense
            />
          </kw-action-top>

          <kw-grid
            ref="grdMainRef"
            name="grdMain"
            :visible-rows="pageInfo.pageSize - 1"
            @init="initGridMain"
          />
        </div>
      </kw-tab-panel>
      <kw-tab-panel name="detailTab">
        <wwdcb-single-payment-m
          v-model:selected-link-id="selectedLinkId"
        />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, gridUtil, defineGrid, getComponentType, useDataService, useMeta, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import WwdcbSinglePaymentM from './WwdcbSinglePaymentM.vue';

const selectedTab = ref('mainTab');
const now = dayjs();
const { t } = useI18n();
const { modal } = useGlobal();
const { getConfig } = useMeta();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const isShow1 = ref(true);
const isShow2 = ref(false);
const isShow3 = ref(false);

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  cntrDtlNo: '',
  baseYearFrom: now.format('YYYY'),
  baseYearTo: now.format('YYYY'),
});

const baseInformation = ref({});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
async function fetchBaseData() {
  const res = await dataService.get('/sms/wells/closing/sales-performance/base-information', { params: cachedParams });
  console.log(res.data);
  baseInformation.value = res.data;
  console.log('baseInformation.value.col1:', baseInformation.value.col1);
  if (baseInformation.value.col1 === '1') {
    isShow1.value = true;
    isShow2.value = false;
    isShow3.value = false;
  } else if (baseInformation.value.col1 === '2') {
    isShow1.value = false;
    isShow2.value = true;
    isShow3.value = false;
  } else if (baseInformation.value.col1 === '3') {
    isShow1.value = false;
    isShow2.value = false;
    isShow3.value = true;
  }
}

async function fetchSalesData() {
  const res = await dataService.get('/sms/wells/closing/sales-performance/sales-performance-mcby/paging', { params: cachedParams });
  console.log(res.data);
  const { list: mainList, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(mainList);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchBaseData();
  await fetchSalesData();
}

async function onClickExportView() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/closing/sales-performance/sales-performance-mcby/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: `${t('MSG_TXT_SL_PERF_MCBY')}Excel`,
    timePostfix: true,
    exportData: response.data,
  });
}

async function onClickPrmEt() {
  console.log('선납예상 팝업 추가');
  // const cntrDtlNo = baseInformation.value.col2;
  // await modal({
  //  component: 'WwwdcPrepaymentEstimateAmountListP',
  //  componentProps: { cntrDtlNo },
  // });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4', dataType: 'number' },
    { fieldName: 'col5' },
    { fieldName: 'col6', dataType: 'number' },
    { fieldName: 'col7', dataType: 'number' },
    { fieldName: 'col8', dataType: 'number' },
    { fieldName: 'col9', dataType: 'number' },
    { fieldName: 'col10', dataType: 'number' },
    { fieldName: 'col11', dataType: 'number' },
    { fieldName: 'col12', dataType: 'number' },
    { fieldName: 'col13', dataType: 'number' },
    { fieldName: 'col14', dataType: 'number' },
    { fieldName: 'col15', dataType: 'number' },
    { fieldName: 'col16', dataType: 'number' },
    { fieldName: 'col17', dataType: 'number' },
    { fieldName: 'col18', dataType: 'number' },
    { fieldName: 'col19', dataType: 'number' },
    { fieldName: 'col20', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CNTR_DTL_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_SL_YM'), width: '100', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_SL_STP'), width: '100', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_NMN'), width: '100', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_MNGT_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_PRM_MCNT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col7', header: t('MSG_TXT_BIL_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col8', header: t('MSG_TXT_CCAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col9', header: t('MSG_TXT_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col10', header: t('MSG_TXT_PRPD_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col11', header: t('MSG_TXT_UC_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col12', header: t('MSG_TXT_DLQ_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col13', header: t('MSG_TXT_DLQ_MCNT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col14', header: t('MSG_TXT_BTD_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col15', header: t('MSG_TXT_OCCR_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col16', header: t('MSG_TXT_DDCTAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col17', header: t('MSG_TXT_DP_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col18', header: t('MSG_TXT_RFND_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col19', header: t('MSG_TXT_EOT_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'col20', header: t('MSG_TXT_SL_STP_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.onCellItemClicked = async (grid, { column }) => {
    const current = view.getCurrent();
    const dataProvider = view.getDataSource();
    const cntrDtlNo = dataProvider.getValue(current.dataRow, 'col9');
    if (column === 'col9') {
      await modal({
        component: 'EwdccSalesDtlP',
        componentProps: { cntrDtlNo },
      });
    }
  };

  const layout1 = [
    'col1',
    'col2',
    'col3',
    'col4',
    'col5',
    'col6',
    'col7',
    'col8',
    'col9',
    'col10',
    'col11',
    'col12',
    'col13',
    {
      name: 'normalGroup',
      direction: 'horizontal',
      items: [
        'col14',
        'col15',
        'col16',
        'col17',
        'col18',
        'col19',
      ],
      header: {
        text: t('MSG_TXT_ADD_AMT'),
      },
    },
    'col20',
  ];
  view.setColumnLayout(layout1);

  view.rowIndicator.visible = true;
});
</script>
