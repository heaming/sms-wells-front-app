<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcCompositionDtlMPrice - 기준상품 상세조회 - 가격정보 ( W-PD-U-0010M01 )
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
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_SEL_CHNL')">
          <kw-select
            v-model="searchParams.avlChnlId"
            first-option="all"
            :options="usedChannelCds"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
  </div>
  <kw-action-top class="mt40">
    <!-- (단위 : 원) -->
    <span class="kw-fc---black3 text-weight-regular">({{ $t('MSG_TXT_UNIT') }} : {{ $t('MSG_TXT_CUR_WON') }})</span>
  </kw-action-top>
  <kw-grid
    ref="grdMainRef"
    :visible-rows="10"
    ignore-on-modified
    @init="initGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil, gridUtil, getComponentType, stringUtil } from 'kw-lib';
import pdConst from '~sms-common/product/constants/pdConst';
import { merge, cloneDeep, isEmpty } from 'lodash-es';
import { pdMergeBy, getPdMetaToCodeNames, getPropInfosToGridRows, getPdMetaToGridInfos } from '~sms-common/product/utils/pdUtil';

/* eslint-disable no-use-before-define */
defineExpose({
  resetData,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
  codes: { type: Object, default: null },
});

const dataService = useDataService();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const prcd = pdConst.TBL_PD_PRC_DTL;
const prcfd = pdConst.TBL_PD_PRC_FNL_DTL;
const currentPdCd = ref();
const currentInitData = ref(null);
const usedChannelCds = ref([]);
const metaInfos = ref();
const currentCodes = ref({});

const searchParams = ref({
  pdTpCd: pdConst.PD_TP_CD_COMPOSITION,
  pdCd: '',
  avlChnlId: '',
});

async function resetData() {
  currentPdCd.value = '';
  currentInitData.value = {};
  if (grdMainRef.value?.getView()) gridUtil.reset(grdMainRef.value.getView());
}

async function initGridRows() {
  const view = grdMainRef.value?.getView();
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
      [pdConst.PRC_STD_ROW_ID, pdConst.PRC_FNL_ROW_ID, 'pdPrcDtlId', 'pdPrcFnlDtlId'],
    ));
    rows?.forEach((row) => {
      const stdRow = stdRows?.find((item) => item[pdConst.PRC_STD_ROW_ID] === row[pdConst.PRC_STD_ROW_ID]
                                            || item.pdPrcDtlId === row.pdPrcDtlId);
      row = pdMergeBy(row, stdRow);
      row[pdConst.PRC_STD_ROW_ID] = row[pdConst.PRC_STD_ROW_ID] ?? row.pdPrcDtlId;
      row[pdConst.PRC_FNL_ROW_ID] = row[pdConst.PRC_FNL_ROW_ID] ?? row.pdPrcFnlDtlId;
    });
    // console.log('WwpdcCompositionDtlMPrice - initGridRows - rows : ', rows);
    if (searchParams.value.avlChnlId) {
      view.getDataSource().setRows(rows?.filter((item) => item.sellChnlCd === searchParams.value.avlChnlId));
    } else {
      view.getDataSource().setRows(rows);
    }
    view.resetCurrent();
  } else {
    view.getDataSource().clearRows();
  }
}

async function resetInitData() {
  const channels = currentInitData.value?.[pdConst.TBL_PD_DTL]
    ?.reduce((rtn, item) => {
      if (item.avlChnlId) {
        rtn.push(item.avlChnlId);
      }
      return rtn;
    }, [])
    ?.join(',');
  if (channels) {
    usedChannelCds.value = props.codes?.SELL_CHNL_DTL_CD.filter((item) => channels.indexOf(item.codeId) > -1);
  }
  await initGridRows();
}

async function fetchData() {
  // const res = await dataService.get('/sms/common/product/prices', { params: searchParams.value });
  // const view = grdMainRef.value.getView();
  // view.getDataSource().setRows(res.data);
  // view.resetCurrent();
  const res = await dataService.get('/sms/common/product/meta-properties', { params: { pdPrcTpCd: pdConst.PD_PRC_TP_CD_ALL } });
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

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.initData, (val) => { currentInitData.value = val; resetInitData(); }, { deep: true });

onMounted(async () => {
  await onClickSearch();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
async function initGrid(data, view) {
  const { fields, columns } = await getPdMetaToGridInfos(
    metaInfos.value,
    [pdConst.PD_PRC_TP_CD_COMPOSITION],
    currentCodes.value,
  );
  // console.log('WwpdcCompositionDtlMPrice - initGr id - columns : ', columns);
  // Grid 내부키 - '신규 Row 추가' 대응
  fields.push({ fieldName: pdConst.PRC_STD_ROW_ID });
  fields.push({ fieldName: pdConst.PRC_FNL_ROW_ID });

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
  columns.splice(6, 0, applyPeriodCol);
  fields.push({ fieldName: 'applyPeriod' });
  // console.log('columns : ', columns);
  data.setFields(fields);
  view.setColumns(columns.map((item) => {
    // 적용 시작일자, 종료일자 숨김
    if (['vlStrtDtm', 'vlEndDtm'].includes(item.fieldName)) {
      item.visible = false;
    }
    return item;
  }));
  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
  view.editOptions.editable = false;

  await resetInitData();
}
</script>
