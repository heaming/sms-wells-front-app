<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : [K-W-SV-U-0157M01] WwsnbCustomerPsByProductListM - 상품별 고객현황
3. 작성자 : heymi.cho
4. 작성일 : 2023.08.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            class="w150"
            first-option="all"
            @change="onChangePdGrpCd"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="selectedProductByPdGrpCd"
            first-option="all"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_INST_OVER')"
        >
          <kw-input
            v-model="searchParams.instOver"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_SEL_TYPE')"
        >
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="codes.SELL_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_MGT_TYP')"
        >
          <kw-select
            v-model="searchParams.prdMngtTpCd"
            :options="codes.PRD_MNGT_TP_CD"
            first-option="all"
          />
          <kw-field
            :model-value="cancelOrReqdOptions"
          >
            <kw-checkbox
              v-model="searchParams.cancelOrReqd"
              :label="$t('MSG_TXT_CANCEL') + '/' + $t('MSG_TXT_REQD')"
              :false-value="''"
              :true-value="'Y'"
            />
          </kw-field>
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_CHK_PRD')"
        >
          <kw-select
            v-model="searchParams.bfsvcPrdCd"
            :options="CUST_BFSVC_PRD_CD"
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
        <kw-btn
          icon="download_on"
          secondary
          dense
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
        @init="initGrid"
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
import { codeUtil, getComponentType, gridUtil, useDataService, defineGrid } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const now = dayjs();
const { currentRoute } = useRouter();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GRP_CD',
  'PRD_MNGT_TP_CD',
  'SELL_TP_CD',
  'BFSVC_PRD_CD',
);

/*
 *  Page Info setting
 */
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

/*
 *  Search Parameter
 */
const searchParams = ref({
  baseDt: now.format('YYYYMMDD'),
  pdGrpCd: '',
  pdCd: '',
  instOver: '',
  sellTpCd: '',
  prdMngtTpCd: '',
  bfsvcPrdCd: '',
  cancelOrReqd: '',
});

/* 점검주기 option 재설정 */
const CUST_BFSVC_PRD_CD = codes.BFSVC_PRD_CD.filter((v) => (v.codeId !== 'A'));

/*
 *  Select Component 초기화 - 전체 상품 목록 가져오기
 */
const products = ref([]);
const selectedProductByPdGrpCd = ref([]);

async function getProductList() {
  cachedParams = cloneDeep(searchParams);
  const response = await dataService.get('/sms/wells/service/product-list/by-itmkndcd', { params: { itmKndCd: searchParams.value.itmKndCd } });
  products.value = response.data;
}

onBeforeMount(async () => {
  searchParams.value.itmKndCd = '4';
});

onMounted(async () => {
  await getProductList();
  selectedProductByPdGrpCd.value = cloneDeep(products.value);
  selectedProductByPdGrpCd.value = selectedProductByPdGrpCd.value.map((v) => ({ codeId: v.codeId, codeName: `${v.codeId} - ${v.codeName}` }));
  // console.log(selectedProductByItmKnd.value);
});

const onChangePdGrpCd = (val) => {
  if (val.length < 1) {
    selectedProductByPdGrpCd.value = cloneDeep(products.value);
  } else {
    selectedProductByPdGrpCd.value = products.value.filter((v) => v.pdGrpCd === val);
  }
};

async function fetchData() {
  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/customer-ps-by-product/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(state);
  console.log(state);
  view.resetCurrent();
  await gridUtil.reset(view);
}

