<!-- window.open 너비 1292px이상 설정 요망 -->
<template>
  <kw-action-top class="mt30">
    <template #left>
      <kw-paging-info
        :total-count="7"
      />
    </template>
  </kw-action-top>
  <kw-grid
    :visible-rows="10"
    @init="initGrid"
  />
</template>
<script setup>

const searchParams = ref({
  cntrNo: '',
  cntrSn: '',
});

async function fetchData() {
  console.log('컨택내용의 fetchData');
  console.log(searchParams.value.cntrNo, searchParams.value.cntrSn);
}

async function setDatas(cntrNo, cntrSn) {
  searchParams.value.cntrNo = cntrNo;
  searchParams.value.cntrSn = cntrSn;

  await fetchData();
}

// 외부에서 사용할 수 있도록 노출 선언
defineExpose({
  setDatas,
});

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
    { fieldName: 'col1', header: '순번', width: '104', styleName: 'text-center' },
    { fieldName: 'col2', header: '컨택일자', width: '132', styleName: 'text-center' },
    { fieldName: 'col3', header: '컨택시간', width: '132', styleName: 'text-center' },
    { fieldName: 'col4', header: '예정일자', width: '132', styleName: 'text-center' },
    { fieldName: 'col5', header: '컨택사항', width: '194' },
    { fieldName: 'col6', header: '차월', width: '104', styleName: 'text-center' },
    { fieldName: 'col7', header: '컨택메모', width: '332' },
    { fieldName: 'col8', header: '등록담당', width: '130', styleName: 'text-center' },
    { fieldName: 'col9', header: '삭제', width: '130', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '-', col2: '2022-12-12', col3: '15 : 15', col4: '2022-12-12', col5: '블라블라블', col6: '-', col7: '블라블라블', col8: '김등록', col9: '-' },
  ]);
}
</script>
