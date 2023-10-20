<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaMonthlyByStockPsListM(W-SV-U-0136M01) - 월별 재고현황
3. 작성자 : SaeRomI.Kim
4. 작성일 : 2023.08.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 기준년월의 품목코드의 재고수량 현황을 조회하는 화면 (http://localhost:3000/#/service/wwsna-monthly-by-stock-ps-list)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <!-- 기준년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            :label="$t('MSG_TXT_BASE_YM')"
            rules="required"
            @change="onChangeBaseYm"
          />
        </kw-search-item>
        <!-- 창고구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_WARE_DV')"
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :label="$t('MSG_TXT_WARE_DV')"
            :options="codes.WARE_DV_CD"
            rules="required"
            @change="onChangeWareDvCd"
          />
          <kw-select
            v-model="searchParams.hgrWareNo"
            :options="optionsHgrWareNo"
            option-value="wareNo"
            option-label="wareNm"
            first-option="all"
            @change="onChangeHgrWareNo"
          />
          <kw-select
            v-model="searchParams.wareNo"
            :options="optionsWareNo"
            option-value="wareNo"
            option-label="wareNm"
            first-option="all"
          />
        </kw-search-item>
        <!-- 창고상세구분 -->
        <kw-search-item :label="$t('MSG_TXT_WARE_DTL_DV')">
          <kw-select
            v-model="searchParams.wareDtlDvCd"
            :options="filterCodes.wareDtlDvCd"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 상품등급 -->
        <kw-search-item :label="$t('MSG_TXT_PD_GRD')">
          <kw-select
            v-model="searchParams.itmGdCd"
            :options="filterCodes.pdGdCd"
            first-option="all"
          />
        </kw-search-item>
        <!-- 사용여부 -->
        <kw-search-item :label="$t('MSG_TXT_USE_SEL')">
          <kw-select
            v-model="searchParams.useYn"
            :options="codes.USE_YN"
            first-option="all"
          />
        </kw-search-item>
        <!-- 품목구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
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
        <!-- 품목코드 -->
        <kw-search-item :label="$t('MSG_TXT_ITM_CD')">
          <kw-input
            v-model="searchParams.itmPdCd"
            type="text"
            :label="$t('MSG_TXT_ITM_CD')"
            rules="alpha_num|max:10"
          />
        </kw-search-item>
        <!-- SAP코드 -->
        <kw-search-item :label="$t('MSG_TXT_SAPCD')">
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
        <!-- 자재구분 -->
        <kw-search-item :label="t('MSG_TXT_MAT_DV')">
          <kw-select
            v-model="searchParams.matUtlzDvCd"
            :options="codes.CMN_PART_DV_CD"
            :label="$t('MSG_TXT_MAT_DV')"
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
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }} : EA)</span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
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
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { codeUtil, useMeta, useDataService, getComponentType, gridUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty, cloneDeep } from 'lodash-es';

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
  baseYm: dayjs().format('YYYYMM'),
  wareDvCd: '2',
  hgrWareNo: '',
  wareNo: '',
  wareDtlDvCd: '',
  itmGdCd: '',
  useYn: 'Y',
  itmKndCd: '',
  itmPdCds: [],
  itmPdCd: '',
  strtSapCd: '',
  endSapCd: '',
  matUtlzDvCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'WARE_DV_CD',
  'WARE_DTL_DV_CD',
  'PD_GD_CD',
  'ITM_KND_CD',
  'USE_YN',
  'CMN_PART_DV_CD',
);

const filterCodes = ref({
  wareDtlDvCd: [],
  pdGdCd: [],
});

// 등급코드 필터링
function codeFilter() {
  filterCodes.value.pdGdCd = codes.PD_GD_CD.filter((v) => ['A', 'B', 'E', 'R', 'X'].includes(v.codeId));
}

const optionsHgrWareNo = ref([]);
const optionsWareNo = ref([]);

// 창고세부구분코드 필터링
function wareDtlDvCdFilter() {
  const { wareDvCd } = searchParams.value;
  filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => v.codeId.startsWith(wareDvCd));
}

// 창고조회
const getHgrWareNos = async () => {
  // 상위창고번호 클리어
  searchParams.value.hgrWareNo = '';
  optionsHgrWareNo.value = [];
  // 창고번호 클리어
  searchParams.value.wareNo = '';
  optionsWareNo.value = [];
  const result = await dataService.get(
    '/sms/wells/service/monthly-by-stock-state/ware-houses',
    { params: {
      baseYm: searchParams.value.baseYm,
      wareDvCd: searchParams.value.wareDvCd,
    } },
  );
  optionsHgrWareNo.value = result.data;
};

