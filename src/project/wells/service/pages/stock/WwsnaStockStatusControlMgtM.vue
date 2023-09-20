<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaStockStatusControlMgtM - 재고상태조정 관리
3. 작성자 : songTaeSung
4. 작성일 : 2023.07.11
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 입고상세내역 조회 (http://localhost:3000/#/service/wwsna-stock-status-control-mgt)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :modified-targets="['grdMain']"
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <!-- 입고희망일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_STR_HOP_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.stFromYmd"
            v-model:to="searchParams.edToYmd"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <!-- 창고구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_WARE_DV')"
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :options="filterCodes.filterWareDvCd"
            :disable="isAddRow"
          />
          <kw-select
            v-model="searchParams.wareNo"
            :disable="isAddRow"
            :options="filterWareNo"
            @change="onChangeFilterWareNo"
          />
        </kw-search-item>
        <!-- 관리부서 -->
        <kw-search-item
          :label="$t('MSG_TXT_MGMT_DEPT')"
        >
          <kw-input
            v-model="searchParams.ogNm"
            :disable="true"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!-- 품목종류 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_KND')"
        >
          <kw-select
            v-model="searchParams.itmKnd"
            :disable="isAddRow"
            :options="codes.ITM_KND_CD"
            @change="onChangeItmKndCd"
          />
        </kw-search-item>
        <!-- 상태조정유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_STAT_CTR_TP')"
        >
          <kw-select
            v-model="searchParams.itmGdCtrTpCd"
            :options="filterCodes.filterItmGdCtrTpCd"
            first-option="all"
          />
        </kw-search-item>
        <!-- 상태조정사유 -->
        <kw-search-item
          :label="$t('MSG_TXT_STAT_CTR_RSON')"
        >
          <kw-select
            v-model="searchParams.itmGdCtrRsonCd"
            :options="codes.CTR_RSON_CD"
            first-option="all"
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
          <span class="ml8">{{ t('MSG_TXT_UNIT_EA') }}</span>
        </template>
        <!-- 삭제 -->
        <kw-btn
          v-permission:delete
          :label="$t('MSG_TXT_DEL')"
          grid-action
          :disable="isSearch"
          @click="onClickDeleteRow"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 행추가 -->
        <kw-btn
          v-permission:create
          :label="$t('MSG_TXT_ROW_SPMT')"
          grid-action
          :disable="isSearch"
          @click="onClickAddRow"
        />
        <!-- 저장 -->
        <kw-btn
          v-permission:update
          :label="$t('MSG_TXT_SAVE')"
          grid-action
          :disable="isSearch"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :disable="isSearch"
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
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
import { defineGrid, getComponentType, useMeta, codeUtil, useDataService, gridUtil, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty, isUndefined, isNull } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const dataService = useDataService();
const { notify } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'WARE_DV_CD', // 창고구분코드
  'ITM_GD_CTR_TP_CD', // 상품등급조정유형
  'MAT_STOC_STAT_CTR_CD',
  'ITM_KND_CD', // 품목구분코드
  'CTR_RSON_CD', // 상태조정사유
);

const PD_ITM_KND_CD = '4';
const products = ref([]);
const filterWareNo = ref([]);
const gridFilterWareNo = ref([]);
const isSearch = ref(true);
const isAddRow = ref(false);

const searchParams = ref({
  wareDvCd: '2',
  wareNo: '',
  itmKnd: '4',
  ogNm: '',
  itmGdCtrTpCd: '',
  itmGdCtrRsonCd: '',
  stFromYmd: dayjs().set('date', 1).format('YYYYMMDD'),
  edToYmd: dayjs().format('YYYYMMDD'),
  itmPdCd: '',

});

// 품목구분 필터링
const filterCodes = ref({
  filterWareDvCd: [],
  filterItmGdCtrTpCd: [],
});

const itmGdCtrTpCds = ref([]);

codes.WARE_DV_CD.forEach((e) => {
  if (e.codeId === '2' || e.codeId === '3') {
    filterCodes.value.filterWareDvCd.push({
      codeId: e.codeId.trim(),
      codeName: e.codeName.trim(),
    });
  }
});

