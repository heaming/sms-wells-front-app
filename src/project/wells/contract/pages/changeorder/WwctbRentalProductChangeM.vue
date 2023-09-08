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
  <kw-page
    ref="obsRef"
  >
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

    <kw-form>
      <div class="result-area">
        <h3 class="text-bold kw-font-pt18">
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
                  <span class="text-bold kw-font-pt18">{{ $t('MSG_TXT_CNTRT') + ' ' + $t('MSG_TXT_CST_INF') }}</span>
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
                  <span class="text-bold kw-font-pt18">{{ $t('MSG_TXT_INSTR') + ' ' + $t('MSG_TXT_CST_INF') }}</span>
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
            <template #header>
              <kw-item-section>
                <kw-item-label>
                  <!-- 주문상품 선택 -->
                  <span class="text-bold kw-font-pt18">
                    {{ $t('MSG_TXT_ODER') + $t('MSG_TXT_PRDT') + ' ' + $t('MSG_TXT_SELT') }}
                  </span>
                </kw-item-label>
              </kw-item-section>
            </template>
            <kw-form
              :cols="1"
              class="pb20"
            >
              <kw-form-row>
                <!-- 상품검색 -->
                <kw-form-item :label="$t('MSG_TXT_PRDT') + $t('MSG_TXT_SEARCH')">
                  <div class="column col">
                    <div
                      class="row"
                      style="max-width: 55%;"
                    >
                      <kw-input
                        v-model="searchParams.pdNm"
                        icon="search"
                        maxlength="100"
                        grow
                        @click-icon="onClickSelectProduct"
                      />
                    </div>
                    <div class="border-box mt12">
                      <div class="product">
                        <div class="product-inside">
                          <div class="product-left-area">
                            <!-- 상품중분류명 -->
                            <span class="product-type">
                              {{ orderProduct.pdMclsfNm }}
                            </span>
                            <div class="product-content">
                              <div class="column">
                                <p class="kw-fc--black1 text-weight-medium ">
                                  {{ orderProduct.pdNm }}
                                  {{ '(' + orderProduct.pdCd + ')' }}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div class="row justify-end w155">
                            <!-- 기기변경 -->
                            <kw-btn
                              v-permission:update
                              :label="$t('MSG_TXT_MCHN_CH')"
                              :disable="!isEmpty(orderProduct.plusCntrNo)"
                              dense
                              @click="onClickDeviceChange"
                            />
                            <kw-btn
                              v-permission:update
                              label="1+1"
                              :disable="!isEmpty(orderProduct.mchChCntrNo)"
                              class="ml8"
                              dense
                              @click="onClickOnePlusOne"
                            />
                          </div>
                        </div>
                        <ul class="setting-box">
                          <li class="row items-center justify-between no-wrap">
                            <ul
                              class="product-price-list"
                            >
                              <li class="product-price-item">
                                <p class="kw-font-pt14 kw-fc--black3">
                                  {{ $t('MSG_TXT_RGST_FEE') }}<!-- 등록비 -->
                                </p>
                                <span class="kw-fc--black1 text-bold ml8">
                                  {{ stringUtil.getNumberWithComma(orderProduct.cntrAmt || 0) }}원
                                </span>
                              </li>
                              <!-- <li class="product-price-item">
                              <p class="kw-font-pt14 kw-fc--black3">
                                선납금
                              </p>
                              <span class="kw-fc--black1 text-bold ml8">100,000원</span>
                            </li> -->
                              <li class="product-price-item">
                                <p class="kw-font-pt14 kw-fc--black3">
                                  월
                                </p>
                                <span class="kw-fc--black1 text-bold ml8">
                                  {{ stringUtil.getNumberWithComma(orderProduct.fnlAmt || 0) }}원
                                </span>
                              <!-- <span class="kw-font-pt14 kw-fc--black3 ml8 text-strike">120,000</span> -->
                              </li>
                            </ul>
                            <zwcm-counter />
                          </li>
                          <li class="form-full-size">
                            <!-- 약정기간 선택 -->
                            <kw-select
                              v-model="orderProduct.stplPtrm"
                              :options="stplPtrms"
                              first-option="select"
                              first-option-value=""
                              :first-option-label="$t('MSG_TXT_CONTRACT_PERI') + ' ' + $t('MSG_TXT_SELT')"
                              @change="selectRentalPriceChanges"
                            />
                            <!-- 계약기간 선택 -->
                            <kw-select
                              v-model="orderProduct.cntrPtrm"
                              :options="cntrPtrms"
                              first-option="select"
                              first-option-value=""
                              :first-option-label="$t('MSG_TXT_CNTR_PTRM') + ' ' + $t('MSG_TXT_SELT')"
                              @change="selectRentalPriceChanges"
                            />
                            <!-- 등록비 선택 -->
                            <kw-select
                              v-model="orderProduct.cntrAmt"
                              :options="rgstFees"
                              first-option="select"
                              first-option-value="0"
                              :first-option-label="$t('MSG_TXT_RGST_FEE') + ' ' + $t('MSG_TXT_SELT')"
                              @change="selectRentalPriceChanges"
                            />
                            <!-- 렌탈할인구분 선택 -->
                            <kw-select
                              v-model="orderProduct.sellDscDvCd"
                              :options="rentalDscDvCds"
                              first-option="select"
                              first-option-value=""
                              :first-option-label="$t('TXT_MSG_RENTAL_DSC_DV_CD') + ' ' + $t('MSG_TXT_SELT')"
                              @change="selectRentalPriceChanges"
                            />
                            <!-- 렌탈할인유형 선택 -->
                            <kw-select
                              v-model="orderProduct.sellDscTpCd"
                              :options="rentalDscTpCds"
                              :disable="!isEmpty(orderProduct.plusCntrNo)"
                              first-option="select"
                              first-option-value=""
                              :first-option-label="$t('MSG_TXT_RENTAL_DSC_TP_CD') + ' ' + $t('MSG_TXT_SELT')"
                              @change="selectRentalPriceChanges"
                            />
                          </li>
                          <li class="scoped-child-select">
                            <!-- 서비스(용도/방문주기) 선택 -->
                            <kw-select
                              v-model="orderProduct.svPdCd"
                              :colspan="1"
                              :options="svPdCds"
                              grow
                              first-option="select"
                              first-option-value=""
                              :first-option-label="
                                $t('MSG_TXT_SERVICE')+
                                  '('+$t('MSG_TXT_USWY')+'/'+$t('MSG_TXT_VST_PRD')+') '+
                                  $t('MSG_TXT_SELT')"
                              @change="selectRentalPriceChanges"
                            />
                          <!-- <kw-select
                            v-model="orderProduct.evtCd"
                            :options="evtCds"
                            grow
                            first-option="select"
                            first-option-value=""
                            first-option-label="행사코드 선택"
                          /> -->
                          </li>
                        </ul>

                        <!-- 기기변경 내역 -->
                        <kw-form
                          v-show="false"
                        >
                          <kw-form-row>
                            <kw-input
                              v-model="orderProduct.mchChCntrNo"
                            />
                          </kw-form-row>
                        </kw-form>
                        <div
                          v-if="orderProduct.mchChCntrNo && orderProduct.mchChCntrSn"
                          class="product-right-area"
                        >
                          <kw-separator class="dashed-line my20" />

                          <div class="row items-center justify-between">
                            <div
                              class="row"
                              style="width: calc(100% - 45px);"
                            >
                              <!-- 기기변경 -->
                              <kw-chip
                                :label="$t('MSG_TXT_MCHN_CH')"
                                color="primary"
                                outline
                                class="ma2"
                              />

                              <ul
                                class="product-price-list kw-grow"
                                style="max-width: calc(100% - 45px);"
                              >
                                <li
                                  class="product-price-item kw-grow"
                                  style="max-width: calc(100% - 355px);"
                                >
                                  <span
                                    class="kw-fc--black1 ml8 "
                                    style="overflow: hidden;
                                      text-overflow: ellipsis;
                                      white-space: nowrap;"
                                  >
                                    {{ orderProduct.mchChPdNm }}
                                  </span>
                                </li>

                                <li class="product-price-item">
                                  <p class="kw-font-pt14 kw-fc--black3">
                                    {{ $t('MSG_TXT_CNTR_NO') }}<!-- 계약번호 -->
                                  </p>
                                  <span class="kw-fc--black1 ml8">
                                    {{ orderProduct.mchChCntrNo + '-' + orderProduct.mchChCntrSn }}
                                  </span>
                                </li>
                              </ul>
                            </div>
                            <kw-btn
                              v-permission:delete
                              borderless
                              icon="close_24"
                              style="font-size: 24px;"
                              class="w24"
                              @click="onClickDeleteDeviceChange"
                            />
                          </div>
                        </div>

                        <!-- 1+1 내역 -->
                        <kw-form
                          v-show="false"
                        >
                          <kw-form-row>
                            <kw-input
                              v-model="orderProduct.plusCntrNo"
                            />
                          </kw-form-row>
                        </kw-form>
                        <div
                          v-if="orderProduct.plusCntrNo && orderProduct.plusCntrSn"
                          class="product-right-area"
                        >
                          <kw-separator class="dashed-line my20" />

                          <div class="row items-center justify-between">
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
                                class="product-price-list kw-grow"
                                style="max-width: calc(100% - 45px);"
                              >
                                <li
                                  class="product-price-item kw-grow"
                                  style="max-width: calc(100% - 355px);"
                                >
                                  <span
                                    class="kw-fc--black1 ml8 "
                                    style="overflow: hidden;
                                      text-overflow: ellipsis;
                                      white-space: nowrap;"
                                  >
                                    {{ orderProduct.plusPdNm }}
                                  </span>
                                </li>

                                <li class="product-price-item">
                                  <p class="kw-font-pt14 kw-fc--black3">
                                    {{ $t('MSG_TXT_CNTR_NO') }}<!-- 계약번호 -->
                                  </p>
                                  <span class="kw-fc--black1 ml8">
                                    {{ orderProduct.plusCntrNo + '-' + orderProduct.plusCntrSn }}
                                  </span>
                                </li>
                              </ul>
                            </div>
                            <kw-btn
                              v-permission:delete
                              borderless
                              icon="close_24"
                              style="font-size: 24px;"
                              class="w24"
                              @click="onClickDeleteOneplusone"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="row justify-end mt20">
                      <!-- 초기화 -->
                      <kw-btn
                        padding="12px"
                        :label="$t('MSG_BTN_INTL')"
                        @click="onClickInit"
                      />
                    <!-- <kw-btn
                      padding="12px"
                      class="ml8"
                      label="확정"
                    /> -->
                    </div>
                  </div>
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
                  <span class="text-bold kw-font-pt18">{{ $t('MSG_TXT_PMOT') }}</span><!-- 프로모션 -->
                </kw-item-label>
              </kw-item-section>
            </template>

            <kw-form
              class="pb20"
              dense
            >
              <kw-form-row>
                <!-- 유형 -->
                <kw-form-item :label="$t('MSG_TXT_TYPE')">
                  <p>{{ $t('MSG_TXT_FGPT') }}</p><!-- 사은품 -->
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
                  <!-- 사은품 선택 -->
                  <span class="text-bold kw-font-pt18">{{ $t('MSG_TXT_FGPT')+' '+$t('MSG_TXT_SELT') }}</span>
                </kw-item-label>
              </kw-item-section>
            </template>
            <kw-form
              class="pb20"
              :cols="1"
            >
              <kw-form-row>
                <!-- 사은품 -->
                <kw-form-item :label="$t('MSG_TXT_FGPT')">
                  <kw-option-group
                    :model-value="'사은품 선택안함'"
                    type="radio"
                    :options="['(6422)라이브팩(1)', '(6422)라이브팩(2)','사은품 선택안함']"
                    @change="alert('준비중입니다.')"
                  />
                </kw-form-item>
              </kw-form-row>
            <!-- <kw-form-row>
              <kw-form-item
                label="사은품검색"
              >
                <div class="column col">
                  <kw-input
                    icon="search"
                    clearable
                    style="max-width: 40%;"
                  />
                  <div class="border-box mt12 col">
                    <kw-form
                      :cols="1"
                      dense
                    >
                      <kw-form-row>
                        <kw-form-item
                          label="선택사은품"
                        >
                          <p class="kw-grow mr8">
                            (4064) 웰스팜/그린/슬림/공유S
                          </p>
                          <zwcm-counter />
                        </kw-form-item>
                      </kw-form-row>
                    </kw-form>
                    <kw-separator spaced="20px" />
                    <kw-btn
                      padding="12px"
                      label="삭제"
                    />
                  </div>
                  <div class="border-box mt12">
                    <kw-form
                      :cols="1"
                      dense
                    >
                      <kw-form-row>
                        <kw-form-item
                          label="선택사은품"
                        >
                          <p class="kw-grow mr8">
                            (4064) 웰스팜/그린/슬림/공유S
                          </p>
                          <zwcm-counter />
                        </kw-form-item>
                      </kw-form-row>
                    </kw-form>
                    <kw-separator spaced="20px" />
                    <kw-btn
                      padding="12px"
                      label="삭제"
                    />
                  </div>
                </div>
              </kw-form-item>
            </kw-form-row> -->
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
                  <span class="text-bold kw-font-pt18">
                    {{ $t('MSG_TXT_IST_ENVR') + ' ' + $t('MSG_BTN_ALC') + ' ' + $t('MSG_TXT_RQMT') }}
                  </span><!-- 설치환경 및 요청사항 -->
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
                  <span class="text-bold kw-font-pt18">
                    {{ $t('MSG_TXT_PLAR')+' '+$t('MSG_TXT_INF') }}
                  </span><!-- 플래너 정보 -->
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
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

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
const obsRef = ref(getComponentType('KwPage'));

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

