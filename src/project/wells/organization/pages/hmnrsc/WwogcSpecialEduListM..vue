<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈' , 'nav' , 'nav' , '특별교육 확인현황']"
      />
    </template>
    <kw-search :cols="2">
      <kw-search-row>
        <kw-search-item label="유형">
          <kw-option-group
            :model-value="'전체'"
            type="radio"
            :options="['전체', '동의', '미동의']"
          />
        </kw-search-item>
        <kw-search-item label="조직유형">
          <kw-select
            :model-value="[]"
            :options="['A', 'B', 'C', 'D']"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          label="조직레벨"
          required
        >
          <kw-select
            :model-value="[]"
            :options="['A', 'B', 'C', 'D']"
            rules="required"
          />
          <kw-select
            :model-value="[]"
            :options="['A', 'B', 'C', 'D']"
            rules="required"
          />
          <kw-select
            :model-value="[]"
            :options="['A', 'B', 'C', 'D']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item label="리쿠르팅일자">
          <kw-date-range-picker
            rules="date_range_months:1"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          label="번호"
        >
          <kw-input
            icon="search"
            clearable
          />
          <kw-input />
        </kw-search-item>
        <kw-search-item label="대상직책">
          <kw-select
            :model-value="[]"
            :options="['A', 'B', 'C', 'D']"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :colspan="2"
          label="과정명"
        >
          <kw-option-group
            :model-value="[]"
            class="kw-option-group--multi-line"
            type="checkbox"
            :options="['비정도 영업 조치규정의...', '정도영업의 이해(개정)', '에듀플래너 활동 계약서', '21년 개정된 비정도영...',
                       '올바른 계약서 작성법', '반듯이 알아야 할 개인...', '올바른 조직문화 만들기', '바른 영업의 실천', '정도영업의 이해', 'R.D.S. 중간정산 동의서']"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="1758" />
        </template>
      </kw-action-top>
      <kw-grid
        :visible-rows="2"
        @init="initGrid"
      />
      <kw-action-top class="mt30">
        <template #left>
          <kw-paging-info :total-count="7" />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          label="엑셀 다운로드"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        :visible-rows="10"
        @init="initGrid2"
      />
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
  ];

  const columns = [
    { fieldName: 'col1', header: '과정명', width: '96', styleName: 'text-center' },
    { fieldName: 'col2', header: '비정도 영업 조치규정의...', width: '204', styleName: 'text-center' },
    { fieldName: 'col3', header: '정도영업의 이해(개정)', width: '204', styleName: 'text-center' },
    { fieldName: 'col4', header: '에듀플래너 활동 계약서', width: '204', styleName: 'text-center' },
    { fieldName: 'col5', header: '21년 개정된 비정도영...', width: '204', styleName: 'text-center' },
    { fieldName: 'col6', header: '올바른 계약서 작성법', width: '204', styleName: 'text-center' },
    { fieldName: 'col7', header: '반듯이 알아야 할 개인...', width: '204', styleName: 'text-center' },
    { fieldName: 'col8', header: '올바른 조직문화 만들기', width: '204', styleName: 'text-center' },
    { fieldName: 'col9', header: '바른 영업의 실천', width: '204', styleName: 'text-center' },
    { fieldName: 'col10', header: '정도영업의 이해', width: '204', styleName: 'text-center' },
    { fieldName: 'col11', header: 'R.D.S. 중간정산 동의서', width: '204', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  data.setRows([
    { col1: '동의', col2: '435', col3: '435', col4: '435', col5: '435', col6: '435', col7: '435', col8: '435', col9: '435', col10: '435', col11: '1,757' },
    { col1: '비중', col2: '24.7%', col3: '24.7%', col4: '24.7%', col5: '24.7%', col6: '24.7%', col7: '24.7%', col8: '24.7%', col9: '24.7%', col10: '24.7%', col11: '24.7%' },
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
  ];

  const columns = [
    { fieldName: 'col1', header: '사업단', width: '96', styleName: 'text-center' },
    { fieldName: 'col2', header: '총괄단', width: '96', styleName: 'text-center' },
    { fieldName: 'col3', header: '센터', width: '132', styleName: 'text-center' },
    { fieldName: 'col4', header: '소속', width: '110', styleName: 'text-center' },
    { fieldName: 'col5', header: '성명', width: '96', styleName: 'text-center' },
    { fieldName: 'col6', header: '번호', width: '96', styleName: 'text-center' },
    { fieldName: 'col7', header: '대상직책', width: '110', styleName: 'text-center' },
    { fieldName: 'col8', header: '과정명', width: '200' },
    { fieldName: 'col9', header: '현황', width: '140', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '중부', col2: '강남', col3: '강남센터', col4: 'A000000', col5: '홍길동', col6: '0000000', col7: '총괄단장', col8: '정도 영업의 이해', col9: '완료 / 보기' },
    { col1: '중부', col2: '강남', col3: '강남센터', col4: 'A000000', col5: '홍길동', col6: '0000000', col7: '총괄단장', col8: '정도 영업의 이해', col9: '완료 / 보기' },
    { col1: '중부', col2: '강남', col3: '강남센터', col4: 'A000000', col5: '홍길동', col6: '0000000', col7: '총괄단장', col8: '정도 영업의 이해', col9: '완료 / 보기' },
    { col1: '중부', col2: '강남', col3: '강남센터', col4: 'A000000', col5: '홍길동', col6: '0000000', col7: '총괄단장', col8: '정도 영업의 이해', col9: '완료 / 보기' },
    { col1: '중부', col2: '강남', col3: '강남센터', col4: 'A000000', col5: '홍길동', col6: '0000000', col7: '총괄단장', col8: '정도 영업의 이해', col9: '완료 / 보기' },
    { col1: '중부', col2: '강남', col3: '강남센터', col4: 'A000000', col5: '홍길동', col6: '0000000', col7: '총괄단장', col8: '정도 영업의 이해', col9: '완료 / 보기' },
    { col1: '중부', col2: '강남', col3: '강남센터', col4: 'A000000', col5: '홍길동', col6: '0000000', col7: '총괄단장', col8: '정도 영업의 이해', col9: '완료 / 보기' },
    { col1: '중부', col2: '강남', col3: '강남센터', col4: 'A000000', col5: '홍길동', col6: '0000000', col7: '총괄단장', col8: '정도 영업의 이해', col9: '완료 / 보기' },
    { col1: '중부', col2: '강남', col3: '강남센터', col4: 'A000000', col5: '홍길동', col6: '0000000', col7: '총괄단장', col8: '정도 영업의 이해', col9: '완료 / 보기' },
    { col1: '중부', col2: '강남', col3: '강남센터', col4: 'A000000', col5: '홍길동', col6: '0000000', col7: '총괄단장', col8: '정도 영업의 이해', col9: '완료 / 보기' },
  ]);
}
</script>
