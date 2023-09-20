<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaFilterNeedsPsListM(W-SV-U-0278M01) - 필터소요현황(교체주기)
 3. 작성자 : SaeRomI.Kim
 4. 작성일 : 2023.08.10
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 관리자가 필터소요현황 월별, 품목별로 조회하는 화면 (http://localhost:3000/#/service/wwsna-filter-needs-ps-list)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_DT')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.strtDt"
            v-model:to="searchParams.endDt"
            :label="$t('MSG_TXT_OSTR_DT')"
            rules="required|date_range_months:12"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_DV')"
          required
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="filterCodes.itmKndCd"
            rules="required"
            :label="$t('MSG_TXT_ITM_DV')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
        >
          <kw-input
            v-model="searchParams.itmPdCd"
            type="text"
            :label="$t('MSG_TXT_ITM_CD')"
            rules="alpha_num|max:10"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SAPCD')"
        >
          <kw-input
            v-model="searchParams.strtSapCd"
            :label="$t('MSG_TXT_STRT_SAP_CD')"
            rules="numeric|max:18"
            @change="onChangeStrtSapCd"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.endSapCd"
            :label="$t('MSG_TXT_END_SAP_CD')"
            rules="numeric|max:18"
            @change="onChangeEndSapCd"
          />
        </kw-search-item>
        <kw-search-item :label="`B2B ${t('MSG_TXT_MGT')}`">
          <kw-option-group
            v-model="searchParams.b2bMngtCd"
            type="checkbox"
            :options="[
              {codeId: 'P', codeName: 'P47W/F'},
              {codeId: 'A', codeName: 'A09/A12'},
            ]"
            @update:model-value="onChangeB2bMngtCd"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
          <span class="ml8">
            ({{ t('MSG_TXT_UNIT') }} : EA)
          </span>
        </template>

        <kw-btn
          v-permission:download
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="totalCount === 0"
          icon="download_on"
          secondary
          dense
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

import { codeUtil, useDataService, getComponentType, gridUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty, cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { currentRoute } = useRouter();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef = ref(getComponentType('KwGrid'));

const year = dayjs().format('YYYY');
let cachedParams;
const searchParams = ref({
  strtDt: `${year}0101`,
  endDt: dayjs().format('YYYYMMDD'),
  itmKndCd: '4',
  itmPdCd: '',
  strtSapCd: '',
  endSapCd: '',
  b2bMngtCd: [],
});

const codes = await codeUtil.getMultiCodes(
  'ITM_KND_CD',
);

const filterCodes = ref({
  itmKndCd: [],
});

function itmKndCdFilter() {
  filterCodes.value.itmKndCd = codes.ITM_KND_CD.filter((v) => ['4', '5', '6'].includes(v.codeId));
}

function onChangeStrtSapCd() {
  const { strtSapCd, endSapCd } = searchParams.value;

  if (!isEmpty(strtSapCd) && !isEmpty(endSapCd) && strtSapCd > endSapCd) {
    searchParams.value.strtSapCd = strtSapCd;
    searchParams.value.endSapCd = strtSapCd;
  }
}

function onChangeEndSapCd() {
  const { strtSapCd, endSapCd } = searchParams.value;

  if (!isEmpty(strtSapCd) && !isEmpty(endSapCd) && strtSapCd > endSapCd) {
    searchParams.value.strtSapCd = endSapCd;
    searchParams.value.endSapCd = endSapCd;
  }
}

function onChangeB2bMngtCd() {
  const { b2bMngtCd } = searchParams.value;
  if (b2bMngtCd.length === 2) {
    searchParams.value.b2bMngtCd = b2bMngtCd.slice(1, 2);
  }
}

await Promise.all([
  itmKndCdFilter(),
]);

let gridView;
let gridData;
let fieldsObj;

const totalCount = ref(0);
// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/filter-needs-state', { params: { ...cachedParams } });
  const item = res.data;
  totalCount.value = item.length;

  if (grdMainRef.value != null) {
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(item);
  }
}