const gItmPdCd = ref([]);
async function fetchAllItmPdCd(params) {
  return await dataService.get('/sms/wells/service/stock-status-control/product', params);
}

async function getAllItmPdCd() {
  const res = await fetchAllItmPdCd({ params: { itmKnd: '' } });
  gItmPdCd.value = res.data;
}

await getAllItmPdCd();

const gWareNo = ref([]);
async function fetchAllWareNo(params) {
  return await dataService.get('/sms/wells/service/stock-status-control/stocks', params);
}

// const gWareNo = (await fetchAllWareNo({ params: { wareDvCd: '' } })).data;

async function getAllWareNo() {
  const res = await fetchAllWareNo({ params: { wareDvCd: '' } });
  gWareNo.value = res.data;
}

await getAllWareNo();

async function fetchItmPdCd(params) {
  return await dataService.get('/sms/wells/service/stock-status-control/product-warehouse', params);
}

async function onChangeFilterWareNo() {
  const res = await fetchItmPdCd({ params: searchParams.value });
  products.value = res.data;
}

await onChangeFilterWareNo();

const optionOgNm = ref();
const onChangeWareNo = async () => {
  const res = await dataService.get(`/sms/wells/service/stock-status-control/organization/${searchParams.value.wareNo}`);
  optionOgNm.value = res.data;
  searchParams.value.ogNm = optionOgNm.value.ogNm;
  // onChangeItmKnd();
};

watch(() => searchParams.value.wareNo, (val) => {
  if (searchParams.value.wareNo !== val) {
    searchParams.value.wareNo = val;
  }
  onChangeWareNo();
});

// 창고구분변경시
const onChangeWareDvCd = async () => {
  const res = await dataService.get('/sms/wells/service/stock-status-control/stocks', { params: searchParams.value });
  filterWareNo.value = res.data;
  gridFilterWareNo.value = res.data;

  searchParams.value.wareNo = filterWareNo.value[0].codeId;

  onChangeWareNo();
};

await onChangeWareDvCd();

watch(() => searchParams.value.wareDvCd, (val) => {
  if (searchParams.value.wareDvCd !== val) {
    searchParams.value.wareDvCd = val;
  }
  onChangeWareDvCd();
});

if (searchParams.value.itmKnd === PD_ITM_KND_CD) {
  filterCodes.value.filterItmGdCtrTpCd = [];
  filterCodes.value.filterItmGdCtrTpCd = codes.ITM_GD_CTR_TP_CD;
} else {
  filterCodes.value.filterItmGdCtrTpCd = [];
  filterCodes.value.filterItmGdCtrTpCd = codes.MAT_STOC_STAT_CTR_CD;
}

watch(() => searchParams.value.itmKnd, async (val) => {
  if (val === PD_ITM_KND_CD) {
    filterCodes.value.filterItmGdCtrTpCd = [];
    filterCodes.value.filterItmGdCtrTpCd = codes.ITM_GD_CTR_TP_CD;
  } else {
    filterCodes.value.filterItmGdCtrTpCd = [];
    filterCodes.value.filterItmGdCtrTpCd = codes.MAT_STOC_STAT_CTR_CD;
  }
});

function setitmGdCtrTpCdsCellStyle() {
  const itmGdCtrTpCd = grdMainRef.value.getView().columnByField('itmGdCtrTpNm');

  itmGdCtrTpCd.editable = true;
  itmGdCtrTpCd.editor = { type: 'list' };
  itmGdCtrTpCd.labels = itmGdCtrTpCds.value.map((v) => v.codeName);
  itmGdCtrTpCd.values = itmGdCtrTpCds.value.map((v) => v.codeId);
}

function onChangeItmKndCd(itmKnd) {
  if (itmKnd === PD_ITM_KND_CD) {
    itmGdCtrTpCds.value = codes.ITM_GD_CTR_TP_CD;
  } else {
    itmGdCtrTpCds.value = codes.MAT_STOC_STAT_CTR_CD;
  }

  setitmGdCtrTpCdsCellStyle();
}

