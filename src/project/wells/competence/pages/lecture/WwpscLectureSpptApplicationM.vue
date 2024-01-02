<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSC
2. 프로그램 ID : WwpscLectureSpptApplicationM
3. 작성자 : Park Yesol
4. 작성일 : 2023.08.04
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 강의지원 신청
****************************************************************************************************
-->

<template>
  <kw-page>
    <kw-search
      ref="frmSearchRef"
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 조직유형 -->
        <kw-search-item
          :label="t('MSG_TXT_OG_TP')"
          required
        >
          <kw-select
            v-model="searchParams.lectrSpptOgTpCd"
            :label="t('MSG_TXT_OG_TP')"
            :options="ogTpCd"
            rules="required"
            first-option="select"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_OG_LEVL')"
          required
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevlDvCd1"
            v-model:og-levl-dv-cd2="searchParams.ogLevlDvCd2"
            :og-tp-cd="searchParams.lectrSpptOgTpCd"
            :start-level="1"
            :end-level="2"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_EDUC_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.lectrYm"
            :label="t('MSG_TXT_EDUC_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <ul
        v-if="applicationPeriodTermNotice.visible"
        class="kw-notification"
      >
        <li>
          강의 신청기간 : {{ stringUtil.getDateFormat(applicationPeriodTermNotice.aplcStrtdt) }}
          ~
          {{ stringUtil.getDateFormat(applicationPeriodTermNotice.aplcEnddt) }}
        </li>
      </ul>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          />
        </template>
        <kw-btn
          v-if="applicationPeriodTermNotice.visible"
          :label="$t('MSG_BTN_DEL')"
          dense
          grid-action
          @click="onClickRemove"
        />
        <kw-separator
          v-if="applicationPeriodTermNotice.visible"
          vertical
          inset
          spaced
        />
        <kw-btn
          v-if="applicationPeriodTermNotice.visible"
          v-permission:create
          :label="$t('MSG_BTN_ROW_ADD')"
          dense
          grid-action
          @click="onClickAdd"
        />
        <kw-btn
          v-if="applicationPeriodTermNotice.visible"
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
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        :visible-rows="pageInfo.pageSize - 1"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { useDataService, getComponentType, gridUtil, codeUtil, useMeta, defineGrid, useGlobal, stringUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';

const { t } = useI18n();
const { notify, alert } = useGlobal();
const { getConfig, getUserInfo } = useMeta();
const dataService = useDataService();
const userInfo = getUserInfo();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();
const ogTpCd = ref();
const enableApplicatiton = ref(false);
const lectureList = ref([]);
const lecturerList = ref([]);
const bldCdList = ref([]);
const grdMainRef = ref(getComponentType('KwGrid'));

// 공통코드로딩
const codes = await codeUtil.getMultiCodes(
  'OG_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'COD_YN',
  'LECTR_TCNT_CD',
);
ogTpCd.value = codes.OG_TP_CD.filter((v) => ['W01', 'W02'].includes(v.codeId));

let cachedParams;
// 검색조건 Parameter
const searchParams = ref({
  lectrSpptOgTpCd: userInfo.ogTpCd,
  lectrYm: dayjs(now).add(1, 'month').format('YYYYMM'),
  ogLevlDvCd1: '', // 사업단
  ogLevlDvCd2: '', // 총괄
});

const applicationPeriodTermNotice = ref({
  aplcStrtdt: '',
  aplcStrtHm: '',
  aplcEnddt: '',
  aplcEndHm: '',
  visible: false,
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const fetchLeture = async () => {
  const res = await dataService.get('/sms/wells/competence/lecture-sppt-lecture', { params: { ogTpCd: searchParams.value.lectrSpptOgTpCd } });
  lectureList.value = res.data;
};
const fetchLeturer = async () => {
  const res = await dataService.get('/sms/wells/competence/lecture-sppt-lecturer', { params: { ogTpCd: searchParams.value.lectrSpptOgTpCd } });
  lecturerList.value = res.data;
};
const fetBuildingCode = async () => {
  const res = await dataService.get('/sms/wells/competence/lecture-sppt-application/bld-code', { params: { ogTpCd: searchParams.value.lectrSpptOgTpCd, baseYm: searchParams.value.lectrYm } });
  bldCdList.value = res.data;
};
await fetchLeture();
await fetchLeturer();
await fetBuildingCode();

const fetchData = async () => {
  const res = await dataService.get('/sms/wells/competence/lecture-sppt-application/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(list);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
};

const onClickSearch = async () => {
  pageInfo.value.pageIndex = 1;
  // 자동완성 검색조건 설정
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
};

const onClickAdd = async () => {
  const view = grdMainRef.value.getView();
  const row = { lectrSpptOgTpCd: searchParams.value.lectrSpptOgTpCd, lectrYm: searchParams.value.lectrYm };
  gridUtil.insertRowAndFocus(view, 0, row);
};

const onClickRemove = async () => {
  const view = grdMainRef.value.getView();
  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (!enableApplicatiton.value) {
    await alert(t('MSG_ALT_LECT_SPPT_APLC_PTRM_PSB'));
    return;
  }
  if (deletedRows.length > 0) {
    await dataService.delete('/sms/wells/competence/lecture-sppt-application', { data: deletedRows });
    await fetchData();
  }
};

const fetLectureSpptApplicationPeriodTerm = async () => {
  const res = await dataService.get('/sms/wells/competence/lecture-sppt-aplc-ptrm', { params: { lectrSpptOgTpCd: searchParams.value.lectrSpptOgTpCd, lectrYm: searchParams.value.lectrYm } });
  if (!isEmpty(res.data)) {
    applicationPeriodTermNotice.value = res.data;
    const today = dayjs().format('YYYYMMDDHHmm');
    const preDate = res.data.aplcStrtdt.concat(res.data.aplcStrtHm);
    const toDate = res.data.aplcEnddt.concat(res.data.aplcEndHm);
    if (preDate <= today && today <= toDate) {
      enableApplicatiton.value = true;
      applicationPeriodTermNotice.value.visible = true;
    } else {
      enableApplicatiton.value = false;
      applicationPeriodTermNotice.value.visible = false;
    }
  } else {
    applicationPeriodTermNotice.value.visible = false;
    enableApplicatiton.value = false;
  }
};

const bindingSelectOptions = async () => {
  const view = grdMainRef.value.getView();
  view.setColumn({
    name: 'bldCd',
    editor: { type: 'list' },
    rules: 'required',
    options: bldCdList.value,
    optionValue: 'bldCd',
    optionLabel: 'bldNm',
  });
  view.setColumn({
    name: 'lectrSpptLectCd',
    editor: { type: 'list' },
    rules: 'required',
    options: lecturerList.value,
    optionValue: 'lectrSpptLectCd',
    optionLabel: 'lectNm',
  });
  view.setColumn({
    name: 'lectrSpptLectrCd',
    editor: { type: 'list' },
    rules: 'required',
    options: lectureList.value,
    optionValue: 'lectrSpptLectrCd',
    optionLabel: 'lectrNm',
  });
};

const onClickSave = async () => {
  await fetLectureSpptApplicationPeriodTerm();
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  if (!enableApplicatiton.value) {
    await alert(t('MSG_ALT_LECT_SPPT_APLC_PTRM_PSB'));
    return;
  }
  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/competence/lecture-sppt-application', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
};

watch(() => [searchParams.value.lectrSpptOgTpCd, searchParams.value.lectrYm], async () => {
  if (!isEmpty(searchParams.value.lectrSpptOgTpCd)) {
    await fetchLeture();
    await fetchLeturer();
    await fetBuildingCode();
    await fetLectureSpptApplicationPeriodTerm();
    await bindingSelectOptions();

    // 조건 변경 시 그리드 초기화
    grdMainRef.value.getData().clearRows();
  }
});

onMounted(async () => {
  await fetLectureSpptApplicationPeriodTerm();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'lectrTCnt' },
    { fieldName: 'bldCd' },
    { fieldName: 'lectrSpptLectCd' },
    { fieldName: 'lectrSpptLectrCd' },
    { fieldName: 'lectrDt' },
    { fieldName: 'lectrSpptOgTpCd' },
    { fieldName: 'lectrSpptAplcId' },
    { fieldName: 'lectrYm' },
    { fieldName: 'ogId' },
  ];
  const columns = [
    { fieldName: 'lectrTCnt', header: t('MSG_TXT_JOB_PROT_CD'), width: '100', styleName: 'text-center', rules: 'required', options: codes.LECTR_TCNT_CD, editor: { type: 'list' } },
    { fieldName: 'bldCd', header: t('MSG_TXT_BLD_NM'), width: '100', styleName: 'text-center', rules: 'required', options: bldCdList.value, optionValue: 'bldCd', optionLabel: 'bldNm', editor: { type: 'list' } },
    { fieldName: 'lectrSpptLectCd', header: t('MSG_TXT_LECT_NM'), width: '100', styleName: 'text-center', rules: 'required', options: lecturerList.value, optionValue: 'lectrSpptLectCd', optionLabel: 'lectNm', editor: { type: 'list' } },
    { fieldName: 'lectrSpptLectrCd', header: t('MSG_TXT_LECTR_NM'), width: '300', styleName: 'text-left', rules: 'required', options: lectureList.value, optionValue: 'lectrSpptLectrCd', optionLabel: 'lectrNm', editor: { type: 'list' } },
    { fieldName: 'lectrDt', header: t('MSG_TXT_LECTR_DT'), width: '100', styleName: 'text-center', rules: 'required', editor: { type: 'date' } },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEdited = async (grid, itemIndex) => {
    const { fieldName } = grid.getCurrent();
    if (fieldName === 'bldCd' && !isEmpty(grid.getValue(itemIndex, 'bldCd'))) {
      const bldCd = grid.getValue(itemIndex, 'bldCd');
      const { ogId } = bldCdList.value.filter((v) => v.bldCd === bldCd)[0];
      grid.setValue(itemIndex, 'ogId', ogId);
    }
  };
});
</script>
