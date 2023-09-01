<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcCompositionDtlMPrice - 복합상품 상세조회 - 가격정보
                ( Z-PD-U-0021M04 )
3. 작성자 : jintae.choi
4. 작성일 : 2023.04.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 복합상품 등록/변경 - 가격정보 프로그램
****************************************************************************************************
--->
<template>
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
    name="grdDtlPrcMain"
    :visible-rows="10"
    ignore-on-modified
    @init="initGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil, gridUtil, stringUtil, getComponentType } from 'kw-lib';
import pdConst from '~sms-common/product/constants/pdConst';
import { merge, cloneDeep, isEmpty } from 'lodash-es';
import { pdMergeBy, getPdMetaToCodeNames, getPropInfosToGridRows, getPdMetaToGridInfos } from '~sms-common/product/utils/pdUtil';

/* eslint-disable no-use-before-define */
defineExpose({
  resetData, onClickSearch,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
  codes: { type: Object, default: null },
});

const { t } = useI18n();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const bas = pdConst.TBL_PD_BAS;
const prcd = pdConst.TBL_PD_PRC_DTL;
const prcfd = pdConst.TBL_PD_PRC_FNL_DTL;
const currentPdCd = ref();
const currentInitData = ref(null);
const metaInfos = ref();
const currentCodes = ref({});
const totalCount = ref(0);
const defaultFields = ref(['verSn', pdConst.PRC_STD_ROW_ID, pdConst.PRC_FNL_ROW_ID,
  pdConst.PRC_DETAIL_ID, pdConst.PRC_DETAIL_FNL_ID, 'basePdTempSaveYn', 'basePdClsfNm', 'basePdNm', 'basePdCd', 'baseSellTpCd']);

const searchParams = ref({
  pdTpCd: pdConst.PD_TP_CD_COMPOSITION,
  pdCd: '',
});

async function resetData() {
  currentPdCd.value = '';
  currentInitData.value = {};
  grdMainRef.value?.getView().getDataSource().clearRows();
  if (grdMainRef.value?.getView()) gridUtil.reset(grdMainRef.value.getView());
}

async function initGridRows() {
  const view = grdMainRef.value?.getView();
  if (!view) {
    return;
  }
  if (await currentInitData.value?.[prcfd]) {
    // 기준가 정보
    const stdRows = await getPropInfosToGridRows(
      currentInitData.value?.[prcd],
      metaInfos.value,
      prcd,
      [pdConst.PRC_STD_ROW_ID, 'pdPrcDtlId'],
    );
    // 선택변수/최종가
    const rows = cloneDeep(await getPropInfosToGridRows(
      currentInitData.value?.[prcfd],
      metaInfos.value,
      prcfd,
      defaultFields.value,
    ));
    rows?.forEach((row) => {
      const stdRow = stdRows?.find((item) => (row[pdConst.PRC_STD_ROW_ID]
                                                && item[pdConst.PRC_STD_ROW_ID] === row[pdConst.PRC_STD_ROW_ID])
                                            || item.pdPrcDtlId === row.pdPrcDtlId);
      row = pdMergeBy(row, stdRow);
      row[pdConst.PRC_STD_ROW_ID] = row[pdConst.PRC_STD_ROW_ID] ?? row.pdPrcDtlId;
      row[pdConst.PRC_FNL_ROW_ID] = row[pdConst.PRC_FNL_ROW_ID] ?? row.pdPrcFnlDtlId;
    });
    // console.log('WwpdcCompositionDtlMPrice - initGridRows - rows : ', rows);
    view.getDataSource().setRows(rows);
  } else {
    view.getDataSource().clearRows();
  }
  totalCount.value = gridUtil.getAllRowValues(view).length;
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

async function fetchData() {
  const res = await dataService.get('/sms/common/product/meta-properties', { params: { pdPrcTpCd: pdConst.PD_PRC_TP_CD_COMPOSITION } });
  if (isEmpty(res.data)) {
    return;
  }
  metaInfos.value = res.data;
  // console.log('WwpdcCompositionMgtMPrice - fetchData - metaInfos.value : ', metaInfos.value);
  // TODO pdPrcTpCd: pdConst.PD_PRC_TP_CD_COMPOSITION
  const codeNames = await getPdMetaToCodeNames(metaInfos.value, currentCodes.value);
  if (!isEmpty(codeNames)) {
    // console.log('WwpdcCompositionMgtMPrice - fetchData - codeNames : ', codeNames);
    try {
      currentCodes.value = merge(currentCodes.value, await codeUtil.getMultiCodes(...codeNames));
    } catch (e) {
      console.log(e);
      // 공통코드 없는 에러 때문에 임시 - 추후 Try catch 삭제
    }
  }
}

async function onClickSearch() {
  await initGridRows();
}

async function initProps() {
  const { pdCd, initData, codes } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
  currentCodes.value = cloneDeep(codes);
  searchParams.value.pdCd = currentPdCd.value;
  await fetchData();
}

await initProps();

watch(() => props.pdCd, (val) => {
  currentPdCd.value = val;
});

watch(() => props.initData, (val) => {
  currentInitData.value = val;
  initGridRows();
}, { deep: true });

onMounted(async () => {
  await onClickSearch();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
async function initGrid(data, view) {
  const pdColumns = [
    // 상태
    { fieldName: 'basePdTempSaveYn', header: t('MSG_TXT_STT'), width: '85', styleName: 'text-center', options: props.codes?.PD_TEMP_SAVE_CD },
    // 기준상품 분류
    { fieldName: 'basePdClsfNm', header: t('MSG_TXT_PD_STD_TYPE'), width: '171' },
    // 기준상품명
    { fieldName: 'basePdNm', header: t('MSG_TXT_PD_STD_NAME'), width: '126' },
    // 기준상품코드
    { fieldName: 'basePdCd', header: t('MSG_TXT_PD_STD_CODE'), width: '115', styleName: 'text-center', dataType: 'date' },
    // 판매유형
    { fieldName: 'baseSellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '107', styleName: 'text-center', options: props.codes?.SELL_TP_CD },
    // 판매채널
    { fieldName: 'sellChnlCd', header: t('MSG_TXT_SEL_CHNL'), width: '87', styleName: 'text-center', options: currentCodes.value.SELL_CHNL_DTL_CD },
    // 적용기간
    { fieldName: 'applyPeriod',
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
    },

  ];
  const pdFields = pdColumns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  pdFields.push({ fieldName: 'vlStrtDtm' });
  pdFields.push({ fieldName: 'vlEndDtm' });
  metaInfos.value.map((item) => { item.readEuYn = 'Y'; return item; });
  const { fields, columns } = await getPdMetaToGridInfos(
    metaInfos.value,
    [pdConst.PD_PRC_TP_CD_COMPOSITION],
    currentCodes.value,
    [],
    [],
    [],
    ['basePdCd', 'sellChnlCd', 'sellTpCd', 'vlStrtDtm', 'vlEndDtm'],
  );

  pdColumns.push(...columns);
  pdFields.push(...fields);

  data.setFields(pdFields);
  view.setColumns(pdColumns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = false;

  await initGridRows();
}
</script>
