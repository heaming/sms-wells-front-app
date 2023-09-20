<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaQomAsnStocMmtAgrgListM(W-SV-U-0127M01) - 물량배정 재고이송량 집계
 3. 작성자 : SaeRomI.Kim
 4. 작성일 : 2023.08.04
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 관리자가 해당월의 물량배정 재고이송량 집계표를 조회하는 화면 (http://localhost:3000/#/service/wwsna-qom-asn-stoc-mmt-agrg-list)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="`BS${t('MSG_TXT_ITM_DV')}`"
        >
          <kw-select
            v-model="searchParams.bsItmKndCd"
            :options="filterCodes.itmKndCd"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            class="w150"
            first-option="all"
            @change="onChangeItmKndCd"
          />
          <kw-select
            v-model="searchParams.itmPdCd"
            :options="optionsItmPdCd"
            :label="$t('MSG_TXT_ITM_NM')"
            option-value="pdCd"
            option-label="pdNm"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item :label="`${t('MSG_TXT_ORDERSELECT_TITLE')}${t('MSG_TXT_SELT')}`">
          <kw-option-group
            v-model="searchParams.cntGb"
            type="checkbox"
            :options="[
              {codeId: '1', codeName: `${1}${t('MSG_TXT_ORDERSELECT_TITLE')}`},
              {codeId: '2', codeName: `${2}${t('MSG_TXT_ORDERSELECT_TITLE')}`},
              {codeId: '3', codeName: `${3}${t('MSG_TXT_ORDERSELECT_TITLE')}`},
              {codeId: 'BS', codeName: `${t('MSG_TXT_THM')}${t('MSG_TXT_BEFORE_SERVICE')}`},
            ]"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="`BS${t('MSG_TXT_YM')}`"
          required
        >
          <kw-date-picker
            v-model="searchParams.asnOjYm"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="`${t('MSG_TXT_ASGN')}W/M`"
        >
          <kw-option-group
            v-model="searchParams.qomAsnGb"
            type="checkbox"
            :options="[
              {codeId: 'INDI', codeName: `${t('MSG_TXT_INDV')}W/M`},
              {codeId: 'INDE', codeName: `${t('MSG_TXT_INDP')}W/M`},
            ]"
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
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }} : EA)</span>
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

import { codeUtil, useDataService, getComponentType, gridUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty, cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { currentRoute } = useRouter();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  bsItmKndCd: '',
  itmKndCd: '',
  itmPdCd: '',
  bsYn: 'N',
  cntGb: [],
  asnOjYm: dayjs().format('YYYYMM'),
  qomAsnGb: [],
});

const codes = await codeUtil.getMultiCodes(
  'ITM_KND_CD',
);

const filterCodes = ref({
  itmKndCd: [],
});

function itmKndCdFilter() {
  filterCodes.value.itmKndCd = codes.ITM_KND_CD.filter((v) => ['5', '6'].includes(v.codeId));
}

const optionsItmPdCd = ref();
const optionsAllItmPdCd = ref();

// 품목조회
const getProducts = async () => {
  const result = await dataService.get('/sms/wells/service/qom-asn-stock-aggs/products');
  optionsItmPdCd.value = result.data;
  optionsAllItmPdCd.value = result.data;
};

// 품목종류 변경 시 품목 필터링
function onChangeItmKndCd() {
  // 품목코드 클리어
  searchParams.value.itmPdCd = '';
  const { itmKndCd } = searchParams.value;

  if (isEmpty(itmKndCd)) {
    optionsItmPdCd.value = optionsAllItmPdCd.value;
    return;
  }

  optionsItmPdCd.value = optionsAllItmPdCd.value.filter((v) => itmKndCd === v.itmKndCd);
}

await Promise.all([
  itmKndCdFilter(),
  getProducts(),
]);

const totalCount = ref(0);
// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/qom-asn-stock-aggs', { params: { ...cachedParams } });
  const item = res.data;
  totalCount.value = item.length;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(item);
  }
}

