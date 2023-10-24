<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaCompanyInstallContractRegP - 회사설치 기본정보 상세(팝업)
3. 작성자 : younuk.choi
4. 작성일 : 2023.07.26
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 회사설치 기본정보 상세(팝업)
****************************************************************************************************
--->
<template>
  <kw-popup
    size="3xl"
    no-action
    :title="$t('MSG_TXT_CO_IST')+' '+$t('MSG_TIT_DEFAULT_INFO')+' '+$t('MSG_TXT_RGS')"
  >
    <kw-form ref="frmMainRef">
      <kw-action-top>
        <template #left>
          <!--계약자 정보-->
          <h3>{{ t('MSG_TXT_CNTRT_INF') }}</h3>
        </template>
        <kw-btn
          icon-right="search"
          negative
          dense
          :label="$t('MSG_TXT_CNTRT_INF')+' '+$t('MSG_TXT_SRCH')"
          @click="onClickSearchCst"
        />
      </kw-action-top>
      <kw-form-row label-size="100">
        <!--계약자명-->
        <kw-form-item
          :label="$t('MSG_TXT_CNTOR_NM')"
          required
        >
          <kw-input
            v-model="installDetail.cstKnm"
            :label="$t('MSG_TXT_CNTOR_NM')"
            rules="required"
            readonly
          />
        </kw-form-item>
        <!--계약자사업/주민번호-->
        <kw-form-item
          :label="$t('MSG_TXT_CNTRT_BZ_RRNO')"
          required
        >
          <kw-input
            v-if="installDetail.copnDvCd==='2'"
            v-model="installDetail.bzrno"
            :label="$t('MSG_TXT_CNTRT_BZ_RRNO')"
            rules="required"
            readonly
          />
          <kw-input
            v-else
            v-model="installDetail.bryyMmdd"
            :label="$t('MSG_TXT_CNTRT_BZ_RRNO')"
            rules="required"
            readonly
          />
        </kw-form-item>
        <!--계약자휴대전화번호-->
        <kw-form-item
          :label="$t('MSG_TXT_CNTRT_MPNO')"
          required
        >
          <zwcm-telephone-number
            v-model:tel-no1="installDetail.cralLocaraTno"
            v-model:tel-no2="installDetail.mexnoEncr"
            v-model:tel-no3="installDetail.cralIdvTno"
            :label="$t('MSG_TXT_CNTRT_MPNO')"
            :required="true"
            :readonly="true"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row label-size="100">
        <!--기준주소-->
        <kw-form-item
          :label="$t('MSG_TXT_STD_ADDR')"
          required
        >
          <kw-input
            v-model="installDetail.zip"
            class="w98"
            :label="$t('MSG_TXT_ZIP')"
            rules="required"
            readonly
          />
          <kw-input
            v-model="installDetail.basAdr"
            :label="$t('MSG_TXT_STD_ADDR')"
            rules="required"
            readonly
          />
        </kw-form-item>
        <!--상세주소-->
        <kw-form-item :label="$t('MSG_TXT_DETAIL_ADDR')">
          <kw-input
            v-model="installDetail.dtlAdr"
            maxlength="200"
            readonly
          />
        </kw-form-item>
      </kw-form-row>

      <kw-separator />
      <kw-action-top>
        <template #left>
          <!--설치자 정보-->
          <h3>{{ t('MSG_TXT_INSTR_INFO') }}</h3>
        </template>
        <kw-form-row>
          <kw-form-item
            no-label
            colspan="3"
          >
            <kw-checkbox
              v-model="installDetail.copyDataYn"
              :label="$t('MSG_TXT_SAME_CNTR_INFO')"
              :true-value="Y"
              :false-value="N"
              @update:model-value="onCopyData"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-action-top>
      <kw-form-row
        label-size="100"
        :cols="4"
      >
        <!--설치자 명-->
        <kw-form-item :label="$t('MSG_TXT_IST_NM')">
          <kw-input
            v-model="installDetail.rcgvpKnm"
            maxlength="50"
          />
        </kw-form-item>
        <!--휴대전화번호-->
        <kw-form-item
          :label="$t('MSG_TXT_MPNO')"
          colspan="2"
        >
          <zwcm-telephone-number
            v-model:tel-no1="installDetail.installCralLocaraTno"
            v-model:tel-no2="installDetail.installMexnoEncr"
            v-model:tel-no3="installDetail.installCralIdvTno"
          />
        </kw-form-item>
        <kw-form-item no-label />
      </kw-form-row>
      <kw-form-row
        label-size="100"
        :cols="2"
      >
        <!--주소-->
        <kw-form-item
          :label="$t('MSG_TXT_ADDR')"
          required
        >
          <kw-input
            v-model="installDetail.installZip"
            :label="$t('MSG_TXT_ZIP')"
            class="w98"
            rules="required"
            maxlength="5"
            @focus="openAddressInfoPopup"
          />
          <kw-input
            v-model="installDetail.installBasAdr"
            :label="$t('MSG_TXT_ADDR')"
            rules="required"
            icon="search"
            maxlength="200"
            @focus="openAddressInfoPopup"
            @click-icon="openAddressInfoPopup"
          />
        </kw-form-item>
        <!--상세주소-->
        <kw-form-item :label="$t('MSG_TXT_DETAIL_ADDR')">
          <kw-input
            v-model="installDetail.installDtlAdr"
            maxlength="200"
          />
        </kw-form-item>
      </kw-form-row>

      <kw-separator />
      <kw-action-top>
        <template #left>
          <!--설치정보 상세-->
          <h3>{{ t('MSG_TXT_INST_INF')+' '+t('MSG_TXT_DTL') }}</h3>
        </template>
        <span>{{ t('MSG_TXT_UNIT_MCNT') }}</span>
      </kw-action-top>
      <kw-form-row label-size="100">
        <!--접수일-->
        <kw-form-item
          :label="$t('MSG_TXT_RCP_D')"
          required
        >
          <kw-date-picker
            v-model="installDetail.cntrCnfmDt"
            :label="$t('MSG_TXT_RCP_D')"
            rules="required"
          />
        </kw-form-item>
        <!--설치일-->
        <kw-form-item :label="$t('MSG_TXT_INST_DT')">
          <kw-date-picker
            v-model="installDetail.istDt"
            readonly
          />
        </kw-form-item>
        <!--설치상품-->
        <kw-form-item
          :label="$t('MSG_TXT_INST_PROD')"
          required
          hint="상품검색을 통해 입력하세요."
        >
          <kw-input
            v-model="installDetail.basePdCd"
            :label="$t('MSG_TXT_INST_PROD')"
            class="w98"
            rules="required"
            readonly
          />
          <kw-input
            v-model="installDetail.pdNm"
            :label="$t('MSG_TXT_INST_PROD')"
            rules="required"
            icon="search"
            readonly
            @click-icon="onClickSearchPd"
          />
        </kw-form-item>
      </kw-form-row>

      <kw-form-row label-size="100">
        <!--주기/용도-->
        <kw-form-item
          :label="$t('MSG_TXT_CYCL')+'/'+$t('MSG_TXT_USWY')"
          required
        >
          <kw-select
            v-model="installDetail.ojPdCd"
            :label="$t('MSG_TXT_CYCL')"
            :options="services"
            first-option="select"
            rules="required"
            :readonly="isEmpty(installDetail.basePdCd)"
          />
        </kw-form-item>
        <!--등급-->
        <kw-form-item :label="$t('MSG_TXT_GD')">
          <kw-select
            v-model="installDetail.pdGdCd"
            :options="codes.PD_GD_CD"
            first-option="select"
          />
        </kw-form-item>
        <!--설치구분-->
        <kw-form-item :label="$t('MSG_TXT_INST_CLS')">
          <kw-select
            v-model="installDetail.coIstDvCd"
            :options="codes.CO_IST_DV_CD"
            first-option="select"
          />
        </kw-form-item>
      </kw-form-row>

      <kw-form-row label-size="100">
        <!--설치용도-->
        <kw-form-item :label="$t('MSG_TXT_INST_PURP')">
          <kw-select
            v-model="installDetail.coIstUswyCd"
            :options="codes.CO_IST_USWY_CD"
            first-option="select"
          />
        </kw-form-item>
        <!--관리구분-->
        <kw-form-item :label="$t('MSG_TXT_MNGT_DV')">
          <kw-select
            v-model="installDetail.coIstMngtDvCd"
            :options="codes.CO_IST_MNGT_DV_CD"
            first-option="select"
          />
        </kw-form-item>
        <!--관리부서-->
        <kw-form-item
          :label="$t('MSG_TXT_MGMT_DEPT')"
          required
        >
          <kw-input
            v-model="installDetail.ogCd"
            :label="$t('MSG_TXT_MGMT_DEPT')"
            class="w100"
            rules="required"
          />
          <kw-input
            v-model="installDetail.ogNm"
            :label="$t('MSG_TXT_MGMT_DEPT')"
            rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row label-size="100">
        <!--회사코드-->
        <kw-form-item :label="$t('MSG_TXT_CPNY_CD')">
          <kw-input
            v-model="installDetail.coCd"
            maxlength="4"
            regex="num"
          />
        </kw-form-item>
        <!--무상기간-->
        <kw-form-item :label="$t('TXT_MSG_FRISU_PTRM')">
          <kw-input
            v-model="installDetail.frisuBfsvcPtrmN"
            regex="num"
            align="right"
            maxlength="3"
          />
        </kw-form-item>
        <!--A/S기간-->
        <kw-form-item :label="$t('MSG_TXT_AS_PERIOD')">
          <kw-input
            v-model="installDetail.frisuAsPtrmN"
            regex="num"
            align="right"
            maxlength="3"
          />
        </kw-form-item>
      </kw-form-row>

      <kw-form-row label-size="100">
        <!--설치장소-->
        <kw-form-item :label="$t('MSG_TXT_INST_PLAC')">
          <kw-select
            v-model="installDetail.istPlcTpCd"
            :options="codes.IST_PLC_TP_CD"
            first-option="select"
          />
        </kw-form-item>
        <!--월 비용-->
        <kw-form-item :label="$t('MSG_TXT_MM_CS')">
          <kw-input
            v-model="installDetail.fnlAmt"
            regex="num"
            align="right"
            maxlength="10"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row label-size="100">
        <!--체험단여부 (mapping:null)-->
        <kw-form-item :label="$t('MSG_TXT_EXPN_GRP')+$t('MSG_TXT_YN')">
          <kw-checkbox
            v-model="installDetail.expnYn"
            label="체크 시, 일시불 멤버십비용 적용"
            :true-value="Y"
            :false-value="N"
          />
        </kw-form-item>
        <!--시리얼넘버 (mapping:null)-->
        <kw-form-item :label="$t('MSG_TXT_SR_NUM')">
          <kw-input
            v-model="installDetail.null"
            maxlength=""
          />
        </kw-form-item>
      </kw-form-row>

      <kw-separator />
      <kw-action-top>
        <template #left>
          <!--반품 정보-->
          <h3>{{ t('MSG_TXT_RTNGD') }} {{ t('MSG_TXT_INF') }}</h3>
        </template>
      </kw-action-top>
      <kw-form-row label-size="100">
        <!--반품일-->
        <kw-form-item :label="$t('MSG_TXT_RET_DT')">
          <kw-date-picker
            v-model="installDetail.rtnDt"
          />
        </kw-form-item>
        <!--참고사항-->
        <kw-form-item
          :label="$t('MSG_TXT_REFER_ARTC')"
          :colspan="2"
        >
          <kw-input
            v-model="installDetail.istAkArtcMoCn"
            maxlength="1000"
          />
        </kw-form-item>
      </kw-form-row>

      <template v-if="!isEmpty(packages)">
        <kw-separator />
        <kw-action-top>
          <template #left>
            <!--웰스팜            -->
            <h3>{{ t('MSG_TXT_WELSF') }}</h3>
          </template>
        </kw-action-top>
        <kw-form-row label-size="100">
          <!--등록옵션-->
          <kw-form-item :label="$t('MSG_TXT_RGS') + $t('MSG_TXT_OPT')">
            <kw-option-group
              v-model="installDetail.packageYn"
              type="radio"
              :options="[{ codeId: 'N', codeName: '기기만 등록' },{ codeId: 'Y', codeName: '모종 패키지 함께 등록' }]"
            />
          </kw-form-item>
        </kw-form-row>

        <template v-if="installDetail.packageYn==='Y'">
          <kw-form-row
            label-size="100"
            cols="5"
          >
            <!--모종패키지-->
            <kw-form-item
              :label="$t('MSG_TXT_SDING')+$t('MSG_TXT_PRDT')"
              :required="installDetail.packageYn === 'Y'?'required':null"
              colspan="2"
            >
              <kw-select
                v-model="installDetail.pkgPdCd"
                :label="$t('MSG_TXT_CYCL')"
                :options="packages"
                first-option="select"
                :rules="installDetail.packageYn === 'Y'?'required':null"
                @change="onChnagePackageCd"
              />
            </kw-form-item>

            <!--모종계약기간-->
            <kw-form-item :label="$t('TXT_MSG_CNTR_PTRM_DV_CD')">
              <kw-input
                v-model="installDetail.pkgCntrPtrm"
                maxlength="3"
                align="right"
                rules="numeric"
              />
            </kw-form-item>
            <!--무상기간 -->
            <kw-form-item :label="$t('TXT_MSG_FRISU_PTRM')">
              <kw-input
                v-model="installDetail.packageFrisuPtrm"
                maxlength="3"
                align="right"
                rules="numeric"
              />
            </kw-form-item>
            <!--무상금액-->
            <kw-form-item :label="$t('MSG_TXT_FREE')+$t('MSG_TXT_AMT')">
              <kw-input
                v-model="installDetail.packageFreeAmt"
                align="right"
                maxlength="10"
                rules="numeric"
              />
            </kw-form-item>
          </kw-form-row>
        </template>
      </template>
    </kw-form>

    <template #action>
      <kw-btn
        :label="$t('MSG_BTN_CANCEL')"
        negative
        @click="onClickCancel"
      />
      <kw-btn
        v-permission:update
        :label="$t('MSG_BTN_SAVE')"
        primary
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, useMeta, useDataService, useModal, useGlobal } from 'kw-lib';
import { isEmpty } from 'lodash-es';

