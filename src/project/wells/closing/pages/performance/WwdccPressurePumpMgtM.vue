<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCC
2. 프로그램 ID : WwdccPressurePumpMgtM - 가압펌프 설치/철거 관리 - W-CL-U-0045M01
3. 작성자 : sunghun choi
4. 작성일 : 2023.09.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 가압펌프 설치/철거 관리
****************************************************************************************************
---->
<template>
  <kw-page>
    <template v-if="radioInqrDv === 1">
      <kw-search
        @search="onClickConfirmSearch"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_INQR_DV2')"
          >
            <kw-option-group
              v-model="searchConfirmParams.inqrDv"
              :options="selectCodes.INQR_DV"
              type="radio"
              @change="onChangeInqrDv(2)"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_WK_DT')"
          >
            <kw-date-range-picker
              v-model:from="searchConfirmParams.fstVstFshDtFrom"
              v-model:to="searchConfirmParams.fstVstFshDtTo"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_DTRM_YN')"
          >
            <kw-select
              v-model="searchConfirmParams.cnfmYn"
              :options="selectCodes.CNFM_YN"
              first-option="all"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_PROD_CD')"
          >
            <kw-select
              v-model="searchConfirmParams.itmPdCd"
              :options="selectCodes.ITM_PD_CD"
              first-option="all"
            />
          </kw-search-item>

          <kw-search-item
            :label="$t('MSG_TXT_TASK_TYPE')"
          >
            <kw-select
              v-model="searchConfirmParams.svBizDclsfCd"
              :options="selectCodes.SV_BIZ_DCLSF_CD"
              first-option="all"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_USE_CLN')"
          >
            <kw-select
              v-model="searchConfirmParams.svBizHclsfCd"
              :options="selectCodes.SV_BIZ_HCLSF_CD"
              first-option="all"
            />
          </kw-search-item>
        </kw-search-row>
      </kw-search>

      <div class="result-area">
        <kw-action-top>
          <template #left>
            <kw-paging-info :total-count="totalConfirmCount" />
            <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
          </template>

          <kw-btn
            icon="download_on"
            :label="$t('MSG_BTN_EXCEL_DOWN')"
            secondary
            dense
            :disable="totalConfirmCount === 0"
            @click="onClickConfirmExcelDownload"
          />
          <kw-separator
            spaced
            vertical
            inset
          />
          <kw-btn
            :label="$t('MSG_BTN_CONF')"
            secondary
            dense
            @click="onClickSave"
          />
          <kw-btn
            :label="$t('MSG_BTN_DTRM_CAN')"
            secondary
            dense
            @click="onClickDelete"
          />
        </kw-action-top>

        <kw-grid
          ref="grdConfirmRef"
          name="grdConfirm"
          :visible-rows="10"
          @init="initGridConfirm"
        />
      </div>
    </template>
    <template v-if="radioInqrDv === 2">
      <kw-search
        class="mt30"
        :cols="2"
        @search="onClickSalesBaseSearch"
      >
        <kw-search-row>
          <kw-search-item
            :label="$t('MSG_TXT_INQR_DV2')"
          >
            <kw-option-group
              v-model="searchConfirmParams.inqrDv"
              :options="selectCodes.INQR_DV"
              type="radio"
              @change="onChangeInqrDv(1)"
            />
          </kw-search-item>
          <kw-search-item
            :label="$t('MSG_TXT_SL_YM')"
            required
          >
            <kw-date-picker
              v-model="searchSalesBaseParams.slYm"
              rules="required"
              type="month"
            />
          </kw-search-item>
        </kw-search-row>
      </kw-search>
      <div class="result-area">
        <kw-action-top>
          <template #left>
            <kw-paging-info :total-count="totalSalesBaseCount" />
            <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
          </template>

          <kw-btn
            icon="download_on"
            :label="$t('MSG_BTN_EXCEL_DOWN')"
            secondary
            dense
            :disable="totalSalesBaseCount === 0"
            @click="onClickSalesBaseExcelDownload"
          />
        </kw-action-top>

        <kw-grid
          ref="grdSalesBaseRef"
          name="grdSalesBase"
          :visible-rows="10"
          @init="initGridSalesBase"
        />
      </div>
    </template>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, gridUtil, getComponentType, useDataService, useGlobal } from 'kw-lib';
