<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaFeeBaseAmountListM - 수수료 기준금액 체크리스트
3. 작성자 : min-kyu bae
4. 작성일 : 2023.02.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수수료 기준금액 체크리스트 목록 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
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
            rules="required"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OG_TP')"
          :colspan="2"
        >
          <kw-option-group
            v-model="searchParams.ogTpCd"
            type="radio"
            :label="$t('MSG_TXT_OG_TP')"
            :options="filterOgTpCd"
            @change="ogTpChange"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_PER_WON_CASE') }}</span>
        </template>
        <kw-btn
          v-permission:download
          dense
          secondary
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!isExcelDown"
          @click="onClickExcelDownload"
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

import { useDataService, getComponentType, gridUtil, defineGrid, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const isExcelDown = ref(false);
const codes = await codeUtil.getMultiCodes(
  'OG_TP_CD',
  'COPN_DV_CD',
  'SELL_DSC_TP_CD',
  'ALNCMP_CD',
  'MCHN_CH_TP_CD',
);
const filterOgTpCd = codes.OG_TP_CD.filter((v) => ['W02', 'W01', 'W03'].includes(v.codeId));
const searchParams = ref({

  perfYm: now.add(-1, 'month').startOf('M').format('YYYYMM'),
  ogTpCd: 'W02',

});
let cachedParams;

async function onClickExcelDownload() {
  cachedParams = cloneDeep(searchParams.value);
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/fee/fee-base-amounts', { params: cachedParams, timeout: 300000 });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

async function fetchData() {
  const response = await dataService.get('/sms/wells/fee/fee-base-amounts', { params: cachedParams, timeout: 300000 });
  const feeAmounts = response.data;
  totalCount.value = feeAmounts.length;
  if (totalCount.value > 0) {
    isExcelDown.value = true;
  }

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(feeAmounts);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function ogTpChange() {
  const view = grdMainRef.value.getView();
  if (searchParams.value.ogTpCd === 'W03') {
    view.columnByName('og1Nm').visible = false;
  } else {
    view.columnByName('og1Nm').visible = true;
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'cntrRcpFshDtm' },
    { fieldName: 'sellOgTpCd' },
    { fieldName: 'copnDvCd' },
    { fieldName: 'og1Nm' },
    { fieldName: 'og2Nm' },
    { fieldName: 'og3Nm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'ackmtPerfRt', dataType: 'number' },
    { fieldName: 'ackmtPerfAmt', dataType: 'number' },
    { fieldName: 'feeAckmtBaseAmt', dataType: 'number' },
    { fieldName: 'prcFeeAckmtBaseAmt', dataType: 'number' },
    { fieldName: 'pmotFeeAckmtBaseAmt', dataType: 'number' },
    { fieldName: 'fnlAmt', dataType: 'number' },
    { fieldName: 'saleTp' },
    { fieldName: 'imonIuse' },
    { fieldName: 'sellDscTpCd' },
    { fieldName: 'mchnChYn' },
    { fieldName: 'mchnChCopnDvCd' },
    { fieldName: 'mchnChTpCd' },
    { fieldName: 'mchnCpsApyr' },
    { fieldName: 'ojCntrNo1' },
    { fieldName: 'ojCntrNo2' },
    { fieldName: 'alncmpCd' },
    { fieldName: 'pmotCd' },
    { fieldName: 'fstRgstPrgId' },
    { fieldName: 'fstRgstUsrId' },
    { fieldName: 'fnlMdfcPrgId' },
    { fieldName: 'fnlMdfcUsrId' },

  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '130', styleName: 'text-center' },
    { fieldName: 'cntrRcpFshDtm', header: t('MSG_TXT_RCPDT'), width: '104', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'sellOgTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'copnDvCd', header: t('MSG_TXT_INDV_DV'), width: '89', styleName: 'text-center ', options: codes.COPN_DV_CD },
    { fieldName: 'og1Nm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '104', styleName: 'text-center' },
    { fieldName: 'og2Nm', header: t('MSG_TXT_RGNL_GRP'), width: '104', styleName: 'text-center' },
    { fieldName: 'og3Nm', header: t('MSG_TXT_BRANCH'), width: '91', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '159', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '104', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_SALE_PROD'), width: '131', styleName: 'text-right' },
    { fieldName: 'pdNm', header: t('MSG_TXT_SELL_PD_NM'), width: '160', styleName: 'text-right' },
    { fieldName: 'ackmtPerfRt', header: t('MSG_TXT_ACKMT_PFR'), width: '160', styleName: 'text-right' },
    { fieldName: 'ackmtPerfAmt', header: t('MSG_TXT_ACKMT_PERF_AMT'), width: '160', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'feeAckmtBaseAmt', header: t('MSG_TXT_BASE_FEE_ORD_MST'), width: '160', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'prcFeeAckmtBaseAmt', header: t('MSG_TXT_BASE_FEE_PRC_BASE'), width: '160', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'pmotFeeAckmtBaseAmt', header: t('MSG_TXT_BASE_FEE_PMOT'), width: '160', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'fnlAmt', header: t('MSG_TXT_RTLFE_DSC_RFLT'), width: '160', styleName: 'text-right', numberFormat: '#,###,##0' },
    { fieldName: 'saleTp', header: t('MSG_TXT_DISC_CODE'), width: '88', styleName: 'text-center' },
    { fieldName: 'imonIuse', header: t('MSG_TXT_PRD_USWY'), width: '119', styleName: 'text-center' },
    { fieldName: 'sellDscTpCd', header: `${t('MSG_TXT_RE_RENTAL')}/1+1`, width: '83', styleName: 'text-center', options: codes.SELL_DSC_TP_CD },
    { fieldName: 'mchnChYn', header: t('MSG_TXT_CHDVC_YN'), width: '103', styleName: 'text-center' },
    { fieldName: 'mchnChCopnDvCd', header: t('MSG_TXT_CHNG') + t('MSG_TXT_INDV_DV'), width: '130', styleName: 'text-center', options: codes.COPN_DV_CD },
    { fieldName: 'mchnChTpCd', header: t('MSG_TXT_CHDVC_TP'), width: '130', styleName: 'text-center', options: codes.MCHN_CH_TP_CD },
    { fieldName: 'mchnCpsApyr', header: t('MSG_TXT_CHNG') + t('MSG_TXT_PFR'), width: '130', styleName: 'text-center' },
    { fieldName: 'ojCntrNo1', header: t('MSG_TXT_CHNG') + 1 + t('MSG_TXT_Y'), width: '130', styleName: 'text-center' },
    { fieldName: 'ojCntrNo2', header: t('MSG_TXT_CHNG') + 2 + t('MSG_TXT_Y'), width: '130', styleName: 'text-center' },
    { fieldName: 'alncmpCd', header: t('MSG_TXT_ALNC_CD'), width: '130', styleName: 'text-center', options: codes.ALNCMP_CD },
    { fieldName: 'pmotCd', header: t('MSG_TXT_PMOT_NO'), width: '130', styleName: 'text-center' },
    { fieldName: 'fstRgstPrgId', header: `${t('MSG_TXT_RGS')}PGM`, width: '130', styleName: 'text-center' },
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_RGS') + t('MSG_TXT_SEQUENCE_NUMBER'), width: '130', styleName: 'text-center' },
    { fieldName: 'fnlMdfcPrgId', header: `${t('MSG_TXT_MOD')}PGM`, width: '130', styleName: 'text-center' },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_MOD') + t('MSG_TXT_SEQUENCE_NUMBER'), width: '130', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
