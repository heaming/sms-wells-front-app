<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID : WwbncBondCounselMContract
3. 작성자 : sunghun.choi
4. 작성일 : 2023.02.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 채권상담 계약리스트 탭 화면
- 채권상담 계약리스트를 조회
****************************************************************************************************
--->
<template>
  <kw-search
    ref="frmMainRef"
    :cols="4"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_CLCTAM_PSIC')"
        required
      >
        <kw-input
          v-model="searchParams.schClctamNm"
          :label="$t('MSG_TXT_CLCTAM_PSIC')"
          clearable
          :maxlength="30"
          icon="search"
          rules="required"
          @click-icon="onClickClctamPsic"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CST_NM')"
      >
        <kw-input
          v-model="searchParams.schCstNm"
          clearable
          icon="search"
          :maxlength="30"
          @click-icon="onClickSelectCustomer"
          @change="onChangeCstNo"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_DLQ_MCNT')"
      >
        <kw-select
          v-model="searchParams.schDlqMcntStrt"
          :options="selectCodes.DLQ_MCNT"
          first-option="all"
        />
        <span>-</span>
        <kw-select
          v-model="searchParams.schDlqMcntEnd"
          :options="selectCodes.DLQ_MCNT"
          first-option="all"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_IST_TNO')"
      >
        <kw-input
          v-model:tel-no0="searchParams.schIstLocaraTno"
          v-model:tel-no1="searchParams.schIstExnoEncr"
          v-model:tel-no2="searchParams.schIstIdvTno"
          mask="telephone"
          :placeholder="$t('MSG_TXT_REPSN_DGT4_WO_NO_IN')"
        />
      </kw-search-item>
    </kw-search-row>

    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_CNTR_DTL_NO')"
      >
        <kw-input
          v-model="searchParams.schCntrDtlNo"
          :maxlength="14"
          :placeholder="$t('MSG_TIT_CNTR_NO_CNTR_SN')"
          icon="search"
          @click-icon="onClickCntrDtlNo"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CST_NO')"
      >
        <kw-input
          v-model="searchParams.schCstNo"
          icon="search"
          :maxlength="10"
          regex="num"
          clearable
          @click-icon="onClickSelectCustomer"
          @change="onChangeCstNo"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_TASK_DIV')"
      >
        <kw-select
          v-model="searchParams.schBizDv"
          :options="selectCodes.BIZ_DV"
          first-option="all"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_IST_MPNO')"
      >
        <kw-input
          v-model:tel-no0="searchParams.schIstCralLocaraTno"
          v-model:tel-no1="searchParams.schIstMexnoEncr"
          v-model:tel-no2="searchParams.schIstCralIdvTno"
          mask="telephone"
          :placeholder="$t('MSG_TXT_REPSN_DGT4_WO_NO_IN')"
        />
      </kw-search-item>
    </kw-search-row>

    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_TEL_NO')"
      >
        <kw-input
          v-model:tel-no0="searchParams.schCntrLocaraTno"
          v-model:tel-no1="searchParams.schCntrExnoEncr"
          v-model:tel-no2="searchParams.schCntrIdvTno"
          mask="telephone"
          :placeholder="$t('MSG_TXT_REPSN_DGT4_WO_NO_IN')"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_SFK')"
      >
        <kw-input
          v-model="searchParams.schSfK"
          icon="search"
          regex="num"
          :maxlength="13"
          @click-icon="onClickSelectCustomer"
          @change="onChangeSfk"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CST_DV')"
      >
        <kw-select
          v-model="searchParams.schCstDv"
          :options="codes.CST_SE_APY_DV_CD.filter((v) => ['01', '02'].includes(v.codeId))"
          first-option="all"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_OJ_BLAM')"
      >
        <kw-input v-model="searchParams.schOjBlamStrt" />
        <span>-</span>
        <kw-input v-model="searchParams.schOjBlamEnd" />
      </kw-search-item>
    </kw-search-row>

    <kw-search-row :cols="2">
      <kw-search-item
        :label="$t('MSG_TXT_MPNO')"
      >
        <kw-input
          v-model:tel-no0="searchParams.schCntrCralLocaraTno"
          v-model:tel-no1="searchParams.schCntrMexnoEncr"
          v-model:tel-no2="searchParams.schCntrCralIdvTno"
          mask="telephone"
          :placeholder="$t('MSG_TXT_REPSN_DGT4_WO_NO_IN')"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_TF_DT')"
      >
        <kw-date-range-picker
          v-model:from="searchParams.schTfDtStrt"
          v-model:to="searchParams.schTfDtEnd"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_FNT_DT')"
        :colspan="2"
      >
        <kw-select
          v-model="searchParams.schFntDv"
          :options="selectCodes.FNT_DV"
          first-option="all"
        />
        <kw-select
          v-model="searchParams.schFntDtStrt"
          :options="selectCodes.FNT_DT"
          first-option="all"
        />
        <span>-</span>
        <kw-select
          v-model="searchParams.schFntDtEnd"
          :options="selectCodes.FNT_DT"
          first-option="all"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_BIL_DV')"
      >
        <kw-select
          v-model="searchParams.schBilDv"
          :options="selectCodes.BIL_HD"
          first-option="all"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CST_THM_DP')"
      >
        <kw-option-group
          v-model="searchParams.schCstThmDp"
          type="radio"
          :options="selectCodes.CST_THM_DP"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_AUTH_RSG_YN')"
      >
        <kw-select
          v-model="searchParams.schAuthRsgYn"
          :options="selectCodes.AUTH_AUTH_RSG_YN"
          first-option="all"
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
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        secondary
        dense
        :disable="totalCount === 0"
        @click="onClickExcelDownload"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        v-permission:create
        :label="$t('MSG_BTN_IST_CHAR_FW')"
        primary
        dense
        :disable="totalCount === 0"
        @click="onClickMessageSend('i')"
      />
      <kw-btn
        v-permission:create
        :label="$t('MSG_BTN_CNTR_CHAR_FW')"
        primary
        dense
        :disable="totalCount === 0"
        @click="onClickMessageSend('C')"
      />
    </kw-action-top>
    <ul class="filter-box mb12">
      <li class="filter-box__item">
        <p class="filter-box__item-label">
          {{ $t('MSG_TXT_DIV') }}
        </p>
        <kw-option-group
          v-model="searchParams.schDv"
          dense
          type="radio"
          :options="[
            { codeId: '99', codeName:t('MSG_TXT_ALL') },
            { codeId: '01', codeName:t('MSG_TXT_DLQ_BLAM_EXCD') , disable:isRadioDisable },
            { codeId: '02', codeName:t('MSG_TXT_TOT_DP_AMT_EXCD') , disable:isRadioDisable },
            { codeId: '03', codeName:t('MSG_TXT_OJ_BLAM_EXCD'), disable:isRadioDisable },
            { codeId: '04', codeName:t('MSG_TXT_DLQ_MCNT_EXCD') , disable:isRadioDisable }
          ]"
          @change="onChangeDv"
        />
      </li>
    </ul>

    <kw-grid
      ref="grdMainRef"
      name="grdMain2"
      :visible-rows="10"
      @init="initGrdMain"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, gridUtil, codeUtil, getComponentType, modal, useDataService, notify, popupUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import { getDlqMcnt, getFntDt, getWellsCntrListDv, getAuthAuthRsgYn, getFntDv, getCstThmDp, getWellsBilDv, getBizDv } from '~sms-common/bond/utils/bnUtil';

