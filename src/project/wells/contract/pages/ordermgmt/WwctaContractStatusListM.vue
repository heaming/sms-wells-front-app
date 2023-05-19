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
- 계약현황 목록
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
            :options="[{codeId:'NM', codeName:'계약자명'},
                       {codeId:'NO', codeName:'계약번호'},
            ]"
          />
          <kw-input
            v-if="searchParams.srchDv === 'NM'"
            v-model="searchParams.srchText"
            maxlength="50"
          />
          <kw-input
            v-else
            v-model="searchParams.srchText"
            icon="search"
            maxlength="12"
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
              v-if="item.numprds > 0"
              class="kw-font-pt18 kw-fc--primary"
            >
              {{ item.sellTpDtlNm }} 외 {{ item.numprds }}건
            </p>
            <p
              v-else
              class="kw-font-pt14 kw-fc--black2"
            >
              {{ item.sellTpNm }}
            </p>
          </div>
          <p class="kw-font-subtitle mt20">
            {{ item.cstKnm }}({{ item.bryyMmdd }})

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
              <span>
                {{ dayjs( item.cntrRcpFshDtm).format('YYYY-MM-DD') }}
              </span>
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
              <p class="w90">
                {{ t('MSG_TXT_DPST_AMT') }}
              </p>
              <span class="text-weight-bold kw-fc--error">
                {{ item.pymnamt }}원
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
            v-if="item.cntrPrgsStatCd === '50' && searchParams.isBrmgr != 'Y'"
            style="float: right;"
            @click="onClickConfirmTarget(item.cntrNo)"
          >
            {{ t('MSG_TXT_CNFM_REQ_TGT')+t('MSG_TXT_SRCH') }}
          </span>

          <kw-separator spaced="20px" />

          <!-- 임시저장 -->
          <div
            v-if="Number(item.cntrPrgsStatCd) < 20"
            class="button-wrap"
          >
            <kw-btn
              :label="$t('MSG_BTN_MOD')"
              @click="onClickModify(item.cntrPrgsStatCd, item.cntrNo)"
            />
          </div>
          <!-- 작성완료 -->
          <div
            v-else-if="item.cntrPrgsStatCd === '20'"
            class="button-wrap"
          >
            <kw-btn
              :label="$t('MSG_BTN_MOD')"
              @click="onClickModify(item.cntrPrgsStatCd, item.cntrNo)"
            />
            <kw-btn
              v-if="item.cstStlmInMthCd === '20' && item.pymnSkipYn === 'N'"
              :label="$t('MSG_TXT_NON_FCF_PYMNT')"
              @click="onClickNonFcfPayment(item)"
            />
            <kw-btn
              v-if="item.pymnSkipYn === 'Y'"
              :label="$t('MSG_BTN_F2F_PYMNT')"
              @click="onClickF2fPayment(item)"
            />
            <kw-btn
              :label="$t('MSG_BTN_DEL')"
              @click="onClickContractDelete(item)"
            />
          </div>
          <!-- 결제중 -->
          <div
            v-else-if="item.cntrPrgsStatCd === '40'"
            class="button-wrap"
          >
            <kw-btn
              :label="$t('MSG_BTN_INQR')"
              @click="onClickModify(item.cntrPrgsStatCd, item.cntrNo)"
            />
            <kw-btn
              :label="$t('MSG_BTN_F2F_PYMNT')"
              @click="onClickF2fPayment(item)"
            />
          </div>
          <!-- 결제완료 -->
          <div
            v-else-if="item.cntrPrgsStatCd === '50'"
            class="button-wrap"
          >
            <kw-btn
              :label="$t('MSG_BTN_INQR')"
              @click="onClickModify(item.cntrPrgsStatCd, item.cntrNo)"
            />
            <kw-btn
              v-if="searchParams.isBrmgr !='Y' && item.dfntaprcnt > 0 && item.pymnSkipYn === 'Y'"
              :label="$t('MSG_BTN_DTRM')+$t('MSG_BTN_RQST')"
              @click="onClickRequestConfirm(item)"
            />
            <!-- TODO : 결재완료 / 지점장 일때 비대면결제 버튼 노출 조건 확인 -->
            <kw-btn
              v-if="searchParams.isBrmgr ==='Y'"
              :label="$t('MSG_TXT_NON_FCF_PYMNT')"
              @click="onClickNonFcfPayment(item)"
            />
            <kw-btn
              v-if="searchParams.isBrmgr ==='Y' && item.dfntaprcnt > 0"
              :label="$t('MSG_BTN_DTRM')"
              @click="onClickApprovalConfirm(item)"
            />
          </div>
          <!-- 확정 -->
          <div
            v-else-if="item.cntrPrgsStatCd === '60'"
            class="button-wrap"
          >
            <kw-btn
              :label="$t('MSG_BTN_INQR')"
              @click="onClickModify(item.cntrPrgsStatCd, item.cntrNo)"
            />
            <kw-btn
              :label="$t('MSG_BTN_CNTCT_ASSGNMNT')"
              @click="onClickAssignContact(item)"
            />
            <kw-btn
              :label="$t('MSG_TXT_CNTRCT')+$t('MSG_BTN_CH')"
              @click="onClickContractModify(item)"
            />
            <!-- TODO : 확정 / 삭제 버튼 노출 조건 확인 : 계약접수완료일시===now
                               삭제/삭제요청 버튼 비노출 조건 문의 : 설치가 완료된 건일 경우
            -->
            <kw-btn
              v-if="item.cntrRcpFshDtm === dayjs().format('YYYYMMDD')"
              :label="$t('MSG_BTN_DEL')"
              @click="onClickContractDelete(item)"
            />
            <kw-btn
              v-else-if="item.cntrRcpFshDtm >= dayjs().add(-5, 'day').format('YYYYMMDD')"
              :label="$t('MSG_TXT_DEL_REQ')"
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
import { codeUtil, router, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { notify, modal, confirm } = useGlobal();
const dataService = useDataService();
const getters = useStore();
const { t } = useI18n();
const careerLevelCode = getters['meta/getUserInfo'];

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
  rcpStrtDt: '',
  rcpEndDt: '',
  cntrPrgsStatCd: '',
  pdDvCd: '',
  srchDv: 'NM',
  srchText: '',
  prtnrNm: '',
  isBrmgr: (careerLevelCode === '7' ? 'Y' : ''), // TODO: 추후 지점장 여부 careerLevelCode=='7' 맞는지 확인
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

async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/contracts/contract-lists', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: details, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  resultList.value = details;
}

