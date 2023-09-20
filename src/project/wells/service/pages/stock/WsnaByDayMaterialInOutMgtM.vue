<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNA
2. 프로그램 ID : WsnaByDayMaterialInOutMgtM(K-W-SV-U-0258M01) - 일자별 자재 입출고 관리
3. 작성자 : jaehunlee
4. 작성일 : 2023.09.19
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- 입고 집계 (http://localhost:3000/#/service/wsna-by-day-material-in-out-mgt)
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_WARE')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :label="$t('MSG_TXT_WARE_DV')"
            :options="filterCodes.wareDvCd"
            first-option="all"
            @change="onChangeWareDvCd"
          />
          <kw-select
            v-model="searchParams.hgrWareNo"
            :options="optionsHgrWareNo"
            option-value="wareNo"
            option-label="wareNm"
            first-option="all"
            @change="onChangeHgrWareNo"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_GRP')"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            first-option="all"
            @change="onChangeItmKndCd"
          />
          <kw-select
            v-model="searchParams.itmPdCds"
            :options="optionsItmPdCd"
            option-value="pdCd"
            option-label="pdNm"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_AK_TP')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.ostrAkTpCd"
            :options="filterCodes.OSTR_AK_TP_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_STR_HOP_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.baseDateFrom"
            v-model:to="searchParams.baseDateTo"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_DTRM_YN')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.ostrDtrmYn"
            :options="filterCodes.OSTR_DTRM_YN"
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>

        <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
          @click="onClickPrintEl"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          :label="$t('MSG_BTN_CANC_REL_REQ')"
          dense
          primary
          @click="onClickDelete"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :page-size="pageInfo.pageSize"
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
import { codeUtil, useDataService, useMeta, getComponentType, gridUtil, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import { printElement } from '~common/utils/common';

const dataService = useDataService();
const now = dayjs();
const { getConfig } = useMeta();
const { t } = useI18n();
const { notify, modal } = useGlobal();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const searchParams = ref({
  wareDvCd: '',
  hgrWareNo: '',
  itmKndCd: '',
  itmPdCds: '',
  ostrAkTpCd: '',
  baseDateFrom: now.format('YYYYMMDD'),
  baseDateTo: now.format('YYYYMMDD'),
  ostrDtrmYn: '',
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'WARE_DV_CD',
  'WARE_DTL_DV_CD',
  'ITM_KND_CD',
);

const filterCodes = ref({
  wareDvCd: [],
  wareDtlDvCd: [],
  OSTR_AK_TP_CD: [
    { codeId: '310', codeName: '정상출고' },
    { codeId: '320', codeName: '물량이동' },
    { codeId: '330', codeName: '자동출고' },
  ],
  OSTR_DTRM_YN: [
    { codeId: '1', codeName: '출고완료' },
    { codeId: '2', codeName: '일부출고' },
    { codeId: '3', codeName: '미완료' },
  ],
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

function codeFilter() {
  filterCodes.value.wareDvCd = codes.WARE_DV_CD.filter((v) => ['1', '2'].includes(v.codeId));
}

const optionsHgrWareNo = ref([]);

function wareDtlDvCdFilter() {
  const { wareDvCd } = searchParams.value;
  filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => v.codeId.startsWith(wareDvCd));
}

const getHgrWareNos = async () => {
  // 상위창고번호 클리어
  searchParams.value.hgrWareNo = '';
  optionsHgrWareNo.value = [];
  if (searchParams.value.wareDvCd !== '') {
    const result = await dataService.get(
      '/sms/wells/service/monthly-by-stock-state/ware-houses',
      { params: {
        baseYm: searchParams.value.baseDateFrom.substring(0, 6),
        wareDvCd: searchParams.value.wareDvCd,
      } },
    );
    optionsHgrWareNo.value = result.data;
  }
};

async function onChangeWareDvCd() {
  // 창고세부구분 코드 필터링
  wareDtlDvCdFilter();

  await getHgrWareNos();
}

const optionsItmPdCd = ref();
const optionsAllItmPdCd = ref();

// 품목조회
const getProducts = async () => {
  const result = await dataService.get('/sms/wells/service/monthly-by-stock-state/products');
  optionsItmPdCd.value = result.data;
  optionsAllItmPdCd.value = result.data;
};

// 품목종류 변경 시 품목 필터링
function onChangeItmKndCd() {
  // 품목코드 클리어
  searchParams.value.itmPdCds = [];
  const { itmKndCd } = searchParams.value;

  if (isEmpty(itmKndCd)) {
    optionsItmPdCd.value = optionsAllItmPdCd.value;
    return;
  }

  optionsItmPdCd.value = optionsAllItmPdCd.value.filter((v) => itmKndCd === v.itmKndCd);
}

await Promise.all([
  codeFilter(),
  getProducts(),
]);

let cachedParams;
const grdMainRef = ref(getComponentType('KwGrid'));

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/by-day-material-inout-search/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: itemizations, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(itemizations);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

function getAkNo(ostrAkNo, ostrAkSn) {
  if (isEmpty(ostrAkNo) || isEmpty(ostrAkSn)) return '';
  return `${ostrAkNo}-${ostrAkSn}`;
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRows.length > 0) {
    const result = await dataService.delete('/sms/wells/service/by-day-material-inout-search', { data: [...deletedRows] });
    if (result.data.processCount > 0) {
      notify(t('MSG_ALT_MSG_ALT_APLC_CAN_DATA'));
    } else {
      notify(t('MSG_ALT_PROC_FAIL'));
    }
    await fetchData();
  }
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/by-day-material-inout-search/excel-download', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

const pageRef = ref();
async function onClickPrintEl() {
  printElement(pageRef);
}

async function onClickQty(dt, dtAgo, wareNo, pdCd) {
  await modal({
    component: 'WwsnaDateReceivingAndPayingListP',
    componentProps: {
      itmPdCd: pdCd,
      wareNo,
      strRgstFrom: dtAgo,
      strRgstTo: dt,
    },
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'strHopDt' },
    { fieldName: 'ostrAkTpNm' },
    { fieldName: 'ostrAkNo' },
    { fieldName: 'ostrAkSn' },
    { fieldName: 'ostrWareNm' },
    { fieldName: 'strWareNm' },
    { fieldName: 'sapMatCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'ostrStckQty', dataType: 'number' },
    { fieldName: 'strStckQty', dataType: 'number' },
    { fieldName: 'rgstDtOstrStckQty', dataType: 'number' },
    { fieldName: 'rgstDtstrStckQty', dataType: 'number' },
    { fieldName: 'ostrAkQty', dataType: 'number' },
    { fieldName: 'ostrDt1' },
    { fieldName: 'ostrQty1', dataType: 'number' },
    { fieldName: 'outYn' },
    { fieldName: 'outPeriod' },
    { fieldName: 'sysDt' },
    { fieldName: 'sysDtAgo' },
    { fieldName: 'rgstDt' },
    { fieldName: 'rgstDtAgo' },
    { fieldName: 'strOjWareNo' },
    { fieldName: 'ostrOjWareNo' },
  ];

  const columns = [
    { fieldName: 'strHopDt', header: t('MSG_TXT_STR_HOP_D'), width: '130', styleName: 'text-center' },
    { fieldName: 'ostrAkTpNm', header: t('MSG_TXT_OSTR_AK_TP'), width: '100', styleName: 'text-center' },
    { fieldName: 'ostrAkNo',
      header: t('MSG_BTN_OSTR_AK') + t('MSG_TXT_MGT'),
      width: '200',
      styleName: 'text-center',
      displayCallback: (grid, index) => {
        const { ostrAkNo, ostrAkSn } = grid.getValues(index.dataRow);
        return getAkNo(ostrAkNo, ostrAkSn);
      } },
    { fieldName: 'ostrWareNm', header: t('MSG_TXT_OSTR_WARE'), width: '180', styleName: 'text-center' },
    { fieldName: 'strWareNm', header: t('MSG_TXT_OSTR_AK_WARE'), width: '180', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '200', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '140', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '276', styleName: 'text-left' },
    { fieldName: 'ostrStckQty',
      header: t('MSG_TXT_OSTR_WARE'),
      width: '84',
      styleName: 'text-right rg-button-link',
      renderer: {
        type: 'button',
      } },
    { fieldName: 'strStckQty',
      header: t('MSG_TXT_STR_WARE'),
      width: '84',
      styleName: 'text-right rg-button-link',
      renderer: {
        type: 'button',
      } },
    { fieldName: 'rgstDtOstrStckQty',
      header: t('MSG_TXT_OSTR_WARE'),
      width: '84',
      styleName: 'text-right rg-button-link',
      renderer: {
        type: 'button',
      } },
    { fieldName: 'rgstDtstrStckQty',
      header: t('MSG_TXT_STR_WARE'),
      width: '84',
      styleName: 'text-right rg-button-link',
      renderer: {
        type: 'button',
      } },
    { fieldName: 'ostrAkQty', header: t('MSG_TXT_RQST_QTY'), width: '90', styleName: 'text-right' },
    { fieldName: 'ostrDt1', header: t('MSG_TXT_OSTR_D'), width: '110', styleName: 'text-center' },
    { fieldName: 'ostrQty1', header: t('MSG_TXT_QTY'), width: '84', styleName: 'text-right' },
    { fieldName: 'outYn', header: t('MSG_TXT_OSTR') + t('MSG_TXT_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'outPeriod', header: t('MSG_TXT_OSTR') + t('MSG_TXT_PRD'), width: '80', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  const f = function checked(dataSource, item) {
    // console.log(data.getValue(item.dataRow, 'ppVstPrgsStatCd'));
    if ((data.getValue(item.dataRow, 'outYn') === '미완료')) {
      return true;
    }
    return false;
  };
  view.rowIndicator.visible = true;
  view.setCheckBar({ checkableCallback: f });
  view.setColumnLayout([
    'strHopDt',
    'ostrAkTpNm',
    'ostrAkNo',
    'ostrWareNm',
    'strWareNm',
    'sapMatCd',
    'pdCd',
    'pdNm',
    {
      header: t('MSG_TXT_CURRENT') + t('MSG_TXT_WARE') + t('MSG_TXT_STOC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['ostrStckQty', 'strStckQty'],
    },
    {
      header: t('MSG_TXT_APPL_DATE') + t('MSG_TXT_WARE') + t('MSG_TXT_STOC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['rgstDtOstrStckQty', 'rgstDtstrStckQty'],
    },
    'ostrAkQty',
    {
      header: t('MSG_TXT_1ST') + t('MSG_TXT_OSTR_DTRM'), // colspan title
      direction: 'horizontal', // merge type
      items: ['ostrDt1', 'ostrQty1'],
    },
    'outYn',
    'outPeriod',
  ]);

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    const sysDt = g.getValue(itemIndex, 'sysDt');
    const sysDtAgo = g.getValue(itemIndex, 'sysDtAgo');
    const rgstDt = g.getValue(itemIndex, 'rgstDt');
    const rgstDtAgo = g.getValue(itemIndex, 'rgstDtAgo');
    const strOjWareNo = g.getValue(itemIndex, 'strOjWareNo');
    const ostrOjWareNo = g.getValue(itemIndex, 'ostrOjWareNo');
    const pdCd = g.getValue(itemIndex, 'pdCd');
    if (column === 'ostrStckQty') {
      onClickQty(sysDt, sysDtAgo, ostrOjWareNo, pdCd);
    } else if (column === 'strStckQty') {
      onClickQty(sysDt, sysDtAgo, strOjWareNo, pdCd);
    } else if (column === 'rgstDtOstrStckQty') {
      onClickQty(rgstDt, rgstDtAgo, ostrOjWareNo, pdCd);
    } else if (column === 'rgstDtstrStckQty') {
      onClickQty(rgstDt, rgstDtAgo, strOjWareNo, pdCd);
    }
  };
}
</script>
