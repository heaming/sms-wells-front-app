<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebMutualAidFeeMgtM - 상조 수수료 관리
3. 작성자 : gs.nidhi.d
4. 작성일 : 2023.03.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상조 수수료 관리
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
            v-model="searchParams.baseYm"
            :label="$t('MSG_TXT_PERF_YM')"
            rules="required"
            type="month"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_DIV')"
        >
          <kw-option-group
            v-model="searchParams.type"
            type="radio"
            :options="[{codeId: 'A', codeName: '개인'},
                       {codeId: 'B', codeName: '조직'}]"
          />
        </kw-search-item>

        <kw-form-item
          :label="$t('MSG_TXT_CNTR_DATE')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.strtdt"
            v-model:to="searchParams.enddt"
            type="date"
            :label="$t('MSG_TXT_CNTR_DATE')"
          />
        </kw-form-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_NM')"
        >
          <kw-option-group
            v-model="searchParams.nameType"
            type="radio"
            :options="[{codeId: '', codeName: '전체'},
                       {codeId: 'A', codeName: '429'},
                       {codeId: 'B', codeName: '599'}]"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>

        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="(totalCount === 0)"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_FEE_CRT')"
          primary
          dense
          @click="onClickCreate"
        />
      </kw-action-top>
      <kw-grid
        ref="grdRef"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, useGlobal, useDataService, getComponentType, gridUtil } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const now = dayjs();
const { t } = useI18n();
const { modal } = useGlobal();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRef = ref(getComponentType('KwGrid'));
const grdData = computed(() => grdRef.value?.getData());
const totalCount = ref(0);
// 위에 하드코딩된 코드들 미정의됨
// const codes = await codeUtil.getMultiCodes(
//   'COD_YN',
// );

let cachedParams;
const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  type: 'A',
  strtdt: now.format('YYYYMMDD'),
  enddt: now.add(3, 'month').format('YYYYMMDD'),
  nameType: '',
});
// 데이터 조회
async function fetchData() {
  const { data } = await dataService.get('API정의안됨', { params: { ...cachedParams } });
  grdData.value.setRows(data);
  totalCount.value = data.length;
}
// 조회 버튼
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
// 엑셀 다운로드 버튼
async function onClickExcelDownload() {
  const view = grdRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}
