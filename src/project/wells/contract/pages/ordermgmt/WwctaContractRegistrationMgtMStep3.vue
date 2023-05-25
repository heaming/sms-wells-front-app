<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : [CTA] 통합계약서 작성 Step3
2. 프로그램 ID : EwctaContractRegistrationMgtMStep3
3. 작성자 : gs.piit159
4. 작성일 : 2023.04.05
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 통합계약서 작성 Step1
****************************************************************************************************
--->
<template>
  <kw-scroll-area
    visible
    class="h490"
  >
    <div class="pr40">
      <h3 class="mt0">
        {{ $t('MSG_TXT_SPP_INF') }}
      </h3>

      <kw-form :cols="2">
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_RECIPIENT')"
            required
          >
            <kw-input
              v-model="step3.rcgvpKnm"
              :label="$t('MSG_TXT_RECIPIENT')"
              rules="required"
              maxlength="100"
            />
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_MPNO')"
            required
          >
            <zwcm-telephone-number
              v-model:tel-no1="step3.cralLocaraTno"
              v-model:tel-no2="step3.mexnoEncr"
              v-model:tel-no3="step3.cralIdvTno"
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
            required
          >
            <zwcm-post-code
              v-model:zipCode="step3.zip"
              v-model:add1="step3.adr"
              v-model:add2="step3.adrDtl"
              v-model:addKey="step3.adrId"
              v-model:adrDvCd="step3.adrDvCd"
              class="kw-grow"
              readonly
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
            :label="$t('MSG_TXT_SPP_HOP_DT')"
            required
          >
            <kw-date-picker
              v-model="step3.sppDuedt"
              :label="$t('MSG_TXT_SPP_HOP_DT')"
              rules="required"
              class="w160"
            />
            <kw-select
              v-model="step3.sppMthdTpCd"
              :options="codes.SPP_MTHD_TP_CD.filter((v) => ['1', '2'].includes(v.codeId))"
            />
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_REL_CNTRT')"
            required
          >
            <kw-select
              v-model="step3.cntrtRelCd"
              :label="$t('MSG_TXT_REL_CNTRT')"
              :options="codes.CNTRT_REL_CD"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />

      <h3>{{ $t('MSG_TXT_STLM_INF') }}</h3>

      <kw-form :cols="2">
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_PMT_TYP')"
          >
            <kw-option-group
              v-model="step3.stlmTpCd"
              type="radio"
              :options="codes.STLM_TP_CD"
            />
          </kw-form-item>
          <kw-form-item
            v-if="'10' === step3.stlmTpCd"
            :label="$t('MSG_TXT_SEA_CRD_INF')"
            hint="a"
          >
            <kw-btn
              padding="12px"
              secondary
              :label="$t('MSG_TXT_CDCO_ISTM_GUD')"
              class="mr8"
            />
          </kw-form-item>
          <kw-form-item
            v-if="'20' === step3.stlmTpCd"
            :label="$t('MSG_TXT_SEA_CRD_INF')"
            hint="a"
          >
            <kw-btn
              padding="12px"
              secondary
              :label="$t('MSG_TXT_AG_CHAR_FW')"
              class="mr8"
            />
            <kw-btn
              padding="12px"
              secondary
              :label="$t('MSG_TXT_SEA_CRD_INF')"
            />
          </kw-form-item>
          <!-- // 할부 선택시 활성화  -->
        </kw-form-row>

        <!-- // 할부 -->
        <template
          v-if="'20' === step3.stlmTpCd"
        >
          <h3>계약금 결제정보</h3>
          <kw-form>
            <kw-form-item
              :label="$t('MSG_TXT_STLM_MTHD')"
            >
              <kw-option-group
                v-model="step3.cntramDpTpCd"
                type="radio"
                :options="codes.DP_TP_CD"
              />
            </kw-form-item>
          </kw-form>

          <kw-form-row
            v-for="(mlg, mi) in step3.mlgs"
            :key="mi"
          >
            <kw-form-item
              :label="codes.MLG_TP_CD.find((code) => code.codeId === mlg.mlgTpCd)?.codeName +'(원)'"
            >
              <p>
                보유: {{ stringUtil.getNumberWithComma(mlg.mlgResAmt||0) }}
              </p>
              <p>
                &nbsp;잔여: {{ stringUtil.getNumberWithComma(mlg.resResAmt||0) }}
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item label="계약금(원)">
              <p>
                {{ stringUtil.getNumberWithComma(
                  Number(step3.dtls.reduce((acc, cur) => Number(acc) + Number(cur.cntrAmt), 0)) || 0
                ) }}
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :colspan="2"
              no-label
            >
              <ul class="scoped-setting-box kw-bc--bg-box px30 py20">
                <template
                  v-for="dtl in step3.dtls"
                  :key="dtl.cntrSn"
                >
                  <li>
                    <div class="scoped-setting-box-main w270">
                      <p class="ellipsis">
                        {{ dtl.basePdCd }}
                        <kw-tooltip>
                          {{ dtl.basePdCd }}
                        </kw-tooltip>
                      </p>
                      <span>
                        ({{ stringUtil.getNumberWithComma(dtl.fnlAmt || 0) }}원)
                      </span>
                    </div>
                    <div class="scoped-setting-box-middle row w300">
                      <kw-input
                        v-model="dtl.cntram"
                        type="number"
                        align="right"
                        class="w190 ml8"
                        maxlength="10"
                        :max="Number(dtl.fnlAmt || 0) - Number(dtl.cntrAmt || 0) + Number(dtl.cntram || 0)"
                        @keydown="onChangeCntram(dtl)"
                        @blur="onChangeCntram(dtl)"
                        @clear="onClearCntram(dtl)"
                      />
                    </div>
                    <div class="scoped-setting-box-middle">
                      <kw-field
                        v-slot="{field}"
                        v-model="dtl.mlgYn"
                      >
                        <kw-checkbox
                          v-bind="field"
                          :label="$t('MSG_TXT_MLG_USE')"
                          :false-value="'N'"
                          :true-value="'Y'"
                        />
                      </kw-field>
                    </div>
                  </li>
                  <!-- 마일리지 활성화 시 보여짐 -->
                  <li>
                    <div class="scoped-setting-box-main scoped-setting-box-main--subtitle w270">
                      <span>계약금액({{ stringUtil.getNumberWithComma(dtl.cntrAmt || 0) }}원)</span>
                    </div>
                    <ul
                      v-if="'Y' === dtl.mlgYn"
                      class="scoped-setting-box-options"
                    >
                      <li
                        v-for="(stlmRel, stlmIdx) in dtl.stlmRels"
                        :key="stlmIdx"
                        class="scoped-setting-box-options-item"
                      >
                        <div class="scoped-setting-box-options-form">
                          <span class="scoped-setting-box-options-form-label">
                            {{ codes.MLG_TP_CD.find((code) => code.codeId === stlmRel.dpTpCd)?.codeName }}
                          </span>
                          <span
                            v-if="stlmRel.mlgTpCd === '0702'"
                            class="mr12 w50 text-right"
                          >
                            0
                          </span>
                          <kw-input
                            v-model="stlmRel.stlmAmt"
                            type="number"
                            align="right"
                            maxlength="10"
                            :max="Math.min(
                              Number(step3.mlgs.find((mlg) => mlg.mlgTpCd === stlmRel.dpTpCd)?.resResAmt || 0),
                              Number(dtl.fnlAmt || 0) - Number(dtl.cntrAmt || 0)
                            ) + Number(stlmRel.stlmAmt || 0)"
                            @keydown="onChangeCntramMlg(dtl, stlmRel)"
                            @blur="onChangeCntramMlg(dtl, stlmRel)"
                            @clear="onClearCntramMlg(dtl, stlmRel)"
                          />
                        </div>
                      </li>
                    </ul>
                  </li>
                </template>
                <!-- //마일리지 활성화 시 보여짐 -->
              </ul>
            </kw-form-item>
          </kw-form-row>
        </template>
      </kw-form>

      <!-- // 할부 -->
      <template
        v-if="'20' === step3.stlmTpCd"
      >
        <kw-form :cols="2">
          <kw-form-row>
            <kw-form-item label="결제방법">
              <kw-option-group
                v-model="step3.intamDpTpCd"
                type="radio"
                :options="codes.ISTM_DP_TP_CD"
              />
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item label="할부개월">
              <kw-option-group
                v-model="step3.istmMcn"
                type="radio"
                :options="[12, 24]"
                @change="onChangeIstmMcn"
              />
              <kw-field
                v-slot="{field}"
                v-model="step3.idvIstmYn"
                @change="onChangeIstmMcn"
              >
                <kw-checkbox
                  v-bind="field"
                  label="세부설정"
                  :false-value="'N'"
                  :true-value="'Y'"
                />
              </kw-field>
            </kw-form-item>
          </kw-form-row>
          <!-- 세부설정 활성화 시 열림 -->
          <kw-form-row>
            <kw-form-item
              :colspan="2"
              no-label
            >
              <ul class="scoped-setting-box kw-bc--bg-box px30 py20">
                <template
                  v-for="dtl in step3.dtls"
                  :key="dtl.cntrSn"
                >
                  <li>
                    <div class="scoped-setting-box-main">
                      <p>{{ dtl.basePdCd }}</p>
                      <span>
                        ({{ stringUtil.getNumberWithComma(dtl.istmStlmAmt || 0) }}원)
                      </span>
                    </div>
                    <div class="scoped-setting-box-middle">
                      <kw-select
                        v-model="dtl.istmMcn"
                        :options="[12, 24]"
                        :disable="step3.idvIstmYn === 'N'"
                        @change="calcDtlAmts(dtl)"
                      />
                    </div>
                    <div class="scoped-setting-box-last">
                      <span>월 {{ stringUtil.getNumberWithComma(dtl.mmIstmAmt || 0) }}원</span>
                    </div>
                  </li>
                </template>
              </ul>
            </kw-form-item>
          </kw-form-row>
        <!-- // 세부설정 활성화 시 열림 -->
        </kw-form>
        <kw-separator class="mt16 mb0" />
        <ul class="kw-inquiry-result__list kw-inquiry-result__list--bottom pb20">
          <li class="row">
            <p class="kw-font-subtitle">
              <span>{{ $t('MSG_TXT_TOT_STLM_AMT') }}</span>
            </p>
            <div class="col">
              <span class="kw-font-subtitle">{{ stringUtil.getNumberWithComma(
                Number(step3.dtls.reduce((acc, cur) => Number(acc) + Number(cur.fnlAmt), 0))
              ) }}원</span>
            </div>
          </li>
          <li class="row">
            <p class="kw-font-subtitle">
              <span>선납금 일시불</span>
            </p>
            <div class="col">
              <span class="kw-font-subtitle">{{ stringUtil.getNumberWithComma(
                Number(step3.dtls.reduce((acc, cur) => Number(acc) + Number(cur.cntrAmt), 0))
              ) }}원</span>
            </div>
          </li>
          <li class="row">
            <p class="kw-font-subtitle kw-fc--primary">
              <span>총 월 할부금</span>
            </p>
            <div class="col">
              <span class="kw-font-subtitle kw-fc--primary">{{ stringUtil.getNumberWithComma(
                Number(step3.dtls.reduce((acc, cur) => Number(acc) + Number(cur.istmStlmAmt), 0))
              ) }}원</span>
            </div>
          </li>
        </ul>
      </template>
    </div>
  </kw-scroll-area>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';
