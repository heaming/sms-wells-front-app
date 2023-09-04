<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNY (기준정보)
2. 프로그램 ID : PGE_SNY_00002 - AS 코드관리(W-SV-U-0016M01)
3. 작성자 : gs.piit122 김동엽
4. 작성일 : 2022.11.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- AS코드관리 (http://localhost:3000/#/service/wwsny-after-service-code-mgt)
****************************************************************************************************
* 변경사항
****************************************************************************************************
- 2023-08-17 적용일자 checkbox default 선택 적용
- 2023-08-17 적용일자 default 오늘 날짜로 지정
****************************************************************************************************
-->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!--상품그룹-->
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            @change="changePdGrpCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_NM')"
        >
          <!--            rules="required"-->
          <kw-select
            v-model="searchParams.pdCd"
            :options="pds"
            first-option="all"
            option-label="cdNm"
            option-value="cd"
            :disable="searchParams.pdGrpCd === '' "
            :label="$t('MSG_TXT_PRDT_NM')"
            :rules="searchParams.pdGrpCd !== '' ? 'required' : '' "
          />
        </kw-search-item>
        <!--서비스유형-->
        <kw-search-item :label="$t('MSG_TXT_SV_TP')">
          <kw-select
            v-model="searchParams.svTpCd"
            :options="codes.SV_DV_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!--AS위치-->
        <kw-search-item :label="$t('MSG_TXT_AS_LCT')">
          <kw-select
            v-model="searchParams.asLctCd"
            :options="codes.AS_LCT_CD"
            first-option="all"
          />
        </kw-search-item>
        <!--적용일자-->
        <kw-search-item :label="$t('MSG_TXT_APPLY_DT')">
          <kw-date-picker
            v-model="searchParams.applyDate"
            :disable="searchParams.apyChk[0] !== '1' "
            :label="$t('MSG_TXT_APPLY_DT')"
            :rules="searchParams.apyChk[0] === '1' ? 'required' : '' "
          />
          <kw-option-group
            v-model="searchParams.apyChk"
            :options="codesYn"
            option-label="name"
            option-value="code"
            type="checkbox"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>{{ $t('MSG_TXT_SRCH_RSLT') }}</h3>
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
        <!--        <kw-btn
          :label="$t('MSG_BTN_PRTG')"
          dense
          icon="print"
          secondary
        />-->
        <kw-btn
          :label="$t('MSG_BTN_EXCEL_UP')"
          dense
          icon="upload_on"
          secondary
          @click="onClickExcelUpload"
        />
        <kw-btn
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          dense
          icon="download_on"
          secondary
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="pageInfo.pageSize"
        @init="initGrdMain"
      />
      <kw-action-bottom />
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
import {
  codeUtil,
  defineGrid,
  getComponentType, gridUtil,
  useDataService, useGlobal,
  useMeta,
} from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import smsCommon from '~sms-wells/service/composables/useSnCode';
import dayjs from 'dayjs';

const { getPartMaster } = smsCommon();

const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();
const grdMainRef = ref(getComponentType('KwGrid'));
const { modal, notify } = useGlobal();
let cachedParams;
const searchParams = ref({
  pdGrpCd: '',
  pdCd: '',
  apyChk: ['1'],
  applyDate: dayjs().format('YYYYMMDD'),
  svTpCd: '',
  asLctCd: '',
});
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GRP_CD',
  'SV_DV_CD',
  'AS_LCT_CD',
  'AS_PHN_CD',
  'AS_CAUS_CD',
  'SITE_AW_ATC_CD',
  'SV_BIZ_DCLSF_CD',
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codesYn = [{ code: '1', name: t('MSG_TXT_APPLY_DT') }];

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/as-codes/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: products, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(products);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  console.log(cachedParams);
  await fetchData();
}

const pds = ref([]);
async function changePdGrpCd() {
  if (searchParams.value.pdGrpCd) {
    pds.value = await getPartMaster(
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
      'X', /* 단종여부Y/N, 만약 X로 데이터가 유입되면 단종여부를 조회하지 않음 */
    );
  } else pds.value = [];
  searchParams.value.pdCd = '';
}
changePdGrpCd();

