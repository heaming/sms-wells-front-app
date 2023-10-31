<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwContractManagementListM - 계약관리
3. 작성자 : gs.piit193
4. 작성일 : 2023.02.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 기존 화면명 'KSS주문현황'으로 상태별로 계약서를 확인하고 승인, 계약서 발송 등의 행위를 하는 페이지
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <!-- 계약구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_DV')"
        >
          <kw-select
            v-model="searchParams.cntrDv"
            class="w185"
            :options="[{ codeId: 'A', codeName: t('MSG_TXT_NW_CH') },
                       { codeId: 'N', codeName: t('MSG_TXT_NEW') },
                       { codeId: 'U', codeName: t('MSG_TXT_CNTR_CH') },
                       { codeId: 'R', codeName: t('MSG_TXT_RSTL') },
                       { codeId: 'S', codeName: t('MSG_TXT_EMP_PRCH') }]"
            @change="onChangeCntrDv"
          />
        </kw-search-item>
        <!-- 작성일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_WRTE_DT')"
        >
          <kw-date-range-picker
            v-model:from="searchParams.cntrRcpStrtdt"
            v-model:to="searchParams.cntrRcpEnddt"
            class="w270"
            :label="$t('MSG_TXT_WRTE_DT')"
          />
        </kw-search-item>
        <kw-separator
          size="5"
          spaced
        />
        <kw-separator
          size="5"
          spaced
        />
        <slot v-if="searchParams.cntrDv === 'A' || searchParams.cntrDv === 'N' || searchParams.cntrDv === 'U'">
          <!-- 계약서 구분(계약서유형코드) -->
          <kw-search-item
            :label="$t('MSG_TXT_CNTRW_DV')"
          >
            <kw-select
              v-model="searchParams.cntrwTpCd"
              class="w155"
              :options="codes.CNTRW_TP_CD.filter((v)=> v.codeId !== '9')"
              first-option="all"
              first-option-value=""
              @change="onChangeCntrwTpCd"
            />
            <kw-select
              v-model="searchParams.alncmpCd"
              class="w155"
              :options="[{ codeId: '17', codeName: 'Wells399' },
                         { codeId: '54', codeName: '포인트플러스399' },
                         { codeId: '55', codeName: '포인트플러스599' },
                         { codeId: '70', codeName: '플래너상조제휴' }]"
              :model-value="searchParams.alncmpCd ? searchParams.alncmpCd : []"
              :multiple="true"
            />
          </kw-search-item>
        </slot>
      </kw-search-row>
      <slot v-if="searchParams.cntrDv === 'A' || searchParams.cntrDv === 'N' || searchParams.cntrDv === 'U'">
        <kw-search-row>
          <!-- 지역단 -->
          <kw-search-item
            :label="$t('MSG_TXT_RGNL_GRP')"
          >
            <kw-select
              v-model="selectedDgr2LevlOgCds"
              class="select_og_cd"
              :placeholder="$t('MSG_TXT_RGNL_GRP') + ' ' + $t('MSG_TXT_SELT')"
              :options="filteredDgr2LevlOgCds"
              option-value="dgr2LevlOgCd"
              option-label="dgr2LevlOgNm"
              multiple
              @update:model-value="onUpdateDgr2Levl"
            />
          </kw-search-item>
          <!-- 지점 -->
          <kw-search-item
            :label="$t('MSG_TXT_BRANCH')"
          >
            <kw-select
              v-model="selectedDgr3LevlOgCds"
              class="select_og_cd"
              :placeholder="$t('MSG_TXT_BRANCH') + ' ' + $t('MSG_TXT_SELT')"
              :options="filteredDgr3LevlOgCds"
              option-value="dgr3LevlOgCd"
              option-label="dgr3LevlOgNm"
              multiple
            />
          </kw-search-item>
          <!-- 계약상태 -->
          <kw-search-item
            :label="$t('MSG_TXT_CNTR_STAT')"
            :colspan="2"
          >
            <kw-option-group
              v-model="searchParams.cntrPrgsStatCd"
              :options="codes.CNTR_PRGS_STAT_CD.filter((v)=> v.codeId >= '20')"
              class="kw-option-group--multi-line"
              :model-value="searchParams.cntrPrgsStatCd ? searchParams.cntrPrgsStatCd : []"
              type="checkbox"
            />
          </kw-search-item>
        </kw-search-row>
        <kw-search-row>
          <!-- 계약상세번호 -->
          <kw-search-item
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
          >
            <zctz-contract-detail-number
              v-model:cntr-no="searchParams.cntrNo"
              v-model:cntr-sn="searchParams.cntrSn"
              class="w185"
              icon="search"
              :label="$t('MSG_TXT_CNTR_DTL_NO')"
            />
          </kw-search-item>
          <!-- 고객명 -->
          <kw-search-item
            :label="$t('MSG_TXT_CST_NM')"
          >
            <kw-input
              v-model="searchParams.cstKnm"
              class="w185"
              clearable
              :maxlength="100"
            />
          </kw-search-item>
          <!-- 고객번호 -->
          <kw-search-item
            :label="$t('MSG_TXT_CST_NO')"
          >
            <kw-input
              v-model="searchParams.cntrCstNo"
              class="w185"
              :label="$t('MSG_TXT_CST_NO')"
              icon="search"
              clearable
              :on-click-icon="onClickSearchCntrCst"
              rules="max:10|numeric"
              :maxlength="10"
            />
          </kw-search-item>
        </kw-search-row>
      </slot>
      <slot v-if="searchParams.cntrDv === 'R' || searchParams.cntrDv === 'S'">
        <kw-search-row>
          <!-- 계약상세번호 -->
          <kw-search-item
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
          >
            <zctz-contract-detail-number
              v-model:cntr-no="searchParams.cntrNo"
              v-model:cntr-sn="searchParams.cntrSn"
              class="w185"
              icon="search"
              :label="$t('MSG_TXT_CNTR_DTL_NO')"
            />
          </kw-search-item>
          <!-- 계약상태 -->
          <kw-search-item
            :label="$t('MSG_TXT_CNTR_STAT')"
            :colspan="2"
          >
            <slot v-if="searchParams.cntrDv === 'R'">
              <kw-option-group
                v-model="searchParams.sellChnlSnrDv"
                :options="[{ codeId: 'S', codeName: t('MSG_TXT_SLS') },
                           { codeId: 'T', codeName: t('MSG_TXT_SL_TM') },
                           { codeId: 'O', codeName: t('MSG_TXT_OB_OTEAM') },
                           { codeId: 'E', codeName: t('MSG_TXT_ETC') }]"
                class="kw-option-group--multi-line"
                type="radio"
                first-option="all"
                first-option-value=""
              />
            </slot>
            <slot v-if="searchParams.cntrDv === 'S'">
              <kw-option-group
                v-model="searchParams.sellChnlSnrDv"
                :options="[{ codeId: 'O', codeName: t('MSG_TXT_OB_OTEAM') },
                           { codeId: 'E', codeName: t('MSG_TXT_ETC') }]"
                class="kw-option-group--multi-line"
                type="radio"
                first-option="all"
                first-option-value=""
              />
            </slot>
          </kw-search-item>
        </kw-search-row>
      </slot>
    </kw-search>
    <div class="result-area">
      <!-- 조회결과 -->
      <h3>{{ $t('MSG_TXT_SRCH_RSLT') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="pageInfo.totalMstCount" />
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          dense
          icon="download_on"
          secondary
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="!pageInfo.totalMstCount"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 계약서 메일발송 -->
        <kw-btn
          grid-action
          :label="$t('MSG_BTN_CNTRW_EMAIL_SEND')"
          @click="onClickCntrwMlFw"
        />
        <!-- 알림톡 발송 -->
        <kw-btn
          grid-action
          :label="$t('MSG_BTN_BIZTALK_SEND')"
          @click="onClickNotakfW"
        />
      </kw-action-top>
      <!-- 조회결과-전체(Default) -->
      <kw-grid
        v-show="isGrdMstListVisible"
        ref="grdMstList"
        name="grdMstList"
        :visible-rows="8"
        @init="initGrdMstList"
      />
      <!-- 조회결과-재약정 -->
      <kw-grid
        v-show="isGrdMstRstlListVisible"
        ref="grdMstRstlList"
        name="grdMstRstlList"
        :visible-rows="8"
        @init="initGrdMstRstlList"
      />
      <!-- 조회결과-직원구매 -->
      <kw-grid
        v-show="isGrdMstEmpPrchListVisible"
        ref="grdMstEmpPrchList"
        name="grdMstEmpPrchList"
        :visible-rows="8"
        @init="initGrdMstEmpPrchList"
      />
      <slot v-if="isDtlListVisible === true">
        <!-- 상세내역 -->
        <h3>
          {{ $t('MSG_TXT_DTL_IZ') + ' - ' + searchDtlParams.cntrNo }}
        </h3>
        <kw-action-top>
          <template #left>
            <kw-paging-info :total-count="pageInfo.totalDtlCount" />
          </template>
          <span class="kw-fc--black3 text-weight-regular">(단위 : 원)</span>
        </kw-action-top>
        <!-- 상세내역-일시불(환경가전) -->
        <kw-grid
          v-show="isGrdDtlSpayEnvrElhmListVisible"
          ref="grdDtlSpayEnvrElhmList"
          name="grdDtlSpayEnvrElhmList"
          :visible-rows="pageInfo.totalDtlCount === 0 ? 1 : pageInfo.totalDtlCount"
          @init="initGrdDtlSpayEnvrElhmList"
        />
        <!-- 상세내역-일시불(BH) -->
        <kw-grid
          v-show="isGrdDtlSpayBhListVisible"
          ref="grdDtlSpayBhList"
          name="grdDtlSpayBhList"
          :visible-rows="pageInfo.totalDtlCount === 0 ? 1 : pageInfo.totalDtlCount"
          @init="initGrdDtlSpayBhList"
        />
        <!-- 상세내역-렌탈 -->
        <kw-grid
          v-show="isGrdDtlRntlListVisible"
          ref="grdDtlRntlList"
          name="grdDtlRntlList"
          :visible-rows="pageInfo.totalDtlCount === 0 ? 1 : pageInfo.totalDtlCount"
          @init="initGrdDtlRntlList"
        />
        <!-- 상세내역-멤버십 -->
        <kw-grid
          v-show="isGrdDtlMshListVisible"
          ref="grdDtlMshList"
          name="grdDtlMshList"
          :visible-rows="pageInfo.totalDtlCount === 0 ? 1 : pageInfo.totalDtlCount"
          @init="initGrdDtlMshList"
        />
        <!-- 상세내역-홈케어서비스 -->
        <kw-grid
          v-show="isGrdDtlHcrSvcListVisible"
          ref="grdDtlHcrSvcList"
          name="grdDtlHcrSvcList"
          :visible-rows="pageInfo.totalDtlCount === 0 ? 1 : pageInfo.totalDtlCount"
          @init="initGrdDtlHcrSvcList"
        />
        <!-- 상세내역-모종일시불 -->
        <kw-grid
          v-show="isGrdDtlSdingSpayListVisible"
          ref="grdDtlSdingSpayList"
          name="grdDtlSdingSpayList"
          :visible-rows="pageInfo.totalDtlCount === 0 ? 1 : pageInfo.totalDtlCount"
          @init="initGrdDtlSdingSpayList"
        />
        <!-- 상세내역-정기배송 -->
        <kw-grid
          v-show="isGrdDtlRglrSppListVisible"
          ref="grdDtlRglrSppList"
          name="grdDtlRglrSppList"
          :visible-rows="pageInfo.totalDtlCount === 0 ? 1 : pageInfo.totalDtlCount"
          @init="initGrdDtlRglrSppList"
        />
        <!-- 상세내역-장기할부 -->
        <kw-grid
          v-show="isGrdDtlLtmIstmListVisible"
          ref="grdDtlLtmIstmList"
          name="grdDtlLtmIstmList"
          :visible-rows="pageInfo.totalDtlCount === 0 ? 1 : pageInfo.totalDtlCount"
          @init="initGrdDtlLtmIstmList"
        />
      </slot>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, useDataService, gridUtil, fileUtil, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import { openReportPopup } from '~common/utils/cmPopupUtil';

const dataService = useDataService();
const { t } = useI18n();
const { getters } = useStore();
const { alert, confirm, modal, notify } = useGlobal();
const { currentRoute } = useRouter();
const { hasRoleNickName } = useMeta();
const userInfo = getters['meta/getUserInfo'];
// console.log(userInfo);

let cachedParams;
let isCntrPrgsStatCnfm = true;

const searchParams = ref({
  cntrDv: 'A', // 계약구분
  cntrRcpStrtdt: '', // 작성일자-시작일자
  cntrRcpEnddt: '', // 작성일자-종료일자
  cntrwTpCd: '', // 계약서구분(계약서유형코드)
  alncmpCd: [], // 계약서구분2-상조관련
  dgr2LevlOgId: [], // 조직코드-지역단
  dgr3LevlOgId: [], // 조직코드-지점
  cntrPrgsStatCd: ['20', '30', '40', '50', '60'], // 계약진행상태
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  cstKnm: '', // 고객명
  cntrCstNo: '', // 고객번호
  sellChnlSnrDv: '', // 판매채널
});

const searchDtlParams = ref({
  cntrNo: '', // 계약번호
  // cntrSn: '', // 계약일련번호
  cntrwTpCd: '', // 계약서유형코드
  cntrPrgsStatCd: '', // 계약진행상태
});

const searchCnfmAprvParams = ref({
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  cnfmMsgYn: '', // 확정승인 메시지
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS', // 페이지 사이즈 옵션
  'CNTRW_TP_CD', // 계약서유형코드
  'CNTR_PRGS_STAT_CD', // 계약진행상태코드
);

const pageInfo = ref({
  totalMstCount: 0,
  totalDtlCount: 0,
  pageIndex: 1,
  // 환경변수에서 기본설정값 받아오는 코드 현재 CFG_CMZ_DEFAULT_PAGE_SIZE 기본값:10
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needtotalCount: true,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMstList = ref(getComponentType('KwGrid')); // 조회결과-전체(Default)
const grdMstRstlList = ref(getComponentType('KwGrid')); // 조회결과-재약정
const grdMstEmpPrchList = ref(getComponentType('KwGrid')); // 조회결과-직원구매

const grdDtlSpayEnvrElhmList = ref(getComponentType('KwGrid')); // 상세내역-일시불(환경가전)
const grdDtlSpayBhList = ref(getComponentType('KwGrid')); // 상세내역-일시불(BH)
const grdDtlRntlList = ref(getComponentType('KwGrid')); // 상세내역-렌탈
const grdDtlMshList = ref(getComponentType('KwGrid')); // 상세내역-멤버십
const grdDtlHcrSvcList = ref(getComponentType('KwGrid')); // 상세내역-홈케어서비스
const grdDtlSdingSpayList = ref(getComponentType('KwGrid')); // 상세내역-모종일시불
const grdDtlRglrSppList = ref(getComponentType('KwGrid')); // 상세내역-정기배송
const grdDtlLtmIstmList = ref(getComponentType('KwGrid')); // 상세내역-장기할부

const isGrdMstListVisible = ref(true); // 조회결과-전체(Default)
const isGrdMstRstlListVisible = ref(false); // 조회결과-재약정
const isGrdMstEmpPrchListVisible = ref(false); // 조회결과-직원구매

const isDtlListVisible = ref(true); // 상세내역리스트
const isGrdDtlSpayEnvrElhmListVisible = ref(true); // 상세내역-일시불(환경가전)
const isGrdDtlSpayBhListVisible = ref(false); // 상세내역-일시불(BH)
const isGrdDtlRntlListVisible = ref(false); // 상세내역-렌탈
const isGrdDtlMshListVisible = ref(false); // 상세내역-멤버십
const isGrdDtlHcrSvcListVisible = ref(false); // 상세내역-홈케어서비스
const isGrdDtlSdingSpayListVisible = ref(false); // 상세내역-모종일시불
const isGrdDtlRglrSppListVisible = ref(false); // 상세내역-정기배송
const isGrdDtlLtmIstmListVisible = ref(false); // 상세내역-장기할부

// 확정버튼 권한체크
const isHeadOfficeRole = (hasRoleNickName('ROL_W1010') || hasRoleNickName('ROL_W1020')); // 본사스텝(W1010), 업무담당(W1020)
// console.log(`isHeadOfficeRole :${isHeadOfficeRole}`);

// 조직코드 조회
const codesDgr2Levl = ref([]);
const codesDgr3Levl = ref([]);

const filteredDgr2LevlOgCds = ref([]); // 필터링된 지역단 코드
const filteredDgr3LevlOgCds = ref([]); // 필터링된 지점 코드

const selectedDgr2LevlOgCds = ref([]); // 선택한 지역단 코드
const selectedDgr3LevlOgCds = ref([]); // 선택한 지점 코드

async function getDgrOgInfos() {
  let res = [];
  res = await dataService.get('/sms/wells/contract/partners/regional-divisions'); // 지역단
  codesDgr2Levl.value = res.data;
  res = await dataService.get('/sms/wells/contract/partners/branch-divisions'); // 지점
  codesDgr3Levl.value = res.data;

  // 지역단 코드 설정
  filteredDgr2LevlOgCds.value = codesDgr2Levl.value;
  // 지점 코드 초기화
  filteredDgr3LevlOgCds.value = [];
}
getDgrOgInfos();

// 조직코드 지역단 변경 이벤트
async function onUpdateDgr2Levl(selectedValues) {
  // 선택한 지점 초기화
  selectedDgr3LevlOgCds.value = [];

  // 지점 코드 필터링. 선택한 지역단의 하위 지점으로 필터링.
  filteredDgr3LevlOgCds.value = codesDgr3Levl.value.filter((v) => selectedValues.includes(v.dgr2LevlOgCd));
}

// 계약구분 변경 이벤트
async function onChangeCntrDv() {
  // console.log(`cntrDv : ${searchParams.value.cntrDv}`);
  if (['A', 'N', 'U'].includes(searchParams.value.cntrDv)) { // 신규/변경,신규,계약변경
    isGrdMstListVisible.value = true;
    isGrdMstRstlListVisible.value = false;
    isGrdMstEmpPrchListVisible.value = false;
    isDtlListVisible.value = true;

    const view = grdMstList.value.getView();
    pageInfo.value.totalMstCount = view.getItemCount();
  } else if (searchParams.value.cntrDv === 'R') { // 재약정
    isGrdMstListVisible.value = false;
    isGrdMstRstlListVisible.value = true;
    isGrdMstEmpPrchListVisible.value = false;
    isDtlListVisible.value = false;

    const view = grdMstRstlList.value.getView();
    pageInfo.value.totalMstCount = view.getItemCount();
  } else if (searchParams.value.cntrDv === 'S') { // 직원구매
    isGrdMstListVisible.value = false;
    isGrdMstRstlListVisible.value = false;
    isGrdMstEmpPrchListVisible.value = true;
    isDtlListVisible.value = false;

    const view = grdMstEmpPrchList.value.getView();
    pageInfo.value.totalMstCount = view.getItemCount();
  }
}

// 계약서 구분(계약서유형코드) 변경 이벤트
async function onChangeCntrwTpCd() {
  // console.log(`cntrwTpCd : ${searchParams.value.cntrwTpCd}`);
  switch (searchParams.value.cntrwTpCd) {
    case '1': // 일시불(환경가전)
      isGrdDtlSpayEnvrElhmListVisible.value = true;
      isGrdDtlSpayBhListVisible.value = false;
      isGrdDtlRntlListVisible.value = false;
      isGrdDtlMshListVisible.value = false;
      isGrdDtlHcrSvcListVisible.value = false;
      isGrdDtlSdingSpayListVisible.value = false;
      isGrdDtlRglrSppListVisible.value = false;
      isGrdDtlLtmIstmListVisible.value = false;
      break;
    case '2': // 일시불(BH)
      isGrdDtlSpayEnvrElhmListVisible.value = false;
      isGrdDtlSpayBhListVisible.value = true;
      isGrdDtlRntlListVisible.value = false;
      isGrdDtlMshListVisible.value = false;
      isGrdDtlHcrSvcListVisible.value = false;
      isGrdDtlSdingSpayListVisible.value = false;
      isGrdDtlRglrSppListVisible.value = false;
      isGrdDtlLtmIstmListVisible.value = false;
      break;
    case '3': // 렌탈
      isGrdDtlSpayEnvrElhmListVisible.value = false;
      isGrdDtlSpayBhListVisible.value = false;
      isGrdDtlRntlListVisible.value = true;
      isGrdDtlMshListVisible.value = false;
      isGrdDtlHcrSvcListVisible.value = false;
      isGrdDtlSdingSpayListVisible.value = false;
      isGrdDtlRglrSppListVisible.value = false;
      isGrdDtlLtmIstmListVisible.value = false;
      break;
    case '4': // 멤버십
      isGrdDtlSpayEnvrElhmListVisible.value = false;
      isGrdDtlSpayBhListVisible.value = false;
      isGrdDtlRntlListVisible.value = false;
      isGrdDtlMshListVisible.value = true;
      isGrdDtlHcrSvcListVisible.value = false;
      isGrdDtlSdingSpayListVisible.value = false;
      isGrdDtlRglrSppListVisible.value = false;
      isGrdDtlLtmIstmListVisible.value = false;
      break;
    case '5': // 홈케어서비스
      isGrdDtlSpayEnvrElhmListVisible.value = false;
      isGrdDtlSpayBhListVisible.value = false;
      isGrdDtlRntlListVisible.value = false;
      isGrdDtlMshListVisible.value = false;
      isGrdDtlHcrSvcListVisible.value = true;
      isGrdDtlSdingSpayListVisible.value = false;
      isGrdDtlRglrSppListVisible.value = false;
      isGrdDtlLtmIstmListVisible.value = false;
      break;
    case '6': // 모종일시불
      isGrdDtlSpayEnvrElhmListVisible.value = false;
      isGrdDtlSpayBhListVisible.value = false;
      isGrdDtlRntlListVisible.value = false;
      isGrdDtlMshListVisible.value = false;
      isGrdDtlHcrSvcListVisible.value = false;
      isGrdDtlSdingSpayListVisible.value = true;
      isGrdDtlRglrSppListVisible.value = false;
      isGrdDtlLtmIstmListVisible.value = false;
      break;
    case '7': // 정기배송
      isGrdDtlSpayEnvrElhmListVisible.value = false;
      isGrdDtlSpayBhListVisible.value = false;
      isGrdDtlRntlListVisible.value = false;
      isGrdDtlMshListVisible.value = false;
      isGrdDtlHcrSvcListVisible.value = false;
      isGrdDtlSdingSpayListVisible.value = false;
      isGrdDtlRglrSppListVisible.value = true;
      isGrdDtlLtmIstmListVisible.value = false;
      break;
    case '8': // 장기할부
      isGrdDtlSpayEnvrElhmListVisible.value = false;
      isGrdDtlSpayBhListVisible.value = false;
      isGrdDtlRntlListVisible.value = false;
      isGrdDtlMshListVisible.value = false;
      isGrdDtlHcrSvcListVisible.value = false;
      isGrdDtlSdingSpayListVisible.value = false;
      isGrdDtlRglrSppListVisible.value = false;
      isGrdDtlLtmIstmListVisible.value = true;
      break;
    default:
      break;
  }
}

// 조회결과
async function fetchMstData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  // console.log(cachedParams);
  // res = await dataService.get('/sms/wells/contract/contracts/managements', { params: { ...cachedParams } });
  res = await dataService.post('/sms/wells/contract/contracts/managements', { ...cachedParams });
  console.log(res.data);

  if (['A', 'N', 'U'].includes(searchParams.value.cntrDv)) {
    // console.log(res.data.searchKssOrdrListResList);
    // if (res.data.searchKssOrdrListResList.length === 0) {
    //   await notify(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    // }

    const view = grdMstList.value.getView();
    view.getDataSource().setRows(res.data.searchKssOrdrListResList);
    pageInfo.value.totalMstCount = view.getItemCount();
    view.resetCurrent();
    view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);

    // 특정사번 '원본 계약서출력' 버튼 활성화 권한 설정
    if (userInfo.loginId === '36544'
     || userInfo.loginId === '36805'
     || userInfo.loginId === '36909'
     || userInfo.loginId === '36581') {
      view.columnByName('ocyCntrwBrws').visible = true; // 원본 계약서출력 컬럼 Show
    } else {
      view.columnByName('ocyCntrwBrws').visible = false; // 원본 계약서출력 컬럼 Hide
    }
    view.columnByName('cstSignCn').visible = false; // 서명 컬럼 Hide
    view.columnByName('dlRstr').visible = false; // 삭제원복 컬럼 Hide
  } else if (searchParams.value.cntrDv === 'R') {
    // console.log(res.data.searchRePromConcListResList);
    if (res.data.searchRePromConcListResList.length === 0) {
      await notify(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    }

    const view = grdMstRstlList.value.getView();
    view.getDataSource().setRows(res.data.searchRePromConcListResList);
    pageInfo.value.totalMstCount = view.getItemCount();
    view.resetCurrent();
    view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  } else if (searchParams.value.cntrDv === 'S') {
    // console.log(res.data.searchEmployeePurchaseListResList);
    if (res.data.searchEmployeePurchaseListResList.length === 0) {
      await notify(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
    }

    const view = grdMstEmpPrchList.value.getView();
    view.getDataSource().setRows(res.data.searchEmployeePurchaseListResList);
    pageInfo.value.totalMstCount = view.getItemCount();
    view.resetCurrent();
    view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  }
}

// 상세내역
async function fetchDtlData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchDtlParams.value);
  // console.log(cachedParams);
  res = await dataService.get('/sms/wells/contract/contracts/managements/details', { params: { ...cachedParams } });

  switch (searchDtlParams.value.cntrwTpCd) {
    case '1': // 일시불(환경가전)
      // console.log(res.data.searchLspyOrdrDtptListResList);
      // eslint-disable-next-line no-const-assign, no-case-declarations
      const view1 = grdDtlSpayEnvrElhmList.value.getView();
      view1.getDataSource().setRows(res.data.searchLspyOrdrDtptListResList);
      pageInfo.value.totalDtlCount = view1.getItemCount();
      view1.resetCurrent();
      view1.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
      break;
    case '2': // 일시불(BH)
      // console.log(res.data.searchBhOrdrDtptListResList);
      // eslint-disable-next-line no-const-assign, no-case-declarations
      const view2 = grdDtlSpayBhList.value.getView();
      view2.getDataSource().setRows(res.data.searchBhOrdrDtptListResList);
      pageInfo.value.totalDtlCount = view2.getItemCount();
      view2.resetCurrent();
      view2.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
      break;
    case '3': // 렌탈
      // console.log(res.data.searchRentOrdrDtptListResList);
      // eslint-disable-next-line no-const-assign, no-case-declarations
      const view3 = grdDtlRntlList.value.getView();
      view3.getDataSource().setRows(res.data.searchRentOrdrDtptListResList);
      pageInfo.value.totalDtlCount = view3.getItemCount();
      view3.resetCurrent();
      view3.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
      break;
    case '4': // 멤버십
      // console.log(res.data.searchMbOrdrDtptListResList);
      // eslint-disable-next-line no-const-assign, no-case-declarations
      const view4 = grdDtlMshList.value.getView();
      view4.getDataSource().setRows(res.data.searchMbOrdrDtptListResList);
      pageInfo.value.totalDtlCount = view4.getItemCount();
      view4.resetCurrent();
      view4.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
      break;
    case '5': // 홈케어서비스
      // console.log(res.data.searchHcsOrdrDtptListResList);
      // eslint-disable-next-line no-const-assign, no-case-declarations
      const view5 = grdDtlHcrSvcList.value.getView();
      view5.getDataSource().setRows(res.data.searchHcsOrdrDtptListResList);
      pageInfo.value.totalDtlCount = view5.getItemCount();
      view5.resetCurrent();
      view5.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
      break;
    case '6': // 모종일시불
      // console.log(res.data.searchPlantsOrdrDtptListResList);
      // eslint-disable-next-line no-const-assign, no-case-declarations
      const view6 = grdDtlSdingSpayList.value.getView();
      view6.getDataSource().setRows(res.data.searchPlantsOrdrDtptListResList);
      pageInfo.value.totalDtlCount = view6.getItemCount();
      view6.resetCurrent();
      view6.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
      break;
    case '7': // 정기배송
      // console.log(res.data.searchRglrDlvrOrdrDtptListResList);
      // eslint-disable-next-line no-const-assign, no-case-declarations
      const view7 = grdDtlRglrSppList.value.getView();
      view7.getDataSource().setRows(res.data.searchRglrDlvrOrdrDtptListResList);
      pageInfo.value.totalDtlCount = view7.getItemCount();
      view7.resetCurrent();
      view7.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
      break;
    case '8': // 장기할부
      // console.log(res.data.searchRentOrdrDtptListResList);
      // eslint-disable-next-line no-const-assign, no-case-declarations
      const view8 = grdDtlLtmIstmList.value.getView();
      view8.getDataSource().setRows(res.data.searchRentOrdrDtptListResList);
      pageInfo.value.totalDtlCount = view8.getItemCount();
      view8.resetCurrent();
      view8.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
      break;
    default:
      break;
  }
}

// 조회버튼 클릭 이벤트
async function onClickSearch() {
  // 조회조건 2가지 중 최소 한개 이상 적용(작성일자/계약상세번호)
  if (isEmpty(searchParams.value.cntrRcpStrtdt)
   && isEmpty(searchParams.value.cntrRcpEnddt)
   && isEmpty(searchParams.value.cntrNo)
   && isEmpty(searchParams.value.cntrSn)) {
    // 작성일자, 계약상세번호 중 하나 이상의 검색조건이 필요합니다.
    await alert(t('MSG_ALT_SRCH_CNDT_NEED_ONE_AMONG', [`${t('MSG_TXT_WRTE_DT')}, ${t('MSG_TXT_CNTR_DTL_NO')}`]));
    return;
  // eslint-disable-next-line no-else-return
  } else if ((isEmpty(searchParams.value.cntrRcpStrtdt)
           && !isEmpty(searchParams.value.cntrRcpEnddt))) {
    if (isEmpty(searchParams.value.cntrRcpStrtdt)) {
      await alert(t('MSG_ALT_INPUT_COMMON', [t('MSG_TXT_WRTE_STRTDT')])); // 작성시작일자를 입력하세요.
      return;
    }
  } else if ((!isEmpty(searchParams.value.cntrRcpStrtdt)
           && isEmpty(searchParams.value.cntrRcpEnddt))) {
    await alert(t('MSG_ALT_SRCH_WRTE_DT_CNDT_MAX_DC', ['31'])); // 작성일자 조건은 최대 {0}일까지 검색할 수 있습니다.
    searchParams.value.cntrRcpEnddt = dayjs(searchParams.value.cntrRcpStrtdt).add(31, 'day').format('YYYYMMDD');
  } else if ((!isEmpty(searchParams.value.cntrRcpStrtdt)
           && !isEmpty(searchParams.value.cntrRcpEnddt))) {
    const diff = dayjs(searchParams.value.cntrRcpEnddt).diff(searchParams.value.cntrRcpStrtdt, 'day');
    // console.log(`diff : ${diff}`);
    if (diff > 31) {
      await alert(t('MSG_ALT_SRCH_WRTE_DT_CNDT_MAX_DC', ['31'])); // 작성일자 조건은 최대 {0}일까지 검색할 수 있습니다.
      return;
    }
  }

  // 선택한 조직 코드에 해당하는 조직 ID 세팅
  searchParams.value.dgr2LevlOgId = codesDgr2Levl.value
    .filter((v) => selectedDgr2LevlOgCds.value.includes(v.dgr2LevlOgCd))
    .map((v) => v.dgr2LevlOgId);
  searchParams.value.dgr3LevlOgId = codesDgr3Levl.value
    .filter((v) => selectedDgr3LevlOgCds.value.includes(v.dgr3LevlOgCd))
    .map((v) => v.dgr3LevlOgId);

  await fetchMstData();
}

// 초기화버튼 클릭 이벤트
async function onClickReset() {
  isGrdMstListVisible.value = true;
  isGrdMstRstlListVisible.value = false;
  isGrdMstEmpPrchListVisible.value = false;
  isDtlListVisible.value = true;
}

// 엑셀다운로드버튼 클릭 이벤트
async function onClickExcelDownload() {
  if (['A', 'N', 'U'].includes(searchParams.value.cntrDv)) {
    const res = await dataService.post('/sms/wells/contract/contracts/managements/excel-download1', searchParams.value);
    const view = grdMstList.value.getView();
    await gridUtil.exportView(view, {
      fileName: currentRoute.value.meta.menuName,
      timePostfix: true,
      exportData: res.data,
    });
  } else if (searchParams.value.cntrDv === 'R') {
    const res = await dataService.post('/sms/wells/contract/contracts/managements/excel-download2', searchParams.value);
    const view = grdMstRstlList.value.getView();
    await gridUtil.exportView(view, {
      fileName: currentRoute.value.meta.menuName,
      timePostfix: true,
      exportData: res.data,
    });
  } else if (searchParams.value.cntrDv === 'S') {
    const res = await dataService.post('/sms/wells/contract/contracts/managements/excel-download3', searchParams.value);
    const view = grdMstEmpPrchList.value.getView();
    await gridUtil.exportView(view, {
      fileName: currentRoute.value.meta.menuName,
      timePostfix: true,
      exportData: res.data,
    });
  }
}

// 계약서 메일발송 버튼 클릭 이벤트
async function onClickCntrwMlFw() {
  let view;
  const rcvrInfo = [];

  switch (searchParams.value.cntrDv) {
    case 'A': // 신규/변경
    case 'N': // 신규
    case 'U': // 계약변경
      view = grdMstList.value.getView();
      break;
    case 'R': // 재약정
      view = grdMstRstlList.value.getView();
      break;
    case 'S': // 직원구매
      view = grdMstRstlList.value.getView();
      break;
    default:
      break;
  }

  const checkedItems = view.getCheckedItems();
  if (checkedItems.length === 0) {
    notify(t('MSG_ALT_BEFORE_SELECT_IT', [t('MSG_TXT_ITEM')]));
  } else {
    const cntrs = gridUtil.getCheckedRowValues(view);
    cntrs.forEach((row) => {
      // 확정인 계약에 한해서만 가능, 계약진행상태코드 == 60 (확정)
      if (['A', 'N', 'U'].includes(searchParams.value.cntrDv)
        && row.cntrPrgsStatCd !== '60') {
        notify(t('MSG_ALT_CNTR_PRGS_STAT_CD_NOT_CNFM')); // 계약진행상태가 확정이 아닙니다.
        isCntrPrgsStatCnfm = false;
      }

      if (['A', 'N', 'U'].includes(searchParams.value.cntrDv)) {
        // 추가 파라미터(신규/변경시  rstlYn:'N')
        rcvrInfo.push({
          cntrNo: String(row.cntrDtlNo).split('-')[0],
          cntrSn: String(row.cntrDtlNo).split('-')[1],
          cntrNm: row.cstKnm,
          rstlYn: 'N',
          emadr: '',
        });
      } else if (searchParams.value.cntrDv === 'R') {
        // 추가 파라미터(재약정시  rstlYn:'Y')
        rcvrInfo.push({
          cntrNo: row.cntrNo,
          cntrSn: row.cntrSn,
          cntrNm: row.cstKnm,
          rstlYn: 'Y',
          emadr: '',
        });
      }
    });

    // 계약진행상태가 확정(60)이 아닐 경우 return 처리
    if (isCntrPrgsStatCnfm === false) {
      isCntrPrgsStatCnfm = true;
      return false;
    }

    // console.log(rcvrInfo);
    const res = await modal({
      component: 'WwctaContractDocumentMailForwardingP',
      componentProps: { rcvrInfo },
    });

    // 리턴값을 체크한 후 재조회
    if (res.result) fetchMstData();
  }
}

// 알림톡 발송 버튼 클릭 이벤트
async function onClickNotakfW() {
  let view;
  let res;
  let arrCstKnm = '';
  let rowCnt = 0;
  const saveData = [];

  switch (searchParams.value.cntrDv) {
    case 'A': // 신규/변경
    case 'N': // 신규
    case 'U': // 계약변경
      view = grdMstList.value.getView();
      break;
    case 'R': // 재약정
      view = grdMstRstlList.value.getView();
      break;
    case 'S': // 직원구매
      view = grdMstRstlList.value.getView();
      break;
    default:
      break;
  }

  const checkedItems = view.getCheckedItems();
  if (checkedItems.length === 0) {
    notify(t('MSG_ALT_BEFORE_SELECT_IT', [t('MSG_TXT_ITEM')]));
  } else {
    const cntrs = gridUtil.getCheckedRowValues(view);
    cntrs.forEach((row) => {
      // 확정인 계약에 한해서만 가능, 계약진행상태코드 == 60 (확정)
      if (['A', 'N', 'U'].includes(searchParams.value.cntrDv)
        && row.cntrPrgsStatCd !== '60') {
        notify(t('MSG_ALT_CNTR_PRGS_STAT_CD_NOT_CNFM')); // 계약진행상태가 확정이 아닙니다.
        return;
      }

      // 신규/변경일 경우
      if (['A', 'N', 'U'].includes(searchParams.value.cntrDv)) {
        saveData.push({
          cntrNo: String(row.cntrDtlNo).split('-')[0],
          cntrSn: String(row.cntrDtlNo).split('-')[1].substr(0, 1),
          cntrDv: searchParams.value.cntrDv,
        });
      } else if (searchParams.value.cntrDv === 'R') { // 재약정
        saveData.push({
          cntrNo: row.cntrNo,
          cntrSn: row.cntrSn,
          cntrDv: searchParams.value.cntrDv,
          stplRcpDt: row.stplRcpDt,
          stplPtrm: row.stplPtrm,
        });
      }

      // 알림톡 발송 대상 고객명을 조합
      if (rowCnt === 0) {
        arrCstKnm = row.cstKnm;
      } else {
        arrCstKnm += `,${row.cstKnm}`;
      }

      // eslint-disable-next-line no-plusplus
      rowCnt++;
    });

    // console.log(saveData);
    if (isEmpty(arrCstKnm)) return;
    if (await confirm(t('MSG_ALT_CNFM_NOTAK_FW', [`[${arrCstKnm}]`]))) {
      res = await dataService.put('/sms/wells/contract/contracts/managements/notification-talk-forwarding', saveData);
      if (res.data.processCount > 0) {
        await notify(t('MSG_ALT_BIZTALK_SEND_SUCCESS')); // 알림톡이 발송되었습니다.
        // 재조회 호출
        await fetchMstData();
      } else {
        await notify(t('MSG_ALT_BIZTALK_ERR')); // 알림톡 전송중 에러가 발생했습니다.
      }
    }
  }
}

// 고객번호 팝업조회
async function onClickSearchCntrCst() {
  const res = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: {
      cstNo: searchParams.value.cntrCstNo,
    },
  });
  if (res.result && res.payload) {
    // searchParams.cntrCstKnm(res.payload.name);
    // searchParams.cntrCstNo(res.payload.cstNo);
    searchParams.value.cntrCstNo = res.payload.cstNo;
    searchParams.value.cstKnm = res.payload.name;
  }
}

onMounted(async () => {
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
// 조회결과-전체(Default,신규/변경,신규,계약변경)
const initGrdMstList = defineGrid((data, view) => {
  // changing api & cacheparams according to search classification
  let res = '';

  const fields = [
    { fieldName: 'cnfmApr' }, // 확정승인
    { fieldName: 'dgr2LevlOgNm' }, // 지역단
    { fieldName: 'dgr3LevlOgNm' }, // 지점
    { fieldName: 'rgstDv' }, // 계약구분(등록구분)
    { fieldName: 'rgstDvNm' }, // 계약구분명(등록구분명)
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'cntrCstNo' }, // 고객번호
    { fieldName: 'sellPrtnrNo' }, // 판매자 사번
    { fieldName: 'cntrPrgsStatNm2' }, // 상태
    { fieldName: 'cntrPrgsStatNm' }, // 계약진행상태코드명
    { fieldName: 'cntrPrgsStatCd' }, // 계약진행상태코드
    { fieldName: 'cstStlmInMthNm' }, // 계약방식
    { fieldName: 'cntrwTpNm' }, // 상품군
    { fieldName: 'cntrwTpCd' }, // 계약서구분코드
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'fstRgstDtm' }, // 작성일시
    { fieldName: 'cntrRcpFshDtm' }, // 접수일시
    { fieldName: 'cntrCanDtm' }, // 삭제(취소)일시
    { fieldName: 'cntrCanUsrId' }, // 계약취소자
    { fieldName: 'dlRstr' }, // 삭제원복
    { fieldName: 'cnFm' }, // 확정
    { fieldName: 'rqsIz' }, // 요청내역
    { fieldName: 'dcevdnDocId' }, // 증빙서류문서ID
    { fieldName: 'fileNm' }, // 증빙서류문서파일명
    { fieldName: 'fileUid' }, // 증빙서류문서파일UID
    { fieldName: 'cntrwBrws' }, // 계약서출력
    { fieldName: 'cntrAprCn' }, // 확정승인요청건수
    { fieldName: 'cstSignCn' }, // 고객서명내용
    { fieldName: 'ocyCntrwBrws' }, // 원본 계약서출력
    { fieldName: 'emilSndgYn' }, // 계약서 발송여부
    { fieldName: 'emilSndgDt' }, // 계약서 발송일자
    { fieldName: 'notakFwDt' }, // 알림톡 발송일자
    { fieldName: 'notakFwIz' }, // 알림톡 발송내역
    { fieldName: 'talkRcvYn' }, // 알림톡 수신여부
    { fieldName: 'notakRcvDt' }, // 알림톡 수신일자
    { fieldName: 'cntrAprYn' }, // 확정승인여부
  ];

  const columns = [
    { fieldName: 'cnfmApr',
      header: t('MSG_TXT_CNFM_APR'),
      width: '130',
      styleName: 'text-center',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback(grid, index) {
        const { cntrAprYn } = grid.getValues(index.itemIndex);
        return cntrAprYn === 'Y' ? t('MSG_TXT_CNFM_APR') : ''; // 계약진행상태코드(결제완료)
      },
      styleCallback(grid, dataCell) {
        const { cntrAprYn } = grid.getValues(dataCell.index.itemIndex);
        const retrunValue = cntrAprYn === 'Y' ? grid.getValue(dataCell.index.itemIndex, 'cntrPrgsStatCd') : 0;
        return retrunValue !== 0 ? { renderer: { type: 'button', hideWhenEmpty: false } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 확정승인
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '127', styleName: 'text-center' }, // 지역단
    { fieldName: 'dgr3LevlOgNm', header: t('MSG_TXT_BRANCH'), width: '127', styleName: 'text-center' }, // 지점
    { fieldName: 'rgstDvNm', header: t('MSG_TXT_CNTR_DV'), width: '127', styleName: 'text-center' }, // 계약구분
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '180', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true }, // 계약상세번호
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '127', styleName: 'text-center' }, // 고객번호
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_PTNR_NO'), width: '127', styleName: 'text-center' }, // 판매자 사번
    { fieldName: 'cntrPrgsStatNm2', header: t('MSG_TXT_STT'), width: '127', styleName: 'text-center' }, // 상태
    { fieldName: 'cntrPrgsStatNm', header: t('MSG_TXT_CNTR_STAT'), width: '127', styleName: 'text-center' }, // 계약상태
    { fieldName: 'cstStlmInMthNm', header: t('MSG_TXT_CNTR_MTHD'), width: '127', styleName: 'text-center' }, // 계약방식
    { fieldName: 'cntrwTpNm', header: t('MSG_TXT_PDGRP'), width: '127', styleName: 'text-center' }, // 상품군
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '127', styleName: 'text-center' }, // 고객명
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_DRAT_DTM'), width: '160', styleName: 'text-center', datetimeFormat: 'datetime' }, // 작성일시
    { fieldName: 'cntrRcpFshDtm', header: t('MSG_TXT_RCP_DTM'), width: '160', styleName: 'text-center', datetimeFormat: 'datetime' }, // 접수일시
    { fieldName: 'cntrCanDtm', header: t('MSG_TXT_DEL_CAN_DTM'), width: '160', styleName: 'text-center', datetimeFormat: 'datetime' }, // 삭제(취소)일시
    { fieldName: 'cntrCanUsrId', header: t('MSG_TXT_DEL') + t('MSG_TXT_CNCSR'), width: '160', styleName: 'text-center', datetimeFormat: 'datetime' }, // 계약취소자
    { fieldName: 'dlRstr',
      header: t('MSG_TXT_DL_RSTR'),
      width: '127',
      styleName: 'text-center',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback(grid, index) {
        const { cntrPrgsStatCd } = grid.getValues(index.itemIndex);
        const { cntrwTpCd } = grid.getValues(index.itemIndex);
        const { rgstDv } = grid.getValues(index.itemIndex);
        // return cntrPrgsStatCd >= '90' && cntrPrgsStatCd !== '98'
        return cntrPrgsStatCd === '99'
            && (cntrwTpCd === '3' || cntrwTpCd === '8')
            && rgstDv === '1' ? t('MSG_TXT_DL_RSTR') : ''; // 계약진행상태코드(확정)
      },
      styleCallback(grid, dataCell) {
        const { cntrPrgsStatCd } = grid.getValues(dataCell.index.itemIndex);
        const { cntrwTpCd } = grid.getValues(dataCell.index.itemIndex);
        const { rgstDv } = grid.getValues(dataCell.index.itemIndex);
        // const retrunValue = cntrPrgsStatCd >= '90' && cntrPrgsStatCd !== '98'
        const retrunValue = cntrPrgsStatCd === '99'
            && (cntrwTpCd === '3' || cntrwTpCd === '8')
            && rgstDv === '1' ? cntrPrgsStatCd : 0;
        return retrunValue !== 0 ? { renderer: { type: 'button', hideWhenEmpty: false } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 삭제원복
    { fieldName: 'cnfm',
      header: t('MSG_TXT_DTRM'),
      width: '70',
      styleName: 'text-center',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback(grid, index) {
        const { cntrPrgsStatCd } = grid.getValues(index.itemIndex);
        return cntrPrgsStatCd < '60' && isHeadOfficeRole ? t('MSG_TXT_DTRM') : ''; // 계약진행상태코드(확정)
      },
      styleCallback(grid, dataCell) {
        const { cntrPrgsStatCd } = grid.getValues(dataCell.index.itemIndex);
        const retrunValue = cntrPrgsStatCd < '60' ? cntrPrgsStatCd : 0;
        return retrunValue !== 0 && isHeadOfficeRole ? { renderer: { type: 'button', hideWhenEmpty: false } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 확정
    { fieldName: 'rqsIz',
      header: t('MSG_TXT_RQS_IZ'),
      width: '127',
      styleName: 'text-center',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback(grid, index) {
        const { cntrAprCn } = grid.getValues(index.itemIndex);
        return cntrAprCn > 0 ? t('MSG_TXT_RQS_IZ') : ''; // 확정승인요청건수
      },
      styleCallback(grid, dataCell) {
        const { cntrAprCn } = grid.getValues(dataCell.index.itemIndex);
        const retrunValue = cntrAprCn > 0 ? cntrAprCn : 0;
        return retrunValue !== 0 ? { renderer: { type: 'button', hideWhenEmpty: false } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 요청내역
    { fieldName: 'fileUid',
      header: t('MSG_TXT_ATTH_FILE'),
      width: '127',
      styleName: 'text-center',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback(grid, index) {
        const { fileUid } = grid.getValues(index.itemIndex);
        return isEmpty(fileUid) ? '' : t('MSG_TXT_ATTH_FILE'); // 증빙서류문서ID
      },
      styleCallback(grid, dataCell) {
        const { fileUid } = grid.getValues(dataCell.index.itemIndex);
        return isEmpty(fileUid) ? { renderer: { type: 'text', styleName: 'text-center' } } : { renderer: { type: 'button', hideWhenEmpty: false } };
      },
    }, // 첨부파일
    { fieldName: 'cntrwBrws',
      header: t('MSG_TXT_CNTRW_PRNT'),
      width: '130',
      styleName: 'rg-button-icon--x',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback(grid, index) {
        const { cntrPrgsStatCd } = grid.getValues(index.itemIndex);
        return ['50', '60'].includes(cntrPrgsStatCd) ? t('MSG_TXT_CNTRW_BRWS') : ''; // 계약진행상태코드(결제완료/확정)
      },
      styleCallback(grid, dataCell) {
        const { cntrPrgsStatCd } = grid.getValues(dataCell.index.itemIndex);
        const retrunValue = ['50', '60'].includes(grid.getValue(dataCell.index.itemIndex, 'cntrPrgsStatCd')) ? cntrPrgsStatCd : 0;
        return retrunValue !== 0 ? { renderer: { type: 'button', hideWhenEmpty: false } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 계약서출력
    { fieldName: 'cstSignCn', header: t('MSG_TXT_SIGN'), width: '127', styleName: 'text-center' }, // 고객서명내용
    { fieldName: 'ocyCntrwBrws',
      header: t('MSG_TXT_OCY_CNTRW_BRWS'),
      width: '130',
      styleName: 'rg-button-icon--x',
      renderer: { type: 'button', hideWhenEmpty: false },
      displayCallback(grid, index) {
        const { cntrPrgsStatCd } = grid.getValues(index.itemIndex);
        return ['50', '60'].includes(cntrPrgsStatCd) ? t('MSG_TXT_PRNT') : ''; // 계약진행상태코드(결제완료/확정)
      },
      styleCallback(grid, dataCell) {
        const { cntrPrgsStatCd } = grid.getValues(dataCell.index.itemIndex);
        const retrunValue = ['50', '60'].includes(grid.getValue(dataCell.index.itemIndex, 'cntrPrgsStatCd')) ? cntrPrgsStatCd : 0;
        return retrunValue !== 0 ? { renderer: { type: 'button', hideWhenEmpty: false } } : { renderer: { type: 'text', styleName: 'text-center' } };
      },
    }, // 원본 계약서출력
    { fieldName: 'emilSndgYn', header: `${t('MSG_TXT_CNTRW')} ${t('MSG_TXT_FW_YN')}`, width: '127', styleName: 'text-center' }, // 계약서 발송여부
    { fieldName: 'emilSndgDt', header: `${t('MSG_TXT_CNTRW')} ${t('MSG_TXT_FW_DT')}`, width: '127', styleName: 'text-center', datetimeFormat: 'date' }, // 계약서 발송일자
    { fieldName: 'notakFwDt', header: t('MSG_TXT_NOTAK_FW_DT'), width: '127', styleName: 'text-center', datetimeFormat: 'date' }, // 알림톡 발송일자
    { fieldName: 'notakFwIz', header: t('MSG_TXT_NOTAK_FW_IZ'), width: '127', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TXT_NOTAK_FW_IZ') }, // 알림톡 발송내역
    { fieldName: 'talkRcvYn', header: t('MSG_TXT_NOTAK_RCV_YN'), width: '127', styleName: 'text-center' }, // 알림톡 수신여부
    { fieldName: 'notakRcvDt', header: t('MSG_TXT_NOTAK_RCV_DT'), width: '127', styleName: 'text-center', datetimeFormat: 'date' }, // 알림톡 수신일자
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  // view.displayOptions.selectionStyle = 'singleRow';

  view.onCellItemClicked = async (g, { column, dataRow }) => {
    const paramCntrDtlNo = gridUtil.getCellValue(g, dataRow, 'cntrDtlNo');
    const paramCntrNo = String(paramCntrDtlNo).split('-')[0];
    const paramCntrSn = String(paramCntrDtlNo).split('-')[1];
    const { cntrPrgsStatCd } = g.getValues(dataRow);
    const { cntrwTpCd } = g.getValues(dataRow);
    const fileRow = gridUtil.getRowValue(g, dataRow);

    if (['cnfmApr'].includes(column)) { // 확정승인 버튼 클릭
      searchCnfmAprvParams.value.cntrNo = paramCntrNo;
      searchCnfmAprvParams.value.cntrSn = paramCntrSn;
      searchCnfmAprvParams.value.cnfmMsgYn = 'Y';

      const rows = [
        { cntrNo: paramCntrNo, cntrSn: paramCntrSn, cnfmMsgYn: 'Y' },
      ];

      // console.log(rows);
      if (await confirm(t('MSG_ALT_CNFM_APR_PROCS'))) { // 확정 승인 처리하시겠습니까?
        res = await dataService.put('/sms/wells/contract/contracts/managements/confirm-approval', rows);
        if (searchCnfmAprvParams.value.cnfmMsgYn === 'Y') {
          // console.log(res.data.key);
          if (await confirm(res.data.key)) {
            rows.forEach((row) => {
              row.cntrNo = searchCnfmAprvParams.value.cntrNo; // 계약번호
              row.cntrSn = searchCnfmAprvParams.value.cntrSn; // 계약일련번호
              row.cnfmMsgYn = ''; // 확정승인메세지
            });
            res = await dataService.put('/sms/wells/contract/contracts/managements/confirm-approval', rows);
            // console.log(res.data.processCount);
            if (res.data.processCount === 0) {
              await notify(t('MSG_ALT_CNFM_APR_AND_CNFM_PROCS_FSH')); // 확정 승인(확정) 처리가 완료 되었습니다.
            } else {
              await notify(t('MSG_ALT_CNFM_APR_PROCS_FSH_REST', [res.data.processCount])); // 확정 승인 처리가 완료 되었습니다.(잔여: {0})
            }
            // 재조회 호출
            await fetchMstData();
          }
        } else {
          // console.log(res.data.processCount);
        }
      }
    } else if (['cnfm'].includes(column)) { // 확정버튼 클릭
      const rows = [
        { cntrNo: paramCntrNo },
      ];

      // 확정처리 전 계약번호의 계약진행상태코드 조회
      searchCnfmAprvParams.value.cntrNo = paramCntrNo;
      cachedParams = cloneDeep(searchCnfmAprvParams.value);
      res = await dataService.get('/sms/wells/contract/contracts/managements/status', { params: { ...cachedParams } });
      // console.log(res.data[0].cntrPrgsStatCd);
      if (res.data[0].cntrPrgsStatCd === '50') {
        if (await confirm(t('MSG_ALT_CNFM_ORD'))) { // 주문을 확정하시겠습니까?
          res = await dataService.put('/sms/wells/contract/contracts/managements/confirm', rows);
          // console.log(res.data.processCount);
          if (res.data.processCount === 0) {
            await notify(t('MSG_ALT_ORD_CNFM')); // 주문이 확정되었습니다.
            // 재조회 호출
            await fetchMstData();
          }
        }
      } else {
        await alert(t('MSG_ALT_STLM_FSH_STAT_ORD_CAN_ONLY_CNFM')); // 결제 완료 상태의 주문만 확정할 수 있습니다.
      }
    } else if (['rqsIz'].includes(column)) { // 요청내역 버튼 클릭
      // const { fstRgstUsrId, fnlMdfcUsrId } = gridUtil.getRowValue(g, itemIndex);
      await modal({ component: 'WwConfirmApprovalAskIzListP', componentProps: { cntrNo: paramCntrNo } }); // 확정 승인 요청 내역
    } else if (['cntrDtlNo'].includes(column)) { // 계약상세번호 클릭
      switch (cntrwTpCd) {
        case '1': // 일시불(환경가전)
          isGrdDtlSpayEnvrElhmListVisible.value = true;
          isGrdDtlSpayBhListVisible.value = false;
          isGrdDtlRntlListVisible.value = false;
          isGrdDtlMshListVisible.value = false;
          isGrdDtlHcrSvcListVisible.value = false;
          isGrdDtlSdingSpayListVisible.value = false;
          isGrdDtlRglrSppListVisible.value = false;
          isGrdDtlLtmIstmListVisible.value = false;
          break;
        case '2': // 일시불(BH)
          isGrdDtlSpayEnvrElhmListVisible.value = false;
          isGrdDtlSpayBhListVisible.value = true;
          isGrdDtlRntlListVisible.value = false;
          isGrdDtlMshListVisible.value = false;
          isGrdDtlHcrSvcListVisible.value = false;
          isGrdDtlSdingSpayListVisible.value = false;
          isGrdDtlRglrSppListVisible.value = false;
          isGrdDtlLtmIstmListVisible.value = false;
          break;
        case '3': // 렌탈
          isGrdDtlSpayEnvrElhmListVisible.value = false;
          isGrdDtlSpayBhListVisible.value = false;
          isGrdDtlRntlListVisible.value = true;
          isGrdDtlMshListVisible.value = false;
          isGrdDtlHcrSvcListVisible.value = false;
          isGrdDtlSdingSpayListVisible.value = false;
          isGrdDtlRglrSppListVisible.value = false;
          isGrdDtlLtmIstmListVisible.value = false;
          break;
        case '4': // 멤버십
          isGrdDtlSpayEnvrElhmListVisible.value = false;
          isGrdDtlSpayBhListVisible.value = false;
          isGrdDtlRntlListVisible.value = false;
          isGrdDtlMshListVisible.value = true;
          isGrdDtlHcrSvcListVisible.value = false;
          isGrdDtlSdingSpayListVisible.value = false;
          isGrdDtlRglrSppListVisible.value = false;
          isGrdDtlLtmIstmListVisible.value = false;
          break;
        case '5': // 홈케어서비스
          isGrdDtlSpayEnvrElhmListVisible.value = false;
          isGrdDtlSpayBhListVisible.value = false;
          isGrdDtlRntlListVisible.value = false;
          isGrdDtlMshListVisible.value = false;
          isGrdDtlHcrSvcListVisible.value = true;
          isGrdDtlSdingSpayListVisible.value = false;
          isGrdDtlRglrSppListVisible.value = false;
          isGrdDtlLtmIstmListVisible.value = false;
          break;
        case '6': // 모종일시불
          isGrdDtlSpayEnvrElhmListVisible.value = false;
          isGrdDtlSpayBhListVisible.value = false;
          isGrdDtlRntlListVisible.value = false;
          isGrdDtlMshListVisible.value = false;
          isGrdDtlHcrSvcListVisible.value = false;
          isGrdDtlSdingSpayListVisible.value = true;
          isGrdDtlRglrSppListVisible.value = false;
          isGrdDtlLtmIstmListVisible.value = false;
          break;
        case '7': // 정기배송
          isGrdDtlSpayEnvrElhmListVisible.value = false;
          isGrdDtlSpayBhListVisible.value = false;
          isGrdDtlRntlListVisible.value = false;
          isGrdDtlMshListVisible.value = false;
          isGrdDtlHcrSvcListVisible.value = false;
          isGrdDtlSdingSpayListVisible.value = false;
          isGrdDtlRglrSppListVisible.value = true;
          isGrdDtlLtmIstmListVisible.value = false;
          break;
        case '8': // 장기할부
          isGrdDtlSpayEnvrElhmListVisible.value = false;
          isGrdDtlSpayBhListVisible.value = false;
          isGrdDtlRntlListVisible.value = false;
          isGrdDtlMshListVisible.value = false;
          isGrdDtlHcrSvcListVisible.value = false;
          isGrdDtlSdingSpayListVisible.value = false;
          isGrdDtlRglrSppListVisible.value = false;
          isGrdDtlLtmIstmListVisible.value = true;
          break;
        default:
          break;
      }
      searchDtlParams.value.cntrNo = paramCntrNo;
      searchDtlParams.value.cntrwTpCd = cntrwTpCd;
      searchDtlParams.value.cntrPrgsStatCd = cntrPrgsStatCd;

      await fetchDtlData();
    } else if (['fileUid'].includes(column)) { /* 파일UID인 경우 */
      fileUtil.download({ fileUid: fileRow.fileUid, originalFileName: fileRow.fileNm }, 'storage'); /* kw-lib에서 fileUtil을 불러옴  */
    } else if (['cntrwBrws'].includes(column)) { // 계약서보기 버튼 클릭
      await alert('계약서보기 팝업은 작업예정입니다.');
    } else if (['notakFwIz'].includes(column)) { // 알림톡 발송 내역 버튼 클릭
      await modal({ component: 'WwKakaotalkSendListP', componentProps: { cntrNo: paramCntrNo, cntrSn: paramCntrSn, concDiv: searchParams.cntrDv } }); // 카카오톡 발송 내역 조회
    }
  };

  view.onCellClicked = (g, clickData) => {
    if (clickData.cellType === 'data') {
      // Data Row Click시 checkbar toggle 적용
      view.checkRow(clickData.dataRow, !view.getCheckedItems().includes(clickData.dataRow));
    }
  };
});

// 조회결과-재약정
const initGrdMstRstlList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'pdNm' }, // 상품
    { fieldName: 'hgrPdNm' }, // 모종
    { fieldName: 'feeAckmtCt' }, // 인정건수
    { fieldName: 'feeAckmtBaseAmt', dataType: 'number' }, // 기준수수료
    { fieldName: 'cntrPrgsStatNm' }, // 계약상태
    { fieldName: 'stplTpNm' }, // 약정유형
    { fieldName: 'stplPtrm' }, // 약정개월
    { fieldName: 'stplStrtdt' }, // 약정시작일자
    { fieldName: 'stplEnddt' }, // 약정종료일자
    { fieldName: 'stplDscAmt', dataType: 'number' }, // 약정할인금액
    { fieldName: 'stplRcpDt' }, // 접수일자
    { fieldName: 'rentalTn' }, // 재약정 가입차월
    { fieldName: 'stplCnfmDt' }, // 약정확정일자
    { fieldName: 'stplCanDt' }, // 약정취소일자
    { fieldName: 'reqdDt' }, // 철거일자
    { fieldName: 'prtnrKnm' }, // 판매자
    { fieldName: 'rcpPrtnrNo' }, // 판매자 사번
    { fieldName: 'ogCd' }, // 판매자 지점코드
    { fieldName: 'ocyCntrwBrws' }, // 리포트 보기
    { fieldName: 'notakFwIz' }, // 알림톡 발송내역
    { fieldName: 'talkRcvYn' }, // 알림톡 수신여부
    { fieldName: 'notakFwDt' }, // 알림톡 발송일자
    { fieldName: 'basePdCd' }, // 상품코드
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '176', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '127', styleName: 'text-center' }, // 계약일련번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '127', styleName: 'text-center' }, // 고객명
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT'), width: '163', styleName: 'text-center' }, // 상품
    { fieldName: 'hgrPdNm', header: t('MSG_TXT_SDING'), width: '127', styleName: 'text-center' }, // 모종
    { fieldName: 'feeAckmtCt', header: t('MSG_TXT_PD_ACC_CNT'), width: '127', styleName: 'text-right' }, // 인정건수
    { fieldName: 'feeAckmtBaseAmt', header: t('MSG_TXT_PD_STD_FEE'), width: '127', styleName: 'text-right' }, // 기준수수료
    { fieldName: 'cntrPrgsStatNm', header: t('MSG_TXT_CNTR_STAT'), width: '127', styleName: 'text-center' }, // 계약상태
    { fieldName: 'stplTpNm', header: t('MSG_TXT_STPL_TYPE'), width: '127', styleName: 'text-center' }, // 약정유형
    { fieldName: 'stplPtrm', header: t('MSG_TXT_STPL_MCNT'), width: '127', styleName: 'text-right' }, // 약정개월
    { fieldName: 'stplStrtdt', header: t('MSG_TXT_STPL_STRTDT'), width: '127', styleName: 'text-center', datetimeFormat: 'date' }, // 약정시작일자
    { fieldName: 'stplEnddt', header: t('MSG_TXT_STPL_ENDDT'), width: '127', styleName: 'text-center', datetimeFormat: 'date' }, // 약정종료일자
    { fieldName: 'stplDscAmt', header: t('MSG_TXT_STPL_DSC_AMT'), width: '127', styleName: 'text-right' }, // 약정할인금액
    { fieldName: 'stplRcpDt', header: t('MSG_TXT_RCPDT'), width: '127', styleName: 'text-center', datetimeFormat: 'date' }, // 접수일자
    { fieldName: 'rentalTn', header: t('MSG_TXT_RSTL_J_NMN'), width: '148', styleName: 'text-right' }, // 재약정 가입차월
    { fieldName: 'stplCnfmDt', header: t('MSG_TXT_STPL_CNFM_DT'), width: '127', styleName: 'text-center', datetimeFormat: 'date' }, // 약정확정일자
    { fieldName: 'stplCanDt', header: t('MSG_TXT_STPL_CANC_DT'), width: '127', styleName: 'text-center', datetimeFormat: 'date' }, // 약정취소일자
    { fieldName: 'reqdDt', header: t('MSG_TXT_DEM_DT'), width: '127', styleName: 'text-center', datetimeFormat: 'date' }, // 철거일자
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_SELLER_PERSON'), width: '127', styleName: 'text-center' }, // 판매자
    { fieldName: 'rcpPrtnrNo', header: t('MSG_TXT_PTNR_NO'), width: '127', styleName: 'text-center' }, // 판매자 사번
    { fieldName: 'ogCd', header: t('MSG_TXT_PTNR_BRCH_CD'), width: '127', styleName: 'text-center' }, // 판매자 지점코드
    { fieldName: 'ocyCntrwBrws', header: t('MSG_BTN_CNTRW_BRWS'), width: '127', styleName: 'rg-button-icon--x', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_BTN_CNTRW_BRWS') }, // 리포트 보기
    { fieldName: 'notakFwIz', header: t('MSG_TXT_NOTAK_FW_IZ'), width: '127', styleName: 'text-center', renderer: { type: 'button', hideWhenEmpty: false }, displayCallback: () => t('MSG_TXT_NOTAK_FW_IZ') }, // 알림톡 발송내역
    { fieldName: 'talkRcvYn', header: t('MSG_TXT_NOTAK_RCV_YN'), width: '127', styleName: 'text-center' }, // 알림톡 수신여부
    { fieldName: 'notakFwDt', header: t('MSG_TXT_NOTAK_FW_DT'), width: '127', styleName: 'text-center', datetimeFormat: 'date' }, // 알림톡 발송일자
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '127', styleName: 'text-center' }, // 상품코드
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  // view.displayOptions.selectionStyle = 'singleRow';
  view.onCellItemClicked = async (g, { column, dataRow }) => {
    const paramCntrDtlNo = `${gridUtil.getCellValue(g, dataRow, 'cntrNo')}-${gridUtil.getCellValue(g, dataRow, 'cntrSn')}`;
    const paramCntrNo = `${gridUtil.getCellValue(g, dataRow, 'cntrNo')}`;
    const paramCntrSn = `${gridUtil.getCellValue(g, dataRow, 'cntrSn')}`;

    if (['notakFwIz'].includes(column)) { // 알림톡 발송 내역 버튼 클릭
      await modal({ component: 'WwKakaotalkSendListP', componentProps: { cntrDtlNo: paramCntrDtlNo, concDiv: searchParams.cntrDv } }); // 카카오톡 발송 내역 조회
    }

    if (['ocyCntrwBrws'].includes(column)) { // 리포트 보기 버튼 클릭
      await openReportPopup(
        '/kstation-w/ord/rp/V1.0/contractRPView.ozr',
        null,
        JSON.stringify(
          {
            cntrNo: paramCntrNo,
            cntrSn: paramCntrSn,
          },
        ),
      );
    }
  };

  view.onCellClicked = (g, clickData) => {
    if (clickData.cellType === 'data') {
      // Data Row Click시 checkbar toggle 적용
      view.checkRow(clickData.dataRow, !view.getCheckedItems().includes(clickData.dataRow));
    }
  };
});

// 조회결과-직원구매
const initGrdMstEmpPrchList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cntrCstNo' }, // 고객번호
    { fieldName: 'cntrPrgsStatNm' }, // 계약상태
    { fieldName: 'cntrwTpNm' }, // 상품군
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'dgr2LevlOgNm' }, // 지역단
    { fieldName: 'dgr3LevlOgNm' }, // 지점
    { fieldName: 'sellPrtnrNo' }, // 판매자 사번
    { fieldName: 'prtnrKnm' }, // 판매자
    { fieldName: 'wrpBlg' }, // 작성자 소속
    { fieldName: 'fstRgstUsrId' }, // 작성자 사번
    { fieldName: 'fstRgstUsrNm' }, // 작성자
    { fieldName: 'fstRgstDtm' }, // 작성일시
    { fieldName: 'cntrRcpFshDtm' }, // 접수일시
    { fieldName: 'istDuedt' }, // 설치예정일
    { fieldName: 'slDt' }, // 매출일
    { fieldName: 'sellTpDtlNm' }, // 판매유형
    { fieldName: 'svPdTpCd' }, // 용도
    { fieldName: 'svPdTpNm' }, // 용도명
    { fieldName: 'svPrd' }, // 주기
    { fieldName: 'mchnChYn' }, // 기기변경여부
    { fieldName: 'mchnChBfCd' }, // 기기변경(이전) 코드
    { fieldName: 'ensmRernt' }, // 임직원 재렌탈
    { fieldName: 'inqCstCd' }, // 문의고객코드
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '176', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '127', styleName: 'text-center' }, // 계약일련번호
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '127', styleName: 'text-center' }, // 고객번호
    { fieldName: 'cntrPrgsStatNm', header: t('MSG_TXT_CNTR_STAT'), width: '127', styleName: 'text-center' }, // 계약상태
    { fieldName: 'cntrwTpNm', header: t('MSG_TXT_PDGRP'), width: '127', styleName: 'text-center' }, // 상품군
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '127', styleName: 'text-center' }, // 고객명
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '127', styleName: 'text-center' }, // 지역단
    { fieldName: 'dgr3LevlOgNm', header: t('MSG_TXT_BRANCH'), width: '127', styleName: 'text-center' }, // 지점
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_PTNR_NO'), width: '127', styleName: 'text-center' }, // 판매자 사번
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_SELLER_PERSON'), width: '127', styleName: 'text-center' }, // 판매자
    { fieldName: 'wrpBlg', header: t('MSG_TXT_DOC_CRTR_BLG'), width: '127', styleName: 'text-center' }, // 작성자 소속
    { fieldName: 'fstRgstUsrId', header: t('MSG_TXT_DOC_CRTR_SBN'), width: '127', styleName: 'text-center' }, // 작성자 사번
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_DOC_CRTR'), width: '127', styleName: 'text-center' }, // 작성자
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_DRAT_DTM'), width: '160', styleName: 'text-center', datetimeFormat: 'datetime' }, // 작성일시
    { fieldName: 'cntrRcpFshDtm', header: t('MSG_TXT_RCP_DTM'), width: '160', styleName: 'text-center', datetimeFormat: 'datetime' }, // 접수일시
    { fieldName: 'istDuedt', header: t('MSG_TXT_IST_DUEDT'), width: '127', styleName: 'text-center', datetimeFormat: 'date' }, // 설치예정일
    { fieldName: 'slDt', header: t('MSG_TXT_DT_OF_SALE'), width: '127', styleName: 'text-center', datetimeFormat: 'date' }, // 매출일
    { fieldName: 'sellTpDtlNm', header: t('MSG_TXT_TYPE'), width: '127', styleName: 'text-center' }, // 판매유형
    { fieldName: 'svPdTpNm', header: t('MSG_TXT_USWY'), width: '127', styleName: 'text-center' }, // 용도명
    { fieldName: 'svPrd', header: t('MSG_TXT_CYCL'), width: '127', styleName: 'text-right' }, // 주기
    { fieldName: 'mchnChYn', header: t('MSG_TXT_MCHN_CH_YN'), width: '127', styleName: 'text-center' }, // 기기변경여부
    { fieldName: 'mchnChBfCd', header: t('MSG_TXT_MCHN_CH_BF_CD'), width: '127', styleName: 'text-center' }, // 기기변경(이전) 코드
    { fieldName: 'ensmRernt', header: t('MSG_TXT_ENSM_RERNT'), width: '127', styleName: 'text-center' }, // 임직원 재렌탈
    { fieldName: 'inqCstCd', header: t('MSG_TXT_INQ_CST_CD'), width: '127', styleName: 'text-center' }, // 문의고객코드
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  // view.displayOptions.selectionStyle = 'singleRow';

  view.onCellClicked = (g, clickData) => {
    if (clickData.cellType === 'data') {
      // Data Row Click시 checkbar toggle 적용
      view.checkRow(clickData.dataRow, !view.getCheckedItems().includes(clickData.dataRow));
    }
  };
});

// 상세내역-일시불(환경가전)
const initGrdDtlSpayEnvrElhmList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cntrPrgsStatNm' }, // 계약상태
    { fieldName: 'rcgvpKnm' }, // 이름(설치자명)
    { fieldName: 'istCralTno' }, // 휴대전화번호
    { fieldName: 'istCralLocaraTno' }, // 휴대지역전화번호
    { fieldName: 'istMexnoEncr' }, // 휴대전화국번호암호화
    { fieldName: 'istCralIdvTno' }, // 휴대개별전화번호
    { fieldName: 'istAdrZip' }, // 우편번호
    { fieldName: 'istAdr' }, // 설치처 정보
    { fieldName: 'istRnadr' }, // 기준주소
    { fieldName: 'istRdadr' }, // 상세주소
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'svPdTpCd' }, // 용도
    { fieldName: 'svPdTpNm' }, // 용도명
    { fieldName: 'svPrd' }, // 주기
    { fieldName: 'frisuAsPtrmN' }, // 무상개월 AS
    { fieldName: 'frisuBfsvcPtrmN' }, // 무상개월 BS
    { fieldName: 'fnlAmt', dataType: 'number' }, // 상품금액
    { fieldName: 'cntrAmt', dataType: 'number' }, // 계약금 총액
    { fieldName: 'cshStlmAmt', dataType: 'number' }, // 현금결제
    { fieldName: 'cardStlmAmt', dataType: 'number' }, // 카드결제
    { fieldName: 'crpUcAmt', dataType: 'number' }, // 법인미수
    { fieldName: 'istmPcamAmt', dataType: 'number' }, // 할부원금
    { fieldName: 'istmMcn' }, // 할부개월
    { fieldName: 'istmIntAmt', dataType: 'number' }, // 할부수수료
    { fieldName: 'mmIstmAmt', dataType: 'number' }, // 월납부액
    { fieldName: 'aftnDvCd' }, // 자동이체
    { fieldName: 'mshYn' }, // 멤버십여부
    { fieldName: 'mshSspcs' }, // 멤버십회비
    { fieldName: 'dpTpNm' }, // 멤버십자동이체
    { fieldName: 'mchnChYn' }, // 기기변경
    { fieldName: 'sellEvCd' }, // 행사코드
    { fieldName: 'sellEvNm' }, // 행사코드명
    { fieldName: 'alncmpCd' }, // 제휴사코드
    { fieldName: 'alncmpNm' }, // 제휴사코드명
    { fieldName: 'alncJAcN' }, // 제휴 구좌수
    { fieldName: 'alncCntrNo' }, // 제휴계좌번호
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '176', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '127', styleName: 'text-center' }, // 계약일련번호
    { fieldName: 'cntrPrgsStatNm', header: t('MSG_TXT_CNTR_STAT'), width: '92', styleName: 'text-center' }, // 계약상태
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_NAME'), width: '130', styleName: 'text-center' }, // 이름(설치자명)
    {
      fieldName: 'istCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '138',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { istCralLocaraTno: no1, istMexnoEncr: no2, istCralIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (!isEmpty(no1) && isEmpty(no2) && !isEmpty(no3)) {
          return `${no1}--${no3}`;
        }
        return isEmpty(no1) && isEmpty(no2) && isEmpty(no3) ? '' : `${no1}-${no2}-${no3}`;
      },
    }, // 설치정보-휴대전화번호
    { fieldName: 'istAdrZip', header: t('MSG_TXT_ZIP'), width: '130', styleName: 'text-center' }, // 우편번호
    { fieldName: 'istAdr', header: t('MSG_TXT_ISTLC_INF'), width: '388', styleName: 'text-left' }, // 설치처 정보
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-left' }, // 상품명
    { fieldName: 'svPdTpNm', header: t('MSG_TXT_USWY'), width: '127', styleName: 'text-center' }, // 용도명
    { fieldName: 'svPrd', header: t('MSG_TXT_CYCL'), width: '127', styleName: 'text-right' }, // 주기
    { fieldName: 'frisuAsPtrmN', header: t('MSG_TXT_FRISU_MCNT_AS'), width: '130', styleName: 'text-right' }, // 무상개월 AS
    { fieldName: 'frisuBfsvcPtrmN', header: t('MSG_TXT_FRISU_MCNT_BFSVC'), width: '130', styleName: 'text-right' }, // 무상개월 BS
    { fieldName: 'fnlAmt', header: t('MSG_TXT_PRDT_AMT'), width: '130', styleName: 'text-right' }, // 상품금액
    { fieldName: 'cntrAmt', header: t('MSG_TXT_CNTR_TOT_AMT'), width: '130', styleName: 'text-right' }, // 계약금 총액
    { fieldName: 'cshStlmAmt', header: t('MSG_TXT_CSH_STLM'), width: '130', styleName: 'text-right' }, // 현금결제
    { fieldName: 'cardStlmAmt', header: t('MSG_TXT_CARD_STLM'), width: '130', styleName: 'text-right' }, // 카드결제
    { fieldName: 'crpUcAmt', header: t('MSG_TXT_CRP_UC'), width: '130', styleName: 'text-right' }, // 법인미수
    { fieldName: 'istmPcamAmt', header: t('MSG_TXT_ISTM_PCAM'), width: '130', styleName: 'text-right' }, // 할부원금
    { fieldName: 'istmMcn', header: t('MSG_TXT_ISTM_MCNT'), width: '130', styleName: 'text-right' }, // 할부개월
    { fieldName: 'istmIntAmt', header: t('MSG_TXT_ISTM_FEE'), width: '130', styleName: 'text-right' }, // 할부수수료
    { fieldName: 'mmIstmAmt', header: t('MSG_TXT_MM_MPY_AMT'), width: '130', styleName: 'text-right' }, // 월납부액
    { fieldName: 'aftnDvCd', header: t('MSG_TXT_AUTO_FNT'), width: '130', styleName: 'text-center' }, // 자동이체
    { fieldName: 'mshYn', header: t('MSG_TXT_MSH_YN'), width: '130', styleName: 'text-center' }, // 멤버십여부
    { fieldName: 'mshSspcs', header: t('MSG_TXT_MEM_DUES'), width: '130', styleName: 'text-center' }, // 멤버십회비
    { fieldName: 'dpTpNm', header: t('MSG_TXT_SPP_INF'), width: '130', styleName: 'text-center' }, // 멤버십자동이체
    { fieldName: 'mchnChYn', header: t('MSG_TXT_MCHN_CH'), width: '130', styleName: 'text-center' }, // 기기변경
    { fieldName: 'sellEvNm', header: t('MSG_TXT_EV_CD'), width: '130', styleName: 'text-center' }, // 행사코드명
    { fieldName: 'alncmpNm', header: t('MSG_TXT_ALNCMP_CD'), width: '130', styleName: 'text-center' }, // 제휴사코드명
    { fieldName: 'alncJAcN', header: t('MSG_TXT_ALNC_ACCONTS_CNT'), width: '130', styleName: 'text-center' }, // 제휴 구좌수
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

