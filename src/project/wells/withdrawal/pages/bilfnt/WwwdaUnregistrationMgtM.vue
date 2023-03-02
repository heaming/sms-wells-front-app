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
      required
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          v-show="selectedTab === 'unrgPs'"
          :label="t('MSG_TXT_CONT_CLASS')"
        >
          <kw-select
            v-model="searchParams.unrgRsCd"
            :options="[{codeId : '1' , codeName : t('MSG_TXT_CH_OJ')}, {codeId : '2', codeName: t('MSG_TXT_CH_IMP')}]"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          v-show="selectedTab === 'bndlRgstHist'"
          :label="t('MSG_TXT_PROCS_RS')"
        >
          <kw-select
            v-model="searchParams.unrgRsonCd"
            :options="codes.AFTN_ITG_UNRG_RS_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_CNTR_NO')"
          required
        >
          <kw-input
            v-model="searchParams.cntr"
            type="number"
            :name="t('MSG_TXT_CNTR_NO')"
            maxlength="12"
            rules="required|length:12"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_RCPDT')"
          required
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
            :total-count="totalCount"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>

        <kw-btn
          :disable="totalCount === 0"
          icon="download_on"
          dense
          secondary
          :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :disable="totalCount === 0"
          grid-action
          :label="t('MSG_TXT_BNDL_RGST')"
          @click="alert('준비중입니다')"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef1"
        name="grdMain"
        :visible-rows="10"
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
            :total-count="totalCount2"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
        </template>

        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :disable="totalCount2 === 0"
          icon="download_on"
          dense
          secondary
          :label="t('MSG_TXT_EXCEL_DOWNLOAD')"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMainRef2"
        name="grdMain2"
        :visible-rows="10"
        @init="initGrid2"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, defineGrid, codeUtil, getComponentType, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

const { alert } = useGlobal();
const dataService = useDataService();
const { t } = useI18n();
const now = dayjs();

const { getters } = useStore();
const userInfo = getters['meta/getUserInfo'];
const { tenantCd } = userInfo;
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const searchRef = ref(getComponentType('KwSearch'));

const grdMainRef1 = ref(getComponentType('KwGrid'));
const grdData1 = computed(() => grdMainRef1.value?.getData());

const grdMainRef2 = ref(getComponentType('KwGrid'));
const grdData2 = computed(() => grdMainRef2.value?.getData());

let initGridData1 = [];
let initGridData2 = [];

const totalCount = ref(0);
const totalCount2 = ref(0);

let cachedParams;
const searchParams = ref({
  unrgRs: '', // 대상구분, 처리결과 통합
  unrgRsCd: '', // 대상구분
  unrgRsonCd: '', // 처리결과
  cntr: '', // 계약번호
  cntrPdStrtdt: now.format('YYYYMMDD'), // 접수일자 시작일
  cntrPdEnddt: now.add('7', 'day').format('YYYYMMDD'), // 접수일자 종료일
});

const codes = await codeUtil.getMultiCodes(
  'AFTN_ITG_UNRG_RSON_CD', // 자동이체통합미등록사유코드
  // -> 대상구분 따로 필요함 1 : 변경대상 , 2 : 변경불가  => 대상구분 조건
  'AFTN_ITG_UNRG_RS_CD', // 자동이체통합미등록결과코드
  // 'BNK_CD_CD',
  'MPY_MTHD_TP_CD', // 납부방식유형코드 110 : 계좌 / 120 : 카드
  'FNIT_APR_RS_CD', // 금융기관승인결과코드 B : 오류(승인결과) / Y : 승인완료 / N : 승인전/이체중지
);

const selectedTab = ref('unrgPs');

async function fetchData1() {
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/bundle-withdrawal-unrgs', { params: { ...cachedParams } });
  const lists = res.data.list;

  totalCount.value = lists.length;

  if (grdData1.value) {
    grdData1.value.setRows(lists);
  } else {
    initGridData1 = lists;
  }
}

