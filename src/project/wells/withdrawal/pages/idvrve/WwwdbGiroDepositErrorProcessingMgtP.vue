<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : idvrve
2. 프로그램 ID : WwwdbGiroDepositErrorProcessingMgtP - 오류처리
3. 작성자 : heungjun.lee
4. 작성일 : 2023.02.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 오류처리를 조회 및 저장 한다.
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="popupRef"
    size="xl"
  >
    <!-- :title="t('MSG_TXT_ERR_KR')" -->
    <!-- title="오류처리" -->
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change="fetchData"
        />
      </template>
      <kw-btn
        icon="download_on"
        dense
        secondary
        :disable="pageInfo.totalCount === 0"
        :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
        @click="onClickExcelDownload"
      />
      <!-- label="엑셀다운로드" -->
    </kw-action-top>
    <!-- <kw-observer ref="obsRef"> -->
    <kw-grid
      ref="grdPageRef"
      :visible-rows="10"
      @init="initGrid"
    />
    <!-- </kw-observer> -->
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
    <template #action>
      <kw-btn
        primary
        :label="t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
      <!-- label="저장" -->
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { codeUtil, defineGrid, getComponentType, gridUtil, modal, notify, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  fntDt: {
    type: String,
    default: null,
  },
  rveDt: {
    type: String,
    default: null,
  },
});
const popupRef = ref();

const grdPageRef = ref(getComponentType('KwGrid'));
const codes = await codeUtil.getMultiCodes('COD_PAGE_SIZE_OPTIONS');

const params = ref({
  fntDt: '',
  rveDt: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

let dataParam;

async function fetchData() {
  dataParam = cloneDeep(params.value);
  dataParam = { ...dataParam, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/giro-deposits/errors', { params: dataParam });

  const { list: pages, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  console.log(res.data);

  const view = grdPageRef.value.getView();
  const data = view.getDataSource();

  data.checkRowStates(false);
  data.setRows(pages);
  data.checkRowStates(true);

  // view.resetCurrent();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdPageRef.value.getView();

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/giro-deposits/errors/excel-download', { params: dataParam });

  await gridUtil.exportView(view, {
    fileName: popupRef.value.pageCtxTitle,
    timePostfix: true,
    exportData: res.data,
  });
}

// 저장버튼
async function onClickSave() {
  const view = grdPageRef.value.getView();

  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  console.log(changedRows);

  await dataService.post('/sms/wells/withdrawal/idvrve/giro-deposits/errors', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));

  fetchData();
}

async function initProps() {
  const { fntDt, rveDt } = props;
  console.log(props);
  params.value.fntDt = fntDt;
  params.value.rveDt = rveDt;

  await fetchData();
}

onMounted(async () => {
  await initProps();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'itgDpNo' }, // --통합입금번호
    { fieldName: 'cntrNo' }, // --계약번호
    { fieldName: 'cntrSn' }, //
    { fieldName: 'cntr' }, //
    { fieldName: 'cstKnm' }, // --  a. 고객명
    { fieldName: 'pyAmt', dataType: 'number' }, // --납입금액
    { fieldName: 'rveDt' }, // --입금일
    { fieldName: 'fntDt' }, // --실적일
    { fieldName: 'fnlMdfcDtm' }, // --수정일시
    { fieldName: 'fnlMdfcUsrId' }, // --수정아이디
    { fieldName: 'dpErrProcsCn' }, // --사유

  ];

  const columns = [
    { fieldName: 'cntr',
      header: {
        text: t('MSG_TXT_CNTR_NO'),
        // text: '계약번호',
        styleName: 'essential',
      },
      editable: false,
      rules: 'required|min:12|max:17',
      width: '250',
      styleName: 'text-left rg-button-icon--search',
      button: 'action',
      editor: {
        type: 'line',
        maxLength: 17,
      },
    },

    { fieldName: 'cstKnm',
      header: t('MSG_TXT_CST_NM'),
      // header: '고객명',
      width: '120',
      styleName: 'text-left',
      editable: false },

    { fieldName: 'pyAmt',
      header: {
        text: t('MSG_TXT_AMT_WON'),
        // text: '금액(원)',
        styleName: 'essential',
      },
      numberFormat: '#,##0',
      editor: {
        type: 'number',
        editFormat: '#,##0',
      },
      rules: 'required|min_value:1',
      width: '130',
      styleName: 'text-right',
    },

    { fieldName: 'fntDt',
      header: {
        text: t('MSG_TXT_DP_DT'),
        // text: '입금일',
        styleName: 'essential',
      },
      rules: 'required',
      editor: {
        type: 'btdate',
      },
      width: '150',
      styleName: 'text-center' },

    { fieldName: 'rveDt',
      header: {
        text: t('MSG_TXT_PERF_DT'),
        // text: '실적일',
        styleName: 'essential',
      },
      rules: 'required',
      editor: {
        type: 'btdate',
      },
      width: '150',
      styleName: 'text-center',
    },

    { fieldName: 'fnlMdfcDtm',
      header: t('MSG_TXT_MDFC_DATE'),
      datetimeFormat: 'date',
      // , header: '수정일자'
      editable: false,
      width: '200',
      styleName: 'text-center' },
    { fieldName: 'fnlMdfcUsrId',
      header: t('MSG_TXT_MDFC_PSIC'),
      editable: false,
      // , header: '수정담당자'
      width: '120' },
    { fieldName: 'fnlMdfcUsrId',
      header: t('MSG_TXT_SEQUENCE_NUMBER'),
      editable: false,
      // , header: '번호'
      width: '120',
      styleName: 'text-center' },
    { fieldName: 'dpErrProcsCn',
      header: t('MSG_TXT_RSN'),
      // , header: '사유'
      width: '219',
      rules: 'max:333',
      styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // 체크박스 설정
  // view.onCellClicked = (grid, clickData) => {
  //   if (clickData.cellType === 'data') {
  //     grid.checkItem(clickData.itemIndex, !grid.isCheckedItem(clickData.itemIndex));
  //   }
  // };

  view.onCellButtonClicked = async (g, { column, itemIndex }) => {
    if (column === 'cntr') {
      console.log(itemIndex);

      const { result, payload } = await modal({
        component: 'WwctaContractNumberListP',
      });

      if (result) {
        console.log(payload);
        const cntr = payload.cntrNo + payload.cntrSn;
        const { cntrCstKnm } = payload;

        data.setValue(itemIndex, 'cntr', cntr);
        data.setValue(itemIndex, 'cstKnm', cntrCstKnm);
      }
    }
  };

  view.editOptions.editable = true;
});

</script>