const emits = defineEmits([
  'update',
]);

const { t } = useI18n();

const dataService = useDataService();
const { currentRoute } = useRouter();
const { getters } = useStore();
const { employeeIDNumber } = getters['meta/getUserInfo'];

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  refId: {
    type: String,
    default: null,
  },
});

const isRadioDisable = ref(true);

const selectCodes = ref({
  DLQ_MCNT: await getDlqMcnt(),
  FNT_DT: await getFntDt(),
  WELLS_CNTR_LIST_DV: await getWellsCntrListDv(),
  AUTH_AUTH_RSG_YN: await getAuthAuthRsgYn(),
  FNT_DV: await getFntDv(),
  CST_THM_DP: await getCstThmDp(),
  BIL_HD: await getWellsBilDv(),
  BIZ_DV: await getBizDv(),
});

const codes = await codeUtil.getMultiCodes(
  'CST_SE_APY_DV_CD',
  'DP_TP_CD',
);

const grdMainRef = ref(getComponentType('KwGrid'));

// TODO: 계약리스트 검색조건
let cachedParams;
const searchParams = ref({
  schClctamNo: employeeIDNumber,
  schClctamNm: '',
  schCstNm: '',
  schDlqMcntStrt: '',
  schDlqMcntEnd: '',
  schIstTno: '',
  schCntrDtlNo: '',
  schCstNo: '',
  schBizDv: '',
  schIstMpno: '',
  schTno: '',
  schSfK: '',
  schCstDv: '',
  schOjBlamStrt: '',
  schOjBlamEnd: '',
  schMpno: '',
  schTfDtStrt: '',
  schTfDtEnd: '',
  schFntDv: '',
  schFntDtStrt: '',
  schFntDtEnd: '',
  schBilDv: '',
  schCstThmDp: '01',
  schAuthRsgYn: '',
  schDv: '99',
  schCstNoYn: 'N',
  dv1: '',
  dv2: '',
  schSfKYn: 'N',
  refId: props.refId,
});

