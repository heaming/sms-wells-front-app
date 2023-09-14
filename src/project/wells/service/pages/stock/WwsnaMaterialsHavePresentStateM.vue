<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaMaterialsHavePresentStateM(K-W-SV-U-0112M01) - 자재보유현황
 3. 작성자 : segi 홍세기
 4. 작성일 : 2023.07.27
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 자재보유현황 조회 (http://localhost:3000/#/service/material-have-qty/paging)
 ****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="5"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 수불일자 -->
        <kw-search-item
          :colspan="2"
          :label="t('MSG_TXT_RVPY_DT')"
        >
          <!--rev:230410 :colspan="2" 추가 -->
          <kw-date-range-picker
            v-model:from="searchParams.stFromYmd"
            v-model:to="searchParams.edToYmd"
            rules="date_range_months:1"
            :label="t('MSG_TXT_RVPY_DT')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_MNGT_WARE_NO')"
          :colspan="3"
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :options="codes.WARE_DV_CD"
            :label="$t('MSG_TXT_MNGT_WARE_NO')"
            rules="required"
            @change="onChangeWareHouse"
          />
          <kw-select
            v-model="searchParams.wareNo"
            :options="optionsWareNo"
            option-value="wareNo"
            option-label="wareNm"
            :label="$t('MSG_TXT_MNGT_WARE_NO')"
            first-option="all"
            @change="onChangeCenterHouse"
          />
          <kw-select
            v-model="searchParams.wareDtlDvCd"
            :options="filterCodes.wareSubDtlcd"
            :label="$t('MSG_TXT_MNGT_WARE_NO')"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 상품등급 -->
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRD')"
        >
          <kw-select
            v-model="searchParams.itmGdCd"
            :options="filterCodes.pdGdCd"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_USE_SEL')"
        >
          <kw-select
            v-model="searchParams.useYn"
            :options="codes.USE_YN"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="2"
          required
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            :label="$t('MSG_TXT_ITM_DV')"
            rules="required"
            @change="onChangeItmKndCd"
          />
          <kw-select
            v-model="searchParams.csmbPdCd"
            :options="productCodes"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.csmbPdCdStrt"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.csmbPdCdEnd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SAP_CD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.sapMatCdStrt"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.sapMatCdEnd"
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
          <span class="ml8">{{ t('MSG_TXT_UNIT_EA') }}</span>
        </template>

        <!-- <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        /> -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
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
    </div>
  </kw-page>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { useMeta, useDataService, codeUtil, defineGrid, getComponentType, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import useSnCode from '~sms-wells/service/composables/useSnCode';

const productCodes = ref([]);
const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const store = useStore();
const { getConfig } = useMeta();
const { t } = useI18n();
const { getMonthWarehouse } = useSnCode();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const searchParams = ref({
  stFromYmd: '',
  edToYmd: '',
  wareNo: '',
  wareDtlDvCd: '',
  itmGdCd: '',
  useYn: '',
  itmKndCd: '',
  itmPdCd: '',
  csmbPdCdStrt: '',
  csmbPdCdEnd: '',
  sapMatCdStrt: '',
  sapMatCdEnd: '',
  wareDvCd: '2',
  csmbPdCd: '',
});

const totalCount = ref(0);

const codes = await codeUtil.getMultiCodes(
  'WARE_DV_CD',
  'PD_GD_CD',
  'ITM_KND_CD',
  'WARE_DTL_DV_CD',
  'USE_YN',
  'COD_PAGE_SIZE_OPTIONS',
);

const filterCodes = ref({
  wareDtlDvCd: [],
  pdGdCd: [],
  wareSubDtlcd: [],
});

function wareDtlDvCdFilter() {
  filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['20', '21', '30', '31'].includes(v.codeId));
  filterCodes.value.wareSubDtlcd = codes.WARE_DTL_DV_CD.filter((v) => ['20', '21', '30', '31'].includes(v.codeId));
}

function pdGdCdFilter() {
  filterCodes.value.pdGdCd = codes.PD_GD_CD.filter((v) => ['A', 'B', 'E', 'R', 'X'].includes(v.codeId));
}

const optionsWareNo = ref();
// 창고번호 조회
const onChangeWareHouse = async () => {
  // 창고번호 클리어
  searchParams.value.wareNo = '';
  const result = await dataService.get(
    '/sms/wells/service/material-have-qty/ware-houses',
    { params: {
      baseYm: dayjs().format('YYYYMM'),
      wareDvCd: searchParams.value.wareDvCd,
      wareDtlDvCd: `${searchParams.value.wareDvCd}0`,

    } },
  );
  optionsWareNo.value = result.data;

  if (searchParams.value.wareDvCd === '2') {
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['20', '21'].includes(v.codeId));
    filterCodes.value.wareSubDtlcd = codes.WARE_DTL_DV_CD.filter((v) => ['30', '31'].includes(v.codeId));
  } else if (searchParams.value.wareDvCd === '3') {
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['30', '31'].includes(v.codeId));
    filterCodes.value.wareSubDtlcd = codes.WARE_DTL_DV_CD.filter((v) => ['30', '31'].includes(v.codeId));
  } else {
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['10'].includes(v.codeId));
    filterCodes.value.wareSubDtlcd = codes.WARE_DTL_DV_CD.filter((v) => ['30', '31'].includes(v.codeId));
  }
};

