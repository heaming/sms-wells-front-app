<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FED
2. 프로그램 ID : WwfedLedrAllowanceListM - 단장 수당 관리
3. 작성자 : seoin.jeon
4. 작성일 : 2023.01.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 단장 수당 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      v-permission:read
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 실적년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_PERF_YM')"
          />
        </kw-search-item>
        <!-- <kw-search-item
          :label="$t('MSG_TXT_OG_DV')"
        >
          <kw-option-group
            v-model="searchParams.ogDvCd"
            type="radio"
            :options="codes.SELL_OG_DV_ACD"
          />
        </kw-search-item> -->
        <!-- 직책 -->
        <kw-search-item
          :label="$t('MSG_TXT_RSB')"
        >
          <kw-option-group
            v-model="searchParams.rsbDvCd"
            type="radio"
            :options="rsbDvCd"
            first-option="all"
            first-option-value=""
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 조회구분 -->
        <kw-search-item :label="$t('MSG_TXT_INQR_DV')">
          <kw-option-group
            v-model="searchParams.inqrDvCd"
            type="radio"
            :options="codes.WELS_MNGR_INQR_DV_CD"
          />
        </kw-search-item>
        <!-- 번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            icon="search"
            :maxlength="10"
            :regex="/^[0-9]*$/i"
            clearable
            :on-click-icon="onClickSearchNo"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
        </template>
        <!-- 엑셀업로드 -->
        <kw-btn
          v-permission:create
          icon="upload_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_UP')"
          @click="onClickExcelUpload"
        />
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          secondary
          dense
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount===0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <!-- 개인별그리드 -->
      <kw-grid
        v-if="isGrdIndvVisible"
        ref="grdIndvRef"
        name="grdIndv"
        :visible-rows="10"
        @init="initGridIndv"
      />
      <!-- 합계그리드 -->
      <kw-grid
        v-if="isGrdSumVisible"
        ref="grdSumRef"
        name="grdSum"
        :visible-rows="10"
        @init="initGridSum"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useGlobal, useDataService, codeUtil } from 'kw-lib';
import dayjs from 'dayjs';

const dataService = useDataService();
const { modal, notify } = useGlobal();
const { t } = useI18n();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// ------------------------------------------------------------------------------------------------
const grdIndvRef = ref(getComponentType('KwGrid'));
const grdSumRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const isGrdIndvVisible = ref(true);
const isGrdSumVisible = ref(false);

const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
  'SELL_OG_DV_ACD',
  'WELS_MNGR_INQR_DV_CD',
);
const rsbDvCd = codes.RSB_DV_CD.filter((v) => ['W0103', 'W0202', 'W0203'].includes(v.codeId));

// 조회조건
const searchParams = ref({
  perfYm: dayjs().subtract(1, 'month').format('YYYYMM'),
  rsbDvCd: '',
  inqrDvCd: '01',
  ogDvCd: '7',
  ogTpCd: 'W02',
  prtnrNo: '',
});

/*
watch(() => searchParams.value.ogDvCd, async (val) => {
  if (val === '7') { rsbDvCd = codes.RSB_DV_CD.filter((v) => ['W0202', 'W0203'].includes(v.codeId)); }
  else { rsbDvCd = codes.RSB_DV_CD.filter((v) => ['W0102', 'W0103'].includes(v.codeId)); }
  searchParams.value.rsbDvCd = '';
}, { immediate: true });
*/

// 조회구분 변경
watch(() => searchParams.value.inqrDvCd, async (val) => {
  totalCount.value = 0;
  if (val === '01') {
    isGrdIndvVisible.value = true;
    isGrdSumVisible.value = false;
  } else if (val === '02') {
    isGrdIndvVisible.value = false;
    isGrdSumVisible.value = true;
  }
}, { immediate: true });

