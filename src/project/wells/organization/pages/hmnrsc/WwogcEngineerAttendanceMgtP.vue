<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcEngineerAttendanceMgtP - 휴가정보상세
3. 작성자 : 김동석
4. 작성일 : 2023-05-10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 휴가정보상세
****************************************************************************************************
--->

<template>
  <kw-popup
    class="kw-popup--xl "
    title="휴가정보 상세"
  >
    <h3>0001 / 센터소장 / 홍길동 / 홈케어</h3>
    <kw-action-top>
      <template #left>
        <span>총</span>
        <span class="accent pl4">2건</span>
      </template>
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
        grid-action
        label="행추가"
      />
      <kw-btn
        grid-action
        label="저장"
      />
    </kw-action-top>
    <kw-grid
      :visible-rows="7"
      @init="initGrid"
    />
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
  ];

  const columns = [
    { fieldName: 'col1', header: '휴가종류', width: '100', styleName: 'text-center' },
    { fieldName: 'col2', header: '시작일자', width: '130', styleName: 'text-center' },
    { fieldName: 'col3', header: '종료일자', width: '130', styleName: 'text-center' },
    { fieldName: 'col4', header: '비고사항', width: '300', styleName: 'text-left' },
    { fieldName: 'col5', header: '번호', width: '150', styleName: 'text-center' },
    { fieldName: 'col6', header: '성명', width: '100', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([

    {
      header: '휴가',
      direction: 'horizontal',
      items: ['col1', 'col2', 'col3', 'col4'],
    },
    {
      header: '업무대행자',
      direction: 'horizontal',
      items: ['col5', 'col6'],
    },
  ]);

  data.setRows([
    { col1: '연차휴가', col2: '2022-09-15', col3: '2022-09-15', col4: '여행', col5: '000000', col6: '홍길동' },
    { col1: '연차휴가', col2: '2022-09-15', col3: '2022-09-15', col4: '개인사정', col5: '000000', col6: '홍길동' },
  ]);
}
</script>
<style scoped>
</style>
