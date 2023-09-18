<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB (방문관리)
2. 프로그램 ID : WwsnbSafetyAccidentRegP - 안전사고 등록
3. 작성자 : yeonghwa.cheon
4. 작성일 : 2023.07.17
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 엔지니어가 AS처리 중에 발생한 안전사고 내역을 등록하는 화면기능이다.
****************************************************************************************************
--->
<template>
  <kw-popup
    size="4xl"
  >
    <kw-form ref="frmMainRef1">
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_TTL')"
          required
        >
          <kw-input
            v-model="safetyAccident.acdnRcpNm"
            :label="$t('MSG_TXT_TTL')"
            rules="required"
            :readonly="safetyAccident.acdnRcpNm === ''"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <h3>{{ t('MSG_TXT_CNTR_INF') }}</h3>
    <kw-form ref="frmMainRef2">
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_ACDN_PHO')">
          <zwcm-file-attacher
            ref="acdnPhoApnFileRef"
            v-model="acdnPhoApnFile"
            attach-group-id="ATG_SNB_ACDN_ALL"
            :attach-document-id="safetyAccident.acdnPhoApnDocId"
            downloadable
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ACDN_PICTR')">
          <zwcm-file-attacher
            ref="acdnPictrApnFileRef"
            v-model="acdnPictrApnFile"
            attach-group-id="ATG_SNB_ACDN_ALL"
            :attach-document-id="safetyAccident.acdnPictrApnDocId"
            downloadable
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CAUS_ANA')">
          <zwcm-file-attacher
            ref="causAnaApnFileRef"
            v-model="causAnaApnFile"
            attach-group-id="ATG_SNB_ACDN_ALL"
            :attach-document-id="safetyAccident.causAnaApnDocId"
            downloadable
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CNTR_DTL_NO')"
          required
        >
          <zctz-contract-detail-number
            v-model:cntr-no="safetyAccident.cntrNo"
            v-model:cntr-sn="safetyAccident.cntrSn"
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
            disable-popup
            rules="required"
          >
            <template #append>
              <kw-icon
                name="search"
                @click="onClickSearchContract"
              />
            </template>
          </zctz-contract-detail-number>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_CST_NM')"
          required
        >
          <kw-input
            v-model="safetyAccident.cstNm"
            :label="$t('MSG_TXT_CST_NM')"
            rules="required"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_GOODS_NM')"
          required
        >
          <kw-input
            v-model="safetyAccident.pdNm"
            :label="$t('MSG_TXT_GOODS_NM')"
            rules="required"
            @blur="onChangePdNm"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_TEL_NO')"
          required
        >
          <kw-input
            v-model="safetyAccident.tno"
            :label="$t('MSG_TXT_TEL_NO')"
            rules="required"
            mask="telephone"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_MPNO')"
          required
        >
          <kw-input
            v-model="safetyAccident.mpno"
            rules="required"
            mask="telephone"
            :label="$t('MSG_TXT_MPNO')"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_IST_DT')"
          required
        >
          <kw-date-picker
            v-model="safetyAccident.istDt"
            :label="$t('MSG_TXT_IST_DT')"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_ADDR')"
          :colspan="2"
          required
        >
          <zwcm-post-code
            v-model:addKey="safetyAccident.adrId"
            v-model:adrDvCd="safetyAccident.adrDvCd"
            v-model:zipCode="safetyAccident.istZip"
            v-model:add1="safetyAccident.istAdr"
            v-model:add2="safetyAccident.istDtlAdr"
            :label="$t('MSG_TXT_ADDR')"
            required
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />

    <h3>{{ t('MSG_TXT_AS_INF') }}</h3>
    <!-- rev:230710 변경 및 추가 -->
    <kw-form ref="frmMainRef3">
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_AS_RCP_DT')"
          required
        >
          <kw-date-picker
            v-model="safetyAccident.rcpdt"
            :label="$t('MSG_TXT_AS_RCP_DT')"
            rules="required"
            class="w330"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ACDN_DTM')">
          <kw-date-picker
            v-model="safetyAccident.acdnDt"
          />
          <kw-time-picker
            v-model="safetyAccident.acdnTm"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_LCT')"
          required
        >
          <kw-input
            v-model="safetyAccident.istLctDtlCn"
            :label="$t('MSG_TXT_LCT')"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CENTER_DIVISION')"
          required
        >
          <kw-select
            v-model="safetyAccident.svCnrOgId"
            :label="$t('MSG_TXT_CENTER_DIVISION')"
            :options="svcCode"
            rules="required"
            option-label="ogNm"
            option-value="ogId"
            @update:model-value="onChangeSvCnrOgId"
          />
        </kw-form-item>
        <kw-form-item
          :label="`${$t('MSG_TXT_CNRLD_FNM')}(${$t('MSG_TXT_RGST_USR')})`"
          required
        >
          <kw-input
            v-model="safetyAccident.cnrldNm"
            :label="`${$t('MSG_TXT_CNRLD_FNM')}(${$t('MSG_TXT_RGST_USR')})`"
            rules="required"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_IMPTA_RSON')"
          required
        >
          <kw-select
            v-model="safetyAccident.imptaRsonCd"
            rules="required"
            :label="$t('MSG_TXT_IMPTA_RSON')"
            :options="codes.IMPTA_RSON_CD"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_RCP_CN')"
          :colspan="3"
          required
        >
          <kw-input
            v-model="safetyAccident.rcpMoCn"
            :label="$t('MSG_TXT_RCP_CN')"
            rules="required"
            type="textarea"
            :rows="3"
            counter
            maxlength="4000"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <!-- // rev:230710 변경 및 추가 -->
    <kw-separator />
    <h3>{{ t('MSG_TXT_ACDN_INF') }}</h3>
    <kw-form ref="frmMainRef4">
      <!-- rev:230710 변경 및 추가 -->
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_ACDN_CAUS')"
          :colspan="3"
          required
        >
          <kw-input
            v-model="safetyAccident.acdnCausCn"
            :label="$t('MSG_TXT_ACDN_CAUS')"
            type="textarea"
            :rows="3"
            counter
            maxlength="4000"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CST_DMD_ARTC')"
          :colspan="3"
        >
          <kw-input
            v-model="safetyAccident.cstDmdCn"
            type="textarea"
            :rows="3"
            counter
            maxlength="4000"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <!-- // rev:230710 변경 및 추가 -->
    <!-- <div v-if="props.acdnRcpId !== ''"> -->
    <kw-action-top
      class="mb20"
    >
      <template #left>
        <h3>{{ t('MSG_TXT_RS_IN') }}</h3>
      </template>
      <kw-btn
        secondary
        :label="$t('MSG_TXT_AGR_FW')"
        :disable="sessionUserInfo.employeeIDNumber !== safetyAccident.cnrldNo || safetyAccident.agrDocFwYn === 'Y'"
        dense
        @click="onClickAgreementFoward"
      />
    </kw-action-top>
    <kw-form
      ref="frmMainRef5"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_PRGS_STATUS')"
          required
          :hint="$t('MSG_TXT_PRGS_STATUS_HINT')"
        >
          <kw-select
            v-model="safetyAccident.cpsDvCd"
            :label="$t('MSG_TXT_PRGS_STATUS')"
            rules="required"
            :options="codes.CPS_DV_CD"
            :disable="sessionUserInfo.employeeIDNumber !== safetyAccident.cnrldNo"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_FSH_DT')">
          <kw-date-picker
            v-model="safetyAccident.fshDt"
            :disable="sessionUserInfo.employeeIDNumber !== safetyAccident.cnrldNo"
            class="w330"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CPS_PRGS')">
          <kw-input
            v-model="safetyAccident.cpsPrgsNm"
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_TOT_CPS_AMT_WON')">
          <kw-input
            v-model="safetyAccident.totCpsAmt"
            readonly
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_KW_BU_WON')">
          <kw-input
            v-model="safetyAccident.kwCpsAmt"
            :disable="sessionUserInfo.employeeIDNumber !== safetyAccident.cnrldNo"
            type="number"
            @update:model-value="onChangeKwCpsAmt"
            @onClear="onChangeKwCpsAmt"
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_INSRCO_BU_WON')">
          <kw-input
            v-model="safetyAccident.insrcoCpsAmt"
            :disable="sessionUserInfo.employeeIDNumber !== safetyAccident.cnrldNo"
            type="number"
            @update:model-value="onChangeInsrcoCpsAmt"
            @onClear="onChangeInsrcoCpsAmt"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_AGR_FW_YN')">
          <kw-input
            v-model="safetyAccident.agrDocFwYn"
            readonly
          />
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_AGR_SIGN_YN')">
          <kw-input
            v-model="safetyAccident.agrDocRcvYn"
            readonly
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CPS_RS')"
          :colspan="3"
        >
          <kw-input
            v-model="safetyAccident.acdnRsCn"
            :disable="sessionUserInfo.employeeIDNumber !== safetyAccident.cnrldNo"
            type="textarea"
            :rows="6"
            counter
            maxlength="4000"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <!-- // rev:230710 변경 및 추가 -->
    <template
      #action
    >
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickCancel"
      />
      <kw-btn
        primary
        :label="$t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import {
  useGlobal,
  codeUtil,
  useDataService,
  useModal,
  useMeta,
  stringUtil,
} from 'kw-lib';
import ZwcmFileAttacher from '~common/components/ZwcmFileAttacher.vue';
import ZwcmPostCode from '~common/components/ZwcmPostCode.vue';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import { isEmpty } from 'lodash-es';

