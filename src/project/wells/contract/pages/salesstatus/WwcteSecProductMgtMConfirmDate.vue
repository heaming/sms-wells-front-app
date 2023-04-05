<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈','판매','영업활동관리','삼성전자 상품관리']"
      />
    </template>
    <!-- To.개발 kw-tab-panel안에 kw-search로 시작하는 경우 kw-tabs에 .form-border 제거 / 그 외 추가 -->
    <kw-tabs model-value="3">
      <kw-tab
        name="1"
        label="미설치"
      />
      <kw-tab
        name="2"
        label="배송"
      />
      <kw-tab
        name="3"
        label="확정일"
      />
      <kw-tab
        name="4"
        label="예약일"
      />
      <kw-tab
        name="5"
        label="무상A/S"
      />
    </kw-tabs>
    <kw-tab-panels model-value="3">
      <kw-tab-panel name="3">
        <kw-search>
          <kw-search-row>
            <kw-search-item
              label="예정일"
              required
            >
              <kw-date-range-picker rules="date_range_required|date_range_months:1" />
            </kw-search-item>
            <kw-search-item
              label="주문유형"
            >
              <kw-option-group
                :model-value="'전체'"
                type="radio"
                :options="['전체', '렌탈', '일시불']"
              />
            </kw-search-item>
            <kw-search-item
              label="삼성주문번호"
            >
              <kw-input />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-search-item
              label="시리얼번호"
            >
              <kw-input />
            </kw-search-item>
          </kw-search-row>
        </kw-search>

        <div class="result-area">
          <h3>결과조회</h3>
          <kw-action-top>
            <template #left>
              <kw-paging-info :total-count="100" />
            </template>
            <kw-btn
              icon="download_off"
              dense
              secondary
              label="양식 다운로드"
            />
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
              label="엑셀다운로드"
              @click="onClickExcelDownload"
            />
          </kw-action-top>
          <kw-grid
            :visible-rows="1"
            @init="initGrid"
          />
          <h3>업로드 미리보기</h3>
          <kw-action-top>
            <template #left>
              <kw-paging-info

                :total-count="1"
              />
            </template>
          </kw-action-top>
          <kw-grid
            :visible-rows="10"
            @init="initGrid2"
          />
        </div>
      </kw-tab-panel>
    </kw-tab-panels>
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
  ];

  const columns = [
    { fieldName: 'col1', header: '계약번호', width: '137', styleName: 'text-center' },
    { fieldName: 'col2', header: '계약자명', width: '136', styleName: 'text-center' },
    { fieldName: 'col3', header: '주문유형', width: '136', styleName: 'text-center' },
    { fieldName: 'col4', header: '상품명', width: '253' },
    { fieldName: 'col5', header: '상품코드', width: '168', styleName: 'text-center' },
    { fieldName: 'col6', header: '삼성주문번호', width: '168', styleName: 'text-center' },
    { fieldName: 'col7', header: '설치일', width: '136', styleName: 'text-center' },
    { fieldName: 'col8', header: '컨텍코드', width: '136', styleName: 'text-center' },
    { fieldName: 'col9', header: '취소일', width: '136', styleName: 'text-center' },
    { fieldName: 'col10', header: '시리얼번호', width: '152', styleName: 'text-center' },
    { fieldName: 'col11', header: '삼성모델명', width: '152', styleName: 'text-center' },
    { fieldName: 'col12', header: '엑셀업로드 일시', width: '170', styleName: 'text-center' },
    { fieldName: 'col13', header: '배치실행 일시', width: '170', styleName: 'text-center' },
    { fieldName: 'col14', header: '등록비완납여부', width: '146.8', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '1234-1234567', col2: '김고객', col3: '렌탈', col4: '비스포크냉장고코타화이트', col5: '1234', col6: '1234567890', col7: '2022-10-05', col8: '(01)성공OK', col9: '-', col10: 'QX3F5AET900171', col11: 'DV17B8720BP', col12: '2022-10-01 09:23:10', col13: '2022-10-01 12:23:10', col14: 'Y' },
  ]);
}

function initGrid2(data, view) {
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
    { fieldName: 'col1', header: '계약번호', width: '137', styleName: 'text-center' },
    { fieldName: 'col2', header: '벽걸이 주문번호', width: '148', styleName: 'text-center' },
    { fieldName: 'col3', header: '주문번호', width: '148', styleName: 'text-center' },
    { fieldName: 'col4', header: '특이사항', width: '200' },
    { fieldName: 'col5', header: '설치일', width: '136', styleName: 'text-center' },
    { fieldName: 'col6', header: '시리얼번호', width: '152', styleName: 'text-center' },
    { fieldName: 'col7', header: '예약일', width: '136', styleName: 'text-center' },
    { fieldName: 'col8', header: '재고입고일', width: '136', styleName: 'text-center' },
    { fieldName: 'col9', header: '설치구분', width: '136', styleName: 'text-center' },
    { fieldName: 'col10', header: '삼성서비스 모델명', width: '166', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '1234-1234567', col2: '-', col3: '1234567890', col4: '특이사항내용이 들어감..', col5: '2022-10-05', col6: '003F5AET900171', col7: '2022-10-05', col8: '2022-10-05', col9: '-', col10: '-' },
  ]);
}
</script>
<style scoped>
</style>