/*
 *  Search - 조회
 */
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/customer-ps-by-product/excel-download', { params: searchParams.value });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const columns = [
    {
      fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      styleName: 'text-center',
      width: '150',

      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        if (!isEmpty(cntrNo)) {
          return `${cntrNo}-${cntrSn}`;
        }
      },
    }, // 고객번호
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '90', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '130', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-left' },
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '90', styleName: 'text-center' },
    { fieldName: 'brchOgCd', header: t('MSG_TXT_BSNS_CNTR'), width: '110', styleName: 'text-center' },
    { fieldName: 'svcOgNm', header: t('MSG_TXT_SV_CNR'), width: '110', styleName: 'text-center' },
    { fieldName: 'addr', header: t('MSG_TXT_INST_ADDR'), width: '260', styleName: 'text-left' },
    { fieldName: 'cphoneNo',
      header: t('MSG_TXT_CPHON_NO'),
      width: '140',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cralLocaraTno: no1, mexnoEncr: no2, cralIdvTno: no3 } = grid.getValues(index.itemIndex);

        if (!isEmpty(no1)) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    },
    { fieldName: 'locaraTno', header: t('MSG_TXT_TEL_NO'), width: '140', styleName: 'text-center', visible: false },
    { fieldName: 'exnoEncr', header: t('MSG_TXT_TEL_NO'), width: '140', styleName: 'text-center', visible: false },
    { fieldName: 'idvTno', header: t('MSG_TXT_TEL_NO'), width: '140', styleName: 'text-center', visible: false },
    {
      fieldName: 'telNo',
      header: t('MSG_TXT_TEL_NO'),
      styleName: 'text-center',
      width: '140',
      displayCallback(grid, index) {
        const { locaraTno: no1, exnoEncr: no2, idvTno: no3 } = grid.getValues(index.itemIndex);
        if (!isEmpty(no1)) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    },
    { fieldName: 'cralLocaraTno', header: t('MSG_TXT_TEL_NO'), width: '130', styleName: 'text-center', visible: false },
    { fieldName: 'mexnoEncr', header: t('MSG_TXT_TEL_NO'), width: '130', styleName: 'text-center', visible: false },
    { fieldName: 'cralIdvTno', header: t('MSG_TXT_TEL_NO'), width: '130', styleName: 'text-center', visible: false },
    { fieldName: 'canDt', header: t('MSG_TXT_CANC_DT'), width: '130', styleName: 'text-center' },
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '130', styleName: 'text-center' },
    { fieldName: 'reqdDt', header: t('MSG_TXT_DEM_DT'), width: '130', styleName: 'text-center' },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_SEL_TYPE'), width: '130', styleName: 'text-center' },
    { fieldName: 'pdUswyCd', header: t('MSG_TXT_USWY'), width: '130', styleName: 'text-center' },
    { fieldName: 'bcNo', header: t('MSG_TXT_BARCODE'), width: '130', styleName: 'text-center' },
    { fieldName: 'svStpDt', header: t('MSG_TXT_SV_STP_DT'), width: '130', styleName: 'text-center' },
    { fieldName: 'cntrPtrm', header: t('MSG_TXT_DUTY_USE_MCNT_N'), width: '130', styleName: 'text-center' },
    { fieldName: 'extFrisuAsMcn', header: t('MSG_TXT_FRISU_AS_PTRM_N'), width: '130', styleName: 'text-center' },
    { fieldName: 'dlqAcuMcn', header: t('MSG_TXT_OVERDUE'), width: '130', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_MNGER_AFFILITN_CD'), width: '130', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_MNGER_NM'), width: '130', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_MNGER_EPNO'), width: '130', styleName: 'text-center' },
    { fieldName: 'trnovrRtOjYn', header: t('MSG_TXT_TURNOVER_TRGT'), width: '130', styleName: 'text-center', autoFilter: false, visible: false }, // 회전율
    { fieldName: 'cmnPartDvCd', header: t('MSG_TXT_MDIM_RPR_MAT'), width: '130', styleName: 'text-center', autoFilter: false, visible: false }, // 중수리
    { fieldName: 'ordnyHvMatYn', header: t('MSG_TXT_BTD_MAT'), width: '130', styleName: 'text-center', autoFilter: false, visible: false }, // 기초자재
  ];
  // eslint-disable-next-line max-len
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.filteringOptions.enabled = false;
});

</script>
