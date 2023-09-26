<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : [W-SV-U-0284M01] WwsncCenterLocalAreaTransferMgtM - 센터지역 이관
3. 작성자 : juno.cha
4. 작성일 : 2023.01.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 센터지역 이관 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      v-permission:read
      :modified-targets="['gridMainRef']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('구분')"
          required
        >
          <kw-select
            v-model="searchParams.wareDvCd"
            :options="codes.WARE_DV_CD"
            disable
            rules="required"
          />
        </kw-search-item>

        <kw-search-item :label="$t('관리지역단')">
          <kw-select
            v-model="searchParams.wareAreaCd"
            :options="customCodes.DGR_2_LEVL_OG"
            option-value="ogId"
            option-label="ogCd"
            first-option="all"
          />
        </kw-search-item>

        <kw-search-item :label="$t('우편번호')">
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
      </kw-search-row>

      <kw-search-row>
        <kw-search-item
          :label="$t('이관사유')"
        >
          <kw-select
            v-model="searchParams.rsonCd"
            :options="codes.TF_AK_RSON_CD"
            first-option="all"
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
        </template>

        <kw-btn
          v-permission:update
          secondary
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          v-permission:update
          spaced
          vertical
          inset
        />
        <kw-btn
          v-if="false"
          v-permission:print
          icon="print"
          secondary
          :label="$t('인쇄')"
        />
        <kw-btn
          v-permission:download
          icon="download_on"
          :disable="totalCount === 0"
          secondary
          dense
          :label="$t('엑셀다운로드')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          v-permission:download
          spaced
          vertical
          inset
        />
        <kw-select
          v-model="gridParams.wareAreaCd"
          v-permission:update
          class="w200"
          :options="customCodes.DGR_2_LEVL_OG"
          option-value="ogId"
          option-label="ogCd"
          :placeholder="$t('이관지역단 선택')"
        />
        <kw-separator
          v-permission:update
          spaced
          vertical
          inset
        />
        <kw-select
          v-model="gridParams.rsonCd"
          v-permission:update
          class="w200"
          :options="codes.TF_AK_RSON_CD"
          :placeholder="$t('이관사유 선택')"
        />
        <kw-btn
          v-permission:update
          secondary
          :label="$t('이관지역단 일괄변경')"
          @click="onClickBatchUpdate"
        />
      </kw-action-top>
      <kw-grid
        ref="gridMainRef"
        name="gridMain"
        :page-size="codes.COD_PAGE_SIZE_OPTIONS.find((x) => x.codeId === '30').codeName"
        :total-count="totalCount"
        @init="initGrid"
      />
      <!-- <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="getCenterAreaPages"
      /> -->
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, defineGrid, getComponentType, gridUtil, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { notify, alert } = useGlobal();
const dataService = useDataService();
const gridMainRef = ref(getComponentType('KwGrid'));
const { currentRoute } = useRouter();
const totalCount = ref(0);

/*
 *  Search Parameter
 */
const searchParams = ref({
  wareDvCd: '3',
  wareAreaCd: '',
  zipFrom: '',
  zipTo: '',
  rsonCd: '',
});

/*
 *  Grid Parameter
 */
const gridParams = ref({
  wareAreaCd: '',
  rsonCd: '',
});

/*
 *  공통코드 조회
 *  (조회 후 후처리 - customCodes)
 */
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'WARE_DV_CD', // 관리구분(조회조건)
  'MNGR_DV_CD', // 관리구분(Grid)
  'TF_AK_RSON_CD', // 이관사유
);

/*
 *  Custom Code setting
 */
const customCodes = {
  WARE_AREA_CD: [
    { codeId: 'A', codeName: '북부서비스센터' },
    { codeId: 'B', codeName: 'B' },
    { codeId: 'C', codeName: 'C' },
  ], // 관리지역단
  DGR_2_LEVL_OG: [], // 지역단
};

/*
 * 지역단 조회 (Grid 콤보)
 */
async function getRegionalGroup() {
  const res = await dataService.get('/sms/wells/service/organizations/regional-group', { params: {
    ogId: '',
    authYn: 'N',
  } });
  customCodes.DGR_2_LEVL_OG = res.data;
}
await getRegionalGroup();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
/*
 *  Search - 센터지역 이관 조회
 */
