<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNY
2. 프로그램 ID : WwsnyInstallSeparationCostMgtM - [W-SV-U-0158M01] 설치/분리비용 관리
3. 작성자 : kyunglyn.lee
4. 작성일 : 2023.04.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 설치 및 분리 비용을 관리하는 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <!-- 상품그룹: 상품그룹-->
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            @change="changePdGrpCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRDT_NM')"
          :colspan="2"
        >
          <!--            rules="required"-->
          <kw-select
            v-model="searchParams.pdCd"
            :options="pds"
            first-option="select"
            option-label="cdNm"
            option-value="cd"
            :disable="searchParams.pdGrpCd === '' "
            :label="$t('MSG_TXT_PRDT_NM')"
            class="w250"
            :rules="searchParams.pdGrpCd !== '' ? 'required' : '' "
          />
          <kw-field
            v-model="searchParams.apyMtrChk"
          >
            <template #default="{ field }">
              <!-- 현재적용자료 -->
              <kw-checkbox
                v-bind="field"
                :label="$t('MSG_TXT_CRTL_APY_MTR')"
              />
            </template>
          </kw-field>
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>
        <kw-btn
          grid-action
          :label="$t('MSG_BTN_DEL')"
          @click="onClickDelete"
        />
        <kw-btn
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          :disable="isDisable"
          @click="onClickAdd"
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
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_SAVE')"
          primary
          dense
          @click="onClickSave"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :visible-rows="pageInfo.pageSize"
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
import dayjs from 'dayjs';
import {
  codeUtil,
  defineGrid,
  getComponentType,
  useMeta,
  useDataService,
  gridUtil,
  notify,
} from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import smsCommon from '~sms-wells/service/composables/useSnCode';

const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const { getPartMaster } = smsCommon();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

/* 공통코드 */
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PD_GRP_CD', // 상품그룹
  'PRD_MNGT_TP_CD', // 주기관리유형코드
  'SEP_IST_CS_ATC_CD', // 분리 설치 비용 항목
  'SEP_IST_CS_DTL_CD', // 분리 설치 비용 상세
  'COD_YN',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
// const pdNm = ref([]);
// const pdtNm = ref([]);
/* 조회조건 */
const searchParams = ref({
  pdNm: '',
  pdCd: '', /* 상품코드 */
  pdGr: '1',
  apyMtrChk: 'N',
});
const isDisable = computed(() => (isEmpty(searchParams.value.pdGr)));

const pdsAll = ref([]);
const pds = ref([]);
async function changePdGrpCd() {
  if (searchParams.value.pdGrpCd) {
    pds.value = await getPartMaster(
      '4',
      searchParams.value.pdGrpCd,
      'M',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      'X', /* 단종여부Y/N, 만약 X로 데이터가 유입되면 단종여부를 조회하지 않음 */
    );
  } else pds.value = [];
  searchParams.value.pdCd = '';
}
changePdGrpCd();

pdsAll.value = await getPartMaster(
  '4',
  null,
  'M',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'X', /* 단종여부Y/N, 만약 X로 데이터가 유입되면 단종여부를 조회하지 않음 */
);

let cachedParams;
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/installation-separation-costs/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: installSeperationCsMgt, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  // if (pageInfo.value.totalCount === 0) {
  //   pageInfo.value.pageSize = 10;
  // } else {
  //   pageInfo.value.pageSize = Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE'));
  // }

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(installSeperationCsMgt);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

const now = dayjs();
async function onClickAdd() {
  const view = grdMainRef.value.getView();

  await gridUtil.insertRowAndFocus(view, 0, {
    pdCd: searchParams.value.pdCd,
    apyStrtdt: now.add('1', 'day').format('YYYYMMDD'),
    apyEnddt: '99991231' });
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  const deleteRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deleteRows.length > 0) {
    await dataService.delete('/sms/wells/service/installation-separation-costs', { data: [...deleteRows] });
  }
  if (isEmpty(pageInfo)) {
    await fetchData();
  }
}

const { currentRoute } = useRouter();
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/installation-separation-costs/excel-download', { params: searchParams.value });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSave() {
  const view = grdMainRef.value.getView();
  const realChkRows = gridUtil.getCheckedRowValues(view);
  const chkRows = gridUtil.getCheckedRowValues(view, { isChangedOnly: true });

  if (chkRows.length === 0 && realChkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }

  if (chkRows.length !== 0 && (realChkRows.length > chkRows.length)) {
    notify(t('MSG_ALT_NO_CHG_ROW_SELECT'));
    return;
  }

  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  await dataService.post('sms/wells/service/installation-separation-costs', chkRows);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