// 주문상품 정보
const orderProduct = ref({
  pdMclsfNm: '', // 상품중분류명
  pdCd: '', // 상품코드
  pdNm: '', // 상품명
  cntrAmt: '0', // 등록비(계약금액)
  cntramDscAmt: '0', /* 계약금할인금액 */
  pdBaseAmt: '0', /* 상품기준금액 */
  sellAmt: '0', /* 판매금액 */
  dscAmt: '0', /* 할인금액 */
  fnlAmt: '0', // 월렌탈료(최종금액)
  sellInflwChnlDtlCd: '', // 판매유입채널상세코드
  stplPtrm: '', // 약정기간
  cntrPtrm: '', // 계약기간
  sellDscDvCd: '', // [주문상품선택-렌탈할인구분코드] 법인(1),중고보상(2),법인단체(3),...
  sellDscTpCd: '', // [주문상품선택-렌탈할인유형코드] 전체(a),재렌탈(02),1+1(03),...
  svPdCd: '', // [주문상품선택-서비스] 대상상품코드
  evtCd: '', // 행사코드
  copnDvCd: '', // 개인법인구분
  sellDscrCd: '', // 판매할인율코드 (법인일때 사용)
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
  mchChTpCd: '', // 기기변경 유형코드
  mchChPasgMcn: '', // 기기변경 경과개월수
  mchChCpsApyr: '', // 기기변경 보상적용율
  mchChClnOjYn: '', // 기기변경 회수대상여부
  mchChOjCntrMmBaseDvCd: '', // 기기변경 대상계약월기준구분코드
  exMchChCntrNo: '', // 기존의 기기변경 계약번호
  exMchChCntrSn: '', // 기존의 기기변경 계약이련번호
  exPlusCntrNo: '', // 기존의 1+1 계약번호
  exPlusCntrSn: '', // 기존의 1+1 계약일련번호
});

