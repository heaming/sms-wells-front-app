<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈', 'nav', '산재보험관리']" />
    </template>
    <kw-search>
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
          label="사업자 구분"
          required
        >
          <kw-option-group
            :model-value="'전체'"
            type="radio"
            :options="['전체', '재직', '해약']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          label="번호"
        >
          <kw-input
            icon="search"
            clearable
          />
          <kw-input />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="7"
          />
          <span class="ml8">(단위:원)</span>
        </template>
        <kw-btn
          grid-action
          label="삭제"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="download_on"
          dense
          secondry
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
          label="확정"
        />
        <kw-btn
          dense
          secondary
          label="산재 업로드"
        />
      </kw-action-top>
      <kw-grid
        :visible-rows="3"
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

  ];

  const columns = [
    { fieldName: 'col1', header: '지역단', width: '136', styleName: 'text-center' },
    { fieldName: 'col2', header: '소속', width: '110', styleName: 'text-center' },
    { fieldName: 'col3', header: '성명', width: '88', styleName: 'text-center' },
    { fieldName: 'col4', header: '번호', width: '110', styleName: 'text-center' },
    { fieldName: 'col5', header: '직급', width: '78', styleName: 'text-center' },
    { fieldName: 'col6', header: '스타트업', width: '106', styleName: 'text-center' },
    { fieldName: 'col7', header: '해약일자', width: '130', styleName: 'text-center' },
    { fieldName: 'col8', header: '공제금액', width: '138', styleName: 'text-right' },
    { fieldName: 'col9', header: '산재보험료 공제 가지급금 합', width: '174', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows([
    {
      col1: '은평/대일5층', col2: 'A000000', col3: '김교원', col4: '0000000', col5: '15', col6: '2022-10', col7: '2022-10-31', col8: '7,373', col9: '7,373',
    },
    {
      col1: '은평/대일5층', col2: 'A000000', col3: '김교원', col4: '0000000', col5: '15', col6: '2022-10', col7: '2022-10-31', col8: '7,373', col9: '7,373',
    },
    {
      col1: '은평/대일5층', col2: 'A000000', col3: '김교원', col4: '0000000', col5: '15', col6: '2022-10', col7: '2022-10-31', col8: '7,373', col9: '7,373',
    },

  ]);
}

</script>

<style scoped>
</style>
