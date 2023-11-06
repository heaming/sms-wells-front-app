<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDA
2. 프로그램 ID : WwwdbIntegrationDepositNumberP  - 통합입금번호조회
3. 작성자 : heungjun.lee
4. 작성일 : 2023.03.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 통합입금번호를 조회한다.
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="popupRef"
    size="3xl"
  >
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- label="수납코드" -->
        <kw-search-item
          :label="t('MSG_TXT_RVE_CD')"
          required
        >
          <kw-input
            v-model="searchParams.rveCd"
            icon="search"
            type="text"
            :label="$t('MSG_TXT_RVE_CD')"
            clearable
            mask="#####"
            rules="required"
            @click-icon="onClickSelectRveCd"
          />
        </kw-search-item>
        <!-- label="입금일자" -->
        <kw-form-item
          required
          :label="t('MSG_TXT_DP_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.dpStartDtm"
            v-model:to="searchParams.dpEndDtm"
            :label="t('MSG_TXT_DP_DT')"
            rules="required"
          />
          <!-- rules="date_range_months:1" -->
        </kw-form-item>
        <!-- label="입금유형 " -->
        <kw-form-item
          :label="t('MSG_TXT_DP_TP')"
        >
          <kw-select
            v-model="searchParams.dpTpCd"
            :options="codes.DP_TP_CD.filter(({codeId}) => ['0101','0104','0201'].includes(codeId))"
            first-option="all"
          />
        </kw-form-item>
      </kw-search-row>
      <kw-search-row>
        <!-- label="계좌번호" -->
        <kw-search-item
          :label="t('MSG_TXT_AC_NO')"
        >
          <kw-input
            v-model="searchParams.acnoEncr"
            :maxlength="14"
          />
        </kw-search-item>
        <!-- label="판매자번호" -->
        <kw-form-item
          :label="t('MSG_TXT_SELLER_NO')"
        >
          <kw-input
            v-model="searchParams.sellPrtnrNo"
            :maxlength="30"
            icon="search"
            clearable
            @click-icon="onClickSearchPrtnrNoPopup"
          />
        </kw-form-item>
        <!-- label="카드번호" -->
        <kw-form-item
          :label="t('MSG_TXT_CARD_NO')"
        >
          <kw-input
            v-model="searchParams.crcdnoEncr"
            :maxlength="14"
          />
        </kw-form-item>
      </kw-search-row>
      <kw-search-row>
        <!-- label="승인번호" -->
        <kw-search-item
          :label="t('MSG_TXT_APR_NO')"
        >
          <kw-input
            v-model="searchParams.crdcdAprno"
            :maxlength="30"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          @change="fetchData"
        />
        <span class="ml8">({{ $t('MSG_TXT_UNIT_CUR_WON') }})</span>
      </template>
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
      <!-- label="엑셀 다운로드" -->
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :visible-rows="pageInfo.pageSize -1"
      @init="initGrid"
    />
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import dayjs from 'dayjs';
import { codeUtil, defineGrid, getComponentType, gridUtil, modal, useDataService, useModal, useMeta, alert } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const now = dayjs();
const { t } = useI18n();
const { ok } = useModal();
const { getUserInfo } = useMeta();
const userInfo = getUserInfo();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  alncmpDpAmt: {
    type: Number,
    default: null,
  },
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'DP_TP_CD', // 입금유형
  'CARD_KND_CD', // 카드구분
  'VNCO_DV_CD', // 제휴사
  'SELL_TP_CD',
);

const popupRef = ref();

const grdMainRef = ref(getComponentType('KwGrid'));

// const DP_TP_CD = codes.DP_TP_CD.filter((e) => ['0101', '0104', '0201'].includes(e.codeId));

