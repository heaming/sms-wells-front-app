<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaEstimateOrderWriteListM - 견적 주문 작성 목록 조회
3. 작성자 : JSY
4. 작성일 : 2023.06.21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 컨택고객, 컨택담당자 정보를 엑셀 업로드 - 만료예정고객, 이탈방어 고객 등의 컨택 담당자(아웃바운드) 배정 및 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 견적일 -->
        <kw-search-item
          :label="$t('MSG_TXT_QUOT_MM')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.fromEstDt"
            v-model:to="searchParams.toEstDt"
            :label="$t('MSG_TXT_QUOT_MM')"
            rules="date_range_required"
            type="month"
          />
        </kw-search-item>
        <!-- 조회구분  -->
        <kw-search-item :label="$t('MSG_TXT_INQR_DV')">
          <kw-option-group
            v-model="searchParams.inqrDv"
            type="radio"
            first-option="all"
            :options="codes.WELS_SELL_DV_CD.filter((v) => ['1', '2'].includes(v.codeId))"
          />
        </kw-search-item>
        <!-- 계약자명  -->
        <kw-search-item :label="$t('MSG_TXT_CNTOR_NM')">
          <kw-input
            v-model="searchParams.cntrt"
            maxlength="50"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <!-- 등록  -->
        <kw-btn
          v-permission:create
          primary
          등록
          :label="$t('MSG_BTN_RGST')"
          @click="onClickCntr"
        />
      </kw-action-top>
      <div class="row q-gutter-sm">
        <kw-card
          v-for="(item, idx) of estimateOrderWriteList"
          :key="idx"
        >
          <div class="row items-center justify-between">
            <p class="kw-font--14 kw-fc--black2">
              {{ item.sellTpCdNm }}
            </p>
            <!-- 법인/개인 -->
            <kw-chip
              :label="item.copnDvCd === '2' ? $t('MSG_TXT_CRP') : $t('MSG_TXT_INDV')"
              color="primary"
              outline
            />
          </div>

          <h3 class="mt20 mb12">
            {{ item.cstKnm }}
          </h3>
          <ul class="card-text">
            <li>
              <!-- 계약번호  -->
              <p>{{ $t('MSG_TXT_CNTR_NO') }}</p>
              <span>{{ item.cntrNo }}-{{ item.cntrSn }}</span>
            </li>
            <li>
              <!-- 견적일  -->
              <p>{{ $t('MSG_BTN_QUOTE_DT') }}</p>
              <span>{{ item.cntrTempSaveDt }}</span>
            </li>
            <li>
              <!-- 발송일  -->
              <p>{{ $t('MSG_TXT_FW_DAY') }}</p>
              <span>{{ item.sndDt }}</span>
            </li>
            <li>
              <!-- 상품명  -->
              <p>{{ $t('MSG_TXT_PRDT_NM') }}</p>
              <span>{{ item.pdNm }}</span>
            </li>
            <li>
              <!-- 할인적용가  -->
              <p>{{ $t('MSG_TXT_DIS_APP_PRC') }}</p>
              <span class="text-weight-bold">{{ item.sellAmt }}{{ $t('MSG_TXT_CUR_WON') }}</span>
            </li>
          </ul>

          <kw-separator spaced="20px" />
          <!-- 계약  -->
          <kw-btn
            v-permission:read
            secondary
            :label="$t('MSG_TXT_CNTRCT')"
            padding="10px"
            @click="onClickCntr(item)"
          />
          <!-- 조회  -->
          <kw-btn
            v-permission:read
            secondary
            :label="$t('MSG_BTN_INQR')"
            padding="10px"
            class="ml8"
            @click="onClickSearchPopup"
          />
          <!-- 수정  -->
          <kw-btn
            v-permission:update
            secondary
            :label="$t('MSG_BTN_MOD')"
            padding="10px"
            class="ml8"
            @click="onClickUpdate(item)"
          />
          <!-- 발송  -->
          <kw-btn
            secondary
            :label="$t('MSG_BTN_SEND')"
            padding="10px"
            class="ml8"
            @click="onClickSend(item)"
          />
          <!-- 삭제  -->
          <kw-btn
            v-permission:delete
            secondary
            :label="$t('MSG_BTN_DEL')"
            padding="10px"
            class="ml8"
            @click="onClickDelete(item)"
          />
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
import { codeUtil, notify, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { confirm, modal } = useGlobal();
const now = dayjs();
const dataService = useDataService();
const router = useRouter();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'WELS_SELL_DV_CD',
);