// 설치환경 및 요청사항
const istEnvRequest = ref({
  useElectTpCd: '', // [설치환경및요청사항-전압] 사용전력유형코드. 110v(1),220v(2)
  wprsItstTpCd: '', // [설치환경및요청사항-수압] 수압강도유형코드. 강(1),약(2)
  srcwtTpCd: '', // [설치환경및요청사항-수질] 상수원유형코드. 상수도(1),지하수(2),간이상수원(3)
  istPlcTpCd: '', // [설치환경및요청사항-장소] 설치장소유형코드. 자택(1),사무실(2),업소(3),학교(4),기타(5)
  istAkArtcMoCn: '', // [설치환경및요청사항-요청사항] 설치요청사항메모내용
  sconCn: '', // [설치환경및요청사항-참고사항] 특약내용
});

const productInfo = ref({}); // 상품정보
const stplPtrms = ref([]); // 약정기간목록
const cntrPtrms = ref([]); // 계약기간목록
const rgstFees = ref([]); // 등록비목록
const rentalDscDvCds = ref([]); // 렌탈할인구분목록
const rentalDscTpCds = ref([]); // 렌탈할인유형목록
const svPdCds = ref([]); // 서비스상품목록
const evtCds = ref([]); // 행사코드목록

const isLinked = ref(false);

