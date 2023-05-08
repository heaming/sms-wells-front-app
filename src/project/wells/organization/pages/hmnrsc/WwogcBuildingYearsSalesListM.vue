<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈','nav','nav','사업장 단위별 년간영업 현황']"
      />
    </template>
    <kw-search :cols="2">
      <kw-search-row>
        <kw-search-item
          label="실적년도"
          required
        >
          <kw-date-picker
            type="month"
            rules="required"
          />
        </kw-search-item>

        <kw-search-item
          label="실적기준"
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
          label="조직유형"
          required
        >
          <kw-select
            :model-value="['']"
            :options="['M추진단', 'B', 'C', 'D']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          label="조직레벨"
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
          label="빌딩"
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
          <kw-paging-info :total-count="7" />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          label="엑셀 다운로드"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        :visible-rows="10"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>
<script setup>

function initGrid(data, view) {
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
    { fieldName: 'col1', header: '소속', width: '92', styleName: 'text-center' },
    { fieldName: 'col2', header: '빌딩', width: '202', styleName: 'text-center' },
    { fieldName: 'col3', header: '구분1', width: '106', styleName: 'text-center' },
    { fieldName: 'col4', header: '구분2', width: '148', styleName: 'text-center' },
    { fieldName: 'col5', header: '1월', width: '80', styleName: 'text-center' },
    { fieldName: 'col6', header: '2월', width: '80', styleName: 'text-center' },
    { fieldName: 'col7', header: '3월', width: '80', styleName: 'text-center' },
    { fieldName: 'col8', header: '4월', width: '80', styleName: 'text-center' },
    { fieldName: 'col9', header: '5월', width: '80', styleName: 'text-center' },
    { fieldName: 'col10', header: '6월', width: '80', styleName: 'text-center' },
    { fieldName: 'col11', header: '7월', width: '80', styleName: 'text-center' },
    { fieldName: 'col12', header: '8월', width: '80', styleName: 'text-center' },
    { fieldName: 'col13', header: '9월', width: '80', styleName: 'text-center' },
    { fieldName: 'col14', header: '10월', width: '80', styleName: 'text-center' },
    { fieldName: 'col15', header: '11월', width: '80', styleName: 'text-center' },
    { fieldName: 'col16', header: '12월', width: '80', styleName: 'text-center' },
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
}

</script>
