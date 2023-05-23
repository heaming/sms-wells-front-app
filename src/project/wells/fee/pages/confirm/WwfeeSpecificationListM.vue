<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 고객 - 수수료 지급명세서
2. 프로그램 ID : WwfeeSpecificationListM - 수수료 지급명세서 (W-CO-U-0037M01)
3. 작성자 : kangik-yun
4. 작성일 : 2023.02.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 >> 수수료 지급명세서 프로그램
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
            rules="required"
            type="month"
            :label="$t('MSG_TXT_PERF_YM')"
            @change="onChangeDiv"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OG_TP')"
          required
        >
          <kw-select
            v-model="searchParams.ogTpCd"
            :label="$t('MSG_TXT_OG_TP')"
            :model-value="searchParams.ogTpCd"
            :options="ogTpCd"
            rules="required"
            @change="onChangeDiv"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RSB_TP')"
          required
        >
          <kw-option-group
            v-model="searchParams.rsbDvCd"
            :label="$t('MSG_TXT_RSB_TP')"
            :model-value="'1'"
            type="radio"
            rules="required"
            :options="serachRsbDbOptionList"
            @change="onChangeDiv"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_OG_LEVL')"
          :colspan="2"
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevel1"
            v-model:og-levl-dv-cd2="searchParams.ogLevel2"
            v-model:og-levl-dv-cd3="searchParams.ogLevel3"
            :og-tp-cd="searchParams.ogTpCd"
            :base-ym="searchParams.perfDt"
            :start-level="1"
            :end-level="3"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            clearable
            icon="search"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
          <span class="ml8">(단위:원)</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="totalCount === 0"
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
          :label="$t('MSG_BTN_DSB_SPCSH_PRNT')+&quot;(&quot;+t('MSG_TXT_HDOF')+&quot;)&quot;"
        />
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_DSB_SPCSH_PRNT')"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, defineGrid, gridUtil, codeUtil } from 'kw-lib';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const totalCount = ref(0);
const dataService = useDataService();
const { t } = useI18n();

const searchParams = ref({
  perfDt: dayjs().add(-1, 'month').format('YYYYMM'),
  ogTpCd: 'W02',
  rsbDvCd: '1',
  feeCalcUnitTpCd: '201', // 수수료계산단위유형코드 (101 : P추진단 플래너, 102 : P추진단 지국장, 201 : M추진단-일반(15등급), 202 : M추진단
  ogLevel1: '',
  ogLevel2: '',
  ogLevel3: '',
});

// 수수료 코드 리스트
let feeCodes;

const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;
let fieldsObj;

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const codes = await codeUtil.getMultiCodes('OG_TP_CD', 'RSB_DV_CD');
const ogTpCd = codes.OG_TP_CD.filter((v) => ['W01', 'W02', 'W03'].includes(v.codeId));

let gridView;
let gridData;
let cashedFeeCodes;

async function fetchData() {
  const res = await dataService.get('/sms/wells/fee/fee-specifications', { params: cachedParams });
  const datas = res.data;
  console.log('datas: ', datas);

  totalCount.value = datas.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(datas);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  fetchData();
}

async function getFeeCodes() {
  const res = await dataService.get('/sms/wells/fee/fee-specifications/fee-codes', { params: searchParams.value });
  // res.data.forEach((obj) => {
  //   obj.feeNm = obj.feeNm.replaceAll(/\(.*?\)/g, '');
  // });
  feeCodes = res.data;
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/fee/fee-specifications', { params: cachedParams });

  gridUtil.exportView(view, {
    fileName: '수수료 지급 명세서',
    timePostfix: true,
    exportData: res.data,
  });
}

// 직책유형 옵션
const serachRsbDbOptionList = [
  {
    codeId: '1',
    codeName: t('MSG_TXT_PLAR'), // 플래너
  },
  {
    codeId: '2',
    codeName: t('MSG_TXT_BRMGR'), // 지점장
  },
];

