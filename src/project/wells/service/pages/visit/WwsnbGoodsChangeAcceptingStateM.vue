<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB (설치관리)
2. 프로그램 ID : WwsnbGoodsChangeAcceptingStateM - 제품교체 접수 현황(K-W-SV-U-0061M01)
3. 작성자 : leeminwoo
4. 작성일 : 2023-08-23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 출고집계현황 http://localhost:3000/#/service/wsnb-goods-change-accepting-state
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :colspan="2"
          :label="$t('MSG_TXT_INQR_BASE')"
        >
          <kw-select
            v-model="searchParams.inqrBaseCd"
            :label="$t('MSG_TXT_INQR_BASE')"
            :options="[
              { codeId: 'vstCnfmDt', codeName: t('MSG_TXT_VST_CNFM_D' /*방문확정일*/) },
              { codeId: 'wrteDt', codeName: t('MSG_TXT_WRTE_DT' /*작성일자*/) },
              { codeId: 'schdDt', codeName: t('MSG_TXT_SCHD_DT' /*예정일자*/) },
              { codeId: 'prcsDt', codeName: t('MSG_TXT_PRCSDT' /*처리일자*/) },
            ]"
            rules="required"
          />
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            class="ml8"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item
          :colspan="1"
          :label="$t('MSG_TXT_SV_CNR' /*서비스센터*/)"
        >
          <kw-select
            v-model="searchParams.ogId"
            :options="servierCenterOrg"
            first-option="all"
            option-label="ogNm"
            option-value="ogId"
          />
        </kw-search-item>
        <kw-search-item
          :colspan="1"
          :label="$t('MSG_TXT_EGER' /*엔지니어*/)"
        >
          <kw-select
            v-model="searchParams.prtnrNo"
            :options="prtNrs"
            option-label="prtnrNm"
            option-value="prtnrNo"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('상태')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.aprAkStatCd"
            :options="tempOptions.aprAkStatCd"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('유형변경여부')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.tpChYn"
            :options="tempOptions.tpChYn"
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
            @change="fetchData"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_RJT')"
          secondary
          dense
          @click="onClickReject()"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_APPR')"
          primary
          dense
          @click="onClickApprove()"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { getComponentType, defineGrid, gridUtil, useDataService, useGlobal, codeUtil, useMeta, confirm } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import useSnCode from '~sms-wells/service/composables/useSnCode';

const { getServiceCenterOrgs, getServiceCenterPrtnr } = useSnCode();

const { getConfig } = useMeta();

const router = useRouter();
const dataService = useDataService();

const { notify, alert } = useGlobal();
const { t } = useI18n();
const { currentRoute } = useRouter();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/goods-change-accepting-state';

const grdMainRef = ref(getComponentType('KwGrid'));

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'SV_DV_CD',
  'SELL_TP_CD',
);

const tempOptions = {
  aprAkStatCd: [
    { codeId: '01', codeName: t('MSG_TXT_AK') }, // 요청
    { codeId: '02', codeName: t('MSG_TXT_CANCEL') }, // 취소
    { codeId: '03', codeName: t('MSG_TXT_APPR') }, // 승인
    { codeId: '04', codeName: t('MSG_BTN_RJT') }, // 반려
  ],
  tpChYn: [
    { codeId: 'Y', codeName: t('Y') }, // 사용
    { codeId: 'N', codeName: t('N') }, // 미사용
  ],
  pdctChngAkRsonCd: [ // 제품교체요청사유코드
    { codeId: 'A01', codeName: t('14일이내') }, // 14일이내
    { codeId: 'A02', codeName: t('잦은AS') }, // 잦은AS
    { codeId: 'A03', codeName: t('수리불가') }, // 수리불가
    { codeId: 'A04', codeName: t('고객클레임') }, // 고객클레임
    { codeId: 'A05', codeName: t('부품수급안됨') }, // 부품수급안됨
    { codeId: 'A06', codeName: t('기타(협조전)') }, // 기타(협조전)
  ],
  recapOrFreeYnCd: [
    { codeId: '1', codeName: t('MSG_TXT_RECAP') }, // 유상
    { codeId: '2', codeName: t('MSG_TXT_FREE') }, // 무상
  ],
};

