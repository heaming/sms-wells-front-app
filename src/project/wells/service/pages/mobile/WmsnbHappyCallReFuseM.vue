<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : [W-SV-U-0293PM03] WmsnbHappyCallReFuseM - 해피콜등록_수신거부(모바일)
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
          color="line-bg"
          font-size="28px"
          icon="visual_check"
          size="48px"
          text-color="primary"
        />
        <p
          class="kw-font-title mt20"
          @click="doRefuse"
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
import { useDataService, useGlobal } from 'kw-lib';
import { isEmpty } from 'lodash-es';

const { confirm, alert } = useGlobal();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  cntrNo: { type: String, default: '' },
  cntrSn: { type: String, default: '' },
  cstSvAsnNo: { type: String, default: '' },
});

async function doRefuse() {
  if (await confirm('설문 수신거부를\n신청하시겠습니까?')) {
    const { cntrNo } = props;
    const { cntrSn } = props;
    const { cstSvAsnNo } = props;
    const res = await dataService.post('/sms/wells/service/happy-call/refuse', {
      cntrNo,
      cntrSn,
      cstSvAsnNo,
    });
    if (isEmpty(res.data.resultCode) || res.data.resultCode !== 'S') {
      console.error(res);
      const errMsg = isEmpty(res.data.resultMessage) ? '수신거부 등록에 실패했습니다' : res.data.resultMessage;
      await alert(errMsg);
    }
  }
}

onMounted(() => {
  doRefuse();
});
</script>
<style lang="scss" scoped>
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
