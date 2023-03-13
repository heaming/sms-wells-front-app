<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈','Depth1','Depth2','상조 수수료 관리']" />
    </template>

    <kw-search>
      <kw-search-row>
        <kw-search-item
          label="실적년월"
          required
        >
          <kw-date-picker type="month" />
        </kw-search-item>

        <kw-search-item
          label="구분"
        >
          <kw-option-group
            model-value="개인"
            type="radio"
            :options="[ '개인','조직']"
          />
        </kw-search-item>

        <kw-form-item
          label="계약일자"
        >
          <kw-date-range-picker
            rules="date_range_months:1"
          />
        </kw-form-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          label="상품명"
        >
          <kw-option-group
            model-value="전체"
            type="radio"
            :options="[ '전체','429','599']"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="123456" />
          <span class="ml8">(단위 :원)</span>
        </template>

        <kw-btn
          icon="download_on"
          dense
          secondary
          label="엑셀다운로드"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          label="수수료 생성"
          primary=""
          dense
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
  ];

  const columns = [
    { fieldName: 'col1', header: '발생월', width: '103.8', styleName: 'text-center' },
    { fieldName: 'col2', header: '수수료 구분', width: '110.8', styleName: 'text-' },
    { fieldName: 'col3', header: '총괄단', width: '110.8', styleName: 'text-' },
    { fieldName: 'col4', header: '지역단', width: '110.8', styleName: 'text-' },
    { fieldName: 'col5', header: '지점', width: '110.8', styleName: 'text-' },
    { fieldName: 'col6', header: '판매자 번호', width: '110.8', styleName: 'text-center' },
    { fieldName: 'col7', header: '성명', width: '110.8', styleName: 'text-' },
    { fieldName: 'col8', header: '직책', width: '110.8', styleName: 'text-' },
    { fieldName: 'col9', header: '지점장 번호', width: '110.8', styleName: 'text-center' },
    { fieldName: 'col10', header: 'Wells 계약번호', width: '137.6', styleName: 'text-center' },
    { fieldName: 'col11', header: 'Wells 상품명', width: '230.7', styleName: 'text-' },
    { fieldName: 'col12', header: '설치일', width: '110.8', styleName: 'text-center' },

    { fieldName: 'col13', header: '상조 계약번호', width: '137.6', styleName: 'text-center' },
    { fieldName: 'col14', header: '상조 상품명', width: '110.8', styleName: 'text-center' },
    { fieldName: 'col15', header: '접수일', width: '110.8', styleName: 'text-center' },
    { fieldName: 'col16', header: '계약일 (1회출금일)', width: '162.4', styleName: 'text-center' },
    { fieldName: 'col17', header: '취소일', width: '110.8', styleName: 'text-center' },
    { fieldName: 'col18', header: '판매자 수수료', width: '156.6', styleName: 'text-right' },
    { fieldName: 'col19', header: '총 지급대상', width: '112.3', styleName: 'text-right' },
    { fieldName: 'col20', header: '회차', width: '81.1', styleName: 'text-right' },
    { fieldName: 'col21', header: '누적발생 매출', width: '156.6', styleName: 'text-right' },
    { fieldName: 'col22', header: '누적입금', width: '156.6', styleName: 'text-right' },
    { fieldName: 'col23', header: '완납 회차', width: '81.1', styleName: 'text-right' },
    { fieldName: 'col24', header: '기지급', width: '126.7', styleName: 'text-right' },

    { fieldName: 'col25', header: '당월지급', width: '126.7', styleName: 'text-right' },
    { fieldName: 'col26', header: '라이프 확정', width: '126.7', styleName: 'text-center' },
    { fieldName: 'col27', header: '수수료 지급월', width: '186', styleName: 'text-center' },
    { fieldName: 'col28', header: '수수료 되물림월', width: '186', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2022-10', col2: '수수료', col3: 'OO총괄단', col4: 'OO지역단', col5: '김웰스 지점', col6: '1234567', col7: '김교원', col8: '플래너', col9: '1234567', col10: '2022-5559710', col11: '김치냉장고4Door', col12: '2022-10-12', col13: '2022-5559710', col14: '599', col15: '2022-10-12', col16: '2022-10-12', col17: '2022-10-12', col18: '12,345', col19: '12', col20: '1', col21: '12,345', col22: '12,345', col23: '1', col24: '12,345', col25: '12,345', col26: 'Y', col27: '2022-10', col28: '2022-10' },
    { col1: '2022-10', col2: '수수료', col3: 'OO총괄단', col4: 'OO지역단', col5: '김웰스 지점', col6: '1234567', col7: '김교원', col8: '플래너', col9: '1234567', col10: '2022-5559710', col11: '김치냉장고4Door', col12: '2022-10-12', col13: '2022-5559710', col14: '599', col15: '2022-10-12', col16: '2022-10-12', col17: '2022-10-12', col18: '12,345', col19: '12', col20: '1', col21: '12,345', col22: '12,345', col23: '1', col24: '12,345', col25: '12,345', col26: 'Y', col27: '2022-10', col28: '2022-10' },
    { col1: '2022-10', col2: '수수료', col3: 'OO총괄단', col4: 'OO지역단', col5: '김웰스 지점', col6: '1234567', col7: '김교원', col8: '플래너', col9: '1234567', col10: '2022-5559710', col11: '김치냉장고4Door', col12: '2022-10-12', col13: '2022-5559710', col14: '599', col15: '2022-10-12', col16: '2022-10-12', col17: '2022-10-12', col18: '12,345', col19: '12', col20: '1', col21: '12,345', col22: '12,345', col23: '1', col24: '12,345', col25: '12,345', col26: 'Y', col27: '2022-10', col28: '2022-10' },

  ]);
}

</script>
