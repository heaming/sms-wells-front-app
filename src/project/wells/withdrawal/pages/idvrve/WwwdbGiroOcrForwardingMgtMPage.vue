<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID : WwwdbGiroOcrForwardingMgtMPage - 지로 OCR 발송 관리 - 발송대상 관리
3. 작성자 : heungjun.lee
4. 작성일 : 2023.01.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 지로 OCR 발송 관리 - 발송대상 관리 조회 및 저장 페이지
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="2"
    one-row
    :modified-targets="['grdLink']"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="t('MSG_TXT_DIV')"
        required
      >
        <!-- 구분 -->
        <kw-option-group
          v-model="searchParams.giroRglrDvCd"
          type="radio"
          :options="codes.GIRO_RGLR_DV_CD"
          rules="required"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_WK_DAY')"
        required
      >
        <kw-date-picker
          v-model="searchParams.wkDt"
          :label="t('MSG_TXT_WK_DAY')"
          rules="required"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>

  <div class="result-area pb119">
    <ul class="kw-notification">
      <li>
        <span class="kw-fc--primary"> {{ t('MSG_TXT_NW_SPMT_SEA') }}</span>
        <!-- 신규추가는 [행추가] 클릭 후 고객코드로 검색하여 주시기 바랍니다. -->
      </li>
    </ul>
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
        v-permission:create
        :label="t('MSG_BTN_TEMP_GIRO_PLRCV_MNGT_POP')"
        negative
        dense
        @click="onClickPopup()"
      />
      <kw-btn
        v-permission:create
        :label="t('통합입금번호조회 임시')"
        negative
        dense
        @click="onClickPopup2()"
      />
      <!-- label="임시 지로 수신처 관리 팝업" -->
      <kw-btn
        v-permission:delete
        dense
        :label="t('MSG_BTN_DEL')"
        grid-action
        @click="onClickRemove"
      />
      <!-- label="삭제" -->
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        v-permission:create
        dense
        grid-action
        :label="t('MSG_BTN_ROW_ADD')"
        @click="onClickAdd"
      />
      <!-- label="행추가" -->
      <kw-btn
        v-permission:create
        dense
        grid-action
        :label="t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
      <!-- label="저장" -->

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
        :label="t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
      <!-- label="엑셀 다운로드" -->
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        v-permission:create
        dense
        secondary
        :label="t('대상추가')"
        @click="onClickObjectSearch"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <!-- label="대상추가" -->
      <kw-date-picker
        v-if="false"
        v-model="searchParams.giroOcrPblDtm"
        :placeholder="t('MSG_TXT_FW_DT')"
        dense
      />
      <kw-btn
        v-permission:create
        dense
        primary
        :label="t('MSG_TXT_PRNT_MNGT_CRT')"
        @click="onClickPrintCreate"
      />
      <!-- label="출력관리 생성" -->
    </kw-action-top>
    <!-- <ul class="filter-box mb12">
      <li class="filter-box__item">
        <p class="filter-box__item-label">
          {{ t('MSG_TXT_FW_DAY') }}
        </p>
        <kw-date-picker
          v-model="searchParams.giroOcrPblDtm"
          dense
        />
      </li>
    </ul> -->
    <kw-grid
      ref="grdLinkRef"
      name="grdLink"
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
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, modal, notify, useDataService, useGlobal, useMeta, alert } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { confirm } = useGlobal();

const dataService = useDataService();
const now = dayjs();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { getConfig } = useMeta();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  itemsChecked: {
    type: Boolean,
    required: true,
  },
});

const grdLinkRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'GIRO_RGLR_DV_CD',
);
// 임시 팝업 호출
async function onClickPopup() {
  await modal({
    component: 'WwwdbGiroPlaceReceivedMgtP',
    componentProps: { cntrNo: 'W20222718343', cntrSn: '1' },
  });
}
// // 임시 팝업 호출
async function onClickPopup2() {
  await modal({
    component: 'WwwdbIntegrationDepositNumberP',
  });
}

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const searchParams = ref({
  wkDt: now.format('YYYYMMDD'),
  giroRglrDvCd: '01',
  giroOcrPblDtm: now.format('YYYYMMDD'),
});

// console.log(searchParams.value.giroOcrPblDtm);

let cachedParams;

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/giro-ocr-forwardings/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdLinkRef.value.getView();
  const data = view.getDataSource();

  data.checkRowStates(false);
  data.setRows(pages);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  data.checkRowStates(true);
}

