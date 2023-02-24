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
      :cols="5"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 기준년월 -->
        <kw-search-item :label="$t('MSG_TXT_BASE_YM')">
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
          />
        </kw-search-item>
        <!-- //기준년월 -->
        <!-- 총괄단 -->
        <kw-search-item :label="$t('MSG_TXT_MANAGEMENT_DEPARTMENT')">
          <kw-select
            v-model="searchParams.cdpt"
            :options="cdptCodes"
          />
        </kw-search-item>
        <!-- //총괄단 -->
        <!-- 지역단 -->
        <kw-search-item :label="$t('MSG_TXT_RGNL_GRP')">
          <kw-select
            v-model="searchParams.bizCd"
            :options="bizCodes"
          />
        </kw-search-item>
        <!-- //지역단 -->
        <!-- 지점 -->
        <kw-search-item :label="$t('MSG_TXT_BRANCH')">
          <kw-select
            v-model="searchParams.brnhCd"
            :options="brnhCodes"
            first-option="all"
          />
        </kw-search-item>
        <!-- //지점 -->
        <!-- 담당자명 -->
        <kw-search-item :label="$t('MSG_TXT_PIC_NM')">
          <kw-select
            v-model="searchParams.prtnrNo"
            :options="prtnrCodes"
            first-option="all"
          />
        </kw-search-item>
        <!-- //담당자명 -->
      </kw-search-row>
      <kw-search-row>
        <!-- 상위창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_HGR_WARE')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :options="codes.WARE_DV_CD"
            :disable="true"
          />
          <kw-select
            v-model="searchParams.wareDtlDvCd"
            :options="codes.WARE_DTL_DV_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- //상위창고 -->
        <!-- 사번 -->
        <kw-search-item :label="$t('MSG_TXT_EPNO')">
          <kw-input />
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
import { codeUtil, useDataService, getComponentType, useMeta, defineGrid, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { getConfig } = useMeta();
const baseURI = '/sms/wells/service/materials-assign-stocks';
// const toMonth = dayjs().format('YYYYMM');
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'WARE_DV_CD',
  'WARE_DTL_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'COD_YN',
);
let cachedParams;
const searchParams = ref({
  baseYm: '',
  ogId: '',
  prtnrNo: '',
  prtnrKnm: '',
  wareNo: '',
  wareDvCd: '3', // 영업센터로 초기값 설정
  wareDtlDvCd: '',
  cdpt: '',
  bizCd: '',
  brnhCd: '',
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

  searchParams.value.ogId = searchParams.value.cdpt || searchParams.value.ogId;
  searchParams.value.ogId = searchParams.value.bizCd || searchParams.value.ogId;
  searchParams.value.ogId = searchParams.value.brnhCd || searchParams.value.ogId;
  console.log(`searchParams.value.ogId : ${searchParams.value.ogId}`);
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
    .map((v) => ({ prtnrNo: v.prtnrNo, qomAsnApyYn: v.qomAsnApyYn }));

  view.editOptions.editable = false;

  await dataService.post(baseURI, saveList);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '100', styleName: 'text-center' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BUILDING'), width: '200', styleName: 'text-left' },
    { fieldName: 'wareNm', header: t('MSG_TXT_HGR_WARE'), width: '200', styleName: 'text-left' },
    { fieldName: 'qomAsnApyYn',
      header: t('MSG_TXT_QOM_ASN_APY_YN'),
      width: '130',
      styleName: 'text-center',
      editor: { type: 'list' },
      options: codes.COD_YN,
      optionValue: 'codeId',
      optionLabel: 'codeId',
    },
    { fieldName: 'bldCd', header: t('MSG_TXT_BLD_CD'), width: '80', styleName: 'text-center' },
    { fieldName: 'didyDvCd', header: t('MSG_TXT_INDP_MNGER_YN'), width: '110', styleName: 'text-center' },
    { fieldName: 'adrUseYn', header: t('MSG_TXT_DSN_ADR_YN'), width: '110', styleName: 'text-center' },
    { fieldName: 'zipCd', header: t('MSG_TXT_ZIP'), width: '80', styleName: 'text-center' },
    { fieldName: 'rmkCn', header: t('MSG_TXT_NOTE'), width: '180', styleName: 'text-left' },
  ];

  const fields = columns.map((v) => ({ fieldName: v.fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellDblClicked = (e, v) => {
    if (v.column === 'qomAsnApyYn') {
      view.editOptions.editable = true;
    } else {
      view.editOptions.editable = false;
    }
  };

  view.onCellClicked = (e, v) => {
    if (v.column !== 'qomAsnApyYn') {
      view.editOptions.editable = false;
    }
  };

  view.onCellEditable = (e, v) => {
    if (v.column !== 'qomAsnApyYn') {
      return false;
    }
  };
});

// TODO:총괄단 공통코드 만들어지면 삭제해야함.
// -------------------------------------------------------------------------------------------------
// 총괄단/지역단/지점/담당자명 selectbox 설정(공통코드 생성되면 삭제)
// -------------------------------------------------------------------------------------------------
// TODO: CODE값이 정리되면 바꿔야함
const ogLevl1 = '1';// 2
const ogLevl2 = '2';// 4
const ogLevl3 = '3';// 7
const orgParams = {
  baseYm: searchParams.value.baseYm || dayjs().format('YYYYMM'),
  ogTpCd: 'W02',
};

const ogCodesLv1 = ref();
const ogCodesLv2 = ref();
const ogCodesLv3 = ref();
const ogCodesLv4 = ref();

const cdptCodes = ref();
const bizCodes = ref();
const brnhCodes = ref();
const prtnrCodes = ref();

const setCodes = (_target, _lev) => _target.filter((obj) => obj.ogLevlDvCd === _lev)
  .map((v) => ({ ...v, codeId: v.ogId, codeName: v.ogCd }));

const filterHgrOgId = (_targetObj, _ogId) => _targetObj.filter((v) => v.hgrOgId === _ogId);

const setCdptCodes = () => {
  cdptCodes.value = ogCodesLv1.value;
  searchParams.value.cdpt = cdptCodes.value[0].codeId;// 초기값 설정
  searchParams.value.ogId = cdptCodes.value[0].codeId;
};

const getOgCodes = async () => {
  const res = await dataService.get(`${baseURI}/organizations`, { params: orgParams });
  if (res.data.length > 0) {
    ogCodesLv1.value = setCodes(res.data, ogLevl1);
    ogCodesLv2.value = setCodes(res.data, ogLevl2);
    ogCodesLv3.value = setCodes(res.data, ogLevl3);
    ogCodesLv4.value = res.data.filter((obj) => obj.ogLevlDvCd === ogLevl3)
      .map((v) => ({ ...v, codeId: v.hooPrtnrNo, codeName: `${v.hooPrtnrNm}(${v.hooPrtnrNo})` }));

    setCdptCodes();
  }
};

watch(() => searchParams.value.baseYm, (res) => {
  searchParams.value.cdpt = '';
  searchParams.value.bizCd = '';
  searchParams.value.brnhCd = '';
  searchParams.value.prtnrNo = '';
  searchParams.value.ogId = '';
  // console.log(res);
  getOgCodes();
  console.log(`searchParams.value.baseYm : ${res}`);
});

watch(() => searchParams.value.cdpt, (res) => {
  searchParams.value.bizCd = '';
  searchParams.value.brnhCd = '';
  searchParams.value.prtnrNo = '';
  searchParams.value.ogId = '';

  bizCodes.value = filterHgrOgId(ogCodesLv2.value, searchParams.value.cdpt);
  searchParams.value.bizCd = bizCodes.value[0].codeId;
  searchParams.value.ogId = bizCodes.value[0].codeId;

  console.log(`searchParams.value.cdpt : ${res}`);
});

watch(() => searchParams.value.bizCd, (res) => {
  searchParams.value.brnhCd = '';
  searchParams.value.prtnrNo = '';
  searchParams.value.ogId = '';

  brnhCodes.value = filterHgrOgId(ogCodesLv3.value, searchParams.value.bizCd);
  // searchParams.value.ogId = brnhCodes.value[0].codeId;
  console.log(`searchParams.value.bizCd : ${res}`);
});

watch(() => searchParams.value.brnhCd, (res) => {
  prtnrCodes.value = filterHgrOgId(ogCodesLv4.value, searchParams.value.bizCd);// brnhCd
  console.log(`searchParams.value.brnhCd : ${res}`);
});

searchParams.value.baseYm = dayjs().format('YYYYMM');
</script>
