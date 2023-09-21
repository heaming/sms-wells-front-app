<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : idvrve
2. 프로그램 ID : WwwdbBillingDocumentMgtM - 청구서 관리
3. 작성자 : heungjun.lee
4. 작성일 : 2023.02.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 청구서 관리 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_CST_NM')"
          required
        >
          <!-- label="고객명" -->
          <kw-input
            v-model="searchParams.cstFnm"
            icon="search"
            clearable
            :label="t('MSG_TXT_CST_NM')"
            rules="required"
            @click-icon="onClickSearchUser"
          />
          <!-- :readonly="true" -->
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_WRTE_DT')"
        >
          <!-- label="작성일" -->
          <kw-date-picker
            v-model="searchParams.bildcWrteDt"
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
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:create
          :label="t('MSG_BTN_BILDC_WRTE')"
          primary
          dense
          @click="onClickRegP"
        />
        <!-- label="청구서 작성" -->
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

import { codeUtil, defineGrid, getComponentType, gridUtil, modal, useDataService, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const now = dayjs();

const dataService = useDataService();
const { t } = useI18n();

const { currentRoute } = useRouter();
const { getConfig } = useMeta();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  cstFnm: '',
  bildcWrteDt: now.format('YYYYMMDD'),
  bildcWrteDtTest: now.format('YYYYMMDD'),
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

let cachedParams;

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/billing-document-orders/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();

  const data = view.getDataSource();
  data.checkRowStates(false);
  data.setRows(pages);
  data.checkRowStates(true);

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/billing-document-orders/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 행삭제
async function onClickRemove() {
  const view = grdMainRef.value.getView();

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length > 0) {
    await dataService.delete('/sms/wells/withdrawal/idvrve/billing-document-orders', { data: deletedRows });
    // notify(t('삭제되었습니다.'));
    // notify(t('MSG_ALT_DELETED'));
    await fetchData();
  }
}

// 청구서 작성
async function onClickRegP() {
  const { result, payload } = await modal({ component: 'WwwdbBillingDocumentRegP' });

  if (result && payload.isSearchChk) {
    searchParams.value.cstFnm = payload.cstFnm;
    await onClickSearch();
  }
}

// 고객명 찾기 이벤트
async function onClickSearchUser() {
  const { result, payload } = await modal({ component: 'ZwcsaCustomerListP',
    componentProps: { cstNm: searchParams.value.cstFnm, cstType: '1' } });

  if (result) {
    searchParams.value.cstFnm = payload.name;
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'bildcFwDtm' }, // 발송일자
    { fieldName: 'bildcPblNo' },
    { fieldName: 'bildcPblSn' },
    { fieldName: 'cstFnm' }, // --고객성명
    { fieldName: 'pdNm' }, // --상품명
    { fieldName: 'pdQty' }, // 수량
    { fieldName: 'pdQtySum' }, // --총수량
    { fieldName: 'pdSellAmt' }, // --판매금액
    { fieldName: 'pdSellAmtSum', dataType: 'number' }, // --총금액
    // { fieldName: 'rmkCn' }, // --비고 이건 수정 가능성이 잇음
    { fieldName: 'bildcWrteDt' }, // --작성일자
    { fieldName: 'dummyText' }, // --발송
    { fieldName: 'sellPrtnrNo' }, /* 파트너번호 */
    { fieldName: 'sellPrtnrNm' }, /* 파트너번호 */

  ];

  const columns = [
    { fieldName: 'cstFnm',
      header: t('MSG_TXT_CST_NM'),
      // , header: '고객명'
      width: '150' },
    { fieldName: 'bildcWrteDt',
      header: t('MSG_TXT_WRTE_DT'),
      // , header: '작성일자'
      width: '200',
      styleName: 'text-center',
      datetimeFormat: 'date' },
    { fieldName: 'bildcFwDtm',
      header: t('MSG_TXT_FW_DT'),
      // , header: '발송일자'
      width: '200',
      styleName: 'text-center',
      datetimeFormat: 'date' },
    { fieldName: 'pdNm',
      header: t('MSG_TXT_PRDT_NM'),
      // , header: '상품명'
      width: '200',
      styleName: 'rg-button-link',
      renderer: { type: 'button' } },
    { fieldName: 'pdQtySum',
      header: t('MSG_TXT_TOT_QTY'),
      // , header: '총수량'
      width: '100',
      styleName: 'text-right' },
    { fieldName: 'pdSellAmtSum',
      header: t('MSG_TXT_TOT_AMT'),
      // , header: '총금액(원)'
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    // { fieldName: 'rmkCn',
    //   header: t('MSG_TXT_NOTE'),
    //   // , header: '비고'
    //   width: '296',
    //   styleName: 'text-left' },
    { fieldName: 'dummyText',
      header: t('MSG_TXT_BILDC_FW'),
      // , header: '청구서 발송'
      width: '150',
      styleName: 'text-center',
      renderer: { type: 'button' } }, // 나중에 이건 수정하자
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  // view.onCellClicked = (grid, clickData) => {
  //   if (clickData.cellType === 'data') {
  //     grid.checkItem(clickData.itemIndex, !grid.isCheckedItem(clickData.itemIndex));
  //   }
  // };

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'pdNm') {
      const bildcPblNo = g.getValue(itemIndex, 'bildcPblNo');
      const cstFnm = g.getValue(itemIndex, 'cstFnm');
      const bildcWrteDt = g.getValue(itemIndex, 'bildcWrteDt');
      const bildcPblSn = g.getValue(itemIndex, 'bildcPblSn');
      const { result, payload } = await modal({
        component: 'WwwdbBillingDocumentRegP',
        componentProps: { bildcPblNo, cstFnm, bildcWrteDt, bildcPblSn },
      });

      if (result && payload.isSearchChk) {
        searchParams.value.cstFnm = payload.cstFnm;
        onClickSearch();
      }
    }
    if (column === 'dummyText') {
      const bildcPblNo = g.getValue(itemIndex, 'bildcPblNo');
      const cstFnm = g.getValue(itemIndex, 'cstFnm');
      const pdNm = g.getValue(itemIndex, 'pdNm');
      const pdQtySum = g.getValue(itemIndex, 'pdQtySum');
      const pdSellAmtSum = g.getValue(itemIndex, 'pdSellAmtSum');
      const bildcPblSn = g.getValue(itemIndex, 'bildcPblSn');
      const { result } = await modal({
        component: 'WwwdbBillingDocumentFwRegP',
        componentProps: { bildcPblNo, cstFnm, pdNm, pdQtySum, pdSellAmtSum, bildcPblSn },
      });
      if (result) {
        fetchData();
      }
    }
  };
});
</script>
