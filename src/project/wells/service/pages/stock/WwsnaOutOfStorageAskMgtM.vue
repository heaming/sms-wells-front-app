<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaOutOfStorageAskMgtM(W-SV-U-0117M01) - 출고요청 관리
 3. 작성자 : songTaeSung
 4. 작성일 : 2022.12.23
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 출고요청 관리 (http://localhost:3000/#/service/wwsna-out-of-storage-ask-mgt)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <!-- 출고요청창고 -->
        <kw-search-item :label="$t('MSG_TXT_OSTR_AK_WARE')">
          <kw-select
            v-model="searchParams.strOjWareNo"
            :options="warehouses"
          />
        </kw-search-item>
        <!-- 출고요청유형 -->
        <kw-search-item :label="$t('MSG_TXT_OSTR_AK_TP')">
          <kw-select
            v-model="searchParams.ostrAkTpCd"
            :options="filterCodes.filterOstrAkTpCd"
            first-option="all"
          />
        </kw-search-item>
        <!-- 입고희망일자 -->
        <kw-search-item :label="$t('MSG_TXT_STR_HOP_DT')">
          <kw-date-range-picker
            v-model:from="searchParams.startStrHopDt"
            v-model:to="searchParams.endStrHopDt"
            rules="date_range_months:1"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 출고요청접수창고 -->
        <kw-search-item :label="$t('MSG_TXT_OSTR_AK_RCP_WARE')">
          <kw-select
            v-model="searchParams.wareDvCd"
            :options="codes.WARE_DV_CD"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
            @change="fetchData"
          />
        </template>
        <!-- <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        /> -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 출고요청등록 버튼 -->
        <kw-btn
          primary
          dense
          :label="$t('MSG_TXT_OSTR_AK_RGST')"
          @click="onClickRegistration"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :visible-rows="pageInfo.pageSize"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, useGlobal, useDataService, useMeta, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import useSnCode from '~sms-wells/service/composables/useSnCode';

const { t } = useI18n();
const dataService = useDataService();

const { getConfig } = useMeta();
// const { modal, notify, alert } = useGlobal();
const { modal, notify } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

// 로그인한 사용자의 창고정보 조회
const { getMonthWarehouse } = useSnCode();

let cachedParams;
const searchParams = ref({
  strOjWareNo: '', // 입고대상창고번호
  ostrAkTpCd: '', // 출고요청유형코드
  startStrHopDt: dayjs().format('YYYYMMDD'), // 입고희망일자 시작일
  endStrHopDt: dayjs().format('YYYYMMDD'), // 입고희망일자 종료일
  wareDvCd: '1', // 출고요청 창고구분코드
});
const totalCount = ref(0);

const wharehouseParams = ref({
  apyYm: dayjs().format('YYYYMM'),
  // WM : 1642720
  userId: '36680',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'OSTR_AK_TP_CD',
  'WARE_DV_CD',
  'ADM_ZN_CLSF_CD',
);

// 품목구분 필터링
const filterCodes = ref({
  filterOstrAkTpCd: [],
});

codes.OSTR_AK_TP_CD.forEach((e) => {
  if (e.codeId === '310' || e.codeId === '320'
    || e.codeId === '330') {
    filterCodes.value.filterOstrAkTpCd.push({
      codeId: e.codeId.trim(),
      codeName: e.codeName.trim(),
    });
  }
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/out-of-storage-asks', { params: cachedParams });
  const newOutOfStorageAsks = res.data.map((v) => {
    const { codeName } = codes.OSTR_AK_TP_CD.find((c) => c.codeId === v.ostrAkTpCd);
    return { ...v, ostrAkTpNm: codeName };
  });

  const view = grdMainRef.value.getView();
  const outOflength = res.data;
  totalCount.value = outOflength.length;

  view.getDataSource().setRows(newOutOfStorageAsks);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const exportLayout = [
    'strHopDt',
    'ostrAkTpNm',
    'ostrAkNo',
    'rectOstrDt',
    'wareNm',
  ];

  const res = await dataService.get('/sms/wells/service/out-of-storage-asks', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'outOfStorageAskList',
    timePostfix: true,
    exportLayout,
    exportData: res.data.map((v) => {
      const { codeName } = codes.OSTR_AK_TP_CD.find((c) => c.codeId === v.ostrAkTpCd);
      return { ...v, ostrAkTpNm: codeName };
    }),
  });
}

async function onClickRegistration() {
  // TODO: 현재 출고요청등록 팝업화면 개발진행 후 변경 예정
  // alert('현재 단위테스트 대상이아닙니다.');
  const { result: isChanged } = await modal({
    component: 'WwsnaOutOfStorageAskRegP',
  });

  if (isChanged) {
    notify(t('MSG_ALT_REGISTERED'));
    await fetchData();
  }
}

const warehouses = ref();
async function fetchDefaultData() {
  const { apyYm } = wharehouseParams.value;
  const { userId } = wharehouseParams.value;

  warehouses.value = await getMonthWarehouse(userId, apyYm);
  searchParams.value.strOjWareNo = warehouses.value[0].codeId;
}

function searchConditionReset() {
  fetchDefaultData();

  searchParams.value.strOjWareNo = '';
  searchParams.value.ostrAkTpCd = '';
  searchParams.value.startStrHopDt = dayjs().format('YYYYMMDD');
  searchParams.value.endStrHopDt = dayjs().format('YYYYMMDD');
  searchParams.value.wareDvCd = '1';
  searchParams.value.wareLocaraCd = '';
}

function onClickReset() {
  searchConditionReset();
}

onMounted(async () => {
  await fetchDefaultData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrdMain(data, view) {
  const fields = [
    { fieldName: 'strHopDt' },
    { fieldName: 'ostrAkTpNm' },
    { fieldName: 'ostrAkNo' },
    { fieldName: 'rectOstrDt' },
    { fieldName: 'wareNm' },
    { fieldName: 'itmNm' },
    { fieldName: 'ostrAkTpCd' },
    { fieldName: 'ostrOjWareNo' },
    { fieldName: 'ostrAkRgstDt' },
    { fieldName: 'strOjWareNo' },
  ];

  const columns = [
    { fieldName: 'strHopDt', header: t('MSG_TXT_STR_HOP_D'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'ostrAkTpNm', header: t('MSG_TXT_OSTR_AK_TP'), width: '150', styleName: 'text-center' },
    { fieldName: 'ostrAkNo', header: t('MSG_TXT_OSTR_AK_NO'), width: '250', styleName: 'text-center' },
    { fieldName: 'wareNm', header: t('MSG_TXT_OSTR_AK_RCP_WARE'), width: '150', styleName: 'text-center' },
    { fieldName: 'rectOstrDt', header: t('MSG_TXT_RECT_STR_DT'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'itmNm',
      header: t('MSG_TXT_ITM_NM'),
      width: '150',
      styleName: 'text-center',
      renderer: {
        type: 'button',
        hideWhenEmpty: false,
      },
      displayCallback: () => t('MSG_TXT_OSTR_AK_CH'),
    },
  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
  view.setCheckableCallback(() => false);
  view.oncellEdited = (grid, itemIndex) => {
    grid.checkItem(itemIndex, true);
  };

  view.onCellItemClicked = async (g, { column, dataRow }) => {
    console.log(gridUtil.getRowValue(g, dataRow));
    console.log(column);
    // alert('현재 단위테스트 대상이 아닙니다.(개발중)');
    debugger;
    const { ostrAkNo } = gridUtil.getRowValue(g, dataRow);
    const { ostrAkTpCd } = gridUtil.getRowValue(g, dataRow);
    const { ostrAkRgstDt } = gridUtil.getRowValue(g, dataRow);
    const { strOjWareNo } = gridUtil.getRowValue(g, dataRow);

    if (column === 'itmNm') {
      await modal({
        component: 'WwsnaOutOfStorageAskRegP',
        componentProps: { ostrAkNo, ostrAkTpCd, ostrAkRgstDt, strOjWareNo },
      });
    }
  };

  // eslint-disable-next-line no-unused-vars
  view.onCellDblClicked = (grid, clickData) => {
    onClickRegistration();
  };
}
</script>
