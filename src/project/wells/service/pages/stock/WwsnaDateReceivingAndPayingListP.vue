<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaDateReceivingAndPayingListP(W-SV-U-0211P01) - 일자별수불현황(팝업)
3. 작성자 : SongTaeSung
4. 작성일 : 2023.05.26
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
기간에따른 품목별 수불 현황을 조회하는 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="popupRef"
    size="4xl"
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
        <span class="ml8">
          ({{ t('MSG_TXT_UNIT') }} : EA)
        </span>
      </template>
      <!-- 엑셀다운로드 -->
      <kw-btn
        v-permission:download
        icon="download_on"
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="pageInfo.totalCount === 0"
        dense
        secondary
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
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
  </kw-popup>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useMeta, codeUtil, useDataService, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const popupRef = ref();
const grdMainRef = ref(getComponentType('KwGrid'));

const props = defineProps({
  itmPdCd: {
    type: String,
    default: undefined,
  },
  wareNo: {
    type: String,
    default: '',
  },

  strRgstFrom: {
    type: String,
    default: '',
  },

  strRgstTo: {
    type: String,
    default: '',
  },

});

const searchParams = ref({
  itmPdCd: '',
  wareNo: '',
  strRgstFrom: '',
  strRgstTo: '',

});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

// 파라미터 필수 체크
function hasProps() {
  // eslint-disable-next-line max-len
  return !isEmpty(props.itmPdCd) && !isEmpty(props.wareNo) && !isEmpty(props.strRgstFrom) && !isEmpty(props.strRgstTo);
}

// 조회조건 셋팅
function setSearchParams() {
  const { itmPdCd, wareNo, strRgstFrom, strRgstTo } = props;
  searchParams.value.itmPdCd = itmPdCd;
  searchParams.value.wareNo = wareNo;
  searchParams.value.strRgstFrom = strRgstFrom;
  searchParams.value.strRgstTo = strRgstTo;
}

