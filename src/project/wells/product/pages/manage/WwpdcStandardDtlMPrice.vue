<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardDtlMPrice - 기준상품 상세조회 - 가격정보 ( W-PD-U-0010M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 등록/변경 - 가격정보 프로그램
****************************************************************************************************
--->
<template>
  <div>
    <kw-search
      one-row
      :cols="2"
      class="mt24"
      @search="onClickSearch"
      @reset="() => {
        searchParams.avlChnlId = usedChannelCds?.map(({ codeId }) => codeId);
      }"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_SEL_CHNL')">
          <kw-select
            v-model="searchParams.avlChnlId"
            :options="usedChannelCds"
            multiple
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
  </div>
  <kw-action-top class="mt30">
    <kw-btn
      icon="download_on"
      secondary
      dense
      :disable="totalCount === 0"
      :label="$t('MSG_BTN_EXCEL_DOWN')"
      @click="onClickExcelFormDownload"
    />
  </kw-action-top>
  <kw-grid
    ref="grdMainRef"
    name="grdDtlPriceMain"
    :visible-rows="10"
    ignore-on-modified
    @init="initGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, useDataService, codeUtil, gridUtil, stringUtil } from 'kw-lib';
import { isEmpty, merge } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { getCodeNames, resetVisibleGridColumns, pdMergeBy, getPropInfosToGridRows, getPdMetaToCodeNames, getPdMetaToGridInfos } from '~sms-common/product/utils/pdUtil';

/* eslint-disable no-use-before-define */
defineExpose({
  resetData, onClickSearch,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
  metaInfos: { type: Object, default: null },
  codes: { type: Object, default: null },
  readonly: { type: Boolean, default: false },
});

const dataService = useDataService();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const bas = pdConst.TBL_PD_BAS;
const prcd = pdConst.TBL_PD_PRC_DTL;
const prcfd = pdConst.TBL_PD_PRC_FNL_DTL;
const prumd = pdConst.TBL_PD_DSC_PRUM_DTL;
const currentPdCd = ref();
const currentInitData = ref(null);
const currentMetaInfos = ref();
const currentCodes = ref({});
const currentSellTpCd = ref(null);
const usedChannelCds = ref([]);
const selectionVariables = ref([]);
const feeVariables = ref([]);
const totalCount = ref(0);

const searchParams = ref({
  pdTpCd: pdConst.PD_TP_CD_STANDARD,
  pdCd: '',
  avlChnlId: ['all'],
});

async function resetData() {
  currentPdCd.value = '';
  currentInitData.value = {};
  grdMainRef.value?.getView().getDataSource().clearRows();
  if (grdMainRef.value?.getView()) gridUtil.reset(grdMainRef.value.getView());
}

async function initGridRows() {
  const view = grdMainRef.value.getView();

  // Grid visible 초기화
  resetVisibleGridColumns(currentMetaInfos.value, prcfd, view, ['vlStrtDtm', 'vlEndDtm']);

  // 선택된 선택변수 Visible 적용 ( 선택변수값 = Grid Filed명 )
  await resetVisibleChannelColumns();

  // 수수료 변수 visible 적용
  feeVariables.value?.forEach((item) => {
    const column = view.columnByName(item.codeId);
    if (column) {
      column.visible = true;
    }
  });

  if (currentInitData.value?.[prcfd]) {
    // 기준가 정보
    const stdRows = await getPropInfosToGridRows(
      currentInitData.value?.[prcd],
      currentMetaInfos.value,
      prcd,
    );

    const rows = await getPropInfosToGridRows(
      currentInitData.value?.[prcfd],
      currentMetaInfos.value,
      prcfd,
      ['svPdNm'],
    );
    rows?.map((row) => {
      row[pdConst.PRC_FNL_ROW_ID] = row[pdConst.PRC_FNL_ROW_ID] ?? row.pdPrcFnlDtlId;
      row[pdConst.PRC_STD_ROW_ID] = row[pdConst.PRC_STD_ROW_ID] ?? row.pdPrcDtlId;
      const stdRow = stdRows?.find((item) => (row[pdConst.PRC_STD_ROW_ID]
                                                && item[pdConst.PRC_STD_ROW_ID] === row[pdConst.PRC_STD_ROW_ID])
                                            || item.pdPrcDtlId === row.pdPrcDtlId);
      row = pdMergeBy(row, stdRow);
      // row.sellTpCd = currentInitData.value[pdConst.TBL_PD_BAS]?.sellTpCd;
      return row;
    });
    if (searchParams.value.avlChnlId.length) {
      view.getDataSource().setRows(rows?.filter((item) => searchParams.value.avlChnlId.includes(item.sellChnlCd)));
    } else {
      view.getDataSource().setRows(rows);
    }
  }
  totalCount.value = gridUtil.getAllRowValues(view).length;
}

async function resetInitData() {
  const channels = currentInitData.value?.[pdConst.TBL_PD_DTL]
    ?.reduce((rtn, item) => {
      if (item.avlChnlId) {
        rtn.push(item.avlChnlId);
      }
      return rtn;
    }, [])?.join(',');
  if (channels) {
    usedChannelCds.value = props.codes?.SELL_CHNL_DTL_CD.filter((item) => channels.indexOf(item.codeId) > -1);
    searchParams.value.avlChnlId = usedChannelCds.value.map(({ codeId }) => codeId);
  }
}

async function onClickSearch() {
  await initGridRows();
}