async function fetchData2() {
  const res = await dataService.get('/sms/wells/withdrawal/bilfnt/bundle-withdrawal-hist', { params: { ...cachedParams } });
  const lists = res.data.list;

  totalCount2.value = lists.length;

  if (grdData2.value) {
    grdData2.value.setRows(lists);
  } else {
    initGridData2 = lists;
  }
}
async function onClickSearch() {
  if (!await searchRef.value.validate()) { return; }
  searchParams.value.unrgRs = selectedTab.value === 'unrgPs' ? searchParams.value.unrgRsCd : searchParams.value.unrgRsonCd;
  searchParams.value.fullCntr = tenantCd + searchParams.value.cntr;
  searchParams.value.cntrNo = tenantCd + searchParams.value.cntr.slice(0, 11);
  searchParams.value.cntrSn = searchParams.value.cntr.slice(11);
  cachedParams = cloneDeep(searchParams.value);
  if (selectedTab.value === 'unrgPs') {
    await fetchData1();
  } else {
    await fetchData2();
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
    { fieldName: 'dgCntrSn' }, // 묶음대표번호
    { fieldName: 'bnkNm' }, // 이체기관명
    { fieldName: 'acnoEncr' }, // 이체번호
    { fieldName: 'owrKnm' }, // 이체 소유주명
    { fieldName: 'mpyBsdt' }, // 이체일자
    { fieldName: 'bryyMmdd' }, // 이체 인증번호

    { fieldName: 'sdingCntrSn' }, // 모종주문번호
    { fieldName: 'sdingMpyMthdTpCd' }, // 이체구분
    { fieldName: 'sdingFnitAprRsCd' }, // 상태
    { fieldName: 'sdingDgCntrSn' }, // 묶음대표번호
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
    { fieldName: 'dgCntrSn', header: t('MSG_TXT_BNDL_DG_NO'), width: '250', styleName: 'text-center' },
    { fieldName: 'bnkNm', header: t('MSG_TXT_FNT_BUR_NM'), width: '120', styleName: 'text-left' },
    { fieldName: 'acnoEncr', header: t('MSG_TXT_FNT_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'owrKnm', header: t('MSG_TXT_FNT_PSR_NM'), width: '120', styleName: 'text-left' },
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_FNT_DT'), width: '120', styleName: 'text-center' },
    { fieldName: 'bryyMmdd', header: t('MSG_TXT_FNT_CTF_NO'), width: '120', styleName: 'text-center' },

    { fieldName: 'sdingCntrSn', header: t('MSG_TXT_SDING_ORD_NO'), width: '250', styleName: 'text-center' },
    { fieldName: 'sdingMpyMthdTpCd', header: t('MSG_TXT_FNT_DV'), width: '80', styleName: 'text-center' },
    { fieldName: 'sdingFnitAprRsCd', header: t('MSG_TXT_STT'), width: '120', styleName: 'text-center' },
    { fieldName: 'sdingDgCntrSn', header: t('MSG_TXT_BNDL_DG_NO'), width: '120', styleName: 'text-center' },
    { fieldName: 'sdingBnkNm', header: t('MSG_TXT_FNT_BUR_NM'), width: '120', styleName: 'text-left' },
    { fieldName: 'sdingAcnoEncr', header: t('MSG_TXT_FNT_NO'), width: '120', styleName: 'text-center' },
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
        'dgCntrSn', 'bnkNm', 'acnoEncr', 'owrKnm', 'mpyBsdt', 'bryyMmdd'],
    },
    {
      header: t('MSG_TXT_SDING_FNT_INF'), // 모종이체정보
      direction: 'horizontal', // merge type
      items: ['sdingCntrSn', 'sdingMpyMthdTpCd', 'sdingFnitAprRsCd',
        'sdingBnkNm', 'sdingAcnoEncr', 'sdingOwrKnm', 'sdingMpyBsdt', 'sdingBryyMmdd'],
    },
  ]);

  data.setRows(initGridData1);
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
    { fieldName: 'dgCntrSn' }, // 묶음대표번호
    { fieldName: 'bnkNm' }, // 이체기관명
    { fieldName: 'acnoEncr' }, // 이체번호
    { fieldName: 'owrKnm' }, // 이체 소유주명
    { fieldName: 'mpyBsdt' }, // 이체일자
    { fieldName: 'bryyMmdd' }, // 이체 인증번호

    { fieldName: 'sdingCntrSn' }, // 모종주문번호
    { fieldName: 'sdingMpyMthdTpCd' }, // 이체구분
    { fieldName: 'sdingDgCntrSn' }, // 묶음대표번호
    { fieldName: 'sdingBnkNm' }, // 이체기관명
    { fieldName: 'sdingAcnoEncr' }, // 이체번호
    { fieldName: 'sdingOwrKnm' }, // 이체 소유주명
    { fieldName: 'sdingMpyBsdt' }, // 이체일자
    { fieldName: 'sdingBryyMmdd' }, // 이체 인증번호

  ];

  const columns = [
    { fieldName: 'itgBilPrtcDtm', header: t('MSG_TXT_RGST_DTM'), width: '150', styleName: 'text-center', dataType: 'date', datetimeFormat: 'yyyy-MM-dd hh:mm' },
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_RGR_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'aftnItgUnrgRsCd', header: t('MSG_TXT_RSULT'), width: '170', styleName: 'text-center', options: codes.AFTN_ITG_UNRG_RS_CD },
    { fieldName: 'errCn', header: t('MSG_TXT_ERR_CNTN'), width: '80', styleName: 'text-center' },

    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '80', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_RCPDT'), width: '150', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'aftnItgUnrgRsonCd',
      header: t('MSG_TXT_BNDL_WDRW_UNRG'), // 묶음출금 미등록
      width: '200',
      styleName: 'text-center',
      options: codes.AFTN_ITG_UNRG_RSON_CD },

    { fieldName: 'cntrSn', header: t('MSG_TXT_MCHN_ORD_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'mpyMthdTpCd', header: t('MSG_TXT_FNT_DV'), width: '120', styleName: 'text-center', options: codes.MPY_MTHD_TP_CD },
    { fieldName: 'dgCntrSn', header: t('MSG_TXT_BNDL_DG_NO'), width: '120', styleName: 'text-right' },
    { fieldName: 'bnkNm', header: t('MSG_TXT_FNT_BUR_NM'), width: '120', styleName: 'text-right' },
    { fieldName: 'acnoEncr', header: t('MSG_TXT_FNT_NO'), width: '120', styleName: 'text-right' },
    { fieldName: 'owrKnm', header: t('MSG_TXT_FNT_PSR_NM'), width: '120', styleName: 'text-right' },
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_FNT_DT'), width: '120', styleName: 'text-right' },
    { fieldName: 'bryyMmdd', header: t('MSG_TXT_FNT_CTF_NO'), width: '120', styleName: 'text-right' },

    { fieldName: 'sdingCntrSn', header: t('MSG_TXT_SDING_ORD_NO'), width: '250', styleName: 'text-center' },
    { fieldName: 'sdingMpyMthdTpCd', header: t('MSG_TXT_FNT_DV'), width: '120', styleName: 'text-center', options: codes.MPY_MTHD_TP_CD },
    { fieldName: 'sdingDgCntrSn', header: t('MSG_TXT_BNDL_DG_NO'), width: '150', styleName: 'text-right' },
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
        'dgCntrSn', 'bnkNm', 'acnoEncr', 'owrKnm', 'mpyBsdt', 'bryyMmdd'],
    },
    {
      header: t('MSG_TXT_SDING_FNT_INF'), // 모종이체정보
      direction: 'horizontal', // merge type
      items: ['sdingCntrSn', 'sdingMpyMthdTpCd',
        'sdingBnkNm', 'sdingAcnoEncr', 'sdingOwrKnm', 'sdingMpyBsdt', 'sdingBryyMmdd'],
    },
  ]);

  data.setRows(initGridData2);
});

</script>

<style scoped>
</style>
