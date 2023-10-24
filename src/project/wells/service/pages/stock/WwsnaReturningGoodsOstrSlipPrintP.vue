<!--
 ***************************************************************************************************
 * 프로그램 개요
 ***************************************************************************************************
 1. 모듈 : 반품출고전표출력
 2. 프로그램 ID : K-W-SV-U-0170P01
 3. 작성자 : heymi.cho
 4. 작성일 : 2023.06.29
 ***************************************************************************************************
 * 프로그램 설명
 ***************************************************************************************************
 - 반품출고전표출력 (http://localhost:3000/#/service/wwsna-returning-goods-out-of-storages-slip)
 ***************************************************************************************************
-->
<template>
  <kw-popup size="sm">
    <kw-form
      ref="frmMainRef"
      :cols="1"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_MNGT_WARE')"
        >
          <kw-select
            v-model="searchParams.wareNo"
            :options="codes.SV_CNR_CD"
            first-option="all"
            disable
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_OSTR_D')"
        required
      >
        <kw-date-picker
          v-model="searchParams.ostrDt"
          type="date"
          :rules="required"
        />
      </kw-form-item>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_OVIV_FOM')"
          required
        >
          <kw-select
            v-model="searchParams.ovivFomCd"
            :options="codes.OVIV_FOM_CD"
            first-option="select"
            :rules="required"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_UNUITM')"
        >
          <kw-input
            v-model="searchParams.unuitm"
            :placeholder="$t('MSG_TXT_INP')"
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
        :label="$t('MSG_BTN_CONFIRM')"
        primary
        @click="onClickReportView"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, useModal } from 'kw-lib';
// import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';
import { openReportPopup } from '~common/utils/cmPopupUtil';

// const { t } = useI18n();
const now = dayjs();
// const { notify } = useGlobal();
// const { getters } = useStore();
// const { currentRoute } = useRouter();
const { cancel: onClickCancel } = useModal();
// const dataService = useDataService();
const props = defineProps({
  mgtStrNo: { type: String, default: '', required: true }, // 관리창고
  rtngdProcsTpCd: { type: String, default: '', required: true }, // 반품처리유형
  startDate: { type: String, default: '', required: true }, // 확인일자 from
  endDate: { type: String, default: '', required: true }, // 확인일자 to
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const frmMainRef = ref(getComponentType('KwForm'));
// let cachedParams; // TODO: 오즈리포트 모듈 개발 이후 사용할 예정입니다:D

const codes = await codeUtil.getMultiCodes(
  'SV_CNR_CD',
  'OVIV_FOM_CD',
);

/*
 *  Search Parameter - oz리포트를 위한 정보 조회용 파라미터
 */
const searchParams = ref({
  wareNo: '', // 관리창고
  ostrDt: now.format('YYYYMMDD'), // 출고일
  ovivFomCd: '', // 배차형태
  unuitm: '', // 특이사항
});

onMounted(async () => {
  searchParams.value.wareNo = codes.SV_CNR_CD.filter((v) => v.codeId === props.mgtStrNo)[0].length > 0
    ? codes.SV_CNR_CD.filter((v) => v.codeId === props.mgtStrNo)[0].codeId : '';
});

/*
 * 리포트 보기
 */

async function onClickReportView() {
  console.log(searchParams);
  console.log(props);
  // notify('oz리포트 모듈 개발중');
  const reportParams = {
    OUT_DT: searchParams.value.ostrDt, // 출고일자
    SVC_CD: searchParams.value.wareNo, // 상위창고번호
    TO_DT: props.startDate, // 시작일
    FROM_DT: props.endDate, // 종료일
    ST163_RET_PRO_TYP: props.rtngdProcsTpCd, // 반품처리유형코드
    DEG_GB: '', // 최종품목등급코드
    OVIV_TP_CD: searchParams.value.ovivFomCd, // 배차형태
    MEMO: searchParams.value.unuitm, // 메모
  };

  console.log(reportParams);

  await openReportPopup(
    '/kyowon_as/stckreturnout.ozr',
    'kyowon_as/stckreturnout.ozi',
    JSON.stringify(reportParams),
  );
}
</script>
