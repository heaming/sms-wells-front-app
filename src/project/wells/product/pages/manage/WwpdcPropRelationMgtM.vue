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
import { codeUtil, useGlobal, defineGrid, getComponentType, gridUtil, stringUtil } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import pdConst from '~sms-common/product/constants/pdConst';
import { getOverPeriodByRelProd, getGridRowCount, onCellEditRelProdPeriod, setPdGridRows } from '~sms-common/product/utils/pdUtil';

/* eslint-disable no-use-before-define */
defineExpose({
  validateProps, getSaveData, isModifiedProps, resetData, init,
});

const { t } = useI18n();
const { notify, modal } = useGlobal();
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

// 데이터 초기화
async function resetData() {
  initLoadData.value = {};
  if (grdMainRef.value?.getView()) {
    gridUtil.reset(grdMainRef.value.getView());
  }
}

// 컴포넌트 초기화
async function init() {
  const view = grdMainRef.value?.getView();
  if (view) await gridUtil.init(view);
}

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

  if (isEmpty(rtn) || !rtn.result || isEmpty(rtn.payload) || rtn.payload.length < 1) {
    return;
  }
  const currentTime = dayjs().format('YYYYMMDDHHmmss');
  const view = grdMainRef.value.getView();
  const data = view.getDataSource();
  const insertRows = Array.isArray(rtn.payload.checkedRows) ? rtn.payload.checkedRows : [rtn.payload.checkedRows];
  // console.log('insertRows', insertRows);

  let lastRow = 0;
  insertRows.forEach((row) => {
    row[pdConst.REL_PD_ID] = stringUtil.getUid('REL_TMP');
    row[pdConst.PD_REL_TP_CD] = searchParams.value.pdRelTpCd;
    row[pdConst.REL_OJ_PD_CD] = row.pdCd;
    const rowValues = gridUtil.getAllRowValues(view);
    let isValid = false;

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
  const view = grdMainRef.value.getView();
  const checkedRows = view.getCheckedRows();
  const removeCreateRows = [];
  let isDbDataRemove = false;

  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  checkedRows.forEach((row) => {
    const item = gridUtil.getRowValue(view, row);
    if (item.rowState === 'created' || isEmpty(item[pdConst.REL_PD_ID]) || item[pdConst.REL_PD_ID].startsWith('REL_TMP')) {
      removeCreateRows.push(row);
    } else {
      isDbDataRemove = true;
    }
  });

  if (removeCreateRows.length) view.getDataSource().removeRows(removeCreateRows);

  // 등록된 기준정보는 삭제할수 없습니다, 적용일자를 변경하십시오
  if (isDbDataRemove) notify(t('MSG_ALT_PD_REL_NO_REMOVE'));

  view.setAllCheck(false, true);
  view.clearCurrent();
  totalCount.value = getGridRowCount(view);
}

async function validateProps() {
  let isValid = true;
  const view = grdMainRef.value?.getView();

  // 필수값 체크
  isValid = await gridUtil.validate(view, {
    isChangedOnly: false,
  });

  console.log('isValid : ', isValid);
  // 적용일자 중복 체크
  if (isValid) {
    const rowValues = gridUtil.getAllRowValues(view);
    if (rowValues.length < 1) {
      return isValid;
    }
    let dupItem;
    await Promise.all(rowValues.map(async (item1) => {
      // 비동기방식 설정 조건문
      if (isValid && await getOverPeriodByRelProd(view, item1, 'pdRelTpCd')) {
        dupItem = (await getOverPeriodByRelProd(view, item1, 'pdRelTpCd'));
        console.log('dupItem : ', dupItem);
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
  return subList;
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const columns = [
  { fieldName: 'pdRelId', header: 'PK', width: '0', visible: false },
  { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT', null, '상태'), width: '80', styleName: 'text-center', options: codes.PD_TEMP_SAVE_CD, editable: false },
  { fieldName: 'vlStrtDtm',
    header: t('MSG_TXT_APY_STRTDT', null, '적용시작일자'),
    width: '190',
    editor: { type: 'date' },
    dataType: 'datetime',
    datetimeFormat: 'datetime',
    styleName: 'text-center',
    rules: 'required',
    editable: true,
  },
  { fieldName: 'vlEndDtm',
    header: t('MSG_TXT_APY_ENDDT', null, '적용종료일자'),
    width: '190',
    editor: { type: 'date' },
    dataType: 'datetime',
    datetimeFormat: 'datetime',
    styleName: 'text-center',
    rules: 'required',
    editable: true,
  },
  { fieldName: 'pdRelTpCd', header: t('MSG_TXT_RELATION_CLSF', null, '관계구분'), width: '106', styleName: 'text-center', options: codes.PDCT_REL_DV_CD, editable: false },
  { fieldName: 'pdClsfNm', header: t('MSG_TXT_CLSF', null, '분류'), width: '176', styleName: 'text-left', editable: false },
  { fieldName: 'pdNm', header: t('MSG_TIT_MATERIAL_NM', null, '교재/자재명'), width: '382', styleName: 'text-left', editable: false },
  // { fieldName: 'sapPdctSclsrtStrcVal', header: t('MSG_TXT_MATI_CD'), width: '121' }, /* 자재코드 교재/제재코드 */
  { fieldName: 'sapMatCd', header: t('MSG_TXT_MATI_CD'), width: '121', styleName: 'text-center', editable: false }, /* 자재코드 교재/제재코드 */
  { fieldName: 'modelNo', header: t('MSG_TXT_PD_MODEL_NO', null, '모델No'), width: '152', styleName: 'text-center', editable: false },
  { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ABBR', null, '약어'), width: '226', styleName: 'text-left', editable: false },
  { fieldName: 'ostrCnrCd', header: t('MSG_TIT_SHIPPING_CENTER', null, '출고센터'), width: '214', styleName: 'text-left', editable: false },
  { fieldName: 'pdTpCd', header: t('MSG_TIT_PRDT_TYPE', null, '상품종류'), width: '0', visible: false, editable: false },
  { fieldName: 'ojPdCd', header: t('MSG_TIT_TARGET_PRDT_CD', null, '대상상품코드'), width: '0', visible: false, editable: false },
  { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT'), width: '0', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', visible: false },
  { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_RGST_USR'), width: '0', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true, visible: false },
  { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '0', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', visible: false },
  { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '0', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true, visible: false },
  //   NameTag Parameter
  { fieldName: 'fstRgstUsrId', header: 'RGST_ID', width: '0', visible: false },
  { fieldName: 'fnlMdfcUsrId', header: 'MDFC_ID', width: '0', visible: false },
];

// 수정모드 통합 DATA Grid
const initGrdMain = defineGrid((data, view) => {
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }))
    .filter((visible) => visible);
  fields.push({ fieldName: 'pdCd' });
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

// 리얼그리드 표시 오류 대응 임시코드
onActivated(async () => {
  await setData(initLoadData.value);
});

async function setData(newInitData) {
  if (!isEmpty(newInitData)) {
    initLoadData.value = cloneDeep(props.initData[pdConst.TBL_PD_REL]);
    if (isEmpty(initLoadData.value)) return;

    // const grd1DataProvider = grdMainRef.value.getView().getDataSource();
    // grd1DataProvider.fillJsonData(initLoadData.value, { fillMode: 'set' });
    const view = grdMainRef.value?.getView();
    if (view) {
      await setPdGridRows(view, initLoadData.value, pdConst.REL_PD_ID, [], true);
    }
    await checkGrdDataCount();
  } else {
    grdMainRef.value?.getView().getDataSource().clearRows();
  }
}

watch(() => props.initData, (initData) => {
  setData(initData[pdConst.TBL_PD_REL]);
}, { deep: true });

</script>
<style scoped></style>
