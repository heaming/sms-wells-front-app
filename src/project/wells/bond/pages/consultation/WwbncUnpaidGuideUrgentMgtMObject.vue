<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID : WwbncUnpaidGuideUrgentMgtMExclude ( W-BN-U-0031M01 ) - 미납요금 안내/촉구 대상 관리(탭)
3. 작성자 : gilyong.han
4. 작성일 : 2023.07.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 미납요금 안내서, 촉구서를 생성 및 조회한다.
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="4"
    :modified-targets="['grdObject']"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="t('MSG_TXT_FW_TP')"
        required
      >
        <kw-option-group
          v-model="searchParams.ucAmtFwTpCd"
          rules="required"
          type="radio"
          :options="codes.UC_AMT_FW_TP_CD"
          :label="t('MSG_TXT_FW_TP')"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_PRGS_STATUS')"
        required
      >
        <kw-option-group
          v-model="searchParams.stateDvCd"
          rules="required"
          type="radio"
          :options="stateOpt"
          :label="t('MSG_TXT_PRGS_STATUS')"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_INDI_CORP_GUBUN')"
      >
        <kw-select
          v-model="searchParams.copnDvCd"
          :options="codes.COPN_DV_CD"
          :label="t('MSG_TXT_INDI_CORP_GUBUN')"
          first-option="all"
        />
      </kw-search-item>
      <!-- rev:230410 label 변경 -->
      <kw-search-item
        :label="t('MSG_TXT_PRDT_GUBUN')"
      >
        <!-- // rev:230410 label 변경 -->
        <kw-select
          v-model="searchParams.bndBizDvCd"
          :options="codes.BND_BIZ_DV_CD"
          :label="t('MSG_TXT_PRDT_GUBUN')"
          first-option="all"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        :label="t('MSG_TXT_DLQ_MCNT')"
        required
      >
        <kw-input
          v-model="searchParams.fromDlqMcn"
          :label="t('MSG_TXT_DLQ_MCNT')"
          :regex="/^[0-9]*$/i"
          maxlength="2"
          rules="required"
        />
        <span>~</span>
        <kw-input
          v-model="searchParams.toDlqMcn"
          :label="t('MSG_TXT_DLQ_MCNT')"
          :regex="/^[0-9]*$/i"
          maxlength="2"
          rules="required"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_CLCTAM_DV')"
        required
      >
        <kw-option-group
          v-model="searchParams.clctamDvCd"
          :label="t('MSG_TXT_CLCTAM_DV')"
          rules="required"
          type="radio"
          :options="clctamDvOpt"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_TOT_NPD_AMT')"
        required
      >
        <kw-input
          v-model="searchParams.fromTotNpdAmt"
          :regex="/^[0-9]*$/i"
          rules="required"
          maxlength="10"
          :label="t('MSG_TXT_TOT_NPD_AMT')"
        />
        <span>~</span>
        <kw-input
          v-model="searchParams.toTotNpdAmt"
          :regex="/^[0-9]*$/i"
          rules="required"
          maxlength="10"
          :label="t('MSG_TXT_TOT_NPD_AMT')"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_MTR_CRT_WK_DT')"
        required
      >
        <kw-date-picker
          v-model="searchParams.ojWkDt"
          rules="required"
          :label="t('MSG_TXT_MTR_CRT_WK_DT')"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        :label="t('MSG_TXT_MTR_CRT_PY_TMLM')"
        :required="isState"
      >
        <kw-date-picker
          v-model="searchParams.ojPyTmlmDt"
          :label="t('MSG_TXT_MTR_CRT_PY_TMLM')"
          :rules="isState ? 'required' : ''"
          :disable="!isState"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_WK_DT')"
        :required="!isState"
      >
        <kw-date-picker
          v-model="searchParams.wkDt"
          :label="t('MSG_TXT_WK_DT')"
          :rules="!isState ? 'required' : ''"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_PY_TMLM')"
        :required="!isState"
      >
        <kw-date-picker
          v-model="searchParams.pyTmlmDt"
          :rules="!isState ? 'required' : ''"
          :label="t('MSG_TXT_PY_TMLM')"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>
  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change="onChangePageInfo"
        />
      </template>
      <kw-btn
        v-show="isObject"
        v-permission:update
        :label="t('MSG_BTN_SAVE')"
        grid-action
        @click="onClickSave"
      />
      <kw-separator
        v-show="isObject"
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
        :disable="pageInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        v-permission:create
        :label="isObject? t('MSG_TXT_MTR_CRT') : t('MSG_TXT_CST_NO_BASE_CRT')"
        primary
        dense
        @click="onClickCreate"
      />
    </kw-action-top>

    <kw-grid
      ref="grdObjectRef"
      name="grdObject"
      :visible-rows="pageInfo.pageSize"
      @init="initObjectGrid"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="onChangePageInfo"
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
  codeUtil,
  useMeta,
} from 'kw-lib';
import {
  cloneDeep,
  isEmpty,
} from 'lodash-es';
import dayjs from 'dayjs';

