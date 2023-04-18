<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEF
2. 프로그램 ID : WwfefEstimateFeeHomeMasterListM - 예상수수료 조회(홈마스터) 조회
3. 작성자 : gs.ritvik.m
4. 작성일 : 2023.03.15
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 예상수수료 조회(홈마스터) 화면
- 2023.04.18 퍼블수정됨
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
            rules="required"
            type="month"
            :label="$t('MSG_TXT_PERF_YM')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_INQR')"
          required
        >
          <kw-option-group
            v-model="searchParams.type"
            type="radio"
            :label="$t('MSG_TXT_PERF_INQR')"
            :options="[{ codeId: '0', codeName: $t('MSG_TXT_RCP') },
                       { codeId: '1', codeName: $t('MSG_TXT_INSTALLATION') }]"
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
      <!-- 기본 정보 -->
      <kw-action-top>
        <template #left>
          <span class="accent">{{ t('MSG_TXT_DEFAULT_INFO') }}</span>
        </template>
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
            :label="$t('MSG_TXT_BLG_CD')"
          >
            <p>{{ baseInfo.sample }}</p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_CRLV')"
          >
            <p>{{ baseInfo.sample }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_EST_SAL_COMM')"
          >
            <p>{{ baseInfo.sample }}</p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_EST_SVC_FEE')"
          >
            <p>{{ baseInfo.sample }}</p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_TOT_EST_FEE')"
          >
            <p>{{ baseInfo.sample }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <!-- 실적내역 -->
      <kw-action-top>
        <template #left>
          <span class="accent">{{ $t('MSG_TXT_PERF_DETAIL') }}</span>
        </template>

        <kw-btn
          :label="$t('MSG_TXT_EDU_COMPL_APPL')"
          dense
          @click="onClickEduCompletion"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_PRJTD_PERF_CALCULATE')"
          dense
          primary
          @click="onClickCalculateDetail"
        />
      </kw-action-top>
      <kw-grid
        ref="grdPerfDtlRef"
        :visible-rows="2"
        @init="initGrdPerfDtl"
      />
      <kw-separator />
      <kw-action-top>
        <template #left>
          <span class="accent">{{ $t('MSG_TXT_EST_FEE_DTL') }}</span>
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdEstFeeDtlRef"
        :visible-rows="2"
        @init="initGrdEstFeeDtl"
      />
      <kw-separator />
      <kw-action-top>
        <template #left>
          <span class="accent">{{ $t('MSG_TXT_SAL_HIST') }}</span>
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdSaleHistRef"
        :visible-rows="5"
        @init="initGrdSaleHist"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, defineGrid, useGlobal, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const now = dayjs();
const { modal } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdPerfDtlRef = ref(getComponentType('KwGrid'));
const grdEstFeeDtlRef = ref(getComponentType('KwGrid'));
const grdSaleHistRef = ref(getComponentType('KwGrid'));
const grdPerfDtlData = computed(() => grdPerfDtlRef.value?.getData());
const grdEstFeeDtlData = computed(() => grdEstFeeDtlRef.value?.getData());
const grdSaleHistData = computed(() => grdSaleHistRef.value?.getData());

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
  grdPerfDtlData.value.setRows(data.list1);
  grdEstFeeDtlData.value.setRows(data.list2);
  grdSaleHistData.value.setRows(data.list3);
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

// 실적내역 교육수료적용 버튼 클릭
async function onClickEduCompletion() {
  const { data } = await dataService.get('API정의안됨', { params: { ...cachedParams } });
  console.log(data);
}

// 실적내역 예상실적 계산버튼 클릭
async function onClickCalculateDetail() {
  const { data } = await dataService.get('API정의안됨', { params: { ...cachedParams } });
  console.log(data);
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdPerfDtl = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_DIV'), width: '193', styleName: 'text-left' },
    { fieldName: 'col2', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '269', styleName: 'text-right' },
    { fieldName: 'col3', header: t('MSG_TXT_SNGL_PMNT'), width: '268', styleName: 'text-right' },
    { fieldName: 'col4', header: t('MSG_TXT_ALL_CASES_PROC'), width: '271', styleName: 'text-right' },
    { fieldName: 'col5', header: t('MSG_TXT_APL_HNDL_CASE'), width: '270', styleName: 'text-right' },
    { fieldName: 'col6', header: t('MSG_TXT_EDU_CERT'), width: '270', styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  data.setRows([
    { col1: '실적 현황', col2: '12', col3: '12,345,670', col4: '12', col5: '12', col6: 'N' },
    { col1: '변경 실적', col2: '12', col3: '12,345,670', col4: '12', col5: '12', col6: 'N' },
  ]);
});

const initGrdEstFeeDtl = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_DIV'), styleName: 'text-left', width: '218' },
    { fieldName: 'col2', header: t('MSG_TXT_PRPN'), styleName: 'text-right', width: '165' },
    { fieldName: 'col3', header: t('MSG_TXT_EARLY_STTLMNT'), styleName: 'text-right', width: '165' },
    { fieldName: 'col4', header: t('MSG_TXT_ENRG'), styleName: 'text-right', width: '165' },
    { fieldName: 'col6', header: t('MSG_TXT_SCENE'), styleName: 'text-right', width: '132' },
    { fieldName: 'col7', header: `${t('MSG_TXT_ACTI')} 1`, styleName: 'text-right', width: '132' },
    { fieldName: 'col8', header: `${t('MSG_TXT_ACTI')} 2`, styleName: 'text-right', width: '132' },
    { fieldName: 'col9', header: t('MSG_TXT_ACML'), styleName: 'text-right', width: '132' },
    { fieldName: 'col10', header: t('MSG_TXT_EDUC'), styleName: 'text-right', width: '132' },
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
      items: ['col2', 'col3', 'col4'],
    },
    {
      header: t('MSG_TXT_EST_SVC_FEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col6', 'col7', 'col8', 'col9', 'col10'],
    },
  ]);

  data.setRows([
    { col1: '예상수수료', col2: '1,234,500', col3: '1,234,500', col4: '123,450', col5: '123,450', col6: '123,450', col7: '123,450', col8: '123,450', col9: '123,450', col10: '123,450' },
    { col1: '합계', col2: '-', col3: '-', col4: '-', col5: '1,234,500', col6: '-', col7: '-', col8: '-', col9: '-', col10: '1,234,500' },
  ]);
});