const frmMainRef = ref(getComponentType('KwForm'));
const customerParams = ref({});
const totalCount = ref(0);
const windowKey = ref('');

// TODO: 계약상세번호 조회
async function onClickCntrDtlNo() {
  const { result, payload } = await modal({
    component: 'WwctaContractNumberListP',
    componentProps: {
      cntrNo: searchParams.value.schCntrDtlNo,
    },
  });
  if (result) {
    searchParams.value.cntrNo = payload.cntrNo;
    searchParams.value.cntrSn = payload.cntrSn;
    searchParams.value.schCntrDtlNo = `${searchParams.value.cntrNo}-${searchParams.value.cntrSn}`;
  }
}

/** 계약리스트 조회 */
async function fetchContracts() {
  const response = await dataService.get('/sms/wells/bond/bond-counsel/contracts', { params: cachedParams, timeout: 300000 });
  const contracts = response.data;
  totalCount.value = contracts.length;

  const gridView = grdMainRef.value.getView();
  gridView.getDataSource().setRows(contracts);

  isRadioDisable.value = false;
}

/** 계약리스트 엑셀다운로드 */
async function onClickExcelDownload() {
  const res = await dataService.get('/sms/wells/bond/bond-counsel/contracts', { params: cachedParams });
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    checkBar: 'hidden',
    exportData: res.data,
  });
}

// TODO: 고객번호/고객명 변경
async function onChangeCstNo() {
  searchParams.value.schCstNoYn = 'N';
}

// TODO: 세이프키 변경
async function onChangeSfk() {
  searchParams.value.schSfKYn = 'N';
}

// TODO: 고객조회(공통)
async function onClickSelectCustomer() {
  const { result, payload } = await modal({
    component: 'ZwbnyDelinquentCustomerP',
    componentProps: {
      baseYm: customerParams.value.baseYm,
      cstNo: searchParams.value.schCstNo,
      cstNm: searchParams.value.schCstNm,
      sfkVal: searchParams.value.schSfK,

    },
  });
  if (result) {
    const { cstNo, cstNm, sfkVal } = payload;
    searchParams.value.schCstNo = cstNo;
    searchParams.value.schCstNm = cstNm;
    searchParams.value.schSfK = sfkVal;
    searchParams.value.schCstNoYn = 'Y';
    searchParams.value.schSfKYn = 'Y';
  }
}

// TODO: 문자발송
const onClickMessageSend = async (type) => {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  await modal({
    component: 'ZwbncMessageSendP',
    componentProps: {
      listType: 'contract',
      dataList: checkedRows,
      cntrType: type,
    },
  });
};

// TODO: 집금담당자 검색 팝업 호출
const onClickClctamPsic = async () => {
  const { result, payload } = await modal({
    component: 'ZwbnyCollectorListP',
    componentProps: {
      clctamPrtnrNm: searchParams.value.schClctamNm,
    },
  });
  if (result) {
    searchParams.value.schClctamNm = payload.prtnrKnm;
    searchParams.value.schClctamNo = payload.prtnrNo;
  }
};

