<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbRentalCancelPresentStateListM - 취소현황 > 렌탈
3. 작성자 : younuk.choi
4. 작성일 : 2023.06.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈 취소현황
- TODO : 순수이탈조회 조건 확인/리포트
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="4"
    @search="onClickSearch"
  >
    <kw-search-row>
      <!-- row1 업무구분 -->
      <kw-search-item :label="$t('MSG_TXT_TASK_DIV')">
        <kw-option-group
          v-model="searchParams.sellTpCd"
          type="radio"
          :options="codes.SELL_TP_CD.filter((v) => ['2'].includes(v.codeId))"
        />
      </kw-search-item>
      <!-- row1 판매유형 -->
      <kw-search-item :label="$t('MSG_TXT_SEL_TYPE')">
        <kw-select
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD.filter((v) => ['21','22','23','24','25','26'].includes(v.codeId))"
          first-option="all"
        />
      </kw-search-item>
      <!-- row1 취소일  -->
      <kw-search-item
        :label="$t('MSG_TXT_CAN_D')"
        colspan="2"
      >
        <kw-date-range-picker
          v-model:from="searchParams.cancelFromDt"
          v-model:to="searchParams.cancelToDt"
          rules="date_range_months:3"
        />
      </kw-search-item>
    </kw-search-row>

    <kw-search-row>
      <!-- row2 담당자 사번 -->
      <kw-search-item :label="$t('MSG_TXT_PSIC_EMPNO')">
        <kw-input
          v-model="searchParams.rgstUsrEpNo"
          maxlength="10"
          regex="num"
        />
      </kw-search-item>
      <!-- row2 상품구분 -->
      <kw-search-item
        :label="$t('MSG_TXT_PRDT_GUBUN')"
        colspan="2"
      >
        <zwpd-product-classification-select
          ref="productSelRef"
          v-model:product1-level="searchParams.pdHclsfId"
          v-model:product2-level="searchParams.pdMclsfId"
          product1-first-option="all"
          :product1-first-option-label="$t('TXT_MSG_PD_HCLSF_ID') + ' ' + $t('MSG_TXT_ALL')"
          product2-first-option="all"
          :product2-first-option-label="$t('MSG_TXT_PD_MCLSF_ID') + ' ' + $t('MSG_TXT_ALL')"
          search-lvl="2"
        />
        <kw-checkbox
          v-model="searchParams.onlySprYN"
          class="pl10"
          :label="$t('MSG_TXT_SEARCH_PURE_SPR_ONLY')"
          :false-value="N"
          :true-value="Y"
        />
      </kw-search-item>
      <!-- row2 상품코드 -->
      <kw-search-item :label="$t('MSG_TXT_PRDT_CODE')">
        <kw-input
          v-model="searchParams.basePdCd"
          icon="search"
          @click-icon="onClickSearchPd"
        />
      </kw-search-item>
    </kw-search-row>

    <kw-search-row>
      <!-- row3 취소유형 -->
      <kw-search-item
        :label="$t('MSG_TXT_CNCL_TP')"
      >
        <kw-select
          v-model="searchParams.cntrStatChRsonCd"
          :options="codes.CMN_STAT_CH_RSON_CD"
          first-option="all"
        />
      </kw-search-item>
      <!-- row3 고객구분 -->
      <kw-search-item
        :label="$t('MSG_TXT_CST_DV')"
      >
        <kw-select
          v-model="searchParams.copnDvCd"
          :options="codes.COPN_DV_CD"
          first-option="all"
        />
      </kw-search-item>
      <!-- row3 계약일자  -->
      <kw-search-item
        :label="$t('MSG_TXT_CNTR_DATE')"
        colspan="2"
      >
        <kw-date-range-picker
          v-model:from="searchParams.cntrFromDt"
          v-model:to="searchParams.cntrToDt"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <!-- row4 설치일자  -->
      <kw-search-item
        :label="$t('MSG_TXT_IST_DT')"
        colspan="2"
      >
        <kw-date-range-picker
          v-model:from="searchParams.installFromDt"
          v-model:to="searchParams.installToDt"
        />
      </kw-search-item>
      <!-- row4 입금유형 -->
      <kw-search-item
        :label="$t('MSG_TXT_DP_TP')"
      >
        <kw-select
          v-model="searchParams.dpTpCd"
          :options="codes.DP_TP_CD.filter((v) => v.codeId==='0401')"
          first-option="all"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>

  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change:model-value="(v)=>{pageInfo.pageSize=v;}"
        />
        <span class="ml6">{{ t('MSG_TXT_UNIT_COLON_WON') }}</span>
      </template>

      <kw-btn
        v-permission:download
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        icon="download_on"
        dense
        secondary
        :disable="!pageInfo.totalCount"
        @click="onClickExcelDownload"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <kw-btn
        v-permission:print
        :label="$t('MSG_BTN_RPT_BRWS')"
        icon="report"
        dense
        secondary
        :disable="!pageInfo.totalCount"
        @click="onClickReport"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMainRental"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrid"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import ZwpdProductClassificationSelect from '~sms-common/product/pages/standard/components/ZwpdProductClassificationSelect.vue';
