<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaNormalOutOfStorageMgtM - 정상출고 관리(W-SV-U-0142M01)
3. 작성자 : inho.choi
4. 작성일 : 2023.03.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
자재 출고 요청을 확인 하고 출고 확정을 처리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 출고요청접수 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_AK_RCP')"
        >
          <kw-select
            v-model="searchParams.ostrOjWareNo"
            :options="codes.WARE_HOUSE"
          />
        </kw-search-item>
        <!-- //출고요청접수 -->
        <!-- 출고품목 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_ITM')"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- //출고품목 -->
        <!-- 출고요청유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_AK_TP')"
        >
          <kw-select
            v-model="searchParams.ostrAkTpCd"
            :options="codes.OSTR_AK_TP_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- //출고요청유형 -->
      </kw-search-row>
      <kw-search-row>
        <!-- 입고희망일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_STR_HOP_DT')"
          :colspan="2"
        >
          <kw-date-range-picker
            v-model:from="searchParams.strHopDtStr"
            v-model:to="searchParams.strHopDtEnd"
            rules="date_range_months:1"
            @change="fetchDefaultData"
          />
          <!-- //입고희망일자 -->
          <!-- 출고확정-->
          <kw-field
            v-model="searchParams.ostrCnfm"
            class="ml20"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-model="searchParams.ostrCnfm"
                v-bind="field"
                :label="$t('MSG_TXT_OSTR_DTRM')"
              />
            </template>
          </kw-field>
          <!-- //출고확정-->
        </kw-search-item>
        <!-- 출고요청창고 -->
        <kw-search-item
          :colspan="1"
          :label="$t('MSG_TXT_OSTR_AK_WARE')"
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :options="codes.WARE_DV_CD"
          />
        </kw-search-item>
        <!-- //출고요청창고 -->
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
            @change="fetchData"
          />
        </template>
        <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        />
        <kw-btn
          v-permission:download
          dense
          icon="excel"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="pageInfo.pageSize"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, getComponentType, useMeta, defineGrid, useGlobal, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
// import { cloneDeep, isEmpty } from 'lodash-es';

const { getConfig } = useMeta();
const { modal } = useGlobal();
const { t } = useI18n();

const dataService = useDataService();
const baseURI = '/sms/wells/service/normal-outofstorages';
const wareURI = `${baseURI}/warehouses`;
const grdMainRef = ref(getComponentType('KwGrid'));
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = ref(await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'OSTR_AK_TP_CD',
  'WARE_DV_CD',
  'ITM_KND_CD',
  'OVIV_FOM_CD',
));

codes.value.OSTR_AK_TP_CD = codes.value.OSTR_AK_TP_CD.filter((v) => v.codeId === '310' || v.codeId === '320' || v.codeId === '330');
console.log(dayjs().format('YYYYMMDD'));
const searchParams = ref({
  strHopDtStr: dayjs().format('YYYYMMDD'),
  strHopDtEnd: dayjs().format('YYYYMMDD'),
  ostrCnfm: 'N',
  ostrAkTpCd: '',
  ostrOjWareNo: '',
  itmKndCd: '',
  wareDvCd: '',
  wareLocaraCd: '',
});
let cachedParams;

async function fetchDefaultData() {
  const defaultParams = ref({
    apyYm: dayjs(searchParams.value.strHopDtStr).format('YYYYMM'),
  });
  const res = await dataService.get(wareURI, { params: defaultParams.value });
  if (res.data.length === 0) {
    return false;
  }
  codes.value.WARE_HOUSE = res.data.map((v) => ({ codeId: v.wareNo, codeName: v.wareNm }));
  searchParams.value.ostrOjWareNo = codes.value.WARE_HOUSE[0].codeId;
}

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const res = await dataService.get(baseURI, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: searchData, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const datasSource = view.getDataSource();
  datasSource.setRows(searchData);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseURI}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'NomalOutOfStorageMgt',
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
  await fetchDefaultData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'strHopDt',
      header: t('MSG_TXT_STR_HOP_D'),
      width: '150',
      styleName: 'text-center',
      datetimeFormat: 'date',
    },
    { fieldName: 'ostrAkTpCd',
      header: t('MSG_TXT_OSTR_AK_TP'),
      width: '150',
      styleName: 'text-center',
      options: codes.value.OSTR_AK_TP_CD,
    },
    { fieldName: 'ostrAkNo',
      header: t('MSG_TXT_OSTR_AK_MNGT_NO'),
      width: '200',
      styleName: 'text-center',
      displayCallback: (g, i, v) => {
        const regExp = /^(\d{3})(\d{8})(\d{7}).*/;
        return v.replace(regExp, '$1-$2-$3');
      },
    },
    { fieldName: 'ostrOjWareNm', header: t('MSG_TXT_OSTR_AK_WARE'), width: '150', styleName: 'text-left' },
    { fieldName: 'pdNm', header: t('MSG_TXT_OSTR_AK_ITM'), width: '300', styleName: 'text-left' },
    { fieldName: 'ovivTpCd',
      header: t('MSG_TXT_OVIV_FOM'),
      width: '100',
      styleName: 'text-center',
      options: codes.value.OVIV_FOM_CD,
    },
    { fieldName: 'rectOstrDt', header: t('MSG_TXT_RECT_OSTR_DT'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'ostrDtrnYn', header: t('MSG_TXT_OSTR_DTRM_YN'), width: '150', styleName: 'text-center' },
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_NOTE'),
      width: '142',
      styleName: 'text-center',
      renderer: {
        type: 'button',
      },
      displayCallback: () => t('MSG_TXT_NOM_OSTR_RGST'),
    },
    { fieldName: 'ostrOjWareNo', header: '', width: '0', styleName: 'text-left', visible: false },
    { fieldName: 'strOjWareNo', header: '', width: '0', styleName: 'text-left', visible: false },
    { fieldName: 'strOjWareNm', header: '', width: '0', styleName: 'text-left', visible: false },
    { fieldName: 'itmPdCd', header: '', width: '0', styleName: 'text-left', visible: false },
  ];

  const fields = columns.map((v) => ({ fieldName: v.fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.onCellItemClicked = async (g, { column, dataRow }, v) => {
    const {
      ostrAkTpCd,
      ostrOjWareNo,
      strOjWareNo,
      strHopDt,
      ostrAkNo,
      ostrOjWareNm,
      strOjWareNm,
      itmPdCd,
    } = gridUtil.getRowValue(g, dataRow);
    console.log(g, column, dataRow, v);

    if (column === 'rmkCn') {
      const { result, payload } = await modal({
        component: 'WwsnaNormalOutOfStorageRgstListP',
        componentProps: {
          ostrAkTpCd,
          ostrOjWareNo,
          strOjWareNo,
          strHopDt,
          ostrAkNo,
          ostrOjWareNm,
          strOjWareNm,
          itmPdCd,
        },
      });

      if (result) {
        console.log(payload[0]);
      }
    }
  };
});
</script>