// 실적년월 변경
watch(() => searchParams.value.perfYm, async (val) => {
  const view = grdIndvRef.value.getView();

  if (val < '202102') {
    view.columnByName('mngrPerfGdCd').visible = true; // 등급
    view.columnByName('ogAwAmt').visible = false; // 조직수당
  } else {
    view.columnByName('mngrPerfGdCd').visible = false;
    view.columnByName('ogAwAmt').visible = true;
  }
}, { immediate: false });

// 엑셀다운로드
async function onClickExcelDownload() {
  let type;
  if (searchParams.value.inqrDvCd === '01') type = 'indv';
  else if (searchParams.value.inqrDvCd === '02') type = 'sum';
  const response = await dataService.get(`/sms/wells/fee/ledr-allowances/${type}`, { params: searchParams.value });

  let view;
  if (type === 'indv') view = grdIndvRef.value.getView();
  else if (type === 'sum') view = grdSumRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

// 엑셀업로드
async function openUploadPopup(componentProps) {
  const { result: isUploadSuccess, payload } = await modal({
    component: 'ZwfezXlsUpP',
    componentProps,
  });
  if (isUploadSuccess) {
    notify(t('MSG_ALT_SAVED_CNT', [payload.count]));
  }
}

// 엑셀업로드 버튼 클릭 이벤트
async function onClickExcelUpload() {
  openUploadPopup({ formatId: 'FOM_FEZ_0027', baseYm: searchParams.value.perfYm });
}

// 번호 버튼 클릭 이벤트
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzMonthPartnerListP',
    componentProps: {
      baseYm: searchParams.value.perfYm,
      prtnrNo: searchParams.value.prtnrNo,
      // ogTpCd: 'HR1',
      // ogTpCd: searchParams.value.ogTpCd === '7' ? 'W02' : 'W01',
    },
  });

  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}

// 조회
async function fetchData(type) {
  searchParams.value.ogTpCd = searchParams.value.ogDvCd === '7' ? 'W02' : 'W01';
  const res = await dataService.get(`/sms/wells/fee/ledr-allowances/${type}`, { params: searchParams.value });
  const leaderAllowances = res.data;

  totalCount.value = leaderAllowances.length;

  let view;
  if (type === 'indv') view = grdIndvRef.value.getView();
  else if (type === 'sum') view = grdSumRef.value.getView();

  view.getDataSource().setRows(leaderAllowances);
  view.resetCurrent();
}

