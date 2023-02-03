<!----
    ****************************************************************************************************
    * 프로그램 개요
    ****************************************************************************************************
    1. 모듈 : CTC
    2. 프로그램 ID : WwctcEntrepreneurJoinLimitOjMgtM - 사업자가입제한관리 관리
    3. 작성자 : gs.ritvik.m
    4. 작성일 : 2023.01.26
    ****************************************************************************************************
    * 프로그램 설명
    ****************************************************************************************************
    - 사업자가입제한관리 화면
    ****************************************************************************************************
    --->
<template>
  <kw-page>
    <kw-tabs
      model-value="3"
    >
      <kw-tab
        name="1"
        label="확정승인기준관리"
      />
      <kw-tab
        name="2"
        label="예외처리관리"
      />
      <kw-tab
        name="3"
        label="사업자가입제한관리"
      />
      <kw-tab
        name="4"
        label="사용자판매제한관리"
      />
      <kw-tab
        name="5"
        label="블랙리스트관리"
      />
    </kw-tabs>
    <kw-tab-panels
      model-value="3"
    >
      <kw-tab-panel name="3">
        <kw-search
          modified-targets="[ 'grdMain' ]"
          @search="onClickSearch"
        >
          <kw-search-row>
            <kw-search-item :label="$t('MSG_TXT_OCCUR_DATE')">
              <kw-date-range-picker
                v-model:from="searchParams.sellLmOcDtm.from"
                v-model:to="searchParams.sellLmOcDtm.to"
                rules="date_range_months:1"
              />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_ENTRP_NO')">
              <kw-input
                v-model="searchParams.sellLmBzrno"
              />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_BSN_NM')">
              <kw-input
                v-model="searchParams.dlpnrNm"
              />
            </kw-search-item>
          </kw-search-row>
        </kw-search>
        <div class="result-area">
          <kw-action-top>
            <template #left>
              <kw-paging-info :total-count="pageInfo.totalCount" />
            </template>
            <kw-btn
              v-permission:delete
              grid-action
              :label="$t('MSG_BTN_DEL')"
              @click="onClickDelete"
            />
            <kw-separator
              spaced
              vertical
              inset
            />
            <kw-btn
              v-permission:create
              grid-action
              :label="$t('MSG_BTN_ROW_ADD')"
              @click="onClickAdd"
            />
            <kw-btn
              v-permission:update
              grid-action
              :label="$t('MSG_BTN_SAVE')"
              @click="onClickSave"
            />
            <kw-separator
              spaced
              vertical
              inset
            />
            <kw-btn
              icon="download_on"
              secondary
              dense
              :label="$t('MSG_BTN_FILE_UPLOAD_FORM')"
            />
            <kw-btn
              v-permission:create
              icon="upload_on"
              secondary
              dense
              :label="$t('MSG_BTN_FILE_UPLOAD')"
            />
            <kw-btn
              icon="download_on"
              dense
              secondary
              :label="$t('MSG_BTN_EXCEL_DOWN')"
              :disable="(pageInfo.totalCount === 0)"
              @click="onClickExcelDownload"
            />
          </kw-action-top>

          <kw-grid
            ref="grdMainRef"
            name="grdMain"
            :visible-rows="10"
            @init="initGrdMain"
          />
          <kw-action-bottom>
            <kw-btn
              :label="$t('MSG_BTN_DEL')"
              grid-action
              dense
              @click="onClickDelete"
            />
          </kw-action-bottom>
        </div>
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, gridUtil, defineGrid, codeUtil, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { notify } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'SELL_LM_RSON_CD',
);

const pageInfo = ref({
  totalCount: 0,
});

const searchParams = ref({
  sellLmOcDtm: {
    from: '',
    to: '',
  },
  sellLmBzrno: '',
  dlpnrNm: '',
});

let cachedParams;

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  await gridUtil.insertRowAndFocus(view, 0, {});
  pageInfo.value.totalCount = view.getItemCount();
}

