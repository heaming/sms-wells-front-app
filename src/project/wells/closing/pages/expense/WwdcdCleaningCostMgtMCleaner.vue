<!----
****************************************************************************************************
1. 모듈 : DCD
2. 프로그램 ID : WwdcdCleaningCostMgtMCleaner - 청소용품비 관리-청소원관리 / W-CL-U-0093M02

3. 작성자 : gs.piit172 kim juhyun
4. 작성일 : 2023.04.05
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 청소용품비 관리-청소원관리
****************************************************************************************************
--->
<template>
  <kw-search
    :modified-targets="['grdSub']"
    @search="onClickSearch()"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_APL_DATE')"
        required
      >
        <kw-date-picker
          v-model="searchParams.fstRgstDtm"
          type="year"
          rules="required"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_CLINR')">
        <kw-input
          v-model="searchParams.clinrNm"
        />
      </kw-search-item>
      <kw-search-item :label="$t('MSG_TXT_BUILDING')">
        <kw-input
          v-model="searchParams.bldNm"
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
        <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <kw-btn
        :label="$t('MSG_BTN_DEL')"
        grid-action
        dense
        @click="onClickDelete"
      />
      <kw-separator
        vertical
        inset
        spaced
      />
      <kw-btn
        icon="report"
        dense
        secondary
        :label="$t('MSG_TXT_RPT_BRWS')"
        @click="onClickOpenReport"
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
        :label="$t('MSG_BTN_RGST')"
        primary
        dense
        @click="onClickRegister"
      />
    </kw-action-top>

    <kw-grid
      ref="grdSubRef"
      name="grdSub"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrdSub"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, useMeta, codeUtil, getComponentType, useDataService, useGlobal, gridUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { modal, notify, ok } = useGlobal();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;