// 조회 버튼 클릭 이벤트
async function onClickSearch() {
  if (searchParams.value.inqrDvCd === '01') await fetchData('indv');
  else if (searchParams.value.inqrDvCd === '02') await fetchData('sum');
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridIndv = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'dsbYm',
      header: t('MSG_TXT_PERF_YM'),
      width: '106',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
      } }, // 실적년월
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_RSB_TP'), width: '96', styleName: 'text-center' }, // 직책유형
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG_NM'), width: '96', styleName: 'text-center' }, // 소속명
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '96', styleName: 'text-center' }, // 소속
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '96', styleName: 'text-center' }, // 성명
    { fieldName: 'hmnrscEmpno', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '106', styleName: 'text-center' }, // 번호
    { fieldName: 'brchCt',
      header: t('MSG_TXT_BRCH_N'),
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 지점수

    { fieldName: 'basAwAmt',
      header: t('MSG_TXT_BAS_SAL'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 기본급
    { fieldName: 'hhExcpAwAmt',
      header: t('MSG_TXT_HH_EXCP_AW'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 시간외수당
    { fieldName: 'rsbAwAmt',
      header: t('MSG_TXT_RSB') + t('MSG_TXT_AW'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 직책수당
    { fieldName: 'fxnAwSumAmt',
      header: t('MSG_TXT_FXN_SAL_SUM'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 고정급계

    { fieldName: 'trgCt',
      header: t('MSG_TXT_TRG'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 목표
    { fieldName: 'perfCt',
      header: t('MSG_TXT_PERF'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 실적
    { fieldName: 'perfAchvRat',
      header: t('MSG_TXT_ACHV_RT'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.#',
      headerSummary: {
        numberFormat: '#,##0.#',
        expression: 'avg',
      } }, // 달성률
    { fieldName: 'trgAchvAwAmt',
      header: t('MSG_TXT_TRG') + t('MSG_TXT_ACHV') + t('MSG_TXT_AW'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 목표달성수당
    { fieldName: 'mngrPerfGdCd', header: t('MSG_TXT_GD'), width: '133', styleName: 'text-right' }, // 등급(2021년 1월까지)
    { fieldName: 'ogAwAmt',
      header: t('MSG_TXT_OG') + t('MSG_TXT_AW'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 조직수당(2021년 2월부터)
    { fieldName: 'evlAwAmt',
      header: t('MSG_TXT_EVL') + t('MSG_TXT_AW'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 평가수당
    { fieldName: 'perfAwSumAmt',
      header: t('MSG_TXT_OUTC_AW_SUM'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 업적수당계

    { fieldName: 'exclDivAwAmt',
      header: t('MSG_TXT_EXCL_DIV'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 우수사업부
    { fieldName: 'ictAwAmt',
      header: t('MSG_TXT_ICT'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 인센티브
    { fieldName: 'ldstcAtdcAwAmt',
      header: t('MSG_TXT_LDSTC_ATDC_LVOF'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 원거리출퇴근
    { fieldName: 'mrntSpptAwAmt',
      header: t('MSG_TXT_MRNT_SPPT'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 월세지원
    { fieldName: 'lectrAdnAwAmt',
      header: t('MSG_TXT_LECT_CHRAM'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 강사료
    { fieldName: 'etcAdnAwAmt',
      header: t('MSG_TXT_ETC'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 기타
    { fieldName: 'etcAdnAwSumAmt',
      header: t('MSG_TXT_ETC') + t('MSG_TXT_AW_SUM'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 기타수당계

    { fieldName: 'fxnPerfAwSumAmt',
      header: `${t('MSG_TXT_FXN_SAL')}+${t('MSG_TXT_OUTC_AW')}`,
      width: '146',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 고정급+업적수당
    { fieldName: 'awCalcSumAmt',
      header: t('MSG_TXT_DSB_SUM'),
      width: '146',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 지급계

    { fieldName: 'hinsrDdctam',
      header: t('MSG_TXT_HL_INSR'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 건강보험
    { fieldName: 'nrsnInsrDdctam',
      header: t('MSG_TXT_LTM_NRSN_INSR'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 장기요양보험
    { fieldName: 'ntnlPnsnDdctam',
      header: t('MSG_TXT_NTNL_INSR'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 국민연금
    { fieldName: 'einsrDdctam',
      header: t('MSG_TXT_HIR_INSR'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 고용보험
    { fieldName: 'erntx',
      header: t('MSG_TXT_ERNTX'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 소득세
    { fieldName: 'rsdntx',
      header: t('MSG_TXT_RSDNTX'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 주민세
    { fieldName: 'crptBznsDdctam',
      header: t('MSG_TXT_IRG_BZNS'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 비정도영업조치금
    { fieldName: 'eddtnAmt',
      header: t('MSG_TXT_ETC'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 기타

    { fieldName: 'ddtnSumAmt',
      header: t('MSG_TXT_DDTN_SUM'),
      width: '146',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 공제계
    { fieldName: 'acpyAmt',
      header: t('MSG_TXT_TOT_DSB_AMT'),
      width: '146',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 총지급액
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  // 헤더쪽 합계 행고정, summary
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  if (searchParams.value.perfYm < '202102') {
    view.columnByName('mngrPerfGdCd').visible = true; // 등급
    view.columnByName('ogAwAmt').visible = false; // 조직수당
  } else {
    view.columnByName('mngrPerfGdCd').visible = false;
    view.columnByName('ogAwAmt').visible = true;
  }

  // multi row header setting
  view.setColumnLayout([
    'dsbYm',
    'rsbDvNm',
    'ogNm',
    'ogCd',
    'prtnrKnm',
    'hmnrscEmpno',
    'brchCt',
    {
      header: t('MSG_TXT_FXN_SAL'), // colspan title
      direction: 'horizontal', // merge type
      items: ['basAwAmt', 'hhExcpAwAmt', 'rsbAwAmt', 'fxnAwSumAmt'],
    },
    {
      header: t('MSG_TXT_OUTC_AW'),
      direction: 'horizontal',
      items: ['trgCt', 'perfCt', 'perfAchvRat', 'trgAchvAwAmt', 'mngrPerfGdCd', 'ogAwAmt', 'evlAwAmt', 'perfAwSumAmt'],
    },
    {
      header: t('MSG_TXT_ETC') + t('MSG_TXT_AW'), // colspan title
      direction: 'horizontal', // merge type
      items: ['exclDivAwAmt', 'ictAwAmt', 'ldstcAtdcAwAmt', 'mrntSpptAwAmt', 'lectrAdnAwAmt', 'etcAdnAwAmt', 'etcAdnAwSumAmt'],
    },
    'fxnPerfAwSumAmt',
    'awCalcSumAmt',
    {
      header: t('MSG_TXT_DDTN'), // colspan title
      direction: 'horizontal', // merge type
      items: ['hinsrDdctam', 'nrsnInsrDdctam', 'ntnlPnsnDdctam', 'einsrDdctam', 'erntx', 'rsdntx', 'crptBznsDdctam', 'eddtnAmt'],
    },
    'ddtnSumAmt',
    'acpyAmt',
  ]);
});

const initGridSum = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'dsbYm',
      header: t('MSG_TXT_PERF_YM'),
      width: '106',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
      },
    }, // 실적년월
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_RSB_TP'), width: '96', styleName: 'text-center' }, // 직책유형
    { fieldName: 'hmnrscEmpnoCnt',
      header: t('MSG_TXT_PPL_N'),
      width: '106',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 인원수

    { fieldName: 'basAwAmt',
      header: t('MSG_TXT_BAS_SAL'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 기본급
    { fieldName: 'hhExcpAwAmt',
      header: t('MSG_TXT_HH_EXCP_AW'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 시간외수당
    { fieldName: 'rsbAwAmt',
      header: t('MSG_TXT_RSB') + t('MSG_TXT_AW'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 직책수당
    { fieldName: 'fxnAwSumAmt',
      header: t('MSG_TXT_FXN_SAL_SUM'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 고정급계

    { fieldName: 'trgCt',
      header: t('MSG_TXT_TRG'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 목표
    { fieldName: 'perfCt',
      header: t('MSG_TXT_PERF'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 실적
    { fieldName: 'perfAchvRat',
      header: t('MSG_TXT_ACHV_RT'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0.#',
      headerSummary: {
        numberFormat: '#,##0.#',
        expression: 'avg',
      },
    }, // 달성률
    { fieldName: 'trgAchvAwAmt',
      header: t('MSG_TXT_TRG') + t('MSG_TXT_ACHV') + t('MSG_TXT_AW'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 목표달성수당
    { fieldName: 'ogAwAmt',
      header: t('MSG_TXT_OG') + t('MSG_TXT_AW'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 조직수당
    { fieldName: 'evlAwAmt',
      header: t('MSG_TXT_EVL') + t('MSG_TXT_AW'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 평가수당
    { fieldName: 'perfAwSumAmt',
      header: t('MSG_TXT_OUTC_AW_SUM'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 업적수당계

    { fieldName: 'exclDivAwAmt',
      header: t('MSG_TXT_EXCL_DIV'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 우수사업부
    { fieldName: 'ictAwAmt',
      header: t('MSG_TXT_ICT'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 인센티브
    { fieldName: 'ldstcAtdcAwAmt',
      header: t('MSG_TXT_LDSTC_ATDC_LVOF'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 원거리출퇴근
    { fieldName: 'mrntSpptAwAmt',
      header: t('MSG_TXT_MRNT_SPPT'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 월세지원
    { fieldName: 'lectrAdnAwAmt',
      header: t('MSG_TXT_LECT_CHRAM'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 강사료
    { fieldName: 'etcAdnAwAmt',
      header: t('MSG_TXT_ETC'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 기타
    { fieldName: 'etcAdnAwSumAmt',
      header: t('MSG_TXT_ETC') + t('MSG_TXT_AW_SUM'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 기타수당계

    { fieldName: 'fxnPerfAwSumAmt',
      header: `${t('MSG_TXT_FXN_SAL')}+${t('MSG_TXT_OUTC_AW')}`,
      width: '146',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 고정급+업적수당
    { fieldName: 'awCalcSumAmt',
      header: t('MSG_TXT_DSB_SUM'),
      width: '146',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 지급계

    { fieldName: 'hinsrDdctam',
      header: t('MSG_TXT_HL_INSR'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 건강보험
    { fieldName: 'nrsnInsrDdctam',
      header: t('MSG_TXT_LTM_NRSN_INSR'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 장기요양보험
    { fieldName: 'ntnlPnsnDdctam',
      header: t('MSG_TXT_NTNL_INSR'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 국민연금
    { fieldName: 'einsrDdctam',
      header: t('MSG_TXT_HIR_INSR'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 고용보험
    { fieldName: 'erntx',
      header: t('MSG_TXT_ERNTX'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 소득세
    { fieldName: 'rsdntx',
      header: t('MSG_TXT_RSDNTX'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 주민세
    { fieldName: 'crptBznsDdctam',
      header: t('MSG_TXT_IRG_BZNS'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 비정도영업조치금
    { fieldName: 'eddtnAmt',
      header: t('MSG_TXT_ETC'),
      width: '133',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 기타

    { fieldName: 'ddtnSumAmt',
      header: t('MSG_TXT_DDTN_SUM'),
      width: '146',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 공제계
    { fieldName: 'acpyAmt',
      header: t('MSG_TXT_TOT_DSB_AMT'),
      width: '146',
      styleName: 'text-right',
      dataType: 'number',
      numberFormat: '#,##0',
      headerSummary: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
    }, // 총지급액
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  // 헤더쪽 합계 행고정, summary
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    {
      column: 'dsbYm',
      summaryUserSpans: [{ colspan: 2 }],
    },
    'rsbDvNm',
    'hmnrscEmpnoCnt',
    {
      header: t('MSG_TXT_FXN_SAL'), // colspan title
      direction: 'horizontal', // merge type
      items: ['basAwAmt', 'hhExcpAwAmt', 'rsbAwAmt', 'fxnAwSumAmt'],
    },
    {
      header: t('MSG_TXT_OUTC_AW'),
      direction: 'horizontal',
      items: ['trgCt', 'perfCt', 'perfAchvRat', 'trgAchvAwAmt', 'ogAwAmt', 'evlAwAmt', 'perfAwSumAmt'],
    },
    {
      header: t('MSG_TXT_ETC') + t('MSG_TXT_AW'), // colspan title
      direction: 'horizontal', // merge type
      items: ['exclDivAwAmt', 'ictAwAmt', 'ldstcAtdcAwAmt', 'mrntSpptAwAmt', 'lectrAdnAwAmt', 'etcAdnAwAmt', 'etcAdnAwSumAmt'],
    },
    'fxnPerfAwSumAmt',
    'awCalcSumAmt',
    {
      header: t('MSG_TXT_DDTN'), // colspan title
      direction: 'horizontal', // merge type
      items: ['hinsrDdctam', 'nrsnInsrDdctam', 'ntnlPnsnDdctam', 'einsrDdctam', 'erntx', 'rsdntx', 'crptBznsDdctam', 'eddtnAmt'],
    },
    'ddtnSumAmt',
    'acpyAmt',
  ]);
});
</script>
