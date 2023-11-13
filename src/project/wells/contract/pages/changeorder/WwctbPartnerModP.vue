<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbPartnerModP - 판매자 변경
3. 작성자 : hyeonjong.ra
4. 작성일 : 2023.06.30
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 판매자 변경 (W-SS-U-0101P02)
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="popupRef"
    size="lg"
  >
    <kw-form :cols="2">
      <kw-form-row>
        <!-- 파트너 -->
        <kw-form-item
          :label="$t('MSG_TXT_PRTNR')"
        >
          <kw-input
            v-model="fieldParams.prtnrKnm"
            icon="search"
            maxlength="10"
            @click-icon="onClickSearchPartner"
          />
        </kw-form-item>
        <!-- 사번 -->
        <kw-form-item :label="$t('MSG_TXT_EPNO')">
          <p>{{ fieldParams.sellPrtnrNo }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 총괄단 -->
        <kw-form-item
          :label="$t('MSG_TXT_MANAGEMENT_DEPARTMENT')"
        >
          <p>{{ fieldParams.dgr1LevlOgNm }}</p>
        </kw-form-item>
        <!-- 지역단 -->
        <kw-form-item
          :label="$t('MSG_TXT_RGNL_GRP')"
        >
          <p>{{ fieldParams.dgr2LevlOgNm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 지점 -->
        <kw-form-item
          :label="$t('MSG_TXT_BRANCH')"
        >
          <p>{{ fieldParams.dgr3LevlOgNm }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <template #action>
      <!-- 취소 -->
      <kw-btn
        negative
        :label="$t('MSG_TXT_CANCEL')"
        @click="cancel()"
      />
      <!-- 저장 -->
      <kw-btn
        v-permission:update
        primary
        :label="$t('MSG_TXT_SAVE')"
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, useDataService, useModal, useGlobal } from 'kw-lib';
import { isEmpty } from 'lodash-es';

const { t } = useI18n();
const { ok, cancel } = useModal();
const dataService = useDataService();
const { modal, notify } = useGlobal();

const props = defineProps({
  cntrNo: {
    type: String,
    required: true,
  },
  cntrSn: {
    type: String,
    required: true,
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const popupRef = ref(getComponentType('KwPopup'));

const fieldParams = ref({
  cntrNo: '',
  cntrSn: '',
  dgr1LevlOgNm: '',
  dgr2LevlOgNm: '',
  dgr3LevlOgNm: '',
  ogTpCd: '',
  prtnrKnm: '',
  sellPrtnrNo: '',
  bfPrtnrNo: '',
  bfOgTpCd: '',
});

// 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/changeorder/changes/partners', { params: { cntrNo: props.cntrNo, cntrSn: props.cntrSn } });
  Object.assign(fieldParams.value, res.data);

  // 변경전 파트너 번호 복사
  fieldParams.value.bfPrtnrNo = res.data.sellPrtnrNo;
  fieldParams.value.bfOgTpCd = res.data.ogTpCd;

  popupRef.value.init();
}

// 파트너 검색 버튼 클릭
async function onClickSearchPartner() {
  fieldParams.value.dgr1LevlOgNm = '';
  fieldParams.value.dgr2LevlOgNm = '';
  fieldParams.value.dgr3LevlOgNm = '';
  fieldParams.value.ogTpCd = '';
  fieldParams.value.sellPrtnrNo = '';

  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: fieldParams.value.prtnrKnm,
      ogTpCd: fieldParams.value.bfOgTpCd,
    },
  });
  if (result) {
    fieldParams.value.sellPrtnrNo = payload.prtnrNo;
    fieldParams.value.prtnrKnm = payload.prtnrKnm;
    fieldParams.value.ogTpCd = payload.ogTpCd;
    fieldParams.value.dgr1LevlOgNm = payload.dgr1LevlOgNm;
    fieldParams.value.dgr2LevlOgNm = payload.dgr2LevlOgNm;
    fieldParams.value.dgr3LevlOgNm = payload.dgr3LevlOgNm;
  }
}

// 저장 버튼 클릭
async function onClickSave() {
  if (isEmpty(fieldParams.value.sellPrtnrNo)
  || isEmpty(fieldParams.value.prtnrKnm)
  || isEmpty(fieldParams.value.ogTpCd)) {
    notify('입력하신 파트너 정보가 없습니다.');
    return;
  }

  await dataService.put('/sms/wells/contract/changeorder/changes/partners', fieldParams.value);
  ok();
  notify(t('MSG_ALT_SAVE_DATA'));
}

onMounted(async () => {
  await fetchData();
});

</script>
