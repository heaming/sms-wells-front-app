<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfActivityGoodsUnitPriceMgtP - 활동물품관리-단가관리
3. 작성자 : jisung you
4. 작성일 : 2023.07.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-활동물품관리-단가관리
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <kw-action-top>
      <kw-btn
        :label="$t('MSG_BTN_DEL')"
        dense
        grid-action
        @click="onClickRemove"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        dense
        grid-action
        :label="$t('MSG_BTN_ROW_ADD')"
        @click="onClickAdd"
      />
    </kw-action-top>

    <kw-grid
      ref="grdPopupRef"
      :visible-rows="5"
      @init="initGrdPopup"
    />

    <h3>변경이력 - ${{ actiGdsName }}$</h3>
    <kw-grid
      ref="grdPopupRef2"
      :visible-rows="2"
      @init="initGridPopup2"
    />
    <template #action>
      <kw-btn
        primary
        :label="$t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, defineGrid, gridUtil, useDataService, useGlobal } from 'kw-lib';

const dataService = useDataService();
const { t } = useI18n();
const { notify } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const ogTpCds = ref();
const actiGdsCds = ref();
const actiGdsName = ref();
const codes = await codeUtil.getMultiCodes(
  'ACTI_GDS_CD',
  'OG_TP_CD',
  // 'ACTI_GDS_STDD_DV_CD',
);
ogTpCds.value = codes.OG_TP_CD.filter((v) => ['W01', 'W02', 'W03', 'W04'].includes(v.codeId));
actiGdsCds.value = codes.ACTI_GDS_CD.filter((v) => ['29'].includes(v.codeId));

const grdPopupRef = ref(getComponentType('KwGrid'));
const grdPopupRef2 = ref(getComponentType('KwGrid'));
const props = defineProps({
  ogTpCd: {
    type: String,
    required: true,
  },

});
const actiGdsStddDvIds = ref();

async function optionData() {
  const { data } = await dataService.get('/sms/wells/competence/business/activity/stdd-codes', { params: { } });
  return data;
}
actiGdsStddDvIds.value = await optionData();

async function fetchData() {
  const cachedParams = {
    ogTpCd: props.ogTpCd,
  };

  const res = await dataService.get('/sms/wells/competence/business/activity/goods-base', { params: cachedParams });
  const view = grdPopupRef.value.getView();
  console.log('res.data', res.data);
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function fetchAllData(ogTpCd, actiGdsCd) {
  const view = grdPopupRef2.value.getView();
  view.getDataSource().clearRows();
  const cachedParams = {
    ogTpCd,
    actiGdsCd,
  };
  console.log('res.cachedParams', cachedParams);
  const res = await dataService.get('/sms/wells/competence/business/activity/goods-base-all', { params: cachedParams });
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function onClickAdd() {
  const view = grdPopupRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {
    ogTpCd: props.ogTpCd,
    useYn: 'Y',
  });
}

async function onClickSave() {
  const view = grdPopupRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const saveParams = gridUtil.getChangedRowValues(view).map((row) => ({
    ...row,
  }));

  console.log('saveParams', saveParams);

  await dataService.post('/sms/wells/competence/business/activity/goods-base', saveParams);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

async function onClickRemove() {
  const view = grdPopupRef.value.getView();
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  console.log('res.deletedRows', deletedRows);
  if (deletedRows.length > 0) {
    await dataService.delete('/sms/wells/competence/business/activity/goods-base', { data: [...deletedRows] });
    await fetchData();
  }
}

onMounted(async () => {
  await fetchData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdPopup = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'actiGdsCd' },
    { fieldName: 'actiGdsNm' },
    { fieldName: 'actiGdsAmt' },
    { fieldName: 'patDdtnMcn' },
    { fieldName: 'ogTpCd' },
    { fieldName: 'useYn' },
    { fieldName: 'vlStrtdt' },
    { fieldName: 'vlEnddt' },
    { fieldName: 'actiGdsSn', dataType: 'number' },
    { fieldName: 'actiGdsStddDvId' },

  ];

  const columns = [
    { fieldName: 'actiGdsCd', header: t('MSG_TXT_ITM'), width: '80', styleName: 'text-center' },
    { fieldName: 'actiGdsNm', header: t('MSG_TXT_ITM_NM'), width: '150', styleName: 'text-center' },
    {
      fieldName: 'actiGdsAmt',
      header: t('MSG_TXT_UPRC'),
      numberFormat: '#,##0.###',
      rules: 'required',
      editor: {
        type: 'number',
        editFormat: '#,##0.###',
      },
    },
    {
      fieldName: 'patDdtnMcn',
      header: t('MSG_TXT_PAT_BASE'),
      rules: 'required',
      editor: {
        type: 'number',
        maxIntegerLength: 3,
        positiveOnly: true,
      },
    },
    {
      fieldName: 'ogTpCd',
      rules: 'required',
      header: t('MSG_TXT_CHNL_DV'),
      width: '100',
      editor: { type: 'dropdown' },
      firstOption: 'select', // preset: 'all', 'select'
      firstOptionValue: '', // default value, 생략 가능
      firstOptionLabel: '선택', // default value, 생략 가능
      options: ogTpCds.value,
    },
    { fieldName: 'useYn', header: t('MSG_TXT_SELL'), width: '80', renderer: { type: 'check', trueValues: 'Y', falseValues: 'N' } },
    {
      fieldName: 'vlStrtdt',
      rules: 'required',
      header: t('MSG_TXT_STRT_DT'),
      datetimeFormat: 'date', // default value, 생략 가능
      editor: {
        type: 'btdate',
        datetimeFormat: 'date', // default value, 생략 가능
      },
    },
    {
      fieldName: 'vlEnddt',
      rules: 'required',
      header: t('MSG_TXT_END_DT'),
      datetimeFormat: 'date', // default value, 생략 가능
      editor: {
        type: 'btdate',
        datetimeFormat: 'date', // default value, 생략 가능
      },
    },
    {
      fieldName: 'actiGdsStddDvId',
      header: t('MSG_TXT_SZ_CL'),
      width: '100',
      editor: { type: 'dropdown' },
      options: actiGdsStddDvIds.value,
    },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.editOptions.editable = true;
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    {
      header: t('MSG_TXT_ITM'), // colspan title
      direction: 'horizontal', // merge type
      items: ['actiGdsCd', 'actiGdsNm'],
    },
    'actiGdsAmt', 'patDdtnMcn', 'ogTpCd', 'useYn', 'vlStrtdt', 'vlEnddt', 'actiGdsStddDvId',
  ]);

  view.onCellClicked = async (g, { dataRow }) => {
    const { ogTpCd, actiGdsCd, actiGdsNm } = gridUtil.getRowValue(g, dataRow);
    actiGdsName.value = actiGdsNm;

    await fetchAllData(ogTpCd, actiGdsCd);
  };
});

