<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDA
2. 프로그램 ID : WwwdaResultBundleErrorM - 자동이체결과 체크리스트(묶음출금 오등록) (W-WD-U-0035M04)
3. 작성자 : donghyun.yoo
4. 작성일 : 2023.02.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
계좌/카드 자동이체 생성자료 조회 및 오류체크 구분별 조회
****************************************************************************************************
--->
<template>
  <kw-search
    one-row
    :cols="2"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="t('MSG_TXT_AUTO_FNT')"
        required
      >
        <kw-option-group
          v-model="searchParams.mpyMthdTpCd"
          :label="t('MSG_TXT_AUTO_FNT')"
          type="radio"
          rules="required"
          :options="codes.MPY_MTHD_TP_CD.filter(v => v.codeId === '110' || v.codeId === '120')"
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
        :disable="pageInfo.totalCount === 0"
        icon="download_on"
        dense
        secondary
        :label="t('MSG_BTN_EXCEL_DOWN')"
        @click="onClickExcelDownload"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMainRef"
      name="grdMain3"
      :visible-rows="10"
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

import { useDataService, codeUtil, defineGrid, useMeta, getComponentType } from 'kw-lib';

const dataService = useDataService();
const { getConfig } = useMeta();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD', // 판매유형코드
  'MPY_MTHD_TP_CD', // 납부방식유형코드
  'COD_PAGE_SIZE_OPTIONS',
);

const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  mpyMthdTpCd: '110', // 자동이체 체크
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/result-bundle-error', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = { ...searchParams.value };
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'mstrSellTpCd' },
    { fieldName: 'dgCntrNo' },
    { fieldName: 'mstrMpyMthdTpCd' },
    { fieldName: 'subSellTpCd' },
    { fieldName: 'subodCntrNo' },
    { fieldName: 'subMpyMthdTpCd' },
    { fieldName: 'errTyp' },
  ];

  const columns = [
    { fieldName: 'mstrSellTpCd', header: t('MSG_TXT_DG_ORD_SELL_TP'), width: '200', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'dgCntrNo', header: t('MSG_TXT_DG_CNTR_NO'), width: '200', styleName: 'text-center' },
    { fieldName: 'mstrMpyMthdTpCd', header: t('MSG_TXT_DG_ORD_FNT_DV'), width: '200', styleName: 'text-center', options: codes.MPY_MTHD_TP_CD },
    { fieldName: 'subSellTpCd', header: t('MSG_TXT_BNDL_ORD_SELL_TP'), width: '200', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'subodCntrNo', header: t('MSG_TXT_BNDL_CNTR_NO'), width: '200', styleName: 'text-center' },
    { fieldName: 'subMpyMthdTpCd', header: t('MSG_TXT_BNDL_ORD_FNT_DV'), width: '159', styleName: 'text-center', options: codes.MPY_MTHD_TP_CD },
    { fieldName: 'errTyp', header: t('MSG_TXT_ERR_RGST_IZ'), width: '300', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