const estimateOrderWriteList = ref();

const searchParams = ref({
  fromEstDt: now.format('YYYYMM'), // 견적일 From
  toEstDt: now.format('YYYYMM'), // 견적일 To
  inqrDv: '', // 조회구분구분
  cntrt: '', // 계약자명
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 8,
});

let cachedParams;

async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);

  if (isEmpty(cachedParams)) return;

  const res = await dataService.get('/sms/wells/contract/contracts/estimate-orders', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: details, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  estimateOrderWriteList.value = details;
  for (let i = 0; i < estimateOrderWriteList.value.length; i += 1) {
    if (!isEmpty(estimateOrderWriteList.value[i].bryyMmddBzrno)) {
      estimateOrderWriteList.value[i].bryyMmddBzrno = `${estimateOrderWriteList.value[i].bryyMmddBzrno.substr(0, 4)}-${
        estimateOrderWriteList.value[i].bryyMmddBzrno.substr(4, 2)}-${
        estimateOrderWriteList.value[i].bryyMmddBzrno.substr(6, 2)}`;
    }
    if (!isEmpty(estimateOrderWriteList.value[i].cntrTempSaveDt)) {
      estimateOrderWriteList.value[i].cntrTempSaveDt = `${estimateOrderWriteList.value[i].cntrTempSaveDt.substr(0, 4)}-${
        estimateOrderWriteList.value[i].cntrTempSaveDt.substr(4, 2)}-${
        estimateOrderWriteList.value[i].cntrTempSaveDt.substr(6, 2)}`;
    }
    if (!isEmpty(estimateOrderWriteList.value[i].sndDt)) {
      estimateOrderWriteList.value[i].sndDt = `${estimateOrderWriteList.value[i].sndDt.substr(0, 4)}-${
        estimateOrderWriteList.value[i].sndDt.substr(4, 2)}-${
        estimateOrderWriteList.value[i].sndDt.substr(6, 2)}`;
    }
    if (!isEmpty(estimateOrderWriteList.value[i].sellAmt)) {
      estimateOrderWriteList.value[i].sellAmt = estimateOrderWriteList.value[i].sellAmt.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }
}

async function onClickSearch() {
  cachedParams = '';
  pageInfo.value.pageIndex = 1;
  estimateOrderWriteList.value = [];
  fetchData();
}

async function onClickCntr(item) {
  router.push({
    path: '/contract/wwcta-contract-registration-mgt',
    query: {
      value1: item.cntrNo,
    },
  });
}

async function onClickSearchPopup() {
  notify('견적서 리포트 완료 후 연결됩니다.'); // TODO : 추후 확인 후 팝업 추가
}

async function onClickUpdate(item) {
  router.push({
    path: 'wwcta-contract-registration-mgt',
    query: {
      cntrNo: item.cntrNo,
      cntrSn: item.cntrSn,
      cntrPrgsStatCd: item.cntrPrgsStatCd,
    },
  });
}

async function onClickSend(item) {
  const result = await modal({
    component: 'WwctaQuoteSendP',
    componentProps: {
      cntrNo: item.cntrNo,
      cntrSn: item.cntrSn,
    },
  });
  if (result) {
    await fetchData();
  }
}

async function onClickDelete(item) {
  if (await confirm(t('MSG_ALT_WANT_DEL'))) {
    await dataService.delete('/sms/wells/contract/contracts/estimate-orders', { params: { cntrNo: item.cntrNo, cntrSn: item.cntrSn } });
    await onClickSearch();
  }
}

onMounted(async () => {
  await fetchData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
</script>
<style lang="scss" scoped>
.card-text {
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
</style>
