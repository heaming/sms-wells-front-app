<!----
****************************************************************************************************
1. 모듈 : DCD
2. 프로그램 ID : ZwWeddingApplicationMgtM - 결혼화환/조화 신청
3. 작성자 : gs.piit172
4. 작성일 : 2023.02.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 결혼화환/조화 신청 프로그램
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item label="경조유형">
          <kw-option-group
            :model-value="'전체'"

            :options="['전체', '결혼', '조의']"
          />
        </kw-search-item>
        <kw-search-item label="처리상태">
          <kw-option-group
            :model-value="'전체'"

            :options="['전체', '신청', '접수완료', '비대상']"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          label="법인구분"
          disable
        >
          <kw-select
            :model-value="searchParams.CorporationDivide"
            :options="companyCode"
            readonly
          />
        </kw-search-item>
        <kw-search-item
          label="신청일자"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.applicationDateFrom"
            v-model:to="searchParams.applicationDateTo"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          label="조직레벨"
          disable
        >
          <kw-select
            :v-model="searchParams.corporationDivide"
            :model-value="['총괄단']"
            :options="['총괄단', 'B', 'C', 'D']"
          />
          <kw-select
            :model-value="['센터']"
            :options="['센터', 'B', 'C', 'D']"
          />
          <kw-select
            :model-value="['지국']"
            :options="['지국', 'B', 'C', 'D']"
          />
        </kw-search-item>
        <kw-search-item label="번호">
          <kw-input
            v-model="searchParams.empNo"
            icon="search"
            rules="required|numeric"
            clearable
            @click-icon="onClickIcon"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :page-size="10"
            :page-size-options="[10,20,30,40,50]"
            :total-count="156"
          />
        </template>
        <kw-btn
          label="삭제"
          grid-action
          dense
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          label="저장"
          grid-action
          dense
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          label="엑셀 다운로드"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          label="신청"
          primary
          dense
          @click="onClickApplication"
        />
      </kw-action-top>

      <kw-grid
        :visible-rows="10"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>
<script setup>
import { useGlobal } from 'kw-lib'; // , useDataService
import dayjs from 'dayjs';

const now = dayjs();
const { modal, notify } = useGlobal();
const store = useStore();
// const dataService = useDataService();
// const { t } = useI18n();
const companyCode = ref([{ codeId: store.getters['meta/getUserInfo'].companyCode, codeName: store.getters['meta/getUserInfo'].companyName }]);

const searchParams = ref({
  applicationDateFrom: now.add(-30, 'day').format('YYYYMMDD'),
  applicationDateTo: now.format('YYYYMMDD'),
  CorporationDivide: companyCode.value[0].codeId,
  empNo: store.getters['meta/getUserInfo'].employeeIDNumber, // TODO employeeIDNumber 값이 없음...
  corporationDivide: store.getters['meta/getUserInfo'].companyCode === '웰스' ? '웰스' : '에듀', // 1000 - 웰스

});

// 번호 사번 세션 employeeIDNumber 값이 없음

async function fetchData() {
  // 상시 notify 메세지를 띄어 달라는 요구사항 퍼블을 고쳐야 할지 논의가 필요...
  await notify('·평일 야간 및 주말(공휴일 포함)은 교원라이프 고객센터 1588-0060 로 신청해 주시기 바랍니다.');
  // await notify(t('MSG_ALT_SAVE_DATA'));
}

