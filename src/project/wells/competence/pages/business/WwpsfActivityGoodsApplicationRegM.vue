<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfActivityGoodsApplicationRegM - 활동물품 신청(업무담당)
3. 작성자 : jisung you
4. 작성일 : 2023.07.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-활동물품 신청(업무담당)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="3"
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
            rules="required"
            :options="ogTpCds"
            first-option="select"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_APL_DATE')"
        >
          <kw-date-picker
            v-model="searchParams.aplcDt"
            type="month"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_SEQUENCE_NUMBER')">
          <kw-input
            v-model="searchParams.prtnrNo"
            icon="search"
            clearable
            @click-icon="onClickIcon"
          /><!--번호-->
          <!--성명-->
          <kw-input
            v-model="searchParams.prtnrKnm"
            readonly
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
          <span class="ml8">({{ $t('단위:원') }})</span>
        </template>
        <kw-btn
          icon="download_on"
          dense
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-btn
          v-permission:create
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <kw-btn
          v-permission:update
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_TXT_CHO_CAN')"
          dense
          @click="onClickCancel('02')"
        />
        <kw-btn
          :label="$t('MSG_TXT_CHO_RTNGD')"
          dense
          @click="onClickCancel('03')"
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
      <kw-separator />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, gridUtil, useMeta, defineGrid, useGlobal, useDataService, stringUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { modal, notify } = useGlobal();
const now = dayjs();
const { getConfig, getUserInfo } = useMeta();
const { t } = useI18n();
const dataService = useDataService();
const userInfo = getUserInfo();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const ogTpCds = ref();
const codes = await codeUtil.getMultiCodes(
  'OG_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'ACTI_GDS_APLC_STAT_CD',
);
ogTpCds.value = codes.OG_TP_CD.filter((v) => ['W02', 'W03'].includes(v.codeId));
const actiGdsSns = ref();
const actiGdsStddCds = ref();
const searchParams = ref({
  ogTpCd: '', /* 조직유형코드 */
  aplcDt: now.format('YYYYMM'),
  prtnrNo: '',
  prtnrKnm: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;
async function optionData() {
  cachedParams = cloneDeep(searchParams.value);
  const { data } = await dataService.get('/sms/wells/competence/business/activity/base-codes', { params: { ...cachedParams } });

  return data;
}

actiGdsSns.value = await optionData();

async function optionDataDtl() {
  cachedParams = cloneDeep(searchParams.value);
  const { data } = await dataService.get('/sms/wells/competence/business/activity/dtl-codes', { params: { ...cachedParams } });

  return data;
}
actiGdsStddCds.value = await optionDataDtl();

async function fetchPages() {
  const res = await dataService.get('/sms/wells/competence/business/activity/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: products, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(products);
  view.resetCurrent();
}

async function onClickIcon() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
    },
  });

  if (result) {
    searchParams.value.prtnrKnm = payload.prtnrKnm;
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}

async function onClickAdd() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, { ogTpCd: userInfo.ogTpCd });
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const saveParams = gridUtil.getChangedRowValues(view).map((row) => ({
    ...row,
  }));

  await dataService.post('/sms/wells/competence/business/activity/application', saveParams);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchPages();
}

const onClickSearch = async () => {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchPages();
};

async function onClickCancel(type) {
  // 코드 : ACTI_GDS_APLC_STAT_CD->01:신청, 02:취소, 03:반품
  console.log(type);
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  if (type === '02') {
    const res = await modal({
      component: 'WwpsfCancelRegistrationRegP',
      componentProps: { checkedRows },
    });

    if (res.result) {
      console.log(res.result);
    }
  } else {
    const res = await modal({
      component: 'WwpsfReturningRegistrationRegP',
      componentProps: { checkedRows },
    });

    if (res.result) {
      console.log(res.result);
      await onClickSearch();
    }
  }
}

/**
 * 엑셀다운로드
 */
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  // 전체 조회 다운 (쿼리조회)
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/wells/competence/business/activity/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName, // 메뉴명으로 다운로드 엑셀 파일명 세팅
    timePostfix: true,
    exportData: res.data,
  });
}

