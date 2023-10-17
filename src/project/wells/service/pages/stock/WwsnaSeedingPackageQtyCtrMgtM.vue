<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaSeedingPackageQtyCtrMgtM(W-SV-U-0298M01) - 모종패키지 수량 조정 관리
3. 작성자 : SaeRomI.Kim
4. 작성일 : 2023.07.24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 모종패키지 수량 조정을 위해 출고일자별 현황을 조회하는 화면 (http://localhost:3000/#/service/wwsna-seeding-package-qty-ctr-mgt)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 출고일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_OSTR_DT')"
          required
        >
          <kw-date-picker
            v-model="searchParams.ostrDt"
            type="date"
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <!-- 제외수량 -->
      <h3>{{ t('MSG_TXT_EXCD') }} {{ t('MSG_TXT_QTY') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount1"
          />
          <span class="ml8">
            ({{ t('MSG_TXT_UNIT') }} : EA)
          </span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="totalCount1 === 0"
          @click="onClickExcelDownload1"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 조정수량등록 -->
        <kw-btn
          v-permission:create
          :label="`${t('MSG_TXT_CTR')}${t('MSG_TXT_QTY')}${t('MSG_TXT_RGS')}`"
          primary
          dense
          :disable="isSearch"
          @click="openPackageCtrQtyRegP"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef1"
        name="grdMain1"
        :total-count="totalCount1"
        @init="initGrdMain1"
      />
      <!-- 추가수량 -->
      <h3>{{ t('MSG_TXT_ADD') }} {{ t('MSG_TXT_QTY') }}</h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount2"
          />
          <span class="ml8">
            ({{ t('MSG_TXT_UNIT') }} : EA)
          </span>
        </template>
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="totalCount2 === 0"
          @click="onClickExcelDownload2"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 조정수량등록 -->
        <kw-btn
          v-permission:create
          :label="`${t('MSG_TXT_CTR')}${t('MSG_TXT_QTY')}${t('MSG_TXT_RGS')}`"
          primary
          dense
          :disable="isSearch"
          @click="openPackageCtrQtyRegP"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef2"
        name="grdMain2"
        :total-count="totalCount2"
        @init="initGrdMain2"
      />
    </div>
  </kw-page>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { useDataService, useGlobal, getComponentType, gridUtil, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const { modal, alert } = useGlobal();
const { currentRoute } = useRouter();

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const grdMainRef1 = ref(getComponentType('KwGrid'));
const grdMainRef2 = ref(getComponentType('KwGrid'));

let cachedParams;
const searchParams = ref({
  ostrDt: dayjs().format('YYYYMMDD'),
});

const totalCount1 = ref(0);

// 제외수량 조회
async function fetchData1() {
  const res = await dataService.get('/sms/wells/service/seeding-package-qty-ctrs/exclusion-qtys', { params: { ...cachedParams } });
  const exclustionQtys = res.data;
  totalCount1.value = res.data.length;

  if (grdMainRef1.value != null) {
    const view = grdMainRef1.value.getView();
    view.getDataSource().setRows(exclustionQtys);
    view.resetCurrent();
  }
}

const totalCount2 = ref(0);
// 추가수량 조회
async function fetchData2() {
  const res = await dataService.get('/sms/wells/service/seeding-package-qty-ctrs/addition-qtys', { params: { ...cachedParams } });
  const addtionQtys = res.data;
  totalCount2.value = res.data.length;

  if (grdMainRef2.value != null) {
    const view = grdMainRef2.value.getView();
    view.getDataSource().setRows(addtionQtys);
    view.resetCurrent();
  }
}

const isSearch = ref(true);
// 조회버튼 클릭
async function onClickSearch() {
  isSearch.value = false;
  cachedParams = cloneDeep(searchParams.value);
  await fetchData1();
  await fetchData2();
}

// 엑셀 다운로드
async function onClickExcelDownload1() {
  const view = grdMainRef1.value.getView();
  const res = await dataService.get('/sms/wells/service/seeding-package-qty-ctrs/exclusion-qtys', { params: { ...cachedParams } });

  gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName} ${t('MSG_TXT_EXCD')} ${t('MSG_TXT_QTY')}`,
    timePostfix: true,
    exportData: res.data,
  });
}

// 엑셀 다운로드
async function onClickExcelDownload2() {
  const view = grdMainRef2.value.getView();
  const res = await dataService.get('/sms/wells/service/seeding-package-qty-ctrs/addition-qtys', { params: { ...cachedParams } });

  gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName} ${t('MSG_TXT_ADD')} ${t('MSG_TXT_QTY')}`,
    timePostfix: true,
    exportData: res.data,
  });
}

// 모종패키지 조정수량 등록 팝업 호출
async function openPackageCtrQtyRegP() {
  const { ostrDt } = cachedParams;
  if (isEmpty(ostrDt)) {
    // {0}은(는) 필수 항목입니다.
    await alert(`${t('MSG_TXT_OSTR_DT')} ${t('MSG_ALT_NCELL_REQUIRED_ITEM')}`);
    return;
  }
  await modal({
    component: 'WwsnaSeedingPackageCtrQtyRegP',
    componentProps: { ...cachedParams },
  });

  await fetchData1();
  await fetchData2();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain1 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dgGgLctNm' }, // 센터
    { fieldName: 'type1', dataType: 'number' }, // 건강샐러드/주스SLIM
    { fieldName: 'type2', dataType: 'number' }, // 건강샐러드/주스WIDE
    { fieldName: 'type3', dataType: 'number' }, // 우리아이채소식단SLIM
    { fieldName: 'type4', dataType: 'number' }, // 우리아이채소식단WIDE
    { fieldName: 'type5', dataType: 'number' }, // 건강밥상SLIM
    { fieldName: 'type6', dataType: 'number' }, // 건강밥상WIDE
    { fieldName: 'type7', dataType: 'number' }, // 항암건강SLIM
    { fieldName: 'type8', dataType: 'number' }, // 항암건강WIDE
    { fieldName: 'type9', dataType: 'number' }, // 숙면힐링SLIM
    { fieldName: 'type10', dataType: 'number' }, // 숙면힐링WIDE
    { fieldName: 'type11', dataType: 'number' }, // 우리아이신선이유식SLIM
    { fieldName: 'type12', dataType: 'number' }, // 우리아이신선이유식WIDE
    { fieldName: 'type13', dataType: 'number' }, // 버터헤드SLIME
    { fieldName: 'type14', dataType: 'number' }, // 버터헤드WIDE
    { fieldName: 'type15', dataType: 'number' }, // 케일SLIM
    { fieldName: 'type16', dataType: 'number' }, // 케일WIDE
    { fieldName: 'type17', dataType: 'number' }, // 비타민다채SLIM
    { fieldName: 'type18', dataType: 'number' }, // 비타민다채WIDE
    { fieldName: 'type19', dataType: 'number' }, // 버터헤드+케일WIDE
    { fieldName: 'type20', dataType: 'number' }, // 버터헤드+비타민다채WIDE
    { fieldName: 'type21', dataType: 'number' }, // 케일+비타민다채WIDE
    { fieldName: 'type22', dataType: 'number' }, // 웰스팜미니채소
    { fieldName: 'type23', dataType: 'number' }, // 아이쑥쑥유엔젤WIDE
    { fieldName: 'type24', dataType: 'number' }, // 선택모종
    { fieldName: 'type25', dataType: 'number' }, // 먹치마_미니
    { fieldName: 'type26', dataType: 'number' }, // 여름청치마_미니
    { fieldName: 'type27', dataType: 'number' }, // 청경채_미니
    { fieldName: 'type28', dataType: 'number' }, // 먹치마+여름청치마_미니
    { fieldName: 'type29', dataType: 'number' }, // 먹치마+청경채_미니
    { fieldName: 'type30', dataType: 'number' }, // 먹치마+적소렐_미니
    { fieldName: 'type31', dataType: 'number' }, // 여름청치마+청경채_미니
    { fieldName: 'type32', dataType: 'number' }, // 여름청치마+적소렐_미니
    { fieldName: 'type33', dataType: 'number' }, // 선택모종WIDE
    { fieldName: 'type34', dataType: 'number' }, // 선택모종SLIM
    { fieldName: 'type35', dataType: 'number' }, // 유러피안샐러드SLIM
    { fieldName: 'type36', dataType: 'number' }, // 유러피안샐러드WIDE
    { fieldName: 'type37', dataType: 'number' }, // 우리가족건강채소SLIM
    { fieldName: 'type38', dataType: 'number' }, // 우리가족건강채소WIDE
    { fieldName: 'type39', dataType: 'number' }, // 모둠쌈채소WIDE
    { fieldName: 'type40', dataType: 'number' }, // 모둠쌈채소SLIM
    { fieldName: 'type41', dataType: 'number' }, // 기능성채소WIDE
    { fieldName: 'type42', dataType: 'number' }, // 기능성채소SLIM
  ];

  const columns = [
    { fieldName: 'dgGgLctNm', header: t('MSG_TXT_CENTER_DIVISION'), width: '100', styleName: 'text-left' },
    { fieldName: 'type1', header: t('MSG_TXT_HL_SALAD_JUICE_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type2', header: t('MSG_TXT_HL_SALAD_JUICE_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type3', header: t('MSG_TXT_OU_CLD_VGT_DIET_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type4', header: t('MSG_TXT_OU_CLD_VGT_DIET_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type5', header: t('MSG_TXT_HL_DINING_TBL_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type6', header: t('MSG_TXT_HL_DINING_TBL_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type7', header: t('MSG_TXT_CANCER_HL_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type8', header: t('MSG_TXT_CANCER_HL_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type9', header: t('MSG_TXT_SLEEP_HEALING_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type10', header: t('MSG_TXT_SLEEP_HEALING_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type11', header: t('MSG_TXT_OU_CLD_FRESH_FOOD_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type12', header: t('MSG_TXT_OU_CLD_FRESH_FOOD_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type22', header: t('MSG_TXT_WELSF_MINI_VGT'), width: '100', styleName: 'text-right' },
    { fieldName: 'type23', header: t('MSG_TXT_CLD_GWUP_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type24', header: t('MSG_TXT_CHO_SDING'), width: '100', styleName: 'text-right' },
    { fieldName: 'type13', header: t('MSG_TXT_BUTTER_HEAD_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type14', header: t('MSG_TXT_BUTTER_HEAD_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type15', header: t('MSG_TXT_KALE_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type16', header: t('MSG_TXT_KALE_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type17', header: t('MSG_TXT_VITAMINS_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type18', header: t('MSG_TXT_VITAMINS_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type19', header: t('MSG_TXT_BUTTER_KALE_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type20', header: t('MSG_TXT_BUTTER_HEAD_VITAMINS_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type21', header: t('MSG_TXT_KALE_VITAMINS_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type25', header: t('MSG_TXT_SATIVA_MINI'), width: '100', styleName: 'text-right' },
    { fieldName: 'type26', header: t('MSG_TXT_YUREUM_MINI'), width: '100', styleName: 'text-right' },
    { fieldName: 'type27', header: t('MSG_TXT_BOK_CHOY_MINI'), width: '100', styleName: 'text-right' },
    { fieldName: 'type28', header: t('MSG_TXT_SATIVA_YUREUM_MINI'), width: '100', styleName: 'text-right' },
    { fieldName: 'type29', header: t('MSG_TXT_SATIVA_BOK_CHOY_MINI'), width: '100', styleName: 'text-right' },
    { fieldName: 'type30', header: t('MSG_TXT_SATIVA_RED_MINI'), width: '100', styleName: 'text-right' },
    { fieldName: 'type31', header: t('MSG_TXT_YUREUM_BOK_CHOY_MINI'), width: '100', styleName: 'text-right' },
    { fieldName: 'type32', header: t('MSG_TXT_YEREUM_RED_MINI'), width: '100', styleName: 'text-right' },
    { fieldName: 'type33', header: t('MSG_TXT_CHO_SDING_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type34', header: t('MSG_TXT_CHO_SDING_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type35', header: t('MSG_TXT_EUROP_SALAD_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type36', header: t('MSG_TXT_EUROP_SALAD_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type37', header: t('MSG_TXT_OU_FML_HL_VGT_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type38', header: t('MSG_TXT_OU_FML_HL_VGT_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type40', header: t('MSG_TXT_ASSORT_WRAPS_VGT_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type39', header: t('MSG_TXT_ASSORT_WRAPS_VGT_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type42', header: t('MSG_TXT_FNC_VGT_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type41', header: t('MSG_TXT_FNC_VGT_WIDE'), width: '100', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  const headerHeight = view.header.height;
  view.header.height = headerHeight + 50;

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

const initGrdMain2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'dgGgLctNm' },
    { fieldName: 'type1', dataType: 'number' },
    { fieldName: 'type2', dataType: 'number' },
    { fieldName: 'type3', dataType: 'number' },
    { fieldName: 'type4', dataType: 'number' },
    { fieldName: 'type5', dataType: 'number' },
    { fieldName: 'type6', dataType: 'number' },
    { fieldName: 'type7', dataType: 'number' },
    { fieldName: 'type8', dataType: 'number' },
    { fieldName: 'type9', dataType: 'number' },
    { fieldName: 'type10', dataType: 'number' },
    { fieldName: 'type11', dataType: 'number' },
    { fieldName: 'type12', dataType: 'number' },
    { fieldName: 'type13', dataType: 'number' },
    { fieldName: 'type14', dataType: 'number' },
    { fieldName: 'type15', dataType: 'number' },
    { fieldName: 'type16', dataType: 'number' },
    { fieldName: 'type17', dataType: 'number' },
    { fieldName: 'type18', dataType: 'number' },
    { fieldName: 'type19', dataType: 'number' },
    { fieldName: 'type20', dataType: 'number' },
    { fieldName: 'type21', dataType: 'number' },
    { fieldName: 'type22', dataType: 'number' },
    { fieldName: 'type23', dataType: 'number' },
    { fieldName: 'type24', dataType: 'number' },
    { fieldName: 'type25', dataType: 'number' },
    { fieldName: 'type26', dataType: 'number' },
    { fieldName: 'type27', dataType: 'number' },
    { fieldName: 'type28', dataType: 'number' },
    { fieldName: 'type29', dataType: 'number' },
    { fieldName: 'type30', dataType: 'number' },
    { fieldName: 'type31', dataType: 'number' },
    { fieldName: 'type32', dataType: 'number' },
    { fieldName: 'type33', dataType: 'number' },
    { fieldName: 'type34', dataType: 'number' },
    { fieldName: 'type35', dataType: 'number' },
    { fieldName: 'type36', dataType: 'number' },
    { fieldName: 'type37', dataType: 'number' },
    { fieldName: 'type38', dataType: 'number' },
    { fieldName: 'type39', dataType: 'number' },
    { fieldName: 'type40', dataType: 'number' },
    { fieldName: 'type41', dataType: 'number' },
    { fieldName: 'type42', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'dgGgLctNm', header: t('MSG_TXT_CENTER_DIVISION'), width: '100', styleName: 'text-left' },
    { fieldName: 'type1', header: t('MSG_TXT_HL_SALAD_JUICE_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type2', header: t('MSG_TXT_HL_SALAD_JUICE_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type3', header: t('MSG_TXT_OU_CLD_VGT_DIET_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type4', header: t('MSG_TXT_OU_CLD_VGT_DIET_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type5', header: t('MSG_TXT_HL_DINING_TBL_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type6', header: t('MSG_TXT_HL_DINING_TBL_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type7', header: t('MSG_TXT_CANCER_HL_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type8', header: t('MSG_TXT_CANCER_HL_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type9', header: t('MSG_TXT_SLEEP_HEALING_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type10', header: t('MSG_TXT_SLEEP_HEALING_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type11', header: t('MSG_TXT_OU_CLD_FRESH_FOOD_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type12', header: t('MSG_TXT_OU_CLD_FRESH_FOOD_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type22', header: t('MSG_TXT_WELSF_MINI_VGT'), width: '100', styleName: 'text-right' },
    { fieldName: 'type23', header: t('MSG_TXT_CLD_GWUP_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type24', header: t('MSG_TXT_CHO_SDING'), width: '100', styleName: 'text-right' },
    { fieldName: 'type13', header: t('MSG_TXT_BUTTER_HEAD_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type14', header: t('MSG_TXT_BUTTER_HEAD_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type15', header: t('MSG_TXT_KALE_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type16', header: t('MSG_TXT_KALE_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type17', header: t('MSG_TXT_VITAMINS_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type18', header: t('MSG_TXT_VITAMINS_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type19', header: t('MSG_TXT_BUTTER_KALE_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type20', header: t('MSG_TXT_BUTTER_HEAD_VITAMINS_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type21', header: t('MSG_TXT_KALE_VITAMINS_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type25', header: t('MSG_TXT_SATIVA_MINI'), width: '100', styleName: 'text-right' },
    { fieldName: 'type26', header: t('MSG_TXT_YUREUM_MINI'), width: '100', styleName: 'text-right' },
    { fieldName: 'type27', header: t('MSG_TXT_BOK_CHOY_MINI'), width: '100', styleName: 'text-right' },
    { fieldName: 'type28', header: t('MSG_TXT_SATIVA_YUREUM_MINI'), width: '100', styleName: 'text-right' },
    { fieldName: 'type29', header: t('MSG_TXT_SATIVA_BOK_CHOY_MINI'), width: '100', styleName: 'text-right' },
    { fieldName: 'type30', header: t('MSG_TXT_SATIVA_RED_MINI'), width: '100', styleName: 'text-right' },
    { fieldName: 'type31', header: t('MSG_TXT_YUREUM_BOK_CHOY_MINI'), width: '100', styleName: 'text-right' },
    { fieldName: 'type32', header: t('MSG_TXT_YEREUM_RED_MINI'), width: '100', styleName: 'text-right' },
    { fieldName: 'type33', header: t('MSG_TXT_CHO_SDING_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type34', header: t('MSG_TXT_CHO_SDING_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type35', header: t('MSG_TXT_EUROP_SALAD_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type36', header: t('MSG_TXT_EUROP_SALAD_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type37', header: t('MSG_TXT_OU_FML_HL_VGT_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type38', header: t('MSG_TXT_OU_FML_HL_VGT_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type40', header: t('MSG_TXT_ASSORT_WRAPS_VGT_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type39', header: t('MSG_TXT_ASSORT_WRAPS_VGT_WIDE'), width: '100', styleName: 'text-right' },
    { fieldName: 'type42', header: t('MSG_TXT_FNC_VGT_SLIM'), width: '100', styleName: 'text-right' },
    { fieldName: 'type41', header: t('MSG_TXT_FNC_VGT_WIDE'), width: '100', styleName: 'text-right' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  const headerHeight = view.header.height;
  view.header.height = headerHeight + 50;

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
