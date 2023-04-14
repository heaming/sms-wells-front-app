<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SND
2. 프로그램 ID : WwsnzManagerOgMultiSelect - 매니저 조직 Multi Select Component
3. 작성자 : KJ
4. 작성일 : 2023.04.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 매니저 조직 및 파트너 Multi Select Component
****************************************************************************************************
--->
<template>
  <kw-search-row>
    <kw-search-item
      v-if="useOgLevel > '0'"
      :label="$t('MSG_TXT_MANAGEMENT_DEPARTMENT')"
      :required="dgr1LevlOgRequired"
    >
      <kw-select
        ref="cbDgr1LevlOgIdRef"
        v-model="selectedDgr1LevlOgId"
        :options="dgr1LevlOgs"
        option-value="ogId"
        :option-label="dgr1LevlOgLabel"
        :first-option="dgr1LevlOgFirstOtion"
        :label="$t('MSG_TXT_MANAGEMENT_DEPARTMENT')"
        :rules="dgr1LevlOgRequired ? 'required' : undefined"
        @update:model-value="onChangeDgr1LevlOgId"
      />
    </kw-search-item>
    <kw-search-item
      v-if="useOgLevel > '1'"
      :label="$t('MSG_TXT_RGNL_GRP')"
      :required="dgr2LevlOgRequired"
    >
      <kw-select
        ref="cbDgr2LevlOgIdRef"
        v-model="selectedDgr2LevlOgId"
        :options="dgr2LevlOgs"
        option-value="ogId"
        :option-label="dgr2LevlOgLabel"
        :first-option="dgr2LevlOgFirstOtion"
        :label="$t('MSG_TXT_RGNL_GRP')"
        :rules="dgr2LevlOgRequired ? 'required' : undefined"
        @update:model-value="onChangeDgr2LevlOgId"
      />
    </kw-search-item>
    <kw-search-item
      v-if="useOgLevel > '2'"
      :label="$t('MSG_TXT_BRANCH')"
      :required="dgr3LevlOgRequired"
    >
      <kw-select
        ref="cbDgr3LevlOgIdRef"
        v-model="selectedDgr3LevlOgId"
        :options="dgr3LevlOgs"
        option-value="ogId"
        :option-label="dgr3LevlOgLabel"
        :first-option="dgr3LevlOgFirstOtion"
        :label="$t('MSG_TXT_BRANCH')"
        :rules="dgr3LevlOgRequired ? 'required' : undefined"
        @update:model-value="onChangeDgr3LevlOgId"
      />
    </kw-search-item>
    <kw-search-item
      v-if="!!usePartner"
      :label="$t('MSG_TXT_MANAGER')"
      :required="partnerRequired"
    >
      <kw-select
        ref="cbPrtnrNoRef"
        v-model="selectedPrtnrNo"
        :options="partners"
        option-value="prtnrNo"
        :option-label="partnerLabel"
        :first-option="partnerFirstOtion"
        :label="$t('MSG_TXT_MANAGER')"
        :rules="partnerRequired ? 'required' : undefined"
        @update:model-value="onChangePrtnrNo"
      />
    </kw-search-item>
  </kw-search-row>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, useDataService } from 'kw-lib';
import { isEmpty } from 'lodash-es';

const dataService = useDataService();

