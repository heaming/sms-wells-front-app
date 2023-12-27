<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC (배정관리)
2. 프로그램 ID : WwsncCenterCustomerAgrgByProductListM - 제품별 센터 관리고객 집계
3. 작성자 : heymi.cho
4. 작성일 : 2023.08.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 제품별 센터 관리고객 집계 (http://localhost:3000/#/service/wwsnb-center-customer-agrg-by-product)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            :rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CST_TYPE')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="codes.SELL_TP_CD"
            first-option="all"
          />
          <kw-field
            :model-value="['Y', 'N']"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-model="searchParams.totalCsmr"
                v-bind="field"
                :label="$t('MSG_TXT_COM_TOT')+' '+$t('MSG_TXT_MGT')+$t('MSG_TXT_CUSTOMER')"
              />
            </template>
          </kw-field>
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
        <!-- <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
          @click="onClickPrint"
        /> -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
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
import { codeUtil, getComponentType, gridUtil, useDataService, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

// const { notify } = useGlobal();
const { t } = useI18n();
const { currentRoute } = useRouter();
const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;

const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  sellTpCd: '',
  totalCsmr: 'N',
});

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
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

async function fetchData() {
  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/center-customer-agrg-by-product/paging', { params: { ...cachedParams, ...pageInfo.value }, timeout: 100000 });
  const { list: state, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(state);
  console.log(state);
  view.resetCurrent();
  await gridUtil.reset(view);
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/center-customer-agrg-by-product/excel-download', { params: searchParams.value, timeout: 100000 });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

/*
 *  Search - 조회
 */
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  await fetchData();
}

// async function onClickPrint() {
//   // TODO : 출력 기능 연결
//   notify(t('TODO : 출력기능?'));
// }
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '120', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '140', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '220', styleName: 'text-left' },
    { fieldName: 's71351', header: '성수', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71350', header: '의정부', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71367', header: '남양주', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71359', header: '원주', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71356', header: '수원', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71354', header: '안양', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71353', header: '광명', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71355', header: '인천', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71448', header: '강서', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71352', header: '일산', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71360', header: '청주', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71362', header: '대전', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71368', header: '천안', width: '59', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71364', header: '전주', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71363', header: '광주', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71386', header: '순천', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71361', header: '서대구', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71369', header: '동대구', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71357', header: '부산', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71387', header: '포항', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71366', header: '김해', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71358', header: '창원', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71447', header: '진주', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 's71365', header: '제주', width: '80', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'total', header: '계', width: '80', styleName: 'text-right', dataType: 'number' },
  ];

  // eslint-disable-next-line max-len
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;
  view.fixedOptions.colCount = 3;
  view.fixedOptions.rightCount = 1;
});

</script>
