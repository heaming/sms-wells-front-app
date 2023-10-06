<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebB2bFeeCreationM - B2B 수수료 생성관리
3. 작성자 : gs.nidhi.d
4. 작성일 : 2023.03.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- B2B 수수료 생성관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      v-permission:read
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_DIV')"
        >
          <kw-option-group
            v-model="searchParams.type"
            type="radio"
            :label="t('MSG_TXT_DIV')"
            :options="[{codeId: 'A', codeName: t('MSG_TXT_FEE_PERF')},
                       {codeId: 'B', codeName: t('MSG_TXT_DFLT_FEE')}]"
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
        <!-- 차수 -->
        <kw-search-item
          :label="$t('MSG_TXT_ORDR')"
        >
          <kw-option-group
            v-model="searchParams.feeTcntDvCd"
            type="radio"
            :options="codes.FEE_TCNT_DV_CD"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row
        v-if="searchParams.type === 'A'"
      >
        <kw-search-item
          :label="t('MSG_TXT_RCP_YM')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.strtYm"
            v-model:to="searchParams.endYm"
            type="month"
            rules="date_range_required"
            :label="t('MSG_TXT_RCP_YM')"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_CANCEL_YM')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.cancelStrtYm"
            v-model:to="searchParams.cancelEndYm"
            type="month"
            :label="t('MSG_TXT_CANCEL_YM')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <h3>
            <!-- eslint-disable-next-line max-len -->
            {{ stringUtil.getDateFormat(searchParams.perfYm, 'yyyy-MM').substring(0,4) }}{{ $t('MSG_TXT_YEAR') }} {{ stringUtil.getDateFormat(searchParams.perfYm, 'yyyy-MM').substring(5,7) }}{{ $t('MSG_TXT_MON') }}
            {{ $t('MSG_TXT_B2B_FEE_CRT_PRGS_STE') }}
          </h3>
        </template>
      </kw-action-top>
      <!-- STEPER -->
      <zwfey-fee-step
        ref="stepNaviRef"
        :key="searchParams.perfYm+searchParams.feeTcntDvCd"
        v-model:base-ym="searchParams.perfYm"
        v-model:fee-schd-tp-cd="searchParams.feeSchdTpCd"
        v-model:fee-tcnt-dv-cd="searchParams.feeTcntDvCd"
        v-model:co-cd="searchParams.coCd"
        @click-step="onclickStep"
      />
      <kw-action-top class="mt40">
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :disable="(totalCount === 0)"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_HIS_MGT')"
          @click="onClickHistory"
        />
        <kw-btn
          v-if="false"
          dense
          icon="report"
          :label="$t('MSG_BTN_RPT_BRWS')"
          @click="onClickOpenReport"
        />
        <kw-separator
          v-if="grdType === 'B'"
          vertical
          inset
          spaced
        />
        <kw-btn
          v-if="grdType === 'B'"
          v-permission:update
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
import { defineGrid, gridUtil, getComponentType, useDataService, useGlobal, stringUtil, codeUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import ZwfeyFeeStep from '~sms-common/fee/pages/schedule/ZwfeyFeeStep.vue';
import { openReportPopup } from '~common/utils/cmPopupUtil';

const dataService = useDataService();
const now = dayjs();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { notify, confirm, modal } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRefA = ref(getComponentType('KwGrid'));
const grdDataA = computed(() => grdRefA.value?.getData());
const grdRefB = ref(getComponentType('KwGrid'));
const grdDataB = computed(() => grdRefB.value?.getData());
const totalCount = ref(0);
const grdType = ref('A');
const stepNaviRef = ref();
const codes = await codeUtil.getMultiCodes(
  'FEE_TCNT_DV_CD',
  'SELL_DSC_DV_CD',
  'SELL_DSCR_CD',
  'SELL_DSC_TP_CD',
  'PMOT_USWY_DV_ACD',
  'BFSVC_PRD_CD',
);
let cachedParams;
const searchParams = ref({
  type: 'A',
  perfYm: now.format('YYYYMM'),
  strtYm: '201703',
  endYm: now.add(-1, 'month').format('YYYYMM'),
  cancelStrtYm: '',
  cancelEndYm: '',
  feeSchdTpCd: '401', // 신채널(B2B)
  feeTcntDvCd: '02', // 2차수
  coCd: '2000', //  @TODO 세션 coCd[session.getCompanyCode()] 관련해서 업무별로 말이 다달라서 하드코딩함 -_-;
});

// 데이터 조회
async function fetchData() {
  stepNaviRef.value.initProps();
  const fixApi = cachedParams.type === 'A' ? 'performance' : 'fee';
  const { data } = await dataService.get(`/sms/wells/fee/b2b/${fixApi}`, { params: { ...cachedParams } });
  totalCount.value = data.length;
  if (cachedParams.type === 'A') {
    grdDataA.value.setRows(data);
  } else {
    grdDataB.value.setRows(data);
  }
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
  const fixApi = cachedParams.type === 'A' ? 'performance' : 'fee';
  const { data } = await dataService.get(`/sms/wells/fee/b2b/${fixApi}`, { params: { ...cachedParams } });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: data,
  });
}
// 이력관리 버튼 클릭
async function onClickHistory() {
  const param = {
    feeHistSrnCd: '01',
  };
  await modal({
    component: 'ZwfebFeeHistoryMgtP',
    componentProps: param,
  });
}
// 저장
async function onClickSave() {
  const view = grdRefB.value.getView();
  // 편집여부
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  // 필수여부
  if (!await gridUtil.validate(view)) { return; }
  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/fee/b2b/fee', { changedRows });
  await notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}
