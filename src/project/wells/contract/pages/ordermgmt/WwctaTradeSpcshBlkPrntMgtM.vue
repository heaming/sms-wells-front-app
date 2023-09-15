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
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
          />
        </kw-search-item>
        <!-- 그룹번호 -->
        <kw-search-item :label="$t('MSG_TXT_GRP_NO')">
          <kw-input
            v-model="searchParams.grpStartNo"
            mask="#####"
            maxlength="5"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.grpEndNo"
            mask="#####"
            maxlength="5"
          />
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
        <!-- 삭제 -->
        <kw-btn
          v-permission:delete
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
          v-permission:create
          :label="t('MSG_BTN_ROW_ADD')"
          grid-action
          @click="onClickAdd"
        />
        <!-- 저장 -->
        <kw-btn
          v-permission:update
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
          v-permission:download
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
import { cloneDeep, isEmpty, trim } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import { getPhoneNumber } from '~sms-common/organization/utils/ogUtil';

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
function validateEmail(strEmail) {
  const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(strEmail);
}
async function onClickSave() {
  const view = grdTradeSpcshBlkPrntList.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  for (let i = 0; i < changedRows.length; i += 1) {
    if (isEmpty(changedRows[i].cntrNo)) {
      alert(t('MSG_ALT_CHK_CONFIRM', [t('MSG_TXT_CNTR_DTL_NO')]));
      return;
    }
    if (!isEmpty(changedRows[i].emadr)) {
      if (!validateEmail(changedRows[i].emadr)) {
        alert(t('MSG_ALT_EMAIL'));
        return;
      }
    }
    // 팩스번호 세팅
    if (!isEmpty(changedRows[i].faxTelNo)) {
      const tel = changedRows[i].faxTelNo.replaceAll('-', '');
      changedRows[i].faxLocaraTno = getPhoneNumber(tel, 1);
      changedRows[i].faxExno = getPhoneNumber(tel, 2);
      changedRows[i].faxIdvTno = getPhoneNumber(tel, 3);
    } else {
      changedRows[i].faxLocaraTno = '';
      changedRows[i].faxExno = '';
      changedRows[i].faxIdvTno = '';
    }

    const row = gridUtil.findDataRow(view, (e) => (e.spectxGrpNo === changedRows[i].spectxGrpNo)
    && (e.cntrDtlNo === changedRows[i].cntrDtlNo));
    if (row !== changedRows[i].dataRow) {
      notify(t('MSG_ALT_DUP_NCELL', [t('MSG_TXT_CNTR_DTL_NO')]));
      return;
    }
  }
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

  if (deletedRows.length > 0) {
    await dataService.delete('sms/wells/contract/contracts/trade-specification-sheets', { data: deletedRows });
    await fetchData();
    notify(t('MSG_ALT_DELETED'));
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
    { fieldName: 'emadrEncr' }, // 이메일 마스킹
    { fieldName: 'faxTelNo' }, // 팩스지역전화번호
    { fieldName: 'faxLocaraTno' }, // 팩스지역전화번호
    { fieldName: 'faxExno' }, // 팩스전화국번호
    { fieldName: 'faxIdvTno' }, // 팩스개별전화번호
    { fieldName: 'fstRgstUsrId' }, // 최초등록사용자ID
    { fieldName: 'epNo' }, //
    { fieldName: 'fstRgstD' }, // 등록일
    { fieldName: 'fstRgstDtm' }, // 등록일시
    { fieldName: 'lstmmYn' }, // 전월여부
    { fieldName: 'cstNo' }, // 고객번호
    { fieldName: 'emadr' }, // 이메일
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
      styleName: 'text-center rg-button-icon--search',
      button: 'action',
      rules: 'required',
      editor: { maxLength: 17 },
      styleCallback(grid, dataCell) {
        return { editable: dataCell.item.rowState === 'created' };
      },
      buttonVisibleCallback(g, index) {
        return g.getDataSource().getRowState(index.dataRow) === 'created';
      },
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
    { fieldName: 'emadr', visible: false },
    { fieldName: 'emadrEncr',
      header: t('MSG_TXT_EMAIL'),
      width: '220',
      styleName: 'text-left',
      editor: {
        maxLength: 200,
      } }, // 이메일
    { fieldName: 'faxTelNo',
      header: t('MSG_TXT_FAX_TNO'),
      width: '150',
      styleName: 'text-center',
      editor: { type: 'telephone' },
    },
    { fieldName: 'faxLocaraTno', header: t('MSG_TXT_FAX_LOCARA_TNO'), width: '220', visible: false }, // 팩스지역전화번호
    { fieldName: 'faxExno', header: t('MSG_TXT_FAX_MEXNO'), width: '220', visible: false }, // 팩스전화국번호
    { fieldName: 'faxIdvTno', header: t('MSG_TXT_FAX_IDV_TNO'), width: '220', visible: false }, // 팩스개별전화번호
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_RGR_EP_NO'), width: '100', styleName: 'text-center', editable: false }, // 등록자 사번
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT'), width: '106', styleName: 'text-center', editable: false, datetimeFormat: 'date' }, // 등록일
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
        const paramCntrNo = String(cntrDtlNo).split('-')[0];
        const paramCntrSn = String(cntrDtlNo).split('-')[1];
        const { payload, result } = await modal({
          component: 'WwctaContractNumberListP',
          componentProps: {
            cntrNo: paramCntrNo, cntrSn: paramCntrSn,
          },
        });
        if (result) {
          const { cntrNo, cntrSn } = payload;
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
          data.setValue(dataRow, 'emadrEncr', '');
          if ((!isEmpty(res.data))) {
            data.setValue(dataRow, 'sellTpCd', res.data.sellTpCd);
            data.setValue(dataRow, 'cstNm', res.data.cstKnm);
            data.setValue(dataRow, 'cstNo', res.data.cstNo);
            data.setValue(dataRow, 'cntrNo', cntrNo);
            data.setValue(dataRow, 'cntrSn', cntrSn);
            data.setValue(dataRow, 'cntrDtlNo', `${cntrNo}-${cntrSn}`);
            for (let i = 0; i < rows.length; i += 1) {
              const row = gridUtil.findDataRow(view, (e) => e.spectxGrpNo === spectxGrpNo
              && (e.emadrEncr !== res.data.emadrEncr)); // 같은 그룹번호의 이메일, 팩스번호 동일하게 셋팅
              data.setValue(row, 'emadrEncr', trim(res.data.emadrEncr));
              data.setValue(row, 'emadr', trim(res.data.emadrEncr));
            }
          }
        } else {
          data.setValue(dataRow, 'cntrNo', '');
          data.setValue(dataRow, 'cntrSn', '');
          data.setValue(dataRow, 'sellTpCd', '');
          data.setValue(dataRow, 'cstNm', '');
          data.setValue(dataRow, 'cstNo', '');
        }
      }
      notify(t('MSG_ALT_BULK_APPLY_SUCCESS', [t('MSG_TXT_EMAIL')])); // {이메일} 항목이 일괄변경 되었습니다.
    }
    if (field === 9) {
      const spectxGrpNo = grid.getValue(index, 0);
      const emadr = grid.getValue(index, 9);
      view.commit();
      data.setValue(index, 'emadr', emadr);
      const rows = gridUtil.filter(view, (e) => e.spectxGrpNo === spectxGrpNo); // 같은 그룹번호 로우 찾기
      for (let i = 0; i < rows.length - 1; i += 1) {
        grid.commit();
        const row = gridUtil.findDataRow(view, (e) => e.spectxGrpNo === spectxGrpNo
          && (e.emadrEncr !== emadr)); // 같은 그룹번호의 이메일, 팩스번호 동일하게 셋팅
        data.setValue(row, 'emadr', emadr);
        data.setValue(row, 'emadrEncr', emadr);
      }
      notify(t('MSG_ALT_BULK_APPLY_SUCCESS', [t('MSG_TXT_EMAIL')])); // {이메일} 항목이 일괄변경 되었습니다.
    }
    if (field === 10) {
      const spectxGrpNo = grid.getValue(index, 0);
      const faxTelNo = grid.getValue(index, 10);
      const rows = gridUtil.filter(view, (e) => e.spectxGrpNo === spectxGrpNo); // 같은 그룹번호 로우 찾기
      for (let i = 0; i < rows.length - 1; i += 1) {
        grid.commit();
        const row = gridUtil.findDataRow(view, (e) => (e.spectxGrpNo === spectxGrpNo)
          && (e.faxTelNo !== faxTelNo)); // 같은 그룹번호의 이메일, 팩스번호 동일하게 셋팅
        data.setValue(row, 'faxTelNo', faxTelNo);
      }
      notify(t('MSG_ALT_BULK_APPLY_SUCCESS', [t('MSG_TXT_FAX_LOCARA_TNO')])); // {팩스지역전화번호} 항목이 일괄변경 되었습니다.
    }
  };
  view.onCellButtonClicked = async (g, { itemIndex }) => {
    const updateRow = view.getCurrent().dataRow;
    if (!isEmpty(data.getValue(updateRow, 15))) {
      notify(t('MSG_ALT_ACCESS_WHEN_REG_MODE'));
      return;
    }
    const { payload, result } = await modal({
      component: 'WwctaContractNumberListP',
      componentProps: {
        cntrNo: g.getValues(itemIndex).cntrNo, cntrSn: g.getValues(itemIndex).cntrSn,
      },
    });
    if (result) {
      const { cntrNo, cntrSn } = payload;
      const spectxGrpNo = view.getValue(updateRow, 0);
      const res = await dataService.get(`sms/wells/contract/contracts/trade-specification-sheets/${cntrSn}`, {
        params: {
          cntrNo,
          cntrSn,
        },
      });
      const rows = gridUtil.filter(view, (e) => e.spectxGrpNo === spectxGrpNo); // 같은 그룹번호 로우 찾기
      data.setValue(updateRow, 'sellTpCd', '');
      data.setValue(updateRow, 'cstNm', '');
      data.setValue(updateRow, 'emadr', '');
      data.setValue(updateRow, 'emadrEncr', '');
      if ((!isEmpty(res.data))) {
        data.setValue(updateRow, 'sellTpCd', res.data.sellTpCd);
        data.setValue(updateRow, 'cstNm', res.data.cstKnm);
        data.setValue(updateRow, 'cstNo', res.data.cstNo);
        data.setValue(updateRow, 'cntrNo', cntrNo);
        data.setValue(updateRow, 'cntrSn', cntrSn);
        data.setValue(updateRow, 'cntrDtlNo', `${cntrNo}-${cntrSn}`);
        for (let i = 0; i < rows.length; i += 1) {
          const row = gridUtil.findDataRow(view, (e) => e.spectxGrpNo === spectxGrpNo
              && (e.emadrEncr !== res.data.emadrEncr)); // 같은 그룹번호의 이메일, 팩스번호 동일하게 셋팅
          data.setValue(row, 'emadr', trim(res.data.emadrEncr));
          data.setValue(row, 'emadrEncr', trim(res.data.emadrEncr));
        }
      }
    } else {
      data.setValue(updateRow, 'cntrNo', '');
      data.setValue(updateRow, 'cntrSn', '');
      data.setValue(updateRow, 'sellTpCd', '');
      data.setValue(updateRow, 'cstNm', '');
      data.setValue(updateRow, 'cstNo', '');
    }
  };
});
</script>
<style>
</style>
