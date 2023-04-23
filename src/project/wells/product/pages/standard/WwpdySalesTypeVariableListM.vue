<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDY (기준정보관리)
2. 프로그램 ID : WwpdySalesTypeVariableListM - 판매유형별 변수관리
                ( W-PD-U-0020M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2023.05.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 - 기준정보관리 - 판매유형별 변수관리 프로그램
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 판매유형 -->
        <kw-search-item :label="$t('MSG_TXT_SEL_TYPE')">
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="codes.SELL_TP_CD"
          />
        </kw-search-item>
        <!-- 변수명 -->
        <kw-search-item :label="$t('MSG_TXT_VARB_NM')">
          <kw-input
            v-model="searchParams.rgltnVarbNm"
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
import { cloneDeep } from 'lodash-es';

const { notify } = useGlobal();
const router = useRouter();
const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const currentSearchYn = ref();

let cachedParams;
const searchParams = ref({
  sellTpCd: '',
  rgltnVarbNm: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes('SELL_TP_CD', 'CHO_FXN_DV_CD', 'COD_PAGE_SIZE_OPTIONS');

async function fetchData() {
  const res = await dataService.get('/sms/wells/product/variables/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: services, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(services);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
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
    await dataService.delete('/sms/wells/product/variables', { data: deletedRows });
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
  await dataService.put('/sms/wells/product/variables', { bases: changedRows });
  notify(t('MSG_ALT_SAVE_DATA'));

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/product/variables', { params: cachedParams });
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
    // 판매유형
    {
      fieldName: 'sellTpCd',
      header: t('MSG_TXT_SEL_TYPE'),
      width: '94',
      styleName: 'text-center',
      placeHolder: t('MSG_TXT_SELT'),
      editor: { type: 'list' },
      rules: 'required',
      options: codes.SELL_TP_CD },
    // 변수구분
    { fieldName: 'choFxnDvCd',
      header: t('MSG_TXT_VAL_GUBUN'),
      width: '130',
      styleName: 'text-center',
      placeHolder: t('MSG_TXT_SELT'),
      editor: { type: 'list' },
      rules: 'required',
      options: codes.CHO_FXN_DV_CD },
    // 변수ID
    { fieldName: 'rgltnVarbId', header: t('MSG_TXT_VAL_ID'), width: '86', styleName: 'text-center' },
    // 변수명
    { fieldName: 'rgltnVarbNm',
      header: t('MSG_TXT_VARB_NM'),
      width: '182',
      editable: false,
      styleName: 'text-left',
      displayCallback(grid, index) {
        const { rgltnVarbNm } = grid.getValues(index.itemIndex);
        return rgltnVarbNm ? t(rgltnVarbNm) : '';
      },
    },
    // 노출순서
    { fieldName: 'sortOdr',
      header: t('MSG_TXT_EXPSR_ODR'),
      width: '79',
      editor: { type: 'number', editFormat: '9', maxLength: 1 },
      dataType: 'number' },
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
