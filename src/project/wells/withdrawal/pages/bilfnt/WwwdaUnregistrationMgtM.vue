<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDA
2. 프로그램 ID : WwwdaUnregistrationMgtM - 묶음출금미등록현황 (W-WD-U-0010M01)
3. 작성자 : donghyun.yoo
4. 작성일 : 2023.02.01
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
[W-WD-U0024] 묶음출금 미등록 리스트 조회 및 묶음출금 등록 기능, 이력조회도 가능
웰스팜 기기와 모종을 묶음출금하는 기능으로 파악됨
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-tabs
      v-model="selectedTab"
    >
      <kw-tab
        name="unrgPs"
        :label="t('MSG_TXT_UNRG_PS')"
      />
      <kw-tab
        name="bndlRgstHist"
        :label="t('MSG_TXT_BNDL_RGST_HIST')"
      />
    </kw-tabs>

    <kw-search
      ref="searchRef"
      :cols="3"

      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          v-show="selectedTab === 'unrgPs'"
          :label="t('MSG_TXT_CONT_CLASS')"
        >
          <kw-select
            v-model="searchParams.unrgRsCd"
            :options="codes.BNDL_WDRW_UNRG_OJ_DV_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          v-show="selectedTab === 'bndlRgstHist'"
          :label="t('MSG_TXT_PROCS_RS')"
        >
          <kw-select
            v-model="searchParams.unrgRsonCd"
            :options="codes.AFTN_NOM_ERR_DV_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_CNTR_NO')"
        >
          <kw-input
            v-model="searchParams.cntr"
            type="number"
            :name="t('MSG_TXT_CNTR_NO')"
            maxlength="17"
          />
        </kw-search-item>
        <kw-search-item
          :label="selectedTab === 'unrgPs' ? t('MSG_TXT_RCPDT') : t('MSG_TXT_PRCSDT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.cntrPdStrtdt"
            v-model:to="searchParams.cntrPdEnddt"
            :label="t('MSG_TXT_VALID_PERIOD')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div
      v-show="selectedTab === 'unrgPs'"
      class="result-area"
    >
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            @change="fetchData1"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>

        <kw-btn
          :disable="pageInfo.totalCount === 0"
          icon="download_on"
          dense
          secondary
          :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
          @click="onClickExcelDownload(1)"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :disable="pageInfo.totalCount === 0"
          grid-action
          :label="t('MSG_TXT_BNDL_RGST')"
          @click="alert('준비중입니다')"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef1"
        name="grdMain"
        :visible-rows="pageInfo.pageSize - 1"
        @init="initGrid1"
      />
    </div>

    <div
      v-show="selectedTab === 'bndlRgstHist'"
      class="result-area"
    >
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo2.pageIndex"
            v-model:page-size="pageInfo2.pageSize"
            :total-count="pageInfo2.totalCount"
            @change="fetchData2"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>

        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :disable="pageInfo2.totalCount === 0"
          icon="download_on"
          dense
          secondary
          :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
          @click="onClickExcelDownload(2)"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef2"
        name="grdMain2"
        :visible-rows="pageInfo2.pageSize - 1"
        @init="initGrid2"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { useDataService, defineGrid, codeUtil, getComponentType, useGlobal, gridUtil, useMeta } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const { alert } = useGlobal();
const dataService = useDataService();
const { t } = useI18n();

const now = dayjs();

const { getConfig } = useMeta();

const { getters } = useStore();
const userInfo = getters['meta/getUserInfo'];
const { tenantCd } = userInfo;

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const searchRef = ref(getComponentType('KwSearch'));

const grdMainRef1 = ref(getComponentType('KwGrid'));
const grdMainRef2 = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  unrgRs: '', // 대상구분, 처리결과 통합
  unrgRsCd: '', // 대상구분
  unrgRsonCd: '', // 처리결과
  cntr: '', // 계약번호
  cntrPdStrtdt: now.format('YYYYMMDD'), // 접수일자 시작일
  cntrPdEnddt: now.add('7', 'day').format('YYYYMMDD'), // 접수일자 종료일
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const pageInfo2 = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const codes = await codeUtil.getMultiCodes(
  'AFTN_ITG_UNRG_RSON_CD', // 자동이체통합미등록사유코드
  'BNDL_WDRW_UNRG_OJ_DV_CD', // 묶음출금미등록대상구분코드
  'AFTN_NOM_ERR_DV_CD', // 자동이체통합미등록결과코드 -> AFTN_NOM_ERR_DV_CD 추후에 수정 아직 생성안된듯
  // 'BNK_CD_CD',
  'MPY_MTHD_TP_CD', // 납부방식유형코드 110 : 계좌 / 120 : 카드
  'FNIT_APR_RS_CD', // 금융기관승인결과코드 B : 오류(승인결과) / Y : 승인완료 / N : 승인전/이체중지
);

