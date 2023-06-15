<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNY
2. 프로그램 ID : WwsnyPaidAsServiceCostMgtM  - 유상A/S 서비스비용 관리
3. 작성자 : kyunglyn.lee
4. 작성일 : 2023.03.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 유상A/S 서비스비용 관리 (http://localhost:3000/#/service/wwsny-recapitalization-as-sv-cs-mngt-mgt)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <!--상품 그룹-->
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
          :colspan="2"
        >
          <!--상품 그룹: 상품 그룹-->
          <kw-select
            v-model="searchParams.hgrPdCd"
            :options="codes.PD_GRP_CD"
            class="w150"
            first-option="all"
          />
          <!--상품 그룹: 상품명-->
          <kw-select
            v-model="searchParams.pdCd"
            :options="pdGr"
            first-option="all"
          />
        </kw-search-item>

        <!-- 자재구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_MAT_DV')"
        >
          <kw-field
            v-model="searchParams.cmnPartChk"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                :label="$t('MSG_TXT_CMN_PART')"
                :disable="isHgrPdCd"
              />
            </template>
          </kw-field>
        </kw-search-item>
        <kw-search-item />
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
          <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>

        <kw-btn
          dense
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        /> -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 적용일자 일괄변경 -->
        <kw-date-picker
          v-model="chgApyDt.apyStrtdt"
          dense
          class="w150"
        />
        <kw-date-picker
          v-model="chgApyDt.apyEnddt"
          dense
          :readonly="true"
          class="w150"
        />
        <kw-btn
          secondary
          dense
          :label="$t('MSG_BTN_APY_DT_BLK_CH')"
          @click="onClickApplyDateBulkChange"
        />
      </kw-action-top>

      <ul class="filter-box mb12">
        <li class="filter-box__item">
          <p class="filter-box__item-label">
            {{ $t('MSG_TXT_MAT_DV') }}
          </p>
          <kw-field
            v-model="searchParams.apyMtrChk"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                :label="$t('MSG_TXT_CRTL_APY_MTR')"
              />
            </template>
          </kw-field>
        </li>
      </ul>

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
import {
  codeUtil,
  defineGrid,
  getComponentType,
  useDataService,
  useMeta,
  gridUtil,
  notify,
} from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

/* 공통코드 */
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GRP_CD',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const now = dayjs();
const chgApyDt = ref({
  apyStrtdt: now.format('YYYYMMDD'),
  apyEnddt: '99991231',
});

/* 조회조건 */
const searchParams = ref({
  hgrPdCd: '', // '4',
  pdCd: '', // 'WM03100193',
  cmnPartChk: 'N',
  apyMtrChk: 'N',
  applyDate: now.format('YYYYMMDD'),
});

let cachedParams;

/* 상품그룹 조회 */
const pdGr = ref();
const onChangeHgrPdCd = async () => {
  const res = await dataService.get('/sms/wells/service/paid-as-costs/filter-products', { params: searchParams.value });
  pdGr.value = res.data;
};

const isHgrPdCd = ref(false);

watch(() => searchParams.value.hgrPdCd, (val) => {
  if (!isEmpty(val) && Number(val) > 9) {
    isHgrPdCd.value = true;
    searchParams.value.cmnPartChk = 'N';
  } else {
    isHgrPdCd.value = false;
  }

  if (searchParams.value.hgrPdCd !== val) {
    searchParams.value.hgrPdCd = val;
  }
  onChangeHgrPdCd();
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/paid-as-costs/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: recapitalizationAsSvCs, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(recapitalizationAsSvCs);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

const { currentRoute } = useRouter();
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/paid-as-costs/excel-download', { params: searchParams.value });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickApplyDateBulkChange() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);
  const data = grdMainRef.value.getData();

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_CHG_HLDY_DATA'));
  } else if (!chgApyDt.value.apyStrtdt) {
    notify(t('MSG_ALT_CHK_NCSR', [t('MSG_TXT_APY_STRTDT')]));
  } else {
    for (let i = 0; i < chkRows.length; i += 1) {
      notify(t('MSG_ALT_BULK_APPLY_SUCCESS', [t('MSG_TXT_APY_STRTDT')]));
      data.setValue(chkRows[i].dataRow, 'apyStrtdt', chgApyDt.value.apyStrtdt);
      data.setValue(chkRows[i].dataRow, 'apyEnddt', chgApyDt.value.apyEnddt);
    }
  }
}

function searchConditionReset() {
  searchParams.value.hgrPdCd = '';
  searchParams.value.cmnPartChk = 'N';
  searchParams.value.apyMtrChk = 'N';
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  await gridUtil.validate(view, { isCheckedOnly: true });

  await dataService.post('sms/wells/service/paid-as-costs', chkRows);
  notify(t('MSG_ALT_SAVE_DATA'));

  await fetchData();
}

function onClickReset() {
  searchConditionReset();
}

onMounted(async () => {
  if (!isEmpty(searchParams.value.hgrPdCd)) {
    await onChangeHgrPdCd();
  }
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' }, // SAP코드
    { fieldName: 'pdCd' }, // 품목코드
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'apyStrtdt' }, // 적용시작일
    { fieldName: 'apyEnddt' }, // 적용종료일
    { fieldName: 'csmrUprcAmt', dataType: 'number' }, // 소비자가
    { fieldName: 'whlsUprcAmt', dataType: 'number' }, // 도매단가
    { fieldName: 'insiUprcAmt', dataType: 'number' }, // 내부단가
    { fieldName: 'tcfeeAmt', dataType: 'number' }, // 기술료
    { fieldName: 'sumAmt', dataType: 'number' }, // 합계(소비자가+기술료)
    { fieldName: 'izSn' }, // 내역일련번호
    { fieldName: 'basePdCd' }, // 사용자재상품코드
    { fieldName: 'useMatPdCd' },
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '200', styleName: 'text-center', editable: false }, // SAP코드
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center', editable: false }, // 품목코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '350', styleName: 'text-center', editable: false }, // 상품명
    { fieldName: 'apyStrtdt', header: t('MSG_TXT_APY_STRT_DAY'), width: '150', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 적용시작일
    { fieldName: 'apyEnddt', header: t('MSG_TXT_APY_END_DAY'), width: '150', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 적용종료일
    { fieldName: 'csmrUprcAmt',
      header: t('MSG_TXT_CSPRC'),
      width: '100',
      editor: {
        type: 'number',
        inputCharacters: '0-9',
      },
      styleName: 'text-center',
    }, // 소비자가
    { fieldName: 'whlsUprcAmt',
      header: t('MSG_TXT_WHLS_UPRC'),
      width: '100',
      editor: {
        type: 'number',
        inputCharacters: '0-9',
      },
      styleName: 'text-center',
    }, // 도매단가
    { fieldName: 'insiUprcAmt',
      header: t('MSG_TXT_INSI_UPRC'),
      width: '100',
      editor: {
        type: 'number',
        inputCharacters: '0-9',
      },
      styleName: 'text-center',
    }, // 내부단가
    { fieldName: 'tcfeeAmt',
      header: t('MSG_TXT_TCFEE'),
      width: '100',
      editor: {
        type: 'number',
        inputCharacters: '0-9',
      },
      styleName: 'text-center',
    }, // 기술료
    { fieldName: 'sumAmt',
      header: t('MSG_TXT_SUM_CSPRC_TCFEE'),
      width: '200',
      styleName: 'text-center',
      editable: false,
      displayCallback(grid, index) {
        const { csmrUprcAmt, tcfeeAmt } = grid.getValues(index.itemIndex);

        if (!isEmpty(csmrUprcAmt) && !isEmpty(tcfeeAmt)) { return parseInt(csmrUprcAmt, 10) + parseInt(tcfeeAmt, 10); }
        if (!isEmpty(csmrUprcAmt)) { return parseInt(csmrUprcAmt, 10); }
        if (!isEmpty(tcfeeAmt)) { return parseInt(tcfeeAmt, 10); }
      },
    }, // 합계(소비자가+기술료)
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.editOptions.editable = true;
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellEditable = (grid, itemIndex) => {
    const { izSn, basePdCd, useMatPdCd } = gridUtil.getRowValue(grid, itemIndex.dataRow);
    if ((isEmpty(izSn) || isEmpty(basePdCd) || isEmpty(useMatPdCd))
    && ['csmrUprcAmt', 'whlsUprcAmt', 'insiUprcAmt', 'tcfeeAmt', 'apyStrtdt', 'apyEnddt'].includes(itemIndex.column)) {
      return false;
    }
  };

  view.setCheckableCallback((dataSource, item) => {
    const { izSn, basePdCd, useMatPdCd } = gridUtil.getRowValue(view, item.dataRow);

    if (isEmpty(izSn) || isEmpty(basePdCd) || isEmpty(useMatPdCd)) {
      return false;
    }
    return true;
  });
});
</script>
