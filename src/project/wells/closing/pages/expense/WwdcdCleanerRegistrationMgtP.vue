<!----
****************************************************************************************************
1. 모듈 : DCD
2. 프로그램 ID : WwdcdCleanerRegistrationMgtP - 청소원 관리 - 청소원 등록(신규변경) / W-CL-U-0093P02
3. 작성자 : gs.piit172 kim juhyun
4. 작성일 : 2023.04.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 청소원 관리 - 청소원 등록(신규변경)
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <kw-form
      ref="saveRef"
      cols="2"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_DIV')"
          required
        >
          <kw-option-group
            v-model="saveParams.flag"
            rules="required"
            type="radio"
            :options="[{codeId:'0', codeName:t('MSG_TXT_NEW'), disable: newReg},
                       {codeId:'1', codeName:t('MSG_TXT_CH'), disable: chReg} ]"
            :label="$t('MSG_TXT_DIV')"
            @change="onChangeFlag"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_APPL_USER')"
          required
        >
          <kw-input
            v-model="saveParams.aplcnsNm"
            :label="$t('MSG_TXT_APPL_USER')"
            rules="required"
            :disable="isDisableAplcnsNm"
            :maxlength="16"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_APPL_DATE')"
          required
        >
          <kw-date-picker
            v-model="saveParams.aplcDt"
            :label="$t('MSG_TXT_APPL_DATE')"
            rules="required"
            :disable="isDisableAplcDt"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_BLD_NM')"
          rules="required"
        >
          <kw-select
            v-model="saveParams.bldCd"
            :options="buildingCodes"
            option-value="bldCd"
            option-label="bldNm"
            :label="$t('MSG_TXT_BLD_NM')"
            :disable="isDisableBldCd"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-separator />
      <ul class="kw-notification">
        <li>
          <span class="kw-fc--primary">{{ t('MSG_TXT_FOR_EMPL_WORK_SALES_DEPA_CANN_REG_CLEA') }}</span>
        </li>
      </ul>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CLINR_FNM')"
          required
        >
          <kw-input
            v-model="saveParams.clinrNm"
            :label="$t('MSG_TXT_CLINR_FNM')"
            rules="required"
            :maxlength="16"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_RRNO')"
          required
        >
          <kw-input
            v-model="saveParams.bryyMmdd"
            :label="$t('MSG_TXT_RRNO')"
            rules="required"
            :regex="/^[0-9]*$/i"
            :maxlength="6"
          />
          <span>-</span>
          <kw-input
            v-model="saveParams.rrnoEncr"
            :label="$t('MSG_TXT_RRNO')"
            rules="required"
            :regex="/^[0-9]*$/i"
            :maxlength="7"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_WRK_STRT_D')"
          required
        >
          <kw-date-picker
            v-model="saveParams.wrkStrtdt"
            :label="$t('MSG_TXT_WRK_STRT_D')"
            rules="required"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_WRK_END_D')"
          required
        >
          <kw-date-picker
            v-model="saveParams.wrkEnddt"
            :label="$t('MSG_TXT_WRK_END_D')"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_FEE_DSB_WON')"
          required
        >
          <!--청소원고정금액-->
          {{ t('MSG_TXT_FXN_SAL') }}
          <kw-input
            v-model="saveParams.clinrFxnAmt"
            class="ml8"
            rules="required"
            mask="number"
            :label="$t('MSG_TXT_FEE_DSB_WON')"
            :regex="/^[0-9]*$/i"
            :maxlength="20"
            @blur="onBlurFixationAmount"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_TAX_DDTN_WON')"
          :hint="$t('MSG_TXT_MSG_TXT_FXN_SAL_3_X_3')"
        >
          <!--세금공제금액-->
          <kw-input
            v-model="saveParams.taxDdctam"
            :disable="true"
            mask="number"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_ACL_DSB_AMT_WON')"
        >
          <!--실지급액(원)-->
          <kw-input
            v-model="saveParams.dsbAmt"
            :disable="true"
            mask="number"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_RRGT_ADRR')"
          required
        >
          <zwcm-post-code
            v-model:zipCode="saveParams.zip"
            v-model:add1="saveParams.basAdr"
            v-model:add2="saveParams.dtlAdr"
            v-model:addKey="saveParams.adrId"
            :label="$t('MSG_TXT_RRGT_ADRR')"
            class="kw-grow"
            required
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_CONTACT')"
          required
        >
          <zwcm-telephone-number
            v-model:tel-no1="
              saveParams.locaraTno"
            v-model:tel-no2="
              saveParams.exnoEncr"
            v-model:tel-no3="
              saveParams.idvTno"
            :label="$t('MSG_TXT_CONTACT')"
            required
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_IDF_CY_RGST')"
          required
        >
          <zwcm-file-attacher
            ref="attachFileRef1"
            v-model="attachFiles1"
            :label="$t('MSG_TXT_IDF_CY_RGST')"
            attach-group-id="ATG_DCD_CLING_COST"
            :attach-document-id="saveParams.idfApnFileId"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_AC_NO')"
          required
        >
          <kw-select
            v-model="saveParams.bnkCd"
            :label="$t('MSG_TXT_AC_NO')"
            rules="required"
            :options="codes.BNK_CD"
          />
          <kw-input
            v-model="saveParams.acnoEncr"
            :label="$t('MSG_TXT_AC_NO')"
            rules="required"
            :regex="/^[0-9]*$/i"
            :maxlength="200"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_BNKB_CY_RGST')"
          required
        >
          <zwcm-file-attacher
            ref="attachFileRef2"
            v-model="attachFiles2"
            :label="$t('MSG_TXT_BNKB_CY_RGST')"
            attach-group-id="ATG_DCD_CLING_COST"
            :attach-document-id="saveParams.bnkbApnFileId"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CNTRW_APN')"
          :colspan="2"
          required
        >
          <zwcm-file-attacher
            ref="attachFileRef3"
            v-model="attachFiles3"
            :label="$t('MSG_TXT_CNTRW_APN')"
            attach-group-id="ATG_DCD_CLING_COST"
            :attach-document-id="saveParams.cntrwApnFileId"
            rules="required"
          />
          <kw-btn
            v-permission:download
            icon="download_off"
            class="ml10"
            secondary
            :label="$t('MSG_BTN_TEMP_DOWN')"
            @click="onClickContractDocumentFormat"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CNTR_RSG_ONE_APN')"
          :colspan="2"
        >
          <zwcm-file-attacher
            ref="attachFileRef4"
            v-model="attachFiles4"
            :label="$t('MSG_TXT_CNTR_RSG_ONE_APN')"
            attach-group-id="ATG_DCD_CLING_COST"
            :attach-document-id="saveParams.cntrLroreApnFileId"
          />
          <kw-btn
            v-permission:download
            icon="download_off"
            class="ml10"
            secondary
            :label="$t('MSG_BTN_TEMP_DOWN')"
            @click="ContractDocumentResignFormat"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <kw-btn
        v-permission:create
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
import { useDataService, useGlobal, useModal, codeUtil, getComponentType, useMeta } from 'kw-lib';
import ZwcmPostCode from '~common/components/ZwcmPostCode.vue';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';
import ZwcmFileAttacher from '~common/components/ZwcmFileAttacher.vue';

