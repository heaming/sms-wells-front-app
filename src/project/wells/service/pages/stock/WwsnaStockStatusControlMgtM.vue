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
      @search="onClickSearch"
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
          />
          <kw-select
            v-model="searchParams.wareNo"
            :options="filterWareNo"
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
            :options="codes.ITM_KND_CD"
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
        </template>
        <!-- 삭제 -->
        <kw-btn
          :label="$t('MSG_TXT_DEL')"
          grid-action
          @click="onClickDeleteRow"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 행추가 -->
        <kw-btn
          :label="$t('MSG_TXT_ROW_SPMT')"
          grid-action
          @click="onClickAddRow"
        />
        <!-- 저장 -->
        <kw-btn
          :label="$t('MSG_TXT_SAVE')"
          grid-action
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
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
import { cloneDeep } from 'lodash-es';
// import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
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

const searchParams = ref({
  wareDvCd: '2',
  wareNo: '',
  itmKnd: '4',
  ogNm: '',
  itmGdCtrTpCd: '',
  itmGdCtrRsonCd: '',
  stFromYmd: dayjs().set('date', 1).format('YYYYMMDD'),
  edToYmd: dayjs().format('YYYYMMDD'),

});

const gridParams = ref({
  wareNo: '',
  itmKnd: '',

});

// const gridItmParams = ref({
//   wareNo: '',
//   itmPdNm: '',

// });

// 품목구분 필터링
const filterCodes = ref({
  filterWareDvCd: [],
  filterItmGdCtrTpCd: [],
});

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

// function setItmKndCellStyle() {
//   const itmGdCtrTpNm = grdMainRef.value.getView().columnByField('itmGdCtrTpNm');

//   itmGdCtrTpNm.editable = true;
//   itmGdCtrTpNm.editor = { type: 'list' };
//   itmGdCtrTpNm.labels = filterCodes.value.filterItmGdCtrTpCd.map((v) => v.codeName);
//   itmGdCtrTpNm.values = filterCodes.value.filterItmGdCtrTpCd.map((v) => v.codeId);
// }

// function setWareNoCellStyle() {
//   const wareNm = grdMainRef.value.getView().columnByField('wareNm');
//   wareNm.editable = true;
//   wareNm.editor = { type: 'list' };
//   wareNm.labels = gridFilterWareNo.value.map((v) => v.codeName);
//   wareNm.values = gridFilterWareNo.value.map((v) => v.codeId);
// }

async function fetchItmPdCd(params) {
  console.log(params);
  return await dataService.get('/sms/wells/service/stock-status-control/product-warehouse', params);
}

// const onChangeItmKnd = async () => {
//   const res = await fetchItmPdCd({ params: searchParams.value });
//   products.value = res.data;
//   console.log(products.value);
//   // console.log(filterItems);
//   // filterCodes.value.filterItmPdCd = filterItems.map((v) => ({ codeId: v.itmPdCd, codeName: v.itmPdNm }));
//   // console.log(filterCodes.value.filterItmPdCd);

//   // setItemPdCdCellStyle();
// };

const onChangeWareNo = async () => {
  const res = await dataService.get(`/sms/wells/service/stock-status-control/organization/${searchParams.value.wareNo}`);
  searchParams.value.ogNm = res.data.ogNm;
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

  // console.log(filterCodes.value.filterOgWareNo);
  // ogWareNo.value = codeData.map((v) => ({ codeId: v.wareNo, codeName: v.wareNm }));
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
  filterCodes.value.filterItmGdCtrTpCd = codes.ITM_GD_CTR_TP_CD;
  // onChangeItmKnd();
} else {
  filterCodes.value.filterItmGdCtrTpCd = codes.MAT_STOC_STAT_CTR_CD;
}

console.log(codes.ITM_GD_CTR_TP_CD);

