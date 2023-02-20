<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwContractManagementListM - 계약관리
3. 작성자 : gs.piit193
4. 작성일 : 2023.02.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 기존 화면명 'KSS주문현황'으로 상태별로 계약서를 확인하고 승인, 계약서 발송 등의 행위를 하는 페이지
****************************************************************************************************
--->
<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈' , '판매관리' , '계약관리' , '계약관리']"
      />
    </template>
    <kw-search :cols="4">
      <kw-search-row>
        <kw-search-item label="계약구분">
          <kw-select
            :model-value="[]"
            :options="['A', 'B', 'C', 'D']"
          />
        </kw-search-item>
        <kw-search-item
          label="작성일자"
          :colspan="2"
        >
          <kw-date-range-picker
            rules="date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item label="계약서구분">
          <kw-select
            :model-value="[]"
            :options="['A', 'B', 'C', 'D']"
          />
          <kw-select
            :model-value="[]"
            :options="['A', 'B', 'C', 'D']"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item label="지역단">
          <kw-select
            :model-value="[]"
            :options="['A', 'B', 'C', 'D']"
          />
        </kw-search-item>
        <kw-search-item label="지점">
          <kw-select
            :model-value="[]"
            :options="['A', 'B', 'C', 'D']"
          />
        </kw-search-item>
        <kw-search-item
          label="계약상태"
          :colspan="2"
        >
          <kw-option-group
            class="kw-option-group--multi-line"
            :model-value="[]"
            type="checkbox"
            :options="['작성완료', '결제대기', '결제중', '결제완료', '확정', '취소', '반송', '삭제']"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>조회결과</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="156" />
        </template>
        <kw-btn
          grid-action
          label="계약서출력"
        />
        <kw-btn
          grid-action
          label="계약서메일 발송"
        />
        <kw-btn
          grid-action
          label="알림톡 발송"
          @click="onClickKakaotalk"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          dense
          icon="download_on"
          label="엑셀다운로드"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="8"
        @init="initGrdMain"
      />
      <h3>상세내역 - 2022-1234567</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="156" />
        </template>
        <span class="kw-fc--black3 text-weight-regular">(단위 : 원)</span>
      </kw-action-top>
      <kw-grid
        :visible-rows="1"
        @init="initGrid2"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useGlobal, defineGrid, getComponentType } from 'kw-lib';
// import { isEmpty } from 'lodash-es';

// const { t } = useI18n();
const { modal } = useGlobal();
// const { getConfig } = useMeta();
const grdMainRef = ref(getComponentType('KwGrid'));
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'PD_REL_TP_CD',
);
codes.PD_REL_TP_CD = codes.PD_REL_TP_CD.filter((v) => (['13', '14', '15'].includes(v.codeId)));

