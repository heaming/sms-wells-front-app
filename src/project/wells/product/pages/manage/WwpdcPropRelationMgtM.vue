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

  <!--
    :visible-rows="pageInfo.pageSize"
    visible-rows="10"
  -->
  <kw-grid
    ref="grdMainRef"
    name="grdMainMgt"
    @init="initGrdMain"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useGlobal, defineGrid, getComponentType, gridUtil } from 'kw-lib'; // useMeta
import { isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { getAlreadyItems } from '~sms-common/product/utils/pdUtil';

/* eslint-disable no-use-before-define */
defineExpose({
  validateProps, getSaveData, isModifiedProps, resetData,
});

const { t } = useI18n();
const { notify, modal } = useGlobal();
const grdMainRef = ref(getComponentType('KwGrid'));

const props = defineProps({
  pdTpCd: { type: String, required: true },
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
});

// const { getConfig } = useMeta();
// const pageInfo = ref({
//   totalCount: 0,
//   pageIndex: 1,
//   pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
// });

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

async function insertCallbackRows(view, rtn, pdRelTpCd) {
  if (rtn.result) {
    if (Array.isArray(rtn.payload.checkedRows) && rtn.payload.checkedRows.length > 1) {
      const data = view.getDataSource();
      const rows = rtn.payload.checkedRows.map((item) => ({
        ...item, [pdConst.REL_OJ_PD_CD]: item.pdCd, [pdConst.PD_REL_TP_CD]: pdRelTpCd }));
      console.log('rows', rows);
      const okRows = await getCheckAndNotExistRows(view, rows);
      if (okRows && okRows.length) {
        await data.insertRows(0, okRows);
        await gridUtil.focusCellInput(view, 0);
      }
    } else {
      const row = Array.isArray(rtn.payload) ? rtn.payload[0].checkedRows[0] : rtn.payload.checkedRows[0];
      row[pdConst.PD_REL_TP_CD] = pdRelTpCd;
      row[pdConst.REL_OJ_PD_CD] = row.pdCd;
      console.log('row', row);
      const okRows = await getCheckAndNotExistRows(view, [row]);
      if (okRows && okRows.length) {
        await gridUtil.insertRowAndFocus(view, 0, okRows[0]);
      }
    }
  }
}

async function getCheckAndNotExistRows(view, rows) {
  // const alreadyItems = getAlreadyItems(view, rows, 'pdCd');
  const alreadyItems = getAlreadyItems(view, rows, 'ojPdCd');
  console.log(rows, rows.length, alreadyItems.length);

  if (rows.length === alreadyItems.length) {
    notify(t('MSG_ALT_ALREADY_RGST', [t('MSG_TXT_PRDT')]));
    return [];
  }
  if (alreadyItems.length > 0) {
    if (alreadyItems.length === 1) {
      notify(t('MSG_ALT_ALREADY_RGST_CUT', [alreadyItems[0].pdCd]));
    } else {
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
  const view = grdMainRef.value.getView();
  await insertCallbackRows(view, rtn, rtn.payload.pdRelTpCd);

  // TODO 소스 안정화 후 제거.
  // if (rtn) {
  //   const view = grdMainRef.value.getView();
  //   rtn.payload.checkedRows.forEach((v) => {
  //     // console.log(v);
  //     gridUtil.insertRowAndFocus(view, 0, {
  //       pdRelTpCd: rtn.payload.pdRelTpCd,
  //       pdTpCd: v.pdTpCd,
  //       pdClsfNm: v.pdClsfNm,
  //       pdNm: v.pdNm,
  //       ojPdCd: v.pdCd,
  //       sapPdctSclsrtStrcVal: v.sapPdctSclsrtStrcVal,
  //       modelNo: v.modelNo,
  //       pdAbbrNm: v.pdAbbrNm,
  //       ostrCnrCd: v.ostrCnrCd,
  //     });
  //   });
  //   view.commit();
  // }
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
  // console.log('subListsubListsubListsubListsubList ', subList);
  return subList;
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const columns = [
  { fieldName: 'pdRelId', header: 'PK', width: '0', visible: false },
  { fieldName: 'pdRelTpCd', header: t('MSG_TXT_RELATION_CLSF'), width: '106', styleName: 'text-center', options: codes.PD_REL_TP_CD }, /* 관계구분 */
  { fieldName: 'pdClsfNm', header: t('MSG_TXT_CLSF'), width: '176', styleName: 'text-left' }, /* 분류 */
  { fieldName: 'pdNm', header: t('MSG_TIT_MATERIAL_NM'), width: '382', styleName: 'text-left' }, /* 교재/자재명 */
  { fieldName: 'sapPdctSclsrtStrcVal', header: t('MSG_TXT_MATI_CD'), width: '121' }, /* 자재코드 교재/제재코드 */
  { fieldName: 'modelNo', header: t('MSG_TXT_PD_MODEL_NO'), width: '152', styleName: 'text-center' }, /* 모델No */
  { fieldName: 'pdAbbrNm', header: t('MSG_TXT_ABBR'), width: '226', styleName: 'text-left' }, /* 약어 */
  { fieldName: 'ostrCnrCd', header: t('MSG_TIT_SHIPPING_CENTER'), width: '214', styleName: 'text-left' }, /* 출고센터 */
  { fieldName: 'pdTpCd', header: t('MSG_TIT_PRDT_TYPE'), width: '0', visible: false }, /* 상품종류 */
  { fieldName: 'ojPdCd', header: t('MSG_TIT_TARGET_PRDT_CD'), width: '0', visible: false }, /* 대상상품코드 */
  { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DTM'), width: '0', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date', visible: false }, /* 등록일 */
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
