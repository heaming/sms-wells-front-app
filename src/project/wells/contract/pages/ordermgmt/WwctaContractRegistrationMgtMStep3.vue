<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : [CTA] 통합계약서 작성 Step3
2. 프로그램 ID : WwctaContractRegistrationMgtMStep3
3. 작성자 : gs.piit159
4. 작성일 : 2023.05.26
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 통합계약서 작성 Step3
****************************************************************************************************
--->
<template>
  <kw-scroll-area
    visible
    scroll-width="100%"
  >
    <keep-alive>
      <div
        v-if="curCntrDtl"
        :key="curCntrDtl[SYM_TEMP_CNTR_DTL_KEY] || getDtlTempKey(curCntrDtl) "
        class="pr30"
      >
        <!-- 상품명/가격 -->
        <div class="scoped-sub-title-area">
          <span class="shrink-off">{{ curCntrDtl.pdClsfNm }}</span>
          <kw-separator
            spaced
            vertical
            class="mx12 my5"
          />
          <span class="grow">
            {{ curCntrDtl.pdNm }}
          </span>
          <span class="shrink-off text-primary">{{ getDisplayPriceByCntrDtl(curCntrDtl) }}</span>
          <div class="shrink-off row items-center ml20">
            <kw-btn
              icon="arrow_left_24"
              borderless
              class="kw-font-pt24"
              :disable="cntrDtlKeys.indexOf(curCntrDtlKey) === 0"
              @click="onClickPrevDtl"
            />
            <p class="mx4">
              <span class="text-black1">{{ cntrDtlKeys.indexOf(curCntrDtlKey) + 1 }}</span>
              <span class="text-placeholder">/{{ cntrDtlKeys.length }}</span>
            </p>
            <kw-btn
              icon="arrow_right_24"
              borderless
              class="kw-font-pt24"
              :disable="cntrDtlKeys.indexOf(curCntrDtlKey) === cntrDtlKeys.length - 1"
              @click="onClickNextDtl"
            />
          </div>
        </div>
        <kw-separator class="mt20" />

        <!-- 설치 및 배송 주소 -->
        <div class="scoped-sub-title-area">
          <span class="scoped-sub-title-area__main">설치 및 배송 주소</span>
          <kw-btn
            v-if="step3.dtls.length > 1"
            label="일괄적용"
            dense
            :disable="adrpcBulkApplied"
            @click="onBulkApplyAdrpc"
          />
          <kw-btn
            label="주소등록"
            dense
            @click="onClickAddRectRgstAdr(curCntrDtl)"
          />
        </div>
        <kw-form
          ref="frmAdrpcRef"
          :cols="0"
          class="mt20"
        >
          <kw-form-row>
            <kw-form-item
              label="주소 선택"
            >
              <div
                class="scoped-radio-multiline"
              >
                <kw-radio
                  v-for="(adr, i) in adrpcs"
                  :key="`${adr[SYM_TEMP_ADRPC_KEY] + i}`"
                  v-model="adrsVal"
                  class="scoped-radio--removable"
                  :val="adr"
                  @update:model-value="onClickRectRgstAdr(curCntrDtl, adr)"
                >
                  {{ adr.rcgvpKnm }}
                  <kw-btn
                    icon="close"
                    borderless
                    dense
                    class="kw-fc--placeholder"
                    @click="onClickDeleteRectRgstAdr(adr)"
                  />
                </kw-radio>
              </div>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row :cols="2">
            <kw-form-item
              :label="$t('MSG_TXT_RECIPIENT')"
              required
            >
              <kw-input
                v-model="curCntrDtl.adrpc.rcgvpKnm"
                :label="$t('MSG_TXT_RECIPIENT')"
                rules="required|max:15"
                :maxlength="15"
              />
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_REL_CNTRT')"
              required
            >
              <kw-select
                v-model="curCntrDtl.adrpc.cntrtRelCd"
                :options="codes.CNTRT_REL_CD"
              />
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_MPNO')"
              required
            >
              <zwcm-telephone-number
                v-model:tel-no1="curCntrDtl.adrpc.cralLocaraTno"
                v-model:tel-no2="curCntrDtl.adrpc.mexnoEncr"
                v-model:tel-no3="curCntrDtl.adrpc.cralIdvTno"
                class="grow"
                required
              />
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_TEL_NO')"
            >
              <zwcm-telephone-number
                v-model:tel-no1="curCntrDtl.adrpc.locaraTno"
                v-model:tel-no2="curCntrDtl.adrpc.exnoEncr"
                v-model:tel-no3="curCntrDtl.adrpc.idvTno"
                class="grow"
                area
                required
              />
            </kw-form-item>
          </kw-form-row>
          <kw-form-row :cols="2">
            <kw-form-item
              :colspan="2"
              :label="$t('MSG_TXT_ADDR')"
            >
              <zwcm-post-code
                v-model:zipCode="curCntrDtl.adrpc.zip"
                v-model:add1="curCntrDtl.adrpc.adr"
                v-model:add2="curCntrDtl.adrpc.adrDtl"
                v-model:addKey="curCntrDtl.adrpc.adrId"
                v-model:adrDvCd="curCntrDtl.adrpc.adrDvCd"
                class="kw-grow"
              />
            </kw-form-item>
          </kw-form-row>
          <kw-form-row />
        </kw-form>
        <kw-separator />

        <!-- 설치환경 및 요청사항 -->
        <div class="scoped-sub-title-area">
          <span class="scoped-sub-title-area__main">설치환경 및 요청사항</span>
          <kw-btn
            v-if="step3.dtls.length > 1"
            label="일괄적용"
            dense
            :disable="wellsDtlBulkApplied"
            @click="onBulkApplyWellDtl"
          />
        </div>
        <kw-form
          ref="frmWellsDtlRef"
          :cols="2"
          class="mt20"
        >
          <template
            v-if="curCntrDtl.sellTpCd === SELL_TP_CD.SPAY || curCntrDtl.sellTpCd === SELL_TP_CD.RENTAL"
          >
            <kw-form-row>
              <kw-form-item
                label="장소"
              >
                <kw-select
                  v-model="curCntrDtl.wellsDtl.istPlcTpCd"
                  :options="codes.IST_PLC_TP_CD"
                />
              </kw-form-item>
              <kw-form-item
                label="가구 구성원 수"
              >
                <kw-select
                  v-model="curCntrDtl.wellsDtl.fmmbN"
                  :options="codes.FMMB_N"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item label="전압">
                <kw-option-group
                  v-model="curCntrDtl.wellsDtl.useElectTpCd"
                  type="radio"
                  :options="codes.USE_ELECT_TP_CD"
                />
              </kw-form-item>
              <kw-form-item label="수질">
                <kw-select
                  v-model="curCntrDtl.wellsDtl.srcwtTpCd"
                  :options="codes.SRCWT_TP_CD"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item label="수압">
                <kw-option-group
                  v-model="curCntrDtl.wellsDtl.wprsItstTpCd"
                  type="radio"
                  :options="codes.WPRS_ITST_TP_CD"
                />
              </kw-form-item>
              <kw-form-item
                v-if="curCntrDtl.wellsDtl.wrfrIstMthCds"
                label="설치방식"
              >
                <kw-option-group
                  v-model="curCntrDtl.wellsDtl.wrfrIstMthCd"
                  type="radio"
                  :options="codes.PNCH_IST_TP_CD.filter((code) =>
                    curCntrDtl.wellsDtl.wrfrIstMthCds?.includes(code.codeId))"
                />
              </kw-form-item>
            </kw-form-row>
          </template>
          <kw-form-row>
            <kw-form-item
              label="요청사항"
              :colspan="2"
            >
              <kw-input
                v-model="curCntrDtl.wellsDtl.istAkArtcMoCn"
                type="textarea"
                maxlength="333"
              />
            </kw-form-item>
          </kw-form-row>
        </kw-form>
        <kw-separator />

        <!-- 결제정보 -->
        <div class="scoped-sub-title-area">
          <span class="scoped-sub-title-area__main">결제정보</span>
          <kw-checkbox
            v-if="isSodbt"
            v-model="sodbtNftfCntr"
            class="h32 mr8"
            label="총판 비대면 계약여부"
            :disable="isCcs"
            boolean-value
          />
          <kw-btn
            v-if="ableToStlmBulkApply"
            label="일괄적용"
            dense
            :disable="stlmBulkApplied || sodbtNftfCntr"
            @click="onBulkApplyStlm"
          />
        </div>
        <kw-form
          ref="frmStlmRef"
          :cols="0"
          class="mt20"
        >
          <!-- 총판 비대면의 경우 -->
          <template v-if="sodbtNftfCntr && !isCcs">
            <kw-form-row>
              <kw-form-item label="결제수단">
                {{ 'TBD' }}
              </kw-form-item>
            </kw-form-row>
          </template>
          <!-- 일시불의 경우 -->
          <template
            v-else-if="curCntrDtl.sellTpCd === SELL_TP_CD.SPAY"
          >
            <!-- 법인계약시 세금계산서 발행 선택 가능-->
            <kw-form-row
              v-if="step3.bas?.copnDvCd === COPN_DV_CD.COOPERATION"
            >
              <kw-form-item
                :label="t('MSG_TXT_TXINV_PBL')"
              >
                <kw-option-group
                  v-model="curCntrDtl.txinvPblOjYn"
                  type="radio"
                  :options="codes.COD_YN"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                no-label
              >
                <h3 class="my0">
                  결제금액 : {{ getFormattedStr(getSpayAmtByCntrDtl(curCntrDtl)) }}
                </h3>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item label="계약금(카드)">
                <kw-input
                  v-model="curCntrDtl.cntrAmtCrd"
                  type="number"
                  align="right"
                  maxlength="10"
                  :disable="curCntrDtl.crpUcAmt > 0"
                  @blur="onChangeCntram1(curCntrDtl)"
                />
              </kw-form-item>
              <kw-form-item label="계약금(가상계좌)">
                <kw-input
                  v-model="curCntrDtl.cntrAmtVac"
                  type="number"
                  align="right"
                  maxlength="10"
                  :disable="curCntrDtl.crpUcAmt > 0"
                  @blur="onChangeCntram2(curCntrDtl)"
                />
              </kw-form-item>
            </kw-form-row>
            <!-- 법인 환경가전 일시불계약시, 법인미수금 선택 가능-->
            <kw-form-row
              v-if="step3.bas?.copnDvCd === COPN_DV_CD.COOPERATION
                && curCntrDtl.sellTpDtlCd === SELL_TP_DTL_CD.SPAY_ENVR_ELHM"
            >
              <kw-form-item label="법인미수금">
                <kw-input
                  v-model="curCntrDtl.crpUcAmt"
                  type="number"
                  align="right"
                  maxlength="10"
                  @blur="onChangeCrpUcAmt(curCntrDtl)"
                />
              </kw-form-item>
            </kw-form-row>
            <template v-if="Number(curCntrDtl.cntrPtrm) && Number(curCntrDtl.cntrPtrm) > 0">
              <kw-form-row>
                <kw-form-item label="멤버십계좌이체">
                  <kw-option-group
                    v-model="curCntrDtl.dpTpCdMshAftn"
                    type="radio"
                    :options="step3.bas?.copnDvCd === COPN_DV_CD.COOPERATION ?
                      codes.DP_TP_CD_AFTN_CRP :
                      codes.DP_TP_CD_AFTN"
                  />
                </kw-form-item>
              </kw-form-row>
            </template>
          </template>
          <!-- 그 외의 경우 -->
          <template
            v-else
          >
            <!-- 법인계약시 세금계산서 발행 선택 가능-->
            <kw-form-row
              v-if="step3.bas?.copnDvCd === COPN_DV_CD.COOPERATION"
            >
              <kw-form-item
                :label="t('MSG_TXT_TXINV_PBL')"
              >
                <kw-option-group
                  v-model="curCntrDtl.txinvPblOjYn"
                  type="radio"
                  :options="codes.COD_YN"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row
              :cols="4"
            >
              <kw-form-item
                label="자동이체"
                :colspan="2"
              >
                <kw-option-group
                  v-model="curCntrDtl.dpTpCdAftn"
                  type="radio"
                  :options="step3.bas?.copnDvCd === COPN_DV_CD.COOPERATION ?
                    codes.DP_TP_CD_AFTN_CRP :
                    codes.DP_TP_CD_AFTN"
                />
              </kw-form-item>
              <kw-form-item
                no-label
                :colspan="1"
              >
                <kw-select
                  v-if="curCntrDtl.dpTpCdAftn === DP_TP_CD.IDV_RVE_VAC"
                  v-model="curCntrDtl.mpyBsdt"
                  borderless
                  class="scoped-mpy-bsdt-select"
                  label="이체일자"
                  rules="required"
                  prefix="매월"
                  suffix="이체"
                  :options="mpyBsdtOptions"
                />
              </kw-form-item>
              <kw-form-item no-label>
                <p class="kw-fc--black2 kw-font-pt14 text-weight-regular">
                  월납부금 : {{ getFormattedStr(getAftnAmtByCntrDtl(curCntrDtl)) }}
                </p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row
              :cols="4"
            >
              <kw-form-item
                label="등록비결제유형"
                :colspan="3"
              >
                <kw-option-group
                  v-model="curCntrDtl.dpTpCdIdrv"
                  type="radio"
                  :options="codes.DP_TP_CD_IDRV"
                  :disable="totalSpayAmt === 0"
                />
              </kw-form-item>
              <kw-form-item no-label>
                <p class="kw-fc--black2 kw-font-pt14 text-weight-regular">
                  등록비 : {{ getFormattedStr(getSpayAmtByCntrDtl(curCntrDtl)) }}
                </p>
              </kw-form-item>
            </kw-form-row>
          </template>
        </kw-form>
      </div>
    </keep-alive>
  </kw-scroll-area>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';
