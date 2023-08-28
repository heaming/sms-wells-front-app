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
 - 입고 미승인상세현황 팝업 (http://localhost:3000/#/service/wwsna-store-naprv-state-dtl)
 ***************************************************************************************************
-->

<template>
  <kw-popup size="2xl">
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
            type="date"
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
        :disable="pageInfo.totalCount === 0"
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
        :disable="pageInfo.totalCount === 0"
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
import { codeUtil, getComponentType, gridUtil, useDataService, defineGrid, useGlobal, useModal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const now = dayjs();
const { notify } = useGlobal();
const { getters } = useStore();
const { currentRoute } = useRouter();
const { ok } = useModal();
const dataService = useDataService();

const props = defineProps({
  strWareNo: { type: String, default: '', required: true }, // 입고창고번호
  itmPdCd: { type: String, default: '', required: true }, // 품목번호
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;

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

async function fetchData() {
  const params = { strWareNo: props.strWareNo, itmPdCd: props.itmPdCd, ...cachedParams, ...pageInfo.value };
  console.log(params);
  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/store-not-approve-detail/paging', { params: { strWareNo: props.strWareNo, itmPdCd: props.itmPdCd, ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

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
  console.log(cachedParams);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/store-not-approve-detail/excel-download', { params: searchParams.value });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

const { userId } = getters['meta/getUserInfo'];

/*
 *  Save - 입고 미승인상세정보 저장
*/
async function onClickSave() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  // eslint-disable-next-line max-len
  await dataService.post('/sms/wells/service/store-not-approve-detail/confirmation', checkedRows.map((v) => ({
    userId,
    strWareNo: props.strWareNo,
    ...v,
  })));

  notify(t('MSG_ALT_SAVE_DATA'));
  ok();
}

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
    { fieldName: 'itmGdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'strQty', dataType: 'number' },
    { fieldName: 'itmOstrNo' },
    { fieldName: 'ostrSn' },
    { fieldName: 'strSn' },

  ];

  const columns = [
    { fieldName: 'strRgstDt', header: t('MSG_TXT_STR_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'strWareNm', header: t('MSG_TXT_WARE_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'strTpCd', header: t('MSG_TXT_STR_TP'), width: '120', styleName: 'text-center', options: codes.STR_TP_CD },
    { fieldName: 'itmStrNo', header: t('MSG_TXT_STR_MNGT_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'ostrWareNm', header: t('MSG_TXT_OSTR_WARE'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'itmGdCd', visible: false },
    { fieldName: 'pdNm', header: t('MSG_TXT_MATI_NM'), width: '250', styleName: 'text-center' },
    { fieldName: 'strQty', header: t('MSG_TXT_STR_QTY'), width: '100', styleName: 'text-center', dataType: 'number' },
    { fieldName: 'itmOstrNo', visible: false },
    { fieldName: 'ostrSn', visible: false },
    { fieldName: 'strSn', visible: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setFooters({ visible: true });
  view.setOptions({ summaryMode: 'aggregate' });

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});

</script>
