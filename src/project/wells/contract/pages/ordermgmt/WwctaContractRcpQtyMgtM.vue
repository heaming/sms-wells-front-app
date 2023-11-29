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
import dayjs from 'dayjs';
import pdConst from '~sms-common/product/constants/pdConst';

const gridMainRef = ref(getComponentType('KwGrid'));
const { notify, modal } = useGlobal();
const { currentRoute } = useRouter();
const { getConfig } = useMeta();
const { t } = useI18n();

const now = dayjs();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'OG_TP_CD',
  'PD_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  pdCd: '', // 상품코드
  pdNm: '', // 상품명
  vlYyyyMmDd: now.format('YYYYMMDD'), // 기준일자
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
  console.log(JSON.stringify(cachedParams, null, '\t'));
  const res = await dataService.get('sms/wells/contract/sellqty/paging', { params: cachedParams });
  console.log(JSON.stringify(res.data, null, '\t'));
  const view = gridMainRef.value.getView();
  const dataSource = view.getDataSource();
  dataSource.setRows(res.data);
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
    await dataService.delete('sms/wells/contract/sales-limits/users', { params: { sellLmPdBaseIds } });
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
  await dataService.post('sms/wells/contract/sales-limits/users', changedRows);

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
    { fieldName: 'pdCd' }, // 상품코드
    { fieldName: 'pdTpCd' }, // 상품유형코드
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'ogTpCd' }, // 판매구분
    { fieldName: 'sellTpCd' }, // 판매유형
    { fieldName: 'ogCd' }, // 조직 (null이면 ALL로)
    { fieldName: 'vlStrtDtm' }, // 적용시작일시
    { fieldName: 'vlEndDtm' }, // 적용종료일시
    { fieldName: 'sellBaseQty' }, // 제한수량
    { fieldName: 'sellAcuQty' }, // 접수수량
    { fieldName: 'msgOjDvCd' }, // 메시지대상구분코드
    { fieldName: 'msgOjUsrId' }, // 케이톡 발송대상
    { fieldName: 'fwDtm' }, // 케이톡 발송일시
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
      width: '180',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        return codes.PD_TP_CD.find((v) => (v.codeId === value))?.codeName || '';
      },
    }, // 상품유형코드
    { fieldName: 'pdCd',
      header: t('MSG_TXT_PRDT_CODE'),
      width: '180',
      styleName: 'text-center rg-button-icon--search',
      button: 'action',
      editor: { maxLength: 10 },
      rules: 'required',
      buttonVisibleCallback(grid, index) {
        return grid.getCurrent().dataRow === index.dataRow;
      },
    }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '220', editable: false }, // 상품명
    { fieldName: 'ogTpCd',
      header: t('MSG_TXT_SLS_CAT'),
      width: '120',
      styleName: 'text-center',
      options: codes.OG_TP_CD,
      editor: { type: 'list' },
    }, // 조직
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
      width: '196',
      styleName: 'text-center',
      datetimeFormat: 'date',
      rules: 'required',
      editor: {
        type: 'btdate',
      },
    }, // 적용시작일시
    { fieldName: 'vlEndDtm',
      header: '적용종료일시 ',
      width: '196',
      styleName: 'text-center',
      datetimeFormat: 'date',
      editor: {
        type: 'btdate',
      },
    }, // 적용종료일시
    { fieldName: 'sellBaseQty', header: t('MSG_TXT_LM_QTY'), styleName: 'text-right' }, // 제한수량
    { fieldName: 'sellAcuQty', header: '접수수량', styleName: 'text-right' }, // 접수수량
    { fieldName: 'msgOjDvCd', header: '메시지대상구분코드', width: '196' }, // 메시지대상구분코드
    { fieldName: 'msgOjUsrId', header: 'K-works 발송대상', width: '196' }, /* 케이톡 발송대상 */
    { fieldName: 'fwDtm', header: 'K-works 발송일시', datetimeFormat: 'date', width: '196', styleName: 'text-center', editable: false }, // 케이톡 발송일시
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DTM'), datetimeFormat: 'date', width: '196', styleName: 'text-center', editable: false }, // 동록일자
    { fieldName: 'fstRgstUsrId', visible: false }, // 등록자
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_FST_RGST_USR'), width: '131', styleName: 'text-center', editable: false }, // 등록자
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_MDFC_DTM'), datetimeFormat: 'date', width: '196', styleName: 'text-center', editable: false }, // 동록일자
    { fieldName: 'fnlMdfcUsrId', visible: false }, // 수정자
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_MDFC_USR'), width: '131', styleName: 'text-center', editable: false }, // 수정자
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  view.editOptions.editable = true;
  view.setEditOptions({
    insertable: true,
    appendable: true,
  });

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
      const pdClsfNm = returnPdInfo.payload?.[0].pdClsfNm.split('>');
      data.setValue(itemIndex, 'pdCd', '');
      data.setValue(itemIndex, 'pdNm', '');
      data.setValue(itemIndex, 'pdMclsfNm', '');
      data.setValue(itemIndex, 'pdLclsfNm', '');
      data.setValue(updateRow, 'pdCd', returnPdInfo.payload?.[0].pdCd);
      data.setValue(updateRow, 'pdNm', returnPdInfo.payload?.[0].pdNm);
      data.setValue(updateRow, 'pdMclsfNm', !isEmpty(pdClsfNm[1]) ? pdClsfNm[1] : '');
      data.setValue(updateRow, 'pdLclsfNm', !isEmpty(pdClsfNm[2]) ? pdClsfNm[2] : '');
    } else {
      data.setValue(itemIndex, 'pdNm', '');
      data.setValue(itemIndex, 'pdMclsfNm', '');
      data.setValue(itemIndex, 'pdLclsfNm', '');
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
