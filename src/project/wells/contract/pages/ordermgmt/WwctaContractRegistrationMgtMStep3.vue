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
  >
    <template
      v-for="(item, idx) in step3.dtls"
      :key="idx"
    >
      <div
        v-if="item.cntrSn === dtlSn"
        class="pr20"
      >
        <div class="row justify-between">
          <div class="row items-center">
            <h3 class="my0">
              {{ item.pdClsfNm }}
              <kw-separator
                spaced
                vertical
                class="mx12 my5"
              />
              {{ item.pdNm }}
            </h3>
          </div>
          <div class="row items-center">
            <p
              v-if="item.sellTpCd === '1'"
              class="kw-fc--primary kw-font-subtitle"
            >
              {{ getNumberWithComma(item.fnlAmt || 0) }}원
            </p>
            <p
              v-else
              class="kw-fc--primary kw-font-subtitle"
            >
              월 {{ getNumberWithComma(item.fnlAmt || 0) }}원({{ item.stplPtrm }}개월)
            </p>

            <div class="row items-center ml20">
              <kw-btn
                icon="arrow_left_24"
                borderless
                class="kw-font-pt24"
                :disable="item.blkApy === 'Y'"
                @click="onClickPrevDtlSn"
              />
              <p class="kw-font-pt18 kw-fc--black1 mx4">
                <span>{{ dtlSn }}</span>
                <span class="kw-fc--placeholder">/{{ step3.dtls.length }}</span>
              </p>
              <kw-btn
                icon="arrow_right_24"
                borderless
                class="kw-font-pt24"
                :disable="item.blkApy === 'Y'"
                @click="onClickNextDtlSn"
              />
            </div>
          </div>
        </div>

        <kw-separator class="mt20" />

        <kw-action-top>
          <template #left>
            <h3>설치 및 배송 주소</h3>
          </template>
          <kw-btn
            label="주소등록"
            dense
            @click="onClickAddRectRgstAdr(item)"
          />
        </kw-action-top>
        <kw-observer
          ref="obsAdrRef"
        >
          <kw-form
            :cols="2"
            class="mt20"
          >
            <kw-form-row>
              <kw-form-item
                label="주소 선택"
                :colspan="2"
              >
                <div class="row items-start justify-between full-width ">
                  <div
                    class="row items-start radio-multiline"
                    style=" width: calc(100% - 90px); gap: 0 20px;"
                  >
                    <kw-field
                      name="radio"
                    >
                      <template #default="{ field }">
                        <kw-radio
                          v-for="(adr, i) in adrs"
                          v-show="i < 5"
                          v-bind="field"
                          :key="i"
                          v-model="adrsVal"
                          class="radio-close-button"
                          :val="i"
                          @update:model-value="onClickRectRgstAdr(item, adr)"
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
                      </template>
                    </kw-field>
                    <div
                      v-if="showAllAdrs"
                      class="second-line"
                    >
                      <kw-field
                        name="radio"
                      >
                        <template #default="{ field }">
                          <kw-radio
                            v-for="(adr, i) in adrs"
                            v-show="i >= 5"
                            v-bind="field"
                            :key="i"
                            v-model="adrsVal"
                            class="radio-close-button"
                            :val="i"
                            @update:model-value="onClickRectRgstAdr(item, adr)"
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
                        </template>
                      </kw-field>
                    </div>
                  </div>
                  <kw-btn
                    :icon-right="showAllAdrs ? 'arrow_up' : 'arrow_down'"
                    dense
                    borderless
                    label="더보기"
                    class="kw-fc--black3 kw-font-pt14 self-start mt9"
                    @click="showAllAdrs = !showAllAdrs"
                  />
                </div>
              </kw-form-item>
            </kw-form-row>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_RECIPIENT')"
                required
              >
                <kw-input
                  v-model="item.adrpc.rcgvpKnm"
                  :label="$t('MSG_TXT_RECIPIENT')"
                  rules="required|max:15"
                  :maxlength="15"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_MPNO')"
                required
              >
                <zwcm-telephone-number
                  v-model:tel-no1="item.adrpc.cralLocaraTno"
                  v-model:tel-no2="item.adrpc.mexnoEncr"
                  v-model:tel-no3="item.adrpc.cralIdvTno"
                  required
                />
              </kw-form-item>
              <kw-form-item
                :label="$t('MSG_TXT_TEL_NO')"
              >
                <zwcm-telephone-number
                  v-model:tel-no1="item.adrpc.locaraTno"
                  v-model:tel-no2="item.adrpc.exnoEncr"
                  v-model:tel-no3="item.adrpc.idvTno"
                  area
                  required
                />
              </kw-form-item>
            </kw-form-row>
          </kw-form>
          <kw-form
            :cols="1"
            class="mt16"
          >
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_ADDR')"
                :colspan="2"
              >
                <zwcm-post-code
                  v-model:zipCode="item.adrpc.zip"
                  v-model:add1="item.adrpc.adr"
                  v-model:add2="item.adrpc.adrDtl"
                  v-model:addKey="item.adrpc.adrId"
                  v-model:adrDvCd="item.adrpc.adrDvCd"
                  class="kw-grow"
                />
              </kw-form-item>
            </kw-form-row>
          </kw-form>
          <kw-form
            :cols="2"
            class="mt16"
          >
            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_REL_CNTRT')"
                required
              >
                <kw-select
                  v-model="item.adrpc.cntrtRelCd"
                  :options="codes.CNTRT_REL_CD"
                />
              </kw-form-item>
            </kw-form-row>
          </kw-form>
        </kw-observer>
        <kw-separator />

        <h3>설치환경 및 요청사항</h3>

        <kw-form
          :cols="2"
          class="mt20"
        >
          <template
            v-if="item.sellTpCd === '1' || item.sellTpCd === '2'"
          >
            <kw-form-row>
              <kw-form-item
                label="장소"
              >
                <kw-select
                  v-model="item.wellsDtl.istPlcTpCd"
                  :options="codes.IST_PLC_TP_CD"
                />
              </kw-form-item>
              <kw-form-item
                v-if="item.sellTpCd === '2' && item.sellTpDtlCd === '23'"
                label="가구 구성원 수"
              >
                <kw-select
                  v-model="item.wellsDtl.fmmbN"
                  :options="codes.FMMB_N"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item label="전압">
                <kw-option-group
                  v-model="item.wellsDtl.useElectTpCd"
                  type="radio"
                  :options="codes.USE_ELECT_TP_CD"
                />
              </kw-form-item>
              <kw-form-item label="수질">
                <kw-select
                  v-model="item.wellsDtl.srcwtTpCd"
                  :options="codes.SRCWT_TP_CD"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item label="수압">
                <kw-option-group
                  v-model="item.wellsDtl.wprsItstTpCd"
                  type="radio"
                  :options="codes.WPRS_ITST_TP_CD"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                label="요청사항"
                :colspan="2"
              >
                <kw-input
                  v-model="item.wellsDtl.istAkArtcMoCn"
                  type="textarea"
                  maxlength="333"
                />
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                label="참고사항"
                :colspan="2"
              >
                <p>{{ '' }}</p>
              </kw-form-item>
            </kw-form-row>
          </template>
          <template
            v-else
          >
            <kw-form-row>
              <kw-form-item
                label="요청사항"
                :colspan="2"
              >
                <kw-input
                  v-model="item.wellsDtl.istAkArtcMoCn"
                  type="textarea"
                  maxlength="333"
                />
              </kw-form-item>
            </kw-form-row>
          </template>
        </kw-form>

        <kw-separator />

        <h3>결제정보</h3>

        <kw-form
          :cols="2"
          class="mt20"
        >
          <kw-form-row
            v-if="ogTpCd === 'W05'"
          >
            <kw-form-item label=" 총판계약유형">
              <kw-field
                v-slot="{field}"
                v-model="item.sodbtNftfCntrYn"
                @change="onChangeSodbtNftfCntr"
              >
                <kw-checkbox
                  v-bind="field"
                  label="총판 비대면 계약여부"
                  :false-value="'N'"
                  :true-value="'Y'"
                />
              </kw-field>
            </kw-form-item>
          </kw-form-row>
          <template
            v-if="item.sodbtNftfCntrYn !== 'Y'"
          >
            <!-- 법인계약시 세금계산서 발행 선택 가능-->
            <kw-form-row
              v-if="step3.bas?.copnDvCd === '2'"
            >
              <kw-form-item
                :label="t('MSG_TXT_TXINV_PBL')"
              >
                <kw-option-group
                  v-model="item.txinvPblOjYn"
                  type="radio"
                  :options="codes.COD_YN"
                />
              </kw-form-item>
            </kw-form-row>
            <template
              v-if="item.sellTpCd === '1'"
            >
              <kw-form-row>
                <kw-form-item
                  no-label
                  :colspan="2"
                >
                  <h3 class="my0">
                    결제금액 : {{ getNumberWithComma(item.fnlAmt || 0) }}원
                  </h3>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item label="계약금(카드)">
                  <kw-input
                    v-model="item.cntrAmtCrd"
                    type="number"
                    align="right"
                    maxlength="10"
                    @blur="onChangeCntram1(item)"
                  />
                </kw-form-item>
                <kw-form-item label="계약금(가상계좌)">
                  <kw-input
                    v-model="item.cntrAmtVac"
                    type="number"
                    align="right"
                    maxlength="10"
                    @blur="onChangeCntram2(item)"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row
                v-if="item.recapMshPtrm > 0"
              >
                <kw-form-item label="멤버십계좌이체">
                  <kw-option-group
                    v-model="item.dpTpCdMsh"
                    type="radio"
                    :options="step3.bas?.copnDvCd === '2' ? codes.DP_TP_CD_AFTN_CRP : codes.DP_TP_CD_AFTN"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row
                v-if="item.recapMshPtrm > 0"
              >
                <kw-form-item
                  no-label
                  :colspan="2"
                >
                  <h3 class="my0">
                    멤버십 금액 : {{ getNumberWithComma(item.mshAmt || 0) }}원
                  </h3>
                </kw-form-item>
              </kw-form-row>
            </template>
            <template
              v-else
            >
              <kw-form-row
                :cols="3"
              >
                <kw-form-item
                  label="자동이체"
                  :colspan="2"
                >
                  <kw-option-group
                    v-model="item.dpTpCdAftn"
                    type="radio"
                    :options="step3.bas?.copnDvCd === '2' ? codes.DP_TP_CD_AFTN_CRP : codes.DP_TP_CD_AFTN"
                  />
                </kw-form-item>
                <kw-form-item no-label>
                  <p class="kw-fc--black2 kw-font-pt14 text-weight-regular">
                    월 렌탈료 : {{ getNumberWithComma((item.fnlAmt || 0) / (item.sellTpCd === '6' ? item.svPrd : 1)) }}원
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row
                :cols="3"
              >
                <kw-form-item
                  label="등록비결제유형"
                  :colspan="2"
                >
                  <kw-option-group
                    v-model="item.dpTpCdIdrv"
                    type="radio"
                    :options="codes.DP_TP_CD_IDRV"
                    :disable="Number(item.cntrAmt) === 0"
                  />
                </kw-form-item>
                <kw-form-item no-label>
                  <p class="kw-fc--black2 kw-font-pt14 text-weight-regular">
                    등록비 : {{ getNumberWithComma(item.cntrAmt || 0) }}원
                  </p>
                </kw-form-item>
              </kw-form-row>
            </template>
          </template>
          <kw-form-row
            v-if="isPsbBlkApy"
          >
            <kw-form-item
              no-label
              :colspan="2"
            >
              <kw-field
                v-slot="{field}"
                v-model="item.blkApy"
              >
                <kw-checkbox
                  v-bind="field"
                  label="설정한 조건 나머지 상품에도 일괄적용"
                />
              </kw-field>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
      </div>
    </template>
  </kw-scroll-area>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';
