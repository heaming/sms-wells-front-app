<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaWellsFarmPackageProductSelectP - 웰스팜 패키지 상품 변경 팝업
3. 작성자 : joobro
4. 작성일 : 2023.10.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 그냥 만들어 봤어요.
****************************************************************************************************
--->
<template>
  <kw-popup>
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="totalCount" />
      </template>
    </kw-action-top>
    <kw-grid
      ref="grdRef"
      name="grdName"
      @init="initGrd"
    />
    <template #action>
      <kw-btn
        primary
        :label="$t('MSG_BTN_CONFIRM')"
        @click="onClickClose"
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
  cntrNo: { type: String, default: undefined },
  pdCd: { type: String, default: undefined },
});

const { ok, cancel } = useModal();
const dataService = useDataService('PGE_CTA_00039');

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRef = ref(getComponentType('KwGrid'));
//  const grdView = computed(() => grdRef.value?.getView());
const grdData = computed(() => grdRef.value?.getData());

const totalCount = ref(0);
const packageProducts = ref();

let cachedParams;
const searchParams = reactive({
  cntrNo: props.cntrNo,
  pdCd: props.pdCd,
});

const fetchData = async () => {
  const params = { ...cachedParams };
  const { data } = await dataService.get('sms/wells/contract/contracts/welsf-hcf-pkgs', {
    params,
  });

  if (!data.length) {
    await alert('패키지 구성 상품이 없습니다.');
    cancel();
    return;
  }

  totalCount.value = data.length;
  packageProducts.value = data;
  grdData.value?.setRows(data);
};

function onClickClose() {
  cancel();
}

async function onClickSearch() {
  cachedParams = { ...toRaw(searchParams) };
  await fetchData();
}

await onClickSearch();
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd = defineGrid((data, view) => {
  useGridDataModel(view, {
    pdCd: {
      label: '상품코드',
      width: 100,
    },
    pdNm: { displaying: false },
    cstBasePdAbbrNm: { displaying: false },
    name: {
      label: '상품명',
      type: String,
      width: 100,
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const pdNm = values[fields.indexOf('pdNm')];
        const cstBasePdAbbrNm = values[fields.indexOf('cstBasePdAbbrNm')];
        return cstBasePdAbbrNm || pdNm || '';
      } },
  });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.onCellDblClicked = async (grid, { dataRow, cellType }) => {
    const row = gridUtil.getRowValue(grid, dataRow);
    if (cellType === 'data') {
      const newPackage = packageProducts.value.find((product) => product.pdCd === row.pdCd);
      ok(newPackage);
    }
  };
  data.setRows(packageProducts.value);
});
</script>
