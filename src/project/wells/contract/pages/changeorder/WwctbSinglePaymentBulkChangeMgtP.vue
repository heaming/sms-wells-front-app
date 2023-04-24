<template>
  <kw-popup
    size="xl"
    title="일시불 일괄변경 등록"
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
          label="보상일"
          required
          hint="KIWI철거일자와 같은날짜로 변경가능합니다."
        >
          <kw-date-picker
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="0" />
        <ul class="kw-notification ml10">
          <li>
            주문번호 뒷번호, 7자리가 아니여도 앞에 0을 입력하지 않습니다.
          </li>
        </ul>
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
  ];

  const columns = [
    { fieldName: 'col1', header: '계약번호', width: '152', styleName: 'text-center' },
    { fieldName: 'col2', header: '계약자명', width: '117', styleName: 'text-center' },
    { fieldName: 'col3', header: '상품코드', width: '117', styleName: 'text-center' },
    { fieldName: 'col4', header: '상품명', width: '229.8', styleName: 'text-center' },
    { fieldName: 'col5', header: '설치일', width: '117', styleName: 'text-center' },
    { fieldName: 'col6', header: 'KIWI철거일', width: '117', styleName: 'text-center' },
    { fieldName: 'col7', header: '취소일', width: '117', styleName: 'text-center' },
    { fieldName: 'col8', header: '보상일', width: '117', styleName: 'text-center' },
    { fieldName: 'col9', header: '예정일', width: '117', styleName: 'text-center' },
    { fieldName: 'col10', header: '컨택명', width: '165', styleName: 'text-center' },
    { fieldName: 'col11', header: '인정건수', width: '117', styleName: 'text-center' },
    { fieldName: 'col12', header: '인정금액', width: '117', styleName: 'text-center' },
    { fieldName: 'col13', header: '인정율', width: '117', styleName: 'text-center' },
    { fieldName: 'col14', header: '할부이체', width: '117', styleName: 'text-center' },
    { fieldName: 'col15', header: '멤버십이체', width: '117', styleName: 'text-center' },
    { fieldName: 'col16', header: '무상멤버십', width: '117', styleName: 'text-center' },
    { fieldName: 'col17', header: '무상A/S', width: '117', styleName: 'text-center' },
    { fieldName: 'col18', header: '행사코드', width: '117', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2022-6637881', col2: '김고객', col3: '1234', col4: '1234', col5: '', col6: '', col7: '', col8: '', col9: '', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '', col17: '', col18: '', col19: '', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '', col26: '', col27: '' },
  ]);
}
</script>
