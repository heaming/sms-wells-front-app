<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNY
2. 프로그램 ID : WwsnyErrorCodeMgtM(K-W-SV-U-0304M01) - 상품별 에러코드 관리
3. 작성자 : jaehunlee
4. 작성일 : 2023.07.03
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- 상품별 에러코드 관리 (http://localhost:3000/#/service/wwsny-error-code-mgt)
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <!-- rev:230420 one-row 추가  -->
    <kw-search
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_PD_GRP')">
          <kw-select
            v-model="searchParams.pdGrpCd"
            :label="$t('MSG_TXT_PD_GRP')"
            :options="codes.PD_GRP_CD"
            first-option="all"
            class="w150"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="productCode"
            first-option="all"
            :disable="searchParams.pdGrpCd === ''"
            class="w200"
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>
        <kw-btn
          dense
          grid-action
          :label="$t('MSG_BTN_DEL')"
          @click="onClickDelete"
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
          :label="t('MSG_BTN_PRTG')"
          @click="onClickPrintEl"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          dense
          primary
          :label="$t('MSG_TXT_ERR_RGST')"
          @click="onClickErrorCodeRgst('','','','','','')"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :page-size="pageInfo.pageSize"
        :visible-rows="10"
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
import { codeUtil, useMeta, useDataService, getComponentType, defineGrid, gridUtil, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import { printElement } from '~common/utils/common';

const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();
const { modal, notify } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;
const searchParams = ref({
  pdGrpCd: '',
  pdCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GRP_CD',
  'COD_YN',
);

const productCode = ref([]);
async function fetchProducts() {
  const res = await dataService.get('/sms/wells/service/service-processing/products', { params: { pdGrpCd: searchParams.value.pdGrpCd } });
  productCode.value = res.data;
}
watch(() => searchParams.value.pdGrpCd, async (val) => {
  if (val === '') {
    productCode.value = [];
    searchParams.value.pdCd = '';
    return;
  }
  await fetchProducts();
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/error-code/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: products, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(products);
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
  const res = await dataService.get('/sms/wells/service/error-code/excel-download', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRows.length > 0) {
    const result = await dataService.delete('/sms/wells/service/error-code', { data: [...deletedRows] });
    if (result.data.processCount > 0) {
      notify(t('MSG_ALT_SAVE_COMP'));
    } else {
      notify(t('MSG_ALT_PROC_FAIL'));
    }
    await fetchData();
  }
}

async function onClickErrorCodeRgst(pdCd, errCn, errDvCn, errCausCn, errImageUId, errImageDocId, flag) {
  console.log(errImageUId);
  console.log(errImageDocId);
  const { result: isChanged } = await modal({
    component: 'WwsnyErrorCodeRegP',
    componentProps: { pdCd, errCn, errDvCn, errCausCn, errImageUId, errImageDocId, flag },
  });

  if (isChanged) {
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

const pageRef = ref();
async function onClickPrintEl() {
  printElement(pageRef);
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'errCn' },
    { fieldName: 'errDvCn' },
    { fieldName: 'errCausCn' },
    { fieldName: 'errImageYn' },
    { fieldName: 'errImageUId' },
    { fieldName: 'errImageDocId' },
  ];
  const columns = [
    { fieldName: 'pdNm',
      header: t('MSG_TXT_ITM_NM'),
      width: '120',
      styleName: 'text-left',
    },
    { fieldName: 'errCn',
      header: t('MSG_TXT_ERR_TP'),
      width: '130',
      styleName: 'text-left',
    },
    { fieldName: 'errDvCn',
      header: t('MSG_TXT_ERR_CN'),
      width: '130',
      styleName: 'text-left',
    },
    { fieldName: 'errCausCn',
      header: t('MSG_TXT_ERR_DTL'),
      width: '200',
      styleName: 'text-left',
    },
    { fieldName: 'errImageYn',
      header: t('MSG_TXT_IMG'),
      width: '100',
      styleName: 'text-center',
      options: codes.COD_YN,
      renderer: {
        type: 'button',
        hideWhenEmpty: true,
      },
      displayCallback: () => t('MSG_TXT_IMG_BRWS'),
    },
  ];

  const columnLayout = [
    'pdNm',
    'errCn',
    'errDvCn',
    'errCausCn',
    'errImageYn',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    const { errImageUId } = g.getValues(itemIndex);
    console.log(errImageUId);
    if (column === 'errImageYn') {
      await modal({
        component: 'ZwcmzImagePreviewP',
        componentProps: { files: [
          { fileUid: errImageUId },
        ] }, // fileUid만 주면 됨
      });
    }
  };

  // eslint-disable-next-line no-unused-vars
  view.onCellDblClicked = (grid, clickData) => {
    const currentDataRow = view.getCurrent().dataRow;
    const rowData = gridUtil.getRowValue(view, currentDataRow);

    const { pdCd, errCn, errDvCn, errCausCn, errImageUId, errImageDocId } = rowData;
    onClickErrorCodeRgst(pdCd, errCn, errDvCn, errCausCn, errImageUId, errImageDocId, 'U');
  };
});
</script>
