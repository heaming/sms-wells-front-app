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
    ref="popupRef"
    size="3xl"
  >
    <kw-form
      :cols="2"
      :default-visible-rows="3"
      ignore-on-modified
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
          required
        >
          <kw-date-picker
            v-model="searchParams.rgstDt"
            rules="required"
            type="date"
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
        primary
        :label="$t('MSG_BTN_DEL')"
        :disable="props.page !== pageProps.remove"
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
        :disable="props.page !== pageProps.confirm"
        @click="onClickConfirm"
      />
      <!-- //확정 -->
      <kw-btn
        primary
        dense
        :label="$t('MSG_TXT_CNFM_PRNT')"
        :disable="props.page !== pageProps.confirm"
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
import { isEmpty, cloneDeep } from 'lodash-es';

const { getConfig } = useMeta();
const { modal, confirm, notify, alert } = useGlobal();
const { t } = useI18n();
const { ok } = useModal();

const dataService = useDataService();

const baseURI = '/sms/wells/service/normal-out-of-storages';
const detailURI = `${baseURI}/detail`;
const removeURI = `${baseURI}/detail-remove`;
const standardURI = `${baseURI}/standard-ware`;
const itmOstrAkUri = `${baseURI}/itm-ostr-ak`;

const popupRef = ref();
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
  itmOstrNo: {
    type: String,
    default: '',
  },
  page: {
    type: String,
    default: '',
  },
});

const pageProps = {
  confirm: 'WwsnaNormalOutOfStorageMgtM',
  remove: 'WwsnaOutOfStorageManagementListM',
};

const codes = ref(await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
));

