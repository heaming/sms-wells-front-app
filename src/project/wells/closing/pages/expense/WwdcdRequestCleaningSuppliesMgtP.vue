<!----
****************************************************************************************************
1. 모듈 : DCD
2. 프로그램 ID : WwdcdRequestCleaningSuppliesMgtP - 청소 용품비 관리 - 청소(용품)비 신청 / W-CL-U-0093P01
3. 작성자 : gs.piit172 kim juhyun
4. 작성일 : 2023.04.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 청소 용품비 관리 - 청소(용품)비 신청
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
  >
    <kw-form
      ref="frmSaveRef"
      :cols="2"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_BIL_RCPT_FNM')"
          required
        >
          <kw-input
            v-model="saveParams.claimNm"
            :label="$t('MSG_TXT_BIL_RCPT_FNM')"
            icon="search"
            clearable
            rules="required"
            :disable="isDisable"
            @click-icon="onClickClaimantName"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_BUILDING')"
          required
        >
          <kw-select
            v-model="saveParams.bldCd"
            :options="buildingCodes"
            option-value="bldCd"
            option-label="bldNm"
            rules="required"
            :disable="isDisable"
            :label="$t('MSG_TXT_BUILDING')"
          />
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_AMT')"
          required
        >
          <kw-input
            v-model="saveParams.bilAmt"
            :label="$t('MSG_TXT_AMT')"
            rules="required"
            mask="number"
            :disable="isDisable"
          />
        </kw-form-item>

        <kw-form-item
          :label="$t('MSG_TXT_CARD_PSR')"
          required
        >
          <kw-input
            v-model="saveParams.cardPsrNm"
            :label="$t('MSG_TXT_CARD_PSR')"
            rules="required"
            :disable="isDisable"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
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
            :disable="isDisable"
            required
          />
        </kw-form-item>

        <kw-form-item
          :label="$t('MSG_TXT_APPL_DATE')"
          required
        >
          <kw-date-picker
            v-model="saveParams.aplcDt"
            type="date"
            rules="required"
            :label="$t('MSG_TXT_APPL_DATE')"
            :disable="isDisable"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_SRCP_APN')"
          required
          :hint="$t('MSG_TXT_PLEA_CONTA_RECE_CLEA_SUPP_PLE_CONTA_CH_APP_REC')"
          colspan="2"
        >
          <zwcm-file-attacher
            ref="attachFileRef"
            v-model="attachFiles"
            attach-group-id="ATG_DCD_CLING_COST"
            :attach-document-id="saveParams.clingCostSrcpApnFileId"
            rules="required"
            :label="$t('MSG_TXT_SRCP_APN')"
            :readonly="isDisable"
            downloadable
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <kw-btn
        primary
        :label="$t('MSG_BTN_APPL')"
        :disable="isApplication"
        @click="onClickApplication"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal, useModal, getComponentType, alert } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';
import ZwcmFileAttacher from '~common/components/ZwcmFileAttacher.vue';

const { modal, notify, confirm } = useGlobal();
const dataService = useDataService();
const store = useStore();
const { t } = useI18n();
const { ok } = useModal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let dataParams;
const attachFiles = ref([]);
const isApplication = ref(false);
const isDisable = ref(false);
const props = defineProps({
  clingCostAdjRcpNo: {
    type: String,
    default: null,
  },
});

const frmSaveRef = ref(getComponentType('KwForm'));
const { userName, ogTpCd, employeeIDNumber, careerLevelCode } = store.getters['meta/getUserInfo'];
// 본사 영업관리자, 본사담당자 - 청구(영수)인 성명, 카드소유주
// -돋보기 클릭하여 [Z-OG-U-0050P01] 팝업창 호출하여 리턴 값으로 세팅 : 지역단장 조직유형코드, 지역단장 파트너번호, 지역단장명
// - 청구(영수)인 성명 : 지역단장명
// - 카드소유주 : 지역단장명

// 지역단장 - cardPsrNm, claimNm 세션

