<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfBusinessCardForwardingMgtM - 명함첩관리 - 명함발송
3. 작성자 : jisung you
4. 작성일 : 2023.08.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-명함첩관리-명함발송
****************************************************************************************************
--->\
<template>
  <kw-page>
    <div class="kw-auth-wrap text-center">
      <div
        style="max-width: 640px;margin: 0 auto;"
      >
        <kw-action-top>
          <template #left>
            <h3>{{ $t('MSG_TXT_BCD') }}</h3>
          </template>
          <kw-btn
            v-if="isPreview"
            dense
            :label="$t('MSG_BTN_MOD')"
            @click="onClickPopup"
          />
        </kw-action-top>
        <div
          v-if="isPreview"
          class="row mb20 border-box justify-between"
        >
          <div class="column w120">
            <kw-avatar
              font-size="15px"
              color="line-bg"
              size="80px"
              squre
            >
              KYOWON
              <!--<img
                src="node_modules/kw-lib/src/assets/images/example_profile.png"
                alt="profile"
              >-->
            </kw-avatar>
            <kw-avatar
              size="80px"
              class="mt30"
            >
              <img
                :src="searchParams.realFpath"
                :alt="searchParams.fnm"
              >
            </kw-avatar>
          </div>
          <ul class="card-text">
            <li>
              <h3>{{ searchParams.fnm }}</h3>
            </li>
            <li>
              <span>
                {{ searchParams.blgNm }} / {{ searchParams.rsbNm }}
              </span>
            </li>
            <li>
              <h3 class="mt15">
                교원 KYOWON
              </h3>
            </li>
            <li>
              <span>
                Mobile. {{ searchParams.cralLocaraTno }} - {{ searchParams.mexnoEncr }}- {{ searchParams.cralIdvTno }}
              </span>
            </li>
            <li>
              <span>
                Tel. {{ searchParams.locaraTno }} - {{ searchParams.exnoEncr }}- {{ searchParams.idvTno }}
              </span>
            </li>
            <li>
              <span>
                Fax. {{ searchParams.faxLocaraTno }} - {{ searchParams.faxExno }}- {{ searchParams.faxIdvTno }}
              </span>
            </li>
            <li>
              <span>
                E-mail. {{ searchParams.emadr }}
              </span>
            </li>
            <li>
              <span>
                {{ searchParams.basAdr }}
              </span>
            </li>
            <li>
              <span>
                {{ searchParams.dtlAdr }}
              </span>
            </li>
          </ul>
          <div class="column ml20 w80">
            <kw-avatar
              font-size="15px"
              color="line-bg"
              size="80px"
              squre
            >
              Wells
              <!--<img
                src="node_modules/kw-lib/src/assets/images/example_profile.png"
                alt="profile"
              >-->
            </kw-avatar>
          </div>
        </div>

        <div
          v-if="!isPreview"
          class="border-box mt20 mb20"
          style="width: 100%;height: 290px;"
        >
          <div
            class="w100"
            style="margin: 70px auto 0;"
          >
            <kw-btn
              icon="plus_24"
              style="font-size: 40px;"
              borderless
              @click="onClickPopup"
            >
              <span style="font-size: 18px;">
                {{ $t('MSG_BTN_BCD_RGST') }}
              </span>
            </kw-btn>
          </div>
        </div>

        <kw-form
          ref="frmMainRef"
          :cols="1"
          dense
        >
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_DSPH_NO')"
            >
              <kw-input
                v-model="frmMainData.cellphone"
                disable
              />
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_RECP_USR')"
              required
            >
              <kw-input
                v-model.trim="frmMainData.fnm"
                :label="$t('MSG_TXT_RECP_USR')"
                rules="required"
              />
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_RECP_NO')"
              required
            >
              <zwcm-telephone-number
                v-model:tel-no1="frmMainData.cralLocaraTno"
                v-model:tel-no2="frmMainData.mexnoEncr"
                v-model:tel-no3="frmMainData.cralIdvTno"
                :label="$t('MSG_TXT_RECP_NO')"
                required
              />
              <kw-btn
                icon="search"
                style="font-size: 20px;"
                borderless
                class="ml15"
                @click="onClickContactPlace"
              />
              <kw-btn
                icon="plus"
                style="font-size: 20px;"
                borderless
                class="ml10"
                @click="onClickAdd"
              />
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item>
              <ul class="mt5">
                <li
                  v-for="(item, idx) in cellPhones"
                  :key="idx"
                  class="pb15"
                >
                  {{ item.fnm }} : {{ item.phoneText }}
                  <kw-btn
                    icon="clear"
                    style="font-size: 15px;"
                    borderless
                    class="ml5"
                    @click="onClicDeleteKey(idx)"
                  />
                </li>
              </ul>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_MSG')"
            >
              <kw-input
                v-model="frmMainData.taskContents"
                type="textarea"
                :rows="10"
                counter
                readonly
                autogrow
              />
            </kw-form-item>
          </kw-form-row>
        </kw-form>
        <div class="text-right mt20">
          <kw-btn
            :label="$t('MSG_BTN_BCD_FW')"
            primary
            @click="onClicSend()"
          />
        </div>
      </div>
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useGlobal, useMeta, getComponentType, useDataService } from 'kw-lib';
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';