watch(() => searchParams.value.itmKnd, async (val) => {
  if (val === PD_ITM_KND_CD) {
    filterCodes.value.filterItmGdCtrTpCd = codes.ITM_GD_CTR_TP_CD;
    console.log(filterCodes.value.filterItmGdCtrTpCd);
  } else {
    filterCodes.value.filterItmGdCtrTpCd = codes.MAT_STOC_STAT_CTR_CD;
    console.log(filterCodes.value.filterItmGdCtrTpCd);
  }

  // onChangeItmKnd();
});

let cachedParams;
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/stock-status-control/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: status, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  console.log(status);

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(status);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickAddRow() {
  const view = grdMainRef.value.getView();
  await gridUtil.insertRowAndFocus(view, 0, {
    statCtrApyDt: dayjs().format('YYYYMMDD'),
    itemKnd: searchParams.value.itmKnd,
    wareDvCd: searchParams.value.wareDvCd,
  });
}

async function onClickDeleteRow() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
  }
  // const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  // if (deletedRows.length > 0) {
  //   // const result = await dataService.delete('/sms/wells/service/as-consumables-stores', { data: checkedRows });
  //   if (result.data > 0) {
  //     notify(t('MSG_ALT_SAVE_COMP'));
  //   } else {
  //     notify(t('MSG_ALT_PROC_FAIL'));
  //   }
  // }
}

// async function onChangeGridWareNm() {
//   debugger;
//   const res = await fetchItmPdCd({ params: gridParams.value });
//   products.value = res.data;
//   console.log(products.value);
// }

const onChangeGridWareNm = async () => {
  const res = await fetchItmPdCd({ params: gridParams.value });
  products.value = res.data;
  console.log(products.value);
};

// async function onChangeGridWareNm(grid, dataCell) {
//   debugger;
//   const { wareNm, itemKnd } = grid.getValues(dataCell.index.itemIndex);
//   gridParams.value.wareNo = wareNm;
//   gridParams.value.itmKnd = itemKnd;
//   const res = await fetchItmPdCd({ params: gridParams.value });
//   products.value = res.data;
//   console.log(products.value);
// }

// let returnOpt;
// function setClctamOpt(grid, dataCell) {
//   const ret = {};
//   const { wareNm, itemKnd } = grid.getValues(dataCell.index.itemIndex);

//   if (isEmpty(wareNm)) {
//     returnOpt = [{ codeId: '', codeName: '' }];
//   } else {
//     debugger;
//     gridParams.value.itmKnd = itemKnd;
//     gridParams.value.wareNo = wareNm;
//     onChangeGridWareNm();
//     const gridItemKnd = grid.getValue(dataCell.index.itemIndex, 'itemKnd');
//     console.log(gridItemKnd);
//     const searchItmPdCd = products.value.map((v) => v.codeId);
//     returnOpt = gItmPdCd.value
//       .filter((v) => searchItmPdCd.includes(v.codeId));
//     // .map((v) => v.codeId);
//     console.log(returnOpt);
//   }

//   ret.editor = {
//     type: 'list',
//     textReadOnly: true,
//     // dropDownWhenClick: true,
//     labels: returnOpt?.map((v) => v.codeName),
//     values: returnOpt?.map((v) => v.codeId),
//   };

//   return ret;
// }

// function setABC(grid, itemIndex) {
//   debugger;
//   console.log(grid);
//   console.log(itemIndex);
//   const { wareNm, itemKnd, itmPdNm } = grid.getValues(itemIndex);
//   const res = await dataService.get('/sms/wells/service/stock-status-control/ ')

