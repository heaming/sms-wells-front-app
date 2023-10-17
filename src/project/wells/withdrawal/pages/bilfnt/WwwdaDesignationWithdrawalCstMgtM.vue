<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDA
2. 프로그램 ID : WwwdaDesignationWithdrawalCstMgtM - 자동이체 지정 출금 고객 관리 (W-WD-U-0085M01)
3. 작성자 : donghyun.yoo
4. 작성일 : 2023.01.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
[W-WD-U0006] 요청한 금액으로 이체청구. 한번, 매회 선택가능. 이체, 중단 선택가능
공통
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
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            rules="required"
            :name="$t('MSG_TXT_BASE_YM')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_TASK_TYPE')"
        >
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="codes.BND_CLCTN_SELL_TP_CD.filter(({codeId}) => codeId !== '4' && codeId !== '7')"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
        >
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            :name="$t('MSG_TXT_CNTR_DTL_NO')"
          />
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
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>

        <kw-btn
          v-permission:delete
          grid-action
          :label="$t('MSG_TXT_DEL')"
          @click="onClickRemove"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:create
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAddRow"
        />
        <kw-btn
          v-permission:create
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
          v-permission:download
          icon="download_on"
          dense
          secondary
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize - 1"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useGlobal, useDataService, codeUtil, gridUtil, defineGrid, getComponentType, useMeta, modal } from 'kw-lib';
// eslint-disable-next-line no-unused-vars
import { cloneDeep, isEmpty } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import dayjs from 'dayjs';

const { notify } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();

const { currentRoute } = useRouter();
const { getConfig } = useMeta();

const { getters } = useStore();
const userInfo = getters['meta/getUserInfo'];
// eslint-disable-next-line no-unused-vars
const { tenantCd } = userInfo;
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'BND_CLCTN_SELL_TP_CD', // 채권추심판매유형코드
  'DSN_WDRW_FNT_PRD_CD', // 1 : 지정일자 / 2 : 매회 추후에 수정
  'AUTO_FNT_FTD_ACD', // 자동 이체 이체일 앱코드 추후에 수정
  'DSN_WDRW_FNT_DV_CD',
);

let cachedParams;
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  sellTpCd: 'ALL',
  cntrNo: '',
  cntrSn: '',
});

// const possibleDay = codes.AUTO_FNT_FTD_ACD.map((v) => v.codeId).join(','); // 가능한 이체일 추후에 수정

async function onClickAddRow() {
  const view = grdMainRef.value.getView();
  const dataRows = gridUtil.getChangedRowValues(view);
  gridUtil.insertRowAndFocus(view, dataRows.length === 0 ? 0 : 1, {
    fntYn: '1',
    dsnWdrwFntPrdCd: '1',
  });

  window.scrollTo(0, 0);
}

function getSaveParams() {
  const view = grdMainRef.value.getView();

  const changedRows = gridUtil.getChangedRowValues(view);
  return changedRows.map((v) => ({ ...v,
    ucAmt: v.dsnWdrwAmt - v.dpAmt,
  }));
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/designation-wdrw-csts', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: person, pageInfo: pageResult } = res.data;

  person.forEach((v) => {
    v.cntr = `${v.cntrNo}-${v.cntrSn}`;
  });
  // const person = res.data.list.map((v) => ({ ...v, cntr: v.cntr.replace(tenantCd, '') }));
  // const pageResult = res.data.pageInfo;
  pageInfo.value = pageResult;

  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(person);
  dataSource.checkRowStates(true);
}