const grdSubRef = ref(getComponentType('KwGrid'));
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const searchParams = ref({
  fstRgstDtm: dayjs().format('YYYY'),
  clinrNm: '',
  bldCd: '',
  bldNm: '',
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

async function fetchData() {
  // TODO. 본사 영업담당자, 본사 담당자 구분 해야함
  const res = await dataService.get('/sms/wells/closing/expense/cleaner-management/paging', { params: { ...cachedParams, ...pageInfo } });
  const { list: pages, pageInfo: pagingResult } = res.data;

  const view = grdSubRef.value.getView();
  pageInfo.value = pagingResult;
  view.getDataSource().setRows(pages);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickRegister() {
  const { result } = await modal({
    component: 'WwdcdRegistrationAsACleanerMgtM', // W-CL-U-0093P02
    componentProps: {
      configGroup: '',
    },
  });
  if (result) {
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

async function onClickDelete() {
  const view = grdSubRef.value.getView();
  const deleteRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deleteRows.length > 0) {
    const clinrRgnos = deleteRows.map(({ clinrRgno }) => clinrRgno);
    await dataService.delete('/sms/wells/closing/expense/cleaner-management', { data: [...clinrRgnos] });
    fetchData();
  }
  ok();
}

async function onClickExcelDownload() {
  const view = grdSubRef.value.getView();
  const response = await dataService.get('/sms/wells/closing/expense/cleaner-management/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

async function onClickOpenReport() {
  // TODO. 오즈 개발완료되면 수정할 예정
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdSub = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'clinrRgno', visible: false }, // 청소원등록번호
    { fieldName: 'rcpYm', visible: false }, // 청소원등록번호
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DTM'), width: '174', styleName: 'text-center', dataType: 'date', datetimeFormat: 'datetime' }, // 등록일시
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_CH_DTM'), width: '174', styleName: 'text-center', dataType: 'date', datetimeFormat: 'datetime' }, // 변경일시
    { fieldName: 'clinrNm', header: t('MSG_TXT_CLINR'), width: '200', styleName: 'text-left' }, // 청소원
    { fieldName: 'bldCd', visible: false }, // 빌딩 // CD
    { fieldName: 'bldNm', header: t('MSG_TXT_BUILDING'), width: '200', styleName: 'text-left' }, // 빌딩 //NM
    { fieldName: 'aplcDt', header: t('MSG_TXT_APPL_DATE'), width: '200', styleName: 'text-center', dataType: 'date', datetimeFormat: 'datetime' }, // 신청일
    { fieldName: 'aplcnsNm', header: t('MSG_TXT_APPL_DATE'), width: '200', styleName: 'text-center' }, // 신청자
    { fieldName: 'cntrwApnFileId', header: t('MSG_TXT_CNTRW'), width: '200', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_BTN_CLINR_MNGT_BRWS') }, // 계약서
    { fieldName: 'cntrLroreApnFileId', header: t('MSG_TXT_A_CON_TERM_AGE'), width: '200', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_BTN_CLINR_MNGT_BRWS') }, // 계약해지원
    { fieldName: 'idfApnFileId', header: t('MSG_TXT_IDF_CY'), width: '200', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_BTN_CLINR_MNGT_BRWS') }, // 신분증사본
    { fieldName: 'bnkbApnFileId', header: t('MSG_TXT_IDF_CY'), width: '200', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_BTN_CLINR_MNGT_BRWS') }, // 통장사본
    { fieldName: 'fmnCoSpptAmt', header: t('MSG_TXT_CO_SUFD_MM'), width: '182', styleName: 'text-center' }, // 회사지원금(월)
    { fieldName: 'clinrFxnAmt', header: t('MSG_TXT_FXN_AMT_MM'), width: '182', styleName: 'text-center' }, // 고정금(월)
    { fieldName: 'taxDdctam', header: t('MSG_TXT_TAX_DDTN_WON'), width: '182', styleName: 'text-right', dataType: 'number' }, // 세금공제(원)
    { fieldName: 'amt', header: t('MSG_TXT_ACL_DSB_AMT_WON'), width: '182', styleName: 'text-right', dataType: 'number' }, // 실지급액(원)
    { fieldName: 'wrkStrtdt', header: t('MSG_TXT_WRK_STRT_DT'), width: '182', styleName: 'text-center', dataType: 'date', datetimeFormat: 'datetime' }, // 근무시작일자
    { fieldName: 'wrkEnddt', header: t('MSG_TXT_WRK_END_DT'), width: '182', styleName: 'text-center', dataType: 'date', datetimeFormat: 'datetime' }, // 근무종료일자
    { fieldName: 'workStatus', header: t('MSG_TXT_WRK_YN'), width: '182', styleName: 'text-center' }, // 근무여부
    { fieldName: 'rrnoEncr', header: t('MSG_TXT_RRNO'), width: '182', styleName: 'text-center' }, // 주민등록번호
    { fieldName: 'telNum', header: t('MSG_TXT_CONTACT'), width: '182', styleName: 'text-center' }, // 연락처
    { fieldName: 'address', header: t('MSG_TXT_RRGT_ADR'), width: '182', styleName: 'text-right' }, // 주민등록상의 주소
    { fieldName: 'bnkCd', visible: false }, // 은행 // CD
    { fieldName: 'bnkNm', header: t('MSG_TXT_BNK_NM'), width: '182', styleName: 'text-right' }, // 은행명
    { fieldName: 'acnoEncr', header: t('MSG_TXT_AC_NO'), width: '182', styleName: 'text-right' }, // 계좌번호
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellClicked = (grid, clickData) => {
    // TODO.파일 업로드 개발 완료 되면 수정해야됨
    // 참고 ZdecRdsAnAccountErrorMgtService > saveAttachFile
    if (clickData.column === 'cntrwApnFileId') {
      // 계약서
    } else if (clickData.column === 'cntrLroreApnFil') {
      // 계약해지원
    } else if (clickData.column === 'idfApnFileId') {
      // 신분증사본
    } else if (clickData.column === 'bnkbApnFileId') {
      // 통장사본
    }
  };

  view.onCellItemClicked = async (grid, { itemIndex }) => {
    const { clinrRgno, result } = gridUtil.getRowValue(grid, itemIndex);
    await modal({
      component: 'WwdcdRegistrationAsACleanerMgtM', // W-CL-U-0093P02
      componentProps: {
        configGroup: { clinrRgno },
      },
    });
    if (result) {
      notify(t('MSG_ALT_SAVE_DATA'));
      await fetchData();
    }
  };
});

</script>

<style scoped>
</style>
