<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcPlannerListM - 웰스플레너 조회
3. 작성자 : 성명수
4. 작성일 : 2023-12-11
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 웰스플레너 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="2"
      @search="onclickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_PRTNR_NUM_EMPL_NM')">
          <zwog-partner-search
            v-model:prtnr-no="searchParams.prtnrNo"
            v-model:prtnr-knm="searchParams.prtnrKnm"
            v-model:og-tp-cd="searchParams.ogTpCd"
          />
        </kw-search-item>
        <kw-search-item :label="t('MSG_TXT_CRLV')">
          <kw-select
            v-model="searchParams.rsbDvCd"
            :options="codes.RSB_DV_CD"
            first-option="all"
            first-option-value="ALL"
            placeholder="전체"
          />

          <kw-checkbox
            v-model="searchParams.actiYn"
            :label="[t('MSG_TXT_ACTI') ]"
            :true-value="Y"
            :false-value="N"
          />

          <kw-checkbox
            v-model="searchParams.wmYn"
            :label="[t('WM') ]"
            :true-value="3"
            :false-value="N"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="t('MSG_TXT_BLG_CD')">
          <kw-input
            v-model="searchParams.schOjBlamStrt"
            upper-case
            regex="/^[A-Z0-9]*$/i"
            maxlength="7"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.schOjBlamEnd"
            upper-case
            regex="/^[A-Z0-9]*$/i"
            maxlength="7"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CONTACT')"
          :hint="$t('MSG_ALT_ONLY_ONE_PHONENUM_OR_CSTNO')"
        >
          <kw-input
            v-model="searchParams.tno"
            regex="num"
            :label="t('MSG_TXT_CONTACT')"
            :placeholder="t('MSG_TXT_LAST_TEL_NUM_OR_TOT_NUM')"
            maxlength="11"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="grdMain1PageInfo.pageIndex"
            v-model:page-size="grdMain1PageInfo.pageSize"
            :total-count="grdMain1PageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="grdMain1PageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdMain1Ref"
        name="grdMain1"
        :visible-rows="10"
        :page-size="grdMain1PageInfo.pageSize"
        :total-count="grdMain1PageInfo.totalCount"
        @init="initGrid1"
      />

      <kw-pagination
        v-model:page-index="grdMain1PageInfo.pageIndex"
        v-model:page-size="grdMain1PageInfo.pageSize"
        :total-count="grdMain1PageInfo.totalCount"
        @change="onChangePageInfo"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, getComponentType, useDataService, useMeta, gridUtil, codeUtil } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

import { SMS_WELLS_URI } from '~sms-wells/organization/constants/ogConst';
import ZwogPartnerSearch from '~sms-common/organization/components/ZwogPartnerSearch.vue';

const { t } = useI18n();
const dataService = useDataService();
const { getUserInfo } = useMeta();
const { wkOjOgTpCd, ogTpCd } = getUserInfo();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'RSB_DV_CD',
  'QLF_DV_CD',
  'WM_ACTI_CD',
  'COD_PAGE_SIZE_OPTIONS',
);

const grdMain1Ref = ref(getComponentType('KwGrid'));
const grdMain1Datas = ref([]);

const grdMain1PageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 30,
});

const searchParams = ref({
  ogDvAcd: '7',
  ogTpCd: wkOjOgTpCd === null ? ogTpCd : wkOjOgTpCd,
  prtnrNo: undefined,
  prtnrKnm: undefined,
  cralLocaraTno: undefined,
  mexnoEncr: undefined,
  cralIdvTno: undefined,
  qlfDvCd: codes.QLF_DV_CD.map((item) => item.codeId),
  wmActiCd: codes.WM_ACTI_CD.map((item) => item.codeId),
  actiYn: 'Y',
  wmYn: 'N',
});

let cachedParams;

