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
          @keydown.enter="setFilter"
        />
        <kw-select
          v-model="searchSellTpCd"
          class="mt8"
          :options="codes.SELL_TP_CD"
          first-option="select"
          @change="setFilter"
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
            @click="setFilter"
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
            v-for="clsf in filteredClsfPds"
            :ref="(vm) => clsfItemRefs[clsf.pdClsfId] = vm"
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
      >
        <template
          v-for="(item, index) in step2.dtls"
        >
          <kw-expansion-item
            v-if="!['1', '2', '3'].includes(item?.sellTpCd)"
            :key="`${item.pdCd} + ${index}`"
            expand-icon-class="hidden"
            default-opened
            class="fit"
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
                  <kw-select
                    v-if="isItem.rglrSpp(item)"
                    v-model="item.pkg"
                    :options="item.pkgs"
                    @update:model-value="onChangePkgs(item)"
                  /><!-- ?? -->
                  <kw-item-label
                    v-else
                    class="scoped-item__product-name"
                  >
                    {{ item.pdNm }}
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
                    :disable="item.opo?.opoYn"
                    label="기기변경"
                    class="mr8"
                    dense
                    @click="onClickDeviceChange(item)"
                  />
                  <kw-btn
                    v-if="isItem.rntl(item)"
                    :disable="item.mchnCh?.mchnChYn"
                    label="1+1"
                    class="mr10"
                    dense
                    @click="onClickOnePlusOne(item)"
                  />
                  <kw-btn
                    v-if="isItem.sltrRglrSpp(item)"
                    label="기기선택"
                    class="mr10"
                    dense
                    @click="onClickSelSdingMchn(item)"
                  />
                  <kw-btn
                    v-if="isItem.rglrSpp(item)"
                    :disable="item.pdChoLmYn !== 'Y'"
                    :label="(item.sellTpDtlCd === '62' ? '모종' : '캡슐') + '선택'"
                    class="mr10"
                    dense
                    @click="onClickSelSdingCapsl(item)"
                  />
                  <kw-btn
                    borderless
                    icon="close_24"
                    style="font-size: 24px;"
                    class="w24"
                    @click="onClickDelete(index)"
                  />
                </div>
              </kw-item-section>
            </template>
            <template #default>
              <kw-item
                class="scoped-item scoped-item--data-modifier"
              >
                <kw-item-section>
                  <kw-item-label class="scoped-item__field-row mb10 ">
                    <kw-field-wrap dense>
                      <p class="kw-font-pt14 kw-fc--black3">
                        금액
                      </p>
                      <span class="kw-fc--black1 text-bold ml8">
                        {{ stringUtil.getNumberWithComma(item.fnlAmt * (item.qtyDv !== '1' ? 1 : item.pdQty) || 0) }} 원
                      </span>
                    </kw-field-wrap>
                    <zwcm-counter
                      v-if="item.qtyDv === '1' || item.qtyDv === '2'"
                      v-model="item.pdQty"
                      label="수량변경"
                      :min="1"
                      :max="999"
                    />
                  </kw-item-label>

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
                    v-else-if="isItem.rntl(item)"
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
                        v-if="item.sellDscDvCds"
                        v-model="item.sellDscDvCd"
                        :options="item.sellDscDvCds"
                        placeholder="렌탈할인구분"
                        @change="getPdAmts(item)"
                      />
                      <kw-select
                        v-if="item.sellDscTpCds"
                        v-model="item.sellDscTpCd"
                        :options="item.sellDscTpCds"
                        placeholder="렌탈할인유형"
                        :readonly="!!item.rentalDiscountFixed"
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
                          v-if="item.sellDscrCds && item.sellDscDvCd === '5'"
                          v-model="item.sellDscrCd"
                          :options="item.sellDscrCds"
                          placeholder="렌탈법인할인율"
                        />
                      </div>
                    </div>
                  </template>
                  <template
                    v-else-if="isItem.msh(item)"
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
                        v-if="item.svPdCds"
                        v-model="item.svPdCd"
                        :options="item.svPdCds"
                        placeholder="서비스(용도/방문주기)"
                        @change="getPdAmts(item)"
                      />
                    </div>
                  </template>
                  <template
                    v-else-if="!isItem.rglrSpp(item) && !isItem.sltrRglrSpp(item)"
                  >
                    <div class="scoped-item__field-row mb10">
                      <kw-select
                        v-if="item.stplPtrms"
                        v-model="item.stplPtrm"
                        :options="item.stplPtrms"
                        placeholder="약정기간"
                        class="w170"
                        @change="getPdAmts(item)"
                      />
                    </div>
                  </template>
                  <template
                    v-if="item.opo?.opoYn"
                  >
                    <div class="row items-center justify-between mt10">
                      <div
                        class="row"
                        style="width: calc(100% - 45px);"
                      >
                        <kw-chip
                          label="1+1"
                          color="primary"
                          outline
                          class="ma2"
                        />
                        <ul
                          class="scoped-item-price-list kw-grow"
                          style="max-width: calc(100% - 45px);"
                        >
                          <li
                            class="scoped-item-price-item kw-grow"
                            style="max-width: calc(100% - 215px);"
                          >
                            <span
                              class="kw-fc--black1 ml8 "
                              style="overflow: hidden;
                                      text-overflow: ellipsis;
                                      white-space: nowrap;"
                            >{{ item.opo?.pdNm }}
                              <kw-tooltip show-when-ellipsised>
                                {{ item.opo?.pdNm }}
                              </kw-tooltip>
                            </span>
                          </li>
                          <li class="scoped-item-price-item">
                            <p class="kw-font-pt14 kw-fc--black3">
                              계약번호
                            </p>
                            <span class="kw-fc--black1 ml8">
                              {{ item.opo?.ojCntrNo }}-{{ item.opo?.ojCntrSn }}</span>
                          </li>
                        </ul>
                      </div>
                      <kw-btn
                        borderless
                        icon="close_24"
                        style="font-size: 24px;"
                        class="w24"
                        @click="onClickDeleteOneplusone(item)"
                      />
                    </div>
                  </template>
                  <template
                    v-if="item.mchnCh?.mchnChYn"
                  >
                    <div class="row items-center justify-between mt10">
                      <div
                        class="row"
                        style="width: calc(100% - 45px);"
                      >
                        <kw-chip
                          label="변경"
                          color="primary"
                          outline
                          class="ma2"
                        />
                        <ul
                          class="scoped-item-price-list kw-grow"
                          style="max-width: calc(100% - 45px);"
                        >
                          <li
                            class="scoped-item-price-item kw-grow"
                            style="max-width: calc(100% - 215px);"
                          >
                            <span
                              class="kw-fc--black1 ml8 "
                              style="overflow: hidden;
                                      text-overflow: ellipsis;
                                      white-space: nowrap;"
                            >
                              {{ item.mchnCh?.pdNm }}
                              <kw-tooltip show-when-ellipsised>
                                {{ item.mchnCh?.pdNm }}
                              </kw-tooltip>
                            </span>
                          </li>
                          <li class="scoped-item-price-item">
                            <p class="kw-font-pt14 kw-fc--black3">
                              계약번호
                            </p>
                            <span class="kw-fc--black1 ml8">
                              {{ item.mchnCh?.ojCntrNo }}-{{ item.mchnCh?.ojCntrSn }}
                            </span>
                          </li>
                        </ul>
                      </div>
                      <kw-btn
                        borderless
                        icon="close_24"
                        style="font-size: 24px;"
                        class="w24"
                        @click="onClickDeleteDeviceChange(item)"
                      />
                    </div>
                  </template>
                  <template
                    v-if="item.sltrRglrSppMchn?.rglrSppMchnYn"
                  >
                    <div class="row items-center justify-between mt10">
                      <div
                        class="row"
                        style="width: calc(100% - 45px);"
                      >
                        <kw-chip
                          label="기기"
                          color="primary"
                          outline
                          class="ma2"
                        />
                        <ul
                          class="scoped-item-price-list kw-grow"
                          style="max-width: calc(100% - 45px);"
                        >
                          <li
                            class="scoped-item-price-item kw-grow"
                            style="max-width: calc(100% - 215px);"
                          >
                            <span
                              class="kw-fc--black1 ml8 "
                              style="overflow: hidden;
                                      text-overflow: ellipsis;
                                      white-space: nowrap;"
                            >
                              {{ item.sltrRglrSppMchn?.pdNm }}
                              <kw-tooltip show-when-ellipsised>
                                {{ item.sltrRglrSppMchn?.pdNm }}
                              </kw-tooltip>
                            </span>
                          </li>
                          <li class="scoped-item-price-item">
                            <p class="kw-font-pt14 kw-fc--black3">
                              계약번호
                            </p>
                            <span class="kw-fc--black1 ml8">
                              {{ item.sltrRglrSppMchn?.ojCntrNo }}-{{ item.sltrRglrSppMchn?.ojCntrSn }}
                            </span>
                          </li>
                        </ul>
                      </div>
                      <kw-btn
                        borderless
                        icon="close_24"
                        style="font-size: 24px;"
                        class="w24"
                        @click="onClickDeleteRglrSppDevice(item)"
                      />
                    </div>
                  </template>
                  <div
                    v-if="isItem.sltrRglrSpp(item) || isItem.rglrSpp(item)"
                    class="product-right-area"
                  >
                    <kw-separator
                      v-if="isArray(item.sdingCapsls) && item.sdingCapsls.length > 0"
                      class="dashed-line my20"
                    />
                    <!-- 반복시작 -->
                    <template
                      v-for="(sdingCapsl, i) in item.sdingCapsls"
                      :key="i"
                    >
                      <div class="row items-center justify-between pb8">
                        <p
                          class="kw-fc--black1 text-weight-medium product-left"
                          style="width: calc(100% - 44px);"
                        >
                          {{ sdingCapsl.partPdNm + ' ' + sdingCapsl.itmQty + '개' }}
                        </p>
                      </div>
                    </template>
                  </div>
                </kw-item-section>
              </kw-item>
            </template>
          </kw-expansion-item>
          <single-pay-price-select
            v-if="item?.sellTpCd === '1'"
            :key="`${item.pdCd} + ${item.sellChnlDtlCd}`"
            :model-value="item"
            :bas="step2.bas"
            @price-changed="onPriceChanged"
            @delete="onClickDelete(index)"
          />
          <rental-price-select
            v-if="item?.sellTpCd === '2'"
            :key="`${item.pdCd} + ${item.sellChnlDtlCd}`"
            :model-value="item"
            :bas="step2.bas"
            @one-plus-one="onClickOnePlusOne"
            @device-change="onClickDeviceChange"
            @price-changed="onPriceChanged"
            @delete="onClickDelete(index)"
          />
          <membership-price-select
            v-if="item?.sellTpCd === '3'"
            :key="`${item.pdCd} + ${item.sellChnlDtlCd}`"
            :model-value="item"
            :bas="step2.bas"
            @delete="onClickDelete(index)"
          />
        </template>
      </kw-list>
    </kw-scroll-area>
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import ZwcmCounter from '~common/components/ZwcmCounter.vue';
import SinglePayPriceSelect from '~sms-wells/contract/components/ordermgmt/WwctaSpayFinalPriceSelect.vue';
import RentalPriceSelect from '~sms-wells/contract/components/ordermgmt/WwctaRentalFinalPriceSelect.vue';
import MembershipPriceSelect from '~sms-wells/contract/components/ordermgmt/WwctaMembershipFinalPriceSelect.vue';
import { alert, stringUtil, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isArray, isEmpty } from 'lodash-es';
import { warn } from 'vue';
import { useCtCode } from '~sms-common/contract/composable';

