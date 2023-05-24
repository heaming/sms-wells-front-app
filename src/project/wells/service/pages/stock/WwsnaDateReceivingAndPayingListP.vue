<template>
  <kw-popup
    size="2xl"
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
      </template>
      <kw-btn
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
const { currentRoute } = useRouter();
const { getConfig } = useMeta();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
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

function hasProps() {
  // eslint-disable-next-line max-len
  return !isEmpty(props.itmPdCd) && !isEmpty(props.wareNo) && !isEmpty(props.strRgstFrom) && !isEmpty(props.strRgstTo);
}

function setSearchParams() {
  const { itmPdCd, wareNo, strRgstFrom, strRgstTo } = props;
  searchParams.value.itmPdCd = itmPdCd;
  searchParams.value.wareNo = wareNo;
  searchParams.value.strRgstFrom = strRgstFrom;
  searchParams.value.strRgstTo = strRgstTo;
}

// DateReceivingAndPaying
let cachedParams;
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/receipts-and-payments/date/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: receiving, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(receiving);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/date-receivings/date/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data.list,
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
    { fieldName: 'basStocQty' }, // 기초재고수량
    { fieldName: 'prchsStrQty' }, // 구매입고수량
    { fieldName: 'nomStrQty' }, // 정상입고수량
    { fieldName: 'qomAsnStrQty' }, // 배정입고수량
    { fieldName: 'qomMmtStrQty' }, // 물량이동입고수량
    { fieldName: 'rtngdStrInsdQty' }, // 반품내부수량
    { fieldName: 'rtngdStrOtsdQty' }, // 반품외부수량
    { fieldName: 'etcStrQty' }, // 기타입고수량
    { fieldName: 'strCtrQty' }, // 등급수량
    { fieldName: 'cnfmPitmStrGapQty' }, // 재고실사수량
    // 출고수량
    { fieldName: 'nomOstrQty' }, // 정상출고수량
    { fieldName: 'svcNomOstrQty' }, // 서비스
    { fieldName: 'sellNomOstrQty' }, // 영업
    { fieldName: 'qomAsnOstrQty' }, // 배정출고수량
    { fieldName: 'qomMmtOstrQty' }, // 물량출고수량
    { fieldName: 'rtngdOstrInsdQty' }, // 반품내부수량
    { fieldName: 'rtngdOstrOtsdQty' }, // 반품외부수량
    { fieldName: 'useQty' }, // 작업출고
    { fieldName: 'refrOstrQty' }, // 리퍼출고
    { fieldName: 'sellOstrQty' }, // 판매출고
    { fieldName: 'dsuOstrQty' }, // 폐기출고
    { fieldName: 'etcOstrQty' }, // 기타출고
    { fieldName: 'ostrCtrQty' }, // 등급조정출고
    { fieldName: 'cnfmPitmOstrGapQty' }, // 재고실사출고
    { fieldName: 'eotStocQty' }, // 기말재고수량
    { fieldName: 'mmtStocQty' }, // 이동재고

  ];

  const columns = [
    { fieldName: 'ymd', header: t('MSG_TXT_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'basStocQty', header: t('MSG_TXT_BTD_STOC_QTY'), width: '120', styleName: 'text-center' },
    { fieldName: 'prchsStrQty', header: t('MSG_TXT_PRCHS'), width: '120', styleName: 'text-center' },
    { fieldName: 'nomStrQty', header: t('MSG_TXT_NOM'), width: '120', styleName: 'text-center' },
    { fieldName: 'qomAsnStrQty', header: t('MSG_TXT_ASGN'), width: '120', styleName: 'text-center' },
    { fieldName: 'qomMmtStrQty', header: t('MSG_TXT_MOVE'), width: '120', styleName: 'text-center' },
    { fieldName: 'rtngdStrInsdQty', header: t('MSG_TXT_INSI'), width: '120', styleName: 'text-center' },
    { fieldName: 'rtngdStrOtsdQty', header: t('MSG_TXT_OTSD'), width: '120', styleName: 'text-center' },
    { fieldName: 'etcStrQty', header: t('MSG_TXT_ETC'), width: '120', styleName: 'text-center' },
    { fieldName: 'strCtrQty', header: t('MSG_TXT_GD'), width: '120', styleName: 'text-center' },
    { fieldName: 'cnfmPitmStrGapQty', header: t('MSG_TXT_STOC_ACINSP'), width: '120', styleName: 'text-center' },
    { fieldName: 'nomOstrQty', header: t('MSG_TXT_NOM'), width: '120', styleName: 'text-center' },
    { fieldName: 'svcNomOstrQty', header: t('MSG_TXT_SERVICE'), width: '120', styleName: 'text-center' },
    { fieldName: 'sellNomOstrQty', header: t('MSG_TXT_BZNS'), width: '120', styleName: 'text-center' },
    { fieldName: 'qomAsnOstrQty', header: t('MSG_TXT_ASGN'), width: '120', styleName: 'text-center' },
    { fieldName: 'qomMmtOstrQty', header: t('MSG_TXT_QOM'), width: '120', styleName: 'text-center' },
    { fieldName: 'rtngdOstrInsdQty', header: t('MSG_TXT_INSI'), width: '120', styleName: 'text-center' },
    { fieldName: 'rtngdOstrOtsdQty', header: t('MSG_TXT_OTSD'), width: '120', styleName: 'text-center' },
    { fieldName: 'useQty', header: t('MSG_TXT_OSTR_WK'), width: '120', styleName: 'text-center' },
    { fieldName: 'refrOstrQty', header: t('MSG_TXT_REFR'), width: '120', styleName: 'text-center' },
    { fieldName: 'sellOstrQty', header: t('MSG_TXT_SELL'), width: '120', styleName: 'text-center' },
    { fieldName: 'dsuOstrQty', header: t('MSG_TXT_DSCD'), width: '120', styleName: 'text-center' },
    { fieldName: 'etcOstrQty', header: t('MSG_TXT_ETC'), width: '120', styleName: 'text-center' },
    { fieldName: 'ostrCtrQty', header: t('MSG_TXT_GD'), width: '120', styleName: 'text-center' },
    { fieldName: 'cnfmPitmOstrGapQty', header: t('MSG_TXT_STOC_ACINSP'), width: '120', styleName: 'text-center' },
    { fieldName: 'eotStocQty', header: t('MSG_TXT_EOT_STOC_QTY'), width: '120', styleName: 'text-center' },
    { fieldName: 'mmtStocQty', header: t('MSG_TXT_MMT_STOC_QTY'), width: '120', styleName: 'text-center' },

  ];

  const columnLayout = [
    'ymd',
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

  view.setColumnLayout(columnLayout);
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
