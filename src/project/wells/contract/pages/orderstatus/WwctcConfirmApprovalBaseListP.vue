<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTC
2. 프로그램 ID : WwctcConfirmApprovalBaseListP - 확정 승인 기준 리스트
3. 작성자 : gs.anil.rawat
4. 작성일 : 2023.01.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 확정 승인 기준 리스트
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <kw-search
      :cols="2"
      one-row
      :modified-targets="['approvalBaseGrid']"
      @search="fetchData"
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
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="totalCount" />
      </template>
      <!-- 삭제 -->
      <kw-btn
        v-if="isEqual(checkUser, 'I')"
        v-permission:delete
        dense
        grid-action
        :label="t('MSG_BTN_DEL')"
        @click="onClickDelete"
      />
      <!-- 저장 -->
      <kw-btn
        v-if="isNotPlanner"
        v-permission:update
        grid-action
        :label="$t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
      <!-- 추가 -->
      <kw-btn
        v-if="isEqual(checkUser, 'I')"
        v-permission:create
        grid-action
        :label="$t('MSG_BTN_ROW_ADD')"
        @click="onClickAdd"
      />
    </kw-action-top>
    <kw-grid
      ref="grdConfirmRef"
      :visible-rows="7"
      @init="initGrid"
    />
    <kw-separator
      vertical
      inset
      spaced
    />
    <template #action>
      <kw-btn
        primary
        :label="t('MSG_BTN_CLOSE')"
        @click="onClickCancel"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta, useModal } from 'kw-lib';
import { cloneDeep, isEmpty, isEqual } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { notify } = useGlobal();

const { ok, cancel: onClickCancel } = useModal();
const grdConfirmRef = ref(getComponentType('KwGrid'));

const { getUserInfo, hasRoleNickName } = useMeta();
const { baseRleCd } = getUserInfo();

const checkUser = computed(() => { // 유저 권한 여부 확인 computed
  if (isEmpty(baseRleCd)) { return ''; }

  if (hasRoleNickName('SYS_ADMIN')) { return 'I'; } // IT 담당자

  if (baseRleCd.startsWith('W1')) { return 'W'; } // 현업(본사)

  if (baseRleCd.startsWith('W2') || baseRleCd.startsWith('W3')) {
    if (isEqual(baseRleCd.substr(2, 4), '010')) { return 'P'; } // 플래너
    return 'W'; // 현업
  }

  return '';
});

const isNotPlanner = computed(() => { // 플래너 제외 computed
  const rtn = isEqual(checkUser.value, 'W') || isEqual(checkUser.value, 'I');
  return rtn;
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const props = defineProps({
  standardDt: {
    type: String,
    default: null,
  },
});

const searchParams = ref({
  standardDt: props.standardDt,
});

const totalCount = ref(0);
let cachedParams;

// fetchData: 조회
async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);
  grdConfirmRef.value.getData().clearRows();

  const view = grdConfirmRef.value.getView();
  const res = await dataService.get('/sms/wells/contract/contracts/approval-request-standards', { params: cachedParams });

  totalCount.value = res.data.length;
  view.getDataSource().setRows(res.data);
}

// onClickDelete: 삭제
async function onClickDelete() {
  const view = grdConfirmRef.value.getView();

  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length > 0) {
    await notify(t('MSG_ALT_DELETED'));
    await dataService.delete('/sms/wells/contract/contracts/approval-request-standards', { data: deletedRows });
    fetchData();
  }
}

