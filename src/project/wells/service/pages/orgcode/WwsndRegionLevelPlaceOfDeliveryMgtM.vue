<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SND (조직관리)
2. 프로그램 ID : WwsndRegionLevelPlaceOfDeliveryMgtM - 급지 출고지 관리
3. 작성자 : yeonghwa.cheon
4. 작성일 : 2022.12.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 급지 출고지 관리 (http://localhost:3000/#/service/wwsnd-region-level-place-of-delivery-mgt)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      :modified-targets="['grdMain']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 출고지구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_PDLV_DV')"
        >
          <kw-select
            v-model="searchParams.pdlvDvCd"
            :options="codes.PDLV_DV_CD"
            first-option="all"
            @update:model-value="changePdlvDv"
          />
        </kw-search-item>
        <!-- 출고지명 -->
        <kw-search-item
          :label="$t('MSG_TXT_PDLV_NM')"
        >
          <kw-input
            v-model="searchParams.pdlvNm"
            :maxlength="50"
          />
        </kw-search-item>
        <!-- 서비스센터 -->
        <kw-search-item
          :label="$t('MSG_TXT_SV_CNR')"
        >
          <kw-select
            v-model="searchParams.ogId"
            :options="svcCode"
            first-option="all"
            option-label="ogNm"
            option-value="ogId"
          />
        </kw-search-item>
        <!-- 적용일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_APPLY_DT')"
        >
          <kw-date-picker
            v-model="searchParams.applyDate"
            :readonly="isReadonly"
            rules="required"
            :custom-messages="{required:$t('MSG_ALT_NCELL_REQUIRED_VAL',[t('MSG_TXT_APPLY_DT')])}"
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
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            :total-count="pageInfo.totalCount"
            @change="fetchData"
          />
        </template>
        <!-- 삭제 버튼 -->
        <kw-btn
          v-permission:delete
          dense
          grid-action
          :label="$t('MSG_BTN_DEL')"
          @click="onClickDelete"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 행추가 버튼 -->
        <kw-btn
          v-permission:create
          dense
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAddRow"
        />
        <!-- 저장 버튼 -->
        <kw-btn
          v-permission:update
          dense
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <!-- 엑셀다운로드 버튼 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :disable="(pageInfo.totalCount === 0)"
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-date-picker
          v-model="chgApyDt.apyStrtdt"
          dense
          class="w150"
        />
        <kw-date-picker
          v-model="chgApyDt.apyEnddt"
          :readonly="true"
          dense
          class="w150"
        />
        <!-- 적용일자 일괄변경 -->
        <kw-btn
          secondary
          dense
          :label="$t('MSG_TXT_APY_DT_BLK_CH')"
          @click="onClickApplyDateBulkChange"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
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
import {
  codeUtil,
  defineGrid,
  getComponentType,
  useDataService,
  // useMeta,
  gridUtil,
  useGlobal,
} from 'kw-lib';
import { cloneDeep, replace, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
// const { getConfig } = useMeta();
const grdMainRef = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const { currentRoute } = useRouter();

const {
  modal,
  notify,
} = useGlobal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();

/* 공통코드 가져오기 */
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'PDLV_DV_CD',
);

const svcCode = (await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } })).data;

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
  // pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

let cachedParams;

const chgApyDt = ref({
  apyStrtdt: now.format('YYYYMMDD'),
  apyEnddt: '99991231',
});

/* 조회조건 */
const searchParams = ref({
  pdlvDvCd: '',
  pdlvNm: '',
  ogId: '',
  applyDate: now.format('YYYYMMDD'),
});

