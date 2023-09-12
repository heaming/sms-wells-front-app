<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaPcsvOutOfStorageStorageMgtM - 택배설치상품 출고관리
3. 작성자 : jungheejin
4. 작성일 : 2023-05-25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 택배설치상품 출고관리 http://localhost:3000/#/service/wwsna-pcsv-out-of-storage-mgt
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_DELV_WARE')">
          <kw-select
            v-model="searchParams.wkWareNo"
            :options="logisticsCenters"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_ITM_NM')">
          <kw-select
            v-model="searchParams.lgstWkMthdCd"
            :options="products"
            option-value="lgstWkMthdCd"
            option-label="lgstWkMthdPdNm"
            first-option="select"
            first-option-value=""
            placeholder="선택"
            rules="required"
            :label="$t('MSG_TXT_ITM_NM')"
            class="w230"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_OSTR_DV')">
          <kw-select
            v-model="searchParams.svBizDclsfCd"
            :options="filterSvBizDclsfCd"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_WK_STS')">
          <kw-select
            v-model="searchParams.findGb"
            :options="customCodes.findGb"
            @change="onChangeCompStatus"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          v-if="!isCompStatus"
          :colspan="2"
          :label="$t('MSG_TXT_CNTR_DATE')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_CNTR_DATE')"
            rules="date_range_required"
          />
        </kw-search-item>
        <kw-search-item
          v-if="isCompStatus"
          :colspan="2"
          :label="$t('MSG_TXT_OSTR_CNFM_DT')"
          class="w315"
        >
          <kw-date-picker
            v-model="searchParams.vstFshDt"
            :label="$t('MSG_TXT_OSTR_CNFM_DT')"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          v-show="isWaitStatus"
          :label="$t('MSG_TXT_SEL_LIMIT_CNT')"
        >
          <kw-input
            v-model="searchParams.selCnt"
            :maxlength="3"
            rules="numeric"
            :label="$t('MSG_TXT_SEL_LIMIT_CNT')"
            clearable
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
        </template>
        <kw-btn
          v-show="isWaitStatus"
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-btn
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
        :total-count="totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { getComponentType, defineGrid, gridUtil, useDataService, useGlobal, codeUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { notify } = useGlobal();
const { t } = useI18n();
const now = dayjs();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/pcsv-out-of-storage';

const codes = await codeUtil.getMultiCodes(
  'SV_BIZ_DCLSF_CD',
);
const filterSvBizDclsfCd = computed(() => codes.SV_BIZ_DCLSF_CD.filter((v) => ['1112', '1113'].includes(v.codeId)).sort((a, b) => (a.codeId > b.codeId ? 1 : -1)));

const customCodes = {
  findGb: [
    { codeId: '0', codeName: t('MSG_TXT_ALL') },
    { codeId: '1', codeName: t('MSG_TXT_WK_FSH') },
    { codeId: '2', codeName: t('MSG_TXT_WORK_PENDING') },
  ],
};
const searchParams = ref({
  startDt: now.startOf('month').format('YYYYMMDD'), // 시작일자
  endDt: now.format('YYYYMMDD'), // 종료일자
  vstFshDt: now.format('YYYYMMDD'),
  wkWareNo: '100002', /* 교원파주물류센터 */
  svBizDclsfCd: '1112', /* 배송출고  */
  lgstWkMthdCd: '',
  findGb: '2', /* 조회 구분 */
  selCnt: '', /* 조회 제한건수  */
});
let cachedParams;
const totalCount = ref(0);
const isCompStatus = ref(false);
const isWaitStatus = ref(true);

const logisticsCenters = ref();
const products = ref();

/* 물류센터 조회 */
async function fetchLogisticsCenters() {
  const res = await dataService.get(`${baseUrl}/logistics-centers`, {});
  logisticsCenters.value = res.data;
}

/* 상품 조회 */
async function fetchProducts() {
  const res = await dataService.get(`${baseUrl}/products`, { params: { svBizDclsfCd: '1112' } });
  products.value = res.data;
}

