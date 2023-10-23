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
- 정상, 물량이동 출고 확인을 실시하고 출고실적을 확인하는 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="popupRef"
    size="3xl"
    :modified-targets="['grdMain']"
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
            :readonly="true"
          />
        </kw-form-item>
        <!-- 출고창고 -->
        <kw-form-item
          :label="$t('MSG_TXT_OSTR_WARE')"
        >
          <kw-input
            v-model="searchParams.ostrOjWareNm"
            :readonly="true"
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
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 입고희망일 -->
        <kw-form-item
          :label="$t('MSG_TXT_STR_HOP_D')"
        >
          <kw-date-picker
            v-model="searchParams.strHopDt"
            :readonly="true"
          />
        </kw-form-item>
        <!-- 출고요청번호 -->
        <kw-form-item
          :label="$t('MSG_TXT_OSTR_AK_NO')"
        >
          <kw-input
            v-model="searchParams.ostrAkNo"
            :readonly="true"
            mask="###-########-#######"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 등록일자 -->
        <kw-form-item
          :label="$t('MSG_TXT_OSTR_DT')"
          required
        >
          <kw-date-picker
            v-model="searchParams.ostrDt"
            :readonly="props.page !== pageProps.confirm"
            rules="required"
            type="date"
            :min-date="minDate"
          />
        </kw-form-item>
        <!-- 입고창고 -->
        <kw-form-item
          :label="$t('MSG_TXT_STR_WARE')"
        >
          <kw-input
            v-model="searchParams.strOjWareNm"
            :readonly="true"
          />
        </kw-form-item>
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
        <span class="ml8">({{ $t('MSG_TXT_UNIT') }} : EA)</span>
      </template>
      <!-- 삭제 -->
      <kw-btn
        v-permission:delete
        grid-action
        :label="$t('MSG_BTN_DEL')"
        :disable="props.page !== pageProps.remove"
        @click="onClickDelete"
      />
      <!-- 출력 -->
      <kw-btn
        v-permission:print
        dense
        secondary
        :label="$t('MSG_BTN_PRINT')"
        :disable="props.page !== pageProps.remove"
        @click="onClickPrint"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <!-- 엑셀다운로드 -->
      <kw-btn
        v-permission:download
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
        v-permission:create
        primary
        dense
        :label="$t('MSG_TXT_DTRM')"
        :disable="props.page !== pageProps.confirm"
        @click="onClickConfirm"
      />
      <!-- 확정및출력 -->
      <kw-btn
        v-permission:create
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
import { openReportPopup, openReportPopupWithOptions } from '~common/utils/cmPopupUtil';

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

// 정상출고관리/출고관리 호출 팝업을 구분하기 위한 속성
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

const now = dayjs();
const minDate = now.format('YYYY-MM-DD');

// 조회
async function fetchData() {
  const fetchURI = ref(`${detailURI}`);
  // 부모화면에 따른 조회 URI 셋팅
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
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

// 조회버튼 클릭
async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  await fetchData();
}

// 엑셀 다운로드
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

// 창고마감여부 조회
async function checkWareClose(ostrDt, ostrOjWareNo) {
  if (!isEmpty(ostrDt) && !isEmpty(ostrOjWareNo)) {
    // 창고마감여부 조회
    const res = await dataService.get(`${baseURI}/ware-close-yn`, { params: { ostrDt, ostrOjWareNo } });
    return res.data === 'Y';
  }
  return false;
}

