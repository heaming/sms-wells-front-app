<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID : WwwdbAutoPrepaymentDiscountExcludeMgtM.vue - 자동 선납할인제외 관리
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
          <!-- <kw-input
            v-model="searchParams.cntr"
            icon="search"
            clearable
            @click-icon="onClickSelectCntr"
          /> -->
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>
        <kw-btn
          v-permission:delete
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
          v-permission:create
          :label="t('MSG_BTN_ROW_ADD')"
          grid-action
          @click="onClickAdd"
        />
        <!-- label="행 추가" -->
        <kw-btn
          v-permission:create
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
          v-permission:download
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
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
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
import { codeUtil, defineGrid, getComponentType, gridUtil, alert, notify, modal, useDataService, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const dataService = useDataService();
const now = dayjs();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { getConfig } = useMeta();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes('COD_PAGE_SIZE_OPTIONS', 'SELL_TP_CD');

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  prmDscExcdStrtYm: '',
  prmDscExcdEndYm: '',
  // prmDscExcdEndYm: now.format('999912'),
  cntr: '',
  cntrNo: '',
  cntrSn: '',
});

let cachedParams;

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/auto-prepayment-discount-exclude/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  data.checkRowStates(false);
  data.setRows(pages);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  data.checkRowStates(true);
}

// 조회 버튼
async function onClickSearch() {
  grdMainRef.value.getData().clearRows();

  pageInfo.value.pageIndex = 1;

  if ((searchParams.value.prmDscExcdStrtYm > searchParams.value.prmDscExcdEndYm)
  && (!isEmpty(searchParams.value.prmDscExcdStrtYm) && !isEmpty(searchParams.value.prmDscExcdEndYm))) {
    await alert(t('MSG_ALT_STRT_MM_END_MM_LSTH')); // TODO: 메시지 자원 변경가능성 있음
    // 제외시작월이 제외종료월보다 클 수 없습니다.
    return;
  }

  // searchParams.value.cntrNo = searchParams.value.cntr.substring(0, 12);
  // searchParams.value.cntrSn = searchParams.value.cntr.substring(12);

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
    fileName: currentRoute.value.meta.menuName,
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

  await dataService.post('/sms/wells/withdrawal/idvrve/auto-prepayment-discount-exclude', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));

  fetchData();
}

// 행삭제
async function onClickRemove() {
  const view = grdMainRef.value.getView();

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  // rowState 삭제상태 none 으로 나와 임시 set
  for (let i = 0; i < deletedRows.length; i += 1) {
    deletedRows[i].rowState = 'deleted';
  }

  if (deletedRows.length > 0) {
    await dataService.delete('/sms/wells/withdrawal/idvrve/auto-prepayment-discount-exclude', { data: deletedRows });
    await fetchData();
  }
}

