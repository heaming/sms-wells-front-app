<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSD
2. 프로그램 ID : WwpsdContestGroupRegP
3. 작성자 : Park Yesol
4. 작성일 : 2023.10.27.
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 경진조 등록 팝업
****************************************************************************************************
-->

<template>
  <kw-popup
    class="kw-popup--xl"
  >
    <kw-search
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_MGT_YNM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            :label="t('MSG_TXT_MGT_YNM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_OG_TP')"
          required
        >
          <kw-option-group
            v-model="searchParams.evlOgTpCd"
            type="radio"
            :label="t('MSG_TXT_OG_TP')"
            :options="codes.EVL_OG_TP_CD"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_EVL_DV_NM')"
          required
        >
          <kw-select
            v-model="searchParams.evlDvCd"
            :options="evlDvList"
            :label="t('MSG_TXT_EVL_DV_NM')"
            first-option="select"
            option-value="codeId"
            option-label="codeName"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_EVL_RSB')"
          required
        >
          <kw-select
            v-model="searchParams.evlRsbDvCd"
            :options="rsbList"
            :label="t('MSG_TXT_EVL_RSB')"
            rules="required"
            option-value="evlRsbDvCd"
            option-label="evlRsbDvNm"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_CTST_GRP')"
        >
          <kw-select
            v-model="searchParams.ctstGrpCd"
            :disable="(searchParams.evlDvCd==='M01'||searchParams.evlDvCd==='M02')"
            :options="ctstGrpCdList"
            first-option="select"
            option-value="ctstGrpCd"
            option-label="ctstGrpNm"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
        </template>
        <kw-btn
          v-permission:update
          :label="$t('MSG_BTN_SAVE')"
          grid-action
          dense
          @click="onClickSave"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
      />
    </div>
    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_CLOSE')"
        @click="onClickCancel"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, useModal, useGlobal, codeUtil, defineGrid, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { notify } = useGlobal();
const dataService = useDataService();
const { cancel: onClickCancel } = useModal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const ctstGrpCdList = ref([]);
const evlDvList = ref([]);
const rsbList = ref([]);
const props = defineProps({
  baseYm: { type: String, default: dayjs().format('YYYYMM') },
  evlOgTpCd: { type: String, default: '' },
  evlDvCd: { type: String, default: '' },
});

let cachedParams;
const searchParams = ref({
  baseYm: props.baseYm,
  evlOgTpCd: props.evlOgTpCd,
  evlDvCd: props.evlDvCd,
  evlRsbDvCd: '',
  ctstGrpCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
});

// 공통코드로딩
const codes = await codeUtil.getMultiCodes(
  'EVL_OG_TP_CD',
  'EVL_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

const fetchData = async () => {
  const res = await dataService.get('/sms/wells/competence/excellent-division/contest-responsibility', { params: { ...cachedParams, ...pageInfo.value } });
  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(res.data);
  view.resetCurrent();
  pageInfo.value.totalCount = res.data.length;
};

const onClickSearch = async () => {
  pageInfo.value.pageIndex = 1;
  // 자동완성 검색조건 설정
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
};

const evaluateResponsibilityCdChang = async () => {
  evlDvList.value = codes.EVL_DV_CD.filter((v) => [searchParams.value.evlOgTpCd].includes(v.prtsCodeId));
};

const getContestGroupFetchData = async () => {
  const res = await dataService.get('/sms/wells/competence/excellent-division/contest', { params: { ...searchParams.value } });
  ctstGrpCdList.value = res.data;

  const view = grdMainRef.value.getView();
  view.setColumn({
    name: 'ctstGrpCd',
    editor: { type: 'list' },
    rules: 'required',
    options: ctstGrpCdList.value,
    optionValue: 'ctstGrpCd',
    optionLabel: 'ctstGrpNm',
  });
};

const getEvaluationResponsibility = async () => {
  const res = await dataService.get('/sms/wells/competence/excellent-division/evaluation-responsibility', { params: { ...searchParams.value } });
  rsbList.value = res.data;
};

const onClickSave = async () => {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/competence/excellent-division/contest-responsibility', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
};

watch(() => [searchParams.value.evlOgTpCd], async () => {
  await evaluateResponsibilityCdChang();
});

watch(() => [searchParams.value.evlDvCd], async () => {
  if (!isEmpty(searchParams.value.evlDvCd) && (searchParams.value.evlDvCd === 'M01' || searchParams.value.evlDvCd === 'M02')) {
    searchParams.value.ctstGrpCd = '';
  }
  await getContestGroupFetchData();
  await getEvaluationResponsibility();
});
onMounted(async () => {
  await evaluateResponsibilityCdChang();
  await getEvaluationResponsibility();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'baseYm' },
    { fieldName: 'evlOgTpCd' },
    { fieldName: 'evlDvCd' },
    { fieldName: 'evlDvNm' },
    { fieldName: 'ogId' },
    { fieldName: 'ogNm' },
    { fieldName: 'evlAtcDvCd' },
    { fieldName: 'evlAtcDvNm' },
    { fieldName: 'ctstGrpNm' },
    { fieldName: 'ctstGrpCd' },
  ];

  const columns = [
    { fieldName: 'evlAtcDvNm', header: t('MSG_TXT_EVL_BASE_DV'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'evlDvNm', header: t('MSG_TXT_EVL_DV_NM'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'ogNm', header: t('MSG_TXT_OG_NM'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'ctstGrpCd',
      header: t('MSG_TXT_SAP_GRP'),
      width: '100',
      styleName: 'text-center',
      rules: 'required',
      styleCallback(grid, dataCell) {
        const evlDvCd = grid.getValue(dataCell.item.dataRow, 'evlDvCd');
        return (evlDvCd === 'M01' || evlDvCd === 'M02') ? { editable: false } : { editable: true };
      },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
});
</script>
