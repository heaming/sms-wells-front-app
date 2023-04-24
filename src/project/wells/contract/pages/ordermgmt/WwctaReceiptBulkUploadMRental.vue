<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈', '판매', '계약관리', '대량 접수자료 업로드']"
      />
    </template>
    <!-- To.개발 kw-tab-panel안에 kw-search로 시작하는 경우 kw-tabs에 .form-border 제거 / 그 외 추가 -->
    <kw-tabs model-value="1">
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
    <kw-tab-panels model-value="1">
      <kw-tab-panel name="1">
        <kw-search :cols="4">
          <kw-search-row>
            <kw-search-item
              label="조회기간"
              required
              :colspan="2"
            >
              <kw-select
                :model-value="[]"
                :options="['등록일', 'B', 'C', 'D']"
                rules="required"
                class="w187"
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
            <kw-search-item
              label="상품군"
              :colspan="2"
            >
              <kw-select
                :model-value="[]"
                :options="['대분류 전체', 'B', 'C', 'D']"
              />
              <kw-select
                :model-value="[]"
                :options="['중분류 전체', 'B', 'C', 'D']"
              />
            </kw-search-item>
            <kw-search-item label="상품코드">
              <kw-input />
            </kw-search-item>
            <kw-search-item label="상품명">
              <kw-input />
            </kw-search-item>
          </kw-search-row>
        </kw-search>
        <div class="result-area">
          <kw-action-top>
            <template #left>
              <kw-paging-info
                :total-count="50"
              />
              <span class="ml8">(단위:원)</span>
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
    { fieldName: 'col15' },
    { fieldName: 'col16' },
    { fieldName: 'col17' },
    { fieldName: 'col18' },
    { fieldName: 'col19' },
    { fieldName: 'col20' },

  ];

  const columns = [
    { fieldName: 'col1', header: '등록파일', width: '133', styleName: 'text-center' },
    { fieldName: 'col2', header: '등록일', width: '146', styleName: 'text-center' },
    { fieldName: 'col3', header: '등록자', width: '146', styleName: 'text-center' },
    { fieldName: 'col4', header: '등록자사번', width: '146', styleName: 'text-center' },
    { fieldName: 'col5', header: '상품코드', width: '128', styleName: 'text-center' },
    { fieldName: 'col6', header: '상품명', width: '290', styleName: 'text-left' },

    { fieldName: 'col7', header: '접수일', width: '128', styleName: 'text-center' },
    { fieldName: 'col8', header: '계약자명', width: '128', styleName: 'text-center' },
    { fieldName: 'col9', header: '등록비', width: '128', styleName: 'text-right' },
    { fieldName: 'col10', header: '변동개월', width: '128', styleName: 'text-center' },
    { fieldName: 'col11', header: '약정구분', width: '128', styleName: 'text-center' },
    { fieldName: 'col12', header: '생년월일', width: '128', styleName: 'text-center' },
    { fieldName: 'col13', header: '성별(1:남, 2:여)', width: '128', styleName: 'text-center' },
    { fieldName: 'col14', header: '휴대전화번호', width: '128', styleName: 'text-center' },

    { fieldName: 'col15', header: '우편번호', width: '128', styleName: 'text-center' },
    { fieldName: 'col16', header: '주소', width: '275', styleName: 'text-left' },
    { fieldName: 'col17', header: '사은품1', width: '128', styleName: 'text-center' },
    { fieldName: 'col18', header: '사은품2', width: '128', styleName: 'text-center' },
    { fieldName: 'col19', header: '사은품3', width: '128', styleName: 'text-center' },
    { fieldName: 'col20', header: '구독주문번호', width: '128', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '다운로드', col2: '2022-10-10', col3: '김교원', col4: '1602591', col5: '1234', col6: '정수기 (10월 프로모션)', col7: '2022-10-10', col8: '김고객', col9: '100,000', col10: '60', col11: '3', col12: '1990-01-01', col13: '1', col14: '010-0000-0000', col15: '123-12', col16: '서울시 종로구 을지로 100길 10', col17: '커피캡슐', col18: '-', col19: '-', col20: '12345678' },

  ]);
}

</script>
