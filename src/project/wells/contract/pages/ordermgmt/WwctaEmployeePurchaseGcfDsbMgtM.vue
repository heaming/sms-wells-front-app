<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwcteExpirationRstlCstCttAsnMngtM - 직원구매 상품권 관리
3. 작성자 : jihoon.kim
4. 작성일 : 2023.04.19
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U0087] - 년 기준 이상 구매 직원에 대해 상품권 지급 현황 관리 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 귀속년도 -->
        <kw-search-item :label="$t('MSG_TXT_BLNG_Y')">
          <kw-date-picker
            v-model="searchParams.istDt"
            type="year"
          />
        </kw-search-item>
        <!-- 직원구분 -->
        <kw-search-item :label="$t('MSG_TXT_EMPL_DV')">
          <kw-option-group
            v-model="searchParams.emplDv"
            type="radio"
            :options="[{ codeId: '1', codeName: t('MSG_TXT_EMPL') },
                       { codeId: '2', codeName: t('MSG_TXT_ENTRPRNR') }]"
          />
        </kw-search-item>
        <!-- 사번 -->
        <kw-search-item :label="$t('MSG_TXT_EPNO')">
          <kw-input
            v-model="searchParams.empNo"
            :maxlength="30"
            mask="################"
            icon="search"
            clearable
            @click-icon="onClickSearchUserId"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 휴대전화번호 -->
        <kw-search-item :label="$t('MSG_TXT_MPNO')">
          <kw-input
            v-model:model-value="searchParams.cntrCralTno"
            v-model:telNo0="searchParams.cralLocaraTno"
            v-model:telNo1="searchParams.mexnoEncr"
            v-model:telNo2="searchParams.cralIdvTno"
            :placeholder="t('MSG_TXT_INP')"
            mask="telephone"
          />
        </kw-search-item>
        <!-- 선택구분 -->
        <kw-search-item :label="$t('MSG_TXT_SELT_DV')">
          <kw-select
            v-model="searchParams.cntrtRelCd"
            :options="codes.CNTRT_REL_CD.filter((v) => v.codeId === '01' || v.codeId === '07')"
            first-option="all"
            first-option-value=""
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalCount"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMainRef"
        :visible-rows="10"
        @init="initGrid"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, useGlobal, gridUtil, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const { t } = useI18n();
const { modal } = useGlobal();
const { currentRoute } = useRouter();

let cachedParams;
const now = dayjs();
const searchParams = ref({
  istDt: now.format('YYYY'), // 귀속년도
  emplDv: '1', // 직원구분
  empNo: '', // 사번
  cntrtRelCd: '', // 선택구분(계약자관계코드)
  cntrCralTno: '', // 휴대전화번호
  cralLocaraTno: '', // 휴대지역전화번호
  mexnoEncr: '', // 휴대전화국번호암호화
  cralIdvTno: '', // 휴대개별전화번호
});
const pageInfo = ref({
  totalCount: 0,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));
const codes = await codeUtil.getMultiCodes(
  'CNTRT_REL_CD', // 계약자관계코드
);

async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  // console.log(cachedParams);
  res = await dataService.get('/sms/wells/contract/contracts/employee-purchase-gcfs', { params: cachedParams });

  // const { list: accounts } = res.data;
  // console.log(res.data);

  const view = grdMainRef.value.getView();
  // view.getDataSource().setRows(accounts);
  view.getDataSource().setRows(res.data);
  pageInfo.value.totalCount = view.getItemCount();
  view.resetCurrent();
  // view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 사번 검색 버튼 클릭
