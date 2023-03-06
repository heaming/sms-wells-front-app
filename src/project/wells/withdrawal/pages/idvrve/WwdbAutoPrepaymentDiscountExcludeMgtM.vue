<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID : WwdbAutoPrepaymentDiscountExcludeMgtM - 자동 선납할인제외 관리
3. 작성자 : heungjun.lee
4. 작성일 : 2023.02.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 자동 선납할인제외 조회 및 저장한다.
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_BASE_YM')"
          required
        >
          <!-- label="기준년월" -->
          <kw-date-picker
            v-model="searchParams.baseYm"
            :label="t('MSG_TXT_BASE_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_CNTR_DTL_NO')"
        >
          <!-- label="계약상세번호" -->
          <kw-input
            icon="search"
            clearable
            @keydown="onKeyDownSelectCntr"
            @click-icon="onClickSelectCntr"
            @clear="onClearSelectCntr"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_EXCD_STRT_MM')"
        >
          <!-- label="제외시작월" -->
          <kw-date-picker
            v-model="searchParams.prmDscExcdStrtYm"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_EXCD_END_MM')"
        >
          <!-- label="제외종료월" -->
          <kw-date-picker
            v-model="searchParams.prmDscExcdEndYm"
            type="month"
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
        </template>
        <kw-btn
          :label="t('MSG_BTN_DEL')"
          grid-action
          @click="onClickRemove"
        />
        <!-- label="삭제" -->
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          :label="t('MSG_BTN_ROW_ADD')"
          grid-action
          @click="onClickAdd"
        />
        <!-- label="행 추가" -->
        <kw-btn
          :label="t('MSG_BTN_SAVE')"
          grid-action
          @click="onClickSave"
        />
        <!-- label="저장" -->
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <!-- label="엑셀다운로드" -->
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
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

import dayjs from 'dayjs';
import { codeUtil, defineGrid, getComponentType, gridUtil, alert, notify, modal, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const now = dayjs();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes('COD_PAGE_SIZE_OPTIONS', 'SELL_TP_CD');

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  prmDscExcdStrtYm: now.format('YYYYMM'),
  prmDscExcdEndYm: now.format('999912'),
  cntr: '',
  cntrNo: '',
  cntrSn: '',
});

let cachedParams;

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  console.log(cachedParams);
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/auto-prepayment-discount-exclude/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  data.checkRowStates(false);
  data.setRows(pages);
  data.checkRowStates(true);

  view.resetCurrent();
}

// 조회 버튼
async function onClickSearch() {
  grdMainRef.value.getData().clearRows();

  pageInfo.value.pageIndex = 1;

  searchParams.value.cntrNo = searchParams.value.cntr.substring(0, 12);
  searchParams.value.cntrSn = searchParams.value.cntr.substring(12);

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 행추가
async function onClickAdd() {
  const view = grdMainRef.value.getView();

  gridUtil.insertRowAndFocus(view, 0, {
    prmDscExcdStrtYm: now.format('YYYYMM'),
    prmDscExcdEndYm: now.format('999912'),
  }, false);
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/auto-prepayment-discount-exclude/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: `${t('MSG_TXT_AUTO_PRM_DSC_EXCD')}_Excel`,
    timePostfix: true,
    exportData: res.data,
  });
}

// 저장버튼
async function onClickSave() {
  const view = grdMainRef.value.getView();

  if (await gridUtil.alertIfIsNotModified(view)) { return; }

  if (!await gridUtil.validate(view)) { return; }

  // 중복신청 체크
  const unique = [];

  // const gridData = gridUtil.getAllRowValues(view, false);

  const duplicates = gridUtil.some(view, (item) => {
    if (unique.find((i) => (i.cntr === item.cntr) && (i.prmDscExcdStrtYm === item.prmDscExcdStrtYm))) {
      return true;
    }
    unique.push(item);
    return false;
  });

  if (duplicates.length) {
    await alert(t('MSG_ALT_DUPLICATE_EXISTS')); // 중복된 값이 존재합니다.
    return;
  }

  const changedRows = gridUtil.getChangedRowValues(view);

  // for (let index = 0; index < changedRows.length; index += 1) {
  //   if (changedRows[index].prmDscExcdStrtYm > changedRows[index].prmDscExcdEndYm) {
  //     alert(t('MSG_ALT_ABLE_START_DT_PREC_FINS_DT'));
  //     // await alert(t('시작일자가 종료일자 보다 클 수 없습니다.'));
  //     return;
  //   }
  // }

  await dataService.post('/sms/wells/withdrawal/idvrve/auto-prepayment-discount-exclude', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));

  fetchData();
}

