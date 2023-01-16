<template>
  <kw-popup
    class="kw-popup--2xl"
    title="확정기준 관리"
  >
    <div>
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="7" />
        </template>
        <kw-btn
          dense
          secondary
          label="삭제"
        />
      </kw-action-top>

      <kw-grid
        :visible-rows="12"
        @init="initGrid"
      />
      <kw-action-bottom>
        <kw-btn
          label="삭제"
          grid-action
        />
      </kw-action-bottom>
    </div>
    <kw-separator
      vertical
      inset
      spaced
    />
    <template #action>
      <kw-btn
        negative
        label="취소"
        dense
      />
      <kw-btn
        primary
        label="확인"
        dense
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
  ];

  const columns = [
    { fieldName: 'col1', header: '승인요청구분', width: '142', styleName: 'text-center' },
    { fieldName: 'col2', header: '요청메시지', width: '477' },
    { fieldName: 'col3', header: '요청취소메시지', width: '477' },
    { fieldName: 'col4', header: '승인확인메시지', width: '477' },
    { fieldName: 'col5', header: '시작일자', width: '142', styleName: 'text-center' },
    { fieldName: 'col6', header: '종료일자', width: '142', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  data.setRows([
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },

  ]);
}
</script>
