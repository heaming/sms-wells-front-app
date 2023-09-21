<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDA
2. 프로그램 ID : WwwdaFundTransferChangeMgtM - 자동이체결과 체크리스트(수신완료 입금생성 누락건) (W-WD-U-0035M02)
3. 작성자 : donghyun.yoo
4. 작성일 : 2023.02.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
계좌/카드 자동이체 생성자료 조회 및 오류체크 구분별 조회
****************************************************************************************************
--->
<template>
  <kw-search
    one-row
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="t('MSG_TXT_BASE_DT')"
        required
      >
        <kw-date-picker
          v-model="searchParams.bilDt"
          :label="t('MSG_TXT_BASE_DT')"
          rules="required"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_FNT_DV')"
        required
      >
        <kw-option-group
          v-model="searchParams.fntDvCd"
          :label="t('MSG_TXT_FNT_DV')"
          rules="required"
          type="radio"
          :options="codes.FNT_DV_CD.filter(v => v.codeId !== '03')"
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
      <kw-btn
        v-permission:download
        :disable="pageInfo.totalCount === 0"
        icon="download_on"
        dense
        secondary
        :label="t('MSG_BTN_EXCEL_DOWN')"
        @click="onClickExcelDownload"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMainRef"
      name="grdMain2"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrid"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
import { useDataService, codeUtil, gridUtil, defineGrid, getComponentType, useMeta } from 'kw-lib';
import dayjs from 'dayjs';

const dataService = useDataService();
const { t } = useI18n();
const now = dayjs();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  itemsChecked: {
    type: Boolean,
    required: true,
  },
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'FNT_DV_CD',
  'SELL_TP_CD',
);

const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  bilDt: now.format('YYYYMMDD'), // 기준일자
  fntDvCd: '01', // 이체구분
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/deposit-ncrt-check', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = { ...searchParams.value };
  await fetchData();
}

async function onClickExcelDownload() {
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/deposit-ncrt-check/excel-download', { params: cachedParams });
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${props.itemsChecked}`,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'aftnClsf' },
    { fieldName: 'cntr' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'bilDt' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'dpAmt', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'aftnClsf', header: t('MSG_TXT_AUTO_FNT_CLSF'), width: '200', styleName: 'text-center' },
    { fieldName: 'cntr',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '120',
      styleName: 'text-center',
      // eslint-disable-next-line no-unused-vars
      displayCallback: (g, i, v) => {
        const { cntrNo, cntrSn } = gridUtil.getRowValue(g, i.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      },
    },
    { fieldName: 'bilDt', header: t('MSG_TXT_FNT_DT'), width: '120', styleName: 'text-center', dataType: 'date', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'dpAmt', header: t('MSG_TXT_RCV_AMT'), width: '120', styleName: 'text-center', numberFormat: '#,##0' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
