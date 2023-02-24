<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 고객 - 성과수당 현황
2. 프로그램 ID : WwfebOutcomeAllowanceListM - 성과수당 현황 (W-CO-U-0037M01)
3. 작성자 : kangik-yun
4. 작성일 : 2023.02.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 >> 성과수당 현황 프로그램
****************************************************************************************************
-TODO :
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!--실적년월-->
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfDt"
            :label="$t('MSG_TXT_PERF_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <!--구분1-->
        <kw-search-item
          :label="$t('MSG_TXT_DV_1')"
          required
        >
          <kw-option-group
            v-model="searchParams.leaderDiv"
            model-value="W0102"
            type="radio"
            :options="codes.RSB_DV_CD"
            rules="required"
          />
        </kw-search-item>
        <!--구분2-->
        <kw-search-item
          :label="$t('MSG_TXT_DV_2')"
          required
        >
          <kw-option-group
            v-model="searchParams.levelDiv"
            model-value="전체"
            type="radio"
            :options="[ '전체','메이저', '마이너']"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
          <span class="ml8">(단위:원)</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="3"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, codeUtil, defineGrid, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const totalCount = ref(0);
const dataService = useDataService();
const { t } = useI18n();
const searchParams = ref({
  perfDt: '',
  leaderDiv: '',
  levelDiv: '',
});

