<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTC
2. 프로그램 ID : WwctcConfirmApprovalBaseMgtM -확정 승인 기준 관리
3. 작성자 : gs.anil.rawat / Myoungbin Joo
4. 작성일 : 2023.01.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 확정 승인 기준 관리
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-observer
      ref="obsTabRef"
      name="obsTab"
    >
      <kw-search
        ref="searchMainRef"
        :modified-targets="['approvalBaseGrid']"
        @search="onClickSearch"
      >
        <kw-search-row>
          <kw-search-item
            :label="t('MSG_TXT_BASE_DT')"
            required
          >
            <kw-date-picker
              v-model="searchParams.standardDt"
              rules="required"
              :name="t('MSG_TXT_BASE_DT')"
              @change="fetchAprCodes"
            />
          </kw-search-item>
          <kw-search-item
            :label="t('MSG_TXT_APR_REQ_CAT')"
            required
          >
            <kw-select
              v-model="searchParams.cntrAprAkDvCd"
              rules="required"
              :name="t('MSG_TXT_APR_REQ_CAT')"
              :options="aprAkDvcodeOptions"
              :placeholder="$t('MSG_TXT_BEFORE_SELECT_IT',[$t('MSG_TXT_APR_REQ_CAT')])"
            />
          </kw-search-item>
          <kw-search-item :label="t('MSG_TXT_BASE_DT_DV')">
            <kw-field>
              <!--
              <kw-checkbox
                v-model="searchParams.aprReqCtgValid"
                :label="t('MSG_TXT_BASE_DT_IN')"
                :true-value="true"
                :false-value="false"
              />
              -->
              <kw-option-group
                v-model="searchParams.aprReqCtgValid"
                type="checkbox"
                :label="t('MSG_TXT_BASE_DT_IN')"
                :options="aprReqCtCode"
              />
            </kw-field>
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
              @change="onClickSearch"
            />
          </template>
          <kw-btn
            v-permission:delete
            grid-action
            dense
            :label="t('MSG_BTN_DEL')"
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
            grid-action
            :label="t('MSG_BTN_ROW_ADD')"
            @click="onClickAdd"
          />

          <kw-btn
            v-permission:create
            grid-action
            dense
            :label="t('MSG_BTN_SAVE')"
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
            :label="t('MSG_BTN_EXCEL_DOWN')"
            @click="onClickExcelDownload"
          />
          <kw-separator
            spaced
            vertical
            inset
          />
          <kw-btn
            v-permission:read
            primary
            dense
            :label="t('MSG_BTN_CNFM_CRTR_MGT')"
            @click="onClickConfirmCriteriaMangement"
          />
        </kw-action-top>

        <kw-grid
          ref="grdMainRef"
          name="approvalBaseGrid"
          :page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          @init="initGrid"
        />
        <kw-pagination
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          @change="fetchData"
        />
      </div>
    </kw-observer>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { gridUtil, getComponentType, useGlobal, useMeta, useDataService, codeUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { alert } = useGlobal();
const now = dayjs();
const dataService = useDataService();
const { t } = useI18n();
const { notify, modal } = useGlobal();
const { currentRoute } = useRouter();

const searchMainRef = ref(getComponentType('KwSearch'));
const grdMainRef = ref(getComponentType('KwGrid'));
const { getConfig } = useMeta();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const searchParams = ref({
  standardDt: now.format('YYYYMMDD'),
  cntrAprAkDvCd: '',
  aprReqCtgValid: false,
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'CNTR_APR_SELL_DV_CD',
  'CNTR_APR_ICHR_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

const cntrYnCodes = ref([
  { codeId: 'Y', codeName: 'Y' },
  { codeId: 'N', codeName: 'N' },
]);

const aprReqCtCode = ref([
  { codeId: true, codeName: t('MSG_TXT_BASE_DT_IN') },
]);

const aprAkDvcodeOptions = ref([]);

let cachedParams;

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  if (!await searchMainRef.value.validate()) {
    pageInfo.value.totalCount = 0;
    return;
  }

  const res = await dataService.get('/sms/wells/contract/contracts/approval-standards/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;

  // const pages = res.data.list;
  // totalCount.value = res.data.pageInfo.totalCount;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.setRows(pages);
  dataSource.checkRowStates(true);

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function fetchAprCodes() {
  cachedParams = cloneDeep(searchParams.value);

  const res = await dataService.get('/sms/wells/contract/contracts/approval-request-standards', { params: cachedParams });

  res.data.forEach((v) => {
    if ((!isEmpty(v)) && (!isEmpty(v.cntrAprAkDvCd))) {
      aprAkDvcodeOptions.value.push({ codeId: v.cntrAprAkDvCd, codeName: v.cntrAprAkDvCdNm });
    }
  });
}

async function onClickSearch() {
  grdMainRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const changedRows = gridUtil.getChangedRowValues(view);
  const checkVaild = ref(true);

  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  if (isEmpty(changedRows)) {
    notify(t('MSG_ALT_NO_CHG_CNTN'));
    return;
  }

  changedRows.forEach((v) => {
    if (v.cntrAprIchrDvCd === '1') {
      const cntrAprIchrDvCdOptions = ref([
        codes.CNTR_APR_ICHR_DV_CD.filter((val) => v.cntrAprIchrDvCd === val.codeId)[0].codeName,
      ]);
      if (isEmpty(v.ichrUsrId)) {
        alert(t('MSG_ALT_REQ_INPUT_SEL_VAL', [cntrAprIchrDvCdOptions.value[0], t('MSG_TXT_CNT_PER')]));
        checkVaild.value = false;
        return checkVaild.value;
      }
    }
    v.cntrAprAkDvCdNm = aprAkDvcodeOptions.value.filter((val) => v.cntrAprAkDvCd === val.codeId)[0].codeName;
  });

  if (!checkVaild.value) {
    return;
  }

  await dataService.post('/sms/wells/contract/contracts/approval-standards', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

async function onClickConfirmCriteriaMangement() {
  const { result, payload } = await modal({
    component: 'WwctcConfirmApprovalBaseListP',
    componentProps: { standardDt: searchParams.value.standardDt },
  });

  if (result) {
    searchParams.value.standardDt = payload.standardDt;
    searchParams.value.cntrAprAkDvCd = payload.cntrAprAkDvCd;
    onClickSearch();
  }
  aprAkDvcodeOptions.value = [];
  await fetchAprCodes();

  console.log(aprAkDvcodeOptions);
  const view = grdMainRef.value.getView();
  view.setColumn({
    name: 'cntrAprAkDvCd',
    width: '142',
    styleName: 'text-center',
    editor: { type: 'list' },
    rules: 'required',
    options: aprAkDvcodeOptions.value,
    optionValue: 'codeId',
    optionLabel: 'codeName',
  });
}

async function onClickRemove() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  // deleteKeys needs to be updated as per API
  const deleteKeys = deletedRows.map((row) => row);

  if (deleteKeys.length > 0) {
    await dataService.delete('/sms/wells/contract/contracts/approval-standards', { data: deleteKeys });
    await onClickSearch();
  }
}

function onClickAdd() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {
    cntrAprAkDvCd: searchParams.value.cntrAprAkDvCd,
  });

  view.showEditor();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/contract/contracts/approval-standards/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

await fetchAprCodes();
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'cntrAprAkDvCd' },
    { fieldName: 'cntrAprSellDvCd' },
    { fieldName: 'cntrAprChnlDvVal' },
    { fieldName: 'cntrAprIchrDvCd' },
    { fieldName: 'ichrUsrId' },
    { fieldName: 'psicNm' },
    { fieldName: 'vlStrtDtm' },
    { fieldName: 'vlEndDtm' },
    { fieldName: 'notyFwOjYn' },
    { fieldName: 'cntrAprBaseId' },
  ];

  const columns = [
    { fieldName: 'cntrAprAkDvCd', header: t('MSG_TXT_APR_REQ_CAT'), width: '142', styleName: 'text-center', editor: { type: 'list' }, options: aprAkDvcodeOptions.value, rules: 'required' },
    { fieldName: 'cntrAprSellDvCd', header: t('MSG_TXT_SLS_CAT'), width: '142', styleName: 'text-center', editor: { type: 'list' }, options: codes.CNTR_APR_SELL_DV_CD },
    { fieldName: 'cntrAprChnlDvVal', header: t('MSG_TXT_RSPBL_CHNL'), width: '180', styleName: 'text-center', editor: { type: 'text', maxLength: 10 } },
    { fieldName: 'cntrAprIchrDvCd', header: t('MSG_TXT_ICHR_DV'), width: '142', styleName: 'text-center', editor: { type: 'list' }, options: codes.CNTR_APR_ICHR_DV_CD },
    { fieldName: 'ichrUsrId', header: t('MSG_TXT_CNT_PER'), width: '180', styleName: 'text-center rg-button-icon--search', button: 'action', editor: { type: 'number', maxLength: 10 } },
    { fieldName: 'psicNm', header: t('MSG_TXT_PIC_NM'), width: '180', editor: { type: 'text' }, styleName: 'text-center', editable: false },
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_STRT_DT'), width: '196', styleName: 'text-center', datetimeFormat: 'date', editor: { type: 'btdate' }, rules: 'required' },
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_END_DT'), width: '196', styleName: 'text-center', datetimeFormat: 'date', editor: { type: 'btdate' }, rules: 'required' },
    { fieldName: 'notyFwOjYn', header: t('MSG_TXT_K_WORKS_MAIL_TAR'), width: '142', styleName: 'text-center', editor: { type: 'list' }, options: cntrYnCodes.value, rules: 'required' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEdited = async (grid, itemIndex, row, fieldIndex) => {
    const { fieldName } = grid.getColumn(fieldIndex);
    const vlEndDtm = grid.getValue(itemIndex, 'vlEndDtm');
    const vlStrtDtm = grid.getValue(itemIndex, 'vlStrtDtm');
    if (fieldName === 'cntrAprAkDvCd') {
      const searchCntrAprAkDvCd = searchParams.value.cntrAprAkDvCd;
      const cntrAprAkDvCd = grid.getValue(itemIndex, fieldIndex);
      if (!isEmpty(searchCntrAprAkDvCd)) {
        if (searchCntrAprAkDvCd !== cntrAprAkDvCd) {
          grid.setValue(itemIndex, 'cntrAprAkDvCd', searchCntrAprAkDvCd);
        }
      }
    } else if (fieldName === 'vlEndDtm') {
      if (!isEmpty(vlEndDtm)) {
        if (vlEndDtm.length === 0) {
          grid.setValue(itemIndex, 'vlEndDtm', null);
        } else if (vlStrtDtm > vlEndDtm) {
          grid.setValue(itemIndex, 'vlStrtDtm', vlEndDtm);
        }
      }
    } else if (fieldName === 'vlStrtDtm') {
      if (!isEmpty(vlStrtDtm)) {
        if (vlEndDtm < vlStrtDtm) {
          grid.setValue(itemIndex, 'vlEndDtm', vlStrtDtm);
        }
      }
    }
  };

  view.onCellButtonClicked = async (g, { column, itemIndex }) => {
    if (column === 'ichrUsrId') {
      const ichrUsrId = g.getValue(itemIndex, 'ichrUsrId');
      const { result, payload } = await modal({
        component: 'ZwcmzSingleSelectUserListP',
        componentProps: {
          searchEmplCond: '3',
          searchCodEmplText: ichrUsrId,
        },
      });
      if (result) {
        g.setValue(itemIndex, 'ichrUsrId', payload.employeeIDNumber);
        g.setValue(itemIndex, 'psicNm', payload.userName);
      }
    }
  };
}
</script>
