<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbWellsRentalOrderMdfcProcsM - wells 렌탈 주문 수정 처리(어드민)
3. 작성자 : hyeonjong.ra
4. 작성일 : 2023.08.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U-0114M01] wells 렌탈 주문 수정 처리(어드민)
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
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            :name="$t('MSG_TXT_CNTR_DTL_NO')"
            rules="required"
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
              <p>{{ fieldData.cntrNo }}{{ isEmpty(fieldData.cntrNo)?'':'-' }}{{ fieldData.cntrSn }}</p>
              <!-- 삭제 -->
              <kw-btn
                v-if="isFetched"
                v-permission:delete
                label="삭제"
                padding="12px"
                class="ml8"
                dense
                @click="onClickCntrDelete"
              />
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
                        :disable="!isFetched || fieldData.slClYn==='Y'"
                        @click-icon="onClickSelectProduct"
                      />
                      <kw-select
                        v-model="orderProduct.sellEvCd"
                        class="w220 ml8"
                        :options="codes.SELL_EV_CD.filter((v) =>
                          ['2','4','5','8','9','C','F','H','7','D','E','I'].includes(v.codeId))"
                        first-option="select"
                        first-option-label="선택없음"
                        :disable="fieldData.slClYn==='Y'"
                      />
                    </div>
                    <div class="border-box mt12">
                      <kw-form
                        cols="2"
                      >
                        <kw-form-row>
                          <!-- 주문상품 -->
                          <kw-form-item label="주문상품">
                            <p>{{ orderProduct.pdNm }}</p>
                          </kw-form-item>
                          <div class="row justify-end grow">
                            <!-- 기기변경 -->
                            <kw-btn
                              v-permission:update
                              :label="$t('MSG_TXT_MCHN_CH')"
                              :disable="!isEmpty(orderProduct.plusCntrNo) || !isFetched || fieldData.slClYn==='Y'"
                              padding="12px"
                              @click="onClickDeviceChange"
                            />
                          </div>
                        </kw-form-row>
                        <kw-form-row>
                          <kw-form-item label="유형선택">
                            <kw-select
                              v-model="orderProduct.sellDscDvCd"
                              :options="rentalDscDvCds"
                              first-option="select"
                              first-option-value=""
                              :first-option-label="$t('TXT_MSG_RENTAL_DSC_DV_CD') + ' ' + $t('MSG_TXT_SELT')"
                              :disable="fieldData.slClYn==='Y'"
                              @change="selectRentalPriceChanges"
                            />
                            <kw-select
                              v-if="rentalDscrCds && orderProduct.sellDscDvCd === '5'"
                              v-model="orderProduct.sellDscrCd"
                              :options="rentalDscrCds"
                              placeholder="렌탈법인할인율"
                              :disable="fieldData.slClYn==='Y'"
                            />
                          </kw-form-item>
                          <kw-form-item label="주기/용도 선택">
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
                              :disable="fieldData.slClYn==='Y'"
                              @change="selectRentalPriceChanges"
                            />
                          </kw-form-item>
                        </kw-form-row>
                        <kw-form-row>
                          <kw-form-item label="약정개월/소유권이전">
                            <kw-input
                              v-model="orderProduct.stplPtrm"
                              readonly
                              :disable="fieldData.slClYn==='Y'"
                              @change="selectRentalPriceChanges"
                            />
                            <!-- 계약기간 선택 -->
                            <kw-select
                              v-model="orderProduct.cntrPtrm"
                              :options="cntrPtrms"
                              first-option="select"
                              first-option-value=""
                              :first-option-label="$t('MSG_TXT_CNTR_PTRM') + ' ' + $t('MSG_TXT_SELT')"
                              :disable="fieldData.slClYn==='Y'"
                              @change="selectRentalPriceChanges"
                            />
                          </kw-form-item>
                          <kw-form-item label="무상AS/등록비(원)">
                            <kw-select
                              v-model="orderProduct.frisuAsPtrmN"
                              first-option="select"
                              :disable="fieldData.slClYn==='Y'"
                            />
                            <kw-select
                              v-model="orderProduct.cntrAmt"
                              :options="rgstFees"
                              first-option="select"
                              first-option-value="0"
                              :first-option-label="$t('MSG_TXT_RGST_FEE') + ' ' + $t('MSG_TXT_SELT')"
                              :disable="fieldData.slClYn==='Y'"
                              @change="selectRentalPriceChanges"
                            />
                          </kw-form-item>
                        </kw-form-row>
                        <kw-form-row>
                          <kw-form-item label="제휴상품">
                            <kw-select
                              v-model="orderProduct.alncmpCd"
                              :options="codes.ALNC_CO_ACD"
                              first-option="select"
                              :disable="fieldData.slClYn==='Y'"
                            />
                          </kw-form-item>
                          <kw-form-item label="프로모션 코드">
                            <kw-select
                              v-model="orderProduct.sellDscTpCd"
                              :options="rentalDscTpCds"
                              first-option="select"
                              :disable="fieldData.slClYn==='Y'"
                              @change="selectRentalPriceChanges"
                            />
                          </kw-form-item>
                        </kw-form-row>
                        <kw-form-row>
                          <!-- <kw-form-item label="문의고객코드">
                            <kw-input />
                          </kw-form-item> -->
                          <kw-form-item label="등록비(원)">
                            <p>
                              {{ stringUtil.getNumberWithComma(orderProduct.cntrAmt || 0) }}
                            </p>
                          </kw-form-item>
                          <kw-form-item label="렌탈가(원)">
                            <p>
                              {{ stringUtil.getNumberWithComma(orderProduct.sellAmt || 0) }}
                            </p>
                          </kw-form-item>
                        </kw-form-row>
                        <kw-form-row>
                          <kw-form-item label="(법인)추가할인">
                            <kw-input
                              v-model="orderProduct.sellDscCtrAmt"
                              maxlength="10"
                              type="number"
                              :readonly="fieldData.copnDvCd !== '2'"
                              :disable="fieldData.slClYn==='Y'"
                            />
                          </kw-form-item>
                          <kw-form-item label="할인렌탈가(원)">
                            <span style="color: red;">
                              {{ orderProduct.sellDscCtrAmt > 0 ? '(' : '' }}
                              <span style="text-decoration: line-through;">
                                {{
                                  orderProduct.sellDscCtrAmt > 0 ?
                                    stringUtil.getNumberWithComma(orderProduct.sellAmt||0) : ''
                                }}
                              </span>
                              {{ orderProduct.sellDscCtrAmt > 0 ? ')' : '' }}
                              {{ stringUtil.getNumberWithComma(orderProduct.fnlAmt||0) }}
                            </span>
                          </kw-form-item>
                        </kw-form-row>
                        <!-- <kw-form-row>
                          <kw-form-item
                            label="무료개월"
                          >
                            <kw-input style="max-width: calc(50% - 110px);" />
                            <kw-option-group
                              :model-value="[]"
                              type="checkbox"
                              :options="['설치월면제', '매년1차월무료(5년간)']"
                              class="ml20"
                            />
                          </kw-form-item>
                          <kw-form-item
                            label="할인개월/할인금액(원)"
                          >
                            <kw-input
                              placeholder="할인 개월 입력"
                              readonly
                            />
                            <kw-input
                              placeholder="할인 금액 입력"
                              readonly
                            />
                          </kw-form-item>
                        </kw-form-row> -->
                        <kw-form-row>
                          <kw-form-item
                            label="변경사유"
                            :colspan="2"
                          >
                            <kw-input
                              v-model="orderProduct.cntrChAkCn"
                              type="textarea"
                              maxlength="1000"
                              :rows="3"
                              :disable="fieldData.slClYn==='Y'"
                            />
                          </kw-form-item>
                        </kw-form-row>
                        <kw-form-row>
                          <kw-form-item
                            label="인정실적"
                          >
                            <!-- 인정실적금액 -->
                            <kw-input
                              v-model="orderProduct.ackmtPerfAmt"
                              mask="number"
                              readonly
                              align="right"
                            /><p>&nbsp;원</p>
                            <!-- 인정실적율 -->
                            <kw-input
                              v-model="orderProduct.ackmtPerfRt"
                              mask="number"
                              class="ml10"
                              readonly
                              align="right"
                            /><p>&nbsp;%</p>
                          </kw-form-item>
                          <kw-form-item
                            label="수수료 기준금액"
                          >
                            <kw-input
                              v-model="orderProduct.feeAckmtBaseAmt"
                              mask="number"
                              readonly
                              align="right"
                            />
                          </kw-form-item>
                        </kw-form-row>
                      </kw-form>
                      <kw-separator spaced="20px" />

                      <!-- 기기변경 내역 -->
                      <div class="product">
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
                              :disable="fieldData.slClYn==='Y'"
                              @click="onClickDeleteDeviceChange"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="row justify-end mt20">
                      <!-- <kw-btn
                        padding="12px"
                        label="확정"
                      /> -->
                      <kw-btn
                        v-permission:update
                        class="ml10"
                        padding="12px"
                        label="저장"
                        :disable="!isFetched || fieldData.slClYn==='Y'"
                        @click="onClickProductChangeSave"
                      />
                    </div>
                  </div>
                </kw-form-item>
                <kw-form-item />
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
                  <span class="text-bold kw-font-pt18">선납상세</span>
                </kw-item-label>
              </kw-item-section>
            </template>
            <h3 class="mt0">
              판매자 정보
            </h3>
            <kw-form dense>
              <kw-form-row>
                <kw-form-item label="회사구분">
                  <p>{{ (prepayBas.coNm||'') }}</p>
                </kw-form-item>
                <kw-form-item label="본부장">
                  <p>
                    {{ (prepayBas.hooPrtnrNo||'') + ' / ' + (prepayBas.hooPrtnrNm||'')
                      + ' / ' + (prepayBas.hooOgCd||'') }}
                  </p>
                </kw-form-item>
                <kw-form-item label="판매구분">
                  <p>{{ (prepayBas.sellDv||'') }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item label="판매자">
                  <p>
                    {{ (prepayBas.sellPrtnrNo||'') + ' / ' + (prepayBas.prtnrKnm||'')
                      + ' / ' + (prepayBas.prtnrOgCd||'') }}
                  </p>
                </kw-form-item>
              </kw-form-row>
            </kw-form>
            <kw-action-top class="my20">
              <template #left>
                <h3>계약상품</h3>
              </template>
              <span class="kw-fc--black3 text-weight-regular">(단위:원)</span>
            </kw-action-top>
            <kw-form dense>
              <!-- rev:230724 dense 추가 -->
              <kw-form-row>
                <kw-form-item label="계약상품명">
                  <p>
                    {{ (prepayBas.basePdCd||'') + ' ' + (prepayBas.svPrd||'') + (prepayBas.svPtrmUnitNm||'')
                      + ' ' + (prepayBas.svPdTpCd||'') + ' ' + (prepayBas.pdNm||'') }}
                  </p>
                </kw-form-item>
                <kw-form-item label="계약일자">
                  <p>{{ stringUtil.getDateFormat(prepayBas.cntrCnfmDt||'') }}</p>
                </kw-form-item>
                <kw-form-item label="매출일자">
                  <p>{{ stringUtil.getDateFormat(prepayBas.istDt||'') }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item label="등록비용">
                  <p>{{ stringUtil.getNumberWithComma(prepayBas.cntrAmt||0) }}</p>
                </kw-form-item>
                <kw-form-item label="할인금액">
                  <p>{{ stringUtil.getNumberWithComma(prepayBas.cntramDscAmt||0) }}</p>
                </kw-form-item>
                <kw-form-item label="렌탈총액">
                  <p>{{ stringUtil.getNumberWithComma(prepayBas.rentalTam||0) }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item label="(1)렌탈료">
                  <p>
                    {{ (prepayBas.cntrPtrm||0) + ' / ' + stringUtil.getNumberWithComma(prepayBas.rentalAmt||0) }}
                  </p>
                </kw-form-item>
                <kw-form-item label="(2)렌탈료">
                  <p>
                    {{ (prepayBas.rentalPtrm2||0) + ' / ' + stringUtil.getNumberWithComma(prepayBas.rentalAmt2||0) }}
                  </p>
                </kw-form-item>
                <kw-form-item label="계약총액">
                  <p>{{ stringUtil.getNumberWithComma(prepayBas.cntrTam||0) }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item label="(1)렌탈료DC">
                  <p>{{ stringUtil.getNumberWithComma(prepayBas.rentalDscAmt||0) }}</p>
                </kw-form-item>
                <kw-form-item label="(2)렌탈료DC">
                  <p>{{ stringUtil.getNumberWithComma(prepayBas.rentalDscAmt2||0) }}</p>
                </kw-form-item>
                <kw-form-item label="가격차수">
                  <p>{{ (prepayBas.prcTcnt||'') }}</p>
                </kw-form-item>
              </kw-form-row>
            </kw-form>
            <kw-action-top class="my20">
              <template #left>
                <h3>매출사항</h3>
              </template>
              <span class="kw-fc--black3 text-weight-regular">(단위:원)</span>
            </kw-action-top>
            <kw-form dense>
              <!-- rev:230724 dense 추가 -->
              <kw-form-row>
                <kw-form-item label="렌탈차월">
                  <p>{{ (prepayBas.prmRentalTn||'') + ' / ' + (prepayBas.rentalTn||'') }}</p>
                </kw-form-item>
                <kw-form-item label="교체일자">
                  <p>{{ stringUtil.getDateFormat(prepayBas.chngDt||'') }}</p>
                </kw-form-item>
                <kw-form-item label="취소일자">
                  <p>{{ stringUtil.getDateFormat(prepayBas.canDt||'') }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item label="선납잔액">
                  <p>{{ stringUtil.getNumberWithComma(prepayBas.prmBlam||0) }}</p>
                </kw-form-item>
                <kw-form-item label="선수잔액">
                  <p>{{ stringUtil.getNumberWithComma(prepayBas.atamBlam||0) }}</p>
                </kw-form-item>
                <kw-form-item label="선수총액">
                  <p>{{ stringUtil.getNumberWithComma(prepayBas.prpdTam||0) }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item label="미수총액">
                  <p>{{ stringUtil.getNumberWithComma(prepayBas.thmUcBlam||0) }}</p>
                </kw-form-item>
                <kw-form-item label="연체금액">
                  <p>{{ stringUtil.getNumberWithComma(prepayBas.eotDlqAmt||0) }}</p>
                </kw-form-item>
              </kw-form-row>
            </kw-form>
            <kw-action-top class="my20">
              <template #left>
                <h3>선변_前</h3>
              </template>
              <span class="kw-fc--black3 text-weight-regular">(단위:원)</span>
            </kw-action-top>
            <kw-form dense>
              <kw-form-row>
                <kw-form-item label="선납회차">
                  <span style="color: red;">{{ (prepayBf.lstPrmTn||'') }}</span>
                </kw-form-item>
                <kw-form-item label="선납개월/할인율">
                  <p>
                    {{
                      (prepayBf.lstPrmMcn||'') + ' / '
                        + (prepayBf.lstPrmDscr||'') + (isEmpty(prepayBf.lstPrmDscr||'')?'':'%')
                    }}
                  </p>
                </kw-form-item>
                <kw-form-item label="선납유형">
                  <p>{{ (prepayBf.prmTp||'') }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item label="선납시작">
                  <p>{{ (prepayBf.prmStrtYm||'').substr(0,4) + '-' + (prepayBf.prmStrtYm||'').substr(4) }}</p>
                </kw-form-item>
                <kw-form-item label="선납종료">
                  <p>{{ (prepayBf.prmEndYm||'').substr(0,4) + '-' + (prepayBf.prmEndYm||'').substr(4) }}</p>
                </kw-form-item>
                <kw-form-item label="선납일자">
                  <p>{{ stringUtil.getDateFormat(prepayBf.prmDt||'') }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item label="(1)선납액">
                  <p>
                    {{ stringUtil.getNumberWithComma(prepayBf.prmAmt||0)
                      + (isEmpty(prepayBf.lstPrmMcn||'')?'':' / ')
                      + (prepayBf.lstPrmMcn||'') }}
                  </p>
                </kw-form-item>
                <kw-form-item label="(2)선납액">
                  <p>
                    {{ stringUtil.getNumberWithComma(prepayBf.prmAmt2||0)
                      + (isEmpty(prepayBf.prmPtrm2||'')?'':' / ')
                      + (prepayBf.prmPtrm2||'') }}
                  </p>
                </kw-form-item>
                <kw-form-item label="선납총액">
                  <p>{{ stringUtil.getNumberWithComma(prepayBf.prmTam||0) }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item label="(1)할인액">
                  <p>{{ stringUtil.getNumberWithComma(prepayBf.dscPrmAmt||0) }}</p>
                </kw-form-item>
                <kw-form-item label="(2)할인액">
                  <p>{{ stringUtil.getNumberWithComma(prepayBf.dscPrmAmt2||0) }}</p>
                </kw-form-item>
                <kw-form-item label="할인총액">
                  <p>{{ stringUtil.getNumberWithComma(prepayBf.dscTam||0) }}</p>
                </kw-form-item>
              </kw-form-row>
            </kw-form>
            <kw-action-top class="my20">
              <template #left>
                <h3>선변_後</h3>
              </template>
              <span class="kw-fc--black3 text-weight-regular">(단위:원)</span>
            </kw-action-top>
            <kw-form>
              <kw-form-row>
                <kw-form-item label="선납회차">
                  <span style="color: red;">{{ (prepayAf.lstPrmTn||'') }}</span>
                </kw-form-item>
                <kw-form-item label="선납개월/할인율">
                  <kw-input
                    v-model="prepayAf.lstPrmMcn"
                    class="w80 mr8"
                    readonly
                  />
                  <p>{{ ' / ' + (prepayAf.lstPrmDscr||'') + (isEmpty(prepayAf.lstPrmDscr||'')?'':'%') }}</p>
                </kw-form-item>
                <kw-form-item label="선납유형">
                  <p>{{ (prepayAf.prmTp||'') }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item label="선납시작">
                  <p>{{ (prepayAf.prmStrtYm||'').substr(0,4) + '-' + (prepayAf.prmStrtYm||'').substr(4) }}</p>
                </kw-form-item>
                <kw-form-item label="선납종료">
                  <p>{{ (prepayAf.prmEndYm||'').substr(0,4) + '-' + (prepayAf.prmEndYm||'').substr(4) }}</p>
                </kw-form-item>
                <kw-form-item label="선납일자">
                  <kw-date-picker
                    v-model="prepayAf.prmDt"
                    type="date"
                    :readonly="!rgstMode"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item label="(1)선납액">
                  <p>
                    {{ stringUtil.getNumberWithComma(prepayAf.prmAmt||0)
                      + (isEmpty(prepayAf.lstPrmMcn||'')?'':' / ')
                      + (prepayAf.lstPrmMcn||'') }}
                  </p>
                </kw-form-item>
                <kw-form-item label="(2)선납액">
                  <p>
                    {{ stringUtil.getNumberWithComma(prepayAf.prmAmt2||0)
                      + (isEmpty(prepayAf.prmPtrm2||'')?'':' / ')
                      + (prepayAf.prmPtrm2||'') }}
                  </p>
                </kw-form-item>
                <kw-form-item label="선납총액">
                  <p>{{ stringUtil.getNumberWithComma(prepayAf.prmTam||0) }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item label="(1)할인액">
                  <p>{{ stringUtil.getNumberWithComma(prepayAf.dscPrmAmt||0) }}</p>
                </kw-form-item>
                <kw-form-item label="(2)할인액">
                  <p>{{ stringUtil.getNumberWithComma(prepayAf.dscPrmAmt2||0) }}</p>
                </kw-form-item>
                <kw-form-item label="할인총액">
                  <p>{{ stringUtil.getNumberWithComma(prepayAf.dscTam||0) }}</p>
                </kw-form-item>
              </kw-form-row>
            </kw-form>
            <kw-action-top class="my20">
              <template #left>
                <h3>선납사항</h3>
              </template>
              <span class="kw-fc--black3 text-weight-regular">(단위:원)</span>
            </kw-action-top>
            <kw-form dense>
              <kw-form-row>
                <kw-form-item label="선납차액">
                  <p>{{ stringUtil.getNumberWithComma(prepayBas.prmDiff||0) }}</p>
                </kw-form-item>
                <kw-form-item label="할인차액">
                  <p>{{ stringUtil.getNumberWithComma(prepayBas.dscDiff||0) }}</p>
                </kw-form-item>
                <kw-form-item label="추가매출">
                  <p>{{ stringUtil.getNumberWithComma(prepayBas.extraSales||0) }}</p>
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item label="확정일자">
                  <p>{{ stringUtil.getDateFormat(prepayBas.prmDt||'') }}</p>
                </kw-form-item>
              </kw-form-row>
            </kw-form>
            <div class="row justify-end my20">
              <!-- 등록 -->
              <kw-btn
                v-permission:create
                padding="12px"
                :label="$t('MSG_BTN_RGST')"
                class="mr8"
                :disable="!isFetched || rgstMode"
                @click="onClickPrepayRgst"
              />
              <!-- 취소 -->
              <kw-btn
                padding="12px"
                :label="$t('MSG_BTN_CANCEL')"
                class="mr8"
                :disable="!isFetched || !rgstMode"
                @click="onClickPrepayCancel"
              />
              <!-- 저장 -->
              <kw-btn
                v-permission:create
                padding="12px"
                :label="$t('MSG_BTN_SAVE')"
                :disable="!isFetched || !rgstMode"
                @click="onClickPrepaySave"
              />
            </div>
          </kw-expansion-item>
          <kw-expansion-item
            padding-target="header"
            expansion-icon-align="center"
            expand-icon-class="kw-font-pt24"
          >
            <template #header>
              <kw-item-section>
                <kw-item-label>
                  <span class="text-bold kw-font-pt18">선납사항</span>
                </kw-item-label>
              </kw-item-section>
            </template>

            <kw-action-top>
              <template #left>
                <kw-paging-info :total-count="totalCount" />
              </template>
              <span class="kw-fc--black3 text-weight-regular">(단위 : 원/월/%)</span>
            </kw-action-top>
            <kw-grid
              ref="grdPrepayRef"
              :visible-rows="4"
              class="mb20"
              @init="initGrid"
            />
          </kw-expansion-item>
          <kw-expansion-item
            padding-target="header"
            expansion-icon-align="center"
            expand-icon-class="kw-font-pt24"
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
            <div class="row justify-end my20">
              <!-- 저장 -->
              <kw-btn
                v-permission:update
                class="ml10"
                padding="12px"
                :label="$t('MSG_BTN_SAVE')"
                :disable="!isFetched"
                @click="onClickInstallmentEnvironmentSave"
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
          <!-- 계약서 출력 -->
          <kw-btn
            v-permission:print
            primary
            :label="$t('MSG_BTN_CNTRW_PRNT')"
            :disable="!isFetched"
            @click="alert('준비중입니다.')"
          />
          <!-- 청약서 변경 -->
          <kw-btn
            v-permission:update
            primary
            :label="$t('MSG_TXT_APLC_FORM') + ' ' + $t('MSG_TXT_CH')"
            :disable="!isFetched"
            @click="alert('준비중입니다.')"
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
import { isEmpty, toNumber } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import dayjs from 'dayjs';

const now = dayjs();
const dataService = useDataService();
const { modal, alert, confirm, notify } = useGlobal();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const obsRef = ref(getComponentType('KwPage'));
const grdPrepayRef = ref(getComponentType('KwGrid'));
const saveGbn = ref({ prod: 'prod', prePay: 'prePay', pmot: 'pmot', istEnv: 'istEnv' });

const codes = await codeUtil.getMultiCodes(
  'SELL_EV_CD', // 판매행사코드. 팝업스토어관련(2), 무진행사(4),...
  'DSC_TP_ACD', // 할인 유형 앱코드
  'USE_ELECT_TP_CD', // 사용전력유형코드. 110V(1), 220V(2)
  'WPRS_ITST_TP_CD', // 수압강도유형코드. 강(1), 약(2)
  'SRCWT_TP_CD', // 상수원유형코드. 상수도(1), 지하수(2), 간이상수원(3)
  'IST_PLC_TP_CD', // 설치장소유형코드. 자택(1), 사무실(2), 업소(3), 학교(4), 기타(5)
  'ALNC_CO_ACD', // 제휴 회사 앱코드
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
  pdNm: '', // [주문상품선택-상품명]
  sellEvCd: '', /* 판매행사코드 */
  frisuAsPtrmN: '', /* 무상AS기간수 */
  cntrAmt: '', // [주문상품선택-등록비] 계약금액
  cntramDscAmt: '', /* 계약금할인금액 */
  pdBaseAmt: '', /* 상품기준금액 */
  sellAmt: '', /* 판매금액 */
  dscAmt: '', /* 할인금액 */
  fnlAmt: '', // [주문상품선택-월렌탈료] 최종금액
  sellInflwChnlDtlCd: '', // 판매유입채널상세코드
  stplPtrm: '', // [주문상품선택-약정기간]
  cntrPtrm: '', // [주문상품선택-계약기간]
  sellDscDvCd: '', // [주문상품선택-렌탈할인구분코드] 법인(1),중고보상(2),법인단체(3),...
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
  vstSchDt: '', // 설치예정일자
});

// 주문상품 정보
const orderProduct = ref({
  pdMclsfNm: '', // 상품중분류명
  pdCd: '', // 상품코드
  pdNm: '', // 상품명
  sellEvCd: '', /* 판매행사코드 */
  frisuAsPtrmN: '', /* 무상AS기간수 */
  cntrAmt: '0', // 등록비(계약금액)
  cntramDscAmt: '0', /* 계약금할인금액 */
  pdBaseAmt: '0', /* 상품기준금액 */
  sellAmt: '0', /* 판매금액 */
  dscAmt: '0', /* 할인금액 */
  fnlAmt: '0', // 월렌탈료(최종금액)
  sellInflwChnlDtlCd: '', // 판매유입채널상세코드
  stplPtrm: '', // 약정기간
  cntrPtrm: '', // 계약기간
  sellDscDvCd: '1', // [유형코드] 할인유형코드. 법인(1),중고보상(3),법인단체(5),...
  sellDscrCd: '', // 판매할인율코드 (법인일때 사용)
  sellDscTpCd: '', // [주문상품선택-렌탈할인유형코드] 전체(a),재렌탈(02),1+1(03),...
  svPdCd: '', // [주문상품선택-서비스] 대상상품코드
  evtCd: '', // 행사코드
  copnDvCd: '', // 개인법인구분
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
  cntrChAkCn: '', // [주문상품선택-변경사유] 계약변경요청내용
  ackmtPerfAmt: '', /* [인정실적] 인정실적금액 */
  ackmtPerfRt: '', /* [인정실적] 인정실적율 */
  feeAckmtBaseAmt: '', /* [수수료 기준금액] 수수료인정기준금액 */
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
const rentalDscrCds = ref([]); // 렌탈법인할인율목록
const rentalDscTpCds = ref([]); // 렌탈할인유형목록
const svPdCds = ref([]); // 서비스상품목록
const evtCds = ref([]); // 행사코드목록

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
  orderProduct.value.sellDscrCd = (gubun === 'init') ? fieldData.value.sellDscrCd : '';
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
  orderProduct.value.cntrChAkCn = (gubun === 'init') ? fieldData.value.cntrChAkCn : ''; // [변경사유] 계약변경요청내용
  orderProduct.value.ackmtPerfAmt = (gubun === 'init') ? fieldData.value.ackmtPerfAmt : ''; // [인정실적] 인정실적금액
  orderProduct.value.ackmtPerfRt = (gubun === 'init') ? fieldData.value.ackmtPerfRt : ''; // [인정실적] 인정실적율
  orderProduct.value.feeAckmtBaseAmt = (gubun === 'init') ? fieldData.value.feeAckmtBaseAmt : ''; // [수수료 기준금액] 수수료인정기준금액
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
  productInfo.value = {};
  stplPtrms.value = [];
  cntrPtrms.value = [];
  rgstFees.value = [];
  rentalDscDvCds.value = [];
  rentalDscrCds.value = [];
  rentalDscTpCds.value = [];
  svPdCds.value = [];
  evtCds.value = [];

  const res = await dataService.get('/sms/wells/contract/changeorder/rental-change-extras', { params: searchParams.value });
  Object.assign(productInfo.value, res.data.productInfo);
  Object.assign(stplPtrms.value, res.data.stplPtrms);
  Object.assign(cntrPtrms.value, res.data.cntrPtrms);
  Object.assign(rgstFees.value, res.data.rgstFees);
  Object.assign(rentalDscDvCds.value, res.data.rentalDscDvCds);
  Object.assign(rentalDscrCds.value, res.data.rentalDscrCds);
  Object.assign(rentalDscTpCds.value, res.data.rentalDscTpCds);
  Object.assign(svPdCds.value, res.data.svPdCds);

  // 주문상품을 바꾼 경우, 선택 옵션 초기화
  await initProduct();
}

const totalCount = ref(0);
const prepayBas = ref({}); // 선변 기본정보
const prepayBf = ref({}); // 선변(전)
const prepayAf = ref({}); // 선변(후)

// 선납 정보 조회
async function fetchPrepayments() {
  // 조회 전 초기화
  const view = grdPrepayRef.value.getView();
  view.getDataSource().clearRows();
  prepayBas.value = {};
  prepayBf.value = {};
  prepayAf.value = {};

  const res = await dataService.get(
    '/sms/wells/contract/changeorder/rental-change-infos/prepayment',
    { params:
      { cntrNo: searchParams.value.cntrNo,
        cntrSn: searchParams.value.cntrSn,
      },
    },
  );

  Object.assign(prepayBas.value, res.data[0]);
  totalCount.value = res.data.length;

  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

const isFetched = ref(false);
const rgstMode = ref(false); // 등록 모드 플래그

// 기본정보 조회
async function fetchData() {
  isFetched.value = false;
  rgstMode.value = false;

  // 조회 전 기존 데이터 초기화
  fieldData.value = {};
  orderProduct.value = {};

  const res = await dataService.get(
    '/sms/wells/contract/changeorder/rental-change-infos',
    { params:
      { cntrNo: searchParams.value.cntrNo,
        cntrSn: searchParams.value.cntrSn,
        isAdmin: true,
      },
    },
  );
  Object.assign(fieldData.value, res.data);

  isFetched.value = true;

  if (!isEmpty(fieldData.value.vstSchDt)) {
    isFetched.value = false;
    alert(t('MSG_ALT_ALRDY_HAVE_IST_EXP_DT')); // 이미 설치 예약된 계약건 입니다.
  }

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

  // 선납 정보 조회
  await fetchPrepayments();

  obsRef.value.init();
}

onMounted(async () => {
  isFetched.value = false;
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

    if (payload[0].channelId.indexOf(fieldData.value.sellInflwChnlDtlCd) === -1) {
      await alert('선택 가능한 상품이 아닙니다. 판매채널을 확인해주세요.');
      return;
    }

    searchParams.value.pdCd = payload[0].pdCd;
    searchParams.value.pdNm = payload[0].pdNm;
    searchParams.value.sellInflwChnlDtlCd = fieldData.value.sellInflwChnlDtlCd;

    await fetchProductAdditionalInfoData();
  }
}

// 약정개월, 소유권이전개월(=계약기간), 등록비, 유형선택(=렌탈할인구분),
// 프로모션코드(=렌탈할인유형), 주기/용도(=서비스상품) 변경 시, 변경되는 가격 조회
const rentalPrice = ref({});
async function selectRentalPriceChanges() {
  // 법인단체(5) 외 다른 유형 선택시,
  if (orderProduct.sellDscDvCd !== '5') { orderProduct.sellDscrCd = ''; } // 렌탈법인할인율코드 초기화

  rentalPrice.value = {};

  const res = await dataService.get(
    '/sms/wells/contract/changeorder/rental-price-changes',
    { params: orderProduct.value },
  );
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
  const componentProps = {
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
  };
  console.log(componentProps);

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

// 상품 변경 저장 버튼 클릭
async function onClickProductChangeSave() {
  if (!await confirm('상품 정보를 변경하시겠습니까?')) return;

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

  await dataService.post('/sms/wells/contract/changeorder/rental-change-infos/admin', {
    saveGbn: saveGbn.value.prod, // 저장구분: 상품변경
    baseInfo: fieldData.value, // 기본정보
    product: orderProduct.value, // 상품정보
    rentalPrice: rentalPrice.value, // 상품(가격)정보
    prepayment: {}, // 선납정보
    istEnv: {}, // 설치환경정보
  });

  notify(t('MSG_ALT_SAVE_DATA')); // 저장되었습니다.
  await fetchData();
}

// (선납) 등록 버튼 클릭
async function onClickPrepayRgst() {
  // 등록 플래그 true
  rgstMode.value = true;

  // 마지막 회차의 선납 데이터
  const view = grdPrepayRef.value.getView();
  const dataSource = view.getDataSource();
  const count = view.getItemCount();
  const lastRowData = dataSource.getJsonRow(count - 1, false);

  // 등록 전 체크
  // 1. 기존 선납 데이터가 존재해야 함.
  if (count === 0) {
    rgstMode.value = false;
  }
  // 2. 2023년 6월 이후 선납 데이터가 없어야 함.
  if (lastRowData.prmStrtYm >= '202306') {
    rgstMode.value = false;
  }
  // 3. 현재 유지중인 선납이 없어야 함.
  if (lastRowData.prmEndYm >= now.format('YYYYMM')) {
    rgstMode.value = false;
  }
  // 4. 마지막 선납 종료 후 다음달까지 신청해야 함.
  if (lastRowData.prmEndYm !== now.subtract(1, 'month').format('YYYYMM')) {
    rgstMode.value = false;
  }
  if (!rgstMode.value) {
    await alert('선납할인제도가 2023년 6월 1일부로 종료되었습니다.\n'
              + '2023년 6월 1일 이전에, 이미 선납 할인 중인 고객에 한해서\n'
              + '1년 선납만 1회 연장 가능합니다.');
    return;
  }

  Object.assign(prepayBas.value, lastRowData);
  prepayBas.value.prmDt = ''; // 확정일자(=선납일자) 초기화
  Object.assign(prepayBf.value, lastRowData);
  prepayAf.value = {
    lstPrmTn: toNumber(lastRowData.lstPrmTn || 0) + 1, // 선납회차 세팅. 마지막 선납회차 + 1
    lstPrmMcn: '12', // 선납개월 세팅. 12개월로 고정. 정책상 새로 등록하는 선납개월은 12개월만 허용한다고 함.
    lstPrmDscr: '5', // 선납할인율 세팅. 5%로 고정. 선납개월 12개월에 대한 할인율 5%.
  };
}

// (선납) 취소 버튼 클릭
async function onClickPrepayCancel() {
  // 등록 플래그 false
  rgstMode.value = false;

  // 선변 초기화
  prepayBf.value = {};
  prepayAf.value = {};
}

// (선납) 저장 버튼 클릭
async function onClickPrepaySave() {
  if (isEmpty(prepayAf.value.prmDt)) {
    await alert('선납일자은(는) 필수입력입니다.');
    return;
  }

  // 마지막 선납 종료 후 다음달까지 신청해야 함.
  if (prepayBf.value.prmEndYm !== dayjs(prepayAf.value.prmDt).subtract(1, 'month').format('YYYYMM')) {
    await alert('선납일자가 유효하지 않습니다.');
    return;
  }

  await dataService.post('/sms/wells/contract/changeorder/rental-change-infos/prepayment', {
    prepayBf: prepayBf.value,
    prepayAf: prepayAf.value,
  });

  notify(t('MSG_ALT_SAVE_DATA')); // 저장되었습니다.
}

// 설치환경 저장 버튼 클릭
async function onClickInstallmentEnvironmentSave() {
  if (!await confirm('설치환경 정보를 변경하시겠습니까?')) return;

  await dataService.post('/sms/wells/contract/changeorder/rental-change-infos/admin', {
    saveGbn: saveGbn.value.istEnv, // 저장구분: 설치환경
    baseInfo: fieldData.value, // 기본정보
    product: {}, // 상품정보
    rentalPrice: {}, // 상품(가격)정보
    prepayment: {}, // 선납정보
    istEnv: istEnvRequest.value, // 설치환경정보
  });

  notify(t('MSG_ALT_SAVE_DATA')); // 저장되었습니다.
  await fetchData();
}

// 조회 버튼 클릭
async function onClickSearch() {
  await fetchData();
}

// (계약) 삭제 버튼 클릭
async function onClickCntrDelete() {
  if (!await confirm('계약을 삭제하시겠습니까?')) {
    return;
  }

  const res = await dataService.delete('/sms/wells/contract/changeorder/rental-change-infos', {
    params: {
      cntrNo: fieldData.value.cntrNo,
      cntrSn: fieldData.value.cntrSn,
    },
  });

  // 저장 완료 후,
  // 특정 조건을 만족할 때, 알림메시지 띄우기
  if (!isEmpty(res.data)) {
    // 복합상품으로 등록된 계약입니다. 삭제하시면 익월 초 렌탈료가 원복 됩니다.
    // 1+1할인으로 매칭된 계약입니다. 삭제하시면 익월 초 렌탈료 원복됩니다.
    // 정기배송 패키지 (" + dvo.getPkgCntrNo() + "-" + dvo.getPkgCntrSn() + ") 은 고객센터로 별도 취소접수 하시길 바랍니다. (배송제품으로 동시 삭제 불가)
    await alert(res.data);
  }
}

watch(() => orderProduct.value.sellDscCtrAmt, async () => {
  // console.log(toNumber(orderProduct.value.sellDscCtrAmt || 0));
  // console.log(toNumber(orderProduct.value.sellAmt || 0));

  if (toNumber(orderProduct.value.sellDscCtrAmt || 0) > toNumber(orderProduct.value.sellAmt || 0)) {
    alert('할인금액이 렌탈금액보다 높을 수 없습니다.');
    orderProduct.value.sellDscCtrAmt = 0;
  }
  orderProduct.value.fnlAmt = toNumber(orderProduct.value.sellAmt || 0)
  - toNumber(orderProduct.value.sellDscCtrAmt || 0);
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

function initGrid(data, view) {
  const fields = [
    { fieldName: 'cntrNo' }, /* 계약번호 */
    { fieldName: 'cntrSn' }, /* 계약일련번호 */
    { fieldName: 'dtlBtn' }, /* 상세버튼 */
    { fieldName: 'coCd' }, /* 회사코드 */
    { fieldName: 'coCdNm' }, /* 회사코드명 */
    { fieldName: 'coNm' }, /* [회사구분] 회사코드명 */
    { fieldName: 'hooPrtnrNo' }, /* [본부장-사번] 조직장파트너번호 */
    { fieldName: 'hooPrtnrNm' }, /* [본부장-이름] 조직장파트너명 */
    { fieldName: 'hooOgCd' }, /* [본부장-조직코드] 조직장조직코드 */
    { fieldName: 'sellDv' }, /* [판매구분] 판매유입채널상세코드 */
    { fieldName: 'sellPrtnrNo' }, /* [판매자-사번] 판매파트너번호 */
    { fieldName: 'prtnrKnm' }, /* [판매자-이름] 파트너한글명 */
    { fieldName: 'prtnrOgCd' }, /* [판매자-조직코드] 파트너조직코드 */
    { fieldName: 'basePdCd' }, /* [계약상품명-상품코드] 기준상품코드 */
    { fieldName: 'svPrd' }, /* [계약상품명-서비스주기] 서비스주기 */
    { fieldName: 'svPtrmUnitCd' }, /* 서비스기간단위코드 */
    { fieldName: 'svPtrmUnitNm' }, /* [계약상품명-서비스기간단위] 서비스기간단위명 */
    { fieldName: 'svPdTpCd' }, /* [계약상품명-서비스유형코드] 서비스유형코드 - 코드값 SV_TP_CD */
    { fieldName: 'pdNm' }, /* [계약상품명-상품명] 상품명 */
    { fieldName: 'cntrCnfmDt' }, /* [계약일자] 계약확정일 */
    { fieldName: 'istDt' }, /* [매출일자] 설치일자 */
    { fieldName: 'cntrAmt' }, /* [등록비용] 계약금 - AS-IS 확인시 계약금할인금액이 포함 됨 */
    { fieldName: 'cntramDscAmt' }, /* [할인금액] 계약금할인금액 */
    { fieldName: 'rentalTam' }, /* [렌탈총액] (최종금액 + 판매할인 조정금액) * 계약기간 */
    { fieldName: 'cntrPtrm' }, /* [(1)렌탈료-기간] 계약기간 */
    { fieldName: 'rentalAmt' }, /* [(1)렌탈료-금액] (최종금액 + 판매할인 조정금액) */
    { fieldName: 'rentalPtrm2' }, /* [(2)렌탈료-기간] 렌탈기간2 */
    { fieldName: 'rentalAmt2' }, /* [(2)렌탈료-금액] 렌탈금액2 */
    { fieldName: 'cntrTam' }, /* [계약총액] 계약총액 */
    { fieldName: 'rentalDscAmt' }, /* [(1)렌탈료DC] 렌탈료DC(판매금액-최종금액) */
    { fieldName: 'rentalDscAmt2' }, /* [(2)렌탈료DC] 렌탈할인금액2 */
    { fieldName: 'prcTcnt' }, /* [가격차수] 가격차수(LC5000P.LCETC3) TODO:맵핑없음 */
    { fieldName: 'prmRentalTn' }, /* [렌탈차월-선납시작년월기준] 렌탈차월-선납시작년월기준 */
    { fieldName: 'rentalTn' }, /* [렌탈차월-매출마감년월기준] 렌탈차월-매출마감년월기준 */
    { fieldName: 'chngDt' }, /* [교체일자] 교체일자 */
    { fieldName: 'canDt' }, /* [취소일자] 취소일자 AS-IS LC5000P에서 조회 하므로 WELLS매출월마감내역에서 조회하도록 함 */
    { fieldName: 'prmBlam' }, /* [선납잔액] 선납잔액 - 금액동일 */
    { fieldName: 'atamBlam' }, /* 선수잔액 - 금액동일 [선수잔액] */
    { fieldName: 'prpdTam' }, /* [선수총액] 선수총액 */
    { fieldName: 'thmUcBlam' }, /* [미수총액] 당월미수잔액(전월) */
    { fieldName: 'eotDlqAmt' }, /* [연체금액] 기말연체금액 */
    { fieldName: 'lstPrmTn' }, /* [선변-선납회차] 선납회차 */
    { fieldName: 'lstPrmMcn' }, /* [선변-선납개월] 선납개월 */
    { fieldName: 'lstPrmDscr' }, /* [선변-할인율] 선납할인율 [선변_前-선납개월/할인율] */
    { fieldName: 'prmTp' }, /* [선변-선납유형] 선납유형(LC3200P.LCPFLG) TODO:맵핑없음 */
    { fieldName: 'prmStrtYm' }, /* [선변-선납시작] 선납시작년월 */
    { fieldName: 'prmEndYm' }, /* [선변-선납종료] 선납종료년월 */
    { fieldName: 'prmDt' }, /* [선변-선납일자] 선납일 */
    { fieldName: 'prmAmt', dataType: 'number' }, /* [선변-(1)선납액] = 렌탈료(1)-할인액(1)  */
    { fieldName: 'prmAmt2', dataType: 'number' }, /* [선변-(2)선납액] (2)선납액. TODO:맵핑없음 */
    { fieldName: 'prmDscAmt2' }, /* (2)선납액(할인액)[선변-(2)선납액] TODO:맵핑없음 */
    { fieldName: 'prmPtrm2' }, /* [선변-(2)선납기간] TODO:맵핑없음 */
    { fieldName: 'prmTam', dataType: 'number' }, /* [선변-선납총액] 선납총액 */
    { fieldName: 'dscPrmAmt', dataType: 'number' }, /* [선변-(1)할인액] (1)할인액 */
    { fieldName: 'dscPrmAmt2', dataType: 'number' }, /* [선변-(2)할인액] (2)할인액 TODO:맵핑없음 */
    { fieldName: 'dscTam', dataType: 'number' }, /* [선변-할인총액] TODO:맵핑없음 */
    { fieldName: 'prmDiff', dataType: 'number' }, /* [선변-선납차액] TODO:맵핑없음 */
    { fieldName: 'dscDiff', dataType: 'number' }, /* [선변-할인차액] TODO:맵핑없음 */
    { fieldName: 'extraSales', dataType: 'number' }, /* [선변-추가매출] TODO:맵핑없음 */
  ];

  const columns = [
    { fieldName: 'lstPrmTn', header: '선납회차', width: '80', styleName: 'text-center' },
    { fieldName: 'dtlBtn',
      header: '상세',
      width: '100',
      styleName: 'text-center',
      renderer: { type: 'button' },
      displayCallback() {
        return '상세보기';
      },
    },
    { fieldName: 'lstPrmMcn', header: '선납개월', width: '100', styleName: 'text-right' },
    { fieldName: 'lstPrmDscr', header: '선납할인율', width: '100', styleName: 'text-right' },
    { fieldName: 'prmTp', header: '선납유형', width: '100', styleName: 'text-center' },
    { fieldName: 'prmStrtYm',
      header: '선납시작',
      width: '100',
      styleName: 'text-center',
      displayCallback(g, index, val) {
        if (!isEmpty(val)) {
          if (val.length === 5) {
            return `${val.substr(0, 4)}-0${val.substr(4)}`;
          } if (val.length === 6) {
            return `${val.substr(0, 4)}-${val.substr(4)}`;
          }
          return '';
        }
      },
    },
    { fieldName: 'prmEndYm',
      header: '선납종료',
      width: '100',
      styleName: 'text-center',
      displayCallback(g, index, val) {
        if (!isEmpty(val)) {
          if (val.length === 5) {
            return `${val.substr(0, 4)}-0${val.substr(4)}`;
          } if (val.length === 6) {
            return `${val.substr(0, 4)}-${val.substr(4)}`;
          }
          return '';
        }
      },
    },
    { fieldName: 'prmDt', header: '선납일자', width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'prmAmt', header: '(1)선납액', width: '100', styleName: 'text-right' },
    { fieldName: 'lstPrmMcn', header: '(1)선납기간', width: '100', styleName: 'text-right' },
    { fieldName: 'prmAmt2', header: '(2)선납액', width: '100', styleName: 'text-right' },
    { fieldName: 'prmPtrm2', header: '(2)선납기간', width: '100', styleName: 'text-right' },
    { fieldName: 'prmTam', header: '선납총액', width: '100', styleName: 'text-right' },
    { fieldName: 'dscPrmAmt', header: '(1)할인액', width: '100', styleName: 'text-right' },
    { fieldName: 'dscPrmAmt2', header: '(2)할인액', width: '100', styleName: 'text-right' },
    { fieldName: 'dscTam', header: '할인총액', width: '100', styleName: 'text-right' },
    { fieldName: 'prmDiff', header: '선납차액', width: '100', styleName: 'text-right' },
    { fieldName: 'dscDiff', header: '할인차액', width: '100', styleName: 'text-right' },
    { fieldName: 'extraSales', header: '추가매출', width: '100', styleName: 'text-right' },
    { fieldName: 'prmDt', header: '확정일자', width: '100', styleName: 'text-center', datetimeFormat: 'date' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'dtlBtn') {
      // 선변 기본 정보 세팅
      prepayBas.value = g.getValues(itemIndex);

      // 선변 전,후 정보 세팅
      if (itemIndex === 0) {
        prepayBf.value = g.getValues(itemIndex);
        prepayAf.value = g.getValues(itemIndex);
      } else {
        prepayBf.value = g.getValues(itemIndex - 1);
        prepayAf.value = g.getValues(itemIndex);
      }
      // 등록모드 종료
      rgstMode.value = false;
    }
  };
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
