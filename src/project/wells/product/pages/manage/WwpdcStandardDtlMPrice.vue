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
    <span class="kw-fc---black3 text-weight-regular">(단위 : 원)</span>
  </kw-action-top>
  <kw-grid
    ref="grdMainRef"
    :visible-rows="10"
    @init="initGrid"
  />
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType } from 'kw-lib';
import pdConst from '~sms-common/product/constants/pdConst';

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

const currentPdCd = ref();
const currentInitData = ref(null);
const usedChannelCds = ref([]);

const searchParams = ref({
  pdTpCd: pdConst.PD_TP_CD_STANDARD,
  pdCd: '',
  avlChnlId: '',
});

// async function initGridRows(channelId) {
//   if (await currentInitData.value[prcfd]) {
//     const view = grdMainRef.value?.getView();
//     if (view) {
//       if (channelId) {
//         const rows = cloneDeep(currentInitData.value[prcfd]?.filter((item) => item.sellChnlCd === channelId));
//         view.getDataSource().setRows(rows);
//       } else {
//         const rows = cloneDeep(currentInitData.value[prcfd]);
//         view.getDataSource().setRows(rows);
//       }
//       view.resetCurrent();
//     }
//   }
// }

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
    usedChannelCds.value = props.codes?.SELL_CHNL_DV_CD.filter((item) => channels.indexOf(item.codeId) > -1);
  }
  // await initGridRows();
}

async function fetchData() {
  const res = await dataService.get('/sms/common/product/prices', { params: searchParams.value });
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function onClickSearch() {
  searchParams.value.pdCd = currentPdCd.value;
  await fetchData();
}

async function initProps() {
  const { pdCd } = props;
  currentPdCd.value = pdCd;
  searchParams.value.pdCd = currentPdCd.value;
  await resetInitData();
}

await initProps();

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
async function initGrid(data, view) {
  const columns = [
    // 판매채널
    { fieldName: 'avlChnlId', header: t('MSG_TXT_SEL_CHNL'), width: '178', options: props.codes?.SELL_CHNL_DV_CD },
    // 기준가 적용기간
    { fieldName: 'stdAppDurtion', header: t('MSG_TXT_STD_APP_PERI'), width: '227', styleName: 'text-center' },
    // 기준가코드
    { fieldName: 'pdCd', header: t('MSG_TXT_STD_PRC_CODE'), width: '120' },
    // 판매유형
    { fieldName: 'sellTpCd', header: t('MSG_TXT_SEL_TYPE'), width: '120', styleName: 'text-right ' },
    // 할인유형
    { fieldName: 'discountTpCd', header: t('MSG_TXT_DISC_CODE'), width: '120', styleName: 'text-right' },
    // 학년구분
    { fieldName: 'classTpCd', header: t('MSG_TXT_CLASS_TYPE'), width: '120', styleName: 'text-right' },
    // 기준가
    { fieldName: 'ccamBasePrc', header: t('MSG_TXT_STD_PRICE'), width: '120', styleName: 'text-right' },
    // 판매가
    { fieldName: 'fnlVal', header: t('MSG_TXT_SLE_PRC'), width: '120', styleName: 'text-right' },
    // 일시불가
    { fieldName: 'spayPrc', header: t('MSG_TXT_PD_SUMP_PRC'), width: '120', styleName: 'text-right' },
    // 위약금률
    { fieldName: 'penaltyRate', header: t('MSG_TXT_PENALTY_RTE'), width: '120', styleName: 'text-right' },
    // 사간거래가
    { fieldName: 'btcomTrdPrc', header: t('MSG_TXT_PD_EC_COM_TR_PRC'), width: '120', styleName: 'text-right' },
    // 약정기간
    { fieldName: 'contractPeriod', header: t('MSG_TXT_CONTRACT_PERI'), width: '61', styleName: 'text-right' },
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
}

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.initData, (val) => { currentInitData.value = val; resetInitData(); }, { deep: true });
</script>
