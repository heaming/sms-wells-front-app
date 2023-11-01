<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID : WwbncRentalResignExpectedMgtMExpected ( W-BN-U-0128M01 ) - 직권해지관리 - 렌탈해지예정
3. 작성자 : gilyong.han
4. 작성일 : 2023.07.18
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- Wells 직권해지 전 예정고객의 전체를관리하고, 직권해지를 방어하기 위한 화면
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="4"
    :modified-targets="['grdExpected01','grdExpected02','grdExpected03']"
    @search="onClickSearch"
    @reset="onClickReset"
  >
    <kw-search-row>
      <kw-search-item
        :label="t('MSG_TXT_AUTH_AUTH_RSG_D')"
        required
      >
        <kw-date-picker
          v-model="searchParams.baseDt"
          rules="required"
          :label="t('MSG_TXT_AUTH_AUTH_RSG_D')"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_PRDT_TYPE')"
      >
        <kw-select
          v-model="searchParams.sellTpCd"
          :options="sellTpCdOpt"
          first-option="all"
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
        :label="t('MSG_TXT_CNTR_DTL_NO')"
      >
        <zctz-contract-detail-number
          v-model:cntr-no="searchParams.cntrNo"
          v-model:cntr-sn="searchParams.cntrSn"
          :name="$t('MSG_TXT_CNTR_DTL_NO')"
        />
      </kw-search-item>
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
        :label="t('MSG_TXT_CNFM_DV')"
      >
        <kw-option-group
          v-model="searchParams.authRsgCd"
          type="radio"
          :options="authRsgCdOpt"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>
  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-show="searchParams.authRsgCd=='01'"
          :total-count="totalCount01"
        />
        <kw-paging-info
          v-show="searchParams.authRsgCd=='02'"
          :total-count="totalCount02"
        />
        <kw-paging-info
          v-show="searchParams.authRsgCd=='03'"
          :total-count="totalCount03"
        />
      </template>
      <kw-btn
        v-permission:create
        dense
        grid-action
        :label="t('MSG_BTN_SAVE')"
        :disable="!isSearchMonth || isfinalConfirm"
        @click="onClickSave"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <kw-btn
        v-permission:update
        icon="upload_on"
        dense
        secondary
        :label="t('MSG_TXT_EXCEL_UPLOAD')"
        :disable="!isSearchMonth || isfinalConfirm"
        @click="onClickExcelUpload"
      />
      <kw-btn
        v-show="searchParams.authRsgCd=='01'"
        v-permission:download
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="totalCount01 === 0"
        @click="onClickExcelDownload"
      />
      <kw-btn
        v-show="searchParams.authRsgCd=='02'"
        v-permission:download
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="totalCount02 === 0"
        @click="onClickExcelDownload"
      />
      <kw-btn
        v-show="searchParams.authRsgCd=='03'"
        v-permission:download
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="totalCount03 === 0"
        @click="onClickExcelDownload"
      />

      <kw-separator
        spaced
        vertical
        inset
      />

      <kw-btn
        v-permission:create
        dense
        secondary
        :label="t('MSG_BTN_EXP_CRT')"
        :disable="!isSearchMonth || isExpectedConfirm || isfinalConfirm"
        @click="onClickExpectedCreate"
      />
      <kw-btn
        v-permission:update
        dense
        secondary
        :label="t('MSG_BTN_EXP_CNFM')"
        :disable="!isSearchMonth || isExpectedConfirm || !isPsic || isfinalConfirm"
        @click="onClickExpectedConfirm"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <kw-btn
        dense
        primary
        :label="t('MSG_TXT_FNL_CNFM')"
        :disable="isfinalConfirm || !isPsic || isNotExpected"
        @click="onClickFinalConfirm"
      />
    </kw-action-top>
    <kw-grid
      v-show="searchParams.authRsgCd=='01'"
      ref="grdExpected01Ref"
      :visible-rows="10"
      name="grdExpected01"
      @init="initExpected01Grid"
    />
    <kw-grid
      v-show="searchParams.authRsgCd=='02'"
      ref="grdExpected02Ref"
      :visible-rows="10"
      name="grdExpected02"
      @init="initExpected02Grid"
    />
    <kw-grid
      v-show="searchParams.authRsgCd=='03'"
      ref="grdExpected03Ref"
      :visible-rows="10"
      name="grdExpected03"
      @init="initExpected03Grid"
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
  gridUtil,
  useGlobal,
  codeUtil,
  // useMeta,
} from 'kw-lib';
import { RowState } from 'realgrid';
import {
  cloneDeep,
  isEmpty,
} from 'lodash-es';
import dayjs from 'dayjs';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const {
  notify,
  confirm,
  alert,
  modal,
} = useGlobal();
const { t } = useI18n();
const { currentRoute } = useRouter();
// const { getConfig } = useMeta();
const dataService = useDataService();
const grdExpected01Ref = ref(getComponentType('KwGrid'));
const grdExpected02Ref = ref(getComponentType('KwGrid'));
const grdExpected03Ref = ref(getComponentType('KwGrid'));
const totalCount01 = ref(0);
const totalCount02 = ref(0);
const totalCount03 = ref(0);
const isSearchMonth = ref(false);
const { getters } = useStore();
const { roles, departmentId } = getters['meta/getUserInfo'];
console.log(JSON.stringify(roles));
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/bond/rental-rsg-exp-mgts';

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD', // 판매유형코드
  'CLCTAM_DV_CD', // 집금구분코드
  'AUTH_RSG_EXCD_RSON_CD', // 직권해지제외사유코드
  'BND_CLCTN_PRP_DV_CD', // 채권추심속성구분코드
  'BND_CLCTN_PRP_RSON_CD', // 채권추심속성사유코드
);
const ynOpt = [
  { codeId: 'Y', codeName: 'Y' },
  { codeId: 'N', codeName: 'N' },
];
const sellTpCdOpt = codes.SELL_TP_CD.filter((v) => ['2', '6'].includes(v.codeId));
const clctamDvCdOpt = codes.CLCTAM_DV_CD.filter((v) => ['01', '02', '03', '04', '11'].includes(v.codeId));
const authRsgCdOpt = [
  { codeId: '01', codeName: t('MSG_TXT_NON_DTRM') },
  { codeId: '02', codeName: t('MSG_BTN_EXP_CNFM') },
  { codeId: '03', codeName: t('MSG_TXT_FNL_CNFM') },
];

