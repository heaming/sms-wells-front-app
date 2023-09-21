<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DED
2. 프로그램 ID : WwdeaAllowanceRedfMgtM
3. 작성자 : daewon.kim
4. 작성일 : 2023.05.11 ~
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수당(실적) 되물림 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      v-permission:read
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_YEAR_OCCURNCE')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.redfAdsbOcYmFrom"
            v-model:to="searchParams.redfAdsbOcYmTo"
            :label="t('MSG_TXT_YEAR_OCCURNCE')"
            rules="date_range_required"
            type="month"
          />
        </kw-search-item>

        <kw-search-item
          :label="t('MSG_TXT_SL_YM')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.slYmFrom"
            v-model:to="searchParams.slYmTo"
            :label="t('MSG_TXT_SL_YM')"
            rules="date_range_required"
            type="month"
          />
        </kw-search-item>

        <kw-search-item :label="t('MSG_TXT_OG_TP')">
          <kw-select
            v-model="searchParams.ogTpCd"
            :options="filterOgTpCd"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_PRDT_GUBUN')">
          <kw-select
            v-model="searchParams.sellTpCd"
            first-option="all"
            first-option-value="ALL"
            :options="codes.REDF_ADSB_PD_DV_CD"
          />
        </kw-search-item>

        <kw-search-item :label="t('MSG_TXT_ENVR_YN')">
          <kw-select
            v-model="searchParams.envrYn"
            first-option="all"
            first-option-value="ALL"
            :options="envrCode"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_PROCS_TP')">
          <kw-select
            v-model="searchParams.redfAdsbTpCd"
            first-option="all"
            first-option-value="ALL"
            :options="filterRedfAdsbTpCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          v-if="!searchType.ogTpCdW04AndW05"
          :label="t('MSG_TXT_PRTNR_NUM')"
          required
        >
          <kw-input
            v-model="searchParams.prtnrNoFrom"
            rules="required"
            maxlength="10"
            regex="num"
            :label="t('MSG_TXT_PRTNR_NUM_FROM')"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.prtnrNoTo"
            rules="required"
            maxlength="10"
            regex="num"
            :label="t('MSG_TXT_PRTNR_NUM_TO')"
          />
        </kw-search-item>
        <kw-search-item
          v-if="searchType.ogTpCdW04AndW05"
          :label="t('MSG_TXT_BLG_CD')"
          required
        >
          <kw-input
            v-model="searchParams.ogCdFrom"
            rules="required"
            :label="t('MSG_TXT_BLG_CD_FROM')"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.ogCdTo"
            rules="required"
            :label="t('MSG_TXT_BLG_CD_TO')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-if="searchType.ogTpCdW01AndW02"
            v-model:page-index="pageMainInfo.pageIndex"
            v-model:page-size="pageMainInfo.pageSize"
            :total-count="pageMainInfo.totalCount"
          />
          <kw-paging-info
            v-if="searchType.ogTpCdW04AndW05"
            v-model:page-index="pageSecondInfo.pageIndex"
            v-model:page-size="pageSecondInfo.pageSize"
            :total-count="pageSecondInfo.totalCount"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          v-if="searchType.ogTpCdW01AndW02"
          v-permission:download
          icon="download_on"
          dense
          secondary
          :disable="pageMainInfo.totalCount === 0"
          :label="t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-btn
          v-if="searchType.ogTpCdW04AndW05"
          v-permission:download
          icon="download_on"
          dense
          secondary
          :disable="pageSecondInfo.totalCount === 0"
          :label="t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-if="btnType.ogTpCdW01AndW02"
          v-permission:create
          dense
          secondary
          :label="t('MSG_BTN_SLS_REDF_CRT')"
          @click="onClickPageMove('SLS')"
        />
        <kw-btn
          v-if="btnType.ogTpCdW04AndW05"
          v-permission:create
          dense
          secondary
          :label="t('MSG_BTN_SODBT_B2B_REDF_CRT')"
          @click="onClickPageMove('B2B')"
        />
        <kw-btn
          v-if="btnType.ogTpCdW03"
          v-permission:create
          dense
          secondary
          :label="t('MSG_BTN_HMST_REDF_CRT')"
          @click="onClickPageMove('HM')"
        />
        <kw-btn
          v-if="btnType.ogTpCdZ02"
          v-permission:create
          dense
          secondary
          :label="t('MSG_BTN_MUTU_REDF_CRT')"
          @click="onClickPageMove('MUTU')"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:read
          primary
          dense
          :label="t('수당/연체 되물림(팝업) 테스트')"
          @click="onClickTest"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:create
          primary
          dense
          :label="t('MSG_BTN_REDF_OJ_ALL_CRT')"
          @click="onClickRedfObjectCreate('all')"
        />
        <kw-btn
          v-permission:create
          primary
          dense
          :label="t('MSG_BTN_REDF_OJ_RE_CRT')"
          @click="onClickRedfObjectCreate('re')"
        />
      </kw-action-top>
      <!-- MSG_TXT_OG_TP WELLS-M 또는 WELLS-P 선택 시, 그리드 변경 -->
      <kw-grid
        v-show="searchType.ogTpCdW01AndW02"
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        :page-size="pageMainInfo.pageSize-1"
        :total-count="pageMainInfo.totalCount"
        @init="initGrid"
      />
      <!-- MSG_TXT_OG_TP 총판 또는 B2B 선택 시, 그리드 변경 -->
      <kw-grid
        v-show="searchType.ogTpCdW04AndW05"
        ref="grdSecondRef"
        name="grdSecond"
        :visible-rows="10"
        :page-size="pageSecondInfo.pageSize-1"
        :total-count="pageSecondInfo.totalCount"
        @init="initGrid2"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';