// 행삭제
async function onClickRemove() {
  const view = grdMainRef.value.getView();

  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  console.log(deletedRows);

  // rowState 삭제상태 none 으로 나와 임시 set
  for (let i = 0; i < deletedRows.length; i += 1) {
    deletedRows[i].rowState = 'deleted';
  }

  if (deletedRows.length > 0) {
    await dataService.post('/sms/wells/withdrawal/idvrve/auto-prepayment-discount-exclude', deletedRows);
    // notify(t('삭제되었습니다.'));
    // notify(t('MSG_ALT_DELETED'));
    await fetchData();
  }
}

// 계약상세번호 조회
async function onClickSelectCntr() {
  const { result, payload } = await modal({ component: 'WwctaContractNumberListP',
    // componentProps: { rveCd: searchParams.value.rveCd, rveNm: searchParams.value.rveNm },
  });
  console.log(payload);
  if (result) {
    console.log(payload);
    // searchParams.value.rveCd = payload.rveCd;
    // searchParams.value.rveNm = payload.rveNm;
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 일련번호
    { fieldName: 'cntr' }, // 일련번호
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'sellTpCd' }, // 판매유형
    { fieldName: 'pdCd' }, // 상품코드
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'prmDscExcdStrtYm' }, // 선납제외시작월
    { fieldName: 'prmDscExcdEndYm' }, // 선납제외종료월
    { fieldName: 'col8' }, // 선납시작일
    { fieldName: 'slCtrAmt' }, // 조정값
    { fieldName: 'fstRgstDtm' }, // 등록일시
    { fieldName: 'fstRgstUsrId' }, // 등록자 id
    { fieldName: 'fnlMdfcDtm' }, // 수정일시
    { fieldName: 'fnlMdfcUsrId' }, // 수정자 id
    { fieldName: 'rowState' }, // 상태값
  ];

  const columns = [
    {
      fieldName: 'cntr',
      header: {
        text: t('MSG_TXT_CNTR_DTL_NO'),
        // text: '계약상세번호',
        styleName: 'essential',
      },
      width: '150',
      styleName: 'text-left rg-button-icon--search',
      button: 'action',
      buttonVisibleCallback(grid, index) {
        return grid.getDataSource().getRowState(index.dataRow) === 'created';
      },
      rules: 'required|min:12',
    },
    { fieldName: 'cstKnm',
      header: t('MSG_TXT_CST_NM'),
      width: '100',
      styleName: 'text-left',
      editable: false },
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_SEL_TYPE'),
      // header: '판매유형',
      width: '90',
      styleName: 'text-left',
      options: codes.SELL_TP_CD,
      editable: false },
    { fieldName: 'pdCd',
      header: t('MSG_TXT_PRDT_CODE'),
      //  header: '상품코드'
      width: '109',
      styleName: 'text-left',
      editable: false },
    { fieldName: 'pdNm',
      header: t('MSG_TXT_PRDT_NM'),
      // , header: '상품명'
      width: '200',
      styleName: 'text-left',
      editable: false },
    {
      fieldName: 'prmDscExcdStrtYm',
      header: {
        text: t('MSG_TXT_PRM_EXCD_STRT_MM'),
        // text: '선납제외시작월',
        styleName: 'essential',
      },
      // datetimeFormat: 'date',
      // textFormat: '([0-9]{4})([0-9]{2})$;$1-$2',
      // editor: {
      //   type: 'btdate',
      //   btOptions: {
      //     startView: 1,
      //     minViewMode: 1,
      //     todayBtn: 'linked',
      //     // language: 'kr',
      //     todayHighlight: true,
      //     language: 'ko',
      //   },
      //   datetimeFormat: 'yyyyMM',
      // },
      datetimeFormat: 'yyyy-MM',
      editor: {
        type: 'btdate',
        btOptions: {
          minViewMode: 1,
        },
      },
      width: '125',
      styleName: 'text-center',
      rules: 'required',
    },
    {
      fieldName: 'prmDscExcdEndYm',
      header: {
        text: t('MSG_TXT_PRM_EXCD_END_MM'),
        // text: '선납제외종료월',
        styleName: 'essential',
      },
      // textFormat: '([0-9]{4})([0-9]{2})$;$1-$2',
      rules: 'required',
      // editor: {
      //   type: 'btdate',
      //   btOptions: {
      //     startView: 1,
      //     minViewMode: 1,
      //     todayBtn: 'linked',
      //     // language: 'kr',
      //     todayHighlight: true,
      //     language: 'ko',
      //   },
      //   datetimeFormat: 'yyyyMM',
      // },
      datetimeFormat: 'yyyy-MM',
      editor: {
        type: 'btdate',
        btOptions: {
          minViewMode: 1,
        },
      },
      width: '125',
      styleName: 'text-center',
    },
    { fieldName: 'col8',
      header: t('MSG_TXT_PRM_STRT_MM'),
      // , header: '선납시작월'
      width: '100',
      styleName: 'text-center',
      editable: false },

    { fieldName: 'slCtrAmt',
      header: t('MSG_TXT_CTR_AMT'),
      // , header: '조정금액'
      width: '100',
      styleName: 'text-right',
      editable: false },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DTM'), width: '150', styleName: 'text-center', editable: false },
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR'), width: '70', styleName: 'text-left', editable: false },
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88', styleName: 'text-left', editable: false },
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_MDFC_DTM'), width: '150', styleName: 'text-center', editable: false },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TIT_MDFC_USR'), width: '70', styleName: 'text-left', editable: false },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88', styleName: 'text-left', editable: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  // 체크박스 설정
  view.onCellClicked = (grid, clickData) => {
    if (clickData.cellType === 'data') {
      grid.checkItem(clickData.itemIndex, !grid.isCheckedItem(clickData.itemIndex));
    }
  };

  view.onCellEditable = (grid, index) => {
    if (!gridUtil.isCreatedRow(grid, index.dataRow) && ['cntr', 'prmDscExcdStrtYm'].includes(index.column)) {
      return false;
    }
  };

  view.onCellButtonClicked = async (g, { column, itemIndex }) => {
    if (column === 'cntr') {
      g.commit();

      if (data.getValue(itemIndex, 'cntr')) {
        const cntrParam = {
          cntrNo: data.getValue(itemIndex, 'cntr').substring(0, 12),
          cntrSn: data.getValue(itemIndex, 'cntr').substring(12),
        };

        const res = await dataService.get('/sms/wells/withdrawal/idvrve/auto-prepayment-discount-exclude/contracts', { params: cntrParam });

        if (res.data) {
          const rowCtrnRes = res.data;

          data.setValue(itemIndex, 'cstKnm', rowCtrnRes.cstKnm);
          data.setValue(itemIndex, 'sellTpCd', rowCtrnRes.sellTpCd);
          data.setValue(itemIndex, 'pdCd', rowCtrnRes.pdCd);
          data.setValue(itemIndex, 'pdNm', rowCtrnRes.pdNm);
        } else {
          // 존재하지 않는 계약상세번호 입니다.
          alert(t('MSG_ALT_IT_NOT_EXIST', [t('MSG_TXT_CNTR_DTL_NO')]));
        }
      } else {
        // alert('계약상세번호는 필수 값 입니다.');
        alert(t('MSG_ALT_NCELL_REQUIRED_VAL', [t('MSG_TXT_CNTR_DTL_NO')]));
      }

      view.onValidate = async (grid, index) => {
        const { prmDscExcdStrtYm, prmDscExcdEndYm } = grid.getValues(index.dataRow);
        if (prmDscExcdStrtYm > prmDscExcdEndYm) {
          return t('MSG_ALT_ABLE_START_DT_PREC_FINS_DT');
        }
      };

      // const { result, payload } = await modal({
      //   component: 'WwctaContractNumberListP',
      // });

      // if (result) {
      //   console.log(payload.cntrNo);
      //   console.log(payload.cntrSn);
      //   const cntrNo = payload.cntrNo + payload.cntrSn;
      //   // const cntrSn = payload.cntrSn;

      //   data.setValue(itemIndex, 'cntrNo', cntrNo);
      // }
    }
  };
});
</script>
<style scoped>
</style>