async function onClickApplication() {
  const { result, payload } = await modal({
    component: 'ZwWeddingApplicationRgstMdfcMgtP',
    componentProps: {},
  });
  if (result) {
    const tt = payload.codeId;
    console.log(tt);
  }
}

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
    { fieldName: 'col1', header: '경조유형', width: '80', styleName: 'text-left' },
    { fieldName: 'col2', header: '법인', width: '87', styleName: 'text-left' },
    { fieldName: 'col3', header: '신청일자', width: '100', styleName: 'text-center' },
    { fieldName: 'col4', header: '총괄단', width: '80', styleName: 'text-center' },
    { fieldName: 'col5', header: '센터', width: '80', styleName: 'text-left' },
    { fieldName: 'col6',
      header: '번호',
      width: '193',
      styleName: 'rg-button-link',
      renderer: {
        type: 'button',
      } },
    { fieldName: 'col7', header: '성명', width: '84', styleName: 'text-left' },
    { fieldName: 'col8', header: '직책', width: '76', styleName: 'text-left' },
    { fieldName: 'col9', header: '경조관계', width: '96', styleName: 'text-left' },
    { fieldName: 'col10', header: '경조일자', width: '99', styleName: 'text-center' },
    { fieldName: 'col11', header: '경조대상자', width: '96', styleName: 'text-left' },
    { fieldName: 'col12', header: '장소명', width: '123', styleName: 'text-left' },
    { fieldName: 'col13', header: '주소', width: '176', styleName: 'text-left' },
    { fieldName: 'col14', header: '연락처', width: '114', styleName: 'text-center' },
    { fieldName: 'col15', header: '상주명', width: '88', styleName: 'text-left' },
    { fieldName: 'col16', header: '처리상태', width: '145', styleName: 'text-left' },
    { fieldName: 'col17', header: '증빙서류', width: '85', styleName: 'text-left' },
    { fieldName: 'col18', header: '등록자', width: '86', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = false;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    // TODO 번호 : 신청자 사번 노출, 클릭 시 신청(조회)팝업[Z-CL-U-0002P01]
    if (column === 'col6') {
      const rowData = g.getValue(itemIndex, 'col6');
      await modal({
        component: '',
        componentProps: { rowData },
      });
    }
  };

  data.setRows([
    { col1: '결혼', col2: '에듀', col3: '2022-08-01', col4: '강북총괄단', col5: '호평센터', col6: '1111111', col7: '김산호', col8: '지국장', col9: '본인', col10: '2022-08-01', col11: '본인', col12: '라세느 웨딩홀', col13: '서울 중구 퇴계로18길 46', col14: '0101111111', col15: '-', col16: '임시저장', col17: 'Y', col18: '김교원' },
    { col1: '조의', col2: '웰스', col3: '2022-08-01', col4: '강북총괄단', col5: '지역단', col6: '1111111', col7: '최재림', col8: '센터장', col9: '자녀', col10: '2022-08-01', col11: '자녀', col12: '한국의집 예식장', col13: '서울 중구 퇴계로18길 46', col14: '0101111111', col15: '-', col16: '신청', col17: 'Y', col18: '김교원' },
    { col1: '조의', col2: '에듀', col3: '2022-08-01', col4: '강북총괄단', col5: '호평센터', col6: '1111111', col7: '최재림', col8: '지국장', col9: '아버지', col10: '2022-08-01', col11: '아버지', col12: '장례식장', col13: '서울 중구 퇴계로18길 46', col14: '0101111111', col15: '김자녀', col16: '신청(본사 승인중)', col17: 'Y', col18: '김교원' },
    { col1: '결혼', col2: '웰스', col3: '2022-08-01', col4: '강북총괄단', col5: '지역단', col6: '1111111', col7: '최재림', col8: '센터장', col9: '본인', col10: '2022-08-01', col11: '본인', col12: '라세느 웨딩홀', col13: '서울 중구 퇴계로18길 46', col14: '0101111111', col15: '-', col16: '신청(최종확정)', col17: 'Y', col18: '김교원' },
    { col1: '조의', col2: '에듀', col3: '2022-08-01', col4: '강북총괄단', col5: '호평센터', col6: '1111111', col7: '김산호', col8: '지국장', col9: '자녀', col10: '2022-08-01', col11: '자녀', col12: '한국의집 예식장', col13: '서울 중구 퇴계로18길 46', col14: '0101111111', col15: '-', col16: '접수완료', col17: 'Y', col18: '김교원' },
    { col1: '조의', col2: '웰스', col3: '2022-08-01', col4: '강북총괄단', col5: '지역단', col6: '1111111', col7: '최재림', col8: '센터장', col9: '아버지', col10: '2022-08-01', col11: '아버지', col12: '장례식장', col13: '서울 중구 퇴계로18길 46', col14: '0101111111', col15: '김자녀', col16: '비대상', col17: 'Y', col18: '김교원' },
    { col1: '결혼', col2: '에듀', col3: '2022-08-01', col4: '강북총괄단', col5: '호평센터', col6: '1111111', col7: '김산호', col8: '지국장', col9: '본인', col10: '2022-08-01', col11: '본인', col12: '라세느 웨딩홀', col13: '서울 중구 퇴계로18길 46', col14: '0101111111', col15: '-', col16: '임시저장', col17: 'Y', col18: '김교원' },
    { col1: '조의', col2: '웰스', col3: '2022-08-01', col4: '강북총괄단', col5: '지역단', col6: '1111111', col7: '최재림', col8: '센터장', col9: '자녀', col10: '2022-08-01', col11: '자녀', col12: '한국의집 예식장', col13: '서울 중구 퇴계로18길 46', col14: '0101111111', col15: '-', col16: '신청', col17: 'Y', col18: '김교원' },
    { col1: '조의', col2: '에듀', col3: '2022-08-01', col4: '강북총괄단', col5: '호평센터', col6: '1111111', col7: '김산호', col8: '지국장', col9: '아버지', col10: '2022-08-01', col11: '아버지', col12: '장례식장', col13: '서울 중구 퇴계로18길 46', col14: '0101111111', col15: '김자녀', col16: '신청(본사 승인중)', col17: 'Y', col18: '김교원' },
    { col1: '결혼', col2: '웰스', col3: '2022-08-01', col4: '강북총괄단', col5: '지역단', col6: '1111111', col7: '최재림', col8: '센터장', col9: '본인', col10: '2022-08-01', col11: '본인', col12: '라세느 웨딩홀', col13: '서울 중구 퇴계로18길 46', col14: '0101111111', col15: '-', col16: '신청(최종확정)', col17: 'Y', col18: '김교원' },

  ]);
}

onMounted(async () => {
  fetchData();
});
</script>
