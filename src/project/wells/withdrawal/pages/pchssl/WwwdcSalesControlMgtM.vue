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
      :cols="4"
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
            :options="codes.SELL_TP_CD "
            rules="required"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_DIV')">
          <kw-field>
            <!-- :model-value="['방학면제']" -->
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                v-model="searchParams.exmpYn"
                :label="t('MSG_TXT_VAC_EXMP')"
              />
              <!-- val="방학면제" -->
            </template>
          </kw-field>
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_PERF_YM')"
          :colspan="2"
        >
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
        <!-- 조정구분 -->
        <kw-search-item :label="t('MSG_TXT_CTR_DV')">
          <kw-select
            v-model="searchParams.ctrDv"
            first-option="all"
            first-option-value="ALL"
            :options="codes.SL_CTR_DV_CD"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
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
            :readonly="true"
            @click-icon="onClickSelectUser"
            @clear="onClearSelectUser"
          />
        </kw-search-item>
        <!-- 등록일자-->
        <kw-search-item
          :label="t('MSG_TXT_FST_RGST_DT')"
          :colspan="2"
        >
          <!-- rules="date_range_months:1" -->
          <kw-date-range-picker
            v-model:from="searchParams.slCtrPrcsStrtDt"
            v-model:to="searchParams.slCtrPrcsEndDt"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <ul class="kw-notification">
        <li>
          화면에는 최대 1000건만 조회 가능합니다. 전체 자료는 엑셀다운로드를 이용하세요.
        </li>
      </ul>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :page-size="30"
            :page-size-options="[30,60,90,120]"
            :total-count="pageInfo.totalCount"
          />
          <span class="ml8">(단위:원)</span>
        </template>
        <!-- 행삭제 -->
        <kw-btn
          dense
          grid-action
          :label="t('MSG_BTN_ROW_DEL')"
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
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalSize"
        :visible-rows="10"
        @init="initGrid"
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
  'SELL_TP_CD', //  판매유형코드
  'SL_CTR_MTR_DV_CD', // 조정자료구분코드 - 위약금x
  'SL_CTR_DSC_TP_CD', // 조정할인유형코드
  'SL_CTR_DV_CD', // 조정구분 - 부과/할인
  'SL_CTR_TP_CD', // 매출조정유형코드 - 할인
  'SL_CTR_MTR_TP_CD', // 매출조정자료유형코드
);
const searchParams = ref({
  sellTp: 'ALL', // 판매유형
  exmpYn: 'N', // (방학)면제여부
  perfStrtDtm: '', // 실적 To
  perfFshDtm: '', // 실적 From
  cntrSn: '', // 계약일련번호(Int)
  cntrNo: '', // 계약번호(String)
  ctrTp: 'ALL', // 조정유형
  mtrDv: 'ALL', // 자료구분
  ctrDv: 'ALL', // 조정구분
  dsc: 'ALL', // 할인구분
  fstRgstUsrId: '', // 등록자 아이디
  slCtrPrcsStrtDt: '', // 등록일자 From
  slCtrPrcsFshDt: '', // 등록일자 To
});

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

  data.checkRowStates(false);
  data.setRows(pages);
  view.resetCurrent();
  data.checkRowStates(true);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 사용자 조회 팝업
