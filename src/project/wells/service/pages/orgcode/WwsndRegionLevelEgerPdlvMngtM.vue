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
          @click="onClickExcelDownload"
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
import { codeUtil, useDataService, useMeta, getComponentType, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { notify } = useGlobal();
const { getConfig } = useMeta();

const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS', // 페이지 사이즈 옵션
  'CNTR_CH_PRGS_STAT_CD',
);
console.log('codes.CNTR_CH_PRGS_STAT_CD >>>', codes.CNTR_CH_PRGS_STAT_CD);

// 서비스센터 조회
const svcCode = (await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } })).data;
console.log('svcCode >>>', svcCode);

// 출고지 정보 조회
const pdlvList = (await dataService.get('/sms/wells/service/placeOfDelivery/pdlv-list')).data;
const pdlvRef = ref([]);
if (pdlvList) {
  pdlvList.forEach((data) => {
    pdlvRef.value.push({
      pdlvNo: data.pdlvNo,
      pdlvNm: data.pdlvNm,
      pdlvAdd: data.pdlvAdd,
      pdlvKey: data.pdlvKey,
    });
  });
}
console.log('pdlvRef >>>', pdlvRef);

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

async function onClickExcelDownload() {
  const res = await dataService.get('/sms/wells/service/wsnd-rglvl-eger-pdlv-mngt/excel-download', searchParams.value);
  console.log('res.data >>>>>>', res.data);
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'cnrOgId' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'pdlvNm' },
    { fieldName: 'pdlvAdr' },
    { fieldName: 'bstrPdlvNm' },
    { fieldName: 'bstrPdlvAdr' },
    { fieldName: 'apyStrtdt', dataType: 'date' },
    { fieldName: 'apyEnddt', dataType: 'date' },
    { fieldName: 'apr' },
    { fieldName: 'aprTeamNm' },
    { fieldName: 'aprPrtnrNo' },
    { fieldName: 'aprPrtnrKnm' },
    { fieldName: 'bstrRson' },
  ];

  const columns = [
    { fieldName: 'cnrOgId', header: t('MSG_TXT_SV_CNR'), width: '130', styleName: 'text-center', editable: false }, // 서비스센터..센터조직ID
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '140', styleName: 'text-center', editable: false }, // 사번
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '140', styleName: 'text-center', editable: false }, // 성명
    {
      fieldName: 'pdlvNm',
      header: t('기본출고지'),
      width: '170',
      styleName: 'text-center',
      editor: {
        type: 'list',
      },
      options: pdlvRef.value,
      optionValue: 'pdlvKey',
      optionLabel: 'pdlvNm',
    }, // 기본출고지
    { fieldName: 'pdlvAdr', header: t('기본출고지 주소'), width: '190', styleName: 'text-center', editable: false },
    { // 출장출고지
      fieldName: 'bstrPdlvNm',
      header: t('출장출고지'),
      width: '190',
      styleName: 'text-center',
      editor: {
        type: 'list',
      },
      options: pdlvRef.value,
      optionValue: 'pdlvKey',
      optionLabel: 'pdlvNm',
      styleCallback(grid, dataCell) {
        const ret = {};
        const checkYn = grid.getValue(dataCell.index.itemIndex, 'apr');
        const checkAprPrtnrNo = grid.getValue(dataCell.index.itemIndex, 'aprPrtnrNo');
        console.log('checkYn >>>>>>>>', checkYn);
        if (checkYn === 'Y' && !isEmpty(checkAprPrtnrNo)) {
          ret.editable = false;
        } else {
          ret.editable = true;
        }
        return ret;
      },
    },
    { fieldName: 'bstrPdlvAdr', header: t('출장출고지 주소'), width: '190', styleName: 'text-center', editable: false },
    { // 적용시작일
      fieldName: 'apyStrtdt',
      header: {
        text: t('MSG_TXT_APY_STRT_DAY'), // 적용시작일
      },
      width: '150',
      editor: {
        type: 'btdate',
      },
      datetimeFormat: 'date',
      styleName: 'text-center',
    },
    { // 적용종료일
      fieldName: 'apyEnddt',
      header: {
        text: t('MSG_TXT_APY_END_DAY'), // 적용종료일
      },
      width: '150',
      editor: {
        type: 'btdate',
      },
      datetimeFormat: 'date',
      styleName: 'text-center',
    },
    { // 승인
      fieldName: 'apr',
      header: t('MSG_TXT_APPR'),
      width: '50',
      styleName: 'text-center',
      renderer: { type: 'check', trueValues: 'Y' },
      editable: false,
    },
    { fieldName: 'aprTeamNm', header: '승인팀명', width: '100', styleName: 'text-center', editable: false }, // 승인팀명
    { fieldName: 'aprPrtnrNo', header: '승인자사번', width: '80', styleName: 'text-center', editable: false }, // 승인자사번
    { fieldName: 'aprPrtnrKnm', header: '승인자성명', width: '100', styleName: 'text-center', editable: false }, // 승인자성명
    { fieldName: 'bstrRson', header: '출장사유', width: '200', styleName: 'text-center', editable: false }, // 출장사유
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.editOptions.editable = true;
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onGetEditValue = (grd, idx, editResult) => {
    if (idx.fieldName === 'apyStrtdt') {
      console.log('idx >>>', idx);
      console.log('editResult.value >>>', editResult.value);
      grd.checkItem(idx.itemIndex, true);
      grd.setValue(idx.dataRow, 'apyStrtdt', editResult.value);
    }
    if (idx.fieldName === 'apyEnddt') {
      grd.checkItem(idx.itemIndex, true);
      grd.setValue(idx.dataRow, 'apyEnddt', editResult.value);
    }
    if (idx.fieldName === 'pdlvNm') {
      grd.checkItem(idx.itemIndex, true);
      grd.setValue(idx.dataRow, 'pdlvAdr', pdlvRef.value.filter((v) => v.pdlvKey === editResult.value)[0].pdlvAdd);
    }
    if (idx.fieldName === 'bstrPdlvNm') {
      grd.checkItem(idx.itemIndex, true);
      grd.setValue(idx.dataRow, 'bstrPdlvAdr', pdlvRef.value.filter((v) => v.pdlvKey === editResult.value)[0].pdlvAdd);
    }
  };
}
</script>
