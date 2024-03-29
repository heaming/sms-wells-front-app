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
    ref="popupRef"
    size="4xl"
  >
    <kw-form
      :cols="2"
      ignore-on-modified
    >
      <kw-form-row>
        <!-- 입고관리번호 -->
        <kw-form-item
          :label="$t('MSG_TXT_STR_MNGT_NO')"
        >
          <kw-input
            v-model="propsParams.itmStrNo"
            :disable="true"
            mask="###-########-#######"
          />
        </kw-form-item>
        <!-- //입고관리번호 -->
        <!-- 입고창고 -->
        <kw-form-item
          :label="$t('MSG_TXT_STR_WARE')"
        >
          <kw-input
            v-model="propsParams.strWareNm"
            :disable="true"
          />
        </kw-form-item>
        <!-- //입고창고 -->
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
        <!-- 입고유형 -->
        <kw-form-item
          :label="$t('MSG_TXT_STR_TP')"
        >
          <kw-input
            v-model="propsParams.strTpNm"
            :disable="true"
          />
        </kw-form-item>
        <!-- //입고유형 -->
      </kw-form-row>
      <kw-form-row>
        <!-- 입고일자 -->
        <kw-form-item
          :label="$t('MSG_TXT_STR_DT')"
        >
          <kw-date-picker
            v-model="searchParams.strRgstDt"
          />
        </kw-form-item>
        <!-- //입고일자 -->
        <kw-form-item
          :label="$t('MSG_TXT_OSTR_WARE')"
        >
          <!-- 출고창고 -->
          <kw-input
            v-model="propsParams.ostrWareNm"
            :disable="true"
          />
          <!-- //출고창고 -->
          <!-- 표준 미적용 -->
          <kw-checkbox
            v-model="searchParams.stckNoStdGb"
            class="ml20"
            :label="$t('MSG_TXT_STD_NO_APY')"
            @update:model-value="onCheckedStckNoStdGb"
          />
          <!-- //표준 미적용 -->
        </kw-form-item>
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
        :disable="propsParams.flagChk === 1"
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
import { codeUtil, useDataService, getComponentType, useMeta, defineGrid, gridUtil, useGlobal, useModal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const { getConfig } = useMeta();
const { confirm, notify, modal, alert } = useGlobal();
const { t } = useI18n();
const { ok } = useModal();

const dataService = useDataService();
const baseURI = '/sms/wells/service/movement-stores/registration';
const colsedUri = '/sms/wells/service/movement-stores/strware-monthly-end';
const stdWareUri = '/sms/wells/service/normal-out-of-storages/standard-ware';
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

const today = dayjs().format('YYYYMMDD');

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
  stckNoStdGb: 'N',
});

let cachedParams;

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function stckStdGbFetchData() {
  const apyYm = searchParams.value.strRgstDt.substring(0, 6);
  const wareNo = searchParams.value.ostrWareNo;
  const res = await dataService.get(stdWareUri, { params: { apyYm, wareNo } });
  const { stckStdGb } = res.data;
  searchParams.value.stckNoStdGb = stckStdGb === 'Y' ? 'N' : 'Y';
}

async function fetchData() {
  const res = await dataService.get(baseURI, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: searchData, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const datasSource = view.getDataSource();
  datasSource.setRows(searchData);
  view.resetCurrent();

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);

  view.checkAll(true);
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    view.checkAll(false);
  }
}

async function onCheckedStckNoStdGb() {
  const stckStdGb = searchParams.value.stckNoStdGb === 'N' ? 'Y' : 'N';
  const apyYm = searchParams.value.baseYm;
  const wareNo = searchParams.value.ostrWareNo;

  const res = await dataService.put(stdWareUri, { apyYm, stckStdGb, wareNo });
  if (res.data > 0) {
    notify(t('MSG_ALT_CHG_DATA'));
    await fetchData();
  }
}

async function strWareMonthlyClosed() {
  const apyYm = searchParams.value.strRgstDt.substring(0, 6);
  const wareNo = searchParams.value.strWareNo;
  const closedParams = {
    apyYm,
    wareNo,
  };

  const res = await dataService.get(colsedUri, { params: closedParams });

  return res.data > 0;
}

async function saveValidation() {
  const view = grdMainRef.value.getView();
  const rows = view.getCheckedItems();

  if (isEmpty(rows)) {
    // 입고등록 처리를 위해 선택된 건이 없습니다.
    notify(t('MSG_ALT_NOT_SELECT_STR'));
    return false;
  }

  if (isEmpty(searchParams.value.strRgstDt)) {
    // 입고 일자가 누락되었습니다.
    // 입고 일자를 선택해 주세요
    await alert(t('MSG_ALT_INP_WRHS_NOT_DY'));
    return false;
  }

  if (searchParams.value.strRgstDt > today) {
    // 입고 일자는 오늘이거나 이전 일자만 선택이 가능합니다.
    await alert(t('MSG_ALT_STR_DT_TO_BEFORE_DT'));
    return false;
  }

  const strValidRows = rows.filter((item) => {
    if (!isEmpty(item.strConfDt)) {
      return true;
    }
    return false;
  });
  if (!isEmpty(strValidRows)) {
    // '이미 입고확인이 처리된 품목입니다.'
    await alert(t('MSG_ALT_ITM_ALRDY_CNFM_RCPT'));
    return false;
  }

  const qtyValidRows = rows.filter((item) => {
    if (item.strQty !== item.ostrQty) {
      return true;
    }
    return false;
  });
  if (!isEmpty(qtyValidRows)) {
    // 입고출고 수량이 일치하지 않습니다.
    await alert(t('MSG_ALT_RCPT_RLS_QTTS_NO_MATCH'));
    return false;
  }

  const closedChk = await strWareMonthlyClosed();
  // 입고창고의 마감여부 체크
  if (closedChk) {
    // 해당 입고년월은 이미 마감이 완료되어, 입고작업이 불가합니다.
    // 해당 입고일자는 이미 마감이 완료되어, 입고작업이 불가합니다.
    await alert(t('MSG_ALT_DATE_EDIT_IN_PUT'));
    return false;
  }

  return true;
}

