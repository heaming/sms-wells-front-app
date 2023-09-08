<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctbOrderDetailChangeHistoryListM - wells 주문 상세 변경 이력 조회
3. 작성자 : jihoon.kim
4. 작성일 : 2023.05.18
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U0127] - 주문 변경에 대한 이력을 조회하는 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <!-- rev:230510 전면수정 -->
    <kw-search
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 계약상세번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
          colspan="2"
          required
        >
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            icon="search"
            class="w300"
            rules="required"
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <!-- 1. 계약변경이력 -->
      <h3>{{ $t('MSG_TXT_CNTR_CHG_HIST') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount1"
          />
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount1"
          @click="onClickExcelDownload1"
        />
      </kw-action-top>
      <kw-grid
        ref="grdCntrChgHistList"
        name="grdCntrChgHistList"
        :visible-rows="pageInfo.totalCount1 === 0 ? 1 : pageInfo.totalCount1"
        @init="initGridCntrChgHist"
      />
      <!-- 2. 계약상세변경이력 -->
      <h3>{{ $t('MSG_TXT_CNTR_DTL_CHG_HIST') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount2"
          />
          <span class="ml8">(단위: 원, 건, 개월)</span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount2"
          @click="onClickExcelDownload2"
        />
      </kw-action-top>
      <kw-grid
        ref="grdCntrDtlChgHistList"
        name="grdCntrDtlChgHistList"
        :visible-rows="pageInfo.totalCount2 === 0 ? 1 : pageInfo.totalCount2"
        @init="initGridCntrDtlChgHist"
      />
      <!-- 3. 계약고객관계이력 -->
      <h3>{{ $t('MSG_TXT_CNTR_CST_RLT_HIST') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount3"
          />
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount3"
          @click="onClickExcelDownload3"
        />
      </kw-action-top>
      <kw-grid
        ref="grdCntrCstRelList"
        name="grdCntrCstRelList"
        :visible-rows="pageInfo.totalCount3 === 0 ? 1 : pageInfo.totalCount3"
        @init="initGridCntrCstRel"
      />
      <!-- 4. 계약파트너관계 -->
      <h3>{{ $t('MSG_TXT_CNTR_PRTNR_RLT') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount4"
          />
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount4"
          @click="onClickExcelDownload4"
        />
      </kw-action-top>
      <kw-grid
        ref="grdCntrPrtnrRelList"
        name="grdCntrPrtnrRelList"
        :visible-rows="pageInfo.totalCount4 === 0 ? 1 : pageInfo.totalCount4"
        @init="initGridCntrPrtnrRel"
      />
      <!-- 5. 계약주소관계이력 -->
      <h3>{{ $t('MSG_TXT_CNTR_ADR_RLT_HIST') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount5"
          />
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount5"
          @click="onClickExcelDownload5"
        />
      </kw-action-top>
      <kw-grid
        ref="grdCntrAdrRelList"
        name="grdCntrAdrRelList"
        :visible-rows="pageInfo.totalCount5 === 0 ? 1 : pageInfo.totalCount5"
        @init="initGridCntrAdrRel"
      />
      <!-- 6. 계약주소변경이력 -->
      <h3>{{ $t('MSG_TXT_CNTR_ADR_CHG_HIST') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount6"
          />
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount6"
          @click="onClickExcelDownload6"
        />
      </kw-action-top>
      <kw-grid
        ref="grdCntrAdrChgHistList"
        name="grdCntrAdrChgHistList"
        :visible-rows="pageInfo.totalCount6 === 0 ? 1 : pageInfo.totalCount6"
        @init="initGridCntrAdrChgHist"
      />
      <!-- 7. 계약결제관계이력 -->
      <h3>{{ $t('MSG_TXT_CNTR_STLM_RLT_HIST') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount7"
          />
          <span class="ml8">(단위: 원)</span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount7"
          @click="onClickExcelDownload7"
        />
      </kw-action-top>
      <kw-grid
        ref="grdCntrStlmRelList"
        name="grdCntrStlmRelList"
        :visible-rows="pageInfo.totalCount7 === 0 ? 1 : pageInfo.totalCount7"
        @init="initGridCntrStlmRel"
      />
      <!-- 8. 계약결제변경이력 -->
      <h3>{{ $t('MSG_TXT_CNTR_STLM_CHG_HIST') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount8"
          />
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount8"
          @click="onClickExcelDownload8"
        />
      </kw-action-top>
      <kw-grid
        ref="grdCntrStlmChgHistList"
        name="grdCntrStlmChgHistList"
        :visible-rows="pageInfo.totalCount8 === 0 ? 1 : pageInfo.totalCount8"
        @init="initGridCntrStlmChgHist"
      />
      <!-- 9. 계약WELLS상세변경이력 -->
      <h3>{{ $t('MSG_TXT_CNTR_WELLS_DTL_CHG_HIST') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount9"
          />
          <span class="ml8">(단위: 개월)</span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount9"
          @click="onClickExcelDownload9"
        />
      </kw-action-top>
      <kw-grid
        ref="grdCntrWellsDtlChgHistList"
        name="grdCntrWellsDtlChgHistList"
        :visible-rows="pageInfo.totalCount9 === 0 ? 1 : pageInfo.totalCount9"
        @init="initGridCntrWellsDtlChgHist"
      />
      <!-- 10. 계약관계이력 -->
      <h3>{{ $t('MSG_TXT_CNTR_RLT_HIST') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount10"
          />
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount10"
          @click="onClickExcelDownload10"
        />
      </kw-action-top>
      <kw-grid
        ref="grdCntrRelList"
        name="grdCntrRelList"
        :visible-rows="pageInfo.totalCount10 === 0 ? 1 : pageInfo.totalCount10"
        @init="initGridCntrRel"
      />
      <!-- 11. 기기변경이력 -->
      <h3>{{ $t('MSG_TXT_MCHN_CHG_HIST') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount11"
          />
          <span class="ml8">(단위: 개월)</span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount11"
          @click="onClickExcelDownload11"
        />
      </kw-action-top>
      <kw-grid
        ref="grdCntrMchnChgHistList"
        name="grdCntrMchnChgHistList"
        :visible-rows="pageInfo.totalCount11 === 0 ? 1 : pageInfo.totalCount11"
        @init="initGridCntrMchnChgHist"
      />
      <!-- 12. 렌탈재약정변경이력 -->
      <h3>{{ $t('MSG_TXT_RNTL_RSTL_CHG_HIST') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount12"
          />
          <span class="ml8">(단위: 원,개월)</span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount12"
          @click="onClickExcelDownload12"
        />
      </kw-action-top>
      <kw-grid
        ref="grdRentalRstlChgHistList"
        name="grdRentalRstlChgHistList"
        :visible-rows="pageInfo.totalCount12 === 0 ? 1 : pageInfo.totalCount12"
        @init="initGridRentalRstlChgHist"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, useDataService, gridUtil, useGlobal, defineGrid } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const dataService = useDataService();
const { t } = useI18n();
const { alert } = useGlobal();
// const { getConfig } = useMeta();
const { currentRoute } = useRouter();

let cachedParams;
const searchParams = ref({
  cntrNo: '',
  cntrSn: '',
});
const pageInfo = ref({
  totalCount1: 0,
  totalCount2: 0,
  totalCount3: 0,
  totalCount4: 0,
  totalCount5: 0,
  totalCount6: 0,
  totalCount7: 0,
  totalCount8: 0,
  totalCount9: 0,
  totalCount10: 0,
  totalCount11: 0,
  totalCount12: 0,
  needTotalCount: true,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdCntrChgHistList = ref(getComponentType('KwGrid'));
const grdCntrDtlChgHistList = ref(getComponentType('KwGrid'));
const grdCntrCstRelList = ref(getComponentType('KwGrid'));
const grdCntrPrtnrRelList = ref(getComponentType('KwGrid'));
const grdCntrAdrRelList = ref(getComponentType('KwGrid'));
const grdCntrAdrChgHistList = ref(getComponentType('KwGrid'));
const grdCntrStlmRelList = ref(getComponentType('KwGrid'));
const grdCntrStlmChgHistList = ref(getComponentType('KwGrid'));
const grdCntrWellsDtlChgHistList = ref(getComponentType('KwGrid'));
const grdCntrRelList = ref(getComponentType('KwGrid'));
const grdCntrMchnChgHistList = ref(getComponentType('KwGrid'));
const grdRentalRstlChgHistList = ref(getComponentType('KwGrid'));

async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  res = await dataService.get('/sms/wells/contract/changeorders/order-change-history', { params: cachedParams });

  if (res.data.length === 0) {
    await alert(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    return;
  }

  console.log(res.data);

  // 계약변경이력
  const view1 = grdCntrChgHistList.value.getView();
  view1.getDataSource().setRows(res.data.searchTbSsctCntrChHistResList);
  pageInfo.value.totalCount1 = view1.getItemCount();
  view1.resetCurrent();

  // 계약상세변경이력
  const view2 = grdCntrDtlChgHistList.value.getView();
  view2.getDataSource().setRows(res.data.searchTbSsctCntrDchHistResList);
  pageInfo.value.totalCount2 = view2.getItemCount();
  view2.resetCurrent();

  // 계약고객관계
  const view3 = grdCntrCstRelList.value.getView();
  view3.getDataSource().setRows(res.data.searchTbSsctCntrCstRelResList);
  pageInfo.value.totalCount3 = view3.getItemCount();
  view3.resetCurrent();

  // 계약파트너관계
  const view4 = grdCntrPrtnrRelList.value.getView();
  view4.getDataSource().setRows(res.data.searchTbSsctCntrPrtnrRelResList);
  pageInfo.value.totalCount4 = view4.getItemCount();
  view4.resetCurrent();

  // 계약주소관계
  const view5 = grdCntrAdrRelList.value.getView();
  view5.getDataSource().setRows(res.data.searchTbSsctCntrAdrRelResList);
  pageInfo.value.totalCount5 = view5.getItemCount();
  view5.resetCurrent();

  // 계약주소변경이력
  const view6 = grdCntrAdrChgHistList.value.getView();
  view6.getDataSource().setRows(res.data.searchTbSsctCntrAdrChHistResList);
  pageInfo.value.totalCount6 = view6.getItemCount();
  view6.resetCurrent();

  // 계약결제관계
  const view7 = grdCntrStlmRelList.value.getView();
  view7.getDataSource().setRows(res.data.searchTbSsctCntrStlmRelResList);
  pageInfo.value.totalCount7 = view7.getItemCount();
  view7.resetCurrent();

  // 계약결제변경이력
  const view8 = grdCntrStlmChgHistList.value.getView();
  view8.getDataSource().setRows(res.data.searchTbSsctCntrStlmChHistResList);
  pageInfo.value.totalCount8 = view8.getItemCount();
  view8.resetCurrent();

  // 계약WELLS상세변경이력
  const view9 = grdCntrWellsDtlChgHistList.value.getView();
  view9.getDataSource().setRows(res.data.searchTbSsctCntrWellsDchHistResList);
  pageInfo.value.totalCount9 = view9.getItemCount();
  view9.resetCurrent();

  // 계약관계
  const view10 = grdCntrRelList.value.getView();
  view10.getDataSource().setRows(res.data.searchTbSsctCntrRelResList);
  pageInfo.value.totalCount10 = view10.getItemCount();
  view10.resetCurrent();

  // 기기변경이력
  const view11 = grdCntrMchnChgHistList.value.getView();
  view11.getDataSource().setRows(res.data.searchTbSsctMchnChHistResList);
  pageInfo.value.totalCount11 = view11.getItemCount();
  view11.resetCurrent();

  // 렌탈재약정변경이력
  const view12 = grdRentalRstlChgHistList.value.getView();
  view12.getDataSource().setRows(res.data.searchTbSsctRentalRstlChHistResList);
  pageInfo.value.totalCount12 = view12.getItemCount();
  view12.resetCurrent();
}

async function onClickSearch() {
  await fetchData();
}

// 계약변경이력 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload1() {
  const view = grdCntrChgHistList.value.getView();
  const res = await dataService.get('/sms/wells/contract/changeorders/order-change-history/excel-download1', { params: cachedParams });
  console.log(res.data);
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 계약상세변경이력 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload2() {
  const view = grdCntrDtlChgHistList.value.getView();
  const res = await dataService.get('/sms/wells/contract/changeorders/order-change-history/excel-download2', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 계약고객관계 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload3() {
  const view = grdCntrCstRelList.value.getView();
  const res = await dataService.get('/sms/wells/contract/changeorders/order-change-history/excel-download3', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 계약파트너관계 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload4() {
  const view = grdCntrPrtnrRelList.value.getView();
  const res = await dataService.get('/sms/wells/contract/changeorders/order-change-history/excel-download4', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 계약주소관계 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload5() {
  const view = grdCntrAdrRelList.value.getView();
  const res = await dataService.get('/sms/wells/contract/changeorders/order-change-history/excel-download5', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data.searchTbSsctCntrAdrRelResList,
  });
}

// 계약주소변경이력 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload6() {
  const view = grdCntrAdrChgHistList.value.getView();
  const res = await dataService.get('/sms/wells/contract/changeorders/order-change-history/excel-download6', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 계약결제관계 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload7() {
  const view = grdCntrStlmRelList.value.getView();
  const res = await dataService.get('/sms/wells/contract/changeorders/order-change-history/excel-download7', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 계약결제변경이력 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload8() {
  const view = grdCntrStlmChgHistList.value.getView();
  const res = await dataService.get('/sms/wells/contract/changeorders/order-change-history/excel-download8', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 계약WELLS상세변경이력 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload9() {
  const view = grdCntrWellsDtlChgHistList.value.getView();
  const res = await dataService.get('/sms/wells/contract/changeorders/order-change-history/excel-download9', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 계약관계 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload10() {
  const view = grdCntrRelList.value.getView();
  const res = await dataService.get('/sms/wells/contract/changeorders/order-change-history/excel-download10', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 기기변경이력 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload11() {
  const view = grdCntrMchnChgHistList.value.getView();
  const res = await dataService.get('/sms/wells/contract/changeorders/order-change-history/excel-download11', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 렌탈재약정변경이력 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload12() {
  const view = grdRentalRstlChgHistList.value.getView();
  const res = await dataService.get('/sms/wells/contract/changeorders/order-change-history/excel-download12', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
  // await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridCntrChgHist = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'histStrtDtm' }, // 이력시작일시
    { fieldName: 'histEndDtm' }, // 이력종료일시
    { fieldName: 'cntrCstNo' }, // 계약고객번호
    { fieldName: 'copnDvCd' }, // 법인격구분코드
    { fieldName: 'sellInflwChnlDtlCd' }, // 판매유입채널상세코드
    { fieldName: 'sellOgTpCd' }, // 판매조직유형코드
    { fieldName: 'sellPrtnrNo' }, // 판매파트너번호
    { fieldName: 'cntrTpCd' }, // 계약유형코드
    { fieldName: 'cntrNatCd' }, // 계약국가코드
    { fieldName: 'cntrPrgsStatCd' }, // 계약진행상태코드
    { fieldName: 'cstStlmInMthCd' }, // 고객결제입력방법코드
    { fieldName: 'prrRcpCntrYn' }, // 사전접수계약여부
    { fieldName: 'cntrTempSaveDtm' }, // 계약임시저장일시
    { fieldName: 'cntrRcpFshDtm' }, // 계약접수완료일시
    { fieldName: 'cntrStlmFshDtm' }, // 계약결제완료일시
    { fieldName: 'cntrCnfmAprAkDtm' }, // 계약확정승인요청일시
    { fieldName: 'cntrCnfmAprDtm' }, // 계약확정승인일시
    { fieldName: 'cntrCnfmDtm' }, // 계약확정일시
    { fieldName: 'cntrCanDtm' }, // 계약취소일시
    { fieldName: 'cntrCanRsonCd' }, // 계약취소사유코드
    { fieldName: 'cntrPrgsStatMoCn' }, // 계약진행상태메모내용
    { fieldName: 'dsbGurTpCd' }, // 지급보증유형코드
    { fieldName: 'cntrInflwPhDvCd' }, // 계약유입경로구분코드
    { fieldName: 'pspcCstId' }, // 가망고객ID
    { fieldName: 'cntrChRcpId' }, // 계약변경접수ID
    { fieldName: 'dcevdnDocId' }, // 증빙서류문서ID
    { fieldName: 'dtaDlYn' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId' }, // 최종수정부서ID
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '200', styleName: 'text-center' }, // 계약번호
    { fieldName: 'histStrtDtm', header: t('MSG_TXT_HIST_STRT_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 이력시작일시
    { fieldName: 'histEndDtm', header: t('MSG_TXT_HIST_END_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 이력종료일시
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CNTR_CST_NO'), width: '200', styleName: 'text-center' }, // 계약고객번호
    { fieldName: 'copnDvCd', header: t('MSG_TXT_COPN_DV_CD'), width: '200', styleName: 'text-center' }, // 법인격구분코드
    { fieldName: 'sellInflwChnlDtlCd', header: t('MSG_TXT_SELL_INFLW_CHNL_DTL_CD'), width: '250', styleName: 'text-center' }, // 판매유입채널상세코드
    { fieldName: 'sellOgTpCd', header: t('MSG_TXT_SELL_OG_TP_CD'), width: '200', styleName: 'text-center' }, // 판매조직유형코드
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_SELL_PRTNR_NO'), width: '200', styleName: 'text-center' }, // 판매파트너번호
    { fieldName: 'cntrTpCd', header: t('MSG_TXT_CNTR_TP_CD'), width: '200', styleName: 'text-center' }, // 계약유형코드
    { fieldName: 'cntrNatCd', header: t('MSG_TXT_CNTR_NAT_CD'), width: '200', styleName: 'text-center' }, // 계약국가코드
    { fieldName: 'cntrPrgsStatCd', header: t('MSG_TXT_CNTR_PRGS_STAT_CD'), width: '200', styleName: 'text-center' }, // 계약진행상태코드
    { fieldName: 'cstStlmInMthCd', header: t('MSG_TXT_CST_STLM_IPT_MTH_CD'), width: '250', styleName: 'text-center' }, // 고객결제입력방법코드
    { fieldName: 'prrRcpCntrYn', header: t('MSG_TXT_PRR_RCP_CNTR_YN'), width: '200', styleName: 'text-center' }, // 사전접수계약여부
    { fieldName: 'cntrTempSaveDtm', header: t('MSG_TXT_CNTR_TEMP_SAVE_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 계약임시저장일시
    { fieldName: 'cntrRcpFshDtm', header: t('MSG_TXT_CNTR_RCP_FSH_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 계약접수완료일시
    { fieldName: 'cntrStlmFshDtm', header: t('MSG_TXT_CNTR_STLM_FSH_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 계약결제완료일시
    { fieldName: 'cntrCnfmAprAkDtm', header: t('MSG_TXT_CNTR_CNFM_APR_AK_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 계약확정승인요청일시
    { fieldName: 'cntrCnfmAprDtm', header: t('MSG_TXT_CNTR_CNFM_APR_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 계약확정승인일시
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_CNTR_CNFM_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 계약확정일시
    { fieldName: 'cntrCanDtm', header: t('MSG_TXT_CNTR_CAN_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 계약취소일시
    { fieldName: 'cntrCanRsonCd', header: t('MSG_TXT_CNTR_CAN_RSON_CD'), width: '200', styleName: 'text-left' }, // 계약취소사유코드
    { fieldName: 'cntrPrgsStatMoCn', header: t('MSG_TXT_CNTR_PRGS_STAT_MO_CN'), width: '250', styleName: 'text-left' }, // 계약진행상태메모내용
    { fieldName: 'dsbGurTpCd', header: t('MSG_TXT_DSB_GUR_TP_CD'), width: '200', styleName: 'text-left' }, // 지급보증유형코드
    { fieldName: 'cntrInflwPhDvCd', header: t('MSG_TXT_CNTR_INFLW_PH_DV_CD'), width: '250', styleName: 'text-left' }, // 계약유입경로구분코드
    { fieldName: 'pspcCstId', header: t('MSG_TXT_PSPC_CST_ID'), width: '200', styleName: 'text-center' }, // 가망고객ID
    { fieldName: 'cntrChRcpId', header: t('MSG_TXT_CNTR_CH_RCP_ID'), width: '200', styleName: 'text-center' }, // 계약변경접수ID
    { fieldName: 'dcevdnDocId', header: t('MSG_TXT_DCEVDN_DCMT_ID'), width: '200', styleName: 'text-center' }, // 증빙서류문서ID

    { fieldName: 'dtaDlYn', header: t('MSG_TXT_DTA_DEL_YN'), width: '200', styleName: 'text-center' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FRST_RGST_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR_ID'), width: '200', styleName: 'text-center' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId', header: t('MSG_TXT_FST_RGST_PRG_ID'), width: '250', styleName: 'text-center' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId', header: t('MSG_TXT_FST_RGST_DEPT'), width: '200', styleName: 'text-center' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_FNL_MDFC_USR_ID'), width: '200', styleName: 'text-center' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId', header: t('MSG_TXT_FNL_MDFC_PRG_ID'), width: '250', styleName: 'text-center' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId', header: t('MSG_TXT_FNL_MDFC_DEPT'), width: '200', styleName: 'text-center' }, // 최종수정부서ID
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});

const initGridCntrDtlChgHist = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'histStrtDtm' }, // 이력시작일시
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'histEndDtm' }, // 이력종료일시
    { fieldName: 'basePdCd' }, // 기준상품코드
    { fieldName: 'hgrPdCd' }, // 상위상품코드
    { fieldName: 'pdQty', dataType: 'number' }, // 상품수량
    { fieldName: 'sellTpNm' }, // 판매유형코드
    { fieldName: 'sellTpDtlNm' }, // 판매유형상세코드
    { fieldName: 'cntrDtlStatCd' }, // 계약상세상태코드
    { fieldName: 'cntrDtlStatNm' }, // 계약상세상태코드명
    { fieldName: 'cntrPtrmUnitNm' }, // 계약기간단위코드
    { fieldName: 'cntrPtrm' }, // 계약기간
    { fieldName: 'cntrPdStrtdt' }, // 계약상품시작일자
    { fieldName: 'cntrPdEnddt' }, // 계약상품종료일자
    { fieldName: 'stplPtrmUnitNm' }, // 약정기간단위코드
    { fieldName: 'stplPtrm' }, // 약정기간
    { fieldName: 'svPtrmUnitNm' }, // 서비스기간단위코드
    { fieldName: 'svPrd', dataType: 'number' }, // 서비스주기
    { fieldName: 'cntrwTpNm' }, // 계약서유형코드
    { fieldName: 'blgCrpCd' }, // 소속법인코드
    { fieldName: 'rveCrpCd' }, // 수납법인코드
    { fieldName: 'coCd' }, // 회사코드
    { fieldName: 'booSellTpNm' }, // 예약판매유형코드
    { fieldName: 'pdGdNm' }, // 상품등급코드
    { fieldName: 'pdHclsfId' }, // 상품대분류ID
    { fieldName: 'pdMclsfId' }, // 상품중분류ID
    { fieldName: 'pdLclsfId' }, // 상품소분류ID
    { fieldName: 'pdDclsfId' }, // 상품세분류ID
    { fieldName: 'sellDscDvCd' }, // 판매할인구분코드
    { fieldName: 'sellDscrCd' }, // 판매할인율코드
    { fieldName: 'sellDscCtrAmt', dataType: 'number' }, // 판매할인조정금액
    { fieldName: 'sellDscTpCd' }, // 판매할인유형코드
    { fieldName: 'stlmTpNm' }, // 결제유형코드
    { fieldName: 'crncyDvNm' }, // 통화구분코드
    { fieldName: 'apyExcr' }, // 적용환율
    { fieldName: 'pdBaseAmt', dataType: 'number' }, // 상품기준금액
    { fieldName: 'sellAmt', dataType: 'number' }, // 판매금액
    { fieldName: 'dscAmt', dataType: 'number' }, // 할인금액
    { fieldName: 'fnlAmt', dataType: 'number' }, // 최종금액
    { fieldName: 'vat', dataType: 'number' }, // 부가가치세
    { fieldName: 'cntrAmt', dataType: 'number' }, // 계약금액
    { fieldName: 'cntramDscAmt', dataType: 'number' }, // 계약금할인금액
    { fieldName: 'istmMcn' }, // 할부개월수
    { fieldName: 'istmPcamAmt', dataType: 'number' }, // 할부원금금액
    { fieldName: 'istmIntAmt', dataType: 'number' }, // 할부이자금액
    { fieldName: 'mmIstmAmt', dataType: 'number' }, // 월할부금액
    { fieldName: 'crpUcAmt', dataType: 'number' }, // 법인미수금액
    { fieldName: 'sellFee', dataType: 'number' }, // 판매수수료
    { fieldName: 'cntrTam', dataType: 'number' }, // 계약총액
    { fieldName: 'ackmtPerfRt', dataType: 'number' }, // 인정실적율
    { fieldName: 'ackmtPerfAmt', dataType: 'number' }, // 인정실적금액
    { fieldName: 'cvtPerfAmt', dataType: 'number' }, // 환산실적금액
    { fieldName: 'feeAckmtCt' }, // 수수료인정건수
    { fieldName: 'feeAckmtBaseAmt', dataType: 'number' }, // 수수료인정기준금액
    { fieldName: 'feeFxamYn' }, // 수수료정액여부
    { fieldName: 'sppDuedt' }, // 배송예정일자
    { fieldName: 'resubYn' }, // 재구독여부
    { fieldName: 'rstlYn' }, // 재약정여부
    { fieldName: 'frisuYn' }, // 무상여부
    { fieldName: 'frisuDsbTpNm' }, // 무상지급유형코드
    { fieldName: 'txinvPblOjYn' }, // 세금계산서발행대상여부
    { fieldName: 'alncmpNm' }, // 제휴사코드
    { fieldName: 'alncmpCntrDrmVal' }, // 제휴사계약식별값
    { fieldName: 'smtplId' }, // 스마트플랜ID
    { fieldName: 'smtplSn' }, // 스마트플랜일련번호
    { fieldName: 'bfOrdNo' }, // 이전주문번호
    { fieldName: 'cntrChRcpId' }, // 계약변경접수ID
    { fieldName: 'cntrChSn' }, // 계약변경일련번호
    { fieldName: 'cntrChDtlAkCn' }, // 계약변경상세요청내용
    { fieldName: 'dtaDlYn' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId' }, // 최종수정부서ID
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '200', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'histStrtDtm', header: t('MSG_TXT_HIST_STRT_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 이력시작일시
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '200', styleName: 'text-center' }, // 계약일련번호
    { fieldName: 'histEndDtm', header: t('MSG_TXT_HIST_END_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 이력종료일시
    { fieldName: 'basePdCd', header: t('MSG_TXT_PD_STD_CODE'), width: '200', styleName: 'text-left' }, // 기준상품코드
    { fieldName: 'hgrPdCd', header: t('MSG_TXT_HGR_PD_CD'), width: '200', styleName: 'text-left' }, // 상위상품코드
    { fieldName: 'pdQty', header: t('MSG_TXT_PROD_QUANT'), width: '200', styleName: 'text-right' }, // 상품수량
    { fieldName: 'sellTpNm', header: t('MSG_TXT_SELL_TP_CD'), width: '200', styleName: 'text-center' }, // 판매유형코드
    { fieldName: 'sellTpDtlNm', header: t('MSG_TXT_SELL_TYPE_DTL_CD'), width: '200', styleName: 'text-center' }, // 판매유형상세코드
    { fieldName: 'cntrDtlStatNm', header: t('MSG_TXT_CNTR_DTL_STAT_CD'), width: '200', styleName: 'text-center' }, // 계약상세상태코드
    { fieldName: 'cntrPtrmUnitNm', header: t('MSG_TXT_CNTR_PTRM_UNIT_CD'), width: '200', styleName: 'text-center' }, // 계약기간단위코드
    { fieldName: 'cntrPtrm', header: t('MSG_TXT_CNTR_PTRM'), width: '200', styleName: 'text-right' }, // 계약기간
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_CNTR_PD_STRT_DT'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 계약상품시작일자
    { fieldName: 'cntrPdEnddt', header: t('MSG_TXT_CNTR_PD_ENDDT'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 계약상품종료일자
    { fieldName: 'stplPtrmUnitNm', header: t('MSG_TXT_STPL_PTRM_UNIT_CD'), width: '200', styleName: 'text-center' }, // 약정기간단위코드
    { fieldName: 'stplPtrm', header: t('MSG_TXT_CONTRACT_PERI'), width: '200', styleName: 'text-right' }, // 약정기간
    { fieldName: 'svPtrmUnitNm', header: t('MSG_TXT_SV_PTRM_UNIT_CD'), width: '200', styleName: 'text-center' }, // 서비스기간단위코드
    { fieldName: 'svPrd', header: t('MSG_TXT_SVC_BETWEEN'), width: '200', styleName: 'text-right' }, // 서비스주기
    { fieldName: 'cntrwTpNm', header: t('MSG_TXT_CNTRW_TP_CD'), width: '200', styleName: 'text-center' }, // 계약서유형코드
    { fieldName: 'blgCrpCd', header: t('MSG_TXT_BLG_COB_CD'), width: '200', styleName: 'text-center' }, // 소속법인코드
    { fieldName: 'rveCrpCd', header: t('MSG_TXT_RVE_COB_CD'), width: '200', styleName: 'text-center' }, // 수납법인코드
    { fieldName: 'coCd', header: t('MSG_TXT_CPNY_CD'), width: '250', styleName: 'text-center' }, // 회사코드
    { fieldName: 'booSellTpNm', header: t('MSG_TXT_BOO_SELL_TP_CD'), width: '200', styleName: 'text-center' }, // 예약판매유형코드
    { fieldName: 'pdGdNm', header: t('MSG_TXT_PD_GRD_CD'), width: '200', styleName: 'text-left' }, // 상품등급코드
    { fieldName: 'pdHclsfId', header: t('MSG_TXT_PD_HCLSF_ID'), width: '200', styleName: 'text-center' }, // 상품대분류ID
    { fieldName: 'pdMclsfId', header: t('MSG_TXT_PRDT_MCLSF_ID'), width: '200', styleName: 'text-center' }, // 상품중분류ID
    { fieldName: 'pdLclsfId', header: t('MSG_TXT_PD_LCLSF_ID'), width: '200', styleName: 'text-center' }, // 상품소분류ID
    { fieldName: 'pdDclsfId', header: t('MSG_TXT_PD_DCLSF_ID'), width: '200', styleName: 'text-center' }, // 상품세분류ID
    { fieldName: 'sellDscDvCd', header: t('MSG_TXT_SELL_DSC_DV_CD'), width: '200', styleName: 'text-left' }, // 판매할인구분코드
    { fieldName: 'sellDscrCd', header: t('MSG_TXT_SELL_DSC_RT_CD'), width: '200', styleName: 'text-left' }, // 판매할인율코드
    { fieldName: 'sellDscCtrAmt', header: t('MSG_TXT_SELL_DSC_CTR_AMT'), width: '200', styleName: 'text-right' }, // 판매할인조정금액
    { fieldName: 'sellDscTpCd', header: t('MSG_TXT_SELL_DSC_TP_CD'), width: '200', styleName: 'text-left' }, // 판매할인유형코드
    { fieldName: 'stlmTpNm', header: t('MSG_TXT_STLM_TP_CD'), width: '200', styleName: 'text-left' }, // 결제유형코드
    { fieldName: 'crncyDvNm', header: t('MSG_TXT_CRNCY_DV_CD'), width: '200', styleName: 'text-left' }, // 통화구분코드
    { fieldName: 'apyExcr', header: t('MSG_TXT_APY_EXCHNG_RT'), width: '200', styleName: 'text-right' }, // 적용환율
    { fieldName: 'pdBaseAmt', header: t('MSG_TXT_PRDT_BASE_AMT'), width: '200', styleName: 'text-right' }, // 상품기준금액
    { fieldName: 'sellAmt', header: t('MSG_TXT_SALE_PRICE'), width: '200', styleName: 'text-right' }, // 판매금액
    { fieldName: 'dscAmt', header: t('MSG_TXT_DSC_AMT'), width: '200', styleName: 'text-right' }, // 할인금액
    { fieldName: 'fnlAmt', header: t('MSG_TXT_FNL_AMT'), width: '200', styleName: 'text-right' }, // 최종금액
    { fieldName: 'vat', header: t('MSG_TXT_VAL_ADD_TAX'), width: '200', styleName: 'text-right' }, // 부가가치세
    { fieldName: 'cntrAmt', header: t('MSG_TXT_CNTR_AMT'), width: '200', styleName: 'text-right' }, // 계약금액
    { fieldName: 'cntramDscAmt', header: t('MSG_TXT_CNTRAM_DSC_AMT'), width: '200', styleName: 'text-right' }, // 계약금할인금액
    { fieldName: 'istmMcn', header: t('MSG_TXT_ISTM_MCN'), width: '200', styleName: 'text-right' }, // 할부개월수
    { fieldName: 'istmPcamAmt', header: t('MSG_TXT_ISTM_PCAM_AMT'), width: '200', styleName: 'text-right' }, // 할부원금금액
    { fieldName: 'istmIntAmt', header: t('MSG_TXT_ISTM_INT_AMT'), width: '200', styleName: 'text-right' }, // 할부이자금액
    { fieldName: 'mmIstmAmt', header: t('MSG_TXT_MM_ISTM_AMT'), width: '200', styleName: 'text-right' }, // 월할부금액
    { fieldName: 'crpUcAmt', header: t('MSG_TXT_CRP_UC_AMT'), width: '200', styleName: 'text-right' }, // 법인미수금액
    { fieldName: 'sellFee', header: t('MSG_TXT_PD_SALE_FEE'), width: '200', styleName: 'text-right' }, // 판매수수료
    { fieldName: 'cntrTam', header: t('MSG_TXT_CNTRCT_AMT'), width: '200', styleName: 'text-right' }, // 계약총액
    { fieldName: 'ackmtPerfRt', header: t('TXT_MSG_ACKMT_PERF_RT'), width: '200', styleName: 'text-right' }, // 인정실적율
    { fieldName: 'ackmtPerfAmt', header: t('MSG_TXT_ACKMT_PERF_AMT'), width: '200', styleName: 'text-right' }, // 인정실적금액
    { fieldName: 'cvtPerfAmt', header: t('MSG_TXT_CVT_PERF_AMT'), width: '200', styleName: 'text-right' }, // 환산실적금액
    { fieldName: 'feeAckmtCt', header: t('MSG_TXT_FEE_ACKMT_CNT'), width: '200', styleName: 'text-right' }, // 수수료인정건수
    { fieldName: 'feeAckmtBaseAmt', header: t('MSG_TXT_FEE_ACKMT_STNRD_AMT'), width: '200', styleName: 'text-right' }, // 수수료인정기준금액
    { fieldName: 'feeFxamYn', header: t('MSG_TXT_PD_FEE_FIX'), width: '200', styleName: 'text-center' }, // 수수료정액여부
    { fieldName: 'sppDuedt', header: t('MSG_TXT_EXP_DEL_DT'), width: '200', styleName: 'text-center', datetimeFormat: 'date' }, // 배송예정일자
    { fieldName: 'resubYn', header: t('MSG_TXT_RESUB_YN'), width: '200', styleName: 'text-center' }, // 재구독여부
    { fieldName: 'rstlYn', header: t('MSG_TXT_RECOMMITMENT'), width: '200', styleName: 'text-center' }, // 재약정여부
    { fieldName: 'frisuYn', header: t('MSG_TXT_FRISU_YN'), width: '200', styleName: 'text-center' }, // 무상여부
    { fieldName: 'frisuDsbTpNm', header: t('MSG_TXT_FRISU_DSB_TP_CD'), width: '200', styleName: 'text-left' }, // 무상지급유형코드
    { fieldName: 'txinvPblOjYn', header: t('MSG_TXT_TXINV_PBL_OJ_YN'), width: '200', styleName: 'text-center' }, // 세금계산서발행대상여부
    { fieldName: 'alncmpNm', header: t('MSG_TXT_ALNCMP_CD'), width: '200', styleName: 'text-left' }, // 제휴사코드
    { fieldName: 'alncmpCntrDrmVal', header: t('MSG_TXT_ALNCMP_CNTR_ID'), width: '200', styleName: 'text-center' }, // 제휴사계약식별값
    { fieldName: 'smtplId', header: t('MSG_TXT_SMTPL_ID'), width: '200', styleName: 'text-center' }, // 스마트플랜ID
    { fieldName: 'smtplSn', header: t('MSG_TXT_SMTPL_SN'), width: '200', styleName: 'text-center' }, // 스마트플랜일련번호
    { fieldName: 'bfOrdNo', header: t('MSG_TXT_BF_ORD_NO'), width: '200', styleName: 'text-center' }, // 이전주문번호
    { fieldName: 'cntrChRcpId', header: t('MSG_TXT_CNTR_CH_RCP_ID'), width: '200', styleName: 'text-center' }, // 계약변경접수ID
    { fieldName: 'cntrChSn', header: t('MSG_TXT_CNTR_CHNG_SN'), width: '200', styleName: 'text-center' }, // 계약변경일련번호
    { fieldName: 'cntrChDtlAkCn', header: t('MSG_TXT_CNTR_CHNG_DTL_REQ_CN'), width: '250', styleName: 'text-left' }, // 계약변경상세요청내용
    { fieldName: 'dtaDlYn', header: t('MSG_TXT_DTA_DEL_YN'), width: '200', styleName: 'text-center' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FRST_RGST_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR_ID'), width: '200', styleName: 'text-center' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId', header: t('MSG_TXT_FST_RGST_PRG_ID'), width: '250', styleName: 'text-center' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId', header: t('MSG_TXT_FST_RGST_DEPT'), width: '200', styleName: 'text-center' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_FNL_MDFC_USR_ID'), width: '200', styleName: 'text-center' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId', header: t('MSG_TXT_FNL_MDFC_PRG_ID'), width: '250', styleName: 'text-center' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId', header: t('MSG_TXT_FNL_MDFC_DEPT'), width: '200', styleName: 'text-center' }, // 최종수정부서ID
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});

const initGridCntrCstRel = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrCstRelId' }, // 계약고객관계ID
    { fieldName: 'vlStrtDtm' }, // 유효시작일시
    { fieldName: 'vlEndDtm' }, // 유효종료일시
    { fieldName: 'cntrUnitTpCd' }, // 계약단위유형코드
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'dtlCntrNo' }, // 상세계약번호
    { fieldName: 'dtlCntrSn' }, // 상세계약일련번호
    { fieldName: 'copnDvCd' }, // 법인격구분코드
    { fieldName: 'cstNo' }, // 고객번호
    { fieldName: 'cntrCstRelTpCd' }, // 계약고객관계유형코드
    { fieldName: 'cntrtRelCd' }, // 계약자관계코드
    { fieldName: 'insiCstTpCd' }, // 내부고객유형코드
    { fieldName: 'lrnnGryCd' }, // 학습학년코드
    { fieldName: 'cntrChRcpId' }, // 계약변경접수ID
    { fieldName: 'dtaDlYn' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId' }, // 최종수정부서ID
  ];

  const columns = [
    { fieldName: 'cntrCstRelId', header: t('MSG_TXT_CNTR_CST_RLT_ID'), width: '200', styleName: 'text-center' }, // 계약고객관계ID
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_VL_STRT_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 유효시작일시
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_VL_END_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 유효종료일시
    { fieldName: 'cntrUnitTpCd', header: t('MSG_TXT_CNTR_UNIT_TP_CD'), width: '250', styleName: 'text-center' }, // 계약단위유형코드
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '200', styleName: 'text-center' }, // 계약번호
    { fieldName: 'dtlCntrNo', header: t('MSG_TXT_DTL_CNTR_NO'), width: '200', styleName: 'text-center' }, // 상세계약번호
    { fieldName: 'dtlCntrSn', header: t('MSG_TXT_DTL_CNTR_SN'), width: '200', styleName: 'text-center' }, // 상세계약일련번호
    { fieldName: 'copnDvCd', header: t('MSG_TXT_COPN_DV_CD'), width: '200', styleName: 'text-center' }, // 법인격구분코드
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '200', styleName: 'text-center' }, // 고객번호
    { fieldName: 'cntrCstRelTpCd', header: t('MSG_TXT_CNTR_CST_RLT_TP_CD'), width: '250', styleName: 'text-left' }, // 계약고객관계유형코드
    { fieldName: 'cntrtRelCd', header: t('MSG_TXT_CNTRT_RLT_CD'), width: '200', styleName: 'text-center' }, // 계약자관계코드
    { fieldName: 'insiCstTpCd', header: t('MSG_TXT_INSI_CST_TP_CD'), width: '200', styleName: 'text-center' }, // 내부고객유형코드
    { fieldName: 'lrnnGryCd', header: t('MSG_TXT_LRNN_GRD_CD'), width: '200', styleName: 'text-center' }, // 학습학년코드
    { fieldName: 'cntrChRcpId', header: t('MSG_TXT_CNTR_CH_RCP_ID'), width: '200', styleName: 'text-center' }, // 계약변경접수ID

    { fieldName: 'dtaDlYn', header: t('MSG_TXT_DTA_DEL_YN'), width: '200', styleName: 'text-center' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FRST_RGST_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR_ID'), width: '200', styleName: 'text-center' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId', header: t('MSG_TXT_FST_RGST_PRG_ID'), width: '250', styleName: 'text-center' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId', header: t('MSG_TXT_FST_RGST_DEPT'), width: '200', styleName: 'text-center' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_FNL_MDFC_USR_ID'), width: '200', styleName: 'text-center' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId', header: t('MSG_TXT_FNL_MDFC_PRG_ID'), width: '250', styleName: 'text-center' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId', header: t('MSG_TXT_FNL_MDFC_DEPT'), width: '200', styleName: 'text-center' }, // 최종수정부서ID
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});

const initGridCntrPrtnrRel = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrPrtnrRelId' }, // 계약파트너관계ID
    { fieldName: 'vlStrtDtm' }, // 유효시작일시
    { fieldName: 'vlEndDtm' }, // 유효종료일시
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'ogTpCd' }, // 조직유형코드
    { fieldName: 'prtnrNo' }, // 파트너번호
    { fieldName: 'cntrPrtnrTpCd' }, // 계약파트너유형코드
    { fieldName: 'cntrPrtnrTpDrmVal' }, // 계약파트너유형식별값
    { fieldName: 'ogId' }, // 조직ID
    { fieldName: 'rcpAoffceCd' }, // 접수사무소코드
    { fieldName: 'prrBizRgrYn' }, // 사전업무등록자여부
    { fieldName: 'alncPrtnrDrmVal' }, // 제휴파트너식별값
    { fieldName: 'alncPrtnrIdnrNm' }, // 제휴파트너식별자명
    { fieldName: 'alncPrtnrDrmDvCd' }, // 제휴파트너식별구분코드
    { fieldName: 'dtaDlYn' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId' }, // 최종수정부서ID
  ];

  const columns = [
    { fieldName: 'cntrPrtnrRelId', header: t('MSG_TXT_CNTR_PRTNR_RLT_ID'), width: '200', styleName: 'text-center' }, // 계약파트너관계ID
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_VL_STRT_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 유효시작일시
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_VL_END_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 유효종료일시
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '250', styleName: 'text-center' }, // 계약번호
    { fieldName: 'ogTpCd', header: t('MSG_TXT_OG_TP_CD'), width: '200', styleName: 'text-center' }, // 조직유형코드
    { fieldName: 'prtnrNo', header: t('MSG_TXT_CNTR_NO'), width: '200', styleName: 'text-left' }, // 파트너번호
    { fieldName: 'cntrPrtnrTpCd', header: t('MSG_TXT_CNTR_PRTNR_TP_CD'), width: '200', styleName: 'text-center' }, // 계약파트너유형코드
    { fieldName: 'cntrPrtnrTpDrmVal', header: t('MSG_TXT_CNTR_PRTNR_TP_ID'), width: '200', styleName: 'text-center' }, // 계약파트너유형식별값
    { fieldName: 'ogId', header: t('MSG_TXT_OG_ID'), width: '250', styleName: 'text-center' }, // 조직ID
    { fieldName: 'rcpAoffceCd', header: t('MSG_TXT_RCPT_AOFFCE_CD'), width: '200', styleName: 'text-center' }, // 접수사무소코드
    { fieldName: 'prrBizRgrYn', header: t('MSG_TXT_PRR_BIZ_RGST_USR_YN'), width: '200', styleName: 'text-center' }, // 사전업무등록자여부
    { fieldName: 'alncPrtnrDrmVal', header: t('MSG_TXT_ALNC_PRTNR_ID_VAL'), width: '200', styleName: 'text-center' }, // 제휴파트너식별값
    { fieldName: 'alncPrtnrIdnrNm', header: t('MSG_TXT_ALNC_PRTNR_ID_NM'), width: '200', styleName: 'text-center' }, // 제휴파트너식별자명
    { fieldName: 'alncPrtnrDrmDvCd', header: t('MSG_TXT_ALNC_PRTNR_ID_DV_CD'), width: '200', styleName: 'text-left' }, // 제휴파트너식별구분코드

    { fieldName: 'dtaDlYn', header: t('MSG_TXT_DTA_DEL_YN'), width: '200', styleName: 'text-center' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FRST_RGST_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR_ID'), width: '200', styleName: 'text-center' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId', header: t('MSG_TXT_FST_RGST_PRG_ID'), width: '250', styleName: 'text-center' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId', header: t('MSG_TXT_FST_RGST_DEPT'), width: '200', styleName: 'text-center' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_FNL_MDFC_USR_ID'), width: '200', styleName: 'text-center' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId', header: t('MSG_TXT_FNL_MDFC_PRG_ID'), width: '250', styleName: 'text-center' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId', header: t('MSG_TXT_FNL_MDFC_DEPT'), width: '200', styleName: 'text-center' }, // 최종수정부서ID
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});

const initGridCntrAdrRel = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrAdrRelId' }, // 계약주소관계ID
    { fieldName: 'vlStrtDtm' }, // 유효시작일시
    { fieldName: 'vlEndDtm' }, // 유효종료일시
    { fieldName: 'adrpcTpCd' }, // 주소지유형코드
    { fieldName: 'cntrUnitTpCd' }, // 계약단위유형코드
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'dtlCntrNo' }, // 상세계약번호
    { fieldName: 'dtlCntrSn' }, // 상세계약일련번호
    { fieldName: 'cntrAdrpcId' }, // 계약주소지ID
    { fieldName: 'vstRqdt' }, // 방문요청일자
    { fieldName: 'vstAkStrtHm' }, // 방문요청시작시분
    { fieldName: 'vstAkEndHm' }, // 방문요청종료시분
    { fieldName: 'urgtOjYn' }, // 긴급대상여부
    { fieldName: 'cntrwPosndTpCd' }, // 계약서발송처유형코드
    { fieldName: 'sppMthdTpCd' }, // 배송방식유형코드
    { fieldName: 'sppIchrAoffceCd' }, // 배송담당사무소코드
    { fieldName: 'sppIchrUsrId' }, // 배송담당사용자ID
    { fieldName: 'cntrChRcpId' }, // 계약변경접수ID
    { fieldName: 'dtaDlYn' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId' }, // 최종수정부서ID
  ];

  const columns = [
    { fieldName: 'cntrAdrRelId', header: t('MSG_TXT_CNTR_ADR_RLT_ID'), width: '200', styleName: 'text-center' }, // 계약주소관계ID
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_VL_STRT_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 유효시작일시
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_VL_END_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 유효종료일시
    { fieldName: 'adrpcTpCd', header: t('MSG_TXT_ADRPC_TP_CD'), width: '200', styleName: 'text-center' }, // 주소지유형코드
    { fieldName: 'cntrUnitTpCd', header: t('MSG_TXT_CNTR_UNIT_TP_CD'), width: '200', styleName: 'text-center' }, // 계약단위유형코드
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '250', styleName: 'text-center' }, // 계약번호
    { fieldName: 'dtlCntrNo', header: t('MSG_TXT_DTL_CNTR_NO'), width: '200', styleName: 'text-center' }, // 상세계약번호
    { fieldName: 'dtlCntrSn', header: t('MSG_TXT_DTL_CNTR_SN'), width: '200', styleName: 'text-center' }, // 상세계약일련번호
    { fieldName: 'cntrAdrpcId', header: t('MSG_TXT_CNTR_ADRPC_ID'), width: '200', styleName: 'text-center' }, // 계약주소지ID
    { fieldName: 'vstRqdt', header: t('MSG_TXT_VST_REQD_DT'), width: '200', styleName: 'text-center', datetimeFormat: 'date' }, // 방문요청일자
    { fieldName: 'vstAkStrtHm', header: t('MSG_TXT_VST_REQD_STRT_HHMM'), width: '200', styleName: 'text-center', datetimeFormat: 'hh:mm' }, // 방문요청시작시분
    { fieldName: 'vstAkEndHm', header: t('MSG_TXT_VST_REQD_END_HHMM'), width: '200', styleName: 'text-center', datetimeFormat: 'hh:mm' }, // 방문요청종료시분
    { fieldName: 'urgtOjYn', header: t('MSG_TXT_UGRN_OJ_YN'), width: '200', styleName: 'text-center' }, // 긴급대상여부
    { fieldName: 'cntrwPosndTpCd', header: t('MSG_TXT_CNTRW_SEND_TO_TP_CD'), width: '250', styleName: 'text-center' }, // 계약서발송처유형코드
    { fieldName: 'sppMthdTpCd', header: t('MSG_TXT_SPP_MTHD_TP_CD'), width: '200', styleName: 'text-center' }, // 배송방식유형코드
    { fieldName: 'sppIchrAoffceCd', header: t('MSG_TXT_SPP_PSIC_AOFFCE_CD'), width: '250', styleName: 'text-center' }, // 배송담당사무소코드
    { fieldName: 'sppIchrUsrId', header: t('MSG_TXT_SPP_PSIC_USR_ID'), width: '200', styleName: 'text-center' }, // 배송담당사용자ID
    { fieldName: 'cntrChRcpId', header: t('MSG_TXT_CNTR_CH_RCP_ID'), width: '200', styleName: 'text-center' }, // 계약변경접수ID

    { fieldName: 'dtaDlYn', header: t('MSG_TXT_DTA_DEL_YN'), width: '200', styleName: 'text-center' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FRST_RGST_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR_ID'), width: '200', styleName: 'text-center' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId', header: t('MSG_TXT_FST_RGST_PRG_ID'), width: '250', styleName: 'text-center' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId', header: t('MSG_TXT_FST_RGST_DEPT'), width: '200', styleName: 'text-center' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_FNL_MDFC_USR_ID'), width: '200', styleName: 'text-center' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId', header: t('MSG_TXT_FNL_MDFC_PRG_ID'), width: '250', styleName: 'text-center' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId', header: t('MSG_TXT_FNL_MDFC_DEPT'), width: '200', styleName: 'text-center' }, // 최종수정부서ID
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});

const initGridCntrAdrChgHist = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrAdrpcId' }, // 계약주소지ID
    { fieldName: 'histStrtDtm' }, // 이력시작일시
    { fieldName: 'histEndDtm' }, // 이력종료일시
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrCstNo' }, // 계약고객번호
    { fieldName: 'cntrtRelCd' }, // 계약자관계코드
    { fieldName: 'rcgvpKnm' }, // 수령자한글명
    { fieldName: 'rcgvpEnm' }, // 수령자영문명
    { fieldName: 'copnDvCd' }, // 법인격구분코드
    { fieldName: 'crpSpmtDrmNm' }, // 법인추가식별명
    { fieldName: 'natCd' }, // 국가코드
    { fieldName: 'adrDvCd' }, // 주소ID
    { fieldName: 'cralTno' }, // 휴대전화번호
    { fieldName: 'cralLocaraTno' }, // 휴대지역전화번호
    { fieldName: 'mexnoEncr' }, // 휴대전화국번호암호화
    { fieldName: 'cralIdvTno' }, // 휴대개별전화번호
    { fieldName: 'emadr' }, // 이메일주소
    { fieldName: 'cnrSppYn' }, // 센터배송여부
    { fieldName: 'ogTpCd' }, // 조직유형코드
    { fieldName: 'bldCd' }, // 빌딩코드
    { fieldName: 'mvsDstcRcvryBaseDtm' }, // 소산파기복구기준일시
    { fieldName: 'mvsDstcRcvryDvCd' }, // 소산파기복구구분코드
    { fieldName: 'mvsDstcRcvryDtm' }, // 소산파기복구일시
    { fieldName: 'dtaDlYn' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId' }, // 최종수정부서ID
  ];

  const columns = [
    { fieldName: 'cntrAdrpcId', header: t('MSG_TXT_CNTR_ADRPC_ID'), width: '200', styleName: 'text-center' }, // 계약주소지ID
    { fieldName: 'histStrtDtm', header: t('MSG_TXT_HIST_STRT_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 이력시작일시
    { fieldName: 'histEndDtm', header: t('MSG_TXT_HIST_END_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 이력종료일시
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '200', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CNTR_CST_NO'), width: '200', styleName: 'text-center' }, // 계약고객번호
    { fieldName: 'cntrtRelCd', header: t('MSG_TXT_CNTRT_RLT_CD'), width: '200', styleName: 'text-center' }, // 계약자관계코드
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_RCGVP_KNM'), width: '200', styleName: 'text-left' }, // 수령자한글명
    { fieldName: 'rcgvpEnm', header: t('MSG_TXT_RCGVP_ENM'), width: '200', styleName: 'text-left' }, // 수령자영문명
    { fieldName: 'copnDvCd', header: t('MSG_TXT_COPN_DV_CD'), width: '200', styleName: 'text-center' }, // 법인격구분코드
    { fieldName: 'crpSpmtDrmNm', header: t('MSG_TXT_CRP_ADD_ID_NM'), width: '200', styleName: 'text-left' }, // 법인추가식별명
    { fieldName: 'natCd', header: t('MSG_TXT_NAT_CD'), width: '200', styleName: 'text-center' }, // 국가코드
    { fieldName: 'adrDvCd', header: t('MSG_TXT_ADR_ID'), width: '200', styleName: 'text-center' }, // 주소ID
    {
      fieldName: 'cralTno',
      header: t('MSG_TXT_MPNO'),
      width: '200',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cralLocaraTno: no1, mexnoEncr: no2, cralIdvTno: no3 } = grid.getValues(index.itemIndex);
        return !isEmpty(no1) && !isEmpty(no2) && !isEmpty(no3) ? `${no1}-${no2}-${no3}` : '';
      },
    }, // 휴대전화번호
    { fieldName: 'emadr', header: t('MSG_TXT_EMAIL_ADDR'), width: '200', styleName: 'text-left' }, // 이메일주소
    { fieldName: 'cnrSppYn', header: t('MSG_TXT_CNR_DLVR_YN'), width: '200', styleName: 'text-center' }, // 센터배송여부
    { fieldName: 'ogTpCd', header: t('MSG_TXT_OG_TP_CD'), width: '200', styleName: 'text-center' }, // 조직유형코드
    { fieldName: 'bldCd', header: t('MSG_TXT_BLD_CD'), width: '200', styleName: 'text-center' }, // 빌딩코드
    { fieldName: 'mvsDstcRcvryBaseDtm', header: t('MSG_TXT_DISSPTN_DSTC_RCVRY_STNDR_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 소산파기복구기준일시
    { fieldName: 'mvsDstcRcvryDvCd', header: t('MSG_TXT_DISSPTN_DSTC_RCVRY_DV_CD'), width: '200', styleName: 'text-center' }, // 소산파기복구구분코드
    { fieldName: 'mvsDstcRcvryDtm', header: t('MSG_TXT_DISSPTN_DSTC_RCVRY_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 소산파기복구일시

    { fieldName: 'dtaDlYn', header: t('MSG_TXT_DTA_DEL_YN'), width: '200', styleName: 'text-center' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FRST_RGST_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR_ID'), width: '200', styleName: 'text-center' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId', header: t('MSG_TXT_FST_RGST_PRG_ID'), width: '250', styleName: 'text-center' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId', header: t('MSG_TXT_FST_RGST_DEPT'), width: '200', styleName: 'text-center' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_FNL_MDFC_USR_ID'), width: '200', styleName: 'text-center' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId', header: t('MSG_TXT_FNL_MDFC_PRG_ID'), width: '250', styleName: 'text-center' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId', header: t('MSG_TXT_FNL_MDFC_DEPT'), width: '200', styleName: 'text-center' }, // 최종수정부서ID
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});

const initGridCntrStlmRel = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrStlmRelId' }, // 계약결제관계ID
    { fieldName: 'vlStrtDtm' }, // 유효시작일시
    { fieldName: 'vlEndDtm' }, // 유효종료일시
    { fieldName: 'cntrUnitTpCd' }, // 계약단위유형코드
    { fieldName: 'cntrStlmId' }, // 계약결제ID
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'dtlCntrNo' }, // 상세계약번호
    { fieldName: 'dtlCntrSn' }, // 상세계약일련번호
    { fieldName: 'dpTpCd' }, // 입금유형코드
    { fieldName: 'rveDvCd' }, // 수납구분코드
    { fieldName: 'islndIncmdcTpCd' }, // 도서지역소득공제유형코드
    { fieldName: 'stlmAmt', dataType: 'number' }, // 결제금액
    { fieldName: 'dtaDlYn' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId' }, // 최종수정부서ID
  ];

  const columns = [
    { fieldName: 'cntrStlmRelId', header: t('MSG_TXT_CNTR_STLM_RLT_ID'), width: '200', styleName: 'text-center' }, // 계약결제관계ID
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_VL_STRT_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 유효시작일시
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_VL_END_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 유효종료일시
    { fieldName: 'cntrUnitTpCd', header: t('MSG_TXT_CNTR_UNIT_TP_CD'), width: '200', styleName: 'text-center' }, // 계약단위유형코드
    { fieldName: 'cntrStlmId', header: t('MSG_TXT_CNTR_STLM_ID'), width: '200', styleName: 'text-center' }, // 계약결제ID
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '200', styleName: 'text-center' }, // 계약번호
    { fieldName: 'dtlCntrNo', header: t('MSG_TXT_DTL_CNTR_NO'), width: '200', styleName: 'text-center' }, // 상세계약번호
    { fieldName: 'dtlCntrSn', header: t('MSG_TXT_DTL_CNTR_SN'), width: '200', styleName: 'text-center' }, // 상세계약일련번호
    { fieldName: 'dpTpCd', header: t('MSG_TXT_DP_TP_CD'), width: '200', styleName: 'text-center' }, // 입금유형코드
    { fieldName: 'rveDvCd', header: t('MSG_TXT_RVE_DV_CD'), width: '200', styleName: 'text-center' }, // 수납구분코드
    { fieldName: 'islndIncmdcTpCd', header: t('MSG_TXT_ISLND_INCMDC_TP_CD'), width: '250', styleName: 'text-center' }, // 도서지역소득공제유형코드
    { fieldName: 'stlmAmt', header: t('MSG_TXT_STLM_AMT'), width: '200', styleName: 'text-right' }, // 결제금액

    { fieldName: 'dtaDlYn', header: t('MSG_TXT_DTA_DEL_YN'), width: '200', styleName: 'text-center' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FRST_RGST_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR_ID'), width: '200', styleName: 'text-center' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId', header: t('MSG_TXT_FST_RGST_PRG_ID'), width: '250', styleName: 'text-center' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId', header: t('MSG_TXT_FST_RGST_DEPT'), width: '200', styleName: 'text-center' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_FNL_MDFC_USR_ID'), width: '200', styleName: 'text-center' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId', header: t('MSG_TXT_FNL_MDFC_PRG_ID'), width: '250', styleName: 'text-center' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId', header: t('MSG_TXT_FNL_MDFC_DEPT'), width: '200', styleName: 'text-center' }, // 최종수정부서ID
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});

const initGridCntrStlmChgHist = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrStlmId' }, // 계약결제ID
    { fieldName: 'histStrtDtm' }, // 이력시작일시
    { fieldName: 'histEndDtm' }, // 이력종료일시
    { fieldName: 'cstNo' }, // 고객번호
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrtRelCd' }, // 계약자관계코드
    { fieldName: 'owrKnm' }, // 소유자한글명
    { fieldName: 'owrEnm' }, // 소유자영문명
    { fieldName: 'dpTpCd' }, // 입금유형코드
    { fieldName: 'bnkCd' }, // 은행코드
    { fieldName: 'cdcoCd' }, // 카드사코드
    { fieldName: 'acnoEncr' }, // 계좌번호암호화
    { fieldName: 'crcdnoEncr' }, // 신용카드번호암호화
    { fieldName: 'cardExpdtYm' }, // 카드유효기간년월
    { fieldName: 'mlgTpCd' }, // 마일리지유형코드
    { fieldName: 'mlgDrmVal' }, // 마일리지식별값
    { fieldName: 'mpyBsdt' }, // 납부기준일자
    { fieldName: 'hsCtfYn' }, // 본인인증여부
    { fieldName: 'dcevdnDocId' }, // 증빙서류문서ID
    { fieldName: 'pyerNo' }, // 납부자번호
    { fieldName: 'vncoDvCd' }, // VAN사구분코드
    { fieldName: 'fnitAprRsCd' }, // 금융기관승인결과코드
    { fieldName: 'fnitAprFshDtm' }, // 금융기관승인완료일시
    { fieldName: 'fnitRsgFshDtm' }, // 금융기관해지완료일시
    { fieldName: 'acFntImpsCd' }, // 계좌이체불능코드
    { fieldName: 'cardFntImpsCd' }, // 카드이체불능코드
    { fieldName: 'acChAkDvCd' }, // 계좌변경요청구분코드
    { fieldName: 'rveCrpCd' }, // 수납법인코드
    { fieldName: 'fntEvidDrmVal' }, // 이체증빙식별값
    { fieldName: 'reuseOjYn' }, // 재사용대상여부
    { fieldName: 'bfCntrStlmId' }, // 이전계약결제ID
    { fieldName: 'mvsDstcRcvryBaseDtm' }, // 소산파기복구기준일시
    { fieldName: 'mvsDstcRcvryDvCd' }, // 소산파기복구구분코드
    { fieldName: 'mvsDstcRcvryDtm' }, // 소산파기복구일시
    { fieldName: 'dtaDlYn' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId' }, // 최종수정부서ID
  ];

  const columns = [
    { fieldName: 'cntrStlmId', header: t('MSG_TXT_CNTR_STLM_ID'), width: '200', styleName: 'text-center' }, // 계약결제ID
    { fieldName: 'histStrtDtm', header: t('MSG_TXT_HIST_STRT_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 이력시작일시
    { fieldName: 'histEndDtm', header: t('MSG_TXT_HIST_END_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 이력종료일시
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '200', styleName: 'text-center' }, // 고객번호
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '200', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cntrtRelCd', header: t('MSG_TXT_CNTRT_RLT_CD'), width: '200', styleName: 'text-center' }, // 계약자관계코드
    { fieldName: 'owrKnm', header: t('MSG_TXT_OWK_KNM'), width: '200', styleName: 'text-center' }, // 소유자한글명
    { fieldName: 'owrEnm', header: t('MSG_TXT_OWR_ENM'), width: '200', styleName: 'text-center' }, // 소유자영문명
    { fieldName: 'dpTpCd', header: t('MSG_TXT_DP_TP_CD'), width: '200', styleName: 'text-center' }, // 입금유형코드
    { fieldName: 'bnkCd', header: t('MSG_TXT_BNK_CD'), width: '200', styleName: 'text-center' }, // 은행코드
    { fieldName: 'cdcoCd', header: t('MSG_TXT_CDCO_CD'), width: '200', styleName: 'text-center' }, // 카드사코드
    { fieldName: 'acnoEncr', header: t('MSG_TXT_ACNO_ENCR'), width: '200', styleName: 'text-center' }, // 계좌번호암호화
    { fieldName: 'crcdnoEncr', header: t('MSG_TXT_CRDCD_NO_ENCR'), width: '200', styleName: 'text-center' }, // 신용카드번호암호화
    { fieldName: 'cardExpdtYm', header: t('MSG_TXT_CARD_EXPDT_YM'), width: '200', styleName: 'text-center' }, // 카드유효기간년월
    { fieldName: 'mlgTpCd', header: t('MSG_TXT_MLG_TP_CD'), width: '200', styleName: 'text-center' }, // 마일리지유형코드
    { fieldName: 'mlgDrmVal', header: t('MSG_TXT_MLG_ID_VAL'), width: '200', styleName: 'text-center' }, // 마일리지식별값
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_MPY_BASE_DT'), width: '200', styleName: 'text-center', datetimeFormat: 'date' }, // 납부기준일자
    { fieldName: 'hsCtfYn', header: t('MSG_TXT_IDENT_VERF'), width: '200', styleName: 'text-center' }, // 본인인증여부
    { fieldName: 'dcevdnDocId', header: t('MSG_TXT_DCEVDN_DCMT_ID'), width: '200', styleName: 'text-center' }, // 증빙서류문서ID
    { fieldName: 'pyerNo', header: t('MSG_TXT_PYER_NO'), width: '200', styleName: 'text-center' }, // 납부자번호
    { fieldName: 'vncoDvCd', header: t('MSG_TXT_VAN_CMPY_DV_CD'), width: '200', styleName: 'text-center' }, // VAN사구분코드
    { fieldName: 'fnitAprRsCd', header: t('MSG_TXT_FNIT_APR_RSLT_CD'), width: '250', styleName: 'text-center' }, // 금융기관승인결과코드
    { fieldName: 'fnitAprFshDtm', header: t('MSG_TXT_FNIT_APR_FSH_DTM'), width: '250', styleName: 'text-center', datetimeFormat: 'datetime' }, // 금융기관승인완료일시
    { fieldName: 'fnitRsgFshDtm', header: t('MSG_TXT_FNIT_RSG_FSH_DTM'), width: '250', styleName: 'text-center', datetimeFormat: 'datetime' }, // 금융기관해지완료일시
    { fieldName: 'acFntImpsCd', header: t('MSG_TXT_AC_FNT_IMPS_CD'), width: '200', styleName: 'text-center' }, // 계좌이체불능코드
    { fieldName: 'cardFntImpsCd', header: t('MSG_TXT_CARD_FNT_IMPS_CD'), width: '200', styleName: 'text-center' }, // 카드이체불능코드
    { fieldName: 'acChAkDvCd', header: t('MSG_TXT_AC_CHG_REQD_DV_CD'), width: '250', styleName: 'text-center' }, // 계좌변경요청구분코드
    { fieldName: 'rveCrpCd', header: t('MSG_TXT_RVE_COB_CD'), width: '200', styleName: 'text-center' }, // 수납법인코드
    { fieldName: 'fntEvidDrmVal', header: t('MSG_TXT_FNT_EVID_ID_VAL'), width: '200', styleName: 'text-center' }, // 이체증빙식별값
    { fieldName: 'reuseOjYn', header: t('MSG_TXT_REUSE_OJ_YN'), width: '200', styleName: 'text-center' }, // 재사용대상여부
    { fieldName: 'bfCntrStlmId', header: t('MSG_TXT_BF_CNTR_STLM_ID'), width: '200', styleName: 'text-center' }, // 이전계약결제ID
    { fieldName: 'mvsDstcRcvryBaseDtm', header: t('MSG_TXT_DISSPTN_DSTC_RCVRY_STNDR_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 소산파기복구기준일시
    { fieldName: 'mvsDstcRcvryDvCd', header: t('MSG_TXT_DISSPTN_DSTC_RCVRY_DV_CD'), width: '200', styleName: 'text-center' }, // 소산파기복구구분코드
    { fieldName: 'mvsDstcRcvryDtm', header: t('MSG_TXT_DISSPTN_DSTC_RCVRY_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 소산파기복구일시

    { fieldName: 'dtaDlYn', header: t('MSG_TXT_DTA_DEL_YN'), width: '200', styleName: 'text-center' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FRST_RGST_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR_ID'), width: '200', styleName: 'text-center' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId', header: t('MSG_TXT_FST_RGST_PRG_ID'), width: '250', styleName: 'text-center' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId', header: t('MSG_TXT_FST_RGST_DEPT'), width: '200', styleName: 'text-center' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_FNL_MDFC_USR_ID'), width: '200', styleName: 'text-center' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId', header: t('MSG_TXT_FNL_MDFC_PRG_ID'), width: '250', styleName: 'text-center' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId', header: t('MSG_TXT_FNL_MDFC_DEPT'), width: '200', styleName: 'text-center' }, // 최종수정부서ID
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});

const initGridCntrWellsDtlChgHist = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'histStrtDtm' }, // 이력시작일시
    { fieldName: 'histEndDtm' }, // 이력종료일시
    { fieldName: 'frisuBfsvcPtrmUnitCd' }, // 무상BS기간단위코드
    { fieldName: 'frisuBfsvcPtrmN' }, // 무상BS기간수
    { fieldName: 'frisuAsPtrmUnitCd' }, // 무상AS기간단위코드
    { fieldName: 'frisuAsPtrmN' }, // 무상AS기간수
    { fieldName: 'istDt' }, // 설치일자
    { fieldName: 'reqdDt' }, // 철거일자
    { fieldName: 'cpsDt' }, // 보상일자
    { fieldName: 'prmApyDvCd' }, // 선납적용구분코드
    { fieldName: 'prmPtrmMcn' }, // 선납기간개월수
    { fieldName: 'sellEvCd' }, // 판매행사코드
    { fieldName: 'bfsvcBzsDvCd' }, // BS업체구분코드
    { fieldName: 'splyBzsDvCd' }, // 조달업체구분코드
    { fieldName: 'ocoCpsBzsDvCd' }, // 타사보상업체구분코드
    { fieldName: 'hcrDvCd' }, // 홈케어구분코드
    { fieldName: 'fmmbN' }, // 가구원수
    { fieldName: 'frisuRcvryTpCd' }, // 무상복구유형코드
    { fieldName: 'istPlcTpCd' }, // 설치장소유형코드
    { fieldName: 'wrfrIstMthCd' }, // 정수기설치방법코드
    { fieldName: 'wtqltyTstYn' }, // 수질검사여부
    { fieldName: 'srcwtTpCd' }, // 상수원유형코드
    { fieldName: 'wprsItstTpCd' }, // 수압강도유형코드
    { fieldName: 'useElectTpCd' }, // 사용전력유형코드
    { fieldName: 'tbhsEyn' }, // 튜빙호수유무
    { fieldName: 'stvlvEyn' }, // 지수전유무
    { fieldName: 'kumonItrdtDvCd' }, // 구몬소개구분코드
    { fieldName: 'kumonCstIdkVal' }, // 구몬고객식별키값
    { fieldName: 'kumonRcomrIdkVal' }, // 구몬소개자식별키값
    { fieldName: 'otsdLkDrmVal' }, // 외부연계식별값
    { fieldName: 'frisuMshCrtYn' }, // 무상멤버십생성여부
    { fieldName: 'istMmBilMthdTpCd' }, // 설치월청구방식유형코드
    { fieldName: 'coIstDvCd' }, // 회사설치구분코드
    { fieldName: 'coIstMngtDvCd' }, // 회사설치관리구분코드
    { fieldName: 'coIstUswyCd' }, // 회사설치용도코드
    { fieldName: 'istAkArtcMoCn' }, // 설치요청사항메모내용
    { fieldName: 'sconCn' }, // 특약내용
    { fieldName: 'dtaDlYn' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId' }, // 최종수정부서ID
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '200', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '200', styleName: 'text-center' }, // 계약일련번호
    { fieldName: 'histStrtDtm', header: t('MSG_TXT_HIST_STRT_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 이력시작일시
    { fieldName: 'histEndDtm', header: t('MSG_TXT_HIST_END_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 이력종료일시
    { fieldName: 'frisuBfsvcPtrmUnitCd', header: t('MSG_TXT_FRISU_BFSVC_PTRM_UNIT_CD'), width: '200', styleName: 'text-center' }, // 무상BS기간단위코드
    { fieldName: 'frisuBfsvcPtrmN', header: t('MSG_TXT_FRISU_BFSVC_PTRM_N'), width: '200', styleName: 'text-right' }, // 무상BS기간수
    { fieldName: 'frisuAsPtrmUnitCd', header: t('MSG_TXT_FRISU_AS_PTRM_UNIT_CD'), width: '250', styleName: 'text-center' }, // 무상AS기간단위코드
    { fieldName: 'frisuAsPtrmN', header: t('MSG_TXT_FRISU_AS_PTRM_N'), width: '200', styleName: 'text-right' }, // 무상AS기간수
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '200', styleName: 'text-center', datetimeFormat: 'date' }, // 설치일자
    { fieldName: 'reqdDt', header: t('MSG_TXT_DEM_DT'), width: '200', styleName: 'text-center', datetimeFormat: 'date' }, // 철거일자
    { fieldName: 'cpsDt', header: t('MSG_TXT_CPS_DT'), width: '200', styleName: 'text-center', datetimeFormat: 'date' }, // 보상일자
    { fieldName: 'prmApyDvCd', header: t('MSG_TXT_PRM_APY_DV_CD'), width: '200', styleName: 'text-center' }, // 선납적용구분코드
    { fieldName: 'prmPtrmMcn', header: t('MSG_TXT_PRM_PTRM_MCNT'), width: '200', styleName: 'text-right' }, // 선납기간개월수
    { fieldName: 'sellEvCd', header: t('MSG_TXT_SELL_EV_CD'), width: '200', styleName: 'text-center' }, // 판매행사코드
    { fieldName: 'bfsvcBzsDvCd', header: t('MSG_TXT_BFSVC_BZS_DV_CD'), width: '200', styleName: 'text-center' }, // BS업체구분코드
    { fieldName: 'splyBzsDvCd', header: t('MSG_TXT_SPLY_BZS_DV_CD'), width: '200', styleName: 'text-center' }, // 조달업체구분코드
    { fieldName: 'ocoCpsBzsDvCd', header: t('MSG_TXT_OCO_CPS_BZS_DV_CD'), width: '250', styleName: 'text-center' }, // 타사보상업체구분코드
    { fieldName: 'hcrDvCd', header: t('MSG_TXT_BFSVC_BZS_DV_CD'), width: '200', styleName: 'text-center' }, // 홈케어구분코드
    { fieldName: 'fmmbN', header: t('MSG_TXT_FMMB_N'), width: '150', styleName: 'text-right' }, // 가구원수
    { fieldName: 'frisuRcvryTpCd', header: t('MSG_TXT_FRISU_RCVRY_TP_CD'), width: '200', styleName: 'text-center' }, // 무상복구유형코드
    { fieldName: 'istPlcTpCd', header: t('MSG_TXT_IST_PLC_TP_CD'), width: '200', styleName: 'text-center' }, // 설치장소유형코드
    { fieldName: 'wrfrIstMthCd', header: t('MSG_TXT_WRFR_IST_MTHD_CD'), width: '250', styleName: 'text-center' }, // 정수기설치방법코드
    { fieldName: 'wtqltyTstYn', header: t('MSG_TXT_WTQLTY_TST_YN'), width: '200', styleName: 'text-center' }, // 수질검사여부
    { fieldName: 'srcwtTpCd', header: t('MSG_TXT_SRCWT_TP_CD'), width: '200', styleName: 'text-center' }, // 상수원유형코드
    { fieldName: 'wprsItstTpCd', header: t('MSG_TXT_WPRS_ITST_TP_CD'), width: '200', styleName: 'text-center' }, // 수압강도유형코드
    { fieldName: 'useElectTpCd', header: t('MSG_TXT_USE_ELECT_TP_CD'), width: '200', styleName: 'text-center' }, // 사용전력유형코드
    { fieldName: 'tbhsEyn', header: t('MSG_TXT_TBHS_EYN'), width: '200', styleName: 'text-center' }, // 튜빙호수유무
    { fieldName: 'stvlvEyn', header: t('MSG_TXT_STVLV_EYN'), width: '200', styleName: 'text-center' }, // 지수전유무
    { fieldName: 'kumonItrdtDvCd', header: t('MSG_TXT_KUMON_ITRDT_DV_CD'), width: '200', styleName: 'text-center' }, // 구몬소개구분코드
    { fieldName: 'kumonCstIdkVal', header: t('MSG_TXT_KUMON_CST_IDK_VAL'), width: '200', styleName: 'text-center' }, // 구몬고객식별키값
    { fieldName: 'kumonRcomrIdkVal', header: t('MSG_TXT_KUMON_RCOMR_IDK_VAL'), width: '200', styleName: 'text-center' }, // 구몬소개자식별키값
    { fieldName: 'otsdLkDrmVal', header: t('MSG_TXT_OTSD_LK_DRM_VAL'), width: '200', styleName: 'text-center' }, // 외부연계식별값
    { fieldName: 'frisuMshCrtYn', header: t('MSG_TXT_FRISU_MSH_CRT_YN'), width: '200', styleName: 'text-center' }, // 무상멤버십생성여부
    { fieldName: 'istMmBilMthdTpCd', header: t('MSG_TXT_IST_MMBIL_MTHD_TP_CD'), width: '250', styleName: 'text-center' }, // 설치월청구방식유형코드
    { fieldName: 'coIstDvCd', header: t('MSG_TXT_CO_IST_DV_CD'), width: '200', styleName: 'text-center' }, // 회사설치구분코드
    { fieldName: 'coIstMngtDvCd', header: t('MSG_TXT_CO_IST_MNGT_DV_CD'), width: '250', styleName: 'text-center' }, // 회사설치관리구분코드
    { fieldName: 'coIstUswyCd', header: t('MSG_TXT_CO_IST_USWY_CD'), width: '200', styleName: 'text-center' }, // 회사설치용도코드
    { fieldName: 'istAkArtcMoCn', header: t('MSG_TXT_IST_AK_ARTC_MO_CN'), width: '250', styleName: 'text-left' }, // 설치요청사항메모내용
    { fieldName: 'sconCn', header: t('MSG_TXT_SPEC_CNTR_CNTN'), width: '250', styleName: 'text-left' }, // 특약내용

    { fieldName: 'dtaDlYn', header: t('MSG_TXT_DTA_DEL_YN'), width: '200', styleName: 'text-center' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FRST_RGST_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR_ID'), width: '200', styleName: 'text-center' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId', header: t('MSG_TXT_FST_RGST_PRG_ID'), width: '250', styleName: 'text-center' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId', header: t('MSG_TXT_FST_RGST_DEPT'), width: '200', styleName: 'text-center' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_FNL_MDFC_USR_ID'), width: '200', styleName: 'text-center' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId', header: t('MSG_TXT_FNL_MDFC_PRG_ID'), width: '250', styleName: 'text-center' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId', header: t('MSG_TXT_FNL_MDFC_DEPT'), width: '200', styleName: 'text-center' }, // 최종수정부서ID
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});

const initGridCntrRel = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrRelId' }, // 계약관계ID
    { fieldName: 'vlStrtDtm' }, // 유효시작일시
    { fieldName: 'vlEndDtm' }, // 유효종료일시
    { fieldName: 'cntrUnitTpCd' }, // 계약단위유형코드
    { fieldName: 'cntrRelTpCd' }, // 계약관계유형코드
    { fieldName: 'cntrRelDtlCd' }, // 계약관계상세코드
    { fieldName: 'baseCntrNo' }, // 기준계약번호
    { fieldName: 'ojCntrNo' }, // 대상계약번호
    { fieldName: 'cntrCstGrpId' }, // 계약고객그룹ID
    { fieldName: 'cntrRelDtlCn' }, // 계약관계상세내용
    { fieldName: 'otsdLkDrmVal' }, // 외부연계식별값
    { fieldName: 'dtaDlYn' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId' }, // 최종수정부서ID
  ];

  const columns = [
    { fieldName: 'cntrRelId', header: t('MSG_TXT_CNTR_REL_ID'), width: '200', styleName: 'text-center' }, // 계약관계ID
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_VL_STRT_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 유효시작일시
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_VL_END_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 유효종료일시
    { fieldName: 'cntrUnitTpCd', header: t('MSG_TXT_CNTR_UNIT_TP_CD'), width: '200', styleName: 'text-center' }, // 계약단위유형코드
    { fieldName: 'cntrRelTpCd', header: t('MSG_TXT_CNTR_REL_TP_CD'), width: '200', styleName: 'text-center' }, // 계약관계유형코드
    { fieldName: 'cntrRelDtlCd', header: t('MSG_TXT_CNTR_REL_DTL_CD'), width: '200', styleName: 'text-center' }, // 계약관계상세코드
    { fieldName: 'baseCntrNo', header: t('MSG_TXT_BASE_CNTR_NO'), width: '200', styleName: 'text-center' }, // 기준계약번호
    { fieldName: 'ojCntrNo', header: t('MSG_TXT_OJ_CNTR_NO'), width: '200', styleName: 'text-center' }, // 대상계약번호
    { fieldName: 'cntrCstGrpId', header: t('MSG_TXT_CNTR_CST_GRP_ID'), width: '200', styleName: 'text-center' }, // 계약고객그룹ID
    { fieldName: 'cntrRelDtlCn', header: t('MSG_TXT_CNTR_REL_DTL_CN'), width: '250', styleName: 'text-left' }, // 계약관계상세내용
    { fieldName: 'otsdLkDrmVal', header: t('MSG_TXT_OTSD_LK_DRM_VAL'), width: '200', styleName: 'text-center' }, // 외부연계식별값

    { fieldName: 'dtaDlYn', header: t('MSG_TXT_DTA_DEL_YN'), width: '200', styleName: 'text-center' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FRST_RGST_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR_ID'), width: '200', styleName: 'text-center' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId', header: t('MSG_TXT_FST_RGST_PRG_ID'), width: '250', styleName: 'text-center' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId', header: t('MSG_TXT_FST_RGST_DEPT'), width: '200', styleName: 'text-center' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_FNL_MDFC_USR_ID'), width: '200', styleName: 'text-center' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId', header: t('MSG_TXT_FNL_MDFC_PRG_ID'), width: '250', styleName: 'text-center' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId', header: t('MSG_TXT_FNL_MDFC_DEPT'), width: '200', styleName: 'text-center' }, // 최종수정부서ID
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});

const initGridCntrMchnChgHist = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'baseCntrNo' }, // 기준계약번호
    { fieldName: 'baseCntrSn' }, // 기준계약일련번호
    { fieldName: 'mchnChSn' }, // 기기변경일련번호
    { fieldName: 'histStrtDtm' }, // 이력시작일시
    { fieldName: 'histEndDtm' }, // 이력종료일시
    { fieldName: 'ojCntrNo' }, // 대상계약번호
    { fieldName: 'ojCntrSn' }, // 대상계약일련번호
    { fieldName: 'mchnChTpCd' }, // 기기변경유형코드
    { fieldName: 'mchnCpsApyr' }, // 기기보상적용율
    { fieldName: 'pasgMcn' }, // 경과개월수
    { fieldName: 'baseCntrRcpdt' }, // 기준계약접수일자
    { fieldName: 'baseCntrSlDt' }, // 기준계약매출일자
    { fieldName: 'mchnClnOjYn' }, // 기기회수대상여부
    { fieldName: 'ojCntrMmBaseDvCd' }, // 대상계약월기준구분코드
    { fieldName: 'ojCntrChFshDtm' }, // 대상계약변경완료일시
    { fieldName: 'dtaDlYn' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId' }, // 최종수정부서ID
  ];

  const columns = [
    { fieldName: 'baseCntrNo', header: t('MSG_TXT_BASE_CNTR_NO'), width: '200', styleName: 'text-center' }, // 기준계약번호
    { fieldName: 'baseCntrSn', header: t('MSG_TXT_BASE_CNTR_SN'), width: '200', styleName: 'text-center' }, // 기준계약일련번호
    { fieldName: 'mchnChSn', header: t('MSG_TXT_MCHN_CH_SN'), width: '200', styleName: 'text-center' }, // 기기변경일련번호
    { fieldName: 'histStrtDtm', header: t('MSG_TXT_HIST_STRT_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 이력시작일시
    { fieldName: 'histEndDtm', header: t('MSG_TXT_HIST_END_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 이력종료일시
    { fieldName: 'ojCntrNo', header: t('MSG_TXT_OJ_CNTR_NO'), width: '200', styleName: 'text-center' }, // 대상계약번호
    { fieldName: 'ojCntrSn', header: t('MSG_TXT_OJ_CNTR_SN'), width: '200', styleName: 'text-center' }, // 대상계약일련번호
    { fieldName: 'mchnChTpCd', header: t('MSG_TXT_MCHN_CH_TP_CD'), width: '200', styleName: 'text-center' }, // 기기변경유형코드
    { fieldName: 'mchnCpsApyr', header: t('MSG_TXT_MCHN_CPS_APYR'), width: '200', styleName: 'text-right' }, // 기기보상적용율
    { fieldName: 'pasgMcn', header: t('MSG_TXT_PASG_MCN'), width: '250', styleName: 'text-right' }, // 경과개월수
    { fieldName: 'baseCntrRcpdt', header: t('MSG_TXT_BASE_CNTR_RCPDT'), width: '200', styleName: 'text-center', datetimeFormat: 'date' }, // 기준계약접수일자
    { fieldName: 'baseCntrSlDt', header: t('MSG_TXT_BASE_CNTR_SLDT'), width: '200', styleName: 'text-center', datetimeFormat: 'date' }, // 기준계약매출일자
    { fieldName: 'mchnClnOjYn', header: t('MSG_TXT_MCHN_CLN_OJ_YN'), width: '200', styleName: 'text-center' }, // 기기회수대상여부
    { fieldName: 'ojCntrMmBaseDvCd', header: t('MSG_TXT_OJ_CNTR_MM_BASE_DV_CD'), width: '250', styleName: 'text-center' }, // 대상계약월기준구분코드
    { fieldName: 'ojCntrChFshDtm', header: t('MSG_TXT_OJ_CNTR_CH_FSH_DTM'), width: '250', styleName: 'text-center', datetimeFormat: 'datetime' }, // 대상계약변경완료일시

    { fieldName: 'dtaDlYn', header: t('MSG_TXT_DTA_DEL_YN'), width: '200', styleName: 'text-center' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FRST_RGST_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR_ID'), width: '200', styleName: 'text-center' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId', header: t('MSG_TXT_FST_RGST_PRG_ID'), width: '250', styleName: 'text-center' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId', header: t('MSG_TXT_FST_RGST_DEPT'), width: '200', styleName: 'text-center' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_FNL_MDFC_USR_ID'), width: '200', styleName: 'text-center' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId', header: t('MSG_TXT_FNL_MDFC_PRG_ID'), width: '250', styleName: 'text-center' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId', header: t('MSG_TXT_FNL_MDFC_DEPT'), width: '200', styleName: 'text-center' }, // 최종수정부서ID
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});

const initGridRentalRstlChgHist = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'stplTn' }, // 약정회차
    { fieldName: 'stplChSn' }, // 약정변경일련번호
    { fieldName: 'stplTpCd' }, // 약정유형코드
    { fieldName: 'stplPtrmUnitCd' }, // 약정기간단위코드
    { fieldName: 'stplPtrm' }, // 약정기간
    { fieldName: 'stplStrtdt' }, // 약정시작일자
    { fieldName: 'stplEnddt' }, // 약정종료일자
    { fieldName: 'stplDscAmt', dataType: 'number' }, // 약정할인금액
    { fieldName: 'rstlStatCd' }, // 재약정상태코드
    { fieldName: 'stplRcpDtm' }, // 약정접수일시
    { fieldName: 'rcpOgTpCd' }, // 접수조직유형코드
    { fieldName: 'rcpPrtnrNo' }, // 접수파트너번호
    { fieldName: 'feeAckmtCt' }, // 수수료인정건수
    { fieldName: 'feeAckmtBaseAmt', dataType: 'number' }, // 수수료인정기준금액
    { fieldName: 'feeFxamYn' }, // 수수료정액여부
    { fieldName: 'ackmtPerfRt', dataType: 'number' }, // 인정실적율
    { fieldName: 'ackmtPerfAmt', dataType: 'number' }, // 인정실적금액
    { fieldName: 'notyFwId' }, // 알림발송ID
    { fieldName: 'stplCnfmDtm' }, // 약정확정일시
    { fieldName: 'cnfmUsrId' }, // 확정사용자ID
    { fieldName: 'cntrChFshDtm' }, // 계약변경완료일시
    { fieldName: 'stplCanDtm' }, // 약정취소일시
    { fieldName: 'stplCanUsrId' }, // 약정취소사용자ID
    { fieldName: 'stplWdwlDtm' }, // 약정철회일시
    { fieldName: 'stplWdwlUsrId' }, // 약정철회사용자ID
    { fieldName: 'stplWdwlCn' }, // 약정철회내용
    { fieldName: 'stplDscStrtdt' }, // 약정할인시작일자
    { fieldName: 'stplDscEnddt' }, // 약정할인종료일자
    { fieldName: 'stplDscAcuAmt', dataType: 'number' }, // 약정할인누적금액
    { fieldName: 'stplDscBorAmt', dataType: 'number' }, // 약정할인위약금액
    { fieldName: 'dtaDlYn' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId' }, // 최종수정부서ID
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '200', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '200', styleName: 'text-center' }, // 계약일련번호
    { fieldName: 'stplTn', header: t('MSG_TXT_STPL_CNTS'), width: '200', styleName: 'text-right' }, // 약정회차
    { fieldName: 'stplChSn', header: t('MSG_TXT_STPL_CH_SN'), width: '200', styleName: 'text-center' }, // 약정변경일련번호
    { fieldName: 'stplTpCd', header: t('MSG_TXT_STPL_TP_CD'), width: '200', styleName: 'text-center' }, // 약정유형코드
    { fieldName: 'stplPtrmUnitCd', header: t('MSG_TXT_STPL_PTRM_UNIT_CD'), width: '200', styleName: 'text-center' }, // 약정기간단위코드
    { fieldName: 'stplPtrm', header: t('MSG_TXT_CONTRACT_PERI'), width: '200', styleName: 'text-right' }, // 약정기간
    { fieldName: 'stplStrtdt', header: t('MSG_TXT_STPL_STRTDT'), width: '200', styleName: 'text-center', datetimeFormat: 'date' }, // 약정시작일자
    { fieldName: 'stplEnddt', header: t('MSG_TXT_STPL_ENDDT'), width: '250', styleName: 'text-center', datetimeFormat: 'date' }, // 약정종료일자
    { fieldName: 'stplDscAmt', header: t('MSG_TXT_STPL_DSC_AMT'), width: '200', styleName: 'text-right' }, // 약정할인금액
    { fieldName: 'rstlStatCd', header: t('MSG_TXT_RSTL_STAT_CD'), width: '200', styleName: 'text-center' }, // 재약정상태코드
    { fieldName: 'stplRcpDtm', header: t('MSG_TXT_STPL_RCP_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 약정접수일시
    { fieldName: 'rcpOgTpCd', header: t('MSG_TXT_RCP_OG_TP_CD'), width: '200', styleName: 'text-center' }, // 접수조직유형코드
    { fieldName: 'rcpPrtnrNo', header: t('MSG_TXT_RCP_PRTNR_NO'), width: '200', styleName: 'text-center' }, // 접수파트너번호
    { fieldName: 'feeAckmtCt', header: t('MSG_TXT_FEE_ACKMT_CNT'), width: '200', styleName: 'text-right' }, // 수수료인정건수
    { fieldName: 'feeAckmtBaseAmt', header: t('MSG_TXT_FEE_ACKMT_STNRD_AMT'), width: '200', styleName: 'text-right' }, // 수수료인정기준금액
    { fieldName: 'feeFxamYn', header: t('MSG_TXT_PD_FEE_FIX'), width: '200', styleName: 'text-center' }, // 수수료정액여부
    { fieldName: 'ackmtPerfRt', header: t('TXT_MSG_ACKMT_PERF_RT'), width: '200', styleName: 'text-right' }, // 인정실적율
    { fieldName: 'ackmtPerfAmt', header: t('MSG_TXT_ACKMT_PERF_AMT'), width: '200', styleName: 'text-right' }, // 인정실적금액
    { fieldName: 'notyFwId', header: t('MSG_TXT_NOTY_FW_ID'), width: '150', styleName: 'text-center' }, // 알림발송ID
    { fieldName: 'stplCnfmDtm', header: t('MSG_TXT_STPL_CNFM_DTM'), width: '200', styleName: 'text-center' }, // 약정확정일시
    { fieldName: 'cnfmUsrId', header: t('MSG_TXT_CNFM_USR_ID'), width: '200', styleName: 'text-center' }, // 확정사용자ID
    { fieldName: 'cntrChFshDtm', header: t('MSG_TXT_CNTR_CH_FSH_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 계약변경완료일시
    { fieldName: 'stplCanDtm', header: t('MSG_TXT_STPL_CAN_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 약정취소일시
    { fieldName: 'stplCanUsrId', header: t('MSG_TXT_STPL_CAN_USR_ID'), width: '200', styleName: 'text-center' }, // 약정취소사용자ID
    { fieldName: 'stplWdwlDtm', header: t('MSG_TXT_STPL_WDWL_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 약정철회일시
    { fieldName: 'stplWdwlUsrId', header: t('MSG_TXT_STPL_WDWL_USR_ID'), width: '200', styleName: 'text-center' }, // 약정철회사용자ID
    { fieldName: 'stplWdwlCn', header: t('MSG_TXT_STPL_WDWL_CN'), width: '250', styleName: 'text-left' }, // 약정철회내용
    { fieldName: 'stplDscStrtdt', header: t('MSG_TXT_STPL_DSC_STRTDT'), width: '200', styleName: 'text-center', datetimeFormat: 'date' }, // 약정할인시작일자
    { fieldName: 'stplDscEnddt', header: t('MSG_TXT_STPL_DSC_ENDDT'), width: '200', styleName: 'text-center', datetimeFormat: 'date' }, // 약정할인종료일자
    { fieldName: 'stplDscAcuAmt', header: t('MSG_TXT_STPL_DSC_ACU_AMT'), width: '200', styleName: 'text-right' }, // 약정할인누적금액
    { fieldName: 'stplDscBorAmt', header: t('MSG_TXT_STPL_DSC_BOR_AMT'), width: '200', styleName: 'text-right' }, // 약정할인위약금액

    { fieldName: 'dtaDlYn', header: t('MSG_TXT_DTA_DEL_YN'), width: '200', styleName: 'text-center' }, // 데이터삭제여부
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FRST_RGST_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최초등록일시
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR_ID'), width: '200', styleName: 'text-center' }, // 최초등록사용자ID
    { fieldName: 'fstRgstPrgId', header: t('MSG_TXT_FST_RGST_PRG_ID'), width: '250', styleName: 'text-center' }, // 최초등록프로그램ID
    { fieldName: 'fstRgstDeptId', header: t('MSG_TXT_FST_RGST_DEPT'), width: '200', styleName: 'text-center' }, // 최초등록부서ID
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_DTM'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 최종수정일시
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_FNL_MDFC_USR_ID'), width: '200', styleName: 'text-center' }, // 최종수정사용자ID
    { fieldName: 'fnlMdfcPrgId', header: t('MSG_TXT_FNL_MDFC_PRG_ID'), width: '250', styleName: 'text-center' }, // 최종수정프로그램ID
    { fieldName: 'fnlMdfcDeptId', header: t('MSG_TXT_FNL_MDFC_DEPT'), width: '200', styleName: 'text-center' }, // 최종수정부서ID
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});
</script>
<style scoped>
</style>
