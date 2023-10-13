<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC (배정관리)
2. 프로그램 ID : WwsncRoutineBsPsicAssignStateM - 정기B/S담당자배정 현황(K-W-SV-U-0038M01)
3. 작성자 : leeminwoo
4. 작성일 : 2023-08-31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 정기B/S담당자배정 현황 http://localhost:3000/#/service/routine-bs-psic-assign-state
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="5"
      :modified-targets="['grdMain']"
      :default-visible-rows="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ASGN_BASE_YM')"
          :colspan="1"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            :label="$t('MSG_TXT_ASGN_BASE_YM')"
            rules="required"
          />
        </kw-search-item>
        <!-- 상품그룹 -->
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :label="$t('MSG_TXT_PD_GRP')"
            first-option="all"
            :options="codes.PD_GRP_CD"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="productCode"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :colspan="2"
          :label="$t('MSG_TXT_PROM_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.startDt"
            v-model:to="searchParams.endDt"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_MNGT_DV')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.mngrDvCd"
            rules="required"
            :options="codes.MNGR_DV_CD"
            @update:model-value="onChangeMngrDvCd"
          />
          <kw-field
            v-model="searchParams.rgsnExcdYn"
          >
            <!-- 퇴사자제외 -->
            <template #default="{ field }">
              <kw-checkbox
                v-model="searchParams.rgsnExcdYn"
                v-bind="field"
                :label="$t('MSG_TXT_RGSN_EXCD')"
              />
            </template>
          </kw-field>
          <kw-field
            v-model="searchParams.vacManaYn"
          >
            <!-- 가상매니저 -->
            <template #default="{ field }">
              <kw-checkbox
                v-model="searchParams.vacManaYn"
                v-bind="field"
                :label="$t('MSG_TXT_VAC_MANA')"
              />
            </template>
          </kw-field>
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SV_TP')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.svTpCd"
            :options="tempOptions.svTpCd"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_PRGS_DV')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.prgsStatCd"
            :options="tempOptions.prgsStatCd"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_WK_CLS')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.wkDvCds"
            :multiple="true"
            :options="wkDvCds"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <template v-if="isManagerSelected">
          <wwsn-manager-og-search-item-group
            v-model:dgr1-levl-og-id="searchParams.dgr1LevlOgId"
            v-model:dgr2-levl-og-id="searchParams.dgr2LevlOgId"
            v-model:dgr3-levl-og-id="searchParams.dgr3LevlOgId"
            v-model:prtnr-no="searchParams.prtnrNo"
            use-og-level="2"
            use-partner
            dgr1-levl-og-first-option="all"
            dgr2-levl-og-first-option="all"
            dgr3-levl-og-first-option="all"
            partner-first-option="all"
            dgr1-levl-og-label="ogCdNm"
            dgr2-levl-og-label="ogCdNm"
            dgr3-levl-og-label="ogCdNm"
            partner-label="prtnrNoNm"
            dgr1-levl-og-readonly
            auth-yn="N"
          />
        </template>
        <template v-if="isEngineerSelected">
          <wwsn-engineer-og-search-item-group
            v-model:dgr1-levl-og-id="searchParams.ogId"
            v-model:prtnr-no="searchParams.prtnrNo"
            use-og-level="1"
            use-partner
            dgr1-levl-og-first-option="all"
            dgr1-levl-og-label="ogCdNm"
            partner-first-option="all"
            partner-label="prtnrNoNm"
            auth-yn="N"
          />
        </template>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>
        <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
          @click="onClickPrint"
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
          v-if="isEngineerSelected"
          dense
          :label="$t('MSG_BTN_EXP_PART_PS')"
          @click="onClickExpPartPs"
        />
        <kw-btn
          primary
          dense
          :label="$t('MSG_BTN_ASN_PS_PRNT')"
          @click="onClickOZ"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
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

