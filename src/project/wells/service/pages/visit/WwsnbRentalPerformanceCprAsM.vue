<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : [K-W-SV-U-0032M01] WwsnbRentalPerformanceCprAsM.vue - 렌탈 실적 대비 A/S율 집계 현황
3. 작성자 : 홍세기
4. 작성일 : 2023.06.27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈계정 설치대비 AS 건수 비율을 월별로 조회
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
          :label="$t('MSG_TXT_VST_YM')"
          required
        >
          <!--방문년월-->
          <kw-date-picker
            v-model="searchParams.baseY"
            type="year"
            rules="required"
            :name="$t('MSG_TXT_VST_YM')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('서비스유형')">
          <!--중분류(서비스유형)-->
          <kw-select
            v-model="searchParams.svType"
            :options="serviceTypes"
            class="w147"
            @change="onChangeSearchType"
          />
        </kw-search-item>
        <kw-search-item :label="$t('불량구분')">
          <!--소분류(불량구분)-->
          <kw-select
            v-model="searchParams.badDivide"
            :options="badGbTypes"
            class="w147"
            @change="onChangeSearchType"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 상품그룹 -->
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            class="w233"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="products"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
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
        :visible-rows="10"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useMeta, codeUtil, gridUtil } from 'kw-lib';
import { isEmpty } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GRP_CD',
);

const grdMainRef = ref();

const searchParams = ref({
  baseY: '',
  svType: '',
  badDivide: '',
  pdGrpCd: '',
  pdCd: '',
});

const products = ref([]);
async function fetchProducts() {
  const res = await dataService.get('/sms/wells/service/service-processing/products', { params: { pdGrpCd: searchParams.value.pdGrpCd } });
  products.value = res.data;
}
watch(() => searchParams.value.pdGrpCd, async (val) => {
  if (isEmpty(val)) {
    products.value = [];
    return;
  }
  await fetchProducts();
}, { immediate: true });

const ArticlesName = [
  { codeId: '1', codeName: 'A/S건' },
  { codeId: '2', codeName: 'A/S율(%)' },
  { codeId: '3', codeName: '엔지니어비용(원)' },
  { codeId: '4', codeName: '부품지용(원)' },
  { codeId: '5', codeName: '합계' },
];

const serviceTypes = [
  { codeId: '3112', codeName: '특별A/S' },
  { codeId: '3210', codeName: '제품원인' },
  { codeId: '3110', codeName: '제품A/S' },
];

const badGbTypes = [
  { codeId: '100R', codeName: '제품불량' },
  { codeId: '500R', codeName: '엔지니어과실' },
  { codeId: '400R', codeName: '매니저과실' },
  { codeId: '700R', codeName: '품질개선(리콜) 서비스' },
];

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/rental-performance-cpr/aggregate', { params: searchParams.value });

  pageInfo.value.totalCount = res.data.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function onClickSearch() {
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
async function initGrdMain(data, view) {
  const fields = [
    { fieldName: 'atcNm' }, // 항목명
    { fieldName: 'totalCnt', dataType: 'number' }, // 합계
    { fieldName: 'm01', dataType: 'number' }, // 1월
    { fieldName: 'm02', dataType: 'number' }, // 1월
    { fieldName: 'm03', dataType: 'number' }, // 1월
    { fieldName: 'm04', dataType: 'number' }, // 1월
    { fieldName: 'm05', dataType: 'number' }, // 1월
    { fieldName: 'm06', dataType: 'number' }, // 1월
    { fieldName: 'm07', dataType: 'number' }, // 1월
    { fieldName: 'm08', dataType: 'number' }, // 1월
    { fieldName: 'm09', dataType: 'number' }, // 1월
    { fieldName: 'm10', dataType: 'number' }, // 1월
    { fieldName: 'm11', dataType: 'number' }, // 1월
    { fieldName: 'm12', dataType: 'number' }, // 1월
  ];

  const columns = [
    { fieldName: 'atcNm',
      header: t(' '),
      width: '90',
      styleName: 'text-center',
      options: ArticlesName }, // 항목명
    { fieldName: 'totalCnt', header: t('MSG_TXT_SUM'), width: '100', styleName: 'text-right' }, // 합계
    { fieldName: 'm01', header: t('MSG_TXT_JAN'), width: '70', styleName: 'text-right' }, // 1월
    { fieldName: 'm02', header: t('MSG_TXT_FEB'), width: '70', styleName: 'text-right' }, // 2월
    { fieldName: 'm03', header: t('MSG_TXT_MAR'), width: '70', styleName: 'text-right' }, // 3월
    { fieldName: 'm04', header: t('MSG_TXT_APRI'), width: '70', styleName: 'text-right' }, // 4월
    { fieldName: 'm05', header: t('MSG_TXT_MAY'), width: '70', styleName: 'text-right' }, // 5월
    { fieldName: 'm06', header: t('MSG_TXT_JUN'), width: '70', styleName: 'text-right' }, // 6월
    { fieldName: 'm07', header: t('MSG_TXT_JUL'), width: '70', styleName: 'text-right' }, // 7월
    { fieldName: 'm08', header: t('MSG_TXT_AUG'), width: '70', styleName: 'text-right' }, // 8월
    { fieldName: 'm09', header: t('MSG_TXT_SEPT'), width: '70', styleName: 'text-right' }, // 9월
    { fieldName: 'm10', header: t('MSG_TXT_OCT'), width: '70', styleName: 'text-right' }, // 10월
    { fieldName: 'm11', header: t('MSG_TXT_NOV'), width: '70', styleName: 'text-right' }, // 11월
    { fieldName: 'm12', header: t('MSG_TXT_DECE'), width: '70', styleName: 'text-right' }, // 12월

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}
</script>
