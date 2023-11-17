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
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_AK_WARE')"
          required
        >
          <kw-select
            v-model="searchParams.strOjWareNo"
            :options="warehouses"
            first-option="select"
            :label="$t('MSG_TXT_OSTR_AK_WARE')"
            rules="required"
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
        <kw-search-item
          :label="$t('MSG_TXT_STR_HOP_DT')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.startStrHopDt"
            v-model:to="searchParams.endStrHopDt"
            :label="$t('MSG_TXT_STR_HOP_DT')"
            rules="required|date_range_months:1"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 출고요청접수창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_AK_RCP_WARE')"
          required
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :options="codes.WARE_DV_CD"
            :label="$t('MSG_TXT_OSTR_AK_RCP_WARE')"
            rules="required"
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
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 출고요청등록 버튼 -->
        <kw-btn
          v-permission:create
          primary
          dense
          :label="$t('MSG_TXT_OSTR_AK_RGST')"
          @click="onClickRegistration"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
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
import { codeUtil, getComponentType, useGlobal, useDataService, useMeta, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import useSnCode from '~sms-wells/service/composables/useSnCode';

const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();

const { getConfig } = useMeta();
const { modal, notify } = useGlobal();
const store = useStore();

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

const wharehouseParams = ref({
  apyYm: dayjs().format('YYYYMM'),
  // WM : 1642720
  userId: store.getters['meta/getUserInfo'].employeeIDNumber,
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

// 출고요청구분코드 필터링
codes.OSTR_AK_TP_CD.forEach((e) => {
  if (e.codeId === '310' || e.codeId === '320'
    || e.codeId === '330') {
    filterCodes.value.filterOstrAkTpCd.push({
      codeId: e.codeId.trim(),
      codeName: e.codeName.trim(),
    });
  }
});

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/out-of-storage-asks/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: newOutOfStorageAsks, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(newOutOfStorageAsks);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 조회버튼 클릭이벤트
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/out-of-storage-asks/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    checkBar: 'hidden',
    exportData: res.data,
    allColumns: false,
    hideColumns: ['itmNm'],
  });
}

// 출고요청등록 버튼클릭 이벤트
async function onClickRegistration() {
  const { result: isChanged } = await modal({
    component: 'WwsnaOutOfStorageAskRegP',
  });

  if (isChanged) {
    notify(t('MSG_ALT_REGISTERED'));
    await onClickSearch();
  }
}

// 화면로드시 조회
const warehouses = ref();
async function fetchDefaultData() {
  const { apyYm } = wharehouseParams.value;
  const { userId } = wharehouseParams.value;

  warehouses.value = await getMonthWarehouse(userId, apyYm);
  if (!isEmpty(warehouses.value)) {
    searchParams.value.strOjWareNo = warehouses.value[0].codeId;
  }
}

async function openOutOfStorageP(g, { column, dataRow }) {
  console.log(g, { column, dataRow });
  const { ostrAkNo } = gridUtil.getRowValue(g, dataRow);
  const { ostrAkTpCd } = gridUtil.getRowValue(g, dataRow);
  const { ostrAkRgstDt } = gridUtil.getRowValue(g, dataRow);
  const { strOjWareNo } = gridUtil.getRowValue(g, dataRow);

  const { result } = await modal({
    component: 'WwsnaOutOfStorageAskRegP',
    componentProps: { ostrAkNo, ostrAkTpCd, ostrAkRgstDt, strOjWareNo },
  });

  if (result) {
    await fetchData();
  }
}

// 초기화 버튼 클릭
function onClickReset() {
  if (!isEmpty(warehouses.value)) {
    searchParams.value.strOjWareNo = warehouses.value[0].codeId;
  }
}

onMounted(async () => {
  await fetchDefaultData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrdMain(data, view) {
  const fields = [
    { fieldName: 'strHopDt' }, // 입고희망일자
    { fieldName: 'ostrAkTpNm' }, // 출고요청구분명
    { fieldName: 'ostrAkNo' }, // 출고요청번호
    { fieldName: 'rectOstrDt' }, // 최근출고일자
    { fieldName: 'lgstOstrAkNo' }, // 물류출고요청번호
    { fieldName: 'wareNm' }, // 창고명
    { fieldName: 'itmNm' }, // 품목명
    { fieldName: 'ostrAkTpCd' }, // 출고요청유형코드
    { fieldName: 'ostrOjWareNo' }, // 출고대상창고번호
    { fieldName: 'ostrAkRgstDt' }, // 출고요청등록일자
    { fieldName: 'strOjWareNo' }, // 입고대상창고번호
  ];

  const columns = [
    { fieldName: 'strHopDt', header: t('MSG_TXT_STR_HOP_D'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'ostrAkTpNm', header: t('MSG_TXT_OSTR_AK_TP'), width: '150', styleName: 'text-center' },
    { fieldName: 'ostrAkNo',
      header: t('MSG_TXT_OSTR_AK_NO'),
      width: '250',
      styleName: 'text-center',
      displayCallback: (g, i, v) => {
        if (isEmpty(v)) {
          return v;
        }
        const regExp = /^(\d{3})(\d{8})(\d{7}).*/;
        return v.replace(regExp, '$1-$2-$3');
      },
    },
    { fieldName: 'lgstOstrAkNo',
      header: t('MSG_TXT_LGST_OSTR_AK_NO'),
      width: '250',
      styleName: 'text-center',
      displayCallback: (g, i, v) => {
        if (isEmpty(v)) {
          return v;
        }
        const regExp = /^(\w{4})(\d{8})(\d{4}).*/;
        return v.replace(regExp, '$1-$2-$3');
      } },
    { fieldName: 'wareNm', header: t('MSG_TXT_OSTR_AK_RCP_WARE'), width: '150', styleName: 'text-center' },
    { fieldName: 'rectOstrDt', header: t('MSG_TXT_RECT_STR_DT'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'itmNm',
      header: t('MSG_TXT_NOTE'),
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
    if (column === 'itmNm') {
      await openOutOfStorageP(g, { column, dataRow });
    }
  };
  // eslint-disable-next-line no-unused-vars
  view.onCellDblClicked = async (g, { column, dataRow }) => {
    await openOutOfStorageP(g, { column, dataRow });
  };
}
</script>
