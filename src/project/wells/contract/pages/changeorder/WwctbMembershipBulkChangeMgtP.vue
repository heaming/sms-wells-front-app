<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbMembershipBulkChangeMgtP - 멤버십 일괄변경 등록 화면
3. 작성자 : gs.ritvik.m / JSY
4. 작성일 : 2023.04.27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 멤버십 일괄변경 등록 화면
****************************************************************************************************
--->
<template>
  <!-- 멤버십 일괄변경 등록 -->
  <kw-popup
    size="2xl"
    :title="$t('MSG_TXT_MEM_BLK_CHNG')"
  >
    <kw-form :cols="2">
      <kw-form-row>
        <!-- 처리구분 -->
        <kw-form-item
          :label="$t('MSG_TXT_PROCS_DV')"
          required
        >
          <kw-select
            v-model="saveParams.procsDv"
            :label="$t('MSG_TXT_PROCS_DV')"
            :options="codes.CNTR_CH_TP_CD.filter((v) => v.codeId === '801' || v.codeId === '802'
              || v.codeId === '803' || v.codeId === '804' || v.codeId === '805')"
            rules="required"
            @change="onProcsDvChange"
          />
        </kw-form-item>
        <!-- 변경사유 -->
        <kw-form-item
          :label="$t('MSG_TXT_CH_RSON')"
          required
        >
          <kw-input
            v-model="saveParams.chRson"
            :label="$t('MSG_TXT_CH_RSON')"
            :readonly="saveParams.procsDv===''"
            rules="required"
            maxlength="1000"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 컨택코드 -->
        <kw-form-item
          v-if="saveParams.procsDv==='801'||saveParams.procsDv==='804'"
          :label="$t('MSG_TXT_CTT_CD')"
          required
        >
          <kw-select
            v-model="saveParams.cttCd"
            :label="$t('MSG_TXT_CTT_CD')"
            :options="codes.WELLS_CTT_ACD"
            rules="required"
          />
        </kw-form-item>
        <!-- 가입일 -->
        <kw-form-item
          v-if="saveParams.procsDv==='802'||saveParams.procsDv==='803'"
          :label="$t('MSG_TXT_SUBS_DT')"
          required
        >
          <kw-date-picker
            v-model="saveParams.subsDt"
            :label="$t('MSG_TXT_SUBS_DT')"
            rules="required"
          />
        </kw-form-item>
        <!-- 정액여부 변경 -->
        <kw-form-item
          v-if="saveParams.procsDv==='805'"
          :label="$t('MSG_TXT_FXAM_YN')+' '+$t('MSG_TXT_CH')"
          required
        >
          <kw-select
            v-model="saveParams.fxamYnCh"
            :label="$t('MSG_TXT_FXAM_YN')+' '+$t('MSG_TXT_CH')"
            :options="codes.PMOT_PRMIT_YN_ACD"
            first-option="all"
            :first-option-label="$t('MSG_TXT_SELT')"
            rules="required"
          />
        </kw-form-item>
        <!-- 기준수수료 -->
        <kw-form-item
          v-if="saveParams.procsDv==='805'"
          :label="$t('MSG_TXT_PD_STD_FEE')"
          required
        >
          <kw-input
            v-model="saveParams.pdStdFee"
            :label="$t('MSG_TXT_PD_STD_FEE')"
            rules="required"
            maxlength="15"
            type="number"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="pageInfo.totalCount" />
      </template>
      <!-- 삭제 -->
      <kw-btn
        v-permission:delete
        grid-action
        dense
        :label="$t('MSG_BTN_DEL')"
        @click="onClickRemove"
      />
      <kw-separator
        spaced
        vertical
        inset
      />
      <!-- 행추가 -->
      <kw-btn
        v-permission:create
        dense
        grid-action
        :label="$t('MSG_BTN_ROW_ADD')"
        @click="onClickAdd"
      />
      <!-- 저장 -->
      <kw-btn
        v-permission:create
        grid-action
        dense
        :label="$t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
    </kw-action-top>

    <kw-grid
      ref="grdMembershipBulkChangeRgsList"
      name="grdMembershipBulkChangeRgsList"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initMembershipBulkChangeRgsList"
    />
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, gridUtil, getComponentType, defineGrid, useDataService, useMeta, useGlobal, useModal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import dayjs from 'dayjs';

