<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfBusinessCardForwardingRegP - 명함첩관리 - 내명함등록
3. 작성자 : jisung you
4. 작성일 : 2023.08.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-명함첩관리- 내명함등록
****************************************************************************************************
--->
<template>
  <kw-popup
    size="md"
  >
    <kw-form
      ref="saveRef"
      :cols="1"
      dense
    >
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
          :label="$t('MSG_TXT_RSB')"
          required
        >
          <kw-input
            v-model="saveParams.rsbNm"
            :label="$t('MSG_TXT_RSB')"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CP')"
          required
        >
          <zwcm-telephone-number
            v-model:tel-no1="saveParams.cralLocaraTno"
            v-model:tel-no2="saveParams.mexnoEncr"
            v-model:tel-no3="saveParams.cralIdvTno"
            :label="$t('MSG_TXT_CP')"
            required
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_TEL_NO')"
        >
          <zwcm-telephone-number
            v-model:tel-no1="saveParams.locaraTno"
            v-model:tel-no2="saveParams.exnoEncr"
            v-model:tel-no3="saveParams.idvTno"
            :label="$t('MSG_TXT_TEL_NO')"
            area
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_ADDR')"
        >
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
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_PSIC_FAX')"
        >
          <zwcm-telephone-number
            v-model:tel-no1="saveParams.faxLocaraTno"
            v-model:tel-no2="saveParams.faxExno"
            v-model:tel-no3="saveParams.faxIdvTno"
            :label="$t('MSG_TXT_PSIC_FAX')"
            :tel-no1-clearable="false"
            area
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_EMAIL')"
        >
          <kw-input v-model="saveParams.emadr" />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_BLG')"
          required
        >
          <kw-input
            v-model="saveParams.blgNm"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_PHO')"
        >
          <zwcm-file-attacher
            ref="attachFileRef1"
            v-model="attachFiles"
            :label="$t('MSG_TXT_PHO')"
            attach-group-id="ATG_PSF_BCD_IMG"
            :attach-document-id="saveParams.ctplcImgFileId"
            rules="required"
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
import { useDataService, useMeta, useModal, useGlobal, getComponentType } from 'kw-lib';
import ZwcmFileAttacher from '~common/components/ZwcmFileAttacher.vue';
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';
import ZwcmPostCode from '~common/components/ZwcmPostCode.vue';

const { notify } = useGlobal();
const { getUserInfo } = useMeta();
const dataService = useDataService();
const userInfo = getUserInfo();
const { cancel: onClickCancel, ok } = useModal();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
console.log('userInfo', userInfo);
const saveRef = ref(getComponentType('KwForm'));
const attachFiles = ref();

const saveParams = ref({
  fnm: '',
  blgNm: '',
  rsbNm: '',
  ctplcImgFileId: '', /* 연락처이미지파일ID */
  cralLocaraTno: '', /* 휴대지역전화번호 */
  mexnoEncr: '', /* 휴대전화국번호암호화 */
  cralIdvTno: '', /* 휴대개별전화번호 */
  locaraTno: '', /* 지역전화번호 */
  exnoEncr: '', /* 전화국번호암호화 */
  idvTno: '', /* 개별전화번호 */
  zip: '', /* 우편번호 */
  adrDvCd: '',
  basAdr: '', /* 기본주소 */
  dtlAdr: '', /* 상세주소 */
  adrId: '',
  faxLocaraTno: '',
  faxExno: '',
  faxIdvTno: '',
  emadr: '',
  ctplcApnImgFileId: '',
  attachFiles: null, /* 명함이미지파일 */
  realFpath: '',
  fileNm: '',

});

async function onClickSave() {
  if (await saveRef.value.alertIfIsNotModified()) { return; }
  if (!await saveRef.value.validate()) { return; }

  saveParams.value.attachFiles = attachFiles.value;
  const data = saveParams.value;
  await dataService.post('/sms/wells/competence/business/partner/contact-base', data);
  notify(t('MSG_ALT_SAVE_DATA'));
  ok();
}

const onClickSearch = async () => {
  const res = await dataService.get('/sms/wells/competence/business/partner/contact-base');
  Object.assign(saveParams.value, res.data);
};

onMounted(async () => {
  await onClickSearch();
});
</script>
<style scoped></style>
