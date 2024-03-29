<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaSelfFilterShippingMgtM - 자가필터 배송관리
3. 작성자 : yeonghwa.cheon
4. 작성일 : 2023.07.04
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 자가필터를 월단위로 배송센터에 요청한다.
****************************************************************************************************
--->
<template>
  <kw-page>
    <template #header>
      <kw-page-header />
    </template>

    <kw-search
      :modified-targets="['grdMain']"
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 배송창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_DELV_WARE')"
        >
          <kw-select
            v-model="searchParams.delvWareNo"
            :options="delvWares"
            option-value="delvWareNo"
            option-label="delvWareNm"
            disable
          />
        </kw-search-item>
        <!-- 배정년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_ASN_YM')"
        >
          <kw-date-picker
            v-model="searchParams.asnYm"
            type="month"
            @change:model-value="onChangeAsnYm"
          />
        </kw-search-item>
        <!-- 품목명 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_NM')"
        >
          <kw-select
            v-model="searchParams.pdCd"
            :options="products"
            option-label="pdNm"
            option-value="pdCd"
          />
        </kw-search-item>
        <!-- 처리구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_PROCS_DV')"
        >
          <kw-select
            v-model="searchParams.procsDvCd"
            :options="snConst.PROCS_DV_CODES"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <!-- 조회제한건수 -->
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SEL_LIMIT_CNT')"
        >
          <kw-input
            v-model="searchParams.rownum"
            :disable="searchParams.procsDvCd === ''"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_EA') }}</span>
        </template>

        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />

        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          dense
          primary
          :label="$t('MSG_BTN_CONF')"
          @click="onClickConfirm"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import {
  defineGrid,
  getComponentType,
  useDataService,
  // useMeta,
  gridUtil,
  useGlobal,
} from 'kw-lib';
import snConst from '~sms-wells/service/constants/snConst';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const now = dayjs();
const router = useRouter();
const grdMainRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();
const { notify } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const totalCount = ref(0);
let cachedParams;

const searchParams = ref({
  delvWareNo: '100002', // 파주물류센터
  asnYm: now.format('YYYYMM'), // 배정년월
  pdCd: '',
  procsDvCd: '', // 처리구분
  sppDvCd: 'A1', // 자가필터 배송구분코드
  rownum: '',
  sppThmYn: '', // 배송0차월여부
});
const delvWares = [{ delvWareNo: '100002', delvWareNm: '파주물류센터' }];
const products = ref([]);
products.value = (await dataService.get('/sms/wells/service/shipping-management/products', { params: searchParams.value })).data;
searchParams.value.pdCd = products.value[0].pdCd;
const pdGroupCd = ref();

async function onChangeAsnYm() {
  products.value = (await dataService.get('/sms/wells/service/shipping-management/products', { params: searchParams.value })).data;
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/shipping-management', { params: { ...cachedParams } });
  totalCount.value = res.data.length;
  pdGroupCd.value = products.value.filter((v) => v.pdCd === cachedParams.pdCd)[0].pdGroupCd;
  const list = res.data;
  list.forEach((element) => {
    element.pdGroupCd = pdGroupCd.value;
  });
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.clearCurrent();
}

async function onClickSearch() {
  searchParams.value.sppThmYn = (products.value.filter((v) => v.pdCd === searchParams.value.pdCd))[0].sppThmYn;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    checkBar: 'hidden',
  });
}

