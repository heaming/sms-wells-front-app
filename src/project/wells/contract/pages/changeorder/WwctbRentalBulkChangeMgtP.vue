<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbRentalBulkChangeMgtP - 렌탈 일괄변경 등록(W-SS-U-0113P01)
3. 작성자 : gs.rahul.n / JSY
4. 작성일 : 2023.04.25
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 렌탈 일괄변경 등록
****************************************************************************************************
--->
<template>
  <!-- 렌탈 일괄변경 등록 -->
  <kw-popup
    size="2xl"
    :title="$t('MSG_TXT_REG_RENT_BATCH_CHNG')"
  >
    <kw-form
      :cols="2"
    >
      <kw-form-row>
        <!-- 처리구분 -->
        <kw-form-item
          :label="$t('MSG_TXT_PROCS_DV')"
          required
        >
          <kw-select
            v-model="saveParams.procsDv"
            :options="codes.CNTR_CH_TP_CD.filter((v) => v.codeId === '601' || v.codeId === '604'
              || v.codeId === '605' || v.codeId === '607' || v.codeId === '608'
              || v.codeId === '609'|| v.codeId === '611'|| v.codeId === '612'
              || v.codeId === '613'|| v.codeId === '615'|| v.codeId === '616'
              || v.codeId === '617'|| v.codeId === '618'
              || v.codeId === '620'|| v.codeId === '621'|| v.codeId === '622'
              || v.codeId === '623'|| v.codeId === '624'|| v.codeId === '625'
              || v.codeId === '626'|| v.codeId === '711')"
            rules="required"
            :label="$t('MSG_TXT_PROCS_DV')"
            @change="onProcsDvChange"
          />
        </kw-form-item>
        <!-- 설치년월 -->
        <kw-form-item
          v-if="saveParams.procsDv==='604'"
          :label="$t('MSG_TXT_YR_INSTALLATION')"
        >
          <kw-date-picker
            v-model="saveParams.yrInstallation"
            type="month"
            :label="$t('MSG_TXT_YR_INSTALLATION')"
          />
        </kw-form-item>
        <!-- 의무기간 -->
        <kw-form-item
          v-if="saveParams.procsDv==='605'"
          :label="$t('MSG_TXT_DUTY_PTRM')"
        >
          <kw-input
            v-model="saveParams.dutyPtrmStrt"
            :label="$t('MSG_TXT_DUTY_PTRM')"
            regex="num"
            maxlength="2"
          />
          <span>-></span>
          <kw-input
            v-model="saveParams.dutyPtrmEnd"
            :label="$t('MSG_TXT_DUTY_PTRM')"
            regex="num"
            maxlength="2"
          />
        </kw-form-item>
        <!-- 인정실적 -->
        <kw-form-item
          v-if="saveParams.procsDv==='608'||saveParams.procsDv==='621'"
          :label="$t('MSG_TXT_PD_ACC_RSLT')"
        >
          <kw-input
            v-model="saveParams.pdAccRslt"
            :label="$t('MSG_TXT_PD_ACC_RSLT')"
            regex="num"
            maxlength="15"
          />
        </kw-form-item>
        <!-- 수수료기준가격 -->
        <kw-form-item
          v-if="saveParams.procsDv==='609'||saveParams.procsDv==='622'"
          :label="$t('MSG_TXT_FEE_ACKMT_BASE_AMT')"
        >
          <kw-input
            v-model="saveParams.feeAckmtBaseAmt"
            :label="$t('MSG_TXT_FEE_ACKMT_BASE_AMT')"
            regex="num"
            maxlength="15"
          />
        </kw-form-item>
        <!-- 수수료인정건수 -->
        <kw-form-item
          v-if="saveParams.procsDv==='611'||saveParams.procsDv==='626'"
          :label="$t('MSG_TXT_FEE_ACKMT_CNT')"
        >
          <kw-input
            v-model="saveParams.feeAckmtCnt"
            :label="$t('MSG_TXT_FEE_ACKMT_CNT')"
            :regex="/^[\d]*\.?[\d]{0,2}$/"
            maxlength="10"
          />
        </kw-form-item>
        <!-- 렌탈DC -->
        <kw-form-item
          v-if="saveParams.procsDv==='612'"
          :label="$t('MSG_TXT_RENTAL')+'DC'"
        >
          <kw-input
            v-model="saveParams.rentalDc"
            :label="$t('MSG_TXT_RENTAL')+'DC'"
            regex="num"
            maxlength="15"
          />
        </kw-form-item>
        <!-- 설치일자 -->
        <kw-form-item
          v-if="saveParams.procsDv==='613'"
          :label="$t('MSG_TXT_IST_DT')"
        >
          <kw-date-picker
            v-model="saveParams.paramIstDt"
            :label="$t('MSG_TXT_IST_DT')"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-action-top class="mt20">
      <template #left>
        <kw-paging-info
          :total-count="pageInfo.totalCount"
        />
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
      <!-- 행 추가 -->
      <kw-btn
        v-permission:create
        dense
        grid-action
        :label="$t('MSG_BTN_ROW_ADD')"
        @click="onClickAdd"
      />
      <!-- 저장 -->
      <kw-btn
        v-permission:update
        grid-action
        dense
        :label="$t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
    </kw-action-top>
    <kw-grid
      ref="grdRentalBulkChangeMgtList"
      name="grdRentalBulkChangeMgtList"
      :page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @init="initRentalBulkChangeMgtList"
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
const now = dayjs();
const grdRentalBulkChangeMgtList = ref(getComponentType('KwGrid'));
const dataService = useDataService();
const { modal, notify, alert } = useGlobal();
const { ok } = useModal();
const codes = await codeUtil.getMultiCodes(
  'CNTR_CH_TP_CD',
  'BFSVC_BZS_DV_CD',
  'SPLY_BZS_DV_CD',
  'PMOT_PRMIT_YN_ACD',
);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  procsDv: { type: String, default: undefined },
});

let cachedParams;

const saveParams = ref({
  procsDv: props.procsDv, // 처리구분
  yrInstallation: '', // 설치년월
  dutyPtrmStrt: '', // 의무기간Start
  dutyPtrmEnd: '', // 의무기간End
  pdAccRslt: '', // 인정실적
  feeAckmtBaseAmt: '', // 수수료기준가격
  feeAckmtCnt: '', // 수수료인정건수
  rentalDc: '', // 렌탈DC
  paramIstDt: now.format('YYYYMMDD'), // 설치일자
});

