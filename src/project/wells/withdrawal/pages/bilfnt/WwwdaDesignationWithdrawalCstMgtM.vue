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
      one-row
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_TASK_TYPE')"
        >
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="codes.SELL_TP_CD"
            first-option="all"
            first-option-value="ALL"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
          required
        >
          <kw-input
            v-model="searchParams.cntr"
            :name="$t('MSG_TXT_CNTR_DTL_NO')"
            rules="required"
            type="number"
            maxlength="16"
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
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAddRow"
        />
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
          dense
          secondary
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :visible-rows="pageInfo.pageSize -1"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useGlobal, useDataService, codeUtil, gridUtil, defineGrid, getComponentType } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { notify, confirm } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();

const { getters } = useStore();
const userInfo = getters['meta/getUserInfo'];
const { tenantCd } = userInfo;

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'DSN_WDRW_FNT_PRD_CD', // 1 : 지정일자 / 2 : 매회 추후에 수정
  'AUTO_FNT_FTD_ACD', // 자동 이체 이체일 앱코드 추후에 수정
  'DSN_WDRW_FNT_DV_CD',
);

let cachedParams;
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
});

const searchParams = ref({
  sellTpCd: 'ALL',
  cntr: '',
  cntrNo: '',
  cntrSn: '',
});

const possibleDay = codes.AUTO_FNT_FTD_ACD.map((v) => v.codeId).join(','); // 가능한 이체일 추후에 수정

async function onClickAddRow() {
  const view = grdMainRef.value.getView();
  const dataRows = gridUtil.getChangedRowValues(view);
  gridUtil.insertRowAndFocus(view, dataRows.length === 0 ? 0 : 1, {
    fntYn: '1',
    dsnWdrwFntPrdCd: '1',
  });
}

function getSaveParams() {
  const view = grdMainRef.value.getView();

  const changedRows = gridUtil.getChangedRowValues(view);

  return changedRows.map((v) => ({ ...v,
    dpAmt: isEmpty(v.dpAmt) ? 0 : Number(v.dpAmt),
    cntrNo: tenantCd + v.cntr.slice(0, 11), //   계약상세 4 - 7 - 1
    cntrSn: Number(v.cntr.slice(11)) })); // 계약상세일련번호 4 - 7 - 1
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/designation-wdrw-csts', { params: { ...cachedParams, ...pageInfo.value } });
  // const { list: person, pageInfo: pageResult } = res.data;

  const person = res.data.list.map((v) => ({ ...v, cntr: v.cntr.replace(tenantCd, '') }));
  const pageResult = res.data.pageInfo;
  pageInfo.value = pageResult;

  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(person);
  dataSource.checkRowStates(true);
}

async function onClickSearch() {
  grdMainRef.value.getData().clearRows();

  pageInfo.value.pageIndex = 1;
  searchParams.value.cntrNo = tenantCd + searchParams.value.cntr.slice(0, 11);
  searchParams.value.cntrSn = searchParams.value.cntr.slice(11);
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickRemove() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  const data = checkedRows.filter((v) => v.rowState === 'none').map((v) => ({
    cntrNo: tenantCd + v.cntr.slice(0, 11),
    cntrSn: Number(v.cntr.slice(11)),
    dsnWdrwFntD: v.dsnWdrwFntD,
  }));
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  if (checkedRows.every((v) => v.rowState !== 'none')) {
    gridUtil.deleteCheckedRows(view);
    return;
  }

  if (await confirm(t('MSG_ALT_WANT_DEL'))) {
    await dataService.delete('/sms/wells/withdrawal/bilfnt/designation-wdrw-csts', { data });
    await onClickSearch();
  }
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const data = getSaveParams();
  await dataService.post('/sms/wells/withdrawal/bilfnt/designation-wdrw-csts', data);
  notify(t('MSG_ALT_SAVE_DATA'));

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: '자동이체 지정 출금 고객',
    timePostfix: true,
  });
}

