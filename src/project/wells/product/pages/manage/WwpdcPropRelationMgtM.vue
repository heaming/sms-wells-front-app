<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 상품 - 상품운영관리(PDC)
2. 프로그램 ID : WwpdcPropRelationMgtM - 교재/자재 - 연결상품TAB (W-PD-U-0031M01)
3. 작성자 : junho.bae
4. 작성일 : 2023.07.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 >> 교재/자재 >> 연결상품 프로그램
****************************************************************************************************
--->
<template>
  <h3>{{ $t('MSG_TXT_PRDT_RELATION_CONF') }}</h3>
  <kw-action-top>
    <template #left>
      <!--관계구분 선택-->
      <span class="kw-fc--black1">{{ $t('MSG_TXT_RELATION_CLSF') }} {{ $t('MSG_TXT_SELT') }}</span>
      <kw-select
        v-model="searchParams.pdRelTpCd"
        dense
        class="ml12 w150"
        :options="codes.PDCT_REL_DV_CD"
      />
      <kw-input
        v-model="searchParams.searchValue"
        :maxlength="100"
        dense
        clearable
        icon="search"
        class="ml8 w441"
        @click-icon="fetchData"
      />
    </template>
    <kw-btn
      v-permission:delete
      grid-action
      :disable="totalCount === 0"
      :label="$t('MSG_BTN_DEL')"
      @click="onClickRemove"
    />
  </kw-action-top>

  <!--
    :visible-rows="pageInfo.pageSize"
    visible-rows="10"
  -->
  <kw-grid
    ref="grdMainRef"
    name="grdMainMgt"
    :need-context-menu="false"
    @init="initGrdMain"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useGlobal, defineGrid, getComponentType, gridUtil, stringUtil } from 'kw-lib'; // useMeta
import { isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import pdConst from '~sms-common/product/constants/pdConst';
import { getOverPeriodByRelProd, getGridRowCount, onCellEditRelProdPeriod } from '~sms-common/product/utils/pdUtil'; // getAlreadyItems

/* eslint-disable no-use-before-define */
defineExpose({
  validateProps, getSaveData, isModifiedProps, resetData,
});

const { t } = useI18n();
const { notify, modal } = useGlobal(); // confirm
const grdMainRef = ref(getComponentType('KwGrid'));

const props = defineProps({
  pdTpCd: { type: String, required: true },
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const totalCount = ref(0);
const searchParams = ref({
  pdRelTpCd: '',
  searchValue: '',
});

const codes = await codeUtil.getMultiCodes('PDCT_REL_DV_CD', 'PD_TEMP_SAVE_CD');
const initLoadData = ref([]);

async function checkGrdDataCount() {
  const view = grdMainRef.value.getView();
  const rowValues = gridUtil.getAllRowValues(view, false);
  console.log('totalCount.value', totalCount.value);
  totalCount.value = rowValues.length;
}

async function resetData() {
  // TODO Grid 에서 초기화버튼 기능을 어떻게 정의할지 확인필요.
}

// async function insertCallbackRows(view, rtn, pdRelTpCd) {
//   console.log('rtn', rtn);
//   if (rtn.result) {
//     if (Array.isArray(rtn.payload.checkedRows) && rtn.payload.checkedRows.length > 1) {
//       const data = view.getDataSource();
//       const rows = rtn.payload.checkedRows.map((item) => ({
//         ...item, [pdConst.REL_OJ_PD_CD]: item.pdCd, [pdConst.PD_REL_TP_CD]: pdRelTpCd }));
//       console.log('rows', rows);
//       const okRows = await getCheckAndNotExistRows(view, rows);
//       if (okRows && okRows.length) {
//         await data.insertRows(0, okRows);
//         await gridUtil.focusCellInput(view, 0);
//       }
//     } else {
//       const row = Array.isArray(rtn.payload) ? rtn.payload[0].checkedRows[0] : rtn.payload.checkedRows[0];
//       row[pdConst.PD_REL_TP_CD] = pdRelTpCd;
//       row[pdConst.REL_OJ_PD_CD] = row.pdCd;
//       // DEF_3623 row.sapPdctSclsrtStrcVal = row.sapMatCd;

//       const okRows = await getCheckAndNotExistRows(view, [row]);
//       if (okRows && okRows.length) {
//         await gridUtil.insertRowAndFocus(view, 0, okRows[0]);
//       }
//     }
//     await checkGrdDataCount();
//   }
// }

// async function getCheckAndNotExistRows(view, rows) {
//   // const alreadyItems = getAlreadyItems(view, rows, 'pdCd');
//   const alreadyItems = getAlreadyItems(view, rows, 'ojPdCd', 'pdRelTpCd');
//   console.log(rows, rows.length, alreadyItems.length);

//   if (rows.length === alreadyItems.length) {
//     notify(t('MSG_ALT_ALREADY_RGST', [t('MSG_TXT_PRDT')]));
//     return [];
//   }
//   if (alreadyItems.length > 0) {
//     if (alreadyItems.length === 1) {
//       // notify(t('MSG_ALT_ALREADY_RGST_CUT', [alreadyItems[0].pdNm]));
//       notify(t('MSG_ALT_ALREADY_RGST_CUT', [`# ${alreadyItems[0].pdNm} #`]));
//     } else {
//       // notify(t('MSG_ALT_ALREADY_RGST_CUT'
//       // , [t('MSG_TXT_EXID_CNT', [alreadyItems[0].pdCd, alreadyItems.length - 1])]));
//       notify(t('MSG_ALT_ALREADY_RGST_CUT',
// [t('MSG_TXT_EXID_CNT', [`# ${alreadyItems[0].pdNm} #`, alreadyItems.length - 1])]));
//     }
//     const alreadyPdCds = alreadyItems.reduce((rtns, item) => { rtns.push(item.pdCd); return rtns; }, []);
//     return rows.reduce((rtns, item) => {
//       if (!alreadyPdCds.includes(item.pdCd)) {
//         rtns.push(item);
//       }
//       return rtns;
//     }, []);
//   }
//   return rows;
// }

// component: 'ZpdcStandardProductListP', // 기준정보 팝업
async function fetchData() {
  if (isEmpty(searchParams.value.pdRelTpCd)) {
    // 관계구분 (을)를 먼저 선택해주세요.
    notify(t('MSG_ALT_CHK_ID', [t('MSG_TXT_RELATION_CLSF')]));
    return false;
  }

  const rtn = await modal({
    component: 'ZwpdcMaterialsSelectListP', // 교재자재 팝업
    componentProps: {
      searchType: searchParams.value.pdRelTpCd,
      searchValue: searchParams.value.searchValue,
      searchLvl: 3,
    },
  });

  // 23-03-23 ref. WwpdcStandardMgtMRelChg 참조하여 중복 체크 로직 추가.
  // const view = grdMainRef.value.getView();
  // await insertCallbackRows(view, rtn, rtn.payload.pdRelTpCd);

  if (isEmpty(rtn) || !rtn.result || isEmpty(rtn.payload) || rtn.payload.length < 1) {
    return;
  }
  const currentTime = dayjs().format('YYYYMMDDHHmmss');
  const view = grdMainRef.value.getView();
  const data = view.getDataSource();
  const insertRows = Array.isArray(rtn.payload.checkedRows) ? rtn.payload.checkedRows : [rtn.payload.checkedRows];

  console.log('insertRows', insertRows);
  // MSG_ALT_PD_REL_NO_REMOVE

  let lastRow = 0;
  insertRows.forEach((row) => {
    row[pdConst.REL_PD_ID] = stringUtil.getUid('REL_TMP');
    row[pdConst.PD_REL_TP_CD] = searchParams.value.pdRelTpCd;
    row[pdConst.REL_OJ_PD_CD] = row.pdCd;
    const rowValues = gridUtil.getAllRowValues(view);
    let isValid = false;
    // pdCd => ojPdCd
    const alreadyPdCdRows = rowValues.filter((item) => item.ojPdCd === row.ojPdCd);

    if (alreadyPdCdRows && alreadyPdCdRows.length) {
      const lastVlEndDtm = alreadyPdCdRows.reduce((maxDt, item) => {
        maxDt = Number(item.vlEndDtm) > maxDt ? Number(item.vlEndDtm) : maxDt;
        return maxDt;
      }, 0);
      if (currentTime > lastVlEndDtm) {
        isValid = true;
      }
      lastRow = alreadyPdCdRows[0].dataRow;
    } else {
      isValid = true;
      lastRow = 0;
    }
    if (isValid) {
      row.vlStrtDtm = currentTime;
      row.vlEndDtm = 99991231235959;
    }
    data.insertRow(lastRow, row);
  });
  totalCount.value = getGridRowCount(view);
  await gridUtil.focusCellInput(view, lastRow);
}

async function onClickRemove() {
  // const view = grdMainRef.value.getView();
  // const chkRows = gridUtil.getCheckedRowValues(view);
  // if (chkRows.length === 0) {
  //   notify(t('MSG_ALT_DEL_NO_DATA'));
  //   return false;
  // }

  // // 선택된 항목을 삭제하시겠습니까?
  // if (!await confirm(t('MSG_ALT_WANT_DEL_SEL_ITEM'))) return false;

  // const dataProvider = view.getDataSource();
  // dataProvider.removeRows(chkRows.map((v) => v.dataRow));

  // await checkGrdDataCount();

  const view = grdMainRef.value.getView();
  const checkedRows = view.getCheckedRows();
  const removeCreateRows = [];
  let isDbDataRemove = false;

  checkedRows.forEach((row) => {
    const item = gridUtil.getRowValue(view, row);
    if (item.rowState === 'created' || isEmpty(item[pdConst.REL_PD_ID]) || item[pdConst.REL_PD_ID].startsWith('REL_TMP')) {
      removeCreateRows.push(row);
    } else {
      // const endSetTime = dayjs().subtract(1, 'second').format('YYYYMMDDHHmmss');
      // view.setValue(row, 'vlEndDtm', endSetTime);
      isDbDataRemove = true;
    }
  });

  if (removeCreateRows.length) view.getDataSource().removeRows(removeCreateRows);

  if (isDbDataRemove) notify(t('MSG_ALT_PD_REL_NO_REMOVE'));

  view.setAllCheck(false, true);
  view.clearCurrent();
  totalCount.value = getGridRowCount(view);
}

async function validateProps() {
  console.log('relationMgt validateProps()');
  // const validOk = true;
  // return validOk;
  let isValid = true;
  const view = grdMainRef.value?.getView();

  // 필수값 체크
  isValid = await gridUtil.validate(view, {
    isChangedOnly: false,
  });

  // 적용일자 중복 체크
  if (isValid) {
    const rowValues = gridUtil.getAllRowValues(view);
    if (rowValues.length < 1) {
      return isValid;
    }
    let dupItem;
    await Promise.all(rowValues.map(async (item1) => {
      if (isValid) {
        dupItem = (await getOverPeriodByRelProd(view, item1));
        if (dupItem) {
          isValid = false;
        }
      }
    }));
    if (!isValid) {
      notify(t('MSG_ALT_EXIST_DUP_RANGE_PD', [dupItem]));
    }
  }
  return isValid;
}

async function isModifiedProps() {
  return gridUtil.isModified(grdMainRef.value?.getView());
}

async function getSaveData() {
  const subList = { };
  subList[pdConst.TBL_PD_REL] = gridUtil.getAllRowValues(grdMainRef.value.getView());
  // console.log('subListsubListsubListsubListsubList ', subList);
  return subList;
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const columns = [
  { fieldName: 'pdRelId', header: 'PK', width: '0', visible: false },
  // 상태
  { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '80', styleName: 'text-center', options: codes.PD_TEMP_SAVE_CD, editable: false },
  // 적용시작일자
  { fieldName: 'vlStrtDtm',
    header: t('MSG_TXT_APY_STRTDT'),
    width: '190',
    editor: { type: 'date' },
    dataType: 'datetime',
    datetimeFormat: 'datetime',
    styleName: 'text-center',
    rules: 'required',
    editable: true,
  },
  // 적용종료일자
  { fieldName: 'vlEndDtm',
    header: t('MSG_TXT_APY_ENDDT'),
    width: '190',
    editor: { type: 'date' },
    dataType: 'datetime',
    datetimeFormat: 'datetime',
    styleName: 'text-center',
    rules: 'required',
    editable: true,
  },
  { fieldName: 'pdRelTpCd', header: t('MSG_TXT_RELATION_CLSF'), width: '106', styleName: 'text-center', options: codes.PDCT_REL_DV_CD, editable: false }, /* 관계구분 */
  { fieldName: 'pdClsfNm', header: t('MSG_TXT_CLSF'), width: '176', styleName: 'text-left', editable: false }, /* 분류 */
  { fieldName: 'pdNm', header: t('MSG_TIT_MATERIAL_NM'), width: '382', styleName: 'text-left', editable: false }, /* 교재/자재명 */
  // { fieldName: 'sapPdctSclsrtStrcVal', header: t('MSG_TXT_MATI_CD'), width: '121' }, /* 자재코드 교재/제재코드 */
  { fieldName: 'sapMatCd', header: t('MSG_TXT_MATI_CD'), width: '121', styleName: 'text-center', editable: false }, /* 자재코드 교재/제재코드 */
  { fieldName: 'modelNo', header: t('MSG_TXT_PD_MODEL_NO'), width: '152', styleName: 'text-center', editable: false }, /* 모델No */
  { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ABBR'), width: '226', styleName: 'text-left', editable: false }, /* 약어 */
  { fieldName: 'ostrCnrCd', header: t('MSG_TIT_SHIPPING_CENTER'), width: '214', styleName: 'text-left', editable: false }, /* 출고센터 */
  { fieldName: 'pdTpCd', header: t('MSG_TIT_PRDT_TYPE'), width: '0', visible: false, editable: false }, /* 상품종류 */
  { fieldName: 'ojPdCd', header: t('MSG_TIT_TARGET_PRDT_CD'), width: '0', visible: false, editable: false }, /* 대상상품코드 */
  { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT'), width: '0', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', visible: false }, /* 등록일 */
  { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_RGST_USR'), width: '0', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true, visible: false }, /* 등록자 */
  { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '0', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', visible: false }, /* 최종수정일 */
  { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '0', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true, visible: false }, /* 최종수정자 */
  //   NameTag Parameter
  { fieldName: 'fstRgstUsrId', header: 'RGST_ID', width: '0', visible: false },
  { fieldName: 'fnlMdfcUsrId', header: 'MDFC_ID', width: '0', visible: false },
];

// 수정모드 통합 DATA Grid
const initGrdMain = defineGrid((data, view) => {
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }))
    .filter((visible) => visible);
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.checkBar.visible = true;
  view.editOptions.editable = true;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    console.log('itemIndex', itemIndex);
    if (['fstRgstUsrNm', 'fnlMdfcUsrNm'].includes(column)) {
      const { fstRgstUsrId, fnlMdfcUsrId } = gridUtil.getRowValue(g, itemIndex);
      const userId = column === 'fstRgstUsrNm' ? fstRgstUsrId : fnlMdfcUsrId;
      await modal({ component: 'ZwcmzUserDtlP', componentProps: { userId } });
    }
  };

  view.onCellClicked = (g, clickData) => {
    if (clickData.cellType === 'data') {
      // Data Row Click시 checkbar toggle 적용
      view.checkRow(clickData.dataRow, !view.getCheckedItems().includes(clickData.dataRow));
    }
  };

  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    await onCellEditRelProdPeriod(view, grid, itemIndex, row, fieldIndex);
  };
});

onMounted(async () => {
  if (!isEmpty(props.initData[pdConst.TBL_PD_REL])) {
    setData(props.initData[pdConst.TBL_PD_REL]);
  }
});

async function setData(newInitData) {
  if (!isEmpty(newInitData)) {
    // const relData = props.initData[pdConst.TBL_PD_REL];
    initLoadData.value = props.initData[pdConst.TBL_PD_REL];
    if (isEmpty(initLoadData.value)) return;

    const grd1DataProvider = grdMainRef.value.getView().getDataSource();
    grd1DataProvider.fillJsonData(initLoadData.value, { fillMode: 'set' });

    await checkGrdDataCount();
  }
}

watch(() => props.initData[pdConst.TBL_PD_REL], setData, { deep: true });

</script>
<style scoped></style>
