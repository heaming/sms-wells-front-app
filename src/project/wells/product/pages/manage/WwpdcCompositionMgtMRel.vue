<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcCompositionMgtMRel - 복합상품 등록/변경 - 연결상품 선택
                ( Z-PD-U-0020M02 )
3. 작성자 : jintae.choi
4. 작성일 : 2023.04.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 복합상품 등록/변경 - 연결상품 선택 프로그램
****************************************************************************************************
--->
<template>
  <!-- 동시구매가능 기준상품 -->
  <h3>{{ $t('MSG_TXT_STND_PRDT') }}</h3>
  <kw-action-top v-show="!props.readonly">
    <template #left>
      <!-- 기준상품 선택 -->
      <span class="kw-fc--black1">{{ $t('MSG_TXT_PD_SEL_STD') }}</span>
      <kw-select
        v-model="standardSearchType"
        dense
        class="ml12 w140"
        :options="standardSelectItems"
      />
      <kw-input
        v-model="standardSearchValue"
        maxlength="100"
        dense
        clearable
        icon="search"
        class="ml8 w250"
        @click-icon="onClickStandardSchPopup"
      />
    </template>
    <!-- 삭제 -->
    <kw-btn
      v-show="!props.readonly"
      grid-action
      dense
      :label="$t('MSG_BTN_DEL')"
      :disable="grdStandardRowCount === 0"
      @click="onClickStandardDelRows"
    />
  </kw-action-top>
  <kw-grid
    ref="grdStandardRef"
    name="grdMgtRelMain"
    @init="initStandardGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';
import { gridUtil, stringUtil, useGlobal, getComponentType } from 'kw-lib';
import { isEmpty, cloneDeep, isEqual } from 'lodash-es';
import { getGridRowCount, setPdGridRows, onCellEditRelProdPeriod, getOverPeriodByRelProd } from '~/modules/sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';

/* eslint-disable no-use-before-define */
defineExpose({
  resetData, init, getSaveData, isModifiedProps, validateProps,
});

const props = defineProps({
  pdCd: { type: String, default: null }, // 상품코드
  initData: { type: Object, default: null }, // 초기데이터
  codes: { type: Object, default: null }, // 공통코드
  readonly: { type: Boolean, default: false }, // 읽기전용
});

const { alert, modal, notify } = useGlobal();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdStandardRef = ref(getComponentType('KwGrid'));
const grdStandardRowCount = ref(0);

const currentPdCd = ref();
const currentInitData = ref({});

const standardSelectItems = reactive([
  // 기준상품명
  { codeId: pdConst.PD_SEARCH_NAME, codeName: t('MSG_TXT_PD_STD_NAME') },
  // 기준상품코드
  { codeId: pdConst.PD_SEARCH_CODE, codeName: t('MSG_TXT_PD_STD_CODE') },
]);

const standardSearchType = ref(pdConst.PD_SEARCH_NAME);
const standardSearchValue = ref();

const searchParams = ref({
  searchType: null,
  searchValue: null,
  exceptPdCd: null,
});

// 데이터 초기화
async function resetData() {
  currentPdCd.value = '';
  currentInitData.value = {};
  if (grdStandardRef.value?.getView()) gridUtil.reset(grdStandardRef.value.getView());
}

// 컴포넌트 초기화
async function init() {
  const standardView = grdStandardRef.value?.getView();
  if (standardView) await gridUtil.init(standardView);
}

// 저장 데이터
async function getSaveData() {
  // 미수정시 초기값 그대로 반환.
  if (!(await isModifiedProps())) {
    return {
      [pdConst.RELATION_PRODUCTS]: currentInitData.value[pdConst.RELATION_PRODUCTS],
      [pdConst.TBL_PD_REL]: currentInitData.value[pdConst.RELATION_PRODUCTS],
    };
  }

  const rowValues = gridUtil.getAllRowValues(grdStandardRef.value.getView());
  const rtnValues = { [pdConst.TBL_PD_REL]: rowValues ?? [] };
  if (rtnValues[pdConst.TBL_PD_REL]) {
    rtnValues[pdConst.RELATION_PRODUCTS] = cloneDeep(rtnValues[pdConst.TBL_PD_REL]);
  }
  return rtnValues;
}

// 수정 여부
async function isModifiedProps() {
  return gridUtil.isModified(grdStandardRef.value?.getView());
}

