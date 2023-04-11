<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : 상품 - 상품운영관리(PDC)
2. 프로그램 ID : WwpdcMaterialDtlM - 교재/자재 상세조회 ( W-PD-U-0031M07 )
3. 작성자 : junho.bae
4. 작성일 : 2022.AA.BB
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 교재/자재 상세조회 프로그램 (Outer Frame W-PD-U-0031M07 - M10)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-observer ref="obsMainRef">
      <div class="normal-area normal-area--button-set-bottom">
        <div class="kw-stepper-headingtext">
          <h2 class="h2-small">
            {{ pdBas.pdNm }}({{ pdBas.pdCd }})
            <p>
              <span>{{ $t('MSG_TXT_RGST_DT') }} {{ stringUtil.getDateFormat(pdBas.fstRgstDtm) }}
                /  {{ pdBas.fstRgstUsrNm }}</span>
              <span>
                {{ $t('MSG_TXT_L_UPDATED') }} {{ stringUtil.getDateFormat(pdBas.fnlMdfcDtm) }}
                / {{ pdBas.fnlMdfcUsrNm }}</span>
            </p>
          </h2>

          <kw-tab-panels
            model-value="contents"
            class="mt20"
          >
            <kw-tab-panel name="contents">
              <kw-tabs v-model="selectedTab">
                <!-- 기준속성 -->
                <kw-tab
                  name="attribute"
                  :label="$t('MSG_TXT_BAS_ATTR')"
                />
                <!-- 연결상품 (Wells 특화) -->
                <kw-tab
                  name="relation"
                  :label="t('MSG_TXT_REL_PRDT')"
                />
                <!-- 확장속성 -->
                <kw-tab
                  name="attributeExtr"
                  :label="$t('MSG_TXT_MGT_ATTR')"
                />
                <!-- 변경이력 -->
                <kw-tab
                  name="hist"
                  :label="$t('MSG_TXT_REVS_HIST')"
                />
              </kw-tabs>
              <!-- Tab panels Start -->
              <kw-tab-panels :model-value="selectedTab">
                <!-- 기준속성 -->
                <kw-tab-panel name="attribute">
                  <zwpdc-prop-groups-dtl
                    v-model:pd-cd="currentPdCd"
                    v-model:pd-group-cd="prdPropGroups"
                    v-model:init-data="prevStepData"
                    :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
                    :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_BASIC"
                    :is-first-title="true"
                    :pd-tp-dtl-cd="pdTpDtlCd"
                  />
                </kw-tab-panel>
                <!-- 연결상품 (Wells 특화) -->
                <kw-tab-panel
                  name="relation"
                >
                  <wwpdc-prop-relation-dtl
                    v-model:pd-cd="currentPdCd"
                    v-model:init-data="prevStepData"
                    :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
                  />
                </kw-tab-panel>
                <!-- 확장속성 -->
                <kw-tab-panel name="attributeExtr">
                  <zwpdc-prop-groups-dtl
                    v-model:pd-cd="currentPdCd"
                    v-model:pd-group-cd="prdPropGroups"
                    v-model:init-data="prevStepData"
                    :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
                    :pd-grp-dv-cd="pdConst.PD_PRP_GRP_DV_CD_MANUAL"
                    :is-first-title="true"
                  />
                </kw-tab-panel>
                <!-- 변경이력 -->
                <kw-tab-panel name="hist">
                  <zwpdc-prod-change-hist
                    v-model:pd-cd="currentPdCd"
                    :pd-tp-cd="pdConst.PD_TP_CD_MATERIAL"
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
                @click="onClickModify"
              />
            </div>
          </div>
        </div>
      </div>
    </kw-observer>
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
import ZwpdcProdChangeHist from '~sms-common/product/pages/manage/components/ZwpdcProdChangeHist.vue';
import WwpdcPropRelationDtl from './WwpdcPropRelationDtlM.vue';

const props = defineProps({
  pdCd: { type: String, default: null },
  tempSaveYn: { type: String, default: 'Y' },
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const baseUrl = '/sms/wells/product/materials';
const materialMainPage = '/product/zwpdc-material-list';
const page = ref({
  modify: '/product/zwpdc-material-list/wwpdc-material-mgt', // 등록/수정 UI
});

const pdTpDtlCd = ref(pdConst.PD_TP_DTL_CD_MATERIAL);
const prdPropGroups = ref({});
const selectedTab = ref('attribute');

const pdBas = ref({});
const prevStepData = ref({});
const currentPdCd = ref();
const obsMainRef = ref();

async function onClickModify() {
  obsMainRef.value.init();
  const { pdCd, tempSaveYn } = props;
  await router.close(0, true);
  await router.push({ path: page.value.modify, replace: true, query: { pdCd, tempSaveYn } });
}

async function fetchData(forcePdCd) {
  const { pdCd } = props;
  currentPdCd.value = isEmpty(forcePdCd) ? pdCd : forcePdCd;
  const res = await dataService.get(`${baseUrl}/${currentPdCd.value}`);

  pdBas.value = res.data[pdConst.TBL_PD_BAS];
  prevStepData.value[pdConst.TBL_PD_BAS] = res.data[pdConst.TBL_PD_BAS];
  prevStepData.value[pdConst.TBL_PD_DTL] = res.data[pdConst.TBL_PD_DTL];
  prevStepData.value[pdConst.TBL_PD_ECOM_PRP_DTL] = res.data[pdConst.TBL_PD_ECOM_PRP_DTL];
  prevStepData.value[pdConst.TBL_PD_REL] = res.data[pdConst.TBL_PD_REL];
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

watch(() => route.query, async (query) => {
  if (currentPdCd.value && currentPdCd.value !== query.pdCd) {
    currentPdCd.value = query.pdCd;
    await fetchData(query.pdCd);
  }
}, { immediate: true });

watch(() => route.query, async (query) => {
  if (isEmpty(query)) {
    /*
      #1. (관리) => 상세 => 수정 => 저장
      #2. (관리) => 상세 => 수정 => 취소
      상기 경우 관리(*ListM) 화면으로 Forward
    */
    await router.close(0, true);
    await router.push({ path: materialMainPage, query: { isSearch: true } });
  }
}, { immediate: true });

onMounted(async () => {
  await fetchProps();
});

</script>
<style scoped></style>