async function onChangeCompStatus() {
  isCompStatus.value = false;
  isWaitStatus.value = false;
  const { findGb } = searchParams.value;

  const view = grdMainRef.value.getView();
  view.checkBar.visible = false;

  /* 작업완료 */
  if (findGb === '1') {
    isCompStatus.value = true;
  }

  /* 작업대기 */
  if (findGb === '2') {
    isWaitStatus.value = true;
    view.checkBar.visible = true;
  }
}

await fetchLogisticsCenters();
await fetchProducts();

/* 택배 출고관리 조회 */
async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: { ...cachedParams } });
  const list = res.data;

  totalCount.value = list.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
  } else if (await gridUtil.validate(view, { isCheckedOnly: true })) {
    const checkRowProducts = [];
    chkRows.forEach((obj) => {
      // 상품 갯수만큼 셋팅
      for (let cnt = 1; cnt <= obj.partCnt; cnt += 1) {
        checkRowProducts.push(
          {
            pdCd: obj[`partCd${cnt}`],
            pdNm: obj[`partNm${cnt}`],
            useQty: obj[`partQty${cnt}`],
          },
        );
      }
      obj.products = checkRowProducts;
    });
    console.log(chkRows);
    await dataService.post(`${baseUrl}/test`, chkRows);
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrRcpFshDtm', header: t('MSG_TXT_CNTR_DATE'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'svBizDclsfCd', header: t('MSG_TXT_TASK_TYPE_CD'), width: '90', styleName: 'text-center' },
    { fieldName: 'svBizDclsfNm', header: t('MSG_TXT_TASK_TYPE'), width: '110', styleName: 'text-center' },
    { fieldName: 'wkPrgsStatNm', header: t('MSG_TXT_WK_STS'), width: '80', styleName: 'text-center' },
    { fieldName: 'vstFshDt', header: t('MSG_TXT_OSTR_CNFM_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        if (!isEmpty(cntrNo)) {
          return `${cntrNo}-${cntrSn}`;
        }
      },
    },
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'basePdCd', header: t('MSG_TXT_ITM_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'basePdNm', header: t('MSG_TXT_ITM_NM'), width: '300', styleName: 'text-left' },
    { fieldName: 'cralLocaraTno', visible: false }, // [휴대전화번호1]
    { fieldName: 'mexnoEncr', visible: false }, // [휴대전화번호2]
    { fieldName: 'cralIdvTno', // [휴대전화번호3]
      header: t('MSG_TXT_MPNO'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        // 휴대전화번호 3-4-4 형식으로 표시
        if (!isEmpty(value) && value.length === 4) {
          const values = grid.getValues(index.itemIndex);
          return `${values.cralLocaraTno}-${values.mexnoEncr}-${value}`;
        }
      },
    }, // [휴대전화번호]
    { fieldName: 'locaraTno', visible: false }, // [전화번호1]
    { fieldName: 'exnoEncr', visible: false }, // [전화번호2]
    {
      fieldName: 'idvTno', // [전화번호3]
      header: t('MSG_TXT_TEL_NO'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        // 휴대전화번호 3-4-4 형식으로 표시
        if (!isEmpty(value) && value.length === 4) {
          const values = grid.getValues(index.itemIndex);
          return `${values.locaraTno}-${values.exnoEncr}-${value}`;
        }
      },
    },
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '80', styleName: 'text-center' },
    { fieldName: 'rnadr', header: t('MSG_TXT_ADDR'), width: '380', styleName: 'text-left' },
    { fieldName: 'rdadr', header: t('MSG_TXT_ADDR_DTL'), width: '380', styleName: 'text-left' },
    { fieldName: 'reqdDt', header: t('MSG_TXT_DEM_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'rsgFshDt', header: t('MSG_TXT_CANC_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cstSvAsnNo', header: t('MSG_TXT_ASGN_NO'), width: '200', styleName: 'text-center' },
    { fieldName: 'ostrAkNo', header: t('MSG_TXT_SV_OSTR_AK_NO'), width: '200', styleName: 'text-center' },
    { fieldName: 'lgstOstrAkNo', header: t('MSG_TXT_LGST_OSTR_AK_NO'), width: '200', styleName: 'text-center' },
    { fieldName: 'ostrNo', header: t('MSG_TXT_LGST_OSTR_NO'), width: '200', styleName: 'text-center' },
    { fieldName: 'mpacSn', visible: false }, /* 이하 컬럼등은 저장시 사용 */
    { fieldName: 'lgstWkMthdCd', visible: false },
    { fieldName: 'wkWareNo', visible: false },
    { fieldName: 'svBizHclsfCd', visible: false },
    { fieldName: 'wkPrgsStatCd', visible: false },
    { fieldName: 'prtnrNo', visible: false },
    { fieldName: 'pdGdCd', visible: false },
    { fieldName: 'istDt', visible: false },
    { fieldName: 'urgtDvCd', visible: false },
    { fieldName: 'rpbLocaraCd', visible: false },
    { fieldName: 'asRefriDvCd', visible: false },
    { fieldName: 'bfsvcRefriDvCd', visible: false },
    { fieldName: 'sellTpCd', visible: false },
    { fieldName: 'pdUswyCd', visible: false },
    { fieldName: 'siteAwSvTpCd', visible: false },
    { fieldName: 'siteAwAtcCd', visible: false },
    { fieldName: 'asLctCd', visible: false },
    { fieldName: 'asPhnCd', visible: false },
    { fieldName: 'asCausCd', visible: false },
    { fieldName: 'ogTpCd', visible: false },
    { fieldName: 'wareMngtPrtnrNo', visible: false },
    { fieldName: 'wareMngtPrtnrOgTpCd', visible: false },
    { fieldName: 'partCnt', visible: false },
    { fieldName: 'cntrCstNo', visible: false },
    { fieldName: 'ogId', visible: false },
    { fieldName: 'pdGrpCd', visible: false }, //  상품그룹코드
  ];
  // 상품 동적 필드
  const pdColums = [
    { fieldName: 'partCd', header: t('MSG_TXT_ITM_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'partNm', header: t('MSG_TXT_ITM_NM'), width: '150', styleName: 'text-left' },
    {
      fieldName: 'partQty',
      header: t('MSG_TXT_QTY'),
      width: '80',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
    },
  ];

  const columnPdTotals = [];
  const columnPdLayouts = [];
  for (let cnt = 1; cnt <= 10; cnt += 1) { // 상품 갯수 최대 10개
    pdColums.forEach((row) => {
      // 상품 전체 필드
      columnPdTotals.push(
        {
          fieldName: `${row.fieldName}${cnt}`,
          header: row.header,
          width: row.width,
          styleName: row.styleName,
          dataType: row.dataType,
          numberFormat: row.numberFormat,
        },
      );
    });
    // 상품 레이아웃 필드
    columnPdLayouts.push(
      {
        header: `${t('MSG_TXT_OSTR_INF')}${cnt}`,
        direction: 'horizontal',
        items: [`partCd${cnt}`, `partNm${cnt}`, `partQty${cnt}`],
      },
    );
  }
  columns.push(...columnPdTotals);
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.setFixedOptions({ colCount: 6, resizable: true });
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'cntrRcpFshDtm',
    {
      header: t('MSG_TXT_WK_CLS'), // colspan title
      direction: 'horizontal', // merge type
      items: ['svBizDclsfCd', 'svBizDclsfNm'],
    },
    'wkPrgsStatNm',
    'vstFshDt',
    'cntrNo',
    'rcgvpKnm',
    {
      header: t('MSG_TXT_ITM_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['basePdCd', 'basePdNm'],
    },
    'cralIdvTno',
    'idvTno',
    'newAdrZip',
    'rnadr',
    'rdadr',
    ...columnPdLayouts,
    'reqdDt',
    'rsgFshDt',
    'cstSvAsnNo',
    'ostrAkNo',
    'lgstOstrAkNo',
    'ostrNo',
  ]);
});
</script>
