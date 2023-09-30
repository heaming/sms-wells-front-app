<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : [W-SV-U-0162P01] WwsncFixationVisitRegistrationRegP - 고정방문 등록
3. 작성자 : juno.cha
4. 작성일 : 2022.12.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 고정방문 등록 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <kw-search
      one-row
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item :label="$t('계약일련번호')">
          <!-- 계약파트 컴포넌트 변경(2023.06.27 KJ) -->
          <zctz-contract-detail-number
            ref="contractNumberRef"
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            disable-popup
          >
            <template #append>
              <kw-icon
                name="search"
                @click="onClickSearchContract"
              />
            </template>
          </zctz-contract-detail-number>
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <h3 class="pt0 mb20">
      {{ $t('계약정보') }}
    </h3>
    <kw-form
      :cols="2"
      dense
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('고객명')"
        >
          <p>{{ contractInfo.cstKnm }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('휴대전화번호')"
        >
          <p>
            {{
              getTelephoneNumber(
                contractInfo.cralLocaraTno
                , contractInfo.mexnoEncr
                , contractInfo.cralIdvTno)
            }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('계약주소')">
          <p>{{ getAddress(contractInfo.rnadr, contractInfo.rdadr) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />
    <h3 class="mb20">
      {{ $t('설치정보') }}
    </h3>
    <kw-form
      :cols="2"
      dense
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('고객명')"
        >
          <p>{{ contractInfo.rcgvpKnm }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('휴대전화번호')"
        >
          <p>
            {{
              getTelephoneNumber(
                contractInfo.cralLocaraTnoInstall
                , contractInfo.mexnoEncrInstall
                , contractInfo.cralIdvTnoInstall
              )
            }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('설치주소')">
          <p>{{ getAddress(contractInfo.rnadrInstall, contractInfo.rdadrInstall) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <kw-separator />
    <h3 class="mb20">
      {{ $t('상품정보') }}
    </h3>
    <kw-form
      :cols="2"
      dense
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('상품')"
        >
          <p>{{ contractInfo.pdNm }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('용도')"
        >
          <p>{{ contractInfo.pdPrpVal01Nm }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <h3 class="mb20">
      {{ $t('기존담당') }}
    </h3>
    <kw-form
      :cols="2"
      dense
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('담당자')"
        >
          <p>{{ contractInfo.prtnrKnm }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('활동중지일')"
        >
          <p>{{ stringUtil.getDateFormat(contractInfo.cltnDt) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-form
      ref="frmRef"
      :cols="2"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('적용기간')"
          required
        >
          <kw-date-picker
            v-model="contractInfo.apyStrtYm"
            type="month"
            rules="required"
            :name="$t('적용기간')"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('변경구분')"
          required
        >
          <kw-select
            v-model="contractInfo.chMngrDvCd"
            :options="codes.FXN_MNGER_DSN_DV_CD"
            rules="required"
            :name="$t('변경구분')"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('변경등록일자')">
          <p>{{ stringUtil.getDateFormat(contractInfo.fnlMdfcDtm) }}</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('지정대상')"
          required
        >
          <kw-select
            v-model="contractInfo.fxnPrtnrDvCd"
            :options="codes.MNGR_DV_CD"
            rules="required"
            :name="$t('지정대상')"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('방문담당')"
          required
        >
          <kw-input
            v-model.trim="contractInfo.fxnPrtnrKnm"
            icon="search"
            clearable
            @click-icon="onFxnPrtnrNoSearchPopup"
          />
          <kw-input
            v-model="contractInfo.fxnPrtnrNo"
            class="w120"
            placeholder=""
            disable
            :name="$t('방문담당')"
            rules="required"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('삭제여부')"
          required
        >
          <kw-select
            v-model="contractInfo.dtaDlYn"
            :options="codes.COD_YN"
            rules="required"
            :name="$t('삭제여부')"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('변경사유')"
          :colspan="2"
        >
          <kw-input
            v-model="contractInfo.chRsonCn"
            type="textarea"
            :rows="3"
            :maxlength="2000"
            :counter="true"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <template #action>
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
import { codeUtil, stringUtil, useDataService, useGlobal, useModal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

const { t } = useI18n();
const { confirm, notify, modal, alert } = useGlobal();
const { ok, cancel: onClickCancel } = useModal();
const dataService = useDataService();

/*
 *  Search Parameter
 */
const searchParams = ref({
  // Popup Parameter
  cntrNo: '',
  cntrSn: '',
  cntrDtlNo: '',
  // Insert Data
  fxnPrtnrDvCd: '',
});

const frmRef = ref();
/*
 *  Response Data setting을 위한 parameter
 */
const contractInfo = ref({});
const contractSaveInfo = ref({
  cntrNo: '',
  cntrSn: '',
  chSn: '',
  cstKnm: '',
  cralLocaraTno: '',
  mexnoEncr: '',
  cralIdvTno: '',
  rnadr: '',
  rdadr: '',
  rcgvpKnm: '',
  cralLocaraTnoInstall: '',
  mexnoEncrInstall: '',
  cralIdvTnoInstall: '',
  rnadrInstall: '',
  rdadrInstall: '',
  pdNm: '',
  pdPrpVal01: '',
  apyStrtYm: '',
  chMngrDvCd: '',
  fnlMdfcDtm: '',
  fxnPrtnrDvCd: '',
  fxnPrtnrOgTpCd: '',
  fxnPrtnrNo: '',
  fxnPrtnrKnm: '',
  chRsonCn: '',
  dtaDlYn: '',
  prtnrKnm: '',
  cltnDt: '',
});

/*
 *  공통코드 조회
 *  (조회 후 후처리 - customCodes)
 */
const codes = await codeUtil.getMultiCodes(
  'MNGR_DV_CD', // 관리구분
  // 'PD_USWY_CD', // 용도
  'FXN_MNGER_DSN_DV_CD', // 변경구분
  'COD_YN',
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

/*
 *  Search - 고정등록 조회
 */
let cachedParams;
async function fetchFixationRegistration() {
  const res = await dataService.get('/sms/wells/service/fixation-visit', { params: { ...cachedParams } });
  contractInfo.value = { ...contractSaveInfo.value, ...res.data };

  if (isEmpty(contractInfo.value.dtaDlYn)) {
    contractInfo.value.dtaDlYn = 'N';
  }

  frmRef.value.init();
}

/*
 *  Format - Telephone Number
 */
function getTelephoneNumber(v1, v2, v3) {
  v1 = v1 ?? '';
  v2 = v2 ?? '';
  v3 = v3 ?? '';
  const div1 = (!isEmpty(v1) && !isEmpty(v2)) ? '-' : '';
  const div2 = ((!isEmpty(v1) || !isEmpty(v2)) && !isEmpty(v3)) ? '-' : '';
  return `${v1}${div1}${v2}${div2}${v3}`;
}

/*
 *  Format - Address
 */
function getAddress(rnadr, rdadr) {
  rnadr = rnadr ?? '';
  rdadr = rdadr ?? '';
  const div = (!isEmpty(rnadr) && !isEmpty(rdadr)) ? ' ' : '';
  return `${rnadr}${div}${rdadr}`;
}

/*
 *  Event - 저장 버튼 클릭
 */
async function onClickSave() {
  if (!await frmRef.value.validate()) return false;
  if (isEmpty(searchParams.value.cntrNo) || isEmpty(searchParams.value.cntrSn)) {
    await alert('계약정보를 조회한 후 저장할 수 있습니다.');
    return;
  }

  // cntrNo, cntrSn, chSn setting
  contractInfo.value.cntrNo = searchParams.value.cntrNo;
  contractInfo.value.cntrSn = searchParams.value.cntrSn;

  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }

  await dataService.post('/sms/wells/service/fixation-visit', contractInfo.value);

  await notify(t('MSG_ALT_SAVE_DATA'));
  ok();
}

/*
 *  Event - 조회 버튼 클릭
 */
async function onClickSearch() {
  // cherro ::: test code (단위테스트 후 삭제)
  if (isEmpty(searchParams.value.cntrSn)) {
    searchParams.value.cntrSn = '1';
  }

  if (isEmpty(searchParams.value.cntrNo) || isEmpty(searchParams.value.cntrSn)) {
    await alert('계약정보를 조회한 후 조회할 수 있습니다.');
    return;
  }

  cachedParams = cloneDeep(searchParams.value);
  fetchFixationRegistration();
}

/*
 *  Event - 방문담당자 검색 버튼 클릭
 */
async function onFxnPrtnrNoSearchPopup() {
  const mngrDvCd = contractInfo.value.fxnPrtnrDvCd ?? '';
  const searchText = contractInfo.value.fxnPrtnrKnm;

  const { result: isChanged, payload } = await modal({
    component: 'WwsndHumanResourcesListP',
    componentProps: {
      mngrDvCd,
      searchText,
    },
  });

  if (isChanged) {
    contractInfo.value.fxnPrtnrNo = payload[0].prtnrNo;
    contractInfo.value.fxnPrtnrKnm = payload[0].prtnrKnm;
    contractInfo.value.fxnPrtnrOgTpCd = payload[0].ogTpCd;
  }
}

/*
 * 계약번호 조회
 */
async function onClickSearchContract() {
  const { result, payload } = await modal({
    component: 'WwsnyCustomerBaseInformationP',
  });

  if (result) {
    searchParams.value.cntrNo = payload.cntrNo ?? '';
    searchParams.value.cntrSn = payload.cntrSn ?? '';
    searchParams.value.cntrDtlNo = `${payload.cntrNo ?? ''}-${payload.cntrSn ?? ''}`;

    /*
     * 조회데이터 Setting & Clear
     */
    // 계약정보
    // 고객명
    // contractInfo.value.cstKnm = payload.cstNm ?? '';
    // // 휴대전화번호
    // contractInfo.value.cralLocaraTno = payload.cralLocaraTno ?? '';
    // contractInfo.value.mexnoEncr = payload.mexnoEncr ?? '';
    // contractInfo.value.cralIdvTno = payload.cralIdvTno ?? '';
    // // 계약주소
    // contractInfo.value.rnadr = payload.rnadr ?? '';
    // contractInfo.value.rdadr = payload.rdadr ?? '';

    // 계약정보
    // 고객명
    contractInfo.value.cstKnm = '';
    // 휴대전화번호
    contractInfo.value.cralLocaraTno = '';
    contractInfo.value.mexnoEncr = '';
    contractInfo.value.cralIdvTno = '';
    // 계약주소
    contractInfo.value.rnadr = '';
    contractInfo.value.rdadr = '';

    // 설치정보
    // 고객명
    contractInfo.value.rcgvpKnm = '';
    // 휴대전화번호
    contractInfo.value.cralLocaraTnoInstall = '';
    contractInfo.value.mexnoEncrInstall = '';
    contractInfo.value.cralIdvTnoInstall = '';
    // 설치주소
    contractInfo.value.rnadrInstall = '';
    contractInfo.value.rdadrInstall = '';

    // 상품정보
    // 상품
    contractInfo.value.pdNm = '';
    // 용도
    contractInfo.value.pdPrpVal01Nm = '';

    // 기존담당
    // 담당자
    contractInfo.value.prtnrKnm = '';
    contractInfo.value.fxnPrtnrNo = '';
    contractInfo.value.fxnPrtnrOgTpCd = '';
    // 활동중지일
    contractInfo.value.cltnDt = '';

    // For Example
    // customerData.value.cntrNo = payload.cntrNo ?? '';
    // customerData.value.cntrSn = payload.cntrSn ?? '';
    // customerData.value.cstNm = payload.cstNm ?? '';
    // customerData.value.newAdrZip = payload.newAdrZip ?? '';
    // customerData.value.rnadr = payload.rnadr ?? '';
    // customerData.value.rdadr = payload.rdadr ?? '';
    // customerData.value.cralLocaraTno = payload.cralLocaraTno ?? '';
    // customerData.value.mexnoEncr = payload.mexnoEncr ?? '';
    // customerData.value.cralIdvTno = payload.cralIdvTno ?? '';
    // customerData.value.locaraTno = payload.locaraTno ?? '';
    // customerData.value.exnoEncr = payload.exnoEncr ?? '';
    // customerData.value.idvTno = payload.idvTno ?? '';
    // customerData.value.istDt = payload.istDt ?? '';
    // customerData.value.sellTpCd = payload.sellTpCd ?? '';
    // customerData.value.pdCd = payload.pdCd ?? '';
    // customerData.value.bcNo = payload.bcNo ?? '';
    // customerData.value.svStpDt = payload.svStpDt ?? '';
    // customerData.value.recapDutyPtrmN = payload.recapDutyPtrmN ?? '';
    // customerData.value.frisuAsPtrmN = payload.frisuAsPtrmN ?? '';
    // customerData.value.frisuBfsvcPtrmN = payload.frisuBfsvcPtrmN ?? '';
    // customerData.value.cycleCode = payload.cycleCode ?? '';
  }
  frmRef.value.init();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
