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
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            :name="$t('MSG_TXT_CNTR_DTL_NO')"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <kw-form
      ref="obsRef"
    >
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
            <!-- orderProduct가 바뀐걸 옵저버가 인지하지 못해서 컴포넌트 추가함. -->
            <kw-field
              v-show="false"
              v-model="orderProduct"
            />

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
                  :disable="!isFetched || fieldData.slClYn==='Y'"
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
                modify
                @select:one-plus-one="onClickOnePlusOne"
                @delete:one-plus-one="onDeleteOnePlusOne"
                @select:device="onClickDeviceChange"
                @delete:device="onDeleteDeviceChange"
                @packaging="onPackaging"
                @price-changed="onPriceChanged(orderProduct, $event)"
                @delete="onClickDelete(orderProduct)"
              />
            </div>

            <div>
              <kw-form
                :cols="2"
              >
                <kw-form-row>
                  <kw-form-item
                    label="제휴상품"
                  >
                    <kw-select
                      v-model="productExtra.alncmpCd"
                      :options="codes.ALNCMP_CD"
                      first-option="select"
                      :disable="fieldData.slClYn==='Y'"
                    />
                  </kw-form-item>

                  <kw-form-item
                    label="법인추가할인"
                  >
                    <kw-input
                      v-model="productExtra.sellDscCtrAmt"
                      maxlength="10"
                      type="number"
                      :readonly="fieldData.copnDvCd !== '2'"
                      :disable="fieldData.slClYn==='Y'"
                    />
                  </kw-form-item>
                </kw-form-row>

                <kw-form-row>
                  <kw-form-item
                    label="변경사유"
                    :colspan="2"
                  >
                    <kw-input
                      v-model="productExtra.cntrChAkCn"
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
                      v-model="productExtra.ackmtAmt"
                      mask="number"
                      readonly
                      align="right"
                    /><p>&nbsp;원</p>
                    <!-- 인정실적율 -->
                    <kw-input
                      v-model="productExtra.ackmtRt"
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
                      v-model="productExtra.feeAckmtBaseAmt"
                      mask="number"
                      readonly
                      align="right"
                    />
                  </kw-form-item>
                </kw-form-row>
              </kw-form>
            </div>

            <div class="row justify-end my20">
              <!-- 상품확정 -->
              <kw-btn
                primary
                label="상품확정"
                :disable="isCnfmPd"
                @click="onClickConfirm"
              />
              <!-- 저장 -->
              <kw-btn
                v-permission:update
                class="ml10"
                padding="12px"
                label="저장"
                :disable="!isFetched || fieldData.slClYn==='Y' || !isCnfmPd"
                @click="onClickProductChangeSave"
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
            <kw-field
              v-show="false"
              v-model="istEnvRequest"
            />

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
import dayjs from 'dayjs';
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

const now = dayjs();
const dataService = useDataService();
const { modal, alert, confirm, notify } = useGlobal();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const obsRef = ref(getComponentType('KwForm'));
const grdPrepayRef = ref(getComponentType('KwGrid'));
const saveGbn = ref({ prod: 'prod', istEnv: 'istEnv' });
const compKey = ref(0); // 렌탈가격설정 컴포넌트 생성키

