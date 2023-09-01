<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaCorporationCustomerPsListM - wells 법인(사업자) 고객현황(일시불 및 렌탈)
3. 작성자 : JSY
4. 작성일 : 2023.02.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- wells 법인(사업자) 고객현황(일시불 및 렌탈) 화면
****************************************************************************************************
--->
<template>
  <kw-page
    @load="onLoad"
  >
    <kw-search
      :modified-targets="['grdMain']"
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!--업무유형-->
        <kw-search-item
          :label="t('MSG_TXT_TASK_TYPE')"
        >
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="codes.SELL_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <!--실적구분-->
        <kw-search-item
          :label="t('MSG_TXT_PERF_DV')"
        >
          <kw-option-group
            v-model="searchParams.perfGbn"
            type="radio"
            :options="[{codeId: '1', codeName:$t('MSG_TXT_DP_PERF')},{codeId:'2',codeName:$t('MSG_TXT_PD_ACC_RSLT')}]"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_EMPL_DV')"
        >
          <kw-option-group
            v-model="searchParams.empGbn"
            type="radio"
            :options="[{codeId: '', codeName:$t('MSG_TXT_ALL')},{codeId:'1',codeName:$t('MSG_TXT_EMP_PRCH')}]"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_CNCL_DV')"
        >
          <kw-option-group
            v-model="searchParams.canGbn"
            type="radio"
            :options="[{codeId: '', codeName:$t('MSG_TXT_ALL')},{codeId:'N',codeName:$t('MSG_TXT_EXCLD_CANC')}]"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_LOOKUP_PERIOD')"
          required
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.dateGbn"
            :options="[
              {codeId: '1', codeName:$t('MSG_TIT_RECPETN_DT')},
              {codeId:'2',codeName:$t('MSG_TXT_INST_DT')},
              {codeId:'3',codeName:$t('MSG_TXT_RENTAL_NMN')},
            ]"
            rules="required"
            @change="onChangeSearch"
          />
          <kw-date-range-picker
            v-if="searchParams.dateGbn!=3"
            v-model:from="searchParams.fromDate"
            v-model:to="searchParams.toDate"
            :name="t('MSG_TXT_LOOKUP_PERIOD')"
            rules="date_range_required|date_range_months:1"
          />
          <kw-input
            v-if="searchParams.dateGbn==3"
            v-model="searchParams.fromRental"
            :name="t('MSG_TXT_LOOKUP_PERIOD')"
            :maxlength="10"
            type="number"
            rules="required"
          />
          <kw-input
            v-if="searchParams.dateGbn==3"
            v-model="searchParams.toRental"
            :name="t('MSG_TXT_LOOKUP_PERIOD')"
            :maxlength="10"
            type="Number"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PRDT_CATE')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.pdHclsf"
            :options="hclsfs"
            first-option="all"
            option-value="pdClsfId"
            option-label="pdClsfNm"
            @update:model-value="onHclsfChanged"
          />
          <kw-select
            v-model="searchParams.pdMclsf"
            :options="mclsfs"
            option-value="pdClsfId"
            option-label="pdClsfNm"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('TXT_MSG_PD_CD')"
        >
          <kw-input
            v-model="searchParams.pdCd"
            clearable
            icon="search"
            dense
            :maxlength="10"
            @click-icon="onClickSelectPdCd()"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PRDT_NM')"
          :placeholder="t('MSG_TXT_INP')"
        >
          <kw-input
            v-model="searchParams.pdNm"
            :maxlength="100"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_CST_DV')"
        >
          <kw-option-group
            v-model="searchParams.cstrGbn"
            type="radio"
            :options="[
              {codeId: '', codeName:$t('MSG_TXT_ALL')},
              {codeId:'1',codeName:$t('MSG_TXT_INDV')},
              {codeId:'2',codeName:$t('MSG_TXT_CRP')},
            ]"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_FNT_DV')"
        >
          <kw-select
            v-model="searchParams.fntGbn"
            :options="codes.FNT_DV_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_OG_CD')"
          class="selectOrgs"
          :colspan="2"
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevlDvCd1"
            v-model:og-levl-dv-cd2="searchParams.ogLevlDvCd2"
            v-model:og-levl-dv-cd3="searchParams.ogLevlDvCd3"
            :og-tp-cd="searchParams.ogTpCd"
            :start-level="1"
            :end-level="3"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PRTNR_NO')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            :placeholder="t('MSG_TXT_INP')"
            icon="search"
            :maxlength="10"
            @click-icon="onClickSearchPrtnrNoPopup()"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('TXT_MSG_FEE_ICT_OJ_YN')"
        >
          <kw-option-group
            v-model="searchParams.incentiveGbn"
            type="radio"
            :options="[{codeId: '', codeName:$t('MSG_TXT_ALL')},{codeId:'Y',codeName:$t('MSG_TXT_ICT_OJ')}]"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_BZ_ITM')"
        >
          <kw-input
            v-model="searchParams.dlpnrItemNm"
            :maxlength="50"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_BZCL')"
        >
          <kw-input
            v-model="searchParams.dlpnrBzclNm"
            :maxlength="50"
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
            @change="fetchData"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON_MCNT') }}</span>
        </template>

        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondry
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
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
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useMeta, getComponentType, gridUtil, useDataService, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty, uniqBy } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';