const {
  notify,
  confirm,
  alert,
} = useGlobal();
const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const grdObjectRef = ref(getComponentType('KwGrid'));
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const isState = ref(true);
const isObject = ref(true);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/bond/unpaid-guide-urgents';

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'UC_AMT_FW_TP_CD',
  'COPN_DV_CD',
  'BND_BIZ_DV_CD',
);

const searchParams = ref({
  ucAmtFwTpCd: '01',
  stateDvCd: '01',
  copnDvCd: '',
  bndBizDvCd: '',
  fromDlqMcn: '',
  toDlqMcn: '',
  clctamDvCd: '01',
  fromTotNpdAmt: '',
  toTotNpdAmt: '',
  ojWkDt: dayjs().format('YYYYMMDD'),
  ojPyTmlmDt: dayjs().format('YYYYMMDD'),
  wkDt: dayjs().format('YYYYMMDD'),
  pyTmlmDt: dayjs().format('YYYYMMDD'),
});
const stateOpt = [
  { codeId: '01', codeName: t('MSG_TXT_MTR_CRT') },
  { codeId: '02', codeName: t('MSG_TXT_CST_NO_BASE_CRT') },
];
const clctamDvOpt = [
  { codeId: '01', codeName: t('MSG_TXT_WELLS_STM') },
  { codeId: '02', codeName: t('MSG_TXT_WELLS_MTM') },
];

// 검색 조회
let cachedParams;
async function fetchData() {
  const res = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });

  const { list: data, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdObjectRef.value.getView();

  view.columnByName('agrgCt').visible = !isState.value;
  view.columnByName('agrgMinusCt').visible = !isState.value;
  isObject.value = isState.value;

  view.getDataSource().setRows(data);
  // view.resetCurrent()
}

async function onClickSearch() {
  const { fromDlqMcn, toDlqMcn, fromTotNpdAmt, toTotNpdAmt } = searchParams.value;

  if (fromDlqMcn > toDlqMcn) {
    notify(t('MSG_ALT_STRT_YM_END_YM_BIG', [t('MSG_TXT_DLQ_MCNT') + t('MSG_TXT_RSV_STRT_DTM'), t('MSG_TXT_RSV_END_DTM')]));
    return false;
  }

  if (fromTotNpdAmt > toTotNpdAmt) {
    notify(t('MSG_ALT_STRT_YM_END_YM_BIG', [t('MSG_TXT_TOT_NPD_AMT') + t('MSG_TXT_RSV_STRT_DTM'), t('MSG_TXT_RSV_END_DTM')]));
    return false;
  }

  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickSave() {
  if (isEmpty(cachedParams)) { await alert(t('MSG_ALT_NO_DATA_PIZ_CREATE_DATE')); return; } // 검색된 데이터가 없습니다. 자료생성 후 저장 버튼을 클릭해 주시기 바랍니다.
  const params = {
    ucAmtFwTpCd: searchParams.value.ucAmtFwTpCd,
    ojWkDt: searchParams.value.ojWkDt,
  };
  await dataService.post(baseUrl, params);
  notify(t('MSG_TXT_CNFM_SCS')); // 확정 되었습니다.
  await onClickSearch();
}

const { currentRoute } = useRouter();
async function onClickExcelDownload() {
  const view = grdObjectRef.value.getView();
  if (gridUtil.isModified(view)) { notify(t('MSG_TXT_NEED_SAVE_EXCEL_DOWNLOAD')); return; }

  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    exportData: res.data,
    fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TIT_RENTAL_CB_OBJECT')}`,
    timePostfix: true,
    indicator: 'hidden',
    checkBar: 'hidden',
  });
}

