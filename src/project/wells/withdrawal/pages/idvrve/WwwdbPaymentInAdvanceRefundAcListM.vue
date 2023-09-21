<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID :  WwwdbPaymentInAdvanceRefundAcListM - 선환불계좌현황 W-WD-U-0125M01
3. 작성자 : sonkiseok
4. 작성일 : 2023.04.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- PGE_WDB_00032
- 먼저 환불 한 계좌를 조회 합니다.
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 대상구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_CONT_CLASS')"
        >
          <kw-select
            v-model="searchParams.stlmTpCd"
            :options="codes.STLM_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 처리일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRCSDT')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDay"
            v-model:to="searchParams.endDay"
            rules="date_range_required|date_range_months:1"
            :label="$t('MSG_TXT_PRCSDT')"
          />
        </kw-search-item>
        <!-- 업무구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_TASK_DIV')"
        >
          <kw-select
            v-model="searchParams.cshRfndDvCd"
            :options="codes.CSH_RFND_DV_CD"
            readonly
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
        </template>
        <kw-btn
          v-permission:download
          icon="excel"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
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
import { gridUtil, codeUtil, defineGrid, useMeta, getComponentType, useDataService, notify, fileUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const now = dayjs();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { getConfig } = useMeta();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'STLM_TP_CD', // 대상구분 = 결제유형코드
  'CSH_RFND_DV_CD', // 업무구분 = 현금환불구분코드
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const searchParams = ref({
  stlmTpCd: '', // 대상구분
  startDay: now.format('YYYYMM01'), // 처리일자.시작일
  endDay: now.format('YYYYMMDD'), // 처리일자.종료일
  cshRfndDvCd: '01', // 업무구분 : 선환불만 입력되야함
});

let cachedParams;

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/advance-refund-account/paging', { params: cachedParams });
  const { list: accounts, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(accounts);
  view.resetCurrent();
}

// 조회 버튼
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/advance-refund-account/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'stlmTpCd' }, // 대상구분
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'fnlMdfcDtm', dataType: 'date' }, // 처리일자
    { fieldName: 'rfndDsbAmt', dataType: 'number' }, // 금액(원)
    { fieldName: 'cshRfndFnitCd' }, // 은행명
    { fieldName: 'cshRfndAcnoEncr' }, // 계좌번호
    { fieldName: 'cshRfndAcownNm' }, // 예금주
    { fieldName: 'bltfOjCntrSn' }, // 전금코드
    { fieldName: 'fnlMdfcUsrId' }, // 요청자
    { fieldName: 'exRfndRsonCn' }, // 예외환불사유
    { fieldName: 'rfndEvidMtrFileId' }, // 증빙첨부
  ];

  const columns = [
    { fieldName: 'stlmTpCd', header: t('MSG_TXT_CONT_CLASS'), width: '120', styleName: 'text-center', options: codes.STLM_TP_CD }, // 대상구분
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL'), width: '150', styleName: 'text-center' }, // 계약상세
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '90', styleName: 'text-center' }, // 고객명
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_PRCSDT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' }, // 처리일자
    { fieldName: 'rfndDsbAmt', header: t('MSG_TXT_AMT_WON'), width: '120', styleName: 'text-right' }, // 금액(원)
    { fieldName: 'cshRfndFnitCd', header: t('MSG_TXT_BNK_NM'), width: '120', styleName: 'text-left' }, // 은행명
    { fieldName: 'cshRfndAcnoEncr', header: t('MSG_TXT_AC_NO'), width: '200', styleName: 'text-center' }, // 계좌번호
    { fieldName: 'cshRfndAcownNm', header: t('MSG_TXT_ACHLDR'), width: '90', styleName: 'text-center' }, // 예금주
    { fieldName: 'bltfOjCntrSn', header: t('MSG_TXT_BLTF_CD'), width: '110', styleName: 'text-center' }, // 전금코드
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_REQ_USER'), width: '90', styleName: 'text-left' }, // 요청자
    { fieldName: 'exRfndRsonCn', header: t('MSG_TXT_EX_RFND_RSON'), width: '240', styleName: 'text-left' }, // 예외환불사유
    // 증빙첨부
    { fieldName: 'rfndEvidMtrFileId',
      header: t('MSG_TXT_EVID_APN'),
      width: '96',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        const rfndEvidMtrFileId = value === null ? t('MSG_TXT_NONE') : t('MSG_BTN_DLOAD');
        return `${rfndEvidMtrFileId}`;
      },
      styleCallback(grid, dataCell) {
        const rfndEvidMtrFileId = grid.getValue(dataCell.index.itemIndex, 'rfndEvidMtrFileId') === null ? t('N') : grid.getValue(dataCell.index.itemIndex, 'rfndEvidMtrFileId');
        return rfndEvidMtrFileId !== 'N' ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  view.onCellItemClicked = async (grid, { column, dataRow }) => {
    const { rfndEvidMtrFileId } = gridUtil.getRowValue(grid, dataRow); // 증빙첨부

    // 증빙첨부
    if (column === 'rfndEvidMtrFileId') {
      if (rfndEvidMtrFileId !== null) { // 증빙첨부이 있는 경우
        notify('다운로드 기능 확인 필요. 개발지원 > 상점관리 보고 만듬.');
        fileUtil.download({ rfndEvidMtrFileId }, 'storage');
      }
    }
  };
});
</script>
<style scoped>
</style>
