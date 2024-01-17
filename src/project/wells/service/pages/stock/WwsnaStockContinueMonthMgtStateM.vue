<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC (재고관리)
2. 프로그램 ID : WwsnaStockContinueMonthMgtStateM - 재고지속월관리 현황(K-W-SV-U-0250M01)
3. 작성자 : leeminwoo
4. 작성일 : 2023-08-02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 재고지속월관리현황 http://localhost:3000/#/service/wsna-stock-continue-month-mgt-state
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="9"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 조회기간 -->
        <kw-search-item
          :label="$t('MSG_TXT_LOOKUP_PERIOD')"
          :colspan="3"
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            rules="date_range_required"
          />
        </kw-search-item>
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
          :colspan="4"
        />
        <!-- 창고상세구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_WARE_DTL_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.wareDtlDvCd"
            :options="filterCodes.wareDtlDvCd"
            first-option="all"
            :disable="isOk"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 재고유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_STOC_TYPE')"
          :colspan="3"
        >
          <kw-select
            v-model="searchParams.stockTpCd"
            :options="tempOptions.stockTpCd"
            first-option="all"
          />
        </kw-search-item>
        <!-- 등급 -->
        <kw-search-item
          :label="$t('MSG_TXT_GD')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmGdCd"
            :options="tempOptions.itmGdCd"
          />
        </kw-search-item>
        <!-- 사용 여부 -->
        <kw-search-item
          :label="$t('MSG_TXT_USE_YN')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.useYn"
            :options="tempOptions.useYn"
            first-option="all"
          />
        </kw-search-item>
        <!-- 품목구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmKindCd"
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
            v-model="searchParams.itmPdCd"
            upper-case
            type="text"
            :label="$t('MSG_TXT_ITM_CD')"
            rules="alpha_num|max:10"
          />
        </kw-search-item>
        <!-- SAP코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_SAPCD')"
          :colspan="6"
        >
          <kw-input
            v-model="searchParams.strtSapCd"
            :label="$t('MSG_TXT_STRT_SAP_CD')"
            rules="numeric|max:18"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.endSapCd"
            :label="$t('MSG_TXT_END_SAP_CD')"
            rules="numeric|max:18"
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
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <ul class="filter-box mb12">
        <li class="filter-box__item">
          <p class="filter-box__item-label">
            {{ $t('MSG_TXT_DIV') }}
          </p>
          <kw-option-group
            dense
            :model-value="matUtlzOptions"
            type="checkbox"
            :options="codes.MAT_UTLZ_DV_CD"
            @change="onChangeMatUtlzDvCd"
          />
        </li>
      </ul>
      <kw-grid
        ref="grdMainRef"
        :total-count="totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { getComponentType, defineGrid, gridUtil, useDataService, useGlobal, codeUtil } from 'kw-lib';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { notify } = useGlobal();
const { t } = useI18n();
const { currentRoute } = useRouter();

console.log(notify);
console.log(t);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/stock-continue-month-mgt-state';

const codes = await codeUtil.getMultiCodes(
  'WARE_DV_CD',
  'WARE_DTL_DV_CD',
  'ITM_KND_CD',
  'MAT_UTLZ_DV_CD',
);

const tempOptions = {
  itmGdCd: [
    { codeId: 'A', codeName: t('MSG_TXT_A_GD') }, // A급
    { codeId: 'B', codeName: t('MSG_TXT_B_GD') }, // B급
    { codeId: 'E', codeName: t('MSG_TXT_EGD') }, // E급
    { codeId: 'R', codeName: t('MSG_TXT_RGD') }, // R급
    { codeId: 'X', codeName: t('MSG_TXT_XGD') }, // X급
  ],
  useYn: [
    { codeId: 'Y', codeName: t('MSG_TXT_USE') }, // 사용
    { codeId: 'N', codeName: t('MSG_TXT_NUSD') }, // 미사용
  ],
  stockTpCd: [ // 재고유형기준
    { codeId: '1', codeName: t('기준1') }, // 기준1
    { codeId: '2', codeName: t('기준2') }, // 기준2
    { codeId: '3', codeName: t('기준3') }, // 기준3
    { codeId: '4', codeName: t('기준4') }, // 기준4
    { codeId: '5', codeName: t('기준5') }, // 기준5
  ],
};

