<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC (배정관리)
2. 프로그램 ID : WwsncResponsibleAreaCodeMgtM - 책임지역 지역코드 관리
3. 작성자 : yeonghwa.cheon
4. 작성일 : 2022.11.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 책임지역 지역코드 관리 (http://localhost:3000/#/service/wwsnc-responsible-area-code-mgt)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row cols="4">
        <!--우편번호-->
        <kw-search-item
          :label="$t('MSG_TXT_ZIP')"
        >
          <kw-input
            v-model="searchParams.zipFrom"
            mask="#####"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.zipTo"
            mask="#####"
          />
        </kw-search-item>
        <!--광역시/도-->
        <kw-search-item
          :label="$t('MSG_TXT_MGPO')"
        >
          <kw-select
            v-model="searchParams.fr2pLgldCd"
            :options="sido"
            first-option="all"
            option-label="ctpvNm"
            option-value="fr2pLgldCd"
            @update:model-value="changeSido"
          />
        </kw-search-item>
        <!--시군구-->
        <kw-search-item
          :label="$t('MSG_TXT_CTCTY')"
        >
          <kw-select
            v-model="searchParams.ctctyNm"
            :options="sigungu"
            first-option="all"
          />
        </kw-search-item>
        <!--서비스센터-->
        <kw-search-item
          :label="$t('MSG_TXT_SV_CNR')"
        >
          <kw-select
            v-model="searchParams.ogId"
            :options="svcCode"
            first-option="all"
            option-label="ogNm"
            option-value="ogId"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row cols="4">
        <!--작업그룹-->
        <kw-search-item
          :label="$t('MSG_TXT_WK_GRP')"
        >
          <kw-select
            v-model="searchParams.wkGrpCd"
            :options="codes.WK_GRP_CD"
          />
        </kw-search-item>
        <!--적용일자-->
        <kw-search-item
          :label="$t('MSG_TXT_APPLY_DT')"
        >
          <kw-date-picker
            v-model="searchParams.applyDate"
            rule="reauired"
          />
        </kw-search-item>
        <!--지역코드-->
        <kw-search-item
          :label="$t('MSG_TXT_LOCARA_CD')"
        >
          <kw-input
            v-model="searchParams.locaraCdFrom"
            maxlength="4"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.locaraCdTo"
            maxlength="4"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
          />
        </template>
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
        <!-- <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
        /> -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :disable="pageInfo.totalCount === 0"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import {
  codeUtil,
  defineGrid,
  getComponentType,
  useDataService,
  useMeta,
  gridUtil,
  useGlobal,
} from 'kw-lib';
import { cloneDeep } from 'lodash-es';

import dayjs from 'dayjs';
import smsCommon from '~sms-wells/service/composables/useSnCode';

const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();

const {
  getDistricts,
} = smsCommon();

const {
  // modal,
  // alert,
  // confirm,
  notify,
} = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const now = dayjs();
const svcCode = (await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } })).data;
const sido = await getDistricts('sido');
const sigungu = ref([]);

let cachedParams;
const codes = await codeUtil.getMultiCodes(
  'WK_GRP_CD',
  'COD_PAGE_SIZE_OPTIONS',
);
const searchParams = ref({
  zipFrom: '',
  zipTo: '',
  fr2pLgldCd: '',
  ctctyNm: '',
  ogId: '',
  wkGrpCd: '10',
  applyDate: now.format('YYYYMMDD'),
  locaraCdFrom: '',
  locaraCdTo: '',
});
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function changeSido() {
  searchParams.value.ctctyNm = '';
  if (searchParams.value.fr2pLgldCd === '') {
    sigungu.value = [];
  } else {
    sigungu.value = (await getDistricts('gu', searchParams.value.fr2pLgldCd)).map((v) => ({ codeId: v.ctctyNm, codeName: v.ctctyNm }));
  }
}

let cachedCodes;
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/responsible-area-codes', { params: cachedParams });
  const products = res.data;
  cachedCodes = cloneDeep(products);
  pageInfo.value.totalCount = res.data.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(products);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/responsible-area-codes', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
    checkBar: 'hidden',
  });
}