const props = defineProps({
  contract: { type: Object, required: true },
});
const emit = defineEmits([
  'activated',
  'contract-modified',
]);
const exposed = {};
defineExpose(exposed);

const { t } = useI18n();
const dataService = useDataService();
const { notify, modal } = useGlobal();
const { codes } = await useCtCode('CNTR_TP_CD', 'SELL_TP_CD');
const router = useRouter();

const cntrNo = toRef(props.contract, 'cntrNo');
const cntrTpCd = toRef(props.contract, 'cntrTpCd');
const step2 = toRef(props.contract, 'step2');
const ogStep2 = ref({});
const pdFilter = ref('');
const cachedSellTpCd = ref('');
const searchSellTpCd = ref('');
const cachedPdFilter = ref('');
const classfiedPds = ref([]);
const filteredClsfPds = ref([]);
const isMshCntr = computed(() => cntrTpCd.value === '07');
const isItem = {
  spay: (i) => i.sellTpCd === '1',
  rntl: (i) => i.sellTpCd === '2',
  msh: (i) => i.sellTpCd === '3',
  rgsp: (i) => i.sellTpCd === '6',
  crpCntr: () => cntrTpCd.value === '02',
  welsf: (i) => i.lclsfVal === '05001003',
  hcf: (i) => i.lclsfVal === '01003001',
  rglrSpp: (i) => i.cntrRelDtlCd === '216', // 정기배송
  sltrRglrSpp: (i) => i.cntrRelDtlCd === '214' && i.sellTpDtlCd !== '61', // 단독정기배송
  sltrRglrSppExcdMchn: (i) => i.sellTpDtlCd === '61', // 단독정기배송(홍삼 등 기기 필요 X)
};

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function getProducts() {
  if (!cntrNo.value) {
    await alert('잘못된 접근입니다.');
    router.go(-1);
    return;
  }
  const { data } = await dataService.get('sms/wells/contract/contracts/reg-products', {
    params: {
      cntrNo: cntrNo.value,
      pdFilter: pdFilter.value,
    },
  });
  classfiedPds.value = data.pdClsf;
  pdFilter.value = '';
  cachedPdFilter.value = '';
  cachedSellTpCd.value = '';
  filteredClsfPds.value = classfiedPds.value;
  if (classfiedPds.value.length === 0) {
    await alert('판매 가능한 상품이 없습니다.');
  }
}

