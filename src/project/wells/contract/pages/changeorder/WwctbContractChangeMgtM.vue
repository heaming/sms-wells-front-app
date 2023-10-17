<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbContractChangeMgtM - 계약변경관리
3. 작성자 : Myoungbin Joo
4. 작성일 : 2023.06.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U-0101M01] 계약변경관리
****************************************************************************************************
--->

<template>
  <!-- rev:230531 페이지 원복 -->
  <kw-page>
    <kw-search
      ref="searchMainRef"
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_RCPDT')"
          required
        >
          <kw-date-range-picker
            v-model:from="fieldParams.cntrCnfmDtmFr"
            v-model:to="fieldParams.cntrCnfmDtmTo"
            :label="$t('MSG_TXT_RCPDT')"
            rules="date_range_required"
          />
        </kw-search-item>

        <kw-search-item
          :label="t('MSG_TXT_PRDT_GUBUN')"
        >
          <kw-select
            v-model="fieldParams.sellTpCd"
            :options="filterdCodes.sellTpCd"
            first-option="all"
          />
        </kw-search-item>

        <kw-search-item
          :label="t('MSG_TXT_CNTOR_NM')"
        >
          <kw-input
            v-model="fieldParams.cstKnm"
            maxlength="30"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_CNTR_NO')"
        >
          <zctz-contract-detail-number
            v-model:cntr-no="fieldParams.cntrNo"
            v-model:cntr-sn="fieldParams.cntrSn"
            :name="t('MSG_TXT_CNTR_NO')"
            :select-only-validation="false"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_CH_STT_DIV')"
        >
          <kw-option-group
            v-model="fieldParams.pdChYn"
            type="checkbox"
            :options="[{codeId: 'Y', codeName: t('MSG_TXT_CH_PRD')}]"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <!-- <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="onClickSearch"
          /> -->
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
        </template>
      </kw-action-top>
      <div class="row q-gutter-sm">
        <kw-card
          v-for="(item, idx) of resultList"
          :key="idx"
        >
          <div class="row justify-between items-center">
            <p class="kw-font--14 kw-fc--black2">
              {{ item.sellTpDtlNm }}
            </p>
            <div class="row justify-end">
              <kw-chip
                v-show="isEqual(item.pdChYn, 'Y')"
                :label="t('MSG_TXT_CNTR_TYPE_CH_COMP')"
                class="mr12"
                negative
                outline
              />
              <kw-chip
                :label="item.copnDvNm"
                color="primary"
                outline
              />
            </div>
          </div>
          <h3 class="mt20 mb12">
            {{ `${item.cstKnm} (${getBzrnoFormat(item.copnDvCd, item.bryyBzrno)})` }}
          </h3>
          <ul class="card-text">
            <li>
              <!-- 계약번호 -->
              <p>{{ $t('MSG_TXT_CNTR_NO') }}</p>
              <span> {{ item.cntrDtlNo }} </span>
            </li>
            <li>
              <!-- 접수일자 -->
              <p>{{ $t('MSG_TXT_RCPDT') }}</p>
              <span>{{ stringUtil.getDateFormat(item.cntrCnfmDt) }}</span>
            </li>
            <li>
              <!-- 제품명 -->
              <p>{{ $t('MSG_TXT_GOODS_NM') }}</p>
              <span>{{ item.pdNm }}</span>
            </li>
            <li>
              <!-- 용도/주기 -->
              <p> {{ `${$t('MSG_TXT_USWY')}/${$t('MSG_TXT_CYCL')}` }}</p>
              <span> {{ getUswyCyclFormat(item.svPdTpNm, item.svPrd, item.svPtrmUnitNm) }} </span>
            </li>
            <li>
              <!-- 렌탈료 / 기간, 판매금액,  멤버십회비(MSG_TXT_MEM_DUES) -->
              <p>{{ getRentalMsg(item.sellTpCd) }}</p>
              <span>{{ getRentalAmt(item) }}</span>
            </li>
            <div v-show="isEqual(item.sellTpCd, '2')">
              <li>
                <!-- 할인유형 -->
                <p>{{ t('MSG_TXT_DISC_CODE') }}</p>
                <span>{{ getDscTp(item) }}</span>
              </li>
              <li>
                <!-- 프로모션 -->
                <p>{{ t('MSG_TXT_PMOT') }}</p>
                <span>{{ item.fgptInfo }}</span>
              </li>
            </div>
            <li v-show="isEqual(item.mclsfRefPdClsfVal, '06003') || isEqual(item.mclsfRefPdClsfVal, '06005')">
              <!-- 구분, 제조사 -->
              <p>{{ getGubunMsg(item.mclsfRefPdClsfVal) }}</p>
              <span>{{ getGubunNm(item) }}</span>
            </li>
            <li>
              <!-- 설치일, 방문일 -->
              <p>{{ getIstDtMsg(item.hclsfRefPdClsfVal) }}</p>
              <span> {{ isEmpty(item.istDt) ? '-' : stringUtil.getDateFormat(item.istDt) }} </span>
            </li>
          </ul>
          <!-- <kw-separator
            spaced="20px"
          /> -->
          <div class="button-wrap">
            <!-- 고객정보 변경-->
            <kw-btn
              v-permission:update
              secondary
              :label="`${t('MSG_TXT_CST_INF')} ${t('MSG_TXT_CH')}`"
              padding="12px"
              @click="onClickCstChange(item)"
            />
            <!-- 계약유형 변경-->
            <kw-btn
              v-show="isEqual(item.sellTpCd, '2')"
              v-permission:update
              secondary
              :label="`${t('MSG_TXT_CONTR_TYPE')} ${t('MSG_TXT_CH')}`"
              padding="12px"
              @click="onClickCntrTpChange(item)"
            />
            <!-- 판매자 변경-->
            <kw-btn
              v-show="isEqual(ogTpCd, 'HR1')"
              v-permission:update
              secondary
              :label="`${t('MSG_TXT_SELLER_PERSON')} ${t('MSG_TXT_CH')}`"
              padding="12px"
              @click="onClickSellerChange(item)"
            />
            <!-- 삭제요청-->
            <kw-btn
              v-show="isEqual(item.sellTpCd, '2') && isEmpty(item.istDt)"
              v-permission:update
              secondary
              :label="$t('MSG_TXT_DEL_REQ')"
              padding="12px"
              @click="onClickDelReq(item)"
            />
            <kw-separator
              v-show="isEqual(item.histYn, 'Y')"
              vertical
              inset
              spaced="0"
            />
            <!-- 계약유형변경 이력 보기-->
            <kw-btn
              v-show="isEqual(item.histYn, 'Y')"
              v-permission:read
              secondary
              :label="$t('MSG_BTN_CNTR_TP_CHANGE_HIS_BRWS')"
              padding="12px"
              @click="onClickShowProductChangeHistoryP(item)"
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
import { getComponentType, codeUtil, useDataService, stringUtil, useGlobal, modal } from 'kw-lib';
import { cloneDeep, isEmpty, isEqual } from 'lodash-es';
import dayjs from 'dayjs';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const { t } = useI18n();
const { alert, confirm, notify } = useGlobal();
const { getters } = useStore();
const { ogTpCd } = getters['meta/getUserInfo'];
const router = useRouter();
const dataService = useDataService();
const now = dayjs();
const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
);
const searchMainRef = ref(getComponentType('KwSearch'));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

