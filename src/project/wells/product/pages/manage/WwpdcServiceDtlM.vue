<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcServiceDtlM - 서비스 관리 - 서비스 상세조회 ( Z-PD-U-0042M01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 서비스 등록/변경 프로그램
****************************************************************************************************
--->
<template>
  <kw-page ignore-on-modified>
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
                name="attribute"
                :label="$t('MSG_TXT_BAS_ATTR')"
              />
              <kw-tab
                name="filter"
                :label="$t('MSG_TXT_PD_FILT_CHG')"
              />
              <kw-tab
                name="hist"
                :label="$t('MSG_TXT_REVS_HIST')"
              />
            </kw-tabs>
            <kw-tab-panels
              :model-value="selectedTab"
            >
              <kw-tab-panel name="attribute">
                <h3 class="mb20">
                  <!-- 기본속성 -->
                  {{ $t('MSG_TXT_BAS_ATTR') }}
                </h3>
                <zwpdc-prop-groups-dtl
                  :ref="cmpStepRefs[0]"
                  v-model:pd-cd="currentPdCd"
                  v-model:init-data="currentInitData"
                  :pd-tp-cd="pdConst.PD_TP_CD_SERVICE"
                />
              </kw-tab-panel>
              <kw-tab-panel name="filter">
                <wwpdc-service-dtl-m-filter
                  :ref="cmpStepRefs[1]"
                  v-model:pd-cd="currentPdCd"
                  v-model:init-data="currentInitData"
                />
              </kw-tab-panel>
              <kw-tab-panel name="hist">
                <zwpdc-prod-change-hist
                  :ref="cmpStepRefs[2]"
                  v-model:pd-cd="currentPdCd"
                  :pd-tp-cd="pdConst.PD_TP_CD_SERVICE"
                />
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
import { cloneDeep } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import ZwpdcPropGroupsDtl from '~sms-common/product/pages/manage/components/ZwpdcPropGroupsDtl.vue';
import ZwpdcProdChangeHist from '~sms-common/product/pages/manage/components/ZwpdcProdChangeHist.vue';
import WwpdcServiceDtlMFilter from './WwpdcServiceDtlMFilter.vue';

const props = defineProps({
  pdCd: { type: String, default: null },
});

const route = useRoute();
const router = useRouter();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const cmpStepRefs = ref([ref(), ref(), ref()]);
const currentPdCd = ref();
const prdPropGroups = ref({});
const pdBas = ref({});
const currentInitData = ref({});
const selectedTab = ref('attribute');

async function onClickUpdate() {
  const { pdCd } = props;
  router.push({ path: '/product/zwpdc-service-list/wwpdc-service-mgt', query: { pdCd, tempSaveYn: 'N', reloadYn: 'Y' } });
  // router.close();
}

async function fetchData() {
  if (currentPdCd.value) {
    const res = await dataService.get(`/sms/wells/product/services/${currentPdCd.value}`);
    pdBas.value = res.data[pdConst.TBL_PD_BAS];
    // currentInitData.value[pdConst.TBL_PD_BAS] = res.data[pdConst.TBL_PD_BAS];
    // currentInitData.value[pdConst.TBL_PD_ECOM_PRP_DTL] = res.data[pdConst.TBL_PD_ECOM_PRP_DTL];
    currentInitData.value = cloneDeep(res.data);
    prdPropGroups.value = res.data.groupCodes;
  }
}

async function initProps() {
  const { pdCd } = props;
  currentPdCd.value = pdCd;
  await fetchData();
}

await initProps();

watch(() => route.params.pdCd, async (pdCd) => {
  if (!route.path.includes('wwpdc-service-dtl')) return;
  console.log(`WwpdcServiceDtlM - watch - currentPdCd.value: ${currentPdCd.value} route.params.pdCd: ${pdCd}`);
  if (pdCd) {
    await Promise.all(cmpStepRefs.value.map(async (item) => {
      if (item.value?.resetData) await item.value?.resetData();
    }));
    currentPdCd.value = pdCd;
    selectedTab.value = 'attribute';
    await fetchData();
  }
}, { immediate: true });

watch(() => route.params.reloadYn, async (reloadYn) => {
  if (!route.path.includes('wwpdc-service-dtl')) return;
  console.log(`WwpdcServiceDtlM - watch - route.params.reloadYn: ${reloadYn}`);
  if (reloadYn && reloadYn === 'Y') {
    router.replace({ query: { pdCd: props.pdCd, tempSaveYn: props.tempSaveYn } });
    currentPdCd.value = null;
    await Promise.all(cmpStepRefs.value.map(async (item) => {
      if (item.value?.resetData) await item.value?.resetData();
    }));
    currentPdCd.value = props.pdCd;
    selectedTab.value = 'attribute';
    await fetchData();
  }
});

</script>
<style scoped></style>
