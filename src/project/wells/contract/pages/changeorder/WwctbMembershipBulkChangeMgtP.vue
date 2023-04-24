<template>
  <kw-popup
    size="xl"
    title="멤버십 일괄변경 등록"
  >
    <kw-form
      :cols="3"
    >
      <kw-form-row>
        <kw-form-item
          label="처리구분"
          required
        >
          <kw-select
            :model-value="[]"
            :options="['A', 'B', 'C', 'D']"
            multiple
            rules="required"
          />
        </kw-form-item>
        <kw-form-item
          label="변경사유"
          required
          :colspan="2"
        >
          <kw-input
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          label="컨택코드"
          required
        >
          <kw-select
            :model-value="[]"
            :options="['A', 'B', 'C', 'D']"
            multiple
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="0" />
      </template>

      <kw-btn
        grid-action
        label="수정"
      />
      <kw-btn
        grid-action
        label="삭제"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <kw-btn
        dense
        secondary
        label="행추가"
      />
      <kw-btn
        dense
        secondary
        label="저장"
      />
    </kw-action-top>

    <kw-grid
      :visible-rows="2"
      @init="initGrid"
    />
    <template #action>
      <kw-btn
        negative
        label="취소"
      />
      <kw-btn
        primary
        label="등록"
      />
    </template>
  </kw-popup>
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
  ];

  const columns = [
    { fieldName: 'col1', header: '계약번호', width: '152', styleName: 'text-center' },
    { fieldName: 'col2', header: '일련번호', width: '117.8', styleName: 'text-center' },
    { fieldName: 'col3', header: '계약자명', width: '117', styleName: 'text-center' },
    { fieldName: 'col4', header: '판매구분', width: '117', styleName: 'text-center' },
    { fieldName: 'col5', header: '판매유형', width: '117', styleName: 'text-center' },
    { fieldName: 'col6', header: '판매자', width: '117', styleName: 'text-center' },
    { fieldName: 'col7', header: '수납코드', width: '117', styleName: 'text-center' },
    { fieldName: 'col8', header: 'KIWI철거일', width: '117', styleName: 'text-center' },
    { fieldName: 'col9', header: '접수일', width: '117', styleName: 'text-center' },
    { fieldName: 'col10', header: '설치일', width: '117', styleName: 'text-center' },
    { fieldName: 'col11', header: '매출일', width: '117', styleName: 'text-center' },
    { fieldName: 'col12', header: 'BS주기', width: '117', styleName: 'text-center' },
    { fieldName: 'col13', header: '용도구분', width: '117', styleName: 'text-center' },
    { fieldName: 'col14', header: '상품코드', width: '117', styleName: 'text-center' },
    { fieldName: 'col15', header: '상품명', width: '224', styleName: 'text-center' },
    { fieldName: 'col16', header: '멤버십회비', width: '117', styleName: 'text-center' },
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
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2022-6637881', col2: '1', col3: '김고객', col4: '2', col5: '7', col6: '김판매', col7: '12345', col8: '-', col9: '2022-10-10', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '', col17: '', col18: '', col19: '', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '', col26: '', col27: '', col28: '', col29: '', col30: '', col31: '', col32: '', col33: '', col34: '', col35: '', col36: '', col37: '', col38: '', col39: '김교원' },
  ]);
}
</script>