const lastMonth = dayjs().add(-1, 'month');
const searchParams = ref({
  baseDt: `${lastMonth.format('YYYYMM')}${lastMonth.daysInMonth()}`,
  sellTpCd: '',
  clctamDvCd: '',
  clctamPrtnrNo: '',
  clctamPrtnrNm: '',
  prtnrNoYn: 'N',
  cntrNo: '',
  cntrSn: 0,
  cstNo: '',
  cstNoYn: 'N',
  authRsgCd: '01',
});

const isbndStrt = computed(() => departmentId === '70202'); // 사용자 === '채권전략팀'

// 검색 조회
let cachedParams;
const currentView = ref();
async function fetchData() {
  const { data } = await dataService.get(baseUrl, { params: { ...cachedParams } });

  if (cachedParams.authRsgCd === '01') {
    totalCount01.value = data?.length;
    currentView.value = grdExpected01Ref.value.getView();
  }
  if (cachedParams.authRsgCd === '02') {
    totalCount02.value = data?.length;
    currentView.value = grdExpected02Ref.value.getView();
  }
  if (cachedParams.authRsgCd === '03') {
    totalCount03.value = data?.length;
    currentView.value = grdExpected03Ref.value.getView();
  }

  currentView.value.getDataSource().setRows(data);
  // 2개월 전 대상 조회시 저장, 예정생성, 예정확정 버튼 disable
  isSearchMonth.value = dayjs().add(-1, 'month').format('YYYYMM') <= cachedParams.baseDt.substring(0, 6);
  currentView.value.columnByName('excdYn').readOnly = !isSearchMonth.value;
  currentView.value.columnByName('authRsgExcdRsonCd').readOnly = !isSearchMonth.value;
  currentView.value.commit();
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
// 저장
async function onClickSave() {
  if (searchParams.value.authRsgCd === '01') {
    currentView.value = grdExpected01Ref.value.getView();
  }
  if (searchParams.value.authRsgCd === '02') {
    currentView.value = grdExpected02Ref.value.getView();
  }
  if (searchParams.value.authRsgCd === '03') {
    currentView.value = grdExpected03Ref.value.getView();
  }

  if (await gridUtil.alertIfIsNotModified(currentView.value)) { return; }
  if (!await gridUtil.validate(currentView.value)) { return; }

  const checkedRows = gridUtil.getCheckedRowValues(currentView.value);

  if (checkedRows.length === 0) {
    await alert(t('MSG_ALT_NO_CHECK_DATA'));
    return false;
  }

  const changedRows = gridUtil.getCheckedRowValues(currentView.value, true);

  if (changedRows.length === 0) {
    await alert(t('MSG_ALT_NO_CHG_CNTN'));
    return false;
  }

  if (changedRows.some((item) => item.authRsgCnfmYn === 'Y')) {
    await alert(t('MSG_ALT_ICLD_CNFM_DTA'));
    return false;
  }

  const saveParams = changedRows.map((row) => ({
    baseYm: row.baseYm,
    excdYn: row.excdYn,
    authRsgExcdRsonCd: row.authRsgExcdRsonCd,
    cntrNo: row.cntrNo,
    cntrSn: row.cntrSn,
    rowState: row.rowState,
  }));

  await dataService.put(baseUrl, saveParams);

  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

async function onClickExcelDownload() {
  if (searchParams.value.authRsgCd === '01') {
    currentView.value = grdExpected01Ref.value.getView();
  }
  if (searchParams.value.authRsgCd === '02') {
    currentView.value = grdExpected02Ref.value.getView();
  }
  if (searchParams.value.authRsgCd === '03') {
    currentView.value = grdExpected03Ref.value.getView();
  }

  await gridUtil.exportView(currentView.value, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(currentView.value),
  });
}

// 엑셀 업로드
async function onClickExcelUpload() {
  const apiUrl = `${baseUrl}/excel-upload`;
  const templateId = 'FOM_BOND_AUTH_RSG';
  const extraData = {
    baseDt: cachedParams.baseDt,
    authRsgCd: cachedParams.authRsgCd,
  };
  const {
    payload,
  } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: {
      apiUrl,
      templateId,
      extraData,
    },
  });
  if (payload.status === 'S') {
    notify(t('MSG_ALT_SAVE_DATA'));
    await onClickSearch();
  }
}

