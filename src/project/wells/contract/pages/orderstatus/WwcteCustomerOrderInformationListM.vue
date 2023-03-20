<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwcteCustomerOrderInformationListM - 플래너 본인 담당 고객 및 주문 정보 조회
3. 작성자 : younuk.choi
4. 작성일 : 2023.03.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 플래너 본인 담당 고객 및 주문 정보 조회
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_CNTR_NO')">
          <kw-input
            v-model="searchParams.cntrNo"
            :label="$t('MSG_TXT_CNTR_NO')"
            icon="search"
            clearable
            rules="max:12"
            @click-icon="onClickCntrNoPop"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_CNTOR_NM')">
          <kw-input
            v-model="searchParams.cstKnm"
            :label="$t('MSG_TXT_CNTOR_NM')"
            icon="search"
            clearable
            :maxlength="100"
            @click-icon="onClickSelectCst('cntor')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_CST_NO')">
          <kw-input
            v-model="searchParams.cstNo"
            :label="$t('MSG_TXT_CST_NO')"
            icon="search"
            clearable
            :maxlength="10"
            :regex="/^[0-9]*$/i"
            @click-icon="onClickSelectCst('cst')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_MPNO')">
          <zwcm-telephone-number
            v-model:tel-no1="searchParams.cralLocaraTno"
            v-model:tel-no2="searchParams.mexno"
            v-model:tel-no3="searchParams.cralIdvTno"
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
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
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
import { codeUtil, defineGrid, getComponentType, useDataService, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';

const { modal, notify } = useGlobal();
const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const grdMainRef = ref(getComponentType('KwGrid'));
// const router = useRouter();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  cntrNo: '',
  cstKnm: '',
  cstNo: '',
  cralLocaraTno: '',
  mexno: '',
  cralIdvTno: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
let cachedParams;

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function onClickCntrNoPop() {
  const { result, payload } = await modal({
    component: 'WwctaContractNumberListP',
  });
  if (result) {
    searchParams.value.cntrNo = payload.cntrNo;
  }
}

async function onClickSelectCst(div) {
  // TODO : 고객 검색 시, 부모창 파라미터 전송 확인
  let cpProps;

  if (div === 'cntor') cpProps = { cntrCstKnm: searchParams.value.cstKnm };
  if (div === 'cst') cpProps = { cntrCstNo: searchParams.value.cstNo };

  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: cpProps,
  });
  if (result) {
    searchParams.value.cstKnm = payload.name;
    searchParams.value.cstNo = payload.cstNo;
  }
}

async function fetchData() {
  console.log(cachedParams);
  const res = await dataService.get('/sms/wells/contract/myself-contracts/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: details, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(details);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'regButton' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cstKnm' },
    { fieldName: 'cstNo' },
    { fieldName: 'mpNo' },
    { fieldName: 'sellTpNm' },
    { fieldName: 'cntrDtlStatNm' },
    { fieldName: 'pdNm' },
    { fieldName: 'adr' },
    { fieldName: 'dtlAdr' },
  ];

  const columns = [
    { fieldName: 'regButton', header: t('MSG_TIT_CNTRW_WRTE'), width: 120, renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TIT_CNTRW_WRTE') },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '157', styleName: 'text-center rg-button-link', renderer: { type: 'button' } },
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '120', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '113', styleName: 'text-center rg-button-link', renderer: { type: 'button' } },
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '113', styleName: 'text-center' },
    { fieldName: 'mpNo', header: t('MSG_TXT_MPNO'), width: '143', styleName: 'text-center' },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_CNTR_DV'), width: '109', styleName: 'text-center' },
    { fieldName: 'cntrDtlStatNm', header: t('MSG_TXT_STT'), width: '109', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '307' },
    { fieldName: 'adr', header: t('MSG_TXT_STD_ADDR'), width: '380' },
    { fieldName: 'dtlAdr', header: t('MSG_TXT_DETAIL_ADDR'), width: '288' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    // TODO : 페이지 연결 확인

    // 계약서작성 클릭 - 메뉴tab
    if (column === 'regButton') {
      notify('// TODO : W-SS-U-0022M01 통합계약서 화면으로 이동');
      /*
      const cstNo = g.getValue(itemIndex, 'cstNo');
      router.replace(
        {
          path: '/contract/wwcta-contract-registration-level1-mgt',
          query: { cstNo },
          // 혹은 params: { cstNo: cstNo},
        },
      );
      */
    }

    // 계약번호 클릭 - 팝업
    if (column === 'cntrNo') {
      await modal({
        component: 'WwctaOrderDetailP',
        componentProps: { cntrNo: g.getValue(itemIndex, 'cntrNo'), cntrSn: g.getValue(itemIndex, 'cntrSn') },
      });
    }

    // 계약자명
    if (column === 'cstKnm') {
      notify('// TODO : W-CU-U-0006M01 고객 SingleView (wells) 화면으로 이동');
      /*
      const cstNo = g.getValue(itemIndex, 'cstNo');
      router.replace(
      {
        path: '/dev-portal/sub-page-test-step-1/sub-page-test-step-2',
        query: { test1: test1.value, test2: test2.value },
        params: { a: 'b' },
      }
      */
    }
  };
});
</script>