const searchParams = ref({
  inqrBaseCd: 'schdDt',
  startDt: '',
  endDt: now.format('YYYYMMDD'),
  svCnrCd: '',
  ogId: '',
  prtnrNo: '',
  aprAkStatCd: '',
  tpChYn: '',
});

let cachedParams;

searchParams.value.startDt = dayjs().set('date', 1).format('YYYYMMDD');
const prtNrs = ref();

const servierCenterOrg = await getServiceCenterOrgs();

watch(() => [searchParams.value.ogId], async () => {
  prtNrs.value = await getServiceCenterPrtnr(searchParams.value.ogId);
  searchParams.value.prtnrNo = '';
}, { immediate: true });

async function fetchData() {
  const res = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: items, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(items);

  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const response = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.list,
  });
}
// 반려
async function onClickReject() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
  } else if (await gridUtil.validate(view, { isCheckedOnly: true })) {
    if (!await confirm(t('MSG_ALT_BAT_RJT_PRGS'))) { return; }
    const response = await dataService.post(`${baseUrl}`, chkRows);
    if (response.data.processCount > 0) {
      alert(t('MSG_ALT_REJECT_DATA'));
    }
    await fetchData();
  }
}

// 승인 - AS 배정 내역 업데이트
async function onClickApprove() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
  } else if (await gridUtil.validate(view, { isCheckedOnly: true })) {
    if (!await confirm(t('MSG_ALT_APPR'))) { return; }
    const response = await dataService.post(`${baseUrl}/approve`, chkRows);
    if (response.data.processCount > 0) {
      alert(t('MSG_ALT_APPROVED'));
    }
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'aprAkStatCd' },
    { fieldName: 'tpChYn' },
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'custNm' },
    { fieldName: 'custDiv' },
    { fieldName: 'sapMatCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'istDt' },
    { fieldName: 'changeRqstDt' },
    { fieldName: 'useDt' },
    { fieldName: 'pdctChngAkRsonCd' },
    { fieldName: 'schdDt' },
    { fieldName: 'recapOrFreeYn' },
    { fieldName: 'loc' },
    { fieldName: 'phn' },
    { fieldName: 'caus' },
    { fieldName: 'egerOpinion' },
    { fieldName: 'dratDtm' },
    { fieldName: 'docCrtrBlg' },
    { fieldName: 'docCrtrSbn' },
    { fieldName: 'docCrtrNm' },
    { fieldName: 'adminOpinion' },
    { fieldName: 'opinionDratDtm' },
    { fieldName: 'adminSbn' },
    { fieldName: 'adminNm' },
    { fieldName: 'procsRs' },
    { fieldName: 'vstCnfmDt' },
    { fieldName: 'procsDt' },
    { fieldName: 'procsrBlg' },
    { fieldName: 'procsrSbn' },
    { fieldName: 'procsrNm' },
    { fieldName: 'cstSvAsnNo' },
    { fieldName: 'oldSvBizDclsfCd' },
    { fieldName: 'newSvBizDclsfCd' },
  ];

  const columns = [
    { fieldName: 'aprAkStatCd', header: t('MSG_TXT_STT'), width: '50', styleName: 'text-center', options: tempOptions.aprAkStatCd, editable: false }, // 상태
    { fieldName: 'tpChYn', header: t('MSG_TXT_TYPE_CH_YN'), width: '100', styleName: 'text-center', editable: false }, // 유형변경여부
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '140', styleName: 'text-center rg-button-link', renderer: { type: 'button' }, editable: false }, // 계약상세번호
    { fieldName: 'custNm', header: t('MSG_TXT_CST_NM'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'custDiv', header: t('MSG_TXT_CST_DV'), width: '120', styleName: 'text-center', options: codes.SELL_TP_CD, editable: false },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '180', styleName: 'text-center', editable: false },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '120', styleName: 'text-center', editable: false },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '180', styleName: 'text-center', editable: false },
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd', editable: false },
    { fieldName: 'changeRqstDt', header: t('MSG_TXT_CHANGE_AK_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd', editable: false }, // 교체요청일자
    { fieldName: 'useDt', header: t('MSG_TXT_USE_DAY'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'pdctChngAkRsonCd', header: t('MSG_TXT_CHANGE_AK_RSN'), width: '100', styleName: 'text-center', options: tempOptions.pdctChngAkRsonCd, editable: false }, // 교체요청사유
    { fieldName: 'schdDt', header: t('MSG_TXT_SCHD_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd', editable: false },
    { fieldName: 'recapOrFreeYn', header: t('MSG_TXT_RECAP_OR_FREE'), width: '60', styleName: 'text-center', options: tempOptions.recapOrFreeYnCd, editable: false }, // 유무상
    { fieldName: 'loc', header: t('MSG_TXT_LCT'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'phn', header: t('MSG_TXT_PHN'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'caus', header: t('MSG_TXT_CAUS'), width: '180', styleName: 'text-center', editable: false },
    { fieldName: 'egerOpinion', header: t('MSG_TXT_EGER_OPINION'), width: '250', styleName: 'text-left', editable: false },
    { fieldName: 'dratDtm', header: t('MSG_TXT_DRAT_DTM'), width: '180', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd mm:hh:ss', editable: false },
    { fieldName: 'docCrtrBlg', header: t('MSG_TXT_DOC_CRTR_BLG'), width: '150', styleName: 'text-center', editable: false },
    { fieldName: 'docCrtrSbn', header: t('MSG_TXT_DOC_CRTR_SBN'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'docCrtrNm', header: t('MSG_TXT_DOC_CRTR'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'adminOpinion', header: t('MSG_TXT_MNGR_OPINION'), width: '250', styleName: 'text-left', editable: true }, // 관리자소견
    { fieldName: 'opinionDratDtm', header: t('MSG_TXT_OPINION_DRAT_DTM'), width: '180', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd mm:hh:ss', editable: false }, // 소견작성일시
    { fieldName: 'adminSbn', header: t('MSG_TXT_ADMIN_SBN'), width: '80', styleName: 'text-center', editable: false }, // 관리자사번
    { fieldName: 'adminNm', header: t('MSG_TXT_ADMIN'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'procsRs', header: t('MSG_TXT_PROCS_RS'), width: '300', styleName: 'text-left', editable: false }, // 처리결과
    { fieldName: 'vstCnfmDt', header: t('MSG_TXT_VST_CNFM_D'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd', editable: false },
    { fieldName: 'procsDt', header: t('MSG_TXT_PRCSDT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd', editable: false },
    { fieldName: 'procsrBlg', header: t('MSG_TXT_PCP_BLG'), width: '150', styleName: 'text-center', editable: false }, // 처리자소속
    { fieldName: 'procsrSbn', header: t('MSG_TXT_PCP_SBN'), width: '80', styleName: 'text-center', editable: false }, // 처리자사번
    { fieldName: 'procsrNm', header: t('MSG_TXT_PCP'), width: '80', styleName: 'text-center', editable: false }, // 처리자
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setCheckableExpression("(value['aprAkStatCd']='01')", true);
  view.setRowStyleCallback((g, { dataRow }) => {
    const aprAkStatCd = '01';
    if (aprAkStatCd !== g.getValue(dataRow, 'aprAkStatCd')) {
      return {
        editable: false,
      };
    }
  });

  view.editOptions.editable = true;
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (grid, { column, itemIndex }) => {
    if (column === 'cntrDtlNo') {
      const cntrNo = grid.getValue(itemIndex, 'cntrNo');
      const cntrSn = grid.getValue(itemIndex, 'cntrSn');

      router.push({
        path: '/service/wwsnb-individual-service-list', // 개인별 서비스 현황 호출
        query: {
          cntrNo,
          cntrSn,
        },
      });
    }
  };
});
</script>
