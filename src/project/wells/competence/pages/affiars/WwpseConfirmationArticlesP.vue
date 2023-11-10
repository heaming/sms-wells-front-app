<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PSG
2. 프로그램 ID : WwpseConfirmationArticlesP - 총무전자업무요청 팝업 (K-W-GM-U-0024P01)
3. 작성자 : jungsu.kim
4. 작성일 : 2023.05.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
총무전자업무요청 팝업 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--lg"
    title="확인사항"
  >
    <h4 class="kw-notification-title">
      명찰신청
    </h4>
    <!-- 1st depth list -->
    <ul class="kw-notification">
      <li class="mb10">
        명찰/명패 재발급 요청 시 접수바랍니다. (사원증)

        <!-- 2nd depth list -->
        <ul>
          <li>수석플래너, 지점장, 지역단장, 사업단장, 총괄단장 명찰신청</li>
          <li>사업장 신규 승진자 명찰은 매월 말일 명단 확인 후 발행됩니다. (별도신청 無)</li>
        </ul>
      </li>
      <li>※ Wells매니저 은색/금색 명찰 재발급의 경우, [게시판-양식함-Wells영업지원팀] 에서 신청서 작성 후 업체에 메일발송 바랍니다.</li>
    </ul>
    <kw-separator />
    <h4 class="kw-notification-title">
      냉난방기 AS요청
    </h4>
    <!-- 1st depth list -->
    <ul class="kw-notification">
      <li>냉난방기 AS는 협력업체인 ㈜멜레아를 통해 진행하고 있습니다. 고장증상과 모델명(평형) 실외기 위치를 상세히 기재바랍니다.</li>
    </ul>
    <kw-separator />
    <h4 class="kw-notification-title">
      노후PC 발주요청
    </h4>
    <!-- 1st depth list -->
    <ul class="kw-notification">
      <li>제조년월 4년 경과 시 교체 가능합니다.</li>
      <li>※ 지점장PC 발주 관련해서는 사전 협의 후 접수바랍니다.</li>
      <li>PC관리번호(주황색스티커) , QR라벨번호(KW00,,,) 10자리 必 기재</li>
    </ul>
    <kw-separator />
    <h4 class="kw-notification-title">
      집기 신청/반납 요청서
    </h4>
    <!-- 1st depth list -->
    <ul class="kw-notification">
      <li>전 사업장 대상 집기 신청/반납은 수시로 진행합니다.</li>
      <li>(지점장 집기반납의 경우, 1세트 기준으로 진행바랍니다.)</li>
      <li>요청사항에 관한 결과는 요청 후 처리 내역 반드시 확인 바랍니다. (완료 또는 반송 확인)</li>
    </ul>
    <kw-separator />
    <h4 class="kw-notification-title">
      소방, 수도, 전기 공사요청
    </h4>
    <!-- 1st depth list -->
    <ul class="kw-notification">
      <li>소방, 수도, 전기 공사 관련하여 사전 협의된 내용만 접수바랍니다.</li>
      <li>1.공사 협의 완료 후 보고서, 견적서, 사업자등록증, 통장사본 반드시 첨부 (소방공사의 경우 ʻ지적서ʻ 必)</li>
      <li>2.공사 진행 후 세금계산서는 담당자 메일로 발행바랍니다. (je.kim@kyowon.co.kr)</li>
    </ul>
    <kw-separator />
    <h4 class="kw-notification-title">
      PC매각금액 입금확인요청
    </h4>
    <!-- 1st depth list -->
    <ul class="kw-notification">
      <li>CRM PC 매각 처리를 위해 입금 하신 후 요청서 작성바랍니다.</li>
      <li>(정확한 자산관리에 필요한 항목 1. 에셋라벨번호, 2. PC관리번호 꼭 기재바랍니다.)</li>
    </ul>
    <kw-separator />
    <h4 class="kw-notification-title">
      집기비품 구매승인요청(법인카드)
    </h4>
    <!-- 1st depth list -->
    <ul class="kw-notification">
      <li>해당 요청사항에 관한 결과는 요청 후 처리 내역 반드시 확인 바랍니다. (완료 또는 반송 여부확인)</li>
    </ul>
    <kw-separator />
    <kw-form
      one-row
      :cols="1"
    >
      <kw-form-row
        class="float-right"
      >
        <kw-form-item
          no-label
        >
          <kw-option-group
            :model-value="[]"
            type="checkbox"
            :options="['오늘 하루 열지 않음']"
            @change="onClickClose"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useModal } from 'kw-lib';

const { ok } = useModal();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
function setCookie(name, value, expiredays) {
  const today = new Date();

  console.log(today.getDate());

  today.setDate(today.getDate() + expiredays); // 현재시간에 하루를 더함

  document.cookie = `${name}=${escape(value)}; expires=${today.toGMTString()}`;
}

async function onClickClose() {
  setCookie('popupOpenYn', true, 1);

  ok();
}

</script>