import ZwcmPostCode from '~common/components/ZwcmPostCode.vue';
import { codeUtil, stringUtil, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { notify } = useGlobal();
const props = defineProps({
  contract: { type: String, required: true },
});
const { step3 } = toRefs(props.contract);
const ogStep3 = ref({});
const { t } = useI18n();
const codes = await codeUtil.getMultiCodes(
  'STLM_TP_CD',
  'SPP_MTHD_TP_CD',
  'CNTRT_REL_CD',
  'MLG_TP_CD',
);
codes.DP_TP_CD = [
  { codeId: '0201', codeName: '카드' },
  { codeId: '0101', codeName: '가상계좌' },
];
codes.ISTM_DP_TP_CD = [
  { codeId: '0203', codeName: '카드자동이체' },
];
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
function calcDtlAmts(dtl) {
  // 금액 계산
  const cntramMlgs = Number(dtl.stlmRels.reduce((acc, cur) => Number(acc) + Number(cur.stlmAmt), 0));
  dtl.cntrAmt = Number(dtl.cntram || 0) + Number(cntramMlgs || 0);
  dtl.istmStlmAmt = Number(dtl.fnlAmt || 0) - Number(dtl.cntrAmt || 0); // 계약결제관계의 결제금액
  dtl.mmIstmAmt = Math.floor(Number(dtl.istmStlmAmt || 0) / Number(dtl.istmMcn || 1)); // 월할부금액
}
function onChangeCntram(dtl) {
  calcDtlAmts(dtl);
}
function onClearCntram(dtl) {
  dtl.cntram = 0;
  onChangeCntram(dtl);
}
function onChangeCntramMlg(dtl, stlmRel) {
  // 마일리지별 잔액 계산 ~ 계약상세별 계약결제관계 중 해당 마일리지코드와 일치하는 결제관계의 금액의 총합
  // step3의 mlgs(마일리지)와 dtls 내부의 stlmRels는 유사하지만 한 화면에서 CRU가 이루어지므로 복잡한 구조를 갖게 됨
  const m = step3.value.mlgs.find((mlg) => mlg.mlgTpCd === stlmRel.dpTpCd);
  const usingMlgAmt = step3.value.dtls.reduce((acc, cur) => Number(acc) + Number(
    cur.stlmRels.filter((stlm) => stlm.dpTpCd === stlmRel.dpTpCd).reduce((a, c) => Number(a) + Number(c.stlmAmt), 0),
  ), 0);
  m.resResAmt = Number(m.mlgResAmt || 0) - Number(usingMlgAmt || 0);
  calcDtlAmts(dtl);
}
function onClearCntramMlg(dtl, stlmRel) {
  stlmRel.stlmAmt = 0;
  onChangeCntramMlg(dtl, stlmRel);
}

function onChangeIstmMcn() {
  step3.value.dtls.forEach((dtl) => {
    dtl.istmMcn = step3.value.istmMcn;
    calcDtlAmts(dtl);
  });
}

async function getCntrInfo(cntrNo) {
  const cntr = await dataService.get('sms/edu/contract/contracts/cntr-info', { params: { cntrNo, step: 3 } });
  step3.value = cntr.data.step3;
  console.log(step3.value);

  step3.value.mlgs.forEach((mlg) => {
    mlg.resResAmt = mlg.mlgResAmt;
  });
  step3.value.dtls.forEach((dtl) => {
    onChangeCntram(dtl);
  });
  ogStep3.value = cloneDeep(step3.value);
}

function isChangedStep() {
  return JSON.stringify(ogStep3.value) !== JSON.stringify(step3.value);
}

async function saveStep() {
  const savedCntr = await dataService.post('sms/edu/contract/contracts/save-cntr-step3', step3.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  ogStep3.value = cloneDeep(step3.value);
  return savedCntr?.data?.key;
}

defineExpose({
  getCntrInfo,
  isChangedStep,
  saveStep,
});
onMounted(async () => {
});
</script>
<style scoped lang="scss">
// rev:230512 css 수정
.scoped-setting-box {
  width: 100%;
  margin: 0;
  list-style: none;

  .kw-field {
    &.kw-input,
    &.kw-select {
      background-color: #fff;
    }
  }

  > li {
    display: flex;
    align-items: center;
    gap: 0 20px;

    & + li {
      margin-top: 16px;
    }
  }

  &-main {
    min-width: 350px;
    width: 350px;
    display: flex;
    align-items: baseline;

    p {
      display: inline-block;
      padding-right: 4px;
      font-size: 16px;
      color: $black1;

      &.ellipsis {
        max-width: 167px;
      }
    }

    span {
      font-size: 14px;
      color: $primary;
    }

    &--subtitle {
      font-size: 14px;
      color: #555;
      padding: 10px 0;

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

      span {
        font-size: 14px;
        color: #555;
      }
    }
  }

  &-middle {
    min-width: 250px;
    width: 250px;
  }

  &-last {
    span {
      font-size: 14px;
      color: $black2;
    }
  }

  &-options {
    display: flex;
    align-items: center;
    gap: 12px;

    &-item {
      display: flex;
      margin-top: 16px;
      gap: 0 12px;

      & + .scoped-setting-box-options-item {
        margin-top: 0;
      }

      ::v-deep(.kw-input) {
        width: 120px;
      }

      &:first-child {
        margin-top: 0;
      }
    }

    &-form {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      flex-shrink: 1 1 auto;
      font-size: 14px;
      color: #555;

      &-label {
        min-width: 60px;
        max-width: 107px;
        padding-right: 12px;
        font-size: 14px;
        color: $black1;
      }
    }
  }
}

// rev:230512 css 수정

.kw-inquiry-result__list--bottom {
  column-gap: 20px;
}
</style>
