<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈','판매관리','계약관리','고객필터정보관리']"
      />
    </template>

    <kw-search :cols="4">
      <kw-search-row>
        <kw-search-item label="조회 조건 구분">
          <kw-select
            :model-value="['']"
            :options="['매니저','B','C']"
          />
        </kw-search-item>
        <kw-search-item
          label="필터등록년월"
          required
        >
          <kw-date-picker
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          label="용도구분"
          required
        >
          <kw-select
            :model-value="['']"
            :options="['전체','B','C']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          label="상품코드"
          required
        >
          <kw-input
            icon="search"
            clearable
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <h3>조회결과</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="156"
          />
        </template>
        <span class="kw-fc--black3 text-weight-regular">(단위:원)</span>
      </kw-action-top>

      <kw-grid
        :visible-rows="4"
        @init="initGrid1"
      />
      <div class="grid-horizontal-wrap">
        <div class="grid-horizontal-wrap__section">
          <div>
            <h3>
              필터상품 고객정보
            </h3>
            <kw-action-top>
              <template #left>
                <kw-paging-info
                  :total-count="156"
                />
                <span class="ml8">(단위:원)</span>
              </template>
              <kw-btn
                dense
                secondary
                label="필터정보 초기화"
              />
              <kw-separator
                vertical
                inset
                spaced
              />
              <kw-btn
                label="필터등록"
                primary
                dense
              />
            </kw-action-top>

            <kw-grid
              :visible-rows="3"
              @init="initGrid"
            />
          </div>
        </div>

        <div class="grid-horizontal-wrap__section">
          <div>
            <h3>
              필터상품 고객정보
            </h3>
            <kw-action-top>
              <template #left>
                <kw-paging-info
                  :total-count="156"
                />
                <span class="ml8">(단위:원)</span>
              </template>
            </kw-action-top>
            <kw-grid
              :visible-rows="3"
              @init="initGrid3"
            />
          </div>
        </div>
      </div>
    </div>
  </kw-page>
</template>

<script setup>
function initGrid1(data, view) {
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
    { fieldName: 'col18' },
    { fieldName: 'col19' },
    { fieldName: 'col20' },
    { fieldName: 'col21' },
    { fieldName: 'col22' },
    { fieldName: 'col23' },
    { fieldName: 'col24' },
    { fieldName: 'col25' },
    { fieldName: 'col26' },
    { fieldName: 'col27' },
  ];

  const columns = [
    { fieldName: 'col1', header: '계약번호', width: '131', styleName: 'text-center' },
    { fieldName: 'col2', header: '고객명', width: '104', styleName: 'text-center' },
    { fieldName: 'col3', header: '휴대전화번호', width: '131', styleName: 'text-center' },
    { fieldName: 'col4', header: '1.필터상품', width: '104', styleName: 'text-center' },
    { fieldName: 'col5', header: '1.필터상품명', width: '197' },
    { fieldName: 'col6', header: '2.필터상품', width: '104', styleName: 'text-center' },
    { fieldName: 'col7', header: '2.필터상품명', width: '197' },
    { fieldName: 'col8', header: '3.필터상품', width: '104', styleName: 'text-center' },
    { fieldName: 'col9', header: '3.필터상품명', width: '197' },
    { fieldName: 'col10', header: '4.필터상품', width: '104' },
    { fieldName: 'col11', header: '4.필터상품명', width: '197' },
    { fieldName: 'col12', header: '5.필터상품', width: '104' },
    { fieldName: 'col13', header: '5.필터상품명', width: '197' },
    { fieldName: 'col14', header: '용도구분', width: '104', styleName: 'text-center' },
    { fieldName: 'col15', header: 'BS주기', width: '104', styleName: 'text-right' },
    { fieldName: 'col16', header: '판매유형', width: '104', styleName: 'text-center' },
    { fieldName: 'col17', header: '멤버십구분', width: '104', styleName: 'text-center' },
    { fieldName: 'col18', header: '매출일', width: '119', styleName: 'text-center' },
    { fieldName: 'col19', header: '컨택일', width: '119', styleName: 'text-center' },
    { fieldName: 'col20', header: '설치구분', width: '93' },
    { fieldName: 'col21', header: '필터금액', width: '93' },
    { fieldName: 'col22', header: '필터수량', width: '93' },
    { fieldName: 'col23', header: '컨택코드', width: '93' },
    { fieldName: 'col24', header: '재컨택유무', width: '118' },
    { fieldName: 'col25', header: '컨택담당', width: '93', styleName: 'text-center' },
    { fieldName: 'col26', header: '특약사항', width: '93' },
    { fieldName: 'col27', header: '참고사항', width: '93' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  data.setRows([
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
  ]);
}
function initGrid(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
  ];

  const columns = [
    { fieldName: 'col1', header: '계약번호', width: '131', styleName: 'text-center' },
    { fieldName: 'col2', header: '용도구분', width: '104', styleName: 'text-center' },
    { fieldName: 'col3', header: '필터상품', width: '104', styleName: 'text-center' },
    { fieldName: 'col4', header: '필터 명', width: '197' },
    { fieldName: 'col5', header: '수량', width: '104', styleName: 'text-right' },
    { fieldName: 'col6', header: '비용', width: '104', styleName: 'text-right' },
    { fieldName: 'col7', header: '금액', width: '104', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: 'W2022-123457', col2: '0', col3: '4972', col4: '8인치웰스카본', col5: '0', col6: '0', col7: '0' },
    { col1: 'W2022-123457', col2: '0', col3: '4972', col4: '8인치웰스카본', col5: '0', col6: '0', col7: '0' },
    { col1: 'W2022-123457', col2: '0', col3: '4972', col4: '8인치웰스카본', col5: '0', col6: '0', col7: '0' },
    { col1: 'W2022-123457', col2: '0', col3: '4972', col4: '8인치웰스카본', col5: '0', col6: '0', col7: '0' },
    { col1: 'W2022-123457', col2: '0', col3: '4972', col4: '8인치웰스카본', col5: '0', col6: '0', col7: '0' },
    { col1: 'W2022-123457', col2: '0', col3: '4972', col4: '8인치웰스카본', col5: '0', col6: '0', col7: '0' },
    { col1: 'W2022-123457', col2: '0', col3: '4972', col4: '8인치웰스카본', col5: '0', col6: '0', col7: '0' },
  ]);
}

function initGrid3(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
  ];

  const columns = [
    { fieldName: 'col1', header: '용도구분', width: '104', styleName: 'text-center' },
    { fieldName: 'col2', header: '상품코드', width: '104', styleName: 'text-center' },
    { fieldName: 'col3', header: '필터상품', width: '104', styleName: 'text-center' },
    { fieldName: 'col4', header: '필터 명', width: '197' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '0', col2: '4090', col3: '4972', col4: '8인치웰스카본' },
    { col1: '0', col2: '4090', col3: '4972', col4: '8인치웰스카본' },
    { col1: '0', col2: '4090', col3: '4972', col4: '8인치웰스카본' },
    { col1: '0', col2: '4090', col3: '4972', col4: '8인치웰스카본' },
    { col1: '0', col2: '4090', col3: '4972', col4: '8인치웰스카본' },
    { col1: '0', col2: '4090', col3: '4972', col4: '8인치웰스카본' },
  ]);
}

</script>

<style scoped>
</style>
