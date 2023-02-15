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
          @change="fetchData"
        />
      </template>
      <!-- <kw-btn
        :label="t('MSG_BTN_TEMP_GIRO_PLRCV_MNGT_POP')"
        negative
        dense
        @click="onClickPopup()"
      /> -->
      <!-- label="임시 지로 수신처 관리 팝업" -->
      <kw-btn
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
        dense
        grid-action
        :label="t('MSG_BTN_ROW_ADD')"
        @click="onClickAdd"
      />
      <!-- label="행추가" -->
      <kw-btn
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
        dense
        negative
        :label="t('MSG_BTN_OJ_INQR')"
        @click="onClickObjectSearch"
      />
      <!-- label="대상조회" -->
      <kw-btn
        dense
        primary
        :label="t('MSG_TXT_PRNT_MNGT_CRT')"
        @click="onClickPrintCreate"
      />
      <!-- label="출력관리 생성" -->
    </kw-action-top>
    <ul class="filter-box mb12">
      <li class="filter-box__item">
        <p class="filter-box__item-label">
          {{ t('MSG_TXT_FW_DAY') }}
          <!-- 발송일 -->
        </p>
        <kw-date-picker
          v-model="searchParams.giroOcrPblDtm"
          dense
        />
      </li>
    </ul>
    <kw-grid
      ref="grdLinkRef"
      name="grdLink"
      :visible-rows="pageInfo.pageSize -1"
      @init="initGrid"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, notify, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { confirm } = useGlobal();

const dataService = useDataService();
const now = dayjs();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdLinkRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'GIRO_RGLR_DV_CD',
);
// 임시 팝업 호출
// async function onClickPopup() {
//   await modal({
//     component: 'WwwdbGiroPlrcvMgtP',
//   });
// }

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

const searchParams = ref({
  wkDt: now.format('YYYYMMDD'),
  giroRglrDvCd: '01',
  giroOcrPblDtm: now.format('YYYYMMDD'),
});

let cachedParams;

async function onClickSearch() {
  grdLinkRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  // eslint-disable-next-line no-use-before-define
  await fetchData();
}

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/giro-ocr-forwardings/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdLinkRef.value.getView();
  const data = view.getDataSource();
  data.checkRowStates(false);
  data.setRows(pages);
  data.checkRowStates(true);
  view.resetCurrent();
}

// 행추가
async function onClickAdd() {
  const view = grdLinkRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {
    wkDt: now.format('YYYYMMDD'),
    giroRglrDvCd: '02',
  });
}

// 행삭제
async function onClickRemove() {
  const view = grdLinkRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  await gridUtil.confirmDeleteCheckedRows(view);
}

async function onClickExcelDownload() {
  const view = grdLinkRef.value.getView();
  // eslint-disable-next-line max-len
  // const res = await dataService.get('/sms/common/withdrawal/idvrve/crp-ac-infs/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: `${t('MSG_TXT_GIRO')}OCR_Excel`,
    timePostfix: true,
    // exportData: res.data,
  });
}
// 대상조회
async function onClickObjectSearch() {
  console.log('대상조회');
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/giro-ocr-forwardings/objects');
  console.log(res.data);
}

