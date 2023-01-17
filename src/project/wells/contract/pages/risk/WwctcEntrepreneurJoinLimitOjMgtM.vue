<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈','판매관리','리스크관리', '접수제한관리']"
      />
    </template>
    <kw-tabs
      model-value="3"
    >
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
    <kw-tab-panels
      model-value="3"
    >
      <kw-tab-panel name="3">
        <kw-search>
          <kw-search-row>
            <kw-search-item label="발생일자">
              <kw-date-range-picker
                rules="date_range_months:1"
              />
            </kw-search-item>
            <kw-search-item label="사업자번호">
              <kw-input />
            </kw-search-item>
            <kw-search-item label="상호명">
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
              grid-action
              label="행추가"
            />
            <kw-btn
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
              secondary
              dense

              label="파일업로드양식"
            />
            <kw-btn
              icon="upload_on"
              secondary
              dense

              label="엑셀업로드"
            />
            <kw-btn
              icon="download_on"
              dense
              secondary
              label="엑셀다운로드"
              @click="onClickExcelDownload"
            />
          </kw-action-top>

          <kw-grid
            :visible-rows="10"
            @init="initGrid"
          />
          <kw-action-bottom>
            <kw-btn
              label="수정"
              grid-action
              dense
            />
            <kw-btn
              label="삭제"
              grid-action
              dense
            />
          </kw-action-bottom>
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
  ];

  const columns = [
    { fieldName: 'col1', header: '정보구분', width: '142' },
    { fieldName: 'col2', header: '사업자번호', width: '127', styleName: 'text-center' },
    { fieldName: 'col3', header: '상호명', width: '127', styleName: 'text-center' },
    { fieldName: 'col4', header: '대표자명', width: '127', styleName: 'text-center' },
    { fieldName: 'col5', header: '생년월일', width: '196', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'col6', header: '불량코드', width: '211' },
    { fieldName: 'col7', header: '발생일자', width: '196', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'col8', header: '해제일자', width: '196', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'col9', header: '발생사유1', width: '376' },
    { fieldName: 'col10', header: '발생사유2', width: '376' },
    { fieldName: 'col11', header: '발생사유3', width: '376' },
    { fieldName: 'col12', header: '등록담당', width: '180', styleName: 'text-center' },
    { fieldName: 'col13', header: '해제담당', width: '180', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '3-등록', col2: ' ', col3: ' ', col4: ' ', col5: '2022-05-03', col6: '01-대손처리자', col7: '2022-05-03', col8: '2022-05-03', col9: '', col10: '', col11: '', col12: '', col13: '' },
    { col1: '3-등록', col2: '123456789', col3: '상호명', col4: '김대표', col5: '2022-05-20', col6: '02-대손 처리 예정', col7: '2022-05-20', col8: '2022-05-20', col9: '발생사유 1', col10: '발생사유 1', col11: '발생사유 1', col12: '김직원', col13: '김직원' },
    { col1: '3-등록', col2: '123456789', col3: '상호명', col4: '김대표', col5: '2022-05-20', col6: '02-대손 처리 예정', col7: '2022-05-20', col8: '2022-05-20', col9: '발생사유 1', col10: '발생사유 1', col11: '발생사유 1', col12: '김직원', col13: '김직원' },
    { col1: '3-등록', col2: '123456789', col3: '상호명', col4: '김대표', col5: '2022-05-20', col6: '02-대손 처리 예정', col7: '2022-05-20', col8: '2022-05-20', col9: '발생사유 1', col10: '발생사유 1', col11: '발생사유 1', col12: '김직원', col13: '김직원' },
    { col1: '3-등록', col2: '123456789', col3: '상호명', col4: '김대표', col5: '2022-05-20', col6: '02-대손 처리 예정', col7: '2022-05-20', col8: '2022-05-20', col9: '발생사유 1', col10: '발생사유 1', col11: '발생사유 1', col12: '김직원', col13: '김직원' },
    { col1: '3-등록', col2: '123456789', col3: '상호명', col4: '김대표', col5: '2022-05-20', col6: '02-대손 처리 예정', col7: '2022-05-20', col8: '2022-05-20', col9: '발생사유 1', col10: '발생사유 1', col11: '발생사유 1', col12: '김직원', col13: '김직원' },
    { col1: '3-등록', col2: '123456789', col3: '상호명', col4: '김대표', col5: '2022-05-20', col6: '02-대손 처리 예정', col7: '2022-05-20', col8: '2022-05-20', col9: '발생사유 1', col10: '발생사유 1', col11: '발생사유 1', col12: '김직원', col13: '김직원' },
    { col1: '3-등록', col2: '123456789', col3: '상호명', col4: '김대표', col5: '2022-05-20', col6: '02-대손 처리 예정', col7: '2022-05-20', col8: '2022-05-20', col9: '발생사유 1', col10: '발생사유 1', col11: '발생사유 1', col12: '김직원', col13: '김직원' },
    { col1: '3-등록', col2: '123456789', col3: '상호명', col4: '김대표', col5: '2022-05-20', col6: '02-대손 처리 예정', col7: '2022-05-20', col8: '2022-05-20', col9: '발생사유 1', col10: '발생사유 1', col11: '발생사유 1', col12: '김직원', col13: '김직원' },
    { col1: '3-등록', col2: '123456789', col3: '상호명', col4: '김대표', col5: '2022-05-20', col6: '02-대손 처리 예정', col7: '2022-05-20', col8: '2022-05-20', col9: '발생사유 1', col10: '발생사유 1', col11: '발생사유 1', col12: '김직원', col13: '김직원' },
    { col1: '3-등록', col2: '123456789', col3: '상호명', col4: '김대표', col5: '2022-05-20', col6: '02-대손 처리 예정', col7: '2022-05-20', col8: '2022-05-20', col9: '발생사유 1', col10: '발생사유 1', col11: '발생사유 1', col12: '김직원', col13: '김직원' },
    { col1: '3-등록', col2: '123456789', col3: '상호명', col4: '김대표', col5: '2022-05-20', col6: '02-대손 처리 예정', col7: '2022-05-20', col8: '2022-05-20', col9: '발생사유 1', col10: '발생사유 1', col11: '발생사유 1', col12: '김직원', col13: '김직원' },
  ]);
}

</script>
