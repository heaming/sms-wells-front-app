<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaReceiptBulkUploadMSinglePayment - 대량 접수자료 업로드(T접수-일시불)
3. 작성자 : gs.rahul.n
4. 작성일 : 2023.04.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 대량 접수자료 업로드(T접수-일시불)
****************************************************************************************************
--->
<template>
  <kw-page>
    <!-- To.개발 kw-tab-panel안에 kw-search로 시작하는 경우 kw-tabs에 .form-border 제거 / 그 외 추가 -->
    <kw-tabs
      model-value="2"
    >
      <kw-tab
        name="1"
        :label="$t('MSG_TXT_RECP_RENT')"
      />
      <kw-tab
        name="2"
        :label="$t('MSG_TXT_RECP_LMP_SUM_PMT')"
      />
      <kw-tab
        name="3"
        :label="$t('MSG_TXT_INSTALL')"
      />
    </kw-tabs>
    <kw-tab-panels
      model-value="2"
    >
      <kw-tab-panel name="2">
        <kw-search :cols="4">
          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_LOOKUP_PERIOD')"
              required
              :colspan="2"
            >
              <kw-select
                class="w187"
                :model-value="[]"
                :options="['등록일', 'B', 'C', 'D']"
                rules="required"
              />
              <kw-date-range-picker
                rules="date_range_required|date_range_months:1"
              />
            </kw-search-item>
            <kw-search-item
              :label="$t('MSG_TXT_ALNC_CD')"
              :colspan="1"
            >
              <kw-select
                :model-value="[]"
                :options="['주소', 'B', 'C', 'D']"
              />
            </kw-search-item>
            <kw-search-item
              :label="$t('MSG_TXT_DISC_CODE')"
              :colspan="1"
            >
              <kw-select
                :model-value="[]"
                :options="['주소', 'B', 'C', 'D']"
              />
            </kw-search-item>
          </kw-search-row>
          <kw-search-row>
            <kw-search-item
              :label="$t('MSG_TXT_PRDT_CATE')"
              :colspan="2"
            >
              <kw-select
                :model-value="[]"
                :options="['대분류 전체', 'B', 'C', 'D']"
              />
              <kw-select
                :model-value="[]"
                :options="['중분류 전체', 'B', 'C', 'D']"
              />
            </kw-search-item>
            <kw-search-item
              :label="$t('MSG_TXT_PRDT_CODE')"
              :colspan="1"
            >
              <kw-input />
            </kw-search-item>
            <kw-search-item
              :label="$t('MSG_TXT_PRDT_NM')"
              :colspan="1"
            >
              <kw-input />
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
              <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
            </template>

            <kw-btn
              icon="upload_on"
              dense
              secondary
              :label="$t('MSG_TXT_UPL_BLK_APP_DATA')"
            />
          </kw-action-top>

          <kw-grid
            ref="grdMainRef"
            name="grdMain"
            :page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            @init="initGrdMain"
          />

          <h3>{{ t('MSG_TXT_LS_PRICING_INFO') }}</h3>
          <kw-action-top>
            <template #left>
              <kw-paging-info
                v-model:page-index="pageInfo1.pageIndex"
                v-model:page-size="pageInfo1.pageSize"
                :total-count="pageInfo1.totalCount"
                :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
                @change="fetchPricingData"
              />
              <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
            </template>
          </kw-action-top>

          <kw-grid
            name="pricingGrid"
            :page-size="pageInfo1.pageSize"
            :total-count="pageInfo1.totalCount"
            @init="initPricingGrid"
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
import { defineGrid, getComponentType, useMeta, codeUtil } from 'kw-lib';

const { getConfig } = useMeta();

