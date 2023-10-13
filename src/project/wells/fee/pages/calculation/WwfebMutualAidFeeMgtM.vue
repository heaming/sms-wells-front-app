<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebMutualAidFeeMgtM - 상조 수수료 관리
3. 작성자 : gs.nidhi.d
4. 작성일 : 2023.03.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상조 수수료 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      v-permission:read
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 실적년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            :label="$t('MSG_TXT_PERF_YM')"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <!-- 구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_DIV')"
        >
          <kw-option-group
            v-model="searchParams.type"
            type="radio"
            :options="[{codeId: 'A', codeName: t('MSG_TXT_INDV')},
                       {codeId: 'B', codeName: t('MSG_TXT_OG')}]"
          />
        </kw-search-item>
        <!-- 계약일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_DATE')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.strtDt"
            v-model:to="searchParams.endDt"
            type="date"
            :label="$t('MSG_TXT_CNTR_DATE')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 상품명 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_NM')"
        >
          <kw-option-group
            v-model="searchParams.pdCd"
            type="radio"
            :options="[{codeId: '', codeName: $t('MSG_TXT_ALL')},
                       {codeId: '429', codeName: '429'},
                       {codeId: '599', codeName: '599'}]"
          />
        </kw-search-item>
        <!-- 번호 -->
        <kw-search-item
          v-if="searchParams.type === 'A'"
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <zwog-partner-search
            v-model:prtnr-no="searchParams.sellPrtnrNo"
          />
        </kw-search-item>
        <!-- 수수료구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_CLASFCTN_FEE')"
        >
          <kw-option-group
            v-model="searchParams.clasfctnFee"
            type="radio"
            :options="[{codeId: '0', codeName: $t('MSG_TXT_FEE')},
                       {codeId: '1', codeName: $t('MSG_TXT_REDF')},
                       {codeId: '2', codeName: $t('MSG_TXT_DLQ')},
                       {codeId: '3', codeName: $t('MSG_TXT_ADSB')}]"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>

        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="(totalCount === 0)"
          @click="onClickExcelDownload"
        />
        <kw-separator
          v-permission:create
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:create
          :label="$t('MSG_BTN_FEE_CRT')"
          primary
          dense
          @click="onClickCreate"
        />
        <kw-btn
          v-if="false"
          v-permission:create
          :label="$t('MSG_BTN_REDF_FEE_CRT')"
          primary
          dense
          @click="onClickReCreate"
        />
      </kw-action-top>
      <kw-grid
        v-if="grdType === 'A'"
        ref="grdRefA"
        @init="initGrdMainA"
      />
      <kw-grid
        v-if="grdType === 'B'"
        ref="grdRefB"
        @init="initGrdMainB"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, useGlobal, useDataService, getComponentType, gridUtil, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import ZwogPartnerSearch from '~sms-common/organization/components/ZwogPartnerSearch.vue';

