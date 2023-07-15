<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CMA
2. 프로그램 ID : W-SS-U-0085M01 - wells 렌탈/일시불 접수자료 업로드 관리
3. 작성자 : 박주형
4. 작성일 : 2023.07.04
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 대량 업로드 구현
****************************************************************************************************
--->
<template>
  <kw-page>
    <div class="normal-area pb30">
      <rental />

      <spay />

      <prospect-customer />

      <install-location />
    </div>
  </kw-page>
</template>
<script setup>
import Rental
  from '~sms-wells/contract/pages/ordermgmt/WwctaReceiptBulkUploadMRental.vue';
import Spay
  from '~sms-wells/contract/pages/ordermgmt/WwctaReceiptBulkUploadMSinglePayment.vue';
import ProspectCustomer
  from '~sms-wells/contract/pages/ordermgmt/WwctaReceiptBulkUploadMProspectCustomer.vue';
import InstallLocation
  from '~sms-wells/contract/pages/ordermgmt/WwctaReceiptBulkUploadMInstallLocation.vue';
</script>