async function fetchDataSummary() {
  const res = await dataService.get('/sms/wells/contract/contracts/contract-lists/summary', { params: { ...cachedParams } });
  summary.value = res.data;
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
  await fetchDataSummary();
}

async function onClickPrgsSearch(prgsCd) {
  if (prgsCd) {
    searchParams.value.cntrPrgsStatCd = prgsCd;
  }
  await onClickSearch();
}

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
async function onClickModify(paramStatCd, paramCntrNo) {
  notify(`// TODO : W-SS-U-0022M01 통합계약서${paramStatCd} ${paramCntrNo} 화면으로 이동`);

/*
  let url;
  switch (paramStatCd) {
    case '10':
      url = ''; // STEP1 페이지로 이동
      break;
    case '12':
      url = ''; // STEP2 페이지로 이동
      break;
    case '14':
      url = ''; // STEP3 페이지로 이동
      break;
    default:
      url = ''; // (param 없을 때도,)STEP4 페이지로 이동
      break;
  }
  router.replace(
    { path: url },
  );
  */
}

async function onClickNonFcfPayment(item) {
  if (item.cntrPrgsStatCd === '20' || item.cntrPrgsStatCd === '40') {
    let message = `${item.cstKnm}의 휴대폰 ${item.mobileTelNo}로 결제URL을 발송하시겠습니까?`;
    if (item.cntrPrgsStatCd === '40') message = `[재발송]${message}`;

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
  if (item.cntrPrgsStatCd === '20' || item.cntrPrgsStatCd === '40') {
    const res = await dataService.post('/sms/wells/contract/contracts/contract-lists/make-url', { url: `/payment?cntrNo=${item.cntrNo}` });
    console.log(res.data); // url 리턴됨

    // TODO : (확인) - 신규 윈도우 페이지에서 위 URL을 POST 로 전송한다.
    // await popupUtil.open(`${defaultUrl}${detailUrl}`, { width: 488, height: 597 }, false);
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
  notify('TODO : 컨택배정 프로세스');

  // TODO : 컨택배정 프로세스.
}

async function onClickContractModify(item) {
  notify(`TODO : ${item.cntrNo} - 계약변경 프로세스`);

  // TODO : 계약변경 프로세스.
}

async function onClickRequestDelete(item) {
  console.log(item);
  notify('TODO : 계약삭제요청 프로세스');

  // TODO : 계약삭제요청 프로세스
}

async function onClickContractDelete(item) {
  if (item.cntrPrgsStatCd === '20') {
    await dataService.delete('/sms/wells/contract/contracts/contract-lists', { data: item.cnteNo });
  } else {
    notify('TODO : 계약삭제 1프로세스');

    // TODO : 계약삭제 프로세스
  }
}

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
