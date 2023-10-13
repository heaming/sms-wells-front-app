<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcRoutineBsLoadListP - 서비스 등록/변경 - 정기 B/S 투입 필터 / 부품연결 복사
                (W-PD-U-0043P02)
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 서비스 목록 조회 및 선택 프로그램
****************************************************************************************************
--->
<template>
  <kw-popup size="3xl">
    <kw-search
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 서비스 선택 -->
        <kw-search-item
          :label="$t('MSG_TXT_PD_SVC_SEL')"
        >
          <kw-select
            v-model="svcType"
            :options="serviceSelectItems"
            class="w98"
          />
          <kw-input
            v-model="svcValue"
            icon="search"
            clearable
            @click-icon="onClickSearchServicePopup"
            @clear="onClearService"
            @keydown="onClearService"
          />
        </kw-search-item>
        <!-- 제품 선택 -->
        <kw-search-item
          :label="$t('MSG_TXT_PD_SELECT')"
        >
          <kw-select
            v-model="prdtType"
            :options="materialSelectItems"
            class="w98"
          />
          <kw-input
            v-model="prdtValue"
            icon="search"
            clearable
            @click-icon="onClickSearchMaterialPopup"
            @clear="onClearMaterial"
            @keydown="onClearMaterial"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
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
      :visible-rows="pageInfo.pageSize"
      @init="initGrdMain"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
    <template #action>
      <!-- 정기 B/S투입정보 복사 -->
      <kw-btn
        primary
        :label="$t('MSG_BTN_ROUTINE_BS_COPY')"
        @click="onSelect()"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useGlobal, useModal, useMeta, gridUtil, useDataService, getComponentType, defineGrid } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';

const props = defineProps({
  searchType: { type: String, default: null }, // 검색타입
  searchValue: { type: String, default: null }, // 검색값
  selectType: { type: String, default: pdConst.PD_SEARCH_MULTIPLE }, // 선택타입
});

const { notify, modal } = useGlobal();
const { t } = useI18n();
const { ok } = useModal();
const dataService = useDataService();
const { getConfig } = useMeta();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const svcType = ref();
const svcValue = ref();
const prdtType = ref();
const prdtValue = ref();

