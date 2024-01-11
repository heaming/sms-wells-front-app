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
          required
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            :label="$t('MSG_TXT_PD_GRP')"
            rules="required"
            @change="changePdGrpCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_NM')"
          required
        >
          <kw-select
            v-model="searchParams.pdCd"
            :options="pds"
            first-option="select"
            option-label="cdNm"
            option-value="cd"
            rules="required"
            :label="$t('MSG_TXT_PRDT_NM')"
          />
        </kw-search-item>
        <!-- 자재구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_MAT_DV')"
        >
          <kw-field
            :model-value="['Y', 'N']"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                v-model="searchParams.cmnPartChk"
                :label="$t('MSG_TXT_CMN_PART')"
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
            :total-count="pageInfo.totalCount"
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
          :max-date="maxDate"
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
            :model-value="['Y', 'N']"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                v-model="searchParams.apyMtrChk"
                :label="$t('MSG_TXT_CRTL_APY_MTR')"
                @update:model-value="onChangeFilterApyDt"
              />
            </template>
          </kw-field>
        </li>
      </ul>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
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
  notify, alert,
} from 'kw-lib';
import smsCommon from '~sms-wells/service/composables/useSnCode';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const { getPartMaster } = smsCommon();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'PD_GRP_CD',
);

const pageInfo = ref({
  totalCount: 0,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const now = dayjs();
const curDt = now.format('YYYYMMDD');
const maxDate = now.format('YYYY-MM-DD');

const chgApyDt = ref({
  apyStrtdt: curDt,
  apyEnddt: '99991231',
});

/* 조회조건 */
const searchParams = ref({
  pdGrpCd: '1',
  pdCd: '',
  cmnPartChk: 'N',
  apyMtrChk: 'N',
});

let cachedParams;

const pds = ref([]);
// 상품그룹 변경 시
async function changePdGrpCd() {
  pds.value = [];
  searchParams.value.pdCd = '';

  const { pdGrpCd } = searchParams.value;
  const products = await getPartMaster(
    '4',
    pdGrpCd,
    'M',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    'Y',
  );

  pds.value = products;

  if (!isEmpty(products)) {
    searchParams.value.pdCd = products[0].cd;
  }
}

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/paid-as-costs', { params: { ...cachedParams } });
  pageInfo.value.totalCount = res.data.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
}

// 현재적용자재 체크 시
async function onChangeFilterApyDt() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 조회버튼 클릭 시
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 엑셀 다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

// 적용일자 일괄변경
async function onClickApplyDateBulkChange() {
  const { apyStrtdt, apyEnddt } = chgApyDt.value;
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (isEmpty(chkRows)) {
    // 일괄변경할 데이터를 선택하세요.
    notify(t('MSG_ALT_CHG_HLDY_DATA'));
    return;
  }

  // 적용시작일자가 없는 경우
  if (isEmpty(apyStrtdt)) {
    notify(t('MSG_ALT_CHK_NCSR', [t('MSG_TXT_APY_STRTDT')]));
    return;
  }

  const data = grdMainRef.value.getData();

  let cnt = 0;
  for (let i = 0; i < chkRows.length; i += 1) {
    const rn = data.getValue(chkRows[i].dataRow, 'rn');
    const orgApyStrtdt = data.getValue(chkRows[i].dataRow, 'orgApyStrtdt');

    // 마지막 데이터만 적용일자를 수정할 수 있음.
    if (rn === '1' && (!orgApyStrtdt || isEmpty(orgApyStrtdt) || orgApyStrtdt < apyStrtdt)) {
      data.setValue(chkRows[i].dataRow, 'apyStrtdt', apyStrtdt);
      data.setValue(chkRows[i].dataRow, 'apyEnddt', apyEnddt);
      cnt += 1;
    }
  }
  if (cnt > 0) {
    notify(t('MSG_ALT_BULK_APPLY_SUCCESS', [t('MSG_TXT_APY_STRTDT')]));
  } else {
    // 적용시작일이 변경되지 않았습니다. 적용시작일을 확인하시기 바랍니다.
    notify(t('MSG_ALT_APY_STRT_D_CH_NCST'));
  }
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);

  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  let valid = false;
  // 유효성체크
  if (!await gridUtil.validate(view, { isCheckedOnly: true })) return;
  chkRows.forEach((e) => {
    const { apyStrtdt, apyEnddt } = e;
    if (isEmpty(apyStrtdt) || isEmpty(apyEnddt)) {
      valid = true;
      return false;
    }
  });

  if (valid) {
    // {0}은(는) 필수 항목입니다.
    await alert(`${t('MSG_TXT_APY_STRTDT')} ${t('MSG_ALT_NCELL_REQUIRED_ITEM')}`);
    return;
  }

  const res = await dataService.post('sms/wells/service/paid-as-costs', chkRows);
  const { processCount } = res.data;
  if (processCount > 0) {
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

// 초기화 버튼 클릭
async function onClickReset() {
  await changePdGrpCd();
}

onMounted(async () => {
  // 상품그룹에 해당하는 품목 리스트 조회
  await changePdGrpCd();
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
    { fieldName: 'orgApyStrtdt' }, // 변경전 적용시작일
    { fieldName: 'orgApyEnddt' }, // 변경전 적용종료일
    { fieldName: 'pdctPdCd' }, // 기준상품코드
    { fieldName: 'rn' }, // 순번
  ];

  const columns = [
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAP_CD'), width: '100', styleName: 'text-center', editable: false }, // SAP코드
    { fieldName: 'useMatPdCd', header: t('MSG_TXT_ITM_CD'), width: '130', styleName: 'text-center', editable: false }, // 품목코드
    { fieldName: 'pdNm',
      header: t('MSG_TXT_PRDT_NM'),
      width: '350',
      styleName: 'text-left',
      editable: false }, // 상품명
    { fieldName: 'apyStrtdt', header: t('MSG_TXT_APY_STRT_DAY'), width: '150', styleName: 'text-center', datetimeFormat: 'date', editable: false, rules: 'required' }, // 적용시작일
    { fieldName: 'apyEnddt', header: t('MSG_TXT_APY_END_DAY'), width: '150', styleName: 'text-center', datetimeFormat: 'date', editable: false, rules: 'required' }, // 적용종료일
    { fieldName: 'csmrUprcAmt',
      header: t('MSG_TXT_CSPRC'),
      width: '100',
      rules: 'min_value:0|max_value:99999999',
      editor: {
        type: 'number',
        editFormat: '#,##0',
      },
      dataType: 'number',
      styleName: 'text-right',
    }, // 소비자가
    { fieldName: 'whlsUprcAmt',
      header: t('MSG_TXT_WHLS_UPRC'),
      width: '100',
      rules: 'min_value:0|max_value:99999999',
      editor: {
        type: 'number',
        editFormat: '#,##0',
      },
      dataType: 'number',
      styleName: 'text-right',
    }, // 도매단가
    { fieldName: 'insiUprcAmt',
      header: t('MSG_TXT_INSI_UPRC'),
      width: '100',
      rules: 'min_value:0|max_value:99999999',
      editor: {
        type: 'number',
        editFormat: '#,##0',
      },
      dataType: 'number',
      styleName: 'text-right',
    }, // 내부단가
    { fieldName: 'tcfeeAmt',
      header: t('MSG_TXT_TCFEE'),
      width: '100',
      rules: 'min_value:0|max_value:99999999',
      editor: {
        type: 'number',
        editFormat: '#,##0',
      },
      dataType: 'number',
      styleName: 'text-right',
    }, // 기술료
    { fieldName: 'sumAmt',
      header: t('MSG_TXT_SUM_CSPRC_TCFEE'),
      width: '200',
      styleName: 'text-right',
      editable: false,
    }, // 합계(소비자가+기술료)
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.editOptions.editable = true;
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.filteringOptions.enabled = false;

  // 소비자가, 도매단가, 내부단가, 기술료 수정로직
  view.onCellEditable = (grid, itemIndex) => {
    const { rn } = gridUtil.getRowValue(grid, itemIndex.dataRow);
    if (['csmrUprcAmt', 'whlsUprcAmt', 'insiUprcAmt', 'tcfeeAmt'].includes(itemIndex.column) && rn === '1') {
      return true;
    }
    return false;
  };

  // 합계(소비자가 + 기술료) 컬럼 계산 및 값 자동 반영 로직
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
    const { rn } = gridUtil.getRowValue(view, item.dataRow);

    // 마지막 데이터인 경우
    if (rn === '1') {
      return true;
    }
    return false;
  }, true);
});
</script>
