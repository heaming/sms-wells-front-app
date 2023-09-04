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
        :label="$t('MSG_TXT_APLC_Y')"
        required
      >
        <kw-date-picker
          v-model="searchParams.aplcDt"
          type="year"
          rules="required"
          :label="$t('MSG_TXT_APLC_Y')"
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
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { modal, notify, ok, alert } = useGlobal();
const { getConfig, getUserInfo } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();
const userInfo = getUserInfo;
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;

const grdSubRef = ref(getComponentType('KwGrid'));
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const searchParams = ref({
  aplcDt: dayjs().format('YYYY'),
  clinrNm: '',
  bldCd: '',
  bldNm: '',
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

async function fetchData() {
  const res = await dataService.get('/sms/wells/closing/expense/cleaners/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: pages, pageInfo: pagingResult } = res.data;
  const subView = grdSubRef.value.getView();
  pageInfo.value = pagingResult;
  await subView.getDataSource().setRows(pages);
  await subView.resetCurrent();
  // view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

async function onClickRegister() {
  const { result } = await modal({
    component: 'WwdcdCleanerRegistrationMgtP', // W-CL-U-0093P02
    componentProps: {
      configGroup: '',
    },
  });
  if (result) {
    notify(t('MSG_ALT_SAVE_DATA'));
    await onClickSearch();
  }
}

async function onClickDelete() {
  const view = grdSubRef.value.getView();
  const checkedRows = await gridUtil.confirmDeleteCheckedRows(view);
  const deleteRows = [];
  let authCount = 0;
  let checkCount = 0;
  checkedRows.forEach((checkedRow) => {
    const registYearMonth = checkedRow.fstRgstDtm.replace('-', '').substring(0, 6);
    const currentYearMonth = dayjs.format('YYYYMM'); // 현재년월
    if (userInfo.baseRleCd === 'W1020' && registYearMonth === currentYearMonth) {
      deleteRows.push(checkedRow);
    } else {
      if (userInfo.baseRleCd !== 'W1020') {
        authCount += 1;
      }
      if (registYearMonth !== currentYearMonth) {
        checkCount += 1;
      }
    }
  });
  if (authCount > 0) {
    alert(t('삭제 권한이 없습니다.'));
    return;
  }
  if (checkCount > 0) {
    alert(t('현재 년월이 아닌 대상이 포함되어있습니다.'));
    return;
  }
  if (deleteRows.length > 0) {
    const clinrRgnos = deleteRows.map(({ clinrRgno }) => clinrRgno);
    await dataService.delete('/sms/wells/closing/expense/cleaners', { data: [...clinrRgnos] });
    fetchData();
  }
  ok();
}

async function onClickExcelDownload() {
  const view = grdSubRef.value.getView();
  const response = await dataService.get('/sms/wells/closing/expense/cleaners/excel-download', { params: cachedParams });

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
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DTM'), width: '174', styleName: 'text-center', datetimeFormat: 'datetime' }, // 등록일시
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_CH_DTM'), width: '174', styleName: 'text-center', datetimeFormat: 'datetime' }, // 변경일시
    { fieldName: 'clinrNm', header: t('MSG_TXT_CLINR'), width: '200', styleName: 'rg-button-link', renderer: { type: 'button' } }, // 청소원
    { fieldName: 'bldCd', visible: false }, // 빌딩 // CD
    { fieldName: 'bldNm', header: t('MSG_TXT_BUILDING'), width: '200', styleName: 'text-left' }, // 빌딩 //NM
    { fieldName: 'aplcDt', header: t('MSG_TXT_APPL_DATE'), width: '200', styleName: 'text-center', dataType: 'date', datetimeFormat: 'datetime' }, // 신청일
    { fieldName: 'aplcnsNm', header: t('MSG_TXT_APPL_USER'), width: '200', styleName: 'text-center' }, // 신청자
    { fieldName: 'aplcPrtnrNo', visible: false }, // 신청자 사번
    { fieldName: 'cntrwApnFileId',
      header: t('MSG_TXT_CNTRW'), // 계약서
      width: '200',
      styleName: 'text-center',
      renderer: { type: 'button', hideWhenEmpty: false },
      dataType: 'file',
      editor: {
        type: 'file',
        attachDocumentId: 'cntrwApnFileId',
        attachGroupId: 'ATG_DCD_CLING_COST',
        downloadable: true,
        multiple: false,
        editable: false,
      },
      styleCallback: (grid, model) => {
        if (!isEmpty(model.value.__atthDocumentId)) {
          return {
            styleName: 'text-center rg-file-button',
          };
        }
        return {
          styleName: 'text-center rg-file-hide-button',
        };
      },
    },
    { fieldName: 'cntrLroreApnFileId',
      header: t('MSG_TXT_A_CON_TERM_AGE'), // 계약해지원
      width: '200',
      styleName: 'text-center',
      renderer: { type: 'button', hideWhenEmpty: false },
      dataType: 'file',
      editor: {
        type: 'file',
        attachDocumentId: 'cntrLroreApnFileId',
        attachGroupId: 'ATG_DCD_CLING_COST',
        downloadable: true,
        multiple: false,
        editable: false,
      },
      styleCallback: (grid, model) => {
        if (!isEmpty(model.value.__atthDocumentId)) {
          return {
            styleName: 'text-center rg-file-button',
          };
        }
        return {
          styleName: 'text-center rg-file-hide-button',
        };
      },
    },
    { fieldName: 'idfApnFileId',
      header: t('MSG_TXT_IDF_CY'), // 신분증사본
      width: '200',
      styleName: 'text-center',
      renderer: { type: 'button', hideWhenEmpty: false },
      dataType: 'file',
      editor: {
        type: 'file',
        attachDocumentId: 'idfApnFileId',
        attachGroupId: 'ATG_DCD_CLING_COST',
        downloadable: true,
        multiple: false,
        editable: false,
      },
      styleCallback: (grid, model) => {
        if (!isEmpty(model.value.__atthDocumentId)) {
          return {
            styleName: 'text-center rg-file-button',
          };
        }
        return {
          styleName: 'text-center rg-file-hide-button',
        };
      },
    },
    { fieldName: 'bnkbApnFileId',
      header: t('MSG_TXT_BNKB_CY'), // 통장사본
      width: '200',
      styleName: 'text-center',
      renderer: { type: 'button', hideWhenEmpty: false },
      dataType: 'file',
      editor: {
        type: 'file',
        attachDocumentId: 'bnkbApnFileId',
        attachGroupId: 'ATG_DCD_CLING_COST',
        downloadable: true,
        multiple: false,
        editable: false,
      },
      styleCallback: (grid, model) => {
        if (!isEmpty(model.value.__atthDocumentId)) {
          return {
            styleName: 'text-center rg-file-button',
          };
        }
        return {
          styleName: 'text-center rg-file-hide-button',
        };
      },
    }, // 통장사본
    { fieldName: 'fmnCoSpptAmt', header: t('MSG_TXT_CO_SUFD_MM'), width: '182', styleName: 'text-right', dataType: 'number' }, // 회사지원금(월)
    { fieldName: 'clinrFxnAmt', header: t('MSG_TXT_FXN_AMT_MM'), width: '182', styleName: 'text-right', dataType: 'number' }, // 고정금(월)
    { fieldName: 'taxDdctam', header: t('MSG_TXT_TAX_DDTN_WON'), width: '182', styleName: 'text-right', dataType: 'number' }, // 세금공제(원)
    { fieldName: 'amt', header: t('MSG_TXT_ACL_DSB_AMT_WON'), width: '182', styleName: 'text-right', dataType: 'number' }, // 실지급액(원)
    { fieldName: 'wrkStrtdt', header: t('MSG_TXT_WRK_STRT_DT'), width: '182', styleName: 'text-center', dataType: 'date', datetimeFormat: 'YYYY-MM-DD' }, // 근무시작일자
    { fieldName: 'wrkEnddt', header: t('MSG_TXT_WRK_END_DT'), width: '182', styleName: 'text-center', dataType: 'date', datetimeFormat: 'YYYY-MM-DD' }, // 근무종료일자
    { fieldName: 'workStatus', header: t('MSG_TXT_WRK_YN'), width: '182', styleName: 'text-center' }, // 근무여부
    { fieldName: 'rrnoEncr', header: t('MSG_TXT_RRNO'), width: '182', styleName: 'text-center' }, // 주민등록번호
    { fieldName: 'telNum', header: t('MSG_TXT_CONTACT'), width: '182', styleName: 'text-center' }, // 연락처
    { fieldName: 'address', header: t('MSG_TXT_RRGT_ADR'), width: '182', styleName: 'text-right' }, // 주민등록상의 주소
    { fieldName: 'bnkCd', visible: false }, // 은행 // CD
    { fieldName: 'bnkNm', header: t('MSG_TXT_BNK_NM'), width: '182', styleName: 'text-center' }, // 은행명
    { fieldName: 'acnoEncr', header: t('MSG_TXT_AC_NO'), width: '182', styleName: 'text-center' }, // 계좌번호
  ];

  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.onCellItemClicked = (grid, { column, itemIndex }) => {
    // TODO.파일 업로드 개발 완료 되면 수정해야됨
    // 참고 ZdecRdsAnAccountErrorMgtService > saveAttachFile
    const { clinrRgno, aplcPrtnrNo, result } = grid.getValues(itemIndex);

    if (column === 'cntrwApnFileId') {
      // 계약서
    } else if (column === 'cntrLroreApnFileId') {
      // 계약해지원
    } else if (column === 'idfApnFileId') {
      // 신분증사본
    } else if (column === 'bnkbApnFileId') {
      // 통장사본
    } else if (column === 'clinrNm') {
      modal({
        component: 'WwdcdCleanerRegistrationMgtP', // W-CL-U-0093P02
        componentProps: { clinrRgno, aplcPrtnrNo },
      });
      if (result) {
        notify(t('MSG_ALT_SAVE_DATA'));
        onClickSearch();
      }
    }
  };
});
</script>

<style scoped>
</style>