async function fetchData() {
  const { codes } = props;
  if (isEmpty(currentMetaInfos.value)) {
    const res = await dataService.get('/sms/common/product/meta-properties', { params: { pdPrcTpCd: pdConst.PD_PRC_TP_CD_ALL } });
    if (isEmpty(res.data)) {
      return;
    }
    currentMetaInfos.value = res.data;
  }
  // console.log('WwpdcStandardMgtMPrice - fetchData - currentMetaInfos.value : ', currentMetaInfos.value);
  const codeNames = await getPdMetaToCodeNames(currentMetaInfos.value, props.codes);
  if (!isEmpty(codeNames)) {
    try {
      currentCodes.value = merge(codes, await codeUtil.getMultiCodes(...codeNames));
    } catch (e) {
      console.log(e);
      // 공통코드 없는 에러 때문에 임시 - 추후 Try catch 삭제
    }
  }
}

// 선택변수 Visible 적용 ( 선택변수값 = Grid Filed명 )
async function resetVisibleChannelColumns() {
  // 선택변수 전체(판매유형)
  await fetchSelectVariableData();
  if (!selectionVariables.value?.length) {
    // 선택변수가 없으면 초기화
    return;
  }

  // 선택된 선택변수
  const checkedVals = currentInitData.value?.[prumd]?.reduce((rtn, item) => {
    if (item.pdDscPrumPrpVal01) {
      // 선택변수 DB 값은 대문자
      rtn.push(item.pdDscPrumPrpVal01);
    }
    return rtn;
  }, []);

  selectionVariables.value.forEach((field) => {
    const view = grdMainRef.value.getView();
    const column = view.columnByName(field.codeId);
    if (column) {
      if (checkedVals && checkedVals.includes(field.colNm)) {
        column.visible = true;
      } else {
        column.visible = false;
      }
    }
  });
}

// 엑셀다운로드
async function onClickExcelFormDownload() {
  const view = grdMainRef.value.getView();
  let downFileName = currentInitData.value[bas].pdCd ? `${currentInitData.value[bas].pdNm}(${currentInitData.value[bas].pdCd})` : currentInitData.value[bas].pdNm;
  downFileName += `_${t('MSG_TXT_PRICE_INFO')}`;
  await gridUtil.exportView(view, {
    fileName: downFileName,
    timePostfix: true,
  });
}

// 선택변수
async function fetchSelectVariableData() {
  const sellTpCd = currentInitData.value[pdConst.TBL_PD_BAS]?.sellTpCd;
  if (sellTpCd && (isEmpty(currentSellTpCd.value) || sellTpCd !== currentSellTpCd.value)) {
    currentSellTpCd.value = sellTpCd;
    // 선택변수
    const typeRes = await dataService.get('/sms/common/product/type-variables', { params: { sellTpCd } });
    selectionVariables.value = typeRes.data?.filter((item) => item.choFxnDvCd === pdConst.CHO_FXN_DV_CD_CHOICE);
    feeVariables.value = typeRes.data?.filter((item) => item.choFxnDvCd === pdConst.CHO_FXN_DV_CD_FEE);
  }
}

async function initProps() {
  const { pdCd, initData, metaInfos, codes } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
  currentMetaInfos.value = metaInfos;
  currentCodes.value = codes;
}

await initProps();
await fetchData();

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.initData, (val) => { currentInitData.value = val; resetInitData(); }, { deep: true });

onMounted(async () => {
  await onClickSearch();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
async function initGrid(data, view) {
  currentMetaInfos.value.map((item) => {
    item.readEuYn = 'Y';
    if (item.colNm === 'fnlVal') {
      // 최종가격
      item.prpNm = t('MSG_TXT_PD_FNL_PRC');
    }
    return item;
  });
  const { fields, columns } = await getPdMetaToGridInfos(
    currentMetaInfos.value,
    [pdConst.PD_PRC_TP_CD_BASIC,
      pdConst.PD_PRC_TP_CD_VARIABLE,
      pdConst.PD_PRC_TP_CD_FINAL,
      pdConst.PD_PRC_TP_CD_FEE],
    currentCodes.value,
  );

  columns.forEach((item) => {
    if (item.fieldName === 'svPdCd') {
      item.styleName = 'text-left';
      item.displayCallback = (grid, index) => {
        const { svPdCd, svPdNm } = grid.getValues(index.itemIndex);
        if (svPdNm) {
          return svPdNm;
        }
        return getCodeNames(props.codes.svPdCd, svPdCd);
      };
    }
  });

  // 적용기간
  const applyPeriodCol = { fieldName: 'applyPeriod',
    header: t('MSG_TXT_ACEPT_PERIOD'),
    width: '200',
    styleName: 'text-center',
    displayCallback(grid, index) {
      const vlStrtDtm = grid.getValue(index.itemIndex, 'vlStrtDtm');
      const vlEndDtm = grid.getValue(index.itemIndex, 'vlEndDtm');
      if (vlStrtDtm || vlEndDtm) {
        return `${stringUtil.getDateFormat(vlStrtDtm)} ~ ${stringUtil.getDateFormat(vlEndDtm)}`;
      }
      return '';
    },
  };
  columns.splice(1, 0, applyPeriodCol);
  fields.push({ fieldName: 'applyPeriod' });
  fields.push({ fieldName: 'svPdNm' });

  data.setFields(fields);
  view.setColumns(columns.sort((item) => (item.fieldName === 'sellChnlCd' ? -1 : 0))
    .map((item) => {
      // 적용 시작일자, 종료일자 숨김
      if (['vlStrtDtm', 'vlEndDtm'].includes(item.fieldName)) {
        item.visible = false;
      }
      return item;
    }));
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = false;

  view.setFixedOptions({ colCount: 5 });

  await resetInitData();
}
</script>
