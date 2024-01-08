<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : [WDC]
2. 프로그램 ID : WwwdcSalesControlMgtM
3. 작성자 : kimoon.lim
4. 작성일 : 2023.05.19 ~
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
영업마감 - 매출관리 - 매출조정관리
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_SEL_TYPE')"
          required
        >
          <!-- 판매유형 -->
          <kw-select
            v-model="searchParams.sellTp"
            first-option="all"
            first-option-value="ALL"
            :options="codes.SELL_TP_CD"
            rules="required"
            @change="onChangesellTp"
          />
          <kw-select
            v-model="searchParams.sellTpDtlCd"
            first-option="all"
            first-option-value="ALL"
            :options="optionsCodes"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_DIV')">
          <kw-field>
            <!-- :model-value="['방학면제']" -->
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                v-model="searchParams.searchExmpYn"
                :label="t('MSG_TXT_VAC_EXMP')"
                :disable="isExmpYnChk"
              />
              <!-- val="방학면제" -->
            </template>
          </kw-field>
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PERF_YM')"
        >
          <!-- 실적년월 -->
          <!-- :colspan="2" -->
          <!-- rules="date_range_months:1" -->
          <kw-date-range-picker
            v-model:from="searchParams.perfStrtDtm"
            v-model:to="searchParams.perfFshDtm"
            type="month"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_CNTR_DTL_NO')">
          <!-- 계약상세번호 -->
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
          />
          <!-- v-model:cntr-sn="searchParams.cntrSn" -->
          <!-- :name="$t('MSG_TXT_CNTR_DTL_NO')" -->
        </kw-search-item>
        <!-- 조정유형 -->
        <kw-search-item :label="t('MSG_TXT_CTR_TP')">
          <kw-select
            v-model="searchParams.ctrTp"
            first-option="all"
            first-option-value="ALL"
            :options="codes.SL_CTR_DSC_TP_CD"
          />
        </kw-search-item>
        <!-- 자료구분 -->
        <kw-search-item :label="t('MSG_TXT_MTR_DV')">
          <!-- :model-value="['']"
          :options="['미이체 고객현황','B','C']" -->
          <kw-select
            v-model="searchParams.mtrDv"
            first-option="all"
            first-option-value="ALL"
            :options="codes.SL_CTR_MTR_DV_CD"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 조정구분 -->
        <kw-search-item :label="t('MSG_TXT_CTR_DV')">
          <kw-select
            v-model="searchParams.ctrDv"
            first-option="all"
            first-option-value="ALL"
            :options="codes.SL_CTR_DV_CD"
          />
        </kw-search-item>
        <!-- 할인 -->
        <kw-search-item :label="t('MSG_TXT_DSC')">
          <!-- :model-value="['']" -->
          <kw-select
            v-model="searchParams.dsc"
            first-option="all"
            first-option-value="ALL"
            :options="codes.SL_CTR_TP_CD"
          />
        </kw-search-item>
        <!-- (입력담당자, 사용자) / 등록자 선택 -->
        <kw-search-item :label="t('MSG_TXT_RGST_USR')">
          <kw-input
            v-model="searchParams.prtnrNo"
          />
          <!-- :readonly="true" -->
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 등록일자-->
        <kw-search-item
          :label="t('MSG_TXT_FST_RGST_DT')"
        >
          <!-- :colspan="2" -->
          <!-- rules="date_range_months:1" -->
          <kw-date-range-picker
            v-model:from="searchParams.slCtrPrcsStrtDt"
            v-model:to="searchParams.slCtrPrcsFshDt"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <ul class="kw-notification">
        <li>
          {{ $t('MSG_TXT_SRN_MAX_INQR_PSB') }}
          <!-- 화면에는 최대 1000건만 조회 가능합니다. 전체 자료는 엑셀다운로드를 이용하세요. -->
        </li>
      </ul>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :page-size="30"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
          />
          <!-- :page-size-options="[30,60,90,120]" -->
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
          <!-- (단위 : 원) -->
        </template>
        <!-- 행삭제 -->
        <kw-btn
          dense
          grid-action
          :label="t('MSG_BTN_DEL')"
          @click="onClickRemove"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 행추가 -->
        <kw-btn
          dense
          grid-action
          :label="t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <!-- 저장 -->
        <kw-btn
          dense
          grid-action
          :label="t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 엑셀 업로드-->
        <kw-btn
          icon="upload_on"
          dense
          :label="t('MSG_BTN_EXCEL_UP')"
          @click="onClickExcelUpload"
        />
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          :label="t('MSG_BTN_EXCEL_DOWN')"
          :disabled="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        v-if="searchParams.exmpYn === 'N'"
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalSize"
        :visible-rows="10"
        @init="initGrid1"
      />
      <kw-grid
        v-if="searchParams.exmpYn === 'Y'"
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalSize"
        :visible-rows="10"
        @init="initGrid2"
      />

      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useMeta, defineGrid, codeUtil, useDataService, getComponentType, gridUtil, modal, notify, alert } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import dayjs from 'dayjs';

