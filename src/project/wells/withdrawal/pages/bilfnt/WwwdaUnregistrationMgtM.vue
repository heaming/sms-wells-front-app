<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : WDA
2. 프로그램 ID : WwwdaUnregistrationMgtM - 묶음출금미등록현황 (W-WD-U-0010M01) , 묶음 등록 이력 (W-WD-U-0010M02)
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
    <kw-tab-panels v-model="selectedTab">
      <kw-tab-panel name="unrgPs">
        <kw-search
          ref="searchRef"
          :cols="3"
          @search="onClickSearch"
        >
          <kw-search-row>
            <kw-search-item
              :label="t('MSG_TXT_RCPDT')"
              required
            >
              <kw-date-range-picker
                v-model:from="searchParams.cntrPdStrtdt"
                v-model:to="searchParams.cntrPdEnddt"
                :from-placeholder="t('MSG_TXT_STRT_D_CHO')"
                :to-placeholder="t('MSG_TXT_END_D_CHO')"
                :label="t('MSG_TXT_VALID_PERIOD')"
                rules="date_range_months:1"
              />
            </kw-search-item>
            <!-- 계약상세번호 -->
            <kw-search-item
              :label="t('MSG_TXT_CNTR_DTL_NO')"
            >
              <zctz-contract-detail-number
                v-model:cntr-no="searchParams.cntrNo"
                v-model:cntr-sn="searchParams.cntrSn"
                :name="$t('MSG_TXT_CNTR_DTL_NO')"
              />
            </kw-search-item>
            <kw-search-item
              :label="t('MSG_TXT_CONT_CLASS')"
            >
              <kw-select
                v-model="searchParams.unrgRsCd"
                :options="codes.BNDL_WDRW_UNRG_OJ_DV_CD"
                first-option="all"
              />
            </kw-search-item>
          </kw-search-row>
        </kw-search>

        <div
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
            </template>

            <kw-btn
              v-permission:download
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
              v-permission:create
              grid-action
              :label="t('MSG_TXT_BNDL_RGST')"
              @click="onClickBundleWithdrawalRgst"
            />
          </kw-action-top>

          <kw-grid
            ref="grdMainRef1"
            name="grdMain"
            :page-size="pageInfo.pageSize - 1"
            :total-count="pageInfo.totalCount"
            @init="initGrid1"
          />
        </div>
      </kw-tab-panel>
      <kw-tab-panel name="bndlRgstHist">
        <kw-search
          ref="searchRef"
          :cols="3"
          @search="onClickSearch"
        >
          <kw-search-row>
            <kw-search-item
              :label="t('MSG_TXT_PRCSDT')"
              required
            >
              <kw-date-range-picker
                v-model:from="searchParams.cntrPdStrtdt"
                v-model:to="searchParams.cntrPdEnddt"
                :from-placeholder="t('MSG_TXT_STRT_D_CHO')"
                :to-placeholder="t('MSG_TXT_END_D_CHO')"
                :label="t('MSG_TXT_VALID_PERIOD')"
                rules="date_range_months:1"
              />
            </kw-search-item>
            <!-- 계약상세번호 -->
            <kw-search-item
              :label="t('MSG_TXT_CNTR_DTL_NO')"
            >
              <zctz-contract-detail-number
                v-model:cntr-no="searchParams.cntrNoA"
                v-model:cntr-sn="searchParams.cntrSnA"
                :name="$t('MSG_TXT_CNTR_DTL_NO')"
              />
            </kw-search-item>
            <kw-search-item
              :label="t('MSG_TXT_PROCS_RS')"
            >
              <kw-select
                v-model="searchParams.unrgRsonCd"
                :options="codes.AFTN_NOM_ERR_DV_CD"
                first-option="all"
              />
            </kw-search-item>
          </kw-search-row>
        </kw-search>
        <div
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
            </template>

            <kw-btn
              v-permission:download
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
            :page-size="pageInfo2.pageSize - 1"
            :total-count="pageInfo2.totalCount"
            @init="initGrid2"
          />
        </div>
      </kw-tab-panel>
    </kw-tab-panels>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { useDataService, defineGrid, codeUtil, getComponentType, useGlobal, gridUtil, useMeta } from 'kw-lib';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
// eslint-disable-next-line no-unused-vars
import { cloneDeep, isEmpty } from 'lodash-es';

// eslint-disable-next-line no-unused-vars
const { alert } = useGlobal();
const dataService = useDataService();
const { t } = useI18n();

const { getConfig } = useMeta();

