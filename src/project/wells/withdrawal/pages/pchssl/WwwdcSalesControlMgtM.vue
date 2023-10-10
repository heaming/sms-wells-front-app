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
            v-model="searchParams.userName"
            icon="search"
            clearable
            @click-icon="onClickSelectUser"
            @clear="onClearSelectUser"
            @keydown="onKeydownSelectUser"
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
import { useMeta, defineGrid, codeUtil, useDataService, getComponentType, gridUtil, modal, notify } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

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
});

const isExmpYnChk = ref(true);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
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

  // 방학면제에 따라 컬럼변경
  data.checkRowStates(false);
  data.setRows(pages);
  // view.resetCurrent();
  data.checkRowStates(true);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  // 방학면제 선택시 그리드 변경X, 조회버튼 클릭시 변경
  searchParams.value.exmpYn = searchParams.value.searchExmpYn;

  await fetchData();
}

const optionsCodes = ref(codes.SELL_TP_DTL_CD.filter((p1) => ['21', '22', '24', '25', '26'].includes(p1.codeId)));

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
      applyYear: '2023',
      slCtrMtrDvCd: '1',
      slCtrSellTpCd: '2',
      sellTpDtlCd: '21',
      slCtrDvCd: '2',
      slCtrDscTpCd: '18',
      slCtrMtrTpCd: '1',
    });
  }
}
async function onClickRemove() {
  const view = grdMainRef.value.getView();

  if (!gridUtil.getCheckedRowValues(view).length > 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length > 0) {
    await dataService.delete(`${apiUri}/delete`, { data: deletedRows });
    grdMainRef.value.getData().clearRows();
    await fetchData();
  }
}
// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get(`${apiUri}/excel-download`, { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}
// 엑셀업로드
async function onClickExcelUpload() {
  const apiUrl = `${apiUri}/${searchParams.value.exmpYn}/excel-upload`;
  // const templateId = 'FOM_WDC_0001';
  let templateId;

  if (searchParams.value.exmpYn === 'N') {
    templateId = 'FOM_WDC_0001';
  } else {
    templateId = 'FOM_WDC_0002';
  }

  const {
    resultData,
    payload,
  } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });
    // if (result && payload.status === 'S') {
  if (resultData) {
    console.log(payload);
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

async function onChangesellTp(param) {
  let options;

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

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const changedRows = gridUtil.getChangedRowValues(view);
  if (await gridUtil.alertIfIsNotModified(view)) { return false; }

  if (!await gridUtil.validate(view)) { return false; }
  await dataService.post(`${apiUri}/save`, changedRows);
  notify(t('MSG_ALT_SAVE_DATA'));
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
    { fieldName: 'pdCd' }, /* 제품코드  */
    { fieldName: 'pdNm' }, /* 제품명 */
    { fieldName: 'slCtrSellTpCd' }, /* 판매유형 */
    { fieldName: 'sellTpDtlCd' }, /* 판매유형상세 */
    { fieldName: 'slCtrMtrDvCd' }, /* 조정자료구분코드 */
    { fieldName: 'slCtrDvCd' },
    { fieldName: 'slCtrMtrTpCd' }, /* 조정유형 */
    { fieldName: 'slCtrDscTpCd' }, /* 할인 */
    { fieldName: 'slCtrTpCd' }, /* 할인 */

    { fieldName: 'canAfOjYn' }, /* 취소후적용 */
    { fieldName: 'slCtrAmt', dataType: 'number' }, /* 조정금액 */
    { fieldName: 'slCtrWoExmpAmt', dataType: 'number' }, /* 전액면제금액 */
    { fieldName: 'slCtrPtrmExmpAmt', dataType: 'number' }, /* 조회기간면제금액 */
    { fieldName: 'slCtrRmkCn' }, /* 조정사유 */
    { fieldName: 'slCtrPrcsdt' }, /* 등록일자 */
    { fieldName: 'usrNm' }, /* 등록자 */
    { fieldName: 'fnlMdfcUsrId' }, /* 번호 */
  ];

  const columns = [
    {
      fieldName: 'cntrDtlNo',
      header: {
        text: t('MSG_TXT_CNTR_DTL_NO'),
        styleName: 'essential',
      },
      width: '130',
      styleName: 'text-left rg-button-icon--search',
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
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', editable: false },
    {
      fieldName: 'slCtrStrtYm',
      header: {
        text: t('MSG_TXT_STRT_YM'),
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
      header: t('MSG_TXT_END_YM'),
      width: '100',
      styleName: 'text-center',
      editor: { type: 'btdate',
        btOptions: {
          minViewMode: 1,
        } },
      datetimeFormat: 'yyyy-MM',
      editable: true },
    {
      fieldName: 'slCtrMtrDvCd',
      header: {
        text: t('MSG_TXT_MTR_DV'),
        styleName: 'essential',
        // 자료구분
      },
      width: '100',
      rules: 'required',
      editor: { type: 'dropdown' },
      options: codes.SL_CTR_MTR_DV_CD,
    },
    {
      fieldName: 'slCtrSellTpCd',
      header: {
        text: t('MSG_TXT_SEL_TYPE'),
        // 판매유형
        styleName: 'essential',
      },
      lookupDisplay: true,
      width: '100',
      rules: 'required',
      editor: { type: 'dropdown' },
      editable: true,
      options: codes.SELL_TP_CD,

    },
    {
      fieldName: 'sellTpDtlCd',
      header: {
        text: t('MSG_TXT_SELL_TP_DTL'),
        styleName: 'essential',
      },
      width: '100',
      rules: 'required',
      editor: { type: 'dropdown',
      },
      // editable: true,
      options: codes.SELL_TP_DTL_CD,
      styleCallback(grid, dataCell) {
        const sellTpCd = grid.getValue(dataCell.index.itemIndex, 'slCtrSellTpCd');
        const lumpCodeId = lump.map((param) => param.codeId);
        const lumpCodeName = lump.map((param) => param.codeName);

        const rentalCodeId = rental.map((param) => param.codeId);
        const rentalCodeName = rental.map((param) => param.codeName);

        const membershipCodeId = membership.map((param) => param.codeId);
        const membershipCodeName = membership.map((param) => param.codeName);

        const deliveryCodeId = delivery.map((param) => param.codeId);
        const deliveryCodeName = delivery.map((param) => param.codeName);

        const ret = {};
        switch (sellTpCd) {
          case '1':
            ret.editor = {
              type: 'dropdown',
              values: lumpCodeId,
              labels: lumpCodeName,
              editable: true,
              textReadOnly: true,
            };
            break;
          case '2':
            ret.editor = {
              type: 'dropdown',
              values: rentalCodeId,
              labels: rentalCodeName,
              editable: true,
              textReadOnly: true,
            };
            break;
          case '3':
            ret.editor = {
              type: 'dropdown',
              values: membershipCodeId,
              labels: membershipCodeName,
              editable: true,
              textReadOnly: true,
            };
            break;
          case '6':
            ret.editor = {
              type: 'dropdown',
              values: deliveryCodeId,
              labels: deliveryCodeName,
              editable: true,
              textReadOnly: true,
            };
            break;
          case '9':
            ret.editor = {
              values: '',
              labels: '',
            };
            break;
          default:
            ret.editor = {
              type: 'dropdown',
              values: Array([]),
              labels: Array([]),
            };
            ret.editable = false;
            break;
        }
        return ret;
      },
      // valueCallback: (gridBase, rowId, fieldName, field, values) => {
      //   const no = values[field.indexOf('slCtrSellTpCd')];
      //   console.log(no);
      //   // let value;
      //   return 0;
      // },

      // displayCallback(grid, index, value) {
      //   // let retValue = value;
      //   console.log(value);
      //   const sellTpDtlCd = grid.getValue(index.itemIndex, 'sellTpDtlCd');
      //   // let idx;
      //   const sellTpCd = grid.getValue(index.itemIndex, 'slCtrSellTpCd');
      //   // const lumpCodeId = lump.map((param) => param.codeId);
      //   // const lumpCodeName = lump.map((param) => param.codeName);

      //   // const rentalCodeId = rental.map((param) => param.codeId);
      //   // const rentalCodeName = rental.map((param) => param.codeName);

      //   // const membershipCodeId = membership.map((param) => param.codeId);
      //   // const membershipCodeName = membership.map((param) => param.codeName);

      //   // const deliveryCodeId = delivery.map((param) => param.codeId);
      //   // const deliveryCodeName = delivery.map((param) => param.codeName);

      //   if (sellTpCd === '4' || sellTpCd === '5') {
      //     return -1;
      //   }
      //   return sellTpDtlCd;

      // switch (sellTpCd) {
      //   case '1':
      //     // idx = lump.indexOf(value);
      //     retValue = {
      //       lump,
      //     };
      //     break;
      //   case '2':
      //     // idx = rental.indexOf(value);
      //     // retValue = rental[idx];
      //     retValue = {
      //       codeId: rentalCodeId,
      //       codeName: rentalCodeName,
      //     };
      //     break;
      //   case '3':
      //     // idx = membership.indexOf(value);
      //     retValue = membership;
      //     break;
      //   case '4':
      //     retValue = '';
      //     break;
      //   case '5':
      //     retValue = '';
      //     break;
      //   case '6':
      //     // idx = delivery.indexOf(value);
      //     retValue = delivery;
      //     break;
      //   default:
      //     retValue = value;
      //     break;
      // }
      // return retValue;
      // },
    },
    { fieldName: 'pdCd', header: t('MSG_TXT_PROD_CD'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'pdNm', header: t('MSG_TXT_GOODS_NM'), width: '160', styleName: 'text-center', editable: false },
    {
      fieldName: 'slCtrDvCd',
      header: {
        text: t('MSG_TXT_CTR_DV'),
        styleName: 'essential',
      },
      width: '100',
      rules: 'required',
      editor: { type: 'dropdown' },
      options: codes.SL_CTR_DV_CD,
    },
    {
      fieldName: 'slCtrMtrTpCd',
      header: {
        text: t('MSG_TXT_DATA_TP'),
        styleName: 'essential',
        // 자료유형코드
      },
      width: '100',
      rules: 'required',
      editor: { type: 'dropdown' },
      options: codes.SL_CTR_MTR_TP_CD,
    },
    {
      fieldName: 'slCtrDscTpCd',
      header: {
        text: t('MSG_TXT_CTR_TP'),
        styleName: 'essential',
      },
      width: '208',
      rules: 'required',
      editor: { type: 'dropdown' },
      options: codes.SL_CTR_DSC_TP_CD,
    },
    {
      fieldName: 'slCtrTpCd',
      header: {
        text: t('MSG_TXT_DSC'),
        styleName: 'essential',
      },
      rules: 'required',
      width: '100',
      editor: { type: 'dropdown' },
      editable: true,
      options: codes.SL_CTR_TP_CD,
    },
    { fieldName: 'canAfOjYn', header: t('MSG_TXT_CAN_AFT_APY'), width: '100', editor: { type: 'dropdown' }, editable: true, options: [{ codeId: 'Y', codeName: 'Y' }, { codeId: 'N', codeName: 'N' }] },
    { fieldName: 'slCtrAmt', header: t('MSG_TXT_CTR_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', editable: true },
    { fieldName: 'slCtrWoExmpAmt', header: t('MSG_TXT_FULL_EXMP_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', editable: true },
    { fieldName: 'slCtrPtrmExmpAmt', header: t('MSG_TXT_INQR_PTRM_EXMP_AMT'), width: '140', styleName: 'text-right', numberFormat: '#,##0', editable: true },
    {
      fieldName: 'slCtrRmkCn',
      header: {
        text: t('MSG_TXT_RSN_FR_ADJ'),
        styleName: 'essential',
      },
      rules: 'required',
      width: '208',
    },
    { fieldName: 'slCtrPrcsdt', header: t('MSG_TXT_FST_RGST_DT'), width: '100', styleName: 'text-center', editable: false, datetimeFormat: 'date' },
    { fieldName: 'usrNm', header: t('MSG_TXT_RGST_USR'), width: '100', editable: false, styleName: 'text-center' },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center', editable: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEditable = (grid, index) => {
    if (!gridUtil.isCreatedRow(grid, index.dataRow) && ['cntrDtlNo', 'slCtrStrtYm', 'slCtrEndYm', 'pdCd', 'pdNm', 'slCtrAmt', 'slCtrWoExmpAmt', 'slCtrPtrmExmpAmt'].includes(index.column)) {
      return false;
    }
  };

  view.onCellEdited = async (grid, itemIndex) => {
    const { fieldName } = grid.getCurrent();

    if (fieldName === 'slCtrSellTpCd') {
      grid.commit();
      grid.setValue(itemIndex, 'sellTpDtlCd', '');
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
        const { cntrNo, cntrSn, sellTpCd, cntrCstKnm, pdNm, pdCd } = payload;
        console.log(payload);
        view.setValue(itemIndex, 'cntrNo', cntrNo);
        view.setValue(itemIndex, 'cntrSn', cntrSn);
        view.setValue(itemIndex, 'slCtrSellTpCd', sellTpCd);
        view.setValue(itemIndex, 'cntrDtlNo', cntrNo + cntrSn);
        view.setValue(itemIndex, 'cstKnm', cntrCstKnm);
        view.setValue(itemIndex, 'pdNm', pdNm);
        view.setValue(itemIndex, 'pdCd', pdCd);
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
        text: t('MSG_TXT_CNTR_DTL_NO'),
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
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', editable: false },
    {
      fieldName: 'slCtrStrtYm',
      header: {
        text: t('MSG_TXT_SL_DT'),
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
        text: t('MSG_TXT_EXP_DT_1'),
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
        text: t('MSG_TXT_CANC_DT'),
        // 취소일자
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
        text: t('MSG_TXT_APY_Y'),
        // 적용년도
      },
      width: '100',
      editor: { type: 'input' },
      editable: true,

    },
    {
      fieldName: 'jan',
      header: {
        text: t('MSG_TXT_JAN'),
        // 1월
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
        text: t('MSG_TXT_FEB'),
        // 2월
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
        text: t('MSG_TXT_JUL'),
        // 7월
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
        text: t('MSG_TXT_AUG'),
        // 적용년도
      },
      width: '45',
      renderer: { // 그리드 체크박스
        type: 'check',
        trueValues: 'Y', // default value, 생략 가능
        falseValues: 'N', // default value, 생략 가능
      },
    },
    { fieldName: 'slCtrMtrDvCd', header: t('MSG_TXT_MTR_DV'), width: '100', styleName: 'text-center', editable: false, options: codes.SL_CTR_MTR_DV_CD },
    { fieldName: 'slCtrSellTpCd',
      header: t('TXT_MSG_SELL_TP_CD'),
      editor: { type: 'dropdown' },
      width: '160',
      styleName: 'text-center',
      editable: true,
      options: codes.SELL_TP_CD,
    },
    {
      fieldName: 'sellTpDtlCd',
      header: {
        text: t('MSG_TXT_SELL_TP_DTL'),
      },
      width: '100',
      editor: { type: 'dropdown' },
      options: codes.SELL_TP_DTL_CD,
      editable: false,
      // styleCallback(grid, dataCell) {
      //   console.log(grid, dataCell);
      //   const ret = {
      //     type: 'dropdown',
      //     labels: { 0: '렌탈' },
      //     values: { 0: '21' },
      //   };
      // const sellTpCd = grid.getValue(dataCell.index.itemIndex, 'slCtrSellTpCd');

      // const lumpCodeId = lump.map((param) => param.codeId);
      // const lumpCodeName = lump.map((param) => param.codeName);

      // const rentalCodeId = rental.map((param) => param.codeId);
      // const rentalCodeName = rental.map((param) => param.codeName);

      // const membershipCodeId = membership.map((param) => param.codeId);
      // const membershipCodeName = membership.map((param) => param.codeName);

      // const deliveryCodeId = delivery.map((param) => param.codeId);
      // const deliveryCodeName = delivery.map((param) => param.codeName);

      // switch (sellTpCd) {
      //   case '1':
      //     ret.editor = {
      //       type: 'dropdown',
      //       values: lumpCodeId,
      //       labels: lumpCodeName,
      //     };
      //     break;
      //   case '2':
      //     ret.editor = {
      //       type: 'dropdown',
      //       values: rentalCodeId,
      //       labels: rentalCodeName,
      //     };
      //     break;
      //   case '3':
      //     ret.editor = {
      //       type: 'dropdown',
      //       values: membershipCodeId,
      //       labels: membershipCodeName,
      //     };
      //     break;
      //   case '6':
      //     ret.editor = {
      //       type: 'dropdown',
      //       values: deliveryCodeId,
      //       labels: deliveryCodeName,
      //     };
      //     break;
      //   default:
      //     ret.editor = {};
      //     break;
      // }
      // console.log(ret);
      // return ret;
      // },
    },
    {
      fieldName: 'slCtrWoExmpAmt',
      header: {
        text: t('MSG_TXT_FULL_EXMP_AMT'),
      },
      width: '208',
      rules: 'max:20|min:1|numeric',
      editor: { type: 'input' },
      editable: true,
    },
    {
      fieldName: 'slCtrDvCd',
      header: {
        text: t('MSG_TXT_CTR_DV'),
      },
      styleName: 'text-center',
      width: '100',
      editable: false,
      options: codes.SL_CTR_DV_CD,
    },
    {
      fieldName: 'slCtrDscTpCd',
      header: {
        text: t('MSG_TXT_CTR_TP'),
        // 조정유형
      },
      width: '160',
      editable: false,
      options: codes.SL_CTR_DSC_TP_CD,
    },
    {
      fieldName: 'slCtrMtrTpCd',
      header: {
        text: t('MSG_TXT_CTR'),
        // 조정
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
        const { cntrNo, cntrSn, sellTpCd, cntrCstKnm, pdNm, pdCd } = payload;
        console.log(payload);
        view.setValue(itemIndex, 'cntrNo', cntrNo);
        view.setValue(itemIndex, 'cntrSn', cntrSn);
        view.setValue(itemIndex, 'slCtrSellTpCd', sellTpCd);
        view.setValue(itemIndex, 'cntrDtlNo', cntrNo + cntrSn);
        view.setValue(itemIndex, 'cstKnm', cntrCstKnm);
        view.setValue(itemIndex, 'pdNm', pdNm);
        view.setValue(itemIndex, 'pdCd', pdCd);
      }
    }
  };
});

</script>
<style scoped> </style>