// 삭제 버튼 클릭
async function onClickRemove() {
  const view = grdRentalBulkChangeMgtList.value.getView();

  await gridUtil.confirmDeleteCheckedRows(view);
  pageInfo.value.totalCount = view.getItemCount();
}

// 행 추가 버튼 클릭
async function onClickAdd() {
  if (isEmpty(saveParams.value.procsDv)) { // 변경유형 미선택 시 행 추가 불가
    alert(t('MSG_TXT_BEFORE_SELECT_IT', [t('MSG_TXT_PROCS_DV')])); // 처리구분(을)를 선택해주세요.
    return;
  }
  if (saveParams.value.procsDv === '604') { // 설치월면제
    if (isEmpty(saveParams.value.yrInstallation)) { // 설치년월 미입력 이면
      alert(t('MSG_TIT_BE_CHOOSE_FIRST', [t('MSG_TXT_YR_INSTALLATION')])); // 설치년월  을(를) 먼저 선택해주세요.
      return;
    }
  } else if (saveParams.value.procsDv === '605') { // 의무기간
    if (isEmpty(saveParams.value.dutyPtrmStrt) || isEmpty(saveParams.value.dutyPtrmEnd)) { // 의무기간 미입력 이면
      alert(t('MSG_TIT_BE_CHOOSE_FIRST', [t('MSG_TXT_DUTY_PTRM')])); // 의무기간 을(를) 먼저 선택해주세요.
      return;
    }
  } else if (saveParams.value.procsDv === '613') { // 미관리제품 설치일자
    if (isEmpty(saveParams.value.paramIstDt)) { // 설치일 미입력 이면
      alert(t('MSG_TIT_BE_CHOOSE_FIRST', [t('MSG_TXT_INST_DT')])); // 설치일 을(를) 먼저 선택해주세요.
      return;
    }
  }
  const view = grdRentalBulkChangeMgtList.value.getView();
  gridUtil.insertRowAndFocus(view, 0, {});
  pageInfo.value.totalCount = view.getItemCount();
}
// 이메일 형식 체크
function validateEmail(strEmail) {
  const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(strEmail);
}

// 전화번호 형식 체크
function validatePhone(strPhone) {
  const re = /^(01[016789]{1})[0-9]{3,4}[0-9]{4}$/;
  return re.test(strPhone);
}

