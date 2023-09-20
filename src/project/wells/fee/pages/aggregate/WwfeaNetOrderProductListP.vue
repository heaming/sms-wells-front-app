<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaNetOrderProductListP - 미등록 상품 조회 팝업
3. 작성자 : min-kyu bae
4. 작성일 : 2023.09.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 미등록 상품 조회 팝업 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="totalCount"
        />
      </template>
      <kw-btn
        v-permission:download
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="totalCount === 0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :visible-rows="20"
      @init="initGrdPlar"
    />
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, gridUtil, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// ------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const { currentRoute } = useRouter();
const codes = await codeUtil.getMultiCodes(
  'OG_TP_CD',
);

const props = defineProps({

  perfYm: {
    type: String,
    default: '',
  },
  feeTcntDvCd: {
    type: String,
    default: '',
  },
});

const searchParams = ref({
  perfYm: props.perfYm,
  feeTcntDvCd: props.feeTcntDvCd,
});

let cachedParams;
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/fee/monthly-net/product-list', { params: cachedParams });
  totalCount.value = res.data.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  cachedParams = cloneDeep(searchParams.value);
  const response = await dataService.get('/sms/wells/fee/monthly-net/product-list', { params: cachedParams });
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

onMounted(async () => {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdPlar = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'ogTpCd', header: t('MSG_TXT_OG_TP'), width: '121', styleName: 'text-center', options: codes.OG_TP_CD },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '200', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-center' },
    { fieldName: 'pdCnt', header: t('MSG_TXT_COUNT'), width: '100', dataType: 'number', styleName: 'text-right', numberFormat: '#,##0' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
