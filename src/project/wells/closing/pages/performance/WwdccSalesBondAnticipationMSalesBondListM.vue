<!----adamt
****************************************************************************************************
1. 모듈 : DCC
2. 프로그램 ID : WwdccSalesBondListM - 매출채권/선수금 현황 - 매출채권 // W-CL-U-0058M06
3. 작성자 : gs.piit172 kim juhyun
4. 작성일 : 2023.03.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 매출채권/선수금 현황 - 매출채권 프로그램
****************************************************************************************************
--->
<template>
  <kw-search
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_BASE_YM')"
      >
        <kw-date-picker
          v-model="searchParams.perfYm"
          type="month"
          rules="date_range_months:1"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_AGRG_DV')">
        <kw-option-group
          v-model="searchParams.agrgDv"
          type="radio"
          :options="selectAgrgDv.options"
          @change="onChangeRadioTaskDiv"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_TASK_DIV')">
        <kw-select
          v-model="searchParams.sellTpCd"
          :options="codes.SELL_TP_CD"
          @change="onSelectTaskDiv"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="$t('MSG_TXT_SEL_TYPE')">
        <kw-select
          v-model="searchParams.sellTpDtlCd"
          :options="filterCds.sellTpDtlCd"
          :disable="isSelectDisable"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_SEL_CHNL')">
        <kw-select
          v-model="searchParams.sellChnlDtl"
          :options="codes.SELL_CHNL_DTL_CD"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
        <kw-input
          v-model.trim="searchParams.cntr"
          icon="search_24"
          :disable="isDisable"
          @click-icon="onClickIcon"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>
  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="totalCount" />
        <span
          class="ml8"
        >
          {{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <kw-btn
        icon="report"
        dense
        secondary
        :label="$t('MSG_TXT_RPT_BRWS')"
        @click="onClickOpenReport"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <kw-btn
        icon="download_on"
        :disable="totalCount === 0"
        dense
        secondary
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        @click="onClickExcelDownload"
      />
    </kw-action-top>

    <kw-grid
      v-show="isGridSix"
      ref="grdSixRef"
      name="grdSix"
      :visible-rows="10"
      @init="initGrdSix"
    />
    <kw-grid
      v-show="isGridSeven"
      ref="grdSevenRef"
      name="grdSeven"
      :visible-rows="10"
      @init="initGrdSeven"
    />
    <kw-grid
      v-show="isGridEight"
      ref="grdEightRef"
      name="grdEight"
      :visible-rows="10"
      @init="initGrdEight"
    />
    <kw-grid
      v-show="isGridNine"
      ref="grdNineRef"
      name="grdNine"
      :visible-rows="10"
      @init="initGrdNine"
    />
    <kw-grid
      v-show="isGridFive"
      ref="grdFiveRef"
      name="grdFive"
      :visible-rows="10"
      @init="initGrdFive"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, gridUtil, useDataService, useGlobal, defineGrid } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { modal } = useGlobal();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdSixRef = ref(getComponentType('KwGrid'));
const grdSevenRef = ref(getComponentType('KwGrid'));
const grdEightRef = ref(getComponentType('KwGrid'));
const grdNineRef = ref(getComponentType('KwGrid'));
const grdFiveRef = ref(getComponentType('KwGrid'));

const isSelectDisable = ref(true);
const isDisable = ref(false);
const isGridSix = ref(false);
const isGridSeven = ref(false);
const isGridEight = ref(false);
const isGridNine = ref(false);
const isGridFive = ref(true);

const totalCount = ref(0);

let cachedParams;
const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD', // 업무구분
  // 'PD_DTL_CD', 없음
  'SELL_TP_DTL_CD', // 판매유형
  'SELL_CHNL_DTL_CD', // 판매채널
);

const searchParams = ref({
  perfYm: dayjs().add(-1, 'M').format('YYYYMM'),
  agrgDv: '1', // 집계구분
  sellTpCd: '1', // 업무구분
  sellTpDtlCd: '',
  sellChnlDtl: '1',
  cntr: '',
});

const filterCds = ref({
  sellTpDtlCd: [],
});

