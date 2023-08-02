<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSC
2. 프로그램 ID : WwpscLectureSpptLectureMgtM
3. 작성자 : Park Yesol
4. 작성일 : 2023.08.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 강의지원 강의관리
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
            v-model="searchParams.ogTpCd"
            :label="t('MSG_TXT_OG_TP')"
            :options="ogTpCd"
            rules="required"
            first-option="select"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_LECTR_NM')"
        >
          <kw-input
            v-model="searchParams.lectrNm"
            :placeholder="t('MSG_TXT_INP')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
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
          :label="$t('MSG_BTN_DEL')"
          dense
          grid-action
          @click="onClickRemove"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:create
          :label="$t('MSG_BTN_ROW_ADD')"
          dense
          grid-action
          @click="onClickAdd"
        />
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
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        :visible-rows="10"
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

import { useDataService, getComponentType, gridUtil, codeUtil, useMeta, defineGrid, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { notify } = useGlobal();
const { getConfig, getUserInfo } = useMeta();
const dataService = useDataService();
const userInfo = getUserInfo();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const ogTpCd = ref();
const grdMainRef = ref(getComponentType('KwGrid'));

// 공통코드로딩
const codes = await codeUtil.getMultiCodes(
  'OG_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'EDUC_CPC_YN',
  'COD_YN',
);
ogTpCd.value = codes.OG_TP_CD.filter((v) => ['W01', 'W02'].includes(v.codeId));

let cachedParams;
// 검색조건 Parameter
const searchParams = ref({
  ogTpCd: userInfo.ogTpCd, // 조직유형
  lectrNm: '', // 강사명
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const fetchData = async () => {
  const res = await dataService.get('/sms/wells/competence/lecture-sppt-lecture/paging', { params: { ...cachedParams, ...pageInfo.value } });
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

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, { lectrSpptOgTpCd: searchParams.value.ogTpCd, useYn: 'Y' });
}

async function onClickRemove() {
  const view = grdMainRef.value.getView();
  await gridUtil.confirmDeleteCheckedRows(view);
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }
  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/competence/lecture-sppt-lecture', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'lectrSpptOgTpCd' },
    { fieldName: 'lectrSpptLectrCd' },
    { fieldName: 'lectrNm' },
    { fieldName: 'useYn' },
  ];
  const columns = [
    { fieldName: 'lectrSpptOgTpCd',
      header: t('MSG_TXT_OG_TP'),
      width: '300',
      styleName: 'text-center',
      rules: 'required',
      options: ogTpCd.value,
      editor: { type: 'list' },
      styleCallback(grid, dataCell) {
        const lectrSpptLectrCd = grid.getValue(dataCell.index.itemIndex, 'lectrSpptLectrCd');
        return isEmpty(lectrSpptLectrCd) ? { editable: true } : { editable: false };
      },
    },
    { fieldName: 'lectrSpptLectrCd', header: t('MSG_TXT_LECTR_CD'), width: '300', styleName: 'text-center', editable: false },
    { fieldName: 'lectrNm',
      header: t('MSG_TXT_LECTR_NM'),
      width: '300',
      rules: 'required',
      styleName: 'text-center',
      styleCallback(grid, dataCell) {
        const lectrSpptLectrCd = grid.getValue(dataCell.index.itemIndex, 'lectrSpptLectrCd');
        return isEmpty(lectrSpptLectrCd) ? { editable: true } : { editable: false };
      },
    },
    { fieldName: 'useYn', header: t('MSG_TXT_USE_SEL'), width: '300', styleName: 'text-center', options: codes.COD_YN, editor: { type: 'list' } },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  // 신규 생성만 삭제 가능
  view.setCheckableExpression("value['lectrSpptLectrCd'] is empty", true);
});

</script>