async function onClickCreate() {
  if (isEmpty(cachedParams)) return;
  const checkParams = {
    ucAmtFwTpCd: searchParams.value.ucAmtFwTpCd,
    ojWkDt: searchParams.value.ojWkDt,
    wkDt: searchParams.value.wkDt,
  };
  // 자료생성일 경우
  if (isState.value) {
    const objectParams = {
      ucAmtFwTpCd: searchParams.value.ucAmtFwTpCd,
      copnDvCd: searchParams.value.copnDvCd,
      bndBizDvCd: searchParams.value.bndBizDvCd,
      fromDlqMcn: searchParams.value.fromDlqMcn,
      toDlqMcn: searchParams.value.toDlqMcn,
      clctamDvCd: searchParams.value.clctamDvCd,
      ojWkDt: searchParams.value.ojWkDt,
      ojPyTmlmDt: searchParams.value.ojPyTmlmDt,
    };
    const { data } = await dataService.get(`${baseUrl}/check-object`, { params: { ...checkParams } });
    if (data.ojTotalCount !== 0 && data.cnfmYn === 'N') {
      if (await confirm(t('MSG_ALT_EXIST_DATA_RECREATION'))) { // 이미 생성된 자료가 있습니다. 재생성 하시겠습니까?
        await dataService.post(`${baseUrl}/object`, objectParams);

        notify(t('MSG_ALT_CRT_FSH')); // 생성 되었습니다.
        await onClickSearch();
      }
    } else if (data.ojTotalCount !== 0 && data.cnfmYn === 'Y') {
      await alert(t('MSG_ALT_BF_CNFM_CONF_DATA')); // 자료가 확정되어 생성할 수 없습니다
    } else if (data.ojTotalCount === 0) {
      if (await confirm(t('MSG_ALT_WANT_CONTINUE_CREATE_DATA'))) { // 자료를 생성합니다. 계속 진행하시겠습니까?
        await dataService.post(`${baseUrl}/object`, objectParams);

        notify(t('MSG_ALT_CRT_FSH')); // 생성 되었습니다.
        await onClickSearch();
      }
    }
  } else { // 고객번호기준생성 버튼 클릭일 경우
    const cstNoParams = {
      ucAmtFwTpCd: searchParams.value.ucAmtFwTpCd,
      wkDt: searchParams.value.wkDt,
      ojWkDt: searchParams.value.ojWkDt,
      pyTmlmDt: searchParams.value.pyTmlmDt,
    };

    const { data } = await dataService.get(`${baseUrl}/check-customer`, { params: { ...checkParams } });
    if (data.ojTotalCount === 0) {
      await alert(t('MSG_ALT_NO_DATA_FIRST_PROCESS_CREATE_DATA')); // 생성된 자료가 없습니다. 자료생성을 먼저 진행해 주시기 바랍니다.
      return;
    }

    if (data.cnfmYn === 'N') {
      await alert(t('MSG_ALT_NO_CONF_DATA_DONT_CREATE_CST_DATA')); // 확정된 자료가 없습니다. 고객번호기준 생성이 불가합니다.
      return;
    }

    if (data.totalCount !== 0) {
      await alert(t('MSG_ALT_ALREADY_CST_DATA_UNABLE_CREATE')); // 이미 생성된 고객번호기준 자료가 있습니다. 생성이 불가합니다.
      return;
    }

    if (await confirm(t('MSG_ALT_WANT_CREATE_CST_NO_BASE_DATA'))) { // 고객번호기준 자료를 생성합니다. 게속 진행 하시겠습니까?
      await dataService.post(`${baseUrl}/customer`, cstNoParams);

      notify(t('MSG_ALT_CRT_FSH')); // 생성 되었습니다.
      await onClickSearch();
    }
  }
}

async function onChangePageInfo() {
  if (isEmpty(cachedParams)) return;
  await fetchData();
}

