<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈','판매관리','리스크관리','접수제한관리']" />
    </template>

    <kw-tabs
      model-value="4"
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
      model-value="4"
    >
      <kw-tab-panel name="4">
        <kw-search>
          <kw-search-row>
            <kw-search-item label="적용기간">
              <kw-date-range-picker
                rules="date_range_months:1"
              />
            </kw-search-item>
            <kw-search-item
              label="판매/채널/조직/사용자"
              :colspan="2"
            >
              <kw-select
                :options="['전체', 'B', 'C', 'D']"
              />
              <kw-select
                :options="['전체', 'B', 'C', 'D']"
              />
              <kw-input />
              <kw-input />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-search-item label="상품명">
              <kw-input
                icon="search"
                clearable
              />
            </kw-search-item>
            <kw-search-item label="판매유형">
              <kw-select
                :options="['전체', 'B', 'C', 'D']"
              />
            </kw-search-item>
            <kw-search-item label="판매제한">
              <kw-select
                :options="['전체', 'B', 'C', 'D']"
              />
            </kw-search-item>
          </kw-search-row>
        </kw-search>
      </kw-tab-panel>
    </kw-tab-panels>
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
          label="주기능"
        />
      </kw-action-top>

      <kw-grid
        :visible-rows="11"
        @init="initGrid"
      />

      <kw-action-bottom>
        <kw-btn
          label="수정"
          grid-action
        />
        <kw-btn
          label="삭제"
          grid-action
        />
      </kw-action-bottom>
    </div>
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
    { fieldName: 'col14' },
    { fieldName: 'col15' },
    { fieldName: 'col16' },
    { fieldName: 'col17' },
    { fieldName: 'col18' },
    { fieldName: 'col19' },
    { fieldName: 'col20' },
    { fieldName: 'col21' },
    { fieldName: 'col22' },
    { fieldName: 'col23' },
  ];

  const columns = [
    { fieldName: 'col1', header: '판매구분', width: '142' },
    { fieldName: 'col2', header: '채널', width: '142' },
    { fieldName: 'col3', header: '조직', width: '126', styleName: 'text-center' },
    { fieldName: 'col4', header: '사용자', width: '126', styleName: 'text-center' },
    { fieldName: 'col5', header: '개인/법인', width: '142' },
    { fieldName: 'col6', header: '우편번호1', width: '180', styleName: 'text-center' },
    { fieldName: 'col7', header: '우편번호1', width: '180', styleName: 'text-center' },
    { fieldName: 'col8', header: '상품코드', width: '180', styleName: 'text-center' },
    { fieldName: 'col9', header: '상품분류', width: '142' },
    { fieldName: 'col10', header: '상품유형', width: '142' },
    { fieldName: 'col11', header: '상품명', width: '220' },
    { fieldName: 'col12', header: '주기', width: '131' },
    { fieldName: 'col13', header: '판매유형', width: '142' },
    { fieldName: 'col14', header: '판매제한', width: '142' },
    { fieldName: 'col15', header: '시작일자', width: '196', styleName: 'text-right' },
    { fieldName: 'col16', header: '종료일자', width: '196', styleName: 'text-right' },
    { fieldName: 'col17', header: '비고1', width: '220' },
    { fieldName: 'col18', header: '비고2', width: '220' },
    { fieldName: 'col19', header: '비고3', width: '220' },
    { fieldName: 'col20', header: '등록일', width: '196', styleName: 'text-right' },
    { fieldName: 'col21', header: '등록자', width: '131' },
    { fieldName: 'col22', header: '수정일', width: '196', styleName: 'text-right' },
    { fieldName: 'col23', header: '수정자', width: '131' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  data.setRows([
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
    { col1: 'A-전체', col2: 'A-전체', col3: 'ALL', col4: 'ALL', col5: 'A-전체', col6: '123456789', col7: '123456789', col8: '123456789', col9: '환경가전', col10: '샤워기', col11: '실내설치키트', col12: 'ALL', col13: '2-렌탈', col14: '3-예외허용', col15: '2022-05-20', col16: '2022-05-20', col17: '실내설치키트', col18: '실내설치키트', col19: '실내설치키트', col20: '2022-05-20', col21: 'ALL', col22: '2022-05-20', col23: 'ALL' },
  ]);
}
</script>
<style scoped>
</style>
