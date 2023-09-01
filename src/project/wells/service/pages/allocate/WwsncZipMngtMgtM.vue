<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : [W-SV-U-0037M01] WwsncZoneImprovementProgramCodeMngtMgtM - 우편번호 관리
3. 작성자 : juno.cha
4. 작성일 : 2022.11.22
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 우편번호 관리 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="'우편번호'">
          <kw-input
            v-model="searchParams.zipFrom"
            :maxlength="5"
            :placeholder="'입력해주세요'"
            :regex="/^[0-9]*$/i"
            @blur="zipFromPad"
          />
          <span>~</span>
          <kw-input
            v-model="searchParams.zipTo"
            :maxlength="5"
            :placeholder="'입력해주세요'"
            :regex="/^[0-9]*$/i"
            @blur="zipToPad"
          />
        </kw-search-item>
        <kw-search-item :label="'주소'">
          <kw-select
            v-model="searchParams.ctpvCtctyEmdDvCd"
            class="w120"
            :options="customCodes.ADR_DV_ACD"
            first-option="all"
            first-option-value=""
          />
          <kw-input
            v-model="searchParams.ctpvCtctyEmdNm"
          />
        </kw-search-item>

        <kw-search-item :label="'관리구분'">
          <kw-select
            v-model="searchParams.mngrDvCd"
            :options="customCodes.MNGR_DV_CD"
            first-option="all"
            first-option-value=""
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="'급지'">
          <kw-select
            v-model="searchParams.mngerRglvlDvCd"
            :options="customCodes.MNGER_RGLVL_DV_CD"
            first-option="all"
            first-option-value=""
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
            @change="getZipAssignmentsPages"
          />
        </template>
        <kw-btn
          dense
          grid-action
          secondary
          :label="'저장'"
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          v-if="false"
          icon="print"
          dense
          secondary
          :label="'인쇄'"
        />
        <kw-btn
          icon="download_on"
          :disable="pageInfo.totalCount === 0"
          dense
          secondary
          :label="'엑셀 다운로드'"
          @click="onClickExcelDownload"
        />
      </kw-action-top>
      <kw-grid
        ref="gridMainRef"
        name="gridMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGridMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="getZipAssignmentsPages"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { notify, alert } = useGlobal();
const { t } = useI18n();
const { getConfig } = useMeta();
const dataService = useDataService();
const gridMainRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();

/*
 *  Search Parameter
 */
const searchParams = ref({
  zipFrom: '',
  zipTo: '',
  ctpvCtctyEmdDvCd: '',
  ctpvCtctyEmdNm: '',
  mngrDvCd: '',
  mngerRglvlDvCd: '',
});

/*
 *  조회조건 Combo를 위한 Custom Code setting
 */
const customCodes = {
  ADR_DV_ACD: [
    { codeId: 'A', codeName: '시/도' },
    { codeId: 'B', codeName: '시/군/구' },
    { codeId: 'C', codeName: '읍/면/동' },
  ],
  MNGR_DV_CD: [], // 관리구분
  LOCARA_VST_PRD_CD: [], // 방문주기
  MNGER_RGLVL_DV_CD: [], // 급지
  DGR_2_LEVL_OG: [], // 지역단
};

/*
 * 지역단 조회(Grid 콤보)
 */
async function getRegionalGroup() {
  const res = await dataService.get('/sms/wells/service/organizations/regional-group', { params: {
    ogId: '',
    authYn: 'N',
  } });
  customCodes.DGR_2_LEVL_OG = res.data;
}
await getRegionalGroup();

/*
 *  공통코드 조회
 *  (조회 후 후처리 - customCodes)
 */
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'MNGR_DV_CD', // 관리구분
  // 'ADR_DV_ACD',    // cherro ::: DEL_YN 이 'Y'라서 조회를 못함.
  'LOCARA_VST_PRD_CD', // 지역 방문 주기
  'MNGER_RGLVL_DV_CD', // 급지 구분
).then((value) => {
  // customCodes에 조회용 공통코드 deep copy
  customCodes.MNGR_DV_CD = cloneDeep(value.MNGR_DV_CD);
  customCodes.LOCARA_VST_PRD_CD = cloneDeep(value.LOCARA_VST_PRD_CD);
  customCodes.MNGER_RGLVL_DV_CD = cloneDeep(value.MNGER_RGLVL_DV_CD);

  // Binding 되지 않은 데이터를 조회하기 위한 dummy code setting
  customCodes.MNGR_DV_CD.unshift({ codeId: 'NOTMATCH', codeName: t('미지정') });
  customCodes.LOCARA_VST_PRD_CD.unshift({ codeId: 'NOTMATCH', codeName: t('없음') });
  customCodes.MNGER_RGLVL_DV_CD.unshift({ codeId: 'NOTMATCH', codeName: t('없음') });

  // Grid에 null code binding을 위한 dummy code setting
  value.LOCARA_VST_PRD_CD.unshift({ codeId: null, codeName: t('없음') });
  // value.MNGER_RGLVL_DV_CD.unshift({ codeId: null, codeName: t('없음') });

  return value;
});

