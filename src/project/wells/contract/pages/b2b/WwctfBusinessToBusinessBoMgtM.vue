<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctfBusinessToBusinessBoMgtM - B2B BO관리
3. 작성자 : JSY
4. 작성일 : 2023.05.23
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- B2B BO관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      :modified-targets="['grdBusinessToBusinessBoList']"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 조회구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_INQR_DV')"
          required
        >
          <kw-select
            v-model="searchParams.srchGbn"
            :options="codes.PRJ_FOM_CD"
            first-option="all"
            :label="$t('MSG_TXT_INQR_DV')"
          />
        </kw-search-item>
        <!-- 조회기간 -->
        <kw-search-item
          :label="$t('MSG_TXT_LOOKUP_PERIOD')"
          :colspan="2"
          required
        >
          <kw-select
            v-model="searchParams.srchDateGbn"
            :options="searchDateGbnOptions"
            :label="$t('MSG_TXT_LOOKUP_PERIOD')"
            rules="required"
          />
          <kw-date-range-picker
            v-model:from="searchParams.strtdt"
            v-model:to="searchParams.enddt"
            :label="$t('MSG_TXT_LOOKUP_PERIOD')"
            type="date"
            rules="required"
          />
        </kw-search-item>
        <!-- 사업자번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_ENTRP_NO')"
        >
          <kw-input
            v-model="searchParams.bzrno"
            mask="###-##-#####"
            :max="10"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 업체명 -->
        <kw-search-item
          :label="$t('MSG_TXT_CORP_NAME')"
        >
          <kw-input
            v-model="searchParams.leadCstNm"
            :max="50"
          />
        </kw-search-item>
        <!-- 프로젝트ID -->
        <kw-search-item
          :label="$t('MSG_TXT_PROJECT_ID')"
        >
          <kw-input
            v-model="searchParams.prjNm"
            :max="50"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
        </template>
        <!-- 삭제 -->
        <kw-btn
          v-permission:delete
          grid-action
          :label="$t('MSG_BTN_DEL')"
          @click="onClickDelete"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 행추가 -->
        <kw-btn
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <!-- 저장 -->
        <kw-btn
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 엑셀다운로드 -->
        <kw-btn
          icon="download_on"
          :disable="pageInfo.totalCount === 0"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          @click="onClickExcelDownload"
        />
      </kw-action-top>

      <kw-grid
        ref="grdBusinessToBusinessBoList"
        name="grdBusinessToBusinessBoList"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initBusinessToBusinessBoList"
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
import dayjs from 'dayjs';

const { t } = useI18n();
const now = dayjs();
const dataService = useDataService();
const { getConfig } = useMeta();
const { currentRoute } = useRouter();
const { notify, modal } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdBusinessToBusinessBoList = ref(getComponentType('KwGrid'));
const codes = await codeUtil.getMultiCodes(
  'PRJ_FOM_CD',
  'OPPT_CNTR_FOM_CD',
  'RCVOD_PRBL_ACD',
);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const searchDateGbnOptions = ref([
  { codeId: '', codeName: t('MSG_TXT_SELT') },
  { codeId: '1', codeName: `BO${t('MSG_TXT_RGST_DT')}` },
  { codeId: '2', codeName: `${t('MSG_TXT_BID')}${t('MSG_TXT_DUEDT')}` },
]);
let cachedParams;

const searchParams = ref({
  srchGbn: '', // 조회구분
  srchDateGbn: '', // 조회기간구분
  strtdt: now.format('YYYYMM01'), // 조회기간시작
  enddt: now.format('YYYYMMDD'), // 조회기간끝
  bzrno: '', // 사업자번호
  leadCstNm: '', // 업체명
  prjNm: '', // 프로젝트ID
});

async function fetchData() {
  cachedParams = cloneDeep(searchParams.value);

  const res = await dataService.get('/sms/wells/contract/business-to-business/business-opportunities', { params: cachedParams });
  const view = grdBusinessToBusinessBoList.value.getView();

  const dataSource = view.getDataSource();
  dataSource.setRows(res.data);
  for (let i = 0; i < res.length; i += 1) {
    view.setValue(i, 'leadCstRlpplNm', view.getValues(i).leadCstNm);
  }
  pageInfo.value.totalCount = view.getItemCount();

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  await fetchData();
}