// DateReceivingAndPaying
let cachedParams;
// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/receipts-and-payments/date/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: receiving, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(receiving);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/receipts-and-payments/date/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: popupRef.value.pageCtxTitle,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
  if (hasProps()) {
    setSearchParams();
    cachedParams = cloneDeep(searchParams.value);
    await fetchData();
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ymd' }, // 일자
    { fieldName: 'basStocQty', dataType: 'number' }, // 기초재고수량
    { fieldName: 'prchsStrQty', dataType: 'number' }, // 구매입고수량
    { fieldName: 'nomStrQty', dataType: 'number' }, // 정상입고수량
    { fieldName: 'qomAsnStrQty', dataType: 'number' }, // 배정입고수량
    { fieldName: 'qomMmtStrQty', dataType: 'number' }, // 물량이동입고수량
    { fieldName: 'rtngdStrInsdQty', dataType: 'number' }, // 반품내부수량
    { fieldName: 'rtngdStrOtsdQty', dataType: 'number' }, // 반품외부수량
    { fieldName: 'etcStrQty', dataType: 'number' }, // 기타입고수량
    { fieldName: 'strCtrQty', dataType: 'number' }, // 등급수량
    { fieldName: 'cnfmPitmStrGapQty', dataType: 'number' }, // 재고실사수량
    // 출고수량
    { fieldName: 'nomOstrQty', dataType: 'number' }, // 정상출고수량
    { fieldName: 'svcNomOstrQty', dataType: 'number' }, // 서비스센터 정상출고수량
    { fieldName: 'sellNomOstrQty', dataType: 'number' }, // 영업센터 정상출고수량
    { fieldName: 'qomAsnOstrQty', dataType: 'number' }, // 배정출고수량
    { fieldName: 'qomMmtOstrQty', dataType: 'number' }, // 물량출고수량
    { fieldName: 'rtngdOstrInsdQty', dataType: 'number' }, // 반품내부수량
    { fieldName: 'rtngdOstrOtsdQty', dataType: 'number' }, // 반품외부수량
    { fieldName: 'useQty', dataType: 'number' }, // 작업출고수량
    { fieldName: 'refrOstrQty', dataType: 'number' }, // 리퍼출고수량
    { fieldName: 'sellOstrQty', dataType: 'number' }, // 판매출고수량
    { fieldName: 'dsuOstrQty', dataType: 'number' }, // 폐기출고수량
    { fieldName: 'etcOstrQty', dataType: 'number' }, // 기타출고수량
    { fieldName: 'ostrCtrQty', dataType: 'number' }, // 등급조정출고수량
    { fieldName: 'cnfmPitmOstrGapQty', dataType: 'number' }, // 재고실사출고수량
    { fieldName: 'eotStocQty', dataType: 'number' }, // 기말재고수량
    { fieldName: 'mmtStocQty', dataType: 'number' }, // 이동재고수량

  ];

  const columns = [
    { fieldName: 'ymd', header: t('MSG_TXT_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date', footer: { text: t('MSG_TXT_SUM'), styleName: 'text-center' } },
    { fieldName: 'basStocQty',
      header: t('MSG_TXT_BTD_STOC_QTY'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'prchsStrQty',
      header: t('MSG_TXT_PRCHS'),
      width: '70',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'nomStrQty',
      header: t('MSG_TXT_NOM'),
      width: '70',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'qomAsnStrQty',
      header: t('MSG_TXT_ASGN'),
      width: '70',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'qomMmtStrQty',
      header: t('MSG_TXT_MOVE'),
      width: '70',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'rtngdStrInsdQty',
      header: t('MSG_TXT_INSI'),
      width: '70',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'rtngdStrOtsdQty',
      header: t('MSG_TXT_OTSD'),
      width: '70',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'etcStrQty',
      header: t('MSG_TXT_ETC'),
      width: '70',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'strCtrQty',
      header: t('MSG_TXT_GD'),
      width: '70',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'cnfmPitmStrGapQty',
      header: t('MSG_TXT_STOC_ACINSP'),
      width: '80',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'nomOstrQty',
      header: t('MSG_TXT_NOM'),
      width: '70',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'svcNomOstrQty',
      header: t('MSG_TXT_SERVICE'),
      width: '80',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sellNomOstrQty',
      header: t('MSG_TXT_BZNS'),
      width: '80',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'qomAsnOstrQty',
      header: t('MSG_TXT_ASGN'),
      width: '70',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'qomMmtOstrQty',
      header: t('MSG_TXT_QOM'),
      width: '70',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'rtngdOstrInsdQty',
      header: t('MSG_TXT_INSI'),
      width: '70',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'rtngdOstrOtsdQty',
      header: t('MSG_TXT_OTSD'),
      width: '70',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'useQty',
      header: t('MSG_TXT_OSTR_WK'),
      width: '70',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'refrOstrQty',
      header: t('MSG_TXT_REFR'),
      width: '70',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'sellOstrQty',
      header: t('MSG_TXT_SELL'),
      width: '70',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'dsuOstrQty',
      header: t('MSG_TXT_DSCD'),
      width: '70',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'etcOstrQty',
      header: t('MSG_TXT_ETC'),
      width: '70',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'ostrCtrQty',
      header: t('MSG_TXT_GD'),
      width: '70',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'cnfmPitmOstrGapQty',
      header: t('MSG_TXT_STOC_ACINSP'),
      width: '80',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'eotStocQty',
      header: t('MSG_TXT_EOT_STOC_QTY'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'mmtStocQty',
      header: t('MSG_TXT_MMT_STOC_QTY'),
      width: '100',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },

  ];

  const columnLayout = [
    'ymd', 'basStocQty',
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
        'refrOstrQty',
        'sellOstrQty',
        'dsuOstrQty',
        'etcOstrQty',
        'ostrCtrQty',
        'cnfmPitmOstrGapQty',
      ],
    },
    'eotStocQty',
    'mmtStocQty',

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.setFooters({ visible: true });
  view.setOptions({ summaryMode: 'aggregate' });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setFixedOptions({
    colCount: 1,
  });
});

</script>
