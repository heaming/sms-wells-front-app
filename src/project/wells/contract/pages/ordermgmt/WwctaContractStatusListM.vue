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
            @click-icon="onClickCntrNoPop"
          />
          <!--   console.log(payload); -->
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
            <p
              v-if="item.numprds > 1"
              class="kw-font-pt18 kw-fc--primary"
            >
              {{ item.sellTpNm }} 외 {{ item.numprds-1 }}건
            </p>
            <p
              v-else
              class="kw-font-pt18 kw-fc--primary"
            >
              {{ item.sellTpNm }}
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
            <li>
              <p
                v-if="Number(item.pymnamt) > 0 && item.viewCntrPrgsStatCd < 60"
                class="w90"
              >
                {{ t('MSG_TXT_DPST_AMT') }}
              </p>
              <p
                v-else
                class="w90"
              >
                <br>
              </p>
              <span
                v-if="Number(item.pymnamt) > 0 && item.viewCntrPrgsStatCd < 60"
                class="text-weight-bold kw-fc--error"
              >
                {{ stringUtil.getNumberWithComma(item.pymnamt||0) }}원
              </span>
              <span
                v-else
              >
                <br>
              </span>
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

          <kw-chip class="state-chip">
            {{ item.cntrPrgsStatNm }}
          </kw-chip>
          <!-- 확정요청대상조회 -->
          <span
            v-if="item.viewCntrPrgsStatCd === '50' && searchParams.isBrmgr != 'Y'"
            style="float: right;"
            @click="onClickConfirmTarget(item.cntrNo)"
          >
            {{ t('MSG_TXT_CNFM_REQ_TGT')+t('MSG_TXT_SRCH') }}
          </span>

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
              padding="12px"
              @click="onClickModify(item)"
            />
            <kw-separator
              vertical
              inset
              spaced="0px"
            />
            <kw-btn
              :label="$t('MSG_BTN_DEL')"
              padding="12px"
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
              padding="12px"
              @click="onClickModify(item)"
            />
            <kw-separator
              vertical
              inset
              spaced="0px"
            />
            <kw-btn
              v-if="item.viewCntrPrgsStatCd === '20' && item.pymnSkipYn === 'N'"
              :label="$t('MSG_TXT_NON_FCF_PYMNT')"
              padding="12px"
              @click="onClickNonFcfPayment(item)"
            />
            <kw-btn
              :label="$t('MSG_BTN_F2F_PYMNT')"
              padding="12px"
              @click="onClickF2fPayment(item)"
            />
            <kw-btn
              :label="$t('MSG_BTN_DEL')"
              padding="12px"
              @click="onClickContractDelete(item)"
            />
          </div>
          <!-- 결제중 -->
          <div
            v-else-if="item.viewCntrPrgsStatCd === '40'"
            class="button-wrap"
          >
            <kw-btn
              :label="$t('MSG_BTN_INQR')"
              padding="12px"
              @click="onClickModify(item)"
            />
            <kw-separator
              vertical
              inset
              spaced="0px"
            />
            <kw-btn
              :label="$t('MSG_BTN_F2F_PYMNT')"
              padding="12px"
              @click="onClickF2fPayment(item)"
            />
          </div>
          <!-- 결제완료 -->
          <div
            v-else-if="item.viewCntrPrgsStatCd === '50'"
            class="button-wrap"
          >
            <kw-btn
              :label="$t('MSG_BTN_INQR')"
              padding="12px"
              @click="onClickModify(item)"
            />
            <kw-separator
              vertical
              inset
              spaced="0px"
            />
            <kw-btn
              v-if="searchParams.isBrmgr !='Y' && item.dfntaprcnt > 0 && item.pymnSkipYn === 'Y'"
              :label="$t('MSG_BTN_DTRM')+$t('MSG_BTN_RQST')"
              padding="12px"
              @click="onClickRequestConfirm(item)"
            />
            <!-- TODO : 결재완료 / 지점장 일때 비대면결제 버튼 노출 조건 확인 -->
            <kw-btn
              v-if="searchParams.isBrmgr ==='Y'"
              :label="$t('MSG_TXT_NON_FCF_PYMNT')"
              padding="12px"
              @click="onClickNonFcfPayment(item)"
            />
            <kw-btn
              v-if="searchParams.isBrmgr ==='Y' && item.dfntaprcnt > 0"
              :label="$t('MSG_BTN_DTRM')"
              padding="12px"
              @click="onClickApprovalConfirm(item)"
            />
          </div>
          <!-- 확정 -->
          <div
            v-else-if="item.viewCntrPrgsStatCd === '60'"
            class="button-wrap"
          >
            <kw-btn
              :label="$t('MSG_BTN_INQR')"
              padding="12px"
              @click="onClickModify(item)"
            />
            <kw-separator
              vertical
              inset
              spaced="0px"
            />
            <!--설치배정 -->
            <kw-btn
              v-if="item.installYn ==='Y'"
              :label="$t('MSG_BTN_CNTCT_ASSGNMNT')"
              padding="12px"
              @click="onClickAssignContact(item)"
            />
            <kw-btn
              :label="$t('MSG_TXT_CNTRCT')+$t('MSG_BTN_CH')"
              padding="12px"
              @click="onClickModify(item)"
            />
            <!-- TODO : 확정 / 삭제 버튼 노출 조건 확인 : 계약접수완료일시===now
                               삭제/삭제요청 버튼 비노출 조건 문의 : 설치가 완료된 건일 경우
            -->
            <kw-btn
              v-if="item.cntrRcpFshDtm === dayjs().format('YYYYMMDD')"
              :label="$t('MSG_BTN_DEL')"
              padding="12px"
              @click="onClickContractDelete(item)"
            />
            <kw-btn
              v-else-if="item.cntrRcpFshDtm >= dayjs().add(-5, 'day').format('YYYYMMDD')"
              :label="$t('MSG_TXT_DEL_REQ')"
              padding="12px"
              @click="onClickRequestDelete(item)"
            />
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