const { t } = useI18n();
const { getConfig } = useMeta();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const grdMembershipBulkChangeRgsList = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const { modal, notify, alert } = useGlobal();
const { ok } = useModal();
const now = dayjs();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'CNTR_CH_TP_CD',
  'WELLS_CTT_ACD',
  'PMOT_PRMIT_YN_ACD',
);
let cachedParams;
const saveParams = ref({
  procsDv: '', // 처리구분
  chRson: '', // 변경사유
  cttCd: '', // 컨택코드
  subsDt: '', // 가입일
  fxamYnCh: '', // 정액여부 변경
  pdStdFee: '', // 기준수수료
});

// 삭제 버튼 클릭
async function onClickRemove() {
  const view = grdMembershipBulkChangeRgsList.value.getView();

  await gridUtil.confirmDeleteCheckedRows(view);
  pageInfo.value.totalCount = view.getItemCount();
}

// 행 추가 버튼 클릭
async function onClickAdd() {
  if (isEmpty(saveParams.value.procsDv)) { // 변경유형 미선택 시 행 추가 불가
    alert(t('MSG_TXT_BEFORE_SELECT_IT', [t('MSG_TXT_PROCS_DV')])); // 처리구분(을)를 선택해주세요.
    return;
  }

  const view = grdMembershipBulkChangeRgsList.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {});
  pageInfo.value.totalCount = view.getItemCount();
}

// 저장 버튼 클릭
async function onClickSave() {
  const view = grdMembershipBulkChangeRgsList.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);
  // 처리구분 필수 체크
  if (isEmpty(saveParams.value.procsDv)) {
    alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_PROCS_DV')]));
    return;
  }

  // 변경 사유 필수 체크
  if (isEmpty(saveParams.value.chRson)) {
    alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_CH_RSON')]));
    return;
  }

  if (saveParams.value.procsDv === '801' || saveParams.value.procsDv === '804') {
    if (isEmpty(saveParams.value.cttCd)) { // 취소의 경우 컨택코드 필수 체크
      alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_CTT_CD')]));
      return;
    }
  } else if (saveParams.value.procsDv === '802') {
    if (isEmpty(saveParams.value.subsDt)) { // 가입일자 변경의 경우 가입일 필수 체크
      alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_SUBS_DT')]));
      return;
    }
    if (saveParams.value.subsDt > now.format('YYYYMMDD')) {
      alert(t('가입일자는 금일보다 클수없습니다.'));
      return;
    }
  } else if (saveParams.value.procsDv === '803') {
    if (isEmpty(saveParams.value.subsDt)) { // 가입일자 변경의 경우 가입일 필수 체크
      alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_SUBS_DT')]));
      return;
    }
    notify(saveParams.value.subsDt.substring(6, 8));
    if (saveParams.value.subsDt.substring(6, 8) !== '01') {
      alert(t('가입일자가 1일이 아닙니다'));
      return;
    }
    if (saveParams.value.subsDt > now.format('YYYYMMDD')) {
      alert(t('가입일자는 금일보다 클수없습니다.'));
      return;
    }
  } else if (saveParams.value.procsDv === '805') {
    if (isEmpty(saveParams.value.fxamYnCh)) { // 정액여부/기준수수료 변경의 경우 체크
      alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [`${t('MSG_TXT_FXAM_YN')} ${t('MSG_TXT_CH')}`]));
      return;
    }
    if (isEmpty(saveParams.value.pdStdFee)) {
      alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_PD_STD_FEE')]));
      return;
    }
    if (saveParams.value.pdStdFee <= 0) {
      alert(t('기준수수료는 0이상 이어야 합니다.'));
      return;
    }
  }
  for (let i = 0; i < changedRows.length; i += 1) {
    if (isEmpty(changedRows[i].cntrNo)) {
      alert(t('MSG_ALT_MEM_ONLY_CH'));
      return;
    }
    if (changedRows[i].cntrDtlNo !== (`${changedRows[i].cntrNo}-${changedRows[i].cntrSn}`)) {
      alert(t('MSG_ALT_CHECK_ITEM', [i + 1, t('MSG_TXT_CNTR_DTL_NO')]));
      return;
    }
  }

  cachedParams = {
    saveListReqs: changedRows,
    saveStatusReq: cloneDeep(saveParams.value),
  };
  await dataService.post('/sms/wells/contract/changeorder/membership-bulk-change', cachedParams);
  notify(t('MSG_ALT_SAVE_DATA'));
  ok();
}

// 처리구분 변경 이벤트
async function onProcsDvChange() {
  // 그리드 초기화
  grdMembershipBulkChangeRgsList.value.getData().clearRows();
}

