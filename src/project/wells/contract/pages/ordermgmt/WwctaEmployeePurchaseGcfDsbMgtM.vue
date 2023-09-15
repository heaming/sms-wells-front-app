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
        <kw-search-item
          :label="$t('MSG_TXT_BLNG_Y')"
          required
        >
          <kw-date-picker
            v-model="searchParams.istDt"
            type="year"
            rules="required"
            :label="$t('MSG_TXT_BLNG_Y')"
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
          <span class="ml8">(단위:건)</span>
        </template>
        <kw-btn
          v-permission:download
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
  console.log(res.data);

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
    { fieldName: 'prtnrKnm' }, // 성명
    { fieldName: 'cralLocaraTno' }, // 휴대지역전화번호
    { fieldName: 'mexnoEncr' }, // 휴대전화국번호암호화
    { fieldName: 'cralIdvTno' }, // 휴대개별전화번호
    { fieldName: 'cralTno' }, // 휴대전화번호
    { fieldName: 'rsgnDt' }, // 퇴사일
    { fieldName: 'sellInflwChnlDtlCd' }, // 소속
    { fieldName: 'bfIstCn' }, // 전월-설치
    { fieldName: 'bfCanCn' }, // 전월-취소
    { fieldName: 'bfFnlCn' }, // 전월-최종
    { fieldName: 'thmIstCn' }, // 당월-설치
    { fieldName: 'thmCanCn' }, // 당월-취소
    { fieldName: 'thmFnlCn' }, // 당월-최종
    { fieldName: 'mth01IstCn' }, // 1월-설치
    { fieldName: 'mth01CanCn' }, // 1월-취소
    { fieldName: 'mth01FnlCn' }, // 1월-최종
    { fieldName: 'mth02IstCn' }, // 2월-설치
    { fieldName: 'mth02CanCn' }, // 2월-취소
    { fieldName: 'mth02FnlCn' }, // 2월-최종
    { fieldName: 'mth03IstCn' }, // 3월-설치
    { fieldName: 'mth03CanCn' }, // 3월-취소
    { fieldName: 'mth03FnlCn' }, // 3월-최종
    { fieldName: 'mth04IstCn' }, // 4월-설치
    { fieldName: 'mth04CanCn' }, // 4월-취소
    { fieldName: 'mth04FnlCn' }, // 4월-최종
    { fieldName: 'mth05IstCn' }, // 5월-설치
    { fieldName: 'mth05CanCn' }, // 5월-취소
    { fieldName: 'mth05FnlCn' }, // 5월-최종
    { fieldName: 'mth06IstCn' }, // 6월-설치
    { fieldName: 'mth06CanCn' }, // 6월-취소
    { fieldName: 'mth06FnlCn' }, // 6월-최종
    { fieldName: 'mth07IstCn' }, // 7월-설치
    { fieldName: 'mth07CanCn' }, // 7월-취소
    { fieldName: 'mth07FnlCn' }, // 7월-최종
    { fieldName: 'mth08IstCn' }, // 8월-설치
    { fieldName: 'mth08CanCn' }, // 8월-취소
    { fieldName: 'mth08FnlCn' }, // 8월-최종
    { fieldName: 'mth09IstCn' }, // 9월-설치
    { fieldName: 'mth09CanCn' }, // 9월-취소
    { fieldName: 'mth09FnlCn' }, // 9월-최종
    { fieldName: 'mth10IstCn' }, // 10월-설치
    { fieldName: 'mth10CanCn' }, // 10월-취소
    { fieldName: 'mth10FnlCn' }, // 10월-최종
    { fieldName: 'mth11IstCn' }, // 11월-설치
    { fieldName: 'mth11CanCn' }, // 11월-취소
    { fieldName: 'mth11FnlCn' }, // 11월-최종
    { fieldName: 'mth12IstCn' }, // 12월-설치
    { fieldName: 'mth12CanCn' }, // 12월-취소
    { fieldName: 'mth12FnlCn' }, // 12월-최종
    { fieldName: 'totFnlCn' }, // 합계
  ];

  const columns = [
    { fieldName: 'empNo', header: t('MSG_TXT_EPNO'), width: '112', styleName: 'text-center' }, // 사번
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '112', styleName: 'text-left' }, // 성명
    {
      fieldName: 'cralTno',
      header: t('MSG_TXT_MPNO'),
      width: '138',
      styleName: 'text-center',
    }, // 휴대전화번호
    { fieldName: 'rsgnDt', header: t('MSG_TXT_RSGN_D'), width: '106', styleName: 'text-center', datetimeFormat: 'date' }, // 퇴사일
    { fieldName: 'sellInflwChnlDtlCd', header: t('MSG_TXT_BLG'), width: '112', styleName: 'text-center' }, // 소속
    { fieldName: 'bfIstCn',
      header: t('MSG_TXT_INSTALLATION'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { bfIstCn } = grid.getValues(dataCell.index.itemIndex);
        return bfIstCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 전월-설치
    { fieldName: 'bfCanCn',
      header: t('MSG_TXT_CANCEL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { bfCanCn } = grid.getValues(dataCell.index.itemIndex);
        return bfCanCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 전월-취소
    { fieldName: 'bfFnlCn',
      header: t('MSG_TXT_FNL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { bfFnlCn } = grid.getValues(dataCell.index.itemIndex);
        return bfFnlCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 전월-최종
    { fieldName: 'thmIstCn',
      header: t('MSG_TXT_INSTALLATION'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { thmIstCn } = grid.getValues(dataCell.index.itemIndex);
        return thmIstCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 당월-설치
    { fieldName: 'thmCanCn',
      header: t('MSG_TXT_CANCEL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { thmCanCn } = grid.getValues(dataCell.index.itemIndex);
        return thmCanCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 당월-취소
    { fieldName: 'thmFnlCn',
      header: t('MSG_TXT_FNL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { thmFnlCn } = grid.getValues(dataCell.index.itemIndex);
        return thmFnlCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 당월-최종
    { fieldName: 'mth01IstCn',
      header: t('MSG_TXT_INSTALLATION'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth01IstCn } = grid.getValues(dataCell.index.itemIndex);
        return mth01IstCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 1월-설치
    { fieldName: 'mth01CanCn',
      header: t('MSG_TXT_CANCEL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth01CanCn } = grid.getValues(dataCell.index.itemIndex);
        return mth01CanCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 1월-취소
    { fieldName: 'mth01FnlCn',
      header: t('MSG_TXT_FNL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth01FnlCn } = grid.getValues(dataCell.index.itemIndex);
        return mth01FnlCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 1월-최종
    { fieldName: 'mth02IstCn',
      header: t('MSG_TXT_INSTALLATION'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth02IstCn } = grid.getValues(dataCell.index.itemIndex);
        return mth02IstCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 2월-설치
    { fieldName: 'mth02CanCn',
      header: t('MSG_TXT_CANCEL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth02CanCn } = grid.getValues(dataCell.index.itemIndex);
        return mth02CanCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 2월-취소
    { fieldName: 'mth02FnlCn',
      header: t('MSG_TXT_FNL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth02FnlCn } = grid.getValues(dataCell.index.itemIndex);
        return mth02FnlCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 2월-최종
    { fieldName: 'mth03IstCn',
      header: t('MSG_TXT_INSTALLATION'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth03IstCn } = grid.getValues(dataCell.index.itemIndex);
        return mth03IstCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 3월-설치
    { fieldName: 'mth03CanCn',
      header: t('MSG_TXT_CANCEL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth03CanCn } = grid.getValues(dataCell.index.itemIndex);
        return mth03CanCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 3월-취소
    { fieldName: 'mth03FnlCn',
      header: t('MSG_TXT_FNL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth03FnlCn } = grid.getValues(dataCell.index.itemIndex);
        return mth03FnlCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 3월-최종
    { fieldName: 'mth04IstCn',
      header: t('MSG_TXT_INSTALLATION'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth04IstCn } = grid.getValues(dataCell.index.itemIndex);
        return mth04IstCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 4월-설치
    { fieldName: 'mth04CanCn',
      header: t('MSG_TXT_CANCEL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth04CanCn } = grid.getValues(dataCell.index.itemIndex);
        return mth04CanCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 4월-취소
    { fieldName: 'mth04FnlCn',
      header: t('MSG_TXT_FNL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth04FnlCn } = grid.getValues(dataCell.index.itemIndex);
        return mth04FnlCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 4월-최종
    { fieldName: 'mth05IstCn',
      header: t('MSG_TXT_INSTALLATION'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth05IstCn } = grid.getValues(dataCell.index.itemIndex);
        return mth05IstCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 5월-설치
    { fieldName: 'mth05CanCn',
      header: t('MSG_TXT_CANCEL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth05CanCn } = grid.getValues(dataCell.index.itemIndex);
        return mth05CanCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 5월-취소
    { fieldName: 'mth05FnlCn',
      header: t('MSG_TXT_FNL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth05FnlCn } = grid.getValues(dataCell.index.itemIndex);
        return mth05FnlCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 5월-최종
    { fieldName: 'mth06IstCn',
      header: t('MSG_TXT_INSTALLATION'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth06IstCn } = grid.getValues(dataCell.index.itemIndex);
        return mth06IstCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 6월-설치
    { fieldName: 'mth06CanCn',
      header: t('MSG_TXT_CANCEL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth06CanCn } = grid.getValues(dataCell.index.itemIndex);
        return mth06CanCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 6월-취소
    { fieldName: 'mth06FnlCn',
      header: t('MSG_TXT_FNL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth06FnlCn } = grid.getValues(dataCell.index.itemIndex);
        return mth06FnlCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 6월-최종
    { fieldName: 'mth07IstCn',
      header: t('MSG_TXT_INSTALLATION'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth07IstCn } = grid.getValues(dataCell.index.itemIndex);
        return mth07IstCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 7월-설치
    { fieldName: 'mth07CanCn',
      header: t('MSG_TXT_CANCEL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth07CanCn } = grid.getValues(dataCell.index.itemIndex);
        return mth07CanCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 7월-취소
    { fieldName: 'mth07FnlCn',
      header: t('MSG_TXT_FNL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth07FnlCn } = grid.getValues(dataCell.index.itemIndex);
        return mth07FnlCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 7월-최종
    { fieldName: 'mth08IstCn',
      header: t('MSG_TXT_INSTALLATION'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth08IstCn } = grid.getValues(dataCell.index.itemIndex);
        return mth08IstCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 8월-설치
    { fieldName: 'mth08CanCn',
      header: t('MSG_TXT_CANCEL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth08CanCn } = grid.getValues(dataCell.index.itemIndex);
        return mth08CanCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 8월-취소
    { fieldName: 'mth08FnlCn',
      header: t('MSG_TXT_FNL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth08FnlCn } = grid.getValues(dataCell.index.itemIndex);
        return mth08FnlCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 8월-최종
    { fieldName: 'mth09IstCn',
      header: t('MSG_TXT_INSTALLATION'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth09IstCn } = grid.getValues(dataCell.index.itemIndex);
        return mth09IstCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 9월-설치
    { fieldName: 'mth09CanCn',
      header: t('MSG_TXT_CANCEL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth09CanCn } = grid.getValues(dataCell.index.itemIndex);
        return mth09CanCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 9월-취소
    { fieldName: 'mth09FnlCn',
      header: t('MSG_TXT_FNL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth09FnlCn } = grid.getValues(dataCell.index.itemIndex);
        return mth09FnlCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 9월-최종
    { fieldName: 'mth10IstCn',
      header: t('MSG_TXT_INSTALLATION'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth10IstCn } = grid.getValues(dataCell.index.itemIndex);
        return mth10IstCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 10월-설치
    { fieldName: 'mth10CanCn',
      header: t('MSG_TXT_CANCEL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth10CanCn } = grid.getValues(dataCell.index.itemIndex);
        return mth10CanCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 10월-취소
    { fieldName: 'mth10FnlCn',
      header: t('MSG_TXT_FNL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth10FnlCn } = grid.getValues(dataCell.index.itemIndex);
        return mth10FnlCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 10월-최종
    { fieldName: 'mth11IstCn',
      header: t('MSG_TXT_INSTALLATION'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth11IstCn } = grid.getValues(dataCell.index.itemIndex);
        return mth11IstCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 11월-설치
    { fieldName: 'mth11CanCn',
      header: t('MSG_TXT_CANCEL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth11CanCn } = grid.getValues(dataCell.index.itemIndex);
        return mth11CanCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 11월-취소
    { fieldName: 'mth11FnlCn',
      header: t('MSG_TXT_FNL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth11FnlCn } = grid.getValues(dataCell.index.itemIndex);
        return mth11FnlCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 11월-최종
    { fieldName: 'mth12IstCn',
      header: t('MSG_TXT_INSTALLATION'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth12IstCn } = grid.getValues(dataCell.index.itemIndex);
        return mth12IstCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 12월-설치
    { fieldName: 'mth12CanCn',
      header: t('MSG_TXT_CANCEL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth12CanCn } = grid.getValues(dataCell.index.itemIndex);
        return mth12CanCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 12월-취소
    { fieldName: 'mth12FnlCn',
      header: t('MSG_TXT_FNL'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { mth12FnlCn } = grid.getValues(dataCell.index.itemIndex);
        return mth12FnlCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 12월-최종
    { fieldName: 'totFnlCn',
      header: t('MSG_TXT_SUM'),
      width: '111',
      styleName: 'text-right rg-button-link',
      renderer: { type: 'button' },
      styleCallback(grid, dataCell) {
        const { totFnlCn } = grid.getValues(dataCell.index.itemIndex);
        return totFnlCn > 0 ? { renderer: { type: 'button' } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 합계
  ];

  // multi row header setting
  const columnLayout = [
    'empNo',
    'prtnrKnm',
    'cralTno',
    'rsgnDt',
    'sellInflwChnlDtlCd',
    {
      header: t('MSG_TXT_EMPL_PRCH_PS'), // 직원구매현황
      direction: 'horizontal',
      items: [
        {
          header: t('MSG_TXT_PREV'), // 이전
          direction: 'horizontal',
          items: ['bfIstCn', 'bfCanCn', 'bfFnlCn'],
        },
        {
          header: t('MSG_TXT_THM'), // 당월
          direction: 'horizontal',
          items: ['thmIstCn', 'thmCanCn', 'thmFnlCn'],
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
          items: ['mth01IstCn', 'mth01CanCn', 'mth01FnlCn'],
        },
        {
          header: t('MSG_TXT_FEB'), // 2월
          direction: 'horizontal',
          items: ['mth02IstCn', 'mth02CanCn', 'mth02FnlCn'],
        },
        {
          header: t('MSG_TXT_MAR'), // 3월
          direction: 'horizontal',
          items: ['mth03IstCn', 'mth03CanCn', 'mth03FnlCn'],
        },
        {
          header: t('MSG_TXT_APRI'), // 4월
          direction: 'horizontal',
          items: ['mth04IstCn', 'mth04CanCn', 'mth04FnlCn'],
        },
        {
          header: t('MSG_TXT_MAY'), // 5월
          direction: 'horizontal',
          items: ['mth05IstCn', 'mth05CanCn', 'mth05FnlCn'],
        },
        {
          header: t('MSG_TXT_JUN'), // 6월
          direction: 'horizontal',
          items: ['mth06IstCn', 'mth06CanCn', 'mth06FnlCn'],
        },
        {
          header: t('MSG_TXT_JUL'), // 7월
          direction: 'horizontal',
          items: ['mth07IstCn', 'mth07CanCn', 'mth07FnlCn'],
        },
        {
          header: t('MSG_TXT_AUG'), // 8월
          direction: 'horizontal',
          items: ['mth08IstCn', 'mth08CanCn', 'mth08FnlCn'],
        },
        {
          header: t('MSG_TXT_SEPT'), // 9월
          direction: 'horizontal',
          items: ['mth09IstCn', 'mth09CanCn', 'mth09FnlCn'],
        },
        {
          header: t('MSG_TXT_OCT'), // 10월
          direction: 'horizontal',
          items: ['mth10IstCn', 'mth10CanCn', 'mth10FnlCn'],
        },
        {
          header: t('MSG_TXT_NOV'), // 11월
          direction: 'horizontal',
          items: ['mth11IstCn', 'mth11CanCn', 'mth11FnlCn'],
        },
        {
          header: t('MSG_TXT_DECE'), // 12월
          direction: 'horizontal',
          items: ['mth12IstCn', 'mth12CanCn', 'mth12FnlCn'],
        },
        {
          header: t('MSG_TXT_SUM'), // 합계
          direction: 'horizontal',
          hideChildHeaders: true,
          items: ['totFnlCn'],
        },
      ],
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);

  view.rowIndicator.visible = true;
  view.checkBar.visible = false;

  view.onCellItemClicked = async (g, { column, dataRow }) => {
    const stYy = searchParams.value.istDt;
    let srchGbn = '';
    let colDv = '';
    // const empno = g.getValue(dataRow, 'empNo');
    const empno = gridUtil.getCellValue(g, dataRow, 'empNo');

    if (column === 'bfIstCn') {
      colDv = 'pre';
    } else if (column === 'bfCanCn') {
      colDv = 'pre';
      srchGbn = 'cncl';
    } else if (column === 'bfFnlCn') {
      colDv = 'pre';
      srchGbn = 'fnl';
    } else if (column === 'thmIstCn') {
      colDv = now.format('MM');
    } else if (column === 'thmCanCn') {
      colDv = now.format('MM');
      srchGbn = 'cncl';
    } else if (column === 'thmFnlCn') {
      colDv = now.format('MM');
      srchGbn = 'fnl';
    } else if (column === 'mth01IstCn') {
      colDv = '01';
    } else if (column === 'mth01CanCn') {
      colDv = '01';
      srchGbn = 'cncl';
    } else if (column === 'mth01FnlCn') {
      colDv = '01';
      srchGbn = 'fnl';
    } else if (column === 'mth02IstCn') {
      colDv = '02';
    } else if (column === 'mth02CanCn') {
      colDv = '02';
      srchGbn = 'cncl';
    } else if (column === 'mth02FnlCn') {
      colDv = '02';
      srchGbn = 'fnl';
    } else if (column === 'mth03IstCn') {
      colDv = '03';
    } else if (column === 'mth03CanCn') {
      colDv = '03';
      srchGbn = 'cncl';
    } else if (column === 'mth03FnlCn') {
      colDv = '03';
      srchGbn = 'fnl';
    } else if (column === 'mth04IstCn') {
      colDv = '04';
    } else if (column === 'mth04CanCn') {
      colDv = '04';
      srchGbn = 'cncl';
    } else if (column === 'mth04FnlCn') {
      colDv = '04';
      srchGbn = 'fnl';
    } else if (column === 'mth05IstCn') {
      colDv = '05';
    } else if (column === 'mth05CanCn') {
      colDv = '05';
      srchGbn = 'cncl';
    } else if (column === 'mth05FnlCn') {
      colDv = '05';
      srchGbn = 'fnl';
    } else if (column === 'mth06IstCn') {
      colDv = '06';
    } else if (column === 'mth06CanCn') {
      colDv = '06';
      srchGbn = 'cncl';
    } else if (column === 'mth06FnlCn') {
      colDv = '06';
      srchGbn = 'fnl';
    } else if (column === 'mth07IstCn') {
      colDv = '07';
    } else if (column === 'mth07CanCn') {
      colDv = '07';
      srchGbn = 'cncl';
    } else if (column === 'mth07FnlCn') {
      colDv = '07';
      srchGbn = 'fnl';
    } else if (column === 'mth08IstCn') {
      colDv = '08';
    } else if (column === 'mth08CanCn') {
      colDv = '08';
      srchGbn = 'cncl';
    } else if (column === 'mth08FnlCn') {
      colDv = '08';
      srchGbn = 'fnl';
    } else if (column === 'mth09IstCn') {
      colDv = '09';
    } else if (column === 'mth09CanCn') {
      colDv = '09';
      srchGbn = 'cncl';
    } else if (column === 'mth09FnlCn') {
      colDv = '09';
      srchGbn = 'fnl';
    } else if (column === 'mth10IstCn') {
      colDv = '10';
    } else if (column === 'mth10CanCn') {
      colDv = '10';
      srchGbn = 'cncl';
    } else if (column === 'mth10FnlCn') {
      colDv = '10';
      srchGbn = 'fnl';
    } else if (column === 'mth11IstCn') {
      colDv = '11';
    } else if (column === 'mth11CanCn') {
      colDv = '11';
      srchGbn = 'cncl';
    } else if (column === 'mth11FnlCn') {
      colDv = '11';
      srchGbn = 'fnl';
    } else if (column === 'mth12IstCn') {
      colDv = '12';
    } else if (column === 'mth12CanCn') {
      colDv = '12';
      srchGbn = 'cncl';
    } else if (column === 'mth12FnlCn') {
      colDv = '12';
      srchGbn = 'fnl';
    } else if (column === 'totFnlCn') {
      colDv = 'tot';
    }

    console.log(`empno${empno}`);
    const { cntrtRelCd } = searchParams.value;
    await modal({
      component: 'WwctaEmployeePurchaseContractListP',
      componentProps: { stYy, colDv, empno, srchGbn, cntrtRelCd },
    });
  };
});
</script>
<style>
</style>
