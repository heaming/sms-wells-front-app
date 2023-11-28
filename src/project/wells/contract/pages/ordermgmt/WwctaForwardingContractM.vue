<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaForwardingContractM
3. 작성자 : Myoungbin Joo
4. 작성일 : 2023-11-10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 계약서 조회(고객 URL 용)
****************************************************************************************************
--->
<template>
  <kw-page v-if="isEqual(params.device, 'mobile')">
    <kw-form
      ref="frmRef"
      class="pa20"
    >
      <!-- <p class="kw-font-pt18 text-weight-medium mt20">
        {{ `${params?.custNm} ${t('MSG_TXT_CST')}.` }}
      </p> -->
      <!-- 재약정 -->
      <template v-if="isEqual(rptIdGbn, 'bryymmdd')">
        <!-- 개인 -->
        <slot v-if="!isCooperation">
          <span class="kw-font-pt18 text-weight-medium mt20">
            <!-- custNm 고객님. 재약정을 확인하기 위해 생년월일 8자리를 입력하세요. -->
            {{ `${params?.custNm} ${t('MSG_TXT_CST')}.` }}
            <br>
            {{ `${searchParams.reportHeaderTitle}${t('MSG_TXT_CHK_REPORT_FOR')}` }}
            <br>
            {{ `${t('MSG_TXT_BRYY_MMDD_POSTN_IN',['8'])}` }}
          </span>
          <kw-date-picker
            v-model="searchParams.cntrCstBryyMmdd"
            rules="required"
            placeholder="YYYY-MM-DD"
            :label="$t('MSG_TXT_BIRTH_DATE')"
          />
        </slot>
        <!-- 법인 -->
        <slot v-else>
          <span class="kw-font-pt18 text-weight-medium mt20">
            <!-- custNm 고객님. 재약정을 확인하기 위해 사업자번호를 입력하세요. -->
            {{ `${params?.custNm} ${t('MSG_TXT_CST')}.` }}
            <br>
            {{ `${searchParams.reportHeaderTitle}${t('MSG_TXT_CHK_REPORT_FOR')}` }}
            <br>
            {{ t('MSG_TXT_ENTER_BZRNO') }}
          </span>
          <kw-input
            v-model="searchParams.bzrno"
            :label="$t('MSG_TXT_ENTRP_NO')"
            rules="required"
            :placeholder="`${t('MSG_TXT_ENTRP_NO')} 10${t('MSG_TXT_DIGITS')}`"
            :maxlength="10"
          />
        </slot>
      </template>
      <!-- 명세서 -->
      <template v-if="isEqual(rptIdGbn, 'email')">
        <span class="kw-font-pt18 text-weight-medium mt20">
          <!-- custNm 고객님. 내역서를 확인하기 위해 이메일을 입력하세요. -->
          {{ `${params?.custNm} ${t('MSG_TXT_CST')}.` }}
          <br>
          {{ `${searchParams.reportHeaderTitle}${t('MSG_TXT_CHK_REPORT_FOR')}` }}
          <br>
          {{ t('MSG_TXT_ENTR_EMAIL') }}
        </span>
        <kw-input
          v-model="searchParams.emadr"
          :label="$t('MSG_TXT_EMAIL_ADDR')"
          rules="required"
          :placeholder="$t('MSG_TXT_ENTR_EMAIL')"
          :maxlength="50"
        />
      </template>
      <!-- 견적서 발송 -->
      <template v-if="isEqual(rptIdGbn, 'noCertification')">
        <!-- custNm 고객님. 견적서를 확인하세요. -->
        <p class="kw-font-pt18 text-weight-medium mt20">
          {{ `${params?.custNm} ${t('MSG_TXT_CST')}.` }} <br>
          {{ t('MSG_ALT_CHK_CONFIRM', [t('MSG_TXT_QUOT')]) }}
        </p>
      </template>
    </kw-form>
    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_CLOSE')"
        @click="onClickClose"
      />
      <kw-btn
        v-if="!isEqual(rptIdGbn, 'noCertification')"
        primary
        :label="$t('MSG_BTN_CONFIRM')"
        @click="onClickConfirm"
      />
    </template>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { postMessage, decryptEncryptedParam, openWindowPage } from '~sms-common/contract/util';
import { alert, useDataService } from 'kw-lib';
import { isEqual, isEmpty } from 'lodash-es';
import { COPN_DV_CD } from '~sms-wells/contract/constants/ctConst';
import { openReportPopup } from '~common/utils/cmPopupUtil';

import dayjs from 'dayjs';

const { t } = useI18n();

