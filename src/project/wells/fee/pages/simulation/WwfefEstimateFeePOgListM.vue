<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈','Depth1','Depth2', '예상수수료 조회(P)']" />
    </template>
    <kw-search>
      <kw-search-row>
        <kw-search-item
          label="실적년월"
          required
        >
          <kw-date-picker
            rules="required"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          label="실적조회"
          required
        >
          <kw-option-group
            :model-value="'접수'"
            type="radio"
            :options="['접수', '매출']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          label="번호"
          required
        >
          <kw-input
            rules="required"
            icon="search"
            clearable
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <h3>기본 정보</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular"> (단위:원)</span>
      </kw-action-top>
      <kw-form

        dense
      >
        <kw-form-row>
          <kw-form-item
            label="성명"
          >
            <p>김교원</p>
          </kw-form-item>
          <kw-form-item
            label="소속"
          >
            <p>Q913123</p>
          </kw-form-item>
          <kw-form-item
            label="직책"
          >
            <p>플래너</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            label="예상판매수수료"
          >
            <p>12,345,670</p>
          </kw-form-item>
          <kw-form-item
            label="예상상조수수료"
          >
            <p>123,450</p>
          </kw-form-item>
          <kw-form-item
            label="예상수수료합계"
          >
            <p>12,345,670</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <kw-action-top>
        <template #left>
          <h3>실적내역</h3>
          <span class="ml8"> (단위:원)</span>
        </template>
        <kw-btn
          label="계산"
          dense
          primary
        />
      </kw-action-top>
      <kw-grid
        :visible-rows="4"
        @init="initGrid2"
      />
      <kw-separator />
      <kw-action-top>
        <template #left>
          <h3>예상수수료 내역</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular"> (단위:원)</span>
      </kw-action-top>
      <kw-grid
        :visible-rows="2"
        @init="initGrid3"
      />
      <kw-separator />
      <kw-action-top>
        <template #left>
          <h3>판매 내역</h3>
        </template>
      </kw-action-top>
      <kw-grid
        :visible-rows="3"
        @init="initGrid4"
      />
    </div>
  </kw-page>
</template>

<script setup>

