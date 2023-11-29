<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SND
 2. 프로그램 ID : WwsndBusinessVehiclesOperationJrnlMgtM - 업무차량 운행일지 관리
 3. 작성자 : heymi.cho
 4. 작성일 : 2023.08.31
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 -업무차량 운행일지 관리 (http://localhost:3000/#/service/wwsnd-business-vehicles-operation-jrnl-mgt) // sk렌터카 api 개발 이후 수정
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_LOOKUP_PERIOD')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_LOOKUP_PERIOD')"
            :rules="['date_range_months:1', 'required']"
            type="date"
          />
        </kw-search-item>
        <wwsn-engineer-og-search-item-group
          v-model:dgr1-levl-og-id="searchParams.ogId"
          v-model:prtnr-no="searchParams.prtnrNo"
          dgr1-levl-og-first-option="all"
          partner-first-option="all"
          use-og-level="1"
          use-partner
          partner-label="prtnrNoNm"
        />
        <kw-search-item
          :label="$t('MSG_TXT_RGST_YN')"
        >
          <kw-select
            v-model="searchParams.rgstYn"
            :options="rgsts"
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
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>
        <!-- <kw-btn
          v-permission:delete
          grid-action
          :label="$t('MSG_BTN_DEL')"
          @click="onClickDelete"
        />
        <kw-separator
          spaced
          vertical
          inset
        /> -->
        <!-- 행추가 -->
        <!-- <kw-btn
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        /> -->
        <kw-btn
          v-permission:update
          :label="$t('MSG_BTN_SAVE')"
          grid-action
          dense
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />

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
        :visible-rows="pageInfo.pageSize"
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
import { useMeta, getComponentType, defineGrid, codeUtil, gridUtil, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import WwsnEngineerOgSearchItemGroup from '~sms-wells/service/components/WwsnEngineerOgSearchItemGroup.vue';
import dayjs from 'dayjs';

const { currentRoute } = useRouter();
const { getConfig } = useMeta();
const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const now = dayjs();

const grdMainRef = ref(getComponentType('KwGrid'));

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'BIZ_TEL_UNRG_ACD',
);

const searchParams = ref({
  startDt: `${now.format('YYYYMM')}01`,
  endDt: now.format('YYYYMMDD'),
  ogId: '',
  prtnrNo: '',
  rgstYn: '',
  dgr1LevlOgs: [],
  partner: [],
});

const rgsts = [
  { codeId: 'Y', codeName: '등록' },
  { codeId: 'N', codeName: '미등록' },
];

async function fetchData() {
  // eslint-disable-next-line max-len
  const res = await dataService.get('/sms/wells/service/wwsnd-business-vehicles-operation-jrnl-mgt/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: state, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(state);
  console.log(state);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/wwsnd-business-vehicles-operation-jrnl-mgt/excel-download', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '211', styleName: 'text-center' },
    { fieldName: 'vhcMngtPrtnrNo', header: t('MSG_TXT_EPNO'), width: '107', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '128', styleName: 'text-center' },
    { fieldName: 'hirFomCd', header: t('MSG_TXT_ROLE_1'), width: '107', styleName: 'text-center' },
    { fieldName: 'cntrDt', header: t('MSG_TXT_ENTCO_D'), width: '104', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'cnrNm', header: t('MSG_TXT_CAR_TP'), width: '106', styleName: 'text-center' }, // 차종
    { fieldName: 'carNo', header: t('MSG_TXT_CARNO'), width: '106', styleName: 'text-center' }, // 차량번호
    { fieldName: 'vhcOprtnDt', header: t('MSG_TXT_OPERATION_DT'), width: '107', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 일자
    { fieldName: 'dptuAcuDstn', header: `${t('MSG_TXT_ACML_DSTN')}(ON)`, width: '106', styleName: 'text-center', dataType: 'number' }, // 누적거리(시동ON)
    { fieldName: 'arvAcuDstn', header: `${t('MSG_TXT_ACML_DSTN')}(OFF)`, width: '106', styleName: 'text-center', dataType: 'number' }, // 누적거리(시동ON)
    { fieldName: 'distSum', header: t('MSG_TXT_OPRTN_DSTN'), width: '106', styleName: 'text-center', dataType: 'number' }, // 운행거리 sum
    { fieldName: 'timeSum', header: t('MSG_TXT_OPRTN_TIME'), width: '100', styleName: 'text-center', dataType: 'number' }, // 운행시간 sum
    { fieldName: 'lbrcqVal',
      header: t('MSG_TXT_RFLNG_QTY'),
      width: '100',
      styleName: 'text-center',
      dataType: 'number',
      editor: { type: 'number', editFormat: '#,##0.##', maxLength: 12, positiveOnly: true, maxLengthExceptComma: true } }, // 주유량
    // { fieldName: 'rmkCn', header: t('MSG_TXT_NOTE'), width: '100', styleName: 'text-center' },
    { fieldName: 'lbrcqPr',
      header: t('MSG_TXT_RFLNG_COST'),
      width: '100',
      styleName: 'text-center',
      editor: { type: 'number', editFormat: '#,###,###,##0.##', positiveOnly: true, maxLengthExceptComma: true } }, // 주유금액
    // eslint-disable-next-line max-len
    { fieldName: 'fuelCsmRt', header: t('MSG_TXT_FUEL_EFFICIENCY'), width: '100', styleName: 'text-center', dataType: 'number' },
    { fieldName: 'oprtnCt', header: t('MSG_TXT_OPRTN_CNT'), width: '100', styleName: 'text-center' }, // 운행건수
    { fieldName: 'bspdTms', header: t('MSG_TXT_ACCEL_COUNT'), width: '100', styleName: 'text-center' }, // 급가속건수
    { fieldName: 'sdpdTms', header: t('MSG_TXT_DECEL_COUNT'), width: '100', styleName: 'text-center' }, // 급감속건수
    { fieldName: 'avgBspdTms', header: t('MSG_TXT_AV') + t('MSG_TXT_ACCEL_RT'), width: '100', styleName: 'text-center' }, // 평균과속률
    // eslint-disable-next-line max-len
    { fieldName: 'avSftIdxt', header: t('MSG_TXT_AV') + t('MSG_TXT_SAFETY_SCORE'), width: '100', styleName: 'text-center' }, // 평균안전지수
  ];

  // eslint-disable-next-line max-len
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = false;
});
</script>
