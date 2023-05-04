<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈', 'nav', '엔지니어 등급 관리']" />
    </template>

    <kw-search>
      <kw-search-row>
        <kw-search-item label="관리구분">
          <kw-select
            :model-value="[]"
            :options="['엔지니어', 'B', 'C', 'D']"
          />
        </kw-search-item>
        <kw-search-item label="조직레벨">
          <kw-select
            :model-value="[]"
            :options="['전체', 'B', 'C', 'D']"
          />
          <kw-select
            :model-value="[]"
            :options="['전체', 'B', 'C', 'D']"
          />
        </kw-search-item>
        <kw-search-item label="직무">
          <kw-select
            :model-value="[]"
            :options="['전체', 'B', 'C', 'D']"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item label="미등록">
          <kw-field :model-value="[]">
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
        <kw-btn
          grid-action
          label="저장"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="download_on"
          secondary
          dense
          label="엑셀다운로드"
        />
        <kw-btn
          icon="upload_on"
          secondary
          dense
          label="엑셀업로드  "
        />
      </kw-action-top>
      <kw-grid
        :visible-rows="10"
        @init="initGrid"
      />
      <kw-pagination
        :model-value="1"
        :total-count="100"
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

  ];

  const columns = [
    { fieldName: 'col1', header: '소속', width: '152', styleName: 'text-center' },
    { fieldName: 'col2', header: '사번', width: '110', styleName: 'text-center' },
    { fieldName: 'col3', header: '성명', width: '166', styleName: 'text-center' },
    { fieldName: 'col4', header: '직책', width: '106', styleName: 'text-center' },
    { fieldName: 'col5', header: '직무', width: '106', styleName: 'text-center' },
    { fieldName: 'col6', header: '입사일자', width: '130', styleName: 'text-center' },
    { fieldName: 'col7', header: '등급', width: '166', styleName: 'text-left' },
    { fieldName: 'col8', header: '적용시작일자', width: '178', styleName: 'text-center ' },
    { fieldName: 'col9', header: '적용종료일자', width: '178', styleName: 'text-center ' },
    { fieldName: 'col10', header: '비고', width: '499.7', styleName: 'text-center' },

  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '경남서비스센터', col2: '0000000', col3: '홍길동(0000000)', col4: '센터소장', col5: '정규직', col6: '2008-09-13', col7: '정규직', col8: '2022-09-13', col9: '2022-09-13', col10: '-' },
    { col1: '경남서비스센터', col2: '0000000', col3: '유인열(0000000)', col4: '센터소장', col5: '정규직', col6: '2008-09-13', col7: '정규직', col8: '2022-09-24', col9: '2022-09-24', col10: '-' },
    { col1: '경남서비스센터', col2: '0000000', col3: '강성환(0000000)', col4: '센터소장', col5: '정규직', col6: '2008-09-13', col7: '정규직', col8: '2022-09-15', col9: '2022-09-15', col10: '-' },
    { col1: '경남서비스센터', col2: '0000000', col3: '김창민(0000000)', col4: '센터소장', col5: '정규직', col6: '2008-09-13', col7: '정규직', col8: '2022-09-13', col9: '2022-09-13', col10: '-' },
    { col1: '경남서비스센터', col2: '0000000', col3: '박준찬(0000000)', col4: '센터소장', col5: '정규직', col6: '2008-09-13', col7: '정규직', col8: '2022-09-24', col9: '2022-09-24', col10: '-' },
    { col1: '경남서비스센터', col2: '0000000', col3: '김종수(0000000)', col4: '-', col5: '정규직', col6: '2008-09-13', col7: '-', col8: '2022-09-15', col9: '2022-09-15', col10: '-' },
    { col1: '경남서비스센터', col2: '0000000', col3: '유인열(0000000)', col4: '센터소장', col5: '정규직', col6: '2008-09-13', col7: '정규직', col8: '2022-09-13', col9: '2022-09-13', col10: '-' },
    { col1: '경남서비스센터', col2: '0000000', col3: '강성환(0000000)', col4: '센터소장', col5: '정규직', col6: '2008-09-13', col7: '정규직', col8: '2022-09-24', col9: '2022-09-24', col10: '-' },
    { col1: '경남서비스센터', col2: '0000000', col3: '김창민(0000000)', col4: '센터소장', col5: '정규직', col6: '2008-09-13', col7: '정규직', col8: '2022-09-15', col9: '2022-09-15', col10: '-' },
    { col1: '경남서비스센터', col2: '0000000', col3: '박준찬(0000000)', col4: '센터소장', col5: '정규직', col6: '2008-09-13', col7: '정규직', col8: '2022-09-13', col9: '2022-09-13', col10: '-' },

  ]);
}
</script>
