<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcaBusinessDepositDelinquentListM - 영업부 입금/연체 현황 - W-CL-U-0018M01
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.06.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 영업부 입금/연체 현황을 조회한다.
****************************************************************************************************
---->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            :label="$t('MSG_TXT_BASE_YM')"
            rules="required"
            type="month"
            @change="onChangeBaseYm"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_OG_TP')">
          <kw-select
            v-model="searchParams.ogTp"
            first-option="all"
            first-option-value="ALL"
            :options="ogTp"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
          required
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.dgr1LevlOgCd"
            v-model:og-levl-dv-cd2="searchParams.dgr2LevlOgCd"
            v-model:og-levl-dv-cd3="searchParams.dgr3LevlOgCd"
            :og-tp-cd="searchParams.ogTp"
            :start-level="1"
            :end-level="3"
            :label="$t('MSG_TXT_OG_LEVL')"
            rules="required"
            :base-ym="searchParams.baseYm"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <ul class="kw-notification">
        <li>
          {{ baseYm.baseYm4before }} ~ {{ baseYm.baseYm2before }}월 설치 주문 조회
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
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          v-permission:download
          icon="download_on"
          :disable="pageInfo.totalCount === 0"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExportView"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
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
import { codeUtil, gridUtil, defineGrid, getComponentType, useDataService, useMeta, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';

const now = dayjs();
const { t } = useI18n();
const { getConfig } = useMeta();
const { alert } = useGlobal();
const dataService = useDataService();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'OG_TP_CD',
);

const ogTp = codes.OG_TP_CD.filter((v) => ['W01', 'W02'].includes(v.codeId));

const searchParams = ref({
  baseYm: now.format('YYYYMM'), // 기준년월
  ogTp: 'ALL', // 조직유형
  dgr1LevlOgCd: '',
  dgr2LevlOgCd: '',
  dgr3LevlOgCd: '',
});