async function fetchData() {
  // Fetch API
  // const res = await dataService.get('sms/wells/contract/entrp-j-lm-oj-mngts/paging');
  const res = [
    { sellLmRlsDtm1: '3-등록', sellLmBzrno: ' ', dlpnrNm: ' ', dlgpsNm: ' ', bryyMmdd: '20220503', sellLmRsonCd: '01-대손처리자', sellLmOcDtm: '20220503', sellLmRlsDtm: '20220503', sellLmRsonCn: '', fnlMdfcUsrId: '', fnlMdfcUsrId1: '' },
    { sellLmRlsDtm1: '3-등록', sellLmBzrno: '123456789', dlpnrNm: '상호명', dlgpsNm: '김대표', bryyMmdd: '20220520', sellLmRsonCd: '02-대손 처리 예정', sellLmOcDtm: '20220520', sellLmRlsDtm: '20220520', sellLmRsonCn: '발생사유 1', fnlMdfcUsrId: '김직원', fnlMdfcUsrId1: '김직원' },
    { sellLmRlsDtm1: '3-등록', sellLmBzrno: '123456789', dlpnrNm: '상호명', dlgpsNm: '김대표', bryyMmdd: '20220520', sellLmRsonCd: '02-대손 처리 예정', sellLmOcDtm: '20220520', sellLmRlsDtm: '20220520', sellLmRsonCn: '발생사유 1', fnlMdfcUsrId: '김직원', fnlMdfcUsrId1: '김직원' },
    { sellLmRlsDtm1: '3-등록', sellLmBzrno: '123456789', dlpnrNm: '상호명', dlgpsNm: '김대표', bryyMmdd: '20220520', sellLmRsonCd: '02-대손 처리 예정', sellLmOcDtm: '20220520', sellLmRlsDtm: '20220520', sellLmRsonCn: '발생사유 1', fnlMdfcUsrId: '김직원', fnlMdfcUsrId1: '김직원' },
    { sellLmRlsDtm1: '3-등록', sellLmBzrno: '123456789', dlpnrNm: '상호명', dlgpsNm: '김대표', bryyMmdd: '20220520', sellLmRsonCd: '02-대손 처리 예정', sellLmOcDtm: '20220520', sellLmRlsDtm: '20220520', sellLmRsonCn: '발생사유 1', fnlMdfcUsrId: '김직원', fnlMdfcUsrId1: '김직원' },
    { sellLmRlsDtm1: '3-등록', sellLmBzrno: '123456789', dlpnrNm: '상호명', dlgpsNm: '김대표', bryyMmdd: '20220520', sellLmRsonCd: '02-대손 처리 예정', sellLmOcDtm: '20220520', sellLmRlsDtm: '20220520', sellLmRsonCn: '발생사유 1', fnlMdfcUsrId: '김직원', fnlMdfcUsrId1: '김직원' },
    { sellLmRlsDtm1: '3-등록', sellLmBzrno: '123456789', dlpnrNm: '상호명', dlgpsNm: '김대표', bryyMmdd: '20220520', sellLmRsonCd: '02-대손 처리 예정', sellLmOcDtm: '20220520', sellLmRlsDtm: '20220520', sellLmRsonCn: '발생사유 1', fnlMdfcUsrId: '김직원', fnlMdfcUsrId1: '김직원' },
    { sellLmRlsDtm1: '3-등록', sellLmBzrno: '123456789', dlpnrNm: '상호명', dlgpsNm: '김대표', bryyMmdd: '20220520', sellLmRsonCd: '02-대손 처리 예정', sellLmOcDtm: '20220520', sellLmRlsDtm: '20220520', sellLmRsonCn: '발생사유 1', fnlMdfcUsrId: '김직원', fnlMdfcUsrId1: '김직원' },
    { sellLmRlsDtm1: '3-등록', sellLmBzrno: '123456789', dlpnrNm: '상호명', dlgpsNm: '김대표', bryyMmdd: '20220520', sellLmRsonCd: '02-대손 처리 예정', sellLmOcDtm: '20220520', sellLmRlsDtm: '20220520', sellLmRsonCn: '발생사유 1', fnlMdfcUsrId: '김직원', fnlMdfcUsrId1: '김직원' },
    { sellLmRlsDtm1: '3-등록', sellLmBzrno: '123456789', dlpnrNm: '상호명', dlgpsNm: '김대표', bryyMmdd: '20220520', sellLmRsonCd: '02-대손 처리 예정', sellLmOcDtm: '20220520', sellLmRlsDtm: '20220520', sellLmRsonCn: '발생사유 1', fnlMdfcUsrId: '김직원', fnlMdfcUsrId1: '김직원' },
    { sellLmRlsDtm1: '3-등록', sellLmBzrno: '123456789', dlpnrNm: '상호명', dlgpsNm: '김대표', bryyMmdd: '20220520', sellLmRsonCd: '02-대손 처리 예정', sellLmOcDtm: '20220520', sellLmRlsDtm: '20220520', sellLmRsonCn: '발생사유 1', fnlMdfcUsrId: '김직원', fnlMdfcUsrId1: '김직원' },
    { sellLmRlsDtm1: '3-등록', sellLmBzrno: '123456789', dlpnrNm: '상호명', dlgpsNm: '김대표', bryyMmdd: '20220520', sellLmRsonCd: '02-대손 처리 예정', sellLmOcDtm: '20220520', sellLmRlsDtm: '20220520', sellLmRsonCn: '발생사유 1', fnlMdfcUsrId: '김직원', fnlMdfcUsrId1: '김직원' },
  ];
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res);
  pageInfo.value.totalCount = view.getItemCount();
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  const deleteKeys = deletedRows.map((row) => row.dataRow);
  if (deleteKeys.length) {
    await dataService.delete('sms/wells/contract/entrp-j-lm-oj-mngts', { data: deleteKeys });
    await fetchData();
  }
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('sms/wells/contract/entrp-j-lm-oj-mngts/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: 'EntrepreneurJoinLimitOjMgmt',
    timePostfix: true,
    exportData: response.data,
  });
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post(
    'sms/wells/contract/entrp-j-lm-oj-mngts',
    changedRows,
  );
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  await fetchData();
}

