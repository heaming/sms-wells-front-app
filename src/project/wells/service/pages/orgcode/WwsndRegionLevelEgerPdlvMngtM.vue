<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNC
 2. 프로그램 ID : [K-W-SV-U-0309M01] WwsndRegionLevelEgerPdlvMngtM - 급지 엔지니어 출고지 관리
 3. 작성자 : gs.piit231
 4. 작성일 : 2023.10.05
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
  -
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈','depth1','depth2', '급지 엔지니어출고지관리']"
      />
    </template>
    <kw-search @search="onClickSearch">
      <kw-search-row>
        <!-- 조회일자 -->
        <kw-search-item :label="$t('MSG_TXT_SRCH_DT')">
          <kw-date-picker
            v-model="searchParams.inqrDt"
            rules="required"
          />
        </kw-search-item>
        <!--서비스센터-->
        <kw-search-item :label="$t('MSG_TXT_SV_CNR')">
          <kw-select
            v-model="searchParams.ogCd"
            :options="svcCode"
            first-option="all"
            option-label="ogNm"
            option-value="ogCd"
          />
        </kw-search-item>
        <!-- 승인여부 -->
        <kw-search-item :label="$t('MSG_TXT_APPR_STS')">
          <kw-option-group
            v-model="searchParams.fnitAprRsCd"
            :options="[{ codeId: 'Y', codeName: t('승인항목만 보기') },
                       { codeId: 'ALL', codeName: t('전체보기') }]"
            class="kw-option-group--multi-line"
            type="radio"
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
          v-permission:update
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
        <!-- label="엑셀 다운로드" -->
        <kw-btn
          icon="download_on"
          secondary
          dense
          :label="t('MSG_BTN_EXCEL_DOWN')"
          :disable="pageInfo.totalCount === 0"
          @click="onClickExcelDownload"
        />
        <!-- <kw-btn
          icon="download_on"
          secondary
          dense
          :label="t('MSG_BTN_EXCEL_DOWN')"
          :disable="isExcelDownloadChk"
          @click="onClickExcelDownload2"
        /> -->
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 승인 -->
        <kw-btn
          dense
          primary
          :disable="pageInfo.totalCount === 0"
          :label="t('MSG_BTN_APPR')"
          @click="onClickAppr"
        />
        <!-- <kw-btn
            v-if="isShowApprv"
            v-permission:update
            v-permission:create
            :label="t('MSG_BTN_APPR')"
            class="ml8"
            primary
            @click="onClickAppr"
          /> -->
      </kw-action-top>
      <kw-grid
        ref="grdRef"
        :visible-rows="10"
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
import { codeUtil, useDataService, useMeta, getComponentType, useGlobal, gridUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { notify } = useGlobal();
const { getConfig } = useMeta();

const dataService = useDataService();

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS', // 페이지 사이즈 옵션
  'CNTR_CH_PRGS_STAT_CD',
);
console.log('codes.CNTR_CH_PRGS_STAT_CD >>>', codes.CNTR_CH_PRGS_STAT_CD);

// 서비스센터 조회
const svcCode = (await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } })).data;
console.log('svcCode >>>', svcCode);

