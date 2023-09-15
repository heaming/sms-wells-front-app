<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaWareItemReceivingAndPayingStateM - 창고 품목별 수불 현황(K-W-SV-U-0114M01)
3. 작성자 : leeminwoo
4. 작성일 : 2023-08-21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 창고 품목별 수불 현황 http://localhost:3000/#/service/ware-item-receiving-and-paying-state
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="9"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_LOOKUP_PERIOD')"
          :colspan="3"
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
            rules="date_range_required"
          />
        </kw-search-item>
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.startDt"
          v-model:end-ym="searchParams.endDt"
          v-model:options-ware-dv-cd="wareDvCd"
          v-model:ware-dv-cd="searchParams.wareDvCd"
          v-model:ware-no-m="searchParams.wareNoM"
          v-model:ware-no-d="searchParams.wareNoD"
          first-option="all"
          :label1="$t('MSG_TXT_WARE')"
          :label2="$t('MSG_TXT_WARE_DV')"
          :label3="$t('MSG_TXT_HGR_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          sub-first-option="all"
          :colspan="4"
          @update:ware-dv-cd="onChangeStdWareDvCd"
          @update:ware-no-m="onChagneHgrWareNo"
        />
        <!-- 창고상세구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_WARE_DTL_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.wareDtlDvCd"
            :options="filterCodes.wareDtlDvCd"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_GD')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmGdCd"
            :options="tempOptions.itmGdCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_USE_YN')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.useYn"
            :options="tempOptions.useYn"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_GRP')"
          :colspan="5"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            class="w230"
            @change="onChangeItmKndCd"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :label="$t('MSG_TXT_ITM_GRP')"
            :options="productCodes"
            rules="required"
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
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :total-count="totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { getComponentType, defineGrid, gridUtil, useDataService, useGlobal, codeUtil } from 'kw-lib';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const { notify } = useGlobal();
const { t } = useI18n();
const { currentRoute } = useRouter();
const now = dayjs();
console.log(now);
console.log(notify);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/ware-item-receiving-and-paying-state';

const codes = await codeUtil.getMultiCodes(
  'WARE_DV_CD',
  'WARE_DTL_DV_CD',
  'ITM_KND_CD',
);

const tempOptions = {
  itmGdCd: [
    { codeId: 'A', codeName: t('MSG_TXT_A_GD') }, // A급
    { codeId: 'B', codeName: t('MSG_TXT_B_GD') }, // B급
    { codeId: 'E', codeName: t('MSG_TXT_EGD') }, // E급
    { codeId: 'R', codeName: t('MSG_TXT_RGD') }, // R급
    { codeId: 'X', codeName: t('MSG_TXT_XGD') }, // X급
  ],
  useYn: [
    { codeId: 'Y', codeName: t('MSG_TXT_USE') }, // 사용
    { codeId: 'N', codeName: t('MSG_TXT_NUSD') }, // 미사용
  ],
};

const wareDvCd = {
  WARE_DV_CD: [
    { codeId: '1', codeName: t('MSG_TXT_LGST_CNR') },
    { codeId: '2', codeName: t('MSG_TXT_SV_CNR') },
    { codeId: '3', codeName: t('MSG_TXT_BSNS_CNTR') },
  ],
};

const filterCodes = ref({
  wareDtlDvCd: [],
});

const searchParams = ref({
  startDt: '',
  endDt: '',
  wareDvCd: '',
  wareNoM: '',
  wareNoD: '',
  wareDtlDvCd: '',
  itmGdCd: '', // 등급
  useYn: '', // 사용여부
  itmKndCd: '', // 품목구분
  pdCd: '',
});

// 창고구분 변경 시, 창고상세구분 세팅
const onChangeWareDvCd = async () => {
  const filterWareDvCd = searchParams.value.wareDvCd;

  if (filterWareDvCd === '1') { // 물류센터
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['10'].includes(v.codeId));
  } else if (filterWareDvCd === '2') { // 서비스센터
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['20', '21'].includes(v.codeId));
  } else {
    filterCodes.value.wareDtlDvCd = codes.WARE_DTL_DV_CD.filter((v) => ['30', '31', '32'].includes(v.codeId));
  }
};

function onChangeStdWareDvCd() {
  searchParams.value.wareNoM = '';
  searchParams.value.wareNoD = '';
}

