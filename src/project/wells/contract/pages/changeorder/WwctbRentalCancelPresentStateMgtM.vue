<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbRentalCancelPresentStateMgtM - 렌탈 취소현황
3. 작성자 : younuk.choi
4. 작성일 : 2023.06.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈 취소현황
- TODO : 더블클릭 이벤트/ 철거배정
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="4"
    @search="onClickSearch"
  >
    <kw-search-row>
      <!-- row1 소속구분 -->
      <kw-search-item
        :label="$t('MSG_TXT_BLG')+$t('MSG_TXT_DIV')"
      >
        <kw-select
          v-model="searchParams.ogCd"
          :options="[{ codeId: '70079', codeName: '아웃바운드운영팀'},
                     { codeId: '75049', codeName: 'Wells신채널영업부문'},
                     { codeId: '70710', codeName: '채권관리팀'}]"
          first-option="all"
        />
      </kw-search-item>
      <!-- row1 취소요청기간  -->
      <kw-search-item
        :label="$t('MSG_TXT_CANCEL')+$t('MSG_TXT_AK')+$t('MSG_TXT_PRD')"
        colspan="2"
      >
        <kw-select
          v-model="searchParams.dtDiv"
          class="w180"
          :options="[{ codeId: '1', codeName: '취소요청년월'},
                     { codeId: '2', codeName: '취소년월'}]"
        />
        <kw-date-range-picker
          v-model:from="searchParams.cancelFromDt"
          v-model:to="searchParams.cancelToDt"
          rules="date_range_months:3"
        />
      </kw-search-item>
      <!-- row1 판매구분 -->
      <kw-search-item
        :label="$t('MSG_TXT_SLS_CAT')"
      >
        <kw-select
          v-model="searchParams.sellOgTpCd"
          :options="codes.OG_TP_CD"
          first-option="all"
        />
      </kw-search-item>
    </kw-search-row>

    <kw-search-row>
      <!-- row2 상품코드 -->
      <kw-search-item
        :label="$t('MSG_TXT_PRDT_CODE')"
      >
        <kw-input
          v-model="searchParams.basePdCd"
          icon="search"
          @click-icon="onClickSearchPd"
        />
      </kw-search-item>
      <!-- row2 상품등급 -->
      <kw-search-item
        :label="$t('MSG_TXT_PD_GRD')"
      >
        <kw-select
          v-model="searchParams.pdGdCd"
          :options="codes.PD_GD_CD?.filter((v) => ['E', 'R']?.includes(v.codeId))"
          first-option="all"
        />
      </kw-search-item>
      <!-- row2 등록담당 -->
      <kw-search-item
        :label="$t('MSG_TXT_RGST_PSIC')+$t('MSG_TXT_EPNO')"
      >
        <kw-input
          v-model="searchParams.rgstUsrEpNo"
          maxlength="10"
          regex="num"
        />
      </kw-search-item>
      <!-- row2 집금담당 -->
      <kw-search-item
        :label="$t('MSG_TXT_CLCTAM_ICHR')"
      >
        <kw-input
          v-model="searchParams.clctamPrtnrNo"
          maxlength="10"
          regex="num"
        />
      </kw-search-item>
    </kw-search-row>

    <kw-search-row>
      <!-- row3 출력구분 -->
      <kw-search-item
        :label="$t('MSG_TXT_PRNT_DV')"
      >
        <kw-select
          v-model="searchParams.printDiv"
          :options="[{ codeId: '1', codeName: '위약'},
                     { codeId: '2', codeName: '분실'}]"
          first-option="all"
        />
      </kw-search-item>
      <!-- row3 계약구분 -->
      <kw-search-item
        :label="$t('MSG_TXT_CNTR_DV')"
      >
        <kw-select
          v-model="searchParams.copnDvCd"
          :options="codes.COPN_DV_CD"
          first-option="all"
        />
      </kw-search-item>
      <!-- row3 판매유형 -->
      <kw-search-item
        :label="$t('MSG_TXT_SEL_TYPE')"
      >
        <kw-select
          v-model="searchParams.sellTpCd"
          :options="codes.SELL_TP_CD.filter((v) => ['2'].includes(v.codeId))"
        />
      </kw-search-item>
      <!-- row3 판매세부 -->
      <kw-search-item
        :label="$t('MSG_TXT_SELL')+$t('MSG_TXT_DET')"
      >
        <kw-select
          v-model="searchParams.sellTpDtlCd"
          :options="codes.SELL_TP_DTL_CD.filter((v) => ['21','22','23','24','25','26'].includes(v.codeId))"
          first-option="all"
        />
      </kw-search-item>
    </kw-search-row>

    <kw-search-row>
      <!-- row4 상조취소 -->
      <kw-search-item
        :label="$t('MSG_TXT_MUTU')+$t('MSG_TXT_CANCEL')"
      >
        <kw-select
          v-model="searchParams.alncmpCd"
          :options="[{ codeId: '17', codeName: '상조'}]"
          first-option="all"
        />
      </kw-search-item>
      <!-- row4 계약상세번호 -->
      <kw-search-item
        :label="$t('MSG_TXT_CNTR_DTL_NO')"
      >
        <zctz-contract-detail-number
          v-model:cntr-no="searchParams.cntrNo"
          v-model:cntr-sn="searchParams.cntrSn"
          :select-only-validation="false"
        />
      </kw-search-item>
      <!-- row4 취소유형 -->
      <kw-search-item
        :label="$t('MSG_TXT_CNCL_TP')"
      >
        <kw-select
          v-model="searchParams.cntrStatChRsonCd"
          :options="codes.CMN_STAT_CH_RSON_CD"
          first-option="all"
        />
      </kw-search-item>
      <!-- row4 철거구분 -->
      <kw-search-item
        :label="$t('MSG_TXT_REQD')+$t('MSG_TXT_DIV')"
      >
        <kw-select
          v-model="searchParams.reqdDiv"
          :options="[{ codeId: 'NA', codeName: t('MSG_TXT_REQD')+' '+t('MSG_TXT_NOT_ASN')},
                     { codeId: 'CA', codeName: t('MSG_TXT_REQD')+' '+t('MSG_TXT_ASGN')+t('MSG_TXT_COMPLETE')},
                     { codeId: 'CC', codeName: t('MSG_TXT_REQD')+' '+t('MSG_TXT_COMPLETE')}]"
          first-option="all"
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
        <span class="ml6">{{ t('MSG_TXT_UNIT_COLON_WON') }}</span>
      </template>
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_TXT_DTL')+' '+$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="!totalCount"
        @click="onClickExcelDownload('D')"
      />
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_TXT_AGRG')+' '+$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="!totalCount"
        @click="onClickExcelDownload('A')"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMainRental"
      :visible-rows="totalCount>pageSize?pageSize:totalCount"
      @init="initGrid"
    />

    <kw-grid
      v-show="false"
      ref="grdMainRentalD"
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
// import { getCodeNames } from '~sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import dayjs from 'dayjs';

