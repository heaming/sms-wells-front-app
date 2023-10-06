<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC (배정관리)
2. 프로그램 ID : WwsncAsRepInqrListM - AS 접수 목록 조회(K-W-SV-U-0020M01)
3. 작성자 : jungheejin
4. 작성일 : 2023-10-06
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- AS 접수 목록 조회 http://localhost:3000/#/service/wwsnc-as-rcp-inqr-list
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
          :label="t('MSG_TXT_BASE_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            :label="$t('MSG_TXT_BASE_YM')"
            rules="required"
            type="month"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_PROCS_DV')">
          <kw-select
            v-model="searchParams.procYn"
            :options="customCodes.procYn"
          />
          <kw-field
            v-model="searchParams.rgsnYn"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-model="searchParams.rgsnYn"
                v-bind="field"
                :label="$t('MSG_TXT_RGSN_EXCD')"
              />
            </template>
          </kw-field>
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_RCP_DV')">
          <kw-select
            v-model="searchParams.rcpGb"
            :options="codes.SV_BIZ_HCLSF_CD.filter((v) => ['3','7'].includes(v.codeId))"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_MNGT_DV')">
          <kw-select
            v-model="searchParams.mngrDvCd"
            :label="$t('MSG_TXT_MNGT_DV')"
            :options="codes.LOCARA_MNGT_DV_CD"
            first-option="all"
            @update:model-value="onChangeMngrDvCd"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 총괄단, 지역단, 지점 ,매니저 -->
        <template v-if="isManagerSelected">
          <wwsn-manager-og-search-item-group
            v-model:dgr1-levl-og-id="searchParams.dgr1LevlOgId"
            v-model:dgr2-levl-og-id="searchParams.dgr2LevlOgId"
            v-model:dgr3-levl-og-id="searchParams.dgr3LevlOgId"
            v-model:prtnr-no="searchParams.prtnrNo"
            use-og-level="3"
            use-partner
            dgr1-levl-og-first-option="all"
            dgr2-levl-og-first-option="all"
            dgr3-levl-og-first-option="all"
            partner-first-option="all"
            dgr1-levl-og-label="ogCdNm"
            dgr2-levl-og-label="ogCdNm"
            dgr3-levl-og-label="ogCdNm"
            partner-label="prtnrNoNm"
          />
        </template>
        <template v-if="isEngineerSelected">
          <!-- 서비스센터, 엔지니어-->
          <wwsn-engineer-og-search-item-group
            v-model:dgr1-levl-og-id="searchParams.ogId"
            v-model:prtnr-no="searchParams.prtnrNo"
            use-og-level="1"
            use-partner
            dgr1-levl-og-first-option="all"
            dgr1-levl-og-label="ogCdNm"
            partner-first-option="all"
            partner-label="prtnrNoNm"
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
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="fetchData"
          />
        </template>
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
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

import { getComponentType, defineGrid, gridUtil, useDataService, codeUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';
import WwsnEngineerOgSearchItemGroup from '~sms-wells/service/components/WwsnEngineerOgSearchItemGroup.vue';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const { currentRoute } = useRouter();
const { t } = useI18n();
const router = useRouter();
const now = dayjs();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/as-rcp-list-inqr';
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'SV_BIZ_HCLSF_CD',
  'LOCARA_MNGT_DV_CD',
);

const customCodes = {
  procYn: [
    { codeId: '', codeName: t('MSG_TXT_ALL') },
    { codeId: 'Y', codeName: t('MSG_TXT_PROC') },
    { codeId: 'N', codeName: t('MSG_TXT_NO_PROC') },
  ],
};
const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  procYn: '', // 처리여부
  rgsnYn: 'N', // 퇴사자여부
  rcpGb: '',
  mngrDvCd: '',
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  dgr3LevlOgId: '',
  ogId: '',
  prtnrNo: '', // 파트너번호(매니저/엔지니어 파트너번호)
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
});

let cachedParams;

/* 관리 구분 : 매니저 */
const isManagerSelected = computed(() => searchParams.value.mngrDvCd === '1');
const isEngineerSelected = computed(() => searchParams.value.mngrDvCd === '2');
/*  관리구분 변경시 초기화 */
async function onChangeMngrDvCd() {
  searchParams.value.dgr1LevlOgId = '';
  searchParams.value.dgr2LevlOgId = '';
  searchParams.value.dgr3LevlOgId = '';
  searchParams.value.ogId = '';
  searchParams.value.prtnrNo = '';
}