const apiUri = '/sms/wells/withdrawal/pchssl/sales-control';
const dataService = useDataService();
const { getConfig } = useMeta();
const { t } = useI18n();
const grdMainRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  // 'SELL_TP_CD', //  판매유형코드
  // 'SL_CTR_MTR_DV_CD', // 조정자료구분코드 - 위약금x
  'SL_CTR_DSC_TP_CD', // 조정할인유형코드
  // 'SL_CTR_DV_CD', // 조정구분 - 부과/할인
  // 'SL_CTR_TP_CD', // 매출조정유형코드 - 할인
  // 'SL_CTR_MTR_TP_CD', // 매출조정자료유형코드

  /* 코드값이 약간 상이한관계로 차례대로 작성 */
  'SL_CTR_MTR_DV_CD', /* 자료구분 */
  'SELL_TP_CD', /* 판매유형 */
  'SELL_TP_DTL_CD', /* 판매유형상세  */
  'SL_CTR_DV_CD', /* 조정구분 */
  'SL_CTR_MTR_TP_CD', /* 조정유형 */
  'SL_CTR_TP_CD', /* 할인 */
);

// 판매유형상세코드 필터
const lump = codes.SELL_TP_DTL_CD.filter((p1) => ['11', '12', '13'].includes(p1.codeId));
const rental = codes.SELL_TP_DTL_CD.filter((p1) => ['21', '22', '23', '24', '25', '26'].includes(p1.codeId));
const membership = codes.SELL_TP_DTL_CD.filter((p1) => ['31', '32', '33'].includes(p1.codeId));
const delivery = codes.SELL_TP_DTL_CD.filter((p1) => ['61', '62', '63'].includes(p1.codeId));

const searchParams = ref({
  sellTp: 'ALL', // 판매유형
  sellTpDtlCd: 'ALL',
  exmpYn: 'N', // (방학)면제여부
  perfStrtDtm: '', // 실적 To
  perfFshDtm: '', // 실적 From
  cntrSn: '', // 계약일련번호(Int)
  cntrNo: '', // 계약번호(String)
  ctrTp: 'ALL', // 조정유형
  mtrDv: 'ALL', // 자료구분
  ctrDv: 'ALL', // 조정구분
  dsc: 'ALL', // 할인구분
  prtnrNo: '', // 등록자 아이디 -> 파트너 아이디
  ogTpCd: '',
  slCtrPrcsStrtDt: '', // 등록일자 From
  slCtrPrcsFshDt: '', // 등록일자 To
  searchExmpYn: 'N',
  limitCount: 0,
});

const isExmpYnChk = ref(true);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
let cachedParams2;
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const res = await dataService.get(`${apiUri}/paging`, { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  pages.forEach((p1) => {
    if (p1.slCtrMtrDvCd === '1' && p1.slCtrTpCd === '2') {
      p1.slCtrAmt = null;
    }
  });

  // 방학면제에 따라 컬럼변경
  data.checkRowStates(false);
  data.setRows(pages);
  // view.resetCurrent();
  data.checkRowStates(true);
}

// 조회 버튼 이벤트
async function onClickSearch() {
  if (!isEmpty(searchParams.value.userName) && isEmpty(searchParams.value.prtnrNo)) {
    return notify(t('MSG_ALT_SRCH_AFTER', [`${t('MSG_TXT_RGST_USR')} 조회 `]));
  }

  cachedParams = cloneDeep(searchParams.value);

  // 방학면제 선택시 그리드 변경X, 조회버튼 클릭시 변경
  searchParams.value.exmpYn = searchParams.value.searchExmpYn;

  await fetchData();
}

const optionsCodes = ref(codes.SELL_TP_DTL_CD.filter((p1) => ['21', '22', '24', '25', '26'].includes(p1.codeId)));
/*
// 사용자 조회 팝업 -> 파트너 조회
async function onClickSelectUser() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP', // Z-OG-U-0050P01
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
      ogTpCd: searchParams.value.ogTpCd,
    },
  });
  if (result) {
    // searchParams.value.claimNm = payload.prtnrKnm;
    // searchParams.value.cardPsrNm = payload.prtnrKnm;
    searchParams.value.prtnrNo = payload.prtnrNo;
    searchParams.value.userName = payload.prtnrKnm;
    searchParams.value.ogTpCd = payload.ogTpCd;
  }
}

async function onClearSelectUser() {
  searchParams.value.prtnrNo = '';
  searchParams.value.userName = '';
  searchParams.value.ogTpCd = '';
}
async function onKeydownSelectUser() {
  searchParams.value.prtnrNo = '';
  // searchParams.value.userName = '';
  searchParams.value.ogTpCd = '';
}
*/

// 행 추가 버튼
async function onClickAdd() {
  const view = grdMainRef.value.getView();
  if (searchParams.value.exmpYn === 'N') {
    gridUtil.insertRowAndFocus(view, 0, {
    // 고정데이터 존재시 삽입.
      canAfOjYn: 'N',
    });
  } else {
    gridUtil.insertRowAndFocus(view, 0, {
    // 고정데이터 존재시 삽입.
      // applyYear: '2023',
      slCtrMtrDvCd: '1',
      slCtrSellTpCd: '2',
      sellTpDtlCd: '21',
      slCtrDvCd: '2',
      slCtrDscTpCd: '18',
      slCtrMtrTpCd: '1',
    });
  }
}

// 행 삭제 버튼
async function onClickRemove() {
  const view = grdMainRef.value.getView();

  if (!gridUtil.getCheckedRowValues(view).length > 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM')); // 데이터를 선택해주세요.
    return;
  }
  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  const checkRows = await gridUtil.getCheckedRowValues(view);

  let deleteChk = false;

  checkRows.forEach((p1) => {
    if (p1.mdfyYn === 'N') {
      deleteChk = true;
      return false;
    }
  });

  if (deleteChk) {
    alert(t('MSG_ALT_CL_DTA_EXST')); // 마감된 데이터가 존재합니다.
    return;
  }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length > 0) {
    deletedRows.forEach((p1) => {
      if (isEmpty(p1.slCtrAmt)) {
        p1.slCtrAmt = p1.slCtrAmtDummy;
      }
    });
    console.log(deletedRows);
    await dataService.delete(`${apiUri}/delete`, { data: deletedRows });

    await alert(t('MSG_ALT_DELETED')); // 삭제 되었습니다.
    await fetchData();
  }
}
// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const limitCount = Math.ceil(pageInfo.value.totalCount / 100000);
  for (let i = 0; i < limitCount; i += 1) {
    cachedParams.limitCount = i * 100000;

    gridUtil.exportBulkView(view, {
      url: `${apiUri}/excel-download-bulk`, // url 지정
      parameter: { // 검색 조건을 그대로 넣어준다. 없을 경우 추가 하지 않아도 됨
        ...cachedParams, timeout: 6000000,
      },
      fileName: `${currentRoute.value.meta.menuName}_${dayjs().format('YYYYMMDDHHmmss')}_Bulk`,
    });
  }

  // const res = await dataService.get(`${apiUri}/excel-download`, { params: cachedParams });

  // await gridUtil.exportView(view, {
  //   fileName: currentRoute.value.meta.menuName,
  //   timePostfix: true,
  //   exportData: res.data,
  // });
}