const { getters } = useStore();
const userInfo = getters['meta/getUserInfo'];
// eslint-disable-next-line no-unused-vars
const { tenantCd } = userInfo;
const { currentRoute } = useRouter();

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
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약 일련번호
  cntrNoA: '', // 계약번호
  cntrSnA: '', // 계약 일련번호
  cntrPdStrtdt: '', // 접수일자 시작일
  cntrPdEnddt: '', // 접수일자 종료일
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const pageInfo2 = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

const codes = await codeUtil.getMultiCodes(
  // 'AFTN_ITG_UNRG_RSON_CD', // 자동이체통합미등록사유코드
  'BNDL_WDRW_UNRG_OJ_DV_CD', // 묶음출금미등록대상구분코드
  'AFTN_NOM_ERR_DV_CD', // 자동이체통합미등록결과코드 -> AFTN_NOM_ERR_DV_CD 추후에 수정 아직 생성안된듯
  // 'BNK_CD_CD',
  'DP_TP_CD', // 입금유형코드 0102 : 계좌 / 0203 : 카드
  'FNIT_APR_RS_CD', // 금융기관승인결과코드 B : 오류(승인결과) / Y : 승인완료 / N : 승인전/이체중지
);

const selectedTab = ref('unrgPs');

async function fetchData1() {
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/bundle-withdrawal-unrgs', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: lists, pageInfo: pageResult } = res.data;
  pageInfo.value = pageResult;

  const view = grdMainRef1.value.getView();
  const dataSource = view.getDataSource();

  dataSource.checkRowStates(false);
  dataSource.addRows(lists);
  dataSource.checkRowStates(true);
}

async function fetchData2() {
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/bundle-withdrawal-hist', { params: { ...cachedParams, ...pageInfo2.value } });
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
  cachedParams = cloneDeep(searchParams.value);
  if (selectedTab.value === 'unrgPs') {
    grdMainRef1.value.getData().clearRows();
    pageInfo.value.pageIndex = 1;
    await fetchData1();
  } else {
    grdMainRef2.value.getData().clearRows();
    pageInfo2.value.pageIndex = 1;
    await fetchData2();
  }
}

// 묶음 등록
async function onClickBundleWithdrawalRgst() {
  const view = grdMainRef1.value.getView();
  const checkRows = gridUtil.getCheckedRowValues(view);

  if (!checkRows.length > 0) {
    alert(t('MSG_ALT_ATC_CHO'));
    return;
  }
  const data = checkRows.map((v) => ({
    cntrNo: v.dgCntrNo,
    cntrSn: v.dgCntrSn,
    cntrPdStrtdt: searchParams.value.cntrPdStrtdt,
    cntrPdEnddt: searchParams.value.cntrPdEnddt,
  }));

  await dataService.post('/sms/wells/withdrawal/bilfnt/bundle-registration', data);
  await onClickSearch();
}

