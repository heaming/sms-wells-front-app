<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSE
2. 프로그램 ID : WwpseGenenalAffairsElcBizAkM - 총무전자업무요청 (K-W-GM-U-0024M01)
3. 작성자 : jungsu.kim
4. 작성일 : 2023.05.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
총무전자업무요청 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="2"
      @search="onClickSearch"
    >
      <h3 class="mt0 pb20">
        <p>{{ t('MSG_TXT_BIZ_AK_LIST') }}</p>
      </h3>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_RCPDT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.rcpStartDtm"
            v-model:to="searchParams.rcpEndDtm"
            rules="date_range_required|date_range_months:1"
            :label="t('MSG_TXT_RCPDT')"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_TASK_TYPE')">
          <kw-select
            v-model="searchParams.rpotBizTpId"
            :label="$t('MSG_TXT_TASK_TYPE')"
            :options="businessTypeList"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_STT')">
          <kw-select
            v-model="searchParams.rpotBizProcsStatCd"
            :label="$t('MSG_TXT_STT')"
            first-option="all"
            :options="codes.RPOT_BIZ_PROCS_STAT_CD"
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
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>
        <kw-btn
          v-permission:download
          icon="download_on"
          secondary
          dense
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        :visible-row="5"
        @init="initGrid"
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
import { codeUtil, getComponentType, gridUtil, useDataService, useGlobal, useMeta, modal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const dataService = useDataService();
const { getConfig, getUserInfo } = useMeta();
const { currentRoute } = useRouter();
// eslint-disable-next-line no-unused-vars
const { notify, alert } = useGlobal();
// eslint-disable-next-line no-unused-vars
const userInfo = getUserInfo();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'RNT_APLC_TP_CD',
  'RPOT_BIZ_PROCS_STAT_CD',
);

const grdMainRef = ref(getComponentType('KwGrid'));

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const searchParams = ref({
  rcpStartDtm: now.date(1).format('YYYYMMDD'),
  rcpEndDtm: now.format('YYYYMMDD'),
  rpotBizTpId: '',
  rntAplcTpCd: '',
  rpotBizProcsStatCd: '',
});

let cachedParams;

const businessTypeList = ref([]);

async function getBusinessType() {
  const baseInfoParams = { rpotBizTpDvCd: '03', rpotBizTpId: '', ogTpCd: '', prtnrNo: userInfo.loginId };
  const res = await dataService.get('/sms/wells/competence/electronic-business-ak-ps/business-type', { params: baseInfoParams });

  businessTypeList.value = res.data;
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/competence/electronic-business-ak/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: pages, pageInfo: pageResult } = res.data;
  pageInfo.value = pageResult;

  console.log(res.data);

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  pages.forEach((param) => {
    param.phoneNo = `${param.cralLocaraTno}-${param.mexnoEncr}-${param.cralIdvTno}`;
    param.rcstPhoneNo = `${param.rcstCralLocaraTno}-${param.rcstMexnoEncr}-${param.rcstCralIdvTno}`;
  });

  data.checkRowStates(false);
  data.setRows(pages);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  data.checkRowStates(true);
}

async function onClickSearch() {
  grdMainRef.value.getData().clearRows();

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  /* 백단(서비스) 엑셀 다운로드 */
  const res = await dataService.get('/sms/wells/competence/electronic-business-ak-ps/excel-download', { params: searchParams.value });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const columns = [
    { fieldName: 'rpotBizProcsStatNm',
      header: t('MSG_TXT_STT'),
      width: '80',
      renderer: {
        type: 'button',
        hideWhenEmpty: true,
      } },
    { fieldName: 'aplcDtm', header: t('MSG_TXT_RCPDT'), width: '100', styleName: 'text-center' },
    { fieldName: 'rcstPrtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'rcstPrtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'rcstPhoneNo', header: t('MSG_TXT_CONTACT'), width: '120', styleName: 'text-left' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'rpotBizTpNm', header: t('MSG_TXT_TASK_TYPE'), width: '150', styleName: 'text-left' },
    { fieldName: 'bizAkCn', header: t('MSG_TXT_CNTN'), width: '250', styleName: 'text-left' },
    { fieldName: 'fnlMdfcDtm',
      header: `${t('MSG_TXT_COMPLETE')}(${t('MSG_TXT_SB')})${t('MSG_TXT_DT')}`,
      width: '100',
      styleName: 'text-center' },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'aplcnsPrtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'rpotBizTpId', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'rpotBizAplcId', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'phoneNo', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'rpotBizProcsStatCd', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'procsSn', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'procsCn', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'bizAkBldNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center', visible: false },

  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    'rpotBizProcsStatNm', 'aplcDtm',
    {
      header: t('MSG_TXT_RCST'), // colspan title
      direction: 'horizontal', // merge type
      items: ['rcstPrtnrNo', 'rcstPrtnrNm', 'rcstPhoneNo'],
    },
    {
      header: t('MSG_TXT_PIC'), // colspan title
      direction: 'horizontal', // merge type
      items: ['prtnrNo', 'prtnrKnm'],
    },
    'rpotBizTpNm', 'bizAkCn', 'fnlMdfcDtm',
    {
      header: t('MSG_TXT_FSH_SB_EMPLOYEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['fnlMdfcUsrId', 'fnlMdfcUsrNm'],
    }, 'aplcnsPrtnrNo', 'rpotBizTpId', 'rpotBizAplcId', 'phoneNo', 'rpotBizProcsStatCd', 'procsSn', 'procsCn', 'bizAkBldNm',
  ]);

  view.onCellItemClicked = async (grid, { itemIndex, column }) => {
    if (column === 'rpotBizProcsStatNm') {
      // eslint-disable-next-line no-unused-vars
      const { result, payload } = await modal({
        component: 'WwpseGenenalAffairsElcBizAkP',
        componentProps: {
          rowData: grid.getValues(itemIndex),
        },
      });

      await fetchData();
    }
  };
}

onMounted(() => {
  getBusinessType();
});
</script>
<style scoped></style>