// 출고지 정보 조회
const pdlvList = (await dataService.get('/sms/wells/service/placeOfDelivery/pdlv-list')).data;
const pdlvRef = ref([]);
if (pdlvList) {
  pdlvList.forEach((data) => {
    pdlvRef.value.push({
      pdlvNo: data.pdlvNo,
      pdlvNm: data.pdlvNm,
      pdlvAdd: data.pdlvAdd,
    });
  });
}
console.log('pdlvRef >>>', pdlvRef);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
const searchParams = ref({
  inqrDt: dayjs().format('YYYYMMDD'),
  ogCd: '',
  fnitAprRsCd: 'Y',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const grdRef = ref(getComponentType('KwGrid'));

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/wsnd-rglvl-eger-pdlv-mngt/paging', { params: { ...cachedParams, ...pageInfo.value } });
  console.log('res.data >>>>', res.data);
  const { list, pageInfo: pagingResult } = res.data;
  pageInfo.value = pagingResult;

  const view = grdRef.value.getView();
  view.getDataSource().setRows(list);
  view.resetCurrent();
}

// 조회
async function onClickSearch() {
  console.log('onClickSearch START =========');
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 저장
async function onClickSave() {
  console.log('onClickSave START =========');
  const view = grdRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  console.log('onClickSave changedRows >>>', changedRows);

  await dataService.put('/sms/wells/service/wsnd-rglvl-eger-pdlv-mngt/save', changedRows);
  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

// 승인
async function onClickAppr() {
  console.log('onClickAppr START =========');
  const view = grdRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  console.log('onClickAppr changedRows >>>', changedRows);

  await dataService.put('/sms/wells/service/wsnd-rglvl-eger-pdlv-mngt/approval', changedRows);
  notify(t('MSG_ALT_APPROVED'));
  await onClickSearch();
}

// 엑셀다운로드
async function onClickExcelDownload() {
  const res = await dataService.get('/sms/wells/service/wsnd-rglvl-eger-pdlv-mngt/excel-download', searchParams.value);
  console.log('res.data >>>>>>', res.data);
}

// async function isEditable(grid, dataCell) {

// }

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const columns = [
    { fieldName: 'deptNm', header: t('MSG_TXT_SV_CNR'), width: '130', styleName: 'text-center', editable: false }, // 서비스센터..센터조직ID
    { fieldName: 'empId', header: t('MSG_TXT_EPNO'), width: '140', styleName: 'text-center', editable: false }, // 사번
    { fieldName: 'empNm', header: t('MSG_TXT_EMPL_NM'), width: '140', styleName: 'text-center', editable: false }, // 성명
    {
      fieldName: 'bsNm',
      header: t('기본출고지'),
      width: '170',
      styleName: 'text-center',
      editor: {
        type: 'list',
      },
      options: pdlvRef.value,
      optionValue: 'pdlvNo',
      optionLabel: 'pdlvNm',
      styleCallback(grid, dataCell) {
        const ret = {};
        const { cfrmYn, aprPrtnrNo } = grid.getValues(dataCell.index.itemIndex);
        if (cfrmYn === 'Y' && aprPrtnrNo) {
          ret.editable = false;
        } else {
          ret.editable = true;
        }
        return ret;
      },
    }, // 기본출고지
    { fieldName: 'bsAdd', header: t('기본출고지 주소'), width: '190', styleName: 'text-center', editable: false },
    { // 출장출고지
      fieldName: 'mvNm',
      header: t('출장출고지'),
      width: '190',
      styleName: 'text-center',
      editor: {
        type: 'list',
      },
      options: pdlvRef.value,
      optionValue: 'pdlvNo',
      optionLabel: 'pdlvNm',
      styleCallback(grid, dataCell) {
        const ret = {};
        const { cfrmYn, aprPrtnrNo } = grid.getValues(dataCell.index.itemIndex);
        if (cfrmYn === 'Y' && aprPrtnrNo) {
          ret.editable = false;
        } else {
          ret.editable = true;
        }
        return ret;
      },
    },
    { fieldName: 'mvAdd', header: t('출장출고지 주소'), width: '190', styleName: 'text-center', editable: false },
    { // 적용시작일
      fieldName: 'apldFr',
      header: {
        text: t('MSG_TXT_APY_STRT_DAY'),
      },
      width: '150',
      dataType: 'date',
      editor: {
        type: 'btdate',
      },
      datetimeFormat: 'date',
      styleName: 'text-center',
      styleCallback(grid, dataCell) {
        const ret = {};
        const { cfrmYn, aprPrtnrNo } = grid.getValues(dataCell.index.itemIndex);
        if (cfrmYn === 'Y' && aprPrtnrNo) {
          ret.editable = false;
        } else {
          ret.editable = true;
        }
        return ret;
      },
    },
    { // 적용종료일
      fieldName: 'apldTo',
      header: {
        text: t('MSG_TXT_APY_END_DAY'),
      },
      width: '150',
      dataType: 'date',
      editor: {
        type: 'btdate',
      },
      datetimeFormat: 'date',
      styleName: 'text-center',
      styleCallback(grid, dataCell) {
        const ret = {};
        const { cfrmYn, aprPrtnrNo } = grid.getValues(dataCell.index.itemIndex);
        if (cfrmYn === 'Y' && aprPrtnrNo) {
          ret.editable = false;
        } else {
          ret.editable = true;
        }
        return ret;
      },
    },
    { // 승인
      fieldName: 'cfrmYn',
      header: t('MSG_TXT_APPR'),
      width: '50',
      styleName: 'text-center',
      renderer: { type: 'check', trueValues: 'Y' },
      editable: false,
      styleCallback(grid, dataCell) {
        // const ret = {};
        const { cfrmYn } = grid.getValues(dataCell.index.itemIndex);
        console.log('cfrmYn >>>', cfrmYn);
        // return ret;
      },
    },
    { fieldName: 'cfrmEmpDeptNm', header: '승인팀명', width: '100', styleName: 'text-center', editable: false }, // 승인팀명
    { fieldName: 'aprPrtnrNo', header: '승인자사번', width: '80', styleName: 'text-center', editable: false }, // 승인자사번
    { fieldName: 'cfrmEmpNm', header: '승인자성명', width: '100', styleName: 'text-center', editable: false }, // 승인자성명
    { fieldName: 'bstrRsonCn', header: '출장사유', width: '200', styleName: 'text-center', editable: false }, // 출장사유
    { fieldName: 'chk', visible: false }, // 체크박스
    { fieldName: 'aprDt', visible: false }, // 승인일자
    { fieldName: 'aprHh', visible: false }, // 승인시간
    { fieldName: 'basicShpCd', visible: false }, // 기본출고지번호
    { fieldName: 'basicShp', visible: false }, // 기본출고지번호
    { fieldName: 'mvShpCd', visible: false }, // 출장출고지번호
    { fieldName: 'mngtSn', visible: false }, // 관리일련번호
    { fieldName: 'egerPrtnrOgTpCd', visible: false }, // 엔지니어파트너조직유형코드
  ];

  data.setFields(columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName })));
  view.setColumns(columns);

  view.editOptions.editable = true;
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  view.onGetEditValue = (grd, idx, editResult) => {
    // 적용시작일 변경시
    if (idx.fieldName === 'apldFr') {
      console.log('idx >>>', idx);
      console.log('editResult.value >>>', editResult.value);
      grd.checkItem(idx.itemIndex, true);
      grd.setValue(idx.dataRow, 'apldFr', editResult.value);
    }
    // 적용종료일 변경시
    if (idx.fieldName === 'apldTo') {
      grd.checkItem(idx.itemIndex, true);
      grd.setValue(idx.dataRow, 'apldTo', editResult.value);
    }
    // 기본출고지
    if (idx.fieldName === 'bsNm') {
      grd.checkItem(idx.itemIndex, true);
      grd.setValue(idx.dataRow, 'bsAdd', pdlvRef.value.filter((v) => v.pdlvNo === editResult.value)[0].pdlvAdd);
      grd.setValue(idx.dataRow, 'basicShpCd', editResult.value);
    }
    // 출장출고지
    if (idx.fieldName === 'mvNm') {
      grd.checkItem(idx.itemIndex, true);
      grd.setValue(idx.dataRow, 'mvAdd', pdlvRef.value.filter((v) => v.pdlvNo === editResult.value)[0].pdlvAdd);
      grd.setValue(idx.dataRow, 'mvShpCd', editResult.value);
    }
  };

  view.onCellEditable = (g, { column, itemIndex }) => {
    console.log('cfrmYn >>>>', g.getValues(itemIndex).cfrmYn);
    console.log('aprPrtnrNo >>>>', g.getValues(itemIndex).aprPrtnrNo);
    if (column === 'cfrmYn' && g.getValues(itemIndex).cfrmYn === 'Y' && !isEmpty(g.getValues(itemIndex).aprPrtnrNo)) {
      return false;
    }
    return true;
  };
}
</script>
