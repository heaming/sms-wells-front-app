<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CMA
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
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 출고요청접수 -->
        <kw-search-item
          :colspan="2"
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
          :colspan="1"
          :label="$t('MSG_TXT_OSTR_ITM')"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
          />
        </kw-search-item>
        <!-- //출고품목 -->
        <!-- 출고요청유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_AK_TP')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.ostrAkTpCd"
            :options="codes.OSTR_AK_TP_CD"
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
          />
          <!-- //입고희망일자 -->
          <!-- 출고확정-->
          <kw-field
            v-model="searchParams.ostrCnfm"
            class="w80"
            v-bind="checkItem"
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
            v-model="searchParams.ostrAkTpCd"
            :options="codes.WARE_DV_CD"
          />
        </kw-search-item>
        <!-- //출고요청창고 -->
        <!-- 지역 -->
        <kw-search-item
          :colspan="1"
          :label="$t('MSG_TXT_LOCARA')"
        >
          <kw-select
            v-model="searchParams.ovivTpCd"
            :options="codes.ADM_ZN_CLSF_CD"
          />
        </kw-search-item>
        <!-- //지역 -->
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
        :total-count="pageInfo.totalCount"
        :page-size="pageInfo.pageSize"
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
import { codeUtil, useDataService, getComponentType, useMeta, defineGrid, useGlobal } from 'kw-lib';
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
  'ADM_ZN_CLSF_CD',
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
  const res = await dataService.get(wareURI, { params: {} });
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
      options: codes.OSTR_AK_TP_CD,
      // optionValue:'codeId',
      // optionLabel:'codeName'
      // displayCallback: (g, i, v) => {
      //   const val = g.getValue(i.itemIndex, 'ostrAkTpCd');
      //   if (v !== null) {
      //     return codes.value.OSTR_AK_TP_CD.find((obj) => obj.codeId === v).codeName;
      //   }
      //   return isEmpty(v) ? val : v;
      // },
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
      options: codes.OVIV_FOM_CD,
      // displayCallback: (grid, index, value) => {
      //   const ovivTpCd = grid.getValue(index.itemIndex, 'ovivTpCd');
      //   if (value !== null) {
      //     return codes.value.OVIV_FOM_CD.find((obj) => obj.codeId === value).codeName;
      //   }
      //   return isEmpty(value) ? ovivTpCd : value;
      // },
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
  ];

  const fields = columns.map((v) => ({ fieldName: v.fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.onCellItemClicked = async (g, { column, dataRow }, v) => {
    console.log(g, column, dataRow, v);
    debugger;
    if (column === 'rmkCn') {
      const { result, payload } = await modal({
        component: 'WwsnaNormalOutOfStorageRgstListP',
      });

      if (result) {
        console.log(payload[0]);
        debugger;
      }
    }
  };
});
</script>
