<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈','Depth1', 'Depth2','상조제휴주문 조회']" />
    </template>

    <kw-search>
      <kw-search-row>
        <kw-search-item
          label="실적년월"
          required
        >
          <kw-date-picker
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          label="실적구분"
          required
        >
          <kw-option-group
            :model-value="'접수'"
            type="radio"
            :options="['접수', '계약', '취소']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item label="제휴구분">
          <kw-option-group
            :model-value="'전체'"
            type="radio"
            :options="['전체','제휴', '비제휴']"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          label="직책유형"
          required
        >
          <kw-option-group
            :model-value="'전체'"
            type="radio"
            :options="['전체', '플래너', '지점장']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          label="조직레벨"
          :colspan="2"
        >
          <kw-select
            :model-value="[]"
            :options="['총괄단', 'B', 'C', 'D']"
          />
          <kw-select
            :model-value="[]"
            :options="['지역단', 'B', 'C', 'D']"
          />
          <kw-select
            :model-value="[]"
            :options="['지점', 'B', 'C', 'D']"
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
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="123456"
          />
          <span class="ml8">(단위:원)</span>
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
        :visible-rows="3"
        @init="initGrid"
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
    { fieldName: 'col1', header: '제휴구분', width: '91', styleName: 'text-center' },
    { fieldName: 'col2', header: 'Wells 계약번호', width: '138', styleName: 'text-center' },
    { fieldName: 'col3', header: '상조 계약번호', width: '138', styleName: 'text-center' },
    { fieldName: 'col4', header: '고객명', width: '111', styleName: 'text-left ' },
    { fieldName: 'col5', header: '소속', width: '104', styleName: 'text-center' },
    { fieldName: 'col6', header: '번호', width: '111', styleName: 'text-center' },
    { fieldName: 'col7', header: '성명', width: '111', styleName: 'text-left' },
    { fieldName: 'col8', header: '직책', width: '111', styleName: 'text-left' },

    { fieldName: 'col9', header: '지점장', width: '111', styleName: 'text-center ' },
    { fieldName: 'col10', header: '접수일', width: '111', styleName: 'text-center ' },
    { fieldName: 'col11', header: '계약일', width: '111', styleName: 'text-center ' },
    { fieldName: 'col12', header: '입금일', width: '111', styleName: 'text-center' },
    { fieldName: 'col13', header: '철회일', width: '111', styleName: 'text-center' },
    { fieldName: 'col14', header: '취소일', width: '111', styleName: 'text-center' },
    { fieldName: 'col15', header: '수수료월', width: '111', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '비제휴', col2: '2022-5559710', col3: '2022-5559710', col4: '김고객', col5: 'Q831234', col6: '1234567', col7: '김교원', col8: '플래너', col9: '1234567', col10: '2022-10-12', col11: '-', col12: '-', col13: '-', col14: '-', col15: '-' },
    { col1: '비제휴', col2: '2022-5559710', col3: '2022-5559710', col4: '김고객', col5: 'Q831234', col6: '1234567', col7: '김교원', col8: '플래너', col9: '1234567', col10: '2022-10-12', col11: '-', col12: '-', col13: '-', col14: '-', col15: '-' },
    { col1: '비제휴', col2: '2022-5559710', col3: '2022-5559710', col4: '김고객', col5: 'Q831234', col6: '1234567', col7: '김교원', col8: '플래너', col9: '1234567', col10: '2022-10-12', col11: '-', col12: '-', col13: '-', col14: '-', col15: '-' },
  ]);
}
</script>
