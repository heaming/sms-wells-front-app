<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTC
2. 프로그램 ID : WwctcIrregularBusinessArbitArtcListM - 비정도영업조치사항조회
3. 작성자 : gs.rahul.n
4. 작성일 : 2023.01.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 비정도영업조치사항조회 화면
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :colspan="3"
          :label="$t('MSG_TXT_ACEPT_PERIOD')"
        >
          <kw-select
            v-model="searchParams.srchGbn "
            :options="prdDivOption"
            required
            @change="calChange"
          />
          <kw-date-range-picker
            v-if="searchParams.srchGbn===1"
            v-model:from="searchParams.dangOcStrtdt"
            v-model:to="searchParams.dangOcEnddt"
            type="date"
            rules="required"
          />
          <kw-date-range-picker
            v-if="searchParams.srchGbn===2"
            v-model:from="searchParams.dangOcStrtMonth"
            v-model:to="searchParams.dangOcEndMonth"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_POSIT')"
        >
          <!-- 직위 직급구분코드 공통코드 사용 (2: 총괄단장, 4: 지역단장: 5:BM, 7:지점장) -->
          <kw-select
            v-model="searchParams.dangMngtPrtnrNo"
            first-option="all"
            :options="codes.PSTN_DV_CD.filter((v) => ['2', '4', '5', '7'].includes(v.codeId))"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MANAGEMENT_DEPARTMENT')"
        >
          <kw-select
            v-model="searchParams.gnrdv"
            first-option="all"
            :options="codes.GNRDV_ACD"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RGNL_GRP')"
        >
          <kw-input
            v-model="searchParams.rgrp"
            maxlength="10"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_BRANCH')"
        >
          <kw-input
            v-model="searchParams.brch"
            maxlength="10"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_EMP_SRCH')"
        >
          <kw-input
            v-model="searchParams.dangOjPrtnrNo"
            icon="search"
            maxlength="10"
            regex="num"
            @click-icon="onClickSearchPartnerId"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
        </template>
        <kw-btn
          v-permission:delete
          grid-action
          :label="$t('MSG_BTN_DEL')"
          @click="onClickDelete"
        />
        <kw-btn
          icon="download_on"
          :disable="pageInfo.totalCount === 0"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMainRef"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { gridUtil, defineGrid, getComponentType, useDataService, useGlobal, codeUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { notify, modal } = useGlobal();
const dataService = useDataService();
const { t } = useI18n();
const { currentRoute } = useRouter();
const now = dayjs();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const searchParams = ref({
  srchGbn: 1,
  dangOcStrtdt: now.startOf('month').format('YYYYMMDD'),
  dangOcStrtMonth: now.add('-1', 'month').format('YYYYMM'),
  dangOcEnddt: now.format('YYYYMMDD'),
  dangOcEndMonth: now.format('YYYYMM'),
  gnrdv: '',
  rgrp: '',
  brch: '',
  dangOjPrtnrNo: '',
});

const prdDivOption = ref([{ codeId: 1, codeName: t('MSG_TXT_FST_RGST_DT') },
  { codeId: 2, codeName: t('MSG_TXT_YEAR_OCCURNCE') }]);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
});

const codes = await codeUtil.getMultiCodes(
  'GNRDV_ACD',
  'PSTN_DV_CD',
);

let cachedParams;

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/contract/risk-audits/irregular-sales-actions', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}
async function onClickSearchPartnerId() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.dangOjPrtnrNo,
    },
  });
  if (result) {
    searchParams.value.dangOjPrtnrNo = payload.prtnrNo;
  }
}

async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);

  const res = await dataService.get('sms/wells/contract/risk-audits/irregular-sales-actions', { params: cachedParams });
  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();
  dataSource.setRows(res.data);
  pageInfo.value.totalCount = view.getItemCount();
  view.setCheckableExpression("values['dangChkId'] != ''", true);
}

async function onClickSearch() {
  if (searchParams.value.srchGbn === 1) {
    if ((isEmpty(searchParams.value.dangOcStrtdt)) && (!isEmpty(searchParams.value.dangOcEnddt))) {
      notify(t('MSG_ALT_CHK_DT_RLT'));
      return;
    }
    if ((!isEmpty(searchParams.value.dangOcStrtdt)) && (isEmpty(searchParams.value.dangOcEnddt))) {
      notify(t('MSG_ALT_CHK_DT_RLT'));
      return;
    }
  }

  if (searchParams.value.srchGbn === 2) {
    if ((isEmpty(searchParams.value.dangOcStrtMonth)) && (!isEmpty(searchParams.value.dangOcEndMonth))) {
      notify(t('MSG_ALT_CHK_DT_RLT'));
      return;
    }
    if ((!isEmpty(searchParams.value.dangOcStrtMonth)) && (isEmpty(searchParams.value.dangOcEndMonth))) {
      notify(t('MSG_ALT_CHK_DT_RLT'));
      return;
    }
  }

  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length > 0) {
    const dangChkIds = deletedRows.map(({ dangChkId }) => dangChkId);
    await dataService.delete('sms/wells/contract/risk-audits/irregular-sales-actions', { params: { dangChkIds } });
    await fetchData();
  }
}

