<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtM - (판매) 상품목록 - 상세조회 ( Z-PD-U-0011M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 상세조회 프로그램
****************************************************************************************************
--->
<template>
  <kw-page>
    <div class="normal-area normal-area--button-set-bottom">
      <div class="kw-stepper-headingtext">
        <h2 class="h2-small">
          {{ pdBas.pdNm }}({{ pdBas.pdCd }})
          <p>
            <span>{{ $t('MSG_TXT_RGST_DT') }} {{ stringUtil.getDateFormat(pdBas.fstRgstDtm) }}
              /  {{ pdBas.fstRgstUsrNm }}</span><span>
              {{ $t('MSG_TXT_L_UPDATED') }} {{ stringUtil.getDateFormat(pdBas.fnlMdfcDtm) }}
              / {{ pdBas.fnlMdfcUsrNm }}</span>
          </p>
        </h2>

        <kw-tab-panels
          model-value="contents"
          class="mt20"
        >
          <kw-tab-panel name="contents">
            <kw-tabs
              v-model="selectedTab"
            >
              <kw-tab
                :name="pdConst.STANDARD_STEP_BASIC.name"
                :label="$t('MSG_TXT_BAS_ATTR_REG')"
              />
              <kw-tab
                :name="pdConst.STANDARD_STEP_REL_PROD.name"
                :label="$t('MSG_TXT_REL_PRDT_SEL')"
              />
              <kw-tab
                :name="pdConst.STANDARD_STEP_MANAGE.name"
                :label="$t('MSG_TXT_MGT_ATTR_REG')"
              />
              <kw-tab
                :name="pdConst.STANDARD_STEP_PRICE.name"
                :label="$t('MSG_TXT_PRC_INFO_REG')"
              />
            </kw-tabs>
            <kw-tab-panels
              :model-value="selectedTab"
            >
              <kw-tab-panel :name="pdConst.STANDARD_STEP_BASIC.name">
                <zwpdc-prop-groups-dtl
                  :ref="cmpStepRefs[0]"
                  v-model:pd-cd="currentPdCd"
                  v-model:init-data="initData"
                  :pd-tp-cd="pdConst.PD_TP_CD_STANDARD"
                  :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_BASIC"
                  :props-title="$t('MSG_TXT_BAS_ATTR')"
                />
              </kw-tab-panel>
              <kw-tab-panel :name="pdConst.STANDARD_STEP_REL_PROD.name">
                <wwpdc-standard-mgt-m-rel :ref="cmpStepRefs[1]" />
              </kw-tab-panel>
              <kw-tab-panel :name="pdConst.STANDARD_STEP_MANAGE.name">
                <zwpdc-prop-groups-dtl
                  :ref="cmpStepRefs[2]"
                  v-model:pd-cd="currentPdCd"
                  v-model:init-data="initData"
                  :pd-tp-cd="pdConst.PD_TP_CD_STANDARD"
                  :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_MANUAL"
                  :props-title="$t('MSG_TXT_MGT_ATTR')"
                />
              </kw-tab-panel>
              <kw-tab-panel :name="pdConst.STANDARD_STEP_PRICE.name">
                <wwpdc-standard-mgt-m-price :ref="cmpStepRefs[3]" />
              </kw-tab-panel>
            </kw-tab-panels>
          </kw-tab-panel>
        </kw-tab-panels>
        <div class="button-set--bottom">
          <div class="button-set--bottom-right">
            <kw-btn
              :label="$t('MSG_BTN_MOD')"
              class="ml8"
              primary
              @click="onClickUpdate"
            />
          </div>
        </div>
      </div>
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, stringUtil } from 'kw-lib';
import { isEmpty } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import ZwpdcPropGroupsDtl from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsDtl.vue';
import WwpdcStandardMgtMPrice from './WwpdcStandardMgtMPrice.vue';
import WwpdcStandardMgtMRel from './WwpdcStandardMgtMRel.vue';

const props = defineProps({
  pdCd: { type: String, default: null },
  tempSaveYn: { type: String, default: 'Y' },
});

const route = useRoute();
const router = useRouter();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const cmpStepRefs = ref([ref(), ref(), ref(), ref(), ref()]);
const currentPdCd = ref();
const prdPropGroups = ref({});
const pdBas = ref({});
const initData = ref({});
const selectedTab = ref(pdConst.STANDARD_STEP_BASIC.name);

async function onClickUpdate() {
  const { pdCd } = props;
  router.push({ path: '/product/wwpdc-standard-mgt', query: { pdCd, tempSaveYn: 'N' } });
}

async function fetchData() {
  const res = await dataService.get(`/sms/common/product/${currentPdCd.value}`);
  pdBas.value = res.data[pdConst.TBL_PD_BAS];
  initData.value[pdConst.TBL_PD_BAS] = res.data[pdConst.TBL_PD_BAS];
  initData.value[pdConst.TBL_PD_ECOM_PRP_DTL] = res.data[pdConst.TBL_PD_ECOM_PRP_DTL];
  prdPropGroups.value = res.data.groupCodes;
}

async function fetchProps() {
  const { pdCd } = props;
  currentPdCd.value = pdCd;
  if (isEmpty(currentPdCd.value)) {
    await router.close();
  } else {
    await fetchData();
  }
}

await fetchProps();

watch(() => route.params.pdCd, async (pdCd) => {
  if (pdCd && currentPdCd.value !== pdCd) {
    currentPdCd.value = pdCd;
    await fetchData();
  }
}, { immediate: true });

</script>
<style scoped></style>