const searchParams = ref({
  rveCd: '', // 수납코드
  rveNm: '',
  dpStartDtm: now.format('YYYYMM01'),
  dpEndDtm: now.format('YYYYMMDD'),
  dpTpCd: '',
  acnoEncr: '', // 계좌번호
  sellPrtnrNo: '', // 판매자번호
  crcdnoEncr: '', // 카드번호
  crdcdAprno: '', // 승인번호
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

// 수납코드 조회 팝업
async function onClickSelectRveCd() {
  const { result, payload } = await modal({ component: 'ZwwdyDivisionReceiveCodeRegP',
    componentProps: { rveCd: searchParams.value.rveCd, rveNm: searchParams.value.rveNm },
  });
  if (result) {
    searchParams.value.rveCd = payload.rveCd;
    searchParams.value.rveNm = payload.rveNm;
  }
}

let cachedParams;

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/integration-deposit-number/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();

  const data = view.getDataSource();
  data.checkRowStates(false);
  data.addRows(pages);
  data.checkRowStates(true);

  view.resetCurrent();
}

// 조회
async function onClickSearch() {
  grdMainRef.value.getData().clearRows();

  pageInfo.value.pageIndex = 1;

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 파트너 검색 팝업 호출
async function onClickSearchPrtnrNoPopup() {
  // console.log(searchParams.value.sellPrtnrNo);
  // console.log(userInfo.ogTpCd);

  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.sellPrtnrNo,
      ogTpCd: userInfo.ogTpCd,
    },
  });
  if (result) {
    searchParams.value.sellPrtnrNo = payload.prtnrNo;
  }
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/integration-deposit-number/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: popupRef.value.pageCtxTitle,
    timePostfix: true,
    exportData: res.data,
  });
}

// 그리드 더블클릭 이벤트
const onSelect = async (data) => {
  if (!data || data.length === 0) {
    await alert(t('MSG_ALT_NOT_SEL_ITEM')); // 선택한 행이없음
    return;
  }

  if (data.dpBlam === 0) {
    await alert(t('MSG_ALT_SELECT_ITEM_DP_BLAM')); // 입금잔액이 존재하는 데이터를 선택해주세요.
    return;
  }

  if (data.dpBlam !== props.alncmpDpAmt) {
    await alert(t('통합입금잔액과 대상금액이 일치하지 않습니다.')); // 합계 금액이 입금 잔액보다 클 수 없습니다.
    return;
  }

  ok(data.itgDpNo);
};

