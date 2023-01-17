<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈','판매관리','리스크관리', '비정도영업조치사항관리']"
      />
    </template>
    <kw-search>
      <kw-search-row>
        <kw-search-item
          label="적용기간"
          :colspan="2"
        >
          <kw-select
            :model-value="[]"
            :options="['등록일자', 'B', 'C', 'D']"
          />
          <kw-date-range-picker
            rules="date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item label="총괄단">
          <kw-select
            :model-value="[]"
            :options="['등록일자', 'B', 'C', 'D']"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item label="지역단">
          <kw-input />
        </kw-search-item>
        <kw-search-item label="지점">
          <kw-input />
        </kw-search-item>
        <kw-search-item label="사원검색">
          <kw-input icon="search_24" />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="7"
          />
        </template>
        <kw-btn
          grid-action
          label="수정"
        />
        <kw-btn
          grid-action
          label="삭제"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          dense
          secondary
          label="행추가"
        />
        <kw-btn
          dense
          secondary
          label="저장"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          label="엑셀다운로드"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        :visible-rows="10"
        @init="initGrid4"
      />
    </div>
  </kw-page>
</template>

<script setup>

function initGrid4(data, view) {
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
    { fieldName: 'col1', header: '행위자사번', width: '180', styleName: 'text-center' },
    { fieldName: 'col2', header: '발생년월', width: '165', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'col3', header: '발생년월', width: '129' },
    { fieldName: 'col4', header: '성명', width: '129' },
    { fieldName: 'col5', header: '직급', width: '129' },
    { fieldName: 'col6', header: '총괄단', width: '129' },
    { fieldName: 'col7', header: '지역단', width: '129' },
    { fieldName: 'col8', header: 'BM', width: '129' },
    { fieldName: 'col9', header: '지점', width: '129' },
    { fieldName: 'col10', header: '부과내역', width: '306' },
    { fieldName: 'col11', header: '조치항목', width: '306' },
    { fieldName: 'col12', header: '부과대상건수', width: '129' },
    { fieldName: 'col13', header: '조치결과 부과점수', width: '190', styleName: 'text-center' },
    { fieldName: 'col14', header: '조치부서', width: '306' },
    { fieldName: 'col15', header: '등록자', width: '146', styleName: 'text-center' },
    { fieldName: 'col16', header: '등록일자', width: '165', datetimeFormat: 'yyyy-MM' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    // single
    {
      header: '행위자사번', // colspan title
      direction: 'horizontal', // merge type
      items: ['col1', 'col2', 'col3', 'col4', 'col5'],
    },
    {
      header: '소속',
      direction: 'horizontal',
      items: ['col6', 'col7', 'col8', 'col9'],
    },
    {
      header: '벌점',
      direction: 'horizontal',
      items: ['col10', 'col11', 'col12', 'col13', 'col14'],
    },
    'col15', 'col16',

  ]);

  data.setRows([{ col1: '사번입력', col2: '2022-05', col3: '', col4: '', col5: '', col6: '', col7: '', col8: '', col9: '', col10: '', col11: '1-개인정보 도용에 의한 판매계약', col12: '', col13: '★★★', col14: '71401-Wells경영지원팀', col15: '', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },
    { col1: '123456', col2: '2022-05', col3: 'P123456', col4: '김교원', col5: '김교원', col6: '김총괄', col7: '김지역', col8: '김BM', col9: '김지점', col10: '부과내역', col11: '부과내역', col12: '1', col13: '★', col14: '71401-Wells 경영지원팀', col15: '김직원', col16: '2022-05' },

  ]);
}

</script>