const initGrdSaleHist = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CONF_COMPL_DT'), width: '155', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'col2', header: t('MSG_TXT_NST_COMP_DT'), width: '155', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'col3', header: t('MSG_TXT_CST_CD'), width: '155', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_CNTRT'), width: '155', styleName: 'text-left' },
    { fieldName: 'col5', header: t('MSG_TXT_PRDT_NM'), width: '155', styleName: 'text-left' },
    { fieldName: 'col6', header: t('MSG_TXT_PRDT_CODE'), width: '155', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_PRDT_GUBUN'), width: '155', styleName: 'text-left' },
    { fieldName: 'col8', header: t('MSG_TXT_CONTR_TYPE'), width: '155', styleName: 'text-left' },
    { fieldName: 'col9', header: t('MSG_TXT_PD_ACC_CNT'), width: '155', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_PD_ACC_CNT'), width: '155', styleName: 'text-right' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2022-10-24', col2: '-', col3: '2022-1234567', col4: '김교원', col5: '비데', col6: 'BM350', col7: '렌탈', col8: '일반', col9: '1', col10: '1' },
    { col1: '2022-10-21', col2: '2022-10-22', col3: '2022-1234567', col4: '이교원', col5: '청정기', col6: 'AK316', col7: '일시불', col8: '일반', col9: '1', col10: '1' },
    { col1: '2022-10-24', col2: '-', col3: '2022-1234567', col4: '김교원', col5: '비데', col6: 'BM350', col7: '렌탈', col8: '일반', col9: '1', col10: '1' },
    { col1: '2022-10-21', col2: '2022-10-22', col3: '2022-1234567', col4: '이교원', col5: '청정기', col6: 'AK316', col7: '일시불', col8: '일반', col9: '1', col10: '1' },
    { col1: '2022-10-21', col2: '2022-10-22', col3: '2022-1234567', col4: '이교원', col5: '청정기', col6: 'AK316', col7: '일시불', col8: '일반', col9: '1', col10: '1' },
  ]);
});
</script>