async function onClickExcelDownload(no) {
  if (no === 1) {
    const view = grdMainRef1.value.getView();
    const res = await dataService.get('/sms/wells/withdrawal/bilfnt/bundle-withdrawal-unrgs/excel-download', { params: cachedParams, timeout: 300000 });

    await gridUtil.exportView(view, {
      fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_UNRG_PS')}`, // 미등록 현황
      timePostfix: true,
      exportData: res.data,
    });
  } else {
    const view = grdMainRef2.value.getView();
    const res = await dataService.get('/sms/wells/withdrawal/bilfnt/bundle-withdrawal-hist/excel-download', { params: cachedParams, timeout: 300000 });

    await gridUtil.exportView(view, {
      fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_BNDL_RGST_HIST')}`, // 묶음 등록 이력
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

    { fieldName: 'dpTpCd' }, // 이체구분
    { fieldName: 'fnitAprRsCd' }, // 상태
    { fieldName: 'dgCntr' }, // 묶음대표번호
    { fieldName: 'dgCntrNo' }, // 기기주문번호
    { fieldName: 'dgCntrSn' }, // 기기 상세번호
    { fieldName: 'bnkNm' }, // 이체기관명
    { fieldName: 'acnoEncr' }, // 이체번호
    { fieldName: 'crcdnoEncr' }, // 이체번호
    { fieldName: 'owrKnm' }, // 이체 소유주명
    { fieldName: 'mpyBsdt' }, // 이체일자
    { fieldName: 'bryyMmdd' }, // 이체 인증번호

    { fieldName: 'sdingCntrNo' }, // 모종주문번호
    { fieldName: 'sdingCntrSn' }, // 모종 상세번호
    { fieldName: 'sdingDpTpCd' }, // 이체구분
    { fieldName: 'sdingFnitAprRsCd' }, // 상태
    { fieldName: 'sdingDgCntrNo' }, // 묶음대표번호
    { fieldName: 'sdingBnkNm' }, // 이체기관명
    { fieldName: 'sdingAcnoEncr' }, // 이체번호
    { fieldName: 'sdingCrcdnoEncr' }, // 이체번호
    { fieldName: 'sdingOwrKnm' }, // 이체 소유주명
    { fieldName: 'sdingMpyBsdt' }, // 이체일자
    { fieldName: 'sdingBryyMmdd' }, // 이체 인증번호

  ];

  const columns = [
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '80', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '180', styleName: 'text-left' },
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_RCPDT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'unrgRson',
      header: t('MSG_TXT_BNDL_WDRW_UNRG'), // 묶음 출금 미등록
      width: '200',
      styleName: 'text-center',
    },
    { fieldName: 'dgCntr', header: t('MSG_TXT_MCHN_CNTR_DTL_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'dpTpCd', header: t('MSG_TXT_FNT_DV'), width: '120', styleName: 'text-center', options: codes.DP_TP_CD },
    { fieldName: 'fnitAprRsCd', header: t('MSG_TXT_STT'), width: '120', styleName: 'text-center', options: codes.FNIT_APR_RS_CD },
    { fieldName: 'dgCntrNo', header: t('MSG_TXT_DG_CNTR_DTL_NO'), width: '250', styleName: 'text-center' },
    { fieldName: 'bnkNm', header: t('MSG_TXT_FNT_BUR_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'acnoEncr',
      header: t('MSG_TXT_FNT_NO'),
      width: '180',
      styleName: 'text-center',
      // displayCallback(grid, index, value) {
      //   const { dpTpCd, crcdnoEncr } = gridUtil.getRowValue(grid, index.itemIndex);
      //   return dpTpCd === '0102' ? value : crcdnoEncr;
      // },
    },
    { fieldName: 'owrKnm', header: t('MSG_TXT_FNT_PSR_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_FNT_DT'), width: '120', styleName: 'text-center' },
    { fieldName: 'bryyMmdd', header: t('MSG_TXT_FNT_CTF_NO'), width: '120', styleName: 'text-center' },

    { fieldName: 'sdingCntrNo',
      header: t('MSG_TXT_SDING_CNTR_DTL_NO'),
      width: '250',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        const { sdingCntrSn } = gridUtil.getRowValue(grid, index.itemIndex);
        return `${value}-${sdingCntrSn}`;
      },
    },
    { fieldName: 'sdingDpTpCd', header: t('MSG_TXT_FNT_DV'), width: '120', styleName: 'text-center', options: codes.DP_TP_CD },
    { fieldName: 'sdingFnitAprRsCd', header: t('MSG_TXT_STT'), width: '120', styleName: 'text-center', options: codes.FNIT_APR_RS_CD },
    { fieldName: 'sdingDgCntrNo', header: t('MSG_TXT_DG_CNTR_DTL_NO'), width: '250', styleName: 'text-center' },
    { fieldName: 'sdingBnkNm', header: t('MSG_TXT_FNT_BUR_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'sdingAcnoEncr',
      header: t('MSG_TXT_FNT_NO'),
      width: '180',
      styleName: 'text-center',
      // displayCallback(grid, index, value) {
      //   const { sdingDpTpCd, sdingCrcdnoEncr } = gridUtil.getRowValue(grid, index.itemIndex);
      //   return sdingDpTpCd === '0102' ? value : sdingCrcdnoEncr;
      // },
    },
    { fieldName: 'sdingOwrKnm', header: t('MSG_TXT_FNT_PSR_NM'), width: '120', styleName: 'text-center' },
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
      items: ['dgCntr', 'dpTpCd', 'fnitAprRsCd',
        'dgCntrNo', 'bnkNm', 'acnoEncr', 'owrKnm', 'mpyBsdt', 'bryyMmdd'],
    },
    {
      header: t('MSG_TXT_SDING_FNT_INF'), // 모종이체정보
      direction: 'horizontal', // merge type
      items: ['sdingCntrNo', 'sdingDpTpCd', 'sdingFnitAprRsCd', 'sdingDgCntrNo',
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
    { fieldName: 'dpTpCd' }, // 이체구분
    { fieldName: 'dgCntrSn' }, // 묶음대표번호
    { fieldName: 'bnkCd' }, // 이체기관명
    { fieldName: 'acnoEncr' }, // 이체번호
    { fieldName: 'crcdnoEncr' }, // 카드번호
    { fieldName: 'owrKnm' }, // 이체 소유주명
    { fieldName: 'mpyBsdt' }, // 이체일자
    { fieldName: 'bryyMmdd' }, // 이체 인증번호

    { fieldName: 'sdingCntr' }, // 모종주문번호
    { fieldName: 'sdingCntrNo' }, // 모종주문번호
    { fieldName: 'sdingCntrSn' }, // 모종 상세번호
    { fieldName: 'sdingDpTpCd' }, // 이체구분
    { fieldName: 'sdingDgCntrSn' }, // 묶음대표번호
    { fieldName: 'sdingBnkCd' }, // 이체기관명
    { fieldName: 'sdingAcnoEncr' }, // 이체번호
    { fieldName: 'sdingCrcdnoEncr' }, // 모종카드번호
    { fieldName: 'sdingOwrKnm' }, // 이체 소유주명
    { fieldName: 'sdingMpyBsdt' }, // 이체일자
    { fieldName: 'sdingBryyMmdd' }, // 이체 인증번호

  ];

  const columns = [
    { fieldName: 'itgBilPrtcDtm', header: t('MSG_TXT_RGST_DTM'), width: '150', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_RGR_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'aftnItgUnrgRsCd', header: t('MSG_TXT_RSULT'), width: '170', styleName: 'text-center', options: codes.AFTN_NOM_ERR_DV_CD },
    { fieldName: 'errCn', header: t('MSG_TXT_ERR_CNTN'), width: '80', styleName: 'text-center' },

    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '80', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '180', styleName: 'text-left' },
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_RCPDT'), width: '180', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'aftnItgUnrgRsonCd',
      header: t('MSG_TXT_BNDL_WDRW_UNRG'), // 묶음출금 미등록
      width: '200',
      styleName: 'text-center',
      options: codes.BNDL_WDRW_UNRG_OJ_DV_CD },

    { fieldName: 'cntrSn', header: t('MSG_TXT_MCHN_CNTR_DTL_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'dpTpCd', header: t('MSG_TXT_FNT_DV'), width: '120', styleName: 'text-center', options: codes.DP_TP_CD },
    { fieldName: 'dgCntrSn', header: t('MSG_TXT_DG_CNTR_DTL_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'bnkCd', header: t('MSG_TXT_FNT_BUR_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'acnoEncr',
      header: t('MSG_TXT_FNT_NO'),
      width: '180',
      styleName: 'text-center',
      // displayCallback(grid, index, value) {
      //   const { dpTpCd, crcdnoEncr } = gridUtil.getRowValue(grid, index.itemIndex);
      //   return dpTpCd === '0102' ? value : crcdnoEncr;
      // },
    },
    { fieldName: 'owrKnm', header: t('MSG_TXT_FNT_PSR_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_FNT_DT'), width: '120', styleName: 'text-center' },
    { fieldName: 'bryyMmdd', header: t('MSG_TXT_FNT_CTF_NO'), width: '120', styleName: 'text-center' },

    { fieldName: 'sdingCntr',
      header: t('MSG_TXT_SDING_CNTR_DTL_NO'),
      width: '250',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { sdingCntrNo, sdingCntrSn } = gridUtil.getRowValue(grid, index.itemIndex);
        return `${sdingCntrNo}-${sdingCntrSn}`;
      } },
    { fieldName: 'sdingDpTpCd', header: t('MSG_TXT_FNT_DV'), width: '120', styleName: 'text-center', options: codes.DP_TP_CD },
    { fieldName: 'sdingDgCntrSn', header: t('MSG_TXT_DG_CNTR_DTL_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'sdingBnkCd', header: t('MSG_TXT_FNT_BUR_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'sdingAcnoEncr',
      header: t('MSG_TXT_FNT_NO'),
      width: '180',
      styleName: 'text-center',
      // displayCallback(grid, index, value) {
      //   const { sdingDpTpCd, sdingCrcdnoEncr } = gridUtil.getRowValue(grid, index.itemIndex);
      //   return sdingDpTpCd === '0102' ? value : sdingCrcdnoEncr;
      // },
    },
    { fieldName: 'sdingOwrKnm', header: t('MSG_TXT_FNT_PSR_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'sdingMpyBsdt', header: t('MSG_TXT_FNT_DT'), width: '100', styleName: 'text-center' },
    { fieldName: 'sdingBryyMmdd', header: t('MSG_TXT_FNT_CTF_NO'), width: '100', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
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
      items: ['cntrSn', 'dpTpCd',
        'dgCntrSn', 'bnkCd', 'acnoEncr', 'owrKnm', 'mpyBsdt', 'bryyMmdd'],
    },
    {
      header: t('MSG_TXT_SDING_FNT_INF'), // 모종이체정보
      direction: 'horizontal', // merge type
      items: ['sdingCntr', 'sdingDpTpCd', 'sdingDgCntrSn',
        'sdingBnkCd', 'sdingAcnoEncr', 'sdingOwrKnm', 'sdingMpyBsdt', 'sdingBryyMmdd'],
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
