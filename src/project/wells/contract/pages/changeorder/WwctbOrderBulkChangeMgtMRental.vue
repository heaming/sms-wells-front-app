<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈', '판매', '계약관리','주문일괄변경 관리']"
      />
    </template>
    <!-- To.개발 kw-tab-panel안에 kw-search로 시작하는 경우 kw-tabs에 .form-border 제거 / 그 외 추가 -->
    <kw-tabs model-value="1">
      <kw-tab
        name="1"
        label="렌탈"
      />
      <kw-tab
        name="2"
        label="맴버십"
      />
      <kw-tab
        name="3"
        label="일시불"
      />
    </kw-tabs>
    <kw-tab-panels model-value="1">
      <kw-tab-panel name="1">
        <kw-search
          one-row
          :cols="2"
        >
          <kw-search-row>
            <kw-search-item
              label="처리구분"
              required
            >
              <kw-select
                :model-value="[]"
                :options="['조회', '입력']"
                rules="required"
              />
            </kw-search-item>

            <kw-search-item
              label="구분상세"
              required
            >
              <kw-select
                :model-value="['']"
                :options="['예정일자', 'B', 'C', 'D']"
                rules="required"
              />
            </kw-search-item>
          </kw-search-row>
        </kw-search>

        <div class="result-area">
          <kw-action-top>
            <kw-btn
              label="일괄등록"
              primary
              dense
            />
          </kw-action-top>
          <kw-grid
            :visible-rows="10"
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
  ];

  const columns = [
    { fieldName: 'col1', header: '계약번호', width: '176', styleName: 'text-center' },
    { fieldName: 'col2', header: '계약자명', width: '126', styleName: 'text-center' },
    { fieldName: 'col3', header: '예정일', width: '154', styleName: 'text-center' },
    { fieldName: 'col4', header: '비고', width: '658' },
    { fieldName: 'col5', header: '등록자', width: '139', styleName: 'text-center' },
    { fieldName: 'col6', header: '등록일', width: '122', styleName: 'text-center' },
    { fieldName: 'col7', header: '등록시간', width: '122', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  // view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2022-0000000', col2: '김교원', col3: '2022-10-31', col4: '-', col5: '김웰스', col6: '2022-08-01', col7: '08:11:22' },
  ]);
}

</script>
<style scoped>
</style>