// onClickSave: 저장
async function onClickSave() {
  const view = grdConfirmRef.value.getView();
  const changedRows = gridUtil.getChangedRowValues(view);

  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  await dataService.post('/sms/wells/contract/contracts/approval-request-standards', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

// onClickAdd: 행추가
async function onClickAdd() {
  const view = grdConfirmRef.value.getView();
  await gridUtil.insertRowAndFocus(view, 0, {});
}

// isEditable: 승인요청구분 수정 StyleCallback
function isEditable(grid, dataCell) {
  const ret = {};
  const state = grid.getDataSource().getRowState(dataCell.index.itemIndex);
  let isInserted = false;

  ret.renderer = { type: 'button' };

  if (isEqual(state, 'created') && isNotPlanner.value) {
    ret.renderer = { type: 'text' };
    isInserted = true;
  }

  ret.editable = isInserted;
  return ret;
}

// onMounted: 화면 실행 시 발생하는 이벤트
onMounted(async () => {
  await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
// const initGrid = defineGrid(async (data, view) => {
//   const fields = [
//     { fieldName: 'cntrAprAkDvCdNm' },
//     { fieldName: 'cntrAprAkMsgCn' },
//     { fieldName: 'cntrAprCanMsgCn' },
//     { fieldName: 'cntrAprConfMsgCn' },
//     { fieldName: 'vlStrtDtm' },
//     { fieldName: 'vlEndDtm' },
//     { fieldName: 'cntrAprAkDvCd' },
//     { fieldName: 'cntrAprAkDvNm' },
//     { fieldName: 'cntrAprAkDvPk' },
//     { fieldName: 'vlStrtDtmPk' },
//   ];

//   const columns = [
//     { fieldName: 'cntrAprAkDvCdNm',
//       header: t('MSG_TXT_APR_REQ_CAT'),
//       width: '180',
//       styleName: 'rg-button-link text-center',
//       renderer: { type: 'button' }
//     },
//     { fieldName: 'cntrAprAkMsgCn', header: t('MSG_TXT_REQ_MSG'), width: '477' },
//     { fieldName: 'cntrAprCanMsgCn', header: t('MSG_TXT_REQ_CAN_MSG'), width: '477' },
//     { fieldName: 'cntrAprConfMsgCn', header: t('MSG_TXT_APR_CNFM_MSG'), width: '477' },
//     { fieldName: 'vlStrtDtm',
//       header: t('MSG_TXT_STRT_DT'),
//       width: '180',
//       datetimeFormat: 'date',
//       styleName: 'text-center'
//     },
//     { fieldName: 'vlEndDtm',
//       header: t('MSG_TXT_END_DT'),
//       width: '180',
//       datetimeFormat: 'date',
//       styleName: 'text-center'
//     },
//   ];

//   data.setFields(fields);
//   view.setColumns(columns);
//   view.checkBar.visible = true; // create checkbox column
//   view.rowIndicator.visible = true; // create number indicator column

//   view.onCellItemClicked = async (g, { column, itemIndex }) => {
//     if (column === 'cntrAprAkDvCdNm') {
//       const row = g.getValue(itemIndex, 'cntrAprAkDvCd');
//       const payload = {
//         cntrAprAkDvCd: row,
//         standardDt: searchParams.value.standardDt,
//       };
//       ok(payload);
//     }
//   };
// });

const initGrid = defineGrid(async (data, view) => {
  const fields = [
    { fieldName: 'cntrAprAkDvCdNm' },
    { fieldName: 'cntrAprAkMsgCn' },
    { fieldName: 'cntrAprCanMsgCn' },
    { fieldName: 'cntrAprConfMsgCn' },
    { fieldName: 'vlStrtDtm' },
    { fieldName: 'vlEndDtm' },
    { fieldName: 'cntrAprAkDvCd' },
    { fieldName: 'cntrAprAkDvNm' },
    { fieldName: 'cntrAprAkDvPk' },
    { fieldName: 'vlStrtDtmPk' },
  ];

  const columns = [
    { fieldName: 'cntrAprAkDvCdNm',
      header: t('MSG_TXT_APR_REQ_CAT'),
      width: '180',
      styleName: 'rg-button-link text-center',
      // renderer: { type: 'button' },
      rules: 'required',
      // editable: false,
      styleCallback(grid, dataCell) { return isEditable(grid, dataCell); },
      editor: { maxLength: 50 },
    },
    { fieldName: 'cntrAprAkMsgCn', header: t('MSG_TXT_REQ_MSG'), width: '477', editor: { maxLength: 500 } },
    { fieldName: 'cntrAprCanMsgCn', header: t('MSG_TXT_REQ_CAN_MSG'), width: '477', editor: { maxLength: 500 } },
    { fieldName: 'cntrAprConfMsgCn', header: t('MSG_TXT_APR_CNFM_MSG'), width: '477', editor: { maxLength: 500 } },
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_STRT_DT'), width: '180', datetimeFormat: 'date', styleName: 'text-center', rules: 'required', editor: { type: 'btdate', datetimeFormat: 'date' } },
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_END_DT'), width: '180', datetimeFormat: 'date', styleName: 'text-center', rules: 'required', editor: { type: 'btdate', datetimeFormat: 'date' } },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = isNotPlanner.value; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  view.editOptions.editable = isNotPlanner.value;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'cntrAprAkDvCdNm') {
      const row = g.getValue(itemIndex, 'cntrAprAkDvCd');
      const payload = {
        cntrAprAkDvCd: row,
        standardDt: searchParams.value.standardDt,
      };
      ok(payload);
    }
  };
});
</script>
