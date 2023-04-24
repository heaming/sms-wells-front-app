<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈','판매','계약관리', '대량 접수자료 업로드']"
      />
    </template>
    <!-- To.개발 kw-tab-panel안에 kw-search로 시작하는 경우 kw-tabs에 .form-border 제거 / 그 외 추가 -->
    <kw-tabs
      model-value="3"
    >
      <kw-tab
        name="1"
        label="접수-렌탈"
      />
      <kw-tab
        name="2"
        label="접수-일시불"
      />
      <kw-tab
        name="3"
        label="설치처"
      />
    </kw-tabs>
    <kw-tab-panels
      model-value="3"
    >
      <kw-tab-panel name="3">
        <kw-search :cols="4">
          <kw-search-row>
            <kw-search-item
              label="조회기간"
              required
              :colspan="2"
            >
              <kw-select
                class="w187"
                :model-value="[]"
                :options="['주소', 'B', 'C', 'D']"
                rules="required"
              />
              <kw-date-range-picker
                rules="date_range_required|date_range_months:1"
              />
            </kw-search-item>
            <kw-search-item label="등록자명">
              <kw-input />
            </kw-search-item>
            <kw-search-item label="등록자사번">
              <kw-input />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-search-item label="설치처 주소">
              <kw-input
                icon="search"
                clearable
              />
            </kw-search-item>
          </kw-search-row>
        </kw-search>
        <div class="result-area">
          <h3>결과조회</h3>
          <kw-action-top>
            <template #left>
              <kw-paging-info :total-count="50" />
            </template>
            <kw-btn
              icon="upload_on"
              dense
              secondary
              label="대량 접수자료 업로드"
            />
          </kw-action-top>

          <kw-grid
            :visible-rows="1"
            @init="initGrid"
          />
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
  ];

  const columns = [
    { fieldName: 'col1', header: '등록파일', width: '133', styleName: 'text-center' },
    { fieldName: 'col2', header: '등록일', width: '146', styleName: 'text-center' },
    { fieldName: 'col3', header: '등록자', width: '146', styleName: 'text-center' },
    { fieldName: 'col4', header: '등록자사번', width: '134', styleName: 'text-center' },
    { fieldName: 'col5', header: '구분(1:일시불, 2:렌탈, 6:정기배송', width: '267', styleName: 'text-center' },
    { fieldName: 'col6', header: '고객년도', width: '125', styleName: 'text-center' },
    { fieldName: 'col7', header: '고객코드', width: '125', styleName: 'text-center' },
    { fieldName: 'col8', header: '일련번호(렌탈/일시불:0)', width: '204', styleName: 'text-center' },
    { fieldName: 'col9', header: '고객명', width: '125', styleName: 'text-center' },
    { fieldName: 'col10', header: '설치일', width: '125', styleName: 'text-center' },
    { fieldName: 'col11', header: '우편번호', width: '128', styleName: 'text-center' },
    { fieldName: 'col12', header: '설치처 주소', width: '263', styleName: 'text-left' },
    { fieldName: 'col13', header: '휴대전화번호', width: '128', styleName: 'text-center' },
    { fieldName: 'col14', header: '전화번호', width: '128', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '다운로드', col2: '2022-10-10', col3: '김교원', col4: '1602591', col5: '1', col6: '2022', col7: '1234567', col8: '1', col9: '김고객', col10: '2022-10-10', col11: '123-12', col12: '서울시 종로구 을지로 100길 10', col13: '010-0000-0000', col14: '02-000-0000' },
  ]);
}

</script>
