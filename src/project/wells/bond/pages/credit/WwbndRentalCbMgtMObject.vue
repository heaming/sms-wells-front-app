<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WBND
2. 프로그램 ID : WwbndRentalCbMgtMObject ( W-BN-U-0069M01 ) - 렌탈CB 연체대상 관리
3. 작성자 : gilyong.han
4. 작성일 : 2023.06.15
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈CB 연체대상 건 조회 및 알림톡 발송 대상 등록
****************************************************************************************************
--->
<template>
  <kw-search
    :modified-targets="['grdCustomer','grdContract']"
    :cols="4"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_BASE_YM')"
      >
        <kw-date-picker
          v-model="searchParams.baseYm"
          type="month"
          :label="$t('MSG_TXT_BASE_YM')"
        />
      </kw-search-item>
      <kw-search-item :label="t('MSG_TXT_INQR_DV')">
        <kw-option-group
          v-model="searchParams.selGbn"
          type="radio"
          :options="selGbnOpt"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_CST_NO')"
      >
        <kw-input
          v-model="searchParams.cstNo"
          clearable
          icon="search"
          :regex="/^[0-9]*$/i"
          maxlength="11"
          @click-icon="onClickCustomer"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_MPNO')"
      >
        <kw-input
          v-model:telNo0="searchParams.cralLocaraTno"
          v-model:telNo1="searchParams.mexnoEncr"
          v-model:telNo2="searchParams.cralIdvTno"
          mask="telephone"
          :label="t('MSG_TXT_MPNO')"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item :label="t('MSG_TXT_CST_NM')">
        <kw-input
          v-model="searchParams.cstKnm"
          clearable
          icon="search"
          maxlength="11"
          @click-icon="onClickCustomer"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>
  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="totalCount"
        />
      </template>

      <kw-btn
        v-permission:update
        :label="$t('MSG_TXT_SAVE')"
        grid-action
        @click="onClickSave"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        v-permission:download
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="totalCount === 0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      v-show="isCustomer"
      ref="grdCustomerRef"
      name="grdCustomer"
      :visible-rows="10"
      @init="initCustomerGrid"
    />
    <kw-grid
      v-show="!isCustomer"
      ref="grdContractRef"
      name="grdContract"
      :visible-rows="10"
      @init="initContractGrid"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import {
  useDataService,
  defineGrid,
  getComponentType,
  gridUtil,
  useGlobal,
} from 'kw-lib';
import {
  cloneDeep,
  isEmpty,
} from 'lodash-es';
import dayjs from 'dayjs';

const {
  modal,
  notify,
  alert,
} = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
const grdCustomerRef = ref(getComponentType('KwGrid'));
const grdContractRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const isCustomer = ref(true);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/bond/rental-cb-mgt/objects';
const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'),
  selGbn: '1',
  cstNo: '',
  cstKnm: '',
  cralLocaraTno: '',
  mexnoEncr: '',
  cralIdvTno: '',
});
const selGbnOpt = [
  { codeId: '1', codeName: t('MSG_TXT_BY_CUSTOMER') },
  { codeId: '2', codeName: t('MSG_TXT_CNTRCT_DV') },
];