// 수수료 생성 버튼
async function onClickCreate(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  // 조회후 진행
  const { result: isChanged } = await modal({
    component: 'WwfebB2bFeeCreationRegP',
    componentProps: {
      perfYm: searchParams.value.perfYm,
      feeTcntDvCd: searchParams.value.feeTcntDvCd,
    },
  });
  if (isChanged) {
    await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
    fetchData();
  }
}
// 재시작, 상태를 진행중상태로 변경한다.
async function onClickRetry(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  if (await confirm(t('MSG_ALT_LV_RESRT'))) {
    await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
    notify(t('MSG_ALT_SAVE_DATA'));
    fetchData();
  }
}

// 실적집계
async function onClickAggregate(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { result: isChanged } = await modal({
    component: 'WwfebB2bFeeCreationAggregateP',
    componentProps: {
      perfYm: searchParams.value.perfYm,
      feeTcntDvCd: searchParams.value.feeTcntDvCd,
    },
  });
  if (isChanged) {
    await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
    fetchData();
  }
}
/**
 * 스텝퍼 클릭시
 * WELLS B2B수수료 단계코드[FEE_SCHD_LV_CD] W04** 에 있는 코드 단계별 모든 로직을 정리한다.
 * 버튼 로직 존재시 해당 로직 서술
 * @params code[String]: 스탭퍼에서 선택한 단계 코드
 *         done[Boolean]: 이전단계로 되돌림 플레그
 */
async function onclickStep(params) {
  if (params.done) {
    await onClickRetry(params.feeSchdId, params.code, '02');
  } else {
    if (params.code === 'W0401') { // 실적집계
      await onClickAggregate(params.feeSchdId, params.code, '03');
    }
    if (params.code === 'W0402') { // 수수료 생성
      await onClickCreate(params.feeSchdId, params.code, '03');
    }
    if (params.code === 'W0403') { // 보증예치금 적립
      // 미정의
    }
  }
}

