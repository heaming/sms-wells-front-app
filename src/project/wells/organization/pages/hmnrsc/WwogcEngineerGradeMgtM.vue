<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcEngineerGradeMgtM - 서비스센터 등급관리
3. 작성자 : yonghee.han
4. 작성일 : 2023-05-08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 서비스센터 등급 관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_MNGT_DV')">
          <kw-select
            v-model="searchParams.ogTpCd"
            :options="codes.OG_TP_CD"
            disable
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
          class="equal_division--1"
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevlDvCd1"
            v-model:og-levl-dv-cd2="searchParams.ogLevlDvCd2"
            :og-tp-cd="searchParams.ogTpCd"
            :base-ym="searchParams.baseYm"
            :start-level="1"
            :end-level="1"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_RSB')">
          <kw-select
            v-model="searchParams.rsbDvCd"
            :options="codes.RSB_DV_CD.filter((v)=> v.prtsCodeId === 'W06')"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_RGST_YN')">
          <kw-checkbox
            v-model="searchParams.chk"
            :label="t('MSG_TXT_NO_RGS')"
            :true-value="Y"
            :false-value="N"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="pageInfo.totalCount" />
        </template>
        <kw-btn
          v-permission:create
          grid-action
          :label="t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:create
          icon="upload_on"
          secondary
          dense
          :label="t('MSG_TXT_EXCEL_UPLOAD')"
          @click="onClickExcelUpload"
        />
        <kw-btn
          v-permission:download
          icon="download_on"
          secondary
          dense
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :visible-rows="(pageInfo.totalCount === 0) ? '10' : pageInfo.pageSize - 1"
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
import dayjs from 'dayjs';

const { t } = useI18n();
const dataService = useDataService();
const { notify, modal } = useGlobal();
const { currentRoute } = useRouter();
const { getUserInfo } = useMeta();
const { wkOjOgTpCd, ogTpCd } = getUserInfo();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 20,
});

const codes = await codeUtil.getMultiCodes(
  'OG_TP_CD',
  'RSB_DV_CD',
  'PRTNR_GD_CD',
);

const searchParams = ref({
  ogTpCd: wkOjOgTpCd === null ? ogTpCd : wkOjOgTpCd,
  ogLevlDvCd1: undefined,
  ogLevlDvCd2: undefined,
  rsbDvCd: undefined,
  baseYm: dayjs().format('YYYYMM'),
  chk: 'N',
});

const now = dayjs().format('YYYYMM');

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/partner-engineer/engineer-grade/paging', { params: { ...searchParams.value, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const data = view.getDataSource();
  data.checkRowStates(false);
  data.addRows(list);
  data.checkRowStates(true);
}

// 조회버튼 클릭
async function onClickSearch() {
  grdMainRef.value.getData().clearRows();
  pageInfo.value.pageIndex = 1;
  await fetchData();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/partner-engineer/engineer-grade/excel-download', { params: searchParams.value });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);

  // eslint-disable-next-line no-restricted-syntax
  for (const item of changedRows) {
    // 임시조건제거
    // if (dayjs().format('YYYYMMDD') > item.apyStrtDt
    //   || dayjs().format('YYYYMMDD') > item.apytEnddt) {
    //   notify(t('MSG_TXT_APY_DT_CONF'));
    //   return;
    // }
    if (item.apyStrtDt > item.apyEnddt) {
      notify(t('MSG_TXT_APY_DT_CONF'));
      return;
    }
  }
  await dataService.post('/sms/wells/partner-engineer/engineer-grade', changedRows);
  notify(t('MSG_ALT_SAVE_DATA'));
  // await fetchData();
  await onClickSearch();
}

// 엑셀업로드
async function onClickExcelUpload() {
  const apiUrl = `sms/wells/partner-engineer/engineer-grade/excel-upload/${now}`;
  const templateId = 'FOM_EGER_GD';
  const {
    payload,
  } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });

  if (payload.status === 'S') {
    notify(t('MSG_ALT_SAVE_DATA'));
    await onClickSearch();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'dgr1LevlOgNm', header: t('MSG_TXT_AFL_CNTR_CD'), width: '152', styleName: 'text-center' }, // 소속(센터)
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG_CD'), width: '130', styleName: 'text-center' }, // 소속코드
    { fieldName: 'prtnrKnm',
      header: t('MSG_TXT_EMPL_NM'),
      width: '166',
      styleName: 'text-center',
    }, // 성명
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '110', styleName: 'text-center' }, // 번호
    { fieldName: 'rsbDvCd', header: t('MSG_TXT_RSB'), width: '106', styleName: 'text-center', options: codes.RSB_DV_CD }, // 직책
    { fieldName: 'pstnDvNm', header: t('MSG_TXT_ROLE_1'), width: '130', styleName: 'text-center' }, // 직무
    { fieldName: 'cntrDt', header: t('MSG_TXT_ENTCO_DT'), width: '130', styleName: 'text-center', datetimeFormat: 'date' }, // 입사일자
    {
      fieldName: 'prtnrGdCd',
      header: t('MSG_TXT_GD'),
      width: '166',
      styleName: 'text-center',
      rules: 'required',
      options: codes.PRTNR_GD_CD,
      editor: {
        type: 'dropdown',
      },
    }, // 등급
    { fieldName: 'apyStrtDt',
      header: t('MSG_TXT_APY_STRTDT'),
      width: '178',
      styleName: 'text-center',
      datetimeFormat: 'date',
      rules: 'required',
      editor: {
        type: 'date',
      },
    }, // 적용시작일자
    { fieldName: 'apyEnddt',
      header: t('MSG_TXT_APY_ENDDT'),
      width: '178',
      styleName: 'text-center',
      datetimeFormat: 'date',
      rules: 'required',
      editor: {
        type: 'date',
      },
    }, // 적용종료일자
    { fieldName: 'rmkCn', header: t('MSG_TXT_NOTE'), width: '499.7', styleName: 'text-left', editor: { maxLength: 4000 } }, // 비고
    { fieldName: 'ogTpCd', visible: false },
    { fieldName: 'dtaDlYn', visible: false },
  ];

  data.setFields(columns.map((item) => ({ fieldName: item.fieldName })));
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEditable = (grid, index) => {
    if (['prtnrGdCd', 'apyStrtDt', 'apyEnddt', 'rmkCn'].includes(index.column)) {
      return true;
    }
    return false;
  };

  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      await fetchData();
    }
  };
});

</script>
