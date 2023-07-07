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
            v-model="searchParams.perfYm"
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
            v-model="searchParams.perType"
            :label="$t('MSG_TXT_PERF_INQR')"
            type="radio"
            rules="required"
            :options="[{ codeId: '00', codeName: $t('MSG_TXT_RCP') },
                       { codeId: '01', codeName: $t('MSG_TXT_SL') }]"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          required
        >
          <zwog-partner-search
            v-model:prtnr-no="searchParams.sellPrtnrNo"
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
            required
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
          <!-- 성명 -->
          <kw-form-item :label="$t('MSG_TXT_EMPL_NM')">
            <p>{{ baseInfo?.prtnrKnm }}</p>
          </kw-form-item>
          <!-- 소속 -->
          <kw-form-item :label="$t('MSG_TXT_BLG')">
            <p>{{ baseInfo?.ogCd }}</p>
          </kw-form-item>
          <!-- 직책 -->
          <kw-form-item :label="$t('MSG_TXT_RSB')">
            <p>{{ codes.RSB_DV_CD.find((code) => code.codeId === baseInfo?.rsbDvCd)?.codeName }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 개시차월 -->
          <kw-form-item
            :label="$t('MSG_TXT_OPNG_NMN')"
            align-content="left"
          >
            <p>{{ baseInfo?.ojDsbYm ? stringUtil.getDateFormat(baseInfo?.ojDsbYm).substr(0,7) : '' }}</p>
          </kw-form-item>
          <!-- 승진차월 -->
          <kw-form-item
            :label="$t('MSG_TXT_PRFMT_NMN')"
            align-content="left"
          >
            <p>승진차월</p>
          </kw-form-item>
          <!-- 예상판매수수료 -->
          <kw-form-item :label="$t('MSG_TXT_EST_SAL_COMM')">
            <p>{{ baseInfo?.amtEstSalFee ? stringUtil.getNumberWithComma(baseInfo?.amtEstSalFee) : '' }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 예상조직수수료 -->
          <kw-form-item
            v-if="useOg"
            :label="$t('MSG_TXT_EST_OG_FEE')"
            align-content="right"
          >
            <p>예상조직수수료</p>
          </kw-form-item>
          <!-- 예상bs수수료 -->
          <kw-form-item
            :label="$t('MSG_TXT_EST_BS_FEE')"
            align-content="right"
          >
            <p>{{ baseInfo?.amtEstBsFee ? stringUtil.getNumberWithComma(baseInfo?.amtEstBsFee) : '' }}</p>
          </kw-form-item>
          <!-- 예상수수료합계 -->
          <kw-form-item
            :label="$t('MSG_TXT_TOT_EST_FEE')"
            align-content="right"
          >
            <p>{{ baseInfo?.amtFeeSum ? stringUtil.getNumberWithComma(baseInfo?.amtFeeSum) : '' }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <!-- 미팅 및 교육내역 -->
      <h3>{{ t('MSG_TXT_METG_EDUC_IZ') }}</h3>
      <kw-grid
        ref="grdMtRef"
        :visible-rows="1"
        @init="initGridMt"
      />
      <!-- 실적내역 -->
      <kw-action-top class="mt30">
        <template #left>
          <h3>{{ t('MSG_TXT_PERF_DETAIL') }}</h3>
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }} </span>
        </template>
        <kw-btn
          :label="$t('MSG_BTN_EXP_PERF_RFLT')"
          dense
          primary
          @click="onClickCalculateDetail"
        />
      </kw-action-top>
      <kw-grid
        ref="grdDetailRef"
        :visible-rows="useOg ? 4 : 2"
        @init="initGridDetail"
      />
      <!-- BS내역 -->
      <kw-action-top class="mt30">
        <template #left>
          <h3>{{ t('MSG_TXT_BS_IZ') }}</h3>
          <span class="ml8">{{ t('MSG_TXT_MSG_TXT_UNIT_CASE') }} </span>
        </template>
        <kw-btn
          :label="$t('MSG_BTN_EXP_PERF_RFLT')"
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
      <!-- 조직BS내역 -->
      <template
        v-if="true"
      >
        <kw-action-top class="mt30">
          <template #left>
            <h3>{{ t('MSG_TXT_OG_BS_IZ') }}</h3>
            <span class="ml8">{{ t('MSG_TXT_MSG_TXT_UNIT_CASE') }} </span>
          </template>
          <kw-btn
            :label="$t('MSG_BTN_EXP_PERF_RFLT')"
            dense
            primary
            @click="onClickCalculateOgBs"
          />
        </kw-action-top>
        <kw-grid
          ref="grdOgBsRef"
          :visible-rows="1"
          @init="initGridOgBs"
        />
      </template>
      <!-- 예상수수료 내역 -->
      <kw-action-top class="mt30">
        <template #left>
          <h3>{{ t('MSG_TXT_EST_FEE_DTL') }}</h3>
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }} </span>
        </template>
      </kw-action-top>
      <!--
        <kw-grid
        ref="grdDstRef"
        :visible-rows="1"
        @init="initGridDstDtl"
        />
      -->
      <table class="kw-table--normal">
        <colgroup>
          <col style="width: 12%;">
          <col style="width: 11%;">
          <col style="width: 11%;">
          <col style="width: 11%;">
          <col style="width: 11%;">
          <col style="width: 11%;">
          <col style="width: 11%;">
          <col style="width: 11%;">
          <col style="width: 11%;">
        </colgroup>
        <tbody>
          <tr>
            <th rowspan="2">
              예상판매수수료
            </th>
            <th>가전비례</th>
            <th>가전외비례</th>
            <th>가전장려</th>
            <th>미팅</th>
            <th>교육</th>
            <th>정착</th>
            <th>기기변경</th>
            <th>계</th>
          </tr>
          <tr>
            <td class="text-right">
              33333
            </td>
            <td class="text-right">
              333
            </td>
            <td class="text-right">
              333
            </td>
            <td class="text-right">
              333
            </td>
            <td class="text-right">
              333
            </td>
            <td class="text-right">
              333
            </td>
            <td class="text-right">
              333
            </td>
            <td class="text-right">
              333
            </td>
          </tr>
          <tr>
            <th rowspan="2">
              예상BS수수료
            </th>
            <th>BS관리</th>
            <th>BS장려</th>
            <th>급지</th>
            <th colspan="4" />
            <th>계</th>
          </tr>
          <tr>
            <td class="text-right">
              33333
            </td>
            <td class="text-right">
              333
            </td>
            <td class="text-right">
              333
            </td>
            <td colspan="4" />
            <td class="text-right">
              333
            </td>
          </tr>
          <tr>
            <th rowspan="2">
              예상조직수수료
            </th>
            <th>가전조직비례</th>
            <th>가전외조직비례</th>
            <th>조직 판매장려</th>
            <th>순증관리</th>
            <th>조직배출1</th>
            <th>조직배출2</th>
            <th>신설지점</th>
            <th>계</th>
          </tr>
          <tr>
            <td class="text-right">
              33333
            </td>
            <td class="text-right">
              333
            </td>
            <td class="text-right">
              333
            </td>
            <td class="text-right">
              333
            </td>
            <td class="text-right">
              333
            </td>
            <td class="text-right">
              333
            </td>
            <td class="text-right">
              333
            </td>
            <td class="text-right">
              333
            </td>
          </tr>
          <tr>
            <th class="sumhead">
              합계
            </th>
            <th
              class="sumhead text-right"
              colspan="8"
            >
              32112212
            </th>
          </tr>
        </tbody>
      </table>
      <!-- 판매내역 -->
      <kw-action-top class="mt30">
        <template #left>
          <h3>{{ t('MSG_TXT_SAL_HIST') }}</h3>
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }} </span>
        </template>
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
import { defineGrid, useDataService, useGlobal, getComponentType, codeUtil, stringUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import ZwogPartnerSearch from '~sms-common/organization/components/ZwogPartnerSearch.vue';

const now = dayjs();
const { notify } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const useOg = ref(false);
const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
  'CNTRW_TP_CD',
  'CNTR_TP_CD',
);

