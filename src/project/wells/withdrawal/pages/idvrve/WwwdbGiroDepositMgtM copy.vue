<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : idvrve
2. 프로그램 ID : WwwdbGiroDepositMgtM - 지로 입금 관리
3. 작성자 : heungjun.lee
4. 작성일 : 2023.02.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 지로 입금 관리 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_DP_DT')"
        >
          <!-- label="입금일자" -->
          <kw-date-picker />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PERF_DT')"
        >
          <kw-date-picker />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>
        <kw-btn
          dense
          secondary
          :label="t('MSG_BTN_SAVE')"
        />
        <!-- label="저장" -->
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-file
          v-show="false"
          ref="attachFileRef"
          v-model="file"
          :updatable="false"
          accept=".xlsx, .xls, .csv"
          @update:model-value="doUpload"
        />
        <kw-btn
          dense
          icon="upload_on"
          :label="$t('MSG_BTN_EXCEL_UP')"
          @click="onClickExcelUpload"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="t('MSG_BTN_EXCEL_DOWN')"
          :visible-rows="pageInfo.pageSize"
          @click="onClickExcelDownload"
        />
        <!-- label="엑셀 다운로드" -->
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          secondary
          dense
          :label="t('ERR_PROCS')"
        />
        <!-- label="오류처리" -->
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          primary
          dense
          label="입금등록"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
        name="grdMain"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { codeUtil, fileUtil, getComponentType, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const grdMainRef = ref(getComponentType('KwGrid'));
const codes = await codeUtil.getMultiCodes('COD_PAGE_SIZE_OPTIONS', 'COD_MSG_RESO_TYPE', 'COD_EXCEL_UPD_RESULT_TYPE');
// const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const file = ref(null);
const totalCount = ref(0);
const failedCount = ref(0);
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

const searchParams = ref({

});

let cachedParams;

// 조회 버튼
async function onClickSearch() {
  grdMainRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  // eslint-disable-next-line no-use-before-define
  await fetchData();
}

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/giro-deposits/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  const data = view.getDataSource();
  data.checkRowStates(false);
  data.setRows(pages);
  data.checkRowStates(true);
  view.resetCurrent();
}

// 엑셀 읽기
async function readExcel() {
  // 업로드 된 엑셀 파일을 서버에 전송해서 복호환 결과를 받는다.
  // 2번째 파라미터 : 업로드엑셀 컬럼 순서대로 dataService에 매핑할 fieldName을 입력한다.
  // 3번째 파라미터 : skip header line 수(default = 1)
  const data = await fileUtil.readExcel(
    file.value.nativeFile,
    ['col1', 'col2', 'col3', 'col4', 'col5', 'col6', 'col7', 'col8', 'col9', 'col10'],
  );

  return data.map((e) => ({
    ...e,
  }
  ));
}

const attachFileRef = ref();

async function doUpload() {
  // 엑셀 데이터 읽기(DRM 해제 처리)
  const messageResources = await readExcel();
  console.log(messageResources);
  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  // Grid 데이터 세팅
  data.clearRows();
  data.addRows(messageResources);

  // 성공/실패 건수 초기화
  totalCount.value = messageResources.length;
  failedCount.value = 0;
}
async function onClickExcelUpload() {
  attachFileRef.value.pickFiles();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
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
  ];

  const columns = [
    { fieldName: 'col1', header: '계약번호', width: '121', styleName: 'text-center' },
    { fieldName: 'col2', header: '고객명', width: '147', styleName: 'text-left' },
    { fieldName: 'col3', header: '입금일', width: '131', styleName: 'text-center' },
    { fieldName: 'col4', header: '실적일', width: '132', styleName: 'text-center' },
    { fieldName: 'col5', header: '입금금액', width: '211', styleName: 'text-right' },
    { fieldName: 'col6', header: '수수료', width: '221', styleName: 'text-right' },
    { fieldName: 'col7', header: '판매유형', width: '78', styleName: 'text-left' },
    { fieldName: 'col8', header: '입금유형', width: '104', styleName: 'text-left' },
    { fieldName: 'col9', header: '오류', width: '161', styleName: 'text-left' },
    { fieldName: 'col10', header: '대표 계약상세번호', width: '150', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      // eslint-disable-next-line no-use-before-define
      await fetchData();
    }
  };
}

</script>
<style scoped></style>