async function onClickKakaotalk() {
  const { result } = await modal({
    component: 'WwKakaotalkForwardingIzListP',
    componentProps: {
      mtPr: '407',
      concDiv: 'R',
    },
  });

  if (result) {
    console.log(result);
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

// 수정모드 통합 DATA Grid
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'col1', header: '확정승인', width: '147', styleName: 'text-center' },
    { fieldName: 'col2', header: '직역단', width: '127', styleName: 'text-center' },
    { fieldName: 'col3', header: '지점', width: '127', styleName: 'text-center' },
    { fieldName: 'col4', header: '계약구분', width: '127', styleName: 'text-center' },
    { fieldName: 'col5', header: '계약번호', width: '176', styleName: 'text-center' },
    { fieldName: 'col6', header: '고객번호', width: '127', styleName: 'text-center' },
    { fieldName: 'col7', header: '판매자 사번', width: '127', styleName: 'text-center' },
    { fieldName: 'col8', header: '상태', width: '127', styleName: 'text-center' },
    { fieldName: 'col9', header: '계약상태', width: '127', styleName: 'text-center' },
    { fieldName: 'col10', header: '계약방식', width: '127', styleName: 'text-center' },
    { fieldName: 'col11', header: '상품군', width: '127', styleName: 'text-center' },
    { fieldName: 'col12', header: '고객명', width: '127', styleName: 'text-center' },
    { fieldName: 'col13', header: '작성일시', width: '148', styleName: 'text-center' },
    { fieldName: 'col14', header: '접수일시', width: '127', styleName: 'text-center' },
    { fieldName: 'col15', header: '삭제(취소)일시', width: '127', styleName: 'text-center' },
    { fieldName: 'col16', header: '요청내역', width: '147', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true },
    { fieldName: 'col17', header: '계약서 발송여부', width: '127', styleName: 'text-center' },
    { fieldName: 'col18', header: '계약서 발송일자', width: '127', styleName: 'text-center' },
    { fieldName: 'col19', header: '알림톡 발송일자', width: '127', styleName: 'text-center' },
    { fieldName: 'col20', header: '알림톡 발송내역', width: '147', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true },
    { fieldName: 'col21', header: '알림톡 수신여부', width: '127', styleName: 'text-center' },
    { fieldName: 'col22', header: '알림톡 발송일자', width: '127', styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }))
    .filter((visible) => visible);
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  // view.displayOptions.selectionStyle = 'singleRow';
  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    console.log('itemIndex', itemIndex);
    if (['col16'].includes(column)) {
      // const { fstRgstUsrId, fnlMdfcUsrId } = gridUtil.getRowValue(g, itemIndex);
      await modal({ component: 'WwConfirmApprovalAskIzListP', componentProps: { cntrNo: 'W20220497192' } }); // 확정 승인 요청 내역
    } else if (['col20'].includes(column)) {
      await modal({ component: 'WwKakaotalkForwardingIzListP', componentProps: { mtPr: '407', concDiv: 'R' } }); // 카카오톡 발송 내역 조회
    }
  };

  view.onCellClicked = (g, clickData) => {
    if (clickData.cellType === 'data') {
      // Data Row Click시 checkbar toggle 적용
      view.checkRow(clickData.dataRow, !view.getCheckedItems().includes(clickData.dataRow));
    }
  };

  data.setRows([
    { col1: '확정승인', col2: 'G930000', col3: 'W910051', col4: '신규계약', col5: '2022-1234567 외 2건', col6: '012345678', col7: '1234567', col8: '확정', col9: '결제중', col10: '방문', col11: '렌탈', col12: '김고객', col13: '2022-12-12 12:00:00', col14: '2022-12-12', col15: '2022-12-12', col16: '요청내역', col17: '-', col18: '-', col19: '2022-12-12', col20: '발송내역조회', col21: 'Y', col22: '2022-12-12' },
    { col1: '확정승인', col2: 'G930000', col3: 'W910051', col4: '신규계약', col5: '2022-1234567 외 2건', col6: '012345678', col7: '1234567', col8: '확정', col9: '결제중', col10: '방문', col11: '렌탈', col12: '김고객', col13: '2022-12-12 12:00:00', col14: '2022-12-12', col15: '2022-12-12', col16: '요청내역', col17: '-', col18: '-', col19: '2022-12-12', col20: '발송내역조회', col21: 'Y', col22: '2022-12-12' },
    { col1: '확정승인', col2: 'G930000', col3: 'W910051', col4: '신규계약', col5: '2022-1234567 외 2건', col6: '012345678', col7: '1234567', col8: '확정', col9: '결제중', col10: '방문', col11: '렌탈', col12: '김고객', col13: '2022-12-12 12:00:00', col14: '2022-12-12', col15: '2022-12-12', col16: '요청내역', col17: '-', col18: '-', col19: '2022-12-12', col20: '발송내역조회', col21: 'Y', col22: '2022-12-12' },
    { col1: '확정승인', col2: 'G930000', col3: 'W910051', col4: '신규계약', col5: '2022-1234567 외 2건', col6: '012345678', col7: '1234567', col8: '확정', col9: '결제중', col10: '방문', col11: '렌탈', col12: '김고객', col13: '2022-12-12 12:00:00', col14: '2022-12-12', col15: '2022-12-12', col16: '요청내역', col17: '-', col18: '-', col19: '2022-12-12', col20: '발송내역조회', col21: 'Y', col22: '2022-12-12' },
    { col1: '확정승인', col2: 'G930000', col3: 'W910051', col4: '신규계약', col5: '2022-1234567 외 2건', col6: '012345678', col7: '1234567', col8: '확정', col9: '결제중', col10: '방문', col11: '렌탈', col12: '김고객', col13: '2022-12-12 12:00:00', col14: '2022-12-12', col15: '2022-12-12', col16: '요청내역', col17: '-', col18: '-', col19: '2022-12-12', col20: '발송내역조회', col21: 'Y', col22: '2022-12-12' },
    { col1: '확정승인', col2: 'G930000', col3: 'W910051', col4: '신규계약', col5: '2022-1234567 외 2건', col6: '012345678', col7: '1234567', col8: '확정', col9: '결제중', col10: '방문', col11: '렌탈', col12: '김고객', col13: '2022-12-12 12:00:00', col14: '2022-12-12', col15: '2022-12-12', col16: '요청내역', col17: '-', col18: '-', col19: '2022-12-12', col20: '발송내역조회', col21: 'Y', col22: '2022-12-12' },
    { col1: '확정승인', col2: 'G930000', col3: 'W910051', col4: '신규계약', col5: '2022-1234567 외 2건', col6: '012345678', col7: '1234567', col8: '확정', col9: '결제중', col10: '방문', col11: '렌탈', col12: '김고객', col13: '2022-12-12 12:00:00', col14: '2022-12-12', col15: '2022-12-12', col16: '요청내역', col17: '-', col18: '-', col19: '2022-12-12', col20: '발송내역조회', col21: 'Y', col22: '2022-12-12' },
    { col1: '확정승인', col2: 'G930000', col3: 'W910051', col4: '신규계약', col5: '2022-1234567 외 2건', col6: '012345678', col7: '1234567', col8: '확정', col9: '결제중', col10: '방문', col11: '렌탈', col12: '김고객', col13: '2022-12-12 12:00:00', col14: '2022-12-12', col15: '2022-12-12', col16: '요청내역', col17: '-', col18: '-', col19: '2022-12-12', col20: '발송내역조회', col21: 'Y', col22: '2022-12-12' },
  ]);
});

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

  ];

  const columns = [
    { fieldName: 'col1', header: '계약번호', width: '147', styleName: 'text-center' },
    { fieldName: 'col2', header: '계약상태', width: '92', styleName: 'text-center' },
    { fieldName: 'col3', header: '배송정보', width: '376' },
    { fieldName: 'col4', header: '기긱종류', width: '92', styleName: 'text-center' },
    { fieldName: 'col5', header: '계약유형', width: '125', styleName: 'text-center' },
    { fieldName: 'col6', header: '구매유형', width: '298' },
    { fieldName: 'col7', header: '상품명', width: '163', styleName: 'text-center' },
    { fieldName: 'col8', header: '수량', width: '92', styleName: 'text-center' },
    { fieldName: 'col9', header: '판매금액', width: '130', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '2022-1234567', col2: '결제완료', col3: '서울 종로구 을지로 입구역 교원내외빌딩 123', col4: '-', col5: '정기구매(12개월)', col6: '패키지(활력슬림쏙12박스)', col7: '활력슬림쏙', col8: '3', col9: '120.000' },
  ]);
}
</script>
