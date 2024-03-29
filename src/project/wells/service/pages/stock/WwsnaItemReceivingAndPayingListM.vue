<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaItemReceivingAndPayingListM - 품목별 수불현황(W-SV-U-0252M01)
 3. 작성자 : SongTaeSung
 4. 작성일 : 2023.05.17
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 품목별 수불현황 (http://localhost:3000/#/service/wwsna-item-receiving-and-paying-ps-list)
 ****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
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
        <!-- 창고구분 -->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.stStrDt"
          v-model:end-ym="searchParams.edStrDt"
          v-model:options-ware-dv-cd="wareDvCd"
          v-model:ware-dv-cd="searchParams.strWareDvCd"
          v-model:ware-no-m="searchParams.strWareNoM"
          v-model:ware-no-d="searchParams.strWareNoD"
          sub-first-option="all"
          :colspan="2"
          :label1="$t('MSG_TXT_OSTR_PTRM')"
          :label2="$t('MSG_TXT_STR_WARE')"
          :label3="$t('MSG_TXT_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          @update:ware-dv-cd="onChangeWareDvCd"
          @update:ware-no-m="onChagneHgrWareNo"
        />
      </kw-search-row>
      <kw-search-row>
        <!-- 등급 -->
        <kw-search-item
          :label="$t('MSG_TXT_GD')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.itmGdCd"
            :options="codes.PD_GD_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 사용여부 -->
        <kw-search-item
          :label="$t('MSG_TXT_USE_SEL')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.useYn"
            :options="codes.USE_YN"
            first-option="all"
          />
        </kw-search-item>
        <!-- 품목구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmKnd"
            class="w233"
            :options="codes.ITM_KND_CD"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 품목코드 -->
        <kw-search-item
          :colspan="2"
          :label="$t('MSG_TXT_ITM_CD')"
        >
          <kw-input
            v-model="searchParams.itmPdCdFrom"
          />
        </kw-search-item>
        <!-- SAP코드 -->
        <kw-search-item
          :colspan="2"
          :label="$t('MSG_TXT_SAP_CD')"
        >
          <kw-input
            v-model="searchParams.sapMatCdFrom"
            rules="numeric|max:18"
            @change="onChangeStrtSapCd"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.sapMatCdTo"
            rules="numeric|max:18"
            @change="onChangeEndSapCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- SAP코드(복수검색) -->
        <kw-search-item
          :colspan="2"
          :label="$t('MSG_TXT_SAP_CD_PLUR_SEA')"
        >
          <kw-input
            v-model.trim="searchParams.sapMatDpct"
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
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
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
import { defineGrid, useMeta, codeUtil, useDataService, getComponentType, gridUtil } from 'kw-lib';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { currentRoute } = useRouter();
const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GD_CD', // 상품등급
  'USE_YN', // 사용여부
  'ITM_KND_CD', // 품목구분코드
);

const wareDvCd = { WARE_DV_CD: [
  { codeId: '2', codeName: '서비스센터' },
  { codeId: '3', codeName: '영업센터' },
] };

const searchParams = ref({
  stStrDt: '',
  edStrDt: '',
  strWareDvCd: '2',
  strWareNoM: '',
  strWareNoD: '',
  itmKnd: '4',
  itmPdCdFrom: '',
  sapMatCdFrom: '',
  sapMatCdTo: '',
  sapMatDpct: '',
  useYn: 'Y',
  sapMatDpcts: [],
  stFromYmd: dayjs().format('YYYYMMDD'),
  edToYmd: dayjs().format('YYYYMMDD'),

});

searchParams.value.stStrDt = dayjs().set('date', 1).format('YYYYMMDD');
searchParams.value.edStrDt = dayjs().format('YYYYMMDD');

function onChangeWareDvCd() {
  searchParams.value.strWareNoM = '';
  searchParams.value.strWareNoD = '';
}

function onChagneHgrWareNo() {
  searchParams.value.strWareNoD = '';
}

