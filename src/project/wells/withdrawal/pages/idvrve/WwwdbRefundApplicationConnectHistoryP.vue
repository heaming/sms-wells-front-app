<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID :  WwwdbRefundApplicationConnectHistoryP - 환불신청 컨택이력조회 W-WD-U-0108P02
3. 작성자 : sonkiseok
4. 작성일 : 2023.05.19
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- PGE_WDB_00062
- 수납 > 환불업무 > 환불신청 관리 > 환불신청상세내역 > 컨택조회
- 컨택조회
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="popup5Ref"
    size="lg"
    no-action
  >
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change="fetchData"
        />
        <!-- (단위:원) -->
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
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
    </kw-action-top>

    <kw-grid
      ref="grdPop5Ref"
      name="grdPop5"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      :visible-rows="10"
      @init="initPop5"
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
import { defineGrid, getComponentType, useMeta, gridUtil, useDataService, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { getConfig } = useMeta();
const dataService = useDataService();
const { t } = useI18n();

const props = defineProps({
  cntrNo: { type: String, required: false, default: '' },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  // 'CTT_CHNL_TP_CD', // 상담경로
);

const grdPop5Ref = ref(getComponentType('KwGrid'));

const popup5Ref = ref();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  // needTotalCount: true,
});

let cachedParams;

const searchParams = ref({
  cntrNo: props.cntrNo,
});

async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/connect-history/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdPop5Ref.value.getView();
  view.getDataSource().setRows(pages);
  view.resetCurrent();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdPop5Ref.value.getView();
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/connect-history/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    // fileName: `${popup5Ref.value.pageCtxTitle}_${t('컨텍 이력 조회')}`,
    fileName: `${popup5Ref.value.pageCtxTitle}`,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
  await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initPop5 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cttRcpDtm', dataType: 'date' }, // 컨택일시
    { fieldName: 'cttChnlTpCd' }, // 상담경로
    { fieldName: 'prtnrKnm' }, // 상담자
    { fieldName: 'cttPsicId' }, // 번호
    { fieldName: 'cttMoCn' }, // 상담내용

  ];
  // 퍼블 width가 비어 있음. 20230516 임의로 입력해 놓음.
  const columns = [
    { fieldName: 'cttRcpDtm', header: t('MSG_TXT_CTT_DTM'), width: '110', styleName: 'text-center', datetimeFormat: 'date' }, // 컨택일시
    { fieldName: 'cttChnlTpCd', header: t('MSG_TXT_CNSL_PH'), width: '100', styleName: 'text-right' }, // 상담경로 options: codes.CTT_CHNL_TP_CD
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_CMRNC'), width: '100', styleName: 'text-right' }, // 상담자
    { fieldName: 'cttPsicId', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-right' }, // 번호
    { fieldName: 'cttMoCn', header: t('MSG_TXT_CNSL_CN'), width: '300', styleName: 'text-center' }, // 상담내용
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