async function onClickSearch() {
  const cstNo = searchParams.value.schCstNo;
  const cstNm = searchParams.value.schCstNm;
  const sfk = searchParams.value.schSfK;
  const cstNoYn = searchParams.value.schCstNoYn;
  const sfkYn = searchParams.value.schSfKYn;

  if (cstNo !== '' || cstNm !== '') {
    if (cstNoYn === 'N') {
      notify(t('MSG_ALT_NAME_NO_IN'));
      return;
    }
  }
  if (sfk !== '') {
    if (sfkYn === 'N') {
      notify(t('MSG_ALT_SFK_IN'));
      return;
    }
  }

  const dlqMcntStrt = searchParams.value.schDlqMcntStrt;
  const dlqMcntEnd = searchParams.value.schDlqMcntEnd;
  const fntDtStrt = searchParams.value.schFntDtStrt;
  const fntDtEnd = searchParams.value.schFntDtEnd;
  const ojBlamStrt = searchParams.value.schOjBlamStrt;
  const ojBlamEnd = searchParams.value.schOjBlamEnd;

  if (Number(dlqMcntStrt) > Number(dlqMcntEnd)) {
    notify(t('MSG_ALT_STRT_YM_END_YM_BIG', [t('MSG_TXT_DLQ_MCNT') + t('MSG_TXT_RSV_STRT_DTM'), t('MSG_TXT_RSV_END_DTM')]));
    return false;
  }
  if (fntDtStrt > fntDtEnd) {
    notify(t('MSG_ALT_STRT_YM_END_YM_BIG', [t('MSG_TXT_FNT_DT') + t('MSG_TXT_RSV_STRT_DTM'), t('MSG_TXT_RSV_END_DTM')]));
    return false;
  }

  if (Number(ojBlamStrt) > Number(ojBlamEnd)) {
    notify(t('MSG_ALT_STRT_YM_END_YM_BIG', [t('MSG_TXT_OJ_BLAM') + t('MSG_TXT_RSV_STRT_DTM'), t('MSG_TXT_RSV_END_DTM')]));
    return false;
  }

  cachedParams = cloneDeep(searchParams.value);
  await fetchContracts();
}

// TODO: 구분 라디오 선택
async function onChangeDv() {
  if (searchParams.value.schClctamNm === '') {
    searchParams.value.dv1 = searchParams.value.schDv;
    if (searchParams.value.dv1 !== searchParams.value.dv2) {
      if (!await frmMainRef.value.validate()) {
        searchParams.value.schDv = '99';
        searchParams.value.dv2 = '99';
      } else {
        await onClickSearch();
      }
    }
  } else {
    await onClickSearch();
  }
}

async function fetchBaseYmData() {
  const response = await dataService.get('/sms/wells/bond/bond-counsel/base-ym');
  customerParams.value = response.data;
}

