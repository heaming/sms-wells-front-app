<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTE
2. 프로그램 ID : WwcteSecProductMgtMShipping - 삼성전자 상품관리(배송)
3. 작성자 : gs.rahul.n
4. 작성일 : 2023.04.04
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 삼성전자 상품관리(배송)
****************************************************************************************************
--->
<template>
  <kw-search @search="onClickSearch">
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_LOOKUP_PERIOD')"
        required
      >
        <kw-date-range-picker
          v-model:from="searchParams.strtdt"
          v-model:to="searchParams.enddt"
          :label="$t('MSG_TXT_LOOKUP_PERIOD')"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_PRDT_GUBUN')"
        colspan="2"
      >
        <kw-field-wrap
          grow
          control-class="gap-xs"
          class="equal_division--2"
        >
          <kw-select
            ref="selMclsfsRef"
            v-model="searchParams.pdMclsfIds"
            multiple
            :options="mclsfs"
            :placeholder="$t('MSG_TXT_CLSF') + $t('MSG_TXT_SELT')"
            style="max-width: 33%;"
          />
          <kw-select
            ref="selPdsRef"
            v-model="searchParams.pdCds"
            multiple
            :options="products"
            option-value="pdCd"
            option-label="pdNm"
            :placeholder="$t('MSG_TXT_MDL_NM') + $t('MSG_TXT_SELT')"
            style="max-width: 33%;"
          />
        </kw-field-wrap>
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
          @change="fetchPage"
        />
      </template>
      <kw-btn
        icon="download_on"
        secondary
        dense
        :label="$t('MSG_BTN_DOWN_COM_EXCEL')"
        :disable="pageInfo.totalCount === 0"
        @click="onClickCombiExcelDownload"
      />
      <kw-btn
        icon="download_on"
        secondary
        dense
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdRef"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      name="grdShipping"
      @init="initGrd"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="onChangePageInfo"
    />
    <kw-grid
      ref="grdCombiRef"
      name="grdCombi"
      style="max-width: 0; max-height: 0;"
      @init="initGrdCombi"
    />
    <!-- 숨기기 처리시 grid 초기화되지 않는 이슈로 인해 width, height 설정으로 회피 -->
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useMeta } from 'kw-lib';
import useGridDataModel from '~sms-common/contract/composable/useGridDataModel';
import dayjs from 'dayjs';
import { differenceBy, uniq, xor } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'COD_YN',
  'SELL_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRef = ref(getComponentType('KwGrid'));
const grdCombiRef = ref(getComponentType('KwGrid'));

const grdView = computed(() => grdRef.value?.getView());
const grdData = computed(() => grdRef.value?.getData());

const grdCombiView = computed(() => grdCombiRef.value?.getView());
const grdCombiData = computed(() => grdCombiRef.value?.getData());

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
const searchParams = reactive({
  strtdt: dayjs().startOf('M').format('YYYYMMDD'),
  enddt: dayjs().format('YYYYMMDD'),
  pdMclsfIds: [],
  pdCds: [],
  isCombi: 'N',
});

const selMclsfsRef = ref(getComponentType('KwSelect'));
const selPdsRef = ref(getComponentType('KwSelect'));

const unsorted = await dataService.get('/sms/wells/contract/sales-status/sec-product-management/medium-clsfs').then((response) => response.data);
const mclsfs = [];
const grouped = unsorted?.reduce((acc, cur) => {
  const key = cur.pdMclsfId;
  if (Array.isArray(acc[key])) {
    acc[key].push(cur);
  } else {
    /* notify! side effect */
    mclsfs.push({ codeId: key, codeName: cur.pdMclsfNm });
    acc[key] = [cur];
  }
  return acc;
}, {}) ?? {};
const products = Object.entries(grouped)
  .reduce((arr, entry) => {
    const partials = entry[1];
    const last = partials.at(partials.length - 1);
    if (last) { last.separator = false; } /* unique key bug exist on library... */
    arr.push(...partials);
    return arr;
  }, []);
const dictByPdCode = products.reduce((dict, pd) => { dict[pd.pdCd] = pd; return dict; }, {});
const selectedProducts = computed(() => searchParams.pdCds.map((pdCd) => (dictByPdCode[pdCd])));

