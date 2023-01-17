<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈', '판매관리', '리스크관리', '접수제한관리']" />
    </template>

    <kw-tabs model-value="2">
      <kw-tab
        name="1"
        label="확정승인기준관리"
      />
      <kw-tab
        name="2"
        label="예외처리관리"
      />
      <kw-tab
        name="3"
        label="사업자가입제한관리"
      />
      <kw-tab
        name="4"
        label="사용자판매제한관리"
      />
      <kw-tab
        name="5"
        label="블랙리스트관리"
      />
    </kw-tabs>
    <kw-tab-panels model-value="2">
      <kw-tab-panel name="2">
        <kw-search :cols="2">
          <kw-search-row>
            <kw-search-item label="적용기간">
              <kw-date-range-picker
                rules="date_range_months:1"
              />
            </kw-search-item>

            <kw-search-item label="판매자 사번">
              <kw-input
                icon="search"
                clearable
              />
            </kw-search-item>
          </kw-search-row>

          <kw-search-row>
            <kw-search-item label="고객번호">
              <kw-input
                icon="search"
                clearable
              />
            </kw-search-item>

            <kw-search-item label="계약번호">
              <kw-input />
            </kw-search-item>
          </kw-search-row>
        </kw-search>

        <div class="result-area">
          <kw-action-top>
            <template #left>
              <kw-paging-info :total-count="7" />
            </template>
            <kw-btn
              dense
              grid-action
              label="수정"
            />
            <kw-btn
              dense
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
              grid-action
              label="행추가"
            />
            <kw-btn
              dense
              grid-action
              label="저장"
            />
            <kw-separator
              spaced
              vertical
              inset
            />
            <kw-btn
              icon="download_on"
              dense
              secondary
              label="엑셀 다운로드"
              @click="onClickExcelDownload"
            />
          </kw-action-top>

          <kw-grid
            :visible-rows="11"
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
  ];

  const columns = [
    { fieldName: 'col1', header: '판매구분', width: '289' },
    { fieldName: 'col2', header: '고객번호', width: '180', styleName: 'text-center' },
    { fieldName: 'col3', header: '판매자사번', width: '180', styleName: 'text-center' },
    { fieldName: 'col4', header: '계약번호', width: '180', styleName: 'text-center' },
    { fieldName: 'col5', header: '제한구분', width: '142', styleName: 'text-left' },
    { fieldName: 'col6', header: '메모', width: '404', styleName: 'text-center' },
    { fieldName: 'col7', header: '시작일자', width: '196', styleName: 'text-center' },
    { fieldName: 'col8', header: '종료일자', width: '196', styleName: 'text-center' },
    { fieldName: 'col9', header: '등록자', width: '180', styleName: 'text-center' },
    { fieldName: 'col10', header: '수정자', width: '180', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },
    { col1: '02-렌탈 기변 상태코드 연체건 접수허용', col2: '123456789', col3: '123456789', col4: '123456789', col5: '제한', col6: '123456789', col7: '2022-05-20', col8: '2022-05-20', col9: '김직원', col10: '김직원' },

  ]);
}
</script>

<style scoped>
</style>