async function fetchData() {
  const { agrgDv } = searchParams.value;
  const { sellTpCd } = searchParams.value;
  let res;
  if (agrgDv === '1') {
    res = await dataService.get('/sms/wells/closing/performance/sales-bond/aggregate', { params: cachedParams });
  } else if (agrgDv === '2') {
    res = await dataService.get('/sms/wells/closing/performance/sales-bond/dates', { params: cachedParams });
  } else if (agrgDv === '3') {
    res = await dataService.get('/sms/wells/closing/performance/sales-bond/orders', { params: cachedParams });
  } else if (agrgDv === '4') {
    res = await dataService.get('/sms/wells/closing/performance/sales-bond/members', { params: cachedParams });
  }

  const dataList = res.data;
  totalCount.value = dataList.length;

  let mainView;
  if (sellTpCd === '1') {
    mainView = grdFiveRef.value.getView();
  } else if (sellTpCd === '2') {
    mainView = grdSixRef.value.getView();
  } else if (sellTpCd === '3') {
    mainView = grdSevenRef.value.getView();
  } else if (sellTpCd === '4') {
    mainView = grdEightRef.value.getView();
  } else if (sellTpCd === '5') {
    mainView = grdNineRef.value.getView();
  }

  mainView.getDataSource().setRows(dataList);
  mainView.resetCurrent();
}

async function onChangeChechOption() {
  const { agrgDv } = searchParams.value; // 집계구분
  const { sellTpCd } = searchParams.value; // 업무구분
  // const { mlgBtdPrpdAmt } = searchParams.value; // 포인트 조회

  isGridFive.value = false;
  isGridSix.value = false;
  isGridSeven.value = false;
  isGridEight.value = false;
  isGridNine.value = false;

  if (agrgDv === '3') {
    isDisable.value = false;
  } else {
    isDisable.value = true;
  }

  if (sellTpCd === '1') {
    isGridFive.value = true;
  } else if (sellTpCd === '2') {
    isGridSix.value = true;
  } else if (sellTpCd === '3') {
    isGridSeven.value = true;
  } else if (sellTpCd === '4') {
    isGridEight.value = true;
  } else if (sellTpCd === '5') {
    isGridNine.value = true;
  }
}
async function onClickIcon() {
  const { dtlCntr } = searchParams.value;
  const res = await modal({
    component: 'WwctaContractNumberListP',
    componentProps: { dtlCntr },
  });

  if (res.result) {
    // res.result
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  fetchData();
}

async function onChangeRadioTaskDiv() {
  const { agrgDv } = searchParams.value;
  const { sellTpCd } = searchParams.value;

  if (sellTpCd === '1') {
    const view = grdFiveRef.value.getView();
    if (agrgDv === '1') {
      view.columnByName('perfDt').visible = false;
      view.columnByName('sellChnlCd').visible = false;
      view.columnByName('cntr').visible = false;
      view.columnByName('cstKnm').visible = false;
      view.columnByName('slDt').visible = false;
      view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 2 }];
    } else if (agrgDv === '2' || agrgDv === '3' || agrgDv === '4') {
      view.columnByName('perfDt').visible = true;
      view.columnByName('sellChnlCd').visible = true;
      view.columnByName('cntr').visible = true;
      view.columnByName('cstKnm').visible = true;
      view.columnByName('slDt').visible = true;
      view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 7 }];
    }
  } else if (sellTpCd === '2') {
    const view = grdSixRef.value.getView();
    if (agrgDv === '1') {
      view.columnByName('perfDt').visible = false;
      view.columnByName('sellChnlCd').visible = false;
      view.columnByName('col4').visible = false;
      view.columnByName('col5').visible = false;
      view.columnByName('aaa6').visible = false;
      view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 2 }];
    } else if (agrgDv === '2' || agrgDv === '3' || agrgDv === '4') {
      view.columnByName('perfDt').visible = true;
      view.columnByName('sellChnlCd').visible = true;
      view.columnByName('col4').visible = true;
      view.columnByName('col5').visible = true;
      view.columnByName('aaa6').visible = true;
      view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 7 }];
    }
  } else if (sellTpCd === '3') {
    const view = grdSevenRef.value.getView();
    if (agrgDv === '1') {
      view.columnByName('perfDt').visible = false;
      view.columnByName('sellChnlCd').visible = false;
      view.columnByName('col4').visible = false;
      view.columnByName('col5').visible = false;
      view.columnByName('qaa6').visible = false;
      view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 2 }];
    } else if (agrgDv === '2' || agrgDv === '3' || agrgDv === '4') {
      view.columnByName('perfDt').visible = true;
      view.columnByName('sellChnlCd').visible = true;
      view.columnByName('col4').visible = true;
      view.columnByName('col5').visible = true;
      view.columnByName('qaa6').visible = true;
      view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 7 }];
    }
  } else if (sellTpCd === '4') {
    const view = grdEightRef.value.getView();
    if (agrgDv === '1') {
      view.columnByName('perfDt').visible = false;
      view.columnByName('sellChnlCd').visible = false;
      view.columnByName('cntr').visible = false;
      view.columnByName('cstKnm').visible = false;
      view.columnByName('col6').visible = false;
      view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 2 }];
    } else if (agrgDv === '2' || agrgDv === '3' || agrgDv === '4') {
      view.columnByName('perfDt').visible = true;
      view.columnByName('sellChnlCd').visible = true;
      view.columnByName('cntr').visible = true;
      view.columnByName('cstKnm').visible = true;
      view.columnByName('col6').visible = true;
      view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 7 }];
    }
  } else if (sellTpCd === '5') {
    const view = grdNineRef.value.getView();
    if (agrgDv === '1') {
      view.columnByName('perfDt').visible = false;
      view.columnByName('sellChnlCd').visible = false;
      view.columnByName('vov4').visible = false;
      view.columnByName('cstKnm').visible = false;
      view.columnByName('col6').visible = false;
      view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 2 }];
    } else if (agrgDv === '2' || agrgDv === '3' || agrgDv === '4') {
      view.columnByName('perfDt').visible = true;
      view.columnByName('sellChnlCd').visible = true;
      view.columnByName('vov4').visible = true;
      view.columnByName('cstKnm').visible = true;
      view.columnByName('col6').visible = true;
      view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 7 }];
    }
  }
}

