<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbRentalProductChangeM - 렌탈 주문 수정_상품변경 Variation (PC화면)
3. 작성자 : hyeonjong.ra
4. 작성일 : 2023.08.03
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U-0114M02] 렌탈 주문 수정_상품변경 Variation (PC화면)
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 계약상세번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
          required
        >
          <zctz-contract-detail-number
            v-if="!isLinked"
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            :name="$t('MSG_TXT_CNTR_DTL_NO')"
            rules="required"
          />
          <kw-input
            v-if="isLinked"
            v-model="searchParams.cntrNoSn"
            :name="$t('MSG_TXT_CNTR_DTL_NO')"
            rules="required"
            icon="search"
            readonly
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <kw-form
      ref="obsRef"
    >
      <div class="result-area">
        <h3>
          {{ $t('MSG_TXT_CNTR_INF') }} <!-- 계약정보 -->
        </h3>
        <kw-form
          :cols="2"
          dense
        >
          <kw-form-row>
            <!-- 계약상세번호 -->
            <kw-form-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
              <p>{{ fieldData.cntrNo + '-' + fieldData.cntrSn }}</p>
            </kw-form-item>
            <!-- 판매/접수구분 -->
            <kw-form-item :label="$t('MSG_TXT_SELL') + '/' + $t('MSG_TXT_RCP_DV')">
              <p>{{ fieldData.cntrDtlStatNm }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 계약일/설치일 -->
            <kw-form-item :label="$t('MSG_TXT_CNTRCT_DT') + '/' + $t('MSG_TXT_INST_DT')">
              <p>
                {{ stringUtil.getDateFormat(fieldData.cntrCnfmDt) || '-' }}
                /
                {{ stringUtil.getDateFormat(fieldData.istDt) || '-' }}
              </p>
            </kw-form-item>
            <!-- 취소/철거일자 -->
            <kw-form-item
              :label="$t('MSG_TXT_CANCEL') + '/' + $t('MSG_TXT_DEM_DT')"
              :colspan="2"
            >
              <p>
                {{ stringUtil.getDateFormat(fieldData.canDt) || '-' }}
                /
                {{ stringUtil.getDateFormat(fieldData.reqdDt) || '-' }}
              </p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
        <kw-separator
          spaced="20px"
          class="mb0"
        />
        <kw-list
          separator
          item-padding="20px 0"
        >
          <kw-expansion-item
            padding-target="header"
            expansion-icon-align="center"
            expand-icon-class="kw-font-pt24"
          >
            <template #header>
              <kw-item-section>
                <kw-item-label>
                  <!-- 계약자 고객정보 -->
                  <h3>{{ $t('MSG_TXT_CNTRT') + ' ' + $t('MSG_TXT_CST_INF') }}</h3>
                </kw-item-label>
              </kw-item-section>
            </template>
            <kw-form
              dense
              class="pb20"
              :cols="2"
            >
              <kw-form-row>
                <!-- 계약자 / 고객번호 -->
                <kw-form-item :label="$t('MSG_TXT_CNTRT') + ' / ' + $t('MSG_TXT_CST_NO')">
                  <p>
                    {{ fieldData.cntrCstKnm }}
                    /
                    {{ fieldData.cntrCstNo }}
                  </p>
                </kw-form-item>
                <!-- 구분 / 생년월일 -->
                <kw-form-item :label="$t('MSG_TXT_DIV') + ' / ' + $t('MSG_TXT_BIRTH_DATE')">
                  <p>
                    {{ fieldData.copnDvNm || '-' }}
                    /
                    {{ stringUtil.getDateFormat(fieldData.bryyMmdd) || '-' }}
                    {{ isEmpty(fieldData.sexDvNm)?''
                      :'(' }}{{ fieldData.sexDvNm }}{{ isEmpty(fieldData.sexDvNm)?'':')' }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <!-- 휴대전화번호 -->
                <kw-form-item :label="$t('MSG_TXT_MPNO')">
                  <p>
                    {{ isEmpty(fieldData.cralLocaraTno)||isEmpty(fieldData.mexnoEncr)||isEmpty(fieldData.cralIdvTno)?
                      '': fieldData.cralLocaraTno + '-' + fieldData.mexnoEncr + '-' + fieldData.cralIdvTno }}
                  </p>
                </kw-form-item>
                <!-- 전화번호 -->
                <kw-form-item :label="$t('MSG_TXT_TEL_NO')">
                  <p>
                    {{ isEmpty(fieldData.locaraTno)||isEmpty(fieldData.exnoEncr)||isEmpty(fieldData.idvTno)?
                      '': fieldData.locaraTno + '-' + fieldData.exnoEncr + '-' + fieldData.idvTno }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <!-- 주소 -->
                <kw-form-item
                  :label="$t('MSG_TXT_ADDR')"
                  :colspan="2"
                >
                  <p>
                    {{ fieldData.adrZip }}
                    {{ fieldData.adrMain }}
                    {{ fieldData.dtlAdr }}
                  </p>
                </kw-form-item>
              </kw-form-row>
            </kw-form>
          </kw-expansion-item>
          <kw-expansion-item
            padding-target="header"
            expansion-icon-align="center"
            expand-icon-class="kw-font-pt24"
          >
            <template #header>
              <kw-item-section>
                <kw-item-label>
                  <!-- 설치자 고객정보 -->
                  <h3>{{ $t('MSG_TXT_INSTR') + ' ' + $t('MSG_TXT_CST_INF') }}</h3>
                </kw-item-label>
              </kw-item-section>
            </template>
            <kw-form
              dense
              class="pb20"
              :cols="2"
            >
              <kw-form-row>
                <!-- 고객명 -->
                <kw-form-item :label="$t('MSG_TXT_CST_NM')">
                  <p>{{ fieldData.istKnm }}</p>
                </kw-form-item>
                <!-- 휴대전화번호 -->
                <kw-form-item :label="$t('MSG_TXT_MPNO')">
                  <p>
                    {{ isEmpty(fieldData.istCralLocaraTno)
                      ||isEmpty(fieldData.istMexnoEncr)
                      ||isEmpty(fieldData.istCralIdvTno)?
                        '': fieldData.istCralLocaraTno + '-' + fieldData.istMexnoEncr + '-' + fieldData.istCralIdvTno }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <!-- 주소 -->
                <kw-form-item
                  :label="$t('MSG_TXT_ADDR')"
                  :colspan="2"
                >
                  <p>
                    {{ fieldData.istAdrZip }}
                    {{ fieldData.istAdrMain }}
                    {{ fieldData.istDtlAdr }}
                  </p>
                </kw-form-item>
              </kw-form-row>
            </kw-form>
          </kw-expansion-item>

          <kw-expansion-item
            padding-target="header"
            expansion-icon-align="center"
            expand-icon-class="kw-font-pt24"
            default-opened
          >
            <!-- orderProduct가 바뀐걸 옵저버가 인지하지 못해서 컴포넌트 추가함. -->
            <kw-field
              v-show="false"
              v-model="orderProduct"
            />
            <kw-field
              v-show="false"
              v-model="istEnvRequest"
            />

            <template #header>
              <kw-item-section>
                <kw-item-label>
                  <!-- 주문상품 선택 -->
                  <h3>
                    {{ $t('MSG_TXT_ODER') + $t('MSG_TXT_PRDT') + ' ' + $t('MSG_TXT_SELT') }}
                  </h3>
                </kw-item-label>
              </kw-item-section>
            </template>

            <kw-form-row>
              <kw-form-item
                :label="$t('MSG_TXT_PRDT') + $t('MSG_TXT_SEARCH')"
                :colspan="3"
              >
                <kw-input
                  v-model="searchParams.pdNm"
                  icon="search"
                  maxlength="100"
                  grow
                  :disable="fieldData.slClYn==='Y'"
                  @click-icon="onClickSelectProduct"
                />
              </kw-form-item>
            </kw-form-row>

            <div>
              <rental-price-select
                v-if="isFetched"
                :key="`rps-${compKey}`"
                :model-value="orderProduct"
                :bas="fieldData"
                @select:one-plus-one="onClickOnePlusOne"
                @delete:one-plus-one="onDeleteOnePlusOne"
                @change:device="onClickDeviceChange"
                @packaging="onPackaging"
                @price-changed="onPriceChanged(orderProduct, $event)"
                @delete="onClickDelete(orderProduct)"
              />
            </div>

            <div class="row justify-end my20">
              <kw-btn
                primary
                label="상품확정"
                :disable="isCnfmPd"
                @click="onClickConfirm"
              />
            </div>
          </kw-expansion-item>

          <kw-expansion-item
            padding-target="header"
            expansion-icon-align="center"
            expand-icon-class="kw-font-pt24"
            default-opened
          >
            <template #header>
              <kw-item-section>
                <kw-item-label>
                  <h3>
                    {{ $t('MSG_TXT_IST_ENVR') + ' ' + $t('MSG_BTN_ALC') + ' ' + $t('MSG_TXT_RQMT') }}
                  </h3><!-- 설치환경 및 요청사항 -->
                </kw-item-label>
              </kw-item-section>
            </template>
            <kw-form
              class="pb20"
              :cols="2"
            >
              <kw-form-row>
                <!-- 전압 -->
                <kw-form-item :label="$t('MSG_TXT_VTG')">
                  <kw-option-group
                    v-model="istEnvRequest.useElectTpCd"
                    type="radio"
                    :options="codes.USE_ELECT_TP_CD"
                  />
                </kw-form-item>
                <!-- 수압 -->
                <kw-form-item
                  :label="$t('MSG_TXT_WPRS')"
                >
                  <kw-option-group
                    v-model="istEnvRequest.wprsItstTpCd"
                    type="radio"
                    :options="codes.WPRS_ITST_TP_CD"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <!-- 수질 -->
                <kw-form-item
                  :label="$t('MSG_TXT_WTQLTY')"
                >
                  <kw-option-group
                    v-model="istEnvRequest.srcwtTpCd"
                    type="radio"
                    :options="codes.SRCWT_TP_CD"
                  />
                </kw-form-item>
                <!-- 장소 -->
                <kw-form-item :label="$t('MSG_TXT_PLAC')">
                  <kw-select
                    v-model="istEnvRequest.istPlcTpCd"
                    :options="codes.IST_PLC_TP_CD"
                    first-option="select"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <!-- 요청사항 -->
                <kw-form-item
                  :label="$t('MSG_TXT_RQMT')"
                >
                  <kw-input
                    v-model="istEnvRequest.istAkArtcMoCn"
                    type="textarea"
                    maxlength="1000"
                    :rows="3"
                  />
                </kw-form-item>
                <!-- 참고사항 -->
                <kw-form-item :label="$t('MSG_TXT_REFER_ARTC')">
                  <p>{{ istEnvRequest.sconCn }}</p>
                </kw-form-item>
              </kw-form-row>
            </kw-form>
          </kw-expansion-item>
          <kw-expansion-item
            padding-target="header"
            expansion-icon-align="center"
            expand-icon-class="kw-font-pt24"
            default-opened
          >
            <template #header>
              <kw-item-section>
                <kw-item-label>
                  <h3>
                    {{ $t('MSG_TXT_PLAR')+' '+$t('MSG_TXT_INF') }}
                  </h3><!-- 플래너 정보 -->
                </kw-item-label>
              </kw-item-section>
            </template>
            <kw-form
              class="pb20"
              dense
              :cols="2"
            >
              <kw-form-row>
                <!-- 성명 -->
                <kw-form-item :label="$t('MSG_TXT_EMPL_NM')">
                  <p>{{ fieldData.prtnrKnm }}</p>
                </kw-form-item>
                <!-- 플래너번호 -->
                <kw-form-item
                  :label="$t('MSG_TXT_PLAR')+$t('MSG_TXT_PRTNR_NO')"
                >
                  <p>{{ fieldData.prtnrNo }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <!-- 지역단코드 -->
                <kw-form-item :label="$t('MSG_TXT_RGRP_CD')">
                  <p>{{ fieldData.dgr2LevlOgCd }}</p>
                </kw-form-item>
                <!-- 소속코드 -->
                <kw-form-item :label="$t('MSG_TXT_BLG_CD')">
                  <p>{{ fieldData.ogCd }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <!-- 휴대전화번호 -->
                <kw-form-item :label="$t('MSG_TXT_MPNO')">
                  <p>
                    {{ isEmpty(fieldData.prtnrCralLocaraTno)
                      ||isEmpty(fieldData.prtnrMexnoEncr)
                      ||isEmpty(fieldData.prtnrCralIdvTno)?
                        '':
                        fieldData.prtnrCralLocaraTno + '-' +
                        fieldData.prtnrMexnoEncr + '-' +
                        fieldData.prtnrCralIdvTno }}
                  </p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <!-- 주소 -->
                <kw-form-item
                  :label="$t('MSG_TXT_ADDR')"
                  :colspan="2"
                >
                  <p>
                    {{ fieldData.prtnrAdrZip }}
                    {{ fieldData.prtnrAdrMain }}
                    {{ fieldData.prtnrDtlAdr }}
                  </p>
                </kw-form-item>
              </kw-form-row>
            </kw-form>
          </kw-expansion-item>
        </kw-list>
        <kw-action-bottom>
          <!-- 저장 -->
          <kw-btn
            v-permission:update
            primary
            :label="$t('MSG_BTN_SAVE')"
            :disable="!isFetched"
            @click="onClickSave"
          />
        </kw-action-bottom>
      </div>
    </kw-form>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, stringUtil, codeUtil, useGlobal, getComponentType } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import RentalPriceSelect
  from '~sms-wells/contract/components/ordermgmt/WwctaRentalFinalPriceSelect.vue';
import { warn } from 'vue';
import {
  CNTR_REL_DTL_CD,
  RENTAL_DSC_DV_CD,
  RENTAL_DSC_TP_CD,
} from '~sms-wells/contract/constants/ctConst';

const dataService = useDataService();
const { modal, alert, confirm, notify } = useGlobal();
const { t } = useI18n();

const props = defineProps({
  cntrNo: {
    type: String,
    default: undefined,
  },
  cntrSn: {
    type: String,
    default: undefined,
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const obsRef = ref(getComponentType('KwForm'));
const compKey = ref(0); // 렌탈가격설정 컴포넌트 생성키

const codes = await codeUtil.getMultiCodes(
  'USE_ELECT_TP_CD', // 사용전력유형코드. 110V(1), 220V(2)
  'WPRS_ITST_TP_CD', // 수압강도유형코드. 강(1), 약(2)
  'SRCWT_TP_CD', // 상수원유형코드. 상수도(1), 지하수(2), 간이상수원(3)
  'IST_PLC_TP_CD', // 설치장소유형코드. 자택(1), 사무실(2), 업소(3), 학교(4), 기타(5)
);

const searchParams = ref({
  cntrNo: '',
  cntrSn: '',
  cntrNoSn: '',
  pdCd: '',
  pdNm: '',
  sellInflwChnlDtlCd: '',
  copnDvCd: '',
});

const fieldData = ref({
  cntrNo: '', // [계약정보-계약번호]
  cntrSn: '', // [계약정보-계약일련번호]
  cntrDtlStatCd: '', // 계약상세상태코드
  cntrDtlStatNm: '', // [계약정보-판매/접수구분] 계약상세상태명
  cntrCnfmDt: '', // [계약정보-계약일] 계약일자
  istDt: '', // [계약정보-설치일] 설치일자
  canDt: '', // [계약정보-취소일자] 취소일자
  reqdDt: '', // [계약정보-철거일자] 철거일자
  slClYn: '', // 전월매출마감여부
  cntrCstKnm: '', // [계약자고객정보-계약자] 계약자명
  cntrCstNo: '', // [계약자고객정보-고객번호] 계약자고객번호
  copnDvCd: '', // 개인/법인구분
  copnDvNm: '', // [계약자고객정보-구분] 개인/법인구분
  bryyMmdd: '', // [계약자고객정보-생년월일]
  sexDvNm: '', // [계약자고객정보-성별] 성별구분명
  cralLocaraTno: '', // [계약자고객정보-휴대전화번호1]
  mexnoEncr: '', // [계약자고객정보-휴대전화번호2]
  cralIdvTno: '', // [계약자고객정보-휴대전화번호3]
  locaraTno: '', // [계약자고객정보-전화번호1]
  exnoEncr: '', // [계약자고객정보-전화번호2]
  idvTno: '', // [계약자고객정보-전화번호3]
  adrZip: '', // [계약자고객정보-우편번호]
  adrMain: '', // [계약자고객정보-주소]
  dtlAdr: '', // [계약자고객정보-상세주소]
  istKnm: '', // [설치자고객정보-고객명]
  istCralLocaraTno: '', // [설치자고객정보-휴대전화번호1]
  istMexnoEncr: '', // [설치자고객정보-휴대전화번호2]
  istCralIdvTno: '', // [설치자고객정보-휴대전화번호3]
  istAdrZip: '', // [설치자고객정보-우편번호]
  istAdrMain: '', // [설치자고객정보-주소]
  istDtlAdr: '', // [설치자고객정보-상세주소]
  pdMclsfNm: '', // [주문상품선택-분류] 상품중분류명
  basePdCd: '', // [주문상품선택-상품코드]
  pdCd: '', // 상품코드
  pdNm: '', // [주문상품선택-상품명]
  cntrAmt: '', // [주문상품선택-등록비] 계약금액
  fnlAmt: '', // [주문상품선택-월렌탈료] 최종금액
  sellInflwChnlDtlCd: '', // 판매유입채널상세코드
  stplPtrm: '', // [주문상품선택-약정기간]
  cntrPtrm: '', // [주문상품선택-계약기간]
  sellDscDvCd: '', // [주문상품선택-렌탈할인구분코드] 법인(1),중고보상(3),법인단체(5),...
  sellDscTpCd: '', // [주문상품선택-렌탈할인유형코드] 전체(a),재렌탈(02),1+1(03),...
  svPdCd: '', // [주문상품선택-서비스] 대상상품코드
  sellDscrCd: '', // 판매할인율코드 (법인일때 사용)
  ackmtPerfAmt: '', /* [인정실적] 인정실적금액 */
  ackmtPerfRt: '', /* [인정실적] 인정실적율 */
  feeAckmtBaseAmt: '', /* [수수료 기준금액] 수수료인정기준금액 */
  plusCntrNo: '', // [주문상품선택-1+1계약번호] 대상상세계약번호
  plusCntrSn: '', // [주문상품선택-1+1계약일련번호] 대상상세계약일련번호
  plusPdCd: '', // 1+1 상품코드
  plusSellTpCd: '', // 1+1 판매유형코드
  plusPdNm: '', // [주문상품선택-1+1상품명]
  mchChCntrNo: '', // [주문상품선택-기기변경 계약번호] 대상계약번호
  mchChCntrSn: '', // [주문상품선택-기기변경 계약일련번호] 대상계약일련번호
  mchChPdCd: '', // 기기변경 기준상품코드
  mchChPdNm: '', // [주문상품선택-기기변경 상품명]
  mchChSellTpCd: '', // 기기변경 판매유형코드
  useElectTpCd: '', // [설치환경및요청사항-전압] 사용전력유형코드. 110v(1),220v(2)
  wprsItstTpCd: '', // [설치환경및요청사항-수압] 수압강도유형코드. 강(1),약(2)
  srcwtTpCd: '', // [설치환경및요청사항-수질] 상수원유형코드. 상수도(1),지하수(2),간이상수원(3)
  istPlcTpCd: '', // [설치환경및요청사항-장소] 설치장소유형코드. 자택(1),사무실(2),업소(3),학교(4),기타(5)
  istAkArtcMoCn: '', // [설치환경및요청사항-요청사항] 설치요청사항메모내용
  sconCn: '', // [설치환경및요청사항-참고사항] 특약내용
  prtnrKnm: '', // [플래너정보-성명] 파트너한글명
  prtnrNo: '', // [플래너정보-플래너번호] 파트너번호
  dgr2LevlOgCd: '', // [플래너정보-지역단코드] 2차레벨조직코드(지역단)
  ogCd: '', // [플래너정보-소속코드] 조직코드
  prtnrCralLocaraTno: '', // [플래너정보-휴대전화번호1]
  prtnrMexnoEncr: '', // [플래너정보-휴대전화번호2]
  prtnrCralIdvTno: '', // [플래너정보-휴대전화번호3]
  prtnrAdrZip: '', // [플래너정보-우편번호]
  prtnrAdrMain: '', // [플래너정보-주소]
  prtnrDtlAdr: '', // [플래너정보-상세주소]
  alncmpCd: '', // 제휴사코드
  alncmpCntrDrmVal: '', // 제휴사계약식별값
});

const orderProduct = ref({});
const promotions = ref([]); // 적용가능한 프로모션

// 설치환경 및 요청사항
const istEnvRequest = ref({
  useElectTpCd: '', // [설치환경및요청사항-전압] 사용전력유형코드. 110v(1),220v(2)
  wprsItstTpCd: '', // [설치환경및요청사항-수압] 수압강도유형코드. 강(1),약(2)
  srcwtTpCd: '', // [설치환경및요청사항-수질] 상수원유형코드. 상수도(1),지하수(2),간이상수원(3)
  istPlcTpCd: '', // [설치환경및요청사항-장소] 설치장소유형코드. 자택(1),사무실(2),업소(3),학교(4),기타(5)
  istAkArtcMoCn: '', // [설치환경및요청사항-요청사항] 설치요청사항메모내용
  sconCn: '', // [설치환경및요청사항-참고사항] 특약내용
});

const isLinked = ref(false); // 다른 화면에서 넘어왔나(계약번호를 받아왔나)
const isFetched = ref(false); // 조회되었나
const isInit = ref(true); // 조회후 초기화인가
const isCnfmPd = ref(false); // 상품확정 유무

// 설치환경 및 요청사항 초기화
async function initIstEnvRequest() {
  istEnvRequest.value.useElectTpCd = fieldData.value.useElectTpCd;
  istEnvRequest.value.wprsItstTpCd = fieldData.value.wprsItstTpCd;
  istEnvRequest.value.srcwtTpCd = fieldData.value.srcwtTpCd;
  istEnvRequest.value.istPlcTpCd = fieldData.value.istPlcTpCd;
  istEnvRequest.value.istAkArtcMoCn = fieldData.value.istAkArtcMoCn;
  istEnvRequest.value.sconCn = fieldData.value.sconCn;
}

// 프로모션정보 조회
async function fetchPromotionData(cntrNo, pdPrcFnlDtlId, sellEvCd, mchnCh) {
  // 적용가능한 프로모션 정보 조회
  const res = await dataService.post(
    '/sms/wells/contract/contracts/promotions',
    { cntrNo, pdPrcFnlDtlId, sellEvCd, mchnCh, ojCntrRels: null },
  );

  promotions.value = res.data;
  isCnfmPd.value = true;
}

// 상품확정 버튼 클릭
async function onClickConfirm() {
  // 적용가능한 프로모션 조회
  promotions.value = [];
  orderProduct.value.appliedPromotions = [];

  if (!orderProduct.value.pdPrcFnlDtlId) {
    notify('상품 가격을 확인해주세요');
    return;
  }

  await fetchPromotionData(
    orderProduct.value.cntrNo,
    orderProduct.value.pdPrcFnlDtlId,
    orderProduct.value.sellEvCd,
    orderProduct.value.mchnCh,
  );

  orderProduct.value.promotions = promotions.value;
}

// 기본정보 조회
async function fetchData() {
  isFetched.value = false;
  isInit.value = true;

  const res = await dataService.get(
    '/sms/wells/contract/changeorder/rental-change-infos',
    { params:
    { cntrNo: searchParams.value.cntrNo,
      cntrSn: searchParams.value.cntrSn,
      isAdmin: false,
    } },
  );
  Object.assign(fieldData.value, res.data);

  // 주문상품 검색창에 상품명 세팅
  searchParams.value.pdNm = fieldData.value.pdNm;

  // 적용가능한 프로모션정보 조회
  await fetchPromotionData(
    fieldData.value.cntrNo,
    fieldData.value.pdPrcFnlDtlId,
    fieldData.value.sellEvCd,
    isEmpty(fieldData.value.mchChCntrNo) ? null
      : {
        ojCntrNo: fieldData.value.mchChCntrNo,
        ojCntrSn: fieldData.value.mchChCntrSn,
        mchnChTpCd: fieldData.value.mchnChTpCd,
      },
  );

  // 설치환경 및 요청사항 초기화
  await initIstEnvRequest();

  // 주문상품선택 세팅
  console.log('orderProduct 세팅');
  const product = {
    pdPrcFnlDtlId: fieldData.value.pdPrcFnlDtlId,
    pdQty: fieldData.value.pdQty,
    promotions: promotions.value,
    appliedPromotions: fieldData.value.promts,
    cstBasePdAbbrNm: fieldData.value.pdNm,
    pdCd: fieldData.value.pdCd,
    cntrNo: fieldData.value.cntrNo,
    pdClsfNm: fieldData.value.pdMclsfNm,
  };

  // 적용되있는 기기변경 세팅
  if (!isEmpty(fieldData.value.mchChCntrNo)) {
    product.mchnCh = {
      mchnChYn: true,
      ojCntrNo: fieldData.value.mchChCntrNo,
      ojCntrSn: fieldData.value.mchChCntrSn,
      pdNm: fieldData.value.mchChPdNm,
      mchnChTpCd: fieldData.value.mchnChTpCd,
      pasgMcn: '', // TODO: 가져와야됨
      mchnCpsApyr: '', // TODO: 가져와야됨
      mchnClnOjYn: '', // TODO: 가져와야됨
      ojCntrMmBaseDvCd: '', // TODO: 가져와야됨
    };
    if (fieldData.value.mchnChTpCd === '19') {
      product.priceOptionFilter = {
        ...product.priceOptionFilter,
        rentalDscDvCd: RENTAL_DSC_DV_CD.GENERAL,
        rentalDscTpCd: RENTAL_DSC_TP_CD.STPL_5_YEAR_RE_RENTAL,
      };
    } else {
      orderProduct.value.priceOptionFilter = {
        ...orderProduct.value.priceOptionFilter,
        rentalDscDvCd: '8',
        rentalDscTpCd: RENTAL_DSC_TP_CD.RE_RENTAL,
      };
    }
  }

  // 적용되있는 1+1 세팅
  if (!isEmpty(fieldData.value.plusCntrNo)) {
    product.cntrRels ??= [];
    product.cntrRels.push({
      cntrRelId: undefined,
      cntrRelDtlCd: CNTR_REL_DTL_CD.LK_ONE_PLUS_ONE,
      baseDtlCntrNo: fieldData.value.cntrNo,
      baseDtlCntrSn: fieldData.value.cntrSn,
      ojDtlCntrNo: fieldData.value.plusCntrNo,
      ojDtlCntrSn: fieldData.value.plusCntrSn,
      basePdBas: {
        pdCd: fieldData.value.pdCd,
        pdNm: fieldData.value.pdNm,
      },
    });

    product.priceOptionFilter = {
      ...product.priceOptionFilter,
      rentalDscDvCd: RENTAL_DSC_DV_CD.GENERAL,
      rentalDscTpCd: RENTAL_DSC_TP_CD.ONE_PLUS_ONE,
    };
  }

  compKey.value += 1;
  orderProduct.value = product;

  if (!isLinked.value) {
    searchParams.value = {};
  }

  isFetched.value = true;
  isCnfmPd.value = true;
  obsRef.value.init();
}

// 상품 가격이 바꼈을 때, 이벤트
function onPriceChanged(item, price) {
  console.log('onPriceChanged');
  item.finalPrice = price;

  orderProduct.value = item;

  // 최초 세팅시
  if (isInit.value) {
    console.log('promotions 세팅 : ', promotions.value);
    isInit.value = false;

    // 적용되있는 프로모션 세팅
    if (!isEmpty(promotions.value)) {
      orderProduct.value.promotions = promotions.value;
    } else {
      fieldData.value.promts?.forEach((i) => { i.pmotApyGrpCd = null; i.pmotApyOptCd = null; });
      orderProduct.value.promotions = fieldData.value.promts;
    }
    orderProduct.value.appliedPromotions = fieldData.value.promts;

    isCnfmPd.value = true;
    obsRef.value.init();
  } else {
    promotions.value = [];
    isCnfmPd.value = false;
  }
}

// 모창에서 연결되어 넘어왔는지 여부
onMounted(async () => {
  if (props.cntrNo && props.cntrSn) {
    searchParams.value.cntrNo = props.cntrNo;
    searchParams.value.cntrSn = props.cntrSn;
    searchParams.value.cntrNoSn = `${props.cntrNo}-${props.cntrSn}`;
    isLinked.value = true;
    await fetchData();
  }
});

// 상품검색 아이콘 클릭
async function onClickSelectProduct() {
  const { result, payload } = await modal({
    component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
    componentProps: {
      searchValue: searchParams.value.pdNm,
      sellTpCd: '2',
      selectType: pdConst.PD_SEARCH_SINGLE,
    },
  });

  if (result) {
    if (payload[0].sellTpCd !== '2' || payload[0].sellYn !== 'Y') {
      await alert('렌탈 판매 상품이 아닙니다.');
      return;
    }

    console.log('payload : ', payload[0]);

    if (!isEmpty(payload[0].channelId)) {
      if (payload[0].channelId.indexOf(fieldData.value.sellInflwChnlDtlCd) === -1) {
        await alert(`선택 가능한 상품이 아닙니다. 판매채널[${fieldData.value.sellInflwChnlDtlCd}]을 확인해주세요.`);
        return;
      }
    } else {
      await alert('선택 가능한 상품이 아닙니다. 판매채널을 확인해주세요.');
      return;
    }

    searchParams.value.pdCd = payload[0].pdCd;
    searchParams.value.pdNm = payload[0].pdNm;
    searchParams.value.sellInflwChnlDtlCd = fieldData.value.sellInflwChnlDtlCd;

    console.log(payload[0]);

    isFetched.value = false;

    compKey.value += 1;

    // 주문상품선택 세팅
    orderProduct.value = {
      pdPrcFnlDtlId: '',
      verSn: '',
      fnlAmt: 0,
      pdQty: 1,
      cstBasePdAbbrNm: payload[0].pdNm,
      pdCd: payload[0].pdCd,
      cntrNo: fieldData.value.cntrNo,
      pdClsfNm: '',
    };
    promotions.value = [];

    isFetched.value = true;
    isCnfmPd.value = false;
  }
}

// 다건할인(패키징) 선택 클릭
async function onPackaging() {
  alert('다건할인은 변경할 수 없습니다.');
}

// 기기변경 버튼 클릭
async function onClickDeviceChange(odrPrdct) {
  const { result, payload } = await modal({
    component: 'WwctaMachineChangeCustomerDtlP',
    componentProps: {
      baseCntrNo: fieldData.value.cntrNo,
      baseCntrSn: fieldData.value.cntrSn,
      cstNo: fieldData.value?.cntrCstNo,
      indvCrpDv: fieldData.value?.copnDvCd,
      pdCd: odrPrdct.pdCd,
      dscDv: odrPrdct.finalPrice?.rentalDscDvCd,
      dscTp: odrPrdct.sellDscTpCd,
      sellTpCd: '2',
      alncmpCd: odrPrdct.alncmpCntrDrmVal,
      rgstMdfcDv: '1', // FIXME: 등록, 수정 구분 필요
    },
  });

  if (!result) {
    return;
  }

  odrPrdct.mchnCh = {
    mchnChYn: result,
    ojCntrNo: payload.cntrNo,
    ojCntrSn: payload.cntrSn,
    pdNm: payload.pdNm,
    mchnChTpCd: payload.workFlag,
    pasgMcn: payload.rentalNmnN,
    mchnCpsApyr: payload.finalPerfRt,
    mchnClnOjYn: payload.clnYn,
    ojCntrMmBaseDvCd: payload.resultDvCheck,
  };

  if (payload.workFlag === '19') {
    odrPrdct.priceOptionFilter = {
      ...odrPrdct.priceOptionFilter,
      rentalDscDvCd: RENTAL_DSC_DV_CD.GENERAL,
      rentalDscTpCd: RENTAL_DSC_TP_CD.STPL_5_YEAR_RE_RENTAL,
    };
  } else {
    odrPrdct.priceOptionFilter = {
      ...odrPrdct.priceOptionFilter,
      rentalDscDvCd: '8',
      rentalDscTpCd: RENTAL_DSC_TP_CD.RE_RENTAL,
    };
  }
}

function onClickDelete() {
  alert('계약변경에서는 상품변경만 가능합니다.');
}

// 1+1 버튼 클릭
async function onClickOnePlusOne(odrPrdct) {
  const { pdCd, basePdCd /* 안전장치 */ } = odrPrdct;

  const { result, payload } = await modal({
    component: 'WwctaOnePlusOneContractListP',
    componentProps: {
      cntrNo: fieldData.value.cntrNo,
      pdCd: pdCd || basePdCd,
    },
  });

  if (!result) {
    return;
  }

  odrPrdct.cntrRels ??= [];
  odrPrdct.cntrRels.push({
    cntrRelId: undefined,
    cntrRelDtlCd: CNTR_REL_DTL_CD.LK_ONE_PLUS_ONE,
    baseDtlCntrNo: fieldData.value.cntrNo,
    baseDtlCntrSn: fieldData.value.cntrSn,
    ojDtlCntrNo: payload.cntrNo,
    ojDtlCntrSn: payload.cntrSn,
    basePdBas: {
      pdCd: odrPrdct.pdCd,
      pdNm: odrPrdct.pdNm,
    },
    ojBasePdBas: { ...payload }, /* 기기 선택 해야함. */
  });

  odrPrdct.priceOptionFilter = {
    ...odrPrdct.priceOptionFilter,
    rentalDscDvCd: RENTAL_DSC_DV_CD.GENERAL,
    rentalDscTpCd: RENTAL_DSC_TP_CD.ONE_PLUS_ONE,
  };
}

// 1+1상품 삭제 버튼 클릭
async function onDeleteOnePlusOne(odrPrdct) {
  const { cntrRels } = odrPrdct;
  if (!cntrRels?.length) {
    warn('계약관계가 상이합니다.');
  }
  const onePlusOneRelIndex = cntrRels.findIndex((cntrRel) => cntrRel.cntrRelDtlCd === CNTR_REL_DTL_CD.LK_ONE_PLUS_ONE);
  if (onePlusOneRelIndex < 0) {
    warn('1+1 관계가 없습니다.');
  }
  cntrRels.splice(onePlusOneRelIndex, 1);

  if (odrPrdct.priceOptionFilter?.rentalDscTpCd) {
    odrPrdct.priceOptionFilter.rentalDscTpCd = undefined;
  }
  if (odrPrdct.priceOptionFilter.rentalDscDvCd) {
    odrPrdct.priceOptionFilter.rentalDscDvCd = undefined;
  }
}

// 저장 버튼 클릭
async function onClickSave() {
  // console.log(orderProduct.value);
  // console.log(istEnvRequest.value);

  // console.log('필드데이터 : ', fieldData.value); // 변경전 계약의 모든 데이터
  // console.log('오더프로덕트 : ', orderProduct.value); // 변경후 상품 데이터
  // console.log('설치환경 : ', istEnvRequest.value); // 변경후 설치환경 데이터

  if (!obsRef.value.isModified()) {
    await alert(t('MSG_ALT_NO_CHG_CNTN')); // 변경된 내용이 없습니다.
    return;
  }

  if (!isCnfmPd.value) {
    await alert('먼저 상품확정을 해주세요.');
    return;
  }

  if (!await confirm('계약의 정보를 변경하시겠습니까?')) return;

  // orderProduct.value.cntrNo = fieldData.value.cntrNo;
  // orderProduct.value.cntrSn = fieldData.value.cntrSn;
  // orderProduct.value.exMchChYn = isEmpty(fieldData.value.mchChCntrNo) ? 'N' : 'Y'; // 1+1 계약 여부
  // orderProduct.value.exOpoYn = isEmpty(fieldData.value.plusCntrNo) ? 'N' : 'Y'; // 기기변경 계약 여부
  // orderProduct.value.exMchChCntrNo = fieldData.value.mchChCntrNo;
  // orderProduct.value.exMchChCntrSn = fieldData.value.mchChCntrSn;
  // orderProduct.value.exPlusCntrNo = fieldData.value.plusCntrNo;
  // orderProduct.value.exPlusCntrSn = fieldData.value.plusCntrSn;

  await dataService.post('/sms/wells/contract/changeorder/rental-change-infos', {
    baseInfo: fieldData.value,
    product: orderProduct.value,
    istEnv: istEnvRequest.value,
  });

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

// 조회 버튼 클릭
async function onClickSearch() {
  await fetchData();
}

</script>

<style scoped lang="scss">
.product {
  flex-direction: column;

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

  &-middle-area {
    padding-left: 68px;
    padding-right: 44px;
    width: 100%;
  }

  &-right-area {
    padding-left: 68px;
    width: 100%;
  }

  &-type {
    width: 68px;
    padding-right: 8px;
    font-size: 14px;
    white-space: normal;
    color: $black3;
    box-sizing: content-box;
  }

  &-content {
    display: flex;
    align-items: left;
    width: 100%;
    flex-direction: column;
    gap: 12px 0;
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

  .kw-btn {
    align-self: flex-start;
  }
}

.setting-box {
  padding-left: 68px;
  padding-right: 44px;
  margin-top: 12px;
  width: 100%;

  & > li + li {
    margin-top: 12px;
  }

  .form-full-size {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    .kw-date-picker,
    .kw-input,
    .kw-select {
      min-width: calc((100% - 16px) / 3);
    }
  }
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

.dashed-line {
  border-top: 1px dashed #ddd;
  height: 0;
  background: none;
}
</style>
