<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID : WwbncRentalResignExpectedMgtMConfirm ( W-BN-U-0128M02 ) - 직권해지관리 - 렌탈해지확정
3. 작성자 : gilyong.han
4. 작성일 : 2023.07.18
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 기간 내 집금구분별, 집금담당자별 직권해지 리스트를 조회하기 위한 화면
****************************************************************************************************
--->
<template>
  <kw-search
    :modified-targets="['grdConfirm']"
    @search="onClickSearch"
    @reset="onClickReset"
  >
    <kw-search-row>
      <kw-search-item
        :label="t('MSG_TXT_CNFM_YM')"
        required
      >
        <kw-date-range-picker
          v-model:from="searchParams.authRsgCnfmdtStart"
          v-model:to="searchParams.authRsgCnfmdtEnd"
          :label="t('MSG_TXT_CNFM_YM')"
          rules="date_range_required"
          type="month"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_CLCTAM_DV')"
      >
        <kw-select
          v-model="searchParams.clctamDvCd"
          :options="clctamDvCdOpt"
          first-option="all"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_CLCTAM_PSIC')"
      >
        <kw-input
          v-model="searchParams.clctamPrtnrNm"
          icon="search"
          clearable
          maxlength="30"
          @click-icon="onClickPrtnrKnm"
          @change="onChangePrtnrNo"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        :label="t('MSG_TXT_CST_NO')"
      >
        <kw-input
          v-model="searchParams.cstNo"
          icon="search"
          clearable
          maxlength="10"
          @click-icon="onClickSelectCustomer"
          @change="onChangeCstNo"
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
  </kw-search>
  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="totalCount"
        />
        <span class="ml8">(단위:원)</span>
      </template>

      <kw-btn
        v-permission:download
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="totalCount === 0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdConfirmRef"
      :visible-rows="10"
      name="grdConfirm"
      @init="initConfirmGrid"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import {
  useDataService,
  defineGrid,
  getComponentType,
  useGlobal,
  codeUtil,
  gridUtil,
  // useMeta,
} from 'kw-lib';
import {
  cloneDeep,
  isEmpty,
} from 'lodash-es';
import dayjs from 'dayjs';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const {
  notify,
  modal,
} = useGlobal();
const { t } = useI18n();
// const { getConfig } = useMeta();
const dataService = useDataService();
const grdConfirmRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/bond/rental-rsg-cnfms';

const codes = await codeUtil.getMultiCodes(
  'CLCTAM_DV_CD', // 집금구분코드
);
// 01:단기, 02:중기, 03:소송, 04:집행, 11:TF
const clctamDvCdOpt = codes.CLCTAM_DV_CD.filter((v) => ['01', '02', '03', '04', '11'].includes(v.codeId));

const searchParams = ref({
  authRsgCnfmdtStart: dayjs().format('YYYYMM'),
  authRsgCnfmdtEnd: dayjs().format('YYYYMM'),
  clctamDvCd: '',
  clctamPrtnrNo: '',
  clctamPrtnrNm: '',
  prtnrNoYn: 'N',
  cntrNo: '',
  cntrSn: 0,
  cstNo: '',
  cstNoYn: 'N',
});

// 검색 조회
let cachedParams;
async function fetchData() {
  const { data } = await dataService.get(baseUrl, { params: { ...cachedParams } });

  totalCount.value = data?.length;

  const view = grdConfirmRef.value.getView();

  view.getDataSource().setRows(data);
}

async function onClickSearch() {
  const { clctamPrtnrNm, prtnrNoYn, cstNo, cstNoYn } = searchParams.value;
  if (!isEmpty(clctamPrtnrNm) && prtnrNoYn === 'N') {
    notify(t('MSG_ALT_PLZ_USE_CLCTAM_PSIC_POPUP'));
    return false;
  }

  if (!isEmpty(cstNo) && cstNoYn === 'N') {
    notify(t('MSG_ALT__PLZ_USE_CSTNO_POPUP'));
    return false;
  }
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 집금담당자 검색
const onClickPrtnrKnm = async () => {
  const { result, payload } = await modal({
    component: 'ZwbnyCollectorListP',
    componentProps: {
      clctamPrtnrNm: searchParams.value.clctamPrtnrNm,
    },

  });
  if (result) {
    searchParams.value.clctamPrtnrNm = payload.prtnrKnm;
    searchParams.value.clctamPrtnrNo = payload.prtnrNo;
    searchParams.value.prtnrNoYn = 'Y';
  }
};
// 고객조회(공통)
async function onClickSelectCustomer() {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: {
      cstNo: searchParams.value.cstNo,
      cstType: '1',
    },
  });
  if (result) {
    searchParams.value.cstNo = payload.cstNo;
    searchParams.value.cstNoYn = 'Y';
  }
}
// 고객번호/고객명 변경
async function onChangeCstNo() {
  searchParams.value.cstNoYn = 'N';
}
// 파트너번호 변경
async function onChangePrtnrNo() {
  searchParams.value.prtnrNoYn = 'N';
  searchParams.value.clctamPrtnrNo = '';
}