async function onSelectTaskDiv() {
  onChangeChechOption();
  onChangeRadioTaskDiv();
  const { sellTpCd } = searchParams.value;
  if (sellTpCd === '3' || sellTpCd === '5') {
    isSelectDisable.value = false;
  } else {
    isSelectDisable.value = true;
  }

  codes.SELL_TP_DTL_CD.forEach((e) => {
    if (sellTpCd === '2') {
      if (e.codeId === '1' || e.codeId === '2' || sellTpCd === '3' || sellTpCd === '4') {
        filterCds.value.sellTpDtlCd.push({
          codeId: e.codeId.trim(),
          codeName: e.codeName.trim(),
        });
      }
    } else if (sellTpCd === '5' || sellTpCd === '6') {
      filterCds.value.sellTpDtlCd.push({
        codeId: e.codeId.trim(),
        codeName: e.codeName.trim(),
      });
    }
  });
}

async function onClickExcelDownload() {
  let view;
  if (isGridFive.value === true) {
    view = grdFiveRef.value.getView();
  } else if (isGridSix.value === true) {
    view = grdSixRef.value.getView();
  } else if (isGridSeven.value === true) {
    view = grdSevenRef.value.getView();
  } else if (isGridEight.value === true) {
    view = grdEightRef.value.getView();
  } else if (isGridNine.value === true) {
    view = grdNineRef.value.getView();
  }
  await gridUtil.exportView(view, {
    fileName: `${t('MSG_TIT_SL_BND_ATAM_PS')} - ${t('MSG_TIT_BZNS_ATAM')}`,
    timePostfix: true,
  });
}

