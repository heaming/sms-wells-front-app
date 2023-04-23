<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDY (기준정보관리)
2. 프로그램 ID : WwpdyRentalLeasePenaltyListM - 렌탈/리스 위약금 관리
                ( W-PD-U-0021M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2023.05.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 - 기준정보관리 - 렌탈/리스 위약금 관리 프로그램
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <!-- 상품분류 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CATE')"
        >
          <zwpd-product-classification-select
            ref="classfySelRef"
            v-model:product1-level="searchParams.prdtCateHigh"
            v-model:product2-level="searchParams.prdtCateMid"
            :pd-tp-cd="pdConst.PD_TP_CD_SERVICE"
            search-lvl="2"
            first-option="all"
          />
        </kw-search-item>
        <!-- 상품명 -->
        <kw-search-item :label="$t('MSG_TXT_PRDT_NM')">
          <kw-input
            v-model="searchParams.pdNm"
          />
        </kw-search-item>
        <!-- 상품코드 -->
        <kw-search-item :label="$t('MSG_TXT_PRDT_CODE')">
          <kw-input
            v-model="searchParams.pdCd"
            clearable
            icon="search"
            @click-icon="onClickSearchPdCdPopup()"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 적용기간 -->
        <kw-search-item :label="$t('MSG_TXT_ACEPT_PERIOD')">
          <kw-date-range-picker
            v-model:from="searchParams.svcStartDt"
            v-model:to="searchParams.svcEndDt"
          />
          <!-- rules="date_range_months:1" -->
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

        <kw-btn
          v-permission:delete
          primary
          dense
          grid-action
          :label="$t('MSG_BTN_DEL')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickRemoveRows"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:create
          dense
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <kw-btn
          v-permission:update
          dense
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
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
import { useDataService, useMeta, gridUtil, useGlobal, codeUtil, getComponentType, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import ZwpdProductClassificationSelect from '~sms-common/product/pages/standard/components/ZwpdProductClassificationSelect.vue';

const { notify, modal } = useGlobal();
const router = useRouter();
const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const classfySelRef = ref();
const currentSearchYn = ref();

let cachedParams;
const searchParams = ref({
  prdtCateHigh: '',
  prdtCateMid: '',
  pdNm: '',
  pdCd: '',
  svcStartDt: '',
  svcEndDt: now.format('YYYYMMDD'),
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes('PD_TP_CD', 'COD_PAGE_SIZE_OPTIONS', 'PD_TEMP_SAVE_CD');

async function fetchData() {
  const res = await dataService.get('/sms/wells/product/cancel-charges/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: services, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(services);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearchPdCdPopup() {
  const searchPopupParams = {
    searchType: pdConst.PD_SEARCH_CODE,
    searchValue: searchParams.value.pdCd,
    selectType: pdConst.PD_SEARCH_SINGLE,
  };
  const rtn = await modal({
    component: 'ZwpdcServiceListP',
    componentProps: searchPopupParams,
  });
  searchParams.value.pdCd = rtn.payload?.[0]?.pdCd;
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
  currentSearchYn.value = 'N';
}

async function onClickRemoveRows() {
  const view = grdMainRef.value.getView();

  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRows.length) {
    // console.log('deletedRows : ', deletedRows);
    await dataService.delete('/sms/wells/product/cancel-charges', { data: deletedRows });
    gridUtil.reset(view);
    await fetchData();
  }
}

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  await gridUtil.insertRowAndFocus(view, 0, { });
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; } // 수정된 행 없음
  if (!await gridUtil.validate(view)) { return; } // 유효성 검사

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.put('/sms/wells/product/cancel-charges', { bases: changedRows });
  notify(t('MSG_ALT_SAVE_DATA'));

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/product/cancel-charges', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: router.currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
  console.log('Start');
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    // 상품코드
    {
      fieldName: 'pdCd',
      header: t('MSG_TXT_PRDT_CODE'),
      width: '138',
      styleName: 'text-center',
      button: 'action',
    },
    // 상품명
    {
      fieldName: 'pdNm',
      header: t('MSG_TXT_PRDT_NM'),
      width: '203',
      styleName: 'text-left',
      button: 'action',
    },
    // 시작일
    {
      fieldName: 'vlStrtDtm',
      header: t('MSG_TXT_START_DATE'),
      width: '133',
      styleName: 'text-center',
      editor: { type: 'date' },
      dataType: 'date',
    },
    // 종료일
    {
      fieldName: 'vlEndDtm',
      header: t('MSG_TXT_END_DATE'),
      width: '129',
      styleName: 'text-center',
      editor: { type: 'date' },
      dataType: 'date',
    },
    // 소모품비
    {
      fieldName: 'csmbCs',
      header: t('MSG_TXT_CSMB_CS'),
      width: '141',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '9', maxLength: 1 },
      dataType: 'number',
    },
    // 철거비
    {
      fieldName: 'reqdCs',
      header: t('MSG_TXT_REQD_CS'),
      width: '141',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '9', maxLength: 1 },
      dataType: 'number',
    },
    // 렌탈손료
    {
      fieldName: 'rentalRntf',
      header: t('MSG_TXT_LENT_LOSS_COST'),
      width: '141',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '9', maxLength: 1 },
      dataType: 'number',
    },
    // 잔여위약금(%)
    {
      fieldName: 'resCcamRat',
      header: t('MSG_TXT_REMAIN_PENALTY'),
      width: '141',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '9', maxLength: 1 },
      dataType: 'number',
    },
    // 일시분손료
    {
      fieldName: 'spayRntf',
      header: t('MSG_TXT_ONET_LOSS_COST'),
      width: '141',
      styleName: 'text-right',
      editor: { type: 'number', editFormat: '9', maxLength: 1 },
      dataType: 'number',
    },
    // 등록일
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', editable: false },
    // 등록자
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_FST_RGST_USR'), width: '100', styleName: 'text-center', editable: false },
    // 최종수정일
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '110', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', editable: false },
    // 최종수정자
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '100', styleName: 'text-center', editable: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.sortingOptions.enabled = false;
  view.filteringOptions.enabled = false;
});
</script>
<style scoped></style>