//-------------------------------------------------------------------------------------------------
// Initialize Grid
//-------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntr' }, // 계약번호
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'sellTpCd' }, // 업무유형
    { fieldName: 'dsnWdrwAmt' }, // 지정금액
    { fieldName: 'dsnWdrwFntD' }, // 이체일자
    { fieldName: 'fntYn' }, // 이체구분
    { fieldName: 'dpAmt' }, // 입금금액
    { fieldName: 'ucAmt' }, // 잔액
    { fieldName: 'dsnWdrwFntPrdCd' }, // 이체주기
    { fieldName: 'prtnrKnm' }, // 등록담당자
    { fieldName: 'fnlMdfcUsrId' }, // 등록자사번
    { fieldName: 'fnlMdfcDtm' }, // 등록자일번
  ];

  const columns = [
    { fieldName: 'cntr',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '120',
      styleName: 'text-center',
      editor: {
        type: 'number',
      },
      rules: 'required||digits:12',

    },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'sellTpCd', header: t('MSG_TXT_TASK_TYPE'), width: '80', styleName: 'text-center', editable: false, options: codes.SELL_TP_CD },
    { fieldName: 'dsnWdrwAmt',
      header: t('MSG_TXT_DSN_AMT'),
      width: '120',
      styleName: 'text-right',
      editor: {
        type: 'number',
      },
      rules: 'required',
    },
    { fieldName: 'dsnWdrwFntD',
      header: t('MSG_TXT_FNT_DT'),
      width: '120',
      styleName: 'text-center',
      editor: {
        type: 'number',
        maxLength: 2,
      },
      rules: `required||one_of:${possibleDay}`, // 정규일이 바뀔수도 있기 때문에 추후에 수정
      customMessages: { one_of: t('MSG_ALT_FTD_CHECK', [possibleDay]) },

    },
    { fieldName: 'fntYn',
      header: t('MSG_TXT_FNT_DV'),
      width: '80',
      styleName: 'text-center',
      editor: { type: 'list' },
      rules: 'required',

      options: codes.DSN_WDRW_FNT_DV_CD, // 추후에 수정 코드 못찾음
      // options: [{ codeId: 'Y', codeName: '이체' }, { codeId: 'N', codeName: '중단' }], // 추후에 수정 코드 못찾음
    },
    { fieldName: 'dpAmt',
      header: t('MSG_TXT_DP_AMT'),
      width: '120',
      styleName: 'text-right',
      editor: {
        type: 'number',
      },
      rules: 'required',
    },
    { fieldName: 'ucAmt',
      header: t('MSG_TXT_BLAM'),
      width: '120',
      styleName: 'text-right',
      editable: false,
      // eslint-disable-next-line no-unused-vars
      displayCallback(grid, index, value) {
        const dsnWdrwAmt = gridUtil.getCellValue(grid, index.itemIndex, 'dsnWdrwAmt');
        const dpAmt = gridUtil.getCellValue(grid, index.itemIndex, 'dpAmt');
        return dsnWdrwAmt - dpAmt;
      },
    },
    { fieldName: 'dsnWdrwFntPrdCd',
      header: t('MSG_TXT_FNT_PRD'),
      width: '80',
      styleName: 'text-center',
      editor: { type: 'list' },
      options: codes.DSN_WDRW_FNT_PRD_CD,
      rules: 'required',

    },

    { fieldName: 'prtnrKnm', header: t('MSG_TXT_RGST_PSIC'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_RGR_EMPNO'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FST_RGST_DT'), width: '155', styleName: 'text-center', editable: false, datetimeFormat: 'datetime' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  view.editOptions.editable = true;

  // multi row header setting

  view.onCellEditable = (grid, index) => {
    if (!gridUtil.isCreatedRow(grid, index.dataRow) && index.column === 'cntr') {
      return false;
    }
  };

  view.onEditCommit = async (grid, index, oldValue, newValue) => {
    let canEdit = true;
    // const { dsnWdrwAmt, dpAmt } = gridUtil.getRowValue(grid, index.dataRow);
    const dsnWdrwAmt = gridUtil.getCellValue(grid, index.itemIndex, 'dsnWdrwAmt');
    const dpAmt = gridUtil.getCellValue(grid, index.itemIndex, 'dpAmt');
    if (index.column === 'dpAmt') {
      if (dsnWdrwAmt < newValue) {
        notify(t('MSG_ALT_DP_DSN_AMT_CMPR'));
        canEdit = false;
        // grid.setValue(index.itemIndex, 'dpAmt', oldValue ? 0 : oldValue);
      }
    }
    if (index.column === 'dsnWdrwAmt') {
      if (newValue < dpAmt) {
        notify(t('MSG_ALT_DSN_DP_AMT_CMPR'));
        canEdit = false;
        // grid.setValue(index.itemIndex, 'dsnWdrwAmt', oldValue);
      }
    }

    if (!canEdit) view.cancel();
  };

  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      await fetchData();
    }
  };
  view.onCellClicked = (grid, clickData) => {
    if (clickData.cellType === 'data') {
      grid.checkItem(clickData.itemIndex, !grid.isCheckedItem(clickData.itemIndex));
    }
  };
});

</script>

<style scoped>
</style>