const selectedTab = ref('unrgPs');

async function fetchData1() {
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/bundle-withdrawal-unrgs', { params: { ...cachedParams } });
  const { list: lists, pageInfo: pageResult } = res.data;
  pageInfo.value = pageResult;

  const view = grdMainRef1.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(lists);
  dataSource.checkRowStates(true);
}

async function fetchData2() {
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/bundle-withdrawal-hist', { params: { ...cachedParams } });
  const { list: lists, pageInfo: pageResult } = res.data;
  pageInfo2.value = pageResult;

  const view = grdMainRef2.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(lists);
  dataSource.checkRowStates(true);
}
async function onClickSearch() {
  if (!await searchRef.value.validate()) { return; }

  searchParams.value.unrgRs = selectedTab.value === 'unrgPs' ? searchParams.value.unrgRsCd : searchParams.value.unrgRsonCd;
  searchParams.value.fullCntr = !isEmpty(searchParams.value.cntr) ? tenantCd + searchParams.value.cntr : '';
  searchParams.value.cntrNo = !isEmpty(searchParams.value.cntr.slice(0, 11)) ? tenantCd + searchParams.value.cntr.slice(0, 11) : '';
  searchParams.value.cntrSn = searchParams.value.cntr.slice(11);
  cachedParams = cloneDeep(searchParams.value);
  if (selectedTab.value === 'unrgPs') {
    grdMainRef1.value.getData().clearRows();
    await fetchData1();
  } else {
    grdMainRef2.value.getData().clearRows();
    await fetchData2();
  }
}

async function onClickExcelDownload(no) {
  if (no === 1) {
    const view = grdMainRef1.value.getView();
    const res = await dataService.get('/sms/wells/withdrawal/bilfnt/bundle-withdrawal-unrgs/excel-download', { params: cachedParams });

    await gridUtil.exportView(view, {
      fileName: '미등록 현황',
      timePostfix: true,
      exportData: res.data,
    });
  } else {
    const view = grdMainRef2.value.getView();
    const res = await dataService.get('/sms/wells/withdrawal/bilfnt/bundle-withdrawal-hist/excel-download', { params: cachedParams });

    await gridUtil.exportView(view, {
      fileName: '묶음 등록 이력',
      timePostfix: true,
      exportData: res.data,
    });
  }
}

//-------------------------------------------------------------------------------------------------
// Initialize Grid
//-------------------------------------------------------------------------------------------------

