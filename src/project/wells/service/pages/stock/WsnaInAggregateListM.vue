<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : WsnaInAggregateListM(K-W-SV-U-0265M01) - 입고 집계
3. 작성자 : jaehunlee
4. 작성일 : 2023.08.07
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- 입고 집계 (http://localhost:3000/#/service/wsna-in-aggregate-list)
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_STR_TP')"
        >
          <kw-select
            v-model="searchParams.strTpCd"
            :options="codes.STR_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
        >
          <kw-input
            v-model="searchParams.pdCdFrom"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.pdCdTo"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SAPCD')"
        >
          <kw-input
            v-model="searchParams.sapCdFrom"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.sapCdTo"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_STR_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.baseDateFrom"
            v-model:to="searchParams.baseDateTo"
            rules="date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            class="w166"
            @change="onChangeItmKndCd"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="productCodes"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_GD')"
        >
          <kw-select
            v-model="searchParams.pdGdCd"
            :options="codes.PD_GD_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_USE_SEL')"
        >
          <kw-select
            v-model="searchParams.useYn"
            :options="codes.COD_YN"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
        </template>
        <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
          @click="onClickPrintEl"
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, getComponentType, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import { printElement } from '~common/utils/common';

const dataService = useDataService();
const now = dayjs();
const { t } = useI18n();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;

const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'STR_TP_CD',
  'ITM_KND_CD',
  'PD_GD_CD',
  'COD_YN',
  'MAT_LGST_TP_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  strTpCd: '',
  pdCdFrom: '',
  pdCdTo: '',
  sapCdFrom: '',
  sapCdTo: '',
  baseDateFrom: `${now.format('YYYYMM')}01`,
  baseDateTo: now.format('YYYYMMDD'),
  itmKndCd: '4',
  pdCd: '',
  pdGdCd: '',
  useYn: '',
});

const totalCount = ref(0);

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/in-aggregate', { params: { ...cachedParams } });
  totalCount.value = res.data.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/in-aggregate', { params: { ...cachedParams } });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

const productCodes = ref([]);

async function onChangeItmKndCd() {
  const res = await dataService.get(`/sms/wells/service/bs-consumables/${searchParams.value.itmKndCd}/product-codes`);

  productCodes.value = res.data.map((v) => ({ codeId: v.svpdPdCd, codeName: v.svpdNmKor }));
}

onMounted(async () => {
  await onChangeItmKndCd();
});

