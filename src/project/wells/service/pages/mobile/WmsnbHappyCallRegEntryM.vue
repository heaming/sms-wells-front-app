<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : [W-SV-U-0293PM01] WmsnbHappyCallRegMEntry - 해피콜등록_진입(모바일)
3. 작성자 : gs.piit122
4. 작성일 : 2023.03.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 해피콜 진입
****************************************************************************************************
--->
<template>
  <kw-page title="Wells">
    <div class="pa20">
      <h3>
        {{ /*이번 웰스 서비스는 전반적으로
         얼마나 만족하십니까?*/
          $t('MSG_TXT_HP_QUST_STFT') }}
      </h3>
      <div class="row justify-center mt20">
        <kw-btn
          borderless
          class="mr6 ml6"
          icon="bookmark_on"
          style="font-size: 36px;"
          @click="onClick(1)"
        />
        <kw-btn
          borderless
          class="mr6 ml6"
          icon="bookmark_off"
          style="font-size: 36px;"
          @click="onClick(2)"
        />
        <kw-btn
          borderless
          class="mr6 ml6"
          icon="bookmark_off"
          style="font-size: 36px;"
          @click="onClick(3)"
        />
        <kw-btn
          borderless
          class="mr6 ml6"
          icon="bookmark_off"
          style="font-size: 36px;"
          @click="onClick(4)"
        />
        <kw-btn
          borderless
          class="mr6 ml6"
          icon="bookmark_off"
          style="font-size: 36px;"
          @click="onClick(5)"
        />
      </div>

      <ul class="kw-notification">
        <li>
          {{ /*본 평가는 방문관리 서비스의 품질 향상을 위하여 익명으로 수집되며,
        해당 웰스엔지니어에게 전달되지 않습니다.*/
            $t('MSG_TXT_HP_ANYM') }}
        </li>
      </ul>
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  svBizDclsfCd: { type: String, default: '' },
  sellTpCd: { type: String, default: '' },
  wkExcnDt: { type: String, default: '' },
  cntrNo: { type: String, default: '' },
  cntrSn: { type: String, default: '' },
  cstSvAsnNo: { type: String, default: '' },
  para: {
    type: String,
    default: '',
  },
  /* para: {
    type: String,
    default: '',
    // default: '1|1|20230101|2021|6873504|2|2021|01010000000033',
    /!*
      --신규설치,설치+철거,자사회수,자사미회수,타사회수,타사미회수,자사분리,이종간설치,
      --필터판매(방문),필터판매(자가)
      case SV_BIZ_DCLSF_CD startWith 1 then 1

      --상품취소,매출취소,무료체험,회사설치철거,택배반품
      case SV_BIZ_DCLSF_CD startWith 34 then 4

      --A/S,제품A/S,제품A/S_IOT,특별A/S,필터B/S,필터판매,전체내피교체,글라스상판교체,환경점검,
      --조리수철거,교체,제품원인,설치원인,고객원인,부품원인,제품단종,분리,자사이동_분리,재설치,
      --자사이동_재설치,위치변경,상품취소,매출취소,무료체험,회사설치철거,택배반품,전기공사(5.5K),
      --타공공사,타공복원(더원),비스포크패널교체,케어플러스,설치지원,리퍼작업,일반수리,중수리,경수리
      case SV_BIZ_DCLSF_CD startWith 3 then 3
      else 3
      |
      --1:할부,2:렌탈/리스,3:멤버십,4:회사설치,5:유지관리,6:정기배송,9:필터
      SELL_TP_CD 판매유형코드
      |
      WK_EXCN_DT 작업수행일자 yyyyMMdd
      |
      CSMR_YR  (CNTR_NO)
      |
      CSMR_CD  (CNTR_NO)
      |
      DATA_GB  (CST_SV_ASN_NO)
      |
      ORD_DT   (CST_SV_ASN_NO)
      |
      ORD_SEQ  (CST_SV_ASN_NO)
      *!/
  }, */
});
console.log(props);
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const router = useRouter();
async function onClick(num) {
  router.push({
    path: '/wmsnb-happy-call-reg-choise',
    query: {
      selectedStar: num,
      // svBizDclsfCd: props.svBizDclsfCd,
      // sellTpCd: props.sellTpCd,
      // wkExcnDt: props.wkExcnDt,
      cntrNo: props.cntrNo ? props.cntrNo : props.para.split('|')[0],
      cntrSn: props.cntrSn ? props.cntrSn : (props.para.split('|')[1] ? props.para.split('|')[1] : '1'),
      cstSvAsnNo: props.cstSvAsnNo ? props.cstSvAsnNo : props.para.split('|')[2],
    },
  });
}
</script>

<style lang="scss" scoped>
.pa20 {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  .kw-notification {
    position: absolute;
    left: 0;
    bottom: 40px;
    padding: 0 20px;
  }
}
</style>