const initGrid1 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'cntrPdStrtdt' }, // 접수일자
    { fieldName: 'unrgRson' }, // 묶음출금 미등록

    { fieldName: 'cntrSn' }, // 기기주문번호
    { fieldName: 'mpyMthdTpCd' }, // 이체구분
    { fieldName: 'fnitAprRsCd' }, // 상태
    { fieldName: 'dgCntrNo' }, // 묶음대표번호
    { fieldName: 'bnkNm' }, // 이체기관명
    { fieldName: 'acnoEncr' }, // 이체번호
    { fieldName: 'owrKnm' }, // 이체 소유주명
    { fieldName: 'mpyBsdt' }, // 이체일자
    { fieldName: 'bryyMmdd' }, // 이체 인증번호

    { fieldName: 'sdingCntrSn' }, // 모종주문번호
    { fieldName: 'sdingMpyMthdTpCd' }, // 이체구분
    { fieldName: 'sdingFnitAprRsCd' }, // 상태
    { fieldName: 'sdingDgCntrNo' }, // 묶음대표번호
    { fieldName: 'sdingBnkNm' }, // 이체기관명
    { fieldName: 'sdingAcnoEncr' }, // 이체번호
    { fieldName: 'sdingOwrKnm' }, // 이체 소유주명
    { fieldName: 'sdingMpyBsdt' }, // 이체일자
    { fieldName: 'sdingBryyMmdd' }, // 이체 인증번호

  ];

  const columns = [
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '80', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_RCPDT'), width: '120', styleName: 'text-center' },
    { fieldName: 'unrgRson',
      header: t('MSG_TXT_BNDL_WDRW_UNRG'), // 묶음 출금 미등록
      width: '200',
      styleName: 'text-center',
      options: codes.AFTN_ITG_UNRG_RSON_CD },

    { fieldName: 'cntrSn', header: t('MSG_TXT_MCHN_ORD_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'mpyMthdTpCd', header: t('MSG_TXT_FNT_DV'), width: '120', styleName: 'text-center', options: codes.MPY_MTHD_TP_CD },
    { fieldName: 'fnitAprRsCd', header: t('MSG_TXT_STT'), width: '120', styleName: 'text-center', options: codes.FNIT_APR_RS_CD },
    { fieldName: 'dgCntrNo', header: t('MSG_TXT_BNDL_DG_NO'), width: '250', styleName: 'text-center' },
    { fieldName: 'bnkNm', header: t('MSG_TXT_FNT_BUR_NM'), width: '120', styleName: 'text-left' },
    { fieldName: 'acnoEncr', header: t('MSG_TXT_FNT_NO'), width: '180', styleName: 'text-center' },
    { fieldName: 'owrKnm', header: t('MSG_TXT_FNT_PSR_NM'), width: '120', styleName: 'text-left' },
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_FNT_DT'), width: '120', styleName: 'text-center' },
    { fieldName: 'bryyMmdd', header: t('MSG_TXT_FNT_CTF_NO'), width: '120', styleName: 'text-center' },

    { fieldName: 'sdingCntrSn', header: t('MSG_TXT_SDING_ORD_NO'), width: '250', styleName: 'text-center' },
    { fieldName: 'sdingMpyMthdTpCd', header: t('MSG_TXT_FNT_DV'), width: '120', styleName: 'text-center', options: codes.MPY_MTHD_TP_CD },
    { fieldName: 'sdingFnitAprRsCd', header: t('MSG_TXT_STT'), width: '120', styleName: 'text-center', options: codes.FNIT_APR_RS_CD },
    { fieldName: 'sdingDgCntrNo', header: t('MSG_TXT_BNDL_DG_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'sdingBnkNm', header: t('MSG_TXT_FNT_BUR_NM'), width: '120', styleName: 'text-left' },
    { fieldName: 'sdingAcnoEncr', header: t('MSG_TXT_FNT_NO'), width: '180', styleName: 'text-center' },
    { fieldName: 'sdingOwrKnm', header: t('MSG_TXT_FNT_PSR_NM'), width: '120', styleName: 'text-left' },
    { fieldName: 'sdingMpyBsdt', header: t('MSG_TXT_FNT_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'sdingBryyMmdd', header: t('MSG_TXT_FNT_CTF_NO'), width: '100', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([

    {
      header: t('MSG_TXT_CST_INF'), // 고객정보
      direction: 'horizontal', // merge type
      items: ['cstKnm', 'pdNm', 'cntrPdStrtdt', 'unrgRson'],
    },
    {
      header: t('MSG_TXT_MCHN_FNT_INF'), // 기기이체정보
      direction: 'horizontal', // merge type
      items: ['cntrSn', 'mpyMthdTpCd', 'fnitAprRsCd',
        'dgCntrNo', 'bnkNm', 'acnoEncr', 'owrKnm', 'mpyBsdt', 'bryyMmdd'],
    },
    {
      header: t('MSG_TXT_SDING_FNT_INF'), // 모종이체정보
      direction: 'horizontal', // merge type
      items: ['sdingCntrSn', 'sdingMpyMthdTpCd', 'sdingFnitAprRsCd',
        'sdingBnkNm', 'sdingAcnoEncr', 'sdingOwrKnm', 'sdingMpyBsdt', 'sdingBryyMmdd'],
    },
  ]);

  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      await fetchData1();
    }
  };
});

const initGrid2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'itgBilPrtcDtm' }, // 등록일시
    { fieldName: 'fnlMdfcUsrId' }, // 등록자번호
    { fieldName: 'aftnItgUnrgRsCd' }, // 결과
    { fieldName: 'errCn' }, // 오류내용

    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'cntrPdStrtdt' }, // 접수일자
    { fieldName: 'aftnItgUnrgRsonCd' }, // 묶음출금 미등록

    { fieldName: 'cntrSn' }, // 기기주문번호
    { fieldName: 'mpyMthdTpCd' }, // 이체구분
    { fieldName: 'dgCntrNo' }, // 묶음대표번호
    { fieldName: 'bnkNm' }, // 이체기관명
    { fieldName: 'acnoEncr' }, // 이체번호
    { fieldName: 'owrKnm' }, // 이체 소유주명
    { fieldName: 'mpyBsdt' }, // 이체일자
    { fieldName: 'bryyMmdd' }, // 이체 인증번호

    { fieldName: 'sdingCntrSn' }, // 모종주문번호
    { fieldName: 'sdingMpyMthdTpCd' }, // 이체구분
    { fieldName: 'sdingDgCntrNo' }, // 묶음대표번호
    { fieldName: 'sdingBnkNm' }, // 이체기관명
    { fieldName: 'sdingAcnoEncr' }, // 이체번호
    { fieldName: 'sdingOwrKnm' }, // 이체 소유주명
    { fieldName: 'sdingMpyBsdt' }, // 이체일자
    { fieldName: 'sdingBryyMmdd' }, // 이체 인증번호

  ];

  const columns = [
    { fieldName: 'itgBilPrtcDtm', header: t('MSG_TXT_RGST_DTM'), width: '150', styleName: 'text-center', dataType: 'date', datetimeFormat: 'yyyy-MM-dd hh:mm' },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_RGR_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'aftnItgUnrgRsCd', header: t('MSG_TXT_RSULT'), width: '170', styleName: 'text-center', options: codes.AFTN_NOM_ERR_DV_CD },
    { fieldName: 'errCn', header: t('MSG_TXT_ERR_CNTN'), width: '80', styleName: 'text-center' },

    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '80', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_RCPDT'), width: '180', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'aftnItgUnrgRsonCd',
      header: t('MSG_TXT_BNDL_WDRW_UNRG'), // 묶음출금 미등록
      width: '200',
      styleName: 'text-center',
      options: codes.BNDL_WDRW_UNRG_OJ_DV_CD },

    { fieldName: 'cntrSn', header: t('MSG_TXT_MCHN_ORD_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'mpyMthdTpCd', header: t('MSG_TXT_FNT_DV'), width: '120', styleName: 'text-center', options: codes.MPY_MTHD_TP_CD },
    { fieldName: 'dgCntrNo', header: t('MSG_TXT_BNDL_DG_NO'), width: '150', styleName: 'text-right' },
    { fieldName: 'bnkNm', header: t('MSG_TXT_FNT_BUR_NM'), width: '120', styleName: 'text-right' },
    { fieldName: 'acnoEncr', header: t('MSG_TXT_FNT_NO'), width: '120', styleName: 'text-right' },
    { fieldName: 'owrKnm', header: t('MSG_TXT_FNT_PSR_NM'), width: '120', styleName: 'text-right' },
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_FNT_DT'), width: '120', styleName: 'text-right' },
    { fieldName: 'bryyMmdd', header: t('MSG_TXT_FNT_CTF_NO'), width: '120', styleName: 'text-right' },

    { fieldName: 'sdingCntrSn', header: t('MSG_TXT_SDING_ORD_NO'), width: '250', styleName: 'text-center' },
    { fieldName: 'sdingMpyMthdTpCd', header: t('MSG_TXT_FNT_DV'), width: '120', styleName: 'text-center', options: codes.MPY_MTHD_TP_CD },
    { fieldName: 'sdingDgCntrNo', header: t('MSG_TXT_BNDL_DG_NO'), width: '150', styleName: 'text-right' },
    { fieldName: 'sdingBnkNm', header: t('MSG_TXT_FNT_BUR_NM'), width: '120', styleName: 'text-right' },
    { fieldName: 'sdingAcnoEncr', header: t('MSG_TXT_FNT_NO'), width: '120', styleName: 'text-right' },
    { fieldName: 'sdingOwrKnm', header: t('MSG_TXT_FNT_PSR_NM'), width: '120', styleName: 'text-right' },
    { fieldName: 'sdingMpyBsdt', header: t('MSG_TXT_FNT_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'sdingBryyMmdd', header: t('MSG_TXT_FNT_CTF_NO'), width: '100', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  // multi row header setting
  view.setColumnLayout([

    {
      header: t('MSG_TXT_RGST_INF'), // 등록정보
      direction: 'horizontal', // merge type
      items: ['itgBilPrtcDtm', 'fnlMdfcUsrId', 'aftnItgUnrgRsCd', 'errCn'],
    },
    {
      header: t('MSG_TXT_CST_INF'), // 고객정보
      direction: 'horizontal', // merge type
      items: ['cstKnm', 'pdNm', 'cntrPdStrtdt', 'aftnItgUnrgRsonCd'],
    },
    {
      header: t('MSG_TXT_MCHN_FNT_INF'), // 기기이체정보
      direction: 'horizontal', // merge type
      items: ['cntrSn', 'mpyMthdTpCd',
        'dgCntrNo', 'bnkNm', 'acnoEncr', 'owrKnm', 'mpyBsdt', 'bryyMmdd'],
    },
    {
      header: t('MSG_TXT_SDING_FNT_INF'), // 모종이체정보
      direction: 'horizontal', // merge type
      items: ['sdingCntrSn', 'sdingMpyMthdTpCd',
        'sdingBnkNm', 'sdingAcnoEncr', 'sdingOwrKnm', 'sdingMpyBsdt', 'sdingBryyMmdd'],
    },
  ]);

  view.onScrollToBottom = async (g) => {
    if (pageInfo2.value.pageIndex * pageInfo2.value.pageSize <= g.getItemCount()) {
      pageInfo2.value.pageIndex += 1;
      await fetchData2();
    }
  };
});

</script>

<style scoped>
</style>