async function getPdAmts(pd) {
  pd.sellInflwChnlDtlCd = step2.value.bas.sellInflwChnlDtlCd;
  const prc = await dataService.get('sms/wells/contract/contracts/product-prices', {
    params: pd,
  });
  Object.entries(prc.data).forEach((p) => {
    pd[p[0]] = p[1];
  });
}

async function getPdSels(pd) {
  const sels = await dataService.get('sms/wells/contract/contracts/product-selects', {
    params: {
      copnDvCd: step2.value.bas.copnDvCd,
      sellInflwChnlDtlCd: step2.value.bas.sellInflwChnlDtlCd,
      pdCd: pd.pdCd,
      hgrPdCd: pd.hgrPdCd,
      sellTpCd: pd.sellTpCd,
      mshPdCds: pd.mshPdCds,
    },
  });
  return sels.data;
}

async function resetFilter() {
  pdFilter.value = '';
  await getProducts(props.contract.cntrNo);
}

function resetCntrSn() {
  step2.value.dtls.forEach((dtl, index) => {
    dtl.cntrSn = index + 1;
  });
}

async function addProduct(pd) {
  const npd = cloneDeep(pd);
  const sels = await getPdSels(pd);
  ['svPdCds', 'sellDscrCds', 'sellDscDvCds', 'alncmpCntrDrmVals',
    'frisuBfsvcPtrmNs', // 일시불
    'stplPtrms', 'cntrPtrms', 'rgstCss', 'sellDscTpCds', // 렌탈
    'qtyDv',
  ].forEach((col) => {
    npd[col] = sels[col];
  });
  step2.value.dtls.push(npd);

  // 웰스팜추가 가능한 모종조회, list 없으면 push 안하고 있으면 idx 0 표시 push
  if (isItem.welsf(npd) || isItem.hcf(npd)) {
    // 정기배송 상품 조회 CASE1: 웰스팜/홈카페 상품을 선택하여 정기배송 패키지가 자동추가되는 경우
    const pkgs = await dataService.get('sms/wells/contract/contracts/welsf-hcf-pkgs', { params: { pdCd: npd.pdCd } });
    if (pkgs.data && pkgs.data.length > 0) {
      const p = pkgs.data[0];
      pkgs.data.forEach((pkg) => {
        pkg.cntrRelDtlCd = '216';
      });
      p.pkgs = cloneDeep(pkgs.data);
      p.pkg = p.codeId;
      step2.value.dtls.push(p);
    }
  }
  // 단독정기배송이면서 61(홍삼 등)이 아닌 경우 계약관계상세코드 214 세팅
  if (npd.sellTpCd === '6' && npd.sellTpDtlCd !== '61') {
    npd.cntrRelDtlCd = '214';
  }
  resetCntrSn();
  emit('contract-modified');
}

