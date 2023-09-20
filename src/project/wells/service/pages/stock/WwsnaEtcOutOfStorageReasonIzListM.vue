<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaEtcOutOfStorageReasonIzListM(W-SV-U-0274M01) - 기타출고 사유내역
3. 작성자 : songTaeSung
4. 작성일 : 2023.01.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 기타출고 사유내역 (http://localhost:3000/#/service/wwsna-etc-out-of-storage-reason-iz-list)
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="9"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 출고일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_DT')"
          :colspan="3"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.stOstrDt"
            v-model:to="searchParams.edOstrDt"
            rules="required|date_range_months:1"
            :label="$t('MSG_TXT_OSTR_DT')"
          />
        </kw-search-item>
        <!-- 서비스센터 -->
        <!-- <kw-search-item :label="$t('MSG_TXT_SV_CNR')">
          <kw-select
            v-model="searchParams.ostrWareNo"
            :options="center"
            first-option="all"
          />
        </kw-search-item> -->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.startDt"
          v-model:end-ym="searchParams.endDt"
          v-model:options-ware-dv-cd="wareDvCd"
          v-model:ware-dv-cd="searchParams.wareDvCd"
          v-model:ware-no-m="searchParams.wareNoM"
          v-model:ware-no-d="searchParams.wareNoD"
          :label1="$t('MSG_TXT_WARE')"
          :label2="$t('MSG_TXT_WARE_DV')"
          :label3="$t('MSG_TXT_HGR_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          sub-first-option="all"
          :colspan="6"
          @update:ware-dv-cd="onChangeStdWareDvCd"
          @update:ware-no-m="onChagneHgrWareNo"
        />
      </kw-search-row>
      <kw-search-row>
        <!-- 청구사유 -->
        <kw-search-item
          :label="$t('MSG_TXT_BIL_RSON')"
          :colspan="3"
        >
          <kw-select
            v-model="searchParams.bilRsonCd"
            :options="codes.BIL_RSON_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 등급 -->
        <kw-search-item
          :label="$t('MSG_TXT_GD')"
          :colspan="3"
        >
          <kw-select
            v-model="searchParams.pdGdCd"
            :options="codes.PD_GD_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 품목구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="3"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 품목코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
          :colspan="3"
        >
          <kw-input
            v-model="searchParams.startItemCd"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.endItemCd"
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
          <span class="ml8">{{ t('MSG_TXT_UNIT_EA') }}</span>
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

import { codeUtil, getComponentType, useDataService, defineGrid, gridUtil, useMeta } from 'kw-lib';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'BIL_RSON_CD',
  'PD_GD_CD',
  'ITM_KND_CD',
);

const wareDvCd = { WARE_DV_CD: [
  { codeId: '2', codeName: t('MSG_TXT_SV_CNR') },
  { codeId: '3', codeName: t('MSG_TXT_BSNS_CNTR') },
] };

const searchParams = ref({
  stOstrDt: dayjs().set('date', 1).format('YYYYMMDD'),
  edOstrDt: dayjs().format('YYYYMMDD'),
  startDt: '',
  endDt: '',
  wareDvCd: '2',
  wareNoM: '',
  wareNoD: '',
  bilRsonCd: '',
  pdGdCd: '',
  itmKndCd: '',
  startItemCd: '',
  endItemCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

function onChangeStdWareDvCd() {
  searchParams.value.wareNoM = '';
  searchParams.value.wareNoD = '';
}

function onChagneHgrWareNo() {
  searchParams.value.wareNoD = '';
}

let cachedParams;
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/etc-out-of-storage-resons/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: etcValue, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(etcValue);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/etc-out-of-storage-resons/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data.list,
  });
}

// 조회버튼 클릭이벤트
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

onMounted(async () => {
  searchParams.value.startDt = dayjs().format('YYYYMMDD');
  searchParams.value.endDt = dayjs().format('YYYYMMDD');
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' },
    { fieldName: 'itmPdCd' },
    { fieldName: 'itemNm' },
    { fieldName: 'itmGdCd' },
    { fieldName: 'ostrDt' },
    { fieldName: 'ostrQty', dataType: 'number' },
    { fieldName: 'csmrUprcAmt', dataType: 'number' },
    { fieldName: 'totalAmt', dataType: 'number' },
    { fieldName: 'deptNm' },
    { fieldName: 'ostrRsonCd' },
    { fieldName: 'wareNm' },
    { fieldName: 'rmkCn' },
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '146', styleName: 'text-center' },
    { fieldName: 'itemNm', header: t('MSG_TXT_ITM_NM'), width: '250' },
    { fieldName: 'itmGdCd', header: t('MSG_TXT_GD'), width: '78', styleName: 'text-center' },
    { fieldName: 'ostrDt',
      header: t('MSG_TXT_OSTR_DT'),
      width: '126',
      styleName: 'text-center',
      datetimeFormat: 'date',
      footer: { text: t('MSG_TXT_SUM') } },
    { fieldName: 'ostrQty',
      header: t('MSG_TXT_QTY'),
      width: '126',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'csmrUprcAmt',
      header: t('MSG_TXT_CSPRC'),
      width: '126',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'totalAmt',
      header: t('MSG_TXT_SUM_AMT'),
      width: '126',
      styleName: 'text-right',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      } },
    { fieldName: 'deptNm', header: t('MSG_TXT_BIL_DEPARTMENT'), width: '140' },
    { fieldName: 'ostrRsonCd', header: t('MSG_TXT_BIL_RSON'), width: '140' },
    { fieldName: 'wareNm', header: t('MSG_TXT_SV_CNR_BZNS_CNR'), width: '160' },
    { fieldName: 'rmkCn', header: t('MSG_TXT_NOTE'), width: '140' },
  ];

  const columnLayout = [
    {
      column: 'sapMatCd', footerUserSpans: [{ colspan: 4 }],
    }, // SAP코드
    'itmPdCd', // 품목코드
    'itemNm', // 품목명
    'itmGdCd', // 등급
    'ostrDt',
    'ostrQty',
    'csmrUprcAmt',
    'totalAmt',
    'deptNm',
    'ostrRsonCd',
    'wareNm',
    'rmkCn',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.setFooters({ visible: true });
  view.setOptions({ summaryMode: 'aggregate' });
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});
</script>
