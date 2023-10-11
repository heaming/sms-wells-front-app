<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCC
2. 프로그램 ID : WwdccMembershipConfirmCreateM ( W-CL-U-0047M01 ) - 멤버십 확정 생성
3. 작성자 : gilyong.han
4. 작성일 : 2023.07.27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 멤버십 확정 대상건을 조회하고 확정 할 수 있는 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_OG_CHO')"
        >
          <kw-option-group
            v-model="searchParams.sellInflwChnlDtlCd"
            type="radio"
            :options="ogOpt"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RCP_YM')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.fromCntrRcpFshDtm"
            v-model:to="searchParams.toCntrRcpFshDtm"
            :label="$t('MSG_TXT_RCP_YM')"
            type="month"
            rules="date_range_required"
            :from-disable="true"
          />
        </kw-search-item>
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
        <kw-search-item :label="$t('MSG_TXT_SEL_TYPE')">
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="sellTpOpt"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="onChangePageInfo"
          />
        </template>

        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-date-picker
          v-model="confirmParams.confirmDate"
          class="w130"
          dense
          :placeholder="$t('MSG_TXT_CNFM_DT')"
        />
        <kw-date-picker
          v-model="confirmParams.joinDate"
          class="w130"
          dense
          :placeholder="t('MSG_TXT_J_DT')"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-permission:update
          :label="$t('MSG_BTN_CONF')"
          primary
          dense
          @click="onClickConfirm"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        name="grdMain"
        @init="initGrid"
      />

      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="onChangePageInfo"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import {
  useDataService,
  getComponentType,
  gridUtil,
  defineGrid,
  codeUtil,
  useMeta,
  useGlobal,
} from 'kw-lib';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const dataService = useDataService();
const { getConfig } = useMeta();
const { t } = useI18n();
const { notify, alert, confirm } = useGlobal();

const grdMainRef = ref(getComponentType('kw-grid'));
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/closing/membership-confirms';
const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
  'COD_PAGE_SIZE_OPTIONS',
);
const now = dayjs();
const searchParams = ref({
  sellInflwChnlDtlCd: '1',
  fromCntrRcpFshDtm: now.add(-4, 'month').format('YYYYMM'),
  toCntrRcpFshDtm: now.format('YYYYMM'),
  cntrNo: '',
  cntrSn: 0,
  sellTpCd: '',
});

const confirmParams = ref({
  confirmDate: '',
  joinDate: '',
});
const ogOpt = [
  { codeId: '1', codeName: t('MSG_TXT_SERVICE_CENTER') },
  { codeId: '2', codeName: t('MSG_TXT_SLS') },
];
const sellTpOpt = codes.SELL_TP_CD.filter((v) => ['1', '2', '4', '5'].includes(v.codeId));

let cachedParams;
async function fetchData() {
  const res = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });

  const { list: data, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(data);
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onChangePageInfo() {
  if (isEmpty(cachedParams)) return;
  await fetchData();
}

const { currentRoute } = useRouter();
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  if (gridUtil.isModified(view)) { notify(t('MSG_TXT_NEED_SAVE_EXCEL_DOWNLOAD')); return; }

  await gridUtil.exportView(view, {
    exportData: gridUtil.getAllRowValues(view),
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    indicator: 'hidden',
    checkBar: 'hidden',
  });
}
async function onClickConfirm() {
  const view = grdMainRef.value.getView();
  if (gridUtil.getAllRowValues(view).length === 0) {
    await alert(t('MSG_TXT_NO_DATA_FOUND'));
    return false;
  }
  if (isEmpty(confirmParams.value.confirmDate) || isEmpty(confirmParams.value.joinDate)) {
    await alert(t('MSG_ALT_CHOICE_CNFM_DT_J_DT'));
    return false;
  }

  if (!await confirm(t('MSG_ALT_IS_DTRM'))) { return; }
  const saveParams = {
    sellInflwChnlDtlCd: cachedParams?.sellInflwChnlDtlCd,
    fromCntrRcpFshDtm: cachedParams?.fromCntrRcpFshDtm,
    toCntrRcpFshDtm: cachedParams?.toCntrRcpFshDtm,
    cntrNo: cachedParams?.cntrNo,
    cntrSn: cachedParams?.cntrSn,
    sellTpCd: cachedParams?.sellTpCd,
    confirmDate: confirmParams.value.confirmDate,
    joinDate: confirmParams.value.joinDate,
  };

  await dataService.put(baseUrl, saveParams);
  await alert(t('MSG_ALT_CNFM_COMPLETE'));
}

watch(() => searchParams.value.toCntrRcpFshDtm, async (val) => {
  searchParams.value.fromCntrRcpFshDtm = dayjs(val).add(-4, 'month').format('YYYYMM');
}, { immediate: true });
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrNoSn', header: t('MSG_TXT_CNTR_DTL_NO'), width: '146', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-center' },
    { fieldName: 'sellTpDtlNm', header: t('MSG_TXT_MSH_DV'), width: '120', styleName: 'text-center' },
    { fieldName: 'cntrwTpCd', header: t('MSG_TXT_SLS_CAT'), width: '120', styleName: 'text-center' },
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '120', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '300', styleName: 'text-left' },
    { fieldName: 'svPdTpNm', header: t('MSG_TXT_USWY'), width: '80', styleName: 'text-center' },
    { fieldName: 'svPrd', header: t('MSG_TXT_CYCL'), width: '80', styleName: 'text-center' },
    { fieldName: 'frisuYn', header: t('MSG_TXT_FRISU_MSH'), width: '120', styleName: 'text-center' },
    { fieldName: 'hcrDvCd', header: t('MSG_TXT_DV_1'), width: '80', styleName: 'text-center' },
    { fieldName: 'dv', header: t('MSG_TXT_DV_2'), width: '80', styleName: 'text-center' },
    { fieldName: 'dpTpNm', header: t('MSG_TXT_FNT_DV'), width: '120', styleName: 'text-center' },
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'cntrRcpFshDtm', header: t('MSG_TXT_RCP_D'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_DT_OF_SALE'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'istDt', header: t('MSG_TXT_INST_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'sellAmt', header: t('MSG_TXT_MSH_SSPCS'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'stlmTpNm', header: t('MSG_TXT_PY_MTHD'), width: '120', styleName: 'text-center' },
    { fieldName: 'dscAmt', header: t('MSG_TXT_DSC_AMT'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'cttRsCd', header: t('MSG_TXT_CTT_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'cttRsNm', header: t('MSG_TXT_CTT_CD_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'cttPsicNm', header: t('MSG_TXT_CTT_PSIC'), width: '119', styleName: 'text-center' },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FST_RGST_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_FST_RGST_USR'), width: '100', styleName: 'text-center' },
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_MDFC_DATE'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_MDFC_USR'), width: '100', styleName: 'text-center' },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' },

  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
