<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaSinglePaymentContractorListM - wells 주문상세조회/관리(일시불-개인정보)
3. 작성자 : JSY
4. 작성일 : 2023.03.27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U-0129M10] - wells 주문상세조회/관리(일시불-개인정보)
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="4"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_BRYY_MMDD_ENTRPNO_CBNO')"
        required
        :colspan="2"
      >
        <kw-select
          v-model="searchParams.searchGbn"
          :options="searchGbns"
          rules="required"
        />
        <kw-input
          v-if="searchParams.searchGbn===1"
          v-model="searchParams.bryyMmdd"
          :label="$t('MSG_TXT_BRYY_MMDD_ENTRPNO_CBNO')"
          :placeholder="t('19000101')"
          rules="required"
        />
        <kw-input
          v-if="searchParams.searchGbn===2"
          v-model="searchParams.bzrno"
          :label="$t('MSG_TXT_BRYY_MMDD_ENTRPNO_CBNO')"
          :placeholder="t('MSG_TXT_INP')"
          rules="required"
        />
        <kw-input
          v-if="searchParams.searchGbn===3"
          v-model="searchParams.bzrno"
          :label="$t('MSG_TXT_BRYY_MMDD_ENTRPNO_CBNO')"
          :placeholder="t('MSG_TXT_INP')"
          rules="required"
        />
        <kw-select
          v-if="searchParams.searchGbn===1"
          v-model="searchParams.sexGbn"
          :options="codes.SEX_CD"
          style="width: 50px;"
          rules="required"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CNTOR_NM')"
      >
        <kw-input
          v-model="searchParams.cstKnm"
          icon="search"
          clearable
          :placeholder="t('MSG_TXT_INP_AND_SELT')"
          @click-icon="onClickSearchCstKnm"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_MPNO')"
      >
        <kw-input
          v-model="searchParams.cralLocaraTno"
          :placeholder="t('MSG_TXT_INP')"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_CST_NO')"
      >
        <kw-input
          v-model="searchParams.cntrCstNo"
          icon="search"
          clearable
          :placeholder="t('MSG_TXT_INP_AND_SELT')"
          @click-icon="onClickSearchCntrCstNo"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_EXCLD_CANC')"
      >
        <kw-field
          v-model="searchParams.cntrCanYn"
        >
          <template #default="{ field }">
            <kw-checkbox
              v-bind="field"
              label=""
              val=""
            />
          </template>
        </kw-field>
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
        icon="download_on"
        dense
        secondary
        :disable="pageInfo.totalCount === 0"
        :label="t('MSG_BTN_EXCEL_DOWN')"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="gridMainRef"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrid4"
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
import { codeUtil, useDataService, gridUtil, useMeta, getComponentType, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { getConfig } = useMeta();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { notify, modal } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const gridMainRef = ref(getComponentType('KwGrid'));
const codes = await codeUtil.getMultiCodes(
  'SEX_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const searchGbns = ref([
  { codeId: 1, codeName: t('MSG_TXT_BIRTH_DATE') },
  { codeId: 2, codeName: t('MSG_TXT_ENTRP_NO') },
  { codeId: 3, codeName: t('MSG_TXT_CBNO') },
]);

const searchParams = ref({
  searchGbn: 1, // 조회구분 생년월일 / 사업자법인등록번호
  bryyMmdd: '19800229', // 생년월일
  bzrno: '', // 사업자법인등록번호
  sexGbn: '', // 성별구분
  cstKnm: '', // 계약자명
  cralLocaraTno: '', // 휴대전화번호
  cntrCstNo: '', // 고객번호
  cntrCanYn: 'N', // 취소제외
});

let cachedParams;

async function fetchData() {
  const res = await dataService.get('sms/wells/contract/contracts/order-detail-mngt/singlepayments/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: details, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = gridMainRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  if (pageInfo.value.pageIndex === 1) {
    dataSource.setRows(details);
  } else {
    dataSource.addRows(details);
  }
  dataSource.checkRowStates(true);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = gridMainRef.value.getView();
  const res = await dataService.get('sms/wells/contract/contracts/order-detail-mngt/singlepayments/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSearchCntrCstNo() {
  // notify(t('팝업 준비중 입니다.'));
  const cpProps = { cntrCstNo: searchParams.value.cntrCstNo };

  const { result } = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: cpProps,
  });
  if (result) {
    notify(t('팝업 준비중 입니다.')); // 공통 팝업 피완성. 값을 받아오지 못합니다.
  }
}

