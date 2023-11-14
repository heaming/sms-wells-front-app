<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaMovementStorePsListM(W-SV-U-0109M01) - 이동입고 현황
 3. 작성자 : songTaeSung
 4. 작성일 : 2023.02.11
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 이동입고현황 관리 (http://localhost:3000/#/service/wwsna-movement-store-ps-list)
 ****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 입고창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_STR_WARE')"
          required
        >
          <kw-select
            v-model="searchParams.strOjWareNo"
            :options="warehouses"
            :label="$t('MSG_TXT_STR_WARE')"
            rules="required"
          />
        </kw-search-item>
        <!-- 입고유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_STR_TP')"
        >
          <kw-select
            v-model="searchParams.strTpCd"
            :options="strTpCds"
            first-option="all"
          />
        </kw-search-item>
        <!-- 입고일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_STR_DT')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.stStrDt"
            v-model:to="searchParams.edStrDt"
            rules="required|date_range_months:1"
            :label="$t('MSG_TXT_STR_DT')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 출고창고구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_WARE_DV')"
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :options="codes.WARE_DV_CD"
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
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
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

import { useDataService, codeUtil, defineGrid, getComponentType, gridUtil, useGlobal, useMeta } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import useSnCode from '~sms-wells/service/composables/useSnCode';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const store = useStore();
const { currentRoute } = useRouter();

const { t } = useI18n();
const { getMonthWarehouse } = useSnCode();
const { getConfig } = useMeta();
const { notify, modal } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const searchParams = ref({
  stStrDt: '',
  edStrDt: '',
  strOjWareNo: '',
  strTpCd: '',
  wareDvCd: '2',
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'STR_TP_CD',
  'WARE_DV_CD',
  'PD_GD_CD',
  'ITM_KND_CD',
  'USE_YN',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 입고유형 필터링
const strTpCds = codes.STR_TP_CD.filter((v) => v.codeId !== '110');

const wharehouseParams = ref({
  apyYm: dayjs().format('YYYYMM'),
  userId: store.getters['meta/getUserInfo'].employeeIDNumber,
});

searchParams.value.stStrDt = dayjs().format('YYYYMMDD');
searchParams.value.edStrDt = dayjs().format('YYYYMMDD');

let cachedParams;

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/movement-stores/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: moveMentItem, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(moveMentItem.map((v) => ({ ...v, strDelButn: ' ' })));
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/movement-stores/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

// 조회버튼 클릭이벤트
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

const warehouses = ref();

// 화면로드시 조회
async function fetchDefaultData() {
  const { userId, apyYm } = wharehouseParams.value;

  warehouses.value = await getMonthWarehouse(userId, apyYm);
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
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'strTpCd' }, // 입고유형코드
    { fieldName: 'strTpNm' }, // 입고유형명
    { fieldName: 'strWareNo' }, // 입고창고번호
    { fieldName: 'strWareNm' }, // 입고창고명
    { fieldName: 'strRgstDt' }, // 입고등록일자
    { fieldName: 'dlvgDlpnrNo' }, // 납품거래처번호
    { fieldName: 'itmStrNo' }, // 품목입고번호
    { fieldName: 'strSn' }, // 입고순번
    { fieldName: 'ostrTpCd' }, // 출고유형코드
    { fieldName: 'ostrWareNo' }, // 출고창고번호
    { fieldName: 'ostrWareNm' }, // 출고창고명
    { fieldName: 'strHopDt' }, // 입고희망일자
    { fieldName: 'ostrDt' }, // 출고일자
    { fieldName: 'itmOstrNo' }, // 품목출고번호
    { fieldName: 'ostrSn' }, // 출고순번
    { fieldName: 'strDelButn' }, // 비고
    { fieldName: 'wareDtlDvCd' }, // 입고창고상세구분
  ];

  const columns = [
    { fieldName: 'strRgstDt', header: t('MSG_TXT_STR_DT'), width: '126', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'strTpCd', header: t('MSG_TXT_STR_TP'), width: '126', styleName: 'text-center', options: codes.STR_TP_CD },
    { fieldName: 'itmStrNo', header: t('MSG_TXT_STR_MNGT_NO'), width: '240', styleName: 'text-center' },
    { fieldName: 'ostrWareNm', header: t('MSG_TXT_OSTR_WARE'), width: '182', styleName: 'text-center' },
    { fieldName: 'itmOstrNo', header: t('MSG_TXT_OSTR_MNGT_NO'), width: '240', styleName: 'text-center' },
    { fieldName: 'strDelButn',
      header: t('MSG_TXT_NOTE'),
      width: '126',
      styleName: 'text-center',
      renderer: {
        type: 'button',
      },
      displayCallback: () => t('MSG_TXT_STR_DEL'),
    },
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (g, { dataRow }) => {
    const {
      strRgstDt,
      strTpCd,
      strTpNm,
      itmStrNo,
      strWareNo,
      strWareNm,
      ostrWareNo,
      ostrWareNm,
      ostrSn,
      strHopDt,
      wareDtlDvCd,
    } = gridUtil.getRowValue(g, dataRow);

    const { result: isChanged } = await modal({
      component: 'WwsnaMovementStoreRegP',
      componentProps: {
        strRgstDt,
        strTpCd,
        strTpNm,
        itmStrNo,
        strWareNo,
        strWareNm,
        ostrWareNo,
        ostrWareNm,
        ostrSn,
        strHopDt,
        flagChk: 1,
        strWareDtlDvCd: wareDtlDvCd,
      },
    });

    if (isChanged) {
      notify(t('MSG_ALT_SAVE_DATA'));
      await fetchData();
    }
  };
});
</script>
