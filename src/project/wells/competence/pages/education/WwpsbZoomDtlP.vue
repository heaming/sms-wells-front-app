<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsbZoomDtlP - 알림 ZOOM 상세 팝업
3. 작성자 : gs.piit225
4. 작성일 : 2023.05.18
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 알림 ZOOM 상세 팝업
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
        <kw-form-item
          :label="$t('MSG_TXT_MENU_NM')"
          required
        >
          <kw-input
            v-model="frmMainData.svEducMnalNm"
            rules="required"
            :label="$t('MSG_TXT_MENU_NM')"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_MNGT_DV')"
          required
        >
          <kw-select
            v-model="frmMainData.rsbDvCd"
            :options="rsbDvCd"
            rules="required"
            :label="$t('MSG_TXT_MNGT_DV')"
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
import { isEmpty } from 'lodash-es';

const { notify } = useGlobal();
const { cancel: onClickCancel, ok } = useModal();
const dataService = useDataService();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const rsbDvCd = ref();
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

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const frmMainData = ref({
  rsbDvCd: props.rsbDvCd,
  svEducMnalNm: isEmpty(props.svEducMnalNm) ? '' : props.svEducMnalNm,
  svEducMnalCn: isEmpty(props.svEducMnalCn) ? '' : props.svEducMnalCn,
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

async function onClickSave() {
  if (await frmMainRef.value.alertIfIsNotModified()) { return; }
  if (!await frmMainRef.value.validate()) { return; }
  const data = await getSaveParams();
  const response = await dataService.post('/sms/wells/competence/zoom-counsel', data);
  if (response.data) {
    notify(t('MSG_ALT_SAVE_DATA'));
    ok(frmMainRef.value);
  }
}

</script>