// 상세내역-일시불(BH)
const initGrdDtlSpayBhList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cntrPrgsStatNm' }, // 계약상태
    { fieldName: 'rcgvpKnm' }, // 이름(설치자명)
    { fieldName: 'istCralTno' }, // 휴대전화번호
    { fieldName: 'istCralLocaraTno' }, // 휴대지역전화번호
    { fieldName: 'istMexnoEncr' }, // 휴대전화국번호암호화
    { fieldName: 'istCralIdvTno' }, // 휴대개별전화번호
    { fieldName: 'istAdrZip' }, // 우편번호
    { fieldName: 'istAdr' }, // 설치처 정보
    { fieldName: 'istRnadr' }, // 기준주소
    { fieldName: 'istRdadr' }, // 상세주소
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'fnlAmt', dataType: 'number' }, // 상품금액
    { fieldName: 'cntrAmt', dataType: 'number' }, // 계약금 총액
    { fieldName: 'istmPcamAmt', dataType: 'number' }, // 할부원금
    { fieldName: 'istmMcn' }, // 할부개월
    { fieldName: 'istmIntAmt', dataType: 'number' }, // 할부수수료
    { fieldName: 'mmIstmAmt', dataType: 'number' }, // 월납부액
    { fieldName: 'aftnDvCd' }, // 자동이체
    { fieldName: 'cttMoCn' }, // 요청사항
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '176', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '127', styleName: 'text-center' }, // 계약일련번호
    { fieldName: 'cntrPrgsStatNm', header: t('MSG_TXT_CNTR_STAT'), width: '92', styleName: 'text-center' }, // 계약상태
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_NAME'), width: '130', styleName: 'text-center' }, // 이름(설치자명)
    {
      fieldName: 'istCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '138',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { istCralLocaraTno: no1, istMexnoEncr: no2, istCralIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (!isEmpty(no1) && isEmpty(no2) && !isEmpty(no3)) {
          return `${no1}--${no3}`;
        }
        return isEmpty(no1) && isEmpty(no2) && isEmpty(no3) ? '' : `${no1}-${no2}-${no3}`;
      },
    }, // 설치정보-휴대전화번호
    { fieldName: 'istAdrZip', header: t('MSG_TXT_ZIP'), width: '130', styleName: 'text-center' }, // 우편번호
    { fieldName: 'istAdr', header: t('MSG_TXT_ISTLC_INF'), width: '388', styleName: 'text-left' }, // 설치처 정보
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-left' }, // 상품명
    { fieldName: 'fnlAmt', header: t('MSG_TXT_PRDT_AMT'), width: '130', styleName: 'text-right' }, // 상품금액
    { fieldName: 'cntrAmt', header: t('MSG_TXT_CNTR_TOT_AMT'), width: '130', styleName: 'text-right' }, // 계약금 총액
    { fieldName: 'istmPcamAmt', header: t('MSG_TXT_ISTM_PCAM'), width: '130', styleName: 'text-right' }, // 할부원금
    { fieldName: 'istmMcn', header: t('MSG_TXT_ISTM_MCNT'), width: '130', styleName: 'text-right' }, // 할부개월
    { fieldName: 'istmIntAmt', header: t('MSG_TXT_ISTM_FEE'), width: '130', styleName: 'text-right' }, // 할부수수료
    { fieldName: 'mmIstmAmt', header: t('MSG_TXT_MM_MPY_AMT'), width: '130', styleName: 'text-right' }, // 월납부액
    { fieldName: 'aftnDvCd', header: t('MSG_TXT_AUTO_FNT'), width: '130', styleName: 'text-center' }, // 자동이체
    { fieldName: 'cttMoCn', header: t('MSG_TXT_RQMT'), width: '130', styleName: 'text-left' }, // 요청사항
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