async function onClickSearch() {
  // if (isEmpty(searchParams.value.cntr)) return;
  grdMainRef.value.getData().clearRows();

  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickRemove() {
  const view = grdMainRef.value.getView();
  // const checkedRows = gridUtil.getCheckedRowValues(view);
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (!deletedRows.length > 0) {
    return;
  }
  const data = deletedRows.filter((v) => v.rowState === 'none').map((v) => ({
    cntr: v.cntr,
    cntrNo: v.cntrNo,
    cntrSn: v.cntrSn,
    fntYm: v.fntYm,
  }));

  if (deletedRows.every((v) => v.rowState !== 'none')) {
    // 추가 확인 필요.
    // if (!await confirm(t('MSG_ALT_WANT_DEL'))) { return; }
    // await dataService.delete('/sms/wells/withdrawal/bilfnt/designation-wdrw-csts', { data });
    // await onClickSearch();
    gridUtil.deleteCheckedRows(view);
    return;
  }
  await dataService.delete('/sms/wells/withdrawal/bilfnt/designation-wdrw-csts', { data });
  notify(t('MSG_ALT_DELETED'));
  await onClickSearch();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const arr = gridUtil.getChangedRowValues(view);
  if (arr.some((v) => v.dsnWdrwAmt < 0)) {
    notify(t('MSG_ALT_AMT_MINUS_ERR')); // 금액을 -로 지정할 수 없습니다.
    return;
  }

  const data = getSaveParams();
  await dataService.post('/sms/wells/withdrawal/bilfnt/designation-wdrw-csts', data);
  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

async function onClickExcelDownload() {
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/designation-wdrw-csts/excel-download', { params: cachedParams });
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

//-------------------------------------------------------------------------------------------------
// Initialize Grid
//-------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntr' }, // 계약번호
    { fieldName: 'cntrNo' }, // 계약상세번호
    { fieldName: 'cntrSn' }, // 계약상세 일련번호
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'sellTpCd' }, // 업무유형
    { fieldName: 'dsnWdrwAmt', dataType: 'number' }, // 지정금액
    { fieldName: 'fntYm' }, // 이체년월
    { fieldName: 'dsnWdrwFntD' }, // 이체일자
    { fieldName: 'fntYn' }, // 이체구분
    { fieldName: 'dpAmt', dataType: 'number' }, // 입금금액
    { fieldName: 'ucAmt', dataType: 'number' }, // 잔액
    { fieldName: 'dsnWdrwFntPrdCd' }, // 이체주기
    { fieldName: 'prtnrKnm' }, // 등록담당자
    { fieldName: 'fstRgstUsrId' }, // 등록자번호
    { fieldName: 'fstRgstDtm' }, // 등록일시
  ];

  const columns = [
    { fieldName: 'cntr',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '120',
      button: 'action',
      styleName: 'text-center rg-button-icon--search',
      // editor: {
      //   type: 'number',
      // },
      rules: 'required',
      editor: {
        maxLength: 20,
      },
      styleCallback: (grid, dataCell) => {
        const { rowState } = gridUtil.getRowValue(grid, dataCell.index.itemIndex);

        if (rowState !== 'created') {
          return { styleName: 'rg-button-hide' };
        }
      },
      // eslint-disable-next-line no-unused-vars
      // displayCallback(grid, index, value) {
      //   // eslint-disable-next-line no-unused-vars
      //   const { cntrNo, cntrSn, rowState } = gridUtil.getRowValue(grid, index.itemIndex);
      //   // if (rowState !== 'created') {
      //   //   return `${cntrNo}-${cntrSn}`;
      //   // }
      //   // return value;
      //   return `${cntrNo}-${cntrSn}`;
      // },
    },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_TASK_TYPE'), width: '80', styleName: 'text-center', editable: false, options: codes.BND_CLCTN_SELL_TP_CD },
    { fieldName: 'dsnWdrwAmt',
      header: t('MSG_TXT_DSN_AMT'),
      width: '120',
      styleName: 'text-right',
      editor: {
        type: 'number',
        maxLength: 9,
      },
      numberFormat: '#,##0',
      rules: 'required',
    },
    { fieldName: 'fntYm',
      header: t('MSG_TXT_FNT_YM'),
      width: '120',
      styleName: 'text-center',
      datetimeFormat: 'yyyy-MM',
      editor: {
        type: 'btdate',
        btOptions: {
          minViewMode: 1,
        },
        datetimeFormat: 'yyyy-MM',
        mask: {
          placeHolder: '선택',
        },
      },
      rules: 'required',
    },
    { fieldName: 'dsnWdrwFntD',
      header: t('MSG_TXT_FTD'),
      options: codes.AUTO_FNT_FTD_ACD,
      width: '120',
      styleName: 'text-center',
      editor: {
        type: 'dropdown',
        maxLength: 2,
      },
      numberFormat: '#,##0',
      rules: 'required',
    },
    { fieldName: 'fntYn',
      header: t('MSG_TXT_FNT_DV'),
      width: '80',
      styleName: 'text-center',
      editor: { type: 'list' },
      rules: 'required',

      options: codes.DSN_WDRW_FNT_DV_CD,
    },
    // { fieldName: 'dpAmt',
    //   header: t('MSG_TXT_DP_AMT'),
    //   width: '120',
    //   styleName: 'text-right',
    //   editor: {
    //     type: 'number',

    //   },
    //   numberFormat: '#,##0',
    //   editable: false,
    // },
    // 잔액
    { fieldName: 'ucAmt',
      label: t('MSG_TXT_BLAM'),
      header: t('MSG_TXT_BLAM'),
      width: '120',
      styleName: 'text-right',
      editable: false,
      numberFormat: '#,##0',
      // eslint-disable-next-line no-unused-vars
      // displayCallback(grid, index, value) {
      //   // const dsnWdrwAmt = gridUtil.getCellValue(grid, index.itemIndex, 'dsnWdrwAmt');
      //   // const dpAmt = gridUtil.getCellValue(grid, index.itemIndex, 'dpAmt');
      //   const dsnWdrwAmt = gridUtil.getCellValue(grid, index.dataRow, 'dsnWdrwAmt');
      //   const dpAmt = gridUtil.getCellValue(grid, index.dataRow, 'dpAmt');

      //   return dsnWdrwAmt - dpAmt;
      // },
    },
    // { fieldName: 'dsnWdrwFntPrdCd',
    //   header: t('MSG_TXT_FNT_PRD'),
    //   width: '80',
    //   styleName: 'text-center',
    //   editor: { type: 'list' },
    //   options: codes.DSN_WDRW_FNT_PRD_CD,
    //   rules: 'required',
    // },

    { fieldName: 'prtnrKnm', header: t('MSG_TXT_RGST_PSIC'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_RGST_NO'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DTM'), width: '155', styleName: 'text-center', editable: false, datetimeFormat: 'datetime' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  view.editOptions.editable = true;

  // multi row header setting

  view.onCellEditable = (grid, { itemIndex, column }) => {
    const nowDay = now.format('DD');
    const dsnWdrwFntD = grid.getValue(itemIndex, 'dsnWdrwFntD');
    if ((!gridUtil.isCreatedRow(grid, itemIndex) && ['cntr', 'fntYm'].includes(column))
     || (!isEmpty(dsnWdrwFntD) && nowDay >= dsnWdrwFntD.substring(0, 2) && ['dsnWdrwFntD', 'dsnWdrwAmt', 'fntYn'].includes(column))) {
      return false;
    }
  };

  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      await fetchData();
    }
  };
  // eslint-disable-next-line no-unused-vars
  view.onCellButtonClicked = async (g, { column, dataRow }) => {
    if (column === 'cntr') {
      const { cntr } = gridUtil.getRowValue(g, dataRow);

      const cntrNoSn = !isEmpty(cntr) ? cntr.replaceAll('-', '') : '';
      const { result, payload } = await modal({
        component: 'WwctaContractNumberListP',
        componentProps: { cntrNo: cntrNoSn?.slice(0, 12), cntrSn: cntrNoSn?.slice(12) },
      });
      if (result) {
        const { cntrNo: resCntrNo, cntrSn: resCntrSn, cntrCstKnm: cstKnm, sellTpCd } = payload;
        data.setValue(dataRow, 'cntrNo', resCntrNo);
        data.setValue(dataRow, 'cntrSn', resCntrSn);
        data.setValue(dataRow, 'cntr', `${resCntrNo}-${resCntrSn}`);
        data.setValue(dataRow, 'cstKnm', cstKnm);
        data.setValue(dataRow, 'sellTpCd', sellTpCd);
      }
    }
  };
  // eslint-disable-next-line no-unused-vars
  view.onEditRowChanged = async (grid, itemIndex, dataRow, field, oldValue, newValue) => {
    grid.commit();
    if (field === 'cntr' && !isEmpty(oldValue)) {
      data.setValue(dataRow, 'cntrNo', '');
      data.setValue(dataRow, 'cntrSn', '');
      data.setValue(dataRow, 'cntr', newValue);
      data.setValue(dataRow, 'cstKnm', '');
      data.setValue(dataRow, 'sellTpCd', '');
    }
  };

  // view.onCellClicked = (grid, clickData) => {
  //   if (clickData.cellType === 'data') {
  //     grid.checkItem(clickData.itemIndex, !grid.isCheckedItem(clickData.itemIndex));
  //   }
  // };
});

</script>

<style>
.kw-search-style .kw-search__action {
  display: none;
}

.rg-button-hide .rg-button-action {
  display: none !important;
}
</style>