// 주문상품 정보 초기화
async function initProduct(gubun) {
  orderProduct.value.copnDvCd = fieldData.value.copnDvCd; // 개인/법인구분
  orderProduct.value.pdMclsfNm = (gubun === 'init') ? fieldData.value.pdMclsfNm : productInfo.value.pdMclsfNm;
  orderProduct.value.pdCd = (gubun === 'init') ? fieldData.value.basePdCd : productInfo.value.pdCd;
  orderProduct.value.pdNm = (gubun === 'init') ? fieldData.value.pdNm : productInfo.value.pdNm;
  orderProduct.value.sellEvCd = (gubun === 'init') ? fieldData.value.sellEvCd : '';
  orderProduct.value.frisuAsPtrmN = (gubun === 'init') ? fieldData.value.frisuAsPtrmN : '';
  orderProduct.value.alncmpCd = (gubun === 'init') ? fieldData.value.alncmpCd : '';
  orderProduct.value.sellInflwChnlDtlCd = (gubun === 'init') ? fieldData.value.sellInflwChnlDtlCd : productInfo.value.sellInflwChnlDtlCd;
  orderProduct.value.cntrAmt = (gubun === 'init') ? fieldData.value.cntrAmt || '0' : '0';
  orderProduct.value.cntramDscAmt = (gubun === 'init') ? fieldData.value.cntramDscAmt || '0' : '0';
  orderProduct.value.pdBaseAmt = (gubun === 'init') ? fieldData.value.pdBaseAmt || '0' : '0';
  orderProduct.value.sellAmt = (gubun === 'init') ? fieldData.value.sellAmt || '0' : '0';
  orderProduct.value.dscAmt = (gubun === 'init') ? fieldData.value.dscAmt || '0' : '0';
  orderProduct.value.fnlAmt = (gubun === 'init') ? fieldData.value.fnlAmt || '0' : '0';
  orderProduct.value.sellDscCtrAmt = (gubun === 'init') ? fieldData.value.sellDscCtrAmt : '0';
  orderProduct.value.stplPtrm = (gubun === 'init') ? fieldData.value.stplPtrm : '';
  orderProduct.value.cntrPtrm = (gubun === 'init') ? fieldData.value.cntrPtrm : '';
  orderProduct.value.sellDscDvCd = (gubun === 'init') ? fieldData.value.sellDscDvCd : '';
  orderProduct.value.sellDscTpCd = (gubun === 'init') ? fieldData.value.sellDscTpCd : '';
  orderProduct.value.svPdCd = (gubun === 'init') ? fieldData.value.svPdCd : '';
  orderProduct.value.svVstPrdCd = '';
  orderProduct.value.evtCd = (gubun === 'init') ? fieldData.value.evtCd : '';
  orderProduct.value.sellDscrCd = (gubun === 'init') ? fieldData.value.sellDscrCd : '';
  orderProduct.value.plusCntrNo = (gubun === 'init') ? fieldData.value.plusCntrNo : ''; // [주문상품선택-1+1계약번호] 대상상세계약번호
  orderProduct.value.plusCntrSn = (gubun === 'init') ? fieldData.value.plusCntrSn : ''; // [주문상품선택-1+1계약일련번호] 대상상세계약일련번호
  orderProduct.value.plusPdCd = (gubun === 'init') ? fieldData.value.plusPdCd : ''; // 1+1 상품코드
  orderProduct.value.plusSellTpCd = (gubun === 'init') ? fieldData.value.plusSellTpCd : ''; // 1+1 판매유형코드
  orderProduct.value.plusPdNm = (gubun === 'init') ? fieldData.value.plusPdNm : ''; // [주문상품선택-1+1상품명]
  orderProduct.value.mchChCntrNo = (gubun === 'init') ? fieldData.value.mchChCntrNo : ''; // [주문상품선택-기기변경 계약번호] 대상계약번호
  orderProduct.value.mchChCntrSn = (gubun === 'init') ? fieldData.value.mchChCntrSn : ''; // [주문상품선택-기기변경 계약일련번호] 대상계약일련번호
  orderProduct.value.mchChPdCd = (gubun === 'init') ? fieldData.value.mchChPdCd : ''; // 기기변경 기준상품코드
  orderProduct.value.mchChPdNm = (gubun === 'init') ? fieldData.value.mchChPdNm : ''; // [주문상품선택-기기변경 상품명]
  orderProduct.value.mchChSellTpCd = (gubun === 'init') ? fieldData.value.mchChSellTpCd : ''; // 기기변경 판매유형코드
}

