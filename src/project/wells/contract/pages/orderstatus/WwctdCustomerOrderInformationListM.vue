<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTD
2. 프로그램 ID : WwctdCustomerOrderInformationListM - 플래너 본인 담당 고객 및 주문 정보 조회
3. 작성자 : younuk.choi
4. 작성일 : 2023.03.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U-0009M01] 플래너 본인 담당 고객 및 주문 정보 조회
- // TODO : W-CU-U-0006M01 고객 SingleView (wells) 화면으로 이동
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_CNTOR_NM')">
          <kw-input
            v-model="searchParams.cstKnm"
            :label="$t('MSG_TXT_CNTOR_NM')"
            clearable
            :maxlength="50"
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
          <kw-input
            v-model:telNo0="searchParams.cralLocaraTno"
            v-model:telNo1="searchParams.mexno"
            v-model:telNo2="searchParams.cralIdvTno"
            mask="telephone"
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
import { codeUtil, defineGrid, getComponentType, gridUtil, router, useDataService, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

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
  cntrSn: '',
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
async function onClickSelectCst(div) {
  let cpProps;

  if (div === 'cntor') cpProps = { cstNm: searchParams.value.cstKnm };
  if (div === 'cst') cpProps = { cstNo: searchParams.value.cstNo };

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
  const res = await dataService.get('/sms/wells/contract/myself-contracts/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: details, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(details);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
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
    { fieldName: 'regButton' }, // 계약서 작석
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cstKnm' }, // 계약자명
    { fieldName: 'cstNo' }, // 고객번호
    { fieldName: 'mpNo' }, // 휴대전화번호
    { fieldName: 'sellTpNm' }, // 계약구분
    { fieldName: 'cntrDtlStatNm' }, // 상태
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'adr' }, // 계약주소
    { fieldName: 'dtlAdr' }, // 상세주소
    { fieldName: 'cntrPrgsStatCd' }, // 계약진행상태코드
  ];

  const columns = [
    { fieldName: 'regButton', header: t('MSG_TIT_CNTRW_WRTE'), width: '120', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TIT_CNTRW_WRTE') },
    { fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '157',
      styleName: 'text-center rg-button-link',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      } },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '113', styleName: 'text-center rg-button-link', renderer: { type: 'button' } },
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '113', styleName: 'text-center' },
    { fieldName: 'mpNo', header: t('MSG_TXT_MPNO'), width: '143', styleName: 'text-center' },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_CNTR_DV'), width: '109', styleName: 'text-center' },
    { fieldName: 'cntrDtlStatNm', header: t('MSG_TXT_STT'), width: '109', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '250' },
    { fieldName: 'adr', header: t('MSG_TXT_STD_ADDR'), width: '250' },
    { fieldName: 'dtlAdr', header: t('MSG_TXT_DETAIL_ADDR'), width: '250' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'regButton') {
      router.replace({
        path: 'wwcta-contract-registration-mgt',
        query: {
          cntrNo: g.getValue(itemIndex, 'cntrNo'),
          cntrPrgsStatCd: g.getValue(itemIndex, 'cntrPrgsStatCd'),
        },
      });
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
