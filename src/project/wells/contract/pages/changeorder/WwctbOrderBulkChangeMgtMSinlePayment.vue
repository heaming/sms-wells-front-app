<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈', '판매', '계약변경관리', '주문일괄변경 관리']" />
    </template>
    <!-- To.개발 kw-tab-panel안에 kw-search로 시작하는 경우 kw-tabs에 .form-border 제거 / 그 외 추가 -->
    <kw-tabs model-value="3">
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
    <kw-tab-panels model-value="3">
      <kw-tab-panel name="3">
        <kw-search
          :cols="2"
          one-row
        >
          <kw-search-row>
            <kw-search-item label="주문번호">
              <kw-input />
            </kw-search-item>
            <kw-search-item label="반영일">
              <kw-date-picker />
            </kw-search-item>
          </kw-search-row>
        </kw-search>

        <div class="result-area">
          <kw-action-top>
            <template #left>
              <kw-paging-info :total-count="156" />
              <span class="ml8">(단위: 건)</span>
            </template>
            <kw-btn
              label="일괄변경 등록"
              primary
              dense
            />
          </kw-action-top>
          <kw-grid
            ref="grdRef"
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
    { fieldName: 'col28' },
    { fieldName: 'col29' },
    { fieldName: 'col30' },
    { fieldName: 'col31' },
    { fieldName: 'col32' },
  ];

  const columns = [
    { fieldName: 'col1', header: '주문번호', width: '152', styleName: 'text-center' },
    { fieldName: 'col2', header: '고객명', width: '117', styleName: 'text-center' },
    { fieldName: 'col3', header: '수납코드', width: '117', styleName: 'text-center' },
    { fieldName: 'col4', header: '상품코드', width: '117', styleName: 'text-center' },
    { fieldName: 'col5', header: '판매자', width: '117', styleName: 'text-center' },
    { fieldName: 'col6', header: '수납코드', width: '117', styleName: 'text-center' },
    { fieldName: 'col7', header: '상품명', width: '264' },
    { fieldName: 'col8', header: '접수일', width: '117', styleName: 'text-center' },
    { fieldName: 'col9', header: '설치일', width: '117', styleName: 'text-center' },
    { fieldName: 'col10', header: '취소일', width: '117', styleName: 'text-center' },
    { fieldName: 'col11', header: '보상일', width: '117', styleName: 'text-center' },
    { fieldName: 'col12', header: '예정일', width: '117', styleName: 'text-center' },
    { fieldName: 'col13', header: '실적취소일', width: '117', styleName: 'text-center' },
    { fieldName: 'col14', header: 'KIWI철거일', width: '117', styleName: 'text-center' },
    { fieldName: 'col15', header: '컨택명', width: '264' },
    { fieldName: 'col16', header: '예약여부', width: '117', styleName: 'text-center' },
    { fieldName: 'col17', header: '인정건수', width: '117', styleName: 'text-right' },
    { fieldName: 'col18', header: '인정금액(원)', width: '117', styleName: 'text-right' },
    { fieldName: 'col19', header: '인정율(%)', width: '117', styleName: 'text-right' },
    { fieldName: 'col20', header: '기준수수료(원)', width: '131', styleName: 'text-right' },
    { fieldName: 'col21', header: '정액여부', width: '117', styleName: 'text-center' },
    { fieldName: 'col22', header: '할부이체', width: '117', styleName: 'text-right' },
    { fieldName: 'col23', header: '할부실적', width: '117', styleName: 'text-right' },
    { fieldName: 'col24', header: '멤버십이체', width: '117', styleName: 'text-right' },
    { fieldName: 'col25', header: '멤버십원장', width: '117', styleName: 'text-center' },
    { fieldName: 'col26', header: '무상멤버십', width: '117', styleName: 'text-right' },
    { fieldName: 'col27', header: '무상A/S', width: '117', styleName: 'text-right' },
    { fieldName: 'col28', header: '행사코드', width: '117', styleName: 'text-center' },
    { fieldName: 'col29', header: '등록일', width: '117', styleName: 'text-center' },
    { fieldName: 'col30', header: '등록자', width: '117', styleName: 'text-center' },
    { fieldName: 'col31', header: '최종수정일', width: '117', styleName: 'text-center' },
    { fieldName: 'col32', header: '최종수정자', width: '117', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2022-1234567', col2: '김고객', col3: '12345', col4: '1234', col5: '김판매', col6: '12345', col7: '웰스(KWW-5100)', col8: '2022-10-10', col9: '2020-10-01', col10: '-', col11: '-', col12: '2020-10-01', col13: '-', col14: '-', col15: '고객접촉OK! 컨택완료!', col16: 'Y', col17: '0', col18: '1,600,000', col19: '100', col20: '0', col21: 'N', col22: '1', col23: '2', col24: '50', col25: 'Y', col26: '50', col27: '50', col28: 'F', col29: '2022-10-21', col30: '김교원', col31: '2022-10-21', col32: '김교원' },

  ]);
}
</script>
<style scoped>
</style>
