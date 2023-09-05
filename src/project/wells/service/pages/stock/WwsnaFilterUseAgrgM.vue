<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaFilterUseAgrgM - 필터사용집계현황(K-W-SV-U-0262M01)
3. 작성자 : jungheejin
4. 작성일 : 2023-09-01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 필터사용집계현황 http://localhost:3000/#/service/wwsna-filter-use-agrg
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      :default-visible-rows="3"
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
        <kw-search-item
          :label="$t('MSG_TXT_FILTER_KND')"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_TASK_TYPE')"
        >
          <kw-select
            v-model="searchParams.svBizHclsfCd"
            :options="codes.SV_BIZ_HCLSF_CD.filter((v) => ['1', '2', '3'].includes(v.codeId))"
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
            @update:model-value="onChangeMngrDvCd"
          />
        </kw-search-item>
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
            :total-count="totalCount"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :total-count="totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { getComponentType, defineGrid, gridUtil, useDataService, codeUtil } from 'kw-lib';
import { cloneDeep, isEmpty, split } from 'lodash-es';
import dayjs from 'dayjs';
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';
import WwsnEngineerOgSearchItemGroup from '~sms-wells/service/components/WwsnEngineerOgSearchItemGroup.vue';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { t } = useI18n();
const { currentRoute } = useRouter();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/filter-use-agrg';

const codes = await codeUtil.getMultiCodes(
  'SV_BIZ_HCLSF_CD',
  'PD_GRP_CD',
  'ITM_KND_CD',
  'MNGR_DV_CD',
);
const searchParams = ref({
  startDt: now.startOf('month').format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  pdGrpCd: '',
  svBizHclsfCd: '',
  mngrDvCd: '1',
  ogId: '',
  prtnrNo: '',
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  dgr3LevlOgId: '',
  rgsnYn: 'N', // 퇴사자 제외 여부
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
const totalCount = ref(0);

let cachedParams;
let gridView;
let gridData;
let fieldsObj;
let pdFields;
let filterProducts;

// 필터 상품 목록 조회
async function fetchFilterProducts() {
  const result = await dataService.get(`${baseUrl}/filter-products`, { params: searchParams.value });
  if (result.data.length > 0) {
    filterProducts = result.data;
  }
}
async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const list = res.data;
  totalCount.value = list.length;

  // 필터상품 동적 필드 정의
  const strPds = [];
  list.forEach((data) => {
    // 상품목록 가져오기(상품코드_상품수량)
    const pds = split(data.pdCds, ',');
    // 각 담당자가 사용하는 필터 상품목록만큼 품목코드 추출
    pds.forEach((pd) => {
      const pdCd = split(pd, '_');
      if (!isEmpty(pdCd) && pdCd.length > 1) {
        strPds.push(pdCd[0]); // 필터 상품 그리드 헤더위한 데이터 저장
        data[`pdCd${pdCd[0]}`] = pdCd[1]; // 상품수량 저장
      }
    });
  });
  // 상품 중복 필터링
  pdFields = [];
  const pdCds = strPds.filter((v, i) => strPds.indexOf(v) === i);
  if (filterProducts.length > 0 && pdCds.length > 0) {
    // 전체 상품목록내에서 검색조건에 맞는 품목코드 필터 데이터만 추출
    const productFields = filterProducts.filter((v) => pdCds.indexOf(v.pdCd) !== -1);
    if (productFields.length > 0) {
      pdFields.push(productFields);
    }
  }
  fieldsObj.setFields();
  // 필터상품 동적 필드 정의 END
  await nextTick();
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchFilterProducts();
  await nextTick();
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
fieldsObj = {
  // 그리드 공통컬럼
  defaultFields: [
    {
      fieldName: 'dgr1LevlOgCd',
      header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'),
      width: '100',
      styleName: 'text-center',
      mergeRule: { criteria: 'value' },
    },
    {
      fieldName: 'dgr2LevlOgCd',
      header: t('MSG_TXT_RGNL_GRP'),
      width: '100',
      styleName: 'text-center',
      mergeRule: { criteria: 'value' },
    },
    {
      fieldName: 'dgr3LevlOgCd',
      header: t('MSG_TXT_BRANCH'),
      width: '100',
      styleName: 'text-center',
      mergeRule: { criteria: 'value' },
    },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '90', styleName: 'text-center' }, // 사번
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), styleName: 'text-center', width: '90' }, // 성명
    { fieldName: 'wareNo', header: t('MSG_TXT_WARE_CD'), styleName: 'text-center', width: '90' }, // 창고번호
    { fieldName: 'bldNm', header: t('MSG_TXT_WARE_NM'), styleName: 'text-center', width: '140' }, // 빌딩명
  ],
  defaultLayout: [
    'dgr1LevlOgCd',
    'dgr2LevlOgCd',
    'dgr3LevlOgCd',
    {
      direction: 'horizontal',
      header: t('MSG_TXT_PIC'),
      items: ['prtnrNo', 'prtnrKnm', 'bldNm', 'wareNo'],
    },
  ],
  setFields() {
    const columns = [...fieldsObj.defaultFields];
    // 헤더 부분 merge
    const layoutColumns = [...fieldsObj.defaultLayout];
    const columnProductItems = [];
    const columnProductTotals = [];
    // 상품 동적필드
    if (pdFields.length > 0) {
      const columnPdFields = [...pdFields];
      columnPdFields.forEach((row) => {
        row.forEach((data) => {
          // 상품 전체 필드 (상품코드)
          columnProductTotals.push(
            {
              fieldName: `pdCd${data.pdCd}`,
              width: '130',
              header: `${data.pdCd}`,
              dataType: 'number',
              numberFormat: '#,##0',
              footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
            },
          );
          // 상품 전체 필드 (상품명)
          columnProductTotals.push(
            {
              fieldName: `pdNm${data.pdCd}`,
              width: '130',
              header: `${data.pdNm}`,
              dataType: 'number',
              numberFormat: '#,##0',
              footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right text-weight-bold' },
            },
          );
          // 상품별 헤더
          columnProductItems.push(
            {
              fieldName: `pdNm${data.pdCd}`,
              header: `${data.pdNm}`,
              items: [`pdCd${data.pdCd}`],
            },
          );
        });
      });
      layoutColumns.push(
        {
          direction: 'horizontal',
          header: `${t('MSG_TXT_ITM_NM')} / ${t('MSG_TXT_ITM_CD')}`,
          items: columnProductItems,
        },
      );
      columns.push(...columnProductTotals);
    }
    // 필드
    const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
    gridData.setFields(fields);
    gridView.setColumns(columns);
    gridView.setColumnLayout([...layoutColumns]);

    if (columns.length > 7) {
      gridView.setFixedOptions({ colCount: 4 });
    } else {
      gridView.setFixedOptions({ colCount: 0 });
    }
    gridView.columnByName('prtnrNo').setFooters({ text: t('MSG_TXT_SUM'), styleName: 'text-left text-weight-bold' });
    gridView.setFooters({ visible: true, items: [{ height: 30 }] });
  },
  getColumnNameList(objList) {
    return objList.map((obj) => ({ header: obj.header, items: obj.items, fieldName: obj.fieldName }));
  },
};
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    ...fieldsObj.getColumnNameList(fieldsObj.defaultFields),
  ];

  const columns = [
    ...fieldsObj.defaultFields,
  ];
  const layoutColumns = [...fieldsObj.defaultLayout];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout([...layoutColumns]);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  gridView = view;
  gridData = data;
});
</script>
