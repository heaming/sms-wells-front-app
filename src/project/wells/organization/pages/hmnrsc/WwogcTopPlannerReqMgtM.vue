<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈', 'nav', 'nav', '수석플래너 신청 관리']" />
    </template>

    <kw-search
      one-row
      :cols="2"
    >
      <kw-search-row>
        <kw-search-item
          label="신청년월"
          required
        >
          <kw-date-picker
            rules="required"
            type="month"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :page-size="10"
            :page-size-options="[10, 20, 30, 40]"
            :total-count="7"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          label="엑셀다운로드"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          label="등록시간통제"
          primary
          dense
        />
      </kw-action-top>

      <kw-grid
        ref="grdRef"
        :visible-rows="10"
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

  ];

  const columns = [
    { fieldName: 'col1', header: '총괄단', width: '92', styleName: 'text-center' },
    { fieldName: 'col2', header: '지역단', width: '106', styleName: 'text-center' },
    { fieldName: 'col3', header: '소속', width: '106', styleName: 'text-center' },
    { fieldName: 'col4', header: '빌딩명', width: '160', styleName: 'text-center' },
    { fieldName: 'col5', header: '번호', width: '134', styleName: 'text-center' },
    { fieldName: 'col6', header: '성명', width: '92', styleName: 'text-center' },
    { fieldName: 'col7', header: 'WM자격여부', width: '136', styleName: 'text-center' },
    { fieldName: 'col8', header: '누적건수인정시작월', width: '180', styleName: 'text-center' },
    { fieldName: 'col9', header: '누적건수', width: '106', styleName: 'text-center' },
    { fieldName: 'col10', header: '리쿠르팅일자', width: '130', styleName: 'text-center' },
    { fieldName: 'col11', header: '최종해약일자', width: '130', styleName: 'text-center' },
    { fieldName: 'col12', header: '개시일자', width: '130', styleName: 'text-center' },
    { fieldName: 'col13', header: '강등일자', width: '130', styleName: 'text-center' },
    { fieldName: 'col14', header: '수석플래너인정여부', width: '130', styleName: 'text-center' },
    { fieldName: 'col15', header: '신청여부', width: '106', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '경남', col2: '창원센터', col3: 'A000000', col4: '센트럴시티', col5: '0000000', col6: '홍길순', col7: 'Y', col8: '2019-09', col9: '000000', col10: '2019-09-25', col11: '2019-09-25', col12: '2019-09-25', col13: '2019-09-25', col14: 'Y', col15: '신청' },

  ]);
  view.setColumnLayout([

    {
      header: '소속',
      direction: 'horizontal',
      items: ['col1', 'col2', 'col3', 'col4'],
    },
    'col5',
    'col6',
    'col7',
    {
      header: '환경가전 실적',
      direction: 'horizontal',
      items: ['col8', 'col9'],
    },
    {
      header: '수석플래너 현황',
      direction: 'horizontal',
      items: ['col10', 'col11', 'col12'],
    },
    {
      header: '수석플래너 현황',
      direction: 'horizontal',
      items: ['col13'],
    },
    'col14',
    'col15',
  ]);
}
</script>

<style scoped>
</style>