// 그리드 조회 후 유효성 체크
async function onSearchItemCheck(payload, dataRow) {
  const view = grdMembershipBulkChangeRgsList.value.getView();

  const { cntrNo, cntrSn } = payload;
  const { procsDv } = saveParams.value;
  const res = await dataService.get('/sms/wells/contract/changeorder/membership-change-contracts', {
    params: {
      cntrNo,
      cntrSn,
      procsDv,
    },
  });
  if ((!isEmpty(res.data))) {
    view.setValues(dataRow, res.data);
  } else {
    view.setValue(dataRow, 'cntrNo', '');
    view.setValue(dataRow, 'cntrSn', '');
    view.setValue(dataRow, 'cstKnm', '');
    view.setValue(dataRow, 'sellInflwChnlDtlCd', '');
    view.setValue(dataRow, 'sellTpDtlCd', '');
    view.setValue(dataRow, 'sellPrtnrNo', '');
    view.setValue(dataRow, 'rveCd', '');
    view.setValue(dataRow, 'reqdDt', '');
    view.setValue(dataRow, 'rcpD', '');
    view.setValue(dataRow, 'istDt', '');
    view.setValue(dataRow, 'cntrPdStrtdt', '');
    view.setValue(dataRow, 'svPrd', '');
    view.setValue(dataRow, 'useyn', '');
    view.setValue(dataRow, 'basePdCd', '');
    view.setValue(dataRow, 'pdNm', '');
    view.setValue(dataRow, 'fnlAmt', '');
    view.setValue(dataRow, 'stlmTpCd', '');
    view.setValue(dataRow, 'frisuBfsvcPtrmN', '');
    view.setValue(dataRow, 'cntrwTpCd', '');
    view.setValue(dataRow, 'stplPtrm', '');
    view.setValue(dataRow, 'dtrmDate', '');
    view.setValue(dataRow, 'cntrCanDtm', '');
    view.setValue(dataRow, 'duedt', '');
    view.setValue(dataRow, 'cntrCnfmDtm', '');
    view.setValue(dataRow, 'wdwalDt', '');
    view.setValue(dataRow, 'vstPrd', '');
    view.setValue(dataRow, 'cttRsNm', '');
    view.setValue(dataRow, 'cttPsicNm', '');
    view.setValue(dataRow, 'hcrDvCd', '');
    view.setValue(dataRow, 'feeFxamYn', '');
    view.setValue(dataRow, 'feeAckmtBaseAmt', '');
    view.setValue(dataRow, 'sellDscDvCd', '');
    view.setValue(dataRow, 'sellDscrCd', '');
    view.setValue(dataRow, 'fstRgstDtm', '');
    view.setValue(dataRow, 'fstRgstUsrNm', '');
    view.setValue(dataRow, 'fnlMdfcDtm', '');
    view.setValue(dataRow, 'fnlMdfcUsrNm', '');
    view.setValue(dataRow, 'cntrDtlNo', `${payload.cntrNo}-${payload.cntrSn}`);
    alert(t('대상 계약이 아닙니다.'));
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initMembershipBulkChangeRgsList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'sellInflwChnlDtlCd' }, // 판매유입채널상세 - 판매구분
    { fieldName: 'sellTpDtlCd' }, // 판매유형상세코드 - 판매유형
    { fieldName: 'sellPrtnrNo' }, // 판매파트너번호-대리인코드
    { fieldName: 'rveCd' }, // 수납코드
    { fieldName: 'reqdDt' }, // 철거일자
    { fieldName: 'rcpD' }, // 접수일-변경요청접수일
    { fieldName: 'istDt' }, // 설치일
    { fieldName: 'cntrPdStrtdt' }, // 계약상품시작일자-매출일자
    { fieldName: 'cstKnm' }, // 고객명
    { fieldName: 'svPrd' }, // 서비스주기
    { fieldName: 'useyn' }, // 용도구분-매핑안됨
    { fieldName: 'basePdCd' }, // 기준상품코드
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'fnlAmt', dataType: 'number' }, // 멤버쉽회비
    { fieldName: 'stlmTpCd' }, // 결제유형코드-납입방법
    { fieldName: 'frisuBfsvcPtrmN' }, // 무상BS기간수-멤버십무상
    { fieldName: 'cntrwTpCd' }, // 계약서유형코드-멤버십구분
    { fieldName: 'stplPtrm' }, // 약정기간-멤버십기간
    { fieldName: 'stplPtrmUnitNm' }, // 약정기간단위
    { fieldName: 'dtrmDate' }, // 계약상품시작일자-확정일
    { fieldName: 'cntrCanDtm' }, // 계약취소일시-취소일시
    { fieldName: 'duedt' }, // 예정일(홈케어?)-매핑후처리필요
    { fieldName: 'cntrCnfmDtm' }, // 계약확정일시 -가입일:AS-IS대비 확인필요
    { fieldName: 'wdwalDt' }, // 탈퇴일
    { fieldName: 'vstPrd' }, // 방문주기
    { fieldName: 'cttRsCd' }, // 컨택코드
    { fieldName: 'cttRsNm' }, // 컨택코드명
    { fieldName: 'cttPsicId' }, // 컨택담당
    { fieldName: 'cttPsicNm' }, // 컨택담당명
    { fieldName: 'hcrDvCd' }, // 홈케어구분코드-상품구분
    { fieldName: 'feeFxamYn' }, // 수수료정액여부-정액여부(Y:수당제외)
    { fieldName: 'feeAckmtBaseAmt', dataType: 'number' }, // 수수료인정기준금액-수수료기준금액
    { fieldName: 'sellDscDvCd' }, // 판매할인구분코드-할인구분
    { fieldName: 'sellDscrCd' }, // 판매할인율코드-할인유형
    { fieldName: 'fstRgstDtm' }, // 최초등록일시-입력일자
    { fieldName: 'fstRgstUsrId' }, // 최초등록사용자ID-입력담당
    { fieldName: 'fstRgstUsrNm' }, // 입력담당자명
    { fieldName: 'fnlMdfcDtm' }, // 최종수정일시-수정일자
    { fieldName: 'fnlMdfcUsrId' }, // 최종수정사용자ID-수정담당
    { fieldName: 'fnlMdfcUsrNm' }, // 수정담당자명
    { fieldName: 'col30' }, // 상품구분2
    { fieldName: 'col35' }, // 그룹구분
  ];

  const columns = [
    { fieldName: 'cntrDtlNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '170',
      styleName: 'text-center rg-button-icon--search',
      rules: 'required',
      editor: { maxLength: 17 },
      button: 'action' }, // 계약상세번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '117', styleName: 'text-center', editable: false }, // 계약자명
    { fieldName: 'sellInflwChnlDtlCd', header: t('MSG_TXT_SLS_CAT'), width: '117', styleName: 'text-center', editable: false }, // 판매구분
    { fieldName: 'sellTpDtlCd', header: t('MSG_TXT_SEL_TYPE'), width: '117', styleName: 'text-center', editable: false }, // 판매유형
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_SELLER_PERSON'), width: '117', styleName: 'text-center', editable: false }, // 판매자
    { fieldName: 'rveCd', header: t('MSG_TXT_RVE_CD'), width: '117', styleName: 'text-center', editable: false }, // 수납코드
    { fieldName: 'reqdDt', header: `KIWI${t('MSG_TXT_REQD_D')}`, width: '117', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // KIWI철거일
    { fieldName: 'rcpD', header: t('MSG_TXT_RCP_D'), width: '117', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 접수일
    { fieldName: 'istDt', header: t('MSG_TXT_INST_DT'), width: '117', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 설치일
    { fieldName: 'cntrPdStrtdt', header: t('MSG_TXT_DT_OF_SALE'), width: '117', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 매출일
    { fieldName: 'svPrd', header: `BS ${t('MSG_TXT_CYCL')}`, width: '117', styleName: 'text-center', editable: false }, // BS 주기
    { fieldName: 'useyn', header: t('MSG_TXT_USWY_DV'), width: '117', styleName: 'text-center', editable: false }, // 용도구분
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '117', styleName: 'text-center', editable: false }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '224', styleName: 'text-center', editable: false }, // 상품명
    { fieldName: 'fnlAmt', header: t('MSG_TXT_MEM_DUES'), width: '117', styleName: 'text-center', numberFormat: '#,##0', editable: false }, // 멤버십회비
    { fieldName: 'stlmTpCd', header: t('MSG_TXT_PY_MTHD'), width: '117', styleName: 'text-center', editable: false }, // 납입방법
    { fieldName: 'frisuBfsvcPtrmN', header: t('MSG_TXT_MEM_FEE'), width: '117', styleName: 'text-center', editable: false }, // 멤버십무상
    { fieldName: 'cntrwTpCd', header: t('MSG_TXT_MSH_DV'), width: '117', styleName: 'text-center', editable: false }, // 멤버십구분
    { fieldName: 'stplPtrm', header: t('MSG_TXT_MEM_PRD'), width: '117', styleName: 'text-center', editable: false }, // 멤버십기간
    { fieldName: 'dtrmDate', header: t('MSG_TXT_DTRM_DATE'), width: '117', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 확정일
    { fieldName: 'cntrCanDtm', header: t('MSG_TXT_CAN_D'), width: '117', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 취소일
    { fieldName: 'duedt', header: t('MSG_TXT_DUEDT'), width: '117', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 예정일
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_SUBS_DT'), width: '117', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 가입일
    { fieldName: 'wdwalDt', header: t('MSG_TXT_WTDR_DT'), width: '117', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 탈퇴일
    { fieldName: 'vstPrd', header: t('MSG_TXT_VST_PRD'), width: '117', styleName: 'text-center', editable: false }, // 방문주기
    { fieldName: 'cttRsNm', header: t('MSG_TXT_CTT_CD_NM'), width: '117', styleName: 'text-center', editable: false }, // 컨택코드명
    { fieldName: 'cttPsicNm', header: t('MSG_TXT_CTT_ICHR'), width: '117', styleName: 'text-center', editable: false }, // 컨택담당
    { fieldName: 'hcrDvCd', header: `${t('MSG_TXT_PRDT_GUBUN')}1`, width: '117', styleName: 'text-center', editable: false }, // 상품구분1
    { fieldName: 'col30', header: `${t('MSG_TXT_PRDT_GUBUN')}2`, width: '117', styleName: 'text-center', editable: false, visible: false }, // 상품구분2 TODO : 추후 컬럼 확정되면 다시 반영
    { fieldName: 'feeFxamYn', header: t('MSG_TXT_FXAM_YN'), width: '117', styleName: 'text-center', editable: false }, // 정액여부
    { fieldName: 'feeAckmtBaseAmt', header: t('MSG_TXT_PD_STD_FEE'), width: '117', styleName: 'text-center', numberFormat: '#,##0', editable: false }, // 기준수수료
    { fieldName: 'sellDscDvCd', header: t('MSG_TXT_PD_DC_CLASS'), width: '117', styleName: 'text-center', editable: false }, // 할인구분
    { fieldName: 'sellDscrCd', header: t('MSG_TXT_DISC_CODE'), width: '117', styleName: 'text-center', editable: false }, // 할인유형
    { fieldName: 'col35', header: t('MSG_TXT_GRP_DV'), width: '117', styleName: 'text-center', editable: false, visible: false }, // 그룹구분 TODO : 추후 컬럼 확정되면 다시 반영
    { fieldName: 'fstRgstDtm', header: t('MSG_TXT_RGST_DT'), width: '117', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 등록일
    { fieldName: 'fstRgstUsrNm', header: t('MSG_TXT_FST_RGST_USR'), width: '117', styleName: 'text-center', editable: false }, // 등록자
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_FNL_MDFC_D'), width: '117', styleName: 'text-center', datetimeFormat: 'date', editable: false }, // 최종수정일
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FNL_MDFC_USR'), width: '117', styleName: 'text-center', editable: false }, // 최종수정자
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;

  view.onCellEdited = async function CellEdited(grid, index, dataRow, field) {
    if (field === 0) {
      const cntrDtlNo = grid.getValue(index, 0);
      if (!isEmpty(cntrDtlNo)) {
        const cntrNoSn = cntrDtlNo.replaceAll('-', '');
        const { result, payload } = await modal({
          component: 'WwctaContractNumberListP',
          componentProps: {
            cntrNo: cntrNoSn?.slice(0, 12), cntrSn: cntrNoSn?.slice(12),
          },
        });
        if (result) {
          onSearchItemCheck(payload, dataRow);
        }
      }
    }
  };
  view.onCellButtonClicked = async (g, { itemIndex }) => {
    const updateRow = view.getCurrent().dataRow;
    const { cntrDtlNo } = g.getValues(itemIndex);
    if (!isEmpty(cntrDtlNo)) {
      const cntrNoSn = cntrDtlNo.replaceAll('-', '');
      const { result, payload } = await modal({
        component: 'WwctaContractNumberListP',
        componentProps: {
          cntrNo: cntrNoSn?.slice(0, 12), cntrSn: cntrNoSn?.slice(12),
        },
      });
      if (result) {
        onSearchItemCheck(payload, updateRow);
      }
    } else {
      const { result, payload } = await modal({
        component: 'WwctaContractNumberListP',
      });
      if (result) {
        onSearchItemCheck(payload, updateRow);
      }
    }
  };
});
</script>
