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
import { codeUtil, useDataService, getComponentType, useMeta, defineGrid, useGlobal, gridUtil, useModal } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
// import { cloneDeep, isEmpty } from 'lodash-es';

const { getConfig } = useMeta();
const { modal, confirm, notify } = useGlobal();
const { t } = useI18n();
const { ok } = useModal();

const dataService = useDataService();

const baseURI = '/sms/wells/service/normal-outofstorages';
const detailURI = `${baseURI}/detail`;
const standardURI = `${baseURI}/standard-ware`;
// const stdWareUri = '/sms/wells/service/normal-outofstorages/standard-ware';
// const pathUri = `${baseURI}/monthly-warehouse`;
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
  page: {
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
  const view = grdMainRef.value.getView();
  view.checkAll(true);
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    view.checkAll(false);
  }
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
  const checkedValues = ref(gridUtil.getCheckedRowValues(grdMainRef.value.getView()));
  checkedValues.value.forEach((v) => {
    v.outQty = v.dummyQty;
  });
  console.log(checkedValues.value);

  return checkedValues.value;
}

async function onClickConfirm() {
  if (await confirm(t('MSG_ALT_WANT_DTRM'))) {
    const view = grdMainRef.value.getView();
    const checkedRows = gridUtil.getCheckedRowValues(view);

    if (await checkedRows.length === 0) {
      notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
      return false;
    } if (await gridUtil.validate(view, { isCheckedOnly: true })) {
      // 변경된 data가 있는지 체크
      if (await gridUtil.alertIfIsNotModified(view)) { return; }
      // validate :: view.onValidate 호출
      // if (!await gridUtil.validate(view)) { return; }
      let checkedErrQty = false;
      checkedRows.forEach((v) => {
        const { outQty, dummyQty } = v;
        if (outQty < dummyQty) {
          checkedErrQty = true;
        }
      });

      if (checkedErrQty) {
        notify(t('MSG_ALT_OSTR_QTY_REQ_QTY'));
        return;
      }

      const saveParams = getSaveParams();
      console.log(saveParams);
      await dataService.put(detailURI, saveParams);
      notify(t('MSG_ALT_SAVE_DATA'));
      // await fetchData();
      ok();
    }
  }
}

async function onClickConfirmAfterMove() {
  if (await confirm(t('MSG_ALT_WANT_DTRM'))) {
    // notify(t('MSG_TXT_CNFM_SCS'));
    notify('오즈리포트 기능입니다.');
  }
}

async function onChangeRgstDt() {
  await onClickSearch();
}

async function setSearchParams(res) {
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

  // searchParams.value.stckStdGb = '';
  searchParams.value.stckNoStdGb = 'N';
  searchParams.value.rgstDt = dayjs().format('YYYYMMDD');
  searchParams.value.apyYm = dayjs().format('YYYYMM');
}

async function stckStdGbFetchData() {
  if (searchParams.value.ostrAkRgstDtstrRgstDt === undefined) {
    searchParams.value.ostrAkRgstDtstrRgstDt = '';
  }

  const apyYm = searchParams.value.ostrAkRgstDtstrRgstDt.substring(0, 6);
  const wareNo = searchParams.value.ostrWareNo;
  const res = await dataService.get(standardURI, { params: { apyYm, wareNo } });
  const { stckStdGb } = res.data;
  console.log(res);
  searchParams.value.stckNoStdGb = stckStdGb === 'Y' ? 'N' : 'Y';
}

async function onclickStandard() {
  const stckStdGb = searchParams.value.stckNoStdGb === 'N' ? 'Y' : 'N';
  const apyYm = searchParams.value.baseYm;
  const wareNo = searchParams.value.ostrWareNo;

  const res = await dataService.put(standardURI, { apyYm, stckStdGb, wareNo });
  console.log(res);
  notify(t('MSG_ALT_CHG_DATA'));
  fetchData();
}

async function getItmOstrAk() {
  const ostrAkParams = {
    ostrAkNo: props.ostrAkNo,
    ostrAkSn: props.ostrAkSn,
  };

  console.log(`props.ostrAkNo : ${props.ostrAkNo}`);
  console.log(`props.ostrAkSn : ${props.ostrAkSn}`);

  const res = await dataService.get(itmOstrAkUri, { params: ostrAkParams });

  await setSearchParams(res);

  await stckStdGbFetchData();
  await onClickSearch();
}

