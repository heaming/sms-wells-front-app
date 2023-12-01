<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaContractRcpQtyMgtM - 계약 접수 수량 관리
3. 작성자 : joonghyung.kim
4. 작성일 : 2023.11.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 계약 접수 수량 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :modified-targets="['cntrRcpQtyGrid']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 상품코드 -->
        <kw-search-item :label="t('MSG_TXT_PRDT_CODE')">
          <kw-input
            v-model="searchParams.pdCd"
            clearable
            icon="search"
            dense
            maxlength="100"
            @click-icon="fetchProduct(1)"
          />
        </kw-search-item>
        <!-- 상품명 -->
        <kw-search-item :label="t('MSG_TXT_PRDT_NM')">
          <kw-input
            v-model="searchParams.pdNm"
            clearable
            maxlength="100"
            :on-keydown-no-click="true"
            @keydown.enter="fetchProduct(2)"
          />
        </kw-search-item>
        <!-- 기준일자 -->
        <kw-search-item :label="t('MSG_TXT_BASE_DT')">
          <kw-date-picker
            v-model="searchParams.vlYyyyMmDd"
            type="date"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 판매유형 -->
        <kw-search-item :label="t('MSG_TXT_SEL_TYPE')">
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="codes.SELL_TP_CD"
          />
        </kw-search-item>
        <!-- 조직 -->
        <kw-search-item
          :label="t('MSG_TXT_OG_CD')"
        >
          <kw-select
            v-model="searchParams.ogTpCd"
            first-option="all"
            :options="codes.OG_TP_CD"
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
        <!-- 삭제 -->
        <kw-btn
          v-permission:delete
          :label="t('MSG_BTN_DEL')"
          grid-action
          @click="onClickDelete"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 행추가 -->
        <kw-btn
          v-permission:create
          grid-action
          :label="t('MSG_BTN_ROW_ADD')"
          @click="onClickRowAdd"
        />
        <!-- 저장 -->
        <kw-btn
          v-permission:update
          grid-action
          :label="t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
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
      </kw-action-top>

      <kw-grid
        ref="gridMainRef"
        name="cntrRcpQtyGrid"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        :visible-rows="pageInfo.pageSize"
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
import { getComponentType, gridUtil, useGlobal, codeUtil, useDataService, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
// import dayjs from 'dayjs';

// const now = dayjs();
const gridMainRef = ref(getComponentType('KwGrid'));
const { notify, modal } = useGlobal();
const { currentRoute } = useRouter();
const { getConfig } = useMeta();
const { t } = useI18n();

const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'OG_TP_CD',
  'PD_TP_CD',
  'MSG_OJ_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  pdCd: '', // 상품코드
  pdNm: '', // 상품명
  vlYyyyMmDd: '', // now.format('YYYYMMDD'), // 기준일자
  sellTpCd: '', // 판매유형
  ogTpCd: '', // 조직코드
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;

// 조회 이벤트
async function fetchData() {
  // console.log(JSON.stringify(cachedParams, null, '\t'));
  const res = await dataService.get('sms/wells/contract/sellqty/paging', { params: cachedParams });
  console.log(JSON.stringify(res.data.list, null, '\t'));
  const view = gridMainRef.value.getView();
  const dataSource = view.getDataSource();
  dataSource.setRows(res.data.list);
  pageInfo.value.totalCount = view.getItemCount();

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 조회 버튼 클릭
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = gridMainRef.value.getView();

  const res = await dataService.get('sms/wells/contract/sellqty/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 삭제 버튼 클릭
async function onClickDelete() {
  const view = gridMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length > 0) {
    const sellLmPdBaseIds = deletedRows.map(({ sellLmPdBaseId }) => sellLmPdBaseId);
    await dataService.post('sms/wells/contract/sellqty/delete', sellLmPdBaseIds);
    notify(t('MSG_ALT_DELETED'));
    await onClickSearch();
  }
}

// 행 추가 버튼 클릭
async function onClickRowAdd() {
  const view = gridMainRef.value.getView();
  const row = view.getCurrent().dataRow < 0 ? '0' : view.getCurrent().dataRow;
  await gridUtil.insertRowAndFocus(view, row, {});

  const data = view.getDataSource();
  data.setValue(row, 'sellTpCd', ''); // 판매구분 default 세팅 - 전체

  view.setFocus();
}

// 저장 버튼 클릭
async function onClickSave() {
  const view = gridMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  for (let i = 0; i < gridUtil.getChangedRowValues(view).length; i += 1) {
    if (gridUtil.getChangedRowValues(view)[i].vlStrtDtm > gridUtil.getChangedRowValues(view)[i].vlEndDtm) {
      notify(t('MSG_ALT_CHK_DT_RLT'));
      return;
    }
  }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('sms/wells/contract/sellqty/save', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

// 상품명 검색아이콘 클릭
async function fetchProduct(gbn) {
  const searchPopupParams = {
    searchType: gbn === 2 ? pdConst.PD_SEARCH_NAME : pdConst.PD_SEARCH_CODE,
    searchValue: gbn === 2 ? searchParams.value.pdNm : searchParams.value.pdCd,
    selectType: pdConst.PD_SEARCH_SINGLE,
  };

  const res = await modal({
    component: 'ZwpdcStandardListP',
    componentProps: searchPopupParams,
  });
  if (res.result && res.payload) {
    searchParams.value.pdNm = res.payload[0].pdNm;
    searchParams.value.pdCd = res.payload[0].pdCd;
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'sellLmPdBaseId' }, // 판매제한상품기준ID
    { fieldName: 'pdTpCd' }, // 상품유형코드
    { fieldName: 'pdCd' }, // 상품코드
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'ogTpCd' }, // 판매구분
    { fieldName: 'sellTpCd' }, // 판매유형
    { fieldName: 'ogCd' }, // 조직 (null이면 ALL로)
    { fieldName: 'vlStrtDtm' }, // 적용시작일시
    { fieldName: 'vlEndDtm' }, // 적용종료일시
    { fieldName: 'msgOjDvCd' }, // 제한수량 - 메시지대상구분코드
    { fieldName: 'sellBaseQty', dataType: 'number' }, // 제한수량
    { fieldName: 'sellAcuQty', dataType: 'number' }, // 접수수량
    { fieldName: 'sellAcuQtyBtn' }, // 접수수량 - 수량확인
    { fieldName: 'msgOjUsrId' }, // 케이톡 발송대상
    { fieldName: 'fwDtm' }, // 케이톡 발송일시
    { fieldName: 'sellLmRsonCn' }, // 비고
    { fieldName: 'fstRgstDtm' }, // 등록일시
    { fieldName: 'fstRgstUsrId' }, // 등록자
    { fieldName: 'fstRgstUsrNm' },
    { fieldName: 'fnlMdfcDtm' }, // 수정일시
    { fieldName: 'fnlMdfcUsrId' }, // 수정자
    { fieldName: 'fnlMdfcUsrNm' },
  ];

  const columns = [
    { fieldName: 'sellLmPdBaseId', visible: false }, // 판매제한상품기준ID
    { fieldName: 'pdTpCd',
      header: t('MSG_TXT_PRDT_TYPE_CD'),
      width: '130',
      styleName: 'text-center',
      options: codes.PD_TP_CD.map((v) => ({ codeId: v.codeId, codeName: `${v.codeId}-${v.codeName}` })),
      editor: { type: 'list' },
    }, // 상품유형코드
    { fieldName: 'pdCd',
      header: t('MSG_TXT_PRDT_CODE'),
      width: '160',
      styleName: 'text-center rg-button-icon--search',
      button: 'action',
      editor: { maxLength: 10 },
      rules: 'required',
      buttonVisibility: 'always',
      // always: 항상 표시, default: hovering, focused상태에서 표시
      // visible: focused상태만 표시, hidden: 표시하지 않음
    }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '220', editable: false }, // 상품명
    { fieldName: 'ogTpCd',
      header: t('MSG_TXT_SLS_CAT'),
      width: '120',
      styleName: 'text-center',
      options: [{ codeId: '', codeName: 'ALL' }].concat(codes.OG_TP_CD),
      editor: { type: 'list' },
      displayCallback(grid, index, value) {
        return isEmpty(value) ? 'ALL' : value;
      },
    }, // 판매구분
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_SELL_TP_CD'),
      width: '120',
      styleName: 'text-center',
      options: codes.SELL_TP_CD.map((v) => ({ codeId: v.codeId, codeName: `${v.codeId}-${v.codeName}` })),
      rules: 'required',
      editor: { type: 'list' } }, // 판매유형코드
    { fieldName: 'ogCd',
      header: t('MSG_TXT_OG'),
      width: '120',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        return isEmpty(value) ? 'ALL' : value;
      },
    },
    { fieldName: 'vlStrtDtm',
      header: '적용시작일시',
      width: '186',
      styleName: 'text-center',
      datetimeFormat: 'datetime',
      rules: 'required',
      editor: { type: 'btdate' },
    }, // 적용시작일시
    { fieldName: 'vlEndDtm',
      header: '적용종료일시 ',
      width: '186',
      styleName: 'text-center',
      datetimeFormat: 'datetime',
      editor: { type: 'btdate' },
    }, // 적용종료일시
    { fieldName: 'msgOjDvCd',
      header: t('MSG_TXT_LM_QTY'),
      width: '100',
      options: codes.MSG_OJ_DV_CD.map((v) => ({ codeId: v.codeId, codeName: `${v.codeId}-${v.codeName}` })),
      editor: { type: 'list' },
      displayCallback(grid, index, value) {
        return isEmpty(value) ? 'A-전체' : value;
      },
    }, // 메시지대상구분코드
    { fieldName: 'sellBaseQty',
      header: t('MSG_TXT_LM_QTY'),
      styleName: 'text-right',
      width: '90',
      numberFormat: '#,###,##0',
    }, // 제한수량
    { fieldName: 'sellAcuQty',
      header: '접수수량',
      width: '90',
      styleName: 'text-right',
      numberFormat: '#,###,##0',
      editable: false,
    }, // 접수수량
    { fieldName: 'sellAcuQtyBtn',
      width: '80',
      styleName: 'text-center',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback() {
        return '수량확인';
      },
    }, // 접수수량 - 버튼
    { fieldName: 'msgOjUsrId', header: 'K-works 발송대상', width: '196' }, /* 케이톡 발송대상 */
    { fieldName: 'fwDtm', header: 'K-works 발송일시', datetimeFormat: 'datetime', width: '186', styleName: 'text-center', editor: { type: 'btdate' } }, // 케이톡 발송일시
    { fieldName: 'sellLmRsonCn', header: t('MSG_TXT_NOTE'), width: '220', styleName: 'text-left' }, // 비고
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DTM'), datetimeFormat: 'datetime', width: '176', styleName: 'text-center', editable: false }, // 동록일자
    { fieldName: 'fstRgstUsrId', visible: false }, // 등록자
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_FST_RGST_USR'), width: '111', styleName: 'text-center', editable: false }, // 등록자
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_MDFC_DTM'), datetimeFormat: 'datetime', width: '176', styleName: 'text-center', editable: false }, // 동록일자
    { fieldName: 'fnlMdfcUsrId', visible: false }, // 수정자
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_MDFC_USR'), width: '111', styleName: 'text-center', editable: false }, // 수정자
  ];

  const layout = [
    'sellLmPdBaseId',
    'pdTpCd',
    'pdCd',
    'pdNm',
    'ogTpCd',
    'sellTpCd',
    'ogCd',
    'vlStrtDtm',
    'vlEndDtm',
    {
      name: 'sellBaseQtyGroup',
      direction: 'horizontal',
      header: { visible: false },
      items: [
        {
          column: 'msgOjDvCd',
          headerSpan: 2,
        },
        'sellBaseQty',
      ],
    },
    {
      name: 'sellAcuQtyGroup',
      direction: 'horizontal',
      header: { visible: false },
      items: [
        {
          column: 'sellAcuQty',
          headerSpan: 2,
        },
        'sellAcuQtyBtn',
      ],
    },
    'msgOjUsrId',
    'fwDtm',
    'sellLmRsonCn',
    'fstRgstDtm',
    'fstRgstUsrId',
    'fstRgstUsrNm',
    'fnlMdfcDtm',
    'fnlMdfcUsrId',
    'fnlMdfcUsrNm',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(layout);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  view.editOptions.editable = true;
  view.setEditOptions({
    insertable: true,
    appendable: true,
  });

  view.onCellItemClicked = async (g, { column, dataRow }) => {
    if (column === 'sellAcuQtyBtn') {
      const sellLmPdBaseId = g.getValue(dataRow, 'sellLmPdBaseId');
      const res = await dataService.get('sms/wells/contract/sellqty/rcpqty', { params: { sellLmPdBaseId } });
      console.log(JSON.stringify(res.data, null, '\t'));
      data.setValue(dataRow, 'sellAcuQty', res.data);
      // data.setValue(dataRow, 'sellAcuQty', sellLmPdBaseId.substr(-5)); // res.data);
    }
  };

  view.onCellButtonClicked = async (g, { itemIndex }) => {
    const updateRow = view.getCurrent().dataRow;
    const searchPopupParams = {
      searchType: pdConst.PD_SEARCH_CODE,
      searchValue: g.getValues(itemIndex).pdCd,
      selectType: '',
    };

    const returnPdInfo = await modal({
      component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
      componentProps: searchPopupParams,
    });

    if (returnPdInfo.result) {
      data.setValue(itemIndex, 'pdCd', '');
      data.setValue(itemIndex, 'pdNm', '');
      data.setValue(updateRow, 'pdCd', returnPdInfo.payload?.[0].pdCd);
      data.setValue(updateRow, 'pdNm', returnPdInfo.payload?.[0].pdNm);
    } else {
      data.setValue(itemIndex, 'pdNm', '');
    }
  };

  view.onCellEdited = async (grid, itemIndex, dataRow, fieldIndex) => {
    const columnName = grid.getColumn(fieldIndex).fieldName;
    if (columnName === 'vlStrtDtm') {
      const { vlStrtDtm, vlEndDtm } = grid.getValues(itemIndex);
      if (vlStrtDtm > vlEndDtm
        && vlStrtDtm && vlEndDtm) {
        grid.commit();
        const updateDateRow = view.getCurrent().dataRow;
        data.setValue(updateDateRow, 'vlEndDtm', vlStrtDtm);
      }
    }
    if (columnName === 'vlEndDtm') {
      const { vlStrtDtm, vlEndDtm } = grid.getValues(itemIndex);
      if (vlStrtDtm > vlEndDtm
        && vlStrtDtm && vlEndDtm) {
        grid.commit();
        const updateDateRow = view.getCurrent().dataRow;
        data.setValue(updateDateRow, 'vlStrtDtm', vlEndDtm);
      }
    }
    if (columnName === 'pdCd') {
      const updateRow = view.getCurrent().dataRow;
      const searchPopupParams = {
        searchType: pdConst.PD_SEARCH_CODE,
        searchValue: grid.getValues(itemIndex).pdCd,
        selectType: '',
      };

      const returnPdInfo = await modal({
        component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
        componentProps: searchPopupParams,
      });

      if (returnPdInfo.result) {
        data.setValue(itemIndex, 'pdCd', '');
        data.setValue(itemIndex, 'pdNm', '');
        data.setValue(updateRow, 'pdCd', returnPdInfo.payload?.[0].pdCd);
        data.setValue(updateRow, 'pdNm', returnPdInfo.payload?.[0].pdNm);
      } else {
        data.setValue(itemIndex, 'pdNm', '');
      }
    }
  };
}
</script>
