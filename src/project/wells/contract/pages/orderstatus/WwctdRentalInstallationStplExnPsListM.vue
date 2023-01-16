<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈','판매','계약관리','렌탈 약정 만료 및 멤버십 현황']"
      />
    </template>

    <kw-search :cols="3">
      <kw-search-row>
        <kw-search-item
          label="만료일"
        >
          <kw-date-range-picker
            rules="date_range_months:1"
          />
        </kw-search-item>

        <kw-search-item label="상품군">
          <kw-select
            :model-value="['']"
            :options="['대분류 전체','B','C']"
          />
          <span>/</span>
          <kw-select
            :options="['중분류 전체','B','C']"
          />
        </kw-search-item>

        <kw-search-item label="상품코드">
          <kw-input />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item label="상품명">
          <kw-input />
        </kw-search-item>
        <kw-search-item label="취소제외">
          <kw-field
            :model-value="[]"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                label=""
                val=""
              />
            </template>
          </kw-field>
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <span>총</span> <span class="accent pl4">156</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          label="엑셀 다운로드"
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
    { fieldName: 'col17' },

  ];

  const columns = [
    { fieldName: 'col1', header: '고객코드', width: '130', styleName: 'text-center' },
    { fieldName: 'col2', header: '고객명', width: '120', styleName: 'text-left' },
    { fieldName: 'col3', header: '상품코드', width: '100', styleName: 'text-center' },
    { fieldName: 'col4', header: '상품명', width: '160', styleName: 'text-left' },
    { fieldName: 'col5', header: '렌탈기간', width: '120', styleName: 'text-center' },
    { fieldName: 'col6', header: '의무사용기간', width: '120', styleName: 'text-center' },
    { fieldName: 'col7', header: '매출일자', width: '120', styleName: 'text-center' },
    { fieldName: 'col8', header: '의무사용일자', width: '120', styleName: 'text-center' },
    { fieldName: 'col9', header: '만료일자', width: '120', styleName: 'text-center' },
    { fieldName: 'col10', header: '취소일자', width: '120', styleName: 'text-center' },
    { fieldName: 'col11', header: '취소고객 의무사용만기여부', width: '200', styleName: 'text-center' },
    { fieldName: 'col12', header: '멤버십계약일자', width: '120', styleName: 'text-center' },
    { fieldName: 'col13', header: '멤버십가입일자', width: '120', styleName: 'text-center' },
    { fieldName: 'col14', header: '멤버십취소일자', width: '120', styleName: 'text-center' },
    { fieldName: 'col15', header: '멤버십탈퇴일자', width: '120', styleName: 'text-center' },
    { fieldName: 'col16', header: '계약자번호', width: '160', styleName: 'text-center' },
    { fieldName: 'col17', header: '설치자번호', width: '160', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '60', col6: '36', col7: '20, 170, 707', col8: '20, 170, 707', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '', col6: '', col7: '20, 170, 707', col8: '', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '', col6: '', col7: '20, 170, 707', col8: '', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '', col6: '', col7: '20, 170, 707', col8: '', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '', col6: '', col7: '20, 170, 707', col8: '', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '', col6: '', col7: '20, 170, 707', col8: '', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '', col6: '', col7: '20, 170, 707', col8: '', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '', col6: '', col7: '20, 170, 707', col8: '', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '', col6: '', col7: '20, 170, 707', col8: '', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
    { col1: '2017-5825112', col2: '김교원', col3: '4016', col4: '웰스(KW-P47F1)', col5: '', col6: '', col7: '20, 170, 707', col8: '', col9: '20, 170, 707', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '010-p-7764', col17: '010-p-7764' },
  ]);
}
</script>

<style scoped>
</style>
