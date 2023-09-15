<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC
 2. 프로그램 ID : [K-W-SV-U-0209P01] WwsnbNewPdctMThreeAcuAfSvRtP - M+3 출시일 등록
 3. 작성자 : gs.piit231
 4. 작성일 : 2023.09.07
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
  -
 ****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
    title="M+3 출시일 등록"
    no-action
  >
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change="onClickSearch"
        />
      </template>
      <!-- 삭제 -->
      <kw-btn
        v-permission:delete
        :label="$t('MSG_BTN_DEL')"
        grid-action
        @click="onClickDelete"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <!-- 저장 -->
      <kw-btn
        v-permission:create
        :label="$t('MSG_BTN_SAVE')"
        grid-action
        @click="onClickSave"
      />
      <!-- 행추가 -->
      <kw-btn
        v-permission:create
        :label="$t('MSG_BTN_ROW_ADD')"
        grid-action
        @click="onClickAddRow"
      />
    </kw-action-top>

    <kw-grid
      ref="grdPopupRef"
      name="grdPopup"
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
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal, codeUtil, getComponentType, useMeta, gridUtil } from 'kw-lib';
import { isEmpty } from 'lodash-es';
// import smsCommon from '~sms-wells/service/composables/useSnCode';

const { t } = useI18n();
const { getConfig } = useMeta();
const { notify } = useGlobal();

const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS', // 페이징 옵션
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdPopupRef = ref(getComponentType('KwGrid'));

const props = defineProps({
  pdGrp: { type: String, default: '' },
  pdCd: { type: String, default: '' },
});

const searchParams = ref({
  pdGrp: isEmpty(props.pdGrp) ? '' : props.pdGrp, // 상품그룹
  pdCd: isEmpty(props.pdGrp) ? '' : props.pdCd, // 상품명
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const pdList = await dataService.get('/sms/wells/service/newpd-m-three-acu-af-sv-rt/pd-result/paging', { params: searchParams.value, ...pageInfo.value });
  console.log('pdList.data >>>>', pdList.data);
  const { list, pageInfo: pagingResult } = pdList.data;
  pageInfo.value = pagingResult;

  const view = grdPopupRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

// 행추가 버튼 클릭
async function onClickAddRow() {
  const view = grdPopupRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {});
}

function validateIsApplyRowExists() {
  const view = grdPopupRef.value.getView();
  if (view.getCheckedItems().length === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return false;
  }
  return true;
}

async function onClickSave() {
  if (!validateIsApplyRowExists()) return;

  const view = grdPopupRef.value.getView();
  console.log('onClickSave view >>>', view);

  if (!await gridUtil.alertIfIsNotModified(view)) {
    const changedRows = gridUtil.getChangedRowValues(view);
    console.log('changedRows >?>>>>', changedRows);
    await dataService.post('/sms/wells/service/newpd-m-three-acu-af-sv-rt/pd-result-changes', changedRows);

    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

// 삭제 버튼 클릭
async function onClickDelete() {
  const view = grdPopupRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  const pdCds = deletedRows.map(({ svpdPdCd }) => svpdPdCd);
  if (deletedRows.length > 0) {
    console.log('deletedRows >?>>>>', deletedRows);
    await dataService.delete('/sms/wells/service/newpd-m-three-acu-af-sv-rt/pd-result-changes', { params: { pdCds } });

    notify(t('MSG_ALT_DELETED')); // 삭제되었습니다.
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'svpdNmAbbr1' },
    { fieldName: 'svpdNmKor' },
    { fieldName: 'sellStrtdt' },
    { fieldName: 'sellEnddt' },
    { fieldName: 'svpdPdCd' },
  ];

  const columns = [
    { fieldName: 'svpdNmAbbr1', header: t('MSG_TXT_PD_GRP'), width: '200', editable: true }, // 상품그룹
    { fieldName: 'svpdNmKor', header: t('MSG_TXT_PRDT_NM'), width: '418', editable: true }, // 상품명
    { fieldName: 'sellStrtdt', header: t('출시일'), width: '150', styleName: 'text-center', editor: { type: 'date', datetimeFormat: 'yyyy-MM-dd' } }, // 출시일
    { fieldName: 'sellEnddt', header: t('MSG_TXT_END_DATE'), width: '150', styleName: 'text-center', editor: { type: 'date', datetimeFormat: 'yyyy-MM-dd' } }, // 종료일
    { fieldName: 'svpdPdCd', visible: false }, // 상품코드
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  // data.setRows([
  //   { col1: '비데', col2: '부산 북구 만덕3로 33번길 4-1', col3: '2021-10-06', col4: '2021-10-06' },
  //   { col1: '비데', col2: '부산 북구 만덕3로 33번길 4-1', col3: '2021-10-06', col4: '2021-10-06' },
  //   { col1: '비데', col2: '부산 북구 만덕3로 33번길 4-1', col3: '2021-10-06', col4: '2021-10-06' },
  //   { col1: '비데', col2: '부산 북구 만덕3로 33번길 4-1', col3: '2021-10-06', col4: '2021-10-06' },
  //   { col1: '비데', col2: '부산 북구 만덕3로 33번길 4-1', col3: '2021-10-06', col4: '2021-10-06' },
  //   { col1: '비데', col2: '부산 북구 만덕3로 33번길 4-1', col3: '2021-10-06', col4: '2021-10-06' },
  //   { col1: '비데', col2: '부산 북구 만덕3로 33번길 4-1', col3: '2021-10-06', col4: '2021-10-06' },
  //   { col1: '비데', col2: '부산 북구 만덕3로 33번길 4-1', col3: '2021-10-06', col4: '2021-10-06' },
  //   { col1: '비데', col2: '부산 북구 만덕3로 33번길 4-1', col3: '2021-10-06', col4: '2021-10-06' },
  //   { col1: '비데', col2: '부산 북구 만덕3로 33번길 4-1', col3: '2021-10-06', col4: '2021-10-06' },
  // ]);
}

onMounted(async () => {
  await fetchData();
});

</script>