// }

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
    { fieldName: 'itmGdCtrRsonNm' }, // 조정사유명
    { fieldName: 'ctrSn' }, // 조정일련번호
    { fieldName: 'itmGdCtrTpNm' }, // 상태조정유형

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
      options: gWareNo.value,
      editor: { type: 'list' },
      editable: true,
      styleCallback: (grid, dataCell) => {
        const wareDvCd = grid.getValue(dataCell.index.itemIndex, 'wareDvCd');
        const wareNo = gWareNo.value
          .filter((v) => v.wareDvCd === wareDvCd)
          .map((v) => v.codeId);
        const wareNm = gWareNo.value.filter((v) => v.wareDvCd === wareDvCd)
          .map((v) => v.codeName);
        return { editor: { type: 'list', labels: wareNm, values: wareNo } };
      },
    },
    { fieldName: 'ogNm',
      header: t('MSG_TXT_MGMT_DEPT'),
      width: '150',
    },
    { fieldName: 'itemKnd',
      header: '품목종류',
      styleName: 'text-center',
      width: '150',
      options: codes.ITM_KND_CD,
    },
    { fieldName: 'itmGdCtrTpNm',
      header: t('MSG_TXT_STAT_CTR_TP'),
      styleName: 'text-center',
      width: '150',
      editor: { type: 'list' },
      options: filterCodes.value.filterItmGdCtrTpCd,
      editable: true,
      styleCallback: (grid, dataCell) => {
        const itemKnd = grid.getValue(dataCell.index.itemIndex, 'itemKnd');
        if (itemKnd === '4') {
          const code = codes.ITM_GD_CTR_TP_CD.map((v) => v.codeId);
          const codeNm = codes.ITM_GD_CTR_TP_CD.map((v) => v.codeName);
          return { editor: { type: 'list', labels: codeNm, values: code } };
        }
        const codeId = codes.MAT_STOC_STAT_CTR_CD.map((v) => v.codeId);
        const codeNm = codes.MAT_STOC_STAT_CTR_CD.map((v) => v.codeName);
        return { editor: { type: 'list', labels: codeNm, values: codeId } };
      },
    },
    { fieldName: 'ctrWkDt', header: '상태조정작업일 ', styleName: 'text-center', width: '150', datetimeFormat: 'date' },
    { fieldName: 'statCtrApyDt', header: '조정적용일자', styleName: 'text-center', width: '150', datetimeFormat: 'date' },
    { fieldName: 'sapCd', header: 'SAP코드', styleName: 'text-center', width: '150' },
    { fieldName: 'itmPdCd',
      header: '품목코드',
      styleName: 'text-center',
      width: '150',
    },
    { fieldName: 'itmPdNm',
      header: '품목명',
      styleName: 'text-center',
      width: '200',
      editor: { type: 'list' },
      editable: true,
      // styleCallback: (grid, dataCell) => setClctamOpt(grid, dataCell),
      styleCallback: async (grid, dataCell) => {
        const gridItemKnd = grid.getValue(dataCell.index.itemIndex, 'itemKnd');
        console.log(gridItemKnd);
        debugger;
        const { wareNm, itemKnd } = grid.getValues(dataCell.index.itemIndex);
        gridParams.value.itmKnd = itemKnd;
        gridParams.value.wareNo = wareNm;
        await onChangeGridWareNm();
        // onChangeGridWareNm(grid, dataCell);
        const searchItmPdCd = products.value.map((v) => v.codeId);
        const gridItmPdCd = gItmPdCd.value
          .filter((v) => searchItmPdCd.includes(v.codeId))
          .map((v) => v.codeId);
        const gridItmPdNm = gItmPdCd.value
          .filter((v) => searchItmPdCd.includes(v.codeId))
          .map((v) => v.codeName);
        return { editor: { type: 'list', labels: gridItmPdNm, values: gridItmPdCd } };
      },
      // styleCallback: (grid, dataCell) => {
      //   const ret = {};
      //   const gridItemKnd = grid.getValue(dataCell.index.itemIndex, 'itemKnd');
      //   console.log(gridItemKnd);
      //   debugger;
      //   const { wareNm, itemKnd } = grid.getValues(dataCell.index.itemIndex);
      //   gridParams.value.itmKnd = itemKnd;
      //   gridParams.value.wareNo = wareNm;
      //   onChangeGridWareNm();
      //   // onChangeGridWareNm(grid, dataCell);
      //   const searchItmPdCd = products.value.map((v) => v.codeId);
      //   const gridItmPdCd = gItmPdCd.value
      //     .filter((v) => searchItmPdCd.includes(v.codeId));
      //     // .map((v) => v.codeId);
      //   const gridItmPdNm = gItmPdCd.value
      //     .filter((v) => searchItmPdCd.includes(v.codeId));
      //     // .map((v) => v.codeName);
      //   ret.editor = {
      //     type: 'list',
      //     textReadOnly: true,
      //     // dropDownWhenClick: true,
      //     labels: gridItmPdNm.map((v) => v.codeName),
      //     values: gridItmPdCd.map((v) => v.codeId),
      //   };
      //   return ret;

      //   // return { editor: { type: 'list', labels: gridItmPdNm, values: gridItmPdCd } };
      // },
    },
    { fieldName: 'bfctNomStocAGdQty', header: 'A등급', styleName: 'text-right', width: '99' },
    { fieldName: 'bfctNomStocEGdQty', header: 'E등급', styleName: 'text-right', width: '99' },
    { fieldName: 'bfctNomStocRGdQty', header: 'R등급', styleName: 'text-right', width: '99' },
    { fieldName: 'bfctItmGdCd', header: '조정전등급', styleName: 'text-center', width: '99' },
    { fieldName: 'afctItmGdCd', header: '조정후등급', styleName: 'text-center', width: '99' },
    { fieldName: 'ctrQty', header: '조정수량', styleName: 'text-right', width: '99' },
    { fieldName: 'itmGdCtrRsonNm', header: '조정사유', styleName: 'text-left', width: '99' },
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
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  // view.onCellEdited = async (grid, itemIndex, row, field) => {
  //   const { wareDvCd, wareNm, itemKnd, itmPdNm, itmGdCtrTpNm } = grid.getValues(itemIndex);
  //   console.log(wareDvCd);
  //   console.log(wareNm);
  //   console.log(itemKnd);
  //   console.log(itmPdNm);
  //   console.log(itmGdCtrTpNm);
  //   console.log(row);
  //   console.log(field);

  //   // const changedFieldName = grid.getDataSource().getOrgFieldName(field);

  //   // const checkedValue = gridUtil.getRowValue(view, row);

  //   // if (changedFieldName === 'itmPdNm') {
  //   //   // setABC(grid, itemIndex);
  //   // }
  //   // console.log(checkedValue);
  //   // if (changedFieldName === 'wareNm') {
  //   //   console.log(wareNm);
  //   //   gridParams.value.itmKnd = itemKnd;
  //   //   gridParams.value.wareNo = wareNm;
  //   //   onChangeGridWareNm();
  //   //   debugger;
  //   //   const searchItmPdCd = products.value.map((v) => v.codeId);
  //   //   const searchWareNo = products.value.map((v) => v.wareNo);
  //   //   const gridItmPdCd = gItmPdCd.value
  //   //     .filter((v) => (v.wareNm === searchWareNo && searchItmPdCd.includes(v.codeId)))
  //   //     .map((v) => v.codeId);
  //   //   const gridItmPdNm = gItmPdCd.value
  //   //     .filter((v) => (v.wareNm === searchWareNo && searchItmPdCd.includes(v.codeId)))
  //   //     .map((v) => v.codeName);
  //   //   return { editor: { type: 'list', labels: gridItmPdNm, values: gridItmPdCd } };
  //   // }
  //   // debugger;
  //   // if (changedFieldName === 'wareDvCd') {
  //   //   const gridWareDvCd = wareDvCd;
  //   //   console.log(gridWareDvCd);
  //   //   onChangeWareNm(gridWareDvCd);
  //   // }
  // };

  view.onCellEditable = (grid, index) => {
    if (!gridUtil.isCreatedRow(grid, index.dataRow) && ['wareNm', 'itmGdCtrTpNm', 'itmPdNm'].includes(index.column)) {
      return false;
    }
  };
});

onMounted(async () => {
  onChangeWareDvCd();
});
</script>

<style scoped>
</style>
