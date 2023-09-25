<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaWelsMngerSettlementAwOjpsM - WM정착수당 대상자 관리
3. 작성자 : min-kyu bae
4. 작성일 : 2023.06.05
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- WM정착수당 대상자 관리 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            :label="$t('MSG_TXT_BASE_YM')"
            type="month"
            rules="required"
            @change="onChangeBaseYm"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ORDR')"
        >
          <kw-option-group
            v-model="searchParams.tcntDvCd"
            :label="$t('MSG_TXT_ORDR')"
            type="radio"
            :options="codes.FEE_TCNT_DV_CD"
            @change="onChangeBaseYm"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            icon="search"
            clearable
            :maxlength="10"
            :on-click-icon="onClickSearchNo"
            :placeholder="$t('MSG_TXT_SEQUENCE_NUMBER')"
          />
          <kw-input
            v-model="searchParams.prtnrKnm"
            :placeholder="$t('MSG_TXT_EMPL_NM')"
            readonly
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_DIV')">
          <kw-select
            v-model="searchParams.divCd"
            :options="dvCd"
            first-option
            first-option-value=""
            :first-option-label="$t('MSG_TXT_ALL')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_RSB_DV')">
          <kw-select
            v-model="searchParams.rsbDvCd"
            :options="filterRsbDvCd"
            first-option
            first-option-value=""
            :first-option-label="$t('MSG_TXT_ALL')"
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
          :label="$t('MSG_BTN_SAVE')"
          secondary
          dense
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
          dense
          secondary
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount.value === 0"
          @click="onClickExcelDownload"
        />
        <kw-btn
          v-permission:create
          :label="$t('MSG_BTN_OPNG_TP')+$t('MSG_BTN_CNTN_CREATE')"
          secondary
          dense
          @click="onClickCreate"
        />
        <kw-btn
          v-permission:update
          :label="$t('MSG_BTN_OPNG_TP')+$t('MSG_BTN_DTRM')"
          secondary
          dense
          @click="onClickDtrm"
        />
        <kw-btn
          v-permission:update
          :label="$t('MSG_BTN_OPNG_TP')+$t('MSG_BTN_DTRM')+$t('MSG_BTN_CANCEL')"
          secondary
          dense
          @click="onClickDtrmCan"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';

import { useDataService, getComponentType, gridUtil, defineGrid, codeUtil, notify, useGlobal, alert } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { modal, confirm } = useGlobal();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const codes = await codeUtil.getMultiCodes('FEE_TCNT_DV_CD', 'RSB_DV_CD', 'OPNG_CD');
const filterRsbDvCd = codes.RSB_DV_CD.filter((v) => ['W0204', 'W0205'].includes(v.codeId));
const dvCd = [
  { codeId: '01', codeName: '계약일' },
  { codeId: '02', codeName: '해약일' },
  { codeId: '03', codeName: '해약제외' },
];

const searchParams = ref({
  baseYm: now.add(-1, 'month').format('YYYYMM'),
  tcntDvCd: '01',
  prtnrNo: '',
  prtnrKnm: '',
  divCd: '',
  rsbDvCd: '',
  reCrtYn: 'N',
});

const info = ref({
  opngCnfmYn: '',
  opngCnfmCnt: '',
  feeCnfmYn: '',
});

const bfMonth = now.add(-1, 'month').format('YYYYMM');

let cachedParams;

async function onClickExcelDownload() {
  cachedParams = cloneDeep(searchParams.value);
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/fee/wm-settlement-allowances/wmList', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

async function fetchData(type) {
  const response = await dataService.get(`/sms/wells/fee/wm-settlement-allowances/${type}`, { params: cachedParams, timeout: 300000 });
  const resData = response.data;
  if (type === 'wmList') {
    totalCount.value = resData.length;
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(resData);
  } else if (type === 'etc') {
    info.value = resData;
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData('etc');
  await fetchData('wmList');
}

/*
 *  Event - 번호 검색 아이콘 클릭 이벤트
 */
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzMonthPartnerListP',
    componentProps: {
      baseYm: searchParams.value.baseYm,
      prtnrNo: searchParams.value.prtnrNo,
      ogTpCd: 'W02',
      prtnrKnm: undefined,
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.prtnrNo = payload.prtnrNo;
      searchParams.value.prtnrKnm = payload.prtnrKnm;
    }
  }
}