onMounted(async () => {
  await fetchBaseYmData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ctt' },
    { fieldName: 'bizDv' },
    { fieldName: 'prdf' },
    { fieldName: 'pdctNm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cstNm' },
    { fieldName: 'dlqMcnt' },
    { fieldName: 'ojAmt', dataType: 'number' },
    { fieldName: 'ojDp', dataType: 'number' },
    { fieldName: 'ojBlam', dataType: 'number' },
    { fieldName: 'totDlqAmt', dataType: 'number' },
    { fieldName: 'totDlqDp', dataType: 'number' },
    { fieldName: 'totDlqBlam', dataType: 'number' },
    { fieldName: 'dlqAmt', dataType: 'number' },
    { fieldName: 'dlqDp', dataType: 'number' },
    { fieldName: 'dlqBlam', dataType: 'number' },
    { fieldName: 'mmChramAmt', dataType: 'number' },
    { fieldName: 'mmChramDp', dataType: 'number' },
    { fieldName: 'mmChramBlam', dataType: 'number' },
    { fieldName: 'dlqAddAmt', dataType: 'number' },
    { fieldName: 'dlqAddDp', dataType: 'number' },
    { fieldName: 'ucAmt', dataType: 'number' },
    { fieldName: 'ucDp', dataType: 'number' },
    { fieldName: 'ucBlam', dataType: 'number' },
    { fieldName: 'totDpAmt', dataType: 'number' },
    { fieldName: 'spmtSl', dataType: 'number' },
    { fieldName: 'ccam', dataType: 'number' },
    { fieldName: 'lsfe', dataType: 'number' },
    { fieldName: 'rtlfe1', dataType: 'number' },
    { fieldName: 'rtlfeIstm1', dataType: 'number' },
    { fieldName: 'rtlfe2', dataType: 'number' },
    { fieldName: 'rtlfeIstm2', dataType: 'number' },
    { fieldName: 'promDt' },
    { fieldName: 'dprNm' },
    { fieldName: 'clctamIchr' },
    { fieldName: 'cntrMpno' },
    { fieldName: 'cntrCralLocaraTno' },
    { fieldName: 'cntrMexnoEncr' },
    { fieldName: 'cntrCralIdvTno' },
    { fieldName: 'cntrTno' },
    { fieldName: 'cntrLocaraTno' },
    { fieldName: 'cntrExnoEncr' },
    { fieldName: 'cntrIdvTno' },
    { fieldName: 'istMpno' },
    { fieldName: 'istCralLocaraTno' },
    { fieldName: 'istMexnoEncr' },
    { fieldName: 'istCralIdvTno' },
    { fieldName: 'istTno' },
    { fieldName: 'istLocaraTno' },
    { fieldName: 'istExnoEncr' },
    { fieldName: 'istIdvTno' },
    { fieldName: 'cstNo' },
    { fieldName: 'tfDt' },
    { fieldName: 'buNotiDt' },
    { fieldName: 'buNotiTp' },
    { fieldName: 'cntrZip' },
    { fieldName: 'cntrAdr' },
    { fieldName: 'istZip' },
    { fieldName: 'istAdr' },
    { fieldName: 'vtAcBnk' },
    { fieldName: 'vtAcno' },
    { fieldName: 'pesuDt' },
    { fieldName: 'hiDt' },
    { fieldName: 'ovrdDt' },
    { fieldName: 'cpsnEfcm' },
    { fieldName: 'dsbCmd' },
    { fieldName: 'prtyClrs' },
    { fieldName: 'submCmd' },
    { fieldName: 'crcCmd' },
    { fieldName: 'cujOvrd' },
    { fieldName: 'vstRs' },
    { fieldName: 'vstDt' },
    { fieldName: 'sfk' },
    { fieldName: 'unuitm' },
  ];

  const columns = [
    { fieldName: 'ctt', header: t('MSG_TXT_CTT'), width: '52', styleName: 'text-center', headerSummaries: { text: '합계', styleName: 'text-center' } }, // 컨택
    { fieldName: 'bizDv', header: t('MSG_TXT_TASK_DIV'), width: '100', styleName: 'text-center' }, // 업무구분
    { fieldName: 'prdf', header: t('MSG_TXT_PRD_GRP'), width: '180', styleName: 'text-center' }, // 제품군
    { fieldName: 'pdctNm', header: t('MSG_TXT_GOODS_NM'), width: '260', styleName: 'text-center' }, // 제품명
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '140', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '100', styleName: 'text-center', visible: false }, // 계약일련번호
    { fieldName: 'cstNm', header: t('MSG_TXT_CST_NM'), width: '120', styleName: 'text-center' }, // 고객명
    { fieldName: 'dlqMcnt', header: t('MSG_TXT_DLQ_MCNT'), width: '70', styleName: 'text-center' }, // 연체개월
    { fieldName: 'ojAmt', header: t('MSG_TXT_OJ_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 대상금액
    { fieldName: 'ojDp', header: t('MSG_TXT_OJ_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 대상입금
    { fieldName: 'ojBlam', header: t('MSG_TXT_OJ_BLAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 대상잔액
    { fieldName: 'totDlqAmt', header: t('MSG_TXT_TOT_DLQ_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 총연체금
    { fieldName: 'totDlqDp', header: t('MSG_TXT_TOT_DLQ_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 총연체입금
    { fieldName: 'totDlqBlam', header: t('MSG_TXT_TOT_DLQ_BLAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 총연체잔액
    { fieldName: 'dlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 연체금액
    { fieldName: 'dlqDp', header: t('MSG_TXT_DLQ_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 연체입금
    { fieldName: 'dlqBlam', header: t('MSG_TXT_DLQ_BLAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 연체잔액
    { fieldName: 'mmChramAmt', header: t('MSG_TXT_MM_CHRAM_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 월요금액
    { fieldName: 'mmChramDp', header: t('MSG_TXT_MM_CHRAM_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 월요금입금
    { fieldName: 'mmChramBlam', header: t('MSG_TXT_MM_CHRAM_BLAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 월요금잔액
    { fieldName: 'dlqAddAmt', header: t('MSG_TXT_DLQ_ADD_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 연체가산금액
    { fieldName: 'dlqAddDp', header: t('MSG_TXT_DLQ_ADD_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 연체가산입금
    { fieldName: 'ucAmt', header: t('MSG_TXT_UC_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 미수금액
    { fieldName: 'ucDp', header: t('MSG_TXT_UC_DP'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 미수입금
    { fieldName: 'ucBlam', header: t('MSG_TXT_UC_BLAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 미수잔액
    { fieldName: 'totDpAmt', header: t('MSG_TXT_TOT_DP_AMT'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 총입금액
    { fieldName: 'spmtSl', header: t('MSG_TXT_SPMT_SL'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 추가매출
    { fieldName: 'ccam', header: t('MSG_TXT_CCAM'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 위약금
    { fieldName: 'lsfe', header: t('MSG_TXT_LSFE'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 분실료
    { fieldName: 'rtlfe1', header: t('MSG_TXT_RTLFE1'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 렌탈료
    { fieldName: 'rtlfeIstm1', header: t('MSG_TXT_RTLFE_1_ISTM'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 렌탈료1할
    { fieldName: 'rtlfe2', header: t('MSG_TXT_RTLFE2'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 렌탈료2
    { fieldName: 'rtlfeIstm2', header: t('MSG_TXT_RTLFE_2_ISTM'), width: '100', styleName: 'text-right', numberFormat: '#,##0', headerSummaries: { expression: 'sum', numberFormat: '#,##0' } }, // 렌탈료2할
    { fieldName: 'promDt', header: t('MSG_TXT_PROM_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 약속일자
    { fieldName: 'dprNm', header: t('MSG_TXT_DPR_NM'), width: '100', styleName: 'text-center' }, // 입금자명
    { fieldName: 'clctamIchr', header: t('MSG_TXT_CLCTAM_ICHR'), width: '100', styleName: 'text-center' }, // 집급담당
    {
      fieldName: 'cntrMpno',
      header: t('MSG_TXT_MPNO'),
      styleName: 'text-center',
      width: '130',
      displayCallback(grid, index) {
        const { cntrCralLocaraTno: no1, cntrMexnoEncr: no2, cntrCralIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (no1 != null) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    }, // 계약휴대전화번호
    { fieldName: 'cntrCralLocaraTno', width: '100', styleName: 'text-left', visible: false }, // 계약휴대전화번호1
    { fieldName: 'cntrMexnoEncr', width: '100', styleName: 'text-left', visible: false }, // 계약휴대전화번호2
    { fieldName: 'cntrCralIdvTno', width: '100', styleName: 'text-left', visible: false }, // 계약휴대전화번호3
    {
      fieldName: 'cntrTno',
      header: t('MSG_TXT_CNTR_TNO'),
      styleName: 'text-center',
      width: '130',
      displayCallback(grid, index) {
        const { cntrLocaraTno: no1, cntrExnoEncr: no2, cntrIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (no1 != null) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    }, // 계약전화번호
    { fieldName: 'cntrLocaraTno', width: '100', styleName: 'text-left', visible: false }, // 계약전화번호1
    { fieldName: 'cntrExnoEncr', width: '100', styleName: 'text-left', visible: false }, // 계약전화번호2
    { fieldName: 'cntrIdvTno', width: '100', styleName: 'text-left', visible: false }, // 계약전화번호3
    {
      fieldName: 'istMpno',
      header: t('MSG_TXT_IST_MPNO'),
      styleName: 'text-center',
      width: '130',
      displayCallback(grid, index) {
        const { istCralLocaraTno: no1, istMexnoEncr: no2, istCralIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (no1 != null) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    }, // 설치휴대전화번호
    { fieldName: 'istCralLocaraTno', width: '100', styleName: 'text-left', visible: false }, // 설치휴대전화번호1
    { fieldName: 'istMexnoEncr', width: '100', styleName: 'text-left', visible: false }, // 설치휴대전화번호2
    { fieldName: 'istCralIdvTno', width: '100', styleName: 'text-left', visible: false }, // 설치휴대전화번호3
    {
      fieldName: 'istTno',
      header: t('MSG_TXT_IST_TNO'),
      styleName: 'text-center',
      width: '130',
      displayCallback(grid, index) {
        const { istLocaraTno: no1, istExnoEncr: no2, istIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (no1 != null) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    }, // 설치전화번호
    { fieldName: 'istLocaraTno', width: '100', styleName: 'text-left', visible: false }, // 설치전화번호1
    { fieldName: 'istExnoEncr', width: '100', styleName: 'text-left', visible: false }, // 설치전화번호2
    { fieldName: 'istIdvTno', width: '100', styleName: 'text-left', visible: false }, // 설치전화번호3
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-center' }, // 고객번호
    { fieldName: 'tfDt', header: t('MSG_TXT_TF_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 이관일자
    { fieldName: 'buNotiDt', header: t('MSG_TXT_BU_NOTI_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 부담통보일자
    { fieldName: 'buNotiTp', header: t('MSG_TXT_BU_NOTI_TP'), width: '150', styleName: 'text-center' }, // 부담통보유형
    { fieldName: 'cntrZip', header: t('MSG_TXT_CNTR_ZIP'), width: '100', styleName: 'text-center' }, // 계약우편번호
    { fieldName: 'cntrAdr', header: t('MSG_TXT_CNTR_ADR'), width: '200', styleName: 'text-left' }, // 계약주소
    { fieldName: 'istZip', header: t('MSG_TXT_IST_ZIP'), width: '100', styleName: 'text-center' }, // 설치우편번호
    { fieldName: 'istAdr', header: t('MSG_BTN_INST_ADDR'), width: '200', styleName: 'text-left' }, // 설치주소
    { fieldName: 'vtAcBnk', header: t('MSG_TXT_VT_AC_BNK'), width: '100', styleName: 'text-left' }, // 가상계좌은행
    { fieldName: 'vtAcno', header: t('MSG_TXT_VT_AC_NO'), width: '160', styleName: 'text-center' }, // 가상계좌번호
    { fieldName: 'pesuDt', header: t('MSG_TXT_PESU_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 독촉일자
    { fieldName: 'hiDt', header: t('MSG_TXT_HI_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 최고일자
    { fieldName: 'ovrdDt', header: t('MSG_TXT_LCY_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 채불일자
    { fieldName: 'cpsnEfcm', header: t('MSG_TXT_CPSN_EFCM'), width: '100', styleName: 'text-center' }, // 강제집행
    { fieldName: 'dsbCmd', header: t('MSG_TXT_DSB_CMD'), width: '100', styleName: 'text-center' }, // 지급명령
    { fieldName: 'prtyClrs', header: t('MSG_TXT_PRTY_CLRS'), width: '100', styleName: 'text-center' }, // 재산명시
    { fieldName: 'submCmd', header: t('MSG_TXT_SUBM_CMD'), width: '100', styleName: 'text-center' }, // 제출명령
    { fieldName: 'crcCmd', header: t('MSG_TXT_CRC_CMD'), width: '100', styleName: 'text-center ' }, // 보정명령
    { fieldName: 'cujOvrd', header: t('MSG_TXT_CUJ_DFLT'), width: '100', styleName: 'text-center' }, // 법원채불
    { fieldName: 'vstRs', header: t('MSG_TXT_VST_RS'), width: '140', styleName: 'text-left' }, // 방문결과
    { fieldName: 'vstDt', header: t('MSG_TXT_VST_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 방문일자
    { fieldName: 'sfk', header: t('MSG_TXT_SFK'), width: '160', styleName: 'text-center' }, // 세이프키
    { fieldName: 'unuitm', header: t('MSG_TXT_UNUITM'), width: '200', styleName: 'text-center' }, // 특이사항
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.setFixedOptions({
    colCount: 6,
  });

  view.setHeaderSummaries({
    visible: true,
    items: [{ height: 40 }],
  });
  view.layoutByColumn('ctt').summaryUserSpans = [{ colspan: 7 }];
  view.layoutByColumn('promDt').summaryUserSpans = [{ colspan: 31 }];

  view.onCellDblClicked = async (g, { dataRow }) => {
    const cstNo = gridUtil.getCellValue(g, dataRow, 'cstNo');
    const cntrNo = gridUtil.getCellValue(g, dataRow, 'cntrNo');
    const cntrSn = gridUtil.getCellValue(g, dataRow, 'cntrSn');
    windowKey.value = `WwbncBondCounselMContract_${cstNo}`;

    const getMessageEvent = (e) => {
      emits('update', e.data.data);
    };

    window.addEventListener('message', getMessageEvent, false);

    if (cstNo) {
      const res = await popupUtil.open(`/popup/#/wwbnc-customer-dtl?cstNo=${cstNo}&cntrNo=${cntrNo}&cntrSn=${cntrSn}`, { width: 2000, height: 1100 }, { 'modal-popup': true, cstNo, cntrNo, cntrSn }, windowKey.value);

      if (res.result) {
        window.removeEventListener('message', getMessageEvent, false);
      }
    }
  };
});
</script>
