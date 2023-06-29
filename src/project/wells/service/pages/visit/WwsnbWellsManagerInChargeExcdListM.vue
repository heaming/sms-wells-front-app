<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : [W-SV-U-0081M01] WwsnbWellsManagerInChargeExcdListM - 웰스매니저 미관리계정 현황
3. 작성자 : yeongjoong.kim
4. 작성일 : 2023.06.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 웰스매니저 미관리계정 현황을 조회
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MGT_YNM')"
        >
          <!--관리년월-->
          <kw-date-picker
            v-model="searchParams.mngtYm"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_ZIP')"
          :colspan="2"
        >
          <!--우편번호-->
          <kw-input
            v-model="searchParams.fromAdrZip"
            :maxlength="5"
            :regex="/^[0-9]*$/i"
            @blur="zipFromPad"
            @keydown.enter="zipFromPad"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.toAdrZip"
            :maxlength="5"
            :regex="/^[0-9]*$/i"
            @blur="zipToPad"
            @keydown.enter="zipToPad"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_ACC_DV')">
          <!--계정구분-->
          <kw-select
            v-model="searchParams.accountDivCd"
            :options="[{codeId: '', codeName: t('MSG_TXT_MNGT_ACC') },
                       {codeId: '1', codeName: t('MSG_TXT_VST_ACC') }]"
          /><!--관리계정,방문계정-->
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <wwsn-manager-og-search-item-group
          v-model:dgr1-levl-og-id="searchParams.dgr1LevlOgId"
          v-model:dgr2-levl-og-id="searchParams.dgr2LevlOgId"
          use-og-level="2"
          :use-partner="false"
          dgr1-levl-og-label="ogCdNm"
          dgr2-levl-og-label="ogCdNm"
          dgr1-levl-og-first-option="all"
          dgr2-levl-og-first-option="all"
        />
        <kw-search-item
          :label="$t('MSG_TXT_SEARCH_EXCD')"
          :colspan="2"
        >
          <!--검색제외-->
          <kw-option-group
            v-model="exceptSearchOptions"
            class="kw-option-group--multi-line"
            type="checkbox"
            :options="[{codeId: '1', codeName: t('MSG_TXT_WELSF_INC_SC') },
                       {codeId: '2', codeName: t('MSG_TXT_CPSN_ASGN') },
                       {codeId: '3', codeName: t('MSG_TXT_FXN_RGST') } ]"
          /><!--웰스팜(새싹재배기 포함), 강제배정, 고정등록-->
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
        </template>
        <kw-btn
          icon="print"
          secondary
          dense
          :label="t('MSG_BTN_PRTG')"
        />
        <kw-btn
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
import { useDataService, useMeta, codeUtil, gridUtil, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';

const { t } = useI18n();
const now = dayjs();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();
const { alert } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'CST_GD_CD',
  'RGLVL_DV_CD',
  'SELL_TP_CD',
  'VST_DV_CD',
  'WK_PRGS_STAT_CD',
  '',
);

const grdMainRef = ref();

let cachedParams;
const searchParams = ref({
  mngtYm: now.format('YYYYMM'),
  fromAdrZip: '',
  toAdrZip: '',
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  accountDivCd: '',
  exceptWellsFarmYn: '',
  exceptFixYn: '',
  exceptEgerWkYn: '',
});

const exceptSearchOptions = ref([]);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const { data: { list, pageInfo: pageInfoObj } } = await dataService.get('sms/wells/service/wells-manager-incharge-excd/paging', { params: { ...cachedParams, ...pageInfo.value } });

  list.forEach((row) => {
    if (row.cralLocaraTno && row.mexnoEncr && row.cralIdvTno) { row.mobileTno = `${row.cralLocaraTno}-${row.mexnoEncr}-${row.cralIdvTno}`; }
    if (row.locaraTno && row.exnoEncr && row.idvTno) { row.homeTno = `${row.locaraTno}-${row.exnoEncr}-${row.idvTno}`; }
  });

  pageInfo.value = pageInfoObj;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

async function onClickSearch() {
  searchParams.value.exceptWellsFarmYn = exceptSearchOptions.value.some((options) => options === '1')
    ? 'Y' : 'N';
  searchParams.value.exceptEgerWkYn = exceptSearchOptions.value.some((options) => options === '2')
    ? 'Y' : 'N';
  searchParams.value.exceptFixYn = exceptSearchOptions.value.some((options) => options === '3')
    ? 'Y' : 'N';
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}

function isValidZip() {
  if (isEmpty(searchParams.value.fromAdrZip) || isEmpty(searchParams.value.toAdrZip)) {
    return true;
  }
  if (searchParams.value.fromAdrZip > searchParams.value.toAdrZip) {
    alert(t('MSG_TXT_ZIP_VALIDATE')); // 정확한 우편번호를 입력하세요.
    return false;
  }
  return true;
}

