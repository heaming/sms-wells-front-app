<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈','판매','계약관리', '대량 접수자료 업로드']"
      />
    </template>
    <!-- To.개발 kw-tab-panel안에 kw-search로 시작하는 경우 kw-tabs에 .form-border 제거 / 그 외 추가 -->
    <kw-tabs
      model-value="2"
    >
      <kw-tab
        name="1"
        label="접수-렌탈"
      />
      <kw-tab
        name="2"
        label="접수-일시불"
      />
      <kw-tab
        name="3"
        label="설치처"
      />
    </kw-tabs>
    <kw-tab-panels
      model-value="2"
    >
      <kw-tab-panel name="2">
        <kw-search :cols="4">
          <kw-search-row>
            <kw-search-item
              label="조회기간"
              required
              :colspan="2"
            >
              <kw-select
                class="w187"
                :model-value="[]"
                :options="['등록일', 'B', 'C', 'D']"
                rules="required"
              />
              <kw-date-range-picker
                rules="date_range_required|date_range_months:1"
              />
            </kw-search-item>
            <kw-search-item
              label="제휴코드"
              :colspan="1"
            >
              <kw-select
                :model-value="[]"
                :options="['주소', 'B', 'C', 'D']"
              />
            </kw-search-item>
            <kw-search-item
              label="할인유형"
              :colspan="1"
            >
              <kw-select
                :model-value="[]"
                :options="['주소', 'B', 'C', 'D']"
              />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-search-item
              label="상품분류"
              :colspan="2"
            >
              <kw-select
                :model-value="[]"
                :options="['대분류 전체', 'B', 'C', 'D']"
              />
              <kw-select
                :model-value="[]"
                :options="['중분류 전체', 'B', 'C', 'D']"
              />
            </kw-search-item>
            <kw-search-item
              label="상품코드"
              :colspan="1"
            >
              <kw-input />
            </kw-search-item>
            <kw-search-item
              label="상품명"
              :colspan="1"
            >
              <kw-input />
            </kw-search-item>
          </kw-search-row>
        </kw-search>
        <div class="result-area">
          <kw-action-top>
            <template #left>
              <kw-paging-info
                :total-count="7"
              />
              <span class="ml8">(단위:원)</span>
            </template>

            <kw-btn
              icon="upload_on"
              dense
              secondary
              label="대량 접수자료 업로드"
            />
          </kw-action-top>

          <kw-grid
            :visible-rows="1"
            @init="initGrid"
          />

          <h3>일시불 가격기준표 정보</h3>
          <kw-action-top>
            <template #left>
              <kw-paging-info
                :total-count="156"
              />
              <span class="ml8">(단위:원)</span>
            </template>
          </kw-action-top>

          <kw-grid
            :visible-rows="1"
            @init="initGrid1"
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
    { fieldName: 'col26' },
  ];

  const columns = [
    { fieldName: 'col1', header: '등록파일', width: '133', styleName: 'text-center' },
    { fieldName: 'col2', header: '등록일', width: '146', styleName: 'text-center' },
    { fieldName: 'col3', header: '등록자', width: '146', styleName: 'text-center' },
    { fieldName: 'col4', header: '등록자사번', width: '134', styleName: 'text-center' },
    { fieldName: 'col5', header: '구분1', width: '111', styleName: 'text-center' },
    { fieldName: 'col6', header: '구분2', width: '125', styleName: 'text-center' },
    { fieldName: 'col7', header: '상품코드', width: '125', styleName: 'text-center' },
    { fieldName: 'col8', header: '할인유형', width: '282', styleName: 'text-left' },
    { fieldName: 'col9', header: '무상멤버', width: '125', styleName: 'text-center' },
    { fieldName: 'col10', header: '무상A/S', width: '125', styleName: 'text-center' },

    { fieldName: 'col11', header: '프로모션', width: '282', styleName: 'text-left' },
    { fieldName: 'col12', header: 'BS주기', width: '125', styleName: 'text-center' },
    { fieldName: 'col13', header: '용도구분', width: '125', styleName: 'text-center' },
    { fieldName: 'col14', header: '제휴코드', width: '260', styleName: 'text-left' },
    { fieldName: 'col15', header: '제휴수수료', width: '125', styleName: 'text-right' },
    { fieldName: 'col16', header: '고객번호', width: '125', styleName: 'text-center' },
    { fieldName: 'col17', header: '매출일자 구분', width: '125', styleName: 'text-center' },
    { fieldName: 'col18', header: '상품일자 구분', width: '125', styleName: 'text-center' },
    { fieldName: 'col19', header: '구분', width: '125', styleName: 'text-center' },
    { fieldName: 'col20', header: '대리인코드', width: '125', styleName: 'text-center' },

    { fieldName: 'col21', header: '등록담당', width: '125', styleName: 'text-center' },
    { fieldName: 'col22', header: '사은품1', width: '125', styleName: 'text-center' },
    { fieldName: 'col23', header: '사은품2', width: '125', styleName: 'text-center' },
    { fieldName: 'col24', header: '사은품3', width: '125', styleName: 'text-center' },
    { fieldName: 'col25', header: '사은품4', width: '125', styleName: 'text-center' },
    { fieldName: 'col26', header: '사은품5', width: '125', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '다운로드', col2: '2022-10-10', col3: '김교원', col4: '1602591', col5: 'BW', col6: '16', col7: '3020', col8: '36. 무상멤버십 3년', col9: '36', col10: '36', col11: '30. 미가입(3년무상(약정할인))', col12: '3', col13: '0.공통', col14: '05. 이지엘(21)', col15: '0', col16: '123456789', col17: 'M', col18: '3', col19: '3', col20: '1234567', col21: '3', col22: '1234', col23: '1234', col24: '1234', col25: '1234', col26: '1234' },
  ]);
}

function initGrid1(data, view) {
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
    { fieldName: 'col1', header: '업무구분', width: '271', styleName: 'text-left' },
    { fieldName: 'col2', header: '고객번호', width: '126', styleName: 'text-center' },
    { fieldName: 'col3', header: '파트너사번', width: '128', styleName: 'text-center' },
    { fieldName: 'col4', header: '주문년도', width: '126', styleName: 'text-center' },
    { fieldName: 'col5', header: '제한구분', width: '127', styleName: 'text-center' },
    { fieldName: 'col6', header: '메모', width: '207', styleName: 'text-left' },
    { fieldName: 'col7', header: '적용시작일', width: '127', styleName: 'text-center' },
    { fieldName: 'col8', header: '적용종료일', width: '126', styleName: 'text-center' },
    { fieldName: 'col9', header: '등록자', width: '128', styleName: 'text-center' },
    { fieldName: 'col10', header: '수정자', width: '126', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '1. 총판 타조직 고객 접수 제한', col2: '040158344', col3: '1602591', col4: '2022', col5: '허용', col6: '타 주소지 추가 접수건', col7: '2022-07-01', col8: '2022-07-20', col9: '김교원', col10: '김교원' },
  ]);
}
</script>
