<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DEA
2. 프로그램 ID : WwdeaAllowanceDelinquentRedemptionFeeListP
3. 작성자 : jeongheum.lee
4. 작성일 : 2023.04.18 ~
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수당/연체 되물림
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--2xl"
  >
    <kw-form
      ref="frmMainRef"
    >
      <kw-search
        :cols="2"
        one-row
        @search="onClickPopSearch"
      >
        <kw-search-row>
          <kw-search-item
            label="구분"
          >
            <kw-select
              v-model="searchParams.perfDvCd"
              first-option="all"
              :options="codes.PERF_DV_CD"
            />
          </kw-search-item>

          <kw-search-item
            label="유형"
          >
            <kw-select
              v-model="searchParams.whtxRepDvCd"
              first-option="all"
              :options="codes.REDF_INQR_TP_CD"
            />
          </kw-search-item>
        </kw-search-row>
      </kw-search>
    </kw-form>

    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          @change="onClickPopSearch"
        />
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <template #default>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="pageInfo.totalCount===0"
          :label="t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </template>
    </kw-action-top>

    <kw-grid
      ref="grdPopRef"
      name="grdPop"
      :visible-rows="getVisibleRows"
      @init="initGrid"
    />

    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickCancel"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, useMeta, getComponentType, useModal, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { getConfig } = useMeta();
const frmMainRef = ref();
const grdPopRef = ref(getComponentType('KwGrid'));

const {
  cancel: onClickCancel,
} = useModal();

let pageCnt = 0;
let cachedParams;

const codes = await codeUtil.getMultiCodes(
  'REDF_INQR_TP_CD',
  'PERF_DV_CD',
);

const searchParams = ref({
  ogTpCd: '',
  prtnrNo: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const getVisibleRows = computed(() => {
  let rtnVal = pageInfo.value.pageSize;
  if (pageInfo.value.totalCount < rtnVal) {
    rtnVal = pageInfo.value.totalCount;
  }
  return rtnVal < 10 ? 10 : rtnVal;
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function fetchData() {
  const res = await dataService.get('/sms/wells/deduction/redf/allowance-delinquent-redemption-fees/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: dataList, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdPopRef.value.getView();
  const dataSource = view.getDataSource();
  dataSource.checkRowStates(false);

  if (pageCnt > 0) {
    dataSource.addRows(dataList);
  } else {
    dataSource.setRows(dataList);
  }
  dataSource.checkRowStates(true);
  pageCnt += 1;
}

async function onClickPopSearch() {
  pageCnt = 0;
  grdPopRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const res = await dataService.get('/sms/wells/deduction/redf/allowance-delinquent-redemption-fees/excel-download', { params: { ...cachedParams } });
  const view = grdPopRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: '수당/연체 되물림',
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'perfDvNm' },
    { fieldName: 'redfAdsbOcYm' },
    { fieldName: 'whtxRepDvNm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cstKnm' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'redfAdsbOcAmt', dataType: 'number' },
    { fieldName: 'perfYm' },
    { fieldName: 'pdNm' },
    { fieldName: 'envYn' },
    { fieldName: 'redfAdsbTpNm' },
    { fieldName: 'cntrCanRsonCd' },
    { fieldName: 'mchnChTpCd' },
    { fieldName: 'feeCpsnRedfYn' },
  ];

  const columns = [
    { fieldName: 'perfDvNm',
      header: t('구분'),
      width: '130',
      styleName: 'text-center',
    },
    { fieldName: 'redfAdsbOcYm',
      header: t('발생월'),
      width: '80',
      styleName: 'text-center',
      datetimeFormat: 'YYYY-MM',
    },
    { fieldName: 'whtxRepDvNm',
      header: t('유형'),
      width: '150',
      styleName: 'text-left',
    },
    { fieldName: 'cntrNo',
      header: t('계약번호'),
      width: '150',
      styleName: 'text-center',
    },
    { fieldName: 'cstKnm',
      header: t('고객명'),
      width: '80',
      styleName: 'text-center',
    },
    { fieldName: 'prtnrKnm',
      header: t('판매자'),
      width: '80',
      styleName: 'text-center',
    },
    { fieldName: 'redfAdsbOcAmt',
      header: t('되물림액'),
      width: '150',
      styleName: 'text-right',
      numberFormat: '#,##0',
    },
    { fieldName: 'perfYm',
      header: t('매출월'),
      width: '80',
      styleName: 'text-center',
      datetimeFormat: 'YYYY-MM',
    },
    { fieldName: 'pdNm',
      header: t('상품'),
      width: '250',
      styleName: 'text-left',
    },
    { fieldName: 'envYn',
      header: t('환경'),
      width: '50',
      styleName: 'text-center',
    },
    { fieldName: 'redfAdsbTpNm',
      header: t('처리유형'),
      width: '120',
      styleName: 'text-center',
    },
    { fieldName: 'cntrCanRsonCd',
      header: t('취소유형'),
      width: '120',
      styleName: 'text-left',
    },
    { fieldName: 'mchnChTpCd',
      header: t('기변유형'),
      width: '80',
      styleName: 'text-center',
    },
    { fieldName: 'feeCpsnRedfYn',
      header: t('강제되물림여부'),
      width: '110',
      styleName: 'text-center',
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      await fetchData();
    }
  };

  view.editOptions.editable = false;
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}
</script>
