<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbSinglePaymentBulkChangeMgtP - 주문일괄변경 관리
3. 작성자 : gs.nidhi.d / JSY
4. 작성일 : 2023.04.27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 주문일괄변경 관리
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
  >
    <kw-form
      :cols="3"
    >
      <kw-form-row>
        <!-- 처리구분 -->
        <kw-form-item
          :label="$t('MSG_TXT_PROCS_DV')"
          required
        >
          <kw-select
            v-model="saveParams.procsDv"
            :label="$t('MSG_TXT_PROCS_DV')"
            :options="codes.CNTR_CH_TP_CD.filter((v) => v.codeId === '701' || v.codeId === '702'
              || v.codeId === '703' || v.codeId === '704' || v.codeId === '705'
              || v.codeId === '706'|| v.codeId === '707'|| v.codeId === '708'
              || v.codeId === '709'|| v.codeId === '710'|| v.codeId === '711')"
            rules="required"
            @change="onProcsDvChange"
          />
        </kw-form-item>
        <!-- 변경사유 -->
        <kw-form-item
          :label="$t('MSG_TXT_CH_RSON')"
          required
          :colspan="2"
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
        <!-- 보상일 -->
        <kw-form-item
          v-if="saveParams.procsDv==='701'"
          :label="$t('MSG_TXT_COMP_D')"
          required
          hint="KIWI철거일자와 같은날짜로 변경가능합니다."
        >
          <kw-date-picker
            v-model="saveParams.compD"
            :label="$t('MSG_TXT_COMP_D')"
            rules="required"
          />
        </kw-form-item>
        <!-- 취소일자 -->
        <kw-form-item
          v-if="saveParams.procsDv==='702'"
          :label="$t('MSG_TXT_CANC_DT')"
          required
        >
          <kw-date-picker
            v-model="saveParams.cancDt"
            :label="$t('MSG_TXT_CANC_DT')"
            rules="required"
          />
        </kw-form-item>
        <!-- 컨택코드 -->
        <kw-form-item
          v-if="saveParams.procsDv==='703'"
          :label="$t('MSG_TXT_CTT_CD')"
        >
          <kw-select
            v-model="saveParams.cttCd"
            :label="$t('MSG_TXT_CTT_CD')"
            :options="codes.WELLS_CTT_ACD"
          />
        </kw-form-item>
        <!-- 예정일 -->
        <kw-form-item
          v-if="saveParams.procsDv==='703'"
          :label="$t('MSG_TXT_DUEDT')"
          colspan="2"
        >
          <kw-date-picker
            v-model="saveParams.duedt"
            :label="$t('MSG_TXT_DUEDT')"
          />
          <!-- 예약일 삭제 -->
          <kw-checkbox
            v-model="saveParams.duedtDel"
            :label="$t('MSG_TXT_RSV_DATE')+' '+$t('MSG_TXT_DEL')"
            :true-value="'Y'"
            :false-value="'N'"
            class="ml20"
          />
        </kw-form-item>

        <!-- 할부이체 TODO : 추후 입력제한 추가 -->
        <kw-form-item
          v-if="saveParams.procsDv==='704'"
          :label="$t('MSG_TXT_ISTM_FNT')"
        >
          <kw-input
            v-model="saveParams.istmFnt"
            :label="$t('MSG_TXT_ISTM_FNT')"
            maxlength="100"
          />
        </kw-form-item>
        <!-- 멤버십이체  TODO : 추후 입력제한 추가 -->
        <kw-form-item
          v-if="saveParams.procsDv==='704'"
          :label="$t('MSG_TXT_MEMBRSHP_TRSFR')"
        >
          <kw-input
            v-model="saveParams.membrshpSrsfr"
            :label="$t('MSG_TXT_MEMBRSHP_TRSFR')"
            maxlength="100"
          />
        </kw-form-item>
        <!-- 정액여부 변경 -->
        <kw-form-item
          v-if="saveParams.procsDv==='705'"
          :label="$t('MSG_TXT_FXAM_YN')+' '+$t('MSG_TXT_CH')"
          required
        >
          <kw-select
            v-model="saveParams.fxamYnCh"
            :label="$t('MSG_TXT_FXAM_YN')+' '+$t('MSG_TXT_CH')"
            :options="codes.PMOT_PRMIT_YN_ACD"
            rules="required"
          />
        </kw-form-item>
        <!-- 인정건수 -->
        <kw-form-item
          v-if="saveParams.procsDv==='705'"
          :label="$t('MSG_TXT_PD_ACC_CNT')"
        >
          <kw-input
            v-model="saveParams.pdAccCnt"
            :label="$t('MSG_TXT_PD_ACC_CNT')"
            maxlength="10"
            :regex="/^[\d]*\.?[\d]{0,2}$/"
          />
        </kw-form-item>
        <!-- 인정금액 -->
        <kw-form-item
          v-if="saveParams.procsDv==='705'"
          :label="$t('MSG_TXT_RECOG_AMT')"
        >
          <kw-input
            v-model="saveParams.recogAmt"
            :label="$t('MSG_TXT_RECOG_AMT')"
            regex="num"
            maxlength="20"
          />
        </kw-form-item>
        <!-- 무상멤버십 -->
        <kw-form-item
          v-if="saveParams.procsDv==='706'"
          :label="$t('MSG_TXT_FRISU_MSH')"
        >
          <kw-input
            v-model="saveParams.frisuMsh"
            :label="$t('MSG_TXT_FRISU_MSH')"
            regex="num"
            maxlength="12"
          />
        </kw-form-item>
        <!-- 무상A/S -->
        <kw-form-item
          v-if="saveParams.procsDv==='706'"
          :label="$t('MSG_TXT_FRISU_AS')"
        >
          <kw-input
            v-model="saveParams.frisuAs"
            :label="$t('MSG_TXT_FRISU_AS')"
            regex="num"
            maxlength="3"
          />
        </kw-form-item>
        <!-- 행사코드 -->
        <kw-form-item
          v-if="saveParams.procsDv==='707'"
          :label="$t('MSG_TXT_EV_CD')"
        >
          <kw-input
            v-model="saveParams.evCd"
            :label="$t('MSG_TXT_EV_CD')"
            maxlength="1"
          />
        </kw-form-item>
        <!-- 예정일(접수일 변경) -->
        <kw-form-item
          v-if="saveParams.procsDv==='709'"
          :label="$t('MSG_TXT_DUEDT')"
        >
          <kw-date-picker
            v-model="saveParams.rcpDtChDuedt"
            :label="$t('MSG_TXT_DUEDT')"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 인정율(%) -->
        <kw-form-item
          v-if="saveParams.procsDv==='705'"
          :label="$t('MSG_TXT_RECOG_RT')+'(%)'"
        >
          <kw-input
            v-model="saveParams.recogRt"
            :label="$t('MSG_TXT_RECOG_RT')+'(%)'"
            maxlength="17"
            :regex="/^[\d]*\.?[\d]{0,4}$/"
          />
        </kw-form-item>
        <!-- 기준수수료 -->
        <kw-form-item
          v-if="saveParams.procsDv==='705'"
          :label="$t('MSG_TXT_PD_STD_FEE')"
        >
          <kw-input
            v-model="saveParams.pdStdFee"
            :label="$t('MSG_TXT_PD_STD_FEE')"
            regex="num"
            maxlength="20"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-action-top>
      <template #left>
        <kw-paging-info :total-count="pageInfo.totalCount" />
        <ul class="kw-notification ml10">
          <li>
            주문번호 뒷번호, 7자리가 아니여도 앞에 0을 입력하지 않습니다.
          </li>
        </ul>
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
      ref="grdSinglePaymentBulkChangeList"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      name="grdSinglePaymentBulkChangeList"
      @init="initSinglePaymentBulkChangeList"
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
const { getConfig, getUserInfo } = useMeta();
const userInfo = getUserInfo();
const now = dayjs();

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const grdSinglePaymentBulkChangeList = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const { modal, notify, alert } = useGlobal();
const { ok } = useModal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const codes = await codeUtil.getMultiCodes(
  'CNTR_CH_TP_CD',
  'WELLS_CTT_ACD',
  'PMOT_PRMIT_YN_ACD',
  'BFSVC_BZS_DV_CD',
  'SPLY_BZS_DV_CD',
);