let cachedParams;
async function getCenterAreaPages() {
  const res = await dataService.get('/sms/wells/service/center-areas', { params: cachedParams });
  const centerAreas = res.data;

  const view = gridMainRef.value.getView();
  view.getDataSource().setRows(centerAreas);
  totalCount.value = centerAreas.length;
  // view.resetCurrent(); //첫 행 selectRow 없앰.
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
 *  Grid Value 일괄 변경을 위한 function
 */
// function setGridValueForChecked(columnName, setValue) {
//   if (isEmpty(columnName)) {
//     return;
//   }
//   const view = gridMainRef.value.getView();
//   const data = view.getDataSource();
//   const checkedRows = gridUtil.getCheckedRowValues(view);

//   if (checkedRows.length === 0) {
//     alert(t('MSG_ALT_NO_CHECK_DATA')); // 선택된 데이터가 없습니다.
//     return;
//   }

//   for (let idx = 0; idx < checkedRows.length; idx += 1) {
//     // data.setValue(view.getDataRow(checkedRows[idx].dataRow), columnName, setValue);
//     data.setValue(checkedRows[idx].dataRow, columnName, setValue);
//   }
// }

/*
 *  이관지역단 일괄변경
 */
// function onClickSetWareAreaCd() {
//   setGridValueForChecked('mdfcBrchOgId', gridParams.value.wareAreaCd);
// }

/*
 *  이관사유 일괄변경
 */
// function onClickSetRsonCd() {
//   setGridValueForChecked('mdfcIchrLocaraCtrRsonCd', gridParams.value.rsonCd);
// }

/*
 *  Grid Value 일괄 변경을 위한 function
 */
function setGridValueForChecked() {
  const view = gridMainRef.value.getView();
  const data = view.getDataSource();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (checkedRows.length === 0) {
    alert(t('MSG_ALT_NO_CHECK_DATA')); // 선택된 데이터가 없습니다.
    return;
  }

  for (let idx = 0; idx < checkedRows.length; idx += 1) {
    data.setValue(checkedRows[idx].dataRow, 'mdfcBrchOgId', gridParams.value.wareAreaCd);
    data.setValue(checkedRows[idx].dataRow, 'mdfcIchrLocaraCtrRsonCd', gridParams.value.rsonCd);
  }
}

/*
 *  이관사유, 이관지역단 일괄변경
 */
function onClickBatchUpdate() {
  setGridValueForChecked();
}

/*
 *  Event - 조회 버튼 클릭
 */
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await getCenterAreaPages();
}

/*
 *  Event - 엑셀 다운로드 버튼 클릭
 */
async function onClickExcelDownload() {
  // const view = gridMainRef.value.getView();

  // await gridUtil.exportView(view, {
  //   fileName: 'center_area',
  //   timePostfix: false,
  // });
  const view = gridMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/center-areas/excel-download', { params: cachedParams });

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
  await dataService.post('/sms/wells/service/center-areas', changedRows);

  await notify(t('MSG_ALT_SAVE_DATA'));
  await getCenterAreaPages();
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'newAdrZip' },
    { fieldName: 'ctpvNm' },
    { fieldName: 'ctctyNm' },
    { fieldName: 'emdNm' },
    { fieldName: 'chSn' },
    { fieldName: 'mngerRglvlDvCd' },
    { fieldName: 'mngrDvCd' },
    { fieldName: 'brchOgId' },
    { fieldName: 'ichrLocaraCtrRsonCd' },
    { fieldName: 'fnlMdfcDtm' },
    { fieldName: 'bfBrchOgId' },
    // Grid 입력값
    { fieldName: 'mdfcBrchOgId' },
    { fieldName: 'mdfcIchrLocaraCtrRsonCd' },
  ];

  const columns = [
    { fieldName: 'newAdrZip', header: '우편번호', width: '110', styleName: 'text-center', editable: false },
    { fieldName: 'emdNm',
      header: '주소',
      width: '286',
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
    { fieldName: 'mngrDvCd',
      header: '관리구분',
      width: '140',
      styleName: 'text-center',
      editable: false,
      options: codes.MNGR_DV_CD,
    },
    { fieldName: 'bfBrchOgId',
      header: '(전)지역단',
      width: '170',
      styleName: 'text-center',
      options: customCodes.DGR_2_LEVL_OG,
      optionValue: 'ogId',
      optionLabel: 'ogCd',
      editable: false,
    },
    { fieldName: 'fnlMdfcDtm', header: '최종이관', width: '160', styleName: 'text-center', datetimeFormat: 'datetime', editable: false },
    { fieldName: 'brchOgId',
      header: '(현)지역단',
      width: '174',
      styleName: 'text-center',
      options: customCodes.DGR_2_LEVL_OG,
      optionValue: 'ogId',
      optionLabel: 'ogCd',
      editable: false,
    },
    {
      fieldName: 'mdfcBrchOgId',
      header: {
        text: '이관지역단',
        styleName: 'essential',
      },
      width: '200',
      styleName: 'text-center',
      options: customCodes.DGR_2_LEVL_OG,
      optionValue: 'ogId',
      optionLabel: 'ogCd',
      rules: 'required',
      editor: {
        type: 'list',
      },
    },
    {
      fieldName: 'mdfcIchrLocaraCtrRsonCd',
      header: {
        text: '이관사유',
        styleName: 'essential',
      },
      width: '180',
      styleName: 'text-center',
      options: codes.TF_AK_RSON_CD,
      rules: 'required',
      editor: {
        type: 'list',
      },
    },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true; // Grid Editable On
});

</script>