async function onClickExcelDownload() {
  const view = grdBusinessToBusinessBoList.value.getView();
  const res = await dataService.get('/sms/wells/contract/business-to-business/business-opportunities', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: res.data,
  });
}

async function onClickSave() {
  const view = grdBusinessToBusinessBoList.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  await dataService.post('/sms/wells/contract/business-to-business/business-opportunities', changedRows);

  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}
async function onClickDelete() {
  const view = grdBusinessToBusinessBoList.value.getView();
  if (!await gridUtil.confirmIfIsModified(view)) { return; }

  const deletedRows = await gridUtil.confirmDeleteCheckedRows(view);

  if (deletedRows.length) {
    await dataService.delete('/sms/wells/contract/business-to-business/business-opportunities', { data: deletedRows });
    notify(t('MSG_ALT_DELETED'));
    await onClickSearch();
  }
}
async function onClickAdd() {
  const view = grdBusinessToBusinessBoList.value.getView();
  const row = view.getCurrent().dataRow < 0 ? '0' : view.getCurrent().dataRow;
  await gridUtil.insertRowAndFocus(view, row, {});
}

async function onKeyManFind(dataRow) {
  const view = grdBusinessToBusinessBoList.value.getView();
  const res = await dataService.get('/sms/wells/contract/business-to-business/business-keyman', {
    params: {
      bzrno: view.getValues(dataRow).bzrno,
      leadCstNm: view.getValues(dataRow).leadCstNm,
    },
  });
  view.setValue(dataRow, 'leadCstRlpplNm', '');
  view.setValue(dataRow, 'locaraTno', '');
  view.setValue(dataRow, 'exnoEncr', '');
  view.setValue(dataRow, 'idvTno', '');
  view.setValue(dataRow, 'cralLocaraTno', '');
  view.setValue(dataRow, 'mexnoEncr', '');
  view.setValue(dataRow, 'cralIdvTno', '');
  view.setValue(dataRow, 'emadrCn', '');
  const resData = res.data;
  if ((!isEmpty(res.data))) {
    view.setValue(dataRow, 'leadCstRlpplNm', resData.leadCstRlpplNm);
    view.setValue(dataRow, 'locaraTno', resData.locaraTno);
    view.setValue(dataRow, 'exnoEncr', resData.exnoEncr);
    view.setValue(dataRow, 'idvTno', resData.idvTno);
    view.setValue(dataRow, 'cralLocaraTno', resData.cralLocaraTno);
    view.setValue(dataRow, 'mexnoEncr', resData.mexnoEncr);
    view.setValue(dataRow, 'cralIdvTno', resData.cralIdvTno);
    view.setValue(dataRow, 'emadrCn', resData.emadrCn);
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initBusinessToBusinessBoList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'leadCstId' }, // 리드고객ID
    { fieldName: 'leadCstRlpplId' }, // 리드고객관계자ID
    { fieldName: 'prjNm' }, // 프로젝트ID
    { fieldName: 'opptId' }, // 고유번호
    { fieldName: 'fstRgstDt' }, // BO등록일
    { fieldName: 'dgr3LevlOgCd' }, // 지점
    { fieldName: 'opptIchrPrtnrNo' }, // 사번
    { fieldName: 'prtnrKnm' }, // 실무담당자(교원)
    { fieldName: 'prjFomCd' }, // 프로젝트형태코드
    { fieldName: 'bzrno' }, // 사업자번호
    { fieldName: 'leadCstNm' }, // 업체명
    { fieldName: 'leadCstRlpplNm' }, // 업체담당자(KEY-MAN)
    { fieldName: 'clsfConta1' }, // 업체연락처1
    { fieldName: 'locaraTno' }, // 업체연락처1-1
    { fieldName: 'exnoEncr' }, // 업체연락처1-2
    { fieldName: 'idvTno' }, // 업체연락처1-3
    { fieldName: 'clsfConta2' }, // 업체연락처2
    { fieldName: 'cralLocaraTno' }, // 업체연락처2-1
    { fieldName: 'mexnoEncr' }, // 업체연락처2-2
    { fieldName: 'cralIdvTno' }, // 업체연락처2-3
    { fieldName: 'emadrCn' }, // 이메일
    { fieldName: 'crdrVal' }, // 신용등급
    { fieldName: 'etBiddDt' }, // 예상입찰일자
    { fieldName: 'opptCntrFomCd' }, // 기회계약형태코드
    { fieldName: 'totQty' }, // 총수량
    { fieldName: 'wrfrQty' }, // 정수기
    { fieldName: 'arcleQty' }, // 청정기
    { fieldName: 'bdtQty' }, // 비데
    { fieldName: 'etcQty' }, // 기타
    { fieldName: 'etRcvodQty' }, // 예상수주수량
    { fieldName: 'etRcvodRat' }, // 예상수주비율
    { fieldName: 'rcvodDt' }, // 수주일자
    { fieldName: 'lossDt' }, // 실주일자
    { fieldName: 'etCntrStrtdt' }, // 예상계약시작일자
    { fieldName: 'maxStplPtrm' }, // 약정기간
    { fieldName: 'biddBzsNm' }, // 입찰업체명
    { fieldName: 'unuitmCn' }, // 특이사항
    { fieldName: 'fnlMdfcDt' }, // 최종수정일자

  ];

  const columns = [
    { fieldName: 'leadCstId', visible: false },
    { fieldName: 'leadCstRlpplId', visible: false },
    { fieldName: 'prjNm',
      header: t('MSG_TXT_PROJECT_ID'),
      width: '142',
      styleName: 'text-center',
      rules: 'required',
      editor: {
        maxLength: 50,
      } }, // 프로젝트ID
    { fieldName: 'opptId', header: t('MSG_TXT_UNIQUE_NUM'), width: '142', styleName: 'text-center', editable: false }, // 고유번호
    { fieldName: 'fstRgstDt', header: `BO${t('MSG_TXT_RGST_DT')}`, width: '142', styleName: 'text-center', editable: false }, // BO등록일
    { fieldName: 'dgr3LevlOgCd', header: t('MSG_TXT_BRANCH'), width: '142', styleName: 'text-center', editable: false }, // 지점
    { fieldName: 'opptIchrPrtnrNo',
      header: t('MSG_TXT_EPNO'),
      width: '142',
      styleName: 'text-center rg-button-icon--search',
      button: 'action',
      rules: 'required',
      editor: {
        maxLength: 10,
      } }, // 사번
    { fieldName: 'prtnrKnm', header: `${t('MSG_TXT_PRACTICE_PSIC')}(${t('MSG_TXT_KW')})`, width: '142', styleName: 'text-center', editable: false }, // 실무담당자(교원)
    { fieldName: 'prjFomCd',
      header: t('MSG_TXT_SAP_TYPE'),
      width: '142',
      styleName: 'text-center',
      options: codes.PRJ_FOM_CD,
      editor: { type: 'list' } }, // 형태
    { fieldName: 'bzrno',
      header: t('MSG_TXT_ENTRP_NO'),
      width: '142',
      styleName: 'text-center',
      editor: {
        type: 'line',
        inputCharacters: ['0-9'],
        maxLength: 10,
        mask: {
          editMask: '999-99-99999',
        },

      },
      displayCallback(grid, index, value) {
        // 사업자번호 3-2-5 형식으로 표시
        if (!isEmpty(value) && value.length === 10) {
          return `${value.substr(0, 3)}-${value.substr(3, 2)}-${value.substr(5, 5)}`;
        }
      },
    }, // 사업자번호
    { fieldName: 'leadCstNm',
      header: t('MSG_TXT_CORP_NAME'),
      width: '214',
      editor: {
        maxLength: 50,
      } }, // 업체명
    { fieldName: 'leadCstRlpplNm',
      header: t('MSG_TXT_COMP_RSP_USR'),
      width: '212',
      styleName: 'text-center',
      editor: {
        maxLength: 100,
      } }, // 업체담당자
    { fieldName: 'clsfConta1',
      header: `${t('MSG_TXT_COMP')}${t('MSG_TXT_CONTACT')}1`,
      width: '142',
      styleName: 'text-center',
      editor: {
        inputCharacters: ['0-9'],
        maxLength: 11,
        type: 'telephone',
      },
      displayCallback(grid, index) {
        const { locaraTno, exnoEncr, idvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(locaraTno) && !isEmpty(exnoEncr) && !isEmpty(idvTno) ? `${locaraTno}-${exnoEncr}-${idvTno}` : '';
      } }, // 업체연락처1
    { fieldName: 'locaraTno', visible: false },
    { fieldName: 'exnoEncr', visible: false },
    { fieldName: 'idvTno', visible: false },
    { fieldName: 'clsfConta2',
      header: `${t('MSG_TXT_COMP')}${t('MSG_TXT_CONTACT')}2`,
      width: '142',
      styleName: 'text-center',
      editor: {
        inputCharacters: ['0-9'],
        maxLength: 11,
        type: 'telephone',
      },
      displayCallback(grid, index) {
        const { cralLocaraTno, mexnoEncr, cralIdvTno } = grid.getValues(index.itemIndex);
        return !isEmpty(cralLocaraTno) && !isEmpty(mexnoEncr) && !isEmpty(cralIdvTno) ? `${cralLocaraTno}-${mexnoEncr}-${cralIdvTno}` : '';
      } }, // 업체연락처2
    { fieldName: 'cralLocaraTno', visible: false },
    { fieldName: 'mexnoEncr', visible: false },
    { fieldName: 'cralIdvTno', visible: false },
    { fieldName: 'emadrCn',
      header: t('MSG_TXT_EMAIL'),
      width: '193',
      styleName: 'text-center',
      editor: {
        maxLength: 1000,
      } }, // 이메일
    { fieldName: 'crdrVal',
      header: t('MSG_TXT_CRED_GRD'),
      width: '127',
      styleName: 'text-center',
      editor: {
        maxLength: 10,
      } }, // 신용등급
    { fieldName: 'etBiddDt',
      header: `${t('MSG_TXT_BID')}${t('MSG_TXT_DUEDT')}`,
      width: '127',
      styleName: 'text-center',
      datetimeFormat: 'date',
      editor: {
        type: 'date',
      } }, // 입찰예정일
    { fieldName: 'opptCntrFomCd',
      header: t('MSG_TXT_CNTR_FOM'),
      width: '127',
      styleName: 'text-centerr',
      options: codes.OPPT_CNTR_FOM_CD,
      editor: { type: 'list' } }, // 계약형태
    { fieldName: 'totQty', header: t('MSG_TXT_TOT_QTY'), width: '127', styleName: 'text-center', editable: false }, // 총 수량
    { fieldName: 'wrfrQty', header: t('MSG_TXT_WRFR'), width: '142', styleName: 'text-center', editable: false }, // 정수기
    { fieldName: 'arcleQty', header: t('MSG_TXT_PUF'), width: '142', styleName: 'text-center', editable: false }, // 청정기
    { fieldName: 'bdtQty', header: t('MSG_TXT_BDT'), width: '142', styleName: 'text-center', editable: false }, // 비데
    { fieldName: 'etcQty', header: t('MSG_TXT_ETC'), width: '142', styleName: 'text-center', editable: false }, // 기타
    { fieldName: 'etRcvodQty',
      header: `${t('MSG_BTN_ET')}${t('MSG_TXT_QTY')}`,
      width: '142',
      styleName: 'text-center',
      editor: {
        type: 'number',
        maxLength: 12,
      } }, // 예상수량
    { fieldName: 'etRcvodRat',
      header: t('MSG_TXT_ORDERS_RT'),
      width: '142',
      styleName: 'text-center',
      options: codes.RCVOD_PRBL_ACD,
      editor: { type: 'list' } }, // 수주확률
    { fieldName: 'rcvodDt',
      header: t('MSG_TXT_ORDERS_DAY'),
      width: '142',
      styleName: 'text-center',
      datetimeFormat: 'date',
      editor: {
        type: 'date',
      } }, // 수주일
    { fieldName: 'lossDt',
      header: t('MSG_TXT_FALL_DAY'),
      width: '142',
      styleName: 'text-center',
      datetimeFormat: 'date',
      editor: {
        type: 'date',
      } }, // 낙주일
    { fieldName: 'etCntrStrtdt',
      header: t('MSG_TXT_CNTR_STRTDT'),
      width: '142',
      styleName: 'text-center',
      datetimeFormat: 'date',
      editor: {
        type: 'date',
      } }, // 계약시작일
    { fieldName: 'maxStplPtrm', header: t('MSG_TXT_DUTY_STPL'), width: '142', styleName: 'text-center', editable: false }, // 의무약정
    { fieldName: 'biddBzsNm',
      header: `${t('MSG_TXT_BID')}${t('MSG_TXT_COMP')}`,
      width: '142',
      styleName: 'text-center',
      editor: {
        maxLength: 100,
      } }, // 입찰업체
    { fieldName: 'unuitmCn',
      header: t('MSG_TXT_UNUITM'),
      width: '424',
      editor: {
        maxLength: 2000,
      } }, // 특이사항
    { fieldName: 'fnlMdfcDt', header: t('MSG_TXT_FNL_MDFC_DT'), width: '142', styleName: 'text-center', editable: false, datetimeFormat: 'date' }, // 최종수정일자

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  // multi row header setting
  view.setColumnLayout([
    'prjNm', 'opptId', 'fstRgstDt', 'dgr3LevlOgCd', 'opptIchrPrtnrNo', 'prtnrKnm', 'prjFomCd', 'bzrno', 'leadCstNm',
    {
      header: t('Key-Man'), // colspan title
      direction: 'horizontal', // merge type
      items: ['leadCstRlpplNm', 'clsfConta1', 'clsfConta2', 'emadrCn'],
    },
    'crdrVal', 'etBiddDt', 'opptCntrFomCd', 'totQty',
    {
      header: t('MSG_TXT_PDCT'),
      direction: 'horizontal',
      items: ['wrfrQty', 'arcleQty', 'bdtQty', 'etcQty'],
    },
    'etRcvodQty', 'etRcvodRat', 'rcvodDt', 'lossDt', 'etCntrStrtdt', 'maxStplPtrm', 'biddBzsNm', 'unuitmCn', 'fnlMdfcDt',
  ]);
  view.onCellButtonClicked = async (g, { itemIndex }) => {
    const updateRow = view.getCurrent().dataRow;
    const { payload } = await modal({
      component: 'ZwogzPartnerListP',
      componentProps: {
        prtnrNo: g.getValues(itemIndex).opptIchrPrtnrNo,
      },
    });
    if (!isEmpty(payload)) {
      data.setValue(updateRow, 'opptIchrPrtnrNo', payload.prtnrNo);
      data.setValue(updateRow, 'prtnrKnm', payload.prtnrKnm);
    }
  };
  view.onCellEdited = async function cellEdited(grid, itemIndex, dataRow, fieldIndex) {
    const columnName = grid.getColumn(fieldIndex).fieldName;
    const updateRow = view.getCurrent().dataRow;
    if (columnName === 'opptIchrPrtnrNo') {
      const { payload } = await modal({
        component: 'ZwogzPartnerListP',
        componentProps: {
          prtnrNo: grid.getValues(itemIndex).opptIchrPrtnrNo,
        },
      });
      if (!isEmpty(payload)) {
        data.setValue(updateRow, 'opptIchrPrtnrNo', payload.prtnrNo);
        data.setValue(updateRow, 'prtnrKnm', payload.prtnrKnm);
      }
    }
    if (columnName === 'bzrno' || columnName === 'leadCstNm') {
      const bzrnoParam = grid.getValue(updateRow, 9);
      const leadCstNmParam = grid.getValue(updateRow, 10);
      console.log(fieldIndex);
      if (!isEmpty(bzrnoParam) && !isEmpty(leadCstNmParam)) {
        onKeyManFind(itemIndex);
      }
    }
    if (columnName === 'clsfConta1') {
      const telNo = grid.getValue(updateRow, fieldIndex);
      const telNos = telNo.split('-');
      grid.commit();
      data.setValue(updateRow, 'locaraTno', telNos[0]);
      data.setValue(updateRow, 'exnoEncr', telNos[1]);
      data.setValue(updateRow, 'idvTno', telNos[2]);
    }
    if (columnName === 'clsfConta2') {
      const telNo = grid.getValue(updateRow, fieldIndex);
      const telNos = telNo.split('-');
      grid.commit();
      data.setValue(updateRow, 'cralLocaraTno', telNos[0]);
      data.setValue(updateRow, 'mexnoEncr', telNos[1]);
      data.setValue(updateRow, 'cralIdvTno', telNos[2]);
    }
  };
  view.setFixedOptions({
    colCount: 6,
  });
  view.onCellDblClicked = async (g, { itemIndex }) => {
    const rowValue = gridUtil.getRowValue(g, itemIndex);
    if (isEmpty(rowValue.opptId)) {
      notify(t('MSG_ALT_NOT_DTL_INFO'));
    } else {
      const { result } = await modal({
        component: 'WwctfBusinessToBusinessBoDtlP',
        componentProps: {
          opptId: rowValue.opptId,
        },
      });
      if (result) {
        await fetchData();
      }
    }
  };
});
</script>
<style scoped>
</style>