// 상위창고 변경 시
async function onChangeHgrWareNo() {
  // 창고번호 클리어
  searchParams.value.wareNo = '';
  optionsWareNo.value = [];
  const { baseYm, hgrWareNo } = searchParams.value;

  if (isEmpty(baseYm) || isEmpty(hgrWareNo)) return;

  const result = await dataService.get(
    '/sms/wells/service/monthly-by-stock-state/ware-houses',
    { params: {
      baseYm: searchParams.value.baseYm,
      wareDvCd: searchParams.value.wareDvCd,
      hgrWareNo: searchParams.value.hgrWareNo,
    } },
  );
  optionsWareNo.value = result.data;
}

// 창고구분 변경 시
async function onChangeWareDvCd() {
  // 창고세부구분 코드 필터링
  wareDtlDvCdFilter();

  await getHgrWareNos();
}

// 기준년월이 변경되었을 때 창고번호 재조회
async function onChangeBaseYm() {
  const searchBaseYm = searchParams.value.baseYm;
  if (isEmpty(searchBaseYm)) {
    searchParams.value.hgrWareNo = '';
    optionsHgrWareNo.value = [];

    searchParams.value.wareNo = '';
    optionsWareNo.value = [];

    return;
  }
  await getHgrWareNos();
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

// SAP 시작코드 변경 시
function onChangeStrtSapCd() {
  const { strtSapCd, endSapCd } = searchParams.value;

  if (!isEmpty(strtSapCd) && !isEmpty(endSapCd) && strtSapCd > endSapCd) {
    searchParams.value.strtSapCd = strtSapCd;
    searchParams.value.endSapCd = strtSapCd;
  }
}

// SAP 종료코드 변경 시
function onChangeEndSapCd() {
  const { strtSapCd, endSapCd } = searchParams.value;

  if (!isEmpty(strtSapCd) && !isEmpty(endSapCd) && strtSapCd > endSapCd) {
    searchParams.value.strtSapCd = endSapCd;
    searchParams.value.endSapCd = endSapCd;
  }
}

await Promise.all([
  codeFilter(),
  wareDtlDvCdFilter(),
  getHgrWareNos(),
  getProducts(),
]);

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/monthly-by-stock-state/paging', { params: { ...cachedParams, ...pageInfo.value } });

  const { list: stocks, pageInfo: pagingResult } = res.data;
  // fetch시에는 총 건수 조회하지 않도록 변경
  pagingResult.needTotalCount = false;
  pageInfo.value = pagingResult;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(stocks);
    view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  }
}