let cachedParams;
const searchParams = ref({
  svPdCd: '',
  pdctPdCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const codes = await codeUtil.getMultiCodes('SV_BIZ_DCLSF_CD', 'MM_CD', 'SV_PRD_UNIT_CD', 'VST_DV_CD', 'COD_PAGE_SIZE_OPTIONS');
codes.MM_CD.map((item) => { item.codeId = Number(item.codeId); return item; });

const serviceSelectItems = ref([
  // 서비스명
  { codeId: pdConst.PD_SEARCH_NAME, codeName: t('MSG_TXT_SVC_NAME') },
  // 서비스 코드
  { codeId: pdConst.PD_SEARCH_CODE, codeName: t('MSG_TXT_SVC_CODE') },
]);

const materialSelectItems = ref([
  // 교재/자재명
  { codeId: pdConst.PD_SEARCH_NAME, codeName: t('MSG_TXT_PD_BOK_MTR_NAME') },
  // 교재/자재코드
  { codeId: pdConst.PD_SEARCH_CODE, codeName: t('MSG_TXT_MATERIAL_CD') },
]);

// 선택
async function onSelect() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (isEmpty(checkedRows) || checkedRows.length < 1) {
    // [복사] 하려는 데이터를 선택해주세요.
    notify(t('MSG_ALT_SELECT_ONE_ROW', [t('MSG_TXT_COPY')]));
  } else {
    if (props.selectType === pdConst.PD_SEARCH_SINGLE && checkedRows.length !== 1) {
      // 데이터를 한 개만 선택하세요
      notify(t('MSG_ALT_SELT_ONE_ITEM'));
      return;
    }

    let duplicateFilterName = '';
    checkedRows.forEach((row) => {
      if (!duplicateFilterName && checkedRows.filter((item) => item.partPdCd === row.partPdCd).length > 1) {
        duplicateFilterName = row.partPdNm;
      }
    });
    if (duplicateFilterName) {
      // {필터명}이(가) 중복됩니다.
      notify(t('MSG_ALT_DUP_NCELL', [duplicateFilterName]));
      return;
    }

    ok(checkedRows);
  }
}

// 데이터 불러오기
async function fetchData() {
  console.log('WwpdcRoutineBsLoadListP - fetchData - cachedParams : ', cachedParams);
  const res = await dataService.get('/sms/wells/product/bs-works/standards/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: services, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(services);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  if (services?.length === 1 && props.selectType === pdConst.PD_SEARCH_SINGLE) {
    await onSelect();
  }
}

// 서비스상품 검색 팝업
async function onClickSearchServicePopup() {
  const searchPopupParams = {
    searchType: svcType.value,
    searchValue: svcValue.value,
    selectType: pdConst.PD_SEARCH_SINGLE,
  };
  const rtn = await modal({
    component: 'ZwpdcServiceListP',
    componentProps: searchPopupParams,
  });
  searchParams.value.svPdCd = rtn.payload?.[0]?.pdCd;
  if (svcType.value === pdConst.PD_SEARCH_CODE) {
    svcValue.value = rtn.payload?.[0]?.pdCd;
  } else {
    svcValue.value = rtn.payload?.[0]?.pdNm;
  }
}

// 서비스 상품 코드 제거
async function onClearService() {
  searchParams.value.svPdCd = '';
}

// 교재/자재 팝업
async function onClickSearchMaterialPopup() {
  const searchPopupParams = {
    searchType: prdtType.value,
    searchValue: prdtValue.value,
    selectType: pdConst.PD_SEARCH_SINGLE,
  };
  const rtn = await modal({
    component: 'ZwpdcMaterialsSelectListP',
    componentProps: searchPopupParams,
  });
  searchParams.value.pdctPdCd = rtn.payload.checkedRows?.[0]?.pdCd;
  if (prdtType.value === pdConst.PD_SEARCH_CODE) {
    prdtValue.value = rtn.payload.checkedRows?.[0]?.pdCd;
  } else {
    prdtValue.value = rtn.payload?.checkedRows?.[0]?.pdNm;
  }
}

// 교재/자재 코드 제거
async function onClearMaterial() {
  searchParams.value.pdctPdCd = '';
}

// 조회
async function onClickSearch() {
  if (isEmpty(searchParams.value.svPdCd) && svcValue.value) {
    svcValue.value = '';
  }
  if (isEmpty(searchParams.value.pdctPdCd) && prdtValue.value) {
    prdtValue.value = '';
  }
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    // 작업구분
    { fieldName: 'svBizDclsfCd', header: t('MSG_TXT_WK_CLS'), width: '80', styleName: 'text-center', options: codes.SV_BIZ_DCLSF_CD },
    // 단계
    { fieldName: 'filtChngLvCd', header: t('MSG_TXT_STEP'), width: '60', styleName: 'text-center', dataType: 'number' },
    // 필터/부품명
    { fieldName: 'partPdNm', header: t('MSG_TXT_FLT_AND_PART_NM'), width: '180', editable: false },
    // 부품사용수량
    { fieldName: 'partUseQty', header: t('MSG_TXT_WK_QTY'), width: '80', styleName: 'text-right', dataType: 'number' },
    // 방문구분
    { fieldName: 'vstDvCd', header: t('MSG_TXT_VISIT_TYPE'), width: '80', styleName: 'text-center', options: codes.VST_DV_CD },
    // 서비스주기
    { fieldName: 'svPrdMmN', header: t('TXT_MSG_SV_PRD_UNIT_CD'), width: '90', styleName: 'text-center', options: codes.SV_PRD_UNIT_CD },
    // 시작월
    { fieldName: 'svStrtmmN', header: t('MSG_TXT_STRT_MM'), width: '60', styleName: 'text-center', options: codes.MM_CD },
    // 반복횟수
    { fieldName: 'svTms', header: t('MSG_TXT_REPEAT_COUNT'), width: '60', styleName: 'text-right', dataType: 'number' },
    // 총약정개월
    { fieldName: 'totStplMcn', header: t('MSG_TXT_TOT_COMMIT_MM'), width: '60', styleName: 'text-right', dataType: 'number' },
    // 제외월
    { fieldName: 'excdMmVal', header: t('MSG_TXT_EXCEPT_MONS'), width: '80', styleName: 'text-right', dataType: 'number' },
    // 설치월
    { fieldName: 'istMm', header: t('MSG_TXT_SETUP_MON'), width: '60', styleName: 'text-center', options: codes.MM_CD },
    // 작업연도
    { fieldName: 'strtWkYVal', header: t('MSG_TXT_JOB_YEAR'), width: '60', styleName: 'text-center', dataType: 'number' },
    // 작업월
    { fieldName: 'wkMm', header: t('MSG_TXT_JOB_MON'), width: '60', styleName: 'text-center', dataType: 'number' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: 'partPdCd' });
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});
</script>
<style scoped></style>
