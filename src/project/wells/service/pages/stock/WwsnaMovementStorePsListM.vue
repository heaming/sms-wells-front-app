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
        <kw-search-item
          :label="$t('MSG_TXT_STR_WARE')"
        >
          <kw-select
            v-model="searchParams.strOjWareNo"
            :options="warehouses"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_STR_TP')"
        >
          <kw-select
            v-model="searchParams.strTpCd"
            :options="strTpCds"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_STR_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.stStrDt"
            v-model:to="searchParams.edStrDt"
            rules="date_range_months:1"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_WARE')"
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
            :total-count="totalCount"
          />
        </template>

        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { useDataService, codeUtil, defineGrid, getComponentType, gridUtil, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import useSnCode from '~sms-wells/service/composables/useSnCode';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const store = useStore();
const { currentRoute } = useRouter();

const { t } = useI18n();
const { getMonthWarehouse } = useSnCode();
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

const totalCount = ref(0);

const codes = await codeUtil.getMultiCodes(
  'STR_TP_CD',
  'WARE_DV_CD',
  'PD_GD_CD',
  'ITM_KND_CD',
  'USE_YN',
);

// 입고유형 필터링
const strTpCds = codes.STR_TP_CD.filter((v) => v.codeId !== '110');

const wharehouseParams = ref({
  apyYm: dayjs().format('YYYYMM'),
  userId: store.getters['meta/getUserInfo'].employeeIDNumber,
});

searchParams.value.stStrDt = dayjs().format('YYYYMMDD');
searchParams.value.edStrDt = dayjs().format('YYYYMMDD');

let cachedParams;

async function fetchData() {
  console.log(cachedParams);
  const res = await dataService.get('/sms/wells/service/movement-stores', { params: cachedParams });
  const moveMentItem = res.data;
  totalCount.value = moveMentItem.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(moveMentItem.map((v) => ({ ...v, strDelButn: ' ' })));
  view.resetCurrent();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/movement-stores/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

const warehouses = ref();

async function fetchDefaultData() {
  const { userId, apyYm } = wharehouseParams.value;

  warehouses.value = await getMonthWarehouse(userId, apyYm);
  searchParams.value.strOjWareNo = warehouses.value[0].codeId;
}

onMounted(async () => {
  await fetchDefaultData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'strTpCd' },
    { fieldName: 'strTpNm' },
    { fieldName: 'strWareNo' },
    { fieldName: 'strWareNm' },
    { fieldName: 'strRgstDt' },
    { fieldName: 'dlvgDlpnrNo' },
    { fieldName: 'itmStrNo' },
    { fieldName: 'strSn' },
    { fieldName: 'ostrTpCd' },
    { fieldName: 'ostrWareNo' },
    { fieldName: 'ostrWareNm' },
    { fieldName: 'strHopDt' },
    { fieldName: 'ostrDt' },
    { fieldName: 'itmOstrNo' },
    { fieldName: 'ostrSn' },
    { fieldName: 'strDelButn' },
  ];

  const columns = [
    { fieldName: 'strRgstDt', header: t('MSG_TXT_STR_DT'), width: '126', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'strTpCd', header: t('MSG_TXT_STR_TP'), width: '126', styleName: 'text-center', options: codes.STR_TP_CD },
    { fieldName: 'itmStrNo', header: t('MSG_TXT_STR_MNGT_NO'), width: '240', styleName: 'text-center' },
    { fieldName: 'ostrWareNm', header: t('MSG_TXT_OSTR_WARE'), width: '182', styleName: 'text-left' },
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
      },
    });

    if (isChanged) {
      notify(t('MSG_ALT_SAVE_DATA'));
      await fetchData();
    }
  };
});
</script>
<style scoped>
</style>
