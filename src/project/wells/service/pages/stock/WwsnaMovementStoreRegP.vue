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
          :label="$t('MSG_TXT_STR_MNGT_NO')"
        >
          <kw-input
            v-model="propsParams.itmStrNo"
            :disable="true"
            mask="###-########-#######"
          />
        </kw-form-item>
        <!-- //출고관리번호 -->
        <!-- 출고창고 -->
        <kw-form-item
          :label="$t('MSG_TXT_STR_WARE')"
        >
          <kw-input
            v-model="propsParams.strWareNm"
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
            v-model="propsParams.strHopDt"
            :disable="true"
            datetime-format="date"
          />
        </kw-form-item>
        <!-- //입고희망일자 -->
        <!-- 출고유형 -->
        <kw-form-item
          :label="$t('MSG_TXT_STR_TP')"
        >
          <kw-input
            v-model="propsParams.strTpNm"
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
          <kw-date-picker
            v-model="searchParams.strDt"
          />
        </kw-form-item>
        <!-- //입고일자 -->
        <!-- 입고창고 -->
        <kw-form-item
          :label="$t('MSG_TXT_OSTR_WARE')"
        >
          <kw-input
            v-model="propsParams.ostrWareNm"
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
      <!--
      <kw-btn
        icon="print"
        secondary
        :label="$t('MSG_BTN_PRTG')"
        dense
      />
 -->
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
        :label="$t('MSG_TXT_DEL')"
        :disable="propsParams.flagChk === 0"
        @click="onClickRemove"
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
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
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
const { alert, confirm, notify, modal } = useGlobal();
const { t } = useI18n();

