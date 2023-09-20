<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaWarehouseOrganizationRegP - 창고조직 등록
 3. 작성자 : hyewon.kim
 4. 작성일 : 2023.02.27
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 창고조직 등록 (http://localhost:3000/#/service/wwsna-warehouse-organization-reg)
 ****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <kw-form
      ref="frmMainRef"
      :cols="2"
    >
      <!-- 등록일자 -->
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_FST_RGST_DT')"
        >
          <kw-date-picker
            v-model="rgstDt"
            type="date"
            :label="$t('MSG_TXT_FST_RGST_DT')"
            readonly
          />
        </kw-form-item>
        <!-- 사용유무 -->
        <kw-form-item
          :label="$t('MSG_TXT_USE_EYN')"
        >
          <kw-select
            v-model="warehouseInfo.wareUseYn"
            :options="codes.USE_YN_CD"
            :label="$t('MSG_TXT_USE_EYN')"
            :readonly="!hasProps()"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 창고구분 -->
        <kw-form-item
          :label="$t('MSG_TXT_WARE_DV')"
          required
        >
          <kw-select
            v-model="warehouseInfo.wareDvCd"
            :label="$t('MSG_TXT_WARE_DV')"
            :options="codes.WARE_DV_CD.filter((v) => v.codeId !== '1')"
            first-option="select"
            :rules="`required|one_of:${wareDvCdRule}`"
            :readonly="hasProps()"
          />
        </kw-form-item>
        <!-- 창고구분 상세 -->
        <kw-form-item
          :label="$t('MSG_TXT_WARE_DV_DTL')"
          required
        >
          <kw-select
            v-model="warehouseInfo.wareDtlDvCd"
            :label="$t('MSG_TXT_WARE_DV_DTL')"
            :options="wareDtlDvCds"
            first-option="select"
            :rules="`required|one_of:${wareDtlDvCdRule}`"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 관리자 -->
        <kw-form-item
          :label="$t('MSG_TXT_ADMIN')"
          required
        >
          <kw-input
            v-model="warehouseInfo.prtnrNo"
            :label="$t('MSG_TXT_ADMIN')"
            rules="required"
            readonly
          />
          <!-- 인사정보 -->
          <kw-input
            v-model="warehouseInfo.prtnrKnm"
            icon="search"
            :label="$t('MSG_TXT_ADMIN')"
            rules="required"
            :readonly="hasProps() && !isOrgWarehouse"
            :disable-icon="hasProps() && !isOrgWarehouse"
            @click-icon="onClickOpenHumanResourcesPopup"
          />
        </kw-form-item>
        <!-- 상위창고 -->
        <kw-form-item
          :label="$t('MSG_TXT_HGR_WARE')"
        >
          <kw-select
            v-model="warehouseInfo.hgrWareNo"
            :label="$t('MSG_TXT_HGR_WARE')"
            :options="hgrWarehouses"
            :readonly="hasProps() && warehouseInfo.wareDtlDvCd === '21'"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 소속 -->
        <kw-form-item
          :label="$t('MSG_TXT_BLG')"
        >
          <kw-input
            v-model="warehouseInfo.dgr1LevlOgCdNm"
            readonly
          />
          <kw-input
            v-model="warehouseInfo.dgr2LevlOgCdNm"
            readonly
          />
        </kw-form-item>
        <!-- 창고명 -->
        <kw-form-item
          :label="$t('MSG_TXT_WARE_NM')"
        >
          <kw-input
            v-model="warehouseInfo.wareNm"
            :label="$t('MSG_TXT_WARE_NM')"
            :readonly="(hasProps() && !['20', '30'].includes(warehouseInfo.wareDtlDvCd))
              || (!hasProps() && !['20', '21', '30'].includes(warehouseInfo.wareDtlDvCd))"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 지정주소 -->
        <kw-form-item
          :label="$t('MSG_TXT_DSN_ADR')"
          required
        >
          <!-- 주소사용여부 -->
          <kw-select
            v-model="warehouseInfo.adrUseYn"
            :label="$t('MSG_TXT_DSN_ADR')"
            :options="['Y', 'N']"
            rules="required"
            :readonly="isNotIndpWarehouse"
          />
          <!-- 빌딩코드 -->
          <kw-input
            v-model="warehouseInfo.bldCdNm"
            :label="$t('MSG_TXT_DSN_ADR')"
            readonly
            :placeholder="$t('MSG_TXT_SELT')"
          />
          <!-- 빌딩정보 -->
          <kw-btn
            v-permission:read
            :label="$t('MSG_TXT_BLD_INF')"
            :disable="isNotIndpWarehouse || warehouseInfo.adrUseYn === 'N'"
            @click="onClickOpenBuildingPopup"
          />
        </kw-form-item>
        <!-- 노출순서 -->
        <kw-form-item
          :label="$t('MSG_TXT_EXPSR_ODR')"
          :hint="$t('MSG_TXT_EXPSR_ODR_DUP_HINT')"
        >
          <kw-input
            v-model="warehouseInfo.sortDvVal"
            :label="$t('MSG_TXT_EXPSR_ODR')"
            :regex="/^[0-9]{1,5}$/i"
            :readonly="warehouseInfo.wareUseYn === 'N'"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 주소 -->
        <kw-form-item
          :label="$t('MSG_TXT_ADDR')"
          :colspan="2"
        >
          <zwcm-post-code
            v-model:addKey="warehouseInfo.wareAdrId"
            v-model:zipCode="warehouseInfo.newAdrZip"
            v-model:adrDvCd="warehouseInfo.adrDvCd"
            v-model:add1="warehouseInfo.rnadr"
            v-model:add2="warehouseInfo.rdadr"
            :label="$t('MSG_TXT_ADDR')"
            class="kw-grow"
            readonly
          />
        </kw-form-item>
      </kw-form-row>

      <kw-form-row>
        <!-- 비고사항 -->
        <kw-form-item
          :label="$t('MSG_TXT_RMK_ARTC')"
          :colspan="2"
        >
          <kw-input
            v-model="warehouseInfo.rmkCn"
            type="textarea"
            :rows="3"
            :label="$t('MSG_TXT_RMK_ARTC')"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>

    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickCancel"
      />
      <kw-btn
        v-permission:update
        primary
        :label="$t('MSG_BTN_SAVE')"
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, useDataService, useGlobal, useModal } from 'kw-lib';
import ZwcmPostCode from '~/modules/common/components/ZwcmPostCode.vue';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash-es';

