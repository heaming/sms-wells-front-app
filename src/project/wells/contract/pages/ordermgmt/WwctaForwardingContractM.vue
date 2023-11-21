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
  <kw-page>
    <kw-form
      ref="frmRef"
      class="pa20"
    >
      <!-- 재약정 -->
      <template v-if="isEqual(rptIdGbn, 'bryymmdd')">
        <slot v-if="isCooperation">
          <p class="kw-font-pt18 text-weight-medium mt20">
            {{ `${params?.custNm} ${t('MSG_TXT_CST')}.` }} <br>
            {{ `${t('MSG_TXT_BRYY_MMDD_POSTN_IN',['8'])}` }}
          </p>
          <kw-date-picker
            v-model="searchParams.cntrCstBryyMmdd"
            rules="required"
            placeholder="YYYY-MM-DD"
            :label="$t('MSG_TXT_BIRTH_DATE')"
          />
        </slot>
        <slot v-else>
          <p class="kw-font-pt18 text-weight-medium mt20">
            {{ `${params?.custNm} ${t('MSG_TXT_CST')}.` }} <br>
            {{ t('MSG_TXT_ENTR_EMAIL') }}
          </p>
          <kw-input
            v-model="searchParams.bzrno"
            :label="$t('MSG_TXT_EMAIL_ADDR')"
            rules="required"
            :placeholder="$t('MSG_TXT_ENTR_EMAIL')"
            :maxlength="50"
          />
        </slot>
      </template>
      <!-- 명세서 -->
      <template v-if="isEqual(rptIdGbn, 'email')">
        <p class="kw-font-pt18 text-weight-medium mt20">
          {{ `${params?.custNm} ${t('MSG_TXT_CST')}.` }} <br>
          {{ t('MSG_TXT_ENTR_EMAIL') }}
        </p>
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
import { postMessage, decryptEncryptedParam } from '~sms-common/contract/util';
import { /* alert, */ useDataService } from 'kw-lib';
import { isEqual, isEmpty } from 'lodash-es';
import { COPN_DV_CD } from '~sms-wells/contract/constants/ctConst';
import { openReportPopup } from '~common/utils/cmPopupUtil';

const { t } = useI18n();

const dataService = useDataService();
const props = defineProps({
  cntrNo: { type: String, default: undefined }, // 계약번호
  notyFwId: { type: String, default: undefined }, // 알림발송ID
  rprtDvCd: { type: String, default: undefined }, // 리포트구분코드
  pblcSearchSttDt: { type: String, default: undefined }, // 발생일자
  custNm: { type: String, default: undefined }, // 고객명
  cntrList: { type: Array, default: () => [] }, // 계약번호List
  rptId: { type: String, default: undefined }, // 리포트Id
  spectxGrpNo: { type: String, default: undefined }, // 거래명세서그룹번호
  spectxPblDDvCd: { type: String, default: undefined }, // 거래명세서발행일구분코드
  encryptedParam: { type: String, default: undefined },
  cntrCnfmStrtDt: { type: String, default: undefined },
  cntrTempSaveDt: { type: String, default: undefined },
});

// props에서 받은 파라미터들
const params = decryptEncryptedParam(props.encryptedParam, {
  notyFwId: props.notyFwId,
  rprtDvCd: props.rprtDvCd,
  pblcSearchSttDt: props.pblcSearchSttDt,
  custNm: props.custNm,
  cntrList: props.cntrList,
  rptId: props.rptId,
  cntrNo: isEmpty(props.cntrNo) && !isEmpty(props.cntrList) ? props.cntrList[0].split('-')[0] : props.cntrNo,
  spectxPblDDvCd: props.spectxPblDDvCd,
  spectxGrpNo: props.spectxGrpNo,
  cntrCnfmStrtDt: props.cntrCnfmStrtDt,
  cntrTempSaveDt: props.cntrTempSaveDt,
});

const searchParams = ref({
  cntrNo: isEmpty(params.cntrNo) && !isEmpty(params.cntrList) ? params.cntrList[0].split('-')[0] : props.cntrNo,
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

  if (['ESDC01'].includes(params.rptId)) { return 'noCertification'; }

  if (!['DPSTMAIL', 'DEAL001', 'CARD001', 'CONC001'].includes(params.rptId)) { return 'bryymmdd'; }

  return 'email';
});

// 계약번호 리스트가 미존재시
// if (!params.cntrDtlNoList && !params.cntrNo) {
//   await alert(t('MSG_ALT_CNTR_NO_NOT_EXIST')); // 계약번호가 존재하지 않습니다.
//   window.close();
// }

// openCntrOZReport: Oz리포트 오픈
async function openCntrOZReport() {
  const dtm = isEmpty(params.cntrTempSaveDt) ? '' : params.cntrTempSaveDt;
  const { data: reportPath } = await dataService.get('/sms/wells/contract/report/search-path', { params: { rdId: params.rptId, dtm } });
  if (isEmpty(reportPath)) {
    return;
  }
  // const reportPath = data.replace('ksswells/', 'kstation-w/');

  const cachedParams = {
    reportHeaderTitle: '',
    cntrDtlNoList: params.cntrList,
    custNm: params.custNm,
    pblcSearchSttDt: params.pblcSearchSttDt,
    // cntrNo: params.cntrNo,
    spectxPblDDvCd: params.spectxPblDDvCd,
    spectxGrpNo: params.spectxGrpNo,
    cntrCnfmStrtDt: params.cntrCnfmStrtDt,
  };

  // OZ 리포트 호출 Api 설정
  const args1 = { searchApiUrl: '', ...cachedParams };

  // OZ 리포트 팝업 파라미터 설정
  switch (params.rptId) {
    case 'CARD001': { // 카드내역서
      cachedParams.reportHeaderTitle = '카드내역서 조회'; // 레포트 제목
      args1.searchApiUrl = '/api/v1/sms/wells/contract/contracts/order-details/specification/card-sales-slips/oz';
      break;
    }
    case 'CONC001': { // 계약사항
      cachedParams.reportHeaderTitle = '계약사항 조회'; // 레포트 제목
      args1.searchApiUrl = '/api/v1/sms/wells/contract/contracts/order-details/specification/contract-articles/oz';
      break;
    }
    case 'DEAL001': { // 거래명세서
      cachedParams.reportHeaderTitle = '거래명세서 조회'; // 레포트 제목
      args1.searchApiUrl = '/api/v1/sms/wells/contract/contracts/order-details/specification/trade-specification/oz';
      if (!isEmpty(params.spectxGrpNo)) {
        args1.searchApiUrl = '/api/v1/sms/wells/contract/contracts/send-trade-specification-sheets/oz';
      }
      break;
    }
    case 'DPSTMAIL': { // 입금내역서
      cachedParams.cntrNo = '입금내역서 조회'; // 레포트 제목
      args1.searchApiUrl = '/api/v1/sms/wells/contract/contracts/order-details/specification/deposit-itemizations/oz';
      break;
    }
    case 'ESDC01': { // 견적서
      cachedParams.cntrNo = params.cntrNo;
      args1.cntrNo = params.cntrNo;
      break;
    }
  }
  // console.log(args1);

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
    cntrNo: params.cntrNo,
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
  } catch (e) {
  // cancel();
  // window.close();
  }
}
onMounted(async () => {
  if (isEqual(rptIdGbn.value, 'bryymmdd')) {
    await fetchBasicContractInfo();
  } else if (isEqual(rptIdGbn.value, 'noCertification')) {
    openCntrOZReport();
  }
  if (!isEmpty(params.cntrList)) {
    params.cntrList = params.cntrList.split(',');
  }
});
</script>