/*
 *  Page Info setting
 */
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
/*
 *  Search - 우편번호 조회
 */
let cachedParams;
async function getZipAssignmentsPages(targetPage) {
  if (targetPage === 1) {
    pageInfo.value.pageIndex = 1;
  }

  const res = await dataService.get('/sms/wells/service/zip-assignments/paging?', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: customers, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = gridMainRef.value.getView();
  view.getDataSource().setRows(customers);
  // view.resetCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

/*
 *  우편번호 From, To Validation check
 *  (2023.04.28 ::: 불필요한 Validation이라고 그렇게 말했지만 안통해서 반영하는 로직. 추후 삭제는 절대 없는 로직.)
 *  (이종욱 매니저, 이규하 프로)
 */
function isValidZip() {
  if (isEmpty(searchParams.value.zipFrom) || isEmpty(searchParams.value.zipTo)) {
    return true;
  }
  if (searchParams.value.zipFrom > searchParams.value.zipTo) {
    alert(t('MSG_TXT_ZIP_VALIDATE')); // 정확한 우편번호를 입력하세요.
    return false;
  }
  return true;
}
/*
 *  우편번호 조회조건 변경 시 5자리로 '0'을 Left Padding
 */
function zipPad(value) {
  if (value.length > 0) {
    return value.padStart(5, '0');
  }
}
async function zipFromPad() {
  searchParams.value.zipFrom = zipPad(searchParams.value.zipFrom);
  if (!isValidZip()) {
    searchParams.value.zipFrom = '';
  }
}
async function zipToPad() {
  searchParams.value.zipTo = zipPad(searchParams.value.zipTo);
  if (!isValidZip()) {
    searchParams.value.zipTo = '';
  }
}

/*
 *  Event - 조회 버튼 클릭
 */
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await getZipAssignmentsPages(1);
}

/*
 *  Event - 엑셀 다운로드 버튼 클릭
 */
async function onClickExcelDownload() {
  const view = gridMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/zip-assignments/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
  });
}

/*
 *  Event - 저장 버튼 클릭
 */
async function onClickSave() {
  const view = gridMainRef.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/service/zip-assignments', changedRows);

  await notify(t('MSG_ALT_SAVE_DATA'));
  await getZipAssignmentsPages(pageInfo.value.pageIndex);
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGridMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'newAdrZip' },
    { fieldName: 'chSn' },
    { fieldName: 'ctpvNm' },
    { fieldName: 'ctctyNm' },
    { fieldName: 'emdNm' },
    { fieldName: 'mngrDvCd' },
    { fieldName: 'brchOgId' },
    { fieldName: 'mngerRglvlDvCd' },
    { fieldName: 'fnlMdfcDtm' },
  ];

  const columns = [
    { fieldName: 'newAdrZip', header: '우편번호', width: '100', styleName: 'text-center', editable: false },
    {
      fieldName: 'emdNm',
      header: '주소',
      width: '350',
      styleName: 'text-center',
      editable: false,
      displayCallback(grid, index, value) {
        const ctpvNm = grid.getValue(index.itemIndex, 'ctpvNm') ?? '';
        const ctctyNm = grid.getValue(index.itemIndex, 'ctctyNm') ?? '';
        const emdNm = value ?? '';
        const div1 = (!isEmpty(ctpvNm) && !isEmpty(ctctyNm)) ? ' ' : '';
        const div2 = ((!isEmpty(ctpvNm) || !isEmpty(ctctyNm)) && !isEmpty(emdNm)) ? ' ' : '';

        return `${ctpvNm}${div1}${ctctyNm}${div2}${emdNm}`;
      },
    },
    { fieldName: 'mngrDvCd', header: '관리구분', width: '150', styleName: 'text-center', options: codes.MNGR_DV_CD, editor: { type: 'list' }, rules: 'required' },
    { fieldName: 'brchOgId',
      header: '지역단',
      width: '150',
      styleName: 'text-center',
      options: customCodes.DGR_2_LEVL_OG,
      optionValue: 'ogId',
      optionLabel: 'ogNm',
      editor: { type: 'list' },
    },
    { fieldName: 'mngerRglvlDvCd', header: '급지', width: '100', styleName: 'text-center', options: codes.MNGER_RGLVL_DV_CD, editor: { type: 'list' } },
    { fieldName: 'fnlMdfcDtm', header: '최종수정일자', width: '100', styleName: 'text-center', editable: false, datetimeFormat: 'datetime' },
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false; // create checkbox column
  view.rowIndicator.visible = true; // create number indicator column
  view.editOptions.editable = true; // Grid Editable On

  // multi row header setting
  view.setColumnLayout([
    'newAdrZip',
    'emdNm',
    'mngrDvCd',
    'brchOgId',
    'mngerRglvlDvCd', // 급지
    'fnlMdfcDtm', // 최종수정일자
  ]);
});

</script>
<style scoped>
</style>