// 저장버튼
async function onClickSave() {
  const view = grdLinkRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const changedRows = gridUtil.getChangedRowValues(view);
  console.log(changedRows);
  await dataService.post('/sms/wells/withdrawal/idvrve/giro-ocr-forwardings', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  fetchData();
}

// 출력관리 생성 버튼
async function onClickPrintCreate() {
  if (!await confirm(t('MSG_ALT_PRNT_CRT'))) { return; }
  const paramData = {
    state: 'created',
    wkDt: searchParams.value.wkDt,
    giroOcrPblOjStrtdt: searchParams.value.giroOcrPblDtm,
  };
  console.log(paramData);
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
    { fieldName: 'cstFnm' }, // --고객명
    { fieldName: 'slDt' }, // --매출일자
    { fieldName: 'recapDutyPtrmN' }, // --약정개월
    { fieldName: 'strtGiroTn' }, // --시작
    { fieldName: 'endGiroTn' }, // --종료
    { fieldName: 'thm0Amt' }, // --0차월
    { fieldName: 'istmMcn' }, // 할부개월수
    { fieldName: 'istmAmt' }, // --할부금액
    { fieldName: 'istmDscAmt' }, // 할부할인금액
    { fieldName: 'pyAmt' }, // 납입금액
    { fieldName: 'stplNmnAmt' }, // 약정차월금액
    { fieldName: 'exnNmnAmt' }, // --만료차월
    { fieldName: 'ltpayYn' }, // 후납여부
    { fieldName: 'giroRglrDvCd' }, // 정기구분
    { fieldName: 'col2' }, // 현재차월

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
      fieldName: 'cntrNo',
      header: {
        text: t('MSG_TXT_CNTR_SN'),
        // text: '계약일련번호',
        styleName: 'essential',
      },
      editable: false,
      // styleCallback(grid, dataCell) {
      //   return dataCell.item.rowState === 'created' ? { editable: true,
      //     editor: {
      //       type: 'line',
      //     } } : { styleName: 'text-left' };
      // },
      width: '117',
      styleName: 'text-left rg-button-icon--search',
      button: 'action',
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
      editable: false,
      styleName: 'text-center' },
    { fieldName: 'col2',
      header: t('MSG_TXT_CRTL_NMN'),
      // , header: '현재차월'
      width: '70',
      editable: false,
      styleName: 'text-center' },
    { fieldName: 'recapDutyPtrmN',
      header: t('MSG_TXT_STPL_MCNT'),
      // , header: '약정개월'
      width: '70',
      editable: false,
      styleName: 'text-center' },
    { fieldName: 'strtGiroTn',
      header: t('MSG_TXT_STRT'),
      // , header: '시작'
      width: '70',
      styleName: 'text-center',
      editable: true },
    { fieldName: 'endGiroTn',
      header: t('MSG_TXT_SHUTDOWN'),
      // , header: '종료'
      width: '70',
      styleName: 'text-center',
      editable: true },
    { fieldName: 'thm0Amt', header: 0 + t('MSG_TXT_NMN'), width: '100', styleName: 'text-center', editable: true },
    { fieldName: 'istmMcn',
      header: t('MSG_TXT_RENT_PRD_MN'),
      // , header: '렌탈기간'
      width: '70',
      styleName: 'text-center',
      editable: true },
    { fieldName: 'istmAmt',
      header: t('MSG_TXT_RTLFE'),
      // , header: '렌탈료'
      width: '100',
      styleName: 'text-right',
      editable: true },
    { fieldName: 'istmDscAmt',
      header: t('MSG_TXT_RENTAL_DSC'),
      // , header: '렌탈할인'
      width: '100',
      styleName: 'text-right',
      editable: true },
    { fieldName: 'pyAmt',
      header: t('MSG_TXT_BIL_RTLFE'),
      // , header: '청구 렌탈료'
      width: '100',
      styleName: 'text-right',
      editable: true },
    { fieldName: 'stplNmnAmt', header: t('MSG_TXT_STPL_NMN'), width: '100', styleName: 'text-right', editable: true },
    { fieldName: 'exnNmnAmt',
    // , header: '만료차월'
      header: t('MSG_TXT_EXN_NMN'),
      width: '100',
      styleName: 'text-right',
      editable: true },
    { fieldName: 'ltpayYn',
      header: t('MSG_TXT_LTPAY_YN'),
      // header: '후납여부',
      width: '100',
      styleName: 'text-left',
      editable: true,
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
      styleName: 'text-right',
      editor: {
        type: 'dropdown',
      },
      options: codes.GIRO_RGLR_DV_CD },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  // view.editOptions.columnEditableFirst = true;
  view.editOptions.editable = true;
  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      // eslint-disable-next-line no-use-before-define
      await fetchData();
    }
  };

  view.onCellButtonClicked = async (g, { column, itemIndex }) => {
    if (column === 'cntrNo') {
      console.log(column);
      console.log(itemIndex);
    }
  };

  view.setColumnLayout([
    'wkDt', // single
    'cntrNo', 'cstFnm', 'slDt', 'col2', 'recapDutyPtrmN',
    {
      header: t('MSG_TXT_GIRO_TN'),
      // header: '지로회차',
      direction: 'horizontal',
      items: ['strtGiroTn', 'endGiroTn'],
    },
    'thm0Amt',
    {
      header: t('MSG_TXT_RENTAL'),
      // header: ' 렌탈',
      direction: 'horizontal',
      items: ['istmMcn', 'istmAmt', 'istmDscAmt', 'pyAmt'],
    },
    'stplNmnAmt',
    'exnNmnAmt', 'ltpayYn', 'giroRglrDvCd',
  ]);

  view.onCellEditable = (grid, index) => {
    if (!gridUtil.isCreatedRow(grid, index.dataRow) && ['wkDt', 'cntrNo'].includes(index.column)) {
      return false;
    }
  };
});

</script>

<style scoped>
</style>