import ZwcmPostCode from '~common/components/ZwcmPostCode.vue';
import { alert, getComponentType, notify, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import {
  CCS_BASE_RLE_CDS,
  COPN_DV_CD,
  DP_TP_CD,
  SELL_TP_CD,
  SELL_TP_DTL_CD,
} from '~sms-wells/contract/constants/ctConst';
import { useCtCode } from '~sms-common/contract/composable';
import { warn } from 'vue';
import {
  getAftnAmtByCntrDtl,
  getDisplayPriceByCntrDtl,
  getFormattedStr,
  getSpayAmtByCntrDtl,
} from '~sms-wells/contract/utils/CtPriceUtil';

const SYM_TEMP_CNTR_DTL_KEY = Symbol.for('TEMP_CNTR_DTL_KEY');
const SYM_TEMP_ADRPC_KEY = Symbol.for('TEMP_ADRPC_KEY');

const props = defineProps({
  contract: { type: Object, required: true },
});
const emit = defineEmits([
  'activated',
]);
const exposed = {};

defineExpose(exposed);

const { getters } = useStore();
const { baseRleCd } = getters['meta/getUserInfo'];

const dataService = useDataService();
const { codes } = await useCtCode(
  'CNTRT_REL_CD',
  'IST_PLC_TP_CD',
  'WRFR_IST_MTH_CD',
  'SRCWT_TP_CD',
  'WPRS_ITST_TP_CD',
  'USE_ELECT_TP_CD',
  'HCR_DV_CD',
  'PNCH_IST_TP_CD',
  'COD_YN',
);
codes.FMMB_N = [
  { codeId: 1, codeName: '1인 가구' },
  { codeId: 2, codeName: '2인 가구' },
  { codeId: 3, codeName: '3인 가구' },
  { codeId: 4, codeName: '4인 이상 가구' },
];

const cntrNo = computed(() => props.contract.cntrNo);
const step3 = toRef(props.contract, 'step3');
const ogStep3 = ref({});
const { t } = useI18n();

codes.DP_TP_CD_IDRV = [
  { codeId: DP_TP_CD.IDV_RVE_CRDCD, codeName: '카드' },
  { codeId: DP_TP_CD.IDV_RVE_VAC, codeName: '가상계좌' },
];
codes.DP_TP_CD_AFTN = [
  { codeId: DP_TP_CD.CRDCD_AFTN, codeName: '카드이체' },
  { codeId: DP_TP_CD.AC_AFTN, codeName: '계좌이체' },
];
codes.DP_TP_CD_AFTN_CRP = [
  { codeId: DP_TP_CD.CRDCD_AFTN, codeName: '카드이체' },
  { codeId: DP_TP_CD.AC_AFTN, codeName: '계좌이체' },
  { codeId: DP_TP_CD.IDV_RVE_VAC, codeName: '법인계좌' }, // 가상계좌이다.
];

const adrpcs = ref([]);
const adrsVal = ref('');

const isSodbt = computed(() => (step3.value?.bas.sellOgTpCd === 'W05')); /* 총판여부 */
const isCcs = computed(() => CCS_BASE_RLE_CDS.includes(baseRleCd)); /* 고객센터여부 */
const mpyBsdtOptions = ref([]); /* 이체가능일 */
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

function getAdrpcTempKey(adrpc) {
  if (!adrpc) {
    return undefined;
  }
  if (!adrpc[SYM_TEMP_ADRPC_KEY]) {
    adrpc[SYM_TEMP_ADRPC_KEY] = [
      adrpc.rcgvpKnm,
      adrpc.cralLocaraTno,
      adrpc.mexnoEncr,
      adrpc.cralIdvTno,
      adrpc.locaraTno,
      adrpc.exnoEncr,
      adrpc.idvTno,
      adrpc.adrId,
    ].join('|');
  }
  return adrpc[SYM_TEMP_ADRPC_KEY];
}

function isChangedStep() {
  return step3.value.bas.cntrPrgsStatCd < 14 || JSON.stringify(ogStep3.value) !== JSON.stringify(step3.value);
}

async function isValidStep() {
  const validateDtl = (dtl) => {
    const {
      sellTpCd,
      cntrAmt,
      fnlAmt,
      cntrAmtCrd,
      cntrAmtVac,
      crpUcAmt,
      dpTpCdAftn,
      dpTpCdIdrv,
    } = dtl;
    if (sellTpCd === SELL_TP_CD.SPAY) {
      return Number(fnlAmt || 0) === Number(cntrAmtCrd || 0) + Number(cntrAmtVac || 0) + Number(crpUcAmt || 0);
    }
    if (cntrAmt && !dpTpCdIdrv) {
      return false;
    }
    return !(fnlAmt && !dpTpCdAftn);
  };

  if (step3.value.dtls.find((dtl) => !validateDtl(dtl))) {
    await alert('계약금을 확인해주세요.');
    return false;
  }
  return true;
}

async function saveStep() {
  const savedCntr = await dataService.post('sms/wells/contract/contracts/save-cntr-step3', step3.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  ogStep3.value = cloneDeep(step3.value);
  return savedCntr?.data?.key;
}

/* region [about dtl array control] */
function getDtlTempKey(cntrDtl) {
  if (!cntrDtl) {
    return undefined;
  }
  if (!cntrDtl[SYM_TEMP_CNTR_DTL_KEY]) {
    cntrDtl[SYM_TEMP_CNTR_DTL_KEY] = [
      cntrDtl.cntrNo,
      cntrDtl.cntrSn,
    ].join('-');
  }
  return cntrDtl[SYM_TEMP_CNTR_DTL_KEY];
}

const cntrDtlKeys = ref(step3.value?.dtls?.map(getDtlTempKey) || []);
const curCntrDtlKey = ref(getDtlTempKey(step3.value?.dtls?.[0]));
const curCntrDtl = computed(() => step3.value.dtls?.find((dtl) => dtl[SYM_TEMP_CNTR_DTL_KEY] === curCntrDtlKey.value));

function onClickPrevDtl() {
  const curIdx = cntrDtlKeys.value.indexOf(curCntrDtlKey.value);
  curCntrDtlKey.value = cntrDtlKeys.value[curIdx - 1];
}

function onClickNextDtl() {
  const curIdx = cntrDtlKeys.value.indexOf(curCntrDtlKey.value);
  curCntrDtlKey.value = cntrDtlKeys.value[curIdx + 1];
}
/* endregion [about dtl array control] */

/* region [계약주소지 adrpc] */
const frmAdrpcRef = ref(getComponentType('KwForm'));
const adrpcBulkApplied = ref(false);

function clearAdrpcs() {
  adrpcs.value = [];
}

function addAdrpc(newAdrpc) {
  getAdrpcTempKey(newAdrpc);
  adrpcs.value.push(newAdrpc);
}

function equalsAdrpc(adr1, adr2) {
  return getAdrpcTempKey(adr1) === getAdrpcTempKey(adr2);
}

async function onClickAddRectRgstAdr(dtl) {
  if (adrpcs.value.length === 10) {
    await alert('주소는 10개까지만 등록 가능합니다.');
    return;
  }
  const { adrpc } = dtl;
  const newAdr = { ...adrpc };
  if (!await frmAdrpcRef.value.validate()) {
    return;
  }
  if (!newAdr.adrId) {
    await alert('올바른 주소를 입력해주세요.');
    return;
  }
  if (adrpcs.value.find((adr) => equalsAdrpc(adr, newAdr))) {
    alert('이미 등록된 주소입니다.');
    return;
  }
  addAdrpc(newAdr);
  adrsVal.value = '';
}

function onClickRectRgstAdr(dtl, adr) {
  dtl.adrpc = { ...adr };
}

function onClickDeleteRectRgstAdr(delAdr) {
  adrsVal.value = undefined;
  adrpcs.value = adrpcs.value.filter((adr) => !equalsAdrpc(adr, delAdr));
}

function onBulkApplyAdrpc() {
  const modifyFields = [
    'rcgvpKnm',
    'cntrtRelCd',
    'cralLocaraTno',
    'mexnoEncr',
    'cralIdvTno',
    'locaraTno',
    'exnoEncr',
    'idvTno',
    'zipCode',
    'add1',
    'add2',
    'addKey',
    'adrDvCd',
  ];
  step3.value.dtls.forEach((dtl) => {
    dtl.adrpc ??= {};
    modifyFields.forEach((field) => {
      dtl.adrpc[field] = curCntrDtl.value.adrpc[field];
    });
  });
  adrpcBulkApplied.value = true;

  frmAdrpcRef.value.init();
}

watchEffect(() => {
  if (frmAdrpcRef.value && frmAdrpcRef.value?.isModified()) {
    adrpcBulkApplied.value = false;
  }
});
/* endregion [계약주소지 adrpc] */

/* region [설치정보 wellsDtl] */
const frmWellsDtlRef = ref();
const wellsDtlBulkApplied = ref(false);

function onBulkApplyWellDtl() {
  const modifyFields = [
    'istPlcTpCd',
    'fmmbN',
    'useElectTpCd',
    'srcwtTpCd',
    'wprsItstTpCd',
    'istAkArtcMoCn',
  ];

  wellsDtlBulkApplied.value = true;
  step3.value.dtls.forEach((dtl) => {
    dtl.wellsDtl ??= {};
    modifyFields.forEach((field) => {
      dtl.wellsDtl[field] = curCntrDtl.value.wellsDtl[field];
    });

    // 타공 설치 방식은 해당 계약이 해당 타공 유형을 지원할 때만 적용합니다.
    const bulkAppliedWrfrIstMthCd = curCntrDtl.value.wellsDtl.wrfrIstMthCd;
    if (bulkAppliedWrfrIstMthCd && dtl.wellsDtl.wrfrIstMthCds?.includes(bulkAppliedWrfrIstMthCd)) {
      dtl.wellsDtl.wrfrIstMthCd = bulkAppliedWrfrIstMthCd;
    }
  });

  frmWellsDtlRef.value.init();
}

watchEffect(() => {
  if (frmWellsDtlRef.value && frmWellsDtlRef.value?.isModified()) {
    wellsDtlBulkApplied.value = false;
  }
});
/* endregion [설치정보 wellsDtl] */

/* region [결제정보 stlm] */
const sodbtNftfCntr = computed({
  get: () => step3.value?.bas?.cstStlmInMthCd === '30' || false,
  set(value) {
    if (!step3.value?.bas) { return; }
    step3.value.bas.cstStlmInMthCd = value ? '30' : undefined;
  },
}); // 총판 비대면 여부

const frmStlmRef = ref();
const stlmBulkApplied = ref(false);
const ableToStlmBulkApply = computed(() => step3.value?.dtls.length > 1
  && !step3.value?.dtls.some((dtl) => dtl.sellTpCd === SELL_TP_CD.SPAY));
const totalSpayAmt = computed(() => step3.value?.dtls
  ?.reduce((sum, cntrDtl) => (sum + (getSpayAmtByCntrDtl(cntrDtl) || 0)), 0));

async function fetchRegularFundTransferDayOptions() {
  // 계좌 자동이체 기준을 우선 따릅니다.
  const { data } = await dataService.get(`/sms/common/contract/settlement/regular-fund-transfers-day-options/${DP_TP_CD.AC_AFTN}`);
  mpyBsdtOptions.value = data?.map((value) => ({ codeId: value, codeName: `${value}일` }));
}

await fetchRegularFundTransferDayOptions();

function onChangeCntram1(dtl) {
  if (Number(dtl.cntrAmtCrd || 0) > Number(dtl.fnlAmt || 0)) {
    alert('계약금이 결제금액보다 클 수 없습니다.');
    dtl.cntrAmtCrd = dtl.fnlAmt;
  }
  dtl.cntrAmtVac = Number(dtl.fnlAmt || 0) - Number(dtl.cntrAmtCrd || 0);
  dtl.crpUcAmt = 0;
}

function onChangeCntram2(dtl) {
  if (Number(dtl.cntrAmtVac || 0) > Number(dtl.fnlAmt || 0)) {
    alert('계약금이 결제금액보다 클 수 없습니다.');
    dtl.cntrAmtVac = dtl.fnlAmt;
  }
  dtl.cntrAmtCrd = Number(dtl.fnlAmt || 0) - Number(dtl.cntrAmtVac || 0);
  dtl.crpUcAmt = 0;
}

function onChangeCrpUcAmt(dtl) {
  if (Number(dtl.crpUcAmt || 0) > 0) {
    if (Number(dtl.fnlAmt || 0) > Number(dtl.crpUcAmt || 0)) {
      alert('법인미수금은 결제금액과 같아야 합니다.');
    }
    dtl.crpUcAmt = dtl.fnlAmt;
    dtl.cntrAmtVac = 0;
    dtl.cntrAmtCrd = 0;
  }
}

function onBulkApplyStlm() {
  const modifyFields = [
    'txinvPblOjYn',
    'dpTpCdAftn',
    'mpyBsdt',
    'dpTpCdIdrv',
  ];

  stlmBulkApplied.value = true;
  step3.value.dtls.forEach((dtl) => {
    modifyFields.forEach((field) => {
      dtl[field] = curCntrDtl.value[field];
    });
  });

  frmStlmRef.value.init();
}

watchEffect(() => {
  if (frmStlmRef.value && frmStlmRef.value?.isModified()) {
    stlmBulkApplied.value = false;
  }
});
/* endregion [결제정보 wellsDtl] */

const loaded = ref(false);

async function getCntrInfo() {
  if (!cntrNo.value) {
    await alert('잘못된 접근입니다.');
    return;
  }
  const { data } = await dataService.get('sms/wells/contract/contracts/cntr-info', {
    params: {
      cntrNo: cntrNo.value,
      step: 3,
    },
  });
  step3.value = data.step3;

  clearAdrpcs();
  addAdrpc(step3.value.basAdrpc);

  if (!step3.value?.dtls.length) {
    warn('계약상세가 비었습니다!');
    return;
  }

  cntrDtlKeys.value = [];
  step3.value.dtls.forEach((dtl) => {
    cntrDtlKeys.value.push(getDtlTempKey(dtl));
    if (dtl.sellTpCd === SELL_TP_CD.SPAY) {
      if (!dtl.cntrAmtCrd && !dtl.cntrAmtVac && !dtl.crpUcAmt) {
        dtl.cntrAmtCrd = Number(dtl.fnlAmt || 0);
        dtl.cntrAmtVac = 0;
        dtl.crpUcAmt = 0;
      }
    } else {
      dtl.dpTpCdAftn ??= DP_TP_CD.CRDCD_AFTN;
      dtl.dpTpCdIdrv ??= DP_TP_CD.IDV_RVE_CRDCD;
    }
  });

  curCntrDtlKey.value = getDtlTempKey(step3.value.dtls?.[0]);
  ogStep3.value = cloneDeep(step3.value);
}

async function initStep(forced = false) {
  if (!forced && loaded.value) {
    return;
  }
  if (cntrNo.value) {
    await getCntrInfo();
    loaded.value = true;
  }
}

exposed.getCntrInfo = getCntrInfo;
exposed.isChangedStep = isChangedStep;
exposed.isValidStep = isValidStep;
exposed.initStep = initStep;
exposed.loaded = loaded;
exposed.saveStep = saveStep;

onActivated(() => {
  initStep();
  emit('activated', 1);
});
</script>

<style lang="scss" scoped>
@import "kw-lib/src/css/mixins";

:deep(.scoped-mpy-bsdt-select) {
  flex: 0 0 160px !important;

  .q-field__native {
    justify-content: flex-end;
    padding-right: $spacing-xs;
  }
}

.scoped-radio-multiline {
  flex: none;
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  column-gap: $spacing-lg;
}

:deep(.scoped-radio--removable) {
  min-height: 40px;
  height: 40px;

  &.spaced-sibling + .spaced-sibling {
    margin-left: 0;
  }

  .q-radio__inner--falsy {
    & ~ .q-radio__label {
      font-weight: 500;
    }
  }

  .q-radio__label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 14px;
    color: $black1;
  }
}

.scoped-sub-title-area {
  @include typo("subtitle", 500);

  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;

  &__main {
    flex: 1 1 1px;
  }

  > .kw-btn {
    margin-left: $spacing-xs;
  }
}
</style>
