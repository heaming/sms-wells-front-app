<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : [W-SV-U-0293PM03] WmsnbHappyCallRegMFinish - 해피콜등록_완료(모바일)
3. 작성자 : gs.piit122
4. 작성일 : 2023.03.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 해피콜등록_완료(모바일)
****************************************************************************************************
--->
<template>
  <kw-page title="Wells">
    <div class="inner-content">
      <div class="inner-content__center">
        <kw-avatar
          size="48px"
          font-size="28px"
          color="line-bg"
          text-color="primary"
          icon="visual_check"
        />
        <p
          class="kw-font-title mt20"
          @click="onClear"
        >
          {{ $t('MSG_TIT_HP_OPN_TNKS') /*소중한 의견 감사합니다*/ }}
        </p>
      </div>
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService } from 'kw-lib';

const dataService = useDataService();
const router = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  cntrNo: { type: String, default: '' },
  cstSvAsnNo: { type: String, default: '' },
});
async function onClear() {
  const { cstSvAsnNo } = props;
  await dataService.delete('/sms/wells/service/happy-call/', {
    data: { cstSvAsnNo },
  });
  router.push({
    path: '/wmsnb-happy-call-reg-entry',
    query: {
      cntrNo: props.cntrNo,
      cstSvAsnNo: props.cstSvAsnNo,
    },
  });
}
</script>
<style scoped lang="scss">
.inner-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  &__center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    text-align: center;
  }
}
</style>
