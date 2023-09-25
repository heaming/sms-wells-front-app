<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC (배정관리)
2. 프로그램 ID : WwsncVisitCustomerRglvlStateM - 방문고객 급지 현황(K-W-SV-U-0231M01)
3. 작성자 : leeminwoo
4. 작성일 : 2023-07-17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 방문고객 급지현황 http://localhost:3000/#/service/wwsnc-visit-customer-rglvl-state
****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="3"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_VST_YM')"
          required
        >
          <!--방문년월-->
          <kw-date-picker
            v-model="searchParams.visitYm"
            type="month"
            :label="$t('MSG_TXT_VST_YM')"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CST_DV')"
        >
          <!--고객구분-->
          <kw-select
            v-model="searchParams.rcgvpDiv"
            :options="tempOptions.custDiv"
            first-option
            first-option-value="ALL"
            :first-option-label="$t('MSG_TXT_ALL')"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_MGT_RGLVL')"
        >
          <!--관리급지-->
          <kw-select
            v-model="searchParams.mngerRglvlDvCd"
            :options="codes.RGLVL_DV_CD"
            first-option
            first-option-value=""
            :first-option-label="$t('MSG_TXT_ALL')"
            :label="$t('MSG_TXT_MNGER_RGLVL_DV')"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <wwsn-manager-og-search-item-group
          ref="ogSearchRef"
          v-model:dgr1-levl-og-id="searchParams.executiveGroup"
          v-model:dgr2-levl-og-id="searchParams.localGroup"
          v-model:dgr3-levl-og-id="searchParams.branchOffice"
          v-model:prtnr-no="searchParams.partnerNo"
          use-og-level="2"
          use-partner
          dgr1-levl-og-first-option="all"
          dgr2-levl-og-first-option="all"
          partner-first-option="all"
          dgr1-levl-og-label="ogCdNm"
          dgr2-levl-og-label="ogCdNm"
          partner-label="prtnrNoNm"
          dgr1-levl-og-readonly
          auth-yn="N"
        />
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
        </template>
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          icon="download_on"
          dense
          secondary
          :disable="totalCount === 0"
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          @click="onClickExcelDownload"
        /><!--엑셀다운로드-->
        <kw-separator
          vertical
          inset
          spaced
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :total-count="totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { getComponentType, defineGrid, gridUtil, useDataService, codeUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';

const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();

const router = useRouter();

const { t } = useI18n();
const { currentRoute } = useRouter();
const now = dayjs();

