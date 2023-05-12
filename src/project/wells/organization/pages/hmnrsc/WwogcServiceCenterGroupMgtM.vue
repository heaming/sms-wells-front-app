<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcServiceCenterGroupMgtM - 서비스센터 조 관리
3. 작성자 : 한용희
4. 작성일 : 2023-05-08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 서비스센터 조 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_OG_LEVL')">
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevlDvCd1"
            v-model:og-levl-dv-cd2="searchParams.ogLevlDvCd2"
            :og-tp-cd="searchParams.ogTpCd"
            :base-ym="searchParams.baseYm"
            :start-level="1"
            :end-level="2"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_WK_GRP')">
          <kw-select
            v-model="searchParams.wkGrpCd"
            :options="codes.WK_GRP_CD"
            :label="t('MSG_TXT_BZ_DV')"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_RSB')"
        >
          <kw-select
            v-model="searchParams.rsbDvCd"
            :options="codes.RSB_DV_CD"
            :label="t('MSG_TXT_BZ_DV')"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_SEQUENCE_NUMBER')">
          <kw-input
            v-model="searchParams.prtnrNo"
            maxlength="10"
            clearable
            :placeholder="$t('MSG_TIT_PRTNR_NO')"
          />
          <kw-input
            v-model="searchParams.prtnrKnm"
            icon="search"
            clearable
            readonly
            :placeholder="$t('MSG_TXT_EMPL_NM')"
            :on-click-icon="onClickPrtnrSea"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_APY_D_BASE_INQR')"
        >
          <kw-date-picker
            v-model="searchParams.vlDt"
            rules="required"
            :label="t('MSG_TXT_APY_D_BASE_INQR')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="pageInfo.totalCount" />
        </template>
        {{ $t('MSG_TXT_CHECK_ATC_MARK') }}
        <kw-checkbox
          v-model="saveParams.chk"
          :true-value="true"
          :false-value="false"
          :disable="pageInfo.totalCount === 0"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        {{ $t('MSG_TXT_RFLT_APY_D') }}
        <kw-date-picker
          v-model="saveParams.rfltAplyDt"
        />
        {{ $t('MSG_TXT_RFLT_END_D') }}
        <kw-date-picker
          v-model="saveParams.rfltEnddt"
        />
        <kw-btn
          :label="t('MSG_BTN_RFLT_DT_BLK_SAVE')"
          grid-action
          @click="onClickAllSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="t('MSG_BTN_SAVE')"
          grid-action
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="pageInfo.pageSize - 1"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, defineGrid, getComponentType, codeUtil, useMeta, gridUtil, useGlobal } from 'kw-lib';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import { getPhoneNumber } from '~sms-common/organization/utils/ogUtil';
import dayjs from 'dayjs';
import { isEmpty, replace } from 'lodash-es';

const { t } = useI18n();
const { modal, notify } = useGlobal();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'EGER_RSB_CD',
  'RSB_DV_CD',
  'WK_GRP_CD',
  'WKCR_CD',
);

const searchParams = ref({
  ogTpCd: 'W06',
  ogLevlDvCd1: undefined,
  ogLevlDvCd2: undefined,
  wkGrpCd: undefined,
  rsbDvCd: undefined,
  prtnrNo: undefined,
  prtnrKnm: undefined,
  vlDt: dayjs().format('YYYYMMDD'),
  baseYm: dayjs().format('YYYYMM'),
});

const now = dayjs();

const saveParams = ref({
  rfltAplyDt: now.format('YYYYMMDD'),
  rfltEnddt: '99991231',
  chk: false,
});

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/partner-engineer/joe-management/paging', { params: { ...searchParams.value, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  data.checkRowStates(false);
  if (list.length > 0) {
    list.forEach((obj) => {
      obj.cralLocaraTno = `${replace(obj.cralLocaraTno, null, ' ')}-${replace(obj.mexnoEncr, null, ' ')}-${replace(obj.cralIdvTno, null, '')}`;
    });
    view.getDataSource().addRows(list);
  }
  data.checkRowStates(true);
}

