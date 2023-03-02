<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 고객 - 수수료 지급명세서
2. 프로그램 ID : WwfeeWwfeeSpecificationListM - 수수료 지급명세서 (W-CO-U-0037M01)
3. 작성자 : kangik-yun
4. 작성일 : 2023.02.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 >> 수수료 지급명세서 프로그램
****************************************************************************************************
-TODO :
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!--실적년월-->
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfDt"
            rules="required"
            type="month"
            :label="$t('MSG_TXT_PERF_YM')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OG_TP')"
          required
        >
          <kw-select
            v-model="searchParams.orgType"
            :label="$t('MSG_TXT_OG_TP')"
            :model-value="[]"
            :options="['M추진단', 'P추진단', '홈마스터']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_RSB_TP')"
          required
        >
          <kw-option-group
            v-model="searchParams.positionType"
            :label="$t('MSG_TXT_RSB_TP')"
            :model-value="'플래너'"
            type="radio"
            rules="required"
            :options="['플래너', '지점장']"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.ogLevel1"
            :model-value="[]"
            :options="['총괄단', 'B', 'C']"
          />
          <kw-select
            v-model="searchParams.ogLevel2"
            :model-value="[]"
            :options="['지역단', 'B', 'C']"
          />
          <kw-select
            v-model="searchParams.ogLevel3"
            :model-value="[]"
            :options="['지점', 'B', 'C']"
          />
        </kw-search-item>
        <kw-search-item
          label="번호"
        >
          <kw-input
            clearable
            icon="search"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
          <span class="ml8">(단위:원)</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          dense
          secondary
          label="명세서 출력(본사)"
        />
        <kw-btn
          dense
          secondary
          label="명세서 출력"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="2"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, defineGrid, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const totalCount = ref(0);
const dataService = useDataService();
const { t } = useI18n();
const searchParams = ref({
  perfDt: '',
  orgType: '',
  positionType: '',
  ogLevel1: '',
  ogLevel2: '',
  ogLevel3: '',
});

