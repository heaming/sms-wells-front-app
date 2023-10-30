<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC (배정관리)
 2. 프로그램 ID : WwsncExpProductStateP - 예정부품현황(K-W-SV-U-0038P01)
 3. 작성자 : leeminwoo
 4. 작성일 : 2023.10.13
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 예정부품현황 팝업 (http://localhost:3000/#/service/wwsnc-exp-product-state)
 ****************************************************************************************************
--->
<template>
  <kw-popup
    size="3xl"
    title="예정부품현황"
    no-action
  >
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
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_DOWN')"
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
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </kw-popup>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { codeUtil, getComponentType, defineGrid, gridUtil, useDataService } from 'kw-lib';
import { onMounted } from 'vue';
import { cloneDeep } from 'lodash-es';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { currentRoute } = useRouter();

const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/exp-product-state';

let cachedParams;

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const props = defineProps({
  baseYm: {
    type: String,
    required: true,
    default: '',
  },
  ogId: {
    type: String,
    required: true,
    default: '',
  },
  pdGrpCd: {
    type: String,
    required: true,
    default: '',
  },
  pdCd: {
    type: String,
    required: false,
    default: '',
  },
  cstSvAsnNo: {
    type: String,
    required: false,
    default: '',
  },
});

const searchParams = ref({
  baseYm: props.baseYm,
  ogId: props.ogId,
  pdGrpCd: props.pdGrpCd,
  pdCd: props.pdCd,
  cstSvAsnNo: props.cstSvAsnNo,
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: items, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(items);

  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

onMounted(async () => {
  await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'puQty' },
    { fieldName: 'ogGdQty' },
    { fieldName: 'indvGdQty' },
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_MATI_CD'), width: '150', styleName: 'text-center' }, // 자재코드
    { fieldName: 'pdNm', header: t('MSG_TXT_EXP_ITM'), width: '400', styleName: 'text-left' }, // 예정품목
    { fieldName: 'puQty', header: t('MSG_TXT_NCST_QTY'), width: '100', styleName: 'text-center', dataType: 'number', numberFormat: '#,##0' }, // 필요수량
    { fieldName: 'ogGdQty', header: t('MSG_TXT_OG_STOC'), width: '100', styleName: 'text-center', dataType: 'number', numberFormat: '#,##0' }, // 조직재고
    { fieldName: 'indvGdQty', header: t('MSG_TXT_INDV_STOC'), width: '100', styleName: 'text-center', dataType: 'number', numberFormat: '#,##0' }, // 개인재고
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
