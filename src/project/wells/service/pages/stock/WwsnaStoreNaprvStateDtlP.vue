<!--
 ***************************************************************************************************
 * 프로그램 개요
 ***************************************************************************************************
 1. 모듈 : 입고 미승인상세현황
 2. 프로그램 ID : K-W-SV-U-0176P01
 3. 작성자 : heymi.cho
 4. 작성일 : 2023.06.09
 ***************************************************************************************************
 * 프로그램 설명
 ***************************************************************************************************
 - 출고요청등록 (http://localhost:3000/#/service/wwsna-store-naprv-state-dtl)
 ***************************************************************************************************
-->

<template>
  <kw-popup
    class="kw-popup--2xl"
    :title="$t('MSG_TIT_STR_UNAPPR_DTL')"
  >
    <kw-search
      :cols="4"
      class="px10 pt10"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_STR_TP')"
        >
          <kw-select
            v-model="searchParams.strTpCd"
            :options="codes.STR_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_STR_DT')"
          :colspan="2"
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDate"
            v-model:to="searchParams.endDate"
            type=""
            rules="date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item
          v-model="searchParams.ostrWareDvCd"
          :label="$t('MSG_TXT_OSTR_WARE')"
        >
          <kw-select
            v-model="searchParams.ostrWareDvCd"
            :options="codes.WARE_DV_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <kw-action-top class="mb20">
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
        dense
        secondary
        :label="$t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <kw-btn
        secondary
        dense
        icon="download_on"
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="!pageInfo.totalCount"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
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
import { codeUtil, getComponentType, gridUtil, useDataService, defineGrid } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
// import useSnCode from '~sms-wells/service/composables/useSnCode';

// const { t } = useI18n();
const dataService = useDataService();
// const { ok } = useModal();

// const { notify } = useGlobal();
const { currentRoute } = useRouter();
// const userInfo = getters['meta/getUserInfo'];
const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;

/*
 *  Parent Parameter를 가져오기 위한 변수 선언
 */
const props = defineProps({
  strWareNo: { type: String, default: '', required: true }, // 입고창고번호
  itmPdCd: { type: String, default: '', required: true }, // 품목번호
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'STR_TP_CD',
  'WARE_DV_CD',
);

/*
 *  Page Info setting
 */
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

/*
 *  Search Parameter
 */
const searchParams = ref({
  // strWareNo: props.strWareNo,
  // itmPdCd: props.itmPdCd,
  strTpCd: '', // 입고유형
  startDate: `${now.format('YYYYMM')}01`, // 입고일자
  endDate: now.format('YYYYMMDD'),
  ostrWareDvCd: '', // 출고창고유형
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchData() {
  console.log(searchParams.data);
  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/store-naprv-state-dtl/paging', { params: { strWareNo: props.strWareNo, itmPdCd: props.itmPdCd, ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  console.log(res.data);

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(state);
  view.resetCurrent();

  await gridUtil.reset(view);
}

/*
 *  Search - 조회
 */
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/out-of-storage-asks/out-of-storage-items/excel-download', { params: searchParams.value });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// async function onClickSave() {
//   const view = grdMainRef.value.getView();
//   const checkedRows = gridUtil.getCheckedRowValues(view);
//   if (checkedRows.length === 0) {
//     notify(t('MSG_ALT_NOT_SELECT_OSTR'));
//     return;
//   }

//   if (!(await gridUtil.validate(view, { isCheckedOnly: true }))) { return; }

//   const chkOstrAkTpCd = searchParams.value.ostrAkTpCd;

//   for (let i = 0; i < checkedRows.length; i += 1) {
//     const chkWarehouseQty = checkedRows[i].warehouseQty;
//     const chkOstrAkQty = checkedRows[i].ostrAkQty;
//     const chkRectOstrDt = checkedRows[i].rectOstrDt;
//     const chkOstrAkNo = searchParams.value.ostrAkNo;

// eslint-disable-next-line max-len
//     if (chkOstrAkTpCd === '310' && searchParams.value.ostrOjWareNo.substring(0, 1) === '3' && chkWarehouseQty === 0) {
//       notify(t('MSG_ALT_NO_OSTR_WARE_STOC'));
//       return;
//     }
//     if (chkOstrAkQty <= 0) {
//       notify(t('MSG_ALT_OSTR_QTY_ZERO_BE_BIG'));
//       return;
//     }

//     if (!isEmpty(chkRectOstrDt)) {
//       notify(t('MSG_ALT_ARDY_OSTR', [t('MSG_TXT_MOD')]));
//       return;
//     }

//     if (!isEmpty(chkOstrAkNo)) {
//       checkedRows[i].ostrAkNo = chkOstrAkNo;
//     }
// eslint-disable-next-line max-len
//     const result = await dataService.post('/sms/wells/service/out-of-storage-asks', checkedRows.map((v) => ({ ...v, ...params })));
//     if (result > 0) {
//       notify(t('MSG_ALT_SAVE_DATA'));
//     }
//     // await fetchOstrAkDataItem();
//     ok();
//   }
// }

// onMounted(async () => {
//   let searchFlag = false;

//   if (!isEmpty(props.ostrAkNo)) {
//     searchParams.value.ostrAkNo = props.ostrAkNo;
//     searchFlag = true;
//   } else {
//     await fetchDefaultData();
//   }

//   if (searchFlag) await fetchOstrAkDataItem();
// });

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'strRgstDt' },
    { fieldName: 'strWareNm' },
    { fieldName: 'strTpCd' },
    { fieldName: 'itmStrNo' },
    { fieldName: 'ostrWareNm' },
    { fieldName: 'itmPdCd' },
  ];

  const columns = [
    { fieldName: 'strRgstDt', header: '입고일자', width: '100', styleName: 'text-center' },
    { fieldName: 'strWareNm', header: '입고창고', width: '150', styleName: 'text-center' },
    { fieldName: 'strTpCd', header: '입고유형', width: '120', styleName: 'text-center' },
    { fieldName: 'itmStrNo', header: '입고관리번호', width: '250', styleName: 'text-center' },
    { fieldName: 'ostrWareNm', header: '출고창고', width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: '품목코드', width: '93', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setFooters({ visible: true });
  view.setOptions({ summaryMode: 'aggregate' });

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  // view.onCellClicked = async (grid, { column, dataRow }) => {
  //   if (column === 'itmPdCd') {
  //     await onClickItemPop('U', dataRow);
  //   }
  // };

  // view.onGetEditValue = async (grid, index, editResult) => {
  //   grid.checkItem(index.itemIndex, true);
  //   if (index.fieldName === 'ostrAkQty') {
  //     changeOstrAkQty(index.dataRow, editResult.value);
  //   }
  // };
});

</script>