const props = defineProps({
  useOgLevel: { type: String, default: '3' },
  usePartner: { type: Boolean, default: true },
  dgr1LevlOgId: { type: String, default: undefined },
  dgr2LevlOgId: { type: String, default: undefined },
  dgr3LevlOgId: { type: String, default: undefined },
  prtnrNo: { type: String, default: undefined },

  // Select First Option
  dgr1LevlOgFirstOtion: { type: String, default: undefined },
  dgr2LevlOgFirstOtion: { type: String, default: undefined },
  dgr3LevlOgFirstOtion: { type: String, default: undefined },
  partnerFirstOtion: { type: String, default: undefined },

  // Select Label
  dgr1LevlOgLabel: { type: String, default: 'ogNm' },
  dgr2LevlOgLabel: { type: String, default: 'ogNm' },
  dgr3LevlOgLabel: { type: String, default: 'ogNm' },
  partnerLabel: { type: String, default: 'prtnrNm' },

  // Select Required
  dgr1LevlOgRequired: { type: Boolean, default: false },
  dgr2LevlOgRequired: { type: Boolean, default: false },
  dgr3LevlOgRequired: { type: Boolean, default: false },
  partnerRequired: { type: Boolean, default: false },

  // Selected Object
  dgr1LevlOg: { type: Object, default: undefined },
  dgr2LevlOg: { type: Object, default: undefined },
  dgr3LevlOg: { type: Object, default: undefined },
  partner: { type: Object, default: undefined },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const emit = defineEmits([
  'update:dgr1LevlOgId',
  'update:dgr2LevlOgId',
  'update:dgr3LevlOgId',
  'update:prtnrNo',
  'update:dgr1LevlOg',
  'update:dgr2LevlOg',
  'update:dgr3LevlOg',
  'update:partner',
]);

const cbDgr1LevlOgIdRef = ref(getComponentType('KwSelect'));
const cbDgr2LevlOgIdRef = ref(getComponentType('KwSelect'));
const cbDgr3LevlOgIdRef = ref(getComponentType('KwSelect'));
const cbPrtnrNoRef = ref(getComponentType('KwSelect'));

const selectedDgr1LevlOgId = ref(props.dgr1LevlOgId);
const selectedDgr2LevlOgId = ref(props.dgr2LevlOgId);
const selectedDgr3LevlOgId = ref(props.dgr3LevlOgId);
const selectedPrtnrNo = ref(props.prtnrNo);

const dgr1LevlOgs = ref([]);
const dgr2LevlOgs = ref([]);
const dgr3LevlOgs = ref([]);
const partners = ref([]);

async function fetchDgr1LevlOgs() {
  return await dataService.get('/sms/wells/service/organizations/general-division');
}

async function fetchDgr2LevlOgs(params) {
  return await dataService.get('/sms/wells/service/organizations/regional-group', params);
}

async function fetchDgr3LevlOgs(params) {
  return await dataService.get('/sms/wells/service/organizations/branch', params);
}

async function fetchPartners(params) {
  return await dataService.get('/sms/wells/service/organizations/manager', params);
}

async function getDgr1LevlOgs() {
  if (props.useOgLevel < '1') return;
  const res = await fetchDgr1LevlOgs();
  dgr1LevlOgs.value = res.data;
}

async function getDgr2LevlOgs() {
  if (props.useOgLevel < '2') return;
  if (!isEmpty(selectedDgr1LevlOgId.value)) {
    const res = await fetchDgr2LevlOgs({ params: { ogId: selectedDgr1LevlOgId.value } });
    dgr2LevlOgs.value = res.data;
  } else {
    dgr2LevlOgs.value = [];
  }
}

async function getDgr3LevlOgs() {
  if (props.useOgLevel < '3') return;
  if (!isEmpty(selectedDgr2LevlOgId.value)) {
    const res = await fetchDgr3LevlOgs({ params: { ogId: selectedDgr2LevlOgId.value } });
    dgr3LevlOgs.value = res.data;
  } else {
    dgr3LevlOgs.value = [];
  }
}

async function getPartners() {
  if (!props.usePartner) return;
  if ((props.useOgLevel === '3' && (props.dgr3LevlOgFirstOtion === 'all' || !isEmpty(selectedDgr3LevlOgId.value)))
    || (props.useOgLevel === '2' && (props.dgr2LevlOgFirstOtion === 'all' || !isEmpty(selectedDgr2LevlOgId.value)))
      || (props.useOgLevel === '1' && (props.dgr1LevlOgFirstOtion === 'all' || !isEmpty(selectedDgr1LevlOgId.value)))
  ) {
    const res = await fetchPartners({ params: {
      dgr1LevlOgId: selectedDgr1LevlOgId.value,
      dgr2LevlOgId: selectedDgr2LevlOgId.value,
      dgr3LevlOgId: selectedDgr3LevlOgId.value,
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

    selectedDgr2LevlOgId.value = '';
    await getDgr2LevlOgs();
    emit('update:dgr2LevlOgId', selectedDgr2LevlOgId.value);
    emit('update:dgr2LevlOg', undefined);

    selectedDgr3LevlOgId.value = '';
    await getDgr3LevlOgs();
    emit('update:dgr3LevlOgId', selectedDgr3LevlOgId.value);
    emit('update:dgr3LevlOg', undefined);

    selectedPrtnrNo.value = '';
    await getPartners();
    emit('update:prtnrNo', selectedPrtnrNo.value);
    emit('update:partner', undefined);
  }
});

watch(() => props.dgr2LevlOgId, async (newVal) => {
  console.log('watch dgr2LevlOgId: ', selectedDgr2LevlOgId.value, '->', newVal);
  if (selectedDgr2LevlOgId.value !== newVal) {
    selectedDgr2LevlOgId.value = newVal;

    selectedDgr3LevlOgId.value = '';
    await getDgr3LevlOgs();
    emit('update:dgr3LevlOgId', selectedDgr3LevlOgId.value);
    emit('update:dgr3LevlOg', undefined);

    selectedPrtnrNo.value = '';
    await getPartners();
    emit('update:prtnrNo', selectedPrtnrNo.value);
    emit('update:partner', undefined);
  }
});

watch(() => props.dgr3LevlOgId, async (newVal) => {
  console.log('watch dgr3LevlOgId: ', selectedDgr3LevlOgId.value, '->', newVal);
  if (selectedDgr3LevlOgId.value !== newVal) {
    selectedDgr3LevlOgId.value = newVal;

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
await getDgr2LevlOgs();
await getDgr3LevlOgs();
await getPartners();

async function onChangeDgr1LevlOgId(val) {
  console.log('update dgr1LevlOgId: ', props.dgr1LevlOgId, '->', val);
  emit('update:dgr1LevlOgId', val);
  emit('update:dgr1LevlOg', dgr1LevlOgs.value.find((og) => og.ogId === val));

  selectedDgr2LevlOgId.value = '';
  await getDgr2LevlOgs();
  emit('update:dgr2LevlOgId', selectedDgr2LevlOgId.value);
  emit('update:dgr2LevlOg', dgr2LevlOgs.value.find((og) => og.ogId === selectedDgr2LevlOgId.value));

  selectedDgr3LevlOgId.value = '';
  await getDgr3LevlOgs();
  emit('update:dgr3LevlOgId', selectedDgr3LevlOgId.value);
  emit('update:dgr3LevlOg', dgr3LevlOgs.value.find((og) => og.ogId === selectedDgr3LevlOgId.value));

  selectedPrtnrNo.value = '';
  await getPartners();
  emit('update:prtnrNo', selectedPrtnrNo.value);
  emit('update:partner', partners.value.find((partner) => partner.prtnrNo === selectedPrtnrNo.value));
}

async function onChangeDgr2LevlOgId(val) {
  console.log('update dgr2LevlOgId: ', props.dgr2LevlOgId, '->', val);
  emit('update:dgr2LevlOgId', val);
  emit('update:dgr2LevlOg', dgr2LevlOgs.value.find((og) => og.ogId === val));

  selectedDgr3LevlOgId.value = '';
  await getDgr3LevlOgs();
  emit('update:dgr3LevlOgId', selectedDgr3LevlOgId.value);
  emit('update:dgr3LevlOg', dgr3LevlOgs.value.find((og) => og.ogId === selectedDgr3LevlOgId.value));

  selectedPrtnrNo.value = '';
  await getPartners();
  emit('update:prtnrNo', selectedPrtnrNo.value);
  emit('update:partner', partners.value.find((partner) => partner.prtnrNo === selectedPrtnrNo.value));
}

async function onChangeDgr3LevlOgId(val) {
  console.log('update dgr3LevlOgId: ', props.dgr3LevlOgId, '->', val);
  emit('update:dgr3LevlOgId', val);
  emit('update:dgr3LevlOg', dgr3LevlOgs.value.find((og) => og.ogId === val));

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
