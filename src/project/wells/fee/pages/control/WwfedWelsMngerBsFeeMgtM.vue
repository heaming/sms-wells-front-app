<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FED
2. 프로그램 ID : WwfedWelsMngerBsFeeMgtM - WM 방문실적 및 수수료 관리
3. 작성자 : gs.piit150
4. 작성일 : 2023.03.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- WM 방문실적 및 수수료 관리 조회 화면
*************
-->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
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
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          required
        >
          <kw-input
            v-model="searchParams.no"
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
            icon="search"
            clearable
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3 class="mb20">
        {{ t('MSG_TXT_HMNRSC_INF') }}
      </h3>
      <kw-form
        :cols="3"
        align-content="left"
        dense
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_THM')+t('MSG_TXT_BRANCH')"
          >
            <p>{{ info1.col1 }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_TASK')+t('MSG_TXT_RGS')"
          >
            <p>{{ info1.col2 }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_STMNT')+t('MSG_TXT_NMN')"
          >
            <p>{{ info1.col3 }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_THM')+t('MSG_TXT_CRLV')"
          >
            <p>{{ info1.col4 }}</p>
          </kw-form-item>
          <kw-form-item
            :label="'WM'+t('MSG_TXT_OPNG')"
          >
            <p>{{ info1.col5 }}</p>
          </kw-form-item>
          <kw-form-item
            :label="'WM'+t('MSG_TXT_CLTN')"
          >
            <p>{{ info1.col6 }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <div class="grid-horizontal-wrap">
        <div class="grid-horizontal-wrap__section">
          <h3>{{ t('MSG_TXT_VISIT_RECORD') }}</h3>
          <kw-action-top>
            <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
          </kw-action-top>
          <kw-grid
            ref="grd1MainRef"
            name="grd1Main"
            :visible-rows="8"
            @init="initGrd1Main"
          />
          <ul class="grid-fix-footer pb0">
            <li class="grid-fix-footer__item">
              <span class="grid-fix-footer__label">{{ t('MSG_TXT_VISIT_RECORD') }}</span>
              <p class="grid-fix-footer__data">
                {{ stringUtil.getNumberWithComma(info2.col1) }}
              </p>
            </li>
            <li class="grid-fix-footer__item">
              <span class="grid-fix-footer__label">{{ t('MSG_TXT_PROCS_RT') }}(%)</span>
              <p class="grid-fix-footer__data">
                {{ info2.col2 }}
              </p>
            </li>
            <li class="grid-fix-footer__item">
              <span class="grid-fix-footer__label">{{ t('MSG_TXT_PD_ACC_CNT') }}</span>
              <p class="grid-fix-footer__data">
                {{ stringUtil.getNumberWithComma(info2.col3) }}
              </p>
            </li>
          </ul>
          <ul class="grid-fix-footer pt12">
            <li class="grid-fix-footer__item">
              <span class="grid-fix-footer__label">W1{{ t('MSG_TXT_COUNT') }}</span>
              <p class="grid-fix-footer__data">
                {{ stringUtil.getNumberWithComma(info2.col4) }}
              </p>
            </li>
            <li class="grid-fix-footer__item">
              <span class="grid-fix-footer__label">W2{{ t('MSG_TXT_COUNT') }}</span>
              <p class="grid-fix-footer__data">
                {{ stringUtil.getNumberWithComma(info2.col5) }}
              </p>
            </li>
            <li class="grid-fix-footer__item">
              <span class="grid-fix-footer__label">{{ t('MSG_TXT_ENVR')+t('MSG_TXT_COUNT') }}</span>
              <p class="grid-fix-footer__data">
                {{ stringUtil.getNumberWithComma(info2.col6) }}
              </p>
            </li>
          </ul>
        </div>
        <div class="grid-horizontal-wrap__section w472">
          <h3>{{ t('MSG_TXT_FEE_IZ') }}</h3>
          <kw-action-top>
            <template #left>
              <span>{{ t('MSG_TXT_UNIT_WON') }}</span>
            </template>
            <kw-btn
              :label="$t('MSG_BTN_SAVE')"
              grid-action
              @click="onClickSave"
            />
          </kw-action-top>
          <kw-grid
            ref="grd2MainRef"
            name="grd2Main"
            :visible-rows="10"
            @init="initGrd2Main"
          />
          <ul class="grid-fix-footer column">
            <li class="grid-fix-footer__item">
              <span class="grid-fix-footer__label">{{ t('MSG_TXT_DSB')+t('MSG_TXT_SUM') }}</span>
              <p class="grid-fix-footer__data">
                {{ stringUtil.getNumberWithComma(info3.col1) }}
              </p>
            </li>
            <li class="grid-fix-footer__item">
              <span class="grid-fix-footer__label">{{ t('MSG_TXT_DDTN')+t('MSG_TXT_SUM') }}</span>
              <p class="grid-fix-footer__data">
                10,000
              </p>
            </li>
            <li class="grid-fix-footer__item">
              <span class="grid-fix-footer__label">{{ t('MSG_TXT_DSB')+t('MSG_TXT_TAM') }}</span>
              <p class="grid-fix-footer__data">
                {{ stringUtil.getNumberWithComma(info3.col2) }}
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, useGlobal, stringUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();
const { alert } = useGlobal();

const now = dayjs();
const grd1MainRef = ref(getComponentType('KwGrid'));
const grd2MainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const searchParams = ref({

  perfYm: now.format('YYYYMM'),
  no: '',

});

const info1 = ref({
  col1: '',
  col2: '',
  col3: '',
  col4: '',
  col5: '',
  col6: '',
});

const info2 = ref({
  col1: '',
  col2: '',
  col3: '',
  col4: '',
  col5: '',
  col6: '',
});

const info3 = ref({
  col1: '',
  col2: '',
});

let cachedParams;

const saveData = ref({
  /*
  perfYm: props.perfYm,
  perfDv: props.perfDv,
  perfDvTxt: props.perfDvTxt,
  */
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData(type) {
  const response = await dataService.get(`/sms/wells/fee/wm-bs-fees/${type}`, { params: cachedParams });
  const resData = response.data;
  totalCount.value = resData.length;
  if (type === 'human-resources') {
    info1.value = resData;
  } else if (type === 'visits') {
    const controlView = grd1MainRef.value.getView();
    controlView.getDataSource().setRows(resData);
    controlView.resetCurrent();
  } else if (type === 'fees') {
    const controlView = grd2MainRef.value.getView();
    controlView.getDataSource().setRows(resData);
    controlView.resetCurrent();
  } else if (type === 'visit-aggregate') {
    info2.value = resData;
  } else if (type === 'fee-aggregate') {
    info3.value = resData;
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData('human-resources');
  await fetchData('visits');
  await fetchData('fees');
  await fetchData('visit-aggregate');
  await fetchData('fee-aggregate');
}

async function onClickSave() {
  const response = await dataService.post('/sms/wells/fee/wm-bs-fees', saveData);

  if (response.data.processCount > 0) {
    await alert(t('MSG_ALT_SVE_DATA'));
  } else {
    await alert(t('MSG_ALT_SVE_ERR'));
  }
  // ok(response.data);
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrd1Main(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2', dataType: 'number' },
    { fieldName: 'col3', dataType: 'number' },
    { fieldName: 'col4', dataType: 'number' },
    { fieldName: 'col5', dataType: 'number' },
    { fieldName: 'col6', dataType: 'number' },
    { fieldName: 'col7', dataType: 'number' },
    { fieldName: 'col8', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_PRDT'), width: '140', footer: { text: '합계', styleName: 'text-center' } },
    { fieldName: 'col2', header: t('MSG_TXT_MGT'), width: '90', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'col3', header: t('MSG_TXT_VST'), width: '90', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'col4', header: t('MSG_TXT_AMT'), width: '90', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'col5', header: t('MSG_TXT_MGT'), width: '90', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'col6', header: t('MSG_TXT_VST'), width: '90', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'col7', header: t('MSG_TXT_AMT'), width: '90', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'col8', header: t('MSG_TXT_SUM'), width: '114', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setFooters({ visible: true, items: [{ height: 30 }] });

  // multi row header setting
  view.setColumnLayout([
    'col1', // single
    {
      header: t('MSG_TXT_GE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['col2', 'col3', 'col4'],
    },
    {
      header: t('MSG_TXT_FXAM'),
      direction: 'horizontal',
      items: ['col5', 'col6', 'col7'],
    },
    'col8',
  ]);
}

function initGrd2Main(data, view) {
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
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_GE'), width: '90', styleName: 'text-left' },
    { fieldName: 'col2', header: t('MSG_TXT_AMT'), width: '92', styleName: 'text-right' },
    { fieldName: 'col3', header: t('MSG_TXT_ADD') + t('MSG_TXT_DSB'), width: '115', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_FEE_DDTN'), width: '115', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}

</script>

<style scoped lang="scss">
.grid-fix-footer {
  &__item {
    flex: 1 1 calc(100% / 3);
  }
}
</style>
