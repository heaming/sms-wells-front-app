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
    :modified-targets="['grdExpected']"
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
          :total-count="totalCount"
        />
      </template>
      <kw-btn
        dense
        grid-action
        :label="t('MSG_BTN_SAVE')"
        :disable="!isSearchMonth || isExpectedConfirm"
        @click="onClickSave"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="totalCount === 0"
        @click="onClickExcelDownload"
      />

      <kw-separator
        spaced
        vertical
        inset
      />

      <kw-btn
        icon="upload_on"
        dense
        secondary
        :label="t('MSG_TXT_EXCEL_UPLOAD')"
        @click="onClickExcelUpload"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <kw-btn
        dense
        secondary
        :label="t('MSG_BTN_EXP_CRT')"
        :disable="!isSearchMonth || isExpectedConfirm"
        @click="onClickExpectedCreate"
      />
      <kw-btn
        dense
        secondary
        :label="t('MSG_BTN_EXP_CNFM')"
        :disable="!isSearchMonth || isExpectedConfirm || !isPsic"
        @click="onClickExpectedConfirm"
      />
      <kw-btn
        dense
        secondary
        :label="t('MSG_BTN_CAN_MTR_RGST')"
        :disable="!isExpectedConfirm || !isPsic || isNotExpected"
        @click="onClickCancelRgst"
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
      ref="grdExpectedRef"
      :visible-rows="10"
      name="grdExpected"
      @init="initExpectedGrid"
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
const grdExpectedRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const isSearchMonth = ref(false);
const { getters } = useStore();
const { roles } = getters['meta/getUserInfo'];
console.log(JSON.stringify(roles));
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/bond/rental-rsg-exp-mgts';

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'CLCTAM_DV_CD',
  'AUTH_RSG_EXCD_RSON_CD',
  'BND_CLCTN_PRP_DV_CD',
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

// const isNotExpected = computed(() => searchParams.value.authRsgCd === '01');
// const isExpectedConfirm = computed(() => searchParams.value.authRsgCd === '02');
// const isfinalConfirm = computed(() => searchParams.value.authRsgCd === '03');
const isNotExpected = ref(true);
const isExpectedConfirm = ref(false);
const isfinalConfirm = ref(false);