let cachedParams;

const saveParams = ref({
  procsDv: '', // 처리구분
  chRson: '', // 변경사유
  compD: '', // 보상일
  cancDt: '', // 취소일자
  cttCd: '', // 컨택코드
  duedt: '', // 예정일
  duedtDel: 'N', // 예약일 삭제
  istmFnt: '', // 할부이체
  membrshpSrsfr: '', // 멤버십이체
  fxamYnCh: '', // 정액여부 변경
  pdAccCnt: '', // 인정건수
  recogAmt: '', // 인정금액
  recogRt: '', // 인정율
  pdStdFee: '', // 기준수수료
  frisuMsh: '', // 무상멤버십
  frisuAs: '', // 무상AS
  evCd: '', // 행사코드
  rcpDtChDuedt: '', // 예정일(접수일변경)
});

// 삭제 버튼 클릭
async function onClickRemove() {
  const view = grdSinglePaymentBulkChangeList.value.getView();

  await gridUtil.confirmDeleteCheckedRows(view);
  pageInfo.value.totalCount = view.getItemCount();
}

// 행 추가 버튼 클릭
async function onClickAdd() {
  const view = grdSinglePaymentBulkChangeList.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {});
  pageInfo.value.totalCount = view.getItemCount();
}

// 저장 버튼 클릭
async function onClickSave() {
  const view = grdSinglePaymentBulkChangeList.value.getView();
  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);

  cachedParams = {
    saveListReqs: changedRows,
    saveStatusReq: cloneDeep(saveParams.value),
  };
  if (isEmpty(saveParams.value.procsDv)) {
    alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_PROCS_DV')]));
    return;
  }
  if (isEmpty(saveParams.value.chRson)) {
    alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_CH_RSON')]));
    return;
  }
  for (let i = 0; i < changedRows.length; i += 1) {
    if (isEmpty(changedRows[i].cntrNo)) {
      alert(t('MSG_ALT_CHK_CNTR_NO', [changedRows[i].cntrDtlNo]));
      return;
    }
    if (changedRows[i].cntrDtlNo !== (`${changedRows[i].cntrNo}-${changedRows[i].cntrSn}`)) {
      alert(t('MSG_ALT_CHECK_ITEM', [i + 1, t('MSG_TXT_CNTR_DTL_NO')]));
      return;
    }

    if (saveParams.value.procsDv === '701') { // 보상일자변경
      if (isEmpty(saveParams.value.compD)) {
        alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_COMP_D')]));
        return;
      }
      if (saveParams.value.procsDv === changedRows[i].reqdDt) {
        // kiwi철거일자와 다르면 오류
        alert('MSG_ALT_KIWI_DEM_DT_CHK', [changedRows[i].cntrDtlNo]);
        return;
      }
    } else if (saveParams.value.procsDv === '702') { // 취소일자변경
      if (!isEmpty(changedRows[i].cpsDt)) { // 조회데이타에 보상일자가 있으면 보상완료고객으로 수정불가
        alert(t('MSG_TXT_NOT_MODIFY_COMP_COMPLETE', [changedRows[i].cntrDtlNo])); // 수정불가! 보상완료된 고객입니다.
        return;
      }
      if (!isEmpty(changedRows[i].cntrAmt) && changedRows[i].alncmpCd !== '57') { // 청약금이 존재할때 제휴카드='57' 이 아니면 수정불가
        alert(t('MSG_ALT_NOT_MODIFY_SBSCM_CST', [changedRows[i].cntrDtlNo])); // 수정불가! 청약금 존재고객입니다.
        return;
      }
      if ((userInfo.employeeIDNumber !== '36717'
      && userInfo.employeeIDNumber !== '36717'
      && userInfo.employeeIDNumber !== '36717') || !isEmpty(changedRows[i].istDt)) { // 사번이 36717,38754,31331 이 아니면 설치일자(IST_DT)가 있으면 수정불가
        alert(t('MSG_ALT_NOT_MODIFY_SBSCM_CST', [changedRows[i].cntrDtlNo])); // 수정불가! 설치완료된 고객입니다!
        return;
      }
    } else if (saveParams.value.procsDv === '703') { // 컨택정보변경
      if (saveParams.value.duedtDel === 'N' && isEmpty(saveParams.value.duedt)) {
        alert(t('MSG_ALT_NO_RSV_DATE_DEL'));
        return;
      }
      if (isEmpty(changedRows[i].cttOjId)) { // 컨택대상ID가 없으면 리턴
        alert(t('MSG_ALT_NO_CTT_OBJ', [changedRows[i].cntrDtlNo])); // 컨택대상이 없습니다.
        return;
      }
      if (!isEmpty(changedRows[i].cpsDt)) { // 보상일자가 있으면 보상완료고객으로 수정불가
        alert(t('MSG_TXT_NOT_MODIFY_COMP_COMPLETE', [changedRows[i].cntrDtlNo])); // 수정불가！보상완료된 고객입니다！
        return;
      }
      if (changedRows[i].cntrDtlStatCd !== '101') { // 계약상세상태코드(CNTR_DTL_STAT_CD)가 정상(101)이 아니면 수정불가
        alert(t('MSG_ALT_NOT_MODIFY_COMP_COMPLETE', [changedRows[i].cntrDtlNo])); // 수정불가！취소완료된 고객입니다！.
        return;
      }
      if (!isEmpty(changedRows[i].istDt)) { // 설치일자(IST_DT)가 있으면 설치고객은 수정불가
        alert(t('MSG_ALT_NOT_MODIFY_IST_COMPLETE', [changedRows[i].cntrDtlNo])); // 수정불가！ 설치완료된 고객입니다！
        return;
      }
      if (changedRows[i].cntrCnfmDtm.substring(0, 6) < now.format('YYYYMM')) { // 계약확정일시(CNTR_CNFM_DTM)월 < 현재월 이면 수정불가
        if (changedRows[i].sellTpDtlCd !== '12') { // 단 홈케어 제외
          alert(t('MSG_ALT_NOT_MODIFY_NO_THM_RCP', [changedRows[i].cntrDtlNo])); // 수정불가! 당월접수만 처리가능합니다!
          return;
        }
      }
    } else if (saveParams.value.procsDv === '704') {
      // TODO : AS-IS처리내역, 매핑안됨
      if (isEmpty(saveParams.value.istmFnt) && isEmpty(saveParams.value.membrshpSrsfr)) {
        alert(t('MSG_ALT_INPUT_ITEM1_OR_ITEM2', [t('MSG_TXT_ISTM_FNT'), t('MSG_TXT_MEMBRSHP_TRSFR')]));
        return;
      }
    } else if (saveParams.value.procsDv === '705') {
      // TODO : AS-IS처리내역, 매핑안됨
      if (isEmpty(saveParams.value.fxamYnCh)) {
        alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [`${t('MSG_TXT_FXAM_YN')} ${t('MSG_TXT_CH')}`]));
        return;
      }
    } else if (saveParams.value.procsDv === '706') {
      if (isEmpty(saveParams.value.frisuMsh) && isEmpty(saveParams.value.frisuAs)) {
        alert(t('MSG_ALT_INPUT_ITEM1_OR_ITEM2', [t('MSG_TXT_FRISU_MSH'), t('MSG_TXT_FRISU_AS')]));
        return;
      }
      if (changedRows[i].sellEvCd !== 'F') { // 행사코드 = 'F' 체크해서 아니면 수정불가(F:국고보조대상상품)
        alert(t('MSG_ALT_NOT_MODIFY_NO_NAT_SUB', [changedRows[i].cntrDtlNo])); // 수정불가.. 국고보조 대상상품이 아닙니다.
        return;
      }
      if (changedRows[i].cntrCnfmDtm.substring(0, 6) !== now.format('YYYYMM')) { // 계약확정일시월 체크해서 당월접수건만 처리가능
        alert(t('MSG_ALT_NOT_MODIFY_NO_THM_RCP', [changedRows[i].cntrDtlNo])); // 수정불가! 당월접수만 처리가능합니다!
        return;
      }
    } else if (saveParams.value.procsDv === '707') { // 행사코드 변경
      // 행사코드 값 확인
      if (isEmpty(saveParams.value.evCd)) {
        alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_EV_CD')]));
        return;
      }
      // 판매유형상세코드(SELL_TP_DTL_CD)=13,25:환경가전 여부 확인해서 환경가전이 아니면 수정불가
      if (changedRows[i].sellEvCd === 'F'
        && (changedRows[i].sellTpDtlCd !== '13' && changedRows[i].sellTpDtlCd !== '25')) { // 행사코드가 'F' 면 판매유형상세코드=13,25 아니면 수정불가
        alert(t('MSG_ALT_NOT_MODIFY_NO_ENVR_ELHM', [changedRows[i].cntrDtlNo])); // 수정불가.. 국고보조는 환경 가전만 가능합니다.
        return;
      }
      if (changedRows[i].cntrCnfmDtm.substring(0, 6) !== now.format('YYYYMM')) { // 계약확정일시월 체크해서 당월접수건만 처리가능
        alert(t('MSG_ALT_NOT_MODIFY_NO_THM_RCP', [changedRows[i].cntrDtlNo])); // 수정불가! 당월접수만 처리가능합니다!
        return;
      }
    } else if (saveParams.value.procsDv === '708') { // 설치 취소
      // 계약WELLS상세.설치일자(IST_DT)가 없으면 수정불가
      if (isEmpty(changedRows[i].istDt)) {
        alert(t('MSG_ALT_NOT_MODIFY_NO_IST_DT', [changedRows[i].cntrDtlNo])); // 수정불가! 설치된 계약만 처리가능합니다!
      }
      if (changedRows[i].istDt.substring(0, 6) !== now.format('YYYYMM')) { // 당월설치만 수정가능
        alert(t('MSG_ALT_NOT_MODIFY_NO_THM_IST', [changedRows[i].cntrDtlNo])); // 수정불가! 당월설치만 가능합니다!
        return;
      }
    } else if (saveParams.value.procsDv === '709') { // 접수일변경
      if (isEmpty(saveParams.value.rcpDtChDuedt)) { // 입력 접수일자 필수체크
        alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_DUEDT')]));
        return;
      }
      if (changedRows[i].cntrCnfmDtm.substring(0, 6) !== now.format('YYYYMM')) { // 계약확정일시월 체크해서 당월접수건만 처리가능
        alert(t('MSG_ALT_NOT_MODIFY_NO_THM_RCP', [changedRows[i].cntrDtlNo])); // 수정불가! 당월접수만 처리가능합니다!
        return;
      }

      // 제휴카드 = 60:카드사제휴 인 데이터만 변경가능
      if (changedRows[i].alncmpCd !== '60') {
        alert(t('MSG_ALT_NOT_MODIFY_NO_SUBSC_DATA', [changedRows[i].cntrDtlNo])); // 청약 데이터만 변경 가능합니다.
        return;
      }

      // 매출확정일(계약상품시작일자:CNTR_PD_STRTDT)이 있는 데이터는 수정불가
      if (!isEmpty(changedRows[i].cntrPdStrtdt)) {
        alert(t('MSG_ALT_NOT_MODIFY_SL_CNFM_DATA', [changedRows[i].cntrDtlNo])); // 매출 확정 데이터 입니다.
        return;
      }
    } else if (saveParams.value.procsDv === '710') {
      // 법인미수금(CRP_UC_AMT) 없으면 수정불가
      if (isEmpty(changedRows[i].crpUcAmt)) {
        alert(t('MSG_ALT_NOT_MODIFY_NO_CRP_UC_AMT', [changedRows[i].cntrDtlNo])); // 법인 미수금이 존재하지 않습니다
      }
      // TODO : 법인미수입금대상 작업 구분(LCST18) = 'B' 이면 이미 변경된 대상으로 수정불가 컬럼 확인 필요
    }
  }

  await dataService.post('/sms/wells/contract/changeorder/singlepayment-bulk-changes', cachedParams);
  ok();
  notify(t('MSG_ALT_SAVE_DATA'));
}

