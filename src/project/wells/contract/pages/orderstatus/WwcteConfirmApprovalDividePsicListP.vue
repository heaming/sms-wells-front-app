<template>
  <kw-popup
    class="kw-popup--3xl"
    title="확정승인 구분/담당자목록 조회"
  >
    <h3>요청내역</h3>
    <kw-grid
      :visible-rows="2"
      class="mt20"
      @init="initGrid"
    />
    <h3>구매내역</h3>
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="10"
        />
        <span class="ml8">(단위:원)</span>
      </template>
    </kw-action-top>
    <kw-grid
      :visible-rows="10"
      class="mt20"
      @init="initGrid2"
    />
    <template #action>
      <kw-btn
        label="확인"
        primary
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
  ];

  const columns = [
    { fieldName: 'col1', header: '승인요청구분', width: '360' },
    { fieldName: 'col2', header: '요청구분', width: '116', styleName: 'text-center' },
    { fieldName: 'col3', header: '담당자', width: '160', styleName: 'text-center' },
    { fieldName: 'col4', header: '발신일시', width: '197', styleName: 'text-center' },
    { fieldName: 'col5', header: '승인여부', width: '116', styleName: 'text-center' },
    { fieldName: 'col6', header: '담당자', width: '160', styleName: 'text-center' },
    { fieldName: 'col7', header: '발신일시', width: '197', styleName: 'text-center' },
    { fieldName: 'col8', header: '승인여부', width: '116', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '중장기연체고객-법인', col2: '요청(1)', col3: '김교원, 박웰스', col4: '2022-08-31  18:19:56', col5: 'Y', col6: '김교원, 박웰스', col7: '2022-08-31  18:19:56', col8: 'Y' },
  ]);
}
function initGrid2(data, view) {
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
  ];

  const columns = [
    { fieldName: 'col1', header: '계약번호', width: '165', styleName: 'text-center' },
    { fieldName: 'col2', header: '계약자명', width: '165', styleName: 'text-center' },
    { fieldName: 'col3', header: '고객등급', width: '165', styleName: 'text-center' },
    { fieldName: 'col4', header: '계약자명', width: '165', styleName: 'text-center' },
    { fieldName: 'col5', header: '설치주소', width: '420' },
    { fieldName: 'col6', header: '상품명', width: '338' },
    { fieldName: 'col7', header: '설치일', width: '150', styleName: 'text-center' },
    { fieldName: 'col8', header: '사용구분', width: '150', styleName: 'text-center' },
    { fieldName: 'col9', header: '렌탈회차', width: '150', styleName: 'text-center' },
    { fieldName: 'col10', header: '연체개발/금액', width: '150', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2019-0001234', col2: '올뎃파크', col3: '-', col4: '올뎃파크', col5: '경북 문정시 가은읍 왕능길 112 문경에코알라', col6: '안마의자(KW-H05B1)', col7: '2022-09-03', col8: '관리', col9: '43', col10: '1/68,900' },
    { col1: '2019-0001234', col2: '올뎃파크', col3: '-', col4: '올뎃파크', col5: '경북 문정시 가은읍 왕능길 112 문경에코알라', col6: '안마의자(KW-H05B1)', col7: '2022-09-03', col8: '관리', col9: '43', col10: '1/68,900' },
    { col1: '2019-0001234', col2: '올뎃파크', col3: '-', col4: '올뎃파크', col5: '경북 문정시 가은읍 왕능길 112 문경에코알라', col6: '안마의자(KW-H05B1)', col7: '2022-09-03', col8: '관리', col9: '43', col10: '1/68,900' },
    { col1: '2019-0001234', col2: '올뎃파크', col3: '-', col4: '올뎃파크', col5: '경북 문정시 가은읍 왕능길 112 문경에코알라', col6: '안마의자(KW-H05B1)', col7: '2022-09-03', col8: '관리', col9: '43', col10: '1/68,900' },
    { col1: '2019-0001234', col2: '올뎃파크', col3: '-', col4: '올뎃파크', col5: '경북 문정시 가은읍 왕능길 112 문경에코알라', col6: '안마의자(KW-H05B1)', col7: '2022-09-03', col8: '관리', col9: '43', col10: '1/68,900' },
    { col1: '2019-0001234', col2: '올뎃파크', col3: '-', col4: '올뎃파크', col5: '경북 문정시 가은읍 왕능길 112 문경에코알라', col6: '안마의자(KW-H05B1)', col7: '2022-09-03', col8: '관리', col9: '43', col10: '1/68,900' },
    { col1: '2019-0001234', col2: '올뎃파크', col3: '-', col4: '올뎃파크', col5: '경북 문정시 가은읍 왕능길 112 문경에코알라', col6: '안마의자(KW-H05B1)', col7: '2022-09-03', col8: '관리', col9: '43', col10: '1/68,900' },
    { col1: '2019-0001234', col2: '올뎃파크', col3: '-', col4: '올뎃파크', col5: '경북 문정시 가은읍 왕능길 112 문경에코알라', col6: '안마의자(KW-H05B1)', col7: '2022-09-03', col8: '관리', col9: '43', col10: '1/68,900' },
    { col1: '2019-0001234', col2: '올뎃파크', col3: '-', col4: '올뎃파크', col5: '경북 문정시 가은읍 왕능길 112 문경에코알라', col6: '안마의자(KW-H05B1)', col7: '2022-09-03', col8: '관리', col9: '43', col10: '1/68,900' },
    { col1: '2019-0001234', col2: '올뎃파크', col3: '-', col4: '올뎃파크', col5: '경북 문정시 가은읍 왕능길 112 문경에코알라', col6: '안마의자(KW-H05B1)', col7: '2022-09-03', col8: '관리', col9: '43', col10: '1/68,900' },
  ]);
}
</script>
<style scoped>
</style>
