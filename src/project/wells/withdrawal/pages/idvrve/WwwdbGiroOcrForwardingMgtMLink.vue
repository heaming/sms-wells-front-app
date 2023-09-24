<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID : WwwdbGiroOcrForwardingMgtMLink - 지로 OCR 발송 관리 - 출력관리
3. 작성자 : heungjun.lee
4. 작성일 : 2023.01.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 지로 OCR 발송 관리 - 출력관리 조회 및 저장 페이지
****************************************************************************************************
--->
<template>
  <kw-search
    one-row
    :cols="2"
    :modified-targets="['grdPage']"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="t('MSG_TXT_FW_DAY')"
        required
      >
        <!-- label="발송일" -->
        <kw-date-picker
          v-model="searchParams.giroOcrPblDtm"
          :label="t('MSG_TXT_FW_DAY')"
          rules="required"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_PRNT_DV')"
      >
        <!-- label="출력구분" -->
        <kw-select
          v-model="searchParams.giroOcrPrntStatus"
          :options="portalList"
          first-option="all"
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
          @change="fetchData"
        />
      </template>
      <kw-btn
        v-permission:delete
        grid-action
        :label="t('MSG_BTN_DEL')"
        @click="onClickRemove"
      />
      <!-- label="삭제" -->
      <kw-separator
        spaced
        vertical
        inset
      />
      <kw-btn
        v-permission:download
        icon="download_on"
        dense
        secondary
        :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="pageInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
      <!-- label="엑셀다운로드" -->
    </kw-action-top>
    <kw-grid
      ref="grdPageRef"
      name="grdPage"
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
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useDataService, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import { openReportPopup, openReportPopupWithOptions } from '~/modules/common/utils/cmPopupUtil';

const now = dayjs();
const dataService = useDataService();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { getConfig } = useMeta();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  itemsChecked: {
    type: Boolean,
    required: true,
  },
});

const grdPageRef = ref(getComponentType('KwGrid'));

// const codes = await codeUtil.getMultiCodes(
//   'COD_PAGE_SIZE_OPTIONS',
// );

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const portalList = ref([
  {
    codeId: '01',
    codeName: t('MSG_TXT_PRNT_FSH'),
    // codeName: '출력완료',
  },
  {
    codeId: '02',
    codeName: t('MSG_TXT_PRNT_EXP'),
    // codeName: '출력예정',
  },
]);

const searchParams = ref({
  giroOcrPblDtm: now.format('YYYYMMDD'),
  giroOcrPrntStatus: '',
});

let cachedParams;

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/giro-ocr-forwardings/print', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdPageRef.value.getView();

  const data = view.getDataSource();
  data.checkRowStates(false);

  data.setRows(pages);

  // // 데이터필드 기본값 셋팅
  for (let i = 0; i < pages.length; i += 1) {
    data.setValue([i], 'giroOcrRead', '보기');
  }

  data.checkRowStates(true);

  view.resetCurrent();
}

