<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈', '판매관리', '리스크관리','비정도영업조치사항관리']"
      />
    </template>

    <kw-tabs model-value="2">
      <kw-tab
        name="1"
        label="비정도영업조치사항관리"
      />
      <kw-tab
        name="2"
        label="비정도영업조치사항조회"
      />
    </kw-tabs>
    <kw-tab-panels model-value="2">
      <kw-tab-panel name="2">
        <kw-search>
          <kw-search-row>
            <kw-search-item
              :colspan="2"
              label="적용기간"
            >
              <kw-select
                :model-value="['']"
                :options="['등록일자', 'B', 'C', 'D']"
              />
              <kw-date-range-picker
                rules="date_range_months:1"
              />
            </kw-search-item>

            <kw-search-item
              label="총괄단"
            >
              <kw-select
                :model-value="['']"
                :options="['예정일자', 'B', 'C', 'D']"
              />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-search-item
              label="지역단"
            >
              <kw-input />
            </kw-search-item>

            <kw-search-item
              label="지점"
            >
              <kw-input />
            </kw-search-item>
            <kw-search-item
              label="사원검색"
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
              <span>총</span>
              <span class="accent pl4">7건</span>
            </template>
            <kw-btn
              icon="download_on"
              dense
              secondary
              label="엑셀다운로드"
            />
          </kw-action-top>
          <kw-grid
            :visible-rows="10"
            @init="initGrid"
          />

          <kw-action-bottom>
            <kw-btn
              label="삭제"
              grid-action
            />
          </kw-action-bottom>
        </div>
      </kw-tab-panel>
    </kw-tab-panels>
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
    { fieldName: 'col17' },
  ];

  const columns = [
    { fieldName: 'col1', header: '구분', width: '129', styleName: 'text-left' },
    { fieldName: 'col2', header: '소속명', width: '129', styleName: 'text-left' },
    { fieldName: 'col3', header: '소속코드', width: '129', styleName: 'text-left' },
    { fieldName: 'col4', header: '성명', width: '129', styleName: 'text-left' },
    { fieldName: 'col5', header: '사번', width: '129', styleName: 'text-left' },
    { fieldName: 'col6', header: '성명', width: '129', styleName: 'text-left' },
    { fieldName: 'col7', header: '사번', width: '129' },
    { fieldName: 'col8', header: '직급', width: '129', styleName: 'text-left' },
    { fieldName: 'col9', header: '발생년월', width: '129', styleName: 'text-left' },
    { fieldName: 'col10', header: '조치부서', width: '306', styleName: 'text-center' },
    { fieldName: 'col11', header: '부과내역', width: '306', styleName: 'text-left' },
    { fieldName: 'col12', header: '조치항목', width: '306', styleName: 'text-left' },
    { fieldName: 'col13', header: '부과대상건수', width: '129', styleName: 'text-left' },
    { fieldName: 'col14', header: '조치결과 부과점수', width: '190', styleName: 'text-center' },
    { fieldName: 'col15', header: '합계점수 ', width: '129', styleName: 'text-center' },
    { fieldName: 'col16', header: '등록자', width: '146', styleName: 'text-center' },
    { fieldName: 'col17', header: '등록일자', width: '165', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'col1', 'col2', 'col3', 'col4', 'col5',
    {
      header: '행위자사번', // colspan title
      direction: 'horizontal', // merge type
      items: ['col6', 'col7', 'col8'],
    },
    {
      header: '벌점', // colspan title
      direction: 'horizontal', // merge type
      items: ['col9', 'col10', 'col11', 'col12', 'col13', 'col14', 'col15'],
    },
    'col16', 'col17',
  ]);

  data.setRows([
    { col1: '김총괄', col2: '김지역', col3: '김BM', col4: '김지점', col5: '123456', col6: '김교원', col7: '123456', col8: '김교원', col9: '2022-05', col10: '71401-Wells 경영지원팀', col11: '부과내역', col12: '부과내역', col13: '1', col14: '5', col15: '50', col16: '김직원', col17: '2022-05' },
    { col1: '김총괄', col2: '김지역', col3: '김BM', col4: '김지점', col5: '123456', col6: '김교원', col7: '123456', col8: '김교원', col9: '2022-05', col10: '71401-Wells 경영지원팀', col11: '부과내역', col12: '부과내역', col13: '1', col14: '5', col15: '50', col16: '김직원', col17: '2022-05' },
    { col1: '김총괄', col2: '김지역', col3: '김BM', col4: '김지점', col5: '123456', col6: '김교원', col7: '123456', col8: '김교원', col9: '2022-05', col10: '71401-Wells 경영지원팀', col11: '부과내역', col12: '부과내역', col13: '1', col14: '5', col15: '50', col16: '김직원', col17: '2022-05' },
    { col1: '김총괄', col2: '김지역', col3: '김BM', col4: '김지점', col5: '123456', col6: '김교원', col7: '123456', col8: '김교원', col9: '2022-05', col10: '71401-Wells 경영지원팀', col11: '부과내역', col12: '부과내역', col13: '1', col14: '5', col15: '50', col16: '김직원', col17: '2022-05' },
    { col1: '김총괄', col2: '김지역', col3: '김BM', col4: '김지점', col5: '123456', col6: '김교원', col7: '123456', col8: '김교원', col9: '2022-05', col10: '71401-Wells 경영지원팀', col11: '부과내역', col12: '부과내역', col13: '1', col14: '5', col15: '50', col16: '김직원', col17: '2022-05' },
    { col1: '김총괄', col2: '김지역', col3: '김BM', col4: '김지점', col5: '123456', col6: '김교원', col7: '123456', col8: '김교원', col9: '2022-05', col10: '71401-Wells 경영지원팀', col11: '부과내역', col12: '부과내역', col13: '1', col14: '5', col15: '50', col16: '김직원', col17: '2022-05' },
    { col1: '김총괄', col2: '김지역', col3: '김BM', col4: '김지점', col5: '123456', col6: '김교원', col7: '123456', col8: '김교원', col9: '2022-05', col10: '71401-Wells 경영지원팀', col11: '부과내역', col12: '부과내역', col13: '1', col14: '5', col15: '50', col16: '김직원', col17: '2022-05' },
    { col1: '김총괄', col2: '김지역', col3: '김BM', col4: '김지점', col5: '123456', col6: '김교원', col7: '123456', col8: '김교원', col9: '2022-05', col10: '71401-Wells 경영지원팀', col11: '부과내역', col12: '부과내역', col13: '1', col14: '5', col15: '50', col16: '김직원', col17: '2022-05' },
    { col1: '김총괄', col2: '김지역', col3: '김BM', col4: '김지점', col5: '123456', col6: '김교원', col7: '123456', col8: '김교원', col9: '2022-05', col10: '71401-Wells 경영지원팀', col11: '부과내역', col12: '부과내역', col13: '1', col14: '5', col15: '50', col16: '김직원', col17: '2022-05' },

  ]);
}
</script>
<style scoped>
</style>