watch(() => searchParams.value.stateDvCd, async (val) => {
  if (val === '01') {
    isState.value = true;
    searchParams.value.ojPyTmlmDt = dayjs().format('YYYYMMDD');
  } else {
    isState.value = false;
    searchParams.value.ojPyTmlmDt = '';
  }
}, { immediate: true });
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initObjectGrid = defineGrid((data, view) => {
  const columns = [
    // rev:230410 header 텍스트 변경
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '110', styleName: 'text-center' },
    // rev:230410 header 텍스트 변경
    { fieldName: 'sfkVal', header: t('MSG_TXT_SFK'), width: '110', styleName: 'text-center' },
    // rev:230410 header 텍스트 변경
    { fieldName: 'cntrNoSn', header: t('MSG_TXT_CNTR_DTL_NO'), width: '110', styleName: 'text-center' },
    // //rev:230410 header 텍스트 변경
    { fieldName: 'copnDvNm', header: t('MSG_TXT_CONTR_TYPE'), width: '110', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTR_PERSON_NAME'), width: '110', styleName: 'text-center' },
    { fieldName: 'cstY', header: t('MSG_TXT_CST_Y'), width: '120', styleName: 'text-center' },
    { fieldName: 'cstCd', header: t('MSG_TXT_CST_CD'), width: '110', styleName: 'text-center' },
    { fieldName: 'cntrSn', header: t('MSG_TXT_SERIAL_NUMBER'), width: '110', styleName: 'text-center' },
    { fieldName: 'agrgCt', header: t('MSG_TXT_COUNT'), width: '110', visible: false, styleName: 'text-right', dataType: 'number' },
    { fieldName: 'agrgMinusCt', header: t('MSG_TXT_REMAINING_CNT'), width: '110', visible: false, styleName: 'text-right' },
    { fieldName: 'cntrBasAdr', header: t('MSG_TXT_ADR_1'), width: '250' },
    { fieldName: 'cntrDtlAdr', header: t('MSG_TXT_ADR_2'), width: '150' },
    { fieldName: 'cntrRefAdr', header: t('MSG_TXT_ADR_3'), width: '150' },
    { fieldName: 'zip', header: t('MSG_TXT_ZIP'), width: '80', styleName: 'text-center' },
    { fieldName: 'istPlcNm', header: t('MSG_TXT_ADRS'), width: '110', styleName: 'text-center' },
    { fieldName: 'bndBizDvNm', header: t('MSG_TXT_TASK_DIV'), width: '110', styleName: 'text-center' },
    { fieldName: 'rcpDate', header: t('MSG_TXT_CNTR_DATE'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'istDate', header: t('MSG_TXT_IST_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'rentalAmt1', header: t('MSG_TXT_RTLFE1'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'rentalAmt2', header: t('MSG_TXT_RTLFE2'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'npdAmt', header: t('MSG_TXT_NPD_CHRAM'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'dlqAmt', header: t('MSG_TXT_DLQAM'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmChramAmt', header: t('MSG_TXT_THM_CHRAM'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'dlqAddAmt', header: t('MSG_TXT_DLQ_ADAMT'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'spmtSlAmt', header: t('MSG_TXT_SPMT_SL_AMOUNT'), width: '110', styleName: 'text-right', dataType: 'number' },
    // rev:230410 essential 추가
    { fieldName: 'dlqMcn', header: { text: t('MSG_TXT_DLQ_MCNT'), styleName: 'essential' }, width: '120', styleName: 'text-center' },
    // // rev:230410 essential 추가
    { fieldName: 'totNpdAmt', header: t('MSG_TXT_TOT_DLQ_AMT'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'pdgrpNm', header: t('MSG_TXT_PRD_GRP'), width: '110', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_GOODS_NM'), width: '130', styleName: 'text-center' },
    { fieldName: 'fnlPyDate', header: t('MSG_TXT_RECT_PY_D'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'bnkCd', header: t('MSG_TXT_VT_AC_BNK'), width: '110', styleName: 'text-center' },
    { fieldName: 'bnkNm', header: t('MSG_TXT_VAC_BNK_NM'), width: '110', styleName: 'text-center' },
    { fieldName: 'vacNo', header: t('MSG_TXT_VT_AC_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'achldrNm', header: t('MSG_TXT_ACHLDR'), width: '110', styleName: 'text-center' },
    { fieldName: 'pyTmlmDt', header: t('MSG_TXT_PY_TMLM'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'wkDt', header: t('MSG_TXT_WK_OR_CNFM_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'clctamPrtnrNm', header: t('MSG_TXT_CLCTAM_PSIC'), width: '110', styleName: 'text-center' },
    { fieldName: 'ofrmTnoVal', header: t('MSG_TXT_CLCTAM_ICHR_CTPLC'), width: '120', styleName: 'text-center', editor: { type: 'telephone' } },

  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});
</script>
