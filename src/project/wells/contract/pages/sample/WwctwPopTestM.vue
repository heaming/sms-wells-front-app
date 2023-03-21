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
          <template
            v-for="(pop, i) of pops"
            :key="i"
          >
            <kw-expansion-item>
              <template #header>
                <kw-item-section>
                  <kw-item-label>
                    <span class="text-bold kw-font-pt18">{{ pop.pname }} - {{ pop.title }}</span>
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
                      v-model="popInfo[pop.pname].prm"
                      type="textarea"
                    />
                  </kw-form-item>
                </kw-form-row>
                <kw-btn
                  class="mr8"
                  min-width="100%"
                  primary
                  label="OPEN POPUP"
                  @click="openPop(pop.pname)"
                />
                <kw-form-row>
                  <kw-form-item
                    label="return"
                    :colspan="2"
                  >
                    <kw-input
                      type="textarea"
                      :model-value="popInfo[pop.pname].rtn"
                    />
                  </kw-form-item>
                </kw-form-row>
              </kw-form>
            </kw-expansion-item>
            <kw-separator class="my20" />
          </template>
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
const pops = [
  {
    pname: 'WwctaContractNumberListP',
    title: '계약번호 조회(wells)',
    param: {
      cntrCstKnm: '계약자',
      istCstKnm: '설치자',
      cralLocaraTno: '010',
      mexnoEncr: '1234',
      cralIdvTno: '5678',
      cntrCstNo: '00000',
    },
  },
  {
    pname: 'WwctaHomeCareMgtP',
    title: 'wells 홈케어 관리',
    param: {
      cntrs: [
        {
          cntrNo: 'W20225866263',
          cntrSn: 1,
        },
        {
          cntrNo: 'W20225964208',
          cntrSn: 1,
        },
      ],
    },
  },
  {
    pname: 'WwctaContractDocumentMailForwardingP',
    title: 'wells 계약서 메일 발송',
    param: {
      cntrNm: 'TEST',
      cntrNo: 'E12345678900',
    },
  },
  {
    pname: 'WwctaRestipulationTargetCstListP',
    title: '재약정 대상고객 조회 W-SS-U-0022P01',
    param: {
      cntrNo: '',
    },
  },
  {
    pname: 'WwctaBelongPartnerChoiceListP',
    title: '소속 파트너 선택 W-SS-U-0022P02',
    param: {
      cntrNo: '',
    },
  },
  {
    pname: 'WwctaOnePlusOneContractListP',
    title: '1+1 대상계약 조회 W-SS-U-0022P04',
    param: {
      cntrNo: '',
    },
  },
  {
    pname: 'WwctaCapsuleSeedingMgtP',
    title: '캡슐/모종 선택 팝업 W-SS-U-0022P05',
    param: {
      cntrNo: '',
    },
  },
];

const popInfo = ref({});
pops.forEach((pop) => {
  popInfo.value[pop.pname] = {
    prm: JSON.stringify(pop.param),
    rtn: '',
  };
});

async function openPop(pname) {
  popInfo.value[pname].rtn = JSON.stringify(await modal({
    component: pname,
    componentProps: JSON.parse(popInfo.value[pname].prm),
  }));
}
</script>
