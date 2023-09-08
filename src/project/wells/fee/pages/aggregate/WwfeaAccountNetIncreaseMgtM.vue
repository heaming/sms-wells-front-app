<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaAccountNetIncreasMgtM - M조직 계정 순증 관리
3. 작성자 : haejin.lee
4. 작성일 : 2023.07.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- M조직 계정 순증 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_INQR_DV')"
          required
        >
          <kw-select
            v-model="searchParams.inqrDvCd"
            :options="codes.MNGER_OG_ACC_NINC_MNGT_INQR_DV_CD"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ORDR')"
        >
          <kw-option-group
            v-model="searchParams.feeTcntDvCd"
            type="radio"
            :options="codes.FEE_TCNT_DV_CD"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_FEE_YM')"
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            :label="$t('MSG_TXT_FEE_YM')"
            rules="required"
            type="month"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!-- 취소유형 -->
        <kw-search-item
          v-if="searchParams.inqrDvCd === '01'"
          :label="$t('MSG_TXT_CNCL_TP')"
        >
          <kw-select
            v-model="searchParams.cnclTpCd"
            :options="codes.MNGER_OG_CNTR_CAN_TP_CD"
            first-option
            :first-option-label="$t('MSG_TXT_ALL')"
          />
        </kw-search-item>

        <!-- 신규판매 -->
        <kw-search-item
          v-if="searchParams.inqrDvCd === '02'"
          :label="t('MSG_TXT_SEL_TYPE')"
        >
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="codes.MNGER_OG_CNTR_CAN_TP_CD.filter((v) => ['01', '02'].includes(v.codeId))"
            first-option
            :first-option-label="$t('MSG_TXT_ALL')"
          />
        </kw-search-item>

        <!-- 집계체크 -->
        <kw-search-item
          v-if="searchParams.inqrDvCd === '03'"
          :label="$t('MSG_TXT_AGRG') + $t('MSG_TXT_TYPE')"
        >
          <kw-select
            v-model="searchParams.aggregateTpCd"
            :options="codes.MNGER_OG_AGRG_TP_CD.filter((v) => ['01', '02', '03', '04'].includes(v.codeId))"
          />
        </kw-search-item>

        <!-- 조직레벨 -->
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
          :colspan="2"
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.dgr1LevlOgId"
            v-model:og-levl-dv-cd2="searchParams.dgr2LevlOgId"
            v-model:og-levl-dv-cd3="searchParams.dgr3LevlOgId"
            :og-tp-cd="searchParams.ogTpCd"
            :base-ym="searchParams.perfYm"
            :start-level="1"
            :end-level="3"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 번호 -->
        <kw-search-item :label="$t('MSG_TXT_SEQUENCE_NUMBER')">
          <kw-input
            v-model="searchParams.prtnrNo"
            icon="search"
            clearable
            :on-click-icon="onClickSearchNo"
            :placeholder="$t('MSG_TXT_SEQUENCE_NUMBER')"
            regex="num"
            :maxlength="10"
          />
        </kw-search-item>
        <!-- 번호 -->
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_CASES') }}</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          secondary
          dense
          :label="$t('MSG_TXT_ACC_NINC') + $t('MSG_TXT_AGRG')"
          @click="onclickAgrg"
        />
      </kw-action-top>
      <kw-grid
        v-if="isCancelVisible"
        ref="grdCancelRef"
        name="grdCancel"
        :visible-rows="10"
        @init="initCancelGrid"
      />
      <kw-grid
        v-if="isSellVisible"
        ref="grdSellRef"
        name="grdSell"
        :visible-rows="10"
        @init="initSellGrid"
      />
      <kw-grid
        v-if="isCheckVisible"
        ref="grdCheckRef"
        name="grdCheck"
        :visible-rows="10"
        @init="initCheckGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, gridUtil, useDataService, codeUtil, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';

const dataService = useDataService();
const date = dayjs();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { modal } = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// ------------------------------------------------------------------------------------------------
const totalCount = ref(0);
const grdCancelRef = ref(getComponentType('KwGrid'));
const grdSellRef = ref(getComponentType('KwGrid'));
const grdCheckRef = ref(getComponentType('KwGrid'));
const isCancelVisible = ref(true);
const isSellVisible = ref(false);
const isCheckVisible = ref(false);