function convertCheckBox() {
  const { cntGb, qomAsnGb } = cachedParams;
  const indiYn = isEmpty(qomAsnGb.find((v) => v === 'INDI')) ? 'N' : 'Y';
  const indeYn = isEmpty(qomAsnGb.find((v) => v === 'INDE')) ? 'N' : 'Y';

  const bsYn = isEmpty(cntGb.find((v) => v === 'BS')) ? 'N' : 'Y';
  const cntYn1 = isEmpty(cntGb.find((v) => v === '1')) ? 'N' : 'Y';
  const cntYn2 = isEmpty(cntGb.find((v) => v === '2')) ? 'N' : 'Y';
  const cntYn3 = isEmpty(cntGb.find((v) => v === '3')) ? 'N' : 'Y';

  cachedParams.qomAsnGb = indiYn + indeYn;
  cachedParams.bsYn = bsYn;
  cachedParams.cntGb = cntYn1 + cntYn2 + cntYn3;
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  convertCheckBox();
  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/qom-asn-stock-aggs', { params: cachedParams });

  gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' },
    { fieldName: 'itmPdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'bsQty', dataType: 'number' },
    { fieldName: 'indiQty1', dataType: 'number' },
    { fieldName: 'indiQty2', dataType: 'number' },
    { fieldName: 'indiQty3', dataType: 'number' },
    { fieldName: 'indeQty1', dataType: 'number' },
    { fieldName: 'indeQty2', dataType: 'number' },
    { fieldName: 'indeQty3', dataType: 'number' },
    { fieldName: 'qomAsnQty', dataType: 'number' },
    { fieldName: 'qty100002', dataType: 'number' },
    { fieldName: 'qty100008', dataType: 'number' },
    { fieldName: 'lgstQty', dataType: 'number' },
    { fieldName: 'centerQty', dataType: 'number' },
    { fieldName: 'centerIndiQty', dataType: 'number' },
    { fieldName: 'lgstLackQty', dataType: 'number' },
    { fieldName: 'lackQty100008', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '120', styleName: 'text-center', dataType: 'text' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '120', styleName: 'text-center', dataType: 'text' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '150', styleName: 'text-left', dataType: 'text', footer: { text: t('MSG_TXT_SUM'), styleName: 'text-center' } },
    { fieldName: 'bsQty',
      header: `${t('MSG_TXT_THM')}${t('MSG_TXT_BS')}`,
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'qomAsnQty',
      header: t('MSG_TXT_AGG'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'indiQty1',
      header: t('MSG_TXT_1ST'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'indiQty2',
      header: t('MSG_TXT_2ST'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'indiQty3',
      header: t('MSG_TXT_3ST'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'indeQty1',
      header: t('MSG_TXT_1ST'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'indeQty2',
      header: t('MSG_TXT_2ST'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'indeQty3',
      header: t('MSG_TXT_3ST'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'lgstQty',
      header: t('MSG_TXT_AGG'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'qty100002',
      header: t('MSG_TXT_PAJU'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'qty100008',
      header: t('MSG_TXT_SEONG_SU'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'lgstLackQty',
      header: t('MSG_TXT_PAJU_SEONG_SU'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'lackQty100008',
      header: t('MSG_TXT_SEONG_SU'),
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'centerQty',
      header: `${t('MSG_TXT_BSNS_CNTR')} ${t('MSG_TXT_OG')}${t('MSG_TXT_STOC')}`,
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'centerIndiQty',
      header: `${t('MSG_TXT_BSNS_CNTR')} ${t('MSG_TXT_INDV')}${t('MSG_TXT_STOC')}`,
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
  ];

  // 헤더 부분 merge
  const layoutColumns = ['sapMatCd', 'itmPdCd', 'pdNm', 'bsQty',
    { direction: 'horizontal',
      header: { text: `${t('MSG_TXT_QOM')}${t('MSG_TXT_ASGN')}` },
      items: ['qomAsnQty',
        { direction: 'horizontal',
          header: { text: `${t('MSG_TXT_INDV')} W/M` },
          items: ['indiQty1', 'indiQty2', 'indiQty3'],
        },
        { direction: 'horizontal',
          header: { text: `${t('MSG_TXT_INDP')} W/M` },
          items: ['indeQty1', 'indeQty2', 'indeQty3'],
        },
      ],
    },
    { direction: 'horizontal',
      header: { text: `${t('MSG_TXT_LGST')}${t('MSG_TXT_STOC')}` },
      items: ['lgstQty', 'qty100002', 'qty100008'],
    },
    { direction: 'horizontal',
      header: { text: `${t('MSG_TXT_LGST')} ${t('MSG_TXT_STG')}${t('MSG_TXT_STOC')}` },
      items: ['lgstLackQty', 'lackQty100008'],
    },
    'centerQty', 'centerIndiQty',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(layoutColumns);
  view.setFooters({ visible: true });
  view.setOptions({ summaryMode: 'aggregate' });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