const onChangeCenterHouse = async () => {
  // 창고번호 클리어
  const result = await dataService.get(
    '/sms/wells/service/material-have-qty/ware-houses',
    { params: {
      baseYm: dayjs().format('YYYYMM'),
      wareDvCd: searchParams.value.wareDvCd,
      hgrWareNo: searchParams.value.wareNo,

    } },
  );

  if (searchParams.value.wareDvCd === '2') {
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['20', '21'].includes(v.codeId));
    filterCodes.value.wareSubDtlcd = codes.WARE_DTL_DV_CD.filter((v) => ['30', '31'].includes(v.codeId));
  } else if (searchParams.value.wareDvCd === '3') {
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['30', '31'].includes(v.codeId));
    filterCodes.value.wareSubDtlcd = codes.WARE_DTL_DV_CD.filter((v) => ['30', '31'].includes(v.codeId));
  } else {
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['10'].includes(v.codeId));
    filterCodes.value.wareSubDtlcd = codes.WARE_DTL_DV_CD.filter((v) => ['30', '31'].includes(v.codeId));
  }

  result.data.forEach(async (element) => {
    filterCodes.value.wareSubDtlcd.push({
      codeId: element.wareNo.trim(),
      codeName: element.wareNm.trim(),
    });
  });
};

async function onChangeItmKndCd() {
  const res = await dataService.get(`/sms/wells/service/bs-consumables/${searchParams.value.itmKndCd}/product-codes`);

  productCodes.value = res.data.map((v) => ({ codeId: v.svpdPdCd, codeName: v.svpdNmKor }));
}

const wharehouseParams = ref({
  apyYm: dayjs().format('YYYYMM'),
  userId: store.getters['meta/getUserInfo'].employeeIDNumber,
});

searchParams.value.stStrDt = dayjs().format('YYYYMMDD');
searchParams.value.edStrDt = dayjs().format('YYYYMMDD');

let cachedParams;

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  console.log(cachedParams);

  const { data: { list, pageInfo: pagingResult } } = await dataService.get('/sms/wells/service/material-have-qty/paging', { params: { ...cachedParams, ...pageInfo.value } });

  pageInfo.value = pagingResult;

  list.forEach((row) => {
    row.cntr = `${row.cntrNo}-${row.cntrSn}`;
  });

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.clearCurrent();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/movement-stores/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: 'MovementStorePssList',
    timePostfix: true,
    exportData: response.data,
  });
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

const warehouses = ref();

async function fetchDefaultData() {
  const { userId, apyYm } = wharehouseParams.value;

  warehouses.value = await getMonthWarehouse(userId, apyYm);
}

await Promise.all([
  wareDtlDvCdFilter(),
  pdGdCdFilter(),
  onChangeWareHouse(),

]);

onMounted(async () => {
  await fetchDefaultData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'wareNo' },
    { fieldName: 'wareNm' },
    { fieldName: 'hgrWareNo' },
    { fieldName: 'orderNo' },
    { fieldName: 'onCnt1' },
    { fieldName: 'onQty1' },
    { fieldName: 'onCnt2' },
    { fieldName: 'onQty2' },
    { fieldName: 'onCnt3' },
    { fieldName: 'onQty3' },
  ];

  const columns = [
    { fieldName: 'wareNm', header: t('MSG_TXT_WARE_NM'), width: '240', styleName: 'text-left' },
    { fieldName: 'onCnt1', header: t('MSG_TXT_ITM_N'), width: '120', styleName: 'text-right' },
    { fieldName: 'onQty1', header: t('MSG_TXT_TOT_STOC'), width: '120', styleName: 'text-right' },
    { fieldName: 'onCnt2', header: t('MSG_TXT_ITM_N'), width: '120', styleName: 'text-right' },
    { fieldName: 'onQty2', header: t('MSG_TXT_TOT_STOC'), width: '120', styleName: 'text-right' },
    { fieldName: 'onCnt3', header: t('MSG_TXT_ITM_N'), width: '120', styleName: 'text-right' },
    { fieldName: 'onQty3', header: t('MSG_TXT_TOT_STOC'), width: '120', styleName: 'text-right' },
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.setColumnLayout([
    'wareNm',

    {
      header: t('기초자재'), // 관리기준(관리계정)
      direction: 'horizontal', // merge type
      items: ['onCnt1', 'onQty1'],
    }, // 이관전담당자
    {
      header: t('일반자재'), // 관리기준(관리계정)
      direction: 'horizontal', // merge type
      items: ['onCnt2', 'onQty2'],
    }, // 이관전담당자
    {
      header: t('보유자재'), // 관리기준(관리계정)
      direction: 'horizontal', // merge type
      items: ['onCnt3', 'onQty3'],
    }, // 이관전담당자
  ]);
});
</script>
<style scoped>
</style>