const initGridPopup2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'actiGdsCd' },
    { fieldName: 'actiGdsNm' },
    { fieldName: 'actiGdsAmt' },
    { fieldName: 'patDdtnMcn' },
    { fieldName: 'ogTpCd' },
    { fieldName: 'useYn' },
    { fieldName: 'vlStrtdt' },
    { fieldName: 'vlEnddt' },
    { fieldName: 'actiGdsSn' },
    { fieldName: 'actiGdsStddDvCd' },
    { fieldName: 'fstRgstDtm' },
    { fieldName: 'fstRgstUsrNm' },

  ];

  const columns = [
    { fieldName: 'actiGdsCd', header: t('MSG_TXT_ITM'), width: '100', styleName: 'text-center' },
    { fieldName: 'actiGdsNm', header: t('MSG_TXT_ITM_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'actiGdsAmt', header: t('MSG_TXT_UPRC'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0.##' },
    { fieldName: 'patDdtnMcn', header: t('MSG_TXT_PAT_BASE'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogTpCd', header: t('MSG_TXT_CHNL_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'useYn', header: t('MSG_TXT_SELL'), width: '80', renderer: { type: 'check', trueValues: 'Y', falseValues: 'N' } },
    { fieldName: 'vlStrtdt', header: t('MSG_TXT_STRT_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'vlEnddt', header: t('MSG_TXT_END_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    {
      fieldName: 'actiGdsStddDvCd',
      header: t('MSG_TXT_SZ_CL'),
      width: '100',
      editor: { type: 'dropdown' },
      // options: codes.ACTI_GDS_STDD_DV_CD,
    },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FST_RGST_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_RGST_PSIC'), width: '150', styleName: 'text-center' },

  ];
  // multi row header setting
  view.setColumnLayout([
    {
      header: t('MSG_TXT_ITM'), // colspan title
      direction: 'horizontal', // merge type
      items: ['actiGdsCd', 'actiGdsNm'],
    },
    'actiGdsAmt', 'patDdtnMcn', 'ogTpCd', 'useYn', 'vlStrtdt', 'vlEnddt', 'fstRgstDtm', 'fstRgstUsrNm',
  ]);
  data.setFields(fields);
  view.setColumns(columns);
  view.editOptions.editable = false;
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});
</script>
