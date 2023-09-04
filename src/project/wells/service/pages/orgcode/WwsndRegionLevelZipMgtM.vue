<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SND (조직관리)
 2. 프로그램 ID : WwsndRegionLevelZipMgtM - 급지 우편번호 관리
 3. 작성자 : hyewon.kim
 4. 작성일 : 2022.12.06
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 급지 우편번호 관리 (http://localhost:3000/#/service/wwsnd-region-level-zip-mgt)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 우편번호 -->
        <kw-search-item :label="$t('MSG_TXT_ZIP')">
          <kw-input
            v-model="searchParams.zipFrom"
            type="text"
            mask="#####"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.zipTo"
            type="text"
            mask="#####"
          />
        </kw-search-item>
        <!-- 광역시/도 -->
        <kw-search-item :label="$t('MSG_TXT_MGPO')">
          <kw-select
            v-model="searchParams.ctpvNm"
            :options="ctpvs"
            first-option="all"
            option-label="ctpv"
            option-value="ctpvNm"
            @update:model-value="onUpdateCtcty"
          />
        </kw-search-item>
        <!-- 시군구 -->
        <kw-search-item :label="$t('MSG_TXT_CTCTY')">
          <kw-select
            v-model="searchParams.ctctyNm"
            :options="ctctys"
            first-option="all"
            option-label="ctcty"
            option-value="ctctyNm"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <!-- 작업그룹 -->
        <kw-search-item
          :label="$t('MSG_TXT_WK_GRP')"
          required
        >
          <kw-select
            v-model="searchParams.wkGrpCd"
            :options="codes.WK_GRP_CD"
            :label="$t('MSG_TXT_WK_GRP')"
            rules="required"
          />
        </kw-search-item>
        <!-- 서비스센터 -->
        <kw-search-item :label="$t('MSG_TXT_SV_CNR')">
          <kw-select
            v-model="searchParams.ogId"
            :options="serviceCenter"
            first-option="all"
            option-label="ogNm"
            option-value="ogId"
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
            @change="fetchData"
          />
        </template>
        <!-- 저장 -->
        <kw-btn
          dense
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 엑셀 다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
      />

      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="fetchData"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useMeta, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import useSnCode from '~sms-wells/service/composables/useSnCode';

const { getDistricts, getServiceCenterOrgs } = useSnCode();

const { t } = useI18n();
const { getConfig } = useMeta();
const { notify } = useGlobal();
const { currentRoute } = useRouter();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const searchParams = ref({
  zipFrom: '',
  zipTo: '',
  ctpvNm: '',
  ctctyNm: '',
  wkGrpCd: '10',
  ogId: '',
});
let cachedParams = cloneDeep(searchParams.value);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'WK_GRP_CD',
  'LOCARA_MNGT_DV_CD',
  'LOCARA_VST_PRD_CD',
);

const serviceCenter = await getServiceCenterOrgs();
const ctpvs = ref([]);
const ctctys = ref([]);
ctpvs.value = (await getDistricts('sido')).map((v) => ({ ctpv: v.ctpvNm, ctpvNm: v.ctpvNm, ctpvCd: v.fr2pLgldCd }));

let cachedZips;
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/region-level-zips/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: zips, pageInfo: pagingResult } = res.data;

  cachedZips = cloneDeep(zips);

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(zips);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/region-level-zips/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onUpdateCtcty(val) {
  searchParams.value.ctctyNm = '';
  if (val) {
    const { ctpvCd } = ctpvs.value.find((v) => v.ctpvNm === val);
    ctctys.value = (await getDistricts('gu', ctpvCd)).map((v) => ({ ctcty: v.ctctyNm, ctctyNm: v.ctctyNm }));
  } else {
    ctctys.value = [];
  }
}