// 예정생성
async function onClickExpectedCreate() {
  if (!await confirm(t('MSG_ALT_EXP_CRT'))) { return; }
  const params = {
    baseDt: cachedParams.baseDt,
  };
  await dataService.post(baseUrl, params);
  notify(t('MSG_ALT_COMPLETE_EXP_CREATE'));
  await onClickSearch();
}
// 예정확정
async function onClickExpectedConfirm() {
  if (!await confirm(t('MSG_ALT_EXP_CNFM'))) { return; }
  const params = {
    baseDt: cachedParams.baseDt,
    confirmDvCd: '01',
  };
  await dataService.put(`${baseUrl}/confirm`, params);
  notify(t('MSG_ALT_COMPLETE_EXP_CNFM'));
  await onClickSearch();
}

// 최종확정
async function onClickFinalConfirm() {
  if (!await confirm(t('MSG_ALT_FNL_CNFM'))) { return; }
  const { data } = await dataService.get(`${baseUrl}/sms-count`, { params: { baseDt: cachedParams.baseDt } });

  if (data === 0) {
    if (!await confirm(t('MSG_ALT_SMS_CHECK_FNL_CNFM'))) { return; }
  }
  const params = {
    baseDt: cachedParams.baseDt,
    confirmDvCd: '02',
  };
  await dataService.put(`${baseUrl}/confirm`, params);
  notify(t('MSG_ALT_COMPLETE_FNL_CNFM'));
  await onClickSearch();
}

