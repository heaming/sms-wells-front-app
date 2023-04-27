<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CMA
2. 프로그램 ID : WwsnaMaterialsAssignStockMgtM - 물량배정 입고창고관리(W-SV-U-0125M01)
3. 작성자 : inho.choi
4. 작성일 : 2023.01.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 물량배정 입고창고 정보 조회 (사번/이름/소속/빌딩/상위창고)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
      @reset="searchDefaultCondition"
    >
      <!-- TODO: 초기화 버튼클릭시 기본조건 셋팅
                 @reset="searchDefaultCondition" (공통기능으로 되지않음.)
      -->
      <kw-search-row>
        <!-- 기준년월 -->
        <kw-search-item :label="$t('MSG_TXT_BASE_YM')">
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
          />
        </kw-search-item>
        <!-- //기준년월 -->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.baseYm"
          v-model:end-ym="searchParams.baseYm"
          v-model:options-ware-dv-cd="wareDvCd"
          v-model:ware-dv-cd="searchParams.wareDvCd"
          v-model:ware-no-m="searchParams.hgrWareNo"
          v-model:ware-no-d="searchParams.wareNo"
          name="wareSearchGroup"
          :colspan="2"
          :label1="$t('MSG_TXT_STR_DT')"
          :label2="$t('MSG_TXT_WARE')"
          :label3="$t('MSG_TXT_HGR_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          sub-first-option="all"
        />
      </kw-search-row>
      <kw-search-row>
        <!-- 창고상세구분 -->
        <kw-search-item :label="$t('MSG_TXT_WARE_DTL_DV')">
          <kw-select
            v-model="searchParams.wareDtlDvCd"
            :options="codes.WARE_DTL_DV_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- //창고상세구분 -->
        <!-- 담당자명 -->
        <kw-search-item
          :label="$t('MSG_TXT_PIC_NM')"
        >
          <kw-input
            v-model="searchParams.prtnrKnm"
            :disable="searchParams.wareNo.length > 0"
          />
        </kw-search-item>
        <!-- //담당자명 -->
        <!-- 사번 -->
        <kw-search-item
          :label="$t('MSG_TXT_EPNO')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            :disable="searchParams.wareNo.length > 0"
          />
        </kw-search-item>
        <!-- //사번 -->
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
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          dense
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        />
        <kw-btn
          v-permission:download
          dense
          icon="excel"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="pageInfo.pageSize"
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
import { codeUtil, useDataService, getComponentType, useMeta, defineGrid, gridUtil, useGlobal } from 'kw-lib';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { modal, notify } = useGlobal();
const dataService = useDataService();
const { getConfig } = useMeta();
const baseURI = '/sms/wells/service/materials-assign-stocks';
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'WARE_DTL_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'COD_YN',
);

const wareDvCd = { WARE_DV_CD: [
  { codeId: '3', codeName: '영업센터' },
] };

let cachedParams;

const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'),
  ogId: '',
  prtnrNo: '',
  prtnrKnm: '',
  hgrWareNo: '',
  wareNo: '',
  wareDvCd: '3',
  wareDtlDvCd: '',
});

const grdMainRef = ref(getComponentType('KwGrid'));

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const res = await dataService.get(baseURI, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: searchData, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const datasSource = view.getDataSource();
  datasSource.setRows(searchData);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseURI}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'qomAsnStrWareMgt',
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const saveList = gridUtil.getChangedRowValues(view, false)
    .map((v) => ({ prtnrNo: v.prtnrNo, qomAsnApyYn: v.qomAsnApyYn, ogTpCd: v.ogTpCd }));

  view.editOptions.editable = false;

  await dataService.post(baseURI, saveList);
  await fetchData();
}

function searchDefaultCondition() {
  searchParams.value.baseYm = dayjs().format('YYYYMM');
  searchParams.value.ogId = '';
  searchParams.value.prtnrNo = '';
  searchParams.value.prtnrKnm = '';
  searchParams.value.hgrWareNo = '';
  searchParams.value.wareNo = '';
  searchParams.value.wareDvCd = '3';
  searchParams.value.wareDtlDvCd = '';
}

async function onCellClickedPrtnrNo() {
  const { result: isChanged } = await modal({
    component: 'WwsnaWarehouseOrganizationRegP',
  });

  if (isChanged) {
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

onMounted(() => {
  // searchDefaultCondition();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'wareDtlDvNm', header: t('MSG_TXT_WARE_DTL_DV'), width: '140', styleName: 'text-left' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '80', styleName: 'rg-button-link', renderer: { type: 'button' } },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '70', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '120', styleName: 'text-center' },
    { fieldName: 'bldCd', header: t('MSG_TXT_BLD_CD'), width: '70', styleName: 'text-center' },
    { fieldName: 'hgrWareNm', header: t('MSG_TXT_HGR_WARE'), width: '120', styleName: 'text-left' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BUILDING'), width: '120', styleName: 'text-left' },
    { fieldName: 'qomAsnApyYn',
      header: t('MSG_TXT_QOM_ASN_APY_YN'),
      width: '70',
      styleName: 'text-center',
      editor: { type: 'list' },
      options: codes.COD_YN,
      optionValue: 'codeId',
      optionLabel: 'codeId',
    },
    { fieldName: 'didyDvNm', header: t('MSG_TXT_INDP_MNGER_YN'), width: '110', styleName: 'text-center' },
    { fieldName: 'adrUseYn', header: t('MSG_TXT_DSN_ADR_YN'), width: '70', styleName: 'text-center' },
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'rdadr', header: t('MSG_TXT_ADDR'), width: '200', styleName: 'text-left' },
  ];

  const gridField = columns.map((v) => ({ fieldName: v.fieldName }));
  const fields = [...gridField,
    { fieldName: 'ogTpCd' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.header.minRowHeight = 47;

  // view.onCellDblClicked = (e, v) => {
  //   if (v.column === 'qomAsnApyYn') {
  //     view.editOptions.editable = true;
  //   } else {
  //     view.editOptions.editable = false;
  //   }
  // };

  view.onCellClicked = (e, v) => {
    if (v.column === 'qomAsnApyYn') {
      view.editOptions.editable = true;
    } else {
      view.editOptions.editable = false;
    }

    if (v.column === 'prtnrNo') {
      onCellClickedPrtnrNo();
    }
  };

  view.onCellEditable = (e, v) => {
    if (v.column !== 'qomAsnApyYn') {
      return false;
    }
  };
});

// -------------------------------------------------------------------------------------------------
// 검색조건 : 창고
// -------------------------------------------------------------------------------------------------
watch(() => searchParams.value.wareDvCd, () => {
  codes.WARE_DTL_DV_CD = codes.WARE_DTL_DV_CD.filter((v) => Number(v.codeId) > 29);
});
watch(() => searchParams.value.wareNo, (res) => {
  if (res !== '') {
    searchParams.value.prtnrKnm = '';
    searchParams.value.prtnrNo = '';
  }
});

searchDefaultCondition();
</script>
