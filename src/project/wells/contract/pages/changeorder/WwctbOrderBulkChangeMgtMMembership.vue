<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈', '판매', '계약변경관리', '주문일괄변경 관리']" />
    </template>
    <!-- To.개발 kw-tab-panel안에 kw-search로 시작하는 경우 kw-tabs에 .form-border 제거 / 그 외 추가 -->
    <kw-tabs model-value="2">
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
    <kw-tab-panels model-value="2">
      <kw-tab-panel name="2">
        <kw-search
          :cols="2"
          one-row
        >
          <kw-search-row>
            <kw-search-item label="계약번호">
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
              <span class="ml8">(단위: 원)</span>
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
    { fieldName: 'col33' },
    { fieldName: 'col34' },
    { fieldName: 'col35' },
    { fieldName: 'col36' },
    { fieldName: 'col37' },
    { fieldName: 'col38' },
    { fieldName: 'col39' },
    { fieldName: 'col40' },
  ];

  const columns = [
    { fieldName: 'col1', header: '계약번호', width: '152', styleName: 'text-center' },
    { fieldName: 'col2', header: '계약자명', width: '117', styleName: 'text-center' },
    { fieldName: 'col3', header: '판매구분', width: '117', styleName: 'text-center' },
    { fieldName: 'col4', header: '판매유형', width: '117', styleName: 'text-center' },
    { fieldName: 'col5', header: '피트너코드', width: '117', styleName: 'text-center' },
    { fieldName: 'col6', header: '파트너명', width: '117', styleName: 'text-center' },
    { fieldName: 'col7', header: '수납코드', width: '117', styleName: 'text-center' },
    { fieldName: 'col8', header: 'KIWI철거일', width: '117', styleName: 'text-center' },
    { fieldName: 'col9', header: '접수일', width: '117', styleName: 'text-center' },
    { fieldName: 'col10', header: '설치일', width: '117', styleName: 'text-center' },
    { fieldName: 'col11', header: '매출일', width: '117', styleName: 'text-center' },
    { fieldName: 'col12', header: 'BS주기', width: '117', styleName: 'text-center' },
    { fieldName: 'col13', header: '용도구분', width: '117', styleName: 'text-center' },
    { fieldName: 'col14', header: '상품코드', width: '117', styleName: 'text-center' },
    { fieldName: 'col15', header: '상품명', width: '224', styleName: 'text-left' },

    { fieldName: 'col16', header: '멤버십회비', width: '117', styleName: 'text-right' },
    { fieldName: 'col17', header: '납입방법', width: '117', styleName: 'text-center' },
    { fieldName: 'col18', header: '멤버십무상', width: '117', styleName: 'text-center' },
    { fieldName: 'col19', header: '멤버십구분', width: '117', styleName: 'text-center' },
    { fieldName: 'col20', header: '멤버십기간', width: '117', styleName: 'text-center' },
    { fieldName: 'col21', header: '확정일', width: '117', styleName: 'text-center' },
    { fieldName: 'col22', header: '취소일', width: '117', styleName: 'text-center' },
    { fieldName: 'col23', header: '예정일', width: '117', styleName: 'text-center' },
    { fieldName: 'col24', header: '가입일', width: '117', styleName: 'text-center' },
    { fieldName: 'col25', header: '탈퇴일', width: '117', styleName: 'text-center' },
    { fieldName: 'col26', header: '방문주기', width: '117', styleName: 'text-center' },
    { fieldName: 'col27', header: '컨택코드명', width: '117', styleName: 'text-center' },
    { fieldName: 'col28', header: '컨택담당', width: '117', styleName: 'text-center' },
    { fieldName: 'col29', header: '상품구분1', width: '117', styleName: 'text-center' },
    { fieldName: 'col30', header: '상품구분2', width: '117', styleName: 'text-center' },

    { fieldName: 'col31', header: '정액여부', width: '117', styleName: 'text-center' },
    { fieldName: 'col32', header: '기준수수료', width: '117', styleName: 'text-center' },
    { fieldName: 'col33', header: '할인구분', width: '117', styleName: 'text-center' },
    { fieldName: 'col34', header: '할인유형', width: '117', styleName: 'text-center' },
    { fieldName: 'col35', header: '그룹구분', width: '117', styleName: 'text-center' },
    { fieldName: 'col36', header: '등록일', width: '117', styleName: 'text-center' },
    { fieldName: 'col37', header: '등록자', width: '117', styleName: 'text-center' },
    { fieldName: 'col38', header: '최종수정일', width: '117', styleName: 'text-center' },
    { fieldName: 'col39', header: '최종수정자', width: '117', styleName: 'text-center' },
    { fieldName: 'col40', header: '변경사유', width: '264', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2022-1234567-1', col2: '김고객', col3: '7', col4: '2', col5: '1234567', col6: '김판매', col7: '12345', col8: '-', col9: '2022-10-10', col10: '2022-10-10', col11: '2022-10-10', col12: '6', col13: '0', col14: '1234', col15: '웰스(PN5W1)', col16: '10,000', col17: '1', col18: '0', col19: '1', col20: '12', col21: '-', col22: '2022-10-10', col23: '-', col24: '-', col25: '-', col26: '3', col27: '취소요청', col28: '0', col29: '0', col30: '0', col31: '-', col32: '0', col33: '1', col34: '-', col35: '-', col36: '2022-10-21', col37: '김교원', col38: '2022-10-21', col39: '김교원', col40: '멤버십 확정 전 취소요청' },

  ]);
}
</script>
<style scoped>
</style>