import { codeUtil, getComponentType, gridUtil, useDataService, router, useMeta, modal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const { t } = useI18n();
const grdMainRef = ref(getComponentType('KwGrid'));
const grdSecondRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();
const dataService = useDataService();
const { getConfig } = useMeta();
const monthFrom = dayjs().subtract(1, 'month').format('YYYYMM');
const monthTo = dayjs().subtract(0, 'month').format('YYYYMM');
const defalutMonth = dayjs().subtract(0, 'month').format('YYYYMM');
const { getUserInfo } = useMeta();
const userInfo = getUserInfo();

const codes = await codeUtil.getMultiCodes(
  'REDF_OG_TP_CD',
  'REDF_ADSB_PD_DV_CD',
  'REDF_ADSB_TP_CD',
  'HIR_FOM_CD',
);

const envrCode = ref([
  {
    codeId: 'Y',
    codeName: t('MSG_TXT_ENVR'),
  },
  {
    codeId: 'N',
    codeName: t('MSG_TXT_ENVR_EXCP'),
  },
]);

const filterHirFomCd = ref([]);
const filterRedfAdsbTpCd = ref([]);
const filterOgTpCd = ref([]);

codes.REDF_ADSB_TP_CD.forEach((e) => {
  if (e.codeId === '0202' || e.codeId === '0203') {
    filterRedfAdsbTpCd.value.push({
      codeId: e.codeId.trim(),
      codeName: e.codeName.trim(),
    });
  }
});

codes.HIR_FOM_CD.forEach((e) => {
  if (e.codeId === '2' || e.codeId === '3') {
    filterHirFomCd.value.push({
      codeId: e.codeId.trim(),
      codeName: e.codeName.trim(),
    });
  }
});

filterOgTpCd.value = codes.REDF_OG_TP_CD.filter((e) => e.codeId !== 'Z01');

const pageMainInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});
const pageSecondInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const searchType = ref({
  ogTpCdW01AndW02: true, // WELLS-M, WELLS-P
  ogTpCdW04AndW05: false, // 총판/B2B
});

const btnType = ref({
  ogTpCdW01AndW02: true, // 영업부 되물림생성
  ogTpCdW04AndW05: false, // 총판/B2B 되물림생성
  ogTpCdW03: false, // 홈마스터 되물림생성
  ogTpCdZ02: false, // 상조 되물림생성
});

let cachedParams;
let pageUrl;