// 엑셀업로드
async function onClickExcelUpload() {
  const apiUrl = `${apiUri}/${searchParams.value.exmpYn}/excel-upload`;
  const templateId = 'FOM_WDC_0001';

  // const templateId = 'FOM_WDC_0001';
  // if (searchParams.value.exmpYn === 'N') {
  //   templateId = 'FOM_WDC_0001';
  // } else {
  //   templateId = 'FOM_WDC_0002';
  // }

  const {
    payload,
  } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });

  if (payload.status === 'S') {
    notify(t('MSG_ALT_SAVE_DATA')); // 저장되었습니다.
    await fetchData();
  }

  // if (result && payload.status === 'S') {
  // if (resultData) {
  //   console.log(payload);
  //   notify(t('MSG_ALT_SAVE_DATA')); // 저장되었습니다.
  //   await fetchData();
  // }
}

// 판매유형 선택
async function onChangesellTp(param) {
  let options;

  searchParams.value.sellTpDtlCd = '';

  if (param === '1') {
    options = lump;
    isExmpYnChk.value = true;
  } else if (param === '2') {
    options = rental;
    isExmpYnChk.value = false;
  } else if (param === '3') {
    options = membership;
    isExmpYnChk.value = true;
  } else if (param === '6') {
    options = delivery;
    isExmpYnChk.value = true;
  } else {
    options = [];
    isExmpYnChk.value = true;
  }
  optionsCodes.value = options;
}