import { getComponentType, defineGrid, gridUtil, useDataService, useGlobal, codeUtil, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import smsCommon from '~sms-wells/service/composables/useSnCode';
import { openReportPopup } from '~common/utils/cmPopupUtil';
import dayjs from 'dayjs';
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';
import WwsnEngineerOgSearchItemGroup from '~sms-wells/service/components/WwsnEngineerOgSearchItemGroup.vue';

const { getPartMaster } = smsCommon();

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const { getConfig } = useMeta();

const { modal } = useGlobal();
const { t } = useI18n();
const { currentRoute } = useRouter();
const router = useRouter();
const now = dayjs();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/routine-bs-psic-assign-state';

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const wkDvCds = ref();

const codes = await codeUtil.getMultiCodes(
  'PD_GRP_CD',
  'MNGR_DV_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'CST_GD_CD', // 고객등급
  'SELL_TP_CD', // 판매유형코드
  'MNGER_RGLVL_DV_CD', // 급지
  'SV_BIZ_DCLSF_CD',
  'SITE_AW_ATC_CD', // 현장수당항목코드
  'CNTR_DTL_STAT_CD', // 계약상세코드
  'AS_MAT_ITM_GRP_CD', // 품목그룹코드
  'HIR_FOM_CD', // 고용형태코드
  'PSTN_DV_CD', // 직급구분코드
);

const tempOptions = {
  svTpCd: [ // 서비스유형 - 서비스업무중분류코드(SV_BIZ_MCLSF_CD)
    { codeId: '21', codeName: t('정기B/S') }, // 정기B/S
    { codeId: '22', codeName: t('비정기B/S') }, // 비정기B/S
  ],
  prgsStatCd: [ // 진행구분
    { codeId: '00', codeName: t('작업대기') }, // 작업대기
    { codeId: '20', codeName: t('작업완료') }, // 작업완료
  ],
};
const searchParams = ref({
  baseYm: now.format('YYYYMMDD'),
  startDt: now.subtract(30, 'day').format('YYYYMMDD'),
  endDt: now.format('YYYYMMDD'),
  mngrDvCd: '2',
  pdGrpDtlCd: '',
  pdCd: '',
  ogId: '',
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  dgr3LevlOgId: '',
  prtnrNo: '',
  svTpCd: '',
  prgsStatCd: '',
  rgsnExcdYn: 'N',
  vacManaYn: 'N',
  wkDvCds: [],
  ozWkDvCds: '',
});

wkDvCds.value = [ // 작업구분 - 서비스업무세분류코드(SV_BIZ_DCLSF_CD) 모름
  { codeId: '2210', codeName: t('점검') }, // 점검(정기점검)
  { codeId: '2220', codeName: t('필터') }, // 필터(필터교체)
  { codeId: '2230', codeName: t('교체') }, // 교체(부품교체)
];

/* 관리 구분 : 매니저 */
const isManagerSelected = computed(() => searchParams.value.mngrDvCd === '1');
const isEngineerSelected = computed(() => searchParams.value.mngrDvCd === '2');

/*  관리구분 변경시 초기화 */
async function onChangeMngrDvCd() {
  searchParams.value.dgr1LevlOgId = '';
  searchParams.value.dgr2LevlOgId = '';
  searchParams.value.ogId = '';
  searchParams.value.prtnrNo = '';
}
let cachedParams;

async function fetchData() {
  const res = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: items, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(items);

  if (searchParams.value.mngrDvCd === '1') {
    view.columnByName('spcAsTpCd').visible = false; // 특별AS유형
    // view.columnByName('expPart').visible = false; // 예정부품
    view.columnByName('pstnDvCd').visible = false; // 직급구분
    view.columnByName('siteAwAtcNm').visible = false; // 현장수당항목
    view.columnByName('awAmt').visible = false; // 현장수당
  } else {
    view.columnByName('spcAsTpCd').visible = true; // 특별AS유형
    // view.columnByName('expPart').visible = true; // 예정부품
    view.columnByName('pstnDvCd').visible = true; // 직급구분
    view.columnByName('siteAwAtcNm').visible = true; // 현장수당항목
    view.columnByName('awAmt').visible = true; // 현장수당
  }

  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const { response } = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response,
  });
}

// 예정부품 팝업 호출
async function onClickExpPartPs() {
  await modal({
    component: 'WwsncExpProductStateP',
    componentProps: {
      baseYm: searchParams.value.baseYm,
      ogId: searchParams.value.ogId,
      pdGrpCd: searchParams.value.pdGrpCd,
      pdCd: searchParams.value.pdCd,
    },
  });
}

