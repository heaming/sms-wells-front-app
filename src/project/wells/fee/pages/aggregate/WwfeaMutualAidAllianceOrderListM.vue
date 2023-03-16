<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaMutualAidAllianceOrderListM - 상조제휴주문 조회
3. 작성자 : gs.ritvik.m
4. 작성일 : 2023.03.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상조제휴주문 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_DV')"
          required
        >
          <kw-option-group
            type="radio"
            :options="[{ codeId: 0, codeName: $t('MSG_TXT_RCP') },
                       { codeId: 1, codeName: $t('MSG_TXT_CNTRCT') }, { codeId: 2, codeName: $t('MSG_TXT_CANCEL') }]"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item label="$t('MSG_TXT_ALNC_DV')">
          <kw-option-group
            type="radio"
            :options="[$t('MSG_TXT_ALL'), $t('MSG_TXT_ALNC'), $t('MSG_TXT_UNF')]"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_RSB_TP')"
          required
        >
          <kw-option-group
            type="radio"
            :options="[$t('MSG_TXT_ALL'), $t('MSG_TXT_PLAR'), $t('MSG_TXT_BRMGR')]"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
          :colspan="2"
        >
          <kw-select
            :options="[$t('MSG_TXT_MANAGEMENT_DEPARTMENT'), 'B', 'C', 'D']"
          />
          <kw-select
            :options="[$t('MSG_TXT_RGNL_GRP'), 'B', 'C', 'D']"
          />
          <kw-select
            :options="[$t('MSG_TXT_BRANCH'), 'B', 'C', 'D']"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            icon="search"
            clearable
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="123456"
          />
          <span class="ml8">(단위:원)</span>
        </template>

        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="(totalCount === 0)"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="3"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, defineGrid, useMeta, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { getConfig } = useMeta();
const { t } = useI18n();
const { currentRoute } = useRouter();


// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

let totalCount = ref(0);

let cachedParams;

let searchParams;

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  // const response = await dataService.get('', { params: cachedParams });
  const response = { data: [
    { col1: '비제휴', col2: '2022-5559710', col3: '2022-5559710', col4: '김고객', col5: 'Q831234', col6: '1234567', col7: '김교원', col8: '플래너', col9: '1234567', col10: '2022-10-12', col11: '-', col12: '-', col13: '-', col14: '-', col15: '-' },
    { col1: '비제휴', col2: '2022-5559710', col3: '2022-5559710', col4: '김고객', col5: 'Q831234', col6: '1234567', col7: '김교원', col8: '플래너', col9: '1234567', col10: '2022-10-12', col11: '-', col12: '-', col13: '-', col14: '-', col15: '-' },
    { col1: '비제휴', col2: '2022-5559710', col3: '2022-5559710', col4: '김고객', col5: 'Q831234', col6: '1234567', col7: '김교원', col8: '플래너', col9: '1234567', col10: '2022-10-12', col11: '-', col12: '-', col13: '-', col14: '-', col15: '-' },
  ] };
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(response.data);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const res = { data: [] };
  // const res = await dataService.get('', { params: cachedParams });
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
    { fieldName: 'col15' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_ALNC_DV'), width: '91', styleName: 'text-center' },
    { fieldName: 'col2', header: `Wells ${t('MSG_TXT_CNTR_NO')}`, width: '138', styleName: 'text-center' },
    { fieldName: 'col3', header: `${t('MSG_TXT_MUTU')} ${t('MSG_TXT_CNTR_NO')}`, width: '138', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_CST_NM'), width: '111', styleName: 'text-left ' },
    { fieldName: 'col5', header: t('MSG_TXT_BLG'), width: '104', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '111', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_EMPL_NM'), width: '111', styleName: 'text-left' },
    { fieldName: 'col8', header: t('MSG_TXT_RSB'), width: '111', styleName: 'text-left' },
    { fieldName: 'col9', header: t('MSG_TXT_BRMGR'), width: '111', styleName: 'text-center ' },
    { fieldName: 'col10', header: t('MSG_TXT_RECPETN_DT'), width: '111', styleName: 'text-center ' },
    { fieldName: 'col11', header: t('MSG_TXT_CNTRCT_DT'), width: '111', styleName: 'text-center ' },
    { fieldName: 'col12', header: t('MSG_TXT_DEP_DT'), width: '111', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_WTH_DT'), width: '111', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_CAN_D'), width: '111', styleName: 'text-center' },
    { fieldName: 'col15', header: t('MSG_TXT_FEE_MN'), width: '111', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
