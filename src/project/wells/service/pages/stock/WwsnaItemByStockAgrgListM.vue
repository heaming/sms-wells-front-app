<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaItemByStockAgrgListM(W-SV-U-0140M01) - 품목별 재고 집계
 3. 작성자 : SaeRomI.Kim
 4. 작성일 : 2023.08.08
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 기준일자로 품목별 재고집계현황을 조회하는 화면 (http://localhost:3000/#/service/wwsna-item-by-stock-agrg-list)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_DT')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseDt"
            type="date"
            :label="$t('MSG_TXT_BASE_YM')"
            rules="required"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_STOC_TYPE')"
        >
          <kw-select
            v-model="searchParams.matTypCd"
            :options="filterCodes.matMngtDvCd"
            first-option="all"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            first-option="all"
            @change="onChangeItmKndCd"
          />
          <kw-select
            v-model="searchParams.itmPdCds"
            :options="optionsItmPdCd"
            option-value="pdCd"
            option-label="pdNm"
            :multiple="true"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_WARE_DV')"
          required
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :options="filterCodes.wareDvCd"
            rules="required"
          />
        </kw-search-item>

        <kw-search-item :label="`${t('MSG_TXT_WARE')}${t('MSG_TXT_TYPE')}`">
          <kw-select
            v-model="searchParams.wareTpCd"
            :options="[
              {codeId: 'CORP', codeName: t('MSG_TXT_OG_WARE')},
              {codeId: 'INDI', codeName: t('MSG_TXT_INDV_WARE')},
            ]"
            first-option="all"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_GD')">
          <kw-select
            v-model="searchParams.itmGdCd"
            :options="filterCodes.pdGdCd"
            first-option="all"
          />
        </kw-search-item>

        <kw-search-item :label="t('MSG_TXT_MAT_DV')">
          <kw-select
            v-model="searchParams.matUtlzDvCd"
            :options="codes.CMN_PART_DV_CD"
            :label="$t('MSG_TXT_MAT_DV')"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_USE_SEL')">
          <kw-select
            v-model="searchParams.useYn"
            :options="codes.USE_YN"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
        >
          <kw-input
            v-model="searchParams.itmPdCd"
            type="text"
            :label="$t('MSG_TXT_ITM_CD')"
            rules="alpha_num|max:10"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SAPCD')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.strtSapCd"
            :label="$t('MSG_TXT_STRT_SAP_CD')"
            rules="numeric|max:18"
            @change="onChangeStrtSapCd"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.endSapCd"
            :label="$t('MSG_TXT_END_SAP_CD')"
            rules="numeric|max:18"
            @change="onChangeEndSapCd"
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
          <span class="ml8">
            ({{ t('MSG_TXT_UNIT') }} : EA)
          </span>
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

import { codeUtil, useMeta, useDataService, getComponentType, gridUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  baseDt: dayjs().format('YYYYMMDD'),
  matTypCd: '',
  itmKndCd: '',
  itmPdCds: [],
  itmGdCd: '',
  useYn: '',
  matUtlzDvCd: '',
  wareDvCd: '2',
  wareTpCd: '',
  itmPdCd: '',
  strtSapCd: '',
  endSapCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

let gridView;
let gridData;
let fieldsObj;
let tmpFields = [];

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'WARE_DV_CD',
  'MAT_MNGT_DV_CD',
  'ITM_KND_CD',
  'PD_GD_CD',
  'USE_YN',
  'CMN_PART_DV_CD',
);

const filterCodes = ref({
  wareDvCd: [],
  matMngtDvCd: [],
  pdGdCd: [],
});

function codeFilter() {
  filterCodes.value.wareDvCd = codes.WARE_DV_CD.filter((v) => ['2', '3'].includes(v.codeId));
  filterCodes.value.matMngtDvCd = codes.MAT_MNGT_DV_CD.filter((v) => ['1', '2', '3', '4', '5'].includes(v.codeId));
  filterCodes.value.pdGdCd = codes.PD_GD_CD.filter((v) => ['A', 'B', 'E', 'R', 'X'].includes(v.codeId));
}

const optionsItmPdCd = ref();
const optionsAllItmPdCd = ref();

// 품목조회
const getProducts = async () => {
  const result = await dataService.get('/sms/wells/service/monthly-by-stock-state/products');
  optionsItmPdCd.value = result.data;
  optionsAllItmPdCd.value = result.data;
};

// 품목종류 변경 시 품목 필터링
function onChangeItmKndCd() {
  // 품목코드 클리어
  searchParams.value.itmPdCds = [];
  const { itmKndCd } = searchParams.value;

  if (isEmpty(itmKndCd)) {
    optionsItmPdCd.value = optionsAllItmPdCd.value;
    return;
  }

  optionsItmPdCd.value = optionsAllItmPdCd.value.filter((v) => itmKndCd === v.itmKndCd);
}

function onChangeStrtSapCd() {
  const { strtSapCd, endSapCd } = searchParams.value;

  if (!isEmpty(strtSapCd) && !isEmpty(endSapCd) && strtSapCd > endSapCd) {
    searchParams.value.strtSapCd = strtSapCd;
    searchParams.value.endSapCd = strtSapCd;
  }
}

