<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB (방문관리)
2. 프로그램 ID : WwsnbRentalMembershipCancelPsM(K-W-SV-U-0058M01) - 렌탈,멤버십 취소 현황
3. 작성자 : jungheejin
4. 작성일 : 2023-10-31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈,멤버십 취소 현황 http://localhost:3000/#/service/wwsnb-rental-membership-cancel-ps
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
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_MGT_YNM')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_DIV')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="customCodes.sellTpCd"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_MNGT_DV')"
          :colspan="1"
        >
          <kw-select
            v-model="searchParams.mngrDvCd"
            :options="codes.MNGR_DV_CD"
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
            auth-yn="N"
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
import { codeUtil, getComponentType, defineGrid, gridUtil, useDataService } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';
import WwsnEngineerOgSearchItemGroup from '~sms-wells/service/components/WwsnEngineerOgSearchItemGroup.vue';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const router = useRouter();
const { currentRoute } = useRouter();
const { t } = useI18n();
const now = dayjs();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/rental-membership-cancel-ps';

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'MNGR_DV_CD',
);
const customCodes = {
  sellTpCd: [
    { codeId: '1', codeName: t('MSG_TXT_MEMBERSHIP') },
    { codeId: '2', codeName: t('MSG_TXT_RENTAL') },
  ],
};
const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  sellTpCd: '',
  mngrDvCd: '',
  ogId: '',
  prtnrNo: '',
  dgr1LevlOgId: '',
  dgr2LevlOgId: '',
  dgr3LevlOgId: '',
});

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

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
});

let cachedParams;
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
    { fieldName: 'sellOgCd', header: t('MSG_TXT_BLG'), width: '200', styleName: 'text-center' }, /* 소속(판매자) */
    { fieldName: 'sellOgNm', header: t('MSG_TXT_BLG_NM'), width: '200', styleName: 'text-center' }, /* 소속명 */
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_SELLER_ID'), width: '200', styleName: 'text-center' }, /* 판매자사번 */
    { fieldName: 'sellPrtnrKnm', header: t('MSG_TXT_SELL_NM'), width: '200', styleName: 'text-center' }, /* 판매자명 */
    { fieldName: 'ogId', header: t('MSG_TXT_MNGT_CENTER'), width: '200', styleName: 'text-center' }, /* 관리센터 */
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '200', styleName: 'text-center' }, /* 소속(관리자) */
    { fieldName: 'prtnrNo', header: t('MSG_TXT_ADMIN_SBN'), width: '200', styleName: 'text-center' }, /* 관리자사번 */
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_ADMIN_NM'), width: '200', styleName: 'text-center' }, /* 관리자명 */
    {
      fieldName: 'cntrNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '150',
      styleName: 'text-center rg-button-icon--search',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        if (!isEmpty(cntrNo)) {
          return `${cntrNo}-${cntrSn}`;
        }
      },
    },
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '200', styleName: 'text-center' }, /* 고객명 */
    { fieldName: 'sapMatCd', header: t('MSG_TXT_SAPCD'), width: '200', styleName: 'text-center' }, /* SAP코드 */
    { fieldName: 'pdCd', header: t('MSG_TXT_PRDT_CODE'), width: '200', styleName: 'text-center' }, /* 상품코드 */
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-center' }, /* 상품명 */
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
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '200', styleName: 'text-center' }, /* 우편번호 */
    {
      fieldName: 'rnadr',
      header: t('MSG_TXT_INST_ADDR'),
      width: '200',
      styleName: 'text-left',
      displayCallback(grid, index) {
        const { rnadr, rdadr } = grid.getValues(index.itemIndex);
        if (!isEmpty(rnadr)) {
          return `${rnadr}, ${rdadr}`;
        }
      },
    },
    { fieldName: 'rdadr', visible: false },
    { fieldName: 'col26', header: t('MSG_TXT_CNCL_DV'), width: '200', styleName: 'text-center' }, /* 취소구분 */
    { fieldName: 'col27', header: t('MSG_TXT_CANC_IZ'), width: '200', styleName: 'text-center' }, /* 취소내역 */
    { fieldName: 'col28', header: t('MSG_TXT_IST_DT'), width: '200', styleName: 'text-center', datetimeFormat: 'date' }, /* 설치일자 */
    { fieldName: 'col29', header: t('MSG_TXT_CANC_DT'), width: '200', styleName: 'text-center', datetimeFormat: 'date' }, /* 취소일자 */
    { fieldName: 'col30', header: t('MSG_TXT_USE_PTRM'), width: '200', styleName: 'text-right', dataType: 'number' }, /* 사용기간 */
    { fieldName: 'col31', header: t('MSG_TXT_CONTRACT_PERI'), width: '200', styleName: 'text-right', dataType: 'number' }, /* 약정기간 */
    { fieldName: 'col32', header: t('MSG_TXT_CAN_CTR'), width: '200', styleName: 'text-right', dataType: 'number' }, /* 취소조정 */
    { fieldName: 'col33', header: t('MSG_TXT_BOR_AMT'), width: '200', styleName: 'text-right', dataType: 'number' }, /* 위약금액 */
    { fieldName: 'col34', header: t('MSG_TXT_CST_PS'), width: '200', styleName: 'text-right', dataType: 'number' }, /* 분손실료 */
  ];
  const columnLayout = [
    {
      header: t('MSG_TXT_SELLER_PERSON_PESL_ARTC'),
      items: ['sellOgCd', 'sellOgNm', 'sellPrtnrNo', 'sellPrtnrKnm'],
    },
    'ogId',
    {
      header: t('MSG_TXT_MNGT_PERSON_PESL_ARTC'),
      items: ['ogCd', 'prtnrNo', 'prtnrKnm'],
    },
    {
      header: t('MSG_TXT_CST_PS'),
      items: ['cntrNo', 'rcgvpKnm', 'sapMatCd', 'pdCd', 'pdNm', 'idvTno', 'newAdrZip', 'rnadr'],
    },
    {
      header: t('MSG_TXT_CANC_IZ'),
      items: ['col26', 'col27', 'col28', 'col29', 'col30', 'col31', 'col32', 'col33', 'col34'],
    },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);
  view.setFixedOptions({ colCount: 1, resizable: true });
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.onCellItemClicked = async (grid, index) => {
    if (index.column === 'cntrNo') {
      const cntrNo = grid.getValue(index.itemIndex, 'cntrNo');
      const cntrSn = grid.getValue(index.itemIndex, 'cntrSn');
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