// 조회버튼 클릭
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  // 조회버튼 클릭 시에만 총 건수 조회하도록
  pageInfo.value.needTotalCount = true;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/monthly-by-stock-state/excel-download', { params: cachedParams });

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
    { fieldName: 'sapMatCd' }, // SAP코드
    { fieldName: 'itmPdCd' }, // 품목코드
    { fieldName: 'pdNm' }, // 품목명
    // 입고수량
    { fieldName: 'prchsQty', dataType: 'number' }, // 구매입고
    { fieldName: 'sftStocQty', dataType: 'number' }, // 안전재고
    { fieldName: 'btdStocQty', dataType: 'number' }, // 기초재고
    { fieldName: 'pitmStocQty', dataType: 'number' }, // 시점재고
    { fieldName: 'nomStrQty', dataType: 'number' }, // 정상입고
    { fieldName: 'qomAsnStrQty', dataType: 'number' }, // 물량배정
    { fieldName: 'qomMmtStrQty', dataType: 'number' }, // 물량이동
    { fieldName: 'rtngdStrInsiQty', dataType: 'number' }, // 반품내부
    { fieldName: 'rtngdStrOtsdQty', dataType: 'number' }, // 반품외부
    { fieldName: 'etcStrQty', dataType: 'number' }, // 기타입고
    { fieldName: 'etcStrQty1', dataType: 'number' }, // 기타입고1
    { fieldName: 'stocAcinspStrQty', dataType: 'number' }, // 재고실사
    { fieldName: 'strCtrQty', dataType: 'number' }, // 등급조정
    // 출고수량
    { fieldName: 'nomOstrQty', dataType: 'number' }, // 정상출고
    { fieldName: 'qomAsnOstrQty', dataType: 'number' }, // 물량배정
    { fieldName: 'qomMmtOstrQty', dataType: 'number' }, // 물량이동
    { fieldName: 'rtngdOstrInsiQty', dataType: 'number' }, // 반품내부
    { fieldName: 'rtngdOstrOtsdQty', dataType: 'number' }, // 반품외부
    { fieldName: 'sellOstrQty', dataType: 'number' }, // 판매출고
    { fieldName: 'dsuOstrQty', dataType: 'number' }, // 폐기출고
    { fieldName: 'wkOstrQty', dataType: 'number' }, // 작업출고
    { fieldName: 'etcOstrQty', dataType: 'number' }, // 기타출고
    { fieldName: 'etcOstrQty1', dataType: 'number' }, // 기타출고1
    { fieldName: 'stocAcinspOstrQty', dataType: 'number' }, // 재고실사출고
    { fieldName: 'stocStatCtrQty', dataType: 'number' }, // 재고상태조정
    { fieldName: 'stocAcinspQty', dataType: 'number' }, // 재고실사
    { fieldName: 'mmtStocQty', dataType: 'number' }, // 이동재고
    { fieldName: 'freExpnStocQty', dataType: 'number' }, // 무료체험재고
    { fieldName: 'refrOstrQty', dataType: 'number' }, // 리퍼출고
    { fieldName: 'ostrCtrQty', dataType: 'number' }, // 등급조정
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '95', styleName: 'text-center', dataType: 'text' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '110', styleName: 'text-center', dataType: 'text' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '150', styleName: 'text-left', dataType: 'text', footer: { text: t('MSG_TXT_SUM'), styleName: 'text-center' } },
    { fieldName: 'btdStocQty',
      header: t('MSG_TXT_BTD_STOC_QTY'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    // 입고정보
    { fieldName: 'prchsQty',
      header: `${t('MSG_TXT_PRCHS')}${t('MSG_TXT_STR')}`,
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'nomStrQty',
      header: `${t('MSG_TXT_NOM')}${t('MSG_TXT_STR')}`,
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'qomAsnStrQty',
      header: `${t('MSG_TXT_QOM')}${t('MSG_TXT_ASGN')}`,
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'qomMmtStrQty',
      header: `${t('MSG_TXT_QOM')}${t('MSG_TXT_MOVE')}`,
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'rtngdStrInsiQty',
      header: t('MSG_TXT_INSI'),
      width: '70',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'rtngdStrOtsdQty',
      header: t('MSG_TXT_OTSD'),
      width: '70',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'etcStrQty',
      header: `${t('MSG_TXT_ETC')}${t('MSG_TXT_STR')}`,
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'strCtrQty',
      header: `${t('MSG_TXT_GD')}${t('MSG_TXT_CTR')}`,
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'stocAcinspStrQty',
      header: t('MSG_TXT_STOC_ACINSP'),
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    // 출고정보
    { fieldName: 'nomOstrQty',
      header: `${t('MSG_TXT_NOM')}${t('MSG_TXT_OSTR')}`,
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'qomAsnOstrQty',
      header: `${t('MSG_TXT_QOM')}${t('MSG_TXT_ASGN')}`,
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'qomMmtOstrQty',
      header: `${t('MSG_TXT_QOM')}${t('MSG_TXT_MOVE')}`,
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'rtngdOstrInsiQty',
      header: t('MSG_TXT_INSI'),
      width: '70',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'rtngdOstrOtsdQty',
      header: t('MSG_TXT_OTSD'),
      width: '70',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'sellOstrQty',
      header: `${t('MSG_TXT_SELL')}${t('MSG_TXT_OSTR')}`,
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'dsuOstrQty',
      header: `${t('MSG_TXT_DSCD')}${t('MSG_TXT_OSTR')}`,
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'wkOstrQty',
      header: `${t('MSG_TXT_OSTR_WK')}${t('MSG_TXT_OSTR')}`,
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'refrOstrQty',
      header: `${t('MSG_TXT_REFR')}${t('MSG_TXT_OSTR')}`,
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'etcOstrQty',
      header: `${t('MSG_TXT_ETC')}${t('MSG_TXT_OSTR')}`,
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'ostrCtrQty',
      header: `${t('MSG_TXT_GD')}${t('MSG_TXT_CTR')}`,
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'stocAcinspQty',
      header: t('MSG_TXT_STOC_ACINSP'),
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    // 기말재고
    { fieldName: 'pitmStocQty',
      header: t('MSG_TXT_EOT_STOC_QTY'),
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
  ];

  // 헤더 부분 merge
  const layoutColumns = ['sapMatCd', 'itmPdCd', 'pdNm', 'btdStocQty',
    { direction: 'horizontal',
      header: { text: t('MSG_TXT_STR_QTY') },
      items: ['prchsQty', 'nomStrQty', 'qomAsnStrQty', 'qomMmtStrQty',
        { direction: 'horizontal',
          header: { text: t('MSG_TXT_RTNGD') },
          items: ['rtngdStrInsiQty', 'rtngdStrOtsdQty'],
        },
        'etcStrQty', 'strCtrQty', 'stocAcinspStrQty',
      ],
    },
    { direction: 'horizontal',
      header: { text: t('MSG_TXT_OSTR_QTY') },
      items: ['qomAsnOstrQty', 'nomOstrQty', 'qomMmtOstrQty',
        { direction: 'horizontal',
          header: { text: t('MSG_TXT_RTNGD') },
          items: ['rtngdOstrInsiQty', 'rtngdOstrOtsdQty'],
        },
        'sellOstrQty', 'dsuOstrQty', 'wkOstrQty', 'refrOstrQty', 'etcOstrQty', 'ostrCtrQty', 'stocAcinspQty',
      ],
    },
    'pitmStocQty',
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
