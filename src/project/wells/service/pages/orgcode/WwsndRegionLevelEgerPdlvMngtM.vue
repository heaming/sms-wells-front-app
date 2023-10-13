<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC
 2. 프로그램 ID : [K-W-SV-U-0309M01] WwsndRegionLevelEgerPdlvMngtM - 급지 엔지니어 출고지 관리
 3. 작성자 : gs.piit231
 4. 작성일 : 2023.10.05
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
  -
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈','depth1','depth2', '급지 엔지니어출고지관리']"
      />
    </template>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <!-- 조회일자 -->
        <kw-search-item :label="$t('MSG_TXT_SRCH_DT')">
          <kw-date-picker
            v-model="searchParams.inqrDt"
            rules="required"
          />
        </kw-search-item>
        <!--서비스센터-->
        <kw-search-item :label="$t('MSG_TXT_SV_CNR')">
          <kw-select
            v-model="searchParams.ogId"
            :options="svcCode"
            first-option="all"
            option-label="ogNm"
            option-value="ogId"
          />
        </kw-search-item>
        <!-- 승인여부 -->
        <kw-search-item :label="$t('MSG_TXT_APPR_STS')">
          <kw-option-group
            v-model="searchParams.fnitAprRsCd"
            :options="[{ codeId: 'Y', codeName: t('승인항목만 보기') },
                       { codeId: 'ALL', codeName: t('전체보기') }]"
            class="kw-option-group--multi-line"
            type="radio"
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
        <!-- 저장 -->
        <kw-btn
          v-permission:update
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- label="엑셀 다운로드" -->
        <kw-btn
          icon="download_on"
          secondary
          dense
          :label="t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload2"
        />
        <!-- <kw-btn
          icon="download_on"
          secondary
          dense
          :label="t('MSG_BTN_EXCEL_DOWN')"
          :disable="isExcelDownloadChk"
          @click="onClickExcelDownload2"
        /> -->
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 승인 -->
        <kw-btn
          dense
          primary
          :disable="pageInfo.totalCount === 0"
          :label="t('MSG_BTN_APPR')"
          @click="onClickAppr"
        />
        <!-- <kw-btn
            v-if="isShowApprv"
            v-permission:update
            v-permission:create
            :label="t('MSG_BTN_APPR')"
            class="ml8"
            primary
            @click="onClickAppr"
          /> -->
      </kw-action-top>
      <kw-grid
        ref="grdRef"
        :visible-rows="10"
        @init="initGrid"
      />
      <kw-pagination
        :page-index="1"
        :total-count="100"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, useMeta, getComponentType, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { notify } = useGlobal();
const { getConfig } = useMeta();

const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS', // 페이지 사이즈 옵션
  'PDLV_DV_CD',
);
console.log('codes.PDLV_DV_CD >>>>>', codes.PDLV_DV_CD);

const svcCode = (await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } })).data;
console.log('svcCode >>>>>', svcCode);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const searchParams = ref({
  inqrDt: dayjs().format('YYYYMMDD'),
  ogId: '',
  fnitAprRsCd: 'Y',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const grdRef = ref(getComponentType('KwGrid'));

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/wsnd-rglvl-eger-pdlv-mngt/paging', { params: { ...cachedParams, ...pageInfo.value } });
  console.log('res.data >>>>', res.data);
  const { list, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

async function onClickSearch() {
  console.log('onClickSearch START =========');
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickSave() {
  console.log('onClickSave START =========');
  await notify(t('작업 예정'));
}

async function onClickAppr() {
  console.log('onClickAppr START =========');
  await notify(t('작업 예정'));
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
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
  ];

  const columns = [
    { fieldName: 'col1', header: '서비스센터', width: '130', styleName: 'text-center' }, // 서비스센터
    { fieldName: 'col2', header: '사번', width: '140', styleName: 'text-center' }, // 사번
    { fieldName: 'col3', header: '성명', width: '140', styleName: 'text-center' }, // 성명
    { fieldName: 'col4', header: '기본출고지', width: '140', styleName: 'text-center' }, // 기본출고지
    { fieldName: 'col5', header: '기본출고지 주소', width: '190', styleName: 'text-left' }, // 기본출고지 주소
    { // 출장출고지
      fieldName: 'col6',
      header: t('출장출고지'),
      width: '140',
      styleName: 'text-center',
      editor: {
        type: 'dropdown',
      },
      options: codes.PDLV_DV_CD },
    { fieldName: 'col7', header: '출장출고지 주소', width: '190', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
}
</script>
