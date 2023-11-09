<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA
2. 프로그램 ID : WwsnaRequestMaterialHaveListP - 요청자재보유현황(W-SV-U-0180P01)
3. 작성자 : SongTaeSung
4. 작성일 : 2023.03.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
  요청자재보유현황
****************************************************************************************************
--->

<template>
  <kw-popup size="xl">
    <kw-search
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <!-- 품목코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
        >
          <kw-input
            v-model="searchParams.itmPdCd"
            :readonly="true"
          />
        </kw-search-item>
        <!-- 품목명 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_NM')"
        >
          <kw-input
            v-model="searchParams.itmPdNm"
            :readonly="true"
          />
        </kw-search-item>
        <!-- 요청창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_AK_WARE')"
        >
          <kw-input
            v-model="searchParams.strOjWareNm"
            :readonly="true"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 요청수량 -->
        <kw-search-item
          :label="$t('MSG_TXT_AK_QTY')"
        >
          <kw-input
            v-model="searchParams.ostrQty"
            :readonly="true"
          />
        </kw-search-item>
        <!-- 창고구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_WARE_DV')"
        >
          <kw-select
            v-model="searchParams.wareClsfCd"
            :options="codes.WARE_CLSF_CD"
            @change="onChangeWareClsFCd()"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <!-- 조직창고 -->
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-show="isCenter"
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          :total-count="pageInfo.totalCount"
        />
      </template>
    </kw-action-top>

    <kw-grid
      v-show="isCenter"
      ref="grdMainRef"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrdMain"
    />
    <!-- 개인창고 -->
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-show="isPerson"
          v-model:page-index="pageInfo2.pageIndex"
          v-model:page-size="pageInfo2.pageSize"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          :total-count="pageInfo2.totalCount"
        />
      </template>
    </kw-action-top>
    <kw-grid
      v-show="isPerson"
      ref="grdMainRef2"
      :page-size="pageInfo2.pageSize"
      :total-count="pageInfo2.totalCount"
      @init="initGrdMain2"
    />

    <kw-pagination
      v-show="isCenter"
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
    <kw-pagination
      v-show="isPerson"
      v-model:page-index="pageInfo2.pageIndex"
      v-model:page-size="pageInfo2.pageSize"
      :total-count="pageInfo2.totalCount"
      @change="fetchData"
    />
  </kw-popup>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, defineGrid, getComponentType, useMeta } from 'kw-lib';

import { isEmpty, cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { getConfig } = useMeta();
const { t } = useI18n();

// TODO: 앞 화면 개발되면 파라미터 수정 필요.
const props = defineProps({
  itmPdCd: {
    type: String,
    required: true,
    default: '',
  },
  itmPdNm: {
    type: String,
    required: true,
    default: '',
  },
  strOjWareNm: {
    type: String,
    default: '',
  },

  strOjWareNo: {
    type: String,
    default: '',
  },

  ostrQty: {
    type: String,
    default: '',
  },
  wareDvCd: {
    type: String,
    default: '',
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));
const grdMainRef2 = ref(getComponentType('KwGrid'));
// 창고구분이 조직창고 일떄 보여주는 그리드
const isCenter = ref();
// 창고구분이 개인창고 일때 보여주는 그리드
const isPerson = ref();

/* 공통코드 가져오기 */
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'WARE_CLSF_CD',
);

const searchParams = ref({
  itmPdCd: props.itmPdCd,
  itmPdNm: props.itmPdNm,
  strOjWareNm: props.strOjWareNm,
  strOjWareNo: props.strOjWareNo,
  ostrQty: props.ostrQty,
  wareDvCd: props.wareDvCd,
  wareClsfCd: '11',

});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const pageInfo2 = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchInit() {
  isCenter.value = false;
  isPerson.value = true;
}

// 조회
let cachedParams;
async function fetchData() {
  if (searchParams.value.wareClsfCd === '10') {
    const res = await dataService.get('/sms/wells/service/normal-out-of-storages/organization-center/paging', { params: { ...cachedParams, ...pageInfo.value } });
    const { list: centers, pageInfo: pagingResult } = res.data;

    pageInfo.value = pagingResult;
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(centers);
    view.resetCurrent();
  } else if (searchParams.value.wareClsfCd === '11') {
    const res1 = await dataService.get('/sms/wells/service/normal-out-of-storages/person-center/paging', { params: { ...cachedParams, ...pageInfo2.value } });
    const { list: persons, pageInfo: pagingResult2 } = res1.data;

    pageInfo2.value = pagingResult2;
    const view2 = grdMainRef2.value.getView();
    view2.getDataSource().setRows(persons);
    view2.resetCurrent();
  }
}

// 창고구분코드 변경
async function onChangeWareClsFCd() {
  const clsFCdVal = searchParams.value.wareClsfCd;
  if (clsFCdVal === '11') {
    isPerson.value = true;
    isCenter.value = false;
  } else if (clsFCdVal === '10') {
    isCenter.value = true;
    isPerson.value = false;
  }
}

/*
 *  Event - 조회 버튼 클릭
 */
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 초기화 버튼 클릭이벤트
async function onClickReset() {
  await onChangeWareClsFCd();
}

function isProps() {
  return !isEmpty(props.itmPdCd) && !isEmpty(props.itmPdNm);
}
onMounted(async () => {
  if (isProps()) {
    await fetchInit();
    await onClickSearch();
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'wareNm' }, // 창고명
    { fieldName: 'wareNo' }, // 창고번호
    { fieldName: 'qty', dataType: 'number' }, // 수량

  ];

  const columns = [
    { fieldName: 'wareNm', header: t('MSG_TXT_WARE_NM'), width: '30', styleName: 'text-left' },
    { fieldName: 'wareNo', header: t('MSG_TXT_WARE_CD'), width: '30', styleName: 'text-center' },
    { fieldName: 'qty', header: t('MSG_TXT_STOC'), width: '20', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGrdMain2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'wareNm' },
    { fieldName: 'wareMngtPrtnrNo' },
    { fieldName: 'qty', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'wareNm', header: t('MSG_TXT_WARE_NM'), width: '30', styleName: 'text-left' },
    { fieldName: 'wareMngtPrtnrNo', header: t('MSG_TXT_EPNO'), width: '30', styleName: 'text-center' },
    { fieldName: 'qty', header: t('MSG_TXT_STOC'), width: '20', styleName: 'text-right' },

  ];
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
