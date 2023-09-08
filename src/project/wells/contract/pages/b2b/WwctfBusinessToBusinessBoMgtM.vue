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
            maxlength="50"
          />
        </kw-search-item>
        <!-- 프로젝트ID -->
        <kw-search-item
          :label="$t('MSG_TXT_PROJECT_ID')"
        >
          <kw-input
            v-model="searchParams.prjNm"
            maxlength="50"
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
          v-permission:create
          grid-action
          :label="$t('MSG_BTN_ROW_ADD')"
          @click="onClickAdd"
        />
        <!-- 저장 -->
        <kw-btn
          v-permission:update
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
        <kw-separator
          vertical
          inset
          spaced
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
import { getPhoneNumber } from '~sms-common/organization/utils/ogUtil';

const { t } = useI18n();
const now = dayjs();
const dataService = useDataService();
const { getConfig } = useMeta();
const { notify, modal, alert } = useGlobal();
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
  pageInfo.value.totalCount = view.getItemCount();

  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  await fetchData();
}
function validateEmail(strEmail) {
  const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(strEmail);
}
async function onClickSave() {
  const view = grdBusinessToBusinessBoList.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  for (let i = 0; i < changedRows.length; i += 1) {
    if (!isEmpty(changedRows[i].emadrCn)) {
      if (!validateEmail(changedRows[i].emadrCn)) {
        alert(t('MSG_ALT_EMAIL'));
        return;
      }
    }
    const tel1 = changedRows[i].telNo1.replaceAll('-', '');
    changedRows[i].locaraTno = getPhoneNumber(tel1, 1);
    changedRows[i].exnoEncr = getPhoneNumber(tel1, 2);
    changedRows[i].idvTno = getPhoneNumber(tel1, 3);
    const tel2 = changedRows[i].telNo2.replaceAll('-', '');
    changedRows[i].cralLocaraTno = getPhoneNumber(tel2, 1);
    changedRows[i].mexnoEncr = getPhoneNumber(tel2, 2);
    changedRows[i].cralIdvTno = getPhoneNumber(tel2, 3);
  }
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
  view.setValue(dataRow, 'telNo1', '');
  view.setValue(dataRow, 'telNo2', '');
  view.setValue(dataRow, 'emadrCn', '');
  const resData = res.data;
  if ((!isEmpty(res.data))) {
    view.setValue(dataRow, 'leadCstRlpplNm', resData.leadCstRlpplNm);
    if (!isEmpty(resData.locaraTno) && !isEmpty(resData.exnoEncr) && !isEmpty(resData.idvTno)) {
      view.setValue(dataRow, 'telNo1', `${resData.locaraTno}-${resData.exnoEncr}-${resData.idvTno}`);
    }
    if (!isEmpty(resData.cralLocaraTno) && !isEmpty(resData.mexnoEncr) && !isEmpty(resData.cralIdvTno)) {
      view.setValue(dataRow, 'telNo2', `${resData.cralLocaraTno}-${resData.mexnoEncr}-${resData.cralIdvTno}`);
    }
    if (!isEmpty(resData.emadrCn)) {
      view.setValue(dataRow, 'emadrCn', resData.emadrCn);
    }
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
    { fieldName: 'locaraTno' }, // 업체연락처1-1
    { fieldName: 'exnoEncr' }, // 업체연락처1-2
    { fieldName: 'idvTno' }, // 업체연락처1-3
    { fieldName: 'telNo1' }, // 업체연락처1
    { fieldName: 'cralLocaraTno' }, // 업체연락처2-1
    { fieldName: 'mexnoEncr' }, // 업체연락처2-2
    { fieldName: 'cralIdvTno' }, // 업체연락처2-3
    { fieldName: 'telNo2' }, // 업체연락처2
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
    { fieldName: 'ogTpCd' }, // 조직코드
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
    { fieldName: 'fstRgstDt', header: `BO${t('MSG_TXT_RGST_DT')}`, width: '142', styleName: 'text-center', editable: false, datetimeFormat: 'date' }, // BO등록일
    { fieldName: 'dgr3LevlOgCd', header: t('MSG_TXT_BRANCH'), width: '142', styleName: 'text-center', editable: false }, // 지점
    { fieldName: 'opptIchrPrtnrNo',
      header: t('MSG_TXT_EPNO'),
      width: '142',
      styleName: 'text-center rg-button-icon--search',
      button: 'action',
      rules: 'required',
      editor: {
        inputCharacters: ['0-9'],
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
        mask: {
          editMask: '999-99-99999',
        },
      },
      displayCallback: (g, i, v) => ((!isEmpty(v)) ? v.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3') : ''),
    }, // 사업자번호
    { fieldName: 'leadCstNm',
      header: t('MSG_TXT_CORP_NAME'),
      width: '214',
      styleName: 'text-center',
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
    { fieldName: 'locaraTno', visible: false },
    { fieldName: 'exnoEncr', visible: false },
    { fieldName: 'idvTno', visible: false },
    { fieldName: 'telNo1',
      header: `${t('MSG_TXT_COMP')}${t('MSG_TXT_CONTACT')}1`,
      width: '150',
      styleName: 'text-center',
      editor: { type: 'telephone' },
    },
    { fieldName: 'cralLocaraTno', visible: false },
    { fieldName: 'mexnoEncr', visible: false },
    { fieldName: 'cralIdvTno', visible: false },
    { fieldName: 'telNo2',
      header: `${t('MSG_TXT_COMP')}${t('MSG_TXT_CONTACT')}2`,
      width: '150',
      styleName: 'text-center',
      editor: { type: 'telephone' },
    },
    { fieldName: 'emadrCn',
      header: t('MSG_TXT_EMAIL'),
      width: '193',
      styleName: 'text-center',
      editor: {
        maxLength: 1000,
      },
    }, // 이메일
    { fieldName: 'crdrVal',
      header: t('MSG_TXT_CRED_GRD'),
      width: '127',
      styleName: 'text-center',
      editor: {
        maxLength: 10,
      } }, // 신용등급
    { fieldName: 'etBiddDt',
      header: `${t('MSG_TXT_BID')}${t('MSG_TXT_EXP_MM')}`,
      width: '127',
      styleName: 'text-center',
      datetimeFormat: 'date',
      editor: {
        type: 'date',
      } }, // 입찰예정월
    { fieldName: 'opptCntrFomCd',
      header: t('MSG_TXT_CNTR_FOM'),
      width: '127',
      styleName: 'text-center',
      options: codes.OPPT_CNTR_FOM_CD,
      editor: { type: 'list' } }, // 계약형태
    { fieldName: 'totQty', header: t('MSG_TXT_TOT_QTY'), width: '127', styleName: 'text-right', editable: false }, // 총 수량
    { fieldName: 'wrfrQty', header: t('MSG_TXT_WRFR'), width: '142', styleName: 'text-right', editable: false }, // 정수기
    { fieldName: 'arcleQty', header: t('MSG_TXT_PUF'), width: '142', styleName: 'text-right', editable: false }, // 청정기
    { fieldName: 'bdtQty', header: t('MSG_TXT_BDT'), width: '142', styleName: 'text-right', editable: false }, // 비데
    { fieldName: 'etcQty', header: t('MSG_TXT_ETC'), width: '142', styleName: 'text-right', editable: false }, // 기타
    { fieldName: 'etRcvodQty',
      header: `${t('MSG_BTN_ET')}${t('MSG_TXT_QTY')}`,
      width: '142',
      styleName: 'text-right',
      editor: {
        type: 'number',
        maxLength: 12,
      } }, // 예상수량
    { fieldName: 'etRcvodRat',
      header: t('MSG_TXT_ORDERS_RT'),
      width: '142',
      styleName: 'text-right',
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
    { fieldName: 'maxStplPtrm', header: t('MSG_TXT_DUTY_STPL'), width: '142', styleName: 'text-right', editable: false }, // 의무약정
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
    { fieldName: 'ogTpCd', visible: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  view.copyOptions.enabled = false;
  // multi row header setting
  view.setColumnLayout([
    'prjNm', 'opptId', 'fstRgstDt', 'dgr3LevlOgCd', 'opptIchrPrtnrNo', 'prtnrKnm', 'prjFomCd', 'bzrno', 'leadCstNm',
    {
      header: t('Key-Man'), // colspan title
      direction: 'horizontal', // merge type
      items: ['leadCstRlpplNm', 'telNo1', 'telNo2', 'emadrCn'],
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
      data.setValue(updateRow, 'dgr3LevlOgCd', payload.dgr3LevlOgCd);
      data.setValue(updateRow, 'ogTpCd', payload.ogTpCd);
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
        data.setValue(updateRow, 'dgr3LevlOgCd', payload.dgr3LevlOgCd);
        data.setValue(updateRow, 'ogTpCd', payload.ogTpCd);
      }
    }
    if (columnName === 'bzrno' || columnName === 'leadCstNm') {
      const bzrnoParam = grid.getValue(updateRow, 9);
      const leadCstNmParam = grid.getValue(updateRow, 10);
      if (!isEmpty(bzrnoParam) && !isEmpty(leadCstNmParam)) {
        onKeyManFind(itemIndex);
      }
    }
    if (columnName === 'rcvodDt' || columnName === 'etCntrStrtdt') {
      const lossDt = grid.getValue(updateRow, 32);
      if (!isEmpty(lossDt)) {
        view.commit();
        data.setValue(updateRow, 'rcvodDt', '');
        data.setValue(updateRow, 'etCntrStrtdt', '');
        alert('낙주일이 존재합니다.');
      }
      const rcvodDt = grid.getValue(updateRow, 31);
      const etCntrStrtdt = grid.getValue(updateRow, 33);
      if (rcvodDt > etCntrStrtdt && !isEmpty(etCntrStrtdt) && !isEmpty(rcvodDt)) {
        view.commit();
        if (columnName === 'rcvodDt') {
          data.setValue(updateRow, 'etCntrStrtdt', rcvodDt);
        } else {
          data.setValue(updateRow, 'rcvodDt', etCntrStrtdt);
        }
      }
    }
    if (columnName === 'lossDt') {
      const rcvodDt = grid.getValue(updateRow, 31);
      const etCntrStrtdt = grid.getValue(updateRow, 33);
      if (!isEmpty(rcvodDt)) {
        view.commit();
        data.setValue(updateRow, 'lossDt', '');
        alert('수주일이 존재합니다.');
      } else if (!isEmpty(etCntrStrtdt)) {
        view.commit();
        data.setValue(updateRow, 'lossDt', '');
        alert('계약시작일이 존재합니다.');
      }
    }
  };
  view.setFixedOptions({
    colCount: 1,
  });
  view.onCellDblClicked = async (g, { itemIndex }) => {
    const rowValue = gridUtil.getRowValue(g, itemIndex);
    if (isEmpty(rowValue.opptId)) {
      notify(t('MSG_ALT_NOT_DTL_INFO'));
    } else {
      await modal({
        component: 'WwctfBusinessToBusinessBoDtlP',
        componentProps: {
          opptId: rowValue.opptId,
        },
      });
      await fetchData();
    }
  };
});
</script>
<style scoped>
</style>
