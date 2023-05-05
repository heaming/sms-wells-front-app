<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈', 'nav', '월별 활동 현황']" />
    </template>

    <kw-search>
      <kw-search-row>
        <kw-search-item
          label="관리년월"
          required
        >
          <kw-date-picker
            type="month"
            rules="required"
          />
        </kw-search-item>

        <kw-search-item
          label="조직유형"
        >
          <kw-option-group
            :model-value="'M영업조직'"
            type="radio"
            :options="['M영업조직', 'P영업조직']"
          />
        </kw-search-item>

        <kw-search-item
          label="직책구분"
          required
        >
          <kw-option-group
            :model-value="'판매자'"
            rules="required"
            type="radio"
            :options="['판매자', '지구장', '지점장']"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item label="조직레벨">
          <kw-select
            :model-value="[]"
            :options="['전체', 'B', 'C', 'D']"
          />
          <kw-select
            :model-value="[]"
            :options="['전체', 'B', 'C', 'D']"
          />
          <kw-select
            :model-value="[]"
            :options="['전체', 'B', 'C', 'D']"
          />
        </kw-search-item>
        <kw-search-item label="자격구분">
          <kw-select
            :model-value="[]"
            :options="['전체', 'B', 'C', 'D']"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :page-size="30"
            :page-size-options="[30,60,90,120]"
            :total-count="7"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          label="엑셀다운로드"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdRef"
        :visible-rows="5"
        @init="initGrid"
      />
      <kw-pagination
        :model-value="1"
        :total-count="100"
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
    { fieldName: 'col27' },

  ];

  const columns = [
    { fieldName: 'col1', header: '관리년월', width: '110', styleName: 'text-center' },
    { fieldName: 'col2', header: '소속', width: '110', styleName: 'text-center' },
    { fieldName: 'col3', header: '성명', width: '96', styleName: 'text-center' },
    { fieldName: 'col4', header: '번호', width: '110', styleName: 'text-center' },
    { fieldName: 'col5', header: '직급', width: '78', styleName: 'text-center' },
    { fieldName: 'col6', header: '성별', width: '78', styleName: 'text-center' },
    { fieldName: 'col7', header: '빌딩코드', width: '110', styleName: 'text-center' },
    { fieldName: 'col8', header: '빌딩명', width: '148', styleName: 'text-center' },
    { fieldName: 'col9', header: '리쿠르팅일자', width: '130', styleName: 'text-center' },
    { fieldName: 'col10', header: '위촉일자', width: '130', styleName: 'text-center' },
    { fieldName: 'col11', header: '최종해약일자', width: '136', styleName: 'text-center' },
    { fieldName: 'col12', header: '지점장번호', width: '122', styleName: 'text-center' },
    { fieldName: 'col13', header: '자격', width: '122', styleName: 'text-center' },

    { fieldName: 'col14', header: '순주문', width: '92', styleName: 'text-center' },
    { fieldName: 'col15', header: '접수전체', width: '106', styleName: 'text-center' },
    { fieldName: 'col16', header: '접수설치', width: '106', styleName: 'text-center' },
    { fieldName: 'col17', header: '순주문', width: '92', styleName: 'text-center' },
    { fieldName: 'col18', header: '접수전체', width: '106', styleName: 'text-center' },

    { fieldName: 'col19', header: '접수설치', width: '106', styleName: 'text-center' },

    { fieldName: 'col20', header: '인정건수', width: '106', styleName: 'text-center' },
    { fieldName: 'col21', header: '전체건수', width: '106', styleName: 'text-center' },
    { fieldName: 'col22', header: '일수', width: '106', styleName: 'text-center' },
    { fieldName: 'col23', header: '인정여부', width: '106', styleName: 'text-center' },
    { fieldName: 'col24', header: '플래너스타트업', width: '152', styleName: 'text-center' },
    { fieldName: 'col25', header: '수석플래너실전', width: '152', styleName: 'text-center' },
    { fieldName: 'col26', header: 'B/S계정', width: '104', styleName: 'text-center' },
    { fieldName: 'col27', header: '3개월이내재등록', width: '160', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.setColumnLayout([

    'col1',
    'col2',
    'col3',
    'col4',
    'col5',
    'col6',
    {
      header: '빌딩', // colspan title
      direction: 'horizontal', // merge type
      items: ['col7', 'col8'],
    },
    'col9',
    'col10',
    'col11',
    'col12',
    'col13',
    {
      header: '인정건수', // colspan title
      direction: 'horizontal', // merge type
      items: ['col14', 'col15', 'col16'],
    },
    {
      header: '전체건수', // colspan title
      direction: 'horizontal', // merge type
      items: ['col17', 'col18', 'col19'],
    },
    {
      header: '당월설치', // colspan title
      direction: 'horizontal', // merge type
      items: ['col20', 'col21'],
    },
    {
      header: '미팅현황', // colspan title
      direction: 'horizontal', // merge type
      items: ['col22', 'col23'],
    },
    {
      header: '교육수료현황', // colspan title
      direction: 'horizontal', // merge type
      items: ['col24', 'col25'],
    },
    'col26', 'col27',
  ]);

  data.setRows([
    { col1: '2022-09', col2: 'G080000', col3: '홍길동', col4: '1029102', col5: '15', col6: '여자', col7: '745', col8: '은평/대일 5층', col9: '2007-04-01', col10: '2007-04-01', col11: '-', col12: '0000000', col13: '헬스매니저', col14: '0', col15: '23.50', col16: '23.50', col17: '0', col18: '23.50', col19: '23.50', col20: '23.50', col21: '0', col22: '11', col23: 'N', col24: 'N', col25: 'N', col26: 'N', col27: 'N' },
    { col1: '2022-09', col2: 'G080000', col3: '홍길동', col4: '1029102', col5: '15', col6: '여자', col7: '745', col8: '은평/대일 5층', col9: '2007-04-01', col10: '2007-04-01', col11: '-', col12: '0000000', col13: '헬스매니저', col14: '0', col15: '23.50', col16: '23.50', col17: '0', col18: '23.50', col19: '23.50', col20: '23.50', col21: '0', col22: '11', col23: 'N', col24: 'N', col25: 'N', col26: 'N', col27: 'N' },
    { col1: '2022-09', col2: 'G080000', col3: '홍길동', col4: '1029102', col5: '15', col6: '여자', col7: '745', col8: '은평/대일 5층', col9: '2007-04-01', col10: '2007-04-01', col11: '-', col12: '0000000', col13: '헬스매니저', col14: '0', col15: '23.50', col16: '23.50', col17: '0', col18: '23.50', col19: '23.50', col20: '23.50', col21: '0', col22: '11', col23: 'N', col24: 'N', col25: 'N', col26: 'N', col27: 'N' },
    { col1: '2022-09', col2: 'G080000', col3: '홍길동', col4: '1029102', col5: '15', col6: '여자', col7: '745', col8: '은평/대일 5층', col9: '2007-04-01', col10: '2007-04-01', col11: '-', col12: '0000000', col13: '헬스매니저', col14: '0', col15: '23.50', col16: '23.50', col17: '0', col18: '23.50', col19: '23.50', col20: '23.50', col21: '0', col22: '11', col23: 'N', col24: 'N', col25: 'N', col26: 'N', col27: 'N' },
    { col1: '2022-09', col2: 'G080000', col3: '홍길동', col4: '1029102', col5: '15', col6: '여자', col7: '745', col8: '은평/대일 5층', col9: '2007-04-01', col10: '2007-04-01', col11: '-', col12: '0000000', col13: '헬스매니저', col14: '0', col15: '23.50', col16: '23.50', col17: '0', col18: '23.50', col19: '23.50', col20: '23.50', col21: '0', col22: '11', col23: 'N', col24: 'N', col25: 'N', col26: 'N', col27: 'N' },
  ]);
}

</script>

<style scoped>
</style>