function zipPad(value) {
  if (value.length > 0) {
    return value.padStart(5, '0');
  }
}
async function zipFromPad() {
  searchParams.value.fromAdrZip = zipPad(searchParams.value.fromAdrZip);
  if (!isValidZip()) {
    searchParams.value.fromAdrZip = '';
  }
}
async function zipToPad() {
  searchParams.value.toAdrZip = zipPad(searchParams.value.toAdrZip);
  if (!isValidZip()) {
    searchParams.value.toAdrZip = '';
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
async function initGrdMain(data, view) {
  const fields = [
    { fieldName: 'baseYm' },
    { fieldName: 'dgr1LevlOgCd' },
    { fieldName: 'ogCd' },
    { fieldName: 'ogTpCd' },
    { fieldName: 'ogTp' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntr' },
    { fieldName: 'rcgvpKnm' },
    { fieldName: 'cstGdCd' },
    { fieldName: 'svpdItemGrNm' },
    { fieldName: 'svpdNmAbbr1' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'vstNmnN' },
    { fieldName: 'istNmnN' },
    { fieldName: 'vstDvCd' },
    { fieldName: 'vstPrgsStatCd' },
    { fieldName: 'svHshdNo' },
    { fieldName: 'svHshdNoCnt' },
    { fieldName: 'newAdrZip' },
    { fieldName: 'locaraTno' },
    { fieldName: 'exnoEncr' },
    { fieldName: 'idvTno' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'adr' },
    { fieldName: 'emd' },
    { fieldName: 'dgr2LevlOgCd' },
    { fieldName: 'dgr3LevlOgCd' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'mngerRglvlDvCd' },
    { fieldName: 'clsfCdSrnPrntCn' },
    { fieldName: 'egerWk' },
    { fieldName: 'fix' },
    { fieldName: 'chRsonCn' },

    { fieldName: 'mobileTno' }, // 휴대전화
    { fieldName: 'homeTno' }, // 전화번호
  ];

  const columns = [
    { fieldName: 'dgr1LevlOgCd', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), styleName: 'text-center', width: '90' }, // 총괄단
    { fieldName: 'ogCd', header: t('MSG_TXT_RGNL_GRP'), styleName: 'text-center', width: '90' }, // 지역단
    { fieldName: 'ogTp', header: t('MSG_TXT_ZIP_PSIC'), styleName: 'text-left', width: '120' }, // 우편번호 담당자
    { fieldName: 'cntr', header: t('MSG_TXT_CNTR_NO'), styleName: 'text-center', width: '150' }, // 계약번호
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), styleName: 'text-left', width: '100' }, // 고객명
    { fieldName: 'cstGdCd',
      header: t('MSG_TXT_CST_GRD'),
      styleName: 'text-center',
      width: '100',
      options: codes.CST_GD_CD,
      editor: {
        type: 'dropdown',
      } }, // 고객등급
    { fieldName: 'svpdItemGrNm', header: t('MSG_TXT_PD_GRP'), styleName: 'text-left', width: '100' }, // 상품그룹
    { fieldName: 'svpdNmAbbr1', header: t('MSG_TXT_PRDT_NM'), styleName: 'text-left', width: '110' }, // 상품명
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_TYPE'),
      styleName: 'text-center',
      width: '100',
      options: codes.SELL_TP_CD,
      editor: {
        type: 'dropdown',
      } }, // 유형
    { fieldName: 'vstNmnN', header: t('MSG_TXT_NMN'), styleName: 'text-right', width: '50' }, // 차월
    { fieldName: 'istNmnN', header: t('MSG_TXT_INST_MONTH_CNT'), styleName: 'text-right', width: '90' }, // 설치개월수
    { fieldName: 'vstDvCd',
      header: t('MSG_TXT_DIV'),
      styleName: 'text-center',
      width: '80',
      options: codes.VST_DV_CD,
      editor: {
        type: 'dropdown',
      } }, // 구분
    { fieldName: 'vstPrgsStatCd',
      header: t('MSG_TXT_PRGS_STATUS'),
      styleName: 'text-center',
      width: '80',
      options: codes.WK_PRGS_STAT_CD,
      editor: {
        type: 'dropdown',
      } }, // 진행상태
    { fieldName: 'svHshdNo', header: t('MSG_TXT_HSHD_CD'), styleName: 'text-center', width: '80' }, // 가구코드
    { fieldName: 'svHshdNoCnt', header: t('MSG_TXT_HSHD_N'), styleName: 'text-right', width: '80' }, // 가구수
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), styleName: 'text-center', width: '80' }, // 우편번호
    { fieldName: 'homeTno', header: t('MSG_TXT_IST_TNO'), styleName: 'text-center', width: '120' }, // 설치전화
    { fieldName: 'mobileTno', header: t('MSG_TXT_CP'), styleName: 'text-center', width: '120' }, // 휴대전화
    { fieldName: 'adr', header: t('MSG_TXT_ADDR'), styleName: 'text-left', width: '400' }, // 주소
    { fieldName: 'emd', header: t('MSG_TXT_EMD'), styleName: 'text-left', width: '200' }, // 읍명동
    { fieldName: 'dgr2LevlOgCd', header: t('MSG_TXT_RGNL_GRP'), styleName: 'text-center', width: '90' }, // 지역단
    { fieldName: 'dgr3LevlOgCd', header: t('MSG_TXT_BRANCH'), styleName: 'text-center', width: '90' }, // 지점
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PIC'), styleName: 'text-left', width: '80' }, // 담당자
    { fieldName: 'mngerRglvlDvCd',
      header: t('MSG_TXT_RGLVL'),
      styleName: 'text-center',
      width: '80',
      options: codes.RGLVL_DV_CD,
      editor: {
        type: 'dropdown',
      } }, // 급지
    { fieldName: 'clsfCdSrnPrntCn', header: t('MSG_TXT_TASK_TYPE'), styleName: 'text-left', width: '100' }, // 업무유형
    { fieldName: 'egerWk', header: t('MSG_TXT_CPSN_ASGN'), styleName: 'text-center', width: '80' }, // 강제배정
    { fieldName: 'fix', header: t('MSG_TXT_FXN'), styleName: 'text-center', width: '50' }, // 고정
    { fieldName: 'chRsonCn', header: t('MSG_TXT_FXN_RGST_RSON'), styleName: 'text-left', width: '200' }, // 고정등록 사유
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  await onClickSearch();
}
</script>