import { getCnfmYn, getItmPdCd, getSvBizDclsfCd, getSvBizHclsfCd, getInqrDv } from '~sms-common/closing/utils/clUtil';
import dayjs from 'dayjs';

const dataService = useDataService();
const { currentRoute } = useRouter();
const { alert, confirm, notify } = useGlobal();
const now = dayjs();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const selectCodes = ref({
  CNFM_YN: await getCnfmYn(),
  ITM_PD_CD: await getItmPdCd(),
  SV_BIZ_DCLSF_CD: await getSvBizDclsfCd(),
  SV_BIZ_HCLSF_CD: await getSvBizHclsfCd(),
  INQR_DV: await getInqrDv(),

});

const grdConfirmRef = ref(getComponentType('KwGrid'));
const totalConfirmCount = ref(0);
const grdSalesBaseRef = ref(getComponentType('KwGrid'));
const totalSalesBaseCount = ref(0);
const radioInqrDv = ref(1);

// TODO: 가압펌프 확정관리 검색조건
const searchConfirmParams = ref({
  fstVstFshDtFrom: now.format('YYYYMMDD'),
  fstVstFshDtTo: now.format('YYYYMMDD'),
  cnfmYn: '',
  itmPdCd: '',
  svBizDclsfCd: '',
  svBizHclsfCd: '',
  inqrDv: '1',
});

// TODO: 가압펌프 매출기준 자료 검색조건
const searchSalesBaseParams = ref({
  slYm: now.format('YYYYMM'),
});

function onChangeInqrDv(dv) {
  radioInqrDv.value = dv;
}

// TODO: 가압펌프 확정관리 조회
async function fetchConfirm() {
  const res = await dataService.get('/sms/wells/closing/pressure-pump/confirm-management', { params: searchConfirmParams.value });
  const confirmData = res.data;
  totalConfirmCount.value = confirmData.length;

  const gridView = grdConfirmRef.value.getView();
  gridView.getDataSource().setRows(confirmData);
}

// TODO: 가압펌프 확정관리 엑셀다운로드
async function onClickConfirmExcelDownload() {
  const res = await dataService.get('/sms/wells/closing/pressure-pump/confirm-management', { params: searchConfirmParams.value });
  const view = grdConfirmRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    checkBar: 'hidden',
    exportData: res.data,
  });
}

async function onClickConfirmSearch() {
  await fetchConfirm();
}

// TODO: 가압펌프 매출기준 자료 조회
async function fetchSalesBase() {
  const res = await dataService.get('/sms/wells/closing/pressure-pump/sales-base', { params: searchSalesBaseParams.value });
  const salesBase = res.data;
  totalSalesBaseCount.value = salesBase.length;

  const gridView = grdSalesBaseRef.value.getView();
  gridView.getDataSource().setRows(salesBase);
}

// TODO: 가압펌프 매출기준 자료 엑셀다운로드
async function onClickSalesBaseExcelDownload() {
  const res = await dataService.get('/sms/wells/closing/pressure-pump/sales-base', { params: searchSalesBaseParams.value });
  const view = grdSalesBaseRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    checkBar: 'hidden',
    exportData: res.data,
  });
}

async function onClickSalesBaseSearch() {
  await fetchSalesBase();
}

async function onClickDelete() {
  const view = grdConfirmRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  const deleteParams = [];
  if (checkedRows.length < 1) {
    await alert(t('MSG_ALT_NO_DATA'));
    return;
  }
  let cnfmCnt = 0;
  let errCnt = 0;
  checkedRows.forEach((obj) => {
    if (obj.cnfmYn === '미확정') {
      cnfmCnt += 1;
    } else if (obj.cnfmYn === '오류') {
      errCnt += 1;
    }
    deleteParams.push({
      cntrNo: obj.cntrNo,
      adnSvSn: obj.adnSvSn,
    });
  });

  if (cnfmCnt > 0) {
    alert(t('MSG_ALT_NCFRM_MTR_RGST'));
    return;
  }

  if (errCnt > 0) {
    alert(t('MSG_ALT_ERR_DTA_INC'));
    return;
  }
  const rows = checkedRows.map((row) => (
    { cntrNo: row.cntrNo, adnSvSn: row.adnSvSn }));

  const isOk = await confirm(t('MSG_ALT_CNFM_STAT_CAN'));

  if (isOk) {
    await dataService.delete('/sms/wells/closing/pressure-pump', { data: rows });
    notify(t('MSG_ALT_CNFM_PROCS_CAN'));
    await onClickConfirmSearch();
  }
}