const searchParams = ref({
  perfYm: date.add(-1, 'month').format('YYYYMM'),
  inqrDvCd: '01',
  cnclTpCd: '',
  sellTpCd: '',
  aggregateTpCd: '01',
  feeTcntDvCd: '01',
  ogTpCd: 'W02',
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  dgr3LevlOgId: '',
  prtnrNo: '',
});

const codes = await codeUtil.getMultiCodes(
  'FEE_TCNT_DV_CD',
  'MCHN_CH_TP_CD',
  'MNGER_OG_ACC_NINC_MNGT_INQR_DV_CD',
  'MNGER_OG_CNTR_CAN_TP_CD',
  'MNGER_OG_AGRG_TP_CD',
);

let cachedParams;

async function fetchData(gridId) {
  let url;

  if (searchParams.value.inqrDvCd === '01') {
    url = '/sms/wells/fee/account-net-increase/cancels';
  } else if (searchParams.value.inqrDvCd === '02') {
    url = '/sms/wells/fee/account-net-increase/sells';
  } else if (searchParams.value.inqrDvCd === '03') {
    url = '/sms/wells/fee/account-net-increase/checks';
  }
  const res = await dataService.get(url, { params: { ...cachedParams }, timeout: 200000 });

  totalCount.value = res.data.length;

  const view = gridId.value.getView();
  view.getDataSource().setRows(res.data);
}

async function onClickSearch() {
  let gridId = grdCancelRef;

  if (searchParams.value.inqrDvCd === '01') {
    gridId = grdCancelRef;
    isCancelVisible.value = true;
    isSellVisible.value = false;
    isCheckVisible.value = false;
  } else if (searchParams.value.inqrDvCd === '02') {
    gridId = grdSellRef;
    isCancelVisible.value = false;
    isSellVisible.value = true;
    isCheckVisible.value = false;
  } else if (searchParams.value.inqrDvCd === '03') {
    gridId = grdCheckRef;
    isCancelVisible.value = false;
    isSellVisible.value = false;
    isCheckVisible.value = true;
  }

  cachedParams = cloneDeep(searchParams.value);

  await fetchData(gridId);
}

async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzMonthPartnerListP',
    componentProps: {
      baseYm: searchParams.value.perfYm,
      prtnrNo: searchParams.value.prtnrNo,
      ogTpCd: 'W02',
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.nprtnrNoo = payload.prtnrNo;
    }
  }
}

