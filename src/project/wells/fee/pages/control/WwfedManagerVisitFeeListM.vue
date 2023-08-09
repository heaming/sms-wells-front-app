<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FED
2. 프로그램 ID : WwfedManagerVisitFeeListM - 웰스매니저 방문수수료 현황
3. 작성자 : seoin.jeon
4. 작성일 : 2023.03.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 웰스매니저 방문수수료 현황
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
          :colspan="2"
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            :label="$t('MSG_TXT_BASE_YM')"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_INQR_DV')"
          required
        >
          <kw-select
            v-model="searchParams.inqrDv"
            :options="inqrDv"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
          colspan="2"
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevlDvCd1"
            v-model:og-levl-dv-cd2="searchParams.ogLevlDvCd2"
            v-model:og-levl-dv-cd3="searchParams.ogLevlDvCd3"
            :og-tp-cd="searchParams.ogTpCd"
            :base-ym="searchParams.baseYm"
            :start-level="1"
            :end-level="3"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
            icon="search"
            clearable
            :on-click-icon="onClickSearchNo"
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
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
          <span class="kw-fc--error ml8">* 엑셀 다운로드는 조회내역 전체를 내려받습니다.</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount===0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdVisitFeeRef"
        name="grdVisitFee"
        :visible-rows="10"
        @init="initGridMain"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useDataService, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';

const dataService = useDataService();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { modal } = useGlobal();

// M조직 수수료 개인상세 조회에서 router 호출
const props = defineProps({
  perfYm: { // 실적년월
    type: String,
    default: dayjs().subtract(1, 'month').format('YYYYMM'),
  },
  prtnrNo: { // 파트너번호
    type: String,
    default: '',
  },
  ogLv1Id: { // 1조직레벨(지점장일 경우만)
    type: String,
    default: '',
  },
  ogLv2Id: { // 2조직레벨(지점장일 경우만)
    type: String,
    default: '',
  },
  ogLv3Id: { // 3조직레벨(지점장일 경우만)
    type: String,
    default: '',
  },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// ------------------------------------------------------------------------------------------------
const totalCount = ref(0);
const grdVisitFeeRef = ref(getComponentType('KwGrid'));
const inqrDv = [
  { codeId: '01', codeName: t('MSG_TXT_MANAGEMENT_DEPARTMENT') },
  { codeId: '02', codeName: t('MSG_TXT_RGNL_GRP') },
  { codeId: '03', codeName: t('MSG_TXT_BRANCH') },
  { codeId: '04', codeName: t('MSG_TXT_INDV') },
];
const searchParams = ref({
  baseYm: props.perfYm,
  inqrDv: '01',
  ogTpCd: 'W02',
  ogLevlDvCd1: props.ogLv1Id,
  ogLevlDvCd2: props.ogLv2Id,
  ogLevlDvCd3: props.ogLv3Id,
  prtnrNo: props.prtnrNo,
});

// 번호 검색 아이콘 클릭 이벤트
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzMonthPartnerListP',
    componentProps: {
      baseYm: searchParams.value.baseYm,
      prtnrNo: searchParams.value.prtnrNo,
    },
  });

  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/fee/manager-visit-fees', { params: searchParams.value, timeout: 400000 });

  totalCount.value = res.data.length;

  const view = grdVisitFeeRef.value.getView();
  view.getDataSource().setRows(res.data);
}

async function onClickSearch() {
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdVisitFeeRef.value.getView();
  const response = await dataService.get('/sms/wells/fee/manager-visit-fees', { params: searchParams.value });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

onMounted(() => {
  // M조직 수수료 개인상세 조회에서 탭으로 띄울 경우, 바로 조회함.
  if (!isEmpty(searchParams.value.no)) {
    if (!isEmpty(searchParams.value.ogLevlDvCd3)) searchParams.value.inqrDv = '03'; // 3조직레벨이 있으면 지점 기준 조회
    else searchParams.value.inqrDv = '04'; // 없으면 개인 기준 조회
    onClickSearch();
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '154', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '92', styleName: 'text-center' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CST_CD'), width: '106', styleName: 'text-center' },
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '106', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '300', styleName: 'text-left' },
    { fieldName: 'svFeePdDvNm', header: t('MSG_TXT_BS') + t('MSG_TXT_PDGRP'), width: '112', styleName: 'text-center' },
    { fieldName: 'svFeeBaseAmt', header: t('MSG_TXT_BAS_FEE'), width: '122', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'feeCalcAmt', header: t('MSG_TXT_VST_FEE'), width: '122', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'vstRglvlGdNm', header: t('MSG_TXT_VST_RGLVL'), width: '106', styleName: 'text-center' },
    { fieldName: 'wkExcnDt', header: t('MSG_TXT_VST_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'canYn', header: t('MSG_TXT_CNCL_YN'), width: '106', styleName: 'text-center' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.checkBar.visible = false;
});

</script>
