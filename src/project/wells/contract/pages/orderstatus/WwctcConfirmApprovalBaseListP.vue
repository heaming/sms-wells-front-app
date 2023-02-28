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
    class="kw-popup--2xl"
  >
    <div>
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
        </template>
        />
      </kw-action-top>

      <kw-grid
        ref="grdConfirmRef"
        :visible-rows="12"
        @init="initGrid"
      />
      <kw-action-bottom>
        <kw-btn
          v-permission:delete
          :label="t('MSG_BTN_DEL')"
          grid-action
          @click="onClickDelete"
        />
      </kw-action-bottom>
    </div>
    <kw-separator
      vertical
      inset
      spaced
    />
    <template #action>
      <kw-btn
        negative
        :label="t('MSG_BTN_CANCEL')"
        dense
        @click="onClickCancel"
      />
      <kw-btn
        primary
        :label="t('MSG_BTN_CONFIRM')"
        dense
        @click="onClickCancel"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, gridUtil, getComponentType, useDataService, useModal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();

const { cancel: onClickCancel } = useModal();
const grdConfirmRef = ref(getComponentType('KwGrid'));

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

async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);

  const view = grdConfirmRef.value.getView();
  const res = await dataService.get('/sms/wells/contract/contracts/approval-request-standards', { params: cachedParams });

  totalCount.value = res.data.length;
  view.getDataSource().setRows(res.data);
}

onMounted(async () => {
  fetchData();
});

async function onClickDelete() {
  const view = grdConfirmRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length > 0) {
    await dataService.delete('sms/wells/contract/contracts/approval-request-standards', { data: deletedRows });
    fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
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
    { fieldName: 'cntrAprAkDvCdNm', header: t('MSG_TXT_APR_REQ_CAT'), width: '142', styleName: 'text-center' },
    { fieldName: 'cntrAprAkMsgCn', header: t('MSG_TXT_REQ_MSG'), width: '477' },
    { fieldName: 'cntrAprCanMsgCn', header: t('MSG_TXT_REQ_CAN_MSG'), width: '477' },
    { fieldName: 'cntrAprConfMsgCn', header: t('MSG_TXT_APR_CNFM_MSG'), width: '477' },
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_STRT_DT'), width: '142', datetimeFormat: 'date', styleName: 'text-center' },
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_END_DT'), width: '142', datetimeFormat: 'date', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});
</script>
