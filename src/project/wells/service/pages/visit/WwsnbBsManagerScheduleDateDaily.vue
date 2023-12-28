<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNB (방문관리)
 2. 프로그램 ID : WwsnbBsManagerScheduleDateDaily - BS관리일정조회(일자별)
 3. 작성자 : 홍세기
 4. 작성일 : 2023.06.01
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - KSS에서 넘어온화면
 ****************************************************************************************************
--->
<template>
  <kw-search
    :cols="4"
    @search="onClickSearch"
  >
    <kw-search-row>
      <!-- 관리년월 -->
      <kw-search-item
        :label="$t('MSG_TXT_MGT_YNM')"
        :colspan="2"
      >
        <kw-date-range-picker
          v-model:from="searchParams.baseDateFrom"
          v-model:to="searchParams.baseDateTo"
          rules="date_range_months:1"
          name="$t('MSG_TXT_MGT_YNM')"
        />
      </kw-search-item>
      <!-- 담당자 -->
      <kw-form-item :label="$t('MSG_TXT_PIC')">
        <kw-input
          v-model.trim="searchParams.fxnPrtnrKnm"
          class="w120"
          icon="search"
          clearable
          @click-icon="onFxnPrtnrNoSearchPopup"
        />
        <kw-input
          v-model="searchParams.fxnPrtnrNo"
          class="w120"
          placeholder=""
          disable
        />
      </kw-form-item>
    </kw-search-row>
  </kw-search>

  <div class="result-area">
    <kw-grid
      ref="grdfrontMainRef"
      class="mt12"
      :visible-rows="1"
      @init="initfrontGrdMain"
    />

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
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMainRef"
      class="mt12"
      :visible-rows="pageInfo.pageSize"
      @init="initGrdMain"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, useGlobal, getComponentType, gridUtil, useDataService, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

import dayjs from 'dayjs';

const { t } = useI18n();

const { getConfig } = useMeta();
const { currentRoute } = useRouter();

const { modal, notify } = useGlobal();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const grdfrontMainRef = ref(getComponentType('KwGrid'));

const props = defineProps({
  prtnrNo: { type: String, default: '' },
  prtnrKnm: { type: String, default: '' },
  ogId: { type: String, default: '' },
  fromDate: { type: String, default: '' },
  toDate: { type: String, default: '' },
});

let cachedParams;
// TODO..파트너번호로 바로 조회 가능한 방법이 있으면 파트너명 굳이 props 로 받지 않아도 됨...방법을 못찾음
const searchParams = ref({
  baseDateFrom: isEmpty(props.fromDate) ? dayjs().subtract(0, 'month').startOf('month').format('YYYYMMDD') : props.fromDate,
  baseDateTo: isEmpty(props.toDate) ? dayjs().subtract(0, 'month').endOf('day').format('YYYYMMDD') : props.toDate,
  fxnPrtnrNo: isEmpty(props.prtnrNo) ? '' : props.prtnrNo,
  fxnPrtnrKnm: isEmpty(props.prtnrKnm) ? '' : props.prtnrKnm,
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

async function fetchData1() {
  /** 위 집계 그리드 * */
  const res1 = await dataService.get('/sms/wells/service/bs-manager-schedule/dt-aggregates', { params: searchParams.value });

  const view1 = grdfrontMainRef.value.getView();
  view1.getDataSource().setRows(res1.data);
  view1.resetCurrent();
}

async function fetchData2() {
  /** 위 집계 그리드 * */
  const res2 = await dataService.get('/sms/wells/service/bs-manager-schedule/dt-paging', { params: { ...cachedParams, ...pageInfo.value } });

  const view2 = grdMainRef.value.getView();
  view2.getDataSource().setRows(res2.data);
  view2.resetCurrent();
}

async function onClickSearch() {
  console.log('zippo0209 0003 >>');
  if (!searchParams.value.fxnPrtnrNo) {
    notify(t('MSG_ALT_NCELL_REQUIRED_VAL', [t('MSG_TXT_PIC')]));
    return;
  }
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData1();
  await fetchData2();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/bs-manager-schedule/dt-paging', { params: { ...cachedParams, ...pageInfo.value } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data.list,
  });
}

/*
 *  Event - 방문담당자 검색 버튼 클릭
 */
async function onFxnPrtnrNoSearchPopup() {
  const mngrDvCd = searchParams.value.fxnPrtnrDvCd ?? '';
  const searchText = searchParams.value.fxnPrtnrKnm;

  const { result: isChanged, payload } = await modal({
    component: 'WwsndHumanResourcesListP',
    componentProps: {
      mngrDvCd,
      searchText,
    },
  });

  if (isChanged) {
    searchParams.value.fxnPrtnrNo = payload[0].prtnrNo;
    searchParams.value.fxnPrtnrKnm = payload[0].prtnrKnm;
  }
}

