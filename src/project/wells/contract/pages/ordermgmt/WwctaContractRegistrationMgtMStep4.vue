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
  <kw-scroll-area class="h490">
    <div class="pr20">
      <h3 class="mt0">
        계약자정보-{{ codes.CNTR_TP_CD.find((code) => code.codeId === step4.bas?.cntrTpCd)?.codeName }}
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
                {{ `${step4.cntrt.cstKnm || ''} / ${stringUtil.getDateFormat(step4.cntrt.bryyMmdd)} /
${step4.cntrt.sexDvNm || ''}` }}
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
          </kw-form-item>
        </kw-form-row>
      </kw-form>

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
                v-if="item.sellTpCd === '1'"
                class="kw-fc--primary kw-font-subtitle"
              >
                {{ stringUtil.getNumberWithComma(item.fnlAmt || 0) }}원
              </p>
              <p
                v-else
                class="kw-fc--primary kw-font-subtitle"
              >
                월 {{ stringUtil.getNumberWithComma(item.fnlAmt || 0) }}원({{ item.stplPtrm }}개월)
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
                v-if="step4.bas?.cntrTpCd === '02'"
              >
                <kw-form-item label=" 세금계산서발행">
                  <p>
                    {{ codes.COD_YN.find((code) => code.codeId === item.txinvPblOjYn)?.codeName }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <template
                v-if="item.sellTpCd === '1'"
              >
                <kw-form-row>
                  <kw-form-item label="계약금(가상계좌)">
                    <p>
                      {{ stringUtil.getNumberWithComma(item.cntrAmt || 0) }}
                    </p>
                  </kw-form-item>
                  <kw-form-item label="상품금액(신용카드)">
                    <p>
                      {{ stringUtil.getNumberWithComma(item.pdAmt || 0) }}
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
                      월 렌탈료 : {{ stringUtil.getNumberWithComma(item.fnlAmt || 0) }}원
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
              <kw-form-item
                label="휴대전화번호"
              >
                <p>
                  {{ item.adrpc.cralLocaraTno }}-{{ item.adrpc.mexnoEncr }}-{{ item.adrpc.cralIdvTno }}
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
                    {{ "" }}
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

      <template v-if="isRestipulation === true">
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
                :options="restipulationBasInfo.data"
                option-value="rstlBaseTpCd"
                option-label="text"
                @change="calcRestipulation"
              />
            </kw-form-item>
            <kw-form-item
              label="재약정개월"
            >
              <p>{{ restipulationBasInfo.stplPtrm }} 개월</p>
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
              <p>{{ stringUtil.getDateFormat(restipulationBasInfo.stplEndDt) }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              label="약정요금"
            >
              <p>
                {{ restipulationBasInfo.newFnlValue?
                  stringUtil.getNumberWithComma(restipulationBasInfo.newFnlValue):'' }} 원
              </p>
            </kw-form-item>
            <kw-form-item
              label="재약정할인"
            >
              <p>
                {{ restipulationBasInfo.stplDscAmt?
                  stringUtil.getNumberWithComma(restipulationBasInfo.stplDscAmt):'' }} 원
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
import { codeUtil, defineGrid, getComponentType, stringUtil, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const { notify } = useGlobal();
const props = defineProps({
  contract: { type: String, required: true },
  onChildMounted: { type: Function, required: true },
});
const { getters } = useStore();
const sessionUserId = getters['meta/getUserInfo'];
const { cntrNo: pCntrNo, step4 } = toRefs(props.contract);
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
const restipulationCntrSn = ref(0);
const restipulationBasInfo = ref({});
const { t } = useI18n();
const grdMainRef = ref(getComponentType('KwGrid'));
const grdStlmRef = ref(getComponentType('KwGrid'));
const countGrdMain = ref(0);
const countGrdStlm = ref(0);
const codes = await codeUtil.getMultiCodes(
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
];
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
  countGrdMain.value = step4.value.cntrDtls.length;
  countGrdStlm.value = step4.value.stlmDtls.length;
}
async function getCntrInfo(cntrNo) {
  const cntr = await dataService.get('sms/wells/contract/contracts/cntr-info', { params: { cntrNo, step: 4 } });
  step4.value = cntr.data.step4;
  pCntrNo.value = step4.value.bas.cntrNo;
  console.log(step4.value);
  // 총판채널인 경우 고객센터 이관만 보이도록
  codes.CST_STLM_IN_MTH_CD = codes.CST_STLM_IN_MTH_CD.filter((code) => (step4.value.bas.cstStlmInMthCd === '30' ? code.codeId === '30' : code.codeId !== '30'));
  ogStep4.value = cloneDeep(step4.value);
  setGrid();

  if (isRestipulation.value === true) {
    const cntrSn = restipulationCntrSn.value;
    const res = await dataService.get(
      'sms/wells/contract/re-stipulation/standard-info',
      { params: { cntrNo, cntrSn } },
    );
    console.log(res);
    restipulationBasInfo.value = cloneDeep(res);
    restipulationBasInfo.value.cntrSn = cntrSn;
    console.log(restipulationBasInfo.value.data);
  }
}

async function setRestipulation(flag, cntrSn) {
  isRestipulation.value = flag;
  restipulationCntrSn.value = cntrSn;
  console.log(isRestipulation.value);
}

async function calcRestipulation() {
  const datas = restipulationBasInfo.value.data;

  datas.forEach((element) => {
    if (restipulationBasInfo.value.stplTpCd === element.rstlBaseTpCd) {
      restipulationBasInfo.value.stplDscAmt = element.stplDscAmt;
      restipulationBasInfo.value.stplPtrm = element.rstlMcn;
      restipulationBasInfo.value.minRentalAmt = element.minRentalAmt;
      // 약정요금 재계산
      // 기존요금
      console.log(step4.value.dtls);

      step4.value.dtls.forEach((v) => {
        console.log(restipulationBasInfo.value.cntrSn);
        if (Number(v.cntrSn) === Number(restipulationBasInfo.value.cntrSn)) {
          const prevRentalAmt = v.fnlAmt;
          console.log(prevRentalAmt);
          restipulationBasInfo.value.newFnlValue = Number(prevRentalAmt)
            - Number(restipulationBasInfo.value.stplDscAmt);
          console.log(restipulationBasInfo.value.newFnlValue);

          // 최소금액 이하로 떨어지는 경우 로직 보완
          if (Number(restipulationBasInfo.value.newFnlValue) < Number(restipulationBasInfo.value.minRentalAmt)) {
            restipulationBasInfo.value.newFnlValue = restipulationBasInfo.value.minRentalAmt;
            restipulationBasInfo.value.stplDscAmt = Number(restipulationBasInfo.value.stplDscAmt)
            - (Number(restipulationBasInfo.value.minRentalAmt) - Number(restipulationBasInfo.value.newFnlValue));
          }
        }
      });
    }
  });

  console.log('다왔다');
  console.log(restipulationBasInfo.value.newFnlValue);
  if (restipulationBasInfo.value.newFnlValue) {
    const { cntrNo } = step4.value.bas;
    const { cntrSn } = restipulationBasInfo.value;
    const res = await dataService.get(
      'sms/wells/contract/re-stipulation/contract-info',
      { params: { cntrNo, cntrSn } },
    );

    console.log(res);
    const data = cloneDeep(res.data);
    const stplStrtdt = data.rentalTn >= data.stplPtrm ? now.add(1, 'month').startOf('M').format('YYYYMMDD')
      : dayjs(data.istDt, 'YYYYMMDD').add(Number(data.stplPtrm), 'month').startOf('M').format('YYYYMMDD');
    const stplEndDt = dayjs(stplStrtdt, 'YYYYMMDD').add(Number(restipulationBasInfo.value.stplPtrm), 'month').endOf('M').format('YYYYMMDD');

    console.log('저장준비');
    console.log(restipulationBasInfo.value.stplPtrm);
    console.log(stplStrtdt);
    console.log(stplEndDt);

    restipulationBasInfo.value.cntrNo = data.cntrNo;
    restipulationBasInfo.value.stplStrtdt = stplStrtdt;
    restipulationBasInfo.value.stplEndDt = stplEndDt;
    restipulationBasInfo.value.rstlStatCd = '010'; // 접수
    restipulationBasInfo.value.stplRcpDtm = now.format('YYYYMMDDHHmmss');
    restipulationBasInfo.value.rcpOgTpCd = sessionUserId.ogTpCd;
    restipulationBasInfo.value.rcpPrtnrNo = sessionUserId.employeeIDNumber;
    restipulationBasInfo.value.stplTn = Number(data.stplTn) + 1;
  }
}

function isChangedStep() {
  return true;
}

async function isValidStep() {
  return true;
}

async function saveStep() {
  if (isRestipulation.value === true) {
    const savedCntr = await dataService.post('sms/wells/contract/re-stipulation/save-contract', restipulationBasInfo.value);
    console.log(savedCntr);
    return savedCntr?.data?.key;
  }
  const savedCntr = await dataService.post('sms/wells/contract/contracts/save-cntr-step4', step4.value);
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

defineExpose({
  getCntrInfo,
  isChangedStep,
  isValidStep,
  saveStep,
  setRestipulation,
});

onMounted(async () => {
  props.onChildMounted(4);
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
    { fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '140',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      },
    },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_CNTR_DV'), width: 80 },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: 200 },
    { fieldName: 'regAmt', header: t('MSG_TXT_RGST_FEE'), width: 100, styleName: 'text-right' },
    { fieldName: 'rntlAmt', header: t('MSG_TXT_MM_RTLFE'), width: 100, styleName: 'text-right' },
    { fieldName: 'pdAmt', header: t('MSG_TXT_PRDT_AMT'), width: 100, styleName: 'text-right' },
    { fieldName: 'stplPtrm', header: t('MSG_TXT_CONTRACT_PERI'), width: 100, styleName: 'text-right' },
    { fieldName: 'cntrPtrm', header: t('MSG_TXT_CNTR_PTRM'), width: 100, styleName: 'text-right' },
    { fieldName: 'dscAmt', header: t('MSG_TXT_DSC_AMT'), width: 100, styleName: 'text-right' },
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
    { fieldName: 'stlmTp', header: t('MSG_TXT_PMT_TYP'), width: 100 },
    { fieldName: 'stlmMth', header: t('MSG_TXT_STLM_MTHD'), width: 100 },
    { fieldName: 'stlmAmt', header: t('MSG_TXT_AMT'), width: 100, styleName: 'text-right' },
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true;
});
</script>

<style scoped lang="scss">
</style>
