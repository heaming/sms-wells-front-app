<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDY
2. 프로그램 ID : WwcsbAssignContactModP - 배정컨택 (W-CU-U-0030P01)
3. 작성자 : junho.bae
4. 작성일 : 2022.AA.BB
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 고객 배정컨택 프로그램
****************************************************************************************************
--->
<template>
  <kw-popup size="sm">
    <kw-observer ref="obsMainRef">
      <kw-form
        ref="frmMainRef"
        :cols="1"
      >
        <kw-form-row>
          <!-- 배정컨택 -->
          <kw-form-item
            :label="t('MSG_TXT_ASSIGN_CONTACT')"
            required
          >
            <kw-select
              v-model="saveParams.pspcCstCnslRsCd"
              :options="codes.PSPC_CST_CNSL_RS_CD"
              :label="t('MSG_TXT_ASSIGN_CONTACT')"
              rules="required"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 비고 -->
          <kw-form-item :label="t('MSG_TXT_NOTE')">
            <kw-input
              v-model.trim="saveParams.cnslMoCn"
              type="textarea"
              :rows="3"
              counter
              maxlength="200"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
    </kw-observer>

    <template #action>
      <div class="button-set--bottom">
        <div class="button-set--bottom-right">
          <kw-btn
            :label="$t('MSG_BTN_CANCEL')"
            class="ml8"
            @click="cancel"
          />
          <kw-btn
            primary
            :label="$t('MSG_BTN_SAVE')"
            class="ml8"
            @click="onClickSave"
          />
        </div>
      </div>
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal, useModal, codeUtil } from 'kw-lib';

const { notify } = useGlobal();
const { t } = useI18n();
const { ok, cancel } = useModal(); //

const dataService = useDataService();
const obsMainRef = ref();
const frmMainRef = ref();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/customer/receipts';
const props = defineProps({
  // pdClsfId: { type: String, required: false, default: '' },
  // pdTpCd: { type: String, required: false, default: '' },
  pspcCstCnslIds: { type: Object, required: true },
});

const codes = await codeUtil.getMultiCodes(
  'PD_TP_CD',
  'COD_YN',
  'PSPC_CST_CNSL_RS_CD', /* 가망고객상담결과코드 */
);
const managePdTpCds = ['P', 'S'];
codes.PD_TP_CD = codes.PD_TP_CD.filter((v) => (managePdTpCds.includes(v.codeId)));

const saveParams = ref({
  pspcCstCnslRsCd: '', /* 배정컨택코드 */
  cnslMoCn: '', /* 비고 */
  pspcCstCnslIds: [], /* 가망고객상담ID */
});

async function onClickSave() {
  if (!await obsMainRef.value.validate()) { return; }
  if (await obsMainRef.value.alertIfIsNotModified()) { return; }

  console.log('saveParams.value', saveParams.value);
  await dataService.put(`${baseUrl}/contact`, saveParams.value);
  notify('저장을 완료하였습니다');
  ok('T');
}

onMounted(async () => {
  saveParams.value.pspcCstCnslIds = props.pspcCstCnslIds;
  console.log('saveParams.value.pspcCstCnslIds', saveParams.value.pspcCstCnslIds);
  obsMainRef.value.init();
});
</script>
