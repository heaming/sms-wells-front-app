<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC (배정관리)
2. 프로그램 ID : WwsncOutsourcingpdAsReceiptBiztalkP - 외주상품 A/S 접수처 알림톡 발송
3. 작성자 : yeonghwa.cheon
4. 작성일 : 2023.05.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 제품 AS할 수 있는 외주 업체의 정보를 알림톡으로 발송하는 화면이다.
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
  >
    <kw-form
      ref="frmMainRef"
      :cols="2"
    >
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_DSPH_NO')">
          <kw-input
            readonly
            model-value="1588-4113"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_RECP_NO')">
          <kw-input
            v-model="biztalkParams.cstTno"
            :label="$t('MSG_TXT_RECP_NO')"
            rules="required|telephone"
            mask="telephone"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :colspan="2"
          :label="$t('MSG_TXT_BIZTALK_SEND_CN')"
        >
          <kw-input
            v-model="templateCn"
            type="textarea"
            :rows="7"
            readonly
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <kw-btn
        primary
        :label="$t('MSG_BTN_SEND')"
        @click="onClicBiztalkSend"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import {
  // codeUtil,
  // defineGrid,
  // getComponentType,
  useDataService,
  // useMeta,
  // gridUtil,
  useGlobal,
  useModal,
} from 'kw-lib';
// import { split } from 'lodash-es';

const {
  notify,
  confirm,
} = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
const { ok } = useModal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const frmMainRef = ref();
const props = defineProps({
  cnrNm: {
    type: String,
    default: '신일전자',
  },
  cnrTno: {
    type: String,
    default: '02-333-5555',
  },
});

const biztalkParams = ref({
  cnrNm: props.cnrNm,
  svCnrTno: props.cnrTno,
  cstTno: '',
});

const templateCn = (await dataService.post('/sflex/common/common/templates/TMP_SNC_WELLS17952/previews', biztalkParams.value)).data;

async function onClicBiztalkSend() {
  if (!await frmMainRef.value.validate()) { return; }
  if (!await confirm(t('MSG_ALT_BIZTALK_CONFIRM'))) { return; }
  biztalkParams.value.cstTno = (biztalkParams.value.cstTno).replaceAll('-', '');
  await dataService.post('/sms/wells/service/outsourcedpd-as-receipts/biztalk', biztalkParams.value);

  notify(t('MSG_ALT_SEND_SUCCESS'));
  ok();
}
</script>