const pageRef = ref();
async function onClickPrintEl() {
  printElement(pageRef);
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrdMain(data, view) {
  const fields = [
    { fieldName: 'matMngtDvCd' },
    { fieldName: 'sapMatCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'typ100002', dataType: 'number' },
    { fieldName: 'typ100003', dataType: 'number' },
    { fieldName: 'typ100000', dataType: 'number' },
    { fieldName: 'typ200001', dataType: 'number' },
    { fieldName: 'typ200002', dataType: 'number' },
    { fieldName: 'typ200465', dataType: 'number' },
    { fieldName: 'typ200009', dataType: 'number' },
    { fieldName: 'typ200006', dataType: 'number' },
    { fieldName: 'typ200024', dataType: 'number' },
    { fieldName: 'typ200017', dataType: 'number' },
    { fieldName: 'typ200005', dataType: 'number' },
    { fieldName: 'typ200934', dataType: 'number' },
    { fieldName: 'typ200003', dataType: 'number' },
    { fieldName: 'typ200010', dataType: 'number' },
    { fieldName: 'typ200012', dataType: 'number' },
    { fieldName: 'typ200466', dataType: 'number' },
    { fieldName: 'typ200014', dataType: 'number' },
    { fieldName: 'typ200013', dataType: 'number' },
    { fieldName: 'typ200609', dataType: 'number' },
    { fieldName: 'typ200127', dataType: 'number' },
    { fieldName: 'typ200467', dataType: 'number' },
    { fieldName: 'typ200608', dataType: 'number' },
    { fieldName: 'typ200007', dataType: 'number' },
    { fieldName: 'typ200371', dataType: 'number' },
    { fieldName: 'typ200008', dataType: 'number' },
    { fieldName: 'typ200926', dataType: 'number' },
    { fieldName: 'typ200015', dataType: 'number' },
    { fieldName: 'typ200986', dataType: 'number' },
    { fieldName: 'typ299999', dataType: 'number' },
    { fieldName: 'typ200000', dataType: 'number' },
    { fieldName: 'typ300001', dataType: 'number' },
    { fieldName: 'typ300002', dataType: 'number' },
    { fieldName: 'typ300003', dataType: 'number' },
    { fieldName: 'typ300004', dataType: 'number' },
    { fieldName: 'typ300005', dataType: 'number' },
    { fieldName: 'typ300006', dataType: 'number' },
    { fieldName: 'typ300007', dataType: 'number' },
    { fieldName: 'typ300008', dataType: 'number' },
    { fieldName: 'typ300009', dataType: 'number' },
    { fieldName: 'typ300010', dataType: 'number' },
    { fieldName: 'typ300011', dataType: 'number' },
    { fieldName: 'typ300012', dataType: 'number' },
    { fieldName: 'typ300013', dataType: 'number' },
    { fieldName: 'typ300014', dataType: 'number' },
    { fieldName: 'typ300015', dataType: 'number' },
    { fieldName: 'typ300016', dataType: 'number' },
    { fieldName: 'typ300017', dataType: 'number' },
    { fieldName: 'typ300018', dataType: 'number' },
    { fieldName: 'typ300019', dataType: 'number' },
    { fieldName: 'typ300020', dataType: 'number' },
    { fieldName: 'typ300021', dataType: 'number' },
    { fieldName: 'typ300022', dataType: 'number' },
    { fieldName: 'typ300023', dataType: 'number' },
    { fieldName: 'typ300024', dataType: 'number' },
    { fieldName: 'typ300025', dataType: 'number' },
    { fieldName: 'typ300026', dataType: 'number' },
    { fieldName: 'typ300027', dataType: 'number' },
    { fieldName: 'typ300028', dataType: 'number' },
    { fieldName: 'typ300029', dataType: 'number' },
    { fieldName: 'typ399999', dataType: 'number' },
    { fieldName: 'typ300000', dataType: 'number' },
    { fieldName: 'typ999999', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'matMngtDvCd', header: t('MSG_TXT_STOC_TYPE'), width: '70', styleName: 'text-center', options: codes.MAT_LGST_TP_DV_CD },
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '200', styleName: 'text-center' },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'pdNm',
      header: t('MSG_TXT_ITM_NM'),
      width: '250',
      footer: {
        text: t('MSG_TXT_SUM'),
        styleName: 'text-left',
      } },
    { fieldName: 'typ100002',
      header: '교원파주',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ100003',
      header: 'L&C파주',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ100000',
      header: t('MSG_TXT_AGG'),
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200001',
      header: '성수',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200002',
      header: '의정부',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200465',
      header: '남양주',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200009',
      header: '원주',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200006',
      header: '수원',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200024',
      header: '안양',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200017',
      header: '광명',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200005',
      header: '인천',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200934',
      header: '강서',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200003',
      header: '일산',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200010',
      header: '청주',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200012',
      header: '대전',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200466',
      header: '천안',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200014',
      header: '전주',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200013',
      header: '광주',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200609',
      header: '순천',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200127',
      header: '서대구',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200467',
      header: '동대구',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200608',
      header: '포항',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200007',
      header: '부산',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200371',
      header: '김해',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200008',
      header: '창원',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200926',
      header: '진주',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200015',
      header: '제주',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200986',
      header: '홈케어',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ299999',
      header: '엔지니어',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ200000',
      header: t('MSG_TXT_AGG'),
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300001',
      header: '강남',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300002',
      header: '강동',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300003',
      header: '강서',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300004',
      header: '노원',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300005',
      header: '성동',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300006',
      header: '영등포',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300007',
      header: '부산동화',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300008',
      header: '부산영진',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300009',
      header: '부산영풍',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300010',
      header: '대구공문',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300011',
      header: '대구대성',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300012',
      header: '대구청구',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300013',
      header: '인천',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300014',
      header: '광주',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300015',
      header: '대전',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300016',
      header: '구리',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300017',
      header: '분당',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300018',
      header: '수원',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300019',
      header: '안산',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300020',
      header: '안양',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300021',
      header: '용인',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300022',
      header: '의정부',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300023',
      header: '일산',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300024',
      header: '김해',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300025',
      header: '진주',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300026',
      header: '창원',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300027',
      header: '포항',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300028',
      header: '전주',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300029',
      header: '당진',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ399999',
      header: 'LP',
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ300000',
      header: t('MSG_TXT_AGG'),
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
    { fieldName: 'typ999999',
      header: t('MSG_TXT_AGG'),
      width: '80',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0',
      } },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setFixedOptions({ colCount: 4 });
  view.setOptions({ summaryMode: 'aggregate' });
  view.setFooters({ visible: true });

  view.footer.visible = true;
  view.setColumnLayout([
    'matMngtDvCd', 'sapMatCd', 'pdCd', 'pdNm',
    {
      header: '물류센터', // colspan title
      direction: 'horizontal', // merge type
      items: ['typ100002', 'typ100003', 'typ100000'],
    },
    {
      header: '서비스센터',
      direction: 'horizontal',
      items: ['typ200001', 'typ200002', 'typ200465', 'typ200009', 'typ200006', 'typ200024', 'typ200017', 'typ200005', 'typ200934', 'typ200003', 'typ200010', 'typ200012', 'typ200466', 'typ200014', 'typ200013', 'typ200609', 'typ200127', 'typ200467', 'typ200608', 'typ200007', 'typ200371', 'typ200008', 'typ200926', 'typ200015', 'typ200986', 'typ299999', 'typ200000'],
    },
    {
      header: '영업센터',
      direction: 'horizontal',
      items: ['typ300001', 'typ300002', 'typ300003', 'typ300004', 'typ300005', 'typ300006', 'typ300007', 'typ300008', 'typ300009', 'typ300010', 'typ300011', 'typ300012', 'typ300013', 'typ300014', 'typ300015', 'typ300016', 'typ300017', 'typ300018', 'typ300019', 'typ300020', 'typ300021', 'typ300022', 'typ300023', 'typ300024', 'typ300025', 'typ300026', 'typ300027', 'typ300028', 'typ300029', 'typ399999', 'typ300000'],
    },
    'typ999999',
  ]);
}
</script>