async function onClickProduct(pd) {
  if (isMshCntr.value && step2.value.dtls.length > 0) {
    // 멤버십인 경우 상품 1개로 제한
    await alert('멤버십계약은 1개의 상품만 선택 가능합니다.');
    return;
  }

  // 상품 추가
  if (pd.pdClsf === '7') {
    // 복합상품
    // 중복 불가
    if (step2.value.dtls.find((d) => d.hgrPdCd === pd.pdCd)) {
      await alert('동일한 복합상품이 존재합니다.');
      return;
    }
    // 하위상품 조회 후 추가
    const pds = await dataService.get('sms/wells/contract/contracts/reg-cpt-products', {
      params: {
        cntrNo: step2.value.bas.cntrNo,
        hgrPdCd: pd.pdCd,
      },
    });
    pds.data.forEach(async (p) => await addProduct(p));
  } else {
    // 기준상품
    await addProduct(pd);
  }
}

async function onClickDelete(index) {
  const pd = step2.value.dtls[index];
  if (isItem.rglrSpp(pd) && pd.sellTpDtlCd === '62') return;
  if (pd.hgrPdCd) {
    step2.value.dtls = step2.value.dtls.filter((spd) => pd.hgrPdCd !== spd.hgrPdCd);
  }
  if (isItem.welsf(pd) || isItem.hcf(pd)) {
    step2.value.dtls = step2.value.dtls.filter((spd) => pd.cntrSn !== spd.cntrSn && (pd.cntrSn + 1) !== spd.cntrSn);
  } else {
    step2.value.dtls.splice(index, 1);
  }
  if (pd.packaged) {
    step2.value.dtls = step2.value.dtls.filter((spd) => !spd.packaged);
  }
  resetCntrSn();
  emit('contract-modified');
}

