<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : [W-SV-U-0293PM02] WmsnbHappyCallRegMChoise - 해피콜등록_선택(모바일)
3. 작성자 : gs.piit122
4. 작성일 : 2023.03.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 해피콜등록_선택(모바일)
****************************************************************************************************
--->
<template>
  <kw-page
    title="Wells"
  >
    <div class="pa20">
      <h3>
        {{ /*어떤 점을 개선하면 좋을까요?*/
          $t('MSG_TXT_HP_QUST_IPVM') }}
      </h3>
      <div class="row justify-center mt20">
        <kw-btn
          :icon="refStar.icon1"
          borderless
          class="mr6 ml6"
          style="font-size: 36px;"
          @click="reDrawStar('1')"
        />
        <kw-btn
          :icon="refStar.icon2"
          borderless
          class="mr6 ml6"
          style="font-size: 36px;"
          @click="reDrawStar('2')"
        />
        <kw-btn
          :icon="refStar.icon3"
          borderless
          class="mr6 ml6"
          style="font-size: 36px;"
          @click="reDrawStar('3')"
        />
        <kw-btn
          :icon="refStar.icon4"
          borderless
          class="mr6 ml6"
          style="font-size: 36px;"
          @click="reDrawStar('4')"
        />
        <kw-btn
          :icon="refStar.icon5"
          borderless
          class="mr6 ml6"
          style="font-size: 36px;"
          @click="reDrawStar('5')"
        />
      </div>
    </div>
    <kw-separator divider />

    <div class="pa20">
      <h3>
        {{ /*중복선택 가능합니다.*/
          $t('MSG_TXT_HP_DUP_CHO') }}
      </h3>

      <div class="multi-select mt20">
        <div
          v-for="item in refOptions"
          :id="'div'.concat(item.icon)"
          :key="item.icon"
          :class="refClass.classes[item.icon-1]"
          :icon="'selectImage(' + item.icon + ')'"
          @click="selectImage(item.icon)"
        >
          <kw-avatar
            size="98px"
          >
            <img
              v-if="item.icon === '1'"
              alt="profile"
              :label="item.noGood + '/' + item.soGood"
              src="~~@assets/images/happycall_select_img.png"
            >
            <img
              v-if="item.icon === '2'"
              alt="profile"
              :label="item.noGood + '/' + item.soGood"
              src="~~@assets/images/happycall_select_img02.png"
            >
            <img
              v-if="item.icon === '3'"
              alt="profile"
              :label="item.noGood + '/' + item.soGood"
              src="~~@assets/images/happycall_select_img03.png"
            >
            <img
              v-if="item.icon === '4'"
              alt="profile"
              :label="item.noGood + '/' + item.soGood"
              src="~~@assets/images/happycall_select_img04.png"
            >
            <img
              v-if="item.icon === '5'"
              alt="profile"
              :label="item.noGood + '/' + item.soGood"
              src="~~@assets/images/happycall_select_img05.png"
            >
            <img
              v-if="item.icon === '6'"
              alt="profile"
              :label="item.noGood + '/' + item.soGood"
              src="~~@assets/images/happycall_select_img06.png"
            >

            <kw-icon
              color="bg-white"
              name="check_24"
              size="45px"
            />
          </kw-avatar>
          <p
            v-show="refSelected !== '5'"
            v-html="item.noGood"
          />
          <p
            v-show="refSelected === '5'"
            v-html="item.soGood"
          />
        </div>
      </div>
      <kw-input
        v-model="refParam.etc"
        class="mt20"
        :label="$t('MSG_TXT_ETC') /*기타*/"
      />
    </div>
    <template #action>
      <kw-btn
        filled
        :label="$t('MSG_TXT_HP_EVL_TRS') /*평가 보내기*/"
        primary
        @click="onSubmit"
      />
    </template>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
// kw-lib import
import {
  useDataService, alert, confirm,
} from 'kw-lib';

const { t } = useI18n();
const dataService = useDataService();
const router = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const refStar = ref({
  icon1: 'bookmark_on',
  icon2: 'bookmark_off',
  icon3: 'bookmark_off',
  icon4: 'bookmark_off',
  icon5: 'bookmark_off',
});

const refOptions = ref([]);
const refSelected = ref('');
const refClass = ref({ classes: [
  'multi-select-item',
  'multi-select-item',
  'multi-select-item',
  'multi-select-item',
  'multi-select-item',
  'multi-select-item',
] });
const refParam = ref({
  selectedStar: 0,
  image1: 0,
  image2: 0,
  image3: 0,
  image4: 0,
  image5: 0,
  image6: 0,
  etc: '',
});