async function onClickSearch() {
  grdPageRef.value.getData().clearRows();

  pageInfo.value.pageIndex = 1;

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdPageRef.value.getView();
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/giro-ocr-forwardings/print/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${props.itemsChecked}`,
    // fileName: '지로 OCR 발송 관리-출력관리_Excel',
    timePostfix: true,
    exportData: res.data,
  });
}

// 행삭제
async function onClickRemove() {
  const view = grdPageRef.value.getView();

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length > 0) {
    deletedRows.forEach((data) => {
      data.rowState = 'deleted';
    });

    await dataService.delete('/sms/wells/withdrawal/idvrve/giro-ocr-forwardings/print', { data: deletedRows });
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'giroOcrPblDate' },
    { fieldName: 'giroOcrPblTime' },
    { fieldName: 'giroOcrPblDtm' },
    { fieldName: 'giroOcrPblSeqn' },
    { fieldName: 'giroOcrPblOjStrtdt' },
    { fieldName: 'giroOcrPblOjEnddt' },
    { fieldName: 'giroOcrPblTotQty' },
    { fieldName: 'giroOcrPrntDt' },
    { fieldName: 'giroOcrDlDt' },
    { fieldName: 'giroOcrPblOj' },
    { fieldName: 'giroOcrPrnt' },
    { fieldName: 'giroOcrRead' },
  ];

  const columns = [
    { fieldName: 'giroOcrPblDate',
      header: t('MSG_TXT_FW_DT'),
      datetimeFormat: 'date',
      // header: '발송일자',
      width: '200',
      styleName: 'text-center',
    },
    { fieldName: 'giroOcrPblTime',
      header: t('MSG_TXT_FW_HH'),
      // header: '발송시간',
      width: '200',
      styleName: 'text-center' },
    { fieldName: 'giroOcrPblTotQty',
      header: t('MSG_TXT_WK_QTY'),
      // header: '작업수량',
      width: '200',
      styleName: 'text-right' },
    { fieldName: 'giroOcrPblOj',
      header: t('MSG_TXT_OJ_BCK'),
      // header: '대상구간',
      width: '338',
      styleName: 'text-center' },
    { fieldName: 'giroOcrPrntDt',
      header: t('MSG_TXT_PRNT_DT'),
      // header: '출력일자',
      width: '250',
      styleName: 'text-center',
      datetimeFormat: 'date' },
    { fieldName: 'giroOcrPrnt',
      header: t('MSG_TXT_PRNT'),
      // header: '출력',
      width: '130',
      renderer: { type: 'button' },

      displayCallback(grid, index) {
        const { giroOcrPrntDt } = grid.getValues(index.itemIndex);
        if (giroOcrPrntDt != null) {
          return '재출력';
        }
        return '출력';
      },
    },
    { fieldName: 'giroOcrRead',
      header: t('MSG_TXT_ONE_BRWS'),
      // header: '한장씩 보기',
      width: '130',
      renderer: { type: 'button' } },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  // 체크박스 설정
  // view.onCellClicked = (grid, clickData) => {
  //   if (clickData.cellType === 'data') {
  //     grid.checkItem(clickData.itemIndex, !grid.isCheckedItem(clickData.itemIndex));
  //   }
  // };

  view.onCellItemClicked = async (g, { column, dataRow }) => {
    const cwwDte = g.getValue(dataRow, 'giroOcrPblDtm');
    const cwpSeq = g.getValue(dataRow, 'giroOcrPblSeqn');

    if (column === 'giroOcrPrnt') {
      // openReportPopup('/BIZ0000003.ozr', '/BIZ0000003.odi', JSON.stringify({ cwwDte, cwpSeq }));

      const paramData = {
        giroOcrPblDtm: cwwDte,
        giroOcrPblSeqn: cwpSeq,
      };
      await dataService.post('/sms/wells/withdrawal/idvrve/giro-ocr-forwardings/print/date', paramData);

      const options = { directPrint: 'Y' };

      openReportPopupWithOptions('ksswells/hdof/giro/BIZ0000003-3.ozr', 'ksswells/hdof/giro/BIZ0000003.odi', JSON.stringify({ cwwDte, cwpSeq }), options);
      // openReportPopupWithOptions('/BIZ0000003.ozr', '/BIZ0000003.odi', JSON.stringify({ cwwDte, cwpSeq }), options);

      await fetchData();
    }
    if (column === 'giroOcrRead') {
      openReportPopup('ksswells/hdof/giro/BIZ0000003-3.ozr', 'ksswells/hdof/giro/BIZ0000003.odi', JSON.stringify({ cwwDte, cwpSeq }));
    }

    // else if (column === 'giroOcrRead') {
    //   openReportPopup('/BIZ0000003.ozr', '/BIZ0000003.odi', JSON.stringify({ cwwDte, cwpSeq }));
    // }
  };

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});
</script>

<style scoped>
</style>