onMounted(async () => {
  console.log('zippo0209 0001 searchParams.value >>', searchParams.value);
  const { baseDateFrom, baseDateTo, fxnPrtnrNo, fxnPrtnrKnm } = searchParams.value;
  if (!isEmpty(baseDateFrom) && !isEmpty(baseDateTo) && !isEmpty(fxnPrtnrNo) && !isEmpty(fxnPrtnrKnm)) {
    console.log('zippo0209 0002 >>');
    await onClickSearch();
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize front Grid
// -------------------------------------------------------------------------------------------------
const initfrontGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrDt',
      header: t('MSG_TXT_INIT_CNTR_DT'),
      width: '150',
    }, // 최초계약일
    { fieldName: 'recntrDt', header: t('MSG_TXT_CNTR_DATE'), width: '100' }, // 계약일자
    { fieldName: 'mngtAcc', header: t('MSG_TXT_MNGT_ACC'), width: '150', styleName: 'text-center' }, // 관리계정
    { fieldName: 'vstAcc', header: t('MSG_TXT_VST_ACC'), width: '100', styleName: 'text-center' }, // 방문계정
    { fieldName: 'fshAcc', header: t('MSG_TXT_FSH_ACC'), width: '150', styleName: 'text-center' }, // 완료계정
    { fieldName: 'svcProc', header: t('MSG_TXT_SVC_PROC'), width: '150', styleName: 'text-center' }, // 서비스처리율(%)
  ];

  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);

  const columnLayout = [
    'cntrDt',
    'recntrDt',
    'mngtAcc',
    'vstAcc',
    'fshAcc',
    'svcProc',
  ];

  view.setColumnLayout(columnLayout);
  view.setFooters({ visible: true });
  view.rowIndicator.visible = true;
  view.filteringOptions.enabled = false;
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { // 방문일자
      fieldName: 'vstDt',
      header: t('MSG_TXT_VST_DT'),
      width: '150',
      styleName: 'text-center',
      footer: { text: t('MSG_TXT_SUM') },
      displayCallback(grid, index) {
        const { vstDt } = grid.getValues(index.itemIndex);
        return dayjs(vstDt).format('YYYY-MM-DD');
      },
    },
    { // 방문시간
      fieldName: 'vstTm',
      header: t('MSG_TXT_VST_TM'),
      width: '100',
      displayCallback(grid, index) {
        const { vstTm } = grid.getValues(index.itemIndex);
        return `${vstTm.substring(0, 2)}:${vstTm.substring(2, 4)}:${vstTm.substring(4, vstTm.length)}`;
      },
    },
    { fieldName: 'cstNm',
      header: t('MSG_TXT_CST_NM'),
      width: '150',
      styleName: 'text-center',
      options: codes.COPN_DV_CD }, // 고객명
    { // 계약상세번호
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center',
      footer: { text: t('MSG_TXT_SUM') },
    },
    { fieldName: 'goodsNm', header: t('MSG_TXT_GOODS_NM'), width: '150', styleName: 'text-center' }, // 제품명
    { // 휴대전화번호
      fieldName: 'mpNo',
      header: t('MSG_TXT_MPNO'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cralLocaraTno, mexnoEncr, cralIdvTno } = grid.getValues(index.itemIndex);

        if (!isEmpty(cralLocaraTno) && isEmpty(mexnoEncr) && !isEmpty(cralIdvTno)) {
          return `${cralLocaraTno}--${cralIdvTno}`;
        }
        return isEmpty(cralLocaraTno) && isEmpty(mexnoEncr) && isEmpty(cralIdvTno) ? '' : `${cralLocaraTno}-${mexnoEncr}-${cralIdvTno}`;
      },
    },
    { fieldName: 'puPart1', header: t('MSG_TXT_PU_PART') || '1', width: '100', styleName: 'text-center' }, // 투입부품1
    { fieldName: 'puPart2', header: t('MSG_TXT_PU_PART') || '2', width: '100', styleName: 'text-center' }, // 투입부품2
    { fieldName: 'puPart3', header: t('MSG_TXT_PU_PART') || '3', width: '100', styleName: 'text-center' }, // 투입부품3
    { fieldName: 'puPart4', header: t('MSG_TXT_PU_PART') || '4', width: '100', styleName: 'text-center' }, // 투입부품4
    { fieldName: 'puPart5', header: t('MSG_TXT_PU_PART') || '5', width: '100', styleName: 'text-center' }, // 투입부품5
    { fieldName: 'puPart6', header: t('MSG_TXT_PU_PART') || '6', width: '100', styleName: 'text-center' }, // 투입부품6
    { fieldName: 'cralLocaraTno', visible: false },
    { fieldName: 'mexnoEncr', visible: false },
    { fieldName: 'cralIdvTno', visible: false },
  ];

  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);

  const columnLayout = [
    { column: 'vstDt', footerUserSpans: [{ colspan: 2 }] },
    'vstTm',
    'cstNm',
    'cntrNo',
    'goodsNm',
    'mpNo',
    'puPart1',
    'puPart2',
    'puPart3',
    'puPart4',
    'puPart5',
    'puPart6',
  ];

  view.setColumnLayout(columnLayout);

  view.setFooters({ visible: true });
  view.rowIndicator.visible = true;
  view.filteringOptions.enabled = false;
});
</script>

<style scoped>
</style>