const dataService = useDataService();
const { currentRoute } = useRouter();
const { notify, modal } = useGlobal();
const { getConfig } = useMeta();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'FNT_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

const hclsfs = ref([]);
const mclsfs = ref([]);

const now = dayjs();

let cachedParams;
const searchParams = ref({
  sellTpCd: '',
  perfGbn: '1',
  empGbn: '',
  canGbn: '',
  dateGbn: '1',
  fromDate: now.startOf('month').format('YYYYMMDD'),
  toDate: now.format('YYYYMMDD'),
  fromRental: '',
  toRental: '',
  pdHclsf: '',
  pdMclsf: '',
  pdCd: '',
  pdNm: '',
  cstrGbn: '2',
  fntGbn: '',
  ogLevlDvCd1: '',
  ogLevlDvCd2: '',
  ogLevlDvCd3: '',
  prtnrNo: '',
  incentiveGbn: '',
  dlpnrItemNm: '',
  dlpnrBzclNm: '',
  perfYm: now.format('YYYYMM'),
  ogTpCd: 'W02',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function onLoad() {
  const responses = await dataService.get('/sms/wells/contract/product-standards/high-levels');

  const initHclsfs = [];

  responses.data.forEach((v) => {
    if (!isEmpty(v.gnrCd)) initHclsfs.push({ codeId: v.pdClsfId, codeName: v.pdClsfNm });
  });
  hclsfs.value = uniqBy(initHclsfs, 'codeId');
}

function onChangeSearch() {
  searchParams.value.fromDate = now.startOf('month').format('YYYYMMDD');
  searchParams.value.toDate = now.format('YYYYMMDD');
  searchParams.value.fromRental = '';
  searchParams.value.toRental = '';
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/contracts/corporates/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: details, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(details);
}

async function onClickSearch() {
  if (searchParams.value.dateGbn === '3') {
    if (searchParams.value.fromRental >= searchParams.value.toRental) {
      notify(t('MSG_ALT_CHK_DT_RLT'));
      return false;
    }
    if (searchParams.value.toRental - searchParams.value.fromRental > 3) {
      notify(t('MSG_ALT_INP_RENTAL_3_MONTH'));
      return false;
    }
  }

  pageInfo.value.pageIndex = 1;

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/contract/contracts/corporates/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 상품코드 검색아이콘 클릭
async function onClickSelectPdCd() {
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.pdCd,
    selectType: '',
  };

  const returnPdInfo = await modal({
    component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
    componentProps: searchPopupParams,
  });

  if (returnPdInfo.result) {
    searchParams.value.pdCd = returnPdInfo.payload?.[0].pdCd;
    searchParams.value.pdNm = returnPdInfo.payload?.[0].pdNm;
  }
}

// 파트너 검색 팝업 호출
async function onClickSearchPrtnrNoPopup() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
    },
  });
  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}

