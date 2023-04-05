<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈', '판매', '영업활동관리', '삼성전자 상품관리']" />
    </template>
    <!-- To.개발 kw-tab-panel안에 kw-search로 시작하는 경우 kw-tabs에 .form-border 제거 / 그 외 추가 -->
    <kw-tabs model-value="4">
      <kw-tab
        name="1"
        label="미설치"
      />
      <kw-tab
        name="2"
        label="배송"
      />
      <kw-tab
        name="3"
        label="확정일"
      />
      <kw-tab
        name="4"
        label="예약일"
      />
      <kw-tab
        name="5"
        label="무상A/S"
      />
    </kw-tabs>
    <kw-tab-panels model-value="4">
      <kw-tab-panel name="4">
        <kw-search
          one-row
          :cols="2"
        >
          <kw-search-row>
            <kw-search-item
              label="예약일"
              required
            >
              <kw-date-range-picker
                rules="date_range_required|date_range_months:1"
              />
            </kw-search-item>

            <kw-search-item label="주문유형">
              <kw-option-group
                :model-value="'전체'"
                type="radio"
                :options="['전체', '렌탈', '일시불']"
              />
            </kw-search-item>
          </kw-search-row>
        </kw-search>

        <div class="result-area">
          <kw-action-top>
            <template #left>
              <span>총</span>
              <span class="accent pl4">100건</span>
            </template>
            <kw-btn
              icon="download_on"
              dense
              secondary
              label="엑셀 다운로드"
              @click="onClickExcelDownload"
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
  ];

  const columns = [
    { fieldName: 'col1', header: '조직코드', width: '137', styleName: 'text-center' },
    { fieldName: 'col2', header: '지점장사번', width: '136', styleName: 'text-center' },
    { fieldName: 'col3', header: '파트너사번', width: '136', styleName: 'text-center' },
    { fieldName: 'col4', header: '파트너명', width: '136', styleName: 'text-center' },
    { fieldName: 'col5', header: '계약번호', width: '168', styleName: 'text-center' },
    { fieldName: 'col6', header: '계약자명', width: '136', styleName: 'text-center' },
    { fieldName: 'col7', header: '상품명', width: '260.4' },
    { fieldName: 'col8', header: '상품코드', width: '136', styleName: 'text-center' },
    { fieldName: 'col9', header: '삼성 주문번호', width: '168', styleName: 'text-center' },
    { fieldName: 'col10', header: '주문유형', width: '168', styleName: 'text-center' },
    { fieldName: 'col11', header: '예약일', width: '138', styleName: 'text-center' },
    { fieldName: 'col12', header: '재고입고일', width: '138', styleName: 'text-center' },
    { fieldName: 'col13', header: '업데이트일시', width: '212.7', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  data.setRows([
    { col1: 'X910080', col2: '1653226', col3: '1653227', col4: 'K멤버스', col5: '1234-1234567', col6: '김계약', col7: '비스포크 세탁기 실버', col8: '1234', col9: '1234567890', col10: '렌탈', col11: '2022-10-01', col12: '2022-10-20', col13: '2022-10-01 09:23:10' },
  ]);
}

</script>

<style scoped>
</style>