// 조회
async function onClickSearch() {
  if (grdMainRef.value) {
    grdMainRef.value.getData().clearRows();
  }
  pageInfo.value.pageIndex = 1;
  saveParams.value.chk = false;
  await fetchData();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/partner-engineer/joe-management/excel-download', { params: searchParams.value });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 일괄저장
async function onClickAllSave() {
  const view = grdMainRef.value.getView();
  // if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) { // 대상자 체크박스 선택 없을때
    notify(t('MSG_ALT_CHG_HLDY_DATA'));
    return;
  }

  if (isEmpty(saveParams.value.rfltAplyDt) || isEmpty(saveParams.value.rfltEnddt)) {
    notify(t('MSG_TXT_APY_DT_CONF'));
    return;
  }
  if (dayjs().format('YYYYMMDD') > saveParams.value.rfltAplyDt
      || dayjs().format('YYYYMMDD') > saveParams.value.rfltEnddt) {
    notify(t('MSG_TXT_APY_DT_CONF'));
    return;
  }
  if (saveParams.value.rfltAplyDt > saveParams.value.rfltEnddt) {
    notify(t('MSG_TXT_APY_DT_CONF'));
    return;
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const item of checkedRows) {
    if (isEmpty(item.wkGrpCd)) {
      notify(t('MSG_ALT_WK_GRP_NOT_EXIST'));
      return;
    }
    if (isEmpty(item.wkcrCd)) {
      notify(t('MSG_ALT_CO_NO_EXIST'));
      return;
    }
  }

  checkedRows.forEach((obj) => {
    if (!isEmpty(obj.cralLocaraTno)) {
      const tel = obj.cralLocaraTno.replaceAll('-', '');
      obj.cralLocaraTno = getPhoneNumber(tel, 1);
      obj.mexnoEncr = getPhoneNumber(tel, 2);
      obj.cralIdvTno = getPhoneNumber(tel, 3);
    }
    obj.vlStrtDt = saveParams.value.rfltAplyDt;
    obj.vlEnddt = saveParams.value.rfltEnddt;
  });

  await dataService.post('/sms/wells/partner-engineer/joe-management', checkedRows);
  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  // if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changeRows = gridUtil.getChangedRowValues(view);

  // eslint-disable-next-line no-restricted-syntax
  for (const item of changeRows) {
    if (dayjs().format('YYYYMMDD') > item.vlStrtDt
      || dayjs().format('YYYYMMDD') > item.vlEnddt) {
      notify(t('MSG_TXT_APY_DT_CONF'));
      return;
    }
    if (item.vlStrtDt > item.vlEnddt) {
      notify(t('MSG_TXT_APY_DT_CONF'));
      return;
    }
  }

  changeRows.forEach((obj) => {
    if (!isEmpty(obj.cralLocaraTno)) {
      const tel = obj.cralLocaraTno.replaceAll('-', '');
      obj.cralLocaraTno = getPhoneNumber(tel, 1);
      obj.mexnoEncr = getPhoneNumber(tel, 2);
      obj.cralIdvTno = getPhoneNumber(tel, 3);
    }
    obj.vlStrtDt = saveParams.value.rfltAplyDt;
    obj.vlEdndt = saveParams.value.rfltEnddt;
  });

  await dataService.post('/sms/wells/partner-engineer/joe-management', changeRows);
  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

watch(() => saveParams.value.chk, async (newVal) => {
  if (newVal) {
    const view = grdMainRef.value.getView();
    const changeRows = gridUtil.getChangedRowValues(view);
    view.getDataSource().setRows(changeRows);
  } else {
    await onClickSearch();
  }
});

// 파트너 검색 공통팝업
async function onClickPrtnrSea() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
      ogTpCd: 'W06',
    },
  });

  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
    searchParams.value.prtnrKnm = payload.prtnrKnm;
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_CENTER_DIVISION'), width: '162', styleName: 'text-center' },
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_BRANCH'), width: '110', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '92', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '92', styleName: 'text-center' },
    {
      fieldName: 'wkGrpCd',
      header: t('MSG_TXT_WK_GRP'),
      width: '166',
      styleName: 'text-center',
      rules: 'required',
      options: codes.WK_GRP_CD,
      editor: {
        type: 'dropdown',
      },
    },
    {
      fieldName: 'rsbDvCd',
      header: t('MSG_TXT_RSB'),
      width: '122',
      styleName: 'text-center',
      options: codes.RSB_DV_CD,
      editor: {
        type: 'dropdown',
      } },
    {
      fieldName: 'wkcrCd',
      header: t('MSG_TXT_CO'),
      width: '166',
      styleName: 'text-center',
      rules: 'required',
      options: codes.WKCR_CD,
      editor: {
        type: 'dropdown',
      } },
    { fieldName: 'cntrDt', header: t('MSG_TXT_ENTCO_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'vlStrtDt',
      header: t('MSG_TXT_APPLY_DT'),
      width: '186',
      styleName: 'text-center',
      rules: 'required',
      datetimeFormat: 'date',
      editor: {
        type: 'date',
      } },
    { fieldName: 'vlEnddt',
      header: t('MSG_TXT_END_DT'),
      width: '186',
      styleName: 'text-center',
      rules: 'required',
      datetimeFormat: 'date',
      editor: {
        type: 'date',
      } },
    { fieldName: 'cralLocaraTno',
      header: t('MSG_TXT_BUSINS_PH_NO'),
      width: '156',
      styleName: 'text-center',
      editor: {
        maxLength: 14,
      },
    },
    { fieldName: 'mexnoEncr', visible: false },
    { fieldName: 'cralIdvTno', visible: false },
    { fieldName: 'wkGrpCdNm', visible: false },
    { fieldName: 'ogTpCd', visible: false },
    { fieldName: 'dtaDlYn', visible: false },
  ];

  data.setFields(columns.map((item) => ({ fieldName: item.fieldName })));
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEditable = (grid, index) => {
    if (!gridUtil.isCreatedRow(grid, index.dataRow) && ['dgr1LevlOgNm', 'dgr2LevlOgNm', 'prtnrNo', 'prtnrKnm', 'rsbDvCd', 'cntrDt'].includes(index.column)) {
      return false;
    }
  };

  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      await fetchData();
    }
  };

  view.onGetEditValue = (grid, index, editResult) => {
    if (index.column === 'wkGrpCd') {
      grid.setValue(index.dataRow, 'wkGrpCdNm', editResult.text);
    }
  };

  view.onValidate = async (g, index) => {
    const { cralLocaraTno } = g.getValues(index.dataRow);
    if (cralLocaraTno.replaceAll('-', '').length > 0) {
      if (cralLocaraTno.replaceAll('-', '').length !== 11) {
        return t('MSG_ALT_TEL_NO_IN');
      }
    }
  };
});

</script>
<style scoped>
</style>
