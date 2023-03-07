<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEE
2. 프로그램 ID : WwfeeIndividualFeeListM - 수수료 조회
3. 작성자 : min-kyu bae
4. 작성일 : 2023.03.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수수료 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            :label="$t('MSG_TXT_PERF_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OG_TP')"
          required
        >
          <kw-select
            v-model="searchParams.ogTp"
            :label="$t('MSG_TXT_OG_TP')"
            :options="['M추진단', 'P추진단','홈마스터']"
            rules="required"
            @change="onChangeOgTp"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RSB_TP')"
          required
        >
          <kw-option-group
            v-model="searchParams.rsbTp"
            :label="$t('MSG_TXT_RSB_TP')"
            type="radio"
            rules="required"
            :options="['플래너', '지점장']"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.ogLevl1"
            :model-value="''"
            :options="['총괄단', 'B']"
          />
          <kw-select
            v-model="searchParams.ogLevl2"
            :model-value="''"
            :options="['지역단', 'B']"
          />
          <kw-select
            v-model="searchParams.ogLevl3"
            :model-value="''"
            :options="['지점', 'B']"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.no"
            icon="search"
            clearable
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_FEE')+t('MSG_TXT_DSB_YN')"
          required
        >
          <kw-option-group
            v-model="searchParams.feeDsbYn"
            type="radio"
            :label="t('MSG_TXT_FEE')+t('MSG_TXT_DSB_YN')"
            rules="required"
            :options="['전체', 'Y', 'N']"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          secondary
          dense
          :label="$t('MSG_BTN_DSB_SPCSH_PRNT')"
          @click="openReportPopup"
        />
      </kw-action-top>
      <kw-grid
        v-if="isSelectVisile"
        ref="grd1MainRef"
        name="grd1Main"
        :visible-rows="3"
        @init="initGrd1Main"
      />
      <kw-grid
        v-if="isSelectVisile2"
        ref="grd2MainRef"
        name="grd2Main"
        :visible-rows="3"
        @init="initGrd2Main"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, defineGrid, modal } from 'kw-lib';
import dayjs from 'dayjs';

import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grd1MainRef = ref(getComponentType('KwGrid'));
const grd2MainRef = ref(getComponentType('KwGrid'));
const isSelectVisile = ref(true);
const isSelectVisile2 = ref(false);
const totalCount = ref(0);
const searchParams = ref({

  perfYm: now.format('YYYYMM'),
  ogTp: '',
  rsbTp: '',
  ogLevl1: '',
  ogLevl2: '',
  ogLevl3: '',
  no: '',
  feeDsbYn: '전체',
  prPerfYm: '',
  prOgTp: '',
});

let cachedParams;

const router = useRouter();
/*
 *  Event - 그리드 사번 클릭시 개인상세조회 페이지 이동
 */
async function movePage(no) {
  let url = '';

  if (searchParams.value.prOgTp === 'M추진단') {
    url = '/fee/wwfee-individual-fee-manager-list';
  } else if (searchParams.value.prOgTp === 'P추진단') {
    url = '/fee/wwfee-individual-fee-planner-list';
  } else if (searchParams.value.prOgTp === '홈마스터') {
    url = '/fee/wwfee-individual-fee-home-master-list';
  }

  router.push({
    path: url,
    query: {
      perfYm: searchParams.value.prPerfYm,
      partnerNo: no },
  });
}
/*
 *  Event - 조직유형 선택에 따른 그리드 변경
 */
async function onChangeOgTp() {
  const { ogTp } = searchParams.value;

  if (ogTp === 'M추진단' || ogTp === 'P추진단') {
    isSelectVisile.value = true;
    isSelectVisile2.value = false;
  } else if (ogTp === '홈마스터') {
    isSelectVisile.value = false;
    isSelectVisile2.value = true;
  }
}
/*
 *  Event - 지급명세서 출력 버튼 클릭  ※현재 팝업화면 없음
 */
async function openReportPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    no: searchParams.value.no,
  };

  await modal({
    component: 'openReportPopup',
    componentProps: param,
  });
}

