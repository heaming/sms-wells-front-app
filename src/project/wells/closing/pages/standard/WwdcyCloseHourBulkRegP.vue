<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCY
2. 프로그램 ID : WwdcyCloseHourBulkRegP - 마감시간 일괄등록 / W-CL-U-0089P01
3. 작성자 : juhyun.kim
4. 작성일 : 2023.03.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
--->
<template>
  <kw-popup
    size="4xl"
  >
    <kw-form
      ref="frmMainRef"
      :cols="2"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CRP_DV')"
        >
          <kw-select
            v-model.trim="frmMainData.kwGrpCoCd"
            :options="codes.KW_GRP_CO_CD"
            readonly
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_CL_DV')"
        >
          <kw-select
            v-model="frmMainData.clBizTpCd"
            :options="closeDivideCodes.clBizTpCd"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_PSIC_DV')"
        >
          <kw-option-group
            v-model="frmMainData.clPsicNo"
            type="radio"
            :options="clPsicCodes"
            @change="onChangePersonCharge"
          />
          <kw-input
            v-model="frmMainData.prtnrNo"
            icon="search"
            clearable
            :readonly="isRtnrNo"
            @click-icon="onClickIcon"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_BASE_YM')"
          required
        >
          <!-- TODO.기준년월 컬럼 없음 확인해야함-->
          <kw-date-picker
            v-model="frmMainData.baseYm"
            type="month"
            rules="required"
            :label="$t('MSG_TXT_BASE_YM')"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-separator />
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CRT_DT')"
          required
        >
          <kw-date-picker
            v-model="frmMainData.crtDt"
            type="date"
            rules="required"
            :label="$t('MSG_TXT_CRT_DT')"
            :min-date="minDate?.format('YYYY-MM-DD')"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_CRT_HH_PERF_DT')"
          required
        >
          <!--생성일 시간/실적일자-->
          <kw-field-wrap>
            <kw-time-picker
              v-model="frmMainData.crtDtTmFrom"
              :label="$t('MSG_TXT_CRT_HH_PERF_DT')"
              rules="required"
            />
            <span>~</span>
            <kw-time-picker
              v-model="frmMainData.crtDtTmTo"
              :label="$t('MSG_TXT_CRT_HH_PERF_DT')"
              rules="required"
            />
            <kw-option-group
              v-model="frmMainData.crtDtPerfDtDvVal"
              type="radio"
              :options="dtDvCodes"
              :label="$t('MSG_TXT_CRT_HH_PERF_DT')"
              rules="required"
            /><!--TODO. 설계자 확인 후 코드 수정 필요 -->
          </kw-field-wrap>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CL_DT')"
          required
        >
          <kw-date-picker
            v-model="frmMainData.clDt"
            type="date"
            rules="required"
            :min-date="minDate?.format('YYYY-MM-DD')"
            :label="$t('MSG_TXT_CL_DT')"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_D_CL_HH_PERF_DT')"
          required
        >
          <kw-field-wrap>
            <kw-time-picker
              v-model="frmMainData.ddClDtTmFrom"
              rules="required"
              :label="$t('MSG_TXT_D_CL_HH_PERF_DT')"
            />
            <span>~</span>
            <kw-time-picker
              v-model="frmMainData.ddClDtTmTo"
              rules="required"
              :label="$t('MSG_TXT_D_CL_HH_PERF_DT')"
            />
            <kw-option-group
              v-model="frmMainData.ddClPerfDtDvVal"
              type="radio"
              :options="dtDvCodes"
              rules="required"
              :label="$t('MSG_TXT_D_CL_HH_PERF_DT')"
            /><!--일마감 시간/실적일자 -->
          </kw-field-wrap>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_RENTAL_CL_D_PED')"
          required
        >
          <!--(렌탈)마감일/실적일자-->
          <kw-field-wrap>
            <kw-time-picker
              v-model="frmMainData.rentalRcpClDdTmFrom"
              :label="$t('MSG_TXT_RENTAL_CL_D_PED')"
              rules="required"
            />
            <span>~</span>
            <kw-time-picker
              v-model="frmMainData.rentalRcpClDdTmTo"
              :label="$t('MSG_TXT_RENTAL_CL_D_PED')"
              rules="required"
            />
            <kw-option-group
              v-model="frmMainData.rentalRcpClDdPerfDtDvVal"
              type="radio"
              :options="dtDvCodes"
              :label="$t('MSG_TXT_RENTAL_CL_D_PED')"
              rules="required"
            /><!--TODO. 설계자 확인 후 코드 수정 필요 -->
          </kw-field-wrap>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_RENTAL_CL_NXD_LAST_HH_PED')"
          required
        >
          <!--(렌탈)마감익일~말일시간/실적일자-->
          <kw-field-wrap>
            <kw-time-picker
              v-model="frmMainData.rentalRcpClNxdTmForm"
              :label="$t('MSG_TXT_RENTAL_CL_NXD_LAST_HH_PED')"
              rules="required"
            />
            <span>~</span>
            <kw-time-picker
              v-model="frmMainData.rentalRcpClNxdTmTo"
              :label="$t('MSG_TXT_RENTAL_CL_NXD_LAST_HH_PED')"
              rules="required"
            />
            <kw-option-group
              v-model="frmMainData.rentalRcpClNxdPerfDtDvVal"
              type="radio"
              :options="dtDvCodes"
              :label="$t('MSG_TXT_RENTAL_CL_NXD_LAST_HH_PED')"
              rules="required"
            /><!--TODO. 설계자 확인 후 코드 수정 필요 -->
          </kw-field-wrap>
        </kw-form-item>
      </kw-form-row>
      <!-- (일시불)마감일/실적일자 -->
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_SPAY_CL_D_PED')"
          required
        >
          <kw-field-wrap>
            <kw-time-picker
              v-model="frmMainData.spayRcpClDdTmFrom"
              :label="$t('MSG_TXT_SPAY_CL_D_PED')"
              rules="required"
            />
            <span>~</span>
            <kw-time-picker
              v-model="frmMainData.spayRcpClDdTmTo"
              :label="$t('MSG_TXT_SPAY_CL_D_PED')"
              rules="required"
            />
            <kw-option-group
              v-model="frmMainData.spayRcpClDdPerfDtDvVal"
              type="radio"
              :options="dtDvCodes"
              :label="$t('MSG_TXT_SPAY_CL_D_PED')"
              rules="required"
            /><!--TODO. 설계자 확인 후 코드 수정 필요 -->
          </kw-field-wrap>
        </kw-form-item>
        <!-- (일시불) 마감익일~말일시간/실적일자 -->
        <kw-form-item
          :label="$t('MSG_TXT_SPAY_CL_NXD_LAST_HH_PED')"
          required
        >
          <kw-field-wrap>
            <kw-time-picker
              v-model="frmMainData.spayRcpClNxdTmFrom"
              :label="$t('MSG_TXT_SPAY_CL_NXD_LAST_HH_PED')"
              rules="required"
            />
            <span>~</span>
            <kw-time-picker
              v-model="frmMainData.spayRcpClNxdTmTo"
              :label="$t('MSG_TXT_SPAY_CL_NXD_LAST_HH_PED')"
              rules="required"
            />
            <kw-option-group
              v-model="frmMainData.spayRcpClNxdPerfDtDvVal"
              type="radio"
              :options="dtDvCodes"
              :label="$t('MSG_TXT_SPAY_CL_NXD_LAST_HH_PED')"
              rules="required"
            /><!--TODO. 설계자 확인 후 코드 수정 필요 -->
          </kw-field-wrap>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <kw-btn
        v-permission:create
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
import { codeUtil, useDataService, useGlobal, useModal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
// import dayjs from 'dayjs';
import clConst from '~sms-common/closing/constants/clConst';

const { ok } = useModal();
const { t } = useI18n();
const { notify } = useGlobal();
const dataService = useDataService();
// const { getters } = useStore();
const store = useStore();
const { modal } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const frmMainRef = ref();
const isRtnrNo = ref(true);
// const userInfo = getters['meta/getUserInfo'];
const codes = await codeUtil.getMultiCodes(
  'CL_BIZ_TP_CD', // [마감업무유형코드],
  'KW_GRP_CO_CD',
);

const props = defineProps({
  clBizTpCd: {
    type: String,
    default: null,
  },
  baseYm: {
    type: String,
    default: null,
  },
});

// TODO. 확정되면 수정
const dtDvCodes = ref([
  { codeId: '1', codeName: '당일' },
  { codeId: '2', codeName: '익월1일' },
]);

const clPsicCodes = ref([
  { codeId: '0', codeName: '공통' },
  { codeId: '', codeName: '담당자' },
]);

const clDtDate = new Date(props.baseYm.substring(0, 4), props.baseYm.substring(4, 6), 0);

// TODO: 초기 설정 정보 명세서 기준으로 작업(참고 명세서 완료본 아니기 때문에 마무리전 반드시 확인 필요)
// TODO: 마감담당자(clPsicNo ) 관련 키 인데... 화면에는 공통이라는 내용이 있음 어떻게 해야 하는지 명세서에 없음 확인 필요 테스트 하느라 임의값 셋팅
// TODO. 법인, 마감구분, 기준년월 제외하고 다 수정해야됨
const frmMainData = ref({
  kwGrpCoCd: store.getters['meta/getUserInfo'].companyCode, // 1200 교원 / 2000 교원 프러퍼티
  clBizTpCd: props.clBizTpCd,
  clPsicNo: '0',
  prtnrNo: '', // 담당자 구분
  baseYm: props.baseYm,
  crtDt: `${props.baseYm}01`, // 생성일자
  crtDtTmFrom: '0800',
  crtDtTmTo: '2359',
  crtDtPerfDtDvVal: '1',

  clDt: props.baseYm + clDtDate.getDate(), // 마감일자
  ddClDtTmFrom: '0800',
  ddClDtTmTo: '2359',
  ddClPerfDtDvVal: '1',

  // (렌탈)마감일/실적일자
  rentalRcpClDdTmFrom: '0800',
  rentalRcpClDdTmTo: '2359',
  rentalRcpClDdPerfDtDvVal: '1',

  // (렌탈)마감익일~말일시간/실적일자
  rentalRcpClNxdTmForm: '0800',
  rentalRcpClNxdTmTo: '2359',
  rentalRcpClNxdPerfDtDvVal: '2',

  // (일시불)마감일/실적일자
  spayRcpClDdTmFrom: '0800',
  spayRcpClDdTmTo: '2359',
  spayRcpClDdPerfDtDvVal: '1',

  // (일시불)마감익일~말일시간/실적일자
  spayRcpClNxdTmFrom: '0800',
  spayRcpClNxdTmTo: '2359',
  spayRcpClNxdPerfDtDvVal: '1',

});

async function onChangePersonCharge() {
  const { clPsicNo } = frmMainData.value;

  if (clPsicNo === '0') {
    frmMainData.value.prtnrNo = '';
    isRtnrNo.value = true;
  } else {
    isRtnrNo.value = false;
  }
}

// 파트너 검색 팝업
async function onClickIcon() {
  if (frmMainData.value.clPsicNo === '0') {
    return;
  }
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: frmMainData.value.prtnrNo,
    },
  });
  if (result) {
    frmMainData.value.prtnrNo = payload.prtnrNo;
  }
}

async function onClickSave() {
  if (frmMainData.value.clPsicNo !== '0' && isEmpty(frmMainData.value.prtnrNo)) {
    notify('담당자를 입력해 주세요.');
    return;
  }
  if (!await frmMainRef.value.validate()) { return; }
  const { clPsicNo } = frmMainData.value;
  // 담당자구분이 담당자이면 파트너 번호로
  frmMainData.value.clPsicNo = isEmpty(clPsicNo) ? frmMainData.value.prtnrNo : clPsicNo;
  const data = cloneDeep(frmMainData.value);

  const res = await dataService.post('/sms/wells/closing/standard', data);

  notify(t('MSG_ALT_SAVE_DATA'));
  ok(res);
}

const closeDivideCodes = ref({ clBizTpCd: [] });
codes.CL_BIZ_TP_CD.forEach((data) => {
  if (store.getters['meta/getUserInfo'].tenantId === clConst.TENANT_ID_WELLS && (data.codeId === '11'
        || data.codeId === '21')) {
    closeDivideCodes.value.clBizTpCd = [{ codeId: '11', codeName: '주문시간마감(일반)' }, { codeId: '21', codeName: '주문시간마감(아웃소싱)' }];
  }
});
</script>
