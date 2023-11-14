<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : [CTA] 통합계약서 작성 Step1
2. 프로그램 ID : WwctaContractRegistrationMgtMStep1
3. 작성자 : gs.piit159
4. 작성일 : 2023.05.19
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 통합계약서 작성 Step1
****************************************************************************************************
--->
<template>
  <kw-scroll-area
    visible
    scroll-style="padding-right: 40px;"
  >
    <ul
      v-if="!isReadonly"
      class="kw-state-list kw-state-list--second-line col pt20"
    >
      <li
        v-if="ableToReStipulation"
        class="kw-state-list__item"
      >
        <!-- 재약정대상 -->
        <p class="kw-state-list__top">
          {{ t('MSG_TXT_RSTL') }}{{ t('MSG_TXT_OBJ') }}
        </p>
        <p class="kw-state-list__num">
          <a
            href="javascript:void(0);"
            class="kw-state-list__under-line"
            @click="onClickReStipulation()"
          >{{ dashboardCounts.restipulationCnt }}</a>
          <span class="kw-state-list__unit">{{ t('MSG_TIT_CNT') }}</span>
        </p>
      </li>
      <li
        v-if="ableToMembership"
        class="kw-state-list__item"
      >
        <!-- 멤버십대상 -->
        <p class="kw-state-list__top">
          {{ t('MSG_TXT_MEMBERSHIP') }}{{ t('MSG_TXT_OBJ') }}
        </p>
        <p class="kw-state-list__num">
          <a
            href="javascript:void(0);"
            class="kw-state-list__under-line"
            @click="onClickMembership()"
          >{{ dashboardCounts.membershipCnt }}</a>
          <span class="kw-state-list__unit">{{ t('MSG_TIT_CNT') }}</span>
        </p>
      </li>
    </ul>
    <kw-search
      :cols="3"
      :disable="isReadonly || cntrTpIs.quot"
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_CONTR_TYPE')"
          required
        >
          <kw-select
            v-model="searchParams.cntrTpCd"
            :label="$t('MSG_TXT_CONTR_TYPE')"
            :options="codes.CNTR_TP_CD"
            rules="required"
            :disable="isReadonly"
            @change="onChangeCntrTpCd"
          />
        </kw-search-item>
        <kw-search-item
          v-if="popupRequiredCstInfos"
          :label="$t('MSG_TXT_CNTRT_TP')"
          required
        >
          <kw-select
            v-model="searchParams.copnDvCd"
            :label="$t('MSG_TXT_CNTRT_TP')"
            :options="codes.COPN_DV_CD"
            rules="required"
            :disable="cntrTpIs.indv || cntrTpIs.crp || isReadonly"
          />
        </kw-search-item>
        <kw-search-item
          v-if="popupRequiredCstInfos && searchParams.copnDvCd === '1'"
          :label="cstKnmLabel"
          required
        >
          <kw-input
            v-model="searchParams.cstKnm"
            :label="cstKnmLabel"
            maxlength="50"
            rules="required"
            :disable="isReadonly"
          />
        </kw-search-item>
        <kw-search-item
          v-if="popupRequiredCstInfos && searchParams.copnDvCd === '2'"
          :label="$t('MSG_TXT_CRNO')"
          required
        >
          <kw-input
            v-model="searchParams.bzrno"
            :label="$t('MSG_TXT_CRNO')"
            rules="required"
            maxlength="10"
            :disable="isReadonly"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row
        v-if="popupRequiredCstInfos"
      >
        <kw-search-item
          v-if="searchParams.copnDvCd === '2'"
          :label="cstKnmLabel"
        >
          <kw-input
            v-model="searchParams.cstKnm"
            :label="cstKnmLabel"
            maxlength="50"
            :disable="isReadonly"
          />
        </kw-search-item>
        <kw-search-item
          v-if="searchParams.copnDvCd === '1'"
          :label="$t('MSG_TXT_MPNO')"
          required
        >
          <kw-input
            v-model:model-value="searchParams.cntrtTno"
            v-model:telNo0="searchParams.cralLocaraTno"
            v-model:telNo1="searchParams.mexnoEncr"
            v-model:telNo2="searchParams.cralIdvTno"
            :label="$t('MSG_TXT_MPNO')"
            mask="telephone"
            :unmasked-value="false"
            rules="required"
            :disable="isReadonly"
          />
        </kw-search-item>
        <!-- 제휴파트너구분 -->
        <kw-search-item
          v-if="cntrTpIs.ensm"
          :label="$t('MSG_TXT_ALNC_PRTNR_DV')"
        >
          <kw-select
            v-model="searchParams.alncPrtnrDvCd"
            :label="$t('MSG_TXT_ALNC_PRTNR_DV')"
            :options="codes.BYR_DV_CD"
            first-option=""
            :disable="isReadonly"
            @change="onChangeAlncPrtnrDv"
          />
        </kw-search-item>
        <!-- 제휴사 -->
        <kw-search-item
          v-if="searchParams.alncPrtnrDvCd === '90' && cntrTpIs.ensm"
          :label="$t('MSG_TXT_ALLIANCE_COMP')"
        >
          <kw-select
            v-model="searchParams.alncPrtnrComp"
            :label="$t('MSG_TXT_ALLIANCE_COMP')"
            :options="codes.ALNCMP_EMP_PRCHS_ALNC_BZS_ACD"
            first-option=""
            :disable="isReadonly"
            @change="onChangeAlncPrtnrComp"
          />
        </kw-search-item>
        <!-- 제휴파트너사번 -->
        <kw-search-item
          v-if="searchParams.alncPrtnrDvCd !== '90' && cntrTpIs.ensm"
          :label="$t('MSG_TXT_ALNC_PRTNR_NO')"
        >
          <kw-input
            v-model="searchParams.alncPrtnrNo"
            :label="$t('MSG_TXT_ALNC_PRTNR_NO')"
            maxlength="10"
            :disable="isReadonly"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row
        v-if="popupRequiredCstInfos && cntrTpIs.ensm"
      >
        <!-- 제휴파트너사번 : 제휴사 -->
        <kw-search-item
          v-if="searchParams.alncPrtnrDvCd === '90' && cntrTpIs.ensm"
          :label="$t('MSG_TXT_ALNC_PRTNR_NO')"
        >
          <kw-input
            v-model="searchParams.alncPrtnrNo"
            :label="$t('MSG_TXT_ALNC_PRTNR_NO')"
            maxlength="10"
            :disable="isReadonly"
          />
        </kw-search-item>
        <!-- 제휴파트너명 -->
        <kw-search-item
          :label="$t('MSG_TXT_ALNC_PRTNR_NM')"
        >
          <kw-input
            v-model="searchParams.alncPrtnrNm"
            :label="$t('MSG_TXT_ALNC_PRTNR_NM')"
            maxlength="10"
            :disable="isReadonly"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <template
      v-if="cntrTpIs.quot"
    >
      <h3>{{ $t('MSG_TXT_CNTRT_INF') }} - {{ $t('MSG_TXT_QUOT') }}</h3>
      <kw-form
        :cols="2"
      >
        <kw-form-row>
          <kw-form-item :label="$t('MSG_TXT_DIV')">
            <kw-option-group
              v-model="searchParams.copnDvCd"
              type="radio"
              :options="codes.COPN_DV_CD.reverse()"
            />
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_CNTOR_NM')"
            hint="상호명(법인)과 성명(개인)이 들어갑니다."
          >
            <kw-input
              v-model="searchParams.cstKnm"
              :label="$t('MSG_TXT_CNTOR_NM')"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
    </template>
    <template
      v-if="step1.cntrt?.cstNo"
    >
      <!--계약자 정보-->
      <h3>
        {{ t('MSG_TXT_CNTRT_INF') }}
        <kw-btn
          v-if="searchParams.copnDvCd === '1'"
          v-permission:update
          icon-right="write_24"
          dense
          borderless
          label="정보수정"
          align="right"
          class="kw-fc--black3 kw-font-pt14 ml60"
          @click="onClickSendUrlMsg('05')"
        />
      </h3>
      <kw-form
        :cols="2"
        dense
      >
        <template
          v-if="cntrTpIs.indv
            || cntrTpIs.ensm
            || (cntrTpIs.msh && searchParams.copnDvCd === '1')
            || (cntrTpIs.rstl && searchParams.copnDvCd === '1')"
        >
          <kw-form-row
            v-if="searchParams.copnDvCd === '1'"
          >
            <!-- 개인 -->
            <kw-form-item
              :label="$t('MSG_TXT_CNTRT')"
            >
              <p>
                {{
                  `${step1.cntrt?.cstKnm} / ${
                    stringUtil.getDateFormat(step1.cntrt?.bryyMmdd)} / ${
                    getCodeName('SEX_DV_CD', step1.cntrt?.sexDvCd)}`
                }}
              </p>
            </kw-form-item>
            <kw-form-item
              label="본인인증 / 약관동의"
            >
              <p
                v-if="step1.cntrt?.cikVal"
              >
                {{ $t('MSG_TXT_IDENT_VERF_COMPL') }}
              </p>
              <kw-btn
                v-else
                dense
                :label="$t('MSG_TXT_SELF_AUTH_REQUIRED')"
                @click="onClickSendUrlMsg('01')"
              />
              <p>
                &nbsp;/&nbsp;
              </p>
              <p
                v-if="step1.cntrt?.itgCstNo"
              >
                약관동의완료
              </p>
              <p
                v-else
              >
                <kw-btn
                  dense
                  :label="$t('MSG_BTN_TERMS_AG_URL_TRS')"
                  @click="onClickSendUrlMsg('02')"
                />
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row
            v-if="searchParams.copnDvCd === '2'"
          >
            <!-- 법인 -->
            <kw-form-item
              :label="$t('MSG_TXT_CNTRT')"
            >
              <p>
                {{ `${step1.cntrt?.cstKnm} / ${step1.cntrt?.bzrno}` }}
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_CST_NO')"
            >
              <p>{{ step1.cntrt?.cstNo }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_MPNO')"
            >
              <p>
                {{ step1.cntrt?.cralLocaraTno }}-{{ step1.cntrt?.mexnoEncr }}-{{ step1.cntrt?.cralIdvTno }}
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_ADDR')"
            >
              <p>
                {{ step1.cntrt?.zip }}<br>
                {{ step1.cntrt?.adr }}<br>
                {{ step1.cntrt?.adrDtl }}
              </p>
            </kw-form-item>
          </kw-form-row>
        </template>
        <template
          v-if="cntrTpIs.crp
            || (cntrTpIs.msh && searchParams.copnDvCd === '2')
            || (cntrTpIs.rstl && searchParams.copnDvCd === '2')"
        >
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_CNTRT')"
            >
              <p>{{ step1.cntrt?.cstKnm }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_CRNO')"
            >
              <p>{{ step1.cntrt?.bzrno }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_CST_NO')"
            >
              <p>{{ step1.cntrt?.cstNo }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_MPNO')"
            >
              <p>
                {{ step1.cntrt?.cralLocaraTno }}-{{ step1.cntrt?.mexnoEncr }}-{{ step1.cntrt?.cralIdvTno }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_TEL_NO')"
            >
              <p>
                {{ step1.cntrt?.locaraTno }}-{{ step1.cntrt?.exnoEncr }}-{{ step1.cntrt?.idvTno }}
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_ADDR')"
            >
              <p>
                {{ step1.cntrt?.zip }}<br>
                {{ step1.cntrt?.adr }}<br>
                {{ step1.cntrt?.adrDtl }}
              </p>
            </kw-form-item>
          </kw-form-row>
        </template>

        <template
          v-if="(cntrTpIs.indv && '7' === currentPartner.pstnDvCd) || cntrTpIs.ensm"
        >
          <kw-separator />
          <h3>{{ $t('MSG_TXT_PRTNR_INF') }}</h3>

          <template
            v-if="cntrTpIs.indv"
          >
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_PTNR_NAME')"
              >
                <p>{{ step1.prtnr?.prtnrKnm }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_PRTNR_NUM')"
              >
                <p>{{ step1.prtnr?.prtnrNo }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_MANAGEMENT_DEPARTMENT')"
              >
                <p>{{ step1.prtnr?.dgr1LevlOgNm }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_RGNL_GRP')"
              >
                <p>{{ step1.prtnr?.dgr2LevlOgNm }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_BRANCH')"
              >
                <p>{{ step1.prtnr?.dgr3LevlOgNm }}</p>
              </kw-form-item>
            </kw-form-row>
          </template>
          <template
            v-else-if="cntrTpIs.ensm"
          >
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_PTNR_NAME')"
              >
                <p>{{ step1.prtnr?.prtnrKnm }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_PRTNR_NUM')"
              >
                <p>{{ step1.prtnr?.prtnrNo }}</p>
              </kw-form-item>
            </kw-form-row>
          </template>
        </template>
      </kw-form>
    </template>
  </kw-scroll-area>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { alert, stringUtil, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import { useCtCode } from '~sms-common/contract/composable';
import { CNTR_TP_CD, COPN_DV_CD } from '~sms-wells/contract/constants/ctConst';

const props = defineProps({
  contract: { type: Object, default: undefined },
  cntrCstNo: { type: String, default: undefined },
});
const emit = defineEmits([
  'activated',
]);

const exposed = {};
defineExpose(exposed);

const { t } = useI18n();
const { getters } = useStore();
const userInfo = getters['meta/getUserInfo'];
const currentPartner = {
  prtnrNo: userInfo.employeeIDNumber,
  ogTpCd: userInfo.ogTpCd,
  baseRleCd: userInfo.baseRleCd,
  pstnDvCd: userInfo.careerLevelCode,
  prtnrKnm: userInfo.userName,
};
const alncPartner = ref({
  prtnrNo: '',
  ogTpCd: '',
  prtnrKnm: '',
});
const dataService = useDataService();
const { notify, confirm, modal } = useGlobal();
const router = useRouter();

const { codes, getCodeName, addCode, getCode } = await useCtCode(
  'ALNC_PRTNR_DRM_DV_CD',
  'BYR_DV_CD',
  'ALNCMP_EMP_PRCHS_ALNC_BZS_ACD', // 제휴사 직원 구매 제휴 업체 앱코드
  'COPN_DV_CD',
  'SEX_DV_CD',
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const membershipCntrTpCd = '07';
const reStipulationCntrTpCd = '08';

let cntrNo;
let rstlCntrNo;
let rstlCntrSn;
let cntrTpCd;
let step1;
const ogStep1 = ref({});

function connectReactivity() {
  cntrNo = toRef(props.contract, 'cntrNo');
  rstlCntrNo = toRef(props.contract, 'rstlCntrNo');
  rstlCntrSn = toRef(props.contract, 'rstlCntrSn');
  cntrTpCd = toRef(props.contract, 'cntrTpCd');
  step1 = toRef(props.contract, 'step1', { bas: {} });
}

watch(() => props.contract, connectReactivity, { immediate: true });

const searchParams = ref({
  cntrNo: '',
  cntrTpCd: '',
  copnDvCd: '1',
  cstKnm: '',
  bzrno: '',
  cntrtTno: '',
  cralLocaraTno: '',
  mexnoEncr: '',
  cralIdvTno: '',
  alncPrtnrDvCd: '', // 제퓨파트너구분코드 for 임직원
  alncPrtnrNo: '', // 제퓨파트너번호
  alncPrtnrNm: '', // 제퓨파트너이름
  alncPrtnrOgTpCd: '', // 제퓨파트너 조직유형코드
  alncPrtnrComp: '', // 제퓨파트너 회사
});

async function setupAvailableCntrTpCd() {
  await addCode('CNTR_TP_CD', (code) => {
    const isCustomerCenterService = currentPartner.baseRleCd === 'W8010';
    const isBusinessDepartment = currentPartner.ogTpCd === 'HR1';
    const isBranchManager = currentPartner.pstnDvCd === '7';

    if (isBusinessDepartment && !isCustomerCenterService) {
      return code.codeId === CNTR_TP_CD.EMPLOYEE && code;
    }
    if (isBranchManager) {
      return [
        CNTR_TP_CD.INDIVIDUAL,
        CNTR_TP_CD.COOPERATION,
      ].includes(code.codeId) && code;
    }
    return [
      CNTR_TP_CD.INDIVIDUAL,
      CNTR_TP_CD.COOPERATION,
      CNTR_TP_CD.MEMBERSHIP,
      CNTR_TP_CD.RE_STIPULATION,
      CNTR_TP_CD.QUOTE,
    ].includes(code.codeId) && code;
  });
  searchParams.value.cntrTpCd = codes.CNTR_TP_CD[0]?.codeId;

  if (searchParams.value.cntrTpCd === CNTR_TP_CD.EMPLOYEE) {
    const { data } = await dataService.get('sms/wells/contract/contracts/aliance-partner-codes');
    // console.log(JSON.stringify(data, null, '\t'));
    codes.BYR_DV_CD = data;
  }
}

await setupAvailableCntrTpCd();
const ableToReStipulation = !!await getCode('CNTR_TP_CD', '07');
const ableToMembership = !!await getCode('CNTR_TP_CD', '08');

function setupSearchParams(newParams) {
  searchParams.value.cntrTpCd = newParams?.cntrTpCd || codes.CNTR_TP_CD[0]?.codeId;
  searchParams.value.copnDvCd = newParams?.copnDvCd || '1';
  searchParams.value.cstKnm = newParams?.cstKnm || '';
  searchParams.value.bzrno = newParams?.bzrno || '';
  searchParams.value.cntrtTno = newParams.cntrtTno || '';
  searchParams.value.cralLocaraTno = newParams.cralLocaraTno || '';
  searchParams.value.mexnoEncr = newParams.mexnoEncr || '';
  searchParams.value.cralIdvTno = newParams.cralIdvTno || '';
  searchParams.value.alncPrtnrDvCd = newParams.alncPrtnrDvCd || '';
  searchParams.value.alncPrtnrNo = newParams.alncPrtnrNo || '';
  searchParams.value.alncPrtnrNm = newParams.alncPrtnrNm || '';
}

const cntrTpIs = ref({
  indv: computed(() => searchParams.value.cntrTpCd === '01'), // 개인
  crp: computed(() => searchParams.value.cntrTpCd === '02'), // 법인
  ensm: computed(() => searchParams.value.cntrTpCd === '03'), // 임직원
  msh: computed(() => searchParams.value.cntrTpCd === '07'), // 멤버십
  rstl: computed(() => searchParams.value.cntrTpCd === '08'), // 재약정
  quot: computed(() => searchParams.value.cntrTpCd === '09'), // 견적서
});
const dashboardCounts = ref({
  belongPartnerCnt: 0,
  restipulationCnt: 0,
  membershipCnt: 0,
});
const isReadonly = computed(() => !!step1.value.bas?.cntrPrgsStatCd);
const popupRequiredCstInfos = computed(() => [
  CNTR_TP_CD.INDIVIDUAL,
  CNTR_TP_CD.COOPERATION,
  CNTR_TP_CD.EMPLOYEE,
].includes(searchParams.value.cntrTpCd));
const cstKnmLabel = computed(() => (searchParams.value.copnDvCd === COPN_DV_CD.COOPERATION ? t('MSG_TXT_CRP_NM') : t('MSG_TXT_NAME')));
let initFlag = false;

function setupNewContract() {
  step1.value ??= {};
  step1.value.bas ??= {};
  step1.value.bas.cntrTpCd = codes.CNTR_TP_CD[0].codeId;
  cntrTpCd.value = step1.value.bas.cntrTpCd;
}

async function getCntrInfo() {
  if (!cntrNo.value) {
    setupNewContract();
    return;
  }

  searchParams.cntrNo = cntrNo.value;
  const { data } = await dataService.get('sms/wells/contract/contracts/cntr-info', {
    params: {
      cntrNo: cntrNo.value,
      step: 1,
    },
  });

  step1.value = data.step1;
  ogStep1.value = cloneDeep(step1.value);
  const {
    bas,
    cntrt,
    prtnr,
    // prtnr7,
    // cntrt,
    // mshCntrNo,
    // mshCntrSn
  } = step1.value;

  initFlag = true; /* 계약유형코드 변경 콜백 동작 방지. */
  searchParams.value.cntrTpCd = bas.cntrTpCd;
  searchParams.value.copnDvCd = bas.copnDvCd;

  if (cntrt) {
    searchParams.value.cstKnm = cntrt.cstKnm;
    if (searchParams.value.copnDvCd === '1') {
      searchParams.value.cntrtTno = `${cntrt.cralLocaraTno}${cntrt.mexnoEncr}${cntrt.cralIdvTno}`;
      searchParams.value.cralLocaraTno = cntrt.cralLocaraTno;
      searchParams.value.mexnoEncr = cntrt.mexnoEncr;
      searchParams.value.cralIdvTno = cntrt.cralIdvTno;
    } else if (searchParams.value.copnDvCd === '2') {
      searchParams.value.bzrno = cntrt.bzrno;
    }
  }

  if (prtnr && bas.cntrTpCd === CNTR_TP_CD.EMPLOYEE) {
    searchParams.value.alncPrtnrDvCd = prtnr.alncPrtnrDrmDvCd;
    searchParams.value.alncPrtnrNm = prtnr.alncPrtnrIdnrNm;
    searchParams.value.alncPrtnrNo = prtnr.alncPrtnrDrmVal;
    searchParams.value.alncPrtnrComp = prtnr.prtnrNo; // 제휴사
  }
}

function clearSelected() {
  step1.value.prtnr = {};
  step1.value.cntrt = {};
}

async function onClickSendUrlMsg(templateCd) {
  const templateOptions = [
    { codeId: '01', codeName: t('MSG_TXT_HS_CTF') },
    { codeId: '02', codeName: t('MSG_TXT_PRV_AG') },
    { codeId: '05', codeName: t('MSG_TXT_CST_INF_MDFC') },
  ];

  const nm = templateOptions.find((v) => (v.codeId === templateCd))?.codeName;
  if (!nm) {
    await alert('잘못된 템플릿 요청입니다.');
    return;
  }

  if (await confirm(`${nm} 알림톡을 발송하시겠습니까?`)) {
    const { cstKnm, cstNo, cralLocaraTno, mexnoEncr, cralIdvTno } = step1.value.cntrt;
    const mpno = `${cralLocaraTno}${mexnoEncr}${cralIdvTno}`;
    if (!cstKnm || !mpno) {
      await alert('이름과 휴대전화번호는 필수 입니다.');
      return;
    }
    const data = {
      dispatchMedium: 'A', // 카카오 비즈톡
      templateCd, // 본인인증 01, 약관동의 02, 고객정보수정 05
      subject: '',
      msgContent: '',
      callback: '15776688',
      destInfo: `${cstKnm}^${mpno}`,
      cstNoInfo: `${cstKnm}^${mpno}^${cstNo}`,
      scheduleType: '0',
      sendDatetime: '',
    };

    await dataService.post('/sms/common/customer/url-messages', data);
    await alert(t('MSG_ALT_URL_TRS_FSH'));
  }
}

function isValidAlncPrtnr() {
  /*
  // 조회 조건 validate 확인
  const arr = ['alncPrtnrDvCd', 'alncPrtnrNo', 'alncPrtnrNm'];
  const isAllEmpty = arr.every((key) => (isEmpty(searchParams.value[key])));
  const isAllNotEmpty = arr.every((key) => (!isEmpty(searchParams.value[key])));
  if (!isAllEmpty && !isAllNotEmpty) {
    alert('제휴파트너 정보입력시, 모든 값을 입력해야 합니다.');
    return false;
  }
  */
  return true;
}

async function checkExistContractor() {
  const { copnDvCd } = searchParams.value;
  const { data: exist } = await dataService.get('sms/wells/contract/contracts/is-exist-cntrt-info', { params: searchParams.value });

  if (!exist) {
    step1.value.cntrt = {};
    if (await confirm(t('MSG_ALT_NO_CST_REG'))) {
      if (copnDvCd === COPN_DV_CD.INDIVIDUAL) {
        await modal({ component: 'ZwcsaIndvCustomerRegUrlTrsMgtP' });
      } else if (copnDvCd === COPN_DV_CD.COOPERATION) {
        // 법인: 법인고객 등록 화면으로 이동
        await router.push({
          path: '/contract/wwcta-contract-registration-mgt/zwcsa-corporate-customer-reg',
          query: {
            bzrno: searchParams.value.bzrno,
            dlpnrNm: searchParams.value.cstKnm,
          },
        });
      }
    }
  }
  return exist;
}

async function openCustomerSelectPopup() {
  const { copnDvCd } = searchParams.value;
  const customerListPopupProps = copnDvCd === '1' ? {
    cstType: '1',
    cstNm: searchParams.value.cstKnm,
    cralLocaraTno: searchParams.value.cralLocaraTno,
    mexnoEncr: searchParams.value.mexnoEncr,
    cralIdvTno: searchParams.value.cralIdvTno,
  } : {
    cstType: '2',
    dlpnrNm: searchParams.value.cstKnm,
    bzrno: searchParams.value.bzrno,
  };
  return await modal({
    component: 'ZwcsaCustomerListP',
    // 개인: 공통팝업(이름, 성별, 생년월일, 휴대전화번호)
    componentProps: customerListPopupProps,
  });
}

async function fetchCntrtByCstNo(cstNo) {
  try {
    const { data } = await dataService.get('sms/wells/contract/contracts/cntrt', {
      params: {
        cstNo,
      },
    });
    step1.value.cntrt = data;
  } catch (e) {
    setupSearchParams();
  }
}

async function selectContractor() {
  if (searchParams.value.cntrTpCd !== CNTR_TP_CD.MEMBERSHIP
      && searchParams.value.cntrTpCd !== CNTR_TP_CD.RE_STIPULATION
      && !await checkExistContractor()) {
    return;
  }

  const { result, payload } = await openCustomerSelectPopup();

  if (!result) {
    step1.value.cntrt = {};
    return;
  }

  await fetchCntrtByCstNo(payload.cstNo);
}

async function chooseBelongPartner() {
  // 지국장인 경우 소속파트너 선택
  const { result, payload } = await modal({
    component: 'WwctaBelongPartnerChoiceListP',
    componentProps: {
      dsmnPrtnrNo: currentPartner.prtnrNo,
      ogTpCd: currentPartner.ogTpCd,
    },
  });
  if (!result) {
    return;
  }
  step1.value.prtnr = payload;
}

async function setAlncPrtnr() {
  if (!isEmpty(alncPartner.value.prtnrNo) && !isEmpty(alncPartner.value.ogTpCd)) {
    // 파트너 재설정
    step1.value.prtnr = alncPartner.value;
  } else {
    console.log('제휴파트너 정보가 비어있습니다.');
  }
  // console.log(JSON.stringify(step1.value.prtnr, null, '\t'));
}

async function selectPartner() {
  if (cntrTpIs.value.ensm) { // 임직원 계약
    // 이미 isValidAlncPrtnr 확인 이후, 값 하나만 확인
    if (!isEmpty(searchParams.value.alncPrtnrDvCd)) {
      await setAlncPrtnr();
      return;
    }
  }

  // step1.value.prtnr ??= currentPartner; // {} => Nullish coalescing assignment (??=) 처리안됨
  step1.value.prtnr = isEmpty(step1.value.prtnr) ? currentPartner : step1.value.prtnr;

  if (currentPartner.pstnDvCd === '7') {
    // 지국장 정보 설정 후, 소속 파트너 선택
    step1.value.prtnr7 = currentPartner;
    await chooseBelongPartner();
  }
}

async function onClickMembership() {
  clearSelected();

  const { result, payload } = await modal({
    component: 'WwctaMshRstlOjCstListP',
    componentProps: {
      copnDvCd: '1',
      cntrTpCd: '1',
      prtnrNo: currentPartner.prtnrNo,
      ogTpCd: currentPartner.ogTpCd,
    },
  });
  if (!result) {
    setupSearchParams();
    return;
  }

  step1.value.mshCntrNo = payload.cntrNo;
  step1.value.mshCntrSn = payload.cntrSn;
  step1.value.prtnr = currentPartner;

  await fetchCntrtByCstNo(payload.cntrCstNo);
  cntrTpCd.value = membershipCntrTpCd;
  setupSearchParams({
    ...step1.value.cntrt,
    cntrTpCd: membershipCntrTpCd,
  });
}

async function onClickReStipulation() {
  clearSelected();

  const { result, payload } = await modal({
    component: 'WwctaMshRstlOjCstListP',
    componentProps: {
      copnDvCd: '1',
      cntrTpCd: '2',
      prtnrNo: currentPartner.prtnrNo,
      ogTpCd: currentPartner.ogTpCd,
    },
  });

  if (!result) {
    setupSearchParams();
    return;
  }

  rstlCntrNo.value = payload.cntrNo;
  rstlCntrSn.value = payload.cntrSn;
  step1.value.prtnr = currentPartner;

  await fetchCntrtByCstNo(payload.cntrCstNo);
  cntrTpCd.value = reStipulationCntrTpCd;
  setupSearchParams({
    ...step1.value.cntrt,
    cntrTpCd: reStipulationCntrTpCd,
  });
}

async function onClickSearch() {
  if (searchParams.value.cntrTpCd === CNTR_TP_CD.EMPLOYEE) {
    if (!isValidAlncPrtnr()) {
      return;
    }
  } else if (searchParams.value.cntrTpCd === membershipCntrTpCd) {
    await onClickMembership();
    return;
  } else if (searchParams.value.cntrTpCd === reStipulationCntrTpCd) {
    await onClickReStipulation();
    return;
  }

  await selectContractor();
  await selectPartner();
}

async function onChangeCntrTpCd(value) {
  if (initFlag) {
    initFlag = false;
    return;
  }
  if (cntrTpCd.value === value) {
    return;
  }
  clearSelected();
  if (value === CNTR_TP_CD.INDIVIDUAL) {
    setupSearchParams({
      ...searchParams.value,
      copnDvCd: COPN_DV_CD.INDIVIDUAL,
    });
  }
  if (value === CNTR_TP_CD.COOPERATION) {
    setupSearchParams({
      ...searchParams.value,
      copnDvCd: COPN_DV_CD.COOPERATION,
    });
  }
  if (value === CNTR_TP_CD.MEMBERSHIP) {
    await onClickMembership();
    return;
  }
  if (value === CNTR_TP_CD.RE_STIPULATION) {
    await onClickReStipulation();
    return;
  }

  cntrTpCd.value = value;
}

// 임직원 계약, 제휴파트너구분 변경시 처리
async function onChangeAlncPrtnrDv(value) {
  if (value === '10') { // 직원
    alncPartner.value = currentPartner;
  } else if (value === '90') { // 제휴사직원
    // 별도 처리 : onChangeAlncPrtnrComp
    alncPartner.value.prtnrNo = '';
    alncPartner.value.prtnrKnm = '';
    alncPartner.value.ogTpCd = '';
  } else {
    const buyer = codes.BYR_DV_CD.find((v) => (v.codeId === value));
    alncPartner.value.prtnrNo = buyer?.prtnrNo;
    alncPartner.value.prtnrKnm = buyer?.prtnrNm;
    alncPartner.value.ogTpCd = buyer?.prtnrOgTpCd;
  }
}

// 임직원 계약, 제휴사 변경시 처리
async function onChangeAlncPrtnrComp(value) {
  const company = codes.ALNCMP_EMP_PRCHS_ALNC_BZS_ACD.find((v) => (v.codeId === value));
  alncPartner.value.prtnrNo = company?.codeId || '';
  alncPartner.value.prtnrKnm = company?.codeName || '';
  alncPartner.value.ogTpCd = 'ALC'; // 고정
}

async function onClickReset() {
  ['cstKnm', 'bzrno', 'cntrtTno', 'cralLocaraTno', 'mexnoEncr', 'cralIdvTno',
    'alncPrtnrDvCd', 'alncPrtnrNo', 'alncPrtnrNm', 'alncPrtnrComp'].forEach((key) => {
    searchParams.value[key] = '';
  });
  searchParams.value.copnDvCd = '1';
  step1.value = {};
}

async function isPartnerStpa() {
  return await dataService.get('sms/wells/contract/partners/business-closes', {
    params: {
      prtnrNo: currentPartner.prtnrNo,
      ogTpCd: currentPartner.ogTpCd,
    },
  })?.data;
}

function isChangedStep() {
  if (isEmpty(step1.value.bas?.cntrNo)) {
    return true;
  }
  return JSON.stringify(ogStep1.value) !== JSON.stringify(step1.value);
}

/**
 * 휴폐업여부 I/F 호출
 * 휴업상태(02), 폐업상태(03)
 */
async function fetchCorpStpaSdfbz() {
  let isStpaSdfbzYn = true;
  const bzrno = step1.value.cntrt?.bzrno;
  const res = await dataService
    .get('/sms/common/customer/corporate-customer/stpa-sdfbz', { params: { bzrno } });

  if (res.data.statusCode === 'OK') {
    if (res.data.data.length > 0) {
      res.data.data.forEach((item) => {
        item.endDtFormat = !isEmpty(item.endDt)
          ? `${item.endDt?.substring(0, 4)}-${item.endDt?.substring(4, 6)}-${item.endDt?.substring(6, 8)}` : '';
      });

      if (res.data.data[0].bSttCd === '02') {
        // 휴업상태
        await alert(`${bzrno} 사업자번호는\n현재 휴업상태입니다.\n(휴업일자 : ${res.data?.data[0]?.endDtFormat})`);
        isStpaSdfbzYn = false;
      }

      if (res.data.data[0].bSttCd === '03') {
        // 폐업상태
        await alert(`${bzrno} 사업자번호는\n현재 폐업상태입니다.\n(폐업일자 : ${res.data?.data[0]?.endDtFormat})`);
        isStpaSdfbzYn = false;
      }
      return isStpaSdfbzYn;
    }
  }
  // 정상 수신했지만 OK리턴이 아닌 경우
  // status_code : BAD_JSON_REQUEST(JSON 포맷에 적합하지 않는 요청) / REQUEST_DATA_MALFORMED(필수 요청 파라미터 누락)
  //               TOO_LARGE_REQUEST(요청 사업자번호 100개 초과) / INTERNAL_ERROR
  await alert('사업자 번호 확인시 오류가 발생하였습니다.');
  return false;
}

async function isValidStep() {
  if (cntrTpIs.value.quot) { // 견적서, 계약자명 입력 필수
    if (isEmpty(searchParams.value.cstKnm)) {
      await alert('계약자명을 입력해주세요.');
      return false;
    }
    return true;
  }

  if (isEmpty(step1.value.cntrt)) {
    await alert('계약자를 선택해주세요.');
    return false;
  }

  const { cikVal, itgCstNo, copnDvCd } = step1.value.cntrt;

  if (copnDvCd === COPN_DV_CD.INDIVIDUAL) {
    if (!cikVal) {
      await alert('본인인증 미완료 상태입니다.\n완료 후 계약자를 재 조회해 주세요.');
      return false;
    }
    if (!itgCstNo) {
      await alert('통합고객 약관동의 미완료 상태입니다.\n완료 후 계약자를 재 조회해 주세요.');
      return false;
    }
  }

  if (copnDvCd === COPN_DV_CD.COOPERATION) {
    return await fetchCorpStpaSdfbz(); // 법인 계약자의 휴업, 폐업 여부 확인
  }

  if (cntrTpIs.value.msh && !step1.value.mshCntrNo) {
    await alert('멤버십 원계약을 선택해주세요.');
    return false;
  }

  return true;
}

async function saveStep() {
  if (cntrTpIs.value.ensm) { // 임직원
    step1.value.cntrt.copnDvCd = searchParams.value.copnDvCd;
    step1.value.prtnr.alncPrtnrDrmVal = searchParams.value.alncPrtnrNo;
    step1.value.prtnr.alncPrtnrIdnrNm = searchParams.value.alncPrtnrNm;
    step1.value.prtnr.alncPrtnrDrmDvCd = searchParams.value.alncPrtnrDvCd;
  }
  if (cntrTpIs.value.quot) { // 견적서
    step1.value.bas ??= {};
    step1.value.bas.cntrCstNm = searchParams.value.cstKnm;
  }

  // 최초 계약시 설정해야 summary 에서 계약유형 등 표시 가능
  step1.value.bas.cntrTpCd = searchParams.value.cntrTpCd;
  step1.value.bas.copnDvCd = searchParams.value.copnDvCd;

  if (cntrTpCd.value === reStipulationCntrTpCd) {
    return rstlCntrNo.value;
  }

  // console.log(JSON.stringify(step1.value, null, '\t'));
  const { data } = await dataService.post('sms/wells/contract/contracts/save-cntr-step1', step1.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  ogStep1.value = cloneDeep(step1.value);
  cntrNo.value = data?.key;
  return data?.key;
}

async function getCounts() {
  if (await isPartnerStpa()) {
    await alert('휴업중인 파트너로 계약이 불가합니다');
  } else {
    const [res, res2] = await Promise.all([
      dataService.get('/sms/wells/contract/re-stipulation/customers/counts', { params: { copnDvCd: '1', cntrCstNo: props.cntrCstNo } }),
      dataService.get('/sms/wells/contract/membership/customers/counts', { params: { copnDvCd: '1', cntrCstNo: props.cntrCstNo } }),
    ]);
    dashboardCounts.value.restipulationCnt = res.data;
    dashboardCounts.value.membershipCnt = res2.data;
  }
}

const loaded = ref(false);

async function initStep(forced = false) {
  if (!forced && loaded.value) {
    return;
  }

  await getCntrInfo();
  if (!cntrNo.value) {
    getCounts();
  }
  loaded.value = true;
}

exposed.getCntrInfo = getCntrInfo;
exposed.isChangedStep = isChangedStep;
exposed.isValidStep = isValidStep;
exposed.initStep = initStep;
exposed.saveStep = saveStep;

// fixme 우선 기워 넣기 so sorry.
const unwatch = watchEffect(() => {
  if (step1.value.pspcCstBas) {
    const { pspcCstKnm, cralLocaraTno, mexnoEncr, cralIdvTno } = step1.value.pspcCstBas;
    setupSearchParams({
      cstKnm: pspcCstKnm,
      cntrtTno: `${cralLocaraTno}${mexnoEncr}${cralIdvTno}`,
      cralLocaraTno,
      mexnoEncr,
      cralIdvTno,
    });
    unwatch();
  }
});

onActivated(() => {
  initStep(true);
  emit('activated', 1);
});

</script>

<style scoped lang="scss">
.scoped-student-list {
  &.kw-list {
    :deep(.kw-list__select-section) {
      padding-right: 8px;
    }
  }
}

</style>
