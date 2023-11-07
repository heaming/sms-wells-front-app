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
- 자재 출고 요청을 확인 하고 출고 확정을 처리 (http://localhost:3000/#/service/wwsna-normal-out-of-storage-mgt)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="5"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 출고요청접수 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_AK_RCP')"
          :colspan="2"
          required
        >
          <kw-select
            v-model="searchParams.ostrOjWareNo"
            :options="codes.WARE_HOUSE"
            :label="$t('MSG_TXT_OSTR_AK_RCP')"
            option-value="wareNo"
            option-label="wareNm"
            first-option="select"
            rules="required"
          />
        </kw-search-item>
        <!-- 출고품목 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_ITM')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            first-option="all"
          />
        </kw-search-item>
        <!-- 출고요청유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_AK_TP')"
        >
          <kw-select
            v-model="searchParams.ostrAkTpCd"
            :options="codes.OSTR_AK_TP_CD"
            first-option="all"
            @change="onChangeOstrAkTpCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 입고희망일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_STR_HOP_DT')"
          :colspan="2"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.strHopDtStr"
            v-model:to="searchParams.strHopDtEnd"
            rules="date_range_months:1|required"
            @update:from="fetchDefaultData"
          />
        </kw-search-item>
        <!-- 출고상태 -->
        <kw-search-item
          :label="`${t('MSG_TXT_OSTR')}${t('MSG_TXT_STT')}`"
          :colspan="2"
        >
          <kw-option-group
            v-model="searchParams.ostrStts"
            type="checkbox"
            :options="[
              {codeId: 'STNB', codeName: `${t('MSG_TXT_OSTR_STNB')}`},
              {codeId: 'PRTN', codeName: `${t('MSG_TXT_PRTN_OSTR')}`},
              {codeId: 'FSH', codeName: `${t('MSG_TXT_OSTR_FSH')}`},
            ]"
          />
        </kw-search-item>

        <!-- 출고요청창고 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_AK_WARE')"
          required
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :label="$t('MSG_TXT_OSTR_AK_WARE')"
            :options="codes.WARE_DV_CD"
            first-option="select"
            rules="required"
          />
        </kw-search-item>
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
        <!-- 엑셀다운로드 -->
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
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
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
import { cloneDeep, isEmpty } from 'lodash-es';

const { getConfig } = useMeta();
const { modal } = useGlobal();
const { t } = useI18n();

const dataService = useDataService();
const baseURI = '/sms/wells/service/normal-out-of-storages';
const wareURI = `${baseURI}/ware-houses`;
const grdMainRef = ref(getComponentType('KwGrid'));
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = ref(await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'OSTR_AK_TP_CD',
  'WARE_DV_CD',
  'ITM_KND_CD',
  'OVIV_TP_CD',
));

// 출고요청 필터링
codes.value.OSTR_AK_TP_CD = codes.value.OSTR_AK_TP_CD.filter((v) => v.codeId === '310' || v.codeId === '320' || v.codeId === '330');
const toMonth = dayjs().format('YYYYMMDD');

const searchParams = ref({
  strHopDtStr: toMonth,
  strHopDtEnd: toMonth,
  ostrStts: ['STNB', 'PRTN'],
  ostrAkTpCd: '',
  ostrOjWareNo: '',
  itmKndCd: '',
  wareDvCd: '2',
});
let cachedParams;

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 조회
async function fetchData() {
  const res = await dataService.get(`${baseURI}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: searchData, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const datasSource = view.getDataSource();
  datasSource.setRows(searchData);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 조회버튼 클릭
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${baseURI}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'NomalOutOfStorageMgt',
    timePostfix: true,
    exportData: res.data,
  });
}

// 본인창고조회 및 셋팅
async function fetchDefaultData() {
  codes.value.WARE_HOUSE = [];
  searchParams.value.ostrOjWareNo = '';

  let { strHopDtStr } = searchParams.value;
  if (isEmpty(strHopDtStr)) strHopDtStr = dayjs().format('YYYYMMDD');

  const apyYm = dayjs(strHopDtStr).format('YYYYMM');
  const res = await dataService.get(wareURI, { params: { apyYm } });
  if (!isEmpty(res.data)) {
    codes.value.WARE_HOUSE = res.data;
    searchParams.value.ostrOjWareNo = res.data[0].wareNo;
  }
}

onMounted(async () => {
  await fetchDefaultData();
});

// 출고요청유형코드 변경시
function onChangeOstrAkTpCd() {
  const { ostrAkTpCd } = searchParams.value;

  const yearMonth = dayjs.format('YYYYMM');

  if (ostrAkTpCd === '330') {
    searchParams.value.strHopDtStr = `${yearMonth}01`;
    searchParams.value.strHopDtEnd = toMonth;
    return;
  }

  searchParams.value.strHopDtStr = toMonth;
  searchParams.value.strHopDtEnd = toMonth;
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ostrAkNo' }, // 출고요청번호
    { fieldName: 'ostrAkTpCd' }, // 출고요청유형
    { fieldName: 'ostrOjWareNo' }, // 출고창고번호
    { fieldName: 'strOjWareNm' }, // 입고창고
    { fieldName: 'strOjWareNo' }, // 입고창고번호
    { fieldName: 'strHopDt' }, // 입고희망일
    { fieldName: 'ovivTpCd' }, // 배차형태
    { fieldName: 'rectOstrDt' }, // 최근출고일자
    { fieldName: 'ostrDtrnYn' }, // 출고상태
    { fieldName: 'itmPdCd' }, // 품목코드
    { fieldName: 'pdNm' }, // 출고요청품목
    { fieldName: 'ostrAkSn' }, // 요청일련번호
    { fieldName: 'rmkCn' }, // 비고
  ];

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
    { fieldName: 'strOjWareNm', header: t('MSG_TXT_OSTR_AK_WARE'), width: '150', styleName: 'text-left' },
    { fieldName: 'pdNm', header: t('MSG_TXT_OSTR_AK_ITM'), width: '300', styleName: 'text-left' },
    { fieldName: 'ovivTpCd',
      header: t('MSG_TXT_OVIV_FOM'),
      width: '100',
      styleName: 'text-center',
      options: codes.value.OVIV_TP_CD,
    },
    { fieldName: 'rectOstrDt', header: t('MSG_TXT_RECT_OSTR_DT'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'ostrDtrnYn', header: `${t('MSG_TXT_OSTR')}${t('MSG_TXT_STT')}`, width: '150', styleName: 'text-center' },
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

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.onCellItemClicked = async (g, { column, dataRow }) => {
    const {
      ostrAkNo,
      ostrAkSn,
    } = gridUtil.getRowValue(g, dataRow);

    if (column === 'rmkCn') {
      const { result } = await modal({
        component: 'WwsnaNormalOutOfStorageRgstListP',
        componentProps: {
          ostrAkNo,
          ostrAkSn,
          page: 'WwsnaNormalOutOfStorageMgtM',
        },
      });

      if (result) {
        await fetchData();
      }
    }
  };
});
</script>
