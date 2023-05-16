<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID :  WwwdbRefundApplicationRegP - 웰스환불 환불신청 팝업 W-WD-U-0108P01
3. 작성자 : sonkiseok
4. 작성일 : 2023.05.12
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- PGE_WDB_00060
- 수납 > 환불업무 > 환불신청 관리 > 환불신청
- 환불신청 등록
****************************************************************************************************
--->
<template>
  <!-- title="환불신청" -->
  <kw-popup
    ref="popupRef1"
    size="3xl"
  >
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 계약/취소일자 -->
        <kw-form-item
          :label="t('MSG_TXT_CNTRCT') + '/' + t('MSG_TXT_CANC_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.cntrStartDay"
            v-model:to="searchParams.cntrEndDay"
            rules="date_range_months:1"
            :label="t('MSG_TXT_RCPDT')"
          />
        </kw-form-item>
        <!-- 고객유형 -->
        <kw-form-item
          :label="t('MSG_TXT_CST_TYPE')"
        >
          <kw-option-group
            v-model="searchParams.copnDvCd"
            type="radio"
            :options="codes.COPN_DV_CD"
          />
        </kw-form-item>
        <!-- 계약유형 -->
        <kw-form-item
          :label="t('MSG_TXT_CONTR_TYPE')"
        >
          <kw-option-group
            v-model="searchParams.stlmTpCd"
            type="radio"
            :options="codes.STLM_TP_CD"
          />
        </kw-form-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 계약상세번호 -->
        <kw-form-item
          :label="t('MSG_TXT_CNTR_DTL_NO')"
        >
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            :name="$t('MSG_TXT_CNTR_DTL_NO')"
            @selected="onClickSelectCntrno"
          />
        </kw-form-item>
        <!-- 고객번호 -->
        <kw-search-item
          :label="t('MSG_TXT_CST_NO')"
        >
          <kw-input
            v-model="searchParams.cntrCstNo"
            icon="search"
            clearable
            maxlength="20"
            :label="$t('MSG_TXT_CST_NO')"
            @click-icon="onClickCstSearch"
          />
        </kw-search-item>
        <!-- 사업자번호 -->
        <kw-search-item
          :label="t('MSG_TXT_ENTRP_NO')"
        >
          <kw-input
            v-model="searchParams.bzrno"
            maxlength="10"
            type="number"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <ul class="kw-notification">
      <li>
        계약상세번호, 고객번호, 사업자번호 중 1가지항목 입력 후 조회 가능합니다.
      </li>
    </ul>
    <!-- 계약상세 -->
    <h3 class="mb20">
      {{ t('MSG_TXT_CNTR_DTL') }}
    </h3>

    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          @change="fetchData"
        />
        <!-- 단위:원 -->
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <!-- 엑셀다운로드 -->
      <kw-btn
        icon="download_on"
        dense
        secondary
        :disable="pageInfo.totalCount === 0"
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdPopRef1"
      name="grdPop1"
      :visible-rows="pageInfo.pageSize - 1"
      @init="initPopGrid1"
    />
    <kw-separator />
    <!-- 환불구분 -->
    <h3 class="mb20">
      {{ t('MSG_TXT_CLSF_REFUND') }}
    </h3>

    <kw-form>
      <kw-form-row>
        <kw-form-item
          :label="t('MSG_TXT_CLSF_REFUND')"
        >
          <kw-option-group
            v-model="saveParams.details[0].rfndDvCd"
            type="radio"
            :options="codes.RFND_DV_CD"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />

    <kw-action-top class="mb20">
      <template #left>
        <!-- 환불가능금액 -->
        <h3>{{ t('MSG_TXT_REFUND_AMT') }}</h3>
      </template>
      <!-- (단위:원,개월) -->
      <span class="kw-fc--black3 text-weight-regular">{{ t('MSG_TXT_UNIT_WON_MCN') }}</span>
    </kw-action-top>

    <div class="row items-center">
      <div class="col">
        <!-- 주문 금액 -->
        <h3 class="mt0 mb20">
          {{ t('MSG_TXT_ORDR_AMT') }}
        </h3>
        <kw-form
          dense
          :cols="1"
        >
          <kw-form-row>
            <kw-form-item
              :label="t('MSG_TXT_SUBSC_AMT')"
            >
              <p>{{ Number(refundPossibleAmount.orderCntrAmt).toLocaleString() }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="t('MSG_TXT_CRP_UC_AMT')"
            >
              <p>{{ Number(refundPossibleAmount.orderCrpUcAmt).toLocaleString() }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="t('MSG_TXT_MM_ISTM_AMT')"
            >
              <p>
                {{ Number(refundPossibleAmount.orderMmIstmAmt).toLocaleString() }}
                ({{ Number(refundPossibleAmount.orderIstmMcn).toLocaleString() }})
              </p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="t('MSG_TXT_CRTL_NMN_N')"
            >
              <p>{{ Number(refundPossibleAmount.orderBilNo).toLocaleString() }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <kw-form-item
              :label="t('MSG_BTN_DLQ_INF')"
            >
              <p>
                {{ Number(refundPossibleAmount.orderDlqMcn).toLocaleString() }}
                ({{ Number(refundPossibleAmount.orderDlqBilAmt).toLocaleString() }})
              </p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
      </div>
      <div class="col ml80">
        <!-- 입금 금액 -->
        <h3 class="mt0 mb20">
          {{ t('MSG_TXT_DP_AMT') }}
        </h3>
        <kw-form
          dense
          :cols="1"
        >
          <kw-form-row>
            <!-- 청약/인수금액 -->
            <kw-form-item
              :label="t('MSG_TXT_SUBSC') + '/' + t('MSG_TXT_TK_AMT_TXT')"
            >
              <p>{{ refundPossibleAmount.depositSubscTkAmt }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 법인미수금액 -->
            <kw-form-item
              :label="t('MSG_TXT_CRP_UC_AMT')"
            >
              <p>{{ refundPossibleAmount.depositCrpUcAmt }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 할부금액 -->
            <kw-form-item
              :label="t('MSG_TXT_ISTM_AMT')"
            >
              <p>{{ refundPossibleAmount.depositIstmAmt }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 선수금액 -->
            <kw-form-item
              :label="t('MSG_TXT_PRPD_AMT')"
            >
              <p>{{ refundPossibleAmount.depositPrpdAmt }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 입금액 -->
            <kw-form-item
              :label="t('MSG_TXT_DEPOSIT_AMT')"
            >
              <p>{{ refundPossibleAmount.depositDpAmt }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
      </div>
      <div class="col ml80">
        <!-- 환불 가능 금액 -->
        <h3 class="mt0 mb20">
          {{ t('MSG_TXT_RFND_PSB_AMT') }}
        </h3>
        <kw-form
          dense
          :cols="1"
        >
          <kw-form-row>
            <!-- 청약/인수금액 -->
            <kw-form-item :label="t('MSG_TXT_SUBSC') + '/' + t('MSG_TXT_TK_AMT_TXT')">
              <p>{{ refundPossibleAmount.refundSubscTkAmt }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 법인미수금액 -->
            <kw-form-item :label="t('MSG_TXT_CRP_UC_AMT')">
              <p>{{ refundPossibleAmount.refundCrpUcAmt }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 할부금액 -->
            <kw-form-item :label="t('MSG_TXT_ISTM_AMT')">
              <p>{{ refundPossibleAmount.refundIstmAmt }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 선수금액 -->
            <kw-form-item :label="t('MSG_TXT_PRPD_AMT')">
              <p>{{ refundPossibleAmount.refundPrpdAmt }}</p>
            </kw-form-item>
          </kw-form-row>
          <kw-form-row>
            <!-- 환불가능금액 -->
            <kw-form-item :label="t('MSG_TXT_REFUND_AMT')">
              <p>{{ refundPossibleAmount.refundRfndPsbAmt }}</p>
            </kw-form-item>
          </kw-form-row>
        </kw-form>
      </div>
    </div>

    <!-- 반복시작 -->
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
        <kw-btn
          :style="`${i === 0 ? 'display:none' : ''}`"
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
    <kw-action-top class="mb20">
      <template #left>
        <!-- 예외환불 사유 -->
        <h3>{{ t('MSG_TXT_EX_RFND_RSON') }}</h3>
        <ul class="kw-notification ml8">
          <!-- 환불 가능금액 보다 큰 금액이 신청되었습니다. -->
          <li>
            환불 가능금액 보다 큰 금액이 신청되었습니다.
          </li>
        </ul>
      </template>
    </kw-action-top>
    <kw-form :cols="1">
      <kw-form-row>
        <!-- 사유 -->
        <kw-form-item
          :label="t('MSG_TXT_RSN')"
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

    <!-- <kw-grid
      ref="grdPopRef2"
      name="grdPop2"
      :visible-rows="1"
      @init="initPopGrid2"
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
    <!-- 환불상태코드가 없으면, 처리정보는 보이지 않고
          환불상태코드가 있으면, 처리정보를 보이게한다.  -->
    <h3
      v-show="props.rfndStatCd !== ''"
      class="mb20"
    >
      <!-- 처리정보 -->
      {{ t('MSG_TXT_PCS_INF') }}
    </h3>
    <kw-grid
      v-show="props.rfndStatCd !== ''"
      ref="grdPopRef3"
      name="grdPop3"
      :visible-rows="1"
      @init="initPopGrid3"
    />
    <!-- 환불상태코드가 없으면, 신청만 노출
          환불상태코드가 01.접수 면, 삭제, 저장을 노출.  -->
    <template #action>
      <!-- 삭제 -->
      <kw-btn
        v-if="props.rfndStatCd === '01'"
        negative
        :label="t('MSG_BTN_DEL')"
        @click="onClickDelete"
      />
      <!-- 저장 -->
      <kw-btn
        v-if="props.rfndStatCd === '01'"
        primary
        :label="t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
      <!-- 신청 -->
      <kw-btn
        v-if="props.rfndStatCd === ''"
        primary
        :label="t('MSG_BTN_APPL')"
        @click="onClickApply"
      />
    </template>
  </kw-popup>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useMeta, codeUtil, defineGrid, getComponentType, gridUtil, useGlobal, useDataService, useModal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import ZwcmFileAttacher from '~common/components/ZwcmFileAttacher.vue';
import dayjs from 'dayjs';

const { ok } = useModal();
const now = dayjs();
// eslint-disable-next-line no-unused-vars
const { getConfig } = useMeta();
const dataService = useDataService();

const { t } = useI18n();

// eslint-disable-next-line no-unused-vars
const { alert, confirm, modal, notify } = useGlobal();

const props = defineProps({
  rfndStatCd: { type: String, required: false, default: '' },
  cntrNo: { type: String, required: false, default: '' },
  cntrSn: { type: String, required: false, default: '' },
  rfndRcpNo: { type: String, required: false, default: '' },
  rfndRcpDtlSn: { type: String, required: false, default: '' },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdPopRef1 = ref(getComponentType('KwGrid'));
// const grdPopRef2 = ref(getComponentType('KwGrid'));
const grdPopRef3 = ref(getComponentType('KwGrid'));
const popupRef1 = ref();

// 공통코드로딩
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'COPN_DV_CD', // 고객유형: 1.개인, 2.법인
  'STLM_TP_CD', // 계약유형: 10.일시불, 20.할부
  'RFND_DV_CD', // 환불구분: 1.전체환불, 2.부분환불
  'RFND_DSB_DV_CD', // 환불지급구분코드 01.현금환불, 02.카드환불, 03.전금
  'CSH_RFND_DV_CD', // 현금환불구분코드 01.선환불, 02.일반환불, 03.카드현금
  'RFND_AC_DV_CD', // 환불계좌구분코드 01.기입금 계좌, 02.신규 계좌
  'CSH_RFND_ADRS_DV_CD', // 현금환불수취인구분코드 01.본인, 02.가족, 03.실입금자, 04.제3자, 05.대표자
  'RFND_RSON_CD', // 환불사유코드
  'BLTF_RFND_MB_DV_CD', // 회원구분: 전금환불회원구분코드 01.교원키 동일회원, 02.제3자 회원
  'BLTF_RFND_DV_CD', // 전금구분: 전금환불구분코드 01 현금전금 02 카드전금
);

// 카드, 은행 구분 목록
// eslint-disable-next-line no-unused-vars
const cardLists = ref([]);
const bankLists = ref([]);

const searchParams = ref({
  cntrStartDay: now.add(-1, 'M').add(1, 'day').format('YYYYMMDD'), // 계약/취소일자 시작일 now.add(-30, 'day').format('YYYYMMDD') 1개월 이내로 하라고 에러뜸
  cntrEndDay: now.format('YYYYMMDD'), // 계약/취소일자 종료일
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  copnDvCd: '1', // 고객유형
  stlmTpCd: '10', // 계약유형(일시불, 할부)
  bzrno: '', // 사업자번호
  cntrCstNo: '', // 고객번호
  cstKnm: '', // 계약자명
  cntrCnfmDtm: '', // 계약일자
  rveDt: '', // 매출일자
  tmp1: '', // 환불가능금액. 확인필요

});

// 검색조건 : 계약상세번호
async function onClickSelectCntrno(cntrNo, cntrSn) {
  searchParams.value.cntrNo = cntrNo;
  searchParams.value.cntrSn = cntrSn;
}

let cachedParams;

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 5,
  // pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 계약상세 조회 준비
async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/reg/paging', { params: cachedParams });
  const { list: application, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdPopRef1.value.getView();
  view.getDataSource().setRows(application);
  view.resetCurrent();
}

// 계약상세 조회
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  // 계약상세번호, 고객번호, 사업자번호 중 1가지항목 입력 후 조회 가능합니다.
  // 개발 완료전까지 주석. 조회할때, 값 넣기 번거로움
  // if (
  //   isEmpty(searchParams.value.cntrNo)
  //   && isEmpty(searchParams.value.cntrSn)
  //   && isEmpty(searchParams.value.cntrCstNo)
  //   && isEmpty(searchParams.value.bzrno)
  // ) { return; }

  await fetchData();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdPopRef1.value.getView();

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/reg/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: popupRef1.value.pageCtxTitle,
    timePostfix: true,
    exportData: res.data,
  });
}

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
  // RFND_FSH_DT // 지급일자 입력할때만 사용하고, BASE, DETAIL 둘다 입력
  rfndStatCd: '', // 처리구분 (반려, 승인)
  rfndProcsCn: '', // 처리내용

});

// 환불가능금액
const refundPossibleAmount = ref({
  orderCntrAmt: 0, // 청약금액 = 계약상세.계약금액
  orderCrpUcAmt: 0, // 법인미수금액 = 계약상세.법인미수금액
  orderMmIstmAmt: 0, // 월할부금액_금액 = 계약상세.월할부금액
  orderIstmMcn: 0, // 월할부금액_개월 = 계약상세.할부개월수
  orderBilNo: 0, // 현재차월수
  orderDlqMcn: 0, // 연체개월
  orderDlqBilAmt: 0, // 연체금액
  depositSubscTkAmt: 0, // 입금금액.청약인수금액
  depositCrpUcAmt: 0, // 입금금액.법인미수금액
  depositIstmAmt: 0, // 입금금액.할부금액
  depositPrpdAmt: 0, // 입금금액.선수금액
  depositDpAmt: 0, // 입금금액.입금액
  refundSubscTkAmt: 0, // 환불가능금액.청약인수금액
  refundCrpUcAmt: 0, // 환불가능금액.법인미수금액
  refundIstmAmt: 0, // 환불가능금액.할부금액
  refundPrpdAmt: 0, // 환불가능금액.선수금액
  refundRfndPsbAmt: 0, // 환불가능금액.환불가능금액
});

// 은행, 카드사 조회
async function bankCard() {
  const bank = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/reg/bank');
  bankLists.value = bank.data;
  const card = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/reg/card');
  cardLists.value = card.data;
}

// 검색 > 고객번호
async function onClickCstSearch() {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
  });
  if (result) {
    searchParams.value.cntrCstNo = payload.cstNo;
  }
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

// 삭제
async function onClickDelete() {
  console.log('삭제');
  console.log('props.rfndRcpNo', props.rfndRcpNo);
  const data = cloneDeep(props.rfndRcpNo);
  console.log('data', data);
  await dataService.delete('/sms/wells/withdrawal/idvrve/refund-applications/status/refund-application-info', { params: { rfndRcpNo: props.rfndRcpNo } });
  ok();
}

// 저장
async function onClickSave() {
  if (!await confirm(t('MSG_ALT_IS_SAV_DATA'))) { return; }
  // if (await popupRef1.value.alertIfIsNotModified()) { return; }
  // if (!await popupRef1.value.validate()) { return; }
  // rfndRcpNo: '', // 환불접수번호
  //   rfndRcpDtlSn: '',
  const basic = cloneDeep(saveParams.value);
  const details = cloneDeep(saveParams.value.details);
  for (let i = 0; i < saveParams.value.details.length; i += 1) {
    saveParams.value.details[i].rfndRcpNo = props.rfndRcpNo;
  }
  // cachedParams = {
  //   basic,
  //   details,
  // };
  console.log('저장 saveParams.value', saveParams.value);
  console.log('basic', basic);
  console.log('details', details);
  await dataService.post('/sms/wells/withdrawal/idvrve/refund-applications/status/refund-application-info', { basic, details });
  ok();
}

// 신청
async function onClickApply() {
  console.log('saveParams', saveParams);
  console.log('신청 saveParams.value', saveParams.value);
  // if (!await alert(t('MSG_ALT_REQ_PRCD'))) return;
  if (!await confirm(t('MSG_ALT_REQ_PRCD'))) return;
  await dataService.post('/sms/wells/withdrawal/idvrve/refund-applications/reg/refund-possible-amount', { ...saveParams.value });
  ok();
  notify(t('MSG_ALT_SAVE_DATA'));
}

// 메인화면에서 그리드 환불상태 버튼 클릭해서 넘어왔을때
async function loadRefundApplication() {
  searchParams.value.cntrNo = props.cntrNo;
  searchParams.value.cntrSn = props.cntrSn;
  await onClickSearch();
  // 계약상세
  const res = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/reg/refund-possible-amount', { params: { cntrNo: props.cntrNo, cntrSn: props.cntrSn } });
  refundPossibleAmount.value = res.data;
  // 환불구분, 환불신청, 예외환불사유, 환불접수총액, 처리정보
  const res2 = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/status/refund-application-info', { params: { rfndRcpNo: props.rfndRcpNo } });

  saveParams.value = res2.data.basic;
  saveParams.value.details = res2.data.details;
}

onMounted(async () => {
  await bankCard();
  // if (props.rfndStatCd !== '') {
  //   await fetchData3();
  // }

  if (props.rfndStatCd !== '') {
    await loadRefundApplication();
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

// 계약상세 그리드
const initPopGrid1 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'stlmTpCd' }, // 계약유형
    { fieldName: 'copnDvCd' }, // 고객유형
    { fieldName: 'bzrno' }, // 사업자
    { fieldName: 'cntrCstNo' }, // 고객번호
    { fieldName: 'cstKnm' }, // 계약자명
    { fieldName: 'cntrCstNo2' }, // 번호
    { fieldName: 'cntrCnfmDtm', dataType: 'date' }, // 계약일자
    { fieldName: 'rveDt', dataType: 'date' }, // 매출일자
    { fieldName: 'cntrCanDtm', dataType: 'date' }, // 취소일자
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'fnlAmt', dataType: 'number' }, // 주문금액
    { fieldName: 'dpAmt', dataType: 'number' }, // 입금액
    { fieldName: 'tmp1', dataType: 'number' }, // 환불가능금액
    // RRD.DP_MES_CD                            /* 입금수단코드 01.현금, 02.신용카드, 05.전금 */
    { fieldName: 'dpMesCd' }, // 입금수단코드 01.현금, 02.신용카드, 05.전금
    { fieldName: 'rveNo' }, // 수납상세.수납번호

  ];

  const columns = [
    { // 계약상세번호
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '140',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = gridUtil.getRowValue(grid, index.dataRow);
        return `${cntrNo}-${cntrSn}`;
      },
    },
    { fieldName: 'stlmTpCd', header: t('MSG_TXT_CONTR_TYPE'), width: '117', options: codes.STLM_TP_CD }, // 계약유형
    { fieldName: 'copnDvCd', header: t('MSG_TXT_CST_TYPE'), width: '100', options: codes.COPN_DV_CD }, // 고객유형
    { // 사업자/고객번호
      fieldName: 'bzrno',
      header: `${t('MSG_TXT_ENTRPRNR')}/${t('MSG_TXT_CST_NO')}`,
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { bzrno, cntrCstNo } = gridUtil.getRowValue(grid, index.dataRow);
        if (!isEmpty(bzrno)) {
          return `${bzrno}`;
        }
        return `${cntrCstNo}`;
      },
    },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '100' }, // 계약자명
    { fieldName: 'cntrCstNo2', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' }, // 번호
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_CNTR_DATE'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 계약일자
    { fieldName: 'rveDt', header: t('MSG_TXT_SL_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 매출일자
    { fieldName: 'cntrCanDtm', header: t('MSG_TXT_CANC_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 취소일자
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '120' }, // 상품명
    { fieldName: 'fnlAmt', header: t('MSG_TXT_ORDR_AMT'), width: '150', styleName: 'text-right' }, // 주문금액
    { fieldName: 'dpAmt', header: t('MSG_TXT_DEPOSIT_AMT'), width: '150', styleName: 'text-right' }, // 입금액
    { fieldName: 'tmp1', header: t('MSG_TXT_REFUND_AMT'), width: '150', styleName: 'text-right' }, // 환불가능금액

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  // 선택한 행의 계약번호와 계약일련번호로 데이터 조회
  // 단, 2개이상 선택하는 경우 선택을 해제한다.
  view.onCellClicked = async (grid, { dataRow }) => {
    console.log(dataRow);
    // 선택한 row의 계약번호와 계약일련번호를 가지고와서 데이터 조회한다.
    const { cntrNo, cntrSn, cntrCstNo, rveNo } = gridUtil.getRowValue(grid, dataRow);
    const checkCount = view.getCheckedRows().length;
    if (checkCount > 1) {
      view.checkAll(false);
      return notify('1개이상 선택할 수 없습니다.');
    }
    if (checkCount === 1) {
      saveParams.value.cntrNo = cntrNo;
      saveParams.value.cntrSn = cntrSn;
      saveParams.value.cstNo = cntrCstNo;
      saveParams.value.details[0].rveNo = rveNo;
      const res = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/reg/refund-possible-amount', { params: { cntrNo, cntrSn } });
      refundPossibleAmount.value = res.data;
    }
  };

  view.onScrollToBottom = (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      fetchData();
    }
  };
});

// 처리정보 그리드
const initPopGrid3 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'rfndRveDt' },
    { fieldName: 'rfndPerfDt' },
    { fieldName: 'rfndFshDt' },
    { fieldName: 'rfndStatCd' },
    { fieldName: 'rfndProcsCn' },
  ];

  const columns = [
    { fieldName: 'rfndRveDt', header: t('MSG_TXT_RVE_DT'), width: '280', styleName: 'text-center' },
    { fieldName: 'rfndPerfDt', header: t('MSG_TXT_PERF_DT'), width: '280', styleName: 'text-center' },
    { fieldName: 'rfndFshDt', header: t('MSG_TXT_DSB_DT'), width: '280' },
    { fieldName: 'rfndStatCd', header: t('MSG_TXT_PROCS_DV'), width: '280', styleName: 'text-left' },
    { fieldName: 'rfndProcsCn', header: t('MSG_TXT_PROCS_CN'), width: '280' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});
</script>
