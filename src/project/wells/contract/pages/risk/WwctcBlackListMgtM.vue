<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈','판매관리','리스크관리', '접수제한관리']"
      />
    </template>
    <kw-tabs
      model-value="5"
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
      model-value="5"
    >
      <kw-tab-panel name="5">
        <kw-search>
          <kw-search-row>
            <kw-search-item label="교원키">
              <kw-input icon="search_24" />
            </kw-search-item>
            <kw-search-item label="고객번호">
              <kw-input />
            </kw-search-item>
            <kw-search-item label="고객명">
              <kw-input />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-search-item label="주소/우편번호">
              <kw-select
                class="w103"
                :model-value="[]"
                :options="['주소', 'B', 'C', 'D']"
              />
              <kw-input />
            </kw-search-item>
            <kw-search-item label="전화번호">
              <kw-input />
            </kw-search-item>
            <kw-search-item label="판매자정보">
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
              dense
              secondary
              label="엑셀다운로드"
              @click="onClickExcelDownload"
            />
          </kw-action-top>

          <kw-grid
            :visible-rows="10"
            @init="initGrid4"
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
            <kw-separator
              vertical
              inset
              spaced
            />
            <kw-btn
              label="해제취소"
              grid-action
            />
          </kw-action-bottom>
        </div>
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>

<script setup>

