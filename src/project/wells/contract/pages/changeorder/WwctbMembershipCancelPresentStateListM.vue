<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbMembershipCancelPresentStateListM - 취소현황 > 멤버쉽
3. 작성자 : younuk.choi
4. 작성일 : 2023.06.29
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 멤버쉽 취소현황
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="4"
    @search="onClickSearch"
  >
    <kw-search-row>
      <!-- row1 소속구분 -->
      <kw-search-item :label="$t('MSG_TXT_BLG')+$t('MSG_TXT_DIV')">
        <kw-select
          v-model="searchParams.ogCd"
          :options="[{ codeId: '70079', codeName: '아웃바운드운영팀'},
                     { codeId: '75049', codeName: 'Wells신채널영업부문'},
                     { codeId: '70710', codeName: '채권관리팀'}]"
          first-option="all"
        />
      </kw-search-item>
      <!-- row1 탈퇴요청기간  -->
      <kw-search-item
        :label="$t('MSG_TXT_WDWAL')+$t('MSG_TXT_AK')+$t('MSG_TXT_PRD')"
        colspan="2"
      >
        <kw-select
          v-model="searchParams.dtDiv"
          class="w180"
          :options="[{ codeId: '1', codeName: '탈퇴요청일자'},
                     { codeId: '2', codeName: '탈퇴일자'}]"
        />
        <kw-date-range-picker
          v-model:from="searchParams.cancelFromDt"
          v-model:to="searchParams.cancelToDt"
          rules="date_range_months:3"
        />
      </kw-search-item>
      <!-- row1 판매구분 -->
      <kw-search-item :label="$t('MSG_TXT_SLS_CAT')">
        <kw-select
          v-model="searchParams.sellOgTpCd"
          :options="codes.OG_TP_CD"
          first-option="all"
        />
      </kw-search-item>
    </kw-search-row>

    <kw-search-row>
      <!-- row2 상품분류 -->
      <kw-search-item
        :label="$t('MSG_TXT_PRDT_CATE')"
        colspan="2"
      >
        <!-- 상품분류 선택 -->
        <zwpd-product-classification-select
          ref="productSelRef"
          v-model:product1-level="searchParams.pdHclsfId"
          v-model:product2-level="searchParams.pdMclsfId"
          product1-first-option="all"
          :product1-first-option-label="$t('TXT_MSG_PD_HCLSF_ID') + ' ' + $t('MSG_TXT_SELT')"
          product2-first-option="all"
          :product2-first-option-label="$t('MSG_TXT_PD_MCLSF_ID') + ' ' + $t('MSG_TXT_SELT')"
          search-lvl="2"
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
      <!-- row2 판매유형 -->
      <kw-search-item :label="$t('MSG_TXT_SEL_TYPE')">
        <kw-select
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD.filter((v) => ['31','32','33','34'].includes(v.codeId))"
          first-option="all"
        />
      </kw-search-item>
    </kw-search-row>

    <kw-search-row>
      <!-- row3 등록담당 -->
      <kw-search-item :label="$t('MSG_TXT_RGST_PSIC')+$t('MSG_TXT_EPNO')">
        <kw-input
          v-model="searchParams.rgstUsrEpNo"
          maxlength="10"
          regex="num"
        />
      </kw-search-item>
      <!-- row3 계약상세번호 -->
      <kw-search-item
        :label="$t('MSG_TXT_CNTR_DTL_NO')"
      >
        <zctz-contract-detail-number
          v-model:cntr-no="searchParams.cntrNo"
          v-model:cntr-sn="searchParams.cntrSn"
          :select-only-validation="false"
        />
      </kw-search-item>
      <!-- row3 취소유형 -->
      <kw-search-item :label="$t('MSG_TXT_CNCL_TP')">
        <kw-select
          v-model="searchParams.cntrStatChRsonCd"
          :options="codes.CMN_STAT_CH_RSON_CD"
          first-option="all"
        />
      </kw-search-item>
      <!-- row3 고객구분 -->
      <kw-search-item :label="$t('MSG_TXT_CST_DV')">
        <kw-select
          v-model="searchParams.copnDvCd"
          :options="codes.COPN_DV_CD"
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
        <span class="ml6">{{ t('MSG_TXT_UNIT_WON_DAY') }}</span>
      </template>
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="!pageInfo.totalCount"
        @click="onClickExcelDownload"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMainMembership"
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
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import dayjs from 'dayjs';