const isReadonly = ref(false);
// 엑셀다운로드
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  const response = await dataService.get('/sms/wells/service/region-levels/place-of-deliverys/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: response.data,
    checkBar: 'hidden',
  });
}
// 그리드 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/region-levels/place-of-deliverys/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: places, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(places);
  view.clearCurrent();
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}
// 조회 버튼 클릭
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}
// 행추가 버튼 클릭
function onClickAddRow() {
  const view = grdMainRef.value.getView();
  gridUtil.insertRowAndFocus(view, 0, { apyStrtdt: searchParams.value.applyDate, apyEnddt: '99991231' });
  view.checkItem(0, true);
}
// 저장 버튼 클릭
async function onClickSave() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);
  if (chkRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM')); // 데이터를 선택해주세요.
  } else if (await gridUtil.validate(view, { isCheckedOnly: true })) {
    const response = await dataService.post('/sms/wells/service/region-levels/place-of-deliverys', chkRows);
    if (response.data.processCount === -1) {
      notify(t('MSG_ALT_APY_STRT_D_CONF_BF_DT')); // 이전일자보다 작거나 같습니다. 적용시작일을 확인하시기 바랍니다.
    } else {
      notify(t('MSG_ALT_SAVE_DATA')); // 저장되었습니다.
      await fetchData();
    }
  }
}
// 삭제 버튼 클릭
async function onClickDelete() {
  const view = grdMainRef.value.getView();

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  const pdlvNos = deletedRows.map(({ pdlvNo }) => pdlvNo);
  const pdlvDvCds = deletedRows.map(({ pdlvDvCd }) => pdlvDvCd);
  if (deletedRows.length > 0) {
    // 삭제 controller
    await dataService.delete('/sms/wells/service/region-levels/place-of-deliverys', { params: { pdlvNos, pdlvDvCds } });
    await fetchData();
  }
}
// 출고지 구분 선택 이벤트
function changePdlvDv() {
  if (searchParams.value.pdlvDvCd === 'E') { // 엔지니어 지점
    searchParams.value.applyDate = now.add(1, 'days').format('YYYYMMDD'); // 다음날짜
    isReadonly.value = false;
  } else if (searchParams.value.pdlvDvCd === 'Z') { //
    searchParams.value.applyDate = now.format('YYYYMMDD'); // 당일
    isReadonly.value = true;
  } else { // 전체
    searchParams.value.applyDate = now.format('YYYYMMDD'); // 당일
    isReadonly.value = false;
  }
}
// 적용일자 일괄변경 버튼 클릭
async function onClickApplyDateBulkChange() {
  const view = grdMainRef.value.getView();
  const chkRows = gridUtil.getCheckedRowValues(view);
  const data = grdMainRef.value.getData();
  if (chkRows.length === 0) {
    notify(t('MSG_ALT_CHG_HLDY_DATA')); // 일괄변경할 데이터를 선택하세요.
  } else if (!chgApyDt.value.apyStrtdt) {
    notify(t('MSG_ALT_CHK_NCSR', [t('MSG_TXT_APY_STRTDT')])); // 적용시작일자을(를) 입력해주세요.
  } else {
    for (let i = 0; i < chkRows.length; i += 1) {
      data.setValue(view.getItemIndex(chkRows[i].dataRow), 'apyStrtdt', chgApyDt.value.apyStrtdt);
      data.setValue(view.getItemIndex(chkRows[i].dataRow), 'apyEnddt', chgApyDt.value.apyEnddt);
    }
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'pdlvNo' }, // 출고지번호
    { fieldName: 'pdlvDvCd' }, // 출고지구분
    { fieldName: 'pdlvNm' }, // 출고지명
    { fieldName: 'zip' }, // 우편번호
    { fieldName: 'pdlvAdr' }, // 출고지주소
    { fieldName: 'pdlvDtlAdr' }, // 출고지상세주소
    { fieldName: 'pdlvAdrTot' }, // 출고지주소tot
    { fieldName: 'apyStrtdtMax' }, // 적용시작일자 max
    { fieldName: 'apyStrtdt' }, // 적용시작일자
    { fieldName: 'apyEnddt' }, // 적용종료일자
    { fieldName: 'cnrOgId' }, // 서비스센터
  ];

  const columns = [
    {
      fieldName: 'pdlvNm',
      header: t('MSG_TXT_PDLV_NM'),
      width: '150',
      editable: true,
      editor: { maxLength: 50 },
      rules: 'required',
    },
    {
      fieldName: 'zip',
      header: t('MSG_TXT_ZIP'),
      width: '150',
      styleName: 'text-center rg-button-icon--search',
      button: 'action',
      buttonVisibleCallback: (grid, index) => {
        const rowState = gridUtil.getRowState(grid, index.dataRow);
        return (rowState === 'created');
      },
    },
    {
      fieldName: 'pdlvAdr',
      header: t('MSG_TXT_ADDR'),
      rules: 'required',
    },
    {
      fieldName: 'pdlvDtlAdr',
      header: t('MSG_TXT_ADDR'),
    },
    {
      fieldName: 'pdlvAdrTot',
      header: t('MSG_TXT_ADDR'),
      width: '350',
      displayCallback: (grid, index) => {
        const adr = gridUtil.getCellValue(grid, index.dataRow, 'pdlvAdr');
        const dtlAdr = (gridUtil.getCellValue(grid, index.dataRow, 'pdlvDtlAdr'));
        const tot = `${replace(adr, null, ' ')} ${replace(dtlAdr, null, ' ')}`;

        return tot;
      },
    },
    {
      fieldName: 'apyStrtdt',
      header: t('MSG_TXT_APY_STRT_DAY'),
      width: '150',
      styleName: 'text-center',
      editable: true,
      editor: { type: 'btdate' },
      rules: 'required',
    },
    {
      fieldName: 'apyEnddt',
      header: t('MSG_TXT_APY_END_DAY'),
      width: '150',
      styleName: 'text-center',
      editable: false,
      editor: { type: 'btdate' },
    },
    {
      fieldName: 'cnrOgId',
      header: t('MSG_TXT_CENTER_DIVISION'),
      width: '150',
      options: svcCode,
      optionValue: 'ogId',
      optionLabel: 'ogNm',
      styleCallback(grid, dataCell) {
        const pdlvDvCd = grid.getValue(dataCell.item.index, 'pdlvDvCd');
        if (pdlvDvCd !== 'Z') {
          return {
            editable: true,
            editor: {
              type: 'dropdown',
            },
          };
        }
        return {
          editable: false,
        };
      },
    },
  ];

  const columnLayout = [
    'pdlvNm',
    'zip',
    'pdlvAdrTot',
    'apyStrtdt',
    'apyEnddt',
    'cnrOgId',
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.setColumnLayout(columnLayout);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;

  view.onCellButtonClicked = async (grid, index) => {
    grid.commit();
    const { result, payload } = await modal({
      component: 'ZwcmzAddressInfoP',
    });

    if (result) {
      const { address } = payload;
      data.setValue(index.dataRow, 'zip', address.zipCode);
      data.setValue(index.dataRow, 'pdlvAdr', address.add1);
      data.setValue(index.dataRow, 'pdlvDtlAdr', address.add2);
      data.setValue(index.dataRow, 'pdlvNo', address.bldMngtNo);
    }
  };

  view.onCellEdited = async (grid, itemIndex, row, field) => {
    grid.checkItem(itemIndex, true);
    const { apyStrtdtMax, apyStrtdt, apyEnddt } = grid.getValues(itemIndex);
    const changedFieldName = grid.getDataSource().getOrgFieldName(field);

    if (changedFieldName === 'apyStrtdt') {
      if (apyStrtdt > apyEnddt) {
        grid.setValue(itemIndex, 'apyEnddt', apyStrtdt);
      }
      if (apyStrtdtMax >= apyStrtdt) {
        notify(t('MSG_ALT_APY_STRT_D_CONF_MAX_DT', [apyStrtdtMax]));
        grid.setValue(itemIndex, 'apyStrtdt', apyStrtdtMax);
      }
    } else if (changedFieldName === 'apyEnddt') {
      if (apyStrtdtMax > apyEnddt) {
        notify(t('MSG_ALT_APY_STRT_D_CONF_BF_DT'));
        grid.setValue(itemIndex, 'apyEnddt', 99991231);
      } else if (apyStrtdt > apyEnddt) {
        grid.setValue(itemIndex, 'apyStrtdt', apyEnddt);
      }
    }
  };

  view.onValidate = async (grid, index) => {
    const { apyStrtdtMax, apyStrtdt, apyEnddt } = grid.getValues(index.dataRow);
    if (apyEnddt !== '99991231') {
      return t('MSG_ALT_NOT_FINAL_APY_STRTDT'); // 최종 적용시작일이 아닌 건이 있습니다.
    }
    if (!isEmpty(apyStrtdtMax) && apyStrtdtMax >= apyStrtdt) {
      return t('MSG_ALT_APY_STRT_D_CONF_MAX_DT', [apyStrtdtMax]); // 최대 적용시작일({0})보다 작거나 같습니다. 적용시작일을 확인하시기 바랍니다.
    }
  };
});

</script>
<style scoped>

</style>