async function onClickReset() {
  await onChangeCstNo();
  await onChangePrtnrNo();
}

const { currentRoute } = useRouter();
async function onClickExcelDownload() {
  const view = grdConfirmRef.value.getView();
  if (await gridUtil.isModified(view)) { await notify(t('MSG_TXT_NEED_SAVE_EXCEL_DOWNLOAD')); return; }

  await gridUtil.exportView(view, {
    exportData: gridUtil.getAllRowValues(view),
    fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TIT_RENTAL_RSG_CNFM')}`,
    timePostfix: true,
    indicator: 'hidden',
    checkBar: 'hidden',
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initConfirmGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'authRsgCnfmym',
      header: {
        text: t('MSG_TXT_CNFM_YM'),
        styleName: 'essential',
      },
      width: '100',
      styleName: 'text-center',
      datetimeFormat: 'YYYY-MM' }, // 확정년월
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-center' }, // 고객번호
    { fieldName: 'cntrNoSn', header: t('MSG_TXT_CNTR_DTL_NO'), width: '140', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'sellTpDtlNm', header: t('MSG_TXT_TASK_TYPE'), width: '100', styleName: 'text-center' }, // 업무유형
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' }, // 고객명
    { fieldName: 'rsgMmUcAmt', header: t('MSG_TXT_RSG_MM_UC_AMT'), width: '140', styleName: 'text-right', dataType: 'number' }, // 해지월미수금
    { fieldName: 'rsgMmStpCs', header: t('MSG_TXT_RSG_MM_STP_AMT'), width: '140', styleName: 'text-right', dataType: 'number' }, // 해지월중지액
    { fieldName: 'ccam', header: t('MSG_TXT_CCAM'), width: '140', styleName: 'text-right', dataType: 'number' }, // 위약금
    { fieldName: 'csmbCsBorAmt', header: t('MSG_TXT_CSMB_CS'), width: '140', styleName: 'text-right', dataType: 'number' }, // 소모품비
    { fieldName: 'reqdCsBorAmt', header: t('MSG_TXT_REQD_CS'), width: '140', styleName: 'text-right', dataType: 'number' }, // 철거비
    { fieldName: 'lsRntf', header: t('MSG_TXT_PD_LENT_LOST_LOG'), width: '140', styleName: 'text-right', dataType: 'number' }, // 분실손료
    { fieldName: 'rtrnDbtFnlAmt', header: `(${t('MSG_TXT_DTRM')})${t('MSG_TXT_RTRN_H_ARRS_AMT')}`, width: '160', styleName: 'text-right', dataType: 'number' }, // 반환시체납액
    { fieldName: 'nrtrnDbtFnlAmt', header: `(${t('MSG_TXT_DTRM')})${t('MSG_TXT_N_RTRN_H_ARRS_AMT')}`, width: '180', styleName: 'text-right', dataType: 'number' }, // 미반환시체납액
    { fieldName: 'exmptYn', header: t('MSG_TXT_CNTR_DV'), width: '100', styleName: 'text-center' }, // 계약구분
    { fieldName: 'pdCd', header: t('MSG_TXT_PROD_CD'), width: '100', styleName: 'text-center' }, // 제품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_GOODS_NM'), width: '180' }, // 제품명
    // rev:230410 header 텍스트 변경
    { fieldName: 'clctamPrtnrNo', header: t('MSG_TXT_CLCTAM_ICHR_EMPNO'), width: '100', styleName: 'text-center' }, // 집금담당사번
    // // rev:230410 header 텍스트 변경
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_CLCTAM_PSIC'), width: '100', styleName: 'text-center' }, // 집금담당자
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