const props = defineProps({
  selectedStar: { type: String, default: '' },
  // svBizDclsfCd: { type: String, default: '' },
  // sellTpCd: { type: String, default: '' },
  // wkExcnDt: { type: String, default: '' },
  cntrNo: { type: String, default: '' },
  cntrSn: { type: String, default: '' },
  cstSvAsnNo: { type: String, default: '' },
});
console.log(props);

function reDrawStar(num) {
  refSelected.value = num;

  refParam.value.selectedStar = num;

  refStar.value.icon1 = 'bookmark_off';
  refStar.value.icon2 = 'bookmark_off';
  refStar.value.icon3 = 'bookmark_off';
  refStar.value.icon4 = 'bookmark_off';
  refStar.value.icon5 = 'bookmark_off';

  switch (num) {
    case '1':
      refStar.value.icon1 = 'bookmark_on';
      break;
    case '2':
      refStar.value.icon1 = 'bookmark_on';
      refStar.value.icon2 = 'bookmark_on';
      break;
    case '3':
      refStar.value.icon1 = 'bookmark_on';
      refStar.value.icon2 = 'bookmark_on';
      refStar.value.icon3 = 'bookmark_on';
      break;
    case '4':
      refStar.value.icon1 = 'bookmark_on';
      refStar.value.icon2 = 'bookmark_on';
      refStar.value.icon3 = 'bookmark_on';
      refStar.value.icon4 = 'bookmark_on';
      break;
    case '5':
      refStar.value.icon1 = 'bookmark_on';
      refStar.value.icon2 = 'bookmark_on';
      refStar.value.icon3 = 'bookmark_on';
      refStar.value.icon4 = 'bookmark_on';
      refStar.value.icon5 = 'bookmark_on';
      break;
  }
}

async function fetchData() {
  const { wkExcnDt } = props;
  const { cntrNo } = props;
  const { cntrSn } = props;
  const { cstSvAsnNo } = props;
  const dataGb = cstSvAsnNo.substring(0, 1);

  let res = await dataService.get('/sms/wells/service/happy-call/result-count', { params: {
    cntrNo,
    cntrSn,
    cstSvAsnNo,
  } });

  if (res.data.resultCnt > 0) {
    /* 이미 설문 참여가 완료 됐습니다 */
    router.push({
      path: '/mobile/wmsnb-happy-call-reg-dup',
      query: {
        // svBizDclsfCd: props.svBizDclsfCd,
        // sellTpCd: props.sellTpCd,
        // wkExcnDt: props.wkExcnDt,
        cntrNo: props.cntrNo,
        cntrSn: props.cntrSn,
        cstSvAsnNo: props.cstSvAsnNo,
      },
    });
    return;
  }

  res = await dataService.get('/sms/wells/service/happy-call/reject-count', { params: {
    cntrNo,
    cntrSn,
    cstSvAsnNo,
    wkExcnDt,
  } });

  if (res.data.rejectCnt > 0) {
    alert('이미 설문 거부 의사를 반영 했습니다.');
    router.push({
      path: '/mobile/wmsnb-happy-call-reg-choise',
      query: { },
    });
    return;
  }

  res = await dataService.get('/sms/wells/service/happy-call/options', { params: {
    dataGb,
  } });

  refOptions.value = res.data;

  /**
    cx팀에서 지정한 이미지 넘버링이 DB의 데이터와 틀림
    happycall_select_img06 -> T_CMZ_CD_D ARYL_ORD=1 원하는 날짜에<br/>예약되지 않음
    happycall_select_img04 -> T_CMZ_CD_D ARYL_ORD=2 약속시간에<br/>방문하지 않음
    happycall_select_img05 -> T_CMZ_CD_D ARYL_ORD=3 단정하지 않은<br/>유니폼
    happycall_select_img02 -> T_CMZ_CD_D ARYL_ORD=4 깔끔하지 않은<br/>뒷마무리
    happycall_select_img03 -> T_CMZ_CD_D ARYL_ORD=5 설치제품에 대한 설명 없음
    happycall_select_img01 -> T_CMZ_CD_D ARYL_ORD=6 불친절한 응대
  */
  refOptions.value.forEach((row, idx) => {
    switch (row.cdVldVal) {
      case 'RSLT01': refOptions.value[idx].icon = '6'; break;
      case 'RSLT02': refOptions.value[idx].icon = '4'; break;
      case 'RSLT03': refOptions.value[idx].icon = '5'; break;
      case 'RSLT04': refOptions.value[idx].icon = '2'; break;
      case 'RSLT05': refOptions.value[idx].icon = '3'; break;
      case 'RSLT06': refOptions.value[idx].icon = '1'; break;
    }
  });
}

