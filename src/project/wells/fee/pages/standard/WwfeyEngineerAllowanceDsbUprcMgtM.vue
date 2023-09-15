<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEY
2. 프로그램 ID : WwfeyEngineerAllowanceDsbUprcMgtM
3. 작성자 : jingun.jung
4. 작성일 : 2023.05.23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 웰스 엔지니어 현장 수당 단가를 관리하는 메인화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="0"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 상품그룹 -->
        <kw-search-item
          :label="t('MSG_TXT_PD_GRP')"
        >
          <kw-select
            v-model="searchParams.productGroupCode"
            :options="codes['PD_GRP_CD']"
            required
          />
        </kw-search-item>
        <!-- 상품유형 -->
        <kw-search-item
          :label="t('MSG_TXT_PRDT_TYPE')"
        >
          <kw-select
            v-model="searchParams.productGroupDetailCode"
            :options="filterdGroupDetailCode"
            required
          />
        </kw-search-item>
        <!-- 급지 -->
        <kw-search-item
          :label="t('MSG_TXT_RGLVL')"
        >
          <kw-select
            v-model="searchParams.regionLevelDivideCode"
            :options="codes['RGLVL_DV_CD']"
            required
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 현재적용자료 -->
        <kw-search-item
          :label="t('MSG_TXT_CRTL_APY_MTR')"
        >
          <kw-checkbox
            v-model="searchParams.currentlyApplyDataYn"
            :label="$t('MSG_TXT_INC')"
          />
        </kw-search-item>
        <kw-search-item />
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>

        <kw-btn
          dense
          secondary
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount.value === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_TXT_SITE_AW_UPRC_RGST')"
          primary
          dense
          :disable="totalCount.value === 0"
          @click="openManagementPopup('CREATE')"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        class="fee-standard-page__grid"
        :visible-rows="pageSize"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import {
  codeUtil,
  defineGrid,
  getComponentType, gridUtil,
  modal,
  notify,
  useDataService,
} from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService('PGE_FEY_00052');
const { t } = useI18n();
const codes = await codeUtil.getMultiCodes(
  'RGLVL_DV_CD',
  'PD_GRP_CD',
  'PD_GRP_DTL_CD',
  'SITE_AW_GRP_CD',
  'SITE_AW_ATC_CD',
  'SV_TP_CD_BK',
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const totalCount = ref(0);
const pageSize = ref(30);
let cachedParams;
const searchParams = ref({
  regionLevelDivideCode: '1', // 급지구분코드
  productGroupCode: '1', // 상품그룹코드
  productGroupDetailCode: 'B1', // 상품그룹상세코드
  currentlyApplyDataYn: 'N', // 현재적용데이터여부
});

async function fetchPage() {
  const response = await dataService.get('/sms/wells/fee/engineer-allowances/unit-prices', { params: cachedParams });

  totalCount.value = response.data.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(response.data);
  if (totalCount.value < 30) {
    pageSize.value = totalCount.value;
  } else {
    pageSize.value = 30;
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchPage();
}

async function openManagementPopup(mode) {
  const view = grdMainRef.value.getView();
  const selectedRowData = gridUtil.getSelectedRowValues(view);
  const managementPopupName = 'WwfeyEngineerAllowanceDsbUprcMgtP';
  const { result, payload } = await modal({
    component: managementPopupName,
    componentProps: { mode,
      searchParams: cloneDeep(searchParams.value),
      modelValue: selectedRowData ? selectedRowData[0] : selectedRowData },
  });
  if (result) {
    if (payload === 'CREATE') {
      notify(t('MSG_ALT_CRT_FSH'));
    } else if (payload === 'UPDATE') {
      notify(t('MSG_ALT_MODIFIED'));
    } else if (payload === 'DELETE') {
      notify(t('MSG_ALT_DELETED'));
    }
  }
  await onClickSearch();
}

const filterdGroupDetailCode = computed(() => {
  const data = [{ codeId: '', codeName: t('MSG_BTN_PREV') }];
  data.push(
    // eslint-disable-next-line no-unsafe-optional-chaining
    ...(codes?.PD_GRP_DTL_CD.filter((item) => item.userDfn03 === searchParams.value.productGroupCode)),
  );
  searchParams.value.productGroupDetailCode = data[1]?.codeId;

  return data;
});

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: t('MSG_TXT_EGER_AW_UPRC'),
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'svTpCd' },
    { fieldName: 'siteAwAtcCd' },
    { fieldName: 'siteAwGrpCd' },
    { fieldName: 'pdGrpCd' },
    { fieldName: 'rglvlDvCd' },
    { fieldName: 'apyStrtdt' },
    { fieldName: 'apyEnddt' },
    { fieldName: 'fuleyAwAmt', dataType: 'number' },
    { fieldName: 'rolLyr1TopmrAwAmt', dataType: 'number' },
    { fieldName: 'rolLyr1UplrAwAmt', dataType: 'number' },
    { fieldName: 'rolLyr1MdlyrAwAmt', dataType: 'number' },
    { fieldName: 'rolLyr1LolyrAwAmt', dataType: 'number' },
    { fieldName: 'rolL2UplrAwAmt', dataType: 'number' },
    { fieldName: 'rolL2MdlyrAwAmt', dataType: 'number' },
    { fieldName: 'rolL2LolyrAwAmt', dataType: 'number' },
    { fieldName: 'rolL3AwAmt', dataType: 'number' },
    { fieldName: 'crwkAwAmt', dataType: 'number' },
    { fieldName: 'indvEntrpAwAmt', dataType: 'number' },
    { fieldName: 'mngerWkUprc', dataType: 'number' },
    { fieldName: 'dsbBaseSn', dataType: 'number' },
    { fieldName: 'rmkCn' },
    { fieldName: 'useYn' },
  ];

  const columns = [
    {
      fieldName: 'svTpCd',
      header: t('MSG_TXT_TYPE'), // 유형
      width: '100',
      options: codes.SV_TP_CD_BK,
      default: codes.SV_TP_CD_BK[0],
      styleName: 'text-left',
    },
    {
      name: 'siteAwGrpNm',
      fieldName: 'siteAwGrpCd',
      header: t('MSG_TXT_SITE_AW_GRP'), // 현장수당그룹
      width: '150',
      options: codes.SITE_AW_GRP_CD,
      default: codes.SITE_AW_GRP_CD[0],
      styleName: 'text-left',
    },
    {
      fieldName: 'siteAwGrpCd',
      header: t('MSG_TXT_CODE'), // 코드
      width: '80',
      styleName: 'text-center',
    },
    {
      name: 'siteAwAtcNm',
      fieldName: 'siteAwAtcCd',
      header: t('MSG_TXT_SITE_AW_ATC'), // 현장수당항목
      width: '150',
      options: codes.SITE_AW_ATC_CD,
      default: codes.SITE_AW_ATC_CD[0],
      styleName: 'text-left',
    },
    {
      fieldName: 'siteAwAtcCd',
      header: t('MSG_TXT_CODE'), // 코드
      width: '100',
    },
    {
      fieldName: 'apyStrtdt',
      header: 'From', // From
      width: '100',
      styleName: 'text-center',
      datetimeFormat: 'yyyy-MM-dd',
    },
    {
      fieldName: 'apyEnddt',
      header: 'To', // To
      width: '100',
      styleName: 'text-center',
      datetimeFormat: 'yyyy-MM-dd',
    },
    {
      fieldName: 'fuleyAwAmt',
      header: t('MSG_TXT_PRMEMP'), // 정규직
      width: '100',
      styleName: 'text-right',
    },
    {
      fieldName: 'rolLyr1TopmrAwAmt',
      header: t('MSG_TXT_ROL_LYR1_TOPMR'), // 직무1급 수석
      width: '100',
      styleName: 'text-right',
    },
    {
      fieldName: 'rolLyr1UplrAwAmt',
      header: t('MSG_TXT_ROL_LYR1_H'), // 직무1급 상
      width: '100',
      styleName: 'text-right',
    },
    {
      fieldName: 'rolLyr1MdlyrAwAmt',
      header: t('MSG_TXT_ROL_LYR1_M'), // 직무1급 중
      width: '100',
      styleName: 'text-right',
    },
    {
      fieldName: 'rolLyr1LolyrAwAmt',
      header: t('MSG_TXT_ROL_LYR1_L'), // 직무1급 하
      width: '100',
      styleName: 'text-right',
    },
    {
      fieldName: 'rolL2UplrAwAmt',
      header: t('MSG_TXT_ROL_L2_H'), // 직무2급 상
      width: '100',
      styleName: 'text-right',
    },
    {
      fieldName: 'rolL2MdlyrAwAmt',
      header: t('MSG_TXT_ROL_L2_M'), // 직무2급 중
      width: '100',
      styleName: 'text-right',
    },
    {
      fieldName: 'rolL2LolyrAwAmt',
      header: t('MSG_TXT_ROL_L2_L'), // 직무2급 하
      width: '100',
      styleName: 'text-right',
    },
    {
      fieldName: 'rolL3AwAmt',
      header: t('MSG_TXT_ROL_L3'), // 직무3급
      width: '100',
      styleName: 'text-right',
    },
    {
      fieldName: 'crwkAwAmt',
      header: t('MSG_TXT_CRWK'), // 계약직
      width: '100',
      styleName: 'text-right',
    },
    {
      fieldName: 'indvEntrpAwAmt',
      header: t('MSG_TXT_PRVT_BUSINESS'), // 개인사업자
      width: '100',
      styleName: 'text-right',
    },
  ];

  const layout = [
    'svTpCd',
    'siteAwGrpNm',
    'siteAwGrpCd',
    'siteAwAtcNm',
    'siteAwAtcCd',
    {
      header: {
        text: t('MSG_TXT_ACEPT_PERIOD'),
      },
      direction: 'horizontal',
      items: [
        'apyStrtdt',
        'apyEnddt',
      ],
    },
    {
      header: {
        text: t('MSG_TXT_EGER_AW'),
      },
      direction: 'horizontal',
      items: [
        'fuleyAwAmt',
        'rolLyr1TopmrAwAmt',
        'rolLyr1UplrAwAmt',
        'rolLyr1MdlyrAwAmt',
        'rolLyr1LolyrAwAmt',
        'rolL2UplrAwAmt',
        'rolL2MdlyrAwAmt',
        'rolL2LolyrAwAmt',
        'rolL3AwAmt',
        'crwkAwAmt',
        'indvEntrpAwAmt',
      ],
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(layout);
  // view.setColumnProperty('svTpCd', 'equalBlank', true);
  // view.setColumnProperty('siteAwGrpCd', 'equalBlank', true);
  // view.setColumnProperty('siteAwGrpNm', 'equalBlank', true);
  // view.setColumnProperty('siteAwAtcCd', 'equalBlank', true);
  // view.setColumnProperty('siteAwAtcNm', 'equalBlank', true);
  view.rowIndicator.visible = true;

  // region event callbacks for popup
  view.onCellDblClicked = () => {
    openManagementPopup('UPDATE');
  };
  onClickSearch();
});

</script>
