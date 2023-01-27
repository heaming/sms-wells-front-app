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
        ref="cnfmGrdLst"
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
        :label="t('MSG_BTN_CFRM')"
        dense
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { gridUtil, getComponentType } from 'kw-lib';

const { t } = useI18n();

const cnfmGrdLst = ref(getComponentType('KwGrid'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function onClickDelete() {
  const view = cnfmGrdLst.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length > 0) {
    // TODO integrate delete api
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_APR_REQ_CAT'), width: '142', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_REQ_MSG'), width: '477' },
    { fieldName: 'col3', header: t('MSG_TXT_REQ_CAN_MSG'), width: '477' },
    { fieldName: 'col4', header: t('MSG_TXT_APR_CNFM_MSG'), width: '477' },
    { fieldName: 'col5', header: t('MSG_TXT_STRT_DT'), width: '142', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_END_DT'), width: '142', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  // TODO integrate Get api
  data.setRows([
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },
    { col1: '9-직원구매', col2: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col3: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col4: '%s 플래너로부터 %s에 대한 승인 요청이 접수되었습니다.\n주문번호:%s', col5: '2022-02-20', col6: '2022-02-20' },

  ]);
}
</script>