// 초기화버튼 클릭 이벤트
async function onProcsDvChange() {
  const view = grdSinglePaymentBulkChangeList.value.getView();
  if (saveParams.value.procsDv === '711') {
    view.columnsByTag('bs').forEach((col) => { col.visible = true; });
    view.columnsByTag('cntr').forEach((col) => { col.visible = false; });
  } else {
    view.columnsByTag('bs').forEach((col) => { col.visible = false; });
    view.columnsByTag('cntr').forEach((col) => { col.visible = true; });
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initSinglePaymentBulkChangeList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cstKnm' }, // 고객한글명
    { fieldName: 'rveCd' }, // 수납코드
    { fieldName: 'pyerNo' }, // 납부자번호
    { fieldName: 'basePdCd' }, // 기준상품코드
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'cntrRcpFshDtm' }, // 계약접수완료일시
    { fieldName: 'istDt' }, // 설치일자
    { fieldName: 'cntrCanDt' }, // 계약취소일
    { fieldName: 'cpsDt' }, // 보상일자
    { fieldName: 'sppDuedt' }, // 배송예정일자
    { fieldName: 'sppDuedt2' }, // 배송예정일자
    { fieldName: 'canPerfDt' }, // 실적취소일
    { fieldName: 'reqdDt' }, // 철거일자
    { fieldName: 'cttRsCd' }, // 컨택결과코드
    { fieldName: 'cttRsNm' }, // 컨택코드명
    { fieldName: 'booSellTpCd' }, // 예약판매유형코드
    { fieldName: 'booSellYn' }, // 예약판매여부
    { fieldName: 'booSellTpNm' }, // 예약판매유형코드명
    { fieldName: 'feeAckmtCt' }, // 수수료인정건수
    { fieldName: 'ackmtPerfAmt' }, // 인정실적금액
    { fieldName: 'ackmtPerfRt' }, // 인정실적율
    { fieldName: 'feeAckmtBaseAmt' }, // 수수료인정기준금액
    { fieldName: 'feeFxamYn' }, // 수수료정액여부
    { fieldName: 'dpTpCd' }, // 입금유형코드
    { fieldName: 'bfsvcBzsDvCd' }, // BS업체코드
    { fieldName: 'mmbsDpTpCd' }, // 입금유형코드
    { fieldName: 'copnDvYn' }, // 멤버십원장
    { fieldName: 'frisuBfsvcPtrmN' }, // 무상BS기간수
    { fieldName: 'frisuAsPtrmN' }, // 무상AS기간수
    { fieldName: 'sellEvCd' }, // 판매행사코드
    { fieldName: 'rgstDtm' }, // 계약기준 등록일
    { fieldName: 'cntrAmt' }, // 계약금액 - 청약금
    { fieldName: 'alncmpCd' }, // 제휴사코드
    { fieldName: 'cntrCnfmDtm' }, // 계약확정일시
    { fieldName: 'cttOjId' }, // 컨택대상ID
    { fieldName: 'cntrDtlStatCd' }, // 계약상세상태코드
    { fieldName: 'sellTpDtlCd' }, // 판매유형상세코드
    { fieldName: 'cntrPdStrtdt' }, // 계약상품시작일자
    { fieldName: 'crpUcAmt' }, // 법인미수금
    { fieldName: 'splyBzsDvCd' }, // 조달업체구분코드
    { fieldName: 'modBfsvcBzsDvCd' }, // 수정 업체BS구분
    { fieldName: 'modSplyBzsDvCd' }, // 수정 업체구분
  ];

  const columns = [
    { fieldName: 'cntrDtlNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '170',
      styleName: 'text-center rg-button-icon--search',
      rules: 'required',
      editor: { maxLength: 17 },
      button: 'action' }, // 계약상세번호
    { fieldName: 'cntrNo', header: '', width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'cntrSn', header: '', width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CNTOR_NM'), width: '117', styleName: 'text-center', editable: false }, // 계약자명
    { fieldName: 'basePdCd', header: t('MSG_TXT_PRDT_CODE'), width: '117', styleName: 'text-center', editable: false, tag: 'cntr' }, // 상품코드
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '229.8', styleName: 'text-center', editable: false, tag: 'cntr' }, // 상품명
    { fieldName: 'istDt', header: t('MSG_TXT_INST_DT'), width: '117', styleName: 'text-center', editable: false, tag: 'cntr' }, // 설치일
    { fieldName: 'reqdDt', header: `KIWI${t('MSG_TXT_REQD_D')}`, width: '117', styleName: 'text-center', editable: false, tag: 'cntr' }, // KIWI철거일
    { fieldName: 'cntrCanDt', header: t('MSG_TXT_CAN_D'), width: '117', styleName: 'text-center', editable: false, tag: 'cntr' }, // 취소일
    { fieldName: 'cpsDt', header: t('MSG_TXT_COMP_D'), width: '117', styleName: 'text-center', editable: false, tag: 'cntr' }, // 보상일
    { fieldName: 'sppDuedt', header: t('MSG_TXT_DUEDT'), width: '117', styleName: 'text-center', editable: false, tag: 'cntr' }, // 예정일
    { fieldName: 'cttRsNm', header: t('MSG_TXT_CNTCT_NM'), width: '165', styleName: 'text-center', editable: false, tag: 'cntr' }, // 컨택명
    { fieldName: 'feeAckmtCt', header: t('MSG_TXT_PD_ACC_CNT'), width: '117', styleName: 'text-center', editable: false, tag: 'cntr' }, // 인정건수
    { fieldName: 'ackmtPerfAmt', header: t('MSG_TXT_RECOG_AMT'), width: '117', styleName: 'text-center', editable: false, tag: 'cntr' }, // 인정금액
    { fieldName: 'ackmtPerfRt', header: t('MSG_TXT_RECOG_RT'), width: '117', styleName: 'text-center', editable: false, tag: 'cntr' }, // 인정율
    { fieldName: 'dpTpCd', header: t('MSG_TXT_ISTM_FNT'), width: '117', styleName: 'text-center', editable: false, tag: 'cntr' }, // 할부이체
    { fieldName: 'mmbsDpTpCd', header: t('MSG_TXT_MEMBRSHP_TRSFR'), width: '117', styleName: 'text-center', editable: false, tag: 'cntr' }, // 멤버십이체
    { fieldName: 'frisuBfsvcPtrmN', header: t('MSG_TXT_FRISU_MSH'), width: '117', styleName: 'text-center', editable: false, tag: 'cntr' }, // 무상멤버십
    { fieldName: 'frisuAsPtrmN', header: t('MSG_TXT_FRISU_AS'), width: '117', styleName: 'text-center', editable: false, tag: 'cntr' }, // 무상A/S
    { fieldName: 'sellEvCd', header: t('MSG_TXT_EV_CD'), width: '117', styleName: 'text-center', editable: false, tag: 'cntr' }, // 행사코드
    { fieldName: 'bfsvcBzsDvCd', header: t('MSG_TXT_CLSF_BS'), width: '117', styleName: 'text-center', editable: false, tag: 'bs', visible: false }, // 업체BS구분
    { fieldName: 'splyBzsDvCd', header: t('MSG_TXT_CLSF_BUS'), width: '117', styleName: 'text-center', editable: false, tag: 'bs', visible: false }, // 업체구분
    { fieldName: 'modBfsvcBzsDvCd',
      header: `${t('MSG_TXT_MOD')} ${t('MSG_TXT_CLSF_BS')}`,
      width: '117',
      styleName: 'text-center',
      tag: 'bs',
      editor: { type: 'list' },
      options: codes.BFSVC_BZS_DV_CD,
      placeHolder: t('선택'),
      visible: false }, // 수정 업체BS구분
    { fieldName: 'modSplyBzsDvCd',
      header: `${t('MSG_TXT_MOD')} ${t('MSG_TXT_CLSF_BUS')}`,
      width: '117',
      styleName: 'text-center',
      tag: 'bs',
      editor: { type: 'list' },
      options: codes.SPLY_BZS_DV_CD,
      placeHolder: t('선택'),
      visible: false }, // 수정 업체구분
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
        const paramCntrNo = String(cntrDtlNo).split('-')[0];
        const paramCntrSn = String(cntrDtlNo).split('-')[1];
        const { result, payload } = await modal({
          component: 'WwctaContractNumberListP',
          componentProps: {
            cntrNo: paramCntrNo, cntrSn: paramCntrSn,
          },
        });
        if (result) {
          const { cntrNo, cntrSn } = payload;
          const res = await dataService.get('/sms/wells/contract/changeorder/singlepayment-change-contracts', {
            params: {
              cntrNo,
              cntrSn,
            },
          });
          if ((!isEmpty(res.data))) {
            data.updateRow(dataRow, res.data);
          } else {
            for (let i = 0; i < data.getFieldCount(); i += 1) {
              data.setValue(dataRow, i, '');
            }
            data.setValue(dataRow, 'cntrDtlNo', `${payload.cntrNo}-${payload.cntrSn}`);
          }
        }
      }
    }
  };
  view.onCellButtonClicked = async (g, { itemIndex }) => {
    const updateRow = view.getCurrent().dataRow;
    const { cntrDtlNo } = g.getValues(itemIndex);
    const paramCntrNo = String(cntrDtlNo).split('-')[0];
    const paramCntrSn = String(cntrDtlNo).split('-')[1];
    const { result, payload } = await modal({
      component: 'WwctaContractNumberListP',
      componentProps: {
        cntrNo: paramCntrNo, cntrSn: paramCntrSn,
      },
    });
    if (result) {
      const { cntrNo, cntrSn } = payload;
      const res = await dataService.get('/sms/wells/contract/changeorder/singlepayment-change-contracts', {
        params: {
          cntrNo,
          cntrSn,
        },
      });

      if ((!isEmpty(res.data))) {
        data.updateRow(updateRow, res.data);
      } else {
        for (let i = 0; i < data.getFieldCount(); i += 1) {
          data.setValue(updateRow, i, '');
        }
        data.setValue(updateRow, 'cntrDtlNo', `${payload.cntrNo}-${payload.cntrSn}`);
      }
    }
  };
});
</script>