// 저장 버튼
async function onClickSave() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (await gridUtil.alertIfIsNotModified(view)) { return false; }

  if (!checkedRows.length > 0) {
    alert(t('MSG_ALT_NOT_SEL_ITEM')); // 데이터를 선택해주세요.
    return;
  }

  if (!await gridUtil.validate(view)) { return false; }

  const rowValues = gridUtil.getAllRowValues(view, false);

  // 중복신청 체크 ( 계약상세번호, 시작년월, 종료년월, 판매유형, 자료구분)
  const unique = [];
  const duplicates = rowValues.filter((item) => {
    if (unique.find((i) => (i.cntrDtlNo === item.cntrDtlNo)
    && (i.slCtrStrtYm === item.slCtrStrtYm)
    && (i.slCtrEndYm === item.slCtrEndYm)
    && (i.slCtrSellTpCd === item.slCtrSellTpCd)
    && (i.slCtrMtrDvCd === item.slCtrMtrDvCd))) {
      return true;
    }
    unique.push(item);
    return false;
  });

  if (duplicates.length > 0) {
    await alert(t('MSG_ALT_SL_CTR_DTA_EXST')); // 이미 매출조정에 등록된 데이터가 존재합니다.
    return;
  }

  let saveAmtCheck = 0;

  for (let i = 0; i < checkedRows.length; i += 1) {
    if (checkedRows[i].slCtrEndYm < checkedRows[i].slCtrStrtYm) {
      alert(t('종료년월이 시작년월 이전일 수 없습니다.'));
      return;
    }

    // 자료 구분 (1=매출, 2=연체가산금, 3=위약금)
    const slCtrMtrDvCdChk = checkedRows[i].slCtrMtrDvCd;

    // 조정금액
    const slCtrChkAmt = checkedRows[i].slCtrAmt;

    if (slCtrMtrDvCdChk === '2' && (slCtrChkAmt > checkedRows[i].dummyDlqAddAmt)) {
      saveAmtCheck = 1;
    } if (slCtrMtrDvCdChk === '3' && (slCtrChkAmt > checkedRows[i].dummyRsgBorAmt)) {
      saveAmtCheck = 1;
    }

    if (slCtrChkAmt === 0) {
      alert(t('조정금액은 0보다 커야합니다.'));
      return;
    }
  }

  // 매출은 체크 불필요
  if (saveAmtCheck > 0) {
    alert(t('조정가능금액을 초과 하였습니다.'));
    return;
  }

  checkedRows.forEach((p) => {
    if (p.slCtrMtrDvCd === '1' && p.slCtrTpCd === '2') {
      p.slCtrAmt = p.dummySlCtrAmt;
    }
  });

  await dataService.post(`${apiUri}/save`, checkedRows);
  notify(t('MSG_ALT_SAVE_DATA')); // 저장되었습니다.
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
/**
 *  TODO: 23.06 기준 설계서 수정 (방학면제 버튼에 따른 컬럼 추가).
 *  컬럼 추가 -> 버튼에 따른 Editable 처리인지, 그리드 컬럼 자체가 바뀌는것인지 문의.
 *
 *  고객관련 매출정보에 할인적용이나 기타할인적용시 매출을 조정하는 화면.
 *  방학면제 - 방학관련 해당서비스 사용불가능한경우 할인적용하는 것.
*/
const initGrid1 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, /* 계약번호  */
    { fieldName: 'cntrSn' }, /* 계약일련번호  */
    { fieldName: 'cntrDtlNo' }, /* 계약상세번호  */
    { fieldName: 'cstKnm' }, /* 고객명 */
    { fieldName: 'slCtrStrtYm' }, /* 시작년월 */
    { fieldName: 'slCtrEndYm' }, /* 종료년월  */
    { fieldName: 'slCtrEndYmDummy' }, /* 종료년월  */
    { fieldName: 'pdCd' }, /* 제품코드  */
    { fieldName: 'pdNm' }, /* 제품명 */
    { fieldName: 'slCtrSellTpCd' }, /* 판매유형 */
    { fieldName: 'sellTpDtlCd' }, /* 판매유형상세 */
    { fieldName: 'slCtrMtrDvCd' }, /* 조정자료구분코드 */
    { fieldName: 'slCtrDvCd' },
    { fieldName: 'slCtrMtrTpCd' }, /* 조정유형 */
    { fieldName: 'slCtrDscTpCd' }, /* 매출조정유형코드 */
    { fieldName: 'slCtrTpCd' }, /* 할인 */

    { fieldName: 'canAfOjYn' }, /* 취소후적용 */
    { fieldName: 'slCtrAmtDummy', dataType: 'number' }, /* 조회시 삭제를 위한 원래 조정금액 */
    { fieldName: 'slCtrAmt', dataType: 'number' }, /* 조정금액 */
    { fieldName: 'dummySlCtrAmt', dataType: 'number' }, /* 조정금액 */
    { fieldName: 'dlqAddAmt', dataType: 'number' }, /* 연체가산금액 */
    { fieldName: 'dummyDlqAddAmt', dataType: 'number' }, /* 연체가산금액 */
    { fieldName: 'rsgBorAmt', dataType: 'number' }, /* 위약금액 */
    { fieldName: 'dummyRsgBorAmt', dataType: 'number' }, /* 위약금액 */
    { fieldName: 'slCtrWoExmpAmt', dataType: 'number' }, /* 전액면제금액 */
    { fieldName: 'slCtrPtrmExmpAmt', dataType: 'number' }, /* 조회기간면제금액 */
    { fieldName: 'slCtrRmkCn' }, /* 조정사유 */
    { fieldName: 'fstRgstDtm' }, /* 등록일자 */
    { fieldName: 'usrNm' }, /* 등록자 */
    { fieldName: 'fnlMdfcUsrId' }, /* 번호 */
    { fieldName: 'mdfyYn' }, /* 마감데이터체크 */
  ];

  const columns = [
    {
      fieldName: 'cntrDtlNo',
      header: {
        text: t('MSG_TXT_CNTR_DTL_NO'), // 계약상세번호
        styleName: 'essential',
      },
      width: '140',
      styleName: 'text-center rg-button-icon--search',
      button: 'action',
      editor: {
        type: 'line',
      },
      rules: 'required|min:12|max:17',
      editable: false,
      buttonVisibleCallback(grid, index) {
        return grid.getDataSource().getRowState(index.dataRow) === 'created';
      },
    },
    { fieldName: 'cstKnm',
      header: t('MSG_TXT_CST_NM'),
      width: '100',
      styleName: 'text-center',
      editable: false,
    }, // 고객명
    {
      fieldName: 'slCtrStrtYm',
      header: {
        text: t('MSG_TXT_STRT_YM'), // 시작년월
        styleName: 'essential',
      },
      rules: 'required',
      width: '100',
      styleName: 'text-center',
      editor: { type: 'btdate',
        btOptions: {
          minViewMode: 1, // 캘린더 연월일->연/월(연월) 변경 기능
        } },
      datetimeFormat: 'yyyy-MM',
      editable: true,
      styleCallback(grid, dataCell) {
        const slCtrMtrDvCd = grid.getValue(dataCell.index.itemIndex, 'slCtrMtrDvCd');
        const ret = {};
        if (slCtrMtrDvCd === '2' || slCtrMtrDvCd === '3') {
          ret.editable = false;
        }
        return ret;
      },
    },
    { fieldName: 'slCtrEndYm',
      header: {
        text: t('MSG_TXT_END_YM'), // 종료년월
        styleName: 'essential',
      },
      rules: 'required',
      width: '100',
      styleName: 'text-center',
      editor: { type: 'btdate',
        btOptions: {
          minViewMode: 1,
        } },
      datetimeFormat: 'yyyy-MM',
      editable: true,
      styleCallback(grid, dataCell) {
        const slCtrEndYmDummy = grid.getValue(dataCell.index.itemIndex, 'slCtrEndYmDummy');
        const slCtrMtrDvCd = grid.getValue(dataCell.index.itemIndex, 'slCtrMtrDvCd');
        const ret = {};
        if (slCtrMtrDvCd === '2' || slCtrMtrDvCd === '3') {
          ret.editable = false;
        }
        if (slCtrEndYmDummy < dayjs().format('YYYYMM')) {
          ret.editable = false;
        }
        return ret;
      },
    },
    { fieldName: 'slCtrMtrDvCd',
      header: {
        text: t('MSG_TXT_MTR_DV'), // 자료구분
        styleName: 'essential',
      },
      width: '100',
      rules: 'required',
      editor: { type: 'list', textReadOnly: true },
      options: codes.SL_CTR_MTR_DV_CD,
      styleCallback(grid, dataCell) {
        const mdfyYn = grid.getValue(dataCell.index.itemIndex, 'mdfyYn');
        let ret = {};
        if (mdfyYn === 'N') {
          ret.editable = false;
        } else {
          ret = {
            editor: { type: 'list', textReadOnly: true },
          };
        }
        return ret;
      },
    },
    {
      fieldName: 'slCtrSellTpCd',
      header: {
        text: t('MSG_TXT_SEL_TYPE'), // 판매유형
        styleName: 'essential',
      },
      lookupDisplay: true,
      width: '100',
      rules: 'required',
      editor: { type: 'list', textReadOnly: true },
      options: codes.SELL_TP_CD,
      editable: false,
    },
    {
      fieldName: 'sellTpDtlCd',
      header: {
        text: t('MSG_TXT_SELL_TP_DTL'), // 판매유형상세
        styleName: 'essential',
      },
      editable: false,
      options: codes.SELL_TP_DTL_CD,
      width: '100',
      rules: 'required',
      editor: { type: 'list', textReadOnly: true,
      },
    },
    { fieldName: 'pdCd',
      header: t('MSG_TXT_PROD_CD'), // 제품코드
      width: '100',
      styleName: 'text-center',
      editable: false,
    },
    { fieldName: 'pdNm',
      header: t('MSG_TXT_GOODS_NM'), // 제품명
      width: '160',
      tyleName: 'text-center',
      editable: false,
    },
    {
      fieldName: 'slCtrDvCd',
      header: {
        text: t('MSG_TXT_CTR_DV'), // 조정구분
        styleName: 'essential',
      },
      width: '100',
      rules: 'required',
      editor: { type: 'list', textReadOnly: true },
      options: codes.SL_CTR_DV_CD,
      styleCallback(grid, dataCell) {
        const mdfyYn = grid.getValue(dataCell.index.itemIndex, 'mdfyYn');
        let ret = {};
        if (mdfyYn === 'N') {
          ret.editable = false;
        } else {
          ret = {
            editor: { type: 'list', textReadOnly: true },
          };
        }
        return ret;
      },
    },
    {
      fieldName: 'slCtrMtrTpCd',
      header: {
        text: t('MSG_TXT_DATA_TP'), // 자료유형
        styleName: 'essential',
      },
      width: '100',
      rules: 'required',
      editor: { type: 'list', textReadOnly: true },
      options: codes.SL_CTR_MTR_TP_CD,
      styleCallback(grid, dataCell) {
        const mdfyYn = grid.getValue(dataCell.index.itemIndex, 'mdfyYn');
        let ret = {};
        if (mdfyYn === 'N') {
          ret.editable = false;
        } else {
          ret = {
            editor: { type: 'list', textReadOnly: true },
          };
        }
        return ret;
      },
    },
    {
      fieldName: 'slCtrTpCd',
      header: {
        text: t('MSG_TXT_CTR_TP'), // 조정유형
        styleName: 'essential',
      },
      rules: 'required',
      width: '100',
      editor: { type: 'list', textReadOnly: true },
      editable: true,
      options: codes.SL_CTR_TP_CD,
      styleCallback(grid, dataCell) {
        const mdfyYn = grid.getValue(dataCell.index.itemIndex, 'mdfyYn');
        let ret = {};
        if (mdfyYn === 'N') {
          ret.editable = false;
        } else {
          ret = {
            editor: { type: 'list', textReadOnly: true },
          };
        }
        return ret;
      },
    },
    {
      fieldName: 'slCtrDscTpCd',
      header: {
        text: t('MSG_TXT_DSC'), // 할인
        styleName: 'essential',
      },
      width: '208',
      rules: 'required',
      editor: { type: 'list' },
      options: codes.SL_CTR_DSC_TP_CD,
      styleCallback(grid, dataCell) {
        const mdfyYn = grid.getValue(dataCell.index.itemIndex, 'mdfyYn');
        let ret = {};
        if (mdfyYn === 'N') {
          ret.editable = false;
        } else {
          ret = {
            editor: { type: 'list', textReadOnly: true },
          };
        }
        return ret;
      },
    },
    { fieldName: 'canAfOjYn',
      header: t('MSG_TXT_CAN_AFT_APY'), // 취소 후 적용
      width: '100',
      editor: { type: 'list', textReadOnly: true },
      editable: false,
      // styleCallback(grid, dataCell) {
      //   const mdfyYn = grid.getValue(dataCell.index.itemIndex, 'mdfyYn');
      //   let ret = {};
      //   if (mdfyYn === 'N') {
      //     ret.editable = false;
      //   } else {
      //     ret = {
      //       editor: { type: 'list', textReadOnly: true },
      //     };
      //   }
      //   return ret;
      // },
      options: [
        { codeId: 'Y', codeName: 'Y' },
        { codeId: 'N', codeName: 'N' },
      ],
    },
    { fieldName: 'slCtrAmt',
      header: {
        text: t('MSG_TXT_CTR_AMT'), // 조정금액
        styleName: 'essential',
      },
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      editable: true,
      styleCallback: (grid, dataCell) => {
        const ret = {};
        const { slCtrTpCd } = grid.getValues(dataCell.index.itemIndex);
        if (dataCell.item.rowState === 'created') {
          if (slCtrTpCd === '2') {
            ret.editable = false;
          }
          return ret;
        }
      },
    },
    { fieldName: 'slCtrWoExmpAmt',
      header: t('MSG_TXT_FULL_EXMP_AMT'), // 전액면제금액
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0',
      editable: false,
    },
    { fieldName: 'slCtrPtrmExmpAmt',
      header: t('MSG_TXT_INQR_PTRM_EXMP_AMT'), // 조회 기간 면제 금액
      width: '140',
      styleName: 'text-right',
      numberFormat: '#,##0',
      editable: false,
    },
    {
      fieldName: 'slCtrRmkCn',
      header: {
        text: t('MSG_TXT_RSN_FR_ADJ'), // 조정 사유
        styleName: 'essential',
      },
      rules: 'required',
      width: '208',
      styleCallback(grid, dataCell) {
        const mdfyYn = grid.getValue(dataCell.index.itemIndex, 'mdfyYn');
        let ret = {};
        if (mdfyYn === 'N') {
          ret.editable = false;
        } else {
          ret = {
            editor: { type: 'input', maxLength: 300 },
          };
        }
        return ret;
      },
    },
    { fieldName: 'fstRgstDtm',
      header: t('MSG_TXT_FST_RGST_DT'), // 등록일자
      width: '100',
      styleName: 'text-center',
      editable: false,
      datetimeFormat: 'date',
    },
    { fieldName: 'usrNm',
      header: t('MSG_TXT_RGST_USR'), // 등록자
      width: '100',
      editable: false,
      styleName: 'text-center',
    },
    { fieldName: 'fnlMdfcUsrId',
      header: t('MSG_TXT_SEQUENCE_NUMBER'), // 번호
      width: '100',
      styleName: 'text-center',
      editable: false,
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEditable = (grid, index) => {
    // if (gridUtil.isCreatedRow(grid, index.dataRow) && ['slCtrEndYm'].includes(index.column)) {
    //   return true;
    // }
    if (!gridUtil.isCreatedRow(grid, index.dataRow)) {
      const { slCtrMtrDvCd } = grid.getValues(index.itemIndex);

      if (slCtrMtrDvCd === '1' && ['slCtrEndYm'].includes(index.column)) {
        return true;
      }
      return false;
    }
  };

  // eslint-disable-next-line no-unused-vars
  view.onCellEdited = async (grid, itemIndex, row, field) => {
    const { fieldName } = grid.getCurrent();
    const { dummySlCtrAmt, slCtrMtrDvCd, dummyDlqAddAmt, dummyRsgBorAmt, slCtrTpCd } = grid.getValues(itemIndex);

    if (fieldName === 'slCtrSellTpCd') {
      grid.commit();
      grid.setValue(itemIndex, 'sellTpDtlCd', '');
    }

    const slCtrMtrDvCdIndex = data.getFieldIndex('slCtrMtrDvCd');
    const slCtrTpCdIndex = data.getFieldIndex('slCtrTpCd');

    // 자료구분이 연체가산금 or 위약금 입력 시 현재월로 입력, 수정 불가
    if (slCtrMtrDvCd !== '1' && field === slCtrMtrDvCdIndex) {
      view.setValue(itemIndex, 'slCtrStrtYm', dayjs().format('YYYYMM'));
      view.setValue(itemIndex, 'slCtrEndYm', dayjs().format('YYYYMM'));
    }

    // 수정한 필드가 자료구분이거나, 조정유형일 때
    if (slCtrMtrDvCd === '1' && (field === slCtrMtrDvCdIndex || field === slCtrTpCdIndex)) {
      if (slCtrTpCd === '2') {
        view.setValue(itemIndex, 'slCtrAmt', null);
      } else {
        view.setValue(itemIndex, 'slCtrAmt', dummySlCtrAmt);
      }
    }
    if (slCtrMtrDvCd === '2' && (field === slCtrMtrDvCdIndex || field === slCtrTpCdIndex)) {
      view.setValue(itemIndex, 'slCtrAmt', dummyDlqAddAmt);
    }
    if (slCtrMtrDvCd === '3' && (field === slCtrMtrDvCdIndex || field === slCtrTpCdIndex)) {
      view.setValue(itemIndex, 'slCtrAmt', dummyRsgBorAmt);
    }

    grid.commit();
  };

  // 셀버튼 클릭시 이벤트 (화면:소속코드 변경 참조)
  view.onCellButtonClicked = async (grid, { column, itemIndex }) => {
    if (column === 'cntrDtlNo') {
      const { result, payload } = await modal({
        component: 'WwctaContractNumberListP',
      });
      if (result) {
        // const cntrDtlNo = payload.cntrNo + payload.cntrSn;
        const { cntrNo, cntrSn, sellTpCd, cntrCstKnm, pdNm, pdCd, sellTpDtlCd } = payload;
        view.setValue(itemIndex, 'cntrNo', cntrNo);
        view.setValue(itemIndex, 'cntrSn', cntrSn);
        view.setValue(itemIndex, 'slCtrSellTpCd', sellTpCd);
        view.setValue(itemIndex, 'cntrDtlNo', `${cntrNo}-${cntrSn}`);
        view.setValue(itemIndex, 'cstKnm', cntrCstKnm);
        view.setValue(itemIndex, 'pdNm', pdNm);
        view.setValue(itemIndex, 'pdCd', pdCd);
        view.setValue(itemIndex, 'sellTpDtlCd', sellTpDtlCd);

        const searchDtl = ref({
          cntrNo: payload.cntrNo, // 판매유형
          cntrSn: payload.cntrSn, // 계약일련번호(Int)
        });
        cachedParams2 = cloneDeep(searchDtl.value);
        const res = await dataService.get('/sms/common/common/codes/contract/detail/paging', { params: cachedParams2 });

        const { cntrDtlStatCd } = res.data.list[0];

        view.setValue(itemIndex, 'canAfOjYn', 'Y');

        if (cntrDtlStatCd === '301' || cntrDtlStatCd === '302' || cntrDtlStatCd === '303') {
          view.setValue(itemIndex, 'canAfOjYn', 'N');
        }

        // 매출일 경우
        view.setValue(itemIndex, 'slCtrAmt', res.data.list[0].thmSlSumAmt);
        view.setValue(itemIndex, 'dummySlCtrAmt', res.data.list[0].thmSlSumAmt);

        // 연체가산금일 경우
        view.setValue(itemIndex, 'dlqAddAmt', res.data.list[0].dlqAddAmt);
        view.setValue(itemIndex, 'dummyDlqAddAmt', res.data.list[0].dlqAddAmt);

        // 위약금일 경우
        view.setValue(itemIndex, 'rsgBorAmt', res.data.list[0].rsgBorAmt);
        view.setValue(itemIndex, 'dummyRsgBorAmt', res.data.list[0].rsgBorAmt);

        grid.commit();
      }
    }
  };

  // eslint-disable-next-line no-unused-vars
  view.onValidate = (grid, index, value) => {
    const { slCtrTpCd, slCtrAmt, cntrDtlNo } = grid.getValues(index.itemIndex);
    if (isEmpty(cntrDtlNo)) {
      return t('MSG_ALT_SEARCH_CNTR_NO'); // 계약 번호를 검색해 주세요
    }

    if (!(slCtrTpCd === '2')) {
      if (slCtrAmt < 1) {
        return t('MSG_ALT_NCSR_CD', [t('MSG_TXT_CTR_AMT')]);
        // 조정금액 은(는) 필수 입력 항목입니다.
      }
    }
  };

  // view.onCellClicked = (grid, clickData) => {
  //   if (clickData.cellType === 'data') {
  //     // grid.checkItem(clickData.itemIndex, !grid.isCheckedItem(clickData.itemIndex));
  //   }
  // };
});

