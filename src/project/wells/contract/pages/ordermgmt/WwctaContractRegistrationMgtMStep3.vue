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
    class="h490"
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
              렌탈
              <kw-separator
                spaced
                vertical
                class="mx12 my5"
              />
              웰스정수기(KW-P27)
              <kw-separator
                spaced
                vertical
                class="mx12 my5"
              />
              W2022-1234567
            </h3>
          </div>
          <div class="row items-center">
            <p class="kw-fc--primary kw-font-subtitle">
              월 9,000원(36개월)
            </p>

            <div class="row items-center ml20">
              <kw-btn
                icon="arrow_left_24"
                borderless
                class="kw-font-pt24"
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
            label="등록"
            dense
          />
        </kw-action-top>

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
                  class="row items-start"
                  style="width: calc(100% - 60px);"
                >
                  <p class="kw-font-pt14">
                    최근등록 주소 :
                  </p>
                  <div
                    class="row items-start radio-multiline pl20"
                    style=" width: calc(100% - 90px); gap: 12px 20px; min-height: 40px;"
                  >
                    <kw-field
                      name="radio"
                    >
                      <template #default="{ field }">
                        <kw-radio
                          v-for="(item, idx) in adrs"
                          v-bind="field"
                          :key="idx"
                          class="radio-close-button"
                          :val="idx"
                          @update:model-value="onClickRectRgstAdr(idx)"
                        >
                          {{ item.rcgvpKnm }}
                          <kw-btn
                            icon="close"
                            borderless
                            dense
                            class="kw-fc--placeholder"
                            @click="onClickRemoveRectRgstAdr(idx)"
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
                  class="kw-fc--black3 kw-font-pt14 self-start mt2"
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
              />
            </kw-form-item>
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

        <kw-separator />

        <h3>설치환경 및 요청사항</h3>

        <kw-form
          :cols="2"
          class="mt20"
        >
          <kw-form-row>
            <kw-form-item
              label="장소"
              required
            >
              <kw-select
                v-model="item.wellsDtl.istPlcTpCd"
                :options="codes.IST_PLC_TP_CD"
              />
            </kw-form-item>
            <kw-form-item
              label="가구 구성원 수"
              required
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
              colspan="2"
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
              label="파트너명"
              :colspan="2"
            >
              <p>(1+1)기존제품 12개월 유지, 미유지 시 할인 금액반환 및 렌탈료 원복</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>

        <kw-separator />

        <h3>결제정보</h3>

        <kw-form
          :cols="2"
          class="mt20"
        >
          <kw-form-row>
            <kw-form-item
              label="자동이체"
            >
              <kw-option-group
                :model-value="'카드'"
                type="radio"
                :options="['카드', '계좌이체']"
              />
            </kw-form-item>
            <kw-form-item no-label>
              <p class="kw-fc--black2 kw-font-pt14 text-weight-regular">
                월 렌탈료 : 30,000원
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item label="등록비결제유형">
              <kw-option-group
                :model-value="'카드'"
                type="radio"
                :options="['카드', '현금']"
              />
            </kw-form-item>
            <kw-form-item no-label>
              <p class="kw-fc--black2 kw-font-pt14 text-weight-regular">
                등록비 : 200,000원
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item label="선납금결제유형">
              <kw-option-group
                :model-value="'카드'"
                type="radio"
                :options="['카드', '현금']"
              />
            </kw-form-item>
            <kw-form-item no-label>
              <p class="kw-fc--black2 kw-font-pt14 text-weight-regular">
                선납비 : 100,000원
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              no-label
              :colspan="2"
            >
              <kw-checkbox
                v-model="ynModel"
                label="설정한 조건 나머지 상품에도 일괄적용"
                val=""
              />
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
  'CNTRT_REL_CD',
  'IST_PLC_TP_CD',
  'WRFR_IST_MTH_CD',
  'SRCWT_TP_CD',
  'WPRS_ITST_TP_CD',
  'USE_ELECT_TP_CD',
  'HCR_DV_CD',
);
codes.FMMB_N = [
  { codeId: 1, codeName: '1인가구' },
  { codeId: 2, codeName: '2인가구' },
  { codeId: 3, codeName: '3인가구' },
  { codeId: 4, codeName: '4인가구 이상' },
];
const adrs = ref([]);
const dtlSn = ref(1);
const showAllAdrs = false;
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
async function getCntrInfo(cntrNo) {
  const cntr = await dataService.get('sms/wells/contract/contracts/cntr-info', { params: { cntrNo, step: 3 } });
  step3.value = cntr.data.step3;
  adrs.value[0] = step3.value.basAdrpc;
  adrs.value[1] = step3.value.basAdrpc;
  console.log(step3.value);
  ogStep3.value = cloneDeep(step3.value);
}

function isChangedStep() {
  return JSON.stringify(ogStep3.value) !== JSON.stringify(step3.value);
}

async function saveStep() {
  const savedCntr = await dataService.post('sms/wells/contract/contracts/save-cntr-step3', step3.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  ogStep3.value = cloneDeep(step3.value);
  return savedCntr?.data?.key;
}

function onClickRectRgstAdr(idx) {
  console.log(idx);
}

function onClickRemoveRectRgstAdr(idx) {
  console.log(idx);
}

function onClickPrevDtlSn() {
  if (dtlSn.value > 1) dtlSn.value -= 1;
}

function onClickNextDtlSn() {
  if (dtlSn.value < step3.value.dtls.length) dtlSn.value += 1;
}

defineExpose({
  getCntrInfo,
  isChangedStep,
  saveStep,
});
onMounted(async () => {
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
    align-items: left;
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
