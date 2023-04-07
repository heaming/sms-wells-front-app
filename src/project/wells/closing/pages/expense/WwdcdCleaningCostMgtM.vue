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
              />
            </kw-search-item>
            <kw-search-item :label="$t('MSG_TXT_BUILDING')">
              <kw-select
                :v-model="searchParams.bldCd"
                :options="buildingCodes"
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
              icon="report"
              dense
              secondary
              :label="$t('MSG_TXT_RPT_BRWS')"
              @click="onClickOpenReport"
            />

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
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import { openReportPopup } from '~common/utils/cmPopupUtil';
import WwdcdCleaningCostMgtMCleaner from './WwdcdCleaningCostMgtMCleaner.vue';

const selectedTab = ref('manageCleaningSuppliesCostsList');
const selectedLinkId = ref(null);
const { t } = useI18n();
const { modal, notify, ok } = useGlobal();
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

const searchParams = ref({
  aplcStartDt: dayjs().format('YYYYMM'),
  aplcEndDt: dayjs().format('YYYYMM'),
  clinrNm: '',
  bldCd: '',
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const buildingCodes = ref([]);
async function buildingCode() {
  const res = await dataService.get('/sms/wells/closing/expense/cleaning-cost/code');

  res.data.forEach((obj) => {
    buildingCodes.value.push({
      codeId: obj.bldCd,
      codeName: obj.bldNm,
    });
  });
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/closing/expense/cleaning-cost/paging', { params: { ...cachedParams, ...pageInfo } });
  const { list: pages, pageInfo: pagingResult } = res.data;

  const view = grdMainRef.value.getView();
  pageInfo.value = pagingResult;
  view.getDataSource().setRows(pages);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickRegister() {
  const { result } = await modal({
    component: 'WwdcdRequestCleaningSuppliesMgtM', // W-CL-U-0093P01
    componentProps: {
      configGroup: '',
    },
  });
  if (result) {
    await notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  const deleteRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deleteRows.length > 0) {
    const clingCostAdjRcpNos = deleteRows.map(({ clingCostAdjRcpNo }) => clingCostAdjRcpNo);
    await dataService.delete('/sms/wells/closing/expense/cleaning-cost', { data: [...clingCostAdjRcpNos] });
    fetchData();
  }
  ok();
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
  // TODO. 오즈 개발완료되면 수정할 예정
  openReportPopup('/eformsample.ozr', '/eformsample.odi');
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'clingCostAdjRcpNo', visible: false }, // 청소비정산접수번호
    { fieldName: 'fstRgstDtm', header: t('등록일시'), width: '174', styleName: 'text-center', datetimeFormat: 'datetime' }, // 등록일시
    { fieldName: 'cfnlMdfcDtmol', header: '변경일시', width: '174', styleName: 'text-center', datetimeFormat: 'datetime' }, // 변경일시
    { fieldName: 'clingCostDvNm', header: '구분', width: '200', styleName: 'text-left' }, // 구분
    { fieldName: 'claimNm', header: '영수인', width: '200', styleName: 'text-left' }, // 영수인
    { fieldName: 'bldNm', header: '빌딩', width: '200', styleName: 'text-left' }, // 빌딩
    { fieldName: 'colaplcDt6', header: '신청일', width: '200', styleName: 'text-center', datetimeFormat: 'datetime' }, // 신청일
    { fieldName: 'bilAmt', header: '금액(원)', width: '182', styleName: 'text-right' }, // 금액(원)
    { fieldName: 'clingCostSrcpApnFileId',
      header: '영수증첨부',
      width: '121',
      styleName: 'text-right',
      renderer: {
        type: 'button',
        hideWhenEmpty: false,
      },
      displayCallback: () => t('MSG_BTN_CLINR_MNGT_BRWS'),
    }, // 영수증첨부

  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellClicked = (grid, clickData) => {
    // TODO.파일 업로드 개발 완료 되면 수정해야됨
    // 참고 ZdecRdsAnAccountErrorMgtService > saveAttachFile
    if (clickData.column === 'cntrwApnFileId') {
      // 계약서
    } else if (clickData.column === 'cntrLroreApnFil') {
      // 계약해지원
    } else if (clickData.column === 'idfApnFileId') {
      // 신분증사본
    } else if (clickData.column === 'bnkbApnFileId') {
      // 통장사본
    }
  };

  view.onCellItemClicked = async (grid, { itemIndex }) => {
    const { clinrRgno, result } = gridUtil.getRowValue(grid, itemIndex);
    await modal({
      component: 'WwdcdRequestCleaningSuppliesMgtM', // W-CL-U-0093P01
      componentProps: {
        configGroup: { clinrRgno },
      },
    });
    if (result) {
      await notify(t('MSG_ALT_SAVE_DATA'));
      await fetchData();
    }
  };
});

onMounted(async () => {
  await buildingCode();
});
</script>

<style scoped>
</style>
