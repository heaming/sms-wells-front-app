<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈', 'nav', 'nav', '수석플래너 관리']" />
    </template>

    <kw-search :cols="4">
      <kw-search-row>
        <kw-search-item
          label="관리년월"
          required
        >
          <kw-date-picker
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          label="조직레벨"
          :colspan="2"
        >
          <kw-select
            :model-value="[]"
            :options="['전체', 'B', 'C', 'D']"
          />
          <kw-select
            :model-value="[]"
            :options="['전체', 'B', 'C', 'D']"
          />
          <kw-select
            :model-value="[]"
            :options="['전체', 'B', 'C', 'D']"
          />
        </kw-search-item>
        <kw-search-item label="번호">
          <kw-input
            clearable
            icon="search"
          />
          <kw-input />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-tabs
        model-value="1"
        class="mt30 mb26"
      >
        <kw-tab
          name="1"
          label="승급"
        />
        <kw-tab
          name="2"
          label="강등"
        />
      </kw-tabs>
      <kw-tab-panels model-value="1">
        <kw-tab-panel name="1">
          <kw-action-top>
            <template #left>
              <kw-paging-info
                :page-size="10"
                :page-size-options="[10, 20, 30, 40]"
                :total-count="7"
              />
            </template>
            <kw-btn
              icon="download_on"
              dense
              secondary
              label="엑셀다운로드"
            />
            <kw-separator
              vertical
              inset
              spaced
            />
            <kw-btn
              dense
              secondary
              label="수석업로드"
            />
            <kw-separator
              vertical
              inset
              spaced
            />
            <kw-btn
              dense
              primary
              label="수석확정"
            />
          </kw-action-top>

          <kw-grid
            ref="grdRef"
            :visible-rows="10"
            @init="initGrid"
          />
          <kw-pagination
            :model-value="1"
            :total-count="100"
          />
        </kw-tab-panel>
      </kw-tab-panels>
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
    { fieldName: 'col1', header: '총괄단', width: '92', styleName: 'text-center' },
    { fieldName: 'col2', header: '지역단', width: '106', styleName: 'text-center' },
    { fieldName: 'col3', header: '소속', width: '106', styleName: 'text-center' },
    { fieldName: 'col4', header: '빌딩명', width: '160', styleName: 'text-center' },
    { fieldName: 'col5', header: '번호', width: '110', styleName: 'text-center' },
    { fieldName: 'col6', header: '성명', width: '92', styleName: 'text-center' },
    { fieldName: 'col7', header: '직책', width: '92', styleName: 'text-center' },
    { fieldName: 'col8', header: '최초개시', width: '130', styleName: 'text-center' },
    { fieldName: 'col9', header: '최종해약', width: '130', styleName: 'text-center' },
    { fieldName: 'col10', header: '강등', width: '130', styleName: 'text-center' },
    { fieldName: 'col11', header: '해약', width: '130', styleName: 'text-center' },
    { fieldName: 'col12', header: '누적건수인정시작월', width: '180', styleName: 'text-center' },
    { fieldName: 'col13', header: '누적건수', width: '106', styleName: 'text-center' },
    { fieldName: 'col14', header: '당월인정건수', width: '136', styleName: 'text-center' },
    { fieldName: 'col15', header: '플래너스타트업', width: '152', styleName: 'text-center' },
    { fieldName: 'col16', header: 'WM해약여부', width: '152', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '경남', col2: '창원센터', col3: 'A000000', col4: '센트럴시티', col5: '0000000', col6: '홍길순', col7: '플래너', col8: '2019-09-25', col9: '2019-09-25', col10: '2019-09-25', col11: '2019-09-25', col12: '2019-09', col13: '000000', col14: '000000', col15: '2019-09-25', col16: 'Y' },

  ]);
  view.setColumnLayout([

    {
      header: '소속',
      direction: 'horizontal',
      items: ['col1', 'col2', 'col3', 'col4'],
    },
    'col5',
    'col6',
    'col7',
    {
      header: '수석플래너 현황',
      direction: 'horizontal',
      items: ['col8', 'col9', 'col10', 'col11'],
    },
    {
      header: '환경가전 실적',
      direction: 'horizontal',
      items: ['col12', 'col13', 'col14'],
    },
    {
      header: '교육현황',
      direction: 'horizontal',
      items: ['col15'],
    },
    'col16',
  ]);
}
</script>

<style scoped>
</style>
