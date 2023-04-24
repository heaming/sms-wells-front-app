<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈','판매','회사설치 주문 관리(생성, 현황조회)']" />
    </template>

    <kw-search :cols="4">
      <kw-search-row>
        <kw-search-item
          label="접수일"
          required
          :colspan="2"
        >
          <kw-date-range-picker
            rules="date_range_required|date_range_monts:1"
          />
        </kw-search-item>

        <kw-search-item
          label="설치일"
          :colspan="2"
        >
          <kw-date-range-picker
            rules="date_range_monts:1"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          label="계약번호"
        >
          <kw-input
            clearable
            icon="search"
          />
        </kw-search-item>
        <kw-search-item
          label="상품분류"
          :colspan="2"
        >
          <kw-select
            :model-value="['']"
            :options="['전체','B','C']"
          />
          <kw-select
            :model-value="['']"
            :options="['전체','B','C']"
          />
        </kw-search-item>

        <kw-search-item
          label="상품코드"
        >
          <kw-input
            clearable
            icon="search"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          label="상품명"
        >
          <kw-input
            clearable
            icon="search"
          />
        </kw-search-item>
        <kw-search-item
          label="설치자명"
        >
          <kw-input />
        </kw-search-item>

        <kw-search-item
          label="설치구분"
        >
          <kw-select
            :model-value="['']"
            :options="['전체','B','C']"
          />
        </kw-search-item>
        <kw-search-item
          label="설치용도"
        >
          <kw-select
            :model-value="['']"
            :options="['전체','B','C']"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          label="휴대전화번호"
        >
          <kw-input />
        </kw-search-item>

        <kw-search-item
          label="출력구분"
        >
          <kw-option-group
            :model-value="'전체'"
            type="radio"
            :options="['전체', '1. 반품제외']"
          />
        </kw-search-item>
        <kw-search-item
          label="조직구분"
        >
          <kw-option-group
            :model-value="'전체'"
            type="radio"
            :options="['전체', '본사', '신채널']"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="100"
          />
          <span class="ml8">(단위: 개월)</span>
        </template>

        <kw-btn
          icon="upload_on"
          dense
          secondary
          label="엑셀업로드"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          label="엑셀 다운로드"
          @click="onClickExcelDownload"
        />

        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          primary
          label="등록"
          dense
        />
      </kw-action-top>
      <kw-grid
        :visible-rows="1"
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
    { fieldName: 'col29' },
    { fieldName: 'col30' },
    { fieldName: 'col31' },
    { fieldName: 'col32' },
    { fieldName: 'col33' },
    { fieldName: 'col34' },
    { fieldName: 'col35' },
    { fieldName: 'col36' },
    { fieldName: 'col37' },
    { fieldName: 'col38' },
    { fieldName: 'col39' },
    { fieldName: 'col40' },
    { fieldName: 'col41' },
    { fieldName: 'col42' },
    { fieldName: 'col43' },
    { fieldName: 'col44' },
    { fieldName: 'col45' },
    { fieldName: 'col46' },
    { fieldName: 'col47' },
    { fieldName: 'col48' },
    { fieldName: 'col49' },
    { fieldName: 'col50' },
    { fieldName: 'col51' },
    { fieldName: 'col52' },
    { fieldName: 'col53' },
    { fieldName: 'col54' },
    { fieldName: 'col55' },
    { fieldName: 'col56' },
    { fieldName: 'col57' },
    { fieldName: 'col58' },

  ];

  const columns = [
    { fieldName: 'col1', header: '주문번호', width: '130', styleName: 'text-center' },
    { fieldName: 'col2', header: '구분', width: '130', styleName: 'text-center' },
    { fieldName: 'col3', header: '고객명', width: '130', styleName: 'text-center' },
    { fieldName: 'col4', header: '확정', width: '130', styleName: 'text-center' },
    { fieldName: 'col5', header: '재접수', width: '130', styleName: 'text-center' },
    { fieldName: 'col6', header: '배정취소', width: '130', styleName: 'text-center' },
    { fieldName: 'col7', header: '주민등록번호', width: '130', styleName: 'text-center' },
    { fieldName: 'col8', header: '사업자등록번호', width: '130', styleName: 'text-center' },
    { fieldName: 'col9', header: '고객번호', width: '130', styleName: 'text-center' },
    { fieldName: 'col10', header: '설치자', width: '130', styleName: 'text-center' },
    { fieldName: 'col11', header: '고객명', width: '130', styleName: 'text-center' },
    { fieldName: 'col12', header: '접수일', width: '130', styleName: 'text-center' },
    { fieldName: 'col13', header: '판매유형', width: '130', styleName: 'text-center' },
    { fieldName: 'col14', header: '관리회사', width: '130', styleName: 'text-right' },
    { fieldName: 'col15', header: '관리부서', width: '130', styleName: 'text-center' },
    { fieldName: 'col16', header: '관리구분', width: '130', styleName: 'text-center' },
    { fieldName: 'col17', header: 'WP구분', width: '130', styleName: 'text-center' },
    { fieldName: 'col18', header: '설치상품코드', width: '130', styleName: 'text-center' },
    { fieldName: 'col19', header: '설치상품명', width: '259' },
    { fieldName: 'col20', header: '모종패키지코드', width: '130', styleName: 'text-center' },
    { fieldName: 'col21', header: '패키지명', width: '237' },
    { fieldName: 'col22', header: 'BS주기', width: '130', styleName: 'text-right' },
    { fieldName: 'col23', header: '용도구분', width: '130', styleName: 'text-right' },
    { fieldName: 'col24', header: '제품등급', width: '130', styleName: 'text-right' },
    { fieldName: 'col25', header: '설치구분', width: '130', styleName: 'text-right' },
    { fieldName: 'col26', header: '설치용도', width: '130', styleName: 'text-right' },
    { fieldName: 'col27', header: '설치장소', width: '130' },
    { fieldName: 'col28', header: '방문주기', width: '130', styleName: 'text-center' },
    { fieldName: 'col29', header: '무상기간(개월)', width: '130', styleName: 'text-right' },
    { fieldName: 'col30', header: 'A/S기간(년?)', width: '130', styleName: 'text-right' },
    { fieldName: 'col31', header: '필터비용', width: '130', styleName: 'text-center' },
    { fieldName: 'col32', header: '할인율(%)', width: '130', styleName: 'text-right' },
    { fieldName: 'col33', header: '예정일', width: '130', styleName: 'text-center' },
    { fieldName: 'col34', header: '설치일', width: '130', styleName: 'text-center' },
    { fieldName: 'col35', header: '반품일', width: '130', styleName: 'text-center' },
    { fieldName: 'col36', header: '보상일', width: '130', styleName: 'text-center' },
    { fieldName: 'col37', header: '참고사항', width: '259', styleName: 'text-right' },
    { fieldName: 'col38', header: '컨택코드', width: '130', styleName: 'text-center' },
    { fieldName: 'col39', header: '컨택담당', width: '130', styleName: 'text-center' },
    { fieldName: 'col40', header: '특약내용', width: '259' },
    { fieldName: 'col41', header: '자료구분', width: '130', styleName: 'text-center' },
    { fieldName: 'col42', header: '자료유형', width: '130', styleName: 'text-center' },
    { fieldName: 'col43', header: '주문번호상세', width: '130', styleName: 'text-center' },
    { fieldName: 'col44', header: '모종상세코드', width: '130', styleName: 'text-center' },
    { fieldName: 'col45', header: '기타1', width: '130', styleName: 'text-center' },
    { fieldName: 'col46', header: '정기배송여부', width: '130', styleName: 'text-center' },
    { fieldName: 'col47', header: '기타3', width: '130', styleName: 'text-center' },
    { fieldName: 'col48', header: '멤버십비용구분', width: '130', styleName: 'text-center' },
    { fieldName: 'col49', header: '기타5', width: '130', styleName: 'text-center' },
    { fieldName: 'col50', header: '기타6', width: '130', styleName: 'text-center' },
    { fieldName: 'col51', header: '입력일', width: '130', styleName: 'text-center' },
    { fieldName: 'col52', header: '입력시간', width: '130', styleName: 'text-center' },
    { fieldName: 'col53', header: '입력담당사번', width: '130', styleName: 'text-center' },
    { fieldName: 'col54', header: '입력담당명', width: '130', styleName: 'text-center' },
    { fieldName: 'col55', header: '수정일', width: '130', styleName: 'text-center' },
    { fieldName: 'col56', header: '수정시간', width: '130', styleName: 'text-center' },
    { fieldName: 'col57', header: '수정담당사번', width: '130', styleName: 'text-center' },
    { fieldName: 'col58', header: '수정담당자명', width: '130', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  // multi row header setting
  view.setColumnLayout([
    {
      header: '주문정보', // colspan title
      direction: 'horizontal', // merge type
      items: ['col1', 'col2', 'col3', 'col4', 'col5', 'col6'],
    },
    'col7', 'col8', 'col9', 'col10', 'col11', 'col12', 'col13', 'col14', 'col15', 'col16', 'col17', 'col18', 'col19', 'col20', 'col21', 'col22', 'col23', 'col24', 'col25', 'col26', 'col27', 'col28', 'col29', 'col30', 'col31', 'col32', 'col33', 'col34', 'col35', 'col36', 'col37', 'col38', 'col39', 'col40', 'col41', 'col42', 'col43', 'col44', 'col45', 'col46', 'col47', 'col48', 'col49', 'col50', 'col51', 'col52', 'col53', 'col54', 'col55', 'col56', 'col57', 'col58',
  ]);

  data.setRows([
    { col1: '8888-18667', col2: '2', col3: '프라퍼티', col4: '확정', col5: '재접수', col6: '배정취소', col7: '900101-2100022', col8: '-', col9: '123456789', col10: '수원경기', col11: '프라퍼티', col12: '2022-10-10', col13: '4', col14: '20', col15: '71409', col16: '2', col17: 'Y', col18: '4048', col19: '웰스팜/와이드/공유SVC', col20: '431', col21: '건강 샐러드&주스 WIDE', col22: '2', col23: '0', col24: '2', col25: '2', col26: '5', col27: '-', col28: '0', col29: '60', col30: '2', col31: 'N', col32: '-', col33: '2022-10-10', col34: '2022-10-15', col35: '-', col36: '-', col37: '내부체험단 5년무상 A급 BS생성있음...', col38: '01', col39: '0', col40: '-', col41: '-', col42: '-', col43: '1234-1234567-1', col44: '-', col45: '-', col46: '-', col47: '-', col48: '렌탈', col49: '0', col50: '-', col51: '2022-10-10', col52: '13:34:44', col53: '12345', col54: '김교원', col55: '2022-10-15', col56: '15:33:10', col57: '12345', col58: '김교원' },
  ]);
}

</script>
