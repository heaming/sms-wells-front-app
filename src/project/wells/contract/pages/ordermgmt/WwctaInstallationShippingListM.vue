<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaInstallationShippingListM - 설치/배송 조회(W-SS-U-0099M01)
3. 작성자 : Myoungbin Joo
4. 작성일 : 2023.05.23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 설치/배송 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_CNTR_PTRM')"
          :colspan="2"
          required
        >
          <!-- 설치기간 -->
          <kw-date-range-picker
            v-model:from="searchParams.cntrCnfmDtFr"
            v-model:to="searchParams.cntrCnfmDtTo"
            rules="date_range_required"
          />
        </kw-search-item>

        <kw-search-item :label="t('MSG_TXT_CNTOR_NM')">
          <kw-input
            v-model="searchParams.cstKnm"
            maxlength="30"
          />
        </kw-search-item>

        <kw-search-item :label="t('MSG_TXT_DIV')">
          <kw-option-group
            v-model="searchParams.istPcsvDvCd"
            type="radio"
            :options="codes.IST_PCSV_DV_CD"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_STT')">
          <kw-select
            v-model="searchParams.statDv"
            :options="sttCode"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_CNTR_DTL_NO')">
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_OTSC')">
          <kw-select
            v-model="searchParams.otscPdYn"
            :options="otscCode"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          v-show="isInstallation"
          :label="t('MSG_TXT_WK_GRP')"
        >
          <kw-select
            v-model="searchParams.wkGrpDv"
            :options="wrkGrpCode"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
        </template>
        <!-- rev:230503 버튼삭제 -->
        <!-- <kw-btn
          label="계약관리"
          primary
          dense
        /> -->
      </kw-action-top>
      <div class="row q-gutter-sm">
        <!-- 설치 카드 -->
        <kw-card
          v-for="(item, idx) of installationList"
          v-show="!isDelivery"
          :key="idx"
        >
          <div class="row items-center justify-between">
            <!-- 계약상세번호 -->
            <p
              class="kw-font-pt14 kw-fc--black2 text-underline contractNumber"
              @click="onClickCntrDtlNo(item)"
            >
              {{ item.cntrDtlNo }}
            </p>
            <!-- 상태 -->
            <kw-chip
              :label="item.msg"
              :color="item.cr"
              outline
            />
          </div>
          <!-- 고객명 -->
          <p class="kw-font-subtitle mt20">
            {{ item.cstKnm }}
          </p>
          <ul class="card-text my12">
            <li>
              <!-- 구분 -->
              <p class="w90">
                {{ $t('MSG_TXT_DIV') }}
              </p>
              <span> {{ workGroupCode(item.wkGrpDv) }}</span>
            </li>
            <li>
              <!-- 상품 -->
              <p class="w90">
                {{ $t('MSG_TXT_PRDT') }}
              </p>
              <span> {{ item.pdNm }}</span>
            </li>
            <li>
              <!-- 계약일자 -->
              <p class="w90">
                {{ $t('MSG_TXT_CNTR_DATE') }}
              </p>
              <span> {{ setDateFormat(item.cntrRcpFshDt) }}</span>
            </li>
            <li v-show="!isEqual(careerLevelCode, '15')">
              <!-- 판매자 -->
              <p class="w90">
                {{ $t('MSG_TXT_SELLER_PERSON') }}
              </p>
              <span> {{ `${item.ogCd||''} ${item.prtnrKnm||''} (${item.sellPrtnrNo||''})` }}</span>
            </li>
          </ul>
          <kw-separator spaced="20px" />
          <ul class="card-text">
            <li
              v-show="!isEqual(item.istPcsvSellTpCd, '2')
                && !isEqual(item.istPcsvSellTpCd, '4')
                && !isEqual(item.kaetc1, '7')"
            >
              <!-- 설치예정일시 -->
              <p class="w90">
                {{ $t('MSG_TXT_INSTL_EXP_DT') }}
              </p>
              <span>
                {{ setIstExptDateFormat(item) }}
              </span>
            </li>
            <slot v-if="isEqual(item.istBzsCd, 'S')">
              <li>
                <!-- 설치예약일시(삼성) -->
                <p class="w90">
                  {{ $t('MSG_TXT_INSTLATN_RSRVATN_DT') }}
                </p>
                <span>
                  {{ !isEmpty(item.sppDuedt) ? setDateFormat(item.sppDuedt) : setDateFormat(item.ssSppDuedt) }}
                </span>
              </li>
              <li v-show="!isEmpty(item.ssStockStrDt) && isEmpty(item.sppDuedt)">
                <!-- 재고입고일(삼성) -->
                <p class="w90">
                  {{ $t('MSG_TXT_STOCK_DT') }}
                </p>
                <span>
                  {{ setDateFormat(item.ssStockStrDt) }}
                </span>
              </li>
              <li>
                <!-- 삼성주문번호(삼성) -->
                <p class="w90">
                  {{ `${t('MSG_TXT_SS')}${t('MSG_TXT_ORD_NO')}` }}
                </p>
                <span>
                  {{ item.ssOrdId }}
                </span>
              </li>
              <li>
                <!-- 삼성SN(삼성) -->
                <p class="w90">
                  {{ `${t('MSG_TXT_SS')}${t('MSG_TXT_SERIAL_NO')}` }}
                </p>
                <span>
                  {{ item.pdctIdno }}
                </span>
              </li>
              <li>
                <!-- 설치 일자(삼성) -->
                <p class="w90">
                  {{ $t('MSG_TXT_IST_DT') }}
                </p>
                <span>{{ setDateFormat(item.sppDuedt) }}</span>
              </li>
              <li>
                <!-- 특이사항-->
                <p class="w90">
                  {{ $t('MSG_TXT_UNUITM') }}
                </p>
                <span>{{ isEmpty(item.cttRsCd) ? '' : `(${item.cttRsCd})${item.cttRsNm}` }}</span>
              </li>
            </slot>
            <slot
              v-if="!isEqual(item.istPcsvSellTpCd, '2')
                && !isEqual(item.istBzsCd, 'S')
                && !isEqual(item.kaetc1, '7')"
            >
              <li>
                <!-- 엔지니어 -->
                <p class="w90">
                  {{ $t('MSG_TXT_EGER') }}
                </p>
                <span>
                  <!-- {{ item.ogNm }}/{{ item.egerNm }}/
                  {{ item.egerCrallocaraTno }}-{{ item.egerMexnoEncr }}-{{ item.egerCralIdvTno }} -->
                  {{ item.engineer }}
                </span>
              </li>
              <li>
                <!-- 요청 사항 -->
                <p class="w90">
                  {{ $t('MSG_TXT_RQMT') }}
                </p>
                <span>{{ isEmpty(item.cnslMoCn) ? '' : item.cnslMoCn }}</span>
              </li>
              <li>
                <!-- 설치 일자 -->
                <p class="w90">
                  {{ $t('MSG_TXT_IST_DT') }}
                </p>
                <span>{{ setDateFormat(item.istDt) }}</span>
              </li>
              <li>
                <!-- 반송 메모 -->
                <p class="w90">
                  {{ $t('MSG_TXT_SB_MEMO') }}
                </p>
                <span>{{ isEmpty(item.wkCanMoCn)?'':item.wkCanMoCn }}</span>
              </li>
            </slot>
            <slot v-if="isEqual(item.istPcsvSellTpCd, '2')">
              <li>
                <!-- 배송요청일시 -->
                <p class="w90">
                  {{ $t('MSG_TXT_SPP_AK_D') }}
                </p>
                <span>{{ setDateFormat(item.egerAsnDt) }}</span>
              </li>
              <li>
                <!-- 제품관리팀수신일시 -->
                <p class="w90">
                  {{ $t('MSG_TXT_PRD_MGT_TEAM_RCV_DT') }}
                </p>
                <span>{{ setDateFormat(item.wkApcteDt, item.wkAcpteHh) }}</span>
              </li>
            </slot>
            <slot v-if="isEqual(item.istPcsvSellTpCd, '1') && isEqual(item.kaetc1, '7')">
              <li>
                <!-- 배송요청일 -->
                <p class="w90">
                  {{ $t('MSG_TXT_SPP_AK_D') }}
                </p>
                <span>{{ setDateFormat(item.sppDuedt) }}</span>
              </li>
              <li>
                <!-- 배송완료일자 -->
                <p class="w90">
                  {{ $t('MSG_TXT_SHIPPING_END_DT') }}
                </p>
                <span>{{ setDateFormat(item.cntrPdStrtdt) }}</span>
              </li>
              <li>
                <!-- 반송메모 -->
                <p class="w90">
                  {{ $t('MSG_TXT_SB_MEMO') }}
                </p>
                <span>{{ isEmpty(item.wkCanMoCn)?'':item.wkCanMoCn }}</span>
              </li>
            </slot>
          </ul>
          <kw-separator spaced="20px" />
          <kw-card-actions class="button-wrap">
            <!-- 기타배송조회 -->
            <kw-btn
              v-show="item.sppQty > 0"
              v-permission:read
              :label="t('MSG_BTN_SPP_INQR_ETC')"
              @click="onClickInstallEtc(item)"
            />
            <slot v-if="isEqual(item.lcCanyn, 'N')">
              <!-- 접수 -->
              <kw-btn
                v-show="(isEqual(item.acpgStat, '1') || isEqual(item.acpgStat, '9'))
                  && isEqual(item.istPcsvSellTpCd, '1')"
                v-permission:create
                :label="t('MSG_BTN_RECEIPT')"
                @click="onClickReceipt(item)"
              />
              <!-- 재접수 -->
              <kw-btn
                v-show="isEqual(item.kaetc1, '7') && isEqual(item.acpgStat, '2') && isEqual(item.istPcsvSellTpCd, '1')"
                v-permission:create
                :label="t('MSG_BTN_RE_REG')"
                @click="onClickReRegistration(item)"
              />
              <!-- 배정취소 -->
              <kw-btn
                v-show="isEqual(item.acpgStat, '2') && isEqual(item.istPcsvSellTpCd, '1')"
                v-permission:delete
                :label="t('MSG_BTN_CNCL_ASGMT')"
                @click="onClickCnclAsgmt(item)"
              />
            </slot>
          </kw-card-actions>
        </kw-card>
        <!-- 배송 카드 -->
        <kw-card
          v-for="(item, idx) of installationList"
          v-show="isDelivery"
          :key="idx"
        >
          <div class="row items-center justify-between">
            <!-- 계약상세번호 -->
            <p
              class="kw-font-pt14 kw-fc--black2 text-underline contractNumber"
              @click="onClickCntrDtlNo(item)"
            >
              {{ item.cntrDtlNo }}
            </p>
            <!-- 상태 -->
            <kw-chip
              :label="item.sellTpNm"
              color="cyan"
              outline
            />
          </div>
          <!-- 고객명 -->
          <p class="kw-font-subtitle mt20">
            {{ item.cstKnm }}
          </p>
          <ul class="card-text my12">
            <li>
              <!-- 상품 -->
              <p class="w90">
                {{ $t('MSG_TXT_PRDT') }}
              </p>
              <span> {{ item.pdNm }}</span>
            </li>
            <li>
              <!-- 계약일자 -->
              <p class="w90">
                {{ $t('MSG_TXT_CNTR_DATE') }}
              </p>
              <span> {{ setDateFormat(item.cntrRcpFshDt) }}</span>
            </li>
            <li>
              <!-- 지점장 -->
              <p class="w90">
                {{ $t('MSG_TXT_BRMGR') }}
              </p>
              <span>
                {{
                  `${item.dgr3LevlDgPrtnrNm||''}
                  (${item.dgr3CralLocaraTno||''}-${item.dgr3MexnoEncr||''}-${item.dgr3CralIdvTno||''})`
                }}
              </span>
            </li>
            <li v-show="!isEqual(careerLevelCode, '15')">
              <!-- 판매자 -->
              <p class="w90">
                {{ $t('MSG_TXT_SELLER_PERSON') }}
              </p>
              <span> {{ `${item.ogCd||''} ${item.prtnrKnm||''} (${item.sellPrtnrNo||''})` }}</span>
            </li>
          </ul>
          <kw-separator spaced="20px" />
          <ul class="card-text">
            <slot v-if="!isEqual(item.istBzsCd, 'S')">
              <li>
                <!-- 배송예정일 -->
                <p class="w90">
                  {{ $t('MSG_TXT_EXP_DEL_DT') }}
                </p>
                <span>
                  {{ setDateFormat(item.sppDuedt) }}
                </span>
              </li>
              <li>
                <!-- 송장번호 -->
                <p class="w90">
                  {{ $t('MSG_TXT_IVC_NO') }}
                </p>
                <span>
                  {{ isEmpty(item.pcsvBzsNm) ? '' : `(${item.pcsvBzsNm}) ${item.sppOrdNo}` }}
                </span>
              </li>
              <li v-show="isEqual(item.kaetc1, '4') && isEqual(item.pdMclsfNm, 'C')">
                <!-- 예약확정 -->
                <p class="w90">
                  {{ `${t('MSG_TXT_RSV')}${t('MSG_TXT_DTRM')}` }}
                </p>
                <span>
                  {{ item.booSellYn }}
                </span>
              </li>
            </slot>
            <slot v-if="isEqual(item.istBzsCd, 'S')">
              <li v-show="!isEmpty(item.ssSppDuedt)">
                <!-- 배송예정일자 -->
                <p class="w90">
                  {{ $t('MSG_TXT_EXP_DEL_DT') }}
                </p>
                <span>
                  {{ isEmpty(item.sppDuedt) ? setDateFormat(item.ssSppDuedt) : setDateFormat(item.sppDuedt) }}
                </span>
              </li>
              <li v-show="isEmpty(item.ssSppDuedt) && !isEmpty(item.ssStockStrDt)">
                <!-- 재고입고일 -->
                <p class="w90">
                  {{ $t('MSG_TXT_STOCK_DT') }}
                </p>
                <span>{{ setDateFormat(item.ssStockStrDt) }}</span>
              </li>
              <li>
                <!-- 삼성주문번호 -->
                <p class="w90">
                  {{ $t('MSG_TXT_RQMT') }}
                </p>
                <span>{{ item.ssOrdId }}</span>
              </li>
              <li>
                <!-- 특이사항-->
                <p class="w90">
                  {{ $t('MSG_TXT_UNUITM') }}
                </p>
                <span>{{ isEmpty(item.cttRsCd) ? '' : `(${item.cttRsCd})${item.cttRsNm}` }}</span>
              </li>
            </slot>
          </ul>
          <kw-card-actions
            v-show="!isEqual(item.istBzsCd, 'S')"
            class="mt20"
          >
            <!-- 기타배송조회 -->
            <kw-btn
              v-show="item.sppQty > 0"
              v-permission:read
              :label="t('MSG_BTN_SPP_INQR_ETC')"
              @click="onClickInstallEtc(item)"
            />
            <!-- 조회 -->
            <kw-btn
              v-show="!isEmpty(item.sppOrdNo) && !isEmpty(item.pcsvBzsCd)"
              v-permission:read
              :label="t('MSG_BTN_INQR')"
              @click="onClickDelverInqr(item.sppOrdNo, item.pcsvBzsCd)"
            />
            <!-- 예약확정 -->
            <kw-btn
              v-show="isEqual(item.booSellYn, 'Y') && isEqual(item.kaetc1, '4') && isEqual(item.pdMclsfNm, 'C')"
              v-permission:update
              :label="`${t('MSG_BTN_RSV')}${t('MSG_BTN_DTRM')}`"
              @click="onClickDelverRsvDtrmEtc(item)"
            />
            <!-- 예약확정등록 -->
            <kw-btn
              v-show="!isEqual(item.booSellYn, 'Y') && isEqual(item.kaetc1, '4') && isEqual(item.pdMclsfNm, 'C')"
              v-permission:create
              :label="`${t('MSG_BTN_RSV')}${t('MSG_BTN_DTRM')}${t('MSG_BTN_RGST')}`"
              @click="onClickDelverRsvDtrmRgstEtc(item.sellTpCd, item.cntrNo)"
            />
          </kw-card-actions>
        </kw-card>
      </div>
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
/* import { codeUtil, defineGrid, gridUtil, useDataService, useGlobal, useModal } from 'kw-lib'; */
import { codeUtil, useDataService, stringUtil, modal, useGlobal, useMeta, notify } from 'kw-lib';
import { cloneDeep, isEmpty, isEqual } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import dayjs from 'dayjs';

