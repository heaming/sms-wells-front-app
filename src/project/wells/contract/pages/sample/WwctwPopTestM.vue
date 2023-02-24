<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTW
2. 프로그램 ID : WwctwPopTestM - 팝업 테스트
3. 작성자 : sc
4. 작성일 : 2023.02.20
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 팝업 테스트 화면
****************************************************************************************************
--->
<template>
  <kw-page class="kw-guide">
    <div class="kw-guide-section">
      <q-card>
        <div class="kw-guide-example">
          <kw-expansion-item>
            <template #header>
              <kw-item-section>
                <kw-item-label>
                  <span class="text-bold kw-font-pt18">WwctaContractNumberListP - 계약번호 조회(wells)</span>
                </kw-item-label>
              </kw-item-section>
            </template>
            <kw-form cols="2">
              <kw-form-row>
                <kw-form-item
                  label="param"
                  :colspan="2"
                >
                  <kw-input
                    v-model="paramWwctaContractNumberListP.param"
                    type="textarea"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-btn
                class="mr8"
                min-width="100%"
                primary
                label="OPEN POPUP"
                @click="openWwctaContractNumberListP"
              />
              <kw-form-row>
                <kw-form-item
                  label="return"
                  :colspan="2"
                >
                  <kw-input
                    v-model="paramWwctaContractNumberListP.return"
                    type="textarea"
                  />
                </kw-form-item>
              </kw-form-row>
            </kw-form>
          </kw-expansion-item>
          <kw-separator class="my20" />
          <div class="kw-guide-example">
            <kw-expansion-item>
              <template #header>
                <kw-item-section>
                  <kw-item-label>
                    <span class="text-bold kw-font-pt18">WwctaHomeCareMgtP - wells 홈케어 관리</span>
                  </kw-item-label>
                </kw-item-section>
              </template>
              <kw-form cols="2">
                <kw-form-row>
                  <kw-form-item
                    label="param"
                    :colspan="2"
                  >
                    <kw-input
                      v-model="paramWwctaHomeCareMgtP.param"
                      type="textarea"
                    />
                  </kw-form-item>
                </kw-form-row>
                <kw-btn
                  class="mr8"
                  min-width="100%"
                  primary
                  label="OPEN POPUP"
                  @click="openWwctaHomeCareMgtP"
                />
                <kw-form-row>
                  <kw-form-item
                    label="popup return"
                    :colspan="2"
                  >
                    <kw-input
                      v-model="paramWwctaHomeCareMgtP.return"
                      type="textarea"
                    />
                  </kw-form-item>
                </kw-form-row>
              </kw-form>
            </kw-expansion-item>
          </div>
          <kw-separator class="my20" />
          <div class="kw-guide-example">
            <kw-expansion-item>
              <template #header>
                <kw-item-section>
                  <kw-item-label>
                    <span class="text-bold kw-font-pt18">WwctaContractDocumentMailForwardingP - wells 계약서 메일 발송</span>
                  </kw-item-label>
                </kw-item-section>
              </template>
              <kw-form cols="2">
                <kw-form-row>
                  <kw-form-item
                    label="param"
                    :colspan="2"
                  >
                    <kw-input
                      v-model="paramWwctaContractDocumentMailForwardingP.param"
                      type="textarea"
                    />
                  </kw-form-item>
                </kw-form-row>
                <kw-btn
                  class="mr8"
                  min-width="100%"
                  primary
                  label="OPEN POPUP"
                  @click="openWwctaContractDocumentMailForwardingP"
                />
                <kw-form-row>
                  <kw-form-item
                    label="popup return"
                    :colspan="2"
                  >
                    <kw-input
                      v-model="paramWwctaContractDocumentMailForwardingP.return"
                      type="textarea"
                    />
                  </kw-form-item>
                </kw-form-row>
              </kw-form>
            </kw-expansion-item>
          </div>
        </div>
      </q-card>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useGlobal } from 'kw-lib';

const { modal } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const paramWwctaContractNumberListP = ref({
  param: '{"cntrCstKnm":"계약자","istCstKnm":"설치자","cralLocaraTno":"010","mexnoEncr":"1234","cralIdvTno":"5678","cntrCstNo":"00000"}',
  return: '',
});
async function openWwctaContractNumberListP() {
  const res = await modal({
    component: 'WwctaContractNumberListP',
    componentProps: JSON.parse(paramWwctaContractNumberListP.value.param),
  });
  paramWwctaContractNumberListP.value.return = JSON.stringify(res);
}

const paramWwctaHomeCareMgtP = ref({
  param: '{"cntrs":[{"cntrNo":"W20225866263","cntrSn":1},{"cntrNo":"W20225964208","cntrSn":1}]}',
  return: '',
});
async function openWwctaHomeCareMgtP() {
  const res = await modal({
    component: 'WwctaHomeCareMgtP',
    componentProps: JSON.parse(paramWwctaHomeCareMgtP.value.param),
  });
  paramWwctaHomeCareMgtP.value.return = JSON.stringify(res);
}

const paramWwctaContractDocumentMailForwardingP = ref({
  param: '{"cntrNm":"테스트","cntrNo":"E0000000"}',
  return: '',
});
async function openWwctaContractDocumentMailForwardingP() {
  const res = await modal({
    component: 'WwctaContractDocumentMailForwardingP',
    componentProps: JSON.parse(paramWwctaContractDocumentMailForwardingP.value.param),
  });
  paramWwctaContractDocumentMailForwardingP.value.return = JSON.stringify(res);
}

</script>