async function onClickSearchUserId() {
  const { result, payload } = await modal({ component: 'ZwcmzSingleSelectUserListP' });
  if (result) {
    searchParams.value.empNo = payload.employeeIDNumber;
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/contract/contracts/employee-purchase-gcfs/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

onMounted(async () => {
  // await fetchData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'empNo' }, // 사번
    { fieldName: 'fnm' }, // 성명
    { fieldName: 'cralLocaraTno' }, // 휴대지역전화번호
    { fieldName: 'mexnoEncr' }, // 휴대전화국번호암호화
    { fieldName: 'cralIdvTno' }, // 휴대개별전화번호
    { fieldName: 'rsgnDt' }, // 퇴사일
    { fieldName: 'sellInflwChnlDtlCd' }, // 소속
    { fieldName: 'cntPre' }, // 전월-설치
    { fieldName: 'cntPreC' }, // 전월-취소
    { fieldName: 'cntPreFnl' }, // 전월-최종
    { fieldName: 'cntCur' }, // 당월-설치
    { fieldName: 'cntCurC' }, // 당월-취소
    { fieldName: 'cntCurFnl' }, // 당월-최종
    { fieldName: 'cnt01' }, // 1월-설치
    { fieldName: 'cnt01C' }, // 1월-취소
    { fieldName: 'cnt01Fnl' }, // 1월-최종
    { fieldName: 'cnt02' }, // 2월-설치
    { fieldName: 'cnt02C' }, // 2월-취소
    { fieldName: 'cnt02Fnl' }, // 2월-최종
    { fieldName: 'cnt03' }, // 3월-설치
    { fieldName: 'cnt03C' }, // 3월-취소
    { fieldName: 'cnt03Fnl' }, // 3월-최종
    { fieldName: 'cnt04' }, // 4월-설치
    { fieldName: 'cnt04C' }, // 4월-취소
    { fieldName: 'cnt04Fnl' }, // 4월-최종
    { fieldName: 'cnt05' }, // 5월-설치
    { fieldName: 'cnt05C' }, // 5월-취소
    { fieldName: 'cnt05Fnl' }, // 5월-최종
    { fieldName: 'cnt06' }, // 6월-설치
    { fieldName: 'cnt06C' }, // 6월-취소
    { fieldName: 'cnt06Fnl' }, // 6월-최종
    { fieldName: 'cnt07' }, // 7월-설치
    { fieldName: 'cnt07C' }, // 7월-취소
    { fieldName: 'cnt07Fnl' }, // 7월-최종
    { fieldName: 'cnt08' }, // 8월-설치
    { fieldName: 'cnt08C' }, // 8월-취소
    { fieldName: 'cnt08Fnl' }, // 8월-최종
    { fieldName: 'cnt09' }, // 9월-설치
    { fieldName: 'cnt09C' }, // 9월-취소
    { fieldName: 'cnt09Fnl' }, // 9월-최종
    { fieldName: 'cnt10' }, // 10월-설치
    { fieldName: 'cnt10C' }, // 10월-취소
    { fieldName: 'cnt10Fnl' }, // 10월-최종
    { fieldName: 'cnt11' }, // 11월-설치
    { fieldName: 'cnt11C' }, // 11월-취소
    { fieldName: 'cnt11Fnl' }, // 11월-최종
    { fieldName: 'cnt12' }, // 12월-설치
    { fieldName: 'cnt12C' }, // 12월-취소
    { fieldName: 'cnt12Fnl' }, // 12월-최종
    { fieldName: 'cntTot' }, // 합계
  ];

  const columns = [
    { fieldName: 'empNo', header: t('MSG_TXT_EPNO'), width: '112', styleName: 'text-center' }, // 사번
    { fieldName: 'fnm', header: t('MSG_TXT_EMPL_NM'), width: '112', styleName: 'text-left' }, // 성명
    { fieldName: 'cralLocaraTno', width: '42', styleName: 'text-center' }, // 휴대지역전화번호
    { fieldName: 'mexnoEncr', width: '43', styleName: 'text-center' }, // 휴대전화국번호암호화
    { fieldName: 'cralIdvTno', width: '43', styleName: 'text-center' }, // 휴대개별전화번호
    { fieldName: 'rsgnDt', header: t('MSG_TXT_RSGN_D'), width: '106', styleName: 'text-center' }, // 퇴사일
    { fieldName: 'sellInflwChnlDtlCd', header: t('MSG_TXT_BLG'), width: '112', styleName: 'text-center' }, // 소속
    { fieldName: 'cntPre', header: t('MSG_TXT_INSTALLATION'), width: '112', styleName: 'text-right' }, // 전월-설치
    { fieldName: 'cntPreC', header: t('MSG_TXT_CANCEL'), width: '111', styleName: 'text-right' }, // 전월-취소
    { fieldName: 'cntPreFnl', header: t('MSG_TXT_FNL'), width: '111', styleName: 'text-right' }, // 전월-최종
    { fieldName: 'cntCur', header: t('MSG_TXT_INSTALLATION'), width: '111', styleName: 'text-right' }, // 당월-설치
    { fieldName: 'cntCurC', header: t('MSG_TXT_CANCEL'), width: '111', styleName: 'text-right' }, // 당월-취소
    { fieldName: 'cntCurFnl', header: t('MSG_TXT_FNL'), width: '111', styleName: 'text-right' }, // 당월-최종
    { fieldName: 'cnt01', header: t('MSG_TXT_INSTALLATION'), width: '111', styleName: 'text-right' }, // 1월-설치
    { fieldName: 'cnt01C', header: t('MSG_TXT_CANCEL'), width: '111', styleName: 'text-right' }, // 1월-취소
    { fieldName: 'cnt01Fnl', header: t('MSG_TXT_FNL'), width: '111', styleName: 'text-right' }, // 1월-최종
    { fieldName: 'cnt02', header: t('MSG_TXT_INSTALLATION'), width: '111', styleName: 'text-right' }, // 2월-설치
    { fieldName: 'cnt02C', header: t('MSG_TXT_CANCEL'), width: '111', styleName: 'text-right' }, // 2월-취소
    { fieldName: 'cnt02Fnl', header: t('MSG_TXT_FNL'), width: '111', styleName: 'text-right' }, // 2월-최종
    { fieldName: 'cnt03', header: t('MSG_TXT_INSTALLATION'), width: '111', styleName: 'text-right' }, // 3월-설치
    { fieldName: 'cnt03C', header: t('MSG_TXT_CANCEL'), width: '111', styleName: 'text-right' }, // 3월-취소
    { fieldName: 'cnt03Fnl', header: t('MSG_TXT_FNL'), width: '111', styleName: 'text-right' }, // 3월-최종
    { fieldName: 'cnt04', header: t('MSG_TXT_INSTALLATION'), width: '111', styleName: 'text-right' }, // 4월-설치
    { fieldName: 'cnt04C', header: t('MSG_TXT_CANCEL'), width: '111', styleName: 'text-right' }, // 4월-취소
    { fieldName: 'cnt04Fnl', header: t('MSG_TXT_FNL'), width: '111', styleName: 'text-right' }, // 4월-최종
    { fieldName: 'cnt05', header: t('MSG_TXT_INSTALLATION'), width: '111', styleName: 'text-right' }, // 5월-설치
    { fieldName: 'cnt05C', header: t('MSG_TXT_CANCEL'), width: '111', styleName: 'text-right' }, // 5월-취소
    { fieldName: 'cnt05Fnl', header: t('MSG_TXT_FNL'), width: '111', styleName: 'text-right' }, // 5월-최종
    { fieldName: 'cnt06', header: t('MSG_TXT_INSTALLATION'), width: '111', styleName: 'text-right' }, // 6월-설치
    { fieldName: 'cnt06C', header: t('MSG_TXT_CANCEL'), width: '111', styleName: 'text-right' }, // 6월-취소
    { fieldName: 'cnt06Fnl', header: t('MSG_TXT_FNL'), width: '111', styleName: 'text-right' }, // 6월-최종
    { fieldName: 'cnt07', header: t('MSG_TXT_INSTALLATION'), width: '111', styleName: 'text-right' }, // 7월-설치
    { fieldName: 'cnt07C', header: t('MSG_TXT_CANCEL'), width: '111', styleName: 'text-right' }, // 7월-취소
    { fieldName: 'cnt07Fnl', header: t('MSG_TXT_FNL'), width: '111', styleName: 'text-right' }, // 7월-최종
    { fieldName: 'cnt08', header: t('MSG_TXT_INSTALLATION'), width: '111', styleName: 'text-right' }, // 8월-설치
    { fieldName: 'cnt08C', header: t('MSG_TXT_CANCEL'), width: '111', styleName: 'text-right' }, // 8월-취소
    { fieldName: 'cnt08Fnl', header: t('MSG_TXT_FNL'), width: '111', styleName: 'text-right' }, // 8월-최종
    { fieldName: 'cnt09', header: t('MSG_TXT_INSTALLATION'), width: '111', styleName: 'text-right' }, // 9월-설치
    { fieldName: 'cnt09C', header: t('MSG_TXT_CANCEL'), width: '111', styleName: 'text-right' }, // 9월-취소
    { fieldName: 'cnt09Fnl', header: t('MSG_TXT_FNL'), width: '111', styleName: 'text-right' }, // 9월-최종
    { fieldName: 'cnt10', header: t('MSG_TXT_INSTALLATION'), width: '111', styleName: 'text-right' }, //  10월-설치
    { fieldName: 'cnt10C', header: t('MSG_TXT_CANCEL'), width: '111', styleName: 'text-right' }, // 10월-취소
    { fieldName: 'cnt10Fnl', header: t('MSG_TXT_FNL'), width: '111', styleName: 'text-right' }, // 10월-최종
    { fieldName: 'cnt11', header: t('MSG_TXT_INSTALLATION'), width: '111', styleName: 'text-right' }, // 11월-설치
    { fieldName: 'cnt11C', header: t('MSG_TXT_CANCEL'), width: '111', styleName: 'text-right' }, // 11월-취소
    { fieldName: 'cnt11Fnl', header: t('MSG_TXT_FNL'), width: '111', styleName: 'text-right' }, // 11월-최종
    { fieldName: 'cnt12', header: t('MSG_TXT_INSTALLATION'), width: '111', styleName: 'text-right' }, //  12월-설치
    { fieldName: 'cnt12C', header: t('MSG_TXT_CANCEL'), width: '111', styleName: 'text-right' }, // 12월-취소
    { fieldName: 'cnt12Fnl', header: t('MSG_TXT_FNL'), width: '111', styleName: 'text-right' }, // 12월-최종
    { fieldName: 'cntTot', header: t('MSG_TXT_SUM'), width: '111', styleName: 'text-right' }, // 합계
  ];

  // multi row header setting
  const columnLayout = [
    'empNo',
    'fnm',
    {
      header: t('MSG_TXT_MPNO'), // 휴대전화번호
      direction: 'horizontal',
      hideChildHeaders: true,
      items: ['cralLocaraTno', 'mexnoEncr', 'cralIdvTno'],
    },
    'rsgnDt',
    'sellInflwChnlDtlCd',
    {
      header: t('MSG_TXT_EMPL_PRCH_PS'), // 직원구매현황
      direction: 'horizontal',
      items: [
        {
          header: t('MSG_TXT_PREV'), // 이전
          direction: 'horizontal',
          items: ['cntPre', 'cntPreC', 'cntPreFnl'],
        },
        {
          header: t('MSG_TXT_THM'), // 당월
          direction: 'horizontal',
          items: ['cntCur', 'cntCurC', 'cntCurFnl'],
        },
      ],
    },
    {
      header: t('MSG_TXT_EMPL_PRCH_PS'), // 월별 직원 구매현황
      direction: 'horizontal',
      items: [
        {
          header: t('MSG_TXT_JAN'), // 1월
          direction: 'horizontal',
          items: ['cnt01', 'cnt01C', 'cnt01Fnl'],
        },
        {
          header: t('MSG_TXT_FEB'), // 2월
          direction: 'horizontal',
          items: ['cnt02', 'cnt02C', 'cnt02Fnl'],
        },
        {
          header: t('MSG_TXT_MAR'), // 3월
          direction: 'horizontal',
          items: ['cnt03', 'cnt03C', 'cnt03Fnl'],
        },
        {
          header: t('MSG_TXT_APRI'), // 4월
          direction: 'horizontal',
          items: ['cnt04', 'cnt04C', 'cnt04Fnl'],
        },
        {
          header: t('MSG_TXT_MAY'), // 5월
          direction: 'horizontal',
          items: ['cnt05', 'cnt05C', 'cnt05Fnl'],
        },
        {
          header: t('MSG_TXT_JUN'), // 6월
          direction: 'horizontal',
          items: ['cnt06', 'cnt06C', 'cnt06Fnl'],
        },
        {
          header: t('MSG_TXT_JUL'), // 7월
          direction: 'horizontal',
          items: ['cnt07', 'cnt07C', 'cnt07Fnl'],
        },
        {
          header: t('MSG_TXT_AUG'), // 8월
          direction: 'horizontal',
          items: ['cnt08', 'cnt08C', 'cnt08Fnl'],
        },
        {
          header: t('MSG_TXT_SEPT'), // 9월
          direction: 'horizontal',
          items: ['cnt09', 'cnt09C', 'cnt09Fnl'],
        },
        {
          header: t('MSG_TXT_OCT'), // 10월
          direction: 'horizontal',
          items: ['cnt10', 'cnt10C', 'cnt10Fnl'],
        },
        {
          header: t('MSG_TXT_NOV'), // 11월
          direction: 'horizontal',
          items: ['cnt11', 'cnt11C', 'cnt11Fnl'],
        },
        {
          header: t('MSG_TXT_DECE'), // 12월
          direction: 'horizontal',
          items: ['cnt12', 'cnt12C', 'cnt12Fnl'],
        },
        {
          header: t('MSG_TXT_SUM'), // 합계
          direction: 'horizontal',
          hideChildHeaders: true,
          items: ['cntTot'],
        },
      ],
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);

  view.rowIndicator.visible = true;
  view.checkBar.visible = true;
});
</script>
<style>
</style>