function onChangeEndSapCd() {
  const { strtSapCd, endSapCd } = searchParams.value;

  if (!isEmpty(strtSapCd) && !isEmpty(endSapCd) && strtSapCd > endSapCd) {
    searchParams.value.strtSapCd = endSapCd;
    searchParams.value.endSapCd = endSapCd;
  }
}

await Promise.all([
  codeFilter(),
  getProducts(),
]);

// 창고조회
async function getWareHouseList() {
  const { baseDt, wareDvCd } = cachedParams;

  const result = await dataService.get(
    '/sms/wells/service/item-by-stock-aggs/ware-houses',
    { params: { baseDt, wareDvCd } },
  );
  if (!isEmpty(result.data)) {
    const wareHouses = result.data;

    // 필드 구성
    tmpFields.push(
      ...wareHouses.map((v) => ({
        fieldName: `qty${v.wareNo}`,
        header: v.wareNm,
        width: '125',
        styleName: 'text-right',
        dataType: 'number',
        footer: {
          expression: 'sum',
          numberFormat: '#,##0.##',
        },
      })),
    );

    // 필드 셋팅
    fieldsObj.setFields();
  }
}

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/item-by-stock-aggs/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: itmGd, pageInfo: pagingResult } = res.data;
  // fetch시에는 총 건수 조회하지 않도록 변경
  pagingResult.needTotalCount = false;
  pageInfo.value = pagingResult;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(itmGd);
    view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  }
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  // 조회버튼 클릭 시에만 총 건수 조회하도록
  pageInfo.value.needTotalCount = true;
  cachedParams = cloneDeep(searchParams.value);
  tmpFields = [];
  // 창고조회
  await getWareHouseList();
  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/item-by-stock-aggs/excel-download', { params: cachedParams, timeout: 360000 });

  gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

fieldsObj = {

  // 그리드 공통컬럼
  defaultFields: [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '300', styleName: 'text-left', footer: { text: t('MSG_TXT_SUM'), styleName: 'text-center' } },
    { fieldName: 'csmrUprcAmt',
      header: t('MSG_TXT_CSPRC'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'leadTime', header: t('TXT_MSG_AS_LDTM'), width: '100', styleName: 'text-right' },
    { fieldName: 'moq', header: t('MSG_TXT_MOQ'), width: '100', styleName: 'text-right' },
    { fieldName: 'qty100002',
      header: `${t('MSG_TXT_KW')}${t('MSG_TXT_PAJU')}`,
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'qty100008',
      header: `${t('MSG_TXT_KW')}${t('MSG_TXT_SEONG_SU')}`,
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'qty200000',
      header: t('MSG_TXT_SV_CNR'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'qty299999',
      header: t('MSG_TXT_EGER'),
      width: '83',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'qty300000',
      header: t('MSG_TXT_BSNS_CNTR'),
      width: '93',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'qty999999',
      header: t('MSG_TXT_AGG'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
  ],

  // 필드 세팅
  setFields() {
    const columns = [...fieldsObj.defaultFields, ...tmpFields];
    const { wareDvCd } = cachedParams;

    // 헤더 부분 merge
    const layoutColumns = ['sapMatCd', 'pdCd', 'pdNm', 'csmrUprcAmt', 'leadTime', 'moq',
      {
        header: t('MSG_TXT_STOC_PS'),
        direction: 'horizontal', // merge type
        items: ['qty100002', 'qty100008', 'qty200000', 'qty299999', 'qty300000', 'qty999999'],
      },
      {
        header: wareDvCd === '2' ? t('MSG_TXT_SV_CNR') : t('MSG_TXT_BSNS_CNTR'),
        direction: 'horizontal', // merge type
        items: [...fieldsObj.getColumnNameArr(tmpFields)],
      },
    ];

    const fields = columns.map(({ fieldName, dataType }) => ({ fieldName, dataType }));

    gridData.setFields(fields);
    gridView.setColumns(columns);

    gridView.setColumnLayout([...layoutColumns]);
    gridView.setFooters({ visible: true });
    gridView.setOptions({ summaryMode: 'aggregate' });

    gridView.setFixedOptions({
      colCount: 3,
    });
  },
  // 리스트에 담겨진 항목 중 fieldName 배열로 가져옴
  getColumnNameArr(objList) {
    return objList.map((v) => v.fieldName);
  },
};

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const columns = [...fieldsObj.defaultFields];

  // 헤더 부분 merge
  const layoutColumns = ['sapMatCd', 'pdCd', 'pdNm', 'csmrUprcAmt', 'leadTime', 'moq',
    {
      header: t('MSG_TXT_STOC_PS'),
      direction: 'horizontal', // merge type
      items: ['qty100002', 'qty100008', 'qty200000', 'qty299999', 'qty300000', 'qty999999'],
    },
  ];

  const fields = columns.map(({ fieldName, dataType }) => ({ fieldName, dataType }));

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(layoutColumns);
  view.setFooters({ visible: true });
  view.setOptions({ summaryMode: 'aggregate' });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  gridView = view;
  gridData = data;
});

</script>