// 설치환경 및 요청사항 초기화
async function initIstEnvRequest() {
  istEnvRequest.value.useElectTpCd = fieldData.value.useElectTpCd;
  istEnvRequest.value.wprsItstTpCd = fieldData.value.wprsItstTpCd;
  istEnvRequest.value.srcwtTpCd = fieldData.value.srcwtTpCd;
  istEnvRequest.value.istPlcTpCd = fieldData.value.istPlcTpCd;
  istEnvRequest.value.istAkArtcMoCn = fieldData.value.istAkArtcMoCn;
  istEnvRequest.value.sconCn = fieldData.value.sconCn;
}

// 선택가능한 약정기간, 계약기간, 등록비, 렌탈할인구분, 렌탈할인유형, 서비스상품, 행사코드 조회
async function fetchProductAdditionalInfoData() {
  stplPtrms.value = [];
  cntrPtrms.value = [];
  rgstFees.value = [];
  rentalDscDvCds.value = [];
  rentalDscTpCds.value = [];
  svPdCds.value = [];
  evtCds.value = [];

  const res = await dataService.get('/sms/wells/contract/changeorder/rental-change-extras', { params: searchParams.value });
  Object.assign(productInfo.value, res.data.productInfo);
  Object.assign(stplPtrms.value, res.data.stplPtrms);
  Object.assign(cntrPtrms.value, res.data.cntrPtrms);
  Object.assign(rgstFees.value, res.data.rgstFees);
  Object.assign(rentalDscDvCds.value, res.data.rentalDscDvCds);
  Object.assign(rentalDscTpCds.value, res.data.rentalDscTpCds);
  Object.assign(svPdCds.value, res.data.svPdCds);

  // 주문상품을 바꾼 경우, 선택 옵션 초기화
  await initProduct();
}