const { alert, confirm } = useGlobal();
const { getters } = useStore();
const { t } = useI18n();
const { getUserInfo } = useMeta();

const { careerLevelCode } = getters['meta/getUserInfo'];
const dataService = useDataService();
const codes = await codeUtil.getMultiCodes('IST_PCSV_DV_CD');
const now = dayjs();

const sessionUserInfo = getUserInfo();
const installationList = ref();
// const kiwiList = ref();

const otscCode = [
  { codeId: 'Y', codeName: 'Y' },
  { codeId: 'N', codeName: 'N' },
];

const sttCode = [
  { codeId: 'A', codeName: t('MSG_TXT_ALL') },
  { codeId: 'B', codeName: t('MSG_TXT_SL_CNFM') },
  { codeId: 'C', codeName: t('MSG_TXT_INSTL_EXP_CNFM') },
  { codeId: 'D', codeName: t('MSG_TXT_NON_DTRM') },
];

const wrkGrpCode = [
  { codeId: '10', codeName: t('MSG_TXT_ENVR_ELHM') },
  { codeId: '12', codeName: t('MSG_TXT_WELSF') },
  { codeId: '20', codeName: t('MSG_TXT_HCR_SVC') },
  { codeId: '30', codeName: t('MSG_TXT_LGSZ_ELHM') },
];