async function onClickOpenReport(baseYm, prtnrNo) {
  // notify('신규요청기능\n>업무로직 정의안됨\n>해당내용더블클릭으로 변경?\n>AS-IS ksswells/cmms/btobPatSpec/V1.0/cmmsBtobPatSpec.ozr');
  // AS-IS정보
  // ksswells/cmms/btobPatSpec/V1.0/cmmsBtobPatSpec.ozr
  // AKSDTY 수당년
  // AKSDTM 수당월
  // AKDCDE 번호
  openReportPopup(
    'ksswells/cmms/btobPatSpec/V1.0/cmmsBtobPatSpec.ozr',
    'ksswells/cmms/btobPatSpec/V1.0/cmmsBtobPatSpec.odi',
    JSON.stringify(
      {
        AKDCDE: prtnrNo,
        AKSDTY: baseYm.substring(0, 4),
        AKSDTM: baseYm.substring(4, 6),
      },
    ),
  );
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridDetail = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'baseYm', visible: false },
    { fieldName: 'coCdNm', header: t('MSG_TXT_CORP_NAME'), width: '127' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_SELLER_PERSON'), width: '98' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '127', styleName: 'text-center' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '151', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CUST_STMT'), width: '98' },
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '106', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '210' },
    {
      fieldName: 'sellDscDvCd',
      header: t('MSG_TXT_PD_DC_CLASS'),
      width: '98',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        let retValue = value;
        if (codes.SELL_DSC_DV_CD.map((v) => v.codeId).includes(value)) {
          retValue = codes.SELL_DSC_DV_CD.find((v) => v.codeId === value)?.codeName;
        }
        return retValue;
      },
    },
    {
      fieldName: 'sellDscrCd',
      header: t('MSG_TXT_DISC_CODE'),
      width: '98',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        let retValue = value;
        if (codes.SELL_DSCR_CD.map((v) => v.codeId).includes(value)) {
          retValue = codes.SELL_DSCR_CD.find((v) => v.codeId === value)?.codeName;
        }
        return retValue;
      },
    },
    {
      fieldName: 'sellDscTpCd',
      header: t('MSG_TXT_DSC_SYST'),
      width: '98',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        let retValue = value;
        if (codes.SELL_DSC_TP_CD.map((v) => v.codeId).includes(value)) {
          retValue = codes.SELL_DSC_TP_CD.find((v) => v.codeId === value)?.codeName;
        }
        return retValue;
      },
    },
    { fieldName: 'relPdCd', header: t('MSG_TXT_COMBI_DV'), width: '98', styleName: 'text-center' },
    { fieldName: 'pmotUswyDvCd', header: t('MSG_TXT_USWY_DV'), width: '98', options: codes.PMOT_USWY_DV_ACD, styleName: 'text-center' },
    { fieldName: 'mgNm', header: t('MSG_TXT_MGT_TYP'), width: '98', styleName: 'text-center' },
    { fieldName: 'bfsvcPrdCd', header: t('MSG_TXT_VST_PRD'), width: '98', options: codes.BFSVC_PRD_CD, styleName: 'text-center' },
    { fieldName: 'rcpdt', header: t('MSG_TXT_RCPDT'), width: '127', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '127', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    { fieldName: 'canDt', header: t('MSG_TXT_CANC_DT'), width: '127', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    { fieldName: 'perfVal', header: t('MSG_TXT_FEE'), width: '127', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'ackmtPerfCt', header: t('MSG_TXT_NUM_OF_NEW_CASES'), width: '92', styleName: 'text-right', dataType: 'number' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.onCellDblClicked = async (g, clickData) => {
    const baseYm = g.getValue(clickData.itemIndex, 'baseYm');
    const prtnrNo = g.getValue(clickData.itemIndex, 'prtnrNo');
    console.log(`${baseYm} ${prtnrNo}`);
    // await onClickOpenReport(baseYm, prtnrNo);
  };
});

const initGridBase = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'baseYm', visible: false },
    { fieldName: 'feeTcntDvCd', visible: false },
    { fieldName: 'coCd', visible: false },
    {
      fieldName: 'coCdNm',
      header: t('MSG_TXT_CORP_NAME'),
      width: '127',
      headerSummary: {
        styleName: 'text-center',
        text: t('MSG_TXT_SUM'),
      },
    },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '98' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '127', styleName: 'text-center' },
    {
      fieldName: 'cnt',
      header: t('MSG_TXT_PERF'),
      width: '110',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'amtW040001',
      header: t('MSG_TXT_BAS_FEE'),
      width: '110',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'amtW040005',
      header: t('MSG_TXT_MED_FEE'),
      width: '110',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'amtW040004',
      header: t('MSG_TXT_PMOT'),
      width: '110',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'amtW040020',
      header: t('MSG_TXT_ADSB'),
      width: '110',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'amtW040003',
      header: t('MSG_TXT_ICT'),
      width: '110',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'feeSumAmt',
      header: t('MSG_TXT_FEE_SUM'),
      width: '98',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'amt01',
      header: t('MSG_TXT_RDS'),
      width: '110',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'amt01Cn',
      header: t('MSG_TXT_RDS_MDFC_RSON'),
      width: '150',
      styleName: 'text-left',
    },
    {
      fieldName: 'amt08',
      header: t('MSG_TXT_RE_REDF'),
      width: '110',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'ddtnSumAmt',
      header: t('MSG_TXT_DDTN_SUM'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'acpyAmt',
      header: t('MSG_TXT_ACL_DSB_AMT'),
      width: '150',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
  ];
  const fields = [
    { fieldName: 'baseYm' },
    { fieldName: 'feeTcntDvCd' },
    { fieldName: 'coCd' },
    { fieldName: 'coCdNm' },
    { fieldName: 'ogCd' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'cnt', dataType: 'number' },
    { fieldName: 'amtW040001', dataType: 'number' },
    { fieldName: 'amtW040005', dataType: 'number' },
    { fieldName: 'amtW040004', dataType: 'number' },
    { fieldName: 'amtW040020', dataType: 'number' },
    { fieldName: 'amtW040003', dataType: 'number' },
    {
      fieldName: 'feeSumAmt',
      dataType: 'number',
      valueExpression: "values['amtW040001'] + values['amtW040005'] + values['amtW040004'] + values['amtW040020'] + values['amtW040003']",
    },
    { fieldName: 'amt01', dataType: 'number' },
    { fieldName: 'amt01Cn' },
    { fieldName: 'amt08', dataType: 'number' },
    {
      fieldName: 'ddtnSumAmt',
      dataType: 'number',
      valueExpression: "values['amt01'] + values['amt08']",
    },
    {
      fieldName: 'acpyAmt',
      dataType: 'number',
      valueExpression: "values['feeSumAmt'] - values['ddtnSumAmt']",
    },
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  view.onCellEditable = (grid, index) => {
    if (!['amtW040005', 'amtW040005', 'amtW040004', 'amtW040020', 'amtW040003', 'amt01', 'amt01Cn'].includes(index.column)) {
      return false;
    }
  };
  view.setColumnLayout([
    'coCdNm', 'ogCd', 'prtnrNo', 'cnt',
    {
      header: t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['amtW040001', 'amtW040005', 'amtW040004', 'amtW040020', 'amtW040003', 'feeSumAmt'],
    },
    {
      header: t('MSG_TXT_DDTN'),
      direction: 'horizontal',
      items: ['amt01', 'amt01Cn', 'amt08', 'ddtnSumAmt'],
    },
    'acpyAmt',
  ]);
  view.setHeaderSummaries({
    visible: true,
    items: [
      { height: 42 },
    ],
  });
  view.layoutByColumn('coCdNm').summaryUserSpans = [{ colspan: 3 }];
});

</script>