const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const { modal } = useGlobal();
const dataService = useDataService();
const router = useRouter();
const grdMainMembership = ref(getComponentType('KwGrid'));
const now = dayjs();

const searchParams = ref({
  ogCd: '', // 소속구분
  dtDiv: '1', // 날짜검색구분
  cancelFromDt: now.startOf('month').format('YYYYMMDD'), // 시작일
  cancelToDt: now.format('YYYYMMDD'), // 종료일
  sellOgTpCd: '', // 판매구분
  pdHclsfId: '',
  pdMclsfId: '',
  basePdCd: '', // 상품코드
  sellTpDtlCd: '', // 판매유형
  rgstUsrEpNo: '', // 등록담당[사번]
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  cntrStatChRsonCd: '', // 취소유형
  copnDvCd: '', // 고객구분
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'OG_TP_CD',
  'COPN_DV_CD',
  'SELL_TP_DTL_CD',
  'CMN_STAT_CH_RSON_CD',
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

  const res = await dataService.get('/sms/wells/contract/changeorder/membership-cancels', { params: { ...cachedParams } });

  pageInfo.value.totalCount = res.data.length;
  const view = grdMainMembership.value.getView();
  view.getDataSource().setRows(res.data);
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
  const view = grdMainMembership.value.getView();
  const res = await dataService.get('/sms/wells/contract/changeorder/membership-cancels/excel-download', { params: { ...cachedParams } });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
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
    { fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center rg-button-link',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback: (g, { itemIndex }) => `${g.getValue(itemIndex, 'cntrNo')}-${g.getValue(itemIndex, 'cntrSn')}`,
    }, // [계약상세번호]
    { fieldName: 'ogTpNm', header: t('MSG_TXT_SLS_CAT'), width: '150', styleName: 'text-center' }, // [판매구분]
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SELLER_ID'), width: '100', styleName: 'text-center' }, // [판매자사번]
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_SELL_NM'), width: '120', styleName: 'text-center' }, // [판매자명]
    { fieldName: 'ogCd', header: t('MSG_TXT_BRCH_CD'), width: '120', styleName: 'text-center' }, // [지점코드]
    { fieldName: 'hooPrtnrNo', header: t('MSG_TXT_BRNCH_MNGR_NO'), width: '120', styleName: 'text-center' }, // [지점장사번]
    { fieldName: 'cntrCstKnm', header: t('MSG_TXT_CST_NM'), width: '120', styleName: 'text-center' }, // [고객명]
    { fieldName: 'copnDvNm', header: t('MSG_TXT_CST_DV'), width: '110', styleName: 'text-center' }, // [고객구분]
    { fieldName: 'zip', header: t('MSG_TXT_ZIP'), width: '110', styleName: 'text-center' }, // [우편번호]
    { fieldName: 'adr', header: t('MSG_TXT_ADDR'), width: '270' }, // [주소]
    { fieldName: 'dtlAdr', header: t('MSG_TXT_DETAIL_ADDR'), width: '230' }, // [상세주소]
    { fieldName: 'pdHclsfNm', header: t('TXT_MSG_PD_HCLSF_ID'), width: '140', styleName: 'text-center' }, // [대분류]
    { fieldName: 'pdMclsfNm', header: t('MSG_TXT_PD_MCLSF_ID'), width: '140', styleName: 'text-center' }, // [중분류]
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '120', styleName: 'text-center' }, // [상품코드]
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '300' }, // [상품명]
    { fieldName: 'txinvPblOjYn', header: t('MSG_TXT_PRDT_NM') + t('MSG_TXT_YN'), width: '120', styleName: 'text-center' }, // [세금계산서여부]
    { fieldName: 'dpTpNm', header: t('MSG_TXT_AUTO_FNT'), width: '120', styleName: 'text-center' }, // [자동이체]
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [설치일자]
    { fieldName: 'rsgAplcDt', header: t('MSG_TXT_CANC_RQDT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [취소요청일자]
    { fieldName: 'rsgFshDt', header: t('MSG_TXT_CANC_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [취소일자]
    { fieldName: 'pdUseDc', header: t('MSG_TXT_USE_DAY'), width: '110', styleName: 'text-center' }, // [사용일수]
    { fieldName: 'cntrStatChRsonCd', header: t('MSG_TXT_CNCL_TP'), width: '110', styleName: 'text-center' }, // [취소유형]
    { fieldName: 'cntrStatChRsonNm', header: t('MSG_TXT_CNCL_TP') + t('MSG_TXT_NM'), width: '250', styleName: 'text-center' }, // [취소유형명]
    { fieldName: 'afCntrNoSn',
      header: t('MSG_TXT_AFTER') + t('MSG_TXT_PTY_CD'),
      width: '150',
      styleName: 'text-center',
      displayCallback: (g, { itemIndex }) => (!isEmpty(g.getValue(itemIndex, 'ojDtlCntrNo')) ? `${g.getValue(itemIndex, 'ojDtlCntrNo')}-${g.getValue(itemIndex, 'ojDtlCntrSn')}` : ''),
    }, // [이후상대코드]
    { fieldName: 'slSumAmt', header: t('MSG_TXT_SL_AMT'), width: '120', styleName: 'text-right', dataType: 'number' }, // [매출금액]
    { fieldName: 'slCtrAmt', header: t('MSG_TXT_SL_CTR'), width: '120', styleName: 'text-right', dataType: 'number' }, // [매출조정]
    { fieldName: 'totPrpdAmt', header: t('MSG_TXT_PRPD_AMT'), width: '120', styleName: 'text-right', dataType: 'number' }, // [선수금액]
    { fieldName: 'borAmt', header: t('MSG_TXT_CCAM'), width: '120', styleName: 'text-right', dataType: 'number' }, // [위약금]
    { fieldName: 'lsRntf', header: t('MSG_TXT_PD_LENT_LOST_LOG'), width: '120', styleName: 'text-right', dataType: 'number' }, // [분실손료]
    { fieldName: 'totRfndAmt', header: t('MSG_TXT_RFND_TOT_AMT'), width: '120', styleName: 'text-right', dataType: 'number' }, // [환불총액]
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG') + t('MSG_TXT_DIV'), width: '150', styleName: 'text-center' }, // [소속구분]
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR'), width: '100', styleName: 'text-center' }, // [등록자]
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DTM'), width: '170', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd hh:mm:ss' }, // [등록일시]
    { fieldName: 'bizSpptPrtnrNo', header: t('MSG_TXT_MNGER_EPNO'), width: '100', styleName: 'text-center' }, // [매니저사번]
    { fieldName: 'bizSpptPrtnrNm', header: t('MSG_TXT_MNGER_NM'), width: '120', styleName: 'text-center' }, // [매니저명]
    { fieldName: 'cntrNo', visible: false },
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'ojDtlCntrNo', visible: false },
    { fieldName: 'ojDtlCntrSn', visible: false },

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;

  // cellclick
  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    // 계약상세번호 클릭 - 팝업
    if (column === 'cntrNoSn') {
      await modal({
        component: 'WwctaOrderDetailP',
        componentProps: {
          cntrNo: g.getValue(itemIndex, 'cntrNo'),
          cntrSn: g.getValue(itemIndex, 'cntrSn'),
        },
        draggable: true,
        window: true,
        windowFeatures: { width: 1300, height: 1080 },
      });
    }
  };

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
