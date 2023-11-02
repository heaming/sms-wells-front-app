<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSD
2. 프로그램 ID : WpsdExcellentDivisionTrgBaseMgtM
3. 작성자 : Park Yesol
4. 작성일 : 2023.09.21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 우수사업부 기준관리 - 목표기준관리
****************************************************************************************************
-->

<template>
  <kw-search
    :cols="3"
    @search="onClickEvlSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="t('MSG_TXT_OG_TP')"
        required
      >
        <kw-select
          v-model="trgSearchParams.evlOgTpCd"
          :label="t('MSG_TXT_OG_TP')"
          :options="codes.EVL_OG_TP_CD"
          rules="required"
          first-option="select"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_MGT_YNM')"
        required
      >
        <kw-date-picker
          v-model="trgSearchParams.baseYm"
          :label="t('MSG_TXT_EDUC_YM')"
          type="month"
          rules="required"
        />
      </kw-search-item>
      <kw-search-item
        :label="t('MSG_TXT_AWD_DV')"
      >
        <kw-select
          v-model="trgSearchParams.evlDvCd"
          :options="evlDvList"
          first-option="select"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>
  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="trgPageInfo.pageIndex"
          v-model:page-size="trgPageInfo.pageSize"
          :total-count="trgPageInfo.totalCount"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change="fetchData"
        />
      </template>
      <kw-btn
        v-permission:update
        :label="$t('MSG_BTN_SAVE')"
        grid-action
        dense
        @click="onClickTrgSave"
      />
    </kw-action-top>
    <kw-grid
      ref="trgGrdMainRef"
      name="trgGrdMain"
      :page-size="trgPageInfo.pageSize"
      :total-count="trgPageInfo.totalCount"
      :visible-rows="trgPageInfo.pageSize"
      @init="initTrgGrdMain"
    />
    <kw-pagination
      v-model:page-index="trgPageInfo.pageIndex"
      v-model:page-size="trgPageInfo.pageSize"
      :total-count="trgPageInfo.totalCount"
      @change="fetchData"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useGlobal, useDataService, getComponentType, codeUtil, useMeta, defineGrid, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { notify } = useGlobal();
const { getUserInfo } = useMeta();
const dataService = useDataService();
const userInfo = getUserInfo();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();
const trgGrdMainRef = ref(getComponentType('KwGrid'));
// 공통코드로딩
const codes = await codeUtil.getMultiCodes(
  'EVL_OG_TP_CD',
  'EVL_DV_CD',
  'EVL_RSB_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
);
const evlDvList = ref([]);
const trgSearchParams = ref({
  evlOgTpCd: userInfo.ogTpCd, // 조직유형
  evlDvCd: '',
  baseYm: now.format('YYYYMM'),
});
const trgPageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
});

let trgCachedParams;
const fetchData = async () => {
  const res = await dataService.get('/sms/wells/competence/excellent-division-base/target/paging', { params: { ...trgCachedParams, ...trgPageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;

  trgPageInfo.value = pagingResult;
  const view = trgGrdMainRef.value.getView();

  view.getDataSource().setRows(list);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(trgPageInfo);
};

const onClickEvlSearch = async () => {
  trgPageInfo.value.pageIndex = 1;
  // 자동완성 검색조건 설정
  trgCachedParams = cloneDeep(trgSearchParams.value);
  await fetchData();
};

const onClickTrgSave = async () => {
  const view = trgGrdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/competence/excellent-division-base/target', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
};

const evaluateResponsibilityCdChang = async () => {
  evlDvList.value = codes.EVL_DV_CD.filter((v) => [trgSearchParams.value.evlOgTpCd].includes(v.prtsCodeId));
};

watch(() => [trgSearchParams.value.evlOgTpCd], async () => {
  await evaluateResponsibilityCdChang();
});
onMounted(async () => {
  await evaluateResponsibilityCdChang();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
console.log(codes.EVL_DV_CD);
const initTrgGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'baseYm' },
    { fieldName: 'evlOgTpCd' },
    { fieldName: 'evlDvCd' },
    { fieldName: 'evlDvNm' },
    { fieldName: 'evlAtcDvCd' },
    { fieldName: 'evlAtcDvNm' },
    { fieldName: 'trgBasePc' },
    { fieldName: 'ctstGrpCd' },
    { fieldName: 'trgUseYn' },
  ];
  const columns = [
    { fieldName: 'evlDvNm', header: t('MSG_TXT_AWD_DV'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'evlAtcDvNm', header: t('MSG_TXT_EVL_BASE_DV'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'trgBasePc',
      header: t('MSG_TXT_TRG_PC'),
      width: '100',
      styleName: 'text-right',
      styleCallback(grid, dataCell) {
        const trgUseYn = grid.getValue(dataCell.item.dataRow, 'trgUseYn');
        return trgUseYn && trgUseYn === 'Y' ? { editable: true } : { editable: false };
      },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
});

</script>
