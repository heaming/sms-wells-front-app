<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaCompanyInstallContractDtlModP - 회사설치 기본정보 상세(팝업)
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
    :title="$t('MSG_TXT_CO_IST')+' '+$t('MSG_TIT_DEFAULT_INFO')+' '+$t('MSG_TXT_DTL')"
  >
    <kw-form ref="frmMainRef">
      <kw-action-top>
        <template #left>
          <!--주문정보-->
          <h3>{{ t('MSG_TXT_ODER_INF') }}</h3>
        </template>
      </kw-action-top>
      <kw-form-row
        label-size="100"
      >
        <!--계약상세번호-->
        <kw-form-item :label="$t('MSG_TXT_CNTR_DTL_NO')">
          <kw-input
            v-model="installDetail.cntrNoSn"
            readonly
          />
        </kw-form-item>
      </kw-form-row>

      <kw-separator />
      <kw-action-top>
        <template #left>
          <!--계약자 정보-->
          <h3>{{ t('MSG_TXT_CNTRT_INF') }}</h3>
        </template>
        <!--
        <kw-btn
          icon-right="search"
          grid-action
          label="계약자정보 조회"
          @click="onClickSearchCst"
        />
        -->
      </kw-action-top>
      <kw-form-row label-size="100">
        <!--계약자명-->
        <kw-form-item
          :label="$t('MSG_TXT_CNTOR_NM')"
          required
        >
          <kw-input
            v-model="installDetail.cstKnm"
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
            readonly
          />
          <kw-input
            v-else
            v-model="installDetail.bryyMmdd"
            readonly
          />
        </kw-form-item>
        <!--계약자휴대전화번호-->
        <kw-form-item
          :label="$t('MSG_TXT_CNTRT_MPNO')"
          required
        >
          <kw-input
            v-model="installDetail.mpno"
            readonly
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
            readonly
          />
          <kw-input
            v-model="installDetail.basAdr"
            readonly
          />
        </kw-form-item>
        <!--상세주소-->
        <kw-form-item :label="$t('MSG_TXT_DETAIL_ADDR')">
          <kw-input
            v-model="installDetail.dtlAdr"
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
      </kw-action-top>
      <kw-form-row label-size="100">
        <!--설치자 명-->
        <kw-form-item :label="$t('MSG_TXT_IST_NM')">
          <kw-input
            v-model="installDetail.rcgvpKnm"
            readonly
          />
        </kw-form-item>
        <!--휴대전화번호-->
        <kw-form-item :label="$t('MSG_TXT_MPNO')">
          <kw-input
            v-model="installDetail.installMpno"
            readonly
          />
        </kw-form-item>
        <kw-form-item no-label />
      </kw-form-row>

      <kw-form-row label-size="100">
        <!--주소-->
        <kw-form-item
          :label="$t('MSG_TXT_ADDR')"
          required
        >
          <kw-input
            v-model="installDetail.installZip"
            class="w98"
            readonly
          />
          <kw-input
            v-model="installDetail.installBasAdr"
            readonly
          />
        </kw-form-item>
        <!--상세주소-->
        <kw-form-item :label="$t('MSG_TXT_DETAIL_ADDR')">
          <kw-input
            v-model="installDetail.installDtlAdr"
            readonly
          />
        </kw-form-item>
        <kw-form-item no-label />
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
            readonly
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
        >
          <kw-input
            v-model="installDetail.basePdCd"
            class="w98"
            readonly
          />
          <kw-input
            v-model="installDetail.pdNm"
            readonly
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
            ref="isPdRelChg"
            v-model="installDetail.ojPdCd"
            :label="$t('MSG_TXT_CYCL')+'/'+$t('MSG_TXT_USWY')"
            :options="services"
            first-option="select"
            rules="required"
          />
        </kw-form-item>
        <!--등급-->
        <kw-form-item :label="$t('MSG_TXT_GD')">
          <kw-select
            ref="isCntrDtlChg"
            v-model="installDetail.pdGdCd"
            :options="codes.PD_GD_CD"
            first-option="select"
          />
        </kw-form-item>
        <!--설치구분-->
        <kw-form-item :label="$t('MSG_TXT_INST_CLS')">
          <kw-select
            ref="isWellsDtlChg"
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
            ref="isWellsDtlChg"
            v-model="installDetail.coIstUswyCd"
            :options="codes.CO_IST_USWY_CD"
            first-option="select"
          />
        </kw-form-item>
        <!--관리구분-->
        <kw-form-item :label="$t('MSG_TXT_MNGT_DV')">
          <kw-select
            ref="isWellsDtlChg"
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
            ref="isCntrDtlChg"
            v-model="installDetail.coCd"
            maxlength="4"
            regex="num"
          />
        </kw-form-item>
        <!--무상기간-->
        <kw-form-item :label="$t('TXT_MSG_FRISU_PTRM')">
          <kw-input
            ref="isWellsDtlChg"
            v-model="installDetail.frisuBfsvcPtrmN"
            regex="num"
            align="right"
            maxlength="3"
          />
        </kw-form-item>
        <!--A/S기간-->
        <kw-form-item :label="$t('MSG_TXT_AS_PERIOD')">
          <kw-input
            ref="isWellsDtlChg"
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
            ref="isWellsDtlChg"
            v-model="installDetail.istPlcTpCd"
            :options="codes.IST_PLC_TP_CD"
            first-option="select"
          />
        </kw-form-item>
        <!--월 비용-->
        <kw-form-item :label="$t('MSG_TXT_MM_CS')">
          <kw-input
            ref="isCntrDtlChg"
            v-model="installDetail.fnlAmt"
            regex="num"
            align="right"
            maxlength="10"
          />
        </kw-form-item>
      </kw-form-row>

      <kw-form-row label-size="100">
        <!--체험단여부-->
        <kw-form-item
          :label="$t('MSG_TXT_EXPN_GRP')+$t('MSG_TXT_YN')"
          hint="null"
        >
          <kw-checkbox
            v-model="installDetail.expnYn"
            label="체크 시, 일시불 멤버십비용 적용"
            :true-value="Y"
            :false-value="N"
          />
        </kw-form-item>
        <!--시리얼넘버-->
        <kw-form-item
          :label="$t('MSG_TXT_SR_NUM')"
          hint="null"
        >
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
            ref="isCntrDtlChg"
            v-model="installDetail.rtnDt"
          />
        </kw-form-item>
        <!--참고사항-->
        <kw-form-item
          :label="$t('MSG_TXT_REFER_ARTC')"
          :colspan="2"
        >
          <kw-input
            ref="isWellsDtlChg"
            v-model="installDetail.istAkArtcMoCn"
            maxlength="1000"
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
import { codeUtil, getComponentType, useDataService, useGlobal, useMeta, useModal } from 'kw-lib';
import { cloneDeep } from 'lodash';
// simport { isEmpty } from 'lodash-es';

