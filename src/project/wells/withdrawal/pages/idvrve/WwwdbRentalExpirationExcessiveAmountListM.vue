<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDB
2. 프로그램 ID : WwwdbRentalExpirationExcessiveAmountListM
3. 작성자 : kimoon.lim
4. 작성일 : 2023.05.18 ~
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
수납 - 렌탈만료초과금현황
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 선수년월 -->
        <kw-search-item
          :label="t('MSG_TXT_PRPD_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.dpDt"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <!-- 계약구분 -->
        <kw-search-item
          :label="t('MSG_TXT_CNTR_DV')"
        >
          <kw-select
            v-model="searchParams.copnDvCd"
            :options="codes.INDV_CRP_CNTR_DV_CD"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>

        <!-- 만료/취소년월-->
        <kw-search-item
          :label="t('MSG_TXT_EXP_CANC_YM')"
        >
          <kw-date-picker
            v-model="searchParams.cntrPdEnddt"
            type="month"
          />
        </kw-search-item>

        <!-- required -->
        <!-- 종료 구분 -->
        <kw-search-item
          :label="t('MSG_TXT_END_DV')"
        >
          <kw-select
            v-model="searchParams.cntrDtlStatCd"
            :options="codes.CNTR_DTL_STAT_CD.filter((e) => ['402', '303'].includes(e.codeId))"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>

        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGrid"
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
import { defineGrid, getComponentType, gridUtil, codeUtil, useDataService, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es'; // isEmpty
import dayjs from 'dayjs';

const { t } = useI18n();
const defaultMonth = dayjs().subtract(0, 'month').format('YYYYMM');
const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const { currentRoute } = useRouter();
const { getConfig } = useMeta();
const apiUrl = '/sms/wells/withdrawal/idvrve/rental-exn-examt';

const codes = await codeUtil.getMultiCodes(
  'INDV_CRP_CNTR_DV_CD', // 계약구분

  'BNK_CD', // 은행코드
  'COD_PAGE_SIZE_OPTIONS',
  'CNTR_DTL_STAT_CD',

);
const searchParams = ref({
  dpDt: defaultMonth,
  copnDvCd: 'ALL', // 계약구분
  cntrPdEnddt: defaultMonth,
  cntrDtlStatCd: 'ALL', // 종료구분
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
let cachedParams;
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const res = await dataService.get(`${apiUrl}/paging`, { params: { ...cachedParams } });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.setRows(pages);
  dataSource.checkRowStates(true);
}

// 엑셀 다운로드 버튼
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get(`${apiUrl}/excel-download`, { params: cachedParams });

  gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 조회 버튼
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
/**
 *  예시데이터 : 선수년월 2023-05 , 만료/취소년월 2023-12
*/
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'dpAmt', dataType: 'number' }, // 선수금(원)
    { fieldName: 'fnitCd' }, // 은행명
    { fieldName: 'acnoEncr' }, // 계좌번호
    { fieldName: 'dprNm' }, // 예금주
    { fieldName: 'copnDvCd' }, // 계약구분
    { fieldName: 'nmn' }, // 차월
    { fieldName: 'cntrPdEnddt' }, // 만료/취소년월
    { fieldName: 'cntrDtlStatCd' }, // 종료구분

  ];

  const columns = [
    { fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_NO'), // 계약번호
      width: '130',
      styleName: 'text-right',
      headerSummaries: { text: t('MSG_TXT_TOT_SUMMARY'), styleName: 'text-center' }, // 총 합계
    },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '99', styleName: 'text-center' }, // 고객명
    { fieldName: 'pdNm', header: t('MSG_TXT_GOODS_NM'), width: '150', styleName: 'text-left' }, // 제품명
    { fieldName: 'dpAmt',
      header: t('MSG_TXT_ATAM_WON'), // 선수금(원)
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      headerSummaries: { expression: 'sum', numberFormat: '#,###' },
    },
    { fieldName: 'fnitCd',
      header: t('MSG_TXT_BNK_NM'), // 은행명
      width: '120',
      styleName: 'text-left',
      options: codes.BNK_CD,
    },
    { fieldName: 'acnoEncr', header: t('MSG_TXT_AC_NO'), width: '246', styleName: 'text-left' }, // 계좌번호
    { fieldName: 'dprNm', header: t('MSG_TXT_ACHLDR'), width: '120', styleName: 'text-center' }, // 예금주
    { fieldName: 'copnDvCd',
      header: t('MSG_TXT_CNTR_DV'), // 계약구분
      width: '120',
      styleName: 'text-center',
      options: codes.INDV_CRP_CNTR_DV_CD,
    },
    { fieldName: 'nmn', header: t('MSG_TXT_NMN'), width: '120', styleName: 'text-right' }, // 차월
    { fieldName: 'cntrPdEnddt',
      header: t('MSG_TXT_EXP_CANC_YM'), // 만료/취소년월
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        return !isEmpty(value) ? `${value.substring(0, 4)}-${value.substring(4, 6)}` : value;
      },
    },
    { fieldName: 'cntrDtlStatCd',
      header: t('MSG_TXT_END_DV'), // 종료구분
      width: '120',
      styleName: 'text-center',
      options: codes.CNTR_DTL_STAT_CD,
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  view.setHeaderSummaries({
    visible: true,
    items: [{ height: 40 }],
  });

  // 스크롤 아래까지 갈시 추가 sorting
  // view.onScrollToBottom = async (item) => {
  //   if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= item.getItemCount()) {
  //     pageInfo.value.pageIndex += 1;
  //     await fetchData();
  //   }
  // };

  view.layoutByColumn('cntrNo').summaryUserSpans = [{ colspan: 3 }];
  // view.layoutByColumn('fnitCd').summaryUserSpans = [{ colspan: 7 }];

  // data.setRows([
  //   // 예시데이터
  //   { col1: '2016-0298637',
  //     col2: '공',
  //     col3: 'KW-B03W1',
  //     col4: '120',
  //     col5: '지역농축협',
  //     col6: '123412-12-123456',
  //     col7: '공선미',
  //     col8: '개인',
  //     col9: '61',
  //     col10: '2022-01',
  //     col11: '만료' },
  // ]);
});
</script>
<style scoped>
</style>
