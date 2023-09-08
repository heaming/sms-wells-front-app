<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbPrepaymentChangeCustomerPsListM- wells 선납변경 고객현황 조회
3. 작성자 : gs.piit165
4. 작성일 : 2023-06-15
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- W-SS-U-0118M01
- wells 선납변경 고객현황 조회
****************************************************************************************************
-->

<template>
  <kw-page>
    <kw-search
      ref="searchMainRef"
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 조직년워 -->
        <kw-search-item
          :label="t('MSG_TXT_MGT_YNM')"
          :colspan="2"
          required
        >
          <kw-date-picker
            v-model="fieldParams.slClYm"
            type="month"
            rules="required"
            :label="t('MSG_TXT_MGT_YNM')"
          />
        </kw-search-item>
        <!-- 조직코드 -->
        <kw-search-item
          :label="t('MSG_TXT_OG_CD')"
          required
          :colspan="2"
        >
          <kw-input
            v-model="fieldParams.ogCd"
            rules="required"
            icon="search"
            clearable
            regex="alpha_num"
            :on-click-icon="fetchOgCd"
            maxlength="10"
            :label="t('MSG_TXT_OG_CD')"
          />
        </kw-search-item>
      </kw-search-row>
      <!-- 상품분류 -->
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_PRDT_CATE')"
          :colspan="2"
        >
          <kw-select
            v-model="fieldParams.pdHclsfId"
            :options="codes.highClass"
            first-option="all"
            first-option-val=""
            @change="onChangeHighClass(fieldParams.pdHclsfId)"
          />
          <kw-select
            v-model="fieldParams.pdMclsfId"
            first-option="all"
            first-option-val=""
            :options="codes.middleClass"
          />
        </kw-search-item>
        <!-- 상품코드 -->
        <kw-search-item :label="t('MSG_TXT_PRDT_CODE')">
          <kw-input
            v-model="fieldParams.pdCd"
            icon="search"
            regex="alpha_num"
            :on-click-icon="fetchProduct"
            maxlength="10"
          />
        </kw-search-item>
        <!-- 상품명 -->
        <kw-search-item :label="t('MSG_TXT_PRDT_NM')">
          <kw-input
            v-model="fieldParams.pdNm"
            maxlength="100"
            :on-keydown-no-click="true"
            @keydown.enter="fetchProduct(2)"
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
            :page-size-options="commonCodes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
          <span>{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="(pageInfo.totalCount === 0)"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="pageInfo.pageSize"
        @init="initGrid"
      />
    </div>
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </kw-page>
</template>

<script setup>
import { useDataService, codeUtil, useMeta, defineGrid, useGlobal, getComponentType, gridUtil } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import pdConst from '~sms-common/product/constants/pdConst';

const { getUserInfo } = useMeta();
const { t } = useI18n();
const session = getUserInfo();
const { modal } = useGlobal();
const now = dayjs();
const dataService = useDataService();
const { currentRoute } = useRouter();

const { ogTpCd } = session;

const grdMainRef = ref(getComponentType('KwGrid'));
const searchMainRef = ref(getComponentType('KwSearch'));

const commonCodes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const codes = ref({
  highClass: [],
  middleClass: [],
  middleClassAll: [],
});

const fieldParams = ref({
  slClYm: now.format('YYYYMM'), // 조회시작일자
  pdHclsfId: '', // 상품대분류ID
  pdMclsfId: '', // 상품중분류ID
  pdCd: '', // 상품코드
  ogCd: '', // 조직코드
  pdNm: '', // 상품명
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(commonCodes.COD_PAGE_SIZE_OPTIONS[2].codeName), // 30
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// fetchCodes: 코드 가져오기
async function fetchCodes() {
  const highCodes = await dataService.get('/sms/wells/contract/product/high-classes');
  const middleCodes = await dataService.get('/sms/wells/contract/product/middle-classes');

  const initHighCodes = [];
  const initMiddleCodes = [];

  highCodes.data.forEach((v) => {
    if (!isEmpty(v.pdClsfId)) initHighCodes.push({ codeId: v.pdClsfId, codeName: v.pdClsfNm });
  });

  middleCodes.data.forEach((v) => {
    if (!isEmpty(v.pdClsfId)) {
      initMiddleCodes.push({ codeId: v.pdClsfId, codeName: v.pdClsfNm, hgrPdClsfId: v.hgrPdClsfId });
    }
  });

  Object.assign(codes.value.highClass, initHighCodes);
  Object.assign(codes.value.middleClassAll, initMiddleCodes);

  if (!isEmpty(codes.value.middleClassAll)) {
    Object.assign(codes.value.middleClass, codes.value.middleClassAll);
  }
}

let cachedParams;

// fetchData: 조회
async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  if (!await searchMainRef.value.validate()) {
    pageInfo.value.totalCount = 0;
    return;
  }

  const res = await dataService.get('/sms/wells/contract/changeorder/prepayment-change-customers/paging', { params: cachedParams });
  const view = grdMainRef.value.getView();

  grdMainRef.value.getData().clearRows();

  const { list: BusinessSupportApplications, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  view.getDataSource().setRows(BusinessSupportApplications);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// onClickSearch: 조회버튼 클릭 시
async function onClickSearch() {
  cachedParams = cloneDeep(fieldParams.value);
  await fetchData();
}

// onChangeHighClass: 상품대분류 변경 시
function onChangeHighClass(pdId) {
  if (!isEmpty(pdId)) {
    codes.value.middleClass = codes.value.middleClassAll.filter((v) => v.hgrPdClsfId === pdId);
  } else {
    codes.value.middleClass = codes.value.middleClassAll;
  }
  fieldParams.value.pdMclsfId = '';
}

// fetchOgCd: 조직코드 팝업
async function fetchOgCd() {
  const res = await modal({
    component: 'ZwogzOrganizationListP',
    componentProps: {
      ogCd: fieldParams.value.ogCd,
      baseYm: dayjs().format('YYYYMM'),
      ogTpCd,
    },
  });
  if (res.result && res.payload) {
    fieldParams.value.ogCd = res.payload.ogCd;
  }
}

// fetchProduct: 상품id 가져오기
async function fetchProduct(gubun) {
  const searchPopupParams = {
    searchType: gubun === 2 ? pdConst.PD_SEARCH_NAME : pdConst.PD_SEARCH_CODE,
    searchValue: gubun === 2 ? fieldParams.value.pdNm : fieldParams.value.pdCd,
    selectType: pdConst.PD_SEARCH_SINGLE,
  };

  const res = await modal({
    component: 'ZwpdcStandardListP',
    componentProps: searchPopupParams,
  });
  if (res.result && res.payload) {
    fieldParams.value.pdNm = res.payload[0].pdNm;
    fieldParams.value.pdCd = res.payload[0].pdCd;
  }
}

// onClickExcelDownload: 엑셀 다운로드 이벤트
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/contract/changeorder/prepayment-change-customers/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

onMounted(async () => {
  fetchCodes();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'ogCd' },
    { fieldName: 'cstKnm' },
    { fieldName: 'telNo' },
    { fieldName: 'pdClsfNm' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'prmPtrm', dataType: 'number' },
    { fieldName: 'prmMcn', dataType: 'number' },
    { fieldName: 'prmDscr', dataType: 'number' },
    { fieldName: 'prmPtrmThm', dataType: 'number' },
    { fieldName: 'prmMcnThm', dataType: 'number' },
    { fieldName: 'prmDscrThm', dataType: 'number' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '140', styleName: 'text-center' },
    { fieldName: 'ogCd', header: t('MSG_TXT_OG_CD'), width: '118', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '118', styleName: 'text-center' },
    {
      fieldName: 'telNo',
      header: t('MSG_TXT_MPNO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cralLocaraTno, mexnoEncr, cralIdvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(cralLocaraTno) && !isEmpty(mexnoEncr) && !isEmpty(cralIdvTno) ? `${cralLocaraTno}-${mexnoEncr}-${cralIdvTno}` : '';
      },
    },
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PRDT_CATE'), width: '234', styleName: 'text-left' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '106', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '237', styleName: 'text-left' },
    { fieldName: 'prmPtrm', header: t('MSG_TXT_PRM_PTRM'), width: '160', styleName: 'text-center' },
    { fieldName: 'prmMcn', header: t('MSG_TXT_PRM_MCNT'), width: '110', styleName: 'text-right' },
    { fieldName: 'prmDscr', header: t('MSG_TXT_PRM_DSCR'), width: '110', styleName: 'text-right' },
    { fieldName: 'prmPtrmThm', header: t('MSG_TXT_PRM_PTRM'), width: '160', styleName: 'text-center' },
    { fieldName: 'prmMcnThm', header: t('MSG_TXT_PRM_MCNT'), width: '110', styleName: 'text-right' },
    { fieldName: 'prmDscrThm', header: t('MSG_TXT_PRM_DSCR'), width: '110', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
  view.setColumnLayout([
    'cntrDtlNo', 'ogCd', 'cstKnm', 'telNo', 'pdClsfNm', 'pdCd', 'pdNm',
    {
      header: t('MSG_TXT_BEFORE_PRM'), // colspan title
      direction: 'horizontal', // merge type
      items: ['prmPtrm', 'prmMcn', 'prmDscr'],
    },

    {
      header: t('MSG_TXT_AFTER_PRM'),
      direction: 'horizontal',
      items: ['prmPtrmThm', 'prmMcnThm', 'prmDscrThm'],
    },
  ]);
});
</script>

<style scoped>
</style>
