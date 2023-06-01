<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SN
2. 프로그램 ID : WwsnEngineerOgSearchItemGroup - 엔지니어 조직 조회조건용 Select Group
3. 작성자 : KJ
4. 작성일 : 2023.04.21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 엔지니어 조직 및 파트너 조회조건용 Select Group
****************************************************************************************************
--->
<template>
  <kw-search-item
    v-if="useOgLevel > '0'"
    :label="$t('MSG_TXT_CENTER_DIVISION')"
    :required="dgr1LevlOgRequired"
  >
    <kw-select
      ref="cbDgr1LevlOgIdRef"
      v-model="selectedDgr1LevlOgId"
      :options="dgr1LevlOgs"
      option-value="ogId"
      :option-label="dgr1LevlOgLabel"
      :first-option="dgr1LevlOgFirstOption"
      :label="$t('MSG_TXT_SV_CNR')"
      :rules="dgr1LevlOgRequired ? 'required' : undefined"
      :readonly="dgr1LevlOgReadonly"
      @update:model-value="onChangeDgr1LevlOgId"
    />
  </kw-search-item>
  <kw-search-item
    v-if="!!usePartner"
    :label="$t('MSG_TXT_EGER')"
    :required="partnerRequired"
  >
    <kw-select
      ref="cbPrtnrNoRef"
      v-model="selectedPrtnrNo"
      :options="partners"
      option-value="prtnrNo"
      :option-label="partnerLabel"
      :first-option="partnerFirstOption"
      :label="$t('MSG_TXT_EGER')"
      :rules="partnerRequired ? 'required' : undefined"
      :readonly="partnerReadonly"
      @update:model-value="onChangePrtnrNo"
    />
  </kw-search-item>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, useDataService } from 'kw-lib';
import { isEmpty } from 'lodash-es';

const dataService = useDataService();

const props = defineProps({
  useOgLevel: { type: String, default: '1' },
  usePartner: { type: Boolean, default: true },

  // Model Value
  dgr1LevlOgId: { type: String, default: undefined },
  prtnrNo: { type: String, default: undefined },

  // Select First Option
  dgr1LevlOgFirstOption: { type: String, default: undefined },
  partnerFirstOption: { type: String, default: undefined },

  // Select Label
  dgr1LevlOgLabel: { type: String, default: 'ogCdNm' },
  partnerLabel: { type: String, default: 'prtnrNoNm' },

  // Select Required
  dgr1LevlOgRequired: { type: Boolean, default: false },
  partnerRequired: { type: Boolean, default: false },

  // Selected Object
  dgr1LevlOg: { type: Object, default: undefined },
  partner: { type: Object, default: undefined },

  // Select Read Only
  dgr1LevlOgReadonly: { type: Boolean, default: false },
  partnerReadonly: { type: Boolean, default: false },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const emit = defineEmits([
  'update:dgr1LevlOgId',
  'update:prtnrNo',
  'update:dgr1LevlOg',
  'update:partner',
]);

const cbDgr1LevlOgIdRef = ref(getComponentType('KwSelect'));
const cbPrtnrNoRef = ref(getComponentType('KwSelect'));

const selectedDgr1LevlOgId = ref(props.dgr1LevlOgId);
const selectedPrtnrNo = ref(props.prtnrNo);

const dgr1LevlOgs = ref([]);
const partners = ref([]);

async function fetchDgr1LevlOgs() {
  return await dataService.get('/sms/wells/service/organizations/service-center');
}

async function fetchPartners(params) {
  return await dataService.get('/sms/wells/service/organizations/engineer', params);
}

async function getDgr1LevlOgs() {
  if (props.useOgLevel < '1') return;
  const res = await fetchDgr1LevlOgs();
  dgr1LevlOgs.value = res.data;
}

async function getPartners() {
  if (!props.usePartner) return;
  if ((props.useOgLevel === '1' && (props.dgr1LevlOgFirstOption === 'all' || !isEmpty(selectedDgr1LevlOgId.value)))
      || props.useOgLevel === '0'
  ) {
    const res = await fetchPartners({ params: {
      dgr1LevlOgId: selectedDgr1LevlOgId.value,
    } });
    partners.value = res.data;
  } else {
    partners.value = [];
  }
}

watch(() => props.dgr1LevlOgId, async (newVal) => {
  console.log('watch dgr1LevlOgId: ', selectedDgr1LevlOgId.value, '->', newVal);
  if (selectedDgr1LevlOgId.value !== newVal) {
    selectedDgr1LevlOgId.value = newVal;

    selectedPrtnrNo.value = '';
    await getPartners();
    emit('update:prtnrNo', selectedPrtnrNo.value);
    emit('update:partner', undefined);
  }
});

watch(() => props.prtnrNo, (newVal) => {
  console.log('watch prtnrNo: ', selectedPrtnrNo.value, '->', newVal);
  if (selectedPrtnrNo.value !== newVal) {
    selectedPrtnrNo.value = newVal;
  }
});

await getDgr1LevlOgs();
await getPartners();

async function onChangeDgr1LevlOgId(val) {
  console.log('update dgr1LevlOgId: ', props.dgr1LevlOgId, '->', val);
  emit('update:dgr1LevlOgId', val);
  emit('update:dgr1LevlOg', dgr1LevlOgs.value.find((og) => og.ogId === val));

  selectedPrtnrNo.value = '';
  await getPartners();
  emit('update:prtnrNo', selectedPrtnrNo.value);
  emit('update:partner', partners.value.find((partner) => partner.prtnrNo === selectedPrtnrNo.value));
}

async function onChangePrtnrNo(val) {
  console.log('update prtnrNo: ', props.prtnrNo, '->', val);
  emit('update:prtnrNo', val);
  emit('update:partner', partners.value.find((partner) => partner.prtnrNo === val));
}
</script>