// TODO: [Z-CU-U-0002P01] 화면 팝업
const onClickCustomer = async () => {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: {
      cstNo: searchParams.value.cstNo,
    },
  });
  if (result) {
    const { cstNo, name } = payload;
    searchParams.value.cstNo = cstNo;
    searchParams.value.cstKnm = name;
  }
};
// 검색 조회
let cachedParams;
async function fetchData() {
  if (isEmpty(searchParams.value.cstNo) !== isEmpty(searchParams.value.cstKnm)) {
    notify(t('MSG_ALT_NO_SEARCH_PARAM0', [t('MSG_TXT_CUSTOMER')]));
    return;
  }
  const { data } = await dataService.get(baseUrl, { params: { ...cachedParams } });
  totalCount.value = data?.length;

  isCustomer.value = searchParams.value.selGbn === '1';
  const view = isCustomer.value ? grdCustomerRef.value.getView() : grdContractRef.value.getView();
  view.getDataSource().setRows(data);
  // view.resetCurrent()
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 알림톡 대상생성
async function onClickSave() {
  const view = isCustomer.value ? grdCustomerRef.value.getView() : grdContractRef.value.getView();
  // 조회구분이 "계약별" 선택된 경우
  if (searchParams.value.selGbn !== '1') {
    // 조회구분이 "고객별" 이 선택되었을때에만 저장 가능합니다.
    await alert(t('MSG_ALT_SAVE_PSB_SRCH_PARAM_BY_CST')); return;
  }
  const checkedRows = gridUtil.getCheckedRowValues(view);
  // grid에서 체크박스가 선택되지 않았을 경우
  if (checkedRows.length === 0) {
    await alert(t('MSG_ALT_NO_CHECK_DATA')); return;
  }

  // check data 중 "알림수신여부" Y 체크
  if (checkedRows.some((x) => x.notyRcvYn === 'Y')) {
    // 알림톡 대상으로 선정된 건이 포함되어 있습니다. 체크 제외 후 다시 진행해주시기 바랍니다.
    await alert(t('MSG_ALT_INC_MSG_OBJ_CHECK_EXCD')); return false;
  }

  const updateParams = [];
  for (let i = 0; i < checkedRows.length; i += 1) {
    updateParams.push({
      cstNo: checkedRows[i].cstNo,
      baseYm: cachedParams.baseYm,
    });
  }
  await dataService.put(baseUrl, updateParams);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

const { currentRoute } = useRouter();
async function onClickExcelDownload() {
  const view = isCustomer.value ? grdCustomerRef.value.getView() : grdContractRef.value.getView();
  if (gridUtil.isModified(view)) { notify(t('MSG_TXT_NEED_SAVE_EXCEL_DOWNLOAD')); return; }

  await gridUtil.exportView(view, {
    exportData: gridUtil.getAllRowValues(view),
    fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TIT_RENTAL_CB_OBJECT')}`,
    timePostfix: true,
    indicator: 'hidden',
    checkBar: 'hidden',
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initCustomerGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '160', styleName: 'text-center' },
    { fieldName: 'notyRcvYn', header: t('MSG_TXT_NOTAK_SEND_REG_YN'), width: '160', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '160', styleName: 'text-center' },
    { fieldName: 'copnDvNm', header: t('MSG_TXT_INDI_CORP'), width: '160', styleName: 'text-center' },
    { fieldName: 'cralTno', header: t('MSG_TXT_MPNO'), width: '160', styleName: 'text-center' },
    { fieldName: 'dlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '160', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'dlqBlam', header: t('MSG_TXT_DLQ_BLAM'), width: '160', styleName: 'text-right !important, rg-button-link', renderer: { type: 'button' }, dataType: 'number' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_CLCTAM_PSIC'), width: '160', styleName: 'text-center' },
    { fieldName: 'dsphTno', header: t('MSG_TXT_DSPH_NO'), width: '160', styleName: 'text-center' },
    { fieldName: 'rgstSchDt', header: t('MSG_TXT_RGST_SCHD_DT'), width: '172', styleName: 'text-center', datetimeFormat: 'date' },

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  // 렌탈CB 납입정보 팝업 open
  view.onCellItemClicked = async (grid, { itemIndex, column }) => {
    const { cstNo } = grid.getValues(itemIndex);
    if (column === 'dlqBlam' && !isEmpty(cstNo)) {
      await modal({
        component: 'WwbndRentalCbPaymentInfoP',
        componentProps: {
          cstNo,
        },
      });
    }
  };
});

const initContractGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '145', styleName: 'text-center' },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_NO'), width: '130', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '130', styleName: 'text-center' },
    { fieldName: 'copnDvNm', header: t('MSG_TXT_INDI_CORP'), width: '130', styleName: 'text-center' },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_PRDT_GUBUN'), width: '130', styleName: 'text-center' },
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PDCT'), width: '130' },
    { fieldName: 'slRcogDt', header: t('MSG_TXT_SL_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cralTno', header: t('MSG_TXT_MPNO'), width: '130', styleName: 'text-center' },
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_AUTO_FNT_STPL_DT'), width: '150', styleName: 'text-center' },
    { fieldName: 'fntDvNm', header: t('MSG_TXT_STLM_MES'), width: '130', styleName: 'text-center' },
    { fieldName: 'dlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '130', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'dlqBlam', header: t('MSG_TXT_DLQ_BLAM'), width: '130', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_CLCTAM_PSIC'), width: '130', styleName: 'text-center' },
    { fieldName: 'dsphTno', header: t('MSG_TXT_DSPH_NO'), width: '130', styleName: 'text-center' },
    { fieldName: 'rgstSchDt', header: t('MSG_TXT_RGST_SCHD_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>

<style scoped>
</style>