async function onClickOZ() {
  const ozWkDvCdList = searchParams.value.wkDvCds;
  if (ozWkDvCdList.length !== 0) {
    ozWkDvCdList.forEach((row) => {
      searchParams.value.ozWkDvCds += `'${row}',`;
    });
    searchParams.value.ozWkDvCds = searchParams.value.ozWkDvCds.substr(0, searchParams.value.ozWkDvCds.length - 1);
    console.log(searchParams.value.ozWkDvCds);
  }

  const ozParam = ref({
    ozrPath: '/kyowon_as/monthbs.ozr', // OZ 개발 중 ozp://kyowon_as/monthbs.ozr
    odiPath: '',
    args:
      {
        BASE_YM: searchParams.value.baseYm,
        MNGR_DV_CD: searchParams.value.mngrDvCd,
        DGR1_LEVL_OG_ID: searchParams.value.dgr1LevlOgId,
        DGR2_LEVL_OG_ID: searchParams.value.dgr2LevlOgId,
        DGR3_LEVL_OG_ID: searchParams.value.dgr3LevlOgId,
        OG_ID: searchParams.value.ogId,
        PRTNR_NO: searchParams.value.prtnrNo,
        PD_GRP_CD: searchParams.value.pdGrpCd,
        PD_CD: searchParams.value.pdCd,
        START_DT: searchParams.value.startDt,
        END_DT: searchParams.value.endDt,
        SV_TP_CD: searchParams.value.svTpCd,
        WK_DV_CDS: searchParams.value.ozWkDvCds,
        PRGS_STAT_CD: searchParams.value.prgsStatCd,
        RGSN_EXCD_YN: searchParams.value.rgsnExcdYn,
        VAC_MANA_YN: searchParams.value.vacManaYn,
      },
    height: 1300,
    width: 1400,
  });
  openReportPopup(
    ozParam.value.ozrPath,
    ozParam.value.odiPath,
    JSON.stringify(ozParam.value.args),
    { width: ozParam.value.width, height: ozParam.value.height },
  );
  console.log(ozParam.value.args);
  // OZ 호출 후, 변수 초기화
  searchParams.value.ozWkDvCds = '';
}

const productCode = ref();
watch(() => [searchParams.value.year, searchParams.value.pdGrpCd], async () => {
  // productCode.value = await getMcbyCstSvOjIz(searchParams.value.year, searchParams.value.pdGrpCd);
  const tempVal = await getPartMaster(
    '4',
    searchParams.value.pdGrpCd,
    'M',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    'X',
  );
  productCode.value = tempVal.map((v) => ({ codeId: v.cd, codeName: v.cdNm }));
}, { immediate: true });

