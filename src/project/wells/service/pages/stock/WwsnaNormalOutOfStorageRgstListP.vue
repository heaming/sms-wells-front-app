<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaNormalOutOfStorageRgstListP - 정상출고 등록(W-SV-U-0179P01)
3. 작성자 : inho.choi
4. 작성일 : 2023.03.15
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
정상, 물량이동 출고 확인을 실시하고 출고실적을 확인하는 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    size="3xl"
  >
    <kw-form
      :cols="2"
      :default-visible-rows="3"
    >
      <kw-form-row>
        <!-- 출고요청유형 -->
        <kw-form-item
          :label="$t('MSG_TXT_OSTR_AK_TP')"
        >
          <kw-input
            v-model="searchParams.ostrAkTpNm"
            :disable="true"
          />
        </kw-form-item>
        <!-- //출고요청유형 -->
        <!-- 출고창고 -->
        <kw-form-item
          :label="$t('MSG_TXT_OSTR_WARE')"
        >
          <kw-input
            v-model="searchParams.ostrOjWareNm"
            :disable="true"
          />
          <!-- 표준 미적용 -->
          <kw-field
            v-model="searchParams.stckNoStdGb"
            class="w120"
            @update:model-value="onclickStandard"
          >
            <template #default="{ field }">
              <kw-checkbox
                v-bind="field"
                :label="$t('MSG_TXT_STD_NO_APY')"
              />
            </template>
          </kw-field>
          <!-- //표준 미적용 -->
        </kw-form-item>
        <!-- //출고창고 -->
      </kw-form-row>
      <kw-form-row>
        <!-- 입고희망일 -->
        <kw-form-item
          :label="$t('MSG_TXT_STR_HOP_D')"
        >
          <kw-date-picker
            v-model="searchParams.strHopDt"
            :disable="true"
          />
        </kw-form-item>
        <!-- //입고희망일 -->
        <!-- 출고요청번호 -->
        <kw-form-item
          :label="$t('MSG_TXT_OSTR_AK_NO')"
        >
          <kw-input
            v-model="searchParams.ostrAkNo"
            :disable="true"
            mask="###-########-#######"
          />
        </kw-form-item>
        <!-- //출고요청번호 -->
      </kw-form-row>
      <kw-form-row>
        <!-- 등록일자 -->
        <kw-form-item
          :label="$t('MSG_TXT_FST_RGST_DT')"
        >
          <kw-date-picker
            v-model="searchParams.rgstDt"
            @change="onChangeRgstDt"
          />
        </kw-form-item>
        <!-- //등록일자 -->
        <!-- 입고창고 -->
        <kw-form-item
          :label="$t('MSG_TXT_STR_WARE')"
        >
          <kw-input
            v-model="searchParams.strOjWareNm"
            :disable="true"
          />
        </kw-form-item>
        <!-- //입고창고 -->
      </kw-form-row>
    </kw-form>
    <kw-separator />
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
      <kw-btn
        v-permission:delete
        primary
        :label="$t('MSG_BTN_DEL')"
        :disable="!isSelected"
        @click="onClickDelete"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <kw-btn
        dense
        secondary
        icon="excel"
        :label="$t('MSG_BTN_EXCEL_DOWN')"
        :disable="pageInfo.totalCount === 0"
        @click="onClickExcelDownload"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <!-- 확정 -->
      <kw-btn
        primary
        dense
        :label="$t('MSG_TXT_DTRM')"
        @click="onClickConfirm"
      />
      <!-- //확정 -->
      <kw-btn
        primary
        dense
        :label="$t('MSG_TXT_CNFM_PRNT')"
        @click="onClickConfirmAfterMove"
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
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, getComponentType, useMeta, defineGrid, useGlobal, gridUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
// import { cloneDeep, isEmpty } from 'lodash-es';

const { getConfig } = useMeta();
const { modal, confirm, notify } = useGlobal();
const { t } = useI18n();

const dataService = useDataService();

const baseURI = '/sms/wells/service/normal-outofstorages';
const detailURI = `${baseURI}/detail`;
const standardURI = `${baseURI}/standard-ware`;
const pathUri = `${baseURI}/monthly-warehouse`;
const itmOstrAkUri = `${baseURI}/itm-ostr-ak`;
const grdMainRef = ref(getComponentType('KwGrid'));
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  ostrAkNo: {
    type: String,
    default: '',
  },
  ostrAkSn: {
    type: String,
    default: '',
  },
});

