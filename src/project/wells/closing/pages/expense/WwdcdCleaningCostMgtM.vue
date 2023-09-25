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
              v-permission:print
              icon="report"
              dense
              secondary
              :label="$t('MSG_TXT_RPT_BRWS')"
              @click="onClickOpenReport"
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
import { openReportPopup } from '~common/utils/cmPopupUtil';
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
      notify('당월 등록데이터만 삭제 할 수 있습니다.'); // TODO: 설계자 메시지 확인 후 수정 예정
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
async function onClickOpenReport() {
  await openReportPopup(
    '/ksswells/hdof/reprt/cucsAplcImg.ozr',
    null,
    {
      jsondata: [
        encodeURI(JSON.stringify({
          signImg1: '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',
        })),
      ],
    },
  );
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  // TODO: 삭제 버튼 과 연결 되는 체크박스를 아예 안나오게 하려는 함수 스타일 정의 필요 사용 안하는 경우 삭제
  const checkboxDisplayNone = (grid, type, index) => {
    if (!grid.getValue(index, 'fstRgstDtm').startsWith(defaultDate)) {
      return 'checkbox-dn';
    }
  };
  view.setCheckBar({ cellStyleCallback: checkboxDisplayNone });

  const columns = [
    { fieldName: 'clingCostAdjRcpNo', visible: false }, // 청소비정산접수번호
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
      const { clingCostAdjRcpNo, result } = gridUtil.getRowValue(grid, itemIndex);
      await modal({
        component: 'WwdcdRequestCleaningSuppliesMgtP', // W-CL-U-0093P01
        componentProps: { clingCostAdjRcpNo },
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
