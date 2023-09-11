<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaOutOfStorageManagementListM - 출고관리
3. 작성자 : songTaeSung
4. 작성일 : 2023-01-27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 출고관리 (http://localhost:3000/#/service/wwsna-out-of-storage-management-list)
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 출고창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_WARE')"
          required
        >
          <kw-select
            v-model="searchParams.ostrWareNo"
            :options="warehouses"
            :label="$t('MSG_TXT_OSTR_WARE')"
            rules="required"
          />
        </kw-search-item>
        <!-- 출고유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_TP')"
        >
          <kw-select
            v-model="searchParams.ostrTpCd"
            :options="filterOstrTpCd"
            first-option="all"
            @change="divideData"
          />
        </kw-search-item>
        <!-- 출고일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_DT')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.stOstrDt"
            v-model:to="searchParams.edOstrDt"
            :label="$t('MSG_TXT_OSTR_DT')"
            rules="required|date_range_months:1"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 입고창고 -->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.stOstrDt"
          v-model:end-ym="searchParams.edOstrDt"
          v-model:options-ware-dv-cd="strWareDvCd"
          v-model:ware-dv-cd="searchParams.strWareDvCd"
          v-model:ware-no-d="searchParams.strWareNoD"
          v-model:ware-no-m="searchParams.strWareNoM"
          first-option="all"
          sub-first-option="all"
          :colspan="2"
          :label1="$t('MSG_TXT_OSTR_PTRM')"
          :label2="$t('MSG_TXT_STR_WARE')"
          :label3="$t('MSG_TXT_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          @update:ware-dv-cd="onChangeWareDvCd"
          @update:ware-no-m="onChagneHgrWareNo"
        />
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
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
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

import { useGlobal, codeUtil, defineGrid, useDataService, getComponentType, gridUtil, popupUtil, useMeta } from 'kw-lib';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import useSnCode from '~sms-wells/service/composables/useSnCode';
import snConst from '~sms-wells/service/constants/snConst';
// 로그인한 사용자의 창고정보 조회

const grdMainRef = ref(getComponentType('KwGrid'));

const dataService = useDataService();

const { t } = useI18n();
const { modal } = useGlobal();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const { getMonthWarehouse } = useSnCode();
const store = useStore();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const searchParams = ref({
  stOstrDt: '',
  edOstrDt: '',
  ostrTpCd: '',
  ostrWareNo: '',
  strWareDvCd: '2',
  strWareNoD: '',
  strWareNoM: '',
  divide: '0',
});

const wharehouseParams = ref({
  apyYm: dayjs().format('YYYYMM'),
  userId: store.getters['meta/getUserInfo'].employeeIDNumber,
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'OSTR_TP_CD',
  'WARE_DV_CD',
);

const filterOstrTpCd = codes.OSTR_TP_CD.filter((v) => v.codeId !== '211');

// 창고구분코드 필터링
const strWareDvCd = { WARE_DV_CD: [
  { codeId: '1', codeName: t('MSG_TXT_LGST_CNR') },
  { codeId: '2', codeName: t('MSG_TXT_SV_CNR') },
  { codeId: '3', codeName: t('MSG_TXT_BSNS_CNTR') },
] };

searchParams.value.stOstrDt = dayjs().format('YYYYMMDD');
searchParams.value.edOstrDt = dayjs().format('YYYYMMDD');

function onChangeWareDvCd() {
  searchParams.value.strWareNoM = '';
  searchParams.value.strWareNoD = '';
}

function onChagneHgrWareNo() {
  searchParams.value.strWareNoD = '';
}

let cachedParams;
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/out-of-storage-itemizations/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: outOfItem, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(outOfItem);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/out-of-storage-itemizations/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

const warehouses = ref();
async function fetchDefaultData() {
  const { apyYm } = wharehouseParams.value;
  const { userId } = wharehouseParams.value;

  warehouses.value = await getMonthWarehouse(userId, apyYm);
  if (!isEmpty(warehouses.value)) {
    searchParams.value.ostrWareNo = warehouses.value[0].codeId;
  }
}

const divideData = (val) => {
  // OSTR_TP_CD_NOM : 정상출고(221)
  // OSTR_TP_CD_QOM : 물량배정(222)
  // OSTR_TP_CD_QOM_MMT : 물량이동 (223)
  // OSTR_TP_CD_RTNGD_INSI : 반품(내부)(261)
  // OSTR_TP_CD_RTNGD_OTSD : 반품(외부)(262)
  // OSTR_TP_CD_DSU : 폐기출고(212)
  // OSTR_TP_CD_ETC : 기타출고(217)
  console.log(val);
  switch (val) {
    case snConst.OSTR_TP_CD_NOM:
      searchParams.value.divide = '1';
      break;
    case snConst.OSTR_TP_CD_QOM:
    case snConst.OSTR_TP_CD_QOM_MMT:
    case snConst.OSTR_TP_CD_RTNGD_INSI:
      searchParams.value.divide = '2';
      break;
    case snConst.OSTR_TP_CD_RTNGD_OTSD:
    case snConst.OSTR_TP_CD_DSU:
    case snConst.OSTR_TP_CD_ETC:
      searchParams.value.divide = '3';
      break;
    default:
      searchParams.value.divide = '0';
  }
  console.log(searchParams.value.divide);
};

onMounted(async () => {
  await fetchDefaultData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ostrTpCd' },
    { fieldName: 'ostrWareNo' },
    { fieldName: 'strWareNo' },
    { fieldName: 'itmOstrNo' },
    { fieldName: 'itmStrNo' },
    { fieldName: 'ostrAkNo' },
    { fieldName: 'ostrAkSn' },
    { fieldName: 'ostrDt' },
    { fieldName: 'strHopDt' },
    { fieldName: 'ostrSn' },
    { fieldName: 'wareNm' },
    { fieldName: 'wareAdrId' },
    { fieldName: 'txtNote' },

  ];

  const columns = [
    { fieldName: 'ostrDt', header: t('MSG_TXT_OSTR_DT'), datetimeFormat: 'date', width: '126', styleName: 'text-center' },
    { fieldName: 'ostrTpCd', header: t('MSG_TXT_OSTR_TP'), options: codes.OSTR_TP_CD, width: '100', styleName: 'text-center' },
    { fieldName: 'itmOstrNo', header: t('MSG_TXT_OSTR_MNGT_NO'), width: '200', styleName: 'text-center' },
    { fieldName: 'wareNm', header: t('MSG_TXT_STR_WARE'), width: '150', styleName: 'text-left' },
    { fieldName: 'itmStrNo', header: t('MSG_TXT_STR_MNGT_NO'), width: '200', styleName: 'text-center' },
    { fieldName: 'txtNote',
      header: t('MSG_TXT_NOTE'),
      width: '150',
      styleName: 'text-center',
      renderer: {
        type: 'button',
      },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (g, { column, dataRow }) => {
    console.log(gridUtil.getRowValue(g, dataRow));
    // eslint-disable-next-line max-len
    const { ostrTpCd, ostrWareNo, ostrDt, strWareNo, itmOstrNo, ostrAkNo, ostrAkSn } = gridUtil.getRowValue(g, dataRow);

    if (column === 'txtNote') {
      if (ostrTpCd === '217') {
        await popupUtil.open(`/popup#/service/wwsna-etc-out-of-storage-reg?ostrTpCd=${ostrTpCd}&ostrWareNo=${ostrWareNo}&bilDept=${strWareNo}&ostrDt=${ostrDt}&itmOstrNo=${itmOstrNo}`, { width: 1800, height: 1000 }, false);
        return;
      } if (['221', '223'].includes(ostrTpCd)) {
        const { result } = await modal({
          component: 'WwsnaNormalOutOfStorageRgstListP',
          componentProps: { ostrAkNo, ostrAkSn, itmOstrNo, page: 'WwsnaOutOfStorageManagementListM' },
        });

        if (result) {
          await fetchData();
        }

        return;
      } if (['212', '261', '262'].includes(ostrTpCd)) {
        // eslint-disable-next-line max-len
        await popupUtil.open(`/popup#/service/wwsna-returning-goods-out-of-storage-reg?ostrTpCd=${ostrTpCd}&ostrWareNo=${ostrWareNo}&ostrDt=${ostrDt}&strWareNo=${strWareNo}&itmOstrNo=${itmOstrNo}`, { width: 1800, height: 1000 }, false);
      }
    }
  };
});

</script>