const codes = await codeUtil.getMultiCodes(
  'SELL_EV_CD', // 판매행사코드. 팝업스토어관련(2), 무진행사(4),...
  'DSC_TP_ACD', // 할인 유형 앱코드
  'USE_ELECT_TP_CD', // 사용전력유형코드. 110V(1), 220V(2)
  'WPRS_ITST_TP_CD', // 수압강도유형코드. 강(1), 약(2)
  'SRCWT_TP_CD', // 상수원유형코드. 상수도(1), 지하수(2), 간이상수원(3)
  'IST_PLC_TP_CD', // 설치장소유형코드. 자택(1), 사무실(2), 업소(3), 학교(4), 기타(5)
  'ALNCMP_CD', // 제휴사코드
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
  pdCd: '',
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

const orderProduct = ref({});
const promotions = ref([]); // 적용가능한 프로모션

// ADMIN용 추가 데이터
const productExtra = ref({
  alncmpCd: '', // 제휴상품
  sellDscCtrAmt: 0, // 법인추가할인
  cntrChAkCn: '', // 변경사유
  ackmtAmt: 0, // 인정실적
  ackmtRt: 0, // 인정실적율
  feeAckmtBaseAmt: 0, // 수수료기준금액
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

// 설치환경 및 요청사항 초기화
async function initIstEnvRequest() {
  istEnvRequest.value.useElectTpCd = fieldData.value.useElectTpCd;
  istEnvRequest.value.wprsItstTpCd = fieldData.value.wprsItstTpCd;
  istEnvRequest.value.srcwtTpCd = fieldData.value.srcwtTpCd;
  istEnvRequest.value.istPlcTpCd = fieldData.value.istPlcTpCd;
  istEnvRequest.value.istAkArtcMoCn = fieldData.value.istAkArtcMoCn;
  istEnvRequest.value.sconCn = fieldData.value.sconCn;
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

const isFetched = ref(false); // 조회되었나
const isInit = ref(true); // 조회후 초기화인가
const rgstMode = ref(false); // 선납 등록 모드 플래그
const isCnfmPd = ref(false); // 상품확정 유무

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

// 기본정보 조회
async function fetchData() {
  isFetched.value = false;
  isInit.value = true;
  rgstMode.value = false;

  // 조회 전 기존 데이터 초기화
  fieldData.value = {};
  orderProduct.value = {};
  prepayBas.value = {};
  istEnvRequest.value = {};

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

  // 선납 정보 조회
  await fetchPrepayments();

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
  // console.log('orderProduct 세팅');
  const product = {
    pdPrcFnlDtlId: fieldData.value.pdPrcFnlDtlId,
    pdQty: fieldData.value.pdQty,
    promotions: promotions.value,
    appliedPromotions: fieldData.value.promts,
    cstBasePdAbbrNm: fieldData.value.pdNm,
    pdCd: fieldData.value.pdCd,
    cntrNo: fieldData.value.cntrNo,
    pdClsfNm: fieldData.value.pdMclsfNm,
    sellDscCtrAmt: fieldData.value.sellDscCtrAmt,
    wellsDtl: {
      sellEvCd: isEmpty(fieldData.value.sellEvCd) ? '' : fieldData.value.sellEvCd,
    },
    priceOptionFilter: {
      rentalDscDvCd: fieldData.value.sellDscDvCd || '',
      rentalDscTpCd: fieldData.value.sellDscTpCd || '',
    },
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
  }

  compKey.value += 1;
  orderProduct.value = product;

  if (!isEmpty(fieldData.value.vstSchDt)) {
    isFetched.value = false;
    alert(t('MSG_ALT_ALRDY_HAVE_IST_EXP_DT')); // 이미 설치 예약된 계약건 입니다.
  } else {
    isFetched.value = true;
  }
  isCnfmPd.value = true;
  obsRef.value.init();
}

// 상품 가격이 바꼈을 때, 이벤트
function onPriceChanged(item, price) {
  // console.log('onPriceChanged');
  item.finalPrice = price;

  orderProduct.value = item;

  // 최초 세팅시
  if (isInit.value) {
    // console.log('promotions 세팅 : ', promotions.value);
    isInit.value = false;

    // 적용되있는 프로모션 세팅
    if (!isEmpty(promotions.value)) {
      orderProduct.value.promotions = promotions.value;
    } else {
      fieldData.value.promts?.forEach((i) => { i.pmotApyGrpCd = null; i.pmotApyOptCd = null; });
      orderProduct.value.promotions = fieldData.value.promts;
    }
    orderProduct.value.appliedPromotions = fieldData.value.promts;

    // 적용되있는 제휴사코드, 판매할인조정금액(법인추가할인) 세팅
    productExtra.value.alncmpCd = fieldData.value.alncmpCd;
    productExtra.value.sellDscCtrAmt = fieldData.value.sellDscCtrAmt;

    isCnfmPd.value = true;
    obsRef.value.init();
  } else {
    promotions.value = [];
    isCnfmPd.value = false;
  }
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
    odrPrdct.priceOptionFilter.rentalDscTpCd = '';
  }
  if (odrPrdct.priceOptionFilter.rentalDscDvCd) {
    odrPrdct.priceOptionFilter.rentalDscDvCd = '';
  }
}

// 기기변경 삭제 버튼 클릭
async function onDeleteDeviceChange(odrPrdct) {
  odrPrdct.mchnCh = null;

  if (odrPrdct.priceOptionFilter?.rentalDscTpCd) {
    odrPrdct.priceOptionFilter.rentalDscTpCd = '';
  }
  if (odrPrdct.priceOptionFilter?.rentalDscDvCd) {
    odrPrdct.priceOptionFilter.rentalDscDvCd = '';
  }
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

// 상품 변경 저장 버튼 클릭
async function onClickProductChangeSave() {
  if (!obsRef.value.isModified()) {
    await alert(t('MSG_ALT_NO_CHG_CNTN')); // 변경된 내용이 없습니다.
    return;
  }

  if (!isCnfmPd.value) {
    await alert('먼저 상품확정을 해주세요.');
    return;
  }

  if (!await confirm('상품 정보를 변경하시겠습니까?')) return;

  // 선택한 제휴사코드 세팅
  orderProduct.value.alncmpCd = productExtra.value.alncmpCd;

  // 변경사유 세팅
  orderProduct.value.cntrChAkCn = productExtra.value.cntrChAkCn;

  await dataService.post('/sms/wells/contract/changeorder/rental-change-infos/admin', {
    saveGbn: saveGbn.value.prod, // 저장구분: 상품변경
    baseInfo: fieldData.value, // 기본정보
    product: orderProduct.value, // 상품정보
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

watch(() => orderProduct.value.finalPrice?.ackmtAmt, async () => {
  productExtra.value.ackmtAmt = orderProduct.value?.finalPrice?.ackmtAmt;
});

watch(() => orderProduct.value.finalPrice?.ackmtRt, async () => {
  productExtra.value.ackmtRt = orderProduct.value?.finalPrice?.ackmtRt;
});

watch(() => orderProduct.value.finalPrice?.feeAckmtBaseAmt, async () => {
  productExtra.value.feeAckmtBaseAmt = orderProduct.value?.finalPrice?.feeAckmtBaseAmt;
});

watch(() => productExtra.value.sellDscCtrAmt, async () => {
  if (toNumber(productExtra.value.sellDscCtrAmt || 0) > toNumber(orderProduct.value.fnlAmt || 0)) {
    productExtra.value.sellDscCtrAmt = 0;
    alert('할인금액이 렌탈금액보다 높을 수 없습니다.');
  }
  orderProduct.value.sellDscCtrAmt = productExtra.value.sellDscCtrAmt;
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
