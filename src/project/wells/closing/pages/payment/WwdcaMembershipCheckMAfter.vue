<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCA
2. 프로그램 ID : WwdcaMembershipCheckMAfter - 멤버십 확정 체크리스트(후)
3. 작성자 : Kicheol Choi
4. 작성일 : 2023.04.03
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 멤버십 확정 체크리스트(후)
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="2"
    one-row
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_OG_CHO')"
      >
        <kw-option-group
          v-model="searchParams.deptGubun"
          :options="deptGubunCode"
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
          v-model:total-count="pageInfo.totalCount"
          v-model:page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change="fetchData"
        />
      </template>

      <kw-btn
        v-permission:download
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="pageInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>

    <kw-grid
      ref="grdAfterRef"
      name="grdAter"
      :visible-rows="pageInfo.pageSize - 1"
      @init="initGrid"
    />

    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      v-model:total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, codeUtil, useDataService, useMeta, gridUtil, getComponentType } from 'kw-lib';
import { getDeptGubunCodes } from '~/modules/sms-common/closing/utils/clUtil';

const { t } = useI18n();
const dataService = useDataService();

const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const { getters } = useStore();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdAfterRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const deptGubunCode = await getDeptGubunCodes();
const { departmentId: ogId } = getters['meta/getUserInfo'];

const searchParams = ref({
  deptGubun: deptGubunCode[0].codeId,
  deptCd: ogId,
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const { deptGubun } = searchParams.value;
  const res = await dataService.get('/sms/wells/closing/membership-check-after/paging', { params: { deptGubun, ...pageInfo.value } });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdAfterRef.value.getView();

  view.getDataSource().setRows(pages);

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdAfterRef.value.getView();
  const deptGubun = searchParams.value;
  const res = await dataService.get('/sms/wells/closing/membership-check-after/excel-download', { params: { deptGubun } });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
  if (ogId === '70078' || ogId === '70068') {
    searchParams.value.deptGubun = deptGubunCode[0].codeId;
  } else {
    searchParams.value.deptGubun = deptGubunCode[1].codeId;
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CNTR_DTL_NO'), width: '146', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_CHECK_DV_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_CHECK_DV_NM'), width: '300', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_CNTR_DATE'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col5', header: t('MSG_TXT_CANC_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col6', header: t('MSG_TXT_END_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col7', header: t('MSG_TXT_DEM_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col8', header: t('MSG_TXT_MSH_SSPCS_WON'), width: '120', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'col9', header: t('MSG_TXT_RENT_PRD_MN'), width: '100', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_RENTAL_NMN'), width: '100', styleName: 'text-right' },
    { fieldName: 'col11', header: t('MSG_TXT_IN_PSIC'), width: '120', styleName: 'text-center' },
    { fieldName: 'col12', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '120', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_DLQ_MCNT'), width: '100', styleName: 'text-right' },
    { fieldName: 'col14', header: `${t('MSG_TXT_DIV')}02`, width: '100', styleName: 'text-center' },
    { fieldName: 'col15', header: t('MSG_TXT_NOTE'), width: '120' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
