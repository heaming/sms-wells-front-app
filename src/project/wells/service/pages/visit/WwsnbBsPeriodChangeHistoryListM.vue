<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB (방문관리)
2. 프로그램 ID : WwsnbBsPeriodChangeHistoryListM - BS 주기변경 이력 조회(K-W-SV-U-0050M01)
3. 작성자 : leeminwoo
4. 작성일 : 2023-10-30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- BS 주기변경 이력 조회 http://localhost:3000/#/service/wwsna-bs-period-change-history-list
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.mngtYm"
            type="month"
            :label="$t('MSG_TXT_MGT_YNM')"
            :colspan="1"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <kw-input
            v-model.trim="searchParams.cntrDtlNo"
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('조회구분')">
          <kw-select
            v-model="searchParams.inqrDvCd"
            :options="tempOptions.inqrDvCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 상품그룹 -->
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :label="$t('MSG_TXT_PD_GRP')"
            first-option="all"
            :options="codes.PD_GRP_CD"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="productCode"
            first-option="all"
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>
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
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { getComponentType, defineGrid, gridUtil, useDataService, useMeta, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import smsCommon from '~sms-wells/service/composables/useSnCode';
import dayjs from 'dayjs';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { getConfig } = useMeta();

const { getPartMaster } = smsCommon();

const { t } = useI18n();
const { currentRoute } = useRouter();
const router = useRouter();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/bs-period-change-history-list';

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'PD_GRP_CD',
);

const tempOptions = {
  inqrDvCd: [
    { codeId: '01', codeName: t('MSG_TXT_BHSHD_CHNG') }, // 가구화변경
    { codeId: '02', codeName: t('MSG_TXT_BHSHD_RSTR') }, // 가구화원복
    { codeId: '03', codeName: t('MSG_TXT_CRP_CST_CHNG') }, // 법인고객변경
    { codeId: '04', codeName: t('MSG_TXT_CRP_CST_RSTR') }, // 법인고객원복
    { codeId: '05', codeName: t('MSG_TXT_WTST_USWY_CHNG') }, // 연수기용도변경
    { codeId: '06', codeName: t('MSG_TXT_WTST_USWY_RSTR') }, // 연수기용도원복
    { codeId: '07', codeName: t('MSG_TXT_FILT_CHNG') }, // 필터변경
  ],
  vstPrdCd: [ // 방문주기코드
    { codeId: '2S1', codeName: t('1-3-5-7') },
    { codeId: '2S0', codeName: t('2-4-6-8') },
    { codeId: '3S1', codeName: t('1-4-7-10') },
    { codeId: '3S2', codeName: t('2-5-8-11') },
    { codeId: '3S0', codeName: t('3-6-9-12') },
    { codeId: '4S1', codeName: t('1-5-9') },
    { codeId: '4S2', codeName: t('2-6-10') },
    { codeId: '4S3', codeName: t('3-7-11') },
    { codeId: '4S0', codeName: t('4-8-12') },
    { codeId: '6S1', codeName: t('1-7') },
    { codeId: '6S2', codeName: t('2-8') },
    { codeId: '6S3', codeName: t('3-9') },
    { codeId: '6S4', codeName: t('4-10') },
    { codeId: '6S5', codeName: t('5-11') },
    { codeId: '6S0', codeName: t('6-12') },
    { codeId: '1S0', codeName: t('1-2-3-4') },
  ],
};

const searchParams = ref({
  mngtYm: now.format('YYYYMM'),
  cntrDtlNo: '',
  inqrDvCd: '',
  pdGrpCd: '',
  pdCd: '',
});
let cachedParams;

const productCode = ref();
watch(() => [searchParams.value.year, searchParams.value.pdGrpCd], async () => {
  // productCode.value = await getMcbyCstSvOjIz(searchParams.value.year, searchParams.value.pdGrpCd);
  const tempVal = await getPartMaster(
    '4',
    searchParams.value.pdGrpCd,
    'M',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    'X',
  );
  productCode.value = tempVal.map((v) => ({ codeId: v.cd, codeName: v.cdNm }));
}, { immediate: true });

