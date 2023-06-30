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
            option-label="codeName"
            option-value="codeId"
            first-option="all"
            disable
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-item
        :label="$t('MSG_TXT_OSTR_D')"
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
import { codeUtil, getComponentType, useGlobal, useModal } from 'kw-lib';
// import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

// const { t } = useI18n();
const now = dayjs();
const { notify } = useGlobal();
// const { getters } = useStore();
// const { currentRoute } = useRouter();
const { cancel: onClickCancel } = useModal();
// const dataService = useDataService();
const props = defineProps({
  mgtStrNo: { type: String, default: '', required: true }, // 관리창고
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
  searchParams.value.wareNo = codes.SV_CNR_CD.filter((v) => v.codeId === props.mgtStrNo)[0].codeId;
});

/*
 * 리포트 보기
 */
async function onClickReportView() {
  // TODO: OZ REPORT 개발중..
  notify('oz리포트 모듈 개발중');
  // await openReportPopup(
  //   '/eformsample.ozr',
  //   '/eformsample.odi',
  //   JSON.stringify({ param1: 'test1', param2: 'test2' }),
  // );
}
</script>