// 저장 버튼 클릭
async function onClickSave() {
  const view = grdRentalBulkChangeMgtList.value.getView();

  if (await gridUtil.alertIfIsNotModified(view)) { return; }
  if (!await gridUtil.validate(view)) { return; }

  const changedRows = gridUtil.getChangedRowValues(view);

  cachedParams = {
    saveListReqs: changedRows,
    saveStatusReq: cloneDeep(saveParams.value),
  };
  if (isEmpty(saveParams.value.procsDv)) { // 처리구분 필수 체크
    alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('MSG_TXT_PROCS_DV')]));
    return;
  }
  if (saveParams.value.procsDv === '612' || saveParams.value.procsDv === '620' || saveParams.value.procsDv === '623') {
    alert(t('서비스 확인 중 입니다.'));
    return;
  }

  for (let i = 0; i < changedRows.length; i += 1) {
    if (isEmpty(changedRows[i].cntrNo)) { // 조회 데이터 체크
      alert(t('MSG_ALT_CHK_CNTR_NO', [changedRows[i].cntrDtlNo]));
      return;
    }
    if (changedRows[i].cntrDtlNo !== (`${changedRows[i].cntrNo}-${changedRows[i].cntrSn}`)) { // 계약번호 수정 여부 체크
      alert(t('MSG_ALT_CHECK_ITEM', [changedRows[i].dataRow, t('MSG_TXT_CNTR_DTL_NO')]));
      return;
    }
    if (saveParams.value.procsDv === '601') {
      // 렌탈취소원복
    } else if (saveParams.value.procsDv === '604') { // 설치월면제
      if (isEmpty(saveParams.value.yrInstallation)) { // 설치월 체크
        alert(t('MSG_ALT_CHK_CONFIRM', [t('MSG_TXT_YR_INSTALLATION')])); // 설치년월 을(를) 확인하세요.
        return;
      }
      if (saveParams.value.yrInstallation < now.add(-1, 'month').format('YYYYMM')) { // 입력설치년월이 전월보다 작으면
        alert(t('MSG_ALT_CHK_CONFIRM', [t('MSG_TXT_YR_INSTALLATION')])); // 설치년월 을(를) 확인하세요.
        return;
      }
      if (saveParams.value.yrInstallation !== changedRows[i].istDt.substring(0, 6)) {
        alert(t('MSG_ALT_CHK_CONFIRM', [t('MSG_TXT_YR_INSTALLATION')])); // 설치년월 을(를) 확인하세요.
        return;
      }
    } else if (saveParams.value.procsDv === '605') { // 의무기간
      if (isEmpty(saveParams.value.dutyPtrmStrt) || isEmpty(saveParams.value.dutyPtrmEnd)) { // 의무기간 필수체크
        alert(t('MSG_ALT_CHK_CONFIRM', [t('MSG_TXT_DUTY_PTRM')])); // 의무기간 을(를) 확인하세요.
        return;
      }
      if (saveParams.value.dutyPtrmStrt === saveParams.value.dutyPtrmEnd) { // 입력기간 체크:현약정기간, 변경약정기간이 같을 수 없다.
        alert(t('MSG_ALT_CHK_CONFIRM', [t('MSG_TXT_DUTY_PTRM')])); // 의무기간 을(를) 확인하세요.
        return;
      }
      if (saveParams.value.dutyPtrmStrt !== changedRows[i].stplPtrm) { // 입력된 현약정기간이 약정기간과 다르면
        alert(t('이전 의무기간을 확인하세요')); // 이전 의무기간을 확인하세요
        return;
      }
    } else if (saveParams.value.procsDv === '607') { // 접수취소
      if (changedRows.length > 1) { // 접수취소는 1건씩 처리가능
        alert(t('MSG_ALT_ONE_RGST', [`${t('MSG_TXT_RCP')}${t('MSG_TXT_CANCEL')}`])); // 접수취소는 1건씩 등록해 주세요
        return;
      }
    } else if (saveParams.value.procsDv === '608') { // 인정실적 금액변경
      if (isEmpty(saveParams.value.pdAccRslt)) { // 인정실적 필수 체크
        alert(t('MSG_ALT_CHK_CONFIRM', [t('MSG_TXT_PD_ACC_RSLT')])); // 인정실적 을(를) 확인하세요.
        return;
      }
    } else if (saveParams.value.procsDv === '609') { // 수수료 기준가격변경
      if (isEmpty(saveParams.value.feeAckmtBaseAmt)) { // 기준가격 필수체크
        alert(t('MSG_ALT_CHK_CONFIRM', [t('MSG_TXT_BASE_PRC')])); // 기준가격 을(를) 확인하세요.
        return;
      }
    } else if (saveParams.value.procsDv === '611') { // 수수료 인정건수 변경
      if (isEmpty(saveParams.value.feeAckmtCnt)) { // 수수료기준가격 필수체크
        alert(t('MSG_ALT_CHK_CONFIRM', [t('MSG_TXT_FEE_ACKMT_CNT')])); // 수수료인정건수을(를) 확인하세요.
        return;
      }
    } else if (saveParams.value.procsDv === '612') { // 렌탈료DC 변경
      if (changedRows.length > 1) { // 1건씩 처리가능
        alert(t('MSG_ALT_ONE_RGST', [`${t('MSG_TXT_RTLFE')}DC ${t('MSG_TXT_AMT')}`])); // 렌탈료DC는 1건씩 등록해 주세요
        return;
      }
      if (isEmpty(saveParams.value.rentalDc)) { // 금액 필수체크
        alert(t('MSG_ALT_CHK_CONFIRM', [`${t('MSG_TXT_RTLFE')}DC ${t('MSG_TXT_AMT')}`])); // 렌탈료DC 금액을(를) 확인하세요.
        return;
      }
    } else if (saveParams.value.procsDv === '613') { // 미관리제품 설치일자 변경
      if (isEmpty(saveParams.value.paramIstDt)) { // 설치일 필수체크
        alert(t('MSG_ALT_CHK_CONFIRM', [t('MSG_TXT_INST_DT')])); // 설치일을(를) 확인하세요.
        return;
      }
      if (saveParams.value.paramIstDt.substring(0, 6) !== now.format('YYYYMM')) { // 설치일 현재달만 입력가능
        alert(t('MSG_ALT_ONLY_INPUT', [t('MSG_TXT_THM')])); // 당월만 입력가능합니다.
        return;
      }
    } else if (saveParams.value.procsDv === '615') { // 시리얼 번호 변경
      // 시리얼번호는 필수입력
      if (isEmpty(changedRows[i].serialNo)) {
        alert(t('MSG_ALT_CHK_NCSR', [t('MSG_TXT_SERIAL_NO')])); // 시리얼번호 을(를) 입력해주세요.
      }
    } else if (saveParams.value.procsDv === '616') { // 법인 코로나 렌탈중지
      // 중지기간 체크 -필수 입력
      if (isEmpty(changedRows[i].stpPrdStrtYm) || isEmpty(changedRows[i].stpPrdEndYm)) {
        alert(t('MSG_ALT_CHK_NCSR', [t('MSG_TXT_STP_PRD')])); // 중지기간 을(를) 입력해주세요.
        return;
      }
      if (changedRows[i].stpPrdStrtYm > changedRows[i].stpPrdEndYm) { // 중지기간의 종료월은 시작월보다 작을수없다
        alert(t('MSG_TXT_END_GRTR_START_DTM')); // 종료일은 시작일보다 이후로 설정되어야 합니다.
        return;
      }
      if (changedRows[i].stpPrdStrtYm <= now.format('YYYYMM')) { // 중지기간의 시작월은 현재월 이후로 입력
        alert(t('중지기간 시작일은 현재달보다 나중으로 입력해 주세요!'));
        return;
      }
      if (changedRows[i].stpPrdEndYm - changedRows[i].stpPrdStrtYm > 12) { // 중지기간은 최대 12개월까지 가능
        alert(t('중지기간은 최대 12개월까지 가능합니다.'));
        return;
      }
      if (isEmpty(changedRows[i].rplyContact)) { // 회신연락처 필수
        alert(t('MSG_ALT_CHK_NCSR', [`${t('MSG_TXT_RPLY')} ${t('MSG_TXT_CONTACT')}`])); // 회신 연락처 을(를) 입력해주세요.
        return;
      }
      if (!validateEmail(changedRows[i].rplyContact) && !validatePhone(changedRows[i].rplyContact)) { // 연락처 양식체크
        alert(t('회신 연락처 양식이 올바르지 않습니다.이메일과 핸드폰 번호만 가능합니다.')); // 회신 연락처 양식이 올바르지 않습니다.이메일과 핸드폰 번호만 가능합니다.-
        return;
      }
    } else if (saveParams.value.procsDv === '617') { // 법인 코로나 렌탈중지 취소
      if (isEmpty(changedRows[i].stpCanYm)) { // 중지취소년월 필수체크
        alert(t('MSG_ALT_CHK_NCSR', [`${t('MSG_TXT_STP')}${t('MSG_TXT_CANCEL_YM')}`])); // 중지취소년월 을(를) 입력해주세요.
        return;
      }
      if (changedRows[i].stpCanYm <= now.format('YYYYMM')) { // 중지취소년월은 현재달 이후만 입력가능
        alert(t('중지취소년월은 현재달보다 나중으로 입력해 주세요')); // 중지취소년월은 현재달보다 나중으로 입력해 주세요
        return;
      }
    } else if (saveParams.value.procsDv === '618') { // 수수료 정액여부 변경
      if (isEmpty(changedRows[i].feeFxamYn)) { // 수수료 정액여부 필수체크
        alert(t('MSG_TXT_BEFORE_SELECT_IT', [t('MSG_TXT_PD_FEE_FIX')])); // 수수료정액여부(을)를 선택해주세요.
        return;
      }
    } else if (saveParams.value.procsDv === '620') {
      // 렌탈 전월 취소
    } else if (saveParams.value.procsDv === '621') { // (모종)인정실적금액변경
      if (isEmpty(saveParams.value.pdAccRslt)) { // 인정실적 필수 체크
        alert(t('MSG_ALT_CHK_CONFIRM', [t('TXT_MSG_ACKMT_PERF')])); // 인정실적을(를) 확인하세요.
        return;
      }
    } else if (saveParams.value.procsDv === '622') { // (모종)수수료기준가격변경
      if (isEmpty(saveParams.value.feeAckmtBaseAmt)) { // 기준가격 필수체크
        alert(t('MSG_ALT_CHK_CONFIRM', [t('MSG_TXT_BASE_PRC')])); // 기준가격을(를) 확인하세요.
        return;
      }
    } else if (saveParams.value.procsDv === '623') { // 매출(BS) 중지 해제
      // 코드
    } else if (saveParams.value.procsDv === '624') { // 포인트플러스 강제 맵핑
      if (isEmpty(changedRows[i].lifeCstCd)) { // 라이프고객코드 필수체크
        alert(t('MSG_TXT_BEFORE_SELECT_IT', [`${t('MSG_TXT_DPIX01_CODE_14')}${t('MSG_TXT_CST_CD')}`])); // 라이프고객코드(을)를 선택해주세요.
        return;
      }
    } else if (saveParams.value.procsDv === '625') { // 플래너상조제휴 강제 맵핑
      // 코드
    } else if (saveParams.value.procsDv === '626') { // (모종)수수료 인정건수 변경
      if (isEmpty(saveParams.value.feeAckmtCnt)) { // 수수료인정건수 필수체크
        alert(t('MSG_ALT_CHK_CONFIRM', [t('MSG_TXT_FEE_ACKMT_CNT')])); // 수수료인정건수을(를) 확인하세요.
        return;
      }
    } else if (saveParams.value.procsDv === '711') { // BS업체구분값 변경
      if (isEmpty(changedRows[i].modBfsvcBzsDvCd) && isEmpty(changedRows[i].modSplyBzsDvCd)) {
        alert(t('MSG_ALT_INPUT_ITEM1_OR_ITEM2', [`${t('MSG_TXT_MOD')} ${t('MSG_TXT_CLSF_BS')}`, `${t('MSG_TXT_MOD')} ${t('MSG_TXT_CLSF_BUS')}`]));
        return;
      }
    }
    if (isEmpty(changedRows[i].note)) { // 비고 필수체크
      alert(t('MSG_ALT_CHK_NCSR', [t('MSG_TXT_NOTE')])); // 비고 을(를) 입력해주세요.
      return;
    }
  }
  await dataService.post('/sms/wells/contract/changeorder/rental-bulk-change', cachedParams);
  ok();
  notify(t('MSG_ALT_SAVE_DATA'));
}

