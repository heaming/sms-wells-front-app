<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaRestipulationTargetCstListP - 재약정 대상고객 조회
3. 작성자 : gs.piit159
4. 작성일 : 2023.03.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 재약정 대상고객 조회 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <kw-search :cols="2">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CONTR_TYPE')"
          required
        >
          <kw-select
            :model-value="[]"
            :options="['A', 'B', 'C', 'D']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CNTRT_TP')"
          required
        >
          <kw-select
            :model-value="[]"
            :options="['A', 'B', 'C', 'D']"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_NAME')"
        >
          <kw-input />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_MPNO')"
        >
          <kw-input />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="7" />
      </template>
      <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>

    <kw-grid
      :visible-rows="10"
      @init="initGrid1"
    />
    <kw-pagination
      :model-value="1"
      :total-count="100"
    />
    <template #action>
      <kw-btn
        label="닫기"
        primary
      />
    </template>
  </kw-popup>
</template>
<script setup>

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
    { fieldName: 'col1', header: '계약자유형', width: '104', styleName: 'text-center' },
    { fieldName: 'col2', header: '고객번호', width: '131', styleName: 'text-center' },
    { fieldName: 'col3', header: '계약번호', width: '131', styleName: 'text-center' },
    { fieldName: 'col4', header: '이름', width: '99', styleName: 'text-center' },
    { fieldName: 'col5', header: '성별', width: '67', styleName: 'text-center' },
    { fieldName: 'col6', header: '생년월일', width: '96', styleName: 'text-center' },
    { fieldName: 'col7', header: '휴대전화번호', width: '131', styleName: 'text-center' },
    { fieldName: 'col8', header: '상품명', width: '235', styleName: 'text-left' },
    { fieldName: 'col9', header: '계약기간', width: '99', styleName: 'text-right' },
    { fieldName: 'col10', header: '연체', width: '68', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  data.setRows([
    { col1: '개인', col2: '041123456', col3: '2011-1234567', col4: '김고객', col5: '남성', col6: '1976-05-05', col7: '010-1234-1234', col8: '웰스(KW-P1234WT)', col9: '60', col10: '연체' },
    { col1: '개인', col2: '041123456', col3: '2011-1234567', col4: '김고객', col5: '남성', col6: '1976-05-05', col7: '010-1234-1234', col8: '웰스(KW-P1234WT)', col9: '60', col10: '연체' },
    { col1: '개인', col2: '041123456', col3: '2011-1234567', col4: '김고객', col5: '남성', col6: '1976-05-05', col7: '010-1234-1234', col8: '웰스(KW-P1234WT)', col9: '60', col10: '연체' },
    { col1: '개인', col2: '041123456', col3: '2011-1234567', col4: '김고객', col5: '남성', col6: '1976-05-05', col7: '010-1234-1234', col8: '웰스(KW-P1234WT)', col9: '60', col10: '연체' },
    { col1: '개인', col2: '041123456', col3: '2011-1234567', col4: '김고객', col5: '남성', col6: '1976-05-05', col7: '010-1234-1234', col8: '웰스(KW-P1234WT)', col9: '60', col10: '연체' },
    { col1: '개인', col2: '041123456', col3: '2011-1234567', col4: '김고객', col5: '남성', col6: '1976-05-05', col7: '010-1234-1234', col8: '웰스(KW-P1234WT)', col9: '60', col10: '연체' },
    { col1: '개인', col2: '041123456', col3: '2011-1234567', col4: '김고객', col5: '남성', col6: '1976-05-05', col7: '010-1234-1234', col8: '웰스(KW-P1234WT)', col9: '60', col10: '연체' },
    { col1: '개인', col2: '041123456', col3: '2011-1234567', col4: '김고객', col5: '남성', col6: '1976-05-05', col7: '010-1234-1234', col8: '웰스(KW-P1234WT)', col9: '60', col10: '연체' },
    { col1: '개인', col2: '041123456', col3: '2011-1234567', col4: '김고객', col5: '남성', col6: '1976-05-05', col7: '010-1234-1234', col8: '웰스(KW-P1234WT)', col9: '60', col10: '연체' },
    { col1: '개인', col2: '041123456', col3: '2011-1234567', col4: '김고객', col5: '남성', col6: '1976-05-05', col7: '010-1234-1234', col8: '웰스(KW-P1234WT)', col9: '60', col10: '연체' },

  ]);
}

</script>
