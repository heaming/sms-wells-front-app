<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SND
2. 프로그램 ID : [W-SV-U-0204P01] WwsndHumanResourcesListP - 인사기본정보
3. 작성자 : KJ
4. 작성일 : 2022.12.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 인사기본정보 조회 팝업
****************************************************************************************************
--->
<template>
  <kw-popup class="kw-popup--3xl">
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ICHR_DV')"
          required
        >
          <kw-select
            v-model="searchParams.mngrDvCd"
            :options="codes.MNGR_DV_CD"
            :readonly="!isEmpty(props.mngrDvCd)"
            rules="required"
            @update:model-value="onChangeMngrDvCd"
          />
        </kw-search-item>
        <template v-if="isManagerSelected">
          <wwsn-manager-og-search-item-group
            v-model:dgr1-levl-og-id="searchParams.dgr1LevlOgId"
            v-model:dgr2-levl-og-id="searchParams.dgr2LevlOgId"
            v-model:dgr3-levl-og-id="searchParams.dgr3LevlOgId"
            v-model:dgr1-levl-og="searchParams.dgr1LevlOg"
            v-model:dgr2-levl-og="searchParams.dgr2LevlOg"
            v-model:dgr3-levl-og="searchParams.dgr3LevlOg"
            use-og-level="3"
            :use-partner="false"
            dgr1-levl-og-first-option="all"
            dgr2-levl-og-first-option="all"
            dgr3-levl-og-first-option="all"
            dgr1-levl-og-label="ogCdNm"
            dgr2-levl-og-label="ogCdNm"
            dgr3-levl-og-label="ogCdNm"
            :auth-yn="props.authYn"
            :dgr2-levl-og-always-search="props.authYn === 'Y'"
            :dgr3-levl-og-always-search="props.authYn === 'Y'"
          />
        </template>
        <template v-else>
          <wwsn-engineer-og-search-item-group
            v-model:dgr1-levl-og-id="searchParams.dgr1LevlOgId"
            use-og-level="1"
            :use-partner="false"
            dgr1-levl-og-first-option="all"
            dgr1-levl-og-label="ogCdNm"
            :auth-yn="props.authYn"
          />
          <kw-search-item
            :label="`${$t('MSG_TXT_EMPL_NM')}/${$t('MSG_TXT_EPNO')}`"
          >
            <kw-input
              v-model="searchParams.searchText"
              :maxlength="100"
              :placeholder="$t('MSG_TXT_ENTER_SOMETHING', [`${$t('MSG_TXT_EMPL_NM')}/${$t('MSG_TXT_EPNO')}`])"
            />
          </kw-search-item>
        </template>
      </kw-search-row>
      <kw-search-row
        v-if="isManagerSelected"
      >
        <kw-search-item
          :label="`${$t('MSG_TXT_EMPL_NM')}/${$t('MSG_TXT_EPNO')}`"
        >
          <kw-input
            v-model="searchParams.searchText"
            :maxlength="100"
            :placeholder="$t('MSG_TXT_ENTER_SOMETHING', [`${$t('MSG_TXT_EMPL_NM')}/${$t('MSG_TXT_EPNO')}`])"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change="getHumanResourcesPages"
        />
      </template>
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initGrdMain"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="getHumanResourcesPages"
    />
    <template
      v-if="isCheckbox"
      #action
    >
      <kw-btn
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickCancel"
      />
      <kw-btn
        :label="$t('MSG_BTN_SELT')"
        primary
        @click="onClickSelect"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useMeta, useModal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import { onMounted } from 'vue';
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';
import WwsnEngineerOgSearchItemGroup from '~sms-wells/service/components/WwsnEngineerOgSearchItemGroup.vue';

const { t } = useI18n();
const { getConfig } = useMeta();
const { cancel: onClickCancel, ok } = useModal();
const dataService = useDataService();

