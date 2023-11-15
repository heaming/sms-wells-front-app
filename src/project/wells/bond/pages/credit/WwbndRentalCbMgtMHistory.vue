<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WBND
2. 프로그램 ID : WwbndRentalCbMgtMHistory ( W-BN-U-0070M01 ) - 렌탈CB 연체이력 조회
3. 작성자 : gilyong.han
4. 작성일 : 2023.06.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈CB 연체대상 중 알림톡 발송 대상으로 등록된 대상 조회 및 NICE발송, 알림톡발송
****************************************************************************************************
--->
<template>
  <kw-search
    :modified-targets="['grdMain']"
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
      <kw-separator
        vertical
        inset
        spaced
      />
      <!-- rev:230615 추가 -->
      <kw-date-picker
        v-model="sendParams.fwbooDate"
        dense
        class="w150"
        :min-date="dayjs().add(4,'day').format('YYYY-MM-DD')"
        :label="t('MSG_TXT_FW_DATE')"
      />
      <kw-time-picker
        v-model="sendParams.fwbooTime"
        dense
        class="w150"
        :label="t('MSG_TXT_FW_HH')"
        min-time="0800"
        max-time="2100"
      />
      <!-- rev:230615 추가 -->

      <!-- rev:230615 nice발송 btn 제거 // -->
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        v-permission:create
        :label="$t('MSG_BTN_BIZTALK_SEND')"
        primary
        dense
        :disable="sendParams.baseYm !== dayjs().format('YYYYMM')"
        @click="onClickSendMessage"
      />
    </kw-action-top>
    <!-- rev:230616 제거 -->
    <!-- <ul class="filter-box">
            <li class="filter-box__item">
              <p class="filter-box__item-label">
                납입기한
              </p>
              <kw-date-picker
                dense
              />
            </li>
          </ul> -->
    <!-- // rev:230616 제거 -->
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      class="mt20"
      :visible-rows="10"
      @init="initGrid"
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
} = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/bond/rental-cb-mgt/histories';

const ynOpt = ref([
  { codeId: 'Y', codeName: 'Y' },
  { codeId: 'N', codeName: 'N' },
]);

const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'),
  cstNo: '',
  cstKnm: '',
  cralLocaraTno: '',
  mexnoEncr: '',
  cralIdvTno: '',
});

const sendParams = ref({
  fwbooDate: dayjs().add(4, 'day').format('YYYYMMDD'),
  fwbooTime: '1400',
  baseYm: '',
});

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
  sendParams.value.baseYm = cachedParams.baseYm;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(data);
  // view.resetCurrent()
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

const { currentRoute } = useRouter();
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  if (gridUtil.isModified(view)) { notify(t('MSG_TXT_NEED_SAVE_EXCEL_DOWNLOAD')); return; }

  await gridUtil.exportView(view, {
    exportData: gridUtil.getAllRowValues(view),
    fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TIT_RENTAL_CB_DLQ_HIST_INQR')}`,
    timePostfix: true,
    indicator: 'hidden',
    checkBar: 'hidden',
  });
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  changedRows.forEach((v) => {
    v.baseYm = cachedParams.baseYm;
  });

  await dataService.put(baseUrl, changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

async function onClickSendMessage() {
  const view = grdMainRef.value.getView();
  // if (await gridUtil.isModified(view)) { notify(t('MSG_ALT_CHG_CNTN_AFTER_SAVE')); return; }
  const allRows = gridUtil.getAllRowValues(view);
  const sendRows = allRows.filter((v) => v.niceFwExcdYn !== 'Y').map((row) => ({
    cstNo: row.cstNo,
    cstKnm: row.cstKnm,
    cralTno: row.cralTno,
    dlqBlam: row.dlqBlam,
    baseYm: sendParams.value.baseYm,
    fwbooDate: sendParams.value.fwbooDate,
    fwbooTime: sendParams.value.fwbooTime,
  }));
  if (sendRows.length === 0) { notify(t('MSG_ALT_NO_FW_OBJ')); return; }

  await dataService.post(baseUrl, sendRows);

  notify(t('MSG_ALT_BIZTALK_SEND_SUCCESS'));
  await onClickSearch();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '160', styleName: 'text-center' }, // 고객번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '160', styleName: 'text-center' }, // 고객명
    { fieldName: 'copnDvNm', header: t('MSG_TXT_INDI_CORP'), width: '160', styleName: 'text-center' }, // 개인/법인
    { fieldName: 'cralTno', header: t('MSG_TXT_MPNO'), width: '160', styleName: 'text-center' }, // 휴대전화번호
    { fieldName: 'dlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '160', styleName: 'text-right', dataType: 'number' }, // 연체금액
    { fieldName: 'dlqBlam', header: t('MSG_TXT_DLQ_BLAM'), width: '160', styleName: 'text-right !important, rg-button-link', renderer: { type: 'button' }, dataType: 'number' }, // 연체잔액
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_CLCTAM_PSIC'), width: '160', styleName: 'text-center' }, // 집금담당자
    { fieldName: 'dsphTno', header: t('MSG_TXT_DSPH_NO'), width: '160', styleName: 'text-center' }, // 발신번호
    // rev:230410 header 텍스트 수정
    { fieldName: 'rgstSchDt', header: t('MSG_TXT_RGST_SCHD_DT'), width: '172', styleName: 'text-center', datetimeFormat: 'date' }, // 등록예정일자
    // //rev:230410 header 텍스트 수정
    { fieldName: 'niceFwExcdYn',
      header: t('MSG_TXT_NICE_EXCD_YN'),
      width: '130',
      styleName: 'text-center',
      editor: { type: 'list' },
      options: ynOpt.value,
      styleCallback: () => {
        if (sendParams.value.baseYm !== dayjs().format('YYYYMM')) {
          return {
            editable: false,
          };
        }
        return {
          editable: true,
        };
      } }, // NICE 제외여부
    { fieldName: 'fntStplDt', header: t('MSG_TXT_PY_TMLM_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' }, // 납입기한일자
    // rev:230410 header 텍스트 수정
    { fieldName: 'msgFwDt', header: t('MSG_TXT_NOTAK_FW_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' }, // 알림톡 발송일자
    // //rev:230410 header 텍스트 수정
    { fieldName: 'resultYn', header: t('MSG_TXT_SCS_YN'), width: '130', styleName: 'text-center' }, // 성공여부
    // rev:230410 header 텍스트 수정
    { fieldName: 'niceFwDt', header: t('MSG_TXT_NICE_FW_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' }, // NICE 발송일자
    // // rev:230410 header 텍스트 수정
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

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
</script>

<style scoped>
</style>
