<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : [WSNC] allocate(배정관리)
2. 프로그램 ID : WwsncProductServicePresentStateListM - 제품 서비스 현황 (W-SV-U-0229M01)
3. 작성자 : gs.piit122 김동엽
4. 작성일 : 2023-01-02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 조회조건에 일치하는 상품별, 작업유형별 서비스 처리 정보를 조회한다.
****************************************************************************************************
-->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_BASE_YEAR')">
          <kw-date-picker
            v-model="searchParams.wkExcnDt"
            type="year"
            :label="$t('MSG_TXT_BASE_YEAR')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_LOCARA_MNGT_DV_CD')">
          <kw-select
            v-model="searchParams.mngrDvCd"
            :options="codes.LOCARA_MNGT_DV_CD"
            :label="$t('MSG_TXT_LOCARA_MNGT_DV_CD')"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_PD_GRP')">
          <kw-select
            v-model="searchParams.pdPrpVal20"
            :options="codes.PD_GRP_CD"
            :label="$t('MSG_TXT_PD_GRP')"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="subCodes"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>{{ $t('MSG_TXT_SRCH_RSLT') }}</h3>
      <kw-action-top>
        <kw-btn
          :label="$t('MSG_BTN_PRTG')"
          dense
          icon="print"
          secondary
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
import { codeUtil, defineGrid, getComponentType, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import useSnCode from '~sms-wells/service/composables/useSnCode';

const dataService = useDataService();

const { getLcStockSt101tb } = useSnCode();

const subCodes = ref((await getLcStockSt101tb()).map((v) => ({ codeId: v.cd, codeName: v.cdNm })));
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  wkExcnDt: dayjs().format('YYYY'),
  mngrDvCd: '',
  pdPrpVal20: '',
  pdCd: '',
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'LOCARA_MNGT_DV_CD',
  'PD_GRP_CD',
);

async function fetchData() {
  console.log(2);
  const res = await dataService.get(
    '/sms/wells/service/as-assign-state/product-service-states',
    { params: { ...cachedParams } },
  );

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'acol1' },
    { fieldName: 'acol2' },
    { fieldName: 'acol3' },
    { fieldName: 'acol4' },
    { fieldName: 'acol5' },
    { fieldName: 'acol6' },
    { fieldName: 'acol7' },
    { fieldName: 'acol8' },
    { fieldName: 'acol9' },
    { fieldName: 'acol10' },
    { fieldName: 'acol11' },
    { fieldName: 'acol12' },
    { fieldName: 'totalCount' },
    { fieldName: 'svBizHclsfCd' },
    { fieldName: 'wkExcnDt' },
  ];
  const columns = [
    { fieldName: 'acol1', header: 'undefined', width: '100', styleName: 'text-left' },
    { fieldName: 'acol2', header: 'undefined', width: '100', styleName: 'text-left' },
    { fieldName: 'acol3', header: 'undefined', width: '100', styleName: 'text-left' },
    { fieldName: 'acol4', header: 'undefined', width: '100', styleName: 'text-left' },
    { fieldName: 'acol5', header: 'undefined', width: '100', styleName: 'text-left' },
    { fieldName: 'acol6', header: 'undefined', width: '100', styleName: 'text-left' },
    { fieldName: 'acol7', header: 'undefined', width: '100', styleName: 'text-left' },
    { fieldName: 'acol8', header: 'undefined', width: '100', styleName: 'text-left' },
    { fieldName: 'acol9', header: 'undefined', width: '100', styleName: 'text-left' },
    { fieldName: 'acol10', header: 'undefined', width: '100', styleName: 'text-left' },
    { fieldName: 'acol11', header: 'undefined', width: '100', styleName: 'text-left' },
    { fieldName: 'acol12', header: 'undefined', width: '100', styleName: 'text-left' },
    { fieldName: 'totalCount', header: 'undefined', width: '100', styleName: 'text-left' },
    { fieldName: 'svBizHclsfCd', header: '서비스업무대분류코드', width: '100', styleName: 'text-left' },
    { fieldName: 'wkExcnDt', header: '기준년도', width: '100', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
});

</script>
