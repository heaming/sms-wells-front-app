<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardSummaryDtlP - 판매상품 관리 - 기준상품 요약조회
               ( W-PD-U-0010P02 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 서비스 관리 - 기준상품 요약조회
****************************************************************************************************
--->
<template>
  <kw-popup size="xl">
    <kw-chip
      v-if="pdInfo.sellYn === 'Y'"
      :label="$t('MSG_TXT_PD_SELLING')"
      color="primary"
      outline
      class="ml0 mb8 mt0"
    />
    <h2 class="h2-small mb30">
      {{ pdInfo.pdNm }}({{ pdInfo.pdCd }})
      <p>
        <!-- 등록일 -->
        <span>{{ $t('MSG_TXT_RGST_DT') }} {{ stringUtil.getDateFormat(pdInfo.fstRgstDtm) }}
          /  {{ pdInfo.fstRgstUsrNm }}</span><span>
          <!-- 최종수정일  -->
          {{ $t('MSG_TXT_L_UPDATED') }} {{ stringUtil.getDateFormat(pdInfo.fnlMdfcDtm) }}
          / {{ pdInfo.fnlMdfcUsrNm }}</span>
      </p>
    </h2>
    <kw-form
      :cols="2"
      dense
    >
      <kw-form-row>
        <!-- 판매기간 -->
        <kw-form-item :label="$t('MSG_TXT_PRDT_SLE_PRD')">
          <p v-if="pdInfo.sellStrtdt || pdInfo.sellEnddt">
            {{ stringUtil.getDateFormat(pdInfo.sellStrtdt) }} ~ {{ stringUtil.getDateFormat(pdInfo.sellEnddt) }}
          </p>
        </kw-form-item>
        <!-- 상품분류 -->
        <kw-form-item :label="$t('MSG_TXT_PRDT_CATE')">
          <p v-if="pdInfo.pdHclsfId || pdInfo.pdMclsfId || pdInfo.pdLclsfId">
            {{ getCodeNames(codes, pdInfo.pdHclsfId, 'clsfCodes') }}
            <slot v-if="pdInfo.pdMclsfId">
              {{ ' > ' }}
            </slot>
            {{ getCodeNames(codes, pdInfo.pdMclsfId, 'clsfCodes') }}
            <slot v-if="pdInfo.pdLclsfId">
              {{ ' > ' }}
            </slot>
            {{ getCodeNames(codes, pdInfo.pdLclsfId, 'clsfCodes') }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 판매유형 -->
        <kw-form-item :label="$t('MSG_TXT_SEL_TYPE')">
          <p>
            {{ getCodeNames(codes, pdInfo.sellTpCd, 'SELL_TP_CD') }}
          </p>
        </kw-form-item>
        <!-- 판매채널 -->
        <kw-form-item :label="$t('MSG_TXT_SEL_CHNL')">
          <p>
            {{ getCodeNames(codes, pdInfo.avlChnlId, 'SELL_CHNL_DTL_CD') }}
          </p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <!-- 판매상세유형 -->
        <kw-form-item :label="$t('MSG_TXT_SELL_TP_DTL_CD')">
          <p>
            {{ getCodeNames(codes, pdInfo.sellTpDtlCd, 'SELL_TP_DTL_CD') }}
          </p>
        </kw-form-item>
        <!-- 리퍼여부 -->
        <kw-form-item :label="$t('MSG_TXT_WHETHER_REFURBISHED')">
          <p>
            {{ pdInfo.rfbshYn }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 판매여부 -->
        <kw-form-item :label="$t('MSG_TXT_SLE_YN')">
          <p>
            {{ pdInfo.sellYn }}
          </p>
        </kw-form-item>
        <!-- 설치택배구분 -->
        <kw-form-item :label="$t('MSG_TXT_PD_SET_PSVC_TYPE')">
          <p>
            {{ getCodeNames(codes, pdInfo.istPcsvTpCd, 'SV_IST_PCSV_DV_CD') }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 통화명 -->
        <kw-form-item :label="$t('MSG_TXT_CUR_NAME')">
          <p>
            {{ getCodeNames(codes, pdInfo.crncyDvCd, 'CRNCY_DV_CD') }}
          </p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-grid
      ref="grdMaterialRef"
      :visible-rows="1"
      class="mb30"
      @init="initMaterialGrid"
    />
    <kw-grid
      ref="grdServiceRef"
      :visible-rows="1"
      class="mb30"
      @init="initServiceGrid"
    />
    <kw-grid
      ref="grdStandardRef"
      :visible-rows="1"
      class="mb30"
      @init="initStandardGrid"
    />
    <kw-grid
      ref="grdChangePrdRef"
      :visible-rows="1"
      class="mb30"
      @init="initChangePrdGrid"
    />
    <ul class="filter-box mb12">
      <li class="filter-box__item">
        <p class="filter-box__item-label">
          <!-- 판매채널 -->
          {{ $t('MSG_TXT_SEL_CHNL') }}
        </p>
        <kw-select
          v-model="filterChannel"
          dense
          first-option="all"
          class="w250"
          :options="usedChannelCds"
          @update:model-value="onUpdateSellChannel"
        />
      </li>
    </ul>
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :visible-rows="5"
      @init="initGrid"
    />
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, codeUtil, stringUtil, getComponentType, useModal } from 'kw-lib';
import pdConst from '~sms-common/product/constants/pdConst';
import { getCodeNames } from '~sms-common/product/utils/pdUtil';

const props = defineProps({
  pdCd: { type: String, default: null },
});

const { cancel } = useModal();
const dataService = useDataService();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMaterialRef = ref(getComponentType('KwGrid'));
const grdServiceRef = ref(getComponentType('KwGrid'));
const grdStandardRef = ref(getComponentType('KwGrid'));
const grdChangePrdRef = ref(getComponentType('KwGrid'));
const grdMainRef = ref(getComponentType('KwGrid'));

const filterChannel = ref();
const usedChannelCds = ref([]);
const currentPdCd = ref();
const pdInfo = ref({});
const pdRels = ref([]);
const pdPrcs = ref([]);
const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD',
  'SELL_TP_DTL_CD',
  'SV_PRD_UNIT_CD',
  'SV_VST_PRD_CD',
  'SELL_CHNL_DTL_CD',
  'SPAY_DSC_DV_CD',
  'STPL_PRD_CD',
  'SV_IST_PCSV_DV_CD',
  'BASE_PD_REL_DV_CD',
  'PD_PDCT_REL_DV_CD',
  'CRNCY_DV_CD',
);

async function initGridRows() {
  if (pdRels.value && pdRels.value.length) {
    const materialView = grdMaterialRef.value?.getView();
    if (materialView) {
      const materialCodeValues = codes.PD_PDCT_REL_DV_CD
        .reduce((rtns, code) => { rtns.push(code.codeId); return rtns; }, []);
      const materialRows = pdRels.value
        ?.filter((item) => materialCodeValues.includes(item[pdConst.PD_REL_TP_CD]));
      materialView.getDataSource().setRows(materialRows);
    }

    const serviceView = grdServiceRef.value?.getView();
    if (serviceView) {
      const serviceRows = pdRels.value
        ?.filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_P_TO_S);
      serviceView.getDataSource().setRows(serviceRows);
    }

    const standardView = grdStandardRef.value?.getView();
    if (standardView) {
      const standardCodeValues = codes.BASE_PD_REL_DV_CD
        .reduce((rtns, code) => { rtns.push(code.codeId); return rtns; }, []);
      const standardRows = pdRels.value
        ?.filter((item) => standardCodeValues.includes(item[pdConst.PD_REL_TP_CD]));
      standardView.getDataSource().setRows(standardRows);
    }

    const changeView = grdChangePrdRef.value?.getView();
    if (changeView) {
      const changeRows = pdRels.value
        ?.filter((item) => item[pdConst.PD_REL_TP_CD] === pdConst.PD_REL_TP_CD_CHANGE);
      changeView.getDataSource().setRows(changeRows);
    }
  }

  const view = grdMainRef.value.getView();
  if (view) {
    const sellChannelFilterCond = codes.SELL_CHNL_DTL_CD.map((v) => ({ name: v.codeId, criteria: `value = '${v.codeId}'` }));
    // 판매채널 필터
    if (sellChannelFilterCond) {
      view.setColumnFilters('sellChnlCd', sellChannelFilterCond, true);
    }
    view.getDataSource().setRows(pdPrcs.value);
  }
}

async function fetchData() {
  // const resPd = await dataService.get('/sms/common/product/products', {
  //  params: { pdTpCd: pdConst.PD_TP_CD_STANDARD, pdCd: currentPdCd.value } });
  const resPd = await dataService.get(`/sms/common/product/${currentPdCd.value}`).catch(() => {
    cancel();
  });
  if (!resPd || !resPd.data) return;
  pdInfo.value = resPd.data?.product;

  const resRel = await dataService.get(`/sms/common/product/relations/products/${currentPdCd.value}`);
  pdRels.value = resRel.data;

  const resPrc = await dataService.get(`/sms/common/product/prices/products/${currentPdCd.value}`);
  pdPrcs.value = resPrc.data?.prices;
  if (pdPrcs.value) {
    const channels = pdPrcs.value.reduce((rtn, item) => {
      if (item.sellChnlCd) {
        rtn.push(item.sellChnlCd);
      }
      return rtn;
    }, []);
    usedChannelCds.value = codes.SELL_CHNL_DTL_CD.filter((item) => channels.includes(item.codeId));
  }

  const resCls = await dataService.get('/sms/common/product/classifications', { params: { hgrPdClsfId: '', pdTpCd: pdConst.PD_TP_CD_STANDARD } });
  codes.clsfCodes = resCls.data?.map((item) => ({ ...item, codeId: item.pdClsfId, codeName: item.pdClsfNm }), []);
}

async function onUpdateSellChannel() {
  const view = grdMainRef.value.getView();
  view.activateAllColumnFilters('sellChnlCd', false);
  if (filterChannel.value) {
    view.activateColumnFilters('sellChnlCd', [filterChannel.value], true);
  }
}

async function initProps() {
  const { pdCd } = props;
  currentPdCd.value = pdCd;
  if (currentPdCd.value) {
    await fetchData();
  }
}

await initProps();

//-------------------------------------------------------------------------------------------------
// Initialize Grid
//-------------------------------------------------------------------------------------------------
async function initMaterialGrid(data, view) {
  const columns = [
    // 적용시작일자
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_APY_STRTDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 적용종료일자
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_APY_ENDDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 교재/자재 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_BOK_MTR_TYPE'), width: '201' },
    // 교재/자재명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_BOK_MTR_NAME'), width: '206' },
    // 상품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '110', styleName: 'text-center' },
    // 전집/기기구분
    { fieldName: 'lrnColleDvTyp', header: t('TXT_MSG_LRNN_COCN_MCHN_TP_CD'), width: '187', styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}

async function initServiceGrid(data, view) {
  const columns = [
    // 적용시작일자
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_APY_STRTDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 적용종료일자
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_APY_ENDDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 서비스 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_SVC_CATG'), width: '140' },
    // 서비스명
    { fieldName: 'pdNm', header: t('MSG_TXT_SVC_NAME'), width: '206' },
    // 서비스코드
    { fieldName: 'pdCd', header: t('MSG_TXT_SVC_CODE'), width: '110', styleName: 'text-center' },
    // 주기단위/방문주기
    { fieldName: 'svVstPrdCdSet',
      header: t('MSG_TXT_PD_UNIT_VISIT_PERI'),
      width: '170',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const svPrdUnitCd = getCodeNames(codes.SV_PRD_UNIT_CD, grid.getValue(index.itemIndex, 'svPrdUnitCd'));
        const svVstPrdCd = getCodeNames(codes.SV_VST_PRD_CD, grid.getValue(index.itemIndex, 'svVstPrdCd'));
        if (svPrdUnitCd || svVstPrdCd) {
          return `${svPrdUnitCd} / ${svVstPrdCd}`;
        }
        return '';
      },
    },
    // 주기단위/택배주기
    { fieldName: 'pcsvPrdCdSet',
      header: t('MSG_TXT_PD_UNIT_PARCEL_PERI'),
      width: '170',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const svPrdUnitCd = getCodeNames(codes.SV_PRD_UNIT_CD, grid.getValue(index.itemIndex, 'svPrdUnitCd'));
        const pcsvPrdCd = getCodeNames(codes.SV_VST_PRD_CD, grid.getValue(index.itemIndex, 'pcsvPrdCd'));
        if (svPrdUnitCd || pcsvPrdCd) {
          return `${svPrdUnitCd} / ${pcsvPrdCd}`;
        }
        return '';
      },
    },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  fields.push({ fieldName: 'svPrdUnitCd' });
  fields.push({ fieldName: 'svVstPrdCd' });
  fields.push({ fieldName: 'pcsvPrdCd' });
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}
async function initStandardGrid(data, view) {
  const columns = [
    // 관계구분
    { fieldName: 'pdRelTpCd', header: t('MSG_TXT_RELATION_CLSF'), width: '85', styleName: 'text-center', options: codes.BASE_PD_REL_DV_CD },
    // 적용시작일자
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_APY_STRTDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 적용종료일자
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_APY_ENDDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 기준상품 분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PD_STD_TYPE'), width: '230' },
    // 기준상품명
    { fieldName: 'pdNm', header: t('MSG_TXT_PD_STD_NAME'), width: '206' },
    // 기준상품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PD_STD_CODE'), width: '110', styleName: 'text-center' },
    // 판매유형
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '150', styleName: 'text-center', options: codes.SELL_TP_CD },
    // 판매채널
    { fieldName: 'channelId', header: t('MSG_TXT_SEL_CHNL'), width: '187', options: codes.SELL_CHNL_DTL_CD },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}

async function initChangePrdGrid(data, view) {
  const columns = [
    // 적용시작일자
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_APY_STRTDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 적용종료일자
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_APY_ENDDT'), width: '100', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 제품분류
    { fieldName: 'pdClsfNm', header: t('MSG_TXT_PRDT_CLSF'), width: '140' },
    // 제품명
    { fieldName: 'pdNm', header: t('MSG_TXT_GOODS_NM'), width: '206' },
    // 제품코드
    { fieldName: 'pdCd', header: t('MSG_TXT_PROD_CD'), width: '110', styleName: 'text-center ' },
    // 자재코드
    { fieldName: 'sapMatCd', header: t('MSG_TXT_MATI_CD'), width: '110', styleName: 'text-center ' },
    // 모델명
    { fieldName: 'modelNm', header: t('MSG_TXT_MDL_NM'), width: '119' },
    // 모델NO
    { fieldName: 'modelNo', header: t('MSG_TXT_PD_MODEL_NO'), width: '122', styleName: 'text-center ' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}

async function initGrid(data, view) {
  const columns = [
    // 판매채널
    { fieldName: 'sellChnlCd', header: t('MSG_TXT_SEL_CHNL'), width: '110', styleName: 'text-center', options: codes.SELL_CHNL_DTL_CD, autoFilter: false },
    // 적용시작일
    { fieldName: 'vlStrtDtm', header: t('MSG_TXT_APY_STRT_DAY'), width: '97', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 적용종료일
    { fieldName: 'vlEndDtm', header: t('MSG_TXT_APY_END_DAY'), width: '97', styleName: 'text-center', dataType: 'date', datetimeFormat: 'date' },
    // 판매유형
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '90', styleName: 'text-center', options: codes.SELL_TP_CD },
    // LV.1(SVC명)
    { fieldName: 'svPdNm', header: t('MSG_TXT_PD_FEE_LV1'), width: '220' },
    // LV.2(약정주기)
    { fieldName: 'stplPrdCd', header: t('MSG_TXT_PD_COM_PERI_LV2'), width: '120', styleName: 'text-center', options: codes.STPL_PRD_CD },
    // 일시불할인구분
    { fieldName: 'spayDscDvCd', header: t('MSG_TXT_PD_DC_CLASS'), width: '100', styleName: 'text-center', options: codes.SPAY_DSC_DV_CD },
    // 최종가격
    { fieldName: 'fnlVal', header: t('MSG_TXT_PD_FNL_PRC'), width: '100', styleName: 'text-right', numberFormat: '#,##0.##', dataType: 'number' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.filteringOptions.enabled = false;

  initGridRows();
}
</script>
<style scoped></style>