function initGrid4(data, view) {
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
    { fieldName: 'col24' },
    { fieldName: 'col25' },

  ];

  const columns = [
    { fieldName: 'col1', header: '대상구분', width: '142' },
    { fieldName: 'col2', header: '고객번호', width: '180' },
    { fieldName: 'col3', header: '등록사유', width: '239' },
    { fieldName: 'col4', header: '교원키', width: '180' },
    { fieldName: 'col5', header: '고객명', width: '180' },
    { fieldName: 'col6', header: '생년월일/사업자번호', width: '180' },
    { fieldName: 'col7', header: '휴대전화', width: '180' },
    { fieldName: 'col8', header: '전화번호', width: '180' },
    { fieldName: 'col9', header: '우편번호', width: '126' },
    { fieldName: 'col10', header: '주소', width: '254', styleName: 'text-center' },
    { fieldName: 'col11', header: '고객명', width: '180' },
    { fieldName: 'col12', header: '휴대전화', width: '180' },
    { fieldName: 'col13', header: '전화번호', width: '180' },
    { fieldName: 'col14', header: '우편번호', width: '126' },
    { fieldName: 'col15', header: '주소', width: '254', styleName: 'text-center' },
    { fieldName: 'col16', header: '소속지점', width: '180' },
    { fieldName: 'col17', header: '판매자명', width: '180' },
    { fieldName: 'col18', header: '판매자사번', width: '180' },
    { fieldName: 'col19', header: '전화번호', width: '180' },
    { fieldName: 'col20', header: '입력일시', width: '169' },
    { fieldName: 'col21', header: '입력자', width: '131', styleName: 'text-center' },
    { fieldName: 'col22', header: '수정일시', width: '169' },
    { fieldName: 'col23', header: '수정자', width: '131', styleName: 'text-center' },
    { fieldName: 'col24', header: '삭제일시', width: '169' },
    { fieldName: 'col25', header: '삭제자', width: '131', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'col1', 'col2', 'col3', 'col4', // single
    {
      header: '계약정보', // colspan title
      direction: 'horizontal', // merge type
      items: ['col5', 'col6', 'col7', 'col8', 'col9', 'col10'],
    },
    {
      header: '설치정보',
      direction: 'horizontal',
      items: ['col11', 'col12', 'col13', 'col14', 'col15'],
    },
    {
      header: '판매자정보',
      direction: 'horizontal',
      items: ['col16', 'col17', 'col18', 'col19'],
    },
    {
      header: '등록정보', // colspan title
      direction: 'horizontal', // merge type
      items: ['col20', 'col21', 'col22', 'col23', 'col24', 'col25'],
    },

  ]);

  data.setRows([{ col1: '렌탈', col2: '고객번호 입력', col3: '', col4: '', col5: '', col6: '', col7: '', col8: '', col9: '', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '', col16: '', col17: '', col18: '', col19: '', col20: '2022-05-03', col21: '', col22: '2022-05-03', col23: '', col24: '2022-05-03', col25: '' },
    { col1: '렌탈', col2: '1234-1234567', col3: '판매자 불완전 판매 의심건수', col4: '123456789', col5: '123456789', col6: '123456789', col7: '010-****-1234', col8: '010-****-1234', col9: '12345', col10: '서울 중구 을지로 교원빌등...', col11: '123456789', col12: '010-****-1234', col13: '010-****-1234', col14: '12345', col15: '서울 중구 을지로 교원빌등...', col16: '123456789', col17: '123456789', col18: '123456789', col19: '010-****-1234', col20: '2022-05-20', col21: '123456', col22: '2022-05-20', col23: '123456', col24: '2022-05-20', col25: '123456' },
    { col1: '렌탈', col2: '1234-1234567', col3: '판매자 불완전 판매 의심건수', col4: '123456789', col5: '123456789', col6: '123456789', col7: '010-****-1234', col8: '010-****-1234', col9: '12345', col10: '서울 중구 을지로 교원빌등...', col11: '123456789', col12: '010-****-1234', col13: '010-****-1234', col14: '12345', col15: '서울 중구 을지로 교원빌등...', col16: '123456789', col17: '123456789', col18: '123456789', col19: '010-****-1234', col20: '2022-05-20', col21: '123456', col22: '2022-05-20', col23: '123456', col24: '2022-05-20', col25: '123456' },
    { col1: '렌탈', col2: '1234-1234567', col3: '판매자 불완전 판매 의심건수', col4: '123456789', col5: '123456789', col6: '123456789', col7: '010-****-1234', col8: '010-****-1234', col9: '12345', col10: '서울 중구 을지로 교원빌등...', col11: '123456789', col12: '010-****-1234', col13: '010-****-1234', col14: '12345', col15: '서울 중구 을지로 교원빌등...', col16: '123456789', col17: '123456789', col18: '123456789', col19: '010-****-1234', col20: '2022-05-20', col21: '123456', col22: '2022-05-20', col23: '123456', col24: '2022-05-20', col25: '123456' },
    { col1: '렌탈', col2: '1234-1234567', col3: '판매자 불완전 판매 의심건수', col4: '123456789', col5: '123456789', col6: '123456789', col7: '010-****-1234', col8: '010-****-1234', col9: '12345', col10: '서울 중구 을지로 교원빌등...', col11: '123456789', col12: '010-****-1234', col13: '010-****-1234', col14: '12345', col15: '서울 중구 을지로 교원빌등...', col16: '123456789', col17: '123456789', col18: '123456789', col19: '010-****-1234', col20: '2022-05-20', col21: '123456', col22: '2022-05-20', col23: '123456', col24: '2022-05-20', col25: '123456' },
    { col1: '렌탈', col2: '1234-1234567', col3: '판매자 불완전 판매 의심건수', col4: '123456789', col5: '123456789', col6: '123456789', col7: '010-****-1234', col8: '010-****-1234', col9: '12345', col10: '서울 중구 을지로 교원빌등...', col11: '123456789', col12: '010-****-1234', col13: '010-****-1234', col14: '12345', col15: '서울 중구 을지로 교원빌등...', col16: '123456789', col17: '123456789', col18: '123456789', col19: '010-****-1234', col20: '2022-05-20', col21: '123456', col22: '2022-05-20', col23: '123456', col24: '2022-05-20', col25: '123456' },
    { col1: '렌탈', col2: '1234-1234567', col3: '판매자 불완전 판매 의심건수', col4: '123456789', col5: '123456789', col6: '123456789', col7: '010-****-1234', col8: '010-****-1234', col9: '12345', col10: '서울 중구 을지로 교원빌등...', col11: '123456789', col12: '010-****-1234', col13: '010-****-1234', col14: '12345', col15: '서울 중구 을지로 교원빌등...', col16: '123456789', col17: '123456789', col18: '123456789', col19: '010-****-1234', col20: '2022-05-20', col21: '123456', col22: '2022-05-20', col23: '123456', col24: '2022-05-20', col25: '123456' },
    { col1: '렌탈', col2: '1234-1234567', col3: '판매자 불완전 판매 의심건수', col4: '123456789', col5: '123456789', col6: '123456789', col7: '010-****-1234', col8: '010-****-1234', col9: '12345', col10: '서울 중구 을지로 교원빌등...', col11: '123456789', col12: '010-****-1234', col13: '010-****-1234', col14: '12345', col15: '서울 중구 을지로 교원빌등...', col16: '123456789', col17: '123456789', col18: '123456789', col19: '010-****-1234', col20: '2022-05-20', col21: '123456', col22: '2022-05-20', col23: '123456', col24: '2022-05-20', col25: '123456' },
    { col1: '렌탈', col2: '1234-1234567', col3: '판매자 불완전 판매 의심건수', col4: '123456789', col5: '123456789', col6: '123456789', col7: '010-****-1234', col8: '010-****-1234', col9: '12345', col10: '서울 중구 을지로 교원빌등...', col11: '123456789', col12: '010-****-1234', col13: '010-****-1234', col14: '12345', col15: '서울 중구 을지로 교원빌등...', col16: '123456789', col17: '123456789', col18: '123456789', col19: '010-****-1234', col20: '2022-05-20', col21: '123456', col22: '2022-05-20', col23: '123456', col24: '2022-05-20', col25: '123456' },
    { col1: '렌탈', col2: '1234-1234567', col3: '판매자 불완전 판매 의심건수', col4: '123456789', col5: '123456789', col6: '123456789', col7: '010-****-1234', col8: '010-****-1234', col9: '12345', col10: '서울 중구 을지로 교원빌등...', col11: '123456789', col12: '010-****-1234', col13: '010-****-1234', col14: '12345', col15: '서울 중구 을지로 교원빌등...', col16: '123456789', col17: '123456789', col18: '123456789', col19: '010-****-1234', col20: '2022-05-20', col21: '123456', col22: '2022-05-20', col23: '123456', col24: '2022-05-20', col25: '123456' },
  ]);
}

</script>
