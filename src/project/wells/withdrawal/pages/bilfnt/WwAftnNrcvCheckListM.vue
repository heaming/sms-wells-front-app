<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDA
2. 프로그램 ID : WwAftnNrcvCheckListM - 자동이체결과 체크리스트(청구완료 미수신건)
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
        :label="t('MSG_TIT_BIL_FSH_NRCV_CT')"
      />
      <kw-tab
        name="page"
        :label="t('MSG_TIT_SL_PERF_DP_APY_OMSSN_CT')"
      />
      <kw-tab
        name="link"
        :label="t('MSG_TIT_BNDL_WDRW_ERR_RGST')"
      />
    </kw-tabs>

    <kw-tab-panels v-model="selectedTab">
      <kw-tab-panel name="bilFshNrcvCt">
        <kw-search
          :cols="2"
          @search="onClickSearch"
        >
          <kw-search-row>
            <kw-search-item
              :label="t('MSG_TXT_BASE_DT')"
              required
            >
              <kw-date-picker
                v-model="searchParams.bilDt"
                rules="required"
              />
            </kw-search-item>

            <kw-search-item
              :label="t('MSG_TXT_FNT_DV')"
              required
            >
              <kw-option-group
                v-model="searchParams.fntDvCd"
                rules="required"
                type="radio"
                :options="[{codeId: '01', codeName:$t('MSG_TXT_AC')},{codeId:'02',codeName:$t('MSG_TXT_CARD')}]"
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
            :visible-rows="pageInfo.pageSize"
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
    </kw-tab-panels>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil, gridUtil, defineGrid, useMeta, getComponentType } from 'kw-lib';
import dayjs from 'dayjs';

const dataService = useDataService();
const { getConfig } = useMeta();
const { t } = useI18n();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'BNK_CD',
);
const grdMainRef = ref(getComponentType('KwGrid'));

const selectedTab = ref('bilFshNrcvCt');

let cachedParams;
const searchParams = ref({
  bilDt: now.format('YYYYMMDD'),
  fntDvCd: '01',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/withdrawal/w-aftn-nrcv-check-list', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: manuals, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(manuals);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = { ...searchParams.value };
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: `bilFshNrcvCt_${now.format('YYYYMMDDHH24MMSS')}`,
    timePostfix: true,
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
    { fieldName: 'ct' },

  ];

  const columns = [
    { fieldName: 'autoFntClsf', header: t('MSG_TXT_AUTO_FNT_CLSF'), width: '735' },
    { fieldName: 'bnkCd', header: t('MSG_TXT_BNK_CDCO_CD'), width: '250', styleName: 'text-center' },
    { fieldName: 'bnkNm', header: t('MSG_TXT_BNK_CDCO_NM'), width: '250', options: codes.BNK_CD },
    { fieldName: 'ct', header: t('MSG_TXT_NRCV_CT'), width: '250', styleName: 'text-right', editor: { type: 'number' } },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