async function onClickSave() {
  const view = grdConfirmRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  const saveParams = [];
  if (checkedRows.length < 1) {
    await alert(t('MSG_ALT_NO_DATA'));
    return;
  }
  let cnfmCnt = 0;
  let errCnt = 0;
  checkedRows.forEach((obj) => {
    if (obj.cnfmYn === '확정') {
      cnfmCnt += 1;
    } else if (obj.cnfmYn === '오류') {
      errCnt += 1;
    }
    saveParams.push({
      cntrNo: obj.cntrNo,
      cntrSn: obj.cntrSn,
      itmPdCd: obj.itmPdCd,
      lctamt: obj.lctamt,
      adnSvStrtYm: obj.adnSvStrtYm,
      rcpdt: obj.rcpdt,
      istDuedt: obj.istDuedt,
      istDt: obj.istDt,
      gubn: obj.gubn,
    });
  });

  if (cnfmCnt > 0) {
    alert(t('MSG_ALT_CNFM_MTR_RGST'));
    return;
  }
  if (errCnt > 0) {
    alert(t('MSG_ALT_ERR_DTA_INC'));
    return;
  }
  const isOk = await confirm(t('MSG_ALT_DTA_CNFM'));

  if (isOk) {
    await dataService.post('/sms/wells/closing/pressure-pump', checkedRows);
    notify(t('MSG_ALT_DTA_CNFM_PROCS'));
    await onClickConfirmSearch();
  }
}

onMounted(async () => {
  radioInqrDv.value = 1;
});

const initGridConfirm = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cnfmYn' },
    { fieldName: 'errMsg' },
    { fieldName: 'cntrNoSn' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cstKnm' },
    { fieldName: 'filtSellTpCd' },
    { fieldName: 'adnSvSn' },
    { fieldName: 'itmPdCd' },
    { fieldName: 'basePdCd' },
    { fieldName: 'pdAbbrNm' },
    { fieldName: 'pdNm' },
    { fieldName: 'ogNm' },
    { fieldName: 'wrkTypNm' },
    { fieldName: 'gubn' },
    { fieldName: 'lctamt', dataType: 'number' },
    { fieldName: 'svMcn' },
    { fieldName: 'dutyUseMcn' },
    { fieldName: 'fnlVstFshDt' },
    { fieldName: 'istDt' },
    { fieldName: 'reqdDt' },
    { fieldName: 'rsgDt' },
    { fieldName: 'fnlItmGdCd' },
    { fieldName: 'useQty' },
    { fieldName: 'chagGbNm' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'tCnt' },
    { fieldName: 'fstRgstDtm' },
    { fieldName: 'fstRgstUsrId' },
    { fieldName: 'fnlMdfcDtm' },
    { fieldName: 'fnlMdfcUsrId' },
    { fieldName: 'adnSvStrtYm' },
    { fieldName: 'istDuedt' },
    { fieldName: 'rcpdt' },

  ];

  const columns = [
    { fieldName: 'cnfmYn', header: t('MSG_TXT_DTRM_YN'), width: '80', styleName: 'text-center' },
    { fieldName: 'errMsg', header: t('MSG_TXT_ERR_DTL2'), width: '200', styleName: 'text-left' },
    {
      fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      styleName: 'text-center',
      width: '160',

      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      },
    },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '80', styleName: 'text-left' },
    { fieldName: 'filtSellTpCd', header: t('MSG_TXT_CST_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'adnSvSn', header: t('MSG_TXT_SERIAL_NUMBER'), width: '80', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_PROD_CD'), width: '120', styleName: 'text-center', visible: false },
    { fieldName: 'basePdCd', header: t('MSG_TXT_PROD_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_GOODS_NM'), width: '200', styleName: 'text-left' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRESSURE_PUMP_MAT'), width: '150', styleName: 'text-left' },
    { fieldName: 'ogNm', header: t('MSG_TXT_CENTER_DIVISION'), width: '120', styleName: 'text-left' },
    { fieldName: 'wrkTypNm', header: t('MSG_TXT_TASK_TYPE'), width: '100', styleName: 'text-left' },
    { fieldName: 'gubn', header: t('MSG_TXT_USE_CLN'), width: '80', styleName: 'text-center' },
    { fieldName: 'lctamt', header: t('MSG_TXT_PDCT_PRC'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'svMcn', header: t('MSG_TXT_SV_PTRM'), width: '80', styleName: 'text-center' },
    { fieldName: 'dutyUseMcn', header: t('MSG_TXT_DUTY_PTRM'), width: '80', styleName: 'text-center' },
    { fieldName: 'fnlVstFshDt', header: t('MSG_TXT_WK_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'reqdDt', header: t('MSG_TXT_DEM_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'rsgDt', header: t('MSG_TXT_CLTN_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'fnlItmGdCd', header: t('MSG_TXT_GD'), width: '80', styleName: 'text-center' },
    { fieldName: 'useQty', header: t('MSG_TXT_QTY'), width: '80', styleName: 'text-right' },
    { fieldName: 'chagGbNm', header: t('MSG_TXT_DIV'), width: '80', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EGER'), width: '80', styleName: 'text-left' },
    { fieldName: 'tCnt', header: t('MSG_TXT_ACU_STOC'), width: '80', styleName: 'text-right' },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FST_RGST_DT'), width: '160', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR'), width: '80', styleName: 'text-left' },
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_MDFC_DATE'), width: '160', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TIT_MDFC_USR'), width: '120', styleName: 'text-left' },
    { fieldName: 'adnSvStrtYm', header: t('MSG_TXT_ADN_SV_STRT_YM'), width: '120', styleName: 'text-center', visible: false },
    { fieldName: 'istDuedt', header: t('MSG_TXT_IST_EXP_DT'), width: '120', styleName: 'text-center', visible: false },
    { fieldName: 'rcpdt', header: t('MSG_TXT_RCPDT'), width: '120', styleName: 'text-center', visible: false },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});

