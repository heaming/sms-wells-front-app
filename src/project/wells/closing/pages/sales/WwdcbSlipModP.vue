<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCB
2. 프로그램 ID : WwdcbSlipModP -전표초기화 - W-CL-U-0034P01
3. 작성자 : WOO SEUNGMIN
4. 작성일 : 2023.05.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 영업선수금의 입금 내역과 매출확정의 매출내역에 대한 채권반제처리를 하는 화면.
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
  >
    <kw-search
      :cols="2"
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ALRPY_SLIP_NO')"
          required
        >
          <kw-input
            v-model="searchParams.sapAlrpySlpno"
            :label="$t('MSG_TXT_ALRPY_SLIP_NO')"
            rules="required"
            :maxlength="14"
            regex="alpha_num"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="totalCount"
        />
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>
    </kw-action-top>

    <kw-grid
      ref="grdDetailRef"
      :visible-rows="2"
      name="grdDetail"
      @init="initGrdDetail"
    />

    <template #action>
      <kw-btn
        primary
        :label="$t('MSG_BTN_SELT_SLIP_INTLZ')"
        @click="onClickSeltSlipIntlz()"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, gridUtil, defineGrid, getComponentType, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { notify, confirm } = useGlobal();
const dataService = useDataService();
const props = defineProps({
  sapAlrpySlpno: { type: String, default: null },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdDetailRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
);

const searchParams = ref({
  sapAlrpySlpno: props.sapAlrpySlpno,
});

let cachedParams;
async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  console.log('searchParams:', searchParams.value);
  const res = await dataService.get('/sms/wells/closing/business-atam-adjusts/sapAlrpySlpno', { params: cachedParams });
  console.log('res.data:', res.data);
  const slips = res.data;
  totalCount.value = slips.length;

  const view = grdDetailRef.value.getView();
  view.getDataSource().setRows(slips);
}

async function onClickSearch() {
  fetchData();
}

async function onClickSeltSlipIntlz() {
  const view = grdDetailRef.value.getView();
  const chkDataRows = gridUtil.getCheckedRowValues(view);
  if (chkDataRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  if (await confirm(t('MSG_ALT_SLIP_ALRPY_SLIP_OC_IZ_INTLZ'))) {
    if (!await gridUtil.validate(view)) { return; }
    await dataService.post('sms/wells/closing/business-atam-adjusts/sapAlrpySlpno', chkDataRows);
    notify(t('MSG_ALT_SAVE_DATA'));

    await fetchData();
  }
}

onMounted(async () => {
  console.log('props.sapAlrpySlpno:', props.sapAlrpySlpno);
  if (!isEmpty(props.sapAlrpySlpno)) {
    await fetchData();
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdDetail = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD },
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SELL_TP_DTL'), width: '120', styleName: 'text-center', options: codes.SELL_TP_DTL_CD },
    { fieldName: 'sapAlrpySlpno', header: t('MSG_TXT_ALRPY_SLIP_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'slBndAlrpyAmt', header: t('MSG_TXT_BND_ALRPY_AMT'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'bktxt', header: t('MSG_TXT_SMRY'), width: '400', styleName: 'text-left' },

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});
</script>
