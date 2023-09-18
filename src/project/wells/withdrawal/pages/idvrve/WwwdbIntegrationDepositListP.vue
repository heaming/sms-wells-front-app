<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID : WwwdbIntegrationDepositListP - 통합입금목록
3. 작성자 : heungjun.lee
4. 작성일 : 2023.02.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 통합입금목록 조회한다.
****************************************************************************************************
--->
<template>
  <kw-popup
    size="3xl"
  >
    <!-- 통합입금목록 -->
    <kw-search
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_RVE_CD')"
          required
        >
          <!-- label="수납코드" -->
          <kw-input
            v-model="searchParams.rveCd"
            rules="required"
            icon="search"
            type="text"
            :label="$t('MSG_TXT_RVE_CD')"
            clearable
            mask="#####"
            @keydown="onKeyDownSelectRveCd"
            @click-icon="onClickSelectRveCd"
            @clear="onClearSelectRveCd"
          />
          <kw-input
            v-model="searchParams.rveNm"
            :disable="true"
          />
          <!-- rules="required" -->
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_DP_DT')"
        >
          <!-- label="입금일자" -->
          <kw-date-range-picker
            v-model:from="searchParams.dpStartDtm"
            v-model:to="searchParams.dpEndDtm"
            :dense="true"
          />
          <!-- rules="date_range_months:1" -->
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_DP_TP')"
        >
          <!-- label="입금유형" -->
          <kw-select
            v-model="searchParams.dpTpCd"
            :options="DP_TP_CD"
            :label="t('MSG_TXT_DP_TP')"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_AC_NO')"
        >
          <!-- label="계좌번호" -->
          <kw-input v-model="searchParams.acnoEncr" />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_SELLER_NO')"
        >
          <!-- label="판매자번호" -->
          <kw-input
            v-model="searchParams.prtnrNo"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_CARD_NO')"
        >
          <!-- label="카드번호" -->
          <kw-input v-model="searchParams.crcdnoEncr" />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_APR_NO')"
        >
          <!-- label="승인번호" -->
          <kw-input v-model="searchParams.cardAprno" />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <ul class="kw-notification">
      <li>
        <span class="kw-fc--primary">
          {{ t('MSG_TXT_DBL_CLK_DTA_CHO') }}
        </span>
        <!-- 더블클릭하면 데이터가 선택되며 팝업창이 닫힙니다. -->
      </li>
    </ul>

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
        :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
        @click="onClickExcelDownload"
      />
      <!-- label="엑셀다운로드" -->
    </kw-action-top>

    <kw-grid

      ref="grdMainRef"
      name="grdMain"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrid"
    />

    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import dayjs from 'dayjs';
import { codeUtil, defineGrid, getComponentType, gridUtil, modal, useDataService, useModal, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const now = dayjs();
const { ok } = useModal();
const { notify } = useGlobal();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  itgDpNo: {
    type: String,
    default: null,
  },
  rveCd: {
    type: String,
    default: null,
  },
  rveNm: {
    type: String,
    default: null,
  },
});

const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'DP_TP_CD',
  'CARD_KND_CD',
);

const DP_TP_CD = codes.DP_TP_CD.filter((e) => ['0101', '0104', '0201'].includes(e.codeId));

let cachedParams;

const searchParams = ref({
  rveCd: '', // 수납코드
  rveNm: '', // 수납코드명
  dpStartDtm: now.format('YYYYMM01'), // 입금일시
  dpEndDtm: now.format('YYYYMMDD'), // 입금일시
  dpTpCd: '0101', // 입금유형
  prtnrNo: '', // 파트너번호
  cardAprno: '', // 승인번호
  acnoEncr: '', /* 계좌번호암호화 */
  crcdnoEncr: '', /* 신용카드번호암호화 - 카드번호 */
  itgDpNo: '', // 통합입금번호
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/integration-deposit/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();

  const data = view.getDataSource();
  data.checkRowStates(false);
  data.setRows(pages);
  data.checkRowStates(true);

  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onKeyDownSelectRveCd() {
  searchParams.value.rveNm = '';
}

async function onClearSelectRveCd() {
  searchParams.value.rveCd = '';
  searchParams.value.rveNm = '';
}

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

// 그리드 더블클릭 이벤트
const onSelect = async (data) => {
  if (!data || data.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  if (data.dpBlam < 1) {
    notify(t('MSG_ALT_SELECT_ITEM_DP_BLAM'));
    return;
  }

  ok(data);
};

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/integration-deposit/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: `${t('MSG_TIT_ITG_DP_LIST')}`,
    timePostfix: true,
    exportData: res.data,
  });
}

async function initProps() {
  const { rveCd, rveNm } = props;

  // if (itgDpNo) {
  // searchParams.value.itgDpNo = itgDpNo;
  searchParams.value.rveCd = rveCd;
  searchParams.value.rveNm = rveNm;

  // console.log(itgDpNo);
  // console.log(rveCd);
  // console.log(rveNm);
  // await onClickSearch();
  // }
}