const isNotExpected = computed(() => searchParams.value.authRsgCd === '01');
const isExpectedConfirm = computed(() => searchParams.value.authRsgCd === '02');
const isfinalConfirm = computed(() => searchParams.value.authRsgCd === '03');

// TODO: 룰 추가 예정 ( 현재 시스템 룰, 집금담당자, 'DUMMY' 적용 )
const isPsic = computed(() => roles.some((v) => ['ROL_00010', 'ROL_G7010', 'ROL_00000'].includes(v.roleId)));
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initCommonGrid(data, view) {
  const columns = [
    { fieldName: 'cntrNoSn', header: t('MSG_TXT_CNTR_DTL_NO'), width: '140', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'sellTpDtlNm', header: t('MSG_TXT_TASK_TYPE'), width: '100', styleName: 'text-center' }, // 업무유형
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' }, // 고객명
    { fieldName: 'excdYn',
      header: t('MSG_TXT_EXCD'),
      width: '100',
      styleName: 'text-center',
      editable: true,
      editor: { type: 'list' },
      options: ynOpt,
      styleCallback: (grid, dataCell) => {
        const ret = {};
        const { bndStrtYn } = grid.getValues(dataCell.index.itemIndex);
        //    최종확정 === false
        // && 수정가능기간 === true
        // && 채권전략팀여부 === 'N' || (채권전략팀여부 === 'Y' 면서 사용자 === '채권전략팀')
        if (!isfinalConfirm.value && isSearchMonth.value && (bndStrtYn === 'N' || (bndStrtYn === 'Y' && isbndStrt.value === true))) {
          ret.editable = true;
        } else {
          ret.editable = false;
        }
        return ret;
      },
    },
    { fieldName: 'authRsgExcdRsonCd',
      header: t('MSG_TXT_EXCD_RSON'),
      width: '160',
      styleName: 'text-center',
      editable: true,
      editor: { type: 'list' },
      options: codes.AUTH_RSG_EXCD_RSON_CD,
      styleCallback: (grid, dataCell) => {
        const ret = {};
        const { excdYn, bndStrtYn } = grid.getValues(dataCell.index.itemIndex);
        const rowState = gridUtil.getRowState(grid, dataCell.index.dataRow);
        //    제외여부 === 'Y'
        // && 최종확정 === false
        // && 수정가능기간 === true
        // && 채권전략팀여부 === 'N' || (채권전략팀여부 === 'Y' 면서 사용자 === '채권전략팀')
        if (excdYn === 'Y' && isSearchMonth.value && !isfinalConfirm.value && (bndStrtYn === 'N' || (bndStrtYn === 'Y' && isbndStrt.value === true))) {
          ret.editable = true;
        } else {
          ret.editable = false;
        }

        if (rowState === RowState.UPDATED && excdYn === 'N') {
          grid.setValue(dataCell.index.itemIndex, 'authRsgExcdRsonCd', '');
        }

        return ret;
      } }, // 제외 사유
    { fieldName: 'totNpdAmt', header: t('MSG_TXT_TOT_NPD_CHRAM'), width: '110', styleName: 'text-right', dataType: 'number' }, // 총미납금
    { fieldName: 'totMchnNpdAmt', header: t('MSG_TXT_TOT_NPD_CHRAM_COMBI_MCHN'), width: '140', styleName: 'text-right', dataType: 'number' }, // 총미납금(결합기기)
    { fieldName: 'lstmmOcptCs', header: t('MSG_TXT_LSTMM_OCPT_COST'), width: '110', styleName: 'text-right', dataType: 'number' }, // 전월점유비
    { fieldName: 'thmOcptCs', header: t('MSG_TXT_THM_OCPT_COST'), width: '110', styleName: 'text-right', dataType: 'number' }, // 당월점유비
    { fieldName: 'thmAdnSvUcAmt', header: t('MSG_TXT_THM_PRSRZT_PUMP'), width: '110', styleName: 'text-right', dataType: 'number' }, // 당월가압펌프
    { fieldName: 'rtrnDbtTotAmt', header: t('MSG_TXT_RTRN_H_TOT_ARRS_AMT'), width: '110', styleName: 'text-right', dataType: 'number' }, // 반환시총체납액
    { fieldName: 'nrtrnDbtTotAmt', header: t('MSG_TXT_N_RTRN_H_TOT_ARRS_AMT'), width: '140', styleName: 'text-right', dataType: 'number' }, // 미반환시총체납액
    { fieldName: 'rentalAmt', header: t('MSG_TXT_THM_RTLFE'), width: '110', styleName: 'text-right', dataType: 'number' }, // 당월 렌탈료
    { fieldName: 'rentalResBorAmt', header: t('MSG_TXT_BOR_RENTAL_RES'), width: '110', styleName: 'text-right', dataType: 'number' }, // 위약_렌탈잔여
    { fieldName: 'rentalRgstCostBorAmt', header: t('MSG_TXT_BOR_RGST_CS'), width: '110', styleName: 'text-right', dataType: 'number' }, // 위약_등록비
    { fieldName: 'dscCsBorAmt', header: t('MSG_TXT_BOR_DSC_AMT'), width: '110', styleName: 'text-right', dataType: 'number' }, // 위약_할인금액
    { fieldName: 'rstlBorAmt', header: t('MSG_TXT_BOR_RSTL'), width: '110', styleName: 'text-right', dataType: 'number' }, // 위약_재약정
    { fieldName: 'pointBorAmt', header: t('MSG_TXT_BOR_P'), width: '110', styleName: 'text-right', dataType: 'number' }, // 위약_포인트
    { fieldName: 'csmbCsBorAmt', header: t('MSG_TXT_CSMB_CS'), width: '110', styleName: 'text-right', dataType: 'number' }, // 소모품비
    { fieldName: 'reqdCsBorAmt', header: t('MSG_TXT_REQD_CS'), width: '110', styleName: 'text-right', dataType: 'number' }, // 철거비
    { fieldName: 'lsRntf', header: t('MSG_TXT_PD_LENT_LOST_LOG'), width: '110', styleName: 'text-right', dataType: 'number' }, // 분실손료
    { fieldName: 'rentalNmnN', header: t('MSG_TXT_RENTAL_NMN'), width: '100', styleName: 'text-center' }, // 렌탈차월
    { fieldName: 'bndClctnPrpDvCd', header: t('MSG_TXT_BND_PRP'), width: '100', styleName: 'text-center', options: codes.BND_CLCTN_PRP_DV_CD }, // 채권속성
    { fieldName: 'bndClctnPrpRsonCd', header: t('MSG_TXT_BND_PRP_RSON'), width: '100', styleName: 'text-center', options: codes.BND_CLCTN_PRP_RSON_CD }, // 채권속성/사유
    { fieldName: 'clctamPrtnrNo', header: t('MSG_TXT_CLCTAM_ICHR_EMPNO'), width: '100', styleName: 'text-center' }, // 집금담당사번
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_CLCTAM_PSIC'), width: '100', styleName: 'text-center' }, // 집금담당자
    { fieldName: 'clctamYn', header: t('MSG_TXT_CLCTAM_PSIC_YN'), width: '100', styleName: 'text-center' }, // 집금자여부
    { fieldName: 'rveAmt', header: t('MSG_TXT_DEPOSIT_AMT'), width: '110', styleName: 'text-right', dataType: 'number' }, // 입금액
    { fieldName: 'authRsgExcdRqrPrtnrNo', header: t('MSG_TXT_THM_EXCD_EMPNO'), width: '100', styleName: 'text-center' }, // 당월제외사번
    { fieldName: 'rqrBaseYm', header: t('MSG_TXT_FST_EXCD_MM'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM' }, // 최초제외월
    { fieldName: 'acuRveAmt', header: t('MSG_TXT_ACU_DP_AMOUNT'), width: '110', styleName: 'text-right', dataType: 'number' }, // 누적입금액
    { fieldName: 'bryyMmdd', header: t('MSG_TXT_BIRTH_DATE'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 생년월일
    { fieldName: 'cntrTpNm', header: t('MSG_TXT_CNTR_DV'), width: '100', styleName: 'text-center' }, // 계약구분
    { fieldName: 'pdCd', header: t('MSG_TXT_PROD_CD'), width: '100', styleName: 'text-center' }, // 제품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_GOODS_NM'), width: '140', styleName: 'text-center' }, // 제품명
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 설치일자
    { fieldName: 'cralTno', header: t('MSG_TXT_CNTRT_MPNO'), width: '140', styleName: 'text-center' }, // 계약자휴대전화번호
    { fieldName: 'ogCd', header: t('MSG_TXT_OG_CD'), width: '100', styleName: 'text-center' }, // 조직코드
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' }, // 번호
    { fieldName: 'plarKnm', header: t('MSG_TXT_PLAR'), width: '100', styleName: 'text-center' }, // 플래너
    { fieldName: 'canRedfYn', header: t('MSG_TXT_CAN_REDF_YN'), width: '140', styleName: 'text-center' }, // 취소되물림여부
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '100', styleName: 'text-center' }, // 연체개월
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-center' }, // 고객번호
    { fieldName: 'slStpYn', header: t('MSG_TXT_SL_STP'), width: '100', styleName: 'text-center' }, // 매출중지
    { fieldName: 'totNpdExpAmt', header: t('MSG_TXT_TOT_NPD_AMT_EXP'), width: '110', styleName: 'text-right', dataType: 'number' }, // 총미납금(예정)
    { fieldName: 'rtrnDbtExpAmt', header: t('MSG_TXT_RTRN_H_TOT_DBT_AMT_EXP'), width: '160', styleName: 'text-right', dataType: 'number' }, // 반환시총채무액(예정)
    { fieldName: 'nrtrnDbtExpAmt', header: t('MSG_TXT_N_RTRN_H_TOT_DBT_AMT_EXP'), width: '160', styleName: 'text-right', dataType: 'number' }, // 미반환시총채무액(예정)
    { fieldName: 'totNpdFnlAmt', header: t('MSG_TXT_TOT_NPD_CHRAM_FNL'), width: '110', styleName: 'text-right', dataType: 'number' }, // 총미납금(최종)
    { fieldName: 'rtrnDbtFnlAmt', header: t('MSG_TXT_RTRN_H_TOT_DBT_AMT_FNL'), width: '160', styleName: 'text-right', dataType: 'number' }, // 반환시총채무액(최종)
    { fieldName: 'nrtrnDbtFnlAmt', header: t('MSG_TXT_N_RTRN_H_TOT_DBT_AMT_FNL'), width: '160', styleName: 'text-right', dataType: 'number' }, // 미반환시총채무액(최종)
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push(
    { fieldName: 'baseYm' }, /* 기준년월 */
    { fieldName: 'cntrNo' }, /* 계약번호 */
    { fieldName: 'cntrSn' }, /* 계약일련번호 */
    { fieldName: 'authRsgExpYn' }, /* 직권해지예정여부 */
    { fieldName: 'authRsgCnfmYn' }, /* 직권해지확정여부 */
    { fieldName: 'bndStrtYn' }, /* 채권전략팀 여부 */
    { fieldName: 'rowState' }, /* rowState */
  );
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.onValidate = async (g, index) => {
    if (index.column === 'authRsgExcdRsonCd') {
      const { excdYn, authRsgExcdRsonCd } = g.getValues(index.itemIndex);
      if (excdYn === 'Y' && !authRsgExcdRsonCd) {
        return t('MSG_ALT_INPUT_EXCD_RSON'); // 제외 사유를 입력해주세요.
      }
    }
  };
}
const initExpected01Grid = defineGrid((data, view) => {
  initCommonGrid(data, view);
});
const initExpected02Grid = defineGrid((data, view) => {
  initCommonGrid(data, view);
});
const initExpected03Grid = defineGrid((data, view) => {
  initCommonGrid(data, view);
});

</script>

<style scoped>
</style>