const searchParams = ref({
  ogTpCd: codes.REDF_OG_TP_CD[0].codeId, // 되물림 조직유형코드 변경예정
  redfAdsbOcYmFrom: defalutMonth, // MSG_TXT_YEAR_OCCURNCE from
  redfAdsbOcYmTo: monthTo, // MSG_TXT_YEAR_OCCURNCE to
  slYmFrom: monthFrom, // MSG_TXT_SL_YM from
  slYmTo: monthTo, // MSG_TXT_SL_YM to
  sellTpCd: 'ALL', // 상품구분(상품기본.판매유형코드, where 대입은 되물림재지급상품구분코드)
  redfAdsbTpCd: 'ALL', // MSG_TXT_PROCS_TP(REDF_ADSB_TP_CD 되물림재지급유형코드(02: 되물림))
  envrYn: 'ALL', // MSG_TXT_ENVR_YN
  prtnrNoFrom: '0', // MSG_TXT_PRTNR_NUM from
  prtnrNoTo: '9999999999', // MSG_TXT_PRTNR_NUM to
  ogCdFrom: 'A000000', // MSG_TXT_BLG_CD from
  ogCdTo: 'Z999999', // MSG_TXT_BLG_CD to

});

async function fetchData() {
  /* 조직유형이 M, P, 홈마스터, 상조 */
  const res = await dataService.get('/sms/wells/deduction/redf/allowance-report/paging', { params: { ...cachedParams, ...pageMainInfo.value } });
  const { list: redfes, pageInfo: pagingResult } = res.data;
  pageMainInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(redfes);
  dataSource.checkRowStates(true);
}

async function fetchData2() {
  /* 조직유형이 총판/B2B */
  const res = await dataService.get('/sms/wells/deduction/redf/allowance-report/b2b-paging', { params: { ...cachedParams, ...pageSecondInfo.value }, timeout: 180000 });
  const { list: redfes, pageInfo: pagingResult } = res.data;

  pageSecondInfo.value = pagingResult;
  const view = grdSecondRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(redfes);
  dataSource.checkRowStates(true);
}

async function onClickSearch() {
  grdMainRef.value.getData().clearRows();
  grdSecondRef.value.getData().clearRows();

  if (searchType.value.ogTpCdW01AndW02) {
    pageMainInfo.value.pageIndex = 1;
    cachedParams = cloneDeep(searchParams.value);
    await fetchData();
  } else if (searchType.value.ogTpCdW04AndW05) {
    pageSecondInfo.value.pageIndex = 1;
    cachedParams = cloneDeep(searchParams.value);
    await fetchData2();
  }
}

