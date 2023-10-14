<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEF
2. 프로그램 ID : WwfefSellFeeEtPerfListM - 수수료 예상실적 조회 (판매)
3. 작성자 : 이선호
4. 작성일 : 2023.10.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수수료 예상실적(판매)을 조회한다.
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          label="실적기간"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.inqrStrtDt"
            v-model:to="searchParams.inqrEndDt"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          label="실적기준"
        >
          <kw-option-group
            v-model="searchParams.perfBaseDv"
            type="radio"
            :options="perfBaseDv"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          label="조회구분"
        >
          <kw-option-group
            v-model="searchParams.inqrDv"
            type="radio"
            :options="inqrDv"
            rules="required"
          />
        </kw-search-item>
        <!--  Variation # 2 : 조회구분 - 순증상세 -- > 순증구분 항목 노출 -->
        <kw-search-item
          v-if="searchParams.inqrDv === '4'"
          label="순증구분"
        >
          <kw-option-group
            v-model="searchParams.nincDv"
            type="radio"
            :options="nincDv"
            rules="required"
          />
        </kw-search-item>
        <!-- //  Variation # 2 : 조회구분 - 순증상세 -- > 순증구분 항목 노출 -->
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          label="직책구분"
        >
          <kw-select
            v-model="searchParams.pstnDvCd"
            :options="ojPstnRankCd"
          />
        </kw-search-item>
        <kw-search-item
          label="조직레벨"
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.dgr1LevlOgCd"
            v-model:og-levl-dv-cd2="searchParams.dgr2LevlOgCd"
            v-model:og-levl-dv-cd3="searchParams.dgr3LevlOgCd"
            og-tp-cd="W02"
            :base-ym="baseYm"
            :start-level="1"
            :end-level="3"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item label="번호">
          <kw-input
            v-model="searchParams.prtnrNo"
            icon="search"
            @click-icon="onClickIcon"
          />
          <kw-input
            v-model="searchParams.prtnrNm"
            :disable="true"
            placeholder="성명"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
          <span class="ml8">(단위 : 원, 건, %)</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          label="엑셀다운로드"
        />
      </kw-action-top>
      <kw-grid
        v-if="searchParams.inqrDv === '1'"
        ref="grdMain1Ref"
        @init="initGrid1"
      />
      <kw-grid
        v-if="searchParams.inqrDv === '2'"
        ref="grdMain2Ref"
        @init="initGrid2"
      />
      <kw-grid
        v-if="searchParams.inqrDv === '3'"
        ref="grdMain3Ref"
        @init="initGrid3"
      />
      <kw-grid
        v-if="searchParams.inqrDv === '4'"
        ref="grdMain4Ref"
        @init="initGrid4"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
// import dayjs from 'dayjs';
import { codeUtil, getComponentType, modal, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import ZwogLevelSelect from '~/modules/sms-common/organization/components/ZwogLevelSelect.vue';

const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'MNGER_OG_ACC_NINC_MNGT_INQR_DV_CD',
  'WELS_MNGER_INQR_DV_CD',
  'PMOT_MCHN_CH_TP_CD',
  'CMN_STAT_CH_RSON_CD',
);

const ojPstnRankCd = ref(codes.WELS_MNGER_INQR_DV_CD);
const perfBaseDv = [
  { codeId: '1', codeName: '접수' },
  { codeId: '2', codeName: '매출' },
];
const inqrDv = [
  { codeId: '1', codeName: '건수&실적' },
  { codeId: '2', codeName: '계정순증' },
  { codeId: '3', codeName: '판매상세' },
  { codeId: '4', codeName: '순증상세' },
];
const nincDv = codes.MNGER_OG_ACC_NINC_MNGT_INQR_DV_CD.filter((v) => ['01', '02'].includes(v.codeId));
const mchnChTpCd = codes.PMOT_MCHN_CH_TP_CD.filter((v) => v.codeId !== '0');

const searchParams = ref({
  // inqrStrtDt: dayjs().startOf('month').format('YYYYMMDD'),
  // inqrEndDt: dayjs().format('YYYYMMDD'),
  inqrStrtDt: '20230801',
  inqrEndDt: '20230801',
  perfBaseDv: '1',
  inqrDv: '1',
  nincDv: '01',
  pstnDvCd: '01',
  dgr1LevlOgCd: undefined,
  dgr2LevlOgCd: undefined,
  dgr3LevlOgCd: undefined,
  prtnrNo: '',
  prtnrNm: '',
});

watch(
  () => searchParams.value.inqrDv,
  (newInqrDv) => {
    if (newInqrDv === '3' || newInqrDv === '4') {
      ojPstnRankCd.value = codes.WELS_MNGER_INQR_DV_CD.filter((v) => ['04'].includes(v.codeId));
      searchParams.value.pstnDvCd = '04';
    } else {
      ojPstnRankCd.value = codes.WELS_MNGER_INQR_DV_CD;
      searchParams.value.pstnDvCd = '01';
    }
  },
);

