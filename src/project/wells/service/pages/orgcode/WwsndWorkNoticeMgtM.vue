<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SND
2. 프로그램 ID : [W-SV-U-0217M01] WwsndWorkNoticeMgtM - 작업 공지사항
3. 작성자 : KJ
4. 작성일 : 2022.12.08
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 작업공지 관리 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_REG_PERIOD')"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.stRgstDt"
            v-model:to="searchParams.edRgstDt"
            :name="$t('MSG_TXT_REG_PERIOD')"
            rules="date_range_required"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_MNGT_DV')"
        >
          <kw-select
            v-model="searchParams.mngrDvCd"
            :options="codes.MNGR_DV_CD"
            first-option="all"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_TTL')"
        >
          <kw-input
            v-model="searchParams.ntccnTitNm"
            :maxlength="300"
            :placeholder="$t('MSG_TXT_ENTER_SOMETHING', [$t('MSG_TXT_TTL')])"
          />
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
            @change="getWorkNoticePages"
          />
        </template>
        <kw-btn
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          icon="download_on"
          dense
          secondary
          @click="onClickExportView"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_RGST')"
          primary
          dense
          @click="onClickWorkNoticeRegBtn"
        />
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
        @change="getWorkNoticePages"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import {
  codeUtil,
  defineGrid,
  getComponentType,
  gridUtil,
  stringUtil,
  useDataService,
  useGlobal,
  useMeta,
} from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { modal } = useGlobal();
const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const { currentRoute } = useRouter();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// 그리드 객체
const grdMainRef = ref(getComponentType('KwGrid'));

// 공통코드
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'MNGR_DV_CD',
  'PD_GRP_CD',
);

// 조회조건
const searchParams = ref({
  stRgstDt: '',
  edRgstDt: '',
  mngrDvCd: '',
  ntccnTitNm: '',
});

// 페이징 객체
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 조회조건 캐시
let cachedParams;

// 조회기간 초기 셋팅
searchParams.value.stRgstDt = dayjs().add(-7, 'day').format('YYYYMMDD');
searchParams.value.edRgstDt = dayjs().add(7, 'day').format('YYYYMMDD');

// 조회 REST API
async function fetchWorkNoticePages(params) {
  return await dataService.get('/sms/wells/service/work-notices/paging', params);
}

// 조회(페이징)
async function getWorkNoticePages() {
  const res = await fetchWorkNoticePages({ params: { ...cachedParams, ...pageInfo.value } });
  const { list: workNotices, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(workNotices);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
  view.resetCurrent();
}

// 조회버튼 클릭 이벤트
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await getWorkNoticePages();
}

// 엑셀다운로드
async function onClickExportView() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/work-notices', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// 등록버튼 클릭 이벤트
async function onClickWorkNoticeRegBtn() {
  const { result } = await modal({
    component: 'WwsndWorkNoticeRegP',
  });
  if (result) await onClickSearch();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'mngtYm' },
    { fieldName: 'ntcId' },
    { fieldName: 'ntcSn' },
    { fieldName: 'pdGrpCd' },
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'istWkYn' },
    { fieldName: 'asWkYn' },
    { fieldName: 'bfsvcWkYn' },
    { fieldName: 'mngrDvCd' },
    { fieldName: 'ntccnTitNm' },
    { fieldName: 'ntccnCn' },
    { fieldName: 'vlStrtdt' },
    { fieldName: 'vlEnddt' },
    { fieldName: 'fstRgstDtm' },
    { fieldName: 'fstRgstUsrId' },
    { fieldName: 'fstRgstUsrNm' },
  ];

  const columns = [
    {
      fieldName: 'fstRgstDtm',
      header: t('MSG_TXT_FST_RGST_DT'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        return stringUtil.getDateFormat(value);
      },
    },
    {
      fieldName: 'ntccnTitNm',
      header: t('MSG_TXT_TTL'),
      width: '539',
    },
    {
      fieldName: 'pdNm',
      header: t('MSG_TXT_MDL_NM'),
      width: '350',
      displayCallback(grid, index, value) {
        const pdCd = grid.getValue(index.itemIndex, 'pdCd');
        if (isEmpty(pdCd)) {
          const pdGrpCd = grid.getValue(index.itemIndex, 'pdGrpCd');
          if (isEmpty(pdGrpCd)) {
            return t('MSG_TXT_ALL');
          }
          return codes.PD_GRP_CD.find((obj) => obj.codeId === grid.getValue(index.itemIndex, 'pdGrpCd')).codeName;
        }

        return isEmpty(value) ? pdCd : value;
      },
    },
    {
      fieldName: 'vlStrtdt',
      name: 'vlPeriod',
      header: t('MSG_TXT_NOTICE_PERIOD'),
      width: '200',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        const vlStrtdt = stringUtil.getDateFormat(value);
        const vlEnddt = stringUtil.getDateFormat(grid.getValue(index.itemIndex, 'vlEnddt'));
        return `${vlStrtdt} ~ ${vlEnddt}`;
      },
    },
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_FST_RGST_USR'), width: '100', styleName: 'text-center' },
    {
      fieldName: 'istWkYn',
      name: 'workType',
      header: t('MSG_TXT_WORK_TYPE'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        const tWk = value;
        const asWk = grid.getValue(index.itemIndex, 'asWkYn');
        const bsWk = grid.getValue(index.itemIndex, 'bfsvcWkYn');

        const rtn = [];
        if (tWk === '1') {
          rtn.push(t('MSG_TXT_INSTALLATION'));
        }
        if (asWk === '1') {
          rtn.push(t('MSG_TXT_AFTER_SERVICE'));
        }
        if (bsWk === '1') {
          rtn.push(t('MSG_TXT_BEFORE_SERVICE'));
        }

        return rtn.join(', ');
      },
    },
  ];

  const layouts = [
    'fstRgstDtm',
    'ntccnTitNm',
    'pdNm',
    'vlPeriod',
    'fstRgstUsrNm',
    'workType',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(layouts);

  view.rowIndicator.visible = true;

  // 그리드 더블클릭 이벤트
  view.onCellDblClicked = async (g, { dataRow }) => {
    const { mngtYm, ntcId, ntcSn } = gridUtil.getRowValue(g, dataRow);
    const { result } = await modal({
      component: 'WwsndWorkNoticeRegP',
      componentProps: { mngtYm, ntcId, ntcSn },
    });
    if (result) await getWorkNoticePages();
  };
});

</script>