const { t } = useI18n();
const { modal, notify } = useGlobal();
const { ok, cancel: onClickCancel } = useModal();
const dataService = useDataService();

const props = defineProps({
  apyYm: {
    type: String,
    default: '',
  },
  wareNo: {
    type: String,
    default: '',
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const frmMainRef = ref(getComponentType('KwForm'));

const codes = await codeUtil.getMultiCodes(
  'WARE_DV_CD',
  'WARE_DTL_DV_CD',
  'USE_YN_CD',
);

const rgstDt = dayjs().format('YYYYMMDD');

const initialWarehouseInfo = {
  apyYm: '', // 기준년월
  wareDvCd: '', // 창고구분코드
  wareDtlDvCd: '', // 창고상세구분코드
  wareNo: '', // 창고번호
  prtnrNo: '', // 관리자번호
  prtnrKnm: '', // 관리자명
  wareNm: '', // 창고명
  bldNm: '', // 빌딩명
  bldCd: '', // 빌딩코드
  bldCdNm: '', // 빌딩명(빌딩코드)
  ogTpCd: '', // 조직유형코드
  hgrWareNo: '', // 상위창고번호
  hgrWareNm: '', // 상위창고명
  sortDvVal: '', // 노출순서(정렬구분값)
  orglhgrWareNo: '', // 기존상위창고번호
  rmkCn: '', // 비고내용
  wareUseYn: 'Y', // 창고사용여부
  fstRgstDt: '', // 최초등록일
  adrUseYn: 'N', // 주소사용여부
  wareAdrId: '', // 창고주소ID
  rnadr: '', // 도로명주소
  rdadr: '', // 도로명상세주소
  newAdrZip: '', // 신주소우편번호
  ogId: '', // 조직ID
  ogCd: '', // 조직코드
  ogNm: '', // 조직명
  dgr1LevlOgCd: '', // 1차레벨조직코드
  dgr1LevlOgNm: '', // 1차레벨조직명
  dgr1LevlOgCdNm: '', // 1차레벨조직코드 + 조직명
  dgr2LevlOgCd: '', // 2차레벨조직코드
  dgr2LevlOgNm: '', // 2차레벨조직명
  dgr2LevlOgCdNm: '', // 2차레벨조직코드 + 조직명
  dgr1LevlOgId: '', // 1차레벨조직ID
  dgr2LevlOgId: '', // 2차레벨조직ID
};

const warehouseInfo = ref(initialWarehouseInfo);
const hgrWarehouses = ref([]);
const WARE_DV_SERVICE = '2';
const WARE_DV_BUSINESS = '3';
const wareDtlDvCds = ref([]);
const isNotIndpWarehouse = computed(() => warehouseInfo.value.wareDtlDvCd !== '32');
const wareDvCdRule = codes.WARE_DV_CD.filter((v) => v.codeId !== '1').map((v) => (v.codeId)).join(',');
const wareDtlDvCdRule = ref('');
const isOrgWarehouse = computed(() => warehouseInfo.value.wareDtlDvCd === '20' || warehouseInfo.value.wareDtlDvCd === '30');

function hasProps() {
  return !isEmpty(props.apyYm) && !isEmpty(props.wareNo);
}

function resetWarehouseInfo() {
  const { wareDvCd } = warehouseInfo.value;
  warehouseInfo.value = { ...initialWarehouseInfo };
  warehouseInfo.value.wareDvCd = wareDvCd;
  hgrWarehouses.value = [];
}

async function fetchHigherWarehouses() {
  const params = {
    ogId: hasProps() ? null : warehouseInfo.value.ogId,
    wareDvCd: warehouseInfo.value.wareDvCd,
    wareDtlDvCd: warehouseInfo.value.wareDtlDvCd,
  };

  const res = await dataService.get('/sms/wells/service/warehouse-organizations/high-rank-warehouses', { params });
  hgrWarehouses.value = res.data;

  if (!hasProps()) {
    if (isOrgWarehouse.value) {
      warehouseInfo.value.hgrWareNo = '100002';
    } else if (['31', '32'].includes(warehouseInfo.value.wareDtlDvCd)) {
      warehouseInfo.value.hgrWareNo = res.data?.find((v) => v.isSameOg === 'Y')?.codeId ?? '';
    } else {
      warehouseInfo.value.hgrWareNo = hgrWarehouses.value[0]?.codeId ?? '';
    }
  }
}

// 주소사용여부(지정주소) 'N'으로 변경 시 빌딩명 삭제
watch(() => warehouseInfo.value.adrUseYn, (val) => {
  if (val === 'N') {
    warehouseInfo.value.bldCdNm = '';
  }
});

// 영업센터 상위창고 변경 시 창고명 변경
watch(() => warehouseInfo.value.hgrWareNo, (val) => {
  if (!hasProps() || isEmpty(val) || warehouseInfo.value.wareDvCd !== '3') return;
  if (hgrWarehouses.value.length === 0) return;
  const { codeName } = hgrWarehouses.value.find((v) => v.codeId === val) ?? { codeName: '' };
  warehouseInfo.value.wareNm = `${codeName}(${warehouseInfo.value.prtnrKnm})`;
});

// 창고상세구분코드 변경 시 상위창고 목록 재조회
watch(() => warehouseInfo.value.wareDtlDvCd, async (val) => {
  if (!hasProps()) return;
  if (isEmpty(val)) {
    hgrWarehouses.value = [];
  } else {
    await fetchHigherWarehouses();
  }
});

watch(() => warehouseInfo.value.wareDvCd, async (val) => {
  if (!hasProps()) {
    resetWarehouseInfo();
  }

  if (val === WARE_DV_SERVICE) {
    wareDtlDvCds.value = codes.WARE_DTL_DV_CD
      .filter((v) => v.codeId.charAt(0) === WARE_DV_SERVICE)
      .map((v) => ({ codeId: v.codeId, codeName: v.codeName.split(' ')[1] }));
  } else if (val === WARE_DV_BUSINESS) {
    wareDtlDvCds.value = codes.WARE_DTL_DV_CD
      .filter((v) => v.codeId.charAt(0) === WARE_DV_BUSINESS)
      .map((v) => ({ codeId: v.codeId, codeName: v.codeName.split(' ')[1] }));
  }
  wareDtlDvCdRule.value = wareDtlDvCds.value.map((v) => (v.codeId)).join(',');
});

function validateWareDvCd() {
  if (warehouseInfo.value.wareDvCd === '') {
    notify(t('MSG_ALT_BEFORE_SELECT_IT', [t('MSG_TXT_WARE_DV')]));
    return false;
  }

  if (warehouseInfo.value.wareDtlDvCd === '') {
    notify(t('MSG_ALT_BEFORE_SELECT_IT', [t('MSG_TXT_WARE_DV_DTL')]));
    return false;
  }

  return true;
}

function getWareNm(payload) {
  let wareNm = '';
  if (isOrgWarehouse.value) {
    wareNm = `${warehouseInfo.value.bldNm}`;
  } else if (warehouseInfo.value.wareDvCd === WARE_DV_SERVICE) { // 서비스센터일 경우
    wareNm = `${payload.dgr1LevlOgNm?.split('서비스센터')[0]} (${payload.prtnrKnm})`;
  } else {
    wareNm = `${warehouseInfo.value.bldNm} (${payload.prtnrKnm})`;
  }
  return wareNm;
}

async function onClickOpenHumanResourcesPopup() {
  if (!validateWareDvCd()) return;

  let mngrDvCd = '';
  if (warehouseInfo.value.wareDvCd === WARE_DV_SERVICE) { // 서비스센터일 경우 '엔지니어'
    mngrDvCd = '2';
  } else if (warehouseInfo.value.wareDvCd === WARE_DV_BUSINESS) { // 영업센터일 경우 '매니저'
    mngrDvCd = '1';
  }

  const { result: isChanged, payload } = await modal({
    component: 'WwsndHumanResourcesListP',
    componentProps: {
      mngrDvCd,
      searchText: warehouseInfo.value.prtnrKnm,
    },
  });

  if (isChanged) {
    warehouseInfo.value.ogId = payload[0].ogId;
    warehouseInfo.value.ogCd = payload[0].ogCd;
    warehouseInfo.value.ogTpCd = payload[0].ogTpCd;
    warehouseInfo.value.prtnrNo = payload[0].prtnrNo;
    warehouseInfo.value.prtnrKnm = payload[0].prtnrKnm;
    warehouseInfo.value.dgr1LevlOgCd = payload[0].dgr1LevlOgCd;
    warehouseInfo.value.dgr1LevlOgNm = payload[0].dgr1LevlOgNm;
    warehouseInfo.value.dgr2LevlOgCd = payload[0].dgr2LevlOgCd;
    warehouseInfo.value.dgr2LevlOgNm = payload[0].dgr2LevlOgNm;
    warehouseInfo.value.dgr1LevlOgId = payload[0].dgr1LevlOgId;
    warehouseInfo.value.dgr2LevlOgId = payload[0].dgr2LevlOgId;
    warehouseInfo.value.bldNm = payload[0].bldNm ?? '';
    warehouseInfo.value.wareNm = getWareNm(payload[0]);
    warehouseInfo.value.dgr1LevlOgCdNm = payload[0].dgr1LevlOgCd ? `[${payload[0].dgr1LevlOgCd}] ${payload[0].dgr1LevlOgNm}` : '-';
    warehouseInfo.value.dgr2LevlOgCdNm = payload[0].dgr2LevlOgCd ? `[${payload[0].dgr2LevlOgCd}] ${payload[0].dgr2LevlOgNm}` : '-';

    await fetchHigherWarehouses();
  }
}

async function onClickOpenBuildingPopup() {
  const { result: isChanged, payload } = await modal({
    component: 'WsnaBuildingsListP',
    componentProps: {
      dgr1LevlOgId: warehouseInfo.value.dgr1LevlOgId,
      dgr2LevlOgId: warehouseInfo.value.dgr2LevlOgId,
    },
  });

  if (isChanged) {
    warehouseInfo.value.bldCd = payload[0].bldCd;
    warehouseInfo.value.bldCdNm = payload[0].bldCdNm;
  }
}

async function fetchData() {
  const res = await dataService.get(`/sms/wells/service/warehouse-organizations/${props.apyYm}${props.wareNo}`);

  warehouseInfo.value = res.data;
  warehouseInfo.value.orglhgrWareNo = res.data.hgrWareNo;
  warehouseInfo.value.hgrWareNo = res.data.hgrWareNo;

  await fetchHigherWarehouses();
}

async function onClickSave() {
  if (await frmMainRef.value.alertIfIsNotModified()) return;
  if (!await frmMainRef.value.validate()) return;

  if (warehouseInfo.value.apyYm === '') {
    warehouseInfo.value.apyYm = dayjs().format('YYYYMM');
  }

  await dataService.post('/sms/wells/service/warehouse-organizations', warehouseInfo.value, { timeout: 300000 });
  notify(t('MSG_ALT_SAVE_DATA'));
  ok();
}

onMounted(async () => {
  if (hasProps()) {
    await fetchData();
    await frmMainRef.value.init();
  }
});
</script>
