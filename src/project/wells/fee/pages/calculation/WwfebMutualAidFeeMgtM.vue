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
    <kw-search @search="onClickSearch">
      <kw-search-row>
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

        <kw-form-item
          :label="$t('MSG_TXT_CNTR_DATE')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.strtDt"
            v-model:to="searchParams.endDt"
            type="date"
            :label="$t('MSG_TXT_CNTR_DATE')"
          />
        </kw-form-item>
      </kw-search-row>
      <kw-search-row>
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
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>

        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="(totalCount === 0)"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_FEE_CRT')"
          primary
          dense
          :disable="(totalCount === 0)"
          @click="onClickCreate"
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
import { defineGrid, useGlobal, useDataService, getComponentType, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const now = dayjs();
const { t } = useI18n();
const { modal, alert } = useGlobal();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
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
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}
// 수수료 생성 버튼
async function onClickCreate() {
  const view = grdType.value === 'A' ? grdRefA.value.getView() : grdRefB.value.getView();
  const allRows = gridUtil.getAllRowValues(view, false);

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
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMainA = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'baseYm', header: t('MSG_TXT_MNTH_OCCURENCE'), width: '103.8', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'cntrStat', header: t('MSG_TXT_CLASFCTN_FEE'), width: '110.8', styleName: 'text-left' },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '110.8', styleName: 'text-left' },
    { fieldName: 'PrtnrNo', header: t('MSG_TXT_SELLER_NO'), width: '110.8', styleName: 'text-left' },
    { fieldName: 'PrtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '110.8', styleName: 'text-left' },
    { fieldName: 'cdCntn', header: t('MSG_TXT_RSB'), width: '110.8', styleName: 'text-center' },
    { fieldName: 'brmgrPrtnrNo', header: t('MSG_TXT_BRMGR_NO'), width: '110.8', styleName: 'text-left' },
    { fieldName: 'welsCntrNo', header: `Wells ${t('MSG_TXT_CNTR_NO')}`, width: '137.6', styleName: 'text-center' },
    { fieldName: 'pdNm', header: `Wells ${t('MSG_TXT_PRDT_NM')}`, width: '230.7', styleName: 'text-left' },
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_INST_DT'), width: '110.8', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'lifCntrNo', header: `${t('MSG_TXT_MUTU')} ${t('MSG_TXT_CNTR_NO')}`, width: '137.6', styleName: 'text-center' },
    { fieldName: 'lifPdNm', header: `${t('MSG_TXT_MUTU')} ${t('MSG_TXT_PRDT_NM')}`, width: '110.8', styleName: 'text-center' },
    { fieldName: 'rcpdt', header: t('MSG_TXT_RCP_D'), width: '110.8', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cntrDt', header: `${t('MSG_TXT_CNTRCT_DT')} ${t('MSG_TXT_1ST_WTHDRWL_DT')}`, width: '162.4', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'canDt', header: t('MSG_TXT_CAN_D'), width: '110.8', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'sellFee', header: t('MSG_TXT_SELLER_FEE'), width: '156.6', styleName: 'text-right' },
    { fieldName: 'totDsbOjDvCd', header: t('MSG_TXT_TOTAL_PYMNT_TRGT'), width: '112.3', styleName: 'text-right' },
    { fieldName: 'lifCntrOcTn', header: t('MSG_TXT_ORDERSELECT_TITLE'), width: '81.1', styleName: 'text-right' },
    { fieldName: 'slOcAcuAmt', header: t('MSG_TXT_CUMULATIVE_SALES'), width: '156.6', styleName: 'text-right' },
    { fieldName: 'dpAcuAmt', header: t('MSG_TXT_ACU_DP'), width: '156.6', styleName: 'text-right' },
    { fieldName: 'flpymTn', header: t('MSG_TXT_FULL_PYMNT_RD'), width: '81.1', styleName: 'text-right' },
    { fieldName: 'preAmtSum', header: t('MSG_TXT_BASE_PYMNT'), width: '126.7', styleName: 'text-right' },
    { fieldName: 'curAmt', header: t('MSG_TXT_THM_DSB'), width: '126.7', styleName: 'text-right' },
    { fieldName: 'cnfmYn', header: t('MSG_TXT_LIFE_CNFRMD'), width: '126.7', styleName: 'text-center' },
    { fieldName: 'feeDsbYm', header: t('MSG_TXT_FEE_PYMNT_MNTH'), width: '186', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'feeRedfYm', header: t('MSG_TXT_FEE_BCK_MNTH'), width: '186', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGrdMainB = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cnfmYn', visible: false },
    { fieldName: 'baseYm', header: t('MSG_TXT_MNTH_OCCURENCE'), width: '103.8', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'cntrStat', header: t('MSG_TXT_CLASFCTN_FEE'), width: '110.8', styleName: 'text-left' },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '110.8', styleName: 'text-left' },
    { fieldName: 'brmgrPrtnrNo', header: t('MSG_TXT_BRMGR_NO'), width: '110.8', styleName: 'text-left' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '110.8', styleName: 'text-left' },
    { fieldName: 'cdCntn', header: t('MSG_TXT_RSB'), width: '110.8', styleName: 'text-center' },
    { fieldName: 'brchCt', header: t('MSG_TXT_COUNT'), width: '110.8', styleName: 'text-center' },
    { fieldName: 'brchAmt', header: t('MSG_TXT_AMT'), width: '126.7', styleName: 'text-right' },
    { fieldName: 'feeDsbYm', header: t('MSG_TXT_FEE_PYMNT_MNTH'), width: '186', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'feeRedfYm', header: t('MSG_TXT_FEE_BCK_MNTH'), width: '186', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
