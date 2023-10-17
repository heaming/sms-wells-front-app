<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB (방문관리)
2. 프로그램 ID : WwsnbSamsungManufactureNoInqrM - 삼성 제조번호 조회
3. 작성자 : jungheejin
4. 작성일 : 2023-10-17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 삼성 제조번호 조회 http://localhost:3000/#/service/wwsnb-samsung-manufacture-no-inqr
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
          :label="$t('MSG_TXT_FST_RGST_DT')"
          :colspan="2"
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_OSTR_DT')"
            rules="date_range_required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SS_MNFT_NO')"
        >
          <kw-input
            v-model="searchParams.ssPdctBcNo"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
        >
          <kw-input
            v-model.trim="searchParams.cntrDtlNo"
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
            :placeholder="`${$t('MSG_TXT_CNTR_NO')}-${$t('MSG_TXT_CNTR_SN')}`"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SELL_CD')"
        >
          <kw-input
            v-model="searchParams.saleCd"
            :label="$t('MSG_TXT_SELL_CD')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CST_NM')"
        >
          <kw-input
            v-model="searchParams.rcgvpKnm"
            :label="$t('MSG_TXT_CST_NM')"
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
        <kw-separator
          spaced
          vertical
          inset
        />
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
import { codeUtil, getComponentType, defineGrid, gridUtil, useDataService } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const router = useRouter();
const { currentRoute } = useRouter();
const { t } = useI18n();
const now = dayjs();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/samsung-manufacture-no-inqr';

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  startDt: now.startOf('month').format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  ssPdctBcNo: '', // 삼성 제조번호
  cntrDtlNo: '', // 계약상세번호
  saleCd: '', // 판매코드
  rcgvpKnm: '', // 고객명
});
// 테스트 정보
// const searchParams = ref({
//   startDt: '20201104',
//   endDt: '20201104',
//   ssPdctBcNo: '08W88NENA00083B', // 삼성 제조번호
//   cntrDtlNo: 'W20207197507-1', // 계약상세번호
//   saleCd: 'WP04120232', // 판매코드
//   rcgvpKnm: '박봉희', // 고객명
// });

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
});

let cachedParams;
async function fetchData() {
  const res = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: result, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(result);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
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

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const columns = [
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      renderer: { type: 'button' },
      styleName: 'text-center rg-button-link',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        if (!isEmpty(cntrNo)) {
          return `${cntrNo}-${cntrSn}`;
        }
      },
    },
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_CST_TYPE'), width: '140', styleName: 'text-center' },
    { fieldName: 'saleCd', header: t('MSG_TXT_SELL_CD'), width: '140', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '170', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '130', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '240', styleName: 'text-center' },
    { fieldName: 'ssPdctBcNo', header: t('MSG_TXT_SS_MNFT_NO'), width: '180', styleName: 'text-left' },
    { fieldName: 'fstRgstDt', header: t('MSG_TXT_FST_RGST_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'ogNm', header: t('MSG_TXT_RGS_BRANCH'), width: '150', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PIC'), width: '80', styleName: 'text-center' },
    { fieldName: 'wkPsicDvCd', header: t('MSG_TXT_PSIC_DV'), width: '80', styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.onCellItemClicked = async (grid, { column, itemIndex }) => {
    if (column === 'cntrNo') {
      const cntrNo = grid.getValue(itemIndex, 'cntrNo');
      const cntrSn = grid.getValue(itemIndex, 'cntrSn');

      router.push({
        path: '/service/wwsnb-individual-service-list',
        query: {
          cntrNo,
          cntrSn,
        },
      });
    }
  };
});

</script>