const { notify } = useGlobal();
const { ok, cancel: onClickCancel } = useModal();
const { t } = useI18n();
const dataService = useDataService();
const sessionUserInfo = useMeta().getUserInfo();
const frmMainRef = ref(getComponentType('KwForm'));

const services = ref();
const codes = await codeUtil.getMultiCodes(
  'CO_IST_DV_CD', // 설치구분
  'CO_IST_USWY_CD', // 설치용도
  'PD_GD_CD', // 상품등급코드
  'CO_IST_USWY_CD', // 설치용도
  'CO_IST_MNGT_DV_CD', // 관리구분
  'IST_PLC_TP_CD', // 설치장소
);

const props = defineProps({
  cntrNoSn: { type: String, default: '' },
  cntrNo: { type: String, default: '' },
  cntrSn: { type: String, default: '' },
  cstKnm: { type: String, default: '' }, // [계약자명]
  bryyMmdd: { type: String, default: '' }, // [주민등록번호]
  bzrno: { type: String, default: '' }, // [사업자번호]
  cntrCstNo: { type: String, default: '' }, // [고객번호]
  rcgvpKnm: { type: String, default: '' }, // [설치자명]
  cntrCnfmDt: { type: String, default: '' }, // [접수일]
  coCd: { type: String, default: '' }, // [관리회사]
  basePdCd: { type: String, default: '' }, // [설치상품코드]
  pdNm: { type: String, default: '' }, // [설치상품명]
  pdGdCd: { type: String, default: '' }, // [제품등급]
  istPlcTpCd: { type: String, default: '' }, // [설치장소]
  svPrd: { type: String, default: '' }, // [방문주기]
  frisuBfsvcPtrmN: { type: String, default: '' }, // [무상기간]
  frisuAsPtrmN: { type: String, default: '' }, // [A/S기간]
  istDt: { type: String, default: '' }, // [설치일]
  rtnDt: { type: String, default: '' }, // [반품일]
  istAkArtcMoCn: { type: String, default: '' }, // [참고사항]
  coIstDvCd: { type: String, default: '' },
  copnDvCd: { type: String, default: '' },
  coIstUswyCd: { type: String, default: '' },
  coIstMngtDvCd: { type: String, default: '' },
  mpno: { type: String, default: '' },
  zip: { type: String, default: '' },
  basAdr: { type: String, default: '' },
  dtlAdr: { type: String, default: '' },
  installMpno: { type: String, default: '' },
  installZip: { type: String, default: '' },
  installBasAdr: { type: String, default: '' },
  installDtlAdr: { type: String, default: '' },
  expnYn: { type: String, default: 'N' },
  ojPdCd: { type: String, default: '' },
  cntrDtlStatCd: { type: String, default: '' },
});

const installDetail = ref({});
const isPdRelChg = ref(false);
const isCntrDtlChg = ref(false);
const isWellsDtlChg = ref(false);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// 팝업 초기화
async function initPage() {
  installDetail.value = cloneDeep(props);
  installDetail.value.ogCd = sessionUserInfo.ogCd;
  installDetail.value.ogNm = sessionUserInfo.ogCdNm;

  const codeRes = await dataService.get('/sms/wells/contract/contracts/company-service', { params: { pdCd: installDetail.value.basePdCd } });
  services.value = codeRes.data;
}

// 저장 버튼 클릭
async function onClickSave() {
  // check validation
  if (await frmMainRef.value.alertIfIsNotModified()) { return; }
  if (!await frmMainRef.value.validate()) { return; }

  installDetail.value.isPdRelChg = isPdRelChg.value.isModified();
  installDetail.value.isCntrDtlChg = isCntrDtlChg.value.isModified();
  installDetail.value.isWellsDtlChg = isWellsDtlChg.value.isModified();

  // call service
  await dataService.put('/sms/wells/contract/contracts/company-install', { ...installDetail.value });
  ok();
  await notify(t('MSG_ALT_SAVE_DATA'));
}

await initPage();

</script>