const searchParams = ref({
  cntrCnfmDtFr: now.add('-1', 'day').format('YYYYMMDD'), // 계약기간 From
  cntrCnfmDtTo: now.format('YYYYMMDD'), // 계약기간 To
  istPcsvDvCd: '1', // 구분
  statDv: 'A', // 상태
  otscPdYn: '', // 아웃소싱
  wkGrpDv: '', // 작업구분
  cstKnm: '', // 고객명
  cntrDtlNo: '', // 계약상세번호
  cntrNo: '',
  cntrSn: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 8,
});

const isDelivery = ref(false);

const isInstallation = computed(() => isEqual(searchParams.value?.istPcsvDvCd, '1'));

let cachedParams;

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

function workGroupCode(code) {
  return !isEmpty(code) ? wrkGrpCode.filter((obj) => (isEqual(obj.codeId, code)))[0].codeName : '';
}

function getInstallStatus() {
  let istPcsvSellTpCd = ''; /* REQ_SET_DIV */
  let cttRsCd = ''; /* LCCCDE */
  let istDt = ''; /* LCSETD */
  let wkPrgsStatCd = ''; /* AC221_PROC_STUS */
  let wkAcpteStatCd = ''; /* AC221_CFRM_STUS_WRK */
  let retrTrgtYn = ''; /* RETR_TRGT_YN */
  let kaetc1 = ''; /* KAETC1 */
  let sppDuedt = ''; /* LCDEMD */
  let hasKiwiOrd = ''; /* intlOrdrInfo */
  let lcCanyn = ''; /* LC_CANYN */
  let sellTpCd = ''; /* ORDRTYPE */

  installationList.value.forEach((element) => {
    istPcsvSellTpCd = element.istPcsvSellTpCd;
    cttRsCd = element.cttRsCd;
    istDt = element.istDt;
    wkPrgsStatCd = element.wkPrgsStatCd;
    wkAcpteStatCd = element.wkAcpteStatCd;
    retrTrgtYn = element.retrTrgtYn;
    kaetc1 = element.kaetc1;
    sppDuedt = element.sppDuedt;
    hasKiwiOrd = element.hasKiwiOrd;
    sellTpCd = element.sellTpCd;
    lcCanyn = element.lcCanyn;

    if (isEqual(kaetc1, '8') && isEqual(sellTpCd, '1') && isEqual(cttRsCd, '91')) {
      element.cr = 'red';
      if (isEqual(lcCanyn, 'Y')) {
        element.msg = t('MSG_TXT_RFND');
        element.acpgStat = '99';
      } else {
        element.msg = t('MSG_TXT_RFND_AK');
        element.acpgStat = '98';
      }
    }
    if (!hasKiwiOrd) {
      element.msg = t('MSG_TXT_NOT_ASN');
      element.cr = 'orange';
      element.acpgStat = '1';

      if (isEqual(istPcsvSellTpCd, '4')) {
        if (isEqual(cttRsCd, '99')) {
          element.msg = t('MSG_TXT_SB');
          element.cr = 'red';
          element.acpgStat = '9';
        } else if (!isEmpty(istDt)) {
          element.msg = t('MSG_TXT_INST_COMP');
          element.cr = 'cyan';
          element.acpgStat = '4';
        } else {
          element.msg = `${t('MSG_TXT_INSTALLATION')}${t('MSG_TXT_ASGN')}`;
          element.cr = 'blue';
          element.acpgStat = '2';
        }
      }
      if (isEqual(istPcsvSellTpCd, '1') && isEqual(kaetc1, '7')) {
        if (!isEmpty(istDt)) {
          element.msg = t('MSG_TXT_INST_COMP');
          element.cr = 'cyan';
          element.acpgStat = '4';
        } else if (!isEmpty(sppDuedt)) {
          element.msg = `${t('MSG_TXT_INSTALLATION')}${t('MSG_TXT_ASGN')}`;
          element.cr = 'blue';
          element.acpgStat = '2';
        }
      }
    } else if (hasKiwiOrd) {
      if (isEqual(wkPrgsStatCd, '00') && isEmpty(wkAcpteStatCd)) {
        element.msg = `${t('MSG_TXT_INSTALLATION')}${t('MSG_TXT_ASGN')}`;
        element.cr = 'blue';
        element.acpgStat = '2';
      } else if (wkPrgsStatCd < 20 && isEqual(wkAcpteStatCd, 'Y')) {
        element.msg = t('MSG_TXT_ACPTE');
        element.cr = 'cyan';
        element.acpgStat = '3';
      } else if (isEqual(wkPrgsStatCd, '20') && !isEqual(retrTrgtYn, 'Y')) {
        element.msg = t('MSG_TXT_INST_COMP');
        element.cr = 'cyan';
        element.acpgStat = '4';
      } else {
        element.msg = t('MSG_TXT_SB');
        element.cr = 'red';
        element.acpgStat = '9';
      }
    }

    // 엔진니어 표시 문자열 만들기
    element.engineer = '';
    if (!isEmpty(element.ogNm)) {
      element.engineer += `${element.ogNm}/`;
    }
    if (!isEmpty(element.egerNm)) {
      element.engineer += `${element.egerNm}/`;
    }
    if (isEmpty(element.egerCrallocaraTno) || isEmpty(element.egerMexnoEncr) || isEmpty(element.egerCralIdvTno)) {
      element.engineer += '';
    } else {
      element.engineer += `${element.egerCrallocaraTno.trim()}-${element.egerMexnoEncr}-${element.egerCralIdvTno}`;
    }
  });
}