// 삭제
async function onClickDelete() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (isEmpty(checkedRows)) {
    notify(t('MSG_ALT_DEL_NO_DATA'));
    return;
  }

  const { rectOstrDt, ostrOjWareNo, ostrWareDvCd } = checkedRows[0];
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

  // 창고마감여부 조회
  const isWareClose = await checkWareClose(rectOstrDt, ostrOjWareNo);
  if (isWareClose) {
    // 해당 출고년월에는 이미 마감이 완료되어, 출고수정작업이 불가합니다.
    await alert(t('MSG_ALT_WARE_CLOSE_OSTR_IMP'));
    return;
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

const ozParam = ref({
  height: 1100,
  width: 1200,
});

// 출고증 출력
async function openReport(itmOstrNo, directYn) {
  const { width, height } = ozParam.value;

  if (directYn === 'Y') {
    const options = { directPrint: 'Y' };

    await openReportPopupWithOptions(
      '/kyowon_as/stckout.ozr',
      '/kyowon_as/stckout.odi',
      JSON.stringify({ ITM_OSTR_NO: itmOstrNo }),
      options,
      { width, height },
    );
  } else {
    await openReportPopup(
      '/kyowon_as/stckout.ozr',
      '/kyowon_as/stckout.odi',
      JSON.stringify({ ITM_OSTR_NO: itmOstrNo }),
      { width, height },
    );
  }
}

// 출력버튼 클릭 시
async function onClickPrint() {
  await openReport(props.itmOstrNo, 'N');
}

// 확정
async function callConfirm(isClose) {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (isEmpty(checkedRows)) {
    notify(t('MSG_ALT_NOT_SELECT_NOR_OSTR'));
    return;
  }

  if (!await confirm(t('MSG_ALT_WANT_DTRM'))) return;
  if (!await gridUtil.validate(view, { isCheckedOnly: true })) return;

  const { ostrOjWareNo, ostrWareDvCd } = checkedRows[0];
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

  const { ostrDt } = searchParams.value;

  if (isEmpty(ostrDt)) {
    // {0}은(는) 필수 항목입니다.
    await alert(`${t('MSG_TXT_OSTR_DT')}${t('MSG_ALT_NCELL_REQUIRED_ITEM')}`);
    return;
  }

  if (ostrDt < now.format('YYYYMMDD')) {
    // 출고일자는 현재일자 이후로 선택해 주세요.
    await alert(t('MSG_ALT_OSTR_DT_AFTER_CUR_DT'));
    return;
  }

  // 창고마감여부 조회
  const isWareClose = await checkWareClose(ostrDt, ostrOjWareNo);
  if (isWareClose) {
    // 해당 출고년월에는 이미 마감이 완료되어, 출고수정작업이 불가합니다.
    await alert(t('MSG_ALT_WARE_CLOSE_OSTR_IMP'));
    return;
  }

  const checkRows = checkedRows.map((v) => (v.ostrAkSn));

  // 출고 확정건수 조회
  let res = await dataService.get(`${baseURI}/confirm-count`, { params: { ostrAkSns: checkRows, ostrAkNo: checkedRows[0].ostrAkNo } });
  if (res.data > 0) {
    // 이미 정상출고 처리된 품목입니다.
    await alert(t('MSG_ALT_ALDY_NOR_OSTR_CMP'));
    return;
  }
  checkedRows.forEach((item) => {
    item.ostrDt = ostrDt;
  });

  res = await dataService.post(detailURI, checkedRows);
  const newItmOstrNo = res.data.data;
  if (!isEmpty(newItmOstrNo)) {
    // 확정 되었습니다.
    notify(t('MSG_TXT_CNFM_SCS'));
    ok();
    if (isClose) return;

    await openReport(newItmOstrNo, 'Y');
  }
}

// 확정버튼 클릭 시
async function onClickConfirm() {
  await callConfirm(true);
}

// 확정 및 출력버튼 클릭 시
async function onClickConfirmAfterMove() {
  await callConfirm(false);
}

// 출고요청정보 셋팅
function setSearchParams(res) {
  searchParams.value = cloneDeep(res.data);
  const { stckStdGb, ostrAkRgstDt } = res.data;

  searchParams.value.stckNoStdGb = stckStdGb === 'Y' ? 'N' : 'Y';
  searchParams.value.rgstDt = isEmpty(ostrAkRgstDt) ? dayjs().format('YYYYMMDD') : ostrAkRgstDt;
  if (props.page === pageProps.confirm) {
    searchParams.value.ostrDt = now.format('YYYYMMDD');
  }
}

// 표준미적용 여부 조회
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

// 파라미터에 해당하는 출고요청정보 조회
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
    { fieldName: 'chk', dataType: 'text', booleanFormat: 'N:Y' }, // 체크선택여부
    { fieldName: 'ostrAkTpCd' }, // 출고요청유형코드
    { fieldName: 'ostrTpCd' }, // 출고유형코드
    { fieldName: 'strTpCd' }, // 입고유형코드
    { fieldName: 'ostrOjWareNo' }, // 출고창고번호
    { fieldName: 'strOjWareNo' }, // 입고창고번호
    { fieldName: 'ostrAkRgstDt' }, // 출고요청등록일자
    { fieldName: 'ostrAkNo' }, // 출고요청번호
    { fieldName: 'ostrAkSn' }, // 출고요청일련번호
    { fieldName: 'strHopDt' }, // 입고희망일자
    { fieldName: 'svpdMgtTyp' }, // 재고유형
    { fieldName: 'svpdSapCd' }, // SAP코드
    { fieldName: 'itmPdCd' }, // 품목코드
    { fieldName: 'svpdNmKor' }, // 품목명
    { fieldName: 'svpdItemKnd' }, // 품목종류
    { fieldName: 'itemLoc' }, // 품목위치
    { fieldName: 'itmGdCd' }, // 등급
    { fieldName: 'qty', dataType: 'number' }, // 출고창고재고
    { fieldName: 'reqStckQty', dataType: 'number' }, // 입고창고재고
    { fieldName: 'ostrAkQty', dataType: 'number' }, // 신청수량
    { fieldName: 'ostrCnfmQty', dataType: 'number' }, // 확정수량
    { fieldName: 'ostrCnfmQtyOrg', dataType: 'number' }, // original 확정수량
    { fieldName: 'rmkCn' }, // 비고
    { fieldName: 'ostrCnfmCd' }, // 출고확정코드
    { fieldName: 'rectOstrDt' }, // 최근출고일자
    { fieldName: 'ostrAggQty', dataType: 'number' }, // 출고누계수량
    { fieldName: 'outQty', dataType: 'number' }, // 출고수량
    { fieldName: 'outQtyOrg', dataType: 'number' }, // original 출고수량
    { fieldName: 'strConfDt' }, // 입고확정일자
    { fieldName: 'strWareDvCd' }, // 입고창고구분
    { fieldName: 'strWareDtlDvCd' }, // 입고창고상세구분
    { fieldName: 'strWareNm' }, // 입고창고명
    { fieldName: 'strPrtnrNo' }, // 입고창고 파트너번호
    { fieldName: 'strOgTpCd' }, // 입고창고 조직유형코드
    { fieldName: 'ostrWareDvCd' }, // 출고창고구분
    { fieldName: 'ostrWareDtlDvCd' }, // 출고창고상세구분
    { fieldName: 'ostrWareNm' }, // 출고창고명
    { fieldName: 'ostrPrtnrNo' }, // 출고창고 파트너번호
    { fieldName: 'ostrOgTpCd' }, // 출고창고 조직유형코드
    { fieldName: 'boxUnitQty', dataType: 'number' }, // 박스단위수량
    { fieldName: 'mngtUnitCd' }, // 관리단위코드
    { fieldName: 'mngtUnitNm' }, // 관리단위
    { fieldName: 'itmOstrNo' }, // 품목출고번호
    { fieldName: 'ostrSn' }, // 출고일련번호
    { fieldName: 'ostrTms' }, // 출고빈도
    { fieldName: 'avgOut' }, // 센터평균출고량
    { fieldName: 'itmStrNo' }, // 품목입고번호
    { fieldName: 'strSn' }, // 입고일련번호
  ];

  const columns = [
    { fieldName: 'svpdMgtTyp',
      header: t('MSG_TXT_STOC_TYPE'),
      width: '80',
      styleName: 'text-center',
    },
    { fieldName: 'svpdSapCd', header: t('MSG_TXT_SAP_CD'), width: '95', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '110', styleName: 'text-center' },
    { fieldName: 'svpdNmKor', header: t('MSG_TXT_ITM_NM'), width: '200' },
    { fieldName: 'ostrTms', header: t('MSG_TXT_OSTR_FREQ'), width: '85', styleName: 'text-center' },
    { fieldName: 'itemLoc', header: t('MSG_TXT_ITM_LOC'), width: '100' },
    { fieldName: 'itmGdCd', header: t('MSG_TXT_GD'), width: '55', styleName: 'text-center' },
    { fieldName: 'qty', header: t('MSG_TXT_OSTR_WARE_STOC'), width: '100', styleName: 'text-right' },
    { fieldName: 'reqStckQty', header: t('MSG_TXT_STR_WARE_STOC'), width: '100', styleName: 'text-right' },
    { fieldName: 'avgOut', header: t('MSG_TXT_CNTR_AV_OSTR_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'ostrAkQty', header: t('MSG_TXT_RQST_QTY'), width: '80', styleName: 'text-right' }, // 신청수량
    { fieldName: 'ostrCnfmQty', header: t('MSG_TXT_CNFM_QTY'), width: '80', styleName: 'text-right' }, // 확정수량
    { fieldName: 'strHopDt', header: t('MSG_TXT_STR_HOP_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 입고희망일자
    { fieldName: 'ostrAggQty', header: t('MSG_TXT_OSTR_AGG'), width: '80', styleName: 'text-right' }, // 출고누계
    { fieldName: 'outQty',
      header: t('MSG_TXT_OSTR_QTY'),
      editable: props.page === pageProps.confirm,
      rules: 'required|min_value:1|max_value:999999999999',
      dataType: 'number',
      editor: {
        type: 'number',
        editFormat: '#,##0',
      },
      width: '90',
      styleName: 'text-right',
    },
    { fieldName: 'rmkCn', // 비고
      header: t('MSG_TXT_NOTE'),
      width: '150',
      styleName: 'text-left',
      rules: 'max:4000',
      editor: {
        type: 'text',
        editable: props.page === pageProps.confirm },
      editable: props.page === pageProps.confirm },
    { fieldName: 'mngtUnitNm', header: t('TXT_MSG_MNGT_UNIT_CD'), width: '90', styleName: 'text-center' },
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