const wareDvCd = {
  WARE_DV_CD: [
    { codeId: '2', codeName: t('MSG_TXT_SV_CNR') },
    { codeId: '1', codeName: t('MSG_TXT_LGST_CNR') },
  ],
};

const searchParams = ref({
  startDt: '',
  endDt: '',
  wareDvCd: '2',
  wareNoM: '',
  wareNoD: '',
  wareDtlDvCd: '',
  itmGdCd: 'A', // 등급
  useYn: '', // 사용여부
  stockTpCd: '', // 재고유형
  itmKindCd: '', // 품목구분
  itmPdCd: '', // 품목코드
  strtSapCd: '', // SAP 시작
  endSapCd: '', // SAP 시작
});

searchParams.value.startDt = dayjs().set('date', 1).format('YYYYMMDD');
searchParams.value.endDt = dayjs().format('YYYYMMDD');

const filterCodes = ref({
  wareDtlDvCd: [],
});

const isOk = ref();

// 창고구분 변경 시, 창고상세구분 세팅
const onChangeWareDvCd = async () => {
  const filterWareDvCd = searchParams.value.wareDvCd;

  if (filterWareDvCd === '1') { // 물류센터
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['10'].includes(v.codeId));
  } else { // 서비스센터
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['20', '21'].includes(v.codeId));
  }
};

watch(() => searchParams.value.wareDvCd, (val) => {
  if (searchParams.value.wareDvCd !== val) {
    searchParams.value.wareDvCd = val;
  }
  onChangeWareDvCd();
});

const onDisableChk = async () => {
  const chkWareNoD = searchParams.value.wareNoD;
  if (chkWareNoD === undefined || chkWareNoD === null || chkWareNoD === '') {
    isOk.value = false;
  } else {
    isOk.value = true;
    searchParams.value.wareDtlDvCd = '';
  }
};

watch(() => searchParams.value.wareNoD, (val) => {
  if (searchParams.value.wareNoD !== val) {
    searchParams.value.wareNoD = val;
  }
  onDisableChk();
});

let cachedParams;
const totalCount = ref(0);

async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const list = res.data;
  totalCount.value = list.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
  await onChangeWareDvCd();
});

const matUtlzOptions = ref([]);

