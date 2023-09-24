<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDA
2. 프로그램 ID : WwwdaResultBundleErrorListM - 자동이체결과 체크리스트(묶음출금 오등록) (W-WD-U-0035M04)
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
        :label="t('MSG_TXT_FNT_DV')"
        required
      >
        <kw-option-group
          v-model="searchParams.dpTpCd"
          :label="t('MSG_TXT_FNT_DV')"
          type="radio"
          rules="required"
          :options="codes.DP_TP_CD.filter(v => v.codeId === '0102' || v.codeId === '0203')"
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

import { useDataService, codeUtil, defineGrid, getComponentType, gridUtil, useMeta } from 'kw-lib';

const dataService = useDataService();
const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  itemsChecked: {
    type: String,
    required: true,
  },
});

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD', // 판매유형코드
  'DP_TP_CD', // 입금유형코드
  'COD_PAGE_SIZE_OPTIONS',
);

const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  dpTpCd: '0102', // 자동이체 체크
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/result-bundle-error', { params: { ...cachedParams, ...pageInfo.value }, timeout: 300000 });
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

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/result-bundle-error/excel-download', { params: cachedParams, timeout: 300000 });

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${props.itemsChecked}`,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'mstrSellTpCd' },
    { fieldName: 'dgCntrNo' },
    { fieldName: 'mstrDpTpCd' },
    { fieldName: 'subSellTpCd' },
    { fieldName: 'subodCntrNo' },
    { fieldName: 'subDpTpCd' },
    { fieldName: 'errTyp' },
    { fieldName: 'mAcnoEncr' },
    { fieldName: 'sAcnoEncr' },
    { fieldName: 'mCrcdnoEncr' },
    { fieldName: 'sCrcdnoEncr' },
  ];

  const columns = [
    { fieldName: 'mstrSellTpCd', header: t('MSG_TXT_DG_ORD_SELL_TP'), width: '200', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'dgCntrNo', header: t('MSG_TXT_DG_CNTR_NO'), width: '200', styleName: 'text-center' },
    { fieldName: 'mstrDpTpCd', header: t('MSG_TXT_DG_ORD_FNT_DV'), width: '200', styleName: 'text-center', options: codes.DP_TP_CD },
    { fieldName: 'subSellTpCd', header: t('MSG_TXT_BNDL_ORD_SELL_TP'), width: '200', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'subodCntrNo', header: t('MSG_TXT_BNDL_CNTR_NO'), width: '200', styleName: 'text-center' },
    { fieldName: 'subDpTpCd', header: t('MSG_TXT_BNDL_ORD_FNT_DV'), width: '159', styleName: 'text-center', options: codes.DP_TP_CD },
    { fieldName: 'errTyp',
      header: t('MSG_TXT_ERR_RGST_IZ'),
      width: '300',
      styleName: 'text-left',
      displayCallback(grid, item, value) {
        // eslint-disable-next-line max-len
        const { mAcnoEncr: encr, sAcnoEncr: subEcnr, mCrcdnoEncr: cardEncr, sCrcdnoEncr: subCardEncr } = gridUtil.getRowValue(grid, item.itemIndex);
        // eslint-disable-next-line no-nested-ternary
        return value === '01' ? `${t('MSG_TXT_AC_NO_DFRN')} ${encr} /  ${subEcnr}`
          : value === '02' ? `${t('MSG_TXT_CARD_NO_DFRN')} ${cardEncr} / ${subCardEncr}` : value;
      },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