// 상세내역-렌탈
const initGrdDtlRntlList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cntrPrgsStatNm' }, // 계약상태
    { fieldName: 'rcgvpKnm' }, // 이름(설치자명)
    { fieldName: 'istCralTno' }, // 휴대전화번호
    { fieldName: 'istCralLocaraTno' }, // 휴대지역전화번호
    { fieldName: 'istMexnoEncr' }, // 휴대전화국번호암호화
    { fieldName: 'istCralIdvTno' }, // 휴대개별전화번호
    { fieldName: 'istAdrZip' }, // 우편번호
    { fieldName: 'istAdr' }, // 설치처 정보
    { fieldName: 'istRnadr' }, // 기준주소
    { fieldName: 'istRdadr' }, // 상세주소
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'sellDscDvCd' }, // 판매할인구분코드
    { fieldName: 'sellDscDvNm' }, // 판매할인구분코드명
    { fieldName: 'sellDscTpCd' }, // 판매할인유형코드
    { fieldName: 'sellDscTpNm' }, // 판매할인유형코드명
    { fieldName: 'svPdTpCd' }, // 용도
    { fieldName: 'svPdTpNm' }, // 용도명
    { fieldName: 'svPrd' }, // 주기
    { fieldName: 'pdBaseAmt', dataType: 'number' }, // 렌탈료(기본약정)
    { fieldName: 'sellAmt', dataType: 'number' }, // 할인적용가격
    { fieldName: 'sellEvCd' }, // 행사코드
    { fieldName: 'sellEvNm' }, // 행사코드명
    { fieldName: 'alncmpCd' }, // 제휴사코드
    { fieldName: 'alncmpNm' }, // 제휴사코드명
    { fieldName: 'mchnChYn' }, // 기기변경
    { fieldName: 'pmotCd' }, // 할인유형(프로모션코드)
    { fieldName: 'pmotNm' }, // 할인유형(프로모션코드명)
    { fieldName: 'aftnDvCd' }, // 자동이체
    { fieldName: 'prmYn' }, // 선납여부
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '176', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '127', styleName: 'text-center' }, // 계약일련번호
    { fieldName: 'cntrPrgsStatNm', header: t('MSG_TXT_CNTR_STAT'), width: '92', styleName: 'text-center' }, // 계약상태
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_NAME'), width: '130', styleName: 'text-center' }, // 이름(설치자명)
    {
      fieldName: 'istCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '138',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { istCralLocaraTno: no1, istMexnoEncr: no2, istCralIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (!isEmpty(no1) && isEmpty(no2) && !isEmpty(no3)) {
          return `${no1}--${no3}`;
        }
        return isEmpty(no1) && isEmpty(no2) && isEmpty(no3) ? '' : `${no1}-${no2}-${no3}`;
      },
    }, // 설치정보-휴대전화번호
    { fieldName: 'istAdrZip', header: t('MSG_TXT_ZIP'), width: '130', styleName: 'text-center' }, // 우편번호
    { fieldName: 'istAdr', header: t('MSG_TXT_ISTLC_INF'), width: '388', styleName: 'text-left' }, // 설치처 정보
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-left' }, // 상품명
    { fieldName: 'sellDscDvNm', header: ' ', width: '130', styleName: 'text-center' }, // 판매할인구분코드명
    { fieldName: 'sellDscTpNm', header: ' ', width: '130', styleName: 'text-center' }, // 판매할인유형코드명
    { fieldName: 'svPdTpNm', header: t('MSG_TXT_USWY'), width: '127', styleName: 'text-center' }, // 용도명
    { fieldName: 'svPrd', header: t('MSG_TXT_CYCL'), width: '127', styleName: 'text-right' }, // 주기
    { fieldName: 'pdBaseAmt', header: t('MSG_TXT_RTLFE_BAS_STPL'), width: '130', styleName: 'text-right' }, // 렌탈료(기본약정)
    { fieldName: 'sellAmt', header: t('MSG_TXT_DIS_APP_PRC'), width: '130', styleName: 'text-right' }, // 할인적용가격
    { fieldName: 'sellEvNm', header: t('MSG_TXT_EV_CD'), width: '130', styleName: 'text-center' }, // 행사코드명
    { fieldName: 'alncmpNm', header: t('MSG_TXT_ALNCMP_CD'), width: '130', styleName: 'text-center' }, // 제휴사코드명
    { fieldName: 'mchnChYn', header: t('MSG_TXT_MCHN_CH'), width: '130', styleName: 'text-center' }, // 기기변경
    { fieldName: 'pmotNm', header: t('MSG_TXT_DISC_CODE'), width: '130', styleName: 'text-center' }, // 할인유형(프로모션코드)
    { fieldName: 'aftnDvCd', header: t('MSG_TXT_AUTO_FNT'), width: '130', styleName: 'text-center' }, // 자동이체
    { fieldName: 'prmYn', header: t('MSG_TXT_PRE_PAY'), width: '130', styleName: 'text-center' }, // 선납여부
  ];

  const layout = [
    'cntrNo', 'cntrSn', 'cntrPrgsStatNm', 'rcgvpKnm', 'istCralTno', 'istAdrZip', 'istAdr', 'pdNm',
    {
      header: t('MSG_TXT_TYPE'), // colspan title
      direction: 'horizontal', // merge type
      headerSpan: 2,
      items: ['sellDscDvNm', 'sellDscTpNm'],
    },
    'svPdTpNm', 'svPrd', 'pdBaseAmt', 'sellAmt', 'sellEvNm', 'alncmpNm', 'mchnChYn', 'pmotNm', 'aftnDvCd', 'prmYn',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(layout);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

// 상세내역-멤버십
const initGrdDtlMshList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cntrPrgsStatNm' }, // 계약상태
    { fieldName: 'rcgvpKnm' }, // 이름(설치자명)
    { fieldName: 'istCralTno' }, // 휴대전화번호
    { fieldName: 'istCralLocaraTno' }, // 휴대지역전화번호
    { fieldName: 'istMexnoEncr' }, // 휴대전화국번호암호화
    { fieldName: 'istCralIdvTno' }, // 휴대개별전화번호
    { fieldName: 'istAdrZip' }, // 우편번호
    { fieldName: 'istAdr' }, // 설치처 정보
    { fieldName: 'istRnadr' }, // 기준주소
    { fieldName: 'istRdadr' }, // 상세주소
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'mshSspcs', dataType: 'number' }, // 멤버십회비
    { fieldName: 'aftnDvCd' }, // 자동이체
    { fieldName: 'prmYn' }, // 선납여부
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '176', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '127', styleName: 'text-center' }, // 계약일련번호
    { fieldName: 'cntrPrgsStatNm', header: t('MSG_TXT_CNTR_STAT'), width: '92', styleName: 'text-center' }, // 계약상태
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_NAME'), width: '130', styleName: 'text-center' }, // 이름(설치자명)
    {
      fieldName: 'istCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '138',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { istCralLocaraTno: no1, istMexnoEncr: no2, istCralIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (!isEmpty(no1) && isEmpty(no2) && !isEmpty(no3)) {
          return `${no1}--${no3}`;
        }
        return isEmpty(no1) && isEmpty(no2) && isEmpty(no3) ? '' : `${no1}-${no2}-${no3}`;
      },
    }, // 설치정보-휴대전화번호
    { fieldName: 'istAdrZip', header: t('MSG_TXT_ZIP'), width: '130', styleName: 'text-center' }, // 우편번호
    { fieldName: 'istAdr', header: t('MSG_TXT_ISTLC_INF'), width: '388', styleName: 'text-left' }, // 설치처 정보
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-left' }, // 상품명
    { fieldName: 'mshSspcs', header: t('MSG_TXT_MEM_DUES'), width: '130', styleName: 'text-right' }, // 멤버십회비
    { fieldName: 'aftnDvCd', header: t('MSG_TXT_AUTO_FNT'), width: '130', styleName: 'text-right' }, // 자동이체
    { fieldName: 'prmYn', header: t('MSG_TXT_PRE_PAY'), width: '130', styleName: 'text-center' }, // 선납여부
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