// 처리구분 변경 이벤트
async function onProcsDvChange() {
  // 그리드 초기화
  grdRentalBulkChangeMgtList.value.getData().clearRows();
  pageInfo.value.totalCount = '0';

  const view = grdRentalBulkChangeMgtList.value.getView();
  view.columnsByTag('bs').forEach((col) => { col.visible = false; }); // 업체구분
  view.columnsByTag('rentalStp').forEach((col) => { col.visible = false; }); // 법인코로나 렌탈중지 취소
  view.columnByName('rcgvpKnm').visible = true; // 고객명
  view.columnByName('istDt').visible = true; // 설치일
  view.columnByName('serialNo').visible = false; // 시리얼번호
  view.columnByName('stpCanYm').visible = false; // 중지취소년월
  view.columnByName('feeFxamYn').visible = false; // 수수료정액여부
  view.columnByName('lifeCstCd').visible = false; // 라이프고객코드
  view.columnByName('lifeCstCd2').visible = false; // 라이프고객코드2
  if (saveParams.value.procsDv === '601' || saveParams.value.procsDv === '605') {
    view.columnByName('istDt').visible = false; // 설치일
  } else if (saveParams.value.procsDv === '615') { // 시리얼 번호 변경
    view.columnByName('serialNo').visible = true; // 시리얼번호
  } else if (saveParams.value.procsDv === '616') { // 법인 코로나 렌탈중지
    view.columnsByTag('rentalStp').forEach((col) => { col.visible = true; }); // 법인코로나 렌탈중지 취소
  } else if (saveParams.value.procsDv === '617') { // 법인 코로나 렌탈중지 취소
    view.columnByName('stpCanYm').visible = true; // 중지취소년월
  } else if (saveParams.value.procsDv === '618') { // 수수료 정액여부 변경
    view.columnByName('feeFxamYn').visible = true; // 수수료정액여부
  } else if (saveParams.value.procsDv === '623') { // 매출(BS) 중지 해제
    view.columnByName('istDt').visible = false; // 설치일
    view.columnByName('rcgvpKnm').visible = false; // 고객명
  } else if (saveParams.value.procsDv === '624') { // 포인트플러스 강제 맵핑
    view.columnByName('lifeCstCd').visible = true; // 라이프고객코드
  } else if (saveParams.value.procsDv === '625') { // 플래너상조제휴 강제 맵핑
    view.columnByName('lifeCstCd').visible = true; // 라이프고객코드
    view.columnByName('lifeCstCd2').visible = true; // 라이프고객코드2
  } else if (saveParams.value.procsDv === '711') { // BS업체구분값 변경
    view.columnsByTag('bs').forEach((col) => { col.visible = true; }); // 업체구분
  }

  if (saveParams.value.procsDv === '612' || saveParams.value.procsDv === '620' || saveParams.value.procsDv === '623') {
    alert(t('서비스 확인 중 입니다.'));
  }
}