async function fetchData(uri) {
  const response = await dataService.get(`/sms/wells/fee/individual-fees/${uri}`, { params: cachedParams });
  const fees = response.data;
  searchParams.value.prPerfYm = searchParams.value.perfYm;
  searchParams.value.prOgTp = searchParams.value.ogTp;
  totalCount.value = fees.length;
  cachedParams = cloneDeep(searchParams.value);
  if (isSelectVisile.value) {
    const managerView = grd1MainRef.value.getView();
    managerView.getDataSource().setRows(fees);
    managerView.resetCurrent();
  } else if (isSelectVisile2.value) {
    const homeMasterView = grd2MainRef.value.getView();
    homeMasterView.getDataSource().setRows(fees);
    homeMasterView.resetCurrent();
  }
}

async function onClickSearch() {
  let uri = '';
  cachedParams = cloneDeep(searchParams.value);
  if (isSelectVisile.value) {
    uri = 'manager-planers';
  } else if (isSelectVisile2.value) {
    uri = 'home-masters';
  }
  await fetchData(uri);
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd1Main = defineGrid((data, view) => {
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
    { fieldName: 'col10', dataType: 'number' },
    { fieldName: 'col11', dataType: 'number' },
    { fieldName: 'col12', dataType: 'number' },
    { fieldName: 'col13', dataType: 'number' },
    { fieldName: 'col14', dataType: 'number' },
    { fieldName: 'col15', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '98' },
    { fieldName: 'col2', header: t('MSG_TXT_RGNL_GRP'), width: '98' },
    { fieldName: 'col3', header: t('MSG_TXT_BRANCH'), width: '98' },
    { fieldName: 'col4', header: t('MSG_TXT_EMPL_NM'), width: '95' },
    { fieldName: 'col5', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '124', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_RSB'), width: '71' },
    { fieldName: 'col7', header: t('MSG_TXT_QLF'), width: '110' },

    { fieldName: 'col8', header: t('MSG_TXT_BNK'), width: '80' },
    { fieldName: 'col9', header: t('MSG_TXT_AC_NO'), width: '127' },
    { fieldName: 'col10', header: t('MSG_TXT_INTBS_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'col11', header: t('MSG_TXT_DDTN_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'col12', header: t('MSG_TXT_ACL_DSB_AMT'), width: '111', styleName: 'text-right' },
    { fieldName: 'col13', header: t('MSG_TXT_AWD') + t('MSG_TXT_INTBS_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'col14', header: t('MSG_TXT_AWD') + t('MSG_TXT_DDTN_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'col15', header: t('MSG_TXT_AWD') + t('MSG_TXT_ACL_DSB_AMT'), width: '111', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellDblClicked = async (g, { dataRow, column }) => {
    if (column === 'col5') {
      movePage(g.getValue(dataRow, 'col5'));
    }
  };
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9', dataType: 'number' },
    { fieldName: 'col10', dataType: 'number' },
    { fieldName: 'col11', dataType: 'number' },
    { fieldName: 'col12', dataType: 'number' },
    { fieldName: 'col13', dataType: 'number' },
    { fieldName: 'col14', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_RGNL_GRP'), width: '98' },
    { fieldName: 'col2', header: t('MSG_TXT_BRANCH'), width: '98' },
    { fieldName: 'col3', header: t('MSG_TXT_EMPL_NM'), width: '95' },
    { fieldName: 'col4', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '124', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_RSB'), width: '71' },
    { fieldName: 'col6', header: t('MSG_TXT_QLF'), width: '110' },

    { fieldName: 'col7', header: t('MSG_TXT_BNK'), width: '80' },
    { fieldName: 'col8', header: t('MSG_TXT_AC_NO'), width: '127' },
    { fieldName: 'col9', header: t('MSG_TXT_INTBS_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_DDTN_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'col11', header: t('MSG_TXT_ACL_DSB_AMT'), width: '111', styleName: 'text-right' },
    { fieldName: 'col12', header: t('MSG_TXT_AWD') + t('MSG_TXT_INTBS_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'col13', header: t('MSG_TXT_AWD') + t('MSG_TXT_DDTN_SUM'), width: '111', styleName: 'text-right' },
    { fieldName: 'col14', header: t('MSG_TXT_AWD') + t('MSG_TXT_ACL_DSB_AMT'), width: '111', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellDblClicked = async (g, { dataRow, column }) => {
    if (column === 'col4') {
      movePage(g.getValue(dataRow, 'col4'));
    }
  };
});
</script>