// 상세내역-홈케어서비스
const initGrdDtlHcrSvcList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cntrPrgsStatNm' }, // 계약상태
    { fieldName: 'rcgvpKnm' }, // 이름(설치자명)
    { fieldName: 'istCralTno' }, // 휴대전화번호
    { fieldName: 'istCralLocaraTno' }, // 휴대지역전화번호
    { fieldName: 'istMexnoEncr' }, // 휴대전화국번호암호화
    { fieldName: 'istCralIdvTno' }, // 휴대개별전화번호
    { fieldName: 'istAdrZip' }, // 우편번호
    { fieldName: 'istAdr' }, // 방문 정보
    { fieldName: 'istRnadr' }, // 기준주소
    { fieldName: 'istRdadr' }, // 상세주소
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'sellAmt', dataType: 'number' }, // 판매금액
    { fieldName: 'prdtAdtlInfo1' }, // 상품추가정보1
    { fieldName: 'prdtAdtlInfo2' }, // 상품추가정보2
    { fieldName: 'bdtMnftCoCd' }, // 제조사 코드
    { fieldName: 'bdtMnftCoNm' }, // 제조사명
    { fieldName: 'aftnDvCd' }, // 자동이체
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '176', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '127', styleName: 'text-center' }, // 계약일련번호
    { fieldName: 'cntrPrgsStatNm', header: t('MSG_TXT_CNTR_STAT'), width: '92', styleName: 'text-center' }, // 계약상태
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_NAME'), width: '130', styleName: 'text-center' }, // 이름(설치자명)
    {
      fieldName: 'istCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '138',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { istCralLocaraTno: no1, istMexnoEncr: no2, istCralIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (!isEmpty(no1) && isEmpty(no2) && !isEmpty(no3)) {
          return `${no1}--${no3}`;
        }
        return isEmpty(no1) && isEmpty(no2) && isEmpty(no3) ? '' : `${no1}-${no2}-${no3}`;
      },
    }, // 설치정보-휴대전화번호
    { fieldName: 'istAdrZip', header: t('MSG_TXT_ZIP'), width: '130', styleName: 'text-center' }, // 우편번호
    { fieldName: 'istAdr', header: t('MSG_TXT_ISTLC_INF'), width: '388', styleName: 'text-left' }, // 설치처 정보
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-left' }, // 상품명
    { fieldName: 'sellAmt', header: t('MSG_TXT_SALE_PRICE'), width: '130', styleName: 'text-right' }, // 판매금액
    { fieldName: 'prdtAdtlInfo1', header: `${t('MSG_TXT_ADD_INFO')}1`, width: '200', styleName: 'text-left' }, // 상품추가정보1
    { fieldName: 'prdtAdtlInfo2', header: `${t('MSG_TXT_ADD_INFO')}2`, width: '200', styleName: 'text-left' }, // 상품추가정보2
    { fieldName: 'bdtMnftCoNm', header: t('MSG_TXT_MAKER'), width: '130', styleName: 'text-center' }, // 제조사명
    { fieldName: 'aftnDvCd', header: t('MSG_TXT_AUTO_FNT'), width: '130', styleName: 'text-center' }, // 자동이체
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