const initGrid2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, /* 계약번호  */
    { fieldName: 'cntrSn' }, /* 계약일련번호  */
    { fieldName: 'cntrDtlNo' }, /* 계약상세번호  */
    { fieldName: 'cstKnm' }, /* 고객명 */
    { fieldName: 'slCtrStrtYm' }, /* 매출일자 */
    { fieldName: 'slCtrEndYm' }, /* 만료일자 */
    { fieldName: 'canDt' }, /* 취소일자 */
    { fieldName: 'apyY' }, /* 적용년도 : default 현재년도 */
    { fieldName: 'jan' }, /* 1월 */
    { fieldName: 'feb' }, /* 2월 */
    { fieldName: 'jul' }, /* 7월 */
    { fieldName: 'aug' }, /* 8월 */
    { fieldName: 'slCtrMtrDvCd' }, /* 조정자료구분코드 */
    { fieldName: 'slCtrSellTpCd' }, /* 판매유형 */
    { fieldName: 'sellTpDtlCd' }, /* 판매유형상세 */ // SELL_TP_DTL_CD
    { fieldName: 'slCtrWoExmpAmt', dataType: 'number' }, /* 전액면제금액 */
    { fieldName: 'slCtrDvCd' }, /* 조정구분 */
    { fieldName: 'slCtrDscTpCd' }, /* 조정유형 */
    { fieldName: 'slCtrMtrTpCd' }, /* 유형 */
    { fieldName: 'pdCd' }, /* 상품코드 */
  ];

  const columns = [
    {
      fieldName: 'cntrDtlNo',
      header: {
        text: t('MSG_TXT_CNTR_DTL_NO'), // 계약상세번호
        styleName: 'essential',
      },
      rules: 'required',
      width: '130',
      styleName: 'text-left rg-button-icon--search',
      button: 'action',
      // editor: {
      //   type: 'line',
      // },
      editable: false,
      buttonVisibleCallback(grid, index) {
        return grid.getDataSource().getRowState(index.dataRow) === 'created';
      },
    },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', editable: false }, // 고객명
    {
      fieldName: 'slCtrStrtYm',
      header: {
        text: t('MSG_TXT_SL_DT'), // 매출일자
        styleName: 'essential',
      },
      rules: 'required',
      width: '100',
      styleName: 'text-center',
      editor: { type: 'btdate',
        btOptions: {
          minViewMode: 1, // 캘린더 연월일->연/월(연월) 변경 기능
        } },
      datetimeFormat: 'yyyy-MM',
      editable: true,
    },
    { fieldName: 'slCtrEndYm',
      header: {
        text: t('MSG_TXT_EXP_DT_1'), // 만료일자
        styleName: 'essential',
      },
      rules: 'required',
      width: '100',
      styleName: 'text-center',
      editor: { type: 'btdate',
        btOptions: {
          minViewMode: 1,
        } },
      datetimeFormat: 'yyyy-MM',
      editable: true },
    {
      fieldName: 'canDt',
      header: {
        text: t('MSG_TXT_CANC_DT'), // 취소일자
      },
      editor: { type: 'btdate',
        btOptions: {
          minViewMode: 1,
        } },
      datetimeFormat: 'yyyy-MM',
      width: '100',
    },
    {
      fieldName: 'apyY',
      header: {
        text: t('MSG_TXT_APY_Y'), // 적용년도
      },
      width: '100',
      editor: { type: 'input' },
      editable: true,
    },
    {
      fieldName: 'jan',
      header: {
        text: t('MSG_TXT_JAN'), // 1월
      },
      width: '45',
      renderer: {
        type: 'check',
        trueValues: 'Y', // default value, 생략 가능
        falseValues: 'N', // default value, 생략 가능
      },
    },
    {
      fieldName: 'feb',
      header: {
        text: t('MSG_TXT_FEB'), // 2월
      },
      width: '45',
      renderer: {
        type: 'check',
        trueValues: 'Y', // default value, 생략 가능
        falseValues: 'N', // default value, 생략 가능
      },
    },
    {
      fieldName: 'jul',
      header: {
        text: t('MSG_TXT_JUL'), // 7월
      },
      width: '45',
      renderer: {
        type: 'check',
        trueValues: 'Y', // default value, 생략 가능
        falseValues: 'N', // default value, 생략 가능
      },
    },
    {
      fieldName: 'aug',
      header: {
        text: t('MSG_TXT_AUG'), // 8월
      },
      width: '45',
      renderer: { // 그리드 체크박스
        type: 'check',
        trueValues: 'Y', // default value, 생략 가능
        falseValues: 'N', // default value, 생략 가능
      },
    },
    { fieldName: 'slCtrMtrDvCd',
      header: t('MSG_TXT_MTR_DV'), // 자료구분
      width: '100',
      styleName: 'text-center',
      editable: false,
      options: codes.SL_CTR_MTR_DV_CD,
    },
    { fieldName: 'slCtrSellTpCd',
      header: t('TXT_MSG_SELL_TP_CD'), // 판매유형
      editor: { type: 'list', textReadOnly: true },
      width: '160',
      styleName: 'text-center',
      editable: true,
      options: codes.SELL_TP_CD,
    },
    {
      fieldName: 'sellTpDtlCd',
      header: {
        text: t('MSG_TXT_SELL_TP_DTL'), // 판매유형상세
      },
      width: '100',
      editor: { type: 'list', textReadOnly: true },
      options: codes.SELL_TP_DTL_CD,
      editable: false,
    },
    {
      fieldName: 'slCtrWoExmpAmt',
      header: {
        text: t('MSG_TXT_FULL_EXMP_AMT'), // 전액면제금액
      },
      width: '208',
      rules: 'max:20|min:1|numeric',
      editor: { type: 'input' },
      editable: true,
    },
    {
      fieldName: 'slCtrDvCd',
      header: {
        text: t('MSG_TXT_CTR_DV'), // 조정구분
      },
      styleName: 'text-center',
      width: '100',
      editable: false,
      options: codes.SL_CTR_DV_CD,
    },
    {
      fieldName: 'slCtrDscTpCd',
      header: {
        text: t('MSG_TXT_CTR_TP'), // 조정유형
      },
      width: '160',
      editable: false,
      options: codes.SL_CTR_DSC_TP_CD,
    },
    {
      fieldName: 'slCtrMtrTpCd',
      header: {
        text: t('MSG_TXT_CTR'), // 조정
      },
      width: '100',
      editable: false,
      options: codes.SL_CTR_MTR_TP_CD,
    },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEditable = (grid, index) => {
    if (['cstKnm', 'apyY', 'slCtrMtrDvCd', 'slCtrSellTpCd', 'slCtrTpCd', 'slCtrMtrTpCd'].includes(index.column)) {
      return false;
    }

    if (!gridUtil.isCreatedRow(grid, index.dataRow) && ['cntrDtlNo', 'cstKnm', 'apyY', 'slCtrMtrDvCd', 'slCtrSellTpCd', 'sellTpDtlCd', 'slCtrWoExmpAmt', 'slCtrTpCd', 'slCtrMtrTpCd'].includes(index.column)) {
      return false;
    }
  };

  // 셀버튼 클릭시 이벤트 (화면:소속코드 변경 참조)
  view.onCellButtonClicked = async (grid, { column, itemIndex }) => {
    if (column === 'cntrDtlNo') {
      const { result, payload } = await modal({
        component: 'WwctaContractNumberListP',
      });
      if (result) {
        // const cntrDtlNo = payload.cntrNo + payload.cntrSn;
        const { cntrNo, cntrSn, sellTpCd, cntrCstKnm, pdNm, pdCd, sellTpDtlCd } = payload;
        console.log(payload);
        view.setValue(itemIndex, 'cntrNo', cntrNo);
        view.setValue(itemIndex, 'cntrSn', cntrSn);
        view.setValue(itemIndex, 'slCtrSellTpCd', sellTpCd);
        view.setValue(itemIndex, 'cntrDtlNo', cntrNo + cntrSn);
        view.setValue(itemIndex, 'cstKnm', cntrCstKnm);
        view.setValue(itemIndex, 'pdNm', pdNm);
        view.setValue(itemIndex, 'pdCd', pdCd);
        view.setValue(itemIndex, 'sellTpDtlCd', sellTpDtlCd);
      }
    }
  };
});

</script>
<style scoped> </style>