const isFetched = ref(false);
// 기본정보 조회
async function fetchData() {
  isFetched.value = false;

  const res = await dataService.get(
    '/sms/wells/contract/changeorder/rental-change-infos',
    { params:
    { cntrNo: searchParams.value.cntrNo,
      cntrSn: searchParams.value.cntrSn,
      isAdmin: false,
    } },
  );
  Object.assign(fieldData.value, res.data);

  isFetched.value = true;

  // 주문상품선택 추가정보를 가져오기 위한 파라미터 세팅
  searchParams.value.pdCd = fieldData.value.basePdCd;
  searchParams.value.pdNm = fieldData.value.pdNm;
  searchParams.value.sellInflwChnlDtlCd = fieldData.value.sellInflwChnlDtlCd;
  searchParams.value.copnDvCd = fieldData.value.copnDvCd;

  // 선택가능한 약정기간, 계약기간, 등록비, 렌탈할인구분, 렌탈할인유형, 서비스상품, 행사코드 조회
  await fetchProductAdditionalInfoData();

  // 주문상품 정보 초기화
  await initProduct('init');

  // 설치환경 및 요청사항 초기화
  await initIstEnvRequest();

  if (!isLinked.value) {
    searchParams.value = {};
  }

  obsRef.value.init();
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
    component: 'ZwpdcStandardPriceListP',
    componentProps: {
      searchValue: searchParams.value.pdNm,
    },
  });

  if (result) {
    if (payload[0].sellTpCd !== '2' || payload[0].sellYn !== 'Y') {
      await alert('렌탈 판매 상품이 아닙니다.');
      return;
    }

    if (payload[0].sellChnlCd !== fieldData.value.sellInflwChnlDtlCd) {
      await alert('선택 가능한 상품이 아닙니다. 판매채널을 확인해주세요.');
      return;
    }

    searchParams.value.pdCd = payload[0].pdCd;
    searchParams.value.pdNm = payload[0].pdNm;
    searchParams.value.sellInflwChnlDtlCd = payload[0].sellChnlCd;

    await fetchProductAdditionalInfoData();
  }
}

