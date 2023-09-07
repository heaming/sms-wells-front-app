<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNB (방문관리)
 2. 프로그램 ID : WwsnbIndividualServiceListM - 개인별 서비스 현황(W-SV-U-0072M01)
 3. 작성자 : kyunglynlee
 4. 작성일 : 2023.06.20
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 엔지니어 개인별 서비스 현황 정보를 표출 (http://localhost:3000/#/service/wwsnb-individual-service-list)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <!-- rev:230621 cols="3"으로 수정 -->
      <kw-search-row>
        <!-- 계약번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
        >
          <zctz-contract-detail-number
            ref="contractNumberRef"
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            disable-popup
            cntr-sn-required
          >
            <template #append>
              <kw-icon
                name="search"
                @click="onClickCstSearch"
              />
            </template>
          </zctz-contract-detail-number>
        </kw-search-item>
        <!-- 바코드 -->
        <kw-search-item :label="$t('MSG_TXT_BARCODE')">
          <kw-input v-model="searchParams.bcNo" />
        </kw-search-item>
        <!-- 송장번호 -->
        <kw-search-item :label="$t('MSG_TXT_IVC_NO')">
          <kw-input v-model="searchParams.idvTno" />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <!-- 개인별 방문주기 조회 -->
        <kw-btn
          :label="$t('MSG_BTN_INDV_VST_INQR')"
          secondary
          dense
          :disable="isDisableButton"
          @click="onClickVisitPeriodSearch"
        />
        <!-- 개인별 방문주기 생성 -->
        <kw-btn
          :label="$t('MSG_BTN_INDV_VST_CRT')"
          secondary
          dense
          :disable="isDisableButton"
          @click="onClickVisitPeriodCreate"
        />
      </kw-action-top>
      <kw-form
        :cols="4"
      >
        <!-- rev:230621 dense 삭제 -->
        <kw-form-row>
          <!-- 계약번호 -->
          <kw-form-item
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
          >
            <p>{{ individualParams.cntrNoDtl }}</p>
          </kw-form-item>
          <!-- 고객성명 -->
          <kw-form-item
            :label="$t('MSG_TXT_CUST_STMT')"
          >
            <p>{{ individualParams.cstNm }}</p>
          </kw-form-item>
          <!-- 고객등급 -->
          <kw-form-item
            :label="$t('MSG_TXT_CST_GRD')"
          >
            <p>{{ individualParams.cstGdNm }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 전화번호 -->
          <kw-form-item
            :label="$t('MSG_TXT_TEL_NO')"
          >
            <p>
              {{ !isEmpty(individualParams.locaraTno && individualParams.exnoEncr && individualParams.idvTno)
                ? `${individualParams.locaraTno}-${individualParams.exnoEncr}-${individualParams.idvTno}`
                : '' }}
            </p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_MPNO')"
          >
            <p>
              {{ !isEmpty(individualParams.cralLocaraTno && individualParams.mexnoEncr && individualParams.cralIdvTno)
                ? `${individualParams.cralLocaraTno}-${individualParams.mexnoEncr}-${individualParams.cralIdvTno}`
                : '' }}
            </p>
          </kw-form-item>
          <!-- 주소 -->
          <kw-form-item
            :label="$t('MSG_TXT_ADDR')"
            :colspan="2"
          >
            <p>{{ individualParams.addr }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 특이사항 -->
          <kw-form-item
            :label="$t('MSG_TXT_UNUITM')"
            :colspan="2"
          >
            <kw-input
              v-model="individualParams.cstUnuitmCn"
              type="textarea"
              rows="1"
            />
            <!-- 저장 -->
            <kw-btn
              secondary
              :label="$t('MSG_BTN_SAVE')"
              padding="12px"
              @click="onClickSave"
            />
            <!-- rev:230621 padding="12px" 추가-->
          </kw-form-item>
          <!-- 작성자 -->
          <kw-form-item
            :label="$t('MSG_TIT_DOC_CRTR')"
          >
            <p>{{ individualParams.wkPrtnrNm }}</p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TIT_DRAT_DTM')"
          >
            <p>{{ stringUtil.getDatetimeFormat(individualParams.wrteDt) }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator />
      <kw-form
        dense
        cols="4"
      >
        <kw-form-row>
          <!-- 계약상품 -->
          <kw-form-item
            :label="$t('MSG_TXT_CNTR_PD')"
          >
            <p>{{ individualParams.basePdNm }}</p>
          </kw-form-item>
          <!-- 현재상품 -->
          <kw-form-item
            :label="$t('MSG_TXT_CRTL_PD')"
          >
            <p>{{ individualParams.pdNm }}</p>
          </kw-form-item>
          <!-- 무상AS -->
          <kw-form-item
            :label="$t('MSG_TXT_FREE_AS')"
          >
            <p>{{ individualParams.frisuAsPtrmN }}</p>
          </kw-form-item>
          <!-- 무상BS -->
          <kw-form-item
            :label="$t('MSG_TXT_FREE_BS')"
          >
            <p>{{ individualParams.frisuBfsvcPtrmN }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 용도구분 -->
          <kw-form-item
            :label="$t('MSG_TXT_USWY_DV')"
          >
            <p>{{ individualParams.pdUswy }}</p>
          </kw-form-item>
          <!-- 주기변경 -->
          <kw-form-item
            :label="$t('MSG_TXT_PRD_CHNG')"
          >
            <p>{{ stringUtil.getDateFormat(individualParams.chnDt) }}</p>
          </kw-form-item>
          <!-- 판매유형 -->
          <kw-form-item
            :label="$t('MSG_TXT_SEL_TYPE')"
          >
            <p>{{ individualParams.sellTpNm }}</p>
          </kw-form-item>
          <!-- 관리유형 -->
          <kw-form-item
            :label="$t('MSG_TXT_MGT_TYP')"
          >
            <p>{{ individualParams.svTpNm }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 계약일자 -->
          <kw-form-item
            :label="$t('MSG_TXT_CNTR_DATE')"
          >
            <p>{{ stringUtil.getDateFormat(individualParams.cntrDt) }}</p>
          </kw-form-item>
          <!-- 지점코드 -->
          <kw-form-item
            :label="$t('MSG_TXT_BRCH_CD')"
          >
            <p>{{ individualParams.ogCd }}</p>
          </kw-form-item>
          <!-- 지점장사번 -->
          <kw-form-item
            :label="$t('MSG_TXT_BRNCH_MNGR_NO')"
          >
            <p>{{ individualParams.brmgrPrtnrNo }}</p>
          </kw-form-item>
          <!-- 지점장 -->
          <kw-form-item
            :label="$t('MSG_TXT_BRMGR')"
          >
            <p>{{ individualParams.brmgrPrtnrNm }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 배정일자 -->
          <kw-form-item
            :label="$t('MSG_TXT_ASN_DT')"
          >
            <p>{{ stringUtil.getDateFormat(individualParams.asnDt) }}</p>
          </kw-form-item>
          <!-- 판매채널 -->
          <kw-form-item
            :label="$t('MSG_TXT_SEL_CHNL')"
          >
            <p>{{ individualParams.sellChnl }}</p>
          </kw-form-item>
          <!-- 판매자사번 -->
          <kw-form-item
            :label="$t('MSG_TXT_SELLER_ID')"
          >
            <p>{{ individualParams.prtnrNo }}</p>
          </kw-form-item>
          <!-- 판매자 -->
          <kw-form-item
            :label="$t('MSG_TXT_SELLER_PERSON')"
          >
            <p>{{ individualParams.prtnrKnm }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 전상대코드 -->
          <kw-form-item
            :label="$t('MSG_TXT_BF_PTY_PD')"
          >
            <p>{{ individualParams.bfCntrNo }}</p>
          </kw-form-item>
          <!-- 후상대코드 -->
          <kw-form-item
            :label="$t('MSG_TXT_AF_PTY_PD')"
          >
            <p>{{ individualParams.afCntrNo }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator />

      <kw-form
        cols="4"
        dense
        class="mb30"
      >
        <kw-form-row>
          <!-- 설치일자 -->
          <kw-form-item
            :label="$t('MSG_TXT_IST_DT')"
          >
            <p>{{ stringUtil.getDateFormat(individualParams.istDt) }} </p>
          </kw-form-item>
          <!-- 교체일자 -->
          <kw-form-item
            :label="$t('MSG_TXT_CHNG_DT')"
          >
            <p>{{ stringUtil.getDateFormat(individualParams.chngDt) }}</p>
          </kw-form-item>
          <!-- 철거일자 -->
          <kw-form-item
            :label="$t('MSG_TXT_DEM_DT')"
          >
            <p>{{ stringUtil.getDateFormat(individualParams.reqdDt) }}</p>
          </kw-form-item>
          <!-- 취소일자 -->
          <kw-form-item
            :label="$t('MSG_TXT_CANC_DT')"
          >
            <p>{{ stringUtil.getDateFormat(individualParams.canDt) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 중지일자 -->
          <kw-form-item
            :label="$t('MSG_TXT_STP_DT')"
          >
            <p>{{ stringUtil.getDateFormat(individualParams.svStpDt) }}</p>
          </kw-form-item>
          <!-- AS만기 -->
          <kw-form-item
            :label="$t('MSG_TXT_AS_EXPR')"
          >
            <p>{{ stringUtil.getDateFormat(individualParams.asExprDt) }}</p>
          </kw-form-item>
          <!-- BS만기 -->
          <kw-form-item
            :label="$t('MSG_TXT_BS_EXPR')"
          >
            <p>{{ stringUtil.getDateFormat(individualParams.bsExprDt) }}</p>
          </kw-form-item>
          <!-- 기변일자 -->
          <kw-form-item
            :label="$t('MSG_TXT_MCHN_DT')"
          >
            <p>{{ stringUtil.getDateFormat(individualParams.cpsDt) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 멤버십시작일 -->
          <kw-form-item
            :label="$t('MSG_TXT_MSH_STRT_DT')"
          >
            <p>{{ stringUtil.getDateFormat(individualParams.mshJDt) }}</p>
          </kw-form-item>
          <!-- 멤버십종료일 -->
          <kw-form-item
            :label="$t('MSG_TXT_MSH_END_DT')"
          >
            <p>{{ stringUtil.getDateFormat(individualParams.mshWdwalDt) }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 바코드 -->
          <kw-form-item
            :label="$t('MSG_TXT_BARCODE')"
          >
            <p>{{ individualParams.bcNo }}</p>
          </kw-form-item>
          <!-- 발행바코드 -->
          <kw-form-item
            :label="$t('MSG_TXT_PBL_BC')"
          >
            <p>{{ individualParams.pblBcNo }}</p>
          </kw-form-item>
          <!-- 맞춤가이드 -->
          <kw-form-item
            :label="$t('MSG_TXT_CSTM_GUID')"
          >
            <p>{{ individualParams.qrsRdmNo }}</p>
          </kw-form-item>
          <!-- 삼성제조번호 -->
          <kw-form-item
            :label="$t('MSG_TXT_SS_MNFT_NO')"
          >
            <p>{{ individualParams.ssPdctBcNo }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 송장번호 -->
          <kw-form-item
            :label="$t('MSG_TXT_IVC_NO')"
          >
            <p>{{ individualParams.ivcNo }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-tabs
        v-model="selectedTab"
      >
        <!-- 가구화 -->
        <kw-tab
          name="1"
          :label="$t('MSG_TXT_BHSHD')"
        />
        <!-- 연체정보 -->
        <kw-tab
          name="2"
          :label="$t('MSG_BTN_DLQ_INF')"
        />
        <!-- <kw-tab
          v-if="isVisibleTab"
          name="2"
          :label="$t('MSG_BTN_DLQ_INF')"
        /> -->
        <!-- 컨택현황 -->
        <kw-tab
          name="3"
          :label="$t('MSG_TXT_CTT_PS')"
        />
        <!-- 연계코드 -->
        <kw-tab
          name="4"
          :label="$t('MSG_TXT_LK_CD')"
        />
      </kw-tabs>
      <kw-tab-panels
        :model-value="selectedTab"
      >
        <kw-tab-panel name="1">
          <kw-form
            cols="2"
            class="mt30"
          >
            <kw-form-row>
              <kw-form-item :label="$t('MSG_TXT_BHSHD_CD')">
                <p class="kw-grow">
                  {{ svHshdNo[0] }}
                </p> <kw-btn
                  :label="$t('MSG_TXT_SDING_HIST')"
                  padding="12px"
                  class="ml8"
                  @click="onClickSearchSeeding"
                />
              </kw-form-item>
              <kw-form-item :label="$t('MSG_TXT_BHSHD_QTY')">
                <p>{{ countInfo.householdTotalCount }}</p>
              </kw-form-item>
            </kw-form-row>
          </kw-form>
          <kw-separator />
          <kw-action-top>
            <template #left>
              <kw-paging-info :total-count="countInfo.householdTotalCount" />
            </template>
          </kw-action-top>
          <kw-grid
            ref="grdIndividualHouseholdRef"
            :visible-rows="5"
            @init="initGridHousehold"
          />
        </kw-tab-panel>
        <kw-tab-panel
          name="2"
        >
          <!-- <kw-tab-panel
        v-if="isVisibleTab"
          name="2"
        > -->
          <kw-action-top class="mt30">
            <template #left>
              <kw-paging-info :total-count="countInfo.delinquentCount" />
            </template>
          </kw-action-top>
          <kw-grid
            ref="grdIndividualDelinquentRef"
            :visible-rows="3"
            @init="initGridDelinquent"
          />
        </kw-tab-panel>
        <kw-tab-panel name="3">
          <kw-action-top class="mt30">
            <template #left>
              <kw-paging-info :total-count="countInfo.contactTotalCount" />
            </template>
          </kw-action-top>
          <kw-grid
            ref="grdIndividualContactRef"
            :visible-rows="5"
            @init="initGridContact"
          />
        </kw-tab-panel>
        <kw-tab-panel name="4">
          <kw-action-top class="mt30">
            <template #left>
              <kw-paging-info :total-count="countInfo.farmTotalCount" />
            </template>
          </kw-action-top>
          <kw-grid
            ref="grdIndividualFarmCodeRef"
            :visible-rows="5"
            @init="initGridFarmCode"
          />
        </kw-tab-panel>
      </kw-tab-panels>
      <!-- 처리내역 -->
      <h3>{{ t('MSG_TXT_PROCS_IZ') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            @change="getIndividualState"
          />
        </template>
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
        ref="grdIndividualStateRef"
        :visible-rows="10"
        :page-size="pageInfo.pageSize - 1"
        :total-count="pageInfo.totalCount"
        @init="initGridState"
      />
      <!-- 상담내역 -->
      <h3>{{ $t('MSG_TXT_CNSL_IZ') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="secondPageInfo.pageIndex"
            v-model:page-size="secondPageInfo.pageSize"
            :total-count="secondPageInfo.totalCount"
            @change="getIndividualCounsel"
          />
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdIndividualCounselRef"
        :page-size="secondPageInfo.pageSize - 1"
        :total-count="secondPageInfo.totalCount"
        :visible-rows="10"
        @init="initGridCounsel"
      />
    </div>
  </kw-page>
</template>
<script setup>
// rev:230621 1st tab 그리드 수정
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, defineGrid, getComponentType, modal, notify, stringUtil, useMeta, gridUtil, popupUtil } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const { t } = useI18n();
const dataService = useDataService();
const { getConfig } = useMeta();
// const router = useRouter();
const { getters } = useStore();
const userInfo = getters['meta/getUserInfo'];
const {
  employeeIDNumber,
  ogTpCd,
  // departmentId,
} = userInfo;

const props = defineProps({
  cntrNo: { type: String, required: true, default: '' },
  cntrSn: { type: String, required: true, default: '' },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdIndividualHouseholdRef = ref(getComponentType('KwGrid')); // 가구화조회
const grdIndividualContactRef = ref(getComponentType('KwGrid')); // 컨택현황 조회
const grdIndividualFarmCodeRef = ref(getComponentType('KwGrid')); // 연계코드 조회
const grdIndividualStateRef = ref(getComponentType('KwGrid')); // 처리내역 조회
const grdIndividualCounselRef = ref(getComponentType('KwGrid')); // 상담내역 조회
const grdIndividualDelinquentRef = ref(getComponentType('KwGrid')); // 연체정보 조회
const individualParams = ref([]);
// const isVisibleTab = computed(() => departmentId === '71301' || departmentId === '70526');
const svHshdNo = ref('');
const selectedTab = ref('1');
// const cntrDtlNo = ref();
const countInfo = ref({
  householdTotalCount: 0,
  contactTotalCount: 0,
  farmTotalCount: 0,
  delinquentCount: 0,
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});
const secondPageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});

/* 조회조건 */
const searchParams = ref({
  cntrNo: props.cntrNo ?? '',
  cntrSn: props.cntrSn ?? '',
  bcNo: '',
  sppIvcNo: '',
  cntrDtlNo: '',
});
const saveParams = ref({
  cntrNo: props.cntrNo ?? '',
  cntrSn: props.cntrSn ?? '',
  ogTpCd: '',
  wkPrtnrNo: '',
  cstUnuitmCn: '',
});
const isDisableButton = computed(() => isEmpty(searchParams.value.cntrNo) || isEmpty(searchParams.value.cntrSn));

// function isDisable() {
//   // if (departmentId === '70526' || departmentId === '70254' || departmentId === '71301') {
//   //   return false;
//   // }
//   // return true;
//   return false;
// }

/* 개인별 서비스현황 조회 */
async function getIndividualServicePs() {
  const res = await dataService.get('sms/wells/service/individual-service-ps', { params: searchParams.value });
  individualParams.value = res.data;

  // init tab & cstUnuitmCn params
  selectedTab.value = '1';
  saveParams.value.cstUnuitmCn = '';
}

async function onClickVisitPeriodSearch() {
  await modal({
    component: 'WwsnbIndividualVisitPeriodInqrListP',
    componentProps: {
      cntrNo: searchParams.value.cntrNo,
      cntrSn: searchParams.value.cntrSn,
      pdNm: individualParams.value.pdNm,
      vstPrdNm: individualParams.value.vstPrdNm,
      prdNm: individualParams.value.prdNm,
    },
  });
}
async function onClickVisitPeriodCreate() {
  await modal({
    component: 'WwsnbIndividualVisitPeriodMgtP',
    componentProps: {
      cntrNo: searchParams.value.cntrNo,
      cntrSn: searchParams.value.cntrSn,
    },
  });
}
async function onClickSearchSeeding() {
  await modal({
    component: 'WwsncSeedingDeliveryListP',
    componentProps: {
      cntrNo: searchParams.value.cntrNo,
      cntrSn: searchParams.value.cntrSn,
    },
  });
}

/* 가구화 조회 */
async function getHousehold() {
  const res = await dataService.get('sms/wells/service/individual-service-ps/household', { params: searchParams.value });
  const individualHousehold = res.data;
  svHshdNo.value = res.data.map((v) => (v.svHshdNo));

  const individualHouseholdView = grdIndividualHouseholdRef.value.getView();
  countInfo.value.householdTotalCount = individualHousehold.length;
  individualHouseholdView.getDataSource().setRows(individualHousehold);
}
/* 컨택현황 조회 */
async function getIndividualContact() {
  const res = await dataService.get('sms/wells/service/individual-service-ps/contract', { params: searchParams.value });
  const individualContact = res.data;

  const individualContactView = grdIndividualContactRef.value.getView();
  countInfo.value.contactTotalCount = individualContact.length;
  individualContactView.getDataSource().setRows(individualContact);
}
/* 연계코드 조회 */
async function getIndividualFarmCode() {
  const res = await dataService.get('sms/wells/service/individual-service-ps/farm-code', { params: searchParams.value });
  const individualFarmcode = res.data;

  const individualFarmCodeView = grdIndividualFarmCodeRef.value.getView();
  countInfo.value.farmTotalCount = individualFarmcode.length;
  individualFarmCodeView.getDataSource().setRows(individualFarmcode);
}
/* 연체정보 조회 */
async function getIndividualDelinquent() {
  const res = await dataService.get('sms/wells/service/individual-service-ps/delinquent', { params: searchParams.value });
  const individualDelinquentData = res.data?.[0];
  const individualDelinquent = ref([
    { gubun: t('MSG_TXT_LSTMM'), suminamt: individualDelinquentData.psuminamt, dlyamt: individualDelinquentData.pdlyamt },
    { gubun: t('MSG_TXT_THM'), suminamt: individualDelinquentData.csuminamt, dlyamt: individualDelinquentData.cdlyamt },
    { gubun: t('MSG_TXT_TOT_SUM'), suminamt: individualDelinquentData.tsuminamt, dlyamt: individualDelinquentData.tdlyamt },
  ]);

  const individualDelinquentView = grdIndividualDelinquentRef.value.getView();
  countInfo.value.delinquentCount = individualDelinquent.length;
  individualDelinquentView.getDataSource().setRows(individualDelinquent.value);
}
/* 처리내역 조회 */
async function getIndividualState() {
  const res = await dataService.get('sms/wells/service/individual-service-ps/process-state', { params: { ...searchParams.value, ...pageInfo.value } });
  const { list: individualState, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  pageInfo.value.totalCount = individualState.length;
  const individualStateView = grdIndividualStateRef.value.getView();
  const individualStateData = individualStateView.getDataSource();
  individualStateData.checkRowStates(false);
  individualStateData.addRows(individualState);
  individualStateData.checkRowStates(true);
}
/* 상담내역 조회 */
async function getIndividualCounsel() {
  const res = await dataService.get('sms/wells/service/individual-service-ps/counsel', { params: { ...searchParams.value, ...secondPageInfo.value } });
  const { list: individualCounsel, pageInfo: pagingResult } = res.data;

  secondPageInfo.value = pagingResult;
  const individualCounselView = grdIndividualCounselRef.value.getView();
  const individualCounselData = individualCounselView.getDataSource();
  individualCounselData.checkRowStates(false);
  individualCounselData.addRows(individualCounsel);
  individualCounselData.checkRowStates(true);
}

async function fetchData() {
  await getHousehold();
  await getIndividualContact();
  await getIndividualFarmCode();
  await getIndividualDelinquent();
  await getIndividualState();
  await getIndividualCounsel();
}

async function onClickSearch() {
  if (isEmpty(searchParams.value.cntrNo) && isEmpty(searchParams.value.bcNo)) { notify(t('MSG_ALT_SRCH_CNDT_NEED_ONE_AMONG', [`${t('MSG_TXT_CNTR_DTL_NO')}, ${t('MSG_TXT_BARCODE')}`])); return; }
  if (searchParams.value.cntrNo) {
    if (searchParams.value.cntrNo.length < 12 || searchParams.value.cntrSn.length < 0) { return; }
  }

  await getIndividualServicePs();

  if (isEmpty(individualParams.value)) {
    notify(t('MSG_ALT_CST_INF_NOT_EXST'));
    // init tabs & grids
    await fetchData();
    grdIndividualStateRef.value.getData().clearRows();
    grdIndividualCounselRef.value.getData().clearRows();
  } else {
    searchParams.value.cntrNo = individualParams.value.cntrNoDtl.substring(0, 12);
    searchParams.value.cntrSn = individualParams.value.cntrNoDtl.substring(13, 14);

    grdIndividualStateRef.value.getData().clearRows();
    pageInfo.value.pageIndex = 1;
    grdIndividualCounselRef.value.getData().clearRows();
    secondPageInfo.value.pageIndex = 1;

    await fetchData();
  }
}

const { currentRoute } = useRouter();
async function onClickExcelDownload() {
  const view = grdIndividualStateRef.value.getView();
  const res = dataService.get('sms/wells/service/individual-service-ps/process-state/excel-download', { params: { cntrNo: searchParams.value.cntrNo, cntrSn: searchParams.value.cntrSn } });

  await gridUtil.exportView(view, {
    filtName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSave() {
  saveParams.value.cntrNo = individualParams.value.cntrNoDtl.substring(0, 12);
  saveParams.value.cntrSn = individualParams.value.cntrNoDtl.substring(13, 14);
  saveParams.value.ogTpCd = ogTpCd;
  saveParams.value.wkPrtnrNo = employeeIDNumber;
  saveParams.value.cstUnuitmCn = individualParams.value.cstUnuitmCn;
  if (isEmpty(saveParams.value.cstUnuitmCn)) { return; }
  await dataService.post('sms/wells/service/individual-service-ps', saveParams.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

async function onClickCstSearch() {
  const { payload } = await modal({ component: 'WwsnyCustomerBaseInformationP' });

  if (payload) {
    searchParams.value.bcNo = '';
    searchParams.value.sppIvcNo = '';

    searchParams.value.cntrNo = payload.cntrNo ?? '';
    searchParams.value.cntrSn = payload.cntrSn ?? '';
    await onClickSearch();
  }
}

watch(props, async (val) => {
  if (val) {
    searchParams.value.bcNo = '';
    searchParams.value.sppIvcNo = '';

    searchParams.value.cntrNo = props.cntrNo;
    searchParams.value.cntrSn = props.cntrSn;
    await onClickSearch();
  }
});

onMounted(async () => {
  if (props.cntrNo && props.cntrSn) {
    await onClickSearch();
  }
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

/* 가구화 조회 */
const initGridHousehold = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'svHshdNo' }, // 가구화코드
    { fieldName: 'cntrDtl' }, // 계약번호
    { fieldName: 'cstNm' }, // 고객명
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'locaraTno' }, // 전화번호1
    { fieldName: 'exnoEncr' }, // 전화번호2
    { fieldName: 'idvTno' }, // 전화번호3
    { fieldName: 'telNo' },
    { fieldName: 'cralLocaraTno' }, // 휴대전화번호1
    { fieldName: 'mexnoEncr' }, // 휴대전화번호2
    { fieldName: 'cralIdvTno' }, // 휴대전화번호3
    { fieldName: 'idvTelNo' },
  ];

  const columns = [
    { fieldName: 'cntrDtl', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'cstNm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '300', styleName: 'text-center' },
    { fieldName: 'telNo',
      header: t('MSG_TXT_TEL_NO'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { locaraTno, exnoEncr, idvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(locaraTno || exnoEncr || idvTno) ? `${locaraTno}-${exnoEncr}-${idvTno}` : '';
      },
    },
    { fieldName: 'idvTelNo',
      header: t('MSG_TXT_MPNO'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cralLocaraTno, mexnoEncr, cralIdvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(cralLocaraTno || mexnoEncr || cralIdvTno) ? `${cralLocaraTno}-${mexnoEncr}-${cralIdvTno}` : '';
      },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

/* 처리내역조회 */
const initGridState = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'svTp' },
    { fieldName: 'rcpDt' },
    { fieldName: 'svBizDclsf' },
    { fieldName: 'reqDt' },
    { fieldName: 'vstFshDt' },
    { fieldName: 'wkPrgsStat' },
    { fieldName: 'asCaus' },
    { fieldName: 'rtngdProcsTp' },
    { fieldName: 'fstVstFshDt' },
    { fieldName: 'zipNo' },
    { fieldName: 'ogTp' },
    { fieldName: 'ogNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrNm' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'prtnrTno' },
    { fieldName: 'bldNm' },
    { fieldName: 'bcNo' },
    { fieldName: 'imgYn' },
    { fieldName: 'istEnvrFileUid' },
    { fieldName: 'istKitFileUid' },
    { fieldName: 'istCelngFileUid' },
    { fieldName: 'cstSvAsnNo' },
  ];

  const columns = [
    { fieldName: 'svTp', header: t('MSG_TXT_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'rcpDt', header: t('MSG_TXT_RCP_ANS_DT'), width: '150', datetimeFormat: 'datetime' },
    { fieldName: 'svBizDclsf', header: t('MSG_TXT_RCP_ANS_IZ'), width: '150', styleName: 'text-center' },
    { fieldName: 'reqDt', header: t('MSG_TXT_AK_PROM_DT'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'vstFshDt', header: t('MSG_TXT_PRCSDT'), width: '200', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'wkPrgsStat',
      header: t('MSG_TXT_PROCS_RS'),
      width: '100',
      styleName: 'text-center',
      styleCallback(grd, dataCell) {
        const wkPrgsStat = grd.getValue(dataCell.item.dataRow, 'wkPrgsStat');
        return (wkPrgsStat === '작업대기') ? { styleName: 'rg-button-link', renderer: { type: 'button' } } : { renderer: { type: 'text' } };
      },
    },
    { fieldName: 'asCaus', header: t('MSG_TXT_PROCS_IZ'), width: '100' },
    { fieldName: 'zipNo', header: t('MSG_TXT_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'ogTp', header: t('MSG_TXT_DIV'), width: '94', styleName: 'text-center' },
    { fieldName: 'ogNm', header: t('MSG_TXT_BLG'), width: '94', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '94', styleName: 'text-center' },
    { fieldName: 'prtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '94', styleName: 'text-center' },
    { fieldName: 'prtnrTno',
      header: t('MSG_TXT_TEL_NO'),
      width: '94',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cralLocaraTno, mexnoEncr, cralIdvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(cralLocaraTno || mexnoEncr || cralIdvTno) ? `${cralLocaraTno}-${mexnoEncr}-${cralIdvTno}` : '';
      },
    },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLG_BLD'), width: '94', styleName: 'text-center' },
    { fieldName: 'bcNo', header: t('MSG_TXT_IN_WK_BC'), width: '94', styleName: 'text-center' },
    { fieldName: 'imgYn',
      header: t('MSG_TXT_PHO'),
      width: '98',
      styleName: 'text-center',
      displayCallback(grd, idx, val) {
        const imgYn = val === 'Y' ? t('MSG_TXT_IMG_BRWS') : '';
        return `${imgYn}`;
      },
      styleCallback(grd, dataCell) {
        const imgYn = grd.getValue(dataCell.item.dataRow, 'imgYn');
        return (imgYn === 'Y') ? { renderer: { type: 'button' } } : { renderer: { type: 'text' } };
      },
    },
    { fieldName: 'rtngdProcsTp', header: t('MSG_TXT_RTNGD_PCS_INF'), width: '150' },
    { fieldName: 'fstVstFshDt', header: t('MSG_TXT_DSU_DT'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column

  view.onCellDblClicked = async (g, cData) => {
    if (cData.fieldName === 'wkPrgsStat' || cData.fieldName === 'imgYn') { return false; }

    notify(' 서비스처리상세 내역 팝업(W-SV-U-0165P01) 호출');
    //   await modal({
    //     component: '',
    //     componentProps: {
    //       cntrNo: searchParams.value.cntrNo,
    //       cntrSn: searchParams.value.cntrSn,
    //     },
    //   });
  };

  view.onCellItemClicked = async (g, cData) => {
    /* 작업상세 */
    if (cData.fieldName === 'wkPrgsStat') {
      const { cstSvAsnNo, wkPrgsStat } = g.getValues(cData.itemIndex);
      console.log(cstSvAsnNo);
      if (wkPrgsStat === '작업대기') {
        // sample
        // const redirectUrl = encodeURIComponent('/popup/mobile/wmsnb-as-work-list');
        // window.open(`https://m-wpm.kyowon.co.kr/certification/sso/login?redirectUrl=${redirectUrl}`);

        // const url = '/mobile/wmsnb-as-work-list/wmsnb-as-work-detail-mgt';
        const redirectUrl = encodeURIComponent('/popup/mobile/wmsnb-as-work-list/wmsnb-as-work-detail-mgt');
        const queryString = new URLSearchParams(cstSvAsnNo);
        // window.open(`https://m-wpm.kyowon.co.kr/certification/sso/login?redirectUrl=${redirectUrl}&${queryString}`);
        popupUtil.open(`https://m-wpm.kyowon.co.kr/certification/sso/login?redirectUrl=${redirectUrl}&${queryString}`);
      }
    }

    /* 설치환경상세 */
    if (cData.fieldName === 'imgYn') {
      notify(' 설치환경상세 팝업(W-SV-U-0214P01) 호출');
      const { istEnvrFileUid, istKitFileUid, istCelngFileUid } = g.getValues(cData.itemIndex);
      console.log(istEnvrFileUid);
      console.log(istKitFileUid);
      console.log(istCelngFileUid);
      // await modal({
      //   component: 'WwsnbInstallEnvironmentDtlP',
      //   componentProps: {
      //     istEnvrFileUid,
      //     istKitFileUid,
      //     istCelngFileUid,
      //   },
      // });
    }
  };

  // multi row header setting
  view.setColumnLayout([
    'svTp', // single
    {
      header: t('MSG_TXT_RCP_ANS_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['rcpDt', 'svBizDclsf'],
    },
    'reqDt', 'vstFshDt', 'wkPrgsStat', 'asCaus', 'zipNo',
    {
      header: t('MSG_TXT_PIC_INF'),
      direction: 'horizontal',
      items: ['ogTp', 'ogNm', 'prtnrNo', 'prtnrNm', 'prtnrTno', 'bldNm'],
    },
    'bcNo',
    'imgYn',
    'rtngdProcsTp',
    'fstVstFshDt',
  ]);

  view.onScrollToBottom = async (g) => {
    if (pageInfo.value.pageIndex * pageInfo.value.pageSize <= g.getItemCount()) {
      pageInfo.value.pageIndex += 1;
      await getIndividualState();
    }
  };
});

/* 상담내역 조회 */
const initGridCounsel = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cselSts' },
    { fieldName: 'cnslStDt' },
    { fieldName: 'cnslEdDt' },
    { fieldName: 'cnslTpHcsfCd' },
    { fieldName: 'cnslTpMcsfCd' },
    { fieldName: 'cnslTpLcsfCd' },
    { fieldName: 'pcpNm' },
    { fieldName: 'cselRstCd' },
    { fieldName: 'custResp' },
    { fieldName: 'clntDvNm' },
    { fieldName: 'cnslCn' },
  ];

  const columns = [
    { fieldName: 'cselSts', header: t('MSG_TXT_PROCS_STAT'), width: '100', styleName: 'text-center' },
    { fieldName: 'cnslStDt', header: t('MSG_TXT_RCPDT'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cnslEdDt', header: t('MSG_TXT_PRCSDT'), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cnslTpHcsfCd', header: t('MSG_TXT_CNSL_HCLSF'), width: '200', styleName: 'text-center' },
    { fieldName: 'cnslTpMcsfCd', header: t('MSG_TXT_CNSL_DCLSF'), width: '150', styleName: 'text-center' },
    { fieldName: 'cnslTpLcsfCd', header: t('MSG_TXT_CNSL_LCLSF'), width: '250', styleName: 'text-center' },
    { fieldName: 'pcpNm', header: t('MSG_TXT_PCP'), width: '100', styleName: 'text-center' },
    { fieldName: 'cselRstCd', header: t('MSG_TXT_PROCS_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'custResp', header: t('MSG_TXT_CST_RACT'), width: '100', styleName: 'text-center' },
    { fieldName: 'clntDvNm', header: t('MSG_TXT_CLNT'), width: '100', styleName: 'text-center' },
    { fieldName: 'cnslCn', header: t('MSG_TXT_CNSL_CN'), width: '200', styleName: 'text-center' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onScrollToBottom = async (g) => {
    if (secondPageInfo.value.pageIndex * secondPageInfo.value.pageSize <= g.getItemCount()) {
      secondPageInfo.value.pageIndex += 1;
      await getIndividualCounsel();
    }
  };
});

// tab2
/* 연체정보 조회 */
function initGridDelinquent(data, view) {
  const fields = [
    { fieldName: 'gubun' },
    { fieldName: 'suminamt' },
    { fieldName: 'dlyamt' },
  ];

  const columns = [
    { fieldName: 'gubun', header: t('MSG_TXT_DIV'), width: '100', styleName: 'text-center' },
    { fieldName: 'suminamt', header: t('MSG_TXT_WON_DP_AMT'), width: '150', styleName: 'text-right' },
    { fieldName: 'dlyamt',
      header: {
        text: t('MSG_TXT_ANYTHING_AMT_WON', [t('MSG_TXT_DLQ')]), // 연체금액(원)
      },
      width: '150',
      styleName: 'text-right',
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}

// tab 3
/* 컨택현황조회 */
const initGridContact = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntcDt' },
    { fieldName: 'absncRsonKind' },
    { fieldName: 'absncRson' },
    { fieldName: 'ogTpCd' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrNm' },
    { fieldName: 'cntcCn' },
  ];

  const columns = [
    { fieldName: 'cntcDt', header: t('MSG_TXT_RGST_DTM'), width: '150', styleName: 'text-center', datetimeFormat: 'datetime' },
    { fieldName: 'absncRsonKind', header: t('MSG_TXT_CTT_GRP'), width: '100', styleName: 'text-center' },
    { fieldName: 'absncRson', header: t('MSG_TXT_CTT_DV'), width: '100', styleName: 'text-left' },
    { fieldName: 'ogTpCd', header: t('MSG_TXT_BLG'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrNm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntcCn', header: t('MSG_TXT_CTT_DTL'), width: '300', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

// tab 4
/* 연계코드조회 */
const initGridFarmCode = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'gubun' },
    { fieldName: 'cntrDtl' },
    { fieldName: 'cstNm' },
    { fieldName: 'pdNm' },
    { fieldName: 'sdingCntrDtl' },
    { fieldName: 'adrZip' },
    { fieldName: 'locaraTno' },
    { fieldName: 'exnoEncr' },
    { fieldName: 'idvTno' },
    { fieldName: 'tellNo' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'idvTellNo' },
  ];

  const columns = [
    { fieldName: 'gubun', header: t('MSG_TXT_DIV'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrDtl', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'cstNm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '300', styleName: 'text-center' },
    { fieldName: 'sdingCntrDtl', header: t('MSG_TXT_PTY_CST'), width: '100', styleName: 'text-center' },
    { fieldName: 'adrZip', header: t('MSG_TXT_ZIP'), width: '100', styleName: 'text-center' },
    { fieldName: 'tellNo',
      header: t('MSG_TXT_TEL_NO'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { locaraTno, exnoEncr, idvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(locaraTno || exnoEncr || idvTno) ? `${locaraTno}-${exnoEncr}-${idvTno}` : '';
      },
    },
    { fieldName: 'idvTellNo',
      header: t('MSG_TXT_MPNO'),
      width: '150',
      styleName: 'text-left',
      displayCallback(grid, index) {
        const { cralLocaraTno, mexnoEncr, cralIdvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(cralLocaraTno || mexnoEncr || cralIdvTno) ? `${cralLocaraTno}-${mexnoEncr}-${cralIdvTno}` : '';
      },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
// //rev:230621 tab 2,3,4 내 그리드 추가
</script>