async function selectImage(num) {
  switch (num - 1) {
    case 0:
      refParam.value.image1 = refParam.value.image1 === 1 ? 0 : 1;
      refClass.value.classes[num - 1] = refParam.value.image1 === 0 ? 'multi-select-item' : 'multi-select-item multi-select-item--selected';
      break;
    case 1:
      refParam.value.image2 = refParam.value.image2 === 1 ? 0 : 1;
      refClass.value.classes[num - 1] = refParam.value.image2 === 0 ? 'multi-select-item' : 'multi-select-item multi-select-item--selected';
      break;
    case 2:
      refParam.value.image3 = refParam.value.image3 === 1 ? 0 : 1;
      refClass.value.classes[num - 1] = refParam.value.image3 === 0 ? 'multi-select-item' : 'multi-select-item multi-select-item--selected';
      break;
    case 3:
      refParam.value.image4 = refParam.value.image4 === 1 ? 0 : 1;
      refClass.value.classes[num - 1] = refParam.value.image4 === 0 ? 'multi-select-item' : 'multi-select-item multi-select-item--selected';
      break;
    case 4:
      refParam.value.image5 = refParam.value.image5 === 1 ? 0 : 1;
      refClass.value.classes[num - 1] = refParam.value.image5 === 0 ? 'multi-select-item' : 'multi-select-item multi-select-item--selected';
      break;
    case 5:
      refParam.value.image6 = refParam.value.image6 === 1 ? 0 : 1;
      refClass.value.classes[num - 1] = refParam.value.image6 === 0 ? 'multi-select-item' : 'multi-select-item multi-select-item--selected';
      break;
  }
}

async function onSubmit() {
  const vstDt = props.wkExcnDt;
  const { cntrNo } = props;
  const { cntrSn } = props;
  const { cstSvAsnNo } = props;
  const dataGb = cstSvAsnNo.substring(0, 1);

  const res = await dataService.get('/sms/wells/service/happy-call/result-count', { params: {
    cntrNo,
    cntrSn,
    cstSvAsnNo,
  } });

  if (res.data.resultCnt > 0) {
    /* 이미 설문 참여가 완료 됐습니다 */
    router.push({
      path: '/mobile/wmsnb-happy-call-reg-dup',
      query: {
        // svBizDclsfCd: props.svBizDclsfCd,
        // sellTpCd: props.sellTpCd,
        // wkExcnDt: props.wkExcnDt,
        cntrNo: props.cntrNo,
        cntrSn: props.cntrSn,
        cstSvAsnNo: props.cstSvAsnNo,
      },
    });
    return;
  }

  if (await confirm(t('MSG_ALT_WANT_SEND'))) {
    await dataService.post('/sms/wells/service/happy-call/', {
      cntrNo,
      cntrSn,
      cstSvAsnNo,
      rslt06: refParam.value.image6,
      rslt04: refParam.value.image4,
      rslt05: refParam.value.image5,
      rslt02: refParam.value.image2,
      rslt03: refParam.value.image3,
      rslt01: refParam.value.image1,
      etc: refParam.value.etc,
      vstDt,
      dataGb,
      selStar: refParam.value.selectedStar,
    });

    router.push({
      path: '/mobile/wmsnb-happy-call-reg-finish',
      query: {
        // svBizDclsfCd: props.svBizDclsfCd,
        // sellTpCd: props.sellTpCd,
        // wkExcnDt: props.wkExcnDt,
        cntrNo: props.cntrNo,
        cntrSn: props.cntrSn,
        cstSvAsnNo: props.cstSvAsnNo,
      },
    });
  }
}

function onLoad() {
  reDrawStar(props.selectedStar);
  fetchData();
}
onLoad();

</script>

<style lang="scss" scoped>
.multi-select {
  display: flex;
  gap: 16px 12px;
  flex-wrap: wrap;

  &-item {
    width: calc((100% - 24px) / 3);
    display: flex;
    flex-direction: column;
    align-items: center;

    p {
      margin-top: 4px;
      font-size: 14px;
      color: $black2;
      text-align: center;
    }

    &--selected {
      :deep(.kw-avatar) {
        position: relative;
        overflow: hidden;

        &::after {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background: rgba($primary, 70%);
        }

        .kw-icon {
          display: block !important;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
        }
      }
    }
  }

  :deep(.kw-avatar) {
    .kw-icon {
      display: none;
    }
  }
}

</style>
