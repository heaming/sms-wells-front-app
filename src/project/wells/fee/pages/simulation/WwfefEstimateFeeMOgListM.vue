<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEF
2. 프로그램 ID : WwfefEstimateFeeMOgListM - 예상수수료 조회(M조직)
3. 작성자 : gs.rahul.n
4. 작성일 : 2023.03.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 23.04.18 퍼블 최신화
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            :label="$t('MSG_TXT_PERF_YM')"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_INQR')"
          required
        >
          <kw-option-group
            v-model="searchParams.type"
            :label="$t('MSG_TXT_PERF_INQR')"
            type="radio"
            rules="required"
            :options="[{ codeId: '0', codeName: $t('MSG_TXT_RCP') },
                       { codeId: '1', codeName: $t('MSG_TXT_SL') }]"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          required
        >
          <kw-input
            v-model="searchParams.sellPrtnrNo"
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
            rules="required"
            icon="search"
            clearable
            @click-icon="onClickSearchPrtnrNoPopup"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <!-- 기본정보 -->
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_DEFAULT_INFO') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <kw-form
        dense
      >
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_EMPL_NM')"
          >
            <p>{{ baseInfo.sample }}</p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_BLG')"
            align-content="left"
          >
            <p>{{ baseInfo.sample }}</p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_RSB')"
          >
            <p>{{ baseInfo.sample }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_EST_SAL_COMM')"
            align-content="right"
          >
            <p>{{ baseInfo.sample }}</p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_EST_BS_FEE')"
            align-content="right"
          >
            <p>{{ baseInfo.sample }}</p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_TOT_EST_FEE')"
            align-content="right"
          >
            <p>{{ baseInfo.sample }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_OPNG_NMN')"
            align-content="left"
          >
            <p>{{ baseInfo.sample }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <!-- 실적내역 -->
      <h3>{{ t('MSG_TXT_PERF_DETAIL') }}</h3>
      <kw-action-top>
        <template #left>
          <span> {{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          :label="$t('MSG_TXT_CALCULATE')"
          dense
          primary
          @click="onClickCalculateDetail"
        />
      </kw-action-top>
      <kw-grid
        ref="grdDetailRef"
        :visible-rows="2"
        @init="initGridDetail"
      />
      <kw-separator />
      <!-- BS내역 -->
      <h3>{{ t('MSG_TXT_BS_IZ') }}</h3>
      <kw-action-top>
        <template #left>
          <span> {{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          :label="$t('MSG_TXT_CALCULATE')"
          dense
          primary
          @click="onClickCalculateBs"
        />
      </kw-action-top>
      <kw-grid
        ref="grdBsRef"
        :visible-rows="3"
        @init="initGridBs"
      />
      <kw-separator />
      <!-- 예상수수료 내역 -->
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_EST_FEE_DTL') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <kw-grid
        ref="grdDstRef"
        :visible-rows="2"
        @init="initGridDstDtl"
      />
      <kw-separator />
      <!-- 판매내역 -->
      <kw-action-top>
        <template #left>
          <h3>{{ t('MSG_TXT_SAL_HIST') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <kw-grid
        ref="grdSalesRef"
        :visible-rows="3"
        @init="initGridSalesHist"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, useDataService, useGlobal, getComponentType } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const now = dayjs();
const { modal } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdDetailRef = ref(getComponentType('KwGrid'));
const grdBsRef = ref(getComponentType('KwGrid'));
const grdDstRef = ref(getComponentType('KwGrid'));
const grdSalesRef = ref(getComponentType('KwGrid'));
const grdDetailData = computed(() => grdDetailRef.value?.getData());
const grdBsData = computed(() => grdBsRef.value?.getData());
const grdDstData = computed(() => grdDstRef.value?.getData());
const grdSalesData = computed(() => grdSalesRef.value?.getData());

let cachedParams;
const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  type: '0',
  sellPrtnrNo: '',
});
const baseInfo = ref({
  sample: 'test',
});

// 데이터 조회
async function fetchData() {
  const { data } = await dataService.get('API정의안됨', { params: { ...cachedParams } });
  grdDetailData.value.setRows(data.list1);
  grdBsData.value.setRows(data.list2);
  grdDstData.value.setRows(data.list3);
  grdSalesData.value.setRows(data.list4);
}
// 조회버튼
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
// 파트너 검색 팝업
async function onClickSearchPrtnrNoPopup() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.sellPrtnrNo,
    },
  });
  if (result) {
    searchParams.value.sellPrtnrNo = payload.prtnrNo;
  }
}
// 실적내역 계산버튼 클릭
async function onClickCalculateDetail() {
  const { data } = await dataService.get('API정의안됨', { params: { ...cachedParams } });
  console.log(data);
}

// BS내역 계산버튼 클릭
async function onClickCalculateBs() {
  const { data } = await dataService.get('API정의안됨', { params: { ...cachedParams } });
  console.log(data);
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridDetail = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_DIV'), width: '172', styleName: 'text-left' },
    { fieldName: 'col2', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '171', styleName: 'text-right' },
    { fieldName: 'col3', header: t('MSG_TXT_LUMP_SUM_INST'), width: '172', styleName: 'text-right' },
    { fieldName: 'col4', header: t('MSG_TXT_BASE_RTLFE'), width: '172', styleName: 'text-right' },
    { fieldName: 'col5', header: t('MSG_TXT_BFSVC_ACKMT_CT'), width: '172', styleName: 'text-right' },
    { fieldName: 'col6', header: t('MSG_TXT_PLAR_SRTUP'), width: '172', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_TOPMR_PLAR_STMNT'), width: '172', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_PLAR_PRTIC'), width: '172', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_MANAGER_SRTUP'), width: '171', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_MANAGER_STMNT'), width: '172', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_CMPF_EDUC'), width: '172', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_METG_PRSC_DC'), width: '172', styleName: 'text-right' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  data.setRows([
    { col1: '실적 현황', col2: '12', col3: '12,345,670', col4: '12,345,670', col5: '12', col6: '2022-11', col7: '2022-11', col8: '2022-11', col9: '2022-11', col10: '2022-11', col11: '2022-11', col12: '12' },
    { col1: '예상 실적', col2: '12', col3: '12,345,670', col4: '12,345,670', col5: '12', col6: '2022-11', col7: '2022-11', col8: '2022-11', col9: '2022-11', col10: '2022-11', col11: '2022-11', col12: '12' },
  ]);
});

