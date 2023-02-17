<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WCOU
2. 프로그램 ID : WELLS 월 순주문 집계
3. 작성자 : gs.piit150
4. 작성일 : 2023.02.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 월 순주문 집계 목록 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_DIV')"
          required
        >
          <kw-select
            v-model="searchParams.dv"
            :label="$t('MSG_TXT_DIV')"
            :options="['매출', 'B', 'C', 'D']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PDCT_TP')"
          required
        >
          <kw-select
            v-model="searchParams.pdctTp"
            :label="$t('MSG_TXT_PDCT_TP')"
            :options="['전체', 'B', 'C', 'D']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CODE')"
        >
          <kw-input
            v-model="searchParams.pdCdStrt"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.pdCdEnd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_DT_OF_SALE')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.slDtStrt"
            v-model:to="searchParams.slDtEnd"
            :label="$t('MSG_TXT_DT_OF_SALE')"
            rules="date_range_required|date_range_months:1"
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
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>

        <kw-btn
          dense
          secondary
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_NTOR_AGRG')"
          secondary
          dense
          @click="openNtorAgrgPopup"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';

import { useDataService, getComponentType, useGlobal, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

// const { t } = useI18n();
const { modal } = useGlobal();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const searchParams = ref({

  dv: '',
  pdctTp: '',
  pdCdStrt: '',
  pdCdEnd: '',
  slDtStrt: now.startOf('month').format('YYYYMMDD'),
  slDtEnd: now.endOf('month').format('YYYYMMDD'),

});
let cachedParams;

/*
 *  Event - 순주문 집계 버튼 클릭
 */
async function openNtorAgrgPopup() {
  const param = {
    perfYm: now.add(-1, 'month').format('YYYY-MM'),
  };
  await modal({
    component: 'WwfeaNetOrderRegP',
    componentProps: param,
  });
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: '순주문내역',
    timePostfix: true,
  });
}

async function fetchEvents() {
  const response = await dataService.get('/sms/wells/fee/net-orders', { params: cachedParams });
  const categories = response.data;
  totalCount.value = categories.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(categories);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchEvents();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrdMain(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
    { fieldName: 'col15' },
    { fieldName: 'col16' },
    { fieldName: 'col17' },
    { fieldName: 'col18' },
    { fieldName: 'col19' },
    { fieldName: 'col20' },
    { fieldName: 'col21' },
    { fieldName: 'col22' },
    { fieldName: 'col23' },
    { fieldName: 'col24' },
    { fieldName: 'col25' },
    { fieldName: 'col26' },
    { fieldName: 'col27' },
    { fieldName: 'col28' },
    { fieldName: 'col29' },
    { fieldName: 'col30' },
    { fieldName: 'col31' },
    { fieldName: 'col32' },
    { fieldName: 'col33' },
    { fieldName: 'col34' },
    { fieldName: 'col35' },
    { fieldName: 'col36' },
    { fieldName: 'col37' },
  ];

  const columns = [
    { fieldName: 'col1', header: '총괄단', width: '98', styleName: 'text-left' },
    { fieldName: 'col2', header: '지역단', width: '98', styleName: 'text-left' },
    { fieldName: 'col3', header: '지점', width: '98', styleName: 'text-left' },
    { fieldName: 'col4', header: '번호', width: '112', styleName: 'text-center' },
    { fieldName: 'col5', header: '성명', width: '72', styleName: 'text-left' },
    { fieldName: 'col6', header: '판매유형', width: '110', styleName: 'text-left' },
    { fieldName: 'col7', header: '제품유형', width: '110', styleName: 'text-left' },
    { fieldName: 'col8', header: '기변유형', width: '110', styleName: 'text-left' },
    { fieldName: 'col9', header: '계약상세번호', width: '188', styleName: 'text-center' },
    { fieldName: 'col10', header: '고객구분', width: '83.5', styleName: 'text-left' },
    { fieldName: 'col11', header: '상품명', width: '226.5', styleName: 'text-left' },
    { fieldName: 'col12', header: '상품코드', width: '83.5', styleName: 'text-center' },
    { fieldName: 'col13', header: '용도', width: '108.8', styleName: 'text-left' },
    { fieldName: 'col14', header: '할인구분', width: '83.5' },
    { fieldName: 'col15', header: '할인유형', width: '83.5' },
    { fieldName: 'col16', header: '할인제도', width: '83.5', styleName: 'text-right' },
    { fieldName: 'col17', header: '결합구분', width: '83.5', styleName: 'text-left' },
    { fieldName: 'col18', header: '할부', width: '83.5', styleName: 'text-right' },
    { fieldName: 'col19', header: '기준가격', width: '141.8', styleName: 'text-right' },
    { fieldName: 'col20', header: '홈케어', width: '83.5', styleName: 'text-right' },
    { fieldName: 'col21', header: '홈케어맴버십3년', width: '141.2', styleName: 'text-left' },
    { fieldName: 'col22', header: '정액여부', width: '83.5', styleName: 'text-left' },
    { fieldName: 'col23', header: '금융리스', width: '83.5', styleName: 'text-left' },
    { fieldName: 'col24', header: '인정건수', width: '83.5', styleName: 'text-right' },
    { fieldName: 'col25', header: '재약정여부', width: '113.2', styleName: 'text-left' },
    { fieldName: 'col26', header: '계약일자', width: '113.2', styleName: 'text-center' },
    { fieldName: 'col27', header: '매출일자', width: '113.2', styleName: 'text-center' },
    { fieldName: 'col28', header: '취소일자', width: '113.2', styleName: 'text-center' },
    { fieldName: 'col29', header: '지점장 번호', width: '113.2', styleName: 'text-center' },
    { fieldName: 'col30', header: '지점장 성명', width: '100', styleName: 'text-left' },
    { fieldName: 'col31', header: '렌탈료', width: '104.3', styleName: 'text-right' },
    { fieldName: 'col32', header: '약정기간', width: '83.5', styleName: 'text-right' },
    { fieldName: 'col33', header: '관리주기', width: '83.5', styleName: 'text-right' },
    { fieldName: 'col34', header: '인정실적', width: '141.8', styleName: 'text-right' },
    { fieldName: 'col35', header: '프로모션 번호', width: '104.3', styleName: 'text-right' },
    { fieldName: 'col36', header: '패키지 일련번호', width: '135.1', styleName: 'text-left' },
    { fieldName: 'col37', header: '순주문월', width: '113.2', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}
</script>
