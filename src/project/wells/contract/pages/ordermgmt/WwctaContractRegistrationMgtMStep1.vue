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
      <li class="kw-state-list__item">
        <p class="kw-state-list__top">
          재약정대상
        </p>
        <p class="kw-state-list__num">
          <a
            href="javascript:void(0);"
            class="kw-state-list__under-line"
            @click="onClickReStipulation()"
          >{{ dashboardCounts.restipulationCnt }}</a>
          <span class="kw-state-list__unit">명</span>
        </p>
      </li>
      <li class="kw-state-list__item">
        <p class="kw-state-list__top">
          멤버십대상
        </p>
        <p class="kw-state-list__num">
          <a
            href="javascript:void(0);"
            class="kw-state-list__under-line"
            @click="onClickMembership()"
          >{{ dashboardCounts.membershipCnt }}</a>
          <span class="kw-state-list__unit">명</span>
        </p>
      </li>
    </ul>
    <kw-search
      :cols="3"
      :disable="isReadonly"
      @search="onClickSearchCntrtInfo"
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
            :options="cntrTpCdOptions"
            rules="required"
            :disable="isReadonly || !!mshCntr.cntrNo"
            @change="onChangeCntrtTpCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CNTRT_TP')"
          required
        >
          <kw-select
            v-model="searchParams.copnDvCd"
            :label="$t('MSG_TXT_CNTRT_TP')"
            :options="codes.COPN_DV_CD"
            rules="required"
            :disable="cntrTpIs.indv || cntrTpIs.crp || cntrTpIs.ensm || isReadonly || !!mshCntr.cntrNo"
          />
        </kw-search-item>
        <kw-search-item
          v-if="cntrTpIs.crp || (cntrTpIs.msh && searchParams.copnDvCd === '2')"
          :label="$t('MSG_TXT_CRP_NM')"
          required
        >
          <kw-input
            v-model="searchParams.cstKnm"
            :label="$t('MSG_TXT_CRP_NM')"
            maxlength="50"
            rules="required"
            :disable="isReadonly"
          />
        </kw-search-item>
        <kw-search-item
          v-if="!cntrTpIs.crp && !cntrTpIs.ensm && !(cntrTpIs.msh && searchParams.copnDvCd === '2')"
          :label="$t('MSG_TXT_NAME')"
          required
        >
          <kw-input
            v-model="searchParams.cstKnm"
            :label="$t('MSG_TXT_NAME')"
            maxlength="50"
            rules="required"
            :disable="isReadonly"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row
        v-if="!cntrTpIs.ensm"
      >
        <kw-search-item
          v-if="cntrTpIs.crp || (cntrTpIs.msh && searchParams.copnDvCd === '2')"
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
        <kw-search-item
          v-if="!cntrTpIs.crp && !(cntrTpIs.msh && searchParams.copnDvCd === '2')"
          :label="$t('MSG_TXT_MPNO')"
          :required="!cntrTpIs.crp"
        >
          <kw-input
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
      </kw-search-row>
    </kw-search>

    <template
      v-if="step1.cntrt?.cstNo"
    >
      <h3>{{ $t('MSG_TXT_CNTRT_INF') }}</h3>

      <kw-form
        :cols="2"
        dense
      >
        <template
          v-if="cntrTpIs.indv || cntrTpIs.ensm || (cntrTpIs.msh && searchParams.copnDvCd === '1')"
        >
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_CNTRT')"
            >
              <p>
                {{ `${step1.cntrt?.cstKnm} / ${stringUtil.getDateFormat(step1.cntrt?.bryyMmdd)} /
${step1.cntrt?.sexDvNm}` }}
              </p>
            </kw-form-item>
            <kw-form-item
              label="본인인증여부"
            >
              <p
                v-if="step1.cntrt?.cikVal"
              >
                본인인증완료
              </p>
              <p
                v-if="!step1.cntrt?.cikVal"
              >
                <kw-btn
                  dense
                  :label="$t('MSG_TXT_SELF_AUTH_REQUIRED')"
                  @click="onClickSelfAuth"
                />
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
          v-if="cntrTpIs.crp || (cntrTpIs.msh && searchParams.copnDvCd === '2')"
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
          v-if="(cntrTpIs.indv && '7' === careerLevelCode) || cntrTpIs.ensm"
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
import { alert, codeUtil, stringUtil, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { getters } = useStore();
const { employeeIDNumber: prtnrNo, ogTpCd, careerLevelCode } = getters['meta/getUserInfo'];
const dataService = useDataService();
const { notify, confirm, modal } = useGlobal();
const router = useRouter();

const props = defineProps({
  contract: { type: String, required: true },
  onChildMounted: { type: Function, required: true },
});
const { cntrNo: pCntrNo, step1 } = toRefs(props.contract);
const ogStep1 = ref({});
const codes = await codeUtil.getMultiCodes(
  'CNTR_TP_CD',
  'COPN_DV_CD',
);
const cntrTpCdOptions = computed(() => {
  if (ogTpCd === 'HR1') {
    return codes.CNTR_TP_CD.filter((code) => ['03'].includes(code.codeId));
  }
  return careerLevelCode === '7' ? codes.CNTR_TP_CD.filter((code) => ['01', '02'].includes(code.codeId))
    : codes.CNTR_TP_CD.filter((code) => !['03'].includes(code.codeId));
});
const searchParams = ref({
  cntrNo: step1.value.bas?.cntrNo,
  cntrTpCd: '01',
  copnDvCd: '1',
  cstKnm: '',
  bzrno: '',
  cralLocaraTno: '',
  mexnoEncr: '',
  cralIdvTno: '',
});
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
const mshCntr = ref({}); /* 멤버십 원계약 저장 객체 */
const isReadonly = computed(() => !!step1.value.bas?.cntrPrgsStatCd);
const emits = defineEmits([
  'membership',
  'restipulation',
]);

/**
 * TODO 제휴파트너 로직 추가
 *             <kw-form-row>
 *               <kw-form-item
 *                 :label="$t('MSG_TXT_ALNC_PRTNR')"
 *               >
 *                 <p>{{ step1.prtnr?.prtnrKnm }}</p>
 *               </kw-form-item>
 *             </kw-form-row>
 *             <kw-form-row>
 *               <kw-form-item
 *                 :label="$t('MSG_TXT_ALNC_PRTNR_NM')"
 *               >
 *                 <kw-input
 *                   v-model="step1.alncPrtnrNm"
 *                   :label="$t('MSG_TXT_ALNC_PRTNR_NM')"
 *                   maxlength="10"
 *                 />
 *               </kw-form-item>
 *               <kw-form-item
 *                 :label="$t('MSG_TXT_ALNC_PRTNR_NO')"
 *               >
 *                 <kw-input
 *                   v-model="step1.alncPrtnrNo"
 *                   :label="$t('MSG_TXT_ALNC_PRTNR_NO')"
 *                   maxlength="10"
 *                 />
 *               </kw-form-item>
 *             </kw-form-row>
 */
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function afterGetCntrInfo(cntr) {
  if (cntr.data.step1.bas?.cntrNo && cntr.data.step1.bas?.cntrTpCd) {
    searchParams.value.cntrTpCd = cntr.data.step1.bas.cntrTpCd;
  }
  if (mshCntr.value.cntrNo) {
    searchParams.value.cntrTpCd = '07';
  }
  // 조회한 계약유형코드에 따라 컴포넌트변경 시간차
  setTimeout(() => {
    step1.value = cntr.data.step1;
    pCntrNo.value = step1.value.bas.cntrNo;
    ogStep1.value = cloneDeep(step1.value);
    // 기존계약 조회 시
    if (cntr.data.step1.bas?.cntrNo && cntr.data.step1.bas?.cntrTpCd) {
      searchParams.value.copnDvCd = cntr.data.step1.bas.copnDvCd;
    }
    // 세팅
    step1.value.bas.cntrTpCd = searchParams.value.cntrTpCd;
    step1.value.bas.copnDvCd = searchParams.value.copnDvCd;
    // 원계약을 선택한 멤버십인 경우
    if (mshCntr.value.cntrNo) {
      step1.value.bas.cntrTpCd = '07';
      searchParams.value.copnDvCd = mshCntr.value.copnDvCd;
      step1.value.bas.copnDvCd = mshCntr.value.copnDvCd;
    }
  }, 10);
}

async function getCntrInfo(cntrNo) {
  const cntr = await dataService.get('sms/wells/contract/contracts/cntr-info', { params: {
    cntrNo,
    step: 1,
  } });
  await afterGetCntrInfo(cntr);
}

async function getCntrInfoByCst(cstNo) {
  const cntr = await dataService.get('sms/wells/contract/contracts/cntr-info', { params: {
    cntrTpCd: searchParams.value.cntrTpCd,
    cstNo,
    cntrNo: step1.value.bas?.cntrNo,
    cntrPrtnrNo: step1.value.prtnr?.prtnrNo,
    ogTpCd: step1.value.prtnr?.ogTpCd,
    step: 1,
  } });
  await afterGetCntrInfo(cntr);
}

async function onClickSelfAuth() {
  if (await confirm('본인인증 알림톡을 발송하시겠습니까?')) {
    // 본인인증 알림톡 어떻게 발송하는지 확인필요
    // URL을 서비스를 통해 발송한다.
    const mobileNo = step1.value.cntrt.cralLocaraTno + step1.value.cntrt.mexnoEncr + step1.value.cntrt.cralIdvTno;
    const data = {
      dispatchMedium: 'A', // 카카오 비즈톡
      templateCd: '01', // 본인인증
      subject: '',
      msgContent: '',
      callback: '15776688',
      destInfo: `${step1.value.cntrt.cstKnm}^${mobileNo}`,
      cstNoInfo: `${step1.value.cntrt.cstKnm}^${mobileNo}^${step1.value.cntrt.cstNo}`,
      scheduleType: '0',
      sendDatetime: '',
    };

    await dataService.post('/sms/common/customer/url-messages', data);
    alert('URL 발송이 완료되었습니다.');
    notify(t('MSG_ALT_URL_TRS_FSH'));
  }
}

async function onClickSearchCntrtInfo() {
  if (cntrTpIs.value.indv || (cntrTpIs.value.msh && searchParams.value.copnDvCd === '1')) {
    // 개인
    const isExistCntrt = await dataService.get('sms/wells/contract/contracts/is-exist-cntrt-info', { params: searchParams.value });
    if (!isExistCntrt.data) {
      // 조회된 고객이 없다면
      step1.value.cntrt = ref({});
      if (await confirm(t('MSG_ALT_NO_CST_REG'))) {
        await modal({ component: 'ZwcsaIndvCustomerRegUrlTrsMgtP' });
      }
    } else {
      // 조회된 고객이 있다면, 계약자: 공통고객 조회 팝업, 학습자: 학습자용 고객 조회 팝업 호출
      const res = await modal({
        component: 'ZwcsaCustomerListP',
        // 개인: 공통팝업(이름, 성별, 생년월일, 휴대전화번호)
        componentProps: {
          cstType: '1',
          cstNm: searchParams.value.cstKnm,
          cralLocaraTno: searchParams.value.cralLocaraTno,
          mexnoEncr: searchParams.value.mexnoEncr,
          cralIdvTno: searchParams.value.cralIdvTno,
        },
      });
      if (res.result && res.payload) {
        if (careerLevelCode === '7') {
          // 지국장인 경우 소속파트너 선택
          const pRes = await modal({
            component: 'WwctaBelongPartnerChoiceListP',
            componentProps: {
              dsmnPrtnrNo: prtnrNo,
              ogTpCd,
            },
          });
          if (pRes.result && pRes.payload) {
            step1.value.prtnr = pRes.payload;
          }
        }
        await getCntrInfoByCst(res.payload.cstNo);
      }
    }
  } else if (cntrTpIs.value.ensm) {
    // 임직원
    // 파트너와 계약자 모두 본인
    const cstNo = await dataService.get('sms/wells/contract/contracts/ensm-cst-no', { params: { prtnrNo } });
    if (!cstNo.data) {
      await alert('임직원의 고객번호가 존재하지 않습니다.');
      return;
    }
    await getCntrInfoByCst(cstNo.data);
  } else if (cntrTpIs.value.crp || (cntrTpIs.value.msh && searchParams.value.copnDvCd === '2')) {
    // 법인
    const isExistCntrt = await dataService.get('sms/wells/contract/contracts/is-exist-cntrt-info', { params: searchParams.value });
    if (!isExistCntrt.data) {
      // 조회된 고객이 없다면
      step1.value.cntrt = ref({});
      if (await confirm(t('MSG_ALT_NO_CST_REG'))) {
        // 법인: 법인고객 등록 화면으로 이동
        await router.push({
          path: '/contract/wwcta-contract-registration-mgt/zwcsa-corporate-customer-reg',
          query: {
            bzrno: searchParams.value.bzrno,
            dlpnrNm: searchParams.value.cstKnm,
          },
        });
      }
    } else {
      // 조회된 고객이 있다면, 계약자: 공통고객 조회 팝업, 학습자: 학습자용 고객 조회 팝업 호출
      const res = await modal({
        component: 'ZwcsaCustomerListP',
        // 법인: 공통팝업(이름, 사업자등록번호)
        componentProps: {
          cstType: '2',
          dlpnrNm: searchParams.value.cstKnm,
          bzrno: searchParams.value.bzrno,
        },
      });
      if (res.result && res.payload) {
        if (careerLevelCode === '7') {
          // 지국장인 경우 소속파트너 선택
          const pRes = await modal({
            component: 'WwctaBelongPartnerChoiceListP',
            componentProps: {
              dsmnPrtnrNo: prtnrNo,
              ogTpCd,
            },
          });
          if (pRes.result && pRes.payload) {
            step1.value.prtnr = pRes.payload;
          }
        }
        await getCntrInfoByCst(res.payload.cstNo);
      }
    }
  }
}
async function onClickReStipulation() {
  const { result, payload } = await modal({
    component: 'WwctaMshRstlOjCstListP',
    componentProps: {
      copnDvCd: '1',
      cntrTpCd: '2',
      prtnrNo,
      ogTpCd,
    },
  });
  if (result) {
    emits('restipulation', payload.cntrNo, payload.cntrSn);
  }
}

async function onClickMembership() {
  const { result, payload } = await modal({
    component: 'WwctaMshRstlOjCstListP',
    componentProps: {
      copnDvCd: '1',
      cntrTpCd: '1',
      prtnrNo,
      ogTpCd,
    },
  });
  console.log(result);
  console.log(payload);
  if (result && payload) {
    mshCntr.value = payload;
    await getCntrInfoByCst(mshCntr.value.cntrCstNo);
  }
  // emits('membership', payload.cntrNo, payload.cntrSn);
}

async function onChangeCntrtTpCd(v) {
  ['cstKnm', 'bzrno', 'cralLocaraTno', 'mexnoEncr', 'cralIdvTno'].forEach((key) => {
    searchParams.value[key] = '';
  });
  if (v === '01') {
    searchParams.value.copnDvCd = '1';
  } else if (v === '02') {
    searchParams.value.copnDvCd = '2';
  }
  step1.value = ref({});
}

async function onClickReset() {
  ['cstKnm', 'bzrno', 'cralLocaraTno', 'mexnoEncr', 'cralIdvTno'].forEach((key) => {
    searchParams.value[key] = '';
  });
  searchParams.value.copnDvCd = '1';
  step1.value = ref({});
  mshCntr.value = ref({});
}

async function isPartnerStpa() {
  return await dataService.get('sms/wells/contract/partners/business-closes', {
    params: {
      prtnrNo,
      ogTpCd,
    },
  })?.data;
}

function isChangedStep() {
  if (isEmpty(step1.value.bas.cntrNo)) {
    return true;
  }
  return JSON.stringify(ogStep1.value) !== JSON.stringify(step1.value);
}

async function isValidStep() {
  if (isEmpty(step1.value.cntrt)) {
    await alert('계약자를 선택해주세요.');
    return false;
  }

  if (!step1.value.cntrt.cikVal && step1.value.bas.copnDvCd === '1') {
    await alert('본인인증을 먼저 진행해주세요.');
    return false;
  }

  if (cntrTpIs.value.msh && !mshCntr.value.cntrNo) {
    await alert('멤버십 원계약을 선택해주세요.');
    return false;
  }

  return true;
}

async function saveStep() {
  if (cntrTpIs.value.msh && mshCntr.value.cntrNo) {
    step1.value.mshCntrNo = mshCntr.value.cntrNo;
    step1.value.mshCntrSn = mshCntr.value.cntrSn;
  }
  const savedCntr = await dataService.post('sms/wells/contract/contracts/save-cntr-step1', step1.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  ogStep1.value = cloneDeep(step1.value);
  return savedCntr?.data?.key;
}

onMounted(async () => {
  props.onChildMounted(1);
  if (await isPartnerStpa()) {
    await alert('휴업중인 파트너로 계약이 불가합니다');
  } else {
    const res = await dataService.get('/sms/wells/contract/re-stipulation/customers/counts', { params: { copnDvCd: '1' } });
    const res2 = await dataService.get('/sms/wells/contract/membership/customers/counts', { params: { copnDvCd: '1' } });
    dashboardCounts.value.restipulationCnt = res.data;
    dashboardCounts.value.membershipCnt = res2.data;
  }
});

defineExpose({
  getCntrInfo,
  isChangedStep,
  isValidStep,
  saveStep,
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