import useCmFile from '~common/composables/useCmFile';

const { notify, confirm } = useGlobal();
const userInfo = useMeta().getUserInfo();
const dataService = useDataService();

const { ok } = useModal();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let dataParams;
const attachFiles1 = ref([]);
const attachFiles2 = ref([]);
const attachFiles3 = ref([]);
const attachFiles4 = ref([]);
const isDisableAplcnsNm = ref(false);
const isDisableAplcDt = ref(false);
const isDisableBldCd = ref(false);
const newReg = ref(false);
const chReg = ref(false);
const store = useStore();
// const saveRef = ref();
const codes = await codeUtil.getMultiCodes(
  'BNK_CD', // 은행코드
);
const saveRef = ref(getComponentType('KwForm'));
const props = defineProps({
  clinrRgno: {
    type: String,
    default: null,
  },
  aplcPrtnrNo: {
    type: String,
    default: null,
  },
});

const saveParams = ref({
  flag: '0',
  clinrRgno: '', // 청소원등록번호
  rcpYm: '', // 접수년월
  bldCd: '', // 빌딩코드
  aplcDt: dayjs().format('YYYYMMDD'), // 신청일자
  aplcnsNm: '', // 신청자 명
  clinrFxnAmt: '', // 청소원고정금액
  taxDdctam: '', // 세금공제금액
  dsbAmt: '', // clinrFxnAmt - taxDdctam (실지급 금액)
  clinrNm: '', // 청소원 명
  wrkStrtdt: dayjs().format('YYYYMMDD'), // 근무시작일자
  wrkEnddt: `${dayjs().format('YYYY')}1230`, // 근무종료일자
  bryyMmdd: '', // 생년월일
  rrnoEncr: '', // 주민번호 전체
  locaraTno: '', // 지역번호
  exnoEncr: '', // 전화국별
  idvTno: '', // 개별전화번호
  zip: '', // 우편번호
  basAdr: '', // 기본주소
  dtlAdr: '', // 상세주소
  bnkCd: '', // 은행코드
  acnoEncr: '', // 계좌번호
  attachFiles1: [], // 신분증첨부파일
  attachFiles2: [], // 통장사본 첨부파일
  attachFiles3: [], // 계약서첨부파일
  attachFiles4: [], // 계약해지 첨부파일
  fnlMdfcDtm: '',
  idfApnFileId: '', // 신분증첨부파일
  bnkbApnFileId: '', // 통장사본 첨부파일
  cntrwApnFileId: '', // 계약서첨부파일
  cntrLroreApnFileId: '', // 계약해지 첨부파일
});

