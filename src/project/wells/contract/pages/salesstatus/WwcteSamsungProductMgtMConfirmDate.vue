<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTE
2. 프로그램 ID : WwcteSamsungProductMgtM - 삼성전자 상품관리
3. 작성자 : gs.ritvik.m -> joobro
4. 작성일 : 2023.04.03
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 삼성전자 상품관리(확정일) 화면
****************************************************************************************************
--->
<template>
  <kw-search @search="onClickSearch">
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_DUEDT')"
        required
      >
        <kw-date-range-picker
          v-model:from="searchParams.strtdt"
          v-model:to="searchParams.enddt"
          :label="$t('MSG_TXT_DUEDT')"
          rules="date_range_required"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_ORD_TYP')"
      >
        <kw-option-group
          v-model="searchParams.sellTpCd"
          :label="$t('MSG_TXT_ORD_TYP')"
          type="radio"
          :options="codes.SUBSET_SELL_TP_CD"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_SM_ORD_NO')"
      >
        <kw-input
          v-model="searchParams.sppBzsOrdId"
          :label="$t('MSG_TXT_SM_ORD_NO')"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_SERIAL_NO')"
      >
        <kw-input
          v-model="searchParams.pdctIdno"
          :label="$t('MSG_TXT_SERIAL_NO')"
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
        v-permission:update
        icon="upload_on"
        dense
        secondary
        :label="$t('MSG_TXT_EXCEL_UPLOAD')"
        @click="onClickExcelUpload"
      />
      <kw-btn
        v-permission:download
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="pageInfo.totalCount===0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdRef"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      name="grdConfirm"
      @init="initGrd"
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
import {
  codeUtil,
  defineGrid,
  getComponentType,
  gridUtil,
  modal,
  useDataService,
  useMeta,
} from 'kw-lib';
import dayjs from 'dayjs';
import useGridDataModel from '~sms-common/contract/composable/useGridDataModel';

const meta = useMeta();
const { currentRoute } = useRouter();
const dataService = useDataService();
const { t } = useI18n();
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'SELL_TP_CD',
  'LC_CTT_RS_CD',
);

