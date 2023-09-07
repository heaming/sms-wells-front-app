<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaContractRejectReasonModP - wells 주문삭제 요청 반려 사유 등록(팝업)
3. 작성자 : JSY
4. 작성일 : 2023.04.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U-0097P01] - wells 주문삭제 요청 반려 사유 등록(팝업)
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="kwPopRef"
    size="lg"
  >
    <kw-form
      :cols="1"
    >
      <kw-form-row>
        <kw-form-item no-label>
          <kw-input
            v-model="searchParams.rjRsonCn"
            type="textarea"
            :label="$t('MSG_TIT_RET_RSON')"
            :rows="10"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
        @click="cancel"
      />
      <kw-btn
        v-permission:update
        primary
        :label="$t('MSG_BTN_CONFIRM')"
        @click="fetchDataContractLists"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useModal, notify } from 'kw-lib';

const dataService = useDataService();

const props = defineProps({
  cntrAprId: { type: String, required: true, default: '' },
  cntrNo: { type: String, required: true, default: '' },
  cntrSn: { type: String, required: true, default: '' },
  sellPrtnrNo: { type: String, required: true, default: '' },
});

const kwPopRef = ref();
const searchParams = ref({
  cntrAprId: props.cntrAprId,
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
  sellPrtnrNo: props.sellPrtnrNo,
  rjRsonCn: '',
});

const { t } = useI18n();

const { cancel, ok } = useModal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchDataContractLists() {
  // changing api & cacheparams according to search classification
  if (kwPopRef.value.alertIfIsNotModified()) { return; }

  await dataService.post('/sms/wells/contract/contracts/reject-reasons', searchParams.value);
  ok(true);
  notify(t('MSG_ALT_SAVE_DATA'));
}
// onMounted(() => {
// });
</script>
<style scoped>
</style>
