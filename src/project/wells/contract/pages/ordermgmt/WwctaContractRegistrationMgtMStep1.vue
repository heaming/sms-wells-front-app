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
    <ul class="kw-state-list kw-state-list--second-line col pt20">
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
      @search="onClickSearchCntrtInfo"
      @reset="resetSearchConds"
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
            @change="resetSearchConds"
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
            :disable="cntrTpIs.indv || cntrTpIs.crp"
          />
        </kw-search-item>
        <kw-search-item
          v-if="cntrTpIs.crp"
          :label="$t('MSG_TXT_CRP_NM')"
          required
        >
          <kw-input
            v-model="searchParams.cstKnm"
            :label="$t('MSG_TXT_CRP_NM')"
            maxlength="50"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          v-if="!cntrTpIs.crp"
          :label="$t('MSG_TXT_NAME')"
          required
        >
          <kw-input
            v-model="searchParams.cstKnm"
            :label="$t('MSG_TXT_NAME')"
            maxlength="50"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          v-if="cntrTpIs.crp"
          :label="$t('MSG_TXT_CRNO')"
          required
        >
          <kw-input
            v-model="searchParams.bzrno"
            :label="$t('MSG_TXT_CRNO')"
            rules="required"
            maxlength="10"
          />
        </kw-search-item>
        <kw-search-item
          v-if="!cntrTpIs.crp"
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
          v-if="cntrTpIs.indv || cntrTpIs.ensm || cntrTpIs.msh"
        >
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_CNTRT')"
            >
              <p>
                {{ `${step1.cntrt.cstKnm} / ${stringUtil.getDateFormat(step1.cntrt.bryyMmdd)} /
${step1.cntrt.sexDvNm}` }}
              </p>
            </kw-form-item>
            <kw-form-item
              label="본인인증여부"
              hint="s"
            >
              <p
                v-if="step1.cntrt.cikVal"
              >
                본인인증완료
              </p>
              <p
                v-if="!step1.cntrt.cikVal"
              >
                본인인증필요
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_CST_NO')"
            >
              <p>{{ step1.cntrt.cstNo }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_MPNO')"
            >
              <p>
                {{ step1.cntrt.cralLocaraTno }}-{{ step1.cntrt.mexnoEncr }}-{{ step1.cntrt.cralIdvTno }}
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_ADDR')"
            >
              <p>
                {{ step1.cntrt.zip }}<br>
                {{ step1.cntrt.adr }} {{ step1.cntrt.adrDtl }}
              </p>
            </kw-form-item>
          </kw-form-row>
        </template>
        <template
          v-if="cntrTpIs.crp"
        >
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_CNTRT')"
            >
              <p>{{ step1.cntrt.cstKnm }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_CRNO')"
            >
              <p>{{ step1.cntrt.bzrno }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_CST_NO')"
            >
              <p>{{ step1.cntrt.cstNo }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_MPNO')"
            >
              <p>
                {{ step1.cntrt.cralLocaraTno }}-{{ step1.cntrt.mexnoEncr }}-{{ step1.cntrt.cralIdvTno }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_TEL_NO')"
            >
              <p>
                {{ step1.cntrt.locaraTno }}-{{ step1.cntrt.exnoEncr }}-{{ step1.cntrt.idvTno }}
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_ADDR')"
            >
              <p>
                {{ step1.cntrt.zip }}<br>
                {{ step1.cntrt.adr }} {{ step1.cntrt.adrDtl }}
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
                <p>{{ step1.prtnr.prtnrKnm }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_PRTNR_NUM')"
              >
                <p>{{ step1.prtnr.prtnrNo }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_MANAGEMENT_DEPARTMENT')"
              >
                <p>{{ step1.prtnr.dgr1LevlOgNm }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_RGNL_GRP')"
              >
                <p>{{ step1.prtnr.dgr2LevlOgNm }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_BRANCH')"
              >
                <p>{{ step1.prtnr.dgr3LevlOgNm }}</p>
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
                <p>{{ step1.prtnr.prtnrKnm }}</p>
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_PRTNR_NUM')"
              >
                <p>{{ step1.prtnr.prtnrNo }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_ALNC_PRTNR')"
              >
                <p>{{ step1.prtnr.prtnrKnm }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_ALNC_PRTNR_NM')"
              >
                <kw-input
                  v-model="step1.alncPrtnrNm"
                  :label="$t('MSG_TXT_ALNC_PRTNR_NM')"
                  maxlength="10"
                />
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_ALNC_PRTNR_NO')"
              >
                <kw-input
                  v-model="step1.alncPrtnrNo"
                  :label="$t('MSG_TXT_ALNC_PRTNR_NO')"
                  maxlength="10"
                />
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
const searchParams = ref({
  cntrNo: step1.value.bas?.cntrNo,
  cntrTpCd: '01',
  copnDvCd: '1',
  cstKnm: '강태욱',
  bzrno: '',
  cralLocaraTno: '010',
  mexnoEncr: '5322',
  cralIdvTno: '7170',
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
  restipulationCnt: 0,
  membershipCnt: 0,
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function getCntrInfo(cntrNo) {
  const cntr = await dataService.get('sms/wells/contract/contracts/cntr-info', { params: {
    cntrNo,
    cstNo: step1.value?.bas?.cntrCstNo,
    step: 1,
  } });
  step1.value = cntr.data.step1;
  pCntrNo.value = step1.value.bas.cntrNo;
  console.log(step1.value);
  ogStep1.value = cloneDeep(step1.value);
  if (isEmpty(step1.value.bas.cntrNo)) {
    step1.value.bas.cntrTpCd = searchParams.value.cntrTpCd;
    step1.value.bas.copnDvCd = searchParams.value.copnDvCd;
  }
}

async function setCntrInfo(cstNo) {
  step1.value.bas = {
    cntrCstNo: cstNo,
  };
  await getCntrInfo();
}

async function onClickSearchCntrtInfo() {
  if (cntrTpIs.value.indv || cntrTpIs.value.ensm) {
    // 개인 / 임직원
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
        await setCntrInfo(res.payload.cstNo);
      }
      // await setCntrInfo('017448860');
    }
  } else if (cntrTpIs.value.crp) {
    // 법인
    const isExistCntrt = await dataService.get('sms/wells/contract/contracts/is-exist-cntrt-info', { params: searchParams.value });
    if (!isExistCntrt.data) {
      // 조회된 고객이 없다면
      step1.value.cntrt = ref({});
      if (await confirm(t('MSG_ALT_NO_CST_REG'))) {
        // 법인: 법인고객 등록 화면으로 이동
        await router.push({ path: '/customer/zwcsa-customer-mgt/zwcsa-corporate-customer-reg' });
      }
    } else {
      // 조회된 고객이 있다면, 계약자: 공통고객 조회 팝업, 학습자: 학습자용 고객 조회 팝업 호출
      const crpCond = {
        cstKnm: searchParams.value.cstKnm,
        bzrno: searchParams.value.bzrno,
      };
      console.log(crpCond);
      /* FIXME 고객 조회 팝업 데이터 수신 로직 변경되면 수정
      const res = await modal({
        component: 'ZwcsaCustomerListP',
        // 법인: 공통팝업(이름, 사업자등록번호)
        // 개인: 공통팝업(이름, 성별, 생년월일, 휴대전화번호)
        componentProps: crpCond,
      })
      if (res.result && res.payload) {
        await setCntrInfo(res.payload.cstNo);
      }
     */
      await setCntrInfo('008446558');
    }
  }
}

async function onClickReStipulation() {
  const res = await modal({
    component: 'WwctaMshRstlOjCstListP',
    componentProps: {
      prtnrNo: step1.value.prtnrNo,
      ogTpCd: step1.value.ogTpCd,
      cntrTpCd: 'RSTL',
      copnDvCd: '1',
    },
  });
  console.log(res);
}

async function onClickMembership() {
  const res = await modal({
    component: 'WwctaMshRstlOjCstListP',
    componentProps: {
      prtnrNo: step1.value.prtnrNo,
      ogTpCd: step1.value.ogTpCd,
      cntrTpCd: 'MSH',
      copnDvCd: '1',
    },
  });
  console.log(res);
}

async function resetSearchConds() {
  ['cstKnm', 'bzrno', 'cralLocaraTno', 'mexnoEncr', 'cralIdvTno'].forEach((key) => {
    searchParams.value[key] = '';
  });
  searchParams.value.copnDvCd = '1';
  step1.value = ref({});
  /*
  cntrtInfo.value = ref({});
  lrnrInfo.value = ref({});
   */
}

async function isPartnerStpa() {
  return await dataService.get('sms/wells/contract/partners/business-closes', {
    params: {
      prtnrNo,
      ogTpCd,
    },
  })?.data;
}

// TODO 계약작성 마감시간 검사 getClosingTimeInfo
async function isClosingTime() {
  return false;
}
function isChangedStep() {
  if (isEmpty(step1.value.bas.cntrNo)) {
    return true;
  }
  return JSON.stringify(ogStep1.value) !== JSON.stringify(step1.value);
}

async function isValidStep() {
  /**
   * 1. 계약자 선택여부
   */
  if (isEmpty(step1.value.cntrt)) {
    await alert('계약자를 선택해주세요.');
    return false;
  }
  return true;
}

async function saveStep() {
  const savedCntr = await dataService.post('sms/wells/contract/contracts/save-cntr-step1', step1.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  ogStep1.value = cloneDeep(step1.value);
  return savedCntr?.data?.key;
}

onMounted(async () => {
  props.onChildMounted(1);
  if (await isPartnerStpa()) {
    await alert('휴업');
  } else {
    if (isEmpty(props.cntrNo)) {
      if (await isClosingTime()) {
        await alert('마감');
      }
    }
    const res = await dataService.get('/sms/wells/contract/membership/customers/counts', { params: { copnDvCd: '1' } });
    const res2 = await dataService.get('/sms/wells/contract/re-stipulation/customers/counts', { params: { copnDvCd: '1' } });
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