const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData() {
  const res = await dataService.get('/sms/wells/fee/fee-specifications', { params: cachedParams });
  const datas = res.data;
  totalCount.value = datas.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(datas);
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  fetchData();
}
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  gridUtil.exportView(view, {
    fileName: '실활동인원 관리',
    timePostfix: true,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
    { fieldName: 'col8' },
    { fieldName: 'col9' },
    { fieldName: 'col10' },
    { fieldName: 'col11' },
    { fieldName: 'col12' },
    { fieldName: 'col13' },
    { fieldName: 'col14' },
    { fieldName: 'col15' },
    { fieldName: 'col16' },
    { fieldName: 'col17' },
    { fieldName: 'col18' },
    { fieldName: 'col19' },
    { fieldName: 'col20' },
    { fieldName: 'col21' },
    { fieldName: 'col22' },
    { fieldName: 'col23' },
    { fieldName: 'col24' },
    { fieldName: 'col25' },
    { fieldName: 'col26' },
    { fieldName: 'col27' },
    { fieldName: 'col28' },
    { fieldName: 'col29' },
    { fieldName: 'col30' },
    { fieldName: 'col31' },
    { fieldName: 'col32' },
    { fieldName: 'col33' },
    { fieldName: 'col34' },
    { fieldName: 'col35' },
    { fieldName: 'col36' },
    { fieldName: 'col37' },
    { fieldName: 'col38' },
    { fieldName: 'col39' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '103.8', styleName: 'text-left' }, // 총괄단
    { fieldName: 'col2', header: t('MSG_TXT_RGNL_GRP'), width: '103.8', styleName: 'text-left' }, // 지역단
    { fieldName: 'col3', header: t('MSG_TXT_BRANCH'), width: '103.8', styleName: 'text-left' }, // 지점
    { fieldName: 'col4', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '110.8', styleName: 'text-center' }, // 번호
    { fieldName: 'col5', header: t('MSG_TXT_EMPL_NM'), width: '110.8', styleName: 'text-left' }, // 성명
    { fieldName: 'col6', header: t('MSG_TXT_RSB'), width: '88.7', styleName: 'text-left' }, // 직책
    { fieldName: 'col7', header: t('MSG_TXT_METG_PRSC_DC'), width: '93.1', styleName: 'text-right' }, // 미팅참석일수
    { fieldName: 'col8', header: t('MSG_TXT_ELHM_ACKMT_CT'), width: '118.1', styleName: 'text-right' }, // 가전인정건수
    { fieldName: 'col9', header: t('MSG_TXT_ELHM_CHDVC_CT'), width: '111.9', styleName: 'text-right' }, // 가전기변건수
    { fieldName: 'col10', header: t('MSG_TXT_ELHM_PRPN'), width: '129.5', styleName: 'text-right' }, // 가전비례
    { fieldName: 'col11', header: t('MSG_TXT_ELHM_EXCP_PRPN'), width: '129.5', styleName: 'text-right' }, // 가전외비례
    { fieldName: 'col12', header: t('MSG_TXT_ELHM_METG'), width: '129.5', styleName: 'text-right' }, // 가전미팅
    { fieldName: 'col13', header: t('MSG_TXT_SPAY_METG'), width: '132.1', styleName: 'text-right' }, // 일시불미팅

    { fieldName: 'col14', header: t('MSG_TXT_ELHM_EXCP_METG'), width: '142.8', styleName: 'text-right' }, // 가전외미팅
    { fieldName: 'col15', header: t('MSG_TXT_SAL_INTV'), width: '142.8', styleName: 'text-right' }, // 판매장려
    { fieldName: 'col16', header: t('MSG_TXT_EDUC'), width: '142.8', styleName: 'text-right' }, // 교육
    { fieldName: 'col17', header: t('MSG_TXT_ADSB'), width: '142.8', styleName: 'text-right' }, // 재지급
    { fieldName: 'col18', header: t('MSG_TXT_MMBR'), width: '142.8', styleName: 'text-right' }, // 맴버십
    { fieldName: 'col19', header: t('MSG_TXT_ETC_SPPT'), width: '142.8', styleName: 'text-right' }, // 기타지원
    { fieldName: 'col20', header: t('MSG_TXT_MCHN_CH'), width: '142.8', styleName: 'text-right' }, // 기기변경
    { fieldName: 'col21', header: `BS${t('MSG_TXT_MGT')}`, width: '142.8', styleName: 'text-right' }, // BS관리
    { fieldName: 'col22', header: t('MSG_TXT_STMNT'), width: '142.8', styleName: 'text-right' }, // 정착
    { fieldName: 'col23', header: t('MSG_TXT_RGLVL'), width: '142.8', styleName: 'text-right' },
    { fieldName: 'col24', header: `WM${t('MSG_TXT_CMNC')}`, width: '142.8', styleName: 'text-right' }, // WM통신

    { fieldName: 'col25', header: t('MSG_TXT_EQP_PAP'), width: '142.8', styleName: 'text-right' }, // 자제실장
    { fieldName: 'col26', header: `WM${t('MSG_TXT_ETC')}`, width: '142.8', styleName: 'text-right' }, // WM기타
    { fieldName: 'col27', header: t('MSG_TXT_LIVE_PAKG'), width: '142.8', styleName: 'text-right' }, // 라이브팩
    { fieldName: 'col28', header: t('MSG_TXT_SAL_ICEN_RETR'), width: '142.8', styleName: 'text-right' }, // 판매장려소급
    { fieldName: 'col29', header: t('MSG_TXT_HOME_CARE'), width: '142.8', styleName: 'text-right' }, // 홈케어
    { fieldName: 'col30', header: t('MSG_TXT_FEE_SUM'), width: '142.8', styleName: 'text-right' }, // 수수료합계
    { fieldName: 'col31', header: t('MSG_TXT_ERNTX'), width: '142.8', styleName: 'text-right' }, // 소득세
    { fieldName: 'col32', header: t('MSG_TXT_RSDNTX'), width: '142.8', styleName: 'text-right' }, // 주민세
    { fieldName: 'col33', header: t('MSG_TXT_RDS'), width: '142.8', styleName: 'text-right' }, // 보증예치금
    { fieldName: 'col34', header: t('MSG_TXT_PNPYAM'), width: '142.8', styleName: 'text-right' }, // 가지급금
    { fieldName: 'col35', header: t('MSG_TXT_BU_DDTN'), width: '142.8', styleName: 'text-right' }, // 부담공제

    { fieldName: 'col36', header: t('MSG_TXT_DSC_SELL'), width: '142.8', styleName: 'text-right' }, // 할인판매
    { fieldName: 'col37', header: t('MSG_TXT_HIR_INSR'), width: '142.8', styleName: 'text-right' }, // 고용보험
    { fieldName: 'col38', header: t('MSG_TXT_DDTN_SUM2'), width: '142.8', styleName: 'text-right' }, // 공제합계
    { fieldName: 'col39', header: t('MSG_TXT_PAYOUTS'), width: '142.8', styleName: 'text-right' }, // 지급액
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  // multi row header setting
  view.setColumnLayout([
    'col1', 'col2', 'col3', 'col4', 'col5', 'col6', 'col7', // single
    {
      header: t('MSG_TXT_PERF'), // colspan title //실적
      direction: 'horizontal', // merge type
      items: ['col8', 'col9'],
    },
    {
      header: t('MSG_TXT_FEE'), // 수수료
      direction: 'horizontal',
      items: ['col10', 'col11', 'col12', 'col13'],
    },
    {
      header: t('MSG_TXT_FEE'), // 수수료
      direction: 'horizontal',
      items: ['col14', 'col15', 'col16', 'col17', 'col18', 'col19', 'col20', 'col21', 'col22', 'col23', 'col24'],
    },
    {
      header: t('MSG_TXT_FEE'), // 수수료
      direction: 'horizontal',
      items: ['col25', 'col26', 'col27', 'col28', 'col29', 'col30'],
    },
    {
      header: t('MSG_TXT_DDTN'), // 공제
      direction: 'horizontal',
      items: ['col31', 'col32', 'col33', 'col34', 'col35'],
    },
    {
      header: t('MSG_TXT_DDTN'), // 공제
      direction: 'horizontal',
      items: ['col36', 'col37', 'col38', 'col39'],
    },
  ]);
  data.setRows([
    { col1: 'OO총괄단', col2: 'OO지역단', col3: '김웰스 지점', col4: '1234567', col5: '김교원', col6: '플래너', col7: '12', col8: '123', col9: '123', col10: '1,234,500', col11: '1,234,500', col12: '1,234,500', col13: '1,234,500', col14: '1,234,500', col15: '1,234,500', col16: '1,234,500', col17: '1,234,500', col18: '1,234,500', col19: '1,234,500', col20: '1,234,500', col21: '1,234,500', col22: '1,234,500', col23: '1,234,500', col24: '1,234,500', col25: '1,234,500', col26: '1,234,500', col27: '1,234,500', col28: '1,234,500', col29: '1,234,500', col30: '1,234,500', col31: '1,234,500', col32: '1,234,500', col33: '1,234,500', col34: '1,234,500', col35: '1,234,500', col36: '1,234,500', col37: '1,234,500', col38: '1,234,500', col39: '1,234,500' },

  ]);
});

</script>
