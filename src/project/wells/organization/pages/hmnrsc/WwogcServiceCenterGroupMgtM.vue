<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcServiceCenterGroupMgtM - 서비스센터 조 관리
3. 작성자 : gs.piit158
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
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
          class="equal_division--1"
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevlDvCd1"
            :og-tp-cd="searchParams.ogTpCd"
            :base-ym="searchParams.baseYm"
            :start-level="1"
            :end-level="1"
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
            :options="codes.RSB_DV_CD.filter((v)=> v.prtsCodeId === 'W06')"
            :label="t('MSG_TXT_BZ_DV')"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_PRTNR_NUM_EMPL_NM')">
          <zwog-partner-search
            v-model:prtnr-no="searchParams.prtnrNo"
            class="w113"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_APPLY_DT')"
          required
        >
          <kw-date-picker
            v-model="searchParams.vlDt"
            rules="required"
            :label="t('MSG_TXT_APPLY_DT')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-size="visibleRows"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="onClickChangePage"
          />
        </template>
        <kw-btn
          v-permission:create
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
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <span>{{ $t('MSG_TXT_RFLT_APY_D') }}</span>
        <kw-date-picker
          v-model="saveParams.rfltAplyDt"
          dense
        />
        <span>{{ $t('MSG_TXT_RFLT_END_D') }}</span>
        <kw-date-picker
          v-model="saveParams.rfltEnddt"
          dense
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:create
          :label="t('MSG_BTN_BLK_RFLT')"
          dense
          grid-action
          @click="onClickAllSave"
        />
        <!--
        <span>{{ $t('MSG_TXT_CHECK_ATC_MARK') }}</span>
        <kw-checkbox
          v-model="saveParams.chk"
          :true-value="true"
          :false-value="false"
          :disable="pageInfo.totalCount === 0"
        />
        -->
      </kw-action-top>

      <ul class="filter-box mb12">
        <li class="filter-box__item">
          <p class="filter-box__item-label">
            {{ $t('MSG_TXT_FLTRING') }}
          </p>
          <!--
          <kw-option-group
            v-model="saveParams.chk"
            dense
            type="checkbox"
            :options="['체크한 항목만 표시']"
          />
          -->
          <kw-checkbox
            v-model="saveParams.chk"
            :true-value="true"
            :false-value="false"
            :disable="pageInfo.totalCount === 0"
            :label="t('MSG_TXT_CHECK_ATC_MARK')"
          />
        </li>
      </ul>

      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="visibleRows"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, defineGrid, getComponentType, codeUtil, gridUtil, useGlobal, useMeta } from 'kw-lib';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import ZwogPartnerSearch from '~sms-common/organization/components/ZwogPartnerSearch.vue';
import { getPhoneNumber } from '~sms-common/organization/utils/ogUtil';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash-es';

const { t } = useI18n();
const { notify } = useGlobal();
const dataService = useDataService();
const { currentRoute } = useRouter();
const { getConfig, getUserInfo, hasRoleNickName } = useMeta();
const { wkOjOgTpCd, ogTpCd } = getUserInfo();
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
  'RSB_DV_CD', // 직책
  'WK_GRP_CD', // 작업그룹
  'WKCR_CD', // 조
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  ogTpCd: wkOjOgTpCd === null ? ogTpCd : wkOjOgTpCd,
  ogLevlDvCd1: undefined,
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

const visibleRows = ref(10);

const headOffice = (ogTpCd === 'HR1') ? 'Y' : 'N'; /* 본사스텝 */
const siteManager = (hasRoleNickName('ROL_W6010') || hasRoleNickName('ROL_W6020')) ? 'Y' : 'N'; /* 현장관리자(센터장, 매니저) */

// 조회
async function fetchData() {
  return await dataService.get('/sms/wells/partner-engineer/joe-management/paging', { params: { ...searchParams.value, ...pageInfo.value } });
}