const baseYm = ref({
  baseYm4before: '',
  baseYm2before: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 조회
let cachedParams;
async function fetchData() {
  console.log(searchParams.value);
  cachedParams = cloneDeep(searchParams.value);
  if (isEmpty(searchParams.value.dgr1LevlOgCd)) {
    await alert(t('MSG_TXT_BEFORE_SELECT_IT', [t('MSG_TXT_MANAGEMENT_DEPARTMENT')]));
    return;
  }
  const res = await dataService.get('/sms/wells/closing/business-deposit-delinquents', { params: { ...cachedParams, ...pageInfo.value, timeout: 80000 } });

  console.log(res.data);
  const { list: mainList, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(mainList);
}

// 조회 버튼 클릭 이벤트
async function onClickSearch() {
  await fetchData();
}

// 기준년월 변경시
function onChangeBaseYm() {
  const view = grdMainRef.value.getView();
  view.setColumnProperty('billing3', 'header', dayjs(searchParams.value.baseYm).add(-3, 'month').format('MM') + t('MSG_TXT_MON'));
  view.setColumnProperty('billing2', 'header', dayjs(searchParams.value.baseYm).add(-2, 'month').format('MM') + t('MSG_TXT_MON'));
  view.setColumnProperty('billing1', 'header', dayjs(searchParams.value.baseYm).add(-1, 'month').format('MM') + t('MSG_TXT_MON'));

  view.setColumnProperty('deposit3', 'header', dayjs(searchParams.value.baseYm).add(-3, 'month').format('MM') + t('MSG_TXT_MON'));
  view.setColumnProperty('deposit2', 'header', dayjs(searchParams.value.baseYm).add(-2, 'month').format('MM') + t('MSG_TXT_MON'));
  view.setColumnProperty('deposit1', 'header', dayjs(searchParams.value.baseYm).add(-1, 'month').format('MM') + t('MSG_TXT_MON'));

  view.setColumnProperty('delinquent3', 'header', dayjs(searchParams.value.baseYm).add(-3, 'month').format('MM') + t('MSG_TXT_MON'));
  view.setColumnProperty('delinquent2', 'header', dayjs(searchParams.value.baseYm).add(-2, 'month').format('MM') + t('MSG_TXT_MON'));
  view.setColumnProperty('delinquent1', 'header', dayjs(searchParams.value.baseYm).add(-1, 'month').format('MM') + t('MSG_TXT_MON'));
}

// 엑셀 다운로드 버튼 클릭
async function onClickExportView() {
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/closing/business-deposit-delinquents/excel-download', { params: cachedParams, timeout: 80000 });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

onMounted(async () => {
  baseYm.value.baseYm4before = dayjs(searchParams.value.baseYm).add(-4, 'month').format('M');
  baseYm.value.baseYm2before = dayjs(searchParams.value.baseYm).add(-2, 'month').format('M');
  await onChangeBaseYm();
});

watch(() => searchParams.value.baseYm, async (val) => {
  baseYm.value.baseYm4before = dayjs(val).add(-4, 'month').format('M');
  baseYm.value.baseYm2before = dayjs(val).add(-2, 'month').format('M');
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'dgr2LevlOgCd', header: t('MSG_TXT_RGRP_CD'), width: '100', styleName: 'text-center' }, // 접수당시 지역단 코드
    { fieldName: 'dgr2LevlDgPrtnrNm', header: t('MSG_TXT_REG_DIR'), width: '100' }, // 접수당시 지역단장
    { fieldName: 'dgr3LevlOgCd', header: t('MSG_TXT_BRCH_CD'), width: '100', styleName: 'text-center' }, // 접수당시 지점코드
    { fieldName: 'dgr3LevlDgPrtnrNm', header: t('MSG_TXT_BRMGR'), width: '100' }, // 접수당시 지점장
    { fieldName: 'dgr3LevlDgPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' }, // 접수당시 번호
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_SELL_NM'), width: '100' }, // 접수당시 판매자명
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' }, // 접수당시 번호
    { fieldName: 'cltnDt', header: t('MSG_TXT_CLTN_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 접수당시 해약일자
    { fieldName: 'nowDgr3LevlOgCd', header: t('MSG_TXT_BRCH_CD'), width: '100', styleName: 'text-center' }, // 현재소속 지점코드
    { fieldName: 'nowDgr3LevlDgPrtnrNm', header: t('MSG_TXT_BRMGR'), width: '100' }, // 현재소속 지점장
    { fieldName: 'nowDgr3LevlDgPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' }, // 현재소속 번호
    { fieldName: 'nowPrtnrKnm', header: t('MSG_TXT_SELL_NM'), width: '100' }, // 현재소속 판매자명
    { fieldName: 'nowPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' }, // 현재소속 번호
    { fieldName: 'nowCltnDt', header: t('MSG_TXT_CLTN_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 현재소속 해약일자
    { fieldName: 'sellTpNm', header: t('MSG_TXT_TASK_DIV'), width: '140' }, // 업무구분
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '140', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '140', styleName: 'text-center' }, // 고객번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130' }, // 고객명
    { fieldName: 'pdNm', header: t('MSG_TXT_GOODS_NM'), width: '140', styleName: 'text-center' }, // 제품명
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_CNTR_DATE'), width: '140', styleName: 'text-center', datetimeFormat: 'date' }, // 계약일자
    { fieldName: 'istDtm', header: t('MSG_TXT_IST_DT'), width: '140', styleName: 'text-center', datetimeFormat: 'date' }, // 설치일자
    { fieldName: 'rentalAmt', header: t('MSG_TXT_MM_RTLFE'), width: '140', styleName: 'text-right', dataType: 'number' }, // 월 렌탈료
    { fieldName: 'istmMcn', header: t('MSG_TXT_DUTY_STPL'), width: '140', styleName: 'text-right', dataType: 'number' }, // 의무약정
    { fieldName: 'billing3', header: '', width: '100', styleName: 'text-right', dataType: 'number' }, // 3개월전 청구금액
    { fieldName: 'billing2', header: '', width: '100', styleName: 'text-right', dataType: 'number' }, // 2개월전 청구금액
    { fieldName: 'billing1', header: '', width: '100', styleName: 'text-right', dataType: 'number' }, // 1개월전 청구금액
    { fieldName: 'billingSum', header: t('MSG_TXT_BIL_SUM'), width: '100', styleName: 'text-right', dataType: 'number' }, // 청구합계
    { fieldName: 'deposit3', header: '', width: '100', styleName: 'text-right', dataType: 'number' }, // 3개월전 입금액
    { fieldName: 'deposit2', header: '', width: '100', styleName: 'text-right', dataType: 'number' }, // 2개월전 입금액
    { fieldName: 'deposit1', header: '', width: '100', styleName: 'text-right', dataType: 'number' }, // 1개월전 입금액
    { fieldName: 'depositSum', header: t('MSG_TXT_BIL_SUM'), width: '100', styleName: 'text-right', dataType: 'number' }, // 입금합계
    { fieldName: 'delinquent3', header: '', width: '100', styleName: 'text-right', dataType: 'number' }, // 3개월전 연체금액
    { fieldName: 'delinquent2', header: '', width: '100', styleName: 'text-right', dataType: 'number' }, // 2개월전 연체금액
    { fieldName: 'delinquent1', header: '', width: '100', styleName: 'text-right', dataType: 'number' }, // 1개월전 연체금액
    { fieldName: 'thisMonth', header: t('MSG_TXT_THM_DP'), width: '120', styleName: 'text-right', dataType: 'number' }, // 당월입금
    { fieldName: 'delinquentYn', header: t('MSG_TXT_OVERDUE'), width: '120', styleName: 'text-center' }, // 연체여부
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    {
      header: t('MSG_TXT_RCP_THTM_BLG'), // colspan title
      direction: 'horizontal', // merge type
      items: ['dgr2LevlOgCd', 'dgr2LevlDgPrtnrNm', 'dgr3LevlOgCd', 'dgr3LevlDgPrtnrNm', 'dgr3LevlDgPrtnrNo', 'prtnrKnm', 'prtnrNo', 'cltnDt'],
    },
    {
      header: t('MSG_TXT_CRTL_BLG'),
      direction: 'horizontal',
      items: ['nowDgr3LevlOgCd', 'nowDgr3LevlDgPrtnrNm', 'nowDgr3LevlDgPrtnrNo', 'nowPrtnrKnm', 'nowPrtnrNo', 'nowCltnDt'],
    },
    'sellTpNm',
    'cntrDtlNo',
    'cstNo',
    'cstKnm',
    'pdNm',
    'cntrCnfmDtm',
    'istDtm',
    'rentalAmt',
    'istmMcn',
    {
      header: t('MSG_TXT_BIL_PS'),
      direction: 'horizontal',
      items: ['billing3', 'billing2', 'billing1', 'billingSum'],
    },
    {
      header: t('MSG_TXT_DP_PS'),
      direction: 'horizontal',
      items: ['deposit3', 'deposit2', 'deposit1', 'depositSum'],
    },
    {
      header: t('MSG_TXT_DLQ_PS'),
      direction: 'horizontal',
      items: ['delinquent3', 'delinquent2', 'delinquent1'],
    },
    'thisMonth',
    'delinquentYn',
  ]);
});

</script>
