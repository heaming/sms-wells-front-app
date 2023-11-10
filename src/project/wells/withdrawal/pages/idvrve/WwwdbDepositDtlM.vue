<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDB
2. 프로그램 ID : WwwdbDepositDtlM - 입금내역 조회 (웰스 입금 상세)
3. 작성자 : sojeong.Shin
4. 작성일 : 2023.06.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 웰스 입금내역, 당월 납입 내역 정보
-- W-WD-U-0138M01
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- label="판매유형" -->
        <kw-search-item
          :label="t('TXT_MSG_SELL_TP_CD')"
        >
          <kw-select
            v-model="searchParams.sellTpCd"
            first-option="all"
            :options="sellTpCdCode"
          />
        </kw-search-item>
        <!-- label="입금구분" -->
        <kw-search-item
          :label="t('MSG_TXT_DP_DV')"
        >
          <kw-select
            v-model="searchParams.dpDvCd"
            first-option="all"
            :options="dpDvCdCode"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_DP_MES_TYPE')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.dpMesCd"
            first-option="all"
            :options="dpMesCdCode"
            @change="onChangeDpTpCd"
          />
          <kw-select
            v-if="searchParams.dpMesCd !== '03'"
            v-model="searchParams.dpTpCd"
            first-option="all"
            :options="dpTpCdCode"
          />
          <kw-select
            v-if="searchParams.dpMesCd !== '03'"
            v-model="searchParams.vncoDvCd"
            first-option="all"
            :options="vncoDvCd"
          />
          <!-- v-if="searchParams.dpMesCd === '02'" -->
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- label="입금일자" -->
        <kw-search-item
          :label="t('MSG_TXT_DP_DT')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            rules="date_range_required|date_range_months:1"
            :label="t('MSG_TXT_DP_DT')"
          />
        </kw-search-item>
        <!-- label="조직유형" -->
        <kw-search-item
          :label="t('MSG_TXT_OG_TP')"
        >
          <kw-select
            v-model="searchParams.ogTpCd"
            :options="codes.OG_TP_CD"
            multiple
            @update:model-value="[]= $event?.sort()"
          />
        </kw-search-item>
        <!-- label="계약상세번호" -->
        <kw-search-item
          :label="t('MSG_TXT_CNTR_DTL_NO')"
        >
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            :name="$t('MSG_TXT_CNTR_DTL_NO')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- label="집금담당자사번" -->
        <kw-search-item
          :label="t('MSG_TXT_CLCTAM_PSIC_NO')"
        >
          <kw-input
            v-model="searchParams.stClctamPrtnrNo"
            :rules="validateComponent"
            maxlength="10"
            regex="num"
          />
          <span>-</span>
          <kw-input
            v-model="searchParams.enClctamPrtnrNo"
            regex="num"
            maxlength="10"
            :rules="validateComponent"
          />
        </kw-search-item>
        <!-- label="입력담당자사번" -->
        <kw-search-item
          :label="t('MSG_TXT_IN_PSIC_ENO')"
        >
          <kw-input
            v-model="searchParams.stFstRgstUsrId"
            :rules="validateUsrComponent"
            regex="num"
            maxlength="100"
          />
          <span>-</span>
          <kw-input
            v-model="searchParams.enFstRgstUsrId"
            :rules="validateUsrComponent"
            regex="num"
            maxlength="100"
          />
        </kw-search-item>
        <!-- label="수납코드" -->
        <kw-search-item
          v-if="false"
          :label="t('MSG_TXT_RVE_CD')"
        >
          <kw-input
            v-model="searchParams.stRveCd"
            :rules="validateRveCdComponent"
            regex="num"
            maxlength="100"
          />
          <span>-</span>
          <kw-input
            v-model="searchParams.enRveCd"
            :rules="validateRveCdComponent"
            regex="num"
            maxlength="100"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <ul class="kw-notification">
        <li class="kw-fc--primary">
          <span>{{ t('MSG_TXT_SRN_LIST_MAX_INQR_MTR_EXCEL_DLD') }}</span>
        <!-- ·화면의 목록은 최대 2,000건까지만 조회됩니다. 더 많은 자료는 엑셀다운로드를 이용하세요! -->
        </li>
      </ul>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
          <!-- :visible="10" -->
          <!-- (단위:원) -->
          <span class="ml8">{{ t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>

        <!-- label="엑셀다운로드" -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        :visible-rows="10"
        @init="initGrid"
      />

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
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import { useMeta, codeUtil, useDataService, gridUtil, getComponentType, defineGrid } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const now = dayjs();
const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'SELL_TP_CD', /* 판매유형코드 */
  'DP_DV_CD', /* 입금구분코드 */
  'DP_MES_CD', /* 입금수단코드 */
  'DP_TP_CD', /* 입금유형코드 */
  'VNCO_DV_CD', /* VAN사구분코드 */
  'OG_TP_CD', /* 조직유형코드 */
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const sellTpCdCode = codes.SELL_TP_CD.filter((e) => ['1', '2', '3', '6'].includes(e.codeId));
const dpDvCdCode = codes.DP_DV_CD.filter((e) => ['1', '2'].includes(e.codeId));
const dpMesCdCode = codes.DP_MES_CD.filter((e) => ['01', '02', '03'].includes(e.codeId));
let dpTpCdCode;
let vncoDvCd;

let cachedParams;

const searchParams = ref({
  sellTpCd: '', // 판매유형
  dpDvCd: '', // 입금구분
  dpMesCd: '', // 입금수단
  dpTpCd: '', // 입금유형
  vncoDvCd: '', // van사 구분
  startDt: now.add(-1, 'M').add(1, 'd').format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  ogTpCd: [], // 조직유형
  cntrNo: '',
  cntrSn: '',
  stClctamPrtnrNo: '', // 집금담당자 사번 시작
  enClctamPrtnrNo: '', // 집금담당자 사번 끝
  stFstRgstUsrId: '', // 입력담당자 사번 시작
  enFstRgstUsrId: '', // 입력담당자 사번 끝
  stRveCd: '',
  enRveCd: '',
});

async function onChangeDpTpCd() {
  if (searchParams.value.dpMesCd === '01') {
    dpTpCdCode = codes.DP_TP_CD.filter((e) => ['0101', '0102', '0103', '0104'].includes(e.codeId));
    vncoDvCd = codes.VNCO_DV_CD.filter((e) => ['002', '003', '001'].includes(e.codeId));
  } else if (searchParams.value.dpMesCd === '02') {
    dpTpCdCode = codes.DP_TP_CD.filter((e) => ['0201', '0202', '0203', '0204'].includes(e.codeId));
    // vncoDvCd = codes.VNCO_DV_CD.filter((e) => ['002', '003', '001'].includes(e.codeId));
    vncoDvCd = [];
  } else {
    dpTpCdCode = [];
    vncoDvCd = [];
  }

  searchParams.value.dpTpCd = '';
  searchParams.value.vncoDvCd = '';
}

async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/deposit-detail/paging', { params: cachedParams, timeout: 600000 });
  const { list: pages, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();

  const data = view.getDataSource();

  data.checkRowStates(false);
  data.setRows(pages);
  data.checkRowStates(true);
}
// 조회 이벤트
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

const validateComponent = computed(() => async () => {
  const errors = [];

  if (!isEmpty(searchParams.value.stClctamPrtnrNo)) {
    if (isEmpty(searchParams.value.enClctamPrtnrNo)) {
      errors.push(t('MSG_ALT_CLCTAM_PSIC_IN_END_CLCTAM_PSIC'));
      // 집금담당자사번 입력 시 종료 집금담당자사번은 필수입니다.
    }
  }
  if (!isEmpty(searchParams.value.enClctamPrtnrNo)) {
    if (isEmpty(searchParams.value.stClctamPrtnrNo)) {
      errors.push(t('MSG_ALT_CLCTAM_PSIC_IN_STRT_CLCTAM_PSIC'));
      // 집금담당자사번 입력 시 시작 집금담당자사번은 필수입니다.
    }
  }

  if (searchParams.value.stClctamPrtnrNo > searchParams.value.enClctamPrtnrNo) {
    errors.push(t('MSG_ALT_STRT_CLCTAM_END_CLCTAM_CMPR'));
    // 시작 집금담당자사번이 종료 집금담당자사번보다 클 수 없습니다.
  }

  return errors[0] || true;
});

const validateUsrComponent = computed(() => async () => {
  const errors = [];

  if (!isEmpty(searchParams.value.stFstRgstUsrId)) {
    if (isEmpty(searchParams.value.enFstRgstUsrId)) {
      errors.push(t('MSG_ALT_ICHR_IN_END_ICHR'));
      // 입력담당자사번 입력 시 종료 입력담당자사번은 필수입니다.
    }
  }
  if (!isEmpty(searchParams.value.enFstRgstUsrId)) {
    if (isEmpty(searchParams.value.stFstRgstUsrId)) {
      errors.push(t('MSG_ALT_ICHR_IN_STRT_ICHR'));
      // 입력담당자사번 입력 시 시작 입력담당자사번은 필수입니다.
    }
  }

  if (searchParams.value.stFstRgstUsrId > searchParams.value.enFstRgstUsrId) {
    errors.push(t('MSG_ALT_STRT_ICHR_END_ICHR_CMPR'));
    // 시작 입력담당자사번이 종료 입력담당자사번보다 클 수 없습니다.
  }

  return errors[0] || true;
});

const validateRveCdComponent = computed(() => async () => {
  const errors = [];

  if (!isEmpty(searchParams.value.stRveCd)) {
    if (isEmpty(searchParams.value.enRveCd)) {
      errors.push(t('시작 수납코드 입력시 종료 수납코드는 필수입니다.'));
    }
  }
  if (!isEmpty(searchParams.value.enRveCd)) {
    if (isEmpty(searchParams.value.stRveCd)) {
      errors.push(t('시작 수납코드 입력은 필수 입니다.'));
    }
  }

  if (searchParams.value.stRveCd > searchParams.value.enRveCd) {
    errors.push(t('시작 수납코드는 종료수납코드보다 클 수 없습니다.'));
  }

  return errors[0] || true;
});

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/deposit-detail/excel-download', { params: cachedParams, timeout: 600000 });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntr' }, /* 계약번호 */
    { fieldName: 'dpNo' }, /* 입금번호 */
    { fieldName: 'cstNo' }, /* 고객번호 */
    { fieldName: 'cstKnm' }, /* 고객명 */
    { fieldName: 'ogCd' }, /* 지점-조직코드 */
    { fieldName: 'prtnrKnm' }, /* 판매자 */
    { fieldName: 'sellPrtnrNo' }, /* 판매파트너번호 */
    { fieldName: 'rveCd' }, /* 수납코드 */
    { fieldName: 'sellTpCd' }, /* 판매유형 */
    { fieldName: 'dpDvCd' }, /* 입금구분 */
    { fieldName: 'dpDt', dataType: 'date' }, /* 입금일자 */
    { fieldName: 'perfDt', dataType: 'date' }, /* 실적일자 */
    { fieldName: 'dpAmt', dataType: 'number' }, /* 입금액 */
    { fieldName: 'fnitNm' }, /* 카드구분 */
    { fieldName: 'crcdnoEncr' }, /* 카드번호 */
    { fieldName: 'crdcdIstmMcn' }, /* 신용카드할부개월수 */
    { fieldName: 'crdcdAprno' }, /* 신용카드승인번호 */
    { fieldName: 'crcdonrNm' }, /* 신용카드주명 */
    { fieldName: 'dpCprcnfNo' }, /* 대사번호 */
    { fieldName: 'cntrCanDtm', dataType: 'date' }, /* 취소일자 */
    { fieldName: 'rgstKnm' }, /* 입력담당자 */
    { fieldName: 'fstRgstUsrId' }, /* 번호-최초등록사용자ID */
    { fieldName: 'clctamPrtnrNm' }, /* 집금담당자 */
    { fieldName: 'clctamPrtnrNo' }, /* 번호 */
    { fieldName: 'ogTpCd' }, /* 조직유형 */

  ];

  const columns = [
    { fieldName: 'cntr',
      header: t('MSG_TXT_CNTR_DTL_NO'), // 계약상세번호
      width: '150',
      styleName: 'text-center' },

    { fieldName: 'dpNo',
      header: t('MSG_TXT_DP_NO'), // 입금번호
      width: '100',
      styleName: 'text-center' },

    { fieldName: 'cstNo',
      header: t('MSG_TXT_CST_NO'), // 고객번호
      width: '100',
      styleName: 'text-center' },

    { fieldName: 'cstKnm',
      header: t('MSG_TXT_CST_NM'), // 고객명
      width: '120',
      styleName: 'text-center' },

    { fieldName: 'ogCd',
      header: t('MSG_TXT_BRCH_CD'), // 지점코드
      width: '90',
      styleName: 'text-center' },

    { fieldName: 'prtnrKnm',
      header: t('MSG_TXT_SELLER_PERSON'), // 판매자
      width: '90',
      styleName: 'text-center' },

    { fieldName: 'sellPrtnrNo',
      header: t('MSG_TXT_PARTNER_NO'), // 판매파트너번호
      width: '90',
      styleName: 'text-center' },

    { fieldName: 'rveCd',
      header: t('MSG_TXT_RVE_CD'), // 수납코드
      width: '90',
      styleName: 'text-center' },

    { fieldName: 'sellTpCd',
      header: t('TXT_MSG_SELL_TP_CD'), // 판매유형
      width: '120',
      styleName: 'text-center',
      options: codes.SELL_TP_CD,
    },

    { fieldName: 'dpDvCd',
      header: t('MSG_TXT_DP_DV'), // 입금구분
      width: '75',
      styleName: 'text-center',
      options: codes.DP_DV_CD,
    },

    { fieldName: 'dpDt',
      datetimeFormat: 'date',
      header: t('MSG_TXT_DP_DT'), // 입금일자
      width: '120',
      styleName: 'text-center' },

    { fieldName: 'perfDt',
      header: t('MSG_TXT_PERF_DT'), // 실적일자
      width: '120',
      datetimeFormat: 'date',
      styleName: 'text-center' },

    { fieldName: 'dpAmt',
      header: t('MSG_TXT_DEPOSIT_AMT'), // 입금액
      width: '120',
      styleName: 'text-right',
      numberFormat: '#,##0',
    },

    { fieldName: 'fnitNm',
      header: t('MSG_TXT_DIV'), // 카드구분
      width: '120' },

    { fieldName: 'crcdnoEncr',
      header: t('MSG_TXT_ACNO_CDNO'), // 계좌번호/카드번호
      width: '190',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        return !isEmpty(value) ? `${value.substring(0, 4)}-${value.substring(4, 8)}-${value.substring(8, 12)}-${value.substring(12)}` : value;
      },
    },

    { fieldName: 'crdcdIstmMcn',
      header: t('MSG_TXT_ISTM'), // 할부
      width: '75',
      styleName: 'text-center' },

    { fieldName: 'crdcdAprno',
      header: t('MSG_TXT_APR_NO'), // 승인번호
      width: '90',
      styleName: 'text-center' },

    { fieldName: 'crcdonrNm',
      header: t('MSG_TXT_CDONR_NM'), // 카드주명
      width: '90',
      styleName: 'text-center' },

    { fieldName: 'dpCprcnfNo',
      header: t('MSG_TXT_CPRCNF_NO'), // 대사번호
      width: '90',
      styleName: 'text-center' },

    { fieldName: 'cntrCanDtm',
      header: t('MSG_TXT_CANC_DT'), // 취소일자
      width: '120',
      datetimeFormat: 'date',
      styleName: 'text-center' },

    { fieldName: 'rgstKnm',
      header: t('MSG_TXT_IN_PSIC'), // 입력담당자
      width: '90',
      styleName: 'text-center' },

    { fieldName: 'fstRgstUsrId',
      header: t('MSG_TXT_PARTNER_NO'), // 번호
      width: '90',
      styleName: 'text-center' },

    { fieldName: 'clctamPrtnrNm',
      header: t('MSG_TXT_CLCTAM_PSIC'), // 집금담당자
      width: '90',
      styleName: 'text-center' },

    { fieldName: 'clctamPrtnrNo',
      header: t('MSG_TXT_PARTNER_NO'), // 번호
      width: '90',
      styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