async function onClickExcelDownload() {
  const res = await dataService.get(
    '/sms/wells/service/as-codes/excel-download',
    { params: { ...cachedParams } },
  );
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: 'asCodeMngt',
    timePostfix: true,
    exportData: res.data,
  });
}
const onClickExcelUpload = async () => {
  cachedParams = cloneDeep(searchParams.value);
  const apiUrl = '/sms/wells/service/as-codes/excel-upload';
  const templateId = 'FOM_AS_CODE_MNGT';
  const extraData = cachedParams;
  const { result } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId, extraData },
  });
  if (result.status === 'S') {
    notify(t('MSG_ALT_SAVE_DATA'));
  }
};

// async function onClickExcelDownload() {
//   const res = await dataService.get('/sms/common/promotion/components/excel-download'
//   , { params: { ...cachedParams } });
//   const view = grdMainRef.value.getView();
//   await gridUtil.exportView(view, {
//   fileName: currentRoute.value.meta.menuName,
//   timePostfix: true,
//   exportData: res.data,
//   });
// }
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    {
      fieldName: 'svTpNm',
      header: t('MSG_TXT_SV_TP'),
      width: '30',
      styleName: 'text-center',
    },
    {
      fieldName: 'pdGrpNm',
      header: t('MSG_TXT_PD_GRP'),
      width: '30',
      styleName: 'text-center',
    },
    {
      fieldName: 'pdNm',
      header: t('MSG_TXT_GOODS_NM'),
      width: '150',
      styleName: 'text-left',
    },
    { fieldName: 'asLctCd', header: t('MSG_TXT_CODE'), width: '50', styleName: 'text-center' },
    {
      fieldName: 'asLctNm',
      header: t('MSG_TXT_ALTN'),
      width: '100',
      options: codes.AS_LCT_CD,
    },
    { fieldName: 'asPhnCd', header: t('MSG_TXT_CODE'), width: '30', styleName: 'text-center' },
    {
      fieldName: 'asPhnNm',
      header: t('MSG_TXT_ALTN'),
      width: '100',
      options: codes.AS_PHN_CD,
    },
    { fieldName: 'asCausCd', header: t('MSG_TXT_CODE'), width: '30', styleName: 'text-center' },
    {
      fieldName: 'asCausNm',
      header: t('MSG_TXT_ALTN'),
      width: '100',
      options: codes.AS_CAUS_CD,
    },
    {
      fieldName: 'siteAwAtcCd',
      header: t('MSG_TXT_CODE'),
      width: '30',
      styleName: 'text-center',
    },
    {
      fieldName: 'siteAwAtcNm',
      header: t('MSG_TXT_ALTN'),
      width: '50',
      options: codes.SITE_AW_ATC_CD,
    },
    { fieldName: 'fuleyAwAmt', header: t('MSG_TXT_AMT_WON'), width: '80' },
    {
      fieldName: 'svAnaHclsfCd',
      header: t('MSG_TXT_CODE'),
      width: '30',
      styleName: 'text-center',
    },
    {
      fieldName: 'svAnaHclsfNm',
      header: t('MSG_TXT_ALTN'),
      width: '100',
      options: codes.SV_BIZ_DCLSF_CD,
    },
  ];
  const fields = columns.map((item) => ({ fieldName: item.fieldName }));
  fields.find((item) => item.fieldName === 'fuleyAwAmt').dataType = 'number';
  data.setFields(fields);

  const columnLayout = [
    'svTpNm',
    'pdGrpNm',
    'pdNm',
    { direction: 'horizontal', items: ['asLctCd', 'asLctNm'], header: { text: t('MSG_TXT_AS_LCT') } },
    { direction: 'horizontal', items: ['asPhnCd', 'asPhnNm'], header: { text: t('MSG_TXT_AS_PHN') } },
    { direction: 'horizontal', items: ['asCausCd', 'asCausNm'], header: { text: t('MSG_TXT_AS_CAUS') } },
    { direction: 'horizontal', items: ['siteAwAtcCd', 'siteAwAtcNm', 'fuleyAwAmt'], header: { text: t('MSG_TXT_SITE_AW') } },
    { direction: 'horizontal',
      items: ['svAnaHclsfCd', 'svAnaHclsfNm'],
      header: { text: t('MSG_TXT_TASK_TYPE') } },
  ];

  view.setColumnLayout(columnLayout);
  view.setColumns(columns);
  view.editOptions.editable = false; // Grid Editable On
  view.rowIndicator.visible = false;
  view.displayOptions.selectionStyle = 'singleRow';
});
</script>