import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';
import pdConst from '~sms-common/product/constants/pdConst';

const { modal, notify } = useGlobal();
const { ok, cancel: onClickCancel } = useModal();
const { t } = useI18n();
const dataService = useDataService();
const sessionUserInfo = useMeta().getUserInfo();
const frmMainRef = ref(getComponentType('KwForm'));

const services = ref();
const packages = ref();
const codes = await codeUtil.getMultiCodes(
  'CO_IST_DV_CD', // 설치구분
  'CO_IST_USWY_CD', // 설치용도
  'PD_GD_CD', // 상품등급코드
  'CO_IST_USWY_CD', // 설치용도
  'CO_IST_MNGT_DV_CD', // 관리구분
  'IST_PLC_TP_CD', // 설치장소
);

const installDetail = reactive({
  copyDataYn: 'N',
  expnYn: 'N',
  coCd: '2000',
  ogCd: sessionUserInfo.ogCd,
  ogNm: sessionUserInfo.ogCdNm,
  packageYn: 'N',
  pkgPdCd: '',
  pkgCntrPtrm: 12,
  packageFrisuPtrm: 12,
  packageFreeAmt: 0,
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function onClickSearchCst() {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: { cstType: '2' },
  });
  if (result) {
    // TODO : 계약자 대상만 조회 가능하게 구현 필요
    installDetail.cstKnm = payload.name;
    installDetail.copnDvCd = payload.copnDvCd;
    installDetail.bzrno = payload.bzrno;
    installDetail.bryyMmdd = payload.bryyMmdd;
    installDetail.cralLocaraTno = payload.cralLocaraTno;
    installDetail.mexnoEncr = payload.mexnoEncr;
    installDetail.cralIdvTno = payload.cralIdvTno;
    installDetail.zip = payload.zip;
    installDetail.basAdr = payload.basAdr;
    installDetail.dtlAdr = payload.dtlAdr;
    installDetail.cntrCstNo = payload.cstNo;
  }
}