async function onClickConfirm() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);
  debugger;
  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  await dataService.post('/sms/wells/service/shipping-management', chkRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: ' asnOjYm' }, // 배정년월
    { fieldName: ' cntrNo' }, // 계약번호
    { fieldName: ' cntrSn' }, // 계약일련번호
    { fieldName: ' cstSvAsnNo' }, // 고객서비스배정번호
    { fieldName: ' cstKnm' }, // 고객명
    { fieldName: ' zip' }, // 배송우편번호
    { fieldName: ' sppAkSpfDt' }, // 특정일자배송
    { fieldName: ' partCd01' },
    { fieldName: ' partNm01' },
    { fieldName: ' partQty01' },
    { fieldName: ' partCd02' },
    { fieldName: ' partNm02' },
    { fieldName: ' partQty02' },
    { fieldName: ' partCd03' },
    { fieldName: ' partNm03' },
    { fieldName: ' partQty03' },
    { fieldName: ' partCd04' },
    { fieldName: ' partNm04' },
    { fieldName: ' partQty04' },
    { fieldName: ' partCd05' },
    { fieldName: ' partNm05' },
    { fieldName: ' partQty05' },
    { fieldName: ' partCd06' },
    { fieldName: ' partNm06' },
    { fieldName: ' partQty06' },
    { fieldName: ' partCd07' },
    { fieldName: ' partNm07' },
    { fieldName: ' partQty07' },
    { fieldName: ' partCd08' },
    { fieldName: ' partNm08' },
    { fieldName: ' partQty08' },
    { fieldName: ' partCd09' },
    { fieldName: ' partNm09' },
    { fieldName: ' partQty09' },
    { fieldName: ' partCd10' },
    { fieldName: ' partNm10' },
    { fieldName: ' partQty10' },
    { fieldName: ' istDt' }, // 설치일자
    { fieldName: ' reqdDt' }, // 철거일자
    { fieldName: ' cpsDt' }, // 보상일자 (취소일자?)
    { fieldName: ' thReqdDt' },
    { fieldName: ' sellTpCd' }, // 판매코드
    { fieldName: ' sellTpNm' }, // 판매유형
    { fieldName: ' istNmnN' }, // 설치차월
    { fieldName: ' vstNmnN' }, // 방문차월
    { fieldName: ' pdctPdCd' }, // 기준상품코드
    { fieldName: ' basePdCd' },
    { fieldName: ' pdNm' }, // 상품명
    { fieldName: ' svBizDclsfCd' }, // 작업구분코드
    { fieldName: ' svBizDclsfNm' }, // 작업구분명
    { fieldName: ' vstDuedt' }, // 방문예정일자
    { fieldName: ' pVstPrgsStatCd' },
    { fieldName: ' pVstPrgsStatNm' },
    { fieldName: ' vstPrgsStatCd' },
    { fieldName: ' vstPrgsStatNm' }, // 방문진행상태명
    { fieldName: ' wkExcnDt' }, // 작업수행일자(작업완료일자)
    { fieldName: ' asLctCd' }, // AS위치코드
    { fieldName: ' asLctNm' }, // AS위치명
    { fieldName: ' asPhnCd' }, // AS현상코드
    { fieldName: ' asPhnNm' }, // AS현상명
    { fieldName: ' asCausCd' }, // AS원인코드
    { fieldName: ' asCausNm' }, // AS원인명
    { fieldName: ' wareNo' }, // 배송창고(창고번호)
    { fieldName: ' wareIchrNo' }, // 배송창고(번호)
    { fieldName: ' wareMngtPrtnrno' }, // 배송창고(파트너번호)
    { fieldName: ' vstOjLocaraCd' }, // 방문대상지역코드
    { fieldName: ' vstOjLocaraNm' }, // 방문대상지역명
    { fieldName: ' locaraTno' },
    { fieldName: ' exnoEncr' },
    { fieldName: ' idvTno' },
    { fieldName: ' tno' },
    { fieldName: ' cralLocaraTno' },
    { fieldName: ' mexnoEncr' },
    { fieldName: ' cralIdvTno' },
    { fieldName: ' mpno' },
    { fieldName: ' basAdr' }, // 배송기본주소
    { fieldName: ' dtlAdr' }, // 상세주소
    { fieldName: ' cnfmPsicPrtnrNo' },
    { fieldName: ' siteAwPdGrpCd' },
    { fieldName: ' partCntTotal' },
    { fieldName: ' partSumTotal' },
    { fieldName: ' frisuRcvryTpCd' },
    { fieldName: ' bzrno' },
    { fieldName: ' bfsvcBzsDvCd' },
    { fieldName: ' sppDvCd' },
    { fieldName: ' sppPdCd' },
    { fieldName: ' procsDvCd' },
    { fieldName: ' sppPdNm' },
    { fieldName: ' partNmQty01' },
    { fieldName: ' partNmQty02' },
    { fieldName: ' partNmQty03' },
    { fieldName: ' partNmQty04' },
    { fieldName: ' partNmQty05' },
    { fieldName: ' partNmQty06' },
    { fieldName: ' partNmQty07' },
    { fieldName: ' partNmQty08' },
    { fieldName: ' partNmQty09' },
    { fieldName: ' partNmQty10' },
    { fieldName: 'sppThmYn' },
    { fieldName: 'cstNo' },
    { fieldName: 'pdGroupCd' },
  ];

  const columns = [
    {
      fieldName: 'asnOjYm',
      header: t('MSG_TXT_ASN_YM'),
      width: '130',
      styleName: 'text-center',
    },
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center rg-button-link',
      renderer: {
        type: 'button',
      },
      displayCallback: (g, i) => {
        const { cntrNo, cntrSn } = gridUtil.getRowValue(g, i.dataRow);
        return `${cntrNo}-${cntrSn}`;
      },
    },
    {
      fieldName: 'cstKnm',
      header: t('MSG_TXT_CST_NM'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'sppAkSpfDt',
      header: t('MSG_TXT_SPF_DT_SPP'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'partCd01',
      header: t('MSG_TXT_ITM_CD'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'partNm01',
      header: t('MSG_TXT_ITM_NM'),
      width: '200',
      styleName: 'text-center',
    },
    {
      fieldName: 'partQty01',
      header: `${t('MSG_TXT_QTY')}(EA)`,
      width: '80',
      styleName: 'text-right',
    },
    {
      fieldName: 'partCd02',
      header: t('MSG_TXT_ITM_CD'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'partNm02',
      header: t('MSG_TXT_ITM_NM'),
      width: '200',
      styleName: 'text-center',
    },
    {
      fieldName: 'partQty02',
      header: `${t('MSG_TXT_QTY')}(EA)`,
      width: '80',
      styleName: 'text-right',
    },
    {
      fieldName: 'partCd03',
      header: t('MSG_TXT_ITM_CD'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'partNm03',
      header: t('MSG_TXT_ITM_NM'),
      width: '200',
      styleName: 'text-center',
    },
    {
      fieldName: 'partQty03',
      header: `${t('MSG_TXT_QTY')}(EA)`,
      width: '80',
      styleName: 'text-right',
    },
    {
      fieldName: 'partCd04',
      header: t('MSG_TXT_ITM_CD'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'partNm04',
      header: t('MSG_TXT_ITM_NM'),
      width: '200',
      styleName: 'text-center',
    },
    {
      fieldName: 'partQty04',
      header: `${t('MSG_TXT_QTY')}(EA)`,
      width: '80',
      styleName: 'text-right',
    },
    {
      fieldName: 'partCd05',
      header: t('MSG_TXT_ITM_CD'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'partNm05',
      header: t('MSG_TXT_ITM_NM'),
      width: '200',
      styleName: 'text-center',
    },
    {
      fieldName: 'partQty05',
      header: `${t('MSG_TXT_QTY')}(EA)`,
      width: '80',
      styleName: 'text-right',
    },
    {
      fieldName: 'partCd06',
      header: t('MSG_TXT_ITM_CD'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'partNm06',
      header: t('MSG_TXT_ITM_NM'),
      width: '200',
      styleName: 'text-center',
    },
    {
      fieldName: 'partQty06',
      header: `${t('MSG_TXT_QTY')}(EA)`,
      width: '80',
      styleName: 'text-right',
    },
    {
      fieldName: 'partCd07',
      header: t('MSG_TXT_ITM_CD'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'partNm07',
      header: t('MSG_TXT_ITM_NM'),
      width: '200',
      styleName: 'text-center',
    },
    {
      fieldName: 'partQty07',
      header: `${t('MSG_TXT_QTY')}(EA)`,
      width: '80',
      styleName: 'text-right',
    },
    {
      fieldName: 'partCd08',
      header: t('MSG_TXT_ITM_CD'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'partNm08',
      header: t('MSG_TXT_ITM_NM'),
      width: '200',
      styleName: 'text-center',
    },
    {
      fieldName: 'partQty08',
      header: `${t('MSG_TXT_QTY')}(EA)`,
      width: '80',
      styleName: 'text-right',
    },
    {
      fieldName: 'partCd09',
      header: t('MSG_TXT_ITM_CD'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'partNm09',
      header: t('MSG_TXT_ITM_NM'),
      width: '200',
      styleName: 'text-center',
    },
    {
      fieldName: 'partQty09',
      header: `${t('MSG_TXT_QTY')}(EA)`,
      width: '80',
      styleName: 'text-right',
    },
    {
      fieldName: 'partCd10',
      header: t('MSG_TXT_ITM_CD'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'partNm10',
      header: t('MSG_TXT_ITM_NM'),
      width: '200',
      styleName: 'text-center',
    },
    {
      fieldName: 'partQty10',
      header: `${t('MSG_TXT_QTY')}(EA)`,
      width: '80',
      styleName: 'text-right',
    },
    {
      fieldName: 'istDt',
      header: t('MSG_TXT_IST_DT'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'reqdDt',
      header: t('MSG_TXT_DEM_DT'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'cpsDt',
      header: t('MSG_TXT_CANC_DT'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'sellTpCd',
      header: t('MSG_TXT_SELL_CD'),
      width: '50',
      styleName: 'text-center',
    },
    {
      fieldName: 'sellTpNm',
      header: t('MSG_TXT_SEL_TYPE'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'istNmnN',
      header: t('MSG_TXT_INST_OVER'),
      width: '80',
      styleName: 'text-center',
    },
    {
      fieldName: 'vstNmnN',
      header: t('MSG_TXT_VST_NMN'),
      width: '80',
      styleName: 'text-center',
    },
    {
      fieldName: 'pdctPdCd',
      header: t('MSG_TXT_PRDT_CODE'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'pdNm',
      header: t('MSG_TXT_PRDT_NM'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'svBizDclsfCd',
      header: t('MSG_TXT_CODE'),
      width: '80',
      styleName: 'text-center',
    },
    {
      fieldName: 'svBizDclsfNm',
      header: t('MSG_TXT_NAME'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'vstDuedt',
      header: t('MSG_TXT_SCHD_DT'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'vstPrgsStatNm',
      header: t('MSG_TXT_WK_RS'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'wkExcnDt',
      header: t('MSG_TXT_FSH_DT'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'asLctCd',
      header: t('MSG_TXT_CODE'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'asLctNm',
      header: t('MSG_TXT_LCT'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'asPhnCd',
      header: t('MSG_TXT_CODE'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'asPhnNm',
      header: t('MSG_TXT_PHN'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'asCausCd',
      header: t('MSG_TXT_CODE'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'asCausNm',
      header: t('MSG_TXT_CAUS'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'wareNo',
      header: t('MSG_TXT_WARE_NO'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'wareIchrNo',
      header: t('MSG_TXT_PRTNR_NO'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'wareMngtPrtnrno',
      header: t('MSG_TXT_EPNO'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'cstSvAsnNo',
      header: t('MSG_TXT_ASGN_NO'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'zip',
      header: t('MSG_TXT_ZIP'),
      width: '80',
      styleName: 'text-center',
    },
    {
      fieldName: 'vstOjLocaraCd',
      header: t('MSG_TXT_LOCARA_CD'),
      width: '80',
      styleName: 'text-center',
    },
    {
      fieldName: 'vstOjLocaraNm',
      header: t('MSG_TXT_LOCARA'),
      width: '80',
      styleName: 'text-center',
    },
    {
      fieldName: 'mpno',
      header: t('MSG_TXT_CP'),
      width: '200',
      styleName: 'text-center',
    },
    {
      fieldName: 'tno',
      header: t('MSG_TXT_TEL_NO'),
      width: '200',
      styleName: 'text-center',
    },
    {
      fieldName: 'basAdr',
      header: t('MSG_TXT_ADDR'),
      width: '150',
      styleName: 'text-center',
    },
    {
      fieldName: 'dtlAdr',
      header: t('MSG_TXT_ADDR_DTL'),
      width: '150',
      styleName: 'text-center',
    },
  ];

  const columnLayout = [
    'asnOjYm',
    'cntrNo',
    'cstKnm',
    'sppAkSpfDt',
    {
      direction: 'horizontal',
      items: [
        'partCd01',
        'partNm01',
        'partQty01',
      ],
      header: {
        text: `${t('MSG_TXT_MATI_INFO')}1`,
      },
    },
    {
      direction: 'horizontal',
      items: [
        'partCd02',
        'partNm02',
        'partQty02',
      ],
      header: {
        text: `${t('MSG_TXT_MATI_INFO')}2`,
      },
    },
    {
      direction: 'horizontal',
      items: [
        'partCd03',
        'partNm03',
        'partQty03',
      ],
      header: {
        text: `${t('MSG_TXT_MATI_INFO')}3`,
      },
    },
    {
      direction: 'horizontal',
      items: [
        'partCd04',
        'partNm04',
        'partQty04',
      ],
      header: {
        text: `${t('MSG_TXT_MATI_INFO')}4`,
      },
    },
    {
      direction: 'horizontal',
      items: [
        'partCd05',
        'partNm05',
        'partQty05',
      ],
      header: {
        text: `${t('MSG_TXT_MATI_INFO')}5`,
      },
    },
    {
      direction: 'horizontal',
      items: [
        'partCd06',
        'partNm06',
        'partQty06',
      ],
      header: {
        text: `${t('MSG_TXT_MATI_INFO')}6`,
      },
    },
    {
      direction: 'horizontal',
      items: [
        'partCd07',
        'partNm07',
        'partQty07',
      ],
      header: {
        text: `${t('MSG_TXT_MATI_INFO')}7`,
      },
    },
    {
      direction: 'horizontal',
      items: [
        'partCd08',
        'partNm08',
        'partQty08',
      ],
      header: {
        text: `${t('MSG_TXT_MATI_INFO')}8`,
      },
    },
    {
      direction: 'horizontal',
      items: [
        'partCd09',
        'partNm09',
        'partQty09',
      ],
      header: {
        text: `${t('MSG_TXT_MATI_INFO')}9`,
      },
    },
    {
      direction: 'horizontal',
      items: [
        'partCd10',
        'partNm10',
        'partQty10',
      ],
      header: {
        text: `${t('MSG_TXT_MATI_INFO')}10`,
      },
    },
    'istDt',
    'reqdDt',
    'cpsDt',
    'sellTpCd',
    'sellTpNm',
    'istNmnN',
    'vstNmnN',
    {
      direction: 'horizontal',
      items: [
        'pdctPdCd',
        'pdNm',
      ],
      header: {
        text: t('MSG_TXT_PRDT_NM'),
      },
    },
    {
      direction: 'horizontal',
      hiddenChildHeaders: true,
      items: [
        'svBizDclsfCd',
        'svBizDclsfNm',
      ],
      header: {
        text: t('MSG_TXT_WK_CLS'),
      },
    },
    'vstDuedt',
    'vstPrgsStatNm',
    'wkExcnDt',
    {
      direction: 'horizontal',
      items: [
        'asLctCd',
        'asLctNm',
      ],
      header: {
        text: t('MSG_TXT_LCT'),
      },
    },
    {
      direction: 'horizontal',
      items: [
        'asPhnCd',
        'asPhnNm',
      ],
      header: {
        text: t('MSG_TXT_PHN'),
      },
    },
    {
      direction: 'horizontal',
      items: [
        'asCausCd',
        'asCausNm',
      ],
      header: {
        text: t('MSG_TXT_CAUS'),
      },
    },
    {
      direction: 'horizontal',
      items: [
        'wareNo',
        'wareIchrNo',
        'wareMngtPrtnrno',
      ],
      header: {
        text: t('MSG_TXT_DELV_WARE'),
      },
    },
    'cstSvAsnNo',
    'zip',
    'vstOjLocaraCd',
    'vstOjLocaraNm',
    'mpno',
    'tno',
    'basAdr',
    'dtlAdr',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (grid, { column, itemIndex }) => {
    if (column === 'cntrNo') {
      const cntrNo = grid.getValue(itemIndex, 'cntrNo');
      const cntrSn = grid.getValue(itemIndex, 'cntrSn');

      router.push({
        path: '/service/wwsnb-individual-service-list',
        query: {
          cntrNo,
          cntrSn,
        },
      });
    }
  };
});

</script>

<style scoped>
</style>