const props = defineProps({
  // 매니저구분(1:매니저, 2:엔지니어)
  mngrDvCd: { type: String, default: '' },
  // 1차레벨조직ID
  dgr1LevlOgId: { type: String, default: '' },
  // 2차레벨조직ID
  dgr2LevlOgId: { type: String, default: '' },
  // 3차레벨조직ID
  dgr3LevlOgId: { type: String, default: '' },
  // 검색어
  searchText: { type: String, default: '' },
  // 그리드 선택타입(checkbox, radio)
  checkType: { type: String, default: 'radio' },
  // auth
  authYn: { type: String, default: 'N' },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// 그리드 객체
const grdMainRef = ref(getComponentType('KwGrid'));

// 공통코드
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'MNGR_DV_CD',
  'MNGER_PSTN_CD',
  'EGER_ROL_CD',
);

// 페이징 객체
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 조회조건
const searchParams = ref({
  mngrDvCd: isEmpty(props.mngrDvCd) ? '1' : props.mngrDvCd,
  dgr1LevlOgId: props.dgr1LevlOgId,
  dgr2LevlOgId: props.dgr2LevlOgId,
  dgr3LevlOgId: props.dgr3LevlOgId,
  searchText: props.searchText,
  authYn: props.authYn,
  dgr1LevlOg: undefined,
  dgr2LevlOg: undefined,
  dgr3LevlOg: undefined,
});

// 조회조건 캐시
let cachedParams;

// 매니저 선택여부
const isManagerSelected = computed(() => searchParams.value.mngrDvCd === '1');
// 그리드 체크박스/라디오 구분
const isCheckbox = props.checkType === 'checkbox';

// 그리드 레이아웃
const layouts = computed(() => {
  if (isManagerSelected.value) {
    return [
      {
        header: t('MSG_TXT_BELONG_SOMETHING', [t('MSG_TXT_BRANCH')]),
        direction: 'horizontal',
        items: ['ogCd', 'ogNm1'],
      },
      'prtnrNo',
      'prtnrKnm',
      'pstnDvCd',
      'cntrDt',
      'cltnDt',
    ];
  }
  return [
    {
      header: t('MSG_TXT_BELONG_SOMETHING', [t('MSG_TXT_CENTER_DIVISION')]),
      direction: 'horizontal',
      items: ['ogCd', 'ogNm2'],
    },
    'prtnrNo',
    'prtnrKnm',
    'rolDvCd',
    'cntrDt',
    'cltnDt',
  ];
});

// 인사기본정보 조회 REST API
async function fetchHumanResourcesPages(params) {
  return await dataService.get('/sms/wells/service/human-resources/paging', params);
}

// 인사기본정보 조회
async function getHumanResourcesPages() {
  const res = await fetchHumanResourcesPages({ params: { ...cachedParams, ...pageInfo.value } });
  const { list: humanResources, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();

  view.setColumnLayout(layouts.value);
  view.getDataSource().setRows(humanResources);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  view.resetCurrent();
}

// 매니저구분 콤보 변경 이벤트
function onChangeMngrDvCd() {
  searchParams.value.dgr1LevlOgId = '';
  searchParams.value.dgr2LevlOgId = '';
  searchParams.value.dgr3LevlOgId = '';
  searchParams.value.searchText = '';
}

// 조회버튼 클릭 이벤트
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await getHumanResourcesPages();
}

// 그리드 클릭 이벤트
async function onClickSelect() {
  const view = grdMainRef.value.getView();
  const checked = gridUtil.getCheckedRowValues(view);
  // 선택한 row가 1 이상이면 리턴
  if (checked.length === 0) {
    await alert(t('MSG_ALT_NOT_SEL_ITEM'));
  } else {
    ok(checked);
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'baseYm' }, // 기준년월
    { fieldName: 'ogTpCd' }, // 조직유형코드
    { fieldName: 'prtnrNo' }, // 파트너번호
    { fieldName: 'prtnrClsfCd' }, // 파트너분류코드
    { fieldName: 'cikVal' }, // CI키값
    { fieldName: 'sfkVal' }, // 세이프키값
    { fieldName: 'copnDvCd' }, // 법인격구분코드
    { fieldName: 'lnfDvCd' }, // 내외국인구분코드
    { fieldName: 'prtnrKnm' }, // 파트너한글명
    { fieldName: 'prtnrEnm' }, // 파트너영문명
    { fieldName: 'ogId' }, // 조직ID
    { fieldName: 'ogCd' }, // 조직코드
    { fieldName: 'ogNm' }, // 조직명
    { fieldName: 'hmnrscDeptCd' }, // 인사부서코드
    { fieldName: 'hmnrscEmpno' }, // 인사사원번호
    { fieldName: 'sapDlpnrCd' }, // SAP거래처코드
    { fieldName: 'sapDlpnrDtlIzRfltDt' }, // SAP거래처상세내역반영일자
    { fieldName: 'wkGrpCd' }, // 작업그룹코드
    { fieldName: 'wkGrpNm' }, // 작업그룹명
    { fieldName: 'wkcrCd' }, // 작업조번호
    { fieldName: 'rcrtWrteDt' }, // 리쿠르팅작성일자
    { fieldName: 'fstCntrDt' }, // 최초계약일자
    { fieldName: 'fnlCltnDt' }, // 최종해약일자
    { fieldName: 'rcntrDt' }, // 재계약일자
    { fieldName: 'cltnDt' }, // 해약일자
    { fieldName: 'cntrDt' }, // 계약일자
    { fieldName: 'bzStatCd' }, // 사업상태코드
    { fieldName: 'prfmtDmtnDvCd' }, // 승진강등구분코드
    { fieldName: 'prfmtDt' }, // 승진일자
    { fieldName: 'dmtnDt' }, // 강등일자
    { fieldName: 'ccpsYn' }, // 겸직여부
    { fieldName: 'cltnChoYn' }, // 해약선택여부
    { fieldName: 'prrBizRgstYn' }, // 사전업무등록여부
    { fieldName: 'pstnDvCd' }, // 직급구분코드
    { fieldName: 'rsbDvCd' }, // 직책구분코드
    { fieldName: 'rolDvCd' }, // 직무구분코드
    { fieldName: 'prtnrGdCd' }, // 파트너등급코드
    { fieldName: 'perfExcdOjYn' }, // 실적제외대상여부
    { fieldName: 'rdsDsbExcdOjYn' }, // RDS지급제외대상여부
    { fieldName: 'hgrOgId' }, // 상위조직ID
    { fieldName: 'ogLevlDvCd' }, // 조직레벨구분코드
    { fieldName: 'ogAbbrNm' }, // 조직약어명
    { fieldName: 'vdtcrPdDvCd' }, // 화상교사상품구분코드
    { fieldName: 'cpsnDtrcOgCd' }, // 강제지국조직코드
    { fieldName: 'dtrcSbrncOgCd' }, // 지국지소조직코드
    { fieldName: 'sbrncYn' }, // 지소여부
    { fieldName: 'sbrncDvCd' }, // 지소구분코드
    { fieldName: 'opDt' }, // 개설일자
    { fieldName: 'cloYn' }, // 폐쇄여부
    { fieldName: 'cloDt' }, // 폐쇄일자
    { fieldName: 'hooOgTpCd' }, // 조직장조직유형코드
    { fieldName: 'hooPrtnrNo' }, // 조직장파트너번호
    { fieldName: 'hooPrtnrNm' }, // 조직장파트너명
    { fieldName: 'bizSpptPrtnrNo' }, // 업무지원파트너번호
    { fieldName: 'ogUpbrngPrtnrNo' }, // 조직육성파트너번호
    { fieldName: 'bldCd' }, // 빌딩코드
    { fieldName: 'bldNm' }, // 빌딩명
    { fieldName: 'dgr1LevlOgId' }, // 1차레벨조직ID
    { fieldName: 'dgr1LevlOgCd' }, // 1차레벨조직코드
    { fieldName: 'dgr1LevlOgNm' }, // 1차레벨조직명
    { fieldName: 'dgr1LevlDgPrtnrNo' }, // 1차레벨대표파트너번호
    { fieldName: 'dgr1LevlDgPrtnrNm' }, // 1차레벨대표파트너명
    { fieldName: 'dgr2LevlOgId' }, // 2차레벨조직ID
    { fieldName: 'dgr2LevlOgCd' }, // 2차레벨조직코드
    { fieldName: 'dgr2LevlOgNm' }, // 2차레벨조직명
    { fieldName: 'dgr2LevlDgPrtnrNo' }, // 2차레벨대표파트너번호
    { fieldName: 'dgr2LevlDgPrtnrNm' }, // 2차레벨대표파트너명
    { fieldName: 'dgr3LevlOgId' }, // 3차레벨조직ID
    { fieldName: 'dgr3LevlOgCd' }, // 3차레벨조직코드
    { fieldName: 'dgr3LevlOgNm' }, // 3차레벨조직명
    { fieldName: 'dgr3LevlDgPrtnrNo' }, // 3차레벨대표파트너번호
    { fieldName: 'dgr3LevlDgPrtnrNm' }, // 3차레벨대표파트너명
    { fieldName: 'dgr4LevlOgId' }, // 4차레벨조직ID
    { fieldName: 'dgr4LevlOgCd' }, // 4차레벨조직코드
    { fieldName: 'dgr4LevlOgNm' }, // 4차레벨조직명
    { fieldName: 'dgr4LevlDgPrtnrNo' }, // 4차레벨대표파트너번호
    { fieldName: 'dgr4LevlDgPrtnrNm' }, // 4차레벨대표파트너명
    { fieldName: 'dgr5LevlOgId' }, // 5차레벨조직ID
    { fieldName: 'dgr5LevlOgCd' }, // 5차레벨조직코드
    { fieldName: 'dgr5LevlOgNm' }, // 5차레벨조직명
    { fieldName: 'dgr5LevlDgPrtnrNo' }, // 5차레벨대표파트너번호
    { fieldName: 'dgr5LevlDgPrtnrNm' }, // 5차레벨대표파트너명
  ];

  const columns = [
    { fieldName: 'ogCd', header: t('MSG_TXT_CODE'), width: '100', styleName: 'text-center' },
    { name: 'ogNm1', fieldName: 'ogNm', header: t('MSG_TXT_SOMETHING_NAME', [t('MSG_TXT_BRANCH')]), width: '250', styleName: 'text-left' },
    { name: 'ogNm2', fieldName: 'ogNm', header: t('MSG_TXT_SOMETHING_NAME', [t('MSG_TXT_CENTER_DIVISION')]), width: '250', styleName: 'text-left' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_EPNO'), width: '150', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'pstnDvCd', header: t('MSG_TXT_CRLV'), options: codes.MNGER_PSTN_CD, width: '117', styleName: 'text-center' },
    { fieldName: 'rolDvCd', header: t('MSG_TXT_ROLE_1'), options: codes.EGER_ROL_CD, width: '150', styleName: 'text-center' },
    { fieldName: 'cntrDt', header: t('MSG_TXT_SOMETHING_DATE', [t('MSG_TXT_ENTCO')]), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cltnDt', header: t('MSG_TXT_SOMETHING_DATE', [t('MSG_TXT_RSGN')]), width: '150', styleName: 'text-center', datetimeFormat: 'date' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(layouts.value);

  view.checkBar.visible = isCheckbox;
  view.rowIndicator.visible = true;

  if (isCheckbox) {
    // 셀 클릭 시
    view.onCellClicked = (grid, clickData) => {
      if (clickData.cellType === 'data') {
        grid.checkItem(clickData.itemIndex, !grid.isCheckedItem(clickData.itemIndex));
      }
    };
  } else {
    // 셀 더블클릭 시
    view.onCellDblClicked = (grid, clickData) => {
      if (clickData.cellType === 'data') {
        ok([{ ...grid.getValues(clickData.itemIndex) }]);
      }
    };
  }
});

onMounted(async () => {
  if (!isEmpty(props.mngrDvCd) && !isEmpty(props.searchText)) await onClickSearch();
});
</script>
