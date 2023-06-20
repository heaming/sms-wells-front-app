<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNB
 2. 프로그램 ID : WwsnbInstallationConfirmationDocumentP(W-SV-U-0165P02) - 고객 설치확인서 조회 팝업
 3. 작성자 : seungsoo.kim
 4. 작성일 : 2023.06.20
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 고객에게 설치한 제품의 설치확인서를 조회한다.
 ****************************************************************************************************
--->
<template>
  <kw-popup size="2xl">
    <div style="height: 600px;  background: #f5f5f5;">
      <kw-image
        :src="resultValue"
      />
    </div>
  </kw-popup>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { useDataService } from 'kw-lib';

const dataService = useDataService();

const props = defineProps({
  cntrNo: { type: String, default: 'W20230689998' }, // @TODO: TEMP_CODE :: 테스트를 위한 임시 default
  cntrSn: { type: [String, Number], default: '1' },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const resultValue = ref();

async function getConfirmationDocument() {
  const res = await dataService.get(`/sms/wells/service/installation-documents/${props.cntrNo}-${props.cntrSn}`);

  resultValue.value = res.data;
  console.log(resultValue.value);
}

onMounted(async () => {
  await getConfirmationDocument();
});

</script>