function isBlank(val) {
  return isUndefined(val) || isNull(val) || val === '';
}

let cachedParams;
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/stock-status-control/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: status, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(status);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

const product = ref([]);
async function fetchProduct() {
  product.value = [];
  const res = await dataService.get('/sms/wells/service/stock-status-control/status-product', { params: { ...cachedParams } });
  product.value = res.data;
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  isSearch.value = false;
  isAddRow.value = false;
  cachedParams = cloneDeep(searchParams.value);
  await fetchProduct();
  await fetchData();
}

function onClickReset() {
  isSearch.value = true;
  isAddRow.value = false;
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/stock-status-control/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    checkBar: 'hidden',
    exportData: res.data,
  });
}

async function onClickAddRow() {
  const view = grdMainRef.value.getView();
  const { itmKnd, wareDvCd, wareNo, ogNm } = cachedParams;
  const wareNoInfo = filterWareNo.value.find((e) => e.codeId === wareNo);
  isAddRow.value = true;
  await gridUtil.insertRowAndFocus(view, 0, {
    statCtrApyDt: dayjs().format('YYYYMMDD'),
    itemKnd: itmKnd,
    wareDvCd,
    wareNo,
    wareNm: isEmpty(wareNoInfo) ? '' : wareNoInfo.codeName,
    ogNm,
  });
}

// 삭제버튼 클릭 이벤트
async function onClickDeleteRow() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (isEmpty(checkedRows)) {
    notify(t('MSG_ALT_DEL_NO_DATA'));
    return;
  }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (!isEmpty(deletedRows)) {
    const res = await dataService.delete('/sms/wells/service/stock-status-control', { data: deletedRows });
    const { processCount } = res.data;
    if (processCount > 0) {
      notify(t('MSG_ALT_DELETED'));
      await fetchData();
    }
  }
}

// 저장버튼 클릭 이벤트
async function onClickSave() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (gridUtil.getCheckedRowValues(view).length === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return;
  }

  if (!(await gridUtil.validate(view, { isCheckedOnly: true }))) { return; }

  for (let i = 0; i < checkedRows.length; i += 1) {
    const checkedItmPdNm = checkedRows[i].itmPdNm;
    const checkedCtrQty = checkedRows[i].ctrQty;
    const checkedItmGdCtrTpNm = checkedRows[i].itmGdCtrTpNm;
    const checkedItmGdCtrRsonNm = checkedRows[i].itmGdCtrRsonNm;

    if (isEmpty(checkedItmPdNm) || isBlank(checkedCtrQty)
    || isEmpty(checkedItmGdCtrTpNm) || isEmpty(checkedItmGdCtrRsonNm)) {
      notify(t('MSG_ALT_MISSING_VALUE_PLEASE_CHECK'));
      return;
    }
  }

  await dataService.post('/sms/wells/service/stock-status-control', checkedRows);

  notify(t('MSG_ALT_SAVE_DATA'));

  await fetchData();
}