import ZwcmPostCode from '~common/components/ZwcmPostCode.vue';
import { codeUtil, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import { getNumberWithComma } from '~sms-common/contract/util';

const props = defineProps({
  contract: { type: Object, required: true },
});
const emit = defineEmits([
  'activated',
]);
const exposed = {};
defineExpose(exposed);

const { getters } = useStore();
const { ogTpCd } = getters['meta/getUserInfo'];
const dataService = useDataService();
const { notify, alert } = useGlobal();
const router = useRouter();
const codes = await codeUtil.getMultiCodes(
  'CNTRT_REL_CD',
  'IST_PLC_TP_CD',
  'WRFR_IST_MTH_CD',
  'SRCWT_TP_CD',
  'WPRS_ITST_TP_CD',
  'USE_ELECT_TP_CD',
  'HCR_DV_CD',
  'COD_YN',
);
codes.FMMB_N = [
  { codeId: 1, codeName: '1인 가구' },
  { codeId: 2, codeName: '2인 가구' },
  { codeId: 3, codeName: '3인 가구' },
  { codeId: 4, codeName: '4인 이상 가구' },
];

const cntrNo = toRef(props.contract, 'cntrNo');
const step3 = toRef(props.contract, 'step3');

const ogStep3 = ref({});
const { t } = useI18n();

codes.DP_TP_CD_IDRV = [
  { codeId: '0201', codeName: '카드' },
  { codeId: '0101', codeName: '가상계좌' },
];
codes.DP_TP_CD_AFTN = [
  { codeId: '0203', codeName: '카드이체' },
  { codeId: '0102', codeName: '계좌이체' },
];
codes.DP_TP_CD_AFTN_CRP = [
  { codeId: '0203', codeName: '카드이체' },
  { codeId: '0102', codeName: '계좌이체' },
  { codeId: '0104', codeName: '법인계좌' },
];
const adrs = ref([]);
const adrsVal = ref('');
const obsAdrRef = ref();
const dtlSn = ref(1);
const showAllAdrs = ref(false);
const isPsbBlkApy = ref(true);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function getCntrInfo() {
  if (!cntrNo.value) {
    await alert('잘못된 접근입니다.');
    router.go(-1);
    return;
  }
  const cntr = await dataService.get('sms/wells/contract/contracts/cntr-info', {
    params: {
      cntrNo: cntrNo.value,
      step: 3,
    },
  });
  step3.value = cntr.data.step3;
  adrs.value[0] = step3.value.basAdrpc;

  // 일괄적용 여부(렌탈이면서 유상멤버십기간, 판매유형코드, 판매유형상세코드 등이 일치해야 함)
  const baseDtl = step3.value.dtls[0];
  if (step3.value.dtls.length <= 1) {
    isPsbBlkApy.value = false;
  } else {
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const i in step3.value.dtls) {
      const dtl = step3.value.dtls[i];
      if (baseDtl.recapMshPtrm !== dtl.recapMshPtrm
          || baseDtl.sellTpCd !== dtl.sellTpCd
          || baseDtl.sellTpDtlCd !== dtl.sellTpDtlCd
          || dtl.sellTpCd !== '2') {
        isPsbBlkApy.value = false;
        break;
      }
    }
  }
  if (isPsbBlkApy.value) {
    step3.value.dtls.forEach((dtl) => {
      dtl.blkApy = 'N';
    });
  }
  ogStep3.value = cloneDeep(step3.value);
}