const responseHclsDivOptions = ref([]);
const responseMclsfIdOptions = ref([]);
async function fetchDefaultData() {
  let res = [];
  res = await dataService.get('sms/wells/contract/product/high-classes');
  responseHclsDivOptions.value = res.data;
  res = await dataService.get('sms/wells/contract/product/middle-classes');
  responseMclsfIdOptions.value = res.data;

  hclsfs.value = uniqBy(responseHclsDivOptions.value);
}

async function onHclsfChanged(selectedValues) {
  // 선택한 중분류 초기화
  mclsfs.value = [];

  // 중분류 필터링
  mclsfs.value = responseMclsfIdOptions.value.filter((v) => selectedValues.includes(v.hgrPdClsfId));
}
onMounted(async () => {
  await fetchDefaultData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'sellTpNm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cstKnm' },
    { fieldName: 'copnDvCd' },
    { fieldName: 'bzrno' },
    { fieldName: 'bryy' },
    { fieldName: 'txnTpCd' },
    { fieldName: 'adrZip' },
    { fieldName: 'adr' },
    { fieldName: 'dtlAdr' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'cntrTpCd' },
    { fieldName: 'basePdCd' },
    { fieldName: 'pdAbbrNm' },
    { fieldName: 'pdMclsfNm' },
    { fieldName: 'pdNm' },
    { fieldName: 'svPrd' },
    { fieldName: 'fnlPdUswyCd' },
    { fieldName: 'bznsSpptOgCd' },
    { fieldName: 'bizSpptPrtnrNo' },
    { fieldName: 'bznsSpptPrtnrKnm' },
    { fieldName: 'ackmtPerfAmt', dataType: 'number' },
    { fieldName: 'cntrAmt', dataType: 'number' },
    { fieldName: 'fnlAmt', dataType: 'number' },
    { fieldName: 'discountAmt', dataType: 'number' },
    { fieldName: 'pdBaseAmt', dataType: 'number' },
    { fieldName: 'recapDutyPtrmN' },
    { fieldName: 'rentalTn' },
    { fieldName: 'txinvPblYn' },
    { fieldName: 'txinvPblTpCd' },
    { fieldName: 'emadr' },
    { fieldName: 'mpyMthdTpCd' },
    { fieldName: 'mpyMthdTpNm' },
    { fieldName: 'mpyBsdt' },
    { fieldName: 'slDt' },
    { fieldName: 'canDt' },
    { fieldName: 'fulpyDt' },
    { fieldName: 'cntrPdStrtdt' },
    { fieldName: 'cntrPdEnddt' },
    { fieldName: 'prmEndMm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'dgr1LevlOgCd' },
    { fieldName: 'dgr2LevlOgCd' },
    { fieldName: 'ogCd' },
    { fieldName: 'dgr3LevlDgPrtnrNo' },
    { fieldName: 'dgr3LevlDgPrtnrNm' },
    { fieldName: 'bldNm' },
    { fieldName: 'dscApyTpCd' },
    { fieldName: 'dscApyDtlCd' },
    { fieldName: 'chdvcYn' },
    { fieldName: 'rernt' },
    { fieldName: 'nw' },
    { fieldName: 'discSys' },
    { fieldName: 'dlpnrBzclNm' },
    { fieldName: 'dlpnrItemNm' },
    { fieldName: 'reqdDt' },
    { fieldName: 'chdvcCntrNo' },
    { fieldName: 'ojCntrNo' },
    { fieldName: 'ojCntrSn' },
    { fieldName: 'chdvcCntrStlmFshDtm' },
    { fieldName: 'chdvcCntrCanDtm' },
    { fieldName: 'chdvcBasePdCd' },
    { fieldName: 'chdvcPdNm' },
    { fieldName: 'chdvcSellRate' },
    { fieldName: 'chdvcSellAmt', dataType: 'number' },
    { fieldName: 'pointDt' },
    { fieldName: 'pointAmt' },
    { fieldName: 'cntrCstNo' },
    { fieldName: 'pkgPdCd' },
    { fieldName: 'pkgPdNm' },
    { fieldName: 'cntrAdrpcId' },
    { fieldName: 'cntrtRelCd' },
    { fieldName: 'ogTpCd' },
    { fieldName: 'pmotCd' },
    { fieldName: 'pmotDesc' },
    { fieldName: 'fstRgstUsrId' },
    { fieldName: 'fstRgstUsrNm' },
    { fieldName: 'fstRgstDt' },
    { fieldName: 'fstRgstTm' },
    { fieldName: 'fnlMdfcUsrId' },
    { fieldName: 'fnlMdfcDt' },
    { fieldName: 'fnlMdfcTm' },
  ];

  const columns = [
    { fieldName: 'sellTpNm', header: t('MSG_TXT_TASK_TYPE'), width: '112', styleName: 'text-center' }, // 업무유형
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '145', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTRT'), width: '112', styleName: 'text-center' }, // 계약자 - 계약자
    { fieldName: 'copnDvCd', header: t('MSG_TXT_CNTRT_GBN'), width: '112', styleName: 'text-center' }, // 계약자 - 계약자구분
    { fieldName: 'bzrno', header: t('MSG_TXT_CRNO'), width: '145', styleName: 'text-center' }, // 계약자 - 사업자등록번호
    { fieldName: 'bryy', header: t('MSG_TXT_BIRTH_DATE'), width: '112', styleName: 'text-center' }, // 계약자 - 생년월일
    { fieldName: 'txnTpCd', header: t('MSG_TXT_TXN_TP'), width: '112', styleName: 'text-center' }, // 계약자 - 과세유형
    { fieldName: 'adrZip', header: t('MSG_TXT_ZIP'), width: '112', styleName: 'text-center' }, // 계약자 - 우편번호
    { fieldName: 'adr', header: t('MSG_TXT_ADDR'), width: '281', styleName: 'text-left' }, // 계약자 - 주소
    { fieldName: 'dtlAdr', header: t('MSG_TXT_DETAIL_ADDR'), width: '281', styleName: 'text-left' }, // 계약자 - 상세주소
    { fieldName: 'sellTpCd', header: t('TXT_MSG_SELL_TP_CD'), width: '112', styleName: 'text-center' }, // 계약자 - 판매유형
    { fieldName: 'cntrTpCd', header: t('MSG_TXT_SLS_CAT'), width: '112', styleName: 'text-center' }, // 계약자 - 판매구분
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '145', styleName: 'text-left' }, // 계약자 - 상품코드
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ABBR'), width: '112', styleName: 'text-center' }, // 계약자 - 약어
    { fieldName: 'pdMclsfNm', header: t('MSG_TXT_PRDT_CATE'), width: '112', styleName: 'text-center' }, // 계약자 - 상품분류
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '281', styleName: 'text-left' }, // 계약자 - 상품명
    { fieldName: 'svPrd', header: t('MSG_TXT_MNGT_PRD'), width: '112', styleName: 'text-right' }, // 계약자 - 관리주기
    { fieldName: 'fnlPdUswyCd', header: t('MSG_TXT_USWY_DV'), width: '112', styleName: 'text-right' }, // 계약자 - 용도구분
    { fieldName: 'bznsSpptOgCd', header: t('MSG_TXT_OG_CD'), width: '121', styleName: 'text-center' }, // 웰스매니저 - 조직코드
    { fieldName: 'bizSpptPrtnrNo', header: t('MSG_TXT_EPNO'), width: '121', styleName: 'text-center' }, // 웰스매니저 - 사번
    { fieldName: 'bznsSpptPrtnrKnm', header: t('MSG_TXT_PIC'), width: '120', styleName: 'text-center' }, // 웰스매니저 - 담당자

    { fieldName: 'ackmtPerfAmt', header: t('MSG_TXT_ACKMT_PERF_AMT'), width: '125', styleName: 'text-right', numberFormat: '#,##0' }, // 인정실적금액
    { fieldName: 'cntrAmt', header: t('MSG_TXT_RENT_RGST_FEE'), width: '125', styleName: 'text-right', numberFormat: '#,##0' }, // 렌탈등록비
    { fieldName: 'fnlAmt', header: t('MSG_TXT_RNTL_TOTAL'), width: '125', styleName: 'text-right', numberFormat: '#,##0' }, // 렌탈총액
    { fieldName: 'discountAmt', header: t('MSG_TXT_RTLFE_DSC_RFLT'), width: '125', styleName: 'text-right', numberFormat: '#,##0' }, // 렌탈료(할인반영)
    { fieldName: 'pdBaseAmt', header: t('MSG_TXT_RTLFE'), width: '125', styleName: 'text-right', numberFormat: '#,##0' }, // 렌탈료
    { fieldName: 'recapDutyPtrmN', header: t('MSG_TXT_LCK_IN_PRD_MN'), width: '125', styleName: 'text-right' }, // 의무사용기간
    { fieldName: 'rentalTn', header: t('MSG_TXT_RENTAL_NMN'), width: '125', styleName: 'text-right' }, // 렌탈차월

    { fieldName: 'txinvPblYn', header: t('MSG_TXT_TXINV_YN'), width: '121', styleName: 'text-center' }, // 세금계산서 - 발행여부
    { fieldName: 'txinvPblTpCd', header: t('MSG_TXT_ISSUANCE_CLAR'), width: '121', styleName: 'text-center' }, // 세금계산서 - 발행구분
    { fieldName: 'emadr', header: t('MSG_TXT_EMAIL'), width: '227', styleName: 'text-left' }, // 세금계산서 - 이메일
    { fieldName: 'mpyMthdTpCd', header: t('MSG_TXT_FNT_DV'), width: '121', styleName: 'text-center' }, // 이체 - 이체구분
    { fieldName: 'mpyMthdTpNm', header: t('MSG_TXT_FNT_DV_NM'), width: '121', styleName: 'text-center' }, // 이체 - 이체구분명
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_FTD'), width: '120', styleName: 'text-right', datetimeFormat: 'date' }, // 이체 - 이체일
    { fieldName: 'slDt', header: t('MSG_TXT_DT_OF_SALE'), width: '125', styleName: 'text-center', datetimeFormat: 'date' }, // 매출일
    { fieldName: 'canDt', header: t('MSG_TXT_CAN_D'), width: '125', styleName: 'text-center', datetimeFormat: 'date' }, // 취소일
    { fieldName: 'fulpyDt', header: t('MSG_TXT_EXP_DT'), width: '125', styleName: 'text-center', datetimeFormat: 'date' }, // 만료일
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_MEM_SIGNUP'), width: '121', styleName: 'text-center', datetimeFormat: 'date' }, // 멤버십 - 멤버십 가입일
    { fieldName: 'cntrPdEnddt', header: t('MSG_TXT_MEM_WTDR_DT'), width: '121', styleName: 'text-center', datetimeFormat: 'date' }, // 멤버십 - 멤버십 탈퇴일
    { fieldName: 'prmEndMm', header: t('MSG_TXT_RGLR_END_DT'), width: '120', styleName: 'text-center' }, // 멤버십 - 선납종료일

    { fieldName: 'prtnrNo', header: t('MSG_TIT_PRTNR_NO'), width: '121', styleName: 'text-center' }, // 파트너 - 파트너 번호
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PTNR_NAME'), width: '121', styleName: 'text-center' }, // 파트너 - 파트너명
    { fieldName: 'dgr1LevlOgCd', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '120', styleName: 'text-center' }, // 파트너 - 총괄단
    { fieldName: 'dgr2LevlOgCd', header: t('MSG_TXT_RGNL_GRP'), width: '120', styleName: 'text-center' }, // 파트너 - 지역단
    { fieldName: 'ogCd', header: t('MSG_TXT_OG_CD'), width: '120', styleName: 'text-center' }, // 파트너 - 조직코드
    { fieldName: 'dgr3LevlDgPrtnrNo', header: t('MSG_TXT_BRMGR_NO'), width: '120', styleName: 'text-center' }, // 파트너 - 지점장 번호
    { fieldName: 'dgr3LevlDgPrtnrNm', header: t('MSG_TXT_BRMGR_FNM'), width: '120', styleName: 'text-center' }, // 파트너 - 지점장 성명
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '159', styleName: 'text-left' }, // 빌딩명
    { fieldName: 'dscApyTpCd', header: t('MSG_TXT_PD_DC_CLASS'), width: '125', styleName: 'text-center' }, // 할인구분
    { fieldName: 'dscApyDtlCd', header: t('MSG_TXT_EVENT_TP'), width: '125', styleName: 'text-center' }, // 행사유형
    { fieldName: 'chdvcYn', header: t('MSG_TXT_MCHN_CH'), width: '125', styleName: 'text-center' }, // 기기변경

    { fieldName: 'rernt', header: t('MSG_TXT_RE_RENTAL_YN'), width: '121', styleName: 'text-center' }, // 계약자 - 재렌탈여부
    { fieldName: 'nw', header: t('MSG_TXT_NEW_YN'), width: '121', styleName: 'text-center' }, // 계약자 - 신규여부
    { fieldName: 'discSys', header: t('MSG_TXT_DSC_SYST'), width: '125', styleName: 'text-center' }, // 할인제도
    { fieldName: 'dlpnrBzclNm', header: t('MSG_TXT_BZCL'), width: '159', styleName: 'text-left' }, // 업태
    { fieldName: 'dlpnrItemNm', header: t('MSG_TXT_DLPNR_ITEM'), width: '159', styleName: 'text-left ' }, // 종목
    { fieldName: 'reqdDt', header: t('MSG_TXT_REQD_D'), width: '125', styleName: 'text-center' }, // 철거일
    { fieldName: 'chdvcCntrNo', header: t('MSG_TXT_CNTR_NO'), width: '145', styleName: 'text-center' }, // 기변이전정보 - 계약번호
    { fieldName: 'chdvcCntrStlmFshDtm', header: t('MSG_TXT_DT_OF_SALE'), width: '121', styleName: 'text-center', datetimeFormat: 'date' }, // 기변이전정보 - 매출일
    { fieldName: 'chdvcCntrCanDtm', header: t('MSG_TXT_CAN_D'), width: '121', styleName: 'text-center', datetimeFormat: 'date' }, // 기변이전정보 - 취소일
    { fieldName: 'chdvcBasePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '112', styleName: 'text-center' }, // 기변이전정보 - 상품코드
    { fieldName: 'chdvcPdNm', header: t('MSG_TXT_PRDT_NM'), width: '281', styleName: 'text-left' }, // 기변이전정보 - 상품명
    { fieldName: 'chdvcSellRate', header: t('MSG_TXT_APPLY_RT'), width: '121', styleName: 'text-center' }, // 기변이전정보 - 적용률
    { fieldName: 'chdvcSellAmt', header: t('MSG_TXT_RTLFE'), width: '112', styleName: 'text-center', numberFormat: '#,##0' }, // 기변이전정보 - 렌탈료

    { fieldName: 'pointDt', header: t('MSG_TXT_POINT_APPLY_DT'), width: '125', styleName: 'text-center', datetimeFormat: 'date' }, // 포인트적용일
    { fieldName: 'pointAmt', header: t('MSG_TXT_POINT_DP'), width: '125', styleName: 'text-right' }, // 포인트입금
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '125', styleName: 'text-center' }, // 고객번호
    { fieldName: 'pkgPdCd', header: t('MSG_TXT_PKG_PD_GRD'), width: '125', styleName: 'text-center' }, // 패키지상품등급
    { fieldName: 'pkgPdNm', header: t('MSG_TXT_PKG_PD_NM'), width: '125', styleName: 'text-center' }, // 패키지상품명
    { fieldName: 'pmotCd', header: t('MSG_TXT_PMOT_CD'), width: '125', styleName: 'text-center' }, // 프로모션 코드
    { fieldName: 'pmotDesc', header: t('MSG_TXT_PMOT_CNTNTS'), width: '200', styleName: 'text-left' }, // 프로모션내용
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_IN_ICHR'), width: '125', styleName: 'text-center' }, // 입력담당
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_IN_ICHR_NM'), width: '125', styleName: 'text-center' }, // 입력담당명
    { fieldName: 'fstRgstDt', header: t('MSG_TXT_RGST_DT'), width: '125', styleName: 'text-center', datetimeFormat: 'date' }, // 등록일
    { fieldName: 'fstRgstTm', header: t('MSG_TXT_RGST_HH'), width: '125', styleName: 'text-center', datetimeFormat: 'HH:mm:ss' }, // 등록시간
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_MDFC_ICHR'), width: '125', styleName: 'text-center' }, // 수정담당
    { fieldName: 'fnlMdfcDt', header: t('MSG_TXT_MDFC_DT'), width: '125', styleName: 'text-center', datetimeFormat: 'date' }, // 수정일
    { fieldName: 'fnlMdfcTm', header: t('MSG_TXT_FERT_TM'), width: '125', styleName: 'text-center', datetimeFormat: 'HH:mm:ss' }, // 수정시간

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
  view.checkBar.visible = true;

  // multi row header setting
  view.setColumnLayout([
    'sellTpNm', 'cntrNo',
    {
      header: t('MSG_TXT_CNTRT'),
      direction: 'horizontal',
      items: ['cstKnm', 'copnDvCd', 'bzrno', 'bryy', 'txnTpCd', 'adrZip', 'adr', 'dtlAdr', 'sellTpCd', 'cntrTpCd', 'basePdCd', 'pdAbbrNm', 'pdMclsfNm', 'pdNm', 'svPrd', 'fnlPdUswyCd'],
    },
    {
      header: t('MSG_TXT_WELS_MNGER'),
      direction: 'horizontal',
      items: ['bznsSpptOgCd', 'bizSpptPrtnrNo', 'bznsSpptPrtnrKnm'],
    },
    'ackmtPerfAmt', 'cntrAmt', 'fnlAmt', 'discountAmt', 'pdBaseAmt', 'recapDutyPtrmN', 'rentalTn',
    {
      header: t('MSG_BTN_TXINV'),
      direction: 'horizontal',
      items: ['txinvPblYn', 'txinvPblTpCd', 'emadr'],
    },
    {
      header: t('MSG_TXT_FNT'),
      direction: 'horizontal',
      items: ['mpyMthdTpCd', 'mpyMthdTpNm', 'mpyBsdt'],

    },
    'slDt', 'canDt', 'fulpyDt',
    {
      header: t('MSG_TXT_MEMBERSHIP'),
      direction: 'horizontal',
      items: ['cntrPdStrtdt', 'cntrPdEnddt', 'prmEndMm'],

    },
    {
      header: t('MSG_TXT_PRTNR'),
      direction: 'horizontal',
      items: ['prtnrNo', 'prtnrKnm', 'dgr1LevlOgCd', 'dgr2LevlOgCd', 'ogCd', 'dgr3LevlDgPrtnrNo', 'dgr3LevlDgPrtnrNm'],

    },
    'bldNm', 'dscApyTpCd', 'dscApyDtlCd', 'chdvcYn',
    {
      header: t('MSG_TXT_CNTRT'),
      direction: 'horizontal',
      items: ['rernt', 'nw'],

    },
    'discSys', 'dlpnrBzclNm', 'dlpnrItemNm', 'reqdDt',
    {
      header: t('기변이전 정보'),
      direction: 'horizontal',
      items: ['chdvcCntrNo', 'chdvcCntrStlmFshDtm', 'chdvcCntrCanDtm', 'chdvcBasePdCd', 'chdvcPdNm', 'chdvcSellRate', 'chdvcSellAmt'],

    },
    'pointDt', 'pointAmt', 'cntrCstNo', 'pkgPdCd', 'pkgPdNm', 'pmotCd', 'pmotDesc', 'fstRgstUsrId', 'fstRgstUsrNm', 'fstRgstDt', 'fstRgstTm', 'fnlMdfcUsrId', 'fnlMdfcDt', 'fnlMdfcTm',

  ]);
}
</script>
<style scoped lang="scss">
.selectOrgs {
  ::v-deep(.kw-field-wrap .kw-select) {
    width: 250px !important;
    max-width: 250px !important;
    min-width: 33% !important;
  }
}
</style>
