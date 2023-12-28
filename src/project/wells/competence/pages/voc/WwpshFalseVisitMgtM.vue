<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpshFalseVisitMgtM - 허위방문 관리
3. 작성자 : jisung you
4. 작성일 : 2023.05.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 허위방문 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="t('MSG_TXT_YEAR_OCCURNCE')"
          :colspan="1"
        >
          <kw-date-picker
            v-model="searchParams.ocYm"
            :label="t('MSG_TXT_YEAR_OCCURNCE')"
            type="month"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_SEQUENCE_NUMBER')">
          <kw-input
            v-model="searchParams.prtnrNo"
            clearable
            readonly
            icon="search"
            :placeholder="$t('MSG_TXT_PRTNR_NO_FNM_IN')"
            :on-click-icon="onClickSearchNo"
            :regex="/^[A-Z가-힣ㄱ-ㅎ0-9]*$/i"
          />

          <kw-input
            v-model="searchParams.prtnrKnm"
            clearable
            readonly
            :placeholder="$t('MSG_TXT_EMPL_NM')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <h3>{{ $t('MSG_TXT_SRCH_RSLT') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :page-index="pageInfo.pageIndex"
            :page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>
        <kw-btn
          :label="$t('MSG_BTN_DEL')"
          dense
          grid-action
          @click="onClickDelete"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:create
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <kw-btn
          :label="$t('MSG_BTN_SAVE')"
          grid-action
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="excel"
          dense
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExportView"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
      />
      <kw-pagination
        :page-index="pageInfo.pageIndex"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
      <kw-separator />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
import { defineGrid, getComponentType, gridUtil, codeUtil, useDataService, useGlobal, useMeta, notify } from 'kw-lib';
import dayjs from 'dayjs';
import { isEmpty, cloneDeep } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();
const { modal } = useGlobal();
const { currentRoute } = useRouter();
const now = dayjs();
const { getUserInfo, getConfig } = useMeta();
const userInfo = getUserInfo();
const prtnrPopupValidateChk = ref(0);
// 공통코드로딩
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
let cachedParams;
// 검색조건 Parameter
const searchParams = ref({
  ocYm: now.format('YYYYMM'),
  prtnrNo: undefined,
  prtnrKnm: undefined,
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 번호 팝업 호출
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
    },
  });

  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
    searchParams.value.prtnrKnm = payload.prtnrKnm;
  }
}

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  let ocYm = '';
  if (searchParams.value.ocYm === '') {
    ocYm = now.format('YYYYMM');
  } else {
    ocYm = searchParams.value.ocYm;
  }
  gridUtil.insertRowAndFocus(view, 0, {
    ocYm,
    fsVstYm: now.format('YYYYMM'),
    ogTpCd: userInfo.ogTpCd,
  });
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/competence/falsevisit/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: products, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(products);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  // 필요한 초기화 처리
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const rows = gridUtil.getChangedRowValues(view, true);

  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  await dataService.post('/sms/wells/competence/falsevisit', rows);

  notify(t('MSG_ALT_SAVE_DATA'));
  grdMainRef.value.getData().clearRows();

  await fetchData();
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  const deleteRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (deleteRows.length > 0) {
    await dataService.delete('/sms/wells/competence/falsevisit', { data: [...deleteRows] });
    await fetchData();
  }
}
async function onClickExportView() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