async function onClickExcelDownload() {
  let view;
  let res;

  if (searchType.value.ogTpCdW01AndW02) {
    view = grdMainRef.value.getView();
    res = await dataService.get('/sms/wells/deduction/redf/allowance-report/excel-download', { params: cachedParams });
  } else if (searchType.value.ogTpCdW04AndW05) {
    view = grdSecondRef.value.getView();
    res = await dataService.get('/sms/wells/deduction/redf/allowance-report/b2b-excel-download', { params: cachedParams });
  }

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

/* TODO: 어느 화면에서 호출하는지 없어서 우선 수당(실적) 되물림 관리 화면에 붙여놓음
* 이규병 파트장님 요청 ( 테스트용 )
*/
async function onClickTest() {
  // const { result, payload } =
  await modal({
    component: 'WwdeaAllowanceDelinquentRedemptionFeeListP',
    componentProps: {
      prtnrNo: '1331699',
    //   ogTpCd: userInfo.ogTpCd,
    },
  });
  // if (result) {
  //   searchParams.value.prtnrNo = payload.prtnrNo;
  // }
}

/* 되물림 대상(실적) 생성 */
async function onClickRedfObjectCreate(param) {
  await modal({
    component: 'ZwdeaRedfObjectCreateP',
    componentProps: {
      tenantCd: userInfo.tenantCd,
      createType: param, /* param === 'all'이면 일괄생성(MSG_TXT_OG_TP 셀렉트박스 disable), 're'면 재생성(disable 안함) */
    },
  });
}

async function onClickPageMove(routerType) {
  pageUrl = '';
  // '/fee/zwded-pnpyam-reg',
  if (routerType === 'SLS') {
    pageUrl = '/fee/wwdea-partner-redf-object-agrg-list';
  } if (routerType === 'B2B') {
    pageUrl = '/fee/wwdea-sole-distributor-mgt';
  } else if (routerType === 'HM') {
    pageUrl = '/fee/wwdea-home-master-redf-create';
  } else if (routerType === 'MUTU') {
    pageUrl = '/fee/wwdea-mutual-aid-fee-mgt';
  }

  router.push({
    path: pageUrl,
  });
}

watch(() => searchParams.value.ogTpCd, (newVal) => {
  /* 그리드 초기화 */
  grdMainRef.value.getData().clearRows();
  grdSecondRef.value.getData().clearRows();
  pageMainInfo.value.totalCount = 0;
  pageSecondInfo.value.totalCount = 0;
  if (newVal === 'W01' || newVal === 'W02' || newVal === 'W03' || newVal === 'Z02') {
    /* 그리드 변경 */
    searchType.value.ogTpCdW01AndW02 = true;
    searchType.value.ogTpCdW04AndW05 = false;

    /* 버튼 세팅 */
    if (newVal === 'W03') {
      /* 들어온 조직유형이 홈마스터라면 홈마스터 버튼 세팅 */
      btnType.value.ogTpCdW03 = true;
      btnType.value.ogTpCdW01AndW02 = false;
      btnType.value.ogTpCdW04AndW05 = false;
      btnType.value.ogTpCdZ02 = false;
    } else if (newVal === 'Z02') {
      /* 들어온 조직유형이 상조라면 상조 버튼 세팅 */
      btnType.value.ogTpCdZ02 = true;
      btnType.value.ogTpCdW01AndW02 = false;
      btnType.value.ogTpCdW03 = false;
      btnType.value.ogTpCdW04AndW05 = false;
    } else {
      btnType.value.ogTpCdW01AndW02 = true;
      btnType.value.ogTpCdW03 = false;
      btnType.value.ogTpCdW04AndW05 = false;
      btnType.value.ogTpCdZ02 = false;
    }
  } else if (newVal === 'W04' || newVal === 'W05') {
    searchType.value.ogTpCdW01AndW02 = false;
    searchType.value.ogTpCdW04AndW05 = true;

    btnType.value.ogTpCdW04AndW05 = true;
    btnType.value.ogTpCdW01AndW02 = false;
    btnType.value.ogTpCdW03 = false;
    btnType.value.ogTpCdZ02 = false;
  }
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'redfAdsbOcYm' },
    { fieldName: 'slYm' },
    { fieldName: 'pdGub' },
    { fieldName: 'envrYn' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdClsfNm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrNoSn' },
    { fieldName: 'cstKnm' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'gnlrLedr' }, // TODO: 총괄단장 ~ 지구장 조직에서 정의 완벽해질 시 주석해제
    { fieldName: 'localAreaManager' },
    { fieldName: 'branchManager' },
    { fieldName: 'dstrcManager' },
    { fieldName: 'perfTpCd' },
    { fieldName: 'thmOcDlqAmt', dataType: 'number' },
    { fieldName: 'cntrDtlStatChRsonNm' },
    { fieldName: 'dlqYm' },
    { fieldName: 'rdsbYm' },
    { fieldName: 'rentalAmt', dataType: 'number' },
    { fieldName: 'mchnChTpCd' },
    { fieldName: 'feeFxamYn' },
    { fieldName: 'feeAckmtCt', dataType: 'number' },
    { fieldName: 'perfVal1', dataType: 'number' },
    { fieldName: 'perfVal2', dataType: 'number' },
    { fieldName: 'sellDscDvCd' },
    { fieldName: 'sellDscrCd' },
    { fieldName: 'sellDscTpCd' },
    { fieldName: 'pakSn' },
    { fieldName: 'feeAckmtBaseAmt', dataType: 'number' },
    { fieldName: 'ackmtPerfAmt', dataType: 'number' },
    { fieldName: 'booYn' },
    { fieldName: 'ogCd' },
    { fieldName: 'cntrPdStrtdt' },
    { fieldName: 'canDt' },
    { fieldName: 'cpsnRedfYn' },

  ];

  const columns = [
    { fieldName: 'redfAdsbOcYm', header: t('MSG_TXT_YEAR_OCCURNCE'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM' },
    { fieldName: 'slYm', header: t('MSG_TXT_SL_YM'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM' },
    { fieldName: 'pdGub', header: t('MSG_TXT_PRDT_GUBUN'), width: '100', styleName: 'text-center' },
    { fieldName: 'envrYn', header: t('MSG_TXT_ENVR_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '140', styleName: 'text-center' },
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PRDT_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '140',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      } },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CUST_STMT'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_SELLER_PERSON'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'gnlrLedr', header: t('MSG_TXT_GNLR_LEDR'), width: '100', styleName: 'text-center' },
    { fieldName: 'localAreaManager', header: t('MSG_TXT_REG_DIR'), width: '100', styleName: 'text-center' },
    { fieldName: 'branchManager', header: t('MSG_TXT_BRMGR'), width: '100', styleName: 'text-center' },
    { fieldName: 'dstrcManager', header: t('MSG_TXT_DSTRC_MN'), width: '100', styleName: 'text-center' },
    { fieldName: 'perfTpCd', header: t('MSG_TXT_PROCS_TP'), width: '100', styleName: 'text-center' },
    { fieldName: 'thmOcDlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'cntrDtlStatChRsonNm', header: t('MSG_TXT_CNCL_TP'), width: '100', styleName: 'text-left' },
    { fieldName: 'dlqYm', header: t('MSG_TXT_DLQ_REDF_YM'), width: '130', styleName: 'text-center', datetimeFormat: 'YYYY-MM' },
    { fieldName: 'rdsbYm', header: t('MSG_TXT_ADSB_YM'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM' },
    { fieldName: 'rentalAmt', header: t('MSG_TXT_RTLFE'), width: '100,', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'mchnChTpCd', header: t('MSG_TXT_CHDVC_TP'), width: '100', styleName: 'text-center' },
    { fieldName: 'feeFxamYn', header: t('MSG_TXT_FXAM_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'feeAckmtCt', header: t('MSG_TXT_PD_ACC_CNT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'perfVal1', header: t('MSG_TXT_BFSVC_ACKMT_CNT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'perfVal2', header: t('MSG_TXT_BFSVC_NW_CNT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'sellDscDvCd', header: t('MSG_TXT_PD_DC_CLASS'), width: '120', styleName: 'text-center' },
    { fieldName: 'sellDscrCd', header: t('MSG_TXT_DISC_CODE'), width: '120', styleName: 'text-center' },
    { fieldName: 'sellDscTpCd', header: t('MSG_TXT_DSC_SYST'), width: '100', styleName: 'text-center' },
    { fieldName: 'pakSn', header: t('MSG_TXT_PKG_SN'), width: '120', styleName: 'text-center' },
    { fieldName: 'feeAckmtBaseAmt', header: t('MSG_TXT_FEE_ACKMT_BASE_AMT'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'ackmtPerfAmt', header: t('MSG_TXT_FEE_ACKMT_PERF'), width: '120', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'booYn', header: t('MSG_TXT_RSV_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogCd', header: t('MSG_TXT_BRANCH'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_IST_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'canDt', header: t('MSG_TXT_CANC_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cpsnRedfYn', header: t('MSG_TXT_CPSN_REDF_YN'), width: '120', styleName: 'text-center' },

  ];

  const wellsMLayout = [
    'redfAdsbOcYm', 'slYm', 'pdGub', 'envrYn', 'pdCd', 'pdClsfNm',
    'cntrNoSn', 'cstKnm', 'prtnrKnm', 'prtnrNo',
    'gnlrLedr',
    'localAreaManager',
    'branchManager',
    'dstrcManager',
    'perfTpCd', 'thmOcDlqAmt', 'cntrDtlStatChRsonNm', 'dlqYm', 'rdsbYm',
    'rentalAmt', 'mchnChTpCd', 'feeFxamYn', 'feeAckmtCt', 'perfVal1',
    'perfVal2', 'sellDscDvCd', 'sellDscrCd', 'sellDscTpCd', 'pakSn',
    'feeAckmtBaseAmt', // WELLS-M
    'booYn', 'ogCd', 'cntrPdStrtdt', 'canDt', 'cpsnRedfYn',
  ];

  const wellsPLayout = [
    'redfAdsbOcYm', 'slYm', 'pdGub', 'envrYn', 'pdCd', 'pdClsfNm',
    'cntrNoSn', 'cstKnm', 'prtnrKnm', 'prtnrNo',
    'gnlrLedr',
    'localAreaManager',
    'branchManager',
    'dstrcManager',
    'perfTpCd', 'thmOcDlqAmt', 'cntrDtlStatChRsonNm', 'dlqYm', 'rdsbYm',
    'rentalAmt', 'mchnChTpCd', 'feeFxamYn', 'feeAckmtCt', 'perfVal1',
    'perfVal2', 'sellDscDvCd', 'sellDscrCd', 'sellDscTpCd', 'pakSn',
    'ackmtPerfAmt', // WELLS-P
    'booYn', 'ogCd', 'cntrPdStrtdt', 'canDt', 'cpsnRedfYn',
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onScrollToBottom = async (g) => {
    if (pageMainInfo.value.pageIndex * pageMainInfo.value.pageSize <= g.getItemCount()) {
      pageMainInfo.value.pageIndex += 1;
      await fetchData();
    }
  };

  watch(() => searchParams.value.ogTpCd, async (val) => {
    if (val === 'W01') {
      grdMainRef.value.getData().clearRows();
      grdSecondRef.value.getData().clearRows();
      view.setColumnLayout(wellsPLayout); // WELLS-M
    } else if (val === 'W02' || val === 'W03' || val === 'Z02') {
      grdMainRef.value.getData().clearRows();
      grdSecondRef.value.getData().clearRows();
      view.setColumnLayout(wellsMLayout); // WELLS-P
    }
  });
}

function initGrid2(data, view) {
  const fields = [
    { fieldName: 'baseYm' },
    { fieldName: 'slYm' },
    { fieldName: 'ogNm' },
    { fieldName: 'ogCd' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrNoSn' },
    { fieldName: 'cstKnm' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdClsfNm' },
    { fieldName: 'modelNo' },
    { fieldName: 'sellDscDvCd' },
    { fieldName: 'sellDscTpCd' },
    { fieldName: 'pmotUswyDvCd' },
    { fieldName: 'bfsvcPrdCd' },
    { fieldName: 'mchnCh1' },
    { fieldName: 'mchnCh2' },
    { fieldName: 'rcpDt' },
    { fieldName: 'slDt' },
    { fieldName: 'canDt' },
    { fieldName: 'redfAmt', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'baseYm', header: t('MSG_TXT_YEAR_OCCURNCE'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM' },
    { fieldName: 'slYm', header: t('MSG_TXT_SL_YM'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM' },
    { fieldName: 'ogNm', header: t('MSG_TXT_CORP_NAME'), width: '140', styleName: 'text-center' },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_SELL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_PRTNR_NUMBER'), width: '140', styleName: 'text-center' },
    { fieldName: 'cntrNoSn', header: t('MSG_TXT_CNTR_DTL_NO'), width: '140', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CUST_STMT'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PROD_CD'), width: '140', styleName: 'text-center' },
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_GOODS_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'modelNo', header: t('MSG_TXT_MDL_NM'), width: '140', styleName: 'text-left' },
    { fieldName: 'sellDscDvCd', header: t('MSG_TXT_PD_DC_CLASS'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellDscTpCd', header: t('MSG_TXT_DISC_CODE'), width: '100', styleName: 'text-center' },
    { fieldName: 'pmotUswyDvCd', header: t('MSG_TXT_EST'), width: '100', styleName: 'text-center' },
    { fieldName: 'bfsvcPrdCd', header: t('MSG_TXT_BS_CYC'), width: '100', styleName: 'text-center' },
    { fieldName: 'mchnCh1', header: t('MSG_TXT_MCHN_CH_YNG'), width: '100', styleName: 'text-center' },
    { fieldName: 'mchnCh2', header: t('MSG_TXT_MCHN_CH_CEN'), width: '100', styleName: 'text-center' },
    { fieldName: 'rcpDt', header: t('MSG_TXT_CNTR_DATE'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'canDt', header: t('MSG_TXT_CANC_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'redfAmt', header: t('MSG_TXT_REDF_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onScrollToBottom = async (g) => {
    if (pageSecondInfo.value.pageIndex * pageSecondInfo.value.pageSize <= g.getItemCount()) {
      pageSecondInfo.value.pageIndex += 1;
      await fetchData2();
    }
  };
}
</script>
