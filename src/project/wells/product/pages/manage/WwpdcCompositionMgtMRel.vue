<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcCompositionMgtMRel - 기준상품 등록/변경 - 연결상품 선택 ( W-PD-U-0010M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 등록/변경 - 연결상품 선택 프로그램
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
        class="ml12 w120"
        :options="standardSelectItems"
      />
      <kw-input
        v-model="standardSearchValue"
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
      dense
      :label="$t('MSG_BTN_DEL')"
      @click="onClickStandardDelRows"
    />
  </kw-action-top>
  <kw-grid
    ref="grdStandardRef"
    :visible-rows="3"
    @init="initStandardGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { gridUtil, useGlobal, getComponentType } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import { getAlreadyItems, getGridRowCount } from '~/modules/sms-common/product/utils/pdUtil';
import pdConst from '~sms-common/product/constants/pdConst';

/* eslint-disable no-use-before-define */
defineExpose({
  resetData, init, getSaveData, isModifiedProps, validateProps,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
  codes: { type: Object, default: null },
  readonly: { type: Boolean, default: false },
});

const { modal, notify } = useGlobal();
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
});

async function resetData() {
  currentPdCd.value = '';
  currentInitData.value = {};
  if (grdStandardRef.value?.getView()) gridUtil.reset(grdStandardRef.value.getView());
}

async function init() {
  const standardView = grdStandardRef.value?.getView();
  if (standardView) await gridUtil.init(standardView);
}

async function getSaveData() {
  const rowValues = gridUtil.getAllRowValues(grdStandardRef.value.getView());
  const rtnValues = { [pdConst.TBL_PD_REL]: rowValues ?? [] };
  if (rtnValues[pdConst.TBL_PD_REL]) {
    rtnValues[pdConst.RELATION_PRODUCTS] = cloneDeep(rtnValues[pdConst.TBL_PD_REL]);
  }
  return rtnValues;
}

async function isModifiedProps() {
  return gridUtil.isModified(grdStandardRef.value?.getView());
}

async function validateProps() {
  return true;
}

async function insertCallbackRows(view, rtn, pdRelTpCd) {
  if (rtn.result) {
    if (Array.isArray(rtn.payload) && rtn.payload.length > 1) {
      const data = view.getDataSource();
      const rows = rtn.payload.map((item) => ({
        ...item, [pdConst.REL_OJ_PD_CD]: item.pdCd, [pdConst.PD_REL_TP_CD]: pdRelTpCd }));
      const okRows = await getCheckAndNotExistRows(view, rows);
      if (okRows && okRows.length) {
        await data.insertRows(0, okRows);
        await gridUtil.focusCellInput(view, 0);
      }
    } else {
      const row = Array.isArray(rtn.payload) ? rtn.payload[0] : rtn.payload;
      row[pdConst.PD_REL_TP_CD] = pdRelTpCd;
      row[pdConst.REL_OJ_PD_CD] = row.pdCd;
      const okRows = await getCheckAndNotExistRows(view, [row]);
      if (okRows && okRows.length) {
        await gridUtil.insertRowAndFocus(view, 0, okRows[0]);
      }
    }
  }
}

async function getCheckAndNotExistRows(view, rows) {
  const alreadyItems = getAlreadyItems(view, rows, 'pdCd');
  if (rows.length === alreadyItems.length) {
    // 이미 등록된 {상품} 입니다.
    notify(t('MSG_ALT_ALREADY_RGST', [t('MSG_TXT_PRDT')]));
    return [];
  }
  if (alreadyItems.length > 0) {
    if (alreadyItems.length === 1) {
      // 이미 등록된 {pdCd}은(는) 제외 합니다.
      notify(t('MSG_ALT_ALREADY_RGST_CUT', [alreadyItems[0].pdCd]));
    } else {
      // 이미 등록된 {pdCd} 외 {0} 건 은(는) 제외 합니다.
      notify(t('MSG_ALT_ALREADY_RGST_CUT', [t('MSG_TXT_EXID_CNT', [alreadyItems[0].pdCd, alreadyItems.length - 1])]));
    }
    const alreadyPdCds = alreadyItems.reduce((rtns, item) => { rtns.push(item.pdCd); return rtns; }, []);
    return rows.reduce((rtns, item) => {
      if (!alreadyPdCds.includes(item.pdCd)) {
        rtns.push(item);
      }
      return rtns;
    }, []);
  }
  return rows;
}

async function deleteCheckedRows(view) {
  await gridUtil.confirmDeleteCheckedRows(view);
}

async function onClickStandardSchPopup() {
  const view = grdStandardRef.value.getView();
  searchParams.value.searchType = standardSearchType.value;
  searchParams.value.searchValue = standardSearchValue.value;
  const rtn = await modal({
    component: 'ZwpdcStandardSimpleListP',
    componentProps: searchParams.value,
  });
  await insertCallbackRows(view, rtn, pdConst.PD_REL_TP_CD_C_TO_P);
  grdStandardRowCount.value = getGridRowCount(view);
}

async function onClickStandardDelRows() {
  const view = grdStandardRef.value.getView();
  await deleteCheckedRows(view);
  grdStandardRowCount.value = getGridRowCount(view);
}

async function initGridRows() {
  const products = currentInitData.value[pdConst.RELATION_PRODUCTS];
  if (isEmpty(await products)) {
    return;
  }
  const standardView = grdStandardRef.value?.getView();
  if (standardView) {
    standardView.getDataSource().clearRows();
    standardView.getDataSource().setRows(products
      .filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_P));
    standardView.resetCurrent();
    grdStandardRowCount.value = getGridRowCount(standardView);
  }
}

async function initProps() {
  const { pdCd, initData } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = cloneDeep(initData);
}

await initProps();

watch(() => props.pdCd, (pdCd) => { currentPdCd.value = pdCd; });
watch(() => props.initData, (initData) => {
  currentInitData.value = cloneDeep(initData);
  initGridRows();
}, { deep: true });

onMounted(async () => {
  await initGridRows();
});

//-------------------------------------------------------------------------------------------------
// Initialize Grid
//-------------------------------------------------------------------------------------------------
async function initStandardGrid(data, view) {
  // console.log('props.codes?.SELL_CHNL_DV_CD : ', props.codes?.SELL_CHNL_DTL_CD);
  const columns = [
    // 상태
    { fieldName: 'tempSaveYn', header: t('MSG_TXT_STT'), width: '135', styleName: 'text-center', options: props.codes?.PD_TEMP_SAVE_CD },
    // 기준상품 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_STD_TYPE'), width: '371' },
    // 기준상품명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_STD_NAME'), width: '306' },
    // 기준상품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PD_STD_CODE'), width: '185', styleName: 'text-center' },
    // 판매유형
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '187', styleName: 'text-center', options: props.codes?.SELL_TP_CD },
    // 판매채널
    { fieldName: 'channelId', header: t('MSG_TXT_SEL_CHNL'), width: '187', styleName: 'text-center', options: props.codes?.SELL_CHNL_DTL_CD },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: pdConst.REL_PD_ID });
  fields.push({ fieldName: pdConst.PD_REL_TP_CD });
  fields.push({ fieldName: pdConst.REL_OJ_PD_CD });
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = false;
}
</script>
