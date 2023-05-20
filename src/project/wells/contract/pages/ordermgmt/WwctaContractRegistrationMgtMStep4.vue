<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : [CTA] 통합계약서 작성 Step2
2. 프로그램 ID : EwctaContractRegistrationMgtMStep1
3. 작성자 : gs.piit159
4. 작성일 : 2023.04.05
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 통합계약서 작성 Step1
****************************************************************************************************
--->
<template>
  <kw-scroll-area
    visible
    class="h490 col"
  >
    <div class="pr40">
      <h3 class="mt0">
        계약정보
      </h3>

      <kw-form
        :cols="2"
        dense
      >
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_CNTRT')"
          >
            <p>
              {{ `${step4.cntrt.cstKnm} / ${stringUtil.getDateFormat(step4.cntrt.bryyMmdd)} /
${step4.cntrt.sexDvNm}` }}
            </p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_MPNO')"
          >
            <p>
              {{ step4.cntrt.cralLocaraTno }}-{{ step4.cntrt.mexnoEncr }}-{{ step4.cntrt.cralIdvTno }}
            </p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_ADDR')"
          >
            <p>
              {{ step4.cntrt.zip }}<br>
              {{ step4.cntrt.adr }} {{ step4.cntrt.adrDtl }}
            </p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_LRNR')"
          >
            <p>
              {{ `${step4.lrnr.cstKnm} (${step4.lrnr.sexDvNm}
            , ${stringUtil.getDateFormat(step4.lrnr.bryyMmdd)})` }}
            </p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator />

      <h3>주문 및 결제 정보</h3>

      <kw-form
        :cols="1"
      >
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_PMT_TYP')"
          >
            <p>{{ step4.stlmDtls[0].stlmTpNm }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item label="고객결제방법선택">
            <kw-option-group
              v-model="step4.bas.cstStlmInMthCd"
              type="radio"
              :options="codes.CST_STLM_IN_MTH_CD"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-action-top class="mt20">
        <template #left>
          <h3>결제상세정보</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular">(단위:원)</span>
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="5"
        @init="initGrdMain"
      />

      <kw-separator />

      <h3>{{ $t('MSG_TXT_SPP_INF') }}</h3>
      <kw-form
        :cols="2"
        dense
      >
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_CNTRT')"
          >
            <p>{{ step4.adrpc.rcgvpKnm }}</p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_MPNO')"
          >
            <p>
              {{ step4.adrpc.cralLocaraTno }}-{{ step4.adrpc.mexnoEncr }}-{{ step4.adrpc.cralIdvTno }}
            </p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_ADDR')"
          >
            <p>
              {{ step4.adrpc.zip }}<br>
              {{ step4.adrpc.adr }} {{ step4.adrpc.adrDtl }}
            </p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator />

      <h3>{{ $t('MSG_TXT_PRTNR_INF') }}</h3>
      <kw-form
        :cols="2"
        dense
      >
        <kw-form-row>
          <kw-form-item label="센터(지국)">
            <p>{{ `${step4.prtnr.dgr3LevlOgNm}(${step4.prtnr.dgr4LevlOgCd})` }}</p>
          </kw-form-item>
          <kw-form-item label="판매인(번호)">
            <p>{{ `${step4.prtnr.prtnrKnm}(${step4.prtnr.prtnrNo})` }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_CONTACT')"
          >
            <p>010-1234-1234</p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_ADDR')"
          >
            <p>
              {{ step4.prtnr.zip }}<br>
              {{ step4.prtnr.adr }} {{ step4.prtnr.adrDtl }}
            </p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator class="mb20" />

      <div class="row justify-end">
        <kw-btn
          label="대면 결제"
          secondary
        />
        <kw-btn
          label="비대면 결제(링크전송)"
          secondary
          class="ml8"
        />
      </div>
    </div>
  </kw-scroll-area>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, stringUtil, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { notify } = useGlobal();
const props = defineProps({
  contract: { type: String, required: true },
});
const { step4 } = toRefs(props.contract);
step4.value = {
  bas: {},
  cntrt: {},
  lrnr: {},
  adrpc: {},
  prtnr: {},
  prtnr7: {},
  stlmDtls: [{}],
};
const ogStep4 = ref({});
const { t } = useI18n();
const grdMainRef = ref(getComponentType('KwGrid'));
const codes = await codeUtil.getMultiCodes(
  'CST_STLM_IN_MTH_CD',
);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
function setGrid() {
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(step4.value.stlmDtls);
  const layouts1 = [
    'pdNm',
    'fnlAmt',
    'c10010702',
    'c10010802',
    'c10010803',
    'c1001',
  ];
  const layouts2 = [
    'pdNm',
    'fnlAmt',
    {
      header: t('MSG_TXT_CNTRAM'),
      direction: 'horizontal',
      items: ['c20010702', 'c20010802', 'c20010803', 'c2001'],
    },
    {
      header: t('MSG_TXT_STLM_AMT'),
      direction: 'horizontal',
      items: ['c2003', 'istmStlmAmt'],
    },
  ];
  const stlmTpCd = view.getValue(0, 'stlmTpCd');
  view.setColumnLayout(stlmTpCd === '10' ? layouts1 : layouts2);
}
async function getCntrInfo(cntrNo) {
  const cntr = await dataService.get('sms/edu/contract/contracts/cntr-info', { params: { cntrNo, step: 4 } });
  step4.value = cntr.data.step4;
  console.log(step4.value);
  ogStep4.value = cloneDeep(step4.value);
  setGrid();
}

function isChangedStep() {
  return JSON.stringify(ogStep4.value) !== JSON.stringify(step4.value);
}

async function saveStep() {
  const savedCntr = await dataService.post('sms/edu/contract/contracts/save-cntr-step4', step4.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  ogStep4.value = cloneDeep(step4.value);
  return savedCntr?.data?.key;
}

defineExpose({
  getCntrInfo,
  isChangedStep,
  saveStep,
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'stlmTpCd' },
    { fieldName: 'stlmTpNm' },
    { fieldName: 'pdNm' },
    { fieldName: 'fnlAmt', dataType: 'number' },
    { fieldName: 'dscAmt', dataType: 'number' },
    { fieldName: 'c1001', dataType: 'number' },
    { fieldName: 'c10010702', dataType: 'number' },
    { fieldName: 'c10010802', dataType: 'number' },
    { fieldName: 'c10010803', dataType: 'number' },
    { fieldName: 'c2001', dataType: 'number' },
    { fieldName: 'c20010702', dataType: 'number' },
    { fieldName: 'c20010802', dataType: 'number' },
    { fieldName: 'c20010803', dataType: 'number' },
    { fieldName: 'c2003', dataType: 'number' },
    { fieldName: 'istmStlmAmt', dataType: 'number' },
  ];
  const columns = [
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: 200 },
    { fieldName: 'fnlAmt', header: t('MSG_TXT_PRICE'), width: 100, styleName: 'text-right' },
    { fieldName: 'dscAmt', header: t('MSG_TXT_DSC'), width: 100, styleName: 'text-right' },

    { fieldName: 'c1001', header: t('MSG_TXT_STLM_AMT'), width: 100, styleName: 'text-right' },
    { fieldName: 'c10010702', header: t('MSG_TXT_REF_MIL'), width: 100, styleName: 'text-right' },
    { fieldName: 'c10010802', header: t('MSG_TXT_K_MON'), width: 100, styleName: 'text-right' },
    { fieldName: 'c10010803', header: t('MSG_TXT_K_MEMBERS_CASH'), width: 100, styleName: 'text-right' },

    { fieldName: 'c2001', header: t('MSG_TIT_SPAY'), width: 100, styleName: 'text-right' },
    { fieldName: 'c20010702', header: t('MSG_TXT_REF_MIL'), width: 100, styleName: 'text-right' },
    { fieldName: 'c20010802', header: t('MSG_TXT_K_MON'), width: 100, styleName: 'text-right' },
    { fieldName: 'c20010803', header: t('MSG_TXT_K_MEMBERS_CASH'), width: 100, styleName: 'text-right' },
    { fieldName: 'c2003', header: t('MSG_TXT_MM_INTAM'), width: 100, styleName: 'text-right' },
    { fieldName: 'istmStlmAmt', header: t('MSG_TXT_STLM_AMT'), width: 100, styleName: 'text-right' },
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
});
</script>

<style scoped lang="scss">
</style>
