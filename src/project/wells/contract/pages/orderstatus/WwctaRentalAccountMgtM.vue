<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈', '판매', '계약관리', '렌탈 계정 관리 현황']" />
    </template>

    <kw-search>
      <kw-search-row>
        <kw-search-item label="조회구분">
          <kw-option-group
            type="radio"
            :options="['상품별', '관리조직별']"
            model-value="상품별"
          />
        </kw-search-item>

        <kw-search-item
          label="설치년월"
          required
        >
          <kw-date-range-picker
            rules="date_range_required|date_range_months:1"
            type="month"
          />
        </kw-search-item>
        <kw-search-item label="상품군">
          <kw-select
            :model-value="[]"
            :options="['BO등록일', '입찰예정일']"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item label="상품코드">
          <kw-input />
        </kw-search-item>
        <kw-search-item label="고객구분">
          <kw-select
            :model-value="[]"
            :options="['BO등록일', '입찰예정일']"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <span>총</span>
          <span class="accent pl4">900건</span>
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
        :visible-rows="2"
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
  ];

  const columns = [
    { fieldName: 'col1', header: '상품군', width: '178' },
    { fieldName: 'col2', header: '상품명', width: '295' },
    { fieldName: 'col3', header: '상품코드', width: '125', styleName: 'text-center' },
    { fieldName: 'col4', header: '설치년월', width: '125', styleName: 'text-center' },
    { fieldName: 'col5', header: '재약정여부', width: '125', styleName: 'text-center' },
    { fieldName: 'col6', header: '기압건수', width: '139', styleName: 'text-right' },
    { fieldName: 'col7', header: '기변', width: '139', styleName: 'text-right' },
    { fieldName: 'col8', header: '재렌탈', width: '139', styleName: 'text-right' },
    { fieldName: 'col9', header: '멤버십', width: '139', styleName: 'text-right' },
    { fieldName: 'col10', header: '렌탈유지', width: '139', styleName: 'text-right' },
    { fieldName: 'col11', header: '이탈(만료→자가)', width: '171', styleName: 'text-right' },
    { fieldName: 'col12', header: '이탈(철거→후속계약X)', width: '194', styleName: 'text-right' },
    { fieldName: 'col13', header: '이탈율', width: '139', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '공기청정기', col2: '공기청정기AK316ESA', col3: '4375', col4: '2022-10', col5: 'N', col6: '1', col7: '0', col8: '0', col9: '0', col10: '0', col11: '0', col12: '0', col13: '0' },
    { col1: '비데', col2: '비데(BM750RWA)', col3: '4416', col4: '2022-10', col5: 'N', col6: '6', col7: '0', col8: '0', col9: '0', col10: '0', col11: '0', col12: '0', col13: '0' },
  ]);
}

</script>

<style scoped>
</style>
