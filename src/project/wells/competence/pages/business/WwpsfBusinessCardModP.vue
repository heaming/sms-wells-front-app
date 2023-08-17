<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfBusinessCardModP - 명함첩관리 -명함수정
3. 작성자 : jisung you
4. 작성일 : 2023.08.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-명함첩관리-명함수정
****************************************************************************************************
--->
<template>
  <kw-popup
    size="md"
  >
    <div class="row mb20">
      <!-- <kw-action-top>
        <kw-btn
          dense
          label="이미지 수정"
        />
      </kw-action-top> -->

      <div
        class="text-center"
        style="width: 100%;"
      >
        <!-- style 부분은 개발 시 조정 -->
        <kw-avatar
          font-size="18px"
          color="line-bg"
          square
          style="width: 100%; height: 290px;"
        >
          <img
            :src="item.realFpath"
            :alt="item.fnm"
          >
        </kw-avatar>
      </div>
    </div>
    <kw-form
      ref="saveRef"
      :cols="1"
      dense
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_BCD_IMG')"
          required
        >
          <zwcm-file-attacher
            ref="attachFileRef1"
            v-model="attachFiles1"
            :label="$t('MSG_TXT_BCD_IMG')"
            attach-group-id="ATG_PSF_BCD_IMG"
            :attach-document-id="saveParams.ctplcImgFileId"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_EMPL_NM')"
          required
        >
          <kw-input
            v-model="saveParams.fnm"
            :label="$t('MSG_TXT_EMPL_NM')"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CONTACT')"
          required
        >
          <zwcm-telephone-number
            v-model:tel-no1="saveParams.cralLocaraTno"
            v-model:tel-no2="saveParams.mexnoEncr"
            v-model:tel-no3="saveParams.cralIdvTno"
            :label="$t('MSG_TXT_CONTACT')"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_ADDR')"
          required
        >
          <!--주소-->
          <zwcm-post-code
            ref="adrRef"
            v-model:addKey="saveParams.adrId"
            v-model:zipCode="saveParams.zip"
            v-model:adrDvCd="saveParams.adrDvCd"
            v-model:add1="saveParams.basAdr"
            v-model:add2="saveParams.dtlAdr"
            class="kw-grow"
            :label="$t('MSG_TXT_ADDR')"
            required
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <kw-btn
        :label="$t('MSG_BTN_CANCEL')"
        negative
        @click="onClickCancel"
      />
      <kw-btn
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
import { useDataService, useGlobal, useModal, getComponentType } from 'kw-lib';
import ZwcmFileAttacher from '~common/components/ZwcmFileAttacher.vue';
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';
import ZwcmPostCode from '~common/components/ZwcmPostCode.vue';

const { notify } = useGlobal();
const dataService = useDataService();
const { cancel: onClickCancel, ok } = useModal();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  item: { type: Array, default: () => [] },
});

const item = ref(props.item);

const adrRef = ref();
const saveRef = ref(getComponentType('KwForm'));
const attachFiles1 = ref([]);

const saveParams = ref({
  attachFiles1: [], /* 명함이미지파일 */
  fnm: item.value.fnm,
  ctplcImgFileId: item.value.ctplcImgFileId, /* 연락처이미지파일ID */
  cralLocaraTno: item.value.cralLocaraTno, /* 휴대지역전화번호 */
  mexnoEncr: item.value.mexnoEncr, /* 휴대전화국번호암호화 */
  cralIdvTno: item.value.cralIdvTno, /* 휴대개별전화번호 */
  zip: item.value.zip, /* 우편번호 */
  adrDvCd: item.value.adrDvCd,
  basAdr: item.value.basAdr, /* 기본주소 */
  dtlAdr: item.value.dtlAdr, /* 상세주소 */
  adrId: '',
  ctplcSn: item.value.ctplcSn,

});

async function onClickSave() {
  if (await saveRef.value.alertIfIsNotModified()) { return; }
  if (!await saveRef.value.validate()) { return; }
  saveParams.value.attachFiles1 = attachFiles1.value;
  const data = saveParams.value;
  await dataService.post('/sms/wells/competence/business/partner', data);
  notify(t('MSG_ALT_SAVE_DATA'));
  ok();
}
</script>
<style scoped></style>