onMounted(async () => {
  // await onChangePdNm();
  // await onChangePdGr();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sellTpCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'sepIstCsAtcCd' },
    { fieldName: 'sepIstCsDtlCd' },
    { fieldName: 'apyStrtdt' },
    { fieldName: 'apyEnddt' },
    { fieldName: 'wkCsAmt', dataType: 'number' },
    { fieldName: 'recapSvYn' },
    { fieldName: 'rmkCn' },
    { fieldName: 'izSn' },
  ];

  const columns = [
    {
      fieldName: 'sellTpCd',
      header: {
        text: t('MSG_TXT_SEL_TYPE'),
        styleName: 'essential',
      },
      width: '110',
      // editable: true,
      editor: { type: 'list' },
      options: codes.PRD_MNGT_TP_CD,
      styleName: 'text-center',
      rules: 'required',
    }, // 판매유형
    {
      fieldName: 'pdCd',
      header: {
        text: t('MSG_TXT_PRDT_NM'),
        styleName: 'essential',
      },
      width: '270',
      editor: { type: 'list' },
      options: pdsAll.value,
      styleName: 'text-left',
      rules: 'required',
      displayCallback(grd, { dataRow }) {
        const pdCd = grd.getValue(dataRow, 'pdCd');
        return pdsAll.value.find((v) => v.cd === pdCd)?.cdNm;
      },
      styleCallback: () => ({ editor: { type: 'list',
        labels: pds.value.map((v) => v.cdNm),
        values: pds.value.map((v) => v.cd) } }),
    }, // 상품명
    {
      fieldName: 'sepIstCsAtcCd',
      header: {
        text: t('TXT_MSG_PD_HCLSF_ID'),
        styleName: 'essential',
      },
      width: '190',
      editor: { type: 'list' },
      options: codes.SEP_IST_CS_ATC_CD,
      styleName: 'text-left',
      rules: 'required',
      displayCallback(grd, idx) {
        const sepIstCsAtcCd = grd.getValue(idx.dataRow, 'sepIstCsAtcCd');
        return codes.SEP_IST_CS_ATC_CD.find((v) => ((v.codeId === sepIstCsAtcCd)))?.codeName;
      },
    }, // 대분류
    {
      fieldName: 'sepIstCsDtlCd',
      header: {
        text: t('TXT_MSG_PD_LCLSF_ID'),
        styleName: 'essential',
      },
      width: '160',
      editor: { type: 'list' },
      options: codes.SEP_IST_CS_DTL_CD,
      styleName: 'text-left',
      rules: 'required',
      displayCallback(grd, idx) {
        const sepIstCsDtlCd = grd.getValue(idx.dataRow, 'sepIstCsDtlCd');
        return codes.SEP_IST_CS_DTL_CD.find((v) => ((v.codeId === sepIstCsDtlCd)))?.codeName;
      },
    }, // 소분류
    {
      fieldName: 'apyStrtdt',
      header: {
        text: t('MSG_TXT_APY_STRT_DAY'),
        styleName: 'essential',
      },
      width: '150',
      editor: { type: 'btdate' },
      styleName: 'text-center',
      rules: 'required',
      datetimeFormat: 'date',
    }, // 적용시작일
    { fieldName: 'apyEnddt',
      header: t('MSG_TXT_APY_END_DAY'),
      width: '150',
      styleName: 'text-center',
      editable: false,
      datetimeFormat: 'date',
    }, // 적용종료일
    {
      fieldName: 'wkCsAmt',
      header: {
        text: t('MSG_TXT_UPRC_WON'),
        styleName: 'essential',
      },
      width: '120',
      editor: {
        type: 'number',
        inputCharacters: '0-9',
      },
      styleName: 'text-right',
      rules: 'required',
      numberFormat: '#,##0',
    }, // 단가(원)
    {
      fieldName: 'recapSvYn',
      header: {
        text: t('MSG_TXT_RECAP_SV'),
        styleName: 'essential',
      },
      width: '130',
      editor: { type: 'list' },
      options: codes.COD_YN,
      styleName: 'text-center',
      rules: 'required',
    }, // 항시유상서비스
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_NOTE'),
      width: '158',
      editor: {
        maxLength: 200,
      },
    }, // 비고
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  const columnLayout = [
    'sellTpCd', 'pdCd',
    {
      header: t('MSG_TXT_PROCS_DV'), // colspan title
      direction: 'horizontal', // merge type
      items: ['sepIstCsAtcCd', 'sepIstCsDtlCd'],
    }, // 처리구분
    'apyStrtdt', 'apyEnddt', 'wkCsAmt', 'recapSvYn', 'rmkCn',
  ];
  view.setColumnLayout(columnLayout);

  view.onCellEditable = (grid, itemIndex) => {
    if (!gridUtil.isCreatedRow(grid, itemIndex.dataRow)
    && ['sellTpCd', 'pdCd', 'sepIstCsAtcCd', 'sepIstCsDtlCd', 'apyStrtdt', 'wkCsAmt', 'recapSvYn', 'rmkCn'].includes(itemIndex.column)) {
      return false;
    }
  };
});
</script>

<style scoped>
</style>
