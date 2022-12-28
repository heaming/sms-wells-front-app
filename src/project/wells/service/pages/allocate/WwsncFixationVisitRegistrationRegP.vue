<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNC
2. 프로그램 ID : WwsncFixationVisitRegistrationRegP - 고정방문 등록
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
        <kw-search-item :label="$t('고객번호')">
          <kw-input
            v-model="searchParams.cntrNo"
            icon="search"
            clearable
          />
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
          <p>{{ stringUtil.getDateFormat(contractInfo.rsgnDt) }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-form
      :cols="2"
    >
      <kw-form-row>
        <kw-form-item :label="$t('적용기간')">
          <kw-date-picker
            v-model="contractInfo.apyStrtYm"
            type="month"
          />
        </kw-form-item>
        <kw-form-item :label="$t('변경구분')">
          <kw-select
            v-model="contractInfo.chRqrDvCd"
            :options="codes.FXN_MNGER_DSN_DV_CD"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('변경등록일자')">
          <kw-date-picker
            v-model="contractInfo.fnlMdfcDtm"
          />
        </kw-form-item>
        <kw-form-item :label="$t('지정대상')">
          <kw-select
            v-model="contractInfo.fxnPrtnrDvCd"
            :options="codes.MNGR_DV_CD"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('방문담당')">
          <kw-input
            icon="search"
            clearable
          />
          <kw-input
            v-model="contractInfo.fxnPrtnrNo"
            class="w120"
            disable
          />
        </kw-form-item>
        <kw-form-item :label="$t('삭제여부')">
          <kw-select
            v-model="contractInfo.dtaDlYn"
            :options="codes.COD_YN"
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
import { codeUtil, useModal, useGlobal, useDataService, stringUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { confirm, notify } = useGlobal();
const { ok, cancel: onClickCancel } = useModal();
const dataService = useDataService();

/*
 *  Search Parameter
 */
const searchParams = ref({
  // Popup Parameter
  cntrNo: '',
  cntrSn: '',
  // Insert Data
  fxnPrtnrDvCd: '',
});

/*
 *  Response Data setting을 위한 parameter
 */
const contractInfo = ref({});

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
  contractInfo.value = res.data;
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
  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }

  await dataService.post('/sms/wells/service/fixation-visit', contractInfo.value);

  await notify(t('MSG_ALT_SAVE_DATA'));
  ok();
}

/*
 *  Event - 조회 버튼 클릭
 */
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  fetchFixationRegistration();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>
