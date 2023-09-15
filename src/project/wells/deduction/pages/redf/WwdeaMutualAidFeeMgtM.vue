<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DEA
2. 프로그램 ID : WwdeaMutualAidFeeMgtM
3. 작성자 : uhyeon.kim
4. 작성일 : 2023.04.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상조 되물림 생성 페이지
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 발생년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_YEAR_OCCURNCE')"
          required
        >
          <kw-date-picker
            v-model="searchParams.ocYm"
            :label="$t('MSG_TXT_YEAR_OCCURNCE')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <!-- 처리유형 -->
        <kw-search-item :label="$t('MSG_TXT_PROCS_TP')">
          <kw-select
            v-model="searchParams.redfAdsbTpCd"
            :label="$t('MSG_TXT_PROCS_TP')"
            :options="filterAll"
          />
        </kw-search-item>
        <!-- 구분 -->
        <!-- TODO: 코드 확인 필요 -->
        <kw-search-item
          :label="$t('MSG_TXT_DIV')"
        >
          <kw-option-group
            v-model="searchParams.dvCd"
            :label="$t('MSG_TXT_DIV')"
            type="radio"
            :options="rleDvCds"
            @change="onChangeDvCd"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!-- 파트너번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRTNR_NUMBER')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            :label="$t('MSG_TXT_PRTNR_NUMBER')"
            regex="num"
            :maxlength="10"
            icon="search"
            clearable
            @click-icon="onClickSearchPartner"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
        <!-- 엑셀 다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 되물림 금액 생성 -->
        <kw-btn
          :label="$t('MSG_BTN_REDF_AMT_CRT')"
          primary
          dense
          @click="onClickRedfAmountCreate"
        />
      </kw-action-top>
      <kw-grid
        v-show="gridVshow"
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        :page-size="pageInfo.pageSize -1"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
      />
      <kw-grid
        v-show="!gridVshow"
        ref="grdSubRef"
        name="grdSub"
        :visible-rows="10"
        :page-size="pageInfo.pageSize -1"
        :total-count="pageInfo.totalCount"
        @init="initGrid2"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { modal, useMeta, defineGrid, getComponentType, codeUtil, useDataService, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { getConfig } = useMeta();
const { getUserInfo } = useMeta();
const userInfo = getUserInfo();
const dataService = useDataService();
const { currentRoute } = useRouter(); // 엑셀 다운로드 페이지명

let cachedParamsTotal;
let cachedParams;

// 페이징
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  // 환경변수에서 기본설정값 받아오는 코드 현재 CFG_CMZ_DEFAULT_PAGE_SIZE 기본값:10
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')) - 1,
  needTotalCount: true,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSubRef = ref(getComponentType('KwGrid'));
const defaultDay = dayjs().subtract(0, 'month').format('YYYYMM');
const gridVshow = ref(true);

const rleDvCds = ref([
  {
    codeId: '01',
    codeName: t('MSG_TXT_INDV'),
  },
  {
    codeId: '02',
    codeName: t('MSG_TXT_OG'),
  },
]); // 구분 옵션

const filterAll = [];

const codes = await codeUtil.getMultiCodes(
  'RLE_DV_CD',
  'REDF_ADSB_TP_CD', // 되물림재지급유형코드
);

codes.REDF_ADSB_TP_CD.forEach((e) => {
  if (e.prtsCodeId === '02' && e.userDfn02 != null) {
    filterAll.push(e);
  }
});

const searchParams = ref({
  prtnrNo: '',
  ocYm: defaultDay,
  redfAdsbTpCd: filterAll[0].codeId,
  dvCd: '01',
});

/**
 * 검색 Data Load
*/
async function fetchData() {
  cachedParamsTotal = {
    ...cachedParams,
    ...pageInfo.value,
  };
  const res = await dataService.get('/sms/wells/deduction/redf/mutual-aid/paging', { params: cachedParamsTotal });
  let resList;
  let pagingResult;

  if (!isEmpty(res.data.mutualAidFee)) {
    resList = res.data.mutualAidFee.list;
    pagingResult = res.data.mutualAidFee.pageInfo;
  } else if (!isEmpty(res.data.mutualAidFeeSub)) {
    resList = res.data.mutualAidFeeSub.list;
    pagingResult = res.data.mutualAidFeeSub.pageInfo;
  }

  if (resList[0].dvCd === '01') {
    pageInfo.value = pagingResult;

    const view = grdMainRef.value.getView();
    const dataSource = view.getDataSource();

    // Row 변경상태감지를 풀고 데이터 교체후, 다시 변경감지 On
    dataSource.checkRowStates(false);
    dataSource.addRows(resList);
    dataSource.checkRowStates(true);
  } else {
    pageInfo.value = pagingResult;

    const view = grdSubRef.value.getView();
    const dataSource = view.getDataSource();

    // Row 변경상태감지를 풀고 데이터 교체후, 다시 변경감지 On
    dataSource.checkRowStates(false);
    dataSource.addRows(resList);
    dataSource.checkRowStates(true);
  }
}

/**
 * 검색
 */
async function onClickSearch() {
  grdMainRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  pageInfo.value.totalCount = 0;
  grdSubRef.value.getData().clearRows();

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickSearchPartner() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
      ogTpCd: userInfo.ogTpCd,
    },
  });
  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}

