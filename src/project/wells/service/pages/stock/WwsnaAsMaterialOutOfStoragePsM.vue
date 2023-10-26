<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaAsMaterialOutOfStoragePsM(K-W-SV-U-0120M01) - AS자재 출고현황
3. 작성자 : jungheejin
4. 작성일 : 2023-10-25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- AS자재 출고현황 (http://localhost:3000/#/service/wwsna-as-material-out-storage-ps)
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      :default-visible-rows="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 서비스유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_SV_TP')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.serviceType"
            :options="customCodes.serviceTypes"
            first-option="all"
          />
          <kw-select
            v-model="searchParams.ogCd"
            :options="serviceCenters"
            first-option="all"
            option-label="ogNm"
            option-value="ogCd"
          />
          <kw-select
            v-model="searchParams.prtnrNo"
            :options="engineers"
            first-option="all"
            option-label="prtnrNoNm"
            option-value="prtnrNo"
          />
        </kw-search-item>
        <!-- 유/무상구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_REFRI_DV')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.refriType"
            :options="codes.REFRI_DV_CD"
            first-option="all"
            first-option-value="0"
          />
        </kw-search-item>
        <!-- 상품그룹 -->
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 품목종류 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_KND')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 설치기준 -->
        <kw-search-item
          :label="$t('MSG_TXT_IST_BASE')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.installBase"
            :options="customCodes.installBases"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PRCSDT')"
          :colspan="2"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            rules="date_range_days:1"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_TASK_TYPE')"
        >
          <kw-select
            v-model="searchParams.svBizDclsfCd"
            :options="codes.SV_BIZ_DCLSF_CD"
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
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-btn
          primary
          dense
          :label="$t('MSG_BTN_LBL_PRNT')"
          @click="onClickOZ"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
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
import { codeUtil, getComponentType, defineGrid, gridUtil, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import { openReportPopup } from '~common/utils/cmPopupUtil';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const router = useRouter();
const { currentRoute } = useRouter();
const { alert } = useGlobal();
const { t } = useI18n();
const now = dayjs();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/as-material-out-of-storage-ps';
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'REFRI_DV_CD',
  'PD_GRP_CD',
  'ITM_KND_CD',
  'SV_BIZ_DCLSF_CD',
);

const customCodes = {
  serviceTypes: [
    { codeId: '1', codeName: t('설치') },
    { codeId: '2', codeName: t('B/S') },
    { codeId: '3', codeName: t('A/S') },
    { codeId: '4', codeName: t('A/S+설치') },
    { codeId: '5', codeName: t('A/S+B/S') },
    { codeId: '6', codeName: t('B/S+설치') },
  ],
  installBases: [
    { codeId: '1', codeName: '1년 이내' },
  ],
};
const searchParams = ref({
  startDt: now.format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  serviceType: '',
  prtnrNo: '',
  refriType: '0',
  pdGrpCd: '',
  ogCd: '',
  installBase: '',
  itmKndCd: '',
  svBizDclsfCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
});

let cachedParams;

// 서비스센터
const serviceCenters = ref((await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } })).data);

// 엔지니어
const engineers = ref((await dataService.get('/sms/wells/service/organizations/engineer', { params: { authYn: 'N' } })).data);

async function fetchData() {
  const res = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: result, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(result);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}
async function onClickOZ() {
  if (searchParams.value.ogCd === '') {
    await alert(t('MSG_ALT_SV_CNR_SELCT'));
    return;
  }
  const ozParam = ref({
    ozrPath: '/kyowon_as/asSaleLabel.ozr',
    odiPath: '',
    args:
      {
        VST_SDT: searchParams.value.startDt,
        VST_EDT: searchParams.value.endDt,
        DEPT_ID: searchParams.value.ogCd,
        CHAG_GB: searchParams.value.refriType,
      },
    height: 1300,
    width: 1400,
  });
  openReportPopup(
    ozParam.value.ozrPath,
    ozParam.value.odiPath,
    JSON.stringify(ozParam.value.args),
    { width: ozParam.value.width, height: ozParam.value.height },
  );
  console.log(ozParam.value.args);
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '180', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '180', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '200', styleName: 'text-left' },
    { fieldName: 'bcNo', header: t('MSG_TXT_BARCODE'), width: '180', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_PRCSDT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col6', header: t('MSG_TXT_GD'), width: '200', styleName: 'text-center' },
    { fieldName: 'col7', header: `${t('MSG_TXT_QTY')}(EA)`, width: '200', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'col8', header: `${t('MSG_TXT_RECAP_OR_FREE')}+${t('MSG_TXT_DIV')}`, width: '200', styleName: 'text-center' },
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center rg-button-icon--search',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        if (!isEmpty(cntrNo)) {
          return `${cntrNo}-${cntrSn}`;
        }
      },
    },
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'col10', header: t('MSG_TXT_CST_NM'), width: '200', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_CNTR_DATE'), width: '200', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_TEL_NO'), width: '200', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_ZIP'), width: '200', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_ADDR'), width: '200', styleName: 'text-left' },
    { fieldName: 'col15', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_MDL_NM'), width: '200', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_MNFT_NO'), width: '200', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_RCP_IZ'), width: '200', styleName: 'text-left' },
    { fieldName: 'col19', header: t('MSG_TXT_IST_DT'), width: '200', styleName: 'text-center' },
    { fieldName: 'col20', header: t('MSG_TXT_SV_TP'), width: '200', styleName: 'text-center' },
    { fieldName: 'col21', header: t('MSG_TXT_ICHR_CNR'), width: '200', styleName: 'text-center' },
    { fieldName: 'col22', header: t('MSG_TXT_ICHR_EGER'), width: '200', styleName: 'text-center' },
    { fieldName: 'col23', header: t('MSG_TXT_VST_CNFM_D'), width: '200', styleName: 'text-center' },
    { fieldName: 'col24', header: t('MSG_TXT_WK_STS'), width: '200', styleName: 'text-center' },
    { fieldName: 'col25', header: t('MSG_TXT_LCT'), width: '200', styleName: 'text-center' },
    { fieldName: 'col26', header: t('MSG_TXT_PHN'), width: '200', styleName: 'text-center' },
    { fieldName: 'col27', header: t('MSG_TXT_CAUS'), width: '200', styleName: 'text-center' },
    { fieldName: 'col28', header: t('MSG_TXT_DTL_IZ'), width: '200', styleName: 'text-left' },
  ];
  // const columnLayout = [
  //   'asMatItmGrpNm', 'sapMatCd', 'pdCd', 'pdNm', 'asSplUnitAmt', // single
  //   {
  //     header: t('MSG_TXT_EGD'), // colspan title
  //     direction: 'horizontal', // merge type
  //     items: ['itemGdESum', 'itemGdECostSum'],
  //   },
  // ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  // view.setColumnLayout(columnLayout);
  view.setFixedOptions({ colCount: 3, resizable: true });
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.onCellItemClicked = async (grid, index) => {
    if (index.column === 'cntrNo') {
      const cntrNo = grid.getValue(index.itemIndex, 'cntrNo');
      const cntrSn = grid.getValue(index.itemIndex, 'cntrSn');
      router.push({
        path: '/service/wwsnb-individual-service-list',
        query: {
          cntrNo,
          cntrSn,
        },
      });
    }
  };
});

</script>
