<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈','판매','영업활동관리','삼성전자 상품관리']"
      />
    </template>
    <!-- To.개발 kw-tab-panel안에 kw-search로 시작하는 경우 kw-tabs에 .form-border 제거 / 그 외 추가 -->
    <kw-tabs model-value="1">
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
    <kw-tab-panels model-value="1">
      <kw-tab-panel name="1">
        <kw-search>
          <kw-search-row>
            <kw-search-item
              label="접수기간"
            >
              <kw-date-range-picker rules="date_range_months:1" />
            </kw-search-item>
            <kw-search-item
              label="계약번호"
            >
              <kw-input />
            </kw-search-item>
            <kw-search-item
              label="계약자명"
            >
              <kw-input />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-search-item
              label="소속코드"
            >
              <kw-input />
              <span>~</span>
              <kw-input />
            </kw-search-item>
          </kw-search-row>
        </kw-search>

        <div class="result-area">
          <kw-action-top>
            <template #left>
              <kw-paging-info :total-count="100" />
            </template>
            <kw-btn
              icon="download_off"
              secondary
              dense
              class="mr8"
              label="양식 다운로드"
            />
            <kw-btn
              icon="upload_on"
              secondary
              dense
              class="mr8"
              label="엑셀 업로드"
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
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
  ];

  const columns = [
    { fieldName: 'col1', header: '계약번호', width: '136', styleName: 'text-center' },
    { fieldName: 'col2', header: '계약자명', width: '136', styleName: 'text-center' },
    { fieldName: 'col3', header: '주문번호', width: '137', styleName: 'text-center' },
    { fieldName: 'col4', header: '상품명(대분류)', width: '197' },
    { fieldName: 'col5', header: '상품명(소분류)', width: '198' },
    { fieldName: 'col6', header: '계약일', width: '136', styleName: 'text-center' },
    { fieldName: 'col7', header: '설치예약일', width: '136', styleName: 'text-center' },
    { fieldName: 'col8', header: '파트너 소속코드', width: '147', styleName: 'text-center' },
    { fieldName: 'col9', header: '파트너 사번', width: '149', styleName: 'text-center' },
    { fieldName: 'col10', header: '파트너명', width: '148', styleName: 'text-center' },
    { fieldName: 'col11', header: '비고', width: '366' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '1234-1234567', col2: '김고객', col3: '1234567890', col4: '환경가전', col5: '건조기', col6: '2022-10-01', col7: '2022-10-05', col8: 'A123456', col9: 'A123456', col10: '김판매', col11: '미설치 된 사유 내용이 들어갑니다.' },
  ]);
}
</script>
<style scoped>
</style>