// 검증
async function validateProps() {
  let isValid = true;
  const standardView = grdStandardRef.value?.getView();

  // 필수값 체크
  isValid = await gridUtil.validate(standardView, {
    isChangedOnly: false,
  });

  // 적용일자 중복 체크
  if (isValid) {
    const rowValues = gridUtil.getAllRowValues(standardView);
    if (rowValues.length < 1) {
      return isValid;
    }
    let dupItem;
    await Promise.all(rowValues.map(async (item1) => {
      // 비동기방식 설정 조건문
      if (isValid && await getOverPeriodByRelProd(standardView, item1)) {
        dupItem = (await getOverPeriodByRelProd(standardView, item1));
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

// 추가 할 연결상품 선택 이후 처리
async function insertCallbackRows(view, rtn, pdRelTpCd) {
  if (isEmpty(rtn) || !rtn.result || isEmpty(rtn.payload) || rtn.payload.length < 1) {
    return;
  }

  const currentTime = dayjs().format('YYYYMMDDHHmmss');
  const data = view.getDataSource();
  const insertRows = Array.isArray(rtn.payload) ? rtn.payload : [rtn.payload];

  let lastRow = 0;
  insertRows.forEach((row) => {
    row[pdConst.REL_PD_ID] = stringUtil.getUid('REL_TMP');
    row[pdConst.PD_REL_TP_CD] = pdRelTpCd;
    row[pdConst.REL_OJ_PD_CD] = row.pdCd;
    const rowValues = gridUtil.getAllRowValues(view);
    let isValid = false;
    const alreadyPdCdRows = rowValues.filter((item) => item[pdConst.REL_OJ_PD_CD] === row[pdConst.REL_OJ_PD_CD]);
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
}

// 연결상품 삭제 체크
async function deleteCheckedRows(view) {
  const checkedRows = view.getCheckedRows();
  if (checkedRows.length === 0) {
    // 데이터를 선택해주세요.
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  const removeCreateRows = [];
  let isDbDataRemove = false;
  await Promise.all(checkedRows.map(async (row) => {
    const item = gridUtil.getRowValue(view, row);
    if (item.rowState === 'created' || isEmpty(item[pdConst.REL_PD_ID]) || item[pdConst.REL_PD_ID].startsWith('REL_TMP')) {
      removeCreateRows.push(row);
    } else {
      isDbDataRemove = true;
    }
  }));
  if (removeCreateRows.length) {
    view.getDataSource().removeRows(removeCreateRows);
  }
  if (isDbDataRemove) {
    notify(t('MSG_ALT_PD_REL_NO_REMOVE'));
  }

  view.setAllCheck(false, true);
  view.clearCurrent();
}

// 가격탭에 데이터 존재 여부
async function isPriceData() {
  const priceRows = currentInitData.value?.[pdConst.TBL_PD_PRC_FNL_DTL];
  if (priceRows && priceRows.length) {
    // 가격 정보가 입력되어 있어, 상품연결을 변경 할 수 없습니다.
    await alert(t('MSG_ALT_HAS_PRC_DO_NOT'));
    return true;
  }
  return false;
}

// 기준상품 검색 팝업 호출
async function onClickStandardSchPopup() {
  if (await isPriceData()) {
    return;
  }
  const view = grdStandardRef.value.getView();
  searchParams.value.searchType = standardSearchType.value;
  searchParams.value.searchValue = standardSearchValue.value;
  searchParams.value.exceptPdCd = currentPdCd.value;
  const rtn = await modal({
    component: 'ZwpdcStandardListP',
    componentProps: searchParams.value,
  });
  await insertCallbackRows(view, rtn, pdConst.PD_REL_TP_CD_C_TO_P);
  grdStandardRowCount.value = getGridRowCount(view);
}

// 연결된 기준상품 삭제
async function onClickStandardDelRows() {
  if (await isPriceData()) {
    return;
  }
  const view = grdStandardRef.value.getView();
  await deleteCheckedRows(view);
  grdStandardRowCount.value = getGridRowCount(view);
}

// 그리드 초기 데이터 설정
async function initGridRows() {
  const products = currentInitData.value[pdConst.RELATION_PRODUCTS];
  if (isEmpty(await products)) {
    return;
  }
  const standardView = grdStandardRef.value?.getView();
  if (standardView) {
    const standardRows = products.filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_C_TO_P);
    await setPdGridRows(standardView, standardRows, pdConst.REL_PD_ID, [], true);
    grdStandardRowCount.value = getGridRowCount(standardView);
  }
}

// Props 데이터 설정
async function initProps() {
  const { pdCd, initData } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = cloneDeep(initData);
}

await initProps();

// 리얼그리드 표시 오류 대응 임시코드
onActivated(async () => {
  await initGridRows();
});

watch(() => props.pdCd, (pdCd) => { currentPdCd.value = pdCd; });
watch(() => props.initData, (initData) => {
  if (!isEqual(currentInitData.value, initData)) {
    currentInitData.value = cloneDeep(initData);
    initGridRows();
  }
}, { deep: true });

//-------------------------------------------------------------------------------------------------
// Initialize Grid
//-------------------------------------------------------------------------------------------------
async function initStandardGrid(data, view) {
  // console.log('props.codes?.SELL_CHNL_DV_CD : ', props.codes?.SELL_CHNL_DTL_CD);
  const columns = [
    // 상태
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '105', styleName: 'text-center', options: props.codes?.PD_TEMP_SAVE_CD, editable: false },
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
    // 기준상품 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_STD_TYPE'), width: '271', editable: false },
    // 기준상품명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_STD_NAME'), width: '206', editable: false },
    // 기준상품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PD_STD_CODE'), width: '185', styleName: 'text-center', editable: false },
    // 판매유형
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '157', styleName: 'text-center', options: props.codes?.SELL_TP_CD, editable: false },
    // 판매채널
    { fieldName: 'channelId', header: t('MSG_TXT_SEL_CHNL'), width: '157', options: props.codes?.SELL_CHNL_DTL_CD, editable: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: pdConst.REL_PD_ID });
  fields.push({ fieldName: pdConst.PD_REL_TP_CD });
  fields.push({ fieldName: pdConst.REL_OJ_PD_CD });
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    await onCellEditRelProdPeriod(view, grid, itemIndex, row, fieldIndex);
  };

  await initGridRows();
  await init();
}
</script>
