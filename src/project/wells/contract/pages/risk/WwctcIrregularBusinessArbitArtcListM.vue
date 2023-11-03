<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTC
2. 프로그램 ID : WwctcIrregularBusinessArbitArtcListM - 비정도영업조치사항조회
3. 작성자 : gs.rahul.n / JSY
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
      :modified-targets="['grdMain']"
      cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ACEPT_PERIOD')"
          colspan="2"
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
        <!-- 사번 -->
        <kw-search-item
          :label="$t('MSG_TXT_EPNO')"
        >
          <kw-input
            v-model="searchParams.dangOjPrtnrNo"
            icon="search"
            maxlength="10"
            regex="num"
            @click-icon="onClickSearchPartnerId"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_POSIT')+$t('MSG_TXT_DIV')"
        >
          <!-- 직위 직급구분코드(2: 총괄단장, 4: 지역단장: 5:BM, 7:지점장) -->
          <!-- rev:231027 구분코드 한글화 -->
          <kw-select
            v-model="searchParams.dangMngtPrtnrNo"
            first-option="all"
            :options="searchParamsPosDivOpt"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 조직코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_OG_CD')"
          class="selectOrgs"
          colspan="2"
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevlDvCd1"
            v-model:og-levl-dv-cd2="searchParams.ogLevlDvCd2"
            v-model:og-levl-dv-cd3="searchParams.ogLevlDvCd3"
            :og-tp-cd="searchParams.ogTpCd"
            :start-level="1"
            :end-level="3"
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
          v-permission:download
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
import { gridUtil, defineGrid, getComponentType, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
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
  ogLevlDvCd1: '',
  ogLevlDvCd2: '',
  ogLevlDvCd3: '',
  dangOjPrtnrNo: '',
  perfYm: now.format('YYYYMM'),
  ogTpCd: 'W02',
});

const prdDivOption = ref([{ codeId: 1, codeName: t('MSG_TXT_FST_RGST_DT') },
  { codeId: 2, codeName: t('MSG_TXT_YEAR_OCCURNCE') }]);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
});

let cachedParams;

const searchParamsPosDivOpt = ref([ // 직위구분검색코드 rev:231103: 공통코드 일부 미사용으로 인한 리스트작성
  { codeId: '2', codeName: t('MSG_TXT_GNLR_LEDR') },
  { codeId: '4', codeName: t('MSG_TXT_REG_DIR') },
  { codeId: '5', codeName: t('MSG_TXT_BM') },
  { codeId: '7', codeName: t('MSG_TXT_BRMGR') },
]);

const gridPosDivOpt = cloneDeep(searchParamsPosDivOpt); // 그리드직위(직급)코드 rev:231103: 공통코드 일부 미사용으로 인한 리스트추가
gridPosDivOpt.value.push({ codeId: '15', codeName: t('MSG_TXT_WELS') + t('MSG_TXT_PLAR') });

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/contract/risk-audits/irregular-sales-actions/excel-download', { params: cachedParams });
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

  console.log(cachedParams);
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
    { fieldName: 'wellsOjPstnRankNm', header: t('MSG_TXT_POSIT'), width: '129', styleName: 'text-center', options: gridPosDivOpt.value },
    { fieldName: 'dangMngtPntnrOgNm', header: t('MSG_TXT_BLG_NM'), width: '129', styleName: 'text-center' },
    { fieldName: 'dangMngtPntnrOgCd', header: t('MSG_TXT_RGNL_GRP'), width: '129', styleName: 'text-center' },
    { fieldName: 'dangMngtPntnrNm', header: t('MSG_TXT_EMPL_NM'), width: '129', styleName: 'text-center' },
    { fieldName: 'dangMngtPrtnrNo', header: t('MSG_TXT_EPNO'), width: '129', styleName: 'text-center' },
    { fieldName: 'dangOjPrtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '129', styleName: 'text-center' },
    { fieldName: 'dangOjPrtnrNo', header: t('MSG_TXT_EPNO'), width: '129', styleName: 'text-center' },
    { fieldName: 'dangOjPrtnrPstnDvNm', header: t('MSG_TXT_CRLV'), width: '129', styleName: 'text-center', options: gridPosDivOpt.value },
    { fieldName: 'dangOcStrtmm', header: t('MSG_TXT_YEAR_OCCURNCE'), width: '129', styleName: 'text-center', datetimeFormat: 'yyyy-MM' },
    { fieldName: 'dangArbitOgNm', header: t('MSG_TXT_ACTN_DPT'), width: '306', styleName: 'text-left' },
    { fieldName: 'dangChkNm', header: t('MSG_TXT_CHRGS'), width: '306', styleName: 'text-left' },
    {
      fieldName: 'dangArbitCdNm',
      header: t('MSG_TXT_ACTN_ITM'),
      width: '306',
      styleName: 'text-left',
    },
    { fieldName: 'dangUncvrCt', header: t('MSG_TXT_DUE_TRGT_NO'), width: '129', styleName: 'text-right' },
    { fieldName: 'dangArbitLvyPc', header: t('MSG_TXT_ACTN_TM_PNLTY_PNT'), width: '190', styleName: 'text-right' },
    { fieldName: 'dangArbitLvyPcSum', header: t('MSG_TXT_TTL_PT'), width: '129', styleName: 'text-right' },
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_FST_RGST_USR'), width: '146', styleName: 'text-center' },
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_FST_RGST_DT'), width: '165', styleName: 'text-center', dataType: 'date', datetimeFormat: 'yyyy-MM-dd' },
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
<style scoped lang="scss">
.selectOrgs {
  ::v-deep(.kw-field-wrap .kw-select) {
    width: 250px !important;
    max-width: 250px !important;
    min-width: 33% !important;
  }
}
</style>