async function onClickOnePlusOne(pd) {
  const res = await modal({
    component: 'WwctaOnePlusOneContractListP',
    componentProps: { baseDtlCntrNo: step2.value.bas.cntrNo },
  });
  if (res.result && res.payload) {
    pd.opo = {
      opoYn: true,
      ojCntrNo: res.payload.cntrNo,
      ojCntrSn: res.payload.cntrSn,
      pdNm: res.payload.pdNm,
    };
    pd.cntrRelDtlCd = '215';
    pd.sellDscTpCd = '03';
    pd.rentalDiscountFixed = true;
  }
}

function onClickDeleteOneplusone(pd) {
  pd.cntrRelDtlCd = '';
  pd.sellDscTpCd = '';
  pd.rentalDiscountFixed = false;
  pd.opo = {};
}

async function onClickDeviceChange(pd) {
  const res = await modal({
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
  if (res.result && res.payload) {
    pd.mchnCh = {
      mchnChYn: res.result,
      ojCntrNo: res.payload.cntrNo,
      ojCntrSn: res.payload.cntrSn,
      pdNm: res.payload.pdNm,
      mchnChTpCd: res.payload.workFlag,
      pasgMcn: res.payload.rentalNmnN,
      mchnCpsApyr: res.payload.finalPerfRt,
      mchnClnOjYn: res.payload.clnYn,
      ojCntrMmBaseDvCd: res.payload.resultDvCheck,
    };
  }
}

function onClickDeleteDeviceChange(pd) {
  pd.mchnCh = {};
}

async function onClickSelSdingMchn(dtl) {
  const res = await modal({
    component: 'WwctaSeedingMachineChoiceP',
    componentProps: {
      cntrCstNo: step2.value.bas.cntrCstNo,
      rglrSppMchnTpCd: dtl.rglrSppMchnTpCd,
    },
  });
  if (res.result && res.payload) {
    dtl.sltrRglrSppMchn = {
      rglrSppMchnYn: res.result,
      ojCntrNo: res.payload.cntrNo,
      ojCntrSn: res.payload.cntrSn,
      pdNm: res.payload.pdNm,
    };
  }
}

function onClickDeleteRglrSppDevice(pd) {
  pd.sltrRglrSppMchn = {};
}

async function onClickSelSdingCapsl(dtl) {
  const res = await modal({
    component: 'WwctaCapsuleSeedingChoiceP',
    componentProps: {
      basePdCd: dtl.pdCd,
      rglrSppMchnTpCd: dtl.rglrSppMchnTpCd,
      rglrSppPrcDvCd: dtl.rglrSppPrcDvCd,
    },
  });
  if (res.result && res.payload) {
    dtl.sdingCapsls = res.payload.map((p) => ({
      partPdNm: p.pdNm,
      partPdCd: p.pdCd,
      pdRelId: p.pdRelId,
      pdRelTpCd: p.pdRelTpCd,
      itmQty: p.count,
      amt: p.prc * p.count,
    }));
    dtl.fnlAmt = dtl.sdingCapsls.reduce((acc, cur) => Number(acc) + Number(cur.amt), 0);
  }
}

async function onChangePkgs(dtl) {
  const { pkg, pkgs, cntrSn } = dtl;
  const pp = pkgs.find((p) => p.codeId === pkg);
  pp.pkgs = cloneDeep(pkgs);
  pp.pkg = pp.codeId;
  step2.value.dtls[step2.value.dtls.findIndex((d) => d.cntrSn === cntrSn)] = pp;
  resetCntrSn();
}

async function getCntrInfo() {
  if (!cntrNo.value) {
    await alert('잘못된 접근입니다.');
    router.go(-1);
    return;
  }
  const { data } = await dataService.get('sms/wells/contract/contracts/cntr-info', {
    params: {
      cntrNo: cntrNo.value,
      step: 2,
    },
  });
  step2.value = data.step2;
  ogStep2.value = cloneDeep(step2.value);
}

const clsfItemRefs = reactive({});

function setFilter() {
  cachedPdFilter.value = pdFilter.value?.trim() || '';
  cachedSellTpCd.value = searchSellTpCd.value;
  Object.values(clsfItemRefs).forEach((vm) => {
    vm?.show();
  });
  if (!Array.isArray(classfiedPds.value)) {
    return [];
  }
  let clsfPds = classfiedPds.value;
  if (!cachedPdFilter.value && !cachedSellTpCd.value) {
    filteredClsfPds.value = clsfPds;
    return;
  }
  clsfPds = clsfPds.reduce((filtered, clsf) => {
    const filteredPds = clsf.products
      .filter((pd) => !cachedPdFilter.value || pd.pdNm.includes(cachedPdFilter.value))
      .filter((pd) => !cachedSellTpCd.value || pd.sellTpCd === cachedSellTpCd.value);
    if (filteredPds.length > 0) {
      filtered.push({
        ...clsf,
        products: filteredPds,
      });
    }
    return filtered;
  }, []);
  if (clsfPds.length === 0) {
    notify('검색 조건에 맞는 상품이 없습니다.');
    filteredClsfPds.value = classfiedPds.value;
  }
  filteredClsfPds.value = clsfPds;
}

// eslint-disable-next-line no-unused-vars
async function productPackaging(sellDscTpCd) {
  if (!Array.isArray(step2.value.dtls)) {
    warn('상품 목록이 이상함.');
    return;
  }

  /* TODO: 15까지 만 있는게 있다 확인..! 16: 4건 이상 패키징 */
  const rentalMultiCaseProducts = step2.value.dtls
    .filter((dtl) => (dtl.sellDscTpCds?.includes(sellDscTpCd)) && !dtl.sellDscTpCd?.trim());
  if (rentalMultiCaseProducts.length < 2) {
    return;
  }
  const { result, payload } = await modal({
    component: 'WwctaRentalMultiCasePrchsDscChoP',
    componentProps: {
      rentals: rentalMultiCaseProducts,
    },
  });

  if (result) {
    rentalMultiCaseProducts.forEach((rentalDtl) => {
      rentalDtl.sellDscTpCd = ' ';// hum?
      rentalDtl.packaged = true;
      rentalDtl.rentalDiscountFixed = true;
    });

    const firstSameCdProduct = rentalMultiCaseProducts.find((rentalDtl) => (rentalDtl.pdCd === payload.pdCd));
    firstSameCdProduct.sellDscTpCd = payload.dscTpCd;
  }
  return rentalMultiCaseProducts;
}

async function confirmProducts() {
  if (step2.value.dtls.find((dtl) => !dtl.fnlAmt)) {
    notify('상품 가격을 확인해주세요');
    return;
  }

  const res = await dataService.post('sms/wells/contract/contracts/confirm-products', step2.value.dtls);
  res.data.forEach((newDtl, index) => {
    step2.value.dtls[index].promotions = newDtl.promotions;
  });
  // await productPackaging();
  return true;
}

async function isChangedStep() {
  return step2.value.bas.cntrPrgsStatCd < 12 || JSON.stringify(ogStep2.value) !== JSON.stringify(step2.value);
}

async function isValidStep() {
  const { dtls } = step2.value;
  if (dtls.length === 0) {
    await alert('상품을 선택해주세요.');
    return false;
  }
  if (dtls.find((d) => (Number.isNaN(d.fnlAmt) || d.fnlAmt <= 0))) {
    await alert('상품 금액을 확인해주세요.');
    return false;
  }
  if (dtls.find((d) => isItem.sltrRglrSpp(d) && (!d.sltrRglrSppMchn || !d.sltrRglrSppMchn.rglrSppMchnYn))) {
    await alert('정기배송 대상 기기를 선택해주세요.');
    return false;
  }
  if (dtls.find((d) => d.sellDscTpCd === '03' && (!d.opo || !d.opo.opoYn))) {
    await alert('1+1 대상 계약을 선택해주세요.');
    return false;
  }
  return true;
}

async function initStep() {
  await getCntrInfo();
  await getProducts();
}

async function saveStep() {
  resetCntrSn();
  const savedCntr = await dataService.post('sms/wells/contract/contracts/save-cntr-step2', step2.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  ogStep2.value = cloneDeep(step2.value);
  return savedCntr?.data?.key;
}

exposed.getCntrInfo = getCntrInfo;
exposed.isChangedStep = isChangedStep;
exposed.isValidStep = isValidStep;
exposed.initStep = initStep;
exposed.saveStep = saveStep;
exposed.getProducts = getProducts;
exposed.confirmProducts = confirmProducts;

onActivated(() => {
  initStep();
  emit('activated', 2);
});

function onPriceChanged() {
  emit('contract-modified');
}

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
    display: flex;
    flex-flow: column nowrap;

    #{$-root}__search-box {
      flex: none;
      padding-right: 30px;

      // height: $-search-area-height;
    }

    #{$-root}__product-box {
      flex: auto;

      // height: calc(100% - #{$-search-area-height});
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
  $-left-side-width: 68px;
  $-right-side-width: 44px;

  & :deep(> .kw-item__section) {
    &.q-item__section--side {
      min-width: $-left-side-width;
      padding-right: $spacing-xs;
    }

    &.q-item__section--main ~ .q-item__section--side {
      min-width: $-right-side-width;
      padding-right: 0;
    }

    &.q-item__section:first-of-type {
      &.q-item__section--main {
        margin-left: $-left-side-width;
      }
    }

    &.q-item__section:last-of-type {
      &.q-item__section--main {
        margin-right: $-right-side-width;
      }
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
      width: 1px;
      flex: 1 1 0;
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

  &-price-list {
    display: flex;
    flex-wrap: wrap;
    max-width: calc(100% - 122px);
    gap: 4px 25px;
  }

  &-price-item {
    display: flex;
    align-items: center;
    position: relative;

    &:last-child::after {
      display: none;
    }

    &::after {
      content: "";
      display: block;
      position: absolute;
      width: 1px;
      height: 16px;
      background-color: #ddd;
      top: 50%;
      right: -12px;
      transform: translateY(-50%);
    }
  }

  &-right-area {
    padding-left: 68px;
    width: 100%;
  }
}

.dashed-line {
  border-top: 1px dashed #ddd;
  height: 0;
  background: none;
}

.scoped-child-select {
  margin-top: 8px !important;
  display: flex;
  column-gap: 8px;
  align-content: center;

  &::before {
    content: "";
    display: inline-block;
    align-self: center;
    margin: 6px 6px 6px 0;
    width: 10px;
    height: 10px;
    border-left: 2px solid #ccc;
    border-bottom: 2px solid #ccc;
  }
}

// //rev:230623 수정 및 추가
</style>