function onChangeStrtSapCd() {
  const { sapMatCdFrom, sapMatCdTo } = searchParams.value;

  if (!isEmpty(sapMatCdFrom) && !isEmpty(sapMatCdTo) && sapMatCdFrom > sapMatCdTo) {
    searchParams.value.sapMatCdFrom = sapMatCdFrom;
    searchParams.value.sapMatCdTo = sapMatCdFrom;
  }
}

function onChangeEndSapCd() {
  const { sapMatCdFrom, sapMatCdTo } = searchParams.value;

  if (!isEmpty(sapMatCdFrom) && !isEmpty(sapMatCdTo) && sapMatCdFrom > sapMatCdTo) {
    searchParams.value.sapMatCdFrom = sapMatCdTo;
    searchParams.value.sapMatCdTo = sapMatCdTo;
  }
}

let cachedParams;
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/receipts-and-payments/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: payments, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(payments);
  view.resetCurrent();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/receipts-and-payments/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSearch() {
  const splitSapMatDpct = searchParams.value.sapMatDpct.split(',');
  searchParams.value.sapMatDpcts = splitSapMatDpct;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    // 입고수량
    { fieldName: 'itmPdCd' }, // 품목상품코드
    { fieldName: 'sapMatCd' }, // SAP코드
    { fieldName: 'itmPdNm' }, // 품목상품명
    { fieldName: 'basStocQty', dataType: 'number' }, // 기초재고수량
    { fieldName: 'prchsStrQty', dataType: 'number' }, // 구매입고수량
    { fieldName: 'nomStrQty', dataType: 'number' }, // 정상입고수량
    { fieldName: 'qomAsnStrQty', dataType: 'number' }, // 배정입고수량
    { fieldName: 'qomMmtStrQty', dataType: 'number' }, // 물량이동수량
    { fieldName: 'rtngdStrInsdQty', dataType: 'number' }, // 반품내부수량
    { fieldName: 'rtngdStrOtsdQty', dataType: 'number' }, // 반품외부수량
    { fieldName: 'etcStrQty', dataType: 'number' }, // 기타입고수량
    { fieldName: 'strCtrQty', dataType: 'number' }, // 입고등급수량
    { fieldName: 'cnfmPitmStrGapQty', dataType: 'number' }, // 재고실사수량
    // 출고수량
    { fieldName: 'nomOstrQty', dataType: 'number' }, // 정상출고수량
    { fieldName: 'svcNomOstrQty', dataType: 'number' }, //
    { fieldName: 'sellNomOstrQty', dataType: 'number' },
    { fieldName: 'qomAsnOstrQty', dataType: 'number' }, // 배정
    { fieldName: 'qomMmtOstrQty', dataType: 'number' }, // 물량
    { fieldName: 'rtngdOstrInsdQty', dataType: 'number' }, // 반품출고내부수량
    { fieldName: 'rtngdOstrOtsdQty', dataType: 'number' }, // 반품출고외부수량
    { fieldName: 'useQty', dataType: 'number' }, // 작업
    { fieldName: 'yearInUseQty', dataType: 'number' }, // 설치일기준 1년내
    { fieldName: 'yearOutUseQty', dataType: 'number' }, // 설치일기준 1년후
    { fieldName: 'refrOstrQty', dataType: 'number' }, // 리퍼출고수량
    { fieldName: 'sellOstrQty', dataType: 'number' }, // 판매출고수량
    { fieldName: 'dsuOstrQty', dataType: 'number' }, // 폐기출고수량
    { fieldName: 'etcOstrQty', dataType: 'number' }, // 기타출고수량
    { fieldName: 'ostrCtrQty', dataType: 'number' }, // 출고등급수량
    // 재고실사 컬럼 들어와야함
    { fieldName: 'cnfmPitmOstrGapQty', dataType: 'number' }, // 기말재고수량
    { fieldName: 'mmtStocQty', dataType: 'number' }, // 이동재고수량

  ];

  const columns = [
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'itmPdNm', header: t('MSG_TXT_ITM_NM'), width: '200', styleName: 'text-center', footer: { text: t('MSG_TXT_SUM') } },
    { fieldName: 'basStocQty',
      header: t('MSG_TXT_BTD_STOC_QTY'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'prchsStrQty',
      header: t('MSG_TXT_PRCHS'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'nomStrQty',
      header: t('MSG_TXT_NOM'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'qomAsnStrQty',
      header: t('MSG_TXT_ASGN'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'qomMmtStrQty',
      header: t('MSG_TXT_MOVE'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'rtngdStrInsdQty',
      header: t('MSG_TXT_INSI'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'rtngdStrOtsdQty',
      header: t('MSG_TXT_OTSD'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'etcStrQty',
      header: t('MSG_TXT_ETC'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'strCtrQty',
      header: t('MSG_TXT_GD'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'cnfmPitmStrGapQty',
      header: t('MSG_TXT_STOC_ACINSP'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },

    { fieldName: 'nomOstrQty',
      header: t('MSG_TXT_NOM'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'svcNomOstrQty',
      header: t('MSG_TXT_SERVICE'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'sellNomOstrQty',
      header: t('MSG_TXT_BZNS'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'qomAsnOstrQty',
      header: t('MSG_TXT_ASGN'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'qomMmtOstrQty',
      header: t('MSG_TXT_QOM'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'rtngdOstrInsdQty',
      header: t('MSG_TXT_INSI'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'rtngdOstrOtsdQty',
      header: t('MSG_TXT_OTSD'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'useQty',
      header: t('MSG_TXT_OSTR_WK'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'yearInUseQty',
      header: t('MSG_TXT_Y1_WTHN'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'yearOutUseQty',
      header: t('MSG_TXT_Y1_AF'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'refrOstrQty',
      header: t('MSG_TXT_REFR'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'sellOstrQty',
      header: t('MSG_TXT_SELL'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'dsuOstrQty',
      header: t('MSG_TXT_DSCD'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'etcOstrQty',
      header: t('MSG_TXT_ETC'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'ostrCtrQty',
      header: t('MSG_TXT_GD'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'cnfmPitmOstrGapQty',
      header: t('MSG_TXT_EOT_STOC_QTY'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'mmtStocQty',
      header: t('MSG_TXT_MMT_STOC_QTY'),
      width: '120',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },

  ];

  const columnLayout = [
    'itmPdCd',
    'sapMatCd',
    'itmPdNm',
    'basStocQty',
    { direction: 'horizontal',
      header: { text: t('MSG_TXT_STR_QTY') },
      items: ['prchsStrQty',
        'nomStrQty',
        'qomAsnStrQty',
        'qomMmtStrQty',
        { direction: 'horizontal',
          items: ['rtngdStrInsdQty', 'rtngdStrOtsdQty'],
          header: { text: t('MSG_TXT_RTNGD') },
        },
        'etcStrQty',
        'strCtrQty',
        'cnfmPitmStrGapQty',
      ],
    },

    { direction: 'horizontal',
      header: { text: t('MSG_TXT_OSTR_QTY') },
      items: ['nomOstrQty',
        { direction: 'horizontal',
          header: { text: t('MSG_TXT_STR_WARE') },
          items: ['svcNomOstrQty', 'sellNomOstrQty'],
        },
        'qomAsnOstrQty',
        'qomMmtOstrQty',
        { direction: 'horizontal',
          header: { text: t('MSG_TXT_RTNGD') },
          items: ['rtngdOstrInsdQty', 'rtngdOstrOtsdQty'],
        },
        'useQty',
        { direction: 'horizontal',
          header: { text: t('MSG_TXT_IST_D_BASE') },
          items: ['yearInUseQty', 'yearOutUseQty'],
        },
        'refrOstrQty',
        'sellOstrQty',
        'dsuOstrQty',
        'etcOstrQty',
        'ostrCtrQty',
      ],
    },
    'cnfmPitmOstrGapQty',
    'mmtStocQty',

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.setFooters({ visible: true });
  view.setOptions({ summaryMode: 'aggregate' });

  view.rowIndicator.visible = true;
});

</script>