async function onClickSearch() {
  grdLinkRef.value.getData().clearRows();

  pageInfo.value.pageIndex = 1;

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 행추가
async function onClickAdd() {
  const view = grdLinkRef.value.getView();

  gridUtil.insertRowAndFocus(view, 0, {
    wkDt: searchParams.value.wkDt,
    giroRglrDvCd: '02',
  });
}

// 행삭제
async function onClickRemove() {
  const view = grdLinkRef.value.getView();

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length > 0) {
    deletedRows.forEach((data) => {
      data.rowState = 'deleted';
    });

    await dataService.delete('/sms/wells/withdrawal/idvrve/giro-ocr-forwardings', { data: deletedRows });
    await fetchData();
  }
}

async function onClickExcelDownload() {
  const view = grdLinkRef.value.getView();

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/giro-ocr-forwardings/excel-download', { params: cachedParams });
  // console.log(res.data);

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${props.itemsChecked}`,
    timePostfix: true,
    exportData: res.data,
  });
}
// 대상조회
async function onClickObjectSearch() {
  if (await confirm('대상추가를 하시겠습니까?')) { /* 추후에 메시지 바뀔 예정이라 추후 채번 예정 */
    const res = await dataService.get(`/sms/wells/withdrawal/idvrve/giro-ocr-forwardings/objects/${'no'}/${null}`);
    if (!res.data.length > 0) {
      notify('추가 할 대상이 없습니다.'); /* 추후에 메시지 바뀔 예정이라 추후 채번 예정 */
      return;
    }
    grdLinkRef.value.getData().clearRows();

    pageInfo.value.totalCount = res.data.length;
    pageInfo.value.pageIndex = 1;

    const objectRes = res.data;
    const view = grdLinkRef.value.getView();
    const data = view.getDataSource();

    objectRes.forEach((param) => {
      param.wkDt = searchParams.value.wkDt;
      param.giroRglrDvCd = '01';
      // gridUtil.insertRowAndFocus(view, 0, param);
    });

    data.addRows(objectRes);
  }
}

// 저장버튼
async function onClickSave() {
  const view = grdLinkRef.value.getView();
  const changedRows = gridUtil.getChangedRowValues(view);

  if (await gridUtil.alertIfIsNotModified(view)) { return; }

  if (!await gridUtil.validate(view)) { return; }

  await dataService.post('/sms/wells/withdrawal/idvrve/giro-ocr-forwardings', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));

  onClickSearch();
}

// 출력관리 생성 버튼
async function onClickPrintCreate() {
  const view = grdLinkRef.value.getView();

  if (gridUtil.isModified(view)) {
    await notify(t('MSG_ALT_CHG_CNTN_AFTER_SAVE'));
    return;
  }

  if (!searchParams.value.wkDt) {
    await notify(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_WK_DAY')]));
    return;
  }
  // 그리드 리스트
  const gridData = gridUtil.getAllRowValues(view);
  if (gridData.length === 0) {
    await notify(t('MSG_ALT_CRT_CANT_EMPTY'));
    // await notify('생성 할 자료가 없습니다.');
    return;
  }

  if (!await confirm(t('MSG_ALT_PRNT_CRT'))) { return; }

  const paramData = {
    state: 'created',
    wkDt: searchParams.value.wkDt,
    giroOcrPblOjStrtdt: searchParams.value.wkDt,
  };

  await dataService.post('/sms/wells/withdrawal/idvrve/giro-ocr-forwardings/print', paramData);

  notify(t('MSG_ALT_CRT_FSH'));

  fetchData();
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'wkDt' }, // --작업일자
    { fieldName: 'wkSn' }, // --작업일련번호
    { fieldName: 'giroBizDvCd' }, // --지로업무구분코드
    { fieldName: 'giroBizTpCd' }, // --지로업무유형코드
    { fieldName: 'cntrNo' }, // --
    { fieldName: 'cntrSn' }, // --
    { fieldName: 'cntr' }, // --
    { fieldName: 'cstFnm' }, // --고객명
    { fieldName: 'slDt' }, // --매출일자
    { fieldName: 'recapDutyPtrmN', dataType: 'number' }, // --약정개월
    { fieldName: 'strtGiroTn', dataType: 'number' }, // --시작
    { fieldName: 'endGiroTn', dataType: 'number' }, // --종료
    { fieldName: 'thm0Amt', dataType: 'number' }, // --0차월
    { fieldName: 'istmMcn', dataType: 'number' }, // 할부개월수
    { fieldName: 'istmAmt', dataType: 'number' }, // --할부금액
    { fieldName: 'istmDscAmt', dataType: 'number' }, // 할부할인금액
    { fieldName: 'pyAmt', dataType: 'number' }, // 납입금액
    { fieldName: 'stplNmnAmt', dataType: 'number' }, // 약정차월금액
    { fieldName: 'exnNmnAmt', dataType: 'number' }, // --만료차월
    { fieldName: 'ltpayYn' }, // 후납여부
    { fieldName: 'giroRglrDvCd' }, // 정기구분
    { fieldName: 'rentalTn' }, // 현재차월
    { fieldName: 'sellTam' },
    { fieldName: 'subscAmt' },
    { fieldName: 'tkAmt' },
    { fieldName: 'cshBlam' },
    { fieldName: 'giroFeeAmt' },
    { fieldName: 'cntrTam' },
  ];

  const columns = [
    { fieldName: 'wkDt',
      header: {
        text: t('MSG_TXT_WK_DT'),
        // text: '작업일자',
        styleName: 'essential',
      },
      datetimeFormat: 'date',
      editor: {
        type: 'btdate',
      },
      // styleCallback(grid, dataCell) {
      //   return dataCell.item.rowState === 'created' ? { editable: true,
      //     editor: {
      //       type: 'btdate',
      //       datetimeFormat: 'yyyyMMdd',
      //       commitOnSelect: true,
      //       mask: {
      //         editMask: '9999-99-99',
      //         placeHolder: 'yyyy-MM-dd',
      //       },
      //     },
      //     textFormat: '([0-9]{4})([0-9]{2})([0-9]{2})$;$1-$2-$3',
      //   } : { styleName: 'text-center' };
      // },

      width: '139',
      styleName: 'text-center',
      rules: 'required',
    },
    {
      fieldName: 'cntr',
      header: {
        text: t('MSG_TXT_CNTR_DTL_NO'),
        // text: '계약상세번호',
        styleName: 'essential',
      },
      width: '140',
      styleName: 'text-left rg-button-icon--search',
      button: 'action',
      editor: {
        type: 'line',
        maxLength: 17,
      },
      editable: false,
      rules: 'required|min:12|max:17',
      buttonVisibleCallback(grid, index) {
        return grid.getDataSource().getRowState(index.dataRow) === 'created';
      },
    },
    { fieldName: 'cstFnm',
      header: t('MSG_TXT_CST_NM'),
      editable: false,

      // , header: '고객명'
      width: '100' },
    { fieldName: 'slDt',
      header: t('MSG_TXT_SL_DT'),
      // , header: '매출일자'
      width: '100',
      datetimeFormat: 'date',
      editor: {
        type: 'date',
      },
      editable: false,
      styleName: 'text-center' },
    { fieldName: 'rentalTn',
      header: t('MSG_TXT_CRTL_NMN'),
      numberFormat: '#,##0',
      // , header: '현재차월'
      width: '70',
      editable: false,
      styleName: 'text-center' },
    { fieldName: 'recapDutyPtrmN',
      header: t('MSG_TXT_STPL_MCNT'),
      numberFormat: '#,##0',
      // , header: '약정개월'
      width: '70',
      editable: false,
      styleName: 'text-center' },
    { fieldName: 'strtGiroTn',
      header: t('MSG_TXT_STRT'),
      editor: {
        type: 'number',
        editFormat: '#,##0',
      },
      rules: 'required|max:5',
      numberFormat: '#,##0',
      // , header: '시작'
      width: '70',
      styleName: 'text-right',
      editable: true },
    { fieldName: 'endGiroTn',
      header: t('MSG_TXT_SHUTDOWN'),
      editor: {
        type: 'number',
        editFormat: '#,##0',
      },
      numberFormat: '#,##0',
      rules: 'required|max:5',
      // , header: '종료'
      width: '70',
      styleName: 'text-right',
      editable: true },
    { fieldName: 'thm0Amt',
      header: 0 + t('MSG_TXT_NMN'),
      width: '100',
      rules: 'required|max:20',
      styleName: 'text-right',
      editable: true,
      editor: {
        type: 'number',
        editFormat: '#,##0',
      },
    },
    { fieldName: 'istmMcn',
      header: t('MSG_TXT_RENT_PRD_MN'),
      // , header: '렌탈기간'
      width: '70',
      styleName: 'text-right',
      numberFormat: '#,##0',
      rules: 'required|max:12',
      editable: false,
      editor: {
        type: 'number',
      },
    },
    { fieldName: 'istmAmt',
      header: t('MSG_TXT_RTLFE'),
      // , header: '렌탈료'
      numberFormat: '#,##0',
      // rules: 'required|max:20',
      width: '100',
      styleName: 'text-right',
      editable: false,
      editor: {
        type: 'number',
        editFormat: '#,##0',
      } },
    { fieldName: 'istmDscAmt',
      header: t('MSG_TXT_RENTAL_DSC'),
      // , header: '렌탈할인'
      width: '100',
      // rules: 'required|max:20',
      numberFormat: '#,##0',
      styleName: 'text-right',
      editable: false,
      editor: {
        type: 'number',
        editFormat: '#,##0',
      } },
    { fieldName: 'pyAmt',
      header: t('MSG_TXT_BIL_RTLFE'),
      // , header: '청구 렌탈료'
      width: '100',
      styleName: 'text-right',
      rules: 'required|max:20',
      numberFormat: '#,##0',
      editor: {
        type: 'number',
        editFormat: '#,##0',
      },
      editable: true },
    { fieldName: 'stplNmnAmt',
      header: t('MSG_TXT_STPL_NMN'),
      numberFormat: '#,##0',
      editor: {
        type: 'number',
        editFormat: '#,##0',
      },
      rules: 'required|max:20',
      width: '100',
      styleName: 'text-right',
      editable: true },
    { fieldName: 'exnNmnAmt',
    // , header: '만료차월'
      header: t('MSG_TXT_EXN_NMN'),
      rules: 'required|max:20',
      width: '100',
      numberFormat: '#,##0',
      editor: {
        type: 'number',
        editFormat: '#,##0',
      },
      styleName: 'text-right',
      editable: true },
    { fieldName: 'ltpayYn',
      header: t('MSG_TXT_LTPAY_YN'),
      // header: '후납여부',
      width: '100',
      styleName: 'text-center',
      editable: true,
      rules: 'required',
      editor: {
        type: 'dropdown',
      },
      values: [
        'Y',
        'N',
      ],
      labels: [
        'Y',
        'N',
      ] },
    { fieldName: 'giroRglrDvCd',
      header: t('MSG_TXT_RGLR_DV'),
      // header: '정기구분',
      width: '100',
      styleName: 'text-center',
      rules: 'required',
      editable: false,
      options: codes.GIRO_RGLR_DV_CD },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onValidate = async (grid, index) => {
    const { cntr, strtGiroTn, endGiroTn } = await grid.getValues(index.dataRow);
    if (!cntr) {
      return t('MSG_ALT_NCELL_REQUIRED_VAL', [t('MSG_TXT_CNTR_DTL_NO')]);
    }
    if (strtGiroTn > endGiroTn) {
      return t('MSG_ALT_STRT_YM_END_YM_BIG', [t('MSG_TXT_STRT'), t('MSG_TXT_SHUTDOWN')]);
    }
  };

  // 체크박스 설정
  // view.onCellClicked = (grid, clickData) => {
  //   if (clickData.cellType === 'data') {
  //     grid.checkItem(clickData.itemIndex, !grid.isCheckedItem(clickData.itemIndex));
  //   }
  // };

  view.onCellButtonClicked = async (g, { column, itemIndex }) => {
    if (column === 'cntr') {
      // console.log(column);
      console.log(itemIndex);
    }
  };

  view.setColumnLayout([
    'wkDt', // single
    'cntr', 'cstFnm', 'slDt', 'rentalTn', 'recapDutyPtrmN',
    {
      header: t('MSG_TXT_GIRO_TN'),
      // header: '지로회차',
      direction: 'horizontal',
      items: ['strtGiroTn', 'endGiroTn'],
    },
    {
      header: t('MSG_TXT_RENTAL_AMT'),
      // header: ' 렌탈금액',
      direction: 'horizontal',
      items: ['istmMcn', 'thm0Amt', 'istmAmt', 'istmDscAmt', 'pyAmt'],
    },
    'stplNmnAmt',
    'exnNmnAmt', 'ltpayYn', 'giroRglrDvCd',
  ]);

  view.onCellEditable = (grid, index) => {
    if (!gridUtil.isCreatedRow(grid, index.dataRow) && ['wkDt', 'giroRglrDvCd'].includes(index.column)) {
      return false;
    }
  };

  view.onCellButtonClicked = async (g, { column, itemIndex }) => {
    const { wkDt } = await g.getValues(itemIndex);
    if (column === 'cntr') {
      if (isEmpty(wkDt)) {
        alert(t('MSG_ALT_NCELL_REQUIRED_VAL', [t('MSG_TXT_CNTR_DTL_NO')]));
        return;
      }

      const { result, payload } = await modal({
        component: 'WwctaContractNumberListP',
      });

      if (result) {
        const cntr = payload.cntrNo + payload.cntrSn;
        // const cntrSn = payload.cntrSn;
        const res = await dataService.get(`/sms/wells/withdrawal/idvrve/giro-ocr-forwardings/objects/${cntr}/${wkDt.substring(0, 6)}`);

        // console.log(res.data);

        if (!res.data.length > 0) {
          await alert('선택한 계약 관련하여 매출정보가 등록되지 않아 추가가 불가능합니다.');
          return;
        }

        view.setValues(itemIndex, res.data[0]);
        // data.setValue(itemIndex, 'cntrNo', payload.cntrNo);
        // data.setValue(itemIndex, 'cntrSn', payload.cntrSn);
        // data.setValue(itemIndex, 'cntr', cntr);
      }
    }
  };
});

</script>

<style scoped>
</style>
