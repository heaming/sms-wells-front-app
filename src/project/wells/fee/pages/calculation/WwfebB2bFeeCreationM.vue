<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfebB2bFeeCreationM - B2B 수수료 생성관리
3. 작성자 : gs.nidhi.d
4. 작성일 : 2023.03.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- B2B 수수료 생성관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_DIV')"
          required
        >
          <kw-option-group
            v-model="searchParams.type"
            type="radio"
            rules="required"
            :label="t('MSG_TXT_DIV')"
            :options="[{codeId: 'A', codeName: '수수료실적'},
                       {codeId: 'B', codeName: '기본 수수료'}]"
          />
        </kw-search-item>
        <kw-search-item
          v-if="searchParams.type === 'A'"
          :label="t('MSG_TXT_RCP_YM')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.strtdt"
            v-model:to="searchParams.enddt"
            type="month"
            rules="date_range_required|date_range_months:1"
            :label="t('MSG_TXT_RCP_YM')"
          />
        </kw-search-item>

        <kw-search-item
          :label="t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            :label="t('MSG_TXT_PERF_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row
        v-if="searchParams.type === 'A'"
      >
        <kw-search-item
          :label="t('MSG_TXT_CANCEL_YM')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.cancelStrtdt"
            v-model:to="searchParams.cancelEnddt"
            type="month"
            rules="date_range_months:1"
            :label="t('MSG_TXT_CANCEL_YM')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <h3>{{ searchParams.baseYm }} {{ $t('MSG_TXT_TOT_FEE_CRT_PRGS_STE') }}</h3>
        </template>
      </kw-action-top>
      <kw-stepper
        v-model="stepInitNum"
        alternative-labels
      >
        <kw-step
          :name="1"
          :title="$t('MSG_TXT_PERF_AGRG')"
          :done="stepInitNum > 1"
          prefix="1"
          :done-icon="'retry'"
          @click="onClickRetry"
        />
        <kw-step
          :name="2"
          :title="$t('MSG_TIT_FEE_CRT')"
          :done="stepInitNum > 2"
          prefix="2"
          :active-icon="'write'"
          :tooltip="$t('MSG_TXT_CLICK_PRGS', [t('MSG_TIT_CRT_FEE')])"
          @click="onClickCreate"
        />
        <kw-step
          :name="3"
          :title="$t('MSG_TXT_GRNT_DEP_ERN')"
          :done="stepInitNum > 3"
          prefix="3"
        />
      </kw-stepper>
      <kw-action-top class="mt40">
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>
        <kw-btn
          dense
          secondary
          :label="$t('MSG_BTN_HIS_MGT')"
          @click="onClickHistory"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="(totalCount === 0)"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-if="grdType === 'B'"
          :label="$t('MSG_TXT_SAVE')"
          primary
          dense
          @click="onClickSave"
        />
      </kw-action-top>
      <kw-grid
        v-if="grdType === 'A'"
        ref="grdRefA"
        @init="initGridDetail"
      />
      <kw-grid
        v-if="grdType === 'B'"
        ref="grdRefB"
        @init="initGridBase"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, gridUtil, getComponentType, useDataService, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty, cloneDeep } from 'lodash-es';

const dataService = useDataService();
const now = dayjs();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { notify, confirm, modal } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRefA = ref(getComponentType('KwGrid'));
const grdDataA = computed(() => grdRefA.value?.getData());
const grdRefB = ref(getComponentType('KwGrid'));
const grdDataB = computed(() => grdRefB.value?.getData());
const totalCount = ref(0);
const grdType = ref('A');
const stepInitNum = ref(2);

let cachedParams;
const searchParams = ref({
  type: 'A',
  strtdt: now.format('YYYYMMDD'),
  enddt: now.add(1, 'month').format('YYYYMMDD'),
  baseYm: now.format('YYYYMM'),
  cancelStrtdt: now.format('YYYYMMDD'),
  cancelEnddt: now.add(1, 'month').format('YYYYMMDD'),
});

