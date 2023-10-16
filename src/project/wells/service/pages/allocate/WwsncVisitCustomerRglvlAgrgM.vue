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
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4', dataType: 'number' },
    { fieldName: 'col5', dataType: 'number' },
    { fieldName: 'col6', dataType: 'number' },
    { fieldName: 'col7', dataType: 'number' },
    { fieldName: 'col8', dataType: 'number' },
    { fieldName: 'col9', dataType: 'number' },
    { fieldName: 'col10', dataType: 'number' },
    { fieldName: 'col11', dataType: 'number' },
    { fieldName: 'col12', dataType: 'number' },
  ];

  const columns = [
    {
      fieldName: 'col1',
      header: '구분',
      width: '64',
      styleName: 'text-center',
    },
    {
      fieldName: 'col2',
      header: '소속',
      width: '110',
      styleName: 'text-center',
    },
    {
      fieldName: 'col3',
      header: '빌딩명',
      width: '250',
      styleName: 'text-left',
    },
    {
      fieldName: 'col4',
      header: '계정수',
      width: '120',
      styleName: 'text-right',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'col5',
      header: '정상',
      width: '120',
      styleName: 'text-right',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'col6',
      header: 'W1급지',
      width: '120',
      styleName: 'text-right',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'col7',
      header: 'W1급지',
      width: '120',
      styleName: 'text-right',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'col8',
      header: '급지계',
      width: '120',
      styleName: 'text-right',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'col9',
      header: '기타',
      width: '120',
      styleName: 'text-right',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'col10',
      header: '급지(%)',
      width: '120',
      styleName: 'text-right',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'col11',
      header: '환산계',
      width: '120',
      styleName: 'text-right',
      headerSummary: {
        type: 'number',
        numberFormat: '#,##0',
        expression: 'sum',
      },
    },
    {
      fieldName: 'col12',
      header: '환산(%)',
      width: '120',
      styleName: 'text-right',
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

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  view.setColumnLayout([
    'col1', 'col2', 'col3', 'col4', // single
    {
      header: '급지현황', // colspan title
      direction: 'horizontal', // merge type
      items: ['col5', 'col6', 'col7', 'col8', 'col9', 'col10', 'col11', 'col12'],
    },
  ]);

  // data.setRows([
  // eslint-disable-next-line max-len
  //   { col1: '1', col2: 'A970000', col3: '인천검단/라임3층', col4: '5122', col5: '4,192', col6: '18', col7: '207', col8: '694', col9: '1', col10: '18.4', col11: '1884', col12: '36.8' },
  // eslint-disable-next-line max-len
  //   { col1: '1', col2: 'A970000', col3: '인천검단/라임3층', col4: '5122', col5: '4,192', col6: '18', col7: '207', col8: '694', col9: '1', col10: '18.4', col11: '1884', col12: '36.8' },
  // eslint-disable-next-line max-len
  //   { col1: '1', col2: 'A970000', col3: '인천검단/라임3층', col4: '5122', col5: '4,192', col6: '18', col7: '207', col8: '694', col9: '1', col10: '18.4', col11: '1884', col12: '36.8' },
  // eslint-disable-next-line max-len
  //   { col1: '1', col2: 'A970000', col3: '인천검단/라임3층', col4: '5122', col5: '4,192', col6: '18', col7: '207', col8: '694', col9: '1', col10: '18.4', col11: '1884', col12: '36.8' },
  // eslint-disable-next-line max-len
  //   { col1: '1', col2: 'A970000', col3: '인천검단/라임3층', col4: '5122', col5: '4,192', col6: '18', col7: '207', col8: '694', col9: '1', col10: '18.4', col11: '1884', col12: '36.8' },
  // eslint-disable-next-line max-len
  //   { col1: '1', col2: 'A970000', col3: '인천검단/라임3층', col4: '5122', col5: '4,192', col6: '18', col7: '207', col8: '694', col9: '1', col10: '18.4', col11: '1884', col12: '36.8' },
  // eslint-disable-next-line max-len
  //   { col1: '1', col2: 'A970000', col3: '인천검단/라임3층', col4: '5122', col5: '4,192', col6: '18', col7: '207', col8: '694', col9: '1', col10: '18.4', col11: '1884', col12: '36.8' },
  // eslint-disable-next-line max-len
  //   { col1: '1', col2: 'A970000', col3: '인천검단/라임3층', col4: '5122', col5: '4,192', col6: '18', col7: '207', col8: '694', col9: '1', col10: '18.4', col11: '1884', col12: '36.8' },
  // eslint-disable-next-line max-len
  //   { col1: '1', col2: 'A970000', col3: '인천검단/라임3층', col4: '5122', col5: '4,192', col6: '18', col7: '207', col8: '694', col9: '1', col10: '18.4', col11: '1884', col12: '36.8' },
  // eslint-disable-next-line max-len
  //   { col1: '1', col2: 'A970000', col3: '인천검단/라임3층', col4: '5122', col5: '4,192', col6: '18', col7: '207', col8: '694', col9: '1', col10: '18.4', col11: '1884', col12: '36.8' },
  // eslint-disable-next-line max-len
  //   { col1: '1', col2: 'A970000', col3: '인천검단/라임3층', col4: '5122', col5: '4,192', col6: '18', col7: '207', col8: '694', col9: '1', col10: '18.4', col11: '1884', col12: '36.8' },
  // ]);
}

</script>
