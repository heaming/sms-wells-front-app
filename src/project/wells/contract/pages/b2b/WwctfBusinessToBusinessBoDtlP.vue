<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctfBusinessToBusinessBoDtlP - B2B BO관리 상세내역(팝업)
3. 작성자 : JSY
4. 작성일 : 2023.05.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- B2B BO관리 상세내역(팝업)
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--2xl"
    :title="$t('MSG_TXT_DTL_IZ')"
  >
    <kw-action-top>
      <kw-btn
        v-permission:delete
        grid-action
        :label="$t('MSG_BTN_DEL')"
        @click="onClickDelete"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <!-- 행추가 -->
      <kw-btn
        grid-action
        :label="$t('MSG_BTN_ROW_ADD')"
        @click="onClickAdd"
      />
      <!-- 저장 -->
      <kw-btn
        grid-action
        :label="$t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        icon="download_on"
        :disable="pageInfo.totalCount === 0"
        dense
        secondary
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdBusinessToBusinessBoLDetailist"
      name="grdBusinessToBusinessBoLDetailist"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initBusinessToBusinessBoDetailList"
    />
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useDataService, useMeta, useGlobal } from 'kw-lib';
import pdConst from '~sms-common/product/constants/pdConst';
import { isEmpty } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const { modal, notify } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdBusinessToBusinessBoLDetailist = ref(getComponentType('KwGrid'));