// 데이터 조회
async function fetchData() {
  const { data } = await dataService.get('API정의안됨', { params: { ...cachedParams } });
  if (cachedParams.type === 'A') {
    grdDataA.value.setRows(data);
  } else {
    grdDataB.value.setRows(data);
  }
  stepInitNum.value = data.baseInfo.step;
  totalCount.value = data.list.length;
}
// 조회 버튼
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  grdType.value = searchParams.value.type;
  await fetchData();
}

// 엑셀 다운로드 버튼
async function onClickExcelDownload() {
  const view = cachedParams.type === 'A' ? grdRefA.value.getView() : grdRefB.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}
// 이력관리 버튼 클릭
async function onClickHistory() {
  console.log('Z-CO-U-0034P09');
}
// 저장
async function onClickSave() {
  const view = grdRefB.value.getView();
  // 편집여부
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  // 필수여부
  if (!await gridUtil.validate(view)) { return; }
  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/common/fee/schedules/steps', { changedRows });
  await notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}
// 수수료 생성 버튼
async function onClickCreate() {
  const { result: isChanged, payload } = await modal({
    component: 'WwfebB2bFeeCreationRegP',
    componentProps: {
      type: searchParams.value.type,
    },
  });
  if (isChanged) {
    if (!isEmpty(payload.rtnKey)) {
      onClickSearch();
    }
  }
}
// 실적집계 재시작
async function onClickRetry() {
  if (await confirm(t('MSG_ALT_LV_RESRT'))) {
    console.log('api 미정의');
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridDetail = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CORP_NAME'), width: '127' },
    { fieldName: 'col2', header: t('MSG_TXT_SELLER_PERSON'), width: '98' },
    { fieldName: 'col3', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '127', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_CNTR_DTL_NO'), width: '151', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_CUST_STMT'), width: '98' },
    { fieldName: 'col6', header: t('MSG_TXT_PRDT_CODE'), width: '106', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_PRDT_NM'), width: '210' },
    { fieldName: 'col8', header: t('MSG_TXT_PD_DC_CLASS'), width: '98' },
    { fieldName: 'col9', header: t('MSG_TXT_DISC_CODE'), width: '98' },
    { fieldName: 'col10', header: t('MSG_TXT_DSC_SYST'), width: '98', styleName: 'text-right' },
    { fieldName: 'col11', header: t('MSG_TXT_COMBI_DV'), width: '98' },
    { fieldName: 'col12', header: t('MSG_TXT_USWY_DV'), width: '98' },
    { fieldName: 'col13', header: t('MSG_TXT_MGT_TYP'), width: '98' },
    { fieldName: 'col14', header: t('MSG_TXT_VST_PRD'), width: '98' },
    { fieldName: 'col15', header: t('MSG_TXT_RCPDT'), width: '127', styleName: 'text-center' },
    { fieldName: 'col16', header: t('MSG_TXT_SL_DT'), width: '127', styleName: 'text-center' },
    { fieldName: 'col17', header: t('MSG_TXT_CANC_DT'), width: '127', styleName: 'text-center' },
    { fieldName: 'col18', header: t('MSG_TXT_FEE'), width: '127', styleName: 'text-right' },
    { fieldName: 'col19', header: t('MSG_TXT_NUM_OF_NEW_CASES'), width: '92', styleName: 'text-right' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { col1: 'Z950010', col2: '다온홈시', col3: '총판10', col4: '1607624', col5: '2022-4640868', col6: '홍길동', col7: '4512', col8: 'WN652NWR', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2-업소', col15: '3', col16: '22-10-24', col17: '22-10-24', col18: '22-10-25', col19: '123,450' },
    { col1: 'Z950010', col2: '다온홈시', col3: '총판10', col4: '1607624', col5: '2022-4640868', col6: '홍길동', col7: '4512', col8: 'WN652NWR', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2-업소', col15: '3', col16: '22-10-24', col17: '22-10-24', col18: '22-10-25', col19: '123,450' },
    { col1: 'Z950010', col2: '다온홈시', col3: '총판10', col4: '1607624', col5: '2022-4640868', col6: '홍길동', col7: '4512', col8: 'WN652NWR', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2-업소', col15: '3', col16: '22-10-24', col17: '22-10-24', col18: '22-10-25', col19: '123,450' },
    { col1: 'Z950010', col2: '다온홈시', col3: '총판10', col4: '1607624', col5: '2022-4640868', col6: '홍길동', col7: '4512', col8: 'WN652NWR', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2-업소', col15: '3', col16: '22-10-24', col17: '22-10-24', col18: '22-10-25', col19: '123,450' },
    { col1: 'Z950010', col2: '다온홈시', col3: '총판10', col4: '1607624', col5: '2022-4640868', col6: '홍길동', col7: '4512', col8: 'WN652NWR', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2-업소', col15: '3', col16: '22-10-24', col17: '22-10-24', col18: '22-10-25', col19: '123,450' },
    { col1: 'Z950010', col2: '다온홈시', col3: '총판10', col4: '1607624', col5: '2022-4640868', col6: '홍길동', col7: '4512', col8: 'WN652NWR', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2-업소', col15: '3', col16: '22-10-24', col17: '22-10-24', col18: '22-10-25', col19: '123,450' },
  ]);
});

const initGridBase = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_CORP_NAME'), width: '127' },
    { fieldName: 'col2', header: t('MSG_TXT_BLG'), width: '98' },
    { fieldName: 'col3', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '127', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_PERF'), width: '151', styleName: 'text-center' },
    { fieldName: 'col5', header: t('MSG_TXT_BAS_FEE'), width: '98', styleName: 'text-right' },
    { fieldName: 'col6', header: t('MSG_TXT_MED_FEE'), width: '98', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_PMOT'), width: '98', styleName: 'text-right' },
    { fieldName: 'col8', header: t('MSG_TXT_ADSB'), width: '98', styleName: 'text-right' },
    { fieldName: 'col9', header: t('MSG_TXT_ICT'), width: '98', styleName: 'text-right' },
    { fieldName: 'col10', header: t('MSG_TXT_FEE_SUM'), width: '98', styleName: 'text-right' },
    { fieldName: 'col11', header: t('MSG_TXT_RDS'), width: '98', styleName: 'text-right' },
    { fieldName: 'col12', header: t('MSG_TXT_RDS_MDFC_RSON'), width: '150', styleName: 'text-right' },
    { fieldName: 'col13', header: t('MSG_TXT_RE_REDF'), width: '98', styleName: 'text-right' },
    { fieldName: 'col14', header: t('MSG_TXT_DDTN_SUM'), width: '98', styleName: 'text-right' },
    { fieldName: 'col15', header: t('MSG_TXT_ACL_DSB_AMT'), width: '98', styleName: 'text-right' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setColumnLayout([
    'col1', 'col2', 'col3', 'col4',
    {
      header: t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['col5', 'col6', 'col7', 'col8', 'col9', 'col10'],
    },
    {
      header: t('MSG_TXT_DDTN'),
      direction: 'horizontal',
      items: ['col11', 'col12', 'col13', 'col14'],
    },
    'col15',
  ]);
  data.setRows([
    { col1: 'Z950010', col2: '다온홈시', col3: '11111', col4: '1607624', col5: '20222424', col6: '2323', col7: '4512', col8: '232', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2', col15: '5555' },
    { col1: 'Z950010', col2: '다온홈시', col3: '11111', col4: '1607624', col5: '20222424', col6: '2323', col7: '4512', col8: '232', col9: '3', col10: '6', col11: '3', col12: '18', col13: '2', col14: '2', col15: '5555' },
  ]);
});

</script>
