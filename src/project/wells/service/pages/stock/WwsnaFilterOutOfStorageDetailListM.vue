<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaFilterOutOfStorageDetailListM - 필터출고현황(세부)(K-W-SV-U-0263M01)
3. 작성자 : jungheejin
4. 작성일 : 2023-08-31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 필터출고현황(세부) 목록 http://localhost:3000/#/service/wwsna-filter-out-of-storage-detail-list
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      :default-visible-rows="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_DT')"
          :colspan="2"
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_OSTR_DT')"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.startDt"
          v-model:end-ym="searchParams.endDt"
          v-model:ware-dv-cd="searchParams.wareDvCd"
          v-model:ware-no-m="searchParams.wareNoM"
          v-model:ware-no-d="searchParams.wareNoD"
          :label1="$t('MSG_TXT_WARE')"
          :label2="$t('MSG_TXT_WARE_DV')"
          :label3="$t('MSG_TXT_HGR_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          sub-first-option-value=""
          sub-first-option="all"
          :colspan="2"
          @update:ware-dv-cd="onChangeStdWareDvCd"
          @update:ware-no-m="onChagneHgrWareNo"
        />
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MNGT_DV')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.mngrDvCd"
            :options="codes.MNGR_DV_CD"
            first-option="all"
            @update:model-value="onChangeMngrDvCd"
          />
        <!--
         <kw-field
            v-model="searchParams.rgsnYn"
         >
            <template #default="{ field }">
              <kw-checkbox
                v-model="searchParams.rgsnYn"
                v-bind="field"
                :label="$t('MSG_TXT_RGSN_EXCD')"
              />
            </template>
          </kw-field>
          -->
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_MTR_DV')"
        >
          <kw-select
            v-model="searchParams.svBizHclsfCd"
            :options="codes.SV_BIZ_HCLSF_CD.filter((v) => ['1', '2', '3', '4'].includes(v.codeId))"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CST_TYPE')"
        >
          <kw-select
            v-model="searchParams.fnlSellTpCd"
            :options="codes.PRD_MNGT_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RECAP_OR_FREE')+$t('MSG_TXT_DIV')"
        >
          <kw-select
            v-model="searchParams.refriDvCd"
            :options="codes.REFRI_DV_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 총괄단, 지역단, 지점 ,매니저 -->
        <template v-if="isManagerSelected">
          <wwsn-manager-og-search-item-group
            v-model:dgr1-levl-og-id="searchParams.dgr1LevlOgId"
            v-model:dgr2-levl-og-id="searchParams.dgr2LevlOgId"
            v-model:dgr3-levl-og-id="searchParams.dgr3LevlOgId"
            v-model:prtnr-no="searchParams.prtnrNo"
            use-og-level="3"
            use-partner
            dgr1-levl-og-first-option="all"
            dgr2-levl-og-first-option="all"
            dgr3-levl-og-first-option="all"
            partner-first-option="all"
            dgr1-levl-og-label="ogCdNm"
            dgr2-levl-og-label="ogCdNm"
            dgr3-levl-og-label="ogCdNm"
            partner-label="prtnrNoNm"
            auth-yn="N"
          />
        </template>
        <template v-if="isEngineerSelected">
          <!-- 서비스센터, 엔지니어-->
          <wwsn-engineer-og-search-item-group
            v-model:dgr1-levl-og-id="searchParams.ogId"
            v-model:prtnr-no="searchParams.prtnrNo"
            use-og-level="1"
            use-partner
            dgr1-levl-og-first-option="all"
            dgr1-levl-og-label="ogCdNm"
            partner-first-option="all"
            partner-label="prtnrNoNm"
            auth-yn="N"
          />
        </template>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
        </template>
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
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