// 검색 조회
let cachedParams;
async function fetchData() {
  const { data } = await dataService.get(baseUrl, { params: { ...cachedParams } });

  totalCount.value = data?.length;

  const view = grdExpectedRef.value.getView();

  view.getDataSource().setRows(data);
  // 2개월 전 대상 조회시 저장, 예정생성, 예정확정 버튼 disable
  isSearchMonth.value = dayjs().add(-1, 'month').format('YYYYMM') <= cachedParams.baseDt.substring(0, 6);
  view.columnByName('excdYn').readOnly = !isSearchMonth.value;
  view.columnByName('authRsgExcdRsonCd').readOnly = !isSearchMonth.value;
  view.commit();

  if (cachedParams.authRsgCd === '01') {
    isNotExpected.value = true;
    isExpectedConfirm.value = false;
    isfinalConfirm.value = false;
  }
  if (cachedParams.authRsgCd === '02') {
    isNotExpected.value = false;
    isExpectedConfirm.value = true;
    isfinalConfirm.value = false;
  }
  if (cachedParams.authRsgCd === '03') {
    isNotExpected.value = false;
    isExpectedConfirm.value = false;
    isfinalConfirm.value = true;
  }
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
  const view = grdExpectedRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  if (changedRows.every((item) => (
    item.authRsgExpYn === 'Y' && item.authRsgCnfmYn === 'Y')
    || (item.authRsgExpYn === 'Y' && item.authRsgCnfmYn === 'N')
    || (item.authRsgExpYn === 'N' && item.authRsgCnfmYn === 'Y'))) {
    await alert(t('MSG_ALT_NOT_EXP_CNFM_DTA'));
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
  const view = grdExpectedRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

// 엑셀 업로드
// TODO: 설계 전
async function onClickExcelUpload() {
  await alert('설계중');
  // const apiUrl = `${baseUrl}/excel-upload`;
  // const templateId = 'T';
  // const {
  //   payload,
  // } = await modal({
  //   component: 'ZwcmzExcelUploadP',
  //   componentProps: {
  //     apiUrl,
  //     templateId,
  //   },
  // });
  // if (payload.status === 'S') {
  //   notify(t('MSG_ALT_SAVE_DATA'));
  //   await onClickSearch();
  // }
}

// 예정생성
async function onClickExpectedCreate() {
  if (!await confirm(t('MSG_ALT_EXP_CRT'))) { return; }
  const params = {
    baseDt: searchParams.value.baseDt,
  };
  await dataService.post(baseUrl, params);
  notify(t('MSG_ALT_COMPLETE_EXP_CREATE'));
  await onClickSearch();
}
// 예정확정
async function onClickExpectedConfirm() {
  if (!await confirm(t('MSG_ALT_EXP_CNFM'))) { return; }
  const params = {
    baseDt: searchParams.value.baseDt,
    confirmDvCd: '01',
  };
  await dataService.put(`${baseUrl}/confirm`, params);
  notify(t('MSG_ALT_COMPLETE_EXP_CREATE'));
  await onClickSearch();
}
// 취소자료 등록
// TODO: 설계 전
async function onClickCancelRgst() {
  await alert('설계중');
  // if (!await confirm(t('MSG_ALT_RGST_CAN_MTR'))) { return; }
  // await dataService.put(`${baseUrl}/cancel`, { });
  // notify(t('MSG_ALT_COMPLETE_CAN_MTR'));
  // await onClickSearch();
}
// 최종확정
async function onClickFinalConfirm() {
  if (!await confirm(t('MSG_ALT_FNL_CNFM'))) { return; }
  const params = {
    baseDt: searchParams.value.baseDt,
    confirmDvCd: '02',
  };
  await dataService.put(`${baseUrl}/confirm`, params);
  notify(t('MSG_ALT_COMPLETE_FNL_CNFM'));
  await onClickSearch();
}

// TODO: 룰 추가 예정 ( 현재 시스템 룰, 집금담당자, 'DUMMY' 적용 )
const isPsic = computed(() => roles.some((v) => ['ROL_00010', 'ROL_G7010', 'ROL_00000'].includes(v.roleId)));
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initExpectedGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'cntrNoSn', header: t('MSG_TXT_CNTR_DTL_NO'), width: '140', styleName: 'text-center' },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_TASK_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
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
        if (!isfinalConfirm.value && isSearchMonth.value && bndStrtYn === 'N') {
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
        if (excdYn === 'Y' && isSearchMonth.value && !isfinalConfirm.value && bndStrtYn === 'N') {
          ret.editable = true;
        } else {
          ret.editable = false;
        }

        if (rowState === RowState.UPDATED && excdYn === 'N') {
          grid.setValue(dataCell.index.itemIndex, 'authRsgExcdRsonCd', '');
        }

        return ret;
      } },
    { fieldName: 'totNpdAmt', header: t('MSG_TXT_TOT_NPD_CHRAM'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'totMchnNpdAmt', header: t('MSG_TXT_TOT_NPD_CHRAM_COMBI_MCHN'), width: '140', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'lstmmOcptCs', header: t('MSG_TXT_LSTMM_OCPT_COST'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmOcptCs', header: t('MSG_TXT_THM_OCPT_COST'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'thmAdnSvUcAmt', header: t('MSG_TXT_THM_PRSRZT_PUMP'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'rtrnDbtTotAmt', header: t('MSG_TXT_RTRN_H_TOT_ARRS_AMT'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'nrtrnDbtTotAmt', header: t('MSG_TXT_N_RTRN_H_TOT_ARRS_AMT'), width: '140', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'rentalAmt', header: t('MSG_TXT_THM_RTLFE'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'rentalResBorAmt', header: t('MSG_TXT_BOR_RENTAL_RES'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'rentalRgstCostBorAmt', header: t('MSG_TXT_BOR_RGST_CS'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'dscCsBorAmt', header: t('MSG_TXT_BOR_DSC_AMT'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'rstlBorAmt', header: t('MSG_TXT_BOR_RSTL'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'pointBorAmt', header: t('MSG_TXT_BOR_P'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'csmbCsBorAmt', header: t('MSG_TXT_CSMB_CS'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'reqdCsBorAmt', header: t('MSG_TXT_REQD_CS'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'lsRntf', header: t('MSG_TXT_PD_LENT_LOST_LOG'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'rentalNmnN', header: t('MSG_TXT_RENTAL_NMN'), width: '100', styleName: 'text-center' },
    { fieldName: 'bndClctnPrpDvCd', header: t('MSG_TXT_BND_PRP'), width: '100', styleName: 'text-center', options: codes.BND_CLCTN_PRP_DV_CD },
    // rev:230410 header 텍스트 변경
    { fieldName: 'clctamPrtnrNo', header: t('MSG_TXT_CLCTAM_ICHR_EMPNO'), width: '100', styleName: 'text-center' },
    // // rev:230410 header 텍스트 변경
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_CLCTAM_PSIC'), width: '100', styleName: 'text-center' },
    { fieldName: 'clctamYn', header: t('MSG_TXT_CLCTAM_PSIC_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'rveAmt', header: t('MSG_TXT_DEPOSIT_AMT'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'authRsgExcdRqrPrtnrNo', header: t('MSG_TXT_THM_EXCD_EMPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'rqrBaseYm', header: t('MSG_TXT_FST_EXCD_MM'), width: '100', styleName: 'text-center', datetimeFormat: 'YYYY-MM' },
    { fieldName: 'acuRveAmt', header: t('MSG_TXT_ACU_DP_AMOUNT'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'bryyMmdd', header: t('MSG_TXT_BIRTH_DATE'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cntrTpNm', header: t('MSG_TXT_CNTR_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_PROD_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_GOODS_NM'), width: '140', styleName: 'text-center' },
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cralTno', header: t('MSG_TXT_CNTRT_MPNO'), width: '140', styleName: 'text-center' },
    { fieldName: 'ogCd', header: t('MSG_TXT_OG_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'plarKnm', header: t('MSG_TXT_PLAR'), width: '100', styleName: 'text-center' },
    { fieldName: 'canRedfYn', header: t('MSG_TXT_CAN_REDF_YN'), width: '140', styleName: 'text-center' },
    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCNT'), width: '100', styleName: 'text-center' },
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'slStpYn', header: t('MSG_TXT_SL_STP'), width: '100', styleName: 'text-center' },
    { fieldName: 'totNpdExpAmt', header: t('MSG_TXT_TOT_NPD_AMT_EXP'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'rtrnDbtExpAmt', header: t('MSG_TXT_RTRN_H_TOT_DBT_AMT_EXP'), width: '160', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'nrtrnDbtExpAmt', header: t('MSG_TXT_N_RTRN_H_TOT_DBT_AMT_EXP'), width: '160', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'totNpdFnlAmt', header: t('MSG_TXT_TOT_NPD_CHRAM_FNL'), width: '110', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'rtrnDbtFnlAmt', header: t('MSG_TXT_RTRN_H_TOT_DBT_AMT_FNL'), width: '160', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'nrtrnDbtFnlAmt', header: t('MSG_TXT_N_RTRN_H_TOT_DBT_AMT_FNL'), width: '160', styleName: 'text-right', dataType: 'number' },
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
});
</script>

<style scoped>
</style>