watch(() => searchParams.pdMclsfIds, (value, oldValue) => {
  if (selPdsRef.value.pending) {
    return;
  }
  let currentProducts = [...selectedProducts.value];
  const added = differenceBy(value, oldValue);
  const pdMclsfIdsByPdCds = uniq(currentProducts.map((product) => product.pdMclsfId));
  added.forEach((pdMclsfId) => {
    /* 선택 된 상품 중 하나라도 해당 중분류를 가지는 값이 있다면 넘어간다. */
    if (pdMclsfIdsByPdCds.includes(pdMclsfId)) { return; }
    currentProducts.push(...grouped[pdMclsfId]);
  });
  const removed = differenceBy(oldValue, value);
  currentProducts = currentProducts.filter((product) => !removed.includes(product.pdMclsfId));
  if (added.length || removed.length) {
    searchParams.pdCds = currentProducts.map((product) => product.pdCd);
  }
});

watch(() => searchParams.pdCds, (value) => {
  if (selMclsfsRef.value.pending) {
    return;
  }
  const pdMclsfIdsByPdCds = uniq(value.map((pdCd) => dictByPdCode[pdCd].pdMclsfId));
  if (xor(pdMclsfIdsByPdCds, searchParams.pdMclsfIds)) {
    searchParams.pdMclsfIds = pdMclsfIdsByPdCds;
  }
});

const fetchPage = async (pageIndex = pageInfo.value.pageIndex, pageSize = pageInfo.value.pageSize) => {
  const params = {
    ...cachedParams,
    pageIndex,
    pageSize,
  };
  const response = await dataService.get('/sms/wells/contract/sales-status/sec-product-management/shipping-items/paging', { params });
  // console.log(response);
  pageInfo.value = response.data.pageInfo;
  grdData.value.setRows(response.data.list);

  grdView.value.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
};

function cacheParams() {
  cachedParams = {
    strtdt: searchParams.strtdt,
    enddt: searchParams.enddt,
    pdMclsfIds: searchParams.pdMclsfIds.join(','),
    pdCds: searchParams.pdCds.join(','),
    isCombi: 'N',
  };
}

async function onClickSearch() {
  cacheParams();
  pageInfo.value.pageIndex = 1;
  await fetchPage();
}

function onChangePageInfo(pageIndex, pageSize) {
  fetchPage(pageIndex, pageSize);
}

async function onClickCombiExcelDownload() {
  const params = {
    strtdt: cachedParams.strtdt,
    enddt: cachedParams.enddt,
    pdMclsfIds: cachedParams.pdMclsfIds,
    pdCds: cachedParams.pdCds,
    isCombi: 'Y',
  };
  const res = await dataService.get('/sms/wells/contract/sales-status/sec-product-management/shipping-items', { params });

  grdCombiData.value.setRows(res.data);
  grdCombiView.value.resetCurrent();

  await gridUtil.exportView(grdCombiView.value, {
    fileName: `${currentRoute?.value.meta?.menuName}(${t('MSG_TXT_DLVRY')})_콤비`,
    timePostfix: true,
    exportData: res.data,
    searchCondition: true,
  });
}