const codes = await codeUtil.getMultiCodes(
  'RGLVL_DV_CD',
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/service/visit-customer-rglvl-state';

const tempOptions = {
  custDiv: [
    { codeId: '1', codeName: t('MSG_TXT_NW_CST') }, // 신규고객
    { codeId: '2', codeName: t('MSG_TXT_EXP_CST') }, // 예정고객
    { codeId: '3', codeName: t('MSG_TXT_VST_CST') }, // 방문고객
    { codeId: '4', codeName: t('MSG_TXT_CMPLTD_CST') }, // 방문완료고객
    { codeId: '5', codeName: t('MSG_TXT_CAN_CST') }, // 취소고객
  ],
  rcgvpDivs: [
    { codeId: '1', codeName: t('MSG_TXT_NEW') }, // 신규
    { codeId: '2', codeName: t('MSG_TXT_EXP') }, // 예정
    { codeId: '3', codeName: t('MSG_TXT_VST') }, // 방문
    { codeId: '4', codeName: t('MSG_TXT_COMPLETE') }, // 완료
    { codeId: '5', codeName: t('MSG_TXT_CANCEL') }, // 취소
  ],
};
const searchParams = ref({
  visitYm: now.format('YYYYMM'),
  rcgvpDiv: 'ALL', /* 고객구분 */
  mngerRglvlDvCd: '', /* 관리급지 */
  executiveGroup: '', /* 총괄단 */
  localGroup: '', /* 지역단 */
  partnerNo: '', /* 매니저 */
});
let cachedParams;
const totalCount = ref(0);

async function fetchData() {
  const res = await dataService.get(`${baseUrl}`, { params: cachedParams });
  const list = res.data;
  totalCount.value = list.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}
async function onClickSearch() {
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
  const fields = [
    { fieldName: 'mngtYm' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrCstNo' },
    { fieldName: 'rcgvpDiv' },
    { fieldName: 'rcgvpKnm' },
    { fieldName: 'basePdCd' },
    { fieldName: 'basePdNm' },
    { fieldName: 'pdctPdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'svPdCd' },
    { fieldName: 'svPdNm' },
    { fieldName: 'sellTpCd' },
    { fieldName: 'sellTpNm' },
    { fieldName: 'istNmnN' },
    { fieldName: 'vstNmnN' },
    { fieldName: 'vstPrgsStatCd' },
    { fieldName: 'vstPrgsStatNm' },
    { fieldName: 'newAdrZip' },
    { fieldName: 'addr' },
    { fieldName: 'adrDvCd' },
    { fieldName: 'adrId' },
    { fieldName: 'ogCd' },
    { fieldName: 'ogNm' },
    { fieldName: 'fxnPrtnrYn' },
    { fieldName: 'fxnPrtnrYnNm' },
    { fieldName: 'mngtPrtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'mngrDvCd' },
    { fieldName: 'mngtPrtnrOgTpCd' },
    { fieldName: 'mngerRglvlDvCd' },
    { fieldName: 'hgrOgId' },
    { fieldName: 'dgr2LevlOgCd' },
    { fieldName: 'svpdSapCd' },
    { fieldName: 'rglvlDstn' },
    { fieldName: 'cstSvAsnNo' },
  ];

  const columns = [
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CNTR_NO'), width: '150', styleName: 'text-center rg-button-link', renderer: { type: 'button' } }, // 계약상세번호
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' }, // 고객명
    { fieldName: 'svpdSapCd', header: t('MSG_TXT_SAPCD'), width: '170', styleName: 'text-center' }, // SAP코드
    { fieldName: 'pdctPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' }, // 품목코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '180', styleName: 'text-center' }, // 상품명
    { fieldName: 'sellTpNm', header: '유형', width: '100', styleName: 'text-center' },
    { fieldName: 'istNmnN', header: t('MSG_TXT_INSTALLATION'), width: '60', styleName: 'text-center' }, // 설치
    { fieldName: 'vstNmnN', header: t('MSG_TXT_VST'), width: '60', styleName: 'text-center' }, // 방문
    { fieldName: 'rcgvpDiv', // 구분
      header: t('MSG_TXT_DIV'),
      width: '60',
      styleName: 'text-center',
      editor: {
        type: 'list',
      },
      options: tempOptions.rcgvpDivs,
    },
    { fieldName: 'vstPrgsStatNm', header: t('MSG_TXT_PRGS_STATUS'), width: '100', styleName: 'text-center' }, // 진행상태
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '100', styleName: 'text-center' }, // 우편번호
    { fieldName: 'addr', header: t('MSG_TXT_ADDR'), width: '430', styleName: 'text-left' }, // 주소
    { fieldName: 'rglvlDstn', header: t('MSG_TXT_RGLVL_DSTN'), width: '80', styleName: 'text-center' }, // 급간거리
    { fieldName: 'mngerRglvlDvCd', header: t('MSG_TXT_RGLVL'), width: '60', styleName: 'text-center', options: codes.mngerRglvlDvCd }, // 급지
    { fieldName: 'dgr2LevlOgCd', header: t('MSG_TXT_CENTER_DIVISION'), width: '100', styleName: 'text-center' }, // 센터
    { fieldName: 'fxnPrtnrYnNm', header: t('MSG_TXT_DIV'), width: '60', styleName: 'text-center' }, // 구분
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PIC'), width: '80', styleName: 'text-center' }, // 담당자
  ];
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellItemClicked = async (grid, { column, itemIndex }) => {
    if (column === 'cntrCstNo') {
      const cntrNo = grid.getValue(itemIndex, 'cntrNo');
      const cntrSn = grid.getValue(itemIndex, 'cntrSn');

      router.push({
        path: '/service/wwsnb-individual-service-list', // 개인별 서비스 현황 호출
        query: {
          cntrNo,
          cntrSn,
        },
      });
    }
  };
});
</script>