const { notify, alert, modal, confirm } = useGlobal();
const dataService = useDataService();
const { t } = useI18n();
const { getUserInfo } = useMeta();
const sessionUserInfo = getUserInfo();
const now = dayjs();

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

// TODO : 99대신, 삭제요청, 삭제확정 들어가야함
const cntrPrgsStatCds = codes.CNTR_PRGS_STAT_CD.filter((v) => ((searchParams.value.isBrmgr === 'Y') ? ['10', '20', '30', '40', '50', '60', '99'] : ['10', '20', '30', '40', '50', '60']).includes(v.codeId));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
/*
item.viewCntrPrgsStatCd :
 - 일반 : CNTR_PRGS_STAT_CD
 - 재약정 : RSTL_STAT_CD 010 -> 20(접수) / 020 -> 60(확정)
*/

async function fetchData() {
  if (isEmpty(cachedParams)) return;

  if (!isEmpty(cachedParams.srchDv)) {
    cachedParams.srchText = (cachedParams.srchDv === 'NO') ? cachedParams.srchCntrNo : cachedParams.srchCstNm;
  }
  console.log(cachedParams);

  const res = await dataService.get('/sms/wells/contract/contracts/contract-lists', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: details, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  resultList.value = details;
}

async function fetchDataSummary() {
  if (isEmpty(cachedParams)) return;

  const res = await dataService.get('/sms/wells/contract/contracts/contract-lists/summary', { params: { ...cachedParams } });
  summary.value = res.data;
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
  await fetchDataSummary();
}

async function onClickCntrNoPop() {
  if (searchParams.value.srchDv !== 'NO') { return; }

  const { result, payload } = await modal({
    component: 'WwctaContractNumberListP',
    componentProps: { cntrNo: searchParams.value.srchCntrNo },
  });

  if (result) {
    searchParams.value.srchCntrNo = payload.cntrNo;
  }
}

function onChangeSearchDiv() {
  searchParams.value.srchCntrNo = '';
  searchParams.value.srchCstNm = '';
  searchParams.value.srchText = '';
}

// 카드 하단 버튼 클릭 전, 계약상태코드 재조회
async function getPrgsStatCd(cntrNo) {
  const res = await dataService.get(`/sms/wells/contract/contracts/contract-lists/${cntrNo}`);

  return Number(res.data);
}

// 화면 상단 summary 클릭
async function onClickPrgsSearch(prgsCd) {
  if (prgsCd) {
    searchParams.value.cntrPrgsStatCd = prgsCd;
  }
  await onClickSearch();
}

// 계약관리 클릭
async function onClickManage() {
  router.replace(
    {
      path: 'wwcta-contract-management-list',
    },
  );
}

// 확정대상자조회
async function onClickConfirmTarget(paramCntrNo) {
  await modal({
    component: 'WwConfirmApprovalAskIzListP',
    componentProps: { cntrNo: paramCntrNo },
  });
}

// 수정
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

async function onClickNonFcfPayment(item) {
  if (item.viewCntrPrgsStatCd === '20' || item.viewCntrPrgsStatCd === '40') {
    // 계약진행상태코드 재확인
    const nowPrgsStatCd = await getPrgsStatCd(item.cntrNo);
    if (Number(item.viewCntrPrgsStatCd) !== nowPrgsStatCd) {
      await alert(t('MSG_ALT_NOT_SYNC_REFRESH'));
      await onClickSearch();
      return;
    }

    let message = t('MSG_ALT_STLM_URL_CONFIRM', [item.cstKnm, item.mobileTelNo]);
    if (item.viewCntrPrgsStatCd === '40') { message = `[${t('MSG_TXT_RESEND')}]${message}`; }

    if (!await confirm(message)) { return; }

    const telNo = item.mobileTelNo.replace('-', '');
    const params = {
      type: 'SMS',
      receiver: `${item.cstKnm}^${telNo}`,
      url: `/payment?cntrNo=${item.cntrNo}`,
    };

    await dataService.post('/sms/wells/contract/contracts/contract-lists/send-messages', params);
  }
}

async function onClickF2fPayment(item) {
  if (item.viewCntrPrgsStatCd === '20' || item.viewCntrPrgsStatCd === '40') {
    // 계약진행상태코드 재확인
    const nowPrgsStatCd = await getPrgsStatCd(item.cntrNo);
    if (Number(item.viewCntrPrgsStatCd) !== nowPrgsStatCd) {
      await alert(t('MSG_ALT_NOT_SYNC_REFRESH'));
      await onClickSearch();
      return;
    }

    /*
    // 통테 이후 주석 제거 (암호화 하지 않음)
    // URL 암호화
    const res = await dataService.post('/sms/wells/contract/contracts/contract-lists/make-url',
     { url: `${consts.HTTP_ORIGIN}/payment?cntrNo=${item.cntrNo}` });

    // 신규 윈도우 페이지에서 위 URL을 POST 로 전송
    if (!isEmpty(res.data)) {
      // TODO : (확인) - 신규 윈도우 페이지에서 위 URL을 POST 로 전송한다.
      // await window.open(`${res.data}`);
      await popupUtil.open(`${res.data}`, { width: 500, height: 700 }, false);
    }
    */

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

async function onClickApprovalConfirm(item) {
  notify(`TODO : ${item.cntrNo} - 확정승인 프로세스`);

  // TODO : 확정승인 프로세스.
}

async function onClickAssignContact(item) {
  console.log(item);

  const response = await dataService.get(`/sms/wells/contract/contracts/contract-lists/${item.cntrNo}/installation-order-targets`);
  const installationOrderTargetCntrSns = response.data || [];

  if (installationOrderTargetCntrSns.length === 0) {
    alert(t('MSG_ALT_NO_IST_TG')); /* '설치 오더 대상 상품이 없습니다.' */
    return;
  }

  // 설치오더 시작
  const res = await modal({
    component: 'WwsncTimeTableForContractP',
    componentProps: {
      sellDate: item.cntrCnfmDtm.substring(0, 8), // 판매일자
      baseYm: now.format('YYYYMM'), // 달력 초기 월
      chnlDvCd: 'K', // W: 웰스, K: KSS, C: CubicCC, P: K-MEMBERS, I || E: 엔지니어, M: 매니저
      svDvCd: '1', // 1:설치, 2:BS, 3:AS, 4:홈케어
      svBizDclsfCd: installationOrderTargetCntrSns.map(() => '1110').join(','), // 판매인 경우 1110(신규설치) fix
      cntrNo: item.cntrNo,
      cntrSn: installationOrderTargetCntrSns.join(','),
      dataStatCd: '1', // 1: 신규, 2: 수정, 3: 삭제
      userId: item.sellPrtnrNo,
      mtrStatCd: '1',
    },
  });

  console.log(res);
}

async function onClickRequestDelete(item) {
  console.log(item);
  notify('TODO : 계약삭제요청 프로세스');

  // TODO : 계약삭제요청 프로세스
}

async function onClickContractDelete(item) {
  if (item.viewCntrPrgsStatCd <= '20') {
    if (!await confirm(t('MSG_ALT_WANT_DEL_WCC'))) { return; }

    await dataService.delete('/sms/wells/contract/contracts/contract-lists/', { params: { cntrNo: item.cntrNo } });
    onClickSearch();
  }
}

onActivated(async () => {
  await onClickSearch();
});

onMounted(async () => {
  await onClickSearch();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>

<style lang="scss" scoped>
.kw-card {
  cursor: pointer;

  // min-width: 450px;
  width: calc((100% - 80px) / 4);
}

.state-chip {
  height: 24px;
  border-radius: 10px !important;
  background-color: rgba(47 138 243 / 10%);
  font-size: 14px;
  font-weight: 500;
}

.button-wrap {
  display: flex;
  column-gap: 6px;
  flex-flow: row nowrap;
  white-space: nowrap;

  ::v-deep(.kw-btn) {
    padding: 8px 0;
    flex: 1 1 100%;
    font-size: 14px;
    font-weight: normal;
    letter-spacing: normal;
    color: #555;
    min-height: 40px;
  }
}
</style>