async function onClickExcelDownload(gridId) {
  let url;

  if (searchParams.value.inqrDvCd === '01') {
    url = '/sms/wells/fee/account-net-increase/cancels';
  } else if (searchParams.value.inqrDvCd === '02') {
    url = '/sms/wells/fee/account-net-increase/sells';
  } else if (searchParams.value.inqrDvCd === '03') {
    url = '/sms/wells/fee/account-net-increase/checks';
  }
  const view = gridId.value.getView();
  const response = await dataService.get(url, { params: { ...cachedParams } });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

async function onclickAgrg() {
  const { result: isChanged } = await modal({
    component: 'WwfeaAccountNetIncreaseRegP',
    componentProps: {
      perfYm: searchParams.value.perfYm,
      feeTcntDvCd: searchParams.value.feeTcntDvCd,
    },
  });
  if (isChanged) {
    onClickSearch();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initCancelGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'inqrDvCd', header: t('MSG_TXT_TYPE'), width: '100', styleName: 'text-center', options: codes.MNGER_OG_CNTR_CAN_TP_CD }, // 유형
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PRDT_NM'), width: '230', styleName: 'text-center' }, // 상품명
    { fieldName: 'pdClsfId', header: t('MSG_TXT_PRDT_CODE'), width: '150', styleName: 'text-center' }, // 상품코드
    { fieldName: 'ichrMngerNm', header: t('MSG_TXT_ICHR_MNGER'), width: '105', styleName: 'text-center' }, // 담당매니저
    { fieldName: 'ichrMngerNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' }, // 번호
    { fieldName: 'ichrBrmgrNm', header: t('MSG_TXT_ICHR') + t('MSG_TXT_BRMGR'), width: '100', styleName: 'text-center' }, // 담당지점장
    { fieldName: 'ichrBrmgrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' }, // 번호
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_CNTRCT_DT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' }, // 계약일
    { fieldName: 'istDt', header: t('MSG_TXT_INST_DT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' }, // 설치일
    { fieldName: 'cntrChRcpDtm', header: t('MSG_TXT_CANC_RQDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' }, // 취소요청일
    { fieldName: 'cntrCanDtm', header: t('MSG_TXT_CAN_D'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' }, // 취소일
    { fieldName: 'cntrPdEnddt', header: t('MSG_TXT_EXP_DT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' }, // 만료일
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_USE_DT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' }, // 사용일
    { fieldName: 'cntrRcpFshDtm', header: t('MSG_TXT_MEMBERSHIP') + t('MSG_TXT_RCP_D'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' }, // 멤버십접수일
    { fieldName: 'cntrCnfmAprDtm', header: t('MSG_TXT_MEMBERSHIP') + t('MSG_TXT_SUBS_DT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' }, // 멤버십가입일
    { fieldName: 'cntrCanRsonCd', header: t('MSG_TXT_CAN_RSON'), width: '100', styleName: 'text-left' }, // 취소사유
    { fieldName: 'bzrno', header: t('MSG_TXT_ENTRP_NO'), width: '150', styleName: 'text-center' }, // 사업자번호
    { fieldName: 'b2bYn', header: `B2B${t('MSG_TXT_OJ_YN')}`, width: '100', styleName: 'text-center' }, // B2B대상여부
    { fieldName: 'sellOgYn', header: t('MSG_TXT_SELL_OG'), width: '100', styleName: 'text-center' }, // 판매조직
    { fieldName: 'sellPrtnrKnm', header: t('MSG_TXT_SELLER_PERSON'), width: '100', styleName: 'text-center' }, // 판매자
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_SELLER_PERSON') + t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' }, // 판매자번호
    { fieldName: 'perfExcdOjYn', header: t('MSG_TXT_EXCD') + t('MSG_TXT_OBJ'), width: '100', styleName: 'text-center' }, // 제외대상
    { fieldName: 'apyOjYn', header: t('MSG_TXT_APPLY') + t('MSG_TXT_OBJ'), width: '100', styleName: 'text-center' }, // 적용대상
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'inqrDvCd', 'cntrDtlNo', 'pdClsfNm', 'pdClsfId', // single
    {
      header: t('MSG_TXT_ACC') + t('MSG_TXT_ICHR'), // 계정담당
      direction: 'horizontal',
      items: ['ichrMngerNm', 'ichrMngerNo', 'ichrBrmgrNm', 'ichrBrmgrNo'],
    },
    {
      header: t('MSG_TXT_ACC_CAN_ARTC'), // 계약 및 취소사항
      direction: 'horizontal',
      items: ['cntrCnfmDtm', 'istDt', 'cntrChRcpDtm', 'cntrCanDtm', 'cntrPdEnddt', 'cntrPdStrtdt', 'cntrRcpFshDtm', 'cntrCnfmAprDtm', 'cntrCanRsonCd', 'bzrno', 'b2bYn'],
    },
    {
      header: t('MSG_TXT_SAL_HIST'), // 판매내역
      direction: 'horizontal',
      items: ['sellOgYn', 'sellPrtnrKnm', 'sellPrtnrNo'],
    },
    'perfExcdOjYn', 'apyOjYn',
  ]);
});

const initSellGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'inqrDvCd', header: t('MSG_TXT_TYPE'), width: '100', styleName: 'text-center', options: codes.MNGER_OG_CNTR_CAN_TP_CD }, // 유형
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PRDT_NM'), width: '230', styleName: 'text-center' }, // 상품명
    { fieldName: 'pdClsfId', header: t('MSG_TXT_PRDT_CODE'), width: '150', styleName: 'text-center' }, // 상품코드

    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_CNTRCT_DT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' }, // 계약일
    { fieldName: 'istDt', header: t('MSG_TXT_INST_DT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' }, // 설치일
    { fieldName: 'cntrCanDtm', header: t('MSG_TXT_CAN_D'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' }, // 취소일
    { fieldName: 'mchnChTpCd', header: t('MSG_TXT_CHDVC_TP'), width: '120', styleName: 'text-center', options: codes.MCHN_CH_TP_CD }, // 기변유형

    { fieldName: 'sellOgYn', header: t('MSG_TXT_SELL_OG'), width: '100', styleName: 'text-center' }, // 판매조직
    { fieldName: 'sellPrtnrKnm', header: t('MSG_TXT_SELLER_PERSON'), width: '100', styleName: 'text-center' }, // 판매자
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_SELLER_PERSON') + t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' }, // 판매자번호
    { fieldName: 'booSellYn', header: t('MSG_TXT_RSV_YN'), width: '100', styleName: 'text-center' }, // 예약여부
    { fieldName: 'perfExcdOjYn', header: t('MSG_TXT_EXCD') + t('MSG_TXT_OBJ'), width: '100', styleName: 'text-center' }, // 제외대상
    { fieldName: 'apyOjYn', header: t('MSG_TXT_APPLY') + t('MSG_TXT_OBJ'), width: '100', styleName: 'text-center' }, // 적용대상
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'inqrDvCd', 'cntrDtlNo', 'pdClsfNm', 'pdClsfId', // single
    {
      header: t('MSG_TXT_CNTR_ARTC'), // 계약사항
      direction: 'horizontal',
      items: ['cntrCnfmDtm', 'istDt', 'cntrCanDtm', 'mchnChTpCd'],
    },
    {
      header: t('MSG_TXT_SAL_HIST'), // 판매내역
      direction: 'horizontal',
      items: ['sellOgYn', 'sellPrtnrKnm', 'sellPrtnrNo'],
    },
    'booSellYn', 'perfExcdOjYn', 'apyOjYn',
  ]);
});

const initCheckGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'inqrDvCd', header: t('MSG_TXT_OG'), width: '100', styleName: 'text-center' }, // 조직
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '105', styleName: 'text-center' }, // 성명
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '105', styleName: 'text-center' }, // 번호
    { fieldName: 'rentalCanCt', header: t('MSG_TXT_RENTAL'), width: '100', styleName: 'text-center', dataType: 'number' }, // 렌탈
    { fieldName: 'leaseCanCt', header: t('MSG_TXT_LEASE_ISTM'), width: '100', styleName: 'text-center', dataType: 'number' }, // 리스/할부
    { fieldName: 'mshSprCt', header: t('MSG_TXT_MMBR') + t('MSG_TXT_SEPARATION'), width: '100', styleName: 'text-center', dataType: 'number' }, // 멤버십이탈
    { fieldName: 'rentalExnCt', header: t('MSG_TXT_RENTAL') + t('MSG_TXT_EXN'), width: '100', styleName: 'text-center', dataType: 'number' }, // 렌탈만료
    { fieldName: 'canTotCt', header: t('MSG_TXT_AGG'), width: '100', styleName: 'text-center', dataType: 'number' }, // 계
    { fieldName: 'rentalNwCt', header: t('MSG_TXT_RENTAL'), width: '100', styleName: 'text-center', dataType: 'number' }, // 렌탈
    { fieldName: 'leaseNwCt', header: t('MSG_TXT_LEASE_ISTM'), width: '100', styleName: 'text-center', dataType: 'number' }, // 리스/할부
    { fieldName: 'nwTotCt', header: t('MSG_TXT_AGG'), width: '100', styleName: 'text-center', dataType: 'number' }, // 계
    { fieldName: 'accNincYn', header: t('MSG_TXT_ACC') + t('MSG_TXT_NINC'), width: '100', styleName: 'text-center' }, // 계정순증
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'inqrDvCd', 'prtnrKnm', 'prtnrNo',
    {
      header: t('MSG_TXT_LSTMM') + t('MSG_TXT_CANCEL'), // 전월취소
      direction: 'horizontal',
      items: ['rentalCanCt', 'leaseCanCt', 'mshSprCt', 'rentalExnCt', 'canTotCt'],
    },
    {
      header: t('MSG_TXT_NW_SELL'), // 신규판매
      direction: 'horizontal',
      items: ['rentalNwCt', 'leaseNwCt', 'nwTotCt'],
    },
    'accNincYn',
  ]);
});

</script>

<style scoped>
</style>
