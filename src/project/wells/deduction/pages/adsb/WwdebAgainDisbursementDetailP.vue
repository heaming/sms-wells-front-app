<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DEB
2. 프로그램 ID : WwdebAgainDisbursementDetailP
3. 작성자 : uhyeon.kim
4. 작성일 : 2023.06.09
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 재지급(팝업)
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--2xl"
  >
    <kw-search
      one-row
      :no-reset-btn="true"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 직급 구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_PSTN_DV')"
        >
          <kw-select
            v-model="searchParams.pstnDv"
            :options="filterOgTpCd"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <kw-action-top class="mt30">
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
        />
        <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <!-- 엑셀다운로드 -->
      <kw-btn
        icon="download_on"
        dense
        :label="t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :visible-rows="10"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrid"
    />
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useMeta, getComponentType, useDataService, gridUtil } from 'kw-lib';
import {
  cloneDeep, isEmpty,
} from 'lodash-es';

/**
 * props 파라미터 확인 필요.
 */
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  prtnrNo: {
    type: String,
    default: null,
  },
  ogTpCd: {
    type: String,
    default: null,
  },
  // 직급구분?
});

const { currentRoute } = useRouter();
const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();

// 페이징
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  // 환경변수에서 기본설정값 받아오는 코드 현재 CFG_CMZ_DEFAULT_PAGE_SIZE
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  // pageSize: 10,
  needTotalCount: true,
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
let cachedParamsTotal;
const filterOgTpCd = ref([]);
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'DDTN_RPLC_WELLS_PSTN_DV_CD', // 공제대체WELLS직급구분코드
);

if (props.ogTpCd === 'W01') {
  filterOgTpCd.value = codes.DDTN_RPLC_WELLS_PSTN_DV_CD.filter((e) => ['15', '7'].includes(e.codeId));
} else {
  filterOgTpCd.value = codes.DDTN_RPLC_WELLS_PSTN_DV_CD;
}

const searchParams = ref({
  pstnDv: filterOgTpCd.value[0].codeId, // 직급구분,
  prtnrNo: props.prtnrNo,
  ogTpCd: props.ogTpCd,
});

/**
 * 검색 Data Load
*/
async function fetchData() {
  cachedParamsTotal = {
    ...cachedParams,
    ...pageInfo.value,
  };
  const res = await dataService.get('/sms/wells/deduction/adsb/again-disbursements/paging', { params: cachedParamsTotal });
  const { list: resList, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const dataSource = view.getDataSource();

  // Row 변경상태감지를 풀고 데이터 교체후, 다시 변경감지 On
  dataSource.checkRowStates(false);
  dataSource.addRows(resList);
  dataSource.checkRowStates(true);
}

async function onClickSearch() {
  grdMainRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

/**
 * 엑셀다운로드
 */
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/wells/deduction/adsb/again-disbursements/excel-download', { params: cachedParams });

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
  const fields = [
    { fieldName: 'redfAdsbOcYm' }, // 발생월
    { fieldName: 'perfYm' }, // 실적월
    { fieldName: 'perfDvNm' }, // 구분
    { fieldName: 'cntrNoSn' }, // 계약상세번호
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'adsbAmt', dataType: 'number' }, // 재지급액
    { fieldName: 'redfAdsbTpCd' }, // 적요
    { fieldName: 'sellTpNm' }, // 상품

    { fieldName: 'perfDvCd' }, // 실적구분코드
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'sellTpCd' }, // 판매유형코드

  ];

  const columns = [
    { fieldName: 'redfAdsbOcYm',
      header: t('MSG_TXT_MNTH_OCCURENCE'), // 발생월
      width: '100',
      styleName: 'text-center',
      datetimeFormat: 'YYYY-MM' },
    { fieldName: 'perfYm',
      header: t('MSG_TXT_PERF_MM'), // 실적월
      width: '100',
      styleName: 'text-center',
      datetimeFormat: 'YYYY-MM' },
    { fieldName: 'perfDvNm',
      header: t('MSG_TXT_DIV'), // 구분
      width: '100',
      styleName: 'text-center' },
    { fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'), // 계약상세번호
      width: '100',
      styleName: 'text-center ',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        if (!isEmpty(cntrNo)) {
          return `${cntrNo}-${cntrSn}`;
        }
      } },
    { fieldName: 'cstKnm',
      header: t('MSG_TXT_CST_NM'), // 고객명
      width: '100',
      styleName: 'text-center' },
    { fieldName: 'adsbAmt',
      header: t('MSG_TXT_ADSB_AMT'), // 재지급액
      width: '100',
      styleName: 'text-right',
      numberFormat: '#,##0' },
    { fieldName: 'redfAdsbTpCd',
      header: t('MSG_TXT_SMRY'), // 적요
      width: '120',
      styleName: 'text-center' },
    { fieldName: 'sellTpNm',
      header: t('MSG_TXT_PRDT'), // 상품
      width: '120',
      styleName: 'text-left' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  /**
   * Infinite Scroll
   */
  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      await fetchData();
    }
  };
}
</script>
