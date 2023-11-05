<!----
****************************************************************************************************
1. 모듈 : DCD
2. 프로그램 ID : WwdcdCleaningCostMgtM - 청소 용품비 관리 / W-CL-U-0093M01

3. 작성자 : gs.piit172 kim juhyun
4. 작성일 : 2023.04.05
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 청소 용품비 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs v-model="selectedTab">
      <kw-tab
        name="manageCleaningSuppliesCostsList"
        :label="$t('MSG_TXT_CLING_THG_AMT_MNGT')"
      />
      <kw-tab
        name="cleanerManagementList"
        :label="$t('MSG_TXT_CLINR_MNGT')"
      />
    </kw-tabs>
    <kw-tab-panels v-model="selectedTab">
      <kw-tab-panel name="manageCleaningSuppliesCostsList">
        <kw-search
          :modified-targets="['grdMain']"
          :cols="2"
          @search="onClickSearch"
        >
          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_APL_DATE')"
              required
            >
              <kw-date-range-picker
                v-model:from="searchParams.aplcStartDt"
                v-model:to="searchParams.aplcEndDt"
                type="month"
                rules="date_range_required"
                :label="$t('MSG_TXT_APL_DATE')"
              />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_BUILDING')">
              <kw-input
                v-model="searchParams.bldNm"
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
              v-permission:delete
              :label="$t('MSG_BTN_DEL')"
              grid-action
              dense
              @click="onClickDelete"
            />
            <kw-separator
              vertical
              inset
              spaced
            />
            <kw-btn
              v-permission:download
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
              v-permission:create
              :label="$t('MSG_BTN_APPL')"
              primary
              dense
              @click="onClickRegister"
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
      </kw-tab-panel>
      <kw-tab-panel name="cleanerManagementList">
        <wwdcd-cleaning-cost-mgt-m-cleaner
          v-model:selected-link-id="selectedLinkId"
        />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, useMeta, codeUtil, getComponentType, useDataService, useGlobal, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import WwdcdCleaningCostMgtMCleaner from './WwdcdCleaningCostMgtMCleaner.vue';

const selectedTab = ref('manageCleaningSuppliesCostsList');
const selectedLinkId = ref(null);
const { t } = useI18n();
const { modal, notify } = useGlobal();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const grdMainRef = ref(getComponentType('KwGrid'));
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const defaultDate = dayjs().format('YYYY-MM');

const searchParams = ref({
  aplcStartDt: dayjs().format('YYYYMM'),
  aplcEndDt: dayjs().format('YYYYMM'),
  clinrNm: '',
  bldCd: '',
  bldNm: '',
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const buildingCodes = ref([]);
async function buildingCode() {
  const res = await dataService.get('/sms/wells/closing/expense/cleaning-cost/code');
  buildingCodes.value = res.data;
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/closing/expense/cleaning-cost/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: pages, pageInfo: pagingResult } = res.data;

  const view = grdMainRef.value.getView();
  pageInfo.value = pagingResult;
  view.getDataSource().setRows(pages);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickRegister() {
  const { result } = await modal({
    component: 'WwdcdRequestCleaningSuppliesMgtP', // W-CL-U-0093P01
    componentProps: {
      configGroup: '',
    },
  });
  if (result) {
    notify(t('MSG_ALT_SAVE_DATA'));
    await onClickSearch();
  }
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  const deleteRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deleteRows.length > 0) {
    let isCheckCanceled = true;
    deleteRows.forEach((obj) => {
      const { fstRgstDtm } = obj;
      if (!fstRgstDtm.startsWith(defaultDate)) { // 해당 년도 등록건만 삭제 가능
        isCheckCanceled = false;
        return false;
      }
    });
    if (!isCheckCanceled) {
      notify(t('MSG_ALT_CURRENT_MONTH_DATA_ONLY')); // TODO: 설계자 메시지 확인 후 수정 예정
      fetchData();
      return;
    }
    const clingCostAdjRcpNos = deleteRows.map(({ clingCostAdjRcpNo }) => clingCostAdjRcpNo);
    await dataService.delete('/sms/wells/closing/expense/cleaning-cost', { data: [...clingCostAdjRcpNos] });
    fetchData();
    // ok();
  }
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/closing/expense/cleaning-cost/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const checkboxDisplayNone = (grid, type, index) => {
    if (!grid.getValue(index, 'fstRgstDtm').startsWith(defaultDate)) {
      return 'checkbox-dn';
    }
  };
  view.setCheckBar({ cellStyleCallback: checkboxDisplayNone });

  const columns = [
    { fieldName: 'clingCostAdjRcpNo', visible: false }, // 청소비정산접수번호
    { fieldName: 'bldCd', visible: false }, // 빌딩코드
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DTM'), width: '174', styleName: 'text-center', datetimeFormat: 'datetime' }, // 등록일시
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_CH_DTM'), width: '174', styleName: 'text-center', datetimeFormat: 'datetime' }, // 변경일시
    { fieldName: 'clingCostDvNm', header: t('MSG_TXT_DIV'), width: '200', styleName: 'text-left' }, // 구분
    { fieldName: 'claimNm', header: t('MSG_TXT_RECI'), width: '200', styleName: 'text-left' }, // 영수인
    { fieldName: 'bldNm', header: t('MSG_TXT_BUILDING'), width: '200', styleName: 'text-left' }, // 빌딩
    { fieldName: 'aplcDt', header: t('MSG_TXT_APPL_DATE'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 신청일
    { fieldName: 'bilAmt', header: t('MSG_TXT_AMT_WON'), width: '182', styleName: 'text-right', dataType: 'number' }, // 금액(원)
    { fieldName: 'atthDocId',
      header: t('MSG_TXT_SRCP_APN'),
      width: '121',
      styleName: 'text-right',
      dataType: 'file',
      editor: {
        type: 'file',
        attachDocumentId: 'atthDocId',
        attachGroupId: 'ATG_DCD_CLING_COST',
        downloadable: true,
        multiple: true,
        editable: false,
      },
      styleCallback: (grid, model) => {
        if (!isEmpty(model.value.__atthDocumentId)) {
          return {
            styleName: 'text-center rg-file-button',
          };
        }
        return {
          styleName: 'text-center rg-file-hide-button',
        };
      },
    }, // 영수증첨부

  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellClicked = async (grid, { column, itemIndex }) => {
    if (column === 'atthDocId') { return; }
    if (isEmpty(column)) { return; }

    if (isEmpty(itemIndex)) {
      const { clingCostAdjRcpNo, aplcDt, bldCd, result } = gridUtil.getRowValue(grid, itemIndex);
      await modal({
        component: 'WwdcdRequestCleaningSuppliesMgtP', // W-CL-U-0093P01
        componentProps: { clingCostAdjRcpNo, applYm: aplcDt, bldCd },
      });
      if (result) {
        notify(t('MSG_ALT_SAVE_DATA'));
        await fetchData();
      }
    }
  };
});

onMounted(async () => {
  await buildingCode();
});
</script>

<style scoped>
</style>
