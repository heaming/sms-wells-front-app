<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID :  WwwdbRefundApplicationDtlP - 환불 신청 상세 내역 팝업 W-WD-U-0108P03
3. 작성자 : sonkiseok
4. 작성일 : 2023.05.19
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- PGE_WDB_00063
- 수납 > 환불업무 > 환불신청 관리 > 그리드에서 환불상세 클릭
- 환불신청상세 내역을 조회 합니다.
****************************************************************************************************
--->
<template>
  <!-- 환불신청상세내역 -->
  <kw-popup
    ref="popupRef2"
    size="3xl"
  >
    <kw-action-top class="mb20">
      <template #left>
        <!-- 신청정보 -->
        <h3>{{ t('MSG_TXT_APLC_INF') }}</h3>
      </template>
    </kw-action-top>
    <kw-grid
      ref="grdPopRef11"
      name="grdPop11"
      :visible-rows="1"
      @init="initGridPop11"
    />
    <h3 class="mt30 mb18">
      <!-- 계약정보 -->
      {{ t('MSG_TXT_CNTR_INF') }}
    </h3>
    <kw-action-top class="mb20">
      <template #left>
        <!-- (단위:원,개월)  -->
        <span>{{ t('MSG_TXT_UNIT_WON_MCN') }}</span>
      </template>
      <!-- 컨택조회 -->
      <kw-btn
        :label="t('MSG_TXT_CTT_INQR')"
        secondary
        dense
        @click="onClickContect"
      />
    </kw-action-top>

    <kw-form
      dense
    >
      <!-- 계약정보 -->
      <kw-form-row>
        <kw-form-item :label="t('MSG_TXT_CNTR_NO')">
          <p>{{ ctract.cntrNo }}</p>
        </kw-form-item>
        <!-- 주문유형 -->
        <kw-form-item :label="t('MSG_TXT_ORD_TYP')">
          <p>{{ ctract.sellTpCd }}</p>
        </kw-form-item>
        <!-- 고객명/설치자명 -->
        <kw-form-item :label="t('MSG_TXT_CST_NM') + '/' +t('MSG_TXT_IST_NM')">
          <p>{{ ctract.cstKnm }} / {{ ctract.istllKnm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 상품명 -->
        <kw-form-item :label="t('MSG_TXT_PRDT_NM')">
          <p>{{ ctract.pdNm }}</p>
        </kw-form-item>
        <!-- 고객번호 -->
        <kw-form-item :label="t('MSG_TXT_CST_NO')">
          <p>{{ ctract.cntrCstNo }}</p>
        </kw-form-item>
        <!-- 생년월일 -->
        <kw-form-item :label="t('MSG_TXT_BIRTH_DATE')">
          <p>{{ ctract.bryyMmdd }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 이체구분 -->
        <kw-form-item :label="t('MSG_TXT_FNT_DV')">
          <p>{{ ctract.dpTpCd }}</p>
        </kw-form-item>
        <!-- 이체일 -->
        <kw-form-item :label="t('MSG_TXT_FTD')">
          <p>{{ ctract.mpyBsdt }}</p>
        </kw-form-item>
        <!-- 컨택코드 -->
        <kw-form-item :label="t('MSG_TXT_CTT_CD')">
          <p>{{ ctract.cttRsCd }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 렌탈1(개월) -->
        <kw-form-item :label="t('MSG_TXT_RENTAL')+ 1 + '(' + t('MSG_TXT_MCNT') + ')'">
          <p>{{ ctract.rentalAmt }}({{ ctract.rentalPtrm }})</p>
        </kw-form-item>
        <!-- 렌탈2(개월) -->
        <kw-form-item :label="t('MSG_TXT_RENTAL') + 2 + '(' + t('MSG_TXT_MCNT') + ')'">
          <p>{{ ctract.rentalAmt }}({{ ctract.rentalPtrm }})</p>
        </kw-form-item>
        <!-- 제휴 -->
        <kw-form-item :label="t('MSG_TXT_ALNC')">
          <p>{{ ctract.alncmpCd }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 등록비용 -->
        <kw-form-item :label="t('MSG_TXT_REG_FEE')">
          <p>{{ ctract.rentalRgstCost }}</p>
        </kw-form-item>
        <!-- 의무약정 -->
        <kw-form-item :label="t('MSG_TXT_DUTY_STPL')">
          <p>{{ ctract.dutyUseMcn }}</p>
        </kw-form-item>
        <!-- 설치일자 -->
        <kw-form-item :label="t('MSG_TXT_IST_DT')">
          <p>
            {{ !ctract.istDt ? '':ctract.istDt.substring(0, 4) }}
            - {{ !ctract.istDt ? '':ctract.istDt.substring(4, 6) }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 매출일자 -->
        <kw-form-item :label="t('MSG_TXT_SL_DT')">
          <p>
            {{ !ctract.slDt ? '' : ctract.slDt.substring(0, 4) }}
            - {{ !ctract.slDt ? '' : ctract.slDt.substring(4, 6) }}
          </p>
        </kw-form-item>
        <!-- 취소일자 -->
        <kw-form-item :label="t('MSG_TXT_CANC_DT')">
          <p>
            {{ !ctract.cntrCanDtm ? '' : ctract.cntrCanDtm.substring(0, 4) }}
            - {{ !ctract.cntrCanDtm ? '' : ctract.cntrCanDtm.substring(4, 6) }}
            - {{ !ctract.cntrCanDtm ? '' : ctract.cntrCanDtm.substring(6, 8) }}
          </p>
        </kw-form-item>
        <!-- 완료일자 -->
        <kw-form-item :label="t('MSG_TXT_FSH_DT')">
          <p>
            {{ !ctract.cntrCnfmDtm.length ? '':ctract.cntrCnfmDtm.substring(0, 4) }}
            - {{ !ctract.cntrCnfmDtm.length ? '':ctract.cntrCnfmDtm.substring(4, 6) }}
            - {{ !ctract.cntrCnfmDtm.length ? '': ctract.cntrCnfmDtm.substring(6, 8) }}
          </p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />

    <kw-action-top class="mb20">
      <template #left>
        <!-- 환불가능금액 -->
        <h3>{{ t('MSG_TXT_REFUND_AMT') }}</h3>
      </template>
      <!-- (단위:원) -->
      <span class="kw-fc--black3 text-weight-regular"> {{ t('MSG_TXT_UNIT_WON') }} </span>
    </kw-action-top>
    <kw-grid
      ref="grdPopRef12"
      name="grdPop12"
      :visible-rows="1"
      @init="initGridPop12"
    />
    <ul class="kw-notification">
      <li>
        환불 가능금액 = 당월 입금액
        <span class="kw-fc--primary">
          ({{ !refundPossibleAmnt.thmDpAmt ? '' : refundPossibleAmnt.thmDpAmt.toLocaleString() }})</span>
        - 전월 연체금액
        <span class="kw-fc--primary">
          ({{ !refundPossibleAmnt.lstmmDlqAmt ? '' : refundPossibleAmnt.lstmmDlqAmt.toLocaleString() }})</span>
      </li>
    </ul>
    <h3 class="mb20">
      <!-- 상세입금조회 -->
      {{ t('MSG_TXT_DTL_DP_INQR') }}
    </h3>

    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          @change="fetchData4"
        />
      </template>
      <!-- 엑셀다운로드 -->
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
        @click="onClickExcelDownload1"
      />
    </kw-action-top>
    <!-- <kw-grid
      ref="grdPopRef12"
      name="grdPop12"
      :visible-rows="5"
      @init="initGridPop12"
    /> -->
    <kw-grid
      ref="grdPopRef13"
      name="grdPop13"
      :visible-rows="pageInfo.pageSize - 1"
      @init="initGridPop13"
    />

    <kw-separator />

    <h3 class="mb20">
      <!-- 매출실적조회 -->
      {{ t('MSG_TXT_SL_PERF_INQR') }}
    </h3>

    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          @change="fetchData5"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- (단위:원,개월) -->
        <span>{{ t('MSG_TXT_UNIT_WON_MCN') }}</span>
      </template>
      <!-- 엑셀다운로드 -->
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
        @click="onClickExcelDownload2"
      />
    </kw-action-top>
    <kw-grid
      ref="grdPopRef14"
      name="grdPop14"
      :visible-rows="pageInfo.pageSize - 1"
      @init="initGridPop14"
    />
    <kw-separator />
    <h3>
      <!-- 환불신청 -->
      {{ t('MSG_TXT_APLC_RFND') }}
      <ul class="kw-notification">
        <li>
          카드 전금의 경우 입금 카드 정보 선택 바랍니다.
        </li>
      </ul>
    </h3>
    <kw-action-top>
      <!-- 삭제 -->
      <kw-btn
        :label="t('MSG_BTN_DEL')"
        primary
        @click="onClickDelete2"
      />
    </kw-action-top>

    <kw-form
      :cols="2"
      dense
    >
      <kw-form-row>
        <!-- 환불구분 -->
        <kw-form-item :label="t('MSG_TXT_CLSF_REFUND')">
          <p>{{ app.rfndDsbDvCd }}</p>
        </kw-form-item>
        <!-- 전금구분 -->
        <kw-form-item :label="t('MSG_TXT_BLTF_DV')">
          <p>{{ app.rfndDsbDvCdCshBltf }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 회원구분 -->
        <kw-form-item :label="t('MSG_TXT_MB_DV')">
          <p>{{ app.bltfRfndMbDvCd }}</p>
        </kw-form-item>
        <!-- 상품 -->
        <kw-form-item :label="t('MSG_TXT_PRDT')">
          <p>{{ app.pdNm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 전금전 가상계좌 -->
        <kw-form-item :label="t('MSG_TXT_BLTF_BF') + t('MSG_TXT_VT_AC')">
          <p>{{ app.bltfBfVacNoEncr }}</p>
        </kw-form-item>
        <!-- 전금후 가상계좌 -->
        <kw-form-item :label="t('MSG_TXT_BLTF_AF') + t('MSG_TXT_VT_AC')">
          <p>{{ app.bltfAfVacNoEncr }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 전금 요청금액(원) -->
        <kw-form-item :label="t('MSG_TXT_BLTF') + t('MSG_TXT_AK_AMT') + '(' + t('MSG_TXT_CUR_WON') + ')'">
          <p>{{ app.rfndAkAmt }}</p>
        </kw-form-item>
        <!-- 전금사유 -->
        <kw-form-item :label="t('MSG_TXT_BLTF_RSON')">
          <p>{{ app.rfndRsonCn }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <!-- 반복 시작 -->
    <div
      v-for="(item, i) in saveParams.details"
      :key="i"
    >
      <kw-separator />
      <kw-action-top class="mb20">
        <template #left>
          <!-- 환불신청 -->
          <h3>{{ t('MSG_TXT_APLC_RFND') }}</h3>
          <ul class="kw-notification ml8">
            <!-- 선환불의 경우 당일지급, 일반환불의 경우 D+2지급 입니다. -->
            <li v-show="item.rfndDsbDvCd === '01'">
              선환불의 경우 당일지급, 일반환불의 경우 D+2지급 입니다.
            </li>
            <!-- 카드 전금의 경우 입금 카드 정보 선택 바랍니다. -->
            <li v-show="item.rfndDsbDvCd === '02'">
              카드 전금의 경우 입금 카드 정보 선택 바랍니다.
            </li>
            <!-- 승인일로부터 90일 이후는 카드 할부 수수료 반환이 불가합니다. -->
            <li v-show="item.rfndDsbDvCd === '03'">
              승인일로부터 90일 이후는 카드 할부 수수료 반환이 불가합니다.
            </li>
          </ul>
        </template>
        <!-- 삭제 -->
        <!-- :style="`${i === 0 ? 'display:none' : ''}`" -->
        <kw-btn
          secondary
          dense
          :label="t('MSG_BTN_DEL')"
          @click="onClickDel(i)"
        />
        <!-- 추가 -->
        <kw-btn
          secondary
          dense
          :label="t('MSG_BTN_ADD')"
          @click="onClickAdd"
        />
      </kw-action-top>
      <kw-form
        :cols="3"
      >
        <kw-form-row>
          <!-- 환불구분 -->
          <kw-form-item :label="t('MSG_TXT_CLSF_REFUND')">
            <!-- 현금환불 -->
            <kw-option-group
              v-model="item.rfndDsbDvCd"
              type="radio"
              :options="codes.RFND_DSB_DV_CD.filter(v => v.codeId === '01' || v.codeId === '02' || v.codeId === '03')"
            />
          </kw-form-item>
          <!-- 현금환불 구분 -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '01'"
            :label="t('MSG_TXT_CASH_REFND') + t('MSG_TXT_DIV')"
          >
            <kw-option-group
              v-if="item.rfndDsbDvCd === '01'"
              v-model="item.cshRfndDvCd"
              type="radio"
              :options="codes.CSH_RFND_DV_CD"
            />
          </kw-form-item>
          <!-- 환불계좌 구분 -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '01'"
            :label="t('MSG_TXT_RFND_AC') + t('MSG_TXT_DIV')"
          >
            <kw-option-group
              v-if="item.rfndDsbDvCd === '01'"
              v-model="item.rfndAcDvCd"
              type="radio"
              :options="codes.RFND_AC_DV_CD"
            />
            <!-- TODO: 이체등록계좌 확인필요. 화면정의서에 내용 없이 버튼 그림만 있음 -->
            <!-- 이체등록계좌 -->
            <kw-btn
              v-if="item.cshRfndDvCd === '03'"
              secondary
              dense
              :label="t('MSG_TXT_FNT_RGST_AC')"
            />
          </kw-form-item>
          <!-- 승인일 -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '02'"
            :label="t('MSG_TXT_APR_D')"
          >
            <kw-date-range-picker
              v-if="item.rfndDsbDvCd === '02'"
              v-model:from="item.startDay"
              v-model:to="item.endDay"
              rules="date_range_months:1"
              :label="$t('MSG_TXT_APR_D')"
            />
          </kw-form-item>
          <!-- 카드사/카드번호 -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '02'"
            :label="t('MSG_TXT_CDCO') + '/' + t('MSG_TXT_CARD_NO')"
            rules="required"
          >
            <kw-select
              v-if="item.rfndDsbDvCd === '02'"
              v-model="item.cardRfndFnitCd"
              :options="cardLists"
              option-label="fnitNm"
              option-value="fnitCd"
              rules="required"
              :label="t('MSG_TXT_CDCO') + '/' + t('MSG_TXT_CARD_NO')"
            />
            <kw-input
              v-if="item.rfndDsbDvCd === '02'"
              v-model="item.cardRfndCrcdnoEncr"
              rules="required"
              :label="t('MSG_TXT_CDCO') + '/' + t('MSG_TXT_CARD_NO')"
            />
          </kw-form-item>
          <!-- 전금구분 -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '03'"
            :label="t('MSG_TXT_BLTF_DV')"
          >
            <kw-option-group
              v-if="item.rfndDsbDvCd === '03'"
              v-model="item.bltfRfndDvCd"
              type="radio"
              :options="codes.BLTF_RFND_DV_CD"
            />
          </kw-form-item>
          <!-- 회원구분 -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '03'"
            :label="t('MSG_TXT_MB_DV')"
          >
            <kw-option-group
              v-if="item.rfndDsbDvCd === '03'"
              v-model="item.bltfRfndMbDvCd"
              type="radio"
              :options="codes.BLTF_RFND_MB_DV_CD"
            />
          </kw-form-item>
        </kw-form-row>
        <!-- 2번째 로우 시작 -->
        <kw-form-row>
          <!-- 은행명 -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '01'"
            :label="t('MSG_TXT_BNK_NM')"
            required
          >
            <kw-select
              v-if="item.rfndDsbDvCd === '01'"
              v-model="item.cshRfndFnitCd"
              :options="bankLists"
              option-label="fnitNm"
              option-value="fnitCd"
              :label="t('MSG_TXT_BNK_NM')"
              rules="required"
            />
          </kw-form-item>
          <!-- 계좌번호 -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '01'"
            :label="t('MSG_TXT_AC_NO')"
            required
          >
            <kw-input
              v-if="item.rfndDsbDvCd === '01'"
              v-model="item.cshRfndAcnoEncr"
              type="number"
              rules="required"
              :label="t('MSG_TXT_AC_NO')"
            />
          </kw-form-item>
          <!-- 예금주 -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '01'"
            :label="t('MSG_TXT_ACHLDR')"
            required
          >
            <kw-input
              v-if="item.rfndDsbDvCd === '01'"
              v-model="item.cshRfndAcownNm"
              readonly
              rules="required"
              :label="t('MSG_TXT_ACHLDR')"
            />
            <!-- 유효성체크 -->
            <!-- TODO: 유효성체크 방식 확인되지 않음. -->
            <kw-btn
              v-if="item.rfndDsbDvCd === '01'
                && item.cshRfndDvCd !== '03'"
              secondary
              dense
              :label="t('MSG_BTN_EFTN_CHECK')"
              rules="required"
            />
          </kw-form-item>
          <!-- 카드환불 시작 -->
          <kw-form-item
            v-show="item.rfndDsbDvCd === '02'"
          />
          <!-- 환불사유 -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '02'"
            :label="t('MSG_TXT_RFND_RSON')"
            required
            :colspan="2"
          >
            <kw-select
              v-if="item.rfndDsbDvCd === '02'"
              v-model="item.rfndRsonCd"
              :options="codes.RFND_RSON_CD"
              :label="t('MSG_TXT_RFND_RSON')"
              rules="required"
              class="w262"
            />
            <kw-input
              v-if="item.rfndDsbDvCd === '02'"
              v-model="item.rfndRsonCn"
              :readonly="item.rfndRsonCd !== '56'"
              :label="t('MSG_TXT_RFND_RSON')"
              maxlength="300"
            />
          </kw-form-item>
          <!-- 전금 시작 -->
          <!-- 고객번호 -->
          <kw-search-item
            v-if="item.rfndDsbDvCd === '03'"
            :label="$t('MSG_TXT_CST_NO')"
          >
            <kw-input
              v-model="item.bltfOjCntrSn"
              icon="search"
              clearable
              maxlength="20"
              :label="$t('MSG_TXT_CST_NO')"
              @click-icon="onClickCstSearch2"
            />
          </kw-search-item>
          <!-- 전금전 가상계좌 -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '03'"
            :label="t('MSG_TXT_BLTF_BF') + ' ' + t('MSG_TXT_VT_AC')"
          >
            <kw-input
              v-if="item.rfndDsbDvCd === '03'"
              v-model="item.bltfBfVacNoEncr"
              type="number"
            />
          </kw-form-item>
          <!-- 전금후 가상계좌 -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '03'"
            :label="t('MSG_TXT_BLTF_AF') + ' ' + t('MSG_TXT_VT_AC')"
          >
            <kw-input
              v-if="item.rfndDsbDvCd === '03'"
              v-model="item.bltfAfVacNoEncr"
              type="number"
            />
          </kw-form-item>
        </kw-form-row>
        <!-- 3번째 로우 시작 -->
        <kw-form-row>
          <!-- 수취인 -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '01'"
            :label="t('MSG_TXT_ADRS')"
          >
            <kw-select
              v-if="item.rfndDsbDvCd === '01'"
              v-model="item.cshRfndAdrsDvCd"
              :options="codes.CSH_RFND_ADRS_DV_CD"
            />
          </kw-form-item>
          <!-- 대표자 확인 -->
          <!-- TODO: 대표자 확인 방식 확인되지 않음. -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '01'"
            :label="t('MSG_TXT_RPRS_NAME') + ' ' + t('MSG_TXT_CNTN_CONFRM')"
          >
            <kw-input
              v-if="item.rfndDsbDvCd === '01'"
              v-model="item.cshRfndDlgpsNm"
              readonly
            />
          </kw-form-item>
          <!-- 환불 신청금액(원) -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '01'"
            :label="t('MSG_TXT_RFND') + ' ' + t('MSG_TXT_APLC_AMT')+ '(' + t('MSG_TXT_CUR_WON') +')'"
            required
          >
            <kw-input
              v-if="item.rfndDsbDvCd === '01'"
              v-model="item.rfndAkAmt"
              type="number"
              rules="required"
              :label="t('MSG_TXT_RFND') + ' ' + t('MSG_TXT_APLC_AMT')+ '(' + t('MSG_TXT_CUR_WON') +')'"
              @update:model-value="onRefundReceiptTotalAmount"
            />
          </kw-form-item>
          <!-- 전금 요청금액(원) -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '03'"
            :label="t('MSG_TXT_BLTF') + ' ' + t('MSG_TXT_AK_AMT')+ '(' + t('MSG_TXT_CUR_WON') +')'"
          >
            <kw-input
              v-if="item.rfndDsbDvCd === '03'"
              v-model="item.rfndAkAmt"
              type="number"
              @update:model-value="onRefundReceiptTotalAmount"
            />
          </kw-form-item>
          <!-- 전금사유 -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '03'"
            :label="t('MSG_TXT_BLTF_RSON')"
          >
            <kw-input
              v-if="item.rfndDsbDvCd === '03'"
              v-model="item.rfndRsonCn"
            />
          </kw-form-item>
        </kw-form-row>
        <!-- 4번재 로우 시작 -->
        <kw-form-row>
          <!-- 환불사유 -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '01'"
            :label="t('MSG_TXT_RFND_RSON')"
            required
            :colspan="[ item.cshRfndDvCd === '03' ? 1 : 2 ]"
          >
            <kw-select
              v-if="item.rfndDsbDvCd === '01'"
              v-model="item.rfndRsonCd"
              :options="codes.RFND_RSON_CD"
              :label="t('MSG_TXT_RFND_RSON')"
              rules="required"
              :class="{ 'w289' : item.cshRfndDvCd !== '03' }"
            />

            <kw-input
              v-if="item.rfndDsbDvCd === '01'
                && item.cshRfndDvCd !== '03'"
              v-model="item.rfndRsonCn"
              :readonly="item.rfndRsonCd !== '56'"
              :label="t('MSG_TXT_RFND_RSON')"
              maxlength="300"
            />
          </kw-form-item>
          <!-- 승인일 -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '01'
              && item.cshRfndDvCd === '03'"
            :label="t('MSG_TXT_APR_D')"
          >
            <kw-date-range-picker
              v-if="item.rfndDsbDvCd === '01'
                && item.cshRfndDvCd === '03'"
              v-model:from="item.startDay"
              v-model:to="item.endDay"
              rules="date_range_months:1"
              :label="t('MSG_TXT_APR_D')"
            />
          </kw-form-item>
          <!-- 카드사/카드번호 -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '01'
              && item.cshRfndDvCd === '03'"
            :label="t('MSG_TXT_CDCO') + '/' + t('MSG_TXT_CARD_NO')"
          >
            <kw-select
              v-if="item.rfndDsbDvCd === '01'
                && item.cshRfndDvCd === '03'"
              v-model="item.cardRfndFnitCd"
              :options="cardLists"
              option-label="fnitNm"
              option-value="fnitCd"
              rules="required"
              :label="t('MSG_TXT_CDCO') + '/' + t('MSG_TXT_CARD_NO')"
            />
            <kw-input
              v-if="item.rfndDsbDvCd === '01'
                && item.cshRfndDvCd === '03'"
              v-model="item.cardRfndCrcdnoEncr"
              rules="required"
              type="number"
              :label="t('MSG_TXT_CDCO') + '/' + t('MSG_TXT_CARD_NO')"
            />
          </kw-form-item>
        </kw-form-row>
        <!-- 5번째 로우 시작 -->
        <kw-form-row
          v-if="item.rfndDsbDvCd === '01'
            && item.cshRfndDvCd === '03'"
        >
          <kw-form-item
            v-if="item.rfndDsbDvCd === '01'
              && item.cshRfndDvCd === '03'"
          >
            <!-- TODO: 화면에 그림만 있고 설명 없음. 무엇을 readonly로 표현하는지 확인 필요. -->
            <kw-input
              v-if="item.rfndDsbDvCd === '01'
                && item.cshRfndDvCd === '03'"
              readonly
            />
          </kw-form-item>
          <!-- 실 지급액(원) -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '01'
              && item.cshRfndDvCd === '03'"
            :label="t('MSG_TXT_ACL_DSB_AMT_WON')"
          >
            <kw-input
              v-if="item.rfndDsbDvCd === '01'
                && item.cshRfndDvCd === '03'"
              v-model="item.rfndDsbAmt"
              type="number"
            />
          </kw-form-item>
          <!-- 카드 공제액(%) -->
          <kw-form-item
            v-if="item.rfndDsbDvCd === '01'
              && item.cshRfndDvCd === '03'"
            :label="t('MSG_TXT_CARD_DDTN_AMT') + '(%)'"
          >
            <kw-input
              v-if="item.rfndDsbDvCd === '01'
                && item.cshRfndDvCd === '03'"
              v-model="item.cardRfndFer"
              type="number"
              @update:model-value="onCardRfndFer"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <!-- 전금에 전금구분이 제3자회원인 경우만 표시 -->
      <!-- TODO: 증빙자료 파일첨부 확장자 확인되지 않음 -->
      <kw-separator
        v-show="item.rfndDsbDvCd === '03' && item.bltfRfndMbDvCd === '02'"
      />
      <kw-action-top
        v-show="item.rfndDsbDvCd === '03' && item.bltfRfndMbDvCd === '02'"
        class="mb20"
      >
        <template #left>
          <!-- 증빙자료 -->
          <h3>{{ t('MSG_TXT_EVID_MTR') }}</h3>
        </template>
      </kw-action-top>
      <kw-form
        v-show="item.rfndDsbDvCd === '03' && item.bltfRfndMbDvCd === '02'"
        :cols="1"
      >
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_FILE_ATTH')"
          >
            <zwcm-file-attacher
              v-if="item.rfndDsbDvCd === '03' && item.bltfRfndMbDvCd === '02'"
              v-model="item.rfndEvidMtrFileId"
              attach-group-id="ATG_CMW_COMMON"
              :attach-document-id="item.rfndEvidMtrFileId"
              downloadable
              class="w780"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
    </div>
    <!-- 여기까지 반복 종료 -->

    <kw-separator />
    <h3>
      <!-- 예외환불 사유 -->
      <h3>{{ t('MSG_TXT_EX_RFND_RSON') }}</h3>
      <ul class="kw-notification">
        <li>
          환불 가능금액 보다 큰 금액이 신청되었습니다.
        </li>
      </ul>
    </h3>

    <kw-form :cols="2">
      <kw-form-row>
        <!-- 사유 -->
        <kw-form-item
          :label="t('MSG_TXT_RSN')"
          colspan="1"
        >
          <kw-input
            v-model="saveParams.exRfndRsonCn"
            maxlength="300"
            class="w780"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-action-top class="mb20">
      <template #left>
        <!-- 환불접수총액 -->
        <h3>{{ t('MSG_TXT_RFND_RCP_TAM') }}</h3>
      </template>
      <!-- (단위:원) -->
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <!--
    <kw-grid
      :visible-rows="1"
      @init="initGrid4"
    /> -->

    <table class="kw-table--normal">
      <colgroup>
        <col style="width: 25%;">
      </colgroup>
      <thead>
        <tr>
          <!-- 현금 환불금액 -->
          <th>{{ t('MSG_TXT_CSH_RFND_AMT') }}</th>
          <!-- 카드 환불금액 -->
          <th>{{ t('MSG_TXT_CARD_RFND_AMT') }}</th>
          <!-- 전금금액 -->
          <th>{{ t('MSG_TXT_BLTF_AMT') }}</th>
          <!-- 환불가능잔액 -->
          <th>{{ t('MSG_TXT_RFND_PSB_BLAM') }}</th>
          <!-- 총 환불 예상금액 -->
          <th>{{ t('MSG_TXT_TOT_RFND_ET_AMT') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-right">
            {{ saveParams.rfndCshAmt }}
          </td>
          <td class="text-right">
            {{ saveParams.rfndCardAmt }}
          </td>
          <td class="text-right">
            {{ saveParams.rfndBltfAmt }}
          </td>
          <td class="text-right">
            {{ saveParams.rfndPsbResAmt }}
          </td>
          <td class="text-right">
            {{ saveParams.totRfndEtAmt }}
          </td>
        </tr>
      </tbody>
    </table>
    <kw-separator />
    <h3 class="mb20">
      <!-- 처리정보 -->
      {{ t('MSG_TXT_PCS_INF') }}
    </h3>
    <kw-form>
      <kw-form-row>
        <!-- 수납일자 -->
        <kw-form-item
          :label="t('MSG_TXT_RVE_DT')"
          required
        >
          <kw-date-picker
            v-model="saveParams.rfndRveDt"
            rules="required"
          />
        </kw-form-item>
        <!-- 실적일자 -->
        <kw-form-item
          :label="t('MSG_TXT_PERF_DT')"
          required
        >
          <kw-date-picker
            v-model="saveParams.rfndPerfDt"
            rules="required"
          />
        </kw-form-item>
        <!-- 지급일자 -->
        <kw-form-item
          :label="t('MSG_TXT_DSB_DT')"
        >
          <kw-date-picker
            v-model="saveParams.rfndDsbDt"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 처리구분 -->
        <kw-form-item
          :label="t('MSG_TXT_PROCS_DV')"
          required
        >
          <kw-select
            v-model="saveParams.rfndStatCd"
            :options="codes.RFND_STAT_CD"
            rules="required"
            :label="t('MSG_TXT_PROCS_DV')"
          />
        </kw-form-item>
        <!-- 처리내용 -->
        <kw-form-item
          :label="t('MSG_TXT_PROCS_CN')"
        >
          <kw-input
            v-model="saveParams.rfndProcsCn"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <!-- 저장 -->
      <kw-btn
        primary
        :label="t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useGlobal, useModal, defineGrid, getComponentType, gridUtil, useDataService, modal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();

const { ok } = useModal();

const { confirm, notify } = useGlobal();

const props = defineProps({
  rfndStatCd: { type: String, required: false, default: '' },
  cntrNo: { type: String, required: false, default: '' },
  cntrSn: { type: String, required: false, default: '' },
  rfndRcpNo: { type: String, required: false, default: '' },
  rfndRcpDtlSn: { type: String, required: false, default: '' },
});

const { currentRoute } = useRouter();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const dataService = useDataService();
const grdPopRef11 = ref(getComponentType('KwGrid'));
const grdPopRef12 = ref(getComponentType('KwGrid'));
const grdPopRef13 = ref(getComponentType('KwGrid'));
const grdPopRef14 = ref(getComponentType('KwGrid'));
const popupRef2 = ref();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 5,
});

const codes = await codeUtil.getMultiCodes(
  // 'COD_PAGE_SIZE_OPTIONS',
  'RFND_STAT_CD', // 환불처리상태
  // 'CELL_TP_CD', // 주문유형 코드생성되어 있지 않음. 20230518
  'DP_TP_CD', // 이체구분
  // 'CTT_RS_CD', // 컨텍코드 코드생성되어 있지 않음. 20230518
  'ALNCMP_CD', // 제휴
  'COPN_DV_CD', // 고객유형: 1.개인, 2.법인
  'STLM_TP_CD', // 계약유형: 10.일시불, 20.할부
  'RFND_DSB_DV_CD', // 환불지급구분코드 01.현금환불, 02.카드환불, 03.전금
  'CSH_RFND_DV_CD', // 현금환불구분코드 01.선환불, 02.일반환불, 03.카드현금
  'RFND_AC_DV_CD', // 환불계좌구분코드 01.기입금 계좌, 02.신규 계좌
  'CSH_RFND_ADRS_DV_CD', // 현금환불수취인구분코드 01.본인, 02.가족, 03.실입금자, 04.제3자, 05.대표자
  'RFND_RSON_CD', // 환불사유코드
  'BLTF_RFND_MB_DV_CD', // 회원구분: 전금환불회원구분코드 01.교원키 동일회원, 02.제3자 회원
  'BLTF_RFND_DV_CD', // 전금구분: 전금환불구분코드 01 현금전금 02 카드전금

);

const ctract = ref({
// 계약정보
  cntrNo: '', // 계약번호
  sellTpCd: '', // codes.CELL_TP_CD, // 주문유형 // 코드
  cstKnm: '', // 고객명
  istllKnm: '', // 설치자명
  pdNm: '', // 상품명
  cntrCstNo: '', // 고객번호
  bryyMmdd: '', // 생년월일
  dpTpCd: '', // codes.DP_TP_CD, // 이체구분
  mpyBsdt: '', // 이체일
  cttRsCd: '', // codes.CTT_RS_CD, // 컨텍코드
  rentalAmt: '', // 렌탈(개월)
  rentalPtrm: '', // 개월
  alncmpCd: '', // codes.ALNCMP_CD, // 제휴
  rentalRgstCost: '', // 등록비용
  dutyUseMcn: '', // 의무약정
  istDt: '', // 설치일자
  slDt: '', // 매출일자 (EDU 시: '', WELLS 테이블 다름)
  cntrCanDtm: '', // 취소일자
  cntrCnfmDtm: '', // 완료일자
});

// 환불신청 출력부분
const app = ref({
  rfndRcpNo: '', // 환불접수번호
  rfndRcpDtlSn: '', // 환불접수일련번호
  rfndDsbDvCd: '', // 환불구분
  rfndDsbDvCdCshBltf: '', // 전금구분
  bltfRfndMbDvCd: '', // 전금환불회원구분코드
  pdNm: '', // 상품명
  bltfBfVacNoEncr: '', // 전금이전가상계좌번호암호화
  bltfAfVacNoEncr: '', // 전금이후가상계좌번호암호화
  rfndAkAmt: '', // 환불요청금액
  rfndRsonCn: '', // 전금사유

});

// 환불신청 저장값
const saveParams = ref({
  details: [{
    rfndRcpNo: '', // 환불접수번호
    rfndRcpDtlSn: '',
    rveNo: '', // 수납상세.수납번호
    rfndDvCd: '02', // 환불구분: 01.전체환불, 02.부분환불
    rfndDsbDvCd: '01', // 환불구분. 환불지급구분코드 01.현금환불, 02.카드환불, 03.전금
    cshRfndDvCd: '01', // 현금환불 구분. 현금환불구분코드 01.선환불, 02.일반환불, 03.카드현금
    rfndAcDvCd: '01', // 환불계좌 구분. 환불계좌구분코드 01.기입금 계좌, 02.신규 계좌
    cshRfndFnitCd: '', // 지급은행
    cshRfndAcnoEncr: '', // 계좌번호
    cshRfndAcownNm: '', // 예금주
    cshRfndAdrsDvCd: '', // 수취인
    cshRfndDlgpsNm: '', // 대표자 확인
    startDay: now.format('YYYYMMDD'), // 승인일 시작
    endDay: now.format('YYYYMMDD'), // 승인일 종료
    rfndAkAmt: 0, // 환불신청금액, 전금 요청금액(원)
    rfndDsbAmt: 0, // 실지급액 (원)
    rfndRsonCd: '', // 환불사유 코드

    cardRfndFnitCd: '', // 카드구분
    cardRfndCrcdnoEncr: '', // 카드번호
    cardRfndFer: 0, // 카드 공제액
    rfndRsonCn: '', // 기타 환불사유 입력란

    bltfRfndDvCd: '01', // 전금구분
    bltfRfndMbDvCd: '01', // 회원구분
    bltfOjCntrSn: '', // 전금할 고객번호
    bltfBfVacNoEncr: '', // 전금전 가상계좌
    bltfAfVacNoEncr: '', // 전금후 가상계좌
    rfndEvidMtrFileId: '', // 증빙자료 파일첨부

    rfndFshDt: '', // 지급일자2
  }],
  rfndRcpNo: '', // 환불접수번호
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  cstNo: '', // 고객번호
  exRfndRsonCn: '', // 예외환불 사유
  rfndCshAmt: 0, // 현금 환불금액
  rfndCardAmt: 0, // 카드 환불금액
  rfndBltfAmt: 0, // 전금 금액
  rfndPsbResAmt: 0, // 환불가능 잔액
  totRfndEtAmt: 0, // 총환불가능 잔액

  rfndRveDt: '', // 수납일자
  rfndPerfDt: '', // 실적일자
  rfndDsbDt: '', // 지급일자
  rfndFshDt: '', // 지급일자2
  // RFND_FSH_DT // 지급일자 입력할때만 사용하고, BASE, DETAIL 둘다 입력
  rfndStatCd: '', // 처리구분 (반려, 승인)
  rfndProcsCn: '', // 처리내용

});

// 카드, 은행 구분 목록
const cardLists = ref([]);
const bankLists = ref([]);

// 신청정보 그리드
async function fetchData() {
  const response = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/detail/partner', { params: { rfndRcpNo: props.rfndRcpNo } });
  const partner = response.data;

  const view = grdPopRef11.value.getView();

  view.getDataSource().setRows(partner);
  view.resetCurrent();
}

// 계약정보, 환불신청, 처리정보
async function fetchData2() {
  console.log('props', props);
  const response = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/detail/basic', { params: { cntrNo: props.cntrNo, cntrSn: props.cntrSn, rfndRcpNo: props.rfndRcpNo, rfndRcpDtlSn: props.rfndRcpDtlSn } });
  ctract.value = response.data.ctract; // 계약정보
  app.value = response.data.app; // 환불신청
  console.log('ctract', ctract);
  console.log('app', app);
}

// 컨텍트조회 팝업 버튼
async function onClickContect() {
  console.log('콘택조회');
  const { cntrNo } = props;
  await modal({
    component: 'WwwdbRefundApplicationConnectHistoryP',
    componentProps: { cntrNo }, // 템플릿을 그리드 기준으로 작성해서 만듬
  });
}

const refundPossibleAmnt = ref({
  thmDpAmt: 0, // 당월 입금액
  lstmmDlqAmt: 0, // 전월 연체금액
});

// 환불가능금액 그리드
async function fetchData3() {
  const response = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/detail/possible', { params: { cntrNo: props.cntrNo, cntrSn: props.cntrSn } });
  const possible = response.data;
  refundPossibleAmnt.value.thmDpAmt = response.data.thmDpAmt;
  refundPossibleAmnt.value.lstmmDlqAmt = response.data.lstmmDlqAmt;

  const view = grdPopRef12.value.getView();

  view.getDataSource().setRows(possible);
  view.resetCurrent();
}

// 상세입금조회 그리드
async function fetchData4() {
  const response = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/detail/deposit', { params: { cntrNo: props.cntrNo, cntrSn: props.cntrSn } });
  const deposit = response.data;

  const view = grdPopRef13.value.getView();

  view.getDataSource().setRows(deposit);
  view.resetCurrent();
}

// 엑셀다운로드
async function onClickExcelDownload1() {
  const view = grdPopRef13.value.getView();

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/detail/deposit/excel-download', { params: { cntrNo: props.cntrNo, cntrSn: props.cntrSn } });

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_DTL_DP_INQR')}`, // 상세입금조회
    timePostfix: true,
    exportData: res.data,
  });
}

// 매출실적조회 그리드
async function fetchData5() {
  const response = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/detail/performance', { params: { cntrNo: props.cntrNo, cntrSn: props.cntrSn } });
  const performance = response.data;

  const view = grdPopRef14.value.getView();

  view.getDataSource().setRows(performance);
  view.resetCurrent();
}

// 엑셀다운로드
async function onClickExcelDownload2() {
  const view = grdPopRef14.value.getView();

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/detail/performance/excel-download', { params: { cntrNo: props.cntrNo, cntrSn: props.cntrSn } });

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_SL_PERF_INQR')}`, // 매출실적조회
    timePostfix: true,
    exportData: res.data,
  });
}

// 환불신청
async function fetchData6() {
  console.log('fetchData6');
  // 환불신청, 예외환불사유, 환불접수총액, 처리정보
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/status/refund-application-info', { params: { rfndRcpNo: props.rfndRcpNo } });

  saveParams.value = res.data.basic;
  saveParams.value.details = res.data.details;
  console.log('res.data', res.data);
  console.log('saveParams.value', saveParams.value);
}
// 은행, 카드사 조회
async function bankCard() {
  const bank = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/reg/bank');
  bankLists.value = bank.data;
  const card = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/reg/card');
  cardLists.value = card.data;
}

// 환불신청 > 전금 > 고객 번호
async function onClickCstSearch2() {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
  });
  if (result) {
    saveParams.value.details.bltfOjCntrSn = payload.cstNo;
  }
}

async function onClickAdd() {
  if (saveParams.value.details.length >= 5) { return notify('더 이상 추가할 수 없습니다.'); }
  saveParams.value.details.push({
    rveNo: saveParams.value.details[0].rveNo, // 수납상세.수납번호
    rfndDvCd: saveParams.value.details[0].rfndDvCd, // 환불구분: 01.전체환불, 02.부분환불
    rfndDsbDvCd: '01', // 환불구분. 환불지급구분코드 01.현금환불, 02.카드환불, 03.전금
    cshRfndDvCd: '01', // 현금환불 구분. 현금환불구분코드 01.선환불, 02.일반환불, 03.카드현금
    rfndAcDvCd: '01', // 환불계좌 구분. 환불계좌구분코드 01.기입금 계좌, 02.신규 계좌
    cshRfndFnitCd: '', // 지급은행
    cshRfndAcnoEncr: '', // 계좌번호
    cshRfndAcownNm: '', // 예금주
    cshRfndAdrsDvCd: '', // 수취인
    cshRfndDlgpsNm: '', // 대표자 확인
    startDay: now.format('YYYYMMDD'), // 승인일 시작
    endDay: now.format('YYYYMMDD'), // 승인일 종료
    rfndAkAmt: 0, // 환불신청금액, 전금 요청금액(원)
    rfndDsbAmt: 0, // 실지급액 (원)

    cardRfndFnitCd: '', // 카드구분
    cardRfndCrcdnoEncr: '', // 카드번호
    cardRfndFer: 0, // 카드 공제액
    rfndRsonCn: '', // 기타 환불사유 입력란

    bltfRfndDvCd: '01', // 전금구분
    bltfRfndMbDvCd: '01', // 회원구분
    bltfBfVacNoEncr: '', // 전금전 가상계좌
    bltfAfVacNoEncr: '', // 전금후 가상계좌
    rfndEvidMtrFileId: '', // 증빙자료 파일첨부
  });
  console.log('saveParams.value.details', saveParams.value.details);
}

async function onClickDel(i) {
  saveParams.value.details.splice(i, 1);
}

// 환불접수총액 계산
async function onRefundReceiptTotalAmount() {
  let sum1 = 0;
  let sum2 = 0;
  let sum3 = 0;
  let sum4 = 0;
  let sum5 = 0;
  for (let i = 0; i < saveParams.value.details.length; i += 1) {
    if (saveParams.value.details[i].rfndDsbDvCd === '01') {
      sum1 += Number(saveParams.value.details[i].rfndAkAmt);
    }
    // sum2 += Number(saveParams.value.details[i].?);
    sum2 += 0;
    if (saveParams.value.details[i].rfndDsbDvCd === '03') {
      sum3 += Number(saveParams.value.details[i].rfndAkAmt);
    }
  }
  sum4 = sum1 + sum2 + sum3;
  sum5 = sum1 + sum2 + sum3;
  saveParams.value.rfndCshAmt = sum1; // 현금 환불금액 = 환불신청.환불신청금액 saveParams.rfndAkAmt
  saveParams.value.rfndCardAmt = sum2;// 카드 환불금액
  saveParams.value.rfndBltfAmt = sum3;// 전금금액 = 전금요청금액 saveParams.rfndAkAmt
  saveParams.value.rfndPsbResAmt = sum4; // 환불가능 잔액. 일단 현금환불금액 + 카드환불금액 + 전금 금액을 총 환불 예상금액을 표시
  saveParams.value.totRfndEtAmt = sum5; // 총환불가능 잔액. 일단 현금환불금액 + 카드환불금액 + 전금 금액을 총 환불 예상금액을 표시
}

// 카드공제액 계산
async function onCardRfndFer() {
  for (let i = 0; i < saveParams.value.details.length; i += 1) {
    saveParams.value.details[i].rfndDsbAmt = saveParams.value.details[i].rfndAkAmt
     - (saveParams.value.details[i].rfndAkAmt * (saveParams.value.details[i].cardRfndFer / 100));
  }
}

// 저장
async function onClickSave() {
  if (!await confirm(t('MSG_ALT_IS_SAV_DATA'))) { return; }
  // if (await popupRef1.value.alertIfIsNotModified()) { return; }
  // if (!await popupRef1.value.validate()) { return; }
  // rfndRcpNo: '', // 환불접수번호
  //   rfndRcpDtlSn: '',
  saveParams.value.rfndFshDt = saveParams.value.rfndDsbDt;
  const basic = cloneDeep(saveParams.value);
  const details = cloneDeep(saveParams.value.details);
  for (let i = 0; i < saveParams.value.details.length; i += 1) {
    saveParams.value.details[i].rfndRcpNo = props.rfndRcpNo;
    saveParams.value.details[i].rfndFshDt = saveParams.value.rfndFshDt;
  }
  // cachedParams = {
  //   basic,
  //   details,
  // };
  console.log('basic', basic);
  console.log('details', details);
  await dataService.post('/sms/wells/withdrawal/idvrve/refund-applications/status/refund-application-info', { basic, details });
  ok();
}

onMounted(async () => {
  await fetchData();
  await fetchData2();
  await fetchData3();
  await fetchData4();
  await fetchData5();
  await bankCard();
  await fetchData6();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridPop11 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'prtnrKnm' }, // 신청자
    { fieldName: 'rfndRcpPrtnrNo' }, // 번호
    { fieldName: 'rfndRqdt' }, // 신청일시
    { fieldName: 'rfndStatCd' }, // 처리상태

  ];

  const columns = [
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_APPL_USER'), width: '350' }, // 신청자
    { fieldName: 'rfndRcpPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '350', styleName: 'text-center' }, // 번호
    { fieldName: 'rfndRqdt', header: t('MSG_TXT_APPL_DTM'), width: '350', styleName: 'text-center', datetimeFormat: 'date' }, // 신청일시
    { fieldName: 'rfndStatCd', header: t('MSG_TXT_PROCS_STAT'), width: '350', options: codes.RFND_STAT_CD }, // 처리상태

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});

// 환불가능금액
const initGridPop12 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dpAggAmt', dataType: 'number' }, // 총입금 누계금액, 입금누계금액
    { fieldName: 'dpAggAmt2', dataType: 'number' }, // 총입금 누계금액, 입금누계금액
    { fieldName: 'lstmmDlqAmt', dataType: 'number' }, // 전월 연체금액
    { fieldName: 'thmPrpdAmt', dataType: 'number' }, // 당월 선수금액
    { fieldName: 'thmDlqAmt', dataType: 'number' }, // 당월 연체금액
    { fieldName: 'thmDpAmt', dataType: 'number' }, // 당월 입금액
    { fieldName: 'rfndPsbAmt', dataType: 'number' }, // 환불가능금액

  ];

  const columns = [
    { fieldName: 'dpAggAmt', header: t('MSG_TXT_TOT_DP_AGG_AMT'), width: '200', styleName: 'text-right' }, // 총입금 누계금액, 입금누계금액
    { fieldName: 'dpAggAmt2', header: t('MSG_TXT_DP_AGG_AMT'), width: '200', styleName: 'text-right' }, // 총입금 누계금액, 입금누계금액
    { fieldName: 'lstmmDlqAmt', header: t('MSG_TXT_LSTMM_DLQ_AMT'), width: '200', styleName: 'text-right' }, // 전월 연체금액
    { fieldName: 'thmPrpdAmt', header: t('MSG_TXT_THM_PRPD_AMT'), width: '200', styleName: 'text-right' }, // 당월 선수금액
    { fieldName: 'thmDlqAmt', header: t('MSG_TXT_THM_DLQ_AMT'), width: '200', styleName: 'text-right' }, // 당월 연체금액
    { fieldName: 'thmDpAmt', header: t('MSG_TXT_RFND_PSB_AMT'), width: '200', styleName: 'text-right' }, // 당월 입금액
    { fieldName: 'rfndPsbAmt', header: t('MSG_TXT_THM_DP_AMT'), width: '200', styleName: 'text-right' }, // 환불가능금액

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});

// 상세입금조회
const initGridPop13 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'rveSn' }, // 입금일련번호
    { fieldName: 'dpDt', dataType: 'date' }, // 입금일자
    { fieldName: 'perfDt', dataType: 'date' }, // 실적일자
    { fieldName: 'rfndFshDt', dataType: 'date' }, // 지급일자
    { fieldName: 'dpDvCd' }, // 입금구분
    { fieldName: 'dpAmt', dataType: 'number' }, // 처리금액
    { fieldName: 'dpTpCd' }, // 입금유형
    { fieldName: 'cshCrd' }, // 카드현금구분
    { fieldName: 'fnitNm' }, // 카드사, 은행
    { fieldName: 'crcdnoEncr' }, // 카드번호
    { fieldName: 'crdcdAprno' }, // 승인번호
    { fieldName: 'crdcdIstmMcn' }, // 할부개월수
    { fieldName: 'fnitNm2' }, // 카드사, 은행
    { fieldName: 'acnoEncr' }, // 계좌번호
    { fieldName: 'dprNm' }, // 입금자

  ];

  const columns = [
    { fieldName: 'rveSn', header: t('MSG_TXT_DP_RLTD_NO'), width: '117' },
    { fieldName: 'dpDt', header: t('MSG_TXT_DP_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'perfDt', header: t('MSG_TXT_PERF_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'rfndFshDt', header: t('MSG_TXT_DSB_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'dpDvCd', header: t('MSG_TXT_DP_DV'), width: '100' },
    { fieldName: 'dpAmt', header: `${t('MSG_TXT_PROCS_AMT')}(${t('MSG_TXT_CUR_WON')})`, width: '140', styleName: 'text-right' },
    { fieldName: 'dpTpCd', header: t('MSG_TXT_DP_TP'), width: '100' },
    {
      fieldName: 'cshCrd',
      header: `${t('MSG_TXT_CARD')}/${t('MSG_TXT_CSH_DV')}`,
      width: '100',
      displayCallback(grid, index) {
        const { cshCrd } = gridUtil.getRowValue(grid, index.dataRow);
        if (cshCrd === '01') {
          return t('MSG_TXT_CASH');
        }
        if (cshCrd === '02') {
          return t('MSG_TXT_CARD');
        }
      },
    },
    {
      fieldName: 'fnitNm',
      header: t('MSG_TXT_CDCO'),
      width: '100',
      displayCallback(grid, index) {
        const { cshCrd, fnitNm } = gridUtil.getRowValue(grid, index.dataRow);
        if (cshCrd === '02') {
          return `${fnitNm}`;
        }
      },
    },
    { fieldName: 'crcdnoEncr',
      header: t('MSG_TXT_CARD_NO'),
      width: '180',
      displayCallback(grid, index) {
        const { crcdnoEncr } = gridUtil.getRowValue(grid, index.dataRow);
        if (crcdnoEncr.length > 13) {
          return `${crcdnoEncr.substring(0, 4)}
          -${crcdnoEncr.substring(4, 8)}-${crcdnoEncr.substring(8, 12)}-${crcdnoEncr.substring(12, 16)}`;
        }
        return crcdnoEncr;
      },
    },
    { fieldName: 'crdcdAprno', header: t('MSG_TXT_APR_NO'), width: '100' },
    { fieldName: 'crdcdIstmMcn', header: t('MSG_TXT_ISTM_MCN'), width: '100' },
    { fieldName: 'fnitNm2',
      header: t('MSG_TXT_BNK'),
      width: '102',
      displayCallback(grid, index) {
        const { cshCrd, fnitNm } = gridUtil.getRowValue(grid, index.dataRow);
        if (cshCrd === '01') {
          return `${fnitNm}`;
        }
      },
    },
    { fieldName: 'acnoEncr', header: t('MSG_TXT_AC_NO'), width: '180' },
    { fieldName: 'dprNm', header: t('MSG_TXT_DPR'), width: '102' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

// 매출실적조회
const initGridPop14 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'slClYm' }, // 매출년월
    { fieldName: 'slStpYn' }, // 매출중지
    { fieldName: 'tmp1' }, // 리스차월
    { fieldName: 'nomSlAmt', dataType: 'number' }, // 청구금액
    { fieldName: 'borAmt', dataType: 'number' }, // 위약금액
    { fieldName: 'fnnLeasePcamTam', dataType: 'number' }, // 리스입금액
    { fieldName: 'prpdSlAmt', dataType: 'number' }, // 선수금액
    { fieldName: 'totPcamUcAmt', dataType: 'number' }, // 미수금액
    { fieldName: 'thmDlqRfndSumAmt', dataType: 'number' }, // 연체금액
    { fieldName: 'dlqMcn' }, // 연체개월
    { fieldName: 'btdDlqAmt', dataType: 'number' }, // 기초금액
    { fieldName: 'thmOcDlqAmt', dataType: 'number' }, // 발생금액
    { fieldName: 'tmp2' }, // 공제금액
    { fieldName: 'thmIstmTotDpAmt', dataType: 'number' }, // 입금액
    { fieldName: 'thmIstmRfndAmt', dataType: 'number' }, // 환불금액
    { fieldName: 'eotPcamBlam', dataType: 'number' }, // 기말금액

  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '118', styleName: 'text-center' },
    { fieldName: 'slClYm', header: t('MSG_TXT_SL_YM'), width: '120', styleName: 'text-center' },
    { fieldName: 'slStpYn', header: t('MSG_TXT_SL_STP'), width: '80', styleName: 'text-center' },
    { fieldName: 'tmp1', header: t('MSG_TXT_LEASE_NMN'), width: '80', styleName: 'text-center' },
    { fieldName: 'nomSlAmt', header: t('MSG_TXT_BIL_AMT'), width: '104', styleName: 'text-right' },

    { fieldName: 'borAmt', header: t('MSG_TXT_BOR_AMT'), width: '104', styleName: 'text-right' },
    { fieldName: 'fnnLeasePcamTam', header: t('MSG_TXT_LEASE_DP_AMT'), width: '104', styleName: 'text-right' },
    { fieldName: 'prpdSlAmt', header: t('MSG_TXT_PRPD_AMT'), width: '104', styleName: 'text-right' },
    { fieldName: 'totPcamUcAmt', header: t('MSG_TXT_UC_AMT'), width: '104', styleName: 'text-right' },
    { fieldName: 'thmDlqRfndSumAmt', header: t('MSG_TXT_DLQ_AMT'), width: '104', styleName: 'text-right' },

    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '80' },
    { fieldName: 'btdDlqAmt', header: t('MSG_TXT_BTD_AMT'), width: '80', styleName: 'text-right' },
    { fieldName: 'thmOcDlqAmt', header: t('MSG_TXT_OCCR_AMT'), width: '80', styleName: 'text-right' },
    { fieldName: 'tmp2', header: t('MSG_TXT_DDCTAM'), width: '80', styleName: 'text-right' },
    { fieldName: 'thmIstmTotDpAmt', header: t('MSG_TXT_DEPOSIT_AMT'), width: '80', styleName: 'text-right' },

    { fieldName: 'thmIstmRfndAmt', header: t('MSG_TXT_RFND_AMT'), width: '80', styleName: 'text-right' },
    { fieldName: 'eotPcamBlam', header: t('MSG_TXT_EOT_AMT'), width: '80', styleName: 'text-right' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