function convertCheckBox() {
  const { b2bMngtCd } = cachedParams;
  const b2bP47 = b2bMngtCd.find((v) => v === 'P');
  const b2bA09 = b2bMngtCd.find((v) => v === 'A');

  const tempValue = !isEmpty(b2bA09) ? 'A' : '';
  cachedParams.b2bMngtCd = !isEmpty(b2bP47) ? 'P' : tempValue;
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  convertCheckBox();
  // 필드 셋팅
  fieldsObj.setFields();
  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/filter-needs-state', { params: cachedParams });

  gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

fieldsObj = {
  // 그리드 공통컬럼
  defaultFields: [
    { fieldName: 'sapCd', header: t('MSG_TXT_SAP_CD'), width: '130', styleName: 'text-center', dataType: 'text' },
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '140', styleName: 'text-center', dataType: 'text' },
    { fieldName: 'pdNm', header: t('MSG_TXT_ITM_NM'), width: '220', styleName: 'text-left', dataType: 'text', footer: { text: t('MSG_TXT_SUM'), styleName: 'text-center' } },
  ],
  allFields: [
    { fieldName: 'vCnt99',
      header: t('MSG_TXT_NED_QTY'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt99',
      header: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}`,
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt01',
      header: t('MSG_TXT_NED_QTY'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt01',
      header: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}`,
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt02',
      header: t('MSG_TXT_NED_QTY'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt02',
      header: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}`,
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt03',
      header: t('MSG_TXT_NED_QTY'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt03',
      header: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}`,
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt04',
      header: t('MSG_TXT_NED_QTY'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt04',
      header: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}`,
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt05',
      header: t('MSG_TXT_NED_QTY'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt05',
      header: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}`,
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt06',
      header: t('MSG_TXT_NED_QTY'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt06',
      header: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}`,
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt07',
      header: t('MSG_TXT_NED_QTY'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt07',
      header: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}`,
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt08',
      header: t('MSG_TXT_NED_QTY'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt08',
      header: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}`,
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt09',
      header: t('MSG_TXT_NED_QTY'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt09',
      header: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}`,
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt10',
      header: t('MSG_TXT_NED_QTY'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt10',
      header: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}`,
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt11',
      header: t('MSG_TXT_NED_QTY'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt11',
      header: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}`,
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt12',
      header: t('MSG_TXT_NED_QTY'),
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt12',
      header: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}`,
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
  ],
  b2bPFields: [
    { fieldName: 'vCnt99W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt99F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt99W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt99F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt01W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt01F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt01W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt01F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt02W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt02F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt02W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt02F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt03W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt03F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt03W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt03F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt04W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt04F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt04W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt04F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt05W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt05F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt05W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt05F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt06W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt06F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt06W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt06F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt07W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt07F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt07W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt07F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt08W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt08F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt08W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt08F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt09W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt09F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt09W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt09F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt10W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt10F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt10W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt10F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt11W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt11F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt11W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt11F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt12W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt12F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt12W',
      header: 'W',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt12F',
      header: 'F',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
  ],
  b2bAFields: [
    { fieldName: 'vCnt99W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt99F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt99W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt99F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt01W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt01F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt01W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt01F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt02W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt02F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt02W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt02F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt03W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt03F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt03W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt03F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt04W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt04F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt04W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt04F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt05W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt05F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt05W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt05F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt06W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt06F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt06W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt06F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt07W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt07F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt07W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt07F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt08W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt08F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt08W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt08F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt09W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt09F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt09W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt09F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt10W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt10F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt10W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt10F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt11W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt11F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt11W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt11F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt12W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'vCnt12F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt12W',
      header: 'A09',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
    { fieldName: 'pCnt12F',
      header: 'A12',
      width: '90',
      styleName: 'text-right',
      dataType: 'number',
      footer: {
        expression: 'sum',
        numberFormat: '#,##0.##',
      },
    },
  ],
  setFields() {
    const { b2bMngtCd } = cachedParams;
    let columns = [];
    let layoutColumns = [];

    if (isEmpty(b2bMngtCd)) {
      columns = [...fieldsObj.defaultFields, ...fieldsObj.allFields];

      // 헤더 부분 merge
      layoutColumns = [...fieldsObj.getColumnNameArr(fieldsObj.defaultFields),
        {
          header: t('MSG_TXT_AGG'),
          direction: 'horizontal', // merge type
          items: ['vCnt99', 'pCnt99'],
        },
        {
          header: t('MSG_TXT_JAN'),
          direction: 'horizontal', // merge type
          items: ['vCnt01', 'pCnt01'],
        },
        {
          header: t('MSG_TXT_FEB'),
          direction: 'horizontal', // merge type
          items: ['vCnt02', 'pCnt02'],
        },
        {
          header: t('MSG_TXT_MAR'),
          direction: 'horizontal', // merge type
          items: ['vCnt03', 'pCnt03'],
        },
        {
          header: t('MSG_TXT_APRI'),
          direction: 'horizontal', // merge type
          items: ['vCnt04', 'pCnt04'],
        },
        {
          header: t('MSG_TXT_MAY'),
          direction: 'horizontal', // merge type
          items: ['vCnt05', 'pCnt05'],
        },
        {
          header: t('MSG_TXT_JUN'),
          direction: 'horizontal', // merge type
          items: ['vCnt06', 'pCnt06'],
        },
        {
          header: t('MSG_TXT_JUL'),
          direction: 'horizontal', // merge type
          items: ['vCnt07', 'pCnt07'],
        },
        {
          header: t('MSG_TXT_AUG'),
          direction: 'horizontal', // merge type
          items: ['vCnt08', 'pCnt08'],
        },
        {
          header: t('MSG_TXT_SEPT'),
          direction: 'horizontal', // merge type
          items: ['vCnt09', 'pCnt09'],
        },
        {
          header: t('MSG_TXT_OCT'),
          direction: 'horizontal', // merge type
          items: ['vCnt10', 'pCnt10'],
        },
        {
          header: t('MSG_TXT_NOV'),
          direction: 'horizontal', // merge type
          items: ['vCnt11', 'pCnt11'],
        },
        {
          header: t('MSG_TXT_DECE'),
          direction: 'horizontal', // merge type
          items: ['vCnt12', 'pCnt12'],
        },
      ];
    } else if (b2bMngtCd === 'P') {
      columns = [...fieldsObj.defaultFields, ...fieldsObj.b2bPFields];
    } else if (b2bMngtCd === 'A') {
      columns = [...fieldsObj.defaultFields, ...fieldsObj.b2bAFields];
    }

    if (b2bMngtCd === 'P' || b2bMngtCd === 'A') {
      // 헤더 부분 merge
      layoutColumns = [...fieldsObj.getColumnNameArr(fieldsObj.defaultFields),
        {
          header: t('MSG_TXT_AGG'),
          direction: 'horizontal', // merge type
          items: [
            { direction: 'horizontal',
              header: { text: t('MSG_TXT_NED_QTY') },
              items: ['vCnt99W', 'vCnt99F'],
            }, { direction: 'horizontal',
              header: { text: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}` },
              items: ['pCnt99W', 'pCnt99F'],
            },
          ],
        },
        {
          header: t('MSG_TXT_JAN'),
          direction: 'horizontal', // merge type
          items: [
            { direction: 'horizontal',
              header: { text: t('MSG_TXT_NED_QTY') },
              items: ['vCnt01W', 'vCnt01F'],
            }, { direction: 'horizontal',
              header: { text: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}` },
              items: ['pCnt01W', 'pCnt01F'],
            },
          ],
        },
        {
          header: t('MSG_TXT_FEB'),
          direction: 'horizontal', // merge type
          items: [
            { direction: 'horizontal',
              header: { text: t('MSG_TXT_NED_QTY') },
              items: ['vCnt02W', 'vCnt02F'],
            }, { direction: 'horizontal',
              header: { text: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}` },
              items: ['pCnt02W', 'pCnt02F'],
            },
          ],
        },
        {
          header: t('MSG_TXT_MAR'),
          direction: 'horizontal', // merge type
          items: [
            { direction: 'horizontal',
              header: { text: t('MSG_TXT_NED_QTY') },
              items: ['vCnt03W', 'vCnt03F'],
            }, { direction: 'horizontal',
              header: { text: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}` },
              items: ['pCnt03W', 'pCnt03F'],
            },
          ],
        },
        {
          header: t('MSG_TXT_APRI'),
          direction: 'horizontal', // merge type
          items: [
            { direction: 'horizontal',
              header: { text: t('MSG_TXT_NED_QTY') },
              items: ['vCnt04W', 'vCnt04F'],
            }, { direction: 'horizontal',
              header: { text: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}` },
              items: ['pCnt04W', 'pCnt04F'],
            },
          ],
        },
        {
          header: t('MSG_TXT_MAY'),
          direction: 'horizontal', // merge type
          items: [
            { direction: 'horizontal',
              header: { text: t('MSG_TXT_NED_QTY') },
              items: ['vCnt05W', 'vCnt05F'],
            }, { direction: 'horizontal',
              header: { text: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}` },
              items: ['pCnt05W', 'pCnt05F'],
            },
          ],
        },
        {
          header: t('MSG_TXT_JUN'),
          direction: 'horizontal', // merge type
          items: [
            { direction: 'horizontal',
              header: { text: t('MSG_TXT_NED_QTY') },
              items: ['vCnt06W', 'vCnt06F'],
            }, { direction: 'horizontal',
              header: { text: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}` },
              items: ['pCnt06W', 'pCnt06F'],
            },
          ],
        },
        {
          header: t('MSG_TXT_JUL'),
          direction: 'horizontal', // merge type
          items: [
            { direction: 'horizontal',
              header: { text: t('MSG_TXT_NED_QTY') },
              items: ['vCnt07W', 'vCnt07F'],
            }, { direction: 'horizontal',
              header: { text: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}` },
              items: ['pCnt07W', 'pCnt07F'],
            },
          ],
        },
        {
          header: t('MSG_TXT_AUG'),
          direction: 'horizontal', // merge type
          items: [
            { direction: 'horizontal',
              header: { text: t('MSG_TXT_NED_QTY') },
              items: ['vCnt08W', 'vCnt08F'],
            }, { direction: 'horizontal',
              header: { text: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}` },
              items: ['pCnt08W', 'pCnt08F'],
            },
          ],
        },
        {
          header: t('MSG_TXT_SEPT'),
          direction: 'horizontal', // merge type
          items: [
            { direction: 'horizontal',
              header: { text: t('MSG_TXT_NED_QTY') },
              items: ['vCnt09W', 'vCnt09F'],
            }, { direction: 'horizontal',
              header: { text: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}` },
              items: ['pCnt09W', 'pCnt09F'],
            },
          ],
        },
        {
          header: t('MSG_TXT_OCT'),
          direction: 'horizontal', // merge type
          items: [
            { direction: 'horizontal',
              header: { text: t('MSG_TXT_NED_QTY') },
              items: ['vCnt10W', 'vCnt10F'],
            }, { direction: 'horizontal',
              header: { text: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}` },
              items: ['pCnt10W', 'pCnt10F'],
            },
          ],
        },
        {
          header: t('MSG_TXT_NOV'),
          direction: 'horizontal', // merge type
          items: [
            { direction: 'horizontal',
              header: { text: t('MSG_TXT_NED_QTY') },
              items: ['vCnt11W', 'vCnt11F'],
            }, { direction: 'horizontal',
              header: { text: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}` },
              items: ['pCnt11W', 'pCnt11F'],
            },
          ],
        },
        {
          header: t('MSG_TXT_DECE'),
          direction: 'horizontal', // merge type
          items: [
            { direction: 'horizontal',
              header: { text: t('MSG_TXT_NED_QTY') },
              items: ['vCnt12W', 'vCnt12F'],
            }, { direction: 'horizontal',
              header: { text: `${t('MSG_TXT_ASGN')}${t('MSG_TXT_QTY')}` },
              items: ['pCnt12W', 'pCnt12F'],
            },
          ],
        },
      ];
    }

    const fields = columns.map(({ fieldName, dataType }) => ({ fieldName, dataType }));

    gridData.setFields(fields);
    gridView.setColumns(columns);
    gridView.setColumnLayout(layoutColumns);

    gridView.setFooters({ visible: true });
    gridView.setOptions({ summaryMode: 'aggregate' });
  },
  // 리스트에 담겨진 항목 중 fieldName 배열로 가져옴
  getColumnNameArr(objList) {
    return objList.map((v) => v.fieldName);
  },
};

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const columns = [...fieldsObj.defaultFields, ...fieldsObj.allFields];

  // 헤더 부분 merge
  const layoutColumns = [...fieldsObj.getColumnNameArr(fieldsObj.defaultFields),
    {
      header: t('MSG_TXT_AGG'),
      direction: 'horizontal', // merge type
      items: ['vCnt99', 'pCnt99'],
    },
    {
      header: t('MSG_TXT_JAN'),
      direction: 'horizontal', // merge type
      items: ['vCnt01', 'pCnt01'],
    },
    {
      header: t('MSG_TXT_FEB'),
      direction: 'horizontal', // merge type
      items: ['vCnt02', 'pCnt02'],
    },
    {
      header: t('MSG_TXT_MAR'),
      direction: 'horizontal', // merge type
      items: ['vCnt03', 'pCnt03'],
    },
    {
      header: t('MSG_TXT_APRI'),
      direction: 'horizontal', // merge type
      items: ['vCnt04', 'pCnt04'],
    },
    {
      header: t('MSG_TXT_MAY'),
      direction: 'horizontal', // merge type
      items: ['vCnt05', 'pCnt05'],
    },
    {
      header: t('MSG_TXT_JUN'),
      direction: 'horizontal', // merge type
      items: ['vCnt06', 'pCnt06'],
    },
    {
      header: t('MSG_TXT_JUL'),
      direction: 'horizontal', // merge type
      items: ['vCnt07', 'pCnt07'],
    },
    {
      header: t('MSG_TXT_AUG'),
      direction: 'horizontal', // merge type
      items: ['vCnt08', 'pCnt08'],
    },
    {
      header: t('MSG_TXT_SEPT'),
      direction: 'horizontal', // merge type
      items: ['vCnt09', 'pCnt09'],
    },
    {
      header: t('MSG_TXT_OCT'),
      direction: 'horizontal', // merge type
      items: ['vCnt10', 'pCnt10'],
    },
    {
      header: t('MSG_TXT_NOV'),
      direction: 'horizontal', // merge type
      items: ['vCnt11', 'pCnt11'],
    },
    {
      header: t('MSG_TXT_DECE'),
      direction: 'horizontal', // merge type
      items: ['vCnt12', 'pCnt12'],
    },
  ];

  const fields = columns.map(({ fieldName, dataType }) => ({ fieldName, dataType }));

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(layoutColumns);
  view.setFooters({ visible: true });
  view.setOptions({ summaryMode: 'aggregate' });

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  gridView = view;
  gridData = data;
});

</script>
