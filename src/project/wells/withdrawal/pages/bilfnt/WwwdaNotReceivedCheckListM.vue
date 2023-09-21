<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDA
2. 프로그램 ID : WwwdaNotReceivedCheckListM - 자동이체결과 체크리스트(청구완료 미수신건) (W-WD-U-0035M01)
3. 작성자 : donghyun.yoo
4. 작성일 : 2023.02.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
계좌/카드 자동이체 생성자료 조회 및 오류체크 구분별 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs
      v-model="selectedTab"
    >
      <kw-tab
        name="bilFshNrcvCt"
        :label="t('MSG_TIT_BIL_FSH_NRCV_CT')"
      />
      <kw-tab
        name="rcvFshDpCrtOmssnCt"
        :label="t('MSG_TIT_RCV_FSH_DP_CRT_OMSSN_CT')"
      />
      <kw-tab
        name="slPerfDpApyOmssnCt"
        :label="t('MSG_TIT_SL_PERF_DP_APY_OMSSN_CT')"
      />
      <kw-tab
        name="bndlWdrwUnrg"
        :label="t('MSG_TIT_BNDL_WDRW_ERR_RGST')"
      />
    </kw-tabs>

    <kw-tab-panels v-model="selectedTab">
      <kw-tab-panel name="bilFshNrcvCt">
        <kw-search
          one-row
          @search="onClickSearch"
        >
          <kw-search-row>
            <kw-search-item
              :label="t('MSG_TXT_BASE_DT')"
              required
            >
              <kw-date-picker
                v-model="searchParams.bilDt"
                :label="t('MSG_TXT_BASE_DT')"
                rules="required"
              />
            </kw-search-item>

            <kw-search-item
              :label="t('MSG_TXT_FNT_DV')"
              required
            >
              <kw-option-group
                v-model="searchParams.fntDvCd"
                :label="t('MSG_TXT_FNT_DV')"
                rules="required"
                type="radio"
                :options="codes.FNT_DV_CD.filter(v => v.codeId !== '03')"
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
              :disable="pageInfo.totalCount === 0"
              icon="download_on"
              dense
              secondary
              :label="t('MSG_BTN_EXCEL_DOWN')"
              @click="onClickExcelDownload"
            />
          </kw-action-top>
          <kw-grid
            ref="grdMainRef"
            name="grdMain"
            :page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            @init="initGrid"
          />
          <kw-pagination
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </div>
      </kw-tab-panel>
      <kw-tab-panel name="rcvFshDpCrtOmssnCt">
        <wwwda-fund-transfer-change-mgt-m
          v-model:items-checked="itemsChecked.tab1"
        />
      </kw-tab-panel>
      <kw-tab-panel name="slPerfDpApyOmssnCt">
        <wwwda-deposit-apply-omission-m
          v-model:items-checked="itemsChecked.tab2"
        />
      </kw-tab-panel>
      <kw-tab-panel name="bndlWdrwUnrg">
        <wwwda-result-bundle-error-list-m
          v-model:items-checked="itemsChecked.tab3"
        />
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil, gridUtil, defineGrid, getComponentType, useMeta } from 'kw-lib';
import dayjs from 'dayjs';
import WwwdaFundTransferChangeMgtM from './WwwdaFundTransferChangeMgtM.vue';
import WwwdaDepositApplyOmissionM from './WwwdaDepositApplyOmissionM.vue';
import WwwdaResultBundleErrorListM from './WwwdaResultBundleErrorListM.vue';

const dataService = useDataService();
const { t } = useI18n();
const now = dayjs();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const itemsChecked = ref({
  tab1: t('MSG_TIT_RCV_FSH_DP_CRT_OMSSN_CT'),
  tab2: t('MSG_TIT_SL_PERF_DP_APY_OMSSN_CT'),
  tab3: t('MSG_TIT_BNDL_WDRW_ERR_RGST'),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'BNK_CD',
  'FNT_DV_CD',
);
const grdMainRef = ref(getComponentType('KwGrid'));

const selectedTab = ref('bilFshNrcvCt');

let cachedParams;
const searchParams = ref({
  bilDt: now.format('YYYYMMDD'), // 기준일자
  fntDvCd: '01', // 이체구분
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/not-received-checks', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = { ...searchParams.value };
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/not-received-checks/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TIT_BIL_FSH_NRCV_CT')}`,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'autoFntClsf' },
    { fieldName: 'bnkCd' },
    { fieldName: 'bnkNm' },
    { fieldName: 'ct', dataType: 'number' },

  ];

  const columns = [
    { fieldName: 'autoFntClsf', header: t('MSG_TXT_AUTO_FNT_CLSF'), width: '735' },
    { fieldName: 'bnkCd', header: t('MSG_TXT_BNK_CDCO_CD'), width: '250', styleName: 'text-center' },
    { fieldName: 'bnkNm', header: t('MSG_TXT_BNK_CDCO_NM'), width: '250', options: codes.BNK_CD, styleName: 'text-center' },
    { fieldName: 'ct', header: t('MSG_TXT_NRCV_CT'), width: '250', styleName: 'text-right', numberFormat: '#,##0' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