const initGridSalesBase = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNoSn' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'pdNm' },
    { fieldName: 'adnSvCsAmt', dataType: 'number' },
    { fieldName: 'istDt' },
    { fieldName: 'reqdDt' },
    { fieldName: 'mpyBsdt' },
    { fieldName: 'dpTpCd' },
    { fieldName: 'copnDvCd' },
    { fieldName: 'alncmpCd' },
    { fieldName: 'alncStatTpCd' },
    { fieldName: 'lcpgub' },
    { fieldName: 'lcam36', dataType: 'number' },
    { fieldName: 'lcmon1' },
    { fieldName: 'lcamt1', dataType: 'number' },
    { fieldName: 'lcram1', dataType: 'number' },
  ];

  const columns = [
    {
      fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      styleName: 'text-center',
      width: '160',

      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      },
    },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'pdNm', header: t('MSG_TXT_GOODS_NM'), width: '200', styleName: 'text-left' },
    { fieldName: 'adnSvCsAmt', header: t('MSG_TXT_SL_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'reqdDt', header: t('MSG_TXT_DEM_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_FNT_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'dpTpCd', header: t('MSG_TXT_FNT_DV'), width: '80', styleName: 'text-center' },
    { fieldName: 'copnDvCd', header: t('MSG_TXT_INDI_CORP'), width: '80', styleName: 'text-center' },
    { fieldName: 'alncmpCd', header: t('MSG_TXT_MUTU_ALNC'), width: '80', styleName: 'text-center' },
    { fieldName: 'alncStatTpCd', header: t('MSG_TXT_ALNC_STAT'), width: '80', styleName: 'text-center' },
    { fieldName: 'lcpgub', header: t('MSG_TXT_PRE_PAY'), width: '80', styleName: 'text-center' },
    { fieldName: 'lcam36', header: t('MSG_TXT_ATAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'lcmon1', header: t('MSG_TXT_RENT_PRD_MN'), width: '100', styleName: 'text-right' },
    { fieldName: 'lcamt1', header: t('MSG_TXT_RTLFE'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },
    { fieldName: 'lcram1', header: t('MSG_TXT_RENTAL_DSC'), width: '100', styleName: 'text-right', numberFormat: '#,##0' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
