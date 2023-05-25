<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaCustomerFilterMgtM - 고객필터정보관리 화면
3. 작성자 : gs.ritvik.m
4. 작성일 : 2023.04.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 고객필터정보관리 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search :cols="4">
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_CLS_QUERY_COND')">
          <kw-select
            :model-value="['']"
            :label="$t('MSG_TXT_CLS_QUERY_COND')"
            :options="[$t('MSG_TXT_MANAGER'),'B','C']"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_FILTER_YR_MN')"
          required
        >
          <kw-date-picker
            :label="$t('MSG_TXT_FILTER_YR_MN')"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_USWY_DV')"
          required
        >
          <kw-select
            :label="$t('MSG_TXT_USWY_DV')"
            :model-value="['']"
            :options="[$t('MSG_TXT_ALL'),'B','C']"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_CODE')"
          required
        >
          <kw-input
            :label="$t('MSG_TXT_PRDT_CODE')"
            icon="search"
            clearable
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <h3>{{ $t('MSG_TXT_SRCH_RSLT') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount.grdMain"
          />
        </template>
        <span class="kw-fc--black3 text-weight-regular">(단위:원)</span>
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount.grdMain"
        @init="initGrdMain"
      />
      <div class="grid-horizontal-wrap">
        <div class="grid-horizontal-wrap__section">
          <div>
            <h3>
              {{ $t('MSG_TXT_FILTER_PROD_CUST_INFO') }}
            </h3>
            <kw-action-top>
              <template #left>
                <kw-paging-info
                  :total-count="pageInfo.totalCount.grdProdCustInfo"
                />
                <span class="ml8">(단위:원)</span>
              </template>
              <kw-btn
                dense
                secondary
                :label="$t('MSG_TXT_INIT_FILTER_INFO')"
              />
              <kw-separator
                vertical
                inset
                spaced
              />
              <kw-btn
                :label="$t('MSG_TXT_FILTER_REG')"
                primary
                dense
              />
            </kw-action-top>

            <kw-grid
              ref="grdProdCustInfoRef"
              name="grdProdCustInfo"
              :page-size="pageInfo.pageSize"
              :total-count="pageInfo.totalCount.grdProdCustInfo"
              @init="initGrdProdCustInfo"
            />
          </div>
        </div>

        <div class="grid-horizontal-wrap__section">
          <div>
            <h3>
              {{ $t('MSG_TXT_FILTER_PROD_CUST_INFO') }}
            </h3>
            <kw-action-top>
              <template #left>
                <kw-paging-info
                  :total-count="pageInfo.totalCount.grdProdCustDet"
                />
                <span class="ml8">(단위:원)</span>
              </template>
            </kw-action-top>
            <kw-grid
              ref="grdProdCustDetRef"
              name="grdProdCustDet"
              :page-size="pageInfo.pageSize"
              :total-count="pageInfo.totalCount.grdProdCustDet"
              @init="initGrdProdCustDet"
            />
          </div>
        </div>
      </div>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, defineGrid, useMeta } from 'kw-lib';

const { t } = useI18n();
const { getConfig } = useMeta();

const pageInfo = ref({
  totalCount: {
    grdMain: 0,
    grdProdCustInfo: 0,
    grdProdCustDet: 0,
  },
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const grdMainRef = ref(getComponentType('KwGrid'));
const grdProdCustInfoRef = ref(getComponentType('KwGrid'));
const grdProdCustDetRef = ref(getComponentType('KwGrid'));
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

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
    { fieldName: 'col27' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CNTR_NO'), width: '131', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_CST_NM'), width: '104', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_MPNO'), width: '131', styleName: 'text-center' },
    { fieldName: 'col4', header: `1.${t('MSG_TXT_FILTER_PROD')}`, width: '104', styleName: 'text-center' },
    { fieldName: 'col5', header: `1.${t('MSG_TXT_FILTER_PROD_NM')}`, width: '197' },
    { fieldName: 'col6', header: `2.${t('MSG_TXT_FILTER_PROD')}`, width: '104', styleName: 'text-center' },
    { fieldName: 'col7', header: `2.${t('MSG_TXT_FILTER_PROD_NM')}`, width: '197' },
    { fieldName: 'col8', header: `3.${t('MSG_TXT_FILTER_PROD')}`, width: '104', styleName: 'text-center' },
    { fieldName: 'col9', header: `3.${t('MSG_TXT_FILTER_PROD_NM')}`, width: '197' },
    { fieldName: 'col10', header: `4.${t('MSG_TXT_FILTER_PROD')}`, width: '104' },
    { fieldName: 'col11', header: `4.${t('MSG_TXT_FILTER_PROD_NM')}`, width: '197' },
    { fieldName: 'col12', header: `5.${t('MSG_TXT_FILTER_PROD')}`, width: '104' },
    { fieldName: 'col13', header: `5.${t('MSG_TXT_FILTER_PROD_NM')}`, width: '197' },
    { fieldName: 'col14', header: t('MSG_TXT_USWY_DV'), width: '104', styleName: 'text-center' },
    { fieldName: 'col15', header: `BS ${t('MSG_TXT_CYCL')}`, width: '104', styleName: 'text-right' },
    { fieldName: 'col16', header: t('MSG_TXT_SEL_TYPE'), width: '104', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_MSH_DV'), width: '104', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_DT_OF_SALE'), width: '119', styleName: 'text-center' },
    { fieldName: 'col19', header: t('MSG_TXT_CTT_D'), width: '119', styleName: 'text-center' },
    { fieldName: 'col20', header: t('MSG_TXT_INST_CLS'), width: '93' },
    { fieldName: 'col21', header: t('MSG_TXT_FLT_AMT'), width: '93' },
    { fieldName: 'col22', header: t('MSG_TXT_FLT_QUANT'), width: '93' },
    { fieldName: 'col23', header: t('MSG_TXT_CTT_CD'), width: '93' },
    { fieldName: 'col24', header: t('MSG_TXT_RE_CNT'), width: '118' },
    { fieldName: 'col25', header: t('MSG_TXT_CTT_ICHR'), width: '93', styleName: 'text-center' },
    { fieldName: 'col26', header: t('MSG_TXT_SPL_TERMS'), width: '93' },
    { fieldName: 'col27', header: t('MSG_TXT_REFER_ARTC'), width: '93' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  data.setRows([
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
    { col1: 'W2022-123457', col2: '김고객', col3: '010-****-1234', col4: '4972', col5: '8인치웰스카본', col6: '4973', col7: '8인치콜플랙스필터', col8: '4972', col9: '8인치웰스카본', col10: '', col11: '', col12: '', col13: '', col14: '0', col15: '3', col16: '2', col17: '1', col18: '20.170.803', col19: '2022-12-12', col20: '', col21: '', col22: '', col23: '', col24: '', col25: '0', col26: '', col27: '' },
  ]);
});

const initGrdProdCustInfo = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
    { fieldName: 'col5' },
    { fieldName: 'col6' },
    { fieldName: 'col7' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CNTR_NO'), width: '131', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_USWY_DV'), width: '104', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_FILTER_PROD'), width: '104', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_FLT_NM'), width: '197' },
    { fieldName: 'col5', header: t('MSG_TXT_QTY'), width: '104', styleName: 'text-right' },
    { fieldName: 'col6', header: t('MSG_TXT_EXPNS'), width: '104', styleName: 'text-right' },
    { fieldName: 'col7', header: t('MSG_TXT_AMT'), width: '104', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: 'W2022-123457', col2: '0', col3: '4972', col4: '8인치웰스카본', col5: '0', col6: '0', col7: '0' },
    { col1: 'W2022-123457', col2: '0', col3: '4972', col4: '8인치웰스카본', col5: '0', col6: '0', col7: '0' },
    { col1: 'W2022-123457', col2: '0', col3: '4972', col4: '8인치웰스카본', col5: '0', col6: '0', col7: '0' },
    { col1: 'W2022-123457', col2: '0', col3: '4972', col4: '8인치웰스카본', col5: '0', col6: '0', col7: '0' },
    { col1: 'W2022-123457', col2: '0', col3: '4972', col4: '8인치웰스카본', col5: '0', col6: '0', col7: '0' },
    { col1: 'W2022-123457', col2: '0', col3: '4972', col4: '8인치웰스카본', col5: '0', col6: '0', col7: '0' },
    { col1: 'W2022-123457', col2: '0', col3: '4972', col4: '8인치웰스카본', col5: '0', col6: '0', col7: '0' },
  ]);
});

const initGrdProdCustDet = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'col1' },
    { fieldName: 'col2' },
    { fieldName: 'col3' },
    { fieldName: 'col4' },
  ];

  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_USWY_DV'), width: '104', styleName: 'text-center' },
    { fieldName: 'col2', header: t('MSG_TXT_PRDT_CODE'), width: '104', styleName: 'text-center' },
    { fieldName: 'col3', header: t('MSG_TXT_FILTER_PROD'), width: '104', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_FLT_NM'), width: '197' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: '0', col2: '4090', col3: '4972', col4: '8인치웰스카본' },
    { col1: '0', col2: '4090', col3: '4972', col4: '8인치웰스카본' },
    { col1: '0', col2: '4090', col3: '4972', col4: '8인치웰스카본' },
    { col1: '0', col2: '4090', col3: '4972', col4: '8인치웰스카본' },
    { col1: '0', col2: '4090', col3: '4972', col4: '8인치웰스카본' },
    { col1: '0', col2: '4090', col3: '4972', col4: '8인치웰스카본' },
  ]);
});

</script>

<style scoped>
</style>