onMounted(async () => {
  await stckStdGbFetchData();
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
    { fieldName: 'ostrAkQty', header: t('MSG_TXT_RQST_QTY'), width: '100', styleName: 'text-center' }, // 신청수량
    { fieldName: 'ostrCnfmQty', header: t('MSG_TXT_CNFM_QTY'), width: '100', styleName: 'text-center' }, // 확정수량
    { fieldName: 'strHopDt', header: t('MSG_TXT_STR_HOP_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 입고희망일자
    { fieldName: 'ostrAggQty', header: t('MSG_TXT_OSTR_AGG'), width: '100', styleName: 'text-center' }, // 출고누계
    { fieldName: 'dummyQty',
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
    { fieldName: 'rmkCn', // 비고
      header: t('MSG_TXT_NOTE'),
      width: '100',
      styleName: 'text-left',
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
    { fieldName: 'outQty' }, // 출고수량
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = true;
  // view.checkAll(true);

  view.onCellEdited = async (grid, itemIndex, row, field) => {
    // grid.checkItem(itemIndex, true); //checked true
    const { ostrAkQty, ostrCnfmQty, outQty, dummyQty, ostrAggQty, rmkCn } = grid.getValues(itemIndex);
    const changedFieldName = grid.getDataSource().getOrgFieldName(field);
    // const checkedValue = grid.isCheckedRow(itemIndex);
    const checkedValue = grid.isCheckedItem(itemIndex);
    if (changedFieldName === 'dummyQty') {
      console.log(`dummyQty :: ostrAkQty : ${ostrAkQty}`);
      console.log(`dummyQty :: ostrCnfmQty : ${ostrCnfmQty}`);
      console.log(`dummyQty :: outQty : ${outQty}`);
      console.log(`dummyQty :: dummyQty : ${dummyQty}`);
      console.log(`dummyQty :: ostrAggQty : ${ostrAggQty}`);
      console.log(`dummyQty :: row : ${itemIndex} :: checkedValue : ${checkedValue}`);
      let chkErrData = false;
      if (dummyQty > outQty) {
        console.log(`dummyQty checked : ${dummyQty}`);
        chkErrData = true;
      }

      console.log(`dummyQty :: chkErrData : ${chkErrData}`);
      if (dummyQty > 0) {
        if (chkErrData) {
          notify('출고수량이 신청수량보다 많습니다');
          // grid.checkItem(itemIndex, false);
          // grid.setValue(itemIndex, 'dummyQty', '0');
          // 체크값에 따른 다르게 값을 셋팅한다.
          if (checkedValue) {
            // outQty 0 인경우 체크를 해제한다.
            if (outQty === '0') {
              grid.checkItem(itemIndex, false);
            }

            grid.setValue(itemIndex, 'dummyQty', outQty);
          } else {
            grid.setValue(itemIndex, 'dummyQty', '0');
          }
        } else {
          grid.checkItem(itemIndex, true);
        }
      } else {
        grid.checkItem(itemIndex, false);
        grid.setValue(itemIndex, 'dummyQty', '0');
      }
    } else if (changedFieldName === 'rmkCn') {
      console.log(`rmkCn :: rmkCn : ${rmkCn}`);
    }
  };

  view.onItemChecked = async (grid, itemIndex, checked) => {
    console.log(grid);
    console.log(itemIndex);
    console.log(checked);
    // const checkedValue = grid.isCheckedRow(itemIndex);
    const checkedValue = grid.isCheckedItem(itemIndex);
    console.log(`row : ${itemIndex} :: checkedValue : ${checkedValue}`);
    const { outQty, rmkCn, dummyQty } = grid.getValues(itemIndex);
    console.log(`outQty : ${outQty} :: rmkCn : ${rmkCn} :: dummyQty : ${dummyQty}`);

    if (checkedValue) {
      // outQty 값이 0인지 체크
      if (outQty > 0) {
        grid.setValue(itemIndex, 'dummyQty', outQty);
      } else {
        grid.checkItem(itemIndex, false);
        grid.setValue(itemIndex, 'dummyQty', '0');
      }
    } else {
      grid.setValue(itemIndex, 'dummyQty', '0');
    }
  };

  view.onItemAllChecked = async (grid, checked) => {
    console.log(`checked : ${checked}`);
    console.log(`grid : ${grid}`);

    if (checked) {
      const checkedRows = gridUtil.getCheckedRowValues(grid);
      checkedRows.forEach((v, i) => {
        grid.setValue(i, 'dummyQty', v.outQty);
      });
      // allRows.forEach((v, i) => {
      //   console.log(`v : ${v} : i :${i}`);
      //   grid.setValue(i, 'dummyQty', v.outQty);
      // });
    } else {
      const allRows = gridUtil.getAllRowValues(grid);
      allRows.forEach((v, i) => {
        console.log(`v : ${v} : i :${i}`);
        grid.setValue(i, 'dummyQty', '0');
      });
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