async function fetchData() {
  const res = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: items, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(items);

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
  const response = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
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
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'moCntrDtlNo' },
    { fieldName: 'moRcgvpKnm' },
    { fieldName: 'moPdAbbrNm' },
    { fieldName: 'vstPrdCd' },
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'rcgvpKnm' },
    { fieldName: 'pdAbbrNm' },
    { fieldName: 'bfchVstPrdCd' },
    { fieldName: 'afchVstPrdCd' },
    { fieldName: 'akRsonCn' },
    { fieldName: 'apyMm' },
    { fieldName: 'prtnrNm' },
    { fieldName: 'wkDt' },
  ];

  const columns = [
    {
      fieldName: 'moCntrDtlNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center rg-button-link',
      renderer: { type: 'button' },
    }, // 계약상세번호(모회원)
    { fieldName: 'moRcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' }, // 고객명(모회원)
    { fieldName: 'moPdAbbrNm', header: t('MSG_TXT_PDCT'), width: '200', styleName: 'text-center' }, // 제품(모회원)
    { fieldName: 'vstPrdCd', header: t('MSG_TXT_VST_PRD'), width: '120', styleName: 'text-center', options: tempOptions.vstPrdCd }, // 방문주기(모회원)
    {
      fieldName: 'cntrDtlNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center rg-button-link',
      renderer: { type: 'button' },
    }, // 계약상세번호(자회원)
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' }, // 고객명(자회원)
    { fieldName: 'pdAbbrNm', header: t('MSG_TXT_PDCT'), width: '200', styleName: 'text-center' }, // 제품(자회원)
    { fieldName: 'bfchVstPrdCd', header: t('MSG_TXT_BF_CH_VST_PRD'), width: '120', styleName: 'text-center', options: tempOptions.vstPrdCd }, // 변경 전 방문주기
    { fieldName: 'afchVstPrdCd', header: t('MSG_TXT_AF_CH_VST_PRD'), width: '120', styleName: 'text-center', options: tempOptions.vstPrdCd }, // 변경 후 방문주기
    { fieldName: 'akRsonCn', header: t('MSG_TXT_RQST_RSN'), width: '100', styleName: 'text-center' }, // 요청사유
    { fieldName: 'apyMm', header: t('MSG_TXT_APY_MM'), width: '80', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 적용월
    { fieldName: 'prtnrNm', header: t('MSG_TXT_PIC'), width: '100', styleName: 'text-center' }, // 담당자
    { fieldName: 'wkDt', header: t('MSG_TXT_WK_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 작업일자
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setColumnLayout([
    {
      header: t('MSG_TXT_MB_BASE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['moCntrDtlNo', 'moRcgvpKnm', 'moPdAbbrNm', 'vstPrdCd'],
    },
    {
      header: t('MSG_TXT_MB_CHNG'), // colspan title
      direction: 'horizontal', // merge type
      items: ['cntrDtlNo', 'rcgvpKnm', 'pdAbbrNm', 'bfchVstPrdCd', 'afchVstPrdCd'],
    },
    'akRsonCn',
    'apyMm',
    'prtnrNm',
    'wkDt',
  ]);

  view.onCellItemClicked = async (grid, clickData) => {
    if (clickData.column === 'cntrDtlNo') {
      const cntrNo = grid.getValue(clickData.itemIndex, 'cntrNo');
      const cntrSn = grid.getValue(clickData.itemIndex, 'cntrSn');

      router.push({
        path: '/service/wwsnb-individual-service-list', // 개인별 서비스 현황 호출
        query: {
          cntrNo,
          cntrSn,
        },
      });
    } else if (clickData.column === 'moCntrDtlNo') {
      const cntrNo = grid.getValue(clickData.itemIndex, 'cntrNo');
      const cntrSn = grid.getValue(clickData.itemIndex, 'cntrSn');

      router.push({
        path: '/service/wwsnb-individual-service-list', // 개인별 서비스 현황 호출
        query: {
          cntrNo,
          cntrSn,
        },
      });
    }
  };
});
</script>
