<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebOgFeeManagerListM - M조직 수수료 생성관리
3. 작성자 : min-kyu bae
4. 작성일 : 2023.02.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- M조직 수수료 생성관리 목록 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            :label="$t('MSG_TXT_PERF_YM')"
            :max-date="maxDate"
            type="month"
            rules="required"
            @change="onChangedRsbTp"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ORDR')"
        >
          <kw-option-group
            v-model="searchParams.feeTcntDvCd"
            :label="$t('MSG_TXT_ORDR')"
            type="radio"
            :options="codes.FEE_TCNT_DV_CD"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RSB_TP')"
        >
          <kw-option-group
            v-model="searchParams.rsbDvCd"
            :label="$t('MSG_TXT_RSB_TP')"
            type="radio"
            :options="filterRsbDvCd"
            first-option
            first-option-value=""
            :first-option-label="$t('MSG_TXT_ALL')"
            @change="onChangedRsbTp"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            icon="search"
            clearable
            :maxlength="10"
            :on-click-icon="onClickSearchNo"
            :placeholder="$t('MSG_TXT_SEQUENCE_NUMBER')"
          />
          <kw-input
            v-model="searchParams.prtnrKnm"
            :placeholder="$t('MSG_TXT_EMPL_NM')"
            readonly
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_OG_LEVL')">
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevl1Id"
            v-model:og-levl-dv-cd2="searchParams.ogLevl2Id"
            v-model:og-levl-dv-cd3="searchParams.ogLevl3Id"
            :og-tp-cd="searchParams.ogTpCd"
            :base-ym="searchParams.perfYm"
            :start-level="1"
            :end-level="3"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>{{ searchParams.statTitleText }}</h3>
      <!-- STEPER -->
      <zwfey-fee-step
        ref="stepNaviRef"
        :key="searchParams.perfYm+searchParams.feeSchdTpCd+searchParams.feeTcntDvCd"
        v-model:base-ym="searchParams.perfYm"
        v-model:fee-schd-tp-cd="searchParams.feeSchdTpCd"
        v-model:fee-tcnt-dv-cd="searchParams.feeTcntDvCd"
        v-model:co-cd="searchParams.coCd"
        @click-step="onclickStep"
      />
      <kw-action-top class="mt40">
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!isExcelDown"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          dense
          secondary=""
          :label="$t('MSG_BTN_HIS_MGT')"
          @click="openZwfebFeeHistoryMgtP"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="10"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import dayjs from 'dayjs';

import { useDataService, useMeta, getComponentType, gridUtil, useGlobal, defineGrid, codeUtil, alert } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import ZwfeyFeeStep from '~sms-common/fee/pages/schedule/ZwfeyFeeStep.vue';
import { openApprovalPopup } from '~common/utils/cmPopupUtil';

const { t } = useI18n();
const dataService = useDataService();
const { notify, modal, confirm } = useGlobal();
const { currentRoute } = useRouter();
const router = useRouter();
const isExcelDown = ref(false);
const stepNaviRef = ref();
let feeHeaderIndvList = []; // 개인수수료 리스트
let feeHeaderOgList = []; // 조직수수료 리스트
let feeHeaderEtcList = []; // 조직기타수수료 리스트
let feeHeaderIndvColumnList = []; // 개인수수료 컬럼레이아웃
let feeHeaderOgColumnList = []; // 조직수수료 컬럼레이아웃
let feeHeaderEtcColumnList = []; // 조직기타수수료 컬럼레이아웃
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const maxDate = dayjs().format('YYYY-MM');
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const codes = await codeUtil.getMultiCodes(
  'FEE_TCNT_DV_CD', // 수수료차수구분코드
  'RSB_DV_CD',
  'QLF_DV_CD',
  'OPNG_CD',
);

const { getUserInfo } = useMeta();
const sessionUserInfo = getUserInfo();
const filterRsbDvCd = codes.RSB_DV_CD.filter((v) => ['W0205', 'W0204'].includes(v.codeId));
const searchParams = ref({
  perfYm: now.add(-1, 'month').format('YYYYMM'),
  feeTcntDvCd: '01',
  rsbDvCd: '',
  rsbTpTxt: '',
  prtnrNo: '',
  prtnrKnm: '',
  ogLevl1Id: '',
  ogLevl2Id: '',
  ogLevl3Id: '',
  statTitleText: t('MSG_TXT_PRGS_STE'),
  ogTpCd: 'W02',
  feeSchdTpCd: '',
  coCd: '2000',
  unitCd: '',
  feeCalcUnitTpCd: '',

});

const approval = ref({
  gb: 'KST004', /* formId를 식별하는 구분 */
  empno: sessionUserInfo.employeeIDNumber, /* 결재자 사번 */
  formId: '2023000037', /* M조직 품의결재 폼ID */
  appKey: '', /* 업무단에서 해당 결재를 확인할 KEY */
});

const saveInfo = ref({
  perfYm: '',
  ogTpCd: 'W02',
  appKey: '',
  unitCd: '',
});

let cachedParams;

/*
 *  Event - 조회 후 상단 title 변경
 */
async function setTitle() {
  const { perfYm, rsbDvCd } = searchParams.value;
  searchParams.value.statTitleText = `${perfYm.substring(0, 4) + t('MSG_TXT_YEAR')} ${perfYm.substring(4, 6)}${t('MSG_TXT_MON')}`;
  if (!isEmpty(rsbDvCd)) {
    const { codeName } = codes.RSB_DV_CD.find((v) => v.codeId === rsbDvCd);
    searchParams.value.rsbTpTxt = codeName;
    searchParams.value.statTitleText += ` ${codeName} ${t('MSG_TXT_PRGS_STE')}`;
  } else {
    searchParams.value.rsbTpTxt = '';
    searchParams.value.statTitleText += ` ${t('MSG_TXT_PRGS_STE')}`;
  }
}

/*
 *  Event - 그리드 내역 초기화
 */
async function initData() {
  const view = grdMainRef.value.getData();
  view.clearRows();
  totalCount.value = 0;
  stepNaviRef.value.initProps();
  await setTitle();
}