codes.SUBSET_SELL_TP_CD = [
  { codeId: '', codeName: t('MSG_TXT_ALL') /* 전체' */ },
  codes.SELL_TP_CD.find((code) => code.codeId === '2'),
  codes.SELL_TP_CD.find((code) => code.codeId === '1'),
];
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRef = ref(getComponentType('KwGrid'));
const grdView = computed(() => grdRef.value?.getView());
const grdData = computed(() => grdRef.value?.getData());

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(meta.getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
const searchParams = reactive({
  strtdt: dayjs()
    .format('YYYYMMDD'),
  enddt: dayjs()
    .format('YYYYMMDD'),
  sellTpCd: '',
  sppBzsOrdId: '', /* 삼성주문번호 */
  pdctIdno: '', /* 시리얼번호 */
});

const fetchPage = async (pageIndex = pageInfo.value.pageIndex, pageSize = pageInfo.value.pageSize) => {
  const params = {
    ...cachedParams,
    pageIndex,
    pageSize,
  };
  const response = await dataService.get('/sms/wells/contract/sales-status/sec-product-management/confirm-days/paging', { params });

  pageInfo.value = response.data.pageInfo;
  grdData.value.setRows(response.data.list);
};

async function onClickSearch() {
  cachedParams = { ...toRaw(searchParams) };
  pageInfo.value.pageIndex = 1;
  await fetchPage(1);
}

async function onClickExcelUpload() {
  const { result, payload } = await modal({
    component: 'ZctzExcelUploadP',
    componentProps: {
      templateDocId: 'FOM_CTE_0002',
      columns: {
        // veeValidate 에서 요구하는 형식과 해당 lint 룰과 상충된다.
        // eslint-disable-next-line no-useless-escape
        cntrNo: { label: t('MSG_TXT_CNTR_NO'), width: 200, rules: 'regex:W\\d{11}', required: true },
        cntrSn: { label: t('MSG_TXT_CNTR_SN'), type: Number, width: 100, rules: 'max:5', required: true },
        notUse1: { label: t('MSG_TXT_WALL_MNT_ORD_NO') /* 벽걸이주문번호 */, width: 200 },
        sppBzsOrdId: { label: t('MSG_TXT_ORD_NO') /* 주문번호 */, width: 200, required: true },
        notUse3: { label: t('MSG_TXT_UNUITM') /* 특이사항 */, width: 200 },
        sppFshDt: { label: t('MSG_TXT_INST_DT'), width: 120, datetimeFormat: 'date', required: true },
        pdctIdno: { label: t('MSG_TXT_SERIAL_NO'), width: 100, required: true },
        notUse4: { label: t('MSG_TXT_RSV_DATE') /* 예약일 */, width: 120, datetimeFormat: 'date' },
        notUse5: { label: t('MSG_TXT_STOCK_DT') /* 재고입고일 */, width: 120, datetimeFormat: 'date' },
        notUse6: { label: t('MSG_TXT_INST_CLS') /* 설치구분 */, width: 100 },
        sppBzsModelId: { label: t('MSG_TXT_SPP_BIZ_MODEL'), width: 200, required: true },
      },
    },
  });

  const { list } = payload;

  if (result) {
    const response = await dataService.post('/sms/wells/contract/sales-status/sec-product-management/confirm-days/excel-upload', list);
    if (response.data?.processCount > 0) {
      fetchPage();
    }
  }
}

async function onClickExcelDownload() {
  if (!cachedParams) { cachedParams = { ...toRaw(searchParams) }; }
  const response = await dataService.get('/sms/wells/contract/sales-status/sec-product-management/confirm-days', { params: cachedParams });
  await gridUtil.exportView(grdView.value, {
    fileName: `${currentRoute?.value.meta?.menuName}(${t('MSG_TXT_DTRM_DATE')})`,
    timePostfix: true,
    exportData: response.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd = defineGrid((data, view) => {
  useGridDataModel(view, {
    cntrNo: { displaying: false },
    cntrSn: { displaying: false },
    cntrNoSn: {
      label: t('MSG_TXT_CNTR_DTL_NO'), /* 계약상세번호 */
      width: 137,
      valueExpression: 'values["cntrNo"] + "-" + values["cntrSn"]',
      classes: 'text-center',
    },
    rcgvpKnm: { label: t('MSG_TXT_CNTOR_NM') /* 계약자명 */, width: 136, classes: 'text-center' },
    sellTpCd: { label: t('MSG_TXT_ORD_TYP') /* 주문유형 */, width: 136, options: codes.SELL_TP_CD },
    pdNm: { label: t('MSG_TXT_PRDT_NM') /* 상품명 */, width: 253 },
    pdCd: { label: t('MSG_TXT_PRDT_CODE') /* 상품코드 */, width: 168, classes: 'text-center' },
    sppBzsOrdId: { label: t('MSG_TXT_SM_ORD_NO') /* 삼성주문번호 */, width: 168, classes: 'text-center' },
    sppFshDt: { label: t('MSG_TXT_INST_DT') /* 설치일 FIXME: 실제론 배송완료일시 */, width: 136, datetimeFormat: 'date' },
    cttRsCd: {
      label: t('MSG_TXT_CNT_CD'), /* 컨택코드 */
      width: 136,
      classes: 'text-center',
      displaying: (val) => {
        const code = codes.LC_CTT_RS_CD.find((c) => c.codeId === val);
        if (!code) { return ''; }
        return `(${code.codeId})${code.codeName}`;
      },
    },
    canDt: { label: t('MSG_TXT_CAN_D') /* 취소일 */, width: 136, classes: 'text-center' },
    pdctIdno: { label: t('MSG_TXT_SERIAL_NO') /* 시리얼번호 */, width: 152, classes: 'text-center' },
    sppBzsModelId: { label: t('MSG_TXT_SM_MOD_NO') /* 삼성모델명 */, width: 152, classes: 'text-center' },
    sppFshRgstDtm: { label: t('MSG_TXT_EXL_UPL_DT'), /* FIXME: 실제론 배송완료등록일시 */ width: 170, datetimeFormat: 'datetime' },
    batWkFshDtm: { label: t('MSG_TXT_BAT_EXEC_DT'), width: 170, datetimeFormat: 'datetime' },
    rgstFeeFlpymYn: { label: t('MSG_TXT_REG_NON_PMT'), width: 146.8, classes: 'text-center' },
  });

  view.rowIndicator.visible = true;
  view.setFixedOptions({
    colCount: 3,
  });
});

onClickSearch();

</script>
<style scoped>
</style>