const { ogTpCd } = store.getters['meta/getUserInfo'];

const buildingCodes = ref([]);
async function buildingCode() {
  const { clinrRgno, aplcPrtnrNo } = props;
  const registYearMonth = saveParams.value.aplcDt.replace('-', '').substring(0, 6);
  let sessionParams = {};
  if (!isEmpty(clinrRgno)) {
    sessionParams = { ogTpCd, prtnrNo: aplcPrtnrNo, registYearMonth };
  } else {
    sessionParams = { ogTpCd, registYearMonth };
  }

  const res = await dataService.get('/sms/wells/closing/expense/cleaners/cleaners-reqeust-change/code', { params: sessionParams });
  buildingCodes.value = res.data;

  if (buildingCodes.value.length === 1) {
    saveParams.value.bldCd = buildingCodes.value[0].bldCd;
  }
}

async function fetchData() {
  const { clinrRgno } = props;

  if (!isEmpty(clinrRgno)) {
    dataParams = { clinrRgno: cloneDeep(clinrRgno) };
    const res = await dataService.get(`/sms/wells/closing/expense/cleaners/cleaners-reqeust-change/${clinrRgno}`, { params: dataParams });
    saveParams.value = res.data;
    saveParams.value.flag = '1';

    isDisableAplcnsNm.value = true;
    isDisableAplcDt.value = true;
    isDisableBldCd.value = true;
    newReg.value = true;
  } else {
    saveParams.value.flag = '0';
    saveParams.value.aplcnsNm = userInfo.userName;
    chReg.value = true;
  }
}

async function onClickSave() {
  if (await saveRef.value.alertIfIsNotModified()) { return; }
  if (!await saveRef.value.validate()) { return; }
  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }

  saveParams.value.attachFiles1 = attachFiles1.value;
  saveParams.value.attachFiles2 = attachFiles2.value;
  saveParams.value.attachFiles3 = attachFiles3.value;
  saveParams.value.attachFiles4 = attachFiles4.value;
  const data = saveParams.value;

  await dataService.post('/sms/wells/closing/expense/cleaners/cleaners-reqeust-change', data);

  notify(t('MSG_ALT_SAVE_DATA'));

  ok();
}

const { getStandardFormFile } = useCmFile();
async function onClickContractDocumentFormat() {
  // FOM_CNTRW_APN
  getStandardFormFile('FOM_CNTRW_APN');
}

async function ContractDocumentResignFormat() {
  // FOM_CNTR_LRORE_APN
  getStandardFormFile('FOM_CNTR_LRORE_APN');
}

async function onBlurFixationAmount() {
  const { clinrFxnAmt } = saveParams.value;
  const taxDdctam = Math.floor(clinrFxnAmt * 0.033);

  saveParams.value.taxDdctam = taxDdctam;
  saveParams.value.dsbAmt = clinrFxnAmt - taxDdctam;
}

async function onChangeFlag() {
  const { flag } = saveParams.value;

  if (flag === '0') {
    // if (!await confirm(t('MSG_ALT_WANT_RESET')))
  }
}

onMounted(async () => {
  await buildingCode();
  await fetchData();
});

</script>