// 약정기간, 계약기간, 등록비, 렌탈할인구분, 렌탈할인유형, 서비스상품 변경 시, 변경되는 가격 조회
const rentalPrice = ref({});
async function selectRentalPriceChanges() {
  rentalPrice.value = {};
  orderProduct.value.fnlAmt = '0';

  const res = await dataService.get('/sms/wells/contract/changeorder/rental-price-changes', { params: orderProduct.value });
  Object.assign(rentalPrice.value, res.data[0]);
  orderProduct.value.pdBaseAmt = rentalPrice.value.basVal; // 기본값
  // 할인금액 = 기본값(상품기준금액) - 최종값(판매금액)
  orderProduct.value.dscAmt = rentalPrice.value.basVal - rentalPrice.value.fnlVal;
  orderProduct.value.sellAmt = rentalPrice.value.fnlVal; // 판매금액(=렌탈가)
  // 최종금액(=할인렌탈가) = 판매금액 - 판매할인조정금액
  orderProduct.value.fnlAmt = rentalPrice.value.fnlVal - orderProduct.value.sellDscCtrAmt;
  orderProduct.value.ackmtPerfAmt = rentalPrice.value.ackmtPerfAmt; // 인정실적금액
  orderProduct.value.ackmtPerfRt = rentalPrice.value.ackmtPerfRt; // 인정실적율
  orderProduct.value.feeAckmtBaseAmt = rentalPrice.value.feeAckmtBaseAmt; // 수수료인정기준금액
}

// 기기변경 버튼 클릭
async function onClickDeviceChange() {
  const res = await modal({
    component: 'WwctaMachineChangeCustomerDtlP',
    componentProps: {
      baseCntrNo: fieldData.value.cntrNo,
      baseCntrSn: fieldData.value.cntrSn,
      cstNo: fieldData.value.cntrCstNo,
      indvCrpDv: fieldData.value.copnDvCd,
      pdCd: orderProduct.value.pdCd,
      dscDv: orderProduct.value.sellDscDvCd,
      dscTp: orderProduct.value.sellDscTpCd,
      sellTpCd: '2',
      alncmpCd: fieldData.value.alncmpCntrDrmVal,
      rgstMdfcDv: '1', // FIXME: 등록, 수정 구분 필요
    },
  });
  if (res.result && res.payload) {
    // console.log(res.payload);
    orderProduct.value.mchChCntrNo = res.payload.cntrNo;
    orderProduct.value.mchChCntrSn = res.payload.cntrSn;
    // orderProduct.value.mchChPdCd = '';
    orderProduct.value.mchChPdNm = res.payload.pdNm;
    // orderProduct.value.mchChSellTpCd = '';
    orderProduct.value.mchChTpCd = res.payload.workFlag; // 기기변경 유형코드
    orderProduct.value.mchChPasgMcn = res.payload.rentalNmnN; // 기기변경 경과개월수
    orderProduct.value.mchChCpsApyr = res.payload.finalPerfRt; // 기기변경 보상적용율
    orderProduct.value.mchChClnOjYn = res.payload.clnYn; // 기기변경 회수대상여부
    orderProduct.value.mchChOjCntrMmBaseDvCd = res.payload.resultDvCheck; // 기기변경 대상계약월기준구분코드
  }
}