const grdMtRef = ref(getComponentType('KwGrid'));
const grdDetailRef = ref(getComponentType('KwGrid'));
const grdBsRef = ref(getComponentType('KwGrid'));
const grdOgBsRef = ref(getComponentType('KwGrid'));
const grdDstRef = ref(getComponentType('KwGrid'));
const grdSalesRef = ref(getComponentType('KwGrid'));

const grdMtData = computed(() => grdMtRef.value?.getData());
const grdDetailData = computed(() => grdDetailRef.value?.getData());
const grdBsData = computed(() => grdBsRef.value?.getData());
const grdOgBsData = computed(() => grdOgBsRef.value?.getData());
const grdDstData = computed(() => grdDstRef.value?.getData());
const grdSalesData = computed(() => grdSalesRef.value?.getData());

let cachedParams;
const searchParams = ref({
  perfYm: now.format('YYYYMM'),
  perType: '00',
  sellPrtnrNo: '',
});
const baseInfo = ref({
  prtnrKnm: '',
  ogCd: '',
  rsbDvCd: '',
  amtEstSalFee: 0,
  amtEstBsFee: 0,
  amtFeeSum: 0,
  ojDsbYm: '',
});
// 데이터 조회
async function fetchData() {
  const { data } = await dataService.get('/sms/wells/fee/estimate/m-og', { params: { ...cachedParams } });
  baseInfo.value = data.base;
  grdMtData.value.setRows(null);
  grdDetailData.value.setRows(data.performances);
  grdBsData.value.setRows(data.bses);
  grdOgBsData.value.setRows(null);
  grdDstData.value.setRows(data.estimates);
  grdSalesData.value.setRows(data.sales);
}
// 조회버튼
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
// 실적내역 계산버튼 클릭
async function onClickCalculateDetail() {
  notify('수수료 계산 API 개발후 진행');
}

