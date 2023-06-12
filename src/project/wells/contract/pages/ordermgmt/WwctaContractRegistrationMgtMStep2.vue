<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : [CTA] 통합계약서 작성 Step2
2. 프로그램 ID : WwctaContractRegistrationMgtMStep2
3. 작성자 : gs.piit159
4. 작성일 : 2023.05.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 통합계약서 작성 Step2
****************************************************************************************************
--->
<template>
  <div class="scoped-layout">
    <div
      class="scoped-layout__pick-area"
    >
      <div class="scoped-layout__search-box scoped-search-box">
        <h3 class="scoped-search-box__title">
          상품검색
        </h3>
        <kw-input
          v-model="pdFilter"
          @keydown.enter="getPds"
        />
        <div class="scoped-search-box__action">
          <kw-btn
            secondary
            label="초기화"
            dense
            class="w60"
            @click="resetFilter"
          />
          <kw-btn
            label="조회"
            class="w60"
            dense
            filled
            color="secondary"
            text-color="bg-white"
            @click="getPds"
          />
        </div>
      </div>
      <kw-scroll-area
        visible
        class="scoped-layout__product-box"
        scroll-width="100%"
        scroll-style="padding-right: 30px;"
      >
        <kw-separator class="mt20 mb0" />
        <kw-list
          class="scoped-product-type-list"
          separator
          item-padding="16px 0"
        >
          <kw-expansion-item
            v-for="clsf in classfiedPds"
            :key="`product-type-${clsf.pdClsfId}`"
            padding-target="header"
            expansion-icon-align="center"
            expand-icon="arrow_down"
          >
            <template #header>
              <kw-item-section>
                <kw-item-label font="body">
                  {{ clsf.pdClsfNm }}
                </kw-item-label>
              </kw-item-section>
            </template>
            <kw-list
              class="scoped-product-picker-list"
              item-class="scoped-product-picker-list__item"
              :items="clsf.products"
            >
              <template #item="{item}">
                <kw-item-section>
                  <kw-item-label
                    font="dense"
                    font-weight="400"
                    class="flex no-wrap"
                  >
                    <div
                      class="ellipsis grow pr20 cursor-pointer"
                      @click="onClickProduct(item)"
                    >
                      {{ item.pdNm }}
                      <kw-tooltip show-when-ellipsised>
                        {{ item.pdNm }}
                      </kw-tooltip>
                    </div>
                  </kw-item-label>
                  <kw-item-label
                    class="mt6 flex gap-xxs"
                  >
                    <kw-chip
                      v-if="!isEmpty(item.pdChip1)"
                      :label="item.pdChip1"
                      color="primary"
                      outline
                    />
                    <kw-chip
                      v-if="!isEmpty(item.pdChip2)"
                      :label="item.pdChip2"
                      color="primary"
                      outline
                    />
                  </kw-item-label>
                </kw-item-section>
              </template>
            </kw-list>
          </kw-expansion-item>
        </kw-list>
      </kw-scroll-area>
    </div>
    <kw-separator
      :spaced="false"
      vertical
    />
    <kw-scroll-area
      visible
      class="scoped-layout__mod-area"
      scroll-width="100%"
      scroll-style="padding: 0 40px;"
    >
      <h3 class="mt0">
        상품내역
      </h3>
      <kw-list
        separator
        item-padding="20px 0"
        :items="step2.dtls"
        item-key="id"
      >
        <template #item="{item}">
          <kw-expansion-item
            style="width: 100%;"
            expand-icon-class="hidden"
            default-opened
            header-class="scoped-item scoped-item--header"
            block-inherit-padding
            expand-icon-toggle
          >
            <template #header>
              <kw-item-section
                class="scoped-item__section-type"
                side
              >
                <kw-item-label
                  class="scoped-item__type"
                >
                  {{ item.pdClsfNm }}
                </kw-item-label>
              </kw-item-section>
              <kw-item-section
                class="scoped-item__section-main"
              >
                <div class="scoped-item__main">
                  <kw-item-label
                    class="scoped-item__product-name"
                  >
                    {{ item.pdNm }} {{ item.pdCd }}
                  </kw-item-label>
                  <div class="scoped-item__chips">
                    <kw-chip
                      v-if="item.pdChip1"
                      :label="item.pdChip1"
                      color="primary"
                      outline
                    />
                    <kw-chip
                      v-if="item.pdChip2"
                      :label="item.pdChip2"
                      color="primary"
                      outline
                    />
                  </div>
                </div>
              </kw-item-section>
              <kw-item-section
                class="scoped-item__section-action"
                side
              >
                <div class="row justify-end w170 px10">
                  <kw-btn
                    v-if="isItem.rntl(item)"
                    label="기기변경"
                    class="mr8"
                    dense
                    @click="onClickDeviceChahge(item)"
                  />
                  <kw-btn
                    v-if="isItem.rntl(item)"
                    label="1+1"
                    class="mr10"
                    dense
                    @click="onClickOnePlusOne(item)"
                  />
                  <kw-btn
                    borderless
                    icon="close_24"
                    style="font-size: 24px;"
                    class="w24"
                    @click="onClickDelete(item)"
                  />
                </div>
              </kw-item-section>
            </template>
            <template #default>
              <kw-item
                class="scoped-item scoped-item--data-modifier"
              >
                <kw-item-section>
                  <div class="scoped-item__field-row mb10">
                    <p class="kw-font-pt14 kw-fc--black3">
                      금액
                    </p>
                    <span class="kw-fc--black1 text-bold ml8">
                      {{ stringUtil.getNumberWithComma(item.fnlAmt || 0) }} 원
                    </span>
                  </div>
                  <template
                    v-if="isItem.spay(item)"
                  >
                    <div class="scoped-item__field-row mb10">
                      <kw-select
                        v-if="item.sellDscDvCds"
                        v-model="item.sellDscDvCd"
                        :options="item.sellDscDvCds"
                        placeholder="할인구분"
                        @change="getPdAmts(item)"
                      />
                      <kw-select
                        v-if="item.frisuBfsvcPtrmNs"
                        v-model="item.frisuBfsvcPtrmN"
                        :options="item.frisuBfsvcPtrmNs"
                        placeholder="무상멤버십기간"
                        @change="getPdAmts(item)"
                      />
                      <kw-select
                        v-if="item.svPdCds"
                        v-model="item.svPdCd"
                        :options="item.svPdCds"
                        placeholder="서비스(용도/방문주기)"
                        @change="getPdAmts(item)"
                      />
                    </div>
                    <div
                      v-if="false"
                      class="scoped-item__field-row mb10"
                    >
                      <kw-select
                        v-if="item.isExistAlncPds"
                        v-model="item.xxx"
                        placeholder="제휴상품"
                        @change="getPdAmts(item)"
                      />
                      <kw-select
                        v-model="item.xxx"
                        placeholder="구좌수"
                        @change="getPdAmts(item)"
                      />
                    </div>
                    <div
                      v-if="isItem.crpCntr()"
                      class="scoped-item__field-row"
                    >
                      <kw-select
                        v-model="item.sellDscrCd"
                        :options="item.sellDscrCds"
                        placeholder="일시불법인할인율"
                      />
                    </div>
                  </template>
                  <template
                    v-if="isItem.rntl(item)"
                  >
                    <div class="scoped-item__field-row mb10">
                      <kw-select
                        v-if="item.stplPtrms"
                        v-model="item.stplPtrm"
                        :options="item.stplPtrms"
                        placeholder="약정기간"
                        @change="getPdAmts(item)"
                      />
                      <kw-select
                        v-if="item.cntrPtrms"
                        v-model="item.cntrPtrm"
                        :options="item.cntrPtrms"
                        placeholder="계약기간"
                        @change="getPdAmts(item)"
                      />
                      <kw-select
                        v-if="item.rgstCss"
                        v-model="item.cntrAmt"
                        :options="item.rgstCss"
                        placeholder="등록비"
                        @change="getPdAmts(item)"
                      />
                    </div>
                    <div class="scoped-item__field-row mb10">
                      <kw-select
                        v-if="item.sellDscTpCds"
                        v-model="item.sellDscTpCd"
                        :options="item.sellDscTpCds"
                        placeholder="렌탈할인유형"
                        @change="getPdAmts(item)"
                      />
                      <kw-select
                        v-if="item.sellDscDvCds"
                        v-model="item.sellDscDvCd"
                        :options="item.sellDscDvCds"
                        placeholder="렌탈할인구분"
                        @change="getPdAmts(item)"
                      />
                      <kw-select
                        v-if="item.svPdCds"
                        v-model="item.svPdCd"
                        :options="item.svPdCds"
                        placeholder="서비스(용도/방문주기)"
                        @change="getPdAmts(item)"
                      />
                    </div>
                    <div
                      v-if="false"
                      class="scoped-item__field-row mb10"
                    >
                      <kw-select
                        v-if="item.isExistAlncPds"
                        v-model="item.xxx"
                        placeholder="제휴상품"
                        @change="getPdAmts(item)"
                      />
                      <kw-select
                        v-model="item.xxx"
                        placeholder="구좌수"
                        @change="getPdAmts(item)"
                      />
                      <div
                        v-if="isItem.crpCntr()"
                        class="scoped-item__field-row"
                      >
                        <kw-input
                          v-model="item.sellDscCtrAmt"
                          maxlength="20"
                          type="number"
                          placeholder="법인추가할인"
                        />
                        <kw-select
                          v-if="item.sellDscrCds"
                          v-model="item.sellDscrCd"
                          :options="item.sellDscrCds"
                          placeholder="렌탈법인할인율"
                        />
                      </div>
                    </div>
                  </template>
                </kw-item-section>
              </kw-item>
            </template>
          </kw-expansion-item>
        </template>
      </kw-list>
    </kw-scroll-area>
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { stringUtil, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();
const { notify, modal } = useGlobal();

const props = defineProps({
  contract: { type: String, required: true },
  onChildMounted: { type: Function, required: true },
});
const { cntrNo: pCntrNo, step2 } = toRefs(props.contract);
const ogStep2 = ref({});
const pdFilter = ref('');
const classfiedPds = ref([]);
const isItem = {
  spay: (i) => i.sellTpCd === '1',
  rntl: (i) => i.sellTpCd === '2',
  rgsp: (i) => i.sellTpCd === '6',
  crpCntr: () => step2.value.bas?.cntrTpCd === '02',
  welsf: (i) => i.lclsfVal === '05001003',
  hcf: (i) => i.lclsfVal === '01003001',
};
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function getProducts(cntrNo) {
  const pds = await dataService.get('sms/wells/contract/contracts/reg-products', { params: { cntrNo, pdFilter: pdFilter.value } });
  classfiedPds.value = pds.data.pdClsf;
  if (classfiedPds.value.length === 0) {
    await alert('판매 가능한 상품이 없습니다.');
  }
}

async function getPdAmts(pd) {
  const prc = await dataService.get('sms/wells/contract/contracts/product-prices', {
    params: {
      pdCd: pd.pdCd,
      svPdCd: pd.svPdCd,
      sellTpCd: pd.sellTpCd,
      sellInflwChnlDtlCd: step2.value.bas.sellInflwChnlDtlCd,
      frisuBfsvcPtrmN: pd.frisuBfsvcPtrmN,
      sellDscrCd: pd.sellDscrCd,
      stplPtrm: pd.stplPtrm,
      sellDscDvCd: pd.sellDscDvCd,
      sellDscTpCd: pd.sellDscTpCd,
      cntrAmt: pd.cntrAmt,
      cntrPtrm: pd.cntrPtrm,
    },
  });
  ['fnlAmt', 'vat', 'sellFee', 'ackmtPerfRt', 'ackmtPerfAmt', 'cvtPerfAmt',
    'feeAckmtCt', 'feeAckmtBaseAmt', 'feeFxamYn',
    'pdPrcFnlDtlId', 'fxamFxrtDvCd', 'verSn', 'ctrVal', 'pdPrcId',
    'isExistAlncPds',
  ].forEach((col) => {
    pd[col] = prc.data ? prc.data[col] : undefined;
  });
}

async function getPdSels(pd) {
  const sels = await dataService.get('sms/wells/contract/contracts/product-selects', {
    params: {
      sellInflwChnlDtlCd: step2.value.bas.sellInflwChnlDtlCd,
      pdCd: pd.pdCd,
      sellTpCd: pd.sellTpCd,
    },
  });
  return sels.data;
}
async function resetFilter() {
  pdFilter.value = '';
  await getProducts();
}

function resetCntrSn() {
  // eslint-disable-next-line no-restricted-syntax
  for (const [idx, item] of step2.value.dtls.entries()) {
    item.cntrSn = idx + 1;
  }
}

async function onClickProduct(pd) {
  const npd = cloneDeep(pd);
  const sels = await getPdSels(pd);
  ['svPdCds', 'sellDscrCds', 'sellDscDvCds', 'alncmpCntrDrmVals',
    'frisuBfsvcPtrmNs', // 일시불
    'stplPtrms', 'cntrPtrms', 'rgstCss', 'sellDscTpCds', // 렌탈
  ].forEach((col) => {
    npd[col] = sels[col];
  });
  step2.value.dtls.push(npd);
  resetCntrSn();
}

function onClickDelete(pd) {
  step2.value.dtls = step2.value.dtls.filter((spd) => pd.cntrSn !== spd.cntrSn);
  resetCntrSn();
}

async function onClickDeviceChahge(pd) {
  console.log(props.contract);

  await modal({
    component: 'WwctaMachineChangeCustomerDtlP',
    componentProps: {
      baseCntrNo: pd.cntrNo,
      baseCntrSn: pd.cntrSn,
      cstNo: step2.value.bas?.cntrCstNo,
      indvCrpDv: step2.value.bas?.copnDvCd,
      pdCd: pd.pdCd,
      dscDv: pd.sellDscDvCd,
      dscTp: pd.sellDscTpCd,
      sellTpCd: pd.sellTpCd,
      alncmpCd: pd.alncmpCntrDrmVal,
      rgstMdfcDv: '1', // FIXME: 등록, 수정 구분 필요
    },
  });

  // baseCntrNo: { type: String, default: '' }, // 현재 진행중인 계약번호
  // baseCntrSn: { type: String, default: '' }, // 현재 진행중인 계약일련번호
  // cstNo: { type: String, required: true, default: '' }, // 계약자 고객번호
  // indvCrpDv: { type: String, required: true, default: '' }, // 법인격구분코드(1.개인, 2.법인)
  // pdCd: { type: String, required: true, default: '' }, // 기준상품코드
  // dscDv: { type: String, default: '' }, // 할인적용유형코드
  // dscTp: { type: String, default: '' }, // 할인적용상세코드
  // sellTpCd: { type: String, required: true, default: '' }, // 판매유형코드
  // alncmpCd: { type: String, default: '' }, // 제휴사코드
  // rgstMdfcDv: { type: String, required: true, default: '' }, // 등록/수정여부(1.등록, 2.수정)
}

async function onClickOnePlusOne(pd) {
  await modal({
    component: 'WwctaOnePlusOneContractListP',
    componentProps: { cntrNo: pd.cntrNo },
  });
}

async function getCntrInfo(cntrNo) {
  const cntr = await dataService.get('sms/wells/contract/contracts/cntr-info', { params: { cntrNo, step: 2 } });
  step2.value = cntr.data.step2;
  step2.value.dtls.forEach((dtl) => {
    ['svPdCd', 'sellDscrCd', 'sellDscDvCd', 'alncmpCntrDrmVal',
      'frisuBfsvcPtrmN', // 일시불
      'stplPtrm', 'cntrPtrm', 'cntrAmt', 'sellDscTpCd', // 렌탈
    ].forEach((col) => {
      // codeId는 모두 String이므로 불러온 값이 자동으로 세팅되도록 number값을 string으로 변환(또는 v-model을 String casting)
      if (Number.isInteger(dtl[col])) dtl[col] = String(dtl[col]);
    });
  });
  pCntrNo.value = step2.value.bas.cntrNo;
  console.log(step2.value);
  ogStep2.value = cloneDeep(step2.value);
}

async function isChangedStep() {
  return JSON.stringify(ogStep2.value) !== JSON.stringify(step2.value);
}

async function isValidStep() {
  if (isEmpty(step2.value.dtls)) {
    await alert('상품을 선택해주세요.');
    return false;
  }
  return true;
}

async function saveStep() {
  const savedCntr = await dataService.post('sms/wells/contract/contracts/save-cntr-step2', step2.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  ogStep2.value = cloneDeep(step2.value);
  return savedCntr?.data?.key;
}
defineExpose({
  getCntrInfo,
  isChangedStep,
  isValidStep,
  saveStep,
  getProducts,
});
onMounted(async () => {
  props.onChildMounted(2);
});
</script>

<style scoped lang="scss">
@import "kw-lib/src/css/mixins";

.scoped-layout {
  $-root: &;

  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;

  &__pick-area {
    $-search-area-height: 130px;

    width: 339px;
    flex: none;
    height: 100%;
    padding-bottom: 30px;

    #{$-root}__search-box {
      padding-right: 30px;
      height: $-search-area-height;
    }

    #{$-root}__product-box {
      height: calc(100% - #{$-search-area-height});
    }
  }

  &__mod-area {
    height: 100%;
    flex: auto;
  }
}

.scoped-search-box {
  &__title {
    margin-top: 0;
  }

  &__action {
    margin-top: $spacing-sm;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-end;
    gap: $spacing-xs;
  }
}

.scoped-product-picker-list {
  background-color: $bg-box;
  padding: $spacing-lg;

  :deep(> .kw-item-type:not(:first-of-type)) {
    margin-top: $spacing-lg;
  }
}

.scoped-item {
  $-root: &;

  & :deep(.kw-item__section) {
    &.q-item__section--side {
      min-width: 68px;
      padding-right: $spacing-xs;
    }

    &.q-item__section--main ~ .q-item__section--side {
      min-width: 44px;
      padding-right: 0;
    }
  }

  &__section-type {
    justify-content: flex-start;
    width: 68px;
    padding-right: $spacing-xs;
  }

  &__type {
    color: $black3;
    font-size: 14px;
    line-height: 24px !important; // quasat 부터 시작한 유구한 역사의 important.
    font-weight: normal;
    letter-spacing: normal;
  }

  &__section-main {
    justify-content: flex-start;
  }

  &__main {
    display: flex;
    flex-flow: row wrap;
    align-items: flex-start;
    gap: $spacing-xs;
  }

  &__product-name {
    @include typo("body");
  }

  &__chips {
    display: flex;
    gap: $spacing-xxs;
  }

  &__section-price {
    justify-content: flex-start;
    flex: none;
    padding-left: $spacing-xs;
  }

  &__price {
    @include typo("body");

    font-weight: bold;
  }

  &__price-prev {
    @include typo("dense");

    color: $black3;
    text-decoration: line-through;
    text-align: right;
  }

  &__section-action {
    min-width: 44px;
    justify-content: flex-start;

    > .kw-btn {
      font-size: 24px;
    }
  }

  &--data-modifier {
    margin-top: 12px;

    :deep(.kw-item__section) {
      &.q-item__section--main:first-of-type {
        margin-left: 68px;
      }

      &.q-item__section--main:last-of-type {
        margin-right: 44px;
      }
    }
  }

  &__field-row {
    display: flex;
    flex-flow: row nowrap;
    gap: $spacing-xs;

    & > :where(.kw-field, .kw-field-wrap) {
      width: 100%;
    }
  }

  &--sub-content {
    margin-top: 16px;

    &.kw-item {
      min-height: unset;
    }

    #{$-root}__product-name {
      font-weight: normal;
    }

    #{$-root}__price {
      font-weight: normal;
    }
  }

  &__addon {
    margin-top: 16px;
    font-size: 14px;
    color: $black1;
    font-weight: normal;

    > .scoped-item__type {
      line-height: 20px !important;
      padding-right: $spacing-xs;
    }

    &::before {
      content: "";
      display: inline-block;
      margin-bottom: 5px;
      margin-right: 4.5px;
      width: 9px;
      height: 8.5px;
      border-left: 1px solid #ccc;
      border-bottom: 1px solid #ccc;
    }
  }
}
</style>
