<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : PGE_CTA_00286 - 서류 접수 파일 등록 인증
3. 작성자 : SAVEMEGOAT
4. 작성일 : 2023-12-12
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 에듀 참고
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-form
      ref="frmRef"
      class="pa20"
    >
      <template v-if="basicInfo?.copnDvCd === COPN_DV_CD.COOPERATION">
        <p class="kw-font-pt18 text-weight-medium mt20">
          {{ `${basicInfo?.cntrCstKnm} 고객님,` }} <br>
          {{ '사업자번호를 입력 입력해주세요.' }}
        </p>
        <kw-input
          v-model="authInfo.bzrno"
          :label="$t('사업자 번호')"
          rules="required"
          placeholder="사업자번호 10자리 입력"
          :maxlength="10"
        />
      </template>
      <template v-else>
        <p class="kw-font-pt18 text-weight-medium mt20">
          {{ `${basicInfo?.cntrCstKnm} 고객님,` }} <br>
          {{ '생년월일을 입력 입력해주세요.' }}
        </p>
        <kw-date-picker
          v-model="authInfo.cntrCstBryyMmdd"
          rules="required"
          placeholder="YYYY-MM-DD"
          :label="$t('계약자 생년월일')"
        />
      </template>
    </kw-form>
    <template #action>
      <kw-btn
        negative
        label="닫기"
        @click="close('closed')"
      />
      <kw-btn
        primary
        label="확인"
        @click="onClickConfirm"
      />
    </template>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { decryptEncryptedParam, postMessage } from '~sms-common/contract/util';
import { alert, useDataService } from 'kw-lib';
import { COPN_DV_CD } from '~sms-wells/contract/constants/ctConst';

const props = defineProps({
  cntrBasis: { type: Array, default: undefined }, // 계약번호(cntrNo) 및 계약번호 시리얼 (cntrSn)
  cntrChTpCd: { type: String, default: undefined }, // 계약변경유형코드, 103 : 명의변경, 104 : 개명신청, 301 : 자동이체변경, 401 : 계약해약신청
  cntrCstNo: { type: String, default: undefined }, // 고객번호
  reRgstYn: { type: String, default: 'N' }, // 재접수 여부
  cntrChRcpId: { type: String, default: undefined }, // 계약변경접수 ID - 재접수여부가 Y인 경우 필수
  dcmtRcpSn: { type: String, default: undefined },
  cntrChPrgsMoCn: { type: String, default: '' }, // 계약변경진행 메모내용
  chRcpUsrId: { type: String, default: '' }, // 변경접수 사용자 ID
  encryptedParam: { type: String, default: undefined },
});

const params = decryptEncryptedParam(props.encryptedParam, {
  cntrBasis: props.cntrBasis === 'undefined' || props.cntrBasis === 'null' ? null : props.cntrBasis,
  cntrChTpCd: props.cntrChTpCd === 'undefined' || props.cntrChTpCd === 'null' ? null : props.cntrChTpCd,
  cntrChRcpId: props.cntrChRcpId === 'undefined' || props.cntrChRcpId === 'null' ? null : props.cntrChRcpId,
  dcmtRcpSn: props.dcmtRcpSn === 'undefined' || props.dcmtRcpSn === 'null' ? null : props.dcmtRcpSn,
  cntrChPrgsMoCn: props.cntrChPrgsMoCn === 'undefined' || props.cntrChPrgsMoCn === 'null' ? null : props.cntrChPrgsMoCn,
  cntrCstNo: props.cntrCstNo === 'undefined' || props.cntrCstNo === 'null' ? null : props.cntrCstNo,
  reRgstYn: props.reRgstYn === 'undefined' || props.reRgstYn === 'null' ? 'N' : props.cntrCstNo,
  chRcpUsrId: props.chRcpUsrId === 'undefined' || props.chRcpUsrId === 'null' ? 'N' : props.chRcpUsrId,
});

function close(payload) {
  postMessage(payload, false);
  window.close();
}

async function validateProps() {
  if (!params.cntrBasis?.length) {
    await alert('계약번호는 필수입니다.');
    close('Some props is wrong!');
    return;
  }
  let contractAlert;
  const invalid = params.cntrBasis.some(({ cntrNo, cntrSn }) => {
    if (!cntrNo) {
      contractAlert = alert('계약번호가 없는 계약정보가 있습니다.');
      return true;
    }
    if (!cntrSn) {
      contractAlert = alert('계약일련번호가 없는 계약정보가 있습니다.');
      return true;
    }
    return false;
  });
  if (invalid) {
    await contractAlert;
    close('Some props is wrong!');
    return;
  }
  if (!params.cntrChTpCd) {
    await alert('계약변경유형은 필수입니다.');
    close('Some props is wrong!');
  }
}

await validateProps();

// eslint-disable-next-line no-unused-vars
const dataService = useDataService();
const router = useRouter();

const frmRef = ref();
const basicInfo = ref();
const authInfo = reactive({
  cntrCstBryyMmdd: '',
  bzrno: '',
});

function next() {
  router.push({
    path: '/wmcta-document-rcp-file-rgst',
    state: { stateParam: params },
  });
}

async function onClickConfirm() {
  if (!await frmRef.value.validate()) { return; }

  const response = await dataService.post('/sms/wells/contract/contracts/settlements/login', {
    cntrNo: params.cntrBasis[0].cntrNo,
    ...authInfo,
  });

  if (response.data?.valid) {
    next();
  }
}

async function fetchBasicContractInfo() {
  const res = await dataService.get('/sms/wells/contract/contracts/settlements/basic-info', {
    params: { cntrNo: params.cntrBasis[0].cntrNo },
  }).catch(async () => {
    close('Fetch failed');
  });

  basicInfo.value = res.data;
  params.cntrCstNo = basicInfo.value?.cntrCstNo;
}

await fetchBasicContractInfo();
</script>
