<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbRegularShippingCancelPresentStateListM - 취소현황 > 정기배송
3. 작성자 : younuk.choi
4. 작성일 : 2023.06.29
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 정기배송 취소현황
- TODO : 더블클릭 이벤트
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
      <!-- row1 취소일자  -->
      <kw-search-item
        :label="$t('MSG_TXT_CANC_DT')"
        colspan="2"
      >
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
      <!-- row2 등록담당 -->
      <kw-search-item
        :label="$t('MSG_TXT_RGST_PSIC')+$t('MSG_TXT_EPNO')"
      >
        <kw-input
          v-model="searchParams.rgstUsrEpNo"
          maxlength="10"
          regex="num"
          icon="search"
          @click-icon="onClickHr"
        />
      </kw-search-item>
      <!-- row2 계약상세번호 -->
      <kw-search-item
        :label="$t('MSG_TXT_CNTR_DTL_NO')"
      >
        <zctz-contract-detail-number
          v-model:cntr-no="searchParams.cntrNo"
          v-model:cntr-sn="searchParams.cntrSn"
          :select-only-validation="false"
        />
      </kw-search-item>
      <!-- row2 취소유형 -->
      <kw-search-item
        :label="$t('MSG_TXT_CNCL_TP')"
      >
        <kw-select
          v-model="searchParams.cntrStatChRsonCd"
          :options="codes.RGLR_SPP_STAT_CH_RSON_CD"
          first-option="all"
        />
      </kw-search-item>
      <!-- row2 웰스팜취소 -->
      <kw-search-item
        :label="$t('MSG_TXT_WELSF')+$t('MSG_TXT_CANCEL')"
      >
        <kw-select
          v-model="searchParams.wellsFarmCancelDiv"
          :options="[{ codeId: 'Y', codeName: '웰스팜 취소건'},
                     { codeId: 'N', codeName: '웰스팜 미 취소건'}]"
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
        <span class="ml6">{{ t('MSG_TXT_UNIT_WON_MCN') }}</span>
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
      ref="grdMainRegular"
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
import dayjs from 'dayjs';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const { modal } = useGlobal();
const dataService = useDataService();
const router = useRouter();
const grdMainRegular = ref(getComponentType('KwGrid'));
const now = dayjs();

const searchParams = ref({
  ogCd: '', // 소속구분
  cancelFromDt: now.startOf('month').format('YYYYMMDD'), // 시작일
  cancelToDt: now.format('YYYYMMDD'), // 종료일
  sellOgTpCd: '', // 판매구분
  rgstUsrEpNo: '', // 등록담당[사번]
  clctamPrtnrN0: '', // 집금담당[사번]
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  cntrStatChRsonCd: '', // 취소유형
  wellsFarmCancelDiv: '', // 웰스팜취소
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'OG_TP_CD',
  'RGLR_SPP_STAT_CH_RSON_CD',
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

  const res = await dataService.get('/sms/wells/contract/changeorder/regular-shipping-cancels', { params: { ...cachedParams } });

  pageInfo.value.totalCount = res.data.length;
  const view = grdMainRegular.value.getView();
  view.getDataSource().setRows(res.data);
}

async function onClickExcelDownload() {
  const res = await dataService.get('/sms/wells/contract/changeorder/regular-shipping-cancels/excel-download', { params: { ...cachedParams } });
  await gridUtil.exportView(grdMainRegular.value.getView(), {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickHr() {
  const { result, payload } = await modal({
    component: 'ZwogzEmployeeListP',
    componentProps: {
      prtnrNo: searchParams.value.rgstUsrEpNo,
      ogTpCd: 'HR1',
      baseYm: now.format('YYYYMM'),
    },
  });

  if (result) {
    searchParams.value.rgstUsrEpNo = payload.prtnrNo;
  }
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
    { fieldName: 'cntrCstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '150', styleName: 'text-center' }, // [계약자명]
    { fieldName: 'bzrno', header: t('MSG_TXT_ENTRP_NO'), width: '150', styleName: 'text-center' }, // [사업자번호]
    { fieldName: 'txinvPblOjYn', header: t('MSG_TXT_BILL') + t('MSG_TXT_PBL') + t('MSG_TXT_YN2'), width: '120', styleName: 'text-center' }, // [계산서발행유무]
    { fieldName: 'sellTpDtlNm', header: t('MSG_TXT_MCHN_KND'), width: '120', styleName: 'text-center' }, // [기기종류]
    { fieldName: 'pdNm', header: t('MSG_TXT_SDING') + t('MSG_TXT_TYPE'), width: '300' }, // [모종유형]
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_DT_OF_SALE'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [매출일]
    { fieldName: 'rsgAplcDt', header: t('MSG_TXT_REQ_DATE'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [요청일]
    { fieldName: 'rsgFshDt', header: t('MSG_TXT_CAN_D'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [취소일]
    { fieldName: 'farmEnddt', header: `${t('MSG_TXT_WELSF')} ${t('MSG_TXT_CAN_D')}`, width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [웰스팜취소일]
    { fieldName: 'pdUseDc', header: t('MSG_TXT_USE_DAY'), width: '120', styleName: 'text-center' }, // [사용일수]
    { fieldName: 'rentalAmt', header: t('MSG_TXT_SPMT_AMT'), width: '120', styleName: 'text-right', dataType: 'number' }, // [추가금액]
    { fieldName: 'frisuBfsvcPtrmN', header: t('MSG_TXT_FRE_MCNT'), width: '120', styleName: 'text-center' }, // [무료개월]
    { fieldName: 'canCtrAmt', header: t('MSG_TXT_CAN_CTR'), width: '120', styleName: 'text-right', dataType: 'number' }, // [취소조정]
    { fieldName: 'totRfndAmt', header: t('MSG_TXT_RFND_TOT_AMT'), width: '120', styleName: 'text-right', dataType: 'number' }, // [환불총액]
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG') + t('MSG_TXT_DIV'), width: '160', styleName: 'text-center' }, // [소속구분]
    { fieldName: 'prtnrNo', header: t('MSG_TXT_RGST_PSIC') + t('MSG_TXT_EPNO'), width: '120', styleName: 'text-center' }, // [등록담당자 사번]
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_RGST_PSIC_NM'), width: '120', styleName: 'text-center' }, // [등록담당자 명]
    { fieldName: 'cntrStatChRsonNm', header: t('MSG_TXT_CAN_RSON'), width: '250' }, // [취소사유]
    { fieldName: 'ojDtlCntrNoSn',
      header: `${t('MSG_TXT_WELSF')} ${t('MSG_TXT_CNTR_DTL_NO')}`,
      width: '150',
      styleName: 'text-center rg-button-link',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback: (g, i) => (!isEmpty(g.getValue(i.itemIndex, 'ojDtlCntrNo')) ? `${g.getValue(i.itemIndex, 'ojDtlCntrNo')}-${g.getValue(i.itemIndex, 'ojDtlCntrSn')}` : ''),
    }, // [웰스팜 계약상세번호]
    { fieldName: 'ojDtlCntrNo', visible: false },
    { fieldName: 'ojDtlCntrSn', visible: false },
    { fieldName: 'cntrStatChRsonCd', visible: false },
    { fieldName: 'cntrNo', visible: false },
    { fieldName: 'cntrSn', visible: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;

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