const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const { modal, notify } = useGlobal();
const dataService = useDataService();
const now = dayjs();
const grdMainRental = ref(getComponentType('KwGrid'));
const grdMainRentalD = ref(getComponentType('KwGrid'));

const searchParams = ref({
  ogCd: '', // 소속구분
  dtDiv: '1', // 날짜검색구분
  cancelFromDt: now.format('YYYYMMDD'), // 시작일
  cancelToDt: now.format('YYYYMMDD'), // 종료일
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  sellOgTpCd: '', // 판매구분
  basePdCd: '', // 상품코드
  pdGdCd: '', // 상품등급
  rgstUsrEpNo: '', // 등록담당[사번]
  clctamPrtnrN0: '', // 집금담당[사번]
  printDiv: '', // 출력구분
  copnDvCd: '', // 계약구분
  sellTpCd: '2', // 판매유형
  sellTpDtlCd: '', // 판매세부
  alncmpCd: '', // 상조취소
  cntrStatChRsonCd: '', // 취소유형
  reqdDiv: '', // 철거구분
});

const codes = await codeUtil.getMultiCodes(
  'OG_TP_CD',
  'PD_GD_CD',
  'COPN_DV_CD',
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
  'CMN_STAT_CH_RSON_CD',
);

const totalCount = ref(0);
const pageSize = ref(Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')));
let cachedParams;

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData() {
  if (isEmpty(cachedParams)) return;

  const res = await dataService.get('/sms/wells/contract/changeorder/rental-cancels', { params: { ...cachedParams } });

  totalCount.value = res.data.length;
  const view = grdMainRental.value.getView();
  view.getDataSource().setRows(res.data);

  view.groupPanel.visible = false;
  view.groupBy(['prtnrNo']);
  view.rowGroup.expandedAdornments = 'footer';

  const view2 = grdMainRentalD.value.getView();
  view2.getDataSource().setRows(res.data);
  view2.setFooters({ visible: false });
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

async function onClickExcelDownload(pDiv) {
  // 'D' : 상세 엑셀다운로드 : 조회된 그리드의 집계내역을 제외
  // 'A' : 집계 엑셀다운로드 : 조회된 그리드의 집계내역을 포함
  const view = (pDiv === 'D') ? grdMainRentalD.value.getView() : grdMainRental.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
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
    { fieldName: 'seq',
      header: 'SEQ',
      width: '110',
      styleName: 'text-center',
      groupFooter: { text: t('MSG_TXT_AGG'),
        styleName: 'text-center',
        valueCallback(g, c, i, group) {
          return `계(${group.count - 1})`;
        } },
      footer: {
        styleName: 'text-right',
        valueCallback() {
          return `${t('MSG_TXT_TOT_SUM')}(${totalCount.value})`;
        } },
    },
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG') + t('MSG_TXT_DIV'), width: '160', styleName: 'text-center' }, // [소속구분]
    { fieldName: 'prtnrNo',
      header: t('MSG_TXT_RGST_PSIC') + t('MSG_TXT_EPNO'),
      width: '120',
      styleName: 'text-center',
      groupFooter: { styleName: 'text-center',
        valueCallback(g, c, i, group) {
          return group.groupValue;
        } },
    }, // [등록담당자 사번]
    { fieldName: 'prtnrKnm',
      header: t('MSG_TXT_RGST_PSIC_NM'),
      width: '120',
      styleName: 'text-center',
      groupFooter: { styleName: 'text-center',
        valueCallback(g, c, i, group) {
          return gridUtil.find(g, (v) => v.prtnrNo === group.groupValue).prtnrKnm;
        } },
    }, // [등록담당자 명]
    { fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center rg-button-link',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback: (g, i) => `${g.getValue(i.itemIndex, 'cntrNo')}-${g.getValue(i.itemIndex, 'cntrSn')}`,
    }, // [계약상세번호]
    { fieldName: 'cntrCstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '150', styleName: 'text-center' }, // [계약자명]
    //------------------------------------------------------------------------------------------
    { fieldName: 'sapMatCd', header: `SAP${t('MSG_TXT_ITM_CD')}`, width: '180', styleName: 'text-center' }, // [SAP품목코드]
    { fieldName: 'mPdCd', header: t('MSG_TXT_RVPY_CD'), width: '150', styleName: 'text-center' }, // [수불코드]
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '150', styleName: 'text-center' }, // [상품코드]
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '300' }, // [상품명]
    //------------------------------------------------------------------------------------------
    { fieldName: 'istDt', header: t('MSG_TXT_INST_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [설치일]
    { fieldName: 'canDt', header: t('MSG_TXT_CAN_D'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [취소일]
    { fieldName: 'pdUseDc', header: t('MSG_TXT_USE') + t('MSG_TXT_D'), width: '100', styleName: 'text-center' }, // [사용일]
    { fieldName: 'pdGdCd', header: t('MSG_TXT_PD_GRD'), width: '100', styleName: 'text-center' }, // [상품등급]
    //------------------------------------------------------------------------------------------
    { fieldName: 'reqdAkDt', header: t('MSG_TXT_REQD_RQ_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [철거요청일]
    { fieldName: 'reqdDt', header: t('MSG_TXT_REQD_FSH_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [철거완료일]
    { fieldName: 'reqdIchrNm', header: t('MSG_TXT_REQD_PSIC_NM'), width: '150', styleName: 'text-center' }, // [철거담당자]
    { fieldName: 'reqdAsn',
      header: t('MSG_TXT_REQD') + t('MSG_TXT_ASGN'),
      width: '120',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback: () => t('MSG_TXT_REQD') + t('MSG_TXT_ASGN'),
    }, // [철거배정]
    //------------------------------------------------------------------------------------------
    { fieldName: 'rgstCostAmt',
      header: t('MSG_TXT_SL_AMT'),
      width: '100',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback(g, c) {
          return gridUtil.getSumValue(g, c.fieldName);
        } },
    }, // [매출금액]
    { fieldName: 'rgstCostRfndAmt',
      header: t('MSG_TXT_RTRN_AMT'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback(g, c) {
          return gridUtil.getSumValue(g, c.fieldName);
        } },
    }, // [반환금액]
    //------------------------------------------------------------------------------------------
    { fieldName: 'slAmt',
      header: t('MSG_TXT_SL_AMT'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback(g, c) {
          return gridUtil.getSumValue(g, c.fieldName);
        } },
    }, // [매출금액]
    { fieldName: 'slCtrAmt',
      header: t('MSG_TXT_SL_CTR'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback(g, c) {
          return gridUtil.getSumValue(g, c.fieldName);
        } },
    }, // [매출조정]
    { fieldName: 'slAggAmt',
      header: t('MSG_TXT_SL_AGG_AMT'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback(g, c) {
          return gridUtil.getSumValue(g, c.fieldName);
        } },
    }, // [매출누계]
    //------------------------------------------------------------------------------------------
    { fieldName: 'dpTotAmt',
      header: t('MSG_TXT_DP_TAM'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback(g, c) {
          return gridUtil.getSumValue(g, c.fieldName);
        } },
    }, // [입금총액]
    { fieldName: 'slDpAggAmt',
      header: t('MSG_TXT_SL_DP_AMT'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback(g, c) {
          return gridUtil.getSumValue(g, c.fieldName);
        } },
    }, // [매출입금]
    { fieldName: 'totPrpdAmt',
      header: t('MSG_TXT_PRPD_AMT'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback(g, c) {
          return gridUtil.getSumValue(g, c.fieldName);
        } },
    }, // [선수금액]
    //------------------------------------------------------------------------------------------
    { fieldName: 'ucBlamAmt',
      header: t('MSG_TXT_UC_BLAM'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback(g, c) {
          return gridUtil.getSumValue(g, c.fieldName);
        } },
    }, // [미수잔액]
    { fieldName: 'csmbCostBorAmt',
      header: t('MSG_TXT_CSMB'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback(g, c) {
          return gridUtil.getSumValue(g, c.fieldName);
        } },
    }, // [소모품]
    { fieldName: 'reqdCsBorAmt',
      header: t('MSG_TXT_REQD_CS'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback(g, c) {
          return gridUtil.getSumValue(g, c.fieldName);
        } },
    }, // [철거비]
    { fieldName: 'borAmt',
      header: t('MSG_TXT_BOR_BLAM'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback(g, c) {
          return gridUtil.getSumValue(g, c.fieldName);
        } },
    }, // [위약잔액]
    { fieldName: 'lsRntf',
      header: t('MSG_TXT_PD_LENT_LOST_LOG'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback(g, c) {
          return gridUtil.getSumValue(g, c.fieldName);
        } },
    }, // [분실손료]
    { fieldName: 'totRfndAmt',
      header: t('MSG_TXT_RFND_AMT'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
        styleName: 'text-right',
      },
      footer: {
        numberFormat: '#,##0',
        styleName: 'text-right',
        valueCallback(g, c) {
          return gridUtil.getSumValue(g, c.fieldName);
        } },
    }, // [환불금액]
    //------------------------------------------------------------------------------------------
    { fieldName: 'clctamPrtnrKnm', header: t('MSG_TXT_CLCTAM_PRTNR'), width: '120', styleName: 'text-center' }, // [집금자]
    //------------------------------------------------------------------------------------------
    { fieldName: 'cntrNo', visible: false },
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'ogCd', visible: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.setFixedOptions({ colCount: 6 });
  view.setFooters({ visible: true, items: [{ height: 40 }] });
  view.rowIndicator.visible = true;

  view.setColumnLayout([
    'seq', 'ogNm', 'prtnrNo', 'prtnrKnm', 'cntrNoSn', 'cntrCstKnm', // single
    {
      header: t('MSG_TXT_PRDT'), // colspan title
      direction: 'horizontal', // merge type
      items: ['sapMatCd', 'mPdCd', 'pdCd', 'pdNm'],
    },
    {
      header: t('MSG_TXT_CANCEL') + t('MSG_TXT_IZ'),
      direction: 'horizontal',
      items: ['istDt', 'canDt', 'pdUseDc', 'pdGdCd'],
    },
    {
      header: t('MSG_TXT_REQD') + t('MSG_TXT_IZ'),
      direction: 'horizontal',
      items: ['reqdAkDt', 'reqdDt', 'reqdIchrNm', 'reqdAsn'],
    },
    {
      header: t('MSG_TXT_REG_FEE'),
      direction: 'horizontal',
      items: ['rgstCostAmt', 'rgstCostRfndAmt'],
    },
    {
      header: t('MSG_TXT_SL_IZ'),
      direction: 'horizontal',
      items: ['slAmt', 'slCtrAmt', 'slAggAmt'],
    },
    {
      header: t('MSG_TXT_DP_IZ'),
      direction: 'horizontal',
      items: ['dpTotAmt', 'slDpAggAmt', 'totPrpdAmt'],
    },
    {
      header: t('MSG_TXT_RFND') + t('MSG_TXT_IZ'),
      direction: 'horizontal',
      items: ['ucBlamAmt', 'csmbCostBorAmt', 'reqdCsBorAmt', 'borAmt', 'lsRntf', 'totRfndAmt'],
    },
    'clctamPrtnrKnm',
  ]);

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    // 계약상세번호 클릭 - 팝업
    if (column === 'cntrNoSn') {
      await modal({
        component: 'WwctaOrderDetailP',
        componentProps: {
          cntrNo: g.getValue(itemIndex, 'cntrNo'),
          cntrSn: g.getValue(itemIndex, 'cntrSn'),
        },
      });
    } else if (column === 'reqdAsn') {
      notify('TODO : 키위에서 불러오는 서비스 기사 배정 타임 테이블 팝업을 불러 옵니다');
    }
  };

  view.onCellDblClicked = async (g, { dataRow }) => {
    notify('TODO : 렌탈 취소 등록/수정(W-SS-U-신규IDP01)을 호출');
    console.log(g, dataRow);
    /*
    const { result } = await modal({
      component: '',
      componentProps: { cntrNo: g.getValue(dataRow, 'cntrNo'), cntrSn: g.getValue(dataRow, 'cntrSn') },
    });

    if (result) await fetchData();
    */
  };
});
</script>