async function removeValidation() {
  const view = grdMainRef.value.getView();
  const checkedRows = view.getCheckedItems();

  if (isEmpty(checkedRows)) {
    notify(t('MSG_ALT_DEL_NO_DATA'));
    return false;
  }

  const qtyVaildRows = checkedRows.filter((item) => {
    if (item.strQty > item.onQty) {
      return true;
    }
    return false;
  });

  if (!isEmpty(qtyVaildRows)) {
    // 삭제하려는 수량이 재고수량을 초과합니다.
    await alert(t('DL_QTY_STOC_QTY_OVR'));
    return false;
  }

  const closedChk = await strWareMonthlyClosed();
  // 입고창고의 마감여부 체크
  if (closedChk) {
    // 해당 입고년월은 이미 마감이 완료되어, 입고작업이 불가합니다.
    // 해당 입고일자는 이미 마감이 완료되어, 입고작업이 불가합니다.
    await alert(t('MSG_ALT_DATE_EDIT_IN_PUT'));
    return false;
  }

  return true;
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const rows = view.getCheckedItems();
  if (rows.length === 0) {
    notify(t('MSG_ALT_NOT_SELECT_MV'));
    return false;
  }

  // 등록하시겠습니까?
  if (await confirm(t('MSG_ALT_RGST'))) {
    const result = await saveValidation();
    if (!result) {
      return false;
    }

    const confirmData = ref([]);
    confirmData.value = rows.map((v) => {
      const { strSn, strQty, itmStrNo, strWareNo, itmGdCd, itmPdCd } = view.getValues(v);
      return {
        itmStrNo,
        strSn: Number(strSn),
        strWareNo,
        itmGdCd,
        itmPdCd,
        strQty: Number(strQty),
      };
    });

    const res = await dataService.put(baseURI, confirmData.value);

    if (res.data > 0) {
      notify(t('MSG_ALT_SAVE_DTA'));
      ok();
      return;
    }
    notify(t('MSG_ALT_SVE_ERR'));
  }
}
async function onClickRemove() {
  const view = grdMainRef.value.getView();
  const rows = view.getCheckedItems();

  // 삭제하시겠습니까?
  if (await confirm(t('MSG_ALT_WANT_DEL'))) {
    if (!await removeValidation()) {
      return false;
    }

    const removeData = rows.map((v) => {
      const { strSn, strQty, itmStrNo, strWareNo, itmGdCd, itmPdCd } = view.getValues(v);
      return {
        itmStrNo,
        strSn: Number(strSn),
        strWareNo,
        itmGdCd,
        itmPdCd,
        strQty: Number(strQty),
      };
    });

    const res = await dataService.delete(baseURI, { data: [...removeData] });
    const { processCount } = res.data;

    if (processCount > 0) {
      // 삭제 되었습니다.
      notify(t('MSG_ALT_DELETED'));
      ok();
      return;
    }
    notify(t('MSG_ALT_DEL_ERR'));
  }
}

async function onClickNameTagPrint() {
  const { result: isChanged } = await modal({
    component: 'WwsnaNameTagPrintSortMgtP',
  });

  if (isChanged) {
    await fetchData();
  }
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
  await stckStdGbFetchData();
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
    const { itmPdCd, itmPdNm, strRgstDt } = g.getValues(g.getCurrent().itemIndex);
    console.log(itmPdNm, itmPdNm, strRgstDt);
    console.log(searchParams.value.ostrWareNo);

    if (c.column === 'itemLoc') {
      const { result } = await modal({
        component: 'WwsnaItemLocationMgtP',
        componentProps: {
          wareNo: searchParams.value.ostrWareNo,
          itmPdCd,
          apyYm: strRgstDt,
        },
      });

      if (result) {
        await fetchData();
      }

      await stckStdGbFetchData();
    }
  };

  view.onItemChecked = async (grid, i) => {
    const { strQty, ostrQty, strConfDt } = grid.getValues(i);

    if (strConfDt) {
      // '이미 입고확인이 처리된 품목입니다.'
      notify(t('MSG_ALT_ITM_ALRDY_CNFM_RCPT'));
    }

    if ((Number(strQty) - Number(ostrQty)) !== 0) {
      // 입고출고 수량이 일치하지 않습니다.
      notify(t('MSG_ALT_RCPT_RLS_QTTS_NO_MATCH'));
    }
  };
});
</script>
<style scoped>
</style>
