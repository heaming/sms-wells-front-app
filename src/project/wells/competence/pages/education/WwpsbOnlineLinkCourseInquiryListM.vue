<!--
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSB
2. 프로그램 ID : WwpsbOnlineLinkCourseInquiryListM
3. 작성자 : Park Yesol
4. 작성일 : 2023.07.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 온라인 연계 과정 조회
****************************************************************************************************
-->

<template>
  <kw-page>
    <kw-search
      ref="frmSearchRef"
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 조직유형 -->
        <kw-search-item
          :label="t('MSG_TXT_OG_TP')"
          required
        >
          <kw-select
            v-model="searchParams.ogTpCd"
            :label="t('MSG_TXT_OG_TP')"
            :options="ogTpCd"
            rules="required"
            first-option="select"
          />
        </kw-search-item>
        <kw-search-item
          :label="t('MSG_TXT_OG_LEVL')"
        >
          <zwog-level-select
            v-model:og-levl-dv-cd1="searchParams.ogLevlDvCd1"
            v-model:og-levl-dv-cd2="searchParams.ogLevlDvCd2"
            :og-tp-cd="searchParams.ogTpCd"
            :start-level="1"
            :end-level="2"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            icon="search"
            clearable
            :on-click-icon="onClickPrtnrSearch"
            :placeholder="$t('MSG_TXT_SEQUENCE_NUMBER')"
          />
          <kw-input
            v-model="searchParams.prtnrKnm"
            :placeholder="$t('MSG_TXT_EMPL_NM')"
            clearable
            readonly
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_EDUC_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.educSchdYm"
            :label="t('MSG_TXT_EDUC_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_EDUC_CRSE')"
        >
          <kw-select
            v-model="searchParams.educCrseId"
            first-option="all"
            use-input
            option-value="educCrseId"
            option-label="educNm"
            :options="atcLevelOptions"
            :label="$t('MSG_TXT_EDUC_CRSE')"
            @filter="filterFn"
            @change="changeEducDvCd"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_CPC_YN')"
        >
          <kw-select
            v-model="searchParams.educCpcAckmtYn"
            :label="$t('MSG_TXT_CPC_YN')"
            :options="codes.EDUC_CPC_YN"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <ul class="kw-notification">
        <li>
          온라인 수료 현황은 매일 오전 08시에 전산에 반영됩니다. ( 최종 온라인 수료 현황 업데이트 시간: YYYY-MM-DD HH:MM:SS )
        </li>
        <li>수료현황 업데이트 요청은 교육파트로 연락바랍니다.</li>
      </ul>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          />
        </template>
        <kw-btn
          v-permission:read
          icon="download_on"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          secondary
          dense
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-permission:create
          label="온라인 수료 현황 업데이트"
          primary
          dense
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        :visible-rows="10"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { useDataService, getComponentType, gridUtil, codeUtil, useMeta, defineGrid, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwogLevelSelect from '~sms-common/organization/components/ZwogLevelSelect.vue';
import { SMS_COMMON_URI } from '~sms-common/organization/constants/ogConst';

const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const { getUserInfo } = useMeta();
const userInfo = getUserInfo();
const { modal } = useGlobal();
const { currentRoute } = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const now = dayjs();
const ogTpCd = ref();
const educCrseList = ref({});
const atcLevelOptions = ref([]);
const grdMainRef = ref(getComponentType('KwGrid'));

// 공통코드로딩
const codes = await codeUtil.getMultiCodes(
  'OG_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'EDUC_CPC_YN',
);
ogTpCd.value = codes.OG_TP_CD.filter((v) => ['W01', 'W02', 'E01', 'E03'].includes(v.codeId));

const tempEduDv = [
  { educCrseId: 'MIG000000005171', educNm: '[온라인] 플래너 실전교육', educCrseNo: '127' },
  { educCrseId: 'MIG000000005208', educNm: '[온라인] 웰스매니저 보수교육', educCrseNo: '128' },
  { educCrseId: 'MIG000000005344', educNm: '[온라인] 지점장 교육', educCrseNo: '135' },
];

let cachedParams;
// 검색조건 Parameter
const searchParams = ref({
  ogTpCd: userInfo.ogTpCd, // 조직유형
  ogLevlDvCd1: '', // 사업단
  ogLevlDvCd2: '', // 총괄
  ogLevlDvCd3: '', // 센터
  ogLevlDvCd4: '', // 지국장
  educSchdYm: now.format('YYYYMM'), // 교육년월
  educDvCd: '60', // 온라인 고정
  prtnrNo: '',
  prtnrKnm: '',
  educCrseNo: '',
  educCrseId: '',
  educCrseTCnt: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const fetchData = async () => {
  const res = await dataService.get('/sms/wells/competence/online-link-course/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(list);
  view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
};

const onClickSearch = async () => {
  pageInfo.value.pageIndex = 1;
  // 자동완성 검색조건 설정
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
};

const onClickExcelDownload = async () => {
  const view = grdMainRef.value.getView();
  const response = await dataService.get('/sms/wells/competence/educations/online-link-course/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
};

const filterFn = async (val, update) => {
  update(() => {
    if (!isEmpty(val) && educCrseList.value.length > 0) {
      const needle = val.toLowerCase();
      // eslint-disable-next-line max-len
      atcLevelOptions.value = educCrseList.value.filter((v) => ((!isEmpty(v.educCrseCd) && v.educCrseCd.indexOf(needle) > -1) || (!isEmpty(v.educNm) && v.educNm.toLowerCase().indexOf(needle) > -1)));
    }
    if (isEmpty(val) && educCrseList.value.length > 0) {
      atcLevelOptions.value = educCrseList.value;
    }
  }, { immediate: true });
};
const initEducCrse = async () => {
  const result = await dataService.get(`${SMS_COMMON_URI}/competence/educations/education-ojps/education-course`, { params: searchParams.value });
  if (!isEmpty(result.data)) {
    educCrseList.value = result.data;
    atcLevelOptions.value = educCrseList.value;
  } else {
    educCrseList.value = tempEduDv;
    atcLevelOptions.value = educCrseList.value;
  }
};

// 조회영역 파트너조회
const onClickPrtnrSearch = async () => {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
      ogTpCd: userInfo.ogTpCd,
    },
  });

  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
    searchParams.value.prtnrKnm = payload.prtnrKnm;
  }
};

watch(() => [searchParams.value.ogTpCd, searchParams.value.educSchdYm], async () => {
  searchParams.value.educCrseId = '';
  searchParams.value.educCrseNo = '';
  educCrseList.value = [];
  atcLevelOptions.value = [];
  if (!isEmpty(searchParams.value.ogTpCd)) {
    await initEducCrse();
  }
});

const changeEducDvCd = async (educCrseId) => {
  if (!isEmpty(educCrseId)) {
    searchParams.value.educCrseNo = educCrseList.value.filter((v) => v.educCrseId === educCrseId)[0].educCrseNo;
  } else {
    searchParams.value.educCrseNo = '';
  }
  const view = grdMainRef.value.getView();
  view.columnByName('topmrPlarStmnt').visible = false;
  view.columnByName('ackmtCt').visible = false;
  view.columnByName('offlTcnt1').visible = false;
  view.columnByName('offlTcnt2').visible = false;
  view.columnByName('offlTcnt3').visible = false;
  view.columnByName('onlineTcnt').visible = false;
  view.columnByName('fnlCpcYn').visible = false;
  view.columnByName('fshBsAcc').visible = false;

  if (searchParams.value.educCrseNo === '127') {
    // multi row header setting
    view.setColumnLayout([
      'dgr2LevlOgNm', 'dgr3LevlOgNm', 'ogCd', 'prtnrNo', 'prtnrKnm', 'rsbDvNm', 'topmrPlarStmnt', 'ackmtCt',
      {
        header: t('MSG_TXT_PLAR_PRTIC_EDUC'), // colspan title
        direction: 'horizontal', // merge type
        items: ['offlTcnt1', 'offlTcnt2', 'offlTcnt3', 'onlineTcnt', 'fnlCpcYn'],
      },
    ]);
    view.columnByName('topmrPlarStmnt').visible = true;
    view.columnByName('ackmtCt').visible = true;
    view.columnByName('offlTcnt1').visible = true;
    view.columnByName('offlTcnt2').visible = true;
    view.columnByName('offlTcnt3').visible = true;
    view.columnByName('onlineTcnt').visible = true;
    view.columnByName('fnlCpcYn').visible = true;
  } else if (searchParams.value.educCrseNo === '128') {
    // multi row header setting
    view.setColumnLayout([
      'dgr2LevlOgNm', 'dgr3LevlOgNm', 'ogCd', 'prtnrNo', 'prtnrKnm', 'rsbDvNm', 'fshBsAcc', 'ackmtCt',
      {
        header: t('MSG_TXT_WELS_MNGER_CMPF_EDUC'), // colspan title
        direction: 'horizontal', // merge type
        items: ['offlTcnt1', 'onlineTcnt', 'fnlCpcYn'],
      },
    ]);
    view.columnByName('ackmtCt').visible = true;
    view.columnByName('offlTcnt1').visible = true;
    view.columnByName('offlTcnt2').visible = true;
    view.columnByName('offlTcnt3').visible = true;
    view.columnByName('onlineTcnt').visible = true;
    view.columnByName('fnlCpcYn').visible = true;
    view.columnByName('fshBsAcc').visible = true;
  } else if (searchParams.value.educCrseNo === '135') {
    view.setColumnLayout([
      'dgr2LevlOgNm', 'dgr3LevlOgNm', 'ogCd', 'prtnrNo', 'prtnrKnm', 'rsbDvNm', 'onlineTcnt', 'fnlCpcYn',
    ]);
    view.columnByName('onlineTcnt').visible = true;
    view.columnByName('fnlCpcYn').visible = true;
  }
};

onMounted(() => {
  initEducCrse();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dgr2LevlOgNm' },
    { fieldName: 'dgr3LevlOgNm' },
    { fieldName: 'ogCd' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'rsbDvNm' },
    { fieldName: 'topmrPlarStmnt' },
    { fieldName: 'ackmtCt' },
    { fieldName: 'offlTcnt1' },
    { fieldName: 'offlTcnt2' },
    { fieldName: 'offlTcnt3' },
    { fieldName: 'onlineTcnt' },
    { fieldName: 'fnlCpcYn' },
    { fieldName: 'fshBsAcc' },
  ];

  const columns = [
    { fieldName: 'dgr2LevlOgNm', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'dgr3LevlOgNm', header: t('MSG_TXT_RGNL_GRP'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'ogCd', header: t('MSG_TXT_BLG'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_EMPL_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'rsbDvNm', header: t('MSG_TXT_QLF'), width: '100', styleName: 'text-center', editable: false },
    { fieldName: 'topmrPlarStmnt', header: t('MSG_TXT_TOPMR_PLAR_STMNT'), width: '150', styleName: 'text-center', visible: false },
    { fieldName: 'fshBsAcc', header: t('MSG_TXT_FSH_BFSVC_ACC'), width: '150', styleName: 'text-center', visible: false },
    { fieldName: 'ackmtCt', header: t('MSG_TXT_PD_ACC_CNT'), width: '80', styleName: 'text-center', visible: false },
    { fieldName: 'offlTcnt1', header: t('MSG_TXT_OFFLINE_TCNT', [1]), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'offlTcnt2', header: t('MSG_TXT_OFFLINE_TCNT', [2]), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'offlTcnt3', header: t('MSG_TXT_OFFLINE_TCNT', [3]), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'onlineTcnt', header: t('MSG_TXT_ONLINE_COURSE', [5]), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'fnlCpcYn', header: t('MSG_TXT_FNL_CPC'), width: '100', styleName: 'text-center', visible: false },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
