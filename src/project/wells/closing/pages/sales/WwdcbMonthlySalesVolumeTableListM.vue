<!----
****************************************************************************************************
1. 모듈 : DVB
2. 프로그램 ID : WwdcbMonthlySalesVolumeTableListM - 월 매출수량 집계표   / W-CL-U-0111M01
3. 작성자 : gs.piit172 kim juhyun
4. 작성일 : 2023.03.23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 월 매출수량 집계표 프로그램
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_TASK_DIV')"
          required
        >
          <kw-option-group
            v-model="searchParams.sellTpCd"
            type="radio"
            :options="businessDivideCodes"
            rules="required"
            :label="$t('MSG_TXT_TASK_DIV')"
            @change="onChangeBusinessDivide"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SL_DT')"
          required
          rules="required"
        >
          <kw-date-range-picker
            v-model:from="searchParams.slStartDt"
            v-model:to="searchParams.slEndDt"
            rules="date_range_required|date_range_months:1"
            :label="$t('MSG_TXT_SL_DT')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_MDLV_DV')"
          required
        >
          <kw-select
            v-model="searchParams.sppMthdTpCd"
            :options="['직배', '택배','전체']"
            rules="required"
            :label="$t('MSG_TXT_MDLV_DV')"
            first-option="all"
            first-option-value="ALL"
          /><!-- TODO.공통코드가 정의가 안됨-->
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('TXT_MSG_SELL_CHNL_CD')"
          required
        >
          <kw-select
            v-model="searchParams.sellInflwChnlDtlCd"
            :options="codes.SELL_CHNL_DTL_CD"
            rules="required"
            :label="$t('TXT_MSG_SELL_CHNL_CD')"
            first-option="all"
            first-option-value="ALL"
          /><!--TODO.공통코드가 설계서에 요구하는게 맞는지 확인 필-->
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_SEL_TYPE')"
          required
        >
          <kw-select
            v-model="searchParams.copnDvCd"
            :options="['고객', '법인','전체']"
            rules="required"
            :label="$t('MSG_TXT_SEL_TYPE')"
            first-option="all"
            first-option-value="ALL"
          /><!--공통코드가 정의가 안됨  기존 코드 없어짐-->
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
        </template>
        <kw-btn
          icon="report"
          dense
          :label="$t('MSG_TXT_RPT_BRWS')"
          @click="onClickOpenReport"
        />
        <kw-btn
          icon="download_on"
          dense
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        v-show="isChangeGridMain"
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGrdMain"
      />
      <kw-grid
        v-show="isChangeGridSub"
        ref="grdSubRef"
        name="grdSub"
        :visible-rows="10"
        @init="initGrdSub"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Initialize Component
// -------------------------------------------------------------------------------------------------
import { defineGrid, codeUtil, useDataService, getComponentType, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import { getBusinessDivideCodes } from '~/modules/sms-common/closing/utils/clUtil';

const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const businessDivideCodes = await getBusinessDivideCodes();
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const isChangeGridMain = ref(true);
const isChangeGridSub = ref(false);
const totalCount = ref(0);
const searchParams = ref({
  sellTpCd: '1',
  slStartDt: dayjs().format('YYYY-MM-DD'),
  slEndDt: dayjs().format('YYYY-MM-DD'),
  sppMthdTpCd: 'ALL',
  sellInflwChnlDtlCd: 'ALL',
  copnDvCd: 'ALL',
});

const codes = await codeUtil.getMultiCodes(
  // 'SELL_TP_DTL_CD', // TODO. 판매유형 없어진건지 바뀐건지 확인
  'SELL_CHNL_DTL_CD', // 판매채널
);

async function fetchData() {
  const { sellTpCd } = searchParams.value;
  let res;
  let view;
  let monthSalesQuantityAgrg;

  if (sellTpCd === '1') {
    res = await dataService.get('/sms/wells/closing/sales/rental', { params: cachedParams });
    monthSalesQuantityAgrg = res.data;
    view = grdMainRef.value.getView();
  } else if (sellTpCd === '2') {
    res = await dataService.get('/sms/wells/closing/sales/payment', { params: cachedParams });
    monthSalesQuantityAgrg = res.data;
    view = grdSubRef.value.getView();
  }

  totalCount.value = monthSalesQuantityAgrg.length;
  view.getDataSource().setRows(monthSalesQuantityAgrg);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  fetchData();
}

async function onChangeBusinessDivide() {
  const { sellTpCd } = searchParams.value;

  isChangeGridMain.value = false;
  isChangeGridSub.value = false;
  if (sellTpCd === '1') {
    isChangeGridMain.value = true;
  } else if (sellTpCd === '2') {
    isChangeGridSub.value = true;
  }
}

async function onClickExcelDownload() {
  const { sellTpCd } = searchParams.value;

  let view;
  if (sellTpCd === '1') {
    view = grdMainRef.value.getView();

    await gridUtil.exportView(view, {
      fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_RENTAL')}`,
      timePostfix: true,
    });
  } else if (sellTpCd === '2') {
    view = grdSubRef.value.getView();

    await gridUtil.exportView(view, {
      fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_LUMP_SUM_INST')}`,
      timePostfix: true,
    });
  }
}

async function onClickOpenReport() {
  // TODO. 기능 개발 확인중..
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_PD_CD'), width: '250', styleName: 'text-center' }, // SAP상품코드
    { fieldName: 'basePdCd', header: t('MSG_TXT_RVPY_CD'), width: '250', styleName: 'text-center' }, // 수불코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '250', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '300', styleName: 'text-left' }, // 상품명
    { fieldName: 'sellPrpChval', header: t('MSG_TXT_USWY_DV'), width: '250', styleName: 'text-center' }, // 용도구분
    { fieldName: 'test', header: t('MSG_TXT_CT_CASE'), width: '149', styleName: 'text-center' }, // 건수(건)

  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});

const initGrdSub = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_PD_CD'), width: '250', styleName: 'text-center' }, // SAP상품코드
    { fieldName: 'basePdCd', header: t('MSG_TXT_RVPY_CD'), width: '250', styleName: 'text-center' }, // 수불코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '250', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '300', styleName: 'text-left' }, // 상품명
    { fieldName: 'test1', header: t('MSG_TXT_ALL'), width: '250', styleName: 'text-center' }, // 전체
    { fieldName: 'test2', header: t('MSG_TXT_FULPY'), width: '149', styleName: 'text-center' }, // 완불
    { fieldName: 'test3', header: t('MSG_TXT_RFND'), width: '149', styleName: 'text-center' }, // 환불
  ];

  const layouts = [
    {
      header: t('MSG_TXT_PRDT_CODE'), /* 상품코드 */
      direction: 'horizontal',
      items: ['sapMatCd', 'basePdCd', 'pdCd'],
    },
    'pdNm',
    {
      header: t('MSG_TXT_CT_CASE'), /* 건수(건) */
      direction: 'horizontal',
      items: ['test1', 'test2', 'test3'],
    },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout(layouts);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});

</script>