function isEditableRow(actiGdsAplcStatCd) {
  return isEmpty(actiGdsAplcStatCd) || actiGdsAplcStatCd === '01';
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const area2codes = { id: 'secondOgLevlId', levels: 2, tags: [], keys: [], values: [] };

  actiGdsStddCds.value.forEach((item) => {
    area2codes.tags.push(item.codeId);
    area2codes.keys.push([item.prtsCodeId, item.codeId]);
    area2codes.values.push(item.codeName);
  });
  console.log('actiGdsStddCds.value', actiGdsStddCds.value);

  view.addLookupSource(area2codes);
  const fields = [

    { fieldName: 'ogTpCd' },
    { fieldName: 'actiGdsAplcId' },
    { fieldName: 'actiGdsAplcSn' },
    { fieldName: 'aplcDtS' },
    { fieldName: 'aplcDt' },
    { fieldName: 'aplcRsonCn' },
    { fieldName: 'actiGdsCd' },
    { fieldName: 'actiGdsStddCd' },
    { fieldName: 'bldNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'mpno' },
    { fieldName: 'col7' },
    { fieldName: 'actiGdsSn' },
    { fieldName: 'actiGdsNm' },
    { fieldName: 'aplcQty' },
    { fieldName: 'actiGdsAplcStatCd' },
    { fieldName: 'maxFeeDdtnOcDt' },
    { fieldName: 'actiGdsAmt', dataType: 'number' },
    { fieldName: 'sumFeeDdtnDstAmt', dataType: 'number' },
    { fieldName: 'patDdtnMcn' },
    { fieldName: 'countMcn', dataType: 'number' },
    { fieldName: 'col17' },
    { fieldName: 'col18' },
    { fieldName: 'sppDt' },
    { fieldName: 'sppBzsCd' },
    { fieldName: 'sppBzsNm' },
    { fieldName: 'col21' },
    { fieldName: 'sppIvcNo' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'baseDvNm' },
    { fieldName: 'startYrmn' },
    { fieldName: 'actiGdsStddDvId' },
    { fieldName: 'actiGdsAplcStatNm' },
    { fieldName: 'cltnDt' },
    { fieldName: 'cntrDt' },

  ];

  const columns = [
    { fieldName: 'aplcDtS', header: t('MSG_TXT_APPL_DT'), width: '100', styleName: 'text-center', editable: false, datetimeFormat: 'date' },
    { fieldName: 'actiGdsAplcStatNm',
      header: t('MSG_TXT_STT'),
      width: '100',
      styleName: 'text-center',
      editable: false },

    { fieldName: 'bldNm', header: t('MSG_TXT_MSG_TXT_LOCARA_AND_BLD_NM'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'prtnrNo',
      header: t('MSG_TXT_SEQUENCE_NUMBER'),
      width: '100',
      styleName: 'text-center !important, rg-button-icon--search',
      button: 'action',
      rules: 'numeric||required',
      editor: {
        type: 'line',
        maxLength: 10,
        inputCharacters: '0-9',
      },
      numberFormat: '###0',

    },
    { fieldName: 'prtnrKnm',
      header: t('MSG_TXT_PIC_NM'),
      width: '100',
      styleName: 'text-center',
      rules: 'required',
      editable: false },
    { fieldName: 'cntrDt', header: t('MSG_TXT_CNTR_DATE'), width: '100', styleName: 'text-center', editable: false, datetimeFormat: 'date' },
    { fieldName: 'cltnDt', header: t('MSG_TXT_CLTN_DT'), width: '100', styleName: 'text-center', editable: false, datetimeFormat: 'date' },
    {
      fieldName: 'mpno',
      header: t('MSG_TXT_MPNO'),
      styleName: 'text-center',
      width: '120',
      editable: false,
      displayCallback(grid, index) {
        const { cralLocaraTno: no1, mexnoEncr: no2, cralIdvTno: no3 } = grid.getValues(index.itemIndex);
        let value = '';
        if (no1 !== undefined) {
          value += no1;
        }
        value += '-';
        if (no2 !== undefined) {
          value += no2;
        }
        value += '-';
        if (no3 !== undefined) {
          value += no3;
        }
        return value;
      },
    },
    { fieldName: 'startYrmn', header: t('MSG_TXT_OPNG_YM'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'baseDvNm', header: t('MSG_TXT_DIV'), width: '80', styleName: 'text-center', editable: false },
    { fieldName: 'actiGdsSn',
      header: t('MSG_TXT_CODE'),
      width: '150',
      styleName: 'text-center',
      editor: {
        type: 'dropdown',
      },
      options: actiGdsSns.value,
      rules: 'required',
    },

    { fieldName: 'aplcQty',
      header: t('MSG_TXT_QTY'),
      width: '80',
      styleName: 'text-center',
      editor: { type: 'dropdown' },
      rules: 'required',
      styleCallback() {
        const ret = {};
        const options = [];
        for (let i = 1; i <= 5; i += 1) {
          const rowData = { codeId: i, codeName: i };
          options.push(rowData);
        }
        ret.editor = {
          type: 'dropdown',
          values: options.map((item) => item.codeId),
          labels: options.map((item) => item.codeName),
        };
        return ret;
      },
      displayCallback(grid, index, value) {
        return value;
      },
    },
    { fieldName: 'actiGdsStddCd',
      header: t('MSG_TXT_SZ'),
      width: '80',
      styleName: 'text-center',
      lookupDisplay: true,
      lookupSourceId: 'secondOgLevlId',
      lookupKeyFields: ['actiGdsStddDvId', 'actiGdsStddCd'], // 참조 키 필드값
      editor: { type: 'dropdown' },
      rules: 'required',
      styleCallback() {
        return actiGdsStddCds.value.length === 1 ? { editable: false } : { editable: true };
      },
    },
    { fieldName: 'maxFeeDdtnOcDt', header: t('MSG_TXT_FNL_OC_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date', editable: false },
    { fieldName: 'actiGdsAmt', header: t('MSG_TXT_TOT_OJ_AMT'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'sumFeeDdtnDstAmt', header: t('MSG_TXT_ACU_AMT'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', editable: false },
    { fieldName: 'patDdtnMcn', header: t('MSG_TXT_PAT_N'), width: '50', styleName: 'text-center', editable: false },
    { fieldName: 'countMcn', header: t('MSG_TXT_ORDR'), width: '50', styleName: 'text-center', editable: false },
    { fieldName: 'col17',
      header: t('MSG_TXT_CANC_DT'),
      width: '100',
      styleName: 'text-center',
      editable: false,
      displayCallback(grid, index) {
        const { actiGdsAplcStatCd, aplcDt } = grid.getValues(index.itemIndex);
        let value = '';
        if (actiGdsAplcStatCd === '02') {
          value = stringUtil.getDateFormat(aplcDt);
        }
        return value;
      },

    },
    { fieldName: 'col18',
      header: t('MSG_TXT_CAN_RSON'),
      width: '100',
      styleName: 'text-left',
      editable: false,
      displayCallback(grid, index) {
        const { actiGdsAplcStatCd, aplcRsonCn } = grid.getValues(index.itemIndex);
        let value = '';
        if (actiGdsAplcStatCd === '02') {
          value = aplcRsonCn;
        }
        return value;
      } },
    { fieldName: 'sppDt', header: t('MSG_TXT_RTNGD_DT'), width: '100', styleName: 'text-center', editable: false, datetimeFormat: 'date' },
    { fieldName: 'sppBzsNm', header: t('MSG_TXT_PCSV_CO'), width: '100', styleName: 'text-left', editable: false },
    { fieldName: 'col21',
      header: t('MSG_TXT_RTRN_RSN'),
      width: '150',
      styleName: 'text-left',
      editable: false,
      displayCallback(grid, index) {
        const { actiGdsAplcStatCd, aplcRsonCn } = grid.getValues(index.itemIndex);
        let value = '';
        if (actiGdsAplcStatCd === '03') {
          value = aplcRsonCn;
        }
        return value;
      } },
    { fieldName: 'sppIvcNo', header: t('MSG_TXT_IVC_NO'), width: '100', styleName: 'text-center', editable: false },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.setCheckBar({
    showAll: false,
  });

  view.onItemChecked = (g, itemIndex) => {
    if (g.isCheckedItem(itemIndex)) {
      if (g.getValue(itemIndex, 'actiGdsAplcStatCd') === '02' || g.getValue(itemIndex, 'actiGdsAplcStatCd') === '03') {
        g.checkItem(itemIndex, false);
      }
    }
  };

  view.onCellButtonClicked = async (grid, { dataRow, column, itemIndex }) => {
    if (column === 'prtnrNo') {
      const gridPrtnrNo = grid.getValue(itemIndex, 'prtnrNo');
      const { result, payload } = await modal({
        component: 'ZwogzPartnerListP',
        componentProps: {
          prtnrNo: gridPrtnrNo,
          ogTpCd: userInfo.ogTpCd,
        },
      });
      if (result) {
        console.log('payload', payload);
        const { prtnrNo, prtnrKnm } = payload;
        data.setValue(dataRow, 'prtnrNo', prtnrNo);
        data.setValue(dataRow, 'prtnrKnm', prtnrKnm);
      }
    }
  };

  // multi row header setting
  view.setColumnLayout([
    'aplcDtS', 'actiGdsAplcStatNm', 'bldNm',
    {
      header: t('MSG_TXT_APPL_USER'),
      direction: 'horizontal',
      items: ['prtnrNo', 'prtnrKnm', 'cntrDt', 'cltnDt'],
    },
    'mpno', 'startYrmn', 'baseDvNm',
    {
      header: t('MSG_TXT_APLC_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['actiGdsSn', 'aplcQty', 'actiGdsStddCd'],
    },
    {
      header: t('MSG_TXT_DDTN_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['maxFeeDdtnOcDt', 'actiGdsAmt', 'sumFeeDdtnDstAmt', 'patDdtnMcn', 'countMcn'],
    },
    'col17', 'col18', 'sppDt', 'sppBzsNm', 'col21', 'sppIvcNo',
  ]);

  view.onCellEdited = (grid, itemIndex) => {
    const { fieldName } = grid.getCurrent();
    if (fieldName === 'actiGdsSn') {
      const { actiGdsSn } = grid.getValues(itemIndex);
      const codeData = actiGdsSns.value.filter((v) => [actiGdsSn].includes(v.codeId));
      grid.setValue(itemIndex, 'actiGdsCd', codeData[0].prtsCodeId);
      grid.setValue(itemIndex, 'actiGdsStddDvId', codeData[0].actiGdsStddDvId);
    }
  };

  view.onCellEditable = (grid, index) => {
    // 코드 : ACTI_GDS_APLC_STAT_CD->01:신청, 02:취소, 03:반품
    const actiGdsAplcStatCd = grid.getValue(index.dataRow, 'actiGdsAplcStatCd');
    if (!(gridUtil.isCreatedRow(grid, index) || isEditableRow(actiGdsAplcStatCd))) {
      return false;
    }
  };
});

onMounted(async () => {
  await onClickSearch();
});
</script>