async function onClickExcelDownload() {
  if (!cachedParams) { cacheParams(); }
  const res = await dataService.get('/sms/wells/contract/sales-status/sec-product-management/shipping-items', { params: cachedParams });
  await gridUtil.exportView(grdView.value, {
    fileName: `${currentRoute?.value.meta?.menuName}(${t('MSG_TXT_DLVRY')})`,
    timePostfix: true,
    exportData: res.data,
    searchCondition: true,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd = defineGrid((data, view) => {
  useGridDataModel(view, {
    blkYn1: { displaying: false },
    blkYn2: { displaying: false },
    blkYn3: { displaying: false },
    blkYn4: { displaying: false },
    blkList: {
      label: t('MSG_TXT_SUS_CUST'),
      width: 100,
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const yn1 = values[fields.indexOf('blkYn1')];
        const yn2 = values[fields.indexOf('blkYn2')];
        const yn3 = values[fields.indexOf('blkYn3')];
        const yn4 = values[fields.indexOf('blkYn4')];

        let res = '';
        if (yn1 === '1') {
          res = `${t('MSG_TXT_KWK') /* 교원키 */} ${t('MSG_TIT_DUB') /* 의심 */}`;
        } else if (yn2 === '1') {
          res = `${t('MSG_TXT_CST_NM') /* 고객명 */} ${t('MSG_TIT_DUB') /* 의심 */}`;
        } else if (yn3 === '1') {
          res = `${t('MSG_TXT_CONTACT') /* 연락처 */} ${t('MSG_TIT_DUB') /* 의심 */}`;
        } else if (yn4 === '1') {
          res = `${t('MSG_TXT_ADDR') /* 주소 */} ${t('MSG_TIT_DUB') /* 의심 */}`;
        }
        return res;
      },
    },
    cttOrCnfmDtm: {
      label: t('MSG_TXT_ORD_INQ_DT'),
      width: 120,
      classes: 'text-center',
      datetimeFormat: 'date',
    },
    cntrNo: { displaying: false },
    cntrSn: { displaying: false },
    cntrNoSn: {
      label: t('MSG_TXT_CNTR_DTL_NO'),
      width: 150,
      valueExpression: 'values["cntrNo"] + "-" + values["cntrSn"]',
      classes: 'text-center',
    },
    sppBzsOrdId: {
      label: `${t('MSG_TXT_ORD_NO')}(${t('MSG_TXT_SEC')})`,
      width: 180,
      classes: 'text-center',
    },
    rcgvpKnm: {
      label: t('MSG_TXT_EXTRAD'), width: 100, classes: 'text-center',
    },
    zip: {
      label: t('MSG_TXT_ZIP'), width: 120, classes: 'text-center',
    },
    adr: { displaying: false },
    dtlAdr: { displaying: false },
    address: {
      label: t('MSG_TXT_ADDR'),
      width: 400,
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const adr = values[fields.indexOf('adr')];
        const dtlAdr = values[fields.indexOf('dtlAdr')];
        if (!adr) {
          return '';
        }
        return `${adr}${dtlAdr ? ` ${dtlAdr}` : ''}`;
      },
    },
    pdMclsfId: { displaying: false },
    pdMclsfNm: {
      label: `${t('MSG_TXT_PRDT_NM')}(${t('MSG_TXT_PD_MCLSF_ID')})`,
      width: 240,
      classes: 'text-center',
    },
    pdCd: { displaying: false },
    pdNm: { displaying: false },
    pd: {
      label: t('MSG_TXT_PRDT_NM'),
      width: 240,
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const pdNm = values[fields.indexOf('pdNm')];
        const pdCd = values[fields.indexOf('pdCd')];
        if (!pdNm) {
          return '';
        }
        return `${pdNm}${pdCd ? `(${pdCd})` : ''}`;
      },
    },
    cralLocaraTno: { displaying: false },
    mexnoEncr: { displaying: false },
    cralIdvTno: { displaying: false },
    shpadrTno: {
      label: `${t('MSG_TXT_SHPADR')} ${t('MSG_TXT_TEL_NO')}` /* 배송지 전화번호 */,
      width: 180,
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const tno1 = values[fields.indexOf('cralLocaraTno')];
        const tno2 = values[fields.indexOf('mexnoEncr')];
        const tno3 = values[fields.indexOf('cralIdvTno')];
        return (tno1 && tno2 && tno3) ? `${tno1}-${tno2}-${tno3}` : '';
      },
      classes: 'text-center',
    },
    prtnrCralLocaraTno: { displaying: false },
    prtnrMexnoEncr: { displaying: false },
    prtnrCralIdvTno: { displaying: false },
    prtnrTno: {
      label: `${t('MSG_TXT_PRTNR')} ${t('MSG_TXT_TEL_NO')}` /* 파트너 전화번호 */,
      width: 180,
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const tno1 = values[fields.indexOf('prtnrCralLocaraTno')];
        const tno2 = values[fields.indexOf('prtnrMexnoEncr')];
        const tno3 = values[fields.indexOf('prtnrCralIdvTno')];
        return (tno1 && tno2 && tno3) ? `${tno1}-${tno2}-${tno3}` : '';
      },
      classes: 'text-center',
    },
    unuitm: {
      label: t('MSG_TXT_UNUITM'),
      width: 200,
      classes: 'text-left',
    },
    istYn: {
      label: t('MSG_TXT_INST'),
      width: 134,
      options: codes.COD_YN,
    },
    istDt: {
      label: t('MSG_TXT_INST_DT'),
      width: 134,
      datetimeFormat: 'date',
    },
    pdctIdno: {
      label: t('MSG_TXT_SR_NUM'),
      width: 134,
      classes: 'text-center',
    },
    sellTpCd: {
      label: t('MSG_TXT_ORD_TYP'),
      width: 134,
      options: codes.SELL_TP_CD,
    },
  });
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // 스크롤 고정 - 의심고객, 주문 조회 일, 계약상세번호 고정
  view.setFixedOptions({ colCount: 3 });
});