// 수수료 생성 버튼
async function onClickCreate() {
  const { result: isChanged, payload } = await modal({
    component: 'WwfebMutualAidFeeRegP',
    componentProps: {
      type: searchParams.value.type,
    },
  });
  if (isChanged) {
    if (!isEmpty(payload.rtnKey)) {
      onClickSearch();
    }
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_MNTH_OCCURENCE'), width: '103.8', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'col2', header: t('MSG_TXT_CLASFCTN_FEE'), width: '110.8', styleName: 'text-' },
    { fieldName: 'col3', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '110.8', styleName: 'text-' },
    { fieldName: 'col4', header: t('MSG_TXT_RGNL_GRP'), width: '110.8', styleName: 'text-' },
    { fieldName: 'col5', header: t('MSG_TXT_BRANCH'), width: '110.8', styleName: 'text-' },
    { fieldName: 'col6', header: t('MSG_TXT_SELLER_NO'), width: '110.8', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_EMPL_NM'), width: '110.8', styleName: 'text-' },
    { fieldName: 'col8', header: t('MSG_TXT_RSB'), width: '110.8', styleName: 'text-' },
    { fieldName: 'col9', header: t('MSG_TXT_BRMGR_NO'), width: '110.8', styleName: 'text-center' },
    { fieldName: 'col10', header: `Wells ${t('MSG_TXT_CNTR_NO')}`, width: '137.6', styleName: 'text-center' },
    { fieldName: 'col11', header: `Wells ${t('MSG_TXT_PRDT_NM')}`, width: '230.7', styleName: 'text-' },
    { fieldName: 'col12', header: t('MSG_TXT_INST_DT'), width: '110.8', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col13', header: `${t('MSG_TXT_MUTU')} ${t('MSG_TXT_CNTR_NO')}`, width: '137.6', styleName: 'text-center' },
    { fieldName: 'col14', header: `${t('MSG_TXT_MUTU')} ${t('MSG_TXT_PRDT_NM')}`, width: '110.8', styleName: 'text-center' },
    { fieldName: 'col15', header: t('MSG_TXT_RCP_D'), width: '110.8', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col16', header: `${t('MSG_TXT_CNTRCT_DT')} ${t('MSG_TXT_1ST_WTHDRWL_DT')}`, width: '162.4', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col17', header: t('MSG_TXT_CAN_D'), width: '110.8', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col18', header: t('MSG_TXT_SELLER_FEE'), width: '156.6', styleName: 'text-right' },
    { fieldName: 'col19', header: t('MSG_TXT_TOTAL_PYMNT_TRGT'), width: '112.3', styleName: 'text-right' },
    { fieldName: 'col20', header: t('MSG_TXT_ORDERSELECT_TITLE'), width: '81.1', styleName: 'text-right' },
    { fieldName: 'col21', header: t('MSG_TXT_CUMULATIVE_SALES'), width: '156.6', styleName: 'text-right' },
    { fieldName: 'col22', header: t('MSG_TXT_ACU_DP'), width: '156.6', styleName: 'text-right' },
    { fieldName: 'col23', header: t('MSG_TXT_FULL_PYMNT_RD'), width: '81.1', styleName: 'text-right' },
    { fieldName: 'col24', header: t('MSG_TXT_BASE_PYMNT'), width: '126.7', styleName: 'text-right' },
    { fieldName: 'col25', header: t('MSG_TXT_THM_DSB'), width: '126.7', styleName: 'text-right' },
    { fieldName: 'col26', header: t('MSG_TXT_LIFE_CNFRMD'), width: '126.7', styleName: 'text-center' },
    { fieldName: 'col27', header: t('MSG_TXT_FEE_PYMNT_MNTH'), width: '186', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'col28', header: t('MSG_TXT_FEE_BCK_MNTH'), width: '186', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  data.setRows([
    { col1: '202210', col2: '수수료', col3: 'OO총괄단', col4: 'OO지역단', col5: '김웰스 지점', col6: '1234567', col7: '김교원', col8: '플래너', col9: '1234567', col10: '2022-5559710', col11: '김치냉장고4Door', col12: '20221012', col13: '2022-5559710', col14: '599', col15: '20221012', col16: '20221012', col17: '20221012', col18: '12,345', col19: '12', col20: '1', col21: '12,345', col22: '12,345', col23: '1', col24: '12,345', col25: '12,345', col26: 'Y', col27: '202210', col28: '202210' },
    { col1: '202210', col2: '수수료', col3: 'OO총괄단', col4: 'OO지역단', col5: '김웰스 지점', col6: '1234567', col7: '김교원', col8: '플래너', col9: '1234567', col10: '2022-5559710', col11: '김치냉장고4Door', col12: '20221012', col13: '2022-5559710', col14: '599', col15: '20221012', col16: '20221012', col17: '20221012', col18: '12,345', col19: '12', col20: '1', col21: '12,345', col22: '12,345', col23: '1', col24: '12,345', col25: '12,345', col26: 'Y', col27: '202210', col28: '202210' },
    { col1: '202210', col2: '수수료', col3: 'OO총괄단', col4: 'OO지역단', col5: '김웰스 지점', col6: '1234567', col7: '김교원', col8: '플래너', col9: '1234567', col10: '2022-5559710', col11: '김치냉장고4Door', col12: '20221012', col13: '2022-5559710', col14: '599', col15: '20221012', col16: '20221012', col17: '20221012', col18: '12,345', col19: '12', col20: '1', col21: '12,345', col22: '12,345', col23: '1', col24: '12,345', col25: '12,345', col26: 'Y', col27: '202210', col28: '202210' },
  ]);
});

</script>