async function onClickOpenReport() {
  // 공통 오즈 팝업 가져오면됨

}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdSix = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'perfYm', header: t('MSG_TXT_PERF_YM'), width: '150', styleName: 'text-left' }, // 실적년월
    { fieldName: 'perfDt', header: t('MSG_TXT_PERF_DT'), wdth: '130', styleName: 'text-left' }, // 실적일자
    { fieldName: 'sellChnlCd', header: t('MSG_TXT_SEL_CHNL'), width: '130', styleName: 'text-left' }, // 판매채널
    { fieldName: 'col4', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'col5', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-left' }, // 고객명
    { fieldName: 'aaa6', header: t('MSG_TXT_SL_DT'), width: '130', styleName: 'text-center' }, // 매출일자
    { fieldName: 'bbb7', header: t('MSG_TXT_FTRM_CRDOVR'), width: '130', styleName: 'text-center' }, // 전기이월
    { fieldName: 'nomSlAmt', header: t('MSG_TXT_NOM_SL'), width: '150', styleName: 'text-center' }, // 정상매출
    { fieldName: 'kkl9', header: t('MSG_TXT_CAN_SL'), width: '150', styleName: 'text-right' }, // 취소매출
    { fieldName: 'kkl10', header: t('MSG_TXT_SUM'), width: '150', styleName: 'text-right' }, // 합계
    { fieldName: 'slBndAlrpyAmt', header: `${t('MSG_TXT_SL_CPRCNF')}(-)`, width: '150', styleName: 'text-right' }, // 매출대사
    { fieldName: 'col12', header: `${t('MSG_TXT_BOR_RES')}(+)`, width: '150', styleName: 'text-right' }, // 위약잔여
    { fieldName: 'col13', header: `${t('MSG_TXT_BOR_CTR')}(-)`, width: '150', styleName: 'text-right' }, // 위약조정
    { fieldName: 'col14', header: `${t('MSG_TXT_PRPD_CV')}(+)`, width: '150', styleName: 'text-right' }, // 선수전환
    { fieldName: 'dfaProcdAmt', header: `${t('MSG_TXT_DFA')}(-)`, width: '150', styleName: 'text-right' }, // 대손
    { fieldName: 'thmUcBlam', header: t('MSG_TXT_UC_AMT'), width: '150', styleName: 'text-right' }, // 미수금액
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  const layoutSub = [
    'perfYm',
    'perfDt',
    'sellChnlCd',
    'col4',
    'col5',
    'aaa6',
    'bbb7',
    {
      header: `${t('MSG_TXT_SL')}(+)`, /* 매출(+) */
      direction: 'horizontal',
      items: ['nomSlAmt', 'kkl9', 'kkl10'],
    },
    'slBndAlrpyAmt',
    'col12',
    'col13',
    'col14',
    'dfaProcdAmt',
    'thmUcBlam',
  ];
  view.setColumnLayout(layoutSub);

  view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 7 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
});

const initGrdSeven = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'perfYm', header: t('MSG_TXT_PERF_YM'), width: '150', styleName: 'text-left' }, // 실적년월
    { fieldName: 'perfDt', header: t('MSG_TXT_PERF_DT'), wdth: '130', styleName: 'text-left' }, // 실적일자
    { fieldName: 'sellChnlCd', header: t('MSG_TXT_SEL_CHNL'), width: '130', styleName: 'text-left' }, // 판매채널
    { fieldName: 'col4', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'col5', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-left' }, // 고객명
    { fieldName: 'qaa6', header: t('MSG_TXT_SL_DT'), width: '130', styleName: 'text-center' }, // 매출일자
    { fieldName: 'qbb7', header: t('MSG_TXT_FTRM_CRDOVR'), width: '130', styleName: 'text-center' }, // 전기이월
    { fieldName: 'crl8', header: t('MSG_TXT_PCAM_SL'), width: '150', styleName: 'text-center' }, // 원금매출
    { fieldName: 'crl9', header: t('MSG_TXT_INT_SL'), width: '150', styleName: 'text-right' }, // 이자매출
    { fieldName: 'qwq10', header: t('MSG_TXT_SV_SL'), width: '150', styleName: 'text-right' }, // 서비스매출
    { fieldName: 'qwq11', header: t('MSG_TXT_SUM'), width: '150', styleName: 'text-right' }, // 합계
    { fieldName: 'col12', header: `${t('MSG_TXT_SL_CTR')}(-)`, width: '150', styleName: 'text-right' }, // 매출조정
    { fieldName: 'slBndAlrpyAmt', header: `${t('MSG_TXT_SL_CPRCNF')}(-)`, width: '150', styleName: 'text-right' }, // 매출대사
    { fieldName: 'dfaProcdAmt', header: `${t('MSG_TXT_DFA')}(-)`, width: '150', styleName: 'text-right' }, // 대손
    { fieldName: 'thmUcBlam', header: t('MSG_TXT_UC_AMT'), width: '150', styleName: 'text-right' }, // 미수금액
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  const layoutThird = [
    'perfYm', 'perfDt', 'sellChnlCd', 'col4', 'col5', 'qaa6', 'qbb7',
    {
      header: `${t('MSG_TXT_SL')}(+)`, /* 매출(+) */
      direction: 'horizontal',
      items: ['crl8', 'crl9', 'qwq10', 'qwq11'],
    },
    'col12',
    'slBndAlrpyAmt',
    'dfaProcdAmt',
    'thmUcBlam',
  ];
  view.setColumnLayout(layoutThird);

  view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 7 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
});
const initGrdEight = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'perfYm', header: t('MSG_TXT_PERF_YM'), width: '150', styleName: 'text-left' }, // 실적년월
    { fieldName: 'perfDt', header: t('MSG_TXT_PERF_DT'), wdth: '130', styleName: 'text-left' }, // 실적일자
    { fieldName: 'sellChnlCd', header: t('MSG_TXT_SEL_CHNL'), width: '130', styleName: 'text-left' }, // 판매채널
    { fieldName: 'cntr', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-left' }, // 고객명
    { fieldName: 'col6', header: t('MSG_TXT_SL_DT'), width: '130', styleName: 'text-center' }, // 매출일자
    { fieldName: 'col7', header: t('MSG_TXT_FTRM_CRDOVR'), width: '130', styleName: 'text-center' }, // 전기이월
    { fieldName: 'nomSlAmt', header: t('MSG_TXT_NOM_SL'), width: '150', styleName: 'text-center' }, // 정상매출
    { fieldName: 'col9', header: t('MSG_TXT_CAN_SL'), width: '150', styleName: 'text-right' }, // 취소매출
    { fieldName: 'col10', header: t('MSG_TXT_SUM'), width: '150', styleName: 'text-right' }, // 합계
    { fieldName: 'slBndAlrpyAmt', header: `${t('MSG_TXT_SL_CPRCNF')}(-)`, width: '150', styleName: 'text-right' }, // 매출대사
    { fieldName: 'dfaProcdAmt', header: `${t('MSG_TXT_DFA')}(-)`, width: '150', styleName: 'text-right' }, // 대손
    { fieldName: 'thmUcBlam', header: t('MSG_TXT_UC_AMT'), width: '150', styleName: 'text-right' }, // 미수금액
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  const layoutThird = [
    'perfYm',
    'perfDt',
    'sellChnlCd',
    'cntr',
    'cstKnm',
    'col6',
    'col7',
    {
      header: `${t('MSG_TXT_SL')}(+)`, /* 매출(+) */
      direction: 'horizontal',
      items: ['nomSlAmt', 'col9', 'col10'],
    },
    'slBndAlrpyAmt', 'dfaProcdAmt', 'thmUcBlam',
  ];
  view.setColumnLayout(layoutThird);
  view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 7 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
});

