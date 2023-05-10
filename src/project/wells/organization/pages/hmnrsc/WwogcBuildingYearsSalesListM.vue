<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcBuildingYearsSalesListM - 사업장 단위별 년간영업 현황
3. 작성자 : gs.rahul.n
4. 작성일 : 2023-05-08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 사업장 단위별 년간영업 현황
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search :cols="2">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_Y')"
          required
        >
          <kw-date-picker
            type="month"
            rules="required"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_PERF_BASE')"
          required
        >
          <kw-option-group
            :model-value="'접수'"
            type="radio"
            :options="['접수', '설치']"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_OG_TP')"
          required
        >
          <kw-select
            :model-value="['']"
            :options="['M추진단', 'B', 'C', 'D']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
          required
        >
          <kw-select
            :model-value="[]"
            :options="['총괄단', 'B', 'C', 'D']"
            rules="required"
          />
          <kw-select
            :model-value="[]"
            :options="['지역단', 'B', 'C', 'D']"
          />
          <kw-select
            :model-value="[]"
            :options="['지점', 'B', 'C', 'D']"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BUILDING')"
          required
        >
          <kw-select
            :model-value="['']"
            :options="['마포/에스디타워', 'B', 'C', 'D']"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        :visible-rows="10"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useMeta } from 'kw-lib';

const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);
const grdMainRef = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

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
    { fieldName: 'col16' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_BLG'), width: '92', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_BUILDING'), width: '202', styleName: 'text-center' },
    { fieldName: 'col3', header: `${t('MSG_TXT_DIV')}1`, width: '106', styleName: 'text-center' },
    { fieldName: 'col4', header: `${t('MSG_TXT_DIV')}2`, width: '148', styleName: 'text-center' },
    { fieldName: 'col5', header: `1${t('MSG_TXT_MON')}`, width: '80', styleName: 'text-center' },
    { fieldName: 'col6', header: `2${t('MSG_TXT_MON')}`, width: '80', styleName: 'text-center' },
    { fieldName: 'col7', header: `3${t('MSG_TXT_MON')}`, width: '80', styleName: 'text-center' },
    { fieldName: 'col8', header: `4${t('MSG_TXT_MON')}`, width: '80', styleName: 'text-center' },
    { fieldName: 'col9', header: `5${t('MSG_TXT_MON')}`, width: '80', styleName: 'text-center' },
    { fieldName: 'col10', header: `6${t('MSG_TXT_MON')}`, width: '80', styleName: 'text-center' },
    { fieldName: 'col11', header: `7${t('MSG_TXT_MON')}`, width: '80', styleName: 'text-center' },
    { fieldName: 'col12', header: `8${t('MSG_TXT_MON')}`, width: '80', styleName: 'text-center' },
    { fieldName: 'col13', header: `9${t('MSG_TXT_MON')}`, width: '80', styleName: 'text-center' },
    { fieldName: 'col14', header: `10${t('MSG_TXT_MON')}`, width: '80', styleName: 'text-center' },
    { fieldName: 'col15', header: `11${t('MSG_TXT_MON')}`, width: '80', styleName: 'text-center' },
    { fieldName: 'col16', header: `12${t('MSG_TXT_MON')}`, width: '80', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '-', col2: '-', col3: '-', col4: '-', col5: '-', col6: '-', col7: '-', col8: '-', col9: '-', col10: '-', col11: '-', col12: '-', col13: '-', col14: '-', col15: '-', col16: '-' },
    { col1: '-', col2: '-', col3: '-', col4: '-', col5: '-', col6: '-', col7: '-', col8: '-', col9: '-', col10: '-', col11: '-', col12: '-', col13: '-', col14: '-', col15: '-', col16: '-' },
    { col1: '-', col2: '-', col3: '-', col4: '-', col5: '-', col6: '-', col7: '-', col8: '-', col9: '-', col10: '-', col11: '-', col12: '-', col13: '-', col14: '-', col15: '-', col16: '-' },
    { col1: '-', col2: '-', col3: '-', col4: '-', col5: '-', col6: '-', col7: '-', col8: '-', col9: '-', col10: '-', col11: '-', col12: '-', col13: '-', col14: '-', col15: '-', col16: '-' },
    { col1: '-', col2: '-', col3: '-', col4: '-', col5: '-', col6: '-', col7: '-', col8: '-', col9: '-', col10: '-', col11: '-', col12: '-', col13: '-', col14: '-', col15: '-', col16: '-' },

  ]);
});

</script>