const dataService = useDataService();
const baseURI = '/sms/wells/service/movement-stores/registration';
const grdMainRef = ref(getComponentType('KwGrid'));
const props = defineProps({
  strRgstDt: {
    type: String,
    default: '',
  },
  strTpCd: {
    type: String,
    default: '',
  },
  strTpNm: {
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
  strWareNm: {
    type: String,
    default: '',
  },
  ostrWareNo: {
    type: String,
    default: '',
  },
  ostrWareNm: {
    type: String,
    default: '',
  },
  ostrSn: {
    type: String,
    default: '',
  },
  strSn: {
    type: String,
    default: '',
  },
  itmPdNo: {
    type: String,
    default: '',
  },
  itmPdNm: {
    type: String,
    default: '',
  },
  strHopDt: {
    type: String,
    default: '',
  },
  flagChk: {
    type: Number,
    default: 0,
  },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = ref(await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
));

const propsParams = ref({
  strRgstDt: props.strRgstDt,
  strTpCd: props.strTpCd,
  strTpNm: props.strTpNm,
  itmStrNo: props.itmStrNo,
  strWareNo: props.strWareNo,
  strWareNm: props.strWareNm,
  ostrWareNo: props.ostrWareNo,
  ostrWareNm: props.ostrWareNm,
  ostrSn: props.ostrsn,
  strSn: props.strSn,
  itmPdNo: props.itmPdNo,
  itmPdNm: props.itmPdNm,
  strHopDt: props.strHopDt,
  flagChk: props.flagChk,
});

const searchParams = ref({
  baseYm: dayjs().format('YYYYMM'),
  strRgstDt: props.strRgstDt,
  strTpCd: props.strTpCd,
  itmStrNo: props.itmStrNo,
  strWareNo: props.strWareNo,
  ostrWareNo: props.ostrWareNo,
  ostrSn: props.ostrSn,
  strSn: props.strSn,
  itmPdNo: props.itmPdNo,
  strHopDt: props.strHopDt,
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
  console.log('fetchData~~~~~~~~~~~~~~~~~~~~~~~');
  const res = await dataService.get(baseURI, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: searchData, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const datasSource = view.getDataSource();
  datasSource.setRows(searchData);
  view.resetCurrent();

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSave() {
  console.log('onClickSave~~~~~~~~~~~~~~~~~~~~~~~~~');
  const dataParams = grdMainRef.value.getView();
  const rows = dataParams.getCheckedItems();

  const confirmData = ref([]);
  confirmData.value = rows.map((v) => {
    const { strSn, strQty, itmStrNo, strWareNo, itmGdCd, itmPdCd } = dataParams.getValues(v);
    return {
      itmStrNo,
      strSn: Number(strSn),
      strWareNo,
      itmGdCd,
      itmPdCd,
      strQty: Number(strQty),
    };
  });

  // 등록하시겠습니까?
  if (await confirm(t('MSG_ALT_RGST'))) {
    // const { result } = await dataService.put(baseURI, { params: confirmData.value });
    const { result } = await dataService.put(baseURI, confirmData.value);

    if (result) {
      // 등록되었습니다.
      alert(t('MSG_ALT_RGSTD'));
      await fetchData();
    } else {
      console.log(`result: ${result}`);
    }
  }
}
async function onClickRemove() {
  const res = await dataService.delete(baseURI, { params: {} });
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

const popupRef = ref();
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get(`${baseURI}/excel-download`, { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: popupRef.value.pageCtxTitle,
    timePostfix: true,
    exportData: response.data,
  });
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
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '124', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '130', styleName: 'text-center' },
    { fieldName: 'itmPdNm', header: t('MSG_TXT_ITM_NM'), width: '210', styleName: 'text-left' },
    { fieldName: 'itemLoc', header: t('MSG_TXT_ITM_LOC'), width: '141', styleName: 'text-left' },
    { fieldName: 'onQty', header: t('MSG_TXT_STOC_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'mngtUnitCd', header: t('MSG_TXT_MNGT_UNIT'), width: '100', styleName: 'text-center' },
    { fieldName: 'boxUnitQty', header: t('MSG_TXT_UNIT_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'ostrAkQty', header: t('MSG_TXT_OSTR_AK_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'itmGdCd', header: t('MSG_TXT_GD'), width: '100', styleName: 'text-center' },
    { fieldName: 'ostrQty', header: t('MSG_TXT_OSTR_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'strRgstDt', header: t('MSG_TXT_RECT_STR_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'inSum', header: t('MSG_TXT_STR_AGG_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'strQty', header: t('MSG_TXT_STR_OJ_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'ostrCnfmCd', header: t('MSG_TXT_CH_CNFM_RSON'), width: '100', styleName: 'text-right' },
    { fieldName: 'rmkCn', header: t('MSG_TXT_NOTE'), width: '100', styleName: 'text-right' },
  ];

  const gridField = columns.map((v) => ({ fieldName: v.fieldName }));
  const fields = [...gridField,
    { fieldName: 'strSn' },
    { fieldName: 'strConfDt' },
    { fieldName: 'baseGb' },
    { fieldName: 'baseColorGb' },
    { fieldName: 'strWareNo' },
    { fieldName: 'itmStrNo' }];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellDblClicked = async (g, c) => {
    const { itmPdCd, itmPdNm } = g.getValues(g.getCurrent().itemIndex);
    console.log(itmPdNm, itmPdNm);
    console.log(searchParams.value.ostrWareNo);

    if (c.column === 'itemLoc') {
      const { result: isChanged } = await modal({
        component: 'WwsnaItemLocationMgtP',
        componentProps: {
          wareNo: searchParams.value.ostrWareNo,
          itmPdCd,
        },
      });
      console.log(isChanged);
    }

    // if (isChanged) {
    //   notify(t('MSG_ALT_SAVE_DATA'));
    //   await fetchData();
    // }
  };

  view.onItemChecked = async (grid, i, checkedVal) => {
    console.log(grid, i, checkedVal);

    const { strQty, ostrQty, strConfDt } = grid.getValues(i);
    console.log(strConfDt);

    if (strConfDt !== null) {
      // '이미 입고확인이 처리된 품목입니다.'
      notify(t('MSG_ALT_ITM_ALRDY_CNFM_RCPT'));
    }

    if ((Number(strQty) - Number(ostrQty)) === 0) {
      // 입고출고 수량이 같음
      notify(t('MSG_ALT_RCPT_RLS_QTTS_SAME'));
    } else {
      // 입고출고 수량이 일치하지 않습니다.
      notify(t('MSG_ALT_RCPT_RLS_QTTS_NO_MATCH'));
    }
  };
});
</script>
<style scoped>
</style>