// 상세내역-모종일시불
const initGrdDtlSdingSpayList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cntrPrgsStatNm' }, // 계약상태
    { fieldName: 'rcgvpKnm' }, // 이름(설치자명)
    { fieldName: 'istCralTno' }, // 휴대전화번호
    { fieldName: 'istCralLocaraTno' }, // 휴대지역전화번호
    { fieldName: 'istMexnoEncr' }, // 휴대전화국번호암호화
    { fieldName: 'istCralIdvTno' }, // 휴대개별전화번호
    { fieldName: 'istAdrZip' }, // 우편번호
    { fieldName: 'istAdr' }, // 배송 정보
    { fieldName: 'istRnadr' }, // 기준주소
    { fieldName: 'istRdadr' }, // 상세주소
    { fieldName: 'rglrSppMchnTpNm' }, // 기기종류
    { fieldName: 'wellsFarmCntrDtlNo' }, // 웰스팜 계약상세번호
    { fieldName: 'cntrwTpNm' }, // 계약유형
    { fieldName: 'prchsTpNm' }, // 구매유형
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'pdQty' }, // 수량
    { fieldName: 'sellAmt', dataType: 'number' }, // 판매금액
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '176', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '127', styleName: 'text-center' }, // 계약일련번호
    { fieldName: 'cntrPrgsStatNm', header: t('MSG_TXT_CNTR_STAT'), width: '92', styleName: 'text-center' }, // 계약상태
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_NAME'), width: '130', styleName: 'text-center' }, // 이름(설치자명)
    {
      fieldName: 'istCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '138',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { istCralLocaraTno: no1, istMexnoEncr: no2, istCralIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (!isEmpty(no1) && isEmpty(no2) && !isEmpty(no3)) {
          return `${no1}--${no3}`;
        }
        return isEmpty(no1) && isEmpty(no2) && isEmpty(no3) ? '' : `${no1}-${no2}-${no3}`;
      },
    }, // 설치정보-휴대전화번호
    { fieldName: 'istAdrZip', header: t('MSG_TXT_ZIP'), width: '130', styleName: 'text-center' }, // 우편번호
    { fieldName: 'istAdr', header: t('MSG_TXT_SPP_INF'), width: '388', styleName: 'text-left' }, // 배송 정보
    { fieldName: 'rglrSppMchnTpNm', header: t('MSG_TXT_MCHN_KND'), width: '92', styleName: 'text-center' }, // 기기종류
    { fieldName: 'wellsFarmCntrDtlNo', header: t('MSG_TXT_WELLS_FARM_CNTR_DTL_NO'), width: '165', styleName: 'text-center' }, // 웰스팜 계약상세번호
    { fieldName: 'cntrwTpNm', header: t('MSG_TXT_CONTR_TYPE'), width: '125', styleName: 'text-center' }, // 계약유형
    { fieldName: 'prchsTpNm', header: t('MSG_TXT_PRCHS_TP'), width: '125', styleName: 'text-center' }, // 구매유형
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-left' }, // 상품명
    { fieldName: 'pdQty', header: t('MSG_TXT_QTY'), width: '92', styleName: 'text-right' }, // 수량
    { fieldName: 'sellAmt', header: t('MSG_TXT_SALE_PRICE'), width: '130', styleName: 'text-right' }, // 판매금액
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

