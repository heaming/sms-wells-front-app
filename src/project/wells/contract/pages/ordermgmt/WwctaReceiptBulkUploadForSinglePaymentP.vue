<template>
  <kw-popup
    class="kw-popup--lg"
    title="일시불 대량 접수자료 업로드"
  >
    <kw-action-top class="mt30">
      <template #left>
        <kw-paging-info :total-count="0" />
      </template>

      <kw-btn
        icon="upload_on"
        dense
        label="엑셀업로드"
        @click="onClickExcelDownload"
      />
      <kw-btn
        icon="download_off"
        dense
        label="양식 다운로드"
        @click="onClickExcelDownload"
      />
    </kw-action-top>

    <kw-grid
      :visible-rows="3"
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
  ];

  const columns = [
    { fieldName: 'col1', header: '구분1', width: '111', styleName: 'text-center' },
    { fieldName: 'col2', header: '구분2', width: '125', styleName: 'text-center' },
    { fieldName: 'col3', header: '상품코드', width: '125' },
    { fieldName: 'col4', header: '제휴코드', width: '125', styleName: 'text-right' },
    { fieldName: 'col5', header: '할인구분', width: '125', styleName: 'text-center' },
    { fieldName: 'col6', header: '할인유형', width: '282', styleName: 'text-center' },
    { fieldName: 'col7', header: '무상멤버십', width: '125', styleName: 'text-center' },
    { fieldName: 'col8', header: '무상A/S', width: '125', styleName: 'text-center' },
    { fieldName: 'col9', header: '교원키', width: '125', styleName: 'text-center' },
    { fieldName: 'col10', header: '고객명', width: '125', styleName: 'text-center' },
    { fieldName: 'col11', header: '생년월일', width: '128', styleName: 'text-center' },
    { fieldName: 'col12', header: '성별(1:남, 2:여)', width: '128', styleName: 'text-center' },
    { fieldName: 'col13', header: '휴대전화번호', width: '128', styleName: 'text-center' },
    { fieldName: 'col14', header: '전화번호', width: '128', styleName: 'text-center' },
    { fieldName: 'col15', header: '우편번호', width: '128', styleName: 'text-center' },
    { fieldName: 'col16', header: '주소', width: '275', styleName: 'text-center' },
    { fieldName: 'col17', header: '매출일', width: '128', styleName: 'text-center' },
    { fieldName: 'col18', header: '업체BS구분', width: '128', styleName: 'text-center' },
    { fieldName: 'col19', header: '업체구분', width: '128', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: 'BW', col2: '16', col3: '3020', col4: '50', col5: '1', col6: '36. 무상멤버십 3년', col7: '36', col8: '36', col9: '123456789', col10: '김고객', col11: '1990-01-01', col12: '1', col13: '010-0000-0000', col14: '02-000-0000', col15: '123-12', col16: '서울시 종로구 을지로 100길 10', col17: '2022-10-10', col18: '1', col19: '11' },

  ]);
}
</script>