import { getComponentType, defineGrid, gridUtil, useDataService, codeUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';
import WwsnEngineerOgSearchItemGroup from '~sms-wells/service/components/WwsnEngineerOgSearchItemGroup.vue';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const router = useRouter();
const { currentRoute } = useRouter();
const { t } = useI18n();
const now = dayjs();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/filter-out-of-storage-detail';

const codes = await codeUtil.getMultiCodes(
  'SV_BIZ_HCLSF_CD',
  'PD_GRP_CD',
  'ITM_KND_CD',
  'WARE_DV_CD',
  'MNGR_DV_CD',
  'REFRI_DV_CD',
  'PRD_MNGT_TP_CD',
);

const searchParams = ref({
  startDt: now.format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  wareDvCd: '2',
  wareNoM: '',
  wareNoD: '',
  itmKndCd: '',
  mngrDvCd: '',
  refriDvCd: '',
  fnlSellTpCd: '',
  svBizHclsfCd: '',
  pdGrpCd: '',
  ogId: '',
  prtnrNo: '',
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  dgr3LevlOgId: '',
  rgsnYn: 'N', // 퇴사자 제외 여부
});
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
});

/* 관리 구분 : 매니저 */
const isManagerSelected = computed(() => searchParams.value.mngrDvCd === '1');
const isEngineerSelected = computed(() => searchParams.value.mngrDvCd === '2');
/*  관리구분 변경시 초기화 */
async function onChangeMngrDvCd() {
  searchParams.value.dgr1LevlOgId = '';
  searchParams.value.dgr2LevlOgId = '';
  searchParams.value.dgr3LevlOgId = '';
  searchParams.value.ogId = '';
  searchParams.value.prtnrNo = '';
}

function onChangeStdWareDvCd() {
  searchParams.value.wareNoM = '';
  searchParams.value.wareNoD = '';
}

function onChagneHgrWareNo() {
  searchParams.value.wareNoD = '';
}

watch(() => searchParams.value.wareDvCd, (val) => {
  if (searchParams.value.wareDvCd !== val) {
    searchParams.value.wareDvCd = val;
  }
});

let cachedParams;
async function fetchData() {
  const res = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: result, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(result);
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
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'fnlVstFshDt', header: t('MSG_TXT_OSTR_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      renderer: { type: 'button' },
      styleName: 'text-center rg-button-link',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        if (!isEmpty(cntrNo)) {
          return `${cntrNo}-${cntrSn}`;
        }
      },
    },
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'cstNm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' }, // 고객명
    { fieldName: 'fnlSellTpNm', header: t('MSG_TXT_CST_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'fnlPdCd', header: t('MSG_TXT_PRDT_CODE'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '250', styleName: 'text-left' },
    { fieldName: 'svBizHclsfNm', header: t('MSG_TXT_DIV'), width: '80', styleName: 'text-center' },
    { fieldName: 'svBizDclsfCd', header: t('MSG_TXT_WORK_CD'), width: '80', styleName: 'text-center' },
    { fieldName: 'svBizDclsfNm', header: t('MSG_TXT_TASK_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '180', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '200', styleName: 'text-center' },
    { fieldName: 'itmPdNm', header: t('MSG_TXT_ITM_NM'), width: '220', styleName: 'text-left' },
    { fieldName: 'useQty', header: `${t('MSG_TXT_QTY')}(EA)`, width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'refriDvNm', header: t('MSG_TXT_RECAP_OR_FREE'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '80', styleName: 'text-center' }, // 사번
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PIC'), styleName: 'text-center', width: '80' }, // 담당자
    { fieldName: 'ogNm', header: t('MSG_TXT_DEPT_NM'), width: '120', styleName: 'text-center' }, // 부서명
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.onCellItemClicked = async (grid, { column, itemIndex }) => {
    if (column === 'cntrNo') {
      const cntrNo = grid.getValue(itemIndex, 'cntrNo');
      const cntrSn = grid.getValue(itemIndex, 'cntrSn');

      router.push({
        path: '/service/wwsnb-individual-service-list',
        query: {
          cntrNo,
          cntrSn,
        },
      });
    }
  };
});

</script>