// 상세내역-정기배송
const initGrdDtlRglrSppList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cntrPrgsStatNm' }, // 계약상태
    { fieldName: 'rcgvpKnm' }, // 이름(설치자명)
    { fieldName: 'istCralTno' }, // 휴대전화번호
    { fieldName: 'istCralLocaraTno' }, // 휴대지역전화번호
    { fieldName: 'istMexnoEncr' }, // 휴대전화국번호암호화
    { fieldName: 'istCralIdvTno' }, // 휴대개별전화번호
    { fieldName: 'istAdrZip' }, // 우편번호
    { fieldName: 'istAdr' }, // 배송 정보
    { fieldName: 'istRnadr' }, // 기준주소
    { fieldName: 'istRdadr' }, // 상세주소
    { fieldName: 'rglrSppMchnTpNm' }, // 기기종류
    { fieldName: 'cntrwTpNm' }, // 계약유형
    { fieldName: 'prchsTpNm' }, // 구매유형
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'pdQty' }, // 수량
    { fieldName: 'sellAmt', dataType: 'number' }, // 판매금액
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '176', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '127', styleName: 'text-center' }, // 계약일련번호
    { fieldName: 'cntrPrgsStatNm', header: t('MSG_TXT_CNTR_STAT'), width: '92', styleName: 'text-center' }, // 계약상태
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_NAME'), width: '130', styleName: 'text-center' }, // 이름(설치자명)
    {
      fieldName: 'istCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '138',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { istCralLocaraTno: no1, istMexnoEncr: no2, istCralIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (!isEmpty(no1) && isEmpty(no2) && !isEmpty(no3)) {
          return `${no1}--${no3}`;
        }
        return isEmpty(no1) && isEmpty(no2) && isEmpty(no3) ? '' : `${no1}-${no2}-${no3}`;
      },
    }, // 설치정보-휴대전화번호
    { fieldName: 'istAdrZip', header: t('MSG_TXT_ZIP'), width: '130', styleName: 'text-center' }, // 우편번호
    { fieldName: 'istAdr', header: t('MSG_TXT_SPP_INF'), width: '388', styleName: 'text-left' }, // 배송 정보
    { fieldName: 'rglrSppMchnTpNm', header: t('MSG_TXT_MCHN_KND'), width: '92', styleName: 'text-center' }, // 기기종류
    { fieldName: 'cntrwTpNm', header: t('MSG_TXT_CONTR_TYPE'), width: '125', styleName: 'text-center' }, // 계약유형
    { fieldName: 'prchsTpNm', header: t('MSG_TXT_PRCHS_TP'), width: '125', styleName: 'text-center' }, // 구매유형
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-left' }, // 상품명
    { fieldName: 'pdQty', header: t('MSG_TXT_QTY'), width: '92', styleName: 'text-right' }, // 수량
    { fieldName: 'sellAmt', header: t('MSG_TXT_SALE_PRICE'), width: '130', styleName: 'text-right' }, // 판매금액
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