import dayjs from 'dayjs';

const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const { modal, notify } = useGlobal();
const dataService = useDataService();
const router = useRouter();
const now = dayjs();
const grdMainRental = ref(getComponentType('KwGrid'));

const searchParams = ref({
  sellTpCd: '2', // 판매유형
  sellTpDtlCd: '', // 판매세부
  cancelFromDt: now.startOf('month').format('YYYYMMDD'), // 시작일
  cancelToDt: now.format('YYYYMMDD'), // 종료일
  rgstUsrEpNo: '', // 등록담당[사번]
  pdHclsfId: '', // 상품대분류
  pdMclsfId: '', // 상품중분류
  onlySprYN: 'N', // 순수이탈만조회
  basePdCd: '', // 상품코드
  cntrStatChRsonCd: '', // 취소유형
  copnDvCd: '', // 고객구분
  cntrFromDt: '', // 시작일
  cntrToDt: '', // 종료일
  installFromDt: '', // 시작일
  installToDt: '', // 종료일
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'COPN_DV_CD',
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
  'CMN_STAT_CH_RSON_CD',
  'DP_TP_CD',
);

const pageInfo = ref({
  totalCount: 0,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
let cachedParams;

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData() {
  if (isEmpty(cachedParams)) return;

  const res = await dataService.get('/sms/wells/contract/changeorder/rental-cancels', { params: { ...cachedParams } });

  pageInfo.value.totalCount = res.data.length;
  const view = grdMainRental.value.getView();
  view.getDataSource().setRows(res.data);

  view.groupPanel.visible = false;
  view.groupBy(['prtnrNo']);
  view.rowGroup.expandedAdornments = 'footer';
}

// 상품코드 검색아이콘 클릭
async function onClickSearchPd() {
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.basePdCd,
    selectType: pdConst.PD_SEARCH_SINGLE,
  };

  const returnPdInfo = await modal({
    component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
    componentProps: searchPopupParams,
  });

  if (returnPdInfo.result) {
    searchParams.value.basePdCd = returnPdInfo.payload?.[0].pdCd;
  }
}

async function onClickExcelDownload() {
  const view = grdMainRental.value.getView();
  const res = await dataService.get('/sms/wells/contract/changeorder/rental-cancels/excel-download', { params: { ...cachedParams } });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickReport() {
  notify('TODO :  OZ리포트 팝업으로 호출');
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sellTpNm', header: t('MSG_TXT_TASK_DIV'), width: '120', styleName: 'text-center' }, // [업무구분]
    { fieldName: 'sellTpDtlNm', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center' }, // [판매유형]
    { fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center',
      displayCallback: (g, i) => `${g.getValue(i.itemIndex, 'cntrNo')}-${g.getValue(i.itemIndex, 'cntrSn')}`,
    }, // [계약상세번호]
    { fieldName: 'cntrCstKnm', header: t('MSG_TXT_CST_NM'), width: '120', styleName: 'text-center' }, // [고객명]
    { fieldName: 'copnDvNm', header: t('MSG_TXT_CST_DV'), width: '120', styleName: 'text-center' }, // [고객구분]
    { fieldName: 'bzrno', header: t('MSG_TXT_ENTRP_NO'), width: '120', styleName: 'text-center' }, // [사업자번호]
    { fieldName: 'txinvPblOjYn', header: t('MSG_TXT_BILL') + t('MSG_TXT_PBL') + t('MSG_TXT_YN2'), width: '120', styleName: 'text-center' }, // [계산서 발행유무]
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '120', styleName: 'text-center' }, // [고객번호]
    { fieldName: 'ogCd', header: t('MSG_TXT_BRCH_CD'), width: '120', styleName: 'text-center' }, // [지점코드]
    { fieldName: 'pdHclsfNm', header: t('TXT_MSG_PD_HCLSF_ID'), width: '140', styleName: 'text-center' }, // [상품유형1]
    { fieldName: 'pdMclsfNm', header: t('MSG_TXT_PD_MCLSF_ID'), width: '150', styleName: 'text-center' }, // [상품유형2]
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '300' }, // [상품명]
    { fieldName: 'stplPtrm', header: t('MSG_TXT_DUTY_STPL'), width: '100', styleName: 'text-right', dataType: 'number' }, // [의무약정]
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_CNTR_DATE'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [계약일자]
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [설치일자]
    { fieldName: 'rsgAplcDt', header: t('MSG_TXT_CANC_RQDT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [요청일자]
    { fieldName: 'rsgFshDt', header: t('MSG_TXT_CANC_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [취소일자]
    { fieldName: 'canDtInDt', header: t('MSG_TXT_CANC_DT') + t('MSG_TXT_IN_D'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [취소일자입력일]
    { fieldName: 'cntrStatChRsonCd', header: t('MSG_TXT_CNCL_TP'), width: '100', styleName: 'text-center' }, // [취소유형]
    { fieldName: 'cntrStatChRsonNm', header: t('MSG_TXT_CNCL_TP') + t('MSG_TXT_NM'), width: '250', styleName: 'text-center' }, // [취소유형명]
    { fieldName: 'ichrPrtnrNo', header: t('MSG_TXT_CNT_PER'), width: '120', styleName: 'text-center' }, // [담당자사번]
    { fieldName: 'ichrPrtnrNm', header: t('MSG_TXT_PIC_NM'), width: '120', styleName: 'text-center' }, // [담당자명]
    { fieldName: 'reqdDt', header: t('철거일자'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [철거일자]
    { fieldName: 'pdUseDc', header: t('MSG_TXT_USE_DAY'), width: '100', styleName: 'text-right', dataType: 'number' }, // [사용일]
    { fieldName: 'prgsNmnN', header: t('MSG_TXT_USE_NMN'), width: '100', styleName: 'text-right', dataType: 'number' }, // [사용차월]
    { fieldName: 'rsonNm', header: t('MSG_TXT_CANCEL') + t('MSG_TXT_CNTN'), width: '250' }, // [취소내용]
    { fieldName: 'slAmt', header: t('MSG_TXT_SL_AMT'), width: '100', styleName: 'text-right', dataType: 'number' }, // [매출금액]
    { fieldName: 'slCtrAmt', header: t('MSG_TXT_SL_CTR'), width: '100', styleName: 'text-right', dataType: 'number' }, // [매출조정]
    { fieldName: 'totPrpdAmt', header: t('MSG_TXT_PRPD_AMT'), width: '100', styleName: 'text-right', dataType: 'number' }, // [선수금액]
    { fieldName: 'csmbCostBorAmt', header: t('MSG_TXT_CSMB_CS'), width: '100', styleName: 'text-right', dataType: 'number' }, // [소모품비]
    { fieldName: 'reqdCsBorAmt', header: t('MSG_TXT_REQD_CS'), width: '100', styleName: 'text-right', dataType: 'number' }, // [철거비]
    { fieldName: 'borAmt', header: t('MSG_TXT_CCAM'), width: '100', styleName: 'text-right', dataType: 'number' }, // [위약금]
    { fieldName: 'lsRntf', header: t('MSG_TXT_PD_LENT_LOST_LOG'), width: '100', styleName: 'text-right', dataType: 'number' }, // [분실손료]
    { fieldName: 'totRfndAmt', header: t('MSG_TXT_RFND_TOT_AMT'), width: '100', styleName: 'text-right', dataType: 'number' }, // [환불총액]
    { fieldName: 'exCentrNoSn', header: t('MSG_BTN_PREV') + t('MSG_TXT_CNTR_DTL_NO'), width: '120', styleName: 'text-center' }, // [이전계약상세번호]
    { fieldName: 'bizSpptPrtnrNo', header: t('MSG_TXT_MNGER_EPNO'), width: '120', styleName: 'text-center' }, // [매니저사번]
    { fieldName: 'bizSpptPrtnrNm', header: t('MSG_TXT_MNGER_NM'), width: '120', styleName: 'text-center' }, // [매니저명]
    { fieldName: 'cntrNo', visible: false },
    { fieldName: 'cntrSn', visible: false },

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;

  // dbclick row - 상세조회 : 취소등록 메뉴  open
  view.onCellDblClicked = async (g, { dataRow }) => {
    const { cntrNo, cntrSn, rsgFshDt } = gridUtil.getRowValue(g, dataRow);

    router.replace({
      path: 'wwctb-cancel-registration-mgt',
      query: { cntrNo, cntrSn, dm: rsgFshDt.substring(0, 6) },
    });
  };
});
</script>
