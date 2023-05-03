<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebSoleDistributorFeeCreationM - 총판 수수료 생성관리
3. 작성자 : gs.rahul.n
4. 작성일 : 2023.03.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 총판 수수료 생성관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_DIV')"
          required
        >
          <kw-option-group
            v-model="searchParams.type"
            type="radio"
            rules="required"
            :label="t('MSG_TXT_DIV')"
            :options="[{codeId: 'A', codeName: t('MSG_TXT_FEE_PERF')},
                       {codeId: 'B', codeName: t('MSG_TXT_DFLT_FEE')}]"
          />
        </kw-search-item>
        <kw-search-item
          v-if="searchParams.type === 'A'"
          :label="t('MSG_TXT_RCP_YM')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.strtYm"
            v-model:to="searchParams.endYm"
            type="month"
            rules="date_range_required|date_range_months:3"
            :label="t('MSG_TXT_RCP_YM')"
          />
        </kw-search-item>

        <kw-search-item
          :label="t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            :label="t('MSG_TXT_PERF_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row
        v-if="searchParams.type === 'A'"
      >
        <kw-search-item
          :label="t('MSG_TXT_CANCEL_YM')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.cancelStrtYm"
            v-model:to="searchParams.cancelEndYm"
            type="month"
            rules="date_range_months:3"
            :label="t('MSG_TXT_CANCEL_YM')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <h3>{{ searchParams.perfYm }} {{ $t('MSG_TXT_TOT_FEE_CRT_PRGS_STE') }}</h3>
        </template>
      </kw-action-top>
      <!-- STEPER -->
      <wwfeb-fee-step
        v-model:base-ym="naviParams.baseYm"
        v-model:fee-schd-tp-cd="naviParams.feeSchdTpCd"
        v-model:fee-tcnt-dv-cd="naviParams.feeTcntDvCd"
        v-model:co-cd="naviParams.coCd"
        @click-step="onclickStep"
      />
      <kw-action-top class="mt40">
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_HIS_MGT')"
          @click="onClickHistory"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="(totalCount === 0)"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-if="grdType === 'B'"
          :label="$t('MSG_TXT_SAVE')"
          primary
          dense
          @click="onClickSave"
        />
      </kw-action-top>
      <kw-grid
        v-if="grdType === 'A'"
        ref="grdRefA"
        @init="initGridDetail"
      />
      <kw-grid
        v-if="grdType === 'B'"
        ref="grdRefB"
        @init="initGridBase"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, gridUtil, getComponentType, useDataService, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import WwfebFeeStep from './WwfebFeeStep.vue';

const dataService = useDataService();
const now = dayjs();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { notify, modal, confirm } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRefA = ref(getComponentType('KwGrid'));
const grdDataA = computed(() => grdRefA.value?.getData());
const grdRefB = ref(getComponentType('KwGrid'));
const grdDataB = computed(() => grdRefB.value?.getData());
const totalCount = ref(0);
const grdType = ref('A');
const stepInitNum = ref(2);

let cachedParams;
const searchParams = ref({
  type: 'A',
  perfYm: now.format('YYYYMM'),
  strtYm: now.format('YYYYMMDD'),
  endYm: now.add(1, 'month').format('YYYYMMDD'),
  cancelStrtYm: now.format('YYYYMMDD'),
  cancelEndYm: now.add(1, 'month').format('YYYYMMDD'),
});
const naviParams = ref({
  baseYm: '202305',
  feeSchdTpCd: '501',
  feeTcntDvCd: '01',
  coCd: '1200',
});
// 데이터 조회
async function fetchData() {
  const fixApi = cachedParams.type === 'A' ? 'performance' : 'fee';
  const { data } = await dataService.get(`/sms/wells/fee/sole-distributor/${fixApi}`, { params: { ...cachedParams } });
  if (cachedParams.type === 'A') {
    grdDataA.value.setRows(data);
  } else {
    grdDataB.value.setRows(data);
  }
  stepInitNum.value = data.baseInfo.step;
  totalCount.value = data.list.length;
}
// 조회 버튼
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  grdType.value = searchParams.value.type;
  await fetchData();
}

// 엑셀 다운로드 버튼
async function onClickExcelDownload() {
  const view = cachedParams.type === 'A' ? grdRefA.value.getView() : grdRefB.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}
// 이력팝업 호출
async function openZwfebFeeHistoryMgtP() {
  const param = {
    feeHistSrnCd: '01',
  };
  await modal({
    component: 'ZwfebFeeHistoryMgtP',
    componentProps: param,
  });
}
// 이력관리 버튼 클릭
async function onClickHistory() {
  // Z-CO-U-0034P09 아래 팝업 호출시 에러남ㅋ;
  await openZwfebFeeHistoryMgtP();
}

// 저장
async function onClickSave() {
  const view = grdRefB.value.getView();
  // 편집여부
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  // 필수여부
  if (!await gridUtil.validate(view)) { return; }
  // @todo api 미정의
  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/fee/sole-distributor/fee', { changedRows });
  await notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}