let cachedParams;

const resultList = ref({});
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 6,
});

const fieldParams = ref({
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  sellTpCd: '', // 판매유형코드
  cstKnm: '', // 계약자명
  cntrCnfmDtmFr: now.startOf('month').format('YYYYMMDD'), // 계약시작접수일자
  cntrCnfmDtmTo: now.format('YYYYMMDD'), // 계약종료접수일자
  pdChYn: [],
});

const filterdCodes = ref({
  sellTpCd: codes.SELL_TP_CD.filter((code) => code.codeId <= '3'),
});

// 계약 현황 목록에서 진입한 경우
const props = defineProps({
  cntrNo: { type: String, required: true },
  cntrSn: { type: String, required: true },
  cntrCnfmDt: { type: String, required: true },
});

async function fetchData() {
  if (isEmpty(cachedParams)) return;

  if (!await searchMainRef.value.validate()) {
    pageInfo.value.totalCount = 0;
    return;
  }

  const res = await dataService.get('/sms/wells/contract/changeorder/changes', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: details, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  resultList.value = details;
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(fieldParams.value);
  await fetchData();
}

// getBzrnoFormat: 생일, 사업자 번호 구분처리
function getBzrnoFormat(copnDvCd, bryyBzrno) {
  let msg = bryyBzrno;
  switch (copnDvCd) {
    case '2':
      msg = `${bryyBzrno.substr(0, 3)}-${bryyBzrno.substr(3, 2)}-${bryyBzrno.substr(5, 5)}`;
      break;
    default:
      msg = stringUtil.getDateFormat(bryyBzrno);
      break;
  }
  return msg;
}

// getUswyCyclFormat: 용도/주기 표기 처리
function getUswyCyclFormat(svPdTpNm, svPrd, svPtrmUnitNm) {
  let useWyMsg = '';
  let cycleMsg = '';
  if (!isEmpty(svPdTpNm)) {
    useWyMsg += svPdTpNm;
  }
  if (!isEmpty(svPrd)) {
    cycleMsg += svPrd;
  }
  if (!isEmpty(svPtrmUnitNm)) {
    cycleMsg += svPtrmUnitNm;
  }
  return `${useWyMsg} / ${cycleMsg}`;
}

// getRentalMsg: 판매유형에 따라 금액 종류 분기처리
function getRentalMsg(sellTpCd) {
  let msg = '';
  switch (sellTpCd) {
    case '1': // 판매금액
      msg = t('MSG_TXT_SALE_PRICE');
      break;
    case '2': // 렌탈료
      msg = `${t('MSG_TXT_RTLFE')}/${t('MSG_TXT_PRD')}`;
      break;
    case '3': // 멤버십회비
      msg = t('MSG_TXT_MEM_DUES');
      break;
    default:
      break;
  }
  return msg;
}

// getRentalAmt: 판매유형에 따라 금액 표기 분기처리
function getRentalAmt(item) {
  let msg = '';
  let rentatAmtMsg = '';
  const rentalAmt1 = stringUtil.getNumberWithComma(item.rentalAmt1);
  const rentalAmt2 = stringUtil.getNumberWithComma(item.rentalAmt2);

  rentatAmtMsg = item.rentalAmt2 > 0 ? `| ${rentalAmt2}${t('MSG_TXT_CUR_WON')} / ${item.cntrPtrm2}${t('MSG_TXT_MCNT')}` : '';
  switch (item.sellTpCd) {
    case '2': // 렌탈
      msg = `${rentalAmt1}${t('MSG_TXT_CUR_WON')} / ${item.cntrPtrm1}${t('MSG_TXT_MCNT')} ${rentatAmtMsg}`; // 렌탈금액 원 렌탈개월
      break;
    default:
      msg = `${rentalAmt1}${t('MSG_TXT_CUR_WON')}`;
      break;
  }
  return msg;
}

// getDscTp: 할인유형 값
function getDscTp(item) {
  let msg = item.sellDscDvNm;
  if (!isEmpty(item.sellDscrNm)) {
    msg += ` -${item.sellDscrNm}`;
  }
  if (!isEmpty(item.sellDscTpNm)) {
    msg += ` / ${item.sellDscTpNm}`;
  }
  if (!isEmpty(item.alncmpNm)) {
    msg += ` / ${item.alncmpNm}`;
  }
  return msg;
}

// getGubunMsg: 구분, 제조사 라벨
function getGubunMsg(mclsfRefPdClsfVal) {
  let msg = '';
  switch (mclsfRefPdClsfVal) {
    case '06003': // 구분
      msg = t('MSG_TXT_DIV');
      break;
    case '06005': // 제조사
      msg = t('MSG_TXT_MAKER');
      break;
    default:
      break;
  }
  return msg;
}

// getGubunNm: 구분, 제조사 명
function getGubunNm(item) {
  let msg = '';
  const { mclsfRefPdClsfVal } = item;
  switch (mclsfRefPdClsfVal) {
    case '06003': // 구분
      msg = item.hcrDvNm;
      break;
    case '06005': // 제조사
      msg = item.bdtMnftNm;
      break;
    default:
      break;
  }
  return msg;
}

// getIstDtMsg: 설치일, 방문일 라벨값
function getIstDtMsg(hclsfRefPdClsfVal) {
  let msg = '';
  switch (hclsfRefPdClsfVal) {
    case '06': // 설치일
      msg = t('MSG_TXT_INST_DT');
      break;
    default: // 방문일
      msg = t('MSG_TXT_VISIT_DATE');
      break;
  }
  return msg;
}

async function changeContract(item, popNm, gubun) {
  // 변경유형(item.inDv) 존재시만(이력조회팝업은 check안함)
  if (!isEmpty(item.inDv)) {
    const checkRes = await dataService.get('/sms/wells/contract/changeorder/changes/pre-checks', { params: { ...item } });
    const { warnMsg } = checkRes.data;

    if (!isEmpty(warnMsg)) {
      alert(warnMsg);
    }
  }

  if (!isEmpty(gubun)) {
    const res = await dataService.post('/sms/wells/contract/changeorder/changes/cancel-asks', item);
    if (res.data.processCount > 0) {
      notify(t('MSG_ALT_CNTR_DEL_AK'));
      fetchData();
    }
  } else {
    switch (popNm) {
      case 'WwctbCustomerModP': // 고객정보변경
      case 'WwctbPartnerModP': // 판매자 변경
      case 'WwctbProductChangeHistoryP': { // 계약유형변경 이력 보기
        const { result } = await modal({
          component: popNm,
          componentProps: { cntrNo: item.cntrNo,
            cntrSn: item.cntrSn,
            copnDvCd: item.copnDvCd,
            cttRsCd: item.cttRsCd,
            istDt: item.istDt }, // 팝업 화면에 보낼 파라미터
        });
        if (result) {
          fetchData();
        }
      }
        break;
      case 'WwctbRentalProductChangeM': // 렌탈 주문 수정_상품변경 Variation (PC화면)
        router.push({
          path: '/contract/wwctb-rental-product-change', // 나과장 작업중
          query: {
            cntrNo: item.cntrNo,
            cntrSn: item.cntrSn },
        });
        break;
      default:
        //
        break;
    }
  }
}

// onClickCstChange: 고객정보변경
function onClickCstChange(item) {
  item.inDv = '10';
  changeContract(item, 'WwctbCustomerModP');
}

// onClickCntrTpChange: 계약유형변경
async function onClickCntrTpChange(item) {
  item.inDv = '20';
  const { alncmpCd, sellInflwChnlDtlCd, vstCnfmdt } = item;
  if (isEqual(alncmpCd, '70')) {
    alert(t('MSG_ALT_CANT_CONTR_TYPE_WHEN_MUTU_ALNC'));
    return;
  }
  // 총판 비대면 접수 주문 변경 불가 : 계약상세의 판매유입채널상세코드가 '1010'인 건만 계약상품변경 수행 가능
  if (!isEqual(sellInflwChnlDtlCd, '1010')) { /* TODO: 총판 비대면 체크 로직 변경 가능성 있음 */
    alert(t('MSG_ALT_SODBT_NFTF_ORD_CANNT_CHANGE'));
    return;
  }

  // 설치예정일자 존재여부 확인
  if (!isEmpty(vstCnfmdt)) {
    alert(t('MSG_ALT_ALRDY_HAVE_IST_EXP_DT'));
    return;
  }

  // 렌탈 주문 수정_상품변경 Variation (PC화면) W-SS-U-0114M02 호출
  changeContract(item, 'WwctbRentalProductChangeM');
}

// onClickSellerChange: 판매자 변경
async function onClickSellerChange(item) {
  item.inDv = '30';
  changeContract(item, 'WwctbPartnerModP');
}

// onClickDelReq: 삭제요청
async function onClickDelReq(item) {
  item.inDv = '40'; // 입력구분
  item.aprvDv = '20'; // 승인구분
  const compDate = now.add('-1', 'month').format('YYYYMM');
  console.log(item.cntrCnfmDt.substr(0, 6));

  if (compDate >= item.cntrCnfmDt.substr(0, 6)) {
    alert(t('MSG_ALT_ONLY_CAN_DEL_THM_ORD'));
    return;
  }

  if (await confirm(t('MSG_ALT_CNTR_DEL_AK_CONFIRM', [item.cntrDtlNo]))) {
    changeContract(item, '', '1');
  }
}

// onClickShowProductChangeHistoryP: 계약유형변경 이력 보기
async function onClickShowProductChangeHistoryP(item) {
  item.inDv = '';
  changeContract(item, 'WwctbProductChangeHistoryP');
}

async function getParamaSearch() {
  const { cntrNo, cntrCnfmDt } = props;
  if (cntrNo && cntrCnfmDt) {
    fieldParams.value.cntrNo = cntrNo;
    fieldParams.value.cntrCnfmDtmFr = cntrCnfmDt;
    fieldParams.value.cntrCnfmDtmTo = cntrCnfmDt;

    onClickSearch();
  }
}

watch(props, () => {
  getParamaSearch();
});

onMounted(async () => {
  getParamaSearch();
});

</script>

<style scoped lang="scss">
.kw-card {
  width: calc((100% - 60px) / 3);
}

::v-deep(.kw-card.q-card) {
  display: flex;
  flex-direction: column;
}

.card-text {
  margin-bottom: 20px;

  li {
    p {
      width: 85px;
      min-width: 85px;
    }

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.button-wrap {
  margin-top: auto;
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  min-height: 88px;

  ::v-deep(.kw-btn) {
    align-self: flex-start;
  }
}

.mt-auto {
  margin-top: auto !important;
}

::v-deep(.q-separator--vertical) {
  height: 26px;
}
</style>
