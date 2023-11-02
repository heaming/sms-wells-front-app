<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID : WwbncRentalResignExpectedMgtMResign ( W-BN-U-0128M03 ) - 직권해지관리 - 정기배송해지
3. 작성자 : gilyong.han
4. 작성일 : 2023.07.18
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-  Wells 직권해지 전 예정고객의 전체를관리하고, 직권해지를 방어하기 위한 화면
****************************************************************************************************
--->
<template>
  <kw-search
    :modified-targets="['grdResign']"
    @search="onClickSearch"
    @reset="onChangePrtnrNo"
  >
    <kw-search-row>
      <kw-search-item
        :label="t('MSG_TXT_BASE_YM')"
        required
      >
        <kw-date-picker
          v-model="searchParams.authRsgDt"
          :label="t('MSG_TXT_BASE_YM')"
          type="month"
          rules="required"
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
  </kw-search>
  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="totalCount"
        />
        <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
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
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        v-permission:create
        :label="$t('MSG_TXT_FNL_CNFM')"
        primary
        dense
        :disable="!isPsic"
        @click="onClickFinalConfirm"
      />
    </kw-action-top>
    <kw-grid
      ref="grdResignRef"
      :visible-rows="10"
      name="grdResign"
      @init="initResignGrid"
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

const {
  notify,
  modal,
  confirm,
  alert,
} = useGlobal();
const { t } = useI18n();
// const { getConfig } = useMeta();
const dataService = useDataService();
const grdResignRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const { getters } = useStore();
const { roles } = getters['meta/getUserInfo'];

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/bond/regular-shipping-resigns';

const codes = await codeUtil.getMultiCodes(
  'CLCTAM_DV_CD',
);
const clctamDvCdOpt = codes.CLCTAM_DV_CD.filter((v) => ['01', '02', '03', '04', '11'].includes(v.codeId));

const searchParams = ref({
  authRsgDt: dayjs().format('YYYYMM'),
  clctamDvCd: '',
  clctamPrtnrNo: '',
  clctamPrtnrNm: '',
  prtnrNoYn: 'N',
});

// 검색 조회
let cachedParams;
async function fetchData() {
  const { data } = await dataService.get(baseUrl, { params: { ...cachedParams } });

  totalCount.value = data?.length;

  const view = grdResignRef.value.getView();

  view.getDataSource().setRows(data);
}

async function onClickSearch() {
  const { clctamPrtnrNm, prtnrNoYn } = searchParams.value;
  if (!isEmpty(clctamPrtnrNm) && prtnrNoYn === 'N') {
    notify(t('MSG_ALT_PLZ_USE_CLCTAM_PSIC_POPUP'));
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
// 파트너번호 변경
async function onChangePrtnrNo() {
  searchParams.value.prtnrNoYn = 'N';
  searchParams.value.clctamPrtnrNo = '';
}

const { currentRoute } = useRouter();
async function onClickExcelDownload() {
  const view = grdResignRef.value.getView();
  if (await gridUtil.isModified(view)) { await notify(t('MSG_TXT_NEED_SAVE_EXCEL_DOWNLOAD')); return; }

  await gridUtil.exportView(view, {
    exportData: gridUtil.getAllRowValues(view),
    fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TIT_RGLR_SPP_RSG')}`,
    timePostfix: true,
    indicator: 'hidden',
    checkBar: 'hidden',
  });
}

// 최종확정
async function onClickFinalConfirm() {
  const view = grdResignRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return false;
  }

  if (!await confirm(t('MSG_ALT_FNL_CNFM'))) { return; } // 최종확정하시겠습니까?
  if (!checkedRows.every((item) => (item.authRsgCnfmYn === 'N'))) {
    await alert(t('MSG_ALT_ALREADY_FNL_CNFM_AUTH_RSG_DTA')); // 직권해지 된 건은 이미 최종확정 처리된 건입니다.
    return false;
  }

  const saveParams = checkedRows.map((row) => ({
    baseYm: row.baseYm,
    cntrNo: row.cntrNo,
    cntrSn: row.cntrSn,
  }));

  await dataService.put(baseUrl, saveParams);
  notify(t('MSG_ALT_COMPLETE_FNL_CNFM'));

  await onClickSearch();
}
// TODO: 룰 추가 예정 ( 현재 시스템 룰, 집금담당자, 'DUMMY' 적용 ), wells 단기파트장 role
const isPsic = computed(() => roles.some((v) => ['ROL_00010', 'ROL_G7010', 'ROL_00000'].includes(v.roleId)));
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initResignGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'authRsgSts', header: t('MSG_TXT_RSG_STAT'), width: '100', styleName: 'text-center' }, // 해지상태
    { fieldName: 'cntrNoSn', header: t('MSG_TXT_CNTR_DTL_NO'), width: '140', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' }, // 고객명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PKG_NO'), width: '100', styleName: 'text-center' }, // 패키지번호
    { fieldName: 'pdNm', header: t('MSG_TXT_PKG_NM'), width: '180' }, // 패키지명

    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PLAR'), width: '100', styleName: 'text-center' }, // 플래너
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' }, // 플래너(판매자)번호
    { fieldName: 'ogCd', header: t('MSG_TXT_OG_CD'), width: '100', styleName: 'text-center' }, // 조직코드
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '110', styleName: 'text-center', datetimeFormat: 'date' }, // 매출일자
    { fieldName: 'sellAmt', header: t('MSG_TXT_SALE_PRICE'), width: '110', styleName: 'text-right', dataType: 'number' }, // 판매금액

    { fieldName: 'dlqMcn', header: t('MSG_TXT_DLQ_MCN'), width: '100', dataType: 'number' }, // 연체개월수
    { fieldName: 'ucAmt', header: t('MSG_TXT_UC_AMT'), width: '110', styleName: 'text-right', dataType: 'number' }, // 미수금액
    { fieldName: 'dlqAmt', header: t('MSG_TXT_DLQ_AMT'), width: '110', styleName: 'text-right', dataType: 'number' }, // 연체금액
    { fieldName: 'totRveAmt', header: t('MSG_TXT_DP_AGG'), width: '110', styleName: 'text-right', dataType: 'number' }, // 입금 누계
    { fieldName: 'clctamPrtnrNm', header: t('MSG_TXT_CLCTAM_PSIC'), width: '100', styleName: 'text-center' }, // 집금담당자

    { fieldName: 'clctamPrtnrNo', header: t('MSG_TXT_CLCTAM_ICHR_EMPNO'), width: '100', styleName: 'text-center' }, // 집금담당사번
    { fieldName: 'errCn', header: t('MSG_TXT_ERR_CN'), width: '180' }, // 에러내용
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push(
    { fieldName: 'baseYm' }, // 기준년월
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'authRsgCnfmYn' }, // 직권해지확정여부
  );
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});
</script>

<style scoped>
</style>
