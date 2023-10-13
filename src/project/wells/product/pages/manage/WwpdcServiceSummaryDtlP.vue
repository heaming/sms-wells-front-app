<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcServiceSummaryDtlP - 서비스 관리 - 서비스 요약조회 ( Z-PD-U-0042P01 )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 서비스 관리 - 서비스 요약조회
****************************************************************************************************
--->
<template>
  <kw-popup
    size="lg"
  >
    <kw-chip
      v-if="pdInfo.sellYn === 'Y'"
      :label="$t('MSG_TXT_PD_SELLING')"
      color="primary"
      outline
      class="ml0 mb8 mt0"
    />
    <h2 class="h2-small mb30">
      {{ pdInfo.pdNm }}({{ pdInfo.pdCd }})
      <p>
        <!-- 등록일 -->
        <span>{{ $t('MSG_TXT_RGST_DT') }} {{ stringUtil.getDateFormat(pdInfo.fstRgstDtm) }}
          /  {{ pdInfo.fstRgstUsrNm }}</span><span>
          <!-- 최종수정일  -->
          {{ $t('MSG_TXT_L_UPDATED') }} {{ stringUtil.getDateFormat(pdInfo.fnlMdfcDtm) }}
          / {{ pdInfo.fnlMdfcUsrNm }}</span>
      </p>
    </h2>
    <kw-form
      :cols="2"
      dense
    >
      <kw-form-row>
        <!-- 필수 서비스 여부 -->
        <kw-form-item :label="getFieldName('mndtSvYn')">
          <p>
            {{ pdInfo.mndtSvYn }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 주기단위 -->
        <kw-form-item :label="getFieldName('svPrdUnitCd')">
          <p>
            {{ getCodeName(pdInfo.svPrdUnitCd, 'SV_PRD_UNIT_CD') }}
          </p>
        </kw-form-item>
        <!-- 택배주기 -->
        <kw-form-item :label="getFieldName('pcsvPrdCd')">
          <p>
            {{ getCodeName(pdInfo.pcsvPrdCd, 'SV_VST_PRD_CD') }}
          </p>
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <!-- 방문주기 -->
        <kw-form-item :label="getFieldName('svVstPrdCd')">
          <p>
            {{ getCodeName(pdInfo.svVstPrdCd, 'SV_VST_PRD_CD') }}
          </p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, stringUtil, useModal } from 'kw-lib';
import { isEmpty } from 'lodash-es';

const props = defineProps({
  pdCd: { type: String, default: null }, // 상품코드
});

const { t } = useI18n();
const { cancel } = useModal();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const currentPdCd = ref();
const pdInfo = ref({});
const metaInfos = ref([]);
const codes = await codeUtil.getMultiCodes('COD_YN', 'SV_PRD_UNIT_CD', 'SV_VST_PRD_CD');
codes.COD_YN.map((item) => {
  item.codeName = item.codeId;
  item.changed = true;
  return item;
});

// 코드값을 코드명으로 변경
function getCodeName(codeValue, codeGroupName) {
  if (isEmpty(codeValue)) {
    return null;
  }
  return codes[codeGroupName]
    ?.find((codeItem) => codeItem.codeId === codeValue || codeItem.codeId === codeValue.toUpperCase())?.codeName;
}

// 상품메타 라벨코드값을 라벨명으로 변경
function getFieldName(colNm, defaultName) {
  const labelCd = metaInfos.value?.find((field) => field.colNm === colNm)?.uiLblCdv;
  // console.log(labelCd);
  if (labelCd) {
    return t(labelCd);
  }
  return defaultName;
}

// 데이터 불러오기
async function fetchData() {
  const res = await dataService.get(`/sms/common/product/${currentPdCd.value}`).catch(() => {
    cancel();
  });
  if (!res || !res.data) return;
  metaInfos.value = res.data?.metas;
  pdInfo.value = res.data?.product;
}

// Props 데이터 설정
async function initProps() {
  const { pdCd } = props;
  currentPdCd.value = pdCd;
  if (currentPdCd.value) {
    await fetchData();
  }
}

await initProps();

</script>
<style scoped></style>