// 그리드 컬럼 세팅
function getGridColumns() {
  const { perfYm, rsbDvCd } = searchParams.value;
  const columns = [
    // 전체 공통 컬럼
    { fieldName: 'ogNm',
      header: t('MSG_TXT_BLG'),
      width: '88.7',
      styleName: 'text-center',
      headerSummary: {
        text: t('MSG_TXT_SUM'),
      } }, // 소속
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '88.7', styleName: 'text-center' }, // 파트너번호
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '88.7', styleName: 'text-center' }, // 성명
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '88.7', styleName: 'text-center', options: codes.RSB_DV_CD }, // 직책
  ];
  if (perfYm >= '202304') { // 2023년04월 이후
    // 업무등록사항
    columns.push(
      { fieldName: 'fstBizRgst', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 업무등록사항-최초업무등록월
      { fieldName: 'bizRgst', header: t('MSG_TXT_RETR') + t('MSG_TXT_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 업무등록사항-재등록월
      { fieldName: 'bizFnlCltn', header: t('MSG_TXT_FNL_CLTN_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 업무등록사항-최종해약월
      { fieldName: 'bizCltn', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 업무등록사항-업무해약월
    );

    if (rsbDvCd === 'W0205') { // 플래너
      columns.push(
        { fieldName: 'metgPrscDc', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '91.4', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 미팅일수
        { fieldName: 'qlfDvCd', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center', options: codes.QLF_DV_CD }, // 자격-수수료월
        { fieldName: 'nmnQlfDvNm', header: 'M+1', width: '140', styleName: 'text-center' }, // 자격-M+1
        { fieldName: 'strtup', header: t('MSG_TXT_SRTUP'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 교육-스타트업
        { fieldName: 'preStrtup', header: t('MSG_TXT_PRE_SRTUP'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 교육-pre스타트업
        { fieldName: 'eduCmpf', header: t('MSG_TXT_CMPF'), width: '91.4', styleName: 'text-center' }, // 교육-보수
        { fieldName: 'eduMngerSettle1', header: `${t('MSG_TXT_STMNT')}1`, width: '91.4', styleName: 'text-center' }, // 교육-정착1
        { fieldName: 'eduMngerSettle2', header: `${t('MSG_TXT_STMNT')}2`, width: '91.4', styleName: 'text-center' }, // 교육-정착2
        { fieldName: 'eduMngerSettle345', header: `${t('MSG_TXT_STMNT')}3,4,5`, width: '91.4', styleName: 'text-center' }, // 교육-정착3,4,5
        { fieldName: 'edu2Pre', header: `Pre${t('MSG_TXT_ACML')}${t('MSG_TXT_EDUC')}`, width: '91.4', styleName: 'text-center' }, // pre누적교육
        { fieldName: 'topmrSettle', header: t('MSG_TXT_TOPMR') + t('MSG_TXT_STMNT'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 수석정착
        { fieldName: 'topmrNmn', header: t('MSG_TXT_TOPMR') + t('MSG_TXT_NMN'), width: '91.4', styleName: 'text-right' }, // 수석차월
        { fieldName: 'mngerFstOpng', header: t('MSG_TXT_FST') + t('MSG_TXT_OPNG_MM'), width: '110', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 매니저개시사항-최초개시월
        { fieldName: 'mngerOpng', header: t('MSG_TXT_RE_OPNG') + t('MSG_TXT_MON'), width: '110', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 매니저개시사항-재개시월
        { fieldName: 'mngerFnlCltn', header: t('MSG_TXT_FNL_CLTN_MM'), width: '110', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 매니저개시사항-최종해약월
        { fieldName: 'mngerBizCltn', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '110', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 매니저개시사항-업무해약월
        { fieldName: 'mngerBltnNmn', header: t('MSG_TXT_OPNG_NMN'), width: '91.4', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 매니저개시사항-개시차월
        { fieldName: 'mngerSettleDsbTp', header: t('MSG_TXT_STMNT') + t('MSG_TXT_PAY_TYPE'), width: '91.4', styleName: 'text-center', options: codes.OPNG_CD }, // 매니저개시사항-정착지급유형
        { fieldName: 'indvD5AsnCnt', header: `5${t('MSG_TXT_D')}${t('MSG_TXT_ASN_N')}`, width: '91.4', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 매니저개시사항-5일배정수
        { fieldName: 'indvAsnCnt',
          header: t('MSG_TXT_ASGN_CT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인BS-배정건수
        { fieldName: 'indvFshCnt',
          header: t('MSG_TXT_FHS_CT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인BS-완료건수
        { fieldName: 'indvProcsRat',
          header: t('MSG_TXT_PROCS_RT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '###0.##',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인BS-처리율
        { fieldName: 'indvDbsRat',
          header: t('MSG_TXT_PYT_RT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인BS-지급률
        { fieldName: 'indvW1Cnt',
          header: `W1${t('MSG_TXT_COUNT')}`,
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인BS-W1건수
        { fieldName: 'indvW2Cnt',
          header: `W2${t('MSG_TXT_COUNT')}`,
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인BS-W2건수
        { fieldName: 'indvElhmAckmtCnt',
          header: t('MSG_TXT_ELHM_ACKMT_CT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인실적-가전인정건수
        { fieldName: 'indvRentalBasePrc',
          header: t('MSG_TXT_RENTAL_BASE_PRC'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인실적-렌탈기준가
        { fieldName: 'indvSpayBasePrc',
          header: t('MSG_TXT_SNGL_PMNT_BASE_PRC'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인실적-일시불기준가
        { fieldName: 'indvChdvcCnt',
          header: t('MSG_TXT_CHNG') + t('MSG_TXT_COUNT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인실적-기변건수
        { fieldName: 'indvElhmExcpAckmtPerf',
          header: t('MSG_TXT_ELHM_EXCP_ACKMT_PERF'),
          width: '100',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인실적-가전외인정실적
        { fieldName: 'indvFxamCt',
          header: t('MSG_TXT_FXAM') + t('MSG_TXT_COUNT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인기타판매-정액건수
        { fieldName: 'indvLivePakgCnt',
          header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인기타판매-라이브팩건수
        { fieldName: 'indvHcrMshCnt',
          header: t('MSG_TXT_HCR_MSH') + t('MSG_TXT_COUNT'),
          width: '120',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인기타판매-홈케어멤버십건수
        { fieldName: 'indvCanCnt',
          header: t('MSG_TXT_LSTMM') + t('MSG_TXT_CANCEL'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인계정순증-전월취소
        { fieldName: 'indvNwCnt',
          header: t('MSG_TXT_THM_NW'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인계정순증-당월신규
        { fieldName: 'indvNinc',
          header: t('MSG_TXT_NINC'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인계정순증-순증
      );
    } else if (rsbDvCd === 'W0204') { // 지점장
      columns.push(
        { fieldName: 'prfmtMm', header: t('MSG_TXT_PRFMT_MON'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 승진월
        { fieldName: 'prfmtNmn', header: t('MSG_TXT_PRFMT_NMN'), width: '91.4', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 승진차월
        { fieldName: 'metgPrscDc', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '91.4', styleName: 'text-right' }, // 미팅일수
        { fieldName: 'qlfDvCd', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center', options: codes.QLF_DV_CD }, // 자격-수수료월
        { fieldName: 'nmnQlfDvNm', header: 'M+1', width: '140', styleName: 'text-center' }, // 자격-M+1
        { fieldName: 'strtup', header: t('MSG_TXT_BRANCH') + t('MSG_TXT_ONL'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 교육-지점온라인
        { fieldName: 'indvAsnCnt',
          header: t('MSG_TXT_ASGN_CT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인BS-배정건수
        { fieldName: 'indvFshCnt',
          header: t('MSG_TXT_FHS_CT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인BS-완료건수
        { fieldName: 'indvProcsRat',
          header: t('MSG_TXT_PROCS_RT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '###0.##',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인BS-처리율
        { fieldName: 'indvDbsRat',
          header: t('MSG_TXT_PYT_RT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인BS-지급률
        { fieldName: 'indvW1Cnt',
          header: `W1${t('MSG_TXT_COUNT')}`,
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인BS-W1건수
        { fieldName: 'indvW2Cnt',
          header: `W2${t('MSG_TXT_COUNT')}`,
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인BS-W2건수
        { fieldName: 'ogAsnCnt',
          header: t('MSG_TXT_ASGN_CT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직BS-배정건수
        { fieldName: 'ogFshCnt',
          header: t('MSG_TXT_FHS_CT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직BS-완료건수
        { fieldName: 'ogProcsRat',
          header: t('MSG_TXT_PROCS_RT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '###0.##',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직BS-처리율
        { fieldName: 'ogDbsRat',
          header: t('MSG_TXT_PYT_RT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '###0.##',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직BS-지급률
        { fieldName: 'indvElhmAckmtCnt',
          header: t('MSG_TXT_ELHM_ACKMT_CT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인실적-가전인정건수
        { fieldName: 'indvRentalBasePrc',
          header: t('MSG_TXT_RENTAL_BASE_PRC'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인실적-렌탈기준가
        { fieldName: 'indvSpayBasePrc',
          header: t('MSG_TXT_SNGL_PMNT_BASE_PRC'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인실적-일시불기준가
        { fieldName: 'indvChdvcCnt',
          header: t('MSG_TXT_CHNG') + t('MSG_TXT_COUNT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인실적-기변건수
        { fieldName: 'indvElhmExcpAckmtPerf',
          header: t('MSG_TXT_ELHM_EXCP_ACKMT_PERF'),
          width: '100',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인실적-가전외인정실적
        { fieldName: 'indvFxamCt',
          header: t('MSG_TXT_FXAM') + t('MSG_TXT_COUNT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인기타판매-정액건수
        { fieldName: 'indvLivePakgCnt',
          header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인기타판매-라이브팩건수
        { fieldName: 'indvHcrMshCnt',
          header: t('MSG_TXT_HCR_MSH') + t('MSG_TXT_COUNT'),
          width: '120',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인기타판매-홈케어멤버십건수
        { fieldName: 'indvCanCnt',
          header: t('MSG_TXT_LSTMM') + t('MSG_TXT_CANCEL'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인계정순증-전월취소
        { fieldName: 'indvNwCnt',
          header: t('MSG_TXT_THM_NW'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인계정순증-당월신규
        { fieldName: 'indvNinc',
          header: t('MSG_TXT_NINC'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인계정순증-순증
        { fieldName: 'ogElhmAckmtCnt',
          header: t('MSG_TXT_ELHM_ACKMT_CT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직실적-가전인정건수
        { fieldName: 'ogRentalBasePrc',
          header: t('MSG_TXT_RENTAL_BASE_PRC'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직실적-렌탈기준가
        { fieldName: 'ogSpayBasePrc',
          header: t('MSG_TXT_SNGL_PMNT_BASE_PRC'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직실적-일시불기준가
        { fieldName: 'ogChdvcCnt',
          header: t('MSG_TXT_CHNG') + t('MSG_TXT_COUNT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직실적-기변건수
        { fieldName: 'ogPerfSum',
          header: t('MSG_TXT_AGG'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직실적-계
        { fieldName: 'ogCanCnt',
          header: t('MSG_TXT_LSTMM') + t('MSG_TXT_CANCEL'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직계정순증-전월취소
        { fieldName: 'ogNwCnt',
          header: t('MSG_TXT_THM_NW'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직계정순증-당월신규
        { fieldName: 'ogNinc',
          header: t('MSG_TXT_NINC'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직계정순증-순증
      );
    } else if (isEmpty(rsbDvCd)) { // 전체
      columns.push(
        { fieldName: 'prfmtMm', header: t('MSG_TXT_PRFMT_MON'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 승진월
        { fieldName: 'prfmtNmn', header: t('MSG_TXT_PRFMT_NMN'), width: '91.4', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 승진차월
        { fieldName: 'metgPrscDc', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '91.4', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 미팅일수
        { fieldName: 'qlfDvCd', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center', options: codes.QLF_DV_CD }, // 자격-수수료월
        { fieldName: 'nmnQlfDvNm', header: 'M+1', width: '140', styleName: 'text-center' }, // 자격-M+1
        { fieldName: 'strtup', header: t('MSG_TXT_SRTUP'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 교육-스타트업
        { fieldName: 'preStrtup', header: t('MSG_TXT_PRE_START_UP'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 교육-PRE스타트업
        { fieldName: 'eduCmpf', header: t('MSG_TXT_CMPF'), width: '91.4', styleName: 'text-center' }, // 교육-보수
        { fieldName: 'eduMngerSettle1', header: `${t('MSG_TXT_STMNT')}1`, width: '91.4', styleName: 'text-center' }, // 교육-정착1
        { fieldName: 'eduMngerSettle2', header: `${t('MSG_TXT_STMNT')}2`, width: '91.4', styleName: 'text-center' }, // 교육-정착2
        { fieldName: 'eduMngerSettle345', header: `${t('MSG_TXT_STMNT')}3,4,5`, width: '91.4', styleName: 'text-center' }, // 교육-정착3,4,5
        { fieldName: 'edu2Pre', header: `Pre${t('MSG_TXT_ACML')}${t('MSG_TXT_EDUC')}`, width: '91.4', styleName: 'text-center' }, // 교육-지점온라인
        { fieldName: 'eduBrmgrOnl', header: t('MSG_TXT_BRANCH') + t('MSG_TXT_ONL'), width: '91.4', styleName: 'text-center' }, // 교육-PRE누적교육
        { fieldName: 'topmrSettle', header: t('MSG_TXT_TOPMR') + t('MSG_TXT_STMNT'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 교육-수석정착
        { fieldName: 'topmrNmn', header: t('MSG_TXT_TOPMR') + t('MSG_TXT_NMN'), width: '91.4', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 교육-수석차월
        { fieldName: 'mngerFstOpng', header: t('MSG_TXT_FST') + t('MSG_TXT_OPNG_MM'), width: '110', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 매니저개시사항-최초개시월
        { fieldName: 'mngerOpng', header: t('MSG_TXT_RE_OPNG') + t('MSG_TXT_MON'), width: '110', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 매니저개시사항-재개시월
        { fieldName: 'mngerFnlCltn', header: t('MSG_TXT_FNL_CLTN_MM'), width: '110', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 매니저개시사항-최종해약월
        { fieldName: 'mngerBizCltn', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '110', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 매니저개시사항-업무해약월
        { fieldName: 'mngerBltnNmn', header: t('MSG_TXT_OPNG_NMN'), width: '91.4', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 매니저개시사항-개시차월
        { fieldName: 'mngerSettleDsbTp', header: t('MSG_TXT_STMNT') + t('MSG_TXT_PAY_TYPE'), width: '91.4', styleName: 'text-center', options: codes.OPNG_CD }, // 매니저개시사항-정착지급유형
        { fieldName: 'indvD5AsnCnt',
          header: `5${t('MSG_TXT_D')}${t('MSG_TXT_ASN_N')}`,
          width: '91.4',
          styleName: 'text-center',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 매니저개시사항-5일배정수
        { fieldName: 'indvAsnCnt',
          header: t('MSG_TXT_ASGN_CT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인BS-배정건수
        { fieldName: 'indvFshCnt',
          header: t('MSG_TXT_FHS_CT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인BS-완료건수
        { fieldName: 'indvProcsRat',
          header: t('MSG_TXT_PROCS_RT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '###0.##',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인BS-처리율
        { fieldName: 'indvDbsRat',
          header: t('MSG_TXT_PYT_RT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '###0.##',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인BS-지급률
        { fieldName: 'indvW1Cnt',
          header: `W1${t('MSG_TXT_COUNT')}`,
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인BS-W1건수
        { fieldName: 'indvW2Cnt',
          header: `W2${t('MSG_TXT_COUNT')}`,
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인BS-W2건수
        { fieldName: 'ogAsnCnt',
          header: t('MSG_TXT_ASGN_CT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직BS-배정건수
        { fieldName: 'ogFshCnt',
          header: t('MSG_TXT_FHS_CT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직BS-완료건수
        { fieldName: 'ogProcsRat',
          header: t('MSG_TXT_PROCS_RT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '###0.##',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직BS-처리율
        { fieldName: 'ogDbsRat',
          header: t('MSG_TXT_PYT_RT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '###0.##',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직BS-지급률
        { fieldName: 'indvElhmAckmtCnt',
          header: t('MSG_TXT_ELHM_ACKMT_CT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인실적-가전인정건수
        { fieldName: 'indvRentalBasePrc',
          header: t('MSG_TXT_RENTAL_BASE_PRC'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인실적-렌탈기준가
        { fieldName: 'indvSpayBasePrc',
          header: t('MSG_TXT_SNGL_PMNT_BASE_PRC'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인실적-일시불기준가
        { fieldName: 'indvChdvcCnt',
          header: t('MSG_TXT_CHNG') + t('MSG_TXT_COUNT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인실적-기변건수
        { fieldName: 'indvElhmExcpAckmtPerf',
          header: t('MSG_TXT_ELHM_EXCP_ACKMT_PERF'),
          width: '100',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인실적-가전외인정실적
        { fieldName: 'indvFxamCt',
          header: t('MSG_TXT_FXAM') + t('MSG_TXT_COUNT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인기타판매-정액건수
        { fieldName: 'indvLivePakgCnt',
          header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인기타판매-라이브팩건수
        { fieldName: 'indvHcrMshCnt',
          header: t('MSG_TXT_HCR_MSH') + t('MSG_TXT_COUNT'),
          width: '120',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인기타판매-홈케어멤버십건수
        { fieldName: 'indvCanCnt',
          header: t('MSG_TXT_LSTMM') + t('MSG_TXT_CANCEL'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인계정순증-전월취소
        { fieldName: 'indvNwCnt',
          header: t('MSG_TXT_THM_NW'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인계정순증-당월신규
        { fieldName: 'indvNinc',
          header: t('MSG_TXT_NINC'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 개인계정순증-순증
        { fieldName: 'ogElhmAckmtCnt',
          header: t('MSG_TXT_ELHM_ACKMT_CT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직실적-가전인정건수
        { fieldName: 'ogRentalBasePrc',
          header: t('MSG_TXT_RENTAL_BASE_PRC'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직실적-렌탈기준가
        { fieldName: 'ogSpayBasePrc',
          header: t('MSG_TXT_SNGL_PMNT_BASE_PRC'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직실적-일시불기준가
        { fieldName: 'ogChdvcCnt',
          header: t('MSG_TXT_CHNG') + t('MSG_TXT_COUNT'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직실적-기변건수
        { fieldName: 'ogPerfSum',
          header: t('MSG_TXT_AGG'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직실적-계
        { fieldName: 'ogCanCnt',
          header: t('MSG_TXT_LSTMM') + t('MSG_TXT_CANCEL'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직계정순증-전월취소
        { fieldName: 'ogNwCnt',
          header: t('MSG_TXT_THM_NW'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직계정순증-당월신규
        { fieldName: 'ogNinc',
          header: t('MSG_TXT_NINC'),
          width: '91.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 조직계정순증-순증
        { fieldName: 'homeCare',
          header: t('MSG_TXT_HOME_CARE'),
          width: '129',
          styleName: 'text-right',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'rstl',
          header: t('MSG_TXT_RSTL'),
          width: '129',
          styleName: 'text-right',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'livePakg',
          header: t('MSG_TXT_LIVE_PAKG'),
          width: '129',
          styleName: 'text-right',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'indv1Fee',
          header: t('MSG_TXT_ELHM_PRPN'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'indv2Fee',
          header: t('MSG_TXT_ELHM_EXCP_PRPN'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'indv3Fee',
          header: t('MSG_TXT_ELHM') + t('MSG_TXT_SAL_INTV'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'indv4Fee',
          header: t('MSG_TXT_METG'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'indv5Fee',
          header: t('MSG_TXT_EDUC'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'indv6Fee',
          header: t('MSG_TXT_STMNT'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'indv7Fee',
          header: t('MSG_TXT_MCHN_CH'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'indv8Fee',
          header: `BS${t('MSG_TXT_MGT')}`,
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'indv9Fee',
          header: `BS${t('MSG_TXT_ENRG')}`,
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'indv10Fee',
          header: t('MSG_TXT_RGLVL'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'indv11Fee',
          header: `WM${t('MSG_TXT_CMNC')}`,
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'indv12Fee',
          header: `WM${t('MSG_TXT_ETC')}`,
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'indv13Fee',
          header: t('MSG_TXT_PRR_VST'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'indv14Fee',
          header: t('MSG_TXT_UNIFORM'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'indv15Fee',
          header: t('MSG_TXT_MAT_HODT'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'indv16Fee',
          header: t('MSG_TXT_ADD') + t('MSG_TXT_ENRG'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'og1Fee',
          header: t('MSG_TXT_ELHM_OG_PRPN'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'og2Fee',
          header: t('MSG_TXT_ELHM_EXCP_OG_PRPN'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'og3Fee',
          header: t('MSG_TXT_OG_SELL_ENCRG'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'og4Fee',
          header: t('MSG_TXT_EDUC'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'og5Fee',
          header: t('MSG_TXT_NINC_MGT'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'og6Fee',
          header: `${t('MSG_TXT_OG_EJT')}1`,
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'og7Fee',
          header: `${t('MSG_TXT_OG_EJT')}2`,
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'og8Fee',
          header: t('MSG_TXT_NB_BRCH'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'etc1Atc',
          header: t('MSG_TXT_ADSB'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'etc2Atc',
          header: t('MSG_TXT_MEMBERSHIP'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
        { fieldName: 'etc3Atc',
          header: t('MSG_TXT_ETC_SPPT'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } },
      );
    }

    // 직책유형을 선택했을 때만 수수료를 가변으로 가져옴.
    if (!isEmpty(rsbDvCd)) {
      // 개인수수료 항목
      if (!isEmpty(feeHeaderIndvList)) {
        feeHeaderIndvList.forEach((e) => {
          columns.push({
            fieldName: `fee${e.dtaCrtFeeCd}`,
            header: `${e.srnMarkFeeNm}`,
            width: '140',
            styleName: 'text-right',
            dataType: 'number',
            numberFormat: '#,##0',
            headerSummary: {
              numberFormat: '#,##0',
              expression: 'sum',
            },
          });
        });
      }

      // 조직수수료 항목
      if (!isEmpty(feeHeaderOgList)) {
        feeHeaderOgList.forEach((e) => {
          columns.push({
            fieldName: `fee${e.dtaCrtFeeCd}`,
            header: `${e.srnMarkFeeNm}`,
            width: '140',
            styleName: 'text-right',
            dataType: 'number',
            numberFormat: '#,##0',
            headerSummary: {
              numberFormat: '#,##0',
              expression: 'sum',
            },
          });
        });
      }

      // 기타수수료 항목
      if (!isEmpty(feeHeaderEtcList)) {
        feeHeaderEtcList.forEach((e) => {
          columns.push({
            fieldName: `fee${e.dtaCrtFeeCd}`,
            header: `${e.srnMarkFeeNm}`,
            width: '140',
            styleName: 'text-right',
            dataType: 'number',
            numberFormat: '#,##0',
            headerSummary: {
              numberFormat: '#,##0',
              expression: 'sum',
            },
          });
        });
      }
    }

    // 수수료계
    columns.push(
      { fieldName: 'intbsAmt',
        header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 과표계
      { fieldName: 'ddctam',
        header: t('MSG_TXT_DDTN_SUM'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 공제계
      { fieldName: 'dsbOjAmt',
        header: t('MSG_TXT_ACL_DSB_AMT'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 실지급액
    );
  } else if (perfYm < '202304') {
    // 2023년04월 이전
    columns.push(
      { fieldName: 'metgPrscDc', header: t('MSG_TXT_METG') + t('MSG_TXT_DC'), width: '91.4', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 미팅일수
      { fieldName: 'qlfDvCd', header: t('MSG_TXT_FEE') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center', options: codes.QLF_DV_CD }, // 자격-수수료월
      { fieldName: 'nmnQlfDvNm', header: 'M+1', width: '140', styleName: 'text-center' }, // 자격-M+1
    );

    if (rsbDvCd === 'W0205') { // 플래너
      columns.push(
        { fieldName: 'strtup', header: t('MSG_TXT_MANAGER'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 스타트업-매니저
        { fieldName: 'plarStrtup', header: t('MSG_TXT_PLAR'), width: '88.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 스타트업-플래너
        { fieldName: 'eduCmpfYn', header: t('MSG_TXT_CMPF') + t('MSG_TXT_EDUC'), width: '88.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 보수교육
        { fieldName: 'topmrSettle', header: t('MSG_TXT_STMNT'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 수석플래너교육-정착
        { fieldName: 'topmrNmn', header: t('MSG_TXT_NMN'), width: '91.4', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 수석플래너교육-차월
        { fieldName: 'topmrPrtic', header: t('MSG_TXT_PRTIC'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 수석플래너교육-실전
        { fieldName: 'ojt', header: `OJT${t('MSG_TXT_DC')}`, width: '122.7', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // OJT일수
        { fieldName: 'bizRgst', header: t('MSG_TXT_RGS') + t('MSG_TXT_BASE_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 등록기준월
        { fieldName: 'fstBizRgst', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 최초업무등록월
        { fieldName: 'reBizRgst', header: t('MSG_TXT_RETR') + t('MSG_TXT_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 재등록월
        { fieldName: 'bizFnlCltn', header: t('MSG_TXT_FNL_CLTN_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 최종해약월
        { fieldName: 'bizCltn', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 업무해약월
        { fieldName: 'prfmtMm', header: t('MSG_TXT_PRFMT_MON'), width: '89.3', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 승진월-지점장은 승진월, 플래너는 강등월
        { fieldName: 'plarRgstMm', header: t('MSG_TXT_RGS') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 수석플래너-등록월
        { fieldName: 'plarCltnMm', header: t('MSG_TXT_CLTN') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 수석플래너-해약월
        { fieldName: 'wmRestrtDt', header: `WM${t('MSG_TXT_OPNG')}`, width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // WM개시
        { fieldName: 'wmCltnDt', header: `WM${t('MSG_TXT_CLTN')}`, width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // WM해약
        { fieldName: 'aclActiAchv', header: t('MSG_TXT_ACL_ACTI') + t('MSG_TXT_ACHV'), width: '122.7', styleName: 'text-center' }, // 실활동달성
      );
    } else if (rsbDvCd === 'W0204') { // 지점장
      columns.push(
        { fieldName: 'topmrSettle', header: t('MSG_TXT_STMNT'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 수석플래너교육-정착
        { fieldName: 'topmrNmn', header: t('MSG_TXT_NMN'), width: '91.4', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 수석플래너교육-차월
        { fieldName: 'eduBrmgrOnl', header: t('MSG_TXT_BRMGR') + t('MSG_TXT_ONL'), width: '88.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 지점장온라인
        { fieldName: 'bizRgst', header: t('MSG_TXT_RGS') + t('MSG_TXT_BASE_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 등록기준월
        { fieldName: 'fstBizRgst', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 최초업무등록월
        { fieldName: 'reBizRgst', header: t('MSG_TXT_RETR') + t('MSG_TXT_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 재등록월
        { fieldName: 'bizFnlCltn', header: t('MSG_TXT_FNL_CLTN_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 최종해약월
        { fieldName: 'bizCltn', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 업무해약월
        { fieldName: 'prfmtMm', header: t('MSG_TXT_PRFMT_MON'), width: '89.3', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 승진월-지점장은 승진월, 플래너는 강등월
        { fieldName: 'plarRgstMm', header: t('MSG_TXT_RGS') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 수석플래너-등록월
        { fieldName: 'plarCltnMm', header: t('MSG_TXT_CLTN') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 수석플래너-해약월
        { fieldName: 'wmRestrtDt', header: `WM${t('MSG_TXT_OPNG')}`, width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // WM개시
        { fieldName: 'wmCltnDt', header: `WM${t('MSG_TXT_CLTN')}`, width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // WM해약
        { fieldName: 'aclActiMinBaseAchv', header: t('MSG_TXT_MIN') + t('MSG_TXT_BASE') + t('MSG_TXT_ACHV'), width: '110.4', styleName: 'text-center' }, // 실활동인원-최소기준달성
        { fieldName: 'lstmmCprDv', header: t('MSG_TXT_LSTMM') + t('MSG_TXT_CPR') + t('MSG_TXT_DIV'), width: '110.4', styleName: 'text-center' }, // 실활동인원-전월대비구분
        { fieldName: 'wpcnt',
          header: 'WP',
          width: '110.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 실활동인원-WP
        { fieldName: 'wmcnt',
          header: 'WM',
          width: '122.7',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 실활동인원-WM
        { fieldName: 'spcnt',
          header: 'SP',
          width: '122.7',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 실활동인원-SP
        { fieldName: 'totPpl',
          header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_PERSONS'),
          width: '110.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 실활동인원-총인원
      );
    } else if (isEmpty(rsbDvCd)) { // 전체
      columns.push(
        { fieldName: 'strtup', header: t('MSG_TXT_MANAGER'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 스타트업-매니저
        { fieldName: 'plarStrtup', header: t('MSG_TXT_PLAR'), width: '88.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 스타트업-플래너
        { fieldName: 'eduCmpfYn', header: t('MSG_TXT_CMPF') + t('MSG_TXT_EDUC'), width: '88.7', styleName: 'text-center' }, // 보수교육
        { fieldName: 'topmrSettle', header: t('MSG_TXT_STMNT'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 수석플래너교육-정착
        { fieldName: 'topmrNmn', header: t('MSG_TXT_NMN'), width: '91.4', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // 수석플래너교육-차월
        { fieldName: 'topmrPrtic', header: t('MSG_TXT_PRTIC'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 수석플래너교육-실전
        { fieldName: 'eduBrmgrOnl', header: t('MSG_TXT_BRMGR') + t('MSG_TXT_ONL'), width: '88.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 지점장온라인
        { fieldName: 'ojt', header: `OJT${t('MSG_TXT_DC')}`, width: '122.7', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' }, // OJT일수
        { fieldName: 'bizRgst', header: t('MSG_TXT_RGS') + t('MSG_TXT_BASE_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 등록기준월
        { fieldName: 'fstBizRgst', header: t('MSG_TXT_FST') + t('MSG_TXT_BIZ_RGST_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 최초업무등록월
        { fieldName: 'reBizRgst', header: t('MSG_TXT_RETR') + t('MSG_TXT_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 재등록월
        { fieldName: 'bizFnlCltn', header: t('MSG_TXT_FNL_CLTN_MM'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 최종해약월
        { fieldName: 'bizCltn', header: t('MSG_TXT_BIZ_CLTN_MON'), width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 업무해약월
        { fieldName: 'prfmtMm', header: t('MSG_TXT_PRFMT_MON'), width: '89.3', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 승진월
        { fieldName: 'plarRgstMm', header: t('MSG_TXT_RGS') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 수석플래너-등록월
        { fieldName: 'plarCltnMm', header: t('MSG_TXT_CLTN') + t('MSG_TXT_MON'), width: '91.4', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 수석플래너-해약월
        { fieldName: 'wmRestrtDt', header: `WM${t('MSG_TXT_OPNG')}`, width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // WM개시
        { fieldName: 'wmCltnDt', header: `WM${t('MSG_TXT_CLTN')}`, width: '122.7', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // WM해약
        { fieldName: 'aclActiAchv', header: t('MSG_TXT_ACL_ACTI') + t('MSG_TXT_ACHV'), width: '122.7', styleName: 'text-center' }, // 실활동달성
        { fieldName: 'aclActiMinBaseAchv', header: t('MSG_TXT_MIN') + t('MSG_TXT_BASE') + t('MSG_TXT_ACHV'), width: '110.4', styleName: 'text-center' }, // 실활동인원-최소기준달성
        { fieldName: 'lstmmCprDv', header: t('MSG_TXT_LSTMM') + t('MSG_TXT_CPR') + t('MSG_TXT_DIV'), width: '110.4', styleName: 'text-center' }, // 실활동인원-전월대비구분
        { fieldName: 'wpcnt',
          header: 'WP',
          width: '110.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 실활동인원-WP
        { fieldName: 'wmcnt',
          header: 'WM',
          width: '122.7',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 실활동인원-WM
        { fieldName: 'spcnt',
          header: 'SP',
          width: '122.7',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 실활동인원-SP
        { fieldName: 'totPpl',
          header: t('MSG_TXT_COM_TOT') + t('MSG_TXT_PERSONS'),
          width: '110.4',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 실활동인원-총인원
      );
    }

    // 중간에 공통된 항목
    columns.push(
      { fieldName: 'indvRental',
        header: t('MSG_TXT_RENTAL'),
        width: '110.4',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 인정실적-렌탈
      { fieldName: 'indvSpay',
        header: t('MSG_TXT_SNGL_PMNT'),
        width: '110.4',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 인정실적-일시불
      { fieldName: 'indvEnvrElhmExcp',
        header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP'),
        width: '110.4',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 인정실적-환경가전외
      { fieldName: 'indvElhmNtor',
        header: t('MSG_TXT_ELHM') + t('MSG_TXT_NTOR') + t('MSG_TXT_COUNT'),
        width: '110.4',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 가전순주문건수
      { fieldName: 'indvElhmAckmt',
        header: t('MSG_TXT_INDV') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'),
        width: '122.7',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 개인가전인정건수
      { fieldName: 'indvBsAckmt',
        header: `${t('MSG_TXT_INDV')}BS${t('MSG_TXT_ACKMT')}${t('MSG_TXT_COUNT')}`,
        width: '110.4',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 개인BS인정건수
      { fieldName: 'indvElhmChdvcCnt',
        header: t('MSG_TXT_COUNT'),
        width: '110.4',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 가전기변-건수
      { fieldName: 'indvElhmChdvcAmt',
        header: t('MSG_TXT_AMT'),
        width: '110.4',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 가전기변-금액
      { fieldName: 'indvEnvrElhmRental',
        header: t('MSG_TXT_RENTAL'),
        width: '122.7',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 환경가전(기준금액)-렌탈
      { fieldName: 'indvEnvrElhmSpay',
        header: t('MSG_TXT_SNGL_PMNT'),
        width: '139.2',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 환경가전(기준금액)-일시불
      { fieldName: 'indvEnvrElhmFxam',
        header: t('MSG_TXT_FXAM'),
        width: '176',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 환경가전(기준금액)-정액
      { fieldName: 'indvEnvrElhmExcpSpay',
        header: t('MSG_TXT_SNGL_PMNT'),
        width: '122.7',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 환경가전외(기준금액)-일시불
      { fieldName: 'indvEnvrElhmExcpFxam',
        header: t('MSG_TXT_FXAM'),
        width: '122.7',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 환경가전외(기준금액)-정액
      { fieldName: 'indvLivePakgCnt',
        header: t('MSG_TXT_LIVE_PAKG') + t('MSG_TXT_COUNT'),
        width: '110.4',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 라이브팩건수
      { fieldName: 'indvNwSellCnt',
        header: t('MSG_TXT_INDV') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'),
        width: '122.7',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 개인신규판매 건수
      { fieldName: 'indvHcrSellCnt',
        header: t('MSG_TXT_HOME_CARE') + t('TXT_MSG_SELL_PRC'),
        width: '128.1',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 홈케어판매가
      { fieldName: 'ogElhmAckmt',
        header: t('MSG_TXT_OG') + t('MSG_TXT_ELHM') + t('MSG_TXT_ACKMT') + t('MSG_TXT_COUNT'),
        width: '122.7',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 조직가전인정건수
      { fieldName: 'ogNwSellCnt',
        header: t('MSG_TXT_OG') + t('MSG_TXT_NEW') + t('MSG_TXT_SELL') + t('MSG_TXT_COUNT'),
        width: '122.7',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 조직신규판매건수
      { fieldName: 'ogEnvrElhmRental',
        header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_RENTAL'),
        width: '122.7',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 조직(기준금액)-환경가전렌탈
      { fieldName: 'ogEnvrElhmSpay',
        header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_SNGL_PMNT'),
        width: '122.7',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 조직(기준금액)-환경가전일시불
      { fieldName: 'ogEnvrElhmExcpSpay',
        header: t('MSG_TXT_ENVR') + t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_SNGL_PMNT'),
        width: '122.7',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 조직(기준금액)-환경가전외 일시불
      { fieldName: 'feeHcr',
        header: t('MSG_TXT_HOME_CARE'),
        width: '122.7',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 홈케어
      { fieldName: 'feeLivePakg',
        header: t('MSG_TXT_LIVE_PAKG'),
        width: '122.7',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 라이브팩
      { fieldName: 'feeElhmPrpn',
        header: t('MSG_TXT_ELHM') + t('MSG_TXT_PRPN'),
        width: '122.7',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 가전비례
      { fieldName: 'feeElhmExcpPrpn',
        header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 가전외 비례
    );

    if (rsbDvCd === 'W0205') { // 플래너
      columns.push(
        { fieldName: 'elhmMetg',
          header: t('MSG_TXT_ELHM') + t('MSG_TXT_METG'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 가전미팅
        { fieldName: 'spayMetg',
          header: t('MSG_TXT_SNGL_PMNT') + t('MSG_TXT_METG'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 일시불미팅
        { fieldName: 'elhmExcpMetg',
          header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_METG'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 가전외미팅
      );
    } else if (isEmpty(rsbDvCd)) { // 전체
      columns.push(
        { fieldName: 'elhmMetg',
          header: t('MSG_TXT_ELHM') + t('MSG_TXT_METG'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 가전미팅
        { fieldName: 'spayMetg',
          header: t('MSG_TXT_SNGL_PMNT') + t('MSG_TXT_METG'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 일시불미팅
        { fieldName: 'elhmExcpMetg',
          header: t('MSG_TXT_ELHM') + t('MSG_TXT_EXCP') + t('MSG_TXT_METG'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 가전외미팅
      );
    }

    // 중간에 공통된 항목
    columns.push(
      { fieldName: 'feeSellEncrg',
        header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 판매장려
      { fieldName: 'feeEdu',
        header: t('MSG_TXT_EDUC'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 교육
      { fieldName: 'feeSettle',
        header: t('MSG_TXT_STMNT'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 정착
      { fieldName: 'feeMchnCh',
        header: t('MSG_TXT_MCHN_CH'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 기기변경
      { fieldName: 'feeBsMngt',
        header: `BS${t('MSG_TXT_MGT')}`,
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // BS관리
      { fieldName: 'feeRglvl',
        header: t('MSG_TXT_RGLVL'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 급지
      { fieldName: 'feeSellEncrgRett',
        header: t('MSG_TXT_SELL') + t('MSG_TXT_ENRG') + t('MSG_TXT_RETT'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 판매장려 소급
      { fieldName: 'feeElhmOgPrpn',
        header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_PRPN'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 가전조직비례
      { fieldName: 'feeElhmOgExcpPrpn',
        header: t('MSG_TXT_ELHM') + t('MSG_TXT_OG') + t('MSG_TXT_EXCP') + t('MSG_TXT_PRPN'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 가전조직외비례
      { fieldName: 'feeOgSellEncrg',
        header: t('MSG_TXT_OG') + t('MSG_TXT_SELL') + t('MSG_TXT_ENRG'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 조직판매장려
      { fieldName: 'feeNwSell',
        header: t('MSG_TXT_NEW') + t('MSG_TXT_SELL'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 신규판매
      { fieldName: 'feeOgMngt',
        header: t('MSG_TXT_OG') + t('MSG_TXT_MGT'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 조직관리
    );

    if (rsbDvCd === 'W0204') { // 지점장
      columns.push(
        { fieldName: 'feeSpmtEncrg',
          header: t('MSG_TXT_ADD') + t('MSG_TXT_ENRG'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 추가장려
      );
    } else if (isEmpty(rsbDvCd)) { // 전체
      columns.push(
        { fieldName: 'feeSpmtEncrg',
          header: t('MSG_TXT_ADD') + t('MSG_TXT_ENRG'),
          width: '129',
          styleName: 'text-right',
          dataType: 'number',
          numberFormat: '#,###,##0',
          headerSummary: {
            numberFormat: '#,##0',
            expression: 'sum',
          } }, // 추가장려
      );
    }

    // 공통 항목
    columns.push(
      { fieldName: 'feeOgEjt1',
        header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}1`,
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 조직배출1
      { fieldName: 'feeOgEjt2',
        header: `${t('MSG_TXT_OG') + t('MSG_TXT_EJT')}2`,
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 조직배출2
      { fieldName: 'feeNbBrch',
        header: t('MSG_TXT_NB') + t('MSG_TXT_BRANCH'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 신설지점
      { fieldName: 'feeMsh',
        header: t('MSG_TXT_MEMBERSHIP'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 멤버십
      { fieldName: 'feeAdsb',
        header: t('MSG_TXT_ADSB'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 재지급
      { fieldName: 'feeEtcSppt',
        header: t('MSG_TXT_ETC') + t('MSG_TXT_SUPPORT'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 기타지원
      { fieldName: 'feeWmTelc',
        header: `WM${t('MSG_TXT_CMNC')}`,
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // WM통신
      { fieldName: 'feeWmEtc',
        header: `WM${t('MSG_TXT_ETC')}`,
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // WM기타
      { fieldName: 'feePrrVst',
        header: t('MSG_TXT_PRR_VST'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 사전방문
      { fieldName: 'feeUniform',
        header: t('MSG_TXT_UNIFORM'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 유니폼
      { fieldName: 'feeMatGrmg',
        header: t('MSG_TXT_MAT_HODT'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 자재실장
      { fieldName: 'indvBsFshCt',
        header: `BS${t('MSG_TXT_COMPLETE')}${t('MSG_TXT_ACC')}`,
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // BS완료계정
      { fieldName: 'intbsAmt',
        header: t('MSG_TXT_ASESS_STD_TX_BASE') + t('MSG_TXT_SUM'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 과표합계
      { fieldName: 'ddctam',
        header: t('MSG_TXT_DDTN_SUM'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 공제계
      { fieldName: 'dsbOjAmt',
        header: t('MSG_TXT_ACL_DSB_AMT'),
        width: '129',
        styleName: 'text-right',
        dataType: 'number',
        numberFormat: '#,###,##0',
        headerSummary: {
          numberFormat: '#,##0',
          expression: 'sum',
        } }, // 실지급액
    );
  }

  return columns;
}

// 그리드 컬럼레이아웃 세팅
function setGridColumnLayout(view) {
  const { perfYm, rsbDvCd } = searchParams.value;

  // 컬럼레이아웃 세팅을 위한 배열 생성
  // 2023년 4월이후, 직책유형이 전체가 아닐 때만 수수료 항목을 가변으로 가져옴
  if (!isEmpty(rsbDvCd) && perfYm >= '202304') {
    if (!isEmpty(feeHeaderIndvList)) {
      feeHeaderIndvList.forEach((e) => {
        feeHeaderIndvColumnList.push(`fee${e.dtaCrtFeeCd}`);
      });
    }

    if (!isEmpty(feeHeaderOgList)) {
      feeHeaderOgList.forEach((e) => {
        feeHeaderOgColumnList.push(`fee${e.dtaCrtFeeCd}`);
      });
    }

    if (!isEmpty(feeHeaderEtcList)) {
      feeHeaderEtcList.forEach((e) => {
        feeHeaderEtcColumnList.push(`fee${e.dtaCrtFeeCd}`);
      });
    }
  }

  if (perfYm >= '202304') { // 2023년04월 이후
    if (rsbDvCd === 'W0205') { // 플래너
      view.setColumnLayout([
        'ogNm', 'prtnrNo', 'prtnrKnm', 'rsbDvCd',
        {
          header: t('MSG_TXT_BIZ_RGST_ARTC'), // 업무등록사항
          direction: 'horizontal',
          items: ['fstBizRgst', 'bizRgst', 'bizFnlCltn', 'bizCltn'],
        },
        'metgPrscDc',
        {
          header: t('MSG_TXT_QLF'), // 자격
          direction: 'horizontal',
          items: ['qlfDvCd', 'nmnQlfDvNm'],
        },
        {
          header: t('MSG_TXT_EDUC'), // 교육
          direction: 'horizontal',
          items: ['strtup', 'preStrtup', 'eduCmpf', 'eduMngerSettle1', 'eduMngerSettle2', 'eduMngerSettle345', 'edu2Pre', 'topmrSettle', 'topmrNmn'],
        },
        {
          header: t('MSG_TXT_MANAGER') + t('MSG_TXT_OPNG_ARTC'), // 매니저개시사항
          direction: 'horizontal',
          items: ['mngerFstOpng', 'mngerOpng', 'mngerFnlCltn', 'mngerBizCltn', 'mngerBltnNmn', 'mngerSettleDsbTp', 'indvD5AsnCnt'],
        },
        {
          header: `${t('MSG_TXT_INDV')}BS`, // 개인BS
          direction: 'horizontal',
          items: ['indvAsnCnt', 'indvFshCnt', 'indvProcsRat', 'indvDbsRat', 'indvW1Cnt', 'indvW2Cnt'],
        },
        {
          header: t('MSG_TXT_INDV_PERF'), // 개인실적
          direction: 'horizontal',
          items: ['indvElhmAckmtCnt', 'indvRentalBasePrc', 'indvSpayBasePrc', 'indvChdvcCnt', 'indvElhmExcpAckmtPerf'],
        },
        {
          header: t('MSG_TXT_INDV') + t('MSG_TXT_ETC') + t('MSG_TXT_SELL'), // 개인기타판매
          direction: 'horizontal',
          items: ['indvFxamCt', 'indvLivePakgCnt', 'indvHcrMshCnt'],
        },
        {
          header: t('MSG_TXT_INDV') + t('MSG_TXT_ACC_NINC'), // 개인계정순증
          direction: 'horizontal',
          items: ['indvCanCnt', 'indvNwCnt', 'indvNinc'],
        },
        {
          header: t('MSG_TXT_PRSNL_FEE'), // 개인수수료
          direction: 'horizontal',
          items: feeHeaderIndvColumnList,
        },
        {
          header: t('MSG_TXT_ETC') + t('MSG_TXT_FEE'), // 기타수수료
          direction: 'horizontal',
          items: feeHeaderEtcColumnList,
        },
        {
          header: t('MSG_TXT_FEE_SUM'),
          direction: 'horizontal',
          items: ['intbsAmt', 'ddctam', 'dsbOjAmt'],
        },
      ]);
    } else if (rsbDvCd === 'W0204') { // 지점장
      view.setColumnLayout([
        'ogNm', 'prtnrNo', 'prtnrKnm', 'rsbDvCd',
        {
          header: t('MSG_TXT_BIZ_RGST_ARTC'), // 업무등록사항
          direction: 'horizontal',
          items: ['fstBizRgst', 'bizRgst', 'bizFnlCltn', 'bizCltn'],
        },
        'prfmtMm', 'prfmtNmn', 'metgPrscDc',
        {
          header: t('MSG_TXT_QLF'), // 자격
          direction: 'horizontal',
          items: ['qlfDvCd', 'nmnQlfDvNm'],
        },
        {
          header: t('MSG_TXT_EDUC'), // 교육
          direction: 'horizontal',
          items: ['strtup'],
        },
        {
          header: `${t('MSG_TXT_INDV')}BS`, // 개인BS
          direction: 'horizontal',
          items: ['indvAsnCnt', 'indvFshCnt', 'indvProcsRat', 'indvDbsRat', 'indvW1Cnt', 'indvW2Cnt'],
        },
        {
          header: `${t('MSG_TXT_OG')}BS`, // 조직BS
          direction: 'horizontal',
          items: ['ogAsnCnt', 'ogFshCnt', 'ogProcsRat', 'ogDbsRat'],
        },
        {
          header: t('MSG_TXT_INDV_PERF'), // 개인실적
          direction: 'horizontal',
          items: ['indvElhmAckmtCnt', 'indvRentalBasePrc', 'indvSpayBasePrc', 'indvChdvcCnt', 'indvElhmExcpAckmtPerf'],
        },
        {
          header: t('MSG_TXT_INDV') + t('MSG_TXT_ETC') + t('MSG_TXT_SELL'), // 개인기타판매
          direction: 'horizontal',
          items: ['indvFxamCt', 'indvLivePakgCnt', 'indvHcrMshCnt'],
        },
        {
          header: t('MSG_TXT_INDV') + t('MSG_TXT_ACC_NINC'), // 개인계정순증
          direction: 'horizontal',
          items: ['indvCanCnt', 'indvNwCnt', 'indvNinc'],
        },
        {
          header: t('MSG_TXT_OG_PERF'), // 조직실적
          direction: 'horizontal',
          items: ['ogElhmAckmtCnt', 'ogRentalBasePrc', 'ogSpayBasePrc', 'ogChdvcCnt', 'ogPerfSum'],
        },
        {
          header: t('MSG_TXT_OG') + t('MSG_TXT_ACC_NINC'), // 조직계정순증
          direction: 'horizontal',
          items: ['ogCanCnt', 'ogNwCnt', 'ogNinc'],
        },
        {
          header: t('MSG_TXT_PRSNL_FEE'), // 개인수수료
          direction: 'horizontal',
          items: feeHeaderIndvColumnList,
        },
        {
          header: t('MSG_TXT_ORGNSTN_FEE'), // 조직수수료
          direction: 'horizontal',
          items: feeHeaderOgColumnList,
        },
        {
          header: t('MSG_TXT_ETC') + t('MSG_TXT_FEE'), // 기타수수료
          direction: 'horizontal',
          items: feeHeaderEtcColumnList,
        },
        {
          header: t('MSG_TXT_FEE_SUM'),
          direction: 'horizontal',
          items: ['intbsAmt', 'ddctam', 'dsbOjAmt'],
        },
      ]);
    } else if (isEmpty(rsbDvCd)) { // 전체
      view.setColumnLayout([
        'ogNm', 'prtnrNo', 'prtnrKnm', 'rsbDvCd',
        {
          header: t('MSG_TXT_BIZ_RGST_ARTC'), // 업무등록사항
          direction: 'horizontal',
          items: ['fstBizRgst', 'bizRgst', 'bizFnlCltn', 'bizCltn'],
        },
        'prfmtMm', 'prfmtNmn', 'metgPrscDc',
        {
          header: t('MSG_TXT_QLF'), // 자격
          direction: 'horizontal',
          items: ['qlfDvCd', 'nmnQlfDvNm'],
        },
        {
          header: t('MSG_TXT_EDUC'), // 교육
          direction: 'horizontal',
          items: ['strtup', 'preStrtup', 'eduCmpf', 'eduMngerSettle1', 'eduMngerSettle2', 'eduMngerSettle345', 'edu2Pre', 'eduBrmgrOnl', 'topmrSettle', 'topmrNmn'],
        },
        {
          header: t('MSG_TXT_MANAGER') + t('MSG_TXT_OPNG_ARTC'), // 매니저개시사항
          direction: 'horizontal',
          items: ['mngerFstOpng', 'mngerOpng', 'mngerFnlCltn', 'mngerBizCltn', 'mngerBltnNmn', 'mngerSettleDsbTp', 'indvD5AsnCnt'],
        },
        {
          header: `${t('MSG_TXT_INDV')}BS`, // 개인BS
          direction: 'horizontal',
          items: ['indvAsnCnt', 'indvFshCnt', 'indvProcsRat', 'indvDbsRat', 'indvW1Cnt', 'indvW2Cnt'],
        },
        {
          header: `${t('MSG_TXT_OG')}BS`, // 조직BS
          direction: 'horizontal',
          items: ['ogAsnCnt', 'ogFshCnt', 'ogProcsRat', 'ogDbsRat'],
        },
        {
          header: t('MSG_TXT_INDV_PERF'), // 개인실적
          direction: 'horizontal',
          items: ['indvElhmAckmtCnt', 'indvRentalBasePrc', 'indvSpayBasePrc', 'indvChdvcCnt', 'indvElhmExcpAckmtPerf'],
        },
        {
          header: t('MSG_TXT_INDV') + t('MSG_TXT_ETC') + t('MSG_TXT_SELL'), // 개인기타판매
          direction: 'horizontal',
          items: ['indvFxamCt', 'indvLivePakgCnt', 'indvHcrMshCnt'],
        },
        {
          header: t('MSG_TXT_INDV') + t('MSG_TXT_ACC_NINC'), // 개인계정순증
          direction: 'horizontal',
          items: ['indvCanCnt', 'indvNwCnt', 'indvNinc'],
        },
        {
          header: t('MSG_TXT_OG_PERF'), // 조직실적
          direction: 'horizontal',
          items: ['ogElhmAckmtCnt', 'ogRentalBasePrc', 'ogSpayBasePrc', 'ogChdvcCnt', 'ogPerfSum'],
        },
        {
          header: t('MSG_TXT_OG') + t('MSG_TXT_ACC_NINC'), // 조직계정순증
          direction: 'horizontal',
          items: ['ogCanCnt', 'ogNwCnt', 'ogNinc'],
        },
        {
          header: t('MSG_TXT_PRSNL_FEE'), // 개인수수료
          direction: 'horizontal',
          items: ['homeCare', 'rstl', 'livePakg', 'indv1Fee', 'indv2Fee', 'indv3Fee', 'indv4Fee', 'indv5Fee', 'indv6Fee', 'indv7Fee', 'indv8Fee', 'indv9Fee', 'indv10Fee', 'indv11Fee', 'indv12Fee', 'indv13Fee', 'indv14Fee', 'indv15Fee', 'indv16Fee'],
        },
        {
          header: t('MSG_TXT_ORGNSTN_FEE'), // 조직수수료
          direction: 'horizontal',
          items: ['og1Fee', 'og2Fee', 'og3Fee', 'og4Fee', 'og5Fee', 'og6Fee', 'og7Fee', 'og8Fee'],
        },
        {
          header: t('MSG_TXT_ETC') + t('MSG_TXT_FEE'), // 기타수수료
          direction: 'horizontal',
          items: ['etc1Atc', 'etc2Atc', 'etc3Atc'],
        },
        {
          header: t('MSG_TXT_FEE_SUM'),
          direction: 'horizontal',
          items: ['intbsAmt', 'ddctam', 'dsbOjAmt'],
        },
      ]);
    }
  } else if (perfYm < '202304') { // 2023년04월 이전
    if (rsbDvCd === 'W0205') { // 플래너
      view.setColumnLayout([
        'ogNm', 'prtnrNo', 'prtnrKnm', 'rsbDvCd', 'metgPrscDc',
        {
          header: t('MSG_TXT_QLF'),
          direction: 'horizontal',
          items: ['qlfDvCd', 'nmnQlfDvNm'],
        },
        {
          header: t('MSG_TXT_SRTUP'),
          direction: 'horizontal',
          items: ['strtup', 'plarStrtup'],
        },
        'eduCmpfYn',
        {
          header: t('MSG_TXT_TOPMR_PLAR') + t('MSG_TXT_EDUC'),
          direction: 'horizontal',
          items: ['topmrSettle', 'topmrNmn', 'topmrPrtic'],
        },
        'ojt', 'bizRgst', 'fstBizRgst', 'reBizRgst', 'bizFnlCltn', 'bizCltn', 'prfmtMm',

        {
          header: t('MSG_TXT_TOPMR_PLAR'),
          direction: 'horizontal',
          items: ['plarRgstMm', 'plarCltnMm'],
        },
        'wmRestrtDt', 'wmCltnDt', 'aclActiAchv',
        {
          header: t('TXT_MSG_ACKMT_PERF'),
          direction: 'horizontal',
          items: ['indvRental', 'indvSpay', 'indvEnvrElhmExcp'],
        },
        'indvElhmNtor', 'indvElhmAckmt', 'indvBsAckmt',
        {
          header: t('MSG_TXT_ELHM') + t('MSG_TXT_CHNG'),
          direction: 'horizontal',
          items: ['indvElhmChdvcCnt', 'indvElhmChdvcAmt'],
        },
        {
          header: `${t('MSG_TXT_ENVR_ELHM')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
          direction: 'horizontal',
          items: ['indvEnvrElhmRental', 'indvEnvrElhmSpay', 'indvEnvrElhmFxam'],
        },
        {
          header: `${t('MSG_TXT_ENVR_ELHM') + t('MSG_TXT_EXCP')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
          direction: 'horizontal',
          items: ['indvEnvrElhmExcpSpay', 'indvEnvrElhmExcpFxam'],
        },
        'indvLivePakgCnt', 'indvNwSellCnt', 'indvHcrSellCnt', 'ogElhmAckmt', 'ogNwSellCnt',
        {
          header: `${t('MSG_TXT_OG')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
          direction: 'horizontal',
          items: ['ogEnvrElhmRental', 'ogEnvrElhmSpay', 'ogEnvrElhmExcpSpay'],
        },
        'feeHcr', 'feeLivePakg', 'feeElhmPrpn', 'feeElhmExcpPrpn',
        'elhmMetg', 'spayMetg', 'elhmExcpMetg', 'feeSellEncrg', 'feeEdu', 'feeSettle', 'feeMchnCh', 'feeBsMngt', 'feeRglvl',
        'feeSellEncrgRett', 'feeElhmOgPrpn', 'feeElhmOgExcpPrpn', 'feeOgSellEncrg', 'feeNwSell', 'feeOgMngt', 'feeOgEjt1', 'feeOgEjt2', 'feeNbBrch',
        'feeMsh', 'feeAdsb', 'feeEtcSppt', 'feeWmTelc', 'feeWmEtc', 'feePrrVst', 'feeUniform', 'feeMatGrmg', 'indvBsFshCt',
        'intbsAmt', 'ddctam', 'dsbOjAmt',
      ]);
    } else if (rsbDvCd === 'W0204') { // 지점장
      view.setColumnLayout([
        'ogNm', 'prtnrNo', 'prtnrKnm', 'rsbDvCd', 'metgPrscDc',
        {
          header: t('MSG_TXT_QLF'),
          direction: 'horizontal',
          items: ['qlfDvCd', 'nmnQlfDvNm'],
        },
        {
          header: t('MSG_TXT_TOPMR_PLAR') + t('MSG_TXT_EDUC'),
          direction: 'horizontal',
          items: ['topmrSettle', 'topmrNmn'],
        },
        'eduBrmgrOnl', 'bizRgst', 'fstBizRgst', 'reBizRgst', 'bizFnlCltn', 'bizCltn', 'prfmtMm',
        {
          header: t('MSG_TXT_TOPMR_PLAR'),
          direction: 'horizontal',
          items: ['plarRgstMm', 'plarCltnMm'],
        },
        'wmRestrtDt', 'wmCltnDt',
        {
          header: t('MSG_TXT_ACL_ACTI_PPL'),
          direction: 'horizontal',
          items: ['aclActiMinBaseAchv', 'lstmmCprDv', 'wpcnt', 'wmcnt', 'spcnt', 'totPpl'],
        },
        {
          header: t('TXT_MSG_ACKMT_PERF'),
          direction: 'horizontal',
          items: ['indvRental', 'indvSpay', 'indvEnvrElhmExcp'],
        },
        'indvElhmNtor', 'indvElhmAckmt', 'indvBsAckmt',
        {
          header: t('MSG_TXT_ELHM') + t('MSG_TXT_CHNG'),
          direction: 'horizontal',
          items: ['indvElhmChdvcCnt', 'indvElhmChdvcAmt'],
        },
        {
          header: `${t('MSG_TXT_ENVR_ELHM')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
          direction: 'horizontal',
          items: ['indvEnvrElhmRental', 'indvEnvrElhmSpay', 'indvEnvrElhmFxam'],
        },
        {
          header: `${t('MSG_TXT_ENVR_ELHM') + t('MSG_TXT_EXCP')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
          direction: 'horizontal',
          items: ['indvEnvrElhmExcpSpay', 'indvEnvrElhmExcpFxam'],
        },
        'indvLivePakgCnt', 'indvNwSellCnt', 'indvHcrSellCnt', 'ogElhmAckmt', 'ogNwSellCnt',
        {
          header: `${t('MSG_TXT_OG')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
          direction: 'horizontal',
          items: ['ogEnvrElhmRental', 'ogEnvrElhmSpay', 'ogEnvrElhmExcpSpay'],
        },
        'feeHcr', 'feeLivePakg', 'feeElhmPrpn', 'feeElhmExcpPrpn', 'feeSellEncrg', 'feeEdu', 'feeSettle', 'feeMchnCh',
        'feeBsMngt', 'feeRglvl', 'feeSellEncrgRett', 'feeElhmOgPrpn', 'feeElhmOgExcpPrpn', 'feeOgSellEncrg', 'feeNwSell', 'feeOgMngt',
        'feeSpmtEncrg', 'feeOgEjt1', 'feeOgEjt2', 'feeNbBrch', 'feeMsh', 'feeAdsb', 'feeEtcSppt', 'feeWmTelc',
        'feeWmEtc', 'feePrrVst', 'feeUniform', 'feeMatGrmg', 'indvBsFshCt', 'intbsAmt', 'ddctam', 'dsbOjAmt',

      ]);
    } else {
      view.setColumnLayout([
        'ogNm', 'prtnrNo', 'prtnrKnm', 'rsbDvCd', 'metgPrscDc',
        {
          header: t('MSG_TXT_QLF'),
          direction: 'horizontal',
          items: ['qlfDvCd', 'nmnQlfDvNm'],
        },
        {
          header: t('MSG_TXT_SRTUP'),
          direction: 'horizontal',
          items: ['strtup', 'plarStrtup'],
        },
        'eduCmpfYn',
        {
          header: t('MSG_TXT_TOPMR_PLAR') + t('MSG_TXT_EDUC'),
          direction: 'horizontal',
          items: ['topmrSettle', 'topmrNmn', 'topmrPrtic'],
        },
        'eduBrmgrOnl', 'ojt', 'bizRgst', 'fstBizRgst', 'reBizRgst', 'bizFnlCltn', 'bizCltn', 'prfmtMm',
        {
          header: t('MSG_TXT_TOPMR_PLAR'),
          direction: 'horizontal',
          items: ['plarRgstMm', 'plarCltnMm'],
        },
        'wmRestrtDt', 'wmCltnDt', 'aclActiAchv',
        {
          header: t('MSG_TXT_ACL_ACTI_PPL'),
          direction: 'horizontal',
          items: ['aclActiMinBaseAchv', 'lstmmCprDv', 'wpcnt', 'wmcnt', 'spcnt', 'totPpl'],
        },
        {
          header: t('TXT_MSG_ACKMT_PERF'),
          direction: 'horizontal',
          items: ['indvRental', 'indvSpay', 'indvEnvrElhmExcp'],
        },
        'indvElhmNtor', 'indvElhmAckmt', 'indvBsAckmt',
        {
          header: t('MSG_TXT_ELHM') + t('MSG_TXT_CHNG'),
          direction: 'horizontal',
          items: ['indvElhmChdvcCnt', 'indvElhmChdvcAmt'],
        },
        {
          header: `${t('MSG_TXT_ENVR_ELHM')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
          direction: 'horizontal',
          items: ['indvEnvrElhmRental', 'indvEnvrElhmSpay', 'indvEnvrElhmFxam'],
        },
        {
          header: `${t('MSG_TXT_ENVR_ELHM') + t('MSG_TXT_EXCP')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
          direction: 'horizontal',
          items: ['indvEnvrElhmExcpSpay', 'indvEnvrElhmExcpFxam'],
        },
        'indvLivePakgCnt', 'indvNwSellCnt', 'indvHcrSellCnt', 'ogElhmAckmt', 'ogNwSellCnt',
        {
          header: `${t('MSG_TXT_OG')}(${t('MSG_TXT_BASE') + t('MSG_TXT_AMT')})`,
          direction: 'horizontal',
          items: ['ogEnvrElhmRental', 'ogEnvrElhmSpay', 'ogEnvrElhmExcpSpay'],
        },
        'feeHcr', 'feeLivePakg', 'feeElhmPrpn', 'feeElhmExcpPrpn', 'elhmMetg', 'spayMetg', 'elhmExcpMetg', 'feeSellEncrg',
        'feeEdu', 'feeSettle', 'feeMchnCh', 'feeBsMngt', 'feeRglvl', 'feeSellEncrgRett', 'feeElhmOgPrpn', 'feeElhmOgExcpPrpn',
        'feeOgSellEncrg', 'feeNwSell', 'feeOgMngt', 'feeSpmtEncrg', 'feeOgEjt1', 'feeOgEjt2', 'feeNbBrch', 'feeMsh',
        'feeAdsb', 'feeEtcSppt', 'feeWmTelc', 'feeWmEtc', 'feePrrVst', 'feeUniform', 'feeMatGrmg', 'indvBsFshCt',
        'intbsAmt', 'ddctam', 'dsbOjAmt',

      ]);
    }
  }
}

// 그리드 헤더
async function fetchDataHeader() {
  searchParams.value.baseYm = searchParams.value.perfYm;

  if (searchParams.value.rsbDvCd === 'W0205') searchParams.value.feeCalcUnitTpCd = '201'; // 플래너
  else if (searchParams.value.rsbDvCd === 'W0204') searchParams.value.feeCalcUnitTpCd = '202'; // 지점장
  else searchParams.value.feeCalcUnitTpCd = '201,202'; // 전체

  // 수수료 항목 배열 초기화
  feeHeaderIndvList = []; // 개인수수료 리스트
  feeHeaderOgList = []; // 조직수수료 리스트
  feeHeaderEtcList = []; // 기타수수료 리스트
  feeHeaderIndvColumnList = []; // 개인수수료 컬럼레이아웃
  feeHeaderOgColumnList = []; // 조직수수료 컬럼레이아웃
  feeHeaderEtcColumnList = []; // 기타수수료 컬럼레이아웃

  // 202304 이후, 직책유형이 전체가 아닌 경우에만 수수료항목 동적 구성
  if (searchParams.value.perfYm >= '202304' && !isEmpty(searchParams.value.rsbDvCd)) {
    const res = await dataService.get('/sms/common/fee/fee-articles', { params: searchParams.value });
    res.data.forEach((e) => {
      if (searchParams.value.rsbDvCd === 'W0204') { // 직책유형 지점장
        if (e.feeAtcTpCd === '03') { // 조직수수료
          feeHeaderOgList.push(e);
        } else if (e.feeAtcTpCd === '07') { // 기타수수료
          feeHeaderEtcList.push(e);
        } else if (e.feeAtcTpCd === '02') { // 개인수수료
          feeHeaderIndvList.push(e);
        } else if (e.feeAtcTpCd === '01') { // BS수수료는 개인t수수료로
          feeHeaderIndvList.push(e);
        }
      } else if (searchParams.value.rsbDvCd === 'W0205') { // 직책유형 플래너
        if (e.feeAtcTpCd === '07') { // 기타수수료
          feeHeaderEtcList.push(e);
        } else if (e.feeAtcTpCd === '02') { // 개인수수료
          feeHeaderIndvList.push(e);
        } else if (e.feeAtcTpCd === '01') { // BS수수료는 개인t수수료로
          feeHeaderIndvList.push(e);
        }
      }
    });
  }

  const data = grdMainRef.value.getData();
  const view = grdMainRef.value.getView();

  // 그리드 세팅
  const columns = getGridColumns();
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  // 그리드 컬럼 레이아웃 세팅
  setGridColumnLayout(view);
}

/*
 *  Event - 직책유형 선택 시 하단 그리드 변경※
 */
async function onChangedRsbTp() {
  // 그리드 헤더 세팅
  fetchDataHeader();

  const { rsbDvCd } = searchParams.value;
  if (rsbDvCd === 'W0205') { // 플래너
    searchParams.value.feeSchdTpCd = '201';
    searchParams.value.unitCd = 'W101';
  } else if (rsbDvCd === 'W0204') { // 지점장
    searchParams.value.feeSchdTpCd = '202';
    searchParams.value.unitCd = 'W102';
  } else { // 전체
    searchParams.value.feeSchdTpCd = '';
  }
  await initData();
}

/*
 *  Event - 조회 버튼 클릭
 */

async function fetchData() {
  let uri = '';
  const { prtnrNo, perfYm, rsbDvCd } = searchParams.value;
  stepNaviRef.value.initProps();

  if (perfYm < '202304') {
    uri = '-total-bf';
  } else if (perfYm >= '202304' && isEmpty(rsbDvCd)) {
    uri = '-total';
  }

  const response = await dataService.get(`/sms/wells/fee/organization-fees/mngers${uri}`, { params: cachedParams, timeout: 300000 });
  const mngerFees = response.data;
  totalCount.value = mngerFees.length;
  if (totalCount.value > 0) {
    isExcelDown.value = true;
  } else {
    isExcelDown.value = false;
  }
  if (prtnrNo !== '' && totalCount.value === 0) {
    notify(t('MSG_TXT_RPB_EMPNO_CONF'));
  }

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(mngerFees);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

/*
 *  Event - 이력 관리 버튼 클릭 ※
 */
async function openZwfebFeeHistoryMgtP() {
  const param = {
    feeHistSrnCd: 'W02',
  };
  await modal({
    component: 'ZwfebFeeHistoryMgtP',
    componentProps: param,
  });
}

/*
 *  Event - 재실행 클릭
 */
async function onClickRetry(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  if (await confirm(t('MSG_ALT_LV_RESRT'))) {
    await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
    notify(t('MSG_ALT_SAVE_DATA'));
    onClickSearch();
  }
}

/*
 *  Event - 미팅집계 클릭 ※
 */
async function onClickW201P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbDvCd } = searchParams.value;
  const { codeName } = codes.FEE_TCNT_DV_CD.find((v) => v.codeId === searchParams.value.feeTcntDvCd);
  if (rsbDvCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W02',
      ogTpCdTxt: 'M추진',
      perfYm,
      perfYmTxt: `${perfYm.substring(0, 4)}-${perfYm.substring(4, 6)}`,
      feeTcntDvCd,
      feeTcntDvCdTxt: codeName,
      rsbDvCd,
    };
    const { result: isChanged } = await modal({
      component: 'WwfeaFeeMeetingAttendanceRegP',
      componentProps: param,
    });
    if (isChanged) {
      await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
      onClickSearch();
    }
  }
}

/*
 *  Event - 수수료생성 클릭
 */
async function onClickW202P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbDvCd } = searchParams.value;
  let feeCalcUnitTpCd;
  if (rsbDvCd === 'W0205') {
    feeCalcUnitTpCd = '201';
  } else {
    feeCalcUnitTpCd = '202';
  }
  const { result: isUploadSuccess } = await modal({
    component: 'WwfebOgFeeMlannerRegP',
    componentProps: { perfYm,
      feeCalcUnitTpCd,
      feeTcntDvCd,
    },
  });
  if (isUploadSuccess) {
    await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
    onClickSearch();
  }
}

/*
 *  Event - 기타지원 업로드 클릭 ※업무개발에서 별도개발
 */
async function onClickW205P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { rsbDvCd } = searchParams.value;
  const { result: isUploadSuccess, payload } = await modal({
    component: 'ZwfezXlsUpP',
    componentProps: {
      formatId: 'FOM_FEZ_0023',
      baseYm: searchParams.value.perfYm,
      ogTpCd: 'W02',
      type: rsbDvCd,
    },
  });
  if (isUploadSuccess) {
    notify(t('MSG_ALT_SAVED_CNT', [payload.count]));
    await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
    onClickSearch();
  }
}

/*
 *  Event - 세금공제 클릭 ※
 */
async function onClickW206P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbDvCd } = searchParams.value;
  if (rsbDvCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W02',
      ddtnYm: perfYm,
      feeTcntDvCd,
      rsbDvCd,
    };
    const { result: isChanged } = await modal({
      component: 'ZwfecFeeTaxDeductionRegP',
      componentProps: param,
    });
    if (isChanged) {
      await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
      onClickSearch();
    }
  }
}

/*
 *  Event - 원천세등록 클릭
 */
async function onClickW207P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { ogTpCd, perfYm, rsbDvCd } = searchParams.value;
  const { result: isUploadSuccess } = await modal({
    component: 'ZwfebFeeCreationWhtxRegP',
    componentProps: {
      perfYm,
      ogTpCd,
      rsbDvCd,
    },
  });

  if (isUploadSuccess) {
    await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
    onClickSearch();
  }
}

/*
 *  Event - 고용보험 산출 클릭 ※
 */
async function onClickW208P() {
  await alert('업무 처리 완료 후, \n 좌상단 [완료처리] 버튼을 눌러주세요');
}

/*
 *  Event - 고용보험 공제 클릭 ※
 */
async function onClickW209P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbDvCd } = searchParams.value;
  if (rsbDvCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W02',
      ddtnYm: perfYm,
      feeTcntDvCd,
      rsbDvCd,
    };
    const { result: isChanged } = await modal({
      component: 'ZwfecFeeEmpInsuranceRegP',
      componentProps: param,
    });
    if (isChanged) {
      await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
      onClickSearch();
    }
  }
}

/*
 *  Event - 가지급금 공제 클릭 ※
 */
async function onClickW210P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { feeTcntDvCd, perfYm, rsbDvCd } = searchParams.value;
  if (rsbDvCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W02',
      ddtnYm: perfYm,
      feeTcntDvCd,
      rsbDvCd,
    };
    const { result: isChanged } = await modal({
      component: 'ZwfecFeePnpyamDeductionRegP',
      componentProps: param,
    });
    if (isChanged) {
      await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
      onClickSearch();
    }
  }
}

/*
 *  Event - 부담공제 클릭 ※
 */
async function onClickW214P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { perfYm, rsbDvCd } = searchParams.value;
  if (rsbDvCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W02',
      perfYm: `${perfYm.substring(0, 4)}-${perfYm.substring(4, 6)}`,
      rsbDvCd,
    };
    const { result: isChanged } = await modal({
      component: 'ZwfecFeeBurdenDeductionRegP',
      componentProps: param,
    });
    if (isChanged) {
      await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
      onClickSearch();
    }
  }
}

/*
 *  Event - 보증예치금 적립 클릭 ※
 */
async function onClickW216P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { perfYm, rsbDvCd } = searchParams.value;
  if (rsbDvCd === '') {
    await alert(t('MSG_ALT_SELECT_RSB_TP'));
  } else {
    const param = {
      ogTpCd: 'W02',
      perfYm: `${perfYm.substring(0, 4)}-${perfYm.substring(4, 6)}`,
      ocYm: `${perfYm.substring(0, 4)}-${perfYm.substring(4, 6)}`,
      rsbDvCd,
    };
    const { result: isChanged } = await modal({
      component: 'ZwfecFeeRdsReservingRegP',
      componentProps: param,
    });
    if (isChanged) {
      await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
      onClickSearch();
    }
  }
}

/*
 *  Event - 이체자료 생성 클릭
 */
async function onClickW217P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { perfYm, rsbDvCd, ogTpCd } = searchParams.value;
  const { result: isUploadSuccess } = await modal({
    component: 'ZwfeeFeeCreationFntIzRegP',
    componentProps: {
      perfYm,
      ogTpCd,
      rsbDvCd,
    },
  });
  if (isUploadSuccess) {
    await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
    onClickSearch();
  }
}

/*
 *  Event - 품의작성 클릭 ※TBD
 */
async function onClickW219P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { unitCd, perfYm, ogTpCd } = searchParams.value;
  cachedParams = cloneDeep(searchParams.value);
  const response = await dataService.get('/sms/common/fee/fee-approval/dsb-cnst-status', { params: cachedParams }); /* 품의진행상태 조회 */
  const resData = response.data;
  approval.value.appKey = perfYm + ogTpCd + unitCd + dayjs().format('YYYYMMDDHHmmss'); /* 6자리+3자리+4자리+ 14자리 = 27 appKey 생성 */
  const params = approval.value;
  saveInfo.value.appKey = approval.value.appKey;
  saveInfo.value.perfYm = perfYm;
  saveInfo.value.unitCd = unitCd;

  if (resData.dsbCnstYn === 'Y') {
    await notify(t('MSG_ALT_PMT_BEEN_APRV')); /* 결재가 승인 되었습니다 > NEXT STEP */
    await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
    onClickSearch();
  } else if (resData.dsbCnstYn === 'N') {
    await notify(t('MSG_ALT_CHK_IN_PRGS')); /* 결재가 진행중입니다 */
  } else if (resData.dsbCnstYn === 'P') { /* 이전 품의 반송, 회수 등의 이유로 재결재 */
    if (await confirm(t('MSG_ALT_PROC_TO_CHK'))) { /* 결재를 진행하시겠습니까? > Kportal popup */
      await dataService.post('/sms/common/fee/fee-approval/dsb-cnst-update', saveInfo.value); /* 이전 품의결재 이력 최종여부 N 수정 */
      await openApprovalPopup(params); /* Kportal popup */
    }
  } else if (await confirm(t('MSG_ALT_PROC_TO_CHK'))) { /* 결재를 진행하시겠습니까? > Kportal popup */
    await openApprovalPopup(params); /* Kportal popup */
  }
}

/*
 *  Event - 전표생성 클릭 ※TBD
 */
async function onClickW220P() {
  const { perfYm, ogTpCd, rsbDvCd } = searchParams.value;
  router.push({
    path: '/fee/zwfee-fee-slip-publication-list',
    query: {
      baseYm: perfYm,
      ogTpCd,
      rsbDvCd,
    },
  });
}

/*
 *  Event - 선급판매 수수료확정 클릭 ※팝업 개발 미완료 상태
*/

async function onClickW221P(feeSchdId, feeSchdLvCd, feeSchdLvStatCd) {
  const { result: isUploadSuccess } = await modal({
    component: 'WwfebAdvancePaymentFeeConfirmP',
    componentProps: { feeSchdId },
  });
  if (isUploadSuccess) {
    await dataService.put(`/sms/common/fee/schedules/steps/${feeSchdId}/status/levels`, null, { params: { feeSchdLvCd, feeSchdLvStatCd } });
    onClickSearch();
  }
}

/**
 * Event - 스텝퍼 클릭
 * 버튼 로직 존재시 해당 로직 서술
 * @params code[String]: 스탭퍼에서 선택한 단계 코드
 *         done[Boolean]: 이전단계로 되돌림 플레그
 */
async function onclickStep(params) {
  if (params.done) {
    await onClickRetry(params.feeSchdId, params.code, '02');
  } else if (params.code === 'W0201') { // 미팅참석 집계
    await onClickW201P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0202') { // 수수료 생성
    await onClickW202P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0205') { // 기타지원 업로드
    await onClickW205P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0206') { // 세금공제
    await onClickW206P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0207') { // 원천세 생성
    await onClickW207P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0208' || params.code === 'W0211' || params.code === 'W0213' || params.code === 'W0215') {
    await onClickW208P();
  } else if (params.code === 'W0209') { // 고용보험 공제
    await onClickW209P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0210') { // 가지급금 공제 생성
    await onClickW210P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0214') { // 부담공제 생성
    await onClickW214P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0216') { // 보증예치금 적립
    await onClickW216P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0217') { // 이체자료 생성
    await onClickW217P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0219') { // 품의작성
    await onClickW219P(params.feeSchdId, params.code, '03');
  } else if (params.code === 'W0220') { // 전표생성
    await onClickW220P();
  } else if (params.code === 'W0221') { // 선급판매 수수료 확정
    await onClickW221P(params.feeSchdId, params.code, '03');
  }
}

/*
 *  Event - 엑셀 다운로드 버튼 클릭 ※
 */
async function onClickExcelDownload() {
  const { perfYm, rsbDvCd } = searchParams.value;
  let uri = '';

  if (perfYm < '202304') {
    uri = '-total-bf';
  } else if (perfYm >= '202304' && isEmpty(rsbDvCd)) {
    uri = '-total';
  }

  cachedParams = cloneDeep(searchParams.value);
  const view = grdMainRef.value.getView();
  const response = await dataService.get(`/sms/wells/fee/organization-fees/mngers${uri}`, { params: cachedParams });
  // const exportLayout = view.getColumnNames();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
    // exportLayout,
  });
}

/*
 *  Event - 번호 검색 아이콘 클릭 이벤트
 */
async function onClickSearchNo() {
  const { perfYm, prtnrNo } = searchParams.value;
  const { result, payload } = await modal({
    component: 'ZwogzMonthPartnerListP',
    componentProps: {
      baseYm: perfYm,
      prtnrNo,
      ogTpCd: 'W02',
      prtnrKnm: undefined,
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.prtnrNo = payload.prtnrNo;
      searchParams.value.prtnrKnm = payload.prtnrKnm;
    }
  }
}

onMounted(async () => {
  await onChangedRsbTp();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = getGridColumns();
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  // 헤더쪽 합계 행고정, summary
  view.setHeaderSummaries({
    visible: true,
    items: [
      {
        height: 42,
      },
    ],
  });

  setGridColumnLayout(view);
});

</script>

<style scoped>
</style>