// 저장 시 grid checkbar에 check 된 row만 저장.
async function onClickSave() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);
  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  if (await gridUtil.validate(view, { isCheckedOnly: true })) {
    await dataService.post('/sms/wells/service/responsible-area-codes', chkRows.filter((v) => v.rowState === 'updated'));
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'fr2pLgldCd' },
    { fieldName: 'zipList' },
    // { fieldName: 'mgtCnt' },
    // { fieldName: 'wrkCnt' },
    { fieldName: 'ctpvNm' },
    { fieldName: 'ctctyNm' },
    { fieldName: 'lawcEmdNm' },
    { fieldName: 'amtdNm' },
    { fieldName: 'rpbLocaraCd' },
    { fieldName: 'changeCodes' },
    { fieldName: 'chLocaraCd' },
    { fieldName: 'apyStrtdt' },
    { fieldName: 'apyEnddt' },
    { fieldName: 'rpbLocaraGrpCd' },
    { fieldName: 'ogNm' },
    { fieldName: 'ichrPrtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'vstDowNm' },
    { fieldName: 'mmtAvLdtm' },
    { fieldName: 'locaraCenStruAdr' }, // 화면표시
    { fieldName: 'vstDowVal' },
    { fieldName: 'locaraSn' },
  ];

  const columns = [
    {
      fieldName: 'zipList',
      header: t('MSG_TXT_ZIP'),
      width: '100',
      styleName: 'text-center',
    },
    // {
    //   fieldName: 'mgtCnt',
    //   header: t('MSG_TXT_SV_ACC'),
    //   width: '100',
    //   styleName: 'text-right',
    // },
    // {
    //   fieldName: 'wrkCnt',
    //   header: t('MSG_TXT_MLMN_ACTCS'),
    //   width: '100',
    //   styleName: 'text-right',
    // },
    {
      fieldName: 'ctpvNm',
      header: t('MSG_TXT_CTPV_NM'),
      width: '150',
    },
    {
      fieldName: 'ctctyNm',
      header: t('MSG_TXT_CTCTY_NM'),
      width: '150',
    },
    {
      fieldName: 'lawcEmdNm',
      header: t('MSG_TXT_EMD_NM'),
      width: '150',
    },
    {
      fieldName: 'amtdNm',
      header: t('MSG_TXT_AMTD_NM'),
      width: '150',
    },
    {
      fieldName: 'rpbLocaraCd',
      header: t('MSG_TXT_LOCARA_CD'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'chLocaraCd',
      header: t('MSG_TXT_CH_LOCARA'),
      width: '100',
      styleName: 'text-center',
      editable: true,
      editor: { type: 'list' },
      styleCallback: (grid, dataCell) => {
        const { changeCodes } = cachedCodes[dataCell.index.itemIndex];
        const rpbLocaraCd = changeCodes.map((v) => v.rpbLocaraCd);

        return { editor: { type: 'list', labels: rpbLocaraCd, values: rpbLocaraCd }, editable: true };
      },
      rules: 'required',
    },
    {
      fieldName: 'apyStrtdt',
      header: t('MSG_TXT_APY_STRT_DAY'),
      width: '150',
      styleName: 'text-center',
      editable: true,
      editor: { type: 'btdate' },
      rules: 'required',
    },
    {
      fieldName: 'apyEnddt',
      header: t('MSG_TXT_APY_END_DAY'),
      width: '150',
      styleName: 'text-center',
      editable: true,
      editor: { type: 'btdate' },
      rules: 'required',
    },
    {
      fieldName: 'rpbLocaraGrpCd',
      header: t('MSG_TXT_LOCARA_GRP_CD'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'ogNm',
      header: t('MSG_TXT_CENTER_DIVISION'),
      width: '100',
    },
    {
      fieldName: 'ichrPrtnrNo',
      header: t('MSG_TXT_RPB_PRTNR_NO'),
      width: '100',
      styleName: 'text-center',
    },
    {
      fieldName: 'prtnrKnm',
      header: t('MSG_TXT_RPB_ICHR_NM'),
      width: '100',
    },
    {
      fieldName: 'vstDowNm',
      header: t('MSG_TXT_VST_DOW'),
      width: '100',
    },
    {
      fieldName: 'mmtAvLdtm',
      header: t('MSG_TXT_MMT_AV_NED_HH'),
      width: '100',
    },
    {
      fieldName: 'locaraCenStruAdr',
      header: t('MSG_TXT_LOCARA_CEN_STRU_ADR'),
      width: '100',
    },
  ];

  const columnLayout = [
    'zipList',
    // 'mgtCnt',
    // 'wrkCnt',
    {
      header: t('MSG_TXT_LGLD'), // colspan title
      direction: 'horizontal', // merge type
      items: ['ctpvNm', 'ctctyNm', 'lawcEmdNm'],
    },
    'amtdNm',
    'rpbLocaraCd',
    'chLocaraCd',
    'apyStrtdt',
    'apyEnddt',
    'rpbLocaraGrpCd',
    'ogNm',
    'ichrPrtnrNo',
    'prtnrKnm',
    'vstDowNm',
    'mmtAvLdtm',
    'locaraCenStruAdr',
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout(columnLayout);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;
  view.setFixedOptions({ colCount: 1, resizable: true });

  view.onCellEdited = (grid, itemIndex, row, field) => {
    grid.checkItem(itemIndex, true);

    const { apyStrtdt, apyEnddt } = grid.getValues(itemIndex);
    if (field === 10 && apyStrtdt > apyEnddt) {
      grid.setValue(itemIndex, 'apyEnddt', apyStrtdt);
    } else if (field === 11 && apyStrtdt > apyEnddt) {
      grid.setValue(itemIndex, 'apyStrtdt', apyEnddt);
    }
  };
});

</script>
<style scoped>
</style>