// 계약상세번호 조회
// async function onClickSelectCntr() {
//   const { result, payload } = await modal({ component: 'WwctaContractNumberListP',
//     // componentProps: { cntrNo: searchParams.value.cntrNo },
//   });
//   if (result) {
//     searchParams.value.cntr = payload.cntrNo + payload.cntrSn;
//     searchParams.value.cntrNo = payload.cntrNo;
//     searchParams.value.cntrSn = payload.cntrSn;
//   }
// }

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
    { fieldName: 'prmStrtDate' }, // 선납시작일
    { fieldName: 'slCtrAmt', dataType: 'number' }, // 조정값
    { fieldName: 'fstRgstDtm' }, // 등록일시
    { fieldName: 'fstRgstUsrId' }, // 등록자 id
    { fieldName: 'fstRgstUsrNm' }, // 등록자
    { fieldName: 'fnlMdfcDtm' }, // 수정일시
    { fieldName: 'fnlMdfcUsrId' }, // 수정자 id
    { fieldName: 'fnlMdfcUsrNm' }, // 수정자 id
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
      width: '180',
      styleName: 'text-center rg-button-icon--search',
      button: 'action',
      editable: false,
      displayCallback(g, index) {
        const { cntrNo, cntrSn } = g.getValues(index.itemIndex);
        if (isEmpty(cntrNo) || isEmpty(cntrSn)) {
          return '';
        }
        return `${cntrNo}-${cntrSn}`;
      },
      buttonVisibleCallback(grid, index) {
        return grid.getDataSource().getRowState(index.dataRow) === 'created';
      },
      rules: 'required|min:12',
    },
    { fieldName: 'cstKnm',
      header: t('MSG_TXT_CST_NM'),
      width: '100',
      styleName: 'text-center',
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
      styleName: 'text-center',
      editable: false },
    {
      fieldName: 'prmDscExcdStrtYm',
      header: {
        text: t('MSG_TXT_PRM_EXCD_STRT_MM'),
        // text: '선납제외시작월',
        styleName: 'essential',
      },
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
      rules: 'required',
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
    { fieldName: 'prmStrtDate',
      header: t('MSG_TXT_PRM_STRT_MM'),
      // , header: '선납시작월'
      width: '100',
      styleName: 'text-center',
      datetimeFormat: 'YYYY-MM',
      editable: false },
    { fieldName: 'slCtrAmt',
      header: t('MSG_TXT_CTR_AMT'),
      numberFormat: '#,##0',
      // , header: '조정금액'
      width: '100',
      styleName: 'text-right',
      editable: false },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DTM'), width: '200', styleName: 'text-center', editable: false },
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_RGR_EP_NO'), width: '88', styleName: 'text-center', editable: false }, // 통테DEF_512요청건. 번호 -> 사번
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_RGR_NM'), width: '70', styleName: 'text-left', editable: false }, // 통테DEF_512요청건. 등록자-> 이름
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_MDFC_DTM'), width: '200', styleName: 'text-center', editable: false },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_UPT_EMP_NO'), width: '88', styleName: 'text-center', editable: false },
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_UDR_NM'), width: '70', styleName: 'text-left', editable: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  // // 체크박스 설정
  // view.onCellClicked = (grid, clickData) => {
  //   if (clickData.cellType === 'data') {
  //     grid.checkItem(clickData.itemIndex, !grid.isCheckedItem(clickData.itemIndex));
  //   }
  // };

  view.onCellEditable = (grid, index) => {
    if (!gridUtil.isCreatedRow(grid, index.dataRow) && ['cntr', 'prmDscExcdStrtYm'].includes(index.column)) {
      return false;
    }
  };

  view.onCellButtonClicked = async (g, { column, itemIndex }) => {
    if (column === 'cntr') {
      g.commit();

      const { result, payload } = await modal({
        component: 'WwctaContractNumberListP',
      });

      if (result) {
        const cntr = payload.cntrNo + payload.cntrSn;
        const { cntrNo, cntrSn } = payload;

        data.setValue(itemIndex, 'cntrNo', cntrNo);
        data.setValue(itemIndex, 'cntrSn', cntrSn);
        data.setValue(itemIndex, 'cntr', cntr);
      }

      if (data.getValue(itemIndex, 'cntr')) {
        const cntrParam = {
          cntrNo: data.getValue(itemIndex, 'cntrNo'),
          cntrSn: data.getValue(itemIndex, 'cntrSn'),
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
          // alert(t('MSG_ALT_IT_NOT_EXIST', [t('MSG_TXT_CNTR_DTL_NO')]));

          alert(t('MSG_ALT_RENTAL_MSH_RGST_PSB'));
          // 판매유형이 렌탈, 맴버십인 계약상세정보만 등록 가능합니다.

          data.setValue(itemIndex, 'cntrNo', '');
          data.setValue(itemIndex, 'cntrSn', '');
          data.setValue(itemIndex, 'cntr', '');
        }
      }
    }
  };
  view.onValidate = async (grid, index) => {
    const { prmDscExcdStrtYm, prmDscExcdEndYm, cntr } = grid.getValues(index.dataRow);
    if (!cntr) {
      return t('MSG_ALT_NCELL_REQUIRED_VAL', [t('MSG_TXT_CNTR_DTL_NO')]);
    }
    if (prmDscExcdStrtYm > prmDscExcdEndYm) {
      return t('MSG_ALT_ABLE_START_DT_PREC_FINS_DT');
    }
  };
});
</script>
<style scoped>
</style>