const initGrdNine = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'perfYm', header: t('MSG_TXT_PERF_YM'), width: '150', styleName: 'text-left' }, // 실적년월
    { fieldName: 'perfDt', header: t('MSG_TXT_PERF_DT'), wdth: '130', styleName: 'text-left' }, // 실적일자
    { fieldName: 'sellChnlCd', header: t('MSG_TXT_SEL_CHNL'), width: '130', styleName: 'text-left' }, // 판매채널
    { fieldName: 'vov4', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-left' }, // 고객명
    { fieldName: 'col6', header: t('MSG_TXT_SL_DT'), width: '130', styleName: 'text-center' }, // 매출일자
    { fieldName: 'col7', header: t('MSG_TXT_FTRM_CRDOVR'), width: '130', styleName: 'text-center' }, // 전기이월
    { fieldName: 'col8', header: `${t('MSG_TXT_SL')}(+)`, width: '130', styleName: 'text-center' }, // 매출
    { fieldName: 'slBndAlrpyAmt', header: `${t('MSG_TXT_SL_CPRCNF')}(-)`, width: '130', styleName: 'text-center' }, // 매출대사
    { fieldName: 'dfaProcdAmt', header: `${t('MSG_TXT_DFA')}(-)`, width: '150', styleName: 'text-right' }, // 대손
    { fieldName: 'thmUcBlam', header: t('MSG_TXT_UC_AMT'), width: '150', styleName: 'text-right' }, // 미수금액
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 7 }];

  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
});

