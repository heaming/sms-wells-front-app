<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaNormalOutOfStorageRgstListP - 정상출고 등록(W-SV-U-0179P01)
3. 작성자 : inho.choi
4. 작성일 : 2023.03.15
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
정상, 물량이동 출고 확인을 실시하고 출고실적을 확인하는 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--3xl"
  >
    <kw-search
      :cols="2"
      :default-visible-rows="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 출고요청유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_AK_TP')"
        >
          <kw-input
            v-model="searchParams.ostrAkTpCd"
            :disable="true"
          />
        </kw-search-item>
        <!-- //출고요청유형 -->
        <!-- 출고창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_WARE')"
        >
          <kw-input
            v-model="searchParams.ostrOjWareNm"
            :disable="true"
          />
        </kw-search-item>
        <!-- //출고창고 -->
      </kw-search-row>
      <kw-search-row>
        <!-- 입고희망일 -->
        <kw-search-item
          :label="$t('MSG_TXT_STR_HOP_D')"
        >
          <kw-date-picker
            v-model="searchParams.strHopDt"
            :disable="true"
          />
        </kw-search-item>
        <!-- //입고희망일 -->
        <!-- 출고요청번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_AK_NO')"
        >
          <kw-input
            v-model="searchParams.ostrAkNo"
            :disable="true"
            mask="###-########-#######"
          />
        </kw-search-item>
        <!-- //출고요청번호 -->
      </kw-search-row>
      <kw-search-row>
        <!-- 등록일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_FST_RGST_DT')"
        >
          <kw-date-picker />
        </kw-search-item>
        <!-- //등록일자 -->
        <!-- 입고창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_STR_WARE')"
        >
          <kw-input
            v-model="searchParams.strOjWareNm"
            :disable="true"
          />
        </kw-search-item>
        <!-- //입고창고 -->
      </kw-search-row>
    </kw-search>

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
      <kw-btn
        dense
        secondary
        icon="print"
        :label="$t('MSG_BTN_PRTG')"
      />
      <kw-btn
        dense
        secondary
        icon="excel"
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <!-- 품목위치 표준미적용 -->
      <kw-btn
        dense
        secondary
        :label="$t('MSG_TXT_ITM_LOC_STD_NO_APY')"
        name="BtnStckStdGbF"
        @click="onClickLocationStandardNoApply"
      />
      <!-- //품목위치 표준미적용 -->
      <!-- 품목위치 표준적용 -->
      <kw-btn
        dense
        secondary
        :label="$t('MSG_TXT_ITM_LOC_STD_APY')"
        name="BtnStckStdGbT"
        @click="onClickLocationStandardApply"
      />
      <!-- //품목위치 표준적용 -->
      <kw-separator
        spaced
        vertical
        inset
      />
      <!-- 확정 -->
      <kw-btn
        primary
        dense
        :label="$t('MSG_TXT_DTRM')"
        @click="onClickConfirm"
      />
      <!-- //확정 -->
      <kw-btn
        primary
        dense
        :label="$t('MSG_TXT_CNFM_PRNT')"
        @click="onClickConfirmAfterMove"
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
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, getComponentType, useMeta, defineGrid, useGlobal, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
// import { cloneDeep, isEmpty } from 'lodash-es';

const { getConfig } = useMeta();
const { modal, confirm, notify } = useGlobal();
const { t } = useI18n();

const dataService = useDataService();
const baseURI = '/sms/wells/service/normal-outofstorages/detail';
const grdMainRef = ref(getComponentType('KwGrid'));
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  ostrAkNo: {
    type: String,
    default: '',
  },
  ostrAkTpCd: {
    type: String,
    default: '',
  },
  strHopDt: {
    type: String,
    default: '',
  },
  ostrOjWareNo: {
    type: String,
    default: '',
  },
  strOjWareNo: {
    type: String,
    default: '',
  },
  ostrOjWareNm: {
    type: String,
    default: '',
  },
  strOjWareNm: {
    type: String,
    default: '',
  },
  itmPdCd: {
    type: String,
    default: '',
  },
});

const codes = ref(await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'OSTR_AK_TP_CD',
  'WARE_DV_CD',
  'ADM_ZN_CLSF_CD',
  'ITM_KND_CD',
  'OVIV_FOM_CD',
  'MAT_MNGT_DV_CD',
));

console.log(`codes.value.MAT_MNGT_DV_CD : ${codes.value.MAT_MNGT_DV_CD}`);
console.log(dayjs().format('YYYYMMDD'));
console.log(`props.ostrOjWareNm: ${props.ostrOjWareNm}`);
console.log(`props.strOjWareNm: ${props.strOjWareNm}`);
console.log(`props.strHopDt: ${props.strHopDt}`);