// 저장 버튼 클릭 이벤트
async function onClickSave() {
  const { baseYm } = searchParams.value;
  const { feeCnfmYn, opngCnfmYn, opngCnfmCnt } = info.value;
  const view = grdMainRef.value.getView();
  if (feeCnfmYn === 'Y') {
    await alert(t('MSG_ALT_BF_CNFM_MDFC_IMP'));
    return;
  } if (opngCnfmYn === 'Y') {
    await alert(t('MSG_ALT_DATA_ALREADY_CNFM'));
    return;
  } if (opngCnfmCnt <= 0) {
    await alert(t('MSG_ALT_DTA_EXST'));
    return;
  }
  if (bfMonth !== baseYm) {
    await alert(t('MSG_ALT_LSTMM_PSB'));
    return;
  } if (await gridUtil.alertIfIsNotModified(view)) {
    return;
  }
  if (!await gridUtil.validate(view)) { return; }
  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/fee/wm-settlement-allowances/update', changedRows);
  await onClickSearch();
  notify(t('MSG_ALT_SAVE_DATA'));
}

// 개시구분 생성 버튼 클릭 이벤트
async function onClickCreate() {
  /*
  const { baseYm } = searchParams.value;
  const { feeCnfmYn, opngCnfmYn, opngCnfmCnt } = info.value;
  if (bfMonth !== baseYm) {
    await alert(t('MSG_ALT_LSTMM_PSB')); // 전월만 생성가능
  } else if (feeCnfmYn === 'Y') {
    await alert(t('MSG_ART_FEE_CL_CRT_IMP')); // 수수료 마감 이후 생성불가
  } else if (opngCnfmYn === 'Y') {
    await alert(t('MSG_ALT_BF_CNFM_CONF')); // 개시구분 확정 이후 생성불가
  } else if (opngCnfmCnt > 0) {
    if (await confirm(t('MSG_ALT_EXIST_DATA_RECREATION'))) { // 해당년월 데이터 존재 재생성?
      searchParams.value.reCrtYn = 'Y';
      await dataService.post('/sms/wells/fee/wm-settlement-allowances/insert', searchParams.value);
      searchParams.value.reCrtYn = 'N';
      await onClickSearch();
      notify(t('MSG_ALT_CRT_FSH'));
    }
  } else if (await confirm(t('MSG_ALT_OPNG_CRT'))) {
    await dataService.post('/sms/wells/fee/wm-settlement-allowances/insert', searchParams.value);
    notify(t('MSG_ALT_CRT_FSH'));
    await onClickSearch();
  }
  test를 위한 임시처리
  */
  searchParams.value.reCrtYn = 'Y';
  await dataService.post('/sms/wells/fee/wm-settlement-allowances/insert', searchParams.value);
  searchParams.value.reCrtYn = 'N';
  notify(t('MSG_ALT_CRT_FSH'));
  await onClickSearch();
}

// 개시구분 확정 버튼 클릭 이벤트
async function onClickDtrm() {
  const { baseYm } = searchParams.value;
  const { opngCnfmCnt, opngCnfmYn } = info.value;
  if (bfMonth !== baseYm) {
    await alert(t('MSG_ALT_LSTMM_PSB'));
  } else if (opngCnfmCnt <= 0) {
    await alert(t('MSG_ALT_NO_APPY_OBJ_DT')); /* 개시구분 데이터 = 0 확정 불가 */
  } else if (opngCnfmYn === 'Y') {
    await alert(t('MSG_ALT_BF_CNFM_CONF')); /* 개시구분 확정 이후 중복확정 불가 */
  } else if (await confirm(t('MSG_ALT_OPNG_DTRM'))) {
    searchParams.value.cnfmStatYn = 'Y';
    await dataService.post('/sms/wells/fee/wm-settlement-allowances/confirm', searchParams.value);
    await onClickSearch();
    notify(t('MSG_ALT_CNFM_SUCESS'));
  }
}

// 개시구분 확정취소 버튼 클릭 이벤트
async function onClickDtrmCan() {
  const { baseYm } = searchParams.value;
  const { opngCnfmCnt, opngCnfmYn } = info.value;
  if (bfMonth !== baseYm) {
    await alert(t('MSG_ALT_LSTMM_PSB'));
  } else if (opngCnfmCnt <= 0) {
    await alert(t('MSG_ALT_NO_APPY_OBJ_DT')); /* 개시구분 데이터 = 0 확정취소 불가 */
  } else if (opngCnfmYn === 'N') {
    await alert(t('MSG_ALT_BF_CNFM_CANCEL_CONF')); /* 이미 확정취소 */
  } else if (await confirm(t('MSG_ALT_OPNG_CAN_DTRM'))) {
    searchParams.value.cnfmStatYn = 'N';
    await dataService.post('/sms/wells/fee/wm-settlement-allowances/confirm', searchParams.value);
    await onClickSearch();
    notify(t('MSG_ALT_CNFM_CANCEL_CONF'));
  }
}