// 상세내역-장기할부
const initGrdDtlLtmIstmList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cntrPrgsStatNm' }, // 계약상태
    { fieldName: 'rcgvpKnm' }, // 이름(설치자명)
    { fieldName: 'istCralTno' }, // 휴대전화번호
    { fieldName: 'istCralLocaraTno' }, // 휴대지역전화번호
    { fieldName: 'istMexnoEncr' }, // 휴대전화국번호암호화
    { fieldName: 'istCralIdvTno' }, // 휴대개별전화번호
    { fieldName: 'istAdrZip' }, // 우편번호
    { fieldName: 'istAdr' }, // 설치처 정보
    { fieldName: 'istRnadr' }, // 기준주소
    { fieldName: 'istRdadr' }, // 상세주소
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'sellDscDvCd' }, // 판매할인구분코드
    { fieldName: 'sellDscDvNm' }, // 판매할인구분코드명
    { fieldName: 'sellDscTpCd' }, // 판매할인유형코드
    { fieldName: 'sellDscTpNm' }, // 판매할인유형코드명
    { fieldName: 'svPdTpCd' }, // 용도
    { fieldName: 'svPdTpNm' }, // 용도명
    { fieldName: 'svPrd' }, // 주기
    { fieldName: 'pdBaseAmt', dataType: 'number' }, // 렌탈료(기본약정)
    { fieldName: 'sellAmt', dataType: 'number' }, // 할인적용가격
    { fieldName: 'sellEvCd' }, // 행사코드
    { fieldName: 'sellEvNm' }, // 행사코드명
    { fieldName: 'alncmpCd' }, // 제휴사코드
    { fieldName: 'alncmpNm' }, // 제휴사코드명
    { fieldName: 'mchnChYn' }, // 기기변경
    { fieldName: 'pmotCd' }, // 할인유형(프로모션코드)
    { fieldName: 'pmotNm' }, // 할인유형(프로모션코드명)
    { fieldName: 'aftnDvCd' }, // 자동이체
    { fieldName: 'prmYn' }, // 선납여부
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '176', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '127', styleName: 'text-center' }, // 계약일련번호
    { fieldName: 'cntrPrgsStatNm', header: t('MSG_TXT_CNTR_STAT'), width: '92', styleName: 'text-center' }, // 계약상태
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_NAME'), width: '130', styleName: 'text-center' }, // 이름(설치자명)
    {
      fieldName: 'istCralTno',
      header: t('MSG_TXT_MPNO'),
      width: '138',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { istCralLocaraTno: no1, istMexnoEncr: no2, istCralIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (!isEmpty(no1) && isEmpty(no2) && !isEmpty(no3)) {
          return `${no1}--${no3}`;
        }
        return isEmpty(no1) && isEmpty(no2) && isEmpty(no3) ? '' : `${no1}-${no2}-${no3}`;
      },
    }, // 설치정보-휴대전화번호
    { fieldName: 'istAdrZip', header: t('MSG_TXT_ZIP'), width: '130', styleName: 'text-center' }, // 우편번호
    { fieldName: 'istAdr', header: t('MSG_TXT_ISTLC_INF'), width: '388', styleName: 'text-left' }, // 설치처 정보
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '200', styleName: 'text-left' }, // 상품명
    { fieldName: 'sellEvNm', header: t('MSG_TXT_TYPE'), width: '130', styleName: 'text-center' }, // 판매할인구분코드명
    { fieldName: 'alncmpNm', header: t('MSG_TXT_TYPE'), width: '130', styleName: 'text-center' }, // 판매할인유형코드명
    { fieldName: 'svPdTpNm', header: t('MSG_TXT_USWY'), width: '127', styleName: 'text-center' }, // 용도명
    { fieldName: 'svPrd', header: t('MSG_TXT_CYCL'), width: '127', styleName: 'text-center' }, // 주기
    { fieldName: 'pdBaseAmt', header: t('MSG_TXT_RTLFE_BAS_STPL'), width: '130', styleName: 'text-right' }, // 렌탈료(기본약정)
    { fieldName: 'sellAmt', header: t('MSG_TXT_DIS_APP_PRC'), width: '130', styleName: 'text-right' }, // 할인적용가격
    { fieldName: 'sellEvNm', header: t('MSG_TXT_EV_CD'), width: '130', styleName: 'text-center' }, // 행사코드명
    { fieldName: 'alncmpNm', header: t('MSG_TXT_ALNCMP_CD'), width: '130', styleName: 'text-center' }, // 제휴사코드명
    { fieldName: 'mchnChYn', header: t('MSG_TXT_MCHN_CH'), width: '130', styleName: 'text-center' }, // 기기변경
    { fieldName: 'pmotNm', header: t('MSG_TXT_DISC_CODE'), width: '130', styleName: 'text-center' }, // 할인유형(프로모션코드)
    { fieldName: 'aftnDvCd', header: t('MSG_TXT_AUTO_FNT'), width: '130', styleName: 'text-center' }, // 자동이체
    { fieldName: 'prmYn', header: t('MSG_TXT_PRE_PAY'), width: '130', styleName: 'text-left' }, // 선납여부
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});
</script>
<style lang="scss">
.select_og_cd {
  min-width: 185.96px;
  max-width: 33% !important;
}
</style>
