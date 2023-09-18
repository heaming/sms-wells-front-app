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
          @change="fetchData"
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
      :visible-rows="10"
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
import { useDataService, useGlobal, codeUtil, getComponentType, useMeta, gridUtil, stringUtil, defineGrid } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { notify } = useGlobal();
const { getConfig } = useMeta();

const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS', // 페이징 옵션
  'PD_GRP_CD', // 상품그룹코드
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdPopupRef = ref(getComponentType('KwGrid'));

// 상품그룹코드 리스트
const pdGrpList = ref([]);
// 상품명 리스트
const pdGrpDtlList = ref([]);
async function getPdDtlList() {
  // 상품그룹코드 setting
  pdGrpList.value = codes.PD_GRP_CD;

  const pdDtlList = await dataService.get('/sms/wells/service/newpd-m-three-acu-af-sv-rt/pd-dtl-list');
  if (pdDtlList.data.length > 0) {
    pdGrpDtlList.value = pdDtlList.data;
  }
}
await getPdDtlList();

const props = defineProps({
  pdGrp: { type: String, default: '' },
  pdCd: { type: String, default: '' },
});

const searchParams = ref({
  pdGrp: isEmpty(props.pdGrp) ? '' : props.pdGrp, // 상품그룹
  pdCd: isEmpty(props.pdGrp) ? '' : props.pdCd, // 상품명
});
let cachedParams;

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  const pdList = await dataService.get('/sms/wells/service/newpd-m-three-acu-af-sv-rt/pd-result/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = pdList.data;
  pageInfo.value = pagingResult;

  const view = grdPopupRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

// 행추가 버튼 클릭
async function onClickAddRow() {
  const view = grdPopupRef.value.getView();

  gridUtil.insertRowAndFocus(view, 0, {
    lncStrtdt: dayjs().format('YYYYMMDD'),
    lncExdt: dayjs().format('YYYYMMDD'),
    tempField: 'Y',
  });
}

async function onClickSave() {
  const view = grdPopupRef.value.getView();
  const changedRows = gridUtil.getChangedRowValues(view);
  if (await gridUtil.alertIfIsNotModified(view)) return;

  changedRows.forEach((v) => {
    console.log('changeRows v >>>>>>>>', v);
    if (v.rowState === 'created') {
      console.log('created');
      if (!v.pdGrpCd) {
        notify(t('MSG_ALT_BE_CHECK_IT', [t('MSG_TXT_PD_GRP')]));
        return;
      }
      if (!v.nmKor) {
        notify(t('MSG_ALT_BE_CHECK_IT', [t('MSG_TXT_PRDT_NM')]));
        return;
      }

      // 신규 등록시 상품대분류 코드 셋팅
      v.pdHclsfId = pdGrpDtlList.value.filter((pdListData) => pdListData.svpdItemGr === v.pdGrpCd)[0].pdHclsfId;
      v.pdCd = v.nmKor;
    }
  });
  console.log('changedRows >>>>>', changedRows);

  await dataService.post('/sms/wells/service/newpd-m-three-acu-af-sv-rt/pd-result-changes', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

// 삭제 버튼 클릭
async function onClickDelete() {
  const view = grdPopupRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  const pdCds = deletedRows.map(({ pdCd }) => pdCd);
  if (deletedRows.length > 0) {
    await dataService.delete('/sms/wells/service/newpd-m-three-acu-af-sv-rt/pd-result-changes', { params: { pdCds } });

    notify(t('MSG_ALT_DELETED')); // 삭제되었습니다.
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const pdGrpClass = { id: 'pdGrpClass', levels: 1, keys: [], values: [] };
  const pdDtlClass = { id: 'pdDtlClass', levels: 2, tags: [], keys: [], values: [] };

  pdGrpList.value.forEach((v) => {
    pdGrpClass.keys.push(v.codeId);
    pdGrpClass.values.push(v.codeName);
  });
  pdGrpDtlList.value.forEach((v) => {
    pdDtlClass.tags.push(v.cd);
    pdDtlClass.keys.push([v.svpdItemGr, v.cd]);
    pdDtlClass.values.push(v.cdNm);
  });
  // view.addLookupSource(pdGrpList);
  view.addLookupSource(pdDtlClass);

  const fields = [
    { fieldName: 'pdGrpCd' },
    { fieldName: 'nmKor' },
    { fieldName: 'lncStrtdt' },
    { fieldName: 'lncExdt' },
    { fieldName: 'chk' },
    { fieldName: 'code' },
    { fieldName: 'codeName' },
    { fieldName: 'itmKndCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdHclsfId' },
    { fieldName: 'pdTpCd' },
    { fieldName: 'tempField' }, // 행 추가시 상품그룹, 상품명 출력여부 확인용 field
  ];

  const columns = [
    { // 상품그룹
      fieldName: 'pdGrpCd',
      header: t('MSG_TXT_PD_GRP'),
      width: '200',
      lookupDisplay: true,
      values: pdGrpClass.keys,
      labels: pdGrpClass.values,
      editor: { type: 'dropdown' },
      rules: 'required',
      styleCallback(grid, dataCell) {
        const editableYn = grid.getValue(dataCell.item.dataRow, 'tempField');
        return (editableYn === 'Y') ? { editable: true } : { editable: false };
      },
    },
    { // 상품명
      fieldName: 'nmKor',
      header: t('MSG_TXT_PRDT_NM'),
      width: '418',
      styleName: 'text-center',
      lookupDisplay: true,
      lookupSourceId: 'pdDtlClass',
      lookupKeyFields: ['pdGrpCd', 'nmKor'],
      values: pdDtlClass.keys,
      labels: pdDtlClass.values,
      editor: { type: 'dropdown' },
      rules: 'required',
      styleCallback(grid, dataCell) {
        const editableYn = grid.getValue(dataCell.item.dataRow, 'tempField');
        return (editableYn === 'Y') ? { editable: true } : { editable: false };
      },
    },
    { // 출시일
      fieldName: 'lncStrtdt',
      header: t('출시일'),
      width: '150',
      styleName: 'text-center',
      rules: 'required',
      editor: {
        type: 'date',
        datetimeFormat: 'yyyy-MM-dd',
      },
      displayCallback: (g, i) => {
        const { lncStrtdt } = gridUtil.getRowValue(g, i.itemIndex);
        return stringUtil.getDateFormat(lncStrtdt);
      },
    },
    { // 종료일
      fieldName: 'lncExdt',
      header: t('MSG_TXT_END_DATE'),
      width: '150',
      styleName: 'text-center',
      rules: 'required',
      editor: {
        type: 'date',
        datetimeFormat: 'yyyy-MM-dd',
      },
      displayCallback: (g, i) => {
        const { lncExdt } = gridUtil.getRowValue(g, i.itemIndex);
        return stringUtil.getDateFormat(lncExdt);
      },
    },
    { fieldName: 'chk', visible: false },
    { fieldName: 'code', visible: false }, // 상품코드
    { fieldName: 'codeName', visible: false }, // 상품코드  + 상품명
    { fieldName: 'itmKndCd', visible: false }, // 품목종류코드
    { fieldName: 'pdCd', visible: false }, // 상품코드
    { fieldName: 'pdHclsfId', visible: false }, // 상품대분류
    { fieldName: 'pdTpCd', visible: false }, // 상품유형코드
    { fieldName: 'tempField', visible: false }, // 행 추가시 상품그룹, 상품명 출력여부 확인용 field
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  // view.onCellEdited = (grid, itemIndex) => {
  //   const { fieldName } = grid.getCurrent();
  //   const pdGrpCd = grid.getValue(itemIndex, 'pdGrpCd');

  //   if (fieldName === 'nmKor') {
  //     const filterData = pds.value.filter((v) => v.svpdItemGr === pdGrpCd)
  //       .map((rtnData) => ({ codeId: rtnData.cd, codeName: rtnData.cdNm }));
  //     grid.setValue(itemIndex, fieldName, JSON.stringify(filterData));
  //   }
  // };

  // view.onCellClicked = (grid, index) => {
  //   const { fieldName } = grid.getCurrent();
  //   console.log('fieldName >>>', fieldName);

  //   if (fieldName === 'nmKor') {
  //     const pdGrpCd = grid.getValue(index.dataRow, 'pdGrpCd');

  //     const filterData = pds.value.filter((v) => v.svpdItemGr === pdGrpCd)
  //       .map((rtnData) => ({ codeId: rtnData.cd, codeName: rtnData.cdNm }));
  //     // console.log('filterData >>>', JSON.stringify(filterData));
  //     console.log(filterData);
  //     // nmKor <-filterData
  //     grid.setValue(index.dataRow, fieldName, JSON.stringify(filterData));
  //   }
  // };
});

onMounted(async () => {
  await fetchData();
});
</script>