const searchParams = ref({});
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchData() {
  const fetchURI = ref(`${detailURI}`);
  if (props.page === pageProps.remove) {
    fetchURI.value = removeURI;
    const { itmOstrNo } = searchParams.value;
    if (isEmpty(itmOstrNo)) return;
  }

  const res = await dataService.get(fetchURI.value, { params: { ...searchParams.value, ...pageInfo.value } });
  const { list: searchData, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  const datasSource = view.getDataSource();
  datasSource.setRows(searchData);

  view.resetCurrent();
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  await fetchData();
}

async function onClickExcelDownload() {
  const fetchURI = ref(`${detailURI}`);
  if (props.page === pageProps.remove) {
    fetchURI.value = removeURI;
    const { itmOstrNo } = searchParams.value;
    if (isEmpty(itmOstrNo)) return;
  }

  const view = grdMainRef.value.getView();
  const res = await dataService.get(`${fetchURI.value}/excel-download`, { params: searchParams.value });
  await gridUtil.exportView(view, {
    fileName: popupRef.value.pageCtxTitle,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (isEmpty(checkedRows)) {
    notify(t('MSG_ALT_DEL_NO_DATA'));
    return;
  }

  const { ostrDt, ostrOjWareNo, ostrWareDvCd } = checkedRows[0];
  // 출고창고가 물류센터인 경우
  if (ostrWareDvCd === '1') {
    // 출고창고가 물류센터이면 처리할 수 없습니다.
    await alert(t('MSG_ALT_CANT_PROC_OSTR_LGST'));
    return;
  }

  const validRows = checkedRows.filter((item) => !isEmpty(item.strConfDt));

  if (!isEmpty(validRows)) {
    // 이미 입고가 완료되었기 때문에 삭제가 불가합니다.
    await alert(t('MSG_ALT_ALD_STR_CMP_DEL_IMP'));
    return;
  }

  if (!isEmpty(ostrDt) && !isEmpty(ostrOjWareNo)) {
    // 창고마감여부 조회
    const res = await dataService.get(`${baseURI}/ware-close-yn`, { params: { ostrDt, ostrOjWareNo } });
    if (res.data === 'Y') {
      // 해당 출고년월에는 이미 마감이 완료되어, 출고수정작업이 불가합니다.
      await alert(t('MSG_ALT_WARE_CLOSE_OSTR_IMP'));
      return;
    }
  }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);
  if (!isEmpty(deletedRows)) {
    const res = await dataService.delete(detailURI, { data: [...deletedRows] });
    const { processCount } = res.data;
    if (processCount > 0) {
      notify(t('MSG_ALT_DELETED'));
      ok();
    }
  }
}

async function callConfirm(isClose) {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (isEmpty(checkedRows)) {
    notify(t('MSG_ALT_NOT_SELECT_NOR_OSTR'));
    return;
  }

  if (!await confirm(t('MSG_ALT_WANT_DTRM'))) return;
  if (!await gridUtil.validate(view, { isCheckedOnly: true })) return;

  const { ostrDt, ostrOjWareNo, ostrWareDvCd } = checkedRows[0];
  // 출고창고가 물류센터인 경우
  if (ostrWareDvCd === '1') {
    // 출고창고가 물류센터이면 처리할 수 없습니다.
    await alert(t('MSG_ALT_CANT_PROC_OSTR_LGST'));
    return;
  }

  // 출고수량 체크
  let valid1 = false;
  let valid2 = false;
  checkedRows.forEach((e) => {
    const { outQty, outQtyOrg, qty } = e;
    if (outQty > outQtyOrg) {
      valid1 = true;
      return false;
    }

    if (qty < outQty) {
      valid2 = true;
      return false;
    }
  });

  if (valid1) {
    // 출고수량이 요청수량을 초과합니다.
    await alert(t('MSG_ALT_OSTR_QTY_REQ_QTY'));
    return;
  }

  if (valid2) {
    // 출고수량이 재고수량을 초과합니다.
    await alert(t('MSG_ALT_OSTR_QTY_EXCEEDS_INVEN_QTY'));
    return;
  }

  if (!isEmpty(ostrDt) && !isEmpty(ostrOjWareNo)) {
    // 창고마감여부 조회
    const res = await dataService.get(`${baseURI}/ware-close-yn`, { params: { ostrDt, ostrOjWareNo } });
    if (res.data === 'Y') {
      // 해당 출고년월에는 이미 마감이 완료되어, 출고수정작업이 불가합니다.
      await alert(t('MSG_ALT_WARE_CLOSE_OSTR_IMP'));
      return;
    }
  }

  const checkRows = checkedRows.map((v) => (v.ostrAkSn));

  // 출고 확정건수 조회
  let res = await dataService.get(`${baseURI}/confirm-count`, { params: { ostrAkSns: checkRows, ostrAkNo: checkedRows[0].ostrAkNo } });
  if (res.data > 0) {
    // 이미 정상출고 처리된 품목입니다.
    await alert(t('MSG_ALT_ALDY_NOR_OSTR_CMP'));
    return;
  }
  res = await dataService.post(detailURI, checkedRows);
  const { processCount } = res.data;
  if (processCount > 0) {
    // 확정 되었습니다.
    notify(t('MSG_TXT_CNFM_SCS'));
    if (isClose) {
      ok();
      return;
    }

    notify('오즈리포트 기능입니다.');
  }
}

async function onClickConfirm() {
  await callConfirm(true);
}

async function onClickConfirmAfterMove() {
  await callConfirm(false);
}

async function onChangeRgstDt() {
  await onClickSearch();
}

function setSearchParams(res) {
  searchParams.value = cloneDeep(res.data);
  const { stckStdGb, ostrAkRgstDt } = res.data;

  searchParams.value.stckNoStdGb = stckStdGb === 'Y' ? 'N' : 'Y';
  searchParams.value.rgstDt = isEmpty(ostrAkRgstDt) ? dayjs().format('YYYYMMDD') : ostrAkRgstDt;
}

async function onclickStandard() {
  const { stckNoStdGb, baseYm, ostrOjWareNo } = searchParams.value;
  const stckStdGb = stckNoStdGb === 'N' ? 'Y' : 'N';
  const apyYm = baseYm;
  const wareNo = ostrOjWareNo;

  const res = await dataService.put(standardURI, { apyYm, stckStdGb, wareNo });
  if (res.data > 0) {
    notify(t('MSG_ALT_CHG_DATA'));
    await fetchData();
  }
}

async function getItmOstrAk() {
  const { ostrAkNo, ostrAkSn, itmOstrNo } = props;

  if (!isEmpty(ostrAkNo) && !isEmpty(ostrAkSn)) {
    const res = await dataService.get(itmOstrAkUri, { params: { ostrAkNo, ostrAkSn, itmOstrNo } });

    setSearchParams(res);
  }
}

onMounted(async () => {
  await getItmOstrAk();
  await onClickSearch();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'chk', dataType: 'text', booleanFormat: 'N:Y' },
    { fieldName: 'ostrAkTpCd' },
    { fieldName: 'ostrTpCd' },
    { fieldName: 'strTpCd' },
    { fieldName: 'ostrOjWareNo' },
    { fieldName: 'strOjWareNo' },
    { fieldName: 'ostrAkRgstDt' },
    { fieldName: 'ostrAkNo' },
    { fieldName: 'ostrAkSn' },
    { fieldName: 'strHopDt' },
    { fieldName: 'svpdMgtTyp' },
    { fieldName: 'svpdSapCd' },
    { fieldName: 'itmPdCd' },
    { fieldName: 'svpdNmKor' },
    { fieldName: 'svpdItemKnd' },
    { fieldName: 'itemLoc' },
    { fieldName: 'itmGdCd' },
    { fieldName: 'qty', dataType: 'number' },
    { fieldName: 'reqStckQty', dataType: 'number' },
    { fieldName: 'ostrAkQty', dataType: 'number' },
    { fieldName: 'ostrCnfmQty', dataType: 'number' },
    { fieldName: 'ostrCnfmQtyOrg', dataType: 'number' },
    { fieldName: 'rmkCn' },
    { fieldName: 'ostrCnfmCd' },
    { fieldName: 'rectOstrDt' },
    { fieldName: 'ostrAggQty', dataType: 'number' },
    { fieldName: 'outQty', dataType: 'number' },
    { fieldName: 'outQtyOrg', dataType: 'number' },
    { fieldName: 'strConfDt' },
    { fieldName: 'strWareDvCd' },
    { fieldName: 'strWareDtlDvCd' },
    { fieldName: 'strWareNm' },
    { fieldName: 'strPrtnrNo' },
    { fieldName: 'strOgTpCd' },
    { fieldName: 'ostrWareDvCd' },
    { fieldName: 'ostrWareDtlDvCd' },
    { fieldName: 'ostrWareNm' },
    { fieldName: 'ostrPrtnrNo' },
    { fieldName: 'ostrOgTpCd' },
    { fieldName: 'boxUnitQty', dataType: 'number' },
    { fieldName: 'mngtUnitCd' },
    { fieldName: 'mngtUnitNm' },
    { fieldName: 'itmOstrNo' },
    { fieldName: 'ostrSn' },
    { fieldName: 'ostrTms' },
    { fieldName: 'avgOut' },
    { fieldName: 'itmStrNo' },
    { fieldName: 'strSn' },
  ];

  const columns = [
    { fieldName: 'svpdMgtTyp',
      header: t('MSG_TXT_STOC_TYPE'),
      width: '100',
      styleName: 'text-center',
    },
    { fieldName: 'svpdSapCd', header: t('MSG_TXT_SAP_CD'), width: '120', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'svpdNmKor', header: t('MSG_TXT_ITM_NM'), width: '300' },
    { fieldName: 'ostrTms', header: t('MSG_TXT_OSTR_FREQ'), width: '100', styleName: 'text-center' },
    { fieldName: 'itemLoc', header: t('MSG_TXT_ITM_LOC'), width: '150' },
    { fieldName: 'itmGdCd', header: t('MSG_TXT_GD'), width: '100', styleName: 'text-center' },
    { fieldName: 'qty', header: t('MSG_TXT_OSTR_WARE_STOC'), width: '100', styleName: 'text-right' },
    { fieldName: 'reqStckQty', header: t('MSG_TXT_STR_WARE_STOC'), width: '100', styleName: 'text-right' },
    { fieldName: 'avgOut', header: t('MSG_TXT_CNTR_AV_OSTR_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'ostrAkQty', header: t('MSG_TXT_RQST_QTY'), width: '100', styleName: 'text-right' }, // 신청수량
    { fieldName: 'ostrCnfmQty', header: t('MSG_TXT_CNFM_QTY'), width: '100', styleName: 'text-right' }, // 확정수량
    { fieldName: 'strHopDt', header: t('MSG_TXT_STR_HOP_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 입고희망일자
    { fieldName: 'ostrAggQty', header: t('MSG_TXT_OSTR_AGG'), width: '100', styleName: 'text-right' }, // 출고누계
    { fieldName: 'outQty',
      header: t('MSG_TXT_OSTR_QTY'),
      editable: props.page === pageProps.confirm,
      rules: 'required|min_value:1|max_value:999999999999',
      dataType: 'number',
      editor: {
        type: 'number',
        editFormat: '#,##0',
      },
      width: '100',
      styleName: 'text-right',
    },
    { fieldName: 'rmkCn', // 비고
      header: t('MSG_TXT_NOTE'),
      width: '100',
      styleName: 'text-left',
      rules: 'max:4000',
      editor: {
        type: 'text',
        editable: props.page === pageProps.confirm },
      editable: props.page === pageProps.confirm },
    { fieldName: 'mngtUnitNm', header: t('TXT_MSG_MNGT_UNIT_CD'), width: '100', styleName: 'text-center' },
    { fieldName: 'boxUnitQty', header: t('MSG_TXT_BOX_QTY'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'rectOstrDt', header: t('MSG_TXT_RECT_OSTR_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.fieldName = 'chk';
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.columnEditableFirst = props.page === pageProps.confirm;

  view.onCellEdited = async (grid, itemIndex, row, field) => {
    const { qty, outQty, outQtyOrg } = grid.getValues(itemIndex);
    const changedFieldName = grid.getDataSource().getOrgFieldName(field);
    if (changedFieldName === 'outQty') {
      if (outQty > outQtyOrg) {
        // 출고수량이 요청수량을 초과합니다.
        await alert(t('MSG_ALT_OSTR_QTY_REQ_QTY'));
        grid.setValue(itemIndex, 'outQty', outQtyOrg);
        return;
      }

      if (qty < outQty) {
        // 출고수량이 재고수량을 초과합니다.
        await alert(t('MSG_ALT_OSTR_QTY_EXCEEDS_INVEN_QTY'));
        grid.setValue(itemIndex, 'outQty', outQtyOrg);
      }
    }
  };

  view.onCellDblClicked = async (g, { dataRow }) => {
    const {
      itmPdCd, svpdNmKor, strOjWareNo, strWareNm, ostrAkQty, strWareDvCd,
    } = gridUtil.getRowValue(g, dataRow);

    await modal({
      component: 'WwsnaRequestMaterialHaveListP',
      componentProps: {
        itmPdCd,
        itmPdNm: svpdNmKor,
        strOjWareNo,
        strOjWareNm: strWareNm,
        ostrQty: ostrAkQty,
        wareDvCd: strWareDvCd,
      },
    });
  };
});
</script>