async function fetchItmQty(grid, itemIndex, itmPdCd) {
  cachedParams.itmPdCd = itmPdCd;
  const res = await dataService.get('/sms/wells/service/stock-status-control/product-qty', { params: { ...cachedParams } });
  const itmQty = res.data;

  const pitmStocAGdQty = isEmpty(itmQty.pitmStocAGdQty) ? '0' : itmQty.pitmStocAGdQty;
  const pitmStocEGdQty = isEmpty(itmQty.pitmStocEGdQty) ? '0' : itmQty.pitmStocEGdQty;
  const pitmStocRGdQty = isEmpty(itmQty.pitmStocRGdQty) ? '0' : itmQty.pitmStocRGdQty;
  const mgtUnit = isEmpty(itmQty.mgtUnit) ? '' : itmQty.mgtUnit;

  grid.setValue(itemIndex, 'bfctNomStocAGdQty', pitmStocAGdQty);
  grid.setValue(itemIndex, 'bfctNomStocEGdQty', pitmStocEGdQty);
  grid.setValue(itemIndex, 'bfctNomStocRGdQty', pitmStocRGdQty);
  grid.setValue(itemIndex, 'mgtUnit', mgtUnit);
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'wareNo' }, // 창고번호
    { fieldName: 'wareDvCd' }, // 창고구분코드
    { fieldName: 'wareNm' }, // 창고명
    { fieldName: 'ogNm' }, // 관리부서
    { fieldName: 'wareMngtPrtnrNo' }, // 창고관리파트너번호
    { fieldName: 'itemKnd' }, // 품목종류
    { fieldName: 'ctrWkDt' }, // 조정작업일자
    { fieldName: 'statCtrApyDt' }, // 상태조정일자
    { fieldName: 'sapCd' }, // sap코드
    { fieldName: 'itmPdCd' }, // 품목상품코드
    { fieldName: 'itmPdNm' }, // 품목상품명
    { fieldName: 'mgtUnit' }, // 관리단위
    { fieldName: 'bfctNomStocAGdQty', dataType: 'number' }, // 조정전정상재고A등급수량
    { fieldName: 'bfctNomStocEGdQty', dataType: 'number' }, // 조정전정상재고E등급수량
    { fieldName: 'bfctNomStocRGdQty', dataType: 'number' }, // 조정전정상재고R등급수량
    { fieldName: 'bfctItmGdCd' }, // 조정전품목등급코드
    { fieldName: 'afctItmGdCd' }, // 조정후품목등급코드
    { fieldName: 'ctrQty', dataType: 'number' }, // 조정수량
    { fieldName: 'itmGdCtrRsonCd' }, // 조정사유코드
    { fieldName: 'itmGdCtrRsonNm' }, // 조정사유명
    { fieldName: 'ctrSn' }, // 조정일련번호
    { fieldName: 'itmGdCtrTpCd' }, // 상태조정유형코드
    { fieldName: 'itmGdCtrTpNm' }, // 상태조정유형
    { fieldName: 'rmkCn' }, // 비고

  ];

  const columns = [
    { fieldName: 'wareNo',
      header: {
        text: t('MSG_TXT_WARE_MNGT_NO'),
      },
      styleName: 'text-center',
      width: '150',
    },
    { fieldName: 'wareDvCd',
      header: {
        text: t('MSG_TXT_WARE_DV'),
        styleName: 'essential',
      },
      styleName: 'text-center',
      width: '150',
      options: filterCodes.value.filterWareDvCd,
    },
    { fieldName: 'wareNm',
      header: {
        text: t('MSG_TXT_WARE_NM'),
        styleName: 'essential',
      },
      width: '200',
      styleName: 'text-center',
      editor: { type: 'dropdown' },
      options: filterWareNo.value,
    },
    { fieldName: 'ogNm',
      header: t('MSG_TXT_MGMT_DEPT'),
      width: '150',
    },
    { fieldName: 'itemKnd',
      header: t('MSG_TXT_ITM_KND'),
      styleName: 'text-center',
      width: '150',
      options: codes.ITM_KND_CD,
    },
    { fieldName: 'itmGdCtrTpNm',
      header: {
        text: t('MSG_TXT_STAT_CTR_TP'),
        styleName: 'essential',
      },
      styleName: 'text-center',
      width: '150',
      editor: { type: 'list' },
      options: itmGdCtrTpCds.value,
      editable: true,
    },
    { fieldName: 'ctrWkDt', header: t('MSG_TXT_STAT_CTR_WK_D'), styleName: 'text-center', width: '150', datetimeFormat: 'date' },
    { fieldName: 'statCtrApyDt', header: t('MSG_TXT_CTR_APY_DT'), styleName: 'text-center', width: '150', datetimeFormat: 'date' },
    { fieldName: 'sapCd', header: t('MSG_TXT_SAPCD'), styleName: 'text-center', width: '150' },
    { fieldName: 'itmPdCd',
      header: t('TXT_MSG_AS_ITM_CD'),
      styleName: 'text-center',
      width: '150',
    },
    { fieldName: 'itmPdNm',
      header: {
        text: t('MSG_TXT_ITM_NM'),
        styleName: 'essential',
      },
      styleName: 'text-center',
      width: '200',
      editable: true,
      editor: { type: 'dropdown' },
      options: product.value,
      styleCallback: (grid, dataCell) => {
        const { wareNo } = grid.getValues(dataCell.index.itemIndex);
        const pdNms = product.value.filter((v) => wareNo.includes(v.wareNo)).map((v) => v.codeName);

        return { editor: { type: 'dropdown', labels: pdNms, values: pdNms } };
      },
    },
    { fieldName: 'bfctNomStocAGdQty', header: t('MSG_TXT_A_GRADE'), styleName: 'text-right', width: '99' },
    { fieldName: 'bfctNomStocEGdQty', header: t('MSG_TXT_E_GD'), styleName: 'text-right', width: '99' },
    { fieldName: 'bfctNomStocRGdQty', header: t('MSG_TXT_R_GD'), styleName: 'text-right', width: '99' },
    { fieldName: 'bfctItmGdCd', header: t('MSG_TXT_CTR_BF_GD'), styleName: 'text-center', width: '99' },
    { fieldName: 'afctItmGdCd', header: t('MSG_TXT_CTR_AF_GD'), styleName: 'text-center', width: '99' },
    { fieldName: 'ctrQty',
      header: {
        text: t('MSG_TXT_CTR_QTY'),
        styleName: 'essential',
      },
      styleName: 'text-right',
      width: '99',
      editable: true,
    },
    { fieldName: 'itmGdCtrRsonNm',
      header: {
        text: t('MSG_TXT_CTR_RSON'),
        styleName: 'essential',
      },
      styleName: 'text-left',
      width: '99',
      editable: true,
      editor: {
        type: 'dropdown' },
      options: codes.CTR_RSON_CD,
    },
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_NOTE'),
      styleName: 'text-center',
      width: '99',
      editable: true },
    { fieldName: 'mgtUnit' },
  ];

  const columnLayout = [
    'wareNo',
    'wareDvCd',
    'wareNm',
    'ogNm',
    'itemKnd',
    'itmGdCtrTpNm',
    'ctrWkDt',
    'statCtrApyDt',
    'sapCd',
    'itmPdCd',
    'itmPdNm',
    {
      header: t('MSG_TXT_STAT_BFCT_STOC_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['bfctNomStocAGdQty', 'bfctNomStocEGdQty', 'bfctNomStocRGdQty'],
    },
    {
      header: t('MSG_TXT_STAT_CTR_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['bfctItmGdCd', 'afctItmGdCd', 'ctrQty'],
    },
    'itmGdCtrRsonNm',
    'rmkCn',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.onCellEdited = async (grid, itemIndex, row, field) => {
    const { itmGdCtrTpNm } = grid.getValues(itemIndex);

    const changedFieldName = grid.getDataSource().getOrgFieldName(field);

    if (changedFieldName === 'itmGdCtrTpNm') {
      if (['11', '12', '16', '21', '26', '31', '36'].includes(itmGdCtrTpNm)) {
        // eslint-disable-next-line max-len
        const itmGdCtrTpCd03 = codes.ITM_GD_CTR_TP_CD.filter((v) => (v.codeId === itmGdCtrTpNm)).map((v) => v.userDfn03);
        // eslint-disable-next-line max-len
        const itmGdCtrTpCd04 = codes.ITM_GD_CTR_TP_CD.filter((v) => (v.codeId === itmGdCtrTpNm)).map((v) => v.userDfn04);
        grid.setValue(itemIndex, 'bfctItmGdCd', itmGdCtrTpCd03);
        grid.setValue(itemIndex, 'afctItmGdCd', itmGdCtrTpCd04);
      } else {
        // eslint-disable-next-line max-len
        const matStocStatCtrCd03 = codes.MAT_STOC_STAT_CTR_CD.filter((v) => (v.codeId === itmGdCtrTpNm)).map((v) => v.userDfn03);
        // eslint-disable-next-line max-len
        const matStocStatCtrCd04 = codes.MAT_STOC_STAT_CTR_CD.filter((v) => (v.codeId === itmGdCtrTpNm)).map((v) => v.userDfn04);
        grid.setValue(itemIndex, 'bfctItmGdCd', matStocStatCtrCd03);
        grid.setValue(itemIndex, 'afctItmGdCd', matStocStatCtrCd04);
      }
    } else if (changedFieldName === 'wareNm') {
      const { wareNm } = grid.getValues(itemIndex);
      grid.setValue(itemIndex, 'wareNo', wareNm);
    } else if (changedFieldName === 'itmPdNm') {
      const { itmPdNm } = grid.getValues(itemIndex);
      const item = product.value.find((e) => e.codeName === itmPdNm);
      const itmPdCd = isEmpty(item) ? '' : item.codeId;
      grid.setValue(itemIndex, 'itmPdCd', itmPdCd);
      await fetchItmQty(grid, itemIndex, itmPdCd);
    } else if (changedFieldName === 'ctrQty') {
      const { ctrQty, bfctNomStocAGdQty, bfctNomStocEGdQty, bfctNomStocRGdQty,
        bfctItmGdCd } = grid.getValues(itemIndex);

      let chk = 0;
      if (bfctItmGdCd === 'A' || isEmpty(bfctItmGdCd)) {
        if (Number(bfctNomStocAGdQty) < Number(ctrQty)) {
          grid.setValue(itemIndex, 'ctrQty', '');
          chk = 1;
        } else if (isBlank(bfctNomStocAGdQty)) {
          grid.setValue(itemIndex, 'ctrQty', '');
          chk = 1;
        }
      } else if (bfctItmGdCd === 'E' || isEmpty(bfctItmGdCd)) {
        if (Number(bfctNomStocEGdQty) < Number(ctrQty)) {
          grid.setValue(itemIndex, 'ctrQty', '');
          chk = 1;
        } else if (isBlank(bfctNomStocEGdQty)) {
          grid.setValue(itemIndex, 'ctrQty', '');
          chk = 1;
        }
      } else if (bfctItmGdCd === 'R' || isEmpty(bfctItmGdCd)) {
        if (Number(bfctNomStocRGdQty) < Number(ctrQty)) {
          grid.setValue(itemIndex, 'ctrQty', '');
          chk = 1;
        } else if (isBlank(bfctNomStocRGdQty)) {
          grid.setValue(itemIndex, 'ctrQty', '');
          chk = 1;
        }
      } else if (bfctItmGdCd === '정상' || isEmpty(bfctItmGdCd)) {
        if (Number(bfctNomStocAGdQty) < Number(ctrQty)) {
          grid.setValue(itemIndex, 'ctrQty', '');
          chk = 1;
        } else if (isBlank(bfctNomStocAGdQty)) {
          grid.setValue(itemIndex, 'ctrQty', '');
          chk = 1;
        }
      } else if (bfctItmGdCd === '불량' || isEmpty(bfctItmGdCd)) {
        if (Number(bfctNomStocEGdQty) < Number(ctrQty)) {
          grid.setValue(itemIndex, 'ctrQty', '');
          chk = 1;
        } else if (isBlank(bfctNomStocEGdQty)) {
          grid.setValue(itemIndex, 'ctrQty', '');
          chk = 1;
        }
      }
      if (chk === 1) {
        // 조정 전 재고가 조정수량보다 작습니다.
        notify(t('MSG_ALT_CTR_STOC_CTR_QTY_SMALL'));
      }
    }
  };

  view.onCellEditable = (grid, index) => {
    if (!gridUtil.isCreatedRow(grid, index.dataRow) && ['wareNm', 'itmGdCtrTpNm', 'itmPdNm', 'itmGdCtrRsonNm', 'ctrQty', 'rmkCn'].includes(index.column)) {
      return false;
    }
  };
});

onMounted(async () => {
  onChangeWareDvCd();
  onChangeItmKndCd('4');
});
</script>

<style scoped>
</style>
