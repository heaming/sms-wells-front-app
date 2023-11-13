<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTD
2. 프로그램 ID : WwctdRentalInstallationStplExnPsListM - 렌탈 약정 만료 및 멤버십 현황
3. 작성자 : gs.rahul.n
4. 작성일 : 2023.01.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈 약정 만료 및 멤버십 현황 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_EXP_DT')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.cntrPdEnddtStrtdt"
            v-model:to="searchParams.cntrPdEnddtEnddt"
            :label="$t('MSG_TXT_EXP_DT')"
            rules="date_range_required"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_PDGRP')">
          <kw-select
            v-model="searchParams.pdHclsfId"
            :options="codes.PD_HCLSF"
            first-option="all"
            @change="onChangeHclsf"
          />
          <span>/</span>
          <kw-select
            v-model="searchParams.pdMclsfId"
            :options="codes.PD_MCLSF"
            first-option="all"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_PRDT_CODE')">
          <kw-input
            v-model="searchParams.basePdCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_PRDT_NM')">
          <kw-input
            v-model="searchParams.pdNm"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_EXCLD_CANC')">
          <kw-field
            v-slot="{field}"
            v-model="searchParams.isExcdCan"
          >
            <kw-checkbox
              v-bind="field"
              :label="$t('MSG_TXT_EXCLD_CANC')"
              :false-value="'N'"
              :true-value="'Y'"
            />
          </kw-field>
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}:{{ $t('MSG_TXT_MCNT') }})</span>
        </template>
        <kw-btn
          icon="download_on"
          :disable="totalCount === 0"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE'))"
        :total-count="totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useDataService, useMeta } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const grdMainRef = ref(getComponentType('KwGrid'));
const now = dayjs();
const codes = {
  PD_HCLSF: (await dataService.get('/sms/common/contract/products/hclsf')).data,
  PD_MCLSF_ALL: (await dataService.get('/sms/common/contract/products/mclsf')).data,
};
codes.PD_MCLSF = codes.PD_MCLSF_ALL;
const totalCount = ref(0);
const searchParams = ref({
  basePdCd: '',
  cntrPdEnddtStrtdt: now.startOf('month').format('YYYYMMDD'),
  cntrPdEnddtEnddt: now.format('YYYYMMDD'),
  pdHclsfId: '',
  pdMclsfId: '',
  pdNm: '',
  isExcdCan: 'N',
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/wells/contract/expired-retention-contracts', { params: searchParams.value });
  const rentals = res.data;
  totalCount.value = rentals.length;

  const view = grdMainRef.value.getView();
  // 취소제외일 때 취소일, 취소고객 의무사용일자 컬럼 숨김
  ['canDt', 'canCstDutyUseExprYn'].forEach((col) => {
    view.columnByName(col).visible = searchParams.value.isExcdCan !== 'Y';
  });
  view.getDataSource().setRows(rentals);
  view.resetCurrent();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/contract/expired-retention-contracts', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSearch() {
  await fetchData();
}

async function onChangeHclsf(hclsf) {
  if (isEmpty(hclsf)) {
    codes.PD_MCLSF = codes.PD_MCLSF_ALL;
  } else {
    codes.PD_MCLSF = codes.PD_MCLSF_ALL.filter((code) => hclsf === code.hgrPdClsfId);
    searchParams.value.pdMclsfId = '';
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'exnDt' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'dtlCntrNo' },
    { fieldName: 'cntrCstNo' },
    { fieldName: 'cstKnm' },
    { fieldName: 'pdClsf' },
    { fieldName: 'basePdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'istmMcn', dataType: 'number' },
    { fieldName: 'stplPtrm', dataType: 'number' },
    { fieldName: 'canDt' },
    { fieldName: 'canCstDutyUseExprYn' },
    { fieldName: 'slDt' },
    { fieldName: 'dutyUseDt' },
    { fieldName: 'mshCntrNo' },
    { fieldName: 'mshCntrSn' },
    { fieldName: 'mshDtlCntrNo' },
    { fieldName: 'mshCntrDt' },
    { fieldName: 'mshJoinDt' },
    { fieldName: 'mshCanDt' },
    { fieldName: 'mshWdwalDt' },
    { fieldName: 'cntrtMpno' },
    { fieldName: 'istllMpno' },
  ];

  const columns = [
    { fieldName: 'exnDt', header: t('MSG_TXT_EXP_DT'), width: 120, styleName: 'text-center', datetimeFormat: 'date' },
    {
      fieldName: 'dtlCntrNo',
      header: t('MSG_TXT_RNT_CNTR_NO'),
      width: 150,
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return isEmpty(cntrNo) || isEmpty(cntrSn) ? '' : `${cntrNo}-${cntrSn}`;
      },
    },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: 100, styleName: 'text-center' },
    { fieldName: 'pdClsf', header: t('MSG_TXT_PRDT_CATE'), width: 180 },
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: 140, styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: 250 },
    { fieldName: 'istmMcn', header: t('MSG_TXT_RENT_PRD_MN'), width: 100, styleName: 'text-right' },
    { fieldName: 'stplPtrm', header: t('MSG_TXT_LCK_IN_PRD_MN'), width: 100, styleName: 'text-right' },
    { fieldName: 'canDt', header: t('MSG_TXT_CAN_D'), width: 120, styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'canCstDutyUseExprYn', header: t('MSG_TXT_CAN_CST_MAND_PRD_EXP_STAT'), width: 200, styleName: 'text-center' },
    { fieldName: 'slDt', header: t('MSG_TXT_DT_OF_SALE'), width: 120, styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'dutyUseDt', header: t('MSG_TXT_MAND_DAYS'), width: 120, styleName: 'text-center', datetimeFormat: 'date' },
    {
      fieldName: 'mshDtlCntrNo',
      header: t('MSG_TXT_MEM_CNTR_NO'),
      width: 150,
      displayCallback(grid, index) {
        const { mshCntrNo, mshCntrSn } = grid.getValues(index.itemIndex);
        return isEmpty(mshCntrNo) || isEmpty(mshCntrSn) ? '' : `${mshCntrNo}-${mshCntrSn}`;
      },
    },
    { fieldName: 'mshCntrDt', header: t('MSG_TXT_MEM_CNTR_DT_1'), width: 120, styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'mshJoinDt', header: t('MSG_TXT_MEM_SIGNUP'), width: 120, styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'mshCanDt', header: t('MSG_TXT_MEM_CANC_DT_1'), width: 120, styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'mshWdwalDt', header: t('MSG_TXT_MEM_WTDR_DT'), width: 120, styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cntrtMpno', header: t('MSG_TXT_CNTRR_VAC_PH_NO'), width: 150, styleName: 'text-center' },
    { fieldName: 'istllMpno', header: t('MSG_TXT_INSTR_PH_NO'), width: 150, styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
});
</script>