const initGridBs = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_DIV'), styleName: 'text-center', width: '120' },
    { fieldName: 'col2', header: `${t('MSG_TXT_WRFR')} 1`, styleName: 'text-right', width: '109' },
    { fieldName: 'col3', header: `${t('MSG_TXT_WRFR')} 2`, styleName: 'text-right', width: '109' },
    { fieldName: 'col4', header: `${t('MSG_TXT_WRFR')} 3`, styleName: 'text-right', width: '109' },
    { fieldName: 'col5', header: `${t('MSG_TXT_WRFR')} 4`, styleName: 'text-right', width: '109' },
    { fieldName: 'col6', header: t('MSG_TXT_UN_WRFR'), styleName: 'text-right', width: '109' },
    { fieldName: 'col7', header: `${t('MSG_TXT_PUF')} 1`, styleName: 'text-right', width: '109' },
    { fieldName: 'col8', header: `${t('MSG_TXT_PUF')} 2`, styleName: 'text-right', width: '109' },
    { fieldName: 'col9', header: t('MSG_TXT_ETC_ITEMS_1'), styleName: 'text-right', width: '204' },
    { fieldName: 'col10', header: t('MSG_TXT_ETC_ITEMS_2'), styleName: 'text-right', width: '115' },
    { fieldName: 'col11', header: t('MSG_TXT_ETC_FXAM_DSB'), styleName: 'text-right', width: '129' },
    { fieldName: 'col12', header: t('MSG_TXT_SUM'), styleName: 'text-right', width: '129' },
    { fieldName: 'col13', header: t('MSG_TXT_BS_PROC_RATE'), styleName: 'text-right', width: '106' },
    { fieldName: 'col14', header: t('W1'), styleName: 'text-right', width: '109' },
    { fieldName: 'col15', header: t('W2'), styleName: 'text-right', width: '109' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = false; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'col1',
    {
      header: t('MSG_TXT_PRD_GRP'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col2', 'col3', 'col4', 'col5', 'col6', 'col7', 'col8', 'col9', 'col10', 'col11', 'col12'],
    },
    'col13',
    {
      header: t('MSG_TXT_RGLVL'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col14', 'col15'],
    },
  ]);

  data.setRows([
    { col1: '배정건수', col2: '10', col3: '10', col4: '10', col5: '10', col6: '10', col7: '10', col8: '10', col9: '10', col10: '10', col11: '10', col12: '10', col13: '-', col14: '10', col15: '10' },
    { col1: '완료건수', col2: '10', col3: '10', col4: '10', col5: '10', col6: '10', col7: '10', col8: '10', col9: '10', col10: '10', col11: '10', col12: '10', col13: '-', col14: '10', col15: '10' },
    { col1: '예상완료건수', col2: '10', col3: '10', col4: '10', col5: '10', col6: '10', col7: '10', col8: '10', col9: '10', col10: '10', col11: '10', col12: '10', col13: '-', col14: '10', col15: '10' },
  ]);
});

