<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC
 2. 프로그램 ID : [K-W-SV-U-0310M01] WwsnbServiceCancelPresentStateM - 서비스 취소 현황
 3. 작성자 : gs.piit231
 4. 작성일 : 2023.10.17
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
  -
 ****************************************************************************************************
--->
<template>
  <kw-page ref="pageRef">
    <template #header>
      <kw-page-header
        :options="['홈','서비스','방문현황', '서비스 취소 현황']"
      />
    </template>
    <kw-search
      :cols="4"
      @search="onClickSearch"
      @reset="onClickReset"
    >
      <kw-search-row>
        <!-- 서비스유형 -->
        <kw-search-item :label="$t('MSG_TXT_SV_TP')">
          <kw-select
            v-model="searchParams.serviceType"
            :options="serviceTypes"
            first-option="all"
            first-option-value=""
          />
        </kw-search-item>
        <!-- 서비스센터 -->
        <kw-search-item :label="$t('MSG_TXT_SV_CNR')">
          <kw-select
            v-model="searchParams.serviceCenter"
            :options="serviceCenterList"
            option-value="ogId"
            option-label="ogCdNm"
            first-option="all"
            first-option-value=""
          />
        </kw-search-item>
        <!-- 엔지니어 -->
        <kw-search-item :label="$t('MSG_TXT_EGER')">
          <kw-select
            v-model="searchParams.engineer"
            :options="engineerList"
            option-value="prtnrNo"
            option-label="prtnrNoNm"
            first-option="all"
            first-option-value=""
          />
        </kw-search-item>
        <!-- 작업상태 -->
        <kw-search-item :label="$t('MSG_TXT_WK_STS')">
          <kw-select
            v-model="searchParams.wkPrgsStatCd"
            :options="codes.WK_PRGS_STAT_CD"
            first-option="all"
            first-option-value=""
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 상품그룹 -->
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRP')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.pdGrpCd"
            :options="codes.PD_GRP_CD"
            first-option="all"
            first-option-value=""
            @change="changePdGrpCd"
          />
          <kw-select
            v-model="searchParams.pdCd"
            :options="pds"
            first-option="select"
            option-label="cdNm"
            option-value="cd"
            :disable="searchParams.pdGrpCd === ''"
          />
        </kw-search-item>
        <!-- 취소원인 -->
        <kw-search-item :label="$t('MSG_TXT_CAN_CAUS')">
          <kw-select
            v-model="searchParams.canCaus"
            :options="causCdList"
            first-option="all"
            first-option-value=""
            @change="onChangeCausCd"
          />
        </kw-search-item>
        <!-- 취소사유 -->
        <kw-search-item :label="$t('MSG_TXT_CAN_RSON')">
          <kw-select
            v-model="searchParams.canRson"
            :options="causRsonList"
            first-option="all"
            first-option-value=""
          />
          <!-- <kw-select
            :model-value="[]"
            :options="['전체',
                       '설치취소',
                       '상품변경',
                       '설치거부',
                       '설치보류',
                       '고객-일정변경',
                       '정상동작',
                       '자가처리',
                       '방문거부',
                       '서비스거부',
                       '판매자요청',
                       '계약내용변경',
                       '연락두절',
                       '엔지니어-일정변경',
                       '고객정보오류',
                       '접수오류',
                       '유관팀요청',
                       '결품',
                       '철거방어',
                       '판매권유',
                       '통화처리',
                       'BS동시처리',
                       '공간부족',
                       '도기교체필요',
                       '동파우려',
                       '배수불가',
                       '수압-고',
                       '수압-변동',
                       '수압-저',
                       '수전노후',
                       '수전없음',
                       '원수-차단불가',
                       '원수-지하수',
                       '원수-오염',
                       '용도부적합',
                       '유량미달',
                       '전기공사필요',
                       '타공불가',
                       '튜빙작업불가',
                       '설치불가지역(섬,해외등)',
                       '기타']"
          /> -->
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 조회기준 -->
        <kw-search-item
          :label="$t('MSG_TXT_INQR_BASE')"
          :colspan="3"
        >
          <kw-select
            v-model="searchParams.selectDiv"
            :options="selectDate"
            class="w200"
          />
          <kw-date-range-picker
            v-model:from="searchParams.fromDate"
            v-model:to="searchParams.toDate"
            rules="date_range_months:1"
          />
          <kw-option-group
            v-model="checkType"
            type="checkbox"
            :options="checkOption"
          />
        </kw-search-item>
        <!-- 상세내역필터링 -->
        <kw-search-item :label="$t('MSG_TXT_DTL') + $t('MSG_TXT_IZ') + $t('MSG_TXT_FLTRING')">
          <kw-input
            v-model="searchParams.dtlIzFltring"
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
            @change="fetchData"
          />
        </template>
        <!-- 저장 -->
        <kw-btn
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 인쇄 -->
        <kw-btn
          icon="print"
          dense
          secondary
          :label="$t('MSG_BTN_PRTG')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickPrintEl"
        />
        <!-- 엑셀 다운로드 -->
        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrid"
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
import { useDataService, codeUtil, useMeta, getComponentType, gridUtil, modal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';
import smsCommon from '~sms-wells/service/composables/useSnCode';
import { printElement } from '~common/utils/common';

const { t } = useI18n();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const { getPartMaster } = smsCommon();

const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'PD_GRP_CD', // 상품그룹코드
  'WK_PRGS_STAT_CD', // 작업상태
  'WK_CAN_CAUS_CD', // 취소원인
  'RCP_CAN_RSON_CD', // 취소사유
  'COD_PAGE_SIZE_OPTIONS',
);