onMounted(async () => {
  await initProps();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [

    { fieldName: 'itgDpNo' }, /* 통합입금번호 */
    { fieldName: 'rveCd' }, /* 수납코드 */
    { fieldName: 'rveNm' }, /* 수납명 */
    { fieldName: 'prtnrClsfCd' }, /* 판매자구분 */
    { fieldName: 'prtnrNo' }, /* 파트너번호 */
    { fieldName: 'dpTpCd' }, /* 입금유형코드 */
    { fieldName: 'dpDtm' }, /* 입금일시 */
    { fieldName: 'dprNm' }, /* 입금자명 */
    { fieldName: 'dpAmt', dataType: 'number' }, /* 입금금액 */
    { fieldName: 'dpBlam', dataType: 'number' }, /* 입금잔액 */
    { fieldName: 'pextBnkCd' }, /* 은행코드 */
    { fieldName: 'bankNm' }, /* 은행명 */
    { fieldName: 'acnoEncr' }, /* 계좌번호암호화 */
    { fieldName: 'cardKndCd' }, /* 카드구분 */
    { fieldName: 'crcdnoEncr' }, /* 신용카드번호암호화 - 카드번호 */
    { fieldName: 'cardNm' }, /* 카드명 */
    { fieldName: 'aprDtm' }, /* 승인일시 */
    { fieldName: 'cardAprno' }, /* 카드승인번호 */
    { fieldName: 'dpCprcnfNo' }, /* 대사번호 */
    { fieldName: 'dpCprcnfProcsAmt' }, /* 대사금액 */
    { fieldName: 'dpCprcnfDtm' }, /* 입금대사일자 */
    { fieldName: 'dpCprcnfAmt', dataType: 'number' }, /* 기대사금액(입금대사금액) */
    { fieldName: 'pchsCdcoCd' }, /* 매입카드사코드 */
    { fieldName: 'istmMcn' }, /* 할부개월 */
    { fieldName: 'alncmpDvCd' }, /* 제휴가구분코드 */

  ];

  const columns = [
    { fieldName: 'itgDpNo',
      header: t('MSG_TXT_ITG_DP_NO'),
      // header: '통합입금번호'
      width: '100',
      styleName: 'text-center' },
    { fieldName: 'rveCd',
      header: t('MSG_TXT_RVE_CD'),
      // , header: '수납코드'
      width: '80',
      styleName: 'text-center' },
    { fieldName: 'prtnrClsfCd',
      header: t('MSG_TXT_SELLER_DV'),
      // , header: '판매자구분'
      width: '100',
      styleName: 'text-center' },
    { fieldName: 'prtnrNo',
      header: t('MSG_TXT_SELLER_NO'),
      // , header: '판매자번호'
      width: '100',
      styleName: 'text-left' },
    { fieldName: 'dpTpCd',
      options: DP_TP_CD,
      header: t('MSG_TXT_DP_TP_CD'),
      // header: '입금유형코드',
      width: '120',
      styleName: 'text-center' },
    { fieldName: 'dpDtm',
      header: t('MSG_TXT_DP_DT'),
      // header: '입금일자',
      width: '112',
      styleName: 'text-center',
      datetimeFormat: 'date' },
    { fieldName: 'dprNm',
      header: t('MSG_TXT_DPR_NM'),
      // header: '입금자명',
      width: '114',
      styleName: 'text-left' },
    { fieldName: 'dpAmt',
      header: t('MSG_TXT_DP_AMT_WON'),
      // header: '입금금액(원)',
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'dpBlam',
      header: t('MSG_TXT_DP_BLAM_WON'),
      // header: '입금잔액(원)',
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'pextBnkCd',
      header: t('MSG_TXT_BNK_CD'),
      // , header: '은행코드'
      width: '100',
      styleName: 'text-center' },
    { fieldName: 'bankNm',
      header: t('MSG_TXT_BNK_NM'),
      // , header: '은행명'
      width: '92',
      styleName: 'text-left' },
    { fieldName: 'acnoEncr',
      header: t('MSG_TXT_AC_NO'),
      // , header: '계좌번호'
      width: '154',
      styleName: 'text-left' },
    { fieldName: 'cardKndCd',
      header: t('MSG_TXT_CARD_DV'),
      // , header: '카드구분'
      width: '100',
      options: codes.CARD_KND_CD,
      styleName: 'text-center' },
    { fieldName: 'crcdnoEncr',
      header: t('MSG_TXT_CARD_NO'),
      // , header: '카드번호'
      width: '200',
      styleName: 'text-left' },
    { fieldName: 'cardNm',
      header: t('MSG_TXT_CARD_NM'),
      // , header: '카드명'
      width: '120',
      styleName: 'text-left' },
    { fieldName: 'aprDtm',
      header: t('MSG_TXT_APR_DT'),
      // , header: '승인일자'
      width: '112',
      styleName: 'text-center' },
    { fieldName: 'cardAprno',
      header: t('MSG_TXT_APR_NO'),
      // , header: '승인번호'
      width: '114',
      styleName: 'text-left' },
    { fieldName: 'dpCprcnfNo',
      header: t('MSG_TXT_CPRCNF_NO'),
      // , header: '대사번호'
      width: '100',
      styleName: 'text-left' },
    { fieldName: 'dpCprcnfProcsAmt',
      header: t('MSG_TXT_CPRCNF_AMT_WON'),
      // , header: '대사금액(원)'
      width: '100',
      styleName: 'text-right' },
    { fieldName: 'dpCprcnfDtm',
      header: t('MSG_TXT_DP_CPRCNF_DT'),
      // , header: '입금대사일자'
      width: '100',
      styleName: 'text-center' },
    { fieldName: 'dpCprcnfAmt', header: '기대사금액', width: '92', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'pchsCdcoCd',
      header: t('MSG_TXT_PCHS_CDCO'),
      // , header: '매입카드사'
      width: '100',
      styleName: 'text-left' },
    { fieldName: 'istmMcn',
      header: t('MSG_TXT_ISTM_MCNT'),
      // , header: '할부개월'
      width: '100',
      styleName: 'text-right' },
    { fieldName: 'alncmpDvCd',
      header: t('MSG_TXT_ALNCMP_DV_CD'),
      // , header: '제휴사구분코드'
      width: '171',
      styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellDblClicked = (g, clickData) => {
    if (clickData.cellType === 'data') {
      onSelect(gridUtil.getCurrentRowValue(view));
    }
  };
});

</script>