function onChagneHgrWareNo() {
  searchParams.value.wareNoD = '';
}

watch(() => searchParams.value.wareDvCd, (val) => {
  if (searchParams.value.wareDvCd !== val) {
    searchParams.value.wareDvCd = val;
  }
  onChangeWareDvCd();
});

let cachedParams;
const totalCount = ref(0);

async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const list = res.data;
  totalCount.value = list.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
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
  // 품목구분 : 상품 기본설정(4)
  searchParams.value.startDt = dayjs().format('YYYYMMDD');
  searchParams.value.endDt = dayjs().format('YYYYMMDD');
  searchParams.value.itmKndCd = '4';
  searchParams.value.itmGdCd = 'A';
  await onChangeWareDvCd();
  await onChangeItmKndCd();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'wareNm' },
    { fieldName: 'btdQty', dataType: 'number' },
    { fieldName: 'prchsStrQty', dataType: 'number' },
    { fieldName: 'nomStrQty', dataType: 'number' },
    { fieldName: 'qomAsnStrQty', dataType: 'number' },
    { fieldName: 'qomMmtStrQty', dataType: 'number' },
    { fieldName: 'rtngdInsiStrQty', dataType: 'number' },
    { fieldName: 'wkRtngdStrQty', dataType: 'number' },
    { fieldName: 'etcStrQty', dataType: 'number' },
    { fieldName: 'ctrStrQty', dataType: 'number' },
    { fieldName: 'stocAcinspStrQty', dataType: 'number' },
    { fieldName: 'nomOstrQty', dataType: 'number' },
    { fieldName: 'qomAsnOstrQty', dataType: 'number' },
    { fieldName: 'qomMmtOstrQty', dataType: 'number' },
    { fieldName: 'rtngdInsiOstrQty', dataType: 'number' },
    { fieldName: 'rtngdOtsdOstrQty', dataType: 'number' },
    { fieldName: 'wkOstrQty', dataType: 'number' },
    { fieldName: 'm12WthnWkOstrQty', dataType: 'number' },
    { fieldName: 'm12AfWkOstrQty', dataType: 'number' },
    { fieldName: 'refrOstrQty', dataType: 'number' },
    { fieldName: 'sellOstrQty', dataType: 'number' },
    { fieldName: 'dsuOstrQty', dataType: 'number' },
    { fieldName: 'etcOstrQty', dataType: 'number' },
    { fieldName: 'ctrOstrQty', dataType: 'number' },
    { fieldName: 'cnfmPitmOstrGapQty', dataType: 'number' },
    { fieldName: 'eotQty', dataType: 'number' },
    { fieldName: 'mmtStocOstrQty', dataType: 'number' },
    { fieldName: 'subsumGroupkey' },
  ];

  const columns = [
    { fieldName: 'subsumGroupkey',
      header: t('그룹키'),
      width: '180',
      visible: false,
    }, // 그룹키
    { fieldName: 'wareNm',
      header: t('MSG_TXT_WARE_NM'),
      width: '180',
    }, // 창고명
    { fieldName: 'btdQty',
      header: t('MSG_TXT_BTD_STOC_QTY'),
      width: '90',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 기초재고수량
    { fieldName: 'prchsStrQty',
      header: t('MSG_TXT_PRCHS'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 구매
    { fieldName: 'nomStrQty',
      header: t('MSG_TXT_NOM'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 정상
    { fieldName: 'qomAsnStrQty',
      header: t('MSG_TXT_QOM_ASN'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 물량배정
    { fieldName: 'qomMmtStrQty',
      header: t('MSG_TXT_QOM_MMT'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 물량이동
    { fieldName: 'rtngdInsiStrQty',
      header: t('MSG_TXT_INSI'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 내부
    { fieldName: 'wkRtngdStrQty',
      header: t('MSG_TXT_OTSD'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 외부
    { fieldName: 'etcStrQty',
      header: t('MSG_TXT_ETC'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 기타
    { fieldName: 'ctrStrQty',
      header: t('MSG_TXT_GD_CTR'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 등급조정
    { fieldName: 'stocAcinspStrQty',
      header: t('MSG_TXT_STOC_ACINSP'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 재고실사
    { fieldName: 'nomOstrQty',
      header: t('MSG_TXT_NOM'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 정상
    { fieldName: 'qomAsnOstrQty',
      header: t('MSG_TXT_QOM_ASN'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 물량배정
    { fieldName: 'qomMmtOstrQty',
      header: t('MSG_TXT_QOM_MMT'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 물량이동
    { fieldName: 'rtngdInsiOstrQty',
      header: t('MSG_TXT_INSI'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 내부
    { fieldName: 'rtngdOtsdOstrQty',
      header: t('MSG_TXT_OTSD'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 외부
    { fieldName: 'wkOstrQty',
      header: t('MSG_TXT_OSTR_WK'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 작업
    { fieldName: 'm12WthnWkOstrQty',
      header: t('MSG_TXT_Y1_WTHN'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 1년내
    { fieldName: 'm12AfWkOstrQty',
      header: t('MSG_TXT_Y1_AF'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 1년후
    { fieldName: 'refrOstrQty',
      header: t('MSG_TXT_REFR'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 리퍼
    { fieldName: 'sellOstrQty',
      header: t('MSG_TXT_SELL'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 판매
    { fieldName: 'dsuOstrQty',
      header: t('MSG_TXT_DSCD'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 폐기
    { fieldName: 'etcOstrQty',
      header: t('MSG_TXT_ETC'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 기타
    { fieldName: 'ctrOstrQty',
      header: t('MSG_TXT_GD_CTR'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 등급조정
    { fieldName: 'cnfmPitmOstrGapQty',
      header: t('MSG_TXT_STOC_ACINSP'),
      width: '70',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 재고실사
    { fieldName: 'eotQty',
      header: '기말재고수량',
      width: '90',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 기말재고수량
    { fieldName: 'mmtStocOstrQty',
      header: '이동재고수량',
      width: '90',
      type: 'number',
      styleName: 'text-right',
      numberFormat: '#,##0',
      footer: {
        numberFormat: '#,##0',
        expression: 'sum',
      },
      groupFooter: {
        numberFormat: '#,##0',
        expression: 'sum',
      } }, // 이동재고수량
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout([
    'subsumGroupkey',
    'wareNm',
    'btdQty',
    {
      header: t('MSG_TXT_STR_QTY'), // 입고수량
      direction: 'horizontal', // merge type
      items: [
        'prchsStrQty',
        'nomStrQty',
        'qomAsnStrQty',
        'qomMmtStrQty',
        {
          header: t('MSG_TXT_RTNGD'), // 반품
          direction: 'horizontal', // merge type
          items: ['rtngdInsiStrQty', 'wkRtngdStrQty'],
        },
        'etcStrQty',
        'ctrStrQty',
        'stocAcinspStrQty',
      ],
    },
    {
      header: t('MSG_TXT_STR_QTY'), // 출고수량
      direction: 'horizontal', // merge type
      items: [
        'nomOstrQty',
        'qomAsnOstrQty',
        'qomMmtOstrQty',
        {
          header: t('MSG_TXT_RTNGD'), // 반품
          direction: 'horizontal', // merge type
          items: ['rtngdInsiOstrQty', 'rtngdOtsdOstrQty'],
        },
        'wkOstrQty',
        {
          header: t('MSG_TXT_IST_D_BASE'), // 설치일기준
          direction: 'horizontal', // merge type
          items: ['m12WthnWkOstrQty', 'm12AfWkOstrQty'],
        },
        'refrOstrQty',
        'sellOstrQty',
        'dsuOstrQty',
        'etcOstrQty',
        'ctrOstrQty',
        'cnfmPitmOstrGapQty', // 재고실사(출고수량 끝)
      ],
    },
    'eotQty',
    'mmtStocOstrQty',
  ]);

  view.setFooters({ visible: true, items: [{ height: 30 }] });
  view.columnByName('wareNm').setFooters({ text: t('MSG_TXT_SUM'), styleName: 'text-left text-weight-bold' });

  view.groupBy(['subsumGroupkey']);
  view.setRowGroup({ mergeMode: false });
  view.layoutByColumn('wareNm').groupFooterUserSpans = [{ colspan: 1 }];
  view.columnByName('wareNm').setGroupFooters({ text: t('MSG_TXT_SBSUM'), styleName: 'text-center' });
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
