<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FED
2. 프로그램 ID : WwfedBsProcessingRateMgtM - BS처리율 조정관리
3. 작성자 : seoin.jeon
4. 작성일 : 2023.05.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- BS처리율 조정관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            :label="$t('MSG_TXT_PERF_YM')"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            icon="search"
            clearable
            :on-click-icon="onClickSearchNo"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top class="mb20">
        <template #left>
          <h3 class="kw-font-pt18">
            {{ $t("MSG_TXT_TRGT_INFO") }}
          </h3>
        </template>

        <kw-btn
          :label="$t('MSG_BTN_DEL')"
          grid-action
          @click="onClickDelete"
        />
        <kw-separator
          spaced
          vertical
          inset
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
          spaced
          vertical
          inset
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        @init="initGridMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useGlobal, useDataService } from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash-es';

const { modal, notify, alert } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);

const searchParams = ref({
  perfYm: dayjs().subtract(1, 'month').format('YYYYMM'),
  prtnrNo: '',
});

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/fee/bs-processing-rate', { params: searchParams.value });
  const resData = res.data;
  totalCount.value = resData.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(resData);
}

// 조회 버튼 클릭 이벤트
async function onClickSearch() {
  await fetchData();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

// 번호 검색 아이콘 클릭 이벤트
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      ogTpCd: 'W02',
      prtnrNo: searchParams.value.prtnrNo,
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.prtnrNo = payload.prtnrNo;
    }
  }
}

// 행추가
async function onClickAddRow() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, { prtnrNo: '' });
}

// 파트너의 BS처리율 조회
async function searchPartnerBs(prtnrNo) {
  const params = {
    perfYm: searchParams.value.perfYm,
    prtnrNo,
  };
  return await dataService.get('/sms/wells/fee/bs-processing-rate', { params });
}

// 삭제
async function onClickDelete() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRows.length > 0) {
    const deletedKeys = deletedRows.map((obj) => ({
      rowState: 'deleted',
      baseYm: obj.baseYm,
      ogTpCd: obj.ogTpCd,
      prtnrNo: obj.prtnrNo,
      sv01999909: obj.sv01999909,
      sv01999910: obj.sv01999910,
    }));
    await dataService.put('/sms/wells/fee/bs-processing-rate', deletedKeys);
    notify(t('MSG_ALT_DELETED'));
    await onClickSearch();
  }
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const changedRows = gridUtil.getChangedRowValues(view);
  if (changedRows.length > 0) {
    await dataService.put('/sms/wells/fee/bs-processing-rate', changedRows);
    notify(t('MSG_ALT_SAVE_DATA'));
    await onClickSearch();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'baseYm', header: t('MSG_TXT_BASE_YM'), width: '98', editable: false, visible: false },
    { fieldName: 'ogTpCd', header: t('MSG_TXT_OG_TP'), width: '98', editable: false, visible: false },
    { fieldName: 'prtnrNo',
      header: { text: t('MSG_TXT_SEQUENCE_NUMBER') },
      width: '133',
      editor: { type: 'text' },
      button: 'action',
      styleCallback(grid, dataCell) {
        const rowState = gridUtil.getRowState(grid, dataCell.index.dataRow);
        if (rowState === 'created') {
          return { rules: 'required', editable: true, styleName: 'text-left, rg-button-icon--search' };
        }
        return { editable: false, styleName: 'text-center' };
      },
      buttonVisibleCallback(grid, index) {
        return grid.getDataSource().getRowState(index.dataRow) === 'created';
      },
    },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '98', styleName: 'text-center', editable: false },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '127', styleName: 'text-center', editable: false },
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_RSB'), width: '151', styleName: 'text-center', editable: false },
    { fieldName: 'sv01999901', header: t('MSG_TXT_ASGN') + t('MSG_TXT_COUNT'), width: '98', styleName: 'text-right', editable: false },
    { fieldName: 'totSvCnt', header: t('MSG_TXT_FHS_CT'), width: '106', styleName: 'text-right', editable: false },
    { fieldName: 'sv01999909', header: `${t('MSG_TXT_PROCS_RT')}(%)`, width: '210', styleName: 'text-right', editable: false },
    { fieldName: 'sv01999910',
      header: `${t('MSG_TXT_PROCS_RT')}(%) ${t('MSG_TXT_MOD')}`,
      width: '98',
      styleName: 'text-right',
      editor: {
        type: 'number',
        maxLength: 22,
      },
      styleCallback(grid, dataCell) {
        // 값이 있으면 edit 가능, 아니면 불가
        const colData = gridUtil.getRowValue(grid, dataCell.index.dataRow);
        if (colData.sv01999910 !== undefined) {
          return { editable: true };
        }
        return { editable: false };
      },
    },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  // 파트너번호 팝업 검색시
  view.onCellButtonClicked = async (grid, { dataRow, column }) => {
    if (column === 'prtnrNo') {
      const { prtnrNo } = gridUtil.getRowValue(grid, dataRow);
      const { result, payload } = await modal({
        component: 'ZwogzPartnerListP',
        componentProps: {
          ogTpCd: 'W02',
          prtnrNo,
        },
      });

      if (result) {
        const response = await searchPartnerBs(payload.prtnrNo);
        const resData = response.data;
        if (resData.length < 1) {
          await alert(t('MSG_ALT_NO_INFO_SRCH'));
          return;
        }
        data.setValue(dataRow, 'prtnrNo', resData.prtnrNo);
        data.setValue(dataRow, 'ogCd', resData.ogCd);
        data.setValue(dataRow, 'prtnrKnm', resData.prtnrKnm);
        data.setValue(dataRow, 'rsbDvNm', resData.rsbDvNm);
        data.setValue(dataRow, 'sv01999901', resData.sv01999901);
        data.setValue(dataRow, 'totSvCnt', resData.totSvCnt);
        data.setValue(dataRow, 'sv01999909', resData.sv01999909);
        data.setValue(dataRow, 'sv01999910', resData.sv01999910);
      }
    }
  };

  // 수정처리율 소수점 절사(둘째자리)
  view.onCellEdited = async (grid, itemIndex) => {
    grid.commit(true);
    const { sv01999910: val1 } = grid.getValues(itemIndex);
    const truncVal = Math.floor(val1 * 100) / 100;
    data.setValue(itemIndex, 'sv01999910', truncVal);
  };

  // 행 추가 후 저장시 유효성 체크
  view.onValidate = async (grid, { itemIndex }) => {
    const { baseYm, ogTpcd } = await grid.getValues(itemIndex);
    if (!baseYm && !ogTpcd) {
      return t('MSG_ALT_NCELL_REQUIRED_VAL', [t('MSG_TXT_SEQUENCE_NUMBER')]);
    }
  };
});
</script>
