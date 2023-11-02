<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA
 2. 프로그램 ID : [W-SV-U-0171P01] WwsnaInstallationAssignSettingP - 설치배정세팅
 3. 작성자 : segi 홍세기
 4. 작성일 : 2023.07.25
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 타임테이블 설치배정에 대한 상품 출시일 등록
 ****************************************************************************************************
--->
<template>
  <kw-popup size="2xl">
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 품목구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="filterCodes.itmKndCd"
            first-option="all"
            class="w150"
            @change="onChangeItmKndCd"
          />
          <kw-select
            v-model="searchParams.itmPdCd"
            :options="optionsItmPdCd"
            :label="$t('MSG_TXT_ITM_DV')"
            option-value="pdCd"
            option-label="pdNm"
            first-option="all"
            :multiple="false"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <kw-separator />
    <kw-action-top class="mt30">
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
        grid-action
        :label="$t('MSG_BTN_DEL')"
        @click="onClickDelete"
      />
      <kw-separator
        vertical
        inset
        spaced
      />

      <!-- 행추가 -->
      <kw-btn
        v-permission:create
        grid-action
        :label="$t('MSG_BTN_ROW_ADD')"
        @click="onClickAddRow"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        v-permission:create
        grid-action
        :label="$t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
      <kw-separator
        vertical
        inset
        spaced
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
      :visible-rows="pageInfo.pageSize"
      @init="initGrdMain"
    />
    <kw-pagination
      :page-index="pageInfo.pageIndex"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </kw-popup>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { useMeta, getComponentType, defineGrid, gridUtil, codeUtil, useGlobal, useDataService } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const dataService = useDataService();

const { getConfig } = useMeta();
const { notify } = useGlobal();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'ITM_KND_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

let cachedParams;
const searchParams = ref({
  itmKndCd: '',
  itmPdCds: [],
  itmPdCd: '',
});

const filterCodes = ref({
  itmKndCd: [],
});

onBeforeMount(async () => {
  searchParams.value.itmKndCd = '4';
});

const optionsItmPdCd = ref();
const optionsAllItmPdCd = ref();

const selectCodes = ref([]);

// 품목조회
const getProducts = async () => {
  const result = await dataService.get('/sms/wells/service/independence-ware-ostrs/products');
  // optionsItmPdCd.value = result.data;
  // optionsAllItmPdCd.value = result.data;
  optionsItmPdCd.value = result.data.filter((v) => v.itmKndCd === filterCodes.value.itmKndCd[0].codeId);
  optionsAllItmPdCd.value = result.data.filter((v) => v.itmKndCd === filterCodes.value.itmKndCd[0].codeId);

  // result.data.forEach((e) => {
  optionsItmPdCd.value.forEach((e) => {
    selectCodes.value.push({
      codeId: e.pdCd,
      codeName: e.pdNm,
    });
  });
};

function codeFilter() {
  filterCodes.value.itmKndCd = codes.ITM_KND_CD.filter((v) => ['4'].includes(v.codeId));
}

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 품목종류 변경 시 품목 필터링
function onChangeItmKndCd() {
  // 품목코드 클리어
  searchParams.value.itmPdCds = [];
  const { itmKndCd } = searchParams.value;

  if (isEmpty(itmKndCd)) {
    optionsItmPdCd.value = optionsAllItmPdCd.value;
    return;
  }

  optionsItmPdCd.value = optionsAllItmPdCd.value.filter((v) => itmKndCd === v.itmKndCd);
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/Install-assign-set/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: toolParts, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(toolParts);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  pageInfo.value.pageIndex = 1;
  // 조회버튼 클릭 시에만 총 건수 조회하도록
  pageInfo.value.needTotalCount = true;
  await fetchData();
}

// 삭제 버튼 클릭
async function onClickDelete() {
  const view = grdMainRef.value.getView();

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deletedRows.length > 0) {
    await dataService.delete('/sms/wells/service/Install-assign-set/delete-Inst-set', { data: [...deletedRows] });

    notify(t('MSG_ALT_DELETED')); // 삭제되었습니다.
    await onClickSearch();
  }
}

// 행추가 버튼 클릭
async function onClickAddRow() {
  const view = grdMainRef.value.getView();

  gridUtil.insertRowAndFocus(view, 0, {

  });
}

// 저장 버튼 클릭
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/service/Install-assign-set/create-Inst-set', changedRows);

  notify(t('MSG_ALT_SAVE_DATA')); // 저장되었습니다.
  await onClickSearch();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: 'InstassignSet',
    timePostfix: true,
  });
}

await Promise.all([
  codeFilter(),
  getProducts(),
  onChangeItmKndCd(),
]);

onMounted(async () => {
  await fetchData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [{ fieldName: 'sapMatCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'apyStrtdt' },
    { fieldName: 'apyEnddt' },
    { fieldName: 'rstrCndtVal2' },
    { fieldName: 'rstrCndtSrnMarkCn' },
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '120', styleName: 'text-center', editable: false },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '120', styleName: 'text-center', editable: false },
    { fieldName: 'pdNm',
      header: t('MSG_TXT_ITM_NAME'),
      width: '200',
      styleName: 'text-left',
      editable: true,
      editor: { type: 'dropdown' },
      options: selectCodes.value,
    },
    { fieldName: 'apyStrtdt', header: ('최초등록일'), width: '100', styleName: 'text-center', datetimeFormat: 'date', editable: false },
    { fieldName: 'apyEnddt', header: ('변경일'), width: '100', styleName: 'text-center', datetimeFormat: 'date', editable: false },
    { fieldName: 'rstrCndtVal2', header: ('설치배정 가능일'), width: '120', styleName: 'text-center', editor: { type: 'btdate' }, editable: true, datetimeFormat: 'date' },
    { fieldName: 'rstrCndtSrnMarkCn', header: t('알림문구'), width: '400', editable: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  view.onGetEditValue = async (grid, index, editResult) => {
    grid.checkItem(index.itemIndex, true);

    if (isEmpty(editResult.value)) {
      grid.setValue(index.dataRow, 'pdNm', '');
      grid.setValue(index.dataRow, 'pdCd', '');
      return;
    }

    grid.setValue(index.dataRow, index.fieldName, editResult.value);

    if (index.fieldName === 'pdNm') {
      grid.setValue(index.dataRow, 'pdCd', editResult.value);
    }
  };
});
</script>