const { t } = useI18n();
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const pageInfo1 = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const grdMainRef = ref(getComponentType('KwGrid'));
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
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
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_REG_FILE'), width: '133', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_RGST_DT'), width: '146', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_RGST_USR'), width: '146', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_RGR_EMPNO'), width: '134', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_DV_1'), width: '111', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_DV_2'), width: '125', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_PRDT_CODE'), width: '125', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_DISC_CODE'), width: '282', styleName: 'text-left' },
    { fieldName: 'col9', header: t('MSG_TXT_FREE_MEM'), width: '125', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_FRISU_AS'), width: '125', styleName: 'text-center' },
    { fieldName: 'col11', header: t('MSG_TXT_PMOT'), width: '282', styleName: 'text-left' },
    { fieldName: 'col12', header: t('MSG_TXT_BS_CYC'), width: '125', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_USWY_DV'), width: '125', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_ALNC_CD'), width: '260', styleName: 'text-left' },
    { fieldName: 'col15', header: t('MSG_TXT_ALNC_FEE'), width: '125', styleName: 'text-right' },
    { fieldName: 'col16', header: t('MSG_TXT_CST_NO'), width: '125', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_SAL_DT_CAT'), width: '125', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_CLSF_PRDT_DT'), width: '125', styleName: 'text-center' },
    { fieldName: 'col19', header: t('MSG_TXT_DIV'), width: '125', styleName: 'text-center' },
    { fieldName: 'col20', header: t('MSG_TXT_REP_CD'), width: '125', styleName: 'text-center' },
    { fieldName: 'col21', header: t('MSG_TXT_RGST_ICHR'), width: '125', styleName: 'text-center' },
    { fieldName: 'col22', header: `${t('MSG_TXT_FGPT')}1`, width: '125', styleName: 'text-center' },
    { fieldName: 'col23', header: `${t('MSG_TXT_FGPT')}2`, width: '125', styleName: 'text-center' },
    { fieldName: 'col24', header: `${t('MSG_TXT_FGPT')}3`, width: '125', styleName: 'text-center' },
    { fieldName: 'col25', header: `${t('MSG_TXT_FGPT')}4`, width: '125', styleName: 'text-center' },
    { fieldName: 'col26', header: `${t('MSG_TXT_FGPT')}5`, width: '125', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '다운로드', col2: '2022-10-10', col3: '김교원', col4: '1602591', col5: 'BW', col6: '16', col7: '3020', col8: '36. 무상멤버십 3년', col9: '36', col10: '36', col11: '30. 미가입(3년무상(약정할인))', col12: '3', col13: '0.공통', col14: '05. 이지엘(21)', col15: '0', col16: '123456789', col17: 'M', col18: '3', col19: '3', col20: '1234567', col21: '3', col22: '1234', col23: '1234', col24: '1234', col25: '1234', col26: '1234' },
  ]);
});

const initPricingGrid = defineGrid((data, view) => {
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

  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_TASK_DIV'), width: '271', styleName: 'text-left' },
    { fieldName: 'col2', header: t('MSG_TXT_CST_NO'), width: '126', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_PRTNR_EMP_NO'), width: '128', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_ORD_YR'), width: '126', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_RESTRICTION_CLASSIFICATION'), width: '127', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_MEMO'), width: '207', styleName: 'text-left' },
    { fieldName: 'col7', header: t('MSG_TXT_APY_STRT_DAY'), width: '127', styleName: 'text-center' },
    { fieldName: 'col8', header: t('MSG_TXT_APY_END_DAY'), width: '126', styleName: 'text-center' },
    { fieldName: 'col9', header: t('MSG_TXT_RGST_USR'), width: '128', styleName: 'text-center' },
    { fieldName: 'col10', header: t('MSG_TXT_MDFC_USR'), width: '126', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '1. 총판 타조직 고객 접수 제한', col2: '040158344', col3: '1602591', col4: '2022', col5: '허용', col6: '타 주소지 추가 접수건', col7: '2022-07-01', col8: '2022-07-20', col9: '김교원', col10: '김교원' },
  ]);
});
</script>
