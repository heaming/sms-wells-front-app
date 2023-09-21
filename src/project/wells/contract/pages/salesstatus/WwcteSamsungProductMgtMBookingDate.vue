<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTE
2. 프로그램 ID : WwcteSamsungProductMgtMBookingDate - 삼성전자 상품관리(예약일)
3. 작성자 : gs.nidhi.d -> joobro
4. 작성일 : 2023.04.05
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 삼성전자 상품관리
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="2"
    one-row
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_RSV_DATE')"
        required
      >
        <kw-date-range-picker
          v-model:from="searchParams.strtdt"
          v-model:to="searchParams.enddt"
          :label="$t('MSG_TXT_RSV_DATE')"
          rules="date_range_required"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_ORD_TYP')">
        <kw-option-group
          v-model="searchParams.sellTpCd"
          :label="$t('MSG_TXT_ORD_TYP')"
          type="radio"
          :options="codes.SUBSET_SELL_TP_CD"
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
          @change="fetchPage"
        />
      </template>
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
      ref="grdRef"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      name="grdBooking"
      @init="initGrid"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchPage"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useMeta } from 'kw-lib';
import useGridDataModel from '~sms-common/contract/composable/useGridDataModel';
import dayjs from 'dayjs';

const { t } = useI18n();
const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

codes.SUBSET_SELL_TP_CD = [
  { codeId: '', codeName: '전체' },
  codes.SELL_TP_CD.find((code) => code.codeId === '2'),
  codes.SELL_TP_CD.find((code) => code.codeId === '1'),
];
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRef = ref(getComponentType('KwGrid'));
const grdView = computed(() => grdRef.value?.getView());
const grdData = computed(() => grdRef.value?.getData());

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
const searchParams = reactive({
  strtdt: dayjs()
    .startOf('M')
    .format('YYYYMMDD'),
  enddt: dayjs()
    .startOf('M')
    .add(1, 'M')
    .format('YYYYMMDD'),
  sellTpCd: '',
});

const fetchPage = async (pageIndex = pageInfo.value.pageIndex, pageSize = pageInfo.value.pageSize) => {
  const params = {
    ...cachedParams,
    pageIndex,
    pageSize,
  };
  const response = await dataService.get('/sms/wells/contract/sales-status/sec-product-management/reservation-days/paging', { params });

  pageInfo.value = response.data.pageInfo;
  grdData.value.setRows(response.data.list);
};

async function onClickSearch() {
  cachedParams = { ...toRaw(searchParams) };
  pageInfo.value.pageIndex = 1;
  await fetchPage(1);
}

async function onClickExcelDownload() {
  const response = await dataService.get('/sms/wells/contract/sales-status/sec-product-management/reservation-days', { params: cachedParams });
  await gridUtil.exportView(grdView.value, {
    fileName: `${currentRoute?.value.meta?.menuName}(${t('MSG_TXT_RSV_DATE')})`,
    timePostfix: true,
    exportData: response.data,
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  useGridDataModel(view, {
    ogId: { displaying: false },
    ogCd: { label: t('MSG_TXT_OG_CD') /* 조직코드 */, width: 136, classes: 'text-center' },
    hooPrtnrNo: { label: t('MSG_TXT_BRNCH_MNGR_NO') /* 지점장사번 */, width: 136, classes: 'text-center' },
    sellPrtnrNo: { label: t('MSG_TXT_PRTNR_EMP_NO') /* 파트너사번 */, width: 136, classes: 'text-center' },
    prtnrKnm: { label: t('MSG_TXT_PTNR_NAME') /* 파트너명 */, width: 136, classes: 'text-center' },
    cntrNo: { displaying: false },
    cntrSn: { displaying: false },
    cntrNoSn: {
      label: t('MSG_TXT_CNTR_NO'), /* 계약번호 */
      width: 168,
      valueExpression: 'values["cntrNo"] + "-" + values["cntrSn"]',
      classes: 'text-center',
    },
    rcgvpKnm: { label: t('MSG_TXT_CNTRT') /* 수령자명 -> 계약자 */, width: 136, classes: 'text-center' },
    pdCd: { label: t('TXT_MSG_PD_CD') /* 상품코드 */, width: 136, classes: 'text-center' },
    pdNm: { label: t('MSG_TXT_PRDT_NM') /* 상품명 */, width: 260 },
    sppBzsOrdId: { label: t('MSG_TXT_SM_ORD_NO') /* 삼성 주문번호 */, width: 168, classes: 'text-center' },
    sellTpCd: { label: t('MSG_TXT_ORD_TYP') /* 주문유형 */, width: 168, options: codes.SELL_TP_CD },
    resDt: { label: t('MSG_TXT_RSV_DATE') /* 예약일 */, width: 138, datetimeFormat: 'date' },
    stocStrDt: { label: t('MSG_TXT_STOCK_DT') /* 재고입고일 */, width: 138, datetimeFormat: 'date' },
    fstRgstDtm: { label: t('MSG_TXT_UPDATE_DT') /* 업데이트일시 */, width: 212, datetimeFormat: 'datetime' },
    ogTpCd: { displaying: false },
  });

  view.rowIndicator.visible = true;
});

</script>

<style scoped>
</style>
