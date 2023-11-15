<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaLkCntrDtlChioceP - 연계 계약 상세 선택
3. 작성자 : 박주형
4. 작성일 : 2023.10.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 연계 계약상세 목록 조회
- 연계 계약상세 목록 선택하여 던저 줌
****************************************************************************************************
--->
<template>
  <kw-popup
    size="md"
    :title="title"
  >
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="totalCount"
        />
      </template>
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdMainLkCntrDtl"
      :visible-rows="10"
      @init="initGrid"
    />
    <template #action>
      <kw-btn
        :label="$t('MSG_BTN_CLOSE')"
        primary
        @click="cancel"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { alert, defineGrid, getComponentType, gridUtil, useDataService, useModal } from 'kw-lib';
import { useGridDataModel } from '~sms-common/contract/composable';

const props = defineProps({
  cntrNo: { type: String, required: true },
  pdCd: { type: String, required: true },
});

const dataService = useDataService();
const { t } = useI18n();
const { ok, cancel } = useModal();
const totalCount = ref(0);
const grdMainRef = ref(getComponentType('KwGrid'));
const lkCntrDtls = ref();
const required = ref();
const title = computed(() => (required.value ? '연계 계약 선택 - 필수' : '연계 계약 선택'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchData() {
  const { cntrNo, pdCd } = props;
  if (!cntrNo || !pdCd) {
    alert('기계약 조회에 필요한 요소가 빈값입니다.');
    cancel();
  }
  const { data } = await dataService.get('/sms/wells/contract/contracts/precontracts', { params: {
    cntrNo,
    pdCd,
  } });
  const { required: _req, pcntrDtls } = data;

  if (!pcntrDtls?.length) {
    if (_req) {
      alert('상품 선택 전에 막혀야 합니다.');
      throw Error('상품 선택 전에 막혀야 합니다.');
    }

    alert('선택가능한 연계 계약이 없습니다.');
    cancel();
  }

  required.value = _req;
  totalCount.value = pcntrDtls.length;

  lkCntrDtls.value = pcntrDtls;
}

await fetchData();

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  useGridDataModel(view, {
    cntrNo: { displaying: false },
    cntrSn: { displaying: false },
    cstKnm: {
      label: t('MSG_TXT_CNTOR_NM'),
      width: 80,
      classes: 'text-center',
    },
    cntrNoSn: {
      label: t('MSG_TXT_CNTR_NO'),
      width: 100,
      valueExpression: 'values["cntrNo"] + "-" + values["cntrSn"]',
      classes: 'text-center',
    },
    pdNm: {
      label: t('MSG_TXT_PRDT_NM'),
      classes: 'text-center',
      fillWidth: 1,
    },
  });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.onCellDblClicked = async (grid, { dataRow, cellType }) => {
    const row = gridUtil.getRowValue(grid, dataRow);
    if (cellType === 'data') {
      ok(row);
    }
  };

  data.setRows(lkCntrDtls.value);
  view.resetCurrent();
});
</script>
