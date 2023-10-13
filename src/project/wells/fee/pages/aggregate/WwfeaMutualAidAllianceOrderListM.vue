<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEA
2. 프로그램 ID : WwfeaMutualAidAllianceOrderListM - 상조제휴주문 조회
3. 작성자 : gs.ritvik.m
4. 작성일 : 2023.03.14
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상조제휴주문 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      v-permission:read
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 실적년월 -->
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.baseYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_PERF_YM')"
          />
        </kw-search-item>
        <!-- 실적구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_PERF_DV')"
        >
          <kw-option-group
            v-model="searchParams.cntrStat"
            type="radio"
            :options="[{ codeId: '0', codeName: $t('MSG_TXT_RCP') },
                       { codeId: '1', codeName: $t('MSG_TXT_CNTRCT') },
                       { codeId: '2', codeName: $t('MSG_TXT_CANCEL') }]"
            :label="$t('MSG_TXT_PERF_DV')"
          />
        </kw-search-item>
        <!-- 제휴구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_ALNC_DV')"
        >
          <kw-option-group
            v-model="searchParams.alncCd"
            type="radio"
            :options="[{ codeId: '0', codeName: $t('MSG_TXT_ALL') },
                       { codeId: '1', codeName: $t('MSG_TXT_ALNC') },
                       { codeId: '2', codeName: $t('MSG_TXT_UNF') }]"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 직책유형 -->
        <kw-search-item
          :label="$t('MSG_TXT_RSB_TP')"
        >
          <kw-option-group
            v-model="searchParams.rsbDvCd"
            type="radio"
            rules="required"
            :options="[{ codeId: '0', codeName: $t('MSG_TXT_ALL') },
                       { codeId: '15', codeName: $t('MSG_TXT_PLAR') },
                       { codeId: '7', codeName: $t('MSG_TXT_BRMGR') }]"
            :label="$t('MSG_TXT_RSB_TP')"
          />
        </kw-search-item>
        <!-- 조직레벨 -->
        <kw-search-item
          :label="$t('MSG_TXT_OG_LEVL')"
          :colspan="2"
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.dgr2LevlOgId"
            v-model:og-levl-dv-cd2="searchParams.dgr3LevlOgId"
            v-model:og-levl-dv-cd3="searchParams.dgr4LevlOgId"
            :og-tp-cd="searchParams.ogTpCd"
            :base-ym="searchParams.baseYm"
            :start-level="1"
            :end-level="3"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <zwog-partner-search
            v-model:prtnr-no="searchParams.prtnrNo"
            v-model:prtnr-knm="searchParams.prtnrNm"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
          <span class="ml8">{{ t('MSG_TXT_UNIT_COLON_WON') }}</span>
        </template>

        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="(totalCount === 0)"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdRef"
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
import { getComponentType, defineGrid, gridUtil, useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import ZwogPartnerSearch from '~sms-common/organization/components/ZwogPartnerSearch.vue';

const now = dayjs();
const { t } = useI18n();
const { currentRoute } = useRouter();
const { getters } = useStore();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const userInfo = getters['meta/getUserInfo'];
const { ogTpCd } = userInfo;

const grdRef = ref(getComponentType('KwGrid'));
const grdData = computed(() => grdRef.value?.getData());
const totalCount = ref(0);

let cachedParams;
const searchParams = ref({
  baseYm: now.format('YYYYMM'),
  cntrStat: '0',
  alncCd: '0',
  rsbDvCd: '0',
  ogTpCd,
  dgr2LevlOgId: '',
  dgr3LevlOgId: '',
  dgr4LevlOgId: '',
  prtnrNo: '',
  prtnrNm: '',
});

// 데이터 조회
async function fetchData() {
  const { data } = await dataService.get('sms/wells/fee/mutual-aid/order', { params: { ...cachedParams } });
  grdData.value.setRows(data);
  totalCount.value = data.length;
}
// 조회버튼
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdRef.value.getView();
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
  });
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'alncNm', header: t('MSG_TXT_ALNC_DV'), width: '91', styleName: 'text-center' }, // 제휴구분
    { fieldName: 'cntrNo', header: `Wells ${t('MSG_TXT_CNTR_NO')}`, width: '138', styleName: 'text-center' }, // 계약번호
    { fieldName: 'lifCntrNo', header: `${t('MSG_TXT_MUTU')} ${t('MSG_TXT_CNTR_NO')}`, width: '138', styleName: 'text-center' }, // 상조계약번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '111', styleName: 'text-left ' }, // 고객명
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '104', styleName: 'text-center' }, // 소속
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '111', styleName: 'text-center' }, // 번호
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '111', styleName: 'text-left' }, // 성명
    { fieldName: 'cdCntn', header: t('MSG_TXT_RSB'), width: '111', styleName: 'text-left' }, // 직책
    { fieldName: 'brmgrPrtnrNo', header: t('MSG_TXT_BRMGR'), width: '111', styleName: 'text-center' }, // 지점장
    { fieldName: 'rcpdt', header: t('MSG_TXT_RCP_D'), width: '111', styleName: 'text-center', datetimeFormat: 'date' }, // 접수일
    { fieldName: 'cntrDt', header: t('MSG_TXT_CNTRCT_DT'), width: '111', styleName: 'text-center', datetimeFormat: 'date' }, // 계약일
    { fieldName: 'dpDt', header: t('MSG_TXT_DEP_DT'), width: '111', styleName: 'text-center', datetimeFormat: 'date' }, // 입금일
    { fieldName: 'wdwlDt', header: t('MSG_TXT_WTH_DT'), width: '111', styleName: 'text-center', datetimeFormat: 'date', visible: false }, // 철회일
    { fieldName: 'canDt', header: t('MSG_TXT_CAN_D'), width: '111', styleName: 'text-center', datetimeFormat: 'date', visible: false }, // 취소일
    { fieldName: 'feeDsbYm', header: t('MSG_TXT_FEE_MN'), width: '111', styleName: 'text-center', datetimeFormat: 'yyyy-MM' }, // 수수료월
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));
  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
