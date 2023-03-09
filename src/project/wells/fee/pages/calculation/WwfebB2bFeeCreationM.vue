<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈', 'nav', 'nav','B2B 수수료 생성관리']" />
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
          :done="stepInitNum > 7"
          prefix="7"
        />
        <kw-step
          :name="3"
          :title="`이체자료\n생성`"
          :done="stepInitNum > 8"
          prefix="8"
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
  ];

  const columns = [
    { fieldName: 'col1', header: '소속코드', width: '127', styleName: 'text-center' },
    { fieldName: 'col2', header: '판매자', width: '98', styleName: 'text-left ' },
    { fieldName: 'col3', header: '번호', width: '127', styleName: 'text-center' },
    { fieldName: 'col4', header: '고객코드', width: '127', styleName: 'text-center' },
    { fieldName: 'col5', header: '고객성명', width: '98', styleName: 'text-left' },
    { fieldName: 'col6', header: '상품코드', width: '127', styleName: 'text-center' },
    { fieldName: 'col7', header: '상품명', width: '179', styleName: 'text-left' },
    { fieldName: 'col8', header: '할인구분', width: '98', styleName: 'text-right' },
    { fieldName: 'col9', header: '할인유형', width: '98', styleName: 'text-right' },
    { fieldName: 'col10', header: '할인제도', width: '98', styleName: 'text-right' },
    { fieldName: 'col11', header: '결합구분', width: '98', styleName: 'text-right' },
    { fieldName: 'col12', header: '용도구분', width: '98', styleName: 'text-right' },
    { fieldName: 'col13', header: '관리유형', width: '98', styleName: 'text-left' },
    { fieldName: 'col14', header: '방문주기', width: '98', styleName: 'text-right' },
    { fieldName: 'col15', header: '접수일자', width: '127', styleName: 'text-center' },
    { fieldName: 'col16', header: '매출일자', width: '127', styleName: 'text-center' },
    { fieldName: 'col17', header: '취소일자', width: '127', styleName: 'text-center' },
    { fieldName: 'col18', header: '수수료', width: '127', styleName: 'text-right' },
  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: 'Z950010', col2: '총판10', col3: '1607624', col4: '2022-4640868', col5: '홍길동', col6: '4512', col7: 'WN652NWR', col8: '3', col9: '6', col10: '3', col11: '18', col12: '2', col13: '2-업소', col14: '3', col15: '22-10-24', col16: '22-10-24', col17: '22-10-25', col18: '123,450' },
    { col1: 'Z950010', col2: '총판10', col3: '1607624', col4: '2022-4640868', col5: '홍길동', col6: '4512', col7: 'WN652NWR', col8: '3', col9: '6', col10: '3', col11: '18', col12: '2', col13: '2-업소', col14: '3', col15: '22-10-24', col16: '22-10-24', col17: '22-10-25', col18: '123,450' },
    { col1: 'Z950010', col2: '총판10', col3: '1607624', col4: '2022-4640868', col5: '홍길동', col6: '4512', col7: 'WN652NWR', col8: '3', col9: '6', col10: '3', col11: '18', col12: '2', col13: '2-업소', col14: '3', col15: '22-10-24', col16: '22-10-24', col17: '22-10-25', col18: '123,450' },
    { col1: 'Z950010', col2: '총판10', col3: '1607624', col4: '2022-4640868', col5: '홍길동', col6: '4512', col7: 'WN652NWR', col8: '3', col9: '6', col10: '3', col11: '18', col12: '2', col13: '2-업소', col14: '3', col15: '22-10-24', col16: '22-10-24', col17: '22-10-25', col18: '123,450' },
    { col1: 'Z950010', col2: '총판10', col3: '1607624', col4: '2022-4640868', col5: '홍길동', col6: '4512', col7: 'WN652NWR', col8: '3', col9: '6', col10: '3', col11: '18', col12: '2', col13: '2-업소', col14: '3', col15: '22-10-24', col16: '22-10-24', col17: '22-10-25', col18: '123,450' },
    { col1: 'Z950010', col2: '총판10', col3: '1607624', col4: '2022-4640868', col5: '홍길동', col6: '4512', col7: 'WN652NWR', col8: '3', col9: '6', col10: '3', col11: '18', col12: '2', col13: '2-업소', col14: '3', col15: '22-10-24', col16: '22-10-24', col17: '22-10-25', col18: '123,450' },
  ]);
}

</script>

<style>

</style>