const onChangeMatUtlzDvCd = (val) => {
  const view = grdMainRef.value.getView();

  const filter1 = [{
    name: 'cmnPartFilter', // 중수리 01
    criteria: 'value="01"',
  }];
  const filter2 = [{
    name: 'ordnyHvMatFilter', // 기초자재 Y
    criteria: 'value="Y"',
  }];
  const filter3 = [{
    name: 'trnoverFilter', // 회전율 Y
    criteria: 'value="Y"',
  }];

  view.setColumnFilters('cmnPartDvCd', filter1);
  view.setColumnFilters('ordnyHvMatYn', filter2);
  view.setColumnFilters('trnovrRtOjYn', filter3);

  if (val.includes('01')) {
    view.activateColumnFilters('cmnPartDvCd', false);
    view.activateColumnFilters('cmnPartDvCd', ['cmnPartFilter'], true);
  } else {
    view.activateColumnFilters('cmnPartDvCd', ['cmnPartFilter'], false);
  }

  if (val.includes('02')) {
    view.activateAllColumnFilters('ordnyHvMatYn', false);
    view.activateColumnFilters('ordnyHvMatYn', ['ordnyHvMatFilter'], true);
  } else {
    view.activateColumnFilters('ordnyHvMatYn', ['ordnyHvMatFilter'], false);
  }

  if (val.includes('03')) {
    view.activateColumnFilters('trnovrRtOjYn', false);
    view.activateColumnFilters('trnovrRtOjYn', ['trnoverFilter'], true);
  } else {
    view.activateColumnFilters('trnovrRtOjYn', ['trnoverFilter'], false);
  }
  view.setFixedOptions({ colCount: 3 });
};

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'btdStocGdQty', dataType: 'number' },
    { fieldName: 'btdStocGdAmt', dataType: 'number' },
    { fieldName: 'strQty', dataType: 'number' },
    { fieldName: 'strAmt', dataType: 'number' },
    { fieldName: 'wkOstrGdQty', dataType: 'number' },
    { fieldName: 'wkOstrGdAmt', dataType: 'number' },
    { fieldName: 'etcOstrGdQty', dataType: 'number' },
    { fieldName: 'etcOstrGdAmt', dataType: 'number' },
    { fieldName: 'onQty', dataType: 'number' },
    { fieldName: 'onAmt', dataType: 'number' },
    { fieldName: 'tnorRt', dataType: 'number' },
    { fieldName: 'keppMm', dataType: 'number' },
    { fieldName: 'cmnPartDvCd' },
    { fieldName: 'ordnyHvMatYn' },
    { fieldName: 'trnovrRtOjYn' },
  ];

  const columns = [
    { fieldName: 'sapMatCd', // SAP코드
      header: t('MSG_TXT_SAPCD'),
      width: '170',
      footer: {
        styleName: 'text-center',
      } },
    { fieldName: 'pdCd', // 품목코드
      header: t('MSG_TXT_ITM_CD'),
      width: '110',
      footer: {
        styleName: 'text-center',
      } },
    { fieldName: 'pdNm', // 품목명
      header: t('MSG_TXT_ITM_NM'),
      width: '230',
      footer: {
        styleName: 'text-left',
      } },
    { fieldName: 'btdStocGdQty', // 기초재고
      header: t('MSG_TXT_BTD_STOC'),
      width: '80',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'btdStocGdAmt', // 기초재고금액(원)
      header: t('MSG_TXT_BTD_STOC_AMT'),
      width: '100',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'strQty', // 입고수량
      header: t('MSG_TXT_STR_QTY'),
      width: '80',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'strAmt', // 입고수량금액(원)
      header: t('MSG_TXT_STR_QTY_AMT'),
      width: '100',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'wkOstrGdQty', // 작업출고수량
      header: t('MSG_TXT_JOB_OSTR_QTY'),
      width: '100',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'wkOstrGdAmt', // 작업출고금액(원)
      header: t('MSG_TXT_JOB_OSTR_AMT'),
      width: '100',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'etcOstrGdQty', // 기타출고수량
      header: t('MSG_TXT_ETC_OSTR_QTY'),
      width: '100',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'etcOstrGdAmt', // 기타출고금액(원)
      header: t('MSG_TXT_ETC_OSTR_AMT'),
      width: '100',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'onQty', // 기말재고
      header: t('MSG_TXT_EOT_STOC'),
      width: '80',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'onAmt', // 기말재고금액(원)
      header: t('MSG_TXT_EOT_STOC_AMT'),
      width: '100',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      } },
    { fieldName: 'tnorRt', // 재고회전율(%)
      header: t('MSG_TXT_STOC_TURNOVER'),
      width: '100',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0.##',
      footer: {
        numberFormat: '#,##0.##',
        // expression: 'sum',
        // 재고회전율 계산식 : ROUND( ( SUM('작업출고수량') + SUM('기타출고수량') ) / ((SUM('기초재고') + SUM('기말재고'))/2)*100,2)
        valueCallback(grid) {
          const sum1 = grid.getSummary('wkOstrGdQty', 'sum') + grid.getSummary('etcOstrGdQty', 'sum'); // 작업출고수량 + 기타출고수량
          const sum2 = (grid.getSummary('btdStocGdQty', 'sum') + grid.getSummary('onQty', 'sum')) / 2; // 기초재고 + 기말재고
          return Math.round((sum1 / sum2) * 100, 2);
        },
      } },
    { fieldName: 'keppMm', // 재고지속월
      header: t('MSG_TXT_STOC_CTN_MM'),
      width: '90',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0.##',
      footer: {
        numberFormat: '#,##0.##',
        // expression: 'sum',
        // 재고지속월  계산식 : ROUND((SUM('기초재고')+SUM('기말재고'))/2/SUM('작업출고수량'),2)
        valueCallback(grid) {
          const sum1 = (grid.getSummary('btdStocGdQty', 'sum') + grid.getSummary('onQty', 'sum')) / 2; // 기초재고 + 기말재고
          const sum2 = grid.getSummary('wkOstrGdQty', 'sum'); // 작업출고수량
          return Math.round(sum1 / sum2, 2);
        },
      } },
    { fieldName: 'cmnPartDvCd', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'ordnyHvMatYn', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
    { fieldName: 'trnovrRtOjYn', header: t(''), width: '150', styleName: 'text-center', visible: false, autoFilter: false },
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.setFooters({ visible: true, items: [{ height: 30 }] });
  view.columnByName('pdCd').setFooters({ text: t('MSG_TXT_SUM'), styleName: 'text-center' });
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setFixedOptions({ colCount: 3 });
});
</script>
