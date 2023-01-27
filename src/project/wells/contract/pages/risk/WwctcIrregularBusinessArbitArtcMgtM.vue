<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTC
2. 프로그램 ID : WwctcIrregularBusinessArbitArtcMgtM - 비정도 영업 조치 사항 관리
3. 작성자 : gs.nidhi.d
4. 작성일 : 2023.01.23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 비정도 영업 조치 사항 관리
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ACEPT_PERIOD')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.srchGbn"
            :options="prdDivOption"
          />
          <kw-date-range-picker
            :key="isRegistration"
            v-model:from="searchParams.dangOcStrtmm[0]"
            v-model:to="searchParams.dangOcStrtmm[1]"
            :type="isRegistration"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_MANAGEMENT_DEPARTMENT')">
          <kw-select
            v-model="searchParams.dgr1HgrDgPrtnrNm"
            :options="gnrlMngTeamOptions"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_RGNL_GRP')">
          <kw-input v-model="searchParams.dgr2HgrDgPrtnrNm" />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_BRANCH')">
          <kw-input v-model="searchParams.dgr3HgrDgPrtnrNm" />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_EMP_SRCH')">
          <kw-input
            v-model="searchParams.dangOjPrtnrNo"
            icon="search_24"
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
            @change="fetchData"
          />
        </template>
        <kw-btn
          v-permission:delete
          grid-action
          :label="$t('MSG_BTN_DEL')"
          @click="onClickRemove"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:create
          dense
          secondary
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <kw-btn
          v-permission:update
          dense
          secondary
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { notify } = useGlobal();
const { t } = useI18n();

const { getConfig } = useMeta();
const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PNTSC_ARBIT_ATC_CD',
  'PNTSC_ARBIT_DEPT_CD',
);

const prdDivOption = ref([{ codeId: 1, codeName: '등록일자' },
  { codeId: 2, codeName: '발생년월' }]);
const gnrlMngTeamOptions = ref([
  { codeId: '', codeName: '전체' },
  { codeId: 'A', codeName: '총괄단' },
  { codeId: 'B', codeName: '총괄단' },
  { codeId: 'C', codeName: '총괄단' },
  { codeId: 'D', codeName: '총괄단' },
  { codeId: 'E', codeName: '총괄단' },
  { codeId: 'F', codeName: '총괄단' },
  { codeId: 'G', codeName: '총괄단' },
  { codeId: 'H', codeName: '총괄단' },
  { codeId: 'P', codeName: '총괄단' },
]);