const props = defineProps({
  opptId: { type: String, default: '' }, // 부모창에서 넘어온 기회ID
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/business-to-business/business-opportunities/details', { params: { opptId: props.opptId } });
  const view = grdBusinessToBusinessBoLDetailist.value.getView();
  for (let i = 0; i < res.data.length; i += 1) {
    res.data[i].basePdCdCheck = res.data[i].basePdCd;
  }
  const dataSource = view.getDataSource();
  dataSource.setRows(res.data);
  pageInfo.value.totalCount = view.getItemCount();

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}
async function onClickSearch() {
  await fetchData();
}

async function onClickSave() {
  const view = grdBusinessToBusinessBoLDetailist.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  for (let i = 0; i < changedRows.length; i += 1) {
    if (changedRows[i].basePdCd !== changedRows[i].basePdCdCheck) {
      notify(t('MSG_ALT_BE_CHECK_IT', [t('MSG_TXT_PRDT_CODE')]));
      return;
    }
  }
  await dataService.post('/sms/wells/contract/business-to-business/business-opportunities/details', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

async function onClickDelete() {
  const view = grdBusinessToBusinessBoLDetailist.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length) {
    await dataService.delete('/sms/wells/contract/business-to-business/business-opportunities/details', { data: deletedRows });
    notify(t('MSG_ALT_DELETED'));
    await onClickSearch();
  }
}
async function onClickAdd() {
  const view = grdBusinessToBusinessBoLDetailist.value.getView();
  const row = view.getCurrent().dataRow < 0 ? '0' : view.getCurrent().dataRow;
  await gridUtil.insertRowAndFocus(view, row, { opptId: props.opptId });
}

async function onClickExcelDownload() {
  const view = grdBusinessToBusinessBoLDetailist.value.getView();
  const res = await dataService.get('/sms/wells/contract/business-to-business/business-opportunities/details', { params: { opptId: props.opptId } });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
  await fetchData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initBusinessToBusinessBoDetailList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'opptId' },
    { fieldName: 'opptSn' },
    { fieldName: 'pdClsfNm' },
    { fieldName: 'pdNm' },
    { fieldName: 'basePdCd' },
    { fieldName: 'basePdCdCheck' },
    { fieldName: 'pdQty', dataType: 'number' },
    { fieldName: 'fnlAmt', dataType: 'number' },
    { fieldName: 'stplPtrm', dataType: 'number' },
    { fieldName: 'unuitmCn' },
  ];
  const columns = [
    { fieldName: 'opptId', header: t('MSG_TXT_UNIQUE_NUM'), width: '160', styleName: 'text-center', editable: false }, // 고유번호
    { fieldName: 'opptSn', visible: false },
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PDGRP'), width: '160', styleName: 'text-center', editable: false }, // 상품군
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '280', styleName: 'text-center', editable: false }, // 상품명
    { fieldName: 'basePdCd',
      header: t('MSG_TXT_PRDT_CODE'),
      width: '132',
      styleName: 'text-center rg-button-icon--search',
      button: 'action',
      rules: 'required',
      editor: {
        maxLength: 10,
      } }, // 상품코드
    { fieldName: 'pdQty',
      header: t('MSG_TXT_QTY'),
      width: '134',
      styleName: 'text-right',
      numberFormat: '#,##0',
      editor: {
        type: 'number',
        editFormat: '#,##0',
        maxLength: 12,
      } }, // 수량
    { fieldName: 'fnlAmt',
      header: `${t('MSG_TXT_BID')}${t('MSG_TXT_PRICE')}`,
      width: '160',
      styleName: 'text-right',
      numberFormat: '#,##0',
      editor: {
        type: 'number',
        editFormat: '#,##0',
        maxLength: 15,
      } }, // 입찰가격
    { fieldName: 'stplPtrm',
      header: t('MSG_TXT_CONTRACT_PERI'),
      width: '160',
      styleName: 'text-right',
      numberFormat: '#,##0',
      editor: {
        type: 'number',
        editFormat: '#,##0',
        maxLength: 10,
      } }, // 약정기간
    { fieldName: 'unuitmCn',
      header: t('MSG_TXT_UNUITM'),
      width: '376',
      editor: {
        maxLength: 2000,
      } }, // 특이사항
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  view.editOptions.editable = true;

  view.onCellButtonClicked = async (g, { itemIndex }) => {
    const updateRow = view.getCurrent().dataRow;
    const searchPopupParams = {
      searchType: pdConst.PD_SEARCH_CODE,
      searchValue: g.getValues(itemIndex).basePdCd,
      selectType: '',
    };

    const returnPdInfo = await modal({
      component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
      componentProps: searchPopupParams,
    });

    if (returnPdInfo.result) {
      const pdClsfNm = returnPdInfo.payload?.[0].pdClsfNm.split('>');
      data.setValue(updateRow, 'basePdCd', isEmpty(returnPdInfo.payload?.[0].pdCd) ? '' : returnPdInfo.payload?.[0].pdCd);
      data.setValue(updateRow, 'basePdCdCheck', isEmpty(returnPdInfo.payload?.[0].pdCd) ? '' : returnPdInfo.payload?.[0].pdCd);
      data.setValue(updateRow, 'pdNm', isEmpty(returnPdInfo.payload?.[0].pdNm) ? '' : returnPdInfo.payload?.[0].pdNm);
      data.setValue(updateRow, 'pdClsfNm', !isEmpty(pdClsfNm[1]) ? pdClsfNm[1] : '');
    } else {
      data.setValue(updateRow, 'pdNm', '');
      data.setValue(updateRow, 'pdClsfNm', '');
    }
  };
  view.onCellEdited = async function cellEdited(grid, itemIndex, dataRow, fieldIndex) {
    const columnName = grid.getColumn(fieldIndex).fieldName;
    const updateRow = view.getCurrent().dataRow;
    if (columnName === 'basePdCd') {
      const searchPopupParams = {
        searchType: pdConst.PD_SEARCH_CODE,
        searchValue: grid.getValues(itemIndex).basePdCd,
        selectType: '',
      };

      const returnPdInfo = await modal({
        component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
        componentProps: searchPopupParams,
      });

      if (returnPdInfo.result) {
        const pdClsfNm = returnPdInfo.payload?.[0].pdClsfNm.split('>');
        data.setValue(updateRow, 'basePdCd', isEmpty(returnPdInfo.payload?.[0].pdCd) ? '' : returnPdInfo.payload?.[0].pdCd);
        data.setValue(updateRow, 'basePdCdCheck', isEmpty(returnPdInfo.payload?.[0].pdCd) ? '' : returnPdInfo.payload?.[0].pdCd);
        data.setValue(updateRow, 'pdNm', isEmpty(returnPdInfo.payload?.[0].pdNm) ? '' : returnPdInfo.payload?.[0].pdNm);
        data.setValue(updateRow, 'pdClsfNm', !isEmpty(pdClsfNm[1]) ? pdClsfNm[1] : '');
      } else {
        data.setValue(updateRow, 'pdNm', '');
        data.setValue(updateRow, 'pdClsfNm', '');
      }
    }
  };
});
</script>
