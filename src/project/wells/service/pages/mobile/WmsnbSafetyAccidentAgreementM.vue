<!-- eslint-disable max-len -->
<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB (방문관리)
2. 프로그램 ID : WmsnbSafetyAccidentAgreementM - 안전사고 전자합의서(모바일)
3. 작성자 : yeonghwa.cheon
4. 작성일 : 2023.06.27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 엔지니어가 AS처리 중에 발생한 안전사고 전자합의서를 모바일에서 관리하는 화면기능이다.
****************************************************************************************************
--->
<template>
  <kw-page>
    <div class="pa20">
      <h3 class="mb20">
        {{ t('MSG_TXT_CST_INF') }}
      </h3>
      <kw-form>
        <!-- 고객명 -->
        <kw-form-item :label="$t('MSG_TXT_CST_NM')">
          <p>{{ data.cstNm }}</p>
        </kw-form-item>
        <!-- 합의자명 -->
        <kw-form-item :label="$t('MSG_TXT_MAAS_NM')">
          <p>{{ data.maasFnm }}</p>
        </kw-form-item>
        <!-- 관계 -->
        <kw-form-item :label="$t('MSG_TXT_RLT')">
          <p>{{ data.fmlRelDvNm1 }}</p>
        </kw-form-item>
        <!-- 주소 -->
        <kw-form-item :label="$t('MSG_TXT_ADDR')">
          <p>
            {{ data.istAdr }} {{ data.istDtlAdr }} {{ data.istReferAdr }}
          </p>
        </kw-form-item>
        <!-- 제품명 -->
        <kw-form-item :label="$t('MSG_TXT_GOODS_NM')">
          <p>{{ data.pdNm }}</p>
        </kw-form-item>
      </kw-form>
      <div class="my20">
        <kw-separator spaced="0" />
      </div>
      <!-- 계좌정보 -->
      <h3 class="mb20">
        {{ t('MSG_TXT_AC_INF') }}
      </h3>
      <kw-form>
        <!-- 계좌번호 -->
        <kw-form-item :label="$t('MSG_TXT_AC_NO')">
          <p>{{ data.rfndAcnoEncr }}</p>
        </kw-form-item>
        <!-- 계좌주 -->
        <kw-form-item :label="$t('MSG_TXT_ACOWN')">
          <p>{{ data.rfndAcownNm }}</p>
        </kw-form-item>
        <!-- 은행명 -->
        <kw-form-item :label="$t('MSG_TXT_BNK_NM')">
          <p>{{ data.rfndBnkNm }}</p>
        </kw-form-item>
        <!-- 관계 -->
        <kw-form-item :label="$t('MSG_TXT_RLT')">
          <p>{{ data.fmlRelDvNm2 }}</p>
        </kw-form-item>
      </kw-form>
      <div class="my20">
        <kw-separator spaced="0" />
      </div>
      <!-- 보상인 -->
      <h3 class="mb20">
        {{ t('MSG_TXT_CPSR') }}
      </h3>
      <kw-form>
        <kw-form-item :label="$t('MSG_TXT_EMPL_NM')">
          <p>(주) 교원프라퍼티</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_ADDR')">
          <p>서울 중구 을지로 51</p>
        </kw-form-item>
      </kw-form>
    </div>
    <kw-separator
      divider
    />
    <div class="pa20">
      <h3 class="mb20">
        합의서
      </h3>
      <div>
        <ol
          type="1"
          class="pl20 my0 kw-font-pt14 kw-fc--black2"
        >
          <li class="pb16">
            (주)교원프라퍼티는 사용상 불편함을 끼쳐 드린 점에 대해 진심으로 사과 드리며, 유사 문제가 발생하지 않도록 자고의 노력을 다하겠습니다.
          </li>
          <li class="pb16">
            고객과 (주)교원프라퍼티는 상기 모델과 관련하여
            <span class="kw-fc--black1 text-weight-bold">{{ data.acdnDtm.substring(0,4) }}년 {{ data.acdnDtm.substring(4,6) }}월 {{ data.acdnDtm.substring(6,8) }}일</span>
            상기주소에서 발생한 사고에 대해 아래와 같이 원만히 합의합니다.
          </li>
          <li class="pb16">
            (주)교원프라퍼티는 고객에게 위 사고에 대한 배상금으로 최종 합의된 금액
            <span
              class="kw-fc--black1 text-weight-bold"
            >{{ stringUtil.getNumberWithComma(data.totCpsAmt) }}원</span>을 상기 계좌로 지금하며, 고객은 (주)교원프라퍼티에게 추가로 법률상,
            사실상 이의를 제기하지 않을 것을 약속하고, 합의 후 타인으로부터 추가 책임 요청이 있을 경우 <span class="kw-fc--black1 text-weight-bold">고객({{ data.rfndAcownNm }})</span>이 책임짐을 약속합니다.
          </li>
          <li class="pb16">
            고객은 위 사고 및 합의 내용을 공개·유포·누설하지 않을 것을 약속하며 공개·유포·누설 시 이에 대한 책임을 지고 (주)교원프라퍼티에게 일체의 손해를 배상할 것을 약속합니다.
          </li>
          <li class="pb16">
            고객과 (주)교원프라퍼티는 합의 내용을 신의성실 원칙에 의거하여 진정한 의사표시로 서명, 날인 합니다.
          </li>
        </ol>
        <span class="kw-font-pt14 kw-fc--black1 text-weight-bold">작성일 : {{ data.wrteDt.substring(0,4) }}년 {{ data.wrteDt.substring(4,6) }}월 {{ data.wrteDt.substring(6) }}일</span>
      </div>
    </div>
    <kw-separator
      divider
    />
    <div class="pa20">
      <!-- 고객서명 -->
      <h3 class="essential mb20">
        {{ t('MSG_BTN_CST_SIGN') }}
      </h3>
      <kw-sign
        v-if="isEmpty(data.cstSignCn)"
        ref="signMainRef"
        :need-recent-sign="false"
      />
      <kw-image
        v-if="!isEmpty(data.cstSignCn)"
        :src="data.cstSignCn"
        width="100%"
        height="100%"
        fit="contain"
      />
    </div>

    <template #action>
      <kw-btn
        filled
        primary
        :label="$t('MSG_BTN_SAVE')"
        :disable="!isEmpty(data.cstSignCn)"
        @click="onClickSave"
      />
    </template>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import {
  useDataService,
  useGlobal,
  stringUtil,
} from 'kw-lib';
import { isEmpty } from 'lodash-es';

const { t } = useI18n();
const { notify } = useGlobal();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const signMainRef = ref(null);
const props = defineProps({
  acdnRcpId: {
    type: String,
    required: true,
  },
});
const data = ref({});
data.value = (await dataService.get(`/sms/wells/service/safety-accidents/${props.acdnRcpId}`)).data;
async function onClickSave() {
  if (!signMainRef.value.isSignExist) {
    notify(t('MSG_ALT_SIGN')); // 서명해주세요.
    return;
  }

  data.value.cstSignCn = signMainRef.value.getSignData('image/jpeg');
  // 저장.
  await dataService.put('/sms/wells/service/safety-accidents/sign', data.value);
  notify(t('MSG_ALT_SAVE_DATA')); // 저장되었습니다.
}
</script>

<style scoped lang="scss">
</style>