const dataService = useDataService();
const now = dayjs();
const { t } = useI18n();
const { modal, alert } = useGlobal();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
);
const grdType = ref('A');
const grdRefA = ref(getComponentType('KwGrid'));
const grdDataA = computed(() => grdRefA.value?.getData());
const grdRefB = ref(getComponentType('KwGrid'));
const grdDataB = computed(() => grdRefB.value?.getData());
const totalCount = ref(0);
let cachedParams;
const searchParams = ref({
  type: 'A',
  baseYm: now.format('YYYYMM'),
  strtDt: '',
  endDt: '',
  pdCd: '',
  sellPrtnrNo: '',
  clasfctnFee: '0', // (0:수수료, 1:되물림, 2:연체, 3:재지급)
});
// 데이터 조회
async function fetchData() {
  const fixApi = cachedParams.type === 'A' ? 'individual' : 'group';
  const { data } = await dataService.get(`/sms/wells/fee/mutual-aid/${fixApi}`, { params: { ...cachedParams } });
  if (cachedParams.type === 'A') {
    grdDataA.value.setRows(data);
  } else {
    grdDataB.value.setRows(data);
  }
  totalCount.value = data.length;
}
// 조회 버튼
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  grdType.value = searchParams.value.type;
  await fetchData();
}
// 엑셀 다운로드 버튼
async function onClickExcelDownload() {
  const view = grdType.value === 'A' ? grdRefA.value.getView() : grdRefB.value.getView();
  const fixApi = cachedParams.type === 'A' ? 'individual' : 'group';
  const { data } = await dataService.get(`/sms/wells/fee/mutual-aid/${fixApi}`, { params: { ...cachedParams } });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: data,
  });
}
// 수수료 생성 버튼
async function onClickCreate() {
  const view = grdType.value === 'A' ? grdRefA.value.getView() : grdRefB.value.getView();
  const allRows = gridUtil.getAllRowValues(view, false);
  // if (allRows.length === 0) {
  //   notify(t('MSG_ALT_USE_DT_SRCH_AF'));
  //   return;
  // }
  if (allRows.some((row) => row.cnfmYn === 'Y')) {
    // 이미 확정되어 수수료 생성이 불가합니다.
    await alert(t('MSG_ALT_BF_CNFM_CONF_FEE'));
    return;
  }

  const { result: isChanged } = await modal({
    component: 'WwfebMutualAidFeeRegP',
    componentProps: {
      baseYm: searchParams.value.baseYm,
    },
  });
  if (isChanged) {
    fetchData();
  }
}

