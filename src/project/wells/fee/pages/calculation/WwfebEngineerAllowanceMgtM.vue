<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebEngineerAllowanceMgtM - 엔지니어 수당 생성관리
3. 작성자 : seoin.jeon
4. 작성일 : 2023.02.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 엔지니어 수당 생성관리
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
            v-model="searchParams.perfYm"
            :label="$t('MSG_TXT_PERF_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RSB_TP')"
          required
        >
          <kw-option-group
            v-model="searchParams.rsbTp"
            type="radio"
            :options="[$t('MSG_TXT_EGER'), $t('MSG_TXT_ADMIN')]"
            rules="required"
            @change="onChangeRsbTp"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_BLG')"
          required
        >
          <kw-select
            v-model="searchParams.blg"
            :label="$t('MSG_TXT_BLG')"
            :options="[$t('MSG_TXT_ALL'), 'B', 'C', 'D']"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_SEQUENCE_NUMBER')">
          <kw-input
            v-model="searchParams.no"
            clearable
            icon="search"
            :on-click-icon="onClickSearchNo"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>
        {{ searchParams.perfYm }}
        {{ searchParams.rsbTp }} {{ $t('MSG_TXT_PRGS_STE') }}
      </h3>
      <kw-stepper
        v-model="stepInitNum"
        heading-text
        alternative-labels
      >
        <kw-step
          :name="1"
          :title="$t('MSG_TXT_PERF_AGRG')"
          :done="stepInitNum > 1"
          prefix="1"
          :done-icon="'retry'"
        />
        <kw-step
          :name="2"
          :title="$t('MSG_TXT_AW_CRT')"
          :done="stepInitNum > 2"
          prefix="2"
          :tooltip="'클릭하여 $수수료생성$를(을) 진행하세요.'"
          :active-icon="'write'"
          :on-click-icon="onClickPerformanceAggregate"
        />
        <kw-step
          :name="3"
          :title="$t('MSG_TXT_CNST_WRTE')"
          :done="stepInitNum > 3"
          prefix="3"
        />

        <kw-step-panel :name="2">
          <kw-action-top class="mt40">
            <template #left>
              <kw-paging-info :total-count="totalCount" />
              <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
            </template>
            <kw-btn
              grid-action
              :label="$t('MSG_BTN_HIS_MGT')"
              @click="onClickHisMgt"
            />
            <kw-separator
              vertical
              inset
              spaced
            />
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
            v-if="isGrdEgerVisible"
            ref="grdEgerRef"
            name="grdEger"
            :visible-rows="10"
            @init="initEgerMain"
          />
          <kw-grid
            v-if="isGrdEgerMngerVisible"
            ref="grdEgerMngerRef"
            name="grdEgerMnger"
            :visible-rows="10"
            @init="initEgerMnger"
          />
        </kw-step-panel>
      </kw-stepper>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useGlobal, useDataService } from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash-es';

const { modal } = useGlobal();
const dataService = useDataService();
const { t } = useI18n();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// ------------------------------------------------------------------------------------------------
const grdEgerRef = ref(getComponentType('KwGrid'));
const grdEgerMngerRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const stepInitNum = ref(2);
const isGrdEgerVisible = ref(true);
const isGrdEgerMngerVisible = ref(false);

// 조회조건
const searchParams = ref({
  perfYm: dayjs().subtract(1, 'month').format('YYYY-MM'),
  rsbTp: t('MSG_TXT_EGER'),
  blg: 'B',
  no: '',
});

// 직책유형 변경 이벤트
async function onChangeRsbTp() {
  totalCount.value = 0;

  if (searchParams.value.rsbTp === t('MSG_TXT_EGER')) {
    isGrdEgerVisible.value = true;
    isGrdEgerMngerVisible.value = false;
  } else if (searchParams.value.rsbTp === t('MSG_TXT_ADMIN')) {
    isGrdEgerVisible.value = false;
    isGrdEgerMngerVisible.value = true;
  }
}

// 조회
async function fetchData(apiUrl) {
  const res = await dataService.get(`/sms/wells/fee/eger-allowances/${apiUrl}`, { params: searchParams.value });
  const resData = res.data;
  totalCount.value = resData.length;

  if (apiUrl === 'engineers') {
    const view = grdEgerRef.value.getView();
    view.getDataSource().setRows(res.data);
    view.resetCurrent();
  } else if (apiUrl === 'engineer-managers') {
    const view = grdEgerMngerRef.value.getView();
    view.getDataSource().setRows(res.data);
    view.resetCurrent();
  }
}

// 조회 버튼 클릭 이벤트
async function onClickSearch() {
  if (searchParams.value.rsbTp === t('MSG_TXT_EGER')) {
    await fetchData('engineers');
  } else if (searchParams.value.rsbTp === t('MSG_TXT_ADMIN')) {
    await fetchData('engineer-managers');
  }
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdEgerRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

// 번호 검색 아이콘 클릭 이벤트
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.no,
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.no = payload.prtnrNo;
    }
  }
}

// 이력관리 버튼 클릭 이벤트
async function onClickHisMgt() {
  // (TODO) 이력관리 팝업 ID 로 변경 필요
  await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.no,
    },
  });
}

// 실적 집계 클릭 이벤트
async function onClickPerformanceAggregate() {
  await modal({
    component: 'WwfeaEgerAllowancePerfAgrgRegP',
    componentProps: {
      perfYm: searchParams.value.perfYm,
      rsbTp: searchParams.value.rsbTp,
    },
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initEgerMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_BLG'), width: '146', styleName: 'text-left' },
    { fieldName: 'col2', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '94', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_EMPL_NM'), width: '90', styleName: 'text-left' },
    { fieldName: 'col4', header: t('MSG_TXT_WK_GRP'), width: '111', styleName: 'text-left' },
    { fieldName: 'col5', header: t('MSG_TXT_RSB'), width: '126', styleName: 'text-left' },
    { fieldName: 'col6', header: t('MSG_TXT_CRLV'), width: '90', styleName: 'text-left ' },
    { fieldName: 'col7', header: t('MSG_TXT_OUTC_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col8', header: t('MSG_TXT_QLF') + t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col9', header: t('MSG_TXT_CTR') + t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col10', header: t('MSG_TXT_AW') + t('MSG_TXT_SUM'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col11', header: t('MSG_TXT_DTRM_DATE'), width: '126', styleName: 'text-center', dataType: 'date', datetimeFormat: 'yyyy-MM-dd' },

  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'col1', 'col2', 'col3', 'col4', 'col5', 'col6', // single
    {
      header: t('MSG_TXT_AW') + t('MSG_TXT_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col7', 'col8', 'col9', 'col10'],
    },
    'col11',
  ]);
});

const initEgerMnger = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CENTER_DIVISION'), width: '146', styleName: 'text-left' },
    { fieldName: 'col2', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '94', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_EMPL_NM'), width: '90', styleName: 'text-left' },
    { fieldName: 'col4', header: t('MSG_TXT_RSB'), width: '126', styleName: 'text-left' },
    { fieldName: 'col5', header: t('MSG_TXT_CRLV'), width: '90', styleName: 'text-left ' },
    { fieldName: 'col6', header: t('MSG_TXT_OUTC_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col7', header: t('MSG_TXT_QLF') + t('MSG_TXT_AW'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'col8', header: t('MSG_TXT_AW') + t('MSG_TXT_SUM'), width: '180', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },

  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'col1', 'col2', 'col3', 'col4', 'col5',
    {
      header: t('MSG_TXT_AW') + t('MSG_TXT_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col6', 'col7', 'col8'],
    },
  ]);
});

</script>
