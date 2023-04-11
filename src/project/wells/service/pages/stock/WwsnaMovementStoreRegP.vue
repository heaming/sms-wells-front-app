<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaMovementStoreRegP - 이관입고 등록(W-SV-U-0169P01)
3. 작성자 : inho.choi
4. 작성일 : 2023.04.04
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
정상, 물량이동 출고 확인을 실시하고 출고실적을 확인하는 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    size="4xl"
    no-action
  >
    <kw-form :cols="2">
      <kw-form-row>
        <!-- 출고관리번호 -->
        <kw-form-item
          :label="$t('MSG_TXT_OSTR_MNGT_NO')"
        >
          <kw-input
            v-model="parentsParams.itmOstrNo"
            :disable="true"
          />
        </kw-form-item>
        <!-- //출고관리번호 -->
        <!-- 출고창고 -->
        <kw-form-item
          :label="$t('MSG_TXT_OSTR_WARE')"
        >
          <kw-input
            v-model="parentsParams.ostrWareNm"
            :disable="true"
          />
        </kw-form-item>
        <!-- //출고창고 -->
      </kw-form-row>
      <kw-form-row>
        <!-- 입고희망일자 -->
        <kw-form-item
          :label="$t('MSG_TXT_STR_HOP_DT')"
        >
          <kw-input
            v-model="parentsParams.strHopDt"
            :disable="true"
            datetime-format="date"
          />
        </kw-form-item>
        <!-- //입고희망일자 -->
        <!-- 출고유형 -->
        <kw-form-item
          :label="$t('MSG_TXT_OSTR_TP')"
        >
          <kw-input
            v-model="parentsParams.ostrTpNm"
            :disable="true"
          />
        </kw-form-item>
        <!-- //출고유형 -->
      </kw-form-row>
      <kw-form-row>
        <!-- 입고일자 -->
        <kw-form-item
          :label="$t('MSG_TXT_STR_DT')"
        >
          <kw-date-picker />
        </kw-form-item>
        <!-- //입고일자 -->
        <!-- 입고창고 -->
        <kw-form-item
          :label="$t('MSG_TXT_STR_WARE')"
        >
          <kw-input
            v-model="parentsParams.strWareNm"
            :disable="true"
          />
        </kw-form-item>
        <!-- //입고창고 -->
      </kw-form-row>
    </kw-form>

    <kw-separator />
    <kw-action-top class="mt30">
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
        icon="print"
        secondary
        :label="$t('MSG_BTN_PRTG')"
        dense
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
        @click="onClickLocationStandardNoApply"
      />
      <!-- //품목위치 표준미적용 -->
      <!-- 품목위치 표준적용 -->
      <kw-btn
        dense
        secondary
        :label="$t('MSG_TXT_ITM_LOC_STD_APY')"
        @click="onClickLocationStandardApply"
      />
      <!-- //품목위치 표준적용 -->
      <kw-btn
        dense
        secondary
        :label="$t('MSG_TXT_NM_TAG_PRNT')"
        @click="onClickNameTagPrint"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <kw-btn
        primary
        dense
        :label="$t('MSG_TXT_TF_STR_RGST')"
        @click="onClickSave"
      />
      <kw-btn
        primary
        dense
        :label="$t('MSG_TXT_TF_STR_RGST')"
        @click="onClickSave"
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
import { codeUtil, useDataService, getComponentType, useMeta, defineGrid, gridUtil, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { getConfig } = useMeta();
const { alert } = useGlobal();
const { t } = useI18n();

const dataService = useDataService();
const baseURI = '/sms/wells/service/movement-stores/registration';
const grdMainRef = ref(getComponentType('KwGrid'));
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  ostrDt: {
    type: String,
    default: '',
  },
  ostrTpCd: {
    type: String,
    default: '',
  },
  ostrTpNm: {
    type: String,
    default: '',
  },
  itmOstrNo: {
    type: String,
    default: '',
  },
  itmStrNo: {
    type: String,
    default: '',
  },
  strWareNo: {
    type: String,
    default: '',
  },
  ostrWareNo: {
    type: String,
    default: '',
  },
  strWareNm: {
    type: String,
    default: '',
  },
  ostrWareNm: {
    type: String,
    default: '',
  },
  itmPdCd: {
    type: String,
    default: '',
  },
  strHopDt: {
    type: String,
    default: '',
  },

});

const codes = ref(await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
));

const parentsParams = ref({
  ostrDt: props.ostrDt,
  ostrTpCd: props.ostrTpCd,
  ostrTpNm: props.ostrTpNm,
  itmOstrNo: props.itmOstrNo,
  itmStrNo: props.itmStrNo,
  strWareNo: props.strWareNo,
  ostrWareNo: props.ostrWareNo,
  strWareNm: props.strWareNm,
  ostrWareNm: props.ostrWareNm,
  strHopDt: props.strHopDt,
});

const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'),
  itmOstrNo: props.itmOstrNo,
  strWareNo: props.strWareNo,
  ostrWareNo: props.ostrWareNo,
  stckStdGb: '1',
  strDt: dayjs().format('YYYYMMDD'),
});
let cachedParams;

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

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// async function onClickSearch() {
//   pageInfo.value.pageIndex = 1;
//   cachedParams = cloneDeep(searchParams.value);
//   await fetchData();
// }

async function onClickSave() {
  const res = await dataService.get(baseURI, { params: {} });
  console.log(res.data);
}

async function onClickLocationStandardNoApply() {
  searchParams.value.stckStdGb = '0';
  await fetchData();
}

async function onClickLocationStandardApply() {
  searchParams.value.stckStdGb = '1';
  await fetchData();
}

// TODO: W-SV-U-0169P02 - 네임텍 출력 개발 진행 후 반영 예정
function onClickNameTagPrint() {
  alert('페이지가 존재하지 않습니다.(개발중)');
}

onMounted(async () => {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'sapMaptCd', header: t('MSG_TXT_SAP_CD'), width: '124', styleName: 'text-center' },

    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '130', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '210', styleName: 'text-left' },
    { fieldName: 'itemLoc', header: t('MSG_TXT_ITM_LOC'), width: '141', styleName: 'text-left' },
    { fieldName: 'onQty', header: t('MSG_TXT_STOC_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'mngtUnitCd', header: t('MSG_TXT_MNGT_UNIT'), width: '100', styleName: 'text-center' },
    { fieldName: 'boxUnitQty', header: t('MSG_TXT_UNIT_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'col8', header: t('MSG_TXT_OSTR_AK_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'itmGdCd', header: t('MSG_TXT_GD'), width: '100', styleName: 'text-center' },
    { fieldName: 'qty1', header: t('MSG_TXT_OSTR_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'sellRcpdt', header: t('MSG_TXT_RECT_STR_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'inSum', header: t('MSG_TXT_STR_AGG_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'qty2', header: t('MSG_TXT_STR_OJ_QTY'), width: '100', styleName: 'text-right' },

  ];
  const fields = columns.map((v) => ({ fieldName: v.fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
});
</script>
<style scoped>
</style>
