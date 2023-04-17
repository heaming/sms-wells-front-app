<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaMutualAidAllianceOrderListM - 상조제휴주문 조회
3. 작성자 : gs.ritvik.m
4. 작성일 : 2023.03.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상조제휴주문 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_PERF_YM')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_DV')"
          required
        >
          <kw-option-group
            v-model="searchParams.typeA"
            type="radio"
            :options="[{ codeId: '0', codeName: $t('MSG_TXT_RCP') },
                       { codeId: '1', codeName: $t('MSG_TXT_CNTRCT') },
                       { codeId: '2', codeName: $t('MSG_TXT_CANCEL') }]"
            rules="required"
            :label="$t('MSG_TXT_PERF_DV')"
          />
        </kw-search-item>
        <kw-search-item label="$t('MSG_TXT_ALNC_DV')">
          <kw-option-group
            v-model="searchParams.typeB"
            type="radio"
            :options="[{ codeId: '', codeName: $t('MSG_TXT_ALL') },
                       { codeId: '1', codeName: $t('MSG_TXT_ALNC') },
                       { codeId: '2', codeName: $t('MSG_TXT_UNF') }]"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_RSB_TP')"
          required
        >
          <kw-option-group
            v-model="searchParams.typeC"
            type="radio"
            rules="required"
            :options="[{ codeId: '', codeName: $t('MSG_TXT_ALL') },
                       { codeId: '1', codeName: $t('MSG_TXT_PLAR') },
                       { codeId: '2', codeName: $t('MSG_TXT_BRMGR') }]"
            :label="$t('MSG_TXT_RSB_TP')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.levelA"
            :options="codes.COD_YN"
            first-option="select"
          />
          <kw-select
            v-model="searchParams.levelB"
            :options="codes.COD_YN.filter((code) => code.prtsCodeId === searchParams.levelA)"
            first-option="select"
          />
          <kw-select
            v-model="searchParams.levelC"
            :options="codes.COD_YN.filter((code) => code.prtsCodeId === searchParams.levelB)"
            first-option="select"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.userName"
            icon="search"
            clearable
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
            @click-icon="onClickSeachItem"
            @clear="onClearSearchItem"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">({{ $t('MSG_TXT_UNIT') }}) : ({{ $t('MSG_TXT_CUR_WON') }})</span>
        </template>

        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="(totalCount === 0)"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="3"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, defineGrid, gridUtil, useDataService, codeUtil, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const now = dayjs();
const { t } = useI18n();
const { modal } = useGlobal();
const { currentRoute } = useRouter();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdRef = ref(getComponentType('KwGrid'));
const grdData = computed(() => grdRef.value?.getData());
const totalCount = ref(0);
const codes = await codeUtil.getMultiCodes(
  'COD_YN',
);

let cachedParams;
const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  typeA: '0',
  typeB: '',
  typeC: '',
  levelA: '',
  levelB: '',
  levelC: '',
  userId: '',
  userName: '',
});

// 데이터 조회
async function fetchData() {
  const { data } = await dataService.get('API정의안됨', { params: { ...cachedParams } });
  grdData.value.setRows(data);
  totalCount.value = data.length;
}
// 조회버튼
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdData.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}
// 조회조건 돋보기 관련
async function onClickSeachItem() {
  const { result, payload } = await modal({ component: 'ZwcmzSingleSelectUserListP' });
  if (result) {
    searchParams.value.userId = payload.userId;
    searchParams.value.userName = payload.userName;
  }
}
async function onClearSearchItem() {
  searchParams.value.userId = '';
  searchParams.value.userName = '';
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'col1', header: t('MSG_TXT_ALNC_DV'), width: '91', styleName: 'text-center' },
    { fieldName: 'col2', header: `Wells ${t('MSG_TXT_CNTR_NO')}`, width: '138', styleName: 'text-center' },
    { fieldName: 'col3', header: `${t('MSG_TXT_MUTU')} ${t('MSG_TXT_CNTR_NO')}`, width: '138', styleName: 'text-center' },
    { fieldName: 'col4', header: t('MSG_TXT_CST_NM'), width: '111', styleName: 'text-left ' },
    { fieldName: 'col5', header: t('MSG_TXT_BLG'), width: '104', styleName: 'text-center' },
    { fieldName: 'col6', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '111', styleName: 'text-center' },
    { fieldName: 'col7', header: t('MSG_TXT_EMPL_NM'), width: '111', styleName: 'text-left' },
    { fieldName: 'col8', header: t('MSG_TXT_RSB'), width: '111', styleName: 'text-left' },
    { fieldName: 'col9', header: t('MSG_TXT_BRMGR'), width: '111', styleName: 'text-center ' },
    { fieldName: 'col10', header: t('MSG_TXT_RECPETN_DT'), width: '111', styleName: 'text-center ' },
    { fieldName: 'col11', header: t('MSG_TXT_CNTRCT_DT'), width: '111', styleName: 'text-center ' },
    { fieldName: 'col12', header: t('MSG_TXT_DEP_DT'), width: '111', styleName: 'text-center' },
    { fieldName: 'col13', header: t('MSG_TXT_WTH_DT'), width: '111', styleName: 'text-center' },
    { fieldName: 'col14', header: t('MSG_TXT_CAN_D'), width: '111', styleName: 'text-center' },
    { fieldName: 'col15', header: t('MSG_TXT_FEE_MN'), width: '111', styleName: 'text-center' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  data.setRows([
    { col1: '비제휴', col2: '2022-5559710', col3: '2022-5559710', col4: '김고객', col5: 'Q831234', col6: '1234567', col7: '김교원', col8: '플래너', col9: '1234567', col10: '2022-10-12', col11: '-', col12: '-', col13: '-', col14: '-', col15: '-' },
    { col1: '비제휴', col2: '2022-5559710', col3: '2022-5559710', col4: '김고객', col5: 'Q831234', col6: '1234567', col7: '김교원', col8: '플래너', col9: '1234567', col10: '2022-10-12', col11: '-', col12: '-', col13: '-', col14: '-', col15: '-' },
    { col1: '비제휴', col2: '2022-5559710', col3: '2022-5559710', col4: '김고객', col5: 'Q831234', col6: '1234567', col7: '김교원', col8: '플래너', col9: '1234567', col10: '2022-10-12', col11: '-', col12: '-', col13: '-', col14: '-', col15: '-' },
  ]);
});
</script>
