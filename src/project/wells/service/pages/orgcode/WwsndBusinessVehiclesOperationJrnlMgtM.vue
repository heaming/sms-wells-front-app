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
 -업무차량 운행일지 관리 (http://localhost:3000/#/service/wwsnd-business-vehicles-operation-jrnl-mgt)
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
            type="month"
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
import { useMeta, getComponentType, defineGrid, codeUtil, gridUtil, useDataService, notify } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
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
  startDt: now.format('YYYYMM'),
  endDt: now.format('YYYYMM'),
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
  const res = await dataService.get('/sms/wells/service/sn-processing-ps/customers/paging', { params: { ...cachedParams, ...pageInfo.value } });
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
  const res = await dataService.get('/sms/wells/service/sn-processing-ps/customers/excel-download', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// /*
//  * 그리드 행추가
//  */
// async function onClickAdd() {
//   const view = grdMainRef.value.getView();
//   const row = view.getCurrent().dataRow < 0 ? '0' : view.getCurrent().dataRow;
//   await gridUtil.insertRowAndFocus(view, row, {});
// }

/*
 * 그리드 저장
 */
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  for (let i = 0; i < changedRows.length; i += 1) {
    if (isEmpty(changedRows[i].lbrcqValSum)) {
      notify(t('MSG_ALT_CHK_NCSR', [t('MSG_TXT_RFLNG_QTY')]));
      return;
    }

    if (isEmpty(changedRows[i].lbrcqValSum)) {
      notify(t('MSG_ALT_CHK_NCSR', [t('MSG_TXT_RFLNG_COST')]));
      return;
    }
  }
  await dataService.post('/sms/wells/contract/business-to-business/business-opportunities', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

/*
 * 그리드 삭제
 */
// async function onClickDelete() {
//   const view = grdMainRef.value.getView();
//   if (!await gridUtil.confirmIfIsModified(view)) { return; }

//   const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

//   if (deletedRows.length) {
// eslint-disable-next-line max-len
//     await dataService.delete('/sms/wells/contract/business-to-business/business-opportunities', { data: deletedRows });
//     notify(t('MSG_ALT_DELETED'));
//     await onClickSearch();
//   }
// }
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '211', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '107', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '128', styleName: 'text-center' },
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_ROLE_1'), width: '107', styleName: 'text-center' },
    { fieldName: 'fstCntrDt', header: t('MSG_TXT_ENTCO_D'), width: '104', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' },
    { fieldName: 'carModl', header: t('MSG_TXT_CAR_TP'), width: '106', styleName: 'text-center' }, // 차종
    { fieldName: 'carNum', header: t('MSG_TXT_CARNO'), width: '106', styleName: 'text-center' }, // 차량번호
    { fieldName: 'day', header: t('MSG_TXT_OPERATION_DT'), width: '107', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 일자
    { fieldName: 'onDist', header: `${t('MSG_TXT_ACML_DSTN')}(ON)`, width: '106', styleName: 'text-center', dataType: 'number' }, // 누적거리(시동ON)
    { fieldName: 'offDist', header: `${t('MSG_TXT_ACML_DSTN')}(OFF)`, width: '106', styleName: 'text-center', dataType: 'number' }, // 누적거리(시동ON)
    // eslint-disable-next-line max-len
    // { fieldName: 'dptuLctNm', header: `${t('MSG_TXT_DPTMT')}${t('MSG_TXT_LCT_NM')}`, width: '106', styleName: 'text-center' },
    // eslint-disable-next-line max-len
    // { fieldName: 'arvAcuDstnSum', header: `${t('MSG_TXT_ARV')}${t('MSG_TXT_ACML_DSTN')}`, width: '106', styleName: 'text-center', dataType: 'number' },
    // eslint-disable-next-line max-len
    // { fieldName: 'dptuLctNm', header: `${t('MSG_TXT_ARV')}${t('MSG_TXT_LCT_NM')}`, width: '106', styleName: 'text-center' },
    { fieldName: 'distSum', header: t('MSG_TXT_OPRTN_DSTN'), width: '106', styleName: 'text-center', dataType: 'number' }, // 운행거리 sum
    { fieldName: 'timeSum', header: t('MSG_TXT_OPRTN_TIME'), width: '100', styleName: 'text-center', dataType: 'number' }, // 운행시간 sum
    // eslint-disable-next-line max-len
    // { fieldName: 'bizOprtnDstn', header: t('MSG_TXT_WORK'), width: '100', styleName: 'text-center' },
    // eslint-disable-next-line max-len
    // { fieldName: 'bizLocaraNm', header: `${t('MSG_TXT_WORK')}${t('MSG_TXT_LOCARA')}`, width: '120', styleName: 'text-center' },
    { fieldName: 'lbrcqValSum',
      header: t('MSG_TXT_RFLNG_QTY'),
      width: '100',
      styleName: 'text-center',
      dataType: 'number',
      editor: { type: 'number', editFormat: '#,##0.##', maxLength: 12, positiveOnly: true, maxLengthExceptComma: true } }, // 주유량
    // { fieldName: 'rmkCn', header: t('MSG_TXT_NOTE'), width: '100', styleName: 'text-center' },
    { fieldName: '주유금액',
      header: t('MSG_TXT_RFLNG_COST'),
      width: '100',
      styleName: 'text-center',
      editor: { type: 'number', editFormat: '#,###,###,##0.##', positiveOnly: true, maxLengthExceptComma: true } }, // 주유금액
    // eslint-disable-next-line max-len
    { fieldName: 'fuelEfficiency', header: t('MSG_TXT_FUEL_EFFICIENCY'), width: '100', styleName: 'text-center', dataType: 'number' },
    { fieldName: 'drvCnt', header: t('MSG_TXT_OPRTN_CNT'), width: '100', styleName: 'text-center' }, // 운행건수
    { fieldName: 'safeIdx', header: t('MSG_TXT_SAFETY_SCORE'), width: '100', styleName: 'text-center' }, // 안전지수
    { fieldName: 'fstAccCnt', header: t('MSG_TXT_ACCEL_COUNT'), width: '100', styleName: 'text-center' }, // 급가속건수
    { fieldName: 'fstDecCnt', header: t('MSG_TXT_DECEL_COUNT'), width: '100', styleName: 'text-center' }, // 급감속건수
    { fieldName: 'avgOverSpdRate', header: t('MSG_TXT_AV') + t('MSG_TXT_ACCEL_RT'), width: '100', styleName: 'text-center' }, // 평균과속률
    // eslint-disable-next-line max-len
    { fieldName: 'avgSafeIdx', header: t('MSG_TXT_AV') + t('MSG_tXT_SAFETY_SCORE'), width: '100', styleName: 'text-center' }, // 평균안전지수
  ];

  // eslint-disable-next-line max-len
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = false;
});
</script>