// 기기변경 삭제버튼 클릭
function onClickDeleteDeviceChange() {
  orderProduct.value.mchChCntrNo = '';
  orderProduct.value.mchChCntrSn = '';
  orderProduct.value.mchChPdCd = '';
  orderProduct.value.mchChPdNm = '';
  orderProduct.value.mchChSellTpCd = '';
  orderProduct.value.mchChTpCd = '';
  orderProduct.value.mchChPasgMcn = '';
  orderProduct.value.mchChCpsApyr = '';
  orderProduct.value.mchChClnOjYn = '';
  orderProduct.value.mchChOjCntrMmBaseDvCd = '';
}

// 1+1 버튼 클릭
async function onClickOnePlusOne() {
  const res = await modal({
    component: 'WwctaOnePlusOneContractListP',
    componentProps: { baseDtlCntrNo: fieldData.value.cntrNo },
  });
  if (res.result && res.payload) {
    orderProduct.value.plusCntrNo = res.payload.cntrNo;
    orderProduct.value.plusCntrSn = res.payload.cntrSn;
    orderProduct.value.plusPdCd = res.payload.basePdCd;
    orderProduct.value.plusPdNm = res.payload.pdNm;
    orderProduct.value.sellDscTpCd = '03'; // 렌탈할인유형을 1+1으로 고정
  }
}

// 1+1 삭제버튼 클릭
function onClickDeleteOneplusone() {
  orderProduct.value.plusCntrNo = '';
  orderProduct.value.plusCntrSn = '';
  orderProduct.value.plusPdCd = '';
  orderProduct.value.plusPdNm = '';
  orderProduct.value.sellDscTpCd = '';
}

// 초기화 버튼 클릭
async function onClickInit() {
  if (props.cntrNo && props.cntrSn) {
    searchParams.value.cntrNo = props.cntrNo;
    searchParams.value.cntrSn = props.cntrSn;
    searchParams.value.cntrNoSn = `${props.cntrNo}-${props.cntrSn}`;
    isLinked.value = true;
    await fetchData();
  }
}

// 저장 버튼 클릭
async function onClickSave() {
  // console.log(orderProduct.value);
  // console.log(istEnvRequest.value);

  if (!obsRef.value.isModified()) {
    await alert(t('MSG_ALT_NO_CHG_CNTN')); // 변경된 내용이 없습니다.
    return;
  }

  if (!await confirm('계약의 정보를 변경하시겠습니까?')) return;

  orderProduct.value.cntrNo = fieldData.value.cntrNo;
  orderProduct.value.cntrSn = fieldData.value.cntrSn;
  orderProduct.value.exMchChYn = isEmpty(fieldData.value.mchChCntrNo) ? 'N' : 'Y'; // 1+1 계약 여부
  orderProduct.value.exOpoYn = isEmpty(fieldData.value.plusCntrNo) ? 'N' : 'Y'; // 기기변경 계약 여부
  orderProduct.value.exMchChCntrNo = fieldData.value.mchChCntrNo;
  orderProduct.value.exMchChCntrSn = fieldData.value.mchChCntrSn;
  orderProduct.value.exPlusCntrNo = fieldData.value.plusCntrNo;
  orderProduct.value.exPlusCntrSn = fieldData.value.plusCntrSn;

  // 현재 선택된 서비스 방문주기 세팅
  const selectedSv = svPdCds.value.filter((item) => item.codeId === orderProduct.value.svPdCd);
  orderProduct.value.svVstPrdCd = isEmpty(selectedSv[0]) ? '' : selectedSv[0].svVstPrdCd;

  await dataService.post('/sms/wells/contract/changeorder/rental-change-infos', {
    baseInfo: fieldData.value,
    product: orderProduct.value,
    istEnv: istEnvRequest.value,
    rentalPrice: rentalPrice.value,
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
