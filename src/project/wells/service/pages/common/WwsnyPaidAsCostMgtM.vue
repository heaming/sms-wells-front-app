<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNY
2. 프로그램 ID : WwsnyPaidAsServiceCostMgtM  - [W-SV-U-0159M01]유상A/S 서비스비용 관리
3. 작성자 : kyunglyn.lee
4. 작성일 : 2023.03.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 유상A/S 서비스비용 관리 (http://localhost:3000/#/service/wwsny-paid-as-cost-mgt)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            @change="changePdGrpCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_NM')"
        >
          <!--            rules="required"-->
          <kw-select
            v-model="searchParams.pdCd"
            :options="pds"
            first-option="all"
            option-label="cdNm"
            option-value="cd"
            :disable="searchParams.pdGrpCd === '' "
            :label="$t('MSG_TXT_PRDT_NM')"
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
          v-permission:update
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
          v-permission:download
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
import smsCommon from '~sms-wells/service/composables/useSnCode';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();
const { getPartMaster } = smsCommon();

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
  pdNm: '',
  cmnPartChk: 'N',
  apyMtrChk: 'N',
  applyDate: now.format('YYYYMMDD'),
});

let cachedParams;

const pds = ref([]);
async function changePdGrpCd() {
  if (searchParams.value.pdGrpCd) {
    pds.value = await getPartMaster(
      '4',
      searchParams.value.pdGrpCd,
      'M',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      'X', /* 단종여부Y/N, 만약 X로 데이터가 유입되면 단종여부를 조회하지 않음 */
    );
  } else pds.value = [];
  searchParams.value.pdCd = '';
}
changePdGrpCd();

const isHgrPdCd = ref(false);

watch(() => searchParams.value.pdGrpCd, (val) => {
  if (!isEmpty(val) && Number(val) > 9) {
    isHgrPdCd.value = true;
    searchParams.value.cmnPartChk = 'N';
  } else {
    isHgrPdCd.value = false;
  }

  if (searchParams.value.pdGrpCd !== val) {
    searchParams.value.pdGrpCd = val;
  }
  changePdGrpCd();
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/paid-as-costs/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: recapitalizationAsSvCs, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  // if (pageInfo.value.totalCount === 0) {
  //   pageInfo.value.pageSize = 10;
  // } else {
  //   pageInfo.value.pageSize = Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE'));
  // }

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(recapitalizationAsSvCs);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
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
  searchParams.value.pdGrpCd = '';
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
  if (!isEmpty(searchParams.value.pdGrpCd)) {
    await changePdGrpCd();
  }
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapMatCd' }, // SAP코드
    { fieldName: 'useMatPdCd' }, // 품목코드
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'apyStrtdt' }, // 적용시작일
    { fieldName: 'apyEnddt' }, // 적용종료일
    { fieldName: 'csmrUprcAmt', dataType: 'number' }, // 소비자가
    { fieldName: 'whlsUprcAmt', dataType: 'number' }, // 도매단가
    { fieldName: 'insiUprcAmt', dataType: 'number' }, // 내부단가
    { fieldName: 'tcfeeAmt', dataType: 'number' }, // 기술료
    { fieldName: 'sumAmt', dataType: 'number' }, // 합계(소비자가+기술료)
    { fieldName: 'izSn' }, // 내역일련번호
    { fieldName: 'pdctPdCd' }, // 사용자재상품코드
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '200', styleName: 'text-center', editable: false }, // SAP코드
    { fieldName: 'useMatPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center', editable: false }, // 품목코드
    { fieldName: 'pdNm',
      header: t('MSG_TXT_PRDT_NM'),
      width: '350',
      styleName: 'text-left',
      editable: false }, // 상품명
    { fieldName: 'apyStrtdt', header: t('MSG_TXT_APY_STRT_DAY'), width: '150', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 적용시작일
    { fieldName: 'apyEnddt', header: t('MSG_TXT_APY_END_DAY'), width: '150', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 적용종료일
    { fieldName: 'csmrUprcAmt',
      header: t('MSG_TXT_CSPRC'),
      width: '100',
      editor: {
        type: 'number',
        maxLength: 8,
        inputCharacters: '0-9',
      },
      styleName: 'text-right',
    }, // 소비자가
    { fieldName: 'whlsUprcAmt',
      header: t('MSG_TXT_WHLS_UPRC'),
      width: '100',
      editor: {
        type: 'number',
        maxLength: 8,
        inputCharacters: '0-9',
      },
      styleName: 'text-right',
    }, // 도매단가
    { fieldName: 'insiUprcAmt',
      header: t('MSG_TXT_INSI_UPRC'),
      width: '100',
      editor: {
        type: 'number',
        maxLength: 8,
        inputCharacters: '0-9',
      },
      styleName: 'text-right',
    }, // 내부단가
    { fieldName: 'tcfeeAmt',
      header: t('MSG_TXT_TCFEE'),
      width: '100',
      editor: {
        type: 'number',
        maxLength: 8,
        inputCharacters: '0-9',
      },
      styleName: 'text-right',
    }, // 기술료
    { fieldName: 'sumAmt',
      header: t('MSG_TXT_SUM_CSPRC_TCFEE'),
      width: '200',
      styleName: 'text-right',
      editable: false,
      // displayCallback(grid, index, val) {
      //   const { csmrUprcAmt, tcfeeAmt } = grid.getValues(index.itemIndex);
      //   if (csmrUprcAmt + tcfeeAmt) { return val; }
      // },
    }, // 합계(소비자가+기술료)
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.editOptions.editable = true;
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellEditable = (grid, itemIndex) => {
    const { izSn, pdctPdCd, useMatPdCd } = gridUtil.getRowValue(grid, itemIndex.dataRow);
    if ((isEmpty(izSn) || isEmpty(pdctPdCd) || isEmpty(useMatPdCd))
    && ['csmrUprcAmt', 'whlsUprcAmt', 'insiUprcAmt', 'tcfeeAmt', 'apyStrtdt', 'apyEnddt'].includes(itemIndex.column)) {
      return false;
    }
  };

  view.onGetEditValue = (grd, idx, editResult) => {
    if (idx.fieldName === 'csmrUprcAmt' || idx.fieldName === 'tcfeeAmt') {
      grd.checkItem(idx.itemIndex, true);

      if (idx.fieldName === 'csmrUprcAmt') {
        grd.setValue(idx.dataRow, 'csmrUprcAmt', editResult.value);
      } else if (idx.fieldName === 'tcfeeAmt') {
        grd.setValue(idx.dataRow, 'tcfeeAmt', editResult.value);
      }

      const { csmrUprcAmt, tcfeeAmt } = grd.getValues(idx.dataRow);
      grd.setValue(idx.dataRow, 'sumAmt', csmrUprcAmt + tcfeeAmt);
    }
  };

  view.setCheckableCallback((dataSource, item) => {
    const { izSn, pdctPdCd, useMatPdCd } = gridUtil.getRowValue(view, item.dataRow);

    if (isEmpty(izSn) || isEmpty(pdctPdCd) || isEmpty(useMatPdCd)) {
      return false;
    }
    return true;
  });
});
</script>
