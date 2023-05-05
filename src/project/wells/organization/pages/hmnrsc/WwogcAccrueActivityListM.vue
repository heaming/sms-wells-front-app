<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈', 'nav', 'nav', '누적활동 현황']" />
    </template>

    <kw-search>
      <kw-search-row>
        <kw-search-item
          label="관리년월"
          required
        >
          <kw-date-picker
            rules="required"
            type="month"
          />
        </kw-search-item>

        <kw-search-item label="조직유형">
          <kw-option-group
            :model-value="'M영업조직'"
            type="radio"
            :options="['M영업조직', 'P영업조직']"
          />
        </kw-search-item>
        <kw-search-item
          label="자격구분"
          required
        >
          <kw-select
            :model-value="''"
            :options="['전체', 'B', 'C', 'D']"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item label="실적구분">
          <kw-option-group
            :model-value="'전체'"
            type="radio"
            :options="['전체', '수당건수', '설치기준']"
          />
        </kw-search-item>
        <kw-search-item label="번호">
          <kw-input
            icon="search"
            clearable
          />

          <kw-input />
        </kw-search-item>
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
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :page-size="30"
            :page-size-options="[30,60,90,120]"
            :total-count="4128"
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
        :visible-rows="4"
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
    { fieldName: 'col28' },
    { fieldName: 'col29' },

  ];

  const columns = [
    { fieldName: 'col1', header: '총괄단', width: '92', styleName: 'text-center' },
    { fieldName: 'col2', header: '지역단', width: '106', styleName: 'text-center' },
    { fieldName: 'col3', header: '소속', width: '110', styleName: 'text-center' },
    { fieldName: 'col4', header: '빌딩명', width: '148', styleName: 'text-center' },
    { fieldName: 'col5', header: '성명', width: '96', styleName: 'text-center' },
    { fieldName: 'col6', header: '번호', width: '122', styleName: 'text-center' },
    { fieldName: 'col7', header: '자격', width: '122', styleName: 'text-center' },

    { fieldName: 'col8', header: '최초등록', width: '136', styleName: 'text-center' },
    { fieldName: 'col9', header: '최종해약', width: '136', styleName: 'text-center' },
    { fieldName: 'col10', header: '재등록', width: '136', styleName: 'text-center' },
    { fieldName: 'col11', header: '최초개시', width: '136', styleName: 'text-center' },
    { fieldName: 'col12', header: '최종해약', width: '134', styleName: 'text-center' },

    { fieldName: 'col13', header: '재개시', width: '136', styleName: 'text-center' },
    { fieldName: 'col14', header: '최초개시', width: '136', styleName: 'text-center' },
    { fieldName: 'col15', header: '최종해약', width: '136', styleName: 'text-center' },
    { fieldName: 'col16', header: '강등', width: '136', styleName: 'text-center' },
    { fieldName: 'col17', header: '해약', width: '136', styleName: 'text-center' },
    { fieldName: 'col18', header: '번호', width: '110', styleName: 'text-center' },
    { fieldName: 'col19', header: '성명', width: '96', styleName: 'text-center' },
    { fieldName: 'col20', header: '누적건수', width: '128', styleName: 'text-center' },
    { fieldName: 'col21', header: '직전3개월(평균)', width: '158', styleName: 'text-center' },
    { fieldName: 'col22', header: '직전3개월', width: '120', styleName: 'text-center' },
    { fieldName: 'col23', header: '당월', width: '128', styleName: 'text-center' },
    { fieldName: 'col24', header: '승급건수', width: '120', styleName: 'text-center' },

    { fieldName: 'col25', header: '스타트업', width: '136', styleName: 'text-center' },
    { fieldName: 'col26', header: '플래너 스타트업', width: '154', styleName: 'text-center' },
    { fieldName: 'col27', header: '인원', width: '78', styleName: 'text-center' },
    { fieldName: 'col28', header: '전월실동', width: '106', styleName: 'text-center' },
    { fieldName: 'col29', header: '당월실동', width: '106', styleName: 'text-center' },
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
    'col7',
    {
      header: '업무등록현황', // colspan title
      direction: 'horizontal', // merge type
      items: ['col8', 'col9', 'col10'],
    },
    {
      header: '웰스매니저 현황', // colspan title
      direction: 'horizontal', // merge type
      items: ['col11', 'col12'],
    },
    {
      header: '웰스매니저 현황', // colspan title
      direction: 'horizontal', // merge type
      items: ['col13'],
    },
    {
      header: '수석플래너 현황', // colspan title
      direction: 'horizontal', // merge type
      items: ['col14', 'col15', 'col16', 'col17'],
    },
    {
      header: '수석플래너 신청자', // colspan title
      direction: 'horizontal', // merge type
      items: ['col18', 'col19'],
    },
    {
      header: '환경가전 실적', // colspan title
      direction: 'horizontal', // merge type
      items: ['col20', 'col21', 'col22', 'col23', 'col24'],
    },
    {
      header: '교육현황', // colspan title
      direction: 'horizontal', // merge type
      items: ['col25', 'col26'],
    },
    {
      header: '채용현황', // colspan title
      direction: 'horizontal', // merge type
      items: ['col27', 'col28', 'col29'],
    },
  ]);

  data.setRows([
    { col1: '서부', col2: '마포지역', col3: 'A029102', col4: '은평/대일 5층', col5: '홍길동', col6: '0000000', col7: '웰스매니저', col8: '2011-05-11', col9: '2011-05-11', col10: '2011-05-11', col11: '2011-05-11', col12: '2011-05-11', col13: '2011-05-11', col14: '2011-05-11', col15: '2011-05-11', col16: '2011-05-11', col17: '2011-05-11', col18: '0000000', col19: '홍길순', col20: '0', col21: '0', col22: '0', col23: '0', col24: '0', col25: '2021-01', col26: '2021-01', col27: '0', col28: '0', col29: '0' },
    { col1: '서부', col2: '마포지역', col3: 'A029102', col4: '은평/대일 5층', col5: '홍길동', col6: '0000000', col7: '웰스매니저', col8: '2011-05-11', col9: '2011-05-11', col10: '2011-05-11', col11: '2011-05-11', col12: '2011-05-11', col13: '2011-05-11', col14: '2011-05-11', col15: '2011-05-11', col16: '2011-05-11', col17: '2011-05-11', col18: '0000000', col19: '홍길순', col20: '0', col21: '0', col22: '0', col23: '0', col24: '0', col25: '2021-01', col26: '2021-01', col27: '0', col28: '0', col29: '0' },
    { col1: '서부', col2: '마포지역', col3: 'A029102', col4: '은평/대일 5층', col5: '홍길동', col6: '0000000', col7: '웰스매니저', col8: '2011-05-11', col9: '2011-05-11', col10: '2011-05-11', col11: '2011-05-11', col12: '2011-05-11', col13: '2011-05-11', col14: '2011-05-11', col15: '2011-05-11', col16: '2011-05-11', col17: '2011-05-11', col18: '0000000', col19: '홍길순', col20: '0', col21: '0', col22: '0', col23: '0', col24: '0', col25: '2021-01', col26: '2021-01', col27: '0', col28: '0', col29: '0' },
    { col1: '서부', col2: '마포지역', col3: 'A029102', col4: '은평/대일 5층', col5: '홍길동', col6: '0000000', col7: '웰스매니저', col8: '2011-05-11', col9: '2011-05-11', col10: '2011-05-11', col11: '2011-05-11', col12: '2011-05-11', col13: '2011-05-11', col14: '2011-05-11', col15: '2011-05-11', col16: '2011-05-11', col17: '2011-05-11', col18: '0000000', col19: '홍길순', col20: '0', col21: '0', col22: '0', col23: '0', col24: '0', col25: '2021-01', col26: '2021-01', col27: '0', col28: '0', col29: '0' },
  ]);
}

</script>

<style scoped>
</style>