async function fetchData() {
  if (isEqual(searchParams.value.istPcsvDvCd, '2')) {
    searchParams.value.wkGrpDv = '';
    isDelivery.value = true;
  } else {
    isDelivery.value = false;
    // getInstallStatus();
  }
  cachedParams = cloneDeep(searchParams.value);

  if (isEmpty(cachedParams)) return;

  const res = await dataService.get('/sms/wells/contract/contracts/installation-shippings/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: details, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  installationList.value = details;

  getInstallStatus();
}

async function onClickSearch() {
  cachedParams = '';
  pageInfo.value.pageIndex = 1;
  installationList.value = [];
  fetchData();
}

function setIstExptDateFormat(item) {
  const { wkAcpteDt, wkAcpteHh, vstCnfmdt, vstCnfmHh } = item;

  let date = '';
  let time = '';
  let returnDt = '';

  // 날짜설정
  if (isEmpty(vstCnfmdt)) {
    if (!isEmpty(wkAcpteDt)) { date = wkAcpteDt; }
  } else {
    date = vstCnfmdt;
  }

  // 시간설정
  if (isEmpty(vstCnfmHh)) {
    if (!isEmpty(wkAcpteHh)) { time = wkAcpteHh; }
  } else {
    time = vstCnfmHh;
  }

  // 체크
  if (isEmpty(date) && isEmpty(time)) { return; }

  // 반환값 설정
  returnDt = stringUtil.getDatetimeFormat(`${date}${time}`);
  return returnDt;
}

function setDateFormat(date, time) {
  let rtnDate = '';
  if (isEmpty(date)) {
    rtnDate = '';
  } else {
    rtnDate = isEmpty(time) ? stringUtil.getDateFormat(date) : stringUtil.getDatetimeFormat(`${date}${time}`);
  }
  return rtnDate;
}

async function onClickCntrDtlNo(item) {
  const { cntrNo, cntrSn, sellTpCd, copnDvCd } = item;

  if (!isEmpty(cntrNo)) {
    await modal({
      component: 'WwctaOrderDetailP',
      componentProps: {
        cntrNo,
        cntrSn,
        sellTpCd,
        copnDvCd,
      },
      draggable: true,
      window: true,
      windowFeatures: { width: 1300, height: 1080 },
    });
  }
}

// 기타배송조회(설치, 배송)
async function onClickInstallEtc(dataList) {
  alert('추가 예정 ([W-SV-U-0053P01] 기타 물품 배송 조회)');
  await modal({
    component: 'WwsnbEtcGoodsShippingListP',
    componentProps: { dataList },
  });
}

// 설치/배송 호출
async function callKiwiTimeAssign(dataList, prdDiv) {
  let workDt = '';
  let asIstOjNo = '';
  let acpgDiv = '';

  let pkgYn = '';
  let sellTpCd = '';
  let kaetc1 = '';

  if (!isEqual(dataList.profile, 'prd')) {
    alert('처리되었습니다.(개발환경에선 처리 안됨)');
    return;
  }

  if (!isEqual(dataList.lcCanyn, 'Y')) {
    if (isEqual(dataList.acpgStat, '1') || isEqual(dataList.acpgStat, '9')) {
      acpgDiv = '1';
      workDt = now.format('YYYYMMDD');
      asIstOjNo = '';
    } else if (isEqual(dataList.acpgStat, '2')) {
      acpgDiv = '2';
      workDt = dataList.rcpdt;
      asIstOjNo = dataList.asIstOjNo;
    }

    const saveParams = ref({
      cntrNo: dataList.cntrNo,
      cntrSn: dataList.cntrSn,
      prtnrNo: sessionUserInfo.employeeIDNumber,
      inputGb: '3', // 입력구분
      wkGb: '1', // 작업구분
      workDt, // 작업일자
      asIstOjNo, // 작업순번
      acpgDiv, // 접수구분
      basePdCd: dataList.basePdCd, // 상품코드
      istPcsvDvCd: searchParams.value.istPcsvDvCd, // 설치택배구분
      mnftCoId: dataList.mnftCoId, // 제조사(LCJEJO)
      svBizDclsfCd: '', // 서비스업무세분류코드
      inChnlDvCd: dataList.inChnlDvCd, // 입력채널구분코드
      svBizHclsfCd: dataList.svBizHclsfCd, // 서비스세분류코드
      prdDiv, // 배정구분코드
    });

    if (isEqual(dataList.basePdCd, 'WP02120086')) { /* AS-IS: 4129 (렌탈) */
      if (await confirm(t('MSG_ALT_CNFM_SPP'))) {
        alert(t('MSG_ALT_SPP_WRN'));
        return;
      }

      const res = await dataService.post('/sms/wells/contract/contracts/installation-shippings', saveParams.value); // 체크
      if (!isEmpty(res)) {
        notify(t('MSG_ALT_SPP_SUCCESS'));
        fetchData();
      }
    } else {
      let svBizDclsfCdParam = '';
      let svDvCdParam = '';
      pkgYn = dataList.pkgYn;
      sellTpCd = dataList.sellTpCd;
      kaetc1 = dataList.kaetc1;

      if (isEqual(kaetc1, '8')) {
        svDvCdParam = '4';
        if (isEqual(sellTpCd, '1')) {
          svBizDclsfCdParam = '4110';
        } else if (isEqual(pkgYn, 'Y')) {
          if (isEqual(sellTpCd, '1')) {
            svBizDclsfCdParam = '4130';
          } else {
            svBizDclsfCdParam = '4120';
          }
        }
      } else {
        svDvCdParam = '1';
        svBizDclsfCdParam = '1110';
      }
      const { result } = await modal({
        component: 'WwsncTimeTableForContractP',
        componentProps: {
          sellDate: dataList.rcpdt, // 판매일자
          baseYm: now.format('YYYYMM'), // 달력 초기 월
          chnlDvCd: 'K', // W: 웰스, K: KSS, C: CubicCC, P: K-MEMBERS, I || E: 엔지니어, M: 매니저
          svDvCd: svDvCdParam, // 1:설치, 2:BS, 3:AS, 4:홈케어
          svBizDclsfCd: svBizDclsfCdParam, // 판매인 경우 1110(신규설치) fix
          cntrNo: dataList.cntrNo,
          cntrSn: dataList.cntrSn,
          mtrStatCd: prdDiv, // 1: 신규, 2: 수정, 3: 삭제
        },
      });

      if (result) {
        fetchData();
      }
    }
  }
}

// async function onClickTest(dataList) {
//   let pkgYn = '';
//   let sellTpCd = '';
//   let kaetc1 = '';
//   let svBizDclsfCdParam = '';
//   let svDvCdParam = '';
//   pkgYn = dataList.pkgYn;
//   sellTpCd = dataList.sellTpCd;
//   kaetc1 = dataList.kaetc1;

//   if (kaetc1 === '8') {
//     svDvCdParam = '4';
//     if (sellTpCd === '1') {
//       svBizDclsfCdParam = '4110';
//     } else if (pkgYn === 'Y') {
//       if (sellTpCd === '1') {
//         svBizDclsfCdParam = '4130';
//       } else {
//         svBizDclsfCdParam = '4120';
//       }
//     }
//   } else {
//     svDvCdParam = '1';
//     svBizDclsfCdParam = '1110';
//   }
//   const { result } = await modal({
//     component: 'WwsncTimeTableSellListP',
//     componentProps: {
//       sellDate: dataList.vstCnfmdt, // 판매일자
//       baseYm: dataList.vstCnfmdt.substr(0, 6), // 달력 초기 월
//       chnlDvCd: dataList.inChnlDvCd, // W: 웰스, K: KSS, C: CubicCC, P: K-MEMBERS, I || E: 엔지니어, M: 매니저
//       svDvCd: svDvCdParam, // 1:설치, 2:BS, 3:AS, 4:홈케어
//       svBizDclsfCd: svBizDclsfCdParam, // 판매인 경우 1110(신규설치) fix
//       cntrNo: dataList.cntrNo,
//       cntrSn: dataList.cntrSn,
//       dataStatCd: '1', // 1: 신규, 2: 수정, 3: 삭제
//       userId: sessionUserInfo.employeeIDNumber,
//     },
//   });

//   if (result) {
//     console.log(result);
//   }
// }

// 설치/배송 취소
async function cancelKiwiTimeAssign(dataList, prdDivParam) {
  const idNumber = sessionUserInfo.employeeIDNumber;
  if (isEqual(dataList.lcCanyn, 'Y')) {
    alert(t('MSG_ALT_ALRDY_CANC_ORD'));
    return;
  }
  if (isEqual(dataList.kaetc1, '7')) {
    if (!isEqual(idNumber.value, '31754')
        && !isEqual(idNumber.value, '27342')
        && !isEqual(idNumber.value, '6545')
        && !isEqual(idNumber.value, '37668') // 사번전환_20211001 31754 -> 37668
        && !isEqual(idNumber.value, '36805') // 사번전환_20211001 27342 -> 36805
        && !isEqual(idNumber.value, '36544') // 사번전환_20211001  6545 -> 36544
        && !isEqual(idNumber.value, '36581') // 사공윤파트장님 추가
    ) {
      alert(t('MSG_ALT_CANNOT_ASN_SPAY_SDING_CANC'));
      return;
    }

    alert(t('MSG_ALT_AK_DEL_KIWI_ASN_AFT_RET_SPAY_SPP_EXP_DT'));
    const saveCheckParams = ref({
      cntrNo: dataList.cntrNo,
      cntrSn: dataList.cntrSn,
      ordrNo3: '0',
    });
    const res = await dataService.put('/sms/wells/contract/contracts/installation-shippings/due-date-cancel', saveCheckParams.value); // 취소
    if (!isEmpty(res)) {
      notify(t('MSG_ALT_SPP_CAN_EXP_DT_CANCEL'));
    }
    return;
  }

  if (!isEqual(dataList.profile, 'prd')) {
    alert('처리되었습니다.(개발환경에선 처리 안됨)');
    return;
  }

  const saveParams = ref({
    cntrNo: dataList.cntrNo,
    cntrSn: dataList.cntrSn,
    prtnrNo: sessionUserInfo.employeeIDNumber,
    inputGb: '3', // 입력구분
    wkGb: '1', // 작업구분
    workDt: dataList.rcpdt, // 작업일자
    asIstOjNo: dataList.asIstOjNo, // 작업순번
    acpgDiv: '3', // 구분
    basePdCd: '', // 상품코드
    svBizDclsfCd: '', // 서비스업무세분류코드
    mnftCoId: dataList.mnftCoId, // 제조사(LCJEJO)
    prdDiv: prdDivParam, // 접수구분
    inChnlDvCd: dataList.inChnlDvCd, // 입력채널구분코드
    svBizHclsfCd: dataList.svBizHclsfCd, // 서비스세분류코드
    mtrStatCd: prdDivParam, // 배정구분코드
  });

  if (isEqual(dataList.kaetc1, '8')) {
    if (isEqual(dataList.sellTpCd, '1')) {
      saveParams.value.wkGb = '4';
      saveParams.value.svBizDclsfCd = '4110';
    } else {
      saveParams.value.svBizDclsfCd = '4130';
    }
  }
  const res = await dataService.post('/sms/wells/contract/contracts/installation-shippings', saveParams.value); // 체크
  if (!isEmpty(res)) {
    notify(t('MSG_ALT_WAS_CNCL'));
    fetchData();
  }
}

// 키위 체크
async function checkKiwiTimeAssign(dataList, prdDiv) {
  let workDtParam = '';
  let asIstOjNoParam = '';
  let acpgDivParam = '';

  if (!isEqual(dataList.profile, 'prd')) {
    alert('처리되었습니다.(개발환경에선 처리 안됨)');
    return;
  }

  if (!isEqual(dataList.lcCanyn, 'Y')) {
    if (isEqual(dataList.kaetc1, '7')) {
      if (!isEqual(prdDiv, '3')) {
        callKiwiTimeAssign(dataList, prdDiv);
        return;
      }
      cancelKiwiTimeAssign(dataList, prdDiv);
      return;
    }
    if (isEqual(dataList.acpgStat, '1') || isEqual(dataList.acpgStat, '9')) {
      acpgDivParam = '1';
      workDtParam = now.format('YYYYMMDD');
      asIstOjNoParam = '';
    } else if (isEqual(dataList.acpgStat, '2')) {
      acpgDivParam = '2';
      workDtParam = dataList.rcpdt;
      asIstOjNoParam = dataList.asIstOjNo;
    }
    const saveParams = ref({
      cntrNo: dataList.cntrNo,
      cntrSn: dataList.cntrSn,
      prtnrNo: sessionUserInfo.employeeIDNumber,
      inputGb: '3', // 입력구분
      wkGb: '1', // 작업구분
      workDt: workDtParam, // 작업일자
      asIstOjNo: asIstOjNoParam, // 작업순번
      acpgDiv: acpgDivParam, // 구분
      basePdCd: dataList.basePdCd, // 상품코드
      istPcsvDvCd: searchParams.value.istPcsvDvCd,
      mnftCoId: dataList.mnftCoId, // 제조사(LCJEJO)
      svBizDclsfCd: '', // 서비스업무세분류코드
      prdDiv, // 접수구분
    });

    if (isEqual(dataList.kaetc1, '8')) {
      if (isEqual(dataList.sellTpCd, '1')) {
        saveParams.value.wkGb = '4';
        saveParams.value.svBizDclsfCd = '4110';
      } else {
        saveParams.value.svBizDclsfCd = '4130';
      }
    }
    const res = await dataService.post('/sms/wells/contract/contracts/installation-shippings/checks', saveParams.value); // 체크
    if (!isEmpty(res)) {
      if (!isEqual(prdDiv, '3')) {
        callKiwiTimeAssign(dataList, prdDiv);
      } else {
        cancelKiwiTimeAssign(dataList, prdDiv);
      }
    }
  }
}

// 접수(설치)
async function onClickReceipt(dataList) {
  if (!await confirm(t('MSG_ALT_WANT', [t('MSG_TXT_RCP')]))) { return; }
  checkKiwiTimeAssign(dataList, '1');
}

// 재접수(설치)
async function onClickReRegistration(dataList) {
  if (!await confirm(t('MSG_ALT_WANT', [t('MSG_TXT_RE_REG')]))) { return; }
  checkKiwiTimeAssign(dataList, '2');
}

// 배정취소(설치)
async function onClickCnclAsgmt(dataList) {
  if (!await confirm(t('MSG_ALT_WANT', [t('MSG_TXT_CNCL_ASGMT')]))) { return; }
  checkKiwiTimeAssign(dataList, '3');
}

// 조회(택배)
async function onClickDelverInqr(sppOrdNo, pcsvBzsCd) {
  console.log(sppOrdNo);
  console.log(pcsvBzsCd);
  let url = '';
  if (isEqual(pcsvBzsCd, '01')) {
    url = `http://www.hanjinexpress.hanjin.net/customer/hddcw18_ms.tracking?w_num=${sppOrdNo}`;
  } else if (isEqual(pcsvBzsCd, '02')) {
    url = `'http://nexs.cjgls.com/web/info.jsp?slipno=${sppOrdNo}`;
  }

  if (!isEmpty(url)) {
    window.open(url, '배송추적', 'top=200, left=300, width=800, height=550, status=no, menubar=no, toolbar=no, resizable=no');
  } else {
    console.log('한진택배, CJ 외의 택배사!!');
  }
}

// // 예약확정(택배)
// async function onClickDelverRsvDtrmEtc(dataList) {
//   console.log(dataList);
// }

// // 예약확정등록(택배)
// async function onClickDelverRsvDtrmRgstEtc(dataList) {
//   console.log(dataList);
// }

</script>

<style scoped lang="scss">
.contractNumber {
  cursor: pointer;
}

.kw-card {
  width: calc((100% - 80px) / 4);
}

::v-deep(.kw-card.q-card) {
  display: flex;
  flex-direction: column;
}

.card-text {
  margin-bottom: 20px;

  li {
    p {
      min-width: 72px;
    }

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.button-wrap {
  display: flex;
  column-gap: 6px;
  row-gap: 6px;
  flex-flow: row wrap;
  white-space: nowrap;

  ::v-deep(.kw-btn) {
    flex: 1 1 calc(100% / 4);
    font-size: 14px;
    font-weight: normal;
    letter-spacing: normal;
    color: #555;
    min-height: 40px;
  }
}

.mt-auto {
  margin-top: auto !important;
}
</style>