const initGrdCombi = defineGrid((data, view) => {
  useGridDataModel(view, {
    cntrNo: { displaying: false },
    cntrSn: { displaying: false },
    cntrNoSn: {
      label: t('MSG_TXT_CNTR_DTL_NO'),
      width: 150,
      valueExpression: 'values["cntrNo"] + "-" + values["cntrSn"]',
      classes: 'text-center',
    },
    ojDtlCntrNo: { displaying: false },
    ojDtlCntrSn: { displaying: false },
    ojDtlCntrNoSn: {
      label: `${t('MSG_TXT_CNTR_DTL_NO')}(${t('MSG_TXT_COM_WALL')})`,
      width: 180,
      valueExpression: 'values["ojDtlCntrNo"] + "-" + values["ojDtlCntrSn"]',
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const ojDtlCntrNo = values[fields.indexOf('ojDtlCntrNo')];
        const ojDtlCntrSn = values[fields.indexOf('ojDtlCntrSn')];
        if (!ojDtlCntrNo) {
          return '';
        }
        return `${ojDtlCntrNo}-${ojDtlCntrSn}`;
      },
      classes: 'text-center',
    },
    rcgvpKnm: {
      label: t('MSG_TXT_EXTRAD'), width: 100, classes: 'text-center',
    },
    zip: {
      label: t('MSG_TXT_ZIP'), width: 120, classes: 'text-center',
    },
    adr: { displaying: false },
    dtlAdr: { displaying: false },
    address: {
      label: t('MSG_TXT_ADDR'),
      width: 400,
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const adr = values[fields.indexOf('adr')];
        const dtlAdr = values[fields.indexOf('dtlAdr')];
        if (!adr) {
          return '';
        }
        return `${adr}${dtlAdr ? ` ${dtlAdr}` : ''}`;
      },
    },
    pdMclsfId: { displaying: false },
    pdMclsfNm: {
      label: `${t('MSG_TXT_PRDT_NM')}(${t('MSG_TXT_PD_MCLSF_ID')})`,
      width: 240,
    },
    pdCd: { displaying: false },
    pdNm: { displaying: false },
    pd: {
      label: t('MSG_TXT_PRDT_NM'),
      width: 240,
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const pdNm = values[fields.indexOf('pdNm')];
        const pdCd = values[fields.indexOf('pdCd')];
        if (!pdNm) {
          return '';
        }
        return `${pdNm}${pdCd ? `(${pdCd})` : ''}`;
      },
    },
    combiPdNm: {
      label: t('MSG_TXT_COMBI_PRDT_NM'),
      width: 240,
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const combiPdNm = values[fields.indexOf('combiPdNm')];
        if (!combiPdNm) {
          return '';
        }
        return `${combiPdNm}`;
      },
    },
    cralLocaraTno: { displaying: false },
    mexnoEncr: { displaying: false },
    cralIdvTno: { displaying: false },
    shpadrTno: {
      label: `${t('MSG_TXT_SHPADR')} ${t('MSG_TXT_TEL_NO')}` /* 배송지 전화번호 */,
      width: 180,
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const tno1 = values[fields.indexOf('cralLocaraTno')];
        const tno2 = values[fields.indexOf('mexnoEncr')];
        const tno3 = values[fields.indexOf('cralIdvTno')];
        return (tno1 && tno2 && tno3) ? `${tno1}-${tno2}-${tno3}` : '';
      },
      classes: 'text-center',
    },
    prtnrCralLocaraTno: { displaying: false },
    prtnrMexnoEncr: { displaying: false },
    prtnrCralIdvTno: { displaying: false },
    prtnrTno: {
      label: `${t('MSG_TXT_PRTNR')} ${t('MSG_TXT_TEL_NO')}` /* 파트너 전화번호 */,
      width: 180,
      valueCallback: (gridBase, rowId, fieldName, fields, values) => {
        const tno1 = values[fields.indexOf('prtnrCralLocaraTno')];
        const tno2 = values[fields.indexOf('prtnrMexnoEncr')];
        const tno3 = values[fields.indexOf('prtnrCralIdvTno')];
        return (tno1 && tno2 && tno3) ? `${tno1}-${tno2}-${tno3}` : '';
      },
      classes: 'text-center',
    },
    unuitm: {
      label: t('MSG_TXT_UNUITM'),
      width: 200,
      classes: 'text-left',
    },
    istYn: {
      label: t('MSG_TXT_INST'),
      width: 134,
      options: codes.COD_YN,
    },
    istDt: {
      label: t('MSG_TXT_INST_DT'),
      width: 134,
      datetimeFormat: 'date',
    },
    pdctIdno: {
      label: t('MSG_TXT_SR_NUM'),
      width: 134,
      classes: 'text-center',
    },
    sellTpCd: {
      label: t('MSG_TXT_ORD_TYP'),
      width: 134,
      options: codes.SELL_TP_CD,
    },
  });
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
});
</script>