const initGridDstDtl = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_DIV'), styleName: 'text-center', width: '145' },
    { fieldName: 'col2', header: t('MSG_TXT_ELHM_PRPN'), styleName: 'text-right', width: '157' },
    { fieldName: 'col3', header: t('MSG_TXT_ELHM_METG'), styleName: 'text-right', width: '157' },
    { fieldName: 'col4', header: t('MSG_TXT_ELHM_EXCP_PRPN'), styleName: 'text-right', width: '157' },
    { fieldName: 'col5', header: t('MSG_TXT_ELHM_EXCP_METG'), styleName: 'text-right', width: '157' },
    { fieldName: 'col6', header: t('MSG_TXT_SAL_INTV'), styleName: 'text-right', width: '157' },
    { fieldName: 'col7', header: t('MSG_TXT_EDUC'), styleName: 'text-right', width: '157' },
    { fieldName: 'col8', header: t('MSG_TXT_STMNT'), styleName: 'text-right', width: '160' },
    { fieldName: 'col9', header: t('MSG_TXT_BS_MGMT'), styleName: 'text-right', width: '151' },
    { fieldName: 'col10', header: t('MSG_TXT_RGLVL'), styleName: 'text-right', width: '151' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = false; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'col1',
    {
      header: t('MSG_TXT_EST_SAL_COMM'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col2', 'col3', 'col4', 'col5', 'col6', 'col7', 'col8'],
    },
    {
      header: t('MSG_TXT_EST_BS_FEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col9', 'col10'],
    },
  ]);

  data.setRows([
    { col1: '예상수수료', col2: '1,234,500', col3: '1,234,500', col4: '1,234,500', col5: '1,234,500', col6: '1,234,500', col7: '1,234,500', col8: '1,234,500', col9: '1,234,500', col10: '1,234,500' },
    { col1: '예상수수료', col2: '1,234,500', col3: '1,234,500', col4: '1,234,500', col5: '1,234,500', col6: '1,234,500', col7: '1,234,500', col8: '1,234,500', col9: '1,234,500', col10: '1,234,500' },
  ]);
});

const initGridSalesHist = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_RCPDT'), width: '112', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'col2', header: t('MSG_TXT_SL_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'col3', header: t('MSG_TXT_CNTR_DTL_NO'), width: '155', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_CNTRT'), width: '93', styleName: 'text-left' },
    { fieldName: 'col5', header: t('MSG_TXT_PRDT_NM'), width: '187', styleName: 'text-left' },
    { fieldName: 'col6', header: t('MSG_TXT_PRDT_GUBUN'), width: '101', styleName: 'text-left' },
    { fieldName: 'col7', header: t('MSG_TXT_CONTR_TYPE'), width: '96', styleName: 'text-left' },
    { fieldName: 'col8', header: t('MSG_TXT_PD_ACC_CNT'), width: '91', styleName: 'text-right' },
    { fieldName: 'col9', header: t('MSG_TXT_BFSVC_ACKMT_CT'), width: '107', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_ELHM_RENTAL'), width: '108', styleName: 'text-right' },
    { fieldName: 'col11', header: t('MSG_TXT_ELHM_SPAY'), width: '112', styleName: 'text-right' },
    { fieldName: 'col12', header: t('MSG_TXT_ELHM_EXCP_SPAY'), width: '118', styleName: 'text-right' },
    { fieldName: 'col13', header: t('MSG_TXT_ETC'), width: '111', styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2022-10-24', col2: '-', col3: '2022-1234567', col4: '김교원', col5: '비데(BM350)', col6: '렌탈', col7: '일반', col8: '1', col9: '1', col10: '1,234,500', col11: '1,234,500', col12: '1,234,500', col13: '-' },
    { col1: '2022-10-24', col2: '-', col3: '2022-1234567', col4: '김교원', col5: '비데(BM350)', col6: '렌탈', col7: '일반', col8: '1', col9: '1', col10: '1,234,500', col11: '1,234,500', col12: '1,234,500', col13: '-' },
    { col1: '2022-10-24', col2: '-', col3: '2022-1234567', col4: '김교원', col5: '비데(BM350)', col6: '렌탈', col7: '일반', col8: '1', col9: '1', col10: '1,234,500', col11: '1,234,500', col12: '1,234,500', col13: '-' },
  ]);
});

</script>
