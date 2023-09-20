<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbOrderBulkChangeMgtMMembership - 주문일괄변경 관리(멤버십) 화면
3. 작성자 : JSY
4. 작성일 : 2023.05.23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 주문일괄변경 관리(멤버십) 화면
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="2"
    one-row
    :modified-targets="['grdMembershipBilkChangeList']"
    @search="onClickSearch"
  >
    <kw-search-row>
      <!-- 계약번호 -->
      <kw-search-item :label="$t('MSG_TXT_CNTR_NO')">
        <zctz-contract-detail-number
          v-model:cntr-no="searchParams.cntrNo"
          v-model:cntr-sn="searchParams.cntrSn"
        />
      </kw-search-item>
      <!-- 반영일 -->
      <kw-search-item :label="$t('MSG_TXT_RFLCTN_DT')">
        <kw-date-picker v-model="searchParams.rfdt" />
      </kw-search-item>
    </kw-search-row>
  </kw-search>

  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          @change="fetchData"
        />
        <!-- (단위: 원, 건, 개월) -->
        <span class="ml8">({{ $t('MSG_TXT_UNIT') }}:
          {{ $t('MSG_TXT_CUR_WON') }}, {{ $t('MSG_TXT_CNT') }}, {{ $t('MSG_TXT_MCNT') }})
        </span>
      </template>
      <!-- 일괄변경 등록 -->
      <kw-btn
        v-permission:create
        :label="$t('MSG_TXT_BTCH_CHNG_REG')"
        primary
        dense
        @click="onClickOpenChngReg"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMembershipBilkChangeList"
      name="grdMembershipBilkChangeList"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initMembershipBilkChangeList"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, gridUtil, useMeta, getComponentType, defineGrid, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const grdMembershipBilkChangeList = ref(getComponentType('KwGrid'));
