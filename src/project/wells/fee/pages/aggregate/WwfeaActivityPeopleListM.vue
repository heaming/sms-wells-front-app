<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 고객 - 실활동인원 관리
2. 프로그램 ID : WwfeaActivityPeopleListM - 실활동인원 관리 (W-CO-U-0013M01)
3. 작성자 : kangik-yun
4. 작성일 : 2023.02.23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 >> 실활동인원 관리 프로그램
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
        <!--조직유형-->
        <kw-search-item
          :label="$t('MSG_TXT_OG_TP')"
          required
        >
          <kw-select
            v-model="searchParams.ogType"
            :label="$t('MSG_TXT_OG_TP')"
            :model-value="['B']"
            :options="['M추진단', 'B', 'C', 'D']"
            rules="required"
          />
        </kw-search-item>
        <!--직책유형-->
        <kw-search-item
          :label="$t('MSG_TXT_RSB_TP')"
          required
        >
          <kw-option-group
            v-model="searchParams.rsbType"
            :label="$t('MSG_TXT_RSB_TP')"
            :model-value="'플래너'"
            type="radio"
            :options="['플래너', '지점장']"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <!--확정구분-->
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CNFM_DV')"
          required
        >
          <kw-option-group
            v-model="searchParams.confirmDiv"
            :label="$t('MSG_TXT_CNFM_DV')"
            :model-value="'예정'"
            type="radio"
            :options="['예정', '확정', '변동']"
            rules="required"
          />
        </kw-search-item>
        <!--조직레벨-->
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.ogLevel1"
            :model-value="['B']"
            :options="['총괄단', 'B', 'C', 'D']"
          />
          <kw-select
            v-model="searchParams.ogLevel2"
            :model-value="['B']"
            :options="['지역단', 'B', 'C', 'D']"
          />
          <kw-select
            v-model="searchParams.ogLevel3"
            :model-value="['D']"
            :options="['지점', 'B', 'C', 'D']"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item label="번호">
          <kw-input
            icon="search"
            clearable
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
          <span class="kw-fc--black3 text-weight-regular ml8">단위 : (원)</span>
        </template>

        <kw-btn
          label="저장"
          grid-action
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="download_on"
          :disable="totalCount === 0"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          dense
          primary
          label="확정"
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
import { useDataService, getComponentType, defineGrid, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const totalCount = ref(0);
const dataService = useDataService();
const { t } = useI18n();
const searchParams = ref({
  perfDt: '',
  ogType: '',
  rsbType: '',
  confirmDiv: '',
  ogLevel1: '',
  ogLevel2: '',
  ogLevel3: '',
});

const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData() {
  const res = await dataService.get('/sms/wells/fee/activity-people', { params: cachedParams });
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
    fileName: '실활동인원 관리',
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
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_PERF_YM'), styleName: 'text-center', width: '104', editable: false },
    { fieldName: 'col2', header: t('MSG_TXT_BLG'), styleName: 'text-center', width: '97', editable: false },
    { fieldName: 'col3', header: t('MSG_TXT_EMPL_NM'), styleName: 'text-center', width: '90', editable: false },
    { fieldName: 'col4', header: t('MSG_TXT_SEQUENCE_NUMBER'), styleName: 'text-center', width: '110', editable: false },
    { fieldName: 'col5', header: t('MSG_TXT_QLF'), styleName: 'text-center', width: '85', editable: false }, // '자격'
    { fieldName: 'col6', header: 'M+1', styleName: 'text-center', width: '85', editable: false },
    { fieldName: 'col7', header: t('MSG_TXT_BIZ_RGST_MM'), styleName: 'text-center', width: '136', editable: false }, // 업무등록월
    { fieldName: 'col8', header: t('MSG_TXT_FNL_CLTN_MM'), styleName: 'text-center', width: '136', editable: false }, // 최종해약월
    { fieldName: 'col9', header: `WM${t('MSG_TXT_OPNG')}`, styleName: 'text-center', width: '148', editable: false },
    { fieldName: 'col10', header: `WM${t('MSG_TXT_FNL_CLTN')}`, styleName: 'text-center', width: '148', editable: false },
    { fieldName: 'col11', header: t('MSG_TXT_PRFMT_MON'), styleName: 'text-center', width: '137', editable: false }, // 승진월
    { fieldName: 'col12', header: t('MSG_TXT_RE_OPNG'), styleName: 'text-center', width: '122', editable: false }, // 재개시제외
    { fieldName: 'col13', header: t('MSG_TXT_EXC_RESUME'), styleName: 'text-center', width: '122', editable: true }, // 달성구분
    { fieldName: 'col14', header: t('MSG_TXT_PD_ACC_RSLT'), styleName: 'text-center', width: '112', editable: false }, // 인정실적
    { fieldName: 'col15', header: t('MSG_TXT_PD_ACC_CNT'), styleName: 'text-center', width: '84', editable: false }, // 인정건수
    { fieldName: 'col16', header: `B/S${t('MSG_TXT_COUNT')}`, styleName: 'text-center', width: '84', editable: false }, // B/S건수
    { fieldName: 'col17', header: t('MSG_TXT_CMPF_EDUC'), styleName: 'text-center', width: '95', editable: false }, // 보수교육
    { fieldName: 'col18', header: t('MSG_TXT_PRTIC_EDUC'), styleName: 'text-center', width: '90', editable: false }, // 실전교육
    { fieldName: 'col19', header: t('MSG_TXT_NWCMR_EDUC'), styleName: 'text-center', width: '90', editable: false }, // 신입교육
    { fieldName: 'col20', header: t('MSG_TXT_RSN'), styleName: 'text-center', width: '267', editable: true }, // 사유
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  // multi row header setting
  view.setColumnLayout([
    {
      header: t('MSG_TXT_HMNRSC_INF'), // colspan title  //인사정보
      direction: 'horizontal', // merge type
      items: ['col1', 'col2', 'col3', 'col4', 'col5', 'col6', 'col7', 'col8', 'col9', 'col10', 'col11'],
    },
    'col12', 'col13',
    {
      header: t('MSG_TXT_ACL_ACTI_BASE_DTA'), // colspan title  //실활동기준 데이터
      direction: 'horizontal', // merge type
      items: ['col14', 'col15', 'col16', 'col17', 'col18', 'col19'],
    },
    'col20',
  ]);
  data.setRows([
    { col1: '2022-12', col2: 'D949200', col3: '이교원', col4: '123456', col5: 'WM', col6: 'SP', col7: '2022-12', col8: '2022-12', col9: '2022-12-24', col10: '', col11: '2022-12', col12: '-', col13: 'N', col14: '358,908', col15: '0', col16: '217', col17: '-', col18: '-', col19: '-', col20: '-' },
    { col1: '2022-12', col2: 'D949200', col3: '이교원', col4: '123456', col5: 'WM', col6: 'SP', col7: '2022-12', col8: '2022-12', col9: '2022-12-24', col10: '', col11: '2022-12', col12: '-', col13: 'N', col14: '358,908', col15: '0', col16: '217', col17: '-', col18: '-', col19: '-', col20: '-' },
    { col1: '2022-12', col2: 'D949200', col3: '이교원', col4: '123456', col5: 'WM', col6: 'SP', col7: '2022-12', col8: '2022-12', col9: '2022-12-24', col10: '', col11: '2022-12', col12: '-', col13: 'N', col14: '358,908', col15: '0', col16: '217', col17: '-', col18: '-', col19: '-', col20: '-' },
  ]);
});

</script>
