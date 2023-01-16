<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈','판매관리','리스크관리', '접수제한관리']"
      />
    </template>
    <kw-tabs
      model-value="1"
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
      model-value="1"
    >
      <kw-tab-panel name="1">
        <kw-search>
          <kw-search-row>
            <kw-search-item label="기준일자">
              <kw-date-picker />
            </kw-search-item>
            <kw-search-item label="승인요청구분">
              <kw-select
                :model-value="[]"
                :options="['승인요청구분을 선택헤주세요', 'B', 'C', 'D']"
              />
            </kw-search-item>
            <kw-search-item label="승인요청구분">
              <kw-field
                :model-value="[]"
              >
                <template #default="{ field }">
                  <kw-checkbox
                    v-bind="field"
                    label="유효값만 조회"
                    val=""
                  />
                </template>
              </kw-field>
            </kw-search-item>
          </kw-search-row>
        </kw-search>
        <div class="result-area">
          <kw-action-top>
            <template #left>
              <kw-paging-info :total-count="7" />
            </template>
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
            <kw-separator
              spaced
              vertical
              inset
            />
            <kw-btn
              dense
              label="행추가"
            />

            <kw-btn
              dense

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
              label="엑셀다운로드"
              @click="onClickExcelDownload"
            />
            <kw-separator
              spaced
              vertical
              inset
            />
            <kw-btn
              primary
              dense
              label="확정기준관리"
            />
          </kw-action-top>

          <kw-grid
            :visible-rows="10"
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
  ];

  const columns = [
    { fieldName: 'col1', header: '판매구분', width: '142', styleName: 'text-center' },
    { fieldName: 'col2', header: '담당채널(부서)', width: '180', styleName: 'text-center' },
    { fieldName: 'col3', header: '담당구분', width: '142', styleName: 'text-center' },
    { fieldName: 'col4', header: '담당자사번', width: '180', styleName: 'text-center' },
    { fieldName: 'col5', header: '담당자명', width: '180', styleName: 'text-center' },
    { fieldName: 'col6', header: '시작일자', width: '196', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'col7', header: '종료일자', width: '196', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'col8', header: '케이톡발송대상', width: '142', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: 'A-전체', col2: ' ', col3: '0-담당없음', col4: '사번입력', col5: ' ', col6: '2022-05-03', col7: '2022-05-03', col8: 'Y' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '2022-05-20', col7: '2022-05-20', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '2022-05-20', col7: '2022-05-20', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '2022-05-20', col7: '2022-05-20', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '2022-05-20', col7: '2022-05-20', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '2022-05-20', col7: '2022-05-20', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '2022-05-20', col7: '2022-05-20', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '2022-05-20', col7: '2022-05-20', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '2022-05-20', col7: '2022-05-20', col8: 'N' },
    { col1: '9-직원구매', col2: 'ETC', col3: '1-지정사번', col4: '123456', col5: '김직원', col6: '2022-05-20', col7: '2022-05-20', col8: 'N' },
  ]);
}

</script>