// 인사정보 목록 데이터 조회
async function fetchData() {
  if (cachedParams.rsbDvCd === 'ALL') {
    cachedParams.rsbDvCd = undefined;
  }
  if (isEmpty(cachedParams.schOjBlamEnd)) {
    cachedParams.schOjBlamEnd = cachedParams.schOjBlamStrt;
  }
  if (!isEmpty(cachedParams.tno)) {
    if (cachedParams.tno.length === 11) {
      cachedParams.cralLocaraTno = cachedParams.tno.substr(0, 3);
      cachedParams.mexnoEncr = cachedParams.tno.substr(3, 4);
      cachedParams.cralIdvTno = cachedParams.tno.substr(7);
    } else if (cachedParams.tno.length === 10) {
      cachedParams.cralLocaraTno = cachedParams.tno.substr(0, 3);
      cachedParams.mexnoEncr = cachedParams.tno.substr(3, 3);
      cachedParams.cralIdvTno = cachedParams.tno.substr(6);
    } else {
      cachedParams.cralLocaraTno = undefined;
      cachedParams.mexnoEncr = undefined;
      cachedParams.cralIdvTno = cachedParams.tno;
    }
  }
  const res = await dataService.get(`${SMS_WELLS_URI}/partner/wells-planner-paging`, { params: { ...cachedParams, ...grdMain1PageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;
  grdMain1PageInfo.value = pagingResult;
  grdMain1Datas.value = list;

  const view = grdMain1Ref.value.getView();
  view.getDataSource().setRows(list);
  return grdMain1Datas.value;
}
// 페이징처리
async function onChangePageInfo() {
  if (isEmpty(cachedParams)) return;
  await fetchData();
}
// 초기 데이터 호출
async function init() {
  await fetchData();
}

// 조회
async function onclickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await init();
}

// 엑셀 다운로드
const { currentRoute } = useRouter();
async function onClickExcelDownload() {
  const view = grdMain1Ref.value.getView();

  const res = await dataService.get(`${SMS_WELLS_URI}/partner/wells-planner/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid1 = defineGrid((data, view) => {
  const columns = [
    {
      fieldName: 'dgr2LevlOgNm', // 지역단
      header: t('MSG_TXT_RGNL_GRP'),
      width: '106',
      styleName: 'text-center',
      displayCallback(g, index, value) { return isEmpty(value) ? '-' : value; },
      editable: false,
    },
    {
      fieldName: 'ogNm', // 현재소속
      header: t('MSG_TXT_CRTL_BLG'),
      width: '106',
      styleName: 'text-center',
      editable: false },
    {
      fieldName: 'preOgNm', // 전월소속
      header: t('전월소속'),
      width: '106',
      styleName: 'text-center',
      editable: false },
    {
      fieldName: 'bldNm', // 빌딩명
      header: t('MSG_TXT_BLD_NM'),
      width: '160',
      styleName: 'text-center',
      displayCallback(g, index, value) { return isEmpty(value) ? '-' : value; },
      editable: false },
    {
      fieldName: 'prtnrKnm', // 성명
      header: t('MSG_TXT_EMPL_NM'),
      width: '92',
      styleName: 'text-center',
      editable: false },
    {
      fieldName: 'prtnrNo', // 번호
      header: t('MSG_TXT_SEQUENCE_NUMBER'),
      width: '106',
      styleName: 'text-center',
      editable: false },
    {
      fieldName: 'rsbDvNm', // 직책 RSB_DV_CD
      header: t('MSG_TXT_RSB'),
      width: '92',
      styleName: 'text-center',
      editable: false },
    {
      fieldName: 'fullCralLocaraTno', // 휴대전화
      header: t('MSG_TXT_CP'),
      width: '156',
      styleName: 'text-center',
      displayCallback(g, index, value) { return isEmpty(value) ? '-' : value; },
      editable: true,
      editor: {
        maxLength: 11,
        inputCharacters: '0-9',
      },
      textFormat: '([0-9]{3})([0-9]{3,4})([0-9]{4});$1-$2-$3',
    },
    {
      fieldName: 'fullRrnoFrpsnVal', // 주민등록번호
      header: t('MSG_TXT_RRNO'),
      width: '136',
      styleName: 'text-center',
      editable: false,
    },
    {
      fieldName: 'fstCntrDt', // 업무등록일
      header: t('MSG_TXT_BIZ_RGST_D'),
      width: '122',
      styleName: 'text-center',
      displayCallback(g, index, value) {
        return isEmpty(value) ? '-' : dayjs(value).format('YYYY-MM-DD');
      },
      editable: false,
    },
    {
      fieldName: 'prfmtDt', // 승진/강등일
      header: t('승진/강등일'),
      width: '168',
      styleName: 'text-center',
      displayCallback(g, index, value) {
        return isEmpty(value) ? '-' : dayjs(value).format('YYYY-MM-DD');
      },
      editable: false,
    },
    {
      fieldName: 'cntrDt', // 재등록일
      header: t('MSG_TXT_RETR_D'),
      width: '168',
      styleName: 'text-center',
      displayCallback(g, index, value) {
        return isEmpty(value) ? '-' : dayjs(value).format('YYYY-MM-DD');
      },
      editable: false,
    },
    {
      fieldName: 'cltnDt', // 업무해약일
      header: t('MSG_TXT_BIZ_CLTN_D'),
      width: '168',
      styleName: 'text-center',
      displayCallback(g, index, value) {
        return isEmpty(value) ? '-' : dayjs(value).format('YYYY-MM-DD');
      },
      editable: false,
    },
    {
      fieldName: 'fnlCltnDt', // 최종해약일
      header: t('MSG_TXT_FNL_CLTN_D'),
      width: '168',
      styleName: 'text-center',
      displayCallback(g, index, value) {
        return isEmpty(value) ? '-' : dayjs(value).format('YYYY-MM-DD');
      },
      editable: false,
    },
    {
      fieldName: 'qlfDvCd', // 매니저
      header: t('MSG_TXT_MANAGER'),
      width: '106',
      styleName: 'text-center',
      editable: false },
    {
      fieldName: 'conDt', // 계약일
      header: t('MSG_TXT_CNTRCT_DT'),
      width: '168',
      styleName: 'text-center',
      displayCallback(g, index, value) {
        return isEmpty(value) ? '-' : dayjs(value).format('YYYY-MM-DD');
      },
      editable: false,
    },
    {
      fieldName: 'reconDt', // 재등록일
      header: t('MSG_TXT_RETR_D'),
      width: '168',
      styleName: 'text-center',
      displayCallback(g, index, value) {
        return isEmpty(value) ? '-' : dayjs(value).format('YYYY-MM-DD');
      },
      editable: false,
    },
    {
      fieldName: 'fireDt', // 해약일
      header: t('MSG_TXT_CLTN_D'),
      width: '168',
      styleName: 'text-center',
      displayCallback(g, index, value) {
        return isEmpty(value) ? '-' : dayjs(value).format('YYYY-MM-DD');
      },
      editable: false,
    },
    {
      fieldName: 'rcmdrPrtnrNo', // 채용자번호
      header: t('MSG_TXT_ENGM_NO'),
      width: '106',
      styleName: 'text-center',
      editable: false },
    {
      fieldName: 'prtnrNm', // 채용자성명
      header: t('MSG_TXT_ENGM_FNM'),
      width: '106',
      styleName: 'text-center',
      editable: false },
  ];

  // eslint-disable-next-line max-len
  view.getDataSource().setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.setColumnLayout([
    {
      header: t('MSG_TXT_BLG'), // 소속
      direction: 'horizontal',
      items: ['dgr2LevlOgNm', 'ogNm', 'preOgNm', 'bldNm'],
    },
    'prtnrNo',
    'prtnrKnm',
    'rsbDvNm',
    'fullCralLocaraTno',
    'fullRrnoFrpsnVal',
    {
      header: t('MSG_TXT_HMNRSC'), // 인사
      direction: 'horizontal',
      items: ['fstCntrDt', 'prfmtDt', 'cntrDt', 'cltnDt', 'fnlCltnDt'],
    },
    {
      header: t('MSG_TXT_HMNRSC'), // 웰스매니저
      direction: 'horizontal',
      items: ['qlfDvCd', 'conDt', 'reconDt', 'fireDt'],
    },
    {
      header: t('채용자'), // 채용자
      direction: 'horizontal',
      items: ['rcmdrPrtnrNo', 'prtnrNm'],
    },
  ]);
});

</script>

<style scoped>
</style>