onMounted(async () => {
  await fetchData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sellLmRlsDtm1' },
    { fieldName: 'sellLmBzrno' },
    { fieldName: 'dlpnrNm' },
    { fieldName: 'dlgpsNm' },
    { fieldName: 'bryyMmdd' },
    { fieldName: 'sellLmRsonCd' },
    { fieldName: 'sellLmOcDtm' },
    { fieldName: 'sellLmRlsDtm' },
    { fieldName: 'sellLmRsonCn' },
    { fieldName: 'fnlMdfcUsrId' },
    { fieldName: 'fnlMdfcUsrId1' },
  ];

  const columns = [
    { fieldName: 'sellLmRlsDtm1', header: t('MSG_TXT_INF_CLS'), width: '142', editable: true, editor: { type: 'list' }, options: [{ codeId: '3', codeName: '3-register' }, { codeId: '4', codeName: '4-restrict' }] },
    { fieldName: 'sellLmBzrno', header: t('MSG_TXT_ENTRP_NO'), width: '127', styleName: 'text-center', editable: true },
    { fieldName: 'dlpnrNm', header: t('MSG_TXT_BSN_NM'), width: '127', styleName: 'text-center', editable: false },
    { fieldName: 'dlgpsNm', header: t('MSG_TXT_RPRS_NM'), width: '127', styleName: 'text-center', editable: false },
    { fieldName: 'bryyMmdd', header: t('MSG_TXT_BIRTH_DATE'), width: '196', styleName: 'text-center', datetimeFormat: 'date', editable: false, editor: { type: 'btdate' } },
    { fieldName: 'sellLmRsonCd', header: t('MSG_TXT_DFT_CD'), width: '211', editable: true, editor: { type: 'list' }, options: codes.SELL_LM_RSON_CD },
    { fieldName: 'sellLmOcDtm', header: t('MSG_TXT_OCCUR_DATE'), width: '196', styleName: 'text-center', datetimeFormat: 'date', editable: true, editor: { type: 'btdate' } },
    { fieldName: 'sellLmRlsDtm', header: t('MSG_TXT_CNC_DT'), width: '196', styleName: 'text-center', datetimeFormat: 'date', editable: true, editor: { type: 'btdate' } },
    { fieldName: 'sellLmRsonCn', header: t('MSG_TXT_OCC_RSN'), width: '376', editable: true },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_RGST_ICHR'), width: '180', styleName: 'text-center', editable: false },
    { fieldName: 'fnlMdfcUsrId1', header: t('MSG_TXT_CNC_INCHR'), width: '180', styleName: 'text-center', editable: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.editOptions.editable = true;
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});

</script>
