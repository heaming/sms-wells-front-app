<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebEngineerAllowanceModP - 엔지니어 수당 생성관리 - 수당조정
3. 작성자 : seoin.jeon
4. 작성일 : 2023.05.11
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 엔지니어 수당 생성관리 - 수당조정
****************************************************************************************************
--->
<template>
  <kw-popup
    size="md"
  >
    <kw-grid
      ref="grdMainRef"
      :visible-rows="13"
      name="grdMain"
      @init="initGridMain"
    />
    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_TXT_CANCEL')"
        @click="onclickCancel"
      />
      <kw-btn
        v-permission:update
        primary
        :label="$t('MSG_TXT_DTRM')"
        :disable="isDisabled"
        @click="onclickDtrm"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, useModal, useGlobal, useDataService, getComponentType, gridUtil } from 'kw-lib';

const { cancel, ok } = useModal();
const { notify } = useGlobal();
const dataService = useDataService();
const { t } = useI18n();
const props = defineProps({
  perfYm: {
    type: String,
    default: '',
  },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const isDisabled = ref(false);
const searchParams = ref({
  perfYm: props.perfYm,
});

// 취소
async function onclickCancel() {
  cancel();
}

// 확정
// 팝업에서의 확정은 '수당조정' 단계 확정을 의미함.
// 실제 수당확정은 수수료일정의 '수당확정' 단계에서 진행.
async function onclickDtrm() {
  notify(t('MSG_ALT_CNFM_COMPLETE')); // 확정되었습니다.
  ok(true);
}

// 조회
async function fetchData() {
  const res = await dataService.get(`/sms/wells/fee/eger-allowances/confirm/${searchParams.value.perfYm}`);
  const resData = res.data;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(resData);

  // 전체 센터가 확정되었을 때만 본사확정 버튼을 활성화한다.
  if (resData[0].totCnt === resData[0].cnfmBtnCnt) { isDisabled.value = false; } else isDisabled.value = true;
}

onMounted(async () => {
  await fetchData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'baseYm', header: t('MSG_TXT_CNT_NM'), width: '150', styleName: 'text-left', visible: false },
    { fieldName: 'ogId', header: t('MSG_TXT_CNT_NM'), width: '150', styleName: 'text-left', visible: false },
    { fieldName: 'ogNm', header: t('MSG_TXT_CNT_NM'), width: '150', styleName: 'text-left' },
    { fieldName: 'ogCd', header: t('MSG_TXT_CNT_NM'), width: '150', styleName: 'text-left', visible: false },
    { fieldName: 'cnrAwCnfmDtm', header: t('MSG_TXT_CNR_CNFM_DTM'), width: '210', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    {
      fieldName: 'cnfmBtnYn',
      header: t('MSG_TXT_CNFM_CAN'),
      styleName: 'text-center rg-button-default',
      renderer: {
        type: 'button',
        hideWhenEmpty: true, // 빈 값일 때 버튼을 표시할지의 여부
      },
      displayCallback: () => '확정취소',
    },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  // 확정취소 버튼 클릭
  view.onCellItemClicked = async (g, { column, dataRow }) => {
    if (column === 'cnfmBtnYn') {
      const rowData = gridUtil.getRowValue(g, dataRow);
      const confirmHdofRows = [
        {
          baseYm: rowData.baseYm,
          ogCd: rowData.ogCd,
          prtnrNo: '000000',
          type: 'H', // 본사 확정
          confirm: 'N', // 확정(Y), 확정취소(N)
        },
      ];
      await dataService.put('/sms/wells/fee/eger-allowances/confirm', confirmHdofRows);
      notify(t('MSG_ALT_CNFM_CANCEL_CONF')); // 확정취소 되었습니다.
      fetchData();
    }
  };
});
</script>