/**
 * 엑셀다운로드
 */
async function onClickExcelDownload() {
  let view;
  if (searchParams.value.dvCd === '01') {
    view = grdMainRef.value.getView();
  } else {
    view = grdSubRef.value.getView();
  }
  // 전체 조회 다운 (쿼리조회)
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/wells/deduction/redf/mutual-aid/excel-download', { params: cachedParams });
  let excelData;
  if (!isEmpty(res.data.mutualAidFeeForExcelDownload)) {
    excelData = res.data.mutualAidFeeForExcelDownload;
  } else {
    excelData = res.data.mutualAidFeeSubForExcelDownload;
  }
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: excelData,
  });
  // grdMainRef.value.getData().clearRows();
  // onClickSearch();
}

async function onChangeDvCd() {
  pageInfo.value.totalCount = 0;

  if (searchParams.value.dvCd === '01') {
    grdMainRef.value.getData().clearRows();
    gridVshow.value = true;
  } else if (searchParams.value.dvCd === '02') {
    grdSubRef.value.getData().clearRows();
    gridVshow.value = false;
  }
}

/* 되물림 금액 생성 */
async function onClickRedfAmountCreate() {
  await modal({
    component: 'ZwdeaRedfAmountCreateP',
    componentProps: {
      ogTpCd: 'Z02',
    },
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'perfYm' }, // 실적년월
    { fieldName: 'sellDvCd' }, // 구분
    { fieldName: 'ogCd' }, // 소속
    { fieldName: 'prtnrNo' }, // 파트너번호
    { fieldName: 'prtnrKnm' }, // 판매자명
    { fieldName: 'rsbDvCd' }, // 직급
    { fieldName: 'brmgrPrtnrNo' }, // 지점장
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cntrNoSn' }, // 계약상세번호
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'istDt' }, // 설치일
    { fieldName: 'lifCntrNo' }, // 상조 계약번호
    { fieldName: 'lifPdNm' }, // 상조상품명
    { fieldName: 'rcpdt' }, // 접수일
    { fieldName: 'cntrDt' }, // 계약일(1회출금일)
    { fieldName: 'canDt' }, // 취소일
    { fieldName: 'sellFee', dataType: 'number' }, // 판매자수수료
    { fieldName: 'totDsbOjDvCd', dataType: 'number' }, // 총지급대상
    { fieldName: 'lifCntrOcTn', dataType: 'number' }, // 회차
    { fieldName: 'slOcAcuAmt', dataType: 'number' }, // 누적발생매출
    { fieldName: 'dpAcuAmt', dataType: 'number' }, // 누적입금
    { fieldName: 'flpymTn' }, // 완납회차
    { fieldName: 'prdsb', dataType: 'number' }, // 기지급
    { fieldName: 'cnfmYn' }, // 라이프확정
    { fieldName: 'feeDsbYm' }, // 수수료지급월
    { fieldName: 'feeRedfYm' }, // 수수료되물림월
  ];

  const columns = [
    { fieldName: 'perfYm',
      header: t('MSG_TXT_PERF_YM'),
      width: '110',
      styleName: 'text-center',
      datetimeFormat: 'YYYY-MM',
    }, // 실적년월
    { fieldName: 'sellDvCd', header: t('MSG_TXT_DIV'), width: '80', styleName: 'text-center' }, // 구분
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '100', styleName: 'text-center' }, // 소속
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NUMBER'), width: '120', styleName: 'text-center' }, // 파트너번호
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_SELL_NM'), width: '80', styleName: 'text-center' }, // 판매자명
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_CRLV'), width: '80', styleName: 'text-center' }, // 직급
    { fieldName: 'brmgrPrtnrNo', header: t('MSG_TXT_BRMGR'), width: '150', styleName: 'text-center' }, // 지점장
    { fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        if (!isEmpty(cntrNo)) {
          return `${cntrNo}-${cntrSn}`;
        }
      } }, // 계약상세번호
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '150', styleName: 'text-left' }, // 상품명
    { fieldName: 'istDt', header: t('MSG_TXT_INST_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 설치일
    { fieldName: 'lifCntrNo', header: t('MSG_TXT_MUTU_CNTR_NUM'), width: '120', styleName: 'text-center' }, // 상조 계약번호
    { fieldName: 'lifPdNm', header: t('MSG_TXT_MUTU_PD_NM'), width: '80', styleName: 'text-left' }, // 상조상품명
    { fieldName: 'rcpdt', header: t('MSG_TXT_RCP_D'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 접수일
    { fieldName: 'cntrDt', header: `${t('MSG_TXT_CNTRCT_DT')}(${t('MSG_TXT_1ST_WTHDRWL_DT')})`, width: '150', styleName: 'text-center', datetimeFormat: 'date' }, // 계약일(1회출금일)
    { fieldName: 'canDt', header: t('MSG_TXT_CAN_D'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 취소일
    { fieldName: 'sellFee', header: t('MSG_TXT_SELLER_FEE'), width: '100', styleName: 'text-right' }, // 판매자수수료
    { fieldName: 'totDsbOjDvCd', header: t('MSG_TXT_TOTAL_PYMNT_TRGT'), width: '80', styleName: 'text-center' }, // 총지급대상
    { fieldName: 'lifCntrOcTn', header: t('MSG_TXT_ORDERSELECT_TITLE'), width: '80', styleName: 'text-right' }, // 회차
    { fieldName: 'slOcAcuAmt', header: t('MSG_TXT_CUMULATIVE_SALES'), width: '100', styleName: 'text-right' }, // 누적발생매출
    { fieldName: 'dpAcuAmt', header: t('MSG_TXT_ACU_DP'), width: '100', styleName: 'text-right' }, // 누적입금
    { fieldName: 'flpymTn', header: t('MSG_TXT_FULL_PYMNT_RD'), width: '80', styleName: 'text-right' }, // 완납회차
    { fieldName: 'prdsb', header: t('MSG_TXT_BASE_PYMNT'), width: '100', styleName: 'text-right' }, // 기지급
    { fieldName: 'cnfmYn', header: t('MSG_TXT_LIFE_CNFRMD'), width: '80', styleName: 'text-center' }, // 라이프확정
    { fieldName: 'feeDsbYm', header: t('MSG_TXT_FEE_PYMNT_MNTH'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM' }, // 수수료지급월
    { fieldName: 'feeRedfYm', header: t('MSG_TXT_FEE_BCK_MNTH'), width: '120', styleName: 'text-center', datetimeFormat: 'YYYY-MM' }, // 수수료되물림월

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  /**
   * Infinite Scroll
   *
   */
  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      await fetchData();
    }
  };
});

const initGrid2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'baseYm' }, // 발생월
    { fieldName: 'sellDvCd' }, // 구분
    { fieldName: 'ogCd' }, // 소속
    { fieldName: 'prtnrNo' }, // 파트너번호
    { fieldName: 'prtnrKnm' }, // 판매자명
    { fieldName: 'rsbDvCd' }, // 직급
    { fieldName: 'ackmtPerfCt', dataType: 'number' }, // 건수
    { fieldName: 'ackmtPerfAmt', dataType: 'number' }, // 금액
  ];

  const columns = [
    { fieldName: 'baseYm', header: t('MSG_TXT_MNTH_OCCURENCE'), width: '120', styleName: 'text-center', datetimeFormat: 'YYYY-MM' }, // 발생월
    { fieldName: 'sellDvCd', header: t('MSG_TXT_DIV'), width: '80', styleName: 'text-center' }, // 구분
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '80', styleName: 'text-center' }, // 소속
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NUMBER'), width: '80', styleName: 'text-center' }, // 파트너번호
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '80', styleName: 'text-center' }, // 성명
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_CRLV'), width: '80', styleName: 'text-center' }, // 직급
    { fieldName: 'ackmtPerfCt', header: t('MSG_TXT_COUNT'), width: '80', styleName: 'text-center' }, // 건수
    { fieldName: 'ackmtPerfAmt', header: t('MSG_TXT_AMT'), width: '80', styleName: 'text-center' }, // 금액
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  /**
   * Infinite Scroll
   */
  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      await fetchData();
    }
  };
});

</script>