// 서비스유형
const serviceTypes = [
  { codeId: '1', codeName: '설치' },
  { codeId: '2', codeName: 'A/S' },
  { codeId: '3', codeName: '홈케어' },
  { codeId: '9', codeName: '홈쇼핑설치만' },
  { codeId: '10', codeName: '리콜' },
];

// 조회기준 : 01.접수일자, 02.예정일자, 03.처리일자, 04.방문확정일
const selectDate = [
  { codeId: '01', codeName: t('MSG_TXT_RCPDT') },
  { codeId: '02', codeName: t('MSG_TXT_SCHD_DT') },
  { codeId: '03', codeName: t('MSG_TXT_PRCSDT') },
  { codeId: '04', codeName: t('MSG_TXT_VST_CNFM_D') },
];

// 서비스센터
const serviceCenterList = ref((await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } })).data);

// 엔지니어
const engineerList = ref((await dataService.get('/sms/wells/service/organizations/engineer', { params: { authYn: 'N' } })).data);

// 취소원인
const causCdList = codes.WK_CAN_CAUS_CD.filter((v) => ['M1', 'M3', 'N1', 'O1', 'O3', 'P1', 'P3'].includes(v.codeId));

// 취소사유
const causRsonList = ref(codes.RCP_CAN_RSON_CD);

// 책임지역
const locaraCds = ref((await dataService.get('/sms/wells/service/responsible-area-codes/locaraCds')).data);

// 조회_체크구분
const checkType = ref([]); // 조회_체크구분
const checkOption = ref([
  { codeId: 1, codeName: t('물류처리 건 제외') }, // 물류처리 건 제외
  { codeId: 2, codeName: t('택배발송 제외') }, // 택배발송 제외
]);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  serviceType: '', // 서비스유형
  serviceCenter: '', // 서비스센터
  engineer: '', // 엔지니어
  pdGrpCd: '', // 상품그룹코드
  pdCd: '', // 상품코드
  wkPrgsStatCd: '', // 작업상태
  canCaus: '', // 취소원인
  canRson: '', // 취소사유
  selectDiv: '01', // 조회일자 구분
  fromDate: dayjs().subtract(0, 'month').startOf('month').format('YYYYMMDD'), // 조회시작일
  toDate: dayjs().subtract(0, 'month').endOf('day').format('YYYYMMDD'), // 조회종료일
  lgstProcsCtYn: '', // 물류처리 건 제외 여부
  pcsvFwYn: '', // 택배발송 제외 여부
  dtlIzFltring: '', // 상세내역필터링
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// 상품 코드 setting
const pds = ref([]);
async function changePdGrpCd() {
  if (searchParams.value.pdGrpCd) {
    pds.value = await getPartMaster(
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
      'X', /* 단종여부Y/N, 만약 X로 데이터가 유입되면 단종여부를 조회하지 않음 */
    );
  } else pds.value = [];
  searchParams.value.pdCd = '';
}

// 취소원인 변경 event
async function onChangeCausCd() {
  causRsonList.value = codes.RCP_CAN_RSON_CD.filter((v) => v.codeId.substring(0, 2) === searchParams.value.canCaus);
}