// 되물림 수수료 생성 버튼
async function onClickReCreate() {
  const view = grdType.value === 'A' ? grdRefA.value.getView() : grdRefB.value.getView();
  const allRows = gridUtil.getAllRowValues(view, false);
  // if (allRows.length === 0) {
  //   notify(t('MSG_ALT_USE_DT_SRCH_AF'));
  //   return;
  // }
  if (allRows.some((row) => row.cnfmYn === 'Y')) {
    // 이미 확정되어 수수료 생성이 불가합니다.
    await alert(t('MSG_ALT_BF_CNFM_CONF_FEE'));
    return;
  }
  const { result: isChanged } = await modal({
    component: 'WwfebMutualAidFeeRedpRegP',
    componentProps: {
      baseYm: searchParams.value.baseYm,
    },
  });
  if (isChanged) {
    fetchData();
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMainA = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'baseYm', header: t('MSG_TXT_MNTH_OCCURENCE'), width: '103.8', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 발생월
    { fieldName: 'cntrStat', header: t('MSG_TXT_CLASFCTN_FEE'), width: '110.8', styleName: 'text-center' }, // 수수료 구분
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '110.8', styleName: 'text-center' }, // 소속
    { fieldName: 'PrtnrNo', header: t('MSG_TXT_SELLER_NO'), width: '110.8', styleName: 'text-center' }, // 판매자번호
    { fieldName: 'PrtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '110.8', styleName: 'text-center' }, // 성명
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '110.8', styleName: 'text-center', options: codes.RSB_DV_CD }, // 직책
    { fieldName: 'brmgrPrtnrNo', header: t('MSG_TXT_BRMGR_NO'), width: '110.8', styleName: 'text-center' }, // 지점장번호
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '137.6', styleName: 'text-center' }, // 계약번호
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '230.7', styleName: 'text-left' }, // 상품명
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_INST_DT'), width: '110.8', styleName: 'text-center', datetimeFormat: 'date' }, // 설치일
    { fieldName: 'lifCntrNo', header: `${t('MSG_TXT_MUTU')} ${t('MSG_TXT_CNTR_NO')}`, width: '137.6', styleName: 'text-center' }, // 상조계약번호
    { fieldName: 'lifPdNm', header: `${t('MSG_TXT_MUTU')} ${t('MSG_TXT_PRDT_NM')}`, width: '110.8', styleName: 'text-center' }, // 상조상품명
    { fieldName: 'rcpdt', header: t('MSG_TXT_RCP_D'), width: '110.8', styleName: 'text-center', datetimeFormat: 'date' }, // 접수일
    { fieldName: 'cntrDt', header: `${t('MSG_TXT_CNTRCT_DT')} ${t('MSG_TXT_1ST_WTHDRWL_DT')}`, width: '162.4', styleName: 'text-center', datetimeFormat: 'date' }, // 계약일1회출금일
    { fieldName: 'canDt', header: t('MSG_TXT_CAN_D'), width: '110.8', styleName: 'text-center', datetimeFormat: 'date' }, // 취소일
    { fieldName: 'sellFee', header: t('MSG_TXT_SELLER_FEE'), width: '156.6', styleName: 'text-right', dataType: 'number' }, // 판매자수수료
    { fieldName: 'totDsbOjDvCd', header: t('MSG_TXT_TOTAL_PYMNT_TRGT'), width: '112.3', styleName: 'text-right', dataType: 'number' }, // 총지급대상
    { fieldName: 'lifCntrOcTn', header: t('MSG_TXT_ORDERSELECT_TITLE'), width: '81.1', styleName: 'text-right', dataType: 'number' }, // 회차
    { fieldName: 'slOcAcuAmt', header: t('MSG_TXT_CUMULATIVE_SALES'), width: '156.6', styleName: 'text-right', dataType: 'number' }, // 누적발생매출
    { fieldName: 'dpAcuAmt', header: t('MSG_TXT_ACU_DP'), width: '156.6', styleName: 'text-right', dataType: 'number' }, // 누적임금
    { fieldName: 'flpymTn', header: t('MSG_TXT_FULL_PYMNT_RD'), width: '81.1', styleName: 'text-right', dataType: 'number' }, // 완납회차
    { fieldName: 'preAmtSum', header: t('MSG_TXT_BASE_PYMNT'), width: '126.7', styleName: 'text-right', dataType: 'number' }, // 기지급
    { fieldName: 'curAmt', header: t('MSG_TXT_THM_DSB'), width: '126.7', styleName: 'text-right', dataType: 'number' }, // 당월지급
    { fieldName: 'etCnfmDvNm', header: t('MSG_TXT_LIFE_CNFRMD'), width: '126.7', styleName: 'text-center' }, // 라이프확정
    { fieldName: 'feeDsbYm', header: t('MSG_TXT_FEE_PYMNT_MNTH'), width: '186', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 수수료지급월
    { fieldName: 'feeRedfYm', header: t('MSG_TXT_FEE_BCK_MNTH'), width: '186', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 수수료되물림월
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGrdMainB = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cnfmYn', header: t('MSG_TXT_DTRM_YN'), visible: false }, // 확정여부
    { fieldName: 'baseYm', header: t('MSG_TXT_MNTH_OCCURENCE'), width: '103.8', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 발생월
    { fieldName: 'cntrStat', header: t('MSG_TXT_CLASFCTN_FEE'), width: '110.8', styleName: 'text-center' }, // 수수료구분
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '110.8', styleName: 'text-center' }, // 소속
    { fieldName: 'brmgrPrtnrNo', header: t('MSG_TXT_BRMGR_NO'), width: '110.8', styleName: 'text-center' }, // 지점장번호
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '110.8', styleName: 'text-center' }, // 성명
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '110.8', styleName: 'text-center', options: codes.RSB_DV_CD }, // 직책
    { fieldName: 'brchCt', header: t('MSG_TXT_COUNT'), width: '110.8', styleName: 'text-right', dataType: 'number' }, // 건수
    { fieldName: 'brchAmt', header: t('MSG_TXT_AMT'), width: '126.7', styleName: 'text-right', dataType: 'number' }, // 금액
    { fieldName: 'feeDsbYm', header: t('MSG_TXT_FEE_PYMNT_MNTH'), width: '186', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 수수료지급월
    { fieldName: 'feeRedfYm', header: t('MSG_TXT_FEE_BCK_MNTH'), width: '186', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 수수료되물림월
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