onMounted(async () => {
  searchParams.value.mngrDvCd = '2';
  searchParams.value.rgsnExcdYn = 'N';
  searchParams.value.vacManaYn = 'N';
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'snRpblYn' },
    { fieldName: 'cstGdCd' },
    { fieldName: 'cstGdNm' },
    { fieldName: 'spcAsTpCd' },
    { fieldName: 'cstCnttYn' },
    { fieldName: 'vstPrgsStatCd' },
    { fieldName: 'vstPrgsStatNm' },
    { fieldName: 'statDtl' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'rcgvpKnm' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'locaraTno' },
    { fieldName: 'exnoEncr' },
    { fieldName: 'idvTno' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'sellTpNm' },
    { fieldName: 'mngerRglvlDvCd' },
    { fieldName: 'mngerRglvlDvNm' },
    { fieldName: 'expPart' },
    { fieldName: 'newAdrZip' },
    { fieldName: 'rndadr' },
    { fieldName: 'dgr2LevlOgId' },
    { fieldName: 'svBizMclsfCd' },
    { fieldName: 'svBizDclsfCd' },
    { fieldName: 'svBizDclsfNm' },
    { fieldName: 'bfVstDuedt' },
    { fieldName: 'vstDuedt' },
    { fieldName: 'vstCnfmdt' },
    { fieldName: 'vstCnfmHh' },
    { fieldName: 'vstFshDt' },
    { fieldName: 'vstFshHh' },
    { fieldName: 'cstUnuitmCn' },
    { fieldName: 'fstRgstDtm' },
    { fieldName: 'fstRgstTm' },
    { fieldName: 'ogId' },
    { fieldName: 'ogCd' },
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'pstnDvCd' },
    { fieldName: 'siteAwAtcCd' },
    { fieldName: 'siteAwAtcNm' },
    { fieldName: 'awAmt' },
    { fieldName: 'svProcsCn' },
    { fieldName: 'cstSignCn' },
    { fieldName: 'cstSign' },
    { fieldName: 'bgColo' },
    { fieldName: 'cntrDtlStatCd' },
    { fieldName: 'cntrDtlStatNm' },
    { fieldName: 'asMatItmGrpCd' },
    { fieldName: 'asMatItmGrpNm' },
    { fieldName: 'hirFomCd' },
    { fieldName: 'hirFomNm' },
  ];

  const columns = [
    {
      fieldName: 'snRpblYn',
      header: t('MSG_TXT_BARCODE'),
      width: '50',
      styleName: 'text-center',
    }, // 바코드
    { fieldName: 'cstGdNm', header: t('MSG_TXT_CST_GRD'), width: '70', styleName: 'text-center', options: codes.CST_GD_CD }, // 고객등급
    { fieldName: 'spcAsTpCd', header: t('MSG_TXT_SPC_AS_TYPE'), width: '80', styleName: 'text-center' }, // 특별AS유형
    { fieldName: 'cstCnttYn', header: t('MSG_TXT_BZNS_ACTI'), width: '70', styleName: 'text-center' }, // 영업활동
    { fieldName: 'vstPrgsStatNm', header: t('MSG_TXT_PRGS_STATUS'), width: '80', styleName: 'text-center' }, // 진행상태
    { fieldName: 'statDtl', header: t('MSG_TXT_STATUS_DTL'), width: '70', styleName: 'text-center' }, // 상태상세
    { // 계약번호
      fieldName: 'cntrDtlNo',
      header: t('MSG_TXT_CNTR_NO'),
      width: '140',
      styleName: 'text-center rg-button-link',
      renderer: { type: 'button' },
    },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' }, // 고객명
    { fieldName: 'cralIdvTno',
      header: t('MSG_TXT_CONTACT'),
      width: '120',
      styleName: 'text-center',
      editable: false,
      displayCallback(grid, index, value) {
        if (!isEmpty(value) && value.length === 4) {
          const values = grid.getValues(index.itemIndex);
          return `${values.cralLocaraTno}-${values.mexnoEncr}-${value}`;
        }
      },
    }, // 연락처
    { fieldName: 'idvTno',
      header: t('MSG_TXT_MPNO'),
      width: '120',
      styleName: 'text-center',
      editable: false,
      displayCallback(grid, index, value) {
        if (!isEmpty(value) && value.length === 4) {
          const values = grid.getValues(index.itemIndex);
          return `${values.locaraTno}-${values.exnoEncr}-${value}`;
        }
      },
    }, // 휴대전화번호
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '180', styleName: 'text-left' }, // 상품명
    { fieldName: 'sellTpNm', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center', options: codes.SELL_TP_CD }, // 판매유형
    { fieldName: 'mngerRglvlDvNm', header: t('MSG_TXT_RGLVL'), width: '60', styleName: 'text-center', options: codes.MNGER_RGLVL_DV_CD }, // 급지
    { fieldName: 'expPart', header: t('MSG_TXT_EXP_PART'), width: '80', styleName: 'text-center', options: codes.SV_BIZ_DCLSF_CD, visible: false }, // 예정부품
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '80', styleName: 'text-center' }, // 우편번호
    { fieldName: 'rndadr', header: t('MSG_TXT_ADDR'), width: '450', styleName: 'text-left' }, // 주소
    { fieldName: 'dgr2LevlOgId', header: t('MSG_TXT_RGNL_GRP'), width: '180', styleName: 'text-center' }, // 지역단-엔지니어만 존재
    {
      fieldName: 'svBizDclsfNm',
      header: t('MSG_TXT_WK_CNTN'),
      width: '200',
      styleName: 'text-center',
      options: codes.SV_BIZ_DCLSF_CD,
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback: () => t('MSG_TXT_WK_CNTN'),
    }, // 작업내용
    { fieldName: 'bfVstDuedt', header: t('MSG_TXT_BF_UPCMG_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 이전방문예정일자
    { fieldName: 'vstDuedt', header: t('MSG_TXT_UPCMG_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 방문예정일자
    { fieldName: 'vstCnfmdt', header: t('MSG_TXT_PROM_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 약속일자
    { fieldName: 'vstCnfmHh', header: t('MSG_TXT_PROM_HH'), width: '100', styleName: 'text-center', datetimeFormat: 'hh:mm:ss' }, // 약속시간
    { fieldName: 'vstFshDt', header: t('MSG_TXT_FSH_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 완료일자
    { fieldName: 'vstFshHh', header: t('MSG_TXT_FSH_HH'), width: '100', styleName: 'text-center', datetimeFormat: 'hh:mm:ss' }, // 완료시간
    { fieldName: 'cstUnuitmCn', header: t('MSG_TXT_CST_UNUITM'), width: '350', styleName: 'text-left' }, // 고객특이사항
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_IN_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 입력일자
    { fieldName: 'fstRgstTm', header: t('MSG_TXT_IN_HH'), width: '100', styleName: 'text-center', datetimeFormat: 'hh:mm:ss' }, // 입력시간
    { fieldName: 'ogNm', header: t('MSG_TXT_PIC_BLG'), width: '200', styleName: 'text-center' }, // 담당자소속
    { fieldName: 'ogCd', header: t('MSG_TXT_OG_CD'), width: '100', styleName: 'text-center' }, // 조직코드
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PIC_NM'), width: '100', styleName: 'text-center' }, // 담당자명
    { fieldName: 'prtnrNo', header: t('MSG_TXT_CNT_PER'), width: '100', styleName: 'text-center' }, // 담당자사번
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_PSTN_DV'), width: '100', styleName: 'text-center', options: codes.PSTN_DV_CD }, // 직급구분
    { fieldName: 'siteAwAtcNm', header: t('MSG_TXT_SITE_AW_ATC'), width: '200', styleName: 'text-center', options: codes.SITE_AW_ATC_CD }, // 현장수당항목
    { fieldName: 'awAmt', header: t('MSG_TXT_SITE_AW'), width: '100', styleName: 'text-center', numberFormat: '#,##0' }, // 현장수당
    { fieldName: 'svProcsCn', header: t('MSG_TXT_PROCS_IZ'), width: '120', styleName: 'text-left' }, // 처리내역
    { fieldName: 'cstSign', // 고객서명
      header: t('MSG_BTN_CST_SIGN'),
      width: '100',
      styleName: 'text-center',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback: () => t('MSG_BTN_CST_SIGN'),
    },
    { fieldName: 'cstSignCn', header: t('MSG_BTN_CST_SIGN'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'bgColo', header: t('MSG_TXT_CHG_ANNM'), width: '250', styleName: 'text-center' }, // 변동사항
    { fieldName: 'cntrDtlStatNm', header: t('MSG_TXT_CNTR_DTL'), width: '100', styleName: 'text-center', options: codes.CNTR_DTL_STAT_CD }, // 계약상세
    { fieldName: 'asMatItmGrpNm', header: t('MSG_TXT_ITM_GRP'), width: '180', styleName: 'text-center', options: codes.AS_MAT_ITM_GRP_CD }, // 품목그룹
    { fieldName: 'hirFomNm', header: t('MSG_TXT_HIR_FOM'), width: '150', styleName: 'text-center', options: codes.HIR_FOM_CD }, // 고용형태
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setFixedOptions({ colCount: 8, resizable: true });
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (grid, clickData) => {
    if (clickData.column === 'cstSign') {
      const cstSignCn = grid.getValue(clickData.itemIndex, 'cstSignCn');
      await modal({
        component: 'WwsnzSignPreviewP',
        componentProps: { sign: cstSignCn },
      });
    } else if (clickData.column === 'cntrDtlNo') {
      const cntrNo = grid.getValue(clickData.itemIndex, 'cntrNo');
      const cntrSn = grid.getValue(clickData.itemIndex, 'cntrSn');

      router.push({
        path: '/service/wwsnb-individual-service-list', // 개인별 서비스 현황 호출
        query: {
          cntrNo,
          cntrSn,
        },
      });
      // TO_DO 작업내용(svBizDclsfNm) 클릭 시, 투입부품 현황 팝업
    } else if (clickData.column === 'svBizDclsfNm') {
      const cstSignCn = grid.getValue(clickData.itemIndex, 'expPart');
      await modal({
        component: 'WwsnzSignPreviewP',
        componentProps: { expPart: cstSignCn },
      });
    }
  };
});
</script>
