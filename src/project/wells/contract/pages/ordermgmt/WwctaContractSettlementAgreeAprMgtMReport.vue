<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : fragment
3. 작성자 : SAVEMEGOAT
4. 작성일 : 2023-06-12
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- oz 리포트 조회 아마 지우지 않을까?
****************************************************************************************************
--->
<template>
  <wwcta-contract-settlement-agree-item
    :title="'계약서 확인'"
    default-opened
    hide-expand-icon
  >
    <template #title>
      <kw-btn
        class="fit"
        :label="'계약서 확인'"
        @click="openCntrOZReport"
      />
    </template>
  </wwcta-contract-settlement-agree-item>
</template>

<script setup>
import WwctaContractSettlementAgreeItem
  from '~sms-wells/contract/components/ordermgmt/WwctaContractSettlementAgreeItem.vue';
import { warn } from 'vue';
import { openReportPopupWithOptions } from '~common/utils/cmPopupUtil';
import { useDataService } from 'kw-lib';

const props = defineProps({
  cntrNo: { type: String, required: true },
});

const dataService = useDataService();

async function openCntrOZReport() {
  const { data: reports } = await dataService.get('/sms/wells/contract/report/contract', { params: { cntrNo: props.cntrNo } });
  if (!reports?.length) {
    warn('계약서가 없는데?');
    return;
  }
  const firstReport = reports.shift();
  const options = {
    treeViewTitle: props.cntrNo,
    displayName: firstReport.displayName,
  };
  if (reports.length) {
    options.children = reports;
  }
  return openReportPopupWithOptions(
    firstReport.ozrPath,
    '',
    firstReport.args,
    options,
  );
}
</script>
