<template>
  <kw-popup
    class="kw-popup--xl"
    title="상세정보"
  >
    <kw-form
      ref="frmMainRef"
      :cols="2"
    >
      <kw-form-row>
        <kw-form-item
          label="메뉴명"
          required
        >
          <kw-input
            v-model="frmMainData.svEducMnalNm"
            rules="required"
            label="메뉴명"
          />
        </kw-form-item>
        <kw-form-item
          label="관리구분"
          required
        >
          <kw-select
            v-model="frmMainData.rsbDvCd"
            :options="rsbDvCd"
            rules="required"
            :name="관리구분"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          no-label
          :colspan="2"
        >
          <kw-editor
            v-model="frmMainData.svEducMnalCn"
            rules="required"
            name="textarea"
            class="fit"
            :options="{height: '30vh'}"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template
      #action
    >
      <kw-btn
        :label="$t('MSG_BTN_CANCEL')"
        negative
        @click="onClickCancel"
      />
      <kw-btn
        v-permission:update
        :label="$t('MSG_BTN_SAVE')"
        primary
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, useModal, useGlobal, getComponentType } from 'kw-lib';

const { notify } = useGlobal();
const { cancel: onClickCancel, ok } = useModal();
const rsbDvCd = ref();
const dataService = useDataService();
const { t } = useI18n();
const frmMainRef = ref(getComponentType('KwForm'));

const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
);
rsbDvCd.value = codes.RSB_DV_CD.filter((v) => ['W0601', 'W0603'].includes(v.codeId));

const props = defineProps({
  svEducMnalNm: {
    type: String,
    required: true,
  },
  svEducMnalId: {
    type: String,
    required: true,
  },
  hgrSvEducMnalId: {
    type: String,
    required: true,
  },
  inqrLvTcnt: {
    type: Number,
    required: true,
  },
  rowState: {
    type: String,
    required: true,
  },
  rsbDvCd: {
    type: String,
    required: true,
  },
  svEducMnalCn: {
    type: String,
    required: true,
  },
  expsrOdr: {
    type: Number,
    required: true,
  },

});

const frmMainData = ref({
  rsbDvCd: props.rsbDvCd,
  svEducMnalNm: props.svEducMnalNm,
  svEducMnalCn: props.svEducMnalCn,
});

async function getSaveParams() {
  const data = frmMainData.value;

  const params = {
    rsbDvCd: data.rsbDvCd,
    svEducMnalId: props.svEducMnalId,
    svEducMnalNm: data.svEducMnalNm,
    hgrSvEducMnalId: props.hgrSvEducMnalId,
    inqrLvTcnt: props.inqrLvTcnt,
    rowState: props.rowState,
    svEducMnalCn: data.svEducMnalCn,
    expsrOdr: props.expsrOdr,
  };

  return params;
}

async function saveTerms() {
  const data = await getSaveParams();
  const response = await dataService.post('/sms/wells/competence/zoom-counsel', data);
  return response;
}

async function onClickSave() {
  if (!await frmMainRef.value.validate()) { return; }
  const response = await saveTerms();
  if (response.data) {
    notify(t('MSG_ALT_SAVE_DATA'));
    ok(frmMainRef.value);
  }
}

</script>
