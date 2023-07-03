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
            v-model="searchParams.pdCd"
            :options="products"
            option-value="pdCd"
            option-label="pdNm"
            first-option="select"
            first-option-value=""
            placeholder="선택"
            rules="required"
            :label="$t('MSG_TXT_ITM_NM')"
            @change="fetchIvcPrntSns"
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
            @change="fetchIvcPrntSns"
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
        <kw-search-item
          v-if="isCompStatus"
          :label="$t('MSG_TXT_OSTR_CNFM_SEQ')"
        >
          <kw-select
            v-model="searchParams.ivcPrntSn"
            :options="ivcPrntSns"
            first-option="select"
            first-option-value=""
            rules="required"
            :label="$t('MSG_TXT_OSTR_CNFM_SEQ')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_STOC_QTY')">
          <kw-input
            v-model="qty"
            readonly
            placeholder=""
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
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
          @click="onClickPrint"
        />
        <kw-btn
          v-if="false"
          v-show="isCompStatus"
          icon="download_on"
          dense
          secondry
          :disable="totalCount === 0"
          @click="onClickExcelDownload3"
        />
        <kw-btn
          v-if="false"
          v-show="isCompStatus"
          icon="download_on"
          dense
          secondry
          :disable="totalCount === 0"
          @click="onClickExcelDownload2"
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
    <!--
    <kw-grid
        ref="grdMainRef2"
        visible-rows="0"
        @init="initGrid2"
      />-->
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
const grdMainRef2 = ref(getComponentType('KwGrid'));
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
  findGb: '2',
  wkWareNo: '100002', /* 교원파주물류센터 */
  svBizDclsfCd: '1112', /* 배송출고  */
  pdCd: '',
  selCnt: '', /* 조회 제한건수  */
  ivcPrntSn: '', /* 출고확정 순번 */
});
let cachedParams;
const totalCount = ref(0);
const qty = ref([]);
const isCompStatus = ref(false);
const isWaitStatus = ref(true);

const logisticsCenters = ref();
const products = ref();
const ivcPrntSns = ref();

/* 물류센터 조회 */
async function fetchLogisticsCenters() {
  const res = await dataService.get(`${baseUrl}/logistics-centers`, {});
  logisticsCenters.value = res.data;
}

/* 상품 조회 */
async function fetchProducts() {
  const res = await dataService.get(`${baseUrl}/products`, { params: { svBizDclsfCd: '1112' } });
  console.log(res);
  products.value = res.data;
}

/* 택배 출고확정순번 조회 */
async function fetchIvcPrntSns() {
  /* 작업완료이면서 상품을 선택했을경우에만 */
  if (isCompStatus.value && searchParams.value.pdCd !== '') {
    const res = await dataService.get(`${baseUrl}/ivc-prntsns`, { params: searchParams.value });
    ivcPrntSns.value = res.data;

    searchParams.value.ivcPrntSn = '1';
  } else {
    searchParams.value.ivcPrntSn = '';
  }
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
    await fetchIvcPrntSns();
  }

  /* 작업대기 */
  if (findGb === '2') {
    isWaitStatus.value = true;
    view.checkBar.visible = true;
  }
}

/* 재고 수량 조회 */
async function fetchStockQty() {
  // 23-06-16 요청에 의한 주석처리
  // const res =  await dataService.get(`${baseUrl}/stock-qty`, { params: { ...searchParams.value } });
  // qty.value = res.data;
}

await fetchLogisticsCenters();
await fetchProducts();
await fetchStockQty();

