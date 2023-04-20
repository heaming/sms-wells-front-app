<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaTradeSpcshBlkPrntMgtM - wells 거래명세서 일괄출력 (추가)
3. 작성자 : JSY
4. 작성일 : 2023.04.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U-0150M01] - wells 거래명세서 일괄출력 (추가)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <!-- 등록일 -->
        <kw-search-item
          :label="$t('MSG_TXT_RGST_DT')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.rgstStartDt"
            v-model:to="searchParams.rgstEndDt"
            rules="date_range_required|date_range_months:1"
          />
        </kw-search-item>
        <!-- 고객코드 -->
        <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <kw-input v-model="searchParams.cstCd" />
        </kw-search-item>
        <!-- 그룹번호 -->
        <kw-search-item :label="$t('MSG_TXT_GRP_NO')">
          <kw-input v-model="searchParams.grpStartNo" />
          <span>~</span>
          <kw-input v-model="searchParams.grpEndNo" />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
        </template>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          :total-count="pageInfo.totalCount"
          @change="fetchData"
        />
        <!-- 삭제 -->
        <kw-btn
          :label="t('MSG_BTN_DEL')"
          grid-action
          @click="onClickRemove"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-select
          v-model="addParams.addCount"
          :options="searchGbns"
          dense
          class="w90"
        />
        <!-- 행 추가 -->
        <kw-btn
          :label="t('MSG_BTN_ROW_ADD')"
          grid-action
          @click="onClickAdd"
        />
        <!-- 저장 -->
        <kw-btn
          :label="t('MSG_BTN_SAVE')"
          grid-action
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 엑셀 다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="pageInfo.totalCount === 0"
          :label="t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 거래명세서 발송 -->
        <kw-btn
          :label="$t('MSG_TXT_TRD_SPCSH')+' '+$t('MSG_TXT_PSH_SEND')"
          primary
          dense
          @click="onClickOpenPopup"
        />
      </kw-action-top>
      <kw-grid
        ref="grdTradeSpcshBlkPrntList"
        name="grdTradeSpcshBlkPrntList"
        @init="initGridTradeSpcshBlkPrntList"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, gridUtil, getComponentType, useGlobal, defineGrid, useMeta } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { notify, alert, modal } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdTradeSpcshBlkPrntList = ref(getComponentType('KwGrid'));
const { getConfig } = useMeta();
const now = dayjs();

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'SPECTX_PBL_D_DV_CD',
  'SPECTX_PRD_DV_CD',
);

const searchGbns = ref([
  { codeId: 1, codeName: '1' },
  { codeId: 2, codeName: '2' },
  { codeId: 3, codeName: '3' },
  { codeId: 4, codeName: '4' },
  { codeId: 5, codeName: '5' },
  { codeId: 6, codeName: '6' },
  { codeId: 7, codeName: '7' },
  { codeId: 8, codeName: '8' },
  { codeId: 9, codeName: '9' },
  { codeId: 10, codeName: '10' },
  { codeId: 20, codeName: '20' },
  { codeId: 30, codeName: '30' },
  { codeId: 40, codeName: '40' },
  { codeId: 50, codeName: '50' },
  { codeId: 60, codeName: '60' },
  { codeId: 70, codeName: '70' },
  { codeId: 80, codeName: '80' },
  { codeId: 90, codeName: '90' },
  { codeId: 100, codeName: '100' },
]);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const searchParams = ref({
  rgstStartDt: now.format('YYYYMM01'), // 등록시작일
  rgstEndDt: now.format('YYYYMMDD'), // 등록마지막일
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  grpStartNo: '', // 그룹번호시작
  grpEndNo: '', // 그룹번호끝
});

const addParams = ref({
  addCount: 1, // 행 추가 갯수
});

let cachedParams;

