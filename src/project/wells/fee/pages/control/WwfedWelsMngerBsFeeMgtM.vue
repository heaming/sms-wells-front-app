<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FED
2. 프로그램 ID : WwfedWelsMngerBsFeeMgtM - WM 방문실적 및 수수료 관리
3. 작성자 : min-kyu bae
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
            :maxlength="10"
            rules="required"
            :on-click-icon="onClickSearchNo"
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
            <p>{{ info1.thmBranch }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_TASK')+t('MSG_TXT_RGS')"
          >
            <p>{{ stringUtil.getDateFormat(info1.taskRgs,'YYYY-MM-DD') }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_STMNT')+t('MSG_TXT_NMN')"
          >
            <p>{{ info1.stmntNmn }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_THM')+t('MSG_TXT_CRLV')"
          >
            <p>{{ info1.thmCrlv }}</p>
          </kw-form-item>
          <kw-form-item
            :label="'WM'+t('MSG_TXT_OPNG')"
          >
            <p>{{ stringUtil.getDateFormat(info1.wmOpng,'YYYY-MM-DD') }}</p>
          </kw-form-item>
          <kw-form-item
            :label="'WM'+t('MSG_TXT_CLTN')"
          >
            <p>{{ stringUtil.getDateFormat(info1.wmCltn,'YYYY-MM-DD') }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <div class="grid-horizontal-wrap">
        <div class="grid-horizontal-wrap__section">
          <h3>{{ t('MSG_TXT_VISIT_RECORD') }}</h3>
          <kw-action-top>
            <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
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
                {{ stringUtil.getNumberWithComma(info2.visitRecord) }}
              </p>
            </li>
            <li class="grid-fix-footer__item">
              <span class="grid-fix-footer__label">{{ t('MSG_TXT_PROCS_RT') }}(%)</span>
              <p class="grid-fix-footer__data">
                {{ info2.procsRt }}
              </p>
            </li>
            <li class="grid-fix-footer__item">
              <span class="grid-fix-footer__label">{{ t('MSG_TXT_PD_ACC_CNT') }}</span>
              <p class="grid-fix-footer__data">
                {{ stringUtil.getNumberWithComma(info2.pdAccCnt) }}
              </p>
            </li>
          </ul>
          <ul class="grid-fix-footer pt12">
            <li class="grid-fix-footer__item">
              <span class="grid-fix-footer__label">W1{{ t('MSG_TXT_COUNT') }}</span>
              <p class="grid-fix-footer__data">
                {{ stringUtil.getNumberWithComma(info2.w1Cnt) }}
              </p>
            </li>
            <li class="grid-fix-footer__item">
              <span class="grid-fix-footer__label">W2{{ t('MSG_TXT_COUNT') }}</span>
              <p class="grid-fix-footer__data">
                {{ stringUtil.getNumberWithComma(info2.w2Cnt) }}
              </p>
            </li>
            <li class="grid-fix-footer__item">
              <span class="grid-fix-footer__label">{{ t('MSG_TXT_ENVR')+t('MSG_TXT_COUNT') }}</span>
              <p class="grid-fix-footer__data">
                {{ stringUtil.getNumberWithComma(info2.envrCnt) }}
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
                {{ stringUtil.getNumberWithComma(info3.dsbSum) }}
              </p>
            </li>
            <li class="grid-fix-footer__item">
              <span class="grid-fix-footer__label">{{ t('MSG_TXT_DDTN')+t('MSG_TXT_SUM') }}</span>
              <p class="grid-fix-footer__data">
                {{ stringUtil.getNumberWithComma(info3.ddtnSum) }}
              </p>
            </li>
            <li class="grid-fix-footer__item">
              <span class="grid-fix-footer__label">{{ t('MSG_TXT_DSB')+t('MSG_TXT_TAM') }}</span>
              <p class="grid-fix-footer__data">
                {{ stringUtil.getNumberWithComma(info3.dsbTam) }}
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
import { useDataService, getComponentType, stringUtil, defineGrid, gridUtil, notify, modal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();

const now = dayjs();
const grd1MainRef = ref(getComponentType('KwGrid'));
const grd2MainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const searchParams = ref({

  perfYm: now.format('YYYYMM'),
  no: '',

});

const info1 = ref({
  thmBranch: '',
  taskRgs: '',
  stmntNmn: '',
  thmCrlv: '',
  wmOpng: '',
  wmCltn: '',
});

const info2 = ref({
  visitRecord: '',
  procsRt: '',
  pdAccCnt: '',
  w1Cnt: '',
  w2Cnt: '',
  envrCnt: '',
});

const info3 = ref({
  ddtnSum: '',
  dsbSum: '',
  dsbTam: '',
});

let cachedParams;

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData(type) {
  const response = await dataService.get(`/sms/wells/fee/wm-bs-fees/${type}`, { params: cachedParams, timeout: 300000 });
  const resData = response.data;
  totalCount.value = resData.length;
  if (type === 'human-resources') {
    info1.value = resData;
  } else if (type === 'visits') {
    const controlView = grd1MainRef.value.getView();
    controlView.getDataSource().setRows(resData);
  } else if (type === 'fees') {
    if (info1.value.thmBranch !== undefined) {
      const controlView = grd2MainRef.value.getView();
      controlView.getDataSource().setRows(resData);
    } else {
      grd2MainRef.value.getView().getDataSource().clearRows();
    }
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
/*
 *  Event - 저장 버튼 클릭 (조정 리스트 저장)
 */

async function onClickSave() {
  const view = grd2MainRef.value.getView();
  const changedRows = gridUtil.getChangedRowValues(view);
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  await dataService.post('/sms/wells/fee/wm-bs-fees', changedRows);
  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

// 번호 검색 아이콘 클릭 이벤트
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.no,
      ogTpCd: 'W03',
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.no = payload.prtnrNo;
    }
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd1Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cdNm' },
    { fieldName: 'cnt1', dataType: 'number' },
    { fieldName: 'cnt2', dataType: 'number' },
    { fieldName: 'amt1', dataType: 'number' },
    { fieldName: 'cnt3', dataType: 'number' },
    { fieldName: 'cnt4', dataType: 'number' },
    { fieldName: 'amt2', dataType: 'number' },
    { fieldName: 'sumAmt', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'cdNm', header: t('MSG_TXT_PRDT'), width: '140', footer: { text: '합계', styleName: 'text-center' } },
    { fieldName: 'cnt1', header: t('MSG_TXT_MGT'), width: '90', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'cnt2', header: t('MSG_TXT_VST'), width: '90', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'amt1', header: t('MSG_TXT_AMT'), width: '90', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'cnt3', header: t('MSG_TXT_MGT'), width: '90', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'cnt4', header: t('MSG_TXT_VST'), width: '90', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'amt2', header: t('MSG_TXT_AMT'), width: '90', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'sumAmt', header: t('MSG_TXT_SUM'), width: '114', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setFooters({ visible: true, items: [{ height: 42 }] });

  // multi row header setting
  view.setColumnLayout([
    'cdNm', // single
    {
      header: t('MSG_TXT_GE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['cnt1', 'cnt2', 'amt1'],
    },
    {
      header: t('MSG_TXT_FXAM'),
      direction: 'horizontal',
      items: ['cnt3', 'cnt4', 'amt2'],
    },
    'sumAmt',
  ]);
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'feeNm' },
    { fieldName: 'feeCalcAmt', dataType: 'number' },
    { fieldName: 'feeCtrCnfmAmt', dataType: 'number' },
    { fieldName: 'feeCtrRsonCn' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'baseYm' },
    { fieldName: 'ogTpCd' },
    { fieldName: 'feeCd' },
  ];

  const columns = [
    { fieldName: 'feeNm', header: t('MSG_TXT_GE'), width: '90', styleName: 'text-left', editable: false },
    { fieldName: 'feeCalcAmt', header: t('MSG_TXT_AMT'), width: '92', styleName: 'text-right', editable: false, dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'feeCtrCnfmAmt', header: t('MSG_TXT_AMT_AFT_ADJ'), width: '115', styleName: 'text-center', editor: { type: 'number', textAlignment: 'far', editFormat: '#,##0', maxIntegerLength: 8 } },
    { fieldName: 'feeCtrRsonCn', header: t('MSG_TXT_RSN_FR_ADJ'), width: '115', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_ETC'), width: '115', styleName: 'text-center', visible: false },
    { fieldName: 'baseYm', header: t('MSG_TXT_ETC'), width: '115', styleName: 'text-center', visible: false },
    { fieldName: 'ogTpCd', header: t('MSG_TXT_ETC'), width: '115', styleName: 'text-center', visible: false },
    { fieldName: 'feeCd', header: t('MSG_TXT_ETC'), width: '115', styleName: 'text-center', visible: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
});

</script>

<style scoped lang="scss">
.grid-fix-footer {
  &__item {
    flex: 1 1 calc(100% / 3);
  }
}
</style>