// 그리드 조회 후 유효성 체크
async function onSearchItemCheck(payload, dataRow) {
  const view = grdRentalBulkChangeMgtList.value.getView();

  const { cntrNo, cntrSn } = payload;
  const { procsDv } = saveParams.value;
  const res = await dataService.get('/sms/wells/contract/changeorder/rental-change-contracts', {
    params: {
      cntrNo,
      cntrSn,
      procsDv,
    },
  });
  if ((!isEmpty(res.data))) {
    if (procsDv === '601') {
      if (res.data.cntrDtlStatCd !== '303') {
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('취소된 주문이 아닙니다.'));
        return;
      }
      if (!isEmpty(res.data.istDt)) { // 설치일자 있으면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_ALRDY_IST_ORD')); // 설치완료된 주문입니다.
        return;
      }
      if (res.data.alncmpCd === '17' || res.data.alncmpCd === '21' || res.data.alncmpCd === '22'
        || res.data.alncmpCd === '30' || res.data.alncmpCd === '33') { // 제휴사코드(17,21,22,30,33,)이면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_OCO_ALNC_ORDER')); // 타사 제휴 주문입니다
        return;
      }
      // 예약판매이고 설치일자가 현재월이 아니면
      if (!isEmpty(res.data.booSellTpCd)) {
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_NOT_RSV_CNCL_RESTORE')); // 예약건 취소 원복은 당월만 가능합니다.
        return;
      }
      if (isEmpty(res.data.cntrDtlStatCd)) { // 설치월 체크
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('계약상세상태코드가 없습니다.')); // 계약상세상태코드가 없습니다.
        return;
      }
      if (res.data.cntrDtlStatCd.substring(0, 1) === '3' && res.data.cntrDtlStatCd !== '303') { // 해지 이면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_CHK_CONFIRM', [`${t('MSG_TXT_CANCEL')} ${t('MSG_TXT_RGST_MTR')}`])); // 취소 등록자료 을(를) 확인하세요.
        return;
      }
      if (res.data.clCrtYn === 'Y') { // 매출생성됬으면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_SL_PERF_CRT_DATA')); // 매출실적 생성된 자료입니다
        return;
      }
    } else if (procsDv === '604') {
      if (isEmpty(res.data.istDt)) { // 설치일자가 없으면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('설치 전 주문입니다')); // 설치 전 주문입니다.
        return;
      }
      if (res.data.exmtYn === 'Y') { // 매출조정 정보 체크 = Y
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_ALREADY_RGST_MT')); // 이미 등록된 자료입니다
        return;
      }
      if (res.data.istMmBilMthdTpCd === 'Y') { // 설치월면제 기등록 여부
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_ALREADY_RGST_MT')); // 이미 등록된 자료입니다
        return;
      }
      if (res.data.sellTpDtlCd === '22') { // 판매유형상세코드 = 22:리스 이면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(`${t('MSG_TXT_FNN_LEASE')}! ${t('MSG_TXT_INST_MON_EXMP')}${t('MSG_TXT_IMPOSSIBLE')}!`); // 금융리스! 설치월면제 불가!
        return;
      }
      if (res.data.clCrtYn === 'Y') { // 매출실적 검사
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('매출실적 마감된 자료입니다.')); // 매출실적 마감된 자료입니다.
        return;
      }
    } else if (procsDv === '605') {
      if (isEmpty(res.data.istDt)) { // 설치일자가 없으면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('설치 전 주문입니다')); // 설치 전 주문입니다.
        return;
      }
    } else if (procsDv === '607') {
      if (!isEmpty(res.data.istDt)) { // 설치일자가 존재하면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('취소불가!설치 된 주문입니다')); // 취소불가!설치 된 주문입니다
        return;
      }
      if (res.data.cttRsCd === '01') { // 컨택코드=01 이면 불가
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('취소불가!정상컨택 건입니다')); // 취소불가!정상컨택 건입니다
        return;
      }
      if (res.data.cntrDtlStatCd === '303') { // 취소된 주문 = 303 수정불가
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_CNCL_ORDER')); // 취소된 주문입니다
        return;
      }// 체크
    } else if (procsDv === '608') {
      // 체크
    } else if (procsDv === '609') {
      if (res.data.cntrDtlStatCd === '303') { // 취소된 주문 = 303 수정불가
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_CNCL_ORDER')); // 취소된 주문입니다
        return;
      }
    } else if (procsDv === '611') {
      if (res.data.cntrDtlStatCd === '303') { // 취소된 주문 = 303 수정불가
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_CNCL_ORDER')); // 취소된 주문입니다
        return;
      }
    } else if (procsDv === '612') {
      if (res.data.cntrDtlStatCd === '303') { // 취소된 주문 = 303 수정불가
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_CNCL_ORDER')); // 취소된 주문입니다
        return;
      }
      if (res.data.sellTpDtlCd === '22') { // 판매유형상세코드 = 22:리스 이면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(`${t('MSG_TXT_FNN_LEASE')}! ${t('MSG_TXT_RTLFE')}DC ${t('MSG_TXT_CH_IMP')}!`); // 금융리스！렌탈료DC 변경 불가！
        return;
      }
      if (isEmpty(res.data.cntrCnfmDtm)) { // 주문확정일자 = null 이면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('주문확정일이 존재하지 않습니다')); // 주문확정일이 존재하지 않습니다
        return;
      }
      if (res.data.cntrCnfmDtm < '20160301') { // 주문확정일자 < 20160301
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('2016년 3월 1일 이전 주문 확정건은 변경 불가')); // 2016년 3월 1일 이전 주문 확정건은  변경 불가
        return;
      }
    } else if (procsDv === '613') {
      if (res.data.cntrDtlStatCd === '303') { // 취소된 주문 = 303 수정불가
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_CNCL_ORDER')); // 취소된 주문입니다
        return;
      }
      // 컨택코드!=01 or null 아니면 불가 -> 컨택코드 이상으로 변경 불가
      if (res.data.cttRsCd !== '01' && !isEmpty(res.data.cttRsCd)) { // 컨택코드!=01 or null 아니면 불가
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('컨택코드 이상으로 변경 불가')); // 컨택코드 이상으로 변경 불가
        return;
      }
      if (!isEmpty(res.data.istDt)) { // 설치일자가 존재하면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_EXIST', [t('MSG_TXT_IST_DT')])); // 설치일자가 존재합니다.
        return;
      }
      if (!isEmpty(res.data.cntrPdStrtdt)) { // 매출일자가 존재하면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_EXIST', [t('MSG_TXT_SL_DT')])); // 매출일자가 존재합니다.
        return;
      }
      if (res.data.istPcsvTpCd !== '2' || res.data.envrElhmYn !== 'Y') { // 설치택배구분 != 2:택배 || 환경가전여부 != Y 이면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('적용되지 않는 주문입니다')); // 적용되지 않는 주문입니다
        return;
      }
    } else if (procsDv === '615') {
      if (res.data.istBzsCd !== 'S') { // 설치업체구분 != S:삼성전자 변경불가
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('삼성 제품만 변경 가능합니다')); // 삼성 제품만 변경 가능합니다
        return;
      }
      if (res.data.serlYn !== 'Y') { // 시리얼파일존재여부 != Y 불가
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('설치되지 않았습니다. 삼성전자 확정일자를 먼저 등록해 주세요')); // 설치되지 않았습니다. 삼성전자 확정일자를 먼저 등록해 주세요
        return;
      }
    } else if (procsDv === '616') {
      if (res.data.sellTpDtlCd === '22') { // 판매유형상세코드 = 22:리스 이면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(`${t('MSG_TXT_FNN_LEASE')}! ${t('MSG_TXT_RENTAL')}${t('MSG_TXT_STP')} ${t('MSG_TXT_IMPOSSIBLE')}!`); // 금융리스！렌탈중지 불가！
        return;
      }
      if (res.data.copnDvCd !== '2') { // 법인격구분코드 != 2:법인 이면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('법인만 등록 가능합니다')); // 법인만 등록 가능합니다
        return;
      }
      if (res.data.cntrDtlStatCd === '303') { // 취소된 주문 = 303 수정불가
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_CNCL_ORDER')); // 취소된 주문입니다
        return;
      }
      if (isEmpty(res.data.cntrEndDt)) { // 계산한만료일이 없으면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('만료일이 없습니다')); // 만료일이 없습니다
        return;
      }
      if (res.data.cntrEndDt <= now.format('YYYYMMDD')) { // 계산한만료일 <= today 이면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('만료된 주문입니다')); // 만료된 주문입니다
        return;
      }
      if (res.data.dlqAmt > 0) { // 연체금 > 0
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_IS_PRESENT', [t('MSG_TXT_DLQAM')])); // 연체금이 있습니다
        return;
      }
    } else if (procsDv === '617') {
      if (res.data.sellTpDtlCd === '22') { // 판매유형상세코드 = 22:리스 이면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(`${t('MSG_TXT_FNN_LEASE')}! ${t('MSG_TXT_RENTAL')}${t('MSG_TXT_STP')} ${t('MSG_TXT_IMPOSSIBLE')}!`); // 금융리스！렌탈중지 불가！
        return;
      }
      if (res.data.copnDvCd !== '2') { // 법인격구분코드 != 2:법인 이면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('법인만 등록 가능합니다')); // 법인만 등록 가능합니다
        return;
      }
      if (res.data.cntrDtlStatCd === '303') { // 취소된 주문 = 303 수정불가
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_CNCL_ORDER')); // 취소된 주문입니다
        return;
      }
      if (isEmpty(res.data.cntrEndDt)) { // 계산한만료일이 없으면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('만료일이 없습니다')); // 만료일이 없습니다
        return;
      }
      if (res.data.cntrEndDt <= now.format('YYYYMMDD')) { // 계산한만료일 <= today 이면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('만료된 주문입니다')); // 만료된 주문입니다
        return;
      }
    } else if (procsDv === '618') {
      if (res.data.cntrDtlStatCd === '303') { // 취소된 주문 = 303 수정불가
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_CNCL_ORDER')); // 취소된 주문입니다
        return;
      }
    } else if (procsDv === '620') {
      // 취소된 주문(CNTR_DTL_STAT_CD != 303) 수정불가 -> 취소 되지 않은건은 제외! 전달 취소 철회 불가
      if (res.data.cntrDtlStatCd !== '303') { // 취소된 주문 != 303 수정불가
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('취소 되지 않은건은 제외!') + t('MSG_ALT_CNCL_WDWL_IMP')); // 취소 되지 않은건은 제외! 전달 취소 철회 불가
        return;
      }
      if (res.data.sellTpDtlCd === '22') { // 판매유형상세코드 = 22:리스 이면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(`${t('MSG_TXT_FNN_LEASE')}! ${t('MSG_ALT_CNCL_WDWL_IMP')}`); // 금융리스! 전달 취소 철회 불가!
        return;
      }
      if (!isEmpty(res.data.reqdDt)) { // 철거일자 존재하면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('철거 완료건은 제외!') + t('MSG_ALT_CNCL_WDWL_IMP')); // 철거 완료건은 제외! 전달 취소 철회 불가!
        return;
      }
      if (isEmpty(res.data.cntrPdCandt)) {
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('취소일자가 없습니다.')); // 취소일자가 없습니다.
        return;
      }
      if (res.data.lastlcpay !== res.data.cntrPdCandt.substring(0, 6)) { // 마지막실적집계년월과 취소년월이 다르면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('전달만 취소 가능!') + t('MSG_ALT_CNCL_WDWL_IMP')); // 전달만 취소 가능! 전달 취소 철회 불가!
        return;
      }
      if (res.data.borAmt > 0) { // 위약금 > 0 이면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_IS_PRESENT', [t('MSG_TXT_CCAM')]) + t('MSG_ALT_CNCL_WDWL_IMP')); // 위약금이 있습니다. 전달 취소 철회 불가
        return;
      }
      if (res.data.cursleyn === 'N') { // 이번달매출 생성여부*TODO = N 이면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('이번달 매출이 생성 되지 않았습니다') + t('MSG_ALT_CNCL_WDWL_IMP')); // 이번달 매출이 생성 되지 않았습니다. 전달 취소 철회 불가
        return;
      }
      if (!isEmpty(res.data.sdingCntr)) { // 모종결합계약번호가 있으면
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('웰스팜 연계 상품입니다. IT 확인 필요')); // 웰스팜 연계 상품입니다. IT 확인 필요
        return;
      }
    } else if (procsDv === '621') {
      // 체크
    } else if (procsDv === '622') {
      // 체크
    } else if (procsDv === '623') {
      // 체크
    } else if (procsDv === '624') {
      // 체크
    } else if (procsDv === '625') {
      // 체크
    } else if (procsDv === '626') {
      if (res.data.cntrDtlStatCd === '303') { // 취소된 주문 = 303 수정불가
        view.setValue(dataRow, 'cntrDtlNo', '');
        alert(t('MSG_ALT_CNCL_ORDER')); // 취소된 주문입니다
        return;
      }
    } else if (procsDv === '711') {
      // 체크
    }
    view.setValues(dataRow, res.data);
  } else {
    view.setValue(dataRow, 'cntrNo', '');
    view.setValue(dataRow, 'cntrSn', '');
    view.setValue(dataRow, 'istDt', '');
    view.setValue(dataRow, 'serialNo', '');
    view.setValue(dataRow, 'stpCanYm', '');
    view.setValue(dataRow, 'feeFxamYn', '');
    view.setValue(dataRow, 'rcgvpKnm', '');
    view.setValue(dataRow, 'lifeCstCd', '');
    view.setValue(dataRow, 'lifeCstCd2', '');
    view.setValue(dataRow, 'stpPrdStrtYm', '');
    view.setValue(dataRow, 'stpPrdEndYm', '');
    view.setValue(dataRow, 'rplyContact', '');
    view.setValue(dataRow, 'modSplyBzsDvCd', '');
    view.setValue(dataRow, 'modBfsvcBzsDvCd', '');
    view.setValue(dataRow, 'splyBzsDvCd', '');
    view.setValue(dataRow, 'bfsvcBzsDvCd', '');
    view.setValue(dataRow, 'note', '');
    view.setValue(dataRow, 'cntrDtlNo', `${payload.cntrNo}-${payload.cntrSn}`);
    alert(t('대상 계약이 아닙니다.'));
  }
}

