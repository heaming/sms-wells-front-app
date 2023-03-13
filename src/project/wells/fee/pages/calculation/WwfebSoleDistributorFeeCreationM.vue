<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈', 'nav', 'nav','총판 수수료 생성관리']" />
    </template>
    <kw-search
      one-row
      :cols="2"
    >
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
          label="업무구분"
          required
        >
          <kw-option-group
            :model-value="'순주문'"
            type="radio"
            :options="['순주문', '수수료']"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <h3>$22년 10월$ 총판 수수료 생성 진행상황</h3>
          <kw-btn
            secondary
            dense
            label="프로세스 재실행"
            class="ml8"
          />
        </template>
      </kw-action-top>
      <kw-stepper
        v-model="stepInitNum"
        alternative-labels
      >
        <kw-step
          :name="1"
          :title="`실적집계`"
          :done="stepInitNum > 1"
          prefix="1"
        />
        <kw-step
          :name="2"
          :title="`수수료\n생성`"
          :done="stepInitNum > 2"
          prefix="2"
          :active-icon="'write'"
          :tooltip="'클릭하여 $수수료생성$를(을) 진행하세요.'"
        />
        <kw-step
          :name="3"
          :title="`보증예치금\n적립`"
          :done="stepInitNum > 3"
          prefix="3"
        />

        <kw-step-panel :name="2">
          <kw-action-top class="mt40">
            <template #left>
              <kw-paging-info
                :total-count="123456"
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
            :visible-rows="6"
            @init="initGrid"
          />
        </kw-step-panel>
      </kw-stepper>
    </div>
  </kw-page>
</template>

<script setup>
const stepInitNum = ref(2);

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
  ];

  const columns = [
    { fieldName: 'col1', header: '소속코드', width: '127', styleName: 'text-center' },
    { fieldName: 'col2', header: '업체명', width: '127', styleName: 'text-left ' },
    { fieldName: 'col3', header: '판매자', width: '98', styleName: 'text-left' },
    { fieldName: 'col4', header: '번호', width: '127', styleName: 'text-center' },
    { fieldName: 'col5', header: '고객코드', width: '127', styleName: 'text-left' },
    { fieldName: 'col6', header: '고객성명', width: '98', styleName: 'text-left' },
    { fieldName: 'col7', header: '상품코드', width: '127', styleName: 'text-center' },
    { fieldName: 'col8', header: '상품명', width: '179', styleName: 'text-left' },
    { fieldName: 'col9', header: '할인구분', width: '98', styleName: 'text-right' },
    { fieldName: 'col10', header: '할인유형', width: '98', styleName: 'text-right' },
    { fieldName: 'col11', header: '할인제도', width: '98', styleName: 'text-right' },
    { fieldName: 'col12', header: '결합구분', width: '98', styleName: 'text-right' },
    { fieldName: 'col13', header: '용도구분', width: '98', styleName: 'text-right' },
    { fieldName: 'col14', header: '관리유형', width: '98', styleName: 'text-left' },
    { fieldName: 'col15', header: '방문주기', width: '98', styleName: 'text-right' },
    { fieldName: 'col16', header: '접수일자', width: '127', styleName: 'text-center' },
    { fieldName: 'col17', header: '매출일자', width: '127', styleName: 'text-center' },
    { fieldName: 'col18', header: '취소일자', width: '127', styleName: 'text-center' },
    { fieldName: 'col19', header: '수수료', width: '127', styleName: 'text-right' },
    { fieldName: 'col20', header: '신규건수', width: '92', styleName: 'text-right' },
  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: 'Z950010', col2: '다온홈시', col3: '총판10', col4: '1607624', col5: '2022-4640868', col6: '홍길동', col7: '4512', col8: 'WN652NWR', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2-업소', col15: '3', col16: '22-10-24', col17: '22-10-24', col18: '22-10-25', col19: '123,450', col20: '1' },
    { col1: 'Z950010', col2: '다온홈시', col3: '총판10', col4: '1607624', col5: '2022-4640868', col6: '홍길동', col7: '4512', col8: 'WN652NWR', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2-업소', col15: '3', col16: '22-10-24', col17: '22-10-24', col18: '22-10-25', col19: '123,450', col20: '1' },
    { col1: 'Z950010', col2: '다온홈시', col3: '총판10', col4: '1607624', col5: '2022-4640868', col6: '홍길동', col7: '4512', col8: 'WN652NWR', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2-업소', col15: '3', col16: '22-10-24', col17: '22-10-24', col18: '22-10-25', col19: '123,450', col20: '1' },
    { col1: 'Z950010', col2: '다온홈시', col3: '총판10', col4: '1607624', col5: '2022-4640868', col6: '홍길동', col7: '4512', col8: 'WN652NWR', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2-업소', col15: '3', col16: '22-10-24', col17: '22-10-24', col18: '22-10-25', col19: '123,450', col20: '1' },
    { col1: 'Z950010', col2: '다온홈시', col3: '총판10', col4: '1607624', col5: '2022-4640868', col6: '홍길동', col7: '4512', col8: 'WN652NWR', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2-업소', col15: '3', col16: '22-10-24', col17: '22-10-24', col18: '22-10-25', col19: '123,450', col20: '1' },
    { col1: 'Z950010', col2: '다온홈시', col3: '총판10', col4: '1607624', col5: '2022-4640868', col6: '홍길동', col7: '4512', col8: 'WN652NWR', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2-업소', col15: '3', col16: '22-10-24', col17: '22-10-24', col18: '22-10-25', col19: '123,450', col20: '1' },
  ]);
}

</script>

<style>

</style>