// 조회 및 그리드 setting
async function fetchData() {
  console.log('fetchData  >>>', cachedParams);
  const res = await dataService.get('/sms/wells/service/service-cancel-ps/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list, pageInfo: pagingResult } = res.data;
  console.log('list >>>>>>', list);

  pageInfo.value = pagingResult;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(list);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 조회
async function onClickSearch() {
  searchParams.value.lgstProcsCtYn = '';
  searchParams.value.pcsvFwYn = '';
  if (checkType.value[0] === 1 || checkType.value[1] === 1) {
    searchParams.value.lgstProcsCtYn = 'Y';
  }
  if (checkType.value[0] === 2 || checkType.value[1] === 2) {
    searchParams.value.pcsvFwYn = 'Y';
  }

  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 초기화
async function onClickReset() {
  causRsonList.value = codes.RCP_CAN_RSON_CD;
}

// 저장
async function onClickSave() {
  console.log('onClickSave START');
}

// 인쇄
const pageRef = ref();
async function onClickPrintEl() {
  printElement(pageRef);
}

// 엑셀다운로드
async function onClickExcelDownload() {
  console.log('fetchData  >>>', cachedParams);
  const view = grdMainRef.value.getView();

  const res = await dataService.get('/sms/wells/service/service-cancel-ps/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const columns = [
    { fieldName: 'cntrNoSn', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'text-center' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_IST_NM'), width: '80', styleName: 'text-center' }, // 설치자명
    { fieldName: 'pdGrpNm', header: t('MSG_TXT_PDGRP'), width: '140', styleName: 'text-center' }, // 상품군
    { fieldName: 'pdNm', header: t('TXT_MSG_MAT_PD_NM'), width: '200', styleName: 'text-left' }, // 제품명
    { // 휴대전화번호
      fieldName: 'cralTno',
      header: t('MSG_TXT_MPNO'),
      width: '120',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cralLocaraTno: no1, mexnoEncr: no2, cralIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (!isEmpty(no1) && isEmpty(no2) && !isEmpty(no3)) {
          return `${no1}--${no3}`;
        }
        return isEmpty(no1) && isEmpty(no2) && isEmpty(no3) ? '' : `${no1}-${no2}-${no3}`;
      },
    },
    { fieldName: 'newAdrZip', header: t('MSG_TXT_ZIP'), width: '80', styleName: 'text-center' }, // 우편번호
    { fieldName: 'radr', header: t('MSG_TXT_ADDR'), width: '200', styleName: 'text-left' }, // 주소
    { fieldName: 'gnrdv', header: t('MSG_TXT_MANAGEMENT_DEPARTMENT'), width: '120', styleName: 'text-center' }, // 총괄단
    { fieldName: 'rgrp', header: t('MSG_TXT_RGNL_GRP'), width: '120', styleName: 'text-center' }, // 지역단
    { fieldName: 'alncBzsCd', header: t('MSG_TXT_SV_TP'), width: '120', styleName: 'text-center' }, // 서비스유형
    { fieldName: 'svBizDclsfNm', header: t('MSG_TXT_SV_TP_DTL'), width: '120', styleName: 'text-center' }, // 서비스유형상세
    { fieldName: 'cnslMoCn', header: t('MSG_TXT_RCP_IZ'), width: '250', styleName: 'text-left' }, // 접수내역
    { fieldName: 'svCnrOgId', header: t('MSG_TXT_SV_CNR'), width: '130', styleName: 'text-center' }, // 서비스센터
    { // 책임지역
      fieldName: 'rpbLocaraCd',
      header: t('MSG_TXT_RPB_LOCARA'),
      width: '120',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { rpbLocaraCd } = grid.getValues(index.itemIndex);
        return locaraCds.value.filter((v) => v.rpbLocaraCd === rpbLocaraCd)[0].ctpvNm;
      },
    },
    { fieldName: 'prtnr', header: t('MSG_TXT_ICHR_EGER'), width: '130', styleName: 'text-center' }, // 담당엔지니어
    { fieldName: 'arvDtm', header: t('MSG_TXT_ARV'), width: '170', styleName: 'text-center' }, // 도착
    { fieldName: 'vstFshDtm', header: t('MSG_TXT_COMPLETE'), width: '170', styleName: 'text-center' }, // 완료
    { fieldName: 'wkPrgsStatNm', header: t('MSG_TXT_WK_STS'), width: '120', styleName: 'text-center' }, // 작업상태
    { fieldName: 'wkCanCaus', header: t('MSG_TXT_CAN_CAUS'), width: '120', styleName: 'text-center' }, // 취소원인
    { fieldName: 'rcpCanRson', header: t('MSG_TXT_CAN_RSON'), width: '150', styleName: 'text-center' }, // 취소사유
    { fieldName: 'wkCanMoCn', header: t('MSG_TXT_DTL_IZ'), width: '250', styleName: 'text-left' }, // 상세내역
    { // 사진
      fieldName: 'imgFile1',
      header: t('MSG_TXT_PHO'),
      width: '130',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { istImpPhoApnFileUid1 } = grid.getValues(index.itemIndex);
        const returnValue = !istImpPhoApnFileUid1 ? 1 : 0;
        return returnValue === 0 ? t('MSG_TXT_IMG_BRWS') : '';
      },
      styleCallback(grid, dataCell) {
        const { istImpPhoApnFileUid1 } = grid.getValues(dataCell.index.itemIndex);
        const returnValue = !istImpPhoApnFileUid1 ? 1 : 0;
        return returnValue === 0 ? { renderer: { type: 'button', hideWhenEmpty: false } } : '';
      },
    },
    { // 사진
      fieldName: 'imgFile2',
      header: t('MSG_TXT_PHO'),
      width: '130',
      styleName: 'text-center rg-button-default',
      displayCallback(grid, index) {
        const { istImpPhoApnFileUid2 } = grid.getValues(index.itemIndex);
        const returnValue = !istImpPhoApnFileUid2 ? 1 : 0;
        return returnValue === 0 ? t('MSG_TXT_IMG_BRWS') : '';
      },
      styleCallback(grid, dataCell) {
        const { istImpPhoApnFileUid2 } = grid.getValues(dataCell.index.itemIndex);
        const returnValue = !istImpPhoApnFileUid2 ? 1 : 0;
        return returnValue === 0 ? { renderer: { type: 'button', hideWhenEmpty: false } } : '';
      },
    },
    { // 사진
      fieldName: 'imgFile3',
      header: t('MSG_TXT_PHO'),
      width: '130',
      styleName: 'text-center rg-button-default',
      displayCallback(grid, index) {
        const { istImpPhoApnFileUid3 } = grid.getValues(index.itemIndex);
        const returnValue = !istImpPhoApnFileUid3 ? 1 : 0;
        return returnValue === 0 ? t('MSG_TXT_IMG_BRWS') : '';
      },
      styleCallback(grid, dataCell) {
        const { istImpPhoApnFileUid3 } = grid.getValues(dataCell.index.itemIndex);
        console.log('istImpPhoApnFileUid3 >>>', istImpPhoApnFileUid3);
        const returnValue = !istImpPhoApnFileUid3 ? 1 : 0;
        return returnValue === 0 ? { renderer: { type: 'button', hideWhenEmpty: false } } : '';
      },
    },
    { fieldName: 'unuitm', header: t('MSG_TXT_UNUITM'), width: '200', styleName: 'text-left' }, // 특이사항
    { fieldName: 'cntrNo', visible: false }, // 계약번호
    { fieldName: 'cntrSn', visible: false }, // 계약일련번호
    { fieldName: 'cralLocaraTno', visible: false }, // 휴대지역전화번호
    { fieldName: 'mexnoEncr', visible: false }, // 휴대전화국번호암호화
    { fieldName: 'cralIdvTno', visible: false }, // 휴대개별전화번호
    { fieldName: 'istImpPhoApnFileUid1', visible: false }, // 설치불가환경 이미지 1
    { fieldName: 'istImpPhoApnFileUid2', visible: false }, // 설치불가환경 이미지 2
    { fieldName: 'istImpPhoApnFileUid3', visible: false }, // 설치불가환경 이미지 3
    { fieldName: 'cstSvAsnNo', visible: false }, // 배정번호
  ];

  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.setFixedOptions({ colCount: 4 });

  view.setColumnLayout([
    'cntrNoSn',
    'cstKnm',
    'pdGrpNm',
    'pdNm',
    'cralTno',
    'newAdrZip',
    'radr',
    'gnrdv',
    'rgrp',
    'alncBzsCd',
    'svBizDclsfNm',
    'cnslMoCn',
    'svCnrOgId',
    'rpbLocaraCd',
    'prtnr',
    {
      header: '작업일시',
      direction: 'horizontal',
      items: ['arvDtm', 'vstFshDtm'],
    },
    'wkPrgsStatNm',
    'wkCanCaus',
    'rcpCanRson',
    'wkCanMoCn',
    'imgFile1',
    'imgFile2',
    'imgFile3',
    'unuitm',
  ]);

  view.onCellDblClicked = async (g, cData) => {
    console.log('cData.fieldName >>>>', cData.fieldName);
    if (cData.fieldName === 'imgFile1' || cData.fieldName === 'imgFile2' || cData.fieldName === 'imgFile3') {
      return false;
    }
    const { cntrNo, cntrSn, cstSvAsnNo } = g.getValues(cData.itemIndex);
    await modal({
      component: 'WwsnbServiceProcDetailListP',
      componentProps: {
        cntrNo,
        cntrSn,
        cstSvAsnNo,
      },
    });
  };

  view.onCellItemClicked = async (g, cData) => {
    const {
      istImpPhoApnFileUid1,
      istImpPhoApnFileUid2,
      istImpPhoApnFileUid3 } = g.getValues(cData.itemIndex);

    let fileUid;
    if (cData.fieldName === 'imgFile1') {
      fileUid = istImpPhoApnFileUid1;
    } else if (cData.fieldName === 'imgFile2') {
      fileUid = istImpPhoApnFileUid2;
    } else if (cData.fieldName === 'imgFile3') {
      fileUid = istImpPhoApnFileUid3;
    }
    await modal({
      component: 'ZwcmzImagePreviewP',
      componentProps: { files: [fileUid] }, // fileUid만 주면 됨
    });
  };
}
</script>
