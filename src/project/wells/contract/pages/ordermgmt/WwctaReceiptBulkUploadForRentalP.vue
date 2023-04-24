<template>
  <kw-popup
    class="kw-popup--lg"
    title="렌탈 대량 접수자료 업로드"
  >
    <kw-search
      :cols="2"
    >
      <kw-search-row>
        <kw-search-item
          label="컨택업체"
        >
          <kw-select
            model-value="[선택]"
            :options="['선택', 'B', 'C', 'D']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          label="업체코드"
        >
          <kw-select
            model-value="[선택]"
            :options="['선택', 'B', 'C', 'D']"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <kw-action-top class="mt30">
      <template #left>
        <kw-paging-info
          :total-count="128"
        />
        <span class="ml8">(단위:원)</span>
      </template>

      <kw-btn
        icon="download_off"
        dense
        label="양식 다운로드"
        @click="onClickExcelDownload"
      />
      <kw-btn
        icon="download_on"
        dense
        label="엑셀 업로드"
        @click="onClickExcelDownload"
      />
    </kw-action-top>

    <kw-grid
      :visible-rows="3"
      @init="initGrid"
    />

    <template #action>
      <kw-btn
        negative
        label="취소"
      />
      <kw-btn
        primary
        label="등록"
      />
    </template>
  </kw-popup>
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
  ];

  const columns = [
    { fieldName: 'col1', header: '제품코드', width: '100', styleName: 'text-center' },
    { fieldName: 'col2', header: '접수일', width: '100', styleName: 'text-center' },
    { fieldName: 'col3', header: '설치자명', width: '100' },
    { fieldName: 'col4', header: '등록비', width: '100', styleName: 'text-right' },
    { fieldName: 'col5', header: '변동개월', width: '100', styleName: 'text-center' },
    { fieldName: 'col6', header: '약정구분', width: '100', styleName: 'text-center' },
    { fieldName: 'col7', header: '할인제도', width: '100', styleName: 'text-center' },
    { fieldName: 'col8', header: '생년월일', width: '100', styleName: 'text-center' },
    { fieldName: 'col9', header: '성별(1:남, 2:여)', width: '140', styleName: 'text-center' },
    { fieldName: 'col10', header: '휴대전화번호', width: '140', styleName: 'text-center' },
    { fieldName: 'col11', header: '전화번호', width: '120', styleName: 'text-center' },
    { fieldName: 'col12', header: '우편번호', width: '120', styleName: 'text-center' },
    { fieldName: 'col13', header: '주소', width: '240', styleName: 'text-center' },
    { fieldName: 'col14', header: '사은품1', width: '120', styleName: 'text-center' },
    { fieldName: 'col15', header: '사은품2', width: '120', styleName: 'text-center' },
    { fieldName: 'col16', header: '사은품3', width: '120', styleName: 'text-center' },
    { fieldName: 'col17', header: '구독주문번호', width: '120', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '4725', col2: '2022-10-01', col3: '김고객', col4: '100,000', col5: '60', col6: '3', col7: '-', col8: '1990-01-01', col9: '1990-01-01', col10: '010-0000-0000', col11: '02-000-0000', col12: '123-12', col13: '서울시 종로구 을지로 100길 10', col14: '-', col15: '-', col16: '-', col17: '12345678' },
    { col1: '4725', col2: '2022-10-01', col3: '김고객', col4: '100,000', col5: '60', col6: '3', col7: '-', col8: '1990-01-01', col9: '1990-01-01', col10: '010-0000-0000', col11: '02-000-0000', col12: '123-12', col13: '서울시 종로구 을지로 100길 10', col14: '-', col15: '-', col16: '-', col17: '12345678' },
    { col1: '4725', col2: '2022-10-01', col3: '김고객', col4: '100,000', col5: '60', col6: '3', col7: '-', col8: '1990-01-01', col9: '1990-01-01', col10: '010-0000-0000', col11: '02-000-0000', col12: '123-12', col13: '서울시 종로구 을지로 100길 10', col14: '-', col15: '-', col16: '-', col17: '12345678' },
  ]);
}
</script>