onMounted(async () => {
  // 콤보박스 선택 후 팝업 오픈 시 그리드 변경
  const view = grdRentalBulkChangeMgtList.value.getView();
  view.columnsByTag('bs').forEach((col) => { col.visible = false; }); // 업체구분
  view.columnsByTag('rentalStp').forEach((col) => { col.visible = false; }); // 법인코로나 렌탈중지 취소
  view.columnByName('rcgvpKnm').visible = true; // 고객명
  view.columnByName('istDt').visible = true; // 설치일
  view.columnByName('serialNo').visible = false; // 시리얼번호
  view.columnByName('stpCanYm').visible = false; // 중지취소년월
  view.columnByName('feeFxamYn').visible = false; // 수수료정액여부
  view.columnByName('lifeCstCd').visible = false; // 라이프고객코드
  view.columnByName('lifeCstCd2').visible = false; // 라이프고객코드2
  if (saveParams.value.procsDv === '601' || saveParams.value.procsDv === '605') {
    view.columnByName('istDt').visible = false; // 설치일
  } else if (saveParams.value.procsDv === '615') { // 시리얼 번호 변경
    view.columnByName('serialNo').visible = true; // 시리얼번호
  } else if (saveParams.value.procsDv === '616') { // 법인 코로나 렌탈중지
    view.columnsByTag('rentalStp').forEach((col) => { col.visible = true; }); // 법인코로나 렌탈중지 취소
  } else if (saveParams.value.procsDv === '617') { // 법인 코로나 렌탈중지 취소
    view.columnByName('stpCanYm').visible = true; // 중지취소년월
  } else if (saveParams.value.procsDv === '618') { // 수수료 정액여부 변경
    view.columnByName('feeFxamYn').visible = true; // 수수료정액여부
  } else if (saveParams.value.procsDv === '623') { // 매출(BS) 중지 해제
    view.columnByName('istDt').visible = false; // 설치일
    view.columnByName('rcgvpKnm').visible = false; // 고객명
  } else if (saveParams.value.procsDv === '624') { // 포인트플러스 강제 맵핑
    view.columnByName('lifeCstCd').visible = true; // 라이프고객코드
  } else if (saveParams.value.procsDv === '625') { // 플래너상조제휴 강제 맵핑
    view.columnByName('lifeCstCd').visible = true; // 라이프고객코드
    view.columnByName('lifeCstCd2').visible = true; // 라이프고객코드2
  } else if (saveParams.value.procsDv === '711') { // BS업체구분값 변경
    view.columnsByTag('bs').forEach((col) => { col.visible = true; }); // 업체구분
  }

  if (saveParams.value.procsDv === '612' || saveParams.value.procsDv === '620' || saveParams.value.procsDv === '623') {
    alert(t('서비스 확인 중 입니다.'));
  }
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initRentalBulkChangeMgtList = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrDtlNo' }, // 계약상세번호
    { fieldName: 'rcgvpKnm' }, // 수령자명
    { fieldName: 'copnDvCd' }, // 법인격구분코드
    { fieldName: 'cntrPdStrtdt' }, // 계약상품시작일자 - 매출일
    { fieldName: 'stplEndDt' }, // 약정종료일
    { fieldName: 'cntrEndDt' }, // 계약만료일
    { fieldName: 'cntrPdCandt' }, // 취소일자
    { fieldName: 'cntrDtlStatCd' }, // 계약상세상태코드-해지여부
    { fieldName: 'clCrtYn' }, // 매출생성여부
    { fieldName: 'clDpYn' }, // 매출입금여부
    { fieldName: 'sppDuedt' }, // 배송예정일자
    { fieldName: 'istMmBilMthdTpCd' }, // 설치월청구방식유형코드
    { fieldName: 'sellTpDtlCd' }, // 판매유형상세코드-리스구분
    { fieldName: 'stplPtrm' }, // 약정기간
    { fieldName: 'istmMcn' }, // 할부개월수
    { fieldName: 'basePdCd' }, // 제품코드
    { fieldName: 'cttRsCd' }, // 캔택결과코드
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'curYm' }, // 현재년월
    { fieldName: 'exmtYn' }, // 청구여부
    { fieldName: 'istBzsCd' }, // 설치업체
    { fieldName: 'istDt' }, // 설치일자
    { fieldName: 'cntrRcpFshDtm' }, // 계약접수완료일시
    { fieldName: 'cntrCnfmDtm' }, // 주문확정일자
    { fieldName: 'sellDscCtrAmt' }, // 판매할인조정금액-렌탈할인
    { fieldName: 'envrElhmYn' }, // 환경가전여부
    { fieldName: 'istPcsvTpCd' }, // 설치택배구분
    { fieldName: 'cntrPdEnddt' }, // 계약상품종료일자
    { fieldName: 'serlYn' }, // 시리얼파일 존재여부
    { fieldName: 'dlqAmt' }, // 연체금
    { fieldName: 'lastlcpay' }, // *마지막 매출 집계 년월
    { fieldName: 'borAmt' }, // 위약금
    { fieldName: 'reqdDt' }, // 철거일자
    { fieldName: 'cursleyn' }, // 이번달 매출 생성 여부
    { fieldName: 'sdingCntr' }, // 모종결합계약번호
    { fieldName: 'cntrStatChRsonCd' }, // 계약상태변경사유코드-취소유형
    { fieldName: 'alncmpCd' }, // 제휴사코드제휴사코드
    { fieldName: 'booSellTpCd' }, // 예약판매유형코드
    { fieldName: 'cntrPtrm' }, // 계약기간
    { fieldName: 'bfOrdNo' }, // 이전주문번호
    { fieldName: 'note' }, // 비고
    { fieldName: 'serialNo' }, // 시리얼번호
    { fieldName: 'stpPrdStrtYm' }, // 중지기간(시작 YYYYMM)
    { fieldName: 'stpPrdEndYm' }, // 중지기간(종료 YYYYMM)
    { fieldName: 'rplyContact' }, // 회신연락처(메일or휴대전화)
    { fieldName: 'stpCanYm' }, // 중지취소년월(YYYYMM)
    { fieldName: 'feeFxamYn' }, // 수수료정액여부
    { fieldName: 'lifeCstCd' }, // 라이프고객코드
    { fieldName: 'lifeCstCd2' }, // 라이프고객코드2
    { fieldName: 'bfsvcBzsDvCd' }, // 업체BS구분
    { fieldName: 'splyBzsDvCd' }, // 업체구분
    { fieldName: 'modBfsvcBzsDvCd' }, // 수정 업체BS구분
    { fieldName: 'modSplyBzsDvCd' }, // 수정 업체구분
    { fieldName: 'ackmtPerfAmt' }, // 인정실적금액
    { fieldName: 'feeAckmtAmt' }, // 수수료인정기준금액
    { fieldName: 'feeAckmtCt' }, // 수수료인정건수
    { fieldName: 'pdctIdno' }, // 출고일련번호
    { fieldName: 'feeFxam' }, // 수수료정액여부
    { fieldName: 'alncmpCntrDrmVal' }, // 제휴사계약식별값
    { fieldName: 'prmApyDvCd' }, // 선납적용구분코드
  ];

  const columns = [
    { fieldName: 'cntrDtlNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '176',
      styleName: 'text-center rg-button-icon--search',
      editor: { maxLength: 17 },
      button: 'action' }, // 계약상세번호
    { fieldName: 'cntrNo', header: '', width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'cntrSn', header: '', width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CNTOR_NM'), width: '126', styleName: 'text-center', editable: false }, // 계약자명
    { fieldName: 'istDt', header: t('MSG_TXT_INST_DT'), width: '126', styleName: 'text-center', editable: false, visible: false, datetimeFormat: 'date' }, // 설치일자
    { fieldName: 'serialNo',
      header: t('MSG_TXT_SERIAL_NO'),
      width: '126',
      styleName: 'text-center',
      editor: {
        maxLength: 20,
        inputCharacters: ['0-9', 'A-Z'],
      },
      visible: false }, // 시리얼번호
    { fieldName: 'stpPrdStrtYm',
      header: `${t('MSG_TXT_STP_PRD')}(${t('MSG_TXT_STRT')}YYYYMM)`,
      width: '176',
      styleName: 'text-center',
      datetimeFormat: 'yyyy-MM',
      tag: 'rentalStp',
      editor: {
        type: 'btdate',
        btOptions: {
          minViewMode: 1,
        },
      },
      visible: false }, // 중지기간(시작 YYYYMM)
    { fieldName: 'stpPrdEndYm',
      header: `${t('MSG_TXT_STP_PRD')}(${t('MSG_TXT_SHUTDOWN')}YYYYMM)`,
      width: '176',
      styleName: 'text-center',
      datetimeFormat: 'yyyy-MM',
      editor: {
        type: 'btdate',
        btOptions: {
          minViewMode: 1,
        },
      },
      tag: 'rentalStp',
      visible: false }, // 중지기간(종료 YYYYMM)
    { fieldName: 'rplyContact', header: t('회신연락처(메일or휴대전화)'), width: '176', styleName: 'text-center', tag: 'rentalStp', editor: { maxLength: 200 }, visible: false }, // 회신연락처(메일or휴대전화)
    { fieldName: 'stpCanYm',
      header: t('중지취소년월(YYYYMM)'),
      width: '176',
      styleName: 'text-center',
      datetimeFormat: 'yyyy-MM',
      editor: {
        type: 'btdate',
        btOptions: {
          minViewMode: 1,
        },
      },
      visible: false }, // 중지취소년월(YYYYMM)
    { fieldName: 'feeFxamYn',
      header: t('TXT_MSG_FEE_FXAM_YN'),
      width: '126',
      styleName: 'text-center',
      editor: { type: 'list' },
      options: codes.PMOT_PRMIT_YN_ACD,
      visible: false }, // 수수료정액여부
    { fieldName: 'lifeCstCd', header: t('라이프고객코드'), width: '126', styleName: 'text-center', editor: { maxLength: 15 }, visible: false }, // 라이프고객코드
    { fieldName: 'lifeCstCd2', header: t('라이프고객코드2'), width: '126', styleName: 'text-center', editor: { maxLength: 15 }, visible: false }, // 라이프고객코드2
    { fieldName: 'bfsvcBzsDvCd',
      header: t('MSG_TXT_CLSF_BS'),
      width: '126',
      styleName: 'text-center',
      options: codes.BFSVC_BZS_DV_CD.map((v) => ({ codeId: v.codeId, codeName: `${v.codeId}-${v.codeName}` })),
      // optionLabel: codes.BFSVC_BZS_DV_CD.map((v) => `${v.codeId}-${v.codeName}`),
      editable: false,
      tag: 'bs',
      visible: false }, // 업체BS구분
    { fieldName: 'splyBzsDvCd',
      header: t('MSG_TXT_CLSF_BUS'),
      width: '126',
      styleName: 'text-center',
      options: codes.SPLY_BZS_DV_CD.map((v) => ({ codeId: v.codeId, codeName: `${v.codeId}-${v.codeName}` })),
      editable: false,
      tag: 'bs',
      visible: false }, // 업체구분
    { fieldName: 'modBfsvcBzsDvCd',
      header: `${t('MSG_TXT_MOD')} ${t('MSG_TXT_CLSF_BS')}`,
      width: '126',
      styleName: 'text-center',
      tag: 'bs',
      editor: { type: 'list' },
      options: codes.BFSVC_BZS_DV_CD.map((v) => ({ codeId: v.codeId, codeName: `${v.codeId}-${v.codeName}` })),
      placeHolder: t('MSG_TXT_SELT'),
      visible: false }, // 수정 업체BS구분
    { fieldName: 'modSplyBzsDvCd',
      header: `${t('MSG_TXT_MOD')} ${t('MSG_TXT_CLSF_BUS')}`,
      width: '126',
      styleName: 'text-center',
      tag: 'bs',
      options: codes.SPLY_BZS_DV_CD.map((v) => ({ codeId: v.codeId, codeName: `${v.codeId}-${v.codeName}` })),
      editor: { type: 'list' },
      placeHolder: t('MSG_TXT_SELT'),
      visible: false }, // 수정 업체구분
    { fieldName: 'note', header: t('MSG_TXT_NOTE'), width: '528.4', editor: { maxLength: 500 } }, // 비고
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
<style scoped lang="scss">
</style>