const fetchBranchManager = async (grid, row) => {
  const { prtnrNo, fsVstYm } = gridUtil.getRowValue(grid, row);
  const data = grid.getDataSource();
  const res = await dataService.get('/sms/wells/competence/falsevisit/branch-manager', { params: { prtnrNo, baseYm: fsVstYm } });
  if (res.data) {
    data.setValue(row, 'hooPrtnrNo', res.data.hooPrtnrNo);
    data.setValue(row, 'hooPrtnrNm', res.data.hooPrtnrNm);
  } else {
    data.setValue(row, 'hooPrtnrNo', '');
    data.setValue(row, 'hooPrtnrNm', '');
  }
};

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ocYm' },
    { fieldName: 'rgstSn' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'ogId' },
    { fieldName: 'fsVstYm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'hooPrtnrNo' },
    { fieldName: 'hooPrtnrNm' },
    { fieldName: 'ocRsonCn' },
    { fieldName: 'dtaDlYn' },
    { fieldName: 'cntrNoSn' },
    { fieldName: 'cstKnm' },
    { fieldName: 'ogTpCd' },

  ];
  const columns = [
    { fieldName: 'ocYm', header: t('MSG_TXT_YEAR_OCCURNCE'), width: '100', styleName: 'text-center', editable: false, datetimeFormat: 'YYYY-MM' },
    { fieldName: 'prtnrNo',
      rules: 'required',
      header: { text: t('MSG_TXT_SEQUENCE_NUMBER') },
      width: '110',
      editor: { type: 'text' },
      button: 'action',
      styleName: 'text-left, rg-button-icon--search',
    },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '90', styleName: 'text-center', editable: false },

    { fieldName: 'fsVstYm',
      header: t('MSG_TXT_FASLE_YEAR'),
      width: '110',
      rules: 'required',
      datetimeFormat: 'yyyy-MM',
      editor: {
        type: 'btdate',
        btOptions: {
          minViewMode: 1,
        },
      },
    },
    { fieldName: 'hooPrtnrNo', header: t('MSG_TXT_TOP_USER_NO'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'hooPrtnrNm', header: t('MSG_TXT_TOP_USER_NM'), width: '100', styleName: 'text-center', editable: false },
    {
      fieldName: 'cntrNoSn',
      rules: 'required',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      button: 'action',
      width: '150',
      styleName: 'text-left rg-button-icon--search',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        if (!isEmpty(cntrNo)) {
          return `${cntrNo}-${cntrSn}`;
        }
      },
      styleCallback(grid, dataCell) {
        return dataCell.item.rowState === 'created' ? { editable: false,
          styleName: 'text-left rg-button-icon--search',
          editor: {
            type: 'number',
          },
        } : { styleName: 'text-left rg-button-icon--search', editable: false };
      },

    },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'ocRsonCn', header: t('MSG_TXT_CLAIM_RSN'), width: '200', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.editOptions.editable = true;
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellEdited = async (grid, itemIndex) => {
    const { fieldName } = grid.getCurrent();
    if (fieldName === 'fsVstYm') {
      grid.commit();
      await fetchBranchManager(grid, itemIndex);
    }
  };

  view.onCellButtonClicked = async (grid, { itemIndex }) => {
    const prtnrNo = grid.getValue(itemIndex, 'prtnrNo');
    const cntrNoSn = grid.getValue(itemIndex, 'cntrNoSn');
    const { fieldName } = grid.getCurrent();
    if (fieldName === 'prtnrNo') {
      const { result, payload } = await modal({
        component: 'ZwogzPartnerListP',
        componentProps: {
          prtnrNo,
        },
      });
      if (result) {
        if (prtnrPopupValidateChk.value - 1 < 0) {
          prtnrPopupValidateChk.value = 0;
        } else {
          prtnrPopupValidateChk.value -= 1;
        }
        data.setValue(itemIndex, 'ogTpCd', payload.ogTpCd);
        data.setValue(itemIndex, 'prtnrNo', payload.prtnrNo);
        data.setValue(itemIndex, 'prtnrKnm', payload.prtnrKnm);

        await fetchBranchManager(grid, itemIndex);
      }
    }
    if (fieldName === 'cntrNoSn') {
      prtnrPopupValidateChk.value = 0;
      const { result, payload } = await modal({
        component: `${userInfo.tenantCd}wctaContractNumberListP`,

        componentProps: {
          cntrNoSn,
        },

      });
      if (result) {
        data.setValue(itemIndex, 'cntrNo', payload.cntrNo);
        data.setValue(itemIndex, 'cntrSn', payload.cntrSn);
        data.setValue(itemIndex, 'cstKnm', payload.cntrCstKnm);
        data.setValue(itemIndex, 'cntrNoSn', `${payload.cntrNo}-${payload.cntrSn}`);
      }
    }
  };
});

</script>