const initGrdFive = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'perfYm',
      header: t('MSG_TXT_PERF_YM'),
      width: '150',
      styleName: 'text-left',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-center',
      } }, // 실적년월
    { fieldName: 'perfDt', header: t('MSG_TXT_PERF_DT'), wdth: '130', styleName: 'text-left' }, // 실적일자
    { fieldName: 'sellChnlCd', header: t('MSG_TXT_SEL_CHNL'), width: '130', styleName: 'text-left' }, // 판매채널
    { fieldName: 'cntr', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-left' }, // 고객명
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '130', styleName: 'text-center' }, // 매출일자
    { fieldName: 'nomSlAmt', header: t('MSG_TXT_FTRM_CRDOVR'), width: '130', styleName: 'text-center' }, // 전기이월
    { fieldName: 'aab8', header: t('MSG_TXT_NOM_SL'), width: '150', styleName: 'text-center' }, // 정상매출
    { fieldName: 'bbc9', header: t('MSG_TXT_CAN_SL'), width: '150', styleName: 'text-right' }, // 취소매출
    { fieldName: 'ccd10', header: t('MSG_TXT_FEE_SL'), width: '150', styleName: 'text-right' }, // 수수료매출
    { fieldName: 'ccd11', header: t('MSG_TXT_GCF_NOM'), width: '180', styleName: 'text-right' }, // 상품권정상
    { fieldName: 'cul12', header: t('MSG_TXT_GCF_CAN'), width: '150', styleName: 'text-right' }, // 상품권취소
    { fieldName: 'cul13', header: t('MSG_TXT_SUM'), width: '150', styleName: 'text-right' }, // 합계
    { fieldName: 'abl14', header: t('MSG_TXT_CNTRAM'), width: '180', styleName: 'text-right' }, // 계약금
    { fieldName: 'abl15', header: t('MSG_TXT_INTAM'), width: '150', styleName: 'text-right' }, // 할부금
    { fieldName: 'abl16', header: t('MSG_TXT_SUM'), width: '150', styleName: 'text-right' }, // 합계
    { fieldName: 'dfaProcdAmt', header: `(-) ${t('MSG_TXT_DFA')}`, width: '150', styleName: 'text-right' }, // (-) 대손
    { fieldName: 'col18', header: t('MSG_TXT_EOT_UC'), width: '180', styleName: 'text-right' }, // 기말미수
    { fieldName: 'col19', header: t('MSG_TXT_CRP_UC'), width: '150', styleName: 'text-right' }, // 법인미수
    { fieldName: 'col20', header: t('MSG_TXT_GCF'), width: '150', styleName: 'text-right' }, // 상품권
    { fieldName: 'col21', header: t('MSG_TXT_ETC_PRPD_RPLC'), width: '150', styleName: 'text-right' }, // 기타선수대체
    { fieldName: 'col22', header: t('MSG_TXT_BTCOM_TRD_NOM'), width: '180', styleName: 'text-right' }, // 사간거래정상
    { fieldName: 'col23', header: t('MSG_TXT_BTCOM_TRD_CAN'), width: '150', styleName: 'text-right' }, // 사간거래취소
    { fieldName: 'col24', header: t('MSG_TXT_BTCOM_TRD_DP'), width: '150', styleName: 'text-right' }, // 사간거래입금
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  const layoutMain = [
    'perfYm', 'perfDt', 'sellChnlCd', 'cntr', 'cstKnm', 'slDt', 'nomSlAmt',
    {
      header: `${t('MSG_TXT_SL')}(+)`, /* 매출(+) */
      direction: 'horizontal',
      items: ['aab8', 'bbc9', 'ccd10', 'ccd11', 'cul12', 'cul13'],
    },
    {
      header: `${t('MSG_TXT_SL_CPRCNF')}(-)`, /* 매출대사(-) */
      direction: 'horizontal',
      items: ['abl14', 'abl15', 'abl16'],
    },
    'dfaProcdAmt',
    'col18',
    'col19',
    'col20',
    'col21',
    'col22',
    'col23',
    'col24',
  ];
  view.setColumnLayout(layoutMain);

  // view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 7 }];
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });
  view.rowIndicator.visible = true;
});

const selectAgrgDv = { // 집계구분  - 공통코드가 없는 관계로 임시로
  options: [{ codeId: '1', codeName: '집계' }, { codeId: '2', codeName: '일자별' }, { codeId: '3', codeName: '주문별' }, { codeId: '4', codeName: '가로계산식 틀린 회원' }],
};

onMounted(async () => {
  const view = grdFiveRef.value.getView();
  view.columnByName('perfDt').visible = false;
  view.columnByName('sellChnlCd').visible = false;
  view.columnByName('cntr').visible = false;
  view.columnByName('cstKnm').visible = false;
  view.columnByName('slDt').visible = false;
  view.layoutByColumn('perfYm').summaryUserSpans = [{ colspan: 2 }];

  onClickSearch();
});

</script>