// 수수료 생성 버튼
async function onClickCreate() {
  // 조회후 진행
  const { result: isChanged } = await modal({
    component: 'WwfebSoleDistributorFeeCreationRegP',
    componentProps: {
      perfYm: searchParams.value.perfYm,
    },
  });
  if (isChanged) {
    fetchData();
  }
}
// 재시작 && 실적집계
async function onClickRetry() {
  // 조회후 진행
  // 1보다크면 재시작
  if (stepInitNum.value > 1) {
    if (await confirm(t('MSG_ALT_LV_RESRT'))) {
      // @todo api미정의
      await dataService.post(`/sms/wells/fee/sole-distributor/fee/retry/${searchParams.value.perfYm}`);
      notify(t('MSG_ALT_AGRG_FSH')); // 집계되었습니다.
      fetchData();
    }
  } else { // 아니면 집계
    const { result: isChanged } = await modal({
      component: 'WwfebSoleDistributorFeeCreationAggregateP',
      componentProps: {
        perfYm: searchParams.value.perfYm,
      },
    });
    if (isChanged) {
      fetchData();
    }
  }
}
async function onclickStep(item) {
  console.log(item);
  if (item === '1') {
    await onClickCreate();
  }
  if (item === '2') {
    await onClickRetry();
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridDetail = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'hdqOgNm', header: t('MSG_TXT_CORP_NAME'), width: '127' },
    { fieldName: 'sellPrtnrNm', header: t('MSG_TXT_SELLER_PERSON'), width: '98' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '127', styleName: 'text-center' },
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_DTL_NO'), width: '151', styleName: 'text-center' },
    { fieldName: 'cntrCstNm', header: t('MSG_TXT_CUST_STMT'), width: '98' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '106', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '210' },
    { fieldName: 'dscDvCd', header: t('MSG_TXT_PD_DC_CLASS'), width: '98' },
    { fieldName: 'dscTpCd', header: t('MSG_TXT_DISC_CODE'), width: '98' },
    { fieldName: 'pmotCd', header: t('MSG_TXT_DSC_SYST'), width: '98', styleName: 'text-right' },
    { fieldName: 'relPdCd', header: t('MSG_TXT_COMBI_DV'), width: '98' },
    { fieldName: 'uswyDvCd', header: t('MSG_TXT_USWY_DV'), width: '98' },
    { fieldName: 'mngtTpCd', header: t('MSG_TXT_MGT_TYP'), width: '98' },
    { fieldName: 'bfsvcPrdCd', header: t('MSG_TXT_VST_PRD'), width: '98' },
    { fieldName: 'rcpDt', header: t('MSG_TXT_RCPDT'), width: '127', styleName: 'text-center' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '127', styleName: 'text-center' },
    { fieldName: 'canDt', header: t('MSG_TXT_CANC_DT'), width: '127', styleName: 'text-center' },
    { fieldName: 'ackmtPerfAmt', header: t('MSG_TXT_FEE'), width: '127', styleName: 'text-right' },
    { fieldName: 'ackmtPerfCt', header: t('MSG_TXT_NUM_OF_NEW_CASES'), width: '92', styleName: 'text-right' },
    { fieldName: 'feeAmt', header: t('MSG_TXT_PD_ACC_RSLT'), width: '127', styleName: 'text-right' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGridBase = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'coCdNm', header: t('MSG_TXT_CORP_NAME'), width: '127' },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '98' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '127', styleName: 'text-center' },
    { fieldName: 'cnt', header: t('MSG_TXT_PERF'), width: '151', styleName: 'text-center' },
    { fieldName: 'amtW050001', header: t('MSG_TXT_BAS_FEE'), width: '98', styleName: 'text-right' },
    { fieldName: 'amtW050002', header: t('MSG_TXT_ENRG_FEE'), width: '98', styleName: 'text-center' },
    { fieldName: 'amtW050003', header: t('MSG_TXT_ICT'), width: '98', styleName: 'text-right' },
    { fieldName: 'amtW050020', header: t('MSG_TXT_ADSB'), width: '98', styleName: 'text-right' },
    { fieldName: 'amtW050004', header: t('MSG_TXT_QUARTER_OUTC'), width: '98', styleName: 'text-right' },
    { fieldName: 'feeSumAmt', header: t('MSG_TXT_FEE_SUM'), width: '98', styleName: 'text-right' },
    { fieldName: 'amt01', header: t('MSG_TXT_RDS'), width: '98', styleName: 'text-right' },
    { fieldName: 'amt08', header: t('MSG_TXT_RE_REDF'), width: '98', styleName: 'text-right' },
    { fieldName: 'ddtnSumAmt', header: t('MSG_TXT_DDTN_SUM'), width: '98', styleName: 'text-right' },
    { fieldName: 'acpyAmt', header: t('MSG_TXT_ACL_DSB_AMT'), width: '98', styleName: 'text-right' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setColumnLayout([
    'coCdNm', 'ogCd', 'prtnrNo', 'cnt',
    {
      header: t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['amtW050001', 'amtW050002', 'amtW050003', 'amtW050020', 'amtW050004', 'feeSumAmt'],
    },
    {
      header: t('MSG_TXT_DDTN'),
      direction: 'horizontal',
      items: ['amt01', 'amt08', 'ddtnSumAmt'],
    },
    'acpyAmt',
  ]);
});

</script>