const openAddressInfoPopup = async () => {
  const componentName = 'ZwcmzAddressInfoP';
  const {
    result,
    payload,
  } = await modal({
    component: componentName,
  });

  if (result) {
    const { address } = payload;
    installDetail.installZip = address.zipCode;
    installDetail.installBasAdr = address.add1;
    installDetail.installDtlAdr = address.add2;
  }
};

async function onCopyData(val) {
  if (val === 'Y') {
    installDetail.rcgvpKnm = installDetail.cstKnm;
    installDetail.installCralLocaraTno = installDetail.cralLocaraTno;
    installDetail.installMexnoEncr = installDetail.mexnoEncr;
    installDetail.installCralIdvTno = installDetail.cralIdvTno;
    installDetail.installZip = installDetail.zip;
    installDetail.installBasAdr = installDetail.basAdr;
    installDetail.installDtlAdr = installDetail.dtlAdr;
  }
}

// 상품코드 검색아이콘 클릭
async function onClickSearchPd() {
  const result = await modal({
    component: 'ZwpdcStandardListP', // 상품기준 목록조회 팝업
    componentProps: { sellTpCd: '4', selectType: pdConst.PD_SEARCH_SINGLE },
  });

  if (result.result) {
    const selectedPd = result.payload?.[0];
    if (selectedPd) {
      installDetail.basePdCd = selectedPd.pdCd;
      installDetail.pdNm = selectedPd.pdNm;
      installDetail.sellTpCd = selectedPd.sellTpCd;

      if (!isEmpty(installDetail.basePdCd)) {
        const res = await dataService.get('/sms/wells/contract/contracts/company-service', { params: { pdCd: installDetail.basePdCd } });
        services.value = res.data.services;
        packages.value = res.data.packages;
      }
    }
  }
}

// 모종 패키지 선택
async function onChnagePackageCd() {
  if (isEmpty(installDetail.pkgPdCd)) return;

  const { cntrPtrm } = packages.value.find((v) => v.codeId === installDetail.pkgPdCd);
  if (!isEmpty(cntrPtrm) && Number(cntrPtrm) > 0) { installDetail.pkgCntrPtrm = cntrPtrm; }
}

// 저장 버튼 클릭
async function onClickSave() {
  // check validation
  if (await frmMainRef.value.alertIfIsNotModified()) { return; }
  if (!await frmMainRef.value.validate()) { return; }

  const { svTpCd, svPrd } = services.value.find((v) => v.codeId === installDetail.ojPdCd);
  installDetail.svPdTpCd = svTpCd;
  installDetail.svPrd = svPrd;

  if (installDetail.packageYn === 'N') {
    installDetail.pkgPdCd = '';
    installDetail.pkgCntrPtrm = '';
  }

  // call service
  await dataService.post('/sms/wells/contract/contracts/company-install', [{ ...installDetail }]);
  ok();
  await notify(t('MSG_ALT_SAVE_DATA'));
}

</script>