async function onClickSearchCstKnm() {
  // notify(t('팝업 준비중 입니다.'));
  const cpProps = { cntrCstKnm: searchParams.value.cstKnm };

  const { result } = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: cpProps,
  });
  if (result) {
    notify(t('팝업 준비중 입니다.')); // 공통 팝업 피완성. 값을 받아오지 못합니다.
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid4(data, view) {
  const fields = [
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'orderInfView' },
    { fieldName: 'cstKnm' },
    { fieldName: 'copnDvCd' },
    { fieldName: 'copnDvNm' },
    { fieldName: 'bzrno' },
    { fieldName: 'bryyMmdd' },
    { fieldName: 'sexDvCd' },
    { fieldName: 'rnmno' },
    { fieldName: 'rnmnoDvCd' },
    { fieldName: 'rnmnoEncr' },
    { fieldName: 'basePdCd' },
    { fieldName: 'basePdNm' },
    { fieldName: 'dscApyTpCd' },
    { fieldName: 'dscApyTpNm' },
    { fieldName: 'dscApyDtlCd' },
    { fieldName: 'dscApyDtlNm' },
    { fieldName: 'cntrRcpFshDtm' },
    { fieldName: 'sppDuedt' },
    { fieldName: 'slDt' },
    { fieldName: 'cntrCanDt' },
    { fieldName: 'cpsDt' },
    { fieldName: 'slPasgDt' },
    { fieldName: 'slCnfmYn' },
    { fieldName: 'cntrCanRsonCd' },
    { fieldName: 'canRsonNm' },
    { fieldName: 'cntrChDtlRsonCd' },
    { fieldName: 'cntrChDtlRsonNm' },
    { fieldName: 'frisuYn' },
    { fieldName: 'freExpnCnfmDtm' },
    { fieldName: 'cttTpCd' },
    { fieldName: 'cttTpNm' },
    { fieldName: 'iostDtlCd' },
    { fieldName: 'sppIvcCrtDtm' },
    { fieldName: 'booSellYn' },
    { fieldName: 'cntrTpCd' },
    { fieldName: 'cntrTpNm' },
    { fieldName: 'sellPrtnrNo' },
    { fieldName: 'fstRgstUsrId' },
    { fieldName: 'fstRgstDeptId' },
    { fieldName: 'rveCd' },
    { fieldName: 'svPrd' },
    { fieldName: 'frisuAsPtrmN' },
    { fieldName: 'frisuBfsvcPtrmN' },
    { fieldName: 'alncmpNm' },
    { fieldName: 'sellEvCd' },
    { fieldName: 'sellEvNm' },
    { fieldName: 'fnlAmt' },
    { fieldName: 'sellAmt' },
    { fieldName: 'vat' },
    { fieldName: 'cntrAmt' },
    { fieldName: 'istmIntAmt' },
    { fieldName: 'feeAckmtBaseAmt' },
    { fieldName: 'crpUc' },
    { fieldName: 'totDscAmt' },
    { fieldName: 'feeAckmtCt' },
    { fieldName: 'ackmtPerfAmt' },
    { fieldName: 'feeAckmtTotAmt' },
    { fieldName: 'feeFxamYn' },
    { fieldName: 'pdSaleFee' },
    { fieldName: 'cashBlam' },
    { fieldName: 'istmMcn' },
    { fieldName: 'mmIstmAmt' },
    { fieldName: 'istmPcamAmt' },
    { fieldName: 'cntrCstNo' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'newAdrZip' },
    { fieldName: 'rnadr' },
    { fieldName: 'rdadr' },
    { fieldName: 'rcgvpKnm' },
    { fieldName: 'istlcCralLocaraTno' },
    { fieldName: 'istlcAdrZip' },
    { fieldName: 'istlcAdr' },
    { fieldName: 'istlcDadr' },
    { fieldName: 'cntrRelDtlNm' },
    { fieldName: 'alncmpCntrDrmVal' },
    { fieldName: 'alncmpCd' },
    { fieldName: 'alncPrtnrDrmVal' },
    { fieldName: 'spcOrdDv' },
    { fieldName: 'sppOrdIvcNo' },
    { fieldName: 'basePdInfo' },
    { fieldName: 'basePdCd2' },
    { fieldName: 'pdQty' },
    { fieldName: 'relPdSearch' },
    { fieldName: 'fgptPdNm1' },
    { fieldName: 'fgptPdNm2' },
    { fieldName: 'fgptPdNm3' },
    { fieldName: 'fgptPdNm4' },
    { fieldName: 'bfsvcBzsDvCd' },
    { fieldName: 'bfsvcBzsDvNm' },
    { fieldName: 'splyBzsDvCd' },
    { fieldName: 'splyBzsDvNm' },
    { fieldName: 'cntrCanDtm' },
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '180', styleName: 'text-center rg-button-link', renderer: { type: 'button' } },
    { fieldName: 'orderInfView', header: t('MSG_TXT_ODER_INF_VIEW'), width: '180', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TXT_ODER_INF_VIEW') },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '138', styleName: 'text-center' },
    { fieldName: 'copnDvNm', header: t('MSG_TXT_CST_DV'), width: '138' },
    { fieldName: 'rnmno', header: `${t('MSG_TXT_RRNO')}/${t('MSG_TXT_ENTRP_NO')}`, width: '160', styleName: 'text-center' },
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '138', styleName: 'text-center' },
    { fieldName: 'basePdNm', header: t('MSG_TXT_PRDT_NM'), width: '292' },
    { fieldName: 'dscApyTpCd', header: t('MSG_TXT_PD_DC_CLASS'), width: '138', styleName: 'text-center' },
    { fieldName: 'dscApyTpNm', header: `${t('MSG_TXT_PD_DC_CLASS')} ${t('MSG_TXT_NM')}`, width: '138', styleName: 'text-center' },
    { fieldName: 'dscApyDtlCd', header: t('MSG_TXT_DISC_CODE'), width: '138', styleName: 'text-center' },
    { fieldName: 'dscApyDtlNm', header: `${t('MSG_TXT_DISC_CODE')} ${t('MSG_TXT_NM')}`, width: '138', styleName: 'text-center' },

    { fieldName: 'cntrRcpFshDtm', header: t('MSG_TXT_RCP_D'), width: '136', styleName: 'text-center' },
    { fieldName: 'sppDuedt', header: t('MSG_TXT_DUEDT'), width: '136', styleName: 'text-center' },
    { fieldName: 'slDt', header: t('MSG_TXT_DT_OF_SALE'), width: '136', styleName: 'text-center' },
    { fieldName: 'cntrCanDt', header: t('MSG_TXT_CAN_D'), width: '136', styleName: 'text-center' },
    { fieldName: 'cpsDt', header: t('MSG_TXT_COMP_D'), width: '136', styleName: 'text-center' },
    { fieldName: 'slPasgDt', header: t('MSG_TXT_SL_PASG_DT'), width: '136', styleName: 'text-center' },
    { fieldName: 'slCnfmYn', header: t('MSG_TIT_SL_CNFM'), width: '136', styleName: 'text-center' },
    { fieldName: 'cntrTpCd', header: `${t('MSG_TXT_CANCEL')}${t('MSG_TXT_TYPE')}`, width: '136', styleName: 'text-center' },
    { fieldName: 'cntrTpNm', header: `${t('MSG_TXT_CANCEL')}${t('MSG_TXT_TYPE')}${t('MSG_TXT_NM')}`, width: '270', styleName: 'text-center' },
    { fieldName: 'cntrChDtlRsonCd', header: `${t('MSG_TXT_CNTRCT')}${t('MSG_TXT_CH')} ${t('MSG_TXT_TYPE')}`, width: '136', styleName: 'text-center' },
    { fieldName: 'cntrChDtlRsonNm', header: `${t('MSG_TXT_CNTRCT')}${t('MSG_TXT_CH')}${t('MSG_TXT_NM')}`, width: '136', styleName: 'text-center' },
    { fieldName: 'frisuYn', header: t('MSG_TXT_FRE_EXPN_YN'), width: '136', styleName: 'text-center' },
    { fieldName: 'freExpnCnfmDtm', header: `${t('MSG_TXT_PD_DC_CLASS')} ${t('MSG_TXT_DTRM_DATE')}`, width: '136', styleName: 'text-center' },
    { fieldName: 'cttTpCd', header: t('MSG_TXT_CTT_CD'), width: '136', styleName: 'text-center' },
    { fieldName: 'cttTpNm', header: t('MSG_TXT_CTT_CD_NM'), width: '136', styleName: 'text-center' },

    { fieldName: 'alncmpNm', header: t('MSG_TXT_ALNC_CD_NM'), width: '136', styleName: 'text-center' },
    { fieldName: 'sellEvNm', header: `${t('MSG_TXT_EV_CD')} ${t('MSG_TXT_NM')}`, width: '136', styleName: 'text-center' },
    { fieldName: 'fnlAmt', header: `${t('MSG_TXT_COM_TOT')} ${t('MSG_TXT_SALE_PRICE')}`, width: '136', styleName: 'text-right' },
    { fieldName: 'sellAmt', header: t('MSG_TXT_SUPP_PRC'), width: '136', styleName: 'text-right' },
    { fieldName: 'vat', header: t('MSG_TXT_VAT'), width: '136', styleName: 'text-right' },
    { fieldName: 'cntrAmt', header: `${t('MSG_TXT_DTRM')}${t('MSG_TXT_SBSCM')}`, width: '136', styleName: 'text-center' },
    { fieldName: 'feeAckmtBaseAmt', header: t('MSG_TXT_FEE'), width: '138', styleName: 'text-right' },
    { fieldName: 'crpUc', header: t('MSG_TXT_CRP_UC'), width: '138', styleName: 'text-right' },
    { fieldName: 'totDscAmt', header: t('MSG_TXT_TOT_DSC_AMT'), width: '138', styleName: 'text-right' },
    { fieldName: 'feeAckmtCt', header: t('TXT_MSG_ACKMT_CT'), width: '138', styleName: 'text-right' },
    { fieldName: 'ackmtPerfAmt', header: `${t('MSG_TXT_COM_TOT')} ${t('TXT_MSG_ACKMT_AMT')}`, width: '138', styleName: 'text-right' },
    { fieldName: 'feeAckmtTotAmt', header: `${t('MSG_TXT_COM_TOT')} ${t('MSG_TXT_PD_STD_FEE')}`, width: '138', styleName: 'text-right' },
    { fieldName: 'feeFxamYn', header: t('MSG_TXT_PD_FEE_FIX'), width: '138', styleName: 'text-right' },
    { fieldName: 'pdSaleFee', header: t('MSG_TXT_PD_SALE_FEE'), width: '138', styleName: 'text-right' },
    { fieldName: 'cashBlam', header: `${t('MSG_TXT_CASH')}${t('MSG_TXT_BLAM')}`, width: '138', styleName: 'text-right' },
    { fieldName: 'istmMcn', header: t('MSG_TXT_ISTM_MCN'), width: '138', styleName: 'text-right' },
    { fieldName: 'mmIstmAmt', header: t('MSG_TXT_MM_INTAM'), width: '138', styleName: 'text-right' },
    { fieldName: 'istmPcamAmt', header: `${t('MSG_TXT_COM_TOT')} ${t('MSG_TXT_ISTM_AMT')}`, width: '138', styleName: 'text-right' },

    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '138', styleName: 'text-right' },
    { fieldName: 'cralLocaraTno', header: `${t('MSG_TXT_CNTRT')} ${t('MSG_TXT_MPNO')}`, width: '160', styleName: 'text-right' },
    { fieldName: 'newAdrZip', header: `${t('MSG_TXT_CNTRT')} ${t('MSG_TXT_ZIP')}`, width: '144', styleName: 'text-right' },
    { fieldName: 'rnadr', header: `${t('MSG_TXT_CNTRT')} ${t('MSG_TXT_STD_ADDR')}`, width: '312', styleName: 'text-center' },
    { fieldName: 'rdadr', header: `${t('MSG_TXT_CNTRT')} ${t('MSG_TXT_DETAIL_ADDR')}`, width: '284', styleName: 'text-right' },

    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_IST_NM'), width: '144', styleName: 'text-center' },
    { fieldName: 'istlcCralLocaraTno', header: `${t('MSG_TXT_INSTR')} ${t('MSG_TXT_MPNO')}`, width: '160', styleName: 'text-center' },
    { fieldName: 'istlcAdrZip', header: `${t('MSG_TXT_INSTR')} ${t('MSG_TXT_ZIP')}`, width: '144', styleName: 'text-center' },
    { fieldName: 'istlcAdr', header: `${t('MSG_TXT_INSTR')} ${t('MSG_TXT_STD_ADDR')}`, width: '312' },
    { fieldName: 'istlcDadr', header: `${t('MSG_TXT_INSTR')} ${t('MSG_TXT_DETAIL_ADDR')}`, width: '284' },
    { fieldName: 'cntrRelDtlNm', header: t('MSG_TXT_COMBI_DV'), width: '138', styleName: 'text-center' },
    { fieldName: 'alncmpCd', header: t('MSG_TXT_ALNC_CD'), width: '138', styleName: 'text-center' },
    { fieldName: 'alncPrtnrDrmVal', header: `${t('MSG_TXT_ALNC')}${t('MSG_TXT_SELL_NO')}`, width: '138', styleName: 'text-center' },
    { fieldName: 'spcOrdDv', header: t('MSG_TXT_SPC_ORD_DV'), width: '157', styleName: 'text-center' },
    { fieldName: 'sppOrdIvcNo', header: t('MSG_TXT_IVC_NO'), width: '157', styleName: 'text-center' },

    { fieldName: 'basePdInfo', header: t('MSG_TXT_PRDT_NM'), width: '197' },
    { fieldName: 'basePdCd2', header: t('MSG_TXT_PRDT_CODE'), width: '197' },
    { fieldName: 'pdQty', header: t('MSG_TXT_PRODUCT_QTY'), width: '197' },
    { fieldName: 'relPdSearch', header: t('MSG_TXT_CONN_PD_VIEW'), width: '197', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TXT_CONN_PD_VIEW') },
    { fieldName: 'fgptPdNm1', header: t('MSG_TXT_FGPT_NM_1'), width: '197', styleName: 'text-center' },
    { fieldName: 'fgptPdNm2', header: t('MSG_TXT_FGPT_NM_2'), width: '197' },
    { fieldName: 'fgptPdNm3', header: t('MSG_TXT_FGPT_NM_3'), width: '197' },
    { fieldName: 'fgptPdNm4', header: t('MSG_TXT_FGPT_NM_4'), width: '197' },
    { fieldName: 'bfsvcBzsDvNm', header: `${t('MSG_TXT_COMP')}${t('MSG_TXT_BS')}${t('MSG_TXT_DIV')}`, width: '197' },
    { fieldName: 'splyBzsDvNm', header: `${t('MSG_TXT_COMP')}${t('MSG_TXT_DIV')}`, width: '197' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    // TODO: 현재 출고요청등록 팝업화면 개발진행 후 변경 예정
    const cntrNo = g.getValue(itemIndex, 'cntrNo');
    const cntrSn = g.getValue(itemIndex, 'cntrSn');
    if (column === 'cntrDtlNo') {
      await modal({
        component: 'WwctaOrderDetailP',
        componentProps: { cntrNo, cntrSn },
      });
    } else if (column === 'orderInfView') {
      notify(t('팝업 준비중 입니다.'));
      // await modal({
      // component: 'WwctaSinglePaymentOrderDetailListP',
      // });
    } else if (column === 'relPdSearch') {
      notify(t('팝업 준비중 입니다.')); // 'W-SS-U-0129P07' 팝업 준비 중
    }
  };
}
</script>
<style scoped>
</style>
