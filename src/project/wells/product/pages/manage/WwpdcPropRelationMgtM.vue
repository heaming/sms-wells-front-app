<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 상품 - 상품운영관리(PDC)
2. 프로그램 ID : WwpdcPropRelationMgtM - 교재/자재 - 연결상품TAB (W-PD-U-0031M01)
3. 작성자 : junho.bae
4. 작성일 : 2022.AA.BB
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
        :options="codes.PD_REL_TP_CD"
      />
      <kw-input
        v-model="searchParams.searchValue"
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
      :label="$t('MSG_BTN_DEL')"
      @click="onClickRemove"
    />
  </kw-action-top>

  <kw-grid
    ref="grdMainRef"
    :visible-rows="pageInfo.pageSize"
    @init="initGrdMain"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useGlobal, defineGrid, getComponentType, gridUtil, useMeta } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';

/* eslint-disable no-use-before-define */
defineExpose({
  validateProps, getSaveData, isModifiedProps, resetData,
});

const { t } = useI18n();
const { notify, modal } = useGlobal();
const { getConfig } = useMeta();
const grdMainRef = ref(getComponentType('KwGrid'));

const props = defineProps({
  pdTpCd: { type: String, required: true },
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const searchParams = ref({
  pdRelTpCd: '',
  searchValue: '',
});

const codes = await codeUtil.getMultiCodes(
  'PD_REL_TP_CD',
);
codes.PD_REL_TP_CD = codes.PD_REL_TP_CD.filter((v) => (['13', '14', '15'].includes(v.codeId)));

async function resetData() {
  // TODO Grid 에서 초기화버튼 기능을 어떻게 정의할지 확인필요.
}

async function fetchData() {
  if (isEmpty(searchParams.value.pdRelTpCd)) {
    // 관계구분 (을)를 먼저 선택해주세요.
    notify(t('MSG_ALT_CHK_ID', [t('MSG_TXT_RELATION_CLSF')]));
    return false;
  }

  console.log('검색값', searchParams.value.searchValue);
  // component: 'ZpdcStandardProductListP', // 기준정보 팝업
  const { result, payload } = await modal({
    component: 'ZwpdcMaterialsSelectListP', // 교재자재 팝업
    componentProps: {
      searchType: searchParams.value.pdRelTpCd,
      searchValue: searchParams.value.searchValue,
    },
  });
  // pdRelTpCd: searchParams.value.pdRelTpCd, searchValue: searchParams.value.searchValue
  if (result) {
    const view = grdMainRef.value.getView();
    payload.checkedRows.forEach((v) => {
      // console.log(v);
      gridUtil.insertRowAndFocus(view, 0, {
        pdRelTpCd: payload.pdRelTpCd,
        pdTpCd: v.pdTpCd,
        pdClsfNm: v.pdClsfNm,
        pdNm: v.pdNm,
        ojPdCd: v.pdCd,
        sapPdctSclsrtStrcVal: v.sapPdctSclsrtStrcVal,
        modelNo: v.modelNo,
        pdAbbrNm: v.pdAbbrNm,
        ostrCnrCd: v.ostrCnrCd,
      });
    });
    view.commit();
  }
}

async function onClickRemove() {
  const view = grdMainRef.value.getView();

  const chkRows = gridUtil.getCheckedRowValues(view);
  if (chkRows.length === 0) {
    notify(t('MSG_ALT_DEL_NO_DATA'));
    return false;
  }
  const dataProvider = view.getDataSource();
  dataProvider.removeRows(chkRows.map((v) => v.dataRow));
}

async function validateProps() {
  console.log('relationMgt validateProps()');
  const validOk = true;
  return validOk;
}

async function isModifiedProps() {
  return true;
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
  { fieldName: 'pdRelId', header: 'PK', width: '50', visible: false },
  { fieldName: 'pdRelTpCd', header: t('MSG_TXT_RELATION_CLSF'), width: '106', styleName: 'text-center', options: codes.PD_REL_TP_CD }, /* 관계구분 */
  { fieldName: 'pdClsfNm', header: t('MSG_TXT_CLSF'), width: '176', styleName: 'text-left' }, /* 분류 */
  { fieldName: 'pdNm', header: t('MSG_TIT_MATERIAL_NM'), width: '382', styleName: 'text-left' }, /* 교재/자재명 */
  { fieldName: 'sapPdctSclsrtStrcVal', header: t('MSG_TXT_MATI_CD'), width: '121' }, /* 자재코드 교재/제재코드 */
  { fieldName: 'modelNo', header: t('MSG_TXT_PD_MODEL_NO'), width: '152', styleName: 'text-center' }, /* 모델No */
  { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ABBR'), width: '226', styleName: 'text-left' }, /* 약어 */
  { fieldName: 'ostrCnrCd', header: t('MSG_TIT_SHIPPING_CENTER'), width: '214', styleName: 'text-left' }, /* 출고센터 */
  { fieldName: 'pdTpCd', header: t('MSG_TIT_PRDT_TYPE'), width: '214', visible: false }, /* 상품종류 */
  { fieldName: 'ojPdCd', header: t('MSG_TIT_TARGET_PRDT_CD'), width: '214', visible: false }, /* 대상상품코드 */
  { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DTM'), width: '110', styleName: 'text-center', dataType: 'date', datetimeFormat: 'yyyy-MM-dd', visible: false }, /* 등록일 */
  { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_RGST_USR'), width: '80', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true, visible: false }, /* 등록자 */
  { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '110', styleName: 'text-center', dataType: 'date', datetimeFormat: 'yyyy-MM-dd', visible: false }, /* 최종수정일 */
  { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '80', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true, visible: false }, /* 최종수정자 */
  //   NameTag Parameter
  { fieldName: 'fstRgstUsrId', header: 'RGST_ID', width: '50', visible: false },
  { fieldName: 'fnlMdfcUsrId', header: 'MDFC_ID', width: '50', visible: false },
];

// 수정모드 통합 DATA Grid
const initGrdMain = defineGrid((data, view) => {
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }))
    .filter((visible) => visible);
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
  view.checkBar.visible = true;
  view.displayOptions.selectionStyle = 'singleRow';

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
});

onMounted(async () => {
  if (!isEmpty(props.initData[pdConst.TBL_PD_REL])) {
    setData(props.initData[pdConst.TBL_PD_REL]);
  }
});

async function setData(newInitData) {
  if (!isEmpty(newInitData)) {
    const relData = props.initData[pdConst.TBL_PD_REL];
    if (isEmpty(relData)) return;

    const grd1DataProvider = grdMainRef.value.getView().getDataSource();
    grd1DataProvider.fillJsonData(relData, { fillMode: 'set' });
  }
}

watch(() => props.initData[pdConst.TBL_PD_REL], setData, { deep: true });

</script>
<style scoped></style>
