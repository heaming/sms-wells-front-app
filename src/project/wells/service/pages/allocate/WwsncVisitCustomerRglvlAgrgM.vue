<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : [K-W-SV-U-0232M01] WwsncVisitCustomerRglvlAgrgM - 방문고객 급지집계
3. 작성자 : gs.piit231
4. 작성일 : 2023.110.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 방문고객 급지집계
****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <template #header>
      <kw-page-header
        :options="['홈','정보관리','급지관리','방문고객 급지집계']"
      />
    </template>
    <kw-search
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 방문년월 -->
        <kw-search-item :label="$t('MSG_TXT_VST_YM')">
          <kw-date-picker
            v-model="searchParams.vstYm"
            type="month"
          />
        </kw-search-item>
        <!-- 고객구분 -->
        <kw-search-item :label="$t('MSG_TXT_CST_DV')">
          <kw-select
            v-model="searchParams.rcgvpDiv"
            :options="selectCodes.custDiv"
            first-option="all"
            first-option-value=""
          />
        </kw-search-item>
        <!-- 조회구분 -->
        <kw-search-item :label="$t('MSG_TXT_INQR_DV')">
          <kw-select
            v-model="searchParams.inqrDiv"
            :options="selectCodes.inqrDiv"
            @change="onChangeInqrDiv"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 관리총괄단 -->
        <!-- <kw-search-item :label="$t('MSG_TXT_MGT') + $t('MSG_TXT_MANAGEMENT_DEPARTMENT')">
          <kw-select
            v-model="searchParams.mngtGnrdvDiv"
            :options="selectCodes.mngtGnrdvDiv"
            first-option="all"
            first-option-value=""
          />
        </kw-search-item> -->
        <!-- 관리지역단 -->
        <!-- <kw-search-item :label="$t('MSG_TXT_MGT') + $t('MSG_TXT_RGNL_GRP')">
          <kw-select
            v-model="searchParams.mngtRgrpDiv"
            :options="selectCodes.mngtRgrpDiv"
            first-option="all"
            first-option-value=""
          />
        </kw-search-item> -->
        <!-- 담당자명 -->
        <!-- <kw-search-item :label="$t('MSG_TXT_PIC_NM')">
          <kw-select
            v-model="searchParams.psicNm"
            :options="selectCodes.psicNms"
            first-option="all"
            first-option-value=""
            :disable="true"
          />
        </kw-search-item> -->
        <wwsn-manager-og-search-item-group
          ref="ogSearchRef"
          v-model:dgr1-levl-og-id="searchParams.dgr1LevlOgId"
          v-model:dgr2-levl-og-id="searchParams.dgr2LevlOgId"
          v-model:dgr3-levl-og-id="searchParams.dgr3LevlOgId"
          v-model:prtnr-no="searchParams.partnerNo"
          use-og-level="2"
          use-partner
          dgr1-levl-og-first-option="all"
          dgr2-levl-og-first-option="all"
          partner-first-option="all"
          dgr1-levl-og-label="ogCdNm"
          dgr2-levl-og-label="ogCdNm"
          partner-label="prtnrNoNm"
          :partner-readonly="inqrDivYn"
          auth-yn="N"
        />
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
        </template>
        <!-- 인쇄 -->
        <kw-btn
          icon="print"
          secondary
          dense
          :disable="totalCount === 0"
          :label="$t('MSG_BTN_PRTG')"
          @click="onClickPrintEl"
        />
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          secondary
          dense
          :disable="totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
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
import { useDataService, getComponentType, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import { printElement } from '~common/utils/common';
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';

const { t } = useI18n();
const { currentRoute } = useRouter();

const dataService = useDataService();
const grdMainRef = ref(getComponentType('KwGrid'));

const selectCodes = {
  custDiv: [
    { codeId: '1', codeName: t('MSG_TXT_NW_CST') }, // 신규고객
    { codeId: '2', codeName: t('MSG_TXT_EXP_CST') }, // 예정고객
    { codeId: '3', codeName: t('MSG_TXT_VST_CST') }, // 방문고객
    { codeId: '4', codeName: t('MSG_TXT_CMPLTD_CST') }, // 방문완료고객
    { codeId: '5', codeName: t('MSG_TXT_CAN_CST') }, // 취소고객
  ],
  inqrDiv: [
    { codeId: '1', codeName: t('MSG_TXT_RGNL_GRP') }, // 지역단
    { codeId: '2', codeName: t('MSG_TXT_PIC') }, // 담당자
  ],
  // mngtGnrdvDiv: [
  //   { codeId: 'A000000', codeName: t('A000000') },
  //   { codeId: 'B000000', codeName: t('B000000') },
  //   { codeId: 'C000000', codeName: t('C000000') },
  //   { codeId: 'D000000', codeName: t('D000000') },
  //   { codeId: 'E000000', codeName: t('E000000') },
  //   { codeId: 'F000000', codeName: t('F000000') },
  //   { codeId: 'G000000', codeName: t('G000000') },
  //   { codeId: 'H000000', codeName: t('H000000') },
  //   { codeId: 'T000000', codeName: t('T000000') },
  //   { codeId: 'V000000', codeName: t('V000000') },
  //   { codeId: 'W000000', codeName: t('W000000') },
  //   { codeId: 'X000000', codeName: t('X000000') },
  //   { codeId: 'Z000000', codeName: t('Z000000') },
  // ],
  // mngtRgrpDiv: [
  //   { codeId: 'A910000', codeName: t('A910000') },
  //   { codeId: 'A930000', codeName: t('A930000') },
  //   { codeId: 'A940000', codeName: t('A940000') },
  //   { codeId: 'A950000', codeName: t('A950000') },
  //   { codeId: 'A960000', codeName: t('A960000') },
  // ],
};

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
console.log('cachedParams >>>>', cachedParams);
const searchParams = ref({
  vstYm: dayjs().format('YYYYMM'), // 기준년도
  rcgvpDiv: '', /* 고객구분 */
  inqrDiv: '1', /* 조회구분 */
  dgr1LevlOgId: '', /* 총괄단 */
  dgr2LevlOgId: '', /* 지역단 */
  dgr3LevlOgId: '', /* 미사용 */
  partnerNo: '', /* 매니저 */
});

// 조회구분에 따른 매니저 출력 유무 기본 setting
const inqrDivYn = ref(true);

const totalCount = ref(0);

async function fetchData() {
  console.log('fetchData START');
  const res = await dataService.get('/sms/wells/service/visit-cst-rglvl-agrg', { params: { ...cachedParams } });
  totalCount.value = res.data.length;
  console.log('res.data >>>', res.data);

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onChangeInqrDiv() {
  inqrDivYn.value = searchParams.value.inqrDiv !== '2';
}

const pageRef = ref();
async function onClickPrintEl() {
  printElement(pageRef);
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const columns = [
    // { // 구분
    //   fieldName: 'dddp',
    //   header: t('MSG_TXT_DIV'),
    //   width: '64',
    //   styleName: 'text-center',
    // },
    { // 소속
      fieldName: 'dddp',
      header: t('MSG_TXT_BLG'),
      width: '110',
      styleName: 'text-center',
    },
    { // 빌딩명
      fieldName: 'dbna',
      header: t('MSG_TXT_BLD_NM'),
      width: '250',
      styleName: 'text-left',
    },
    { // 계정수
      fieldName: 'wrkCnt',
      header: t('MSG_TXT_ACC_N'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    { // 정상
      fieldName: 'ncnt',
      header: t('MSG_TXT_NOM'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    { // W1급지
      fieldName: 'w1ct',
      header: `W1${t('MSG_TXT_RGLVL')}`,
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    { // W2급지
      fieldName: 'w2ct',
      header: `W2${t('MSG_TXT_RGLVL')}`,
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    { // 급지계
      fieldName: 'wacc',
      header: `${t('MSG_TXT_RGLVL')} ${t('MSG_TXT_AGG')}`,
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    { // 기타
      fieldName: 'ecnt',
      header: t('MSG_TXT_ETC'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    { // 급지(%)
      fieldName: 'wper',
      header: `${t('MSG_TXT_RGLVL')}%`,
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    { // 환산계
      fieldName: 'hacc',
      header: t('환산계'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    { // 환산(%)
      fieldName: 'hper',
      header: t('환산(%)'),
      width: '120',
      styleName: 'text-right',
      dataType: 'number',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
  ];

  // 헤더쪽 합계 행고정, summary
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 40,
      },
    ],
  });

  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  view.setColumnLayout([
    // 'dddp', 'heldt', 'dbna', 'mct1', // single
    'dddp', 'dbna', 'wrkCnt', // single
    {
      header: '급지현황', // colspan title
      direction: 'horizontal', // merge type
      items: ['ncnt', 'w1ct', 'w2ct', 'wacc', 'ecnt', 'wper', 'hacc', 'hper'],
    },
  ]);
}

</script>