const searchParams = ref({
  ostrAkTpCd: props.ostrAkTpCd,
  ostrOjWareNo: props.ostrOjWareNo,
  strOjWareNo: props.strOjWareNo,
  strHopDt: props.strHopDt,
  ostrAkNo: props.ostrAkNo,
  ostrOjWareNm: props.ostrOjWareNm,
  strOjWareNm: props.strOjWareNm,
  ostrAkRgstDt: props.strHopDt,
  itmPdCd: props.itmPdCd,
  stckStdGb: '1',
});
let cachedParams;

console.log(`searchParams.value.ostrAkRgstDt : ${searchParams.value.ostrAkRgstDt}`);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const res = await dataService.get(baseURI, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: searchData, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const datasSource = view.getDataSource();
  datasSource.setRows(searchData);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseURI}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'NomalOutOfStorageRgstListP',
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickLocationStandardApply() {
  searchParams.value.stckStdGb = '1';
  await onClickSearch();
}

async function onClickLocationStandardNoApply() {
  searchParams.value.stckStdGb = '0';
  await onClickSearch();
}

async function onClickConfirm() {
  if (await confirm(t('MSG_ALT_WANT_DTRM'))) {
    notify(t('MSG_TXT_CNFM_SCS'));
  }
}

async function onClickConfirmAfterMove() {
  if (await confirm(t('MSG_ALT_WANT_DTRM'))) {
    notify(t('MSG_TXT_CNFM_SCS'));
  }
}

onMounted(async () => {
  await onClickSearch();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'pdPrpVal02',
      header: t('MSG_TXT_STOC_TYPE'),
      width: '100',
      styleName: 'text-center',
      options: codes.value.MAT_MNGT_DV_CD,
    },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '300' },
    { fieldName: 'cfrmCnt', header: t('MSG_TXT_OSTR_FREQ'), width: '100', styleName: 'text-center' },
    { fieldName: 'itemLoc', header: t('MSG_TXT_ITM_LOC'), width: '150' },
    { fieldName: 'itmGdCd', header: t('MSG_TXT_GD'), width: '100', styleName: 'text-center' },
    { fieldName: 'reqStckQty', header: t('MSG_TXT_OSTR_WARE_STOC'), width: '100', styleName: 'text-center' },
    { fieldName: 'qty', header: t('MSG_TXT_STR_WARE_STOC'), width: '100', styleName: 'text-center' },
    { fieldName: 'avgOut', header: t('MSG_TXT_CNTR_AV_OSTR_QTY'), width: '100', styleName: 'text-center' },
    { fieldName: 'ostrAkQty', header: t('RQST_QTY'), width: '100', styleName: 'text-center' },
    { fieldName: 'ostrCnfmQty', header: t('MSG_TXT_CNFM_QTY'), width: '100', styleName: 'text-center' },
    { fieldName: 'strHopDt', header: t('MSG_TXT_STR_HOP_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'ostrAggQty', header: t('MSG_TXT_OSTR_AGG'), width: '100', styleName: 'text-center' },
    { fieldName: 'outQty',
      header: t('MSG_TXT_OSTR_QTY'),
      width: '100',
      styleName: 'text-center',
      editor: {
        type: 'input',
      },
      editable: true,
    },
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_NOTE'),
      width: '100',
      styleName: 'text-center',
      editor: {
        type: 'input',
      },
      editable: true },
    { fieldName: 'mgtUntNm', header: t('TXT_MSG_MNGT_UNIT_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'boxUnitQty', header: t('MSG_TXT_BOX_QTY'), width: '100', styleName: 'text-center' },
    { fieldName: 'rectOstrDt', header: t('MSG_TXT_RECT_OSTR_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'chk', header: '', width: '0', styleName: 'text-center', visible: false },
  ];
  const fields = columns.map((v) => ({ fieldName: v.fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.onCellDblClicked = async (g, { column, dataRow }, v) => {
    const { pdCd, itmPdCd } = gridUtil.getRowValue(g, dataRow); // TODO: componentProps 와 함께 추가
    console.log(g, column, dataRow, v);

    const { result, payload } = await modal({
      component: 'WwsnaAskMaterialsHavePsDtlP', // TODO: 요청자재보유현황 팝업페이지 연결확인
      componentProps: {
        pdCd,
        itmPdCd,
      },
    });

    if (result) {
      console.log(payload[0]);
    }
  };
});
</script>
<style scoped>
</style>