// 조회
async function onClickSearch() {
  grdMainRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  pageInfo.value.pageSize = visibleRows.value;
  pageInfo.value.pageSize += 1;
  saveParams.value.chk = false;
  const res = await fetchData();
  const { list, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  visibleRows.value = pageInfo.value.pageSize - 1;
  const view = grdMainRef.value.getView();

  if (siteManager === 'Y') {
    view.columnByName('wkGrpCd').visible = false;
    view.columnByName('wkcrCd').visible = false;
    view.columnByName('vlStrtdt').visible = false;
    view.columnByName('vlEnddt').visible = false;
  } else {
    view.columnByName('wkGrpCd').visible = true;
    view.columnByName('wkcrCd').visible = true;
    view.columnByName('vlStrtdt').visible = true;
    view.columnByName('vlEnddt').visible = true;
  }

  const data = view.getDataSource();
  data.checkRowStates(false);
  data.setRows(list);
  data.checkRowStates(true);
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/partner-engineer/joe-management/excel-download', { params: searchParams.value });

  if (siteManager === 'Y') {
    await gridUtil.exportView(view, {
      fileName: currentRoute.value.meta.menuName,
      timePostfix: true,
      exportData: res.data,
      hiddenColumns: ['wkGrpCd', 'wkcrCd', 'vlStrtdt', 'vlEnddt'],
    });
  } else {
    await gridUtil.exportView(view, {
      fileName: currentRoute.value.meta.menuName,
      timePostfix: true,
      exportData: res.data,
    });
  }
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
  /* 임시주석
  if (dayjs().format('YYYYMMDD') > saveParams.value.rfltAplyDt
    || dayjs().format('YYYYMMDD') > saveParams.value.rfltEnddt) {
    notify(t('MSG_TXT_APY_DT_CONF'));
    return;
  }
  */
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
    obj.vlStrtdt = saveParams.value.rfltAplyDt;
    obj.vlEnddt = saveParams.value.rfltEnddt;
  });

  await dataService.post('/sms/wells/partner-engineer/joe-management', checkedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }

  const changeRows = gridUtil.getChangedRowValues(view);

  if (changeRows > 0) {
    if (!await gridUtil.validate(view)) { return; }
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const item of changeRows) {
    if (isEmpty(item.vlStrtdt) || isEmpty(item.vlEnddt)) {
      notify(t('MSG_TXT_APY_DT_CONF'));
      return;
    }
    /* 임시주석
    if (dayjs().format('YYYYMMDD') > item.vlStrtDt
      || dayjs().format('YYYYMMDD') > item.vlEnddt) {
      notify(t('MSG_TXT_APY_DT_CONF'));
      return;
    }
    */
    if (item.vlStrtdt > item.vlEnddt) {
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
  });

  await dataService.post('/sms/wells/partner-engineer/joe-management', changeRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

function onClickChangePage(val1, val2) {
  visibleRows.value = val2;
  pageInfo.value.pageSize = visibleRows.value;
  onClickSearch();
}

watch(() => saveParams.value.chk, async (newVal) => {
  if (newVal) {
    const view = grdMainRef.value.getView();
    const changeRows = gridUtil.getChangedRowValues(view);
    const dataSource = view.getDataSource();
    dataSource.checkRowStates(false);
    view.getDataSource().setRows(changeRows);
    view.checkAll(true);
    dataSource.checkRowStates(true);
  } else {
    await onClickSearch();
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_AFL_CNTR_CD'), width: '162', styleName: 'text-center' }, // 소속(센터)
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG_CD'), width: '130', styleName: 'text-center' }, // 소속코드
    // { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_BRANCH'), width: '125', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '130', styleName: 'text-center' }, // 성명
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '92', styleName: 'text-center' }, // 번호
    {
      fieldName: 'wkGrpCd',
      header: t('MSG_TXT_WK_GRP'),
      width: '144',
      styleName: 'text-center',
      rules: 'required',
      options: codes.WK_GRP_CD,
      editor: {
        type: 'dropdown',
      },
    }, // 작업그룹
    {
      fieldName: 'rsbDvCd',
      header: t('MSG_TXT_RSB'),
      width: '110',
      styleName: 'text-center',
      options: codes.RSB_DV_CD,
      editor: {
        type: 'dropdown',
      },
    }, // 직책
    { fieldName: 'pstnDvNm', header: t('MSG_TXT_ROLE_1'), width: '130', styleName: 'text-center' }, // 직무
    {
      fieldName: 'wkcrCd',
      header: t('MSG_TXT_CO'),
      width: '100',
      styleName: 'text-center',
      rules: 'required',
      options: codes.WKCR_CD,
      editor: {
        type: 'dropdown',
      },
    }, // 조
    { fieldName: 'cntrDt', header: t('MSG_TXT_ENTCO_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' }, // 입사일자
    { fieldName: 'vlStrtdt',
      header: t('MSG_TXT_APPLY_DT'),
      width: '130',
      styleName: 'text-center',
      // rules: 'required',
      datetimeFormat: 'date',
      editor: {
        type: 'date',
      },
    }, // 적용일자
    { fieldName: 'vlEnddt',
      header: t('MSG_TXT_END_DT'),
      width: '130',
      styleName: 'text-center',
      // rules: 'required',
      datetimeFormat: 'date',
      editor: {
        type: 'date',
      },
    }, // 종료일자
    { fieldName: 'cralLocaraTno',
      header: t('MSG_TXT_BUSINS_PH_NO'),
      width: '156',
      styleName: 'text-center',
      editor: {
        type: 'telephone',
      },
    }, // 업무용전화번호
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

  // 편집여부
  view.onCellEditable = (grid, index) => {
    if (['wkGrpCd', 'wkcrCd', 'vlStrtdt', 'vlEnddt', 'cralLocaraTno'].includes(index.column) && headOffice === 'Y') {
      return true;
    } if (['cralLocaraTno'].includes(index.column) && siteManager === 'Y') {
      return true;
    }
    return false;
  };

  // 스크롤 페이징
  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      pageInfo.value.pageSize = visibleRows.value;
      pageInfo.value.pageSize += 1;
      const res = await fetchData();
      const { pageInfo: pagingResult } = res.data;
      pageInfo.value = pagingResult;
      visibleRows.value = pageInfo.value.pageSize - 1;
      data.checkRowStates(false);
      data.addRows(res.data.list);
      data.checkRowStates(true);
    }
  };

  // 작업조명 가져오기
  view.onGetEditValue = (grid, index, editResult) => {
    if (index.column === 'wkGrpCd') {
      grid.setValue(index.dataRow, 'wkGrpCdNm', editResult.text);
    }
  };
});

</script>
<style scoped>
</style>