async function fetchData() {
  const res = await dataService.get(`${baseUrl}/paging`, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: result, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(result);
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
  const res = await dataService.get(`${baseUrl}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'dgr1LevlOgCd', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '130', styleName: 'text-center' }, // 총괄단
    { fieldName: 'dgr2LevlOgCd', header: t('MSG_TXT_RGNL_GRP'), width: '130', styleName: 'text-center' }, // 지역단
    { fieldName: 'dgr3LevlOgNm', header: t('MSG_TXT_BLG'), width: '130', styleName: 'text-center' }, // 소속
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' }, // 사번
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PIC_NM'), width: '100', styleName: 'text-center' }, // 담당자명
    { fieldName: 'bldNm', header: t('MSG_TXT_CFMNR_BLD'), width: '130', styleName: 'text-center' }, // 상주빌딩
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 설치일자
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center rg-button-link',
      renderer: {
        type: 'button',
      },
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        if (!isEmpty(cntrNo)) {
          return `${cntrNo}-${cntrSn}`;
        }
      },
    },
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' }, // 고객명
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '170', styleName: 'text-center' }, // SAP코드
    { fieldName: 'pdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' }, // 품목코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '170', styleName: 'text-left' }, // 상품명
    { fieldName: 'locaraTno', visible: false }, // [전화번호1]
    { fieldName: 'exnoEncr', visible: false }, // [전화번호2]
    {
      fieldName: 'idvTno', // [전화번호3]
      header: t('MSG_TXT_TEL_NO'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        // 휴대전화번호 3-4-4 형식으로 표시
        if (!isEmpty(value) && value.length === 4) {
          const values = grid.getValues(index.itemIndex);
          return `${values.locaraTno}-${values.exnoEncr}-${value}`;
        }
      },
    },
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '80', styleName: 'text-center' }, // 우편번호
    { fieldName: 'rnadr', header: t('MSG_TXT_ADDR'), width: '380', styleName: 'text-left' }, // 주소
    { fieldName: 'rdadr', header: t('MSG_TXT_ADDR_DTL'), width: '380', styleName: 'text-left' }, // 상세주소
    { fieldName: 'asAskCn', header: t('MSG_TXT_AS_CN'), width: '400', styleName: 'text-left' }, // AS내용
    { fieldName: 'rcpDt', header: t('MSG_TXT_RCPDT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 접수일자
    { fieldName: 'rcpPrtnrKnm', header: t('MSG_TXT_RCST'), width: '100', styleName: 'text-center' }, // 접수자
    { fieldName: 'svBizDclsfNm', header: t('MSG_TXT_RCP_IZ'), width: '100', styleName: 'text-center' }, // 접수내역
    { fieldName: 'weccProcsYn', header: t('MSG_TXT_PROCS_YN'), width: '100', styleName: 'text-center' }, // 처리여부
    { fieldName: 'wkPrtnrKnm', header: t('MSG_TXT_PCP'), width: '120', styleName: 'text-center' }, // 처리자
    { fieldName: 'wkExcnDt', header: t('MSG_TXT_PRCSDT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 처리일자
    { fieldName: 'wkPrgsStatNm', header: t('MSG_TXT_PROCS_RS'), width: '100', styleName: 'text-center' }, // 처리결과
    { fieldName: 'wkCanRsonNm', header: t('MSG_TXT_PROCS_FOM'), width: '150', styleName: 'text-center' }, // 처리형태
    { fieldName: 'wkCanCn', header: t('MSG_TXT_DTL_IZ'), width: '400', styleName: 'text-left' }, // 상세내역
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.setFixedOptions({ colCount: 5, resizable: true });
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'cntrNo') {
      const cntrNo = g.getValue(itemIndex, 'cntrNo');
      const cntrSn = g.getValue(itemIndex, 'cntrSn');

      router.push({
        path: '/service/wwsnb-individual-service-list',
        query: {
          cntrNo,
          cntrSn,
        },
      });
    }
  };
});

</script>