async function fetchData() {
  const res = await dataService.get('sms/wells/contract/contracts/trade-specification-sheets', { params: cachedParams });

  const view = grdTradeSpcshBlkPrntList.value.getView();
  const dataSource = view.getDataSource();
  dataSource.setRows(res.data);
  pageInfo.value.totalCount = view.getItemCount();

  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickAdd() {
  const view = grdTradeSpcshBlkPrntList.value.getView();
  const res = await dataService.post('sms/wells/contract/contracts/trade-specification-sheets/addRows');

  for (let i = 0; i < addParams.value.addCount; i += 1) {
    gridUtil.insertRowAndFocus(view, 0, { spectxGrpNo: res.data });
  }
}

async function onClickExcelDownload() {
  const view = grdTradeSpcshBlkPrntList.value.getView();
  const res = await dataService.get('sms/wells/contract/contracts/trade-specification-sheets/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSave() {
  const view = grdTradeSpcshBlkPrntList.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('sms/wells/contract/contracts/trade-specification-sheets', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

async function onClickOpenPopup() {
  const cpProps = '';
  const { result, payload } = await modal({
    component: 'WwctaTradeSpcshBlkPwMgtP',
    componentProps: cpProps,
  });
  if (result) {
    console.log(payload);
  }
}

// 행삭제
async function onClickRemove() {
  const view = grdTradeSpcshBlkPrntList.value.getView();

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  // rowState 삭제상태 none 으로 나와 임시 set
  for (let i = 0; i < deletedRows.length; i += 1) {
    deletedRows[i].rowState = 'deleted';
  }

  if (deletedRows.length > 0) {
    await dataService.delete('sms/wells/contract/contracts/trade-specification-sheets', { data: deletedRows });
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridTradeSpcshBlkPrntList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'spectxGrpNo' }, // 그룹번호
    { fieldName: 'sellTpCd' }, // 계약구분
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cstNm' }, // 고객명
    { fieldName: 'spectxPrntY' }, // 발행년도
    { fieldName: 'spectxPblDDvCd' }, // 발행일
    { fieldName: 'spectxPrdDvCd' }, // 발행주기
    { fieldName: 'emadr' }, // 이메일
    { fieldName: 'faxLocaraTno' }, // 팩스지역전화번호
    { fieldName: 'faxExno' }, // 팩스전화국번호
    { fieldName: 'faxIdvTno' }, // 팩스개별전화번호
    { fieldName: 'fstRgstUsrId' }, // 최초등록사용자ID
    { fieldName: 'epNo' }, //
    { fieldName: 'fstRgstD' }, // 등록일
    { fieldName: 'fstRgstDtm' }, // 등록일시
    { fieldName: 'lstmmYn' }, // 전월여부
    { fieldName: 'cstNo' }, // 고객번호
  ];

  const columns = [
    { fieldName: 'spectxGrpNo', header: `${t('MSG_TXT_SAP_GRP')}${t('MSG_TXT_SEQUENCE_NUMBER')}`, width: '100', styleName: 'text-center', editable: false, rules: 'required' }, // 그룹번호
    {
      fieldName: 'sellTpCd',
      header: t('MSG_TXT_CNTR_DV'),
      width: '120',
      styleName: 'text-center',
      options: codes.SELL_TP_CD,
      editor: { type: 'list' },
      rules: 'required',
      editable: false,
    }, // 계약구분
    {
      fieldName: 'cntrDtlNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '120',
      styleName: 'text-center',
      rules: 'required',
    }, // 계약상세번호
    { fieldName: 'cstNm', header: t('MSG_TXT_CST_NM'), width: '110', styleName: 'text-center', rules: 'required', editable: false }, // 고객명
    { fieldName: 'spectxPrntY', header: `${t('MSG_TXT_PBL')}${t('MSG_TXT_Y')}`, width: '80', styleName: 'text-center', editable: false }, // 발행년도
    {
      fieldName: 'spectxPblDDvCd',
      header: t('MSG_TXT_PUBL_DT'),
      width: '100',
      styleName: 'text-center',
      options: codes.SPECTX_PBL_D_DV_CD,
      editor: { type: 'list' },
      rules: 'required',
    }, // 발행일
    {
      fieldName: 'spectxPrdDvCd',
      header: `${t('MSG_TXT_PBL')}${t('MSG_TXT_CYCL')}`,
      width: '100',
      styleName: 'text-center',
      options: codes.SPECTX_PRD_DV_CD,
      editor: { type: 'list' },
      rules: 'required',
    }, // 발행주기
    { fieldName: 'emadr', header: t('MSG_TXT_EMAIL'), width: '220', styleName: 'text-left' }, // 이메일
    { fieldName: 'faxLocaraTno', header: t('MSG_TXT_FAX_LOCARA_TNO'), width: '220', styleName: 'text-center' }, // 팩스지역전화번호
    { fieldName: 'faxExno', header: t('MSG_TXT_FAX_MEXNO'), width: '220', styleName: 'text-center' }, // 팩스전화국번호
    { fieldName: 'faxIdvTno', header: t('MSG_TXT_FAX_IDV_TNO'), width: '220', styleName: 'text-center' }, // 팩스개별전화번호
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_RGR_EP_NO'), width: '100', styleName: 'text-center', editable: false }, // 등록자 사번
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT'), width: '106', styleName: 'text-center', editable: false }, // 등록일
    { fieldName: 'lstmmYn', header: `${t('MSG_TXT_LSTMM')}${t('MSG_TXT_YN')}`, width: '106', styleName: 'text-center', editable: false, renderer: { type: 'check', trueValues: 'Y', falseValues: 'N' } }, // 전월여부
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  view.editOptions.editable = true;

  view.onCellEdited = async function CellEdited(grid, index, dataRow, field) {
    if (field === 2) {
      const cntrDtlNo = grid.getValue(index, 2);
      const spectxGrpNo = grid.getValue(index, 0);
      if (!isEmpty(cntrDtlNo)) {
        const cntrNo = String(cntrDtlNo).split('-')[0];
        const cntrSn = String(cntrDtlNo).split('-')[1];
        const res = await dataService.get(`sms/wells/contract/contracts/trade-specification-sheets/${cntrSn}`, {
          params: {
            cntrNo,
            cntrSn,
          },
        });
        const rows = gridUtil.filter(view, (e) => e.spectxGrpNo === spectxGrpNo); // 같은 그룹번호 로우 찾기
        data.setValue(dataRow, 'sellTpCd', '');
        data.setValue(dataRow, 'cstNm', '');
        data.setValue(dataRow, 'emadr', '');
        if ((!isEmpty(res.data))) {
          data.setValue(dataRow, 'sellTpCd', res.data.sellTpCd);
          data.setValue(dataRow, 'cstNm', res.data.cstKnm);
          data.setValue(dataRow, 'cntrNo', cntrNo);
          data.setValue(dataRow, 'cntrSn', cntrSn);
          for (let i = 0; i < rows.length; i += 1) {
            const row = gridUtil.findDataRow(view, (e) => e.spectxGrpNo === spectxGrpNo
              && (e.emadr !== res.data.emadr)); // 같은 그룹번호의 이메일, 팩스번호 동일하게 셋팅
            data.setValue(row, 'emadr', res.data.emadr);
          }
        }
      }
      notify(t('MSG_ALT_BULK_APPLY_SUCCESS', [t('MSG_TXT_EMAIL')])); // {이메일} 항목이 일괄변경 되었습니다.
    }
    if (field === 9) {
      const spectxGrpNo = grid.getValue(index, 0);
      const emadr = grid.getValue(index, 9);
      const rows = gridUtil.filter(view, (e) => e.spectxGrpNo === spectxGrpNo); // 같은 그룹번호 로우 찾기
      for (let i = 0; i < rows.length - 1; i += 1) {
        grid.commit();
        const row = gridUtil.findDataRow(view, (e) => e.spectxGrpNo === spectxGrpNo
          && (e.emadr !== emadr)); // 같은 그룹번호의 이메일, 팩스번호 동일하게 셋팅
        data.setValue(row, 'emadr', emadr);
      }
      notify(t('MSG_ALT_BULK_APPLY_SUCCESS', [t('MSG_TXT_EMAIL')])); // {이메일} 항목이 일괄변경 되었습니다.
    }
    if (field === 10) {
      const spectxGrpNo = grid.getValue(index, 0);
      const faxLocaraTno = grid.getValue(index, 10);
      const rows = gridUtil.filter(view, (e) => e.spectxGrpNo === spectxGrpNo); // 같은 그룹번호 로우 찾기
      for (let i = 0; i < rows.length - 1; i += 1) {
        grid.commit();
        const row = gridUtil.findDataRow(view, (e) => (e.spectxGrpNo === spectxGrpNo)
          && (e.faxLocaraTno !== faxLocaraTno)); // 같은 그룹번호의 이메일, 팩스번호 동일하게 셋팅
        data.setValue(row, 'faxLocaraTno', faxLocaraTno);
      }
      notify(t('MSG_ALT_BULK_APPLY_SUCCESS', [t('MSG_TXT_FAX_LOCARA_TNO')])); // {팩스지역전화번호} 항목이 일괄변경 되었습니다.
    }
    if (field === 11) {
      const spectxGrpNo = grid.getValue(index, 0);
      const faxExno = grid.getValue(index, 11);
      const rows = gridUtil.filter(view, (e) => e.spectxGrpNo === spectxGrpNo); // 같은 그룹번호 로우 찾기
      for (let i = 0; i < rows.length - 1; i += 1) {
        grid.commit();
        const row = gridUtil.findDataRow(view, (e) => (e.spectxGrpNo === spectxGrpNo)
          && (e.faxExno !== faxExno)); // 같은 그룹번호의 이메일, 팩스번호 동일하게 셋팅
        data.setValue(row, 'faxExno', faxExno);
      }
      notify(t('MSG_ALT_BULK_APPLY_SUCCESS', [t('MSG_TXT_FAX_MEXNO')])); // {팩스전화국번호} 항목이 일괄변경 되었습니다.
    }
    if (field === 12) {
      const spectxGrpNo = grid.getValue(index, 0);
      const faxIdvTno = grid.getValue(index, 12);
      const rows = gridUtil.filter(view, (e) => e.spectxGrpNo === spectxGrpNo); // 같은 그룹번호 로우 찾기
      for (let i = 0; i < rows.length - 1; i += 1) {
        grid.commit();
        const row = gridUtil.findDataRow(view, (e) => (e.spectxGrpNo === spectxGrpNo)
          && (e.faxIdvTno !== faxIdvTno)); // 같은 그룹번호의 이메일, 팩스번호 동일하게 셋팅
        data.setValue(row, 'faxIdvTno', faxIdvTno);
      }
      notify(t('MSG_ALT_BULK_APPLY_SUCCESS', [t('MSG_TXT_FAX_IDV_TNO')])); // {팩스개별전화번호} 항목이 일괄변경 되었습니다.
    }
  };
  view.onCellClicked = async (g, { column }) => {
    if (column === 'faxLocaraTno' || column === 'faxExno' || column === 'faxIdvTno' || column === 'emadr') {
      alert(t('MSG_ALT_SAME_COLLECTIVE_CHG', [t('MSG_TXT_GRP_NO')]));
    }
  };
});
</script>
<style>
</style>
