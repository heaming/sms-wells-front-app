<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaContractStatusListM - 계약현황 목록
3. 작성자 : gs.nidhi.d / younuk.choi
4. 작성일 : 2023.04.26
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U-0097M01] 계약현황 목록
- // TODO 버튼 이벤트
****************************************************************************************************
--->

<template>
  <kw-page>
    <!-- 계약현황 요약 -->
    <ul class="kw-state-list">
      <li class="kw-state-list__item">
        <p class="kw-state-list__top">
          {{ t('MSG_TXT_DTRM') }}
        </p>
        <p
          class="kw-state-list__num blue-line-link kw-fc--black1"
          @click="onClickPrgsSearch('60')"
        >
          {{ summary.cnfm }}
        </p>
      </li>
      <li class="kw-state-list__item">
        <p class="kw-state-list__top">
          {{ t('MSG_TXT_STLM_FSH') }}
        </p>
        <p
          class="kw-state-list__num blue-line-link kw-fc--black1"
          @click="onClickPrgsSearch('50')"
        >
          {{ summary.aprv }}
        </p>
      </li>
      <li class="kw-state-list__item">
        <p class="kw-state-list__top">
          {{ t('MSG_TXT_DRFT_CMPL') }}
        </p>
        <p
          class="kw-state-list__num blue-line-link kw-fc--black1"
          @click="onClickPrgsSearch('20')"
        >
          {{ summary.wrte }}
        </p>
      </li>
      <li class="kw-state-list__item">
        <p class="kw-state-list__top">
          {{ t('MSG_TXT_APP_IN_PRG') }}
        </p>
        <p
          class="kw-state-list__num blue-line-link kw-fc--black1"
          @click="onClickPrgsSearch('40')"
        >
          {{ summary.inprgs }}
        </p>
      </li>

      <li
        v-if="searchParams.isBrmgr ==='Y'"
        class="kw-state-list__item"
      >
        <p class="kw-state-list__top">
          {{ t('MSG_TXT_DEL_REQ') }}
        </p>
        <p
          class="kw-state-list__num blue-line-link kw-fc--black1"
          @click="onClickPrgsSearch('99')"
        >
          {{ summary.delreq }}
        </p>
      </li>
    </ul>

    <!-- 검색 -->
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_RCPDT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.rcpStrtDt"
            v-model:to="searchParams.rcpEndDt"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_CNTR_STAT')">
          <kw-select
            v-model="searchParams.cntrPrgsStatCd"
            :options="cntrPrgsStatCds"
            first-option="all"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_PRDT_GUBUN')">
          <kw-select
            v-model="searchParams.pdDvCd"
            :options="codes.SELL_TP_DTL_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_CNTRT')">
          <kw-select
            v-model="searchParams.srchDv"
            class="w120"
            :options="[{codeId:'NM', codeName:t('MSG_TXT_CNTOR_NM')},
                       {codeId:'NO', codeName:t('MSG_TXT_CNTR_NO')},
            ]"
            @change="onChangeSearchDiv"
          />
          <kw-input
            v-if="searchParams.srchDv === 'NM'"
            v-model="searchParams.srchCstNm"
            maxlength="50"
          />
          <kw-input
            v-else
            v-model="searchParams.srchCntrNo"
            icon="search"
            clearable
            maxlength="12"
            :regex="contractNumberRegEx"
            style="text-transform: uppercase;"
            @click-icon="onClickCntrNoPop"
          />
        </kw-search-item>
        <kw-search-item
          v-if="searchParams.isBrmgr === 'Y'"
          :label="$t('MSG_TXT_PRTNR')"
        >
          <kw-input
            v-model="searchParams.prtnrNm"
            maxlength="50"
          />
        </kw-search-item>
        <kw-search-item
          v-if="searchParams.isBrmgr === 'Y'"
          :label="$t('MSG_TXT_VIEW_CLSFCTN')"
        >
          <kw-checkbox
            v-model="searchParams.isBrmgrCntr"
            :label="$t('MSG_TXT_BRNCH_MNGR_CNTRCT')"
            :false-value="N"
            :true-value="Y"
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

        <!--계약관리-->
        <kw-btn
          :label="$t('MSG_TXT_CNTR_MGT')"
          primary
          dense
          @click="onClickManage"
        />
      </kw-action-top>

      <div class="row q-gutter-sm">
        <kw-card
          v-for="(item, idx) of resultList"
          :key="idx"
        >
          <div class="row items-center justify-between">
            <p class="h16 kw-font-pt18 kw-fc--primary">
              {{ item.sellTpNm }}{{ item.numprds > 1? ` 외 ${item.numprds-1}건`:`` }}
            </p>
          </div>

          <p class="kw-font-subtitle mt20">
            {{ item.cstKnm }}({{ item.copnDvNm==='개인'?
              (item.bryyMmdd?dayjs(item.bryyMmdd).format('YYYY-MM-DD'):''):item.bryyMmdd }})
            <kw-chip
              color="placeholder"
              outline
            >
              {{ item.copnDvNm }}
            </kw-chip>
          </p>

          <ul class="card-text my12">
            <li>
              <p class="w90">
                {{ t('MSG_TXT_CNTR_NO') }}
              </p>
              <span>
                {{ item.cntrNo }}
              </span>
            </li>

            <li>
              <p class="w90">
                {{ t('MSG_TXT_RCP_D') }}
              </p>
              <span>{{ dayjs( item.viewRcpFshDtm).format('YYYY-MM-DD') }}</span>
            </li>

            <li>
              <p class="w90">
                {{ t('MSG_TXT_GOODS_NM') }}
              </p>
              <span>
                {{ item.pdNm }}
              </span>
            </li>

            <li v-if="Number(item.pymnamt) > 0 && item.viewCntrPrgsStatCd < 60">
              <p class="w90">
                {{ t('MSG_TXT_DPST_AMT') }}
              </p>
              <span class="text-weight-bold kw-fc--error">
                {{ stringUtil.getNumberWithComma(item.pymnamt||0) }}원
              </span>
            </li>
            <li v-else>
              <p class="h16" />
            </li>

            <li v-if="searchParams.isBrmgr === 'Y'">
              <p class="w90">
                {{ t('MSG_TXT_PRTNR') }}
              </p>
              <span>
                {{ item.prtnrKnm }}
              </span>
            </li>
          </ul>

          <div>
            <kw-chip class="state-chip">
              {{ item.cntrPrgsStatNm }}
            </kw-chip>
            <!-- 확정요청대상조회 -->
            <span
              v-if="item.viewCntrPrgsStatCd === '50' && searchParams.isBrmgr != 'Y' && item.dfntaprcnt > 0"
              style="float: right;"
              @click="onClickConfirmTarget(item.cntrNo)"
            >
              {{ t('MSG_TXT_CNFM_REQ_TGT')+t('MSG_TXT_SRCH') }}
            </span>
          </div>

          <kw-slider
            :model-value="Number(item.cntrPrgsStatCd)"
            :markers="false"
            :min="0"
            :max="60"
            track-size="7px"
            thumb-size="0px"
            readonly
            :step="0"
          />

          <!-- 임시저장 -->
          <div
            v-if="Number(item.viewCntrPrgsStatCd) < 20"
            class="button-wrap"
          >
            <kw-btn
              :label="$t('MSG_BTN_MOD')"
              padding="10px"
              @click="onClickModify(item)"
            />
            <kw-separator
              vertical
              inset
              spaced="0px"
            />
            <kw-btn
              :label="$t('MSG_BTN_DEL')"
              padding="10px"
              @click="onClickContractDelete(item)"
            />
          </div>
          <!-- 작성완료 -->
          <div
            v-else-if="item.viewCntrPrgsStatCd === '20'"
            class="button-wrap"
          >
            <kw-btn
              :label="$t('MSG_BTN_MOD')"
              padding="10px"
              @click="onClickModify(item)"
            />
            <kw-separator
              vertical
              inset
              spaced="0px"
            />
            <template v-if="item.confirmPsbYn=='Y'">
              <kw-btn
                :label="$t('MSG_BTN_DTRM')"
                padding="10px"
                @click="onClickConfirm(item)"
              />
            </template>
            <!--<template v-else>-->
            <!--재약정 아닐때, 노출-->
            <template v-else-if="item.resultDiv=='1'">
              <kw-btn
                v-if="item.pymnSkipYn === 'N'"
                :label="$t('MSG_TXT_NON_FCF_PYMNT')"
                padding="10px"
                @click="onClickNonFcfPayment(item)"
              />
              <kw-btn
                :label="$t('MSG_BTN_F2F_PYMNT')"
                padding="10px"
                @click="onClickF2fPayment(item)"
              />
            </template>
            <kw-btn
              :label="$t('MSG_BTN_DEL')"
              padding="10px"
              @click="onClickContractDelete(item)"
            />
          </div>
          <!-- 결제중 -->
          <div
            v-else-if="item.viewCntrPrgsStatCd === '40'"
            class="button-wrap"
          >
            <kw-btn
              :label="$t('MSG_BTN_MOD')"
              padding="12px"
              @click="onClickCDChgandModify(item)"
            />
            <kw-btn
              :label="$t('MSG_BTN_INQR')"
              padding="10px"
              @click="onClickModify(item)"
            />
            <kw-separator
              vertical
              inset
              spaced="0px"
            />
            <kw-btn
              :label="$t('MSG_BTN_F2F_PYMNT')"
              padding="10px"
              @click="onClickF2fPayment(item)"
            />
            <kw-btn
              :label="$t('MSG_BTN_DEL')"
              padding="10px"
              @click="onClickContractDelete(item)"
            />
          </div>
          <!-- 결제완료 -->
          <div
            v-else-if="item.viewCntrPrgsStatCd === '50'"
            class="button-wrap"
          >
            <kw-btn
              :label="$t('MSG_BTN_INQR')"
              padding="10px"
              @click="onClickModify(item)"
            />
            <kw-separator
              vertical
              inset
              spaced="0px"
            />
            <template v-if="searchParams.isBrmgr === 'Y'">
              <kw-btn
                :label="$t('MSG_TXT_NON_FCF_PYMNT')"
                padding="10px"
                @click="onClickNonFcfPayment(item)"
              />
              <!--확정-->
              <kw-btn
                v-if="item.dfntaprcnt > 0"
                :label="$t('MSG_BTN_DTRM')"
                padding="10px"
                @click="onClickConfirm(item)"
              />
            </template>
            <template v-else>
              <!--확정요청-->
              <kw-btn
                v-if="item.dfntaprcnt > 0 && item.pymnSkipYn === 'Y'"
                :label="$t('MSG_BTN_DTRM')+$t('MSG_BTN_RQST')"
                padding="10px"
                @click="onClickRequestConfirm(item)"
              />
            </template>
          </div>
          <!-- 확정 -->
          <div
            v-else-if="item.viewCntrPrgsStatCd === '60'"
            class="button-wrap"
          >
            <!--지점장이고, 삭제요청된 상태일 때, -->
            <template v-if="searchParams.isBrmgr === 'Y' && item.deleteDv=='REQ'">
              <kw-btn
                :label="$t('MSG_BTN_DLT')"
                padding="10px"
                @click="onClickReject(item)"
              />
              <kw-btn
                :label="$t('MSG_BTN_DLT_APPRVL')"
                padding="10px"
                @click="onClickApproval(item)"
              />
            </template>
            <template v-else>
              <kw-btn
                :label="$t('MSG_BTN_INQR') "
                padding="10px"
                @click="onClickModify(item)"
              />
              <kw-separator
                vertical
                inset
                spaced="0px"
              />
              <!--설치배정 -->
              <kw-btn
                v-if="item.sellTpCd!=='3' && item.installYn ==='Y'"
                :label="$t('MSG_BTN_CNTCT_ASSGNMNT')"
                padding="10px"
                @click="onClickAssignContact(item)"
              />
              <!--계약변경 -->
              <kw-btn
                :label="$t('MSG_TXT_CNTRCT')+$t('MSG_BTN_CH')"
                padding="10px"
                @click="onClickChange(item)"
              />
              <!--삭제-->
              <kw-btn
                v-if="item.deleteDv=='DEL' || (searchParams.isBrmgr === 'Y' && item.deleteDv=='PSB')"
                :label="$t('MSG_BTN_DEL')"
                padding="10px"
                @click="onClickContractDelete(item)"
              />
              <!--삭제요청-->
              <kw-btn
                v-if="searchParams.isBrmgr !== 'Y' && item.deleteDv=='PSB'"
                :label="$t('MSG_TXT_DEL_REQ')"
                padding="10px"
                @click="onClickRequestDelete(item)"
              />
            </template>
          </div>
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
import { codeUtil, popupUtil, router, stringUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import { buildUrlForNoSession, getSystemOrigin } from '~sms-common/contract/util';

const { alert, modal, confirm } = useGlobal();
const dataService = useDataService();
const { t } = useI18n();
const { getUserInfo } = useMeta();
const sessionUserInfo = getUserInfo();
const now = dayjs();
const contractNumberRegEx = RegExp(`^${sessionUserInfo.tenantCd}\\d{0,11}?$`); // 계약번호 입력 정규식

const props = defineProps({
  srchCstNm: { type: String, default: '' },
});

const resultList = ref({});
const summary = ref({
  cnfm: '0',
  aprv: '0',
  wrte: '0',
  inprgs: '0',
  delreq: '0',
});

const codes = await codeUtil.getMultiCodes(
  'CNTR_PRGS_STAT_CD',
  'SELL_TP_DTL_CD',
);

const searchParams = ref({
  rcpStrtDt: now.startOf('month').format('YYYYMMDD'),
  rcpEndDt: now.format('YYYYMMDD'),
  cntrPrgsStatCd: '',
  pdDvCd: '',
  srchDv: 'NM',
  srchText: '',
  srchCstNm: '',
  srchCntrNo: '',
  prtnrNm: '',
  isBrmgr: (sessionUserInfo.careerLevelCode === '7' ? 'Y' : ''),
  isBrmgrCntr: 'N',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 8,
});

let cachedParams;

// 99 [삭제] 대신 [삭제요청] 으로 사용. 실제 조건문은 쿼리 확인.
const cntrPrgsStatCds = codes.CNTR_PRGS_STAT_CD.filter((v) => ((searchParams.value.isBrmgr === 'Y') ? ['10', '20', '30', '40', '50', '60', '99'] : ['10', '20', '30', '40', '50', '60']).includes(v.codeId));
codes.CNTR_PRGS_STAT_CD.forEach((e) => { e.codeName = (e.codeId === '99' ? '삭제요청' : e.codeName); });

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
/*
item.viewCntrPrgsStatCd :
 - 일반 : CNTR_PRGS_STAT_CD
 - 재약정 : RSTL_STAT_CD 010 -> 20(접수) / 020 -> 60(확정)

item.confirmPsbYn : 작성완료 상태에서 결제진행하지 않고 확정시킬 수 있는지 여부
 - 쿼리 조건문
 CASE WHEN (세션.ogTpCd = 'W04' AND 법인) OR (T7.SELL_INFLW_CHNL_DTL_CD = '5010' AND 개인) THEN 'Y'
      ELSE 'N'

item.deleteDv : 삭제관련 버튼 노출용
 - REQ:삭제요청됨 / 관리자 일 때 [삭제승인] [삭제반려], 판매자일때 []
 - DEL:삭제가능 / [삭제]
 - PSB: 삭제요청가능 / 관리자 일 때 [삭제], 판매자일때 [삭제요청]

 - 쿼리 조건문
 CASE WHEN 계약기본.CNTR_CAN_DTM IS NOT NULL THEN 'REQ'
      WHEN 계약기본.CNTR_RCP_FSH_DTM = 당일 THEN 'DEL'
      WHEN 계약기본.CNTR_CAN_DTM IS NULL AND 계약기본.CNTR_RCP_FSH_DTM >= 5일이내 AND 계약상세.SELL_TP_CD = '2' THEN
        CASE WHEN (SUM(입금내역)) = 0 THEN 'PSB'
             ELSE ''
         END
      ELSE ''
*/

async function fetchData() {
  if (isEmpty(cachedParams)) return;

  if (!isEmpty(cachedParams.srchDv)) {
    cachedParams.srchText = (cachedParams.srchDv === 'NO') ? cachedParams.srchCntrNo : cachedParams.srchCstNm;
  }

  const res = await dataService.get('/sms/wells/contract/contracts/contract-lists', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: details, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  resultList.value = details;
}

async function fetchDataSummary() {
  if (isEmpty(cachedParams)) return;

  const res = await dataService.get(
    '/sms/wells/contract/contracts/contract-lists/summary',
    { params: { ...cachedParams } },
  );
  summary.value = res.data;
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();

  if (resultList.value.length > 0) {
    await fetchDataSummary();
  } else {
    summary.value.cnfm = '0';
    summary.value.aprv = '0';
    summary.value.wrte = '0';
    summary.value.inprgs = '0';
    summary.value.delreq = '0';
  }
}

// summary 클릭
async function onClickPrgsSearch(prgsCd) {
  if (prgsCd) {
    searchParams.value.cntrPrgsStatCd = prgsCd;
  }
  await onClickSearch();
}

// 검색 > 계약자/계약번호 구분 변경
function onChangeSearchDiv() {
  searchParams.value.srchCntrNo = '';
  searchParams.value.srchCstNm = '';
  searchParams.value.srchText = '';
}

// 검색 > 계약번호 검색 팝업
async function onClickCntrNoPop() {
  if (searchParams.value.srchDv !== 'NO') { return; }

  const { result, payload } = await modal({
    component: 'WwctaContractNumberListP',
    componentProps: { cntrNo: searchParams.value.srchCntrNo.toLocaleUpperCase() },
  });

  if (result) {
    searchParams.value.srchCntrNo = payload.cntrNo;
  }
}

// 계약관리 버튼 클릭
async function onClickManage() {
  router.replace(
    {
      path: 'wwcta-contract-management-list',
    },
  );
}

// 계약상태코드 재조회
async function getPrgsStatCd({ resultDiv, cntrNo, cntrSn, cntrPrgsStatCd }) {
  let res;
  if (resultDiv === '1') {
    res = await dataService.get(`/sms/wells/contract/contracts/contract-lists/${cntrNo}`);
  } else {
    res = await dataService.get(`/sms/wells/contract/contracts/contract-lists/${cntrNo}/${cntrSn}`);
  }

  console.log(`${res.data.toString()}, ${typeof (res.data.toString())}, ${cntrPrgsStatCd}, ${typeof cntrPrgsStatCd}, ${res.data.toString() === cntrPrgsStatCd}`);

  if (res.data.toString() !== cntrPrgsStatCd) {
    await alert(t('MSG_ALT_NOT_SYNC_REFRESH'));
    await onClickSearch();
    return false;
  }
  return true;
}

// 계약 삭제
async function deleteContract(msg, item) {
  if (!await confirm(msg)) { return; } // 삭제 하시겠습니까?

  // 확정이고 당일삭제건에 대해서는 결제승인취소를 취해 파라미터를 설정한다.
  let stlmTarget = 'N';
  if (item.viewCntrPrgsStatCd === '60' && item.cntrRcpFshDtm.substring(0, 8) === now.format('YYYYMMDD')) {
    stlmTarget = 'Y';
  }

  /*
  //삭제 파라미터
  cntrSn / resultDiv : 재약정 삭제시 필요
  stlmTarget : 결제승인취소 시 필요
  */
  if (isEmpty(item.cntrSn)) { item.cntrSn = ''; }
  await dataService.delete('/sms/wells/contract/contracts/contract-lists/', { params: { cntrNo: item.cntrNo, cntrSn: item.cntrSn, resultDiv: item.resultDiv, stlmTarget } });
  onClickSearch();
}

// CARD > 확정대상자조회 클릭
async function onClickConfirmTarget(paramCntrNo) {
  await modal({
    component: 'WwConfirmApprovalAskIzListP',
    componentProps: { cntrNo: paramCntrNo },
  });
}

// CARD > BUTTON > 수정
async function onClickCDChgandModify({ resultDiv, cntrNo, cntrSn, cntrPrgsStatCd }) {
  let paramPrgsStatCd = cntrPrgsStatCd;

  // [결제중] 에서 수정은 계약진행상태코드 변경 후 수정페이지로 링크.
  if (paramPrgsStatCd === '40') {
    // 계약진행상태코드 재확인
    if (!await getPrgsStatCd({ resultDiv, cntrNo, cntrSn, cntrPrgsStatCd })) { return; }

    // 계약진행상태코드 수정
    paramPrgsStatCd = '20';
    await dataService.put(`/sms/wells/contract/contracts/contract-lists/change-prgs-cd/${cntrNo}`, null, { params: { cntrPrgsStatCd: '20' } });
    await onClickSearch();
  }

  router.replace({
    path: 'wwcta-contract-registration-mgt',
    query: {
      resultDiv,
      cntrNo,
      cntrSn,
      cntrPrgsStatCd: paramPrgsStatCd,
    },
  });
}

// CARD > BUTTON > 수정/조회
async function onClickModify({ resultDiv, cntrNo, cntrSn, cntrPrgsStatCd }) {
  router.replace({
    path: 'wwcta-contract-registration-mgt',
    query: {
      resultDiv,
      cntrNo,
      cntrSn,
      cntrPrgsStatCd,
    },
  });
}

//  CARD > BUTTON > 계약변경
async function onClickChange({ cntrNo, cntrCnfmDtm }) {
  cntrCnfmDtm = cntrCnfmDtm.substring(0, 8);

  router.replace({
    path: 'wwctb-contract-change-mgt',
    query: {
      cntrNo,
      cntrCnfmDt: cntrCnfmDtm,
    },
  });
}

// CARD > BUTTON > 비대면결제
async function onClickNonFcfPayment(item) {
  if (item.viewCntrPrgsStatCd === '20' || item.viewCntrPrgsStatCd === '50') {
    // 계약진행상태코드 재확인
    if (!await getPrgsStatCd(item)) { return; }

    let message = t('MSG_ALT_STLM_URL_CONFIRM', [item.cstKnm, item.mobileTelNo]);
    if (item.viewCntrPrgsStatCd === '50') { message = `[${t('MSG_TXT_RESEND')}] ${message}`; }

    if (!await confirm(message)) { return; }

    const telNo = item.mobileTelNo.replaceAll('-', '');
    const url = await buildUrlForNoSession(getSystemOrigin('wsm'), 'WwctaContractSettlementLoginMgtM', { cntrNo: item.cntrNo }, true, true);
    const params = {
      type: 'SMS',
      receiver: `${item.cstKnm}^${telNo}`,
      url,
    };
    console.log(params);
    /// 곧 발송방식 및 양식 정해지면 전송
    /// await dataService.post('/sms/wells/contract/contracts/contract-lists/send-messages', params);
  }
}

// CARD > BUTTON > 대면결제
async function onClickF2fPayment(item) {
  if (item.viewCntrPrgsStatCd === '20' || item.viewCntrPrgsStatCd === '40') {
    // 계약진행상태코드 재확인
    if (!await getPrgsStatCd(item)) { return; }

    const { cntrNo } = item;
    const routeParams = new URLSearchParams({ cntrNo });
    const routePath = '/wwcta-contract-settlement-login-mgt';
    const hash = `#${routePath}/?${routeParams.toString()}`;
    const url = `/mobile${hash}`;

    const { result, payload } = await popupUtil.open(url, { width: 360, height: 740 });

    if (result || payload === 'forceClosed') {
      await onClickSearch();
    }
  }
}

// CARD > BUTTON > 확정요청
async function onClickRequestConfirm(item) {
  console.log(item);

  if (!await confirm('해당 주문을 확정 요청 하시겠습니까?')) { return; }

  // 사내메신져로 확정요청 발송 (/reqDfntAckd/{wpnSeq} 참조)
  const params = {
    type: 'KWork',
    receiver: 'kworkId',
  };
  await dataService.post('/sms/wells/contract/contracts/contract-lists/send-messages', params);
}

// CARD > BUTTON > 확정승인
async function onClickConfirm({ cntrNo }) {
  if (!await confirm(t('MSG_ALT_IS_DTRM'))) { return; } // 확정하시겠습니까?

  await dataService.put(`/sms/wells/contract/contracts/contract-lists/change-prgs-cd/${cntrNo}`, null, { params: { cntrPrgsStatCd: '60' } });
  onClickSearch();
}

// CARD > BUTTON > 설치배정
async function onClickAssignContact(item) {
  await modal({
    component: 'WwctaContractStatusInstallationContractSppRegP',
    componentProps: { cntrNo: item.cntrNo },
  });
}

// CARD > BUTTON > 삭제
async function onClickContractDelete(item) {
  // 계약진행상태코드 재확인
  if (!await getPrgsStatCd(item)) { return; }

  if (item.viewCntrPrgsStatCd <= '40' || item.viewCntrPrgsStatCd === '60') {
    // 계약 삭제 호출
    deleteContract(t('MSG_ALT_WANT_DEL_WCC'), item);
  }
}

// CARD > BUTTON > 삭제요청
// 삭제요청은 계약기본의 계약취소일시에 값을 넣음으로써 처리
async function onClickRequestDelete({ cntrNo }) {
  if (!await confirm(t('MSG_ALT_CNTR_DEL_AK_CONFIRM', [cntrNo]))) { return; }

  await dataService.put(`/sms/wells/contract/contracts/contract-lists/delete-request/${cntrNo}`);
  onClickSearch();
}
// CARD > BUTTON > 삭제반려
async function onClickReject({ cntrNo }) {
  if (!await confirm(t('MSG_ALT_BAT_RJT_PRGS'))) { return; } // 반려 하시겠습니까?

  await dataService.put(`/sms/wells/contract/contracts/contract-lists/delete-reject/${cntrNo}`);
  onClickSearch();
}

// CARD > BUTTON > 삭제승인
async function onClickApproval(item) {
  // 계약 삭제 호출
  deleteContract(t('MSG_ALT_APPR'), item);// 승인하시겠습니까?
}

watch(props, () => {
  const { srchCstNm } = props;

  if (srchCstNm) {
    searchParams.value.srchCstNm = srchCstNm;
    onClickSearch();
  }
}, { deep: true });

onMounted(async () => {
  if (props.srchCstNm) { searchParams.value.srchCstNm = props.srchCstNm; }
  await onClickSearch();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>

<style lang="scss" scoped>
.kw-card {
  display: flex;
  flex-flow: column wrap;
  cursor: pointer;

  // min-width: 450px;
  // width: calc((100% - 60px) / 3);
  width: calc((100% - 80px) / 4);
}

.state-chip {
  margin-top: auto;
  flex: none;
  max-width: max-content;
  height: 24px;
  border-radius: 10px !important;
  background-color: rgba(47 138 243 / 10%);
  font-size: 14px;
  font-weight: 500;
}

// rev:230601 수정
.button-wrap {
  display: flex;
  column-gap: 8px;
  flex-flow: row nowrap;
  white-space: nowrap;
}

// //rev:230601 수정

// rev:230706 추가
.scoped-progress-bar {
  margin: 20px 0;
  width: 100%;
  height: 6px;
  background-color: #ddd;

  &__value {
    height: 100%;
    background-color: $primary;
  }
}

// //rev:230706 추가
</style>
<!-- // // rev:230821 스타일 수정 -->