// 기준년월 변경시 조회 이벤트
async function onChangeBaseYm() {
  await onClickSearch();
}

onMounted(async () => {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData('etc');
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'og1nm' },
    { fieldName: 'og2nm' },
    { fieldName: 'ogId' },
    { fieldName: 'bldNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'rsbDvCd' },
    { fieldName: 'qlfDvCd' },
    { fieldName: 'nextQlfDvCd' },
    { fieldName: 'procsDtm' },
    { fieldName: 'srtup' },
    { fieldName: 'freeSrtup' },
    { fieldName: 'bzStatCd' },
    { fieldName: 'cntrDt' },
    { fieldName: 'cltnDt' },
    { fieldName: 'fstCntrDt' },
    { fieldName: 'fnlCltnDt' },
    { fieldName: 'opngCd' },
    { fieldName: 'baseYm' },
    { fieldName: 'tcntDvCd' },
    { fieldName: 'cnfmStatYn' },

  ];

  const columns = [
    { fieldName: 'og1nm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '130', styleName: 'text-center', editable: false },
    { fieldName: 'og2nm', header: t('MSG_TXT_RGNL_GRP'), width: '130', styleName: 'text-center', editable: false },
    { fieldName: 'ogId', header: t('MSG_TXT_BLG'), width: '130', styleName: 'text-center', editable: false },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '130', styleName: 'text-center', editable: false },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '130', styleName: 'text-center', editable: false },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '130', styleName: 'text-center', editable: false },
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '130', styleName: 'text-center', editable: false },
    { fieldName: 'qlfDvCd', header: t('MSG_TXT_THM') + t('MSG_TXT_QLF'), width: '130', styleName: 'text-center', editable: false },
    { fieldName: 'nextQlfDvCd', header: `M+1${t('MSG_TXT_QLF')}`, width: '130', styleName: 'text-center', editable: false },
    { fieldName: 'procsDtm', header: `WM${t('MSG_TXT_CV')}${t('MSG_TXT_MON')}`, width: '130', styleName: 'text-center', editable: false },
    { fieldName: 'srtup', header: t('MSG_TXT_SRTUP'), width: '130', styleName: 'text-center', editable: false, datetimeFormat: 'yyyy-MM' },
    { fieldName: 'freeSrtup', header: t('MSG_TXT_FREE_SRTUP'), width: '130', styleName: 'text-center', editable: false, datetimeFormat: 'yyyy-MM' },
    { fieldName: 'bzStatCd', header: t('MSG_TXT_ACTI') + t('MSG_TXT_YN'), width: '130', styleName: 'text-center', editable: false },
    { fieldName: 'cntrDt', header: t('MSG_TXT_CNTRCT_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date', editable: false },
    { fieldName: 'cltnDt', header: t('MSG_TXT_CLTN_D'), width: '130', styleName: 'text-center', datetimeFormat: 'date', editable: false },
    { fieldName: 'fstCntrDt', header: t('MSG_TXT_INIT_CNTR_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date', editable: false },
    { fieldName: 'fnlCltnDt', header: t('MSG_TXT_FNL_CLTN_D'), width: '130', styleName: 'text-center', datetimeFormat: 'date', editable: false },
    { fieldName: 'opngCd',
      header: t('MSG_TXT_OPNG_TP'),
      width: '130',
      rules: 'required',
      options: codes.OPNG_CD,
      styleName: 'text-center',
      styleCallback(grid, dataCell) {
        const cnfmStatYn = gridUtil.getCellValue(grid, dataCell.index.dataRow, 'cnfmStatYn');
        if (cnfmStatYn === 'N') {
          return { editable: true,
            editor: {
              type: 'dropdown',
            } };
        }
        return { editable: false };
      },
    },
    { fieldName: 'baseYm', visible: false },
    { fieldName: 'tcntDvCd', visible: false },
    { fieldName: 'cnfmStatYn', visible: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
});
</script>