/* 택배 출고관리 조회 */
async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: { ...cachedParams } });
  const list = res.data;

  totalCount.value = list.length;
  console.log(list);

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
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}
async function onClickExcelDownload2() {
  const view2 = grdMainRef2.value.getView();
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  gridUtil.exportView(view2, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}
async function onClickExcelDownload3() {
  /* TODO 기능정의필요 */
}
async function onClickPrint() {
  // TODO : 출력 기능 연결
  notify('TODO : 출력기능?');
}
async function onClickSave() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
  } else if (await gridUtil.validate(view, { isCheckedOnly: true })) {
    /* 저장시 출고확정 순번조회 */
    const checkParams = { pdCd: chkRows[0].pdCd, svBizDclsfCd: chkRows[0].svBizDclsfCd };
    const res = await dataService.get(`${baseUrl}/ivc-prntsn`, { params: checkParams });
    const ivcPrntSn = res.data;
    /* 저장시 상품 그룹 코드 및 출고확정 순번 설정 */
    chkRows.forEach((obj) => {
      obj.pdGrpCd = products.value?.find((item) => item.pdCd === obj.pdCd)?.pdGrpCd;
      obj.ivcPrntSn = ivcPrntSn;
    });
    console.log(chkRows);

    const response = await dataService.post(`${baseUrl}`, chkRows);
    console.log(response);
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrRcpFshDtm' },
    { fieldName: 'svBizDclsfCd' },
    { fieldName: 'svBizDclsfNm' },
    { fieldName: 'wkPrgsStatNm' },
    { fieldName: 'vstFshDt' },
    { fieldName: 'cntrNo' },
    { fieldName: 'rcgvpKnm' },
    { fieldName: 'basePdCd' },
    { fieldName: 'basePdNm' },
    { fieldName: 'cralLocaraTno' }, // [휴대전화번호1]
    { fieldName: 'mexnoEncr' }, // [휴대전화번호2]
    { fieldName: 'cralIdvTno' }, // [휴대전화번호3]
    { fieldName: 'locaraTno' }, // [전화번호1]
    { fieldName: 'exnoEncr' }, // [전화번호2]
    { fieldName: 'idvTno' }, // [전화번호3]
    { fieldName: 'newAdrZip' },
    { fieldName: 'rnadr' },
    { fieldName: 'rdadr' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'useQty' },
    { fieldName: 'reqdDt' },
    { fieldName: 'rsgFshDt' },
    { fieldName: 'cstSvAsnNo' },
    { fieldName: 'wkWareNo' }, /* 이하 컬럼등은 저장시 사용 */
    { fieldName: 'svBizHclsfCd' },
    { fieldName: 'wkPrgsStatCd' },
    { fieldName: 'cntrSn' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'pdGdCd' },
    { fieldName: 'istDt' },
    { fieldName: 'urgtYn' },
    { fieldName: 'rpbLocaraCd' },
    { fieldName: 'asRefriDvCd' },
    { fieldName: 'bfsvcRefriDvCd' },
    { fieldName: 'filtSellTpCd' },
    { fieldName: 'pdSellTpCd' },
    { fieldName: 'pdUswyCd' },
    { fieldName: 'siteAwSvTpCd' },
    { fieldName: 'siteAwAtcCd' },
    { fieldName: 'asLctCd' },
    { fieldName: 'asPhnCd' },
    { fieldName: 'asCausCd' },
    { fieldName: 'ogTpCd' },
    { fieldName: 'wareMngtPrtnrNo' },
  ];

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
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'basePdCd', header: t('MSG_TXT_ITM_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'basePdNm', header: t('MSG_TXT_ITM_NM'), width: '300', styleName: 'text-left' },
    { fieldName: 'cralIdvTno',
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
    {
      fieldName: 'idvTno',
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
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '230', styleName: 'text-left' },
    { fieldName: 'useQty', header: t('MSG_TXT_QTY'), width: '90', styleName: 'text-right' },
    { fieldName: 'reqdDt', header: t('MSG_TXT_DEM_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'rsgFshDt', header: t('MSG_TXT_CANC_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cstSvAsnNo', header: t('MSG_TXT_ASGN_NO'), width: '200', styleName: 'text-center' },
  ];
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
    {
      header: t('MSG_TXT_OSTR_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['pdCd', 'pdNm', 'useQty'],
    },
    'reqdDt',
    'rsgFshDt',
    'cstSvAsnNo',

  ]);
});
//  23-06-16 요청에 의한 주석처리
// -- 송장 다운로드 미노출
// -- 집계표 다운로드 미노출
// -- 재고수량 미노출
// const initGrid2 = defineGrid((data, view) => {
//   const fields = [
//     { fieldName: 'cntrNo' },
//     { fieldName: 'rcgvpKnm' },
//     { fieldName: 'vstFshDt' },
//     { fieldName: 'pdNm' },
//     { fieldName: 'col5' },
//     { fieldName: 'col6' },
//     { fieldName: 'col7' },
//     { fieldName: 'col8' },
//     { fieldName: 'col9' },
//     { fieldName: 'col10' },
//     { fieldName: 'col11' },
//     { fieldName: 'col12' },
//     { fieldName: 'col13' },
//     { fieldName: 'wkPrgsStatNm' },
//     { fieldName: 'col15' },
//     { fieldName: 'col16' },
//     { fieldName: 'col17' },
//     { fieldName: 'col18' },
//     { fieldName: 'col19' },
//   ];
//
//   const columns = [
//     { fieldName: 'cntrNo', header: '고객코드', width: '150', styleName: 'text-center' },
//     { fieldName: 'rcgvpKnm', header: '고객명', width: '150', styleName: 'text-center' },
//     { fieldName: 'vstFshDt', header: '출고확정일', width: '150', styleName: 'text-center' },
//     { fieldName: 'pdNm', header: '상품명:수량', width: '150', styleName: 'text-center' },
//     { fieldName: 'wkPrgsStatNm', header: '작업결과', width: '150', styleName: 'text-center' },
//     { fieldName: 'col15', header: '우편번호', width: '150', styleName: 'text-center' },
//     { fieldName: 'col16', header: '주소', width: '150', styleName: 'text-center' },
//     { fieldName: 'col17', header: '전화번호', width: '150', styleName: 'text-center' },
//     { fieldName: 'col18', header: '휴대전화', width: '150', styleName: 'text-center' },
//     { fieldName: 'col19', header: '메모', width: '150', styleName: 'text-center' },
//   ];
//
//   data.setFields(fields);
//   view.setColumns(columns);
//   view.rowIndicator.visible = false;
// });

</script>