async function onClickSave() {
  const view = grdMainRef.value.getView();

  if (view.getCheckedItems().length === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return;
  }

  if (!await gridUtil.alertIfIsNotModified(view)) {
    const changedRows = gridUtil.getChangedRowValues(view).map((v) => ({ ...v, pdlvNo: v.pdlvNo === '' ? '0' : v.pdlvNo }));

    await dataService.put('/sms/wells/service/region-level-zips', changedRows.map((v) => ({ ...v, pdlvNo: v.pdlvNo === '' ? '0' : v.pdlvNo })));

    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'newAdrZip' },
    { fieldName: 'mgtCnt' },
    { fieldName: 'wrkCnt' },
    { fieldName: 'ctpvNm' },
    { fieldName: 'ctctyNm' },
    { fieldName: 'lawcEmdNm' },
    { fieldName: 'amtdNm' },
    { fieldName: 'rpbLocaraCd' },
    { fieldName: 'rpbLocaraGrpCd' },
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'vstDowVal' },
    { fieldName: 'emdSn' },
    { fieldName: 'fr2pLgldCd' },
    { fieldName: 'pdlvNo' },
    { fieldName: 'pdlvNm' },
    { fieldName: 'pdlvAdr' },
    { fieldName: 'ildYn' },
    { fieldName: 'placeOfDeliveries' },
  ];

  const columns = [
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'mgtCnt', header: t('MSG_TXT_SV_ACC'), width: '100', styleName: 'text-right' },
    { fieldName: 'wrkCnt', header: t('MSG_TXT_MLMN_ACTCS'), width: '100', styleName: 'text-right' },
    { fieldName: 'ctpvNm', header: t('MSG_TXT_CTPV_NM'), width: '100' },
    { fieldName: 'ctctyNm', header: t('MSG_TXT_CTCTY_NM'), width: '100' },
    { fieldName: 'lawcEmdNm', header: t('MSG_TXT_LGLD'), width: '100' },
    { fieldName: 'amtdNm', header: t('MSG_TXT_AMTD'), width: '100' },
    { fieldName: 'rpbLocaraCd', header: t('MSG_TXT_LOCARA_CMN_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'rpbLocaraGrpCd', header: t('MSG_TXT_LOCARA_GRP_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_CENTER_DIVISION'), width: '150' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_RPB_PRTNR_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_RPB_ICHR'), width: '100' },
    { fieldName: 'vstDowVal', header: t('MSG_TXT_VST_DOW'), width: '100', options: codes.LOCARA_VST_PRD_CD },
    {
      fieldName: 'pdlvNm',
      header: t('MSG_TXT_AMTD_RSDT_CNR'),
      width: '100',
      editable: true,
      editor: { type: 'list' },
      styleCallback: (grid, dataCell) => {
        const { placeOfDeliveries: pdlvs } = cachedZips[dataCell.index.itemIndex];
        const pdlvNm = pdlvs.map((v) => v.pdlvNm);

        return { editor: { type: 'list', labels: pdlvNm, values: pdlvNm }, editable: true };
      },
    },
    { fieldName: 'pdlvAdr', header: t('MSG_TXT_RSDT_CNR_ADR'), width: '100' },
    { fieldName: 'ildYn', header: t('MSG_TXT_ILD_DV'), width: '100', styleName: 'text-center' },
  ];

  const columnLayout = [
    'newAdrZip',
    'mgtCnt',
    'wrkCnt',
    'ctpvNm',
    'ctctyNm',
    'lawcEmdNm',
    'amtdNm',
    'rpbLocaraCd',
    'rpbLocaraGrpCd',
    'ogNm',
    'prtnrNo',
    'prtnrKnm',
    'vstDowVal',
    {
      direction: 'horizontal',
      items: [
        'pdlvNm',
        'pdlvAdr',
        'ildYn',
      ],
      header: {
        text: t('MSG_TXT_CEN_LOCARA'),
      },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.onGetEditValue = async (grid, index, editResult) => {
    grid.checkItem(index.itemIndex, true);

    if (isEmpty(editResult.value)) {
      grid.setValue(index.dataRow, 'pdlvNo', '');
      grid.setValue(index.dataRow, 'pdlvAdr', '');
      return;
    }

    const { placeOfDeliveries: pdlvs } = cachedZips[index.dataRow];
    const { pdlvNo, pdlvAdr } = pdlvs.find((v) => v.pdlvNm === editResult.value);

    grid.setValue(grid.getItemIndex(index.dataRow), index.fieldName, editResult.value);
    grid.setValue(grid.getItemIndex(index.dataRow), 'pdlvNo', pdlvNo);
    grid.setValue(grid.getItemIndex(index.dataRow), 'pdlvAdr', pdlvAdr);

    grid.commit();
  };
});

</script>
