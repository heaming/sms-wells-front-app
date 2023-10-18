<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : [CTA] 통합계약서 작성 Step4
2. 프로그램 ID : WwctaContractRegistrationMgtMStep4
3. 작성자 : gs.piit159
4. 작성일 : 2023.05.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 통합계약서 작성 Step4
****************************************************************************************************
--->
<template>
  <kw-scroll-area
    visible
  >
    <div class="pr20">
      <h3 class="mt0">
        계약자정보-{{ getCodeName('CNTR_TP_CD', step4.bas?.cntrTpCd) }}
      </h3>

      <kw-form
        :cols="2"
        dense
        class="mt20"
      >
        <template
          v-if="cntrTpIs.indv || cntrTpIs.ensm || (cntrTpIs.msh && step4.bas.copnDvCd === '1')"
        >
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_CNTRT')"
            >
              <p>
                {{
                  `${step4.cntrt.cstKnm || ''} / ${stringUtil.getDateFormat(step4.cntrt.bryyMmdd)} /
${step4.cntrt.sexDvNm || ''}`
                }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_CST_NO')"
            >
              <p>
                {{ step4.cntrt.cstNo }}
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_MPNO')"
            >
              <p>
                {{ step4.cntrt.cralLocaraTno }}-{{ step4.cntrt.mexnoEncr }}-{{ step4.cntrt.cralIdvTno }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_ADDR')"
            >
              <p>
                {{ step4.cntrt.zip }}<br>
                {{ step4.cntrt.adr }} {{ step4.cntrt.adrDtl }}
              </p>
            </kw-form-item>
          </kw-form-row>
        </template>
        <template
          v-else-if="cntrTpIs.crp || (cntrTpIs.msh && step4.bas.copnDvCd === '2')"
        >
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_CNTRT')"
            >
              <p>{{ step4.cntrt.cstKnm }}</p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_CRNO')"
            >
              <p>{{ step4.cntrt.bzrno }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_CST_NO')"
            >
              <p>{{ step4.cntrt.cstNo }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_MPNO')"
            >
              <p>
                {{ step4.cntrt.cralLocaraTno }}-{{ step4.cntrt.mexnoEncr }}-{{ step4.cntrt.cralIdvTno }}
              </p>
            </kw-form-item>
            <kw-form-item
              :label="$t('MSG_TXT_TEL_NO')"
            >
              <p>
                {{ step4.cntrt.locaraTno }}-{{ step4.cntrt.exnoEncr }}-{{ step4.cntrt.idvTno }}
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_ADDR')"
            >
              <p>
                {{ step4.cntrt.zip }}<br>
                {{ step4.cntrt.adr }} {{ step4.cntrt.adrDtl }}
              </p>
            </kw-form-item>
          </kw-form-row>
        </template>
      </kw-form>

      <kw-separator />

      <template v-if="step4.value?.bas?.cstStlmInMthCd !== '30'">
        <h3>고객결제방법 선택</h3>

        <kw-form
          :cols="1"
          class="mt20"
        >
          <kw-form-row>
            <kw-form-item label="고객결제방법선택">
              <p
                v-if="isReadonly"
              >
                {{ codes.CST_STLM_IN_MTH_CD.find((code) => code.codeId === step4.bas?.cstStlmInMthCd)?.codeName }}
              </p>
              <kw-option-group
                v-else
                :model-value="step4.bas?.cstStlmInMthCd"
                type="radio"
                :options="codes.CST_STLM_IN_MTH_CD"
              />
            </kw-form-item><!--TODO CHECK-->
          </kw-form-row>
        </kw-form>
      </template>

      <kw-separator />

      <h3>계약목록</h3>

      <kw-action-top class="mt20">
        <template #left>
          <kw-paging-info :total-count="countGrdMain" />
        </template>
        <span class="kw-fc--black3">
          (단위: 원/월)
        </span>
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="countGrdMain"
        @init="initGrdMain"
      />

      <kw-action-top class="mt20">
        <template #left>
          <kw-paging-info :total-count="countGrdStlm" />
        </template>
        <span class="kw-fc--black3">
          (단위: 원)
        </span>
      </kw-action-top>

      <kw-grid
        ref="grdStlmRef"
        name="grdStlm"
        :visible-rows="countGrdStlm"
        @init="initGrdStlm"
      />

      <kw-separator />

      <template
        v-if="step4.bas?.cntrTpCd === '2' && step4.isUseAttach === 'Y'"
      >
        <h3>다자녀 첨부파일</h3>

        <kw-form
          :cols="2"
          class="mt20"
        >
          <kw-form-row>
            <kw-form-item label="첨부파일">
              <zwcm-file-attacher
                ref="attachFileRef"
                class="mb10"
                :name="$t('MSG_TXT_ATTH_FILE')"
                downloadable
              />
            </kw-form-item>
          </kw-form-row>
        </kw-form>

        <kw-separator />
      </template>

      <h3>{{ $t('MSG_TXT_PRTNR_INF') }}</h3>

      <kw-form
        :cols="2"
        dense
        class="mt20"
      >
        <kw-form-row>
          <kw-form-item label="파트너명">
            <p>{{ step4.prtnr?.prtnrKnm }}</p>
          </kw-form-item>
          <kw-form-item label="사번">
            <p>{{ step4.prtnr?.prtnrNo }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item label="지점명">
            <p>{{ step4.prtnr?.dgr3LevlOgNm }}</p>
          </kw-form-item>
          <kw-form-item label="지점장명">
            <p>{{ step4.prtnr?.dgr3LevlDgPrtnrNm }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator class="my20" />

      <template
        v-for="(item, idx) in step4.dtls"
        :key="idx"
      >
        <template
          v-if="item.cntrSn === dtlSn"
        >
          <!-- rev:230426  1번의페이징에 따라 화면변경됨-->
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
                class="kw-fc--primary kw-font-subtitle"
              >
                {{ getDisplayedFinalPrice(item) }}
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
                  <span class="kw-fc--placeholder">/{{ step4.dtls.length }}</span>
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

          <template
            v-if="item.sodbtNftfCntrYn !== 'Y'"
          >
            <h3>결제정보</h3>

            <kw-form
              v-if="step4.bas?.cstStlmInMthCd !== '30'"
              :cols="2"
              class="mt20"
              dense
            >
              <kw-form-row
                v-if="step4.bas?.copnDvCd === '2'"
              >
                <kw-form-item
                  :label="t('MSG_TXT_TXINV_PBL')"
                >
                  <p>
                    {{ codes.COD_YN.find((code) => code.codeId === item.txinvPblOjYn)?.codeName }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <template
                v-if="item.sellTpCd === '1'"
              >
                <kw-form-row>
                  <kw-form-item label="계약금(카드)">
                    <p>
                      {{ stringUtil.getNumberWithComma(item.cntrAmtCrd || 0) }}
                    </p>
                  </kw-form-item>
                  <kw-form-item label="계약금(가상계좌)">
                    <p>
                      {{ stringUtil.getNumberWithComma(item.cntrAmtVac || 0) }}
                    </p>
                  </kw-form-item>
                </kw-form-row>
                <kw-form-row
                  v-if="item.recapMshPtrm > 0"
                >
                  <kw-form-item label="멤버십계좌이체">
                    <p>
                      {{ codes.DP_TP_CD_AFTN.find((code) => code.codeId === item.dpTpCdMsh)?.codeName }}
                    </p>
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
                      멤버십 금액 : {{ stringUtil.getNumberWithComma(item.mshAmt || 0) }}원
                    </h3>
                  </kw-form-item>
                </kw-form-row>
              </template>
              <template
                v-else
              >
                <kw-form-row>
                  <kw-form-item
                    label="자동이체"
                  >
                    <p>
                      {{ codes.DP_TP_CD_AFTN.find((code) => code.codeId === item.dpTpCdAftn)?.codeName }}
                    </p>
                  </kw-form-item>
                  <kw-form-item no-label>
                    <p class="kw-fc--black2 kw-font-pt14 text-weight-regular">
                      월 납부금 : {{ stringUtil.getNumberWithComma(item.fnlAmt || 0) }}원
                    </p>
                  </kw-form-item>
                </kw-form-row>
                <kw-form-row>
                  <kw-form-item label="등록비결제유형">
                    <p>
                      {{ codes.DP_TP_CD_IDRV.find((code) => code.codeId === item.dpTpCdIdrv)?.codeName }}
                    </p>
                  </kw-form-item>
                  <kw-form-item no-label>
                    <p class="kw-fc--black2 kw-font-pt14 text-weight-regular">
                      등록비 : {{ stringUtil.getNumberWithComma(item.cntrAmt || 0) }}원
                    </p>
                  </kw-form-item>
                </kw-form-row>
              </template>
            </kw-form>

            <kw-separator />
          </template>

          <h3>설치 및 배송 주소</h3>

          <kw-form
            :cols="2"
            dense
            class="mt20"
          >
            <kw-form-row>
              <kw-form-item
                label="받는사람"
              >
                <p>{{ item.adrpc.rcgvpKnm }}</p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                label="휴대전화번호"
              >
                <p>
                  {{ item.adrpc.cralLocaraTno }}-{{ item.adrpc.mexnoEncr }}-{{ item.adrpc.cralIdvTno }}
                </p>
              </kw-form-item>
              <kw-form-item
                label="전화번호"
              >
                <p>
                  {{ item.adrpc.locaraTno }}-{{ item.adrpc.exnoEncr }}-{{ item.adrpc.idvTno }}
                </p>
              </kw-form-item>
            </kw-form-row>
            <kw-form-row>
              <kw-form-item
                label="주소"
                :colspan="2"
              >
                <p>
                  {{ item.adrpc.zip }}<br>
                  {{ item.adrpc.adr }} {{ item.adrpc.adrDtl }}
                </p>
              </kw-form-item>
            </kw-form-row>
          </kw-form>

          <kw-separator />

          <h3>설치환경 및 요청사항</h3>

          <kw-form
            :cols="2"
            dense
            class="mt20"
          >
            <template
              v-if="item.sellTpCd === '1' || item.sellTpCd === '2'"
            >
              <kw-form-row>
                <kw-form-item
                  label="설치장소"
                >
                  <p>
                    {{ codes.IST_PLC_TP_CD.find((code) => code.codeId === item.wellsDtl.istPlcTpCd)?.codeName }}
                  </p>
                </kw-form-item>
                <kw-form-item
                  label="가구 구성원 수"
                >
                  <p>
                    {{ codes.FMMB_N.find((code) => code.codeId === item.wellsDtl.fmmbN)?.codeName }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  label="전압"
                >
                  <p>
                    {{ codes.USE_ELECT_TP_CD.find((code) => code.codeId === item.wellsDtl.useElectTpCd)?.codeName }}
                  </p>
                </kw-form-item>
                <kw-form-item
                  label="수압"
                >
                  <p>
                    {{ codes.WPRS_ITST_TP_CD.find((code) => code.codeId === item.wellsDtl.wprsItstTpCd)?.codeName }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  label="수질"
                >
                  <p>
                    {{ codes.SRCWT_TP_CD.find((code) => code.codeId === item.wellsDtl.srcwtTpCd)?.codeName }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  label="요청사항"
                  :colspan="2"
                >
                  <p>
                    {{ item.wellsDtl.istAkArtcMoCn }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  label="참고사항"
                  :colspan="2"
                >
                  <p>
                    {{ '' }}
                  </p>
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
                  <p>
                    {{ item.wellsDtl.istAkArtcMoCn }}
                  </p>
                </kw-form-item>
              </kw-form-row>
            </template>
          </kw-form>
        </template>
      </template>

      <template v-if="isRestipulation">
        <h3>재약정</h3>

        <kw-form
          :cols="2"
          class="mt20"
        >
          <kw-form-row>
            <kw-form-item
              label="약정유형"
            >
              <kw-select
                v-model="restipulationBasInfo.stplTpCd"
                :options="stplTpCdOptions"
                option-value="rstlBaseTpCd"
                option-label="text"
                @change="calcRestipulation"
              />
            </kw-form-item>
            <kw-form-item
              label="재약정개월"
            >
              <p>{{ `${restipulationBasInfo.stplPtrm}개월` }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              label="약정시작"
            >
              <p>{{ stringUtil.getDateFormat(restipulationBasInfo.stplStrtdt) }}</p>
            </kw-form-item>
            <kw-form-item
              label="약정종료"
            >
              <p>{{ stringUtil.getDateFormat(restipulationBasInfo.stplEnddt) }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              label="약정요금"
            >
              <p>
                {{ `${getNumberWithComma(restipulationBasInfo.newFnlValue)}원` }}
              </p>
            </kw-form-item>
            <kw-form-item
              label="재약정할인"
            >
              <p>
                {{ `${getNumberWithComma(restipulationBasInfo.stplDscAmt)}원` }}
              </p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
      </template>
    </div>
  </kw-scroll-area>
  <kw-separator
    spaced
    vertical
    inset
    class="ma0"
  />
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import ZwcmFileAttacher from '~common/components/ZwcmFileAttacher.vue';
import { defineGrid, getComponentType, stringUtil, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import { warn } from 'vue';
import { getNumberWithComma } from '~sms-common/contract/util';
import { useCtCode } from '~sms-common/contract/composable';

const props = defineProps({
  contract: { type: Object, required: true },
});
const emit = defineEmits([
  'activated',
]);
const exposed = {};
defineExpose(exposed);
const router = useRouter();

const dataService = useDataService();
const { notify, alert } = useGlobal();
const { getters } = useStore();
const { codes, getCodeName } = await useCtCode(
  'CNTR_TP_CD',
  'CST_STLM_IN_MTH_CD',
  'IST_PLC_TP_CD',
  'WRFR_IST_MTH_CD',
  'SRCWT_TP_CD',
  'WPRS_ITST_TP_CD',
  'USE_ELECT_TP_CD',
  'COD_YN',
);
codes.FMMB_N = [
  { codeId: 1, codeName: '1인 가구' },
  { codeId: 2, codeName: '2인 가구' },
  { codeId: 3, codeName: '3인 가구' },
  { codeId: 4, codeName: '4인 이상 가구' },
];
codes.DP_TP_CD_IDRV = [
  { codeId: '0201', codeName: '카드' },
  { codeId: '0101', codeName: '가상계좌' },
];
codes.DP_TP_CD_AFTN = [
  { codeId: '0203', codeName: '카드이체' },
  { codeId: '0102', codeName: '계좌이체' },
  { codeId: '0104', codeName: '법인계좌' },
];

const sessionUserId = getters['meta/getUserInfo'];
const cntrNo = computed(() => props.contract.rstlCntrNo || props.contract.cntrNo);
const cntrTpCd = toRef(props.contract, 'cntrTpCd');
const rstlCntrNo = computed(() => props.contract.rstlCntrNo);
const rstlCntrSn = computed(() => props.contract.rstlCntrSn);
const step4 = toRef(props.contract, 'step4');
step4.value = {
  bas: {},
  cntrt: {},
  prtnr: {},
  prtnr7: {},
  cntrDtls: [{}],
  stlmDtls: [{}],
};
const ogStep4 = ref({});
const isRestipulation = ref(false);
// const restipulationCntrSn = ref(0);
const stplTpCdOptions = ref([]);
const restipulationBasInfo = ref({});
const { t } = useI18n();
const grdMainRef = ref(getComponentType('KwGrid'));
const grdStlmRef = ref(getComponentType('KwGrid'));
const countGrdMain = ref(1);
const countGrdStlm = ref(1);

const dtlSn = ref(1);
const now = dayjs();
const cntrTpIs = ref({
  indv: computed(() => step4.value.bas?.cntrTpCd === '01'), // 개인
  crp: computed(() => step4.value.bas?.cntrTpCd === '02'), // 법인
  ensm: computed(() => step4.value.bas?.cntrTpCd === '03'), // 임직원
  msh: computed(() => step4.value.bas?.cntrTpCd === '07'), // 멤버십
  rstl: computed(() => step4.value.bas?.cntrTpCd === '08'), // 재약정
  quot: computed(() => step4.value.bas?.cntrTpCd === '09'), // 견적서
});
const isReadonly = computed(() => step4.value.bas?.cntrPrgsStatCd > 20);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
function setGrid() {
  const viewMain = grdMainRef.value.getView();
  const viewStlm = grdStlmRef.value.getView();
  viewMain.getDataSource().setRows(step4.value.cntrDtls);
  viewStlm.getDataSource().setRows(step4.value.stlmDtls);
  countGrdMain.value = Math.max(step4.value.cntrDtls.length, 1);
  countGrdStlm.value = Math.max(step4.value.stlmDtls.length, 1);
}

async function calcRestipulation() {
  const stplTpCdOption = stplTpCdOptions.value
    .find((option) => option.rstlBaseTpCd === restipulationBasInfo.value.stplTpCd);
  const ojCntrDtl = step4.value.dtls.find((dtl) => Number(dtl.cntrSn) === Number(restipulationBasInfo.value.cntrSn));

  restipulationBasInfo.value.stplDscAmt = stplTpCdOption.stplDscAmt;
  restipulationBasInfo.value.stplPtrm = stplTpCdOption.rstlMcn;
  restipulationBasInfo.value.minRentalAmt = stplTpCdOption.minRentalAmt;

  if (!ojCntrDtl) {
    warn('재약정 대상 계약 상세가 없습니다.');
    return;
  }
  restipulationBasInfo.value.newFnlValue = Number(ojCntrDtl.fnlAmt) - Number(restipulationBasInfo.value.stplDscAmt);
  // 최소금액 이하로 떨어지는 경우 로직 보완
  if (Number(restipulationBasInfo.value.newFnlValue) < Number(restipulationBasInfo.value.minRentalAmt)) {
    restipulationBasInfo.value.newFnlValue = restipulationBasInfo.value.minRentalAmt;
    restipulationBasInfo.value.stplDscAmt = Number(restipulationBasInfo.value.newFnlValue)
        - Number(restipulationBasInfo.value.minRentalAmt);
  }

  if (!restipulationBasInfo.value.newFnlValue) {
    return;
  }
  const { data } = await dataService.get(
    'sms/wells/contract/re-stipulation/contract-info',
    { params: restipulationBasInfo.value },
  );

  const stplExpired = Number(data.rentalTn) >= Number(data.stplPtrm);
  const startDayOfNextMonth = now
    .add(1, 'month')
    .startOf('M');
  const startDayOfStplEndMonth = dayjs(data.istDt, 'YYYYMMDD')
    .add(Number(data.stplPtrm), 'month')
    .startOf('M');

  const stplStrtDay = stplExpired ? startDayOfNextMonth : startDayOfStplEndMonth;
  const stplEndDay = stplStrtDay
    .add(Number(restipulationBasInfo.value.stplPtrm) - 1, 'month')
    .endOf('M');
  const stplStrtdt = stplStrtDay.format('YYYYMMDD').toString();
  const stplEnddt = stplEndDay.format('YYYYMMDD').toString();
  restipulationBasInfo.value.cntrNo = data.cntrNo;
  restipulationBasInfo.value.stplStrtdt = stplStrtdt;
  restipulationBasInfo.value.stplEnddt = stplEnddt;
  restipulationBasInfo.value.rstlStatCd = '010'; // 접수
  restipulationBasInfo.value.stplRcpDtm = now.format('YYYYMMDDHHmmss').toString();
  restipulationBasInfo.value.rcpOgTpCd = sessionUserId.ogTpCd;
  restipulationBasInfo.value.rcpPrtnrNo = sessionUserId.employeeIDNumber;
  restipulationBasInfo.value.stplTn = Number(data.stplTn) + 1;
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
      step: 4,
    },
  });

  step4.value = data.step4;
  ogStep4.value = cloneDeep(step4.value);
  // 총판채널인 경우 고객센터 이관만 보이도록
  codes.CST_STLM_IN_MTH_CD = codes.CST_STLM_IN_MTH_CD.filter((code) => (step4.value.bas.cstStlmInMthCd === '30' ? code.codeId === '30' : code.codeId !== '30'));

  setGrid();
}

async function fetchStplTpCdOptions() {
  const params = { cntrNo: rstlCntrNo.value, cntrSn: rstlCntrSn.value };
  const { data } = await dataService.get(
    'sms/wells/contract/re-stipulation/standard-info',
    { params },
  );
  stplTpCdOptions.value = data;
}

async function fetchInitialStplTpCd() {
  const params = { cntrNo: rstlCntrNo.value, cntrSn: rstlCntrSn.value };
  const response = await dataService.get(
    'sms/wells/contract/re-stipulation/contract',
    { params },
  );
  restipulationBasInfo.value.cntrNo = rstlCntrNo.value;
  restipulationBasInfo.value.cntrSn = rstlCntrSn.value;
  restipulationBasInfo.value.stplTpCd = response.data.stplTpCd;
}

async function getCntrInfoWithRstl() {
  if (!rstlCntrNo.value || !rstlCntrSn.value) {
    await alert('잘못된 접근입니다.');
    return;
  }

  await getCntrInfo();

  await fetchStplTpCdOptions();
  await fetchInitialStplTpCd();

  step4.value.isRestipulation = true;
  isRestipulation.value = true;
}

function isChangedStep() {
  return true;
}

async function isValidStep() {
  if (step4.value.isRestipulation) {
    if (!restipulationBasInfo.value.stplTpCd) {
      await alert('재약정유형을 선택해주세요.');
      return false;
    }
  }
  return true;
}

async function saveStep(isTemp) {
  if (step4.value.isRestipulation) {
    const savedCntr = await dataService.post('sms/wells/contract/re-stipulation/save-contract', restipulationBasInfo.value);
    return savedCntr?.data?.key;
  }
  const api = isTemp ? 'save-cntr-step4-temp' : 'save-cntr-step4';
  const savedCntr = await dataService.post(`sms/wells/contract/contracts/${api}`, step4.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  ogStep4.value = cloneDeep(step4.value);
  return savedCntr?.data?.key;
}

function onClickPrevDtlSn() {
  if (dtlSn.value > 1) dtlSn.value -= 1;
}

function onClickNextDtlSn() {
  if (dtlSn.value < step4.value.dtls.length) dtlSn.value += 1;
}

function getDisplayedFinalPrice(cntrDtl) {
  if (!cntrDtl) {
    return '';
  }
  const { fnlAmt, svPrd, sellTpCd, stplPtrm } = cntrDtl;

  if (sellTpCd === '1') {
    return `${getNumberWithComma(fnlAmt)}원`;
  }
  if (sellTpCd === '2') {
    return `${getNumberWithComma(fnlAmt)}원${stplPtrm ? ` (${stplPtrm}개월)` : ''}`;
  }
  if (sellTpCd === '6') {
    return `${getNumberWithComma(fnlAmt)}원 (월 ${getNumberWithComma(fnlAmt
        / svPrd)}원)`;
  }
  return `월 ${getNumberWithComma(fnlAmt)}원`;
}

const loaded = ref(false);
async function initStep(forced = false) {
  if (!forced && loaded.value) { return; }

  if (cntrNo.value) {
    if (cntrTpCd.value === '08') {
      await getCntrInfoWithRstl();
    } else {
      await getCntrInfo();
    }
    loaded.value = true;
  }
}

exposed.getCntrInfo = getCntrInfo;
exposed.getCntrInfoWithRstl = getCntrInfoWithRstl;
exposed.isChangedStep = isChangedStep;
exposed.isValidStep = isValidStep;
exposed.initStep = initStep;
exposed.loaded = loaded;
exposed.saveStep = saveStep;
/* exposed.setRestipulation = setRestipulation; */

onActivated(() => {
  initStep();
  emit('activated', 4);
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'sellTpNm' },
    { fieldName: 'pdNm' },
    { fieldName: 'regAmt', dataType: 'number' },
    { fieldName: 'rntlAmt', dataType: 'number' },
    { fieldName: 'pdAmt', dataType: 'number' },
    { fieldName: 'stplPtrm', dataType: 'number' },
    { fieldName: 'cntrPtrm', dataType: 'number' },
    { fieldName: 'dscAmt', dataType: 'number' },
  ];
  const columns = [
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '140',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo: pCntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${pCntrNo}-${cntrSn}`;
      },
    },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_CNTR_DV'), width: 70 },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: 200 },
    { fieldName: 'regAmt', header: '등록비(계약금)', width: 90, styleName: 'text-right' },
    { fieldName: 'rntlAmt', header: '월납부금', width: 90, styleName: 'text-right' },
    { fieldName: 'pdAmt', header: t('MSG_TXT_PRDT_AMT'), width: 90, styleName: 'text-right' },
    { fieldName: 'stplPtrm', header: t('MSG_TXT_CONTRACT_PERI'), width: 90, styleName: 'text-right' },
    { fieldName: 'cntrPtrm', header: t('MSG_TXT_CNTR_PTRM'), width: 90, styleName: 'text-right' },
    { fieldName: 'dscAmt', header: t('MSG_TXT_DSC_AMT'), width: 90, styleName: 'text-right' },
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
});

const initGrdStlm = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'stlmTp' },
    { fieldName: 'stlmMth' },
    { fieldName: 'stlmAmt', dataType: 'number' },
  ];
  const columns = [
    { fieldName: 'stlmTp', header: t('MSG_TXT_PMT_TYP'), width: 200 },
    { fieldName: 'stlmMth', header: t('MSG_TXT_STLM_MTHD'), width: 200 },
    { fieldName: 'stlmAmt', header: t('MSG_TXT_AMT'), fillWidth: 1, styleName: 'text-right' },
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
});
</script>

<style scoped lang="scss">
</style>
