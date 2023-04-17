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
    size="sm"
  >
    <kw-form :cols="1">
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_BIL_RCPT_FNM')"
          required
        >
          <kw-input
            v-model="saveParams.claimNm"
            icon="search"
            clearable
            rules="required"
            @click-icon="onClickClaimantName"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
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
            :regex="/^[0-9]*$/i"
          />
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CARD_PSR')"
          required
        >
          <kw-input
            v-model="saveParams.cardPsrNm"
            :label="$t('MSG_TXT_CARD_PSR')"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CONTACT')"
          required
        >
          <kw-input
            v-model="saveParams.contact"
            :label="$t('MSG_TXT_CONTACT')"
            rules="required"
            :regex="/^[0-9]*$/i"
            :maxlength="11"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_APPL_DATE')"
          required
        >
          <kw-date-picker
            v-model="saveParams.aplcDt"
            type="date"
            rules="required"
            :label="$t('MSG_TXT_APPL_DATE')"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_SRCP_APN')"
          required
          :hint="$t('MSG_TXT_PLEA_CONTA_RECE_CLEA_SUPP_PLE_CONTA_CH_APP_REC')"
        >
          <zwcm-file-attacher
            ref="attachFileRef"
            v-model="attachFiles"
            attach-group-id="ATG_DCD_CLING_COST_MGT"
            :attach-document-id="saveParams.clingCostAdjRcpNo"
            rules="required"
            :label="$t('MSG_TXT_SRCP_APN')"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <kw-btn
        primary
        :label="$t('MSG_BTN_APPL')"
        @click="onClickApplication"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal, useModal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
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
const props = defineProps({
  clingCostAdjRcpNo: {
    type: String,
    default: null,
  },
});

const { userName } = store.getters['meta/getUserInfo'];
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
  claimNm: userName, // 청구인
  cardPsrNm: userName, // 카드소유주명
  contact: '', // 연락처
  aplcDt: dayjs().format('YYYYMMDD'), // 신청일
  clingCostSignApnFileId: '',
  attachFiles: [],
});

const buildingCodes = ref([]);
async function buildingCode() {
  const res = await dataService.get('/sms/wells/closing/expense/cleaning-cost/request-cleaning-supplies/code');
  buildingCodes.value = res.data;
}

async function onClickClaimantName() {
  const { result } = await modal({
    component: 'ZwogzPartnerListP', // Z-OG-U-0050P01
    componentProps: {
      configGroup: '',
    },
  });
  if (result) {

    // 선택한 지역단장 조직유형코드, 지역단장 파트너번호, 지역단장명 set 해야함
  }
}

async function onClickApplication() {
  if (!await saveParams.value.validate()) { return; }
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
    const res = await dataService.get('/sms/wells/closing/expense/cleaning-cost/request-cleaning-supplies', { params: dataParams });
    saveParams.value = res.data;
  }
}

onMounted(async () => {
  await buildingCode();
  await fetchData();
});
</script>