const grdMainRef = ref(getComponentType('KwGrid'));
const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
);
codes.RSB_DV_CD = codes.RSB_DV_CD.filter((v) => (v.codeId === 'W0102' || v.codeId === 'W0203'));
let cachedParams;

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData() {
  const res = await dataService.get('/sms/wells/fee/outcome-allowances', { params: cachedParams });
  const datas = res.data;
  totalCount.value = datas.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(datas);
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  fetchData();
}
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  gridUtil.exportView(view, {
    fileName: '성과수당 현황',
    timePostfix: true,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
    { fieldName: 'col15' },
    { fieldName: 'col16' },
    { fieldName: 'col17' },
    { fieldName: 'col18' },
    { fieldName: 'col19' },
    { fieldName: 'col20' },
    { fieldName: 'col21' },
    { fieldName: 'col22' },
    { fieldName: 'col23' },
    { fieldName: 'col24' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '124.1' }, //  총괄단
    { fieldName: 'col2', header: t('MSG_TXT_RGNL_GRP'), width: '125.1', styleName: 'text-center' }, // 지역단
    { fieldName: 'col3', header: t('MSG_TXT_EMPL_NM'), width: '102' }, // 성명
    { fieldName: 'col4', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '92', styleName: 'text-center' }, // 번호
    { fieldName: 'col5', header: t('MSG_TXT_SAP_GRP'), width: '110.8', styleName: 'text-right' }, // 그룹
    { fieldName: 'col6', header: t('MSG_TXT_LSTMM'), width: '82.1', styleName: 'text-right' }, // 전월
    { fieldName: 'col7', header: t('MSG_TXT_THM'), width: '82.1', styleName: 'text-right' }, // 당월
    { fieldName: 'col8', header: t('MSG_TXT_AGGS'), width: '82.1', styleName: 'text-right' }, // 누계
    { fieldName: 'col9', header: t('MSG_TXT_BRNCH_OFFC_AVG'), width: '82.1', styleName: 'text-right' }, // 지평
    { fieldName: 'col10', header: t('MSG_TXT_NEW'), width: '82.1', styleName: 'text-right' }, // 신규
    { fieldName: 'col11', header: t('MSG_TXT_BRNCH_OFFC_AVG'), width: '82.1', styleName: 'text-right' }, // 지평
    { fieldName: 'col12', header: t('MSG_TXT_CVT_DSTRC_AV'), width: '82.1', styleName: 'text-right' }, // 환산지평
    { fieldName: 'col13', header: `${t('MSG_TXT_CVT_PC')}(1)`, width: '110.8', styleName: 'text-right' }, // 환산점수(1)
    { fieldName: 'col14', header: t('MSG_TXT_PRFMT'), width: '82.1', styleName: 'text-right' }, // 승진
    { fieldName: 'col15', header: t('MSG_TXT_GB'), width: '82.1', styleName: 'text-right' }, // 반납
    { fieldName: 'col16', header: `${t('MSG_TXT_CVT_PC')}(2)`, width: '110.8', styleName: 'text-right' }, // 환산점수(2)
    { fieldName: 'col17', header: t('MSG_TXT_LSTMM'), width: '82.1', styleName: 'text-right' }, // 전월
    { fieldName: 'col18', header: t('MSG_TXT_THM'), width: '82.1', styleName: 'text-right' }, // 당월
    { fieldName: 'col19', header: t('MSG_TXT_NINC'), width: '82.1', styleName: 'text-right' }, // 순증
    { fieldName: 'col20', header: `${t('MSG_TXT_CVT_PC')}(3)`, width: '110.8', styleName: 'text-right' }, // 환산점수(3)
    { fieldName: 'col21', header: `SQI${t('MSG_TXT_PC')}`, width: '82.1', styleName: 'text-right' }, // SQI점수
    { fieldName: 'col22', header: `${t('MSG_TXT_LOCARA_PC')}-${t('MSG_TXT_AV')}`, width: '113.8', styleName: 'text-right' }, // 지역점수-평균
    { fieldName: 'col23', header: `${t('MSG_TXT_CVT_PC')}(5)`, width: '110.8', styleName: 'text-right' }, // 환산점수(5)
    { fieldName: 'col24', header: t('MSG_TXT_TOT_PC'), width: '110.8', styleName: 'text-right' }, // 총점

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    'col1',
    'col2',
    'col3',
    'col4',
    'col5',
    {
      header: t('MSG_TXT_BRCH_N'), // colspan title //지점수
      direction: 'horizontal', // merge type
      items: ['col6', 'col7'],
    },
    {
      header: t('MSG_TXT_ENVR_ELHM'), // colspan title //'환경가전'
      direction: 'horizontal', // merge type
      items: ['col8', 'col9', 'col10', 'col11', 'col12'],
    },
    'col13',
    {
      header: t('MSG_TXT_BRCH_NINC'), // 지점순증
      direction: 'horizontal',
      items: ['col14', 'col15'],
    },
    'col16',
    {
      header: t('MSG_TXT_MNGER_NINC'), // 매니저순증
      direction: 'horizontal',
      items: ['col17', 'col18', 'col19'],
    },
    'col20',
    {
      header: `Wells-SQI ${t('MSG_TXT_PC')}`, // Wells-SQI점수
      direction: 'horizontal',
      items: ['col21', 'col22'],
    },
    'col23',
    'col24',
  ]);
  data.setRows([
    { col1: 'OO총괄단', col2: '-', col3: '김교원', col4: '1234567', col5: '5', col6: '0', col7: '0', col8: '1,234', col9: '0', col10: '123.50', col11: '0', col12: '0', col13: '0', col14: '0', col15: '0', col16: '0', col17: '0', col18: '123', col19: '123', col20: '123', col21: '0', col22: '0', col23: '0', col24: '123' },
    { col1: 'OO총괄단', col2: '-', col3: '김교원', col4: '1234567', col5: '5', col6: '0', col7: '0', col8: '1,234', col9: '0', col10: '123.50', col11: '0', col12: '0', col13: '0', col14: '0', col15: '0', col16: '0', col17: '0', col18: '123', col19: '123', col20: '123', col21: '0', col22: '0', col23: '0', col24: '123' },
    { col1: 'OO총괄단', col2: '-', col3: '김교원', col4: '1234567', col5: '5', col6: '0', col7: '0', col8: '1,234', col9: '0', col10: '123.50', col11: '0', col12: '0', col13: '0', col14: '0', col15: '0', col16: '0', col17: '0', col18: '123', col19: '123', col20: '123', col21: '0', col22: '0', col23: '0', col24: '123' },
  ]);
});

</script>