const { t } = useI18n();
const now = dayjs();
const dataService = useDataService();
const { getConfig } = useMeta();
const { modal } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const searchParams = ref({
  cntrNo: '',
  cntrSn: '',
  rfdt: now.format('YYYYMMDD'),
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;

async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/changeorder/membership-bulk-change', { params: cachedParams });

  const view = grdMembershipBilkChangeList.value.getView();
  const dataSource = view.getDataSource();
  dataSource.setRows(res.data);
  pageInfo.value.totalCount = view.getItemCount();

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickOpenChngReg() {
  const { result } = await modal({
    component: 'WwctbMembershipBulkChangeMgtP',
    // componentProps: { apiUrl, templateId, extraData },
  });
  if (result) {
    await onClickSearch();
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initMembershipBilkChangeList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'cstKnm' },
    { fieldName: 'sellInflwChnlDtlCd' },
    { fieldName: 'sellTpDtlCd' },
    { fieldName: 'sellPrtnrNo' },
    { fieldName: 'prtnrNm' },
    { fieldName: 'rveCd' },
    { fieldName: 'reqdDt' },
    { fieldName: 'cntrChRcpDtm' },
    { fieldName: 'istDt' },
    { fieldName: 'cntrStlmFshDtm' },
    { fieldName: 'svPrd' },
    { fieldName: 'useyn' },
    { fieldName: 'basePdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'fnlAmt', dataType: 'number' },
    { fieldName: 'stlmTpCd' },
    { fieldName: 'frisuBfsvcPtrmN' },
    { fieldName: 'cntrwTpCd' },
    { fieldName: 'stplPtrm' },
    { fieldName: 'cntrCnfmAprDtm' },
    { fieldName: 'canDt' },
    { fieldName: 'duedt' },
    { fieldName: 'cntrCnfmDtm' },
    { fieldName: 'wdwalDt' },
    { fieldName: 'vstPrd' },
    { fieldName: 'cttRsNm' },
    { fieldName: 'cttPsicId' },
    { fieldName: 'cttPsicNm' },
    { fieldName: 'hcrDvCd' },
    { fieldName: 'feeFxamYn' },
    { fieldName: 'feeAckmtBaseAmt', dataType: 'number' },
    { fieldName: 'sellDscDvCd' },
    { fieldName: 'sellDscrCd' },
    { fieldName: 'grpGbn' },
    { fieldName: 'fstRgstDtm' },
    { fieldName: 'fstRgstUsrId' },
    { fieldName: 'fstRgstUsrNm' },
    { fieldName: 'fnlMdfcDtm' },
    { fieldName: 'fnlMdfcUsrId' },
    { fieldName: 'fnlMdfcUsrNm' },
    { fieldName: 'cntrChAkCn' },
  ];

  const columns = [
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_NO'), width: '152', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '117', styleName: 'text-center' }, // 계약자명
    { fieldName: 'sellInflwChnlDtlCd', header: t('MSG_TXT_SLS_CAT'), width: '117', styleName: 'text-center' }, // 판매구분
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SEL_TYPE'), width: '117', styleName: 'text-center' }, // 판매유형
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_PTNR_CD'), width: '117', styleName: 'text-center' }, // 피트너코드
    { fieldName: 'prtnrNm', header: t('MSG_TXT_PTNR_NAME'), width: '117', styleName: 'text-center' }, // 파트너명
    { fieldName: 'rveCd', header: t('MSG_TXT_RVE_CD'), width: '117', styleName: 'text-center' }, // 수납코드
    { fieldName: 'reqdDt', header: `KIWI${t('MSG_TXT_REQD_D')}`, width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // KIWI철거일
    { fieldName: 'cntrChRcpDtm', header: t('MSG_TXT_RCP_D'), width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // 접수일
    { fieldName: 'istDt', header: t('MSG_TXT_INST_DT'), width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // 설치일
    { fieldName: 'cntrStlmFshDtm', header: t('MSG_TXT_DT_OF_SALE'), width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // 매출일
    { fieldName: 'svPrd', header: t('MSG_TXT_BS_CYC'), width: '117', styleName: 'text-center' }, // BS주기
    { fieldName: 'useyn', header: t('MSG_TXT_USWY_DV'), width: '117', styleName: 'text-center' }, // 용도구분
    { fieldName: 'basePdCd', header: t('TXT_MSG_PD_CD'), width: '117', styleName: 'text-center' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '224', styleName: 'text-left' }, // 상품명

    { fieldName: 'fnlAmt', header: t('MSG_TXT_MEM_DUES'), width: '117', numberFormat: '#,##0', styleName: 'text-right' }, // 멤버십회비
    { fieldName: 'stlmTpCd', header: t('MSG_TXT_PY_MTHD'), width: '117', styleName: 'text-center' }, // 납입방법
    { fieldName: 'frisuBfsvcPtrmN', header: t('MSG_TXT_MEM_FEE'), width: '117', styleName: 'text-center' }, // 멤버십무상
    { fieldName: 'cntrwTpCd', header: t('MSG_TXT_MSH_DV'), width: '117', styleName: 'text-center' }, // 멤버십구분
    { fieldName: 'stplPtrm', header: t('MSG_TXT_MEM_PRD'), width: '117', styleName: 'text-center' }, // 멤버십기간
    { fieldName: 'cntrCnfmAprDtm', header: t('MSG_TXT_DTRM_DATE'), width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // 확정일
    { fieldName: 'canDt', header: t('MSG_TXT_CAN_D'), width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // 취소일
    { fieldName: 'duedt', header: t('MSG_TXT_DUEDT'), width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // 예정일
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_SUBS_DT'), width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // 가입일
    { fieldName: 'wdwalDt', header: t('MSG_TXT_WTDR_DT'), width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // 탈퇴일
    { fieldName: 'vstPrd', header: t('MSG_TXT_VST_PRD'), width: '117', styleName: 'text-center' }, // 방문주기
    { fieldName: 'cttRsNm', header: t('MSG_TXT_CTT_CD_NM'), width: '117', styleName: 'text-center' }, // 컨택코드명
    { fieldName: 'cttPsicNm', header: t('MSG_TXT_CTT_ICHR'), width: '117', styleName: 'text-center' }, // 컨택담당
    { fieldName: 'hcrDvCd', header: t('MSG_TXT_PRDT_GUBUN'), width: '117', styleName: 'text-center' }, // 상품구분

    { fieldName: 'feeFxamYn', header: t('MSG_TXT_FXAM_YN'), width: '117', styleName: 'text-center' }, // 정액여부
    { fieldName: 'feeAckmtBaseAmt', header: t('MSG_TXT_PD_STD_FEE'), width: '117', numberFormat: '#,##0', styleName: 'text-center' }, // 기준수수료
    { fieldName: 'sellDscDvCd', header: t('MSG_TXT_PD_DC_CLASS'), width: '117', styleName: 'text-center' }, // 할인구분
    { fieldName: 'sellDscrCd', header: t('TXT_MSG_DSC_TP'), width: '117', styleName: 'text-center' }, // 할인유형
    { fieldName: 'grpGbn', header: t('MSG_TXT_GRP_DV'), width: '117', styleName: 'text-center' }, // 그룹구분
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT'), width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // 등록일
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_RGST_USR'), width: '117', styleName: 'text-center' }, // 등록자
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '117', styleName: 'text-center', datetimeFormat: 'date' }, // 최종수정일
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '117', styleName: 'text-center' }, // 최종수정자
    { fieldName: 'cntrChAkCn', header: t('MSG_TXT_CH_RSON'), width: '264', styleName: 'text-left' }, // 변경사유
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