const { t } = useI18n();
const { modal, notify } = useGlobal();
const dataService = useDataService();
const { ok, cancel: onClickCancel } = useModal();
const { getUserInfo } = useMeta();
const props = defineProps({
  acdnRcpId: {
    type: String,
    required: true,
  },
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// const ogLevlDvCd = await dataService.get('/sms/wells/service/safety-accidents/ogLevlDvCd');
const codes = await codeUtil.getMultiCodes(
  'CPS_DV_CD',
  'IMPTA_RSON_CD',
);
const svcCode = (await dataService.get('/sms/wells/service/organizations/service-center', { params: { authYn: 'N' } })).data;
const sessionUserInfo = getUserInfo();
const acdnPhoApnFile = ref([]); // 사고사진
const acdnPictrApnFile = ref([]); // 사고영상
const causAnaApnFile = ref([]); // 원인분석
const tempText = ref(`1. 담당자:
2. 방문내역:
3. 피해면적:
4. 견적내역(가견적):
5. 합의내역(입금일):
6. 총절감액: `);
const safetyAccident = ref({
  acdnRcpId: '',
  acdnRcpNm: '',
  cntrNo: '',
  cntrSn: '',
  cstNm: '',
  pdNm: '',
  tno: '',
  mpno: '',
  istZip: '',
  adrId: '',
  adrDvCd: '',
  istAdr: '',
  istDtlAdr: '',
  istDt: '',
  rcpdt: '',
  acdnDt: '',
  acdnTm: '',
  acdnDtm: '',
  istLctDtlCn: '',
  svCnrOgId: '',
  svCnrNm: '',
  cnrldNo: '',
  cnrldNm: '',
  imptaRsonCd: '',
  cpsDvCd: '',
  agrDocFwYn: 'N',
  agrDocRcvYn: 'N',
  rcpMoCn: '',
  acdnCausCn: '',
  cstDmdCn: '',
  fshDt: '',
  cpsPrgsCd: '',
  cpsPrgsNm: '(주)교원프라퍼티(101-81-39767)',
  totCpsAmt: 0,
  krnTotCpsAmtMrkNm: '',
  kwCpsAmt: '',
  insrcoCpsAmt: '',
  acdnPhoApnFile: [],
  acdnPictrApnFile: [],
  causAnaApnFile: [],
  acdnRsCn: tempText.value,
  acdnPhoApnDocId: '',
  acdnPictrApnDocId: '',
  causAnaApnDocId: '',
  saveYn1: '',
  saveYn2: '',
  saveYn3: '',
});
const frmMainRef1 = ref();
const frmMainRef2 = ref();
const frmMainRef3 = ref();
const frmMainRef4 = ref();
const frmMainRef5 = ref();

function onChangePdNm() {
  safetyAccident.value.acdnRcpNm = `[${safetyAccident.value.pdNm}] 제목을 입력해주세요.`;
}

/* 숫자금액 -> 한글 변환 */
function convertToKoreanNumber(val) {
  let kor = '';
  const numKor = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const danKor = ['', '십', '백', '천', '', '십', '백', '천', '', '십', '백', '천', '', '십', '백', '천'];

  const numStr = val.toString(); // 문자열로 변환
  if (val !== 0) {
    for (let i = 0; i < numStr.length; i += 1) {
      let str = '';
      const num = numKor[numStr.charAt(numStr.length - (i + 1))];
      if (num !== '') str += num + danKor[i]; // 숫자가 0인 경우 텍스트를 표현하지 않음
      switch (i) {
        case 4: str += '만'; break; // 4자리인 경우 '만'을 붙여줌 ex) 10000 -> 일만
        case 8: str += '억'; break; // 8자리인 경우 '억'을 붙여줌 ex) 100000000 -> 일억
        case 12: str += '조'; break; // 12자리인 경우 '조'를 붙여줌 ex) 1000000000000 -> 일조
      }
      kor = str + kor;
    }

    // Step. 불필요 단위 제거
    if (kor.indexOf('억만') > 0) kor = kor.replace('억만', '억');
    if (kor.indexOf('조만') > 0) kor = kor.replace('조만', '조');
    if (kor.indexOf('조억') > 0) kor = kor.replace('조억', '조');
  }
  return kor;
}

async function onClickSearchContract() {
  const { result, payload } = await modal({
    component: 'WwsnyCustomerBaseInformationP',
  });
  if (result) {
    safetyAccident.value.cntrNo = payload.cntrNo ?? '';
    safetyAccident.value.cntrSn = payload.cntrSn ?? '';
    safetyAccident.value.cntrDtlNo = `${payload.cntrNo ?? ''}-${payload.cntrSn ?? ''}`;

    // 안전사고관리 데이터 조회
    const res = (await dataService.get('/sms/wells/service/safety-accidents/init', { params: safetyAccident.value })).data;
    Object.assign(safetyAccident.value, res);
    if (!isEmpty(res.pdNm)) {
      onChangePdNm();
    }
  }
}

// 안전사고 합의서 알림톡 발송
async function onClickAgreementFoward() {
  if (!await frmMainRef1.value.confirmIfIsModified() || !await frmMainRef2.value.confirmIfIsModified()
  || !await frmMainRef3.value.confirmIfIsModified() || !await frmMainRef4.value.confirmIfIsModified()
  || (sessionUserInfo.employeeIDNumber === safetyAccident.cnrldNo && !await frmMainRef5.value.confirmIfIsModified())
  ) {
    return;
  }
  // if (!await frmMainRef2.value.confirmIfIsModified()) { return; }
  // if (!await frmMainRef3.value.confirmIfIsModified()) { return; }
  // if (!await frmMainRef4.value.confirmIfIsModified()) { return; }
  // if (sessionUserInfo.employeeIDNumber === safetyAccident.cnrldNo) {
  //   if (!await frmMainRef5.value.confirmIfIsModified()) { return; }
  // }

  const { result } = await modal({
    component: 'WwsnbSafetyAccidentAgreeBiztalkP',
    componentProps: {
      acdnRcpId: props.acdnRcpId,
      cntrNo: safetyAccident.value.cntrNo,
      cntrSn: safetyAccident.value.cntrSn,
      pdNm: safetyAccident.value.pdNm,
      cstNm: safetyAccident.value.cstNm,
      rcpdt: stringUtil.getDateFormat(safetyAccident.value.rcpdt),
    },
  });

  if (result) {
    // 안전사고관리 데이터 조회
    const res = (await dataService.get(`/sms/wells/service/safety-accidents/${props.acdnRcpId}`)).data;
    Object.assign(safetyAccident.value, res);
  }
}

async function onClickSave() {
  if (!await frmMainRef1.value.validate() || !await frmMainRef2.value.validate()
  || !await frmMainRef3.value.validate() || !await frmMainRef4.value.validate()
  || (sessionUserInfo.employeeIDNumber === safetyAccident.cnrldNo && !await frmMainRef5.value.validate())
  ) {
    notify(t('MSG_ALT_CHK_REQ_VAL'));
    return;
  }

  // 저장할 값 세팅.
  const svCnrNm = (svcCode.filter((v) => v.ogId === safetyAccident.value.svCnrOgId))[0].ogNm;
  safetyAccident.value.krnTotCpsAmtMrkNm = convertToKoreanNumber(safetyAccident.value.totCpsAmt);
  safetyAccident.value.cpsPrgsCd = (safetyAccident.value.cpsPrgsNm === '보험사' ? '2' : '1');
  safetyAccident.value.svCnrNm = svCnrNm;

  if (!isEmpty(acdnPhoApnFile.value)) {
    safetyAccident.value.acdnPhoApnFile = (isEmpty(acdnPhoApnFile.value[0].fileUid) ? acdnPhoApnFile.value : null);
  }
  if (!isEmpty(acdnPictrApnFile.value)) {
    // eslint-disable-next-line max-len
    safetyAccident.value.acdnPictrApnFile = (isEmpty(acdnPictrApnFile.value[0].fileUid) ? acdnPictrApnFile.value : null);
  }
  if (!isEmpty(causAnaApnFile.value)) {
    safetyAccident.value.causAnaApnFile = (isEmpty(causAnaApnFile.value[0].fileUid) ? causAnaApnFile.value : null);
  }
  // 저장값 세팅
  safetyAccident.value.saveYn1 = (safetyAccident.value.acdnPhoApnFile === null ? 'N' : 'Y');
  safetyAccident.value.saveYn2 = (safetyAccident.value.acdnPictrApnFile === null ? 'N' : 'Y');
  safetyAccident.value.saveYn3 = (safetyAccident.value.causAnaApnFile === null ? 'N' : 'Y');
  safetyAccident.value.acdnDtm = safetyAccident.value.acdnDt && safetyAccident.value.acdnTm ? `${safetyAccident.value.acdnDt}${safetyAccident.value.acdnTm}` : null;
  await dataService.post('/sms/wells/service/safety-accidents', safetyAccident.value);

  ok();
  notify(t('MSG_ALT_SAVE_DATA'));
}

function onChangeKwCpsAmt() {
  safetyAccident.value.totCpsAmt = Number(safetyAccident.value.insrcoCpsAmt) + Number(safetyAccident.value.kwCpsAmt);
  if (safetyAccident.value.kwCpsAmt > 0) {
    safetyAccident.value.cpsPrgsNm = '(주)교원프라퍼티(101-81-39767)';
  }
}

function onChangeInsrcoCpsAmt() {
  safetyAccident.value.totCpsAmt = Number(safetyAccident.value.insrcoCpsAmt) + Number(safetyAccident.value.kwCpsAmt);
  if (safetyAccident.value.insrcoCpsAmt > 0) {
    safetyAccident.value.cpsPrgsNm = '보험사';
  } else {
    safetyAccident.value.cpsPrgsNm = '(주)교원프라퍼티(101-81-39767)';
  }
}

async function onChangeSvCnrOgId() {
  const ogId = safetyAccident.value.svCnrOgId;
  const cnrldNm = (await dataService.get(`/sms/wells/service/safety-accidents/cnrldNm/${ogId}`)).data;
  safetyAccident.value.cnrldNm = cnrldNm;
}

onMounted(async () => {
  if (props.acdnRcpId !== '') {
    const res = await dataService.get(`/sms/wells/service/safety-accidents/${props.acdnRcpId}`);
    Object.assign(safetyAccident.value, res.data);
  }
  await frmMainRef1.value.init();
  await frmMainRef2.value.init();
  await frmMainRef3.value.init();
  await frmMainRef4.value.init();
  await frmMainRef5.value.init();
});
</script>