async function onChangeDiv() {
  console.log(searchParams.value);
  let feeCalcUnitTpCd = '201';

  if (searchParams.value.ogTpCd === 'W01') { // P추진단
    if (searchParams.value.rsbDvCd === '1') feeCalcUnitTpCd = '101'; // 플래너
    else feeCalcUnitTpCd = '102'; // 지국장
  } else if (searchParams.value.ogTpCd === 'W02') { // M추진단
    if (searchParams.value.rsbDvCd === '1') feeCalcUnitTpCd = '201'; // 플래너
    else feeCalcUnitTpCd = '202'; // 지국장
  }
  searchParams.value.feeCalcUnitTpCd = feeCalcUnitTpCd;
  await getFeeCodes();
  cashedFeeCodes = feeCodes.filter((obj) => (obj.feeCalcUnitTpCd === searchParams.value.feeCalcUnitTpCd)); // 수수료 코드 필터링
  console.log('cashedFeeCodes: ', cashedFeeCodes);

  fieldsObj.setFields();
}

onMounted(async () => {
  await getFeeCodes();
  await onChangeDiv();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

// 검색조건에 따른 컬럼 변경
fieldsObj = {

  defaultFields: [// 그리드 앞부분 기본 공통컬럼
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '103.8', styleName: 'text-left' }, // 총괄단
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '103.8', styleName: 'text-left' }, // 지역단
    { fieldName: 'dgr3LevlOgNm', header: t('MSG_TXT_BRANCH'), width: '103.8', styleName: 'text-left' }, // 지점
    { fieldName: 'prtNrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '110.8', styleName: 'text-center' }, // 번호
    { fieldName: 'prtNrKNm', header: t('MSG_TXT_EMPL_NM'), width: '110.8', styleName: 'text-left' }, // 성명
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_RSB'), width: '88.7', styleName: 'text-left' }, // 직책
    { fieldName: 'meetDates', header: t('MSG_TXT_METG_PRSC_DC'), width: '93.1', styleName: 'text-right', dataType: 'number' }, // 미팅참석일수
  ],
  mp: { // M추진단 / 플래너
    perfFields: [ // 실적부분
      { fieldName: 'perf02', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '118.1', styleName: 'text-right', dataType: 'number' }, // 가전인정건수
      { fieldName: 'perf03', header: t('MSG_TXT_ELHM_CHDVC_CT'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 가전기변건수
    ],
    deductionFields: [ // 공제 부분
      { fieldName: 'ddtn02', header: t('MSG_TXT_ERNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 소득세
      { fieldName: 'ddtn03', header: t('MSG_TXT_RSDNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 주민세
      { fieldName: 'ddtn01', header: t('MSG_TXT_RDS'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 보증예치금
      { fieldName: 'ddtn04', header: t('MSG_TXT_PNPYAM'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 가지급금
      { fieldName: 'ddtn07', header: t('MSG_TXT_BU_DDTN'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 부담공제
    ],
  },
  pp: { // P추진단 / 플래너
    perfFields: [ // 실적부분
      { fieldName: 'w01p00001', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '118.1', styleName: 'text-right', dataType: 'number' }, // 가전인정건수
      { fieldName: 'w01p00004', header: t('MSG_TXT_ELHM_EXCP_ACKMT_CT'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 가전외
      { fieldName: 'w01p00009', header: t('MSG_TXT_ADP'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 합산
      { fieldName: 'w01p00028', header: t('MSG_TXT_MCHN_CH_PERF'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 기변실적
    ],
    deductionFields: [ // 공제 부분
      { fieldName: 'ddtn02', header: t('MSG_TXT_ERNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 소득세
      { fieldName: 'ddtn03', header: t('MSG_TXT_RSDNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 주민세
      { fieldName: 'ddtn01', header: t('MSG_TXT_RDS'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 보증예치금
      { fieldName: 'ddtn04', header: t('MSG_TXT_PNPYAM'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 가지급금
      { fieldName: 'ddtn07', header: t('MSG_TXT_BU_DDTN'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 부담공제
      { fieldName: 'ddtn05', header: t('MSG_TXT_HIR_INSR'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 고용보험
    ],
  },
  mm: { // M추진단 / 지점장
    perfFields: [ // 실적부분
      { fieldName: 'pref02', header: t('MSG_TXT_OG_ELHM_ACKMT_CT'), width: '118.1', styleName: 'text-right', dataType: 'number' }, // 조직 가전인정건수
      { fieldName: 'perf03', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 가전인정건수
      { fieldName: 'perf04', header: t('MSG_TXT_MCHN_CH_PERF'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 기변실적
    ],
    deductionFields: [ // 공제 부분
      { fieldName: 'ddtn02', header: t('MSG_TXT_ERNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 소득세
      { fieldName: 'ddtn03', header: t('MSG_TXT_RSDNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 주민세
      { fieldName: 'ddtn01', header: t('MSG_TXT_RDS'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 보증예치금
      { fieldName: 'ddtn04', header: t('MSG_TXT_PNPYAM'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 가지급금
      { fieldName: 'ddtn07', header: t('MSG_TXT_BU_DDTN'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 부담공제
      { fieldName: 'ddtn88', header: t('MSG_TXT_DSC_SELL'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 할인판매
      { fieldName: 'ddtn05', header: t('MSG_TXT_HIR_INSR'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 고용보험
    ],
  },
  pm: { // P추진단 / 지점장
    perfFields: [ // 실적부분
      { fieldName: 'oW01p00001', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '118.1', styleName: 'text-right', dataType: 'number' }, // 조직 - 가전인정건수
      { fieldName: 'oW01p00004', header: t('MSG_TXT_ELHM_EXCP_ACKMT_CT'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 조직 - 가전외
      { fieldName: 'oW01p00029', header: t('MSG_TXT_ADP'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 조직 - 합산

      { fieldName: 'pW01p00001', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '118.1', styleName: 'text-right', dataType: 'number' }, // 개인 - 가전인정건수
      { fieldName: 'pW01p00004', header: t('MSG_TXT_ELHM_EXCP_ACKMT_CT'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 개인 - 가전외
      { fieldName: 'pW01p00009', header: t('MSG_TXT_ADP'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 개인 - 합산
      { fieldName: 'pW00p00028', header: t('MSG_TXT_MCHN_CH_PERF'), width: '111.9', styleName: 'text-right', dataType: 'number' }, // 개인 - 기변실적
    ],
    deductionFields: [ // 공제 부분
      { fieldName: 'ddtn02', header: t('MSG_TXT_ERNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 소득세
      { fieldName: 'ddtn03', header: t('MSG_TXT_RSDNTX'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 주민세
      { fieldName: 'ddtn01', header: t('MSG_TXT_RDS'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 보증예치금
      { fieldName: 'ddtn04', header: t('MSG_TXT_PNPYAM'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 가지급금
      { fieldName: 'ddtn07', header: t('MSG_TXT_BU_DDTN'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 부담공제
      { fieldName: 'ddtn05', header: t('MSG_TXT_HIR_INSR'), width: '142.8', styleName: 'text-right', dataType: 'number' }, // 고용보험
    ],
  },

  // 조직유형 , 직책유형에 따른 필드 세팅
  setFields() {
    let columns = fieldsObj.defaultFields;
    let layoutColumns = [];
    const feeSumField = { fieldName: 'feeSum', header: t('MSG_TXT_FEE_SUM'), width: '142.8', styleName: 'text-right', dataType: 'number' }; // 수수료 합계
    const ddenSumFields = { fieldName: 'ddtnsum', header: t('MSG_TXT_DDTN_SUM'), width: '142.8', styleName: 'text-right', dataType: 'number' }; // 공제계
    const dsbAmtFields = { fieldName: 'dsbamt', header: t('MSG_TXT_PAYOUTS'), width: '142.8', styleName: 'text-right', dataType: 'number' }; // 지급액

    const tmpFeeFields = cashedFeeCodes.map((obj) => ({ fieldName: obj.feeCd, header: obj.feeNm, width: '142.8', styleName: 'text-right', dataType: 'number' }));

    if (searchParams.value.feeCalcUnitTpCd === '102') { // P추진단 / 지점장
      const { perfFields } = fieldsObj.pm;
      const { deductionFields } = fieldsObj.pm;

      columns = [...fieldsObj.defaultFields, ...perfFields,
        ...tmpFeeFields, feeSumField, ...deductionFields, ddenSumFields, dsbAmtFields];
      // 헤더 부분 merge
      layoutColumns = [...fieldsObj.getColumnNameArr(fieldsObj.defaultFields),
        {
          header: t('MSG_TXT_OG_PERF'),
          direction: 'horizontal', // merge type
          items: ['oW01p00001', 'oW01p00004', 'oW01p00029'],
        },
        {
          header: t('MSG_TXT_INDV_PERF'),
          direction: 'horizontal', // merge type
          items: ['pW01p00001', 'pW01p00004', 'pW01p00009', 'pW00p00028'],
        },
        {
          header: t('MSG_TXT_FEE'),
          direction: 'horizontal', // merge type
          items: [...fieldsObj.getColumnNameArr(tmpFeeFields)],
        },
        ...fieldsObj.getColumnNameArr([feeSumField]),
        {
          header: t('MSG_TXT_DDTN'),
          direction: 'horizontal', // merge type
          items: [...fieldsObj.getColumnNameArr(deductionFields)],
        },
        ...fieldsObj.getColumnNameArr([ddenSumFields]),
        ...fieldsObj.getColumnNameArr([dsbAmtFields]),
      ];
    } else {
      let perfFields = {};
      let deductionFields = {};
      if (searchParams.value.feeCalcUnitTpCd === '101') { // p 추진단 플래너
        perfFields = fieldsObj.pp.perfFields;
        deductionFields = fieldsObj.pp.deductionFields;
      } else if (searchParams.value.feeCalcUnitTpCd === '201') { // m 추진단  플래너
        perfFields = fieldsObj.mp.perfFields;
        deductionFields = fieldsObj.mp.deductionFields;
      } else if (searchParams.value.feeCalcUnitTpCd === '202') { // m 추진단  지국장
        perfFields = fieldsObj.mm.perfFields;
        deductionFields = fieldsObj.mm.deductionFields;
      }

      columns = [...fieldsObj.defaultFields, ...perfFields,
        ...tmpFeeFields, feeSumField, ...deductionFields, ddenSumFields, dsbAmtFields];
      // 헤더 부분 merge
      layoutColumns = [...fieldsObj.getColumnNameArr(fieldsObj.defaultFields),
        {
          header: t('MSG_TXT_PERF'),
          direction: 'horizontal', // merge type
          items: [...fieldsObj.getColumnNameArr(perfFields)],
        },
        {
          header: t('MSG_TXT_FEE'),
          direction: 'horizontal', // merge type
          items: [...fieldsObj.getColumnNameArr(tmpFeeFields)],
        },
        ...fieldsObj.getColumnNameArr([feeSumField]),
        {
          header: t('MSG_TXT_DDTN'),
          direction: 'horizontal', // merge type
          items: [...fieldsObj.getColumnNameArr(deductionFields)],
        },
        ...fieldsObj.getColumnNameArr([ddenSumFields]),
        ...fieldsObj.getColumnNameArr([dsbAmtFields]),
      ];
    }
    const fields = columns.map(({ fieldName, dataType }) => ({ fieldName, dataType }));
    console.log('fields: ', fields);

    gridData.setFields(fields);
    gridView.setColumns(columns);
    console.log('columns: ', columns);

    gridView.setColumnLayout([...layoutColumns]);
  },
  // 리스트에 담겨진 항목중 {fieldName : "" }  만  가져옴
  getColumnNameList(ObjList) {
    return ObjList.map((obj) => ({ fieldName: obj.fieldName }));
  },
  // 리스트에 담겨진 항목 중 fieldName 배열로 가져옴
  getColumnNameArr(objList) {
    return objList.map((v) => v.fieldName);
  },

};

const initGrid = defineGrid((data, view) => {
  const fields = [
    ...fieldsObj.getColumnNameList(fieldsObj.defaultFields),
  ];

  const columns = [
    ...fieldsObj.defaultFields,
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  console.log('gridView', view);
  gridView = view;
  gridData = data;
});

</script>