async function onClickSelectUser() {
  const { result, payload } = await modal({ component: 'ZwcmzSingleSelectUserListP' });
  if (result) {
    searchParams.value.fstRgstUsrId = payload.userId;
    // searchParams.value.userName = payload.userName; // 유저명(불필요한 데이터로 인한 주석)
  }
}

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {
    // 고정데이터 존재시 삽입.
    canAfOjYn: 'N',
  });
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
  const apiUrl = `${apiUri}/excel-upload`;

  const templateId = 'FOM_WDC_0001';

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
async function onClickSave() {
  const view = grdMainRef.value.getView();
  const changedRows = gridUtil.getChangedRowValues(view);
  console.log(changedRows);
  if (await gridUtil.alertIfIsNotModified(view)) { return false; }

  if (!await gridUtil.validate(view)) { return false; }
  await dataService.post(`${apiUri}/save`, changedRows);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
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
    { fieldName: 'slCtrMtrDvCd' }, /* 조정자료구분코드 */
    { fieldName: 'slCtrDvCd' },
    { fieldName: 'slCtrMtrTpCd' }, /* 조정유형 */
    { fieldName: 'slCtrDscTpCd' }, /* 할인 */

    { fieldName: 'canAfOjYn' }, /* 취소후적용 */
    { fieldName: 'slCtrAmt' }, /* 조정금액 */
    { fieldName: 'slCtrWoExmpAmt' }, /* 전액면제금액 */
    { fieldName: 'slCtrPtrmExmpAmt' }, /* 조회기간면제금액 */
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
      editor: { type: 'btdate' },
      datetimeFormat: 'yyyy-MM',
      editable: true,
    },
    { fieldName: 'slCtrEndYm',
      header: t('MSG_TXT_END_YM'),
      width: '100',
      styleName: 'text-center',
      editor: { type: 'btdate' },
      datetimeFormat: 'yyyy-MM',
      editable: true },
    {
      fieldName: 'slCtrMtrDvCd',
      header: {
        text: t('MSG_TXT_MTR_DV'),
        styleName: 'essential',
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
        styleName: 'essential',
      },
      width: '100',
      rules: 'required',
      editor: { type: 'dropdown' },
      editable: true,
      options: codes.SELL_TP_CD,
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
        text: t('MSG_TXT_CTR_TP'),
        styleName: 'essential',
      },
      width: '208',
      rules: 'required',
      editor: { type: 'dropdown' },
      options: codes.SL_CTR_DSC_TP_CD,
    },
    {
      fieldName: 'slCtrDscTpCd',
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
    { fieldName: 'slCtrAmt', header: t('MSG_TXT_CTR_AMT'), width: '100', styleName: 'text-right', editable: true },
    { fieldName: 'slCtrWoExmpAmt', header: t('MSG_TXT_FULL_EXMP_AMT'), width: '100', styleName: 'text-right', editable: true },
    { fieldName: 'slCtrPtrmExmpAmt', header: t('MSG_TXT_INQR_PTRM_EXMP_AMT'), width: '140', styleName: 'text-right', editable: true },
    {
      fieldName: 'slCtrRmkCn',
      header: {
        text: t('MSG_TXT_RSN_FR_ADJ'),
        styleName: 'essential',
      },
      rules: 'required',
      width: '208',
    },
    { fieldName: 'slCtrPrcsdt', header: t('MSG_TXT_FST_RGST_DT'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'usrNm', header: t('MSG_TXT_RGST_USR'), width: '100', editable: false },
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

  // 셀버튼 클릭시 이벤트 (화면:소속코드 변경 참조)
  view.onCellButtonClicked = async (grid, { column, itemIndex }) => {
    if (column === 'cntrDtlNo') {
      const { result, payload } = await modal({
        component: 'WwctaContractNumberListP',
      });
      if (result) {
        // const cntrDtlNo = payload.cntrNo + payload.cntrSn;
        const { cntrNo, cntrSn, sellTpCd, cntrCstKnm, pdNm } = payload;
        console.log(payload);
        view.setValue(itemIndex, 'cntrNo', cntrNo);
        view.setValue(itemIndex, 'cntrSn', cntrSn);
        view.setValue(itemIndex, 'slCtrSellTpCd', sellTpCd);
        view.setValue(itemIndex, 'cntrDtlNo', cntrNo + cntrSn);
        view.setValue(itemIndex, 'cstKnm', cntrCstKnm);
        view.setValue(itemIndex, 'pdNm', pdNm);
      }
    }
  };

  // data.setRows([
  //   { cntrDtlNo: '2020-5886575',
  // cstKnm: '김온달',
  // slCtrStrtYm: '2022-11',
  //  slCtrEndYm: '2022-12',
  //  slCtrMtrDvCd: '위약금',
  //   slCtrSellTpCd: '금융리스',
  //    pdCd: '6200',
  //    pdNm: '더원 데스크(WN678C)',
  //     slCtrMtrTpCd: '부과',
  //     col10: '매출조정(매출오류)',
  //      col11: '전체할인',
  //       col12: 'N',
  //        col13: '29,900',
  //         col14: '0',
  //         col15: '0',
  //         col16: '클레임방어',
  //          slCtrPrcsdt: '2022-12-05',
  //           col18: '김준혁', col19: '36641' },
  // ]);
});
</script>
<style scoped> </style>