function initGrid2(data, view) {
  const fields = [{ fieldName: 'col1' }, { fieldName: 'col2' }, { fieldName: 'col3' }, { fieldName: 'col4' }, { fieldName: 'col5' }, { fieldName: 'col6' }, { fieldName: 'col7' }];

  const columns = [
    { fieldName: 'col1', header: '구분', width: '220', styleName: 'text-left' },
    { fieldName: 'col2', header: '가전', width: '220', styleName: 'text-right' },
    { fieldName: 'col3', header: '가전 외', width: '220', styleName: 'text-right' },
    { fieldName: 'col4', header: '429', width: '220', styleName: 'text-right' },
    { fieldName: 'col5', header: '599', width: '220', styleName: 'text-right' },
    { fieldName: 'col6', header: '플래너스타트업', width: '220', styleName: 'text-center' },
    { fieldName: 'col7', header: '플래너실전', width: '220', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
  // multi row header setting
  view.setColumnLayout([
    'col1', 'col2', 'col3', // single
    {
      header: '상조', // colspan title
      direction: 'horizontal', // merge type
      items: ['col4', 'col5'],
    },
    {
      header: '교육수료',
      direction: 'horizontal',
      items: ['col6', 'col7'],
    },
  ]);

  data.setRows([
    { col1: '개인 실적 현황', col2: '12,345,670', col3: '12,345,670', col4: '12', col5: '12', col6: '2022-10', col7: 'N' },
    { col1: '개인 실적 현황', col2: '12,345,670', col3: '12,345,670', col4: '12', col5: '12', col6: '2022-10', col7: 'N' },
    { col1: '개인 실적 현황', col2: '12,345,670', col3: '12,345,670', col4: '12', col5: '12', col6: '2022-10', col7: 'N' },
    { col1: '개인 실적 현황', col2: '12,345,670', col3: '12,345,670', col4: '12', col5: '12', col6: '2022-10', col7: 'N' },
  ]);
}

function initGrid3(data, view) {
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
    { fieldName: 'col1', header: '구분', width: '218' },
    { fieldName: 'col2', header: '가전비례', styleName: 'text-right', width: '135' },
    { fieldName: 'col3', header: '가전외비례', styleName: 'text-right', width: '135' },
    { fieldName: 'col4', header: '판매장려', styleName: 'text-right', width: '135' },
    { fieldName: 'col5', header: '정착', styleName: 'text-right', width: '135' },
    { fieldName: 'col6', header: '상조', styleName: 'text-right', width: '135' },
    { fieldName: 'col7', header: '가전비례', styleName: 'text-right', width: '165' },
    { fieldName: 'col8', header: '가전외비례', styleName: 'text-right', width: '165' },
    { fieldName: 'col9', header: '판매장려', styleName: 'text-right', width: '166' },
    { fieldName: 'col10', header: '상조', styleName: 'text-right', width: '165' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = false; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'col1',
    {
      header: '개인수수료', // colspan title
      direction: 'horizontal', // merge type
      items: ['col2', 'col3', 'col4', 'col5', 'col6'],
    },
    {
      header: '조직수수료', // colspan title
      direction: 'horizontal', // merge type
      items: ['col7', 'col8', 'col9', 'col10'],
    },
  ]);

  data.setRows([
    { col1: '예상수수료', col2: '123,450', col3: '123,450', col4: '123,450', col5: '123,450', col6: '123,450', col7: '123,450', col8: '123,450', col9: '123,450', col10: '123,450' },
    { col1: '합계', col2: '-', col3: '-', col4: '-', col5: '-', col6: '1,234,500', col7: '123,450', col8: '1,234,500', col9: '123,450', col10: '1,234,500' },
  ]);
}
function initGrid4(data, view) {
  const fields = [{ fieldName: 'col1' }, { fieldName: 'col2' }, { fieldName: 'col3' }, { fieldName: 'col4' }, { fieldName: 'col5' }, { fieldName: 'col6' }, { fieldName: 'col7' }, { fieldName: 'col8' }, { fieldName: 'col9' }, { fieldName: 'col10' }, { fieldName: 'col11' }, { fieldName: 'col12' }, { fieldName: 'col13' }];

  const columns = [
    { fieldName: 'col1', header: '번호', width: '118', styleName: 'text-center' },
    { fieldName: 'col2', header: '성명', width: '120' },
    { fieldName: 'col3', header: '실적구분', width: '118' },
    { fieldName: 'col4', header: '상품구분', width: '118' },
    { fieldName: 'col5', header: '접수일자', width: '118' },
    { fieldName: 'col6', header: '매출일자', width: '118' },
    { fieldName: 'col7', header: '계약번호', width: '118' },
    { fieldName: 'col8', header: '상품내역', width: '287' },
    { fieldName: 'col9', header: '고객명', width: '118' },
    { fieldName: 'col10', header: '판매구분', width: '118', styleName: 'text-center' },
    { fieldName: 'col11', header: '가전', width: '118', styleName: 'text-right' },
    { fieldName: 'col12', header: '가전 외', width: '118', styleName: 'text-right' },
    { fieldName: 'col13', header: '기변', width: '118', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '1234567', col2: '김교원', col3: '가전', col4: 'BH', col5: '2022-10-25', col6: '2022-11-01', col7: '2022-5844568', col8: '공기청정기AK316ESA', col9: '김고객', col10: '신규', col11: '123,450', col12: '1,234,000', col13: '1,234,000' },
    { col1: '1234567', col2: '김교원', col3: '가전', col4: 'BH', col5: '2022-10-25', col6: '2022-11-01', col7: '2022-5844568', col8: '공기청정기AK316ESA', col9: '김고객', col10: '신규', col11: '123,450', col12: '1,234,000', col13: '1,234,000' },
    { col1: '1234567', col2: '김교원', col3: '가전', col4: 'BH', col5: '2022-10-25', col6: '2022-11-01', col7: '2022-5844568', col8: '공기청정기AK316ESA', col9: '김고객', col10: '신규', col11: '123,450', col12: '1,234,000', col13: '1,234,000' },
  ]);
}

</script>