// BS내역 계산버튼 클릭
async function onClickCalculateBs() {
  notify('수수료 계산 API 개발후 진행');
}

// 조직bs내역 계산버튼 클릭
async function onClickCalculateOgBs() {
  notify('수수료 계산 API 개발후 진행');
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMt = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_PRE_SRTUP'), width: '112', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'col2', header: t('MSG_TXT_SRTUP'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'col3', header: t('MSG_TXT_METG_PRSC_D'), width: '107', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'col4', header: t('MSG_TXT_CMPF_EDUC'), width: '112', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'col5', header: `${t('MSG_TXT_STMNT')}1`, width: '112', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'col6', header: `${t('MSG_TXT_STMNT')}2`, width: '112', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'col7', header: `${t('MSG_TXT_STMNT')}345`, width: '112', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'col8', header: t('MSG_TXT_BRMGR_ONLINE'), width: '112', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});

const initGridDetail = defineGrid((data, view) => {
  const columns = [
    {
      fieldName: 'type',
      header: t('MSG_TXT_DIV'),
      width: '220',
      styleName: 'text-left',
      displayCallback(grid, index, value) {
        const title = { A: t('MSG_TXT_INDV_PERF'), B: t('MSG_TXT_INDV_PRJTD_PERF'), C: t('MSG_TXT_OG_PERF'), D: t('MSG_TXT_OG_PRJTD_PERF') };
        return title[value];
      },
    },
    { fieldName: 'elhmAckmtCt', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '171', dataType: 'number', styleName: 'text-right' },
    { fieldName: 'col1', header: t('MSG_TXT_RENTAL_BASE_PRC'), width: '172', dataType: 'number', styleName: 'text-right' },
    { fieldName: 'col2', header: t('MSG_TXT_SNGL_PMNT_BASE_PRC'), width: '172', dataType: 'number', styleName: 'text-right' },
    { fieldName: 'col3', header: t('MSG_TXT_ELHM_EXCP_ACKMT_PERF'), width: '172', dataType: 'number', styleName: 'text-right' },
    { fieldName: 'col4', header: t('MSG_TXT_NINC'), width: '172', dataType: 'number', styleName: 'text-right' },

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
  view.editOptions.columnEditableFirst = true;
  view.onCellEditable = (grid, index) => {
    if (['A', 'C'].includes(grid.getValue(index.itemIndex, 'type'))) {
      return false;
    }
  };
});

const initGridBs = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'type',
      header: t('MSG_TXT_DIV'),
      styleName: 'text-center',
      width: '120',
      displayCallback(grid, index, value) {
        const title = { A: t('MSG_TXT_ASGN_CT'), B: t('MSG_TXT_FHS_CT'), C: t('MSG_TXT_ET_FHS_CT') };
        return title[value];
      },
    },
    { fieldName: 'wrfr01', header: `${t('MSG_TXT_WRFR')} 1`, styleName: 'text-right', dataType: 'number', width: '109' },
    { fieldName: 'wrfr02', header: `${t('MSG_TXT_WRFR')} 2`, styleName: 'text-right', dataType: 'number', width: '109' },
    { fieldName: 'wrfr03', header: `${t('MSG_TXT_WRFR')} 3`, styleName: 'text-right', dataType: 'number', width: '109' },
    { fieldName: 'wrfr04', header: `${t('MSG_TXT_WRFR')} 4`, styleName: 'text-right', dataType: 'number', width: '109' },
    { fieldName: 'unWrfr', header: t('MSG_TXT_UN_WRFR'), styleName: 'text-right', dataType: 'number', width: '109' },
    { fieldName: 'puf01', header: `${t('MSG_TXT_PUF')} 1`, styleName: 'text-right', dataType: 'number', width: '109' },
    { fieldName: 'puf02', header: `${t('MSG_TXT_PUF')} 2`, styleName: 'text-right', dataType: 'number', width: '109' },
    { fieldName: 'otscEtc', header: t('MSG_TXT_ETC_ITEMS_1'), styleName: 'text-right', dataType: 'number', width: '204' },
    { fieldName: 'bdtEtc', header: t('MSG_TXT_ETC_ITEMS_2'), styleName: 'text-right', dataType: 'number', width: '115' },
    { fieldName: 'sum', header: t('MSG_TXT_SUM'), styleName: 'text-right', width: '129', dataType: 'number' },
    { fieldName: 'procRate', header: t('MSG_TXT_BS_PROC_RATE'), styleName: 'text-right', width: '106' },
    { fieldName: 'w1', header: t('W1'), styleName: 'text-right', dataType: 'number', width: '109' },
    { fieldName: 'w2', header: t('W2'), styleName: 'text-right', dataType: 'number', width: '109' },
  ];
  const fields = [
    { fieldName: 'type' },
    { fieldName: 'wrfr01', dataType: 'number' },
    { fieldName: 'wrfr02', dataType: 'number' },
    { fieldName: 'wrfr03', dataType: 'number' },
    { fieldName: 'wrfr04', dataType: 'number' },
    { fieldName: 'unWrfr', dataType: 'number' },
    { fieldName: 'puf01', dataType: 'number' },
    { fieldName: 'puf02', dataType: 'number' },
    { fieldName: 'otscEtc', dataType: 'number' },
    { fieldName: 'bdtEtc', dataType: 'number' },
    { fieldName: 'sum',
      dataType: 'number',
      valueExpression: "values['wrfr01'] + values['wrfr02'] + values['wrfr03'] + values['wrfr04'] + values['unWrfr'] + values['puf01'] + values['puf02'] + values['otscEtc'] + values['bdtEtc'] + values['etcFxamDsb']",
    },
    { fieldName: 'procRate' },
    { fieldName: 'w1' },
    { fieldName: 'w2' },
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
  view.editOptions.editable = true;
  view.onCellEditable = (grid, index) => {
    if (['A', 'B'].includes(grid.getValue(index.itemIndex, 'type'))) {
      return false;
    }
  };
  view.setColumnLayout([
    'type',
    {
      header: t('MSG_TXT_PRD_GRP'),
      direction: 'horizontal',
      items: ['wrfr01', 'wrfr02', 'wrfr03', 'wrfr04', 'unWrfr', 'puf01', 'puf02', 'otscEtc', 'bdtEtc', 'sum'],
    },
    'procRate',
    {
      header: t('MSG_TXT_RGLVL'),
      direction: 'horizontal',
      items: ['w1', 'w2'],
    },
  ]);
});