const now = dayjs();
const dataService = useDataService();
const props = defineProps({
  cntrNo: { type: String, default: undefined }, // 계약번호
  cntrSn: { type: String, default: undefined }, // 계약일련번호
  notyFwId: { type: String, default: undefined }, // 알림발송ID
  rprtDvCd: { type: String, default: undefined }, // 리포트구분코드
  pblcSearchSttDt: { type: String, default: undefined }, // 발생일자
  custNm: { type: String, default: undefined }, // 고객명
  cntrList: { type: Array, default: () => [] }, // 계약번호List
  rptId: { type: String, default: undefined }, // 리포트Id
  spectxGrpNo: { type: String, default: undefined }, // 거래명세서그룹번호
  spectxPblDDvCd: { type: String, default: undefined }, // 거래명세서발행일구분코드
  encryptedParam: { type: String, default: undefined }, // 암호화 된 파라미터
  cntrCnfmStrtDt: { type: String, default: undefined }, // 계약확정시작일자
  cntrCnfmEndDt: { type: String, default: undefined }, // 계약확정종료일자
  cntrTempSaveDt: { type: String, default: undefined }, // 계약임시저장일자
  stplTn: { type: String, default: undefined }, // 약정회차
  device: { type: String, default: undefined }, // 기기
  cstNo: { type: String, default: undefined }, // 고객번호
  cntrCstNo: { type: String, default: undefined }, // 계약고객번호
});

// props에서 받은 파라미터들
const params = decryptEncryptedParam(props.encryptedParam, {
  notyFwId: props.notyFwId,
  rprtDvCd: props.rprtDvCd,
  pblcSearchSttDt: props.pblcSearchSttDt,
  custNm: props.custNm,
  cntrDtlNoList: props.cntrList,
  rptId: props.rptId,
  cntrNo: isEmpty(props.cntrNo) && !isEmpty(props.cntrList) ? props.cntrList[0].split('-')[0] : props.cntrNo,
  cntrSn: props.cntrSn,
  spectxPblDDvCd: props.spectxPblDDvCd,
  spectxGrpNo: props.spectxGrpNo,
  cntrCnfmStrtDt: props.cntrCnfmStrtDt,
  cntrCnfmEndDt: props.cntrCnfmEndDt,
  cntrTempSaveDt: props.cntrTempSaveDt,
  stplTn: props.stplTn,
  device: props.device,
  cntrCstNo: props.cntrCstNo,
  cstNo: props.cstNo,
});

const searchParams = ref({
  cntrNo: isEmpty(params.cntrNo) && !isEmpty(params.cntrDtlNoList) ? params.cntrDtlNoList[0].split('-')[0] : params.cntrNo,
  cntrCstBryyMmdd: '',
  bzrno: '',
  emadr: '',
  copnDvCd: '',
  notyFwId: params.notyFwId,
});

const isCooperation = computed(() => isEqual(searchParams.value.copnDvCd, COPN_DV_CD.COOPERATION));

const frmRef = ref();
const rptIdGbn = computed(() => { // 리포트 종류 구분 처리 computed
  if (isEmpty(params.rptId)) { return ''; }

  switch (params.rptId) {
    case 'CARD001': { // 카드내역서
      searchParams.value.reportHeaderTitle = t('MSG_TXT_CRCD_IZSH'); // 레포트 제목
      break;
    }
    case 'CONC001': { // 계약사항
      searchParams.value.reportHeaderTitle = t('MSG_TXT_CNTR_ARTC'); // 레포트 제목
      break;
    }
    case 'DEAL001': { // 거래명세서
      searchParams.value.reportHeaderTitle = t('MSG_TXT_TRD_SPCSH'); // 레포트 제목
      break;
    }
    case 'DPSTMAIL': { // 입금내역서
      searchParams.value.reportHeaderTitle = t('MSG_TXT_DP_IZSH'); // 레포트 제목
      break;
    }
    case 'RP002': { // 재약정
      searchParams.value.reportHeaderTitle = t('MSG_TXT_RSTL'); // 레포트 제목
      break;
    }
    case 'VRTL001': { // 가상계좌확인서
      searchParams.value.reportHeaderTitle = t('MSG_TXT_VT_AC_CFDC'); // 레포트 제목
      break;
    }
  }

  if (['ESDC01'].includes(params.rptId)) { return 'noCertification'; } // 무인증 리스트

  if (!['DPSTMAIL', 'DEAL001', 'CARD001', 'CONC001'].includes(params.rptId)) { return 'bryymmdd'; } // 생년월일 인증이 아닌 리포트 리스트

  return 'email';
});

// 계약번호 리스트가 미존재시
// if (!params.cntrDtlNoList && !params.cntrNo) {
//   await alert(t('MSG_ALT_CNTR_NO_NOT_EXIST')); // 계약번호가 존재하지 않습니다.
//   window.close();
// }

console.log(params);