const { notify, alert } = useGlobal();
const dataService = useDataService();
const { modal } = useGlobal();
const { getUserInfo } = useMeta();
const { cellphone, userName } = getUserInfo();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const frmMainRef = ref(getComponentType('KwForm'));
const cellPhones = ref([]);
const isPreview = ref(false);
const frmMainData = ref({
  cellphone,
  cralIdvTno: '',
  cralLocaraTno: '010',
  mexnoEncr: '',
  fnm: '',
  taskContents: '',
});

let htmlText = '';
htmlText += '[교원Wells] {수신자} 고객님 안녕하세요\n';
htmlText += `교원 웰스 ${userName} 입니다.\n`;
htmlText += '담당자 명함 보기 : https://wsm.kyowon.co.kr/{명함주소}\n';
htmlText += '\n';
htmlText += '제품 및 서비스 등 궁금하거나 불편한 사항이 있으실 경우\n';
htmlText += '언제든지 연락 주시면 즉시 처리해 드리겠습니다.\n';
htmlText += `담당자 연락처 : ${cellphone}\n`;
htmlText += '\n';
htmlText += '고객님 가족 모두의 건강한 생활을 약속합니다.\n';
htmlText += '교원 웰스 공식 홈페이지 : https://wsm.kyowon.co.kr\n';

frmMainData.value.taskContents = htmlText;

async function onClickAdd() {
  if (await frmMainRef.value.alertIfIsNotModified()) { return; }
  if (!await frmMainRef.value.validate()) { return; }

  const data = {
    fnm: frmMainData.value.fnm,
    phoneText: `${frmMainData.value.cralLocaraTno}-${frmMainData.value.mexnoEncr}-${frmMainData.value.cralIdvTno}`,
    phone: `${frmMainData.value.cralLocaraTno}${frmMainData.value.mexnoEncr}${frmMainData.value.cralIdvTno}`,
    cellphone,
  };
  cellPhones.value.push(data);
  await frmMainRef.value.reset();
  frmMainData.value.cralLocaraTno = '010';
}

async function onClicDeleteKey(idx) {
  cellPhones.value.splice(idx, 1);
}

async function onClickContactPlace() {
  const { result, payload } = await modal({
    component: 'WwpsfBusinessCardForwardingListP',
    componentProps: { },
  });

  if (result) {
    payload.forEach((v) => {
      const { cralLocaraTno, mexnoEncr, cralIdvTno, fnm } = v;
      const data = {
        fnm,
        phoneText: `${cralLocaraTno}-${mexnoEncr}-${cralIdvTno}`,
        phone: `${cralLocaraTno}${mexnoEncr}${cralIdvTno}`,
        cellphone,
      };
      cellPhones.value.push(data);
    });
  }
}

async function onClicSend() {
  if (cellPhones.value.length === 0) {
    alert(t('MSG_ALT_RCV_NO'));
    return;
  }

  const data = cellPhones.value;
  await dataService.put('/sms/wells/competence/business/partner/contact-base', data);
  notify(t('MSG_ALT_SEND'));
}

const searchParams = ref({
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
  basAdr: '', /* 기본주소 */
  dtlAdr: '', /* 상세주소 */
  adrId: '',
  faxLocaraTno: '',
  faxExno: '',
  faxIdvTno: '',
  emadr: '',
  ctplcApnImgFileId: '',
  realFpath: '',
  fileNm: '',

});

const onClickSearch = async () => {
  const res = await dataService.get('/sms/wells/competence/business/partner/contact-base');
  Object.assign(searchParams.value, res.data);
  if (res.data.inMode === 'up') {
    isPreview.value = true;
  }
};

async function onClickPopup() {
  const res = await modal({
    component: 'WwpsfBusinessCardForwardingRegP',
    componentProps: { },
  });

  if (res.result) {
    await onClickSearch();
  }
}

onMounted(async () => {
  await frmMainRef.value.init();
  await onClickSearch();
});

</script>
<style scoped></style>