const baseYm = computed(() => searchParams.value.inqrStrtDt.substring(0, 6));

const totalCount = ref(0);
const grdMain1Ref = ref(getComponentType('KwGrid'));
const grdMain2Ref = ref(getComponentType('KwGrid'));
const grdMain3Ref = ref(getComponentType('KwGrid'));
const grdMain4Ref = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;

async function fetchData() {
  const res = await dataService.get('/sms/wells/fee/sell-fee-et-perf', { params: cachedParams, timeout: 300000 });

  let view;
  const dataList = res.data.map((row) => ({
    ...row,
    nincCt: row.rentalNincCt + row.elhmSpayNincCt,
    canCt: row.rentalCanCt + row.elhmSpayCanCt + row.rentalExnCt + row.mshWdwalCnt,
  }));

  if (cachedParams.inqrDv === '1') {
    view = grdMain1Ref.value.getView();
  } else if (cachedParams.inqrDv === '2') {
    view = grdMain2Ref.value.getView();
  } else if (cachedParams.inqrDv === '3') {
    view = grdMain3Ref.value.getView();
  } else if (cachedParams.inqrDv === '4') {
    view = grdMain4Ref.value.getView();
  }

  view.getDataSource().setRows(dataList);
  totalCount.value = dataList.length;
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickIcon() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
    },
  });

  if (result) {
    const { prtnrNo, prtnrKnm } = payload;
    searchParams.value.prtnrNo = prtnrNo;
    searchParams.value.prtnrNm = prtnrKnm;
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

// 건수&실적 그리드
function initGrid1(data, view) {
  const columns = [
    { fieldName: 'ogCd', header: '소속', width: '90', styleName: 'text-center' },
    { fieldName: 'prtnrNm', header: '성명', width: '80', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: '번호', width: '100', styleName: 'text-center' },
    { fieldName: 'pstnDvCd', header: '직급', width: '70', styleName: 'text-center' },
    { fieldName: 'brchCt', header: '지점수', width: '90', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'elhmRentalCt', header: '렌탈', width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'elhmSpayCt', header: '일시불', width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'elhmRentalAmt', header: '렌탈', width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'elhmSpayAmt', header: '할부', width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'notElhmSpayAmt', header: '가전외인정실적', width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'vstAsnCt', header: '배정계정', width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'vstFshCt', header: '완료계정', width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'vstProcsRt', header: '처리율', width: '90', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.0;;;c' },
    { fieldName: 'nincCt', header: '신규판매', width: '90', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'accNincSum', header: '계정순증', width: '90', styleName: 'text-right', dataType: 'number' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'ogCd', 'prtnrNm', 'prtnrNo', 'pstnDvCd', 'brchCt',
    {
      header: '가전건수',
      direction: 'horizontal',
      items: ['elhmRentalCt', 'elhmSpayCt'],
    },
    {
      header: '가전기준가',
      direction: 'horizontal',
      items: ['elhmRentalAmt', 'elhmSpayAmt'],
    },
    'notElhmSpayAmt', 'vstAsnCt', 'vstFshCt', 'vstProcsRt', 'nincCt', 'accNincSum',
  ]);
}

// 계정순증 그리드
function initGrid2(data, view) {
  const columns = [
    { fieldName: 'ogCd', header: '소속', width: '90', styleName: 'text-center' },
    { fieldName: 'prtnrNm', header: '성명', width: '80', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: '번호', width: '100', styleName: 'text-center' },
    { fieldName: 'pstnDvCd', header: '직급', width: '70', styleName: 'text-center' },
    { fieldName: 'brchCt', header: '지점수', width: '90', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'rentalNincCt', header: '렌탈', width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'elhmSpayNincCt', header: '일시불', width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'nincCt', header: '계', width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'rentalCanCt', header: '순수해지(렌탈)', width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'elhmSpayCanCt', header: '순수해지(일시불)', width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'rentalExnCt', header: '만료', width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'mshWdwalCnt', header: '멤버십탈퇴', width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'canCt', header: '계', width: '90', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'accNincSum', header: '계정순증', width: '90', styleName: 'text-right', dataType: 'number' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'ogCd', 'prtnrNm', 'prtnrNo', 'pstnDvCd', 'brchCt',
    {
      header: '신규',
      direction: 'horizontal',
      items: ['rentalNincCt', 'elhmSpayNincCt', 'nincCt'],
    },
    {
      header: '취소',
      direction: 'horizontal',
      items: ['rentalCanCt', 'elhmSpayCanCt', 'rentalExnCt', 'mshWdwalCnt', 'canCt'],
    },
    'accNincSum',
  ]);
}

// 판매상세 그리드
function initGrid3(data, view) {
  const columns = [
    { fieldName: 'ogCd', header: '소속', width: '90', styleName: 'text-center' },
    { fieldName: 'prtnrNm', header: '성명', width: '80', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: '번호', width: '100', styleName: 'text-center' },
    { fieldName: 'pstnDvCd', header: '직급', width: '70', styleName: 'text-center' },
    { fieldName: 'cntrCstNo', header: '고객코드', width: '140', styleName: 'text-center' },
    { fieldName: 'cntrCstNm', header: '고객명', width: '100', styleName: 'text-center' },
    { fieldName: 'cntrCnfmDt', header: '접수일자', width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM-DD' },
    { fieldName: 'cntrPdStrtdt', header: '매출일자', width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM-DD' },
    { fieldName: 'cntrCanDt', header: '취소일자', width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM-DD' },
    { fieldName: 'pdClsfNm', header: '상품구분', width: '110', styleName: 'text-center' },
    { fieldName: 'pdCd', header: '상품코드', width: '120', styleName: 'text-center' },
    { fieldName: 'pdNm', header: '상품명', width: '200', styleName: 'text-left' },
    { fieldName: 'mchnChTpCd', header: '기변유형', width: '90', styleName: 'text-center', options: mchnChTpCd },
    { fieldName: 'elhmRentalAmt', header: '가전기준가(렌탈/할부)', width: '150', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'notElhmSpayAmt', header: '가전외인정실적', width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'elhmRentalCt', header: '가전인정건수', width: '90', styleName: 'text-right', dataType: 'number' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
}

// 순증상세 그리드
function initGrid4(data, view) {
  const fields = [
    { fieldName: 'ogCd' },
    { fieldName: 'prtnrNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'pstnDvCd' },
    { fieldName: 'canTpNm' },
    { fieldName: 'cntrCstNo' },
    { fieldName: 'cntrCstNm' },
    { fieldName: 'pdClsfNm' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'cntrPdStrtdt' },
    { fieldName: 'cntrCanDt' },
    { fieldName: 'cntrStatChRsonCd' },
    { fieldName: 'origOgCd' },
    { fieldName: 'origPrtnrKnm' },
    { fieldName: 'origSellPrtnrNo' },
  ];

  const columns = [
    { fieldName: 'ogCd', header: '소속', width: '90', styleName: 'text-center' },
    { fieldName: 'prtnrNm', header: '성명', width: '80', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: '번호', width: '100', styleName: 'text-center' },
    { fieldName: 'pstnDvCd', header: '직급', width: '70', styleName: 'text-center' },
    { fieldName: 'canTpNm', header: '유형', width: '100', styleName: 'text-center' },
    { fieldName: 'cntrCstNo', header: '고객코드', width: '140', styleName: 'text-center' },
    { fieldName: 'cntrCstNm', header: '고객명', width: '100', styleName: 'text-center' },
    { fieldName: 'pdClsfNm', header: '상품구분', width: '110', styleName: 'text-center' },
    { fieldName: 'pdCd', header: '상품코드', width: '120', styleName: 'text-center' },
    { fieldName: 'pdNm', header: '상품명', width: '200', styleName: 'text-left' },
    { fieldName: 'cntrPdStrtdt', header: '매출일자', width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM-DD' },
    { fieldName: 'cntrCanDt', header: '취소일자', width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM-DD' },
    { fieldName: 'cntrStatChRsonCd', header: '취소코드', width: '90', styleName: 'text-center' },
    { name: 'cntrStatChRsonNm', fieldName: 'cntrStatChRsonCd', header: '취소사유', width: '150', styleName: 'text-center', options: codes.CMN_STAT_CH_RSON_CD },
    { fieldName: 'origOgCd', header: '소속', width: '110', styleName: 'text-center' },
    { fieldName: 'origPrtnrKnm', header: '성명', width: '90', styleName: 'text-center' },
    { fieldName: 'origSellPrtnrNo', header: '번호', width: '90', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    {
      header: '관리매니저',
      direction: 'horizontal',
      items: ['ogCd', 'prtnrNm', 'prtnrNo', 'pstnDvCd'],
    },
    {
      header: '고객사항',
      direction: 'horizontal',
      items: ['canTpNm', 'cntrCstNo', 'cntrCstNm', 'pdClsfNm', 'pdCd', 'pdNm', 'cntrPdStrtdt', 'cntrCanDt', 'cntrStatChRsonCd', 'cntrStatChRsonNm'],
    },
    {
      header: '판매자',
      direction: 'horizontal',
      items: ['origOgCd', 'origPrtnrKnm', 'origSellPrtnrNo'],
    },
  ]);
}
</script>

<style scoped>
</style>
