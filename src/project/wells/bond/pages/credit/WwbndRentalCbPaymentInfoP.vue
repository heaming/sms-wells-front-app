<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WBND
2. 프로그램 ID : WwbndRentalCbPaymentInfoP ( W-BN-U-0071P01 ) - 렌탈CB납입정보(팝업)
3. 작성자 : gilyong.han
4. 작성일 : 2023.06.19
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 고객별 렌탈CB 대상 또는 기 등록된 고객의 납입 정보 조회 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="popupRef"
    size="2xl"
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
        <span class="ml8">{{ t('MSG_TXT_UNIT_COLON_WON') }}</span>
      </template>
      <kw-btn
        v-permission:download
        icon="download_on"
        dense
        secondary
        :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="pageInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMainRef"
      :visible-rows="10"
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
import {
  useDataService,
  codeUtil,
  getComponentType,
  gridUtil,
  useMeta,
  defineGrid,
} from 'kw-lib';

const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const grdMainRef = ref(getComponentType('kw-grid'));
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const props = defineProps({
  cstNo: {
    type: String,
    required: true,
  },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/bond/rental-cb-mgt/objects';
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS', // 페이지 사이즈
);

async function fetchData() {
  const res = await dataService.get(`${baseUrl}/${props.cstNo}/paging`, { params: { ...pageInfo.value } });
  const { list: data, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(data);
  // view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

const popupRef = ref();
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseUrl}/${props.cstNo}/excel-download`);

  await gridUtil.exportView(view, {
    fileName: popupRef.value.pageCtxTitle,
    timePostfix: true,
    exportData: res.data,
    searchCondition: false,
  });
}

onMounted(async () => {
  await fetchData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Gridm
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '130', styleName: 'text-center' }, // 고객번호
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-center' }, // 고객명
    { fieldName: 'copnDvNm', header: t('MSG_TXT_INDI_CORP'), width: '130', styleName: 'text-center' }, // 개인/법인
    { fieldName: 'sellTpNm', header: t('MSG_TXT_PRDT_GUBUN'), width: '130', styleName: 'text-center' }, // 상품구분
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PDCT'), width: '130', styleName: 'text-left' }, // 제품
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' }, // 매출일자
    { fieldName: 'cralTno', header: t('MSG_TXT_MPNO'), width: '130', styleName: 'text-center' }, // 휴대전화번호
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_STPL_DT'), width: '130', styleName: 'text-center ' }, // 약정일자
    { fieldName: 'fntDvNm', header: t('MSG_TXT_STLM_MES'), width: '130', styleName: 'text-center ' }, // 결제수단
    { fieldName: 'dlqAmt', header: t('MSG_TXT_DLQ_DP_TOT'), width: '130', styleName: 'text-right', dataType: 'number' }, // 연체입금액
    { fieldName: 'dlqBlam', header: t('MSG_TXT_DLQ_BLAM'), width: '130', styleName: 'text-right', dataType: 'number' }, // 연체잔액
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_CLCTAM_PSIC'), width: '130', styleName: 'text-center' }, // 집금담당자
    { fieldName: 'dsphTno', header: t('MSG_TXT_DSPH_NO'), width: '130', styleName: 'text-center' }, //
    // rev:230410 header 텍스트 수정
    { fieldName: 'rgstSchDt', header: t('MSG_TXT_RGST_SCHD_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' }, // 발신번호
    // // rev:230410 header 텍스트 수정
    { fieldName: 'niceFwExcdYn', header: t('MSG_TXT_EXCD_YN'), width: '130', styleName: 'text-center' }, // 제외여부
    // rev:230410 header 텍스트 수정
    { fieldName: 'fwbooDtm', header: t('MSG_TXT_NOTAK_FW_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' }, // 알림톡 발송일자
    // // rev:230410 header 텍스트 수정
    { fieldName: 'resultYn', header: t('MSG_TXT_SCS_YN'), width: '130', styleName: 'text-center' }, // 성공여부
    // rev:230410 header 텍스트 수정
    { fieldName: 'notyFwOjDt', header: t('MSG_TXT_DL_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' }, // 삭제일자
    // // rev:230410 header 텍스트 수정
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
