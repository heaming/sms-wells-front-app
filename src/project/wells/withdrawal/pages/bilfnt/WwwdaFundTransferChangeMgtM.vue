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
        <!-- 기준일자 -->
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
        <!-- 이체구분 -->
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
      <!-- 엑셀 다운로드 -->
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
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/deposit-ncrt-check', { params: { ...cachedParams, ...pageInfo.value }, timeout: 300000 });
  const { list, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

// 조회
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = { ...searchParams.value };
  await fetchData();
}

// 엑셀 다운로드
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
    { fieldName: 'rveAmt', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'aftnClsf', header: t('MSG_TXT_AUTO_FNT_CLSF'), width: '200', styleName: 'text-center' }, // 자동이체 분류
    { fieldName: 'cntr',
      header: t('MSG_TXT_CNTR_DTL_NO'), // 계약상세번호
      width: '120',
      styleName: 'text-center',
      // eslint-disable-next-line no-unused-vars
      displayCallback: (g, i, v) => {
        const { cntrNo, cntrSn } = gridUtil.getRowValue(g, i.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      },
    },
    { fieldName: 'bilDt',
      header: t('MSG_TXT_FNT_DT'), // 이체일자
      width: '120',
      styleName: 'text-center',
      dataType: 'date',
      datetimeFormat: 'yyyy-MM-dd',
    },
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_SEL_TYPE'), // 판매유형
      width: '120',
      styleName: 'text-center',
      options: codes.SELL_TP_CD,
    },
    { fieldName: 'rveAmt',
      header: t('MSG_TXT_RCV_AMT') + t('MSG_TXT_WON'), // 수신금액(원)
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