async function calChange() {
  searchParams.value.dangOcStrtdt = now.startOf('month').format('YYYYMMDD');
  searchParams.value.dangOcEnddt = now.format('YYYYMMDD');
  searchParams.value.dangOcStrtMonth = now.add('-1', 'month').format('YYYYMM');
  searchParams.value.dangOcEndMonth = now.format('YYYYMM');
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dangChkId' },
    { fieldName: 'wellsOjPstnRankNm' },
    { fieldName: 'dangMngtPntnrOgNm' },
    { fieldName: 'dangMngtPntnrOgCd' },
    { fieldName: 'dangMngtPntnrNm' },
    { fieldName: 'dangMngtPrtnrNo' },
    { fieldName: 'dangOjPrtnrNm' },
    { fieldName: 'dangOjPrtnrNo' },
    { fieldName: 'dangOjPrtnrPstnDvNm' },
    { fieldName: 'dangOcStrtmm' },
    { fieldName: 'dangArbitOgNm' },
    { fieldName: 'dangChkNm' },
    { fieldName: 'dangArbitCdNm' },
    { fieldName: 'dangUncvrCt' },
    { fieldName: 'dangArbitLvyPc' },
    { fieldName: 'dangArbitLvyPcSum' },
    { fieldName: 'fstRgstUsrId' },
    { fieldName: 'fstRgstDtm' },
  ];

  const columns = [
    { fieldName: 'wellsOjPstnRankNm', header: t('MSG_TXT_POSIT'), width: '129', styleName: 'text-left' },
    { fieldName: 'dangMngtPntnrOgNm', header: t('MSG_TXT_BLG_NM'), width: '129', styleName: 'text-left' },
    { fieldName: 'dangMngtPntnrOgCd', header: t('MSG_TXT_RGNL_GRP'), width: '129', styleName: 'text-left' },
    { fieldName: 'dangMngtPntnrNm', header: t('MSG_TXT_EMPL_NM'), width: '129', styleName: 'text-left' },
    { fieldName: 'dangMngtPrtnrNo', header: t('MSG_TXT_EPNO'), width: '129', styleName: 'text-left' },
    { fieldName: 'dangOjPrtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '129', styleName: 'text-left' },
    { fieldName: 'dangOjPrtnrNo', header: t('MSG_TXT_EPNO'), width: '129' },
    { fieldName: 'dangOjPrtnrPstnDvNm', header: t('MSG_TXT_CRLV'), width: '129', styleName: 'text-left' },
    { fieldName: 'dangOcStrtmm', header: t('MSG_TXT_YEAR_OCCURNCE'), width: '129', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'dangArbitOgNm', header: t('MSG_TXT_ACTN_DPT'), width: '306', styleName: 'text-center' },
    { fieldName: 'dangChkNm', header: t('MSG_TXT_CHRGS'), width: '306', styleName: 'text-left' },
    { fieldName: 'dangArbitCdNm', header: t('MSG_TXT_ACTN_ITM'), width: '306', styleName: 'text-left' },
    { fieldName: 'dangUncvrCt', header: t('MSG_TXT_DUE_TRGT_NO'), width: '129', styleName: 'text-left' },
    { fieldName: 'dangArbitLvyPc', header: t('MSG_TXT_ACTN_TM_PNLTY_PNT'), width: '190', styleName: 'text-center' },
    { fieldName: 'dangArbitLvyPcSum', header: t('MSG_TXT_TTL_PT'), width: '129', styleName: 'text-center' },
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR'), width: '146', styleName: 'text-center' },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FST_RGST_DT'), width: '165', styleName: 'text-left', dataType: 'date', datetimeFormat: 'yyyy-MM-dd' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([
    'wellsOjPstnRankNm', 'dangMngtPntnrOgNm', 'dangMngtPntnrOgCd', 'dangMngtPntnrNm', 'dangMngtPrtnrNo',
    {
      header: t('MSG_TXT_EMP_NO'), // colspan title
      direction: 'horizontal', // merge type
      items: ['dangOjPrtnrNm', 'dangOjPrtnrNo', 'dangOjPrtnrPstnDvNm'],
    },
    {
      header: t('MSG_TXT_PNLTY'), // colspan title
      direction: 'horizontal', // merge type
      items: ['dangOcStrtmm', 'dangArbitOgNm', 'dangChkNm', 'dangArbitCdNm', 'dangUncvrCt', 'dangArbitLvyPc', 'dangArbitLvyPcSum'],
    },
    'fstRgstUsrId', 'fstRgstDtm',
  ]);
});
</script>
<style scoped>
</style>
