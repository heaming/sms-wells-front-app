<template>
  <kw-popup
    class="kw-popup--md"
    title="설치처 대량 접수자료 업로드"
  >
    <kw-action-top>
      <template #left>
        <span>총</span>
        <span class="accent pl4">0건</span>
      </template>
      <kw-btn
        icon="upload_on"
        dense
        label="엑셀 업로드"
      />
      <kw-btn
        icon="download_off"
        dense
        label="양식 다운로드"
        @click="onClickExcelDownload"
      />
    </kw-action-top>

    <kw-grid
      :visible-rows="1"
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
  ];

  const columns = [
    { fieldName: 'col1', header: '구분(1:일시불, 2:렌탈, 6:정기배송)', width: '267', styleName: 'text-center' },
    { fieldName: 'col2', header: '고객년도', width: '125', styleName: 'text-center' },
    { fieldName: 'col3', header: '고객코드', width: '125', styleName: 'text-center' },
    { fieldName: 'col4', header: '일련번호(렌탈/일시불:0)', width: '204', styleName: 'text-center' },
    { fieldName: 'col5', header: '고객명', width: '125', styleName: 'text-center' },
    { fieldName: 'col6', header: '우편번호', width: '128', styleName: 'text-center' },
    { fieldName: 'col7', header: '주소', width: '263', styleName: 'text-center' },
    { fieldName: 'col8', header: '휴대전화번호', width: '128', styleName: 'text-center' },
    { fieldName: 'col9', header: '전화번호', width: '128', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '1', col2: '2022', col3: '1234567', col4: '1', col5: '김고객', col6: '123-12', col7: '서울시 종로구 을지로 100길 10', col8: '010-0000-0000', col9: '02-000-0000' },
  ]);
}
</script>