const codes = ref(await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
  'OSTR_AK_TP_CD',
  'WARE_DV_CD',
  'ADM_ZN_CLSF_CD',
  'ITM_KND_CD',
  'OVIV_FOM_CD',
  'MAT_MNGT_DV_CD',
));

const searchParams = ref({});
let cachedParams;

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const res = await dataService.get(detailURI, { params: { ...cachedParams, ...pageInfo.value } });
  const { list: searchData, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const datasSource = view.getDataSource();
  datasSource.setRows(searchData);
  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${detailURI}/excel-download`, { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: 'NomalOutOfStorageRgstListP',
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickDelete() {
  if (await confirm(t('MSG_ALT_WANT_DEL'))) {
    console.log(t('MSG_ALT_WANT_DEL'));
  }
}

function getSaveParams() {
  const checkedValues = gridUtil.getCheckedRowValues(grdMainRef.value.getView());
  console.log(checkedValues);

  return checkedValues;
}

async function getStandardWare() {
  const { ostrWareNo } = searchParams.value;
  console.log(`searchParams.value.ostrWareNo:${searchParams.value.ostrWareNo}`);
  const res = await dataService.get(standardURI, { params: { ostrWareNo, stckStdGb: '' } });
  console.log(`res : ${res.data.stckStdGb}`);
  return res.data.stckStdGb;
}

async function setStandardCheckbox() {
  const stdWare = await getStandardWare();
  if (stdWare === '1') {
    searchParams.value.stckNoStdGb = 'N';
    searchParams.value.stckStdGb = '1';
  } else {
    searchParams.value.stckNoStdGb = 'Y';
    searchParams.value.stckStdGb = '0';
  }
}

async function onclickStandard() {
  searchParams.value.stckStdGb = searchParams.value.stckNoStdGb === 'N' ? '1' : '0';

  const { ostrWareNo, apyYm, stckStdGb } = searchParams.value;

  const res = await dataService.put(pathUri, { apyYm, stckStdGb, wareNo: ostrWareNo });
  console.log(res);
}

async function onClickConfirm() {
  if (await confirm(t('MSG_ALT_WANT_DTRM'))) {
    const view = grdMainRef.value.getView();
    // 변경된 data가 있는지 체크
    if (await gridUtil.alertIfIsNotModified(view)) { return; }
    // validate
    if (!await gridUtil.validate(view)) { return; }

    const saveParams = getSaveParams();
    await dataService.put(detailURI, saveParams);
    notify(t('MSG_ALT_SAVE_DATA'));
    await fetchData();
  }
}

async function onClickConfirmAfterMove() {
  if (await confirm(t('MSG_ALT_WANT_DTRM'))) {
    notify(t('MSG_TXT_CNFM_SCS'));
  }
}

async function onChangeRgstDt() {
  await onClickSearch();
}

async function getItmOstrAk() {
  const ostrAkParams = {
    ostrAkNo: props.ostrAkNo,
    ostrAkSn: props.ostrAkSn,
  };

  console.log(`props.ostrAkNo : ${props.ostrAkNo}`);
  console.log(`props.ostrAkSn : ${props.ostrAkSn}`);

  const res = await dataService.get(itmOstrAkUri, { params: ostrAkParams });

  searchParams.value.ostrAkTpCd = res.data.ostrAkTpCd;
  searchParams.value.ostrAkTpNm = res.data.ostrAkTpNm;
  searchParams.value.ostrWareNo = res.data.ostrOjWareNo;
  searchParams.value.strWareNo = res.data.strOjWareNo;
  searchParams.value.strHopDt = res.data.strHopDt;
  searchParams.value.ostrAkNo = res.data.ostrAkNo;
  searchParams.value.ostrOjWareNm = res.data.ostrOjWareNm;
  searchParams.value.strOjWareNm = res.data.strOjWareNm;
  searchParams.value.ostrAkRgstDt = res.data.ostrAkRgstDt;
  searchParams.value.itmPdCd = res.data.itmPdCd;

  searchParams.value.stckStdGb = '0';
  searchParams.value.stckNoStdGb = 'N';
  searchParams.value.rgstDt = dayjs().format('YYYYMMDD');
  searchParams.value.apyYm = dayjs().format('YYYYMM');

  await setStandardCheckbox();
  await onClickSearch();
}

onMounted(async () => {
  await getItmOstrAk();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const columns = [
    { fieldName: 'svpdMgtTyp',
      header: t('MSG_TXT_STOC_TYPE'),
      width: '100',
      styleName: 'text-center',
      options: codes.value.MAT_MNGT_DV_CD,
    },
    { fieldName: 'svpdSapCd', header: t('MSG_TXT_SAP_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'svpdNmKor', header: t('MSG_TXT_ITM_NM'), width: '300' },
    { fieldName: 'cfrmCnt', header: t('MSG_TXT_OSTR_FREQ'), width: '100', styleName: 'text-center' },
    { fieldName: 'itemLoc', header: t('MSG_TXT_ITM_LOC'), width: '150' },
    { fieldName: 'itmGdCd', header: t('MSG_TXT_GD'), width: '100', styleName: 'text-center' },
    { fieldName: 'reqStckQty', header: t('MSG_TXT_OSTR_WARE_STOC'), width: '100', styleName: 'text-center' },
    { fieldName: 'qty', header: t('MSG_TXT_STR_WARE_STOC'), width: '100', styleName: 'text-center' },
    { fieldName: 'avgOut', header: t('MSG_TXT_CNTR_AV_OSTR_QTY'), width: '100', styleName: 'text-center' },
    { fieldName: 'ostrAkQty', header: t('MSG_TXT_RQST_QTY'), width: '100', styleName: 'text-center' },
    { fieldName: 'ostrCnfmQty', header: t('MSG_TXT_CNFM_QTY'), width: '100', styleName: 'text-center' },
    { fieldName: 'strHopDt', header: t('MSG_TXT_STR_HOP_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'ostrAggQty', header: t('MSG_TXT_OSTR_AGG'), width: '100', styleName: 'text-center' },
    { fieldName: 'outQty',
      header: t('MSG_TXT_OSTR_QTY'),
      editable: true,
      rules: 'required|max:12',
      numberFormat: '#,##0',
      editor: {
        type: 'number',
        editFormat: '#,##0',
        maxLength: 12,
      },
      width: '100',
      styleName: 'text-center',
    },
    { fieldName: 'rmkCn',
      header: t('MSG_TXT_NOTE'),
      width: '100',
      styleName: 'text-center',
      editor: {
        type: 'input',
        maxLength: '1300',
      },
      editable: true },
    { fieldName: 'mgtUntNm', header: t('TXT_MSG_MNGT_UNIT_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'boxUnitQty', header: t('MSG_TXT_BOX_QTY'), width: '100', styleName: 'text-center' },
    { fieldName: 'rectOstrDt', header: t('MSG_TXT_RECT_OSTR_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
  ];
  const gridField = columns.map((v) => ({ fieldName: v.fieldName }));
  const fields = [...gridField,
    { fieldName: 'chk' },
    { fieldName: 'flag' },
    { fieldName: 'ostrAkNo' },
    { fieldName: 'ostrAkSn' },
    { fieldName: 'svpdBaseGb' },
    { fieldName: 'svpdBaseColorGb' },
    { fieldName: 'svpdItemKnd' },
    { fieldName: 'ostrTpCd' },
    { fieldName: 'strWareNo' },
    { fieldName: 'ostrWareNo' },
    { fieldName: 'ostrAkRgstDt' },
    { fieldName: 'wareMngtPrtnrNo' },
    { fieldName: 'ostrAkWareDvCd' },
    { fieldName: 'ostrWareMngtPrtnrNo' },
    { fieldName: 'mngtUnitCd' },
    { fieldName: 'ostrCnfmCd' },
    { fieldName: 'ostrWareDvCd' },
    { fieldName: 'strWareDvCd' },
    { fieldName: 'strWareNm' },
    { fieldName: 'ostrWareNm' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  const editFields = ['outQty', 'rmkCn'];
  view.onCellEditable = (grid, clickData) => {
    if (!editFields.includes(clickData.column)) {
      return false;
    }
  };

  view.onCellClicked = (grid, clickData) => {
    if (editFields.includes(clickData.column)) {
      view.editOptions.editable = true;
    } else {
      view.editOptions.editable = false;
    }
  };

  view.onCellDblClicked = async (g, { column, dataRow }, v) => {
    // TODO: componentProps 와 함께 추가
    const { itmPdCd, svpdNmKor, strWareNo, strWareNm, ostrAkQty } = gridUtil.getRowValue(g, dataRow);
    console.log(g, column, dataRow, v);

    const { result, payload } = await modal({
      // TODO: 요청자재보유현황 팝업페이지 연결확인
      component: 'WwsnaRequestMaterialHaveListP',
      componentProps: {
        itmPdCd,
        itmPdNm: svpdNmKor,
        strOjWareNo: strWareNo,
        strOjWareNm: strWareNm,
        ostrQty: ostrAkQty,
      },
    });

    if (result) {
      console.log(payload[0]);
    }
  };
});
</script>
<style scoped>
</style>
