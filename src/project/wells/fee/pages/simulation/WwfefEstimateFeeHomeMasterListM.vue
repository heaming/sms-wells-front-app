<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈','nav','예상수수료 조회']" />
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
            :options="['접수', '설치']"
          />
        </kw-search-item>
        <kw-search-item
          label="번호"
          required
        >
          <kw-input />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <span class="accent">기본 정보</span>
        </template>
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
            label="소속코드"
          >
            <p>Q913123</p>
          </kw-form-item>
          <kw-form-item
            label="직급"
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
            label="예상서비스수수료"
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
          <span class="accent">실적내역</span>
        </template>

        <kw-btn
          label="교육수료 적용"
          dense
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          label="저장"
          dense
          primary
        />
      </kw-action-top>
      <kw-grid
        :visible-rows="2"
        @init="initGrid2"
      />
      <kw-separator />
      <kw-action-top>
        <template #left>
          <span class="accent">예상수수료 내역</span>
        </template>
      </kw-action-top>
      <kw-grid
        :visible-rows="2"
        @init="initGrid3"
      />
      <kw-separator />
      <kw-action-top>
        <template #left>
          <span class="accent">판매 내역</span>
        </template>
      </kw-action-top>
      <kw-grid
        :visible-rows="5"
        @init="initGrid4"
      />
      <kw-separator />

      <kw-action-top>
        <template #left>
          <span class="accent">어드바이스</span>
        </template>
      </kw-action-top>
      <kw-form
        :cols="2"
        dense
      >
        <kw-form-row>
          <kw-form-item
            label="추가 판매 건수"
          >
            <p>2</p>
          </kw-form-item>
          <kw-form-item
            label="추가 예상 수수료"
          >
            <p>300,000</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            label="추가 판매 건수"
          >
            <p>4</p>
          </kw-form-item>
          <kw-form-item
            label="추가 예상 수수료"
          >
            <p>600,000</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            label="추가 판매 건수"
          >
            <p>6</p>
          </kw-form-item>
          <kw-form-item
            label="추가 예상 수수료"
          >
            <p>1,000,000</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
    </div>
  </kw-page>
</template>

<script setup>

function initGrid2(data, view) {
  const fields = [{ fieldName: 'col1' }, { fieldName: 'col2' }, { fieldName: 'col3' }, { fieldName: 'col4' }, { fieldName: 'col5' }, { fieldName: 'col6' }];

  const columns = [
    { fieldName: 'col1', header: '구분', width: '193', styleName: 'text-left' },
    { fieldName: 'col2', header: '가전인정건수', width: '269', styleName: 'text-right' },
    { fieldName: 'col3', header: '일시불', width: '268', styleName: 'text-right' },
    { fieldName: 'col4', header: '전체처리건', width: '271', styleName: 'text-right' },
    { fieldName: 'col5', header: '가전처리건', width: '270', styleName: 'text-right' },
    { fieldName: 'col6', header: '교육수료', width: '270', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  data.setRows([
    { col1: '실적 현황', col2: '12', col3: '12,345,670', col4: '12', col5: '12', col6: 'N' },
    { col1: '변경 실적', col2: '12', col3: '12,345,670', col4: '12', col5: '12', col6: 'N' },
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
    { fieldName: 'col1', header: '구분', styleName: 'text-left', width: '218' },
    { fieldName: 'col2', header: '비례', styleName: 'text-right', width: '165' },
    { fieldName: 'col3', header: '조기정착', styleName: 'text-right', width: '165' },
    { fieldName: 'col4', header: '장려1', styleName: 'text-right', width: '165' },
    { fieldName: 'col5', header: '장려2', styleName: 'text-right', width: '165' },
    { fieldName: 'col6', header: '현장', styleName: 'text-right', width: '132' },
    { fieldName: 'col7', header: '활동1', styleName: 'text-right', width: '132' },
    { fieldName: 'col8', header: '활동2', styleName: 'text-right', width: '132' },
    { fieldName: 'col9', header: '누적', styleName: 'text-right', width: '132' },
    { fieldName: 'col10', header: '교육', styleName: 'text-right', width: '132' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = false; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'col1',
    {
      header: '예상판매수수료', // colspan title
      direction: 'horizontal', // merge type
      items: ['col2', 'col3', 'col4', 'col5'],
    },
    {
      header: '예상서비스수수료', // colspan title
      direction: 'horizontal', // merge type
      items: ['col6', 'col7', 'col8', 'col9', 'col10'],
    },
  ]);

  data.setRows([
    { col1: '예상수수료', col2: '1,234,500', col3: '1,234,500', col4: '123,450', col5: '123,450', col6: '123,450', col7: '123,450', col8: '123,450', col9: '123,450', col10: '123,450' },
    { col1: '합계', col2: '-', col3: '-', col4: '-', col5: '1,234,500', col6: '-', col7: '-', col8: '-', col9: '-', col10: '1,234,500' },
  ]);
}
function initGrid4(data, view) {
  const fields = [{ fieldName: 'col1' }, { fieldName: 'col2' }, { fieldName: 'col3' }, { fieldName: 'col4' }, { fieldName: 'col5' }, { fieldName: 'col6' }, { fieldName: 'col7' }, { fieldName: 'col8' }, { fieldName: 'col9' }, { fieldName: 'col10' }];

  const columns = [
    { fieldName: 'col1', header: '확정완료일', width: '155', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'col2', header: '설치완료일', width: '155', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'col3', header: '고객코드', width: '155', styleName: 'text-center' },
    { fieldName: 'col4', header: '계약자', width: '155', styleName: 'text-left' },
    { fieldName: 'col5', header: '상품명', width: '155', styleName: 'text-left' },
    { fieldName: 'col6', header: '상품코드', width: '155', styleName: 'text-center' },
    { fieldName: 'col7', header: '상품구분', width: '155', styleName: 'text-left' },
    { fieldName: 'col8', header: '계약유형', width: '155', styleName: 'text-left' },
    { fieldName: 'col9', header: '인정건수', width: '155', styleName: 'text-right' },
    { fieldName: 'col10', header: '인정건수', width: '155', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2022-10-24', col2: '-', col3: '2022-1234567', col4: '김교원', col5: '비데', col6: 'BM350', col7: '렌탈', col8: '일반', col9: '1', col10: '1' },
    { col1: '2022-10-21', col2: '2022-10-22', col3: '2022-1234567', col4: '이교원', col5: '청정기', col6: 'AK316', col7: '일시불', col8: '일반', col9: '1', col10: '1' },
    { col1: '2022-10-24', col2: '-', col3: '2022-1234567', col4: '김교원', col5: '비데', col6: 'BM350', col7: '렌탈', col8: '일반', col9: '1', col10: '1' },
    { col1: '2022-10-21', col2: '2022-10-22', col3: '2022-1234567', col4: '이교원', col5: '청정기', col6: 'AK316', col7: '일시불', col8: '일반', col9: '1', col10: '1' },
    { col1: '2022-10-21', col2: '2022-10-22', col3: '2022-1234567', col4: '이교원', col5: '청정기', col6: 'AK316', col7: '일시불', col8: '일반', col9: '1', col10: '1' },
  ]);
}

</script>