function isChangedStep() {
  return step3.value.bas.cntrPrgsStatCd < 14 || JSON.stringify(ogStep3.value) !== JSON.stringify(step3.value);
}

async function isValidStep() {
  if (step3.value.dtls.find((dtl) => (dtl.sellTpCd === '1' && (Number.isNaN(dtl.cntrAmt) || dtl.cntrAmt <= 0)))) {
    alert('일시불 계약금을 확인해주세요.');
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

async function onClickAddRectRgstAdr(dtl) {
  if (adrs.value.length === 10) {
    alert('주소는 10개까지만 등록 가능합니다.');
    return;
  }
  const newAdr = cloneDeep(dtl.adrpc);
  if (!await obsAdrRef.value[0].validate()) return;
  if (isEmpty(newAdr.adrId)) {
    alert('올바른 주소를 입력해주세요.');
    return;
  }
  if (!isEmpty(adrs.value.find((adr) => adr.rcgvpKnm === newAdr.rcgvpKnm
      && adr.cralLocaraTno === newAdr.cralLocaraTno
      && adr.mexnoEncr === newAdr.mexnoEncr
      && adr.cralIdvTno === newAdr.cralIdvTno
      && adr.locaraTno === newAdr.locaraTno
      && adr.exnoEncr === newAdr.exnoEncr
      && adr.idvTno === newAdr.idvTno
      && adr.adrId === newAdr.adrId))) {
    alert('이미 등록된 주소입니다.');
  } else {
    adrs.value.push(newAdr);
  }
  // radio 초기화
  adrsVal.value = '';
}

function onClickRectRgstAdr(dtl, adr) {
  dtl.adrpc = cloneDeep(adr);
}

function onClickDeleteRectRgstAdr(delAdr) {
  adrs.value = adrs.value.filter((adr) => adr.rcgvpKnm !== delAdr.rcgvpKnm
      || adr.cralLocaraTno !== delAdr.cralLocaraTno
      || adr.mexnoEncr !== delAdr.mexnoEncr
      || adr.cralIdvTno !== delAdr.cralIdvTno
      || adr.locaraTno !== delAdr.locaraTno
      || adr.exnoEncr !== delAdr.exnoEncr
      || adr.idvTno !== delAdr.idvTno
      || adr.adrId !== delAdr.adrId);
}

function onClickPrevDtlSn() {
  if (dtlSn.value > 1) dtlSn.value -= 1;
}

function onClickNextDtlSn() {
  if (dtlSn.value < step3.value.dtls.length) dtlSn.value += 1;
}

function onChangeCntram1(dtl) {
  if (Number(dtl.cntrAmtCrd || 0) > Number(dtl.fnlAmt || 0)) {
    alert('계약금이 결제금액보다 클 수 없습니다.');
    dtl.cntrAmtCrd = dtl.fnlAmt;
  }
  dtl.cntrAmtVac = Number(dtl.fnlAmt || 0) - Number(dtl.cntrAmtCrd || 0);
}

function onChangeCntram2(dtl) {
  if (Number(dtl.cntrAmtVac || 0) > Number(dtl.fnlAmt || 0)) {
    alert('계약금이 결제금액보다 클 수 없습니다.');
    dtl.cntrAmtVac = dtl.fnlAmt;
  }
  dtl.cntrAmtCrd = Number(dtl.fnlAmt || 0) - Number(dtl.cntrAmtVac || 0);
}

function onChangeSodbtNftfCntr(v) {
  step3.value.dtls.forEach((dtl) => {
    dtl.sodbtNftfCntrYn = v;
  });
}

const loaded = ref(false);

async function initStep(forced = false) {
  if (!forced && loaded.value) { return; }

  await getCntrInfo();
  loaded.value = true;
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
.normal-area--button-set-bottom {
  max-height: calc(100vh - 222px);
  min-height: 715px;
}

.step-list {
  margin: 0;
  padding-left: 0;
  list-style: none;

  & > li {
    &::after {
      content: "";
      display: block;
      margin: 12px 0;
      border-bottom: 1px solid $line-bg;
    }

    &:last-child::after {
      display: none;
    }
  }

  &-title {
    color: $black3;

    span {
      display: inline-block;
      width: 20px;
      height: 20px;
      margin-right: 4px;
      text-align: center;
      line-height: 1.4;
      border-radius: 100%;
      border: 1px solid $line-stroke;
      font-size: 14px;
      color: $black3;
      font-weight: 500;
    }

    &--checked {
      span {
        border: none;
        position: relative;
        background: $line-bg;
        font-size: 0;
        vertical-align: text-bottom;

        &::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 15px;
          height: 20px;
          background: url("~@assets/icons/checked_stepper.svg") center no-repeat;
          background-size: contain;
        }
      }
    }

    &--active {
      color: #2f3c78;
      font-weight: 500;

      span {
        border: none;
        color: #fff;
        background: #2f3c78;
      }
    }
  }

  &-content {
    margin-top: 12px;
    padding: 12px 20px;
    background-color: #f5f5f5;

    &--blue-bg {
      padding: 20px;
      background: rgb(47 138 243 / 10%);
    }
  }
}

.setting-box {
  width: 100%;
  margin: 0;
  padding-left: 0;
  list-style: none;

  .kw-field {
    &.kw-input,
    &.kw-select {
      background-color: #fff;
    }
  }

  li {
    display: flex;
    align-items: center;

    & + li {
      margin-top: 16px;
    }

    div + div {
      margin-left: 40px;
    }
  }

  &-main {
    width: 240px;

    p {
      color: $black1;

      span {
        margin-left: 4px;
        color: $primary;
      }
    }

    &--subtitle {
      font-size: 14px;
      color: #555;
      width: 100%;

      &::before {
        content: "";
        display: inline-block;
        margin-bottom: 5px;
        margin-right: 4.5px;
        width: 9px;
        height: 8.5px;
        border-left: 1px solid $line-stroke;
        border-bottom: 1px solid $line-stroke;
      }
    }
  }

  &-middle {
    width: 250px;
  }

  span {
    font-size: 14px;
    color: #555;
  }
}

.product {
  &-inside {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  &-left-area {
    width: 100%;
    display: flex;
    align-items: flex-start;
  }

  &-type {
    width: 60px;
    margin-right: 8px;
    font-size: 14px;
    color: $black3;
    white-space: normal;
  }

  &-content {
    display: flex;
    align-items: flex-start;
    width: 100%;
    flex-direction: column;
    gap: 12px 0;
  }

  .kw-btn {
    align-self: flex-start;
  }

  .setting-box {
    padding-left: 68px;
    padding-right: 44px;
    margin-top: 12px;
    width: 100%;

    li + li {
      margin-top: 12px;
    }

    .form-full-size {
      column-gap: 8px;

      .kw-date-picker {
        min-width: 150px;
      }

      .kw-input,
      .kw-select {
        min-width: calc(100% / 4);
        flex: 10000 1 0%;
      }
    }
  }

  .sub-content {
    display: flex;
    align-items: center;
    width: calc(100% - 28px);
    margin-top: 12px;

    .sub-content-title {
      width: 68px;
      padding-right: 8px;
      font-size: 14px;
      color: $black3;
    }

    &-middle {
      width: calc(100% - 68px);
      align-items: center;
      justify-content: space-between;
      display: flex;
    }

    & + .sub-content {
      margin-top: 12px;
    }

    &:last-child {
      margin-bottom: 20px;
    }
  }
}

// rev;230405 스타일 수정
.radio-multiline {
  &::v-deep(.kw-radio) {
    min-height: 40px;
    height: 40px;
    margin-right: 20px;

    &.radio-close-button {
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
  }

  // // rev;230405 스타일 수정

  .second-line {
    display: inline-flex;
    gap: 12px 20px;
    min-height: 24px;
  }
}

</style>