onMounted(async () => {
  // console.log(props.sumAmt);
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'itgDpNo' }, /* 통합입금번호 */
    { fieldName: 'rveCd' }, /* 수납코드 */
    { fieldName: 'sellTpCd' }, /* 판매유형 */
    { fieldName: 'sellPrtnrNo' }, /* 판매자번호 */
    { fieldName: 'dpTpCd' }, /* 입금유형 */
    { fieldName: 'dpDtm' }, /* 입금일자 */
    { fieldName: 'dprNm' }, /* 입금자명 */
    { fieldName: 'dpAmt', dataType: 'number' }, /* 입금금액 */
    { fieldName: 'dpBlam', dataType: 'number' }, /* 입금잔액 */
    { fieldName: 'bankCd' }, /* 은행코드 */
    { fieldName: 'bankNm' }, /* 은행명 */
    { fieldName: 'acnoEncr' }, /* 계좌번호 */
    { fieldName: 'cardKndCd' }, /* 카드구분 */
    { fieldName: 'crcdnoEncr' }, /* 카드번호 */
    { fieldName: 'cardNm' }, /* 은행명 */
    { fieldName: 'crdcdAprDtm' }, /* 승인일자 */
    { fieldName: 'crdcdAprno' }, /* 승인번호 */
    { fieldName: 'dpCprcnfNo' }, /* 대사번호 */
    { fieldName: 'dpCprcnfAmt', dataType: 'number' }, /* 대사금액 */
    { fieldName: 'dpCprcnfDtm' }, /* 입금대사일자 */
    { fieldName: 'dpGicprcnfAmt', dataType: 'number' }, /* 기대사금액 */
    { fieldName: 'pchsCdcoCd' }, /* 매입카드사 */
    { fieldName: 'crdcdIstmMcn' }, /* 할부개월 */
    { fieldName: 'vncoDvCd' }, /* 제휴사구분코드 */

  ];

  const columns = [
    { fieldName: 'itgDpNo',
      // header: '통합입금번호',
      header: t('MSG_TXT_ITG_DP_NO'),
      width: '110' },
    { fieldName: 'rveCd',
      header: t('MSG_TXT_RVE_CD'),
      // header: '수납코드',
      width: '110',
      styleName: 'text-center',
    },
    { fieldName: 'sellTpCd',
      header: t('TXT_MSG_SELL_TP_CD'),
      // header: '판매유형',
      width: '110',
      options: codes.SELL_TP_CD },
    { fieldName: 'sellPrtnrNo',
      header: t('MSG_TXT_SELLER_NO'),
      // header: '판매자번호',
      width: '110' },
    { fieldName: 'dpTpCd',
      header: t('MSG_TXT_DP_TP'),
      options: codes.DP_TP_CD,
      // header: '입금유형',
      width: '150' },
    { fieldName: 'dpDtm',
      header: t('MSG_TXT_DP_DT'),
      // header: '입금일자',
      datetimeFormat: 'date',
      width: '110',
      styleName: 'text-center' },
    { fieldName: 'dprNm',
      header: t('MSG_TXT_DPR_NM'),
      // header: '입금자명',
      width: '110',
      styleName: 'text-center' },
    { fieldName: 'dpAmt',
      numberFormat: '#,##0',
      header: t('MSG_TXT_DP_AMT'),
      // header: '입금금액',
      width: '110',
      styleName: 'text-right' },
    { fieldName: 'dpBlam',
      header: t('MSG_TXT_DP_BLAM'),
      // header: '입금잔액',
      width: '110',
      numberFormat: '#,##0',
      styleName: 'text-right' },
    { fieldName: 'bankCd',
      header: t('MSG_TXT_BNK_CD'),
      // header: '은행코드',
      width: '110',
      styleName: 'text-center' },
    { fieldName: 'bankNm',
      header: t('MSG_TXT_BNK_NM'),
      // header: '은행명',
      width: '110',
      styleName: 'text-center' },
    { fieldName: 'acnoEncr',
      header: t('MSG_TXT_AC_NO'),
      // header: '계좌번호',
      width: '142' },
    { fieldName: 'cardKndCd',
      header: t('MSG_TXT_CARD_DV'),
      // header: '카드구분',
      options: codes.CARD_KND_CD,
      width: '110' },
    { fieldName: 'crcdnoEncr',
      header: t('MSG_TXT_CARD_NO'),
      // header: '카드번호',
      width: '142' },
    { fieldName: 'cardNm',
      header: t('MSG_TXT_CARD_NM'),
      // header: '카드명',
      width: '110' },
    { fieldName: 'crdcdAprDtm',
      header: t('MSG_TXT_APR_DT'),
      // header: '승인일자',
      datetimeFormat: 'date',
      width: '110',
      styleName: 'text-center' },
    { fieldName: 'crdcdAprno',
      header: t('MSG_TXT_APR_NO'),
      // header: '승인번호',
      width: '110' },
    { fieldName: 'dpCprcnfNo',
      header: t('MSG_TXT_CPRCNF_NO'),
      // header: '대사번호',
      width: '110' },
    { fieldName: 'dpCprcnfAmt',
      header: t('MSG_TXT_CPRCNF_AMT'),
      numberFormat: '#,##0',
      // header: '대사금액',
      width: '110',
      styleName: 'text-right' },
    { fieldName: 'dpCprcnfDtm',
      header: t('MSG_TXT_DP_CPRCNF_DT'),
      // header: '입금대사일자',
      datetimeFormat: 'date',
      width: '110',
      styleName: 'text-center' },
    { fieldName: 'dpGicprcnfAmt',
      header: t('MSG_TXT_ALNCMP_DV_CD'),
      numberFormat: '#,##0',
      // header: '기대사금액',
      width: '110',
      styleName: 'text-right' },
    { fieldName: 'pchsCdcoCd',
      header: t('MSG_TXT_PCHS_CDCO'),
      // header: '매입카드사',
      width: '110' },
    { fieldName: 'crdcdIstmMcn',
      header: t('MSG_TXT_ISTM_MCNT'),
      // header: '할부개월',
      width: '110',
      styleName: 'text-right' },
    { fieldName: 'vncoDvCd',
      header: t('MSG_TXT_ALNCMP_DV_CD'),
      // header: '제휴사구분코드',
      options: codes.VNCO_DV_CD,
      width: '145' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setFixedOptions({ colCount: 5 });

  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      await fetchData();
    }
  };

  // 더블클릭
  view.onCellDblClicked = (g, clickData) => {
    if (clickData.cellType === 'data') {
      onSelect(gridUtil.getCurrentRowValue(view));
    }
  };

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