// openCntrOZReport: Oz리포트 오픈
async function openCntrOZReport() {
  const dtm = isEmpty(params.cntrTempSaveDt) ? '' : params.cntrTempSaveDt;
  const { data: reportPath } = await dataService.get('/sms/wells/contract/report/search-path', { params: { rdId: params.rptId, dtm } });
  if (isEmpty(reportPath)) {
    return;
  }
  // const reportPath = data.replace('ksswells/', 'kstation-w/');

  // OZ 리포트 호출 Api 설정
  let searchApiUrl = '';
  const cachedParams = {
    reportHeaderTitle: '',
    cntrDtlNoList: params.cntrDtlNoList,
    custNm: params.custNm,
    pblcSearchSttDt: params.pblcSearchSttDt,
    spectxPblDDvCd: params.spectxPblDDvCd,
    spectxGrpNo: params.spectxGrpNo,
    cntrCnfmStrtDt: params.cntrCnfmStrtDt,
    cntrCnfmEndDt: params.cntrCnfmEndDt,
    stplTn: params.stplTn,
    cntrNo: params.cntrNo,
    cntrSn: params.cntrSn,
    cntrCstNo: isEmpty(params.cntrCstNo) ? params.cstNo : params.cntrCstNo,
  };

  // OZ 리포트 팝업 파라미터 설정
  switch (params.rptId) {
    case 'CARD001': { // 카드내역서
      cachedParams.reportHeaderTitle = '카드내역서 조회'; // 레포트 제목
      searchApiUrl = '/api/v1/sms/wells/contract/contracts/order-details/specification/card-sales-slips/oz';
      break;
    }
    case 'CONC001': { // 계약사항
      cachedParams.reportHeaderTitle = '계약사항 조회'; // 레포트 제목
      searchApiUrl = '/api/v1/sms/wells/contract/contracts/order-details/specification/contract-articles/oz';
      break;
    }
    case 'DEAL001': { // 거래명세서
      cachedParams.reportHeaderTitle = '거래명세서 조회'; // 레포트 제목
      searchApiUrl = '/api/v1/sms/wells/contract/contracts/order-details/specification/trade-specification/oz';
      if (!isEmpty(params.spectxGrpNo)) {
        searchApiUrl = '/api/v1/sms/wells/contract/contracts/send-trade-specification-sheets/oz';
      }
      break;
    }
    case 'DPSTMAIL': { // 입금내역서
      cachedParams.reportHeaderTitle = '입금내역서 조회'; // 레포트 제목
      searchApiUrl = '/api/v1/sms/wells/contract/contracts/order-details/specification/deposit-itemizations/oz';
      break;
    }
    case 'RP002': { // 재약정
      cachedParams.cntrTempSaveDt = params.rstlCnfmDtm;
      searchApiUrl = '/api/v1/sms/wells/contract/contracts/managements/search-api-url/rstl/args';
      break;
    }
    case 'VRTL001': { // 가상계좌확인서
      const res = await dataService.get(`/sms/wells/contract/changeorder/cancel/vacc-info/${params.cntrNo}/${params.cntrSn}`);
      if (isEmpty(res.data)) {
        alert(t('MSG_ALT_NO_SRCH_DATA'));
        return;
      }
      cachedParams.jsonData = [{
        BANKNM: res.data.vacBnkNm, // 가상계좌은행명
        ACNO: res.data.vacNo, // 가상계좌번호
        CUSTNM: res.data.vacAcownNm, // 가상계좌고객명
        /* 현재날짜 */
        CURRENTYY: now.format('YYYY'),
        CURRENTMM: now.format('MM'),
        CURRENTDD: now.format('DD'),
        ISNCPATH: res.data.isncPath, // 가상계좌VAN사구분코드
      }];
      break;
    }
  }
  const args1 = { ...cachedParams };
  if (!isEmpty(searchApiUrl)) {
    args1.searchApiUrl = searchApiUrl;
  }

  // OZ 레포트 팝업호출
  openReportPopup(
    reportPath,
    '',
    JSON.stringify(args1),
  );
  window.close();
}

async function onClickConfirm() {
  if (!await frmRef.value.validate()) { return; }

  const response = await dataService.post('/sms/wells/contract/auth/contract-document', {
    ...searchParams.value,
  });
  if (response.data.valid) {
    openCntrOZReport();
  }
}

function onClickClose() {
  postMessage('closed', false);
  window.close();
}

async function fetchBasicContractInfo() {
  try {
    const { data } = await dataService.get('/sms/wells/contract/auth/contract-document', {
      params: { cntrNo: params.cntrNo },
    });

    searchParams.value.copnDvCd = data.copnDvCd;
    params.custNm = data.cntrCstKnm;
  } catch (e) {
  // cancel();
  // window.close();
  }
}
onMounted(async () => {
  if (!isEmpty(params.cntrList)) {
    params.cntrDtlNoList = params.cntrList.split(',');
  } else {
    params.cntrDtlNoList = [];
  }
  if (!isEqual(params.device, 'mobile')) {
    params.device = 'mobile';
    await openWindowPage(
      'WwctaForwardingContractM',
      params,
      true,
    );
    return;
  }

  if (isEqual(rptIdGbn.value, 'bryymmdd')) {
    await fetchBasicContractInfo();
  } else if (isEqual(rptIdGbn.value, 'noCertification')) {
    openCntrOZReport();
  }
});
</script>
