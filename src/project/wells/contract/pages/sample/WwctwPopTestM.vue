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
                  :label="$t('MSG_TXT_CNTOR_NM')"
                >
                  <kw-input
                    v-model="paramWwctaContractNumberListP.cntrCstKnm"
                  />
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_IST_NM')"
                >
                  <kw-input
                    v-model="paramWwctaContractNumberListP.istCstKnm"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_MPNO')"
                >
                  <zwcm-telephone-number
                    v-model:tel-no1="paramWwctaContractNumberListP.cralLocaraTno"
                    v-model:tel-no2="paramWwctaContractNumberListP.mexnoEncr"
                    v-model:tel-no3="paramWwctaContractNumberListP.cralIdvTno"
                  />
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_CST_NO')"
                >
                  <kw-input
                    v-model="paramWwctaContractNumberListP.cntrCstNo"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-separator class="my20" />
              <kw-btn
                class="mr8"
                min-width="100%"
                primary
                label="OPEN POPUP"
                @click="openWwctaContractNumberListP"
              />
              <kw-form-row>
                <kw-form-item
                  label="popup return"
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
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';

const { modal } = useGlobal();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const paramWwctaContractNumberListP = ref({
  cntrCstKnm: '',
  istCstKnm: '',
  cralLocaraTno: '',
  mexnoEncr: '',
  cralIdvTno: '',
  cntrCstNo: '',
  return: '',
});

async function openWwctaContractNumberListP() {
  const res = await modal({
    component: 'WwctaContractNumberListP',
    componentProps: paramWwctaContractNumberListP.value,
  });
  paramWwctaContractNumberListP.value.return = JSON.stringify(res);
}

</script>