let cachedParams;
const searchParams = ref({
  srchGbn: 1,
  dangOcStrtmm: ['', ''],
  dgr1HgrDgPrtnrNm: '',
  dgr2HgrDgPrtnrNm: '',
  dgr3HgrDgPrtnrNm: '',
  dangOjPrtnrNo: '',

});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const isRegistration = computed(() => (searchParams.value.srchGbn === 1 ? 'date' : 'month'));

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const res = await dataService.get('/sms/wells/contract/risk-audits/irregular-sales-actions/managerial-tasks', { params: cachedParams });

  const { list: arbitrations, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(arbitrations);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickRemove() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  // deleteKeys needs to be updated as per API
  const deleteKeys = deletedRows.map((row) => row.dataRow);

  if (deleteKeys.length) {
    await dataService.delete('/sms/wells/contract/risk-audits/irregular-sales-actions/managerial-tasks', { data: deleteKeys });
    await fetchData();
  }
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!gridUtil.validate(view, {})) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/contract/risk-audits/irregular-sales-actions/managerial-tasks', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  await gridUtil.insertRowAndFocus(view, 0, {});
  view.showEditor();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: 'dataServiceManageList',
    timePostfix: true,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dangOjPrtnrNo' },
    { fieldName: 'dangOcStrtmm' },
    { fieldName: 'dangOjPrtnrOgNm' },
    { fieldName: 'dangOjPrtnrNm' },
    { fieldName: 'dangOjPrtnrPstnDvNm' },
    { fieldName: 'dgr1HgrDgPrtnrNm' },
    { fieldName: 'dgr2HgrDgPrtnrNm' },
    { fieldName: 'bznsSpptPrtnrNo' },
    { fieldName: 'dgr3HgrDgPrtnrNm' },
    { fieldName: 'dangChkNm' },
    { fieldName: 'dangArbitCd' },
    { fieldName: 'dangUncvrCt' },
    { fieldName: 'dangArbitLvyPc' },
    { fieldName: 'dangArbitOgId' },
    { fieldName: 'fstRgstUsrId' },
    { fieldName: 'fstRgstDtm' },

  ];

  const columns = [
    { fieldName: 'dangOjPrtnrNo',
      header: t('MSG_TXT_EMP_NO'),
      width: '180',
      styleName: 'text-center rg-button-icon--search',
      button: 'action',
      rules: 'required',
    },
    { fieldName: 'dangOcStrtmm',
      header: t('MSG_TXT_YEAR_OCCURNCE'),
      width: '165',
      editor: {
        type: 'btdate',
      } },
    { fieldName: 'dangOjPrtnrOgNm', header: t('MSG_TXT_BLG'), width: '129', editable: false },
    { fieldName: 'dangOjPrtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '129', editable: false },
    { fieldName: 'dangOjPrtnrPstnDvNm', header: t('MSG_TXT_CRLV'), width: '129', editable: false },
    { fieldName: 'dgr1HgrDgPrtnrNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '129', editable: false },
    { fieldName: 'dgr2HgrDgPrtnrNm', header: t('MSG_TXT_RGNL_GRP'), width: '129', editable: false },
    { fieldName: 'bznsSpptPrtnrNo', header: 'BM', width: '129', editable: false },
    { fieldName: 'dgr3HgrDgPrtnrNm', header: t('MSG_TXT_BRANCH'), width: '129', editable: false },
    { fieldName: 'dangChkNm', header: t('MSG_TXT_CHRGS'), width: '306', rules: 'required' },
    { fieldName: 'dangArbitCd',
      header: t('MSG_TXT_ACTN_ITM'),
      width: '306',
      options: codes.PNTSC_ARBIT_ATC_CD,
      editor: { type: 'list' },
      rules: 'required',
    },
    { fieldName: 'dangUncvrCt', header: t('MSG_TXT_DUE_TRGT_NO'), width: '129', rules: 'required' },
    { fieldName: 'dangArbitLvyPc',
      header: t('MSG_TXT_ACTN_TM_PNLTY_PNT'),
      width: '190',
      styleName: 'text-center',
      options: [
        { codeId: '5', codeName: '★' },
        { codeId: '10', codeName: '★★' },
        { codeId: '15', codeName: '★★★' },
        { codeId: '20', codeName: '★★★★' },
        { codeId: '25', codeName: '★★★★★' },
        { codeId: '30', codeName: '★★★★★★' },
        { codeId: '35', codeName: '★★★★★★★' },
        { codeId: '40', codeName: '★★★★★★★★' },
        { codeId: '45', codeName: '★★★★★★★★★' },
        { codeId: '50', codeName: '★★★★★★★★★★' },
      ],
      editor: { type: 'list' },
      rules: 'required' },
    { fieldName: 'dangArbitOgId',
      header: t('MSG_TXT_ACTN_DPT'),
      width: '306',
      options: codes.PNTSC_ARBIT_DEPT_CD,
      editor: { type: 'list' },
      rules: 'required',
    },
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR'), width: '146', styleName: 'text-center', editable: false },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FST_RGST_DT'), width: '165', datetimeFormat: 'yyyy-MM', editable: false },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  // multi row header setting
  view.setColumnLayout([
    {
      header: t('MSG_TXT_EMP_NO'),
      direction: 'horizontal',
      items: ['dangOjPrtnrNo', 'dangOcStrtmm', 'dangOjPrtnrOgNm', 'dangOjPrtnrNm', 'dangOjPrtnrPstnDvNm'],
    },
    {
      header: t('MSG_TXT_BLG'),
      direction: 'horizontal',
      items: ['dgr1HgrDgPrtnrNm', 'dgr2HgrDgPrtnrNm', 'bznsSpptPrtnrNo', 'dgr3HgrDgPrtnrNm'],
    },
    {
      header: t('MSG_TXT_PNLTY'),
      direction: 'horizontal',
      items: ['dangChkNm', 'dangArbitCd', 'dangUncvrCt', 'dangArbitLvyPc', 'dangArbitOgId'],
    },
    'fstRgstUsrId', 'fstRgstDtm',

  ]);

  data.setRows([{ dangOjPrtnrNo: '사번입력', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: '', dangOjPrtnrNm: '', dangOjPrtnrPstnDvNm: '', dgr1HgrDgPrtnrNm: '', dgr2HgrDgPrtnrNm: '', bznsSpptPrtnrNo: '', dgr3HgrDgPrtnrNm: '', dangChkNm: '', dangArbitCd: '1-개인정보 도용에 의한 판매계약', dangUncvrCt: '', dangArbitLvyPc: '★★★', dangArbitOgId: '71401-Wells경영지원팀', fstRgstUsrId: '', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },
    { dangOjPrtnrNo: '123456', dangOcStrtmm: '2022-05', dangOjPrtnrOgNm: 'P123456', dangOjPrtnrNm: '김교원', dangOjPrtnrPstnDvNm: '김교원', dgr1HgrDgPrtnrNm: '김총괄', dgr2HgrDgPrtnrNm: '김지역', bznsSpptPrtnrNo: '김BM', dgr3HgrDgPrtnrNm: '김지점', dangChkNm: '부과내역', dangArbitCd: '부과내역', dangUncvrCt: '1', dangArbitLvyPc: '★', dangArbitOgId: '71401-Wells 경영지원팀', fstRgstUsrId: '김직원', fstRgstDtm: '2022-05' },

  ]);
});

</script>
