<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNY
2. 프로그램 ID : WwsnyErrorCodeRegP(K-W-SV-U-0304P01) - 상품별 에러코드 등록
3. 작성자 : jaehunlee
4. 작성일 : 2023.07.03
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- 상품별 에러코드 관리 (http://localhost:3000/#/service/wwsny-error-code-reg)
 ****************************************************************************************************
--->
<template>
  <kw-popup
    size="md"
    :title="$t('MSG_TIT_PRD_ERR_RGST')"
  >
    <kw-form
      ref="frmMainRef"
      :cols="1"
      :label-size="120"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_ITM_NM')"
          required
        >
          <kw-select
            v-model="errorCodeInfo.pdCd"
            :options="productCode"
            :readonly="hasProps()"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_ERR_TP')"
          required
        >
          <kw-input
            v-model="errorCodeInfo.errCn"
            type="textarea"
            :rows="3"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_ERR_CN')"
          required
        >
          <kw-input
            v-model="errorCodeInfo.errDvCn"
            type="textarea"
            :rows="3"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_ERR_DTL')"
        >
          <kw-input
            v-model="errorCodeInfo.errCausCn"
            type="textarea"
            :rows="3"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_IMG')"
        >
          <zwcm-file-attacher
            ref="attachFileRef"
            v-model="attachFiles"
            :attach-document-id="errorCodeInfo.errImageDocId"
            attach-group-id="ATG_SNY_ERR_IMG"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_TXT_CANCEL')"
        @click="cancel"
      />
      <kw-btn
        primary
        :label="$t('MSG_TXT_RGS')"
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, useDataService, useGlobal, useModal } from 'kw-lib';
import ZwcmFileAttacher from '~common/components/ZwcmFileAttacher.vue';
import { isEmpty } from 'lodash-es';

const dataService = useDataService();
const { notify, confirm } = useGlobal();
const { t } = useI18n();
const { cancel, ok } = useModal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const frmMainRef = ref(getComponentType('KwForm'));
const attachFiles = ref([]);

const props = defineProps({
  pdCd: {
    type: String,
    default: '',
  },
  errCn: {
    type: String,
    default: '',
  },
  errDvCn: {
    type: String,
    default: '',
  },
  errCausCn: {
    type: String,
    default: '',
  },
  errImageUId: {
    type: String,
    default: '',
  },
  errImageDocId: {
    type: String,
    default: '',
  },
  flag: {
    type: String,
    default: 'I',
  },
});

const initialErrorCodeInfo = {
  pdCd: '',
  errCn: '',
  errDvCn: '',
  errCausCn: '',
  errImageUId: '',
  errImageDocId: '',
  attachFiles: [],
  flag: 'I',
};

const errorCodeInfo = ref(initialErrorCodeInfo);
function hasProps() {
  return !isEmpty(props.errCn);
}

function resetErrorCodeInfo() {
  errorCodeInfo.value.pdCd = props.pdCd;
  errorCodeInfo.value.errCn = props.errCn;
  errorCodeInfo.value.errDvCn = props.errDvCn;
  errorCodeInfo.value.errCausCn = props.errCausCn;
  errorCodeInfo.value.errImageUId = props.errImageUId;
  errorCodeInfo.value.errImageDocId = props.errImageDocId;
  errorCodeInfo.value.attachFiles = attachFiles.value;
  errorCodeInfo.value.flag = props.flag;
  // errorCodeInfo.value.attachFiles = attachFiles.value;
}

watch(() => errorCodeInfo.value.pdCd, async (val) => {
  if (errorCodeInfo.value.pdCd !== val) {
    errorCodeInfo.value.pdCd = val;
  }
});

const productCode = ref([]);

const prd = (await dataService.get('/sms/wells/service/installation-locations/products')).data;
productCode.value = prd;

onMounted(async () => {
  if (!isEmpty(props.pdCd)) {
    resetErrorCodeInfo();
    await frmMainRef.value.init();
  }
});

async function onClickSave() {
  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }
  errorCodeInfo.value.attachFiles = attachFiles.value;
  const data = errorCodeInfo.value;
  console.log(data);
  await dataService.post('/sms/wells/service/error-code', data);
  notify(t('MSG_ALT_SAVE_DATA'));

  ok();
}
</script>