const initGridOgBs = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'type',
      header: t('MSG_TXT_DIV'),
      styleName: 'text-center',
      width: '120',
      displayCallback() {
        return t('MSG_TXT_TOT_CT');
      },
    },
    { fieldName: 'col1', header: t('MSG_TXT_ASGN_CT'), width: '112', styleName: 'text-right', dataType: 'number', editable: false },
    { fieldName: 'col2', header: t('MSG_TXT_FHS_CT'), width: '112', styleName: 'text-right', dataType: 'number', editable: false },
    { fieldName: 'col3', header: t('MSG_TXT_PROCS_RT'), width: '112', styleName: 'text-right', dataType: 'number', editable: false },
    { fieldName: 'col4', header: t('MSG_TXT_ET_FHS_CT'), width: '112', styleName: 'text-right', dataType: 'number', editable: true },
    { fieldName: 'col5', header: `${t('MSG_TXT_ET_PROCS_RT')}(%)`, width: '112', styleName: 'text-right', dataType: 'number', editable: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;
});

const initGridSalesHist = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'msgTxtEmplNm', header: t('MSG_TXT_EMPL_NM'), width: '93', styleName: 'text-center' },
    { fieldName: 'msgTxtPrtnrNo', header: t('MSG_TXT_PRTNR_NO'), width: '93', styleName: 'text-center' },
    { fieldName: 'cntrRcpFshDtm', header: t('MSG_TXT_RCPDT'), width: '112', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_SL_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'msgTxtCancDt', header: t('MSG_TXT_CANC_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '155', styleName: 'text-center' },
    { fieldName: 'msgTxtPdIz', header: t('MSG_TXT_PD_IZ'), width: '187', styleName: 'text-left' },
    { fieldName: 'msgTxtCstNm', header: t('MSG_TXT_CST_NM'), width: '155', styleName: 'text-center' },
    { fieldName: 'msgTxtChdvcTp', header: t('MSG_TXT_CHDVC_TP'), width: '91', styleName: 'text-right' },
    { fieldName: 'msgTxtElhmBasePrc', header: t('MSG_TXT_ELHM_BASE_PRC'), width: '112', styleName: 'text-right' },
    { fieldName: 'msgTxtElhmAckmtCt', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '112', styleName: 'text-right' },
    { fieldName: 'msgTxtElhmExcpAckmtCt', header: t('MSG_TXT_ELHM_EXCP_ACKMT_CT'), width: '112', styleName: 'text-right' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>

<style scoped lang="scss">
.sumhead {
  background: antiquewhite;
}
</style>