// TODO. 지역단당, 본사 영업관리자, 본사 담당자 구분자가 필요
const saveParams = ref({
  clingCostAdjRcpNo: '',
  bldCd: '', // 빌딩코드
  bilAmt: '', // 금액
  claimNm: careerLevelCode === '2' ? userName : '', // 청구인
  cardPsrNm: careerLevelCode === '2' ? userName : '', // 카드소유주명
  locaraTno: '', // 지역번호
  exnoEncr: '', // 전화국별
  idvTno: '', // 개별전화번호
  aplcDt: dayjs().format('YYYYMMDD'), // 신청일
  clingCostSignApnFileId: '',
  attachFiles: [],
  ogTpCd: '', // 빌딩코드를 조회하기 위한
  prtnrNo: '', // 빌딩코드를 조회하기 위한
  claimPrtnrNo: '',
});

const buildingCodes = ref([]);
async function buildingCode() {
  let sessionParams = {};
  if (careerLevelCode === '4') { // 지역단장
    sessionParams = { ogTpCd, prtnrNo: employeeIDNumber };
  } else {
    sessionParams.ogTpCd = saveParams.value.ogTpCd;
    sessionParams.prtnrNo = saveParams.value.prtnrNo;
  }
  const res = await dataService.get('/sms/wells/closing/expense/cleaning-cost/request-cleaning-supplies/code', { params: sessionParams });
  buildingCodes.value = res.data;

  if (buildingCodes.value.length === 1) {
    saveParams.value.bldCd = buildingCodes.value[0].bldCd;
  }
}

async function onClickClaimantName() {
  const { clingCostAdjRcpNo } = props;
  let searchRsbDvCdParams = {};
  if (isEmpty(clingCostAdjRcpNo)) {
    const { result, payload } = await modal({
      component: 'ZwogzPartnerListP', // Z-OG-U-0050P01
      componentProps: {
        prtnrNo: saveParams.value.prtnrNo,
      },
    });
    if (result) {
      searchRsbDvCdParams = { ogTpCd: payload.ogTpCd, prtnrNo: payload.prtnrNo };
      const res = await dataService.get('/sms/wells/closing/expense/cleaning-cost/request-cleaning-supplies/rsbDvcd', { params: searchRsbDvCdParams });
      if (res.data.rsbDvCd !== 'W0103' && res.data.rsbDvCd !== 'W0203') {
        await alert(t('MSG_ALT_RSB_LCMGR_APLC_PSB')); // 직책이 지역단장만 신청 가능합니다.
        saveParams.value.prtnrNo = undefined;
        buildingCodes.value = [];
        frmSaveRef.value.reset();
      } else {
        saveParams.value.claimNm = payload.prtnrKnm;
        saveParams.value.cardPsrNm = payload.prtnrKnm;
        saveParams.value.prtnrNo = payload.prtnrNo;
        saveParams.value.ogTpCd = payload.ogTpCd;
        saveParams.value.claimPrtnrNo = payload.prtnrNo;
        // 선택한 지역단장 조직유형코드, 지역단장 파트너번호, 지역단장명 set 해야함
        buildingCode();
      }
    }
  }
}

async function onClickApplication() {
  if (await frmSaveRef.value.alertIfIsNotModified()) { return; }
  if (!await frmSaveRef.value.validate()) { return; }
  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }

  saveParams.value.attachFiles = attachFiles.value;
  const data = saveParams.value;
  await dataService.post('/sms/wells/closing/expense/cleaning-cost/request-cleaning-supplies', data);

  notify(t('MSG_ALT_SAVE_DATA'));

  ok();
}

async function fetchData() {
  const { clingCostAdjRcpNo } = props;

  if (!isEmpty(clingCostAdjRcpNo)) {
    dataParams = { clingCostAdjRcpNo: cloneDeep(clingCostAdjRcpNo) };
    const res = await dataService.get(`/sms/wells/closing/expense/cleaning-cost/request-cleaning-supplies/${clingCostAdjRcpNo}`, { params: dataParams });
    saveParams.value = res.data;
    isApplication.value = true;
    isDisable.value = true;

    await buildingCode();
  }
}

onMounted(async () => {
  await fetchData();
  const sessionInfo = store.getters['meta/getUserInfo'];
  if (['W01', 'W02'].includes(sessionInfo.ogTpCd) && sessionInfo.careerLevelCode === '4') { // 웰스의 지역단장일 경우
    saveParams.value.prtnrNo = sessionInfo.employeeIDNumber;
    onClickClaimantName();
  }
});
</script>
