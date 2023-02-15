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
          <kw-paging-info total-count="7" />
        </template>
        <kw-btn
          dense
          secondary
          :label="t('MSG_BTN_DEL')"
          @click="onClickDelete"
        />
      </kw-action-top>

      <kw-grid
        ref="grdConfirmRef"
        :visible-rows="12"
        @init="initGrid"
      />
      <kw-action-bottom>
        <kw-btn
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
      />
      <kw-btn
        primary
        :label="t('MSG_BTN_CONFIRM')"
        dense
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, gridUtil, getComponentType, useDataService } from 'kw-lib';
import dayjs from 'dayjs';

const dataService = useDataService();

const { t } = useI18n();
const now = dayjs();

const grdConfirmRef = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
onMounted(async () => {
  const view = grdConfirmRef.value.getView();
  const res = await dataService.get('/sms/wells/contract/contracts/approval-request-standards', {
    params: {
      standardDt: now.format('YYYYMMDD'),
    },
  });
  view.getDataSource().setRows(res.data);
});
async function onClickDelete() {
  const view = grdConfirmRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length > 0) {
    await dataService.delete('sms/wells/contract/cnfm-apr-bases', deletedRows);
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
